#!/usr/bin/env node
// locatedengage-probe3-20261102.js — NON-JUDGED probe v3 (see
// locatedengage-probe-20261102.js for v1, probe2 for v2). V2 named
// endDay (called from advancePart) as the mover: every endDay moves
// the herald onto the scholar's tile with detail coords preserved.
// V3 brackets endDay's direct callees to name the exact inner call.
// READ-ONLY logging: no RNG consumed, no game state written.
// Usage (same frozen stack/env as the judged replay):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97301 node scripts/locatedengage-probe3-20261102.js
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
  if (process.env[k] !== '1') { console.error(`PROBE3 STOP: ${k}=1 is required.`); process.exit(2); }
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
    if (typeof orig !== 'function') { lines.push('PROBE3 no-fn ' + name); return; }
    Game[name] = function () {
      const before = heralds(); const dayBefore = gday(Game); const schBefore = scholarTile();
      const r = orig.apply(this, arguments);
      try {
        if (inWindow() || (dayBefore >= 73 && dayBefore <= 80)) {
          const after = heralds();
          if (JSON.stringify(before) !== JSON.stringify(after)) {
            lines.push('PROBE3 ' + name + ' day=' + dayBefore + ' scholar ' + schBefore + '->' + scholarTile() + ' heralds ' + JSON.stringify(before) + '->' + JSON.stringify(after) + ' stack=' + JSON.stringify(stackTop3()));
          }
        }
      } catch (e) {}
      return r;
    };
  }
  ['endDay', 'villageBriefing', 'villageLives', 'villageEats', 'villageMeal', 'villageDrinks', 'villageSicknessTick', 'socialSimmer', 'titanDawnTick', 'returnToVillage', 'regrowLand', 'checkTimedEvents', 'checkPromises', 'contestTick', 'resolveContest', 'seasonTurnBeat', 'rollWeather', 'overnightBankBurn', 'podIntrusionTick', 'recoverBearer', 'phoenixFuseCheck', 'checkTrialExpiry', 'checkSystemArrival', 'dailyCacheCheck', 'oldCuirassBeat', 'sweepSpoiled', 'tickJoinedVillage', 'scalePointerEcho', 'monsterNewsCheck', 'monsterNamingCheck', 'save', 'checkQuest', 'checkVillageProximity', 'expireTalkRequests', 'tickNeeds', 'npcNodeTravel', 'tickStatuses', 'diseaseVectorTick', 'moveWanderer', 'resolveStormFront', 'theftNoticeSweep', 'nightDangerBeat', 'killerTaleBeat'].forEach(bracket);

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  for (const line of lines) console.log(line);
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  console.log('PROBE3 done s' + seed + ': attempts=' + JSON.stringify(att.map(function (a) { return a.day + '/' + a.cls; })) + ' endDay=' + ((Game.state || {}).scholar || {}).day);
}

(async () => {
  if (!SEEDS.length) { console.error('PROBE3 STOP: SEEDS env required.'); process.exit(2); }
  for (const seed of SEEDS) { try { await oneRun(seed); } catch (e) { console.error('PROBE3 ERROR s' + seed + ': ' + (e && e.message)); console.error(e && e.stack); } }
})();
