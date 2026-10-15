#!/usr/bin/env node
// test-ending-screen-20261012.js — PROOF for journey-succession r10.
//
// BLANK: the end-of-run screen was a slice-1 fossil — "SEVEN DAYS",
// "Days: X / 7", a "New expedition" button that just went to the title
// screen — and on a village WIPE it lied: "The village remembers" and
// "Someone else will carry the journal next time," when the village is
// dead and nobody will. Steve's law: failure RESOLVES the story, never
// deletes it. The screen now renders the lineage (every bearer of the
// mantle, in order) as the resolution, with an honest wipe screen and an
// honest win screen (frame name, real day count).
//
// RED on pristine HEAD: status() has no villageLost/lineage/endingFrame;
// app.js still contains the fossil copy.
// GREEN post-fix: the data contract holds for wipe and win paths, and the
// fossil strings are gone from the ending screen.
//
// (ending() itself needs DOM and can't run in node — the rendering proof
// is source-text assertions on the copy the screen renders, plus the data
// contract the screen reads. Stated plainly, not hidden.)
//
// Usage: node scripts/test-ending-screen-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  // ---- the wipe path: last-survivor death ----
  Math.random = mulberry32(9917);
  const { Game } = await loadGame({ seed: 9917, mode: 'ending-screen', fullTelemetry: false });
  Game.say = () => {};
  await setupGame(Game);
  await runDays(Game, competent, { days: 8 });
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  for (const vid of roster) {
    const nm = ((Game.data.villagers || []).find(x => x.id === vid) || {}).name || 'villager';
    try { Game.registerDeath({ kind: 'villager', villagerId: vid, name: nm, cause: 'the famine', killerId: null }); } catch (e) {}
    try { Game.removeVillager(vid, 'killed'); } catch (e) {}
  }
  Game.playerDeath('starvation');
  check('wipe-sets-flags', !!Game.over && !!Game.villageLost && !Game.won,
    `over=${!!Game.over} villageLost=${!!Game.villageLost} won=${!!Game.won}`);

  const fullStatus = Game._fullStatus || Game.status;
  const st = fullStatus.call(Game);
  check('status-exposes-villageLost', st.villageLost === true, `status().villageLost=${st.villageLost}`);
  check('status-exposes-lineage', Array.isArray(st.lineage) && st.lineage.length >= 1,
    `lineage entries=${(st.lineage || []).length}`);
  const last = (st.lineage || [])[(st.lineage || []).length - 1] || {};
  check('legend-is-village-lost', last.outcome === 'village-lost' && !!last.name,
    `outcome=${last.outcome} name=${last.name}`);
  check('status-exposes-endingFrame', typeof st.endingFrame === 'string',
    `endingFrame=${JSON.stringify(st.endingFrame)}`);
  // the chain: earlier entries are dead bearers with causes, the last is the wipe
  const chain = st.lineage || [];
  const earlierHonest = chain.slice(0, -1).every(e => !!e.name && (e.day || 0) >= 0);
  check('lineage-chain-honest', earlierHonest && chain.length >= 1,
    chain.map(e => `${e.name} d${e.day}${e.cause ? ' (' + e.cause + ')' : ''}${e.outcome ? ' [' + e.outcome + ']' : ''}`).join(' -> ').slice(0, 220));

  // ---- the win path: data contract the won screen reads ----
  Math.random = mulberry32(9918);
  const g2 = await loadGame({ seed: 9918, mode: 'ending-screen-win', fullTelemetry: false });
  const G = g2.Game;
  G.say = () => {};
  await setupGame(G);
  await runDays(G, competent, { days: 8 });
  G.lineage().push({ name: 'First Bearer', villagerId: 'x1', day: 40, cause: 'a hushwolf' });
  G.lineage().push({ name: 'Final Bearer', villagerId: 'x2', day: 112, epithet: 'the Beloved', frame: 'beloved', outcome: 'haven-endures' });
  G.over = true; G.won = true;
  const Gfull = G._fullStatus || G.status;
  const stw = Gfull.call(G);
  check('win-status-contract', stw.won === true && stw.villageLost === false,
    `won=${stw.won} villageLost=${stw.villageLost}`);
  const wlast = (stw.lineage || [])[(stw.lineage || []).length - 1] || {};
  check('win-frame-on-lineage', wlast.epithet === 'the Beloved' && wlast.outcome === 'haven-endures',
    `epithet=${wlast.epithet}`);

  // ---- the rendering copy ----
  const appSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'app.js'), 'utf8');
  const endingFn = appSrc.slice(appSrc.indexOf('function ending()'));
  const endBlock = endingFn.slice(0, endingFn.indexOf('\n  }\n') + 4);
  // strip line comments: the new header comment DOCUMENTS the fossil copy
  // ("SEVEN DAYS" etc.) — the assertions below are about rendered copy.
  const codeOnly = endBlock.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  const F = (re) => re.test(codeOnly);
  check('fossil-seven-days-gone', !F(/SEVEN DAYS/), 'no "SEVEN DAYS" title');
  check('fossil-day-denominator-gone', !F(/\/ 7/), 'no "Days: X / 7"');
  check('fossil-lie-gone', !F(/Someone else will carry the journal next time/),
    'no false "someone else will carry the journal"');
  check('fossil-village-remembers-gone', !F(/The village remembers/),
    'no false "The village remembers"');
  check('fossil-new-expedition-gone', !F(/New expedition/),
    'no "New expedition" button that only went to title');
  check('wipe-screen-exists', F(/THE VILLAGE DIES OUT/), 'honest wipe title');
  check('wipe-screen-honest', F(/No one is left to pick up the Codex/) && F(/Nobody will carry it/),
    'wipe names the truth twice');
  check('lineage-rendered', F(/The bearers/), 'the chain renders as the resolution');
  check('win-screen-frame', F(/toUpperCase\(\)/) && F(/epithet/),
    'won screen titles on the ending frame, not a hardcoded week');

  // Render the real ending function with a small DOM surface. Losing the
  // negotiation is not a bearer death, and the replay button must call the
  // title-screen function rather than a shadowed title string.
  let restarted = 0;
  const replay = {}, screen = { innerHTML: '' };
  const sandbox = {
    Game: { status: () => ({ won: false, villageLost: false, day: 100, lineage: [{ name: 'Bearer', outcome: 'table-lost' }] }), codexEntries: () => [] },
    screen, esc: String, bar: (name, stamp) => stamp,
    document: { getElementById: () => replay }, title: () => { restarted++; },
  };
  require('vm').runInNewContext(endBlock + '\nending();', sandbox);
  check('failed-table-honest-screen', /THE TABLE CLOSES/.test(screen.innerHTML) && /Haven leaves alive/.test(screen.innerHTML) && !/THE WOODS KEEP YOU/.test(screen.innerHTML), 'an unsuccessful agreement is not a dead bearer');
  replay.onclick();
  check('ending-replay-button', restarted === 1, 'Begin a new village returns to title');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('THREW: ' + e.stack); process.exit(1); });
