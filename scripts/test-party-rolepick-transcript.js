// test-party-rolepick-transcript.js — proof test for the r117
// rolepick-handover fix (src/js/party-formal.js: partyConvoTurn).
// BUG (r104 #2, r108 wrinkle 2): assignRole DOES say a handover line
// ("X nods, stepping back. 'Scout is yours now.'") plus an assignment
// line, but partyConvoTurn's rolepick branch returned
// { line: r.ok ? null : r.msg }, and the convoTurn wrapper only pushes
// res.line into c.transcript — so during a conversation the player
// never saw the handover they just caused, and a re-pick read as two
// people holding scout. The same swallow hit namepick (nameParty's
// say line discarded on ok).
// Three behavioral cases, each in its own process (one harness per
// process). Setup uses state writes for party unlock/naming (the same
// class as the r108 recap probe's health writes, disclosed here);
// the conversation picks themselves go through real machinery
// (startConvo / convoTurn / partyConvoTurn / assignRole / nameParty).
//   (a) re-pick: A holds scout, player re-picks scout for B in a real
//       conversation with B -> c.transcript must contain BOTH the
//       handover line (stepping back) and the assignment line.
//   (b) first-pick: nobody holds scout, player picks scout for B ->
//       c.transcript must contain the assignment line.
//   (c) name-pick: unnamed party, player picks a name -> c.transcript
//       must contain the naming line ("It hangs in the air").
// Usage: node scripts/test-party-rolepick-transcript.js (parent spawns
// CASE=a|b|c). No repo writes; verdicts print as "CASE x PASS/FAIL".
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function livingRoster(Game) {
  try { return (Game.state.village.roster || []).filter(id => ((Game.state.village.health || {})[id] ?? 100) > 0); } catch (e) { return []; }
}
function transcript(Game, vid) {
  try { return ((Game.convoGet(vid) || {}).transcript || []).map(e => `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text)}`); } catch (e) { return []; }
}
function pickTurn(Game, vid, id) {
  const choices = Game.convoChoices(vid) || [];
  if (!choices.some(x => x.id === id)) return false;
  try { Game.convoTurn(vid, id); } catch (e) { return false; }
  const cc = Game.convoGet(vid);
  return !!(cc && cc.active);
}
// Drive the conversation until the target pick is offered (an opening
// question's reactive menu trims non-protected items like party_role;
// answering the question first restores the full menu — the same shape
// the panel driver's driveConvo uses). Returns true if picked.
function driveToPick(Game, vid, id, maxTurns) {
  const picked = [];
  for (let t = 0; t < (maxTurns || 14); t++) {
    const choices = Game.convoChoices(vid) || [];
    if (choices.some(x => x.id === id)) { pickTurn(Game, vid, id); return true; }
    let pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!pick) pick = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id) && !picked.includes(x.id));
    if (!pick) return false;
    picked.push(pick.id);
    try { Game.convoTurn(vid, pick.id); } catch (e) { return false; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) return false;
  }
  return false;
}
async function setupParty(Game) {
  await runDays(Game, competent, { days: 2 });
  const v = Game.state.village;
  Game.state.systemArrived = true;
  Game.state.scholar.codexUnlocked = true;
  v.partyUnlocked = true;
  v.partyMax = 3;
  const members = livingRoster(Game).filter(id => id !== Game.villagerId).slice(0, 2);
  v.party = members.slice();
  v.trust = v.trust || {};
  for (const id of members) v.trust[id] = 90;
  return members;
}
async function runCase(which) {
  const { Game } = await loadGame({ seed: 39997, mode: 'rolepick-proof-r117', fullTelemetry: true });
  await setupGame(Game);
  const members = await setupParty(Game);
  if (members.length < 2) { console.log(`CASE ${which} FAIL -- fewer than 2 living roster members`); process.exit(1); }
  const [A, B] = members;
  const v = Game.state.village;
  let ok = false, detail = '';
  if (which === 'a' || which === 'b') {
    v.partyName = 'The Test Party';
    if (which === 'a') {
      const r = Game.assignRole(A, 'scout');
      if (!r.ok) { console.log(`CASE ${which} FAIL -- setup assignRole(A,scout) not ok: ${r.msg}`); process.exit(1); }
    }
    const s = Game.startConvo(B);
    if (!s || s.refused || s.ended) { console.log(`CASE ${which} FAIL -- convo refused`); process.exit(1); }
    if (!driveToPick(Game, B, 'party_role')) { console.log(`CASE ${which} FAIL -- party_role pick not offered`); process.exit(1); }
    pickTurn(Game, B, 'party_rolepick:scout');
    try { Game.endConvo(B, 'left'); } catch (e) {}
    const t = transcript(Game, B).join('\n');
    const hasAssign = /is .* Scout now/.test(t);
    const hasHandover = /stepping back/.test(t);
    if (which === 'a') { ok = hasAssign && hasHandover; detail = `assign=${hasAssign} handover=${hasHandover}`; }
    else { ok = hasAssign; detail = `assign=${hasAssign}`; }
    if (!ok) console.log(`TRANSCRIPT:\n${t.slice(0, 2000)}`);
  } else if (which === 'c') {
    v.partyName = null; v.partyRoles = {};
    const s = Game.startConvo(B);
    if (!s || s.refused || s.ended) { console.log(`CASE ${which} FAIL -- convo refused`); process.exit(1); }
    if (!driveToPick(Game, B, 'party_name')) { console.log(`CASE ${which} FAIL -- party_name pick not offered`); process.exit(1); }
    const choices = Game.convoChoices(B) || [];
    const np = choices.find(x => x.id.indexOf('party_namepick:') === 0);
    if (!np) { console.log(`CASE ${which} FAIL -- no namepick offered`); process.exit(1); }
    pickTurn(Game, B, np.id);
    try { Game.endConvo(B, 'left'); } catch (e) {}
    const t = transcript(Game, B).join('\n');
    ok = /hangs in the air/.test(t);
    detail = `naming-line=${ok}`;
    if (!ok) console.log(`TRANSCRIPT:\n${t.slice(0, 2000)}`);
  }
  console.log(`CASE ${which} ${ok ? 'PASS' : 'FAIL'} -- ${detail}`);
  process.exit(ok ? 0 : 1);
}
if (require.main === module) {
  const which = process.env.CASE;
  if (which) { runCase(which).catch(e => { console.log(`CASE ${which} FAIL -- threw: ${e.message}`); process.exit(1); }); }
  else {
    let fails = 0;
    for (const c of ['a', 'b', 'c']) {
      try {
        const out = execFileSync(process.execPath, [path.join(__dirname, 'test-party-rolepick-transcript.js')], { env: { ...process.env, CASE: c }, encoding: 'utf8', timeout: 120000 });
        process.stdout.write(out);
      } catch (e) {
        process.stdout.write((e.stdout || '') + (e.stderr || ''));
        fails++;
      }
    }
    console.log(fails ? `ROLEPICK-PROOF: ${fails} case(s) FAILED` : 'ROLEPICK-PROOF: ALL PASS');
    process.exit(fails ? 1 : 0);
  }
}
