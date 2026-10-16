#!/usr/bin/env node
// scripts/sense-ambient-20261016.js — sense transcripts for sim-ambient-b.
// Runs 2 short armed sims and attributes each ambient beat to its
// (key, variant idx) by correlating the ambientPick call with the
// synchronously-following say (ambientLine renders then says in the same
// tick; no says intervene). Writes context windows to
// evidence/2026-10-16/ambient-sense-armed/ for the SENSE-TESTING LAW read.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     node scripts/sense-ambient-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 explicit required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'ambient-sense-armed');

async function oneRun(seed) {
  const base = SD.leadseat;
  const policy = Object.assign({}, base);
  const od = base.daily;
  policy.daily = (G, ctx) => (od ? od(G, ctx) : undefined);
  const buf = []; // {day, text, beat:{key,idx}|null}
  let pending = null;
  await quietLog(async () => {
    const { Game } = await loadGame({ seed, mode: 'ambient-sense' });
    await setupGame(Game);
    const oPick = Game.ambientPick.bind(Game);
    Game.ambientPick = function (vid, key, n) {
      const idx = oPick(vid, key, n);
      pending = { key, idx };
      return idx;
    };
    const oSay = Game.say;
    Game.say = function (t) {
      try {
        const b = pending; pending = null;
        buf.push({ day: (Game.state.scholar || {}).day || 0, text: String(t).slice(0, 400), beat: b });
        if (buf.length > 20000) buf.splice(0, buf.length - 20000);
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
    try {
      await runDays(Game, policy, { days: 60, sampleEvery: 1 });
    } finally {
      Game.say = oSay; Game.ambientPick = oPick;
    }
  });
  return buf;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const seed of [141, 252]) {
    console.log(`  sense run seed ${seed} ...`);
    const buf = await oneRun(seed);
    const lines = [`# armed ambient beats with variant attribution — leadfeast seed ${seed}`, ''];
    let n = 0;
    for (let i = 0; i < buf.length && n < 60; i++) {
      if (!buf[i].beat) continue;
      n++;
      for (let j = Math.max(0, i - 2); j <= Math.min(buf.length - 1, i + 2); j++) {
        const mark = j === i ? '>>>' : '   ';
        const tag = buf[j].beat ? ` [${buf[j].beat.key}#${buf[j].beat.idx}]` : '';
        lines.push(`${mark} d${buf[j].day}${tag} ${buf[j].text}`);
      }
      lines.push('');
    }
    fs.writeFileSync(path.join(OUTDIR, `armed-leadfeast-s${seed}.md`), lines.join('\n'));
    console.log(`    ${n} beats written`);
  }
  console.log('done.');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
