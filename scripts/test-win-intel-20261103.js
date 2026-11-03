'use strict';
// test-win-intel-20261103.js — winnability push track 2 proof:
// villagers executing a winning gameplan (win-plan.js), identical seeds
// before/after. One fixture, one process (harness rule: never two
// harnesses in one process).
// Usage: node scripts/test-win-intel-20261103.js <seed> <fixture>
// Fixtures: party, gear, avoid, seek, guard, standing, control
// Prints one JSON line. A driver loops seeds x fixtures and aggregates
// against evidence/2026-11-03/win-intel-prereg-20261103.md.
// Fixtures: party, gear, avoid, seek, guard, standing, control
// Prints one JSON line. Exit 0 on measured outcome (pass or fail recorded
// in JSON), 2 on setup skip, 1 on harness error.
const path = require('path');
const repo = process.env.WININTEL_REPO || path.join(__dirname, '..');
const seed = Number(process.argv[2]);
const fixture = process.argv[3];
const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));

function out(o) { console.log(JSON.stringify(o)); }

(async () => {
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = (v.px == null ? 4 : v.px), hy = (v.py == null ? 4 : v.py);
  const api = (typeof Game.winPlanDepart === 'function') && (typeof Game.winPlanFightGate === 'function');
  // Snapshot BY VALUE: winPlanStats() returns the live object, so a
  // reference snapshot would make every delta read 0 (the bug that
  // zeroed the first after-run: behaviors fired, counters aliased).
  const stats = () => {
    try { return JSON.parse(JSON.stringify(Game.winPlanStats ? Game.winPlanStats() : {})); } catch (e) { return {}; }
  };
  const npcs = (v.roster || []).filter(id => id !== Game.villagerId);
  if (npcs.length < 3) { out({ seed, fixture, skip: 'roster<3' }); process.exit(2); }
  // Clean sensing slate: no assignments, no stale crew snapshot.
  if (v.assignments) for (const k of Object.keys(v.assignments)) delete v.assignments[k];
  Game._outdoorCrew = [];
  v.health = v.health || {};
  v.trust = v.trust || {};
  for (const id of (v.roster || [])) v.health[id] = 100;
  const setNode = (id, x, y) => { try { Game.npcSetNode(id, x, y); } catch (e) {} };
  const clearGear = (id) => {
    try {
      const p = Game.getPerson(id);
      if (p) { p.items = []; p.stashed = []; if (p.equipped) p.equipped = {}; }
    } catch (e) {}
  };
  const giveGear = (id) => {
    try {
      const p = Game.getPerson(id);
      if (p) { p.items = ['hunting_spear', 'bark_armor']; p.stashed = []; }
      try { if (Game.villagerGearUp) Game.villagerGearUp(id, true); } catch (e) {}
    } catch (e) {}
  };
  const gearState = (id) => {
    try {
      const S = globalThis.Scattering || {};
      const p = Game.getPerson(id);
      const eq = S.equipment;
      const items = Game.data.items || [];
      return {
        armorP: eq && eq.armorOf ? (eq.armorOf(p, items) || 0) : 0,
        weaponB: eq && eq.weaponBonusOf ? (eq.weaponBonusOf(p, items) || 0) : 0,
      };
    } catch (e) { return { armorP: -1, weaponB: -1 }; }
  };
  const rangers = npcs.filter(id => {
    try { const pr = Game.npcRangeProfile(id); return pr === 'wanderer' || pr === 'explorer'; } catch (e) { return false; }
  });
  const fighter = rangers[0] || npcs[0];
  const companion = (rangers[1] || npcs[1]);
  const bystander = npcs.find(id => id !== fighter && id !== companion) || npcs[2];
  const day = (Game.state.scholar || {}).day || 0;
  const setExped = (id) => {
    try {
      const a = Game.agencyState();
      a.exped[id] = { tx: 6, ty: 6, dist: 2, legs: 0, sinceDay: day, sincePart: Game.dayPart, duration: 10, finds: [], encounters: [] };
    } catch (e) {}
  };
  const withPool = (def, fn) => {
    const orig = Game.monsterWavePool;
    Game.monsterWavePool = () => [def];
    try { return fn(); } finally { Game.monsterWavePool = orig; }
  };

  if (fixture === 'party') {
    for (const id of npcs) { setNode(id, hx, hy); v.trust[id] = 50; }
    giveGear(fighter); giveGear(companion);
    if (!api) { out({ seed, fixture, apiPresent: false, stats: {} }); process.exit(0); }
    const plan = Game.winPlanOf(fighter);
    plan.stage = 'party'; plan.target = 'congregation'; plan.node = { nx: 5, ny: 5 };
    const before = stats();
    const verdict = Game.winPlanDepart(fighter, hx, hy, false);
    const after = stats();
    const fExp = (() => { try { return Game.agencyState().exped[fighter]; } catch (e) { return null; } })();
    const cExp = (() => { try { return Game.agencyState().exped[companion]; } catch (e) { return null; } })();
    out({ seed, fixture, apiPresent: true, verdict,
      partyDepartures: (after.partyDepartures || 0) - (before.partyDepartures || 0),
      sameTarget: !!(fExp && cExp && fExp.tx === cExp.tx && fExp.ty === cExp.ty && fExp.tx === 5 && fExp.ty === 5),
      awayFighter: !!(v.away || {})[fighter], awayCompanion: !!(v.away || {})[companion],
      companion, fighterGear: gearState(fighter), companionGear: gearState(companion) });
    process.exit(0);
  }
  if (fixture === 'gear') {
    for (const id of npcs) setNode(id, hx, hy);
    clearGear(fighter);
    try { const st = Game.stashState(); if (st) st.weapons = []; } catch (e) {}
    v.wood = 0;
    if (!api) { out({ seed, fixture, apiPresent: false, stats: {} }); process.exit(0); }
    const plan = Game.winPlanOf(fighter);
    plan.stage = 'gear';
    const before = stats();
    const verdict = Game.winPlanDepart(fighter, hx, hy, false);
    const after = stats();
    out({ seed, fixture, apiPresent: true, verdict,
      gearHolds: (after.gearHolds || 0) - (before.gearHolds || 0),
      departed: !!(v.away || {})[fighter], fighterGear: gearState(fighter) });
    process.exit(0);
  }
  if (fixture === 'avoid' || fixture === 'seek' || fixture === 'standing' || fixture === 'trickhold' || fixture === 'trickseek') {
    const wave = (fixture === 'avoid' || fixture === 'trickhold' || fixture === 'trickseek') ? 4 : 3;
    const def = (Game.data.monsters || []).find(m => (m.wave || 1) === wave) || {};
    // Fighter on a wild node; others far away except the seek/standing ally.
    for (const id of npcs) setNode(id, 0, 0);
    setNode(fighter, 6, 6);
    if (fixture === 'avoid') { clearGear(fighter); }
    else {
      giveGear(fighter); giveGear(bystander);
      setNode(bystander, 6, 6); v.trust[bystander] = 50;
      // Wave-4 trick fixtures need a full party (fighter + 2) or the
      // outmatched branch fires before the trick gate is reached.
      if (fixture === 'trickhold' || fixture === 'trickseek') {
        giveGear(companion); setNode(companion, 6, 6); v.trust[companion] = 50;
        if (fixture === 'trickseek') {
          try { Game.state.villagerTricks = Game.state.villagerTricks || {}; Game.state.villagerTricks[def.id] = true; } catch (e) {}
        }
      }
    }
    v.trust[fighter] = 50;
    setExped(fighter);
    if (fixture === 'seek' || fixture === 'standing') {
      try { Game.state._standingDeferBeat = Game.state._standingDeferBeat || {}; Game.state._standingDeferBeat[4] = day; } catch (e) {}
    }
    let ffCalls = 0, ffAwareness = null;
    const origFF = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      ffCalls++;
      if (ffAwareness === null) ffAwareness = !!(opts && opts.awareness);
      return origFF.apply(this, arguments);
    };
    if (!api) {
      let rec = null;
      try { rec = withPool(def, () => Game.expeditionMonster(fighter, 2, false)); } catch (e) { rec = { err: e.message }; }
      Game.fieldFight = origFF;
      out({ seed, fixture, apiPresent: false, stats: {}, ffCalls, ffAwareness, outcome: rec && rec.outcome });
      process.exit(0);
    }
    const plan = Game.winPlanOf(fighter);
    if (fixture === 'avoid') { plan.stage = 'gear'; plan.target = def.id; }
    else if (fixture === 'seek') { plan.stage = 'hunt'; plan.target = def.id; plan.needWave = 3; }
    else if (fixture === 'trickhold' || fixture === 'trickseek') { plan.stage = 'hunt'; plan.target = def.id; plan.needWave = 4; }
    else { plan.stage = 'standing'; plan.target = def.id; plan.needWave = 3; }
    const before = stats();
    let rec = null, err = null;
    try { rec = withPool(def, () => Game.expeditionMonster(fighter, 2, false)); } catch (e) { err = e.message; }
    Game.fieldFight = origFF;
    const after = stats();
    out({ seed, fixture, apiPresent: true, statsDelta: {
      avoidances: (after.avoidances || 0) - (before.avoidances || 0),
      seekContacts: (after.seekContacts || 0) - (before.seekContacts || 0),
      standingContacts: (after.standingContacts || 0) - (before.standingContacts || 0),
      trickHolds: (after.trickHolds || 0) - (before.trickHolds || 0),
    }, ffCalls, ffAwareness, outcome: rec && rec.outcome, err,
      sensed: (() => { try { return Game.villagerFightAllies(fighter); } catch (e) { return []; } })(),
      fighterGear: gearState(fighter) });
    process.exit(0);
  }
  if (fixture === 'engage') {
    // Engagement: a geared ranger at Haven, no plan yet, whose village
    // has a slain kill to talk about -> Haven tick seeds a plan and
    // the gear check advances it to party in the same tick. The plan
    // is read from raw state, never via winPlanOf (the accessor itself
    // creates one, which would fake the seed).
    for (const id of npcs) setNode(id, hx, hy);
    setNode(fighter, hx, hy);
    giveGear(fighter);
    v.trust[fighter] = 50;
    try {
      Game.state.villageSlain = Game.state.villageSlain || {};
      const w1 = (Game.data.monsters || []).find(m => (m.wave || 1) === 1) || {};
      if (w1.id) Game.state.villageSlain[w1.id] = 1;
    } catch (e) {}
    if (!api) { out({ seed, fixture, apiPresent: false, stats: {} }); process.exit(0); }
    const prePlan = (() => { try { return (Game.state.village.winPlan || {})[fighter] || null; } catch (e) { return null; } })();
    const before = stats();
    let err = null;
    try { Game.winPlanHavenTick(fighter, hx, hy); } catch (e) { err = e.message; }
    const after = stats();
    const plan = (() => { try { return (Game.state.village.winPlan || {})[fighter] || null; } catch (e) { return null; } })();
    out({ seed, fixture, apiPresent: true, prePlan: !!prePlan,
      planStage: plan ? plan.stage : null,
      planSeeds: (after.planSeeds || 0) - (before.planSeeds || 0),
      stageAdvances: (after.stageAdvances || 0) - (before.stageAdvances || 0),
      err });
    process.exit(0);
  }
  if (fixture === 'partial') {
    // No partial launch: the companion is sick, so the party launch
    // must abort BEFORE the inviter leaves — never inviter-out-solo
    // with an invite counted and no departure. (The 180-day smoke
    // caught the old order: 2 invites, 0 departures.)
    for (const id of npcs) { setNode(id, hx, hy); v.trust[id] = 50; }
    giveGear(fighter); giveGear(companion);
    try { v.sick = v.sick || {}; v.sick[companion] = true; } catch (e) {}
    if (!api) { out({ seed, fixture, apiPresent: false, stats: {} }); process.exit(0); }
    const plan = Game.winPlanOf(fighter);
    plan.stage = 'party'; plan.target = 'congregation'; plan.node = { nx: 5, ny: 5 };
    const before = stats();
    const verdict = Game.winPlanDepart(fighter, hx, hy, false);
    const after = stats();
    out({ seed, fixture, apiPresent: true, verdict,
      partyInvites: (after.partyInvites || 0) - (before.partyInvites || 0),
      partyDepartures: (after.partyDepartures || 0) - (before.partyDepartures || 0),
      awayFighter: !!(v.away || {})[fighter], awayCompanion: !!(v.away || {})[companion] });
    process.exit(0);
  }
  if (fixture === 'guard') {
    for (const id of npcs) { setNode(id, 0, 0); v.trust[id] = 10; }
    setNode(fighter, hx, hy); v.trust[fighter] = 50;
    giveGear(fighter);
    try {
      Game.state.waveKillLog = Game.state.waveKillLog || [];
      Game.state.waveKillLog.push({ by: fighter, w: 4, mid: 'congregation', d: day, via: 'test' });
      Game.state._standingDeferBeat = Game.state._standingDeferBeat || {};
      Game.state._standingDeferBeat[5] = day;
    } catch (e) {}
    if (!api) { out({ seed, fixture, apiPresent: false, stats: {} }); process.exit(0); }
    const plan = Game.winPlanOf(fighter);
    plan.stage = 'table'; plan.holdSinceDay = -1;
    const before = stats();
    const verdict1 = Game.winPlanDepart(fighter, hx, hy, false);
    const mid = stats();
    // Now restore a companion and try again.
    setNode(companion, hx, hy); v.trust[companion] = 50; giveGear(companion);
    plan.holdSinceDay = -1;
    const verdict2 = Game.winPlanDepart(fighter, hx, hy, false);
    const after = stats();
    const fExp = (() => { try { return Game.agencyState().exped[fighter]; } catch (e) { return null; } })();
    const cExp = (() => { try { return Game.agencyState().exped[companion]; } catch (e) { return null; } })();
    out({ seed, fixture, apiPresent: true, verdict1, verdict2,
      veteranGuardHolds: (mid.veteranGuardHolds || 0) - (before.veteranGuardHolds || 0),
      partyDepartures2: (after.partyDepartures || 0) - (mid.partyDepartures || 0),
      sameTarget2: !!(fExp && cExp && fExp.tx === cExp.tx && fExp.ty === cExp.ty) });
    process.exit(0);
  }
  if (fixture === 'tend') {
    // Two marginal primary bonds, pantry able to spare 3+ days, a
    // plan-holder home at Haven. The drive (not the player) tends.
    const mship = Game.mshipState();
    mship.links = mship.links || [];
    const la = { id: 'tlink-a', status: 'active', primary: 'haven', subordinate: 'village-a', trust: 42, day: day - 40, history: [] };
    const lb = { id: 'tlink-b', status: 'active', primary: 'haven', subordinate: 'village-b', trust: 45, day: day - 40, history: [] };
    mship.links.push(la, lb);
    v.pantry = [{ itemId: 'grain-test', kcalEach: 1000, units: 100, spoilDay: 99999 }];
    for (const id of npcs) setNode(id, hx, hy);
    if (!api) { out({ seed, fixture, apiPresent: false, stats: {} }); process.exit(0); }
    const plan = Game.winPlanOf(fighter);
    plan.stage = 'standing';
    const before = stats();
    let res = null, err = null;
    try { res = Game.winPlanBondsTick(hx, hy); } catch (e) { err = e.message; }
    const mid = stats();
    // Phase 2 (pantry floor): a third marginal bond, pantry nearly bare.
    const lc = { id: 'tlink-c', status: 'active', primary: 'haven', subordinate: 'village-c', trust: 40, day: day - 40, history: [] };
    mship.links.push(lc);
    v.pantry = [{ itemId: 'grain-test', kcalEach: 1000, units: 1, spoilDay: 99999 }];
    let res2 = null;
    try { res2 = Game.winPlanBondsTick(hx, hy); } catch (e) {}
    const after = stats();
    out({ seed, fixture, apiPresent: true, err,
      bondTends: (mid.bondTends || 0) - (before.bondTends || 0),
      tended: res && res.tended,
      trustA: la.trust, trustB: lb.trust,
      tendedWeekA: la.tendedWeek, tendedWeekB: lb.tendedWeek,
      phase2Tends: (after.bondTends || 0) - (mid.bondTends || 0),
      linkCWeek: lc.tendedWeek });
    process.exit(0);
  }
  if (fixture === 'standdown') {
    // Two seasoned primary bonds, a 5-day-old hungry herald muster,
    // weakest link below 55, actor committed to the muster + home.
    const mship = Game.mshipState();
    mship.links = mship.links || [];
    const la = { id: 'slink-a', status: 'active', primary: 'haven', subordinate: 'village-a', trust: 45, day: day - 40, history: [{ day: day, kind: 'muster-hunger', amount: -2 }] };
    const lb = { id: 'slink-b', status: 'active', primary: 'haven', subordinate: 'village-b', trust: 48, day: day - 40, history: [] };
    mship.links.push(la, lb);
    for (const id of npcs) setNode(id, hx, hy);
    const setMuster = () => {
      Game.state.titans = { omens: { herald: { stage: 1, day: day - 5 } },
        musters: { herald: { day: day - 5, allies: [{ villageId: 'village-a', vid: 'ally-1', name: 'Ally' }], haven: [fighter], lastUpkeep: day } },
        slain: {}, cast: null };
      v.titanCommitted = {}; v.titanCommitted[fighter] = 'herald';
    };
    setMuster();
    if (!api) { out({ seed, fixture, apiPresent: false, stats: {} }); process.exit(0); }
    const plan = Game.winPlanOf(fighter);
    plan.stage = 'standing';
    const before = stats();
    let res = null, err = null;
    try { res = Game.winPlanMusterTick(hx, hy); } catch (e) { err = e.message; }
    const mid = stats();
    const musterAfter1 = (() => { try { return Game.state.titans.musters.herald; } catch (e) { return 'ERR'; } })();
    const trustAfter1 = la.trust;
    // Phase 2 (weakest guard): rebuild the muster, weakest link at 60.
    la.trust = 60; lb.trust = 62;
    setMuster();
    let res2 = null;
    try { res2 = Game.winPlanMusterTick(hx, hy); } catch (e) {}
    const after = stats();
    const musterAfter2 = (() => { try { return Game.state.titans.musters.herald; } catch (e) { return 'ERR'; } })();
    out({ seed, fixture, apiPresent: true, err, res: !!res,
      musterStanddowns: (mid.musterStanddowns || 0) - (before.musterStanddowns || 0),
      musterGone1: musterAfter1 == null,
      trustAfter1: trustAfter1,
      trustAAfter: la.trust,
      phase2Standdowns: (after.musterStanddowns || 0) - (mid.musterStanddowns || 0),
      musterStands2: musterAfter2 != null });
    process.exit(0);
  }
  if (fixture === 'control') {
    const def = (Game.data.monsters || []).find(m => (m.wave || 1) === 1) || {};
    for (const id of npcs) setNode(id, 0, 0);
    setNode(fighter, 6, 6);
    giveGear(fighter);
    setExped(fighter);
    let ffCalls = 0, ffAwareness = null;
    const origFF = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      ffCalls++;
      if (ffAwareness === null) ffAwareness = !!(opts && opts.awareness);
      return origFF.apply(this, arguments);
    };
    const before = stats();
    let rec = null, err = null;
    try { rec = withPool(def, () => Game.expeditionMonster(fighter, 2, false)); } catch (e) { err = e.message; }
    Game.fieldFight = origFF;
    const after = stats();
    const delta = {};
    for (const k of Object.keys(after)) delta[k] = (after[k] || 0) - (before[k] || 0);
    out({ seed, fixture, apiPresent: api, ffCalls, ffAwareness, outcome: rec && rec.outcome, err, statsDelta: delta });
    process.exit(0);
  }
  out({ seed, fixture, skip: 'unknown fixture' });
  process.exit(2);
})().catch(e => { console.error('PANEL-FAILED', (e && e.stack) || e); process.exit(1); });
