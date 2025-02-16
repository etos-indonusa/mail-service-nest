import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kafka, Partitioners } from 'kafkajs';
import * as nodemailer from 'nodemailer'; 
import { Email } from 'src/entities/entities/Email';
import { EmailContent } from 'src/entities/entities/EmailContent';
import { EmailQueue } from 'src/entities/entities/EmailQueue';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly kafka = new Kafka({ brokers: ['192.168.1.92:9092'], clientId: 'kafka-mail-service', });
    private readonly producer = this.kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner
    });
    
    constructor(
        @InjectRepository(Email) private emailRepository: Repository<Email>,
        @InjectRepository(EmailContent) private emailContentRepository: Repository<EmailContent>,
        @InjectRepository(EmailQueue) private emailQueueRepository: Repository<EmailQueue>,
    ) { }

    // Fungsi untuk memproses email berdasarkan ID
    async processEmail(idEmail: string) {
        const email = await this.emailRepository.findOneBy({ idEmail });
        const emailContent = await this.emailContentRepository.findOneBy({ idEmail });

        if (!email || !emailContent) {
            this.logger.warn(`Email dengan ID ${idEmail} tidak ditemukan.`);
            return;
        }
        
        // Cek apakah email sudah pernah gagal dikirim lebih dari 3 kali
        const emailQueue = await this.emailQueueRepository.findOne({ where: { idEmail:idEmail } });

        if (emailQueue && emailQueue.attemptCount >= 3) {
            this.logger.warn(`Email dengan ID ${idEmail} sudah gagal dikirim lebih dari 3 kali. Tidak akan dicoba lagi.`);

            // Perbarui status email ke 'failed' secara permanen
            email.status = 'failed';
            email.failedReason = 'Melebihi batas maksimal pengiriman (3x gagal)';
            await this.emailRepository.save(email);

            // Kirim event Kafka: Email gagal total
            await this.sendKafkaEvent(email.idEmail, 'failed', 'Melebihi batas maksimal pengiriman (3x gagal)');
            return;
        }

        // Jika belum mencapai batas maksimum, tambahkan ke antrian pengiriman
        if (!emailQueue) {
            const newEmailQueue = new EmailQueue();
            newEmailQueue.idEmail = idEmail;
            newEmailQueue.priority = 0;
            newEmailQueue.status = 'pending';
            newEmailQueue.attemptCount = 0;
            await this.emailQueueRepository.save(newEmailQueue);
        }

        this.logger.log(`Email dengan ID ${idEmail} dimasukkan ke antrian pengiriman.`);
        await this.sendEmail(email, emailContent);
    }

    // Fungsi untuk mengirim email
    async sendEmail(email: Email, emailContent: EmailContent) {
        const transporter = nodemailer.createTransport({
            host: 'live.smtp.mailtrap.io',
            port: 587,
            secure: false,
            auth: {
                user: 'api',
                pass: '914646ea32e5bc72d624f012f9f10aa5',
            },
        });

        try {
            // Kirim email dengan nodemailer
            await transporter.sendMail({
                from: '"Service Etos" <noreply@service.etos.co.id>',
                to: email.recipientEmail,
                subject: email.subject,
                html: emailContent.emailBody,
                headers: {
                    'X-Event-ID': email.idEmail, // Custom header untuk tracking
                },
            });

            this.logger.log(`Email berhasil dikirim ke ${email.recipientEmail}`);

            // Update status di database
            email.status = 'sent';
            email.sentAt = new Date();
            await this.emailRepository.save(email);

            // Hapus dari email_queue karena sudah terkirim
            await this.emailQueueRepository.delete({ idEmail:email.idEmail });

            // Kirim event Kafka: Email berhasil
            await this.sendKafkaEvent(email.idEmail, 'sent');

        } catch (error) {
            this.logger.error(`Gagal mengirim email ke ${email.recipientEmail}: ${error.message}`);

            // Cek attempt count
            const queueEntry = await this.emailQueueRepository.findOne({ where: { idEmail: email.idEmail } });
            if (queueEntry) {
                queueEntry.attemptCount += 1;
                queueEntry.lastAttempt = new Date();

                if (queueEntry.attemptCount >= 3) {
                    this.logger.warn(`Percobaan pengiriman email untuk ${email.recipientEmail} telah gagal lebih dari 3 kali. Tidak akan dicoba lagi.`);
                    queueEntry.status = 'failed';

                    // Update email status sebagai gagal total
                    email.status = 'failed';
                    email.failedReason = `Gagal setelah 3 percobaan: ${error.message}`;
                    await this.emailRepository.save(email);

                    // Kirim event Kafka: Email gagal total
                    await this.sendKafkaEvent(email.idEmail, 'failed', `Gagal setelah 3 percobaan: ${error.message}`);
                } else {
                    queueEntry.status = 'pending';
                    await this.emailQueueRepository.save(queueEntry);
                }
            }

            // Jika queueEntry tidak ditemukan, maka tambahkan ke queue
            else {
                const newQueueEntry = new EmailQueue();
                newQueueEntry.idEmail = email.idEmail;
                newQueueEntry.priority = 0;
                newQueueEntry.status = 'pending';
                newQueueEntry.attemptCount = 1;
                newQueueEntry.lastAttempt = new Date();
                await this.emailQueueRepository.save(newQueueEntry);
            }
        }
    }

    // Fungsi untuk mengirim event Kafka
    async sendKafkaEvent(idEmail: string, status: string, reason: string = null) {
        const producer = this.kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
        await producer.connect();

        let retries = 5; // Coba 5 kali jika Kafka belum siap
        while (retries > 0) {
            try {
                await producer.send({
                    topic: 'email-status',
                    messages: [{ value: JSON.stringify({ idEmail, status, reason }) }],
                });
                this.logger.log(`Event Kafka dikirim: { idEmail: ${idEmail}, status: ${status}, reason: ${reason} }`);
                break; // Berhenti jika sukses
            } catch (error) {
                this.logger.warn(`Gagal mengirim event ke Kafka. Sisa percobaan: ${retries - 1}`);
                retries--;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Tunggu 2 detik sebelum mencoba lagi
            }
        }

        await producer.disconnect();
    }
}
