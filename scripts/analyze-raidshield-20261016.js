#!/usr/bin/env node
'use strict';
// analyze-raidshield-20261016.js — verdict analyzer for the sim-raidshield
// pilot. Reads evidence/2026-10-16/perseed-raidshield/.
//
// PRIMARY (binding): post-invite monster-verb RAID-attributed deaths,
//   armed sum <= 0.85 x control sum on identical seeds.
// Coverage gate: attribution rate >= 95% (else no-coverage).
// Guardrails: national >= control-2; median survival >= control-10d;
//   no new death mode.
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-raidshield');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

const pairs = {};
for (const r of runs) {
  const k = `${r.policyId}-s${r.seed}`;
  pairs[k] = pairs[k] || {};
  pairs[k][r.armed ? 'armed' : 'control'] = r;
}
const keys = Object.keys(pairs).sort();
let cRaid = 0, aRaid = 0, cRaidD = 0, aRaidD = 0, cRaidL = 0, aRaidL = 0;
let cNat = 0, aNat = 0, cMed = [], aMed = [];
let covFails = [];
let perPair = [];
let wallBeats = 0, reserveBeats = 0, sortieBeats = 0;
for (const k of keys) {
  const p = pairs[k];
  if (!p.control || !p.armed) { console.log(`  SKIP ${k}: missing side`); continue; }
  const c = p.control, a = p.armed;
  cRaid += c.postInviteSrcShare.RAID; aRaid += a.postInviteSrcShare.RAID;
  cRaidD += c.raidDirect; aRaidD += a.raidDirect;
  cRaidL += c.raidLingering; aRaidL += a.raidLingering;
  cNat += c.national; aNat += a.national;
  cMed.push(c.gameDays); aMed.push(a.gameDays);
  if (c.attributionRate < 0.95) covFails.push(`${k}-control ${c.attributionRate}`);
  if (a.attributionRate < 0.95) covFails.push(`${k}-armed ${a.attributionRate}`);
  wallBeats += a.shieldBeats.wall; reserveBeats += a.shieldBeats.reserve; sortieBeats += a.shieldBeats.sortie;
  perPair.push({ pair: k, control: c.postInviteSrcShare.RAID, armed: a.postInviteSrcShare.RAID,
    nat: `${c.national}->${a.national}`, days: `${c.gameDays}->${a.gameDays}` });
}
const med = (arr) => { const s = arr.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const ratio = cRaid ? aRaid / cRaid : (aRaid ? Infinity : 1);

console.log(`pairs: ${keys.length}`);
console.log(`PRIMARY: control RAID deaths=${cRaid} (direct ${cRaidD} / lingering ${cRaidL}) | armed RAID deaths=${aRaid} (direct ${aRaidD} / lingering ${aRaidL})`);
console.log(`  ratio armed/control = ${cRaid ? ratio.toFixed(3) : 'n/a (control 0)'}  GO bar <= 0.850  => ${cRaid && ratio <= 0.85 ? 'GO' : 'NO-GO'}`);
console.log(`coverage fails (<95%): ${covFails.length ? covFails.join(', ') : 'none'}`);
console.log(`guardrail national: control ${cNat} -> armed ${aNat} (need >= ${cNat - 2}) ${aNat >= cNat - 2 ? 'HOLD' : 'FAIL'}`);
console.log(`guardrail median survival: control ${med(cMed)}d -> armed ${med(aMed)}d (need >= ${med(cMed) - 10}d) ${med(aMed) >= med(cMed) - 10 ? 'HOLD' : 'FAIL'}`);
console.log(`exercise gates: shield-wall beats=${wallBeats} (>0 ${wallBeats > 0 ? 'PASS' : 'FAIL'}), reserve beats=${reserveBeats}, sorties=${sortieBeats} (>0 ${sortieBeats > 0 ? 'PASS' : 'FAIL'})`);
console.log('\nper-pair (control->armed RAID deaths):');
for (const p of perPair) console.log(`  ${p.pair}: raid ${p.control}->${p.armed}  nat ${p.nat}  days ${p.days}`);

// new death mode scan: cause families on armed vs control
const fam = { control: {}, armed: {} };
for (const k of keys) {
  const p = pairs[k]; if (!p.control || !p.armed) continue;
  for (const [side, r] of [['control', p.control], ['armed', p.armed]]) {
    for (const d of (r.deaths || [])) {
      const key = `${d.family || '?'}/${d.cause || '?'}`;
      fam[side][key] = (fam[side][key] || 0) + 1;
    }
  }
}
const newModes = Object.keys(fam.armed).filter(k => !fam.control[k]);
console.log(`\ndeath-mode scan: armed-only families: ${newModes.length ? newModes.map(k => `${k} x${fam.armed[k]}`).join(', ') : 'none'}`);
