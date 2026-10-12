'use strict';
// trade-hook.js — competent-player trade behavior for the knowledge sweep
// (longsim knowledge r4, 2026-10-12).
//
// The blank: 0 traded identifications in 40 runs (r1-r3). Diagnosis: traders
// spawn (5/8 rosters), meetings happen (talkRound), the mention fires (50%,
// persistent per trader), and the 'trade' choice appears one answer-turn
// after the opener — but no sim policy ever TAKES a conversation turn toward
// it (talkRound opens+closes; askRound only takes agency: choices). The gate
// is in the measurement apparatus, not the game. This hook models the
// competent player who, once talking with a knowledge trader, engages the
// offer — the same class of hook as the sweep's askRound.
//
// Game code is untouched. The hook's own decisions are deterministic; the
// game's internal rolls (mention 50%, wrongTeaching, etc.) are honest RNG.
//
// Usage: const { tradeRound } = require('./trade-hook');
//        tradeRound(Game, K)  // K = sweep instrumentation bucket (optional)
function tradeRound(Game, K) {
  const k = K || {};
  const bump = (o, key) => { o[key] = (o[key] || 0) + 1; };
  let acted = 0;
  try {
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    const traders = roster.filter(vid => {
      try { return Game.isKnowledgeTrader(vid); } catch (e) { return false; }
    });
    for (const vid of traders) {
      try {
        if (!((v.roster || []).includes(vid))) continue;
        const st = Game.startConvo(vid);
        if (!st) continue;
        bump(k, 'traderMeetings');
        // Engage the opener question like a person (the full menu, including
        // the 'trade' discovery action, only appears once pendingQ clears —
        // buildMenu's narrowed-menu early return is by design).
        let guard = 0, traded = false, offered = false, engaged = false;
        // r4 near-miss: why did a meeting not produce an offer?
        let noOfferWhy = null;
        try {
          const c0 = Game.convoGet(vid);
          const discovered = Game.hasDiscovered('trade');
          const tradeable0 = (Game.traderKnowledge(vid) || []).length;
          if (tradeable0 === 0) noOfferWhy = 'tradeable-empty';
          else if (!discovered && !c0.traderMentioned) noOfferWhy = 'mention-missed';
        } catch (e) {}
        while (guard < 4 && !traded) {
          guard++;
          const choices = Game.convoChoices(vid) || [];
          const ids = choices.map(c => c && c.id).filter(Boolean);
          if (ids.includes('trade_yes') || ids.includes('trade_no')) {
            // Terms are on the table — decide like a competent player.
            const c = Game.convoGet(vid);
            const pt = (c && c.pendingTrade) || {};
            let accept = false, why = 'unpriced';
            if (pt.price === 'trust') { accept = true; why = 'trust-free'; }
            else if (pt.price === 'food') {
              accept = (Game.state.scholar.kcal || 0) >= 300;
              why = accept ? 'food-affordable' : 'food-poor';
            } else if (pt.price === 'knowledge') {
              accept = !!tradeCurrency(Game, vid, pt.pid);
              why = accept ? 'knowledge-currency' : 'knowledge-nothing-new';
            } else if (pt.price) { why = 'unknown-price:' + pt.price; }
            else { why = 'no-terms'; }
            if (!accept) bump(k, 'tradeDeclined:' + why);
            try { Game.convoTurn(vid, accept ? 'trade_yes' : 'trade_no'); acted++; } catch (e) {}
            traded = true;
          } else if (ids.includes('trade')) {
            bump(k, 'tradeOffers');
            offered = true;
            try { Game.convoTurn(vid, 'trade'); acted++; } catch (e) { break; }
          } else {
            // No trade choice yet — answer their question to move the
            // conversation forward (first ans: choice, deterministic).
            const ans = ids.find(id => id.indexOf('ans:') === 0);
            if (ans) { engaged = true; try { Game.convoTurn(vid, ans); acted++; } catch (e) { break; } }
            else { if (!noOfferWhy) noOfferWhy = 'no-engage'; break; }
          }
          try {
            const cc = Game.convoGet(vid);
            if (!cc || !cc.active) break;
          } catch (e) { break; }
        }
        if (!offered && !traded) {
          // the meeting produced no offer — count WHY (r3 near-miss discipline)
          try {
            const c1 = Game.convoGet(vid);
            if (!noOfferWhy) {
              if ((Game.traderKnowledge(vid) || []).length === 0) noOfferWhy = 'tradeable-empty';
              else if (!Game.hasDiscovered('trade') && !c1.traderMentioned) noOfferWhy = 'mention-missed';
              else noOfferWhy = 'other';
            }
          } catch (e) { if (!noOfferWhy) noOfferWhy = 'other'; }
          bump(k, 'tradeNoOffer:' + noOfferWhy);
        }
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) { /* one bad trader never kills the day */ }
    }
  } catch (e) {}
  return acted;
}

// tradeCurrency: replicate tradeKnowledge's 'knowledge'-price check —
// something you truly know (L1+, not wrongAs) that they don't (not in their
// pool, not in their binary knowledge), excluding the plant being bought.
function tradeCurrency(Game, vid, pid) {
  try {
    const cxp = Game.state.codex.plants || {};
    const yourPlants = Object.keys(cxp).filter(k => {
      try { return Game.plantKnown(k) && !(cxp[k] || {}).wrongAs; } catch (e) { return false; }
    });
    const theirPool = Game.traderKnowledge(vid, true) || [];
    let theirTaught = [];
    try { theirTaught = Game.plantsKnownBy(vid) || []; } catch (e) {}
    const theyKnow = new Set([...theirPool, ...theirTaught]);
    return yourPlants.find(yPid => !theyKnow.has(yPid) && yPid !== pid) || null;
  } catch (e) { return null; }
}

module.exports = { tradeRound, tradeCurrency };
