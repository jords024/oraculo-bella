// pm2: mantém o dashboard no ar e reinicia se cair.
//   cd /app/backend && pm2 start ecosystem.config.cjs && pm2 save
// O PATH abaixo faz o "python3" chamado pelo Node ser o do ambiente virtual (.venv),
// onde ficam Pillow, openai etc. Ajuste APP_DIR se instalar em outra pasta.
const path = require('path');
const APP_DIR = __dirname;

module.exports = {
  apps: [
    {
      name: 'oraculo-dashboard',
      cwd: APP_DIR,
      script: 'dashboard/server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      max_memory_restart: '1500M',
      env: {
        NODE_ENV: 'production',
        PATH: `${path.join(APP_DIR, '.venv', 'bin')}:${process.env.PATH}`,
      },
    },
  ],
};
