import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readdirSync } from 'fs';
import { join } from 'path'; 
import { Email } from './entities/entities/Email';
import { EmailContent } from './entities/entities/EmailContent';
import { EmailQueue } from './entities/entities/EmailQueue';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: '192.168.1.94', // Ganti dengan host MySQL Anda
            port: 3306,        // Port MySQL default
            username: 'app',  // Username MySQL
            password: 'Pantek123!@#', // Password MySQL
            database: 'kirim_email', // Nama database yang ada
            entities: [Email, EmailContent, EmailQueue], // Load semua entity
            synchronize: false, // Jangan sinkronkan karena database sudah ada
        }),
        TypeOrmModule.forFeature([Email, EmailContent, EmailQueue]), 
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
