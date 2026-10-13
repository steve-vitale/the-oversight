#!/usr/bin/env node
// Probe: party formation end to end — the [invite_party] conversation option
// exists, but 0 villagers joined in 4x40d establishment sims because the
// competent policy never takes it. This probe takes it once and verifies
// the machinery: acceptance, party membership, cap accounting.
// Usage: node scripts/test-party-invite-probe-20261013.js
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const lg = await loadGame({ seed: 31337 });
  const Game = lg.Game;
  Game.genDetail = function () { return {}; };
  await setupGame(Game);
  // advance to post-System (party unlock day 7) via the journey day loop
  const { competent } = require('./policies/competent');
  const { driveFights, driveContests } = require('./sim-harness');
  const ctx = {};
  let guard = 0;
  while (((Game.state.scholar || {}).day || 0) < 9 && !Game.over && guard++ < 60) {
    for (let p = 0; p < 3; p++) {
      try { competent.upkeep(Game, ctx); } catch (e) {}
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) {}
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) break;
    }
    if (Game.over) break;
    try { competent.daily(Game, ctx); } catch (e) {}
    driveFights(Game, competent, ctx);
    driveContests(Game, competent, ctx);
    try { Game.sleep(); } catch (e) {}
    driveContests(Game, competent, ctx);
  }
  const day = (Game.state.scholar || {}).day;
  console.log(`day=${day} systemArrived=${!!(Game.state && Game.state.systemArrived)}`);
  const cap0 = Game.partyCap ? Game.partyCap() : null;
  const mem0 = Game.partyMembers ? Game.partyMembers().length : null;
  console.log(`party before: ${mem0}/${cap0}`);
  // gate diagnostics: invite_party needs systemArrived + partyUnlocked +
  // hasDiscovered('party') + effTrust >= 20
  try {
    console.log(`gates: partyUnlocked=${Game.partyUnlocked ? Game.partyUnlocked() : '?'} hasDiscovered(party)=${Game.hasDiscovered ? Game.hasDiscovered('party') : '?'}`);
    const trusts = roster.slice(0, 4).map(id => { try { return Game.displayName(id) + ':' + (((Game.state.village || {}).trust || {})[id]); } catch (e) { return id + ':?'; } });
    console.log('sample trusts: ' + trusts.join(' '));
  } catch (e) {}
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  // machinery probe: boost one villager's trust past the effTrust>=20 gate
  // (the gate itself is by design; here we test invite -> acceptance)
  try {
    const v0 = roster[0];
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[v0] = 60;
    console.log(`boosted trust for ${Game.displayName(v0)} to 60`);
  } catch (e) {}
  let invited = null, resultLine = null;
  for (const vid of roster) {
    let r0 = null;
    try { r0 = Game.startConvo(vid); } catch (e) { continue; }
    // the invite option can appear in later menus, not just the opener —
    // play a few neutral turns looking for it. If the NPC opened with a
    // question (pendingQ), answer it first — the invite gate sits in the
    // main menu builder, not the question-answer menu.
    let found = (r0.choices || []).find(c => c && c.id === 'invite_party') || null;
    let r = r0;
    for (let t = 0; t < 5 && !found; t++) {
      const choices = r.choices || [];
      const ans = choices.find(c => c && c.id.indexOf('ans:') === 0 && c.id.indexOf('honest_pass') === -1);
      const more = ans || choices.find(c => c && (c.id === 'dlg:more' || c.id === 'dlg:help' || c.id === 'dlg:subject'));
      if (!more) break;
      try { r = Game.convoTurn(vid, more.id); } catch (e) { break; }
      found = (r.choices || []).find(c => c && c.id === 'invite_party') || null;
      if (r.ended) break;
    }
    if (!found) { try { Game.endConvo(vid, 'done'); } catch (e) {} continue; }
    invited = vid;
    try {
      const r = Game.convoTurn(vid, 'invite_party');
      resultLine = r.line || '';
    } catch (e) { resultLine = 'ERROR: ' + e.message; }
    try { Game.endConvo(vid, 'done'); } catch (e) {}
    break;
  }
  const mem1 = Game.partyMembers ? Game.partyMembers() : [];
  console.log(`invited: ${invited ? Game.displayName(invited) : '(no invite_party offered)'}`);
  console.log(`result line: ${(resultLine || '').slice(0, 200)}`);
  console.log(`party after: ${mem1.length}/${Game.partyCap ? Game.partyCap() : '?'}`);
  const ok = !!invited && mem1.includes(invited);
  console.log(ok ? 'PASS: invite -> party membership' : (invited ? 'FAIL: invite did not add to party (maybe refused — check line)' : 'FAIL: no invite offered'));
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
