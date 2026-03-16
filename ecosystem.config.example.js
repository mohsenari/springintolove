// Alternative: Setting environment variables directly in ecosystem config
// This is useful if you prefer not to use .env files in production

module.exports = {
  apps: [{
    name: "springintolove",
    script: "server/index.js",
    cwd: "/path/to/springintolove", // Update this to your actual project path
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "development",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000,
      GCS_BUCKET_NAME: "springintolove-wedding-photos",
      GCS_FOLDER_PREFIX: "uploads/",
      MAILGUN_API_KEY: "your-mailgun-api-key-here"
      // Add other env vars here
    }
  }]
};
