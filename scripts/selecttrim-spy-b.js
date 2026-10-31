#!/usr/bin/env node
// selecttrim-spy-b.js — identification run for sim-selecttrim-a
// (NOT a judged leg). Same control stack as the ticks-b driver
// (pressb over woodwarm over woodcarry over strandfix-OFF over
// nighttravel), seed 15215 only, both WOODWARM legs. Wraps the
// engine movement/forage verbs (doAction, travelTo, microMove,
// eat) with spies that record position + dayTicks before/after
// each call plus the first policies/ frame on the stack, so the
// arm can identify WHICH competent beat moves the villager
// from the west corner (0,0) to the east patch (8,0) on strand
// days, and what each beat costs. The spies are pure recorders:
// they call the original verb with identical args and `this`,
// draw no RNG, and edit no state. Output: one JSON per leg
// under evidence/2026-10-31/sim-selecttrim-a-spy-<guard|on>/.
// Env (same substrate gates as ticks-b):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" WOODCARRY="1" WOODWARM="0"|"1"
//   PRESSB="1" STRANDFIX="0" SEEDS=15215 DAYS=16
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withPressb, newStore: newPbStore } = require('./policies/pressb-diag');
const { withStrandfix, newStore: newSfStore } = require('./policies/strandfix-ticks-diag');

for (const [k, v] of [['COMPETENT_FEAST', '0'], ['SEATDRIVE', '0'], ['PLENTYDEPRI', '0'], ['DEPOSITGATE', '1'], ['WOODCARRY', '1'], ['PRESSB', '1'], ['STRANDFIX', '0']]) {
  if (process.env[k] !== v) { console.error('FATAL: ' + k + ' must be ' + v); process.exit(2); }
}
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be 0 or 1'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '16', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-31', 'sim-selecttrim-a-spy-' + (process.env.WOODWARM === '1' ? 'on' : 'guard'));

function snap(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return { mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    tile, dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
    kcal: Math.round(sch.kcal || 0), inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven) };
}

function beatOf(stack) {
  if (!stack) return null;
  for (const line of String(stack).split('\n')) {
    if (line.indexOf('policies/') === -1 || line.indexOf('.js:') === -1) continue;
    if (line.indexOf('selecttrim-spy-b.js') !== -1) continue;
    const fnMatch = line.match(/at ([A-Za-z0-9_.$<>]+)/);
    const fileMatch = line.match(/policies\/([A-Za-z0-9_.-]+)\.js:(\d+)/);
    if (fileMatch) return { fn: fnMatch ? fnMatch[1] : null, file: fileMatch[1], line: parseInt(fileMatch[2], 10) };
  }
  return null;
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  await setupGame(Game);
  let callIdx = 0;
  let curDay = 0;
  const calls = [];
  const days = [];
  const spy = (name, orig) => function (...args) {
    const before = snap(Game);
    const st = new Error().stack;
    let ret = null, err = null;
    try { ret = orig.apply(Game, args); } catch (e) { err = String((e && e.message) || e).slice(0, 160); }
    const after = snap(Game);
    const moved = before.mx !== after.mx || before.my !== after.my || before.mapPx !== after.mapPx || before.mapPy !== after.mapPy;
    const spent = (after.dayTicks || 0) - (before.dayTicks || 0);
    // Record every travelTo/doAction on strand-window days, and
    // every position-changing or tick-spending call anywhere.
    if ((curDay >= 7 && curDay <= 14 && (name === 'doAction' || name === 'travelTo')) || moved || spent !== 0) {
      calls.push({ loopDay: curDay, verb: name,
        args: args.map((a) => (typeof a === 'object' ? JSON.stringify(a).slice(0, 120) : String(a).slice(0, 120))),
        before, after, spent, moved, beat: beatOf(st), err });
    }
    if (err) throw new Error(err);
    return ret;
  };
  // Targeted verb spy: the 4 movement verbs plus every
  // tick-spending verb competent.daily can reach (talk, teach,
  // craft, assign, donate, sow, trap, enter/exit, equip). A
  // generic wrap of all Game functions hung (hot engine paths),
  // so the surface is enumerated, not blanket-wrapped.
  for (const name of ['doAction', 'travelTo', 'microMove', 'eat',
    'talkTo', 'endConvo', 'craft', 'assignTask', 'channelSentiment',
    'teachPlant', 'donateToPantry', 'sowPlot', 'setTrap',
    'enterBuilding', 'exitBuilding', 'equip', 'unequip',
    'takeFromPantry', 'askAbout', 'chooseAbility', 'giveFood',
    'cutTree', 'clearBrush', 'buildBridge']) {
    try { if (typeof Game[name] === 'function') Game[name] = spy(name, Game[name]); } catch (e) {}
  }
  const wcStore = newStore();
  const wwStore = newWwStore();
  const pbStore = newPbStore();
  const sfStore = newSfStore();
  const base = withWoodcarry(withStrandfix(nighttravel, sfStore), wcStore);
  const warmed = withWoodwarm(base, wwStore);
  const dayPolicy = withPressb(warmed, pbStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      curDay = callIdx;
      const morning = snap(Game2);
      dayPolicy.daily(Game2, ctx);
      const evening = snap(Game2);
      days.push({ loopDay: callIdx, morning, evening,
        pressbAttempt: (pbStore.attempts || []).find((a) => a.loopDay === callIdx) || null,
        pressbSkip: (pbStore.skips || []).find((s) => s.loopDay === callIdx) || null,
        woodcarry: ctx._wcLast || null, warmth: ctx._wwLast || null,
        ntOutcome: (ctx._ntLast || {}).outcome || null });
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return { seed, woodwarm: process.env.WOODWARM, daysAlive: result.days, endReason: result.endReason,
    maxWaveUnlocked: result.maxWaveUnlocked, days, calls,
    pressbAttempts: pbStore.attempts, pressbSkips: pbStore.skips, sfErrs: sfStore.errs };
}

(async () => {
  const inst = await oneInstance(15215);
  fs.mkdirSync(OUTDIR, { recursive: true });
  const file = path.join(OUTDIR, 'selecttrim-spy-nighttravel-s15215.json');
  fs.writeFileSync(file, JSON.stringify(inst, null, 1));
  console.log('wrote ' + file + ' days=' + inst.days.length + ' calls=' + inst.calls.length +
    ' pressAttempts=' + inst.pressbAttempts.length);
})().catch((e) => { console.error('SPY CRASH', e && (e.stack || e)); process.exit(2); });
