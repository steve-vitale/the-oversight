// analyze-journey-deepening-r114-20261107.js -- R114 analyzer (tooling
// only, zero game code). Fork of the r113 analyzer: all r113 sections
// carried unchanged (S-TRACE, P-KEEP revised, RE-ASK, B-SIT/B-FOLLOW,
// Q1-REQUESTS, BOND-CHOICE, AWAY-LINE, DEBRIEF, D-THING revised, G-STICK
// revised, RAJ-PHOTO) plus two r114 additions (pre-registered in the r114
// prereg):
//   - Q1-LANGGATE: summarizeLangGate joins the driver's langGateOffers /
//     langGateDecisions (commLevel at offer + decision time, via the REAL
//     Game.commLevel). Verdicts (checked in order): DEFECT-CONFIRMED
//     (>=1 decision at comm 'none') -> NOT-REPRODUCED (>=1 decision,
//     all non-'none') -> NO-DECISIONS (0 decisions).
//   - Q2 REPLAY: scanDecidedAskReplay finds sittings where a bond/link
//     ask line is re-spoken via a continuer AFTER the scholar decided
//     it in the same sitting (the Grace day-27 goon replay). Verdicts:
//     REPLAY-CONFIRMED (>=1) -> NOT-REPRODUCED (0 replays, >=1 decision
//     sitting).
// PANEL env (before|after, default before) selects the seed/transcript
// filename set, so the after-panel never overwrites the before-panel
// (r113 metric review).
//
// Usage: node scripts/analyze-journey-deepening-r114-20261107.js [evidir]
//   PANEL=after node scripts/analyze-journey-deepening-r114-20261107.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports summarizeStanding, distStats, median.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-07');
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
// R110 P-KEEP FIX (r109 metric review): bare "forgot" dropped — it matched
// belonging musings that name no promise (Onni r109 day-80). "forget it"
// (the repay dismissal) stays, as does the REPAY_OPENER vocabulary.
const PROMISE_MENTION = /promis|missed|debt|\bowe\b|owed|forget it|turning it over|still on my mind|had a chance|keep thinking|coming back to it/i;
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
// R110 RE-ASK FIX (r109 metric review): the re-ask opener is FOUR lines
// in src/js/convo-wants.js:1962-1967, not one — r109's scan covered only
// variant 4 and missed Grace's day-60 variant 3 ("I hate to ask twice").
// A thread scores RE-ASK when a later sitting's THEM line matches ANY
// variant AND the extracted favor short appears in the thread-opening
// sitting's THEM lines (the short re-appears — Chloe r108: "the food I
// needed" in the day-45 opener, re-asked day 60). Classification order:
// NAMED > NAMED-STRUCTURAL > RE-ASK > SILENT. A re-ask opener whose
// short appears in NO earlier sitting with that villager is a
// RE-ASK-ORPHAN (separate scan below) — tagged fromSeed when the
// sitting's want line carries fromSeed (the favor predates convo days:
// origin outside the panel window) vs true no-thread otherwise.
const REASK_OPENER = /about (.+?) — (?:still need hands\. are you in|i still haven't found anyone\. any chance|i hate to ask twice, but it's still open\. will you|the need hasn't gone anywhere\. i'm still asking)/i;
function scanReaskOrphans(transcripts) {
  const orphans = [];
  const bySeedVid = {};
  for (const t of transcripts) {
    const key = t.seed + '|' + t.vid;
    (bySeedVid[key] = bySeedVid[key] || []).push(t);
  }
  for (const t of transcripts) {
    const them = t.text.split('\n').filter(l => l.indexOf('THEM: ') === 0);
    const wantLine = (t.text.split('\n').find(l => l.indexOf('want: ') === 0) || '');
    for (const l of them) {
      const m = REASK_OPENER.exec(l);
      if (!m) continue;
      const short = m[1].trim();
      const earlier = (bySeedVid[t.seed + '|' + t.vid] || []).filter(x => x.day < t.day);
      const seen = earlier.some(x => x.text.split('\n').filter(y => y.indexOf('THEM: ') === 0).some(y => y.toLowerCase().includes(short.toLowerCase())));
      // R110: fromSeed sittings re-ask favors promised before convo days —
      // origin outside the panel window, not a re-ask without a thread.
      if (!seen) orphans.push({ seed: t.seed, day: t.day, vid: t.vid, short, line: l.slice(0, 200), fromSeed: /fromSeed/.test(wantLine) });
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
// exists in the same seed (transcript files prove it).
// R113 REVISION (r110 metric review): "mentioned" now requires the thing
// to be NAMED in a later sitting's THEM lines ("that small thing") —
// the `pocketed` want label persisting is NOT a mention (r110: Jessica's
// day-60 sitting scored mentioned=true via the label while the thing
// itself was never named). The old rule (label OR name) is still computed
// as mentionedOld, for comparability with r107–r110.
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
    let mentioned = null, mentionedOld = null;
    for (const lt of later) {
      const wantLine = (lt.text.split('\n').find(l => l.indexOf('want: ') === 0) || '');
      const themLines = lt.text.split('\n').filter(l => l.indexOf('THEM: ') === 0);
      const hit = themLines.find(l => POCKETED_MENTION.test(l));
      if (hit && !mentioned) mentioned = { day: lt.day, line: hit.slice(0, 200) };
      if ((/^want: pocketed\b/.test(wantLine) || hit) && !mentionedOld) {
        mentionedOld = { day: lt.day, wantLine: wantLine || null, line: (hit || '').slice(0, 200) };
      }
      if (mentioned && mentionedOld) break;
    }
    threads.push({
      seed: t.seed, day: t.day, vid: t.vid,
      testable: later.length > 0, mentioned: !!mentioned, mentionedOld: !!mentionedOld,
      laterDays: later.map(x => x.day), evidence: mentioned, evidenceOld: mentionedOld,
    });
  }
  return threads;
}

// R110 RAJ-PHOTO watch, WIDENED (r109 metric review): a plant is abandoned
// when a confidence-opener sitting ends in a betrayal decline and the want
// never resolves. A plant opens when a sitting's first THEM line is a
// personal-revelation opener ("Can I tell you something? ..."), the
// sitting contains a betrayal:decline pick, and the want final resolution
// is unestablished or none — REGARDLESS of want id (r109: Thabo's candy
// bar proved the shape lives under ask_favor too; Thabo himself left
// without declining, so he is still not a plant — the decline requirement
// stays). It is TESTABLE only when a later sitting with the same villager
// exists; it is RETURNED when a later sitting's THEM lines name the
// planted content (the r107 exemplar: a photo of someone left behind).
// Descriptive only — no verdict, no fix.
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
    // R113 REVISION (r110 metric review): stability as a DISTRIBUTION of
    // distinct tops per villager (1 = never changed, 2, 3) — goals are
    // lasting pursuits by design, so the stuck-count alone misleads.
    const distinctTopsDist = {};
    for (const vid of all) {
      const n = new Set(byVid[vid].map(v => v.top)).size;
      distinctTopsDist[n] = (distinctTopsDist[n] || 0) + 1;
    }
    stick = { nAllDays: all.length, stuck: stuck.length,
      distinctTopsDist,
      stuckDetail: stuck.map(vid => ({ name: byVid[vid][0].name, top: byVid[vid][0].top })),
      churnDetail: all.filter(vid => !stuck.includes(vid)).map(vid => ({ name: byVid[vid][0].name, tops: byVid[vid].map(v => v.top) })) };
  }
  return { days, stick, goalLines: (s && s.goalLines) || null };
}

// R110 BOND-TELEMETRY (primary): summarize the driver's `bond` field
// (bond-initiation instrument). tele = bond_proposed tele events;
// proposals = proposeBond + scholar-proposal resolver calls; decisions =
// npcInviteDecision kind 'bond' rows; links = proposeLink calls after an
// NPC raise; initiated = `proposed`-marked bonds at seed end (last daily
// snapshot); scholarTargeted = tele events whose target is the scholar
// at event time (the instrument records scholarId per event).
function summarizeBond(s) {
  const b = (s && s.bond) || null;
  if (!b) return { installed: false, tele: 0, proposals: 0, decisions: 0, accepts: 0, links: 0, initiated: null, scholarTargeted: 0, sayLines: 0, errors: ['no bond field in seed JSON'] };
  const tele = (b.tele || []);
  const decisions = (b.decisions || []);
  const accepts = decisions.filter(d => d.accept).length;
  const daily = (b.daily || []);
  const last = daily.length ? daily[daily.length - 1] : null;
  // Scholar-targeted: the instrument records scholarId at EVENT time
  // (succession changes the scholar; the final scholarId would
  // misattribute earlier asks).
  let scholarTargeted = 0;
  for (const e of tele) if (e.scholarId && e.target && String(e.target) === String(e.scholarId)) scholarTargeted++;
  return {
    installed: true,
    tele: tele.length,
    teleDetail: tele.map(e => ({ day: e.day, initiator: e.initiator, target: e.target, kind: e.kind, outcome: e.outcome, chance: e.chance })),
    proposals: (b.proposals || []).length,
    decisions: decisions.length, accepts,
    acceptRate: decisions.length ? +(accepts / decisions.length).toFixed(2) : null,
    links: (b.links || []).length,
    linkDetail: (b.links || []).map(e => ({ day: e.day, target: e.target, ret: e.ret })),
    initiated: last ? last.bondsInitiated : null,
    bondsTotal: last ? last.bondsTotal : null,
    scholarTargeted,
    sayLines: (b.sayLines || []).length,
    errors: (b.errors || []),
  };
}

// R110 DEBRIEF (r109 instrument proposal): the driver's `debrief` field
// — loss trigger + villageDebrief lines, captured in-run.
function summarizeDebrief(s) {
  const d = (s && s.debrief) || null;
  if (!d) return { trigger: 'no-debrief-field', lines: [], flags: {} };
  return { trigger: d.trigger || 'n/a', lines: (d.lines || []), flags: (d.flags || {}) };
}

// R113 Q1 REQUEST-TELEMETRY (primary): one record per staged
// scholar-targeted bond/link request, joining:
//   - bond.tele: bond_proposed events (staged / accepted / refused /
//     expired) with initiator + target + kind + day; bond proposals
//     target the scholar (kind 'person'); link raises target the
//     village (kind 'link') but are always scholar-mediated — the
//     scholar carries the proposal — so every kind-'link' tele event
//     is a scholar-facing ask. The instrument records scholarId at
//     EVENT time (succession-safe).
//   - bond.convoEvents: every talkTo/endConvo with day + target vid
//     (the policy's daily talks + the driver's convo-day sittings).
//   - talkReqSnaps: daily staged maps (corroboration: a request is
//     live on the days its vid appears staged).
// Live window: staged day D is live D, D+1, D+2; the tick expires it
// on D+3 (bond-initiation.js npcBondTick / npcLinkRaiseTick: `day -
// stagedDay > 2`). Talked-while-live = a talkTo to the holder on any
// live day. Talkable at staging = holder on the roster AT STAGING
// (the bond instrument's daily snapshots carry the roster each day;
// the final census roster drops dead/removed villagers and mislabels
// holders who were alive when they staged) and not dead on or before
// the staging day. npcComm is NOT in the seed JSON, so the comm leg
// of talkability is unmeasured — reported as a caveat, never assumed.
// Verdict classes (prereg, checked in order): REACHED (>=1 scholar
// decision) -> POLICY-GAP (>=1 expired request whose talkable holder
// was never talked to while live) -> GAME-GAP (0 staged, or every
// expired holder untalkable for the whole window).
function summarizeRequests(s) {
  const b = (s && s.bond) || {};
  const tele = (b.tele || []);
  const convo = (b.convoEvents || []);
  const snaps = (s && s.talkReqSnaps) || [];
  const deaths = (s && s.deaths) || [];
  const daily = (b.daily || []);
  const finalRoster = ((s && s.census) || []).map(c => String(c.id));
  const talkTos = convo.filter(e => e && e.fn === 'talkTo').map(e => ({ day: e.day, vid: String(e.target) }));
  const staged = tele.filter(e => e && e.outcome === 'staged' && (e.kind === 'person' ? (e.scholarId && String(e.target) === String(e.scholarId)) : e.kind === 'link'));
  // Every staged tele event IS a request — the same holder may re-stage
  // to the same village after the 14-day cooldown, and that is a new ask,
  // not a duplicate (r110 back-compat: dedup by pair collapsed 51 staged
  // events to 32). The decision/expiry join is windowed to the staging's
  // own live window, so repeat stagings cannot steal each other's events.
  const requests = staged.map(e => ({ kind: e.kind, holder: String(e.initiator),
    village: e.kind === 'link' ? String(e.target) : null,
    stagedDay: e.day, scholarId: e.scholarId || null }));
  // Roster AT STAGING (r110 back-compat: the FINAL census roster drops
  // dead/removed villagers, so it mislabels holders who were alive and
  // on-roster when they staged — e.g. gen_3ivkbta staged day 5, died
  // day 43, off the final roster). The bond instrument's daily snapshots
  // carry the roster each day; use the latest snap on or before the
  // staging day, falling back to the final census roster.
  function rosterAt(day) {
    let best = null;
    for (const sn of daily) { if (sn && sn.day <= day && (!best || sn.day > best.day)) best = sn; }
    if (best && Array.isArray(best.roster)) return best.roster.map(x => String(x));
    return finalRoster;
  }
  for (const r of requests) {
    const liveEnd = r.stagedDay + 2;
    // Decision/expiry: same initiator + kind (+ same village for link),
    // inside this staging's own live window [stagedDay, stagedDay+3]
    // (the expiry tick fires at stagedDay+3; a decision must land while
    // live). Repeat stagings are >=14 days apart, so windows never
    // overlap and the join is unambiguous.
    let decided = null, expired = null;
    for (const e of tele) {
      if (!e || e.day < r.stagedDay || e.day > r.stagedDay + 3) continue;
      if (String(e.initiator) !== r.holder || e.kind !== r.kind) continue;
      if (r.kind === 'link' && String(e.target) !== r.village) continue;
      if (r.kind === 'person' && !(e.scholarId && String(e.target) === String(e.scholarId))) continue;
      if ((e.outcome === 'accepted' || e.outcome === 'refused') && !decided) decided = { outcome: e.outcome, day: e.day };
      if (e.outcome === 'expired' && !expired) expired = { day: e.day };
    }
    // Corroboration from the daily staged maps: the last snap day on
    // which THIS staging was still live. Matched on the staging's own
    // identity (vid + staged day + village for link) and bounded to the
    // live window — an unbounded scan misattributes a LATER staging by
    // the same villager (r113 before-panel: a day-12 request read
    // lastSeenStaged=95 from a day-92 re-staging).
    let lastSeenStaged = null;
    for (const sn of snaps) {
      if (!sn || sn.day < r.stagedDay || sn.day > r.stagedDay + 2) continue;
      const hit = r.kind === 'person'
        ? (sn.bond || []).some(x => String(x.vid) === r.holder && (x.day == null || x.day === r.stagedDay))
        : (sn.link || []).some(x => String(x.vid) === r.holder && (x.day == null || x.day === r.stagedDay) && (x.village == null || String(x.village) === r.village));
      if (hit) lastSeenStaged = sn.day;
    }
    const talkedDays = talkTos.filter(t => t.vid === r.holder && t.day >= r.stagedDay && t.day <= liveEnd).map(t => t.day);
    const deathDay = (() => { const d = deaths.find(x => String(x.who) === r.holder); return d ? d.day : null; })();
    const onRoster = rosterAt(r.stagedDay).indexOf(r.holder) >= 0;
    const talkable = onRoster && (deathDay == null || deathDay > r.stagedDay);
    r.outcome = decided ? decided.outcome : (expired ? 'expired' : 'open-at-end');
    r.decidedDay = decided ? decided.day : null;
    r.expiredDay = expired ? expired.day : null;
    r.lastSeenStaged = lastSeenStaged;
    r.talkedWhileLive = talkedDays;
    r.talkableAtStaging = talkable;
    r.deathDay = deathDay;
    r.onRoster = onRoster;
  }
  const decidedN = requests.filter(r => r.outcome === 'accepted' || r.outcome === 'refused').length;
  const expiredN = requests.filter(r => r.outcome === 'expired').length;
  const expiredTalkableUntalked = requests.filter(r => r.outcome === 'expired' && r.talkableAtStaging && r.talkedWhileLive.length === 0);
  const expiredUntalkable = requests.filter(r => r.outcome === 'expired' && !r.talkableAtStaging);
  let verdict;
  if (decidedN >= 1) verdict = 'REACHED';
  else if (expiredTalkableUntalked.length >= 1) verdict = 'POLICY-GAP';
  else if (requests.length === 0 || (expiredN > 0 && expiredUntalkable.length === expiredN)) verdict = 'GAME-GAP';
  else verdict = 'OPEN-OR-MIXED';
  return { requests, staged: requests.length, decided: decidedN, expired: expiredN,
    expiredTalkableUntalked: expiredTalkableUntalked.length, expiredUntalkable: expiredUntalkable.length,
    verdict };
}

// R114 Q1-LANGGATE: comm level at offer + decision time, from the
// driver's langGateOffers / langGateDecisions (REAL Game.commLevel).
// A decision at comm 'none' is the defect: a bond/link commitment made
// in words never shared (canon: no shared language -> nonverbal only).
function summarizeLangGate(s) {
  const offers = (s && s.langGateOffers) || [];
  const decisions = (s && s.langGateDecisions) || [];
  const offersNone = offers.filter(o => o && o.comm === 'none');
  const decisionsNone = decisions.filter(d => d && d.comm === 'none');
  const decisionsNonNone = decisions.filter(d => d && (d.comm === 'full' || d.comm === 'partial'));
  const decisionsUnknown = decisions.filter(d => d && d.comm !== 'none' && d.comm !== 'full' && d.comm !== 'partial');
  let verdict;
  if (decisionsNone.length >= 1) verdict = 'DEFECT-CONFIRMED';
  else if (decisions.length >= 1) verdict = 'NOT-REPRODUCED';
  else verdict = 'NO-DECISIONS';
  return { offers: offers.length, offersNone: offersNone.length,
    decisions: decisions.length, decisionsNone: decisionsNone.length,
    decisionsNonNone: decisionsNonNone.length, decisionsUnknown: decisionsUnknown.length,
    offersNoneList: offersNone, decisionsNoneList: decisionsNone,
    decisionsList: decisions, verdict };
}

// R114 Q2 REPLAY: a decided bond/link ask re-spoken via a continuer in
// the same sitting. The ask line is the sitting's opener bond/link line
// (bondProposalLine pool / linkRaiseLine templates); a replay is a later
// THEM line equal to it (normalized: strip the speaker prefix and
// surrounding quotes) AFTER a YOU: [bond:|link:] pick in the same
// sitting. The accept/decline resolution lines ("Stick together, then."
// / "Right — another time.") are not pool lines, so they never match.
const BOND_ASK_POOL = [
  "Can I ask you something? ... I want us to stick together. Properly. Watch each other's backs.",
  "I've been thinking. You and me — we should be bonded. Not just neighbors. Will you stick with me?",
  "Hey. I want to ask it plain: will you be my bonded friend? I'll watch your back if you watch mine.",
];
function normThem(line) {
  let t = String(line || '').replace(/^THEM: /, '');
  t = t.replace(/^[A-Za-z][A-Za-z' -]*: /, '');
  t = t.replace(/^"|"$/g, '');
  return t;
}
function isAskLine(norm) {
  if (BOND_ASK_POOL.indexOf(norm) >= 0) return 'bond';
  if (/We should link with .+\. I know them\. We'd be stronger together\./.test(norm)) return 'link';
  if (/I've been to .+\. I know their fires\. We should link with them — we'd be stronger together\./.test(norm)) return 'link';
  if (/I've seen .+'s fires from the road\. We should link with them — we'd be stronger together\./.test(norm)) return 'link';
  if (/I've heard good things about .+\. We should link with them — we'd be stronger together\./.test(norm)) return 'link';
  return null;
}
function scanDecidedAskReplay(transcripts) {
  const out = [];
  for (const t of transcripts) {
    const lines = String(t.text || '').split('\n');
    let pickIdx = -1, pickKind = null;
    for (let i = 0; i < lines.length; i++) {
      const m = /^YOU: \[((?:bond|link):[a-z]+)\]/.exec(lines[i]);
      if (m) { pickIdx = i; pickKind = m[1].split(':')[0]; break; }
    }
    if (pickIdx < 0) continue;
    // The ask line is the first pool-matching THEM line BEFORE the pick
    // (the talk-request opener). A sitting with no pool line before the
    // pick has no ask to replay.
    let askLine = null, askKind = null;
    for (let i = 0; i < pickIdx; i++) {
      if (lines[i].indexOf('THEM: ') !== 0) continue;
      const k = isAskLine(normThem(lines[i]));
      if (k) { askLine = normThem(lines[i]); askKind = k; break; }
    }
    if (!askLine) continue;
    for (let i = pickIdx + 1; i < lines.length; i++) {
      if (lines[i].indexOf('THEM: ') !== 0) continue;
      if (normThem(lines[i]) === askLine) {
        out.push({ seed: t.seed, day: t.day, vid: t.vid, kind: askKind, askLine: askLine.slice(0, 160) });
        break;
      }
    }
  }
  return out;
}

// R113 Q1 choice-gap scan: bond:/link: choices offered in a sitting and
// what the picker took instead. The game prepends the choices while a
// proposal is pending (bond-initiation.js convoChoices wrap); the r110
// driver's pickChoice never picks them (not in ENGAGE / ENGAGE2 /
// DEFLECT). A sitting that offers bond:accept and leaves without
// answering is the choice gap firing live.
function scanBondChoices(transcripts) {
  const out = [];
  for (const t of transcripts) {
    const lines = String(t.text || '').split('\n');
    const offeredLines = lines.filter(l => l.indexOf('(offered=') !== -1);
    const offeredBond = offeredLines.some(l => /bond:(accept|decline)/.test(l));
    const offeredLink = offeredLines.some(l => /link:(accept|decline)/.test(l));
    if (!offeredBond && !offeredLink) continue;
    const picks = lines.filter(l => /^YOU: \[(bond|link):/.test(l)).map(l => { const m = /^YOU: \[((?:bond|link):[a-z]+)\]/.exec(l); return m ? m[1] : '?'; });
    const youLines = lines.filter(l => l.indexOf('YOU: ') === 0);
    out.push({ seed: t.seed, day: t.day, vid: t.vid, offeredBond, offeredLink,
      picked: picks, answered: picks.length > 0,
      lastPick: youLines.length ? youLines[youLines.length - 1].slice(0, 120) : null });
  }
  return out;
}

// R113 Q2 away-line scan: the OLD "miles away" line vs the NEW "away
// from Haven" line in THEM lines, and the action-site away reason vs
// the adjacency reason (dlg:favor_requirements answers).
const AWAY_OLD_LINE = /I'm out on the road\. I can't ask you to meet me at dawn when I'm miles away/i;
const AWAY_NEW_LINE = /away from Haven, out on the road\. I can't promise a dawn meet while I'm out/i;
const AWAY_ACTION_REASON = /They are out on the road, miles from here/i;
const ADJACENCY_REASON = /Move next to them, on the same side of the Haven door/i;
function scanAwayLines(transcripts) {
  const out = [];
  for (const t of transcripts) {
    const them = String(t.text || '').split('\n').filter(l => l.indexOf('THEM: ') === 0);
    const oldHits = them.filter(l => AWAY_OLD_LINE.test(l));
    const newHits = them.filter(l => AWAY_NEW_LINE.test(l));
    const actionHits = them.filter(l => AWAY_ACTION_REASON.test(l));
    const adjHits = them.filter(l => ADJACENCY_REASON.test(l));
    if (oldHits.length || newHits.length || actionHits.length || adjHits.length) {
      out.push({ seed: t.seed, day: t.day, vid: t.vid,
        oldLine: oldHits.length, newLine: newHits.length,
        actionAwayReason: actionHits.length, adjacencyReason: adjHits.length,
        lines: oldHits.concat(newHits).map(l => l.slice(0, 220)) });
    }
  }
  return out;
}

function main() {
  const dir = process.argv[2] || process.env.EVIDIR || DEFAULT_EVIDIR;
  const PANEL = process.env.PANEL === 'after' ? 'after' : 'before';
  const seedRe = new RegExp('^journey-deepening-r114-' + PANEL + '-seed\\d+\\.json$');
  const sfiles = fs.readdirSync(dir).filter(f => seedRe.test(f)).sort();
  if (!sfiles.length) { console.log('No r114-' + PANEL + ' seed JSONs in ' + dir); process.exit(1); }
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
    if (g.stick) console.log(`   G-STICK: nAllDays=${g.stick.nAllDays} stuck=${g.stick.stuck} distinctTopsDist=${JSON.stringify(g.stick.distinctTopsDist)} stuckDetail=${JSON.stringify(g.stick.stuckDetail)} churnDetail=${JSON.stringify(g.stick.churnDetail)}`);
    else console.log(`   G-STICK: n/a (snaps=${g.days.length})`);
    console.log(`   G-LINES: ${JSON.stringify(g.goalLines)}`);
    const bo = summarizeBond(s);
    console.log(`   BOND-TELEMETRY: installed=${bo.installed} tele=${bo.tele} proposals=${bo.proposals} decisions=${bo.decisions} accepts=${bo.accepts} acceptRate=${bo.acceptRate} links=${bo.links} initiated=${bo.initiated}/${bo.bondsTotal} scholarTargeted=${bo.scholarTargeted} sayLines=${bo.sayLines} errors=${JSON.stringify(bo.errors)}`);
    if (bo.teleDetail.length) console.log(`   BOND-TELE DETAIL: ${JSON.stringify(bo.teleDetail)}`);
    const rq = summarizeRequests(s);
    console.log(`   Q1-REQUESTS: staged=${rq.staged} decided=${rq.decided} expired=${rq.expired} expiredTalkableUntalked=${rq.expiredTalkableUntalked} expiredUntalkable=${rq.expiredUntalkable} verdict=${rq.verdict}`);
    for (const r of rq.requests) console.log(`   Q1-REQ seed=${s.seed} kind=${r.kind} holder=${r.holder}${r.village ? ' village=' + r.village : ''} stagedDay=${r.stagedDay} outcome=${r.outcome} decidedDay=${r.decidedDay} expiredDay=${r.expiredDay} lastSeenStaged=${r.lastSeenStaged} talkedWhileLive=${JSON.stringify(r.talkedWhileLive)} talkable=${r.talkableAtStaging} onRoster=${r.onRoster} deathDay=${r.deathDay}`);
    const lg = summarizeLangGate(s);
    console.log(`   Q1-LANGGATE: offers=${lg.offers} offersNone=${lg.offersNone} decisions=${lg.decisions} decisionsNone=${lg.decisionsNone} decisionsNonNone=${lg.decisionsNonNone} decisionsUnknown=${lg.decisionsUnknown} verdict=${lg.verdict}`);
    for (const d of lg.decisionsList) console.log(`   Q1-LANGDEC seed=${s.seed} day=${d.day} fn=${d.fn} vid=${d.vid} comm=${d.comm}`);
    const db = summarizeDebrief(s);
    console.log(`   DEBRIEF: trigger=${db.trigger} flags=${JSON.stringify(db.flags)} lines=${JSON.stringify(db.lines)}`);
  }
  console.log('\nPANEL VERDICTS: ' + JSON.stringify(verdicts));
  // R95 transcript filenames carry the villager id: ...-day<day>-<vid>.txt
  const transRe = new RegExp('^journey-deepening-r114-' + PANEL + '-transcript-\\d+-day\\d+-.+\\.txt$');
  const transParse = new RegExp('^journey-deepening-r114-' + PANEL + '-transcript-(\\d+)-day(\\d+)-(.+)\\.txt$');
  const tfiles = fs.readdirSync(dir).filter(f => transRe.test(f)).sort();
  let bTotal = 0, bAccept = 0, bDecline = 0, bUnanswered = 0;
  // B-FOLLOW: a sitting is a follow-up when its vid was an inviter on an
  // earlier convo day in the same seed. Filenames sort by seed then day,
  // so inviters accumulate in order within each seed.
  const invitersBySeed = {};
  let followTotal = 0, followBetrayal = 0;
  for (const f of tfiles) {
    const m = transParse.exec(f);
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
    const m = transParse.exec(f);
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
  for (const o of orphans) console.log(`   RE-ASK-ORPHAN seed=${o.seed} day=${o.day} vid=${o.vid} short=${JSON.stringify(o.short)} fromSeed=${o.fromSeed} line=${JSON.stringify(o.line)}`);
  const orphFromSeed = orphans.filter(o => o.fromSeed).length;
  console.log(`RE-ASK-ORPHAN PANEL: orphans=${orphans.length} fromSeed-origin=${orphFromSeed} true-no-thread=${orphans.length - orphFromSeed}`);
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
  // R110 BOND-TELEMETRY PANEL (primary): the merged bond-initiation code,
  // measured across the whole sim via the build's own instrument.
  let bondTeleTotal = 0, bondPropTotal = 0, bondDecTotal = 0, bondAccTotal = 0, bondLinkTotal = 0, bondScholarTotal = 0, bondInitTotal = 0, bondErrTotal = 0;
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const bo = summarizeBond(s);
    bondTeleTotal += bo.tele; bondPropTotal += bo.proposals; bondDecTotal += bo.decisions; bondAccTotal += bo.accepts;
    bondLinkTotal += bo.links; bondScholarTotal += bo.scholarTargeted; bondInitTotal += (bo.initiated || 0); bondErrTotal += (bo.errors || []).length;
  }
  console.log(`BOND-TELEMETRY PANEL: tele=${bondTeleTotal} proposals=${bondPropTotal} decisions=${bondDecTotal} accepts=${bondAccTotal} acceptRate=${bondDecTotal ? +(bondAccTotal / bondDecTotal).toFixed(2) : null} linkRaises=${bondLinkTotal} scholarTargeted=${bondScholarTotal} initiatedBonds=${bondInitTotal} instrumentErrors=${bondErrTotal} -> ${bondTeleTotal >= 1 ? 'PRESENT (merged code reaches the wild)' : 'ABSENT (0 bond_proposed events — the merged code does not reach this leg)'}`);
  // R113 Q1 REQUEST-TELEMETRY PANEL (primary): pooled scholar-targeted
  // requests across seeds; the binding verdict is panel-level (prereg).
  let rqStaged = 0, rqDecided = 0, rqExpired = 0, rqExpiredTalkableUntalked = 0, rqExpiredUntalkable = 0;
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const rq = summarizeRequests(s);
    rqStaged += rq.staged; rqDecided += rq.decided; rqExpired += rq.expired;
    rqExpiredTalkableUntalked += rq.expiredTalkableUntalked; rqExpiredUntalkable += rq.expiredUntalkable;
  }
  let rqVerdict;
  if (rqDecided >= 1) rqVerdict = 'REACHED';
  else if (rqExpiredTalkableUntalked >= 1) rqVerdict = 'POLICY-GAP';
  else if (rqStaged === 0 || (rqExpired > 0 && rqExpiredUntalkable === rqExpired)) rqVerdict = 'GAME-GAP';
  else rqVerdict = 'OPEN-OR-MIXED';
  console.log(`Q1-REQUESTS PANEL: staged=${rqStaged} decided=${rqDecided} expired=${rqExpired} expiredTalkableUntalked=${rqExpiredTalkableUntalked} expiredUntalkable=${rqExpiredUntalkable} -> ${rqVerdict} (talkability caveat: npcComm is not in the seed JSON — talkable = on-roster-at-staging + alive at staging)`);
  // R113 Q1 choice-gap panel: bond:/link: offered in a sitting, answered?
  const bondChoiceSittings = scanBondChoices(ptrans);
  const bondAnswered = bondChoiceSittings.filter(x => x.answered);
  for (const x of bondChoiceSittings) console.log(`   BOND-CHOICE seed=${x.seed} day=${x.day} vid=${x.vid} offeredBond=${x.offeredBond} offeredLink=${x.offeredLink} picked=${JSON.stringify(x.picked)} answered=${x.answered} lastPick=${JSON.stringify(x.lastPick)}`);
  console.log(`BOND-CHOICE PANEL: sittingsOfferingBondOrLink=${bondChoiceSittings.length} answered=${bondAnswered.length} unanswered=${bondChoiceSittings.length - bondAnswered.length} -> ${bondChoiceSittings.length > 0 && bondAnswered.length === 0 ? 'CHOICE-GAP FIRES LIVE (offered, never picked)' : bondChoiceSittings.length === 0 ? 'NO OFFER (no sitting ever offered a bond/link choice)' : 'ANSWERED (the picker takes the choice)'}`);
  // R114 Q1-LANGGATE panel (before-panel verdict; after-panel binding
  // is judged on the after run: 0 'none' decisions + >=1 non-'none').
  let lgOffers = 0, lgOffersNone = 0, lgDec = 0, lgDecNone = 0, lgDecNonNone = 0, lgDecUnknown = 0;
  let lgVerdict = 'NO-DECISIONS';
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const lg = summarizeLangGate(s);
    lgOffers += lg.offers; lgOffersNone += lg.offersNone; lgDec += lg.decisions;
    lgDecNone += lg.decisionsNone; lgDecNonNone += lg.decisionsNonNone; lgDecUnknown += lg.decisionsUnknown;
  }
  if (lgDecNone >= 1) lgVerdict = 'DEFECT-CONFIRMED';
  else if (lgDec >= 1) lgVerdict = 'NOT-REPRODUCED';
  console.log(`Q1-LANGGATE PANEL: offers=${lgOffers} offersNone=${lgOffersNone} decisions=${lgDec} decisionsNone=${lgDecNone} decisionsNonNone=${lgDecNonNone} decisionsUnknown=${lgDecUnknown} -> ${lgVerdict}`);
  // R114 Q2 REPLAY panel: decided asks re-spoken in the same sitting.
  const replays = scanDecidedAskReplay(ptrans);
  const decisionSittings = ptrans.filter(t => /YOU: \[(bond|link):/.test(String(t.text || ''))).length;
  for (const r of replays) console.log(`   REPLAY seed=${r.seed} day=${r.day} vid=${r.vid} kind=${r.kind} ask=${JSON.stringify(r.askLine)}`);
  console.log(`Q2-REPLAY PANEL: replays=${replays.length} decisionSittings~${decisionSittings} -> ${replays.length >= 1 ? 'REPLAY-CONFIRMED' : decisionSittings >= 1 ? 'NOT-REPRODUCED' : 'NO-DECISION-SITTINGS'}`);
  // R113 Q2 away-line panel: old vs new line in sittings.
  const awayHits = scanAwayLines(ptrans);
  const awayOldTotal = awayHits.reduce((a, x) => a + x.oldLine, 0);
  const awayNewTotal = awayHits.reduce((a, x) => a + x.newLine, 0);
  const awayActionTotal = awayHits.reduce((a, x) => a + x.actionAwayReason, 0);
  const awayAdjTotal = awayHits.reduce((a, x) => a + x.adjacencyReason, 0);
  for (const x of awayHits) console.log(`   AWAY-LINE seed=${x.seed} day=${x.day} vid=${x.vid} oldLine=${x.oldLine} newLine=${x.newLine} actionAwayReason=${x.actionAwayReason} adjacencyReason=${x.adjacencyReason} lines=${JSON.stringify(x.lines)}`);
  console.log(`AWAY-LINE PANEL: oldLine=${awayOldTotal} newLine=${awayNewTotal} actionAwayReason=${awayActionTotal} adjacencyReason=${awayAdjTotal} -> ${awayOldTotal === 0 && awayNewTotal >= 0 ? 'OLD LINE GONE (reword live)' : 'OLD LINE STILL FIRES — investigate'}`);
  // R110 DEBRIEF PANEL: every village-lost seed should carry a trigger.
  let lostN = 0, attributedN = 0;
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (s.endReason !== 'village-lost') continue;
    lostN++;
    const db = summarizeDebrief(s);
    const attributed = ['scatter-hunger', 'extinction', 'scholar-death-no-successor'].includes(db.trigger);
    if (attributed) attributedN++;
    console.log(`   DEBRIEF seed=${s.seed} day=${s.maxGameDay} trigger=${db.trigger} attributed=${attributed}`);
  }
  console.log(`DEBRIEF PANEL: villageLost=${lostN} attributed=${attributedN} unclassified=${lostN - attributedN}`);
  // R107 D-THING panel (r95 open item; new denominator: testable only when
  // a later sitting with the same villager exists). Raw count and qualified
  // count are both reported; a 0 denominator means unmeasurable, not zero.
  const pockThreads = classifyPocketedThreads(ptrans);
  const pockTestable = pockThreads.filter(t => t.testable);
  const pockMentioned = pockThreads.filter(t => t.mentioned);
  const pockMentionedOld = pockThreads.filter(t => t.mentionedOld);
  for (const t of pockThreads) console.log(`   D-THING seed=${t.seed} day=${t.day} vid=${t.vid} testable=${t.testable} mentioned=${t.mentioned} mentionedOld=${t.mentionedOld} laterDays=${JSON.stringify(t.laterDays)}${t.evidence ? ' evidence=' + JSON.stringify(t.evidence) : ''}`);
  console.log(`D-THING PANEL: pocketed=${pockThreads.length} testable=${pockTestable.length} mentioned=${pockMentioned.length} mentionedOld=${pockMentionedOld.length} (of testable: ${pockTestable.filter(t => t.mentioned).length} named, ${pockTestable.filter(t => t.mentionedOld).length} old-rule)`);
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
module.exports = { summarizeStanding, distStats, median, scanBetrayalTranscript, scanPromiseTranscript, classifyPromiseThreads, classifyPocketedThreads, classifyCuriousPlants, scanReaskOrphans, classifyDryLines, summarizeBond, summarizeDebrief, PROMISE_MENTION, PROMISE_MENTION_OLD, REPAY_OPENER, REASK_OPENER, DRY_LINE, summarizeGoals, GOAL_KINDS_G, summarizeRequests, scanBondChoices, scanAwayLines, summarizeLangGate, scanDecidedAskReplay, BOND_ASK_POOL };
