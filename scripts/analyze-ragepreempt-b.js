// analyze-ragepreempt-b.js — recorder/analyzer, arm sim-ragepreempt-b.
// Reads the FROZEN rage-setup-a per-seed corpora (band 106001-106008,
// 150d, competent; ctl leg RAGEFREE unset, arm leg RAGEFREE=1) and
// answers finding #2584: how often does a turn verb pre-empt the
// free-action Rage round? For every carrier-fired meeting
// (carrierRage on the encounter row) on the ARM leg, find the Rage
// round (first "(Rage)" log line), then check whether the fighter
// struck that round or a higher-priority turn verb fired instead.
// The verb taxonomy is FROZEN in the prereg (from fieldFights.js:
// the verb chain after fieldAct, in order). Classification is
// complete iff 0 rows are unclassified, 0 rows show both a verb
// and a strike, and 0 arm-leg rows show the consumed signature
// (no strike, no verb — expected ONLY on the control leg, where
// Rage consumes the turn). The CTL leg is the negative
// control: Rage consumes the turn there, so the verb chain never
// runs on the Rage round — 0 pre-emptions expected; anything else
// is a STOP, not a verdict. This arm changes no game code: it reads
// frozen corpora only.
// Usage:
//   node scripts/analyze-ragepreempt-b.js --ctl evidence/2026-11-18/perseed-rage-setup-a-ctl --arm evidence/2026-11-18/perseed-rage-setup-a-arm [--out evidence/2026-11-19/ragepreempt-b-analysis.json] [--prior-analysis evidence/2026-11-18/rage-setup-a-analysis.json]
//   node scripts/analyze-ragepreempt-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// FROZEN verb taxonomy (prereg) — exact log signatures from
// fieldFights.js, in chain order. peacemaker splits: success ends
// the fight (benign), failure leaves the fighter exposed (harmful).
var VERBS = [
  { id: 'field_medicine', sig: 'binds the wound — field medicine, +' },
  { id: 'patient_aim', sig: '(Take Aim — next shot 2.5x)' },
  { id: 'freeze_tag', sig: '(Freeze Tag: rooted 2 rounds)' },
  { id: 'hogtie', sig: '(Hogtie)' },
  { id: 'shoulder_check', sig: '(Shoulder Check)' },
  { id: 'come_get_some', sig: '(Come Get Some)' },
  { id: 'intimidating_presence', sig: '(Stare Down —' },
  { id: 'peacemaker_failed', sig: '(Walk In — failed)' },
  { id: 'peacemaker_success', sig: '(Peacemaker: Walk In)' },
  { id: 'brawler_instinct', sig: "(Brawler's Instinct: +2 speed)" },
];

var RAGE_RE = /^R(\d+): (.+?)'s eyes go red\. Next 3 strikes hit twice as hard\. \(Rage\)/;

// Classify ONE carrier-fired encounter row. Returns:
//   { status, round, name, verb, strikeDmg, ... }
// status: 'not_preempted' | 'preempted' | 'strike_zero' |
//   'rage_round_unobserved' | 'unclassified' |
//   'anomaly_both' (verb AND strike) | 'anomaly_multi_verb'.
function classifyRow(seed, e) {
  var log = e.log || [];
  var rageIdx = -1, round = null, name = null;
  for (var i = 0; i < log.length; i++) {
    var m = RAGE_RE.exec(log[i]);
    if (m) { rageIdx = i; round = parseInt(m[1], 10); name = m[2]; break; }
  }
  if (rageIdx < 0) {
    return { status: 'rage_round_unobserved', seed: seed, day: e.day, vid: e.vid, mid: e.mid, outcome: e.outcome, rounds: e.rounds, mDealt: e.mDealt };
  }
  var prefix = 'R' + round + ': ';
  var strikeRe = new RegExp('^R' + round + ': ' + escRe(name) + ' strikes for (\\d+)');
  var strikeDmg = null, verbs = [];
  for (var j = rageIdx + 1; j < log.length; j++) {
    var line = log[j];
    if (line.indexOf(prefix) !== 0) continue;
    var sm = strikeRe.exec(line);
    if (sm) { strikeDmg = parseInt(sm[1], 10); continue; }
    for (var v = 0; v < VERBS.length; v++) {
      if (line.indexOf(VERBS[v].sig) !== -1) verbs.push(VERBS[v].id);
    }
  }
  var base = { seed: seed, day: e.day, vid: e.vid, mid: e.mid, outcome: e.outcome, rounds: e.rounds, mDealt: e.mDealt, rageRound: round, name: name };
  if (strikeDmg !== null && verbs.length > 0) {
    base.status = 'anomaly_both'; base.verb = verbs[0]; base.verbs = verbs; base.strikeDmg = strikeDmg; return base;
  }
  if (verbs.length > 1) {
    base.status = 'anomaly_multi_verb'; base.verbs = verbs; return base;
  }
  if (verbs.length === 1) {
    base.status = 'preempted'; base.verb = verbs[0];
    base.harmful = verbs[0] !== 'peacemaker_success';
    return base;
  }
  if (strikeDmg !== null) {
    if (strikeDmg > 0) { base.status = 'not_preempted'; base.strikeDmg = strikeDmg; return base; }
    base.status = 'strike_zero'; base.strikeDmg = 0; return base;
  }
  // No strike and no verb on the Rage round: the turn was consumed
  // by Rage itself. That is the EXPECTED signature on the control
  // leg (Rage returns consumed=true, the verb chain never runs).
  // On the arm leg it must not happen (the chain always ends in a
  // strike) — it counts against classification completeness there.
  base.status = 'consumed'; return base;
}

var RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function wallOf(files) {
  var days = [], national = 0, wave4 = 0, wave5 = 0, wins = 0, lost = 0;
  for (var i = 0; i < files.length; i++) {
    var d = files[i];
    days.push(d.days != null ? d.days : d.gameDays);
    if ((RANK_ORDER[d.scaleRank] || 0) >= 2) national++;
    if ((d.maxWave | 0) >= 4) wave4++;
    if ((d.unlockedWave | 0) >= 5) wave5++;
    if (d.won) wins++;
    if (d.villageLost) lost++;
  }
  return { n: files.length, national: national, table: null, wins: wins, wave4: wave4, wave5: wave5, medianSurvival: median(days), communityLoss: lost };
}

function readLeg(dir, expectRageFree) {
  var names = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  var files = [], errors = 0;
  for (var i = 0; i < names.length; i++) {
    var d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, names[i]), 'utf8')); }
    catch (e) { errors++; continue; }
    if (d.rageFreeOn !== expectRageFree) {
      throw new Error('LEG/FLAG MISMATCH: ' + names[i] + ' rageFreeOn=' + d.rageFreeOn + ' expected ' + expectRageFree + ' — refusing to judge a mislabelled leg');
    }
    if (d.carrierPresent !== true) {
      throw new Error('LEG/FLAG MISMATCH: ' + names[i] + ' carrierPresent!=' + true + ' — the carrier is not on this leg');
    }
    if ((d.instrumentErrors || []).length) errors += d.instrumentErrors.length;
    files.push(d);
  }
  var rows = [];
  for (var f = 0; f < files.length; f++) {
    var enc = files[f].v4encounters || [];
    for (var k = 0; k < enc.length; k++) {
      if (enc[k].carrierRage === true) rows.push(classifyRow(files[f].seed, enc[k]));
    }
  }
  return { dir: dir, n: files.length, errors: errors, wall: wallOf(files), rows: rows };
}

function summarize(rows) {
  var denom = 0, preempted = 0, harmful = 0, byVerb = {}, unobserved = 0, unclassified = 0, anomalies = 0, strikeZero = 0, notPreempted = 0, consumed = 0;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.status === 'rage_round_unobserved') { unobserved++; continue; }
    denom++;
    if (r.status === 'preempted') { preempted++; if (r.harmful) harmful++; byVerb[r.verb] = (byVerb[r.verb] || 0) + 1; }
    else if (r.status === 'not_preempted') notPreempted++;
    else if (r.status === 'strike_zero') strikeZero++;
    else if (r.status === 'consumed') consumed++;
    else if (r.status === 'unclassified') unclassified++;
    else anomalies++;
  }
  return {
    carrierFired: rows.length, observable: denom, unobserved: unobserved,
    preempted: preempted, harmful: harmful, notPreempted: notPreempted,
    strikeZero: strikeZero, consumed: consumed, unclassified: unclassified, anomalies: anomalies,
    byVerb: byVerb,
    rate: denom ? preempted / denom : null,
    harmfulRate: denom ? harmful / denom : null,
  };
}

// Judged-population cut: the rage-setup-a analysis lists its 8 arm /
// 12 ctl carrier rows (pair-inclusive engaged). Match our classified
// rows to those keys; report the rate on that subset beside the
// primary all-carrier rate.
function judgedCut(rows, priorList) {
  if (!priorList) return null;
  var keys = {};
  priorList.forEach(function (r) { keys[r.seed + '|' + r.day + '|' + r.vid + '|' + r.mid] = true; });
  var sub = rows.filter(function (r) { return keys[r.seed + '|' + r.day + '|' + r.vid + '|' + r.mid]; });
  var s = summarize(sub);
  s.expected = priorList.length; s.matched = sub.length;
  return s;
}

function judge(ctlDir, armDir, outFile, priorPath) {
  var ctl = readLeg(ctlDir, false);
  var arm = readLeg(armDir, true);
  var prior = null;
  if (priorPath && fs.existsSync(priorPath)) prior = JSON.parse(fs.readFileSync(priorPath, 'utf8'));
  var a = summarize(arm.rows);
  var c = summarize(ctl.rows);
  var aJudged = prior ? judgedCut(arm.rows, prior.carrierRageArm) : null;
  var cJudged = prior ? judgedCut(ctl.rows, prior.carrierRageCtl) : null;

  // Frozen bars (prereg): pool floor denominator >= 8; classification
  // complete on the arm leg (0 unclassified, 0 anomalies, 0 consumed —
  // a consumed-looking round on the arm leg means the free strike did
  // not happen and no verb fired, which the mechanism model forbids);
  // ctl control: every observable ctl Rage round shows the consumed
  // signature and 0 are pre-empted.
  var bars = [
    { id: 'pool-floor', pass: a.observable >= 8, detail: 'arm observable carrier-fired Rage rounds ' + a.observable + ' (floor 8; measured pool ' + a.carrierFired + ')' },
    { id: 'classification-complete', pass: a.unclassified === 0 && a.anomalies === 0 && a.consumed === 0, detail: 'unclassified ' + a.unclassified + ', anomalies ' + a.anomalies + ', consumed-on-arm ' + a.consumed + ', unobserved ' + a.unobserved },
    { id: 'ctl-negative-control', pass: c.preempted === 0 && c.unclassified === 0 && c.anomalies === 0 && c.consumed === c.observable, detail: 'ctl pre-empted ' + c.preempted + ' / ' + c.observable + ' observable; consumed-signature ' + c.consumed + '/' + c.observable + ' (Rage consumes the turn on ctl)' },
    { id: 'instrument-errors', pass: arm.errors === 0 && ctl.errors === 0, detail: 'instrument errors arm ' + arm.errors + ' / ctl ' + ctl.errors },
  ];
  var allPass = bars.every(function (b) { return b.pass; });
  var verdict = allPass ? 'DIAG-GO' : (a.observable < 8 ? 'DIAG-NO-GO thin-pool' : (c.preempted > 0 ? 'STOP control-failed' : 'DIAG-NO-GO instrument'));

  // Frozen interpretation rule (prereg): harmful rate >= 0.25 names
  // "order the free strike ahead of the verbs"; below it, "accept
  // the rate and document it as a tax". Applies only on DIAG-GO.
  var interpretation = null, namedNextStep = null;
  if (verdict === 'DIAG-GO') {
    if (a.harmfulRate >= 0.25) {
      interpretation = 'harmful pre-emption rate ' + a.harmfulRate.toFixed(3) + ' >= 0.25 — the rage-setup-a paired damage rate (2/2, neither pair pre-empted) does NOT generalise; the free strike is lost often enough to change the expected value of RAGEFREE';
      namedNextStep = 'order the free strike ahead of the verbs (the Rage round strikes before the verb chain is consulted)';
    } else {
      interpretation = 'harmful pre-emption rate ' + a.harmfulRate.toFixed(3) + ' < 0.25 — the rage-setup-a paired damage rate (2/2) stands as the paired result with a known tax';
      namedNextStep = 'accept the rate and document it as a tax on the free-action Rage (do not reorder)';
    }
  }

  var result = {
    verdict: verdict, kind: 'diag-ragepreempt',
    bars: bars,
    arm: { dir: arm.dir, n: arm.n, wall: arm.wall, summary: a, judgedCut: aJudged, rows: arm.rows },
    ctl: { dir: ctl.dir, n: ctl.n, wall: ctl.wall, summary: c, judgedCut: cJudged, rows: ctl.rows },
    interpretation: interpretation, namedNextStep: namedNextStep,
  };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 1) + '\n');
  return result;
}

function check(name, cond, state) {
  state.total++;
  if (cond) { state.passed++; }
  else { state.failed++; console.log('FAIL: ' + name); }
}

function selftest() {
  var state = { total: 0, passed: 0, failed: 0 };
  function row(log, extra) {
    var e = { day: 1, vid: 'v1', mid: 'reunion', outcome: 'vFlee', rounds: 2, mDealt: 10, log: log };
    if (extra) for (var k in extra) e[k] = extra[k];
    return classifyRow(106006, e);
  }
  // 1. Free strike landed: Rage line then fighter strike.
  var r = row(["R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", 'R1: Ana strikes for 32 (x2.0) (500 left)']);
  check('strike landed -> not_preempted', r.status === 'not_preempted' && r.strikeDmg === 32 && r.rageRound === 1, state);
  // 2. Peacemaker failed pre-empts.
  r = row(["R1: Heinrich's eyes go red. Next 3 strikes hit twice as hard. (Rage)", "R1: Heinrich walks in open-handed — and it goes wrong. It doesn't want peace. They're exposed, off-balance. (Walk In — failed)", 'R2: Heinrich strikes for 35 (x2.5) (1268 left)']);
  check('peacemaker failed -> preempted/harmful', r.status === 'preempted' && r.verb === 'peacemaker_failed' && r.harmful === true, state);
  // 3. Field medicine pre-empts.
  r = row(["R1: Kavira's eyes go red. Next 3 strikes hit twice as hard. (Rage) [Kavira — Gardener of the Living Garden]", 'R1: Kavira stops mid-fight and binds the wound — field medicine, +20 HP.']);
  check('field medicine (titled Rage line) -> preempted/harmful', r.status === 'preempted' && r.verb === 'field_medicine' && r.harmful === true && r.name === 'Kavira', state);
  // 4. Peacemaker success is a pre-emption but benign.
  r = row(["R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", 'R1: Ana walks in open-handed, talking — low, steady, unafraid. And impossibly, it listens. It stands down. (Peacemaker: Walk In)']);
  check('peacemaker success -> preempted/benign', r.status === 'preempted' && r.verb === 'peacemaker_success' && r.harmful === false, state);
  // 5. Every other verb in the taxonomy.
  var verbCases = [
    ['patient_aim', 'R1: Ana goes still. Breath slows. The world narrows to the target. (Take Aim — next shot 2.5x)'],
    ['freeze_tag', 'R1: Ana slaps a palm to it and yells "YOU\'RE IT!" — it locks in place, rooted where it stands. (Freeze Tag: rooted 2 rounds)'],
    ['hogtie', "R1: Ana gets the rope around it while it can't fight back — hogtied, three rounds, going nowhere. (Hogtie)"],
    ['shoulder_check', 'R1: Ana puts a shoulder into it and it goes where THEY want — stumbling, off its line. (Shoulder Check)'],
    ['come_get_some', 'R1: Ana makes exactly the right noise — the blind thing lurches toward the sound, toward THEM. (Come Get Some)'],
    ['intimidating_presence', "R1: Ana locks eyes and doesn't look away. It falters — then backs off, disengaging. Smart. (Stare Down — it backed down)"],
    ['brawler_instinct', "R1: Ana reads the fight as it moves — the body tells them what the mouth won't. Quicker from here. (Brawler's Instinct: +2 speed)"],
  ];
  verbCases.forEach(function (vc) {
    var rr = row(["R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", vc[1]]);
    check('verb ' + vc[0] + ' -> preempted', rr.status === 'preempted' && rr.verb === vc[0], state);
  });
  // 6. Strike for 0 (editor CUT / mirage miss) is strike_zero, not a pre-emption.
  r = row(["R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", 'R1: CUT — Ana’s swing hits the cutting-room floor. It never happened.', 'R1: Ana strikes for 0 (bright frame — mirage miss) (500 left)']);
  check('strike 0 -> strike_zero', r.status === 'strike_zero' && r.strikeDmg === 0, state);
  // 7. Ally strike lines do not count as the fighter's strike.
  r = row(["R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", 'R1: Bea strikes for 23 (477 left)', "R1: Ana reads the fight as it moves — the body tells them what the mouth won't. Quicker from here. (Brawler's Instinct: +2 speed)"]);
  check('ally strike ignored, verb wins', r.status === 'preempted' && r.verb === 'brawler_instinct', state);
  // 8. Monster-phase lines on the Rage round do not confuse the classifier.
  r = row(["R1: Assessment hits Ana for 11 (40 left)", "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", 'R1: Ana strikes for 32 (x2.0) (531 left)']);
  check('monster hit line ignored', r.status === 'not_preempted' && r.strikeDmg === 32, state);
  // 9. No Rage line -> unobserved.
  r = row(['R1: Ana strikes for 12 (500 left)']);
  check('no Rage line -> rage_round_unobserved', r.status === 'rage_round_unobserved', state);
  // 10. Rage round with neither strike nor verb: the turn was
  // consumed by Rage itself — the ctl-leg signature (Correction 1).
  r = row(["R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", 'R1: Assessment hits Ana for 11 (40 left)']);
  check('no strike no verb -> consumed', r.status === 'consumed', state);
  // 11. Verb AND strike on the Rage round -> anomaly_both.
  r = row(["R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", "R1: Ana walks in open-handed — and it goes wrong. It doesn't want peace. They're exposed, off-balance. (Walk In — failed)", 'R1: Ana strikes for 10 (x2.0) (500 left)']);
  check('verb + strike -> anomaly_both', r.status === 'anomaly_both', state);
  // 12. Rage on a later round (R3) is found, not assumed R1.
  r = row(['R1: Ana strikes for 12 (500 left)', 'R2: Ana strikes for 14 (486 left)', "R3: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)", 'R3: Ana stops mid-fight and binds the wound — field medicine, +20 HP.']);
  check('Rage round R3 found', r.status === 'preempted' && r.rageRound === 3 && r.verb === 'field_medicine', state);
  // 13. summarize() rates (consumed counted apart from unclassified).
  var s = summarize([
    { status: 'preempted', verb: 'peacemaker_failed', harmful: true },
    { status: 'preempted', verb: 'peacemaker_success', harmful: false },
    { status: 'not_preempted' }, { status: 'not_preempted' }, { status: 'strike_zero' },
    { status: 'consumed' },
    { status: 'rage_round_unobserved' }, { status: 'unclassified' },
  ]);
  check('summarize rates', s.carrierFired === 8 && s.observable === 7 && s.preempted === 2 && s.harmful === 1 && Math.abs(s.rate - 2 / 7) < 1e-9 && Math.abs(s.harmfulRate - 1 / 7) < 1e-9 && s.byVerb.peacemaker_failed === 1 && s.unclassified === 1 && s.unobserved === 1 && s.strikeZero === 1 && s.consumed === 1, state);
  // 14. wall(): national threshold + medians.
  var w = wallOf([
    { days: 150, scaleRank: 'regional', maxWave: 5, unlockedWave: 5, won: false, villageLost: false },
    { days: 100, scaleRank: 'national', maxWave: 4, unlockedWave: 4, won: true, villageLost: true },
  ]);
  check('wall counts', w.national === 1 && w.wave4 === 2 && w.wave5 === 1 && w.wins === 1 && w.medianSurvival === 125 && w.communityLoss === 1, state);
  console.log('analyze-ragepreempt-b --selftest: ' + state.passed + ' passed, ' + state.failed + ' failed');
  if (state.failed) process.exit(1);
}

var args = process.argv.slice(2);
if (args.indexOf('--selftest') !== -1) { selftest(); return; }
function argVal(flag, def) {
  var i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}
var ctlDir = argVal('--ctl', null);
var armDir = argVal('--arm', null);
var outFile = argVal('--out', null);
var priorPath = argVal('--prior-analysis', 'evidence/2026-11-18/rage-setup-a-analysis.json');
if (!ctlDir || !armDir) { console.error('usage: analyze-ragepreempt-b.js --ctl DIR --arm DIR [--out FILE] [--prior-analysis FILE] | --selftest'); process.exit(2); }
var result = judge(ctlDir, armDir, outFile, priorPath);
console.log(JSON.stringify({ verdict: result.verdict, arm: result.arm.summary, ctl: result.ctl.summary, interpretation: result.interpretation, namedNextStep: result.namedNextStep }, null, 1));
if (result.verdict !== 'DIAG-GO') process.exit(1);
