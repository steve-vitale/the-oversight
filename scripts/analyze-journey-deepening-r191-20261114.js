// analyze-journey-deepening-r191-20261114.js -- R189 analyzer (tooling
// only, zero game code). Fork of the r188 analyzer, unchanged except the
// seed band / run tag, plus one r191 addition (pre-registered in the
// r191 prereg):
//   - Q1-ORPHAN-TRACE: classifyOrphanTrace joins each RE-ASK-ORPHAN to the
//     driver favor trace (builds/seeds/followups + per-sitting snapshots)
//     and classifies SPOKEN-BEFORE / NEVER-SPOKEN-SAME-SITTING /
//     NEVER-SPOKEN-EARLIER-BUILD / FROMSEED / UNTRACED, with the
//     convoFavorFollowup call site (opener-fromSeed / opener-inherited /
//     stage0-guard / other).
// All r130 sections carried
// (S-TRACE, P-KEEP revised, RE-ASK, B-SIT/B-FOLLOW,
// Q1-REQUESTS, BOND-CHOICE, AWAY-LINE, DEBRIEF, D-THING revised, G-STICK
// revised, RAJ-PHOTO, Q1-LANGGATE regression watch, Q2 REPLAY regression
// watch, Q1-LANGARC, Q2-GOALJOIN, MENU-FLIP regression watch, Q1-LADDER,
// Q2-TRUST, Q1-SECRET, Q2-POSTSECRET, Q1-WANT-AFTER-SECRET,
// Q2-CONFRONT-ON-SECRET, POSTSECRET_STEMS widened) plus the r125 changes
// (Q1-SECRET-LINE-VARIETY, Q2-WANT-OUTCOME-SPLIT, Q1-TEACHFRAME panel-wide
// scan) plus four r129 additions (pre-registered in the r129 prereg, A2 share
// bar in force — see summarizeFavorBlock / summarizePartnerBlock /
// summarizeAwayLineVariety):
//   - Q1-FAVORBLOCK: summarizeFavorBlock counts the Haven-door adjacency
//     block per WORDING (reframe prefixes normalized out), panel-wide.
//     Verdicts (A2 share bar): REPETITIVE (maxRepeat/total >= 0.5) /
//     VARIED (total >= 3, distinct >= 3, share < 0.5) / THIN-PROBE
//     (total < 3).
//   - Q2-PLACEFRAME: PLACE_FRAME_PATTERNS + summarizePlaceFrames mirror
//     the r125 teach-frame scan — panel-wide transcript scan, the place
//     name blanked by the pattern. Verdicts: REPETITIVE (any sitting
//     repeats one frame >= 3) / VARIED (frames >= 1, max same-frame <= 2)
//     / NO-FRAMES (0).
//   - Q3-AWAY: summarizeAwayLineVariety counts the favour-commit away
//     line per WORDING, panel-wide (same maxRepeat shape as Q1).
//     Verdicts: REPETITIVE (>= 3) / VARIED (total >= 3, maxRepeat <= 2)
//     / THIN-PROBE (total < 3).
//   - Q3-CISTERN: scanCisternLines counts "1 liters" (grammar error) vs
//     "1 liter" (correct) in transcripts. Verdicts: GRAMMAR-ERROR (any
//     "1 liters") / CLEAN (0) — the fix is made regardless of the count;
//     the panel is the re-measure.
//   - Q2-TRUST is CARRIED, not re-judged: the computation stays (the
//     data section prints), but the panel line reports CARRIED — the
//     r119 verdict stands and no new trust verdict is drawn this run.
// Single panel — no PANEL env. Filenames: journey-deepening-r191-seedNNNN.json
// and journey-deepening-r191-transcript-<seed>-day<day>-<vid>.txt.
//
// Usage: node scripts/analyze-journey-deepening-r191-20261114.js [evidir]
// Usage: node scripts/analyze-journey-deepening-r191-20261114.js [evidir]
// When required as a module it exports summarizeStanding, distStats, median.
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports summarizeStanding, distStats, median.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-14');
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
// R189 Q1-ORPHAN-TRACE: join each re-ask orphan to the driver favor trace
// (favorTrace from the per-seed JSON: builds/seeds/followups + per-sitting
// snapshots) and classify it against ground truth instead of the
// transcript-only window. favorTraces: {seed: {trace, sittings}}.
// Classes:
//   FROMSEED — the sitting's want carried fromSeed (scan artifact, not an
//     orphan; the favor predates the panel window).
//   SPOKEN-BEFORE — the favor's ask surfaced in an earlier sitting the
//     transcript scan cannot see: a seed was planted for the favor (the
//     phantom-seed rule, Steve 2026-10-07, plants seeds only for wants
//     that reached stage >= 1 — i.e. surfaced), yet no earlier DRIVER
//     sitting named the short, so the surfacing sitting was a policy
//     talkTo the driver never transcribed. Instrument artifact, not a
//     defect. (priorNamed true is the same class via the driver set.)
//   NEVER-SPOKEN-SAME-SITTING — the favor was built in the re-ask sitting
//     itself (build day == re-ask day, no prior sitting named it): the
//     re-ask phrasing spoke for a favor built seconds earlier and never
//     heard. Real defect shape.
//   NEVER-SPOKEN-EARLIER-BUILD — the favor was built on an earlier day, no
//     seed was ever planted for it, and no prior sitting named it: built
//     but never voiced, yet re-asked. Real defect shape.
//   UNTRACED — no followup event matches (trace gap; never a verdict).
// site is the convoFavorFollowup call site from the driver stack
// (convo-wants.js:692 opener-fromSeed, :721 opener-inherited,
// conversation.js:7017 stage0-guard, else the raw file:line).
const ORPHAN_SITE_NAMES = {
  'convo-wants.js:692': 'opener-fromSeed',
  'convo-wants.js:721': 'opener-inherited',
  'conversation.js:7017': 'stage0-guard',
};
function classifyOrphanTrace(orphans, transcripts, favorTraces) {
  const detail = [];
  const counts = {};
  for (const o of orphans) {
    const base = { seed: o.seed, day: o.day, vid: o.vid, short: o.short };
    if (o.fromSeed) {
      counts.FROMSEED = (counts.FROMSEED || 0) + 1;
      detail.push({ ...base, cls: 'FROMSEED', site: null, siteName: null, buildDay: null, priorSittings: 0, priorNamed: false, seedPlantedDay: null });
      continue;
    }
    const ft = ((favorTraces || {})[o.seed] || {}).trace || { builds: [], seeds: [], followups: [] };
    const prior = (transcripts || []).filter(t => String(t.seed) === String(o.seed) && String(t.vid) === String(o.vid) && t.day < o.day);
    const priorNamed = prior.some(t => t.text.split('\n').filter(l => l.indexOf('THEM: ') === 0).some(l => l.toLowerCase().includes(o.short.toLowerCase())));
    const fu = (ft.followups || []).find(f => String(f.vid) === String(o.vid) && f.day === o.day && f.short === o.short);
    const build = fu && fu.favorId
      ? (ft.builds || []).find(b => b.favorId === fu.favorId)
      : (ft.builds || []).find(b => String(b.vid) === String(o.vid) && b.short === o.short && b.day <= o.day);
    const seedEv = fu && fu.favorId ? (ft.seeds || []).find(s => s.favorId === fu.favorId) : null;
    let cls;
    if (!fu) cls = 'UNTRACED';
    else if (priorNamed) cls = 'SPOKEN-BEFORE';
    else if (build && build.day === o.day) cls = 'NEVER-SPOKEN-SAME-SITTING';
    else if (build && build.day < o.day && seedEv) cls = 'SPOKEN-BEFORE';
    else if (build) cls = 'NEVER-SPOKEN-EARLIER-BUILD';
    else cls = 'UNTRACED';
    counts[cls] = (counts[cls] || 0) + 1;
    detail.push({ ...base, cls, site: fu ? fu.site : null, siteName: fu ? (ORPHAN_SITE_NAMES[fu.site] || 'other') : null, buildDay: build ? build.day : null, priorSittings: prior.length, priorNamed, seedPlantedDay: seedEv ? seedEv.day : null });
  }
  return { orphans: orphans.length, counts, detail };
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
    // R116 talkedSittings join (r114 metric-review proposal): a sitting
    // counts as talked-while-live too — request-sittings call startConvo,
    // not talkTo, so the bond instrument's talkTo wrap missed them.
    const sittings = (s && s.talkedSittings) || [];
    const sittingDays = sittings.filter(t => t && String(t.vid) === r.holder && t.day >= r.stagedDay && t.day <= liveEnd).map(t => t.day);
    const talkedDays = [...new Set([...talkTos.filter(t => t.vid === r.holder && t.day >= r.stagedDay && t.day <= liveEnd).map(t => t.day), ...sittingDays])].sort((a, b) => a - b);
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

// R118 Q1-LANGARC: exposure trajectories + GRANT-EVENT flips + decision
// join. Sittings: per nonverbal sitting that opened at comm 'none' — day,
// vid, lang, exposure/comm before/after, picks pressed. A FLIP is a GRANT
// event (driver's langGrants: a 0->1 languages[lang] flip on the
// 25-crossing — the language was earned live, r116 metric-review #1).
// End-state learned languages are reported (endLearnedLangs) but NO
// LONGER count as flips — a succession-granted tongue is the heir's own
// language, not an arc flip. A sitting that reaches exp>=25 / comm leaves
// 'none' with no grant event for that language is an instrument gap
// (unmatchedFlips), not a flip. A post-flip DECISION is a
// langGateDecision on a holder of the flipped language, on or after the
// flip day (the decision record carries vid; sittings carry vid->lang).
// Verdicts (checked in order, per prereg): ARC-FIRES (>=1 flip + >=1
// post-flip decision on that language) -> ARC-FLIPS-NO-PAYOFF (>=1 flip,
// 0 post-flip decisions) -> ARC-UNEXERCISED (0 flips, >=1 sitting) ->
// NO-CONTACT (0 sittings).
function summarizeLangArc(s) {
  const sittings = (s && s.langArcSittings) || [];
  const decisions = (s && s.langGateDecisions) || [];
  const grants = (s && s.langGrants) || [];
  const end = (s && s.langArcEnd) || { langs: [], learned: {} };
  const vidLang = {};
  for (const st of sittings) if (st && st.vid) vidLang[String(st.vid)] = st.lang;
  const perLang = {};
  for (const st of sittings) {
    if (!st || !st.lang) continue;
    const L = (perLang[st.lang] = perLang[st.lang] || { lang: st.lang, sits: 0, maxExp: 0, gain: 0, listens: 0, speakBacks: 0, holders: [], flips: [] });
    L.sits++;
    L.maxExp = Math.max(L.maxExp, st.expAfter | 0);
    L.gain += Math.max(0, (st.expAfter | 0) - (st.expBefore | 0));
    const picks = st.picks || [];
    L.listens += picks.filter(p => p === 'nv:listen').length;
    L.speakBacks += picks.filter(p => p === 'speak_back').length;
    if (L.holders.indexOf(st.vid) < 0) L.holders.push(st.vid);
  }
  // Grant-event flips: one per (lang, vid) grant, deduped by day+vid.
  for (const g of grants) {
    if (!g || !g.lang) continue;
    const L = (perLang[g.lang] = perLang[g.lang] || { lang: g.lang, sits: 0, maxExp: g.expAfter | 0, gain: 0, listens: 0, speakBacks: 0, holders: [], flips: [] });
    L.maxExp = Math.max(L.maxExp, g.expAfter | 0);
    if (g.vid && L.holders.indexOf(String(g.vid)) < 0) L.holders.push(String(g.vid));
    if (!L.flips.some(f => f.day === g.day && f.vid === String(g.vid))) {
      L.flips.push({ day: g.day, vid: String(g.vid), expAfter: g.expAfter | 0, commAfter: 'partial', via: 'grant' });
    }
  }
  // Instrument-gap check: a sitting that reached exp>=25 / comm left
  // 'none' with no grant event for that language.
  const unmatchedFlips = [];
  for (const st of sittings) {
    if (!st || !st.lang) continue;
    if ((st.expAfter | 0) >= 25 || (st.commBefore === 'none' && st.commAfter !== 'none')) {
      const L = perLang[st.lang];
      if (!L || !L.flips.some(f => f.day === st.day)) unmatchedFlips.push({ day: st.day, vid: st.vid, lang: st.lang, expAfter: st.expAfter | 0, commAfter: st.commAfter });
    }
  }
  // End-state learned languages: reported, never counted as flips.
  const endLearnedLangs = [];
  for (const e of (end.langs || [])) {
    if (!e || !e.lang || !(e.learned >= 1)) continue;
    const L = (perLang[e.lang] = perLang[e.lang] || { lang: e.lang, sits: 0, maxExp: e.exposure | 0, gain: 0, listens: 0, speakBacks: 0, holders: [], flips: [] });
    L.maxExp = Math.max(L.maxExp, e.exposure | 0);
    endLearnedLangs.push({ lang: e.lang, exposure: e.exposure | 0 });
  }
  let flipsTotal = 0, postFlipDecisions = 0;
  const flipDetail = [];
  for (const lang of Object.keys(perLang)) {
    const L = perLang[lang];
    flipsTotal += L.flips.length;
    for (const f of L.flips) {
      const holders = L.holders;
      const post = decisions.filter(d => d && holders.indexOf(String(d.vid)) >= 0 && (f.day == null || d.day >= f.day));
      postFlipDecisions += post.length;
      flipDetail.push({ lang, flipDay: f.day, flipVid: f.vid, expAfter: f.expAfter, postDecisions: post.map(d => ({ day: d.day, fn: d.fn, vid: d.vid, comm: d.comm })) });
    }
  }
  let verdict;
  if (flipsTotal >= 1 && postFlipDecisions >= 1) verdict = 'ARC-FIRES';
  else if (flipsTotal >= 1) verdict = 'ARC-FLIPS-NO-PAYOFF';
  else if (sittings.length >= 1) verdict = 'ARC-UNEXERCISED';
  else verdict = 'NO-CONTACT';
  return { sittings: sittings.length, langs: perLang, flips: flipsTotal,
    postFlipDecisions, flipDetail, grants: grants.length, unmatchedFlips,
    endLearnedLangs,
    endLangs: end.langs || [], endLearned: end.learned || {},
    verdict };
}

// R116 Q2-GOALJOIN: per convo day, join goalSnaps (top / objKind /
// objGoal / objGoalLine / objState) with goalLineDays (GOAL_LINES hits in
// new capture lines that day). Per track, pooled across days:
//   tops = villagers holding the track as top goal;
//   lined = tops whose objective carries that track's goalLine;
//   departedLined = lined villagers out on it (objState 'returning' or
//     'active' — the departure line is said when they leave, so a snap
//     catching them out means the line was said; 'returning' is the
//     clean case, 'active' the same-day case — see the run note);
//   indoorLined (r118) = lined villagers whose objective state is
//     'indoor' (the HAVEN_CHORE / indoor VISIT channel — the safety fix's
//     mechanism: tops -> lined-indoors -> capture);
//   capture = GOAL_LINES hits for the track across the panel.
// Per-track verdicts (checked in order): HEALTHY (capture > 0) ->
// COUNTER-FAULT (departedLined > 0, capture == 0: the line exists on a
// departed villager but never reaches the log the counter reads) ->
// GOALS-FAULT (tops > 0, lined == 0: the goal never becomes a lined
// objective) -> NO-DATA (tops == 0).
function summarizeGoalJoin(s) {
  const snaps = (s && s.goalSnaps) || [];
  const lineDays = (s && s.goalLineDays) || [];
  const tracks = ['party_up', 'gear_up', 'bank_veterans', 'build_standing', 'food_security', 'bonds', 'knowledge', 'safety'];
  const byTrack = {};
  for (const t of tracks) byTrack[t] = { track: t, tops: 0, lined: 0, departedLined: 0, indoorLined: 0, capture: 0, detail: [] };
  for (const sn of snaps) {
    const day = sn.day;
    const ld = lineDays.find(x => x && x.day === day);
    for (const v of (sn.villagers || [])) {
      if (!v || !v.top || !byTrack[v.top]) continue;
      const T = byTrack[v.top];
      T.tops++;
      if (v.objGoal === v.top && v.objGoalLine) {
        T.lined++;
        if (v.objState === 'indoor') T.indoorLined++;
        if (v.objState === 'returning' || v.objState === 'active') {
          T.departedLined++;
          T.detail.push({ day, name: v.name, objKind: v.objKind, objState: v.objState, goalLine: v.objGoalLine });
        }
      }
    }
    if (ld && ld.counts) for (const t of tracks) byTrack[t].capture += (ld.counts[t] | 0);
  }
  for (const t of tracks) {
    const T = byTrack[t];
    if (T.capture > 0) T.verdict = 'HEALTHY';
    else if (T.departedLined > 0) T.verdict = 'COUNTER-FAULT';
    else if (T.tops > 0) T.verdict = 'GOALS-FAULT';
    else T.verdict = 'NO-DATA';
  }
  return { byTrack, goalLines: (s && s.goalLines) || null };
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
// R188 Q1 V-INIT SCAN REPAIR (r187's carried fix): the old BOND_THEM regex
// flagged 2 outing false positives (a water-haul outing ask; an outing
// resume) and missed the one true staged proposal ("bonded" wasn't in it).
// Counted V-INIT-BOND is now the exact ask-line shapes (BOND_ASK_POOL /
// linkRaiseLine templates via isAskLine) plus the bonded/stick-with-me
// shapes, so a pool drift still counts. Bare `outing` is out of the
// counted set entirely. The old broad shapes survive as V-INIT-CANDIDATE —
// printed for manual review, never counted.
const BOND_PROPOSAL_SHAPES = /bonded|stick with me|bonded friend|watch each other's backs/i;
const BOND_THEM_CANDIDATE = /(join (me|us)|come with (me|us)|travel together|come visit|visit me|stay with us|link (our|the) village|covenant|trade pact|be my (partner|ally)|let'?s (go|head|travel|hunt|forage) together)/i;
function isBondProposalLine(norm) {
  if (isAskLine(norm)) return true;
  return BOND_PROPOSAL_SHAPES.test(norm);
}
// transcripts: [{file, seed, day, vid, text}] — one transcript per sitting.
// Returns { bondSittings, transcripts, playerInviteOfferedSittings,
// betrayalOfferedSittings, detail, candidates, rows } — rows carry the
// per-file counts the panel log prints.
function scanVInit(transcripts) {
  let bondSittings = 0, playerInviteOffered = 0, betrayalOffered = 0;
  const detail = [], candidates = [], rows = [];
  for (const t of (transcripts || [])) {
    const text = String((t && t.text) || '');
    const lines = text.split('\n');
    const wantLine = lines.find(l => l.indexOf('want: ') === 0) || '';
    const themLines = lines.filter(l => l.indexOf('THEM: ') === 0);
    const bondLines = themLines.filter(l => isBondProposalLine(normThem(l)));
    const candLines = themLines.filter(l => !isBondProposalLine(normThem(l)) && BOND_THEM_CANDIDATE.test(normThem(l)));
    const offeredInvite = lines.some(l => /\(offered=[^)]*(invite_party|dlg:invite)/.test(l));
    const offeredBetrayal = lines.some(l => /\(offered=[^)]*betrayal:accept/.test(l));
    if (offeredInvite) playerInviteOffered++;
    if (offeredBetrayal) betrayalOffered++;
    rows.push({ file: t.file, want: wantLine, bondLines: bondLines.length, playerInviteOffered: offeredInvite, betrayalOffered: offeredBetrayal });
    if (bondLines.length) { bondSittings++; detail.push({ file: t.file, want: wantLine, lines: bondLines.slice(0, 3) }); }
    if (candLines.length) candidates.push({ file: t.file, want: wantLine, lines: candLines.slice(0, 3) });
  }
  return { bondSittings, transcripts: (transcripts || []).length, playerInviteOfferedSittings: playerInviteOffered, betrayalOfferedSittings: betrayalOffered, detail, candidates, rows };
}
// R188 Q2 DOUBLE-ASK CENSUS (Chantal r187): the same bond ask line spoken
// twice in one sitting — canon "No repeats, ever" (docs/CONVERSATIONS.md).
// Per transcript, group THEM lines by normalized ask-line text; a line
// appearing 2+ times is a double-ask. Records the YOU picks between the
// two speakings and the menu offered right after the second speaking, so
// the trigger path (opener-carried vs held-beat continuer vs beat
// re-speak) can be named from the transcript.
function scanDoubleAsk(transcripts) {
  const detail = [];
  for (const t of (transcripts || [])) {
    const lines = String((t && t.text) || '').split('\n');
    const seen = {};
    lines.forEach((l, i) => {
      if (l.indexOf('THEM: ') !== 0) return;
      const norm = normThem(l);
      if (!isAskLine(norm)) return;
      (seen[norm] = seen[norm] || []).push(i);
    });
    for (const norm of Object.keys(seen)) {
      const idxs = seen[norm];
      if (idxs.length < 2) continue;
      const first = idxs[0], second = idxs[1];
      const betweenPicks = lines.slice(first + 1, second).filter(l => l.indexOf('YOU: ') === 0);
      let offeredAfterSecond = null;
      for (let j = second + 1; j < lines.length; j++) {
        const m = /^\(offered=([^)]*)\)$/.exec(lines[j].trim());
        if (m) { offeredAfterSecond = m[1]; break; }
        if (lines[j].indexOf('THEM: ') === 0) break;
      }
      detail.push({ file: t.file, seed: t.seed, day: t.day, vid: t.vid, kind: isAskLine(norm), line: norm, count: idxs.length, betweenPicks: betweenPicks.slice(0, 6), offeredAfterSecond });
    }
  }
  return { doubleSittings: detail.length, detail };
}
// R118 MENU-FLIP scan: a nonverbal sitting whose menu loses every nv:
// id after a listen turn (the endtopic flip — sayLine's no-repeat
// fallback tagged the listen beat endtopic, so buildMenu returned the
// verbal dlg:subject/leave menu). Per transcript (one sitting):
//   flip = a turn offering dlg:subject with no nv: id and no speak_back,
//   after an earlier turn offered nv:listen.
// listenTurns = turns offering nv:listen (the fix's direct evidence:
// before-panel ~2-3, after-panel up to the sitting budget).
function scanMenuFlip(transcripts) {
  const out = [];
  for (const t of (transcripts || [])) {
    const text = String((t && t.text) || '');
    const lines = text.split('\n');
    let sawListenOffer = false;
    let listenTurns = 0;
    let flip = null;
    let turn = 0;
    for (const line of lines) {
      const m = /^\(offered=([^)]*)\)$/.exec(line.trim());
      if (!m) continue;
      const ids = m[1] ? m[1].split(',').filter(Boolean) : [];
      const hasListen = ids.indexOf('nv:listen') >= 0;
      const hasNv = ids.some(id => id.indexOf('nv:') === 0);
      const hasSpeakBack = ids.indexOf('speak_back') >= 0;
      if (hasListen) { sawListenOffer = true; listenTurns++; }
      if (sawListenOffer && !flip && ids.indexOf('dlg:subject') >= 0 && !hasNv && !hasSpeakBack) {
        flip = { seed: t.seed, day: t.day, vid: t.vid, turn, listenTurns, offered: ids.slice() };
      }
      turn++;
    }
    if (sawListenOffer) out.push({ seed: t.seed, day: t.day, vid: t.vid, flip: flip || null, listenTurns });
  }
  return out;
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

// R119 Q1-LADDER: the leg-1 Standing ladder, read live on real villages.
// snaps: {day, stage, peakStage, counted, cap, tracks, countedTracks,
// capped, shortfall, nextThreshold, detail} (or {day, err}).
// Per-seed verdicts (prereg, checked in order): BROKEN (any snap err,
// or counted >= nextThreshold while stage 0 — the read contradicts the
// rung rule — or a countedTrack above the cap) -> OPENS (stage >= 1 by
// day 80) -> LATE (first stage >= 1 after day 80) -> SILENT (never
// stage >= 1). MINTS is panel-level (all five tracks mint > 0 on >= 1
// seed each). Stage drops (peak > live at horizon) are reported: the
// ladder is LIVE, not ratcheted — deaths can pull a stage down.
function summarizeLadder(s) {
  const snaps = (s && s.ladderSnaps) || [];
  const ok = snaps.filter(x => x && !x.err);
  const errs = snaps.filter(x => x && x.err);
  const tracks = ['fight', 'forage', 'craft', 'talk', 'explore'];
  const minted = {};
  for (const t of tracks) minted[t] = 0;
  let firstStageDay = null, peakStage = 0, lastStage = null;
  const inconsistent = [];
  for (const x of ok) {
    if (x.stage != null) {
      if (firstStageDay == null && x.stage >= 1) firstStageDay = x.day;
      peakStage = Math.max(peakStage, x.stage);
      lastStage = x.stage;
    }
    if (x.countedTracks) for (const t of tracks) minted[t] = Math.max(minted[t], x.countedTracks[t] | 0);
    // counted is the capped total toward the NEXT rung: counted >=
    // nextThreshold while stage 0 contradicts the rung rule.
    if (x.stage === 0 && x.nextThreshold != null && (x.counted | 0) >= x.nextThreshold) {
      inconsistent.push({ day: x.day, counted: x.counted, nextThreshold: x.nextThreshold });
    }
    // cap arithmetic: no countedTrack may exceed the cap (skipped when
    // the read carries no cap, e.g. at National with no next rung).
    if (x.cap != null && x.countedTracks) {
      for (const t of tracks) {
        if ((x.countedTracks[t] | 0) > x.cap) inconsistent.push({ day: x.day, track: t, countedTrack: x.countedTracks[t], cap: x.cap });
      }
    }
  }
  const last = ok.length ? ok[ok.length - 1] : null;
  // Stage drops: EVERY snap where the peak exceeds the live stage (the
  // ladder is LIVE, not ratcheted — deaths can pull a stage down, and a
  // drop can happen before the first snap, as the smoke's day-40
  // peak-3/stage-2 read showed).
  const stageDrops = ok.filter(x => x.peakStage != null && x.stage != null && x.peakStage > x.stage)
    .map(x => ({ day: x.day, peak: x.peakStage, live: x.stage }));
  let verdict;
  if (errs.length || inconsistent.length) verdict = 'BROKEN';
  else if (firstStageDay != null && firstStageDay <= 80) verdict = 'OPENS';
  else if (firstStageDay != null) verdict = 'LATE';
  else verdict = 'SILENT';
  return { snaps: snaps.length, errors: errs, inconsistent, firstStageDay, peakStage, lastStage,
    holds: peakStage > 0 && lastStage === peakStage,
    minted, stageDrops, verdict,
    trajectory: ok.map(x => ({ day: x.day, stage: x.stage, counted: x.counted, cap: x.cap, shortfall: x.shortfall })) };
}

// R122 Q1-SECRET (r120 metric review #1 + #2): the villager's
// high-trust confession, answered?
// secretSittings: {day, vid, secretLine, firstMenu: [{id, label}],
// picks: [ids], teachPicks, wantFinal: {id, stage, resolution},
// answerTurn, answerKind, postAnswerPicks, postAnswerThem}.
// Addressing counts a secret: PICK anywhere in the sitting's picks —
// a confession answered on turn 2 after a pending betrayal invitation
// is still answered (the r120 analyzer's first-menu rule undercounted
// exactly those). Generic dlg:react is a bare acknowledgment, NOT an
// addressing choice. CROWDED splits (r120 metric review #2):
// TEACH-CROWDED = teach picked >= 2 times BEFORE the first secret:
// pick (the r119 defect shape: teaching pre-empts the confession);
// WANT-OPEN = the want left unestablished at sitting end (the want's
// own lifecycle, not the secret's business).
// Per-seed verdicts: NO-SECRET -> UNANSWERED (opener, zero addressing)
// -> ANSWERED (>= 1 addressing pick).
function summarizeSecret(s) {
  const recs = (s && s.secretSittings) || [];
  let addressing = 0, teachPicks = 0, wantEstablished = 0, teachCrowded = 0, wantOpen = 0, confrontRides = 0;
  const detail = [];
  for (const r of recs) {
    const picks = (r.picks || []).filter(Boolean);
    const firstSecretIdx = picks.findIndex(id => id.indexOf('secret:') === 0);
    const addr = firstSecretIdx >= 0;
    if (addr) addressing++;
    teachPicks += (r.teachPicks | 0);
    const teachBefore = firstSecretIdx < 0 ? (r.teachPicks | 0)
      : picks.slice(0, firstSecretIdx).filter(id => id === 'teach').length;
    const wf = r.wantFinal || {};
    const est = !(wf.resolution === 'none' || wf.resolution === 'unestablished' || wf.resolution == null);
    if (est) wantEstablished++;
    const isTeachCrowded = teachBefore >= 2;
    if (isTeachCrowded) teachCrowded++;
    const isWantOpen = !est;
    if (isWantOpen) wantOpen++;
    // R124 Q2-CONFRONT: a confront:* id riding the secret menu (the
    // truth.js wrapper appends it whenever an open doubt exists).
    if (r.confrontOnSecretMenu) confrontRides++;
    detail.push({ day: r.day, vid: r.vid, addr, teachPicks: r.teachPicks | 0, teachBefore, wantEstablished: !!est, teachCrowded: isTeachCrowded, wantOpen: isWantOpen, answerTurn: r.answerTurn == null ? null : r.answerTurn, answerKind: r.answerKind || null, confrontOnSecretMenu: !!r.confrontOnSecretMenu, wantStart: r.wantStart || null });
  }
  let verdict;
  if (!recs.length) verdict = 'NO-SECRET';
  else if (addressing === 0) verdict = 'UNANSWERED';
  else verdict = 'ANSWERED';
  return { openers: recs.length, addressing, teachPicks, wantEstablished, teachCrowded, wantOpen, confrontRides, detail, verdict };
}

// R124 Q1-WANT-AFTER-SECRET: after the confession is answered, does the
// villager's underlying want surface? Reads the driver's wantStart /
// wantFinal per ANSWERED secret sitting. ESTABLISHED = wantFinal
// resolution leaves none/unestablished; NEWLY-ESTABLISHED = wantStart
// unestablished and wantFinal established (the want surfaced DURING the
// sitting, not before it). Verdicts per prereg: SURFACES (>= 50% of
// answered establish) / STAYS-BURIED (0 of >= 2 answered) / MIXED /
// NO-ANSWERS / THIN-PROBE (< 2 answered — the pool was 2 in r122).
function summarizeWantAfterSecret(s) {
  const recs = (s && s.secretSittings) || [];
  const answered = recs.filter(r => r && r.answerTurn != null);
  let established = 0, newlyEstablished = 0, landed = 0, surfacedOnly = 0, otherEstablished = 0;
  const detail = [];
  for (const r of answered) {
    const wf = r.wantFinal || {};
    const ws = r.wantStart || {};
    const est = !(wf.resolution === 'none' || wf.resolution === 'unestablished' || wf.resolution == null);
    const startUnest = (ws.resolution === 'none' || ws.resolution === 'unestablished' || ws.resolution == null);
    if (est) established++;
    const newly = est && startUnest;
    if (newly) newlyEstablished++;
    // R125 Q2-WANT-OUTCOME-SPLIT: an established want LANDS when its
    // resolution is promised/stated, and merely SURFACES when it is
    // deflected/unresolved. Any other established resolution is counted
    // separately so the split never silently absorbs it.
    let outcome = 'n/a';
    if (est) {
      if (wf.resolution === 'promised' || wf.resolution === 'stated') { landed++; outcome = 'landed'; }
      else if (wf.resolution === 'deflected' || wf.resolution === 'unresolved') { surfacedOnly++; outcome = 'surfaced-only'; }
      else { otherEstablished++; outcome = 'other:' + String(wf.resolution); }
    }
    detail.push({ day: r.day, vid: r.vid, wantId: wf.id || 'none', wantStart: ws, wantFinal: wf, established: est, newlyEstablished: newly, outcome });
  }
  let verdict;
  if (!answered.length) verdict = 'NO-ANSWERS';
  else if (answered.length < 2) verdict = 'THIN-PROBE';
  else if (established === 0) verdict = 'STAYS-BURIED';
  else if (established * 2 >= answered.length) verdict = 'SURFACES';
  else verdict = 'MIXED';
  let outcomeVerdict;
  if (!answered.length) outcomeVerdict = 'NO-ANSWERS';
  else if (answered.length < 2) outcomeVerdict = 'THIN-PROBE';
  else if (established === 0) outcomeVerdict = 'NO-ESTABLISHED';
  else if (landed === 0) outcomeVerdict = 'SURFACES-ONLY';
  else if (landed * 2 >= established) outcomeVerdict = 'LANDS';
  else outcomeVerdict = 'MIXED';
  return { openers: recs.length, answered: answered.length, established, newlyEstablished, landed, surfacedOnly, otherEstablished, outcome: outcomeVerdict, detail, verdict };
}

// R122 Q2-POSTSECRET: after the confession is answered, does the
// sitting have somewhere to go? Reads the driver's answerTurn /
// postAnswerThem per secret sitting. DRY_FIRST: the first post-answer
// THEM line is the generic small-talk dry line ("That's... pretty much
// all of it, honestly.") or a fizzle ("lost my train of thought").
// REFERENCES: a post-answer THEM line contains a secret-content stem
// from the six secret templates (conversation.js synthPrototype):
// skimming/sneaking/hiding/injury/letters/ashamed/froze/cruel/stole/
// trusted/photo/candy/practicing/family/swim/terrified/lying/younger/
// read/cry/quietly/stars/medicine/stash/confessed/rations/woods.
// The literacy "teach me" plant is the ANSWER line itself, not a
// post-answer line, and never counts here. The transcript read is the
// verdict; these counts are the instrument.
// R124 STEM WIDENING (r122 metric-review proposal): the old list matched
// the secret TEXT, not the follow-up lines this instrument reads — the
// night follow-up ("The nights are still long...") and the kept-secret
// follow-up ("I still keep it to myself...") carried no stem, so a
// night/kept-secret-only panel could have read MIXED with the follow-up
// landing. 'night' matches "nights are still long"; 'keep' matches
// "I still keep it to myself" (kept-secret) and "I still keep the
// photo" (photo — also a follow-up line, correctly counted).
const POSTSECRET_DRY = /pretty much all of it|lost my train of thought/i;
const POSTSECRET_STEMS = ['skimming', 'sneaking', 'hiding', 'injury', 'letters', 'ashamed', 'froze', 'cruel', 'stole', 'trusted', 'photo', 'candy', 'practicing', 'family', 'swim', 'terrified', 'lying', 'younger', 'read', 'cry', 'quietly', 'stars', 'medicine', 'stash', 'confessed', 'rations', 'woods', 'night', 'keep'];
function summarizePostSecret(s) {
  const recs = (s && s.secretSittings) || [];
  const answered = recs.filter(r => r && r.answerTurn != null);
  let dryFirst = 0, referencing = 0;
  const detail = [];
  for (const r of answered) {
    const them = (r.postAnswerThem || []).map(x => String(x));
    const first = them[0] || '';
    const isDry = them.length === 0 || POSTSECRET_DRY.test(first);
    if (isDry) dryFirst++;
    const refs = them.some(l => POSTSECRET_STEMS.some(st => l.toLowerCase().indexOf(st) !== -1));
    if (refs) referencing++;
    detail.push({ day: r.day, vid: r.vid, answerKind: r.answerKind || null, postAnswerTurns: them.length, dryFirst: isDry, references: refs, firstPostAnswer: first.slice(0, 120) });
  }
  const turns = detail.map(d => d.postAnswerTurns);
  return { openers: recs.length, answered: answered.length, medianPostAnswerTurns: median(turns), dryFirst, referencing, detail };
}

// R125 Q1-SECRET-LINE-VARIETY: does the confession's own reply line repeat
// verbatim across sittings, and does the teach-plant frame repeat within a
// sitting? Reads the driver's answerLine (the THEM line on the answer turn
// — NOT a post-answer line) and teachLines (THEM lines on teach picks) per
// ANSWERED secret sitting. Teach frames are normalized by matching the line
// against the known frame patterns: exact-text dedupe cannot see the frame
// repeat because the taught plant differs each time. A line matching no
// known pattern is reported as unknown:<prefix> — after a fix adds new
// variants, the pattern list must grow with it, or the after-panel reads
// every new frame as unknown. Verdicts per prereg: REPETITIVE (one answer
// line repeats >= 3 times, or one teach frame repeats >= 3 times in a
// sitting) / VARIED (>= 2 answered, max-repeat <= 2, no sitting repeats a
// teach frame >= 3 times) / THIN-PROBE (< 2 answered) / NO-DATA (an
// answered sitting carries no answerLine — foreign data from a driver
// that never recorded it; the r125 driver always records it).
const TEACH_FRAME_PATTERNS = [
  // The pre-fix frame (villager-agency.js): "This one — <plant>. Leaf, stem, smell. You won't forget it now."
  { id: 'teachplant-leafstem', re: /^"This one — .*\. Leaf, stem, smell\. You won't forget it now\."$/ },
  // R125 fix variants (villager-agency.js convoTeachPlantLine) — added
  // with the fix so the after-panel normalizes them instead of reading
  // every new frame as unknown.
  { id: 'teachplant-crushtaste', re: /^".* — crush the leaf, smell it, taste the stem\. That's how you know it\."$/ },
  { id: 'teachplant-lookfeel', re: /^"This one is .*\. Look at the leaf, feel the stem, breathe it in\. It'll stick\."$/ },
  { id: 'teachplant-remember', re: /^".*\. Remember the leaf, the stem, the smell — that's the whole of it\."$/ },
];
function teachFrameId(line) {
  const t = String(line || '');
  for (const p of TEACH_FRAME_PATTERNS) if (p.re.test(t)) return p.id;
  return 'unknown:' + t.slice(0, 40);
}
function summarizeSecretVariety(s) {
  const recs = (s && s.secretSittings) || [];
  const answered = recs.filter(r => r && r.answerTurn != null);
  const answerLines = answered.map(r => String(r.answerLine || ''));
  const missingAnswer = answered.filter(r => !r.answerLine).length;
  const counts = {};
  for (const l of answerLines) if (l) counts[l] = (counts[l] || 0) + 1;
  const distinctAnswers = Object.keys(counts).length;
  const maxRepeat = Object.keys(counts).reduce((m, k) => Math.max(m, counts[k]), 0);
  let maxSameFrame = 0, teachPicks = 0, teachFramesDistinct = 0;
  const detail = [];
  for (const r of answered) {
    const frames = (r.teachLines || []).map(teachFrameId);
    teachPicks += frames.length;
    const fc = {};
    for (const f of frames) fc[f] = (fc[f] || 0) + 1;
    const sittingMax = Object.keys(fc).reduce((m, k) => Math.max(m, fc[k]), 0);
    if (sittingMax > maxSameFrame) maxSameFrame = sittingMax;
    teachFramesDistinct += Object.keys(fc).length;
    detail.push({ day: r.day, vid: r.vid, answerKind: r.answerKind || null, answerLine: String(r.answerLine || '').slice(0, 120), teachPicks: frames.length, teachFrames: frames, maxSameFrame: sittingMax });
  }
  let verdict;
  if (answered.length < 2) verdict = 'THIN-PROBE';
  else if (missingAnswer > 0) verdict = 'NO-DATA';
  else if (maxRepeat >= 3 || maxSameFrame >= 3) verdict = 'REPETITIVE';
  else verdict = 'VARIED';
  return { openers: recs.length, answered: answered.length, distinctAnswers, maxRepeat, missingAnswer, teachPicks, teachFramesDistinct, maxSameFrame, detail, verdict };
}

// R125 A1 TEACHFRAME (panel-wide transcript scan): the teach-plant frame
// repeats in ORDINARY sittings, not secret sittings — the secret-sitting
// instrument (teachLines) saw 0 teach picks in this panel while the wild
// transcripts carry the frame 8 times, 7 in one sitting. Scans the panel
// transcripts (ptrans: {seed, day, vid, text}) for THEM lines matching a
// known teach-frame pattern; the plant name is blanked by the pattern, so
// only the FRAME counts. A line matching no known pattern is skipped (it
// is ordinary dialogue, not a teach line) — never silently counted as a
// frame. Verdicts: REPETITIVE (any sitting repeats one frame >= 3 times)
// / VARIED (frames >= 1, max same-frame <= 2) / NO-FRAMES (0 frames).
function summarizeTeachFrames(transcripts) {
  let frames = 0, maxSameFrame = 0, sittingsWithFrames = 0;
  const frameCounts = {};
  const detail = [];
  for (const t of transcripts || []) {
    const lines = String(t.text || '').split('\n');
    const fc = {};
    for (const ln of lines) {
      const m = /^THEM: (.*)$/.exec(ln);
      if (!m) continue;
      const fid = teachFrameId(m[1]);
      if (fid.indexOf('unknown:') === 0) continue;
      frames++;
      fc[fid] = (fc[fid] || 0) + 1;
    }
    const keys = Object.keys(fc);
    if (!keys.length) continue;
    sittingsWithFrames++;
    for (const k of keys) frameCounts[k] = (frameCounts[k] || 0) + fc[k];
    const sittingMax = keys.reduce((a, k) => Math.max(a, fc[k]), 0);
    if (sittingMax > maxSameFrame) maxSameFrame = sittingMax;
    detail.push({ seed: t.seed, day: t.day, vid: t.vid, frames: keys.reduce((a, k) => a + fc[k], 0), frameCounts: fc, maxSameFrame: sittingMax });
  }
  const distinctFrames = Object.keys(frameCounts).length;
  let verdict;
  if (frames === 0) verdict = 'NO-FRAMES';
  else if (maxSameFrame >= 3) verdict = 'REPETITIVE';
  else verdict = 'VARIED';
  return { frames, sittingsWithFrames, distinctFrames, maxSameFrame, frameCounts, detail, verdict };
}

// R129 Q2-PLACEFRAME (panel-wide transcript scan, mirroring r125's
// summarizeTeachFrames): the place-lesson line is ONE fixed frame with
// only the place swapped (villager-agency.js:985) — the same defect class
// as the plant frame. The place name is blanked by the pattern, so only
// the FRAME counts. A line matching no known pattern is skipped (ordinary
// dialogue, not a place lesson) — never silently counted as a frame.
// Verdicts: REPETITIVE (any sitting repeats one frame >= 3 times) /
// VARIED (frames >= 1, max same-frame <= 2) / NO-FRAMES (0 frames).
const PLACE_FRAME_PATTERNS = [
  // The pre-fix frame (villager-agency.js): "<place> — I'll show you on the map sometime. It's real."
  { id: 'teachplace-mapshow', re: /^".* — I'll show you on the map sometime\. It's real\."$/ },
  // R129 fix variants (villager-agency.js convoTeachPlaceLine) — added
  // with the fix so the after-panel normalizes them instead of reading
  // every new frame as unknown.
  { id: 'teachplace-trace', re: /^".* — trace it with your finger\. That's where it is, and it's real\."$/ },
  { id: 'teachplace-mark', re: /^".* — I'll mark it on your map when we're back\. It's real, I've stood there\."$/ },
  { id: 'teachplace-walk', re: /^".* — walk it with me sometime and you'll know the ground\. It's real\."$/ },
  { id: 'teachplace-remember', re: /^".* — remember the shape of it\. It's real, and it's worth knowing\."$/ },
];
function placeFrameId(line) {
  const t = String(line || '');
  for (const p of PLACE_FRAME_PATTERNS) if (p.re.test(t)) return p.id;
  return 'unknown:' + t.slice(0, 40);
}
function summarizePlaceFrames(transcripts) {
  let frames = 0, maxSameFrame = 0, sittingsWithFrames = 0;
  const frameCounts = {};
  const detail = [];
  for (const t of transcripts || []) {
    const lines = String(t.text || '').split('\n');
    const fc = {};
    for (const ln of lines) {
      const m = /^THEM: (.*)$/.exec(ln);
      if (!m) continue;
      const fid = placeFrameId(m[1]);
      if (fid.indexOf('unknown:') === 0) continue;
      frames++;
      fc[fid] = (fc[fid] || 0) + 1;
    }
    const keys = Object.keys(fc);
    if (!keys.length) continue;
    sittingsWithFrames++;
    for (const k of keys) frameCounts[k] = (frameCounts[k] || 0) + fc[k];
    const sittingMax = keys.reduce((a, k) => Math.max(a, fc[k]), 0);
    if (sittingMax > maxSameFrame) maxSameFrame = sittingMax;
    detail.push({ seed: t.seed, day: t.day, vid: t.vid, frames: keys.reduce((a, k) => a + fc[k], 0), frameCounts: fc, maxSameFrame: sittingMax });
  }
  const distinctFrames = Object.keys(frameCounts).length;
  let verdict;
  if (frames === 0) verdict = 'NO-FRAMES';
  else if (maxSameFrame >= 3) verdict = 'REPETITIVE';
  else verdict = 'VARIED';
  return { frames, sittingsWithFrames, distinctFrames, maxSameFrame, frameCounts, detail, verdict };
}

// R184 Q1-PLACEPROBE: the place-lesson funnel from the driver's
// placeProbeSittings (per sitting: placesKnown at sitting start,
// askFieldPicks, askFieldLines). Bottleneck stages: KNOWLEDGE (no sitting
// ever has placesKnown >= 1), ASK (sittings know places but the pick is
// never chosen), SPEND-FIRST (asks happen but no place frame is drawn —
// monster/plant lessons spend first), FIRES (frames drawn). Frame
// counting reuses placeFrameId on the askFieldLines; a non-place ask line
// counts in askLines but never in frames.
function summarizePlaceProbe(seedJsons) {
  let sittings = 0, withPlaces = 0, withPlaces2 = 0, askPicks = 0, askLines = 0, frames = 0;
  const frameCounts = {};
  const detail = [];
  for (const s of seedJsons || []) {
    for (const p of (s.placeProbeSittings || [])) {
      sittings++;
      if (p.placesKnown >= 1) withPlaces++;
      if (p.placesKnown >= 2) withPlaces2++;
      askPicks += p.askFieldPicks || 0;
      for (const l of (p.askFieldLines || [])) {
        askLines++;
        const fid = placeFrameId(l);
        if (fid.indexOf('unknown:') === 0) continue;
        frames++;
        frameCounts[fid] = (frameCounts[fid] || 0) + 1;
      }
      if (p.placesKnown >= 1 || (p.askFieldPicks || 0) > 0) detail.push({ seed: s.seed, day: p.day, vid: p.vid, placesKnown: p.placesKnown, askFieldPicks: p.askFieldPicks, askFieldLines: (p.askFieldLines || []).length });
    }
  }
  let bottleneck = 'NO-DATA';
  if (sittings === 0) bottleneck = (seedJsons || []).some(s => Array.isArray(s.placeProbeSittings)) ? 'NO-SITTINGS' : 'NO-DATA';
  else if (withPlaces === 0) bottleneck = 'KNOWLEDGE';
  else if (askPicks === 0) bottleneck = 'ASK';
  else if (frames === 0) bottleneck = 'SPEND-FIRST';
  else bottleneck = 'FIRES';
  return { sittings, withPlaces, withPlaces2, askPicks, askLines, frames, frameCounts, bottleneck, detail };
}

// R187 Q1-SECRETPROBE: the confession funnel (prereg Q1). The gate
// (conversation.js convoOpening secret branch): trust >= 40 AND the
// villager has a secret AND it was not shared before AND no acute favor
// need owns the opening AND no higher-priority opener won (request /
// want / grief / table sit above the secret) AND the 20% roll AND the
// line is not ledger-blocked. The driver records per sitting: trust,
// hasSecret ('unknown' when the prototype was never synthesized — e.g.
// a refused sitting), secretSharedBefore, acuteNeed (false / true /
// 'unknown'), openerThread, confessionFired. Stages:
//   sittings -> trust40 -> eligible (trust40 + hasSecret + !shared +
//   !acute) -> branchReached (eligible + openerThread NOT in the
//   above-secret set) -> fired.
// The 20% roll and the ledger-block are unobservable from outside, so
// branchReached-minus-fired is "roll-or-ledger", never attributed to
// either. firedNotEligible is an instrument sanity check: a fired
// confession must have been eligible, so a nonzero count means the
// instrument misreads a stage. Verdicts per prereg: FIRES (>= 1
// confession) / QUIET-PATH (0 fired, branchReached >= 5) / NO-DATA
// (0 fired, branchReached < 5).
const SECRET_ABOVE = ['request', 'want', 'grief', 'table'];
function summarizeSecretProbe(seedJsons) {
  let sittings = 0, trust40 = 0, eligible = 0, branchReached = 0, fired = 0, firedNotEligible = 0, acuteUnknown = 0, secretUnknown = 0, sharedAlready = 0, acuteTrue = 0, displaced = 0, threadNull = 0;
  const threadCounts = {};
  const detail = [];
  for (const s of seedJsons || []) {
    for (const p of (s.secretProbeSittings || [])) {
      sittings++;
      const t = (typeof p.trust === 'number') ? p.trust : null;
      if (t != null && t >= 40) trust40++;
      if (p.hasSecret === 'unknown') secretUnknown++;
      if (p.acuteNeed === 'unknown') acuteUnknown++;
      if (p.secretSharedBefore) sharedAlready++;
      if (p.acuteNeed === true) acuteTrue++;
      threadCounts[p.openerThread || '?'] = (threadCounts[p.openerThread || '?'] || 0) + 1;
      if (p.confessionFired) fired++;
      const isEligible = (t != null && t >= 40) && p.hasSecret === true && !p.secretSharedBefore && p.acuteNeed === false;
      if (p.confessionFired && !isEligible) firedNotEligible++;
      if (isEligible) {
        eligible++;
        if (p.openerThread && SECRET_ABOVE.indexOf(p.openerThread) === -1) branchReached++;
        else if (!p.openerThread) threadNull++;
        else displaced++;
      }
      if (isEligible || p.confessionFired || (t != null && t >= 40)) detail.push({ seed: s.seed, day: p.day, vid: p.vid, trust: t, hasSecret: p.hasSecret, secretSharedBefore: !!p.secretSharedBefore, acuteNeed: p.acuteNeed, openerThread: p.openerThread, confessionFired: !!p.confessionFired, eligible: isEligible });
    }
  }
  let verdict;
  if (fired >= 1) verdict = 'FIRES';
  else if (branchReached >= 5) verdict = 'QUIET-PATH';
  else if (sittings === 0) verdict = (seedJsons || []).some(s => Array.isArray(s.secretProbeSittings)) ? 'NO-SITTINGS' : 'NO-DATA';
  else verdict = 'NO-DATA';
  return { sittings, trust40, eligible, branchReached, fired, firedNotEligible, acuteUnknown, secretUnknown, sharedAlready, acuteTrue, displaced, threadNull, threadCounts, verdict, detail };
}

// R184 Q2-SOFTWARM: the mood-GUARD beat (convo-mood.js convoMoodShift):
// two lines picked by convoPickCycle 'moodguard' when the player makes a
// WARMING move toward a villager with negative 5-day receptivity. The beat
// is QUEUED on the warming turn and SPOKEN only when the player later picks
// `goon` — the continuer reveals a held beat ("Nothing else happens this
// turn — the beats belonged to the turn that queued them",
// conversation.js:6370). So the trigger is the last NON-GOON, NON-LEAVE
// YOU pick before the firing (triggerPick), never the goon pick that
// reveals it and never the preceding THEM line. A firing is a MISS iff
// that trigger pick was not a warming move. Counts only; the verdict is
// the run note's read of the detail rows.
const SOFTWARM_PATTERNS = [
  { id: 'softwarm-softens', re: /Something in them almost softens — then doesn't\. Not yet\./ },
  { id: 'softwarm-warmth', re: /They hear the warmth in it\. They're not ready to let it in\./ },
];
function summarizeSoftWarm(transcripts) {
  let softens = 0, warmth = 0;
  const detail = [];
  for (const t of transcripts || []) {
    const lines = String(t.text || '').split('\n');
    let lastYou = null, lastTrigger = null, lastThem = null;
    for (const ln of lines) {
      const ym = /^YOU: (.*)$/.exec(ln);
      if (ym) {
        lastYou = ym[1];
        if (!/^\[goon\]/.test(ym[1]) && ym[1] !== '(leave)') lastTrigger = ym[1];
        continue;
      }
      const tm = /^THEM: (.*)$/.exec(ln);
      if (!tm) continue;
      for (const p of SOFTWARM_PATTERNS) {
        if (p.re.test(tm[1])) {
          if (p.id === 'softwarm-softens') softens++; else warmth++;
          detail.push({ seed: t.seed, day: t.day, vid: t.vid, kind: p.id, pick: lastYou, triggerPick: lastTrigger, prevThem: lastThem, line: tm[1].slice(0, 220) });
          break;
        }
      }
      lastThem = tm[1];
    }
  }
  return { softens, warmth, total: softens + warmth, detail };
}

// R187 Q2-GUARDLINES: the r134 6-line moodguard pool (convo-mood.js):
// the old 2-line pool ("almost softens" / "hear the warmth") is gone
// from the game, so summarizeSoftWarm reads 0 by construction on this
// panel. The new lines describe the villager holding the moment at
// arm's length. Same trigger-pick attribution as summarizeSoftWarm:
// the beat is QUEUED on the warming turn and SPOKEN on a later goon
// pick, so the trigger is the last non-goon YOU pick before the
// firing. Counts only; the verdict is the run note's read.
const GUARDLINE_PATTERNS = [
  { id: 'guard-hear', re: /They hear you out, but something in them stays guarded\./ },
  { id: 'guard-nod', re: /They nod — and keep their distance, for now\./ },
  { id: 'guard-passes', re: /The moment passes without landing\. Not yet\./ },
  { id: 'guard-nothing', re: /They take it in and give nothing back\. Not yet\./ },
  { id: 'guard-shut', re: /Something in them stays shut, for now\./ },
  { id: 'guard-sit', re: /They let the words sit there, unanswered\./ },
];
function summarizeGuardLines(transcripts) {
  const counts = {};
  let total = 0;
  const detail = [];
  for (const t of transcripts || []) {
    const lines = String(t.text || '').split('\n');
    let lastYou = null, lastTrigger = null, lastThem = null;
    for (const ln of lines) {
      const ym = /^YOU: (.*)$/.exec(ln);
      if (ym) {
        lastYou = ym[1];
        if (!/^\[goon\]/.test(ym[1]) && ym[1] !== '(leave)') lastTrigger = ym[1];
        continue;
      }
      const tm = /^THEM: (.*)$/.exec(ln);
      if (!tm) continue;
      for (const p of GUARDLINE_PATTERNS) {
        if (p.re.test(tm[1])) {
          counts[p.id] = (counts[p.id] || 0) + 1;
          total++;
          detail.push({ seed: t.seed, day: t.day, vid: t.vid, kind: p.id, pick: lastYou, triggerPick: lastTrigger, prevThem: lastThem, line: tm[1].slice(0, 220) });
          break;
        }
      }
      lastThem = tm[1];
    }
  }
  return { total, counts, detail };
}

// R129 Q3-CISTERN: the water-haul opener says "1 liters left" — no
// pluralization (convo-wants.js:149). Scans THEM lines for the grammar
// error ("1 liters") vs the correct form ("1 liter"). The fix is made
// regardless of the count; the panel is the re-measure. Verdicts:
// GRAMMAR-ERROR (any "1 liters") / CLEAN (0). Detail lines are capped
// at 220 chars like scanAwayLines.
function scanCisternLines(transcripts) {
  const out = [];
  for (const t of transcripts || []) {
    const them = String(t.text || '').split('\n').filter(l => l.indexOf('THEM: ') === 0);
    const badHits = them.filter(l => /\b1 liters\b/.test(l));
    const goodHits = them.filter(l => /\b1 liter\b(?!s)/.test(l));
    if (badHits.length || goodHits.length) {
      out.push({ seed: t.seed, day: t.day, vid: t.vid,
        bad: badHits.length, good: goodHits.length,
        lines: badHits.concat(goodHits).map(l => l.slice(0, 220)) });
    }
  }
  return out;
}

// R129 Q1-FAVORBLOCK (panel-wide transcript scan): the Haven-door
// adjacency line is ONE fixed sentence (convo-wants.js:1890) — the
// verdict is maxRepeat of any single WORDING, not the panel total:
// after the fix the block still fires (only the wording varies), so a
// total-count verdict would still read REPETITIVE after a working fix.
// The r21 reframe prefixes ("As I said — ...") are stripped before
// matching, so a reframe counts as the same wording, not a distinct one.
// The delegated partner wording ("Move next to your partner...",
// favor-water.js / favor-forage.js) is a different site and is NOT
// counted here. Verdicts: REPETITIVE (maxRepeat >= 3) / VARIED
// (total >= 3, maxRepeat <= 2) / THIN-PROBE (total < 3).
const FAVORBLOCK_PATTERNS = [
  // The pre-fix line (convo-wants.js:1890), rendered unquoted as a THEM line.
  { id: 'favorblock-nextto', re: /^Move next to them, on the same side of the Haven door, to help\.$/ },
  // R129 fix variants (convo-wants.js convoFavorBlockLine) — added with
  // the fix so the after-panel normalizes them instead of reading every
  // new wording as unknown.
  { id: 'favorblock-beside', re: /^Stand beside them first — same side of the Haven door — then help\.$/ },
  { id: 'favorblock-rightnext', re: /^You need to be right next to them, same side of the Haven door, to help\.$/ },
  { id: 'favorblock-theirside', re: /^Get to their side of the Haven door and stand next to them — then you can help\.$/ },
];
const FAVORBLOCK_REFRAMES = [/^As I said — /, /^Like I said — /, /^Still the same thing — /, /^I've told you three times now — /];
function normalizeFavorBlock(line) {
  let t = String(line || '');
  for (const p of FAVORBLOCK_REFRAMES) t = t.replace(p, '');
  return t;
}
function favorBlockId(line) {
  const t = normalizeFavorBlock(line);
  for (const p of FAVORBLOCK_PATTERNS) if (p.re.test(t)) return p.id;
  // Fallback: a Haven-door adjacency block matching the old substring
  // regex but no known wording (a future variant, or a reframe the
  // normalizer missed) — counted, never silently dropped.
  if (/Move next to them, on the same side of the Haven door/i.test(t)) return 'favorblock-other';
  return 'unknown:' + t.slice(0, 40);
}
function summarizeFavorBlock(transcripts) {
  let total = 0, maxRepeat = 0;
  const patternCounts = {};
  const detail = [];
  for (const t of transcripts || []) {
    const lines = String(t.text || '').split('\n');
    const fc = {};
    for (const ln of lines) {
      const m = /^THEM: (.*)$/.exec(ln);
      if (!m) continue;
      const fid = favorBlockId(m[1]);
      if (fid.indexOf('unknown:') === 0) continue;
      total++;
      fc[fid] = (fc[fid] || 0) + 1;
    }
    const keys = Object.keys(fc);
    if (!keys.length) continue;
    for (const k of keys) patternCounts[k] = (patternCounts[k] || 0) + fc[k];
    const sittingMax = keys.reduce((a, k) => Math.max(a, fc[k]), 0);
    if (sittingMax > maxRepeat) maxRepeat = sittingMax;
    detail.push({ seed: t.seed, day: t.day, vid: t.vid, total: keys.reduce((a, k) => a + fc[k], 0), patternCounts: fc, maxRepeat: sittingMax });
  }
  // Panel-wide maxRepeat is the max over wordings, not sittings: a
  // wording heard 3x across three sittings is the defect (r128: 9x
  // across 64 convos). Recompute from the pooled counts.
  const pooledMax = Object.keys(patternCounts).reduce((m, k) => Math.max(m, patternCounts[k]), 0);
  if (pooledMax > maxRepeat) maxRepeat = pooledMax;
  const distinct = Object.keys(patternCounts).length;
  // Amendment A2 share bar: the A1 absolute maxRepeat<=2 bar is
  // unreachable at this firing rate (10-28 firings over 4 variants —
  // even perfect rotation gives maxRepeat ~3-7). VARIED = no single
  // wording is half or more of firings, with >=3 distinct wordings.
  let verdict;
  if (total < 3) verdict = 'THIN-PROBE';
  else if (distinct < 3 || maxRepeat / total >= 0.5) verdict = 'REPETITIVE';
  else verdict = 'VARIED';
  return { total, distinct, maxRepeat, patternCounts, detail, verdict };
}

// R129 Q1b-PARTNERBLOCK (panel-wide transcript scan, Amendment A2): the
// delegated favour-block wording (favor-water.js:95, favor-forage.js:53)
// "Move next to your partner, on the same side of the Haven door." — the
// DOMINANT repeater on the before-panel (18x panel seeds, 37x incl.
// smoke), nearly twice the 1890 line. Same share bar as Q1.
const PARTNERBLOCK_PATTERNS = [
  // The pre-fix line (delegated favour actions), rendered unquoted.
  { id: 'partnerblock-nextto', re: /^Move next to your partner, on the same side of the Haven door\.$/ },
  // R129 fix variants (convoFavorPartnerBlockLine, shared by both sites).
  { id: 'partnerblock-beside', re: /^Stand beside your partner first — same side of the Haven door — then help\.$/ },
  { id: 'partnerblock-rightnext', re: /^You need to be right next to your partner, same side of the Haven door, to help\.$/ },
  { id: 'partnerblock-theirside', re: /^Get to your partner's side of the Haven door and stand next to them — then you can help\.$/ },
];
function normalizePartnerBlock(line) {
  let t = String(line || '');
  for (const p of FAVORBLOCK_REFRAMES) t = t.replace(p, '');
  return t;
}
function partnerBlockId(line) {
  const t = normalizePartnerBlock(line);
  for (const p of PARTNERBLOCK_PATTERNS) if (p.re.test(t)) return p.id;
  if (/Move next to your partner, on the same side of the Haven door/i.test(t)) return 'partnerblock-other';
  return 'unknown:' + t.slice(0, 40);
}
function summarizePartnerBlock(transcripts) {
  let total = 0, maxRepeat = 0;
  const patternCounts = {};
  const detail = [];
  for (const t of transcripts || []) {
    const lines = String(t.text || '').split('\n');
    const fc = {};
    for (const ln of lines) {
      const m = /^THEM: (.*)$/.exec(ln);
      if (!m) continue;
      const fid = partnerBlockId(m[1]);
      if (fid.indexOf('unknown:') === 0) continue;
      total++;
      fc[fid] = (fc[fid] || 0) + 1;
    }
    const keys = Object.keys(fc);
    if (!keys.length) continue;
    for (const k of keys) patternCounts[k] = (patternCounts[k] || 0) + fc[k];
    const sittingMax = keys.reduce((a, k) => Math.max(a, fc[k]), 0);
    if (sittingMax > maxRepeat) maxRepeat = sittingMax;
    detail.push({ seed: t.seed, day: t.day, vid: t.vid, total: keys.reduce((a, k) => a + fc[k], 0), patternCounts: fc, maxRepeat: sittingMax });
  }
  const pooledMax = Object.keys(patternCounts).reduce((m, k) => Math.max(m, patternCounts[k]), 0);
  if (pooledMax > maxRepeat) maxRepeat = pooledMax;
  const distinct = Object.keys(patternCounts).length;
  let verdict;
  if (total < 3) verdict = 'THIN-PROBE';
  else if (distinct < 3 || maxRepeat / total >= 0.5) verdict = 'REPETITIVE';
  else verdict = 'VARIED';
  return { total, distinct, maxRepeat, patternCounts, detail, verdict };
}

// R129 Q3-AWAY-VARIETY (panel-wide transcript scan): the favour-commit
// away line is ONE fixed sentence (convo-wants.js:1787) — same shape as
// Q1, the verdict is maxRepeat of any single wording. The pre-fix line
// renders quoted. Verdicts: REPETITIVE (maxRepeat >= 3) / VARIED
// (total >= 3, maxRepeat <= 2) / THIN-PROBE (total < 3).
const AWAY_LINE_PATTERNS = [
  // The pre-fix line (convo-wants.js:1787).
  { id: 'awayline-wait', re: /^"Wait — I'm away from Haven, out on the road\. I can't promise a dawn meet while I'm out — find me when I'm back, and we'll set it then\."$/ },
  // R129 fix variants (convo-wants.js convoFavorAwayLine) — added with
  // the fix so the after-panel normalizes them instead of reading every
  // new wording as unknown.
  { id: 'awayline-outroad', re: /^"I'm out on the road, away from Haven — no dawn meet while I'm out, I'm afraid\. Catch me when I'm back and we'll set it then\."$/ },
  { id: 'awayline-rightnow', re: /^"Wait — I'm away from Haven right now, out on the road\. I can't promise a dawn meet from out here — find me when I'm back and we'll set it then\."$/ },
  { id: 'awayline-dawnmeet', re: /^"Out on the road, away from Haven\. A dawn meet's not something I can promise while I'm out — when I'm back, find me, and we'll set it then\."$/ },
];
function awayLineId(line) {
  const t = String(line || '');
  for (const p of AWAY_LINE_PATTERNS) if (p.re.test(t)) return p.id;
  if (AWAY_NEW_LINE.test(t)) return 'awayline-other';
  return 'unknown:' + t.slice(0, 40);
}
function summarizeAwayLineVariety(transcripts) {
  let total = 0, maxRepeat = 0;
  const patternCounts = {};
  const detail = [];
  for (const t of transcripts || []) {
    const lines = String(t.text || '').split('\n');
    const fc = {};
    for (const ln of lines) {
      const m = /^THEM: (.*)$/.exec(ln);
      if (!m) continue;
      const fid = awayLineId(m[1]);
      if (fid.indexOf('unknown:') === 0) continue;
      total++;
      fc[fid] = (fc[fid] || 0) + 1;
    }
    const keys = Object.keys(fc);
    if (!keys.length) continue;
    for (const k of keys) patternCounts[k] = (patternCounts[k] || 0) + fc[k];
    const sittingMax = keys.reduce((a, k) => Math.max(a, fc[k]), 0);
    if (sittingMax > maxRepeat) maxRepeat = sittingMax;
    detail.push({ seed: t.seed, day: t.day, vid: t.vid, total: keys.reduce((a, k) => a + fc[k], 0), patternCounts: fc, maxRepeat: sittingMax });
  }
  const pooledMax = Object.keys(patternCounts).reduce((m, k) => Math.max(m, patternCounts[k]), 0);
  if (pooledMax > maxRepeat) maxRepeat = pooledMax;
  const distinct = Object.keys(patternCounts).length;
  // Amendment A2 share bar (see summarizeFavorBlock): REPETITIVE iff one
  // wording is half or more of firings; VARIED iff >=3 distinct wordings
  // and no wording reaches half.
  let verdict;
  if (total < 3) verdict = 'THIN-PROBE';
  else if (distinct < 3 || maxRepeat / total >= 0.5) verdict = 'REPETITIVE';
  else verdict = 'VARIED';
  return { total, distinct, maxRepeat, patternCounts, detail, verdict };
}

// R119 Q2-TRUST: the playerDeath trust payment, instrumented.
// trustDeaths: {day, cause, oldBearer, newBearer, deltas} — the delta IS
// the payment, observed around the call. trustSnaps: daily {day,
// scholar, scholarHealth, trust, fallenN, lastFallen}.
// Contact join: a gainer had prior scholar contact iff a bond
// convoEvents talkTo targeted them, or a talkedSitting sat them, on a
// day BEFORE the death day. A gainer is a STRANGER only when they were
// never talked to at any point in the run (firstContact == null —
// unambiguous); contact only on or after the death day is 'late'
// (ambiguous — it may be the successor's doing) and is reported, not
// counted as a stranger gain. Mantle latency: first snap day >= death
// day whose scholar == newBearer, minus the death day; latency 1 is the
// expected daily-sampling artifact, >= 2 is LOUD. Dead-bearer days:
// snaps with scholarHealth <= 0 (the game ran a day with a dead scholar
// still holding the office — the r107 latency-2 shape).
function summarizeTrust(s) {
  const deaths = (s && s.trustDeaths) || [];
  const snaps = (s && s.trustSnaps) || [];
  const convo = ((s && s.bond) || {}).convoEvents || [];
  const talked = (s && s.talkedSittings) || [];
  const contactDays = {}; // vid -> earliest contact day (any point in the run)
  for (const e of convo) {
    if (!e || e.fn !== 'talkTo' || e.target == null) continue;
    const vid = String(e.target);
    if (contactDays[vid] == null || e.day < contactDays[vid]) contactDays[vid] = e.day;
  }
  for (const t of talked) {
    if (!t || t.vid == null) continue;
    const vid = String(t.vid);
    if (contactDays[vid] == null || t.day < contactDays[vid]) contactDays[vid] = t.day;
  }
  // Dedupe snaps by day, keep the LAST (the seed-end snap duplicates
  // the last daily snapshot).
  const byDay = {};
  for (const sn of snaps) if (sn && sn.day != null) byDay[sn.day] = sn;
  const deduped = Object.keys(byDay).map(Number).sort((a, b) => a - b).map(d => byDay[d]);
  let strangerGains = 0, strangerGainTotal = 0, lateGains = 0, knownGains = 0, knownGainTotal = 0, gainers = 0;
  const deathDetail = [];
  for (const d of deaths) {
    if (!d || d.err) { deathDetail.push({ day: d ? d.day : null, err: d ? d.err : 'null-death' }); continue; }
    // The PAYMENT is d.expected (the agency wrap's min(12, score/4),
    // recomputed before the call). The NET delta around the call also
    // carries the base playerDeath's mantle inheritance overwrite of
    // the successor's entry (smoke: expected +6, net -40) — reported
    // alongside, never confused with the payment. Older seed JSONs
    // without `expected` fall back to the net deltas.
    const paid = (d.expected && Object.keys(d.expected).length) ? d.expected : (d.deltas || {});
    const gains = [];
    for (const vid of Object.keys(paid)) {
      const amt = paid[vid];
      const net = (d.deltas || {})[vid];
      const firstContact = contactDays[vid];
      const kind = firstContact == null ? 'stranger' : (firstContact < d.day ? 'known' : 'late');
      gains.push({ vid, amt, net: net == null ? null : net, kind, firstContact: firstContact == null ? null : firstContact });
      gainers++;
      if (kind === 'stranger') { strangerGains++; strangerGainTotal += amt; }
      else if (kind === 'late') lateGains++;
      else { knownGains++; knownGainTotal += amt; }
    }
    let mantleDay = null;
    for (const sn of deduped) {
      if (sn.day < d.day) continue;
      if (String(sn.scholar) === String(d.newBearer)) { mantleDay = sn.day; break; }
    }
    deathDetail.push({ day: d.day, cause: d.cause, oldBearer: d.oldBearer, newBearer: d.newBearer,
      gains, latency: mantleDay == null ? null : mantleDay - d.day, mantleDay });
  }
  // Non-death-day trust movement: diff consecutive deduped snaps.
  let nonDeathMoves = 0; const nonDeathDetail = [];
  for (let i = 1; i < deduped.length; i++) {
    const prev = deduped[i - 1], cur = deduped[i];
    if (deaths.some(d => d && d.day === cur.day)) continue;
    const moved = [];
    const ids = new Set(Object.keys(prev.trust || {}).concat(Object.keys(cur.trust || {})));
    for (const id of ids) {
      const dd = (cur.trust[id] || 0) - (prev.trust[id] || 0);
      if (dd !== 0) moved.push({ vid: id, delta: dd });
    }
    if (moved.length) { nonDeathMoves++; nonDeathDetail.push({ day: cur.day, moved }); }
  }
  const deadBearerDays = deduped.filter(sn => sn.scholarHealth != null && sn.scholarHealth <= 0)
    .map(sn => ({ day: sn.day, scholar: sn.scholar, health: sn.scholarHealth }));
  let verdict;
  if (strangerGains >= 1) verdict = 'TRUST-PAID-TO-STRANGERS';
  else if (gainers >= 1) verdict = 'TRUST-EARNED-ONLY';
  else verdict = 'NO-GAINS';
  return { deaths: deaths.length, gainers, strangerGains, strangerGainTotal, lateGains,
    knownGains, knownGainTotal, nonDeathMoves, nonDeathDetail, deadBearerDays,
    deathDetail, verdict };
}

function main() {
  const dir = process.argv[2] || process.env.EVIDIR || DEFAULT_EVIDIR;
  const seedRe = new RegExp('^journey-deepening-r191-seed\\d+\\.json$');
  const sfiles = fs.readdirSync(dir).filter(f => seedRe.test(f)).sort();
  if (!sfiles.length) { console.log('No r184 seed JSONs in ' + dir); process.exit(1); }
  const verdicts = {};
  const favorTraces = {}; // R189 Q1: {seed: {trace, sittings}} for the orphan-trace join
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    favorTraces[s.seed] = { trace: s.favorTrace || null, sittings: s.favorTraceSittings || [] };
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
    const la = summarizeLangArc(s);
    console.log(`   Q1-LANGARC: sittings=${la.sittings} grants=${la.grants} flips=${la.flips} postFlipDecisions=${la.postFlipDecisions} unmatchedFlips=${(la.unmatchedFlips || []).length} verdict=${la.verdict} langs=${JSON.stringify(la.langs)} endLearned=${JSON.stringify(la.endLearned)} endLearnedLangs=${JSON.stringify(la.endLearnedLangs)}`);
    const sec = summarizeSecret(s);
    console.log(`   Q1-SECRET: openers=${sec.openers} addressingPicked=${sec.addressing} teachPicks=${sec.teachPicks} wantEstablished=${sec.wantEstablished} teachCrowded=${sec.teachCrowded} wantOpen=${sec.wantOpen} confrontRides=${sec.confrontRides} verdict=${sec.verdict}`);
    for (const d of sec.detail) console.log(`   Q1-SECRET-SIT seed=${s.seed} day=${d.day} vid=${d.vid} addressing=${d.addr} teachPicks=${d.teachPicks} teachBefore=${d.teachBefore} wantEstablished=${d.wantEstablished} teachCrowded=${d.teachCrowded} wantOpen=${d.wantOpen} answerTurn=${d.answerTurn} answerKind=${d.answerKind} confrontOnSecretMenu=${d.confrontOnSecretMenu}`);
    const wa = summarizeWantAfterSecret(s);
    console.log(`   Q1-WANT: answered=${wa.answered} established=${wa.established} newlyEstablished=${wa.newlyEstablished} verdict=${wa.verdict}`);
    for (const d of wa.detail) console.log(`   Q1-WANT-SIT seed=${s.seed} day=${d.day} vid=${d.vid} wantId=${d.wantId} wantStart=${JSON.stringify(d.wantStart)} wantFinal=${JSON.stringify(d.wantFinal)} established=${d.established} newlyEstablished=${d.newlyEstablished} outcome=${d.outcome}`);
    console.log(`   Q1-WANT-OUTCOME: established=${wa.established} landed=${wa.landed} surfacedOnly=${wa.surfacedOnly} other=${wa.otherEstablished} outcome=${wa.outcome}`);
    const sv = summarizeSecretVariety(s);
    console.log(`   Q1-VARIETY: answered=${sv.answered} distinctAnswers=${sv.distinctAnswers} maxRepeat=${sv.maxRepeat} missingAnswer=${sv.missingAnswer} teachPicks=${sv.teachPicks} teachFramesDistinct=${sv.teachFramesDistinct} maxSameFrame=${sv.maxSameFrame} verdict=${sv.verdict}`);
    for (const d of sv.detail) console.log(`   Q1-VARIETY-SIT seed=${s.seed} day=${d.day} vid=${d.vid} answerKind=${d.answerKind} answerLine=${JSON.stringify(d.answerLine)} teachPicks=${d.teachPicks} teachFrames=${JSON.stringify(d.teachFrames)} maxSameFrame=${d.maxSameFrame}`);
    const ps = summarizePostSecret(s);
    console.log(`   Q2-POSTSECRET: answered=${ps.answered} medianPostAnswerTurns=${ps.medianPostAnswerTurns} dryFirst=${ps.dryFirst} referencing=${ps.referencing}`);
    for (const d of ps.detail) console.log(`   Q2-POSTSECRET-SIT seed=${s.seed} day=${d.day} vid=${d.vid} answerKind=${d.answerKind} postAnswerTurns=${d.postAnswerTurns} dryFirst=${d.dryFirst} references=${d.references} firstPostAnswer=${JSON.stringify(d.firstPostAnswer)}`);
    const lad = summarizeLadder(s);
    console.log(`   Q1-LADDER: snaps=${lad.snaps} firstStageDay=${lad.firstStageDay} peakStage=${lad.peakStage} lastStage=${lad.lastStage} holds=${lad.holds} minted=${JSON.stringify(lad.minted)} verdict=${lad.verdict} errors=${JSON.stringify(lad.errors)} inconsistent=${JSON.stringify(lad.inconsistent)} stageDrops=${JSON.stringify(lad.stageDrops)}`);
    for (const t of lad.trajectory) console.log(`   Q1-LADDER-TRAJ seed=${s.seed} day=${t.day} stage=${t.stage} counted=${t.counted} cap=${t.cap} shortfall=${t.shortfall}`);
    const tru = summarizeTrust(s);
    console.log(`   Q2-TRUST: deaths=${tru.deaths} gainers=${tru.gainers} strangerGains=${tru.strangerGains} strangerTotal=${tru.strangerGainTotal} lateGains=${tru.lateGains} knownGains=${tru.knownGains} nonDeathMoves=${tru.nonDeathMoves} deadBearerDays=${tru.deadBearerDays.length} verdict=${tru.verdict}`);
    for (const d of tru.deathDetail) console.log(`   Q2-TRUST-DEATH seed=${s.seed} day=${d.day} cause=${d.cause} old=${d.oldBearer} new=${d.newBearer} latency=${d.latency} mantleDay=${d.mantleDay} gains=${JSON.stringify(d.gains)}`);
    for (const m of tru.nonDeathDetail) console.log(`   Q2-TRUST-MOVE seed=${s.seed} day=${m.day} moved=${JSON.stringify(m.moved)}`);
    for (const b of tru.deadBearerDays) console.log(`   Q2-DEAD-BEARER seed=${s.seed} day=${b.day} scholar=${b.scholar} health=${b.health}`);
    for (const f of la.flipDetail) console.log(`   Q1-LANGFLIP seed=${s.seed} lang=${f.lang} flipDay=${f.flipDay} flipVid=${f.flipVid} expAfter=${f.expAfter} postDecisions=${JSON.stringify(f.postDecisions)}`);
    const gj = summarizeGoalJoin(s);
    for (const t of Object.keys(gj.byTrack)) { const T = gj.byTrack[t]; console.log(`   Q2-GOALJOIN seed=${s.seed} track=${t} tops=${T.tops} lined=${T.lined} indoorLined=${T.indoorLined} departedLined=${T.departedLined} capture=${T.capture} -> ${T.verdict}`); }
    const db = summarizeDebrief(s);
    console.log(`   DEBRIEF: trigger=${db.trigger} flags=${JSON.stringify(db.flags)} lines=${JSON.stringify(db.lines)}`);
  }
  console.log('\nPANEL VERDICTS: ' + JSON.stringify(verdicts));
  // R95 transcript filenames carry the villager id: ...-day<day>-<vid>.txt
  const transRe = new RegExp('^journey-deepening-r191-transcript-\\d+-day\\d+-.+\\.txt$');
  const transParse = new RegExp('^journey-deepening-r191-transcript-(\\d+)-day(\\d+)-(.+)\\.txt$');
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
  // R189 Q1 ORPHAN-TRACE JOIN: each true-no-thread orphan against the
  // driver favor trace (builds/seeds/followups + per-sitting snapshots).
  const orphanTrace = classifyOrphanTrace(orphans, ptrans, favorTraces);
  for (const o of orphanTrace.detail) console.log(`   ORPHAN-TRACE seed=${o.seed} day=${o.day} vid=${o.vid} short=${JSON.stringify(o.short)} cls=${o.cls} site=${o.site} siteName=${o.siteName} buildDay=${o.buildDay} priorSittings=${o.priorSittings} priorNamed=${o.priorNamed} seedPlantedDay=${o.seedPlantedDay}`);
  console.log(`ORPHAN-TRACE PANEL: orphans=${orphanTrace.orphans} SPOKEN-BEFORE=${orphanTrace.counts['SPOKEN-BEFORE'] || 0} NEVER-SPOKEN-SAME-SITTING=${orphanTrace.counts['NEVER-SPOKEN-SAME-SITTING'] || 0} NEVER-SPOKEN-EARLIER-BUILD=${orphanTrace.counts['NEVER-SPOKEN-EARLIER-BUILD'] || 0} FROMSEED=${orphanTrace.counts['FROMSEED'] || 0} UNTRACED=${orphanTrace.counts['UNTRACED'] || 0}`);
  // R109 FIZZLE-WATCH: dry lines in ask_favor sittings (the r146 fix's
  // target) vs elsewhere. Verdict: 0 in ask_favor -> fix HOLDS in the wild.
  const dryHits = classifyDryLines(ptrans);
  const dryAskFavor = dryHits.filter(h => h.wantId === 'ask_favor');
  const dryOther = dryHits.filter(h => h.wantId !== 'ask_favor');
  for (const h of dryHits) console.log(`   FIZZLE seed=${h.seed} day=${h.day} vid=${h.vid} want=${h.wantId} dryLines=${h.dryLines} lines=${JSON.stringify(h.lines)}`);
  console.log(`FIZZLE PANEL: drySittings=${dryHits.length} askFavor=${dryAskFavor.length} other=${dryOther.length} totalDryLines=${dryHits.reduce((a, h) => a + h.dryLines, 0)} -> ${dryAskFavor.length === 0 ? 'FIZZLE-FIX HOLDS in the wild' : 'FIZZLE STILL FIRES in ask_favor — investigate slot before any claim'}`);
  // R103 V-INIT scan (carried in r104; REPAIRED in r188): NPC-initiated
  // bond proposals — the counted set is now the exact ask-line shapes
  // (scanVInit), not the old BOND_THEM regex that flagged outing asks and
  // missed the true "bonded" proposal. Player-side menu options
  // (invite_party / dlg:invite) are counted separately as contrast, never
  // as initiation. Betrayal menus are B-INIT, also separate.
  const vtrans = tfiles.map(f => {
    const m = transParse.exec(f);
    return { file: f, seed: m ? m[1] : '?', day: m ? Number(m[2]) : 0, vid: m ? m[3] : '?', text: fs.readFileSync(path.join(dir, f), 'utf8') };
  });
  const vinit = scanVInit(vtrans);
  for (const r of vinit.rows) console.log(`   V-INIT ${r.file}: want=${r.want} bondLines=${r.bondLines} playerInviteOffered=${r.playerInviteOffered} betrayalOffered=${r.betrayalOffered}`);
  console.log(`V-INIT PANEL: bondSittings=${vinit.bondSittings} transcripts=${vinit.transcripts} playerInviteOfferedSittings=${vinit.playerInviteOfferedSittings} betrayalOfferedSittings=${vinit.betrayalOfferedSittings} candidates=${vinit.candidates.length}`);
  if (vinit.candidates.length) console.log(`V-INIT CANDIDATES: ${JSON.stringify(vinit.candidates)}`);
  // R188 Q2 DOUBLE-ASK CENSUS: the same bond ask line spoken twice in one
  // sitting (canon "No repeats, ever").
  const dask = scanDoubleAsk(vtrans);
  for (const d of dask.detail) console.log(`   DOUBLE-ASK ${d.file}: kind=${d.kind} count=${d.count} offeredAfterSecond=${d.offeredAfterSecond} betweenPicks=${JSON.stringify(d.betweenPicks)} line=${JSON.stringify(d.line)}`);
  console.log(`DOUBLE-ASK PANEL: doubleSittings=${dask.doubleSittings} transcripts=${vtrans.length}`);
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
  if (vinit.detail.length) console.log(`V-INIT DETAIL: ${JSON.stringify(vinit.detail)}`);
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
  // R118 Q1-LANGARC panel (binding verdicts are per prereg, panel-level;
  // flips are GRANT events now — see summarizeLangArc).
  let laSits = 0, laFlips = 0, laPost = 0, laGrants = 0, laUnmatched = 0;
  let laVerdict = 'NO-CONTACT';
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const la = summarizeLangArc(s);
    laSits += la.sittings; laFlips += la.flips; laPost += la.postFlipDecisions;
    laGrants += la.grants; laUnmatched += (la.unmatchedFlips || []).length;
  }
  if (laFlips >= 1 && laPost >= 1) laVerdict = 'ARC-FIRES';
  else if (laFlips >= 1) laVerdict = 'ARC-FLIPS-NO-PAYOFF';
  else if (laSits >= 1) laVerdict = 'ARC-UNEXERCISED';
  console.log(`Q1-LANGARC PANEL: sittings=${laSits} grants=${laGrants} flips=${laFlips} postFlipDecisions=${laPost} unmatchedFlips=${laUnmatched} -> ${laVerdict}`);
  // R118 MENU-FLIP panel (fix evidence): flips per panel + listen turns.
  const menuFlips = scanMenuFlip(ptrans);
  const flipSittings = menuFlips.filter(x => x.flip);
  const listenTurnsTotal = menuFlips.reduce((a, x) => a + x.listenTurns, 0);
  for (const x of flipSittings) console.log(`   MENU-FLIP seed=${x.flip.seed} day=${x.flip.day} vid=${x.flip.vid} turn=${x.flip.turn} listenTurns=${x.flip.listenTurns} offered=${JSON.stringify(x.flip.offered)}`);
  console.log(`MENU-FLIP PANEL: nonverbalSittings=${menuFlips.length} flips=${flipSittings.length} listenTurns=${listenTurnsTotal} -> ${flipSittings.length === 0 ? 'NO FLIPS (fix holds)' : 'FLIPS PRESENT — fix incomplete'}`);
  // R119 Q1-LADDER panel (binding verdicts are per prereg, panel-level).
  let ladOpens = 0, ladLate = 0, ladSilent = 0, ladBroken = 0;
  let ladHolds = 0; const ladFirstDays = [];
  const ladMinted = { fight: 0, forage: 0, craft: 0, talk: 0, explore: 0 };
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const lad = summarizeLadder(s);
    if (lad.verdict === 'OPENS') ladOpens++;
    else if (lad.verdict === 'LATE') ladLate++;
    else if (lad.verdict === 'SILENT') ladSilent++;
    else if (lad.verdict === 'BROKEN') ladBroken++;
    if (lad.holds) ladHolds++;
    if (lad.firstStageDay != null) ladFirstDays.push(lad.firstStageDay);
    for (const t of Object.keys(ladMinted)) if ((lad.minted[t] | 0) > 0) ladMinted[t]++;
  }
  const ladMintTracks = Object.keys(ladMinted).filter(t => ladMinted[t] > 0).length;
  let ladVerdict = 'LADDER-SILENT';
  if (ladBroken >= 1) ladVerdict = 'LADDER-BROKEN';
  else if (ladOpens >= 1) ladVerdict = 'LADDER-OPENS';
  else if (ladLate >= 1) ladVerdict = 'LADDER-LATE';
  console.log(`Q1-LADDER PANEL: opens=${ladOpens} late=${ladLate} silent=${ladSilent} broken=${ladBroken} mintedTracks=${ladMintTracks}/5 mintedPerTrack=${JSON.stringify(ladMinted)} holds=${ladHolds}/${sfiles.length} firstDays=${JSON.stringify(ladFirstDays)} -> ${ladVerdict}${ladMintTracks === 5 ? ' + LADDER-MINTS' : ''} + ${ladHolds >= 3 ? 'LADDER-HOLDS' : 'LADDER-FALLS'}`);
  // R122 Q1-SECRET panel (binding verdicts are per prereg, panel-level).
  let secOpeners = 0, secAddressing = 0, secTeach = 0, secTeachCrowded = 0, secWantOpen = 0, secEstablished = 0;
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const sec = summarizeSecret(s);
    secOpeners += sec.openers; secAddressing += sec.addressing; secTeach += sec.teachPicks;
    secTeachCrowded += sec.teachCrowded; secWantOpen += sec.wantOpen; secEstablished += sec.wantEstablished;
  }
  let secVerdict = 'SECRET-SILENT';
  if (secOpeners >= 1 && secAddressing === 0) secVerdict = 'SECRET-REGRESSED';
  else if (secOpeners >= 1) secVerdict = 'SECRET-HOLDS';
  const secTeachFlag = secOpeners >= 1 && secTeachCrowded * 2 >= secOpeners;
  const secWantFlag = secOpeners >= 1 && secWantOpen * 2 >= secOpeners;
  console.log(`Q1-SECRET PANEL: openers=${secOpeners} addressingPicked=${secAddressing} teachPicks=${secTeach} wantEstablished=${secEstablished} teachCrowdedSittings=${secTeachCrowded} wantOpenSittings=${secWantOpen} -> ${secVerdict}${secTeachFlag ? ' + TEACH-CROWDED' : ''}${secWantFlag ? ' + WANT-OPEN' : ''}`);
  // R124 Q1-WANT-AFTER-SECRET panel (binding verdicts per prereg).
  let wantAnswered = 0, wantEstablished = 0, wantNewly = 0;
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const w = summarizeWantAfterSecret(s);
    wantAnswered += w.answered; wantEstablished += w.established; wantNewly += w.newlyEstablished;
  }
  let wantVerdict = 'NO-ANSWERS';
  if (wantAnswered === 0) wantVerdict = 'NO-ANSWERS';
  else if (wantAnswered < 2) wantVerdict = 'THIN-PROBE';
  else if (wantEstablished === 0) wantVerdict = 'STAYS-BURIED';
  else if (wantEstablished * 2 >= wantAnswered) wantVerdict = 'SURFACES';
  else wantVerdict = 'MIXED';
  console.log(`Q1-WANT PANEL: answered=${wantAnswered} established=${wantEstablished} newlyEstablished=${wantNewly} -> ${wantVerdict}`);
  // R125 Q2-WANT-OUTCOME-SPLIT panel (binding verdicts per prereg).
  let outLanded = 0, outSurfaced = 0, outOther = 0;
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const w = summarizeWantAfterSecret(s);
    outLanded += w.landed; outSurfaced += w.surfacedOnly; outOther += w.otherEstablished;
  }
  let outVerdict = 'NO-ANSWERS';
  if (wantAnswered === 0) outVerdict = 'NO-ANSWERS';
  else if (wantAnswered < 2) outVerdict = 'THIN-PROBE';
  else if (wantEstablished === 0) outVerdict = 'NO-ESTABLISHED';
  else if (outLanded === 0) outVerdict = 'SURFACES-ONLY';
  else if (outLanded * 2 >= wantEstablished) outVerdict = 'LANDS';
  else outVerdict = 'MIXED';
  console.log(`Q1-WANT-OUTCOME PANEL: established=${wantEstablished} landed=${outLanded} surfacedOnly=${outSurfaced} other=${outOther} -> ${outVerdict}`);
  // R125 Q1-SECRET-LINE-VARIETY panel (binding verdicts per prereg).
  // Panel-wide: one answer line repeated across DIFFERENT seeds still
  // counts — the line is a constant in the engine, not a per-seed
  // accident (each seed runs in its own process with no shared ledger).
  let varAnswered = 0, varTeachPicks = 0, varMaxSameFrame = 0, varMissing = 0;
  const varAnswerCounts = {};
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const sv = summarizeSecretVariety(s);
    varAnswered += sv.answered; varTeachPicks += sv.teachPicks; varMissing += sv.missingAnswer;
    if (sv.maxSameFrame > varMaxSameFrame) varMaxSameFrame = sv.maxSameFrame;
    for (const d of sv.detail) {
      if (d.answerLine) varAnswerCounts[d.answerLine] = (varAnswerCounts[d.answerLine] || 0) + 1;
    }
  }
  const varDistinct = Object.keys(varAnswerCounts).length;
  const varMaxRepeat = Object.keys(varAnswerCounts).reduce((m, k) => Math.max(m, varAnswerCounts[k]), 0);
  let varVerdict = 'THIN-PROBE';
  if (varAnswered < 2) varVerdict = 'THIN-PROBE';
  else if (varMissing > 0) varVerdict = 'NO-DATA';
  else if (varMaxRepeat >= 3 || varMaxSameFrame >= 3) varVerdict = 'REPETITIVE';
  else varVerdict = 'VARIED';
  console.log(`Q1-VARIETY PANEL: answered=${varAnswered} distinctAnswers=${varDistinct} maxRepeat=${varMaxRepeat} missingAnswer=${varMissing} teachPicks=${varTeachPicks} maxSameFrame=${varMaxSameFrame} -> ${varVerdict}`);
  // R125 A1 TEACHFRAME PANEL (binding verdict per prereg amendment A1):
  // the teach frame is judged on ALL panel transcripts, not secret
  // sittings (the repetition lives in ordinary teach-heavy sittings).
  const tf = summarizeTeachFrames(ptrans);
  console.log(`Q1-TEACHFRAME PANEL: frames=${tf.frames} sittingsWithFrames=${tf.sittingsWithFrames} distinctFrames=${tf.distinctFrames} maxSameFrame=${tf.maxSameFrame} frameCounts=${JSON.stringify(tf.frameCounts)} -> ${tf.verdict}`);
  for (const d of tf.detail) console.log(`   Q1-TEACHFRAME-SIT seed=${d.seed} day=${d.day} vid=${d.vid} frames=${d.frames} frameCounts=${JSON.stringify(d.frameCounts)} maxSameFrame=${d.maxSameFrame}`);
  // R124 Q2-CONFRONT-ON-SECRET panel (wild count only; the forced probe
  // in the proof test judges what picking confront does to the secret).
  let confRides = 0, confOpeners = 0;
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const sec = summarizeSecret(s);
    confOpeners += sec.openers; confRides += sec.confrontRides;
  }
  console.log(`Q2-CONFRONT PANEL: secretMenus=${confOpeners} confrontRides=${confRides}`);
  // R122 Q2-POSTSECRET panel (binding verdicts are per prereg, panel-level).
  let psAnswered = 0, psDryFirst = 0, psReferencing = 0;
  const psTurns = [];
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const ps = summarizePostSecret(s);
    psAnswered += ps.answered; psDryFirst += ps.dryFirst; psReferencing += ps.referencing;
    for (const d of ps.detail) psTurns.push(d.postAnswerTurns);
  }
  const psMedian = median(psTurns);
  const psDryRate = psAnswered ? psDryFirst / psAnswered : 0;
  const psRefRate = psAnswered ? psReferencing / psAnswered : 0;
  let psVerdict = 'POST-SECRET-MIXED';
  if (psAnswered >= 1 && (psMedian <= 1 || psDryRate >= 0.5)) psVerdict = 'POST-SECRET-THIN';
  else if (psAnswered >= 1 && psMedian >= 3 && psDryRate < 0.5 && psRefRate >= 0.5) psVerdict = 'POST-SECRET-RICH';
  else if (psAnswered === 0) psVerdict = 'POST-SECRET-NO-ANSWERS';
  console.log(`Q2-POSTSECRET PANEL: answered=${psAnswered} medianPostAnswerTurns=${psMedian} dryFirst=${psDryFirst} referencing=${psReferencing} dryRate=${psDryRate.toFixed(2)} refRate=${psRefRate.toFixed(2)} -> ${psVerdict}`);
  // R119 Q2-TRUST panel (binding verdicts are per prereg, panel-level).
  let truStranger = 0, truStrangerTotal = 0, truLate = 0, truKnown = 0, truDeaths = 0, truNonDeath = 0, truDeadBearer = 0;
  const truLatencies = [];
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const tru = summarizeTrust(s);
    truStranger += tru.strangerGains; truStrangerTotal += tru.strangerGainTotal; truLate += tru.lateGains;
    truKnown += tru.knownGains; truDeaths += tru.deaths; truNonDeath += tru.nonDeathMoves;
    truDeadBearer += tru.deadBearerDays.length;
    for (const d of tru.deathDetail) if (d.latency != null) truLatencies.push(d.latency);
  }
  const truLatMax = truLatencies.length ? Math.max(...truLatencies) : null;
  let truVerdict = 'TRUST-EARNED-ONLY';
  if (truStranger >= 1) truVerdict = 'TRUST-PAID-TO-STRANGERS';
  else if (truDeaths === 0) truVerdict = 'NO-DEATHS';
  console.log(`Q2-TRUST PANEL: deaths=${truDeaths} strangerGains=${truStranger} strangerTotal=${truStrangerTotal} lateGains=${truLate} knownGains=${truKnown} nonDeathMoves=${truNonDeath} deadBearerDays=${truDeadBearer} latencyMax=${truLatMax} latencies=${JSON.stringify(truLatencies)} -> CARRIED (computed=${truVerdict}; r119 verdict stands, no new trust verdict this run)`);
  // R116 Q2-GOALJOIN panel: per-track pooled verdicts.
  const gjPanel = {};
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const gj = summarizeGoalJoin(s);
    for (const t of Object.keys(gj.byTrack)) {
      const T = gj.byTrack[t];
      const P = (gjPanel[t] = gjPanel[t] || { track: t, tops: 0, lined: 0, departedLined: 0, indoorLined: 0, capture: 0 });
      P.tops += T.tops; P.lined += T.lined; P.departedLined += T.departedLined; P.indoorLined += T.indoorLined; P.capture += T.capture;
    }
  }
  for (const t of Object.keys(gjPanel)) {
    const P = gjPanel[t];
    P.verdict = P.capture > 0 ? 'HEALTHY' : P.departedLined > 0 ? 'COUNTER-FAULT' : P.tops > 0 ? 'GOALS-FAULT' : 'NO-DATA';
    console.log(`Q2-GOALJOIN PANEL: track=${t} tops=${P.tops} lined=${P.lined} indoorLined=${P.indoorLined} departedLined=${P.departedLined} capture=${P.capture} -> ${P.verdict}`);
  }
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
  // R129 Q1-FAVORBLOCK PANEL (binding verdict per prereg Amendment A1):
  // maxRepeat of any single Haven-door wording, panel-wide — NOT the
  // panel total (the block still fires after the fix; only the wording
  // varies). Reframe prefixes are normalized out by summarizeFavorBlock.
  const fb = summarizeFavorBlock(ptrans);
  console.log(`Q1-FAVORBLOCK PANEL: total=${fb.total} distinct=${fb.distinct} maxRepeat=${fb.maxRepeat} patternCounts=${JSON.stringify(fb.patternCounts)} -> ${fb.verdict}`);
  for (const d of fb.detail) console.log(`   Q1-FAVORBLOCK-SIT seed=${d.seed} day=${d.day} vid=${d.vid} total=${d.total} patternCounts=${JSON.stringify(d.patternCounts)} maxRepeat=${d.maxRepeat}`);
  // R129 Q1b-PARTNERBLOCK PANEL (Amendment A2): the delegated partner
  // wording — same share bar as Q1.
  const pb = summarizePartnerBlock(ptrans);
  console.log(`Q1-PARTNERBLOCK PANEL: total=${pb.total} distinct=${pb.distinct} maxRepeat=${pb.maxRepeat} patternCounts=${JSON.stringify(pb.patternCounts)} -> ${pb.verdict}`);
  for (const d of pb.detail) console.log(`   Q1-PARTNERBLOCK-SIT seed=${d.seed} day=${d.day} vid=${d.vid} total=${d.total} patternCounts=${JSON.stringify(d.patternCounts)} maxRepeat=${d.maxRepeat}`);
  // R129 Q2-PLACEFRAME PANEL (binding verdict per prereg): the place-lesson
  // frame is judged on ALL panel transcripts, mirroring Q1-TEACHFRAME.
  const pf = summarizePlaceFrames(ptrans);
  console.log(`Q2-PLACEFRAME PANEL: frames=${pf.frames} sittingsWithFrames=${pf.sittingsWithFrames} distinctFrames=${pf.distinctFrames} maxSameFrame=${pf.maxSameFrame} frameCounts=${JSON.stringify(pf.frameCounts)} -> ${pf.verdict}`);
  for (const d of pf.detail) console.log(`   Q2-PLACEFRAME-SIT seed=${d.seed} day=${d.day} vid=${d.vid} frames=${d.frames} frameCounts=${JSON.stringify(d.frameCounts)} maxSameFrame=${d.maxSameFrame}`);
  // R184 Q1-PLACEPROBE PANEL (binding funnel per prereg): the bottleneck
  // stage names the finding when frames are 0 — NOT a fix failure.
  const ppSeeds = sfiles.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const pp = summarizePlaceProbe(ppSeeds);
  console.log(`Q1-PLACEPROBE PANEL: sittings=${pp.sittings} withPlaces>=1=${pp.withPlaces} withPlaces>=2=${pp.withPlaces2} askFieldPicks=${pp.askPicks} askFieldLines=${pp.askLines} placeFrames=${pp.frames} frameCounts=${JSON.stringify(pp.frameCounts)} -> bottleneck=${pp.bottleneck}`);
  for (const d of pp.detail) console.log(`   Q1-PLACEPROBE-SIT seed=${d.seed} day=${d.day} vid=${d.vid} placesKnown=${d.placesKnown} askFieldPicks=${d.askFieldPicks} askFieldLines=${d.askFieldLines}`);
  // R187 Q1-SECRETPROBE PANEL (binding funnel per prereg): the bottleneck
  // stage names the finding when confessions are 0 — NOT a fix failure.
  // sharedEnd is the game-level count (Amendment A1): villagers whose
  // secret fired ANYWHERE in the run, driver sittings + policy talkTo.
  const sp = summarizeSecretProbe(ppSeeds);
  const spSharedEnd = ppSeeds.reduce((a, s) => a + (((s.secretSharedEnd || {}).count) | 0), 0);
  console.log(`Q1-SECRETPROBE PANEL: sittings=${sp.sittings} trust>=40=${sp.trust40} eligible=${sp.eligible} branchReached=${sp.branchReached} fired=${sp.fired} sharedEnd=${spSharedEnd} firedNotEligible=${sp.firedNotEligible} acuteUnknown=${sp.acuteUnknown} secretUnknown=${sp.secretUnknown} sharedAlready=${sp.sharedAlready} acuteTrue=${sp.acuteTrue} displaced=${sp.displaced} threadNull=${sp.threadNull} threadCounts=${JSON.stringify(sp.threadCounts)} -> ${sp.verdict}`);
  for (const d of sp.detail) console.log(`   Q1-SECRETPROBE-SIT seed=${d.seed} day=${d.day} vid=${d.vid} trust=${d.trust} hasSecret=${d.hasSecret} sharedBefore=${d.secretSharedBefore} acute=${d.acuteNeed} openerThread=${d.openerThread} fired=${d.confessionFired} eligible=${d.eligible}`);
  // R184 Q2-SOFTWARM PANEL (counts only — the MISS/HIT verdict is the
  // run note's read of the detail rows, per prereg Amendment A1).
  const sw = summarizeSoftWarm(ptrans);
  console.log(`Q2-SOFTWARM PANEL: softens=${sw.softens} warmth=${sw.warmth} total=${sw.total} (counts only — verdict is the run note's read)`);
  for (const d of sw.detail) console.log(`   Q2-SOFTWARM seed=${d.seed} day=${d.day} vid=${d.vid} kind=${d.kind} pick=${JSON.stringify(d.pick)} triggerPick=${JSON.stringify(d.triggerPick)} prevThem=${JSON.stringify((d.prevThem || '').slice(0, 160))}`);
  // R187 Q2-GUARDLINES PANEL (counts only — the r134 6-line pool; the
  // old soft/warm lines are gone from the game, so SOFTWARM reads 0).
  const gl = summarizeGuardLines(ptrans);
  console.log(`Q2-GUARDLINES PANEL: total=${gl.total} counts=${JSON.stringify(gl.counts)} (counts only — verdict is the run note's read)`);
  for (const d of gl.detail) console.log(`   Q2-GUARDLINES seed=${d.seed} day=${d.day} vid=${d.vid} kind=${d.kind} pick=${JSON.stringify(d.pick)} triggerPick=${JSON.stringify(d.triggerPick)} prevThem=${JSON.stringify((d.prevThem || '').slice(0, 160))}`);
  // R129 Q3-AWAY PANEL (binding verdict per prereg Amendment A1):
  // maxRepeat of any single away-line wording, panel-wide — NOT the
  // total (the line still fires after the fix; only the wording varies).
  const awv = summarizeAwayLineVariety(ptrans);
  console.log(`Q3-AWAY PANEL: total=${awv.total} distinct=${awv.distinct} maxRepeat=${awv.maxRepeat} patternCounts=${JSON.stringify(awv.patternCounts)} -> ${awv.verdict}`);
  for (const d of awv.detail) console.log(`   Q3-AWAY-SIT seed=${d.seed} day=${d.day} vid=${d.vid} total=${d.total} patternCounts=${JSON.stringify(d.patternCounts)} maxRepeat=${d.maxRepeat}`);
  // R129 Q3-CISTERN PANEL (re-measure, not a verdict driver — the fix is
  // made regardless; the panel counts the grammar error before/after).
  const cisHits = scanCisternLines(ptrans);
  const cisBad = cisHits.reduce((a, x) => a + x.bad, 0);
  const cisGood = cisHits.reduce((a, x) => a + x.good, 0);
  for (const x of cisHits) console.log(`   CISTERN seed=${x.seed} day=${x.day} vid=${x.vid} bad=${x.bad} good=${x.good} lines=${JSON.stringify(x.lines)}`);
  console.log(`Q3-CISTERN PANEL: bad1Liters=${cisBad} good1Liter=${cisGood} -> ${cisBad >= 1 ? 'GRAMMAR-ERROR' : 'CLEAN'}`);
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
module.exports = { summarizeStanding, distStats, median, summarizeLadder, summarizeTrust, summarizeSecret, summarizePostSecret, summarizeWantAfterSecret, summarizeSecretVariety, summarizeTeachFrames, teachFrameId, TEACH_FRAME_PATTERNS, summarizePlaceFrames, placeFrameId, PLACE_FRAME_PATTERNS, summarizePlaceProbe, summarizeSecretProbe, SECRET_ABOVE, summarizeSoftWarm, SOFTWARM_PATTERNS, summarizeGuardLines, GUARDLINE_PATTERNS, scanCisternLines, summarizeFavorBlock, favorBlockId, FAVORBLOCK_PATTERNS, normalizeFavorBlock, summarizePartnerBlock, partnerBlockId, PARTNERBLOCK_PATTERNS, normalizePartnerBlock, summarizeAwayLineVariety, awayLineId, AWAY_LINE_PATTERNS, POSTSECRET_DRY, POSTSECRET_STEMS, scanBetrayalTranscript, scanPromiseTranscript, classifyPromiseThreads, classifyPocketedThreads, classifyCuriousPlants, scanReaskOrphans, classifyDryLines, summarizeBond, summarizeDebrief, PROMISE_MENTION, PROMISE_MENTION_OLD, REPAY_OPENER, REASK_OPENER, DRY_LINE, summarizeGoals, GOAL_KINDS_G, summarizeRequests, scanBondChoices, scanAwayLines, summarizeLangGate, scanDecidedAskReplay, BOND_ASK_POOL, summarizeLangArc, summarizeGoalJoin, scanMenuFlip, scanVInit, scanDoubleAsk, isBondProposalLine, isAskLine, BOND_PROPOSAL_SHAPES, BOND_THEM_CANDIDATE, classifyOrphanTrace, ORPHAN_SITE_NAMES };
