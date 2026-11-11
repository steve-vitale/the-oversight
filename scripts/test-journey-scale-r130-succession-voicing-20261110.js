#!/usr/bin/env node
// test-journey-scale-r130-succession-voicing-20261110.js — proof test for
// the r130 succession-voicing fix (journey-scale r130, lane A leg 3).
//
// THE DEFECT (r93 follow-up #1, measured by the r130 trust-delta analyzer
// on the r127 band, seeds 97901-97904): every speaker death shakes every
// lead link -8 (successionCrisis) and every peer link -10 (covenantCrisis),
// and the concede buys back +8 — but only the -10 and the +8 are ever
// named aloud or in the book. The -8 is silent in BOTH places, so a player
// watching a lead link sees trust fall 8/week with no explanation. The
// analyzer reads voiced NO-GO on all 4 r127 seeds (68 unvoiced drains:
// successionCrisis 1951 x45, 1938 x10, linkTick arrears/sabotage x7,
// answerDemand-refuse x3, answerTradeCall-refuse x1).
//
// THE FIX (voicing only — NO number changes, gating freeze intact):
// hierarchy.js names the trust amount in the say line ("(Trust -N.)") and
// the book note ("(trust -N)") for every flagged writer, in the house
// pattern of covenantCrisis / titanEscalate / answerTradeCall-refuse:
//   - successionCrisis -8 (young-link path, leverage, spent-card,
//     subordinate-tests, SUCCGRACE branch)
//   - theirLeaderDied -8 (same -8, same gap; never fired on the r127 band)
//   - linkTick arrears -6 / sabotage -4
//   - answerDemand refuse -15 (note only — the say already states the
//     resulting trust LEVEL)
//   - answerTradeCall refuse -4 (note only — the say already has it)
//   - answerDefenseCall refuse -10 (note only, on every peer link — the
//     say already has "(Trust -10 across the league.)")
//
// PROOF SHAPE: for each writer, the trust delta is asserted EXACTLY (the
// numbers must not move), and the say + note are asserted to name the
// amount. RED before the fix (voicing assertions fail, deltas pass);
// GREEN after (all pass). The two RNG-gated says (arrears 40%, sabotage
// 50% inside a 12% branch) are proven by looping fresh games on one
// loaded engine until the branch fires — the note is asserted on the
// first firing, the say on a firing where it speaks.
//
// Usage: node scripts/test-journey-scale-r130-succession-voicing-20261110.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-scale-r130-succession-voicing');

function noteHas(link, sub) {
  return (link.history || []).some(h => String(h.note || '').includes(sub));
}
function sayHas(said, sub) {
  return said.some(t => String(t).includes(sub));
}

(async () => {
  const Game = await K.load({ seed: 20261110 });
  const said = K.captureSays(Game);

  function fresh(day) {
    K.newRun(Game);
    Game.recordMoment = () => {};
    Game.ledgerAdd = () => {};
    said.length = 0;
    Game.state.scholar.day = day || 10;
    Game.state.nationalLive = false;
    Game.state.village.pantry = [];
    Game.state.otherVillages = [{
      id: 'vtest', name: 'Test Village', opinion: 40,
      roster: [{ id: 'spk', name: 'Speaker', alive: true }],
      pantryKcal: 9000, x: 4, y: 4,
    }];
  }
  // Hand-built lead link. dir 'sub': Haven is subordinate (primary vtest);
  // dir 'pri': Haven is primary (subordinate vtest). A fresh object per
  // case — succession/theirLeaderDied mark mourning, so a re-used link
  // would hit the grief-coalesce branch instead of the haircut.
  function leadLink(dir, trust) {
    const link = {
      id: 'link_r130', primary: dir === 'sub' ? 'vtest' : 'haven',
      subordinate: dir === 'sub' ? 'haven' : 'vtest',
      status: 'active', kind: 'lead', trust: trust != null ? trust : 40,
      tributeKcalPerWeek: 2000, tributePaidKcal: 0, tributePaidWeek: -1,
      tributeWeek: -1, arrears: 0, history: [], day: 10,
      pendingRenegotiation: null, mourningUntil: 0, griefGrabs: 0,
      conquered: false,
      theirSpeaker: { id: 'spk', name: 'Speaker' },
    };
    Game.hierarchyState = () => [link];
    Game._linkedVillageWeek = () => {};
    return link;
  }
  function checkSuccession(label, link, day) {
    const t0 = link.trust;
    const ret = Game.successionCrisis(link.id);
    T.ok(label + ': trust falls exactly 8 (number unchanged)',
      link.trust === Math.max(0, t0 - 8), 'trust ' + t0 + '->' + link.trust);
    T.ok(label + ': note names the amount (trust -8)',
      noteHas(link, '(trust -8)'),
      'notes: ' + (link.history || []).map(h => h.note).join(' | '));
    T.ok(label + ': say names the amount (Trust -8.)',
      sayHas(said, '(Trust -8.)'),
      'says: ' + said.join(' | ').slice(0, 400));
    return ret;
  }
  function checkTheirLeader(label, link) {
    const t0 = link.trust;
    const ret = Game.theirLeaderDied(link.id);
    T.ok(label + ': trust falls exactly 8 (number unchanged)',
      link.trust === Math.max(0, t0 - 8), 'trust ' + t0 + '->' + link.trust);
    T.ok(label + ': note names the amount (trust -8)',
      noteHas(link, '(trust -8)'),
      'notes: ' + (link.history || []).map(h => h.note).join(' | '));
    T.ok(label + ': say names the amount (Trust -8.)',
      sayHas(said, '(Trust -8.)'),
      'says: ' + said.join(' | ').slice(0, 400));
    return ret;
  }

  // ---- 1. successionCrisis, young link (day0 - link.day < 21) ----
  T.section('1. successionCrisis — young link');
  fresh(10); let link = leadLink('sub');
  checkSuccession('young, Haven subordinate', link, 10);
  fresh(10); link = leadLink('pri');
  checkSuccession('young, Haven primary', link, 10);

  // ---- 2. successionCrisis, mature link (day0 - link.day >= 21) ----
  T.section('2. successionCrisis — mature link');
  fresh(40); link = leadLink('sub'); link.griefGrabs = 0;
  checkSuccession('mature, Haven subordinate, grief leverage', link, 40);
  fresh(40); link = leadLink('sub'); link.griefGrabs = 2;
  checkSuccession('mature, Haven subordinate, grief card spent', link, 40);
  fresh(40); link = leadLink('pri');
  checkSuccession('mature, Haven primary, subordinate tests', link, 40);

  // ---- 3. successionCrisis, SUCCGRACE branch (env-gated) ----
  T.section('3. successionCrisis — SUCCGRACE branch');
  process.env.SUCCGRACE = '1';
  fresh(40); link = leadLink('pri', 30);
  Game.state.nationalLive = true;
  const graceRet = checkSuccession('SUCCGRACE, sub-bar link at the funeral', link, 40);
  T.ok('SUCCGRACE: returns grace (beat staged, not dissolved)',
    graceRet === 'grace', 'returned ' + graceRet);
  delete process.env.SUCCGRACE;

  // ---- 4. theirLeaderDied — the mirror -8 ----
  T.section('4. theirLeaderDied — mirror -8');
  fresh(40); link = leadLink('sub');
  checkTheirLeader('their leader died, Haven subordinate renegotiates', link);
  fresh(40); link = leadLink('pri'); link.griefGrabs = 0;
  checkTheirLeader('their leader died, Haven installs speaker (leverage)', link);
  fresh(40); link = leadLink('pri'); link.griefGrabs = 2;
  checkTheirLeader('their leader died, grief card spent', link);

  // ---- 5. answerDemand refuse -15 (note only) ----
  T.section('5. answerDemand — refuse -15');
  fresh(10); link = leadLink('sub');
  const d = Game.primaryDemand(link.id);
  T.ok('demand staged', !!d && !!d.kind, 'demand=' + JSON.stringify(d && d.kind));
  said.length = 0;
  const t0d = link.trust;
  Game.answerDemand(link.id, false);
  T.ok('refuse: trust falls exactly 15 (number unchanged)',
    link.trust === Math.max(0, t0d - 15), 'trust ' + t0d + '->' + link.trust);
  T.ok('refuse: note names the amount (trust -15, honor-branch format)',
    noteHas(link, 'trust -15'),
    'notes: ' + (link.history || []).map(h => h.note).join(' | '));
  T.ok('refuse: say still states the resulting trust level (pre-existing)',
    said.some(t => /trust: \d+/.test(String(t))),
    'says: ' + said.join(' | ').slice(0, 300));

  // ---- 6. answerTradeCall refuse -4 (note only) ----
  T.section('6. answerTradeCall — refuse -4');
  fresh(10);
  const tradeLink = {
    id: 'link_trade', primary: 'vtest', subordinate: 'haven',
    status: 'active', kind: 'trade', trust: 40, history: [],
    pendingTradeCall: { day: 10 },
  };
  Game.hierarchyState = () => [tradeLink];
  const t0t = tradeLink.trust;
  const tr = Game.answerTradeCall(tradeLink.id, 'refuse');
  T.ok('refuse: returns refused', tr === 'refused', 'returned ' + tr);
  T.ok('refuse: trust falls exactly 4 (number unchanged)',
    tradeLink.trust === Math.max(0, t0t - 4), 'trust ' + t0t + '->' + tradeLink.trust);
  T.ok('refuse: note names the amount (trust -4)',
    noteHas(tradeLink, '(trust -4)'),
    'notes: ' + (tradeLink.history || []).map(h => h.note).join(' | '));
  T.ok('refuse: say names the amount (Trust -4.) (pre-existing)',
    sayHas(said, '(Trust -4.)'), 'says: ' + said.join(' | ').slice(0, 300));

  // ---- 7. answerDefenseCall refuse -10, league-wide (note only) ----
  T.section('7. answerDefenseCall — refuse -10 across the league');
  fresh(10);
  const defLink = {
    id: 'link_def', primary: 'vtest', subordinate: 'haven',
    a: 'haven', b: 'vtest',
    status: 'active', kind: 'covenant', trust: 40, history: [],
    pendingDefense: { day: 10 },
  };
  const peerLink = {
    id: 'link_peer', primary: 'vtest2', subordinate: 'haven',
    a: 'haven', b: 'vtest2',
    status: 'active', kind: 'covenant', trust: 40, history: [],
  };
  Game.hierarchyState = () => [defLink, peerLink];
  const t0f = defLink.trust, t0p = peerLink.trust;
  const dr = Game.answerDefenseCall(defLink.id, 'refuse');
  T.ok('refuse: returns refused', dr === 'refused', 'returned ' + dr);
  T.ok('refuse: called link trust falls exactly 10 (number unchanged)',
    defLink.trust === Math.max(0, t0f - 10), 'trust ' + t0f + '->' + defLink.trust);
  T.ok('refuse: peer link trust falls exactly 10 (number unchanged)',
    peerLink.trust === Math.max(0, t0p - 10), 'trust ' + t0p + '->' + peerLink.trust);
  T.ok('refuse: called link note names the amount (trust -10)',
    noteHas(defLink, '(trust -10)'),
    'notes: ' + (defLink.history || []).map(h => h.note).join(' | '));
  T.ok('refuse: peer link note names the amount (trust -10)',
    noteHas(peerLink, '(trust -10)'),
    'notes: ' + (peerLink.history || []).map(h => h.note).join(' | '));
  T.ok('refuse: say names the amount (Trust -10 across the league.) (pre-existing)',
    sayHas(said, '(Trust -10 across the league.)'),
    'says: ' + said.join(' | ').slice(0, 300));

  // ---- 8. linkTick arrears -6 (note always; say 40% — loop to catch it) ----
  T.section('8. linkTick — arrears -6');
  let arrearsNote = false, arrearsSay = false, arrearsDelta = null;
  for (let attempt = 0; attempt < 30 && !arrearsSay; attempt++) {
    fresh(14);
    const al = leadLink('sub', 40);
    al.day = 0; // existed all of the settled week (week 1), so the
    // shortfall is charged — a link formed mid-week gets grace.
    al.tributePaidWeek = -5;
    Game.mshipState().lastLinkWeek = -99;
    const tb = al.trust;
    Game.linkTick();
    if (al.arrears > 0) {
      arrearsDelta = tb - al.trust;
      if (noteHas(al, '(trust -6)')) arrearsNote = true;
      if (sayHas(said, '(Trust -6.)')) arrearsSay = true;
    }
  }
  T.ok('arrears: trust falls exactly 6 when the shortfall lands',
    arrearsDelta === 6, 'delta=' + arrearsDelta);
  T.ok('arrears: note names the amount (trust -6)', arrearsNote);
  T.ok('arrears: say names the amount (Trust -6.) when it speaks', arrearsSay);

  // ---- 9. linkTick sabotage -4 (12% branch, 50% say — loop to catch it) ----
  T.section('9. linkTick — sabotage -4');
  let sabNote = false, sabSay = false, sabDelta = null, sabFired = false;
  for (let attempt = 0; attempt < 60 && !(sabNote && sabSay); attempt++) {
    fresh(14);
    const sl = leadLink('pri', 25);
    sl.conquered = true;
    sl.tributeKcalPerWeek = 2000;
    Game.mshipState().lastLinkWeek = -99;
    const tb = sl.trust;
    const arrBefore = sl.arrears;
    Game.linkTick();
    // sabotage adds exactly half the weekly tribute to arrears.
    if (sl.status === 'active' && sl.arrears - arrBefore === 1000) {
      sabFired = true;
      sabDelta = tb - sl.trust;
      if (noteHas(sl, '(trust -4)')) sabNote = true;
      if (sayHas(said, '(Trust -4.)')) sabSay = true;
    }
  }
  T.ok('sabotage: branch fired inside the loop', sabFired);
  T.ok('sabotage: trust falls exactly 4 when it lands',
    sabDelta === 4, 'delta=' + sabDelta);
  T.ok('sabotage: note names the amount (trust -4)', sabNote);
  T.ok('sabotage: say names the amount (Trust -4.) when it speaks', sabSay);

  // ---- 10. answerAidBeg refuse -5 / -10 (note was missing; say already named it) ----
  // Fresh band (seed 131004, d138) fired a -5 no-debt refuse with no book
  // note: the analyzer reads voiced NO-GO on the band for this writer alone.
  // The debt -10 note existed but named no amount. Both branches now name
  // the amount in the note, in the house pattern; numbers unchanged.
  T.section('10. answerAidBeg — refuse -5 / -10');
  function aidBegCase(debt) {
    fresh(10);
    const link = leadLink('sub', 40);
    if (debt) Game.aidLedger('vtest').receivedKcal = 5000;
    Game.state.pendingAidBeg = { villageId: 'vtest', face: 'Speaker', amount: 1000 };
    said.length = 0;
    return link;
  }
  let ab = aidBegCase(false);
  const t0a = ab.trust;
  const ar = Game.answerAidBeg('refuse');
  T.ok('refuse no-debt: returns refused', ar === 'refused', 'returned ' + ar);
  T.ok('refuse no-debt: trust falls exactly 5 (number unchanged)',
    ab.trust === Math.max(0, t0a - 5), 'trust ' + t0a + '->' + ab.trust);
  T.ok('refuse no-debt: note names the amount (trust -5)',
    noteHas(ab, '(trust -5)'),
    'notes: ' + (ab.history || []).map(h => h.note).join(' | '));
  T.ok('refuse no-debt: say names the amount (Trust -5.) (pre-existing)',
    sayHas(said, '(Trust -5.)'), 'says: ' + said.join(' | ').slice(0, 300));
  ab = aidBegCase(true);
  const t0b = ab.trust;
  const br = Game.answerAidBeg('refuse');
  T.ok('refuse debt: returns refused', br === 'refused', 'returned ' + br);
  T.ok('refuse debt: trust falls exactly 10 (number unchanged)',
    ab.trust === Math.max(0, t0b - 10), 'trust ' + t0b + '->' + ab.trust);
  T.ok('refuse debt: note names the amount (trust -10)',
    noteHas(ab, '(trust -10)'),
    'notes: ' + (ab.history || []).map(h => h.note).join(' | '));
  T.ok('refuse debt: say names the amount (Trust -10. embedded — pre-existing)',
    sayHas(said, '(Trust -10.'), 'says: ' + said.join(' | ').slice(0, 300));

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
