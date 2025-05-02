import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from 'src/services/email.service';

@Injectable()
export class EmailQueueProcessorService {
    constructor(private readonly emailService: EmailService) { }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async handlePendingEmails() {
        const pendingEmails = await this.emailService.getPendingEmails();

        for (const email of pendingEmails) {
            try {
                await this.emailService.processEmail(email.idEmail);
            } catch (err) {
                console.error(`Gagal memproses email ${email.idEmail}: ${err.message}`);
            }
        }
    }
}
