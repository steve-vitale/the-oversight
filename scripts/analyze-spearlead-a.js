// analyze-spearlead-a.js — analyzer + judge, arm sim-spearlead-a (DIAG).
// SPEAR-LEAD DIAGNOSTIC: the gate passes every spear departure on
// to the sources (spearopen-a: 42 seen, 42 passed, ratio 1.000) and
// yet no spear carrier ever led an expedition wave-4 fight (0 of 10
// expedition leads on the spearopen band). Where do the 42
// gate-passed spear departures GO? This analyzer closes the ledger:
// every spear departure (a spearDeparts row) lands in EXACTLY ONE
// terminal bucket, in the frozen priority order (prereg §2):
//   1 lead-w4-with-spear  — lead (row vid) of an expedition-origin
//       wave-4+ fight with a spear in the ranged slot at entry.
//       THE FALSIFIER — expect 0.
//   2 companion-w4        — in allyKit WITH A SPEAR of an
//       expedition-origin wave-4+ fight (never lead).
//   3 gate-avoid-w4       — a v4gates row for this vid on/after the
//       depart day with result avoid, and no wave-4 expedition
//       fight as lead/companion after it.
//   4 converted-at-staging — post-staging ranged weapon is
//       ammo-capable (departed as a ranged carrier, not a spear
//       carrier).
//   5 died-away           — died while away before any wave-4
//       meeting (lead, companion, or gate-avoid).
//   6 plan-never-reached  — departed with a wave-4 plan and
//       returned home (or still away at end) having met no wave-4
//       monster on expedition.
//   7 autonomous-no-w4    — departed with no wave-4 plan and met
//       no wave-4 monster on expedition.
//   8 still-away-at-end   — still away/on-expedition at run end,
//       no wave-4 meeting yet.
//   9 unattributed        — none of the above. Counted openly; the
//       residual.
// A fight/avoid joins the departure whose window contains it: the
// latest departure of that vid with departDay <= day <= closeDay
// (close-out day from spearTrack, else the seed's end day). A
// superseded departure's window ends on the re-depart day; the new
// departure owns that day. A fight whose lead/companion vid has no
// containing spear departure is a window miss (counted openly —
// the lead may simply have departed with a bow, which is not a
// spear departure at all).
// The weapon taxonomy is defined ONCE, in analyze-spearopen-a.js —
// weaponClass / ammoCapable / loadDefs via require.
// The judge (frozen prereg §2): pool floor spear departures >= 10;
// classification completeness (buckets 1-8 / all departures)
// >= 0.90; zero-lead reconciliation (lead-w4-with-spear == 0 AND
// bucket counts sum to total departures); instrument errors 0.
// Verdict kinds: DIAG-GO / THIN-POOL / ATTRIBUTION / LEAD-FOUND /
// INSTRUMENT. Single leg (no ctl/arm pair, no §15 panel — said
// here, not fabricated).
//
// Usage:
//   node scripts/analyze-spearlead-a.js --dir DIR [--out FILE]
//   node scripts/analyze-spearlead-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const { weaponClass, ammoCapable, loadDefs } = require('./analyze-spearopen-a');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const BUCKETS = ['lead-w4-with-spear', 'companion-w4', 'gate-avoid-w4',
  'converted-at-staging', 'died-away', 'plan-never-reached',
  'autonomous-no-w4', 'still-away-at-end', 'unattributed'];
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}
const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
function loadWave4Ids() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4_IDS_FROZEN.slice().sort(); }
}
const W4_SET = new Set(loadWave4Ids());

// classifyDeparture(dep, ctx): the frozen priority order. ctx:
//   { closeOut: {seq -> outcome}, endDay,
//     leadFights: [expFights rows led by this departure],
//     compFightsSpear: [expFights rows where vid is a spear ally],
//     compFightsAny: [expFights rows where vid is any ally],
//     avoids: [v4gates avoid rows assigned to this departure] }
// Returns { bucket, why } — why names the deciding evidence.
function classifyDeparture(dep, ctx) {
  const defs = ctx.defs;
  const planW4 = ((dep.planNeedWave | 0) >= 4) || !!(dep.planTarget && W4_SET.has(dep.planTarget));
  const converted = ammoCapable(dep.postRangedId, defs);
  const metW4LeadSpear = ctx.leadFights.some(function (f) { return (f.wave | 0) >= 4 && weaponClass(f.rangedId, defs) === 'spear'; });
  const metW4LeadAny = ctx.leadFights.some(function (f) { return (f.wave | 0) >= 4; });
  const metW4CompSpear = ctx.compFightsSpear.some(function (f) { return (f.wave | 0) >= 4; });
  const metW4CompAny = ctx.compFightsAny.some(function (f) { return (f.wave | 0) >= 4; });
  const metW4AnyKit = metW4LeadAny || metW4CompAny || ctx.avoids.length > 0;
  const closeOut = ctx.closeOut || null;
  if (metW4LeadSpear) return { bucket: 'lead-w4-with-spear', why: 'led a wave-4+ expedition fight with a spear at entry', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
  if (metW4CompSpear) return { bucket: 'companion-w4', why: 'spear-carrying ally in a wave-4+ expedition fight', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
  // Gate-avoid: an avoid with no wave-4 expedition fight as
  // lead/companion after it (any kit — a later bow-companion fight
  // means the carrier DID meet wave 4 after the avoid).
  const avoidOk = ctx.avoids.some(function (a) {
    const afterLead = ctx.leadFights.some(function (f) { return (f.wave | 0) >= 4 && f.day >= a.day; });
    const afterComp = ctx.compFightsAny.some(function (f) { return (f.wave | 0) >= 4 && f.day >= a.day; });
    return !afterLead && !afterComp;
  });
  if (avoidOk) return { bucket: 'gate-avoid-w4', why: 'gate said avoid and no wave-4 expedition fight followed', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
  if (converted) return { bucket: 'converted-at-staging', why: 'post-staging ranged weapon is ammo-capable (' + dep.postRangedId + ')', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
  if (closeOut === 'died' && !metW4AnyKit) return { bucket: 'died-away', why: 'died while away with no wave-4 meeting', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
  if (planW4 && !metW4AnyKit) return { bucket: 'plan-never-reached', why: 'wave-4 plan, returned/still away, met no wave-4 monster', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
  if (!planW4 && (closeOut === 'returned' || closeOut === 'superseded') && !metW4AnyKit) return { bucket: 'autonomous-no-w4', why: 'no wave-4 plan, returned, met no wave-4 monster', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
  if (!planW4 && (closeOut === 'still-away-at-end' || closeOut == null) && !metW4AnyKit) return { bucket: 'still-away-at-end', why: 'still away at run end, no wave-4 meeting yet', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
  return { bucket: 'unattributed', why: 'no bucket rule matched (leadW4Any=' + metW4LeadAny + ' compAny=' + metW4CompAny + ' avoids=' + ctx.avoids.length + ' converted=' + converted + ' closeOut=' + closeOut + ' planW4=' + planW4 + ')', planW4: planW4, converted: converted, metW4AnyKit: metW4AnyKit };
}

// assignDepartures(deps, closeBySeq, endDay, fights, avoids):
// joins each fight/avoid to the latest departure of the same vid
// whose window contains its day. Returns { leadOf, compSpearOf,
// compAnyOf, avoidOf } — maps keyed by row seq (fights) / row
// index (avoids) to the departure seq, plus windowMisses counts.
function assignDepartures(deps, closeBySeq, endDay, fights, avoids) {
  function closeDay(dep) {
    const c = closeBySeq[dep.seq];
    return (c != null ? c.day : endDay);
  }
  function containing(vid, day) {
    let best = null;
    for (const dep of deps) {
      if (dep.vid !== vid) continue;
      if (dep.day > day || day > closeDay(dep)) continue;
      if (!best || dep.day > best.day || (dep.day === best.day && dep.seq > best.seq)) best = dep;
    }
    return best;
  }
  // A "window miss" is a REAL tracking gap: the vid HAS a spear
  // departure, but no window contains the fight/avoid day. A vid
  // with no spear departure at all (departed with a bow, or a wild
  // holder) is expected — counted separately as noDep*, never as a
  // miss.
  function hasDeparture(vid) { for (const dep of deps) if (dep.vid === vid) return true; return false; }
  const leadOf = {}, compSpearOf = {}, compAnyOf = {}, avoidOf = {};
  let windowMissLead = 0, windowMissComp = 0, windowMissAvoid = 0;
  let noDepLead = 0, noDepComp = 0, noDepAvoid = 0;
  for (const f of (fights || [])) {
    const lead = containing(f.vid, f.day);
    if (lead) leadOf[f.seq] = lead.seq;
    else if (hasDeparture(f.vid)) windowMissLead++;
    else noDepLead++;
    for (const avid of (f.allyVids || [])) {
      const c = containing(avid, f.day);
      if (c) compAnyOf[f.seq + ':' + avid] = c.seq;
      else if (hasDeparture(avid)) windowMissComp++;
      else noDepComp++;
    }
    for (const avid of (f.allySpearVids || [])) {
      const c = containing(avid, f.day);
      if (c) compSpearOf[f.seq + ':' + avid] = c.seq;
      else if (hasDeparture(avid)) windowMissComp++;
      else noDepComp++;
    }
  }
  for (let i = 0; i < (avoids || []).length; i++) {
    const a = avoids[i];
    const c = containing(a.vid, a.day);
    if (c) avoidOf[i] = c.seq;
    else if (hasDeparture(a.vid)) windowMissAvoid++;
    else noDepAvoid++;
  }
  return { leadOf: leadOf, compSpearOf: compSpearOf, compAnyOf: compAnyOf, avoidOf: avoidOf,
    windowMissLead: windowMissLead, windowMissComp: windowMissComp, windowMissAvoid: windowMissAvoid,
    noDepLead: noDepLead, noDepComp: noDepComp, noDepAvoid: noDepAvoid };
}

function spearStats(dir, opts) {
  opts = opts || {};
  const defs = loadDefs();
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    bowopenOn: {}, speargateOn: {}, senseexpedOn: {}, fightally2On: {},
    spearSeen: 0, spearPassed: 0, spearSeenFiles: 0, spearPassedRatio: null,
    bowOpen: { alreadyHad: 0, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 0, spearSeen: 0, spearPassed: 0 },
    bowOpenStagedVids: 0,
    // The ledger population.
    departures: 0, ledgerSpearRows: 0, stagingRows: 0, spearSeenBumps: 0,
    reconciliation: [], // per seed: { seed, ledgerSpearRows, spearSeen, spearSeenBumps, match }
    buckets: {}, bucketSum: 0, completeness: null,
    leadW4WithSpear: 0,
    // Cross-tabs.
    xtabConvertedLead: { converted: 0, convertedLeadW4Any: 0, convertedLeadShare: null },
    xtabPlanMeeting: { planW4: 0, planW4Met: 0, planW4MetShare: null, noPlan: 0, noPlanMet: 0, noPlanMetShare: null },
    xtabSourceConverted: {}, // source -> { n, converted }
    // Expedition fights while away (lead fights assigned to a spear departure).
    expFightWaves: {}, expFightsTotal: 0, expFightsAssigned: 0,
    windowMissLead: 0, windowMissComp: 0, windowMissAvoid: 0,
    noDepLead: 0, noDepComp: 0, noDepAvoid: 0,
    // Wall numbers (scale-onramp axis). Table is NOT instrumented
    // by this driver — null, never faked.
    days: [], medianDays: null, communityLost: 0, national: 0, table: null, seedWins: 0,
    wave4: 0, wave5: 0, scaleRanks: {}, deaths: 0, starvation: 0,
    deathKinds: {} };
  for (const b of BUCKETS) st.buckets[b] = 0;
  const perSeed = [];
  const departuresDetail = [];
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    if (!d || typeof d !== 'object') { st.errors++; continue; }
    st.valid++;
    st.errors += ((d.instrumentErrors || []).length);
    if (d.bowopenOn != null) st.bowopenOn[String(d.bowopenOn)] = (st.bowopenOn[String(d.bowopenOn)] || 0) + 1;
    if (d.speargateOn != null) st.speargateOn[String(d.speargateOn)] = (st.speargateOn[String(d.speargateOn)] || 0) + 1;
    if (d.senseexpedOn != null) st.senseexpedOn[String(d.senseexpedOn)] = (st.senseexpedOn[String(d.senseexpedOn)] || 0) + 1;
    if (d.fightally2On != null) st.fightally2On[String(d.fightally2On)] = (st.fightally2On[String(d.fightally2On)] || 0) + 1;
    if (d.spearSeen != null) { st.spearSeen += (d.spearSeen | 0); st.spearSeenFiles++; }
    if (d.spearPassed != null) st.spearPassed += (d.spearPassed | 0);
    if (d.bowOpen) {
      for (const k of Object.keys(st.bowOpen)) st.bowOpen[k] += (d.bowOpen[k] | 0);
      st.bowOpenStagedVids += (d.bowOpenStagedVids | 0);
    }
    st.days.push(d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0));
    if ((RANK_ORDER[d.scaleRank] || 0) >= 2) st.national++;
    if (d.won) st.seedWins++;
    if ((d.maxWave | 0) >= 4) st.wave4++;
    if ((d.maxWave | 0) >= 5) st.wave5++;
    if (['village-lost', 'village-dead', 'pop-zero'].includes(d.endReason)) st.communityLost++;
    st.scaleRanks[d.scaleRank || '?'] = (st.scaleRanks[d.scaleRank || '?'] || 0) + 1;
    for (const death of (d.deaths || [])) {
      st.deaths++;
      if (isStarvation(death)) st.starvation++;
      const k = String((death.kind || death.cause || '?')).slice(0, 40);
      st.deathKinds[k] = (st.deathKinds[k] || 0) + 1;
    }
    // ---- The ledger: spear departures for this seed. ----
    const staging = d.spearDeparts || [];
    const deps = staging.filter(function (r) { return r && r.isSpear; });
    const endDay = (d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0));
    const closeBySeq = {};
    for (const t of (d.spearTrack || [])) {
      if (t && t.kind === 'close' && t.seq != null && closeBySeq[t.seq] == null) closeBySeq[t.seq] = { day: t.day, outcome: t.outcome };
    }
    const avoids = (d.v4gates || []).filter(function (g) { return g && g.result === 'avoid'; });
    const asg = assignDepartures(deps, closeBySeq, endDay, d.expFights || [], avoids);
    st.windowMissLead += asg.windowMissLead;
    st.windowMissComp += asg.windowMissComp;
    st.windowMissAvoid += asg.windowMissAvoid;
    st.noDepLead += asg.noDepLead;
    st.noDepComp += asg.noDepComp;
    st.noDepAvoid += asg.noDepAvoid;
    const seedBuckets = {};
    for (const b of BUCKETS) seedBuckets[b] = 0;
    let seedBumps = 0;
    for (const r of staging) if (r && r.spearSeenBump) seedBumps++;
    for (const dep of deps) {
      const leadFights = (d.expFights || []).filter(function (f) { return asg.leadOf[f.seq] === dep.seq; });
      const compSpear = (d.expFights || []).filter(function (f) { return (f.allySpearVids || []).some(function (avid) { return asg.compSpearOf[f.seq + ':' + avid] === dep.seq; }); });
      const compAny = (d.expFights || []).filter(function (f) { return (f.allyVids || []).some(function (avid) { return asg.compAnyOf[f.seq + ':' + avid] === dep.seq; }); });
      const depAvoids = avoids.filter(function (a, i) { return asg.avoidOf[i] === dep.seq; });
      const close = closeBySeq[dep.seq] || null;
      const cls = classifyDeparture(dep, { defs: defs, closeOut: close ? close.outcome : null,
        leadFights: leadFights, compFightsSpear: compSpear, compFightsAny: compAny, avoids: depAvoids });
      st.buckets[cls.bucket]++;
      seedBuckets[cls.bucket]++;
      // Cross-tabs.
      if (cls.converted) {
        st.xtabConvertedLead.converted++;
        if (leadFights.some(function (f) { return (f.wave | 0) >= 4; })) st.xtabConvertedLead.convertedLeadW4Any++;
      }
      if (cls.planW4) {
        st.xtabPlanMeeting.planW4++;
        if (cls.metW4AnyKit) st.xtabPlanMeeting.planW4Met++;
      } else {
        st.xtabPlanMeeting.noPlan++;
        if (cls.metW4AnyKit) st.xtabPlanMeeting.noPlanMet++;
      }
      const src = dep.source || '?';
      if (!st.xtabSourceConverted[src]) st.xtabSourceConverted[src] = { n: 0, converted: 0 };
      st.xtabSourceConverted[src].n++;
      if (cls.converted) st.xtabSourceConverted[src].converted++;
      // Expedition fight waves while away (lead fights assigned).
      for (const lf of leadFights) {
        st.expFightsTotal++;
        const w = 'w' + (lf.wave | 0);
        st.expFightWaves[w] = (st.expFightWaves[w] || 0) + 1;
      }
      departuresDetail.push({ seed: d.seed, day: dep.day, vid: dep.vid, bucket: cls.bucket, why: cls.why,
        source: dep.source || null, stagedItemId: dep.stagedItemId || null,
        preRangedId: dep.preRangedId || null, postRangedId: dep.postRangedId || null,
        planStage: dep.planStage || null, planTarget: dep.planTarget || null,
        planNeedWave: dep.planNeedWave != null ? dep.planNeedWave : null,
        closeOut: close ? close.outcome : null, converted: cls.converted, planW4: cls.planW4 });
    }
    st.departures += deps.length;
    st.ledgerSpearRows += deps.length;
    st.stagingRows += staging.length;
    st.spearSeenBumps += seedBumps;
    const recon = { seed: d.seed, ledgerSpearRows: deps.length, spearSeen: (d.spearSeen != null ? d.spearSeen : null),
      spearSeenBumps: seedBumps, match: (d.spearSeen != null ? (deps.length === d.spearSeen && seedBumps === d.spearSeen) : null) };
    st.reconciliation.push(recon);
    perSeed.push({ seed: d.seed, departures: deps.length, stagingRows: staging.length,
      spearSeen: recon.spearSeen, spearSeenBumps: seedBumps, reconciled: recon.match,
      buckets: seedBuckets, errors: (d.instrumentErrors || []).length });
  }
  st.bucketSum = BUCKETS.reduce(function (a, b) { return a + st.buckets[b]; }, 0);
  st.completeness = st.departures ? (st.bucketSum - st.buckets.unattributed) / st.departures : null;
  st.leadW4WithSpear = st.buckets['lead-w4-with-spear'];
  st.expFightsAssigned = st.expFightsTotal;
  st.spearPassedRatio = st.spearSeen ? st.spearPassed / st.spearSeen : null;
  st.xtabConvertedLead.convertedLeadShare = st.xtabConvertedLead.converted ? st.xtabConvertedLead.convertedLeadW4Any / st.xtabConvertedLead.converted : null;
  st.xtabPlanMeeting.planW4MetShare = st.xtabPlanMeeting.planW4 ? st.xtabPlanMeeting.planW4Met / st.xtabPlanMeeting.planW4 : null;
  st.xtabPlanMeeting.noPlanMetShare = st.xtabPlanMeeting.noPlan ? st.xtabPlanMeeting.noPlanMet / st.xtabPlanMeeting.noPlan : null;
  st.medianDays = median(st.days);
  st.perSeed = perSeed;
  st.departuresDetail = departuresDetail;
  return st;
}

function judgeSpear(st) {
  const bars = [];
  const poolOk = st.departures >= 10;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'spear departures (ledger rows): ' + st.departures + ' (floor 10); staging rows ' + st.stagingRows + ', spearSeen bumps ' + st.spearSeenBumps + ', game spearSeen ' + st.spearSeen });
  const attrOk = st.completeness != null && st.completeness >= 0.90;
  bars.push({ id: 'classification-completeness', pass: attrOk,
    detail: 'buckets 1-8 on ' + (st.bucketSum - st.buckets.unattributed) + '/' + st.departures + ' departures (' + (st.completeness == null ? 'n/a' : st.completeness.toFixed(3)) + ', bar >= 0.90); unattributed ' + st.buckets.unattributed + ' ' + JSON.stringify(st.buckets) });
  const leadOk = st.leadW4WithSpear === 0;
  const sumOk = st.bucketSum === st.departures;
  bars.push({ id: 'zero-lead-reconciliation', pass: leadOk && sumOk,
    detail: 'lead-w4-with-spear ' + st.leadW4WithSpear + ' (must be 0, reproducing spearopen); bucket counts sum ' + st.bucketSum + ' vs departures ' + st.departures });
  const errOk = st.errors === 0;
  bars.push({ id: 'instrument-errors', pass: errOk,
    detail: 'instrument errors ' + st.errors + ' across ' + st.valid + '/' + st.n + ' valid per-seed files (bar 0); window misses lead/comp/avoid ' + st.windowMissLead + '/' + st.windowMissComp + '/' + st.windowMissAvoid });
  let verdict = 'DIAG-NO-GO', kind = '';
  if (!poolOk) { verdict = 'DIAG-NO-GO'; kind = 'THIN-POOL'; }
  else if (!attrOk) { verdict = 'DIAG-NO-GO'; kind = 'ATTRIBUTION'; }
  else if (!leadOk || !sumOk) { verdict = 'DIAG-NO-GO'; kind = 'LEAD-FOUND'; }
  else if (!errOk) { verdict = 'DIAG-NO-GO'; kind = 'INSTRUMENT'; }
  else { verdict = 'DIAG-GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'bowopenOn', 'speargateOn', 'senseexpedOn', 'fightally2On',
    'spearSeen', 'spearPassed', 'spearSeenFiles', 'spearPassedRatio',
    'bowOpen', 'bowOpenStagedVids',
    'departures', 'ledgerSpearRows', 'stagingRows', 'spearSeenBumps', 'reconciliation',
    'buckets', 'bucketSum', 'completeness', 'leadW4WithSpear',
    'xtabConvertedLead', 'xtabPlanMeeting', 'xtabSourceConverted',
    'expFightWaves', 'expFightsTotal', 'expFightsAssigned',
    'windowMissLead', 'windowMissComp', 'windowMissAvoid',
    'noDepLead', 'noDepComp', 'noDepAvoid',
    'medianDays', 'communityLost', 'national', 'table', 'seedWins',
    'wave4', 'wave5', 'scaleRanks', 'deaths', 'starvation', 'deathKinds',
    'perSeed']) o[k] = st[k];
  return o;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-lead-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  const defs = loadDefs();
  check('live defs classify the five spears/lance as spear',
    ['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'starfall_lance', 'godslayer_spear'].every(function (id) { return weaponClass(id, defs) === 'spear'; }));
  check('spears are not ammo-capable; bows are',
    !ammoCapable('hunting_spear', defs) && ammoCapable('bow', defs));
  function dep(seq, day, vid, o) {
    return Object.assign({ seq: seq, day: day, vid: vid, isSpear: true,
      preRangedId: 'hunting_spear', preAmmo: 0, spearSeenBump: true,
      source: 'noSource', stagedItemId: null, staged: false, craftedOk: false,
      byVid: { day: day, source: 'noSource', itemId: null },
      postRangedId: 'hunting_spear', postAmmo: 0,
      planStage: null, planTarget: null, planNeedWave: null, planParty: [] }, o);
  }
  function fight(seq, day, vid, o) {
    return Object.assign({ seq: seq, day: day, vid: vid, mid: 'bulldozer', wave: 1, origin: 'expedition',
      outcome: 'vFlee', rounds: 2, rangedId: 'hunting_spear', allyVids: [], allySpearVids: [] }, o);
  }
  function close(seq, day, vid, outcome) {
    return { kind: 'close', day: day, seq: seq, vid: vid, outcome: outcome,
      alive: outcome !== 'died', away: false, exped: false, node: null,
      metExp: 0, metW4Lead: 0, metW4Comp: 0, metW4Avoid: 0, metAnyW4: false };
  }
  // Seed 1: one departure per bucket (1-9) + a supersede pair.
  const seed1 = {
    seed: 110711, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
    maxWave: 4, endReason: 'survived', instrumentErrors: [], bowopenOn: true, speargateOn: true,
    senseexpedOn: true, fightally2On: true, deaths: [],
    bowOpen: { alreadyHad: 1, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 10, spearSeen: 11, spearPassed: 11 },
    bowOpenStagedVids: 11, spearSeen: 11, spearPassed: 11, bowOpenByVid: {},
    spearDeparts: [
      dep(1, 10, 'v1', {}), // bucket 1: leads a w4 fight with the spear
      dep(2, 11, 'v2', {}), // bucket 2: spear companion in a w4 fight
      dep(3, 12, 'v3', {}), // bucket 3: gate avoid, no fight after
      dep(4, 13, 'v4', { source: 'fromStash', staged: true, stagedItemId: 'bow', postRangedId: 'bow', postAmmo: 5 }), // bucket 4: converted
      dep(5, 14, 'v5', {}), // bucket 5: died away
      dep(6, 15, 'v6', { planStage: 'hunt', planTarget: 'eulogy', planNeedWave: 4 }), // bucket 6: plan, never reached
      dep(7, 16, 'v7', {}), // bucket 7: autonomous, met a wave-2, returned
      dep(8, 17, 'v8', {}), // bucket 8: still away at end
      dep(9, 18, 'v9', {}), // bucket 9: led w4 with NO ranged weapon (spear lost mid-trip), not converted
      dep(10, 19, 'v10', {}), // bucket 7 via supersede: re-departs as 11
      dep(11, 22, 'v10', {}), // bucket 7: autonomous, returned
      // A non-spear staging row (bow carrier stages a bow): counted
      // in stagingRows, never in the departure population.
      { seq: 12, day: 23, vid: 'v11', isSpear: false, preRangedId: 'bow', preAmmo: 3, spearSeenBump: false,
        source: 'alreadyHad', stagedItemId: 'bow', staged: false, craftedOk: false,
        byVid: { day: 23, source: 'alreadyHad', itemId: 'bow' },
        postRangedId: 'bow', postAmmo: 3, planStage: null, planTarget: null, planNeedWave: null, planParty: [] },
    ],
    allStarts: [],
    expFights: [
      fight(101, 12, 'v1', { mid: 'eulogy', wave: 4, outcome: 'vFlee', rangedId: 'hunting_spear' }),
      fight(102, 13, 'h9', { mid: 'audit', wave: 4, outcome: 'vFlee', rangedId: 'bow', allyVids: ['v2'], allySpearVids: ['v2'] }),
      fight(103, 18, 'v7', { mid: 'bulldozer', wave: 1, outcome: 'vFlee' }),
      fight(104, 20, 'v9', { mid: 'reunion', wave: 4, outcome: 'vFlee', rangedId: null }),
    ],
    v4gates: [
      { day: 14, vid: 'v3', mid: 'eulogy', wave: 4, result: 'avoid', reason: 'outmatched' },
    ],
    v4encounters: [],
    spearTrack: [
      close(1, 20, 'v1', 'returned'), close(2, 20, 'v2', 'returned'),
      close(3, 20, 'v3', 'returned'), close(4, 20, 'v4', 'returned'),
      close(5, 16, 'v5', 'died'), close(6, 25, 'v6', 'returned'),
      close(7, 22, 'v7', 'returned'), close(8, 150, 'v8', 'still-away-at-end'),
      close(9, 25, 'v9', 'returned'),
      close(10, 22, 'v10', 'superseded'), close(11, 30, 'v10', 'returned'),
    ],
  };
  // Seed 2: priority checks — a converted carrier who gate-avoids
  // (bucket 3 beats 4), and a converted carrier who later leads a
  // wave-4 fight with the bow (bucket 4 + the converted-lead cross-tab).
  const seed2 = {
    seed: 110712, days: 150, gameDays: 150, scaleRank: 'village', won: false,
    maxWave: 3, endReason: 'survived', instrumentErrors: [], bowopenOn: true, speargateOn: true,
    senseexpedOn: true, fightally2On: true, deaths: [],
    bowOpen: { alreadyHad: 0, fromStash: 0, fromArmory: 1, crafted: 0, craftedFail: 0, noSource: 0, spearSeen: 2, spearPassed: 2 },
    bowOpenStagedVids: 2, spearSeen: 2, spearPassed: 2, bowOpenByVid: {},
    spearDeparts: [
      dep(21, 30, 'w1', { source: 'fromArmory', staged: true, stagedItemId: 'bow', postRangedId: 'bow', postAmmo: 4 }),
      dep(22, 31, 'w2', { source: 'fromArmory', staged: true, stagedItemId: 'crossbow', postRangedId: 'crossbow', postAmmo: 6 }),
    ],
    allStarts: [],
    expFights: [
      fight(201, 40, 'w2', { mid: 'eulogy', wave: 4, outcome: 'vFlee', rangedId: 'crossbow' }),
    ],
    v4gates: [
      { day: 32, vid: 'w1', mid: 'audit', wave: 4, result: 'avoid', reason: 'outmatched' },
    ],
    v4encounters: [],
    spearTrack: [close(21, 50, 'w1', 'returned'), close(22, 50, 'w2', 'returned')],
  };
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed1));
  fs.writeFileSync(path.join(dir, 's2.json'), JSON.stringify(seed2));
  const st = spearStats(dir);
  check('departures 13 (11 seed1 + 2 seed2); staging rows 14 (one non-spear)',
    st.departures === 13 && st.stagingRows === 14, JSON.stringify({ d: st.departures, s: st.stagingRows }));
  check('bucket 1 count 1 (the spear lead)', st.buckets['lead-w4-with-spear'] === 1, JSON.stringify(st.buckets));
  check('bucket 2 count 1 (the spear companion)', st.buckets['companion-w4'] === 1, JSON.stringify(st.buckets));
  check('bucket 3 count 2 (v3 avoid + w1 converted-avoid wins over bucket 4)', st.buckets['gate-avoid-w4'] === 2, JSON.stringify(st.buckets));
  check('bucket 4 count 2 (v4 fromStash-bow + w2 crossbow lead)', st.buckets['converted-at-staging'] === 2, JSON.stringify(st.buckets));
  check('bucket 5 count 1 (died away)', st.buckets['died-away'] === 1, JSON.stringify(st.buckets));
  check('bucket 6 count 1 (plan never reached)', st.buckets['plan-never-reached'] === 1, JSON.stringify(st.buckets));
  check('bucket 7 count 3 (v7 autonomous + v10 superseded + v10 re-depart)', st.buckets['autonomous-no-w4'] === 3, JSON.stringify(st.buckets));
  check('bucket 8 count 1 (still away at end)', st.buckets['still-away-at-end'] === 1, JSON.stringify(st.buckets));
  check('bucket 9 count 1 (led w4 with no ranged weapon)', st.buckets.unattributed === 1, JSON.stringify(st.buckets));
  check('bucket counts sum to departures (13)', st.bucketSum === 13, 'sum ' + st.bucketSum);
  check('completeness 12/13', Math.abs(st.completeness - 12 / 13) < 1e-9, 'got ' + st.completeness);
  check('ledger reconciliation matches per seed (11/11 and 2/2)',
    st.reconciliation.length === 2 && st.reconciliation.every(function (r) { return r.match === true; }), JSON.stringify(st.reconciliation));
  check('converted x later w4 lead: 3 converted, 1 later bow lead (w2; w1 only avoided, v4 never fought)',
    st.xtabConvertedLead.converted === 3 && st.xtabConvertedLead.convertedLeadW4Any === 1, JSON.stringify(st.xtabConvertedLead));
  check('planW4 x meeting: 1 plan, 0 met; 12 no-plan, 6 met (v1 lead, v2 comp, v3 avoid, v9 lead, w1 avoid, w2 bow lead)',
    st.xtabPlanMeeting.planW4 === 1 && st.xtabPlanMeeting.planW4Met === 0 &&
    st.xtabPlanMeeting.noPlan === 12 && st.xtabPlanMeeting.noPlanMet === 6, JSON.stringify(st.xtabPlanMeeting));
  check('source x converted: noSource 0/10, fromStash 1/1, fromArmory 2/2',
    st.xtabSourceConverted.noSource.converted === 0 && st.xtabSourceConverted.noSource.n === 10 &&
    st.xtabSourceConverted.fromStash.converted === 1 && st.xtabSourceConverted.fromArmory.converted === 2,
    JSON.stringify(st.xtabSourceConverted));
  check('expedition fight waves while away: w1 1, w4 3',
    st.expFightWaves.w1 === 1 && (st.expFightWaves.w2 || 0) === 0 && st.expFightWaves.w4 === 3, JSON.stringify(st.expFightWaves));
  check('no window misses (every fight/avoid joined a departure)',
    st.windowMissLead === 0 && st.windowMissComp === 0 && st.windowMissAvoid === 0,
    JSON.stringify({ l: st.windowMissLead, c: st.windowMissComp, a: st.windowMissAvoid }));
  check('the h9-led fight is a no-departure lead (h9 departed with a bow), not a miss',
    st.noDepLead === 1 && st.noDepComp === 0 && st.noDepAvoid === 0,
    JSON.stringify({ l: st.noDepLead, c: st.noDepComp, a: st.noDepAvoid }));
  // Judge shapes.
  function mk(o) {
    return Object.assign({ departures: 12, bucketSum: 12, completeness: 1, buckets: { 'lead-w4-with-spear': 0, unattributed: 0 }, leadW4WithSpear: 0, errors: 0, valid: 8, n: 8, windowMissLead: 0, windowMissComp: 0, windowMissAvoid: 0 }, o);
  }
  let j = judgeSpear(mk({}));
  check('judge DIAG-GO on a complete ledger with zero leads', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judgeSpear(mk({ departures: 6, bucketSum: 6, completeness: 1 }));
  check('judge DIAG-NO-GO THIN-POOL when departures < 10', j.verdict === 'DIAG-NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judgeSpear(mk({ completeness: 0.75, buckets: { 'lead-w4-with-spear': 0, unattributed: 3 }, bucketSum: 12 }));
  check('judge DIAG-NO-GO ATTRIBUTION when completeness < 0.90', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION', JSON.stringify(j));
  j = judgeSpear(mk({ leadW4WithSpear: 1, buckets: { 'lead-w4-with-spear': 1, unattributed: 0 } }));
  check('judge DIAG-NO-GO LEAD-FOUND when a spear departure leads wave 4', j.verdict === 'DIAG-NO-GO' && j.kind === 'LEAD-FOUND', JSON.stringify(j));
  j = judgeSpear(mk({ errors: 2 }));
  check('judge DIAG-NO-GO INSTRUMENT when errors > 0', j.verdict === 'DIAG-NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  // Priority order, direct: a departure that is converted AND
  // gate-avoided AND led w4 with a spear lands in bucket 1.
  const prio = classifyDeparture(
    dep(99, 10, 'px', { source: 'fromStash', postRangedId: 'bow' }),
    { defs: defs, closeOut: 'returned',
      leadFights: [fight(301, 12, 'px', { wave: 4, rangedId: 'hunting_spear' })],
      compFightsSpear: [], compFightsAny: [],
      avoids: [{ day: 11, vid: 'px', result: 'avoid', wave: 4 }] });
  check('priority: spear lead beats avoid beats converted (bucket 1)', prio.bucket === 'lead-w4-with-spear', JSON.stringify(prio));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-spearlead-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-spearlead-a.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const st = spearStats(dir);
  const j = judgeSpear(st);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, summary: summarize(st),
    departures: st.departuresDetail };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars, summary: result.summary }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { spearStats: spearStats, judgeSpear: judgeSpear, classifyDeparture: classifyDeparture, assignDepartures: assignDepartures, weaponClass: weaponClass, ammoCapable: ammoCapable, loadDefs: loadDefs, loadWave4Ids: loadWave4Ids, BUCKETS: BUCKETS };
