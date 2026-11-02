#!/usr/bin/env node
// locatedengage-probe-20261102.js — NON-JUDGED probe for one open
// mechanism question from sim-locatedengage-a (NOT part of the judged
// corpus, NOT read by scripts/test-locatedengage-a.js): on seed 97301,
// the herald sits at (5,4) at the day-73 post-daily trace and at (4,4)
// at the day-74 pre-daily trace, with detail coords UNCHANGED (4,8) —
// which rules out wanderWorldMonsters (it re-rolls mx,my) — and the
// scholar sits at (1,8) at the day-74 post-daily trace and at (4,4)
// at the day-75 pre-daily trace. Both moves happen across a
// sleep/dawn boundary. This probe brackets Game.sleep with herald-list
// + scholar-tile snapshots (days 70-80 only) and logs every
// spawnWorldMonster / removeWorldMonster call for id 'herald', to name
// the call that moves or (re)creates the herald on the haven tile.
// READ-ONLY logging: no RNG consumed, no game state written.
// Usage (same frozen stack/env as the judged replay):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97301 node scripts/locatedengage-probe-20261102.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'x');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'x');
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackTop3() {
  try {
    return (new Error('probe-stack').stack || '').split('\n').slice(2, 5).map(function (line) {
      const m = /at ([^\s(]+)/.exec(line);
      return m ? m[1] : line.trim();
    });
  } catch (e) { return []; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  function heralds() {
    try {
      return Game.worldMonsters().filter(function (m) { return m && m.id === 'herald'; })
        .map(function (m) { return '(' + m.tx + ',' + m.ty + ') d(' + m.mx + ',' + m.my + ') st=' + (m.stance || '-'); });
    } catch (e) { return ['ERR']; }
  }
  function scholarTile() { try { return '(' + Game.map.px + ',' + Game.map.py + ')'; } catch (e) { return '(?)'; } }
  function inWindow() { const d = gday(Game); return d >= 70 && d <= 80; }

  const probeLines = [];
  const origSleep = Game.sleep;
  Game.sleep = function () {
    const pre = { day: gday(Game), sch: scholarTile(), h: heralds() };
    const r = origSleep.apply(this, arguments);
    if (pre.day >= 70 && pre.day <= 80) {
      probeLines.push('PROBE sleep day=' + pre.day + ' scholar ' + pre.sch + '->' + scholarTile() + ' heralds ' + JSON.stringify(pre.h) + '->' + JSON.stringify(heralds()));
    }
    return r;
  };
  const origSpawn = Game.spawnWorldMonster;
  Game.spawnWorldMonster = function (mdef, tx, ty) {
    const r = origSpawn.apply(this, arguments);
    try {
      const id = (typeof mdef === 'string') ? mdef : (mdef && mdef.id);
      if (id === 'herald' && inWindow()) probeLines.push('PROBE spawn herald day=' + gday(Game) + ' at (' + tx + ',' + ty + ') scholar=' + scholarTile() + ' stack=' + JSON.stringify(stackTop3()));
    } catch (e) {}
    return r;
  };
  const origRemove = Game.removeWorldMonster;
  Game.removeWorldMonster = function (m) {
    try {
      if (m && m.id === 'herald' && inWindow()) probeLines.push('PROBE remove herald day=' + gday(Game) + ' at (' + m.tx + ',' + m.ty + ') scholar=' + scholarTile() + ' stack=' + JSON.stringify(stackTop3()));
    } catch (e) {}
    return origRemove.apply(this, arguments);
  };
  const origTT = Game.travelTo;
  Game.travelTo = function (x, y) {
    const before = scholarTile(), hb = heralds();
    const r = origTT.apply(this, arguments);
    try {
      if (inWindow()) {
        const ha = heralds();
        if (JSON.stringify(hb) !== JSON.stringify(ha)) probeLines.push('PROBE travel CHANGED herald day=' + gday(Game) + ' ' + before + '->(' + x + ',' + y + ') scholar=' + scholarTile() + ' heralds ' + JSON.stringify(hb) + '->' + JSON.stringify(ha) + ' stack=' + JSON.stringify(stackTop3()));
      }
    } catch (e) {}
    return r;
  };

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  for (const line of probeLines) console.log(line);
  console.log('PROBE done s' + seed + ': attempts=' + JSON.stringify(att.map(function (a) { return a.day + '/' + a.cls; })) + ' endDay=' + ((Game.state || {}).scholar || {}).day);
}

(async () => {
  if (!SEEDS.length) { console.error('PROBE STOP: SEEDS env required.'); process.exit(2); }
  for (const seed of SEEDS) { try { await oneRun(seed); } catch (e) { console.error('PROBE ERROR s' + seed + ': ' + (e && e.message)); console.error(e && e.stack); } }
})();
