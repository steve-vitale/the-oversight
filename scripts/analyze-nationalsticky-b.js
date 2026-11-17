// analyze-nationalsticky-b.js — analyzer, arm sim-nationalsticky-b
// (DIAG: is reached-national lost, and how? — findings #2452).
// Derives everything from the daily series + verbEvents in the
// per-seed corpora (perseed-nationalsticky-b-off / -on):
// reach / lapse / re-stage / held episodes, lapse cause from the
// lapse-day vs prior-day snapshots, lapse duration, re-stage time,
// days held, and the wall table per leg — plus the OFF-vs-ON drift
// check (daily-signature comparison over the full band).
// Usage: node scripts/analyze-nationalsticky-b.js
//   [--off evidence/2026-11-16/perseed-nationalsticky-b-off]
//   [--on evidence/2026-11-16/perseed-nationalsticky-b-on]
//   [--out evidence/2026-11-16/nationalsticky-b-analysis.json]
// The lapse-cause rule is FROZEN (prereg): trust-drift = a link
// seasoned on the prior day is unseasoned on the lapse day with
// trust <40 and still active; link-loss = a link active+seasoned on
// the prior day is no longer active on the lapse day; both = both on
// the same day; standing-fall = capped standing crossed below 200
// on the lapse day (a CO-OCCURRING condition, never the engine cause
// on its own — _havenPolity reads seasoned links only, never the
// standing total); unknown = no link cause explains the lapse
// (must be 0; any unknown lapse names the missing mechanism).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

function parseArgs(argv) {
  const out = { off: path.join(REPO, 'evidence', '2026-11-16', 'perseed-nationalsticky-b-off'),
    on: path.join(REPO, 'evidence', '2026-11-16', 'perseed-nationalsticky-b-on'),
    outFile: path.join(REPO, 'evidence', '2026-11-16', 'nationalsticky-b-analysis.json') };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--off') out.off = argv[++i];
    else if (argv[i] === '--on') out.on = argv[++i];
    else if (argv[i] === '--out') out.outFile = argv[++i];
  }
  return out;
}

function loadDir(dir) {
  const recs = [];
  if (!fs.existsSync(dir)) return recs;
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    recs.push({ file: f, rec: JSON.parse(raw) });
  }
  return recs;
}

// deriveLapseCause(prev, cur): the frozen cause rule, from the raw
// snapshot fields only. Returns { cause, driftLinks, lostLinks,
// standingFall, polityStillQualifies, notes }.
//   driftLinks: [{id, other, kind, trustBefore, trustLapse}]
//   lostLinks:  [{id, other, kind, trustBefore}]
function deriveLapseCause(prev, cur) {
  const out = { cause: 'unknown', driftLinks: [], lostLinks: [],
    standingFall: false, polityStillQualifies: false, notes: [] };
  if (!prev || !cur) { out.notes.push('missing snapshot'); return out; }
  const prevLinks = {};
  (prev.linksRoll || []).forEach(function (l) { if (l && l.id) prevLinks[l.id] = l; });
  const curLinks = {};
  (cur.linksRoll || []).forEach(function (l) { if (l && l.id) curLinks[l.id] = l; });
  Object.keys(prevLinks).forEach(function (id) {
    const pl = prevLinks[id];
    if (!pl || pl.st !== 'active' || !pl.se) return; // only seasoned active links can unseason the polity
    const cl = curLinks[id];
    if (!cl || cl.st !== 'active') {
      out.lostLinks.push({ id: id, other: pl.o, kind: pl.k, trustBefore: pl.t });
    } else if (!cl.se && (cl.t | 0) < 40) {
      out.driftLinks.push({ id: id, other: pl.o, kind: pl.k, trustBefore: pl.t, trustLapse: cl.t });
    } else if (!cl.se) {
      out.notes.push('link ' + id + ' unseasoned without trust<40 (age? conquered?) trust ' + pl.t + '->' + cl.t);
    }
  });
  if (prev.capped != null && cur.capped != null && (prev.capped | 0) >= 200 && (cur.capped | 0) < 200) {
    out.standingFall = true;
  }
  // Engine-agreement check: on the lapse day the engine's own
  // predicates must all read null (that is WHY _checkNational
  // dissolved the realm). A non-null candidate on the lapse day
  // contradicts the lapse and is an anomaly, never silently passed.
  const sc = cur.shapeCands || {};
  const anyCand = !!(sc.lead || sc.conquest || sc.belong || sc.covenant || sc.trade);
  if (anyCand || cur.havenPolity) out.polityStillQualifies = true;
  if (out.driftLinks.length && out.lostLinks.length) out.cause = 'both';
  else if (out.driftLinks.length) out.cause = 'trust-drift';
  else if (out.lostLinks.length) out.cause = 'link-loss';
  else out.cause = 'unknown';
  return out;
}

// classifySeed(rec): the nationalLive episode table for one seed,
// from the series + verbEvents. Returns { seed, policy, mode,
// reached, firstReachDay, episodes, lapses, daysHeld, heldToEnd,
// reStages, reachDaysFromSeries, reachDaysFromVerbs, verbMismatch,
// unknownLapses, errors }.
// An episode: { reachDay, lapseDay, cause, driftLinks, lostLinks,
// standingFall, polityStillQualifies, reStageDay, daysLapsed,
// censored } — lapseDay null when held to series end.
function classifySeed(rec) {
  const out = { seed: rec.seed, policy: rec.policy, mode: rec.mode,
    reached: false, firstReachDay: null, episodes: [], lapses: [],
    daysHeld: 0, heldToEnd: false, reStages: 0,
    reachDaysFromSeries: [], reachDaysFromVerbs: [], verbMismatch: [],
    unknownLapses: 0, errors: (rec.instrumentErrors || []).slice() };
  const series = rec.series || [];
  const verbs = rec.verbEvents || [];
  // Reach days from verbEvents: answerNationalChoice with result 'sat'.
  verbs.forEach(function (v) {
    if (v && v.verb === 'answerNationalChoice' && v.result === 'sat') out.reachDaysFromVerbs.push(v.day);
  });
  let prev = null;
  let open = null; // open episode { reachDay }
  series.forEach(function (sn) {
    if (sn.nationalLive) out.daysHeld++;
    if (prev) {
      if (!prev.nationalLive && sn.nationalLive) {
        out.reachDaysFromSeries.push(sn.d);
        if (!out.reached) { out.reached = true; out.firstReachDay = sn.d; }
        open = { reachDay: sn.d };
      } else if (prev.nationalLive && !sn.nationalLive) {
        // LAPSE on day sn.d.
        const cause = deriveLapseCause(prev, sn);
        const ep = { reachDay: open ? open.reachDay : null,
          lapseDay: sn.d, cause: cause.cause,
          driftLinks: cause.driftLinks, lostLinks: cause.lostLinks,
          standingFall: cause.standingFall,
          polityStillQualifies: cause.polityStillQualifies,
          notes: cause.notes,
          reStageDay: null, daysLapsed: null, censored: true };
        out.episodes.push(ep);
        out.lapses.push(ep);
        if (cause.cause === 'unknown') out.unknownLapses++;
        open = null;
      }
    }
    prev = sn;
  });
  // Close episodes: a re-stage is the NEXT reach after a lapse.
  out.reachDaysFromSeries.forEach(function (rd, i) {
    if (i === 0) return; // first reach opens the first episode
    // Find the most recent open (censored) lapse before this reach.
    for (let j = out.lapses.length - 1; j >= 0; j--) {
      const ep = out.lapses[j];
      if (ep.censored && ep.lapseDay < rd) {
        ep.reStageDay = rd;
        ep.daysLapsed = rd - ep.lapseDay;
        ep.censored = false;
        out.reStages++;
        break;
      }
    }
  });
  // Censored lapse durations (never re-staged by series end).
  const endDay = series.length ? series[series.length - 1].d : null;
  out.lapses.forEach(function (ep) {
    if (ep.censored && endDay != null) ep.daysLapsed = endDay - ep.lapseDay;
  });
  if (series.length && series[series.length - 1].nationalLive) out.heldToEnd = true;
  // D3 cross-check: reach days from the series must equal reach days
  // from the verbEvents (same set, same order).
  const a = out.reachDaysFromSeries.slice().sort(function (x, y) { return x - y; });
  const b = out.reachDaysFromVerbs.slice().sort(function (x, y) { return x - y; });
  if (a.length !== b.length || a.some(function (v, i) { return v !== b[i]; })) {
    out.verbMismatch.push({ series: a, verbs: b });
  }
  return out;
}

function dailySignature(rec) {
  return (rec.series || []).map(function (sn) {
    return [sn.d, sn.nationalLive ? 1 : 0, sn.scale, sn.stRaw | 0,
      sn.pop | 0, JSON.stringify(sn.wk || {})].join('|');
  });
}

function wallFor(recs) {
  const n = recs.length;
  let standingGated = 0, standingRaw = 0, nationalRank = 0, nationalEver = 0;
  let table = 0, wins = 0, wave4 = 0, wave5 = 0, w4kills = 0, deaths = 0, survived = 0;
  const survivals = [];
  recs.forEach(function (r) {
    const rec = r.rec;
    if ((rec.standing | 0) >= 200) standingGated++;
    if ((rec.standingRaw | 0) >= 200) standingRaw++;
    if (rec.scaleRank === 'national' || rec.scaleRank === 'global') nationalRank++;
    const cls = classifySeed(rec);
    if (cls.reached) nationalEver++;
    const ts = rec.tableState || {};
    if (ts.final || rec.won) table++;
    if (rec.won) wins++;
    if ((rec.maxWave | 0) >= 4) wave4++;
    if ((rec.maxWave | 0) >= 5) wave5++;
    w4kills += rec.w4kills | 0;
    deaths += (rec.deaths || []).length;
    if (!rec.villageLost) survived++;
    survivals.push(rec.gameDays | 0);
  });
  survivals.sort(function (x, y) { return x - y; });
  const median = n ? survivals[Math.floor(n / 2)] : null;
  return { n: n, standingGated200: standingGated, standingRaw200: standingRaw,
    scaleRankNational: nationalRank, nationalEver: nationalEver,
    table: table, wins: wins, wave4ever: wave4, wave5ever: wave5,
    wave4kills: w4kills, deaths: deaths, survived: survived,
    medianSurvival: median, maxSurvival: n ? survivals[n - 1] : null };
}

function main() {
  const args = parseArgs(process.argv);
  const offRecs = loadDir(args.off);
  const onRecs = loadDir(args.on);
  const analysis = { arm: 'nationalsticky-b', generated: new Date().toISOString(),
    offDir: args.off, onDir: args.on,
    off: { files: offRecs.length, seeds: [] },
    on: { files: onRecs.length, seeds: [] },
    drift: { divergences: 0, perSeed: [] },
    wall: { off: null, on: null },
    totals: { reached: 0, lost: 0, held: 0, lapses: 0, unknownLapses: 0,
      verbMismatches: 0, instrumentErrors: 0 } };
  // Per-seed classification (ON leg is judged; OFF leg classified too
  // so the drift check and the wall table cover both).
  [ ['off', offRecs], ['on', onRecs] ].forEach(function (pair) {
    const leg = pair[0], recs = pair[1];
    recs.forEach(function (r) {
      const cls = classifySeed(r.rec);
      analysis[leg].seeds.push(cls);
      analysis.totals.instrumentErrors += (r.rec.instrumentErrors || []).length;
      if (leg === 'on') {
        if (cls.reached) analysis.totals.reached++;
        if (cls.lapses.length) analysis.totals.lost++;
        if (cls.heldToEnd) analysis.totals.held++;
        analysis.totals.lapses += cls.lapses.length;
        analysis.totals.unknownLapses += cls.unknownLapses;
        analysis.totals.verbMismatches += cls.verbMismatch.length;
      }
    });
  });
  // OFF-vs-ON drift: daily-signature comparison per seed.
  const onBySeed = {};
  onRecs.forEach(function (r) { onBySeed[r.rec.seed] = r.rec; });
  offRecs.forEach(function (r) {
    const on = onBySeed[r.rec.seed];
    if (!on) { analysis.drift.perSeed.push({ seed: r.rec.seed, status: 'no-on-leg' }); return; }
    const a = dailySignature(r.rec), b = dailySignature(on);
    let div = 0;
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) if (a[i] !== b[i]) div++;
    analysis.drift.perSeed.push({ seed: r.rec.seed, status: div === 0 ? 'identical' : 'DIVERGED',
      divergences: div, offDays: a.length, onDays: b.length });
    analysis.drift.divergences += div;
  });
  analysis.wall.off = wallFor(offRecs);
  analysis.wall.on = wallFor(onRecs);
  fs.mkdirSync(path.dirname(args.outFile), { recursive: true });
  fs.writeFileSync(args.outFile, JSON.stringify(analysis, null, 2) + '\n');
  console.log(JSON.stringify({
    offFiles: offRecs.length, onFiles: onRecs.length,
    reachedOn: analysis.totals.reached, lostOn: analysis.totals.lost,
    heldOn: analysis.totals.held, lapsesOn: analysis.totals.lapses,
    unknownLapses: analysis.totals.unknownLapses,
    verbMismatches: analysis.totals.verbMismatches,
    instrumentErrors: analysis.totals.instrumentErrors,
    driftDivergences: analysis.drift.divergences,
    wallOff: analysis.wall.off, wallOn: analysis.wall.on,
    out: path.relative(REPO, args.outFile),
  }, null, 2));
  return analysis;
}

if (require.main === module) main();

module.exports = { deriveLapseCause: deriveLapseCause, classifySeed: classifySeed,
  dailySignature: dailySignature, wallFor: wallFor, loadDir: loadDir, main: main };
