module.exports = {
  apps: [
    {
      name: 'whatsapp-bot',
      script: 'src/index.js',
      cwd: '/home/kenny/Documents/projeto-chat',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: './logs/bot-error.log',
      out_file: './logs/bot-out.log',
      log_file: './logs/bot-combined.log',
      time: true
    },
    {
      name: 'whatsapp-admin',
      script: 'server.js',
      cwd: '/home/kenny/Documents/projeto-chat/whatsapp-bot-admin',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '../logs/admin-error.log',
      out_file: '../logs/admin-out.log',
      log_file: '../logs/admin-combined.log',
      time: true
    }
  ]
}; 