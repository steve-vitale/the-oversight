#!/usr/bin/env node
// test-tabledeedlines-teeth-r130.js — journey-endgame r130 (lane B).
// Proof test for the war-path "tooths" grammar blank, found twice in
// r130 transcripts (r129 had flagged it on 89705; r130 shows it again
// on the nohurt-89702 full-seat finale: "and 2 more tooths after").
// tableDeedLines() renders the kill remainder as "N more tooth(s)";
// the plural of tooth is teeth, not tooths.
//
// GATES (all must be GREEN):
//   A: 4 distinct kills -> "2 more teeth after", never "tooths".
//   B: same kill twice + 1 more -> "1 more tooth after that"
//      (singular branch untouched), never "tooths".
//
// Usage: node scripts/test-tabledeedlines-teeth-r130.js
// Fixture pattern mirrors test-tabledeed-20261021.js.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function ok(cond, name, extra) {
  if (cond) { console.log(`  ok   ${name}`); }
  else { fails++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

async function fixtureGame(opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed: 424242, mode: 'tabledeed-teeth-fixture', fullTelemetry: false });
  await setupGame(Game);
  Game.state.systemArrived = true;
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const vid = (roster.find(x => x && x !== Game.villagerId)) || 'v_1';
  Game.state.waveKillLog = (opts.kills || []).map(k => ({
    d: k.day, mid: k.mid, w: k.w || 4, by: k.by === 'AUTO' ? vid : (k.by || 'player'), via: k.via || 'companion', trick: null,
  }));
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.monsters = {};
  for (const m of (opts.slainMids || [])) Game.state.codex.monsters[m] = { stage: 'slain' };
  const sch = Game.state.scholar || {};
  sch.prog = sch.prog || {};
  sch.prog.deeds = { wavesFaced: opts.faced || {} };
  sch.prog.tableSittingId = 1;
  Game.state.titans = { omens: {}, musters: {}, slain: {}, cast: null };
  return { Game, vid };
}

(async () => {
  // A: 4 distinct kills -> plural remainder.
  {
    const { Game } = await fixtureGame({
      kills: [
        { mid: 'congregation', day: 140, by: 'player', via: 'player' },
        { mid: 'strike', day: 152, by: 'AUTO', via: 'companion' },
        { mid: 'eater', day: 160, by: 'player', via: 'player' },
        { mid: 'audit', day: 170, by: 'AUTO', via: 'companion' },
      ],
      faced: { congregation: 4, strike: 4, eater: 4, audit: 4 },
      slainMids: ['congregation', 'strike', 'eater', 'audit'],
    });
    const rec = Game.tableDeedRecords();
    ok(rec.kills.length === 4, 'A records 4 kills', JSON.stringify(rec.kills.length));
    const joined = Game.tableDeedLines().join(' ');
    ok(joined.includes('2 more teeth after'), 'A voices "2 more teeth after"', joined.slice(0, 300));
    ok(!joined.includes('tooths'), 'A never voices "tooths"');
  }

  // B: same kill twice (most recent, so they sort first) + 1 more ->
  // the twice-branch with its singular remainder.
  {
    const { Game } = await fixtureGame({
      kills: [
        { mid: 'congregation', day: 160, by: 'player', via: 'player' },
        { mid: 'congregation', day: 160, by: 'player', via: 'player' },
        { mid: 'strike', day: 140, by: 'AUTO', via: 'companion' },
      ],
      faced: { congregation: 4, strike: 4 },
      slainMids: ['congregation', 'strike'],
    });
    const joined = Game.tableDeedLines().join(' ');
    ok(joined.includes('twice'), 'B voices the twice-branch', joined.slice(0, 300));
    ok(joined.includes('1 more tooth after that'), 'B voices "1 more tooth after that" (singular intact)');
    ok(!joined.includes('tooths'), 'B never voices "tooths"');
  }

  console.log(fails ? `FAILURES: ${fails}` : 'ALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('ERROR', e && e.stack || e); process.exit(2); });
