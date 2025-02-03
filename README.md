typeorm-model-generator -h 192.168.1.94 -d kirim_email -u app -x 'Pantek123!@#' -e mysql -o ./src/entities


pm2 start ecosystem.config.js --env production