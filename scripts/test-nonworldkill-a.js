#!/usr/bin/env node
// scripts/test-nonworldkill-a.js — unit proof for the sim-nonworldkill-a
// recorder (scripts/policies/nonworldkill-diag.js). Pure synthetic
// rows only: no game load, no RNG, re-runnable after any rebase.
// Proves: classification precedence (table-trial > refused > thrown >
// contest-arena > feast-draw > tent-intruder > door-flee-reengage >
// glasswing-trap > world-bump > wanderer-pending > policy-direct >
// other), the tbEnd log-delta join by fight id, direct-build ends,
// and the multiset log diff. A failure here blocks the sweep — the
// analyzer must never silently bucket a fight.
'use strict';
const { classifyStart, analyzeNonworldkill, logDiff, installNonworldkillDiag, newStore } = require('./policies/nonworldkill-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function S(o) { return Object.assign({ day: 100, arg: 'strike', mid: 'strike', wave: 4, origin: 'null-origin', stack: '', stackLines: [], feastDraw: null, tentBreach: false, pendingInTent: false, arenaContest: null, activeContestArena: false, tableTrial: false, refused: false, threw: null, fightId: 'f1' }, o); }

check('contest-arena beats feast-draw', (() => {
  const c = classifyStart(S({ arenaContest: { contestId: 'blood', waves: ['strike'], waveIdx: 0 }, feastDraw: { monsterId: 'strike', veteran: false, day: 100 }, stack: 'startCombat,_contestArena' }));
  return c.door === 'contest-arena' && !c.excluded;
})());
check('feast-draw via faceFeastDraw', (() => {
  const c = classifyStart(S({ feastDraw: { monsterId: 'strike', veteran: false, day: 100 }, stack: 'startCombat,faceFeastDraw,feastFightRoad' }));
  return c.door === 'feast-draw' && c.initiator === 'faceFeastDraw';
})());
check('feast-draw via harness fallback beats wanderer-pending', (() => {
  const c = classifyStart(S({ feastDraw: { monsterId: 'strike', veteran: false, day: 100 }, stack: 'startCombat,driveContestsImpl,driveContests' }));
  return c.door === 'feast-draw' && c.initiator === 'harness-fallback';
})());
check('feast-draw mismatch is not feast-draw', (() => {
  const c = classifyStart(S({ feastDraw: { monsterId: 'eulogy', veteran: false, day: 100 }, stack: 'startCombat,driveContestsImpl' }));
  return c.door === 'wanderer-pending';
})());
check('tent-intruder via breach spawn', (() => {
  const c = classifyStart(S({ tentBreach: true, stack: 'startCombat,faceTentIntruder' }));
  return c.door === 'tent-intruder' && c.initiator === 'faceTentIntruder';
})());
check('tent-intruder via pendingInTent + harness', (() => {
  const c = classifyStart(S({ pendingInTent: true, stack: 'startCombat,driveContestsImpl' }));
  return c.door === 'tent-intruder' && c.initiator === 'harness-fallback';
})());
check('reengage treeline-ambush', (() => {
  const c = classifyStart(S({ stack: 'startCombat,reengageWaitingMonsters,treelineAmbush' }));
  return c.door === 'door-flee-reengage' && c.sub === 'treeline-ambush';
})());
check('reengage hall-door', (() => {
  const c = classifyStart(S({ stack: 'startCombat,reengageWaitingMonsters,exitBuilding' }));
  return c.door === 'door-flee-reengage' && c.sub === 'hall-door-reengage';
})());
check('glasswing-trap', (() => {
  const c = classifyStart(S({ mid: 'glasswing', wave: 1, stack: 'startCombat,gwTrapTick,monsterTurn' }));
  return c.door === 'glasswing-trap';
})());
check('world-bump', (() => {
  const c = classifyStart(S({ mid: 'hushwolf', wave: 1, origin: 'world-origin', stack: 'startCombat,monsterTurn' }));
  return c.door === 'world-bump';
})());
check('world-bump with origin mismatch keeps door', (() => {
  const c = classifyStart(S({ mid: 'strike', origin: 'world-origin-mismatch', stack: 'startCombat,monsterTurn' }));
  return c.door === 'world-bump';
})());
check('wanderer-pending', (() => {
  const c = classifyStart(S({ stack: 'startCombat,driveContestsImpl,driveContests' }));
  return c.door === 'wanderer-pending';
})());
check('policy-direct via stack file', (() => {
  const c = classifyStart(S({ stack: 'startCombat,feastFightRoad', stackLines: ['at Game.startCombat (scripts/policies/competent.js:511:1)'] }));
  return c.door === 'policy-direct';
})());
check('other when nothing fires', (() => {
  const c = classifyStart(S({ stack: 'startCombat,someUnknownPath' }));
  return c.door === 'other' && !c.excluded;
})());
check('table-trial excluded', (() => {
  const c = classifyStart(S({ tableTrial: true, mid: null, wave: null, arg: 'finale' }));
  return c.door === 'table-trial' && c.excluded;
})());
check('refused excluded', (() => {
  const c = classifyStart(S({ refused: true }));
  return c.door === 'refused' && c.excluded;
})());
check('thrown excluded', (() => {
  const c = classifyStart(S({ threw: 'startCombat: unknown monster id "nope"' }));
  return c.door === 'thrown' && c.excluded;
})());
check('table-trial beats refused in precedence', (() => {
  const c = classifyStart(S({ tableTrial: true, refused: true }));
  return c.door === 'table-trial';
})());
check('refused beats contest-arena in precedence', (() => {
  const c = classifyStart(S({ refused: true, arenaContest: { contestId: 'x', waves: [], waveIdx: 0 } }));
  return c.door === 'refused';
})());

check('logDiff multiset: one extra copy only', (() => {
  const a = [{ d: 1, mid: 'x', w: 1, by: 'p', via: 'player', trick: null }];
  const b = a.concat([{ d: 1, mid: 'x', w: 1, by: 'p', via: 'player', trick: null }, { d: 2, mid: 'y', w: 4, by: 'p', via: 'player', trick: null }]);
  const d = logDiff(a, b);
  return d.length === 2 && d.some(e => e.mid === 'y');
})());
check('logDiff empty when nothing added', (() => logDiff([{ d: 1, mid: 'x', w: 1, by: 'p', via: 'player', trick: null }], [{ d: 1, mid: 'x', w: 1, by: 'p', via: 'player', trick: null }]).length === 0)());

check('analyze joins ends to starts and attributes wave-4 kill by door', (() => {
  const store = {
    starts: [
      S({ day: 115, fightId: 'f-strike', stack: 'startCombat,faceFeastDraw,feastFightRoad', feastDraw: { monsterId: 'strike', veteran: false, day: 115 } }),
      S({ day: 113, fightId: 'f-gallow', mid: 'gallowdeer', wave: 1, origin: 'world-origin', stack: 'startCombat,monsterTurn' }),
      S({ day: 114, fightId: null, refused: true }),
    ],
    ends: [
      { day: 115, fightId: 'f-strike', result: 'won', logLenBefore: 5, logLenAfter: 6, newLog: [{ d: 115, mid: 'strike', w: 4, by: 'elif_demir', via: 'player', trick: null }] },
      { day: 113, fightId: 'f-gallow', result: 'won', logLenBefore: 4, logLenAfter: 5, newLog: [{ d: 113, mid: 'gallowdeer', w: 1, by: 'elif_demir', via: 'player', trick: null }] },
      { day: 112, fightId: 'f-alien', result: 'lost', logLenBefore: 4, logLenAfter: 4, newLog: [] },
    ],
    errs: 0, errors: [], overflow: { starts: 0, ends: 0 }, installed: true,
  };
  const a = analyzeNonworldkill(store);
  return a.initiations === 2 && a.byDoor['feast-draw'] === 1 && a.byDoor['world-bump'] === 1
    && a.wave4Kills.length === 1 && a.wave4Kills[0].door === 'feast-draw'
    && a.killsByDoor['feast-draw'] === 1 && a.directBuildEnds === 1
    && a.excluded.total === 1 && a.unclassifiedInitiations === 0;
})());
check('analyze counts other rows as unclassified', (() => {
  const store = { starts: [S({ stack: 'startCombat,mystery' })], ends: [], errs: 0, errors: [], overflow: { starts: 0, ends: 0 }, installed: true };
  const a = analyzeNonworldkill(store);
  return a.unclassifiedInitiations === 1 && a.byDoor.other === 1;
})());

// Fake-Game integration: a fight that starts AND routes inside one
// startCombat call (tbEnd nulls tbfight at its tail, game.js) must
// still join its end row — the start row adopts the single new end
// row's fightId — instead of reading as a direct-build end.
function fakeGame(routeAtStart) {
  const G = {
    state: { scholar: { day: 23 }, waveKillLog: [] },
    map: { px: 4, py: 4 },
    tbfight: null,
    worldMonsters() { return []; },
    data: { monsters: [{ id: 'cliffhanger', wave: 1 }] },
    startCombat(mid) {
      this.tbfight = { id: 'fx-routed', fighters: [
        { key: 'p', kind: 'player', hp: 100, maxHp: 100 },
        { key: 'm_0', kind: 'monster', monsterId: mid, hp: 50, maxHp: 50 },
      ] };
      if (routeAtStart) this.tbEnd('routed');
      return this.tbfight;
    },
    tbEnd(result) {
      const f = this.tbfight;
      if (!f || f.over) return;
      f.over = true; f.result = result;
      this.tbfight = null;
    },
  };
  return G;
}
check('same-call routed fight adopts end-row fightId and joins', (() => {
  const G = fakeGame(true);
  const st = newStore();
  installNonworldkillDiag(G, st);
  G.startCombat('cliffhanger');
  if (st.starts.length !== 1 || st.ends.length !== 1) return false;
  if (st.starts[0].fightId !== 'fx-routed' || st.starts[0].fightIdSource !== 'end-row') return false;
  if (st.ends[0].fightId !== 'fx-routed' || st.ends[0].result !== 'routed') return false;
  const an = analyzeNonworldkill(st);
  return an.directBuildEnds === 0 && an.initiations === 1;
})());
check('normal fight keeps tbfight fightId', (() => {
  const G = fakeGame(false);
  const st = newStore();
  installNonworldkillDiag(G, st);
  G.startCombat('cliffhanger');
  G.tbEnd('won');
  if (st.starts.length !== 1 || st.ends.length !== 1) return false;
  if (st.starts[0].fightId !== 'fx-routed' || st.starts[0].fightIdSource !== 'tbfight') return false;
  const an = analyzeNonworldkill(st);
  return an.directBuildEnds === 0 && an.initiations === 1;
})());
check('refused call adopts nothing', (() => {
  const G = fakeGame(false);
  const st = newStore();
  installNonworldkillDiag(G, st);
  G.tbfight = { id: 'live-fight', over: false, fighters: [] };
  G.startCombat('cliffhanger');
  return st.starts.length === 1 && st.starts[0].refused === true && st.starts[0].fightId === null && st.ends.length === 0;
})());

// Corpus proof (run fleshout-20261027T0525Z): when EVID points at a
// committed corpus dir with s<seed>-armed.json rows, run the analyzer
// over the real corpus and assert the verdict fields — kill count
// partition, channel-assignment completeness, and the non-world
// channel count/yield. Structural assertions only: no count from a
// prior run is baked in, so a moved base fails loudly instead of
// passing on stale expectations. When EVID has no rows, this block
// is skipped (unit tests above still run).
(function corpusProof() {
  const fs = require('fs');
  const path = require('path');
  const evid = process.env.EVID || '';
  if (!evid) return;
  const seeds = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
  const rows = [];
  for (const s of seeds) {
    const p = path.join(evid, `s${s}-armed.json`);
    if (!fs.existsSync(p)) return; // corpus not present: unit-only run
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  let bandOther = 0, bandW4 = 0, bandNullW4 = 0, bandStarts = 0;
  let allW4Joined = true, allW4Doored = true, allW4Partitioned = true;
  const KNOWN = ['contest-arena', 'feast-draw', 'tent-intruder', 'door-flee-reengage', 'glasswing-trap', 'world-bump', 'wanderer-pending', 'policy-direct'];
  for (const r of rows) {
    check(`corpus seed ${r.seed} recorder errs 0`, r.nonworldkill.diag.errs === 0);
    check(`corpus seed ${r.seed} recorder overflow 0`, Object.values(r.nonworldkill.diag.overflow || {}).every(v => (v | 0) === 0));
    const an = analyzeNonworldkill(r.nonworldkill);
    bandOther += an.unclassifiedInitiations;
    bandStarts += an.initiations;
    for (const k of an.wave4Kills) {
      bandW4++;
      if (!k.startDay && k.startDay !== 0) allW4Joined = false;
      if (!k.startArg) allW4Joined = false;
      if (KNOWN.indexOf(k.door) < 0) allW4Doored = false;
      if (k.origin === 'null-origin') bandNullW4++;
      else if (k.origin !== 'world-origin' && k.origin !== 'world-origin-mismatch' && k.origin !== 'world-origin-unresolved') allW4Partitioned = false;
    }
  }
  check('corpus band unclassified initiations 0', bandOther === 0, { bandOther });
  check('corpus every wave-4 TB kill joins a start row', allW4Joined, { bandW4 });
  check('corpus every wave-4 TB kill has a known (non-other) door', allW4Doored, { bandW4 });
  check('corpus wave-4 kills partition by origin (null vs world-side)', allW4Partitioned, { bandW4, bandNullW4 });
  console.log(`corpus proof: seeds=${rows.length} initiations=${bandStarts} wave4TBKills=${bandW4} nullOriginWave4Kills=${bandNullW4} unclassified=${bandOther}`);
})();

console.log(`test-nonworldkill-a: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
