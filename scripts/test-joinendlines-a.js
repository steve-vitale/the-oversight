#!/usr/bin/env node
// scripts/test-joinendlines-a.js — sim-joinendlines-a fixtures + judge.
// NARRATION ONLY arm: two rec.log.push calls in src/js/fieldFights.js
// (JOINENDLINES), each gated on a shout having fired this fight.
//
// Modes:
//   (no args)            : pure classifier fixtures + engine fixtures.
//   --judge BEFORE AFTER : fixtures, then judge the AFTER corpus
//                          against the prereg (evidence/2026-10-29/
//                          sim-joinendlines-a-prereg.md) with BEFORE
//                          as the neutrality leg.
//   --neutrality A B     : compare per-seed rows in dirs A and B after
//                          stripping every log array; exit 0 iff every
//                          row is byte-identical (narration-only change
//                          moves no number).
// Exit 0 only on full PASS (fixtures green + verdict GO, or neutrality
// identical). Any other exit prints the judged verdict in full.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

// ---- line matchers (exact prereg wording, names variable) ----
const LINE_A_RE = /breaks — wounded past its line, it turns and runs\..*answered .*'s shout\.$/;
const LINE_B_RE = /answered .*'s shout, but .* is past holding — they run while running still works\.$/;
const ROUND_CAP = 'Neither gives after';
const JUDGES = 'the judges give it';
const TRICK_MFLEE = ['stuffs its cheeks, bolts.', 'folds out of the fight', 'They LEAVE', 'hereby DISMISSED'];
const HOPELESS = 'sees how this ends';
const LEARN = 'has seen enough';
const LEAVE = 'walk out. (Navigation is victory.)';

function hasLine(log, re) { return (log || []).some(l => re.test(String(l))); }
function hasAny(log, subs) { return (log || []).some(l => subs.some(s => String(l).indexOf(s) >= 0)); }

// Classifier (prereg-fixed): shout-joined only (shoutRound non-null).
// mFlee with no recognized other-ending marker is a BREAK DRIVE-OFF;
// vFlee with no recognized other-ending marker is a FLOOR FLEE.
function classifyFight(f) {
  if (f.shoutRound == null) return 'not-shout-joined';
  const log = f.log || [];
  if (f.outcome === 'mFlee') {
    if (hasAny(log, [ROUND_CAP, JUDGES]) || hasAny(log, TRICK_MFLEE)) return 'mflee-other';
    return 'break-driveoff';
  }
  if (f.outcome === 'vFlee') {
    if (hasAny(log, [HOPELESS, LEARN, ROUND_CAP, JUDGES, LEAVE])) return 'vflee-other';
    return 'floor-flee';
  }
  return 'other-outcome';
}

// ---- pure classifier fixtures ----
let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL ${name} ${detail || ''}`); }
}
function runPureFixtures() {
  const base = { shoutRound: 2, log: ['R1: Someone strikes for 4 (96 left)'] };
  const withLog = (extra, outcome, shout) => Object.assign({}, base, {
    outcome, shoutRound: (shout === undefined ? 2 : shout),
    log: base.log.concat(extra),
  });
  let f;
  f = withLog([], 'mFlee'); check('cls-break-bare', classifyFight(f) === 'break-driveoff', classifyFight(f));
  f = withLog(['The test_beast breaks — wounded past its line, it turns and runs. Fatima answered Sandile\'s shout.'], 'mFlee');
  check('cls-break-lineA', classifyFight(f) === 'break-driveoff' && hasLine(f.log, LINE_A_RE), '');
  f = withLog(['Neither gives after 15 rounds — the worse-off side disengages.'], 'mFlee');
  check('cls-mflee-cap', classifyFight(f) === 'mflee-other', classifyFight(f));
  f = withLog(['Fifteen rounds, no finish — the judges give it to the less-bloodied.'], 'mFlee');
  check('cls-mflee-judges', classifyFight(f) === 'mflee-other', classifyFight(f));
  for (const m of TRICK_MFLEE) {
    f = withLog(['x ' + m], 'mFlee');
    check('cls-mflee-trick-' + m.slice(0, 12), classifyFight(f) === 'mflee-other', classifyFight(f));
  }
  f = withLog([], 'vFlee'); check('cls-floor-bare', classifyFight(f) === 'floor-flee', classifyFight(f));
  f = withLog(['Dale answered Sanne\'s shout, but Sanne is past holding — they run while running still works.'], 'vFlee');
  check('cls-floor-lineB', classifyFight(f) === 'floor-flee' && hasLine(f.log, LINE_B_RE), '');
  f = withLog(['Sanne sees how this ends — and runs while running still works.'], 'vFlee');
  check('cls-vflee-hopeless', classifyFight(f) === 'vflee-other', classifyFight(f));
  f = withLog(['Sanne has seen enough — withdraws to report back. (Learn-first: not winnable, not worth the blood.)'], 'vFlee');
  check('cls-vflee-learn', classifyFight(f) === 'vflee-other', classifyFight(f));
  f = withLog(['Neither gives after 15 rounds — the worse-off side disengages.'], 'vFlee');
  check('cls-vflee-cap', classifyFight(f) === 'vflee-other', classifyFight(f));
  f = withLog(['R2: Someone reads the sterile streets — you can\'t kill a suburb. They walk out. (Navigation is victory.)'], 'vFlee');
  check('cls-vflee-leave', classifyFight(f) === 'vflee-other', classifyFight(f));
  f = withLog([], 'vKill'); check('cls-vkill', classifyFight(f) === 'other-outcome', classifyFight(f));
  f = withLog([], 'vDie'); check('cls-vdie', classifyFight(f) === 'other-outcome', classifyFight(f));
  f = withLog([], 'mFlee', null); check('cls-not-shout', classifyFight(f) === 'not-shout-joined', classifyFight(f));
  f = withLog(['The test_beast breaks — wounded past its line, it turns and runs. Fatima answered Sandile\'s shout.'], 'mFlee');
  check('lineA-not-lineB', hasLine(f.log, LINE_A_RE) && !hasLine(f.log, LINE_B_RE), '');
  f = withLog(['Dale answered Sanne\'s shout, but Sanne is past holding — they run while running still works.'], 'vFlee');
  check('lineB-not-lineA', hasLine(f.log, LINE_B_RE) && !hasLine(f.log, LINE_A_RE), '');
  console.log(`PURE-FIXTURES: ${checks - fails}/${checks} pass`);
  return fails;
}

// ---- engine fixtures (real fieldFight, deterministic opts.rng) ----
async function runEngineFixtures() {
  const { loadGame, setupGame } = require('./sim-harness');
  const ZERO_RNG = () => 0;
  let echecks = 0, efails = 0;
  const echeck = (name, cond, detail) => {
    echecks++;
    if (!cond) { efails++; console.log(`EFAIL ${name} ${detail || ''}`); }
  };
  async function freshGame() {
    const { Game } = await loadGame({ seed: 75101, mode: 'joinendlines-fixture', fullTelemetry: false });
    await setupGame(Game);
    return Game;
  }
  function rosterOf(Game) {
    const r = (((Game.state || {}).village || {}).roster || []).slice();
    return r.filter(v => v && v !== Game.villagerId);
  }
  function setHealth(Game, vid, hp) {
    try {
      Game.state.village.health = Game.state.village.health || {};
      Game.state.village.health[vid] = hp;
    } catch (e) {}
  }
  function setBravery(Game, vid, b) {
    try { Game.agencyOf(vid).xp[vid].bravery = b; } catch (e) {}
  }
  function temperOf(Game, vid) { try { return Game.npcTemper(vid) || 'steady'; } catch (e) { return 'steady'; } }
  function braveryOf(Game, vid) { try { return (((Game.agencyOf(vid) || {}).xp || {})[vid] || {}).bravery || 0; } catch (e) { return 0; } }
  const mdef = (hp, dmg) => ({ id: 'test_beast', hp: [hp, hp], attack: { damage: [dmg, dmg], name: 'bite' }, speed: 5, wave: 1, pack: 1 });

  // Scan roster pairs until one yields the target shape (deterministic
  // order, fixed seed). Returns {rec, fighter, ally} or null.
  async function scan(Game, setup, pred) {
    const roster = rosterOf(Game);
    for (const fighter of roster) {
      for (const ally of roster) {
        if (ally === fighter) continue;
        let rec = null;
        try { rec = setup(Game, fighter, ally); } catch (e) { continue; }
        if (!rec || !Array.isArray(rec.log)) continue;
        if (pred(rec)) return { rec, fighter, ally };
      }
    }
    return null;
  }

  // (a) drive-off after a shout carries line A, not line B.
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter, ally) => {
      setBravery(G, fighter, 20); setHealth(G, fighter, 100); setHealth(G, ally, 100);
      return G.fieldFight(fighter, mdef(120, 5), null, { allies: 1, allyVids: [ally], rng: ZERO_RNG });
    }, rec => rec.outcome === 'mFlee' && hasLine(rec.log, LINE_A_RE));
    echeck('engine-driveoff-lineA', !!hit, 'no roster pair produced a shout-joined mFlee with line A');
    if (hit) {
      echeck('engine-driveoff-no-lineB', !hasLine(hit.rec.log, LINE_B_RE), '');
      echeck('engine-driveoff-shouted', hit.rec.log.some(l => /shouts for help! .* charges in!/.test(String(l))), '');
      console.log(`  driveoff fixture: ${hit.fighter} + ${hit.ally} rounds=${hit.rec.rounds}`);
    }
  }
  // (b) floor-flee after a shout carries line B, not line A.
  // Same-pass shape (the Sanne case): the fighter's HP crosses the
  // flee floor in the very morale pass where the shout fires, so the
  // floor ends the fight before any later round. Tuned HP 44 vs
  // 6-damage: R1 end >= fleeAt, R2 end < fleeAt for the neutral-temper
  // fleeAt band (gear absorb only widens the hopeless margin). Temper
  // filter excludes bold/cautious (they shift fleeAt by -/+0.1 and
  // break the crossing); bravery must be 0 (fresh villagers are).
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter, ally) => {
      const t = temperOf(G, fighter);
      if (t === 'bold' || t === 'cautious' || braveryOf(G, fighter) !== 0) return null;
      setHealth(G, fighter, 44); setHealth(G, ally, 100);
      return G.fieldFight(fighter, mdef(100, 6), null, { allies: 1, allyVids: [ally], rng: ZERO_RNG });
    }, rec => rec.outcome === 'vFlee' && hasLine(rec.log, LINE_B_RE) && !hasAny(rec.log, [HOPELESS, LEARN]));
    echeck('engine-floor-lineB', !!hit, 'no neutral-temper/bravery-0 pair produced a shout-joined floor vFlee with line B');
    if (hit) {
      echeck('engine-floor-no-lineA', !hasLine(hit.rec.log, LINE_A_RE), '');
      console.log(`  floor fixture: ${hit.fighter} + ${hit.ally} rounds=${hit.rec.rounds}`);
    }
  }
  // Negatives: same branches without a shout carry neither line.
  {
    const Game = await freshGame();
    const unjM = await scan(Game, (G, fighter) => {
      setBravery(G, fighter, 20); setHealth(G, fighter, 100);
      return G.fieldFight(fighter, mdef(60, 5), null, { rng: ZERO_RNG });
    }, rec => rec.outcome === 'mFlee');
    echeck('engine-unjoined-mflee', !!unjM, 'no unjoined mFlee produced');
    if (unjM) {
      echeck('engine-unjoined-mflee-no-lines', !hasLine(unjM.rec.log, LINE_A_RE) && !hasLine(unjM.rec.log, LINE_B_RE), '');
    }
    const unjF = await scan(Game, (G, fighter) => {
      setHealth(G, fighter, 45);
      return G.fieldFight(fighter, mdef(100, 6), null, { rng: ZERO_RNG });
    }, rec => rec.outcome === 'vFlee' && !hasAny(rec.log, [HOPELESS, LEARN]));
    echeck('engine-unjoined-floor', !!unjF, 'no unjoined floor vFlee produced');
    if (unjF) {
      echeck('engine-unjoined-floor-no-lines', !hasLine(unjF.rec.log, LINE_A_RE) && !hasLine(unjF.rec.log, LINE_B_RE), '');
    }
    const hop = await scan(Game, (G, fighter) => {
      setHealth(G, fighter, 60);
      return G.fieldFight(fighter, mdef(100, 6), null, { rng: ZERO_RNG });
    }, rec => rec.outcome === 'vFlee' && hasAny(rec.log, [HOPELESS]));
    echeck('engine-hopeless', !!hop, 'no hopeless vFlee produced');
    if (hop) echeck('engine-hopeless-no-lineB', !hasLine(hop.rec.log, LINE_B_RE), '');
  }
  // allyFromStart drive-off carries neither line (same flag gates both).
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter, ally) => {
      setBravery(G, fighter, 20); setHealth(G, fighter, 100); setHealth(G, ally, 100);
      return G.fieldFight(fighter, mdef(120, 5), null, { allies: 1, allyVids: [ally], allyFromStart: true, rng: ZERO_RNG });
    }, rec => rec.outcome === 'mFlee');
    echeck('engine-allystart-mflee', !!hit, 'no allyFromStart mFlee produced');
    if (hit) {
      echeck('engine-allystart-no-lines', !hasLine(hit.rec.log, LINE_A_RE) && !hasLine(hit.rec.log, LINE_B_RE), '');
      echeck('engine-allystart-no-shout', !hit.rec.log.some(l => /shouts for help!/.test(String(l))), '');
    }
  }
  console.log(`ENGINE-FIXTURES: ${echecks - efails}/${echecks} pass`);
  return efails;
}

// ---- corpus judge ----
function loadRows(dir) {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(dir, `s${seed}-fresh.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return rows;
}
function stripLogs(v) {
  if (Array.isArray(v)) return v.map(stripLogs);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) { if (k === 'log') continue; o[k] = stripLogs(v[k]); }
    return o;
  }
  return v;
}
function neutrality(beforeDir, afterDir) {
  const b = loadRows(beforeDir), a = loadRows(afterDir);
  const diffs = [];
  for (let i = 0; i < SEEDS.length; i++) {
    const bs = JSON.stringify(stripLogs(b[i]));
    const as = JSON.stringify(stripLogs(a[i]));
    if (bs !== as) diffs.push(`s${SEEDS[i]} non-log rows differ`);
  }
  const wall = (rows) => rows.map(r => [r.seed, r.won, r.deathTotal, r.table, r.entered, r.waveReach, r.nationalEver, r.nationalFinal, r.days, r.endReason].join('/')).join('|');
  const wallSame = wall(b) === wall(a);
  if (!wallSame) diffs.push('wall numbers differ');
  return { pass: diffs.length === 0, diffs, wallBefore: wall(b), wallAfter: wall(a) };
}
function judge(beforeDir, afterDir) {
  const after = loadRows(afterDir);
  const fights = [];
  for (const r of after) {
    for (const m of ((r.joinendlines || {}).meetings || [])) fights.push(Object.assign({ seed: r.seed }, m));
  }
  // joinendlines meetings are calledHelp fights BY CONSTRUCTION (the
  // recorder stores nothing else — it has no calledHelp field to
  // filter on). Shout-joined vs allyFromStart splits on the recorder's
  // own allyFromStart flag, cross-checked against shoutRound (set only
  // in the shout branch): any disagreement is an instrument anomaly.
  const anomalies = fights.filter(f => (f.allyFromStart === true) === (f.shoutRound != null));
  const shoutJoined = fights.filter(f => f.allyFromStart !== true && f.shoutRound != null);
  const allyStart = fights.filter(f => f.allyFromStart === true);
  const drives = shoutJoined.filter(f => classifyFight(f) === 'break-driveoff');
  const floors = shoutJoined.filter(f => classifyFight(f) === 'floor-flee');
  const drivesWith = drives.filter(f => hasLine(f.log, LINE_A_RE));
  const floorsWith = floors.filter(f => hasLine(f.log, LINE_B_RE));
  const strayA = shoutJoined.filter(f => classifyFight(f) !== 'break-driveoff' && hasLine(f.log, LINE_A_RE))
    .concat(allyStart.filter(f => hasLine(f.log, LINE_A_RE)));
  const strayB = shoutJoined.filter(f => classifyFight(f) !== 'floor-flee' && hasLine(f.log, LINE_B_RE))
    .concat(allyStart.filter(f => hasLine(f.log, LINE_B_RE)));
  const neut = neutrality(beforeDir, afterDir);
  const aGo = drives.length >= 2 && drivesWith.length / drives.length >= 0.8;
  const aIns = drives.length < 2;
  const bGo = floors.length >= 1 && floorsWith.length / floors.length >= 0.8;
  const bIns = floors.length < 1;
  console.log('=== sim-joinendlines-a judge ===');
  console.log(`joined fights in AFTER corpus: ${fights.length} (shout-joined ${shoutJoined.length}, allyFromStart ${allyStart.length}, flag anomalies ${anomalies.length})`);
  console.log(`METRIC A drive-off after shout: ${drivesWith.length}/${drives.length} carry line A ${aIns ? '(INSUFFICIENT-DATA: min-n 2)' : (aGo ? 'GO' : 'NO-GO')}`);
  for (const f of drives) console.log(`  A s${f.seed} d${f.day} ${f.vid} vs ${f.mid} rounds=${f.rounds} lineA=${hasLine(f.log, LINE_A_RE)}`);
  console.log(`METRIC B floor-flee after shout: ${floorsWith.length}/${floors.length} carry line B ${bIns ? '(INSUFFICIENT-DATA: min-n 1)' : (bGo ? 'GO' : 'NO-GO')}`);
  for (const f of floors) console.log(`  B s${f.seed} d${f.day} ${f.vid} vs ${f.mid} rounds=${f.rounds} lineB=${hasLine(f.log, LINE_B_RE)}`);
  console.log(`STRAY lines: A elsewhere ${strayA.length}, B elsewhere ${strayB.length}`);
  console.log(`NEUTRALITY: ${neut.pass ? 'PASS' : 'FAIL ' + neut.diffs.join('; ')}`);
  console.log(`WALL before: ${neut.wallBefore}`);
  console.log(`WALL after:  ${neut.wallAfter}`);
  const verdict = (aGo && bGo && neut.pass && strayA.length === 0 && strayB.length === 0) ? 'GO'
    : (aIns || bIns) ? 'INSUFFICIENT-DATA' : 'NO-GO';
  console.log(`VERDICT: ${verdict}`);
  return { verdict, drives: drives.length, drivesWith: drivesWith.length, floors: floors.length, floorsWith: floorsWith.length, strayA: strayA.length, strayB: strayB.length, neutPass: neut.pass };
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--neutrality') {
    const n = neutrality(args[1], args[2]);
    console.log(n.pass ? 'NEUTRALITY-PASS' : `NEUTRALITY-FAIL ${n.diffs.join('; ')}`);
    process.exit(n.pass ? 0 : 1);
  }
  const pf = runPureFixtures();
  if (pf) { console.log('FIXTURES: failures — judge aborted'); process.exit(1); }
  const ef = await runEngineFixtures();
  if (ef) { console.log('ENGINE-FIXTURES: failures — judge aborted'); process.exit(1); }
  if (args[0] === '--judge') {
    const j = judge(args[1], args[2]);
    process.exit(j.verdict === 'GO' ? 0 : 1);
  }
  console.log('FIXTURES-PASS');
}
main().catch(e => { console.error('JOINENDLINES-FAIL', e && e.stack || e); process.exit(1); });
