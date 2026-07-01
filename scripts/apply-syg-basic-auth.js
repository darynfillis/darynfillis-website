const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const HEADERS_FILE = path.join(ROOT, '_headers');
const START_MARKER = '# BEGIN generated /syg basic auth';
const END_MARKER = '# END generated /syg basic auth';
const DEFAULT_USER = 'daryn';

function stripExistingBlock(content) {
  const pattern = new RegExp(`\n?${START_MARKER}[\s\S]*?${END_MARKER}\n?`, 'g');
  return content.replace(pattern, '\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}

function validateCredential(name, value) {
  if (!value) return;
  if (/\s/.test(value)) {
    throw new Error(`${name} cannot contain whitespace for Netlify Basic-Auth headers.`);
  }
}

function main() {
  const user = process.env.SYG_BASIC_AUTH_USER || DEFAULT_USER;
  const password = process.env.SYG_BASIC_AUTH_PASSWORD;

  validateCredential('SYG_BASIC_AUTH_USER', user);
  validateCredential('SYG_BASIC_AUTH_PASSWORD', password);

  let headers = fs.existsSync(HEADERS_FILE) ? fs.readFileSync(HEADERS_FILE, 'utf8') : '';
  headers = stripExistingBlock(headers);

  if (!password) {
    if (process.env.NETLIFY === 'true') {
      throw new Error('SYG_BASIC_AUTH_PASSWORD must be set in Netlify before deploying /syg password protection.');
    }
    fs.writeFileSync(HEADERS_FILE, `${headers}\n`);
    console.warn('SYG_BASIC_AUTH_PASSWORD is not set; skipped /syg password protection locally.');
    return;
  }

  const authRule = `${START_MARKER}
/syg
  Basic-Auth: ${user}:${password}

/syg/
  Basic-Auth: ${user}:${password}

/syg/*
  Basic-Auth: ${user}:${password}
${END_MARKER}`;

  fs.writeFileSync(HEADERS_FILE, `${headers}\n\n${authRule}\n`);
  console.log('/syg Basic-Auth rules generated.');
}

main();
