#!/usr/bin/env node
'use strict';
// Gap-playtest9 leg (b) PROOF: journal lines carry no raw markdown.
// 1) Drive codexLearnAbility through levels 1/2/3 for a real ability and
//    assert the spoken Journal/Codex lines contain no '**'.
// 2) Census the whole runtime source: no '**' literal remains in src/js.
// Run: node scripts/test-gap-playtest9-journal.js [seed]
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const seed = Number(process.argv[2] || 42);
let failures = 0;
function note(ok, label, extra) {
  console.log((ok ? 'PASS ' : 'FAIL ') + label + (extra !== undefined ? ' :: ' + extra : ''));
  if (!ok) failures++;
}
function logTexts(G) {
  return (G.log || []).map(e => (e && typeof e === 'object') ? (e.text || '') : String(e || ''));
}
(async () => {
  const { Game: G, loadFails } = await loadGame({ seed, narration: true });
  if (loadFails.length) { console.log('LOAD FAILS', loadFails); process.exit(2); }
  await setupGame(G);
  const def = (G.data.abilities || []).find(a => a && a.name && a.description);
  note(!!def, 'a real ability def exists to learn', def && def.id);
  if (def) {
    G.log = [];
    for (const lvl of [1, 2, 3]) {
      const ok = G.codexLearnAbility(def.id, lvl, 'test');
      note(ok === true, `codexLearnAbility level ${lvl} raises`, `ok=${ok}`);
    }
    const lines = logTexts(G).filter(t => /Journal|Codex/.test(t));
    console.log('journal lines:');
    for (const l of lines) console.log('  ' + JSON.stringify(l));
    note(lines.length === 3, 'all three journal lines spoken', `n=${lines.length}`);
    note(lines.every(l => !l.includes('**')), 'no journal line contains raw ** markdown', lines.join(' | '));
    note(lines.some(l => /UNDERSTAND/.test(l) && l.includes(def.name)), 'UNDERSTAND line names the ability in plain text',
      lines.find(l => /UNDERSTAND/.test(l)) || '(none)');
  }
  // Source census: '**' must not appear anywhere under src/js.
  const srcDir = path.join(__dirname, '..', 'src', 'js');
  const hits = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith('.js')) {
        const text = fs.readFileSync(p, 'utf8');
        const idx = text.indexOf('**');
        if (idx !== -1) hits.push(p + ':' + text.slice(Math.max(0, idx - 40), idx + 40).replace(/\n/g, ' '));
      }
    }
  };
  walk(srcDir);
  console.log('src/js ** census hits:', hits.length, hits.slice(0, 5));
  note(hits.length === 0, 'no ** literal remains in src/js', hits.join(' ; '));
  console.log(failures ? `JOURNAL PROOF: ${failures} failing check(s)` : 'JOURNAL PROOF: all checks pass');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e && e.stack || e); process.exit(2); });
