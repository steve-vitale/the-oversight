#!/usr/bin/env node
// test-cheaptend-a.js — proof for the cheaptend-a instruments (Phase A: baseline legs).
// Legs: guard refusals (seeds/days/env/policy/gate), oneRun structure (incl. the NEW
// gate fields: tripPlanned/eligible/ctStats, plus endReason in perSeed), determinism
// (G1 smoke), bare-vs-recorded fingerprint equality (G2 smoke), analyzer runs on a
// 5-day corpus, episode-builder unit test on synthetic corpora, armed oneRun smoke,
// G3 revised-rule synthetic (village-lost final-day excuse).
// Uses seed 96301 at 5 days only (smoke scale); the judged 8-seed 150d corpus
// is produced by the sweep, not by this test.
// Phase-B legs (L12-L17): the CHEAPTEND layer itself — gate-off RED, gate-on
// fires on a no-trip day, ranging-day RED, daily cap (never a 3rd act), treat
// cures with herbal_remedy L2, triage + last-night rule.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
process.env.POLICY = 'competent';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const SWEEP = path.join(__dirname, 'sweep-cheaptend-a.js');
const ANALYZE = path.join(__dirname, 'analyze-cheaptend-a.js');
const TMP = path.join('/tmp', 'cheaptend-a-test-' + process.pid);

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
function runSweep(env, expectCode) {
  const r = cp.spawnSync(process.execPath, [SWEEP], {
    env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: 60000,
  });
  return r.status;
}
const GOOD = { SEEDS: '96301,96302,96303,96304,96305,96306,96307,96308', DAYS: '150', POLICY: 'competent' };

(async () => {
  // L1-L6: guard refusals (spawned; each must exit 2 without running sims).
  leg('L1 bad seeds refused', () => {
    assert.strictEqual(runSweep({ SEEDS: '1,2,3', DAYS: '150', POLICY: 'competent' }), 2);
  });
  leg('L2 bad days refused', () => {
    assert.strictEqual(runSweep(Object.assign({}, GOOD, { DAYS: '100' })), 2);
  });
  leg('L3 missing env refused', () => {
    const env = Object.assign({}, process.env);
    delete env.PLENTYDEPRI;
    const r = cp.spawnSync(process.execPath, [SWEEP], {
      env: Object.assign(env, GOOD), encoding: 'utf8', timeout: 60000,
    });
    assert.strictEqual(r.status, 2);
  });
  leg('L4 bad POLICY refused', () => {
    assert.strictEqual(runSweep(Object.assign({}, GOOD, { POLICY: 'bogus' })), 2);
  });
  leg('L5 armed leg without CHEAPTEND_A refused', () => {
    const env = Object.assign({}, GOOD, { POLICY: 'cheaptend-a' });
    delete env.CHEAPTEND_A;
    assert.strictEqual(runSweep(env), 2);
  });
  leg('L6 baseline leg with CHEAPTEND_A=1 refused', () => {
    assert.strictEqual(runSweep(Object.assign({}, GOOD, { CHEAPTEND_A: '1' })), 2);
  });

  const { oneRun, writeRobust } = require('./sweep-cheaptend-a.js');
  const { buildEpisodes } = require('./analyze-cheaptend-a.js');
  let first = null, second = null, bare = null;
  await aleg('L7 oneRun(96301, 5d, competent) structure incl. gate fields', async () => {
    first = await oneRun(96301, 5, { policy: 'competent' });
    const ps = first.perSeed;
    assert.strictEqual(ps.seed, 96301);
    assert.strictEqual(ps.policy, 'competent');
    assert.ok(Array.isArray(ps.daySeries) && ps.daySeries.length >= 4, 'daySeries length 4-5, got ' + ps.daySeries.length);
    assert.ok(Array.isArray(ps.flowSeries) && ps.flowSeries.length > 0, 'flowSeries non-empty');
    assert.ok(Array.isArray(ps.mealRows), 'mealRows array');
    const keys = ps.mealRows.map(r => r.vid + '|' + r.day);
    assert.strictEqual(new Set(keys).size, keys.length, 'mealRows deduped');
    const d0 = ps.daySeries[0];
    for (const k of ['pantryKcal', 'pantryFreshKcal', 'pantrySpoiledKcal', 'preservedKcal',
      'freshDays', 'pantryCapKcal', 'throttleEngaged', 'throttleRedirects',
      'throttleExemptDepth', 'plentyDepriKcal', 'depositGateKcal', 'pop', 'assignments',
      'season', 'weather', 'awayCount', 'meanHealth',
      // sick fields
      'sickCount', 'sickNames', 'atHaven', 'healerPresent', 'medicCount',
      'scholarKcal', 'scholarAbilities', 'ctStats',
      // NEW gate fields (this arm)
      'tripPlanned', 'eligible']) {
      assert.ok(k in d0, 'daySeries has ' + k);
    }
    assert.ok(d0.scholarAbilities && 'herbal_remedy' in d0.scholarAbilities, 'scholarAbilities has herbal_remedy');
    assert.strictEqual(typeof d0.tripPlanned, 'boolean', 'tripPlanned is boolean (needTrip wired, not null)');
    assert.ok(Array.isArray(ps.deathRows), 'deathRows array');
    assert.ok(Array.isArray(ps.sickOnsets), 'sickOnsets array');
    assert.ok(Array.isArray(ps.sickEnds), 'sickEnds array');
    assert.ok(Array.isArray(ps.treatEvents), 'treatEvents array');
    assert.ok(Array.isArray(ps.npcTends), 'npcTends array');
    assert.strictEqual(typeof ps.opportunityDays, 'number', 'opportunityDays number');
    assert.strictEqual(typeof ps.eligibleDays, 'number', 'eligibleDays number');
    assert.ok(typeof ps.endReason === 'string' && ps.endReason.length > 0, 'endReason present, got ' + ps.endReason);
    const f0 = ps.flowSeries[0];
    for (const k of ['stocked', 'stored', 'pantryAdd', 'donated', 'league', 'drawn',
      'spoiledDrawn', 'spoiledSwept', 'takeBulk', 'produced', 'need', 'ate', 'ownEat', 'gave', 'resolved']) {
      assert.ok(k in f0, 'flowSeries has ' + k);
    }
    assert.ok(ps.mealRows.length > 0, 'mealRows non-empty');
    const m0 = ps.mealRows[0];
    for (const k of ['produced', 'expected', 'base', 'kf', 'knownN', 'occSkill',
      'ageCap', 'healthFrac', 'trust', 'task', 'mult']) {
      assert.ok(k in m0, 'mealRow has ' + k);
    }
    assert.ok(first.fingerprint && typeof first.fingerprint.daysAlive === 'number', 'fingerprint present');
    assert.ok(Array.isArray(first.fingerprint.deathKeys), 'fingerprint deathKeys array');
  });
  await aleg('L8 determinism G1 smoke: same seed twice => identical per-seed JSON', async () => {
    second = await oneRun(96301, 5, { policy: 'competent' });
    assert.strictEqual(JSON.stringify(second.perSeed), JSON.stringify(first.perSeed));
    // diag carries wall-clock ms, which legitimately differs — compare with ms stripped.
    const strip = (d) => { const c = Object.assign({}, d); delete c.ms; return c; };
    assert.strictEqual(JSON.stringify(strip(second.diag)), JSON.stringify(strip(first.diag)));
    assert.strictEqual(JSON.stringify(second.fingerprint), JSON.stringify(first.fingerprint));
  });
  await aleg('L9 neutrality G2 smoke: bare fingerprint == recorded fingerprint', async () => {
    bare = await oneRun(96301, 5, { bare: true, policy: 'competent' });
    assert.strictEqual(bare.perSeed, null, 'bare run has no perSeed');
    assert.strictEqual(JSON.stringify(bare.fingerprint), JSON.stringify(first.fingerprint),
      'bare vs recorded fingerprint: ' + JSON.stringify(bare.fingerprint) + ' vs ' + JSON.stringify(first.fingerprint));
  });
  await aleg('L10 analyzer runs on a 5-day corpus and prints B1-B6 + G2/G3 lines', async () => {
    fs.mkdirSync(TMP, { recursive: true });
    writeRobust(path.join(TMP, 'cheaptend-a-competent-s96301.json'), JSON.stringify(first.perSeed));
    const r = cp.spawnSync(process.execPath, [ANALYZE, TMP], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer exit 0: ' + (r.stderr || '').slice(0, 500));
    for (const section of ['B1 FEVER BURDEN', 'B2 OPPORTUNITY', 'B2b GATE POOL', 'B3 PRODUCTION COST',
      'B4 GUARDRAILS', 'B5 NPC CARE', 'B6 FORAGE COST', 'G2 NEUTRALITY', 'G3 CORPUS', 'CORPUS VERDICT']) {
      assert.ok(r.stdout.includes(section), section + ' printed');
    }
  });
  leg('L11 episode builder: synthetic onsets/ends join, open + death handled', () => {
    const mk = (onsets, ends, deaths) => buildEpisodes({
      sickOnsets: onsets, sickEnds: ends,
      deathRows: (deaths || []).map(d => ({ who: d.who, day: d.day })),
    });
    // Recovered episode: onset d3, end d7 (recovered) => duration 4.
    let eps = mk([{ day: 3, vid: 'v1', name: 'tick fever', source: 'tick' }],
      [{ day: 7, vid: 'v1', name: 'tick fever', outcome: 'recovered', via: 'tick' }]);
    assert.strictEqual(eps.length, 1, 'one episode');
    assert.strictEqual(eps[0].duration, 4, 'duration 4, got ' + eps[0].duration);
    assert.strictEqual(eps[0].outcome, 'recovered');
    // Cured episode: onset d5, cure end d6 => duration 1, outcome cured.
    eps = mk([{ day: 5, vid: 'v2', name: 'gut rot', source: 'tick' }],
      [{ day: 6, vid: 'v2', name: 'gut rot', outcome: 'cured', via: 'treat' }]);
    assert.strictEqual(eps[0].duration, 1, 'cure duration 1');
    assert.strictEqual(eps[0].outcome, 'cured');
    // Open episode: onset, no end, no death => outcome open, duration null.
    eps = mk([{ day: 10, vid: 'v3', name: 'wound fever', source: 'tick' }], []);
    assert.strictEqual(eps[0].outcome, 'open', 'open outcome');
    assert.strictEqual(eps[0].duration, null, 'open duration null');
    // Died of another cause: onset, no tick end, death row => died, duration from death day.
    eps = mk([{ day: 4, vid: 'v4', name: 'tick fever', source: 'tick' }], [],
      [{ who: 'v4', day: 6 }]);
    assert.strictEqual(eps[0].outcome, 'died', 'died outcome');
    assert.strictEqual(eps[0].duration, 2, 'died duration 2');
    // Two overlapping episodes, different vids, ends matched to the right onset.
    eps = mk([
      { day: 2, vid: 'v1', name: 'tick fever', source: 'tick' },
      { day: 3, vid: 'v2', name: 'gut rot', source: 'food' },
    ], [
      { day: 5, vid: 'v2', name: 'gut rot', outcome: 'recovered', via: 'tick' },
      { day: 6, vid: 'v1', name: 'tick fever', outcome: 'recovered', via: 'tick' },
    ]);
    assert.strictEqual(eps.length, 2, 'two episodes');
    assert.strictEqual(eps[0].duration, 4, 'v1 duration 4');
    assert.strictEqual(eps[1].duration, 2, 'v2 duration 2');
  });

  // ---- Phase-B legs (L12-L17): the CHEAPTEND layer itself ----
  const { loadGame, setupGame } = require('./sim-harness');
  const cheapMod = require('./policies/cheaptend-a');
  const { competent, needTrip } = require('./policies/competent');
  async function freshScene() {
    const { Game } = await loadGame({ seed: 96301, mode: 'cheaptend-a-proof', fullTelemetry: false });
    await setupGame(Game);
    assert.ok(Game.playerAtHaven && Game.playerAtHaven(), 'scholar starts at Haven');
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    assert.ok(roster.length >= 3, 'roster has >= 3 others, got ' + roster.length);
    const s = Game.state.scholar;
    s.kcal = 3000;
    return { Game, vids: roster.slice(0, 3) };
  }
  function makeSick(Game, vid, name, daysLeft, severity, hp) {
    const v = Game.state.village;
    v.sick = v.sick || {};
    v.sick[vid] = { name, daysLeft, severity };
    v.health = v.health || {};
    v.health[vid] = hp;
  }
  function grantHealing(Game, id, level) {
    const s = Game.state.scholar;
    s.abilities = s.abilities || [];
    if (!s.abilities.find(a => a.id === id)) s.abilities.push({ id, name: id, level, xp: 0 });
    assert.ok(Game.hasAbility && Game.hasAbility(id), 'scholar holds ' + id);
    assert.strictEqual(Game.abilityLevel(id), level, id + ' level ' + level);
  }
  // No-trip scene: pantry >= 25,000 kcal AND scholar kcal >= 50% cap AND a
  // give today (ctx._lastGiveDay = current day) — needTrip must read false.
  // Returns the ctx the layer's gate will read.
  function makeNoTrip(Game) {
    const v = Game.state.village;
    v.pantry = v.pantry || [];
    v.pantry.push({ id: 'test-stock', name: 'test stock', kcalEach: 1000, units: 30 });
    const s = Game.state.scholar;
    s.kcal = 5000;
    const ctx = { _lastGiveDay: (s.day || 0) };
    assert.strictEqual(needTrip(Game, ctx), false, 'no-trip scene: needTrip false');
    return ctx;
  }
  // Ranging scene: scholar kcal low forces needTrip true regardless of pantry.
  function makeRanging(Game) {
    const s = Game.state.scholar;
    s.kcal = 100;
    const ctx = { _lastGiveDay: 0 };
    assert.strictEqual(needTrip(Game, ctx), true, 'ranging scene: needTrip true');
    return ctx;
  }
  await aleg('L12 gate-OFF RED: unset gate => zero acts even with sick villagers present', async () => {
    delete process.env.CHEAPTEND_A;
    const { Game, vids } = await freshScene();
    makeSick(Game, vids[0], 'tick fever', 4, 1, 90);
    cheapMod.resetCheaptendStats();
    cheapMod.tendDrive(Game, {});
    const st = cheapMod.cheaptendStats();
    assert.strictEqual(st.acts, 0, 'gate off: 0 acts, got ' + st.acts);
    assert.strictEqual(st.tended, 0, 'gate off: 0 tended');
    assert.strictEqual(st.treated, 0, 'gate off: 0 treated');
    assert.strictEqual(Game.state.village.sick[vids[0]].daysLeft, 4, 'sick record untouched');
  });
  await aleg('L13 gate-ON fires on a no-trip day: unskilled tend shortens the episode', async () => {
    process.env.CHEAPTEND_A = '1';
    const { Game, vids } = await freshScene();
    makeSick(Game, vids[0], 'tick fever', 4, 1, 90);
    const ctx = makeNoTrip(Game);
    cheapMod.resetCheaptendStats();
    cheapMod.tendDrive(Game, ctx);
    const st = cheapMod.cheaptendStats();
    assert.strictEqual(st.acts, 1, 'one act, got ' + st.acts);
    assert.strictEqual(st.tended, 1, 'one tend');
    assert.strictEqual(st.treated, 0, 'no treat without ability');
    assert.strictEqual((st.skips || {}).ranging || 0, 0, 'no ranging skip on a no-trip day');
    assert.strictEqual(Game.state.village.sick[vids[0]].daysLeft, 3, 'unskilled tend: daysLeft 4 -> 3');
  });
  await aleg('L14 ranging-day RED: trip planned => zero acts, skip ranging recorded', async () => {
    process.env.CHEAPTEND_A = '1';
    const { Game, vids } = await freshScene();
    makeSick(Game, vids[0], 'tick fever', 4, 1, 90);
    const ctx = makeRanging(Game);
    cheapMod.resetCheaptendStats();
    cheapMod.tendDrive(Game, ctx);
    const st = cheapMod.cheaptendStats();
    assert.strictEqual(st.acts, 0, 'ranging day: 0 acts, got ' + st.acts);
    assert.strictEqual(st.tended, 0, 'ranging day: 0 tended');
    assert.strictEqual(st.treated, 0, 'ranging day: 0 treated');
    assert.strictEqual((st.skips || {}).ranging || 0, 1, 'one ranging skip recorded');
    assert.strictEqual(Game.state.village.sick[vids[0]].daysLeft, 4, 'sick record untouched');
  });
  await aleg('L15 daily cap: 3 sick patients on a no-trip day => exactly 2 acts, most urgent first', async () => {
    process.env.CHEAPTEND_A = '1';
    const { Game, vids } = await freshScene();
    grantHealing(Game, 'herbal_remedy', 2);
    // A: daysLeft 4, hp 90, sev 1 (dmg 3) — days-to-death 30, least urgent.
    makeSick(Game, vids[0], 'tick fever', 4, 1, 90);
    // B: daysLeft 4, hp 5, sev 2 (dmg 5) — days-to-death 1.0.
    makeSick(Game, vids[1], 'gut rot', 4, 2, 5);
    // C: daysLeft 1, hp 2, sev 2 (dmg 5) — days-to-death 0.4, most urgent.
    makeSick(Game, vids[2], 'wound fever', 1, 2, 2);
    const ctx = makeNoTrip(Game);
    cheapMod.resetCheaptendStats();
    cheapMod.tendDrive(Game, ctx);
    const st = cheapMod.cheaptendStats();
    assert.strictEqual(st.acts, 2, 'two acts (cap), got ' + st.acts);
    assert.strictEqual(st.cured, 2, 'two cures (C, B)');
    assert.strictEqual(st.tended, 0, 'no tend — the cap cut the least urgent');
    const evs = st.events.filter(e => e.what === 'cured' || e.what === 'tended');
    assert.strictEqual(evs.length, 2, 'two act events');
    assert.ok(evs[0].detail.startsWith(vids[2] + ':'), 'first act is C (most urgent), got ' + evs[0].detail);
    assert.ok(evs[1].detail.startsWith(vids[1] + ':'), 'second act is B, got ' + evs[1].detail);
    assert.ok(Game.state.village.sick[vids[0]], 'A still sick (cap cut them)');
    assert.strictEqual(Game.state.village.sick[vids[0]].daysLeft, 4, 'A untouched by the cap');
    assert.strictEqual(Game.state.village.sick[vids[1]], undefined, 'B cured');
    assert.strictEqual(Game.state.village.sick[vids[2]], undefined, 'C cured');
  });
  await aleg('L16 treat cures: herbal_remedy L2 deletes the sick record (no-trip day)', async () => {
    process.env.CHEAPTEND_A = '1';
    const { Game, vids } = await freshScene();
    grantHealing(Game, 'herbal_remedy', 2);
    makeSick(Game, vids[0], 'gut rot', 4, 2, 90);
    const ctx = makeNoTrip(Game);
    cheapMod.resetCheaptendStats();
    cheapMod.tendDrive(Game, ctx);
    const st = cheapMod.cheaptendStats();
    assert.strictEqual(st.treated, 1, 'one treat');
    assert.strictEqual(st.cured, 1, 'one cure');
    assert.strictEqual(st.acts, 1, 'one act');
    assert.strictEqual(Game.state.village.sick[vids[0]], undefined, 'sick record deleted by cure');
  });
  await aleg('L17 triage + last-night rule: most urgent first; daysLeft==1 safe => tend, lethal => treat', async () => {
    process.env.CHEAPTEND_A = '1';
    // (i) A safe-last-night (tend) vs B urgent (treat): B first, A tended.
    {
      const { Game, vids } = await freshScene();
      grantHealing(Game, 'herbal_remedy', 2);
      // A: daysLeft 1, hp 90, sev 1 (dmg 3) — safe tonight, recovers anyway => TEND.
      makeSick(Game, vids[0], 'tick fever', 1, 1, 90);
      // B: daysLeft 4, hp 5, sev 2 (dmg 5) — days-to-death 1.0 => TREAT (cure).
      makeSick(Game, vids[1], 'gut rot', 4, 2, 5);
      const ctx = makeNoTrip(Game);
      cheapMod.resetCheaptendStats();
      cheapMod.tendDrive(Game, ctx);
      const st = cheapMod.cheaptendStats();
      assert.strictEqual(st.acts, 2, 'two acts, got ' + st.acts);
      assert.strictEqual(st.cured, 1, 'one cure (B)');
      assert.strictEqual(st.tended, 1, 'one tend (A)');
      const evs = st.events.filter(e => e.what === 'cured' || e.what === 'tended');
      assert.strictEqual(evs.length, 2, 'two act events');
      // Triage order: B (1.0) first, A (30) last.
      assert.ok(evs[0].detail.startsWith(vids[1] + ':'), 'first act is B (most urgent), got ' + evs[0].detail);
      assert.strictEqual(evs[0].what, 'cured', 'B cured');
      assert.strictEqual(evs[1].what, 'tended', 'A tended (not treated)');
      assert.strictEqual(evs[1].detail, vids[0], 'second act is A');
      assert.ok(Game.state.village.sick[vids[0]], 'A still sick (tended, not cured)');
      assert.strictEqual(Game.state.village.sick[vids[1]], undefined, 'B cured');
    }
    // (ii) Lethal last night: daysLeft==1 + hp <= tonight's damage => TREAT (cure).
    {
      const { Game, vids } = await freshScene();
      grantHealing(Game, 'herbal_remedy', 2);
      // C: daysLeft 1, hp 2, sev 2 (dmg 5) — tonight is lethal => TREAT (cure).
      makeSick(Game, vids[0], 'wound fever', 1, 2, 2);
      const ctx = makeNoTrip(Game);
      cheapMod.resetCheaptendStats();
      cheapMod.tendDrive(Game, ctx);
      const st = cheapMod.cheaptendStats();
      assert.strictEqual(st.acts, 1, 'one act, got ' + st.acts);
      assert.strictEqual(st.cured, 1, 'lethal last night cured');
      assert.strictEqual(st.tended, 0, 'not tended');
      assert.strictEqual(Game.state.village.sick[vids[0]], undefined, 'C cured');
    }
  });
  await aleg('L18 armed oneRun smoke: cheaptend-a runs 5d, structure + endReason + ctStats', async () => {
    process.env.CHEAPTEND_A = '1';
    const armed = await oneRun(96301, 5, { policy: 'cheaptend-a' });
    const ps = armed.perSeed;
    assert.strictEqual(ps.policy, 'cheaptend-a', 'armed policy name');
    assert.ok(Array.isArray(ps.daySeries) && ps.daySeries.length >= 4, 'armed daySeries 4-5');
    assert.ok(typeof ps.endReason === 'string' && ps.endReason.length > 0, 'armed endReason present');
    assert.ok(ps.daySeries.every(d => 'tripPlanned' in d && 'eligible' in d), 'armed snapshots carry gate fields');
    assert.ok(ps.daySeries.every(d => typeof d.tripPlanned === 'boolean'), 'armed tripPlanned is boolean (needTrip wired)');
    assert.ok(ps.daySeries.every(d => 'ctStats' in d), 'armed snapshots carry ctStats');
    assert.ok(Array.isArray(ps.treatEvents), 'armed treatEvents array');
    delete process.env.CHEAPTEND_A;
  });
  await aleg('L19 G3 revised rule (synthetic): village-lost final day excused, letter still fails', async () => {
    const dir = path.join(TMP, 'g3rev');
    fs.mkdirSync(dir, { recursive: true });
    // 2 days alive, daySeries + flowSeries cover day 1 only; no death on
    // day 2; endReason village-lost (mid-day end). Letter G3 must FAIL
    // (missing final-day flow row, no death that day); revised must PASS.
    const dayRow = (day) => ({ day, pop: 8, hungry: 0, freshDays: 5, pantryKcal: 1000,
      pantryFreshKcal: 1000, pantrySpoiledKcal: 0, preservedKcal: 0, pantryCapKcal: 50000,
      capFlag: false, throttleEngaged: false, throttleRedirects: 0, throttleExemptDepth: 0,
      plentyDepriKcal: 0, depositGateKcal: 0, assignments: {}, season: null, weather: null,
      awayCount: 0, meanHealth: 90, sickCount: 0, sickNames: [], atHaven: true,
      healerPresent: false, medicCount: 0, scholarKcal: 2000, scholarAbilities: {},
      ctStats: null, tripPlanned: false, eligible: false });
    const perSeed = { seed: 96301, policy: 'competent', daysAlive: 2, villageDays: 16,
      deathCauses: {}, deathRows: [], mealRows: [], daySeries: [dayRow(1)],
      flowSeries: [{ day: 1, stocked: {}, stored: 0, pantryAdd: 0, donated: 0, league: 0,
        drawn: 0, drawGap: 0, spoiledDrawn: 0, spoiledSwept: 0, takeBulk: 0,
        removedKcal: 0, produced: 0, need: 0, ate: 0, ownEat: 0, gave: 0,
        resolved: {}, redirectResolved: {} }],
      national: false, table: false, win: false, waveReach: [1], medianSurvival: null,
      freshDaysMedian: 5, sickOnsets: [], sickEnds: [], treatEvents: [], npcTends: [],
      opportunityDays: 0, eligibleDays: 0, cheaptendStats: null, endReason: 'village-lost' };
    writeRobust(path.join(dir, 'cheaptend-a-competent-s96301.json'), JSON.stringify(perSeed));
    writeRobust(path.join(dir, 'cheaptend-a-bare-s96301.json'), JSON.stringify({
      seed: 96301, daysAlive: 2, endReason: 'village-lost', rank: '?', maxWave: 1,
      national: false, table: false, win: false, deathCauses: {}, deathKeys: [], finalPop: 3 }));
    const r = cp.spawnSync(process.execPath, [ANALYZE, dir], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer exit 0: ' + (r.stderr || '').slice(0, 500));
    assert.ok(/G3 CORPUS \(letter[^)]*\): FAIL/.test(r.stdout), 'letter G3 FAILs (no death on final day): ' + r.stdout.slice(0, 800));
    assert.ok(/G3 CORPUS \(revised[^)]*\): PASS/.test(r.stdout), 'revised G3 PASSes (village-lost mid-day end): ' + r.stdout.slice(0, 800));
  });
  delete process.env.CHEAPTEND_A;

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
