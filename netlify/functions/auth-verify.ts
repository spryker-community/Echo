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

const createErrorResponse = (origin: string, message: string, details?: string) => {
  const errorMessage = details ? `${message}: ${details}` : message;
  console.error('Creating error response:', { origin, errorMessage });
  return {
    statusCode: 302,
    headers: {
      'Location': `${origin}/auth/error?message=${encodeURIComponent(errorMessage)}`,
      'Cache-Control': 'no-cache',
    },
    body: '',
  };
};

export const handler: Handler = async (event) => {
  console.log('Auth verification handler invoked');
  
  // Determine the correct origin
  let origin = SITE_URL; // Default to SITE_URL
  if (event.headers.origin) {
    try {
      const originUrl = new URL(event.headers.origin);
      // Only accept origins that match our site URL or localhost
      if (originUrl.hostname === new URL(SITE_URL).hostname || originUrl.hostname === 'localhost') {
        origin = event.headers.origin;
      }
    } catch (error) {
      console.warn('Invalid origin header:', event.headers.origin);
    }
  }

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
      console.log('No token provided in query parameters');
      return createErrorResponse(origin, 'Authentication failed', 'No token provided');
    }

    const token = decodeURIComponent(encodedToken);
    console.log('Token length:', token.length);

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return createErrorResponse(origin, 'Authentication failed', 'Server configuration error');
    }

    const tokenPreview = `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
    console.log('Verifying token:', tokenPreview);

    let decoded;
    try {
      // Removed maxAge option since we're using explicit exp claim
      decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      }) as JWTPayload;

      console.log('Token decoded successfully:', {
        email: decoded.email,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined,
        iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : undefined,
      });

      if (!decoded.email) {
        console.error('Token missing email claim');
        return createErrorResponse(origin, 'Authentication failed', 'Invalid token format');
      }

      // Check if the email domain is allowed
      const emailDomain = decoded.email.split('@')[1];
      console.log('Validating email domain:', emailDomain);
      if (!ALLOWED_DOMAINS.includes(emailDomain)) {
        console.error('Email domain not allowed:', emailDomain);
        return createErrorResponse(origin, 'Authentication failed', `Email domain ${emailDomain} is not allowed`);
      }

    } catch (jwtError: any) {
      console.error('JWT verification error:', {
        name: jwtError.name,
        message: jwtError.message,
        expiredAt: jwtError.expiredAt,
        token: tokenPreview,
      });

      let errorDetail = 'Token verification failed';
      if (jwtError.name === 'TokenExpiredError') {
        errorDetail = 'Magic link has expired. Please request a new one';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorDetail = 'Invalid magic link. Please request a new one';
      }

      return createErrorResponse(origin, 'Authentication failed', errorDetail);
    }

    // Generate session token
    const sessionToken = jwt.sign(
      { 
        email: decoded.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    );

    // Set cookie with appropriate domain
    const cookieHeader = `auth=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; ${IS_PROD ? 'Secure; ' : ''}Domain=${domain}; Max-Age=${7 * 24 * 60 * 60}`;
    console.log('Cookie configuration:', {
      isProd: IS_PROD,
      domain,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60,
      cookieLength: cookieHeader.length,
    });

    // Small delay to ensure cookie is set
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

    console.log('Successful authentication response prepared');
    return response;

  } catch (error: any) {
    console.error('Unexpected error during auth verification:', {
      error: error.message,
      stack: error.stack,
    });
    return createErrorResponse(origin, 'Authentication failed', 'An unexpected error occurred');
  }
};
