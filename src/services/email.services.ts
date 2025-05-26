import sgMail from '@sendgrid/mail';
import createDebug from 'debug';
import { Auth } from './auth.services.js';

const debug = createDebug('PIM:email-service');

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  static async sendEmail(to: string, subject: string, htmlContent: string) {
    if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY is not set in enviroment variables');
    }

    try {
      const message = {
        to,
        from: 'apradanab@gmail.com',
        subject,
        html: htmlContent,
      };
      await sgMail.send(message);
      debug(`Email send to ${to}`);
    } catch(error) {
      debug(`Error sending email: ${(error as Error).message}`);
      throw new Error('Error sending email');
    }
  }

  static generateRegistrationEmail(name: string, userId: string, role: string): { subject: string; content: string } {
    const token = Auth.signJwt({ id: userId, role });
    const domain = process.env.APP_DOMAIN ?? 'http://localhost:4200';
    const link = `${domain}/complete-registration?token=${token}`;

    const content = `
      <h1>Hola, ${name}</h1>
      <p>Tu cuenta ha sido aprobada. Puedes completar tu registro.</p>
      <p><a href='${link}'>Haz click para registrarte</a></p>
    `

    return {
      subject: 'Tu cuenta ha sido aprobada',
      content,
    }
  }
}
