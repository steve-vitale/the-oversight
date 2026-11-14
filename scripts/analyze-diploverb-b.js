// analyze-diploverb-b.js — analyzer for the DIAG arm sim-diplo-verb-b
// (run fleshout-loop-b-20261114T1130Z). Reads the per-seed JSONs from
// scripts/diploverb-driver-20261114.js and produces:
//   - per-link trajectories + classification (seasoned-and-counted /
//     seasoned-but-no-polity / broke-<reason> / never-seasoned-<bar> /
//     still-young-at-end / UNCLASSIFIED)
//   - the verb attribution table (per verb: calls, trust deltas, links
//     moved 30->40, diplomacy points carried), split policy/engine
//   - per-seed + per-policy aggregates (wall numbers, polity days)
//   - diplomacy-point attribution: every +34 step on the capable leg
//     named to the link that became counted that day.
// Usage: node scripts/analyze-diploverb-b.js [perSeedDir]
//   writes evidence/2026-11-14/diploverb-b-analysis.json and prints a
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
    for (const e of es) {
      if (seasonedDay === null && e.seasoned) seasonedDay = e.d;
      if (countedDay === null && e.counted) countedDay = e.d;
    }
    if (seasonedDay !== null) {
      // the verb that carried it across 40 within ±1 day of the crossing
      for (const ev of evs) {
        if (ev.linkId !== id) continue;
        if ((ev.verb !== 'tendLink' && ev.verb !== 'answerAccord' &&
          ev.verb !== 'answerRenegotiation' && ev.verb !== 'answerDemand') ||
          ev.before === null || ev.after === null) continue;
        if (Math.abs(ev.day - seasonedDay) <= 1 && ev.before < 40 && ev.after >= 40) {
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
  // Diplomacy steps: each +34 in the daily dip series, attributed to the
  // link that became counted that day (±1 day tolerance).
  const dipSteps = [];
  let prevDip = 0;
  for (const sn of (rec.series || [])) {
    const dip = sn.dip | 0;
    if (dip > prevDip) {
      const gained = dip - prevDip;
      const newly = [];
      for (const l of links) {
        if (l.countedDay !== null && Math.abs(l.countedDay - sn.d) <= 1) newly.push(l.id);
      }
      dipSteps.push({ day: sn.d, gained: gained, links: newly, dip: dip });
    }
    prevDip = dip;
  }
  // Attribution completeness: total diplomacy at end vs attributed steps.
  const endDip = (rec.series.length ? (rec.series[rec.series.length - 1].dip | 0) : 0);
  const attributedDip = dipSteps.reduce(function (t, s) { return t + s.gained; }, 0);
  const unattributed = endDip - attributedDip;
  return {
    verbs: verbs, formations: formations, links: links,
    polityDays: polityDays, dipSteps: dipSteps,
    endDip: endDip, attributedDip: attributedDip, unattributed: unattributed,
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
    const summary = {
      seed: rec.seed, policy: rec.policy, days: rec.days,
      endReason: rec.endReason, won: !!rec.won, scaleRank: rec.scaleRank,
      maxWave: rec.maxWave, standing: rec.standing, standingRaw: rec.standingRaw,
      dipEnd: at.endDip, dipAttributed: at.attributedDip, dipUnattributed: at.unattributed,
      linksFormed: formed, linksSeasoned: seasoned, linksCounted: counted,
      linksBroke: broke, linksUnclassified: unclassified,
      maxSimSeasoned: maxSimSeasoned,
      tendPolicy: tendPol, tendEngine: tendEng, tendRefused: tendRefused,
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
      dipSteps: at.dipSteps,
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
      totalDipUnattributed: ss.reduce(function (t, s) { return t + s.dipUnattributed; }, 0),
      totalErrors: ss.reduce(function (t, s) { return t + s.errors; }, 0),
      wave5unlocked: ss.filter(function (s) { return s.maxWave >= 5; }).length,
      wave4unlocked: ss.filter(function (s) { return s.maxWave >= 4; }).length,
    };
  }
  return { perSeed: perSeed, byPolicy: agg };
}

if (require.main === module) (async function () {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-14', 'perseed-diploverb-b');
  const files = fs.readdirSync(dir).filter(function (f) { return f.slice(-5) === '.json'; }).sort();
  const records = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const out = analyze(records);
  const outPath = path.join(REPO, 'evidence', '2026-11-14', 'diploverb-b-analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  for (const pol of Object.keys(out.byPolicy)) {
    console.log(pol + ': ' + JSON.stringify(out.byPolicy[pol]));
  }
  for (const k of Object.keys(out.perSeed).sort()) {
    const s = out.perSeed[k];
    console.log(k + ' days=' + s.days + ' end=' + s.endReason + ' won=' + s.won +
      ' dip=' + s.dipEnd + ' (unattr ' + s.dipUnattributed + ')' +
      ' links formed/seasoned/counted=' + s.linksFormed + '/' + s.linksSeasoned + '/' + s.linksCounted +
      ' broke=' + s.linksBroke + ' maxSimSeasoned=' + s.maxSimSeasoned +
      ' tend pol/eng=' + s.tendPolicy + '/' + s.tendEngine + ' refused=' + s.tendRefused +
      ' accords=' + s.accordAnswers + ' propose=' + s.proposeCalls +
      ' errors=' + s.errors);
  }
  console.log('wrote ' + path.relative(REPO, outPath));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { linkTrajectories: linkTrajectories, classifyLink: classifyLink, attribute: attribute, analyze: analyze };
