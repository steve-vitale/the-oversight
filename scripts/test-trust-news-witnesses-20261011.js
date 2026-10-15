#!/usr/bin/env node
// test-trust-news-witnesses-20261011.js — proof for longsim trust r2.
// The blank: 'departure'/'return' gossip seeded with heard=[] was born dead
// (no teller -> spreadGossip can never move it; 654/654 return rumors dead0
// in the r2 baseline). Fix: seed two roster witnesses at the scene, same
// pattern as the shipped objective-departure path.
//   1. startExpedition seeds 'departure' with 2 witnesses (not the leaver,
//      not the player).
//   2. expeditionReturn seeds 'return' with 2 witnesses.
//   3. objReturnEffect('visit') seeds 'return' with 2 witnesses.
//   4. Seeded news spreads: departure/return reach 4+ hearers in 12 parts.
//   5. REGRESSION: news moves no trust and no rep (dims {who} only;
//      canon Trust != reputation).
//   6. The talk channel renders 'return' specifically ("is back"), not the
//      generic "people are talking" fallback.
//   7. Only one departure per part (seedGossip dedup unchanged).
'use strict';
const { execSync, execFileSync } = require('child_process');
const path = require('path');

// 0. syntax check on the touched files
for (const f of ['src/js/villager-agency.js', 'src/js/villager-objectives.js', 'src/js/game.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(__dirname, '..', f)], { stdio: 'pipe' }); }
  catch (e) { console.log('FAIL syntax ' + f); process.exit(1); }
}
console.log('PASS syntax (3 files)');

const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('PASS ' + name); }
    else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };

  const seed = parseInt(process.env.SEED || '20261011', 10);
  const { Game } = await loadGame({ seed, mode: 'proof', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };

  const v = Game.state.village;
  const roster = v.roster.filter(id => id !== Game.villagerId);
  ok('roster has witnesses', roster.length >= 6, 'roster=' + roster.length);
  const leaver = roster[0];
  v.gossip = [];

  // 1. expedition departure
  try { Game.startExpedition(leaver, 4, 4, true); } catch (e) { ok('startExpedition no-throw', false, e.message); }
  let dep = v.gossip.find(g => g.action === 'departure');
  ok('departure gossip seeded', !!dep);
  if (dep) {
    ok('departure has 2 witnesses', dep.heard.length === 2, 'heard=' + JSON.stringify(dep.heard));
    ok('leaver is not a witness', !dep.heard.includes(leaver));
    ok('player is not a witness', !dep.heard.includes(Game.villagerId));
    ok('witnesses are distinct', new Set(dep.heard).size === dep.heard.length);
    ok('witnesses on roster', dep.heard.every(id => (v.roster || []).includes(id)));
  }

  // 2. expedition return
  v.gossip = [];
  try { Game.expeditionReturn(leaver, true); } catch (e) { ok('expeditionReturn no-throw', false, e.message); }
  let ret = v.gossip.find(g => g.action === 'return');
  ok('return gossip seeded', !!ret);
  if (ret) {
    ok('return has 2 witnesses', ret.heard.length === 2, 'heard=' + JSON.stringify(ret.heard));
    ok('returner is not a witness', !ret.heard.includes(leaver));
    ok('player is not a witness (return)', !ret.heard.includes(Game.villagerId));
  }

  // 3. objective return (visit)
  v.gossip = [];
  const visitor = roster[1];
  try { Game.objReturnEffect(visitor, 'visit'); } catch (e) { ok('objReturnEffect no-throw', false, e.message); }
  let ret2 = v.gossip.find(g => g.action === 'return');
  ok('objective return gossip seeded', !!ret2);
  if (ret2) {
    ok('objective return has 2 witnesses', ret2.heard.length === 2, 'heard=' + JSON.stringify(ret2.heard));
    ok('objective returner is not a witness', !ret2.heard.includes(visitor));
  }

  // 7. dedup: one departure per part
  v.gossip = [];
  try {
    Game.startExpedition(roster[2], 4, 4, true);
    Game.startExpedition(roster[3], 4, 4, true);
  } catch (e) {}
  ok('one departure per part (dedup)', v.gossip.filter(g => g.action === 'departure').length === 1,
    'n=' + v.gossip.filter(g => g.action === 'departure').length);

  // 4. spread: news now travels
  v.gossip = [];
  try { Game.startExpedition(roster[4], 4, 4, true); } catch (e) {}
  const g0 = v.gossip.find(g => g.action === 'departure');
  for (let p = 0; p < 12; p++) { try { Game.spreadGossip(); } catch (e) { ok('spreadGossip no-throw', false, e.message); } }
  ok('departure news spreads (4+ hearers in 12 parts)', g0 && g0.heard.length >= 4, 'heard=' + (g0 && g0.heard.length));
  ok('departure news distorts as it travels', g0 && g0.distortion >= 1, 'distortion=' + (g0 && g0.distortion));

  v.gossip = [];
  // a homebody (range 0) never leaves; which roster slot holds one is luck
  // (origins-world 2026-10-14 rerolled the cast). Take the first traveller
  // after the ones used above.
  const rv5 = roster.slice(5).find(id => Game.npcMaxDist(id) >= 1) || roster[5];
  try { Game.startExpedition(rv5, 4, 4, true); Game.expeditionReturn(rv5, true); } catch (e) {}
  const g1 = v.gossip.find(g => g.action === 'return');
  for (let p = 0; p < 12; p++) { try { Game.spreadGossip(); } catch (e) {} }
  ok('return news spreads (4+ hearers in 12 parts)', g1 && g1.heard.length >= 4, 'heard=' + (g1 && g1.heard.length));

  // 5. REGRESSION: news moves no trust, no rep
  const subj = roster[6];
  const trustBefore = (v.trust || {})[subj];
  const repBefore = JSON.stringify(Game.repOf(subj));
  v.gossip = [
    { action: 'departure', dims: { who: subj }, heard: roster.slice(0, 2), distortion: 0, day: Game.state.scholar.day, partKey: 'p1', noTrust: true },
    { action: 'return', dims: { who: subj }, heard: roster.slice(0, 2), distortion: 0, day: Game.state.scholar.day, partKey: 'p2', noTrust: true },
  ];
  for (let p = 0; p < 12; p++) { try { Game.spreadGossip(); } catch (e) {} }
  ok('departure/return move no trust', ((v.trust || {})[subj] === trustBefore),
    'trust ' + trustBefore + ' -> ' + (v.trust || {})[subj]);
  ok('departure/return move no rep', JSON.stringify(Game.repOf(subj)) === repBefore);

  // 6. talk channel renders 'return' specifically
  const teller = roster[7], returner = roster[8];
  v.gossip = [
    { action: 'return', dims: { who: returner }, heard: [teller, roster[9]], distortion: 1, day: Game.state.scholar.day, partKey: 'p3', noTrust: true },
  ];
  const keepAbout = Game.npcGossipAbout, keepDark = Game.npcDark;
  Game.npcGossipAbout = () => null; Game.npcDark = () => null;
  lines.length = 0;
  let r6 = null;
  try { r6 = Game.askAbout(teller, 'gossip', { inConvo: true }); } catch (e) { ok('askAbout no-throw', false, e.message); }
  Game.npcGossipAbout = keepAbout; Game.npcDark = keepDark;
  const retLine = lines.find(l => l.includes('is back'));
  ok('talk channel has a return-specific line', !!retLine, lines.slice(-2).join(' | ').slice(0, 140));
  ok('not the generic fallback', !lines.some(l => l.includes('People are talking about')),
    lines.slice(-2).join(' | ').slice(0, 120));

  console.log(`\n${pass} passed, ${fail} failed (seed ${seed})`);
  process.exit(fail ? 1 : 0);
})();
