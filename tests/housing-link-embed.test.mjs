import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('Sell with Intention can be framed by Housing Link without opening the rest of the site', async () => {
  const source = await readFile(
    new URL('../netlify/edge-functions/housing-link-embed.js', import.meta.url),
    'utf8'
  );

  assert.match(source, /headers\.delete\('x-frame-options'\)/);
  assert.match(source, /frame-ancestors 'self'/);
  assert.match(source, /https:\/\/housing\.link/);
  assert.match(source, /'\/sell-with-intention'/);
  assert.match(source, /'\/sell-with-intention\.html'/);
});
