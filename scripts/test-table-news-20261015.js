#!/usr/bin/env node
// test-table-news-20261015.js — proof test for the journey-endgame r11 blanks,
// ported 2026-10-15 (playtest-loop owner handling: the 2026-10-14 endgame r11
// run built the table lately-scan as uncommitted work in a dead worktree):
//   (A) the village acknowledges the table: t2LatelyEvent surfaces a 'table'
//       event while the table waits / sits / is deferred / is answered, and
//       t2gen_lately + t2fol_lately deliver table-specific lines.
//       Caught live (2026-10-14, r11 RED probe): day 178, three days after the
//       table fired (full seat, sitting unanswered) — a villager chatted
//       idly about "the funniest thing you've seen" and nobody mentioned it.
//   (B) the bare-'.' closer fold: the laconic register's '.' closer must not
//       stutter after a line's own terminal mark ("...Solid person. .",
//       endgame r10 transcript).
// PORT NOTE: the orphaned draft REMOVED the landed convoTableOpener; this
// port KEEPS it (landed ece87780, proofed by test-table-opener-20261014.js) —
// the opener is the conversation-open beat, the scan is the lately/event/
// want beat. Priority fix on port: only a SEVERE outbreak outranks the table
// (the draft's stated rule; its code returned table unconditionally).
// Method: construct table state directly (deterministic, no 176-day replay);
// seed the PRNG via loadGame (mulberry32 BEFORE eval).
// RED (pristine): t2LatelyEvent never returns kind 'table'; voiceLine emits
//   '"Solid person. ."'. GREEN (fixed): table events + lines; '"Solid person."'.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let fails = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  ok: ${name}`); }
  else { fails++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  Math.random = mulberry32(424242);
  const { Game } = await loadGame({ seed: 11, mode: 'proof-table-news' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager in roster');

  // Sanitize competing acute events so the table is the live event.
  const vg = Game.state.village;
  vg.grief = 0; vg.sick = {}; vg.heat = {}; vg.cheer = 0;
  Game.state.corpses = [];
  const pg = Game.progState();
  pg.tableWaiting = false; pg.tableDone = false;
  const T = Game.tableState();
  T.phase = null; T.winDeferred = false; T.path = null; T.seat = 'none';
  // Belt-and-braces: no naming debate, no fresh memories competing.
  if (typeof Game.monsterNamingActive === 'function') {
    try { Game._origNaming = Game.monsterNamingActive; Game.monsterNamingActive = () => false; } catch (e) {}
  }

  console.log('== A: table event surfaces ==');
  const phases = [
    { name: 'waiting', setup: () => { pg.tableWaiting = true; }, want: 'waiting' },
    { name: 'sitting', setup: () => { pg.tableWaiting = false; pg.tableDone = true; T.phase = 'paths'; T.seat = 'full'; }, want: 'sitting' },
    { name: 'deferred', setup: () => { T.winDeferred = true; }, want: 'deferred' },
    { name: 'done', setup: () => { T.winDeferred = false; T.phase = 'done'; T.path = 'beloved'; }, want: 'done' },
  ];
  for (const ph of phases) {
    // reset to neutral first
    pg.tableWaiting = false; pg.tableDone = false;
    T.phase = null; T.winDeferred = false; T.path = null; T.seat = 'none';
    ph.setup();
    let ev = null;
    try { ev = Game.t2LatelyEvent(vid); } catch (e) { ev = { err: String(e && e.message) }; }
    check(`t2LatelyEvent kind=='table' (${ph.name})`, ev && ev.kind === 'table',
      'got ' + JSON.stringify(ev && { kind: ev.kind, phase: ev.phase }));
    check(`t2LatelyEvent phase=='${ph.want}' (${ph.name})`, ev && ev.phase === ph.want,
      'got ' + JSON.stringify(ev && ev.phase));
    let lines = [];
    try { lines = Game.t2gen_lately(vid) || []; } catch (e) {}
    check(`t2gen_lately delivers table lines (${ph.name})`,
      lines.length > 0 && lines.some(l => /table/i.test(l)),
      'got ' + JSON.stringify(lines).slice(0, 160));
    if (ph.name === 'done') {
      check('done+beloved line witnesses the outcome',
        lines.some(l => /cheering|cried/i.test(l)), 'got ' + JSON.stringify(lines).slice(0, 160));
    }
    let fol = [];
    try { fol = Game.t2fol_lately(vid) || []; } catch (e) {}
    const flat = fol.flat().join(' ');
    check(`t2fol_lately has table follow-ups (${ph.name})`, /table|door/i.test(flat),
      'got ' + flat.slice(0, 160));
  }

  console.log('== B: bare-punctuation closer fold ==');
  // Deterministic voiceLine: stub the pick to the laconic '.' closer and the
  // markers to a closer-only set; script the RNG past the p-gate into a closer.
  const rng = mulberry32(7);
  Math.random = () => 0.0; // 0.0 < p: always proceeds past the voice gate
  const origPick = Game.convoPickCycle;
  const origMarkers = Game.convoSpeechMarkers;
  Game.convoPickCycle = () => '.';
  Game.convoSpeechMarkers = () => ({ open: [], close: ['.'] });
  // restore real Math.random behavior control per call: first call (p-gate)
  // must be < p, second (open/close choice) >= 0.45 for closer.
  let calls = 0;
  Math.random = () => (++calls % 2 === 1 ? 0.0 : 0.9);
  const out1 = Game.voiceLine(vid, '"Theo? A trail crew lead, back before. Solid person."');
  check('laconic "." closer folds (no " .")', out1 === '"Theo? A trail crew lead, back before. Solid person."',
    'got ' + JSON.stringify(out1));
  calls = 0;
  const out2 = Game.voiceLine(vid, '"I see"');
  check('"." tucks with no space on unterminated line', out2 === '"I see."',
    'got ' + JSON.stringify(out2));
  Game.convoPickCycle = () => '!';
  calls = 0;
  const out3 = Game.voiceLine(vid, '"Ask anyone!"');
  check('"!" closer still swaps terminal mark', out3 === '"Ask anyone!"',
    'got ' + JSON.stringify(out3));
  Game.convoPickCycle = origPick;
  Game.convoSpeechMarkers = origMarkers;

  console.log(`\n${fails ? 'RED' : 'GREEN'}: ${fails} failing check(s)`);
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
