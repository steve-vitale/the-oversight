#!/usr/bin/env node
// diag-tabledeaths-20261012.js — who died during the table sequence (winpath r5).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const H = require('./sim-harness');
const { fedseek } = require('./policies/winseek');
const seed = +process.argv[2] || 1;
(async () => {
  const { Game } = await H.loadGame({ seed });
  await H.setupGame(Game);
  const res = await H.runDays(Game, Object.assign({}, fedseek), { days: 200, seed });
  const deaths = [];
  try {
    for (const ev of (Game.state.telemetry || [])) {
      if (ev.type === 'death') deaths.push(ev);
    }
  } catch (e) {}
  console.log(`days=${res.days} gameDays=${res.gameDays} end=${res.endReason}`);
  console.log('death events during scholar-day 65+ :');
  for (const d of deaths) {
    if ((d.day || 0) >= 65) console.log(`day ${d.day}: ${d.who || '?'} — kind=${d.kind || '?'} cause=${d.cause || '?'}`);
  }
  console.log('--- all death causes ---');
  const by = {};
  for (const d of deaths) { const k = (d.day >= 69 ? 'TABLE-DAYS ' : '') + (d.cause || d.kind || '?'); by[k] = (by[k] || 0) + 1; }
  console.log(JSON.stringify(by, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
