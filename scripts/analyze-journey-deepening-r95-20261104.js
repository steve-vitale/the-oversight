// analyze-journey-deepening-r95-20261104.js -- R95 STANDING-TRACE + BETRAYAL-SITTING + FOLLOW-UP analyzer
// (tooling only, zero game code). Reads per-seed JSONs written by
// scripts/journey-deepening-r95-20261104.js and reports the
// pre-registered S-TRACE verdict + P-DIST-LL + B-SIT betrayal scan, with K-CONTEXT carried
// from the r92 analyzer's summarizeSeed (same pre-collapse rule:
// last deedLog entry with pop > 0, never a post-collapse snapshot).
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
// Usage: node scripts/analyze-journey-deepening-r95-20261104.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports summarizeStanding, distStats, median.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-04');
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

function main() {
  const dir = process.argv[2] || process.env.EVIDIR || DEFAULT_EVIDIR;
  const sfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r95-seed\d+\.json$/.test(f)).sort();
  if (!sfiles.length) { console.log('No r95 seed JSONs in ' + dir); process.exit(1); }
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
  }
  console.log('\nPANEL VERDICTS: ' + JSON.stringify(verdicts));
  // R95 transcript filenames carry the villager id: ...-day<day>-<vid>.txt
  const tfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r95-transcript-\d+-day\d+-.+\.txt$/.test(f)).sort();
  let bTotal = 0, bAccept = 0, bDecline = 0, bUnanswered = 0;
  // B-FOLLOW: a sitting is a follow-up when its vid was an inviter on an
  // earlier convo day in the same seed. Filenames sort by seed then day,
  // so inviters accumulate in order within each seed.
  const invitersBySeed = {};
  let followTotal = 0, followBetrayal = 0;
  for (const f of tfiles) {
    const m = /^journey-deepening-r95-transcript-(\d+)-day(\d+)-(.+)\.txt$/.exec(f);
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
  // Sittings-per-day cap check from seed JSON sitting logs.
  for (const f of sfiles) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const perDay = {};
    for (const sit of (s.sittingLog || [])) perDay[sit.day] = (perDay[sit.day] || 0) + 1;
    console.log(`   SEED ${s.seed} sittingsPerDay=${JSON.stringify(perDay)} inviters=${JSON.stringify(s.inviterHistory || [])} blockedRevisits=${JSON.stringify(s.revisitAttempts || [])}`);
  }
}

if (require.main === module) main();
module.exports = { summarizeStanding, distStats, median, scanBetrayalTranscript };
