#!/usr/bin/env node
// diag-havencontact-analyze.js — sim-havencontact census analyzer.
//
// Reads evidence/2026-10-23/perseed-havencontact/*.json and prints:
//   1. Attribution: wave-4+ player fights attributed to named origin classes
//      (incl. havencontact) — the >=95% DIAG bar — plus the havencontact
//      share and atHaven consistency.
//   2. The havencontact channel: rate/100vd, feasted vs not, by wave,
//      species breakdown, vs true-field and vs feastdraw.
//   3. Veteran + scholar (mantle-holder) deaths in the havencontact channel.
//   4. Muster coverage of havencontact (active-muster windows + 2d post).
//   5. Feast-draw mechanism alongside (the other named haven channel).
//   6. Wall numbers.
//
// Usage: node scripts/diag-havencontact-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-havencontact');

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
const NAMED = ['feastdraw', 'raidreach', 'tent', 'trap', 'reengage', 'pending-other', 'havencontact', 'field'];

// ---- 1. attribution ----
const fights = [], vfights = [], ends = [];
for (const r of rows) { fights.push(...(r.fights || [])); vfights.push(...(r.vfights || [])); ends.push(...(r.ends || [])); }
const w4p = fights.filter(f => (f.wave | 0) >= 4);
const w4unattributed = w4p.filter(f => !NAMED.includes(f.origin));
const w4originCounts = {};
for (const f of w4p) w4originCounts[f.origin] = (w4originCounts[f.origin] || 0) + 1;
const hcInconsistent = w4p.filter(f => f.origin === 'havencontact' && f.atHaven !== true);

console.log('\n== 1. ATTRIBUTION (wave-4+ player fights) ==');
console.log(`village-days: ${villageDays}`);
console.log(`wave-4+ player fights: ${w4p.length} (${per100(w4p.length)}/100vd)`);
console.log(`attributed to named classes: ${w4p.length - w4unattributed.length}/${w4p.length} (${(100 * (w4p.length - w4unattributed.length) / Math.max(1, w4p.length)).toFixed(1)}%) — bar >=95%`);
if (w4unattributed.length) console.log('  UNATTRIBUTED:', JSON.stringify(w4unattributed.slice(0, 5).map(f => ({ day: f.day, mid: f.mid, origin: f.origin }))));
console.log('wave-4+ player origin shares:', JSON.stringify(w4originCounts));
console.log(`havencontact/atHaven consistency violations: ${hcInconsistent.length}`);
const hcf = w4p.filter(f => f.origin === 'havencontact');
console.log(`havencontact share of wave-4+ player fights: ${hcf.length}/${w4p.length} (${(100 * hcf.length / Math.max(1, w4p.length)).toFixed(1)}%)`);

// ---- 2. the havencontact channel ----
const hcFeasted = hcf.filter(f => f.feasted).length;
const hcWave = {};
for (const f of hcf) hcWave[f.wave] = (hcWave[f.wave] || 0) + 1;
const hcMid = {};
for (const f of hcf) hcMid[f.mid] = (hcMid[f.mid] || 0) + 1;
const topMids = Object.entries(hcMid).sort((a, b) => b[1] - a[1]).slice(0, 8);
const tf = w4p.filter(f => f.origin === 'field');
const fd = w4p.filter(f => f.origin === 'feastdraw');
console.log('\n== 2. THE HAVENCONTACT CHANNEL ==');
console.log(`havencontact wave-4+ fights: ${hcf.length} (${per100(hcf.length)}/100vd)`);
console.log(`  feasted: ${hcFeasted}, not feasted: ${hcf.length - hcFeasted}`);
console.log(`  by wave: ${JSON.stringify(hcWave)}`);
console.log(`  top species: ${JSON.stringify(topMids)}`);
console.log(`true-field wave-4+ fights: ${tf.length} (${per100(tf.length)}/100vd)`);
console.log(`feastdraw wave-4+ fights: ${fd.length} (${per100(fd.length)}/100vd)`);
const w4v = vfights.filter(v => (v.wave | 0) >= 4);
const w4vHaven = w4v.filter(v => ['raiddefense', 'lingerer', 'havengrounds'].includes(v.origin));
console.log(`wave-4+ villager fights: ${w4v.length} (${per100(w4v.length)}/100vd), haven-class: ${w4vHaven.length}`);

// ---- 2b. raid-shadow proxy: havencontact fights vs recent raid raiders ----
// A havencontact fight whose mid was a raider in a fired raid within the
// prior 6d (the lingerer gorge window) is plausibly raid aftermath (an unmet
// raider bumped at the haven) rather than true-ambient contact. Proxy only:
// monster identity is not recorded at combat_start.
let hcRaidShadow = 0, hcTrueAmbient = 0;
for (const r of rows) {
  const firedRaids = (r.raids || []).filter(x => x.fired);
  for (const f of (r.fights || [])) {
    if ((f.wave | 0) < 4 || f.origin !== 'havencontact') continue;
    const shadow = firedRaids.some(x => x.day <= f.day && x.day >= f.day - 6 &&
      (x.raiders || []).some(ra => ra.mid && ra.mid === f.mid));
    if (shadow) hcRaidShadow++; else hcTrueAmbient++;
  }
}
console.log('\n== 2b. RAID-SHADOW PROXY (havencontact fights) ==');
console.log(`raid-shadow (mid was a raider in a fired raid within prior 6d): ${hcRaidShadow}/${hcf.length}`);
console.log(`true-ambient (no such raid link): ${hcTrueAmbient}/${hcf.length}`);

// ---- 3. veteran + scholar deaths in the havencontact channel ----
const wklByVid = {};
for (const r of rows) for (const e of (r.waveKillLog || [])) {
  if (!e || !e.by) continue;
  (wklByVid[e.by] = wklByVid[e.by] || []).push({ d: e.d | 0, w: e.w | 0 });
}
function isVeteranBy(vid, day) {
  return ((wklByVid[vid] || []).some(e => e.d <= day && e.w >= 4));
}
function originOfDeath(r, d) {
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
const schHC = scholarDeaths.filter(x => x.origin === 'havencontact');
console.log('\n== 3. DEATHS IN THE HAVENCONTACT CHANNEL ==');
console.log(`in-scope veteran wave-4 deaths: ${vetDeaths.length} (${per100(vetDeaths.length)}/100vd), by origin: ${JSON.stringify(vetByOrigin)}`);
console.log(`scholar (mantle-holder) wave-4 deaths: ${scholarDeaths.length}, by origin: ${JSON.stringify(schByOrigin)}`);
console.log(`scholar deaths in havencontact: ${schHC.length} (${per100(schHC.length)}/100vd)`);
for (const x of schHC) console.log(`  SCHOLAR-HC d${x.day} s${x.seed}/${x.base} ${x.who}: basis=${x.basis} cause=${x.cause}`);
const vetHC = vetDeaths.filter(x => x.origin === 'havencontact');
console.log(`veteran deaths in havencontact (incl. scholar): ${vetHC.length}/${vetDeaths.length}`);

// ---- 4. muster coverage of havencontact ----
const raids = [];
for (const r of rows) raids.push(...(r.raids || []).filter(x => x.fired));
const musters = [];
for (const r of rows) musters.push(...(r.musters || []).filter(x => x.kind === 'muster'));
const standdowns = [];
for (const r of rows) standdowns.push(...(r.musters || []).filter(x => x.kind === 'standdown'));
console.log('\n== 4. MUSTER COVERAGE OF HAVENCONTACT ==');
console.log(`raids fired: ${raids.length} (${per100(raids.length)}/100vd)`);
console.log(`musters: ${musters.length} (${per100(musters.length)}/100vd), standdowns: ${standdowns.length}, mean sheltered: ${(sum(musters.map(m => m.sheltered || 0)) / Math.max(1, musters.length)).toFixed(1)}`);
// active-muster windows per config: muster day -> next standdown day (or run end)
let hcDuringMuster = 0, hcPostMuster2d = 0;
for (const r of rows) {
  const evts = (r.musters || []).slice().sort((a, b) => a.day - b.day);
  const windows = [];
  let open = null;
  for (const e of evts) {
    if (e.kind === 'muster' && open == null) open = e.day;
    else if (e.kind === 'standdown' && open != null) { windows.push([open, e.day]); open = null; }
  }
  if (open != null) windows.push([open, (r.days || 0) + 1]);
  const musterDays = (r.musters || []).filter(x => x.kind === 'muster').map(x => x.day);
  for (const f of (r.fights || [])) {
    if ((f.wave | 0) < 4 || f.origin !== 'havencontact') continue;
    if (windows.some(([lo, hi]) => f.day >= lo && f.day < hi)) hcDuringMuster++;
    else if (musterDays.some(md => f.day > md && f.day <= md + 2)) hcPostMuster2d++;
  }
}
console.log(`havencontact w4+ fights DURING an active muster: ${hcDuringMuster}/${hcf.length}`);
console.log(`havencontact w4+ fights within 2d AFTER a muster (not during): ${hcPostMuster2d}/${hcf.length}`);

// ---- 5. feast-draw mechanism (the other named haven channel) ----
const draws = [];
for (const r of rows) draws.push(...(r.draws || []));
const casts = draws.filter(d => d.kind === 'cast');
const castWave = {};
for (const c of casts) if (c.drawn) castWave[c.wave] = (castWave[c.wave] || 0) + 1;
const faces = draws.filter(d => d.kind === 'face'), drives = draws.filter(d => d.kind === 'driveoff');
console.log('\n== 5. FEAST-DRAW MECHANISM ==');
console.log(`casts: ${casts.length}, drawn: ${casts.filter(c => c.drawn).length}, by wave: ${JSON.stringify(castWave)}`);
console.log(`faced: ${faces.filter(f => f.ok).length}/${faces.length}, driven off: ${drives.filter(d => d.ok).length}/${drives.length}`);

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
const anchors = [...new Set(rows.map(r => r.anchorCommit))];
console.log(`anchors: ${anchors.join(',')}`);
