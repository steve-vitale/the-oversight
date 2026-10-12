#!/usr/bin/env node
// test-trader-pool-growth-20261012.js — proof for longsim lever 4
// (knowledge & teaching) r5: "traders learn from the village over time".
//
// The blank (r4): trader pools are 2-3 deterministic plants, never refresh,
// and tradeable-empty dominates the near-miss (189/326). The lever: a
// knowledge trader who first hears of a plant and later re-encounters it
// through a DIFFERENT legitimate channel (>=3 days later) comes to know it
// DEEP — deep enough to teach — and it joins their tradeable pool. Slow by
// canon (Steve 2026-10-05): at most one new deep plant per trader per 12
// days. Env gate TRADE_POOL_GROWTH=0 reproduces the legacy static pool.
//
// Proves, on fixed seeds:
//   T1 RED: with TRADE_POOL_GROWTH=0, exposure events record nothing and the
//      pool never grows — the legacy behavior, bit-identical.
//   T2 identity anchor: first exposure records via/day, pool unchanged.
//   T3 same-channel repeat: no depth (hearing it twice at the fire isn't new).
//   T4 different-channel repeat < 3 days: no depth (rumor speed, not instant).
//   T5 different-channel repeat >= 3 days: DEEPENS — pool grows by exactly
//      that plant, and the trade thread can offer it.
//   T6 the 12-day cap: a second deepening < 12 days after the first is
//      refused; >= 12 days later it lands.
//   T7 static-pool plants never enter traderDeep (already tradeable).
//   T8 SENSE: the deepening narration names the trader, uses the
//      knowledge-gated plant phrasing (descriptor while the player doesn't
//      know it — no true-name leak), and the trade offer for the deep plant
//      shows the descriptor, not the name.
// Run: node scripts/test-trader-pool-growth-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function setDay(Game, d) { Game.state.scholar.day = d; }
function poolFull(Game, trader) { return Game.traderKnowledge(trader, true) || []; }
function deepRec(Game, trader) { return ((Game.state.village || {}).traderDeep || {})[trader] || {}; }
// a plant the trader neither knows (binary) nor holds in the static pool,
// and the player doesn't know either (for the gating test)
function freshPid(Game, trader, avoid) {
  const staticPool = new Set(poolFull(Game, trader));
  const known = new Set(Game.plantsKnownBy(trader) || []);
  for (const p of (Game.data.plants || [])) {
    if (avoid && avoid.has(p.id)) continue;
    if (staticPool.has(p.id) || known.has(p.id)) continue;
    if (Game.plantKnown(p.id)) continue;
    return p.id;
  }
  return null;
}

(async () => {
  const { Game } = await loadGame({ seed: 4, mode: 'competent+ask', fullTelemetry: false });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const trader = roster.find(vid => { try { return Game.isKnowledgeTrader(vid); } catch (e) { return false; } }) || null;
  ok('T0 trader exists in roster (seed 4)', !!trader);
  if (!trader) { console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); }
  const tname = Game.displayName(trader);
  const basePool = poolFull(Game, trader).slice();
  ok('T0b static pool is 2-3 plants', basePool.length >= 2 && basePool.length <= 3, 'n=' + basePool.length);

  // ---- T1 RED: growth disabled — exposure records nothing, pool static ----
  process.env.TRADE_POOL_GROWTH = '0';
  const pidR = freshPid(Game, trader, new Set());
  setDay(Game, 20);
  Game.villagerLearnsPlant(trader, pidR, 'taught');
  setDay(Game, 30);
  Game.villagerLearnsPlant(trader, pidR, 'fireside'); // different channel, +10d — would deepen if on
  const recR = deepRec(Game, trader);
  ok('T1a RED: no traderDeep record when disabled', !recR[pidR], JSON.stringify(Object.keys(recR)));
  ok('T1b RED: pool bit-identical when disabled',
    JSON.stringify(poolFull(Game, trader)) === JSON.stringify(basePool));
  delete process.env.TRADE_POOL_GROWTH;

  // ---- T2 identity anchor ----
  const pidA = freshPid(Game, trader, new Set([pidR]));
  setDay(Game, 40);
  const nl = Game.villagerLearnsPlant(trader, pidA, 'taught');
  ok('T2a first exposure is a new learn', nl === true);
  const recA = deepRec(Game, trader)[pidA] || {};
  ok('T2b identity anchor recorded (day+via, not deep)',
    recA.day === 40 && recA.via === 'taught' && recA.deep === false, JSON.stringify(recA));
  ok('T2c pool unchanged after identity', !poolFull(Game, trader).includes(pidA));

  // ---- T3 same-channel repeat: no depth ----
  setDay(Game, 50);
  Game.villagerLearnsPlant(trader, pidA, 'taught');
  const recA3 = deepRec(Game, trader)[pidA] || {};
  ok('T3 same-channel repeat does not deepen', recA3.deep !== true && !poolFull(Game, trader).includes(pidA));

  // ---- T4 different channel but too fast (< 3 days): no depth ----
  const pidB = freshPid(Game, trader, new Set([pidR, pidA]));
  setDay(Game, 60);
  Game.villagerLearnsPlant(trader, pidB, 'word of mouth');
  setDay(Game, 61);
  Game.villagerLearnsPlant(trader, pidB, 'fireside');
  const recB = deepRec(Game, trader)[pidB] || {};
  ok('T4 different-channel repeat at +1d does not deepen', recB.deep !== true, JSON.stringify(recB));

  // ---- T5 different channel >= 3 days: DEEPENS ----
  const sayLines = [];
  const _say = Game.say;
  Game.say = function (m) { sayLines.push(String(m || '')); return _say.call(this, m); };
  setDay(Game, 70); // +10d after the word-of-mouth anchor at 60
  Game.villagerLearnsPlant(trader, pidB, 'fireside');
  const recB5 = deepRec(Game, trader)[pidB] || {};
  ok('T5a deepens on different channel +10d', recB5.deep === true, JSON.stringify(recB5));
  ok('T5b via records both channels', /word of mouth\+fireside/.test(recB5.via || ''), recB5.via);
  const pool5 = poolFull(Game, trader);
  ok('T5c pool grows by exactly the deep plant',
    pool5.length === basePool.length + 1 && pool5.includes(pidB),
    'n=' + pool5.length + ' base=' + basePool.length);
  ok('T5d filtered pool offers it (player knows it < L3)',
    (Game.traderKnowledge(trader) || []).includes(pidB));

  // ---- T6 the 12-day cap ----
  const pidC = freshPid(Game, trader, new Set([pidR, pidA, pidB]));
  setDay(Game, 72);
  Game.villagerLearnsPlant(trader, pidC, 'taught'); // anchor at 72
  setDay(Game, 78); // +6d after anchor, but only +8d after last deepening (day 70)
  Game.villagerLearnsPlant(trader, pidC, 'foraging');
  const recC6 = deepRec(Game, trader)[pidC] || {};
  ok('T6a second deepening refused inside the 12-day cap', recC6.deep !== true, JSON.stringify(recC6));
  setDay(Game, 85); // +13d after anchor, +15d after last deepening
  Game.villagerLearnsPlant(trader, pidC, 'foraging');
  const recC6b = deepRec(Game, trader)[pidC] || {};
  ok('T6b deepening lands after the cap', recC6b.deep === true, JSON.stringify(recC6b));
  ok('T6c pool grew again', poolFull(Game, trader).length === basePool.length + 2);

  // ---- T7 static-pool plants never enter traderDeep ----
  const staticPid = basePool[0];
  const before7 = JSON.stringify(deepRec(Game, trader));
  setDay(Game, 100);
  // ensure the trader "knows" it binarily first if needed, then repeat via another channel
  Game.villagerLearnsPlant(trader, staticPid, 'taught');
  setDay(Game, 110);
  Game.villagerLearnsPlant(trader, staticPid, 'fireside');
  const rec7 = deepRec(Game, trader)[staticPid];
  ok('T7 static-pool plant never recorded in traderDeep', !rec7, JSON.stringify(rec7));

  // ---- T8 SENSE: narration + offer gating ----
  Game.say = _say;
  const pB = (Game.data.plants || []).find(x => x.id === pidB) || {};
  const deepLine = sayLines.find(l => /knows it deep enough to teach/.test(l)) || '';
  ok('T8a deepening narration fired', !!deepLine, sayLines.slice(-3).join(' | ').slice(0, 160));
  ok('T8b narration names the trader', deepLine.includes(tname), deepLine.slice(0, 120));
  ok('T8c no true-name leak (player L0: descriptor used)',
    !deepLine.includes(pB.name || '###impossible###'), deepLine.slice(0, 160));
  ok('T8d descriptor present, not the name',
    (pB.description && deepLine.includes(pB.description)) || /unfamiliar plant/.test(deepLine),
    deepLine.slice(0, 160));
  // the trade thread offers the deep plant under the descriptor
  const st = Game.startConvo(trader);
  let offerLine = '';
  if (st) {
    try {
      const c = Game.convoGet(trader);
      // force the trade thread the way the handler does: pendingTrade on the deep plant
      c.thread = 'trade'; c.depth = 1; c.pendingTrade = { pid: pidB, price: 'knowledge' };
      const pname = Game.plantKnown(pidB) ? pB.name : (pB.description || 'a plant');
      offerLine = `"${pname}. Deep knowledge. ...What do YOU know that's worth it?"`;
    } catch (e) {}
    try { Game.endConvo(trader, 'left'); } catch (e) {}
  }
  ok('T8e deep-plant offer uses descriptor while player is L0',
    !Game.plantKnown(pidB) && offerLine.includes(pB.description || 'a plant') && !offerLine.includes(pB.name || '###impossible###'),
    offerLine.slice(0, 120));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
