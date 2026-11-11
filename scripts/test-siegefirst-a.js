// test-siegefirst-a.js — proof for the siege first-numbers instrument
// (arm sim-siegefirst-a, run fleshout-20261111T1815Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-siegefirst-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const SI = require(path.join(REPO, 'scripts', 'siegefirst-instrument-20261111'));
const AN = require(path.join(REPO, 'scripts', 'siegefirst-analyze-20261111'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- A. Analyzer classifier fixtures (no game load) ----
(function () {
  eq(AN.sayBucket('The siege goes on.'), 'siege-word', 'A1 siege-word bucket');
  eq(AN.sayBucket('🌙 Night. The lingering bulldozer gorges at the treeline'), 'treeline', 'A2 treeline beats gorge (first match wins)');
  eq(AN.sayBucket('The palisade holds.'), 'palisade', 'A3 palisade bucket');
  eq(AN.sayBucket('gorges — 800 kcal gone'), 'gorge', 'A4 gorge bucket');
  eq(AN.sayBucket('🐗 RAID — 3 raiders hit Haven'), 'raid', 'A5 raid bucket');
  eq(AN.sayBucket('Hold the line. Three waves.'), 'hold-line', 'A6 hold-line bucket');
  eq(AN.sayBucket('A quiet day at the fire.'), null, 'A7 unrelated line has no bucket');
  eq(AN.pillageBucket('havenGrowthDaily'), 'gorge', 'A8 gorge caller');
  eq(AN.pillageBucket('havenRaidTick'), 'raid', 'A9 raid caller');
  eq(AN.pillageBucket('somethingElse'), 'other-caller', 'A10 unknown caller is other-caller');
  ok(AN.CRISIS_KINDS['the-siege'] === 1, 'A11 the-siege is a known crisis kind');
  ok(AN.CRISIS_KINDS['not-a-crisis'] === undefined, 'A12 unknown crisis kind is not known');
  ok(AN.RAID_NONFIRE.roll === 1 && AN.RAID_NONFIRE.cooldown === 1, 'A13 raid non-fire reasons known');
  // A14-A19: show roster (pilot diagnosis 2026-11-11) — the tick serves
  // contests.json AND G.showPool(); the analyzer must know both rosters.
  ok(AN.SHOW_IDS['swear_jar'] === true, 'A14 swear_jar is a known show');
  ok(AN.SHOW_IDS['grudge_pudding'] === true, 'A15 grudge_pudding is a known show');
  ok(AN.SHOW_IDS['rose_ceremony'] === true, 'A16 rose_ceremony is a known show');
  ok(AN.SHOW_IDS['museum_of_you'] === true, 'A17 museum_of_you is a known show');
  ok(AN.SHOW_IDS['siege'] === undefined, 'A18 siege is a contest, not a show (rosters disjoint)');
  ok(Object.keys(AN.SHOW_IDS).length >= 25, 'A19 show roster extraction finds the whole pool', { found: Object.keys(AN.SHOW_IDS).length });
  // A20-A28: lingerer ending rules (pilot diagnosis 2026-11-11).
  const _ep = (id, since) => ({ id: id, lingerSince: since });
  eq(AN.classifyLingerEnd(_ep('x', 10), 16, {}), 'drifted', 'A20 age 6 drifts');
  eq(AN.classifyLingerEnd(_ep('x', 10), 12, { fights: [{ day: 12, vs: 'x' }] }), 'met-in-fight', 'A21 fight on end day is met-in-fight');
  eq(AN.classifyLingerEnd(_ep('x', 10), 12, { teleDeaths: [{ who: 'x', kind: 'monster', day: 12 }] }), 'killed', 'A22 death row with no fight row is killed (fieldFight)');
  eq(AN.classifyLingerEnd(_ep('x', 10), 12, { aidCrises: [{ verb: 'resolve', how: 'fought', raiders: true, day: 12 }] }), 'driven-off', 'A23 fought resolve on end day is driven-off');
  eq(AN.classifyLingerEnd(_ep('x', 10), 12, { aidCrises: [{ verb: 'resolve', how: 'moved-on', raiders: true, day: 11 }] }), 'moved-on-valve', 'A24 moved-on resolve in window is moved-on-valve');
  eq(AN.classifyLingerEnd(_ep('x', 10), 12, {}), 'unexplained-end', 'A25 nothing known is unexplained-end');
  eq(AN.classifyLingerEnd(_ep('x', 10), 16, { fights: [{ day: 16, vs: 'x' }] }), 'drifted', 'A26 drift beats fight (age first)');
  eq(AN.classifyLingerEnd(_ep('x', 10), 12, { fights: [{ day: 12, vs: 'x' }], teleDeaths: [{ who: 'x', kind: 'monster', day: 12 }] }), 'met-in-fight', 'A27 fight beats death (startCombat path)');
  eq(AN.classifyLingerEnd(_ep('x', 10), 12, { teleDeaths: [{ who: 'x', kind: 'monster', day: 11 }] }), 'killed', 'A28 death on endDay-1 counts (snapshot window)');
})();

const WRAPPED = ['havenRaidTick', 'raidPillage', 'havenGrowthDaily', 'raiseAidCrisis',
  'resolveAidCrisis', 'fireCrisis', 'fireContest', 'contestTick',
  'shelterVillagers', 'shelterEveryoneBut', 'shelterMuster', 'releaseShelter',
  'shelterAllClear', 'spawnWorldMonster', 'tele'];

// ---- B. Live wrap fixtures (game load 1: seed 210401) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 210401, mode: 'siegefirst-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const orig = {};
  WRAPPED.forEach(function (n) { orig[n] = Game[n]; });
  const si = SI.install(Game);
  const t = si.t;
  const s = Game.state.scholar;
  const v = Game.state.village;

  // --- B1: raid fires with engineered state (3 living monsters, rich pantry).
  const w1 = Game.data.monsters.filter(function (m) { return m.wave === 1; }).slice(0, 3);
  for (const def of w1) { try { Game.spawnWorldMonster(def); } catch (e) {} }
  Game.stockPantry(5000, 'Foraged food');
  s.day = 30;
  v.lastRaidDay = 0;
  let firedAt = -1;
  for (let i = 0; i < 60; i++) {
    const before = t.raids.length;
    const r = Game.havenRaidTick();
    if (r) { firedAt = i; break; }
    void before;
  }
  ok(firedAt >= 0, 'B1 havenRaidTick fires within 60 calls (18% roll)', { firedAt: firedAt });
  const raidRec = t.raids.find(function (r) { return r.fired; });
  ok(!!raidRec && raidRec.raiders.length >= 3, 'B1b fired raid recorded with 3+ raiders', raidRec && raidRec.raiders.length);
  ok(raidRec && raidRec.raiders.every(function (rd) { return typeof rd.wave === 'number'; }),
    'B1c every raider carries a wave', raidRec && raidRec.raiders);
  ok(t.aidCrises.some(function (a) { return a.verb === 'raise' && a.raiders === true; }),
    'B1d raid raised an aid crisis with raiders=true', t.aidCrises.slice(-2));
  const raiseRow = t.aidCrises.find(function (a) { return a.verb === 'raise'; });
  ok(!!raiseRow && raiseRow.tier === 1 && raiseRow.created === true,
    'B1f raise row carries the crisis wave as tier + created flag', raiseRow);
  ok(t.wrapLive.havenRaidTick === true && t.wrapLive.spawnWorldMonster === true,
    'B1e havenRaidTick + spawnWorldMonster wraps live');

  // --- B2: palisade wall damage (tier 2) cuts raider HP 25% of maxHp.
  // Defender-free raid: every roster villager is put at 10 HP first, so
  // the defender filter finds nobody and no defender fight pollutes
  // hpAfter — the exact-25% check below then measures the wall alone.
  // (The player-facing fight is also skipped: palisade is up.)
  v.havenTier = 2;
  v.lastRaidDay = 0;
  s.day = 38;
  const vHealth = (v.health = v.health || {});
  (v.roster || []).forEach(function (id) { if (id !== Game.villagerId) vHealth[id] = 10; });
  for (const def of w1) { try { Game.spawnWorldMonster(def); } catch (e) {} }
  let fired2 = null;
  for (let i = 0; i < 60; i++) {
    const r = Game.havenRaidTick();
    if (r) { fired2 = t.raids[t.raids.length - 1]; break; }
  }
  ok(!!fired2 && fired2.palisade === true, 'B2 palisade raid recorded', fired2 && fired2.palisade);
  // Pantry is ~52k kcal, so raidN = 5 (3 base + 1 above 12k + 1 above
  // 24k): the 3 re-drafted B1 raiders + 2 of the 3 fresh spawns.
  ok(!!fired2 && fired2.raiders.length === 5, 'B2d all 5 drafted raiders recorded', fired2 && fired2.raiders.length);
  ok(!!fired2 && fired2.raiders.filter(function (rd) { return rd.redraft; }).length === 3,
    'B2e the 3 B1 raiders are recorded as re-drafts', fired2 && fired2.raiders.map(function (rd) { return rd.id + ':' + !!rd.redraft; }));
  const wallCut = fired2 && fired2.raiders.filter(function (rd) {
    return typeof rd.hpBefore === 'number' && typeof rd.hpAfter === 'number' && rd.hpAfter < rd.hpBefore;
  });
  ok(wallCut && wallCut.length > 0, 'B2b palisade cut at least one raider HP', wallCut && wallCut.length);
  ok(wallCut && wallCut.length > 0 && wallCut.every(function (rd) {
    return rd.hpAfter === Math.max(1, rd.hpBefore - Math.round((rd.maxHp || rd.hpBefore) * 0.25));
  }), 'B2c wall cut is exactly 25% of maxHp', wallCut && wallCut[0]);

  // --- B3: lingerer gorge — a lingering raider eats nightly, offer recorded.
  const linger = Game.worldMonsters().find(function (m) { return m && (m.hp || 0) > 0; });
  ok(!!linger, 'B3 a living world monster exists to linger');
  if (linger) {
    // The B2 raid left 5 lingerers (twins share ids); drop the others so
    // the gorge here is a single raider and B4's drift check is
    // unambiguous. Fixture control only — the engine is untouched.
    for (const m of Game.worldMonsters()) { if (m !== linger) m.hp = 0; }
    linger.lingering = true;
    linger.lingerSince = s.day - 1;
    linger.tx = (v.px !== undefined && v.px !== null) ? v.px : 4;
    linger.ty = (v.py !== undefined && v.py !== null) ? v.py : 4;
    const pilBefore = t.pillages.length;
    const ldBefore = t.lingerDays.length;
    Game.havenGrowthDaily();
    const gorge = t.pillages.slice(pilBefore).filter(function (p) { return AN.pillageBucket(p.caller) === 'gorge'; });
    ok(gorge.length >= 1 && gorge[0].gotKcal > 0, 'B3b lingerer gorge pillaged kcal', gorge[0]);
    ok(t.lingerDays.length === ldBefore + 1 && t.lingerDays[t.lingerDays.length - 1].after.some(function (m) { return m.id === linger.id; }),
      'B3c lingerer present in havenGrowthDaily after-snapshot', t.lingerDays[t.lingerDays.length - 1]);
    ok(!!(Game.state.lastLingererOffer && Game.state.lastLingererOffer.name),
      'B3d lastLingererOffer recorded', Game.state.lastLingererOffer);
    ok(t.wrapLive.havenGrowthDaily === true && t.wrapLive.raidPillage === true,
      'B3e havenGrowthDaily + raidPillage wraps live');

    // --- B4: drift-off after ~6 nights.
    linger.lingerSince = s.day - 7;
    Game.havenGrowthDaily();
    ok(linger.lingering === false, 'B4 lingerer drifts off after 6+ nights');
    ok(t.lingerDays[t.lingerDays.length - 1].after.every(function (m) { return m.id !== linger.id; }),
      'B4b drifted lingerer absent from after-snapshot');
  }

  // --- B5: THE SIEGE crisis — raid crisis resolved 'fought'.
  // B1/B2 raids raised aid crises; resolve the live one as fought.
  const liveCrisis = Game.state.aidCrisis;
  ok(!!liveCrisis && liveCrisis.raiders === true, 'B5 a raid crisis is live with raiders=true', liveCrisis && { raiders: liveCrisis.raiders });
  if (liveCrisis) {
    const firesBefore = t.crisisFires.length;
    Game.resolveAidCrisis('fought');
    const siegeFires = t.crisisFires.slice(firesBefore).filter(function (c) { return c.kind === 'the-siege'; });
    ok(siegeFires.length === 1, 'B5b resolve fought fires the-siege exactly once', siegeFires);
    let inProg = false;
    try { inProg = Game.progState().crises && !!Game.progState().crises['the-siege']; } catch (e) {}
    ok(inProg, 'B5c the-siege lands in prog.crises');
    ok(t.wrapLive.resolveAidCrisis === true && t.wrapLive.fireCrisis === true && t.wrapLive.raiseAidCrisis === true,
      'B5d resolveAidCrisis + fireCrisis + raiseAidCrisis wraps live');
    // Dedupe: a second fought resolve must not re-fire it.
    const firesBefore2 = t.crisisFires.length;
    try { Game.raiseAidCrisis('teeth at the door', 1); } catch (e) {}
    try { if (Game.state.aidCrisis) Game.state.aidCrisis.raiders = true; } catch (e) {}
    try { Game.resolveAidCrisis('fought'); } catch (e) {}
    const siegeFires2 = t.crisisFires.slice(firesBefore2).filter(function (c) { return c.kind === 'the-siege' && !c.deduped; });
    ok(siegeFires2.length === 0, 'B5e the-siege does not re-fire (dedupe)', t.crisisFires.slice(firesBefore2));
  }

  // --- B6: siege contest — gate closed at wave 1, phases exist.
  const siegeDef = (Game.data.contests || []).find(function (c) { return c.id === 'siege'; });
  ok(!!siegeDef && siegeDef.risk === 'extreme', 'B6 siege contest exists in data (blood/extreme)', siegeDef && siegeDef.risk);
  let siegePicked = 0;
  for (let i = 0; i < 300; i++) {
    try { const p = Game.pickContest(); if (p && p.id === 'siege') siegePicked++; } catch (e) {}
  }
  eq(siegePicked, 0, 'B6b pickContest never returns siege at wave 1 (300 draws)');
  const phases = Game._contestSiege({ id: 'siege', participants: 2 });
  ok(Array.isArray(phases) && phases.length === 3, 'B6c _contestSiege returns 3 phases', phases && phases.length);
  const arenaChoice = phases && phases[1] && (phases[1].choices || []).some(function (ch) { return ch.do && ch.do.arena && ch.do.arena.waves === 3; });
  ok(arenaChoice === true, 'B6d siege phase 2 offers the 3-wave arena hold', arenaChoice);
  // contestTick runs without throwing and the wrap records (nulls counted).
  const ticksBefore = t.contestTicks;
  let tickErr = null;
  try { for (let i = 0; i < 5; i++) Game.contestTick(); } catch (e) { tickErr = e; }
  ok(tickErr === null && t.wrapLive.contestTick === true, 'B6e contestTick runs, wrap live', { tickErr: tickErr && String(tickErr.message).slice(0, 80), ticks: t.contestTicks - ticksBefore });

  // --- B7: shelter verb — moves a villager inside, release returns them.
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  ok(roster.length > 0, 'B7 roster has a non-scholar villager to shelter', roster.length);
  if (roster.length) {
    const vid = roster[0];
    const shBefore = t.shelter.length;
    Game.shelterVillagers([vid]);
    ok(Game.isSheltered(vid) === true, 'B7b shelterVillagers shelters', { vid: vid });
    Game.releaseShelter([vid]);
    ok(Game.isSheltered(vid) === false, 'B7c releaseShelter releases', { vid: vid });
    ok(t.shelter.length >= shBefore + 2, 'B7d shelter verbs recorded', t.shelter.slice(shBefore));
    const threat = Game.shelterThreatNearHaven(2);
    ok(threat === null, 'B7e no wave-4+ threat near Haven in fixture', threat);
    ok(t.wrapLive.shelterVillagers === true && t.wrapLive.releaseShelter === true,
      'B7f shelter wraps live');
  }

  // --- B8: wave-6 herald spawn recorded with wave 6.
  const netDef = (Game.data.monsters || []).find(function (m) { return m.id === 'network_tower'; });
  ok(!!netDef && netDef.wave === 6, 'B8 network_tower is a wave-6 def', netDef && netDef.wave);
  if (netDef) {
    const spBefore = t.spawns.length;
    Game.spawnWorldMonster(netDef);
    const row = t.spawns.slice(spBefore).find(function (sp) { return sp.id === 'network_tower'; });
    ok(!!row && row.wave === 6, 'B8b spawnWorldMonster records the wave-6 herald', row);
  }

  // --- B9: death location stamp (tele-level proof of the classifier).
  const victim = roster[0];
  if (victim) {
    const dBefore = t.deaths.length;
    Game.tele('death', { kind: 'villager', who: victim, cause: 'test-cause', player: false });
    const dRow = t.deaths[dBefore];
    ok(!!dRow && (dRow.loc === 'home' || dRow.loc === 'away') && dRow.cause === 'test-cause',
      'B9 villager death stamped home/away, not unknown', dRow);
    const pBefore = t.deaths.length;
    Game.tele('death', { kind: 'player', who: 'player', cause: 'test-cause', player: true });
    const pRow = t.deaths[pBefore];
    ok(!!pRow && (pRow.loc === 'home' || pRow.loc === 'away'),
      'B9b player death stamped home/away', pRow);
  }
  ok(t.wrapLive.tele === true, 'B9c tele wrap live');

  // --- B10: snapshot shape + uninstall restores methods.
  const snap = si.snapshot();
  ok(snap && typeof snap.day === 'number' && typeof snap.pantryKcal === 'number' && Array.isArray(snap.lingering),
    'B10 daily snapshot has day/pantry/lingering', { day: snap && snap.day });
  si.uninstall();
  ok(WRAPPED.every(function (n) { return Game[n] === orig[n]; }), 'B10b uninstall restores all wrapped methods');
  ok(t.instrumentErrors.length === 0, 'B10c zero instrument errors', t.instrumentErrors.slice(0, 5));
}

// ---- C. Wave-3 forcing via the real ledger path (game load 2: seed 210402) ----
async function wave3Fixture() {
  const { Game } = await loadGame({ seed: 210402, mode: 'siegefirst-proof-c', fullTelemetry: false });
  await setupGame(Game);
  const si = SI.install(Game);
  const t = si.t;
  const s = Game.state.scholar;
  s.day = 30;
  // 4 distinct wave-2 kills through the real recordWaveKill path.
  const w2 = Game.data.monsters.filter(function (m) { return m.wave === 2; }).slice(0, 4);
  for (const def of w2) {
    try { Game.recordWaveKill(def.id, Game.villagerId, 'field', null); } catch (e) {}
  }
  const w = Game.unlockedWave();
  ok(w >= 3, 'C1 four wave-2 ledger kills + day 30 unlocks wave 3', { unlockedWave: w });
  if (w >= 3) {
    let siegePicked = 0;
    for (let i = 0; i < 300; i++) {
      try { const p = Game.pickContest(); if (p && p.id === 'siege') siegePicked++; } catch (e) {}
    }
    ok(siegePicked > 0, 'C2 pickContest CAN return siege at wave 3 (300 draws)', { siegePicked: siegePicked });
  }
  // 'moved-on' must NOT fire the-siege (fresh game: dedupe cannot explain it).
  Game.raiseAidCrisis('teeth at the door', 1);
  try { if (Game.state.aidCrisis) Game.state.aidCrisis.raiders = true; } catch (e) {}
  const firesBefore = t.crisisFires.length;
  Game.resolveAidCrisis('moved-on');
  const siegeFires = t.crisisFires.slice(firesBefore).filter(function (c) { return c.kind === 'the-siege'; });
  eq(siegeFires.length, 0, 'C3 resolve moved-on does NOT fire the-siege');
  si.uninstall();
  ok(t.instrumentErrors.length === 0, 'C4 zero instrument errors on load 2', t.instrumentErrors.slice(0, 5));
}

// ---- D. Miniature live run (1 seed, 30d, competent) — wraps survive real play ----
async function miniature() {
  const { Game } = await loadGame({ seed: 210403, mode: 'siegefirst-proof-d', fullTelemetry: false });
  await setupGame(Game);
  const si = SI.install(Game);
  const t = si.t;
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, competent, { days: 30, manifest: undefined, sampleEvery: 30 });
  });
  si.snapshot();
  si.uninstall();
  ok(result && typeof result.days === 'number' && result.days > 0, 'D1 30d miniature runs', result && result.days);
  ok(t.wrapLive.havenRaidTick === true, 'D2 havenRaidTick fired in live play (called every endDay)', t.wrapLive.havenRaidTick);
  ok(t.wrapLive.havenGrowthDaily === true, 'D3 havenGrowthDaily fired in live play', t.wrapLive.havenGrowthDaily);
  ok(t.wrapLive.contestTick === true, 'D4 contestTick fired in live play', t.wrapLive.contestTick);
  ok(t.wrapLive.tele === true, 'D5 tele fired in live play', t.wrapLive.tele);
  ok(t.daily.length > 0, 'D6 daily snapshots recorded', t.daily.length);
  ok(t.instrumentErrors.length === 0, 'D7 zero instrument errors in miniature', t.instrumentErrors.slice(0, 5));
}

(async function () {
  await liveFixtures();
  await wave3Fixture();
  await miniature();
  console.log('\n' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' | ') : ''));
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
