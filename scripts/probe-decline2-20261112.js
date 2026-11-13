// Probe 2: trace convoMenuPage inputs/outputs for an invite-only sitting.
// Run from ~/workspace/worktrees/journey-scale: node scripts/probe-decline2-20261112.js
'use strict';
const K = require('./godpath/lib');

(async () => {
  const Game = await K.load({ seed: 134100 });
  function ids(menu) { return (menu || []).map(c => c && c.id); }
  // trace convoMenuPage
  const origCMP = Game.convoMenuPage.bind(Game);
  let callN = 0;
  Game.convoMenuPage = function (vid, choices) {
    const c = Game.convoGet(vid);
    const tag = c && c.spokenBeat && c.spokenBeat.tag;
    const out = origCMP(vid, choices);
    callN++;
    console.log('CMP#' + callN, 'tag=' + tag, 'thread=' + (c && c.thread),
      'IN=' + JSON.stringify(ids(choices)), 'OUT=' + JSON.stringify(ids(out)));
    return out;
  };
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
  console.log('--- before sayLine ---');
  console.log('betrayalChoices:', JSON.stringify(ids(Game.betrayalChoices(vid))));
  const said = Game.sayLine(vid, label, { inviteBeat: true, tag: 'invitation' });
  console.log('--- after sayLine, calling fullMenu ---');
  console.log('fullMenu:', JSON.stringify(ids(Game.convoChoices(vid))));
})();
