#!/usr/bin/env node
// test-fixall-succseam.js -- PROOF for fix-all ITEM C (succession
// conversation seam verification). Reproduces the r54/r55/r56
// dropped-request seam on the party-invite path and reports whether it is
// OPEN or CLOSED on the build under test.
//
// Mechanism under test: dlg:invite delegates to invite_party, whose handler
// returns inviteToParty's real accept/decline line, but the base convoTurn
// tail emits it through sayLine with NO inviteBeat/diegeticAct exemption,
// so the run-wide no-repeat ledger can block it and substitute the first
// dry line ("...Sorry, lost my train of thought.").
//
// Modes (one process per mode; never two harnesses in one process):
//   --mode=control    invite ONE villager -> decision line must speak verbatim
//   --mode=seeded     invite A (decline), then B (same decline inputs) ->
//                     B's line is the metric
//   --mode=succession like seeded, but after Game.playerDeath to the heir,
//                     so the invites happen as the new bearer
// Exit 0 = script ran and printed a verdict line (OPEN or CLOSED);
// exit 1 = harness/setup failure (no verdict).
// Usage: node scripts/test-fixall-succseam.js --mode=seeded
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const mode = (process.argv.find(a => a.startsWith('--mode=')) || '--mode=seeded').slice(7);
const DRY = '"...Sorry, lost my train of thought."';

function npcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const t = (c && c.transcript) || [];
  for (let i = t.length - 1; i >= 0; i--) {
    if (t[i] && t[i].who === 'them') return String(t[i].text);
  }
  return null;
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-fixall-succseam' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village, s = Game.state.scholar;
  const bearer0 = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== bearer0);
  if (npcs.length < 3) { console.log('need 3 NPCs'); process.exit(1); }
  const heir = npcs[0], A = npcs[1], B = npcs[2];

  // Deterministic decline inputs for A and B: trust 45 (>=30, so the
  // else-branch decline), temperament steady, goal belong (not alone).
  const prep = (id) => {
    v.trust[id] = 45;
    try {
      const vp = Game.vpOf(id) || {};
      vp.personality = vp.personality || {}; vp.personality.temperament = 'steady';
      vp.goal = 'belong';
    } catch (e) {}
    v.bgGoals = v.bgGoals || {}; v.bgGoals[id] = 'belong';
  };
  for (const id of npcs) v.trust[id] = 5;
  v.trust[heir] = 90; prep(A); prep(B);

  // Formal-party gates (inviteToParty's own checks).
  Game.state.systemArrived = true;
  v.partyUnlocked = true;
  s.codexUnlocked = true;
  try { Game.discover('party'); } catch (e) {}
  // Stub the character decision to a decline for both invitees, so the
  // decision line is deterministic and the ledger is the only variable.
  Game.npcInviteDecision = () => ({ accept: false, chance: 0, reasons: [] });

  const invite = (id) => {
    const r = Game.startConvo(id);
    const c = Game.convoGet(id);
    if (!c || !c.active) return { ok: false, line: null, why: 'convo not active', open: r };
    const res = Game.convoTurn(id, 'invite_party');
    const line = npcLine(Game, id);
    try { Game.endConvo(id, 'left'); } catch (e) {}
    return { ok: true, line, turnLine: res && res.line, inParty: !!(Game.inParty && Game.inParty(id)) };
  };

  if (mode === 'succession') {
    Game.playerDeath('the hunt');
    const bearer1 = Game.villagerId;
    console.log(`bearer: ${bearer0} -> ${bearer1} (heir-was ${heir}, match=${bearer1 === heir})`);
    // Re-assert post-mantle setup (mantle remaps trust/scholar state).
    prep(A); prep(B);
    Game.state.systemArrived = true;
    Game.state.village.partyUnlocked = true;
    Game.state.scholar.codexUnlocked = true;
    try { Game.discover('party'); } catch (e) {}
    Game.npcInviteDecision = () => ({ accept: false, chance: 0, reasons: [] });
  }

  if (mode === 'accept') {
    // Accept path: pre-seed the run ledger with ALL FOUR accept lines
    // (spoken to a dummy villager via sayLine, the same ledger the tail
    // consults), then invite B with an accept stub. Without the fix every
    // accept line is run-blocked and B dissolves to a dry line even
    // though B actually joins the party; with the fix B speaks one.
    const YES = ['"Okay. Yeah. I trust you."', '"Someone should watch your back. Might as well be me."',
      '"Alright. But I\'m not carrying your stuff."', '"...Fine. This had better be worth it."'];
    const D = npcs[3];
    if (!D) { console.log('need 4 NPCs'); process.exit(1); }
    Game.npcInviteDecision = () => ({ accept: true, chance: 100, reasons: [] });
    Game.startConvo(D);
    for (const l of YES) { try { Game.sayLine(D, l); } catch (e) {} }
    try { Game.endConvo(D, 'left'); } catch (e) {}
    const b2 = invite(B);
    console.log(`B invite (accept): line=${JSON.stringify(b2.line)} inParty=${b2.inParty} ok=${b2.ok}`);
    const spoken = YES.includes(b2.line);
    const dry2 = b2.line === DRY || (Game.convoIsDeflectionLine && Game.convoIsDeflectionLine(b2.line));
    console.log(`VERDICT: ${(!dry2 && b2.inParty) ? 'ACCEPT-CLOSED (decision spoken AND party joined)' : 'ACCEPT-OPEN (line=' + JSON.stringify(b2.line) + ' inParty=' + b2.inParty + ')'}`);
    process.exit(0);
  }

  let aRes = null, bRes = null;
  if (mode !== 'control') { aRes = invite(A); console.log(`A invite: line=${JSON.stringify(aRes.line)} inParty=${aRes.inParty} ok=${aRes.ok} ${aRes.why || ''}`); }
  bRes = invite(B);
  console.log(`B invite: line=${JSON.stringify(bRes.line)} inParty=${bRes.inParty} ok=${bRes.ok} ${bRes.why || ''}`);
  if (!bRes.ok) { console.log('VERDICT: NO-VERDICT (invite turn did not run)'); process.exit(1); }
  const bDry = bRes.line === DRY || (Game.convoIsDeflectionLine && Game.convoIsDeflectionLine(bRes.line));
  if (mode === 'control') {
    console.log(`VERDICT: ${bDry ? 'OPEN (control itself dropped!)' : 'CONTROL-OK (decision line spoken verbatim)'}`);
  } else {
    const sameAsA = aRes && aRes.line && bRes.line === aRes.line;
    console.log(`A==B line: ${sameAsA}`);
    console.log(`VERDICT: ${bDry ? 'OPEN (second invite dissolved into a deflection line)' : (sameAsA ? 'CLOSED (second invite spoke the decision line)' : 'MIXED (second line differs from first, neither a deflection)')}`);
  }
})().catch(e => { console.log('THREW: ' + (e && e.stack || e)); process.exit(1); });
