#!/usr/bin/env node
// scripts/test-soloendlines-a.js — sim-soloendlines-a fixtures + judge.
// NARRATION ONLY arm: two rec.log.push calls in src/js/fieldFights.js
// (SOLOENDLINES), each gated on !shoutJoined && !opts.allyFromStart.
// Solo line (a) = joined line (a) minus the ally clause; solo line
// (b) = joined line (b) minus the ally clause.
//
// Modes:
//   (no args)            : pure classifier fixtures + engine fixtures.
//   --judge BEFORE AFTER : fixtures, then judge the AFTER corpus
//                          against the prereg (evidence/2026-10-29/
//                          sim-soloendlines-a-prereg.md) with BEFORE
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
// SOLO-A ends at "runs." — the joined line (a) continues past "runs."
// with "X answered Y's shout.", so it does NOT match SOLO_A_RE.
// SOLO-B ends at "still works." and must NOT contain "answered" —
// the joined line (b) contains "answered Y's shout, but", so it does
// NOT match hasSoloB. JOINED matchers are kept for mutual exclusion.
const SOLO_A_RE = /breaks — wounded past its line, it turns and runs\.$/;
const JOINED_A_RE = /breaks — wounded past its line, it turns and runs\..*answered .*'s shout\.$/;
const JOINED_B_RE = /answered .*'s shout, but .* is past holding — they run while running still works\.$/;
const ROUND_CAP = 'Neither gives after';
const JUDGES = 'the judges give it';
const TRICK_MFLEE = ['stuffs its cheeks, bolts.', 'folds out of the fight', 'They LEAVE', 'hereby DISMISSED'];
const HOPELESS = 'sees how this ends';
const LEARN = 'has seen enough';
const LEAVE = 'walk out. (Navigation is victory.)';

function hasLine(log, re) { return (log || []).some(l => re.test(String(l))); }
function hasAny(log, subs) { return (log || []).some(l => subs.some(s => String(l).indexOf(s) >= 0)); }
function hasSoloB(log) { return (log || []).some(l => /is past holding — they run while running still works\.$/.test(String(l)) && !/answered/.test(String(l))); }

// Classifier (prereg-fixed): solo only — NOT calledHelp, NOT
// allyFromStart, shoutRound null (the engine sets shoutRound only
// in the shout branch). mFlee with no recognized other-ending marker
// is a BREAK DRIVE-OFF; vFlee with no recognized other-ending marker
// is a FLOOR FLEE.
function classifyFight(f) {
  if (f.calledHelp || f.allyFromStart === true || f.shoutRound != null) return 'not-solo';
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
  const base = { calledHelp: false, allyFromStart: false, shoutRound: null, log: ['R1: Someone strikes for 4 (96 left)'] };
  const withLog = (extra, outcome, over) => Object.assign({}, base, {
    outcome, log: base.log.concat(extra),
  }, over || {});
  let f;
  f = withLog([], 'mFlee'); check('cls-break-bare', classifyFight(f) === 'break-driveoff', classifyFight(f));
  f = withLog(['The test_beast breaks — wounded past its line, it turns and runs.'], 'mFlee');
  check('cls-break-soloA', classifyFight(f) === 'break-driveoff' && hasLine(f.log, SOLO_A_RE), '');
  f = withLog(['The test_beast breaks — wounded past its line, it turns and runs. Fatima answered Sandile\'s shout.'], 'mFlee');
  check('cls-break-joinedA-not-soloA', classifyFight(f) === 'break-driveoff' && hasLine(f.log, JOINED_A_RE) && !hasLine(f.log, SOLO_A_RE), '');
  f = withLog(['Neither gives after 15 rounds — the worse-off side disengages.'], 'mFlee');
  check('cls-mflee-cap', classifyFight(f) === 'mflee-other', classifyFight(f));
  f = withLog(['Fifteen rounds, no finish — the judges give it to the less-bloodied.'], 'mFlee');
  check('cls-mflee-judges', classifyFight(f) === 'mflee-other', classifyFight(f));
  for (const m of TRICK_MFLEE) {
    f = withLog(['x ' + m], 'mFlee');
    check('cls-mflee-trick-' + m.slice(0, 12), classifyFight(f) === 'mflee-other', classifyFight(f));
  }
  f = withLog([], 'vFlee'); check('cls-floor-bare', classifyFight(f) === 'floor-flee', classifyFight(f));
  f = withLog(['Sanne is past holding — they run while running still works.'], 'vFlee');
  check('cls-floor-soloB', classifyFight(f) === 'floor-flee' && hasSoloB(f.log), '');
  f = withLog(['Dale answered Sanne\'s shout, but Sanne is past holding — they run while running still works.'], 'vFlee');
  check('cls-floor-joinedB-not-soloB', classifyFight(f) === 'floor-flee' && hasLine(f.log, JOINED_B_RE) && !hasSoloB(f.log), '');
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
  f = withLog([], 'mFlee', { calledHelp: true, shoutRound: 2 }); check('cls-not-solo-called', classifyFight(f) === 'not-solo', classifyFight(f));
  f = withLog([], 'mFlee', { allyFromStart: true }); check('cls-not-solo-allystart', classifyFight(f) === 'not-solo', classifyFight(f));
  f = withLog([], 'mFlee', { shoutRound: 2 }); check('cls-not-solo-shoutround', classifyFight(f) === 'not-solo', classifyFight(f));
  f = withLog(['The test_beast breaks — wounded past its line, it turns and runs.'], 'mFlee');
  check('soloA-not-joinedA-not-soloB', hasLine(f.log, SOLO_A_RE) && !hasLine(f.log, JOINED_A_RE) && !hasSoloB(f.log), '');
  f = withLog(['Sanne is past holding — they run while running still works.'], 'vFlee');
  check('soloB-not-joinedB-not-soloA', hasSoloB(f.log) && !hasLine(f.log, JOINED_B_RE) && !hasLine(f.log, SOLO_A_RE), '');
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
    const { Game } = await loadGame({ seed: 75101, mode: 'soloendlines-fixture', fullTelemetry: false });
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

  // (a) SOLO drive-off carries solo line A, not joined A, not solo B.
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter) => {
      setBravery(G, fighter, 20); setHealth(G, fighter, 100);
      return G.fieldFight(fighter, mdef(60, 5), null, { rng: ZERO_RNG });
    }, rec => rec.outcome === 'mFlee' && hasLine(rec.log, SOLO_A_RE));
    echeck('engine-solo-driveoff-lineA', !!hit, 'no roster pair produced a solo mFlee with solo line A');
    if (hit) {
      echeck('engine-solo-driveoff-no-joinedA', !hasLine(hit.rec.log, JOINED_A_RE), '');
      echeck('engine-solo-driveoff-no-soloB', !hasSoloB(hit.rec.log), '');
      echeck('engine-solo-driveoff-unjoined', !hit.rec.calledHelp && hit.rec.shoutRound == null, '');
      console.log(`  solo driveoff fixture: ${hit.fighter} rounds=${hit.rec.rounds}`);
    }
  }
  // (b) SOLO floor-flee carries solo line B, not joined B, not solo A.
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter) => {
      setHealth(G, fighter, 45);
      return G.fieldFight(fighter, mdef(100, 6), null, { rng: ZERO_RNG });
    }, rec => rec.outcome === 'vFlee' && hasSoloB(rec.log) && !hasAny(rec.log, [HOPELESS, LEARN]));
    echeck('engine-solo-floor-lineB', !!hit, 'no roster pair produced a solo floor vFlee with solo line B');
    if (hit) {
      echeck('engine-solo-floor-no-joinedB', !hasLine(hit.rec.log, JOINED_B_RE), '');
      echeck('engine-solo-floor-no-soloA', !hasLine(hit.rec.log, SOLO_A_RE), '');
      echeck('engine-solo-floor-unjoined', !hit.rec.calledHelp && hit.rec.shoutRound == null, '');
      console.log(`  solo floor fixture: ${hit.fighter} rounds=${hit.rec.rounds}`);
    }
  }
  // Shout-joined drive-off still carries JOINED line A, never solo A.
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter, ally) => {
      setBravery(G, fighter, 20); setHealth(G, fighter, 100); setHealth(G, ally, 100);
      return G.fieldFight(fighter, mdef(120, 5), null, { allies: 1, allyVids: [ally], rng: ZERO_RNG });
    }, rec => rec.outcome === 'mFlee' && hasLine(rec.log, JOINED_A_RE));
    echeck('engine-joined-driveoff-lineA', !!hit, 'no roster pair produced a shout-joined mFlee with joined line A');
    if (hit) {
      echeck('engine-joined-driveoff-no-soloA', !hasLine(hit.rec.log, SOLO_A_RE), '');
      echeck('engine-joined-driveoff-shouted', hit.rec.log.some(l => /shouts for help! .* charges in!/.test(String(l))), '');
      console.log(`  joined driveoff fixture: ${hit.fighter} + ${hit.ally} rounds=${hit.rec.rounds}`);
    }
  }
  // Shout-joined floor-flee still carries JOINED line B, never solo B.
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter, ally) => {
      const t = temperOf(G, fighter);
      if (t === 'bold' || t === 'cautious' || braveryOf(G, fighter) !== 0) return null;
      setHealth(G, fighter, 44); setHealth(G, ally, 100);
      return G.fieldFight(fighter, mdef(100, 6), null, { allies: 1, allyVids: [ally], rng: ZERO_RNG });
    }, rec => rec.outcome === 'vFlee' && hasLine(rec.log, JOINED_B_RE) && !hasAny(rec.log, [HOPELESS, LEARN]));
    echeck('engine-joined-floor-lineB', !!hit, 'no neutral-temper/bravery-0 pair produced a shout-joined floor vFlee with joined line B');
    if (hit) {
      echeck('engine-joined-floor-no-soloB', !hasSoloB(hit.rec.log), '');
      echeck('engine-joined-floor-no-soloA', !hasLine(hit.rec.log, SOLO_A_RE), '');
      console.log(`  joined floor fixture: ${hit.fighter} + ${hit.ally} rounds=${hit.rec.rounds}`);
    }
  }
  // Hopeless solo vFlee carries neither solo line.
  {
    const Game = await freshGame();
    const hop = await scan(Game, (G, fighter) => {
      setHealth(G, fighter, 60);
      return G.fieldFight(fighter, mdef(100, 6), null, { rng: ZERO_RNG });
    }, rec => rec.outcome === 'vFlee' && hasAny(rec.log, [HOPELESS]));
    echeck('engine-hopeless', !!hop, 'no hopeless vFlee produced');
    if (hop) {
      echeck('engine-hopeless-no-soloA', !hasLine(hop.rec.log, SOLO_A_RE), '');
      echeck('engine-hopeless-no-soloB', !hasSoloB(hop.rec.log), '');
    }
  }
  // allyFromStart drive-off carries neither solo line (nor joined lines).
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter, ally) => {
      setBravery(G, fighter, 20); setHealth(G, fighter, 100); setHealth(G, ally, 100);
      return G.fieldFight(fighter, mdef(120, 5), null, { allies: 1, allyVids: [ally], allyFromStart: true, rng: ZERO_RNG });
    }, rec => rec.outcome === 'mFlee');
    echeck('engine-allystart-mflee', !!hit, 'no allyFromStart mFlee produced');
    if (hit) {
      echeck('engine-allystart-mflee-no-solo', !hasLine(hit.rec.log, SOLO_A_RE) && !hasSoloB(hit.rec.log), '');
      echeck('engine-allystart-mflee-no-joined', !hasLine(hit.rec.log, JOINED_A_RE) && !hasLine(hit.rec.log, JOINED_B_RE), '');
      echeck('engine-allystart-no-shout', !hit.rec.log.some(l => /shouts for help!/.test(String(l))), '');
    }
  }
  // allyFromStart floor vFlee carries neither solo line.
  {
    const Game = await freshGame();
    const hit = await scan(Game, (G, fighter, ally) => {
      setHealth(G, fighter, 45); setHealth(G, ally, 100);
      return G.fieldFight(fighter, mdef(100, 6), null, { allies: 1, allyVids: [ally], allyFromStart: true, rng: ZERO_RNG });
    }, rec => rec.outcome === 'vFlee' && !hasAny(rec.log, [HOPELESS, LEARN]));
    echeck('engine-allystart-floor', !!hit, 'no allyFromStart floor vFlee produced');
    if (hit) {
      echeck('engine-allystart-floor-no-solo', !hasLine(hit.rec.log, SOLO_A_RE) && !hasSoloB(hit.rec.log), '');
      echeck('engine-allystart-floor-no-joined', !hasLine(hit.rec.log, JOINED_A_RE) && !hasLine(hit.rec.log, JOINED_B_RE), '');
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
  const joined = [];
  for (const r of after) {
    for (const m of ((r.soloendlines || {}).meetings || [])) fights.push(Object.assign({ seed: r.seed }, m));
    for (const m of ((r.joinendlines || {}).meetings || [])) joined.push(Object.assign({ seed: r.seed }, m));
  }
  // Solo corpus BY CONSTRUCTION holds only !calledHelp,
  // !allyFromStart, mFlee/vFlee fights. Any fight violating that is
  // an instrument anomaly (reported, excluded from denominators).
  const anomalies = fights.filter(f => f.calledHelp || f.allyFromStart === true || f.shoutRound != null);
  const solo = fights.filter(f => classifyFight(f) !== 'not-solo' || (f.outcome !== 'mFlee' && f.outcome !== 'vFlee'));
  // Denominators use the classifier directly (not-solo fights excluded
  // there too); solo here is only the population count for reporting.
  const drives = fights.filter(f => classifyFight(f) === 'break-driveoff');
  const floors = fights.filter(f => classifyFight(f) === 'floor-flee');
  const drivesWith = drives.filter(f => hasLine(f.log, SOLO_A_RE));
  const floorsWith = floors.filter(f => hasSoloB(f.log));
  // STRAY (gate, must be 0): solo lines anywhere they do not belong —
  // on non-driveoff solo fights, on non-floor solo fights, or on ANY
  // joined fight (shout-joined or allyFromStart, joinendlines corpus).
  const straySoloA = fights.filter(f => classifyFight(f) !== 'break-driveoff' && hasLine(f.log, SOLO_A_RE));
  const straySoloB = fights.filter(f => classifyFight(f) !== 'floor-flee' && hasSoloB(f.log));
  const strayJoinedA = joined.filter(f => hasLine(f.log, SOLO_A_RE));
  const strayJoinedB = joined.filter(f => hasSoloB(f.log));
  const stray = straySoloA.length + straySoloB.length + strayJoinedA.length + strayJoinedB.length;
  const neut = neutrality(beforeDir, afterDir);
  const aGo = drives.length >= 2 && drivesWith.length / drives.length >= 0.8;
  const aIns = drives.length < 2;
  const bGo = floors.length >= 1 && floorsWith.length / floors.length >= 0.8;
  const bIns = floors.length < 1;
  console.log('=== sim-soloendlines-a judge ===');
  console.log(`solo fights in AFTER corpus: ${fights.length} (classifiable solo ${solo.length}, anomalies ${anomalies.length}); joined fights (stray corpus): ${joined.length}`);
  console.log(`METRIC A solo drive-off: ${drivesWith.length}/${drives.length} carry solo line A ${aIns ? '(INSUFFICIENT-DATA: min-n 2)' : (aGo ? 'GO' : 'NO-GO')}`);
  for (const f of drives) console.log(`  A s${f.seed} d${f.day} ${f.vid} vs ${f.mid} rounds=${f.rounds} lineA=${hasLine(f.log, SOLO_A_RE)}`);
  console.log(`METRIC B solo floor-flee: ${floorsWith.length}/${floors.length} carry solo line B ${bIns ? '(INSUFFICIENT-DATA: min-n 1)' : (bGo ? 'GO' : 'NO-GO')}`);
  for (const f of floors) console.log(`  B s${f.seed} d${f.day} ${f.vid} vs ${f.mid} rounds=${f.rounds} lineB=${hasSoloB(f.log)}`);
  console.log(`STRAY lines: solo-corpus A elsewhere ${straySoloA.length}, solo-corpus B elsewhere ${straySoloB.length}, joined-corpus A ${strayJoinedA.length}, joined-corpus B ${strayJoinedB.length}, TOTAL ${stray}`);
  for (const f of straySoloA.concat(straySoloB)) console.log(`  STRAY-SOLO s${f.seed} d${f.day} ${f.vid} vs ${f.mid} outcome=${f.outcome} cls=${classifyFight(f)}`);
  for (const f of strayJoinedA.concat(strayJoinedB)) console.log(`  STRAY-JOINED s${f.seed} d${f.day} ${f.vid} vs ${f.mid} outcome=${f.outcome} allyFromStart=${f.allyFromStart}`);
  console.log(`NEUTRALITY: ${neut.pass ? 'PASS' : 'FAIL ' + neut.diffs.join('; ')}`);
  console.log(`WALL before: ${neut.wallBefore}`);
  console.log(`WALL after:  ${neut.wallAfter}`);
  const verdict = (neut.pass === false || stray > 0) ? 'NO-GO'
    : (aIns || bIns) ? 'INSUFFICIENT-DATA'
    : (aGo && bGo) ? 'GO' : 'NO-GO';
  console.log(`VERDICT: ${verdict}`);
  return { verdict, drives: drives.length, drivesWith: drivesWith.length, floors: floors.length, floorsWith: floorsWith.length, stray, neutPass: neut.pass };
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
main().catch(e => { console.error('SOLOENDLINES-FAIL', e && e.stack || e); process.exit(1); });
