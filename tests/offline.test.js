import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const ROOT_JS = [
  'app.js',
  'audio.js',
  'core.js',
  'data.js',
  'draw.js',
  'minigames.js',
  'icons.js',
  'pwa.js',
];

const FIXED = [
  'index.html',
  'style.css',
  'icon.svg',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest',
];

function walk(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.isFile()) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function expectedEntries() {
  const entries = [];
  for (const name of [...FIXED, ...ROOT_JS]) {
    if (existsSync(path.join(root, name))) entries.push(name);
  }
  entries.push(...walk(path.join(root, 'assets')).map((p) => `assets/${p}`));
  return new Set(entries);
}

test('precache.json matches the runtime files actually on disk', () => {
  const raw = readFileSync(path.join(root, 'precache.json'), 'utf8');
  const listed = new Set(JSON.parse(raw));
  const expected = expectedEntries();

  const missing = [...expected].filter((f) => !listed.has(f));
  const extra = [...listed].filter((f) => !expected.has(f));

  assert.deepEqual(missing, [], `precache.json is missing files: ${missing.join(', ')}`);
  assert.deepEqual(
    extra,
    [],
    `precache.json lists files that no longer exist: ${extra.join(', ')}`
  );
});

test('precache.json entries are all relative (no leading slash) and files exist', () => {
  const listed = JSON.parse(readFileSync(path.join(root, 'precache.json'), 'utf8'));
  for (const entry of listed) {
    assert.ok(!entry.startsWith('/'), `entry should be relative: ${entry}`);
    assert.ok(existsSync(path.join(root, entry)), `listed file does not exist: ${entry}`);
    assert.ok(statSync(path.join(root, entry)).isFile(), `listed entry is not a file: ${entry}`);
  }
});

test('manifest.webmanifest parses and its icons exist on disk', () => {
  const raw = readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8');
  const manifest = JSON.parse(raw);
  assert.equal(manifest.name, 'Doctor Ayden to the Rescue!');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
  for (const icon of manifest.icons) {
    assert.ok(existsSync(path.join(root, icon.src)), `manifest icon missing: ${icon.src}`);
  }
});
