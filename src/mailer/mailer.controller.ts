
import { Body, Controller, Get, HttpException, HttpStatus, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as nodemailer from 'nodemailer';
import { createReadStream, unlink } from 'fs';
import { Express } from 'express';
import * as multer from 'multer';
import { join } from 'path';
import { S3 } from 'aws-sdk';
import axios from 'axios';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { storageConfig } from './storage.service';
import * as fs from 'fs';


@Controller('mailer')
export class MailerController {
    constructor(
    ) { }

    @Post('upload')
    @UseInterceptors(FilesInterceptor('files', 3, storageConfig))
    async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Body()
    body: { to: string, subject: string, text: string, }) {
        
        console.time('process files');
        const fileNames = files.map(file => file.filename);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDER_MAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
        console.timeEnd('process files');

        console.time('SentMail')
        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: body.to,
            subject: body.subject,
            text: body.text,
            attachments: fileNames.map(fileName => ({
                filename: fileName,
                path: `./public/docs/${fileName}`,
            })),
        };

        const info = await transporter.sendMail(mailOptions);

        console.timeEnd('SentMail')
        // Delete uploaded files after sending the email
        fileNames.forEach((fileName) => {
            const filePath = `./public/docs/${fileName}`; // Update the path to match your upload destination
            fs.unlinkSync(filePath); // Synchronously delete the file
            console.log(`Deleted file: ${filePath}`);
        });

        return { message: 'Email sent successfully!', info };


    }
    @Post('upload2')
    @UseInterceptors(FilesInterceptor('files', 3, {
        storage: diskStorage({
            destination: './public/docs',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadFiles2(@UploadedFiles() files: Express.Multer.File[], @Body()
    body: { to: string, subject: string, text: string, }) {
        // Process uploaded files
        const fileNames = files.map(file => file.filename);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rpbarmaiya@gmail.com',
                pass: 'zqeectcatxxihivg',
            },
        });


        const mailOptions = {
            from: 'rpbarmaiya@gmail.com',
            to: body.to,
            subject: body.subject,
            text: body.text,
            attachments: fileNames.map(fileName => ({
                filename: fileName,
                path: `./public/docs/${fileName}`,
            })),
        };

        const info = await transporter.sendMail(mailOptions);

        return { message: 'Email sent successfully!', info };


    }


    @Get('test')
    async testGet() {
        return 'success'
    }
    @Post('send-mail')
    async sendDocs(
        @Body()
        body: { to: string, subject: string, text: string, },
        // @UploadedFile() file: multer.File,
    ) {
        console.log(body);
        const htmlTemplate = `
        <h2>Hello ${body.to},</h2>
        <p>Your email content goes here.</p>
        <p>Additional information: ${body.text}</p>
      `;


        const transporter = nodemailer.createTransport({
            host: process.env.AWS_HOSTNAME,
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });


        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: body.to,
            subject: body.subject,
            text: body.text,
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);

        return { message: 'Email sent successfully!', info };
    }
}
