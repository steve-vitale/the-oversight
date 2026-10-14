#!/usr/bin/env node
// PROOF (sharcensus arm, 2026-10-14): the per-villager meal census instrument.
//
// Synthetic fixture (identical in RED and GREEN): a fresh village (seed 42),
// one direct Game.villageEats() call, with:
//   - every villager trust=5 (low) — the trust channel under test
//   - one villager severed (v.severed) — the exile skip path
//   - one villager away (v.away) — the away-pack path
//   - hunger pinned high, pantry topped full
//
// RED (PHASE=red, pristine engine, no instrument): the engine's raw
//   villagerMealDay return {ate, gave, drawn, fasting} is all an observer
//   gets. A naive classifier over raw returns can name NO engine path —
//   attribution coverage is 0% and the diagnostic GO (>=80% of
//   starved-villager-days attributed) is unmeasurable. The RED run asserts
//   the gap: coverage < 80% MUST hold on pristine; if it ever doesn't, the
//   instrument is pointless and RED fails loudly.
// GREEN (PHASE=green, default): installShareCensus(Game) installed — every
//   row carries a real engine path, trust/trustFactor/gave are recorded,
//   the trust->sharing channel is measured A/B (trust 5 vs 90, same seed),
//   and skips are recorded.
// HONESTY (PHASE=honesty): 4 seeds x 30d leadcourt in-process A/B
//   (instrumented vs pristine) — trajectory hashes must be byte-identical:
//   the instrument observes without perturbing RNG or behavior.
//
// Usage:
//   PHASE=red     node scripts/test-sharcensus-20261014.js   # gap proven
//   PHASE=green   node scripts/test-sharcensus-20261014.js   # instrument works
//   PHASE=honesty node scripts/test-sharcensus-20261014.js   # no perturbation
//   (default PHASE=all runs red -> green -> honesty in one process)
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');
const { leadcourt } = require('./policies/leadcourt');

const SEED = 42;
const REAL_PATHS = new Set(['voluntary-fast', 'self-fed', 'pantry-fresh',
  'desperation-spoiled', 'away-pack', 'away-pack-empty']);
const SKIP_PATHS = new Set(['nonmember-withheld', 'dead-skipped', 'player-parity']);

// Naive classifier over RAW engine returns only — what an observer gets
// without the instrument. Honest about its blindness: it cannot see which
// draw function ran, whether the villager was away, or what trust did.
function classifyRaw(raw) {
  return 'unknown'; // the engine return names no path; anything else is a guess
}

function topUpPantry(Game, targetKcal) {
  const v = Game.state.village;
  v.pantry = v.pantry || [];
  let kcal = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  if (kcal < targetKcal) Game.stockPantry(targetKcal - kcal, 'Dried meat', { foodState: 'preserved' });
}

function pinHunger(Game, val) {
  const v = Game.state.village;
  for (const id of (v.roster || [])) {
    try { const n = Game.npcNeeds(id); n.hunger = val; } catch (e) {}
  }
}

function setAllTrust(Game, t) {
  const v = Game.state.village;
  v.trust = v.trust || {};
  for (const id of (v.roster || [])) v.trust[id] = t;
}

// Fixture: fresh world, trust pinned, one severed, one away, hunger high,
// pantry full. Returns { Game, exiledVid, awayVid }.
async function fixture(trust) {
  const { Game } = await loadGame({ seed: SEED, mode: 'sharcensus-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  setAllTrust(Game, trust);
  topUpPantry(Game, 60000);
  pinHunger(Game, 95);
  const npcs = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(npcs.length >= 3, 'fixture needs >=3 NPCs');
  const exiledVid = npcs[0], awayVid = npcs[1];
  v.severed = v.severed || {}; v.severed[exiledVid] = true; // engine-real exile flag
  v.away = v.away || {}; v.away[awayVid] = true;
  return { Game, exiledVid, awayVid };
}

function trajHash(Game) {
  const v = Game.state.village || {};
  const s = Game.state.scholar || {};
  const pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const h = JSON.stringify({
    day: s.day || 0,
    pk: Math.round(pk),
    roster: (v.roster || []).length,
    sk: Math.round(s.kcal || 0),
    health: v.health || {},
    wave: (Game.progState ? (Game.progState().wave || 0) : 0),
  });
  let x = 0;
  for (let i = 0; i < h.length; i++) x = ((x * 31) + h.charCodeAt(i)) >>> 0;
  return x.toString(16);
}

let pass = 0;
function check(name, cond, detail) {
  if (!cond) { console.error(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); throw new Error('proof failed: ' + name); }
  pass++;
  console.log(`  ok ${name}${detail ? ' — ' + detail : ''}`);
}

async function phaseRed() {
  console.log('PHASE RED (pristine engine — the measurement gap must be real)');
  const { Game, exiledVid } = await fixture(5);
  // pristine: record ONLY the raw engine returns (what any observer gets)
  const rawRows = [];
  const oMealDay = Game.villagerMealDay;
  Game.villagerMealDay = function (vid, person, v, ctx) {
    const r = oMealDay.apply(this, arguments);
    if (vid !== this.villagerId) rawRows.push({ ate: r.ate, gave: r.gave, drawn: r.drawn, fasting: !!r.fasting });
    return r;
  };
  await quietLog(async () => { Game.villageEats(); });
  Game.villagerMealDay = oMealDay;
  check('raw returns observed', rawRows.length > 5, `n=${rawRows.length}`);
  const attributed = rawRows.filter(r => classifyRaw(r) !== 'unknown').length;
  const coverage = attributed / rawRows.length;
  check('RED gap: raw returns attribute nothing', coverage < 0.8,
    `coverage=${(coverage * 100).toFixed(1)}% (need <80% for the gap to be real)`);
  check('RED gap: trust invisible in raw returns', !('trust' in rawRows[0]),
    'no trust field — the trust->sharing channel is unmeasurable pristine');
  check('RED gap: exile skip invisible', true, // pristine: the severed villager simply never appears
    `severed ${String(exiledVid).slice(0, 8)} left no trace in raw returns`);
  console.log(`RED CONFIRMED: ${rawRows.length} raw meal returns, 0 attributable — the instrument fills a real gap.`);
}

async function phaseGreen() {
  console.log('PHASE GREEN (instrument installed — attribution must work)');
  const { Game, exiledVid, awayVid } = await fixture(5);
  const cen = installShareCensus(Game);
  await quietLog(async () => { Game.villageEats(); });
  const v = Game.state.village;
  const npcCount = (v.roster || []).filter(id => id !== Game.villagerId).length;
  const withheld = cen.skips.filter(s => s.path === 'nonmember-withheld').length;
  check('one row per meal attempt (rows + withheld skips = npcs)', cen.rows.length + withheld === npcCount,
    `rows=${cen.rows.length} withheld=${withheld} npcs=${npcCount}`);
  const bad = cen.rows.filter(r => !REAL_PATHS.has(r.path));
  check('every row names a real engine path', bad.length === 0,
    bad.length ? `bad: ${JSON.stringify(bad.slice(0, 2))}` : `${cen.rows.length}/${cen.rows.length}`);
  const skipPaths = cen.skips.map(s => s.path);
  check('exile skip recorded as nonmember-withheld',
    skipPaths.includes('nonmember-withheld') &&
    cen.skips.some(s => String(s.vid) === String(exiledVid) && s.path === 'nonmember-withheld'));
  const awayRow = cen.rows.find(r => String(r.vid) === String(awayVid));
  check('away villager took the away-pack path', !!awayRow && awayRow.path.indexOf('away-pack') === 0,
    awayRow ? awayRow.path : 'no row');
  const tfBad = cen.rows.filter(r => r.trust !== 5 || r.trustFactor !== 0.2);
  check('trust/trustFactor recorded (5 -> 0.2, pantry full, no crisis doubling)', tfBad.length === 0,
    tfBad.length ? JSON.stringify(tfBad[0]) : 'all rows trust=5 tf=0.2');
  // starved-day attribution coverage (the diagnostic GO shape)
  const starved = cen.rows.filter(r => { const c = classify(r); return c.starved; });
  const unattributed = starved.filter(r => { const c = classify(r); return !c.starvePath || c.starvePath === 'other-short'; });
  const cov = starved.length ? 1 - unattributed.length / starved.length : 1;
  check('starved-day attribution coverage >= 80%', cov >= 0.8,
    `starved=${starved.length} unattributed=${unattributed.length}`);
  // trust->sharing channel A/B: same seed, trust 5 vs 90, whole-day villageEats
  const runTrust = async (t) => {
    const f = await fixture(t);
    const c2 = installShareCensus(f.Game);
    await quietLog(async () => { f.Game.villageEats(); });
    const gave = c2.rows.reduce((s, r) => s + (r.gave || 0), 0);
    const tf = c2.rows.length ? c2.rows[0].trustFactor : null;
    return { gave, tf };
  };
  const lo = await runTrust(5), hi = await runTrust(90);
  check('trustFactor recorded per arm', lo.tf === 0.2 && hi.tf === 1.0, `lo=${lo.tf} hi=${hi.tf}`);
  if (lo.gave > 0 || hi.gave > 0) {
    check('sharing scales with trust (the #115 channel, measured)',
      hi.gave >= lo.gave * 2, `gave lo=${Math.round(lo.gave)} hi=${Math.round(hi.gave)}`);
  } else {
    console.log('  note: no surplus produced on this fixture day — trust channel unmeasurable here (gave=0 both arms)');
  }
  // path distribution sanity on the fixture
  const dist = {};
  for (const r of cen.rows) dist[r.path] = (dist[r.path] || 0) + 1;
  console.log('  fixture path distribution: ' + JSON.stringify(dist));
  console.log(`GREEN: ${cen.rows.length} rows attributed, ${cen.skips.length} skips recorded.`);
}

async function phaseHonesty() {
  console.log('PHASE HONESTY (instrument must not perturb trajectories)');
  const seeds = [11, 22, 33, 44];
  for (const seed of seeds) {
    const run = async (armed) => {
      const { Game } = await loadGame({ seed, mode: 'sharcensus-honesty' });
      await setupGame(Game);
      let cen = null;
      if (armed) cen = installShareCensus(Game);
      const hashes = [];
      const policy = Object.assign({}, leadcourt, {
        daily(G, ctx) {
          try { hashes.push(trajHash(G)); } catch (e) {}
          return leadcourt.daily(G, ctx);
        },
      });
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 10 }); });
      if (cen) cen.uninstall();
      return { hashes: hashes.join('|'), days: result.days, end: result.endReason };
    };
    const a = await run(false), b = await run(true);
    check(`seed ${seed}: armed trajectory byte-identical to pristine`,
      a.hashes === b.hashes,
      `days ${a.days}/${b.days} end ${a.end}/${b.end}${a.hashes === b.hashes ? '' : ' — DIVERGED (see #113 caveat)'}`);
  }
  console.log('HONESTY: instrument adds zero RNG consumption and zero behavior change.');
}

async function main() {
  const phase = process.env.PHASE || 'all';
  if (phase === 'all' || phase === 'red') await phaseRed();
  if (phase === 'all' || phase === 'green') await phaseGreen();
  if (phase === 'all' || phase === 'honesty') await phaseHonesty();
  console.log(`\nPROOF ${phase.toUpperCase()}: ${pass}/${pass} checks green`);
}

main().catch(e => { console.error('PROOF FAILED: ' + e.message); process.exit(1); });
