import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { addVote } from '../../../lib/db';
import { getApp } from '../../../lib/apps';

export const POST: APIRoute = async ({ params, clientAddress, request }) => {
  const slug = params.slug || '';
  if (!getApp(slug)) return Response.json({ error: 'Unknown app.' }, { status: 404 });
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || clientAddress || 'unknown';
  const hash = createHash('sha256').update(`${process.env.IP_HASH_SALT || 'civi-public-salt-v1'}:${ip}`).digest('hex');
  const result = addVote(slug, hash);
  return Response.json({ ...result, message: result.added ? 'COUNTED. SUBSCRIPTION PRONOUNCED DEAD.' : 'ALREADY COUNTED FROM THIS NETWORK.' }, { status: result.added ? 201 : 200 });
};
