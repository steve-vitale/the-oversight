// analyze-xp-gear-panel-20261105.js — compare before/after XP-gear panels.
// Usage:
//   node scripts/analyze-xp-gear-panel-20261105.js --seeds 7,42,99,1234,555,777,2026,31337 \
//     > evidence/2026-11-05/xp-gear-panel-analysis.md
// Reads evidence/2026-11-05/xp-gear-panel-{before,after}/xp-gear-<seed>.stdout.json
// Bars: see evidence/2026-11-05/xp-gear-prereg.md (A XP, B holdings, C Healers,
// D wave-4 survival; guardrails: survival days + wins not worse).
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-11-05');
function arg(n, d) { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; }
const SEEDS = arg('seeds', '7,42,99,1234,555,777,2026,31337').split(',').map(Number);
const TH = [18, 48, 96, 192, 384];
const lvl = xp => { let l = 0; for (const t of TH) if ((xp || 0) >= t) l++; return l; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const sum = a => a.reduce((x, y) => x + y, 0);
const fmt = (x, d = 2) => (x == null || !Number.isFinite(x)) ? 'n/a' : x.toFixed(d);

function load(arm, seed) {
  const fp = path.join(EVID, 'xp-gear-panel-' + arm, 'xp-gear-' + seed + '.stdout.json');
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function metricsFor(r) {
  if (!r || r.excluded) return null;
  const m = {};
  // --- XP (from the deed-credit feed: the XP actually granted) ---
  const dc = r.deedCredits || [];
  m.deedCredits = dc.length;
  m.deedXpByTrack = {};
  for (const c of dc) { const t = c.track || 'unknown'; m.deedXpByTrack[t] = (m.deedXpByTrack[t] || 0) + (c.n || 1); }
  m.deedXpTotal = sum(Object.values(m.deedXpByTrack));
  // living-villager-days from daily samples (player + villagers)
  const villagerDays = sum((r.samples || []).map(s => s.living || 0));
  const days = (r.samples || []).length || r.gameDays || 0;
  m.xpPerVillagerDay = villagerDays > 0 ? m.deedXpTotal / villagerDays : 0;
  m.xpPerTrackPerVillagerDay = {};
  for (const [t, x] of Object.entries(m.deedXpByTrack)) m.xpPerTrackPerVillagerDay[t] = villagerDays > 0 ? x / villagerDays : 0;
  // deed mix: which deeds actually fired
  m.deedMix = {};
  for (const c of dc) m.deedMix[c.deed] = (m.deedMix[c.deed] || 0) + 1;
  // --- end-state thresholds + holdings ---
  const ec = r.endCensus || {};
  let thresholds = 0; const perTrack = { combat: 0, field: 0, social: 0, craft: 0, strange: 0 };
  let abilitiesHeld = 0; const distinct = new Set();
  const countXp = x => { for (const t of Object.keys(perTrack)) if (lvl((x || {})[t] || 0) >= 1) { thresholds++; perTrack[t]++; } };
  countXp(ec.playerTracks && Object.fromEntries(Object.entries(ec.playerTracks).map(([t, v]) => [t, (v && v.xp) || 0])));
  for (const a of (ec.playerAbilities || [])) { abilitiesHeld++; if (a) distinct.add(a); }
  for (const vid of Object.keys(ec.npcXp || {})) countXp(ec.npcXp[vid]);
  for (const [vid, abs] of Object.entries(ec.npcAbilities || {})) for (const a of (abs || [])) { abilitiesHeld++; distinct.add(typeof a === 'string' ? a : (a && a.id) || String(a)); }
  m.thresholds = thresholds; m.perTrack = perTrack;
  m.abilitiesHeld = abilitiesHeld; m.abilitiesPerLiving = (ec.living || 0) > 0 ? abilitiesHeld / ec.living : 0;
  m.distinctAbilities = distinct.size;
  // --- recognized Healers ---
  let healers = 0; const healerIds = [];
  if (ec.playerGodpath && ec.playerGodpath.path === 'caregiver' && ec.playerGodpath.subclass === 'healer' && !ec.playerGodpath.lapsed) { healers++; healerIds.push('player'); }
  for (const [vid, rec] of Object.entries(ec.npcGodpath || {})) if (rec && rec.path === 'caregiver' && rec.subclass === 'healer' && !rec.lapsed) { healers++; healerIds.push(vid); }
  m.healers = healers; m.healerIds = healerIds;
  // --- wave-4 fights ---
  const w4 = (r.fights || []).filter(f => f.wave === 4);
  m.w4Fights = w4.length;
  m.w4Rounds = mean(w4.map(f => f.rounds || 0));
  m.w4Kills = w4.filter(f => f.outcome === 'vKill').length;
  m.w4Deaths = w4.filter(f => f.outcome === 'vDie').length;
  m.w4VTaken = mean(w4.map(f => f.vTaken || 0));
  m.w4MDealt = mean(w4.map(f => f.mDealt || 0));
  m.w4FfFired = {};
  for (const f of w4) for (const a of (f.ffFired || [])) m.w4FfFired[a] = (m.w4FfFired[a] || 0) + 1;
  m.w4Outcomes = {};
  for (const f of w4) m.w4Outcomes[f.outcome || '?'] = (m.w4Outcomes[f.outcome || '?'] || 0) + 1;
  // wave-4+ kills from the kill log
  m.w4PlusKills = ((r.endCensus || {}).waveKills || []).filter(k => ((k.wave || k.w || 0) >= 4)).length;
  // --- healing ---
  m.healChecks = (r.healChecks || []).length;
  m.healHpGained = sum((r.healChecks || []).map(h => Math.max(0, ((h.after ?? h.before ?? 0) - (h.before ?? 0)))));
  m.careRescues = (r.careRescues || []).length;
  m.careRescueByVia = {};
  for (const c of (r.careRescues || [])) m.careRescueByVia[c.via || '?'] = (m.careRescueByVia[c.via || '?'] || 0) + 1;
  m.triages = (r.triages || []).length;
  m.healingDeedCredits = dc.filter(c => c.deed === 'healing').length;
  // --- patrol deed + synergy + combat-42 (r104 follow-up) ---
  // deedCredits records n (the deed's face value) AND credited (what
  // creditDeed actually granted — 0 when the per-day cap bit). Patrol
  // grants count only credited > 0: a second patrol the same day is
  // capped, not granted.
  m.patrolCredits = dc.filter(c => c.deed === 'patrol').length;
  m.patrolGranted = dc.filter(c => c.deed === 'patrol' && (c.credited || 0) > 0).length;
  const sc = r.synergyCredits || [];
  m.synergyCalls = sc.length;
  m.synergyGranted = sc.filter(s => (s.granted || 0) > 0).length;
  m.synergyMix = {};
  for (const s of sc) if ((s.granted || 0) > 0) m.synergyMix[s.synergy] = (m.synergyMix[s.synergy] || 0) + 1;
  m.combat42 = r.combat42 || null;
  // --- guardrails ---
  m.gameDays = r.gameDays; m.won = r.won; m.waveReach = r.waveReach;
  m.deathsTotal = sum(Object.values(r.deaths || {}));
  m.livingEnd = ec.living || 0;
  return m;
}

function aggregate(rows) {
  const a = {};
  const keys = ['deedCredits', 'deedXpTotal', 'xpPerVillagerDay', 'thresholds', 'abilitiesHeld', 'abilitiesPerLiving', 'distinctAbilities', 'healers', 'w4Fights', 'w4Rounds', 'w4Kills', 'w4Deaths', 'w4VTaken', 'w4MDealt', 'w4PlusKills', 'healChecks', 'healHpGained', 'careRescues', 'triages', 'healingDeedCredits', 'gameDays', 'won', 'waveReach', 'deathsTotal', 'livingEnd', 'patrolCredits', 'patrolGranted', 'synergyCalls', 'synergyGranted'];
  for (const k of keys) a[k] = mean(rows.map(r => r[k] || 0));
  a.seeds = rows.length;
  a.combat42Max = mean(rows.map(r => (r.combat42 && r.combat42.maxCombat) || 0));
  a.combat42Crossed = sum(rows.map(r => (r.combat42 && r.combat42.crossed18) || 0));
  a.combat42Living = mean(rows.map(r => (r.combat42 && r.combat42.living) || 0));
  a.deedMix = {}; a.perTrack = {}; a.w4Outcomes = {}; a.careRescueByVia = {}; a.deedXpByTrack = {}; a.synergyMix = {};
  for (const r of rows) {
    for (const [k, v] of Object.entries(r.synergyMix || {})) a.synergyMix[k] = (a.synergyMix[k] || 0) + v;
    for (const [k, v] of Object.entries(r.deedMix || {})) a.deedMix[k] = (a.deedMix[k] || 0) + v;
    for (const [k, v] of Object.entries(r.perTrack || {})) a.perTrack[k] = (a.perTrack[k] || 0) + v;
    for (const [k, v] of Object.entries(r.w4Outcomes || {})) a.w4Outcomes[k] = (a.w4Outcomes[k] || 0) + v;
    for (const [k, v] of Object.entries(r.careRescueByVia || {})) a.careRescueByVia[k] = (a.careRescueByVia[k] || 0) + v;
    for (const [k, v] of Object.entries(r.deedXpByTrack || {})) a.deedXpByTrack[k] = (a.deedXpByTrack[k] || 0) + v;
  }
  return a;
}

const before = [], after = [];
for (const seed of SEEDS) {
  const b = load('before', seed), a = load('after', seed);
  if (b) { const m = metricsFor(b); if (m) before.push({ seed, ...m }); }
  if (a) { const m = metricsFor(a); if (m) after.push({ seed, ...m }); }
}
if (!before.length && !after.length) { console.log('No panel files found under ' + EVID); process.exit(1); }
const B = before.length ? aggregate(before) : null;
const A = after.length ? aggregate(after) : null;
const L = [];
L.push('# XP coverage + synergy + gear + healer road — panel analysis');
L.push('');
L.push(`Seeds: ${SEEDS.join(', ')} (capable policy, 120 days). Before: ${before.length} seeds. After: ${after.length} seeds.`);
L.push('');
const cmp = (label, bf, af, better, bar) => {
  const b = B ? fmt(bf(B)) : 'n/a', a = A ? fmt(af(A)) : 'n/a';
  let verdict = '';
  if (B && A) {
    const pass = better(B, A);
    verdict = pass ? 'PASS' : 'MISS';
    if (bar) verdict += ' (bar: ' + bar + ')';
  }
  L.push(`- ${label}: before ${b} / after ${a} ${verdict}`);
};
L.push('## A. XP acquisition (bar: after >= 2x before XP/villager/day; thresholds after > before)');
if (B || A) {
  cmp('deed XP per living villager per day', b => b.xpPerVillagerDay, a => a.xpPerVillagerDay, (b, a) => a.xpPerVillagerDay >= 2 * b.xpPerVillagerDay, '>= 2x');
  cmp('total deed XP granted (panel)', b => b.deedXpTotal * b.seeds, a => a.deedXpTotal * a.seeds, (b, a) => a.deedXpTotal > b.deedXpTotal, '>');
  cmp('thresholds crossed (level>=1, panel)', b => b.thresholds * b.seeds, a => a.thresholds * a.seeds, (b, a) => a.thresholds > b.thresholds, '>');
  L.push(`  deed XP by track (panel): before ${JSON.stringify(B ? B.deedXpByTrack : {})} / after ${JSON.stringify(A ? A.deedXpByTrack : {})}`);
  L.push(`  deed mix (panel): before ${JSON.stringify(B ? B.deedMix : {})}`);
  L.push(`  deed mix (panel): after  ${JSON.stringify(A ? A.deedMix : {})}`);
  L.push(`  thresholds per track (panel): before ${JSON.stringify(B ? B.perTrack : {})} / after ${JSON.stringify(A ? A.perTrack : {})}`);
}
L.push('## B. Ability holdings (bar: abilities per living villager after > before; distinct after > before)');
if (B || A) {
  cmp('abilities held per living villager', b => b.abilitiesPerLiving, a => a.abilitiesPerLiving, (b, a) => a.abilitiesPerLiving > b.abilitiesPerLiving, '>');
  cmp('distinct abilities held (panel mean)', b => b.distinctAbilities, a => a.distinctAbilities, (b, a) => a.distinctAbilities > b.distinctAbilities, '>');
}
L.push('## C. Recognized Healers (bar: after >= 1 where before had ~none)');
if (B || A) {
  cmp('recognized Healers (panel mean)', b => b.healers, a => a.healers, (b, a) => a.healers >= 1 && b.healers < 1, 'after >= 1, before ~0');
  if (A) L.push(`  healer ids (after): ${JSON.stringify(after.map(r => r.healerIds))}`);
}
L.push('## D. Wave-4 survival (bar: rounds after >= 1.25x before; deaths after < before; kills not worse)');
if (B || A) {
  cmp('mean rounds per wave-4 fight', b => b.w4Rounds, a => a.w4Rounds, (b, a) => a.w4Rounds >= 1.25 * b.w4Rounds, '>= 1.25x');
  cmp('fighter deaths in wave-4 fights (panel mean)', b => b.w4Deaths, a => a.w4Deaths, (b, a) => a.w4Deaths < b.w4Deaths, '<');
  cmp('wave-4 kills (panel mean)', b => b.w4Kills, a => a.w4Kills, (b, a) => a.w4Kills >= b.w4Kills, '>=');
  cmp('wave-4+ kills in kill log (panel mean)', b => b.w4PlusKills, a => a.w4PlusKills, (b, a) => a.w4PlusKills >= b.w4PlusKills, '>=');
  cmp('mean damage taken per wave-4 fight', b => b.w4VTaken, a => a.w4VTaken, (b, a) => a.w4VTaken < b.w4VTaken, '<');
  L.push(`  wave-4 fights (panel mean): before ${fmt(B ? B.w4Fights : null)} / after ${fmt(A ? A.w4Fights : null)}`);
  L.push(`  wave-4 outcomes (panel): before ${JSON.stringify(B ? B.w4Outcomes : {})} / after ${JSON.stringify(A ? A.w4Outcomes : {})}`);
}
L.push('## E. Patrol deed + synergy wild fire + combat-42 (r104 follow-up; bars unchanged, new measurement)');
if (B || A) {
  cmp('patrol deed credits granted (panel mean)', b => b.patrolGranted, a => a.patrolGranted, (b, a) => a.patrolGranted > b.patrolGranted, '>');
  L.push(`  patrol deed credits raw incl. capped (panel total): before ${B ? fmt(B.patrolCredits * B.seeds, 0) : 'n/a'} / after ${A ? fmt(A.patrolCredits * A.seeds, 0) : 'n/a'} (granted after: ${A ? fmt(A.patrolGranted * A.seeds, 0) : 'n/a'})`);
  cmp('synergy bonuses granted (panel mean)', b => b.synergyGranted, a => a.synergyGranted, (b, a) => a.synergyGranted > b.synergyGranted, '> 0 (before has no synergy table)');
  L.push(`  synergy granted by id (panel): after ${JSON.stringify(A ? A.synergyMix : {})}`);
  // NOTE: the before-arm JSONs predate the combat42 snapshot, so their
  // panel mean reads 0 — the true before is r104's published 17 (section F).
  cmp('max combat XP at day 42, living villagers (panel mean of seed maxima)', b => b.combat42Max, a => a.combat42Max, (b, a) => a.combat42Max >= 18, '>= 18 (r104 before: 17)');
  L.push(`  villagers crossed combat 18 by day 42 (panel total): before ${B ? B.combat42Crossed : 'n/a'} / after ${A ? A.combat42Crossed : 'n/a'} (r104: 0/29)`);
}
// --- establishment window (r104 follow-up): competent / 42d / seeds 1501-1504 ---
// BEFORE (published r104, master 1de41ff6f, same base/seeds/policy/horizon):
// max combat XP 17, 0/29 living villagers crossed 18.
const EST42_SEEDS = [1501, 1502, 1503, 1504];
const est42 = [];
for (const seed of EST42_SEEDS) {
  const fp = path.join(EVID, 'xp-gear-est42-after', 'xp-gear-' + seed + '.stdout.json');
  if (!fs.existsSync(fp)) continue;
  const r = JSON.parse(fs.readFileSync(fp, 'utf8'));
  if (r && !r.excluded && r.combat42) est42.push({ seed, ...r.combat42 });
}
if (est42.length) {
  L.push('## F. Establishment window — 42 days, competent, seeds 1501-1504 (r104 follow-up)');
  L.push('  BEFORE (r104 published, same base/seeds/policy/horizon): max combat XP 17, 0/29 living villagers crossed 18.');
  for (const e of est42) L.push(`  - seed ${e.seed}: day ${e.day} living ${e.living} max combat XP ${e.maxCombat} crossed 18: ${e.crossed18}`);
  const mx = Math.max(...est42.map(e => e.maxCombat));
  const tot = est42.reduce((x, e) => x + e.crossed18, 0);
  const liv = est42.reduce((x, e) => x + e.living, 0);
  L.push(`  AFTER (this build): max combat XP ${mx}, ${tot}/${liv} living villagers crossed 18 by day 42. ${tot > 0 ? 'REACHABLE — 18 crossed in-window.' : 'NOT REACHED — 18 still uncrossed in 42 days.'}`);
}
L.push('## Healing (supporting)');
if (B || A) {
  cmp('heal checks (panel mean)', b => b.healChecks, a => a.healChecks, (b, a) => a.healChecks > b.healChecks, '>');
  cmp('care rescues — saves (panel mean)', b => b.careRescues, a => a.careRescues, (b, a) => a.careRescues > b.careRescues, '>');
  cmp('triage runs (panel mean)', b => b.triages, a => a.triages, (b, a) => a.triages > b.triages, '>');
  cmp("'healing' deed credits (panel mean)", b => b.healingDeedCredits, a => a.healingDeedCredits, (b, a) => a.healingDeedCredits > b.healingDeedCredits, '>');
  L.push(`  care rescues by via (panel): before ${JSON.stringify(B ? B.careRescueByVia : {})} / after ${JSON.stringify(A ? A.careRescueByVia : {})}`);
}
L.push('## Guardrails (investigate if worse; not auto-fail)');
if (B || A) {
  cmp('survival days (panel mean)', b => b.gameDays, a => a.gameDays, (b, a) => a.gameDays >= b.gameDays, '>= before');
  cmp('wins (panel mean)', b => b.won, a => a.won, (b, a) => a.won >= b.won, '>= before');
  cmp('total deaths (panel mean)', b => b.deathsTotal, a => a.deathsTotal, (b, a) => a.deathsTotal <= b.deathsTotal, '<= before');
  cmp('living at end (panel mean)', b => b.livingEnd, a => a.livingEnd, (b, a) => a.livingEnd >= b.livingEnd, '>= before');
}
L.push('');
L.push('## Per-seed (before)');
for (const r of before) L.push(`- seed ${r.seed}: gameDays ${r.gameDays} won ${r.won} xp/vday ${fmt(r.xpPerVillagerDay)} thresholds ${r.thresholds} abilities/living ${fmt(r.abilitiesPerLiving)} healers ${r.healers} w4fights ${r.w4Fights} w4rounds ${fmt(r.w4Rounds)} w4kills ${r.w4Kills} w4deaths ${r.w4Deaths}`);
L.push('## Per-seed (after)');
for (const r of after) L.push(`- seed ${r.seed}: gameDays ${r.gameDays} won ${r.won} xp/vday ${fmt(r.xpPerVillagerDay)} thresholds ${r.thresholds} abilities/living ${fmt(r.abilitiesPerLiving)} healers ${r.healers} w4fights ${r.w4Fights} w4rounds ${fmt(r.w4Rounds)} w4kills ${r.w4Kills} w4deaths ${r.w4Deaths}`);
console.log(L.join('\n'));
