#!/usr/bin/env node
// test-trader-hook-20261012.js — proof for longsim lever 4 (knowledge &
// teaching) r4: "the sim trades like a competent player".
//
// The blank: 0 traded identifications in 40 runs (r1-r3). Diagnosis (r4):
// traders spawn (5/8 rosters), meetings happen (talkRound), the mention
// fires (50%, persistent per trader), the 'trade' choice appears one
// answer-turn after the opener — but no sim policy ever TAKES a turn toward
// it. The gate is in the measurement apparatus, not the game. The lever is
// scripts/trade-hook.js: a daily hook modeling the competent player who
// engages trader offers (same class as the sweep's askRound). Game code is
// untouched.
//
// Proves, on fixed seeds:
//   T1 hook walks the full path: meeting -> offer -> accepted trade ('ok'),
//      plant learned at L2/L3 with viaTrade set
//   T2 the trade narration is sensible (named trader, named plants both
//      directions, honest price line) — SENSE, not just counts
//   T3 tradeCurrency: returns a real plant when payable
//   T4 decline path: food-price + empty pack -> honest 'trade_no', counted
//      as tradeDeclined:food-poor, no charge, no phantom lesson
//   T5 RED: the unlevered sim flow (open+close, like talkRound) produces 0
//      tradeKnowledge calls — the 0/40 is reproduced, the hook is the delta
//   T6 STARVATION FIX: on a full menu (seed 7: 5 topics + theorize +
//      compare_maps eligible), the 'trade' choice appears once the opener
//      question is engaged — it no longer loses the MAXC slot lottery.
//      Red-checked against unlevered conversation.js (choice absent).
// Run: node scripts/test-trader-hook-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { tradeRound, tradeCurrency } = require('./trade-hook');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function captureSay(Game) {
  const lines = [];
  const _say = Game.say;
  Game.say = function (m) { lines.push(String(m || '')); return _say.call(this, m); };
  const sayLines = [];
  const _sayLine = Game.sayLine;
  Game.sayLine = function (vid, m) { sayLines.push(String(m || '')); return _sayLine.call(this, vid, m); };
  return { lines, sayLines, restore() { Game.say = _say; Game.sayLine = _sayLine; } };
}
function findTrader(Game) {
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  return roster.find(vid => { try { return Game.isKnowledgeTrader(vid); } catch (e) { return false; } }) || null;
}
function instrumentTrades(Game) {
  const outs = {};
  const _tk = Game.tradeKnowledge;
  Game.tradeKnowledge = function (vid, pid) {
    const r = _tk.call(this, vid, pid);
    outs[String(r || '?')] = (outs[String(r || '?')] || 0) + 1;
    return r;
  };
  return outs;
}

(async () => {
  // ---- T1/T2/T3: the hook completes a real trade (seed 4: fishing guide) ----
  {
    const { Game } = await loadGame({ seed: 4, mode: 'competent+ask', fullTelemetry: false });
    await setupGame(Game);
    const cap = captureSay(Game);
    const outs = instrumentTrades(Game);
    const trader = findTrader(Game);
    ok('T1a trader exists in roster (seed 4)', !!trader);
    const K = {};
    const turns = tradeRound(Game, K);
    ok('T1b hook takes conversation turns', turns > 0, 'turns=' + turns);
    ok('T1c hook met the trader', (K.traderMeetings || 0) >= 1);
    ok('T1d trade offer laid out', (K.tradeOffers || 0) >= 1);
    ok('T1e tradeKnowledge completed ok', (outs.ok || 0) >= 1, JSON.stringify(outs));
    const cxp = Game.state.codex.plants || {};
    const traded = Object.entries(cxp).filter(([, e]) => e && e.viaTrade);
    ok('T1f traded plant recorded with viaTrade', traded.length >= 1);
    ok('T1g traded plant at L2/L3', traded.every(([, e]) => (e.level || 0) >= 2 && (e.level || 0) <= 3),
      traded.map(([p, e]) => p + ':L' + e.level).join(','));
    // T2: sense — the narration names the trader and both plants
    const tname = Game.displayName(trader);
    const first = tname.split(' ')[0];
    const tradeLine = cap.lines.find(l => l.indexOf('Knowledge for knowledge') !== -1) || '';
    ok('T2a price line names both sides of the deal',
      tradeLine.indexOf(first) !== -1 && /teach .* about .+\. They teach you about .+\./.test(tradeLine),
      tradeLine.slice(0, 160));
    const taughtLine = cap.lines.find(l => l.indexOf('TRADED KNOWLEDGE') !== -1) || '';
    ok('T2b taught line names plant + level + depth text',
      /TRADED KNOWLEDGE: .+ — Level [23]\./.test(taughtLine), taughtLine.slice(0, 160));
    ok('T2c discovery note fires (the channel is learned)', cap.lines.some(l => /some people trade knowledge/.test(l)));
    cap.restore();
  }
  // ---- T3: tradeCurrency ----
  {
    const { Game } = await loadGame({ seed: 4, mode: 'competent+ask', fullTelemetry: false });
    await setupGame(Game);
    const trader = findTrader(Game);
    const cur = tradeCurrency(Game, trader, 'pawpaw');
    ok('T3 tradeCurrency returns a real payable plant at day 1', !!cur && Game.plantKnown(cur), String(cur));
  }
  // ---- T4: honest decline (food price, empty pack) ----
  {
    const { Game } = await loadGame({ seed: 7, mode: 'competent+ask', fullTelemetry: false });
    await setupGame(Game);
    const trader = findTrader(Game);
    ok('T4a trader exists (seed 7)', !!trader);
    // force the food price band and an empty pack
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[trader] = 35;
    Game.state.scholar.kcal = 0;
    // the channel is already discovered (learned from an earlier trade) —
    // the mention coin is bypassed, the offer itself is what's tested
    Game.discover('trade');
    const K = {};
    const turns = tradeRound(Game, K);
    const declined = Object.keys(K).filter(k => k.indexOf('tradeDeclined:') === 0);
    ok('T4b unaffordable offer declined honestly, not charged',
      declined.some(k => k === 'tradeDeclined:food-poor'), JSON.stringify(declined) + ' turns=' + turns);
    const cxp = Game.state.codex.plants || {};
    const phantom = Object.entries(cxp).some(([, e]) => e && e.viaTrade === trader);
    ok('T4c no phantom lesson on decline', !phantom);
  }
  // ---- T5 RED: unlevered flow (open+close like talkRound) never trades ----
  {
    const { Game } = await loadGame({ seed: 4, mode: 'competent+ask', fullTelemetry: false });
    await setupGame(Game);
    const outs = instrumentTrades(Game);
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    // the old sim behavior: open a convo with everyone, take no turns, close
    for (const vid of roster) {
      try {
        if (!Game.startConvo(vid)) continue;
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) {}
    }
    const total = Object.values(outs).reduce((a, b) => a + b, 0);
    ok('T5 RED: unlevered open+close flow makes 0 trades (reproduces 0/40)', total === 0, JSON.stringify(outs));
  }
  // ---- T6: starvation fix — full menu still offers trade ----
  {
    const { Game } = await loadGame({ seed: 7, mode: 'competent+ask', fullTelemetry: false });
    await setupGame(Game);
    const trader = findTrader(Game);
    ok('T6a trader exists (seed 7)', !!trader);
    Game.discover('trade'); // channel known; the mention coin is bypassed
    Game.startConvo(trader);
    let ch = (Game.convoChoices(trader) || []).map(x => x.id);
    const ans = ch.find(id => id.indexOf('ans:') === 0);
    if (ans) Game.convoTurn(trader, ans); // engage the opener question
    ch = (Game.convoChoices(trader) || []).map(x => x.id);
    ok('T6b trade choice present on the full post-answer menu', ch.includes('trade'),
      'menu(' + ch.length + '): ' + ch.join(','));
    Game.endConvo(trader, 'left');
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
