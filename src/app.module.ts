import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readdirSync } from 'fs';
import { join } from 'path'; 
import { Email } from './entities/entities/Email';
import { EmailContent } from './entities/entities/EmailContent';
import { EmailQueue } from './entities/entities/EmailQueue';
import { EmailProcessor } from './jobs/email.processor';
import { KafkaConsumerService } from './kafka/kafka.consumer';
import { EmailService } from './services/email.service';
import { MailtrapWebhookController } from './controllers/mailtrap-webhook.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailQueueProcessorService } from './jobs/re-que-email.processor';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: '10.0.16.206', // Ganti dengan host MySQL Anda
            port: 3306,        // Port MySQL default
            username: 'app',  // Username MySQL
            password: 'Pantek123!@#', // Password MySQL
            database: 'kirim_email', // Nama database yang ada
            entities: [Email, EmailContent, EmailQueue], // Load semua entity
            synchronize: false, // Jangan sinkronkan karena database sudah ada
        }),
        TypeOrmModule.forFeature([Email, EmailContent, EmailQueue]), 
        ScheduleModule.forRoot(),
    ],
    controllers: [AppController, MailtrapWebhookController],
    providers: [AppService, KafkaConsumerService, EmailService, EmailProcessor, EmailQueueProcessorService],
})
export class AppModule { }
