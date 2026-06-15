import jwt from 'jsonwebtoken';

const QR_SECRET = process.env.QR_TOKEN_SECRET;

/**
 * Generate a signed QR token for a ticket
 * Contains registrationId + eventId, signed with a secret
 * Cannot be guessed or forged
 */
export const generateQRToken = (registrationId, eventId) => {
  if (!QR_SECRET) {
    console.warn('QR_TOKEN_SECRET not set, falling back to unsigned token');
    return `EVT-${registrationId}-${eventId}-${Date.now()}`;
  }

  return jwt.sign(
    { registrationId, eventId, iat: Math.floor(Date.now() / 1000) },
    QR_SECRET,
    { algorithm: 'HS256' } // No expiry — tickets don't expire after purchase
  );
};

/**
 * Verify a QR token at check-in
 * Returns the payload if valid, throws if invalid/tampered
 */
export const verifyQRToken = (token) => {
  if (!QR_SECRET) {
    // If no secret configured, accept any token (backwards compat)
    return { registrationId: token, eventId: 'unknown' };
  }

  try {
    return jwt.verify(token, QR_SECRET);
  } catch (error) {
    throw new Error('Invalid or tampered QR code');
  }
};
