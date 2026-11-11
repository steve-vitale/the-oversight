#!/usr/bin/env node
// test-m2b-scholar-open-r178.js — proof test for the r178 M2b fix.
//
// DEFECT (r178 pilot, seed 89702): reunion fights in which the SCHOLAR
// died read outcome=otherEnd (or vFlee), diedParty=[] (diedInFight=[]),
// scholarDiedInFight=false — even though each fight's causal record names
// the dead scholar. Cause: the probe's closeFightRec mapped the 'p' party
// fighter through G.villagerId read at CLOSE time; when the scholar dies
// the mantle passes immediately, so G.villagerId is the SUCCESSOR, not the
// dead scholar. The dead scholar is in `died` but not in `partyVids`, so
// diedParty excludes them and the fight reads as no party death. On the
// pilot substrate (master 7c2591d1f) SIX scholar deaths were missed on
// 89702 (Peyton Michalski, Chris Thompson, Agnese Barbagallo d54; Ivy
// Wang, Ines Duarte, Wanjiru Kamau d56); only Meera Reddy was captured,
// because her fight was the last of the day and the village then died out,
// so no successor existed and G.villagerId still named her — which is why
// the pilot's M2b-attribution read GO on 1/1 while masking the 6 misses.
//
// FIX: the probe records scholarIdAtOpen (the scholar's villagerId at
// fight open) on every census record and maps deaths through it.
//
// WHAT THIS TEST ASSERTS (property, not fixture): it runs the REAL probe
// on the single pre-registered seed 89702 for 60 days into a temp dir,
// then checks EVERY fight whose causal deaths include the fight's own
// scholar-at-open: each such fight must read outcome vDie, dieFlag true,
// diedInFight containing the scholar, scholarDiedInFight true. The test
// is NON-VACUOUS: it fails loudly if no scholar-death fight occurs at
// all. It is deliberately NOT pinned to named scholars/days: the fixture
// moved once already (on master e5c19e54e the village survives past d56
// and the scholar deaths fall on d47/d48/d60 instead — Saiful Dutta,
// Peyton Michalski, Chris Thompson — all three mapped correctly), and a
// named-days test would go stale on the next sibling landing that moves
// the trajectory. The property is what the fix guarantees; the names are
// reported, not asserted.
// RED on the unfixed probe (the pilot corpus violates the property on 6
// fights); GREEN after the fix. Exit 0 = PASS, 1 = FAIL, 2 = instrument
// failure.
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PROBE = path.join(__dirname, 'probe-endgame-r178-20261111.js');
const EVIDDIR = fs.mkdtempSync(path.join(os.tmpdir(), 'm2b-r178-'));
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
const jsonPath = path.join(EVIDDIR, 'endgame-r178-89702.json');
if (!fs.existsSync(jsonPath)) { console.error('PROBE WROTE NO JSON at', jsonPath); process.exit(2); }
const rec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const fights = (rec.fightCensus && rec.fightCensus.fights) || [];
console.log(`M2B-SCHOLAR-OPEN: probe wrote ${fights.length} census fights (seed ${rec.seed}, end=${rec.endReason || rec.inviteClass || '?'})`);

// The property: every fight whose causal deaths include the fight's own
// scholar-at-open must read as a scholar death in the fight. A fight with
// causal deaths but NO scholarIdAtOpen predates the fix (or took the fast
// branch, which never records the field) — that is itself a violation,
// reported distinctly so a RED names the defect instead of passing
// vacuously.
let scholarDeathFights = 0;
let fails = 0;
for (const f of fights) {
  const openScholar = f.scholarIdAtOpen || null;
  const causal = f.causalDeaths || [];
  if (!openScholar) {
    if (causal.length) {
      console.log(`FAIL d${f.startDay} ${Array.isArray(f.monsters) ? f.monsters.join('+') : '?'}: causal death(s) ${causal.map(d => d.name || d.vid).join(', ')} but no scholarIdAtOpen recorded — probe predates the fix`);
      fails++;
    }
    continue;
  }
  const scholarCausal = causal.filter(d => d.vid === openScholar);
  if (!scholarCausal.length) continue;
  scholarDeathFights++;
  const names = scholarCausal.map(d => d.name || d.vid).join(', ');
  const ok = f.outcome === 'vDie' && f.dieFlag === true
    && (f.diedInFight || []).indexOf(openScholar) >= 0 && f.scholarDiedInFight === true;
  console.log(`${ok ? 'PASS' : 'FAIL'} d${f.startDay} ${Array.isArray(f.monsters) ? f.monsters.join('+') : '?'} scholar-death (${names}): outcome=${f.outcome} dieFlag=${f.dieFlag} diedInFight=${JSON.stringify(f.diedInFight)} scholarDiedInFight=${f.scholarDiedInFight}`);
  if (!ok) fails++;
}
if (scholarDeathFights === 0) {
  console.log('FAIL: no scholar-death fight occurred in the run — the test is vacuous, not green');
  fails++;
} else {
  console.log(`M2B-SCHOLAR-OPEN: ${scholarDeathFights} scholar-death fight(s) found`);
}
console.log(fails === 0 ? `M2B-SCHOLAR-OPEN: PASS (${scholarDeathFights}/${scholarDeathFights} scholar deaths mapped)` : `M2B-SCHOLAR-OPEN: FAIL (${fails} check(s) failed)`);
process.exit(fails === 0 ? 0 : 1);
