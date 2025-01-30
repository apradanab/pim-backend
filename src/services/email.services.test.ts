import sgMail from '@sendgrid/mail';
import { EmailService } from './email.services';
import { Auth } from './auth.services';

jest.mock('@sendgrid/mail');
jest.mock('./auth.services', () => ({
  Auth: {
    signJwt: jest.fn().mockReturnValue('mocked-jwt-token'),
  },
}));

const mockSend = jest.fn();
(sgMail.send as jest.Mock) = mockSend;

describe('EmailService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When SENDGRID_API_KEY is missing', () => {
    test('Then it should throw an error', async () => {
      delete process.env.SENDGRID_API_KEY; // Eliminar variable de entorno

      await expect(
        EmailService.sendEmail('test@example.com', 'Test', '<p>Test<p>')
      ).rejects.toThrow('SENDGRID_API_KEY is not set in enviroment variables');
    });
  });

  describe('sendEmail()', () => {
    beforeEach(() => {
      process.env.SENDGRID_API_KEY = 'SG.mock-sendgrid-api-key';
    });

    test('should send an email with the correct data', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const htmlContent = '<p>Test Email Content</p>';

      await EmailService.sendEmail(to, subject, htmlContent);

      expect(mockSend).toHaveBeenCalledWith({
        to,
        from: 'apradanab@gmail.com',
        subject,
        html: htmlContent,
      });
    });

    test('should throw an error if email sending fails', async () => {
      mockSend.mockRejectedValue(new Error('Send error'));

      const to = 'test@example.com';
      const subject = 'Test Subject';
      const htmlContent = '<p>Test Email Content</p>';

      await expect(EmailService.sendEmail(to, subject, htmlContent)).rejects.toThrow('Error sending email');
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('generateRegistrationEmail()', () => {
    test('should generate a registration email with the correct details', () => {
      const mockSignJwt = jest.fn().mockReturnValue('mocked-jwt-token');
      Auth.signJwt = mockSignJwt;

      const userId = '123';
      const name = 'Test User';
      const role = 'USER';

      const result = EmailService.generateRegistrationEmail(name, userId, role);

      expect(result.subject).toBe('Tu cuenta ha sido aprobada');
      expect(result.content).toContain(`<h1>Hola, ${name}</h1>`);
      expect(result.content).toContain('Tu cuenta ha sido aprobada. Puedes completar tu registro.');
      expect(result.content).toContain('mocked-jwt-token');
      expect(mockSignJwt).toHaveBeenCalledWith({ id: userId, role });
    });
  });
});
