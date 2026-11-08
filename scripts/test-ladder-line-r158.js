#!/usr/bin/env node
'use strict';
// test-ladder-line-r158.js — proof for journey-endgame r158.
// The AUDIT line at the seat embeds ladderLine(); at the top rung
// (National Standing, no next threshold) it rendered the stage name
// twice: "Ladder — National Standing National Standing reached (...)".
// Root cause: ladderLine() builds `Ladder — ${stageName} ${target}`
// where target itself was `${stageName} reached` on the top rung.
// Exit 0 = all checks pass; exit 1 = any FAIL.
const path = require('path');
const assert = require('assert/strict');
const root = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(root, 'scripts/sim-harness'));
const seed = Number(process.env.SEED || 89702);
let checks = 0;
function check(name, value) { assert(value, name); checks++; console.log('PASS ' + name); }
(async () => {
  const { Game: G, loadFails } = await loadGame({ seed });
  check('complete shared module load', loadFails.length === 0);
  await setupGame(G);

  // Stage 1 (fresh game): the counted/threshold branch — no duplication.
  const L1 = G.villageLadder();
  check('fresh game sits at stage 1', L1.stage === 1);
  const line1 = G.ladderLine();
  console.log('  stage-1 line: ' + line1);
  check('stage-1 line names the rung once', !/Village Standing Village Standing/.test(line1));
  check('stage-1 line reads "Village Standing 16/26 to Regional Standing"',
    /Ladder — Village Standing \d+\/26 to Regional Standing \(/.test(line1));

  // Stage 3 (rigged through the real XP stores): grant field+craft XP
  // to three living roster villagers, then read the top-rung line.
  const roster = ((G.state.village || {}).roster || []).filter(id => id !== G.villagerId);
  let granted = 0;
  for (const vid of roster) {
    if (granted >= 3) break;
    const vp = (typeof G.vpOf === 'function') ? G.vpOf(vid) : null;
    if (vp && vp.dead) continue;
    const x = G.npcXp(vid);
    x.field = 300; x.craft = 300;
    granted++;
  }
  check('rigged 3 living villagers', granted === 3);
  const L3 = G.villageLadder();
  console.log('  stage-3 ladder: stage=' + L3.stage + ' counted=' + L3.counted + ' nextThreshold=' + L3.nextThreshold);
  check('rigged game reaches stage 3', L3.stage === 3);
  check('stage 3 has no next threshold', L3.nextThreshold == null);
  const line3 = G.ladderLine();
  console.log('  stage-3 line: ' + line3);
  check('stage-3 line names the rung once', !/National Standing National Standing/.test(line3));
  check('stage-3 line reads "National Standing reached ("',
    /^Ladder — National Standing reached \(/.test(line3));
  console.log(`ALL ${checks} CHECKS PASSED`);
  process.exit(0);
})().catch(e => { console.error('FAIL ' + (e && e.message)); console.error(e && e.stack); process.exit(1); });
