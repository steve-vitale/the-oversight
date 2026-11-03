// compare-endgame-r118-vs-r110.js — journey-endgame r118 (lane B, 2026-11-03).
//
// Matched before/after: r110's seeds (89701-89707) re-run on current HEAD
// with the r110 probe policy verbatim (plus read-only r118 instruments).
// Descriptive ONLY: n=7 seeds, no significance claim, no re-scoring —
// the table reports per-seed deltas and block tallies, and the run note
// interprets direction. Reads the committed r110 corpus (in-tree) and
// the r118 corpus; prints a per-seed delta table + tallies.
// Usage: node scripts/compare-endgame-r118-vs-r110.js
const fs = require('fs');
const path = require('path');
const D110 = path.join(__dirname, '..', 'evidence', '2026-11-02', 'perseed-endgame-r110');
const D118 = path.join(__dirname, '..', 'evidence', '2026-11-03', 'perseed-endgame-r118');
const load = (dir, tag, seed) => JSON.parse(fs.readFileSync(path.join(dir, `endgame-${tag}-${seed}.json`), 'utf8'));
const outs = (r) => {
  const o = {};
  for (const f of ((r.fightCensus && r.fightCensus.fights) || [])) o[f.outcome] = (o[f.outcome] || 0) + 1;
  return o;
};
const fmtOuts = (o) => Object.keys(o).sort().map(k => `${k}:${o[k]}`).join(',') || 'none';
const w5faces = (r) => ((r.w5FaceEvents || []).length);
console.log('=== journey-endgame r118 vs r110, MATCHED seeds (same seeds, same probe policy, HEAD changed) ===');
console.log('seed plan: r110 sat/seat/won/end | r118 sat/seat/won/end | fights r110 -> r118 | killsW4 | peakVet | uw | w5faces');
let t110 = { sat: 0, won: 0, kills: 0, fights: 0, vkills: 0, w5: 0 };
let t118 = { sat: 0, won: 0, kills: 0, fights: 0, vkills: 0, w5: 0 };
for (const seed of [89701, 89702, 89703, 89704, 89705, 89706, 89707]) {
  const a = load(D110, 'r110', seed);
  const b = load(D118, 'r118', seed);
  const oa = outs(a), ob = outs(b);
  const fa = Object.values(oa).reduce((s, x) => s + x, 0);
  const fb = Object.values(ob).reduce((s, x) => s + x, 0);
  const ka = (a.veterans || {}).w4plusKills | 0, kb = (b.veterans || {}).w4plusKills | 0;
  t110.sat += a.satDay != null ? 1 : 0; t110.won += a.won ? 1 : 0; t110.kills += ka; t110.fights += fa; t110.vkills += oa.vKill || 0; t110.w5 += w5faces(a);
  t118.sat += b.satDay != null ? 1 : 0; t118.won += b.won ? 1 : 0; t118.kills += kb; t118.fights += fb; t118.vkills += ob.vKill || 0; t118.w5 += w5faces(b);
  const fullA = (a.fullseat || {}).firstFullSeatDay != null ? 'FULL' : ((a.fullseat || {}).max || {}).w5 != null ? `w5:${(a.fullseat || {}).max.w5}` : '';
  const fullB = (b.fullseat || {}).firstFullSeatDay != null ? 'FULL' : ((b.fullseat || {}).max || {}).w5 != null ? `w5:${(b.fullseat || {}).max.w5}` : '';
  console.log(`${seed}(${a.plan}): r110 sat${a.satDay}/${a.satSeatKind || '—'}/won=${a.won}/${a.endReason} ${fullA} | r118 sat${b.satDay}/${b.satSeatKind || '—'}/won=${b.won}/${b.endReason} ${fullB} | fights [${fmtOuts(oa)}] -> [${fmtOuts(ob)}] | killsW4 ${ka}->${kb} | peakVet ${a.peakLivingVeterans}->${b.peakLivingVeterans} | uw ${(a.veterans || {}).unlockedWave}->${(b.veterans || {}).unlockedWave} | w5faces ${w5faces(a)}->${w5faces(b)}`);
}
console.log(`TALLY r110: sat ${t110.sat}/7 won ${t110.won}/7 censusFights ${t110.fights} vKills ${t110.vkills} killsW4 ${t110.kills} w5faces ${t110.w5}`);
console.log(`TALLY r118: sat ${t118.sat}/7 won ${t118.won}/7 censusFights ${t118.fights} vKills ${t118.vkills} killsW4 ${t118.kills} w5faces ${t118.w5}`);
console.log('NOTE: descriptive matched comparison only — same seeds, same probe policy; HEAD changed (arm 2 + arm 4). No significance claim.');
