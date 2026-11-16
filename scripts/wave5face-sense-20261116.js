// wave5face-sense-20261116.js — supplementary sense leg (NOT a judged
// corpus). The pilot's say tap is on Game.say; the System voice speaks
// through Game.sysSay, which the harness silences by default
// (sim-harness.js:239-251). This leg re-runs ONE released seed (via SEED
// env, default 102706 — the d151 release) with
// loadGame({captureSysSay}) and verifies the trajectory is identical to
// the ON corpus (same daily gated/raw/living/w5facedCount) before
// trusting the lines. It writes the wave-5 facing sysSay lines (the
// Producers unlock beat, departure/return/fight lines around the first
// facing) for the SENSE-TESTING LAW read.
// Usage: SEED=102706 DAYS=200 node scripts/wave5face-sense-20261116.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const DRIVER = require(path.join(REPO, 'scripts', 'wave5face-driver-20261116'));

const SEED = parseInt(process.env.SEED || '102706', 10);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const RE = /Producer|fifth draft|wave 5|Cancellation|Editor|Rerun|Spoiler|Timeslot|Nielsen|Finale|Network Note|Standing \d|HELD|blood your fighters|next act|RATINGS ARE UP/;

(async function () {
  const cap = [];
  const { Game } = await loadGame({ seed: SEED, mode: 'competent-wave5face-b-sense', fullTelemetry: false, captureSysSay: cap });
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
          try {
            trace.push({ day: d, gated: Game.villageStandingTotal(), raw: Game.villageStanding().total, living: (function () { try { return ((Game.state.village || {}).roster || []).length; } catch (e) { return null; } })(), w5facedCount: DRIVER.w5FacedCountOf(Game) });
          } catch (e) {}
        }
      }
    },
  });
  await quietLog(async function () { await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { const d = gday(Game); trace.push({ day: d, gated: Game.villageStandingTotal(), raw: Game.villageStanding().total, w5facedCount: DRIVER.w5FacedCountOf(Game) }); } catch (e) {}
  // Trajectory identity check vs the ON corpus file.
  const pilot = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-16', 'perseed-wave5face-b-on', 'wave5face-b-s' + SEED + '-wave5face-b-on.json'), 'utf8'));
  const pilotTrace = (pilot.daily || []).map(function (s) { return { day: s.day, gated: s.gated, raw: s.standing ? s.standing.total : null, living: s.living, w5facedCount: s.w5facedCount }; });
  const pilotByDay = {};
  pilotTrace.forEach(function (x) { pilotByDay[x.day] = x; });
  let diffs = 0;
  const identical = trace.every(function (x) {
    const y = pilotByDay[x.day];
    if (!y) return true;
    const ok = y.gated === x.gated && y.raw === x.raw && y.w5facedCount === x.w5facedCount;
    if (!ok) diffs++;
    return ok;
  }) && trace.length >= pilotTrace.length - 1;
  const lines = cap.filter(function (t) { return RE.test(t); });
  const out = {
    seed: SEED, days: DAYS, anchorCommit: pilot.anchorCommit,
    trajectoryIdenticalToPilot: identical, identityDiffs: diffs, traceDays: trace.length, pilotDays: pilotTrace.length,
    trace: trace, pilotTrace: pilotTrace,
    engagements: pilot.engagements || [],
    sysSayTotal: cap.length, facingLines: lines,
    note: 'sysSay capture has no day stamps; lines are in call order. Identity covers gated/raw/w5facedCount per common day (living excluded: roster length is not the living count).',
  };
  const file = path.join(REPO, 'evidence', '2026-11-16', 'perseed-wave5face-b-on', 'wave5face-b-s' + SEED + '-sense.json');
  if (fs.existsSync(file)) { console.error('WAVE5FACE SENSE STOP: refusing to overwrite ' + file); process.exit(3); }
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ seed: SEED, identical: identical, diffs: diffs, sysSayTotal: cap.length, facingLines: lines.length, file: path.relative(REPO, file) }));
  for (const l of lines) console.log('SYS: ' + l.slice(0, 300));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
