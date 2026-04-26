import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const IV_LEN = 12;
const TAG_LEN = 16;

function deriveKey(): Buffer {
  const raw = process.env.EMAIL_ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? 'bungalov-dev-email-key';
  return createHash('sha256').update(String(raw), 'utf8').digest();
}

export function encryptSmtpPassword(plain: string): string {
  if (!plain) return '';
  const key = deriveKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptSmtpPassword(b64: string): string {
  if (!b64) return '';
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < IV_LEN + TAG_LEN) return '';
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const key = deriveKey();
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
