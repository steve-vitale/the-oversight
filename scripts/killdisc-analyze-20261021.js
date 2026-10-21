#!/usr/bin/env node
// killdisc-analyze-20261021.js — attribution analysis for sim-killdisc
// stage 2 (backlog #736, zero-veteran survivors).
//
// Reads evidence/2026-10-21/perseed-killdisc/{policy}/s<seed>.json and
// attributes every wave-4+ engagement's outcome to a mechanism class.
//
// MECHANISM TAXONOMY (every wave-4+ engagement outcome goes in exactly one):
//   TB (scholar's turn-based fight, via startCombat):
//     TB-REFUSED       — startCombat produced no fight (titan muster gate
//                        refused the solo — the scholar never engaged)
//     TB-SCHOLAR-KILL  — recordWaveKill via player/companion, killer is scholar
//     TB-COMPANION-KILL— recordWaveKill via 'companion' (companion landed blow in TB)
//     TB-FLED          — tbEnd('fled'), no kill
//     TB-LOST          — tbEnd('lost') (scholar side lost; pyrrhic kill possible)
//     TB-DISSOLVED     — succession/game-over dissolved the fight (no tbEnd)
//     TB-OTHER-END     — any other tbEnd result
//     TB-UNMATCHED     — fight started but no end outcome recorded
//                        (RESIDUAL — gate watches)
//   FF (villager-side field fight):
//     FF-EVADE         — awareness check: contact avoided
//     FF-VKILL-VILLAGER— villager landed the kill (veteran-manufacturing)
//     FF-VKILL-SCHOLAR — scholar landed the kill via a field-fight channel
//     FF-MFLEE         — villager drove the monster off
//     FF-VFLEE         — villager broke off / fled
//     FF-VDIE          — villager died
//     FF-ALREADYDEAD   — corpse, not a fight
//     FF-UNRESOLVED    — no recognizable outcome (RESIDUAL — gate watches)
//   SPAWN (via castMonster + spawnWorldMonster):
//     SPAWN-W4-CAST    — wanderer/contest casting-path wave-4+ spawn
//     SPAWN-W4-WORLD   — world-entity wave-4+ spawn (roaming top-up, tile
//                        entry, wanderer, re-spawn, traps)
//   The spawn census is the denominator against engagements: spawns with no
//   matching engagement are the "no encounters at all" class.
//
// PRIMARY (DIAG-GO, pre-registered 2026-10-21T03:55Z): attribution
// completeness — ≥15/16 eligible runs with 0 unexplained wave-4+ engagement
// outcomes. Eligible = wave-4 unlocked (w4Day non-null). Unexplained = any
// of: unknownVia kills, 'unresolved' field fights, TB-UNMATCHED, non-empty
// instrumentErrors.
//
// Usage: node scripts/killdisc-analyze-20261021.js
// Writes: evidence/2026-10-21/killdisc-digest-20261021.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-killdisc');

const POLICIES = ['leadfeast', 'belongfeast'];
const runs = [];
for (const p of POLICIES) {
  const dir = path.join(EVID, p);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/^s\d+\.json$/.test(f)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (r.error) { console.log(`SKIP ${p} ${f}: ${r.error}`); continue; }
    runs.push(r);
  }
}
console.log(`loaded ${runs.length} runs`);

function tbClass(e) {
  if (!e.started) return 'TB-REFUSED'; // startCombat produced no fight (titan muster gate etc.)
  const kills = e.kills | 0;
  if (kills > 0) {
    // distinguish by kill channel — need the kill records; we only have count.
    return 'TB-KILL';
  }
  const end = e.end || 'UNMATCHED';
  if (end === 'UNMATCHED') return 'TB-UNMATCHED';
  if (end === 'fled') return 'TB-FLED';
  if (end === 'lost') return 'TB-LOST';
  if (end === 'dissolved') return 'TB-DISSOLVED'; // succession/game-over dissolved the fight (no tbEnd)
  return 'TB-OTHER-END';
}

function ffClass(f, scholarVid) {
  if (f.outcome === 'vKill') {
    if (f.vid && (f.vid === scholarVid || f.vid === 'p' || f.vid === 'player')) return 'FF-VKILL-SCHOLAR';
    return 'FF-VKILL-VILLAGER';
  }
  if (f.outcome === 'evade') return 'FF-EVADE';
  if (f.outcome === 'mFlee') return 'FF-MFLEE';
  if (f.outcome === 'vFlee') return 'FF-VFLEE';
  if (f.outcome === 'vDie') return 'FF-VDIE';
  if (f.outcome === 'alreadyDead') return 'FF-ALREADYDEAD';
  return 'FF-UNRESOLVED';
}

const rows = [];
const tax = {};
function bump(k) { tax[k] = (tax[k] || 0) + 1; }

for (const r of runs) {
  const eligible = r.w4Day !== null && r.w4Day !== undefined;
  const row = {
    seed: r.seed, policy: r.policyId, eligible,
    w4Day: r.w4Day, w5Day: r.w5Day, won: !!r.won, endReason: r.endReason,
    maxCappedStanding: r.maxCappedStanding, maxRawStanding: r.maxRawStanding,
    zeroVeteranAfterCapped200: !!r.zeroVeteranAfterCapped200,
    spawns4: r.w4Spawns | 0, worldSpawns4: r.w4WorldSpawns | 0, ff4: r.w4FieldFights | 0, tb4: r.w4TbEngagements | 0, kills4: r.w4Kills | 0,
  };
  // per-run taxonomy
  const per = {};
  const bumpP = k => { per[k] = (per[k] || 0) + 1; bump(k); };
  // spawn-src taxonomy
  for (const s of (r.spawns || [])) bumpP('SPAWN-W4-' + String(s.src || '?').toUpperCase());
  // kills: channel attribution
  const killBy = { scholar: 0, companion: 0, villagerField: 0, unknown: 0 };
  for (const k of (r.kills || [])) {
    if (k.unknownVia) { killBy.unknown++; bumpP('KILL-UNKNOWN-VIA'); }
    else if (k.via === 'player') { killBy.scholar++; bumpP('KILL-TB-SCHOLAR'); }
    else if (k.via === 'companion') { killBy.companion++; bumpP('KILL-TB-COMPANION'); }
    else { killBy.villagerField++; bumpP('KILL-FIELD-' + String(k.via || '?').toUpperCase()); }
  }
  row.killBy = killBy;
  // TB engagements
  const tbEnds = {};
  for (const e of (r.tb || [])) {
    if ((e.kills | 0) > 0) {
      // refine into scholar vs companion via the kill channel
      const ks = (r.kills || []).filter(k => k.d === e.d && k.mid === e.mid);
      const compKill = ks.some(k => k.via === 'companion');
      const scholarKill = ks.some(k => k.via === 'player');
      bumpP(compKill ? 'TB-COMPANION-KILL' : (scholarKill ? 'TB-SCHOLAR-KILL' : 'TB-KILL-OTHER'));
    } else {
      bumpP(tbClass(e));
    }
    tbEnds[e.end || 'UNMATCHED'] = (tbEnds[e.end || 'UNMATCHED'] || 0) + 1;
  }
  row.tbEnds = tbEnds;
  // field fights
  const ffOut = {};
  for (const f of (r.fieldFights || [])) {
    const c = ffClass(f, r.scholarVid);
    bumpP(c);
    ffOut[f.outcome] = (ffOut[f.outcome] || 0) + 1;
  }
  row.ffOutcomes = ffOut;
  row.per = per;
  // unexplained residual
  const unexplained =
    killBy.unknown +
    (per['FF-UNRESOLVED'] | 0) +
    (per['TB-UNMATCHED'] | 0);
  row.unexplained = unexplained;
  row.explained = eligible && unexplained === 0 && (r.instrumentErrors || []).length === 0;
  if ((r.instrumentErrors || []).length) row.instrumentErrors = r.instrumentErrors;
  rows.push(row);
}

const eligibleRows = rows.filter(r => r.eligible);
const explainedRows = eligibleRows.filter(r => r.explained);
const zeroVetRows = eligibleRows.filter(r => r.zeroVeteranAfterCapped200);

const digest = {
  instrument: 'killdisc-v2', runs: rows.length,
  eligible: eligibleRows.length,
  explained: explainedRows.length,
  goThreshold: '>=15/16 eligible runs explained, 0 unexplained outcomes',
  go: (eligibleRows.length >= 15 && explainedRows.length === eligibleRows.length) ? 'DIAG-GO' : 'NO-GO',
  zeroVeteranAfterCapped200: zeroVetRows.length,
  taxonomy: tax,
  rows,
};
console.log(`eligible ${eligibleRows.length}/16, explained ${explainedRows.length}/${eligibleRows.length}`);
console.log(`zero-veteran-after-capped200: ${zeroVetRows.length}`);
console.log(`verdict: ${digest.go}`);
console.log('--- taxonomy (wave-4+ engagement outcomes, all runs) ---');
for (const k of Object.keys(tax).sort()) console.log(`  ${k}: ${tax[k]}`);
console.log('--- zero-veteran runs ---');
for (const r of zeroVetRows) {
  console.log(`  s${r.seed} ${r.policy}: w4d=${r.w4Day} sp=${r.spawns4}(world ${r.worldSpawns4}) ff=${r.ff4} tb=${r.tb4} kills=${r.kills4} killBy=${JSON.stringify(r.killBy)} ffOut=${JSON.stringify(r.ffOutcomes)} tbEnds=${JSON.stringify(r.tbEnds)}`);
}
fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-21', 'killdisc-digest-20261021.json'), JSON.stringify(digest, null, 1) + '\n');
console.log('wrote evidence/2026-10-21/killdisc-digest-20261021.json');
