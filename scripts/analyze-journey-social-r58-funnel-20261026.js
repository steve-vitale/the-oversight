#!/usr/bin/env node
// analyze-journey-social-r58-funnel-20261026.js -- RESIDUAL SPLIT v3 (BUILD TRACE) + CONVERSION BY ARM.
// r58: same-pick + inBuilt=false residual split by the driver build trace:
// cache (replyMenu identity) / thread-narrowed early returns (nonverbal,
// rumor, trade, hawk, closing, pendingQ, answers) / finalize drops /
// threadGuard / gated / freshCap / spent / unexplained. The r57 old-
// chain counts are kept verbatim for comparability; v3 fields are new.
// r55: the per-seed JSON persists the full t2picks list (carried) plus the
// r54 INBUILT probe field plus the r55 convoSawOthers probe flag, so a
// menu-problem turn splits into not-built vs built-but-paged as well as
// never-served / same-pick / changed-pick — and the genuine-miss count
// excludes CORRECT non-offers (convoSawOthers + served-same-pick: the
// convo already asked 'others', so askedTopics rightly excludes it).
// Genuine miss = menuProblem probe that is NOT (convoSawOthers AND
// served-same-pick). A convoSawOthers + served-changed-pick probe is
// still a genuine miss (the pick changed since serving, so the re-offer
// gate makes it fresh again).
// Carried note: the per-seed JSON persists the full t2picks list, so the
// funnel split can go finer than r52's menu-vs-pick split. For each saved
// subject-no-offer probe turn (menuProblem cases: a pick EXISTS right now
// but page 1 of the subject menu lacks 'ask:others'), classify WHY the
// menu lacks it, using the speaker's serving history from t2picksList:
//   - never-served: the speaker never had an 'others' serving before this
//     day -> 'others' was FRESH (never said) yet still not on page 1:
//     the freshCap exemption + pagination did not surface it.
//   - served-same-pick: last served pick == probe pick (same person+why)
//     -> 'others' was DISCUSSED and UNCHANGED: the subject menu excludes
//     discussed topics by design, so no menu fix scoped to fresh topics
//     can surface it. This is the discussed-exclusion blocker.
//   - served-changed-pick: last served pick != probe pick -> 'others' was
//     FRESH (re-offer gate: changed since served) yet still not on page 1:
//     pagination rank (topics sort last, page 1 holds ~5-6) buried it, or
//     the convo never paged. The menuMore flag separates those two:
//     menuMore=true means page 1 was full (pagination suspect);
//     menuMore=false means the menu was short and others still absent
//     (a genuine menu-construction gap, not pagination).
// Probe turns are capped at 200/seed in the per-seed JSON (driver slice),
// so counts here are a sample, not the full probe population — the split
// shares are the finding, not the absolute counts.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const EVIDIR = path.join(REPO, 'evidence', '2026-10-26', 'r58');

function main() {
  const out = { seeds: {}, pooled: {} };
  const cats = ['never-served', 'served-same-pick', 'served-changed-pick', 'no-pick', 'unknown-speaker'];
  for (const s of [5401, 5402, 5403, 5404]) {
    const r = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-social-r58-s${s}.json`), 'utf8'));
    const picks = r.t2picksList || [];
    // servings by speaker name, in day order
    const bySpeaker = {};
    for (const tp of picks) {
      (bySpeaker[tp.vidName] = bySpeaker[tp.vidName] || []).push(tp);
    }
    const probes = (r.funnelProbe && r.funnelProbe.probes) || [];
    const counts = Object.fromEntries(cats.map(c => [c, 0]));
    const inBuiltByCat = Object.fromEntries(cats.map(c => [c, { true: 0, false: 0, null: 0 }]));
    const sawByCat = Object.fromEntries(cats.map(c => [c, { true: 0, false: 0 }]));
    const changedMenuMore = { true: 0, false: 0 };
    const freshMenuMore = { true: 0, false: 0 };
    let genuineMiss = 0, correctNonOffer = 0;
    // r57 RESIDUAL SPLIT v2 (prereg + pre-seed correction): same-pick probes with inBuilt===false, split by
    // the new probe flags. questionOwned = a reactive/generic question
    // owns the menu (choosingSubject set, answers-only menu — CORRECT
    // non-offer). threadGuard = thread==='others' blocks the r54 re-list.
    // gated = 'others' not in topic2Asks at all. unexplained = the rest.
    const residual = { total: 0, pendingQAlone: 0, pagerOwns: 0, threadGuard: 0, gated: 0, freshCapped: 0, cacheSuspect: 0, unexplained: 0, memoFreshCappedBroad: 0, memoSpentOthers: 0, memoPagerBreakdown: {}, memoCacheHits: 0, memoOriginDiffers: 0, v3pendingQ: 0, v3closing: 0, v3nonverbal: 0, v3ambush: 0, v3invitation: 0, v3trade: 0, v3hawk: 0, v3rumor: 0, v3answers: 0, v3finalize: 0, v3threadGuard: 0, v3gated: 0, v3displacedParty: 0, v3displacedOther: 0, v3freshCap: 0, v3spent: 0, v3unexplained: 0, v3noTrace: 0, v3error: 0 };
    const v3ClassExamples = {};
    const v3Examples = [];
    const unexplainedByThread = {};
    let traceCount = 0;
    let flagsPresent = 0;
    const residualExamples = [];
    const examples = [];
    for (const pr of probes) {
      const pick = pr.pick;
      const ibKey = pr.inBuilt === true ? 'true' : pr.inBuilt === false ? 'false' : 'null';
      const saw = pr.convoSawOthers === true;
      if (('thread' in pr) && ('reactiveQ' in pr) && ('genericQ' in pr) && ('pendingQ' in pr) && ('inT2list' in pr) && ('r57' in pr)) flagsPresent++;
    if (pr.r58 && pr.r58.trace) traceCount++;
      if (!pick || !pick.id || pick.why === 'neutral') { counts['no-pick']++; inBuiltByCat['no-pick'][ibKey]++; sawByCat['no-pick'][String(saw)]++; continue; }
      const hist = bySpeaker[pr.name] || [];
      const prior = hist.filter(tp => (tp.day || 0) < (pr.day || 0));
      if (!prior.length) {
        counts['never-served']++; inBuiltByCat['never-served'][ibKey]++; sawByCat['never-served'][String(saw)]++;
        genuineMiss++;
        freshMenuMore[String(!!pr.menuMore)]++;
        if (examples.filter(e => e.cat === 'never-served').length < 3)
          examples.push({ cat: 'never-served', seed: s, day: pr.day, speaker: pr.name, pick: pick.id + '/' + pick.why, menuMore: !!pr.menuMore, freshTopics: pr.freshTopics, convoSawOthers: saw });
        continue;
      }
      const last = prior[prior.length - 1];
      // probe pick id is a villager id; last.id is also an id — compare raw ids.
      if (String(last.id) === String(pick.id) && String(last.why) === String(pick.why)) {
        counts['served-same-pick']++; inBuiltByCat['served-same-pick'][ibKey]++; sawByCat['served-same-pick'][String(saw)]++;
        if (saw) correctNonOffer++; else genuineMiss++;
        if (ibKey === 'false') {
          residual.total++;
          const r57 = pr.r57 || {};
          if (r57.spentOthers) residual.memoSpentOthers++;
          if (r57.pagerOwns && r57.pagerOwns !== 'none') residual.memoPagerBreakdown[r57.pagerOwns] = (residual.memoPagerBreakdown[r57.pagerOwns] || 0) + 1;
          if (r57.othersFresh && r57.freshBeforeOthers != null && r57.topicCapMood != null && r57.freshBeforeOthers >= r57.topicCapMood) residual.memoFreshCappedBroad++;
          if (r57.pendingQAlone) residual.pendingQAlone++;
          else if (r57.pagerOwns && r57.pagerOwns !== 'none') residual.pagerOwns++;
          else if (pr.thread === 'others') residual.threadGuard++;
          else if (pr.inT2list === false) residual.gated++;
          else if (r57.othersFresh && r57.topicCapMood === 1 && r57.freshBeforeOthers != null && r57.freshBeforeOthers >= 1) residual.freshCapped++;
          else if (r57.prevMenuSame) residual.cacheSuspect++;
          else {
            residual.unexplained++;
            if (residualExamples.length < 5) residualExamples.push({ seed: s, day: pr.day, speaker: pr.name, pick: pick.id + '/' + pick.why, thread: pr.thread, reactiveQ: pr.reactiveQ, genericQ: pr.genericQ, pendingQ: pr.pendingQ, inT2list: pr.inT2list, menuMore: !!pr.menuMore, freshTopics: pr.freshTopics, convoSawOthers: saw, r57 });
          }
          // r58 V3 TRACE CLASSIFICATION (independent of the old chain):
          // path from the build record for the convoChoices call that
          // built the probed menu. Cache first: a cached menu is not
          // this turn's state at all. Early returns next (all fire
          // even when choosingSubject is true); finalize drops next;
          // then the r57 classes in r57 order.
          const r58 = pr.r58 || {};
          const tb = r58.trace;
          const builds = Array.isArray(tb) ? tb : (tb ? [tb] : []);
          const b = builds.length ? builds[builds.length - 1] : null;
          // Cache is memo-only, NOT a path: in driver flow the top
          // call always re-serves the handler's menu, so a cache hit
          // is the normal observation, not staleness. Staleness would
          // need the origin build's entry to differ from this turn's
          // entry on recorded fields (key fields are identical by
          // cache-key construction) -- counted as memoOriginDiffers.
          // Finalize evidence comes from the origin build on cache
          // hits (cache builds skip finalize by construction).
          if (b && b.cacheHit) {
            residual.memoCacheHits++;
            if (b.origin && JSON.stringify(b.origin.entry || {}) !== JSON.stringify(b.entry || {})) residual.memoOriginDiffers++;
          }
          // v3 order: owns-filters first (convoMenuPage drops
          // non-matching ids from the full list whatever the base
          // built), then base-side exclusions, then finalize drops,
          // then WRAPPER DISPLACEMENT (base built 'others' but the
          // post-wrapper full list lacks it -- inBuilt===false by
          // population, so baseHasOthers here proves displacement),
          // then the cap/spent tails.
          let v3path = 'noTrace';
          if (b) {
            const e = b.entry || {};
            const fin = b.cacheHit ? (b.origin && b.origin.finalize) : b.finalize;
            const baseHasOthers = !!b.hasOthers;
            if (b.error) v3path = 'error';
            else if (e.pendingQ) v3path = 'pendingQ';
            else if (e.windingDown || e.spokenBeatTag === 'closing') v3path = 'closing';
            else if (e.thread === 'nonverbal') v3path = 'nonverbal';
            else if (e.thread === 'ambush') v3path = 'ambush';
            else if (r57.invitationBeat) v3path = 'invitation';
            else if (e.thread === 'trade' && e.pendingTrade) v3path = 'trade';
            else if (e.pendingHawk) v3path = 'hawk';
            else if (e.thread === 'spread_rumor' && !e.rumorDone) v3path = 'rumor';
            else if (e.reactiveDef || e.gqActive) v3path = 'answers';
            else if (e.thread === 'others') v3path = 'threadGuard';
            else if (pr.inT2list === false) v3path = 'gated';
            else if (fin && fin.inHasOthers && !fin.outHasOthers) v3path = 'finalize';
            else if (baseHasOthers) v3path = (r58.inParty === true) ? 'displacedParty' : 'displacedOther';
            else if (r57.othersFresh && r57.topicCapMood === 1 && r57.freshBeforeOthers != null && r57.freshBeforeOthers >= 1) v3path = 'freshCap';
            else if (r57.spentOthers) v3path = 'spent';
            else v3path = 'unexplained';
          }
          const v3key = 'v3' + v3path;
          if (v3key in residual) residual[v3key]++;
          if (v3path === 'unexplained') {
            unexplainedByThread[String(pr.thread)] = (unexplainedByThread[String(pr.thread)] || 0) + 1;
            if (v3Examples.length < 5) v3Examples.push({ seed: s, day: pr.day, speaker: pr.name, pick: pick.id + '/' + pick.why, thread: pr.thread, inT2list: pr.inT2list, buildsThisCall: r58.buildsThisCall, inFresh: r58.inFresh, inDiscussed: r58.inDiscussed, saidCount: r58.saidCount, t2otherServed: r58.t2otherServed, othersChanged: r58.othersChanged, trace: b });
          } else if (!(v3path in v3ClassExamples)) {
            v3ClassExamples[v3path] = { seed: s, day: pr.day, speaker: pr.name, pick: pick.id + '/' + pick.why, thread: pr.thread, buildsThisCall: r58.buildsThisCall, entry: b ? b.entry : null, finalize: b ? b.finalize : null, cacheHit: b ? b.cacheHit : null, origin: b ? b.origin : null, baseIds: b ? b.offeredIds : null, baseHasOthers: b ? b.hasOthers : null, fullIds: r58.fullIds, deliveredIds: r58.delivered ? r58.delivered.ids : null, inParty: r58.inParty };
          }
        }
      } else {
        counts['served-changed-pick']++; inBuiltByCat['served-changed-pick'][ibKey]++; sawByCat['served-changed-pick'][String(saw)]++;
        genuineMiss++;
        changedMenuMore[String(!!pr.menuMore)]++;
        if (examples.filter(e => e.cat === 'served-changed-pick').length < 3)
          examples.push({ cat: 'served-changed-pick', seed: s, day: pr.day, speaker: pr.name, lastServed: last.idName + '/' + last.why + ' d' + last.day, probePick: pick.id + '/' + pick.why, menuMore: !!pr.menuMore, freshTopics: pr.freshTopics, convoSawOthers: saw });
      }
    }
    out.seeds[s] = { probes: probes.length, counts, inBuiltByCat, sawByCat, genuineMiss, correctNonOffer, changedMenuMore, freshMenuMore, examples, residual, residualExamples, v3ClassExamples, v3Examples, unexplainedByThread, traceCoverage: probes.length ? traceCount / probes.length : null, traceCount, flagsPresent, flagCoverage: probes.length ? flagsPresent / probes.length : null };
  }
  const pooled = Object.fromEntries(cats.map(c => [c, 0]));
  for (const s of Object.keys(out.seeds)) for (const c of cats) pooled[c] += out.seeds[s].counts[c];
  out.pooled = pooled;
  const menuProblem = pooled['never-served'] + pooled['served-same-pick'] + pooled['served-changed-pick'];
  out.pooledMenuProblem = menuProblem;
  out.pooledShares = Object.fromEntries(Object.entries(pooled).map(([k, v]) => [k, menuProblem ? (v / menuProblem) : null]));
  out.pooledGenuineMiss = Object.values(out.seeds).reduce((a, x) => a + x.genuineMiss, 0);
  out.pooledCorrectNonOffer = Object.values(out.seeds).reduce((a, x) => a + x.correctNonOffer, 0);
  out.pooledResidual = Object.values(out.seeds).reduce((a, x) => {
    for (const k of Object.keys(a)) a[k] += (x.residual[k] || 0);
    return a;
  }, { total: 0, pendingQAlone: 0, pagerOwns: 0, threadGuard: 0, gated: 0, freshCapped: 0, cacheSuspect: 0, unexplained: 0, memoFreshCappedBroad: 0, memoSpentOthers: 0, memoCacheHits: 0, memoOriginDiffers: 0, v3pendingQ: 0, v3closing: 0, v3nonverbal: 0, v3ambush: 0, v3invitation: 0, v3trade: 0, v3hawk: 0, v3rumor: 0, v3answers: 0, v3finalize: 0, v3threadGuard: 0, v3gated: 0, v3displacedParty: 0, v3displacedOther: 0, v3freshCap: 0, v3spent: 0, v3unexplained: 0, v3noTrace: 0, v3error: 0 });
  out.pooledResidualShares = Object.fromEntries(Object.entries(out.pooledResidual).filter(([k]) => k !== 'total').map(([k, v]) => [k, out.pooledResidual.total ? v / out.pooledResidual.total : null]));
  const totProbes = Object.values(out.seeds).reduce((a, x) => a + x.probes, 0);
  const totFlags = Object.values(out.seeds).reduce((a, x) => a + x.flagsPresent, 0);
  out.pooledFlagCoverage = totProbes ? totFlags / totProbes : null;
  // r55 MENU SPLIT from the verdicts file (funnelUnsteered per seed).
  try {
    const verd = JSON.parse(fs.readFileSync(path.join(EVIDIR, 'r58-verdicts.json'), 'utf8'));
    const menu = { perSeed: {}, pooled: { totalNaturalUnsteered: 0, subjectNoOffer: 0, offered: 0, mainOffered: 0, subjectOffered: 0, picked: 0, latePicks: 0, latePicksMain: 0, latePicksSubject: 0 } };
    for (const v of verd) {
      const fu = v.funnelUnsteered || {};
      menu.perSeed[v.seed] = { arm: v.arm || null, lingerPicks: v.lingerPicks || 0, totalNaturalUnsteered: fu.totalNaturalUnsteered, subjectNoOffer: fu.subjectNoOffer, subjectNoOfferRate: fu.subjectNoOfferRate, offered: fu.offered, mainOffered: fu.mainOffered, subjectOffered: fu.subjectOffered, picked: fu.picked, latePicks: fu.latePicks, latePicksMain: fu.latePicksMain, latePicksSubject: fu.latePicksSubject, classes: fu.classes || null };
      for (const k of Object.keys(menu.pooled)) menu.pooled[k] += (fu[k] || 0);
    }
    // r56 CONVERSION BY ARM: unsteered picks per unsteered offer, plus the
    // fresh-ish ceiling (offered minus offered-not-fresh re-offer class;
    // capped convos may include some re-offers, so the ceiling is an
    // approximation, labeled as such).
    const byArm = {};
    for (const v of verd) {
      const fu = v.funnelUnsteered || {};
      const a = v.arm || 'unknown';
      const e = (byArm[a] = byArm[a] || { seeds: 0, offered: 0, picked: 0, latePicks: 0, offeredNotFresh: 0 });
      e.seeds++;
      e.offered += (fu.offered || 0);
      e.picked += (fu.picked || 0);
      e.latePicks += (fu.latePicks || 0);
      e.offeredNotFresh += ((fu.classes || {})['offered-not-fresh'] || 0);
    }
    for (const a of Object.keys(byArm)) {
      const e = byArm[a];
      e.conversion = e.offered ? e.picked / e.offered : null;
      e.freshCeilingDenom = e.offered - e.offeredNotFresh;
      e.conversionFreshCeiling = e.freshCeilingDenom > 0 ? e.picked / e.freshCeilingDenom : null;
    }
    menu.byArm = byArm;
    menu.pooled.subjectNoOfferRate = menu.pooled.totalNaturalUnsteered ? menu.pooled.subjectNoOffer / menu.pooled.totalNaturalUnsteered : null;
    out.menuSplit = menu;
  } catch (e) { out.menuSplit = { error: 'r56-verdicts.json unreadable: ' + (e && e.message) }; }
  console.log(JSON.stringify(out, null, 1));
}
main();
