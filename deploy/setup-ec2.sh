#!/bin/bash

echo "🚀 Configuration de l'instance EC2 pour Task Manager..."

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer Nginx
sudo apt install nginx -y

# Installer PM2
sudo npm install -g pm2

# Cloner l'application (remplacez par votre repo)
cd /home/ubuntu
git clone https://github.com/liliaouldhocine/a25-aws-ec2-test.git
cd a25-aws-ec2-test

# Installer les dépendances
npm run install-all

# Build le frontend
npm run build

# Configurer Nginx
sudo cat > /etc/nginx/sites-available/task-app << EOF
server {
    listen 80;
    server_name _;

    # Servir le frontend React
    location / {
        root /home/ubuntu/task-app-aws/client/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy pour l'API backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/task-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Démarrer le backend avec PM2
cd server
pm2 start server.js --name "task-backend"
pm2 startup
pm2 save

echo "✅ Installation terminée!"
echo "🌐 L'application est accessible sur: http://ec2-16-52-32-133.ca-central-1.compute.amazonaws.com"