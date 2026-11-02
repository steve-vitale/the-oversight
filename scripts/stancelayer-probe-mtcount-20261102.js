#!/usr/bin/env node
// stancelayer-probe-mtcount-20261102.js — NON-JUDGED probe (same class
// as locatedengage probes): counts EVERY Game.monsterTurn call per
// scholar-day on seed 97301 (total vs herald-shared), to answer one
// question the judged corpus cannot: on days 74/75, did the wait
// phase run zero monsterTurn batches, or run them while the herald
// was not co-located? Read-only counting (no RNG, no state writes);
// milestones must reproduce the judged run (attempts 4, days 78/89,
// lair 8,4) or the probe is discarded as non-comparable.
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 required.`); process.exit(2); }
}
function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'x');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'x');
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async () => {
  const policy = policyFor();
  const { Game } = await loadGame({ seed: 97301, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const perDay = {};
  const origMT = Game.monsterTurn;
  Game.monsterTurn = function () {
    try {
      const d = gday(Game);
      const pm = (typeof Game.playerMonster === 'function') ? Game.playerMonster() : null;
      const shared = !!(pm && pm.id === 'herald' && pm.mx !== undefined);
      const tile = (Game.map ? Game.map.px + ',' + Game.map.py : '?');
      const row = (perDay[d] = perDay[d] || { total: 0, shared: 0, tiles: {} });
      row.total++;
      if (shared) row.shared++;
      row.tiles[tile] = (row.tiles[tile] || 0) + 1;
    } catch (e) {}
    return origMT.apply(this, arguments);
  };
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  console.log('probe-milestones attempts=' + att.length + ' days=' + att.map(a => a.day).join(',') +
    ' end=' + result.endReason + ' gameDays=' + (((Game.state || {}).scholar || {}).day || 0));
  for (let d = 70; d <= 91; d++) {
    const r = perDay[d] || { total: 0, shared: 0, tiles: {} };
    console.log('day ' + d + ' mtTotal=' + r.total + ' mtShared=' + r.shared + ' tiles=' + JSON.stringify(r.tiles));
  }
})();
