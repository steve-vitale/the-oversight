#!/usr/bin/env node
// test-social-gossip-20261011.js — proof for longsim social r1 (gossip lever).
// 1. Spread: seeded gossip reaches multiple hearers and distortion >= 2
//    (the mutation path) within the 3-day gossip lifetime.
// 2. Line variety: overheard-retelling tails vary by distortion band and
//    never repeat the same tail twice in a row (pickFresh ledger).
// 3. Regression: gossip still moves REP only, never trust (canon: Trust != reputation).
'use strict';
const { execSync, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 0. syntax check on the touched file
try {
  execFileSync(process.execPath, ['--check', path.join(__dirname, '..', 'src/js/game.js')], { stdio: 'pipe' });
  console.log('PASS syntax src/js/game.js');
} catch (e) { console.log('FAIL syntax src/js/game.js'); process.exit(1); }

const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('PASS ' + name); }
    else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };

  const { Game } = await loadGame({ seed: 424242, mode: 'proof', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };

  const roster = Game.state.village.roster.filter(id => id !== Game.villagerId);
  ok('roster has tellers', roster.length >= 6, 'roster=' + roster.length);

  // 1. SPREAD: seed one gossip with 2 tellers, run 12 parts (3 days)
  const v = Game.state.village;
  v.gossip = [];
  const tellers = roster.slice(0, 2);
  v.gossip.push({
    action: 'theft', dims: { honest: -15, generous: -10, who: roster[4] },
    heard: [...tellers], distortion: 0, day: Game.state.scholar.day,
    partKey: 'proof', noTrust: true,
  });
  for (let p = 0; p < 12; p++) { try { Game.spreadGossip(); } catch (e) { ok('spreadGossip no-throw', false, e.message); } }
  const g = v.gossip[0];
  ok('gossip spread to 3+ hearers in 3 days', g.heard.length >= 3, 'heard=' + g.heard.length);
  ok('distortion reached mutation band (>=2)', g.distortion >= 2, 'distortion=' + g.distortion);
  ok('heard list has no duplicates', new Set(g.heard).size === g.heard.length);

  // 2. LINE VARIETY: force the overhear path across distortion bands.
  // Drive spread until we collect fragment lines, then check tail variety.
  lines.length = 0;
  v.gossip = [];
  // Pin talkative tellers: prickly/withdrawn villagers pass stories on at
  // 12%, so whether 40 passes yield overheard fragments was roster luck
  // (origins-world 2026-10-14 rerolled the cast). Background survivors
  // read 'steady' by default; generated ones carry a drawn temperament.
  for (const id of roster.slice(0, 4)) { const rec = (Game.data.villagers || []).find(x => x.id === id); if (rec) { rec.personality = rec.personality || {}; rec.personality.temperament = 'warm'; } }
  v.gossip.push({
    action: 'theft', dims: { honest: -15, generous: -10, who: roster[4] },
    heard: roster.slice(0, 4), distortion: 5, day: Game.state.scholar.day,
    partKey: 'proof2', noTrust: true,
  });
  for (let p = 0; p < 40 && lines.filter(l => l.includes('fragments by the fire')).length < 6; p++) {
    // a story the whole roster has heard can't be overheard again; retell it
    // from the first four (fragments fire ~13% per retelling, so one pass of
    // 7 listeners often yields none — roster luck decided it before).
    const g0 = v.gossip[0];
    if (g0 && g0.heard.length >= roster.length) g0.heard = roster.slice(0, 4);
    try { Game.spreadGossip(); } catch (e) {}
  }
  const frags = lines.filter(l => l.includes('fragments by the fire'));
  const tails = frags.map(l => l.split('about ')[1] ? l.slice(l.lastIndexOf('. ', l.length - 2) + 2) : l);
  const uniqTails = new Set(frags.map(l => { const m = l.match(/about .*?\. (.*)$/); return m ? m[1] : l; }));
  ok('overhear lines fired', frags.length >= 2, 'frags=' + frags.length);
  ok('tails vary (no single verbatim template)', uniqTails.size >= 2, 'unique=' + uniqTails.size);
  let immediateRepeat = false;
  for (let i = 1; i < frags.length; i++) {
    const a = (frags[i - 1].match(/about .*?\. (.*)$/) || [])[1];
    const b = (frags[i].match(/about .*?\. (.*)$/) || [])[1];
    if (a && a === b) immediateRepeat = true;
  }
  ok('no immediate tail repeat', !immediateRepeat);

  // 3. REGRESSION: gossip moves REP only, never trust.
  const subj = roster[5];
  const trustBefore = (v.trust || {})[subj];
  const repBefore = JSON.stringify(Game.repOf(subj));
  v.gossip = [{
    action: 'stingy', dims: { who: subj }, heard: [roster[0]],
    distortion: 0, day: Game.state.scholar.day, partKey: 'proof3', noTrust: true,
  }];
  for (let p = 0; p < 8; p++) { try { Game.spreadGossip(); } catch (e) {} }
  const trustAfter = (v.trust || {})[subj];
  const repAfter = JSON.stringify(Game.repOf(subj));
  ok('gossip did not move trust', trustBefore === trustAfter,
    `before=${trustBefore} after=${trustAfter}`);
  ok('gossip moved rep', repBefore !== repAfter);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
