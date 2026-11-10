#!/usr/bin/env node
// test-m2b-scholar-open-r171.js — proof test for the r171 M2b fix.
//
// DEFECT (r171 pilot, seed 89702 day 56): three reunion fights in which
// the SCHOLAR died read outcome=otherEnd, diedParty=[] (diedInFight=[]),
// scholarDiedInFight=false — even though each fight's causal record names
// the dead scholar (Ivy Wang, Ines Duarte, Wanjiru Kamau). Cause: the
// probe's closeFightRec maps the 'p' party fighter through G.villagerId
// read at CLOSE time; when the scholar dies the mantle passes immediately,
// so G.villagerId is the SUCCESSOR, not the dead scholar. The dead scholar
// is in `died` but not in `partyVids`, so diedParty excludes them and the
// fight reads as no party death. A fourth d56 fight (Meera Reddy) WAS
// captured — her fight was the last of the day and the village then died
// out, so no successor existed and G.villagerId still named her — which
// is why the M2b-attribution read GO on 1/1 while masking the 3 misses.
//
// FIX: the probe records scholarIdAtOpen (the scholar's villagerId at
// fight open) on every census record and maps deaths through it.
//
// This test runs the REAL probe on the single pre-registered seed 89702
// for 60 days (the village is lost on day 56 in the pilot, so all four
// d56 fights are in range) into a temp dir, and asserts the three missed
// scholar deaths now read vDie / dieFlag / diedInFight=[scholar] /
// scholarDiedInFight=true, with the Meera Reddy fight as the control.
// RED on the unfixed probe (diedParty=[], outcome otherEnd); GREEN after
// the fix. Exit 0 = PASS, 1 = FAIL, 2 = instrument failure.
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PROBE = path.join(__dirname, 'probe-endgame-r171-20261110.js');
const EVIDDIR = fs.mkdtempSync(path.join(os.tmpdir(), 'm2b-r171-'));
const ENV = Object.assign({}, process.env, {
  FULLSEAT: '1', VETCOMMIT: '1', CAPABLE_GREEDY: '1', ARMORYDRIVE: '1',
  CAPABLE_VETGUARD: '1', TELEMETRY_FULL: '1', RELAYGREY: '1',
  SEEDS: '89702', DAYS: '60', EVIDDIR,
});

console.log(`M2B-SCHOLAR-OPEN: running probe on seed 89702, 60 days, EVIDDIR=${EVIDDIR}`);
const r = spawnSync(process.execPath, [PROBE], {
  env: ENV, encoding: 'utf8', timeout: 20 * 60 * 1000, maxBuffer: 64 * 1024 * 1024,
});
if (r.error) { console.error('PROBE SPAWN FAILED:', String(r.error && r.error.message || r.error)); process.exit(2); }
if (r.status !== 0) {
  console.error('PROBE EXIT', r.status);
  console.error(String(r.stderr || r.stdout || '').slice(-3000));
  process.exit(2);
}
const jsonPath = path.join(EVIDDIR, 'endgame-r171-89702.json');
if (!fs.existsSync(jsonPath)) { console.error('PROBE WROTE NO JSON at', jsonPath); process.exit(2); }
const rec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const fights = (rec.fightCensus && rec.fightCensus.fights) || [];
console.log(`M2B-SCHOLAR-OPEN: probe wrote ${fights.length} census fights (seed ${rec.seed}, end=${rec.endReason || rec.inviteClass || '?'})`);

// The three d56 scholar deaths the pre-fix probe missed.
const EXPECT = [
  { name: 'Ivy Wang', vid: 'ivy_wang' },
  { name: 'Ines Duarte', vid: 'ines_duarte' },
  { name: 'Wanjiru Kamau', vid: 'wanjiru_kamau' },
];
let fails = 0;
for (const e of EXPECT) {
  const f = fights.find(x => x.startDay === 56 && (x.causalDeaths || []).some(d => d.name === e.name));
  if (!f) { console.log(`FAIL ${e.name}: no d56 fight with that causal death found`); fails++; continue; }
  const ok = f.outcome === 'vDie' && f.dieFlag === true
    && (f.diedInFight || []).indexOf(e.vid) >= 0 && f.scholarDiedInFight === true;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${e.name}: outcome=${f.outcome} dieFlag=${f.dieFlag} diedInFight=${JSON.stringify(f.diedInFight)} scholarDiedInFight=${f.scholarDiedInFight} causal=${(f.causalDeaths || []).map(d => d.name).join(',')}`);
  if (!ok) fails++;
}
// Control: the Meera Reddy fight was captured pre-fix and must stay captured.
const m = fights.find(x => x.startDay === 56 && (x.causalDeaths || []).some(d => d.name === 'Meera Reddy'));
const mok = !!m && m.outcome === 'vDie' && m.dieFlag === true
  && (m.diedInFight || []).indexOf('meera_reddy') >= 0 && m.scholarDiedInFight === true;
console.log(`${mok ? 'PASS' : 'FAIL'} control Meera Reddy: ${m ? `outcome=${m.outcome} diedInFight=${JSON.stringify(m.diedInFight)} scholarDiedInFight=${m.scholarDiedInFight}` : 'fight not found'}`);
if (!mok) fails++;

console.log(fails === 0 ? 'M2B-SCHOLAR-OPEN: PASS (4/4)' : `M2B-SCHOLAR-OPEN: FAIL (${fails} check(s) failed)`);
process.exit(fails === 0 ? 0 : 1);
