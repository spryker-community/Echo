import { Handler } from '@netlify/functions';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
const SITE_URL = process.env.URL || 'http://localhost:8888';

interface JWTPayload {
  email: string;
  exp?: number;
}

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      statusCode: 405,
      headers: {
        ...headers,
        'Location': `${SITE_URL}/auth/error?message=${encodeURIComponent('Method not allowed')}`,
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
          'Location': `${SITE_URL}/auth/error?message=${encodeURIComponent('No token provided')}`,
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
      const cookieHeader = `auth=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`;

      // Redirect to app with session token
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': SITE_URL,
          'Set-Cookie': cookieHeader,
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
          'Location': `${SITE_URL}/auth/error?message=${encodeURIComponent('Invalid or expired token')}`,
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
        'Location': `${SITE_URL}/auth/error?message=${encodeURIComponent('Internal server error')}`,
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
