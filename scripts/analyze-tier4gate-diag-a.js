// analyze-tier4gate-diag-a.js — DIAG for arm sim-tier4gate-a
// (finding #2648: the tier-4 GATE is the next wall after the tier-4
// pool GO). Quantifies the gate from the existing tier4pool corpora
// (evidence/2026-11-21/perseed-tier4pool-a-{ctl,arm}/, 12 seeds each,
// band 107271-107282) — no new sims for the diag.
//
// The gate rule, read from code (contests.js _cxItemPrize:201-212):
//   tier = max(min(3, wave), broadcastRewardTier(who))   // caps at 3
//   apex = wave >= 4 || wins >= 8 || favor >= 100
//   if (contest.risk === 'extreme' && apex && Math.random() < 0.25) tier = 4
// So a prize roll reaches tier 4 ONLY IF extreme-risk AND apex AND a
// 25% lottery roll. broadcastRewardTier caps at 3 — there is no other
// tier-4 path for contest prizes. This analyzer measures, per leg:
//   - total contest-prize rolls, by risk and by wave
//   - apex-eligible rolls (extreme + apex), and the tier-4 rate on them
//     (expect ~25% — the lottery)
//   - the non-eligible split: not-extreme (by risk) vs extreme-but-not-apex
//   - the two widening increments: wave-3 extreme rolls (earlier apex)
//     and high-risk apex-eligible rolls (more contests counted extreme)
//   - static priors for each candidate lever (eligible x 0.25 / total)
//   - the audit: every tier-4 roll must be apex-eligible (else another
//     path exists and the gate rule above is wrong)
// Usage:
//   node scripts/analyze-tier4gate-diag-a.js --dir evidence/2026-11-21/perseed-tier4pool-a-ctl [--out <file>]
//   node scripts/analyze-tier4gate-diag-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const APEX_CHANCE = 0.25; // cfg.apexChance, reward-economy.json broadcast
const APEX_WINS = 8;      // cfg.apexWins
const APEX_FAVOR = 100;   // cfg.apexFavor

function pct(n, d) { return d ? (100 * n / d) : null; }
function r1(x) { return x == null ? null : Math.round(x * 10) / 10; }

function isApex(p) {
  return (p.wave != null && p.wave >= 4) || (p.wins != null && p.wins >= APEX_WINS) || (p.favor != null && p.favor >= APEX_FAVOR);
}

// analyzeSeed(c): gate quantification for one corpus.
function analyzeSeed(c) {
  const prizes = c.prizeEvents || [];
  const rolls = (c.rollEvents || []).filter(function (r) { return r.caller === 'contest-prize'; });
  const bySeq = {};
  for (const p of prizes) bySeq[p.seq] = p;
  const joined = [];
  let unjoined = 0;
  for (const r of rolls) {
    const p = (r.seq != null) ? bySeq[r.seq] : null;
    if (!p) { unjoined++; continue; }
    joined.push({ roll: r, prize: p });
  }
  const byRisk = {};
  const byWave = {};
  const crossRiskWave = {};
  let maxWins = 0, maxFavor = 0, rollsWins8 = 0, rollsFavor100 = 0;
  let eligible = 0, eligibleT4 = 0, t4 = 0, t4NonEligible = 0;
  let notExtreme = 0, extremeNotApex = 0;
  let wave3Extreme = 0, wave3ExtremeApex = 0;
  let highApex = 0, highApexT4 = 0;
  const apexCond = { wave: 0, wins: 0, favor: 0 };
  const riskNotExtreme = {};
  const extremeNotApexByWave = {};
  for (const j of joined) {
    const risk = j.prize.risk || 'null';
    const wave = j.prize.wave;
    const wv = (wave == null) ? 'null' : String(wave);
    byRisk[risk] = byRisk[risk] || { n: 0, t4: 0 };
    byRisk[risk].n++;
    byWave[wv] = byWave[wv] || { n: 0, t4: 0 };
    byWave[wv].n++;
    crossRiskWave[risk + '@w' + wv] = (crossRiskWave[risk + '@w' + wv] || 0) + 1;
    if (j.prize.wins != null && j.prize.wins > maxWins) maxWins = j.prize.wins;
    if (j.prize.favor != null && j.prize.favor > maxFavor) maxFavor = j.prize.favor;
    if (j.prize.wins != null && j.prize.wins >= APEX_WINS) rollsWins8++;
    if (j.prize.favor != null && j.prize.favor >= APEX_FAVOR) rollsFavor100++;
    const isT4 = j.roll.tier === 4;
    if (isT4) { t4++; byRisk[risk].t4++; byWave[wv].t4++; }
    const el = risk === 'extreme' && isApex(j.prize);
    if (el) {
      eligible++;
      if (isT4) eligibleT4++;
      if (j.prize.wave >= 4) apexCond.wave++;
      if (j.prize.wins >= APEX_WINS) apexCond.wins++;
      if (j.prize.favor >= APEX_FAVOR) apexCond.favor++;
    } else if (isT4) {
      t4NonEligible++;
    }
    if (risk !== 'extreme') {
      notExtreme++;
      riskNotExtreme[risk] = (riskNotExtreme[risk] || 0) + 1;
      if (risk === 'high' && isApex(j.prize)) { highApex++; if (isT4) highApexT4++; }
    } else if (!isApex(j.prize)) {
      extremeNotApex++;
      extremeNotApexByWave[wv] = (extremeNotApexByWave[wv] || 0) + 1;
      if (wave === 3) wave3Extreme++;
    }
    if (risk === 'extreme' && wave === 3 && isApex(j.prize)) wave3ExtremeApex++;
  }
  const total = joined.length;
  const earlierApexEligible = eligible + wave3Extreme;
  const highExtremeEligible = eligible + highApex;
  const bothEligible = eligible + wave3Extreme + highApex;
  return {
    seed: c.seed, total: total, unjoined: unjoined,
    tier4: t4, tier4Rate: r1(pct(t4, total)),
    eligible: eligible, eligibleRate: r1(pct(eligible, total)),
    eligibleT4: eligibleT4, eligibleT4Rate: r1(pct(eligibleT4, eligible)),
    t4NonEligible: t4NonEligible,
    notExtreme: notExtreme, notExtremeRate: r1(pct(notExtreme, total)),
    extremeNotApex: extremeNotApex, extremeNotApexRate: r1(pct(extremeNotApex, total)),
    wave3Extreme: wave3Extreme,
    wave3ExtremeApex: wave3ExtremeApex,
    highApex: highApex, highApexT4: highApexT4,
    apexCond: apexCond,
    byRisk: byRisk, byWave: byWave, crossRiskWave: crossRiskWave,
    maxWins: maxWins, maxFavor: maxFavor, rollsWins8: rollsWins8, rollsFavor100: rollsFavor100,
    riskNotExtreme: riskNotExtreme, extremeNotApexByWave: extremeNotApexByWave,
    // Static priors (lottery 25% on the widened eligible set):
    priorCurrent: r1(100 * eligible * APEX_CHANCE / (total || 1)),
    priorEarlierApex: r1(100 * earlierApexEligible * APEX_CHANCE / (total || 1)),
    priorHighExtreme: r1(100 * highExtremeEligible * APEX_CHANCE / (total || 1)),
    priorBoth: r1(100 * bothEligible * APEX_CHANCE / (total || 1)),
    priorEarlierApexChance50: r1(100 * earlierApexEligible * 0.5 / (total || 1)),
  };
}

function sumLeg(seeds) {
  const tot = { total: 0, unjoined: 0, tier4: 0, eligible: 0, eligibleT4: 0, t4NonEligible: 0,
    notExtreme: 0, extremeNotApex: 0, wave3Extreme: 0, wave3ExtremeApex: 0, highApex: 0, highApexT4: 0,
    byRisk: {}, byWave: {}, crossRiskWave: {}, riskNotExtreme: {}, extremeNotApexByWave: {},
    maxWins: 0, maxFavor: 0, rollsWins8: 0, rollsFavor100: 0,
    apexCond: { wave: 0, wins: 0, favor: 0 } };
  for (const s of seeds) {
    tot.total += s.total; tot.unjoined += s.unjoined; tot.tier4 += s.tier4;
    tot.eligible += s.eligible; tot.eligibleT4 += s.eligibleT4; tot.t4NonEligible += s.t4NonEligible;
    tot.notExtreme += s.notExtreme; tot.extremeNotApex += s.extremeNotApex;
    tot.wave3Extreme += s.wave3Extreme; tot.wave3ExtremeApex += s.wave3ExtremeApex;
    tot.highApex += s.highApex; tot.highApexT4 += s.highApexT4;
    for (const k of Object.keys(s.byRisk)) {
      tot.byRisk[k] = tot.byRisk[k] || { n: 0, t4: 0 };
      tot.byRisk[k].n += s.byRisk[k].n; tot.byRisk[k].t4 += s.byRisk[k].t4;
    }
    for (const k of Object.keys(s.byWave)) {
      tot.byWave[k] = tot.byWave[k] || { n: 0, t4: 0 };
      tot.byWave[k].n += s.byWave[k].n; tot.byWave[k].t4 += s.byWave[k].t4;
    }
    for (const k of Object.keys(s.riskNotExtreme)) tot.riskNotExtreme[k] = (tot.riskNotExtreme[k] || 0) + s.riskNotExtreme[k];
    for (const k of Object.keys(s.extremeNotApexByWave)) tot.extremeNotApexByWave[k] = (tot.extremeNotApexByWave[k] || 0) + s.extremeNotApexByWave[k];
    for (const k of Object.keys(s.crossRiskWave || {})) tot.crossRiskWave[k] = (tot.crossRiskWave[k] || 0) + s.crossRiskWave[k];
    if (s.maxWins > tot.maxWins) tot.maxWins = s.maxWins;
    if (s.maxFavor > tot.maxFavor) tot.maxFavor = s.maxFavor;
    tot.rollsWins8 += s.rollsWins8; tot.rollsFavor100 += s.rollsFavor100;
    tot.apexCond.wave += s.apexCond.wave; tot.apexCond.wins += s.apexCond.wins; tot.apexCond.favor += s.apexCond.favor;
  }
  const total = tot.total || 1;
  tot.tier4Rate = r1(pct(tot.tier4, tot.total));
  tot.eligibleRate = r1(pct(tot.eligible, tot.total));
  tot.eligibleT4Rate = r1(pct(tot.eligibleT4, tot.eligible));
  tot.notExtremeRate = r1(pct(tot.notExtreme, tot.total));
  tot.extremeNotApexRate = r1(pct(tot.extremeNotApex, tot.total));
  tot.priorCurrent = r1(100 * tot.eligible * APEX_CHANCE / total);
  tot.priorEarlierApex = r1(100 * (tot.eligible + tot.wave3Extreme) * APEX_CHANCE / total);
  tot.priorHighExtreme = r1(100 * (tot.eligible + tot.highApex) * APEX_CHANCE / total);
  tot.priorBoth = r1(100 * (tot.eligible + tot.wave3Extreme + tot.highApex) * APEX_CHANCE / total);
  tot.priorEarlierApexChance50 = r1(100 * (tot.eligible + tot.wave3Extreme) * 0.5 / total);
  return tot;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const seeds = [];
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(analyzeSeed(c));
  }
  return { dir: dir, seeds: seeds, leg: sumLeg(seeds) };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, got, want) {
    if (JSON.stringify(got) === JSON.stringify(want)) { pass++; }
    else { fail++; console.log('FAIL ' + name + ': got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want)); }
  }
  // Synthetic corpus: 8 rolls.
  // 1: extreme, wave 4, tier 4 (eligible, paid)
  // 2: extreme, wave 4, tier 3 (eligible, lottery lost)
  // 3: extreme, wave 3, tier 3 (extreme-not-apex; earlier-apex increment)
  // 4: extreme, wave 2, wins 8, tier 4 (eligible via wins)
  // 5: high, wave 4, tier 3 (not-extreme; high-apex increment)
  // 6: high, wave 3, tier 3 (not-extreme, not apex)
  // 7: medium, wave 5, tier 3 (not-extreme)
  // 8: extreme, wave 5, favor 100, tier 3 (eligible via favor, lottery lost)
  // plus one unjoined roll (seq 99).
  const c = { seed: 1,
    prizeEvents: [
      { seq: 1, risk: 'extreme', wave: 4, wins: 0, favor: 0 },
      { seq: 2, risk: 'extreme', wave: 4, wins: 0, favor: 0 },
      { seq: 3, risk: 'extreme', wave: 3, wins: 0, favor: 0 },
      { seq: 4, risk: 'extreme', wave: 2, wins: 8, favor: 0 },
      { seq: 5, risk: 'high', wave: 4, wins: 0, favor: 0 },
      { seq: 6, risk: 'high', wave: 3, wins: 0, favor: 0 },
      { seq: 7, risk: 'medium', wave: 5, wins: 0, favor: 0 },
      { seq: 8, risk: 'extreme', wave: 5, wins: 0, favor: 100 },
    ],
    rollEvents: [
      { seq: 1, caller: 'contest-prize', tier: 4 },
      { seq: 2, caller: 'contest-prize', tier: 3 },
      { seq: 3, caller: 'contest-prize', tier: 3 },
      { seq: 4, caller: 'contest-prize', tier: 4 },
      { seq: 5, caller: 'contest-prize', tier: 3 },
      { seq: 6, caller: 'contest-prize', tier: 3 },
      { seq: 7, caller: 'contest-prize', tier: 3 },
      { seq: 8, caller: 'contest-prize', tier: 3 },
      { seq: 99, caller: 'contest-prize', tier: 3 },
      { seq: null, caller: 'kill-loot', tier: 3 },
    ] };
  const s = analyzeSeed(c);
  check('total', s.total, 8);
  check('unjoined', s.unjoined, 1);
  check('tier4', s.tier4, 2);
  check('tier4Rate', s.tier4Rate, 25);
  check('eligible', s.eligible, 4);
  check('eligibleT4', s.eligibleT4, 2);
  check('eligibleT4Rate', s.eligibleT4Rate, 50);
  check('t4NonEligible', s.t4NonEligible, 0);
  check('notExtreme', s.notExtreme, 3);
  check('extremeNotApex', s.extremeNotApex, 1);
  check('wave3Extreme', s.wave3Extreme, 1);
  check('highApex', s.highApex, 1);
  check('apexCond', s.apexCond, { wave: 3, wins: 1, favor: 1 });
  check('priorCurrent', s.priorCurrent, 12.5);
  check('priorEarlierApex', s.priorEarlierApex, 15.6);
  check('priorHighExtreme', s.priorHighExtreme, 15.6);
  check('priorBoth', s.priorBoth, 18.8);
  // A tier-4 roll on a non-eligible prize must be caught as t4NonEligible.
  const c2 = JSON.parse(JSON.stringify(c));
  c2.rollEvents[4].tier = 4; // high, wave 4 — not extreme, cannot be tier 4 by the gate rule
  const s2 = analyzeSeed(c2);
  check('t4NonEligible catches other path', s2.t4NonEligible, 1);
  check('tier4 counts it', s2.tier4, 3);
  console.log('tier4gate-diag selftest: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) (function () {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  const di = args.indexOf('--dir');
  if (di === -1) { console.error('usage: --dir <corpus-dir> [--out <file>] | --selftest'); process.exit(2); }
  const dir = args[di + 1];
  const out = analyzeDir(dir);
  const oi = args.indexOf('--out');
  if (oi !== -1) {
    fs.mkdirSync(path.dirname(args[oi + 1]), { recursive: true });
    fs.writeFileSync(args[oi + 1], JSON.stringify(out, null, 2) + '\n');
  }
  console.log(JSON.stringify(out.leg, null, 2));
})();

module.exports = { analyzeSeed: analyzeSeed, sumLeg: sumLeg, analyzeDir: analyzeDir, selftest: selftest };
