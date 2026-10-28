#!/usr/bin/env node
// scripts/test-lingerer-vis-proof.js — sim-lingerer-vis-a proof test.
// NON-JUDGED except for construction facts it pins:
//  (1) the visibility clause exists in src/js/havenGrowth.js, gated on
//      palisade + post-toll wound, appended to the SAME say call as the
//      "Nobody met" linger-birth line (no new say, no RNG, no state
//      write in the added code);
//  (2) the original "Nobody met" sentence is otherwise byte-identical
//      (the clause is an append, not a rewrite);
//  (3) gorgedrive composes over tableseat-nowait: withGorgeDrive builds,
//      GORGEDRIVE unset delegates (layerOn false), GORGEDRIVE=1 arms it
//      (layerOn true). Composition is PROVEN here; it is NOT judged in
//      the sweep (see prereg: judged bands stay substrate-verbatim).
// RED on control code (clause absent) by design; GREEN on armed code.
// Usage: node scripts/test-lingerer-vis-proof.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
let fails = 0;
function ok(cond, name) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name);
  if (!cond) fails++;
}
const src = fs.readFileSync(path.join(REPO, 'src/js', 'havenGrowth.js'), 'utf8');
const CLAUSE = 'The stakes cut it on the way over the wall';
ok(src.includes(CLAUSE), 'clause present in havenGrowth.js');
ok(src.includes('it carries the wound at the treeline'), 'clause tail present');
ok(src.includes("Nobody met ${this.articlePhrase(mname(m))}"), 'original Nobody-met line present');
// Gate: the clause append must sit under a palisade + hp<maxHp condition
// in the same defenders-loop else-branch. Check adjacency, not line nos.
const idx = src.indexOf(CLAUSE);
const window = idx >= 0 ? src.slice(Math.max(0, idx - 600), idx + 300) : '';
ok(/palisade/.test(window) && /m\.hp\s*<\s*m\.maxHp/.test(window), 'clause gated on palisade + hp<maxHp nearby');
// No new say call for the clause: the clause string must NOT appear as
// its own this.say(...) argument start.
ok(!/this\.say\(`[^`]*The stakes cut it/.test(src), 'clause is an append, not a new say call');
// Gorgedrive composability (non-judged construction fact).
const gd = require('./policies/gorgedrive');
const ts = require('./policies/tableseat-nowait');
ok(typeof gd.withGorgeDrive === 'function', 'withGorgeDrive exported');
const composed = gd.withGorgeDrive(ts.tableseatNowait, 'test-gorge-compose', 'proof only');
ok(composed && typeof composed.daily === 'function', 'withGorgeDrive(tableseatNowait) builds with daily');
const saved = process.env.GORGEDRIVE;
try {
  delete process.env.GORGEDRIVE;
  ok(!gd.layerOn(), 'gorgedrive layer OFF when GORGEDRIVE unset');
  process.env.GORGEDRIVE = '1';
  ok(gd.layerOn(), 'gorgedrive layer ON when GORGEDRIVE=1');
} finally {
  if (saved === undefined) delete process.env.GORGEDRIVE; else process.env.GORGEDRIVE = saved;
}
console.log(fails ? `PROOF FAILED: ${fails} failure(s)` : 'PROOF GREEN');
process.exit(fails ? 1 : 0);
