const USERNAME = 'SYG&NEO';
const REALM = 'SYG';
const COOKIE_NAME = 'syg_access';
const DEFAULT_NEXT = '/syg/';

function isProtectedPath(pathname) {
  return pathname === '/syg'
    || pathname === '/syg/'
    || pathname === '/syg/index.html'
    || pathname === '/syg.index'
    || pathname.startsWith('/syg/');
}

function isLoginPath(pathname) {
  return pathname === '/syg-login' || pathname === '/syg-login.html';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function sanitizeNext(value) {
  if (!value) return DEFAULT_NEXT;

  try {
    const url = new URL(value, 'https://darynfillis.com');
    if (url.origin !== 'https://darynfillis.com') return DEFAULT_NEXT;
    if (!isProtectedPath(url.pathname)) return DEFAULT_NEXT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_NEXT;
  }
}

function parseCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const parts = cookie.split(';');
  for (const part of parts) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (rawName === name) return decodeURIComponent(rawValue.join('='));
  }
  return '';
}

async function accessToken(password) {
  const input = new TextEncoder().encode(`${USERNAME}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', input);
  let binary = '';
  for (const byte of new Uint8Array(digest)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function equalToken(actual, expected) {
  if (!actual || actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function redirectToLogin(request) {
  const url = new URL(request.url);
  const next = encodeURIComponent(`${url.pathname}${url.search}${url.hash}`);
  return Response.redirect(`${url.origin}/syg-login?next=${next}`, 303);
}

function signInPage({ error = false, next = DEFAULT_NEXT } = {}) {
  const safeNext = escapeHtml(sanitizeNext(next));
  const errorBlock = error
    ? '<div class="error" role="alert">That sign-in did not match. Try again.</div>'
    : '';

  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>SYG + NEO Sign In | Daryn Fillis</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #071b33;
      --ink: #10243a;
      --body: #536273;
      --blue: #5bcbf5;
      --blue-dark: #1686b8;
      --surface: #f5f8fb;
      --white: #fff;
      --rule: rgba(12, 31, 52, 0.12);
      --shadow: 0 24px 70px rgba(7, 27, 51, 0.18);
      --font: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: var(--font);
      color: var(--ink);
      background: linear-gradient(180deg, #f7fbfe 0%, #eef5fa 100%);
      display: grid;
      place-items: center;
      padding: 28px;
    }

    .shell {
      width: min(100%, 980px);
      min-height: 620px;
      display: grid;
      grid-template-columns: minmax(0, 0.95fr) minmax(360px, 0.82fr);
      background: var(--white);
      border: 1px solid var(--rule);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .brand {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: clamp(34px, 5vw, 58px);
      background: var(--navy);
      color: var(--white);
      overflow: hidden;
    }

    .brand::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(135deg, rgba(91, 203, 245, 0.15), transparent 42%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 55%);
      pointer-events: none;
    }

    .brand > * { position: relative; z-index: 1; }

    .mark {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.82);
    }

    .mark span {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: var(--blue);
      box-shadow: 0 0 18px rgba(91, 203, 245, 0.9);
    }

    h1 {
      margin: 44px 0 18px;
      max-width: 520px;
      font-size: clamp(2.15rem, 5vw, 4rem);
      line-height: 1.02;
      letter-spacing: -0.04em;
      font-weight: 800;
    }

    h1 em {
      color: var(--blue);
      font-style: normal;
    }

    .brand p {
      max-width: 480px;
      margin: 0;
      color: rgba(255, 255, 255, 0.66);
      font-size: 1rem;
      line-height: 1.85;
      font-weight: 200;
    }

    .foot {
      margin-top: 40px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.46);
    }

    .panel {
      display: flex;
      align-items: center;
      padding: clamp(30px, 5vw, 56px);
      background: var(--white);
    }

    form { width: 100%; }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--blue-dark);
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    h2 {
      margin: 0 0 10px;
      color: var(--navy);
      font-size: clamp(1.65rem, 3vw, 2.15rem);
      line-height: 1.08;
      letter-spacing: -0.03em;
      font-weight: 800;
    }

    .hint {
      margin: 0 0 28px;
      color: var(--body);
      font-size: 0.92rem;
      line-height: 1.7;
      font-weight: 200;
    }

    label {
      display: block;
      margin: 0 0 8px;
      color: var(--navy);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .identity {
      min-height: 50px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 14px 15px;
      border: 1px solid var(--rule);
      border-radius: 6px;
      background: var(--surface);
      color: var(--navy);
      font-size: 0.94rem;
      font-weight: 800;
    }

    input[type="password"] {
      width: 100%;
      min-height: 52px;
      border: 1px solid var(--rule);
      border-radius: 6px;
      padding: 14px 15px;
      font-family: var(--font);
      font-size: 1rem;
      color: var(--ink);
      background: var(--white);
      box-shadow: 0 10px 30px rgba(7, 27, 51, 0.06);
    }

    input[type="password"]:focus {
      outline: 2px solid var(--blue);
      outline-offset: 2px;
      border-color: var(--blue-dark);
    }

    button {
      width: 100%;
      min-height: 52px;
      margin-top: 18px;
      border: 0;
      border-radius: 6px;
      background: var(--blue);
      color: var(--navy);
      font-family: var(--font);
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 14px 30px rgba(22, 134, 184, 0.22);
    }

    button:hover { filter: brightness(0.98); transform: translateY(-1px); }

    .error {
      margin: 0 0 18px;
      padding: 12px 14px;
      border-radius: 6px;
      border: 1px solid rgba(180, 38, 38, 0.22);
      background: rgba(180, 38, 38, 0.08);
      color: #8a1f1f;
      font-size: 0.86rem;
      line-height: 1.5;
      font-weight: 600;
    }

    .meta {
      margin-top: 18px;
      color: var(--body);
      font-size: 0.76rem;
      line-height: 1.6;
      font-weight: 200;
    }

    .meta a { color: var(--blue-dark); font-weight: 600; text-decoration: none; }

    @media (max-width: 820px) {
      body { padding: 16px; }
      .shell { grid-template-columns: 1fr; min-height: auto; }
      .brand { min-height: 360px; }
      .panel { padding: 32px 24px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="brand" aria-label="SYG and NEO private workspace">
      <div>
        <div class="mark"><span></span>Daryn Fillis</div>
        <h1>Private access for <em>SYG + NEO.</em></h1>
        <p>A focused workspace for shared strategy, notes, and private collaboration.</p>
      </div>
      <div class="foot">Secure workspace</div>
    </section>
    <section class="panel" aria-label="Sign in">
      <form method="post" action="/syg-login" autocomplete="on">
        <input type="hidden" name="next" value="${safeNext}">
        <p class="eyebrow">Sign in</p>
        <h2>Welcome back.</h2>
        <p class="hint">Enter the shared access password to continue.</p>
        ${errorBlock}
        <label>Access name</label>
        <div class="identity">SYG&amp;NEO</div>
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
        <button type="submit">Continue</button>
        <p class="meta"><a href="/">Return home</a></p>
      </form>
    </section>
  </main>
</body>
</html>`, {
    status: error ? 401 : 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

async function handleLogin(request) {
  const url = new URL(request.url);
  const next = sanitizeNext(url.searchParams.get('next'));

  if (request.method === 'GET' || request.method === 'HEAD') {
    return signInPage({ next });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const password = Netlify.env.get('SYG_BASIC_AUTH_PASSWORD');
  if (!password) return signInPage({ error: true, next });

  const form = await request.formData();
  const suppliedPassword = String(form.get('password') || '');
  const suppliedNext = sanitizeNext(String(form.get('next') || next));

  if (suppliedPassword !== password) {
    return signInPage({ error: true, next: suppliedNext });
  }

  const token = await accessToken(password);
  const headers = new Headers({
    Location: suppliedNext,
    'Cache-Control': 'no-store'
  });
  headers.append('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`);

  return new Response(null, { status: 303, headers });
}

export default async function handler(request, context) {
  const { pathname } = new URL(request.url);

  if (isLoginPath(pathname)) {
    return handleLogin(request);
  }

  const password = Netlify.env.get('SYG_BASIC_AUTH_PASSWORD');
  if (!password) return redirectToLogin(request);

  const expected = await accessToken(password);
  const actual = parseCookie(request, COOKIE_NAME);

  if (!equalToken(actual, expected)) return redirectToLogin(request);
  return context.next();
}

export const config = {
  path: ['/syg', '/syg/', '/syg/index.html', '/syg.index', '/syg/*', '/syg-login', '/syg-login.html']
};
