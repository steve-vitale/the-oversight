// test-invite-ask-label.js — proof test for the r112 invite-wording fix
// (succession panel: every invite transcript shows TWO consecutive YOU
// lines saying different things — the dialogue layer speaks the menu
// choice "Want to come with us?" and the invite_party handler then speaks
// "Want to come with me?").
// Two behavioral cases, each in its own process (one harness per process):
//   (a) dialogue path: pick dlg:invite -> the transcript must carry
//       exactly ONE invite ask, the "us" line the player actually chose,
//       and NO "me" line (pre-fix control: two asks, us then me).
//   (b) direct path: call convoTurn('invite_party') without the dialogue
//       push -> the handler still speaks its own ask exactly once, the
//       "me" line (the fix must not silence the path where nothing spoke
//       yet). NOTE: the bare menu entry never surfaced in driven menus
//       (14 turns x the roster: dlg:invite appears, invite_party does
//       not — the menu pipeline crowds it out), so the direct path is
//       constructed by calling the turn API directly, which the engine
//       does not gate on menu membership. In live play every invite
//       travels the dialogue path, which makes the flag fix complete
//       for all reachable invites — and (b) guards the handler's own
//       behavior if that ever changes.
// Usage: node scripts/test-invite-ask-label.js  (parent spawns CASE=a|b)
// No repo writes; verdicts print as "CASE x PASS/FAIL".
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  try { return (Game.state.village.roster || []).filter(id => ((Game.state.village.health || {})[id] ?? 100) > 0); } catch (e) { return []; }
}
function trustOf(Game, vid) {
  try { return ((Game.state.village || {}).trust || {})[vid] || 0; } catch (e) { return 0; }
}
function transcript(Game, vid) {
  try { return ((Game.convoGet(vid) || {}).transcript || []).map(e => ({ who: e.who, text: String(e.text) })); } catch (e) { return []; }
}
// Drive one convo until wantId appears, then pick it. avoidIds are never
// picked (case b: never spend the invite via dlg:invite while hunting the
// bare invite_party menu entry). Filler priority mirrors the succession
// driver's (probe v3 lesson: commit/cant reach the main menu again).
// Returns {picked, refused, turns, tx} with tx read AFTER endConvo.
function drivePick(Game, vid, wantId, maxTurns, avoidIds) {
  const avoid = avoidIds || [];
  const r = Game.startConvo(vid);
  if (r && (r.refused || r.ended)) return { picked: false, refused: true, turns: 0, tx: [] };
  const c0 = Game.convoGet(vid);
  if (!c0 || !c0.active) return { picked: false, refused: true, turns: 0, tx: [] };
  let picked = false, turns = 0;
  for (let t = 0; t < (maxTurns || 14); t++) {
    turns = t + 1;
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) break;
    const target = choices.find(x => x.id === wantId);
    if (target) {
      try { Game.convoTurn(vid, target.id); } catch (e) { break; }
      picked = true;
      break;
    }
    let filler = choices.find(x => /^want:/.test(x.id) && avoid.indexOf(x.id) === -1);
    if (!filler) filler = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!filler) filler = choices.find(x => x.id === 'dlg:commit');
    if (!filler) filler = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id) && avoid.indexOf(x.id) === -1);
    if (!filler) filler = choices.find(x => x.id === 'dlg:cant');
    if (!filler) break;
    try { Game.convoTurn(vid, filler.id); } catch (e) { break; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return { picked, refused: false, turns, tx: transcript(Game, vid) };
}
function inviteAsks(tx) {
  return tx.filter(e => e.who === 'you' && /Want to come with (us|me)\?/.test(e.text)).map(e => e.text);
}
async function unlockParty(Game) {
  for (let d = 0; d < 40; d += 5) {
    await runDays(Game, competent, { days: 5 });
    try { if (Game.partyUnlocked && Game.partyUnlocked()) return Game.state.scholar.day; } catch (e) {}
  }
  return null;
}
async function runCase(which) {
  const { Game } = await loadGame({ seed: 39997, mode: 'invite-proof-r112', fullTelemetry: true });
  await setupGame(Game);
  const unlockedDay = await unlockParty(Game);
  if (unlockedDay == null) { console.log('CASE ' + which + ' FAIL party never unlocked in 40 competent days'); return false; }
  const self = Game.villagerId;
  const byTrust = livingRoster(Game).filter(id => id !== self).sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
  if (which === 'a') {
    for (const vid of byTrust) {
      const d = drivePick(Game, vid, 'dlg:invite', 14, []);
      if (!d.picked) continue;
      const asks = inviteAsks(d.tx);
      const us = asks.filter(a => /with us\?/.test(a)).length;
      const me = asks.filter(a => /with me\?/.test(a)).length;
      if (asks.length === 1 && us === 1 && me === 0) {
        console.log('CASE a PASS villager=' + firstName(rawName(Game, vid)) + ' asks=' + JSON.stringify(asks));
        return true;
      }
      console.log('CASE a FAIL villager=' + firstName(rawName(Game, vid)) + ' asks=' + JSON.stringify(asks));
      return false;
    }
    console.log('CASE a FAIL no dlg:invite pick on any villager');
    return false;
  }
  // (b) direct path: bypass the menu (which never offers the bare entry
  // in driven play) and call the handler straight from a fresh convo.
  // No dialogue push precedes it, so the handler must speak its own ask.
  for (const vid of byTrust) {
    const r = Game.startConvo(vid);
    if (r && (r.refused || r.ended)) continue;
    const c0 = Game.convoGet(vid);
    if (!c0 || !c0.active) continue;
    try { Game.convoTurn(vid, 'invite_party'); } catch (e) { /* fall through: no ask recorded */ }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    const tx = transcript(Game, vid);
    const asks = inviteAsks(tx);
    if (!asks.length) continue;
    const us = asks.filter(a => /with us\?/.test(a)).length;
    const me = asks.filter(a => /with me\?/.test(a)).length;
    if (asks.length === 1 && me === 1 && us === 0) {
      console.log('CASE b PASS villager=' + firstName(rawName(Game, vid)) + ' asks=' + JSON.stringify(asks));
      return true;
    }
    console.log('CASE b FAIL villager=' + firstName(rawName(Game, vid)) + ' asks=' + JSON.stringify(asks));
    return false;
  }
  console.log('CASE b FAIL no direct invite_party call produced an ask');
  return false;
}
async function parent() {
  let ok = true;
  for (const c of ['a', 'b']) {
    try {
      const out = execFileSync('node', [path.join(__dirname, 'test-invite-ask-label.js'), 'case-' + c], { encoding: 'utf8', timeout: 300000 });
      process.stdout.write(out);
      if (!out.includes('CASE ' + c + ' PASS')) ok = false;
    } catch (e) {
      process.stdout.write((e.stdout || '') + (e.stderr || ''));
      console.log('CASE ' + c + ' FAIL (child error)');
      ok = false;
    }
  }
  console.log(ok ? 'INVITE-ASK PROOF: ALL PASS' : 'INVITE-ASK PROOF: FAILURES PRESENT');
  process.exit(ok ? 0 : 1);
}
if (process.argv[2] && process.argv[2].startsWith('case-')) {
  runCase(process.argv[2].slice(5)).then(ok => process.exit(ok ? 0 : 1)).catch(e => { console.error('CASE ERROR: ' + (e && e.stack || e)); process.exit(1); });
} else {
  parent().catch(e => { console.error('PROOF FAILED: ' + (e && e.stack || e)); process.exit(1); });
}
