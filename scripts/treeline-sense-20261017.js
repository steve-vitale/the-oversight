#!/usr/bin/env node
// treeline-sense-20261017.js — sense-testing probe for the sim-treeline arm.
//
// Runs ONE armed seed and captures EVERY treeline-raid say-line (staging,
// hold, auto-resolve) for transcript reading. SENSE-TESTING LAW: judge
// meaning, coherence, relevance — do answered holds read as sensible
// village behavior?
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 TREELINE=1 \
//     node scripts/treeline-sense-20261017.js [seed]
// Output: evidence/2026-10-17/perseed-treeline/sense-s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const TL = require('./policies/treeline');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEED = parseInt(process.argv[2] || '9911', 10);
const TREE = path.join(__dirname, '..');
const OUTDIR = path.join(TREE, 'evidence', '2026-10-17', 'perseed-treeline');
const stripTags = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function main() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER'])
    if (process.env[k] !== '1') { console.error(`SENSE STOP: ${k}=1 required.`); process.exit(2); }
  if (process.env.TREELINE !== '1') { console.error('SENSE STOP: TREELINE=1 required (armed).'); process.exit(2); }
  process.env.SEATDRIVE = '0';

  const { Game } = await loadGame({ seed: SEED, mode: 'treeline-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const RE = /treeline|shouts from|didn't wait — they hit|held the treeline|drove them off|your pantry or your blood|not tonight/i;
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const s = stripTags((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (RE.test(s)) lines.push({ day: gday(Game), text: s.slice(0, 400) });
    } catch (e) {}
    return origSay(msg);
  };
  // count answers
  let holds = 0, skips = 0;
  const origARD = Game.answerRaidDefense.bind(Game);
  Game.answerRaidDefense = function (how) {
    const r = origARD(how);
    if (how === 'hold' && r === 'held') holds++;
    return r;
  };
  const origDaily = TL.leadfeastTreeline.daily;
  const policy = Object.assign({}, TL.leadfeastTreeline);
  policy.daily = (G, ctx) => {
    try {
      if (G.state.pendingRaidDefense) {
        const pr = G.state.pendingRaidDefense;
        const roster = ((G.state.village || {}).roster || []).length;
        if (roster < (pr.raiders || []).length + 1) skips++;
      }
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, `sense-s${SEED}.json`), JSON.stringify({
    seed: SEED, endReason: result.endReason, gameDays: result.gameDays,
    holds, weakSkips: skips, lines,
  }, null, 1));
  console.log(`sense s${SEED}: end=${result.endReason} days=${result.gameDays} holds=${holds} skips=${skips} treelineLines=${lines.length}`);
  for (const l of lines) console.log(`\n[d${l.day}] ${l.text}`);
}

if (require.main === module) main().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
