// analyze-fleeguard-b.js — analyzer + judge, arm sim-fleeguard-b.
// BUILD (default-OFF lever FLEEGUARD=1): the live-numbers guard on
// the hopeless flee read (finding #2602; fleecall DIAG-GO).
// Reuses the judged population from legStats
// (scripts/analyze-fightcap-a.js, minPlanParty 1 — the basedmg
// population) and the flee-variant classification from
// scripts/analyze-fleecall-b.js. Judges the frozen prereg bars
// (evidence/2026-11-24/sim-fleeguard-b-prereg.md).
//
// Frozen baseline (fleecall/basedmg corpus, analyzer-verified):
// 27 launched meetings, 0 kills, 20 vFlee, 7 vDie, 11 hopeless /
// 9 floor, within-one-round 1/20, median survival 142.5d.
// The ctl leg must reproduce it EXACTLY (zero drift) or the
// comparison is invalid.
//
// Frozen definitions (per fled launched meeting): variant from the
// terminal log line (fleecall); cross-check ONE-DIRECTIONAL (prereg
// CORRECTION 2026-11-24): a `hopeless` variant requires the
// engine's rec.fleeHopeless == true; a `floor` variant carries no
// constraint (the floor branch sets fleeHopeless = hopeless, so a
// floor flee may carry the flag true). A hopeless variant with the
// flag false IS a parse error. Guard fires = sum of the driver's
// fleeguardHold over the leg's judged meetings.
//
// Bars (frozen): pool floor (both legs >= 10); zero drift (ctl ==
// baseline); primary hopeless-flee count arm <= ctl - 2; mechanism
// fleeguardHold total >= 2; floor untouched (|arm - ctl| <= 1);
// co-primary vDie arm <= ctl + 1; starvation arm <= ctl + 2;
// survival arm >= 0.8x ctl; instrument health (0 parse errors;
// selftest green; determinism byte-identical; proof green).
// Verdict: GO iff ALL bars pass; else NO-GO naming the failed bar.
// Kill share and the within-one-round share are reported
// secondaries with NO threshold — they never re-score the run.
//
// Usage:
//   node scripts/analyze-fleeguard-b.js [--ctl DIR] [--arm DIR]
//     [--out FILE] [--external a,b,c]
//   node scripts/analyze-fleeguard-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');

const REPO = path.join(__dirname, '..');
const DEFAULT_CTL = path.join(REPO, 'evidence', '2026-11-24', 'perseed-fleeguard-b-ctl');
const DEFAULT_ARM = path.join(REPO, 'evidence', '2026-11-24', 'perseed-fleeguard-b-arm');

const { legStats } = require('./analyze-fightcap-a.js');
const FC = require('./analyze-fleecall-b.js');

// Frozen baseline (fleecall/basedmg corpus, analyzer-verified).
const BASELINE = { meetings: 27, kills: 0, vFlee: 20, vDie: 7, hopeless: 11, floor: 9 };

function r1(x) { return x == null ? null : Math.round(x * 10) / 10; }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Raw-row lookup: join legStats meetingsDetail to the raw
// v4encounters rows (log + fleeHpFrac + fighters + fleeguard
// fields) by seed|day|vid|mid, preferring an unused candidate
// matching rounds+mDealt (repeats of a key exist). Mirrors
// analyze-basedmg-b.js / analyze-fleecall-b.js rawRowsByKey.
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
  const rem = FC.mHpRemaining(m);
  const dpr = FC.dprOf(m);
  const rtk = FC.roundsToKill(rem, dpr);
  const row = { seed: m.seed, day: m.day, vid: m.vid, mid: m.mid,
    outcome: m.outcome, win: !!m.win, rounds: m.rounds,
    mHpStart: m.mHpStart, mDealt: m.mDealt, mHpRemaining: rem,
    dpr: r1(dpr), dprRaw: dpr,
    roundsToKill: (rtk === Infinity ? null : rtk), roundsToKillInfinite: rtk === Infinity,
    withinOneRound: FC.withinOneRound(rem, dpr),
    vTaken: m.vTaken, joinError: !raw,
    fleeguardHold: (raw && raw.fleeguardHold != null ? raw.fleeguardHold : null),
    doorHold: (raw && raw.doorHold != null ? raw.doorHold : null),
    fleeHopelessFlag: (raw && raw.fleeHopeless != null ? !!raw.fleeHopeless : null),
    vTakenP4: (raw && raw.vTakenP4 != null ? raw.vTakenP4 : null),
    vHpHypoLeft: (raw && raw.vHpHypoLeft != null ? raw.vHpHypoLeft : null) };
  if (m.outcome !== 'vFlee') return row;
  if (!raw) {
    row.classified = false; row.variant = 'other'; row.leadHpAtFlee = null;
    row.fleeHpFrac = null; row.maxHpEst = null; row.crossCheckOk = false;
    row.leadHitSum = null; row.vTakenMismatch = true;
    return row;
  }
  const fighters = raw.fighters || [];
  const names = FC.leadNamesOf(fighters[0]);
  const parsed = FC.parseLeadHpAtFlee(raw.log, names);
  const variant = FC.classifyFleeVariant(raw.log);
  const cc = FC.crossCheckFleeHp(parsed.hp, raw.fleeHpFrac);
  // ONE-DIRECTIONAL cross-check (prereg CORRECTION 2026-11-24):
  // hopeless => the engine flag must be true; floor => no
  // constraint (the floor branch sets fleeHopeless = hopeless).
  const flagOk = (variant === 'hopeless') ? (raw.fleeHopeless === true)
    : (variant === 'floor' || variant === 'learn' || variant === 'committed-floor' ? true : false);
  row.variant = variant;
  row.leadHpAtFlee = parsed.hp;
  row.fleeHpFrac = (raw.fleeHpFrac != null ? raw.fleeHpFrac : null);
  row.maxHpEst = (cc.maxHpEst != null ? r1(cc.maxHpEst) : null);
  row.crossCheckOk = cc.ok;
  row.flagOk = flagOk;
  row.leadHitSum = parsed.leadHitSum;
  row.vTakenMismatch = (m.vTaken != null) ? (parsed.leadHitSum !== m.vTaken) : false;
  row.classified = variant !== 'other' && parsed.hp != null &&
    (typeof rtk === 'number' || rtk === Infinity);
  return row;
}

function analyzeLeg(dir) {
  const st = legStats(dir, { minPlanParty: 1 });
  const rawMap = rawRowsByKey(dir);
  const used = {};
  const rows = st.meetingsDetail.map(function (m) {
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
  const fled = rows.filter(function (r) { return r.outcome === 'vFlee'; });
  const died = rows.filter(function (r) { return r.outcome === 'vDie'; });
  const variants = { hopeless: 0, floor: 0, learn: 0, 'committed-floor': 0, other: 0 };
  fled.forEach(function (r) { variants[r.variant] = (variants[r.variant] || 0) + 1; });
  const within = fled.filter(function (r) { return r.withinOneRound; });
  const holds = rows.reduce(function (a, r) { return a + (r.fleeguardHold || 0); }, 0);
  const doorHolds = rows.reduce(function (a, r) { return a + (r.doorHold || 0); }, 0);
  const parseErrors = [];
  fled.forEach(function (r) {
    if (r.joinError) parseErrors.push('join failed: ' + r.seed + ' d' + r.day + ' ' + r.mid);
    if (!r.crossCheckOk) parseErrors.push('fleeHpFrac cross-check failed: ' + r.seed + ' d' + r.day + ' ' + r.mid + ' (leadHp ' + r.leadHpAtFlee + ', frac ' + r.fleeHpFrac + ')');
    if (r.vTakenMismatch) parseErrors.push('vTaken != lead hit-sum: ' + r.seed + ' d' + r.day + ' ' + r.mid + ' (vTaken ' + r.vTaken + ', hit-sum ' + r.leadHitSum + ')');
    if (!r.classified) parseErrors.push('unclassified fled meeting: ' + r.seed + ' d' + r.day + ' ' + r.mid + ' (variant ' + r.variant + ', leadHp ' + r.leadHpAtFlee + ')');
    if (r.variant === 'hopeless' && r.flagOk === false) parseErrors.push('hopeless variant but engine fleeHopeless flag false: ' + r.seed + ' d' + r.day + ' ' + r.mid);
  });
  rows.forEach(function (r) {
    if (r.fleeguardHold == null) parseErrors.push('missing fleeguardHold on judged meeting: ' + r.seed + ' d' + r.day + ' ' + r.mid);
  });
  return { dir: dir,
    meetings: st.meetings, kills: st.kills, killShare: st.killShare,
    wins: st.wins, winShare: st.winShare,
    vFlee: st.vFlee, vDie: st.vDie, mFlee: st.mFlee,
    variants: variants,
    hopelessN: variants.hopeless, floorN: variants.floor,
    withinOneRoundN: within.length,
    withinOneRoundShare: fled.length ? within.length / fled.length : null,
    fleeguardHolds: holds, doorHolds: doorHolds,
    starvation: st.starvation, starvationVillager: st.starvationVillager,
    medianDays: st.medianDays, days: st.days,
    national: st.national, seedWins: st.seedWins,
    wave4: st.wave4, wave5: st.wave5, communityLost: st.communityLost,
    scaleRanks: st.scaleRanks, instrumentErrors: st.errors,
    funnel: st.funnel,
    rows: rows, fledRows: fled, diedRows: died,
    parseErrors: parseErrors };
}

function judge(ctl, arm, externals) {
  const ext = externals || {};
  const bars = [];
  const driftOk = ctl.meetings === BASELINE.meetings && ctl.kills === BASELINE.kills &&
    ctl.vFlee === BASELINE.vFlee && ctl.vDie === BASELINE.vDie &&
    ctl.hopelessN === BASELINE.hopeless && ctl.floorN === BASELINE.floor;
  bars.push({ id: 'pool', pass: ctl.meetings >= 10 && arm.meetings >= 10,
    detail: 'pool floor: ctl ' + ctl.meetings + ', arm ' + arm.meetings + ' (floor 10 each)' });
  bars.push({ id: 'drift', pass: driftOk,
    detail: 'zero drift: ctl ' + ctl.meetings + ' meetings, ' + ctl.kills + ' kills, ' + ctl.vFlee +
      ' vFlee, ' + ctl.vDie + ' vDie, ' + ctl.hopelessN + ' hopeless / ' + ctl.floorN + ' floor' +
      ' (baseline 27 / 0 / 20 / 7 / 11 / 9)' });
  bars.push({ id: 'primary', pass: arm.hopelessN <= ctl.hopelessN - 2,
    detail: 'hopeless-flee count: arm ' + arm.hopelessN + ' vs ctl ' + ctl.hopelessN + ' (bar arm <= ctl - 2)' });
  bars.push({ id: 'mechanism', pass: arm.fleeguardHolds >= 2,
    detail: 'guard fires: arm fleeguardHold total ' + arm.fleeguardHolds + ' (bar >= 2); ctl ' + ctl.fleeguardHolds });
  bars.push({ id: 'floor', pass: Math.abs(arm.floorN - ctl.floorN) <= 1,
    detail: 'floor untouched: arm floor flees ' + arm.floorN + ' vs ctl ' + ctl.floorN + ' (bar |diff| <= 1)' });
  bars.push({ id: 'vDie', pass: arm.vDie <= ctl.vDie + 1,
    detail: 'villager combat deaths (vDie meetings): arm ' + arm.vDie + ' vs ctl ' + ctl.vDie + ' (bar arm <= ctl + 1)' });
  bars.push({ id: 'starvation', pass: arm.starvation <= ctl.starvation + 2 && arm.starvationVillager <= ctl.starvationVillager + 2,
    detail: 'starvation deaths: arm ' + arm.starvation + ' total / ' + arm.starvationVillager +
      ' villager vs ctl ' + ctl.starvation + ' / ' + ctl.starvationVillager + ' (bar arm <= ctl + 2)' });
  bars.push({ id: 'survival', pass: arm.medianDays != null && ctl.medianDays != null && arm.medianDays >= 0.8 * ctl.medianDays,
    detail: 'median survival: arm ' + arm.medianDays + 'd vs ctl ' + ctl.medianDays + 'd (bar arm >= 0.8x ctl)' });
  const missingExt = ['selftest', 'determinism', 'proof'].filter(function (k) { return !ext[k]; });
  const instrOk = ctl.parseErrors.length === 0 && arm.parseErrors.length === 0 &&
    ctl.instrumentErrors === 0 && arm.instrumentErrors === 0 && missingExt.length === 0;
  bars.push({ id: 'instrument', pass: instrOk,
    detail: 'instrument health: ctl parse errors ' + ctl.parseErrors.length +
      ' / arm ' + arm.parseErrors.length + '; leg instrument errors ctl ' + ctl.instrumentErrors +
      ' / arm ' + arm.instrumentErrors +
      (missingExt.length ? ('; external checks not supplied: ' + missingExt.join(', ')) : '; selftest green; determinism byte-identical; proof test green') });
  let verdict = 'GO', kind = '';
  if (!bars.every(function (b) { return b.pass; })) {
    verdict = 'NO-GO';
    const failed = bars.filter(function (b) { return !b.pass; }).map(function (b) { return b.id; });
    kind = failed.join('+');
  }
  return { verdict: verdict, kind: kind, bars: bars };
}

function runAnalysis(opts) {
  const ctl = analyzeLeg(opts.ctl);
  const arm = analyzeLeg(opts.arm);
  const j = judge(ctl, arm, opts.externals);
  return { verdict: j.verdict, kind: j.kind, bars: j.bars,
    baseline: BASELINE,
    ctl: { dir: opts.ctl, meetings: ctl.meetings, kills: ctl.kills, killShare: ctl.killShare,
      wins: ctl.wins, winShare: ctl.winShare, vFlee: ctl.vFlee, vDie: ctl.vDie, mFlee: ctl.mFlee,
      variants: ctl.variants, hopelessN: ctl.hopelessN, floorN: ctl.floorN,
      withinOneRoundN: ctl.withinOneRoundN, withinOneRoundShare: ctl.withinOneRoundShare,
      fleeguardHolds: ctl.fleeguardHolds, doorHolds: ctl.doorHolds,
      starvation: ctl.starvation, starvationVillager: ctl.starvationVillager,
      medianDays: ctl.medianDays, national: ctl.national, seedWins: ctl.seedWins,
      wave4: ctl.wave4, wave5: ctl.wave5, communityLost: ctl.communityLost,
      scaleRanks: ctl.scaleRanks, instrumentErrors: ctl.instrumentErrors,
      parseErrors: ctl.parseErrors,
      table: ctl.rows.filter(function (r) { return r.outcome === 'vFlee'; }).map(function (r) {
        return { seed: r.seed, day: r.day, mid: r.mid, rounds: r.rounds,
          mHpRemaining: r.mHpRemaining, dpr: r.dpr, roundsToKill: r.roundsToKill,
          roundsToKillInfinite: r.roundsToKillInfinite, withinOneRound: r.withinOneRound,
          leadHpAtFlee: r.leadHpAtFlee, fleeHpFrac: r.fleeHpFrac, variant: r.variant,
          fleeHopelessFlag: r.fleeHopelessFlag, fleeguardHold: r.fleeguardHold,
          vTaken: r.vTaken, vTakenP4: r.vTakenP4, vHpHypoLeft: r.vHpHypoLeft, classified: r.classified }; }),
      died: ctl.diedRows.map(function (r) { return { seed: r.seed, day: r.day, mid: r.mid, rounds: r.rounds, mHpRemaining: r.mHpRemaining, dpr: r.dpr, vTaken: r.vTaken }; }) },
    arm: { dir: opts.arm, meetings: arm.meetings, kills: arm.kills, killShare: arm.killShare,
      wins: arm.wins, winShare: arm.winShare, vFlee: arm.vFlee, vDie: arm.vDie, mFlee: arm.mFlee,
      variants: arm.variants, hopelessN: arm.hopelessN, floorN: arm.floorN,
      withinOneRoundN: arm.withinOneRoundN, withinOneRoundShare: arm.withinOneRoundShare,
      fleeguardHolds: arm.fleeguardHolds, doorHolds: arm.doorHolds,
      starvation: arm.starvation, starvationVillager: arm.starvationVillager,
      medianDays: arm.medianDays, national: arm.national, seedWins: arm.seedWins,
      wave4: arm.wave4, wave5: arm.wave5, communityLost: arm.communityLost,
      scaleRanks: arm.scaleRanks, instrumentErrors: arm.instrumentErrors,
      parseErrors: arm.parseErrors,
      table: arm.rows.filter(function (r) { return r.outcome === 'vFlee'; }).map(function (r) {
        return { seed: r.seed, day: r.day, mid: r.mid, rounds: r.rounds,
          mHpRemaining: r.mHpRemaining, dpr: r.dpr, roundsToKill: r.roundsToKill,
          roundsToKillInfinite: r.roundsToKillInfinite, withinOneRound: r.withinOneRound,
          leadHpAtFlee: r.leadHpAtFlee, fleeHpFrac: r.fleeHpFrac, variant: r.variant,
          fleeHopelessFlag: r.fleeHopelessFlag, fleeguardHold: r.fleeguardHold,
          vTaken: r.vTaken, vTakenP4: r.vTakenP4, vHpHypoLeft: r.vHpHypoLeft, classified: r.classified }; }),
      died: arm.diedRows.map(function (r) { return { seed: r.seed, day: r.day, mid: r.mid, rounds: r.rounds, mHpRemaining: r.mHpRemaining, dpr: r.dpr, vTaken: r.vTaken }; }) } };
}

module.exports = { analyzeLeg: analyzeLeg, analyzeMeeting: analyzeMeeting, judge: judge,
  runAnalysis: runAnalysis, rawRowsByKey: rawRowsByKey, BASELINE: BASELINE, median: median };

// ---------- selftest ----------
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
    // 480 x 250ms, matching the driver's writeRobust: the host write
    // flap refuses fresh-file writes in windows of minutes, and a
    // 10s retry loop is not enough to ride one out.
    let last = null;
    for (let i = 0; i < 480; i++) {
      try { fs.writeFileSync(file, data); return; }
      catch (e) { last = e; sleepMs(250); }
    }
    throw last;
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fleeguard-analyze-'));
  // Synthetic leg dir: one seed file with a gate + encounters the
  // population accepts. planParty ['b','c'] (minPlan 1), allyVids
  // ['b','c'] present, origin expedition, wave 4, rounds > 0.
  function hitLog(hpLeft, rounds, terminal) {
    const log = [];
    let hp = 100;
    for (let r = 1; r <= rounds; r++) {
      const take = (r === rounds) ? hp - hpLeft : 10;
      hp -= take;
      log.push('R' + r + ': Epitaph hits Ana for ' + take + ' (' + hp + ' left)');
    }
    log.push('R' + rounds + ': ' + terminal);
    return log;
  }
  function mkLeg(dir, seed, meetings) {
    fs.mkdirSync(dir, { recursive: true });
    const gates = [];
    const encounters = [];
    meetings.forEach(function (mm, i) {
      const day = 20 + i;
      gates.push({ day: day, vid: 'a', mid: mm.mid, result: 'seek', reason: null,
        partySize: 3, sensedSize: 3, countedSize: 0, allArmed: true, allArmored: true,
        gear: { a: { armed: true, armored: true, armorP: 30 }, b: { armed: true, armored: true, armorP: 30 }, c: { armed: true, armored: true, armorP: 30 } },
        trickKnown: false, planStage: 'hunt', planTarget: mm.mid, planParty: ['b', 'c'] });
      const log = mm.log || hitLog(mm.hpLeft, mm.rounds, mm.terminal);
      encounters.push({ day: day, vid: 'a', mid: mm.mid, wave: 4, origin: 'expedition',
        mHpStart: mm.mHpStart, vKill: mm.outcome === 'vKill', mHpStartRec: mm.mHpStart,
        alliesN: 2, allyVids: ['b', 'c'], allyFromStart: false,
        fighters: [{ vid: 'a', name: 'Ana Ray', logName: 'Ana', wb: 5, armorP: 30, abilities: [] }],
        gate: null, outcome: mm.outcome, rounds: mm.rounds, vTaken: mm.vTaken, mDealt: mm.mDealt,
        calledHelp: true, allyVid: 'b', ally2Vid: 'c',
        fleeHpFrac: mm.frac, fleeWise: false, fleeLearn: false,
        fleeguardHold: (mm.holds | 0), doorHold: 0, fleeHopeless: !!mm.flag,
        vTakenP4: mm.vTakenP4 != null ? mm.vTakenP4 : 100, vHpHypoLeft: 0,
        trickBefore: false, trickAfter: false, lines: [], log: log });
    });
    writeFileRetry(path.join(dir, 's' + seed + '.json'),
      JSON.stringify({ seed: seed, mode: 'ctl', days: 150, gameDays: 150,
        endReason: 'horizon', won: false, villageLost: false, scaleRank: 'regional',
        maxWave: 4, unlockedWave: 4, standing: 300,
        instrumentErrors: [], deaths: [],
        v4seeds: [], v4departs: [], v4gates: gates, v4encounters: encounters,
        dawnbidScores: [], dawnbidDeparts: [], dawnbidCensus: [],
        dawnbidStarts: [], launchdefSkips: [], companionPool: [] }));
  }
  // --- one-directional cross-check ---
  const dirA = path.join(tmp, 'legA');
  const hopelessLog = hitLog(50, 4, 'Ana sees how this ends — and runs while running still works.');
  const floorFlagLog = hitLog(20, 2, "Bob answered Ana's shout, but Ana is past holding — they run while running still works.");
  mkLeg(dirA, 109501, [
    { mid: 'eulogy', outcome: 'vFlee', rounds: 4, mDealt: 100, mHpStart: 1000, vTaken: 50, frac: 0.5, hpLeft: 50, flag: true, holds: 0, log: hopelessLog },
    { mid: 'audit', outcome: 'vFlee', rounds: 2, mDealt: 40, mHpStart: 1000, vTaken: 80, frac: 0.2, hpLeft: 20, flag: true, holds: 0, log: floorFlagLog },
  ]);
  const legA = analyzeLeg(dirA);
  check('floor flee carrying fleeHopeless=true is NOT a parse error (one-directional check)',
    legA.parseErrors.length === 0 && legA.floorN === 1 && legA.hopelessN === 1,
    JSON.stringify(legA.parseErrors) + ' ' + JSON.stringify(legA.variants));
  check('fleeguardHold totals sum from rows (0 here)',
    legA.fleeguardHolds === 0, 'holds ' + legA.fleeguardHolds);
  // Hopeless variant with the flag false IS a parse error.
  const dirB = path.join(tmp, 'legB');
  mkLeg(dirB, 109501, [
    { mid: 'eulogy', outcome: 'vFlee', rounds: 4, mDealt: 100, mHpStart: 1000, vTaken: 50, frac: 0.5, hpLeft: 50, flag: false, holds: 0, log: hopelessLog },
  ]);
  const legB = analyzeLeg(dirB);
  check('hopeless variant with fleeHopeless=false IS a parse error',
    legB.parseErrors.some(function (e) { return /engine fleeHopeless flag false/.test(e); }),
    JSON.stringify(legB.parseErrors));
  // Missing fleeguardHold on a judged meeting IS a parse error.
  const dirC = path.join(tmp, 'legC');
  mkLeg(dirC, 109501, [
    { mid: 'eulogy', outcome: 'vFlee', rounds: 4, mDealt: 100, mHpStart: 1000, vTaken: 50, frac: 0.5, hpLeft: 50, flag: true, holds: 0, log: hopelessLog },
  ]);
  const cFile = path.join(dirC, 's109501.json');
  const cData = JSON.parse(fs.readFileSync(cFile, 'utf8'));
  delete cData.v4encounters[0].fleeguardHold;
  writeFileRetry(cFile, JSON.stringify(cData));
  const legC = analyzeLeg(dirC);
  check('missing fleeguardHold on a judged meeting IS a parse error',
    legC.parseErrors.some(function (e) { return /missing fleeguardHold/.test(e); }),
    JSON.stringify(legC.parseErrors));
  // --- judge shapes (synthetic ctl/arm summaries) ---
  function fakeLeg(o) {
    return { meetings: o.meetings, kills: o.kills, vFlee: o.vFlee, vDie: o.vDie,
      hopelessN: o.hopeless, floorN: o.floor, fleeguardHolds: o.holds,
      starvation: o.starv || 0, starvationVillager: o.starvV || 0,
      medianDays: o.days, parseErrors: o.errors || [], instrumentErrors: 0 };
  }
  const ctlGo = fakeLeg({ meetings: 27, kills: 0, vFlee: 20, vDie: 7, hopeless: 11, floor: 9, holds: 0, starv: 1, days: 142.5 });
  const armGo = fakeLeg({ meetings: 25, kills: 1, vFlee: 18, vDie: 6, hopeless: 8, floor: 10, holds: 3, starv: 0, days: 150 });
  const jGo = judge(ctlGo, armGo, { selftest: true, determinism: true, proof: true });
  check('judge GO on the clean shape (primary 8 <= 9, mechanism 3, floor |10-9|<=1, vDie 6<=8)',
    jGo.verdict === 'GO' && jGo.bars.every(function (b) { return b.pass; }), JSON.stringify(jGo));
  const armShort = fakeLeg({ meetings: 25, kills: 1, vFlee: 19, vDie: 6, hopeless: 10, floor: 9, holds: 3, starv: 0, days: 150 });
  const jShort = judge(ctlGo, armShort, { selftest: true, determinism: true, proof: true });
  check('judge NO-GO primary when hopeless drops by only 1 (10 > 9)',
    jShort.verdict === 'NO-GO' && jShort.bars[2].pass === false && jShort.kind.indexOf('primary') !== -1, JSON.stringify(jShort));
  const armNoHold = fakeLeg({ meetings: 25, kills: 0, vFlee: 18, vDie: 6, hopeless: 8, floor: 10, holds: 1, starv: 0, days: 150 });
  const jNoHold = judge(ctlGo, armNoHold, { selftest: true, determinism: true, proof: true });
  check('judge NO-GO mechanism when the guard fires only once',
    jNoHold.verdict === 'NO-GO' && jNoHold.bars[3].pass === false, JSON.stringify(jNoHold));
  const ctlDrift = fakeLeg({ meetings: 26, kills: 0, vFlee: 19, vDie: 7, hopeless: 11, floor: 8, holds: 0, starv: 1, days: 142.5 });
  const jDrift = judge(ctlDrift, armGo, { selftest: true, determinism: true, proof: true });
  check('judge NO-GO drift when the ctl leg does not reproduce the baseline (26 meetings)',
    jDrift.verdict === 'NO-GO' && jDrift.bars[1].pass === false, JSON.stringify(jDrift));
  const armFloor = fakeLeg({ meetings: 25, kills: 1, vFlee: 18, vDie: 6, hopeless: 8, floor: 7, holds: 3, starv: 0, days: 150 });
  const jFloor = judge(ctlGo, armFloor, { selftest: true, determinism: true, proof: true });
  check('judge NO-GO floor when the floor count moves by 2 (7 vs 9)',
    jFloor.verdict === 'NO-GO' && jFloor.bars[4].pass === false, JSON.stringify(jFloor));
  const armDie = fakeLeg({ meetings: 25, kills: 1, vFlee: 18, vDie: 9, hopeless: 8, floor: 10, holds: 3, starv: 0, days: 150 });
  const jDie = judge(ctlGo, armDie, { selftest: true, determinism: true, proof: true });
  check('judge NO-GO vDie when party deaths rise by 2 (9 > 8)',
    jDie.verdict === 'NO-GO' && jDie.bars[5].pass === false, JSON.stringify(jDie));
  const jNoExt = judge(ctlGo, armGo, {});
  check('judge NO-GO instrument when the external checks are not supplied',
    jNoExt.verdict === 'NO-GO' && jNoExt.bars[8].pass === false, JSON.stringify(jNoExt));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-fleeguard-b --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let ctl = DEFAULT_CTL, arm = DEFAULT_ARM, outFile = null;
  const externals = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ctl') ctl = args[++i];
    else if (args[i] === '--arm') arm = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
    else if (args[i] === '--external') {
      args[++i].split(',').forEach(function (t) { externals[t.trim()] = true; });
    }
  }
  const result = runAnalysis({ ctl: ctl, arm: arm, externals: externals });
  const text = JSON.stringify(result, null, 2) + '\n';
  console.log(text);
  if (outFile) fs.writeFileSync(outFile, text);
}
