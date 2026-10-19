#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('fireside-presence');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 7) }); G.debugRegion = 'na_eastern_woodlands'; K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  const [teacher, learner] = v.roster.filter(id => id !== G.villagerId);
  const pid = 'hemlock', wrongPid = 'dandelion';
  G.map.px = 0; G.map.py = 0; s.insideHaven = false;
  v.wrongAbout = v.wrongAbout || {}; v.wrongAbout[teacher] = { [pid]: { wrongPid, deliberate: false } };
  const resetLesson = () => { v.sharedKnowledge = { [pid]: { taughtAround: false, discoveredBy: teacher, level: 2, taughtDay: 0 } }; };
  T.ok('fixture uses actual canonical lesson plants', G.data.plants.some(p => p.id === pid) && G.data.plants.some(p => p.id === wrongPid));
  const lines = []; G.say = text => lines.push(String(text));
  const teach = present => { const random = Math.random; try { Math.random = () => 0; G.firesideTeaching(present); } finally { Math.random = random; } };
  delete G.state.codex.plants[pid]; resetLesson(); teach(false);
  T.ok('an absent novice does not learn the false lesson', !G.state.codex.plants[pid]);
  T.ok('the village still shares and believes its false lesson', v.sharedKnowledge[pid].taughtAround && (v.wrongAbout[learner] || {})[pid]?.wrongPid === wrongPid);
  T.ok('the absent player hears no personal identification or disagreement', !lines.some(t => /IDENTIFIED|You know better|You were listening/.test(t)));
  G.state.codex.plants[pid] = { level: 3, harvests: 4 };
  const prior = JSON.stringify(G.state.codex.plants[pid]); resetLesson(); teach(false);
  T.ok('an absent expert acquires no contested claim either', JSON.stringify(G.state.codex.plants[pid]) === prior);
  delete G.state.codex.plants[pid]; resetLesson(); teach(true);
  T.ok('a present novice still believes the actual false name', G.state.codex.plants[pid]?.wrongPid === wrongPid && G.state.codex.plants[pid].level === 1);
  G.state.codex.plants[pid] = { level: 3, harvests: 4 }; resetLesson(); teach(true);
  T.ok('a present expert still contests the teacher without losing depth', G.state.codex.plants[pid].level === 3 && G.state.codex.plants[pid].contested?.claimPid === wrongPid);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
