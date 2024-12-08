import { Handler } from '@netlify/functions';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
const SITE_URL = process.env.URL || 'http://localhost:8888';
const IS_PROD = process.env.CONTEXT === 'production';
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];

interface JWTPayload {
  email: string;
  exp?: number;
  iat?: number;
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
  console.log('Auth verification handler invoked');
  
  const origin = event.headers.origin || SITE_URL;
  const url = new URL(origin);
  const domain = url.hostname;

  console.log('Request details:', {
    origin,
    siteUrl: SITE_URL,
    isProd: IS_PROD,
    domain,
    headers: event.headers,
    queryParams: event.queryStringParameters,
    jwtSecret: JWT_SECRET ? 'set' : 'not set',
  });

  try {
    const encodedToken = event.queryStringParameters?.token;

    if (!encodedToken) {
      console.log('No token provided');
      return createErrorResponse(origin, 'No token provided');
    }

    const token = decodeURIComponent(encodedToken);
    console.log('Token length:', token.length);

    try {
      const tokenPreview = `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
      console.log('Verifying token:', tokenPreview);

      if (!JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return createErrorResponse(origin, 'Server configuration error');
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET, {
          algorithms: ['HS256'],
          maxAge: '15m',
        }) as JWTPayload;

        console.log('Token decoded:', {
          email: decoded.email,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined,
          iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : undefined,
        });

        // Check if the email domain is allowed
        const emailDomain = decoded.email.split('@')[1];
        console.log('Email domain:', emailDomain);
        if (!ALLOWED_DOMAINS.includes(emailDomain)) {
          console.error('Email domain not allowed:', emailDomain);
          return createErrorResponse(origin, 'Email domain not allowed');
        }

      } catch (jwtError: any) {
        console.error('JWT verification error:', {
          name: jwtError.name,
          message: jwtError.message,
          expiredAt: jwtError.expiredAt,
          token: tokenPreview,
        });
        return createErrorResponse(origin, `Token verification failed: ${jwtError.message}`);
      }

      const sessionToken = jwt.sign(
        { 
          email: decoded.email,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        },
        JWT_SECRET,
        { algorithm: 'HS256' }
      );

      // Update cookie domain to match request origin
      const cookieHeader = `auth=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; ${IS_PROD ? 'Secure; ' : ''}Domain=${domain}; Max-Age=${7 * 24 * 60 * 60}`;
      console.log('Cookie configuration:', {
        isProd: IS_PROD,
        domain,
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60,
        cookieLength: cookieHeader.length,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = {
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

      console.log('Response details:', response);
      return response;

    } catch (error: any) {
      console.error('Token verification error:', {
        error: error.message,
        stack: error.stack,
        token: token.length > 20 ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : token,
      });
      return createErrorResponse(origin, 'Failed to verify authentication token');
    }
  } catch (error: any) {
    console.error('Auth verification error:', {
      error: error.message,
      stack: error.stack,
    });
    return createErrorResponse(origin, 'Internal server error');
  }
};
