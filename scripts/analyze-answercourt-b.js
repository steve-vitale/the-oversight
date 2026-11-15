// analyze-answercourt-b.js — analyzer for the BUILD arm sim-answercourt-b
// (run fleshout-loop-b-20261114T1945Z). Reads the per-seed JSONs from
// scripts/answercourt-driver-20261114.js and produces:
//   - per-link trajectories + classification (seasoned-and-counted /
//     seasoned-but-no-polity / broke-<reason> / never-seasoned-<bar> /
//     still-young-at-end / UNCLASSIFIED)
//   - the verb attribution table (per verb: calls, trust deltas, links
//     moved 30->40, diplomacy points carried), split policy/engine
//   - per-seed + per-policy aggregates (wall numbers, polity days)
//   - diplomacy-point attribution, EPISODE-BASED (holdpantry fix for the
//     scaleclimb metric-review §2 failure): every +34 step AND every −34
//     step is named to the link episode that started/ended that day, so
//     flickering legs (count → un-count → re-count) attribute 0
//     unattributed steps in BOTH directions. A link that un-seasons and
//     re-counts gets a new counting episode, not just its first.
//   - NATIONAL metrics (the primary): nationalEver (scaleRank ever
//     national/global in the per-day series), firstNationalDay,
//     nationalHeldDays, answerNationalChoice counts per staged shape,
//     pendingNationalDays, starvation deaths per seed.
// Usage: node scripts/analyze-answercourt-b.js [perSeedDir]
//   writes evidence/2026-11-14/answercourt-b-analysis.json and prints a
//   human summary to stdout.
// As a module: { linkTrajectories, classifyLink, attribute, analyze }.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

function linkTrajectories(rec) {
  const map = {};
  for (const sn of (rec.series || [])) {
    for (const l of (sn.linksRoll || [])) {
      if (!l || !l.id) continue;
      if (!map[l.id]) {
        map[l.id] = {
          id: l.id, other: l.o, kind: l.k, primary: l.p, subordinate: l.sub,
          conquered: !!l.cq, formedDay: l.f, entries: [],
        };
      }
      map[l.id].entries.push({
        d: sn.d, trust: l.t, age: l.age, status: l.st,
        seasoned: !!l.se, counted: !!(l.se && l.rp),
        arrears: l.ar, tendedWeek: l.tw,
      });
    }
  }
  return map;
}

function breakReasonFor(rec, linkId) {
  for (const ev of (rec.verbEvents || [])) {
    if (ev.verb === 'breakLink' && ev.linkId === linkId) return ev.result || 'broke';
  }
  return null;
}

// Classify ONE link trajectory. Returns a class string; 'UNCLASSIFIED'
// only when no rule below matches (fails G1).
function classifyLink(traj, rec) {
  if (!traj || !traj.entries.length) return 'UNCLASSIFIED';
  const es = traj.entries;
  const last = es[es.length - 1];
  const everCounted = es.some(function (e) { return e.counted; });
  if (everCounted) return 'seasoned-and-counted';
  const everSeasoned = es.some(function (e) { return e.seasoned; });
  if (everSeasoned) return 'seasoned-but-no-polity';
  if (last.status === 'broken') {
    const why = breakReasonFor(rec, traj.id);
    return 'broke-' + (why ? String(why).replace(/^broke:/, '') : 'unknown');
  }
  if ((last.age | 0) < 30) return 'still-young-at-end';
  if ((last.trust | 0) < 40) return 'never-seasoned-trust<' + (last.trust | 0);
  return 'UNCLASSIFIED';
}

// Attribute every trust move and every diplomacy point in one record.
// Returns { verbs, formations, links, polityDays, dipSteps, unattributed }.
function attribute(rec) {
  const trajs = linkTrajectories(rec);
  const evs = rec.verbEvents || [];
  const verbs = {};
  function vb(name) {
    if (!verbs[name]) verbs[name] = { calls: 0, dTrust: 0, crossings: 0, refused: 0, links: {} };
    return verbs[name];
  }
  // Crossing detection: a tend/accord event with before<40<=after.
  for (const ev of evs) {
    const key = ev.verb + ':' + ev.caller;
    const v = vb(key);
    v.calls++;
    if (ev.dTrust !== null && ev.dTrust !== undefined) {
      v.dTrust += ev.dTrust;
      if (ev.linkId) v.links[ev.linkId] = (v.links[ev.linkId] || 0) + ev.dTrust;
    }
    if (ev.result === 'n=0') v.refused++;
    if ((ev.verb === 'tendLink' || ev.verb === 'answerAccord') &&
      ev.before !== null && ev.after !== null && ev.before < 40 && ev.after >= 40) {
      v.crossings++;
    }
  }
  // Formations: _formLink/_formPeerLink events carry `via`.
  const formations = [];
  for (const ev of evs) {
    if (ev.verb === '_formLink' || ev.verb === '_formPeerLink') {
      formations.push({
        day: ev.day, linkId: ev.linkId, other: ev.other,
        via: (ev.result || '').replace(/^formed via /, ''),
        caller: ev.caller,
      });
    }
  }
  // Per-link classification + seasoning day + crossing verb.
  const links = [];
  for (const id of Object.keys(trajs)) {
    const t = trajs[id];
    const es = t.entries;
    let seasonedDay = null, countedDay = null, crossedVerb = null;
    let trust40Day = null;
    for (const e of es) {
      if (seasonedDay === null && e.seasoned) seasonedDay = e.d;
      if (countedDay === null && e.counted) countedDay = e.d;
      if (trust40Day === null && e.trust >= 40) trust40Day = e.d;
    }
    if (trust40Day !== null) {
      // the verb that carried it across 40 within ±1 day of the trust-40
      // day (NOT the seasoned day — seasoning also needs age 30, so a
      // link can sit at 40+ for weeks before it seasons).
      for (const ev of evs) {
        if (ev.linkId !== id) continue;
        if ((ev.verb !== 'tendLink' && ev.verb !== 'answerAccord' &&
          ev.verb !== 'answerRenegotiation' && ev.verb !== 'answerDemand') ||
          ev.before === null || ev.after === null) continue;
        if (Math.abs(ev.day - trust40Day) <= 1 && ev.before < 40 && ev.after >= 40) {
          crossedVerb = ev.verb + ':' + ev.caller;
          break;
        }
      }
      if (!crossedVerb) {
        // it crossed 40 without a verb event in the window — the weekly
        // tribute tick (+1/week) or a demand/renegotiation answer the
        // wrapper dates ±1 day off. Name the channel, not the verb.
        crossedVerb = 'tick/other (no verb event ±1d of crossing)';
      }
    }
    links.push({
      id: id, other: t.other, kind: t.kind, primary: t.primary,
      conquered: t.conquered, formedDay: t.formedDay,
      cls: classifyLink(t, rec),
      seasonedDay: seasonedDay, countedDay: countedDay,
      trust40Day: trust40Day,
      crossedVerb: crossedVerb,
      endTrust: es[es.length - 1].trust,
      endAge: es[es.length - 1].age,
      endStatus: es[es.length - 1].status,
      maxTrust: Math.max.apply(null, es.map(function (e) { return e.trust; })),
    });
  }
  // Polity days: first day any haven polity stood, and its shape/size.
  const polityDays = [];
  let lastShape = null;
  for (const sn of (rec.series || [])) {
    const hp = sn.havenPolity;
    const shape = hp ? (hp.shape + '/' + hp.size) : null;
    if (shape !== lastShape) {
      polityDays.push({ day: sn.d, shape: shape });
      lastShape = shape;
    }
  }
  // Diplomacy steps, EPISODE-BASED (holdpantry metric-review §2 fix):
  // the scaleclimb analyzer attributed only UP steps to a link's FIRST
  // counted day, so a flickering leg (count -> un-count -> re-count)
  // left down-steps and re-counts unattributed by construction. Here
  // every link's counted episodes are maximal runs of counted days in
  // the per-day series; an UP step of +34k on day d is attributed to
  // the k episodes that START on d, a DOWN step of −34k to the k
  // episodes that ENDED on d−1. Steps whose magnitude is not a
  // multiple of 34, or that name no episode, are unattributed.
  const episodes = {}; // linkId -> [{start, end}] counted episodes
  for (const id of Object.keys(trajs)) {
    const es = trajs[id].entries;
    const eps = [];
    let cur = null;
    for (const e of es) {
      if (e.counted && !cur) cur = { start: e.d, end: e.d };
      else if (e.counted && cur) cur.end = e.d;
      else if (!e.counted && cur) { eps.push(cur); cur = null; }
    }
    if (cur) eps.push(cur);
    episodes[id] = eps;
  }
  const dipSteps = []; // up steps, each {day, gained, links, dip}
  const dipDownSteps = []; // down steps, each {day, lost, links, dip}
  let prevDip = 0;
  let totalUp = 0, totalDown = 0, attrUp = 0, attrDown = 0;
  for (const sn of (rec.series || [])) {
    const dip = sn.dip | 0;
    const delta = dip - prevDip;
    if (delta > 0) {
      totalUp += delta;
      const started = [];
      for (const id of Object.keys(episodes)) {
        for (const ep of episodes[id]) if (ep.start === sn.d) started.push(id);
      }
      const named = Math.min(started.length * 34, delta);
      attrUp += named;
      dipSteps.push({ day: sn.d, gained: delta, links: started, dip: dip, unattributed: delta - named });
    } else if (delta < 0) {
      const lost = -delta;
      totalDown += lost;
      const ended = [];
      for (const id of Object.keys(episodes)) {
        for (const ep of episodes[id]) if (ep.end === sn.d - 1) ended.push(id);
      }
      const named = Math.min(ended.length * 34, lost);
      attrDown += named;
      dipDownSteps.push({ day: sn.d, lost: lost, links: ended, dip: dip, unattributed: lost - named });
    }
    prevDip = dip;
  }
  // Attribution completeness: end dip must telescope to totalUp −
  // totalDown (series starts at 0); any gap is an instrument error.
  const endDip = (rec.series.length ? (rec.series[rec.series.length - 1].dip | 0) : 0);
  const telescopeGap = endDip - (totalUp - totalDown);
  const unattributed = (totalUp - attrUp) + (totalDown - attrDown);
  return {
    verbs: verbs, formations: formations, links: links,
    polityDays: polityDays, dipSteps: dipSteps, dipDownSteps: dipDownSteps,
    episodes: episodes,
    endDip: endDip, attributedDip: attrUp, attributedDown: attrDown,
    totalUp: totalUp, totalDown: totalDown, telescopeGap: telescopeGap,
    unattributed: unattributed,
    unattributedUp: totalUp - attrUp, unattributedDown: totalDown - attrDown,
  };
}

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function analyze(records) {
  const perSeed = {};
  const byPolicy = {};
  for (const rec of records) {
    const at = attribute(rec);
    const cls = null; // run classification lives in the evidence file via analyze-capablewinpath-b
    const links = at.links;
    const formed = links.length;
    const seasoned = links.filter(function (l) { return l.seasonedDay !== null; }).length;
    const counted = links.filter(function (l) { return l.countedDay !== null; }).length;
    const broke = links.filter(function (l) { return l.cls.indexOf('broke-') === 0; }).length;
    const unclassified = links.filter(function (l) { return l.cls === 'UNCLASSIFIED'; }).length;
    const tendPol = ((at.verbs['tendLink:policy'] || {}).calls | 0);
    const tendEng = ((at.verbs['tendLink:engine'] || {}).calls | 0);
    const tendRefused = (((at.verbs['tendLink:policy'] || {}).refused | 0) + ((at.verbs['tendLink:engine'] || {}).refused | 0));
    const last = rec.series[rec.series.length - 1] || {};
    const maxSimSeasoned = Math.max.apply(null, rec.series.map(function (sn) { return sn.nSeasoned | 0; }).concat([0]));
    // Haven-primary seasoned subs, simultaneous max (the polity bar), and
    // the first day 3 stood at once. nSeasoned counts ALL seasoned links
    // (incl. BELONG), so recompute from the link roll per snapshot.
    let maxSimPrimSeasoned = 0, polityBarDay = null;
    for (const sn of (rec.series || [])) {
      const n = (sn.linksRoll || []).filter(function (l) { return l.st === 'active' && l.p === 'haven' && l.se; }).length;
      if (n > maxSimPrimSeasoned) maxSimPrimSeasoned = n;
      if (polityBarDay === null && n >= 3) polityBarDay = sn.d;
    }
    const firstRegional = (rec.series || []).find(function (sn) { return sn.scale === 'regional' || sn.scale === 'national' || sn.scale === 'global'; });
    const firstNational = (rec.series || []).find(function (sn) { return sn.scale === 'national' || sn.scale === 'global'; });
    const nationalEver = !!firstNational;
    const nationalHeldDays = (rec.series || []).filter(function (sn) { return sn.scale === 'national' || sn.scale === 'global'; }).length;
    const heldDays = (rec.series || []).filter(function (sn) { return (sn.dip | 0) > 0; }).length;
    const everCounted = links.some(function (l) { return l.countedDay !== null; });
    // answerNationalChoice calls per staged shape (driver records shape).
    const natAns = { lead: 0, conquest: 0, belong: 0, covenant: 0, trade: 0, unknown: 0, sat: 0, diedAloud: 0, total: 0 };
    for (const ev of (rec.verbEvents || [])) {
      if (ev.verb !== 'answerNationalChoice') continue;
      natAns.total += 1;
      if (ev.shape && natAns[ev.shape] !== undefined) natAns[ev.shape] += 1;
      else natAns.unknown += 1;
      if (ev.result === 'sat') natAns.sat += 1;
      else if (ev.result === 'died-aloud') natAns.diedAloud += 1;
    }
    const globalAns = (rec.verbEvents || []).filter(function (ev) { return ev.verb === 'answerGlobalChoice'; }).length;
    // Starvation deaths: recorded cause names starvation/hunger.
    const starvationDeaths = (rec.deaths || []).filter(function (d) { return /starv|hunger/i.test(String((d.cause || '') + ' ' + (d.kind || ''))); }).length;
    const pendingNationalDays = (rec.capSummary && rec.capSummary.answercourt) ? (rec.capSummary.answercourt.pendingNationalDays | 0)
      : ((rec.capSummary || {}).nationalPendingDays | 0);
    const globalPendingDays = (rec.capSummary && rec.capSummary.answercourt) ? (rec.capSummary.answercourt.globalPendingDays | 0) : 0;
    const sc = (rec.capSummary || {});
    const waveKills = rec.waveKills || {};
    const summary = {
      seed: rec.seed, policy: rec.policy, days: rec.days,
      endReason: rec.endReason, won: !!rec.won, scaleRank: rec.scaleRank,
      maxWave: rec.maxWave, standing: rec.standing, standingRaw: rec.standingRaw,
      dipEnd: at.endDip, dipAttributed: at.attributedDip, dipUnattributed: at.unattributed,
      dipUnattributedUp: at.unattributedUp, dipUnattributedDown: at.unattributedDown,
      dipTelescopeGap: at.telescopeGap, dipTotalUp: at.totalUp, dipTotalDown: at.totalDown,
      nationalEver: nationalEver, firstNationalDay: firstNational ? firstNational.d : null,
      nationalHeldDays: nationalHeldDays, heldDays: heldDays, everCounted: everCounted,
      nationalAnswers: natAns, globalAnswers: globalAns,
      pendingNationalDays: pendingNationalDays, globalPendingDays: globalPendingDays,
      starvationDeaths: starvationDeaths, totalDeaths: (rec.deaths || []).length,
      linksFormed: formed, linksSeasoned: seasoned, linksCounted: counted,
      linksBroke: broke, linksUnclassified: unclassified,
      maxSimSeasoned: maxSimSeasoned,
      tendPolicy: tendPol, tendEngine: tendEng, tendRefused: tendRefused,
      maxSimPrimSeasoned: maxSimPrimSeasoned, polityBarDay: polityBarDay,
      firstRegionalDay: firstRegional ? firstRegional.d : null,
      firstNationalDay: firstNational ? firstNational.d : null,
      counterAnswers: ((at.verbs['answerCounter:policy'] || {}).calls | 0) + ((at.verbs['answerCounter:engine'] || {}).calls | 0),
      proposeAccepted: sc.proposeAccepted | 0, proposeCounter: sc.proposeCounter | 0,
      proposeDeclined: sc.proposeDeclined | 0, proposeShut: sc.proposeShut | 0,
      proposeBlockedPantry: sc.proposeBlockedPantry | 0, proposeBlockedCap: sc.proposeBlockedCap | 0,
      proposeBlockedPending: sc.proposeBlockedPending | 0, proposeNotReady: sc.proposeNotReady | 0,
      // COURTSHIP-REWORK (sim-courtship-b metric review #7): the
      // courtship driver's capSummary nests the covenant counters
      // under .covenant, so the top-level tendsPaidKcal reads 0 on
      // the courtship leg while the driver paid 43,500 kcal / 29
      // tends. Fall back to the nested covenant figure.
      tendsPaidKcal: (sc.tendsPaidKcal | 0) || ((sc.covenant && sc.covenant.tendsPaidKcal) | 0), waveKills: waveKills,
      accordAnswers: ((at.verbs['answerAccord:policy'] || {}).calls | 0) + ((at.verbs['answerAccord:engine'] || {}).calls | 0),
      proposeCalls: ((at.verbs['proposeLink:policy'] || {}).calls | 0) + ((at.verbs['proposeLink:engine'] || {}).calls | 0),
      proposeFormed: at.formations.filter(function (f) { return f.via === 'proposeLink'; }).length,
      feasts: (rec.ctxCounters || {}).feasts || (rec.ctxCounters || {}).fsFeasts || 0,
      devotionChannels: (rec.ctxCounters || {}).devotionChannels | 0,
      villagerCombatDeaths: rec.villagerCombatDeaths | 0,
      errors: (rec.instrumentErrors || []).length,
      formations: at.formations,
      linksDetail: links,
      polityDays: at.polityDays,
      dipSteps: at.dipSteps, dipDownSteps: at.dipDownSteps,
      verbs: at.verbs,
      seriesDipEnd: last.dip | 0, seriesDipDay: last.d | 0,
    };
    perSeed[rec.seed + '-' + rec.policy] = summary;
    if (!byPolicy[rec.policy]) byPolicy[rec.policy] = [];
    byPolicy[rec.policy].push(summary);
  }
  const agg = {};
  for (const pol of Object.keys(byPolicy)) {
    const ss = byPolicy[pol];
    agg[pol] = {
      n: ss.length,
      wins: ss.filter(function (s) { return s.won; }).length,
      national: ss.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
      table: ss.filter(function (s) { return (s.seatTakes === undefined ? false : false) || s.won; }).length,
      medianDays: med(ss.map(function (s) { return s.days; })),
      medianDipEnd: med(ss.map(function (s) { return s.dipEnd; })),
      medianLinksFormed: med(ss.map(function (s) { return s.linksFormed; })),
      medianLinksSeasoned: med(ss.map(function (s) { return s.linksSeasoned; })),
      medianLinksCounted: med(ss.map(function (s) { return s.linksCounted; })),
      medianMaxSimSeasoned: med(ss.map(function (s) { return s.maxSimSeasoned; })),
      totalTendPolicy: ss.reduce(function (t, s) { return t + s.tendPolicy; }, 0),
      totalTendEngine: ss.reduce(function (t, s) { return t + s.tendEngine; }, 0),
      totalTendRefused: ss.reduce(function (t, s) { return t + s.tendRefused; }, 0),
      totalAccord: ss.reduce(function (t, s) { return t + s.accordAnswers; }, 0),
      totalPropose: ss.reduce(function (t, s) { return t + s.proposeCalls; }, 0),
      totalBroke: ss.reduce(function (t, s) { return t + s.linksBroke; }, 0),
      totalUnclassified: ss.reduce(function (t, s) { return t + s.linksUnclassified; }, 0),
      dipPositiveSeeds: ss.filter(function (s) { return s.dipEnd > 0; }).length,
      polityBarSeeds: ss.filter(function (s) { return s.maxSimPrimSeasoned >= 3; }).length,
      medianMaxSimPrimSeasoned: med(ss.map(function (s) { return s.maxSimPrimSeasoned; })),
      medianFirstRegionalDay: med(ss.filter(function (s) { return s.firstRegionalDay !== null; }).map(function (s) { return s.firstRegionalDay; })),
      totalVillagerCombatDeaths: ss.reduce(function (t, s) { return t + (s.villagerCombatDeaths | 0); }, 0),
      totalCounterAnswers: ss.reduce(function (t, s) { return t + s.counterAnswers; }, 0),
      totalProposeAccepted: ss.reduce(function (t, s) { return t + s.proposeAccepted; }, 0),
      totalProposeCounter: ss.reduce(function (t, s) { return t + s.proposeCounter; }, 0),
      totalProposeDeclined: ss.reduce(function (t, s) { return t + s.proposeDeclined; }, 0),
      totalDipUnattributed: ss.reduce(function (t, s) { return t + s.dipUnattributed; }, 0),
      totalDipUnattributedUp: ss.reduce(function (t, s) { return t + (s.dipUnattributedUp | 0); }, 0),
      totalDipUnattributedDown: ss.reduce(function (t, s) { return t + (s.dipUnattributedDown | 0); }, 0),
      totalDipTelescopeGap: ss.reduce(function (t, s) { return t + (s.dipTelescopeGap | 0); }, 0),
      nationalEver: ss.filter(function (s) { return s.nationalEver; }).length,
      medianHeldDays: med(ss.map(function (s) { return s.heldDays; })),
      medianNationalHeldDays: med(ss.map(function (s) { return s.nationalHeldDays; })),
      everCounted: ss.filter(function (s) { return s.everCounted; }).length,
      totalNationalAnswers: ss.reduce(function (t, s) { return t + ((s.nationalAnswers || {}).total | 0); }, 0),
      nationalAnswersByShape: (function () { const o = { lead: 0, conquest: 0, belong: 0, covenant: 0, trade: 0, unknown: 0, sat: 0, diedAloud: 0 }; for (const s2 of ss) { const n = s2.nationalAnswers || {}; for (const k of Object.keys(o)) o[k] += (n[k] | 0); } return o; })(),
      totalGlobalAnswers: ss.reduce(function (t, s) { return t + (s.globalAnswers | 0); }, 0),
      totalPendingNationalDays: ss.reduce(function (t, s) { return t + (s.pendingNationalDays | 0); }, 0),
      totalGlobalPendingDays: ss.reduce(function (t, s) { return t + (s.globalPendingDays | 0); }, 0),
      totalStarvationDeaths: ss.reduce(function (t, s) { return t + (s.starvationDeaths | 0); }, 0),
      totalDeaths: ss.reduce(function (t, s) { return t + (s.totalDeaths | 0); }, 0),
      medianSurvivalDays: med(ss.map(function (s) { return s.days; })),
      totalErrors: ss.reduce(function (t, s) { return t + s.errors; }, 0),
      wave5unlocked: ss.filter(function (s) { return s.maxWave >= 5; }).length,
      wave4unlocked: ss.filter(function (s) { return s.maxWave >= 4; }).length,
    };
  }
  return { perSeed: perSeed, byPolicy: agg };
}

if (require.main === module) (async function () {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-14', 'perseed-answercourt-b');
  const files = fs.readdirSync(dir).filter(function (f) { return f.slice(-5) === '.json'; }).sort();
  const records = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const out = analyze(records);
  const outPath = path.join(REPO, 'evidence', '2026-11-14', 'answercourt-b-analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  for (const pol of Object.keys(out.byPolicy)) {
    console.log(pol + ': ' + JSON.stringify(out.byPolicy[pol]));
  }
  for (const k of Object.keys(out.perSeed).sort()) {
    const s = out.perSeed[k];
    console.log(k + ' days=' + s.days + ' end=' + s.endReason + ' won=' + s.won +
      ' dip=' + s.dipEnd + ' (unattr ' + s.dipUnattributed + ' up ' + s.dipUnattributedUp + '/down ' + s.dipUnattributedDown + ')' +
      ' links formed/seasoned/counted=' + s.linksFormed + '/' + s.linksSeasoned + '/' + s.linksCounted +
      ' broke=' + s.linksBroke + ' maxSimPrimSeasoned=' + s.maxSimPrimSeasoned +
      ' polityBarDay=' + s.polityBarDay + ' regionalDay=' + s.firstRegionalDay +
      ' nationalEver=' + s.nationalEver + ' natDay=' + s.firstNationalDay + ' natHeld=' + s.nationalHeldDays +
      ' heldDays=' + s.heldDays + ' natAns=' + JSON.stringify(s.nationalAnswers) +
      ' pendNatDays=' + s.pendingNationalDays + ' starv=' + s.starvationDeaths +
      ' tend pol/eng=' + s.tendPolicy + '/' + s.tendEngine + ' refused=' + s.tendRefused +
      ' accords=' + s.accordAnswers + ' propose=' + s.proposeCalls +
      ' acc/counter/decl=' + s.proposeAccepted + '/' + s.proposeCounter + '/' + s.proposeDeclined +
      ' counterAnswers=' + s.counterAnswers + ' deaths=' + s.villagerCombatDeaths +
      ' errors=' + s.errors);
  }
  console.log('wrote ' + path.relative(REPO, outPath));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { linkTrajectories: linkTrajectories, classifyLink: classifyLink, attribute: attribute, analyze: analyze };
