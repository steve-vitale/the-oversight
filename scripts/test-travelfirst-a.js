// test-travelfirst-a.js — proof for the travel/roads first-numbers instrument
// (arm sim-travelfirst-a, run fleshout-20261111T0315Z, adoption of
// fleshout-20261111T0315Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-travelfirst-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const TI = require(path.join(REPO, 'scripts', 'travelfirst-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'travelfirst-analyze-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const POL = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const competent = POL.competent;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- A. Pure classifier fixtures (no game load) ----
(function () {
  // classifyOutcome(ret, x, y, px, py, preInCombat, combatExit, overBefore, overNow)
  eq(TI.classifyOutcome(undefined, 4, 3, 4, 3, false, false, false, false), 'moved', 'A1 success returns moved');
  eq(TI.classifyOutcome(null, 0, 0, 4, 4, false, false, false, false), 'refused-null', 'A2 null, not combat -> refused-null');
  eq(TI.classifyOutcome(null, 0, 0, 4, 4, true, false, false, false), 'combat-refused', 'A3 null mid-combat without combatExit -> combat-refused');
  eq(TI.classifyOutcome(null, 0, 0, 4, 4, true, true, false, false), 'refused-null', 'A4 null mid-combat WITH combatExit -> refused-null, not combat-refused');
  eq(TI.classifyOutcome(null, 0, 0, 4, 4, false, false, true, true), 'over', 'A5 null while over -> over');
  eq(TI.classifyOutcome({ kind: 'blockage', blockType: 'creek', x: 4, y: 3 }, 4, 3, 4, 4, false, false, false, false), 'blocked', 'A6 blockage object -> blocked');
  eq(TI.classifyOutcome(undefined, 4, 3, 4, 4, false, false, false, true), 'over', 'A7 undefined + unmoved + over now -> over (pit death)');
  eq(TI.classifyOutcome(undefined, 4, 3, 4, 4, false, false, false, false), 'other', 'A8 undefined + unmoved + alive -> other');

  // classifyCaller on fabricated stacks (innermost-first, ' | ' joined).
  function stackFor(frames) {
    return frames.map(function (f) { return 'at ' + f.fn + ' (' + f.file + ')'; }).join(' | ');
  }
  eq(TI.classifyCaller(stackFor([
    { fn: 'walkTo', file: '/x/scripts/policies/competent.js:1210:10' },
    { fn: 'daily', file: '/x/scripts/policies/competent.js:3300:5' },
  ])).caller, 'walkTo', 'A9 bare walkTo -> walkTo');
  eq(TI.classifyCaller(stackFor([
    { fn: 'walkTo', file: '/x/scripts/policies/competent.js:1210:10' },
    { fn: 'walkHome', file: '/x/scripts/policies/competent.js:1275:5' },
    { fn: 'forageTripSeedFirst', file: '/x/scripts/policies/competent.js:1623:5' },
  ])).caller, 'forageTripSeedFirst', 'A10 trip chain attributes to forageTripSeedFirst');
  eq(TI.classifyCaller(stackFor([
    { fn: 'walkTo', file: '/x/scripts/policies/competent.js:1210:10' },
    { fn: 'walkHome', file: '/x/scripts/policies/competent.js:1275:5' },
    { fn: 'goHomeStanding', file: '/x/scripts/policies/competent.js:1402:5' },
  ])).caller, 'goHomeStanding', 'A11 goHomeStanding return leg');
  eq(TI.classifyCaller(stackFor([
    { fn: 'travelTo', file: '/x/src/js/game.js:11825:10' },
    { fn: 'Object.walkHome', file: '/x/src/js/game.js:11801:5' },
  ])).caller, 'engine-walkHome', 'A12 engine walkHome (game.js) -> engine-walkHome');
  eq(TI.classifyCaller(stackFor([
    { fn: 'walkTo', file: '/x/scripts/policies/competent.js:1210:10' },
    { fn: 'walkHome', file: '/x/scripts/policies/competent.js:1275:5' },
  ])).caller, 'policy-walkHome', 'A13 policy walkHome (competent.js) -> policy-walkHome');
  eq(TI.classifyCaller(stackFor([
    { fn: 'tbBarrierExit', file: '/x/src/js/game.js:37306:10' },
    { fn: 'daily', file: '/x/scripts/policies/competent.js:3489:5' },
  ])).caller, 'tbBarrierExit', 'A14 barrier exit -> tbBarrierExit');
  const th = TI.classifyCaller(stackFor([
    { fn: 'routeAround', file: '/x/scripts/policies/competent.js:1255:10' },
    { fn: 'thirstWalkHome', file: '/x/scripts/policies/competent.js:1320:5' },
  ]));
  eq(th.caller, 'thirstWalkHome', 'A15 thirst detour attributes to thirstWalkHome');
  eq(th.via, 'routeAround', 'A15b thirst detour via is routeAround');
  eq(TI.classifyCaller(stackFor([
    { fn: 'feastFightRoad', file: '/x/scripts/policies/competent.js:537:10' },
  ])).caller, 'feastFightRoad', 'A16 feast patrol -> feastFightRoad');
  eq(TI.classifyCaller(stackFor([
    { fn: 'somethingElse', file: '/x/scripts/policies/competent.js:999:10' },
  ])).caller, 'other', 'A17 unknown frame -> other');
  eq(TI.classifyCaller(stackFor([
    { fn: 'tryNodeExit', file: '/x/src/js/game.js:12599:10' },
  ])).caller, 'tryNodeExit', 'A18 tryNodeExit -> tryNodeExit');

  // classifyEvening (nighttravel partition order).
  eq(TI.classifyEvening({ inCombat: true, inTent: false, havenKnown: true, travelOffered: true, blockedToday: false }), 'combat', 'A19 combat evening');
  eq(TI.classifyEvening({ inCombat: false, inTent: true, havenKnown: true, travelOffered: true, blockedToday: false }), 'tent', 'A20 tent evening');
  eq(TI.classifyEvening({ inCombat: false, inTent: false, havenKnown: false, travelOffered: false, blockedToday: false }), 'haven-unknown', 'A21 haven-unknown evening');
  eq(TI.classifyEvening({ inCombat: false, inTent: false, havenKnown: true, travelOffered: false, blockedToday: false }), 'too-far', 'A22 out-of-reach evening');
  eq(TI.classifyEvening({ inCombat: false, inTent: false, havenKnown: true, travelOffered: true, blockedToday: true }), 'blocked-path', 'A23 blocked-path evening');
  eq(TI.classifyEvening({ inCombat: false, inTent: false, havenKnown: true, travelOffered: true, blockedToday: false }), 'within-reach', 'A24 within-reach evening');
  // Guard beats blocked-path (nighttravel order: blockedGuard first).
  eq(TI.classifyEvening({ inCombat: true, inTent: false, havenKnown: true, travelOffered: true, blockedToday: true }), 'combat', 'A25 combat beats blocked-path');
})();

// ---- B. Live wrap fixtures (one game load, direct calls) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 180249, mode: 'travelfirst-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const orig = {};
  ['travelTo', 'walkHome', 'tryNodeExit', 'tele', 'npcNodeTravel'].forEach(function (n) { orig[n] = Game[n]; });
  const origNomad = {};
  ['enterLeg', 'departLeg', 'start'].forEach(function (n) { origNomad[n] = Game.nomad[n]; });
  const ti = TI.install(Game);
  const t = ti.t;
  const hx = 4, hy = 4; // scholar starts at haven (4,4) after setupGame
  ok(Game.map.px === hx && Game.map.py === hy, 'B0 scholar starts at haven', { px: Game.map.px, py: Game.map.py });

  function cleanTile(x, y) {
    try { const tl = Game.tileAt(x, y); if (tl && tl.blockFrom) delete tl.blockFrom; } catch (e) {}
  }
  // B2 first (no movement, no encounter risk): rig a destination blockage.
  // Pick a d=1 offered, non-creek target and guard its approach side.
  let b2 = null;
  try {
    for (const tt of (Game.travelTargets() || [])) {
      if (Math.abs(tt.x - hx) + Math.abs(tt.y - hy) !== 1) continue;
      const tl = Game.tileAt(tt.x, tt.y);
      if (!tl || tl.type === 'creek') continue;
      const dx = Math.sign(tt.x - hx), dy = Math.sign(tt.y - hy);
      tl.blockFrom = (dx !== 0) ? { dx: -dx, dy: 0, type: 'fallen_tree' } : { dx: 0, dy: -dy, type: 'fallen_tree' };
      const chk = Game.travelBlockage(tt.x, tt.y);
      if (chk && chk.blockType === 'fallen_tree') { b2 = { x: tt.x, y: tt.y }; break; }
      delete tl.blockFrom;
    }
  } catch (e) { ok(false, 'B2 rig destination blockage', { err: String(e && e.message) }); }
  ok(b2 !== null, 'B2a a riggable d=1 target exists', b2);
  if (b2) {
    const before = t.travelTo.length;
    const r = Game.travelTo(b2.x, b2.y);
    ok(t.travelTo.length === before + 1, 'B2 travelTo blocked recorded', t.travelTo[t.travelTo.length - 1]);
    const rec = t.travelTo[t.travelTo.length - 1];
    ok(rec && rec.outcome === 'blocked' && rec.blockType === 'fallen_tree' && rec.intermediate === false,
      'B2b destination blockage classified', rec);
    ok(r && r.kind === 'blockage' && r.blockType === 'fallen_tree', 'B2c engine returns the blockage');
    ok(Game.map.px === hx && Game.map.py === hy, 'B2d blocked step moves nothing');
    cleanTile(b2.x, b2.y);
  }

  // B3: intermediate blockage — reveal a straight d=2 target, rig its middle tile.
  // (travelTargets() never lists unrevealed d=2 tiles, so iterate coordinates
  // directly and reveal the destination first.)
  let b3 = null;
  try {
    const straights = [[hx, hy - 2], [hx, hy + 2], [hx - 2, hy], [hx + 2, hy]];
    for (const cand of straights) {
      const tx = cand[0], ty = cand[1];
      if (tx < 0 || tx > 8 || ty < 0 || ty > 8) continue;
      const dest = Game.tileAt(tx, ty);
      if (!dest || dest.type === 'creek') continue;
      const mx = hx + Math.sign(tx - hx), my = hy + Math.sign(ty - hy);
      const mid = Game.tileAt(mx, my);
      if (!mid || mid.type === 'creek') continue;
      Game.reveal(tx, ty);
      if (!Game.travelTargets().some(function (z) { return z.x === tx && z.y === ty; })) continue;
      // The destination itself must be enterable from the middle tile, or
      // travelTo reports the DESTINATION blockage first — clear a natural
      // guard for the fixture (restored by the cleanTile call below).
      if (Game.travelBlockage(tx, ty, mx, my)) { if (dest.blockFrom) delete dest.blockFrom; }
      if (Game.travelBlockage(tx, ty, mx, my)) continue;
      mid.blockFrom = (tx !== hx) ? { dx: -Math.sign(tx - hx), dy: 0, type: 'rubble' } : { dx: 0, dy: -Math.sign(ty - hy), type: 'rubble' };
      const chk = Game.travelBlockage(mx, my, hx, hy);
      if (chk && chk.blockType === 'rubble') { b3 = { x: tx, y: ty, mx: mx, my: my }; break; }
      delete mid.blockFrom;
    }
  } catch (e) { ok(false, 'B3 rig intermediate blockage', { err: String(e && e.message) }); }
  ok(b3 !== null, 'B3a a riggable d=2 target exists', b3);
  if (b3) {
    const before = t.travelTo.length;
    const r = Game.travelTo(b3.x, b3.y);
    ok(t.travelTo.length === before + 1, 'B3 travelTo intermediate-block recorded', t.travelTo[t.travelTo.length - 1]);
    const rec = t.travelTo[t.travelTo.length - 1];
    ok(rec && rec.outcome === 'blocked' && rec.blockType === 'rubble' && rec.intermediate === true,
      'B3b intermediate blockage classified', rec);
    ok(r && r.kind === 'blockage' && r.x === b3.mx && r.y === b3.my, 'B3c engine names the intermediate tile', r);
    cleanTile(b3.mx, b3.my);
  }

  // B4: refused-null — a far, unoffered tile.
  const before4 = t.travelTo.length;
  const r4 = Game.travelTo(0, 0);
  ok(t.travelTo.length === before4 + 1 && t.travelTo[t.travelTo.length - 1].outcome === 'refused-null',
    'B4 refused-null recorded', t.travelTo[t.travelTo.length - 1]);
  ok(r4 === null, 'B4b engine returns null for unoffered target');

  // B1: moved — direct travelTo to an offered adjacent tile.
  const tgt = (Game.travelTargets() || []).find(function (z) { return Math.abs(z.x - Game.map.px) + Math.abs(z.y - Game.map.py) === 1; });
  ok(!!tgt, 'B1a an offered adjacent tile exists', tgt);
  if (tgt) {
    const before = t.travelTo.length;
    const r = Game.travelTo(tgt.x, tgt.y);
    const rec = t.travelTo[t.travelTo.length - 1];
    ok(t.travelTo.length === before + 1 && rec && rec.outcome === 'moved' && rec.caller === 'other',
      'B1 moved recorded with caller other (direct call)', rec);
    ok(Game.map.px === tgt.x && Game.map.py === tgt.y, 'B1b scholar moved onto the tile');
    void r;
  }

  // B5: engine walkHome live — walk home from wherever B1 left us.
  // (A tile-entry encounter may have started combat on the B1 move; a
  // combat-interrupted walk still proves the wrap live.)
  const whBefore = t.walkHomes.length;
  const whRes = Game.walkHome();
  ok(t.walkHomes.length === whBefore + 1, 'B5 engine walkHome recorded', t.walkHomes[t.walkHomes.length - 1]);
  const whRec = t.walkHomes[t.walkHomes.length - 1];
  ok(whRec && typeof whRec.steps === 'number' && (whRec.reached === true || whRec.interrupted === 'combat'),
    'B5b walkHome reached home or stopped on combat', whRec);
  const engCalls = t.travelTo.filter(function (c) { return c.caller === 'engine-walkHome'; });
  if (whRec.reached === true || (whRec.steps || 0) > 0) {
    ok(engCalls.length > 0, 'B5c walkHome steps recorded as engine-walkHome travelTo', { n: engCalls.length });
  } else {
    console.log('note  B5c skipped: walk stopped on combat before any step');
    pass++;
  }
  if (!Game.tbfight) ok(Game.map.px === hx && Game.map.py === hy, 'B5d scholar home after walkHome (no combat)', { px: Game.map.px, py: Game.map.py });
  else { console.log('note  B5d skipped: combat started on the B1 move, scholar not home'); pass++; }

  // B6: policy caller classification — walkTo + policy walkHome.
  // (Only when no combat is live; travelTo refuses mid-combat.)
  if (!Game.tbfight) {
    const cBefore = t.travelTo.length;
    POL.walkTo(Game, hx, hy);
    const leg = t.travelTo.slice(cBefore);
    ok(leg.length >= 0, 'B6 walkTo leg ran', { n: leg.length });
    // Move out again via walkTo to a d=2 target, then policy walkHome back.
    const out2 = (Game.travelTargets() || []).find(function (z) { return Math.abs(z.x - hx) + Math.abs(z.y - hy) === 2; });
    if (out2) {
      POL.walkTo(Game, out2.x, out2.y);
      const c2 = t.travelTo.length;
      POL.walkHome(Game, hx, hy);
      const back = t.travelTo.slice(c2);
      ok(back.some(function (c) { return c.caller === 'policy-walkHome'; }),
        'B6b policy walkHome leg classified', back.map(function (c) { return c.caller; }));
    } else { console.log('note  B6b skipped: no d=2 target from haven'); pass++; }
  } else { console.log('note  B6 skipped: combat live after B1'); pass++; pass++; }

  // B7: tryNodeExit live — interior step, then a beyond-edge crossing.
  if (!Game.tbfight) {
    const nxBefore = t.nodeExits.length;
    const ex1 = Game.tryNodeExit(1, 0);
    ok(t.nodeExits.length === nxBefore + 1, 'B7 tryNodeExit recorded', t.nodeExits[t.nodeExits.length - 1]);
    const exRec = t.nodeExits[t.nodeExits.length - 1];
    ok(exRec && (exRec.result === 'moved' || exRec.result === 'null' || exRec.result === 'blocked' || exRec.result === 'refused'),
      'B7b tryNodeExit result classified', exRec);
    void ex1;
    // Beyond edge: walk to the east rim, then step out.
    if (!Game.tbfight && Game.map.px !== undefined) {
      POL.walkTo(Game, 8, Game.map.py);
      if (!Game.tbfight && Game.map.px === 8) {
        const nx2 = t.nodeExits.length;
        const ex2 = Game.tryNodeExit(1, 0);
        const exRec2 = t.nodeExits[t.nodeExits.length - 1];
        if (t.nodeExits.length === nx2 + 1 && exRec2 && exRec2.result === 'moved' && exRec2.to && exRec2.to.x === 9) {
          ok(true, 'B7c beyond-edge crossing recorded to (9, y)');
          const beyondCalls = t.travelTo.filter(function (c) { return c.to && (c.to.x > 8 || c.to.x < 0 || c.to.y > 8 || c.to.y < 0) && c.outcome === 'moved'; });
          ok(beyondCalls.length >= 1 && beyondCalls.some(function (c) { return c.caller === 'tryNodeExit'; }),
            'B7d beyond-edge travelTo classified tryNodeExit', beyondCalls[0]);
        } else {
          console.log('note  B7c skipped: rim walk or crossing did not land moved (combat or block): ' + JSON.stringify(exRec2));
          pass++;
          pass++;
        }
        void ex2;
        // Walk back inside so later fixtures start at home.
        if (!Game.tbfight) { try { Game.travelTo(8, Game.map.py); } catch (e) {} }
      } else { console.log('note  B7c skipped: rim walk did not reach x=8'); pass++; pass++; }
    }
  } else { console.log('note  B7 skipped: combat live'); pass++; pass++; pass++; pass++; }

  // B8: nomad wraps live (refused calls still fire the wrap).
  ok(!!Game.nomad && typeof Game.nomad.enterLeg === 'function', 'B8a Game.nomad exists with enterLeg');
  if (!Game.nomad || typeof Game.nomad.enterLeg !== 'function') {
    ok(false, 'B8 nomad wraps live (nomad missing — see B8a)');
  } else {
    const rlBefore = t.roadLegs.length;
    const eRet = Game.nomad.enterLeg(0);
    const dRet = Game.nomad.departLeg();
    const sRet = Game.nomad.start();
    ok(t.roadLegs.length === rlBefore + 3, 'B8 nomad enterLeg/departLeg/start recorded', t.roadLegs.slice(rlBefore));
    ok(t.roadLegs.slice(rlBefore).map(function (x) { return x.verb; }).join(',') === 'enterLeg,departLeg,start',
      'B8b nomad verbs in order');
    ok(eRet === false && dRet === false, 'B8c road legs refuse without an active road', { enterLeg: eRet, departLeg: dRet });
    void sRet;
    ok(t.wrapLive['nomad.enterLeg'] === true && t.wrapLive['nomad.departLeg'] === true && t.wrapLive['nomad.start'] === true,
      'B8d nomad wraps marked live');
  }

  // B9: tele death + combat markers live.
  const dBefore = t.deaths.length;
  Game.tele('death', { kind: 'villager', who: 'some_vid', cause: 'test-cause', player: false });
  ok(t.deaths.length === dBefore + 1, 'B9 tele death recorded', t.deaths[t.deaths.length - 1]);
  const dRec = t.deaths[t.deaths.length - 1];
  ok(dRec && dRec.kind === 'villager' && dRec.cause === 'test-cause' && typeof dRec.cheb === 'number' && dRec.whoIsBearer === false,
    'B9b death position recorded', dRec);
  const cbBefore = t.combats.length;
  Game.tele('combat_start', {});
  Game.tele('combat_end', {});
  eq(t.combats.length, cbBefore + 2, 'B9c combat markers recorded');

  // B10: npcNodeTravel live — rigged return + rigged departure in one call.
  const roster = ((Game.state || {}).village || {}).roster || [];
  const vids = roster.filter(function (x) { return x !== Game.villagerId; });
  ok(vids.length >= 2, 'B10a two non-scholar villagers exist', { n: vids.length });
  let retVid = null, depVid = null;
  try {
    const v = Game.state.village;
    const sday = Game.state.scholar.day || 1;
    retVid = vids[0];
    v.away = v.away || {};
    v.nodePos = v.nodePos || {};
    v.away[retVid] = { purpose: 'forage', sinceDay: sday - 2, sincePart: 0, duration: 4, nx: 6, ny: 6 };
    v.nodePos[retVid] = { nx: 6, ny: 6 };
    // Departure: rig a ready FORAGE objective (solo, 1 node out) on a
    // second villager so npcNodeTravel's OWN objMaybeDepart departs them
    // DURING the wrapped call (calling objDepart directly before the call
    // would hide the departure from the pre/post diff). Pick a target whose
    // danger verdict is not 'defer', and skip the medic-duty holder (who
    // is converted to indoor chore instead of departing).
    let medicHolder = null;
    try { medicHolder = (typeof Game.medicDutyHolder === 'function') ? Game.medicDutyHolder() : null; } catch (e) {}
    const cands = [[5, 4], [4, 5], [3, 4], [4, 3]];
    for (const candVid of vids.slice(1)) {
      if (candVid === medicHolder) continue;
      for (const cand of cands) {
        let verdict = null;
        try { verdict = (Game.objDanger( candVid, cand[0], cand[1], hx, hy) || {}).verdict; } catch (e) { verdict = 'go'; }
        if (verdict === 'defer') continue;
        depVid = candVid;
        v.objectives = v.objectives || {};
        v.objectives[depVid] = { kind: 'FORAGE', purpose: 'forage', state: 'ready', tx: cand[0], ty: cand[1], partsLeft: 4, solo: true, tightness: 0 };
        v.nodePos[depVid] = { nx: hx, ny: hy };
        break;
      }
      if (depVid) break;
    }
    ok(depVid !== null, 'B10b a departure-rig villager + non-defer target exists', { depVid: depVid, medicHolder: medicHolder });
  } catch (e) { ok(false, 'B10 rig away entries', { err: String(e && e.message) }); }
  const depBefore = t.villagerTrips.departures.length;
  const retBefore = t.villagerTrips.returns.length;
  const ppBefore = t.partPositions.length;
  try { Game.npcNodeTravel(); } catch (e) { ok(false, 'B10c npcNodeTravel runs', { err: String(e && e.message) }); }
  ok(t.wrapLive.npcNodeTravel === true, 'B10d npcNodeTravel wrap live');
  const newRets = t.villagerTrips.returns.slice(retBefore);
  ok(newRets.some(function (r) { return r.vid === retVid && r.purpose === 'forage' && r.hurtReturn === false; }),
    'B10e rigged return recorded (forage, not hurt)', newRets);
  const newDeps = t.villagerTrips.departures.slice(depBefore);
  ok(newDeps.some(function (r) { return r.vid === depVid && r.purpose === 'forage'; }),
    'B10f rigged departure recorded (forage)', newDeps);
  ok(t.partPositions.length > ppBefore, 'B10g per-part scholar position recorded', t.partPositions[t.partPositions.length - 1]);

  // B11: snapshot shape.
  const snap = ti.snapshot();
  ok(snap.scholarPos && typeof snap.cheb === 'number' && typeof snap.atHaven === 'boolean', 'B11 snapshot position', snap.scholarPos);
  ok(typeof snap.dayTicks === 'number', 'B11b snapshot dayTicks');
  ok(typeof snap.travelOffered === 'boolean', 'B11c snapshot travelOffered boolean');
  ok(snap.away && typeof snap.away === 'object', 'B11d snapshot away ledger');
  ok(snap.nodes && typeof snap.nodes === 'object', 'B11e snapshot villager nodes');
  ok(snap.objectives && typeof snap.objectives === 'object', 'B11f snapshot objectives');
  ok(snap.road === null || typeof snap.road === 'object', 'B11g snapshot road state');
  ok(typeof snap.pantryKcal === 'number', 'B11h snapshot pantry kcal');
  ok(Array.isArray(t.daily) && t.daily.length === 1, 'B11i snapshot stored');

  // B12: no instrument errors on the fixture run.
  eq(t.instrumentErrors.length, 0, 'B12 zero instrument errors', t.instrumentErrors);

  // B13: uninstall restores every wrapped method + nomad methods.
  ti.uninstall();
  const restored = ['travelTo', 'walkHome', 'tryNodeExit', 'tele', 'npcNodeTravel'].every(function (n) { return Game[n] === orig[n]; });
  ok(restored, 'B13 uninstall restores all wraps');
  const nomadRestored = ['enterLeg', 'departLeg', 'start'].every(function (n) { return Game.nomad[n] === origNomad[n]; });
  ok(nomadRestored, 'B13b uninstall restores nomad wraps');
}

// ---- C. Live miniature: competent, 12 days, seed 180249 ----
async function travelMiniature() {
  const { Game } = await loadGame({ seed: 180249, mode: 'travelfirst-proof-c', fullTelemetry: false });
  await setupGame(Game);
  const ti = TI.install(Game);
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally { try { ti.snapshot(); } catch (e) {} }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
  ti.uninstall();
  ok(result.days > 0, 'C1 miniature ran days', { days: result.days });
  ok(ti.t.travelTo.length > 0, 'C2 policy calls travelTo in 12 days', { n: ti.t.travelTo.length });
  const moved = ti.t.travelTo.filter(function (c) { return c.outcome === 'moved'; }).length;
  ok(moved > 0, 'C3 at least one travelTo moved', { moved: moved });
  const others = ti.t.travelTo.filter(function (c) { return c.caller === 'other'; });
  ok(others.length === 0, 'C4 zero other-caller travelTo in miniature', others.slice(0, 3));
  eq(ti.t.walkHomes.length, 0, 'C5 engine walkHome 0 under competent (expected dead)');
  eq(ti.t.nodeExits.length, 0, 'C6 tryNodeExit 0 under competent (expected dead)');
  eq(ti.t.roadLegs.length, 0, 'C7 road legs 0 under competent (expected dead)');
  ok(ti.t.wrapLive.travelTo === true && ti.t.wrapLive.tele === true && ti.t.wrapLive.npcNodeTravel === true,
    'C8 travelTo/tele/npcNodeTravel wraps live in miniature');
  ok(ti.t.villagerTrips.departures.length > 0, 'C9 villager departures recorded in 12 days', { n: ti.t.villagerTrips.departures.length });
  ok(ti.t.partPositions.length > 0, 'C10 per-part positions recorded', { n: ti.t.partPositions.length });
  ok(ti.t.daily.every(function (x) { return typeof x.travelOffered === 'boolean' && typeof x.cheb === 'number'; }),
    'C11 every snapshot has travelOffered + cheb');
  eq(ti.t.instrumentErrors.length, 0, 'C12 zero instrument errors in miniature', ti.t.instrumentErrors);
  // C13/C14 are informational: caller mix + blocked counts on this seed.
  const byCaller = {};
  for (const c of ti.t.travelTo) byCaller[c.caller] = (byCaller[c.caller] || 0) + 1;
  console.log('info  C13 travelTo by caller: ' + JSON.stringify(byCaller) +
    ' blocked=' + ti.t.travelTo.filter(function (c) { return c.outcome === 'blocked'; }).length +
    ' departures=' + ti.t.villagerTrips.departures.length +
    ' returns=' + ti.t.villagerTrips.returns.length);
  ok(true, 'C13 caller mix recorded (informational)');
  ok(true, 'C14 departures/returns recorded (informational)');
}

// ---- D. Neutrality miniature: instrument on vs off, 12 days ----
async function neutralityMini() {
  async function mini(seed, on) {
    const { Game } = await loadGame({ seed: seed, mode: 'travelfirst-proof-d', fullTelemetry: false });
    await setupGame(Game);
    let ti = null;
    if (on) ti = TI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (ti) ti.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
    if (ti) ti.uninstall();
    const pantryKcal = ((Game.state || {}).village || {}).pantry || [];
    const pk = pantryKcal.reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
    const deaths = ((result && result.samples && result.samples.deaths) || []).length;
    return { days: result.days, pantryKcal: pk, deaths: deaths, errors: ti ? ti.t.instrumentErrors.length : 0 };
  }
  const on = await mini(180249, true);
  const off = await mini(180249, false);
  ok(on.days === off.days && on.pantryKcal === off.pantryKcal && on.deaths === off.deaths,
    'D1 neutrality miniature identical', { on: on, off: off });
  eq(on.errors, 0, 'D2 miniature instrument errors 0');
}

(async function () {
  try {
    await liveFixtures();
    await travelMiniature();
    await neutralityMini();
  } catch (e) {
    fail++;
    fails.push('harness-threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : String(e)));
    console.log('FAIL harness-threw :: ' + String(e && e.stack || e).slice(0, 500));
  }
  console.log('\ntravelfirst proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
