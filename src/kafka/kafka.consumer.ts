import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { EmailService } from '../services/email.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
    private readonly logger = new Logger(KafkaConsumerService.name);
    private readonly kafka = new Kafka({
        clientId: 'email-service',
        brokers: ['192.168.1.92:9092'],
    });

    private readonly consumer = this.kafka.consumer({ groupId: 'email-group' });

    constructor(private readonly emailService: EmailService) { }

    async onModuleInit() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: 'start-kirim-email', fromBeginning: false });

        await this.consumer.run({
            eachMessage: async ({ message }: EachMessagePayload) => {
                const payload = JSON.parse(message.value.toString());
                this.logger.log(`Menerima pesan dari Kafka: ${JSON.stringify(payload)}`);

                // Trigger email berdasarkan id_email yang diterima dari Kafka
                await this.emailService.processEmail(payload.id_email);
            },
        });
    }
}
