import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import config from '../config';

const readFileAsync = promisify(fs.readFile);
const DEFAULT_ATTACHMENT_ENCODING: BufferEncoding = 'base64';

const sendEmail = async (
  email: string,
  html: string,
  subject: string,
  attachment?: { filename: string; content: Buffer; encoding?: BufferEncoding }
) => {
  try {
 const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.sender_email,
    pass: config.sender_app_password,
  },
});


    // Email configuration
   const mailOptions: nodemailer.SendMailOptions = {
  from: `"BUTrace" <${config.sender_email}>`,
  to: email,
  subject,
  html,
};


    if (attachment) {
      const encoding = attachment.encoding ?? DEFAULT_ATTACHMENT_ENCODING;
      mailOptions.attachments = [
        {
          filename: attachment.filename,
          content: attachment.content,
          encoding,
        },
      ];
    }

    // Sending the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

const createEmailContent = async (data: object, templateType: string) => {
  try {
    const templatePath = path.join(process.cwd(), `/src/templates/${templateType}.template.hbs`);
    const content = await readFileAsync(templatePath, 'utf8');

    const template = Handlebars.compile(content);

    return template(data);
  } catch (error) {
    console.error('createEmailContent error:', error);
    throw error;
  }
};

export const EmailHelper = {
  sendEmail,
  createEmailContent,
};
