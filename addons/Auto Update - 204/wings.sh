#!/bin/bash
bleuclair='\e[1;34m'
neutre='\e[0;m'

echo "curl -L -o /usr/local/bin/wings https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_amd64" >> /etc/pteroautoupdatewings.sh
echo "chmod u+x /usr/local/bin/wings" >> /etc/pteroautoupdatewings.sh
echo "systemctl restart wings" >> /etc/pteroautoupdatewings.sh

echo -e "${bleuclair}Auto-Update for wings setup :)${neutre}"

