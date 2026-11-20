const PASSWORD_ENV = 'MMS_ACCESS_PASSWORD';
const COOKIE_NAME = 'mms_access';
const DEFAULT_NEXT = '/MMS/';
const SESSION_MAX_AGE = 60 * 60 * 24;

function isProtectedPath(pathname) {
  const path = pathname.toLowerCase();
  return path === '/mms' || path === '/mms/' || path === '/mms/index.html' || path.startsWith('/mms/');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeNext(value) {
  try {
    const url = new URL(value || DEFAULT_NEXT, 'https://darynfillis.com');
    return url.origin === 'https://darynfillis.com' && isProtectedPath(url.pathname)
      ? `${url.pathname}${url.search}${url.hash}`
      : DEFAULT_NEXT;
  } catch {
    return DEFAULT_NEXT;
  }
}

function parseCookie(request) {
  for (const item of (request.headers.get('cookie') || '').split(';')) {
    const [name, ...value] = item.trim().split('=');
    if (name === COOKIE_NAME) return decodeURIComponent(value.join('='));
  }
  return '';
}

async function tokenFor(password) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function tokenMatches(actual, expected) {
  if (!actual || actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}

function loginPage({ error = false, next = DEFAULT_NEXT } = {}) {
  const errorMessage = error ? '<p class="error" role="alert">That password did not match. Try again.</p>' : '';
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>MMS — Private access</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap" rel="stylesheet">
<style>:root{--navy:#0A2540;--green:#00d46e;--surface:#f5f8fb;--body:#4a5568}*{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#004733,#0A2540);font-family:Montserrat,system-ui,sans-serif;color:var(--navy)}main{width:min(100%,540px);padding:clamp(32px,7vw,64px);background:#fff;box-shadow:0 24px 72px rgba(0,0,0,.25)}.mark{margin:0 0 36px;color:#017a4e;font-size:.8rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{margin:0 0 12px;font-size:clamp(2rem,5vw,3rem);line-height:1.04;letter-spacing:-.045em}p{color:var(--body);line-height:1.65}label{display:block;margin-top:28px;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}input{width:100%;min-height:54px;margin-top:8px;padding:12px;border:1px solid #cbd5df;font:inherit}input:focus{outline:3px solid rgba(0,212,110,.3);border-color:#017a4e}button{width:100%;min-height:54px;margin-top:18px;border:0;background:var(--navy);color:#fff;font:inherit;font-weight:800;cursor:pointer}.error{padding:12px 14px;background:#fff0f0;color:#8a1f1f}.home{display:block;margin-top:22px;color:#017a4e;font-size:.9rem;text-decoration:none}</style></head>
<body><main><p class="mark">MyMortgageSTUDIO × Better</p><h1>Private access.</h1><p>This page is shared for a focused conversation about MMS, the deployment mandate, and the operating model.</p>${errorMessage}<form method="post" action="/mms-login"><input type="hidden" name="next" value="${escapeHtml(sanitizeNext(next))}"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button type="submit">Continue</button></form><a class="home" href="/">Return home</a></main></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, status: error ? 401 : 200 });
}

function redirectToLogin(request) {
  const url = new URL(request.url);
  return Response.redirect(`${url.origin}/mms-login?next=${encodeURIComponent(`${url.pathname}${url.search}${url.hash}`)}`, 303);
}

async function handleLogin(request) {
  const url = new URL(request.url);
  const next = sanitizeNext(url.searchParams.get('next'));
  if (request.method === 'GET' || request.method === 'HEAD') return loginPage({ next });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { 'Cache-Control': 'no-store' } });
  const password = Netlify.env.get(PASSWORD_ENV);
  const form = await request.formData();
  const requestedNext = sanitizeNext(String(form.get('next') || next));
  if (!password || String(form.get('password') || '') !== password) return loginPage({ error: true, next: requestedNext });
  const token = await tokenFor(password);
  return new Response(null, { status: 303, headers: { Location: requestedNext, 'Cache-Control': 'no-store', 'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Lax` } });
}

export default async function handler(request, context) {
  const { pathname } = new URL(request.url);
  if (pathname.toLowerCase() === '/mms-login' || pathname.toLowerCase() === '/mms-login.html') return handleLogin(request);
  const password = Netlify.env.get(PASSWORD_ENV);
  if (!password) return redirectToLogin(request);
  return tokenMatches(parseCookie(request), await tokenFor(password)) ? context.next() : redirectToLogin(request);
}

export const config = { path: ['/MMS', '/MMS/', '/MMS/index.html', '/MMS/*', '/mms', '/mms/', '/mms/*', '/mms-login', '/mms-login.html'] };
