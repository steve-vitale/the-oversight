// analyze-fleecall-b.js — analyzer + judge, arm sim-fleecall-b.
// DIAG (no lever): finding #2602 — "WINNABLE FIGHTS END ON THE
// FLEE CALL, NOT ON DAMAGE". Corpus re-read, NO new sims, NO
// game-code change. Re-derived 2026-11-24 (adoption run
// fleshout-loop-b-20261124T2130Z) from the frozen prereg
// (evidence/2026-11-24/sim-fleecall-b-prereg.md) after the 1930Z
// worker's analyzer + proof test were wiped by a machine restart;
// the stranded evidence file was reproduced verbatim and this
// instrument must reproduce its numbers exactly or the verdict
// does not stand.
//
// Corpus (frozen): evidence/2026-11-24/perseed-basedmg-b-ctl/
// (8 seeds 109501-109508) + evidence/2026-11-24/basedmg-b-analysis.json
// (27 launched meetings: 20 vFlee, 7 vDie). Second sample:
// evidence/2026-11-24/fightcap-recheck-a-analysis.json (seeds
// 110101-110108) — partial only, never pooled: its meetings carry
// mHpStart/mDealt/rounds/outcome but no fleeHpFrac and no fighters
// snapshot, so lead HP at flee is NOT recoverable there.
//
// Frozen definitions (per fled launched meeting):
//   mHpRemaining = mHpStart - mDealt
//   dpr = mDealt / rounds
//   roundsToKill = ceil(mHpRemaining / dpr) when dpr > 0; Infinity
//     when dpr = 0 (never a division by zero, never an invented rate)
//   withinOneRound = (mHpRemaining <= dpr) when dpr > 0, else false
//   leadHpAtFlee: from the transcript — last `hits <lead> for N (M
//     left)` line naming the lead, plus any `+N HP` heal lines naming
//     the lead after it. Cross-checked against fleeHpFrac (leadHp /
//     fleeHpFrac must be within 0.6 of an integer max HP in [50, 150]
//     — a miss is a parse error, not a silent pass).
//   fleeVariant from the terminal log line: hopeless ("sees how this
//     ends — and runs…"), floor ("is past holding — they run…", with
//     or without the "Y answered X's shout, but" prefix), learn
//     ("has seen enough — withdraws…"), committed-floor ("past
//     holding even a finished fight"), other = UNCLASSIFIED.
//   classified iff variant != other AND leadHpAtFlee is a number AND
//     roundsToKill is a number or Infinity.
//
// Bars (frozen): B1 classification complete (20/20, 0 unclassified);
// B2 pool floor (fled >= 10); B3 within-one-round share stated WITH
// its denominator (dpr=0 meetings count as NOT within one round);
// B4 instrument health (0 parse errors; analyzer selftest green;
// determinism byte-identical on re-run; proof test green). Verdict:
// DIAG-GO iff B1-B4 all pass; else DIAG-NO-GO naming the failed bar.
// No threshold on the share value itself — this is a measurement
// DIAG; the share IS the finding.
//
// B4's selftest/determinism/proof are external to the corpus pass:
// pass them with --external selftest,determinism,proof AFTER running
// each for real (selftest: `node scripts/analyze-fleecall-b.js
// --selftest`; determinism: two identical runs, byte-identical
// stdout; proof: `node scripts/test-fleecall-b.js`). Without them
// B4 reports the missing checks and the verdict is DIAG-NO-GO.
//
// Usage:
//   node scripts/analyze-fleecall-b.js [--dir DIR] [--analysis FILE]
//     [--recheck FILE] [--out FILE] [--external a,b,c]
//   node scripts/analyze-fleecall-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');

const REPO = path.join(__dirname, '..');
const DEFAULT_DIR = path.join(REPO, 'evidence', '2026-11-24', 'perseed-basedmg-b-ctl');
const DEFAULT_ANALYSIS = path.join(REPO, 'evidence', '2026-11-24', 'basedmg-b-analysis.json');
const DEFAULT_RECHECK = path.join(REPO, 'evidence', '2026-11-24', 'fightcap-recheck-a-analysis.json');

function r1(x) { return x == null ? null : Math.round(x * 10) / 10; }
function r2(x) { return x == null ? null : Math.round(x * 100) / 100; }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function pearson(xs, ys) {
  if (!xs.length || xs.length !== ys.length) return null;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

// ---------- frozen definitions ----------
function mHpRemaining(m) { return (m.mHpStart != null && m.mDealt != null) ? m.mHpStart - m.mDealt : null; }
function dprOf(m) { return (m.rounds > 0 && m.mDealt != null) ? m.mDealt / m.rounds : null; }
function roundsToKill(rem, dpr) {
  if (rem == null || dpr == null) return null;
  if (dpr === 0) return Infinity;
  return Math.ceil(rem / dpr);
}
function withinOneRound(rem, dpr) {
  if (rem == null || dpr == null) return false;
  if (dpr === 0) return false;
  return rem <= dpr;
}

// Monster-hit line: "R3: Final Chapter hits Ines for 21 (41 left)".
// The named person is the one hit; the trailing number is their HP
// after the hit. Strike lines ("X strikes for N (H left)") are
// monster-HP lines and never match — the verb is "hits", not
// "strikes".
const HIT_RE = /^R\d+: .+? hits (.+?) for (\d+) \((\d+) left\)$/;
// Field-medicine heal: "R5: Ines stops mid-fight and binds the
// wound — field medicine, +20 HP."
const HEAL_RE = /^R\d+: (.+?) stops mid-fight and binds the wound.*\+(\d+) HP/;
function leadNamesOf(fighter) {
  const names = [];
  if (!fighter) return names;
  if (fighter.logName) names.push(String(fighter.logName));
  if (fighter.name) {
    names.push(String(fighter.name));
    const first = String(fighter.name).split(' ')[0];
    if (first && names.indexOf(first) === -1) names.push(first);
  }
  return names;
}

// Parse the lead's HP at flee from the transcript. Returns
// { hp, leadHitSum, hitLines } — hp is null when no hit line names
// the lead. leadHitSum is the sum of the damage on every hit line
// naming the lead (the engine's vTaken must equal it; see Blanks).
// Heals naming the lead AFTER the last hit line add to hp; a heal
// before the last hit is already reflected in that hit's number.
function parseLeadHpAtFlee(log, leadNames) {
  let hp = null;
  let leadHitSum = 0;
  let hitLines = 0;
  for (const raw of (log || [])) {
    const ln = String(raw || '');
    let m = HIT_RE.exec(ln);
    if (m) {
      if (leadNames.indexOf(m[1]) !== -1) {
        leadHitSum += parseInt(m[2], 10);
        hitLines++;
        hp = parseInt(m[3], 10);
      }
      continue;
    }
    m = HEAL_RE.exec(ln);
    if (m) {
      if (hp != null && leadNames.indexOf(m[1]) !== -1) hp += parseInt(m[2], 10);
      continue;
    }
  }
  return { hp: hp, leadHitSum: leadHitSum, hitLines: hitLines };
}

// Terminal flee line -> variant. Committed-floor MUST be checked
// before floor: its line contains "is past holding" too.
function classifyFleeVariant(log) {
  const lines = (log || []).map(function (l) { return String(l || ''); }).filter(function (l) { return l.trim() !== ''; });
  if (!lines.length) return 'other';
  const last = lines[lines.length - 1];
  if (/past holding even a finished fight/.test(last)) return 'committed-floor';
  if (/sees how this ends/.test(last)) return 'hopeless';
  if (/is past holding/.test(last)) return 'floor';
  if (/has seen enough/.test(last)) return 'learn';
  return 'other';
}

// Cross-check: leadHp / fleeHpFrac must be within 0.6 of an integer
// max HP in [50, 150]. Returns { ok, maxHpEst }.
function crossCheckFleeHp(leadHp, fleeHpFrac) {
  if (leadHp == null || fleeHpFrac == null || !(fleeHpFrac > 0)) return { ok: false, maxHpEst: null };
  const est = leadHp / fleeHpFrac;
  const ok = est >= 50 && est <= 150 && Math.abs(est - Math.round(est)) <= 0.6;
  return { ok: ok, maxHpEst: est };
}

// Mid-fight HP diagnostic for truncated logs (recheck second
// sample): the last monster-hit line's trailing HP, whoever it
// names. NEVER reported as the HP at flee — the log is cut before
// the flee decision and there is no fighters snapshot to say who
// the lead is.
function parseMidFightHp(log) {
  let found = null;
  for (const raw of (log || [])) {
    const m = HIT_RE.exec(String(raw || ''));
    if (m) found = { name: m[1], hp: parseInt(m[3], 10) };
  }
  return found;
}

// ---------- corpus loading ----------
// Join the frozen analysis population (27 meetings) to the raw
// v4encounters rows (log + fleeHpFrac + fighters snapshot) by
// seed|day|vid|mid, preferring an unused candidate matching
// rounds+mDealt (repeats of a key exist). Mirrors
// analyze-basedmg-b.js rawRowsByKey/decompose.
function rawRowsByKey(dir) {
  const map = {};
  let files = [];
  try { files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : []; } catch (e) { files = []; }
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    for (const r of (d.v4encounters || [])) {
      const k = d.seed + '|' + r.day + '|' + r.vid + '|' + r.mid;
      (map[k] || (map[k] = [])).push(r);
    }
  }
  return map;
}

function analyzeMeeting(m, raw) {
  const rem = mHpRemaining(m);
  const dpr = dprOf(m);
  const rtk = roundsToKill(rem, dpr);
  const row = { seed: m.seed, day: m.day, vid: m.vid, mid: m.mid,
    wave: (raw && raw.wave != null ? raw.wave : (m.wave != null ? m.wave : null)),
    outcome: m.outcome, win: !!m.win, rounds: m.rounds,
    mHpStart: m.mHpStart, mDealt: m.mDealt, mHpRemaining: rem,
    dpr: r1(dpr), dprRaw: dpr,
    roundsToKill: (rtk === Infinity ? null : rtk), roundsToKillInfinite: rtk === Infinity,
    withinOneRound: withinOneRound(rem, dpr),
    vTaken: m.vTaken, joinError: !raw };
  if (m.outcome !== 'vFlee') return row;
  if (!raw) {
    row.classified = false; row.variant = 'other'; row.leadHpAtFlee = null;
    row.fleeHpFrac = null; row.maxHpEst = null; row.crossCheckOk = false;
    row.leadHitSum = null; row.vTakenMismatch = true;
    return row;
  }
  const fighters = raw.fighters || [];
  const names = leadNamesOf(fighters[0]);
  const parsed = parseLeadHpAtFlee(raw.log, names);
  const variant = classifyFleeVariant(raw.log);
  const cc = crossCheckFleeHp(parsed.hp, raw.fleeHpFrac);
  row.variant = variant;
  row.leadHpAtFlee = parsed.hp;
  row.fleeHpFrac = (raw.fleeHpFrac != null ? raw.fleeHpFrac : null);
  row.maxHpEst = (cc.maxHpEst != null ? r1(cc.maxHpEst) : null);
  row.crossCheckOk = cc.ok;
  row.leadHitSum = parsed.leadHitSum;
  row.vTakenMismatch = (m.vTaken != null) ? (parsed.leadHitSum !== m.vTaken) : false;
  row.classified = variant !== 'other' && parsed.hp != null &&
    (typeof rtk === 'number' || rtk === Infinity);
  return row;
}

function loadPrimary(dir, analysisFile) {
  const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
  const meetings = analysis.meetings || [];
  const rawMap = rawRowsByKey(dir);
  const used = {};
  const rows = meetings.map(function (m) {
    const k = m.seed + '|' + m.day + '|' + m.vid + '|' + m.mid;
    const cands = rawMap[k] || [];
    let raw = null;
    for (let i = 0; i < cands.length; i++) {
      if (used[k + '#' + i]) continue;
      if (cands[i].rounds === m.rounds && cands[i].mDealt === m.mDealt) { raw = cands[i]; used[k + '#' + i] = true; break; }
    }
    if (!raw) {
      for (let i = 0; i < cands.length; i++) {
        if (!used[k + '#' + i]) { raw = cands[i]; used[k + '#' + i] = true; break; }
      }
    }
    return analyzeMeeting(m, raw);
  });
  return { analysis: analysis, rows: rows };
}

// Second sample (partial, never pooled): the recheck analysis
// meetings carry mHpStart/mDealt/rounds/outcome but no fleeHpFrac
// and no fighters snapshot, so lead HP at flee is unrecoverable.
// A meeting that DID carry fleeHpFrac or fighters would break the
// premise and is counted as a parse error.
function analyzeSecondSample(recheckFile) {
  const rec = JSON.parse(fs.readFileSync(recheckFile, 'utf8'));
  const out = { ctl: [], arm: [], armDied: 0, premiseViolations: 0, errors: [] };
  [['ctl', rec.ctlMeetings || []], ['arm', rec.armMeetings || []]].forEach(function (pair) {
    const leg = pair[0], meetings = pair[1];
    for (const m of meetings) {
      if (m.outcome === 'vDie') { if (leg === 'arm') out.armDied++; continue; }
      if (m.outcome !== 'vFlee') continue;
      if (('fleeHpFrac' in m && m.fleeHpFrac != null) || ('fighters' in m && m.fighters != null)) {
        out.premiseViolations++;
        out.errors.push('second-sample meeting carries fleeHpFrac/fighters: ' + m.seed + ' d' + m.day + ' ' + m.mid);
      }
      const rem = mHpRemaining(m);
      const dpr = dprOf(m);
      const rtk = roundsToKill(rem, dpr);
      const diag = parseMidFightHp(m.log);
      out[leg].push({ leg: leg, seed: m.seed, day: m.day, mid: m.mid,
        rounds: m.rounds, mHpRemaining: rem, dpr: r1(dpr),
        roundsToKill: (rtk === Infinity ? null : rtk), roundsToKillInfinite: rtk === Infinity,
        withinOneRound: withinOneRound(rem, dpr),
        leadHpAtFlee: null, leadHpNote: 'unrecorded (truncated log, no fleeHpFrac, no fighters snapshot)',
        midFightHpDiagnostic: diag });
    }
  });
  return out;
}

function summarizePrimary(rows) {
  const fled = rows.filter(function (r) { return r.outcome === 'vFlee'; });
  const died = rows.filter(function (r) { return r.outcome === 'vDie'; });
  const classified = fled.filter(function (r) { return r.classified; });
  const unclassified = fled.filter(function (r) { return !r.classified; });
  const within = fled.filter(function (r) { return r.withinOneRound; });
  const finite = fled.filter(function (r) { return !r.roundsToKillInfinite; });
  const leadHps = fled.map(function (r) { return r.leadHpAtFlee; }).filter(function (x) { return x != null; });
  const rems = fled.map(function (r) { return r.mHpRemaining; }).filter(function (x) { return x != null; });
  const rtks = finite.map(function (r) { return r.roundsToKill; });
  const variants = { hopeless: 0, floor: 0, learn: 0, 'committed-floor': 0, other: 0 };
  fled.forEach(function (r) { variants[r.variant] = (variants[r.variant] || 0) + 1; });
  const floorHps = fled.filter(function (r) { return r.variant === 'floor'; }).map(function (r) { return r.leadHpAtFlee; }).filter(function (x) { return x != null; });
  const hopelessHps = fled.filter(function (r) { return r.variant === 'hopeless'; }).map(function (r) { return r.leadHpAtFlee; }).filter(function (x) { return x != null; });
  const parseErrors = [];
  fled.forEach(function (r) {
    if (r.joinError) parseErrors.push('join failed: ' + r.seed + ' d' + r.day + ' ' + r.mid);
    if (!r.crossCheckOk) parseErrors.push('fleeHpFrac cross-check failed: ' + r.seed + ' d' + r.day + ' ' + r.mid + ' (leadHp ' + r.leadHpAtFlee + ', frac ' + r.fleeHpFrac + ')');
    if (r.vTakenMismatch) parseErrors.push('vTaken != lead hit-sum: ' + r.seed + ' d' + r.day + ' ' + r.mid + ' (vTaken ' + r.vTaken + ', hit-sum ' + r.leadHitSum + ')');
    if (!r.classified) parseErrors.push('unclassified fled meeting: ' + r.seed + ' d' + r.day + ' ' + r.mid + ' (variant ' + r.variant + ', leadHp ' + r.leadHpAtFlee + ')');
  });
  const diedRems = died.map(function (r) { return r.mHpRemaining; }).filter(function (x) { return x != null; });
  const corr = function (xs, ys) { const v = pearson(xs, ys); return v == null ? null : r2(v); };
  const correlations = [
    { pair: 'leadHp ~ mHpRemaining', r: corr(leadHps, rems) },
    { pair: 'leadHp ~ rounds', r: corr(leadHps, fled.map(function (r) { return r.rounds; })) },
    { pair: 'mHpRemaining ~ rounds', r: corr(rems, fled.map(function (r) { return r.rounds; })) },
    { pair: 'leadHp ~ dpr', r: corr(leadHps, fled.map(function (r) { return r.dprRaw; })) },
    { pair: 'mHpRemaining ~ dpr', r: corr(rems, fled.map(function (r) { return r.dprRaw; })) },
    { pair: 'leadHp ~ roundsToKill (finite)', r: corr(finite.map(function (r) { return r.leadHpAtFlee; }), rtks) },
  ];
  return { n: rows.length, fledN: fled.length, diedN: died.length,
    classifiedN: classified.length, unclassifiedN: unclassified.length,
    withinOneRoundN: within.length, withinOneRoundShare: fled.length ? within.length / fled.length : null,
    variants: variants,
    distributions: {
      leadHp: { median: median(leadHps), mean: r1(mean(leadHps)), min: Math.min.apply(null, leadHps), max: Math.max.apply(null, leadHps), n: leadHps.length },
      mHpRemaining: { median: median(rems), mean: r1(mean(rems)), min: Math.min.apply(null, rems), max: Math.max.apply(null, rems), n: rems.length,
        above350: rems.filter(function (x) { return x > 350; }).length },
      roundsToKillFinite: { median: median(rtks), min: Math.min.apply(null, rtks), max: Math.max.apply(null, rtks), n: rtks.length,
        withinFive: rtks.filter(function (x) { return x <= 5; }).length },
      leadHpByVariant: {
        floor: { median: median(floorHps), min: Math.min.apply(null, floorHps), max: Math.max.apply(null, floorHps), n: floorHps.length },
        hopeless: { median: median(hopelessHps), min: Math.min.apply(null, hopelessHps), max: Math.max.apply(null, hopelessHps), n: hopelessHps.length },
      },
    },
    correlations: correlations,
    died: { n: died.length, mHpRemainingMedian: median(diedRems),
      mHpRemainingMin: Math.min.apply(null, diedRems), mHpRemainingMax: Math.max.apply(null, diedRems),
      rounds: died.map(function (r) { return r.rounds; }).sort(function (a, b) { return a - b; }),
      leadHpAtDeath: 0 },
    vTakenMismatches: fled.filter(function (r) { return r.vTakenMismatch; }).length,
    crossCheckMaxHpEst: fled.map(function (r) { return r.maxHpEst; }),
    parseErrors: parseErrors };
}

function judge(summary, second, externals) {
  const ext = externals || {};
  const bars = [];
  bars.push({ id: 'B1', pass: summary.classifiedN === summary.fledN && summary.unclassifiedN === 0,
    detail: 'classification complete: ' + summary.classifiedN + '/' + summary.fledN + ' fled meetings classified, ' + summary.unclassifiedN + ' unclassified' });
  bars.push({ id: 'B2', pass: summary.fledN >= 10,
    detail: 'pool floor: fled meetings ' + summary.fledN + ' (floor 10)' });
  bars.push({ id: 'B3', pass: summary.withinOneRoundN != null && summary.fledN > 0,
    detail: 'within-one-round share: ' + summary.withinOneRoundN + '/' + summary.fledN + ' = ' + (summary.fledN ? (100 * summary.withinOneRoundN / summary.fledN).toFixed(1) + '%' : 'n/a') + ' (dpr=0 meetings count as NOT within one round)' });
  const missingExt = ['selftest', 'determinism', 'proof'].filter(function (k) { return !ext[k]; });
  const b4pass = summary.parseErrors.length === 0 && second.premiseViolations === 0 && missingExt.length === 0;
  bars.push({ id: 'B4', pass: b4pass,
    detail: 'instrument health: parse errors ' + summary.parseErrors.length +
      (second.premiseViolations ? ('; second-sample premise violations ' + second.premiseViolations) : '') +
      (missingExt.length ? ('; external checks not supplied: ' + missingExt.join(', ')) : '; selftest green; determinism byte-identical; proof test green') });
  let verdict = 'DIAG-GO', kind = '';
  if (!bars.every(function (b) { return b.pass; })) {
    verdict = 'DIAG-NO-GO';
    kind = !bars[1].pass ? 'THIN-POOL' : (!bars[0].pass ? 'B1-CLASSIFICATION' : (!bars[3].pass ? 'B4-INSTRUMENT' : 'B3'));
  }
  return { verdict: verdict, kind: kind, bars: bars };
}

function runAnalysis(opts) {
  const loaded = loadPrimary(opts.dir, opts.analysis);
  const summary = summarizePrimary(loaded.rows);
  const second = analyzeSecondSample(opts.recheck);
  const j = judge(summary, second, opts.externals);
  const wall = loaded.analysis.wall || {};
  return { verdict: j.verdict, kind: j.kind, bars: j.bars,
    corpus: { analysis: 'basedmg-b-analysis.json', seeds: '109501-109508', meetings: loaded.rows.length,
      recheck: 'fightcap-recheck-a-analysis.json', recheckSeeds: '110101-110108' },
    primary: { table: loaded.rows.filter(function (r) { return r.outcome === 'vFlee'; }).map(function (r) {
        return { seed: r.seed, day: r.day, mid: r.mid, wave: r.wave, rounds: r.rounds,
          mHpRemaining: r.mHpRemaining, dpr: r.dpr,
          roundsToKill: r.roundsToKill, roundsToKillInfinite: r.roundsToKillInfinite,
          withinOneRound: r.withinOneRound, leadHpAtFlee: r.leadHpAtFlee,
          fleeHpFrac: r.fleeHpFrac, maxHpEst: r.maxHpEst, variant: r.variant,
          vTaken: r.vTaken, classified: r.classified }; }),
      died: loaded.rows.filter(function (r) { return r.outcome === 'vDie'; }).map(function (r) {
        return { seed: r.seed, day: r.day, mid: r.mid, wave: r.wave, rounds: r.rounds,
          mHpRemaining: r.mHpRemaining, dpr: r.dpr,
          roundsToKill: r.roundsToKill, roundsToKillInfinite: r.roundsToKillInfinite,
          vTaken: r.vTaken }; }),
      summary: summary },
    secondSample: second,
    wall: { national: wall.national, seedWins: wall.seedWins, wave4: wall.wave4, wave5: wall.wave5,
      medianDays: wall.medianDays, communityLost: wall.communityLost, n: wall.n, scaleRanks: wall.scaleRanks },
    killShare: loaded.analysis.killShare, winShare: loaded.analysis.winShare,
    parseErrors: summary.parseErrors };
}

module.exports = { parseLeadHpAtFlee: parseLeadHpAtFlee, classifyFleeVariant: classifyFleeVariant,
  crossCheckFleeHp: crossCheckFleeHp, leadNamesOf: leadNamesOf,
  mHpRemaining: mHpRemaining, dprOf: dprOf, roundsToKill: roundsToKill,
  withinOneRound: withinOneRound, parseMidFightHp: parseMidFightHp,
  loadPrimary: loadPrimary, analyzeSecondSample: analyzeSecondSample,
  summarizePrimary: summarizePrimary, judge: judge, runAnalysis: runAnalysis,
  median: median, mean: mean, pearson: pearson, r1: r1, r2: r2 };

// ---------- selftest (19 checks) ----------
function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  function sleepMs(ms) {
    try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
    catch (e) {
      const t0 = process.hrtime.bigint();
      while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
    }
  }
  function writeFileRetry(file, data) {
    let last = null;
    for (let i = 0; i < 40; i++) {
      try { fs.writeFileSync(file, data); return; }
      catch (e) { last = e; sleepMs(250); }
    }
    throw last;
  }
  // --- classification shapes ---
  check('hopeless line classifies hopeless',
    classifyFleeVariant(['R8: Ines sees how this ends — and runs while running still works.']) === 'hopeless');
  check('floor line with answered-shout prefix classifies floor',
    classifyFleeVariant(["R2: Dale answered Andrés's shout, but Andrés is past holding — they run while running still works."]) === 'floor');
  check('plain floor line classifies floor',
    classifyFleeVariant(['R2: Rosa is past holding — they run while running still works.']) === 'floor');
  check('learn line classifies learn',
    classifyFleeVariant(['R3: Ana has seen enough — withdraws to report back. (Learn-first: not winnable, not worth the blood.)']) === 'learn');
  check('committed-floor line classifies committed-floor (not floor)',
    classifyFleeVariant(['R4: Ingrid is past holding even a finished fight — they run while running still works. (Committed-finish floor)']) === 'committed-floor');
  check('unrecognized terminal line classifies other',
    classifyFleeVariant(['R1: Ana strikes for 14 (986 left)']) === 'other');
  // --- lead-HP parsing ---
  const logA = [
    'R1: Epitaph hits Kofi for 14 (86 left)',
    'R2: Epitaph hits Kofi for 12 (74 left)',
    'R2: Kofi stops mid-fight and binds the wound — field medicine, +20 HP.',
    'R3: Final Chapter hits Kofi for 17 (57 left)',
    'R3: Kofi sees how this ends — and runs while running still works.',
  ];
  const pA = parseLeadHpAtFlee(logA, ['Kofi']);
  check('last hit line wins and a heal before it is not double-counted (57, hit-sum 43)',
    pA.hp === 57 && pA.leadHitSum === 43 && pA.hitLines === 3, JSON.stringify(pA));
  const logB = [
    'R1: Epitaph hits the man in his 40s, with a long braid for 18 (82 left)',
    'R2: Final Chapter hits the man in his 40s, with a long braid for 20 (62 left)',
    'R3: Final Chapter hits the man in his 40s, with a long braid for 21 (41 left)',
  ];
  const pB = parseLeadHpAtFlee(logB, ['the man in his 40s, with a long braid', 'Kofi']);
  check('descriptor logName matches the lead (41, hit-sum 59)',
    pB.hp === 41 && pB.leadHitSum === 59, JSON.stringify(pB));
  const logC = [
    'R1: Epitaph hits Tomas for 17 (63 left)',
    'R1: Ines strikes for 60 (x2.0) (987 left)',
  ];
  const pC = parseLeadHpAtFlee(logC, ['Ines']);
  check('no hit line naming the lead -> hp null (ally hits do not count)',
    pC.hp === null && pC.leadHitSum === 0, JSON.stringify(pC));
  const logD = [
    'R1: Epitaph hits Ines for 10 (90 left)',
    'R2: Just Fix It hits Ines for 17 (73 left)',
    'R5: Ines stops mid-fight and binds the wound — field medicine, +20 HP.',
  ];
  const pD = parseLeadHpAtFlee(logD, ['Ines']);
  check('heal after the last hit adds (+20 after 73 -> 93)',
    pD.hp === 93 && pD.leadHitSum === 27, JSON.stringify(pD));
  // --- frozen definitions ---
  check('dpr=0 -> roundsToKill Infinity, withinOneRound false',
    roundsToKill(1029, 0) === Infinity && withinOneRound(1029, 0) === false);
  check('roundsToKill ceils (95/119 -> 1) and withinOneRound reads the live rate',
    roundsToKill(95, 119) === 1 && withinOneRound(95, 119) === true && roundsToKill(352, 78.888) === 5);
  // --- cross-check ---
  const ccOk = crossCheckFleeHp(41, 0.41);
  check('cross-check passes at leadHp 41 / frac 0.41 (maxHpEst 100)',
    ccOk.ok === true && ccOk.maxHpEst === 100, JSON.stringify(ccOk));
  const ccBad = crossCheckFleeHp(41, 0.2);
  check('cross-check fails when the implied max HP leaves [50, 150] (41/0.2 = 205)',
    ccBad.ok === false, JSON.stringify(ccBad));
  // --- join (synthetic per-seed dir) ---
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fleecall-analyze-'));
  function mkSeed(dir, seed, rows) {
    fs.mkdirSync(dir, { recursive: true });
    writeFileRetry(path.join(dir, 's' + seed + '.json'),
      JSON.stringify({ seed: seed, v4encounters: rows }));
  }
  function fledRow(o) {
    return { day: o.day, vid: o.vid || 'a', mid: o.mid || 'eulogy', wave: 4, outcome: 'vFlee',
      rounds: o.rounds, mDealt: o.mDealt, mHpStart: o.mHpStart, vTaken: o.vTaken || 0,
      fleeHpFrac: o.frac, fleeLearn: false, fleeWise: false,
      fighters: [{ vid: o.vid || 'a', name: 'Ana Ray', logName: 'Ana', wb: 5, armorP: 10, abilities: [] }],
      log: o.log };
  }
  function hitLog(hpLeft, rounds) {
    // One hit per round, lead HP stepping down to hpLeft; terminal hopeless line.
    // Returns { log, taken }: the caller must set vTaken = taken.
    const log = [];
    let hp = 100, taken = 0;
    for (let r = 1; r <= rounds; r++) {
      const take = (r === rounds) ? hp - hpLeft : 10;
      hp -= take; taken += take;
      log.push('R' + r + ': Epitaph hits Ana for ' + take + ' (' + hp + ' left)');
    }
    log.push('R' + rounds + ': Ana sees how this ends — and runs while running still works.');
    return { log: log, taken: taken };
  }
  const joinDir = path.join(tmp, 'join');
  // Two rows share the key 109501|20|a|eulogy; only the second
  // matches rounds+mDealt (3, 120). The first is a decoy (2, 50).
  mkSeed(joinDir, 109501, [
    fledRow({ day: 20, rounds: 2, mDealt: 50, mHpStart: 1000, vTaken: 20, frac: 0.8, log: hitLog(80, 2).log }),
    fledRow({ day: 20, rounds: 3, mDealt: 120, mHpStart: 1000, vTaken: 30, frac: 0.7, log: hitLog(70, 3).log }),
  ]);
  const joinAnalysis = { meetings: [{ seed: 109501, day: 20, vid: 'a', mid: 'eulogy', outcome: 'vFlee', rounds: 3, mDealt: 120, mHpStart: 1000, vTaken: 30 }],
    wall: {}, killShare: 0, winShare: 0 };
  const joinAnalysisFile = path.join(tmp, 'join-analysis.json');
  writeFileRetry(joinAnalysisFile, JSON.stringify(joinAnalysis));
  const joined = loadPrimary(joinDir, joinAnalysisFile);
  check('join picks the rounds+mDealt-matching row when a key repeats (leadHp 70, not the decoy 80)',
    joined.rows.length === 1 && joined.rows[0].leadHpAtFlee === 70 && joined.rows[0].classified === true,
    JSON.stringify(joined.rows[0]));
  // --- judge shapes ---
  // Build the GO shape through the join path: 20 distinct fled
  // meetings, each with a consistent log (hit-sum == vTaken,
  // leadHp/frac == 100) and a hopeless terminal line.
  const goDir = path.join(tmp, 'go');
  const goRows = [], goMeetings = [];
  for (let i = 0; i < 20; i++) {
    const day = 20 + i;
    const hpLeft = 70 - (i % 5);
    const hl = hitLog(hpLeft, 4);
    goRows.push(fledRow({ day: day, rounds: 4, mDealt: 100, mHpStart: 1000, vTaken: hl.taken, frac: hpLeft / 100, log: hl.log }));
    goMeetings.push({ seed: 109501, day: day, vid: 'a', mid: 'eulogy', outcome: 'vFlee', rounds: 4, mDealt: 100, mHpStart: 1000, vTaken: hl.taken });
  }
  mkSeed(goDir, 109501, goRows);
  const goAnalysisFile = path.join(tmp, 'go-analysis.json');
  writeFileRetry(goAnalysisFile, JSON.stringify({ meetings: goMeetings, wall: {}, killShare: 0, winShare: 0 }));
  const goLoaded = loadPrimary(goDir, goAnalysisFile);
  const goSummaryRes = summarizePrimary(goLoaded.rows);
  const goSecond = { ctl: [], arm: [], armDied: 0, premiseViolations: 0, errors: [] };
  const jGo = judge(goSummaryRes, goSecond, { selftest: true, determinism: true, proof: true });
  check('judge DIAG-GO on the clean 20-meeting shape (B1 20/20, B2 20, B3 stated, B4 clean)',
    jGo.verdict === 'DIAG-GO' && jGo.bars.every(function (b) { return b.pass; }), JSON.stringify(jGo));
  const jNoExt = judge(goSummaryRes, goSecond, {});
  check('judge DIAG-NO-GO B4-INSTRUMENT when the external checks are not supplied',
    jNoExt.verdict === 'DIAG-NO-GO' && jNoExt.kind === 'B4-INSTRUMENT' && !jNoExt.bars[3].pass, JSON.stringify(jNoExt));
  const thinRows = goLoaded.rows.slice(0, 9);
  const jThin = judge(summarizePrimary(thinRows), goSecond, { selftest: true, determinism: true, proof: true });
  check('judge DIAG-NO-GO THIN-POOL at n=9',
    jThin.verdict === 'DIAG-NO-GO' && jThin.kind === 'THIN-POOL' && !jThin.bars[1].pass, JSON.stringify(jThin));
  const badRows = goLoaded.rows.slice();
  badRows[0] = Object.assign({}, badRows[0], { classified: false, variant: 'other' });
  const badSummary = summarizePrimary(badRows);
  const jBad = judge(badSummary, goSecond, { selftest: true, determinism: true, proof: true });
  check('judge DIAG-NO-GO B1-CLASSIFICATION with one unclassified meeting',
    jBad.verdict === 'DIAG-NO-GO' && jBad.kind === 'B1-CLASSIFICATION' && !jBad.bars[0].pass, JSON.stringify(jBad));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-fleecall-b --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = DEFAULT_DIR, analysis = DEFAULT_ANALYSIS, recheck = DEFAULT_RECHECK, outFile = null;
  const externals = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--analysis') analysis = args[++i];
    else if (args[i] === '--recheck') recheck = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
    else if (args[i] === '--external') {
      args[++i].split(',').forEach(function (t) { externals[t.trim()] = true; });
    }
  }
  const result = runAnalysis({ dir: dir, analysis: analysis, recheck: recheck, externals: externals });
  const text = JSON.stringify(result, null, 2) + '\n';
  console.log(text);
  if (outFile) fs.writeFileSync(outFile, text);
}
