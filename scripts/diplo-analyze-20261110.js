// diplo-analyze-20261110.js — diplomacy first-numbers analyzer
// (arm sim-diplo-a, run fleshout-20261110T1815Z). Reads the per-seed JSONs
// in evidence/2026-11-10/perseed-diplo-a/ (control + armed + neutral legs)
// and produces per-seed + pooled first numbers.
//
// Reuses scripts/secondlink-analyze-20261110.js analyzeSeed (link-raise
// lifecycle, village classification, reconciliation of kind 'link' tele
// events) unchanged, then adds the diplo layer: formation provenance
// (_formLink/_formPeerLink call stacks), diplomacy verb calls, person-bond
// proposals (tele kind 'person': NPC→scholar staged flavor + NPC↔NPC
// immediate character decisions), foreign polities, polity/national/global
// first days, talk counts, and the neutrality check (neutral leg vs
// instrumented control leg: days + standing exact).
//
// Reconciliation (GO bar 2): every bond_proposed tele event must reconcile:
//   kind 'link' — via analyzeSeed (staged event matches a snapshot
//     transition or a decision within 3 days).
//   kind 'person', staged — a decision event (accepted/refused/expired)
//     for the same INITIATOR within 3 days whose target is the scholar
//     ON THE DECISION DAY, or pending-at-end (staged within 2 days of
//     the last snapshot day). TARGET-EQUALITY IS WRONG for person bonds:
//     the staged event names whoever was scholar at staging time, and
//     the decision/expiry names whoever is scholar at decision time —
//     succession between staging and decision changes the id (proven
//     on the diplo pilot: 4 control cases, all expired to a successor
//     scholar 3 days later). NPC↔NPC decisions never target the scholar,
//     so scholar-targeted-ness (from the daily scholarId) separates the
//     two flavors exactly.
//   kind 'person', immediate decision (accepted/refused/gate outcome with
//     no preceding staged event for the initiator, target not the scholar)
//     — self-reconciling: the event IS the decision record.
// Usage:
//   RUN=diplo-pilot node scripts/diplo-analyze-20261110.js
// Writes evidence/2026-11-10/diplo-summary-<RUN>.json and prints the band report.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const SL = require(path.join(REPO, 'scripts', 'secondlink-analyze-20261110'));
const RUN = process.env.RUN || 'diplo-pilot';
const DIR = path.join(REPO, 'evidence', '2026-11-10', 'perseed-diplo-a');

function load(mode) {
  const out = {};
  if (!fs.existsSync(DIR)) return out;
  fs.readdirSync(DIR).filter(function (f) { return f.indexOf('-' + RUN + '-' + mode + '.json') !== -1; }).forEach(function (f) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    out[j.seed] = j;
  });
  return out;
}
function median(xs) { return SL.median(xs); }
function chanceBand(c) {
  if (c == null) return 'null';
  if (c < 25) return '5-24';
  if (c < 50) return '25-49';
  if (c < 75) return '50-74';
  return '75-95';
}

function analyzeSeed(j) {
  const base = SL.analyzeSeed(j);
  const days = j.daily || [];
  const diplo = j.diploDaily || [];
  const lastDay = days.length ? days[days.length - 1].day : 0;
  const r = Object.assign(base, {
    formation: { paths: {}, unclassified: 0, events: [], first: null, linksEver: 0, distinctTargets: [] },
    verbs: {},
    person: { staged: 0, stagedFates: {}, decisions: {}, chanceBands: {}, reconcile: { ok: 0, bad: [] }, scholarTargeted: 0, npcNpc: 0 },
    foreign: { maxCount: 0, maxSize: 0, any4plus: false, first4plusDay: null },
    polity: { ever: base.polityEver, firstDay: null, shape: null, size: null },
    national: { firstDay: null, globalFirstDay: null },
    seasonedAtEnd: 0, linksAtEnd: 0,
    wrapLive: j.wrapLive || {},
  });

  // Formation provenance (both birthplaces).
  const births = [];
  (j.formLinkCalls || []).forEach(function (c) { births.push({ day: c.day, targetId: c.targetId, path: c.path, birth: '_formLink', kind: null }); });
  (j.formPeerLinkCalls || []).forEach(function (c) { births.push({ day: c.day, targetId: c.targetId, path: c.path, birth: '_formPeerLink', kind: c.kind }); });
  births.sort(function (a, b) { return a.day - b.day; });
  births.forEach(function (b) {
    r.formation.paths[b.path] = (r.formation.paths[b.path] || 0) + 1;
    if (b.path === 'other') r.formation.unclassified++;
    r.formation.events.push(b);
    if (r.formation.distinctTargets.indexOf(b.targetId) === -1) r.formation.distinctTargets.push(b.targetId);
  });
  r.formation.linksEver = births.length;
  if (births.length) r.formation.first = births[0];

  // Diplomacy verb calls.
  (j.verbCalls || []).forEach(function (v) {
    const k = v.verb + ':' + v.outcome;
    r.verbs[k] = (r.verbs[k] || 0) + 1;
    const kv = v.verb;
    r.verbs[kv + ':total'] = (r.verbs[kv + ':total'] || 0) + 1;
  });

  // Person-bond tele events (kind 'person'). Scholar identity comes from
  // the daily snapshots: the staged event names the scholar at staging
  // time, the decision names the scholar at decision time.
  // Scholar identity is piecewise-constant between daily snapshots:
  // scholarOn(day) is the latest snapshot at or before that day.
  const scholarDays = days.filter(function (sn) { return sn.scholarId; })
    .map(function (sn) { return { day: sn.day, id: sn.scholarId }; })
    .sort(function (a, b) { return a.day - b.day; });
  const scholarOn = function (day) {
    let id = scholarDays.length ? scholarDays[0].id : null;
    scholarDays.forEach(function (e) { if (e.day <= day) id = e.id; });
    return id;
  };
  const isScholarTarget = function (d) { return d.target != null && d.target === scholarOn(d.day); };
  const personEvs = (j.bondEvents || []).filter(function (e) { return e.kind === 'person'; });
  const staged = personEvs.filter(function (e) { return e.outcome === 'staged'; });
  const decisions = personEvs.filter(function (e) { return e.outcome !== 'staged'; });
  r.person.staged = staged.length;
  staged.forEach(function (st) {
    r.person.scholarTargeted++;
    const dec = decisions.filter(function (d) {
      return d.initiator === st.initiator && d.day >= st.day && d.day <= st.day + 3 && isScholarTarget(d);
    }).sort(function (a, b) { return a.day - b.day; })[0];
    let fate = 'pending-at-end';
    if (dec) { fate = dec.outcome; r.person.reconcile.ok++; }
    else if (st.day > lastDay - 3) { r.person.reconcile.ok++; }
    else r.person.reconcile.bad.push({ vid: st.initiator, target: st.target, day: st.day });
    r.person.stagedFates[fate] = (r.person.stagedFates[fate] || 0) + 1;
  });
  decisions.forEach(function (d) {
    if (isScholarTarget(d)) {
      // Scholar-answered decision. If it answers a staged ask it was
      // already counted as that staging's fate; an unpreceded one would
      // mean a missed staging (instrument gap) — counted separately so
      // it shows up instead of being folded into the NPC↔NPC bucket.
      const preceded = staged.some(function (st) { return st.initiator === d.initiator && d.day >= st.day && d.day <= st.day + 3; });
      if (preceded) return;
      r.person.orphanScholarDecisions = (r.person.orphanScholarDecisions || 0) + 1;
      r.person.reconcile.ok++;
      return;
    }
    // Immediate NPC↔NPC character decision — self-reconciling.
    r.person.npcNpc++;
    r.person.decisions[d.outcome] = (r.person.decisions[d.outcome] || 0) + 1;
    r.person.chanceBands[chanceBand(d.chance)] = (r.person.chanceBands[chanceBand(d.chance)] || 0) + 1;
    r.person.reconcile.ok++;
  });

  // Foreign polities + national/global first days + polity first day/shape.
  diplo.forEach(function (s) {
    const fp = s.foreignPolities || {};
    if ((fp.count || 0) > r.foreign.maxCount) r.foreign.maxCount = fp.count;
    if ((fp.maxSize || 0) > r.foreign.maxSize) r.foreign.maxSize = fp.maxSize;
    if (fp.any4plus && !r.foreign.any4plus) { r.foreign.any4plus = true; r.foreign.first4plusDay = s.day; }
    if (s.flags) {
      if (s.flags.nationalLive && r.national.firstDay == null) r.national.firstDay = s.day;
      if (s.flags.globalLive && r.national.globalFirstDay == null) r.national.globalFirstDay = s.day;
    }
    if (s.pendingNational && r.polity.firstDay == null) { /* pending beat seen; polity itself below */ }
  });
  days.forEach(function (s) {
    if (s.polity && r.polity.firstDay == null) {
      r.polity.firstDay = s.day;
      r.polity.shape = s.polity.shape || null;
      r.polity.size = s.polity.size || null;
    }
  });
  // Seasoned / active links at end (last snapshot).
  if (days.length) {
    const last = days[days.length - 1];
    r.linksAtEnd = (last.links || []).length;
    r.seasonedAtEnd = (last.links || []).filter(function (l) { return l.seasoned; }).length;
  }
  return r;
}

function main() {
  const control = load('control');
  const armed = load('armed');
  const neutral = load('neutral');
  const seeds = Object.keys(control).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) { console.error('DIPLO ANALYZE STOP: no control-leg files for run ' + RUN); process.exit(2); }
  const perSeed = {};
  const band = {
    run: RUN, seeds: seeds,
    legs: {},
    neutrality: { daysExact: 0, standingExact: 0, mismatches: [] },
    instrumentErrors: 0,
    go: {},
  };
  ['control', 'armed'].forEach(function (leg) {
    const src = leg === 'control' ? control : armed;
    const rows = seeds.map(function (s) { return analyzeSeed(src[s]); });
    const b = {
      wins: 0, national: 0, table: 0, wave4: 0, wave5: 0,
      medianSurvival: median(rows.map(function (r) { return r.days; })),
      survivors: rows.filter(function (r) { return r.endReason === 'horizon'; }).length,
      formationPaths: {}, formationUnclassified: 0, linksEver: 0,
      firstLinkByPath: {},
      seasonedMax: 0, seasonedAtEndTotal: 0, polityEver: 0,
      verbTotals: {}, personStaged: 0, personStagedFates: {}, personDecisions: {}, personChanceBands: {},
      personReconcileOk: 0, personReconcileBad: [],
      linkReconcileOk: 0, linkReconcileBad: [],
      foreignMaxCount: 0, foreignMaxSize: 0, foreign4plus: 0,
      talks: 0, turns: 0, linkPicks: 0, bondPicks: 0, raiserPendingTalks: 0,
      stagings: 0, secondStagings: 0, fateCounts: {},
      instrumentErrors: 0,
    };
    rows.forEach(function (r) {
      if (r.won) b.wins++;
      if (r.scaleRank === 'national' || r.scaleRank === 'global') b.national++;
      if (r.won) b.table++;
      if ((r.maxWave || 1) >= 4) b.wave4++;
      if ((r.maxWave || 1) >= 5) b.wave5++;
      b.instrumentErrors += r.instrumentErrors;
      band.instrumentErrors += r.instrumentErrors;
      Object.keys(r.formation.paths).forEach(function (p) { b.formationPaths[p] = (b.formationPaths[p] || 0) + r.formation.paths[p]; });
      b.formationUnclassified += r.formation.unclassified;
      b.linksEver += r.formation.linksEver;
      if (r.formation.first) {
        const p = r.formation.first.path;
        b.firstLinkByPath[p] = (b.firstLinkByPath[p] || 0) + 1;
      }
      if (r.seasonedLinks > b.seasonedMax) b.seasonedMax = r.seasonedLinks;
      b.seasonedAtEndTotal += r.seasonedAtEnd;
      if (r.polity.ever) b.polityEver++;
      Object.keys(r.verbs).forEach(function (k) { b.verbTotals[k] = (b.verbTotals[k] || 0) + r.verbs[k]; });
      b.personStaged += r.person.staged;
      Object.keys(r.person.stagedFates).forEach(function (f) { b.personStagedFates[f] = (b.personStagedFates[f] || 0) + r.person.stagedFates[f]; });
      Object.keys(r.person.decisions).forEach(function (o) { b.personDecisions[o] = (b.personDecisions[o] || 0) + r.person.decisions[o]; });
      Object.keys(r.person.chanceBands).forEach(function (cb) { b.personChanceBands[cb] = (b.personChanceBands[cb] || 0) + r.person.chanceBands[cb]; });
      b.personReconcileOk += r.person.reconcile.ok;
      b.personReconcileBad = b.personReconcileBad.concat(r.person.reconcile.bad.map(function (x) { return Object.assign({ seed: r.seed }, x); }));
      b.linkReconcileOk += r.reconcile.ok;
      b.linkReconcileBad = b.linkReconcileBad.concat(r.reconcile.bad.map(function (x) { return Object.assign({ seed: r.seed }, x); }));
      if (r.foreign.maxCount > b.foreignMaxCount) b.foreignMaxCount = r.foreign.maxCount;
      if (r.foreign.maxSize > b.foreignMaxSize) b.foreignMaxSize = r.foreign.maxSize;
      if (r.foreign.any4plus) b.foreign4plus++;
      const tj = src[r.seed] || {};
      if (tj.talk) {
        b.talks += tj.talk.talks || 0;
        b.turns += tj.talk.turns || 0;
        b.linkPicks += tj.talk.linkPicks || 0;
        b.bondPicks += tj.talk.bondPicks || 0;
        b.raiserPendingTalks += tj.talk.talksWithRaiserPending || 0;
      }
      b.stagings += r.stagings.length;
      b.secondStagings += r.secondStagings.length;
      r.stagings.forEach(function (f) { b.fateCounts[f.fate] = (b.fateCounts[f.fate] || 0) + 1; });
    });
    band.legs[leg] = b;
    perSeed[leg] = rows;
  });
  // Neutrality: neutral leg vs instrumented control leg.
  seeds.forEach(function (s) {
    const chk = neutralityCheck(neutral[s], control[s]);
    band.neutrality.daysExact += chk.daysExact ? 1 : 0;
    band.neutrality.standingExact += chk.standingExact ? 1 : 0;
    if (chk.mismatch) band.neutrality.mismatches.push(Object.assign({ seed: s }, chk.mismatch));
  });

  // GO evaluation (prereg bars).
  const go = {
    allLinksClassified: band.legs.control.formationUnclassified === 0 && band.legs.armed.formationUnclassified === 0,
    teleReconciled: band.legs.control.linkReconcileBad.length === 0 && band.legs.armed.linkReconcileBad.length === 0 &&
      band.legs.control.personReconcileBad.length === 0 && band.legs.armed.personReconcileBad.length === 0,
    neutrality: band.neutrality.daysExact === seeds.length && band.neutrality.standingExact === seeds.length,
    noInstrumentErrors: band.instrumentErrors === 0,
    firstNumbersCaptured: seeds.every(function (s) { return control[s] && armed[s] && control[s].daily && armed[s].daily; }),
  };
  go.all = go.allLinksClassified && go.teleReconciled && go.neutrality && go.noInstrumentErrors && go.firstNumbersCaptured;
  band.go = go;

  const outFile = path.join(REPO, 'evidence', '2026-11-10', 'diplo-summary-' + RUN + '.json');
  fs.writeFileSync(outFile, JSON.stringify({ band: band, perSeed: perSeed }, null, 2) + '\n');

  console.log('DIPLO BAND run=' + RUN + ' seeds=' + seeds.join(','));
  ['control', 'armed'].forEach(function (leg) {
    const b = band.legs[leg];
    console.log('LEG ' + leg + ': wins=' + b.wins + '/' + seeds.length + ' national=' + b.national + ' table=' + b.table +
      ' w4=' + b.wave4 + ' w5=' + b.wave5 + ' median=' + b.medianSurvival + ' survivors=' + b.survivors);
    console.log('  formation paths=' + JSON.stringify(b.formationPaths) + ' unclassified=' + b.formationUnclassified +
      ' linksEver=' + b.linksEver + ' firstByPath=' + JSON.stringify(b.firstLinkByPath));
    console.log('  seasonedMax=' + b.seasonedMax + ' seasonedAtEndTotal=' + b.seasonedAtEndTotal + ' polityEver=' + b.polityEver +
      ' foreignMaxCount=' + b.foreignMaxCount + ' foreignMaxSize=' + b.foreignMaxSize + ' foreign4plus=' + b.foreign4plus);
    console.log('  verbs=' + JSON.stringify(b.verbTotals));
    console.log('  person staged=' + b.personStaged + ' fates=' + JSON.stringify(b.personStagedFates) +
      ' decisions=' + JSON.stringify(b.personDecisions) + ' chanceBands=' + JSON.stringify(b.personChanceBands));
    console.log('  link stagings=' + b.stagings + ' second=' + b.secondStagings + ' fates=' + JSON.stringify(b.fateCounts));
    console.log('  talks=' + b.talks + ' turns=' + b.turns + ' linkPicks=' + b.linkPicks + ' bondPicks=' + b.bondPicks +
      ' raiserPending=' + b.raiserPendingTalks);
    console.log('  reconcile link ok=' + b.linkReconcileOk + ' bad=' + JSON.stringify(b.linkReconcileBad) +
      ' person ok=' + b.personReconcileOk + ' bad=' + JSON.stringify(b.personReconcileBad) + ' err=' + b.instrumentErrors);
  });
  perSeed.control.forEach(function (r, i) {
    const a = perSeed.armed[i];
    console.log(' seed ' + r.seed + ' ctrl days=' + r.days + ' scale=' + r.scaleRank + ' wave=' + r.maxWave + ' standing=' + r.standing +
      ' links=' + r.formation.linksEver + ' paths=' + JSON.stringify(r.formation.paths) +
      ' first=' + (r.formation.first ? r.formation.first.path + '@d' + r.formation.first.day : 'none') +
      ' seasonedMax=' + r.seasonedLinks + ' polity=' + (r.polity.ever ? 'yes@d' + r.polity.firstDay : 'no') +
      ' personStaged=' + r.person.staged + ' | armed days=' + a.days + ' scale=' + a.scaleRank + ' wave=' + a.maxWave + ' standing=' + a.standing +
      ' links=' + a.formation.linksEver + ' paths=' + JSON.stringify(a.formation.paths) +
      ' first=' + (a.formation.first ? a.formation.first.path + '@d' + a.formation.first.day : 'none') +
      ' seasonedMax=' + a.seasonedLinks + ' polity=' + (a.polity.ever ? 'yes@d' + a.polity.firstDay : 'no') +
      ' personStaged=' + a.person.staged);
  });
  console.log('NEUTRALITY daysExact=' + band.neutrality.daysExact + '/' + seeds.length + ' standingExact=' + band.neutrality.standingExact + '/' + seeds.length +
    ' mismatches=' + JSON.stringify(band.neutrality.mismatches));
  console.log('GO classified=' + go.allLinksClassified + ' reconciled=' + go.teleReconciled + ' neutrality=' + go.neutrality +
    ' noErrors=' + go.noInstrumentErrors + ' captured=' + go.firstNumbersCaptured + ' => ' + (go.all ? 'GO' : 'NO-GO'));
  console.log('WROTE ' + path.relative(REPO, outFile));
}

// Neutrality comparison for one seed: {daysExact, standingExact, mismatch}.
// mismatch is null when the legs agree on both, or {why, ...} naming the
// first difference (missing file counts as a mismatch, not a pass).
function neutralityCheck(n, c) {
  if (!n || !c) return { daysExact: false, standingExact: false, mismatch: { why: 'missing-leg-file' } };
  if (n.days !== c.days) return { daysExact: false, standingExact: n.standing === c.standing, mismatch: { why: 'days', neutral: n.days, control: c.days } };
  if (n.standing !== c.standing) return { daysExact: true, standingExact: false, mismatch: { why: 'standing', neutral: n.standing, control: c.standing } };
  return { daysExact: true, standingExact: true, mismatch: null };
}

if (require.main === module) main();

module.exports = { analyzeSeed: analyzeSeed, load: load, chanceBand: chanceBand, neutralityCheck: neutralityCheck };
