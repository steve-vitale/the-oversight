#!/usr/bin/env node
// PROOF (journey establishment r16, 2026-10-18): contest-outcome gossip must
// name the contest, not just the person.
//
// RED (pre-fix): _cxGossip('won', vid, 'The Pit') stores dims {who} only — the
//   contest name is passed and dropped. The askAbout 'gossip' branch falls
//   through to the generic "People are talking about X. Take it for what
//   it's worth." — the show is never named.
// GREEN (post-fix): dims carry contest, and the render says
//   "Did you hear? X won The Pit on the cameras." (won / survived / died).
//
// Drives the REAL path: Game._cxGossip -> Game.askAbout(teller, 'gossip')
// with say captured. No harnessing of the render itself.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const fails = [];
  const ok = (cond, label) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + label); if (!cond) fails.push(label); };

  const roster = ((Game.state.village || {}).roster || []).filter(id => {
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return false; }
  });
  if (roster.length < 2) { console.log('SKIP: need 2 living villagers'); process.exit(2); }
  const me = (() => { try { return Game.villagerId; } catch (e) { return null; } })();
  const winner = roster.find(id => id !== me), teller = roster.find(id => id !== me && id !== winner);
  if (!winner || !teller) { console.log('SKIP: need 2 non-player living villagers'); process.exit(2); }
  const wname = (() => { try { return Game.displayName(winner).split(' ')[0]; } catch (e) { return '?'; } })();

  // capture say output
  const said = [];
  const origSay = Game.say;
  Game.say = (line) => { said.push(String(line == null ? '' : line)); };

  try {
    // 1. the substrate: dims must carry the contest name
    Game._cxGossip('won', winner, 'The Pit');
    const g = ((Game.state.village || {}).gossip || []).find(x => x.action === 'contest_won' && x.dims && x.dims.who === winner);
    ok(!!g, 'contest_won gossip entry exists');
    ok(g && g.dims && g.dims.contest === 'The Pit', 'dims.contest === "The Pit" (RED: name dropped)');

    // 2. the render: ask the teller for news
    if (g) { g.heard = g.heard || []; if (!g.heard.includes(teller)) g.heard.push(teller); }
    said.length = 0;
    Game.askAbout(teller, 'gossip');
    const namesPit = said.some(l => l.indexOf('The Pit') !== -1);
    const generic = said.some(l => /People are talking about .*Take it for what it\'s worth/.test(l));
    ok(namesPit, 'gossip render names "The Pit" (RED: generic fallback fired)');
    ok(!generic, 'generic "Take it for what it\'s worth" fallback NOT used for contest gossip');
    ok(said.some(l => l.indexOf(wname) !== -1), 'render still names the winner (' + wname + ')');

    // 3. survived + died branches (the dark-gossip branch can randomly preempt;
    // it doesn't consume the entry, so retry until the contest line renders)
    Game._cxGossip('survived', winner, 'The Maw');
    const g2 = ((Game.state.village || {}).gossip || []).find(x => x.action === 'contest_survived' && x.dims && x.dims.who === winner);
    if (g2) { g2.heard = g2.heard || []; if (!g2.heard.includes(teller)) g2.heard.push(teller); }
    let mawLine = null;
    for (let i = 0; i < 12 && !mawLine; i++) {
      said.length = 0;
      Game.askAbout(teller, 'gossip');
      mawLine = said.find(l => l.indexOf('The Maw') !== -1) || null;
    }
    ok(!!mawLine, 'survived render names the contest');
    if (mawLine) console.log('   line: ' + mawLine.slice(0, 110));

    // 4. old-saves defensiveness: dims without contest still renders (no crash)
    Game.state.village.gossip.push({ action: 'contest_won', dims: { who: winner }, heard: [teller], day: 1, distortion: 0 });
    said.length = 0;
    try { Game.askAbout(teller, 'gossip'); ok(true, 'contest gossip without dims.contest does not throw'); }
    catch (e) { ok(false, 'contest gossip without dims.contest threw: ' + e.message); }

    // 5. r16: the PLAYER's televised win seeds gossip too (previously dropped),
    //    and renders with "You" (not a stranger descriptor)
    Game._cxGossip('won', 'player', 'The Pit');
    const g3 = ((Game.state.village || {}).gossip || []).find(x => x.action === 'contest_won' && x.dims && x.dims.who === 'player');
    ok(!!g3, "player-win gossip entry seeded (RED: _cxGossip dropped 'player')");
    if (g3) { g3.heard = g3.heard || []; if (!g3.heard.includes(teller)) g3.heard.push(teller); }
    let youLine = null;
    for (let i = 0; i < 12 && !youLine; i++) {
      said.length = 0;
      Game.askAbout(teller, 'gossip');
      youLine = said.find(l => /You won The Pit/.test(l)) || null;
    }
    ok(!!youLine, 'player-win gossip renders "You won The Pit" (RED: silent)');
    if (youLine) console.log('   line: ' + youLine.slice(0, 110));
  } finally {
    Game.say = origSay;
  }
  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
