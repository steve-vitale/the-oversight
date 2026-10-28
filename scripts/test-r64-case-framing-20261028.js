#!/usr/bin/env node
// test-r64-case-framing-20261028.js -- journey-landing r64 proof.
// THE UNINTRODUCED CASE MENU (r63 carried blank, 677 d10 + 680 d11): a
// conversation menu offers betrayal case actions (site / witnesses /
// investigate / moot / letlie) with no spoken line introducing the case.
// 680 d11 is the opening-menu shape: the menu leads with four case actions
// ("Call a moot - put the ambush of Valeria to the village") while talking
// TO Valeria, and the only spoken beats are generic. 677 d10 is the
// mid-sitting shape: after a spoken invitation is declined, the case menu
// ("the murder of Viola") appears at turn 2 with no framing line.
// Same defect class as the invitation-blind-accept fixed by the SPOKEN LURE
// (landing r7/r8): a menu asks the player to act on something nobody said.
// Fix (betrayal.js convoChoices wrap, the single choke point where case
// options enter every menu): when a case-level action is offered for the
// first time for a given case in a sitting, speak a framing THEM line
// naming the charge + target first. Per-case flag, reset per sitting.
// RED verified pre-fix by running this file before the fix lands.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra ? '-- ' + extra : ''); }
}
const CASE_ACT = (id) => typeof id === 'string' &&
  /^(betrayal:(site|witnesses|investigate|moot|letlie|expose):)/.test(id);
const themLines = (Game, vid) =>
  (Game.convoGet(vid).transcript || []).filter(e => e.who !== 'you')
    .map(e => String(e.text || ''));
const namesCase = (lines, charge, tname) =>
  lines.some(t => t.includes(charge) && t.includes(tname));
// A hanging question OWNS its menu (convoMenuPage question-ownership):
// case actions are correctly absent until the question is answered, as in
// real play. Settle any hanging question first, then read the free menu.
function settle(Game, vid) {
  for (let i = 0; i < 8; i++) {
    const c = Game.convoGet(vid);
    if (!c.pendingQ && !c.reactiveQ && !c.genericQ) break;
    const ch = Game.convoChoices(vid).find(x => /^(ans:|react:|gq:)/.test(x.id));
    if (!ch) break;
    Game.convoTurn(vid, ch.id);
  }
}

(async () => {
  const { Game } = await loadGame({ seed: 7781, mode: 'test-r64-case-framing' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const me = Game.villagerId;
  const vids = (Game.state.village.roster || []).filter(id => id !== me);
  const [v1, v2, v3] = vids;
  const tname1 = Game.disp(v1);
  const bs = Game.betrayalState();
  // Shape (a): open known case, partner IS the target (680 d11 shape).
  bs.cases.push({ id: 'pcase1', playerRole: 'juror', status: 'open',
    target: v1, charge: 'ambush', accused: [v2], knownToPlayer: true,
    siteExamined: false, witnessesNamed: false, foundBribes: [] });
  Game.startConvo(v1);
  settle(Game, v1);
  const ids1 = Game.convoChoices(v1).map(c => c.id);
  ok('A1 free menu offers case actions', ids1.some(CASE_ACT), 'got: ' + ids1.slice(0, 8).join(','));
  const lines1 = themLines(Game, v1);
  // Partner IS the target here, so the specified line is the first-person
  // variant: charge named, "against me" instead of her own name.
  ok('A2 framing line names charge (first-person, partner is target)',
    lines1.some(t => t.includes('ambush') && t.includes('against me')),
    'them lines: ' + lines1.map(s => s.slice(0, 70)).join(' | '));
  Game.endConvo(v1, 'left');

  // Shape (c): a sitting with NO case options gets NO framing line.
  // (v3 is not a party to pcase1 in a way that offers case actions to the
  // player? pcase1 IS offered to every partner by betrayalChoices, so use a
  // fresh case-free check instead: end pcase1 first.)
  bs.cases.length = 0;
  Game.startConvo(v3);
  settle(Game, v3);
  const ids3 = Game.convoChoices(v3).map(c => c.id);
  ok('C1 no-case sitting offers no case actions', !ids3.some(CASE_ACT));
  const lines3 = themLines(Game, v3);
  ok('C2 no-case sitting speaks no case framing',
    !lines3.some(t => /matter of the|settled the/.test(t)),
    'them lines: ' + lines3.map(s => s.slice(0, 70)).join(' | '));
  Game.endConvo(v3, 'left');

  // Shape (b): case appears MID-SITTING (677 d10 shape). Start with the
  // case unknown to the player (bystander role), so no case actions; then
  // the case becomes known mid-sitting (as the invite-decline reveal does
  // on 677) and the next menu offers case actions.
  bs.cases.push({ id: 'pcase2', playerRole: 'bystander', status: 'open',
    target: v2, charge: 'murder', accused: [v3], knownToPlayer: false,
    siteExamined: false, witnessesNamed: false, foundBribes: [] });
  const tname2 = Game.disp(v2);
  Game.startConvo(v1);
  settle(Game, v1);
  const preIds = Game.convoChoices(v1).map(c => c.id);
  ok('B1 before reveal: no case actions', !preIds.some(CASE_ACT));
  const preCount = themLines(Game, v1).length;
  bs.cases[0].knownToPlayer = true;
  const postIds = Game.convoChoices(v1).map(c => c.id);
  ok('B2 after reveal: case actions appear', postIds.some(CASE_ACT));
  const postLines = themLines(Game, v1);
  const newLines = postLines.slice(preCount);
  ok('B3 framing line spoken at first mid-sitting appearance',
    namesCase(newLines, 'murder', tname2),
    'new them lines: ' + newLines.map(s => s.slice(0, 70)).join(' | '));
  // Second appearance in the SAME sitting does not re-frame (no loop).
  const midCount = themLines(Game, v1).length;
  Game.convoChoices(v1);
  const againLines = themLines(Game, v1).slice(midCount);
  ok('B4 same-sitting repeat appearance does not re-frame',
    !againLines.some(t => t.includes('murder') && t.includes(tname2)),
    'repeat lines: ' + againLines.map(s => s.slice(0, 70)).join(' | '));
  Game.endConvo(v1, 'left');

  // Shape (d): a NEW sitting re-frames (per-sitting reset).
  Game.startConvo(v1);
  settle(Game, v1);
  Game.convoChoices(v1);
  const linesD = themLines(Game, v1);
  ok('D1 new sitting re-frames the known case',
    namesCase(linesD, 'murder', tname2),
    'them lines: ' + linesD.map(s => s.slice(0, 70)).join(' | '));
  Game.endConvo(v1, 'left');

  // Shape (e): THE TURN-RETURN PATH (682 d11 shape in the wild). The
  // driver prints only r.line per turn, never transcript diffs — so a
  // transcript-appended framing line is invisible in driver transcripts
  // by construction. The real UI renders the returned transcript slice,
  // and returns evaluate choices BEFORE the slice, so the framing line
  // must be IN the turn return that first offers the case actions.
  // Replay it: fresh case, answer the hanging question via convoTurn
  // until a return's choices first include case actions, then check that
  // SAME return's transcript slice carries the framing line.
  bs.cases.length = 0;
  bs.cases.push({ id: 'pcase3', playerRole: 'juror', status: 'open',
    target: v2, charge: 'ambush', accused: [v3], knownToPlayer: true,
    siteExamined: false, witnessesNamed: false, foundBribes: [] });
  Game.startConvo(v1);
  let eRet = null, eGuard = 0;
  while (!eRet && eGuard++ < 10) {
    const c = Game.convoGet(v1);
    if (!c.pendingQ && !c.reactiveQ && !c.genericQ) {
      const ch = Game.convoChoices(v1);
      if (ch.some(CASE_ACT)) eRet = { choices: ch, transcript: (Game.convoGet(v1).transcript || []).slice() };
      break;
    }
    const ch = Game.convoChoices(v1).find(x => /^(ans:|react:|gq:)/.test(x.id));
    if (!ch) break;
    const r = Game.convoTurn(v1, ch.id);
    if (r && (r.choices || []).some(x => CASE_ACT(x.id))) eRet = r;
  }
  ok('E1 a turn return first offers case actions', !!eRet,
    'guard=' + eGuard);
  if (eRet) {
    const eThem = (eRet.transcript || []).filter(x => x.who !== 'you')
      .map(x => String(x.text || ''));
    ok('E2 that same return\'s transcript slice carries the framing line',
      namesCase(eThem, 'ambush', tname2),
      'them lines: ' + eThem.map(s => s.slice(0, 70)).join(' | '));
  }
  Game.endConvo(v1, 'left');

  console.log(`\n${pass}/${pass + fail} ${fail ? 'RED' : 'GREEN'}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
