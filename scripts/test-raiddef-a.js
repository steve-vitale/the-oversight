#!/usr/bin/env node
// scripts/test-raiddef-a.js — proof test, arm sim-raiddef-a
// NOTE: the RAIDDEF implementation this proves was REVERTED after the pilot
// (NO-GO kind PARTICIPATION — no holder ever existed on the band; see
// evidence/2026-11-20/sim-raiddef-a.md). This file is kept as the record that
// the rule worked in fixtures (28/28 pre-revert). Re-running it requires
// re-applying the reverted havenGrowth.js change; it FAILS against plain
// master by design (Game._raidDefArmedHolder does not exist there).
// (finding #2599: the raid-defender question — the gun belongs with
// raid defenders. The raid picks defenders by roster order and never
// consults what anyone carries; with RAIDDEF=1 a living armed
// searcaster holder who is present and able is drafted as a defender,
// prioritized to the front of the defender pick in havenRaidTick.)
// The lever, env-gated RAIDDEF=1; unset = the old pick,
// byte-identical:
// (a) _raidDefArmedHolder: equipped searcaster, >= 1 fusion cell,
//     village health > 20 (the holder's bar — a holder at 21-40 IS
//     drafted even though the generic defender filter wants > 40),
//     not sheltered, not post-flee resting, never the scholar, not
//     away, living. Zero Math.random() draws (asserted on every
//     direct call);
// (b) havenRaidTick: with RAIDDEF=1 the eligible holder moves to the
//     FRONT of the defender pick (roster order among holders) and
//     meets the first raider; a SHIELDED holder stays back (the
//     shield promise wins); a sheltered / post-flee / away holder is
//     never drafted. Off-leg the pick is exactly as before (roster
//     order). The raid roll, the raider draft, the linger path, and
//     the defense beat are untouched;
// (c) the live drafted holder FIRES an armed raid volley through
//     the real router (opts.raid) and the real fieldFight — the
//     holder does not just lead, the gun speaks. Encounter-gear
//     fixture throughout: a geared villager fighter with a party,
//     never a fresh un-geared solo scholar;
// (d) the analyzer --selftest covers the cross-leg judge shapes
//     (GO, NO-GO per bar incl. the D = 0 PARTICIPATION shape and
//     the two-view starvation guardrail).
//
// The env gate lives in the tick, not the helper: direct helper
// calls return the holder with RAIDDEF unset too (asserted), so a
// failure of the gate shows up at raid level, where it matters.
//
// Usage: node scripts/test-raiddef-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf } = require('./raiddef-driver-a');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
// Feed Math.random a fixed draw sequence; returns how many draws were consumed.
function withDraws(draws, fn) {
  const saved = Math.random;
  let di = 0;
  Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  try { return { out: fn(), used: di }; }
  finally { Math.random = saved; }
}
function setFlag(name, on) { if (on) process.env[name] = '1'; else delete process.env[name]; }
function setRaiddef(on) { setFlag('RAIDDEF', on); }
function loosedCount(rec) {
  return (rec && rec.log || []).filter(function (s) { return /^  loosed/.test(String(s)); }).length;
}

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'raiddef-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const plainA = roster[0], holder = roster[1], plainB = roster[2], holder2 = roster[3];
  const pHolder = personOf(Game, holder), pA = personOf(Game, plainA),
    pB = personOf(Game, plainB), pH2 = personOf(Game, holder2);
  console.log('holder=' + holder + ' roster=' + roster.length);

  // ---- 1. live data agreement ----
  check('draft helper exists on Game', typeof Game._raidDefArmedHolder === 'function');
  check('havenRaidTick exists on Game', typeof Game.havenRaidTick === 'function');
  check('village pantry smells (>= 3000 kcal, else no raid can fire)',
    (Game.pantryKcalLive ? Game.pantryKcalLive(v) : 0) >= 3000,
    'pantry=' + (Game.pantryKcalLive ? Game.pantryKcalLive(v) : 'n/a'));

  function armHolder(p, vid, cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  function armed(id) {
    if (typeof Game._raidDefArmedHolder !== 'function') return null;
    return Game._raidDefArmedHolder(id);
  }
  function setHp(vid, hp) {
    Game.state.village.health = Game.state.village.health || {};
    if (hp === null) delete Game.state.village.health[vid];
    else Game.state.village.health[vid] = hp;
  }
  function setSheltered(vid, on) {
    v.sheltered = v.sheltered || {};
    if (on) v.sheltered[vid] = { since: Game.state.scholar.day || 1, reason: 'test' };
    else delete v.sheltered[vid];
  }
  function setAway(vid, on) {
    v.away = v.away || {};
    if (on) v.away[vid] = true;
    else delete v.away[vid];
  }
  function setShielded(vid, on) {
    v.shielded = v.shielded || {};
    if (on) v.shielded[vid] = true;
    else delete v.shielded[vid];
  }

  // ---- 2. draft-helper fixtures (direct calls, zero draws) ----
  setRaiddef(true);
  armHolder(pHolder, holder, 2);
  resetVillager(Game, pA); resetVillager(Game, pB); resetVillager(Game, pH2);
  let r = withDraws([0.5], function () { return armed(holder); });
  check('helper (a): armed holder (searcaster + 2 cells) -> holder, 0 draws',
    r.out === holder && r.used === 0, 'got=' + r.out + ' draws=' + r.used);
  // (b) a cell-less holder is not armed.
  armHolder(pHolder, holder, 0);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (b): 0-cell holder -> null', r.out === null && r.used === 0, 'got=' + r.out);
  // (c) a badly hurt holder (HP <= 20) does not step forward.
  armHolder(pHolder, holder, 2);
  setHp(holder, 15);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (c): HP-15 holder -> null', r.out === null && r.used === 0, 'got=' + r.out);
  // (d) the holder's bar is > 20, not the generic > 40: HP 25 IS drafted.
  setHp(holder, 25);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (d): HP-25 holder -> holder (the 21-40 band is drafted)',
    r.out === holder && r.used === 0, 'got=' + r.out);
  // (e) the boundary: HP 20 exactly is not > 20.
  setHp(holder, 20);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (e): HP-20 holder -> null (boundary)', r.out === null && r.used === 0, 'got=' + r.out);
  setHp(holder, null);
  // (f) a sheltered holder stays behind the barricaded hall door.
  armHolder(pHolder, holder, 2);
  setSheltered(holder, true);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (f): sheltered holder -> null', r.out === null && r.used === 0, 'got=' + r.out);
  setSheltered(holder, false);
  // (g) a post-flee resting holder rests.
  Game.markPostFleeRest(holder);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (g): post-flee resting holder -> null', r.out === null && r.used === 0, 'got=' + r.out);
  // Clear the fixture's own post-flee flag (it is day-bound; the
  // later fixtures run on the same day and must not inherit it).
  try { if (Game._postFleeRest) delete Game._postFleeRest[holder]; } catch (e) {}
  // (h) the scholar never counts, even armed (helper reads the villagerId).
  r = withDraws([0.5], function () { return armed(Game.villagerId); });
  check('helper (h): scholar vid -> null (never the scholar)', r.out === null && r.used === 0, 'got=' + r.out);
  // (i) an away holder is not present.
  setAway(holder, true);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (i): away holder -> null', r.out === null && r.used === 0, 'got=' + r.out);
  setAway(holder, false);
  // (j) a bow-holder is not an armed searcaster holder.
  resetVillager(Game, pHolder);
  pHolder.items = [{ itemId: 'bow', name: 'Bow', units: 1, kg: 1.0 }];
  Game.villagerGearUp(holder, true);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (j): bow-holder -> null', r.out === null && r.used === 0, 'got=' + r.out);
  // (k) the env gate lives in the tick, not the helper.
  armHolder(pHolder, holder, 2);
  setRaiddef(false);
  r = withDraws([0.5], function () { return armed(holder); });
  check('helper (k): helper is env-independent (gate lives in the tick)',
    r.out === holder && r.used === 0, 'got=' + r.out);
  setRaiddef(true);

  // ---- 3. raid-level proof: the defender pick, via a stubbed router ----
  // Three raiders (wave-1 ids — the raid does not care about wave),
  // day 10, last raid day 0 (cooldown passed). The router is stubbed
  // to capture the defender order; the rest of the raid runs live.
  function runRaid(draws) {
    Game.state.scholar.day = 10;
    v.lastRaidDay = 0;
    v.away = v.away || {};
    const savedMonsters = Game.state.worldMonsters;
    Game.state.worldMonsters = [
      { id: 'boar', tx: 1, ty: 1, hp: 40, maxHp: 40 },
      { id: 'boar', tx: 7, ty: 7, hp: 40, maxHp: 40 },
      { id: 'boar', tx: 2, ty: 6, hp: 40, maxHp: 40 },
    ];
    const captured = [];
    const realResolve = Game.resolveWildMonsterEncounter;
    Game.resolveWildMonsterEncounter = function (vid, m, opts) {
      captured.push({ vid: vid, mid: m && m.id, raid: !!(opts && opts.raid) });
      return { outcome: 'vKill' };
    };
    // Silence the player-at-haven pending path: the scholar sleeps
    // elsewhere for the fixture (playerAtHaven false keeps the raid
    // to the defender draft + linger path only).
    const realPAH = Game.playerAtHaven;
    Game.playerAtHaven = function () { return false; };
    let fired = null;
    // The raid's 18% roll reads the module-captured R (seeded at
    // load), NOT the withDraws replacement — so the roll cannot be
    // forced with a draw. Retry until it fires (a failed roll
    // returns before any state changes, so retries are safe);
    // bounded, and the draft assertions read the captured leads.
    const res = withDraws(draws, function () {
      for (let i = 0; i < 40 && !fired; i++) fired = Game.havenRaidTick();
      return captured.slice();
    });
    Game.resolveWildMonsterEncounter = realResolve;
    Game.playerAtHaven = realPAH;
    Game.state.worldMonsters = savedMonsters;
    return { fired: fired, leads: res.out, draws: res.used };
  }
  // Clean stage: holder armed, everyone home, healthy, unshielded.
  armHolder(pHolder, holder, 2);
  resetVillager(Game, pA); resetVillager(Game, pB);
  setHp(holder, null); setHp(plainA, null); setHp(plainB, null);
  setShielded(holder, false);
  setRaiddef(true);
  let raid = runRaid([0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
  check('raid (a): RAIDDEF on, raid fires', raid.fired === true, 'fired=' + raid.fired);
  check('raid (b): RAIDDEF on, holder meets the FIRST raider',
    raid.leads.length >= 1 && raid.leads[0].vid === holder,
    'leads=' + JSON.stringify(raid.leads.map(function (x) { return x.vid; })));
  check('raid (c): every raid fight routes with {raid:true}',
    raid.leads.length === 3 && raid.leads.every(function (x) { return x.raid === true; }),
    'leads=' + JSON.stringify(raid.leads));
  // RAIDDEF off: the old pick stands — roster order, plainA first.
  setRaiddef(false);
  raid = runRaid([0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
  check('raid (d): RAIDDEF off, raid fires', raid.fired === true, 'fired=' + raid.fired);
  check('raid (e): RAIDDEF off, roster order leads (plainA first, holder NOT first)',
    raid.leads.length >= 1 && raid.leads[0].vid === plainA && raid.leads[0].vid !== holder,
    'leads=' + JSON.stringify(raid.leads.map(function (x) { return x.vid; })));
  setRaiddef(true);
  // A hurt holder at HP 25 still meets the first raider (the > 20 bar).
  setHp(holder, 25);
  raid = runRaid([0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
  check('raid (f): HP-25 holder still meets the first raider',
    raid.leads.length >= 1 && raid.leads[0].vid === holder,
    'leads=' + JSON.stringify(raid.leads.map(function (x) { return x.vid; })));
  setHp(holder, null);
  // A SHIELDED holder stays back: plainA first, and with 10 other
  // defenders ahead of them and only 3 raiders, the shielded holder
  // is not spent at all (the shield promise: "spend others first").
  setShielded(holder, true);
  raid = runRaid([0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
  check('raid (g): shielded holder stays back (plainA first, holder never drafted)',
    raid.leads.length === 3 && raid.leads[0].vid === plainA &&
    raid.leads.every(function (x) { return x.vid !== holder; }),
    'leads=' + JSON.stringify(raid.leads.map(function (x) { return x.vid; })));
  setShielded(holder, false);
  // A sheltered holder is never drafted at all.
  setSheltered(holder, true);
  raid = runRaid([0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
  check('raid (h): sheltered holder is never drafted',
    raid.leads.length >= 1 && raid.leads.every(function (x) { return x.vid !== holder; }),
    'leads=' + JSON.stringify(raid.leads.map(function (x) { return x.vid; })));
  setSheltered(holder, false);

  // ---- 4. live drafted holder fires an armed raid volley ----
  // Real router + real fieldFight, one raider, holder armed with 4
  // cells. The fieldFight wrap captures the lead + the fight record.
  setRaiddef(true);
  armHolder(pHolder, holder, 4);
  Game.villagerGearUp(holder, true);
  const kit = rangedKitOf(Game, pHolder);
  check('live: holder is geared with the searcaster in the ranged slot',
    kit && kit.rwId === 'searcaster', JSON.stringify(kit));
  resetVillager(Game, pA); resetVillager(Game, pB);
  const realFieldFight = Game.fieldFight;
  let leadVid = null, fightRec = null, raidFlag = null;
  const realResolve2 = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) {
    raidFlag = !!(opts && opts.raid);
    return realResolve2.apply(Game, arguments);
  };
  Game.fieldFight = function (vid, mdef, m, opts) {
    const rec = realFieldFight.call(Game, vid, mdef, m, opts);
    // Record the FIRST fight only: the raid drafts 3 raiders and the
    // holder meets the first — later fights have other leads.
    if (leadVid === null) { leadVid = vid; fightRec = rec; }
    return rec;
  };
  const realPAH2 = Game.playerAtHaven;
  Game.playerAtHaven = function () { return false; };
  Game.state.scholar.day = 10;
  v.lastRaidDay = 0;
  const savedMonsters2 = Game.state.worldMonsters;
  // THREE monsters: the raid needs >= 3 living world monsters to
  // fire at all (the single-monster stage could never fire).
  Game.state.worldMonsters = [
    { id: 'boar', tx: 1, ty: 1, hp: 40, maxHp: 40 },
    { id: 'boar', tx: 7, ty: 7, hp: 40, maxHp: 40 },
    { id: 'boar', tx: 2, ty: 6, hp: 40, maxHp: 40 },
  ];
  const cellsBefore = ammoCountOf(pHolder.items, 'fusion_cell');
  leadVid = null; fightRec = null; raidFlag = null;
  // Same captured-R roll as §3: retry until the raid fires and the
  // real fight is captured (bounded; a failed roll changes nothing).
  const live = withDraws([0.9, 0.5, 0.5, 0.7, 0.2, 0.6, 0.3, 0.8, 0.15, 0.55, 0.25, 0.4, 0.1, 0.9, 0.45, 0.65],
    function () {
      for (let i = 0; i < 40 && leadVid === null; i++) { Game.havenRaidTick(); v.lastRaidDay = 0; }
      return { lead: leadVid, rec: fightRec, raid: raidFlag };
    });
  Game.fieldFight = realFieldFight;
  Game.resolveWildMonsterEncounter = realResolve2;
  Game.playerAtHaven = realPAH2;
  Game.state.worldMonsters = savedMonsters2;
  check('live: the raid routes through the router with {raid:true}',
    live.out && live.out.raid === true, 'raid=' + (live.out && live.out.raid));
  check('live: the raid drafts the holder as lead of the real fight',
    live.out && live.out.lead === holder, 'lead=' + (live.out && live.out.lead) + ' want=' + holder);
  check('live: drafted holder fires an armed raid volley (shots > 0)',
    live.out && live.out.rec && live.out.rec.volley && live.out.rec.volley.shots > 0,
    JSON.stringify(live.out && live.out.rec && live.out.rec.volley));
  check('live: volley spends exactly its loosed shots in cells',
    live.out && live.out.rec && live.out.rec.volley && loosedCount(live.out.rec) > 0 &&
    ammoCountOf(pHolder.items, 'fusion_cell') === cellsBefore - loosedCount(live.out.rec),
    'cellsBefore=' + cellsBefore + ' left=' + ammoCountOf(pHolder.items, 'fusion_cell') +
    ' loosed=' + (live.out && live.out.rec && loosedCount(live.out.rec)));
  setRaiddef(false);

  // ---- 5. analyzer selftest (cross-leg judge shapes) ----
  console.log('\n=== Analyzer selftest (analyze-raiddef-a --selftest) ===');
  let anaSelf = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-raiddef-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    anaSelf = /53 passed, 0 failed/.test(anaOut);
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (53 passed, 0 failed — incl. the GO / NO-GO-per-bar judge)', anaSelf === true, anaSelf === null ? 'no output' : 'see output above');

  console.log('RAIDDEF_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('RAIDDEF_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
