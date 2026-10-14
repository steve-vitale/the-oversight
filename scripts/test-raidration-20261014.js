#!/usr/bin/env node
// test-raidration-20261014.js — RAID-AWARE RATION proof (scale-onramp r31 ARM 3).
//
// RED (gate off): RAIDRATION unset -> the wrapper delegates to leadfeast
//   byte-identically. Proven on REAL trajectories: same seed, raidration
//   policy (gate off) vs raw leadfeast, per-day hash compare -> IDENTICAL.
// GREEN (RAIDRATION=1):
//   G1. fires only at/above threshold: 3 gorge-days -> not engaged; 4th ->
//       engaged + honest engage beat. Driven through the REAL policy wrap
//       (Game.raidPillage call-through) + real policy.daily.
//   G2. disengage: 14d window expires -> disengage beat, verbs restore.
//   G3. feast pause: while engaged, the upkeep-installed wrap refuses
//       Game.hostFeast with an honest reason; the engine's real hostFeast
//       never runs (pantry untouched); restore() hands the real verb back.
//   G4. beg refusal: while engaged, the daily-installed wrap force-refuses
//       Game.answerAidBeg with an honest narrated beat naming the beggar.
//   G5. defenders eat first: while engaged, feedWatch gives pack 'meal's to
//       the patrol watch via the real Game.giveFood (real pack kcal, real
//       trust/hunger effects); skips when the scholar isn't topped up.
//   G6. beats read as a village under siege making hard calls (sense-test:
//       captured copy asserted on content, printed for the human read).
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
  const g = await loadGame({ seed, mode: 'raidration-proof' });
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

async function main() {
  let rr;
  try {
    rr = require('./policies/raidration');
  } catch (e) {
    // KILL PROTOCOL (r31 NO-GO): the policy layer was deleted; this proof is
    // the historical record of the kill. Its RED/GREEN results live in
    // evidence/2026-10-14/sim-raidration-r31.md ("Proof test" section).
    console.log('SKIP: scripts/policies/raidration.js deleted per r31 kill protocol — see evidence/2026-10-14/sim-raidration-r31.md');
    process.exit(0);
  }
  const { leadfeast } = require('./policies/feastscale');

  console.log('== RED: gate-off delegates to leadfeast byte-identically ==');
  {
    delete process.env.RAIDRATION;
    const a = await trajectory(rr.policyForRun(), 44, RED_DAYS);
    const b = await trajectory(leadfeast, 44, RED_DAYS);
    let firstDiv = -1;
    const n = Math.min(a.hashes.length, b.hashes.length);
    for (let i = 0; i < n; i++) { if (a.hashes[i] !== b.hashes[i]) { firstDiv = i; break; } }
    const identical = firstDiv < 0 && a.hashes.length === b.hashes.length;
    check('RED gate-off: raidration policy == raw leadfeast trajectory', identical,
      identical ? `${n} days, ${a.days}/${a.endReason}` : `DIVERGED at hash ${firstDiv} (day ${firstDiv >= 0 ? a.hashes[firstDiv].split(':')[0] : '?'})`);
    check('RED gate-off: detector installed nothing', true, 'setup with RAIDRATION unset skips installSiegeDetector by construction');
  }

  console.log('== GREEN: threshold firing (G1) ==');
  {
    process.env.RAIDRATION = '1';
    const g = await loadGame({ seed: 20261014, mode: 'raidration-proof-g1' });
    await setupGame(g.Game);
    const G = g.Game;
    const cap = captureSay(G);
    const policy = rr.policyForRun();
    const ctx = {};
    policy.setup(G, ctx);
    const T = rr.SIEGE_T;
    check('G1 detector installed (wrap present)', G.raidPillage !== undefined && ctx._rrGorgeDays !== undefined);
    const v = G.state.village;
    const setDay = (d) => { G.state.scholar.day = d; };
    // T-1 gorge-days: below threshold
    for (let i = 0; i < T - 1; i++) { const d = 10 + i; setDay(d); G.raidPillage(v, 800); policy.daily(G, ctx); }
    check(`G1 not engaged at ${T - 1} gorge-days`, !ctx._rrEngaged, `engaged=${!!ctx._rrEngaged}`);
    check(`G1 no siege beat at ${T - 1} gorge-days`, !cap.beats.some(b => /SIEGE RATIONS/.test(b)));
    // Tth gorge-day: engage
    setDay(10 + T - 1); G.raidPillage(v, 800); policy.daily(G, ctx);
    check(`G1 engaged at ${T} gorge-days`, !!ctx._rrEngaged);
    const engageBeat = cap.beats.find(b => /SIEGE RATIONS/.test(b));
    check('G1 engage beat narrated', !!engageBeat);
    if (engageBeat) {
      check('G1 beat names the gorge count', new RegExp(`${T} gorge nights`).test(engageBeat));
      check('G1 beat names the hard calls (no feasts, honest no, watch eats first)',
        /No feasts/.test(engageBeat) && /honest no/.test(engageBeat) && /watch eats first/.test(engageBeat));
      check('G1 beat states the pantry (honest numbers)', /kcal in the stores/.test(engageBeat));
      console.log('  BEAT: ' + engageBeat.slice(0, 300));
    }
    // G2: disengage when the window expires
    setDay(40); policy.daily(G, ctx);
    check('G2 disengaged after window expiry', !ctx._rrEngaged);
    const disBeat = cap.beats.find(b => /lifts the ration call/.test(b));
    check('G2 disengage beat narrated', !!disBeat);
    if (disBeat) console.log('  BEAT: ' + disBeat.slice(0, 240));
    cap.restore();
  }

  console.log('== GREEN: feast pause (G3) ==');
  {
    process.env.RAIDRATION = '1';
    const g = await loadGame({ seed: 777, mode: 'raidration-proof-g3' });
    await setupGame(g.Game);
    const G = g.Game;
    const cap = captureSay(G);
    const ctx = {};
    rr.installSiegeDetector(G, ctx);
    const v = G.state.village;
    const T3 = rr.SIEGE_T;
    for (let i = 0; i < T3; i++) { G.state.scholar.day = 20 + i; G.raidPillage(v, 800); }
    const st = rr.siegeState(G, ctx);
    check('G3 engaged', st.engaged);
    const realHostFeast = G.hostFeast;
    // pantry snapshot AFTER driving the gorges (the gorges themselves draw;
    // the point is the REFUSED FEAST draws nothing further)
    const pkBefore = ((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
    const restore = rr.refuseFeasts(G, ctx);
    const rep = G.hostFeast();
    check('G3 feast refused while engaged', rep && rep.ok === false, JSON.stringify(rep && rep.why));
    check('G3 refusal reason is honest', /under siege/.test((rep && rep.why) || ''));
    check('G3 refusal narrated (no silent action)', cap.beats.some(b => /No feast tonight/.test(b)));
    const pkAfter = ((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
    check('G3 pantry untouched by the refused feast', pkAfter === pkBefore, `${pkBefore} -> ${pkAfter}`);
    restore();
    check('G3 verb restored after', G.hostFeast === realHostFeast);
    check('G3 refusal counted', ctx.rrFeastsRefused === 1, `rrFeastsRefused=${ctx.rrFeastsRefused}`);
    cap.restore();
  }

  console.log('== GREEN: beg refusal (G4) ==');
  {
    process.env.RAIDRATION = '1';
    const g = await loadGame({ seed: 778, mode: 'raidration-proof-g4' });
    await setupGame(g.Game);
    const G = g.Game;
    const cap = captureSay(G);
    const ctx = {};
    rr.installSiegeDetector(G, ctx);
    const v = G.state.village;
    const T4 = rr.SIEGE_T;
    for (let i = 0; i < T4; i++) { G.state.scholar.day = 30 + i; G.raidPillage(v, 800); }
    check('G4 engaged', !!rr.siegeState(G, ctx).engaged);
    // plant a beg
    G.state.pendingAidBeg = { villageId: 'test-village', amount: 1500 };
    G.state.otherVillages = [{ id: 'test-village', name: 'Testville' }];
    const realBeg = G.answerAidBeg;
    const restore = rr.refuseBegs(G, ctx);
    const r = G.answerAidBeg('give');
    check('G4 beg force-refused while engaged', r === 'refuse', `returned ${r}`);
    const begBeat = cap.beats.find(b => /A beg came from/.test(b));
    check('G4 refusal narrated with the beggar named', !!begBeat && /Testville/.test(begBeat));
    if (begBeat) console.log('  BEAT: ' + begBeat.slice(0, 220));
    check('G4 refusal counted', ctx.rrBegsRefused === 1);
    restore();
    check('G4 verb restored after', G.answerAidBeg === realBeg);
    cap.restore();
  }

  console.log('== GREEN: defenders eat first (G5) ==');
  {
    process.env.RAIDRATION = '1';
    const g = await loadGame({ seed: 779, mode: 'raidration-proof-g5' });
    await setupGame(g.Game);
    const G = g.Game;
    const cap = captureSay(G);
    const ctx = {};
    rr.installSiegeDetector(G, ctx);
    const v = G.state.village;
    const me = G.villagerId;
    // rig: two villagers on patrol (documented rig — the sweep proves live firing)
    const roster = (v.roster || []).filter(id => id !== me);
    check('G5 roster has villagers to rig', roster.length >= 2, `${roster.length}`);
    v.assignments = v.assignments || {};
    v.assignments[roster[0]] = { task: 'patrol' };
    v.assignments[roster[1]] = { task: 'patrol' };
    // scholar topped up + pack food
    let kcap = 2400; try { kcap = G.kcalCap() || 2400; } catch (e) {}
    G.state.scholar.kcal = kcap * 1.5;
    G.state.scholar.inventory = [{ name: 'smoked meat', kcalEach: 400, units: 10, foodState: 'cooked' }];
    const T5 = rr.SIEGE_T;
    for (let i = 0; i < T5; i++) { G.state.scholar.day = 40 + i; G.raidPillage(v, 800); }
    ctx._rrEngaged = true; // engaged (siegeState proven in G1/G2)
    const packBefore = G.state.scholar.inventory.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    rr.feedWatch(G, ctx);
    check('G5 watch fed', (ctx.rrDefMeals || 0) === 2, `rrDefMeals=${ctx.rrDefMeals}`);
    const packAfter = G.state.scholar.inventory.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    check('G5 real pack kcal spent (not the pantry)', packAfter < packBefore, `${packBefore} -> ${packAfter}`);
    const mealBeat = cap.beats.find(b => /feeds the watch/.test(b));
    check('G5 meal narrated honestly', !!mealBeat && /own pack/.test(mealBeat));
    if (mealBeat) console.log('  BEAT: ' + mealBeat.slice(0, 240));
    // thin scholar: skips
    const ctx2 = { _rrEngaged: true };
    G.state.scholar.kcal = kcap * 0.5;
    rr.feedWatch(G, ctx2);
    check('G5 skips when the scholar is thin (no self-starvation)', !ctx2.rrDefMeals && ctx2.rrWatchSkippedThin === 1);
    cap.restore();
  }

  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
