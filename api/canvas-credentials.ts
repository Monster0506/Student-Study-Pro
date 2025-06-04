import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { supabaseServer } from '../src/integrations/supabase/server';
const ENCRYPTION_KEY = process.env.CANVAS_CRED_SECRET!; // Must be 32 bytes (256 bits)
const IV_LENGTH = 12; // AES-GCM recommended IV length

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
}

function decrypt(data: string): string {
  const [ivB64, tagB64, encrypted] = data.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user from Supabase session
  const { data } = await supabaseServer.auth.getUser(req.headers['authorization']?.replace('Bearer ', ''));
  if (!data || !data.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user_id = data.user.id;

  if (req.method === 'GET') {
    // Retrieve credentials
    const { data: credData, error } = await supabaseServer
      .from('canvas_credentials')
      .select('encrypted_api_key, encrypted_instance_url')
      .eq('user_id', user_id)
      .single();
    if (error || !credData) {
      return res.status(404).json({ error: 'No credentials found' });
    }
    try {
      const apiKey = decrypt(credData.encrypted_api_key);
      const instanceUrl = decrypt(credData.encrypted_instance_url);
      return res.status(200).json({ apiKey, instanceUrl });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to decrypt credentials' });
    }
  } else if (req.method === 'POST') {
    const { apiKey, instanceUrl } = req.body;
    if (!apiKey || !instanceUrl) {
      return res.status(400).json({ error: 'Missing apiKey or instanceUrl' });
    }
    const encrypted_api_key = encrypt(apiKey);
    const encrypted_instance_url = encrypt(instanceUrl);
    // Upsert credentials
    const { error } = await supabaseServer
      .from('canvas_credentials')
      .upsert({
        user_id,
        encrypted_api_key,
        encrypted_instance_url,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      return res.status(500).json({ error: 'Failed to store credentials' });
    }
    return res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 