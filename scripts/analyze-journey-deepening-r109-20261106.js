// analyze-journey-deepening-r109-20261106.js -- R109 STANDING-TRACE + BETRAYAL-SITTING + FOLLOW-UP + PROMISE-KEEP + VILLAGER-GOALS analyzer
// (tooling only, zero game code). Reads per-seed JSONs written by
// scripts/journey-deepening-r109-20261106.js and reports the
// pre-registered S-TRACE verdict + P-DIST-LL + B-SIT betrayal scan, with K-CONTEXT carried
// from the r92 analyzer's summarizeSeed (same pre-collapse rule:
// last deedLog entry with pop > 0, never a post-collapse snapshot).
//
// R109 additions (pre-registered in the r109 prereg): RE-ASK class in
// classifyPromiseThreads (adopted from the r108 metric review) +
// RE-ASK-ORPHAN scan + FIZZLE-WATCH dry-line scan (classifyDryLines).
// The R108 P-KEEP revision stands as the rule; the r108 analyzer's
// comments below describe it.
//
// R108 P-KEEP revision (pre-registered in the r108 prereg, per the r107
// metric review): NAMED-STRUCTURAL now requires a repay-opener line in
// the later sitting's THEM lines (the repay opener/stale-opener
// vocabulary, verified in src/js/convo-wants.js), not just a `want:
// repay` line. Maeve's r107 day-60 sitting proved the want can be
// selected without the promise ever surfacing. The old want-only rule
// is still computed and reported alongside as structHitOld, so the
// r105–r107 comparability is preserved. Verdict counts NAMED +
// NAMED-STRUCTURAL-revised. The old r100 regex is still computed and
// reported alongside as oldNamed.
//
// R108 RAJ-PHOTO watch (r107 watch item): curious-opener sittings that
// end in a betrayal decline with an unestablished resolution — the plant
// is abandoned unless a later sitting with the same villager returns to
// the planted content. Descriptive only, no verdict.
//
// Verdict classes (see prereg):
//   EXPLAINED — every regional-at-zero day is arithmetically clean
//     (war/diplomacy/plenty all 0) and no deed checkpoint shows a
//     seasoned link beside a gated 0.
//   NEEDS-POLITY-CHECK — a deed checkpoint shows a seasoned link
//     beside a gated 0. NOT a bug claim: diplomacy additionally
//     requires regional-plus polity participation, which linkSnap
//     does not record — the next step is a polity read, not a fix.
//   ARITHMETIC-BUG — a trace day reports a positive component
//     (war/diplomacy/plenty) yet a total of 0, or a gated 0 beside
//     positive components. That would be a real bug.
//   NO-REGIONAL-DAYS — the seed never read regional (nothing to judge).
//
// Usage: node scripts/analyze-journey-deepening-r109-20261106.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports summarizeStanding, distStats, median.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-06');
const { summarizeSeed } = require('./analyze-journey-deepening-r92-20261104.js');

function median(xs) {
  const v = (xs || []).filter(x => x != null && isFinite(x)).slice().sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

function distStats(xs) {
  const v = (xs || []).filter(x => x != null && isFinite(x)).slice().sort((a, b) => a - b);
  if (!v.length) return { n: 0, list: [], median: null, min: null, max: null };
  return { n: v.length, list: v, median: median(v), min: v[0], max: v[v.length - 1] };
}

function summarizeStanding(s) {
  const trace = (s && s.standingTrace) || [];
  const deed = (s && s.deedLog) || [];
  let lastLiving = null;
  for (const d of deed) { if (d && (d.pop || 0) > 0) lastLiving = d; }
  const regional = trace.filter(t => t && t.scale === 'regional');
  const firstRegional = regional[0] || null;
  const firstPos = trace.find(t => t && (t.standing || 0) > 0) || null;
  const regionalZero = regional.filter(t => (t.standing || 0) === 0);
  let maxStanding = null;
  for (const t of trace) { if (t && t.standing != null && (maxStanding == null || t.standing > maxStanding)) maxStanding = t.standing; }
  // Arithmetic check: any positive component beside a zero total?
  let arithBug = null;
  for (const t of trace) {
    if (!t) continue;
    const comp = (t.war || 0) + (t.diplomacy || 0) + (t.plenty || 0);
    if ((t.standing || 0) === 0 && comp > 0) { arithBug = { day: t.day, war: t.war, diplomacy: t.diplomacy, plenty: t.plenty }; break; }
  }
  // Seasoned link beside a gated regional zero?
  let seasonedBesideZero = null;
  for (const d of deed) {
    if (!d || d.scale !== 'regional' || (d.standingTotal || 0) !== 0) continue;
    const seasoned = (d.links || []).filter(l => l && l.seasoned);
    if (seasoned.length) { seasonedBesideZero = { day: d.day, links: seasoned.map(l => ({ other: l.other, age: l.age, trust: l.trust, status: l.status })) }; break; }
  }
  let verdict;
  if (arithBug) verdict = 'ARITHMETIC-BUG';
  else if (!regional.length) verdict = 'NO-REGIONAL-DAYS';
  else if (seasonedBesideZero) verdict = 'NEEDS-POLITY-CHECK';
  else verdict = 'EXPLAINED';
  const llc = (s && s.lastLivingCensus) || null;
  return {
    traceDays: trace.length,
    firstRegionalDay: firstRegional ? firstRegional.day : null,
    standingAtFirstRegional: firstRegional ? { total: firstRegional.standing, war: firstRegional.war, diplomacy: firstRegional.diplomacy, plenty: firstRegional.plenty, warPts: firstRegional.warPts, links: firstRegional.links, feasts: firstRegional.feasts } : null,
    firstPositiveDay: firstPos ? firstPos.day : null,
    regionalDays: regional.length, regionalZeroDays: regionalZero.length,
    maxStanding,
    arithBug, seasonedBesideZero, verdict,
    lastLivingDeed: lastLiving ? { day: lastLiving.day, standingTotal: lastLiving.standingTotal, scale: lastLiving.scale, pop: lastLiving.pop, links: (lastLiving.links || []).map(l => ({ other: l.other, age: l.age, trust: l.trust, seasoned: !!l.seasoned, status: l.status })) } : null,
    lastLivingCensus: llc ? { day: llc.day, pop: llc.pop, plants: distStats(llc.plants) } : null,
  };
}

// R94 B-SIT scan: parse one r95 transcript file's text. A sitting is a
// betrayal sitting if any offered menu contains betrayal:accept; the
// branch is the first betrayal:accept/decline pick (or 'none' when the
// sitting left without answering, as in r93).
function scanBetrayalTranscript(text) {
  const lines = String(text || '').split('\n');
  let offered = false, branch = 'none', youCount = 0, wantFinal = null, repeats = false;
  for (const l of lines) {
    if (l.indexOf('betrayal:accept') !== -1 && l.indexOf('(offered=') !== -1) offered = true;
    const you = /^YOU: \[(betrayal:accept|betrayal:decline)\]/.exec(l);
    if (you && branch === 'none') branch = you[1] === 'betrayal:accept' ? 'accept' : 'decline';
    if (l.indexOf('YOU: ') === 0) youCount++;
    const wf = /^want final: id=(.*) stage=(\d+) resolution=(.*)$/.exec(l);
    if (wf) wantFinal = { id: wf[1], stage: Number(wf[2]), resolution: wf[3] };
    if (l.indexOf('!! VERBATIM REPEATS:') === 0) repeats = true;
  }
  return { betrayal: offered, branch, youCount, wantFinal, repeats };
}


// R100 P-KEEP scan (revised in R105 per the r104 metric review; R106
// seeds the death lookup per the r105 metric review; REVISED in R108 per
// the r107 metric review): a promise thread opens when a sitting ends with
// `want final: resolution=promised`. Later sittings with the SAME
// villager are scanned on THEM lines only (YOU lines excluded - the
// picker naming a promise is not the villager remembering it) for
// debt/promise wording. Classification order: a later sitting exists
// -> NAMED if any later THEM line matches the revised regex, else
// NAMED-STRUCTURAL if any later sitting's `want: ` line is `repay` AND
// a THEM line of that sitting matches a repay-opener phrase (the r108
// revision — the want alone over-counts: Maeve's r107 sitting selected
// repay but never surfaced the promise), else SILENT; no later
// sitting -> DEAD if the seed death log names the villager after the
// thread day, else NO-LATER-SITTING. The old r100 regex is computed in
// parallel and reported as oldNamed, for comparability with r103/r104.
// The old want-only structural rule is computed in parallel and reported
// as structOld, for comparability with r105–r107.
const PROMISE_MENTION_OLD = /promis|missed|debt|\bowe\b|owed|forget it/i;
const PROMISE_MENTION = /promis|missed|debt|\bowe\b|owed|forget it|forgot|turning it over|still on my mind|had a chance|keep thinking|coming back to it/i;
// Repay-opener phrases (src/js/convo-wants.js, repay opener + staleOpener
// pools, verified 2026-11-06): fresh opener cycle + favor-aware branches
// + stale branches. {short} varies per favor so the phrases are matched
// without it.
const REPAY_OPENER = /you came through on|you said you'd help with|have you had a chance|been thinking about what you promised|haven't forgotten what you said you'd do|keep thinking about what you did|still owe you the thanks|keep turning it over|still on my mind|keep coming back to it/i;
function scanPromiseTranscript(text) {
  const lines = String(text || '').split('\n');
  let wantFinal = null, wantLine = null;
  const them = [];
  for (const l of lines) {
    const wf = /^want final: id=(.*) stage=(\d+) resolution=(.*)$/.exec(l);
    if (wf) wantFinal = { id: wf[1], stage: Number(wf[2]), resolution: wf[3] };
    if (!wantLine && l.indexOf('want: ') === 0) wantLine = l;
    if (l.indexOf('THEM: ') === 0 || l.indexOf('closing line: ') === 0) them.push(l);
  }
  return { wantFinal, wantLine, them };
}
// R109 RE-ASK (adopted from the r108 metric review): a later sitting
// whose opener re-states the same favor's need. The re-ask opener is the
// single line in src/js/convo-wants.js:1966: "About {short} — the need
// hasn't gone anywhere. I'm still asking." A thread scores RE-ASK when a
// later sitting's THEM line matches it AND the extracted favor short
// appears in the thread-opening sitting's THEM lines (the short
// re-appears — Chloe r108: "the food I needed" in the day-45 opener,
// re-asked day 60). Classification order: NAMED > NAMED-STRUCTURAL >
// RE-ASK > SILENT. A re-ask opener whose short appears in NO earlier
// sitting with that villager is a RE-ASK-ORPHAN (separate scan below —
// a re-ask without a thread).
const REASK_OPENER = /about (.+?) — the need hasn't gone anywhere\. i'm still asking/i;
function scanReaskOrphans(transcripts) {
  const orphans = [];
  const bySeedVid = {};
  for (const t of transcripts) {
    const key = t.seed + '|' + t.vid;
    (bySeedVid[key] = bySeedVid[key] || []).push(t);
  }
  for (const t of transcripts) {
    const them = t.text.split('\n').filter(l => l.indexOf('THEM: ') === 0);
    for (const l of them) {
      const m = REASK_OPENER.exec(l);
      if (!m) continue;
      const short = m[1].trim();
      const earlier = (bySeedVid[t.seed + '|' + t.vid] || []).filter(x => x.day < t.day);
      const seen = earlier.some(x => x.text.split('\n').filter(y => y.indexOf('THEM: ') === 0).some(y => y.toLowerCase().includes(short.toLowerCase())));
      if (!seen) orphans.push({ seed: t.seed, day: t.day, vid: t.vid, short, line: l.slice(0, 200) });
    }
  }
  return orphans;
}
function classifyPromiseThreads(transcripts, deaths) {
  // transcripts: [{seed, day, vid, text}] sorted by (seed, day, file).
  const threads = [];
  const bySeedVid = {};
  for (const t of transcripts) {
    const key = t.seed + '|' + t.vid;
    (bySeedVid[key] = bySeedVid[key] || []).push(t);
  }
  for (const t of transcripts) {
    const sc = scanPromiseTranscript(t.text);
    if (!sc.wantFinal || sc.wantFinal.resolution !== 'promised') continue;
    const later = (bySeedVid[t.seed + '|' + t.vid] || []).filter(x => x.day > t.day);
    let cls, evidence = null, oldNamed = false, structOld = false, reAskHit = null;
    if (later.length) {
      let hit = null, repayHit = null, structHit = null, structHitOld = null, oldHit = null;
      const openThem = scanPromiseTranscript(t.text).them;
      for (const lt of later) {
        const sc2 = scanPromiseTranscript(lt.text);
        const line = sc2.them.find(l => PROMISE_MENTION.test(l));
        if (line && !hit) hit = { day: lt.day, line: line.slice(0, 200) };
        // R108 post-panel (disclosed): the NAMED evidence must cite a line
        // that actually names the promise. The first regex hit can be a
        // philosophical musing that merely contains "forgot" (r108 Colin
        // day 60: "an experiment someone forgot to label"), while the
        // sitting genuinely names the promise later ("You came through on
        // the sickness I'm fighting"). Prefer a repay-opener line as the
        // evidence; fall back to the first regex hit. Classification is
        // unchanged — only the cited line moves.
        const rline = sc2.them.find(l => REPAY_OPENER.test(l));
        if (rline && !repayHit) repayHit = { day: lt.day, line: rline.slice(0, 200) };
        const oldLine = sc2.them.find(l => PROMISE_MENTION_OLD.test(l));
        if (oldLine && !oldHit) { oldHit = { day: lt.day, line: oldLine.slice(0, 200) }; oldNamed = true; }
        if (sc2.wantLine && /^want: repay\b/.test(sc2.wantLine)) {
          // Old rule (r105–r107): want line alone counts.
          if (!structHitOld) { structHitOld = { day: lt.day, wantLine: sc2.wantLine, opener: (sc2.them[0] || '').slice(0, 200) }; structOld = true; }
          // Revised rule (r108): the want must actually surface — a THEM
          // line of the same sitting must carry a repay-opener phrase.
          if (!structHit) {
            const openerLine = sc2.them.find(l => REPAY_OPENER.test(l));
            if (openerLine) structHit = { day: lt.day, wantLine: sc2.wantLine, opener: openerLine.slice(0, 200) };
          }
        }
        if (hit && repayHit && structHit && structHitOld && oldHit && reAskHit) break;
        // R109 RE-ASK: a later sitting re-opening the same favor's need.
        if (!reAskHit) {
          const reLine = sc2.them.find(l => REASK_OPENER.test(l));
          if (reLine) {
            const rm = REASK_OPENER.exec(reLine);
            const short = rm ? rm[1].trim() : null;
            if (short && openThem.some(l => l.toLowerCase().includes(short.toLowerCase()))) {
              reAskHit = { day: lt.day, short, line: reLine.slice(0, 200) };
            }
          }
        }
      }
      if (hit) { cls = 'NAMED'; evidence = repayHit || hit; }
      else if (structHit) { cls = 'NAMED-STRUCTURAL'; evidence = structHit; }
      else if (reAskHit) { cls = 'RE-ASK'; evidence = reAskHit; }
      else { cls = 'SILENT'; evidence = null; }
    } else if ((deaths || []).some(d => d && String(d.who) === String(t.vid) && String(d.seed) === String(t.seed) && (d.day || 0) > t.day)) {
      cls = 'DEAD';
    } else {
      cls = 'NO-LATER-SITTING';
    }
    threads.push({ seed: t.seed, day: t.day, vid: t.vid, wantId: sc.wantFinal.id, cls, evidence, oldNamed, structOld, reAsk: !!reAskHit, laterDays: later.map(x => x.day) });
  }
  return threads;
}

// R107 D-THING scan (r95 open item; the r106 count method could not separate
// "never comes back" from "no later sitting existed" — every pocketed thread
// that panel was a last-sitting case). A pocketed thread opens on a sitting
// whose THEM lines contain the decline line 'A small thing, pocketed.'
// A thread is TESTABLE only when a later sitting with the same villager
// exists in the same seed (transcript files prove it); it is MENTIONED
// when a later sitting's THEM lines name "that small thing" (the r107
// `pocketed` want's opener/stale lines) or its want line is `pocketed`.
// The decline line itself says "A small thing" (no "that"), so the mention
// regex cannot match the thread's own sitting.
const POCKETED_DECLINE = /A small thing, pocketed\./;
const POCKETED_MENTION = /that small thing/i;
function classifyPocketedThreads(transcripts) {
  // transcripts: [{seed, day, vid, text}] sorted by (seed, day, file).
  const threads = [];
  const bySeedVid = {};
  for (const t of transcripts) {
    const key = t.seed + '|' + t.vid;
    (bySeedVid[key] = bySeedVid[key] || []).push(t);
  }
  for (const t of transcripts) {
    if (!POCKETED_DECLINE.test(t.text)) continue;
    const later = (bySeedVid[t.seed + '|' + t.vid] || []).filter(x => x.day > t.day);
    let mentioned = null;
    for (const lt of later) {
      const wantLine = (lt.text.split('\n').find(l => l.indexOf('want: ') === 0) || '');
      const themLines = lt.text.split('\n').filter(l => l.indexOf('THEM: ') === 0);
      const hit = themLines.find(l => POCKETED_MENTION.test(l));
      if (/^want: pocketed\b/.test(wantLine) || hit) {
        mentioned = { day: lt.day, wantLine: wantLine || null, line: (hit || '').slice(0, 200) };
        break;
      }
    }
    threads.push({
      seed: t.seed, day: t.day, vid: t.vid,
      testable: later.length > 0, mentioned: !!mentioned,
      laterDays: later.map(x => x.day), evidence: mentioned,
    });
  }
  return threads;
}

// R108 RAJ-PHOTO watch (r107 watch item): a curious plant is abandoned
// when a curious-opener sitting ends in a betrayal decline and the want
// never resolves. A plant opens when a sitting has `want: curious`, its
// first THEM line is a personal-revelation opener ("Can I tell you
// something? ..."), the sitting contains a betrayal:decline pick, and
// the want final resolution is unestablished or none. It is TESTABLE
// only when a later sitting with the same villager exists; it is
// RETURNED when a later sitting's THEM lines name the planted content
// (the r107 exemplar: a photo of someone left behind). Descriptive
// only — no verdict, no fix.
const CURIOUS_OPENER = /can i tell you something/i;
const PLANT_RETURN = /photo|left behind|that photo|told you about/i;
function classifyCuriousPlants(transcripts) {
  // transcripts: [{seed, day, vid, text}] sorted by (seed, day, file).
  const plants = [];
  const bySeedVid = {};
  for (const t of transcripts) {
    const key = t.seed + '|' + t.vid;
    (bySeedVid[key] = bySeedVid[key] || []).push(t);
  }
  for (const t of transcripts) {
    const sc = scanPromiseTranscript(t.text);
    if (!sc.wantLine || !/^want: curious\b/.test(sc.wantLine)) continue;
    const themLines = t.text.split('\n').filter(l => l.indexOf('THEM: ') === 0);
    if (!themLines.length || !CURIOUS_OPENER.test(themLines[0])) continue;
    if (!/^\s*YOU: \[betrayal:decline\]/m.test(t.text)) continue;
    const wf = sc.wantFinal;
    if (!wf || (wf.resolution !== 'unestablished' && wf.resolution !== 'none')) continue;
    const later = (bySeedVid[t.seed + '|' + t.vid] || []).filter(x => x.day > t.day);
    let returned = null;
    for (const lt of later) {
      const hit = lt.text.split('\n').filter(l => l.indexOf('THEM: ') === 0).find(l => PLANT_RETURN.test(l));
      if (hit) { returned = { day: lt.day, line: hit.slice(0, 200) }; break; }
    }
    plants.push({
      seed: t.seed, day: t.day, vid: t.vid,
      opener: themLines[0].slice(0, 200),
      testable: later.length > 0, returned: !!returned,
      laterDays: later.map(x => x.day), evidence: returned,
    });
  }
  return plants;
}

// R109 FIZZLE-WATCH: the dry line "...Sorry, lost my train of thought."
// must not appear in ask_favor sittings after the r146 FIZZLE-FIX (favor
// asks name the live need instead of drying). Every transcript is scanned;
// hits are tagged by the sitting's want id so the verdict can separate
// ask_favor fizzles (the fix's target) from dry lines elsewhere (the dry
// pool is a legitimate ledger fallback in other slots). A dry line inside
// an ask_favor sitting is investigated by slot before any claim — a
// deflection-slot dry line is not the fizzle the fix targeted.
const DRY_LINE = /lost my train of thought/i;
function classifyDryLines(transcripts) {
  const hits = [];
  for (const t of transcripts) {
    const lines = String(t.text || '').split('\n');
    const wantLine = lines.find(l => l.indexOf('want: ') === 0) || '';
    const m = /^want: ([a-z_]+)/.exec(wantLine);
    const wantId = m ? m[1] : '?';
    const dry = lines.filter(l => DRY_LINE.test(l));
    if (dry.length) hits.push({ seed: t.seed, day: t.day, vid: t.vid, wantId, dryLines: dry.length, lines: dry.map(l => l.slice(0, 200)) });
  }
  return hits;
}

// R103 G-scan (carried in r104): villager goals in the deepening window, from goalSnaps.
// Per sample day: assigned = stored top non-null; nonzeroW = top weight
// > 0; active = objective kind not idle and state not done/returning;
// annotated = active with objGoal non-null; mismatched = annotated
// whose kind is NOT in the goal's kind set (fresh picks are coherent by
// construction, so a mismatch is stale-carry evidence or a post-pick
// kind mutation — see prereg amendment #1). Stale = done/returning/
// idle objective still carrying an objGoal (reported, never counted).
// Stick = villagers present in every sample day of the seed whose stored
// top is identical across all of them.
const GOAL_KINDS_G = {
  party_up: ['VISIT'], gear_up: ['FORAGE', 'TRAPS'], bank_veterans: ['HUNT'],
  build_standing: ['VISIT'], food_security: ['FORAGE', 'WATER', 'HAUL'],
  bonds: ['VISIT', 'HAVEN_CHORE'], knowledge: ['SEEK'], safety: ['HAVEN_CHORE'],
};
function summarizeGoals(s) {
  const snaps = (s && s.goalSnaps) || [];
  const days = snaps.map(sn => {
    const vs = sn.villagers || [];
    const active = vs.filter(v => v.objKind && v.objKind !== 'idle' && v.objState !== 'done' && v.objState !== 'returning');
    const annotated = active.filter(v => v.objGoal);
    const mismatched = annotated.filter(v => !(GOAL_KINDS_G[v.objGoal] || []).includes(v.objKind));
    // R103 analyzer correction (post-panel, disclosed in the run note):
    // a RETURNING objective legitimately carries its pick's goal home —
    // it is not stale. Stale is done/idle only; returning gets its own
    // bucket. This moves exactly one main-panel item (94104 day 45
    // Kelsey, VISIT returning) out of the stale count.
    const stale = vs.filter(v => (!v.objKind || v.objKind === 'idle' || v.objState === 'done') && v.objGoal);
    const returning = vs.filter(v => v.objState === 'returning' && v.objGoal);
    const tops = {};
    for (const v of vs) if (v.top) tops[v.top] = (tops[v.top] || 0) + 1;
    const nonzeroW = vs.filter(v => v.top && v.weights && (v.weights[v.top] || 0) > 0).length;
    return {
      day: sn.day, n: vs.length,
      assigned: vs.filter(v => !!v.top).length, nonzeroW,
      active: active.length, annotated: annotated.length,
      mismatched: mismatched.length,
      mismatchDetail: mismatched.map(v => ({ name: v.name, top: v.top, objKind: v.objKind, objGoal: v.objGoal })),
      stale: stale.length,
      staleDetail: stale.map(v => ({ name: v.name, objKind: v.objKind, objState: v.objState, objGoal: v.objGoal })),
      returning: returning.length,
      returningDetail: returning.map(v => ({ name: v.name, objKind: v.objKind, objState: v.objState, objGoal: v.objGoal })),
      tops,
    };
  });
  let stick = null;
  if (snaps.length >= 3) {
    const byVid = {};
    for (const sn of snaps) for (const v of (sn.villagers || [])) (byVid[v.vid] = byVid[v.vid] || []).push(v);
    const all = Object.keys(byVid).filter(vid => byVid[vid].length === snaps.length);
    const stuck = all.filter(vid => byVid[vid].every(v => v.top === byVid[vid][0].top));
    stick = { nAllDays: all.length, stuck: stuck.length,
      stuckDetail: stuck.map(vid => ({ name: byVid[vid][0].name, top: byVid[vid][0].top })),
      churnDetail: all.filter(vid => !stuck.includes(vid)).map(vid => ({ name: byVid[vid][0].name, tops: byVid[vid].map(v => v.top) })) };
  }
  return { days, stick, goalLines: (s && s.goalLines) || null };
}

function main() {
  const dir = process.argv[2] || process.env.EVIDIR || DEFAULT_EVIDIR;
  const sfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r109-seed\d+\.json$/.test(f)).sort();
  if (!sfiles.length) { console.log('No r109 seed JSONs in ' + dir); process.exit(1); }
  const verdicts = {};
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const v = summarizeStanding(s);
    const k = summarizeSeed(s);
    verdicts[v.verdict] = (verdicts[v.verdict] || 0) + 1;
    console.log(`seed ${s.seed}: end=${s.endReason} day=${s.maxGameDay} verdict=${v.verdict}`);
    console.log(`   S-TRACE: traceDays=${v.traceDays} firstRegional=${v.firstRegionalDay} standing@firstRegional=${JSON.stringify(v.standingAtFirstRegional)} firstPos=${v.firstPositiveDay} regionalDays=${v.regionalDays} regionalZero=${v.regionalZeroDays} max=${v.maxStanding}`);
    if (v.arithBug) console.log(`   ARITH-BUG: ${JSON.stringify(v.arithBug)}`);
    if (v.seasonedBesideZero) console.log(`   SEASONED-BESIDE-ZERO: ${JSON.stringify(v.seasonedBesideZero)}`);
    console.log(`   LAST-LIVING DEED: ${JSON.stringify(v.lastLivingDeed)}`);
    console.log(`   P-DIST-LL: ${JSON.stringify(v.lastLivingCensus)}`);
    console.log(`   K-CONTEXT: lessonsOk=${k.lessonsOk}/${k.lessonsN} knowExp=${k.knowExperiment} knowTraderDeep=${k.knowTraderDeep} knowMoot=${k.knowMoot} markerMoot=${(s.markerCounts || {}).moot} propose=${k.proposeN} ${JSON.stringify(k.proposeOutcomes)} mislabels=${(s.deathHonesty && s.deathHonesty.mislabels || []).length}`);
    const g = summarizeGoals(s);
    for (const d of g.days) console.log(`   G-DAY${d.day}: n=${d.n} assigned=${d.assigned} nonzeroW=${d.nonzeroW} active=${d.active} annotated=${d.annotated} mismatched=${d.mismatched} stale=${d.stale} returning=${d.returning} tops=${JSON.stringify(d.tops)}`);
    for (const d of g.days) { if (d.mismatchDetail.length) console.log(`   G-MISMATCH day=${d.day}: ${JSON.stringify(d.mismatchDetail)}`); if (d.staleDetail.length) console.log(`   G-STALE day=${d.day}: ${JSON.stringify(d.staleDetail)}`); }
    if (g.stick) console.log(`   G-STICK: nAllDays=${g.stick.nAllDays} stuck=${g.stick.stuck} stuckDetail=${JSON.stringify(g.stick.stuckDetail)} churnDetail=${JSON.stringify(g.stick.churnDetail)}`);
    else console.log(`   G-STICK: n/a (snaps=${g.days.length})`);
    console.log(`   G-LINES: ${JSON.stringify(g.goalLines)}`);
  }
  console.log('\nPANEL VERDICTS: ' + JSON.stringify(verdicts));
  // R95 transcript filenames carry the villager id: ...-day<day>-<vid>.txt
  const tfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r109-transcript-\d+-day\d+-.+\.txt$/.test(f)).sort();
  let bTotal = 0, bAccept = 0, bDecline = 0, bUnanswered = 0;
  // B-FOLLOW: a sitting is a follow-up when its vid was an inviter on an
  // earlier convo day in the same seed. Filenames sort by seed then day,
  // so inviters accumulate in order within each seed.
  const invitersBySeed = {};
  let followTotal = 0, followBetrayal = 0;
  for (const f of tfiles) {
    const m = /^journey-deepening-r109-transcript-(\d+)-day(\d+)-(.+)\.txt$/.exec(f);
    const seed = m ? m[1] : '?', day = m ? Number(m[2]) : 0, vid = m ? m[3] : '?';
    const t = scanBetrayalTranscript(fs.readFileSync(path.join(dir, f), 'utf8'));
    const seen = invitersBySeed[seed] || (invitersBySeed[seed] = {});
    const isFollow = !!seen[vid];
    if (isFollow) { followTotal++; if (t.betrayal) followBetrayal++; }
    if (t.betrayal) {
      bTotal++;
      if (t.branch === 'accept') bAccept++;
      else if (t.branch === 'decline') bDecline++;
      else bUnanswered++;
      seen[vid] = day;
    }
    console.log(`   B-SIT ${f}: branch=${t.branch} youTurns=${t.youCount} wantFinal=${JSON.stringify(t.wantFinal)} repeats=${t.repeats} followup=${isFollow}`);
  }
  console.log(`B-SIT PANEL: betrayalSittings=${bTotal} accept=${bAccept} decline=${bDecline} unanswered=${bUnanswered} transcripts=${tfiles.length}`);
  console.log(`B-FOLLOW PANEL: followupSittings=${followTotal} followupWithNewBetrayal=${followBetrayal}`);
  // R100 P-KEEP panel: promise threads from want-final promised lines.
  const ptrans = [];
  const pdeaths = [];
  for (const f of tfiles) {
    const m = /^journey-deepening-r109-transcript-(\d+)-day(\d+)-(.+)\.txt$/.exec(f);
    if (!m) continue;
    ptrans.push({ seed: m[1], day: Number(m[2]), vid: m[3], text: fs.readFileSync(path.join(dir, f), 'utf8') });
  }
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    // R106: tag each death with its seed — classifyPromiseThreads
    // scopes the DEAD lookup to the thread's seed (r105 metric-review
    // quirk: pooled deaths misclassified a same-vid death in another
    // seed as DEAD).
    for (const d of (s.deaths || [])) pdeaths.push({ ...d, seed: s.seed });
  }
  const threads = classifyPromiseThreads(ptrans, pdeaths);
  const pCounts = {};
  for (const t of threads) { pCounts[t.cls] = (pCounts[t.cls] || 0) + 1; console.log(`   P-KEEP seed=${t.seed} day=${t.day} vid=${t.vid} want=${t.wantId} cls=${t.cls} oldNamed=${t.oldNamed} structOld=${t.structOld} reAsk=${t.reAsk} laterDays=${JSON.stringify(t.laterDays)}${t.evidence ? ' evidence=' + JSON.stringify(t.evidence) : ''}`); }
  const revisited = threads.filter(t => t.cls === 'NAMED' || t.cls === 'NAMED-STRUCTURAL' || t.cls === 'RE-ASK' || t.cls === 'SILENT');
  const namedRevised = threads.filter(t => t.cls === 'NAMED' || t.cls === 'NAMED-STRUCTURAL').length;
  const reAskCount = threads.filter(t => t.cls === 'RE-ASK').length;
  const namedOld = threads.filter(t => t.oldNamed).length;
  const structOldCount = threads.filter(t => t.structOld && t.cls === 'SILENT').length;
  console.log(`P-KEEP PANEL: threads=${threads.length} counts=${JSON.stringify(pCounts)}`);
  console.log(`P-KEEP VERDICT (revised metric): NAMED=${namedRevised} / revisited-alive=${revisited.length} (old-regex NAMED=${namedOld}) -> ${namedRevised >= 1 ? 'PRESENT' : 'ABSENT'}`);
  console.log(`P-KEEP RE-ASK (r109 adopted): RE-ASK threads=${reAskCount} (Chloe class confirmed live iff >=1)`);
  console.log(`P-KEEP OLD-RULE CONTINUITY: want-only structural hits now scoring SILENT under the revised rule=${structOldCount} (Maeve-class over-counts)`);
  // R109 RE-ASK-ORPHAN: re-ask openers naming a short no earlier sitting
  // with that villager ever named — a re-ask without a thread.
  const orphans = scanReaskOrphans(ptrans);
  for (const o of orphans) console.log(`   RE-ASK-ORPHAN seed=${o.seed} day=${o.day} vid=${o.vid} short=${JSON.stringify(o.short)} line=${JSON.stringify(o.line)}`);
  console.log(`RE-ASK-ORPHAN PANEL: orphans=${orphans.length}`);
  // R109 FIZZLE-WATCH: dry lines in ask_favor sittings (the r146 fix's
  // target) vs elsewhere. Verdict: 0 in ask_favor -> fix HOLDS in the wild.
  const dryHits = classifyDryLines(ptrans);
  const dryAskFavor = dryHits.filter(h => h.wantId === 'ask_favor');
  const dryOther = dryHits.filter(h => h.wantId !== 'ask_favor');
  for (const h of dryHits) console.log(`   FIZZLE seed=${h.seed} day=${h.day} vid=${h.vid} want=${h.wantId} dryLines=${h.dryLines} lines=${JSON.stringify(h.lines)}`);
  console.log(`FIZZLE PANEL: drySittings=${dryHits.length} askFavor=${dryAskFavor.length} other=${dryOther.length} totalDryLines=${dryHits.reduce((a, h) => a + h.dryLines, 0)} -> ${dryAskFavor.length === 0 ? 'FIZZLE-FIX HOLDS in the wild' : 'FIZZLE STILL FIRES in ask_favor — investigate slot before any claim'}`);
  // R103 V-INIT scan (carried in r104): NPC-initiated bond proposals. A sitting counts as
  // V-INIT-BOND only when the NPC's opening want or a THEM line proposes
  // a bond (party join, joint outing, visit, village link, covenant,
  // trade pact). Player-side menu options (invite_party / dlg:invite)
  // are counted separately as contrast, never as initiation. Betrayal
  // menus are B-INIT, also separate.
  const BOND_THEM = /(join (me|us)|come with (me|us)|travel together|outing|come visit|visit me|stay with us|link (our|the) village|covenant|trade pact|be my (partner|ally)|let'?s (go|head|travel|hunt|forage) together)/i;
  let vBond = 0, vBondDetail = [], vPlayerInviteOffered = 0, vBetrayalOffered = 0;
  for (const f of tfiles) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const lines = text.split('\n');
    const wantLine = lines.find(l => l.indexOf('want: ') === 0) || '';
    const themLines = lines.filter(l => l.indexOf('THEM: ') === 0);
    const bondLines = themLines.filter(l => BOND_THEM.test(l));
    const offeredInvite = lines.some(l => /\(offered=[^)]*(invite_party|dlg:invite)/.test(l));
    const offeredBetrayal = lines.some(l => /\(offered=[^)]*betrayal:accept/.test(l));
    if (offeredInvite) vPlayerInviteOffered++;
    if (offeredBetrayal) vBetrayalOffered++;
    if (bondLines.length) { vBond++; vBondDetail.push({ file: f, want: wantLine, lines: bondLines.slice(0, 3) }); }
    console.log(`   V-INIT ${f}: want=${wantLine} bondLines=${bondLines.length} playerInviteOffered=${offeredInvite} betrayalOffered=${offeredBetrayal}`);
  }
  console.log(`V-INIT PANEL: bondSittings=${vBond} transcripts=${tfiles.length} playerInviteOfferedSittings=${vPlayerInviteOffered} betrayalOfferedSittings=${vBetrayalOffered}`);
  // R103 B-LEAD (carried in r104; descriptive, NOT V-INIT-BOND): betrayal-invitation
  // lead-in lines — the closest thing to villager-initiated togetherness
  // in this panel. They precede a betrayal menu, so they count under
  // B-INIT, never under V-INIT-BOND.
  const BLEAD = /(walk with me|come get air with me|come see what i found)/i;
  let bLead = 0; const bLeadDetail = [];
  for (const f of tfiles) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const hits = text.split('\n').filter(l => l.indexOf('THEM: ') === 0 && BLEAD.test(l));
    if (hits.length) { bLead++; bLeadDetail.push({ file: f, lines: hits }); }
  }
  console.log(`B-LEAD PANEL: sittingsWithBetrayalLeadIn=${bLead} detail=${JSON.stringify(bLeadDetail)}`);
  if (vBondDetail.length) console.log(`V-INIT DETAIL: ${JSON.stringify(vBondDetail)}`);
  // R107 D-THING panel (r95 open item; new denominator: testable only when
  // a later sitting with the same villager exists). Raw count and qualified
  // count are both reported; a 0 denominator means unmeasurable, not zero.
  const pockThreads = classifyPocketedThreads(ptrans);
  const pockTestable = pockThreads.filter(t => t.testable);
  const pockMentioned = pockThreads.filter(t => t.mentioned);
  for (const t of pockThreads) console.log(`   D-THING seed=${t.seed} day=${t.day} vid=${t.vid} testable=${t.testable} mentioned=${t.mentioned} laterDays=${JSON.stringify(t.laterDays)}${t.evidence ? ' evidence=' + JSON.stringify(t.evidence) : ''}`);
  console.log(`D-THING PANEL: pocketed=${pockThreads.length} testable=${pockTestable.length} mentioned=${pockMentioned.length} (of testable: ${pockTestable.filter(t => t.mentioned).length})`);
  // R108 RAJ-PHOTO watch (r107 watch item; descriptive only, no verdict).
  const photoPlants = classifyCuriousPlants(ptrans);
  const photoTestable = photoPlants.filter(t => t.testable);
  const photoReturned = photoPlants.filter(t => t.returned);
  for (const t of photoPlants) console.log(`   RAJ-PHOTO seed=${t.seed} day=${t.day} vid=${t.vid} testable=${t.testable} returned=${t.returned} laterDays=${JSON.stringify(t.laterDays)} opener=${JSON.stringify(t.opener)}${t.evidence ? ' evidence=' + JSON.stringify(t.evidence) : ''}`);
  console.log(`RAJ-PHOTO PANEL: plants=${photoPlants.length} testable=${photoTestable.length} returned=${photoReturned.length} (of testable: ${photoTestable.filter(t => t.returned).length})`);
  // Sittings-per-day cap check from seed JSON sitting logs.
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const perDay = {};
    for (const sit of (s.sittingLog || [])) perDay[sit.day] = (perDay[sit.day] || 0) + 1;
    console.log(`   SEED ${s.seed} sittingsPerDay=${JSON.stringify(perDay)} inviters=${JSON.stringify(s.inviterHistory || [])} blockedRevisits=${JSON.stringify(s.revisitAttempts || [])}`);
    // R100 blocked-agreement: every blocked entry must have NO same-day
    // sitting with that villager; every revisit sitting must NOT also
    // be logged blocked that day (the r95 flaw shape).
    const badBlocked = (s.revisitAttempts || []).filter(a => (s.sittingLog || []).some(x => x.day === a.day && x.vid === a.vid));
    const badRevisit = (s.sittingLog || []).filter(x => x.revisit && (s.revisitAttempts || []).some(a => a.day === x.day && a.vid === x.vid));
    console.log(`   BLOCKED-AGREEMENT seed=${s.seed} badBlocked=${badBlocked.length} badRevisit=${badRevisit.length}`);
  }
}

if (require.main === module) main();
module.exports = { summarizeStanding, distStats, median, scanBetrayalTranscript, scanPromiseTranscript, classifyPromiseThreads, classifyPocketedThreads, classifyCuriousPlants, scanReaskOrphans, classifyDryLines, REPAY_OPENER, REASK_OPENER, DRY_LINE, summarizeGoals, GOAL_KINDS_G };
