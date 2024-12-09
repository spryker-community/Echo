import { Handler } from '@netlify/functions';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
const SITE_URL = process.env.URL || 'http://localhost:8888';
const IS_PROD = process.env.CONTEXT === 'production';

interface JWTPayload {
  email: string;
  exp?: number;
}

const createErrorResponse = (origin: string, message: string) => ({
  statusCode: 302,
  headers: {
    'Location': `${origin}/auth/error?message=${encodeURIComponent(message)}`,
    'Cache-Control': 'no-cache',
  },
  body: '',
});

export const handler: Handler = async (event) => {
  // Get the origin from the request headers or use the SITE_URL
  const origin = event.headers.origin || SITE_URL;
  const url = new URL(origin);
  const domain = url.hostname;

  console.log('Request details:', {
    origin,
    siteUrl: SITE_URL,
    isProd: IS_PROD,
    domain,
    headers: event.headers,
  });

  try {
    // Get token from query parameters
    const token = event.queryStringParameters?.token;

    if (!token) {
      console.log('No token provided');
      return createErrorResponse(origin, 'No token provided');
    }

    try {
      // Verify token
      console.log('Verifying token...');
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      console.log('Token verified for email:', decoded.email);

      // Generate session token
      const sessionToken = jwt.sign(
        { 
          email: decoded.email,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        },
        JWT_SECRET
      );

      // Create simple cookie header
      const cookieHeader = `auth=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; ${IS_PROD ? 'Secure; ' : ''}Domain=.commercequest.space`;
      console.log('Cookie header:', cookieHeader);

      // Return redirect with cookie
      return {
        statusCode: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': cookieHeader,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        body: '',
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return createErrorResponse(origin, 'Invalid or expired token');
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return createErrorResponse(origin, 'Internal server error');
  }
};
