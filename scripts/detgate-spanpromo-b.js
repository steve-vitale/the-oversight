#!/usr/bin/env node
// detgate-spanpromo-b.js — instrument-neutrality leg for sim-spanpromo-b.
// Runs the competent-nofeast policy for the same 100d-max death-aware
// horizon twice, in SEPARATE processes (never two harnesses in one
// process): DETGATE_MODE=off installs NO captures; DETGATE_MODE=on
// installs the census instrument stack exactly as
// scripts/sweep-spandraw-census-b.js installs it (inflow, spoilvol,
// driedpath, stockdoors, raiddor, mealdraw, nest logger). Prints one
// JSON summary line. The leg passes iff the off/on summaries are
// identical except ms. DIAG/measurement ONLY: zero src/js changes.
// Env (asserted FATAL, same substrate as the census sweep):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   FEASTSCALE_R13 unset or 0, SEED=<one seed>, DAYS=100.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installInflowCapture } = require('./inflow-capture');
const { installMealDrawCapture } = require('./mealdraw-capture');
const { installSpoilvolCapture, snapshotAll } = require('./spoilvol-capture');
const { installDriedpathCapture } = require('./driedpath-capture');
const { installStockdoorsCapture, installRaiddorCapture } = require('./stockdoors-capture-raidcallers');

if (process.env.FEASTSCALE_R13 === '1') { console.error('FATAL: FEASTSCALE_R13=1 forbidden'); process.exit(2); }
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 required'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 required'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 required'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 required'); process.exit(2); }
const MODE = process.env.DETGATE_MODE || 'off';
if (MODE !== 'off' && MODE !== 'on') { console.error('FATAL: DETGATE_MODE must be off|on'); process.exit(2); }
const SEED = parseInt(process.env.SEED || '10012', 10);
const DAYS = parseInt(process.env.DAYS || '100', 10);

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'spanpromo-detgate-' + MODE, fullTelemetry: false });
  let stockdoors = null;
  const nestEvents = [];
  if (MODE === 'on') {
    installInflowCapture(Game, { inflowCap: 50000 });
    installSpoilvolCapture(Game);
    installDriedpathCapture(Game);
    stockdoors = installStockdoorsCapture(Game);
    installRaiddorCapture(Game);
    installMealDrawCapture(Game, { mealdrawCap: 50000 });
    // Nest logger, copied in install order from sweep-spandraw-census-b.js:
    // AFTER all captures, so span entry precedes the stockdoors
    // pre-snapshot and span exit follows its record push.
    let nestEvt = 0, nestDepth = 0;
    const nestDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
    const origUse = Game.useAbility;
    if (typeof origUse === 'function' && !origUse.__cultnestInstalled) {
      const wrapped = function (...args) {
        const depth = nestDepth++;
        const directBefore = (() => { try { return stockdoors.directRecords.length; } catch (e) { return -1; } })();
        nestEvents.push({ evt: ++nestEvt, kind: 'spanEnter', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore });
        let ret;
        try { ret = origUse.apply(this, args); } finally {
          const directAfter = (() => { try { return stockdoors.directRecords.length; } catch (e) { return -1; } })();
          nestEvents.push({ evt: ++nestEvt, kind: 'spanExit', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore, directAfter, result: ret });
          nestDepth--;
        }
        return ret;
      };
      wrapped.__cultnestInstalled = true;
      Game.useAbility = wrapped;
    }
    const origDraw = Game.pantryDraw;
    if (typeof origDraw === 'function' && !origDraw.__cultnestInstalled) {
      const wrappedD = function (...args) {
        const want = args[1];
        nestEvents.push({ evt: ++nestEvt, kind: 'drawEnter', day: nestDay(), want: (want == null ? null : Math.round(want)), frames: [] });
        const ret = origDraw.apply(this, args);
        try {
          const items = [];
          for (const d of (ret.items || [])) {
            const it = d.item || {};
            items.push({ name: (it.name == null ? null : String(it.name)), kcalEach: (it.kcalEach || 0), units: (d.units || 0), spoilDay: (it.spoilDay == null ? null : it.spoilDay) });
          }
          nestEvents.push({ evt: ++nestEvt, kind: 'drawExit', day: nestDay(), want: (want == null ? null : Math.round(want)), taken: Math.round(ret.taken || 0), items });
        } catch (e) {}
        return ret;
      };
      wrappedD.__cultnestInstalled = true;
      Game.pantryDraw = wrappedD;
    }
  }
  const deaths = [];
  const deathSeen = new Set();
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!deathSeen.has(key)) { deathSeen.add(key); deaths.push({ day, who: who.slice(0, 24), kind, cause }); }
      }
    } catch (e) {}
  };
  await setupGame(Game);
  const result = await runDays(Game, competent, { days: DAYS, manifest: null });
  const deathCauses = {};
  for (const d of deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const summary = { mode: MODE, seed: SEED, daysAlive: result.days, endReason: result.endReason,
    rank, national: /national|global/i.test(rank) || !!((Game.state || {}).nationalLive),
    table: !!Game.won, win: !!Game.won, waveReach,
    deaths: deaths.length, deathCauses, nestEvents: nestEvents.length };
  console.log(JSON.stringify(summary));
})().catch(e => { console.error('DETGATE CRASH', e); process.exit(2); });
