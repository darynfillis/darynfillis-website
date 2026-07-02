const USERNAME = 'SYG&NEO';
const REALM = 'SYG';

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
      'Cache-Control': 'no-store'
    }
  });
}

export default async function handler(request, context) {
  const password = Netlify.env.get('SYG_BASIC_AUTH_PASSWORD');
  if (!password) return unauthorized();

  const expected = `Basic ${btoa(`${USERNAME}:${password}`)}`;
  const actual = request.headers.get('authorization') || '';

  if (actual !== expected) return unauthorized();
  return context.next();
}

export const config = {
  path: ['/syg', '/syg/', '/syg/index.html', '/syg.index', '/syg/*']
};
