#!/usr/bin/env node
'use strict';
// Proof: the warn-heed watch is blind to the deepen arc
// (journey-establishment r274, 2026-11-23).
//
// Finding (r274 panel, live — seed 109001 day 36, Victor): a warn_you
// sitting engaged via dlg:heed read as "engaged but no warning
// delivered" in the analyzer, yet the player WAS warned — the heed was
// Victor's 4th, so the handler took the DEEPEN branch
// (convo-dialogue.js dlg:heed, heeds >= 4: the 5-line deepen pool) and
// spoke "...I keep seeing it. Whatever it was, out past the treeline.
// I don't want to be the one telling the fire you didn't come back."
// The deepen branch never calls convoWantWarning, and the warnLog
// instrument only logs convoWantWarning returns — so the delivery was
// invisible to the watch. Instrument gap, not a game defect: the game
// spoke the warning; the watch could not hear that path.
//
// Fix (instrument-only, this run): the journey driver records the line
// returned for each dlg:heed / dlg:details press (rec.heedLines), and
// the analyzer names a sitting NAMED-VIA-DEEPEN when a recorded heed
// line matches a deepen-pool substring. The generic ACK fallbacks
// ("Good. I mean it — watch yourself out there." / "Promise me that.
// Please." / "Thank you. I needed to hear you say it.") match none of
// these, so a heed that fell back to generic still reads UNNAMED —
// the r150 defect shape, unchanged.
//
// This test proves, on the live handler:
//  (1) the 4th heed speaks a deepen line (a warning), the want
//      resolving as 'heeded' (r140 shape, re-proven on this base);
//  (2) the warnLog wrap (the driver's instrument, replicated here)
//      gains NO entry from the 4th heed — the blindness, stated;
//  (3) the 4th heed's returned line matches a deepen-pool substring
//      — the exact condition the analyzer's new clause uses — while
//      none of the 3 generic ACK lines does.
// Staging follows test-landing-r140-heed-deepen-20261116.js (seed 1175,
// recentAttacks=1 + trust 50, natural warn_you speaker, budget raised).
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

// Deepen-pool substrings — MUST match the analyzer's DEEPEN_SUBS
// (scripts/analyze-journey-establishment-r274-20261123.js) and the
// pool in src/js/convo-dialogue.js dlg:heed (heeds >= 4).
const DEEPEN_SUBS = [
  'walk out sure and not walk back',
  'out past the treeline',
  'You hear me, right? Not the words',
  'laid awake listening',
  'still have you here tomorrow',
];
const ACK = [
  '"Good. I mean it — watch yourself out there."',
  '"Promise me that. Please."',
  '"Thank you. I needed to hear you say it."',
];

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 1175 });
  K.newRun(Game);

  // The driver's warnLog instrument, replicated verbatim: wrap
  // Game.convoWantWarning, log every truthy return.
  const warnLog = [];
  if (typeof Game.convoWantWarning === 'function') {
    const _warn = Game.convoWantWarning.bind(Game);
    Game.convoWantWarning = function (vid) {
      const out = _warn.apply(this, arguments);
      try { if (out) warnLog.push({ vid: String(vid), lineStart: String(out).slice(0, 120) }); } catch (e) {}
      return out;
    };
  }

  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const commAble = roster.filter(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  });
  v.trust = v.trust || {};
  for (const id of commAble) { try { v.trust[id] = 50; } catch (e) {} }
  v.recentAttacks = 1;

  let speaker = null, warnDef = null;
  for (const id of commAble) {
    try {
      const w = Game.convoSelectWant(id);
      if (w && w.id === 'warn_you') { speaker = id; warnDef = w.def; break; }
    } catch (e) {}
  }
  check('a villager naturally picks warn_you with recent attacks', !!speaker,
    `commAble=${commAble.length}`);
  if (!speaker) { console.log(`\n=== RESULT: ${pass} pass, 1 fail ===`); process.exit(1); }
  console.log(`speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  const opened = Game.startConvo(speaker);
  check('sitting opens', !!opened && !opened.refused && !opened.ended);
  const c = Game.convoGet(speaker);
  if (!c.want || c.want.id !== 'warn_you') {
    c.want = { id: 'warn_you', def: warnDef, stage: 1 };
    console.log('[probe] want re-hung to warn_you stage 1');
  }
  try { c.budget = 20; } catch (e) {}
  check('want is warn_you stage 1', c.want.id === 'warn_you' && (c.want.stage || 0) === 1,
    `want=${c.want.id} stage=${c.want.stage}`);

  for (let t = 0; t < 4; t++) {
    let choices = [];
    try { choices = Game.convoChoices(speaker) || []; } catch (e) { break; }
    const ans = (choices || []).find(ch => ch && ch.id && ch.id.indexOf('ans:') === 0);
    if (!ans) break;
    const r = Game.convoTurn(speaker, ans.id);
    if (r.ended) break;
  }

  // Drive dlg:heed picks while offered (up to 8), recording each
  // returned line exactly as the driver's rec.heedLines does.
  const spoken = [];
  const heedLines = [];
  let silent = 0, heeds = 0;
  for (let t = 0; t < 8; t++) {
    let choices = [];
    try { choices = Game.convoChoices(speaker) || []; } catch (e) { break; }
    const heed = (choices || []).find(ch => ch && ch.id === 'dlg:heed');
    if (!heed) break;
    const before = (Game.convoGet(speaker).transcript || []).filter(e => e && e.who === 'them').length;
    const warnBefore = warnLog.length;
    const r = Game.convoTurn(speaker, 'dlg:heed');
    heeds++;
    const line = String((r && r.line) || '');
    heedLines.push({ pick: 'dlg:heed', line: line.slice(0, 400) });
    const after = (Game.convoGet(speaker).transcript || []).filter(e => e && e.who === 'them').length;
    if (after === before) silent++;
    spoken.push(line);
    console.log(`heed ${heeds}: spoken=${after > before} warnLog +${warnLog.length - warnBefore} line=${line.slice(0, 90)}`);
    if (r.ended) break;
  }
  console.log(`heeds=${heeds} silent=${silent} wantStage=${c.want.stage} resolution=${c.want.resolution} warnLog=${warnLog.length}`);

  // ---- Assertions ----
  check('the sitting accepted exactly 4 heed picks (want resolved, menu closed)', heeds === 4,
    `heeds=${heeds}`);
  check('zero silent turns — every heed was spoken', silent === 0, `silent=${silent}`);
  // R150 shape (current base): heed 1 states the warning via
  // convoWantWarning (warnLog +1 — the r150 fix); heeds 2-3 are the
  // ack fallbacks (warning already delivered). Heed 4 deepens.
  check('heed 1 states the warning (r150), heeds 2-3 are distinct ack lines',
    heeds >= 3 && !ACK.includes(spoken[0]) && ACK.includes(spoken[1]) && ACK.includes(spoken[2]) &&
    spoken[1] !== spoken[2],
    `spoken[0..2]=${JSON.stringify(spoken.slice(0, 3).map(s => s.slice(0, 40)))}`);
  check('heed 4 is a deepen line, not one of the 3 ack lines',
    heeds >= 4 && !ACK.includes(spoken[3]),
    `spoken[3]=${(spoken[3] || '').slice(0, 120)}`);
  check("the want resolved as 'heeded'", c.want.resolution === 'heeded',
    `resolution=${c.want.resolution}`);

  // (2) The blindness, stated: the 4th heed speaks a warning, but the
  // warnLog wrap gains nothing from it — the deepen branch never calls
  // convoWantWarning. Count warnLog entries attributable to heed 4 by
  // re-running the count: the wrap logged only the opener/heeds 1-3
  // path (if any); the test asserts the deepen line itself is not in
  // warnLog. The panel's Victor d36 is the live instance (0 Victor
  // warnLog entries on d36, deepen line spoken).
  const heed4Line = spoken[3] || '';
  check('heed 4 line is absent from warnLog (the deepen branch never calls convoWantWarning)',
    !warnLog.some(w => heed4Line && w.lineStart && heed4Line.includes(w.lineStart.slice(0, 60))),
    `warnLog=${JSON.stringify(warnLog.map(w => w.lineStart.slice(0, 40)))}`);

  // (3) The analyzer's rule fires on the recorded heed line, and only
  // on deepen lines — none of the ACK fallbacks match.
  const matchesDeepen = (line) => DEEPEN_SUBS.some(sub => String(line || '').includes(sub));
  check('heed 4 line matches a deepen-pool substring (the analyzer clause)',
    matchesDeepen(heed4Line), `spoken[3]=${heed4Line.slice(0, 120)}`);
  check('no generic ACK line matches a deepen-pool substring (the r150 shape stays UNNAMED)',
    spoken.slice(0, 3).every(l => !matchesDeepen(l)),
    `spoken[0..2]=${JSON.stringify(spoken.slice(0, 3).map(s => s.slice(0, 40)))}`);
  check('the driver-shaped heedLines record carries the deepen line',
    heedLines.length === 4 && matchesDeepen(heedLines[3].line),
    `heedLines[3]=${(heedLines[3] && heedLines[3].line || '').slice(0, 80)}`);

  try { Game.endConvo(speaker, 'left'); } catch (e) {}
  console.log(`\n=== RESULT: ${pass} pass ===`);
  process.exit(0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
