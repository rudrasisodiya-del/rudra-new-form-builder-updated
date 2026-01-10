import crypto from 'crypto';

export function generateApiKey(): string {
  return 'pbk_' + crypto.randomBytes(32).toString('hex');
}

export function generateWebhookSecret(): string {
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}
