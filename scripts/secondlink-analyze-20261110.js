// secondlink-analyze-20261110.js — second-link road recorder analyzer
// (arm sim-secondlink-a). Reads the ON-leg per-seed JSONs (+ OFF-leg
// for neutrality) in evidence/2026-11-10/perseed-secondlink-a/ and
// classifies every candidate village's link-raise lifecycle by rule.
//
// Classification (per candidate village, per seed):
//   raised          — a link formed via an accepted link raise.
//   staged-and-lost — >=1 raise staged, no link ever formed (fate of
//                     the last staging reported).
//   never-staged    — known to someone while unlinked, but no raise
//                     ever staged (dominant blocking gate named).
//   unknown         — never known to the scholar or any villager.
// A "second raise" is any link-kind staging whose target differs
// from the village's first-formed link, or any staging after the
// first link formed (both definitions computed; they agree unless
// a raise for the first-link village re-stages after a break).
// Usage:
//   RUN=secondlink-pilot node scripts/secondlink-analyze-20261110.js
// Writes evidence/2026-11-10/secondlink-summary-<RUN>.json and
// prints the band report.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const RUN = process.env.RUN || 'secondlink-pilot';
const DIR = path.join(REPO, 'evidence', '2026-11-10', 'perseed-secondlink-a');

const TRUSTGROWTH_DAYS = { 99101: 132, 99102: 58, 99103: 132, 99104: 150, 99105: 109, 99106: 87, 99107: 150, 99108: 62 };
const TRUSTGROWTH_STANDING = { 99101: 270, 99102: 199, 99103: 199, 99104: 199, 99105: 150, 99106: 199, 99107: 199, 99108: 25 };

function load(mode) {
  const out = {};
  fs.readdirSync(DIR).filter(function (f) { return f.indexOf('-' + RUN + '-' + mode + '.json') !== -1; }).forEach(function (f) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    out[j.seed] = j;
  });
  return out;
}
function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}
function bondKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }

function analyzeSeed(j) {
  const days = j.daily || [];
  const evs = (j.bondEvents || []).filter(function (e) { return e.kind === 'link'; });
  const r = {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    won: j.won, scaleRank: j.scaleRank, maxWave: j.maxWave, standing: j.standing,
    instrumentErrors: (j.instrumentErrors || []).length,
    firstLink: null, linkEvents: evs.length,
    stageCalls: (j.stageCalls || []).length, stageCallsStaged: (j.stageCalls || []).filter(function (c) { return c.staged; }).length,
    stagedTele: evs.filter(function (e) { return e.outcome === 'staged'; }).length,
    acceptedTele: evs.filter(function (e) { return e.outcome === 'accepted'; }).length,
    refusedTele: evs.filter(function (e) { return e.outcome === 'refused'; }).length,
    expiredTele: evs.filter(function (e) { return e.outcome === 'expired'; }).length,
    linkTickCalls: j.linkTickCalls || 0,
    villages: {}, stagings: [], reconcile: { ok: 0, bad: [] },
    census: { snapDays: days.length, eligibleRaiserDays: 0, gateDays: {}, lotteryPassEligible: 0, lotteryFailEligible: 0, eligibleRaiserDayList: [] },
  };
  // First link formation: earliest snapshot with a link.
  for (let i = 0; i < days.length; i++) {
    const ls = days[i].links || [];
    if (ls.length) {
      const l = ls[0];
      r.firstLink = { day: days[i].day, other: l.other, kind: l.kind, primary: l.primary, subordinate: l.subordinate };
      break;
    }
  }
  // Candidate villages: union of lore (scholar + raisers) and staging
  // targets. The otherVillages ROLL is the region registry — the game
  // knows those villages, the PEOPLE may not — so the roll alone does
  // not make a village "known" (prereg: unknown = never known to the
  // scholar or any villager).
  const known = {}; // villageId -> {firstKnownDay, name}
  days.forEach(function (s) {
    const nameOf = function (id) {
      const v = (s.villages || []).filter(function (vv) { return vv.id === id; })[0];
      return v ? (v.name || null) : null;
    };
    (s.scholarLore || []).forEach(function (id) { if (!known[id]) known[id] = { firstKnownDay: s.day, name: nameOf(id) }; });
    (s.raisers || []).forEach(function (rv) { (rv.lore || []).forEach(function (id) { if (!known[id]) known[id] = { firstKnownDay: s.day, name: nameOf(id) }; }); });
  });
  Object.keys(known).forEach(function (id) {
    r.villages[id] = { id: id, name: known[id].name, firstKnownDay: known[id].firstKnownDay, class: 'unknown', stagings: 0, fates: [], dominantGate: null, gateCounts: {} };
  });
  // Gate census + lottery.
  days.forEach(function (s) {
    const elig = s.eligibleRaisers || 0;
    if (elig > 0) {
      r.census.eligibleRaiserDays++;
      r.census.eligibleRaiserDayList.push(s.day);
      if (s.linkTickRoll != null) {
        if (s.linkTickRoll < 0.5) r.census.lotteryPassEligible++;
        else r.census.lotteryFailEligible++;
      }
    }
    (s.raisers || []).forEach(function (rv) {
      if (rv.isScholar || !rv.alive) return;
      (rv.gates || []).forEach(function (g) {
        r.census.gateDays[g] = (r.census.gateDays[g] || 0) + 1;
      });
    });
  });
  // Staging lifecycle: pair each staged event with its fate.
  const staged = evs.filter(function (e) { return e.outcome === 'staged'; });
  const decisions = evs.filter(function (e) { return e.outcome === 'accepted' || e.outcome === 'refused' || e.outcome === 'expired'; });
  staged.forEach(function (st) {
    const fate = { vid: st.initiator, villageId: st.target, day: st.day, fate: 'pending-at-end', proposeOutcome: null, linkFormedAfter: false };
    // Decision event for the same (initiator, target), day >= staged day.
    const dec = decisions.filter(function (d) { return d.initiator === st.initiator && d.target === st.target && d.day >= st.day; })
      .sort(function (a, b) { return a.day - b.day; })[0];
    if (dec) {
      if (dec.outcome === 'accepted') {
        // proposeLink call same day (acceptLinkRaise calls it synchronously).
        const pc = (j.proposeCalls || []).filter(function (p) { return p.villageId === st.target && p.day >= dec.day && p.day <= dec.day + 1; })[0];
        fate.fate = 'accepted';
        fate.proposeOutcome = pc ? pc.outcome : 'no-propose-call';
        if (pc && pc.outcome === 'formed') fate.fate = 'accepted->formed';
        else if (pc && pc.outcome === 'counter') fate.fate = 'accepted->counter';
        else if (pc) fate.fate = 'accepted->propose-declined';
        else fate.fate = 'accepted->no-propose-call';
      } else fate.fate = dec.outcome; // refused | expired
      fate.decisionDay = dec.day;
    }
    // Did a link for this village appear after the staging?
    const after = days.filter(function (s) { return s.day >= st.day; }).some(function (s) {
      return (s.links || []).some(function (l) { return l.other === st.target; });
    });
    fate.linkFormedAfter = after;
    r.stagings.push(fate);
    if (!r.villages[st.target]) r.villages[st.target] = { id: st.target, name: null, firstKnownDay: st.day, class: 'unknown', stagings: 0, fates: [], dominantGate: null, gateCounts: {} };
    r.villages[st.target].stagings++;
    r.villages[st.target].fates.push(fate.fate);
  });
  // Reconciliation: staged tele event vs snapshot pending / decision chain.
  staged.forEach(function (st) {
    const seenPending = days.some(function (s) {
      return (s.pendingRaises || []).some(function (p) { return p.vid === st.initiator && p.villageId === st.target && p.day === st.day; });
    });
    const decided = decisions.some(function (d) { return d.initiator === st.initiator && d.target === st.target && d.day >= st.day && d.day <= st.day + 3; });
    const formedFast = days.some(function (s) {
      return s.day >= st.day && s.day <= st.day + 3 && (s.links || []).some(function (l) { return l.other === st.target; });
    });
    if (seenPending || decided || formedFast) r.reconcile.ok++;
    else r.reconcile.bad.push({ vid: st.initiator, villageId: st.target, day: st.day });
  });
  // Per-village classification.
  Object.keys(r.villages).forEach(function (id) {
    const v = r.villages[id];
    const formed = (r.firstLink && r.firstLink.other === id) || days.some(function (s) { return (s.links || []).some(function (l) { return l.other === id; }); });
    const raised = r.stagings.some(function (f) { return f.villageId === id && f.fate === 'accepted->formed'; });
    // linkFormed is a LINK fact, the class is a RAISE fact: the band's
    // first link forms via the meta-progression ladder reward
    // (_ladderRewardLink), not via any raise — so a first-link village
    // can hold a link AND have every raise lost. Both are reported.
    v.linkFormed = formed;
    v.formedViaRaise = raised;
    if (raised) v.class = 'raised';
    else if (v.stagings > 0) v.class = 'staged-and-lost';
    else {
      // Known while unlinked? (in scholar/raiser LORE while not linked —
      // the roll alone does not count as known; see the known map above)
      const knownWhileUnlinked = days.some(function (s) {
        const unlinkedNow = !(s.links || []).some(function (l) { return l.other === id; });
        if (!unlinkedNow) return false;
        return (s.scholarLore || []).indexOf(id) !== -1 ||
          (s.raisers || []).some(function (rv) { return (rv.lore || []).indexOf(id) !== -1; });
      });
      if (!knownWhileUnlinked) v.class = 'unknown';
      else {
        v.class = 'never-staged';
        // Dominant blocking gate: count gate occurrences on days this
        // village was known-unlinked. Prefer raiser-days where the
        // raiser KNOWS the village (their gates are the live blockers);
        // if no raiser ever knew it, count all raiser-days instead —
        // the dominant gate is then honestly 'no-lore'.
        const countsKnower = {};
        const countsAll = {};
        days.forEach(function (s) {
          const knownNow = (s.scholarLore || []).indexOf(id) !== -1 ||
            (s.raisers || []).some(function (rv) { return (rv.lore || []).indexOf(id) !== -1; });
          if (!knownNow) return;
          // Gate days count only while the village is still UNLINKED:
          // after a link forms, 'all-known-linked' is trivially true and
          // would swamp the real pre-link blockers.
          const unlinkedNow = !(s.links || []).some(function (l) { return l.other === id; });
          if (!unlinkedNow) return;
          (s.raisers || []).forEach(function (rv) {
            if (rv.isScholar || !rv.alive) return;
            (rv.gates || []).forEach(function (g) { countsAll[g] = (countsAll[g] || 0) + 1; });
            if ((rv.lore || []).indexOf(id) === -1) return;
            (rv.gates || []).forEach(function (g) { countsKnower[g] = (countsKnower[g] || 0) + 1; });
          });
        });
        const counts = Object.keys(countsKnower).length ? countsKnower : countsAll;
        v.gateCounts = counts;
        let best = null, bestN = 0;
        Object.keys(counts).forEach(function (g) { if (counts[g] > bestN) { bestN = counts[g]; best = g; } });
        v.dominantGate = best;
      }
    }
    // Second-raise flag per staging.
    r.stagings.forEach(function (f) {
      f.isSecond = (r.firstLink && f.villageId !== r.firstLink.other) || (r.firstLink && f.day > r.firstLink.day);
    });
  });
  r.secondStagings = r.stagings.filter(function (f) { return f.isSecond; });
  r.seasonedLinks = days.reduce(function (mx, s) {
    return Math.max(mx, (s.links || []).filter(function (l) { return l.seasoned; }).length);
  }, 0);
  r.polityEver = days.some(function (s) { return !!s.polity; });
  return r;
}

function main() {
  const on = load('on');
  const off = load('off');
  const seeds = Object.keys(on).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) { console.error('SECONDLINK ANALYZE STOP: no ON-leg files for run ' + RUN); process.exit(2); }
  const perSeed = seeds.map(function (s) { return analyzeSeed(on[s]); });
  const band = {
    run: RUN, seeds: seeds,
    linksFormed: perSeed.filter(function (s) { return !!s.firstLink; }).length,
    villagesClassified: {},
    stagingsTotal: 0, secondStagingsTotal: 0,
    fateCounts: {}, secondFateCounts: {},
    reconcileOk: 0, reconcileBad: [],
    instrumentErrors: 0,
    wall: {
      wins: perSeed.filter(function (s) { return s.won; }).length,
      national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
      table: perSeed.filter(function (s) { return s.won; }).length,
      wave4unlocks: perSeed.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5unlocks: perSeed.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
      medianSurvival: median(perSeed.map(function (s) { return s.days; })),
      survivors: perSeed.filter(function (s) { return s.endReason === 'horizon'; }).length,
      seasonedLinksMax: Math.max.apply(null, perSeed.map(function (s) { return s.seasonedLinks; })),
      polityEver: perSeed.filter(function (s) { return s.polityEver; }).length,
    },
    neutrality: { offDaysMatch: [], offStandingMatch: [], onVsOffDaysExact: 0, onVsOffStandingExact: 0 },
  };
  perSeed.forEach(function (s) {
    band.instrumentErrors += s.instrumentErrors;
    band.stagingsTotal += s.stagings.length;
    band.secondStagingsTotal += s.secondStagings.length;
    band.reconcileOk += s.reconcile.ok;
    band.reconcileBad = band.reconcileBad.concat(s.reconcile.bad.map(function (b) { return Object.assign({ seed: s.seed }, b); }));
    s.stagings.forEach(function (f) { band.fateCounts[f.fate] = (band.fateCounts[f.fate] || 0) + 1; });
    s.secondStagings.forEach(function (f) { band.secondFateCounts[f.fate] = (band.secondFateCounts[f.fate] || 0) + 1; });
    Object.keys(s.villages).forEach(function (id) {
      const c = s.villages[id].class;
      band.villagesClassified[c] = (band.villagesClassified[c] || 0) + 1;
    });
    // Neutrality vs trustgrowth corpus (OFF leg) and ON vs OFF.
    const o = off[s.seed];
    if (o) {
      band.neutrality.offDaysMatch.push({ seed: s.seed, offDays: o.days, trustgrowthDays: TRUSTGROWTH_DAYS[s.seed], match: o.days === TRUSTGROWTH_DAYS[s.seed] });
      band.neutrality.offStandingMatch.push({ seed: s.seed, offStanding: o.standing, trustgrowthStanding: TRUSTGROWTH_STANDING[s.seed], match: o.standing === TRUSTGROWTH_STANDING[s.seed] });
      if (on[s.seed].days === o.days) band.neutrality.onVsOffDaysExact++;
      if (on[s.seed].standing === o.standing) band.neutrality.onVsOffStandingExact++;
    }
  });
  band.neutrality.offWins = seeds.filter(function (s) { return off[s] && off[s].won; }).length;
  band.neutrality.offNational = seeds.filter(function (s) { return off[s] && (off[s].scaleRank === 'national' || off[s].scaleRank === 'global'); }).length;

  const outFile = path.join(REPO, 'evidence', '2026-11-10', 'secondlink-summary-' + RUN + '.json');
  fs.writeFileSync(outFile, JSON.stringify({ band: band, perSeed: perSeed }, null, 2) + '\n');

  console.log('SECONDLINK BAND run=' + RUN + ' seeds=' + seeds.join(','));
  perSeed.forEach(function (s) {
    const vcls = Object.keys(s.villages).map(function (id) { return id + ':' + s.villages[id].class + (s.villages[id].linkFormed ? '[LINK]' : '') + (s.villages[id].stagings ? '(' + s.villages[id].stagings + ' staged:' + s.villages[id].fates.join(',') + ')' : '') + (s.villages[id].dominantGate ? '[gate:' + s.villages[id].dominantGate + ']' : ''); }).join(' ');
    console.log(' seed ' + s.seed + ' days=' + s.days + ' end=' + s.endReason + ' scale=' + s.scaleRank + ' wave=' + s.maxWave + ' standing=' + s.standing +
      ' firstLink=' + (s.firstLink ? s.firstLink.other + '@d' + s.firstLink.day : 'none') +
      ' stagings=' + s.stagings.length + ' second=' + s.secondStagings.length +
      ' eligRaiserDays=' + s.census.eligibleRaiserDays + ' lotteryPass=' + s.census.lotteryPassEligible + '/' + (s.census.lotteryPassEligible + s.census.lotteryFailEligible) +
      ' reconcile=' + s.reconcile.ok + '/' + (s.reconcile.ok + s.reconcile.bad.length) + ' err=' + s.instrumentErrors);
    console.log('   villages: ' + (vcls || '(none known)'));
    console.log('   gates: ' + JSON.stringify(s.census.gateDays));
  });
  console.log('BAND villages=' + JSON.stringify(band.villagesClassified) + ' stagings=' + band.stagingsTotal + ' second=' + band.secondStagingsTotal + ' fates=' + JSON.stringify(band.fateCounts) + ' secondFates=' + JSON.stringify(band.secondFateCounts));
  console.log('RECONCILE ok=' + band.reconcileOk + ' bad=' + band.reconcileBad.length + ' ' + JSON.stringify(band.reconcileBad));
  console.log('WALL wins=' + band.wall.wins + '/' + seeds.length + ' national=' + band.wall.national + ' table=' + band.wall.table + ' w4=' + band.wall.wave4unlocks + ' w5=' + band.wall.wave5unlocks + ' median=' + band.wall.medianSurvival + ' seasonedMax=' + band.wall.seasonedLinksMax + ' polityEver=' + band.wall.polityEver + ' err=' + band.instrumentErrors);
  console.log('NEUTRALITY offDaysMatch=' + band.neutrality.offDaysMatch.filter(function (m) { return m.match; }).length + '/' + band.neutrality.offDaysMatch.length +
    ' offStandingMatch=' + band.neutrality.offStandingMatch.filter(function (m) { return m.match; }).length + '/' + band.neutrality.offStandingMatch.length +
    ' offWins=' + band.neutrality.offWins + ' offNational=' + band.neutrality.offNational +
    ' onVsOffDays=' + band.neutrality.onVsOffDaysExact + '/' + seeds.length + ' onVsOffStanding=' + band.neutrality.onVsOffStandingExact + '/' + seeds.length);
  console.log('WROTE ' + path.relative(REPO, outFile));
}

if (require.main === module) main();

module.exports = { analyzeSeed: analyzeSeed, bondKey: bondKey, median: median, load: load };
