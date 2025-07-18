#!/bin/bash
bleuclair='\e[1;34m'
neutre='\e[0;m'
echo "cd /var/www/pterodactyl" >> /etc/pteroautoupdatepanel.sh
echo "php artisan down" >> /etc/pteroautoupdatepanel.sh
echo "curl -L https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz | tar -xzv" >> /etc/pteroautoupdatepanel.sh
echo "chmod -R 755 storage/* bootstrap/cache" >> /etc/pteroautoupdatepanel.sh
echo "composer install --no-dev --optimize-autoloader --no-interaction" >> /etc/pteroautoupdatepanel.sh
echo "php artisan view:clear && php artisan config:clear" >> /etc/pteroautoupdatepanel.sh
echo "php artisan migrate --seed --force" >> /etc/pteroautoupdatepanel.sh
echo "chown -R www-data:www-data /var/www/pterodactyl/*" >> /etc/pteroautoupdatepanel.sh
echo "chown -R nginx:nginx /var/www/pterodactyl/*" >> /etc/pteroautoupdatepanel.sh
echo "chown -R apache:apache /var/www/pterodactyl/*" >> /etc/pteroautoupdatepanel.sh
echo "php artisan queue:restart" >> /etc/pteroautoupdatepanel.sh
echo "php artisan up" >> /etc/pteroautoupdatepanel.sh

echo -e "${bleuclair}Auto-Update for panel setup :)${neutre}"

