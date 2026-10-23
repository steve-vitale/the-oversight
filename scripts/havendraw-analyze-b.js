#!/usr/bin/env node
// havendraw-analyze-b.js — sim-havendraw-b census analyzer.
//
// Reads evidence/2026-10-23/perseed-havendraw/*.json and prints:
//   1. Exposure table: haven assault frequency per 100 village-days (by wave),
//      origin-class shares with the wave-4 split.
//   2. Veteran deaths by assault type (in-scope: >=1 wave-4+ waveKillLog kill
//      by death day, died in a wave-4 fight, combat-cause-gated) + scholar
//      deaths as mantle-holder by assault type.
//   3. Companion damage per fight: haven assaults vs field fights.
//   4. Draw mechanism: feast-draw casts by wave, faced vs driven off.
//   5. Muster effectiveness: musters vs subsequent haven fights.
//   6. Wall numbers.
//
// Usage: node scripts/havendraw-analyze-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-havendraw');

let combatCause = null;
try { combatCause = require('./mantlechain-instr-20261022').combatCause; } catch (e) {}

const rows = [];
for (const f of fs.readdirSync(DIR)) {
  if (!/\.json$/.test(f)) continue;
  rows.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}
console.log(`configs: ${rows.length}`);

const sum = (a) => a.reduce((x, y) => x + y, 0);
const villageDays = sum(rows.map(r => r.villageDays || r.days || 0));
const per100 = (n) => villageDays ? (n / villageDays * 100).toFixed(2) : 'n/a';

// ---- 1. exposure table ----
const fights = [], vfights = [], ends = [];
for (const r of rows) { fights.push(...(r.fights || [])); vfights.push(...(r.vfights || [])); ends.push(...(r.ends || [])); }
const originCounts = {}, w4originCounts = {};
for (const f of fights) {
  originCounts[f.origin] = (originCounts[f.origin] || 0) + 1;
  if ((f.wave | 0) >= 4) w4originCounts[f.origin] = (w4originCounts[f.origin] || 0) + 1;
}
const voriginCounts = {}, w4voriginCounts = {};
for (const v of vfights) {
  voriginCounts[v.origin] = (voriginCounts[v.origin] || 0) + 1;
  if ((v.wave | 0) >= 4) w4voriginCounts[v.origin] = (w4voriginCounts[v.origin] || 0) + 1;
}
const raids = [];
for (const r of rows) raids.push(...(r.raids || []).filter(x => x.fired));
const raidWaveCounts = {};
for (const x of raids) raidWaveCounts[x.maxWave] = (raidWaveCounts[x.maxWave] || 0) + 1;
const musters = [];
for (const r of rows) musters.push(...(r.musters || []).filter(x => x.kind === 'muster'));
const standdowns = [];
for (const r of rows) standdowns.push(...(r.musters || []).filter(x => x.kind === 'standdown'));

console.log('\n== 1. EXPOSURE TABLE ==');
console.log(`village-days: ${villageDays}`);
console.log(`raids fired: ${raids.length} (${per100(raids.length)}/100vd), by max-wave: ${JSON.stringify(raidWaveCounts)}`);
console.log(`musters: ${musters.length} (${per100(musters.length)}/100vd), standdowns: ${standdowns.length}`);
console.log(`player fights: ${fights.length}, villager fights: ${vfights.length}`);
console.log('player origin shares:', JSON.stringify(originCounts));
console.log('player wave-4+ origin shares:', JSON.stringify(w4originCounts));
console.log('villager origin shares:', JSON.stringify(voriginCounts));
console.log('villager wave-4+ origin shares:', JSON.stringify(w4voriginCounts));
// wave-4+ fights at haven (player: atHaven; villager: origin raiddefense/lingerer/havengrounds)
const w4p = fights.filter(f => (f.wave | 0) >= 4);
const w4pHaven = w4p.filter(f => f.atHaven);
const w4v = vfights.filter(v => (v.wave | 0) >= 4);
const w4vHaven = w4v.filter(v => ['raiddefense', 'lingerer', 'havengrounds'].includes(v.origin));
console.log(`wave-4+ player fights: ${w4p.length} (${per100(w4p.length)}/100vd), atHaven: ${w4pHaven.length}`);
console.log(`wave-4+ villager fights: ${w4v.length} (${per100(w4v.length)}/100vd), haven-class: ${w4vHaven.length}`);

// ---- 2. veteran + scholar deaths by assault type ----
// in-scope: person with >=1 wave-4+ waveKillLog kill (by death day) who died
// in a wave-4 fight (fightWave>=4, combat-cause-gated).
const wklByVid = {}; // vid -> [{d, w}]
for (const r of rows) for (const e of (r.waveKillLog || [])) {
  if (!e || !e.by) continue;
  (wklByVid[e.by] = wklByVid[e.by] || []).push({ d: e.d | 0, w: e.w | 0 });
}
function isVeteranBy(vid, day) {
  return ((wklByVid[vid] || []).some(e => e.d <= day && e.w >= 4));
}
function originOfDeath(r, d) {
  // join the death's (day, fightMid) to havendraw fight records
  if (d.fightMid && d.fightBasis !== 'none') {
    const f = (r.fights || []).find(x => x.day === d.day && x.mid === d.fightMid);
    if (f) return { origin: f.origin, basis: 'player-fight' };
    const vf = (r.vfights || []).find(x => x.day === d.day && x.mid === d.fightMid && x.vid === d.who);
    if (vf) return { origin: vf.origin, basis: 'villager-fight' };
    const vf2 = (r.vfights || []).find(x => x.day === d.day && x.mid === d.fightMid);
    if (vf2) return { origin: vf2.origin, basis: 'villager-fight-day' };
  }
  return { origin: 'unlinked', basis: d.fightBasis };
}
const vetDeaths = [], scholarDeaths = [];
for (const r of rows) {
  for (const d of (r.deaths || [])) {
    if ((d.fightWave | 0) < 4) continue;
    if (d.fightBasis === 'same-day' && combatCause) {
      try { if (!combatCause(d.cause, null)) continue; } catch (e) { continue; }
    }
    if (!isVeteranBy(d.who, d.day)) continue;
    const o = originOfDeath(r, d);
    vetDeaths.push({ seed: r.seed, base: r.base, who: d.whoName, day: d.day, cause: d.cause,
      player: !!d.player, origin: o.origin, basis: o.basis });
    if (d.player) scholarDeaths.push({ seed: r.seed, base: r.base, who: d.whoName, day: d.day,
      cause: d.cause, origin: o.origin, basis: o.basis });
  }
}
const vetByOrigin = {}, schByOrigin = {};
for (const x of vetDeaths) vetByOrigin[x.origin] = (vetByOrigin[x.origin] || 0) + 1;
for (const x of scholarDeaths) schByOrigin[x.origin] = (schByOrigin[x.origin] || 0) + 1;
console.log('\n== 2. VETERAN + SCHOLAR DEATHS BY ASSAULT TYPE ==');
console.log(`in-scope veteran wave-4 deaths: ${vetDeaths.length} (${per100(vetDeaths.length)}/100vd)`);
console.log('  by origin:', JSON.stringify(vetByOrigin));
console.log(`scholar (mantle-holder) wave-4 deaths: ${scholarDeaths.length}`);
console.log('  by origin:', JSON.stringify(schByOrigin));
for (const x of scholarDeaths) console.log(`  SCHOLAR d${x.day} s${x.seed}/${x.base} ${x.who}: origin=${x.origin} basis=${x.basis} cause=${x.cause}`);

// ---- 3. companion damage: haven vs field ----
const havenEnds = ends.filter(e => e.atHaven);
const fieldEnds = ends.filter(e => !e.atHaven);
const mean = (a) => a.length ? (sum(a) / a.length) : 0;
const hd = havenEnds.map(e => e.compDmg || 0), fd = fieldEnds.map(e => e.compDmg || 0);
console.log('\n== 3. COMPANION DAMAGE PER FIGHT ==');
console.log(`haven fights: n=${havenEnds.length} mean compDmg=${mean(hd).toFixed(1)} compDied=${sum(havenEnds.map(e => e.compDied || 0))}`);
console.log(`field fights: n=${fieldEnds.length} mean compDmg=${mean(fd).toFixed(1)} compDied=${sum(fieldEnds.map(e => e.compDied || 0))}`);
const w4ends = ends.filter(e => (e.wave | 0) >= 4);
console.log(`wave-4+ fights with ends: ${w4ends.length}/${ends.length}, mean compDmg=${mean(w4ends.map(e => e.compDmg || 0)).toFixed(1)}`);
const outcomes = {};
for (const e of ends) outcomes[e.result] = (outcomes[e.result] || 0) + 1;
console.log('fight outcomes:', JSON.stringify(outcomes));

// ---- 4. draw mechanism ----
const draws = [];
for (const r of rows) draws.push(...(r.draws || []));
const casts = draws.filter(d => d.kind === 'cast');
const castWave = {};
for (const c of casts) if (c.drawn) castWave[c.wave] = (castWave[c.wave] || 0) + 1;
const faces = draws.filter(d => d.kind === 'face'), drives = draws.filter(d => d.kind === 'driveoff');
console.log('\n== 4. FEAST-DRAW MECHANISM ==');
console.log(`casts: ${casts.length}, drawn: ${casts.filter(c => c.drawn).length}, by wave: ${JSON.stringify(castWave)}`);
console.log(`faced: ${faces.filter(f => f.ok).length}/${faces.length}, driven off: ${drives.filter(d => d.ok).length}/${drives.length}`);

// ---- 5. muster effectiveness ----
console.log('\n== 5. MUSTER EFFECTIVENESS ==');
console.log(`musters: ${musters.length}, standdowns: ${standdowns.length}, mean sheltered: ${(sum(musters.map(m => m.sheltered || 0)) / Math.max(1, musters.length)).toFixed(1)}`);
// haven-class wave-4+ fights within 2 days after a muster (per config)
let postMusterFights = 0;
for (const r of rows) {
  const ms = (r.musters || []).filter(x => x.kind === 'muster').map(x => x.day);
  const fs = [...(r.fights || []), ...(r.vfights || [])].filter(x => (x.wave | 0) >= 4 && (x.atHaven || ['raiddefense', 'lingerer', 'havengrounds'].includes(x.origin)));
  for (const f of fs) if (ms.some(md => f.day >= md && f.day <= md + 2)) postMusterFights++;
}
console.log(`haven-class wave-4+ fights within 2d after a muster: ${postMusterFights}`);

// ---- 6. wall numbers ----
const nat = rows.filter(r => r.national).length, tab = rows.filter(r => r.table).length,
  won = rows.filter(r => r.won).length, w4u = rows.filter(r => r.wave4).length, w5u = rows.filter(r => r.wave5).length;
const days = rows.map(r => r.days || 0).sort((a, b) => a - b);
const median = days.length ? days[Math.floor(days.length / 2)] : 0;
const causes = {};
for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) causes[k] = (causes[k] || 0) + v;
console.log('\n== 6. WALL NUMBERS ==');
console.log(`configs ${rows.length}: national ${nat}/${rows.length} table ${tab}/${rows.length} won ${won}/${rows.length} wave4 ${w4u}/${rows.length} wave5 ${w5u}/${rows.length}`);
console.log(`survival: median ${median}d max ${days.length ? days[days.length - 1] : 0}d`);
console.log('death causes:', JSON.stringify(causes));
console.log(`traps: crafted ${sum(rows.map(r => r.trapsCrafted || 0))} looted ${sum(rows.map(r => r.trapsLooted || 0))}`);
console.log(`counters: discovered ${sum(rows.map(r => r.countersDiscovered || 0))} tele ${sum(rows.map(r => r.counterTeleCount || 0))} counterKillProxy ${sum(rows.map(r => r.counterKillProxy || 0))}`);
console.log(`young-link succession: notes ${sum(rows.map(r => r.successionNotes || 0))} survived ${sum(rows.map(r => r.successionSurvived || 0))} snapped ${sum(rows.map(r => r.successionSnapped || 0))}`);
console.log(`tier-2 reach: ${rows.filter(r => (r.tier | 0) >= 2).length}/${rows.length}, wave-3 reach: ${rows.filter(r => (r.maxWave | 0) >= 3).length}/${rows.length}, arc>=2: ${rows.filter(r => (r.maxArc | 0) >= 2).length}/${rows.length}`);
console.log(`w4 scholar kills: ${sum(rows.map(r => r.w4scholarKills || 0))}, w4 villagers: ${sum(rows.map(r => r.nW4Villagers || 0))}`);
console.log(`starvation: ${sum(rows.map(r => r.starvationDeaths || 0))}, scholar combat deaths: ${sum(rows.map(r => r.scholarCombatDeaths || 0))}`);
const ierr = [];
for (const r of rows) for (const e of (r.instrumentErrors || [])) ierr.push(`s${r.seed}/${r.base}: ${e}`);
console.log(`instrument errors: ${ierr.length}${ierr.length ? ' — ' + ierr.slice(0, 5).join(' | ') : ''}`);
