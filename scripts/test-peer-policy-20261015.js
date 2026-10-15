#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('peer-policy');
const P = require('./policies/peer-league');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  s.insideHaven = true; s.day = 30; s.kcal = 4000;
  const stock = n => { v.pantry = [{ name: 'Prepared grain', units: n, kcalEach: 1000, spoilDay: 9999 }]; };
  stock(40);
  const targets = G.state.otherVillages.filter(x => x.id !== 'haven');
  for (const x of targets) { x.rumored = true; x.opinion = 0; }
  const ctx = {};
  P.peerWork(G, ctx, 'covenant');
  T.ok('cold known villages are not spammed with proposals', !ctx.livelihoodPeerProposals && !G.hierarchyState().length);
  targets[0].opinion = 80;
  P.peerWork(G, ctx, 'covenant');
  const cov = G.linkWith(targets[0].id);
  T.ok('courted covenant uses public proposal and forms a real equal link', cov && cov.kind === 'covenant' && cov.primary === null && cov.subordinate === null);
  T.ok('policy records actual accepted proposal', ctx.livelihoodPeerFormed === 1);
  const before = P.pantryKcal(G);
  P.peerWork(G, ctx, 'covenant');
  T.ok('first gesture spends real prepared pantry food', !G.state.pendingAccord && P.pantryKcal(G) === before - 2000);
  T.ok('same-day callbacks do not repeat proposals', ctx.livelihoodPeerProposals === 1);
  // Prepared earned granary balance, not a naturally founded national league.
  stock(7); G.state.leaguePoolKcal = 6000;
  P.peerWork(G, ctx, 'covenant');
  T.ok('famine draw transfers real pool food to pantry', G.leaguePool() === 2000 && P.pantryKcal(G) === 11000 && ctx.livelihoodPeerDrawKcal === 4000);
  P.peerWork(G, ctx, 'covenant');
  T.ok('one day cannot repeatedly drain the shared pool', G.leaguePool() === 2000 && P.pantryKcal(G) === 11000);
  s.day++; stock(40); targets[1].opinion = 80;
  P.peerWork(G, ctx, 'trade');
  const trade = G.linkWith(targets[1].id);
  T.ok('trade probe forms a distinct real charter without subordinate links', trade && trade.kind === 'trade' && trade.primary === null && trade.subordinate === null);
  P.peerWork(G, ctx, 'trade'); // resolve its first gesture, if present
  trade.pendingTradeCall = { day: s.day };
  const foodBeforeHelp = P.pantryKcal(G);
  P.peerWork(G, ctx, 'trade');
  T.ok('real favor request is resolved without immediate invented repayment', !trade.pendingTradeCall && P.pantryKcal(G) === foodBeforeHelp);
  const party = (G.mshipState().awayParties || []).find(p => p.kind === 'trade');
  T.ok('enough prepared village hands are really away on the priced favor', !!party && party.vids.length > 0 && party.untilDay === s.day + 3 && ctx.livelihoodPeerFavorSent === 1);
  s.day += 3; G.membershipDaily();
  T.ok('favor repayment arrives only with the real returning party', v.pantry.some(i => /Favor repaid/.test(i.name)) && !(G.mshipState().awayParties || []).some(p => p.kind === 'trade'));
  cov.pendingDefense = { day: s.day }; P.peerWork(G, ctx, 'covenant');
  T.ok('canonical pendingDefense field is answered', !cov.pendingDefense && ctx.livelihoodPeerDefenseSent === 1);
  G.covenantCrisis(cov.id, 'strain'); P.peerWork(G, ctx, 'covenant');
  T.ok('crisis concession is real and priced in reduced member share', !cov.pendingCovenantCrisis && cov.concessionUntil === s.day + 28 && ctx.livelihoodPeerCrises === 1);
  const original = G.proposeLink;
  let threw = false;
  try { P.withoutLead(G, () => { T.ok('inherited subordinate proposal is suppressed', G.proposeLink(targets[2].id) === null && !G.linkWith(targets[2].id)); throw new Error('prepared failure'); }); } catch (e) { threw = true; }
  T.ok('inherited method is restored even after callback failure', threw && G.proposeLink === original);
  s.exiled = true; s.day++; stock(1); const pool = G.leaguePool();
  P.peerWork(G, ctx, 'covenant');
  T.ok('exile cannot use the peer work path to draw food', G.leaguePool() === pool && P.pantryKcal(G) === 1000);
  T.ok('probe reports no swallowed policy errors', !(ctx.livelihoodPeerErrors || []).length);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
