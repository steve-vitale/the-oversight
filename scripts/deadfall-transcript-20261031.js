#!/usr/bin/env node
// deadfall-transcript-20261031.js — sense-test probe for sim-deadfall-b.
// Runs one seed, prototype staffing ON, 60d, capturing Game.say lines:
// counts deadfall duty lines per day, refusal lines per villager+task
// per day, and prints sample deadfall lines + dry-fight lines for the
// evidence file's sense test. Writes NOTHING into the repo (stdout only).
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
//        FULLSEAT=1 AMMODIAG=1 SUPPLYDIAG=1 STICKFIBERDIAG=1 DEADFALL_B=1
//        node scripts/deadfall-transcript-20261031.js [seed] [days]
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const DF = require(path.join(REPO, 'scripts', 'policies', 'deadfall-b'));

const seed = parseInt(process.argv[2] || '85101', 10);
const days = parseInt(process.argv[3] || '60', 10);

(async () => {
  let policy = FD.withFullseatDiag(SD.withSeatDrive(WD.withWinDefer(TF.leadfeast, 'lead-windefer', 'x'), 'lead-seatdrive', 'y'), 'lead-fullseat', 'z');
  policy = DF.withDeadfall(policy, 'lead-deadfall', 'w');
  const { Game } = await loadGame({ seed, mode: 'deadfall-transcript', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = (m) => { try { lines.push({ day: (Game.state.scholar || {}).day || 0, text: String(m) }); } catch (e) {} try { return origSay(m); } catch (e) { return m; } };
  const wrapped = Object.assign({}, policy, { daily(Gm, ctx) { return policy.daily(Gm, ctx); } });
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days, manifest: undefined, sampleEvery: 30 }); });
  Game.say = origSay;
  const dead = lines.filter(l => l.text.includes('deadfall'));
  const perDay = {};
  for (const l of dead) perDay[l.day] = (perDay[l.day] || 0) + 1;
  const maxPerDay = Math.max(0, ...Object.values(perDay));
  const refusals = lines.filter(l => /Trust too low|Why should I listen|haven't earned that|Ask someone who trusts/.test(l.text));
  const refPerKey = {};
  for (const l of refusals) { const k = l.day + '|' + l.text.slice(0, 60); refPerKey[k] = (refPerKey[k] || 0) + 1; }
  const maxRef = Math.max(0, ...Object.values(refPerKey));
  console.log(JSON.stringify({
    seed, days: result.days, gameDays: (Game.state.scholar || {}).day || 0,
    sayLines: lines.length, deadfallLines: dead.length, deadfallDays: Object.keys(perDay).length,
    deadfallMaxPerDay: maxPerDay, refusalLines: refusals.length, refusalMaxPerKey: maxRef,
    deadfallHauls: Game._deadfallHauls || 0, deadfallSticks: Game._deadfallSticks || 0, deadfallFiber: Game._deadfallFiber || 0,
  }, null, 1));
  console.log('--- sample deadfall lines (first 8) ---');
  for (const l of dead.slice(0, 8)) console.log(`d${l.day}: ${l.text}`);
  console.log('--- sample refusal lines (first 5) ---');
  for (const l of refusals.slice(0, 5)) console.log(`d${l.day}: ${l.text}`);
  console.log('--- dry-fight / no-arrows lines (first 5) ---');
  for (const l of lines.filter(x => /no arrows|drawn, useless|no bolts/.test(x.text)).slice(0, 5)) console.log(`d${l.day}: ${l.text}`);
})().catch(e => { console.error(e && e.stack); process.exit(1); });
