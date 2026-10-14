#!/usr/bin/env node
// test-rationtraj-20261014.js — PANTRY-TRAJECTORY RATION proof
// (scale-onramp, fleshout-a 2026-10-14-2315, ARM 4: sim-rationtraj).
//
// RED (gate off): RATIONTRAJ unset -> the wrapper delegates to leadfeast
//   byte-identically. Proven on REAL trajectories: same seed, rationtraj
//   policy (gate off) vs raw leadfeast, per-day hash compare -> IDENTICAL.
// GREEN (RATIONTRAJ=1):
//   G1. trigger logic (pure evalTrajectory): falling+thin window -> engage;
//       falling-but-full window -> silent; gorge-noise window (full pantry
//       wobbling) -> silent — the r31 false-positive class; empty-clause
//       window -> engage regardless of slope. Live: policy.daily samples the
//       real Game.pantryFreshDays() into ctx._rtWindow; updateRationCall on
//       a real game engages with an honest narrated beat and disengages on
//       recovery.
//   G2. disengage via the 2-day recovering-slope streak.
//   G3. feast pause: while engaged, the upkeep-installed wrap refuses
//       Game.hostFeast with an honest reason; the engine's real hostFeast
//       never runs (pantry untouched); restore() hands the real verb back.
//   G4. beg refusal: while engaged, the daily-installed wrap force-refuses
//       Game.answerAidBeg through the REAL verb (real trust/gossip
//       consequences — no faked returns, cf. finding #201), narrated with
//       the beggar named; dedupe (#179): first refusal per beggar per
//       engagement gets the full beat, repeats get a short holding beat,
//       never the verbatim repeat; no pending beg -> delegates.
//   G5. defender-meal verb ABSENT by design (#178 — the watch-meal
//       precondition contradicts its trigger; never rebuilt).
//   G6. beats read as a village deciding to tighten under a draining
//       pantry (sense-test: captured copy asserted on content, printed for
//       the human read).
//
// SMOKE=1: RED runs at 30d (instrument-honesty gate); full run is 180d.
//
// Harness: mulberry32, SEED env override (default 20261014), full src/js
// module list in index.html order minus DOM-only files and drama.js, window
// stubbed for eval then deleted, Math.random seeded BEFORE eval. Never
// stubs Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SEED = parseInt(process.env.SEED || '20261014', 10);
Math.random = mulberry32(SEED);
const ROOT = path.join(__dirname, '..');
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log(`LOAD FAIL ${f}: ${e.message}`); } });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

const SMOKE = process.env.SMOKE === '1';
const RED_DAYS = SMOKE ? 30 : 180;

// ---- harness pieces (same as the sweep) ----
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');

async function trajectory(policy, seed, days) {
  const g = await loadGame({ seed, mode: 'rationtraj-proof' });
  await setupGame(g.Game);
  const Game2 = g.Game;
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game2.state.scholar.day + ':' + dayHash(Game2));
    return base ? base(G, ctx) : undefined;
  };
  const r = await runDays(Game2, wrapped, { days, sampleEvery: 1 });
  return { hashes, days: r.days, endReason: r.endReason };
}

function captureSay(G) {
  const beats = [];
  const orig = G.say;
  G.say = function (msg) { try { beats.push(String(msg)); } catch (e) {} return orig.apply(this, arguments); };
  return { beats, restore() { G.say = orig; } };
}

function pantryKcal(G) {
  return (((G.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

async function main() {
  let rr;
  try {
    rr = require('./policies/rationtraj');
  } catch (e) {
    // KILL PROTOCOL: the policy layer was deleted; this proof is the
    // historical record. Its RED/GREEN results live in
    // evidence/2026-10-14/sim-rationtraj.md ("Proof test" section).
    console.log('SKIP: scripts/policies/rationtraj.js deleted per kill protocol — see evidence/2026-10-14/sim-rationtraj.md');
    process.exit(0);
  }
  const { leadfeast } = require('./policies/feastscale');

  console.log('== RED: gate-off delegates to leadfeast byte-identically ==');
  {
    delete process.env.RATIONTRAJ;
    const a = await trajectory(rr.policyForRun(), 44, RED_DAYS);
    const b = await trajectory(leadfeast, 44, RED_DAYS);
    let firstDiv = -1;
    const n = Math.min(a.hashes.length, b.hashes.length);
    for (let i = 0; i < n; i++) { if (a.hashes[i] !== b.hashes[i]) { firstDiv = i; break; } }
    const identical = firstDiv < 0 && a.hashes.length === b.hashes.length;
    check('RED gate-off: rationtraj policy == raw leadfeast trajectory', identical,
      identical ? `${n} days, ${a.days}/${a.endReason}` : `DIVERGED at hash ${firstDiv} (day ${firstDiv >= 0 ? a.hashes[firstDiv].split(':')[0] : '?'})`);
    check('RED gate-off: named exports present', typeof rr.evalTrajectory === 'function' && typeof rr.refuseFeasts === 'function');
  }

  console.log('== GREEN: trigger logic — pure evalTrajectory (G1) ==');
  {
    // falling + thin -> ENGAGE (the killer-siege shape: s11's pantry draining)
    let d = rr.evalTrajectory([5.0, 4.4, 3.8, 3.2, 2.7, 2.2, 1.7], false, 0);
    check('G1 falling+thin engages', d.engage === true, `fd=${d.freshDays} slope=${d.slope.toFixed(3)}`);
    // falling but FULL -> silent (the r31 false-positive: 15 gorge nights, pantry absorbed them)
    d = rr.evalTrajectory([8.0, 7.6, 7.2, 6.8, 6.5, 6.1, 5.8], false, 0);
    check('G1 falling-but-full stays silent', d.engage === false, `fd=${d.freshDays} slope=${d.slope.toFixed(3)}`);
    // gorge noise on a full pantry -> silent (wobble, no drain)
    d = rr.evalTrajectory([6.0, 5.8, 6.2, 5.9, 6.1, 5.7, 6.0], false, 0);
    check('G1 gorge-noise window stays silent', d.engage === false, `fd=${d.freshDays} slope=${d.slope.toFixed(3)}`);
    // nearly gone regardless of slope -> ENGAGE (the eulogy-avoidance clause)
    d = rr.evalTrajectory([2.0, 1.9, 1.8, 1.8, 1.7, 1.6, 0.8], false, 0);
    check('G1 nearly-gone engages regardless of slope', d.engage === true, `fd=${d.freshDays} slope=${d.slope.toFixed(3)}`);
    // holding steady (999, village covers itself) -> silent
    d = rr.evalTrajectory([999, 999, 999, 999, 999, 999, 999], false, 0);
    check('G1 steady-state 999 stays silent', d.engage === false, `fd=${d.freshDays}`);
    // short window -> no decision (honest about insufficient history)
    d = rr.evalTrajectory([1.5, 1.2, 0.9], false, 0);
    check('G1 short window refuses to decide', d.engage === false && d.full === false, `n=${d.n}`);
  }

  console.log('== GREEN: live sampling + engage/disengage beats (G1 live) ==');
  {
    process.env.RATIONTRAJ = '1';
    const g = await loadGame({ seed: 20261014, mode: 'rationtraj-proof-g1' });
    await setupGame(g.Game);
    const G = g.Game;
    const cap = captureSay(G);
    const policy = rr.policyForRun();
    const ctx = {};
    policy.setup(G, ctx);
    check('G1 detector installed (window present)', Array.isArray(ctx._rtWindow));
    // one live policy.daily samples the REAL pantryFreshDays
    const before = G.pantryFreshDays();
    policy.daily(G, ctx);
    check('G1 live sample landed in the window', ctx._rtWindow.length === 1 && ctx._rtWindow[0] === before,
      `window=${JSON.stringify(ctx._rtWindow)} real=${before}`);
    // drive the trigger live: seed a falling+thin window, run the transition
    ctx._rtWindow = [4.2, 3.9, 3.5, 3.1, 2.8, 2.4, 2.0];
    rr.updateRationCall(G, ctx);
    check('G1 live engaged on falling+thin', !!ctx._rtEngaged);
    const engageBeat = cap.beats.find(b => /RATION CALL/.test(b));
    check('G1 engage beat narrated', !!engageBeat);
    if (engageBeat) {
      check('G1 beat names the fresh-days', /fresh-day/.test(engageBeat));
      check('G1 beat names the calls (no feasts, honest no, eats lean)',
        /No feasts/.test(engageBeat) && /honest no/.test(engageBeat) && /eats lean/.test(engageBeat));
      console.log('  BEAT: ' + engageBeat.slice(0, 260));
    }
    // recovery: solid recovery disengages with a lift beat
    ctx._rtWindow = [2.5, 2.8, 3.2, 3.8, 4.2, 4.6, 5.1];
    rr.updateRationCall(G, ctx);
    check('G1 disengaged on solid recovery', !ctx._rtEngaged);
    const disBeat = cap.beats.find(b => /ration call lifts/.test(b));
    check('G1 disengage beat narrated', !!disBeat);
    if (disBeat) console.log('  BEAT: ' + disBeat.slice(0, 220));
    cap.restore();
  }

  console.log('== GREEN: disengage via the recovering-slope streak (G2) ==');
  {
    process.env.RATIONTRAJ = '1';
    const g = await loadGame({ seed: 20261015, mode: 'rationtraj-proof-g2' });
    await setupGame(g.Game);
    const G = g.Game;
    const ctx = {};
    rr.installRationCall(G, ctx);
    ctx._rtEngaged = true;
    ctx._rtWindow = [1.5, 1.7, 1.9, 2.1, 2.3, 2.5, 2.7]; // slope +0.2, still thin
    rr.updateRationCall(G, ctx);
    check('G2 still engaged after 1 recovering day', !!ctx._rtEngaged && ctx._rtRecoverStreak === 1,
      `streak=${ctx._rtRecoverStreak}`);
    rr.updateRationCall(G, ctx); // second consecutive recovering day
    check('G2 disengaged after 2 recovering days', !ctx._rtEngaged);
    check('G2 streak reset on disengage', ctx._rtRecoverStreak === 0);
  }

  console.log('== GREEN: feast pause (G3) ==');
  {
    process.env.RATIONTRAJ = '1';
    const g = await loadGame({ seed: 777, mode: 'rationtraj-proof-g3' });
    await setupGame(g.Game);
    const G = g.Game;
    const cap = captureSay(G);
    const ctx = {};
    rr.installRationCall(G, ctx);
    ctx._rtEngaged = true; // engagement logic proven in G1
    ctx.rtFreshDays = 2.2;
    const realHostFeast = G.hostFeast;
    const pkBefore = pantryKcal(G);
    const restore = rr.refuseFeasts(G, ctx);
    const rep = G.hostFeast();
    check('G3 feast refused while engaged', rep && rep.ok === false, JSON.stringify(rep && rep.why));
    check('G3 refusal reason is honest', /ration call/.test((rep && rep.why) || ''));
    check('G3 refusal narrated (no silent action)', cap.beats.some(b => /No feast tonight/.test(b)));
    check('G3 pantry untouched by the refused feast', pantryKcal(G) === pkBefore, `${pkBefore} -> ${pantryKcal(G)}`);
    restore();
    check('G3 verb restored after', G.hostFeast === realHostFeast);
    check('G3 refusal counted', ctx.rtFeastsRefused === 1, `rtFeastsRefused=${ctx.rtFeastsRefused}`);
    cap.restore();
  }

  console.log('== GREEN: beg refusal (G4) ==');
  {
    process.env.RATIONTRAJ = '1';
    const g = await loadGame({ seed: 778, mode: 'rationtraj-proof-g4' });
    await setupGame(g.Game);
    const G = g.Game;
    const cap = captureSay(G);
    const ctx = {};
    rr.installRationCall(G, ctx);
    ctx._rtEngaged = true;
    ctx.rtFreshDays = 1.9;
    // plant a beg
    const plantBeg = () => {
      G.state.pendingAidBeg = { villageId: 'test-village', amount: 1500 };
      G.state.otherVillages = [{ id: 'test-village', name: 'Testville' }];
    };
    plantBeg();
    const realBeg = G.answerAidBeg;
    const restore = rr.refuseBegs(G, ctx);
    const r = G.answerAidBeg('give'); // the base policy's choice is overridden
    check('G4 beg force-refused while engaged', r === 'refused', `returned ${r}`);
    const begBeat = cap.beats.find(b => /A beg came from/.test(b));
    check('G4 refusal narrated with the beggar named', !!begBeat && /Testville/.test(begBeat));
    if (begBeat) console.log('  BEAT: ' + begBeat.slice(0, 240));
    check('G4 refusal counted', ctx.rtBegsRefused === 1);
    // dedupe: the same beggar re-begs -> short holding beat, NOT the verbatim repeat
    plantBeg();
    const nBefore = cap.beats.length;
    G.answerAidBeg('give');
    const newBeats = cap.beats.slice(nBefore);
    check('G4 repeat refusal deduped (not verbatim)', newBeats.length === 1 && !/A beg came from/.test(newBeats[0]),
      newBeats[0] ? newBeats[0].slice(0, 120) : 'no beat');
    check('G4 repeat refusal still narrated (no silent action)', newBeats.length === 1 && /Same word as yesterday/.test(newBeats[0]));
    check('G4 repeats counted', ctx.rtBegsRefused === 2);
    // no pending beg -> delegates to the real verb
    G.state.pendingAidBeg = null;
    const r2 = G.answerAidBeg('give');
    check('G4 no-beg delegates (real verb speaks)', r2 === null && cap.beats.some(b => /No one is begging/.test(b)));
    restore();
    check('G4 verb restored after', G.answerAidBeg === realBeg);
    cap.restore();
  }

  console.log('== GREEN: defender-meal verb absent by design (G5) ==');
  {
    check('G5 no feedWatch export (#178 — unreachable, never rebuilt)', typeof rr.feedWatch === 'undefined');
  }

  console.log('== SENSE-TEST: the beats read as a village decision (G6) ==');
  {
    process.env.RATIONTRAJ = '1';
    const g = await loadGame({ seed: 779, mode: 'rationtraj-proof-g6' });
    await setupGame(g.Game);
    const G = g.Game;
    const cap = captureSay(G);
    const ctx = {};
    rr.installRationCall(G, ctx);
    ctx._rtWindow = [4.0, 3.7, 3.3, 2.9, 2.6, 2.2, 1.8];
    rr.updateRationCall(G, ctx);
    G.state.pendingAidBeg = { villageId: 'stonebridge', amount: 1500 };
    G.state.otherVillages = [{ id: 'stonebridge', name: 'Stonebridge' }];
    const restore = rr.refuseBegs(G, ctx);
    G.answerAidBeg('give');
    restore();
    ctx._rtWindow = [2.0, 2.4, 2.9, 3.4, 3.9, 4.3, 4.7];
    rr.updateRationCall(G, ctx);
    cap.restore();
    const engage = cap.beats.find(b => /RATION CALL/.test(b));
    const refuse = cap.beats.find(b => /A beg came from/.test(b));
    const lift = cap.beats.find(b => /ration call lifts/.test(b));
    check('G6 engage beat names stores + drain', !!engage && /stores stand at/.test(engage) && /falling/.test(engage));
    check('G6 refusal beat names cost ("They\'ll remember this")', !!refuse && /remember this/.test(refuse));
    check('G6 lift beat re-opens honestly', !!lift && /bins open again/.test(lift));
    console.log('  --- engage ---\n  ' + (engage || 'MISSING'));
    console.log('  --- refuse ---\n  ' + (refuse || 'MISSING'));
    console.log('  --- lift ---\n  ' + (lift || 'MISSING'));
  }

  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
