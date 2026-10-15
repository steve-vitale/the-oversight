#!/usr/bin/env node
// test-capable-death-fixes-20261015.js — three capable-bot bugs behind the
// bearer death rate (evidence/2026-10-15/diagnosis-deaths.md). Each section
// shows the old behaviour with the A/B gate off (RED) and the fix (GREEN).
//   1. HAVEN ESCAPE: outmatched in a fight AT Haven (raider, feast draw),
//      the bot used to hold its ground to the death. Now it runs out
//      through the barrier (CAPABLE_HAVEN_FLEE=0 = old hold).
//   2. FEAST DRAW IS A CHOICE: the harness faced every pending encounter;
//      the bot never answered "Let the watch drive it off". The harness now
//      asks policy.pending first; capable drives off a draw it can't fight
//      and faces one it can (CAPABLE_DRAW_DECIDE=0 = always face).
//   3. LETHAL CONTEST CHOICES: at 8 HP the bot took the Blood Tithe's "One
//      more measure" (16-28 x1.5) and the Maw's "Turn and face it". Now a
//      choice that kills is never picked over one that doesn't
//      (CAPABLE_CONTEST_LETHAL=0 = old scoring).
// Follow-ups from the same diagnosis (each gate defaults ON):
//   4. BEAM STRANGER: a known beam-carrying alien, without 2+ beam-resistant
//      pieces, is a reason to leave (CAPABLE_BEAM_FLEE=0 = old).
//   5. HIGHBEAM DEER: a deer with more HP left than the bearer is a reason to
//      leave, and the deed hunt never picks one (CAPABLE_DEER_FLEE=0 = old).
//   6. LOCKJAW: examined, then antibiotics / triage / field medicine
//      (CAPABLE_TREAT_LOCKJAW=0 = never treated).
//   7. RAID CRISIS: call for help once per raid crisis, never the signal
//      fire (CAPABLE_AID_CALL=0 = never calls).
'use strict';
const K = require('./godpath/lib');
const H = K.H;
const { capable, capableSummary, threatFlee, treatLockjaw, raidCall } = require('./policies/capable');

const T = K.reporter('test-capable-death-fixes-20261015');

function withGate(name, val, fn) {
  const prev = process.env[name];
  if (val === undefined) delete process.env[name]; else process.env[name] = val;
  try { return fn(); } finally { if (prev === undefined) delete process.env[name]; else process.env[name] = prev; }
}

function havenFight(Game, outside) {
  K.newRun(Game);
  Game.map.px = 4; Game.map.py = 4; // the Haven node
  if (outside) {
    Game.state.scholar.insideHaven = false;
    const t = Game.tileAt(4, 4); if (t) t.detail = null; // the grounds, not the hall
  } else {
    Game.state.scholar.insideHaven = true;
    const t = Game.tileAt(4, 4); if (t) t.detail = null;
  }
  K.fight(Game, 'editor', { px: 4, py: 4, mx: 4, my: 1, hp: 100 }); // wave 5, 1,500-1,900 HP
  const ctx = { notes: [] };
  let guard = 0;
  while (Game.tbfight && !Game.tbfight.over && guard++ < 12) {
    if (!Game.tbIsPlayerTurn()) break;
    if (!capable.fight(Game, ctx)) break;
    if ((ctx.capFleePushes || 0) > 0) break;
  }
  const alive = !Game.tbfight || Game.tbfight.over ? (Game.tbfight ? Game.tbfight.result : 'ended') : 'live';
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
  return Object.assign(capableSummary(ctx), { end: alive, errors: ctx.capErrors || [] });
}

function armDraw(Game, mid) {
  K.newRun(Game);
  Game.map.px = 4; Game.map.py = 4;
  const s = Game.state.scholar;
  s.feastBuff = { untilDay: (s.day || 1) + 2, mult: 1.5 };
  s.feastDraw = { monsterId: mid, veteran: false, day: s.day || 1 };
  Game.pendingEncounter = true;
  Game.pendingMonsterId = mid;
}

function tithe(Game, hp) {
  K.newRun(Game);
  const s = Game.state.scholar;
  s.health = hp;
  const phases = Game._contestTithe(Game.contestPool().find(c => c.id === 'tithe'));
  Game.state.activeContest = { contestId: 'tithe', participant: 'player', phase: 'live', phaseIdx: 2, phases };
  let picked = null;
  const real = Game.contestChoose;
  Game.contestChoose = function (i) { picked = i; Game.state.activeContest = null; return { done: true }; };
  const ctx = { notes: [] };
  try { capable.contest(Game, ctx); } finally { Game.contestChoose = real; }
  return { label: phases[2].choices[picked] ? phases[2].choices[picked].label : '?', ctx };
}

// one capable turn in a fresh wild fight; returns the flee read
function wildTurn(Game, mid, tweak) {
  K.newRun(Game);
  // This fixture is the unprotected bearer, not whichever advanced armor
  // happened to be offered in the generated starting wardrobe.
  Game.state.scholar.equipped = {};
  Game.state.scholar.abilities = [];
  Game.state.scholar.backgroundAbilities = [];
  Game.state.codex.skills = {};
  Game.debugToWildNode();
  const mf = K.fight(Game, mid, { px: 2, py: 4, mx: 6, my: 4, hp: 100 });
  if (tweak) tweak(mf);
  const ctx = { notes: [] };
  if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) capable.fight(Game, ctx);
  const why = Object.keys(ctx.capFleeWhy || {});
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
  return Object.assign(capableSummary(ctx), { why, errors: ctx.capErrors || [], notes: ctx.notes });
}

(async () => {
  global.__policyRandom = H.mulberry32(20261015);
  const Game = await K.load({ seed: 7 });

  T.section('1. outmatched at Haven: run, do not hold');
  {
    const old = withGate('CAPABLE_HAVEN_FLEE', '0', () => havenFight(Game, false));
    T.ok('gate off (old): holds in the hall, never moves to leave', old.capFleeHeld >= 1 && old.capFleeSteps === 0 && old.capFleeDoorExits === 0, JSON.stringify(old));
    const hall = withGate('CAPABLE_HAVEN_FLEE', undefined, () => havenFight(Game, false));
    T.ok('fix (in the hall): flee decided at Haven', hall.capFleeFromHaven >= 1, JSON.stringify(hall));
    T.ok('fix (in the hall): out through the door, fight over', hall.capFleeDoorExits >= 1 && hall.end !== 'live' && hall.end !== 'lost', JSON.stringify(hall));
    const yard = withGate('CAPABLE_HAVEN_FLEE', undefined, () => havenFight(Game, true));
    T.ok('fix (on the grounds): flee decided at Haven', yard.capFleeFromHaven >= 1, JSON.stringify(yard));
    T.ok('fix (on the grounds): walks to an edge or pushes through', yard.capFleeSteps >= 1 || yard.capFleePushes >= 1, JSON.stringify(yard));
    T.ok('no policy errors', !hall.errors.length && !yard.errors.length, JSON.stringify([hall.errors, yard.errors]));
  }

  T.section('2. the feast draw is a choice');
  {
    // count fights the harness starts (the fight itself is not the point)
    const realStart = Game.startCombat;
    let starts = 0;
    Game.startCombat = function () { starts++; return realStart.apply(this, arguments); };
    const pol = Object.assign({}, capable, { fight: () => false });
    const run = (mid, policy) => {
      armDraw(Game, mid);
      starts = 0;
      const ctx = { notes: [] };
      H.driveContests(Game, policy, ctx);
      try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
      return { starts, pending: !!Game.pendingEncounter, ctx };
    };
    try {
      const old = withGate('CAPABLE_DRAW_DECIDE', '0', () => run('editor', pol));
      T.ok('gate off (old): a wave-5 draw is faced', old.starts === 1, JSON.stringify(old));
      const now = run('editor', pol);
      T.ok('fix: a wave-5 draw is driven off (no fight)', now.starts === 0 && !now.pending && now.ctx.capDrawDrivenOff === 1, JSON.stringify({ starts: now.starts, pending: now.pending, off: now.ctx.capDrawDrivenOff }));
      const fair = run('hushwolf', pol);
      T.ok('fix: a fair draw is still faced', fair.starts === 1 && fair.ctx.capDrawFaced === 1, JSON.stringify({ starts: fair.starts, faced: fair.ctx.capDrawFaced }));
      const nohook = run('editor', { id: 'nohook' });
      T.ok('harness: a policy without pending() still faces it', nohook.starts === 1, JSON.stringify({ starts: nohook.starts }));
    } finally { Game.startCombat = realStart; }
  }

  T.section('3. never pick a contest choice that kills');
  {
    const old = withGate('CAPABLE_CONTEST_LETHAL', '0', () => tithe(Game, 8));
    T.ok('gate off (old): at 8 HP the tithe takes "One more measure"', old.label === 'One more measure', old.label);
    const now = tithe(Game, 8);
    T.ok('fix: at 8 HP the tithe does not bleed again', now.label !== 'One more measure', now.label);
    T.ok('fix: counted', (now.ctx.capContestLethalAvoided || 0) === 1, JSON.stringify(capableSummary(now.ctx)));
    const full = tithe(Game, 100);
    T.ok('at full HP the measure is still allowed (not lethal)', full.label === 'One more measure', full.label);
    // the Maw: "Turn and face it" (mawDist -99) is death by the rules
    K.newRun(Game);
    const ac = { contestId: 'maw', participant: 'player', mawDist: 2 };
    Game.state.activeContest = Object.assign(ac, { phase: 'live', phaseIdx: 0, phases: [{ choices: [
      { label: 'Turn and face it', do: { mawDist: -99 }, next: 'MAW_JUDGE' },
      { label: 'Walk out calmly', do: { prize: true, dmg: [6, 14], mawDist: 0 }, next: 'MAW_JUDGE' },
    ] }] });
    let picked = null;
    const real = Game.contestChoose;
    Game.contestChoose = function (i) { picked = i; Game.state.activeContest = null; return { done: true }; };
    try { capable.contest(Game, { notes: [] }); } finally { Game.contestChoose = real; }
    T.ok('the Maw: never "Turn and face it"', picked === 1, 'picked ' + picked);
  }

  T.section('4. a known beam Stranger is a reason to leave');
  {
    K.newRun(Game);
    const pid = (Game.apPersonas() || []).map(x => x.id).find(id => Game.apHasBeam(id));
    T.ok('a beam-carrying persona exists', !!pid, String(pid));
    const mons = [{ kind: 'hostile', alienPid: pid, hp: 95, maxHp: 95 }];
    const p = { hp: 100, maxHp: 100 };
    const s = Game.state.scholar;
    s._beamHorrorSeen = false;
    const unknown = Game.apKnowsAlien(pid) ? 'known-at-start' : threatFlee(Game, { notes: [] }, p, mons);
    T.ok('unknown Stranger, beam never felt: no flee (if you don\'t know, it doesn\'t show)', unknown === null, String(unknown));
    s._beamHorrorSeen = true;
    T.ok('beam felt, no resistant gear: flee', threatFlee(Game, { notes: [] }, p, mons) === 'beam-stranger');
    T.ok('gate off: no flee', withGate('CAPABLE_BEAM_FLEE', '0', () => threatFlee(Game, { notes: [] }, p, mons)) === null);
    const realPieces = Game.apBeamResistPieces;
    Game.apBeamResistPieces = () => ['a', 'b'];
    try { T.ok('two resistant pieces: stands', threatFlee(Game, { notes: [] }, p, mons) === null); } finally { Game.apBeamResistPieces = realPieces; }
    // live: a wave-1 fight the bot would hold, with the beam carrier in it
    const tag = (mf) => { mf.alienPid = pid; Game.state.scholar._beamHorrorSeen = true; };
    const old = withGate('CAPABLE_BEAM_FLEE', '0', () => wildTurn(Game, 'hushwolf', tag));
    T.ok('live, gate off (old): stays in the fight', old.capFleeDecisions === 0, JSON.stringify(old.why));
    const now = wildTurn(Game, 'hushwolf', tag);
    T.ok('live, fix: flee decided for the beam', now.capFleeDecisions >= 1 && now.capBeamFlee >= 1 && now.why.indexOf('beam-stranger') >= 0, JSON.stringify({ d: now.capFleeDecisions, why: now.why, notes: now.notes }));
  }

  T.section('5. the Highbeam Deer is a reason to leave');
  {
    const old = withGate('CAPABLE_DEER_FLEE', '0', () => wildTurn(Game, 'gallowdeer'));
    T.ok('gate off (old): a full-HP bearer stays against the deer', old.capFleeDecisions === 0, JSON.stringify(old.why));
    const now = wildTurn(Game, 'gallowdeer');
    T.ok('fix: flee decided (highbeam)', now.capFleeDecisions >= 1 && now.why.indexOf('highbeam') >= 0, JSON.stringify({ d: now.capFleeDecisions, why: now.why, notes: now.notes }));
    const hurt = wildTurn(Game, 'gallowdeer', (mf) => { mf.hp = 40; });
    T.ok('a deer beaten under our HP: finish it', hurt.capDeerFlee === 0, JSON.stringify(hurt.why));
  }

  T.section('6. lockjaw is treated');
  {
    const sick = (setup) => {
      K.newRun(Game);
      Game.contractDisease('lockjaw', { source: 'a test cut' });
      if (setup) setup(Game.state.scholar);
      const ctx = { notes: [] };
      treatLockjaw(Game, ctx);
      return { has: Game.hasStatus('scholar', 'lockjaw'), ctx };
    };
    const pills = (s) => { s.inventory = s.inventory || []; s.inventory.push({ itemId: 'med_antibiotics', name: 'Antibiotics (amoxicillin)', medType: 'antibiotics', doses: 3, units: 1 }); };
    const t0 = sick(null);
    T.ok('lockjaw contracted', t0.ctx.capLockjawSeen === 1);
    const old = withGate('CAPABLE_TREAT_LOCKJAW', '0', () => sick(pills));
    T.ok('gate off (old): pills in the bag, never taken', old.has && !old.ctx.capLockjawPills, JSON.stringify(capableSummary(old.ctx)));
    const now = sick(pills);
    T.ok('fix: antibiotics taken, lockjaw cured', !now.has && now.ctx.capLockjawPills === 1 && now.ctx.capLockjawCured === 1, JSON.stringify(capableSummary(now.ctx)));
    const tri = sick(() => K.giveAbility(Game, 'triage', { force: true }));
    const diag = Game.isDiagnosed('scholar', 'lockjaw');
    T.ok('fix: with triage, examined and treated', tri.ctx.capLockjawExamined === 1 && tri.ctx.capLockjawTreated >= 1, JSON.stringify(capableSummary(tri.ctx)));
    T.ok('triage cures it once named (else eases)', diag ? !tri.has : true, 'diagnosed ' + diag + ', still sick ' + tri.has);
    T.ok('no errors', ![t0, old, now, tri].some(r => r.ctx.notes.length), JSON.stringify(now.ctx.notes.concat(tri.ctx.notes)));
  }

  T.section('7. a raid crisis gets a call for help');
  {
    const raid = (raiders) => {
      K.newRun(Game);
      const ovs = Game.state.otherVillages || [];
      ovs.forEach(v => { v.generated = true; v.rumored = true; v.crisis = null; });
      if (ovs[0]) { Game._formLink(ovs[0].id, {}, null); const l = Game.linkWith(ovs[0].id); if (l) l.trust = 70; }
      const c = Game.raiseAidCrisis('Hushwolf', 1);
      if (raiders) c.raiders = true;
      const ctx = { notes: [] };
      raidCall(Game, ctx);
      raidCall(Game, ctx); // once per crisis
      const cr = Game.aidCrisis() || {};
      return { calls: (cr.calls || []).slice(), ctx };
    };
    const old = withGate('CAPABLE_AID_CALL', '0', () => raid(true));
    T.ok('gate off (old): never calls', old.calls.length === 0);
    const now = raid(true);
    T.ok('fix: one call for the raid', now.calls.length === 1 && now.ctx.capAidCalls === 1, JSON.stringify(now.calls));
    T.ok('never the signal fire', now.calls.every(c => c.tier !== 'signal'), JSON.stringify(now.calls));
    const notRaid = raid(false);
    T.ok('not a raid crisis: no call', notRaid.calls.length === 0);
    T.ok('no errors', !now.ctx.notes.length, JSON.stringify(now.ctx.notes));
  }

  T.done();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
