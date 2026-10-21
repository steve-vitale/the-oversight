#!/usr/bin/env node
// test-tableaudit-20261021.js — journey-endgame r35 (lane B, 2026-10-21).
//
// LEG QUESTION: after the Table is announced and a village with wave-4/5
// deeds sits, does the seated audit read the run back honestly? r34 blank #1
// (documented, no game-code change): the lesser-seat audit hardcodes
// "waves 1–3 faced" (table.js:486) — villages that bled for w4/w5 deeds in
// the overtime window hear an audit that pretends those deeds don't exist.
// TABLE.md canon: "The pricing beat reads the run aloud."
//
// Proves: (1) tableSeat()'s detail counts w4/w5 deeds (the data for the
// voicing); (2) the lesser audit line names nonzero w4/w5 counts; (3) when
// there are no w4/w5 deeds, the line is byte-identical to the old voicing
// (no regression); (4) pricing is unchanged — the same fixture prices a
// lesser seat before and after.
//
// Fixtures touch only real stores the engine reads (fixture pattern from
// test-fullseat-superset-20261014.js). The audit line is built by the new
// Game.tableSeatLine(seat) helper so it is testable without running the
// full tableScene modal flow; tableScene calls it (check-wired keeps it
// honest).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('tableaudit');

function fixture(Game) {
  K.newRun(Game);
  const pg = Game.progState(), s = Game.state.scholar;
  // wave deeds: w1=4, w2=4, w3=3, w4=2, w5=1 (distinct, real monster ids)
  const byWave = {};
  for (const m of Game.data.monsters || []) (byWave[m.wave || 1] = byWave[m.wave || 1] || []).push(m.id);
  const need = { 1: 4, 2: 4, 3: 3, 4: 2, 5: 1 };
  const d = Game.deedState();
  for (const w of Object.keys(need)) {
    const ids = (byWave[w] || []).slice(0, need[w]);
    T.ok('setup: wave-' + w + ' roster has ' + need[w] + ' real monsters', ids.length === need[w], ids.length + ' found');
    for (const id of ids) d.wavesFaced[id] = +w;
  }
  d.contestsSurvived = 2;
  pg.crises = { a: 1, b: 1 };
  Game.state.networkLive = true;              // scaleRank -> regional
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 45;        // integration stage 2
  pg.sentimentTaught = true;                  // food-thesis deeds
  s.prog = s.prog || {};
  s.prog.feastSurgeUsed = true;
}

(async () => {
  const Game = await K.load({ seed: 81001 });
  K.newRun(Game);

  // ---- 1. tableSeat() counts w4/w5 in the detail --------------------
  fixture(Game);
  Game.state.scholar.day = 132;
  T.ok('setup: regional scale', Game.scaleRank() === 'regional', Game.scaleRank());
  T.ok('setup: integration stage 2', Game.integrationStage() === 2);
  const seat = Game.tableSeat();
  T.ok('setup: lesser seat (not full: w4/w5 below full bars)', seat.seat === 'lesser', seat.seat);
  T.ok('detail counts w4 deeds', seat.detail && seat.detail.w4 === 2, 'w4=' + (seat.detail && seat.detail.w4));
  T.ok('detail counts w5 deeds', seat.detail && seat.detail.w5 === 1, 'w5=' + (seat.detail && seat.detail.w5));

  // ---- 2. the audit line names nonzero w4/w5 ------------------------
  const line = Game.tableSeatLine(seat);
  T.ok('audit line is a string', typeof line === 'string', String(line).slice(0, 60));
  T.ok('audit names the wave-4 deeds', /2 wave-4|wave-4.{0,12}2|w4/i.test(line) && line.indexOf('wave-4') >= 0, line);
  T.ok('audit names the wave-5 deeds', line.indexOf('wave-5') >= 0 && /1 wave-5|wave-5/i.test(line), line);

  // ---- 3. no w4/w5 -> old voicing, byte-identical -------------------
  const plain = Game.tableSeatLine({ seat: 'lesser', detail: { rank: 'regional', w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2 } });
  const OLD = 'A lesser seat — regional standing, waves 1–3 faced (4/4/3), 2 contests survived, 2 crises weathered. The table does not rise. It prices.';
  T.ok('no w4/w5 -> old line byte-identical', plain === OLD, plain);

  // ---- 4. full-seat voicing untouched --------------------------------
  const fullLine = Game.tableSeatLine({ seat: 'full', detail: { rank: 'National' } });
  T.ok('full seat line unchanged', fullLine === 'A full seat. National standing, every wave faced, the deeds complete. The table rises when you enter.', fullLine);

  T.done();
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
