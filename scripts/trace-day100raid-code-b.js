#!/usr/bin/env node
// trace-day100raid-code-b.js — READ-ONLY recorder proving a code path executes.
// Wraps Game.villageAgencyDaily to log (day, pending demand before/after,
// whether the take branch fired) and Game.say to log treeline demand/take
// lines. Delegates identically, writes ONLY to the caller's arrays, no
// state writes, no RNG use. Does NOT change game behavior.
// Usage: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   node scripts/trace-day100raid-code-b.js [seed]  (default 10133)
// Prints exactly one JSON object on stdout; diagnostics on stderr.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installInflowCapture } = require('./inflow-capture');
const { installMealDrawCapture } = require('./mealdraw-capture');
const { installSpoilvolCapture } = require('./spoilvol-capture');
const { installDriedpathCapture } = require('./driedpath-capture');
const { installStockdoorsCapture, installRaiddorCapture } = require('./stockdoors-capture-raidday100');

for (const [k, v] of [['COMPETENT_FEAST', '0'], ['SEATDRIVE', '0'], ['PLENTYDEPRI', '0'], ['DEPOSITGATE', '1']]) {
  if (process.env[k] !== v) { console.error(`FATAL: ${k}=${v} must be set explicitly`); process.exit(2); }
}
if (process.env.FEASTSCALE_R13 === '1') { console.error('FATAL: FEASTSCALE_R13=1 forbidden'); process.exit(2); }
const seed = parseInt(process.argv[2] || '10133', 10);

(async () => {
  const { Game } = await loadGame({ seed, mode: process.env.REC_MODE || 'day100raid-code-b-competent-nofeast', fullTelemetry: false });
  // TRACE_FULL=1: replicate the raidday100 sweep's instrument exactly
  // (bisect control: the sweep reproduces its corpus byte-for-byte, so a
  // TRACE_FULL recorder run must reproduce the same seed's corpus too;
  // any remaining divergence is then attributable to the vad wrapper).
  let policy = competent;
  if (process.env.TRACE_FULL === '1') {
    const inflow = installInflowCapture(Game, { inflowCap: 50000 });
    const spoilvol = installSpoilvolCapture(Game);
    const driedpath = installDriedpathCapture(Game);
    const stockdoors = installStockdoorsCapture(Game);
    const raiddor = installRaiddorCapture(Game);
    void inflow; void driedpath; void stockdoors; void raiddor;
    const mealdraw = installMealDrawCapture(Game, { mealdrawCap: 50000 });
    void mealdraw;
    policy = Object.assign({}, competent, {
      daily(Game2, ctx) {
        try { competent.daily(Game2, ctx); } catch (e) {}
        try { spoilvol.snapshotPantry(); } catch (e) {}
      },
    });
    const oDie = Game.registerDeath;
    if (typeof oDie === 'function') {
      // FAITHFUL SWEEP REPLICATION (not a pure recorder): the raidday100
      // sweep's death wrapper SUPPRESSES the original registerDeath
      // (corpses.js hook: deathSeen, deed credits, corpse with
      // Math.random) and only records deaths. That suppression shifts
      // the RNG stream from the first death onward, so a plain-game
      // recorder run diverges from the sweep corpus trajectory. To
      // reproduce the corpus, TRACE_FULL replicates the suppression
      // exactly (same dedupe key, same canonCause). The plain mode
      // (no TRACE_FULL) is the pure recorder; both modes are reported.
      const deathSeen = new Set();
      const canonCause = (c) => {
        c = String(c || '?').toLowerCase();
        if (/dehydrat|thirst/.test(c)) return 'dehydration';
        return c.slice(0, 32);
      };
      Game.registerDeath = function (opts) {
        try {
          const kind = String((opts && opts.kind) || '');
          if (kind === 'person' || kind === 'villager') {
            const who = String((opts && (opts.villagerId || opts.name)) || '?');
            const day = (Game.state.scholar || {}).day || 0;
            const cause = canonCause((opts && opts.cause) || '?');
            const key = who + '|' + day + '|' + cause;
            if (!deathSeen.has(key)) { deathSeen.add(key); }
          }
        } catch (e) {}
      };
    }
  }
  const calls = [];
  const origVAD = Game.villageAgencyDaily;
  // VAD_OFF=1: bisect control — skip the vad wrapper entirely.
  if (typeof origVAD === 'function' && process.env.VAD_OFF !== '1') {
    Game.villageAgencyDaily = function (...args) {
      let before = null, after = null;
      try { const pr = this.state && this.state.pendingRaidDefense; before = pr ? (pr.day || 0) : null; } catch (e) {}
      const r = origVAD.apply(this, args);
      try { const pr = this.state && this.state.pendingRaidDefense; after = pr ? (pr.day || 0) : null; } catch (e) {}
      let day = 0;
      try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
      const takeFired = (before !== null && after === null && day > before);
      const staged = (before === null && after !== null);
      calls.push({ day, pendingBefore: before, pendingAfter: after, takeFired, staged });
      return r;
    };
  }
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try {
        const line = String(args[0] || '');
        if (/Shouts from the treeline|didn't wait/.test(line) && sayLines.length < 2000) {
          sayLines.push({ day: (Game.state.scholar || {}).day || 0, kind: /Shouts/.test(line) ? 'demand' : 'take', line: line.slice(0, 200) });
        }
      } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  await setupGame(Game);
  if (process.env.TRACE_FULL === '1') {
    // Opening-stock snapshot, as in the sweep (read-only).
    try { require('./spoilvol-capture').snapshotPantry(Game); } catch (e) {}
  }
  const result = await runDays(Game, policy, { days: 100, manifest: null });
  const day100calls = calls.filter(c => c.day === 100);
  const demandDays = sayLines.filter(l => l.kind === 'demand').map(l => l.day);
  const takeDays = sayLines.filter(l => l.kind === 'take').map(l => l.day);
  console.log(JSON.stringify({
    seed, daysAlive: result.days, endReason: result.endReason,
    vadCalls: calls.length,
    vadDayValues: [...new Set(calls.map(c => c.day))].sort((a, b) => a - b).slice(-5),
    day100calls,
    day100callCount: day100calls.length,
    takeFiredCalls: calls.filter(c => c.takeFired).map(c => ({ day: c.day, pendingBefore: c.pendingBefore })),
    demandDays, takeDays,
  }));
})().catch(e => { console.error('RECORDER CRASH', e); process.exit(2); });
