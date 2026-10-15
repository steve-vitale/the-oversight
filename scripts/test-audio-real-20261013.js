#!/usr/bin/env node
/**
 * Proof test: audio-real replacements (2026-10-13).
 *
 * Verifies:
 *  1. Every registry entry with placeholder:false has a file that exists and is non-silent.
 *  2. Every replaced file has an ATTRIBUTION.md entry with source URL + license.
 *  3. No placeholder:true entry points at a real recording, and no placeholder:false
 *     entry points at a missing/silent file (no mismatches either direction).
 *
 * RED-verify: run against pristine tree (git stash) — must FAIL (placeholders true,
 * files missing). Run against worktree — must PASS.
 *
 * Usage: node scripts/test-audio-real-20261013.js [--red]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RED = process.argv.includes('--red');

let failures = [];
function fail(msg) { failures.push(msg); console.log('  FAIL: ' + msg); }
function ok(msg) { console.log('  ok: ' + msg); }

// Load registry fresh.
delete require.cache[require.resolve('../src/js/audio-registry.js')];
const R = require('../src/js/audio-registry.js');

function isSilentMp3(file) {
  // Decode to raw PCM and check peak amplitude (reliable; volumedetect has
  // quirks on some files). Returns null if OK, string reason if bad.
  try {
    const out = execSync(
      `ffmpeg -v error -i "${file}" -ac 1 -ar 44100 -f s16le -`,
      { encoding: 'buffer', timeout: 30000, maxBuffer: 64 * 1024 * 1024 });
    if (!out.length) return 'decoded zero bytes';
    let peak = 0;
    for (let i = 0; i + 1 < out.length; i += 2) {
      let v = out.readInt16LE(i);
      const a = v < 0 ? -v : v;
      if (a > peak) peak = a;
    }
    if (peak < 100) return `silent (peak ${peak}/32767)`;
    return null;
  } catch (e) {
    return 'decode failed: ' + e.message.slice(0, 80);
  }
}

function attrFiles() {
  // Map: audio file path -> {url, license} from ATTRIBUTION.md files.
  const map = {};
  const attrPaths = [
    'src/audio/signatures/ATTRIBUTION.md',
    'src/audio/weapons/ATTRIBUTION.md',
    'src/audio/wave2/ATTRIBUTION.md',
    'src/audio/animals/ATTRIBUTION.md',
  ];
  for (const ap of attrPaths) {
    const full = path.join(ROOT, ap);
    if (!fs.existsSync(full)) { fail('missing ' + ap); continue; }
    const text = fs.readFileSync(full, 'utf8');
    // Entries look like: ## filename.mp3 — label\n- Source: URL\n... - License: X
    // Multi-file entries: ## a.mp3, b.mp3 — label (each file gets the entry).
    const entries = text.split(/^## /m).slice(1);
    for (const e of entries) {
      const header = e.split('\n')[0];
      const fns = header.split(' — ')[0].split(',').map(s => s.trim()).filter(Boolean);
      const srcM = e.match(/^-[ ]Sources?:\s*(.+)$/m);
      const licM = e.match(/^-[ ]License:\s*(.+)$/m);
      // Also handle "- Sources:" followed by bulleted URLs.
      let url = srcM ? srcM[1].trim() : null;
      if (/^-[ ]Sources?:\s*$/m.test(e)) {
        const b = e.match(/^-[ ]Sources?:\s*\n((?:\s+- https?:\/\/[^\n]+\n?)+)/m);
        if (b) url = b[1].trim().split('\n')[0].replace(/^\s*-\s*/, '');
      }
      const dir = path.posix.dirname(ap);
      for (const fn of fns) {
        const key = path.posix.join(dir, fn);
        map[key] = {
          url: url,
          license: licM ? licM[1].trim() : null,
        };
      }
    }
  }
  return map;
}

console.log('=== audio-real proof test (2026-10-13)' + (RED ? ' [RED MODE]' : '') + ' ===');
const attr = attrFiles();

let checkedFalse = 0, checkedTrue = 0;

function checkEntry(kind, key, entry) {
  const files = entry.files || (entry.file ? [entry.file] : []);
  const ph = entry.placeholder;
  if (ph === false) {
    checkedFalse++;
    if (!files.length) { fail(`${kind}.${key}: placeholder:false but no files`); return; }
    for (const f of files) {
      const full = path.join(ROOT, f);
      if (!fs.existsSync(full)) {
        fail(`${kind}.${key}: placeholder:false but missing file ${f}`);
        continue;
      }
      const silent = isSilentMp3(full);
      if (silent) { fail(`${kind}.${key}: ${f} is silent (${silent})`); continue; }
      // Attribution check.
      const a = attr[f];
      if (!a) { fail(`${kind}.${key}: ${f} has no ATTRIBUTION.md entry`); continue; }
      if (!a.url || !/^https?:\/\//.test(a.url)) {
        fail(`${kind}.${key}: ${f} attribution missing URL`); continue;
      }
      if (!a.license) { fail(`${kind}.${key}: ${f} attribution missing license`); continue; }
      ok(`${kind}.${key}: ${f} exists, non-silent, attributed (${a.license})`);
    }
  } else {
    checkedTrue++;
    // placeholder:true: file should be the original synth (unmodified from HEAD)
    // or missing (documented gap). A modified non-silent file here means someone
    // replaced the audio but forgot to flip the flag.
    for (const f of files) {
      const full = path.join(ROOT, f);
      if (fs.existsSync(full)) {
        try {
          const st = execSync(`git status --short -- "${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
          // ' M' = modified in worktree. New files ('??') with placeholder:true
          // are also wrong (real recording added but flag not flipped).
          if (st.startsWith('M') || st.startsWith('??')) {
            const silent = isSilentMp3(full);
            if (!silent) {
              fail(`${kind}.${key}: placeholder:true but ${f} differs from HEAD and is non-silent (real recording? flag not flipped)`);
            }
          }
        } catch (e) { /* git check best-effort */ }
      }
    }
  }
}

for (const [k, v] of Object.entries(R.signatures)) checkEntry('sig', k, v);
for (const [k, v] of Object.entries(R.weapons)) checkEntry('weap', k, v);
for (const [k, v] of Object.entries(R.animals)) checkEntry('animal', k, v);
if (R.wave2) for (const [k, v] of Object.entries(R.wave2)) checkEntry('wave2', k, v);

// resolveHook spot checks.
console.log('-- resolveHook spot checks --');
const hooks = ['bufferStall', 'weaponSwing', 'staticCry', 'boarNotice'];
for (const h of hooks) {
  const r = R.resolveHook(h);
  if (!r) { fail(`resolveHook(${h}) returned null`); continue; }
  ok(`resolveHook(${h}) -> kind=${r.kind} placeholder=${r.placeholder}`);
}

console.log(`\nchecked: ${checkedFalse} placeholder:false, ${checkedTrue} placeholder:true entries`);
if (failures.length) {
  console.log(`\nRESULT: FAIL (${failures.length} failures)`);
  process.exit(1);
} else {
  console.log('\nRESULT: PASS');
}
