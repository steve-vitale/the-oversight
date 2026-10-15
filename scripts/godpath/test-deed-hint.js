#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('deed-hint');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  G.state.systemArrived = true;
  const s = G.state.scholar; s.day = 85;
  const source = K.readSrc('src/js/app.js');
  const actual = source.match(/  function renderTracksSection\(\) \{[\s\S]*?\r?\n  \}/)?.[0];
  if (!actual) throw new Error('actual Tracks renderer missing');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const render = () => Function('Game', 'esc', actual + '\nreturn renderTracksSection();')(G, esc);
  T.ok('unnamed build reveals no deity objective', !render().includes('data-godpath-deed'));
  s.abilities = ['second_wind', 'survivor', 'symbiote', 'back_from_the_brink'].map(id => ({ id, level: 1 }));
  G.recognizeClass('player');
  T.ok('known class shows the actual authored objective without naming unknown abilities', render().includes('Refuse a fatal blow through your own survival magic') && !G.godpathDeedHint('player').includes('Ember Heart'));
  G.hurtVillager(G.villagerId, 999, 'contest');
  T.ok('real refusal updates the visible progress to the remaining dawn', render().includes('You refused death. Live to see another dawn.'));
  s.day++;
  T.ok('completed deed still distinguishes the remaining build/day gates', render().includes('Deed fulfilled. Your build and the day still matter.'));
  const deed = G.data.godpaths.paths.survivalist.god.deed;
  const hint = deed.hint; deed.hint = '<img src=x onerror=bad()> & "deed"';
  delete G.state.village.godpathDeeds;
  T.ok('actual Tracks renderer escapes authored objective content', render().includes('&lt;img src=x onerror=bad()&gt; &amp; &quot;deed&quot;') && !render().includes('<img src=x'));
  deed.hint = hint;
  s.godhood = { active: ['unkillable'], recognized: { unkillable: 84 } };
  T.ok('old recognized gods show no retroactive unfinished objective', !render().includes('data-godpath-deed'));
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
