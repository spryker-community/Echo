import { Handler } from '@netlify/functions';
import * as jwt from 'jsonwebtoken';
import { createTransport } from 'nodemailer';

// Get environment variables
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS?.split(',') || [];
const JWT_SECRET = process.env.JWT_SECRET || '';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SITE_URL = process.env.URL || 'http://localhost:8888';

// Configure email transporter
const transporter = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Validate email domain
function isAllowedDomain(email: string): boolean {
  const domain = email.split('@')[1].toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

// Generate magic link
function generateMagicLink(email: string): string {
  const token = jwt.sign(
    { 
      email,
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    },
    JWT_SECRET
  );
  
  return `${SITE_URL}/auth/verify?token=${token}`;
}

// Send magic link email
async function sendMagicLinkEmail(email: string, magicLink: string) {
  await transporter.sendMail({
    from: SMTP_USER,
    to: email,
    subject: 'Sign in to Community Echo',
    text: `Click this link to sign in to Community Echo: ${magicLink}\n\nThis link will expire in 15 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00AEEF; margin-bottom: 24px;">Sign in to Community Echo</h1>
        <p style="margin-bottom: 24px;">Click the button below to sign in:</p>
        <a href="${magicLink}" 
           style="display: inline-block; background: #00AEEF; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px;
                  margin-bottom: 24px;">
          Sign in to Community Echo
        </a>
        <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { email } = JSON.parse(event.body || '{}');

    // Validate email presence
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Validate email domain
    if (!isAllowedDomain(email)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Email domain not allowed. Please use your @spryker.com email address.' }),
      };
    }

    // Generate and send magic link
    const magicLink = generateMagicLink(email);
    await sendMagicLinkEmail(email, magicLink);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Magic link sent' }),
    };
  } catch (error) {
    console.error('Auth request error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
