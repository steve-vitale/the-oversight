// analyze-muster-b.js — analyzer for arm sim-muster-b (Loop B 20261124).
// Reads the sounding-leg per-seed JSONs (evidence/2026-11-24/
// perseed-muster-b/) and the control-leg tbrefuse -v2 corpus, and
// judges the frozen prereg bars B1-B4 (B5, the panel compare, is a
// separate step — scripts/build-muster-b-panels.js + balance-panel.js
// compare). Reuses the titanmuster refusal census (analyzeFile) for
// the have/need read on the sounding leg, so the two legs' refusal
// numbers are produced by the same instrument.
// Usage: node scripts/analyze-muster-b.js [--out evidence/2026-11-24/muster-b-analysis.json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const TM = require('./analyze-titanmuster-b');
const { writeFileFlapSafe } = require('./muster-b-write');

function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const ARM_DIR = path.join(REPO, 'evidence', '2026-11-24', 'perseed-muster-b');
const CTL_DIR = path.join(REPO, 'evidence', '2026-11-24', 'perseed-tbrefuse-b');
const OUT = path.join(REPO, argvVal('--out', 'evidence/2026-11-24/muster-b-analysis.json'));

function loadDir(dir, re) {
  return fs.readdirSync(dir).filter(function (f) { return re.test(f); }).sort()
    .map(function (f) { const fp = path.join(dir, f); return { file: fp, rec: JSON.parse(fs.readFileSync(fp, 'utf8')) }; });
}
function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function starvationDeaths(rec) {
  return (rec.deathEvents || []).filter(function (e) { return e && e.cause === 'starvation'; }).length;
}

function summarizeArm(pair) {
  const rec = pair.rec;
  const s = { seed: rec.seed, run: rec.run || null };
  s.callDay = (rec.callDay != null) ? rec.callDay : null;
  s.callCount = rec.callCount || 0;
  s.lairHeard = !!rec.lairTile;
  // Max judged gate: max over daily trace, attempt snaps, and the
  // driver's own maxGateRow — all three read the same engine rule.
  let best = null;
  function consider(day, g) {
    if (!g || g.gateLiving == null) return;
    if (!best || g.gateLiving > best.gate) {
      best = { day: day, gate: g.gateLiving, ready: !!g.ready,
        allies: g.livingAllies, haven: g.validHaven,
        rawAllies: g.rawAllies, rawHaven: g.rawHaven, gateRaw: g.gateRaw };
    }
  }
  (rec.dailyTrace || []).forEach(function (r) { consider(r.day, r.gate); });
  (rec.attemptGateSnaps || []).forEach(function (a) { consider(a.day, a.gate); });
  if (rec.maxGateRow) consider(rec.maxGateRow.day,
    { gateLiving: rec.maxGateRow.gate, ready: rec.maxGateRow.ready,
      livingAllies: rec.maxGateRow.allies, validHaven: rec.maxGateRow.haven,
      rawAllies: null, rawHaven: null, gateRaw: null });
  s.maxGate = best;
  s.readyEver = !!(best && best.gate >= 10);
  s.traceDays = (rec.dailyTrace || []).length;
  s.attemptCount = rec.attemptCount || 0;
  const heraldAttempts = (rec.attempts || []); // driver already filters to herald-only
  s.heraldAttempts = heraldAttempts.length;
  s.heraldFought = heraldAttempts.filter(function (a) { return a.cls === 'FOUGHT'; }).length;
  s.heraldRefused = heraldAttempts.filter(function (a) { return a.cls === 'REFUSED'; }).length;
  s.musterGateRefusals = heraldAttempts.filter(function (a) { return a.cls === 'REFUSED' && a.reason === 'MUSTER-GATE'; }).length;
  s.heraldMeeting = s.heraldAttempts > 0 || (rec.refusals || []).some(function (r) { return r.mid === 'herald'; })
    || (rec.dailyTrace || []).some(function (r) { return r.heraldPresent; });
  // Gate at each muster-gate refusal (attempt-time proxy, engine rule):
  s.refusalGates = heraldAttempts.filter(function (a) { return a.cls === 'REFUSED' && a.reason === 'MUSTER-GATE'; })
    .map(function (a) { return { day: a.day, allies: a.muster ? a.muster.alliesUnique : null, haven: a.muster ? a.muster.havenUnique : null, need: a.muster ? a.muster.need : null, ready: a.muster ? a.muster.readyProxy : null }; });
  // Refusal have/need census via the shared titanmuster instrument
  // (takes the per-seed FILE path, like the original).
  const tm = TM.analyzeFile(pair.file);
  s.titanRefusals = tm.titanRefusals;
  s.titanClassified = tm.titanClassified;
  s.titanUnclassified = tm.titanUnclassified;
  s.haveDistribution = tm.haveValues.reduce(function (acc, h) { acc[h] = (acc[h] || 0) + 1; return acc; }, {});
  s.maxHave = tm.haveValues.length ? Math.max.apply(null, tm.haveValues) : null;
  s.callSoundings = tm.callSoundings.length;
  s.parseErrors = tm.parseErrors;
  // Wall + cost fields.
  s.won = !!rec.won; s.national = rec.national || 0; s.table = rec.table || 0;
  s.scaleRank = rec.scaleRank || null; s.maxWave = rec.maxWave || null;
  s.gameDays = rec.gameDays || 0; s.endReason = rec.endReason || null;
  s.villageLost = rec.endReason === 'village-lost' || rec.endReason === 'village-dead';
  s.deaths = (rec.deathEvents || []).length;
  s.starvationDeaths = starvationDeaths(rec);
  s.instrumentErrors = (rec.instrumentErrors || []).length;
  s.errorSample = (rec.instrumentErrors || []).slice(0, 3);
  // Leg context (for the sense-test + binding-constraint read).
  s.mustercloseChoices = ((rec.mustercloseCtx || {}).choices || []).length;
  s.mustercloseActions = ((rec.mustercloseCtx || {}).actions || []).length;
  s.mustergapCommits = ((rec.mustergapCtx || {}).commitCalls || []).length;
  s.commitrefreshEpisodes = ((rec.commitrefreshCtx || {}).episodes || []).length;
  return s;
}

function summarizeControl(pair) {
  const rec = pair.rec;
  return { seed: rec.seed, won: !!rec.won, scaleRank: rec.scaleRank || null,
    national: ((rec.scaleRank === 'national' || rec.scaleRank === 'global') ? 1 : 0),
    maxWave: rec.maxWave || null, gameDays: rec.gameDays || 0,
    endReason: rec.endReason || null,
    villageLost: rec.endReason === 'village-lost' || rec.endReason === 'village-dead',
    deaths: (rec.deathEvents || []).length,
    starvationDeaths: starvationDeaths(rec) };
}

function main() {
  const armRecs = loadDir(ARM_DIR, /^muster-b-s\d+-muster-b-muster-b\.json$/);
  const ctlRecs = loadDir(CTL_DIR, /^tbrefuse-b-s\d+-tbrefuse-b-v2\.json$/);
  if (!armRecs.length) throw new Error('no arm per-seed files in ' + ARM_DIR);
  if (ctlRecs.length !== 16) throw new Error('expected 16 control files, found ' + ctlRecs.length);
  const arm = armRecs.map(summarizeArm);
  const ctl = ctlRecs.map(summarizeControl);
  const heraldSeeds = arm.filter(function (s) { return s.heraldMeeting; });
  const calledHerald = heraldSeeds.filter(function (s) { return s.callCount > 0; });
  // Control-leg herald seeds (titanmuster): 109317, 109318, 109319,
  // 109320, 109321, 109325. The sounding leg meets heralds on more
  // seeds (the march itself brings the scholar to the lair), so B2 is
  // reported on BOTH denominators.
  const CTL_HERALD = [109317, 109318, 109319, 109320, 109321, 109325];
  const calledCtlHerald = arm.filter(function (s) { return CTL_HERALD.indexOf(s.seed) >= 0 && s.callCount > 0; });
  const reached = arm.filter(function (s) { return s.readyEver; });
  const out = {
    arm: 'muster-b', prereg: 'evidence/2026-11-24/sim-muster-b-prereg.md',
    seeds: arm.map(function (s) { return s.seed; }).sort(function (a, b) { return a - b; }),
    perSeed: arm,
    control: { seeds: ctl.map(function (s) { return s.seed; }),
      wins: ctl.filter(function (s) { return s.won; }).length,
      national: ctl.reduce(function (t, s) { return t + s.national; }, 0),
      medianGameDays: median(ctl.map(function (s) { return s.gameDays; })),
      villageLost: ctl.filter(function (s) { return s.villageLost; }).length,
      wave5: ctl.filter(function (s) { return s.maxWave >= 5; }).length,
      starvationDeaths: ctl.reduce(function (t, s) { return t + s.starvationDeaths; }, 0),
      totalDeaths: ctl.reduce(function (t, s) { return t + s.deaths; }, 0) },
    sounding: {
      seedsRun: arm.length,
      heraldMeetingSeeds: heraldSeeds.map(function (s) { return s.seed; }),
      calledSeeds: calledHerald.map(function (s) { return s.seed; }),
      calledHeraldCount: calledHerald.length,
      calledCtlHeraldCount: calledCtlHerald.length,
      totalSoundings: arm.reduce(function (t, s) { return t + s.callCount; }, 0),
      reachedSeeds: reached.map(function (s) { return s.seed; }),
      reachedCount: reached.length,
      reachedHeraldCount: reached.filter(function (s) { return s.heraldMeeting; }).length,
      maxGateDistribution: arm.map(function (s) { return s.maxGate ? s.maxGate.gate : null; }).sort(function (a, b) { return (a == null ? -1 : a) - (b == null ? -1 : b); }),
      maxGateBySeed: arm.map(function (s) { return { seed: s.seed, maxGate: s.maxGate ? s.maxGate.gate : null, day: s.maxGate ? s.maxGate.day : null, allies: s.maxGate ? s.maxGate.allies : null, haven: s.maxGate ? s.maxGate.haven : null, herald: s.heraldMeeting }; }),
      maxHave: Math.max.apply(null, arm.map(function (s) { return s.maxHave == null ? -1 : s.maxHave; })),
      musterGateRefusalsAfterSounding: arm.reduce(function (t, s) { return t + s.musterGateRefusals; }, 0),
      wins: arm.filter(function (s) { return s.won; }).length,
      national: arm.reduce(function (t, s) { return t + s.national; }, 0),
      table: arm.reduce(function (t, s) { return t + s.table; }, 0),
      medianGameDays: median(arm.map(function (s) { return s.gameDays; })),
      villageLost: arm.filter(function (s) { return s.villageLost; }).length,
      wave5: arm.filter(function (s) { return s.maxWave >= 5; }).length,
      starvationDeaths: arm.reduce(function (t, s) { return t + s.starvationDeaths; }, 0),
      totalDeaths: arm.reduce(function (t, s) { return t + s.deaths; }, 0),
      instrumentErrorSeeds: arm.filter(function (s) { return s.instrumentErrors > 0; }).map(function (s) { return { seed: s.seed, errors: s.instrumentErrors, sample: s.errorSample }; }),
      unclassifiedRefusals: arm.reduce(function (t, s) { return t + s.titanUnclassified; }, 0),
      parseErrors: arm.reduce(function (t, s) { return t.concat(s.parseErrors.map(function (e) { return { seed: s.seed, e: e }; })); }, []),
    },
  };
  // Frozen bars B1-B4 (B5 is the panel compare, reported separately).
  const b = out.sounding;
  out.bars = {
    B1_instrumentComplete: (arm.length === 16 && b.instrumentErrorSeeds.filter(function (x) { return x.errors > 0; }).length <= 2)
      ? 'PASS' : 'FAIL',
    B2_callSounds: (b.calledHeraldCount >= 3) ? 'PASS' : 'FAIL',
    B3_reachabilityAnswered: (arm.length === 16 && b.maxGateBySeed.every(function (x) { return x.maxGate != null || !x.herald; }))
      ? 'PASS' : 'FAIL',
    B4_costBars: (b.medianGameDays >= 120 && b.villageLost <= 7 && b.starvationDeaths <= 20) ? 'PASS' : 'FAIL',
  };
  out.barsDetail = {
    B1: 'seeds=' + arm.length + '/16, errorSeeds=' + b.instrumentErrorSeeds.length,
    B2: 'called ' + b.calledHeraldCount + '/' + heraldSeeds.length + ' sounding-leg herald seeds; ' + b.calledCtlHeraldCount + '/6 control herald seeds (need >=3)',
    B3: 'reached(>=10) ' + b.reachedCount + '/16 seeds, ' + b.reachedHeraldCount + '/6 herald seeds',
    B4: 'medianGameDays=' + b.medianGameDays + ' (need >=120), villageLost=' + b.villageLost + '/16 (need <=7), starvationDeaths=' + b.starvationDeaths + ' (need <=20)',
  };
  writeFileFlapSafe(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ bars: out.bars, barsDetail: out.barsDetail,
    calledHerald: b.calledHeraldCount + '/6', reached: b.reachedCount + '/16',
    maxGateDistribution: b.maxGateDistribution,
    wall: { wins: b.wins, national: b.national, table: b.table, wave5: b.wave5,
      medianGameDays: b.medianGameDays, villageLost: b.villageLost, starvationDeaths: b.starvationDeaths },
    out: path.relative(REPO, OUT) }, null, 2));
}

if (require.main === module) main();
module.exports = { summarizeArm, summarizeControl, median };
