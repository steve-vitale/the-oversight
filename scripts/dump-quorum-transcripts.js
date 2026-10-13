#!/usr/bin/env node
// dump-quorum-transcripts.js — capture clean moot transcripts for
// sense-testing (SENSE-TESTING LAW: read them like a villager).
// Usage: node scripts/dump-quorum-transcripts.js > /tmp/quorum-transcripts.txt
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof' });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  const v = Game.state.village;
  const me = Game.villagerId;
  const npcs = (Game.npcIds() || []).filter(id => id !== me);
  const origTally = Game.tallyVotes.bind(Game);
  const snap = () => { const out = lines.splice(0, lines.length); return out; };

  // ---- T1: NPC case, below-quorum GUILTY advisory ----
  const [leader, accomplice, victim, witness] = npcs;
  const plot = { id: 'p_t1', day: Game.state.scholar.day, leader, accomplices: [accomplice], target: victim, weakest: accomplice, witnesses: [witness] };
  Game.betrayalState().plots.push(plot);
  const c = Game.openCase(plot, 'murder');
  for (const id of Game.npcIds()) c.belief[id] = -40;
  Game.tallyVotes = (cc, w, r) => {
    const t = origTally(cc, w, r);
    t.present = t.present.slice(0, 1); t.playerVoter = false;
    t.guilty = t.present.length; t.votes = t.present.map(vid => ({ vid, vote: 'guilty', score: -40 }));
    return t;
  };
  snap();
  Game.conductTrial(c);
  console.log('############ T1: BELOW-QUORUM GUILTY -> ADVISORY ############');
  console.log(snap().join('\n'));

  // ---- T2: re-convene after 3 days, natural attendance -> binds ----
  Game.tallyVotes = origTally;
  Game.state.scholar.day += 3;
  Game.mootAdvisoryTick();
  console.log('\n############ T2: RE-CALL (3 days later) ############');
  console.log(snap().join('\n'));
  Game.state.scholar.day += 5;
  Game.npcMootTick();
  console.log('\n############ T3: RECONVENED MOOT VERDICT ############');
  console.log(snap().join('\n'));
  console.log(`(case status: ${c.status}, resolution: ${c.resolution})`);

  // ---- T4: player case, below-quorum ACQUIT advisory ----
  const pv = npcs[4];
  Game.recordCrime('theft', { witnessed: true, victim: pv });
  const pc = Game.forcePlayerAccusation();
  Game.tallyVotes = (cc, w, r) => {
    const t = origTally(cc, w, r);
    t.present = t.present.slice(0, 1); t.playerVoter = false;
    t.guilty = 0; t.votes = t.present.map(vid => ({ vid, vote: 'acquit', score: 40 }));
    return t;
  };
  snap();
  Game.conductTrial(pc);
  console.log('\n############ T4: PLAYER CASE, BELOW-QUORUM ACQUIT -> ADVISORY ############');
  console.log(snap().join('\n'));
  console.log(`(case status: ${pc.status}, resolution: ${pc.resolution})`);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
