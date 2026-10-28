#!/usr/bin/env node
// r50 FIRST CONTESTS (read-only): from r50 seed JSONs (+ r49 for comparison).
// Canon (CONTESTS.md): first challenge is a pilot episode, ~day 14-21,
// contests + TV pulls share ~2/week, contests are PLAYED not RNG.
// contestList comes from tele contest_end rows: {day, cid, outcome}.
// Footprint: gossip won-logs naming the contest + contestDamage rows.
// Usage: node scripts/analyze-journey-establishment-r50-firstcontests-20261028.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-28';
const EVID49 = EVID.replace('2026-10-28', '2026-10-27');
const load = (dir, n) => { try { return JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')); } catch (e) { return null; } };
for (const s of [209, 228, 238, 239]) {
  const d = load(EVID, `journey-establishment-r50-seed${s}.json`);
  if (!d) { console.log(`== seed ${s}: r50 JSON missing`); continue; }
  const g = d.guardrails || {};
  const list = g.contestList || d.contestList || [];
  const won = (d.gossipLog || []).filter(x => x.how === 'won' || String(x.how || '').includes('won'));
  const cd = d.contestDamageLog || [];
  const first = list[0] || null;
  const inWindow = list.filter(c => c.day >= 14 && c.day <= 21);
  const rate = list.length ? (list.length / 6).toFixed(2) : '0.00';
  const norm = x => String(x || '').toLowerCase().replace(/^the /, '').replace(/[^a-z]/g, '');
  console.log(`== seed ${s}: contests total=${list.length} (${rate}/week over 6wk) first=${first ? first.cid + ' d' + first.day + ' outcome=' + first.outcome : 'NONE'} pilotAiredDay=${g.pilotDay} in-14-21=${inWindow.length} arrivals=${(d.arrivals || []).length} gossipWonContests=${JSON.stringify([...new Set(won.map(x => x.contest).filter(Boolean))])} contestDamageRows=${cd.length}`);
  for (const c of list.slice(0, 6)) {
    const named = won.some(x => norm(x.contest) === norm(c.cid));
    console.log(`   d${c.day} ${c.cid} outcome=${c.outcome} gossipWonNamesIt=${named} (name-normalized; raw gossip names differ from cids)`);
  }
  if (first) {
    const pilotWord = JSON.stringify(list).toLowerCase().includes('pilot');
    console.log(`   pilot-word anywhere in contestList JSON: ${pilotWord} (telemetry carries cid/outcome only; pilot framing needs a transcript read, see run note metric review)`);
  }
  const d49 = load(EVID49, `journey-establishment-r49-seed${s}.json`);
  if (d49) {
    const l49 = (d49.guardrails || {}).contestList || d49.contestList || [];
    const same = JSON.stringify(l49) === JSON.stringify(list);
    console.log(`   CONTROL vs r49: contestList identical=${same} (r49 total=${l49.length} first=${l49[0] ? l49[0].cid + ' d' + l49[0].day : 'NONE'}) censusPantry r50=${d.censusPantryKcal} r49=${d49.censusPantryKcal} identical=${d.censusPantryKcal === d49.censusPantryKcal}`);
  }
}
