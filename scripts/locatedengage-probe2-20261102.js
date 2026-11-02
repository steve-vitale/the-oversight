#!/usr/bin/env node
// locatedengage-probe2-20261102.js — NON-JUDGED probe v2 (see
// locatedengage-probe-20261102.js for v1). V1 showed: sleep() itself
// does NOT move the herald on days 73/74, yet the herald sits at
// (5,4) after sleep-73 and at (4,4) before day-74's first travel —
// with detail coords preserved (4,8), ruling out wanderWorldMonsters
// (re-rolls mx,my) — and sleep() DOES move it onto (4,4) on days
// 75/77/79, again detail-preserved. V2 brackets every mid-level
// engine call that could move a world monster (tickAction, doAction,
// endDay, advancePart, npcBatchTurn, monsterTurn, resolveAssignments,
// npcNodeTravel, moveWanderer) with herald-list change detection, so
// the bracket that fires NAMES the mover (with its stack).
// READ-ONLY logging: no RNG consumed, no game state written.
// Usage (same frozen stack/env as the judged replay):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97301 node scripts/locatedengage-probe2-20261102.js
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
  if (process.env[k] !== '1') { console.error(`PROBE2 STOP: ${k}=1 is required.`); process.exit(2); }
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
    return (new Error('probe2-stack').stack || '').split('\n').slice(2, 5).map(function (line) {
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
  const lines = [];
  function heralds() {
    try {
      return Game.worldMonsters().filter(function (m) { return m && m.id === 'herald'; })
        .map(function (m) { return '(' + m.tx + ',' + m.ty + ') d(' + m.mx + ',' + m.my + ') st=' + (m.stance || '-'); });
    } catch (e) { return ['ERR']; }
  }
  function scholarTile() { try { return '(' + Game.map.px + ',' + Game.map.py + ')'; } catch (e) { return '(?)'; } }
  function inWindow() { const d = gday(Game); return d >= 73 && d <= 80; }
  function bracket(name) {
    const orig = Game[name];
    if (typeof orig !== 'function') { lines.push('PROBE2 no-fn ' + name); return; }
    Game[name] = function () {
      const before = heralds(); const dayBefore = gday(Game); const schBefore = scholarTile();
      const r = orig.apply(this, arguments);
      try {
        if (inWindow() || (dayBefore >= 73 && dayBefore <= 80)) {
          const after = heralds();
          if (JSON.stringify(before) !== JSON.stringify(after)) {
            lines.push('PROBE2 ' + name + ' day=' + dayBefore + ' scholar ' + schBefore + '->' + scholarTile() + ' heralds ' + JSON.stringify(before) + '->' + JSON.stringify(after) + ' stack=' + JSON.stringify(stackTop3()));
          }
        }
      } catch (e) {}
      return r;
    };
  }
  ['tickAction', 'doAction', 'endDay', 'advancePart', 'npcBatchTurn', 'monsterTurn', 'resolveAssignments', 'npcNodeTravel', 'moveWanderer', 'sleep', 'travelTo', 'spawnWorldMonster', 'removeWorldMonster', 'syncMonsterAlias', 'playerMonster'].forEach(bracket);

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  for (const line of lines) console.log(line);
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  console.log('PROBE2 done s' + seed + ': attempts=' + JSON.stringify(att.map(function (a) { return a.day + '/' + a.cls; })) + ' endDay=' + ((Game.state || {}).scholar || {}).day);
}

(async () => {
  if (!SEEDS.length) { console.error('PROBE2 STOP: SEEDS env required.'); process.exit(2); }
  for (const seed of SEEDS) { try { await oneRun(seed); } catch (e) { console.error('PROBE2 ERROR s' + seed + ': ' + (e && e.message)); console.error(e && e.stack); } }
})();
