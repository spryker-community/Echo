import { Handler } from '@netlify/functions';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
const SITE_URL = process.env.URL || 'http://localhost:8888';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '';
const IS_PROD = process.env.CONTEXT === 'production';

interface JWTPayload {
  email: string;
  exp?: number;
}

export const handler: Handler = async (event) => {
  // Get the origin from the request headers or use the SITE_URL
  const origin = event.headers.origin || SITE_URL;

  // Enable CORS with credentials
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': `${origin}/auth/error?message=${encodeURIComponent('Method not allowed')}`,
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get token from query parameters
    const token = event.queryStringParameters?.token;

    if (!token) {
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': `${origin}/auth/error?message=${encodeURIComponent('No token provided')}`,
        },
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      // Generate session token
      const sessionToken = jwt.sign(
        { 
          email: decoded.email,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        },
        JWT_SECRET
      );

      // Create cookie header
      const cookieOptions = [
        `auth=${sessionToken}`,
        'Path=/',
        IS_PROD ? 'Secure' : '',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${7 * 24 * 60 * 60}`,
      ];

      // Add domain if configured
      if (COOKIE_DOMAIN) {
        cookieOptions.push(`Domain=${COOKIE_DOMAIN}`);
      }

      const cookieHeader = cookieOptions.filter(Boolean).join('; ');

      // Log cookie details for debugging
      console.log('Cookie configuration:', {
        isProd: IS_PROD,
        domain: COOKIE_DOMAIN || 'not set',
        origin,
        cookieHeader,
      });

      // Redirect to app with session token
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': origin,
          'Set-Cookie': cookieHeader,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        body: JSON.stringify({ message: 'Authentication successful' }),
      };
    } catch (error) {
      console.error('Token verification error:', error);
      // Token verification failed
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': `${origin}/auth/error?message=${encodeURIComponent('Invalid or expired token')}`,
        },
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': `${origin}/auth/error?message=${encodeURIComponent('Internal server error')}`,
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
