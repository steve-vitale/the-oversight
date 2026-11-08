// PANEL DRIVER: pellet pass, before/after on the 99767 shape (2026-11-07).
//
// One case per process (never two games in one node process). Prints one
// JSON line to stdout; the shell loop collects lines into
// evidence/2026-11-07/sim-pelletpass-panel.jsonl, and
// scripts/analyze-pellet-pass-20261107.js judges the preregged GO bar.
//
// Usage:
//   node scripts/panel-pellet-pass-20261107.js --seed 99767 --arm armed --shape hungry
//   node scripts/panel-pellet-pass-20261107.js --seed 99767 --arm baseline --shape hungry
//   node scripts/panel-pellet-pass-20261107.js --seed 99767 --arm armed --shape fed
//
// Arms: armed (the pass live) vs baseline (maybePassPellet stubbed to a
// no-op in the driver — no game-code kill switch). Shapes: hungry (6
// villagers at hunger 95..90) vs fed (all at hunger 20).
//
// Per case: phase A runs 3 dawns (Game.endDay loop) and records the dawn
// the pass fires; phase B (hungry shape) attempts the unblock chain —
// re-assert nationalLive (derived state, cleared by endDay's hierarchy
// tick on a linkless constructed state), host a feast, check the buff
// granted, drive one real fight with real strikes, check feastSurgeUsed,
// read tableSeat().
'use strict';
const K = require('./godpath/lib');
const { buildShape, driveSpend } = require('./lib/pellet-pass-shape-20261107');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] != null ? process.argv[i + 1] : def;
}

async function driveChain(G) {
  // Returns { feastGranted, feastSurgeUsed, seat } after attempting the
  // feast -> fight -> seat chain. Caller re-asserts nationalLive first.
  const out = { feastGranted: false, feastSurgeUsed: false, seat: 'none' };
  try {
    const feast = G.hostFeast();
    out.feastOk = !!(feast && feast.ok !== false);
    out.feastGranted = !!G.feastedActive();
  } catch (e) { out.feastError = String((e && e.message) || e); }
  if (out.feastGranted) {
    try {
      out.feastSurgeUsed = driveSpend(G);
    } catch (e) { out.fightError = String((e && e.message) || e); }
  }
  out.feastSurgeUsed = out.feastSurgeUsed || !!(((G.state.scholar || {}).prog || {}).feastSurgeUsed);
  try { out.seat = (G.tableSeat() || {}).seat || 'none'; } catch (e) { out.seat = 'error'; }
  return out;
}

(async () => {
  const seed = Number(arg('seed', '99767'));
  const arm = arg('arm', 'armed'); // armed | baseline
  const shape = arg('shape', 'hungry'); // hungry | fed
  const G = await K.load({ seed });
  K.newRun(G);
  if (arm === 'baseline') {
    // The trap, as today: the pass does not exist.
    G.maybePassPellet = function () { return false; };
  }
  buildShape(G, { fed: shape === 'fed' });
  const result = { seed, arm, shape, passDay: null, holderAfter: null, over: false, daysRun: 0, dayEnd: null };
  const day0 = G.state.scholar.day;
  // Phase A: 3 dawns.
  for (let d = 1; d <= 3; d++) {
    if (G.over) { result.over = true; break; }
    try { G.endDay(); } catch (e) { result.endDayError = String((e && e.message) || e); break; }
    result.daysRun = d;
    result.dayEnd = G.state.scholar.day;
    const pp = G.state.pelletPass || {};
    if (pp.lastPassDay != null && result.passDay == null) result.passDay = (pp.lastPassDay - day0) + 1;
    if (G.over) { result.over = true; break; }
  }
  const h = G.state.fusionReactorHolder;
  result.holderAfter = h ? (h.who + ':' + h.vid) : null;
  result.onlineAfter = !!G.fusionReactorOnline();
  // Phase B: the unblock chain (hungry shape only).
  if (shape === 'hungry' && !G.over) {
    G.state.nationalLive = true; // derived state: see buildShape header
    Object.assign(result, await driveChain(G));
  }
  result.dayEnd = G.state.scholar.day;
  console.log(JSON.stringify(result));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
