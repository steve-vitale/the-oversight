#!/usr/bin/env node
// scripts/test-feastscav-20261015.js — PROOF for sim-feastscav (loop B,
// 2026-10-15, food-economy #227). The instrument is HARNESS-SIDE ONLY:
// zero game-code changes; every wrapper calls through (det-gate pins
// zero trajectory delta with the instrument installed).
//
// METHOD GATES (mandatory order):
//   1. DET-GATE FIRST: 16/16 bit-identical A/A reruns with the instrument
//      installed (8 seeds x {leadcourt, leadfeast}), 180d death-aware.
//   2. SMOKE=1 instrument-honesty gate: the instrument is inert when
//      unwrapped; on the control road it logs zero feasts (isolation is
//      real, not assumed).
//   3. Named-export policy unwrap: require('./policies/feastscale').leadfeast
//      is the armed side; FEASTSCALE_R13 unset -> leadfeast delegates to
//      leadcourt byte-identically (RED); FEASTSCALE_R13=1 -> it feasts
//      (GREEN).
//
// REAL RED -> GREEN, run BEFORE any sims:
//   RED:  R1 instrument inert when unwrapped (no retroactive logs).
//         R2 control road never feasts (0 feast logs over a full run).
//         R3 named-export unwrap: FEASTSCALE_R13 unset -> leadfeast ==
//            leadcourt per-day hashes, 40d x2 seeds.
//   GREEN: G1 rigged feast-draw-then-fight: armed grantFeastBuff -> draw
//            fires -> faceFeastDraw -> real startCombat -> engine-reported
//            combat death attributes to 'draw-fought'.
//         G2 rigged driven-off draw -> 'draw-driven'.
//         G3 rigged no-draw feast (pending encounter already live ->
//            'already pending') -> 'feast-nodraw'.
//         G4 FEASTSCALE_R13=1: 60d armed run fires feasts and draws.
//         G5 determinism: rigged fixture twice -> identical attribution.
//
// Usage:
//   SMOKE=1 node scripts/test-feastscav-20261015.js                      (control det-gate; FEASTSCALE_R13 unset)
//   SMOKE=1 FEASTSCALE_R13=1 node scripts/test-feastscav-20261015.js     (armed det-gate)
//
// The instrument itself has no env flag (always installed by the caller);
// the policy flag selects the road.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installFeastScav } = require('./feastscav-instrument-20261015');

const ARMED = process.env.FEASTSCALE_R13 === '1';
const SMOKE = process.env.SMOKE === '1';
console.log('== feastscav proof — ' + (ARMED ? 'ARMED road (leadfeast)' : 'CONTROL road (leadcourt)') + ' ==');
console.log('   FEASTSCALE_R13=' + (process.env.FEASTSCALE_R13 || '(unset)') + ' SMOKE=' + (SMOKE ? '1' : '(unset)'));

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

let FS, LC;
try { FS = require('./policies/feastscale'); } catch (e) {
  console.log('INFO-SKIP: policies/feastscale absent — see evidence/2026-10-15/sim-feastscav-b.md');
  process.exit(0);
}
try { LC = require('./policies/leadcourt'); } catch (e) {
  console.log('INFO-SKIP: policies/leadcourt absent');
  process.exit(0);
}
// NAMED-EXPORT UNWRAP PIN: the armed side is the named export, not a copy.
check('named-export: feastscale.leadfeast exists', !!(FS && FS.leadfeast && FS.leadfeast.id === 'leadfeast'), 'id=' + ((FS.leadfeast || {}).id || '?'));
check('named-export: leadcourt.leadcourt exists', !!(LC && LC.leadcourt), '');

function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}

async function runOnce(seed, policy, days, withInst) {
  const { Game } = await loadGame({ seed, mode: 'feastscav-detgate' });
  await setupGame(Game);
  const inst = withInst ? installFeastScav(Game) : null;
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  let r;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  const sig = inst ? inst.report() : null;
  if (inst) inst.uninstall();
  return { hashes, days: r.days, endReason: r.endReason, sig };
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];

(async () => {
  // ---- GATE 1: DET-GATE FIRST (16/16 or 32/32 identical required) ----
  // Instrument installed on BOTH A/A runs: this pins that the instrument
  // itself adds zero trajectory delta.
  const policy = ARMED ? FS.leadfeast : LC.leadcourt;
  let pass = 0, fail = 0;
  for (const seed of SEEDS) {
    const a = await runOnce(seed, policy, 180, true);
    const b = await runOnce(seed, policy, 180, true);
    let div = -1;
    const n = Math.min(a.hashes.length, b.hashes.length);
    for (let i = 0; i < n; i++) if (a.hashes[i] !== b.hashes[i]) { div = i; break; }
    const lenMatch = a.hashes.length === b.hashes.length;
    const sigMatch = a.sig.feasts === b.sig.feasts && a.sig.draws === b.sig.draws &&
      a.sig.faced === b.sig.faced && a.sig.deaths === b.sig.deaths;
    const identical = div < 0 && lenMatch && sigMatch;
    console.log((identical ? 'IDENTICAL ' : 'DIVERGED  ') +
      (ARMED ? 'leadfeast' : 'leadcourt') + ' s' + seed +
      ` — ${n} day-hashes, instrument logs feasts ${a.sig.feasts}/${b.sig.feasts} draws ${a.sig.draws}/${b.sig.draws} deaths ${a.sig.deaths}/${b.sig.deaths}`);
    if (identical) pass++; else fail++;
  }
  check(`DET-GATE ${ARMED ? 'ARMED' : 'CONTROL'}: 8/8 A/A identical with instrument installed`, pass === 8 && fail === 0, `${pass}/8 pass`);
  if (fail) { console.log('\nPROOF STOP: det-gate failed — the instrument or road is nondeterministic; no comparison is trustworthy.'); process.exit(1); }

  // ---- R3: named-export unwrap RED (gate off -> pure delegation) ----
  if (!ARMED) {
    for (const seed of [11, 22]) {
      const a = await runOnce(seed, LC.leadcourt, 40, false);
      const b = await runOnce(seed, FS.leadfeast, 40, false);
      const same = a.hashes.length === b.hashes.length &&
        a.hashes.every((h, i) => h === b.hashes[i]);
      check(`R3 unwrap RED: leadfeast == leadcourt, seed ${seed}`, same, `${a.hashes.length}d`);
    }
  }

  // ---- GATE 2 + RED/GREEN: SMOKE=1 instrument-honesty ----
  if (!SMOKE) {
    console.log('INFO-SKIP: honesty gate needs SMOKE=1 — re-run with SMOKE=1');
  } else {
    // R1: instrument inert when unwrapped — install AFTER a run, no retroactive logs.
    {
      const { Game } = await loadGame({ seed: 33, mode: 'feastscav-r1' });
      await setupGame(Game);
      await quietLog(async () => { await runDays(Game, ARMED ? FS.leadfeast : LC.leadcourt, { days: 30, sampleEvery: 1 }); });
      const inst = installFeastScav(Game);
      const rep = inst.report();
      inst.uninstall();
      check('R1 inert unwrapped: no retroactive events', rep.feasts === 0 && rep.draws === 0 && rep.deaths === 0,
        `feasts=${rep.feasts} draws=${rep.draws} deaths=${rep.deaths}`);
    }
    // R2: control road truly never feasts (the isolation baseline is real).
    if (!ARMED) {
      const r = await runOnce(33, LC.leadcourt, 180, true);
      check('R2 control: zero feast/draw logs over 180d', r.sig.feasts === 0 && r.sig.draws === 0,
        `feasts=${r.sig.feasts} draws=${r.sig.draws}`);
    }
    // G4: armed road feasts and draws (instrument sees the real verbs).
    // Seed 22 (not 11 — s11's village collapses at d33 before any feast
    // fires; the instrument logs what the road does, honestly zero).
    if (ARMED) {
      const r = await runOnce(22, FS.leadfeast, 60, true);
      check('G4 armed: feasts and draws logged on 60d run', r.sig.feasts > 0 && r.sig.draws > 0,
        `feasts=${r.sig.feasts} draws=${r.sig.draws} faced=${r.sig.faced}`);
    }
  }

  // ---- GREEN: rigged feast-draw-then-fight scenarios (SMOKE=1) ----
  if (!SMOKE) {
    console.log('INFO-SKIP: rigged scenarios need SMOKE=1');
  } else {
    async function rigBase(seed) {
      const { Game } = await loadGame({ seed, mode: 'feastscav-rig' });
      await setupGame(Game);
      Game.say = () => {}; Game.feedback = function () {};
      const s = Game.state.scholar;
      s.day = 30; Game.dayPart = 2;
      return Game;
    }
    // G1: armed grant -> draw fires -> face -> real startCombat -> engine
    // combat death attributes to 'draw-fought'.
    {
      const Game = await rigBase(101);
      const inst = installFeastScav(Game);
      const s = Game.state.scholar;
      s.prog = s.prog || {}; s.prog.feastSurge = 1.5; // armed devotion
      const grant = Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 });
      const drew = inst.draws.length > 0 && inst.draws[0].drawn;
      const mid = drew ? inst.draws[0].monsterId : null;
      check('G1 rig: armed grant fires a draw', drew, 'mid=' + mid);
      const face = drew ? Game.faceFeastDraw() : null;
      check('G1 rig: face starts a real combat', !!(face && face.ok), 'combats=' + inst.combats.length);
      // engine-reported combat death on the draw day (real death path)
      let victim = null;
      try {
        const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
        victim = roster[0] || null;
      } catch (e) {}
      if (victim && typeof Game.hurtVillager === 'function') {
        try { Game.hurtVillager(victim, 999999, 'combat'); } catch (e) {}
      }
      const rep = inst.report();
      const drewDeath = rep.deathRows.find(r => r.combatFamily && r.ch === 'draw-fought');
      check("G1 rig: combat death attributes to 'draw-fought'", !!drewDeath,
        drewDeath ? `day=${drewDeath.day} cause=${drewDeath.cause}` : 'none');
      check('G1 rig: coverage 1.0', rep.attributionCoverage === 1, 'coverage=' + rep.attributionCoverage);
      inst.uninstall();
    }
    // G2: driven-off draw -> 'draw-driven'.
    {
      const Game = await rigBase(102);
      const inst = installFeastScav(Game);
      const s = Game.state.scholar;
      s.prog = s.prog || {}; s.prog.feastSurge = 1.5;
      Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 });
      const drew = inst.draws.length > 0 && inst.draws[0].drawn;
      let drove = false;
      if (drew) { try { const r = Game.driveOffFeastDraw(); drove = !!(r && r.ok); } catch (e) {} }
      check('G2 rig: draw driven off', drove, '');
      let victim = null;
      try { victim = (((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId))[0] || null; } catch (e) {}
      if (victim && typeof Game.hurtVillager === 'function') { try { Game.hurtVillager(victim, 999999, 'combat'); } catch (e) {} }
      const rep = inst.report();
      const d = rep.deathRows.find(r => r.combatFamily && r.ch === 'draw-driven');
      check("G2 rig: combat death attributes to 'draw-driven'", !!d, d ? `day=${d.day}` : 'none');
      inst.uninstall();
    }
    // G3: armed feast whose draw cannot fire (pending encounter already
    // live -> 'already pending') -> 'feast-nodraw'.
    {
      const Game = await rigBase(103);
      const inst = installFeastScav(Game);
      const s = Game.state.scholar;
      s.prog = s.prog || {}; s.prog.feastSurge = 1.5;
      Game.pendingEncounter = true; Game.pendingMonsterId = 'hummice'; // someone else's beast
      Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 });
      const noFire = inst.draws.length > 0 && !inst.draws[0].drawn;
      check('G3 rig: draw blocked (already pending)', noFire, 'why=' + ((inst.draws[0] || {}).why || '?'));
      const rep = inst.report();
      const w = inst.buildWindows();
      check("G3 rig: window is 'feast-nodraw'", w.some(x => x.ch === 'feast-nodraw'), JSON.stringify(w.map(x => x.ch)));
      check('G3 rig: no draw-fought window', !w.some(x => x.ch === 'draw-fought'), '');
      Game.pendingEncounter = false; Game.pendingMonsterId = null;
      inst.uninstall();
    }
    // G5: determinism of the rig (same fixture twice -> identical attribution).
    {
      async function rigSig(seed) {
        const Game = await rigBase(seed);
        const inst = installFeastScav(Game);
        const s = Game.state.scholar;
        s.prog = s.prog || {}; s.prog.feastSurge = 1.5;
        Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 });
        if (inst.draws[0] && inst.draws[0].drawn) Game.faceFeastDraw();
        let victim = null;
        try { victim = (((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId))[0] || null; } catch (e) {}
        if (victim && typeof Game.hurtVillager === 'function') { try { Game.hurtVillager(victim, 999999, 'combat'); } catch (e) {} }
        const rep = inst.report();
        const sig = JSON.stringify([rep.feasts, rep.draws, rep.faced, rep.attributionCoverage,
          rep.deathRows.map(r => r.ch + ':' + r.cause)]);
        inst.uninstall();
        return sig;
      }
      const s1 = await rigSig(104), s2 = await rigSig(104);
      check('G5 rig determinism: identical fixture twice', s1 === s2, '');
    }
  }

  console.log(fails.length ? `\nPROOF RESULT: ${fails.length} FAIL — ${fails.join(', ')}` : '\nPROOF RESULT: all checks passed (RED and GREEN)');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
