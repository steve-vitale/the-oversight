#!/usr/bin/env node
'use strict';
// scripts/test-tabletalk-20261016.js — proof for the sim-seatvoice
// OPPORTUNISTIC FIX: villager-voiced table-wait beats (the #372 blank).
//
// The fix (src/js/havenGrowth.js: tableWaitTalk, called from
// havenGrowthDaily): while the table invitation pends (pg.tableWaiting &&
// !pg.tableDone), villagers occasionally speak by the fire about the open
// invitation — 🗣️ fireside beats in the havenNeedGossip format, stance-
// varied, knowledge-gated. Voice-only: this.say() + a rate-limit day
// marker; NO seedGossip (the gossip tick draws RNG and moves REP), NO
// Math.random draws (own deterministic narration stream, a pure function
// of game state), no decision-feeding state reads.
//
// RED→GREEN (run in TDD order):
//   REDMODE=1 (BEFORE the fix): assert the source has no tableWaitTalk;
//     run leadfeast-s438 + belongfeast-s761 x 95d (both invited ~d50-54,
//     sit d90 — the open-invitation window); save per-day dayHash to
//     ~/workspace/tabletalk-red.json; assert ZERO table-talk beats.
//   default (AFTER the fix): assert the source has tableWaitTalk + the
//     havenGrowthDaily call site; same 2 seeds x 95d; assert table-talk
//     beats > 0 on BOTH seeds; assert per-day dayHash sequences
//     byte-identical to the RED file (zero mechanical effect).
// SMOKE: sweep SMOKE mode exits 0 with the fix in place.
//
// A table-talk beat: /🗣️/ + tableTopic().related + not the "Red Table"
// rival-fire confound.
const fs = require('fs');
const path = require('path');
const REDMODE = process.env.REDMODE === '1';
const REDFILE = path.join(process.env.HOME || '/home/hatch', 'workspace', 'tabletalk-red.json');
const SRC = path.join(__dirname, '..', 'src', 'js', 'havenGrowth.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const src = fs.readFileSync(SRC, 'utf8');
  const hasFix = src.includes('tableWaitTalk');
  const hasCallSite = /this\.tableWaitTalk\(\)/.test(src);
  if (REDMODE) {
    check('RED: tableWaitTalk absent from havenGrowth.js', !hasFix, '');
    if (hasFix) { console.log('refusing to run RED against fixed source'); process.exit(1); }
  } else {
    check('GREEN: tableWaitTalk present in havenGrowth.js', hasFix, '');
    check('GREEN: called from havenGrowthDaily', hasCallSite, '');
  }

  // --- live runs: 2 early-invitation seeds x 95d ---
  const SD = require('./policies/seatdrive');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { extractText } = require('./villagevoice-lib-20261016');
  const { tableTopic } = require('./seatvoice-table-20261016');
  const { dayHash } = require('./det-gate');
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';

  const isTableTalk = (t) => /🗣️/u.test(t) && tableTopic(t).related && !/red table/i.test(t);
  const runs = [
    ['leadfeast', 438, SD.leadseat],
    ['belongfeast', 761, SD.belongseat],
  ];
  const out = {};
  for (const [pid, seed, policy] of runs) {
    const { Game } = await loadGame({ seed, mode: `tabletalk-${pid}` });
    await setupGame(Game);
    const beats = [];
    const hashes = [];
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try { const t = extractText(msg); if (t && isTableTalk(t)) beats.push({ d: (Game.state.scholar || {}).day || 0, t }); } catch (e) {}
      return origSay(msg);
    };
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      try { hashes.push(((G.state.scholar || {}).day || 0) + ':' + dayHash(G)); } catch (e) {}
      return oDaily(G, ctx);
    };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 95 }); });
    out[pid + '-s' + seed] = { hashes, beats };
    console.log(`  [${pid} s${seed}] table-talk beats=${beats.length} days=${hashes.length}`);
    for (const b of beats.slice(0, 4)) console.log(`    d${b.d}: ${b.t.slice(0, 130)}`);
  }

  if (REDMODE) {
    for (const k of Object.keys(out)) {
      check(`RED: zero table-talk beats on ${k} (the #372 blank, live)`, out[k].beats.length === 0, `got ${out[k].beats.length}`);
    }
    fs.writeFileSync(REDFILE, JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.hashes])), null, 1));
    console.log(`  RED hashes saved to ${REDFILE}`);
  } else {
    let red = null;
    try { red = JSON.parse(fs.readFileSync(REDFILE, 'utf8')); }
    catch (e) { check('GREEN: RED hash file exists (run REDMODE=1 first)', false, REDFILE); }
    for (const k of Object.keys(out)) {
      check(`GREEN: table-talk beats fire on ${k}`, out[k].beats.length > 0, `got ${out[k].beats.length}`);
      if (red && red[k]) {
        const a = red[k], b = out[k].hashes;
        const same = a.length === b.length && a.every((h, i) => h === b[i]);
        check(`GREEN: trajectories byte-identical vs RED on ${k} (${b.length}d)`, same, same ? '' : `RED ${a.length}d vs GREEN ${b.length}d`);
      }
    }
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('FATAL', e); process.exit(2); });
