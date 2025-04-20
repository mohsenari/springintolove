# Wedding Website

A beautiful wedding website with a React frontend and Node.js backend. The site features a "Spring into Love" theme with a home section displaying wedding details and a "Save the Date" section for collecting guest emails.

## Features

- Responsive design with spring-themed colors (gold, white, pink, and black)
- Smooth scroll navigation between sections
- "Save the Date" form with name and email collection
- Backend API to store guest information in a SQLite database

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/wedding-website.git
   cd wedding-website
   ```

2. Install dependencies
   ```
   npm install
   ```

## Development

To run the application in development mode with hot reloading:

```
npm run dev
```

This will start both the webpack dev server for the frontend and the Node.js server for the backend concurrently.

## Building for Production

To build the application for production:

```
npm run build
```

This will create a `dist` folder with the compiled frontend assets.

## Running in Production

After building the application, you can start the production server:

```
npm start
```

The server will run on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Deployment on AWS EC2

### Setting up an EC2 Instance

1. Create an AWS account if you don't already have one
2. Launch a new EC2 instance (Amazon Linux 2 AMI recommended)
3. Configure security groups to allow HTTP (port 80), HTTPS (port 443), and SSH (port 22) traffic
4. Create and download a key pair for SSH access

### Connecting to Your EC2 Instance

```
chmod 400 your-key-pair.pem
ssh -i your-key-pair.pem ec2-user@your-instance-public-dns
```

### Installing Dependencies

```
sudo yum update -y
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs git
```

### Deploying the Application

1. Clone the repository
   ```
   git clone https://github.com/your-username/wedding-website.git
   cd wedding-website
   ```

2. Install dependencies and build the application
   ```
   npm install
   npm run build
   ```

3. Set up a process manager (PM2) to keep the app running
   ```
   sudo npm install -g pm2
   pm2 start server/index.js --name wedding-app
   pm2 startup
   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
   pm2 save
   ```

4. Set up Nginx as a reverse proxy (optional but recommended)
   ```
   sudo amazon-linux-extras install nginx1 -y
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

5. Configure Nginx
   ```
   sudo nano /etc/nginx/conf.d/wedding.conf
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. Test Nginx configuration and restart
   ```
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. Set up a domain name (optional)
   - Register a domain name with a DNS provider
   - Point the domain to your EC2 instance's public IP address
   - Consider setting up SSL/TLS with Let's Encrypt for HTTPS

## Deployment on Google Cloud Platform (GCP)

### Setting up a Compute Engine VM Instance

1. Create a Google Cloud account if you don't already have one
2. Create a new project in the Google Cloud Console
3. Navigate to Compute Engine > VM Instances
4. Click "Create Instance"
5. Configure your instance:
   - Choose a name for your instance
   - Select a region and zone close to your target audience
   - Choose machine type (e2-small is sufficient for a starter website)
   - Change the boot disk to "Debian" or "Ubuntu" (recommended)
   - Check "Allow HTTP traffic" and "Allow HTTPS traffic" in the Firewall section
6. Click "Create"

### Connecting to Your VM Instance

You can connect directly from the GCP Console by clicking the "SSH" button next to your instance, or use the gcloud command:

```
gcloud compute ssh --project=your-project-id --zone=your-zone your-instance-name
```

### Installing Dependencies

```
sudo apt-get update
sudo apt-get install -y curl git
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Deploying the Application

1. Clone the repository
   ```
   git clone https://github.com/your-username/wedding-website.git
   cd wedding-website
   ```

2. Install dependencies and build the application
   ```
   npm install
   npm run build
   ```

3. Set up a process manager (PM2) to keep the app running
   ```
   sudo npm install -g pm2
   pm2 start server/index.js --name wedding-app
   pm2 startup
   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp $HOME
   pm2 save
   ```

4. Set up Nginx as a reverse proxy
   ```
   sudo apt-get install -y nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

5. Configure Nginx
   ```
   sudo nano /etc/nginx/sites-available/wedding
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. Enable the site and restart Nginx
   ```
   sudo ln -s /etc/nginx/sites-available/wedding /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. Set up a domain name and SSL (optional)
   - Register a domain name if you don't have one
   - Set up DNS records to point to your VM's external IP address
   - Install Certbot for free SSL certificates:
     ```
     sudo apt-get install -y certbot python3-certbot-nginx
     sudo certbot --nginx -d your-domain.com -d www.your-domain.com
     ```

### Setting up a Firewall Rule (if needed)

If you need to explicitly open port 80 and 443:

1. Navigate to VPC Network > Firewall in the GCP Console
2. Click "Create Firewall Rule"
3. Configure:
   - Name: allow-http-https
   - Target tags: http-server,https-server
   - Source IP ranges: 0.0.0.0/0
   - Specified protocols and ports: tcp:80,443
4. Click "Create"
5. Make sure your VM has the network tags "http-server" and "https-server"

## License

MIT
