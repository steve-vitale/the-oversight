// analyze-fleefloor-a.js — analyzer + judge, arm sim-fleefloor-a.
// BUILD (default-OFF lever FLOORFINISH=1): the "finish the kill"
// override on the bravery floor (finding #2602; fleecall DIAG-GO,
// prereg evidence/2026-11-27/sim-fleefloor-a-prereg.md).
// Population: expedition-origin wave-4+ fieldFights with rounds >= 1
// (fought launched fights — the fleecall/partydmg population).
// Variant classification: the fleecall line-based classifier, PLUS
// the door-floor fallback — a floor flee in a door fight
// (allyFromStart) logs NO line (JOINENDLINES/SOLOENDLINES both skip
// allyFromStart fights), so a vFlee with fleeHpFrac set and
// fleeLearn false IS the floor branch (the hopeless branch always
// logs its line, so a lineless vFlee cannot be hopeless; and the
// floor branch sets fleeHopeless = hopeless, so the flag may be
// true on a floor flee).
// Cross-check ONE-DIRECTIONAL (fleeguard-b prereg correction): a
// `hopeless` variant requires the engine's fleeHopeless == true; a
// `floor` variant carries no constraint.
// Within-one-round = (mHpStart − mDealt) <= mDealt / rounds at the
// flee round, dpr > 0 (mHpLeft preferred when the record carries it).
// Bars (frozen, prereg §2): pool floor (both legs >= 10 fought
// meetings); primary armed wave-4 vKills >= 2; floor-flees within one
// round drop to 0 on the arm leg; cost vDie arm <= ctl + 1;
// starvation arm <= ctl + 2; median survival arm >= 0.8x ctl;
// instrument health (0 parse errors; selftest green; determinism
// byte-identical; proof green — the last three supplied via
// --external after actually running them).
// Verdict: GO iff ALL bars pass; else NO-GO naming the failed bar.
// Kill share and the within-one-round share are reported secondaries
// with NO threshold — they never re-score the run.
//
// Usage:
//   node scripts/analyze-fleefloor-a.js [--ctl DIR] [--arm DIR]
//     [--out FILE] [--external a,b,c]
//   node scripts/analyze-fleefloor-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

const REPO = path.join(__dirname, '..');
const DEFAULT_CTL = path.join(REPO, 'evidence', '2026-11-27', 'perseed-fleefloor-a-ctl');
const DEFAULT_ARM = path.join(REPO, 'evidence', '2026-11-27', 'perseed-fleefloor-a-arm');

const FC = require('./analyze-fleecall-b.js');

function r1(x) { return x == null ? null : Math.round(x * 10) / 10; }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// classifyVariant(row): line-based first (fleecall), then the
// door-floor fallback from the engine's own flags. Returns
// 'floor' | 'hopeless' | 'learn' | 'committed-floor' | 'other'.
function classifyVariant(row) {
  const line = FC.classifyFleeVariant(row.log || []);
  if (line !== 'other') return line;
  // Door-floor fallback: the hopeless branch ALWAYS logs its line
  // ("sees how this ends"), so a vFlee with no flee line at all
  // cannot be hopeless — and the floor branch sets fleeHopeless =
  // hopeless, so the flag may legitimately be true on a floor flee
  // (fleeguard-b prereg correction). fleeLearn false is kept: the
  // learn branch sets the flag and logs, so a flagged learn is
  // never silently called a floor.
  if (row.outcome === 'vFlee' && row.fleeHpFrac != null && !row.fleeLearn) return 'floor';
  return 'other';
}

function loadLeg(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  if (!files.length) throw new Error('no corpus files in ' + dir);
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function analyzeLeg(dir) {
  const seeds = loadLeg(dir);
  const parseErrors = [];
  const fieldShas = {};
  const rows = [];
  const seedRows = [];
  seeds.forEach(function (s) {
    if (s.fieldSha) fieldShas[s.fieldSha] = (fieldShas[s.fieldSha] || 0) + 1;
    if (s.floorFinishOn !== (s.mode === 'arm')) parseErrors.push('leg/flag mismatch on seed ' + s.seed + ': mode ' + s.mode + ' floorFinishOn ' + s.floorFinishOn);
    if (!s.senseexpedOn || !s.partysize4On || !s.vetreengageOn || !s.fleerepair2On || !s.fightally2On) parseErrors.push('substrate flag off on seed ' + s.seed);
    if (s.fieldcapdmgOn || s.ragefreeOn || s.freestrikeOn || s.fleeguardOn || s.doorflee2On || s.hypofloorOn || s.speargateOn || s.bowopenOn) parseErrors.push('carrier/other-lever flag on seed ' + s.seed);
    if ((s.instrumentErrors || []).length) parseErrors.push('leg instrument errors on seed ' + s.seed + ': ' + (s.instrumentErrors || []).join('; ').slice(0, 120));
    let starv = 0, starvVillager = 0;
    (s.deaths || []).forEach(function (d) {
      const c = String((d.cause || '') + ' ' + (d.kind || '')).toLowerCase();
      if (c.indexOf('starv') !== -1) { starv++; if (!d.player) starvVillager++; }
    });
    seedRows.push({ seed: s.seed, days: s.days, endReason: s.endReason, won: !!s.won,
      villageLost: !!s.villageLost, scaleRank: s.scaleRank, maxWave: s.maxWave,
      standing: s.standing, starvation: starv, starvationVillager: starvVillager,
      deathsN: (s.deaths || []).length });
    (s.v4fights || []).forEach(function (r) {
      if (r.origin !== 'expedition' || (r.wave | 0) < 4 || (r.rounds | 0) < 1) return;
      const mHpLeft = (typeof r.mHpLeft === 'number' ? r.mHpLeft
        : (r.mHpStart != null ? r.mHpStart - (r.mDealt | 0) : null));
      const dpr = r.rounds ? (r.mDealt | 0) / r.rounds : 0;
      const withinOneRound = (mHpLeft != null && dpr > 0 && mHpLeft <= dpr);
      const row = { seed: s.seed, day: r.day, mid: r.mid, wave: r.wave,
        origin: r.origin, outcome: r.outcome, rounds: r.rounds,
        mHpStart: r.mHpStart, mDealt: r.mDealt | 0, mHpLeft: mHpLeft, dpr: r1(dpr),
        withinOneRound: withinOneRound, vTaken: r.vTaken | 0,
        fleeHpFrac: r.fleeHpFrac, fleeHopelessFlag: !!r.fleeHopeless,
        floorFinishHold: (r.floorFinishHold == null ? null : (r.floorFinishHold | 0)),
        fleeguardHold: (r.fleeguardHold == null ? null : (r.fleeguardHold | 0)),
        doorHold: (r.doorHold == null ? null : (r.doorHold | 0)),
        log: r.log || [] };
      row.variant = row.outcome === 'vFlee' ? classifyVariant(row) : null;
      row.classified = row.outcome !== 'vFlee' || row.variant !== 'other';
      row.flagOk = (row.variant === 'hopeless') ? (row.fleeHopelessFlag === true) : true;
      rows.push(row);
    });
  });
  const fled = rows.filter(function (r) { return r.outcome === 'vFlee'; });
  const died = rows.filter(function (r) { return r.outcome === 'vDie'; });
  const killed = rows.filter(function (r) { return r.outcome === 'vKill'; });
  const variants = { hopeless: 0, floor: 0, learn: 0, 'committed-floor': 0, other: 0 };
  fled.forEach(function (r) { variants[r.variant] = (variants[r.variant] || 0) + 1; });
  const within = fled.filter(function (r) { return r.withinOneRound; });
  const floorWithin = fled.filter(function (r) { return r.variant === 'floor' && r.withinOneRound; });
  const holds = rows.reduce(function (a, r) { return a + ((r.floorFinishHold | 0) || 0); }, 0);
  const heldRows = rows.filter(function (r) { return (r.floorFinishHold | 0) > 0; });
  const heldDamage = heldRows.reduce(function (a, r) { return a + (r.mDealt | 0); }, 0);
  fled.forEach(function (r) {
    if (!r.classified) parseErrors.push('unclassified fled meeting: seed ' + r.seed + ' d' + r.day + ' ' + r.mid + ' (variant ' + r.variant + ', fleeHpFrac ' + r.fleeHpFrac + ', fleeHopeless ' + r.fleeHopelessFlag + ')');
    if (r.variant === 'hopeless' && r.flagOk === false) parseErrors.push('hopeless variant but engine fleeHopeless flag false: seed ' + r.seed + ' d' + r.day + ' ' + r.mid);
    if (r.mHpLeft == null && r.outcome !== 'vKill') parseErrors.push('no monster HP left on fled meeting: seed ' + r.seed + ' d' + r.day + ' ' + r.mid);
  });
  rows.forEach(function (r) {
    if (r.floorFinishHold == null) parseErrors.push('missing floorFinishHold on judged meeting: seed ' + r.seed + ' d' + r.day + ' ' + r.mid);
  });
  const days = seedRows.map(function (s) { return s.days; });
  const starvTotal = seedRows.reduce(function (a, s) { return a + s.starvation; }, 0);
  const starvVillTotal = seedRows.reduce(function (a, s) { return a + s.starvationVillager; }, 0);
  return { dir: dir, seedsN: seeds.length, fieldShas: fieldShas,
    meetings: rows.length, kills: killed.length, killShare: rows.length ? killed.length / rows.length : null,
    vFlee: fled.length, vDie: died.length,
    variants: variants, hopelessN: variants.hopeless, floorN: variants.floor,
    withinOneRoundN: within.length,
    withinOneRoundShare: fled.length ? within.length / fled.length : null,
    floorWithinOneRoundN: floorWithin.length,
    floorFinishHolds: holds, heldFights: heldRows.length, heldDamage: heldDamage,
    starvation: starvTotal, starvationVillager: starvVillTotal,
    medianDays: median(days), days: days,
    national: seedRows.filter(function (s) { return s.scaleRank === 'national'; }).length,
    seedWins: seedRows.filter(function (s) { return s.won; }).length,
    wave4: seedRows.filter(function (s) { return s.maxWave >= 4; }).length,
    wave5: seedRows.filter(function (s) { return s.maxWave >= 5; }).length,
    communityLost: seedRows.filter(function (s) { return s.villageLost; }).length,
    scaleRanks: seedRows.map(function (s) { return s.scaleRank; }),
    instrumentErrors: seeds.reduce(function (a, s) { return a + ((s.instrumentErrors || []).length); }, 0),
    rows: rows, fledRows: fled, diedRows: died, killedRows: killed,
    seedRows: seedRows, parseErrors: parseErrors };
}

function judge(ctl, arm, externals) {
  const ext = externals || {};
  const bars = [];
  bars.push({ id: 'pool', pass: ctl.meetings >= 10 && arm.meetings >= 10,
    detail: 'pool floor: ctl ' + ctl.meetings + ', arm ' + arm.meetings + ' fought expedition w4+ meetings (floor 10 each)' });
  bars.push({ id: 'primary', pass: arm.kills >= 2,
    detail: 'armed wave-4 vKills: ' + arm.kills + ' across the band (bar >= 2; ctl ' + ctl.kills + ')' });
  bars.push({ id: 'floor-within-1rd', pass: arm.floorWithinOneRoundN === 0,
    detail: 'floor-flees with the monster within one round of death: arm ' + arm.floorWithinOneRoundN + ' (bar 0; ctl ' + ctl.floorWithinOneRoundN + (ctl.floorWithinOneRoundN === 0 ? ' — VACUOUS, baseline pool is 0' : '') + ')' });
  bars.push({ id: 'vDie', pass: arm.vDie <= ctl.vDie + 1,
    detail: 'villager combat deaths (vDie meetings): arm ' + arm.vDie + ' vs ctl ' + ctl.vDie + ' (bar arm <= ctl + 1)' });
  bars.push({ id: 'starvation', pass: arm.starvation <= ctl.starvation + 2 && arm.starvationVillager <= ctl.starvationVillager + 2,
    detail: 'starvation deaths: arm ' + arm.starvation + ' total / ' + arm.starvationVillager +
      ' villager vs ctl ' + ctl.starvation + ' / ' + ctl.starvationVillager + ' (bar arm <= ctl + 2)' });
  bars.push({ id: 'survival', pass: arm.medianDays != null && ctl.medianDays != null && arm.medianDays >= 0.8 * ctl.medianDays,
    detail: 'median survival: arm ' + arm.medianDays + 'd vs ctl ' + ctl.medianDays + 'd (bar arm >= 0.8x ctl)' });
  const missingExt = ['selftest', 'determinism', 'proof'].filter(function (k) { return !ext[k]; });
  const sameFieldSha = Object.keys(ctl.fieldShas).length === 1 && Object.keys(arm.fieldShas).length === 1 &&
    Object.keys(ctl.fieldShas)[0] === Object.keys(arm.fieldShas)[0];
  const instrOk = ctl.parseErrors.length === 0 && arm.parseErrors.length === 0 &&
    ctl.instrumentErrors === 0 && arm.instrumentErrors === 0 && missingExt.length === 0 && sameFieldSha;
  bars.push({ id: 'instrument', pass: instrOk,
    detail: 'instrument health: ctl parse errors ' + ctl.parseErrors.length +
      ' / arm ' + arm.parseErrors.length + '; leg instrument errors ctl ' + ctl.instrumentErrors +
      ' / arm ' + arm.instrumentErrors + '; fieldSha ' + (sameFieldSha ? 'same across legs' : 'MISMATCH: ctl ' + JSON.stringify(ctl.fieldShas) + ' arm ' + JSON.stringify(arm.fieldShas)) +
      (missingExt.length ? ('; external checks not supplied: ' + missingExt.join(', ')) : '; selftest green; determinism byte-identical; proof test green') });
  let verdict = 'GO', kind = '';
  if (!bars.every(function (b) { return b.pass; })) {
    verdict = 'NO-GO';
    kind = bars.filter(function (b) { return !b.pass; }).map(function (b) { return b.id; }).join('+');
  }
  return { verdict: verdict, kind: kind, bars: bars };
}

function runAnalysis(opts) {
  const ctl = analyzeLeg(opts.ctl);
  const arm = analyzeLeg(opts.arm);
  const j = judge(ctl, arm, opts.externals);
  const pick = function (leg) {
    return { dir: leg.dir, seedsN: leg.seedsN, meetings: leg.meetings, kills: leg.kills,
      killShare: leg.killShare, vFlee: leg.vFlee, vDie: leg.vDie,
      variants: leg.variants, hopelessN: leg.hopelessN, floorN: leg.floorN,
      withinOneRoundN: leg.withinOneRoundN, withinOneRoundShare: leg.withinOneRoundShare,
      floorWithinOneRoundN: leg.floorWithinOneRoundN,
      floorFinishHolds: leg.floorFinishHolds, heldFights: leg.heldFights, heldDamage: leg.heldDamage,
      starvation: leg.starvation, starvationVillager: leg.starvationVillager,
      medianDays: leg.medianDays, national: leg.national, seedWins: leg.seedWins,
      wave4: leg.wave4, wave5: leg.wave5, communityLost: leg.communityLost,
      scaleRanks: leg.scaleRanks, instrumentErrors: leg.instrumentErrors,
      parseErrors: leg.parseErrors,
      seedRows: leg.seedRows,
      table: leg.fledRows.map(function (r) {
        return { seed: r.seed, day: r.day, mid: r.mid, rounds: r.rounds,
          mHpRemaining: r.mHpLeft, dpr: r.dpr, withinOneRound: r.withinOneRound,
          fleeHpFrac: r.fleeHpFrac, variant: r.variant,
          fleeHopelessFlag: r.fleeHopelessFlag, floorFinishHold: r.floorFinishHold,
          vTaken: r.vTaken, classified: r.classified }; }),
      died: leg.diedRows.map(function (r) { return { seed: r.seed, day: r.day, mid: r.mid, rounds: r.rounds, mHpRemaining: r.mHpLeft, dpr: r.dpr, vTaken: r.vTaken }; }),
      killed: leg.killedRows.map(function (r) { return { seed: r.seed, day: r.day, mid: r.mid, rounds: r.rounds, mDealt: r.mDealt, floorFinishHold: r.floorFinishHold }; }),
      held: leg.rows.filter(function (r) { return (r.floorFinishHold | 0) > 0; }).map(function (r) {
        return { seed: r.seed, day: r.day, mid: r.mid, rounds: r.rounds, outcome: r.outcome,
          mDealt: r.mDealt, floorFinishHold: r.floorFinishHold }; }) };
  };
  return { verdict: j.verdict, kind: j.kind, bars: j.bars, ctl: pick(ctl), arm: pick(arm) };
}

// ---------- selftest ----------
function selftest() {
  let pass = 0, fail = 0;
  function ck(name, cond, extra) {
    if (cond) { pass++; console.log('PASS ' + name); }
    else { fail++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // Classifier: line-based cases (fleecall) + door-floor fallback.
  ck('selftest classify: "past holding" line -> floor',
    classifyVariant({ outcome: 'vFlee', fleeHpFrac: 0.1, fleeHopeless: false, fleeLearn: false, log: ['X is past holding — they run while running still works.'] }) === 'floor');
  ck('selftest classify: "sees how this ends" line -> hopeless',
    classifyVariant({ outcome: 'vFlee', fleeHpFrac: 0.4, fleeHopeless: true, fleeLearn: false, log: ['X sees how this ends — and runs while running still works.'] }) === 'hopeless');
  ck('selftest classify: "has seen enough" line -> learn',
    classifyVariant({ outcome: 'vFlee', fleeHpFrac: 0.5, fleeHopeless: false, fleeLearn: true, log: ['X has seen enough — withdraws to report back. (Learn-first: not winnable, not worth the blood.)'] }) === 'learn');
  ck('selftest classify: committed-finish line -> committed-floor',
    classifyVariant({ outcome: 'vFlee', fleeHpFrac: 0.35, fleeHopeless: false, fleeLearn: false, log: ['X is past holding even a finished fight — they run while running still works. (Committed-finish floor)'] }) === 'committed-floor');
  ck('selftest classify: door floor flee (no line, fleeHpFrac set, flags false) -> floor',
    classifyVariant({ outcome: 'vFlee', fleeHpFrac: 0.21, fleeHopeless: false, fleeLearn: false, log: ['R1: X strikes for 40 (40 left)', 'R1: The Herald hits X for 15 (15 left)'] }) === 'floor');
  ck('selftest classify: door floor flee with fleeHopeless true (floor branch sets it) -> floor',
    classifyVariant({ outcome: 'vFlee', fleeHpFrac: 0.21, fleeHopeless: true, fleeLearn: false, log: ['R1: X strikes for 40 (40 left)'] }) === 'floor');
  ck('selftest classify: vDie is not classified as a flee',
    classifyVariant({ outcome: 'vDie', fleeHpFrac: null, fleeHopeless: false, fleeLearn: false, log: [] }) === 'other');
  ck('selftest classify: empty log + no fleeHpFrac -> other (never a silent floor)',
    classifyVariant({ outcome: 'vFlee', fleeHpFrac: null, fleeHopeless: false, fleeLearn: false, log: [] }) === 'other');
  // Within-one-round arithmetic.
  function within1(mHpLeft, mDealt, rounds) {
    const dpr = rounds ? mDealt / rounds : 0;
    return (mHpLeft != null && dpr > 0 && mHpLeft <= dpr);
  }
  ck('selftest within1: 58 HP left at 92.5 dpr -> true (the telling fight)',
    within1(58, 1387, 15) === true);
  ck('selftest within1: 963 HP left at 50 dpr -> false',
    within1(963, 500, 10) === false);
  ck('selftest within1: dpr 0 never within one round',
    within1(5, 0, 3) === false);
  ck('selftest within1: exactly one round of damage left -> true',
    within1(50, 150, 3) === true);
  // Median.
  ck('selftest median even', median([150, 150, 150, 126, 117, 150, 150, 114]) === 150);
  ck('selftest median odd', median([100, 140, 150]) === 140);
  // Judge: all bars pass on a synthetic GO pair; each bar fails alone.
  function leg(o) {
    return Object.assign({ meetings: 12, kills: 0, vFlee: 10, vDie: 3, variants: { hopeless: 5, floor: 5, learn: 0, 'committed-floor': 0, other: 0 },
      hopelessN: 5, floorN: 5, withinOneRoundN: 1, withinOneRoundShare: 0.1, floorWithinOneRoundN: 0,
      floorFinishHolds: 0, heldFights: 0, heldDamage: 0, starvation: 0, starvationVillager: 0,
      medianDays: 150, national: 0, seedWins: 0, wave4: 8, wave5: 5, communityLost: 3,
      fieldShas: { abc: 8 }, parseErrors: [], instrumentErrors: 0 }, o || {});
  }
  const goCtl = leg({}), goArm = leg({ kills: 2, floorFinishHolds: 3, heldFights: 2, heldDamage: 400 });
  ck('selftest judge: synthetic GO pair passes',
    judge(goCtl, goArm, { selftest: true, determinism: true, proof: true }).verdict === 'GO');
  ck('selftest judge: primary fails when arm kills < 2',
    judge(goCtl, leg({ kills: 1 }), { selftest: true, determinism: true, proof: true }).kind.indexOf('primary') !== -1);
  ck('selftest judge: floor-within-1rd fails when arm has one',
    judge(goCtl, leg({ kills: 2, floorWithinOneRoundN: 1 }), { selftest: true, determinism: true, proof: true }).kind.indexOf('floor-within-1rd') !== -1);
  ck('selftest judge: vDie cost fails when arm exceeds ctl+1',
    judge(goCtl, leg({ kills: 2, vDie: 5 }), { selftest: true, determinism: true, proof: true }).kind.indexOf('vDie') !== -1);
  ck('selftest judge: instrument fails without externals',
    judge(goCtl, goArm, {}).kind.indexOf('instrument') !== -1);
  ck('selftest judge: instrument fails on fieldSha mismatch',
    judge(goCtl, leg({ kills: 2, fieldShas: { xyz: 8 } }), { selftest: true, determinism: true, proof: true }).kind.indexOf('instrument') !== -1);
  console.log('\nselftest: ' + pass + ' passed, ' + fail + ' failed.');
  return fail === 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  let ctl = DEFAULT_CTL, arm = DEFAULT_ARM, out = null, externals = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ctl') ctl = args[++i];
    else if (args[i] === '--arm') arm = args[++i];
    else if (args[i] === '--out') out = args[++i];
    else if (args[i] === '--external') {
      args[++i].split(',').forEach(function (k) { externals[k.trim()] = true; });
    }
  }
  const result = runAnalysis({ ctl: ctl, arm: arm, externals: externals });
  const text = JSON.stringify(result, null, 2);
  if (out) fs.writeFileSync(out, text + '\n');
  else console.log(text);
  console.log('VERDICT ' + result.verdict + (result.kind ? ' (' + result.kind + ')' : ''));
  result.bars.forEach(function (b) { console.log((b.pass ? 'PASS ' : 'FAIL ') + b.id + ': ' + b.detail); });
}

if (require.main === module) main();
module.exports = { analyzeLeg: analyzeLeg, judge: judge, runAnalysis: runAnalysis, classifyVariant: classifyVariant, selftest: selftest };
