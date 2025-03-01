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
    async handleWebhook(@Body() body: any) {
        this.logger.log('Webhook received:', JSON.stringify(body));
        
        let ress = body.events[0];
        // Cari email berdasarkan event ID
        const email = await this.emailRepository.findOneBy({ messageId: ress.message_id });
        if (!email) {
            this.logger.warn(`Email dengan Event ID ${ress.message_id} tidak ditemukan.`);
            return;
        }

        // Update status email berdasarkan response webhook
        // if (ress.event === 'delivery') {
        //     email.status = 'delivered';
        // } else 
        //     if (ress.event === 'reject') {
        //         email.status = 'reject';
        // } else 
        // if (ress.event === 'delivered') {
        //     email.status = 'delivered';
        // } else 
        // if (ress.event === 'reject') {
        //     email.status = 'failed';
        // } else if (ress.event === 'opened') {
        //     email.status = 'opened';
        // } else {
        //     email.status = 'unknown';
        // }
        email.status = ress.event;
        email.updatedAt = new Date();
        await this.emailRepository.save(email);

        this.logger.log(`Status email ${email.idEmail} diperbarui menjadi: ${email.status}`);
    }
}
