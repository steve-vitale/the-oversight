#!/usr/bin/env node
// test-tendsick-a.js — proof for the tendsick-a instruments (Phase A: baseline legs).
// Legs: guard refusals (seeds/days/env/policy/gate), oneRun structure (incl. the NEW
// sick fields: sickCount/sickNames/atHaven/scholarAbilities/healerPresent/medicCount,
// sickOnsets/sickEnds/treatEvents/npcTends, opportunityDays), determinism (G1 smoke),
// bare-vs-recorded fingerprint equality (G2 smoke), analyzer runs on a 5-day corpus,
// episode-builder unit test on synthetic corpora.
// Uses seed 96301 at 5 days only (smoke scale); the judged 8-seed 150d corpus
// is produced by the sweep, not by this test.
// Phase-B legs (L12-L15): the TENDSICK layer itself — gate-off RED, gate-on
// fires, treat cures with herbal_remedy L2, triage + last-night rule.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
process.env.POLICY = 'competent';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const SWEEP = path.join(__dirname, 'sweep-tendsick-a.js');
const ANALYZE = path.join(__dirname, 'analyze-tendsick-a.js');
const TMP = path.join('/tmp', 'tendsick-a-test-' + process.pid);

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
  leg('L5 armed leg without TENDSICK_A refused', () => {
    const env = Object.assign({}, GOOD, { POLICY: 'tendsick-a' });
    delete env.TENDSICK_A;
    assert.strictEqual(runSweep(env), 2);
  });
  leg('L6 baseline leg with TENDSICK_A=1 refused', () => {
    assert.strictEqual(runSweep(Object.assign({}, GOOD, { TENDSICK_A: '1' })), 2);
  });

  const { oneRun, writeRobust } = require('./sweep-tendsick-a.js');
  const { buildEpisodes } = require('./analyze-tendsick-a.js');
  let first = null, second = null, bare = null;
  await aleg('L7 oneRun(96301, 5d, competent) structure incl. sick fields', async () => {
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
      // NEW sick fields
      'sickCount', 'sickNames', 'atHaven', 'healerPresent', 'medicCount',
      'scholarKcal', 'scholarAbilities', 'tsStats']) {
      assert.ok(k in d0, 'daySeries has ' + k);
    }
    assert.ok(d0.scholarAbilities && 'herbal_remedy' in d0.scholarAbilities, 'scholarAbilities has herbal_remedy');
    assert.ok(Array.isArray(ps.deathRows), 'deathRows array');
    assert.ok(Array.isArray(ps.sickOnsets), 'sickOnsets array');
    assert.ok(Array.isArray(ps.sickEnds), 'sickEnds array');
    assert.ok(Array.isArray(ps.treatEvents), 'treatEvents array');
    assert.ok(Array.isArray(ps.npcTends), 'npcTends array');
    assert.strictEqual(typeof ps.opportunityDays, 'number', 'opportunityDays number');
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
  await aleg('L10 analyzer runs on a 5-day corpus and prints B1-B5 + G2/G3 lines', async () => {
    fs.mkdirSync(TMP, { recursive: true });
    writeRobust(path.join(TMP, 'tendsick-a-competent-s96301.json'), JSON.stringify(first.perSeed));
    const r = cp.spawnSync(process.execPath, [ANALYZE, TMP], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer exit 0: ' + (r.stderr || '').slice(0, 500));
    for (const section of ['B1 FEVER BURDEN', 'B2 OPPORTUNITY', 'B3 PRODUCTION COST',
      'B4 GUARDRAILS', 'B5 NPC CARE', 'G2 NEUTRALITY', 'G3 CORPUS', 'BASELINE VERDICT']) {
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

  // ---- Phase-B legs (L12-L15): the TENDSICK layer itself ----
  const { loadGame, setupGame } = require('./sim-harness');
  const tendMod = require('./policies/tendsick-a');
  async function freshScene() {
    const { Game } = await loadGame({ seed: 96301, mode: 'tendsick-a-proof', fullTelemetry: false });
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
  await aleg('L12 gate-OFF RED: unset gate => zero acts even with sick villagers present', async () => {
    delete process.env.TENDSICK_A;
    const { Game, vids } = await freshScene();
    makeSick(Game, vids[0], 'tick fever', 4, 1, 90);
    tendMod.resetTendsickStats();
    tendMod.tendDrive(Game, {});
    const st = tendMod.tendsickStats();
    assert.strictEqual(st.acts, 0, 'gate off: 0 acts, got ' + st.acts);
    assert.strictEqual(st.tended, 0, 'gate off: 0 tended');
    assert.strictEqual(st.treated, 0, 'gate off: 0 treated');
    assert.strictEqual(Game.state.village.sick[vids[0]].daysLeft, 4, 'sick record untouched');
  });
  await aleg('L13 gate-ON fires: unskilled tend shortens the episode', async () => {
    process.env.TENDSICK_A = '1';
    const { Game, vids } = await freshScene();
    makeSick(Game, vids[0], 'tick fever', 4, 1, 90);
    tendMod.resetTendsickStats();
    tendMod.tendDrive(Game, {});
    const st = tendMod.tendsickStats();
    assert.strictEqual(st.acts, 1, 'one act, got ' + st.acts);
    assert.strictEqual(st.tended, 1, 'one tend');
    assert.strictEqual(st.treated, 0, 'no treat without ability');
    assert.strictEqual(Game.state.village.sick[vids[0]].daysLeft, 3, 'unskilled tend: daysLeft 4 -> 3');
  });
  await aleg('L14 treat cures: herbal_remedy L2 deletes the sick record', async () => {
    process.env.TENDSICK_A = '1';
    const { Game, vids } = await freshScene();
    grantHealing(Game, 'herbal_remedy', 2);
    makeSick(Game, vids[0], 'gut rot', 4, 2, 90);
    tendMod.resetTendsickStats();
    tendMod.tendDrive(Game, {});
    const st = tendMod.tendsickStats();
    assert.strictEqual(st.treated, 1, 'one treat');
    assert.strictEqual(st.cured, 1, 'one cure');
    assert.strictEqual(st.acts, 1, 'one act');
    assert.strictEqual(Game.state.village.sick[vids[0]], undefined, 'sick record deleted by cure');
  });
  await aleg('L15 triage + last-night rule: most urgent first; daysLeft==1 safe => tend, lethal => treat', async () => {
    process.env.TENDSICK_A = '1';
    const { Game, vids } = await freshScene();
    grantHealing(Game, 'herbal_remedy', 2);
    // A: daysLeft 1, hp 90, sev 1 (dmg 3) — safe tonight, recovers anyway => TEND.
    makeSick(Game, vids[0], 'tick fever', 1, 1, 90);
    // B: daysLeft 4, hp 5, sev 2 (dmg 5) — days-to-death 1.0 => TREAT (cure).
    makeSick(Game, vids[1], 'gut rot', 4, 2, 5);
    // C: daysLeft 1, hp 2, sev 2 (dmg 5) — days-to-death 0.4, tonight is lethal => TREAT (cure).
    makeSick(Game, vids[2], 'wound fever', 1, 2, 2);
    tendMod.resetTendsickStats();
    tendMod.tendDrive(Game, {});
    const st = tendMod.tendsickStats();
    assert.strictEqual(st.acts, 3, 'three acts, got ' + st.acts);
    assert.strictEqual(st.cured, 2, 'two cures (B, C)');
    assert.strictEqual(st.tended, 1, 'one tend (A)');
    const evs = st.events.filter(e => e.what === 'cured' || e.what === 'tended');
    assert.strictEqual(evs.length, 3, 'three act events');
    // Triage order: C (0.4) first, B (1.0) second, A (30) last.
    assert.ok(evs[0].detail.startsWith(vids[2] + ':'), 'first act is C (most urgent), got ' + evs[0].detail);
    assert.strictEqual(evs[0].what, 'cured', 'C cured');
    assert.ok(evs[1].detail.startsWith(vids[1] + ':'), 'second act is B, got ' + evs[1].detail);
    assert.strictEqual(evs[1].what, 'cured', 'B cured');
    assert.strictEqual(evs[2].what, 'tended', 'A tended (not treated)');
    assert.strictEqual(evs[2].detail, vids[0], 'third act is A');
    assert.ok(Game.state.village.sick[vids[0]], 'A still sick (tended, not cured)');
    assert.strictEqual(Game.state.village.sick[vids[1]], undefined, 'B cured');
    assert.strictEqual(Game.state.village.sick[vids[2]], undefined, 'C cured');
  });
  delete process.env.TENDSICK_A;

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
