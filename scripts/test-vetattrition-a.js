// test-vetattrition-a.js — proof for sim-vetattrition-a (veteran-attrition DIAG).
// Proves the classifier (scripts/vetattrition-analyze-20261115.js) against
// hand-checked seeds recomputed from the raw per-seed JSONs, plus the frozen
// wave-5 id set, the kind-filter correction check, the unlock derivation,
// and the GO-bar arithmetic. Read-only over the corpora.
// Usage: node scripts/test-vetattrition-a.js (exit 0 = all pass)
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./vetattrition-analyze-20261115.js');

const REPO = path.join(__dirname, '..');
const MONSTERS = path.join(REPO, 'src', 'data', 'monsters.json');
const T_7REDEF = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-ep-tip-7redef-match');
const T_GUARD = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-ep-tip-guardablate');
const T_TGUARD = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-tguardablate');
const T_2B_BASE = path.join(REPO, 'evidence', '2026-11-15', 'perseed-transplant2b-fresh-t2b-fresh-203a32775');
const T_2B_SUBJ = path.join(REPO, 'evidence', '2026-11-15', 'perseed-transplant2b-fresh-t2b-fresh-385a9f7b6');
const G_CTRL = path.join(REPO, 'evidence', '2026-11-15', 'perseed-gorgeprice2-b-confirm-control');
const G_ARMED = path.join(REPO, 'evidence', '2026-11-15', 'perseed-gorgeprice2-b-confirm-on');
const ALL_DIRS = [T_7REDEF, T_GUARD, T_TGUARD, T_2B_BASE, T_2B_SUBJ, G_CTRL, G_ARMED];

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { passed += 1; }
  else { failed += 1; failures.push(name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function readSeed(dir, seedPart) {
  const f = fs.readdirSync(dir).filter(function (x) { return x.indexOf('-s' + seedPart + '-') >= 0 && x.endsWith('.json'); })[0];
  return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
}

// ---- §0 frozen wave-5 id set (same roster rule as analyze-wave5kill-b) ----
(function () {
  const m = A.loadMonsterWaves(MONSTERS);
  check('§0 w5 frozen set', eq(m.w5, ['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot']), m.w5);
  check('§0 w4 count is 10 (doc says 9 — herald is the 10th; doc drift, noted in evidence)', m.w4.length === 10, m.w4);
})();

// ---- §1 hand-check T seed 190391 (7redef-match) ----
// Hand walk of daily vetsW4 (from the raw file):
//   day 93 entry meera_reddy (companion kill of congregation)
//   day 105 entry visjoin_95/Chakib (aid-crisis kill of herald)
//   day 108 exit visjoin_95 — regDeaths day 108 cause "monster", killerId null;
//     NO spawns/fights/killCalls on days 107-108 (hand-read) => MONSTER-UNKNOWN-WAVE
//   day 126 entry carlos_diaz (player kills of congregation d125 + eulogy d139)
//   day 141 exit carlos_diaz — regDeaths day 140 cause "the wild", player:true;
//     scholarId changes show carlos scholar days 91-141 => WILD, scholarAtDeath
// Snapshots confirm: day 93 [meera], day 105 [meera, visjoin_95], day 141 [meera].
(function () {
  const d = readSeed(T_7REDEF, 190391);
  const m = A.loadMonsterWaves(MONSTERS);
  const s = A.analyzeTFile(d, m);
  check('§1 190391 no errors', eq(s.errors, []), s.errors);
  check('§1 190391 unlocked', s.unlocked === true && s.unlockDay === 105, { unlocked: s.unlocked, unlockDay: s.unlockDay });
  check('§1 190391 vet5@unlock 2', s.vet5AtUnlock === 2, s.vet5AtUnlock);
  check('§1 190391 vet5@end 1', s.vet5AtEnd === 1, s.vet5AtEnd);
  check('§1 190391 exits 2', s.exitsTotal === 2, s.exitsTotal);
  check('§1 190391 bornDead 0', s.bornDead.length === 0, s.bornDead);
  check('§1 190391 w4kills 4', s.w4Kills === 4, s.w4Kills);
  check('§1 190391 partyDays 0', s.partyNonEmptyDays === 0, s.partyNonEmptyDays);
  check('§1 190391 classified 2/2', s.classified === 2 && s.unclassified === 0, { c: s.classified, u: s.unclassified });
  const byVid = {};
  s.exits.forEach(function (x) { byVid[x.vid] = x; });
  const ch = byVid['visjoin_95'];
  check('§1 190391 Chakib exit day 108', ch && ch.exitDay === 108 && ch.lastSeenDay === 107, ch);
  check('§1 190391 Chakib death day 108 monster', ch && ch.deathDay === 108 && ch.deathCause === 'monster', ch);
  check('§1 190391 Chakib MONSTER-UNKNOWN-WAVE', ch && ch.causeClass === 'MONSTER-UNKNOWN-WAVE', ch);
  check('§1 190391 Chakib not scholar', ch && ch.scholarAtDeath === false, ch);
  check('§1 190391 Chakib fightWave null', ch && ch.fightWaveOnDeathDay === null, ch);
  const ca = byVid['carlos_diaz'];
  check('§1 190391 Carlos exit day 141', ca && ca.exitDay === 141 && ca.lastSeenDay === 140, ca);
  check('§1 190391 Carlos death day 140 wild', ca && ca.deathDay === 140 && ca.deathCause === 'the wild', ca);
  check('§1 190391 Carlos WILD', ca && ca.causeClass === 'WILD', ca);
  check('§1 190391 Carlos scholarAtDeath', ca && ca.scholarAtDeath === true, ca);
  check('§1 190391 Carlos scholarAtKill', ca && ca.scholarAtKill === true && ca.kills === 2, ca);
  check('§1 190391 Carlos daysAfterUnlock 36', ca && ca.daysAfterUnlock === 36, ca);
})();

// ---- §2 hand-check G seed 100528 (gorgeprice2 armed) ----
// Hand walk of series vet5 (from the raw file; unlock event day 77, first faced 78):
//   rises 70->71 (0->1), 76->77 (1->2), 86->87 (1->2), 102->103 (1->2), 133->134 (0->1)
//   drops: 84->85 mag 1, deaths in [84,85]: day 85 ethan_hunt "the wild" player:true => WILD
//          93->94 mag 1, deaths in [93,94]: day 93 gen_ba9fzbj "the night" player:true => OTHER:the night
//          121->122 mag 1, deaths in [121,122]: day 122 visjoin_57 "monster" => W5-ERA (faced 78)
//          129->130 mag 1, deaths in [129,130]: day 130 greta_hansen "monster" => W5-ERA
//          135->136 mag 1, deaths in [135,136]: day 136 stan_kowalski "the wild" player:true => WILD
(function () {
  const d = readSeed(G_ARMED, 100528);
  const m = A.loadMonsterWaves(MONSTERS);
  const s = A.analyzeGFile(d, m);
  check('§2 100528 no errors', eq(s.errors, []), s.errors);
  check('§2 100528 unlock 77', s.unlockDay === 77, s.unlockDay);
  check('§2 100528 firstFaced 78', s.firstFacedDay === 78, s.firstFacedDay);
  check('§2 100528 vet5@unlock 2', s.vet5AtUnlock === 2, s.vet5AtUnlock);
  check('§2 100528 vet5@end 0', s.vet5AtEnd === 0, s.vet5AtEnd);
  check('§2 100528 kills5 5', s.kills5 === 5, s.kills5);
  check('§2 100528 drops 5', s.dropsTotal === 5, s.dropsTotal);
  check('§2 100528 classified 5/5', s.classified === 5 && s.unclassified === 0, { c: s.classified, u: s.unclassified });
  const byDay = {};
  s.drops.forEach(function (x) { byDay[x.day] = x; });
  check('§2 100528 drop 85 WILD', byDay[85] && byDay[85].causeClass === 'WILD' && byDay[85].deathDay === 85 && byDay[85].scholarAtDeath === true, byDay[85]);
  check('§2 100528 drop 94 night', byDay[94] && byDay[94].causeClass === 'OTHER:the night' && byDay[94].deathDay === 93, byDay[94]);
  check('§2 100528 drop 122 W5-ERA', byDay[122] && byDay[122].causeClass === 'W5-ERA' && byDay[122].deathDay === 122 && byDay[122].deathCause === 'monster', byDay[122]);
  check('§2 100528 drop 130 W5-ERA', byDay[130] && byDay[130].causeClass === 'W5-ERA' && byDay[130].deathDay === 130, byDay[130]);
  check('§2 100528 drop 136 WILD', byDay[136] && byDay[136].causeClass === 'WILD' && byDay[136].deathDay === 136 && byDay[136].scholarAtDeath === true, byDay[136]);
  check('§2 100528 w5rows 5 all monster', s.w5rowsTotal === 5 && s.w5MonsterDeaths === 5 && s.w5VillagerDeaths === 0 && s.w5PlayerFlag === 0, s);
})();

// ---- §3 kind-filter correction totals (both G legs) ----
// wave5kill-b counted deaths rows with who in the w5 set, no kind filter:
// armed 12, control 16. Kind-filtered: ALL are kind "monster" (dead
// Producers); ZERO are villager deaths; ZERO carry the player flag.
(function () {
  const m = A.loadMonsterWaves(MONSTERS);
  const legs = {};
  [G_CTRL, G_ARMED].forEach(function (dir) { legs[dir] = A.analyzeDir(dir, m); });
  function tot(leg, k) { return leg.perSeed.reduce(function (a, s) { return a + (s[k] || 0); }, 0); }
  const c = legs[G_CTRL], a = legs[G_ARMED];
  check('§3 control kills5 14', tot(c, 'kills5') === 14, tot(c, 'kills5'));
  check('§3 control w5rows 16', tot(c, 'w5rowsTotal') === 16, tot(c, 'w5rowsTotal'));
  check('§3 control kindMonster 16', tot(c, 'w5MonsterDeaths') === 16, tot(c, 'w5MonsterDeaths'));
  check('§3 control kindVillager 0', tot(c, 'w5VillagerDeaths') === 0, tot(c, 'w5VillagerDeaths'));
  check('§3 control playerFlag 0', tot(c, 'w5PlayerFlag') === 0, tot(c, 'w5PlayerFlag'));
  check('§3 armed kills5 11', tot(a, 'kills5') === 11, tot(a, 'kills5'));
  check('§3 armed w5rows 12', tot(a, 'w5rowsTotal') === 12, tot(a, 'w5rowsTotal'));
  check('§3 armed kindMonster 12', tot(a, 'w5MonsterDeaths') === 12, tot(a, 'w5MonsterDeaths'));
  check('§3 armed kindVillager 0', tot(a, 'w5VillagerDeaths') === 0, tot(a, 'w5VillagerDeaths'));
  check('§3 armed playerFlag 0', tot(a, 'w5PlayerFlag') === 0, tot(a, 'w5PlayerFlag'));
})();

// ---- §4 unlock derivation (Correction 2: gated callers only) ----
// T unlocked counts must equal the maxWave-5 counts from the evidence
// files (7redef 4/8, guardablate 4/8, tguardablate 1/8, 2b-base 3/8,
// 2b-subj 3/8). Seeds whose only w5 spawns are titanPlace/finaleCampaign
// (maxWave 4) must NOT be unlocked.
(function () {
  const m = A.loadMonsterWaves(MONSTERS);
  const expected = {};
  expected[T_7REDEF] = 4; expected[T_GUARD] = 4; expected[T_TGUARD] = 1;
  expected[T_2B_BASE] = 3; expected[T_2B_SUBJ] = 3;
  [T_7REDEF, T_GUARD, T_TGUARD, T_2B_BASE, T_2B_SUBJ].forEach(function (dir) {
    const leg = A.analyzeDir(dir, m);
    check('§4 unlocked ' + path.basename(dir) + ' == ' + expected[dir],
      leg.pooled.unlocked === expected[dir], { got: leg.pooled.unlocked, want: expected[dir] });
    check('§4 no instrument errors ' + path.basename(dir), leg.pooled.instrumentErrors === 0, leg.pooled.instrumentErrors);
  });
  const phantom = { '190392': T_7REDEF, '190395': T_7REDEF, '190397': T_7REDEF };
  Object.keys(phantom).forEach(function (seed) {
    const d = readSeed(phantom[seed], seed);
    const s = A.analyzeTFile(d, m);
    check('§4 phantom seed ' + seed + ' not unlocked', s.unlocked === false, { unlockDay: s.unlockDay, nonGatedW5: s.nonGatedW5Spawns });
  });
  // Every G unlocked seed opens at vet5 == 2 (wave5kill-b's fact, re-derived).
  [G_CTRL, G_ARMED].forEach(function (dir) {
    const leg = A.analyzeDir(dir, m);
    const bad = leg.perSeed.filter(function (s) { return s.unlocked && s.vet5AtUnlock !== 2; });
    check('§4 all G unlocked open at vet5=2 (' + path.basename(dir) + ')', bad.length === 0, bad.map(function (s) { return s.seed + ':' + s.vet5AtUnlock; }));
  });
})();

// ---- §5 GO-bar arithmetic (frozen criterion: >=90% classified) ----
(function () {
  const m = A.loadMonsterWaves(MONSTERS);
  let exitsTotal = 0, classified = 0, unclassified = 0;
  const classCounts = {};
  let tExits = 0, tClass = 0, gExits = 0, gClass = 0;
  ALL_DIRS.forEach(function (dir) {
    const leg = A.analyzeDir(dir, m);
    exitsTotal += leg.pooled.exitsTotal;
    classified += leg.pooled.classified;
    unclassified += leg.pooled.unclassified;
    Object.keys(leg.pooled.classCounts).forEach(function (k) {
      classCounts[k] = (classCounts[k] || 0) + leg.pooled.classCounts[k];
    });
    if (leg.cls === 'T') { tExits += leg.pooled.exitsTotal; tClass += leg.pooled.classified; }
    else { gExits += leg.pooled.exitsTotal; gClass += leg.pooled.classified; }
  });
  check('§5 grand exits 139', exitsTotal === 139, exitsTotal);
  check('§5 grand classified 116', classified === 116, classified);
  check('§5 grand unclassified 23', unclassified === 23, unclassified);
  check('§5 grand share 0.835', Math.abs(classified / exitsTotal - 0.835) < 0.001, classified / exitsTotal);
  check('§5 T legs 70/70 classified', tExits === 70 && tClass === 70, { tExits: tExits, tClass: tClass });
  check('§5 G legs 46/69 classified', gExits === 69 && gClass === 46, { gExits: gExits, gClass: gClass });
  check('§5 residue is all AMBIGUOUS', (classCounts['AMBIGUOUS'] || 0) === 23, classCounts['AMBIGUOUS']);
  check('§5 WILD 76', (classCounts['WILD'] || 0) === 76, classCounts['WILD']);
  check('§5 W5-FIGHT 1, W4-FIGHT 2', (classCounts['W5-FIGHT'] || 0) === 1 && (classCounts['W4-FIGHT'] || 0) === 2, classCounts);
  check('§5 GO bar 90% FAILS (0.835 < 0.90)', classified / exitsTotal < 0.90, classified / exitsTotal);
  check('§5 no NON-DEATH-EXIT remains', (classCounts['NON-DEATH-EXIT'] || 0) === 0, classCounts['NON-DEATH-EXIT']);
})();

// ---- §6 determinism: same input, same output ----
(function () {
  const m = A.loadMonsterWaves(MONSTERS);
  const a = JSON.stringify(A.analyzeDir(T_7REDEF, m));
  const b = JSON.stringify(A.analyzeDir(T_7REDEF, m));
  check('§6 analyzer deterministic', a === b);
})();

console.log(JSON.stringify({ passed: passed, failed: failed, failures: failures }, null, 2));
process.exit(failed ? 1 : 0);
