// Contact form submission via Web3Forms (https://web3forms.com)
// Zero-backend, free tier covers 1,000 submissions/month.
// Set PUBLIC_WEB3FORMS_KEY in .env; sign up at web3forms.com/#start using
// max.richter.dev@proton.me — every submission is forwarded to that address.

import { SITE } from '~/data/site';

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
  /** honeypot — real users leave this empty, bots fill everything */
  website?: string;
  /** ms the form was on screen before submit — <1500ms is almost certainly a bot */
  elapsedMs: number;
}

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: 'validation' | 'bot' | 'config' | 'network' | 'server'; message: string };

const ENDPOINT = 'https://api.web3forms.com/submit';
const MIN_HUMAN_MS = 1500;

export function validate(p: Pick<ContactPayload, 'name' | 'email' | 'message'>): string | null {
  if (!p.name.trim()) return 'Please enter your name.';
  if (!p.email.trim()) return 'Please enter your email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return 'That email looks off.';
  if (p.message.trim().length < 10) return 'Message is a bit short — a few more words?';
  return null;
}

export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  // Honeypot trip — silently reject
  if (payload.website && payload.website.trim() !== '') {
    return { ok: false, reason: 'bot', message: 'Spam detected.' };
  }

  // Timing check — forms submitted instantly are almost always bots
  if (payload.elapsedMs < MIN_HUMAN_MS) {
    return { ok: false, reason: 'bot', message: 'Please take a moment longer.' };
  }

  const err = validate(payload);
  if (err) return { ok: false, reason: 'validation', message: err };

  const accessKey = import.meta.env.PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) {
    return {
      ok: false,
      reason: 'config',
      message: 'Contact form is not configured yet. Email directly: ' + SITE.author.email,
    };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `richtermax.com · ${payload.name}`,
        from_name: `${SITE.name} contact form`,
        replyto: payload.email,
        name: payload.name,
        email: payload.email,
        company: payload.company || '—',
        message: payload.message,
        botcheck: '',
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        reason: 'server',
        message: `Send failed (${res.status}). Try again or email directly.`,
      };
    }

    const json = (await res.json()) as { success?: boolean; message?: string };
    if (!json.success) {
      return {
        ok: false,
        reason: 'server',
        message: json.message || 'Send failed. Try again or email directly.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: 'network',
      message: 'Network error. Check your connection and retry.',
    };
  }
}
