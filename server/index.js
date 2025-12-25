const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

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

app.post('/api/email', (req, res) => {
  const { name, email, guests, attending } = req.body;
  console.log(req.body);
  // Validate input
  if (!name || !email || !guests || !attending) {
    return res.status(400).json({ error: 'all fields are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Insert into database
  const sql = 'INSERT INTO guests (name, email, guests, attending) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, email, guests, attending], function (err) {
    if (err) {
      // Check for unique constraint violation
      // if (err.message.includes('UNIQUE constraint failed')) {
      //   return res.status(409).json({ error: 'This email is already registered' });
      // }
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to save your information' });
    }

    res.status(201).json({
      message: 'Successfully saved!',
      id: this.lastID
    });
  });
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
