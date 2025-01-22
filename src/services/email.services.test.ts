import sgMail from '@sendgrid/mail';
import { EmailService } from './email.services';
import { Auth } from './auth.services';

jest.mock('@sendgrid/mail');
jest.mock('./auth.services', () => ({
  Auth: {
    signJwt: jest.fn().mockReturnValue('mockend-jwt-token'),
  },
}));

describe('EmailService', () => {
  const mockSend = jest.fn();
  (sgMail.send as jest.Mock) = mockSend;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send an email with the provided details', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const htmlContent = '<p>Test Email Content<p>';

      await EmailService.sendEmail(to, subject, htmlContent);

      expect(mockSend).toHaveBeenCalledWith({
        to,
        from: 'apradanab@gmail.com',
        subject,
        html: htmlContent,
      });
    });

    it('should throw an error if email sending fails', async () => {
      const mockSend = jest.fn().mockRejectedValue(new Error('Send error'));
      sgMail.send = mockSend;

      const to = 'test@example.com';
      const subject = 'Test Subject';
      const htmlContent = '<p>Test Email Content<p>';

      await expect(EmailService.sendEmail(to, subject, htmlContent)).rejects.toThrow('Error sending email');
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('generateRegistrationEmail', () => {
    it('should generate a registration email with the correct details', () => {
      const mockSignJwt = jest.fn().mockReturnValue('mockToken');
      Auth.signJwt = mockSignJwt;

      const userId = '123';
      const name = 'Test User';
      const role = 'USER';

      const result = EmailService.generateRegistrationEmail(name, userId, role);

      expect(result.subject).toBe('Tu cuenta ha sido aprobada');
      expect(result.content).toContain(`<h1>Hola, ${name}</h1>`);
      expect(result.content).toContain('Haz click para registrarte');
      expect(result.content).toContain('mockToken');
      expect(mockSignJwt).toHaveBeenCalledWith({ id: userId, role });
    });
  });
});
