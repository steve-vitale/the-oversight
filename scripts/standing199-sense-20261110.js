// standing199-sense-20261110.js — supplementary sense leg (NOT a judged
// corpus). The pilot's say tap was on the wrong channel: the standing hold
// beat speaks through Game.sysSay, which the harness silences by default
// (sim-harness.js:239-251) — so the pilot captured 0 say lines on all 8
// seeds. This leg re-runs ONE pilot seed (170233, defer5) with
// loadGame({captureSysSay}) — narration-only capture, trajectories
// untouched by design — and verifies the trajectory is byte-identical to
// the pilot's (same daily gated/raw arrays) before trusting the lines.
// It prints/writes only the standing hold/release sysSay lines around
// the pin, for the SENSE-TESTING LAW read.
// Usage: SEED=170233 DAYS=150 node scripts/standing199-sense-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEED = parseInt(process.env.SEED || '170233', 10);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RE = /fifth draft|next act|RATINGS ARE UP|blood your fighters|Standing \d|bread counts|HELD/;

(async function () {
  const cap = [];
  const { Game } = await loadGame({ seed: SEED, mode: 'competent-standing199-sense', fullTelemetry: false, captureSysSay: cap });
  function gday(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
  await setupGame(Game);
  const trace = [];
  let lastDay = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        const d = gday(Game);
        if (d !== lastDay) {
          lastDay = d;
          try { trace.push({ day: d, gated: Game.villageStandingTotal(), raw: Game.villageStanding().total }); } catch (e) {}
        }
      }
    },
  });
  await quietLog(async function () { await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { const d = gday(Game); trace.push({ day: d, gated: Game.villageStandingTotal(), raw: Game.villageStanding().total }); } catch (e) {}
  // Trajectory identity check vs the pilot file.
  const pilot = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-10', 'perseed-standing199-a', 'standing199-s' + SEED + '-standing199-pilot.json'), 'utf8'));
  const pilotTrace = (pilot.daily || []).map(function (s) { return { day: s.day, gated: s.gated, raw: s.standing ? s.standing.total : null }; });
  // Compare on common days: the pilot's final post-run snapshot (day 151)
  // has no counterpart in the sense leg's day-change trace unless the
  // final push lands on the same day; values, not snapshot counts, are
  // the identity claim.
  const pilotByDay = {};
  pilotTrace.forEach(function (x) { pilotByDay[x.day] = x; });
  const identical = trace.every(function (x) {
    const y = pilotByDay[x.day];
    return y && y.gated === x.gated && y.raw === x.raw;
  }) && trace.length >= pilotTrace.length - 1;
  // Reconstruct days for captured sysSay lines: the capture array has no
  // day stamps, so re-derive by matching each line's first occurrence to
  // the hold-beat schedule is unreliable; instead, record lines with the
  // day they were captured via a wrapping pass is impossible post-hoc.
  // The harness capture pushes in call order; the hold beat fires at most
  // weekly from the first pin day. We report the lines in order with the
  // pin day (d55) as the anchor and note the ordering, not exact days.
  const lines = cap.filter(function (t) { return RE.test(t); });
  const out = {
    seed: SEED, days: DAYS, anchorCommit: pilot.anchorCommit,
    trajectoryIdenticalToPilot: identical, traceDays: trace.length, pilotDays: pilotTrace.length,
    trace: trace, pilotTrace: pilotTrace,
    sysSayTotal: cap.length, standingLines: lines,
    note: 'sysSay capture has no day stamps; lines are in call order. First pin day for this seed is d55 (pilot trace); the first hold beat fires on the first pin day, reminders at most weekly after.',
  };
  const file = path.join(REPO, 'evidence', '2026-11-10', 'perseed-standing199-a', 'standing199-s' + SEED + '-sense.json');
  if (fs.existsSync(file)) { console.error('STANDING199 SENSE STOP: refusing to overwrite ' + file); process.exit(3); }
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ seed: SEED, identical: identical, sysSayTotal: cap.length, standingLines: lines.length, file: path.relative(REPO, file) }));
  for (const l of lines) console.log('SYS: ' + l.slice(0, 300));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
