import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm'; 
import { Email } from 'src/entities/entities/Email';

@Controller('mailtrap-webhook')
export class MailtrapWebhookController {
    private readonly logger = new Logger(MailtrapWebhookController.name);

    constructor(
        @InjectRepository(Email)
        private readonly emailRepository: Repository<Email>,
    ) { }

    @Post()
    async handleWebhook(@Body() body: any, @Headers('x-event-id') eventId: string) {
        this.logger.log('Webhook received:', JSON.stringify(body));
        this.logger.log(`Event ID dari header: ${eventId}`);

        if (!eventId) {
            this.logger.warn('Event ID tidak ditemukan di webhook!');
            return;
        }

        // Cari email berdasarkan event ID
        const email = await this.emailRepository.findOneBy({ idEmail:eventId });
        if (!email) {
            this.logger.warn(`Email dengan Event ID ${eventId} tidak ditemukan.`);
            return;
        }

        // Update status email berdasarkan response webhook
        if (body.event === 'delivered') {
            email.status = 'delivered';
        } else if (body.event === 'failed') {
            email.status = 'failed';
        } else if (body.event === 'opened') {
            email.status = 'opened';
        } else {
            email.status = 'unknown';
        }

        email.updatedAt = new Date();
        await this.emailRepository.save(email);

        this.logger.log(`Status email ${email.idEmail} diperbarui menjadi: ${email.status}`);
    }
}
