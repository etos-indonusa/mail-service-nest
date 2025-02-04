import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from '../services/email.service';

@Processor('email-queue')
export class EmailProcessor {
    constructor(private readonly emailService: EmailService) { }

    @Process('send-email')
    async handleSendEmail(job: Job) {
        const { emailData, emailContent } = job.data;
        await this.emailService.sendEmail(emailData, emailContent);
    }
}
