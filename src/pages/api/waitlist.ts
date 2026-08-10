import type { APIRoute } from 'astro';
import { addWaitlistEmail } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.formData();
  if (String(body.get('company') || '').trim()) return new Response(null, { status: 204 });
  const email = String(body.get('email') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Enter a real email address.' }, { status: 400 });
  const added = addWaitlistEmail(email);
  return Response.json({ ok: true, added, message: added ? 'YOU’RE IN. WE’LL KEEP IT USEFUL.' : 'ALREADY ON THE LIST. GOOD INSTINCTS.' });
};
