const express = require('express');
const Mailgun = require('mailgun.js');
var FormData = require('form-data');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const fsPromises = require('fs').promises;
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Cloud Storage
const gcsStorage = new Storage(); // Uses Application Default Credentials
const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = bucketName ? gcsStorage.bucket(bucketName) : null;

// Upload session tracking for batched email notifications
let uploadSession = {
  files: [],
  timer: null,
  debounceMs: 30000 // 30 seconds - wait this long after last upload before sending email
};

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'rsvp.db'), (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Create table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        guests INTEGER NOT NULL,
        email TEXT NOT NULL,
        attending TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        } else {
          console.log('Guests table created or already exists.');
        }
      }
    );
  }
});

app.use(express.static('public'))

// API Endpoints
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Async function to upload file to GCS and delete local copy
async function uploadToGCSAndCleanup(localPath, filename) {
  try {
    if (!bucket) {
      throw new Error('GCS bucket not configured. Set GCS_BUCKET_NAME in environment.');
    }

    const folderPrefix = process.env.GCS_FOLDER_PREFIX || 'uploads/';
    const destination = `${folderPrefix}${filename}`;

    // Upload to GCS
    await bucket.upload(localPath, {
      destination: destination,
      metadata: {
        contentType: 'image/*', // Preserve content type
        cacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
    });

    console.log(`Successfully uploaded ${filename} to GCS bucket ${bucketName}`);

    // Delete local file after successful upload
    await fsPromises.unlink(localPath);
    console.log(`Deleted local file: ${localPath}`);

  } catch (error) {
    // Log error but don't throw - best effort approach
    const errorLog = `[${new Date().toISOString()}] Failed to upload ${filename}: ${error.message}\n`;
    await fsPromises.appendFile(
      path.join(__dirname, 'upload-errors.log'),
      errorLog
    ).catch(err => console.error('Failed to write error log:', err));

    console.error(`Error uploading ${filename} to GCS:`, error);
  }
}

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    // Respond immediately to user
    res.status(200).json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });

    // Upload to GCS and cleanup in background (don't await)
    uploadToGCSAndCleanup(req.file.path, req.file.filename);

    // Add to upload session for batched email notification
    addToUploadSession(fileInfo);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Handle client-side routing - must be after API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// Add file to upload session and manage debounced email notification
function addToUploadSession(fileInfo) {
  // Add file to session
  uploadSession.files.push(fileInfo);

  // Clear existing timer
  if (uploadSession.timer) {
    clearTimeout(uploadSession.timer);
  }

  // Set new timer - send email after debounce period with no new uploads
  uploadSession.timer = setTimeout(() => {
    sendBatchedUploadNotification();
  }, uploadSession.debounceMs);

  console.log(`Added ${fileInfo.originalName} to upload session. Total files: ${uploadSession.files.length}`);
}

// Send batched photo upload notification email
async function sendBatchedUploadNotification() {
  // Only send email if Mailgun is configured
  if (!process.env.MAILGUN_API_KEY) {
    console.log('Mailgun not configured, skipping photo upload notification');
    uploadSession.files = [];
    return;
  }

  if (uploadSession.files.length === 0) {
    return;
  }

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });

  const fileCount = uploadSession.files.length;
  const totalSizeMB = uploadSession.files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;

  // Build file list for email
  const fileList = uploadSession.files.map((f, index) =>
    `${index + 1}. ${f.originalName} (${(f.size / 1024 / 1024).toFixed(2)} MB)`
  ).join('\n');

  try {
    const data = await mg.messages.create("mohsenansari.com", {
      from: "Springintolove Notifications <postmaster@mohsenansari.com>",
      to: ["Mohsen Ansari <mohsen@mailbox.org>", "emilylizsmith005@gmail.com"],
      subject: `${fileCount} new wedding ${fileCount === 1 ? 'photo' : 'photos'} uploaded! 📸`,
      text: `
${fileCount} ${fileCount === 1 ? 'photo has' : 'photos have'} been uploaded to your wedding website!

Total size: ${totalSizeMB.toFixed(2)} MB

Photos uploaded:
${fileList}

View all photos in your Google Cloud Storage bucket: springintolove-wedding-photos/uploads/
`,
    });

    console.log(`Batched upload notification sent for ${fileCount} files:`, data);
  } catch (error) {
    console.log('Error sending batched upload notification:', error);
  } finally {
    // Clear the session
    uploadSession.files = [];
    uploadSession.timer = null;
  }
}