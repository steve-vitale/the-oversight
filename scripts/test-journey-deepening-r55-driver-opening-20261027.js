// test-journey-deepening-r55-driver-opening-20261027.js -- PROOF TEST for the
// r55 driver opening-beat fix (driver-only, zero src/js).
//
// Before: the panel driver printed only startConvo's returned line at open,
// so a sitting whose opening carried a second spoken beat (the SPOKEN LURE
// invitation) showed a betrayal-only menu with no visible invitation
// (r55 panel: 42001-d60 Ingrid, 42003-d45 Nathan).
// After: the driver prints every THEM transcript entry present at open
// (THEM(open+) lines), so the invitation is visible.
//
// This test proves both halves through real game code:
//   (1) BEHAVIOR: on a stage-0 goal-thread sitting with a pending invite, the
//       full transcript holds the lure beat while r0.line does not (the
//       invitebeat2 construction: banked want-opener variants + trust 100).
//   (2) DRIVER GATE: the driver file under test contains the THEM(open+)
//       opening print. Run with the driver path as argv[2] (default: the r55
//       driver). Against the pre-fix r54 driver this test FAILS on (2);
//       against the fixed r55 driver it PASSES.
// Usage: node scripts/test-journey-deepening-r55-driver-opening-20261027.js [driver-path]
// Exit 0: both halves pass. Exit 1: either half fails.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const DRIVER = process.argv[2] || path.join(__dirname, 'journey-deepening-r55-20261027.js');
(async () => {
  let fail = 0;
  const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
  // ---- (2) driver gate first (cheap, and names the file under test) ----
  let src = '';
  try { src = fs.readFileSync(DRIVER, 'utf8'); } catch (e) { src = ''; }
  check('driver contains THEM(open+) opening print', src.includes('THEM(open+)'), DRIVER);
  // ---- (1) behavior: stage-0 goal sitting + pending invite ----
  const { Game } = await loadGame({ seed: 42003, mode: 'r55-driver-opening-probe', fullTelemetry: true });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  for (const id of roster) {
    try { const n = Game.npcNeeds(id); if (n) n.hunger = 85; } catch (e) {}
  }
  let vid = null;
  for (const id of roster) {
    try {
      const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
      if (comm.level === 'none') continue;
      const r = Game.startConvo(id);
      if (!r || !r.line) { try { Game.endConvo(id, 'done'); } catch (e) {} continue; }
      const c = Game.convoGet(id);
      if (c && c.want && c.want.id === 'ask_favor') { vid = id; break; }
      try { Game.endConvo(id, 'done'); } catch (e) {}
    } catch (e) {}
  }
  if (!vid) { console.log('FAIL behavior: no ask_favor villager'); process.exit(1); }
  try { delete (Game.state.village.convoSeeds || {})[vid]; } catch (e) {}
  try { Game.state.village.trust = Game.state.village.trust || {}; Game.state.village.trust[vid] = 100; } catch (e) {}
  const runLedger = () => { try { return Game.convoRunLedger ? Game.convoRunLedger() : []; } catch (e) { return []; } };
  let achieved = null;
  for (let attempt = 1; attempt <= 14; attempt++) {
    try {
      const bs = Game.betrayalState();
      bs.invites = bs.invites || {};
      bs.invites[vid] = { pending: { defId: 'air', day: Game.state.scholar.day || 0 } };
    } catch (e) {}
    let r = null;
    try { r = Game.startConvo(vid); } catch (e) { try { Game.endConvo(vid, 'done'); } catch (e2) {} continue; }
    if (!r || !r.line) { try { Game.endConvo(vid, 'done'); } catch (e) {} continue; }
    const c = Game.convoGet(vid);
    const w = (c && c.want) || {};
    if (w.id === 'ask_favor' && (w.stage || 0) === 0) { achieved = { r, c }; break; }
    try { runLedger().push(r.line); } catch (e) {}
    try { Game.endConvo(vid, 'done'); } catch (e) {}
  }
  if (!achieved) { console.log('FAIL behavior: no stage-0 sitting within 14 attempts'); process.exit(1); }
  const c = Game.convoGet(vid);
  const them = (c.transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
  const norm = (s) => String(s || '').replace(/^"/, '').replace(/"$/, '').trim();
  const lureInTranscript = them.some(t => /Come get air with me/.test(t));
  const lureInR0 = String(achieved.r.line || '').includes('Come get air');
  const newPrint = them.filter(t => norm(t) !== norm(achieved.r.line));
  check('old print (r0.line) hides the lure', !lureInR0, `r0.line=${JSON.stringify(achieved.r.line)}`);
  check('full transcript holds the lure', lureInTranscript, `THEM entries=${them.length}`);
  check('new print (THEM(open+)) reveals the lure', newPrint.some(t => /Come get air with me/.test(t)), `open+ lines=${JSON.stringify(newPrint)}`);
  let choices = [];
  try { choices = Game.convoChoices(vid) || []; } catch (e) {}
  check('offered set is the betrayal-only menu', choices.map(x => x && x.id).filter(Boolean).join(',') === 'betrayal:accept,betrayal:decline,leave,silence', choices.map(x => x && x.id).filter(Boolean).join(','));
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  console.log(fail === 0 ? 'ALL PASS' : `${fail} FAILURES`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.log('PROBE-ERROR: ' + (e && e.stack || e)); process.exit(1); });
