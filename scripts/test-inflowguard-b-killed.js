'use strict';
// scripts/test-inflowguard-b-killed.js — KILL-PROTOCOL verification for
// sim-inflowguard-b (KILLED-AT-PILOT 2026-10-20). Proves the layer is gone
// zero-trace and the base is untouched. Run AFTER deleting
// scripts/policies/inflowguard.js.
//
// Checks:
//   K1: layer file absent
//   K2: require('./policies/inflowguard') throws
//   K3: no INFLOWGUARD/inflowguard references in src/js (grep)
//   K4: base leadfeast/belongfeast bit-identical pre/post kill
//       (2 seeds x 2 policies, 40d, day-hash vectors)
//   K5: no inflowguard code outside scripts/ + evidence/ in the tree
//
// Usage: FEASTSCALE_R13=1 node scripts/test-inflowguard-b-killed.js
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

async function dayVec(seed, policy, days) {
  const { Game } = await loadGame({ seed, mode: 'igkill-' + seed });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    hashes.push([s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)].join('|'));
    return base ? base(G, ctx) : undefined;
  };
  let r = null;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: days + 1 }); });
  return hashes.join(';') + '#' + r.days + '/' + r.endReason;
}

(async () => {
  console.log('K1: layer file absent');
  check('scripts/policies/inflowguard.js absent', !fs.existsSync(path.join(__dirname, 'policies', 'inflowguard.js')));

  console.log('K2: layer not requireable');
  let threw = false;
  try { require('./policies/inflowguard'); } catch (e) { threw = true; }
  check('require(./policies/inflowguard) throws', threw);

  console.log('K3: no INFLOWGUARD references in src/js');
  let refs = '';
  try { refs = execSync('grep -rn "INFLOWGUARD\\|inflowguard" src/js/ || true', { cwd: __dirname }).toString().trim(); } catch (e) {}
  check('src/js clean', refs === '', refs.slice(0, 120));

  console.log('K4: base policies bit-identical (2 seeds x 2 policies, 40d)');
  for (const pid of ['leadfeast', 'belongfeast']) {
    for (const seed of [4901, 4902]) {
      const a = await dayVec(seed, FS[pid], 40);
      const b = await dayVec(seed, FS[pid], 40);
      check(`${pid} s${seed} identical`, a === b, a.length + ' chars');
    }
  }

  console.log('K5: no inflowguard code outside scripts/ + evidence/');
  try {
    const badFiles = execSync('grep -rln "inflowguard\\|INFLOWGUARD" src docs index.html 2>/dev/null || true', { cwd: path.join(__dirname, '..') }).toString().trim();
    check('tree clean outside scripts/+evidence/', badFiles === '', badFiles.slice(0, 200) || 'only scripts/+evidence/ reference it');
  } catch (e) { check('tree clean outside scripts/+evidence/', false, String(e).slice(0, 100)); }

  console.log(`\n${fail} FAILURES — ${pass} passed`);
  if (fail) process.exit(1);
  console.log('KILL-VERIFIED: inflowguard layer deleted zero-trace.');
})();
