module.exports = {
  apps: [{
    name: "springintolove",
    script: "server/index.js",
    cwd: "/home/m_ansari387/springintolove", // Update this to your actual project path on VM
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
      PORT: 3000
    }
  }]
};