Hey, thank you for your purchase

1° - Install PhpMyAdmin on the server : 

cd /var/www/pterodactyl/public/
mkdir pma
cd pma
wget https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip
unzip phpMyAdmin-5.2.1-all-languages.zip
mv phpMyAdmin-5.2.1-all-languages/* /var/www/pterodactyl/public/pma
rm -rf phpM*
mkdir /var/www/pterodactyl/public/pma/tmp
chmod -R 777 /var/www/pterodactyl/public/pma/tmp

And follow that

https://phpsolved.com/phpmyadmin-blowfish-secret-generator/


2° - PhpMyAdmin button on the panel :

cd /var/www/pterodactyl
nano resources/scripts/routers/ServerRouter.tsx
And above "{rootAdmin && ("add :
 	<a href="/pma">PhpMyAdmin</a>

Press f2, y and enter

3° - Run these commands:

apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt -y install nodejs
cd /var/www/pterodactyl
npm i -g yarn
yarn install
yarn build:production
chown -R www-data:www-data *


If you need suport check our addon FAQ: https://bagou450.com/product/197 
