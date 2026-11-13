// Probe: where does betrayal:decline go after a post-open sayLine?
// Run from ~/workspace/worktrees/journey-scale: node scripts/probe-decline-20261112.js
'use strict';
const K = require('./godpath/lib');

(async () => {
  const Game = await K.load({ seed: 134100 });
  function ids(menu) { return (menu || []).map(c => c && c.id); }
  function fresh() {
    K.newRun(Game);
    Game.state.otherVillages = Game.state.otherVillages || [];
    for (const [id, name] of [['village_test_a', 'Thornfield'], ['village_test_b', 'Stonebridge']]) {
      if (!Game.state.otherVillages.some(v => v && v.id === id)) Game.state.otherVillages.push({ id, name });
    }
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const comm = (vid) => { try { const c = Game.commLevel(vid); return c && c.level; } catch (e) { return '?'; } };
    return { speaking: others.filter(vid => comm(vid) !== 'none'), scholarId };
  }
  function day() { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } }
  const f = fresh();
  let vid = null;
  for (const cand of f.speaking) {
    const opened = Game.talkTo(cand);
    if (!opened) continue;
    const c = Game.convoGet(cand);
    if (c && c.active) { vid = cand; break; }
    try { Game.endConvo(cand, 'left'); } catch (e) {}
  }
  console.log('villager:', vid);
  const hist = Game.inviteHistory(vid);
  hist.pending = { defId: 'air', day: day() };
  const label = Game.inviteLabelFor(vid, hist.pending);
  console.log('label:', JSON.stringify(label));
  console.log('betrayalChoices BEFORE sayLine:', JSON.stringify(ids(Game.betrayalChoices(vid))));
  const said = Game.sayLine(vid, label, { inviteBeat: true, tag: 'invitation' });
  console.log('sayLine returned:', JSON.stringify(said));
  console.log('spokenBeat AFTER sayLine:', JSON.stringify(Game.convoGet(vid).spokenBeat));
  console.log('inviteSpoken AFTER sayLine:', !!Game.convoGet(vid).inviteSpoken);
  console.log('betrayalChoices AFTER sayLine:', JSON.stringify(ids(Game.betrayalChoices(vid))));
  console.log('buildMenu AFTER sayLine:', JSON.stringify(ids(Game.buildMenu(vid))));
  console.log('fullMenu AFTER sayLine:', JSON.stringify(ids(Game.convoChoices(vid))));
  // Second call — cache?
  console.log('fullMenu AGAIN:', JSON.stringify(ids(Game.convoChoices(vid))));
  // What does pendingInvite say?
  console.log('pendingInvite:', JSON.stringify(Game.pendingInvite(vid)));
})();
