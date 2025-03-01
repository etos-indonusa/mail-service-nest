typeorm-model-generator -h 10.0.16.206 -d kirim_email -u app -x 'Pantek123!@#' -e mysql -o ./src/entities


pm2 start ecosystem.config.js --env production