#!/usr/bin/env node
// diag-aid-flows-20261012.js — lever 0 r4: does the "fire network" aid
// instrument ever fire in competent scale play? Offers, begs, quests,
// inbound deliveries, given/refused. The game offers; the policy must answer.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt');

const SEEDS = (process.env.SEEDS || '11').split(',').map(s => s.trim()).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/aid.json';

function pk(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'scale-food' });
  await setupGame(Game);
  const A = { offers: [], begs: [], quests: [], inbound: [], given: 0, answered: { offer: 0, beg: 0, quest: 0 } };
  const policy = Object.assign({}, scalecourt);
  const origDaily = scalecourt.daily;
  policy.daily = (G, ctx) => {
    // OBSERVE BEFORE competent.daily answers (answerAidBeats clears pendings)
    let sawOffer = null, sawBeg = null;
    try {
      const st0 = G.state, day0 = (st0.scholar || {}).day || 0;
      // dedupe: an unanswered pending persists; count it once (by begDay/offerDay)
      if (st0.pendingAidOffer && (A._lastOfferDay !== st0.pendingAidOffer.offerDay)) {
        A._lastOfferDay = st0.pendingAidOffer.offerDay;
        sawOffer = { day: day0, amt: st0.pendingAidOffer.amount, pk: Math.round(pk(G)) };
      }
      if (st0.pendingAidBeg && (A._lastBegDay !== st0.pendingAidBeg.begDay)) {
        A._lastBegDay = st0.pendingAidBeg.begDay;
        sawBeg = { day: day0, amt: st0.pendingAidBeg.amount, pk: Math.round(pk(G)) };
      }
    } catch (e) {}
    const r = origDaily.call(policy, G, ctx);
    try {
      const st = G.state, day = (st.scholar || {}).day || 0;
      if (sawOffer) { A.offers.push(sawOffer); if (!st.pendingAidOffer) A.answered.offer++; }
      if (sawBeg) {
        A.begs.push(sawBeg);
        if (!st.pendingAidBeg) {
          A.answered.beg++;
          // gave or refused? check the ledger delta via trust note is overkill;
          // count as given if the aid ledger for that village grew. Simpler:
          // re-derive from ctx counters set by answerAidBeats.
          if ((ctx.aidGivenKcal || 0) > (A._givenSeen || 0)) { A.given = ctx.aidGivenKcal; A._givenSeen = ctx.aidGivenKcal; }
        }
      }
      if (st.pendingAidQuest) {
        A.quests.push({ day });
        try { G.answerAidQuest('accept'); A.answered.quest++; } catch (e) {}
      }
      const inb = st.aidInbound || [];
      if (inb.length !== (A._inbSeen || 0)) { A._inbSeen = inb.length; }
    } catch (e) {}
    return r;
  };
  // count inbound deliveries resolved
  const origResolve = Game.resolveAidInbound;
  if (typeof origResolve === 'function') Game.resolveAidInbound = function (del) {
    try { A.inbound.push({ day: (Game.state.scholar || {}).day || 0, kind: del.kind, amount: del.amount }); } catch (e) {}
    return origResolve.apply(this, arguments);
  };
  await runDays(Game, policy, days, {});
  delete A._inbSeen;
  return { seed, days: (Game.state.scholar || {}).day || 0, endReason: Game.over ? 'village-lost' : 'survived', rank: Game.scaleRank ? Game.scaleRank() : '?', aid: A };
}

(async () => {
  const runs = [];
  for (const seed of SEEDS) {
    try { runs.push(await oneRun(seed, DAYS)); } catch (e) { console.error('seed', seed, 'failed:', String(e).slice(0, 160)); }
  }
  fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), runs }));
  for (const r of runs) {
    const a = r.aid;
    console.log('seed', r.seed, 'd' + r.days, r.endReason, r.rank,
      '| offers', a.offers.length, 'begs', a.begs.length, 'quests', a.quests.length,
      'inbound', a.inbound.length, 'given', a.given);
    for (const o of a.offers.slice(0, 3)) console.log('   offer d' + o.day, o.amt, 'pk=' + o.pk);
    for (const b of a.begs.slice(0, 3)) console.log('   beg   d' + b.day, b.amt, 'pk=' + b.pk);
    for (const d2 of a.inbound.slice(0, 3)) console.log('   inbound d' + d2.day, d2.kind, d2.amount);
  }
  console.log('wrote', OUT);
})();
