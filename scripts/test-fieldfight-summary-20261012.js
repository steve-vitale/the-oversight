// FIELDFIGHT SUMMARY HONESTY (longsim wave lever r4, 2026-10-12).
// fieldFightSummary feeds awayNews — the village's kill gossip. Sense-find:
// a vFlee with vTaken 0 narrated "mauled X (-0 health)" — a mauling that
// did no damage is a lie. A villager who fled unharmed gets an honest line.
// Usage: node scripts/test-fieldfight-summary-20261012.js [SEED] — run x3 seeds.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

global.Scattering = { Game: {} };
eval(fs.readFileSync(path.join(ROOT, 'src/js/fieldFights.js'), 'utf8'));
const G = global.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

const S = (rec, v, m) => G.fieldFightSummary(rec, v, m);

// 1. the lie: vFlee with no damage taken
const zero = S({ outcome: 'vFlee', rounds: 1, vTaken: 0 }, 'James', 'Highbeam Deer');
ok('vFlee vTaken=0 has no "-0 health"', !/-0 health/.test(zero), zero);
ok('vFlee vTaken=0 does not say "mauled"', !/mauled/i.test(zero), zero);
ok('vFlee vTaken=0 says unharmed/got clear', /unharmed|got clear|missed/i.test(zero), zero);

// 2. real mauling unchanged
const maul = S({ outcome: 'vFlee', rounds: 2, vTaken: 73 }, 'James', 'The Heckler');
ok('vFlee vTaken=73 keeps the mauling line', /mauled James \(-73 health\) over 2 rounds/.test(maul), maul);

// 3. other outcomes untouched
ok('vKill unchanged', S({ outcome: 'vKill', rounds: 2, vTaken: 26 }, 'Marcus', 'Hushpuppy') === 'Marcus killed the Hushpuppy alone — 2 rounds, 26 taken. Word travels fast.');
ok('vDie unchanged', S({ outcome: 'vDie', rounds: 1 }, 'Ursula', 'Highbeam Deer') === 'The Highbeam Deer killed Ursula in 1 round. The village mourns.');
ok('mFlee unchanged', S({ outcome: 'mFlee', rounds: 2 }, 'James', 'Lockpick') === 'James stood down the Lockpick and kept walking — 2 rounds, bloodied but breathing.');
ok('alreadyDead unchanged', /already dead/.test(S({ outcome: 'alreadyDead', rounds: 1 }, 'James', 'Hushpuppy')));

// 4. round grammar
ok('1 round singular', /1 round[,\.]/.test(zero) || /1 round /.test(zero), zero);
ok('2 rounds plural', /2 rounds/.test(maul), maul);

// 5. no double article
const art = S({ outcome: 'vFlee', rounds: 2, vTaken: 10 }, 'James', 'The Loud Beast');
ok('no "The The"', !/the the/i.test(art), art);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
