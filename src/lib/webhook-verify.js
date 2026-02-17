// Paddle Webhook Signature Verification
// Paddle signs all webhook requests with a shared secret

import crypto from 'crypto';

/**
 * Verify that a webhook request is actually from Paddle
 * @param {string} body - The raw request body as string
 * @param {string} signature - The signature from the paddle-signature header
 * @param {string} secret - The webhook secret from Paddle
 * @returns {boolean} - True if the signature is valid
 */
export function verifyPaddleWebhookSignature(body, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  try {
    // Paddle uses HMAC-SHA256 to sign webhooks
    // The signature is in the format: ts={timestamp};h1={hash}
    const parts = signature.split(';');
    let timestamp = '';
    let hash = '';

    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (key === 'ts') {
        timestamp = value;
      } else if (key === 'h1') {
        hash = value;
      }
    }

    if (!timestamp || !hash) {
      return false;
    }

    // Verify the timestamp is not too old (prevents replay attacks)
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(timestamp, 10);
    const maxAge = 300; // 5 minutes in seconds

    if (!ts || (now - ts) > maxAge) {
      console.error('Webhook timestamp too old or invalid:', timestamp);
      return false;
    }

    // Calculate HMAC-SHA256 of the body with the secret
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');

    // Compare the calculated hash with the received hash
    // Use constant-time comparison to prevent timing attacks
    const expectedHash = `sha256=${hmac}`;
    const receivedHash = `sha256=${hash}`;

    return crypto.timingSafeEqual(
      Buffer.from(expectedHash),
      Buffer.from(receivedHash)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extract the raw body as string for signature verification
 * Paddle requires the raw body, not the parsed JSON
 */
export function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}
