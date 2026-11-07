// test-loadoutcensus-20261107.js — proof for the loadout census (arm sim-loadoutcensus-b).
// Legs: keep-score math, classification, synthetic-loadout control (the
// instrument must read a known shift), earned-vs-kept distinction, analyzer
// diff logic on fixture corpora, and a LIVE determinism leg (census identical
// across re-runs on one seed) + live smoke (roster 12, pools of 8, keep 5 /
// stash 3). Usage: node scripts/test-loadoutcensus-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const CENSUS = require(path.join(REPO, 'scripts', 'loadoutcensus-20261107'));
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-loadoutcensus-20261107'));

let pass = 0, fail = 0;
const failed = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; failed.push(name); console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// --- 1. keepScoreDet math (game.js:1920, deterministic part) ----------------
check('score weapon bonus 12 -> 120', CENSUS.keepScoreDet({ weapon: { bonus: 12 } }) === 120);
check('score armor prot 20 -> 100 (C1 hide armor)', CENSUS.keepScoreDet({ armor: { protection: 20 } }) === 100);
check('score armor prot 30 -> 150 (P2 hide armor)', CENSUS.keepScoreDet({ armor: { protection: 30 } }) === 150);
check('score tool -> +50', CENSUS.keepScoreDet({ tool: {} }) === 50);
check('score sentimental -> +1000', CENSUS.keepScoreDet({ class: 'sentimental' }) === 1000);
check('score empty def -> 0', CENSUS.keepScoreDet({}) === 0);

// --- 2. classification -------------------------------------------------------
(function () {
  const w = CENSUS.classifyItem({ weapon: { bonus: 8 } });
  check('classify weapon', w.kind === 'weapon' && w.hasWeapon && !w.hasArmor);
  const dual = CENSUS.classifyItem({ weapon: { bonus: 20 }, tool: {} });
  check('classify dual weapon+tool: kind weapon, both flags', dual.kind === 'weapon' && dual.hasWeapon && dual.hasTool);
  const a = CENSUS.classifyItem({ armor: { protection: 30 } });
  check('classify armor', a.kind === 'armor' && a.hasArmor);
  const s = CENSUS.classifyItem({ class: 'sentimental' });
  check('classify sentimental', s.kind === 'sentimental' && s.sentimental);
  const o = CENSUS.classifyItem({ class: 'food' });
  check('classify other', o.kind === 'other' && !o.hasWeapon && !o.hasTool && !o.hasArmor);
})();

// --- 3. Synthetic-loadout control: the instrument reads a known shift --------
// Pool: a bonus-12 weapon (scoreDet 120) against hide armor. At C1 protection
// 20 -> 100 (weapon outranks armor); at P2 protection 30 -> 150 (armor wins).
// The keep-score ORDER must flip — that is the shift the census is built to see.
(function () {
  const weapon = { id: 'hunting_bow', name: 'Hunting bow', weapon: { bonus: 12 } };
  const armorC1 = { id: 'hide_armor', name: 'Hide armor', armor: { protection: 20 } };
  const armorP2 = { id: 'hide_armor', name: 'Hide armor', armor: { protection: 30 } };
  const c1Order = CENSUS.keepScoreDet(weapon) > CENSUS.keepScoreDet(armorC1);
  const p2Order = CENSUS.keepScoreDet(weapon) < CENSUS.keepScoreDet(armorP2);
  check('synthetic control: C1 weapon outranks hide armor (120>100)', c1Order);
  check('synthetic control: P2 hide armor outranks weapon (150>120)', p2Order);
  check('synthetic control: order flips C1->P2', c1Order && p2Order);
})();

// --- 3b. Grounded in real data: tip items.json carries the retune, C1 does not.
(function () {
  try {
    const tipItems = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'items.json'), 'utf8'));
    const byId = {};
    tipItems.forEach(function (i) { if (i && i.id) byId[i.id] = i; });
    check('real data (tip): hide armor protection 30', byId.hide_armor && byId.hide_armor.armor && byId.hide_armor.armor.protection === 30);
    check('real data (tip): SWAT vest protection 53', byId.swat_vest && byId.swat_vest.armor && byId.swat_vest.armor.protection === 53);
    const c1Raw = execSync('git show 16369893c:src/data/items.json', { cwd: REPO }).toString();
    const c1Items = JSON.parse(c1Raw);
    const c1ById = {};
    c1Items.forEach(function (i) { if (i && i.id) c1ById[i.id] = i; });
    check('real data (C1): hide armor protection 20', c1ById.hide_armor && c1ById.hide_armor.armor && c1ById.hide_armor.armor.protection === 20);
    check('real data (C1): SWAT vest protection 35', c1ById.swat_vest && c1ById.swat_vest.armor && c1ById.swat_vest.armor.protection === 35);
  } catch (e) {
    check('real data grounding readable', false, String(e.message).slice(0, 120));
  }
})();

// --- 4. Earned-vs-kept distinction -------------------------------------------
// A weapon in the stash is OWNED but not carried and not worn: kept counts 0,
// stashed counts 1, no melee equipped. A kept weapon IS worn.
(function () {
  function row(id, kind) {
    const base = { id: id, kind: kind, hasWeapon: kind === 'weapon', hasTool: kind === 'tool', hasArmor: kind === 'armor', sentimental: kind === 'sentimental', weaponBonus: 0, protection: 0, keepScoreDet: 0, kept: true };
    return base;
  }
  const stashedWeapon = {
    kept: [row('hide_armor', 'armor'), row('rope', 'tool'), row('charm', 'sentimental'), row('pot', 'other'), row('boots', 'armor')],
    stashed: [row('hunting_bow', 'weapon'), row('knife', 'weapon'), row('cloak', 'armor')],
    equipped: {},
  };
  const s1 = CENSUS.summarizeVillager(stashedWeapon);
  check('earned-vs-kept: stashed weapon is not a kept weapon', s1.weaponsKept === 0 && s1.weaponsStashed === 2);
  check('earned-vs-kept: stashed weapon is not worn (no melee)', s1.hasMelee === false);
  const keptWeapon = {
    kept: [row('hunting_bow', 'weapon'), row('hide_armor', 'armor'), row('rope', 'tool'), row('charm', 'sentimental'), row('pot', 'other')],
    stashed: [row('cloak', 'armor'), row('spare_rope', 'tool'), row('rag', 'other')],
    equipped: { melee: { itemId: 'hunting_bow', name: 'Hunting bow' }, torso: { itemId: 'hide_armor', name: 'Hide armor' } },
  };
  const s2 = CENSUS.summarizeVillager(keptWeapon);
  check('earned-vs-kept: kept weapon counts and is worn', s2.weaponsKept === 1 && s2.hasMelee === true && s2.armorPiecesEquipped === 1);
  check('earned-vs-kept: armor share counts kept only', s2.armorKept === 1);
})();

// --- 5. Analyzer on fixture corpora: diff, aggregate, bars ------------------
(function () {
  // Fixture pools use STABLE item ids across C1/P2 (as real census data does):
  // each villager's 8-item pool is fixed; only the kept-5 subset moves.
  function mkVillager(id, name, poolKinds, keptIds, melee) {
    function r(kind, n) { return { id: kind + '_' + n, kind: kind, hasWeapon: kind === 'weapon', hasTool: kind === 'tool', hasArmor: kind === 'armor', sentimental: kind === 'sentimental', weaponBonus: 0, protection: 0, keepScoreDet: 0, kept: true }; }
    const pool = poolKinds.map(function (k, i) { return r(k, i); });
    const byId = {};
    pool.forEach(function (x) { byId[x.id] = x; });
    const kept = keptIds.map(function (x) { return byId[x]; });
    const stashed = pool.filter(function (x) { return keptIds.indexOf(x.id) < 0; });
    const row = { id: id, name: name, pool: pool, kept: kept, stashed: stashed, equipped: melee ? { melee: { itemId: keptIds[0], name: 'w' } } : {} };
    row.summary = CENSUS.summarizeVillager(row);
    return row;
  }
  // v1 pool: weapon,weapon,tool,armor,sentimental,armor,tool,other.
  // C1 keeps both weapons (weapons 2, armor 1); P2 swaps weapon_1 out for armor_5 (weapons 1, armor 2).
  // v2 pool: weapon,tool,tool,armor,other,weapon,armor,other.
  // C1 keeps weapon_0 (weapons 1, armor 1); P2 swaps weapon_0 out for armor_6 (weapons 0, armor 2).
  const c1 = { 53001: { seed: 53001, villagers: [
    mkVillager('v1', 'Ana', ['weapon', 'weapon', 'tool', 'armor', 'sentimental', 'armor', 'tool', 'other'], ['weapon_0', 'weapon_1', 'tool_2', 'armor_3', 'sentimental_4'], true),
    mkVillager('v2', 'Bo', ['weapon', 'tool', 'tool', 'armor', 'other', 'weapon', 'armor', 'other'], ['weapon_0', 'tool_1', 'tool_2', 'armor_3', 'other_4'], true),
  ] } };
  const p2 = { 53001: { seed: 53001, villagers: [
    mkVillager('v1', 'Ana', ['weapon', 'weapon', 'tool', 'armor', 'sentimental', 'armor', 'tool', 'other'], ['weapon_0', 'armor_5', 'tool_2', 'armor_3', 'sentimental_4'], false),
    mkVillager('v2', 'Bo', ['weapon', 'tool', 'tool', 'armor', 'other', 'weapon', 'armor', 'other'], ['armor_6', 'tool_1', 'tool_2', 'armor_3', 'other_4'], false),
  ] } };
  const a1 = ANALYZE.aggregate(c1), a2 = ANALYZE.aggregate(p2);
  check('analyzer fixture: C1 mean weapons kept 1.5', a1.meanWeaponsKept === 1.5, 'got ' + a1.meanWeaponsKept);
  check('analyzer fixture: P2 mean weapons kept 0.5', a2.meanWeaponsKept === 0.5, 'got ' + a2.meanWeaponsKept);
  check('analyzer fixture: armor share rises 0.2 -> 0.4', a1.armorKeptShare === 0.2 && a2.armorKeptShare === 0.4, 'got ' + a1.armorKeptShare + ' -> ' + a2.armorKeptShare);
  const d = ANALYZE.diffKeeps(c1, p2);
  check('analyzer fixture: both villagers changed keeps', d.nChanged === 2 && d.nSame === 0);
  check('analyzer fixture: swap lists name the armor in / weapon out', d.changed.length === 2 && d.changed[0].in.length === 1 && d.changed[0].out.length === 1);
  const mm = ANALYZE.checkPoolIdentity(c1, p2);
  check('analyzer fixture: pool identity holds (same pool ids)', mm.length === 0, JSON.stringify(mm).slice(0, 200));
  // No-shift pair must read NO-GO by the bar logic (weapons down 0, share up 0).
  const dW = +(a2.meanWeaponsKept - a1.meanWeaponsKept).toFixed(3);
  const dS = +(a2.armorKeptShare - a1.armorKeptShare).toFixed(3);
  check('bars: fixture shift clears bar A (weapons down >= 1)', dW <= -1.0);
  const aSame = ANALYZE.aggregate(c1);
  check('bars: identical corpora clear neither bar', !((+(aSame.meanWeaponsKept - a1.meanWeaponsKept).toFixed(3)) <= -1.0) && !((+(aSame.armorKeptShare - a1.armorKeptShare).toFixed(3)) >= 0.10));
})();

// --- 6. LIVE legs: determinism + smoke (1 seed, current checkout) ------------
(function () {
  const tmpA = '/tmp/loadoutcensus-proof/a', tmpB = '/tmp/loadoutcensus-proof/b';
  try {
    execSync('rm -rf /tmp/loadoutcensus-proof && mkdir -p ' + tmpA + ' ' + tmpB, { cwd: REPO });
    const env = Object.assign({}, process.env, { SEEDS: '53001', LABEL: 'proofdet' });
    execSync('node scripts/loadoutcensus-20261107.js', { cwd: REPO, env: Object.assign({}, env, { OUTDIR: tmpA }), timeout: 300000, stdio: 'pipe' });
    execSync('node scripts/loadoutcensus-20261107.js', { cwd: REPO, env: Object.assign({}, env, { OUTDIR: tmpB }), timeout: 300000, stdio: 'pipe' });
    const fa = fs.readFileSync(path.join(tmpA, 'loadoutcensus-b-s53001-proofdet.json'), 'utf8');
    const fb = fs.readFileSync(path.join(tmpB, 'loadoutcensus-b-s53001-proofdet.json'), 'utf8');
    check('live determinism: census identical across re-runs (seed 53001)', fa === fb, 'bytes ' + fa.length + ' vs ' + fb.length);
    const j = JSON.parse(fa);
    check('live smoke: roster 12 villagers', j.villagers.length === 12, 'got ' + j.villagers.length);
    const bad = j.villagers.filter(function (v) { return v.poolSize !== 8 || v.kept.length !== 5 || v.stashed.length !== 3; });
    check('live smoke: every villager pool 8 / kept 5 / stashed 3', bad.length === 0, bad.length + ' violators');
    check('live smoke: no instrument errors', (j.errors || []).length === 0, JSON.stringify(j.errors).slice(0, 200));
  } catch (e) {
    check('live legs ran', false, String(e.message).slice(0, 200));
  }
})();

console.log('\n' + pass + '/' + (pass + fail) + ' PASS' + (failed.length ? ' — FAILED: ' + failed.join('; ') : ''));
process.exit(fail ? 1 : 0);
