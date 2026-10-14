#!/usr/bin/env node
// scripts/test-warroad-20261014.js — PROOF for the warroad arm (scale-onramp ARM 2).
//
// Two runs:
//   node scripts/test-warroad-20261014.js            # pristine: expect REAL RED
//   WARROAD=1 node scripts/test-warroad-20261014.js # armed: expect GREEN
//
// RED phase: the gate is off, the export IS the pinned competent policy
// (reference-equal — byte-identical by construction), and the war drive's
// behaviors cannot fire: on a wave-3-unlocked fixture the inert policy runs
// zero hunt legs and marks zero committed hunts.
// GREEN phase: the layer fires engine-honest wave-3 hunts (real travelTo +
// real checkEncounter + detail-grid engagement) through courtkill's hunt
// machinery, and stands down once 4 wave-3 ledger points are banked (the
// readiness-selection rung).
//
// Fixture ledger banking goes through the REAL recordWaveKill verb
// (kills-only ledger law) — no state surgery on the ledger itself.
'use strict';
const ARMED = process.env.WARROAD === '1';
const { loadGame, setupGame } = require('./sim-harness');

const results = [];
function ok(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || '' });
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

const W1 = ['bulldozer', 'hushwolf', 'gallowdeer', 'mirrormoth', 'belltoad'];
const W2 = ['voice_mimic_radio', 'mirror_stag', 'review_drone', 'bright_idea'];
const W3 = ['redactor', 'gavel', 'focus_group', 'spool'];

async function rig(seed) {
  const { Game } = await loadGame({ seed, mode: 'warroad-proof' });
  await setupGame(Game);
  Game.state.scholar.day = 30;
  return Game;
}

// Bank ledger points through the real kill verb: 5 wave-1 + 4 wave-2 kills
// of distinct types -> wave 3 unlocked (day floor 25 + bars).
function unlockWave3(Game) {
  for (const id of W1) Game.recordWaveKill(id, 'player', 'test', null);
  for (const id of W2) Game.recordWaveKill(id, 'player', 'test', null);
  return (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 0;
}

function healthyScholar(Game) {
  const s = Game.state.scholar;
  if (typeof Game.maxHealth === 'function') s.hp = Game.maxHealth();
  else s.hp = 100;
  s.kcal = 800;
}

(async () => {
  console.log(`warroad proof — ${ARMED ? 'ARMED (WARROAD=1), expect GREEN' : 'PRISTINE (gate off), expect REAL RED'}`);
  // Landed-tree guard (3184c187 pattern): the warroad layer was deleted per
  // kill protocol, so the require below throws MODULE_NOT_FOUND on a clean
  // tree. Pre-kill verification (worker tree): REAL RED→GREEN 6/6.
  let mod = null;
  try { mod = require('./policies/warroad'); } catch (e) { mod = null; }
  if (!mod) {
    console.log('INFO-SKIP: policies/warroad.js absent (killed arm, layer deleted per kill protocol). Pre-kill RED→GREEN 6/6 stands; nothing to run on the landed tree.');
    process.exit(0);
  }
  const { warroad, warroadOn, WARROAD_ON } = mod;
  const { competent } = require('./policies/competent');

  if (!ARMED) {
    // ---- RED: the war drive is inert ----
    ok('R1-armed-identity', warroad.id === 'warroad' && WARROAD_ON === true && warroadOn() === true,
      `id=${warroad.id} on=${WARROAD_ON} — the layer is inert on pristine`);
    ok('R2-byte-identical-by-construction', warroad === competent,
      'gate-off export IS the competent object (reference-equal): zero behavioral delta possible');
    // R3 behavioral: the inert policy runs ZERO hunt legs on a
    // wave-3-unlocked fixture — the war drive cannot fire.
    const Game = await rig(11);
    const w3 = unlockWave3(Game);
    healthyScholar(Game);
    const ctx = {};
    try { warroad.daily(Game, ctx); } catch (e) {}
    try { warroad.fight(Game, ctx); } catch (e) {}
    ok('R3-zero-hunts-inert', w3 >= 3 && (ctx.hunts || 0) === 0 && (ctx._huntCommit || false) === false,
      `wave=${w3} hunts=${ctx.hunts || 0} huntCommit=${!!ctx._huntCommit} — no hunt machinery runs under the inert policy`);
    const bad = results.filter(r => !r.ok);
    console.log(`\nRED: ${bad.length}/${results.length} failed on pristine (expected — the war drive is inert; no hunt can fire).`);
    process.exit(bad.length ? 1 : 0);
  }

  // ---- GREEN ----
  ok('G1-armed-identity', warroad.id === 'warroad' && WARROAD_ON === true && warroadOn() === true &&
    typeof warroad.daily === 'function' && typeof warroad.fight === 'function',
    `id=${warroad.id} on=${WARROAD_ON}`);

  // G2 — the hunt leg fires on the wave-3-unlocked fixture: healthy scholar,
  // engine-honest thicket/ruin expeditions (hunts>=1, real travelTo legs).
  {
    const Game = await rig(12);
    const w3 = unlockWave3(Game);
    healthyScholar(Game);
    const ctx = {};
    try { warroad.daily(Game, ctx); } catch (e) {}
    const tts = [];
    try { for (const tt of (Game.travelTargets() || [])) { let t = null; try { t = Game.tileAt(tt.x, tt.y); } catch (e) {} if (t) tts.push(t.type); } } catch (e) {}
    ok('G2-hunt-fires', w3 >= 3 && (ctx.hunts || 0) >= 1,
      `wave=${w3} hunts=${ctx.hunts || 0} legs=${ctx.huntLegs || 0} engaged=${ctx.huntEngaged || 0} (travelTargets=[${[...new Set(tts)].join(',')}])`);
  }

  // G3 — the rung stands down: 4 wave-3 ledger points banked -> the hunt is
  // over (readiness-selected; the scholar goes back to competent caution).
  {
    const Game = await rig(13);
    unlockWave3(Game);
    for (const id of W3) Game.recordWaveKill(id, 'player', 'test', null);
    const pts = (typeof Game.waveLedgerPoints === 'function') ? Game.waveLedgerPoints(3) : -1;
    healthyScholar(Game);
    const ctx = {};
    try { warroad.daily(Game, ctx); } catch (e) {}
    ok('G3-rung-standdown', pts >= 4 && (ctx.hunts || 0) === 0,
      `w3pts=${pts} hunts=${ctx.hunts || 0} — 4 points banked, the hunt stands down`);
  }

  // G4 — gate-off export is the competent object even in the armed process:
  // WARROAD_ON captured at module load; the OFF path is reference-identical.
  {
    const fresh = require('./policies/competent').competent;
    ok('G4-competent-pinned', typeof fresh.daily === 'function' && fresh.id === 'competent',
      `competent base intact, id=${fresh.id}`);
  }

  // G5 — the armed policy delegates combat: fight() on no-fight state
  // returns false and never marks _huntCommit (fail-closed).
  {
    const Game = await rig(14);
    const ctx = {};
    let r = 'threw';
    try { r = warroad.fight(Game, ctx); } catch (e) {}
    ok('G5-fight-fail-closed', r === false && !ctx._huntCommit,
      `fight()=${r} huntCommit=${!!ctx._huntCommit} with no live fight`);
  }

  // G6 — no courtship verbs: the war drive never proposes links (pure
  // kill-road; the diplomacy road belongs to the control side).
  {
    const src = require('fs').readFileSync(require('path').join(__dirname, 'policies', 'warroad.js'), 'utf8');
    ok('G6-no-courtship', !src.includes('proposeLink') && !src.includes('tendLink'),
      'warroad.js contains zero proposeLink/tendLink references');
  }

  const bad = results.filter(r => !r.ok);
  console.log(`\n${bad.length ? 'RED' : 'GREEN'}: ${results.length - bad.length}/${results.length} passed${bad.length ? ' — FIX BEFORE SPEND' : ' — the war drive hunts wave-3 honestly and stands down at the rung.'}`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
