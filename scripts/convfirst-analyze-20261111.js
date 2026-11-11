// convfirst-analyze-20261111.js — conversations first-numbers analyzer
// (arm sim-convfirst-a, run fleshout-20261111T0815Z). Standalone —
// the secondlink analyzer's link classification is reused only in
// shape, not imported: this arm's link slice is small and the daily
// snapshots here carry no raiser census.
//
// Loads the control + neutral legs from
// evidence/2026-11-11/perseed-convfirst-a/ (RUN=convfirst-pilot).
// Usage:
//   RUN=convfirst-pilot node scripts/convfirst-analyze-20261111.js
// Writes evidence/2026-11-11/convfirst-summary-<RUN>.json and
// prints the band report + GO verdict against the prereg bar.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const RUN = process.env.RUN || 'convfirst-pilot';
const DIR = path.join(REPO, 'evidence', '2026-11-11', 'perseed-convfirst-a');

function load(mode) {
  const out = {};
  fs.readdirSync(DIR).filter(function (f) { return f.indexOf('-' + RUN + '-' + mode + '.json') !== -1; }).forEach(function (f) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    out[j.seed] = j;
  });
  return out;
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function isStarvationCause(cause) {
  return typeof cause === 'string' && /starvation|hunger/i.test(cause);
}

function dayBand(day) {
  if (day <= 30) return '1-30';
  if (day <= 60) return '31-60';
  if (day <= 90) return '61-90';
  return '91+';
}

// Opening class of one talkTo event (prereg metric 1).
function openClass(ev) {
  if (!ev.opened) return 'failed-open';
  const c = ev.convo || {};
  if (c.thread) return 'thread:' + c.thread;
  if (c.pendingQ) return 'question:' + String(c.pendingQ);
  if (c.genericQ) return 'generic:' + String(c.genericQ);
  if (ev.talkReq) return 'request';
  return 'other';
}

// talkReason kind from a villagerInitiative request line.
function reasonKind(line) {
  if (!line) return null;
  if (/People are saying things/.test(line)) return 'gossip';
  if (/I need something to do/.test(line)) return 'goal:prove';
  if (/I need some space/.test(line)) return 'goal:alone';
  if (/Have you seen anyone on the roads/.test(line)) return 'goal:family';
  if (/We need to discuss how things are run/.test(line)) return 'goal:lead';
  if (/The stores\. Have you looked/.test(line)) return 'pantry-low';
  if (/Just\.\.\. talk\. Like people used to/.test(line)) return 'just-talk';
  return null;
}

const INVITE_LINES = [
  'Hey — come here. You should hear this.',
  'You. Yeah, you. What do you make of this?',
  "Don't just stand there — you've got opinions, right?",
];

// Reconstruct talk-request instances for one seed and classify each
// by source + fate. Key: vid + stage day.
function analyzeRequests(j) {
  const tk = j.talk || {};
  const daily = j.daily || [];
  const instances = {}; // key -> {vid, day, line, bondProposal, linkRaise, source, fate}
  function key(vid, day) { return vid + '|' + day; }
  function ensure(vid, day, extra) {
    const k = key(vid, day);
    if (!instances[k]) instances[k] = { vid: vid, day: day, line: null, bondProposal: false, linkRaise: false, source: null, fate: null };
    if (extra) {
      if (extra.line != null && instances[k].line == null) instances[k].line = extra.line;
      if (extra.bondProposal) instances[k].bondProposal = true;
      if (extra.linkRaise) instances[k].linkRaise = true;
    }
    return instances[k];
  }
  // Snapshots: the live roll each day.
  daily.forEach(function (s) {
    (s.talkRequests || []).forEach(function (q) {
      ensure(q.vid, q.day, { line: q.line, bondProposal: q.bondProposal, linkRaise: q.linkRaise });
    });
  });
  // Initiative stagings (source = villagerInitiative).
  (tk.initiativeEvents || []).forEach(function (e) {
    const inst = ensure(e.vid, e.day, { line: e.line, bondProposal: e.bondProposal, linkRaise: e.linkRaise });
    inst.source = 'villagerInitiative';
    inst.reasonKind = reasonKind(e.line);
  });
  // Expiries (fate = expired unless already delivered).
  const expiredKeys = {};
  (tk.expireEvents || []).forEach(function (e) {
    const stageDay = e.day - (e.age || 0);
    const inst = ensure(e.vid, stageDay, { bondProposal: e.bondProposal, linkRaise: e.linkRaise });
    expiredKeys[key(e.vid, stageDay)] = true;
    if (inst.fate !== 'delivered') inst.fate = 'expired';
    inst.expiredDelivered = !!e.delivered;
  });
  // Deliveries: any snapshot or open that saw delivered=true.
  daily.forEach(function (s) {
    (s.talkRequests || []).forEach(function (q) {
      if (q.delivered) {
        const inst = ensure(q.vid, q.day, {});
        inst.fate = 'delivered';
      }
    });
  });
  (tk.talkOpens || []).forEach(function (ev) {
    if (ev.talkReq && ev.talkReq.delivered && ev.talkReq.day != null) {
      const inst = ensure(ev.vid, ev.talkReq.day, {});
      inst.fate = 'delivered';
    }
  });
  // Final snapshot: still present + undelivered = pending-at-end.
  const last = daily.length ? daily[daily.length - 1] : null;
  if (last) {
    (last.talkRequests || []).forEach(function (q) {
      if (!q.delivered) {
        const inst = ensure(q.vid, q.day, {});
        if (!inst.fate) inst.fate = 'pending-at-end';
      }
    });
  }
  // Source classification for anything the initiative events did
  // not already claim.
  Object.keys(instances).forEach(function (k) {
    const inst = instances[k];
    if (!inst.source) {
      if (inst.bondProposal) inst.source = 'bondProposal';
      else if (inst.linkRaise) inst.source = 'linkRaise';
      else if (inst.day === 1 && inst.line && /Day one/.test(inst.line)) inst.source = 'betrayal-day1';
      else if (inst.line && INVITE_LINES.some(function (l) { return inst.line.indexOf(l) !== -1; })) inst.source = 'invitation';
      else inst.source = 'other';
    }
    if (!inst.fate) inst.fate = 'unknown';
  });
  return Object.keys(instances).map(function (k) { return instances[k]; });
}

function analyzeSeed(j) {
  const tk = j.talk || {};
  const daily = j.daily || [];
  const r = {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    won: !!j.won, villageLost: !!j.villageLost, scaleRank: j.scaleRank,
    maxWave: j.maxWave || 1, standing: j.standing, linkTotal: j.linkTotal,
    endPantryKcal: j.endPantryKcal,
    instrumentErrors: (j.instrumentErrors || []).length,
  };

  // --- Metric 1: opens ---
  const opens = tk.talkOpens || [];
  const openClasses = {};
  const openBands = { '1-30': 0, '31-60': 0, '61-90': 0, '91+': 0 };
  const openCallers = {};
  const openVids = {};
  let failedOpens = 0;
  opens.forEach(function (ev) {
    const cls = openClass(ev);
    openClasses[cls] = (openClasses[cls] || 0) + 1;
    openBands[dayBand(ev.day || 0)]++;
    openCallers[ev.caller || 'other'] = (openCallers[ev.caller || 'other'] || 0) + 1;
    if (ev.vid) openVids[ev.vid] = (openVids[ev.vid] || 0) + 1;
    if (!ev.opened) failedOpens++;
  });
  r.opens = {
    talkToCalls: tk.talkToCalls || 0,
    recorded: opens.length,
    failedOpens: failedOpens,
    byClass: openClasses,
    unclassified: openClasses.other || 0,
    byBand: openBands,
    byCaller: openCallers,
    distinctVids: Object.keys(openVids).length,
    topVids: Object.keys(openVids).sort(function (a, b) { return openVids[b] - openVids[a]; }).slice(0, 5).map(function (v) { return v + ':' + openVids[v]; }),
    overflow: opens.filter(function (e) { return e._overflow; }).length,
  };

  // --- Endings (metric 1 tail) ---
  const ends = tk.endEvents || [];
  const endHows = {};
  const endCallers = {};
  const exchanges = [];
  ends.forEach(function (ev) {
    endHows[ev.how || 'other'] = (endHows[ev.how || 'other'] || 0) + 1;
    endCallers[ev.caller || 'other'] = (endCallers[ev.caller || 'other'] || 0) + 1;
    if (ev.convo && ev.convo.exchanges != null) exchanges.push(ev.convo.exchanges);
  });
  r.endings = {
    endConvoCalls: tk.endConvoCalls || 0,
    recorded: ends.length,
    byHow: endHows,
    byCaller: endCallers,
    exchangesZero: exchanges.filter(function (x) { return x === 0; }).length,
    exchanges1to2: exchanges.filter(function (x) { return x >= 1 && x <= 2; }).length,
    exchanges3plus: exchanges.filter(function (x) { return x >= 3; }).length,
    maxExchanges: exchanges.length ? Math.max.apply(null, exchanges) : 0,
  };

  // --- Metric 2: turns & choice kinds ---
  const turns = tk.turnEvents || [];
  const kinds = {};
  const turnCallers = {};
  const askTopics = {};
  const ansIds = {};
  const gqKinds = {};
  const skillNames = {};
  const unclassifiedTurns = [];
  turns.forEach(function (ev) {
    kinds[ev.kind || 'other'] = (kinds[ev.kind || 'other'] || 0) + 1;
    turnCallers[ev.caller || 'other'] = (turnCallers[ev.caller || 'other'] || 0) + 1;
    if (ev.kind === 'other') unclassifiedTurns.push(ev.choiceId);
    if (ev.kind === 'ask' && ev.choiceId) {
      const topic = String(ev.choiceId).slice(4).split(':')[0];
      askTopics[topic] = (askTopics[topic] || 0) + 1;
    }
    if (ev.kind === 'ans' && ev.choiceId) {
      const id = String(ev.choiceId).slice(4).split(':')[0];
      ansIds[id] = (ansIds[id] || 0) + 1;
    }
    if (ev.kind === 'gq' && ev.choiceId) {
      const gk = String(ev.choiceId).slice(3).split(':')[0];
      gqKinds[gk] = (gqKinds[gk] || 0) + 1;
    }
    if ((ev.kind === 'skill_learn' || ev.kind === 'skill_teach') && ev.choiceId) {
      const nm = String(ev.choiceId).split(':').slice(2).join(':') || String(ev.choiceId);
      skillNames[nm] = (skillNames[nm] || 0) + 1;
    }
  });
  r.turns = {
    convoTurnCalls: tk.convoTurnCalls || 0,
    recorded: turns.length,
    byKind: kinds,
    unclassified: kinds.other || 0,
    unclassifiedIds: unclassifiedTurns,
    byCaller: turnCallers,
    askTopics: askTopics,
    ansIds: ansIds,
    gqKinds: gqKinds,
    skillNames: skillNames,
    overflow: turns.filter(function (e) { return e._overflow; }).length,
  };

  // --- Metric 3: threads & follow-up depth ---
  const threadCounts = {};
  Object.keys(openClasses).forEach(function (cls) {
    if (cls.indexOf('thread:') === 0) threadCounts[cls.slice(7)] = openClasses[cls];
  });
  r.threads = {
    openThreads: threadCounts,
    morePicks: kinds.more || 0,
    naturalEnds: endHows.natural || 0,
    leftEnds: endHows.left || 0,
  };

  // --- Metrics 4–5: talk requests ---
  const reqs = analyzeRequests(j);
  const reqSources = {};
  const reqFates = {};
  reqs.forEach(function (q) {
    reqSources[q.source] = (reqSources[q.source] || 0) + 1;
    reqFates[q.fate] = (reqFates[q.fate] || 0) + 1;
  });
  r.requests = {
    total: reqs.length,
    bySource: reqSources,
    byFate: reqFates,
    unclassifiedSource: reqSources.other || 0,
    unknownFate: reqFates.unknown || 0,
    initiativeCalls: tk.initiativeCalls || 0,
    initiativeStaged: (tk.initiativeEvents || []).length,
    expireCalls: tk.expireCalls || 0,
    expired: (tk.expireEvents || []).length,
    detail: reqs,
  };

  // --- Metric 5 tail: NPC questions asked ---
  let pendingQOpens = 0, genericQOpens = 0;
  opens.forEach(function (ev) {
    if (ev.convo && ev.convo.pendingQ) pendingQOpens++;
    if (ev.convo && ev.convo.genericQ) genericQOpens++;
  });
  const lastSnap = daily.length ? daily[daily.length - 1] : null;
  r.questions = {
    pendingQOpens: pendingQOpens,
    genericQOpens: genericQOpens,
    answeredTotalEnd: lastSnap ? lastSnap.answeredTotal : null,
    sittingsTotalEnd: lastSnap ? lastSnap.sittingsTotal : null,
  };

  // --- Metric 6: gossip ---
  const rumorSubjects = {};
  daily.forEach(function (s) {
    (s.rumors || []).forEach(function (rm) {
      if (rm.subject) rumorSubjects[rm.subject] = (rumorSubjects[rm.subject] || 0) + 1;
    });
  });
  r.gossip = {
    askGossip: (kinds.ask && askTopics.gossip) || 0,
    askSpreadRumor: (askTopics.spread_rumor || 0),
    askOthers: (askTopics.others || 0),
    gossipThreadOpens: threadCounts.gossip || 0,
    rumorSubjects: rumorSubjects,
    rumorSnapshots: daily.filter(function (s) { return (s.rumors || []).length; }).length,
  };

  // --- Metric 7: teaching ---
  r.teaching = {
    teachPicks: kinds.teach || 0,
    skillLearnPicks: kinds.skill_learn || 0,
    skillTeachPicks: kinds.skill_teach || 0,
    skillNames: skillNames,
  };

  // --- Metric 8: secrets / hawker / compareMaps / link-in-conversation ---
  let secretOpens = 0, confessedSittings = 0;
  opens.forEach(function (ev) { if (ev.convo && ev.convo.thread === 'secret') secretOpens++; });
  ends.forEach(function (ev) { if (ev.convo && ev.convo.confessed) confessedSittings++; });
  const hawkerYes = (tk.hawkerBuys || []).filter(function (b) { return b.ok; }).length;
  r.extras = {
    secretOpens: secretOpens,
    confessedSittings: confessedSittings,
    hawkerOffers: (tk.hawkerOffers || []).length,
    hawkerBuys: (tk.hawkerBuys || []).length,
    hawkerBuysOk: hawkerYes,
    hawkerOfferDetail: tk.hawkerOffers || [],
    compareMapsCalls: (tk.compareMapsCalls || []).length,
    compareMapsNew: (tk.compareMapsCalls || []).reduce(function (a, c) { return a + (c.newCount || 0); }, 0),
    bondPicks: kinds.bond || 0,
    linkPicks: kinds.link || 0,
    talksWithRaiserPending: opens.filter(function (ev) { return ev.pendingRaise; }).length,
    stageCalls: (j.stageCalls || []).length,
    acceptCalls: (j.acceptCalls || []).length,
    declineCalls: (j.declineCalls || []).length,
    proposeCalls: (j.proposeCalls || []).length,
    proposeFormed: (j.proposeCalls || []).filter(function (p) { return p.outcome === 'formed'; }).length,
    bondEvents: (j.bondEvents || []).length,
  };

  // --- Deaths ---
  const deaths = j.deaths || [];
  const causes = {};
  deaths.forEach(function (d) {
    const c = (d && d.cause) || '?';
    causes[c] = (causes[c] || 0) + 1;
  });
  r.deaths = {
    total: deaths.length,
    starvation: deaths.filter(function (d) { return isStarvationCause(d && d.cause); }).length,
    player: deaths.filter(function (d) { return d && d.player; }).length,
    causes: causes,
  };
  r.sayCount = j.sayCount || 0;
  r.convSays = j.convSays || [];
  return r;
}

function wallOf(perSeed) {
  return {
    wins: perSeed.filter(function (s) { return s.won; }).length,
    national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: perSeed.filter(function (s) { return s.won; }).length,
    wave4unlocks: perSeed.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
    wave5unlocks: perSeed.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    medianSurvival: median(perSeed.map(function (s) { return s.days; })),
    survivors: perSeed.filter(function (s) { return s.endReason === 'horizon'; }).length,
  };
}

function sum(perSeed, fn) { return perSeed.reduce(function (t, s) { return t + (fn(s) || 0); }, 0); }
function mergeCounts(perSeed, fn) {
  const out = {};
  perSeed.forEach(function (s) {
    const c = fn(s) || {};
    Object.keys(c).forEach(function (k) { out[k] = (out[k] || 0) + c[k]; });
  });
  return out;
}

function main() {
  const control = load('control');
  const neutral = load('neutral');
  const seeds = Object.keys(control).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) { console.error('CONVFIRST ANALYZE STOP: no control-leg files for run ' + RUN); process.exit(2); }
  const missingNeutral = seeds.filter(function (s) { return !neutral[s]; });
  if (missingNeutral.length) { console.error('CONVFIRST ANALYZE STOP: neutral leg missing seeds ' + missingNeutral.join(',')); process.exit(2); }
  const perSeed = seeds.map(function (s) { return analyzeSeed(control[s]); });

  // Neutrality: days + end pantry kcal + deaths must match exactly.
  const neutrality = seeds.map(function (s) {
    const c = control[s], n = neutral[s];
    const ok = c.days === n.days && c.endPantryKcal === n.endPantryKcal && (c.deaths || []).length === (n.deaths || []).length;
    return {
      seed: s, ok: ok,
      days: [c.days, n.days], endPantryKcal: [c.endPantryKcal, n.endPantryKcal],
      deaths: [(c.deaths || []).length, (n.deaths || []).length],
    };
  });
  const neutralOk = neutrality.filter(function (x) { return x.ok; }).length;

  const band = {
    run: RUN, seeds: seeds,
    opens: {
      total: sum(perSeed, function (s) { return s.opens.recorded; }),
      talkToCalls: sum(perSeed, function (s) { return s.opens.talkToCalls; }),
      failedOpens: sum(perSeed, function (s) { return s.opens.failedOpens; }),
      unclassified: sum(perSeed, function (s) { return s.opens.unclassified; }),
      byClass: mergeCounts(perSeed, function (s) { return s.opens.byClass; }),
      byBand: mergeCounts(perSeed, function (s) { return s.opens.byBand; }),
      byCaller: mergeCounts(perSeed, function (s) { return s.opens.byCaller; }),
    },
    endings: {
      byHow: mergeCounts(perSeed, function (s) { return s.endings.byHow; }),
      byCaller: mergeCounts(perSeed, function (s) { return s.endings.byCaller; }),
      exchangesZero: sum(perSeed, function (s) { return s.endings.exchangesZero; }),
      exchanges1to2: sum(perSeed, function (s) { return s.endings.exchanges1to2; }),
      exchanges3plus: sum(perSeed, function (s) { return s.endings.exchanges3plus; }),
      maxExchanges: Math.max.apply(null, perSeed.map(function (s) { return s.endings.maxExchanges; })),
    },
    turns: {
      total: sum(perSeed, function (s) { return s.turns.recorded; }),
      convoTurnCalls: sum(perSeed, function (s) { return s.turns.convoTurnCalls; }),
      unclassified: sum(perSeed, function (s) { return s.turns.unclassified; }),
      byKind: mergeCounts(perSeed, function (s) { return s.turns.byKind; }),
      byCaller: mergeCounts(perSeed, function (s) { return s.turns.byCaller; }),
      askTopics: mergeCounts(perSeed, function (s) { return s.turns.askTopics; }),
      ansIds: mergeCounts(perSeed, function (s) { return s.turns.ansIds; }),
      gqKinds: mergeCounts(perSeed, function (s) { return s.turns.gqKinds; }),
      skillNames: mergeCounts(perSeed, function (s) { return s.turns.skillNames; }),
    },
    requests: {
      total: sum(perSeed, function (s) { return s.requests.total; }),
      bySource: mergeCounts(perSeed, function (s) { return s.requests.bySource; }),
      byFate: mergeCounts(perSeed, function (s) { return s.requests.byFate; }),
      unclassifiedSource: sum(perSeed, function (s) { return s.requests.unclassifiedSource; }),
      unknownFate: sum(perSeed, function (s) { return s.requests.unknownFate; }),
      initiativeCalls: sum(perSeed, function (s) { return s.requests.initiativeCalls; }),
      initiativeStaged: sum(perSeed, function (s) { return s.requests.initiativeStaged; }),
    },
    questions: {
      pendingQOpens: sum(perSeed, function (s) { return s.questions.pendingQOpens; }),
      genericQOpens: sum(perSeed, function (s) { return s.questions.genericQOpens; }),
    },
    gossip: {
      askGossip: sum(perSeed, function (s) { return s.gossip.askGossip; }),
      askSpreadRumor: sum(perSeed, function (s) { return s.gossip.askSpreadRumor; }),
      rumorSubjects: mergeCounts(perSeed, function (s) { return s.gossip.rumorSubjects; }),
    },
    teaching: {
      teachPicks: sum(perSeed, function (s) { return s.teaching.teachPicks; }),
      skillLearnPicks: sum(perSeed, function (s) { return s.teaching.skillLearnPicks; }),
      skillTeachPicks: sum(perSeed, function (s) { return s.teaching.skillTeachPicks; }),
      skillNames: mergeCounts(perSeed, function (s) { return s.teaching.skillNames; }),
    },
    extras: {
      secretOpens: sum(perSeed, function (s) { return s.extras.secretOpens; }),
      confessedSittings: sum(perSeed, function (s) { return s.extras.confessedSittings; }),
      hawkerOffers: sum(perSeed, function (s) { return s.extras.hawkerOffers; }),
      hawkerBuys: sum(perSeed, function (s) { return s.extras.hawkerBuys; }),
      hawkerBuysOk: sum(perSeed, function (s) { return s.extras.hawkerBuysOk; }),
      compareMapsCalls: sum(perSeed, function (s) { return s.extras.compareMapsCalls; }),
      compareMapsNew: sum(perSeed, function (s) { return s.extras.compareMapsNew; }),
      bondPicks: sum(perSeed, function (s) { return s.extras.bondPicks; }),
      linkPicks: sum(perSeed, function (s) { return s.extras.linkPicks; }),
      talksWithRaiserPending: sum(perSeed, function (s) { return s.extras.talksWithRaiserPending; }),
      stageCalls: sum(perSeed, function (s) { return s.extras.stageCalls; }),
      acceptCalls: sum(perSeed, function (s) { return s.extras.acceptCalls; }),
      declineCalls: sum(perSeed, function (s) { return s.extras.declineCalls; }),
      proposeCalls: sum(perSeed, function (s) { return s.extras.proposeCalls; }),
      proposeFormed: sum(perSeed, function (s) { return s.extras.proposeFormed; }),
    },
    deaths: {
      total: sum(perSeed, function (s) { return s.deaths.total; }),
      starvation: sum(perSeed, function (s) { return s.deaths.starvation; }),
      causes: mergeCounts(perSeed, function (s) { return s.deaths.causes; }),
    },
    wall: wallOf(perSeed),
    neutrality: { ok: neutralOk, of: seeds.length, detail: neutrality },
    instrumentErrors: sum(perSeed, function (s) { return s.instrumentErrors; }),
    sayCount: sum(perSeed, function (s) { return s.sayCount; }),
    convSayLines: sum(perSeed, function (s) { return (s.convSays || []).length; }),
  };

  // GO verdict against the prereg bar.
  const go = [];
  function check(name, pass, detail) { go.push({ check: name, pass: !!pass, detail: detail }); }
  check('opens-classified', band.opens.unclassified === 0, 'unclassified opens=' + band.opens.unclassified);
  check('turns-classified', band.turns.unclassified === 0, 'unclassified turns=' + band.turns.unclassified);
  check('requests-classified', band.requests.unclassifiedSource === 0 && band.requests.unknownFate === 0,
    'unclassified sources=' + band.requests.unclassifiedSource + ' unknown fates=' + band.requests.unknownFate);
  check('neutrality', neutralOk === seeds.length, neutralOk + '/' + seeds.length + ' seeds match exactly');
  check('instrument-errors', band.instrumentErrors === 0, 'errors=' + band.instrumentErrors);
  check('engagement-floor', band.opens.total >= 5, 'opens=' + band.opens.total);
  band.go = { pass: go.every(function (g) { return g.pass; }), checks: go };

  const outFile = path.join(REPO, 'evidence', '2026-11-11', 'convfirst-summary-' + RUN + '.json');
  fs.writeFileSync(outFile, JSON.stringify({ band: band, perSeed: perSeed }, null, 2) + '\n');

  console.log('CONVFIRST BAND run=' + RUN + ' seeds=' + seeds.join(','));
  seeds.forEach(function (s) {
    const a = perSeed.filter(function (x) { return x.seed === s; })[0];
    const n = neutrality.filter(function (x) { return x.seed === s; })[0];
    console.log(' seed ' + s +
      ' days=' + a.days + ' end=' + a.endReason + ' scale=' + a.scaleRank + ' wave=' + a.maxWave + ' standing=' + a.standing +
      ' opens=' + a.opens.recorded + ' (failed ' + a.opens.failedOpens + ')' +
      ' turns=' + a.turns.recorded + ' ends=' + JSON.stringify(a.endings.byHow) +
      ' reqs=' + a.requests.total + JSON.stringify(a.requests.byFate) +
      ' deaths=' + a.deaths.total + '(starv ' + a.deaths.starvation + ')' +
      ' neutral=' + (n.ok ? 'MATCH' : 'MISMATCH ' + JSON.stringify(n)) + ' err=' + a.instrumentErrors);
  });
  console.log('OPENS total=' + band.opens.total + ' byClass=' + JSON.stringify(band.opens.byClass) + ' byCaller=' + JSON.stringify(band.opens.byCaller));
  console.log('ENDINGS byHow=' + JSON.stringify(band.endings.byHow) + ' exchanges 0/1-2/3+=' + band.endings.exchangesZero + '/' + band.endings.exchanges1to2 + '/' + band.endings.exchanges3plus + ' max=' + band.endings.maxExchanges);
  console.log('TURNS total=' + band.turns.total + ' byKind=' + JSON.stringify(band.turns.byKind) + ' byCaller=' + JSON.stringify(band.turns.byCaller));
  console.log('REQUESTS total=' + band.requests.total + ' bySource=' + JSON.stringify(band.requests.bySource) + ' byFate=' + JSON.stringify(band.requests.byFate));
  console.log('QUESTIONS pendingQ=' + band.questions.pendingQOpens + ' genericQ=' + band.questions.genericQOpens);
  console.log('GOSSIP ask=' + band.gossip.askGossip + ' spread=' + band.gossip.askSpreadRumor + ' subjects=' + JSON.stringify(band.gossip.rumorSubjects));
  console.log('TEACHING teach=' + band.teaching.teachPicks + ' learn=' + band.teaching.skillLearnPicks + ' teachSkill=' + band.teaching.skillTeachPicks + ' names=' + JSON.stringify(band.teaching.skillNames));
  console.log('EXTRAS secretOpens=' + band.extras.secretOpens + ' confessed=' + band.extras.confessedSittings + ' hawker=' + band.extras.hawkerOffers + '/' + band.extras.hawkerBuysOk + ' compareMaps=' + band.extras.compareMapsCalls + '(new ' + band.extras.compareMapsNew + ') bond=' + band.extras.bondPicks + ' link=' + band.extras.linkPicks + ' raiserPending=' + band.extras.talksWithRaiserPending + ' stage/acc/dec/propose=' + band.extras.stageCalls + '/' + band.extras.acceptCalls + '/' + band.extras.declineCalls + '/' + band.extras.proposeCalls);
  console.log('DEATHS total=' + band.deaths.total + ' starvation=' + band.deaths.starvation + ' causes=' + JSON.stringify(band.deaths.causes));
  console.log('WALL wins=' + band.wall.wins + '/8 national=' + band.wall.national + ' table=' + band.wall.table + ' w4=' + band.wall.wave4unlocks + ' w5=' + band.wall.wave5unlocks + ' median=' + band.wall.medianSurvival + ' survivors=' + band.wall.survivors);
  console.log('NEUTRALITY ' + band.neutrality.ok + '/' + band.neutrality.of + ' errors=' + band.instrumentErrors + ' convSayLines=' + band.convSayLines + '/' + band.sayCount);
  console.log('GO pass=' + band.go.pass + ' ' + JSON.stringify(band.go.checks));
  console.log('WROTE ' + path.relative(REPO, outFile));
}

if (require.main === module) main();

module.exports = { analyzeSeed: analyzeSeed, analyzeRequests: analyzeRequests, openClass: openClass, reasonKind: reasonKind, median: median, load: load };
