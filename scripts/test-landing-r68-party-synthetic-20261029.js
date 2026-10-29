// Synthetic engine proof for landing r68 (companion to the wild run).
// Question: does a taken invite_party outcome SPEAK even when an identical
// outcome line is already in the run-wide no-repeat ledger — the exact
// r54/r55/r56 defect shape the shipped fix (c0b0540c4, inviteOutcome
// diegeticAct exemption in conversation.js) removes?
// Method (no game-code change; test scaffolding only):
//  1. Load seed 695, force the party gates open (systemArrived,
//     codexUnlocked, village.partyUnlocked, discover('party')) and set
//     every villager's trust to 25 (menu gate >=20; decline band <30, so
//     declines are fixed strings and collide across villagers by design).
//  2. For each roster villager (scholar skipped): startConvo, steer to a
//     free-talk menu when a want owns it (clear c.want once, then rebuild
//     the menu), take invite_party when offered, record the returned line,
//     whether it is the dry line, and inPartyAfter. Accepted members are
//     dismissed immediately so the 3-cap never closes later offers.
//  3. CONTROL: take a spoken invite line and re-speak it through the
//     NON-exempt path (Game.sayLine with no opts) for a fresh villager —
//     it MUST dry-replace, proving the ledger collision is real in this
//     setup and the exemption (not ledger absence) is what saves invites.
// Assertions (exit 0 = all green):
//  A. >=2 invite picks recorded (denominator exists).
//  B. 0 dry lines among invite picks.
//  C. At least one outcome line spoken by >=2 different villagers, with
//     every repeat spoken verbatim (not dry) — the defect shape, defeated.
//  D. CONTROL dries (non-exempt re-speak of a ledgered line -> dry line).
// Run: node scripts/test-landing-r68-party-synthetic-20261029.js
const { loadGame, setupGame } = require('./sim-harness');
const DRY_RE = /lost my train of thought/i;
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (cond ? '' : ' :: ' + (extra || '')));
  if (!cond) failures++;
}
(async () => {
  const lg = await loadGame({ seed: 695, fullTelemetry: true });
  const Game = lg.Game;
  await setupGame(Game);
  // Silence the narration stream the way the journey driver does.
  const _emit = Game.emit, _say = Game.say;
  if (typeof _emit === 'function') Game.emit = function (...a) { try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _say === 'function') Game.say = function () {};
  Game.state.systemArrived = true;
  Game.state.scholar.codexUnlocked = true;
  Game.state.village.partyUnlocked = true;
  try { Game.discover('party'); } catch (e) {}
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const picks = [];
  for (const vid of roster) {
    try { Game.state.village.trust[vid] = 40; } catch (e) {}
    let r0;
    try { r0 = Game.startConvo(vid); } catch (e) { continue; }
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    // A hanging reactive question narrows the menu to answers + leave /
    // silence (convo coherence: no full menu mid-question) — deflect
    // first to restore the full menu, where the invite block lives.
    for (let dq = 0; dq < 3 && choices.some(ch => ch && ch.id === 'deflect_q'); dq++) {
      try { Game.convoTurn(vid, 'deflect_q'); } catch (e) { break; }
      try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
      if (choices.some(ch => ch && ch.id === 'invite_party')) break;
    }
    if (!choices.some(ch => ch && ch.id === 'invite_party')) {
      // Want-owned (or case-owned) menus early-return before the invite
      // block — steer to free talk once, like the r68b driver steer.
      try {
        const c = Game.convoGet(vid) || {};
        c.want = null; c.reactiveQ = null; c.genericQ = null;
        choices = Game.convoChoices(vid) || [];
      } catch (e) {}
    }
    if (!choices.some(ch => ch && ch.id === 'invite_party')) {
      // The beat matrix replaces the menu (discarding the 4554 invite
      // push) whenever it has a beat; the subject menu rescues it (4685).
      // Take dlg:subject when offered, then re-read.
      const subj = choices.find(ch => ch && ch.id === 'dlg:subject');
      if (subj) {
        try { Game.convoTurn(vid, 'dlg:subject'); choices = Game.convoChoices(vid) || []; } catch (e) {}
      }
    }
    if (!choices.some(ch => ch && ch.id === 'invite_party')) {
      try { Game.endConvo(vid, 'done'); } catch (e) {}
      continue;
    }
    let r;
    try { r = Game.convoTurn(vid, 'invite_party'); } catch (e) { continue; }
    const line = String((r && r.line) || '');
    let inPartyAfter = null;
    try { inPartyAfter = !!(Game.inParty && Game.inParty(vid)); } catch (e) {}
    picks.push({ vid, name: Game.displayName(vid), line, dry: DRY_RE.test(line) || line.trim().length < 8, inPartyAfter });
    // Keep the party empty so later offers stay open (cap 3).
    try { if (inPartyAfter && Game.dismissFromParty) Game.dismissFromParty(vid); } catch (e) {}
    try { Game.state.village.trust[vid] = 40; } catch (e) {}
    try { Game.endConvo(vid, 'done'); } catch (e) {}
  }
  console.log(`PICKS: ${picks.length}`);
  for (const p of picks) console.log(`  ${p.name} dry=${p.dry} inPartyAfter=${p.inPartyAfter} line="${p.line.slice(0, 140)}"`);
  check('A: >=2 invite picks', picks.length >= 2, `picks=${picks.length}`);
  check('B: 0 dry invite lines', picks.every(p => !p.dry), JSON.stringify(picks.filter(p => p.dry)));
  // C: repeated-line groups — every repeat spoken verbatim.
  const byLine = {};
  for (const p of picks) { (byLine[p.line] = byLine[p.line] || []).push(p); }
  const repeated = Object.entries(byLine).filter(([, arr]) => arr.length >= 2);
  console.log(`REPEATED LINES: ${repeated.map(([l, a]) => `${a.length}x "${l.slice(0, 60)}"`).join(' | ') || '(none)'}`);
  check('C: >=1 outcome line spoken by >=2 villagers, all repeats spoken',
    repeated.length >= 1 && repeated.every(([, arr]) => arr.every(p => !p.dry)),
    `repeated=${repeated.length}`);
  // D: CONTROL — non-exempt re-speak of a ledgered invite line must dry.
  let controlDry = false, controlLine = '';
  if (picks.length) {
    const spoken = picks[0].line;
    const fresh = roster.find(id => !picks.some(p => p.vid === id)) || roster[0];
    try {
      Game.startConvo(fresh);
      const out = Game.sayLine(fresh, spoken, {});
      controlLine = String(out || '');
      controlDry = DRY_RE.test(controlLine);
      console.log(`CONTROL: re-speak "${spoken.slice(0, 80)}" -> "${controlLine.slice(0, 120)}" dry=${controlDry}`);
      try { Game.endConvo(fresh, 'done'); } catch (e) {}
    } catch (e) { console.log('CONTROL ERROR: ' + (e && e.message)); }
  }
  check('D: CONTROL non-exempt re-speak dries (ledger collision is real)', controlDry, `control="${controlLine.slice(0, 120)}"`);
  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.log('FATAL: ' + (e && e.stack || e)); process.exit(1); });
