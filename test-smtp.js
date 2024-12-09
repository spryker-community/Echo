import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

async function testSMTP() {
  // Create transporter with env variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Verify connection
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection successful!');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self
      subject: 'SMTP Test for Community Echo',
      text: 'If you receive this email, SMTP is configured correctly!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00AEEF;">SMTP Test Successful!</h1>
          <p>If you're reading this, your SMTP configuration is working correctly.</p>
          <p>Configuration used:</p>
          <ul>
            <li>Host: ${process.env.SMTP_HOST}</li>
            <li>Port: ${process.env.SMTP_PORT}</li>
            <li>User: ${process.env.SMTP_USER}</li>
          </ul>
        </div>
      `,
    });

    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('SMTP Test failed:');
    console.error(error);
    process.exit(1);
  }
}

testSMTP();
