#!/usr/bin/env node
// PROOF (journey social r167, 2026-11-10): no-words agree pools are 4 phrases
// deep, so long no-words sittings cycle the same foreign phrase (r163 open
// item 1; r167 panel: Wanjiru/Swahili + Dmitri/Russian cycled their 4-phrase
// agree pools within one sitting, flagged as same-phrase/different-nod
// near-dups; Sigrun/Tariq drew 35/32 foreign lines in one seed).
// FIX (data only, src/data/foreignSpeech.json): every language's `agree`
// pool widens 4 -> 8 with 4 new short agreement utterances (new English
// meanings: "I agree with you." / "That's true. Absolutely true." /
// "Well said. Exactly right." / "Yes, I feel the same way."). No code
// change; convoPickCycle handles any pool length, reshuffling only after
// all 8 are used.
// RED (pre-fix): each agree pool has 4 entries (the committed
// foreignSpeech-before-r167.json backup shows 4).
// GREEN (post-fix): all 25 languages have 8 agree entries, all `t`
// distinct within a language, every kw key appears in its `t`, every
// entry has exactly {en, kw, t}.
// Usage: node scripts/test-journey-social-r167-agree.js
'use strict';
const fs = require('fs');
const path = require('path');

let failures = 0;
function check(label, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + label + (detail ? ' :: ' + detail : ''));
  if (!cond) failures++;
}

function main() {
  const p = path.join(__dirname, '..', 'src', 'data', 'foreignSpeech.json');
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const langs = Object.keys(d).filter(k => !k.startsWith('_'));
  check('25 languages present (all pools widened, none missed)', langs.length === 25,
    'langs=' + langs.length);
  const EXPECTED_EN = [
    'I agree with you.',
    "That's true. Absolutely true.",
    'Well said. Exactly right.',
    'Yes, I feel the same way.',
  ];
  for (const lang of langs) {
    const pool = (d[lang] || {}).agree || [];
    check(lang + ': agree pool has 8 entries', pool.length === 8, 'len=' + pool.length);
    const ts = pool.map(e => e.t);
    check(lang + ': all 8 native texts distinct', new Set(ts).size === 8,
      'distinct=' + new Set(ts).size);
    const ens = pool.map(e => e.en);
    check(lang + ': the 4 new English meanings are present',
      EXPECTED_EN.every(en => ens.includes(en)),
      'missing=' + EXPECTED_EN.filter(en => !ens.includes(en)).join(' | '));
    let kwBad = [];
    for (const e of pool) {
      if (!e || typeof e !== 'object' || Object.keys(e).sort().join(',') !== 'en,kw,t') kwBad.push('shape:' + JSON.stringify(e).slice(0, 40));
      for (const k of Object.keys(e.kw || {})) if (!String(e.t || '').includes(k)) kwBad.push('kw ' + k + ' not in t ' + e.t);
    }
    check(lang + ': every entry is {en,kw,t} and every kw key appears in its t',
      kwBad.length === 0, kwBad.slice(0, 3).join(' | '));
  }
  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main();
