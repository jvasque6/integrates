#!/bin/bash

crontab -l >> /root/mycron
sed -i 's#/usr/bin#torus\ run\ --\ /usr/bin#g' /root/mycron

crontab /root/mycron
service cron start
rm /root/mycron