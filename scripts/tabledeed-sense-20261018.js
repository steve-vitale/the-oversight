#!/usr/bin/env node
// tabledeed-sense-20261018.js — SENSE-TESTING instrument for sim-tabledeed.
//
// One run with narration:true on a seed where tableWaiting fired, capturing
// every say/sysSay line live. The question (SENSE-TESTING LAW): does the
// invitation beat make sense given the deed state — does the fiction know
// what the gate does? The beat must name what was actually faced (waves
// 1-3 on a lesser seat; never claim the Mirror Draft / the Producers).
//
// Writes the raw transcript to OUT (default ~/workspace/tabledeed-sense-<seed>.txt,
// NOT the repo) and prints the invitation window (arcBeat(4) + tableAnnounce).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   SEED=54001 POLICY=leadfeast node scripts/tabledeed-sense-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }

const SEED = parseInt(process.env.SEED || '54001', 10);
const POLICY_ID = process.env.POLICY || 'leadfeast';
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const OUT = process.env.OUT || path.join(process.env.HOME || '/tmp', `tabledeed-sense-${SEED}-${POLICY_ID}.txt`);

function policyFor(id) { return id === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'tabledeed-sense', fullTelemetry: false, narration: true });
  const lines = [];
  const dayOf = () => ((((Game.state || {}).scholar) || {}).day || 0);
  for (const name of ['say', 'sysSay']) {
    const orig = Game[name].bind(Game);
    Game[name] = function (msg) {
      try { lines.push({ day: dayOf(), voice: name, text: String(msg == null ? '' : msg) }); } catch (e) {}
      return orig(msg);
    };
  }
  // Census: arc + seat so we can bracket the invitation window.
  const census = [];
  const origSleep = Game.sleep;
  Game.sleep = function () {
    try {
      const pg = Game.progState();
      census.push({ day: dayOf(), arc: pg.arc | 0, tw: !!pg.tableWaiting, td: !!pg.tableDone, seat: ((Game.tableSeat && Game.tableSeat()) || {}).seat || 'none' });
    } catch (e) {}
    return origSleep.apply(this, arguments);
  };
  await setupGame(Game, 'Columbus, Ohio');
  await runDays(Game, policyFor(POLICY_ID), { days: DAYS, manifest: undefined, sampleEvery: 30 });
  Game.sleep = origSleep;
  fs.writeFileSync(OUT, lines.map(l => `[d${l.day} ${l.voice}] ${l.text}`).join('\n') + '\n');
  console.log(`transcript: ${OUT} (${lines.length} lines)`);

  // Find the invitation window: first day arc hits 4 / tableWaiting sets.
  let invDay = null;
  for (const c of census) { if (invDay === null && (c.arc >= 4 || c.tw)) invDay = c.day; }
  console.log('invitation window day:', invDay);
  if (invDay !== null) {
    console.log('--- beats d' + (invDay - 1) + ' to d' + (invDay + 3) + ' ---');
    for (const l of lines) {
      if (l.day >= invDay - 1 && l.day <= invDay + 3 &&
          /ARC IV|THE TABLE|table is being set|seat|wave|Wave|Final Draft|INEFFICIENCY/i.test(l.text)) {
        console.log(`[d${l.day} ${l.voice}] ${l.text.slice(0, 600)}`);
      }
    }
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
