#!/usr/bin/env node
// locatedengage-probe4-20261102.js — NON-JUDGED probe v4. V3 named
// endDay as the mover but none of endDay's callees fired, and
// endDay's own body shows no monster-tile write. V4 settles it
// definitively: it installs logging setters for tx/ty on the herald
// monster object itself (at spawn), so the exact assignment that
// moves the herald logs a FULL stack trace naming the function.
// READ-ONLY w.r.t. game semantics: the setter stores the value
// through to a backing field and changes no game state.
// Usage (same frozen stack/env as the judged replay):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97301 node scripts/locatedengage-probe4-20261102.js
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
  if (process.env[k] !== '1') { console.error(`PROBE4 STOP: ${k}=1 is required.`); process.exit(2); }
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

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const lines = [];
  function installSetters(mon) {
    if (!mon || mon.__leTrapped) return;
    mon.__leTrapped = true;
    for (const key of ['tx', 'ty']) {
      let val = mon[key];
      Object.defineProperty(mon, key, {
        enumerable: true, configurable: true,
        get: function () { return val; },
        set: function (nv) {
          const d = gday(Game);
          if (nv !== val && d >= 72 && d <= 81) {
            const stack = (new Error('le-tx').stack || '').split('\n').slice(1, 10).join(' | ');
            lines.push('PROBE4 set ' + key + ' day=' + d + ' ' + val + '->' + nv + ' scholar=(' + Game.map.px + ',' + Game.map.py + ') stack: ' + stack);
          }
          val = nv;
        },
      });
    }
  }
  const origSpawn = Game.spawnWorldMonster;
  Game.spawnWorldMonster = function (mdef, tx, ty) {
    const r = origSpawn.apply(this, arguments);
    try {
      const id = (typeof mdef === 'string') ? mdef : (mdef && mdef.id);
      if (id === 'herald' || (r && r.id === 'herald')) installSetters(r);
    } catch (e) {}
    return r;
  };

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  for (const line of lines) console.log(line);
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  console.log('PROBE4 done s' + seed + ': attempts=' + JSON.stringify(att.map(function (a) { return a.day + '/' + a.cls; })) + ' endDay=' + ((Game.state || {}).scholar || {}).day);
}

(async () => {
  if (!SEEDS.length) { console.error('PROBE4 STOP: SEEDS env required.'); process.exit(2); }
  for (const seed of SEEDS) { try { await oneRun(seed); } catch (e) { console.error('PROBE4 ERROR s' + seed + ': ' + (e && e.message)); console.error(e && e.stack); } }
})();
