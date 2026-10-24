#!/usr/bin/env node
// vetautopsy-audit-sample.js — prints BLIND audit packets for the manual
// audit (E3): for every killer vid who died, the raw death-row evidence
// WITHOUT the classifier's channel. The auditor (a human reading the rows)
// assigns the pre-registered channel by hand into
// scripts/vetautopsy-audit.json; E3 then checks >=95% agreement.
//
// Usage: node scripts/vetautopsy-audit-sample.js [N]
//   N = max packets (default: all). Prints packets; does not classify.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetautopsy');
const N = parseInt(process.argv[2] || '0', 10) || Infinity;

const { dedupDeathRows } = require(path.join(REPO, 'scripts', 'vetautopsy-analyze'));

const files = fs.readdirSync(CORPUS).filter(f => /^s\d+-(lead|belong)\.json$/.test(f)).sort();
let n = 0;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
  const w4k = (d.waveKillLog || []).filter(e => e && (e.w | 0) >= 4 && e.by);
  const killers = {};
  for (const k of w4k) (killers[String(k.by)] = killers[String(k.by)] || []).push(k);
  const ded = dedupDeathRows((d.deathRows || []).filter(r => r && r.person));
  const deathByVid = {};
  for (const r of ded.rows) (deathByVid[String(r.who)] = deathByVid[String(r.who)] || []).push(r);
  const finalRoster = new Set((d.finalRoster || []).map(String));
  const pickedSet = new Set((d.successions || []).map(s => String(s.newId)));
  for (const vid of Object.keys(killers).sort()) {
    if (finalRoster.has(vid)) continue; // survived — not in the death denominator
    const drows = (deathByVid[vid] || []).slice().sort((a, b) => a.day - b.day);
    if (n >= N) break;
    n++;
    const kills = killers[vid].slice().sort((a, b) => a.d - b.d);
    console.log(`=== AUDIT-PACKET ${f}|${vid} ===`);
    console.log(`kills: ${kills.map(k => `${k.mid}@d${k.d} via=${k.via}`).join(', ')}`);
    console.log(`pickedSuccessor: ${pickedSet.has(vid) && vid !== d.initialScholarVid} | initialScholar: ${vid === d.initialScholarVid}`);
    if (!drows.length) { console.log('death rows: NONE (join failure)'); continue; }
    const dr = drows[drows.length - 1];
    console.log(`death: d${dr.day} who=${dr.whoName} kind=${dr.kind} cause="${dr.cause}" wave=${dr.wave}`);
    console.log(`  mantleHolder=${dr.mantleHolder} playerRepaired=${dr.playerRepaired} scholarVidAtDeath=${dr.scholarVidAtDeath === vid ? '(self)' : dr.scholarVidAtDeath}`);
    console.log(`  combatCause=${dr.combatCause} opp=${dr.oppMid || '-'} w${dr.oppWave != null ? dr.oppWave : '?'} basis=${dr.fightBasis}`);
    console.log(`  hp=${dr.hp}(${dr.hpSource}) armor=${dr.armor} eq=${(dr.equippedKeys || []).join(',')}`);
    console.log(`  disease=${dr.disease}(${dr.diseasePool}) ctx=${JSON.stringify(dr.ctx)}`);
    console.log(`  village: scale=${dr.village.scaleRank} national=${dr.village.national} w5live=${dr.village.w5live} pantry=${dr.village.pantry} hungryStreak=${dr.village.hungryStreak} roster=${dr.village.roster}`);
    console.log(`  bloodToDeath=${dr.day - kills[0].d}d nDeathRows=${drows.length}`);
  }
}
console.log(`--- ${n} audit packets ---`);
