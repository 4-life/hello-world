#!/bin/bash

# Script Vars
DOMAIN_NAME="hello-world.website"
EMAIL="admin@hello-world.website"
APP_DIR=/home/deploy/app
SWAP_SIZE="1G"
REPO_URL="https://github.com/4-life/hello-world.git"
SSH_USER=${SSH_USER:-myuser}
SSH_PORT=${SSH_PORT:-22}

# Update package list and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# Add Swap Space
if [ ! -f /swapfile ]; then
  echo "Adding swap space..."
  sudo fallocate -l $SWAP_SIZE /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Create dedicated deploy user with SSH key for CI/CD
if ! id "$SSH_USER" &>/dev/null; then
  sudo useradd -m -s /bin/bash "$SSH_USER"
fi

sudo usermod -aG docker "$SSH_USER"
echo "$SSH_USER ALL=(ALL) NOPASSWD: /usr/bin/docker" | sudo tee /etc/sudoers.d/${SSH_USER}-docker > /dev/null

sudo mkdir -p /home/$SSH_USER/.ssh
sudo chmod 700 /home/$SSH_USER/.ssh

sudo ssh-keygen -t ed25519 -f /home/$SSH_USER/.ssh/id_ed25519 -N "" -C "deploy@$DOMAIN_NAME"
sudo cat /home/$SSH_USER/.ssh/id_ed25519.pub | sudo tee /home/$SSH_USER/.ssh/authorized_keys
sudo chmod 600 /home/$SSH_USER/.ssh/authorized_keys
sudo chown -R $SSH_USER:$SSH_USER /home/$SSH_USER/.ssh

# Allow deploy user to run docker without sudo (already via group)
# and to write to app directory
sudo mkdir -p $APP_DIR
sudo chown $SSH_USER:$SSH_USER $APP_DIR

# Open 80 port for HTTP and 443 port for HTTPS
sudo apt install ufw -y
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow $SSH_PORT/tcp
sudo ufw allow ssh
sudo ufw --force enable

# Install Docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
sudo apt update
sudo apt install docker-ce -y

# Install Docker Compose
sudo rm -f /usr/local/bin/docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Wait for the file to be fully downloaded before proceeding
if [ ! -f /usr/local/bin/docker-compose ]; then
  echo "Docker Compose download failed. Exiting."
  exit 1
fi

sudo chmod +x /usr/local/bin/docker-compose

# Ensure Docker Compose is executable and in path
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify Docker Compose installation
docker-compose --version
if [ $? -ne 0 ]; then
  echo "Docker Compose installation failed. Exiting."
  exit 1
fi

# Ensure Docker starts on boot and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Clone the Git repository as deploy user
if [ -d "$APP_DIR" ]; then
  echo "Directory $APP_DIR already exists. Pulling latest changes..."
  sudo -u $SSH_USER git -C $APP_DIR pull
else
  echo "Cloning repository from $REPO_URL..."
  sudo -u $SSH_USER git clone $REPO_URL $APP_DIR
fi

# Install Nginx
sudo apt install nginx -y

# Install Certbot nginx plugin (creates options-ssl-nginx.conf)
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot certonly --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL

if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
  sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Remove old Nginx config (if it exists)
sudo rm -f /etc/nginx/sites-available/myapp
sudo rm -f /etc/nginx/sites-enabled/myapp

# Create Nginx config with reverse proxy, SSL support, rate limiting, and streaming support
sudo cat > /etc/nginx/sites-available/myapp <<EOL
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Redirect all HTTP requests to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Enable rate limiting
    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;

        # Disable buffering for streaming support
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;
    }
}
EOL

# Create symbolic link if it doesn't already exist
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp

# Kill any stale nginx processes and restart via systemd
sudo pkill nginx || true
sudo systemctl restart nginx

# Setup automatic SSL certificate renewal...
( crontab -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet && systemctl reload nginx" ) | crontab -

# Output final message
SSH_HOST=$(curl -s -4 ifconfig.me)
PRIVATE_KEY=$(sudo cat /home/$SSH_USER/.ssh/id_ed25519)

echo "
========================================
  Deployment setup complete!
  https://$DOMAIN_NAME
========================================

Add these to GitHub → Settings → Secrets and variables → Actions:

  SSH_HOST     = $SSH_HOST
  SSH_PORT     = $SSH_PORT
  SSH_USER     = $SSH_USER
  SSH_PRIVATE_KEY (secret) =
$PRIVATE_KEY

========================================"
