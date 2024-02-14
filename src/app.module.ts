import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerController } from './mailer/mailer.controller';
import { config } from 'dotenv';
config();
@Module({
  imports: [],
  controllers: [AppController, MailerController],
  providers: [AppService],
})
export class AppModule {}
