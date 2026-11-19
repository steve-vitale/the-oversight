// analyze-laterage-b.js — recorder/analyzer, arm sim-laterage-b.
// Reads the FRESH laterage per-seed corpus (band 106111-106008,
// 150d, competent; single diagnostic leg, master substrate) and
// answers: how common is LATE Rage firing, and how much does the
// post-fire verb delay cost in rounds and damage?
//
// Population: wave-4+ field fights whose FULL log contains a Rage
// line ("eyes go red ... (Rage)"). For each: the fire round (first
// Rage line), late fire = fire round >= 2 (dmgshape cut >= 4
// reported beside), and the delay — rounds from firing to the first
// doubled strike landing. The first doubled strike is, by
// mechanism (godpath.js fieldStrike: nextN decrements ONLY on a
// fighter strike; nothing else consumes it — gravity_well does not,
// fieldAct's other branches cannot run while nextN is live in a
// way that spends it), the FIRST fighter strike after the Rage
// line; the (xN.N) note corroborates it. Delay rounds are
// classified by what filled them: trick, turn verb (field-chain
// or godpath), silent (no fighter action line: stunned / fled /
// died / fight ended), or strike_undoubled (anomaly).
//
// CORRECTION to the dmgshape reading: the "holds the line" lines
// ("working the trick, not the damage race" / "they know how this
// one is fought...") carry NO round prefix — they are morale-hold
// lines appended at the round's end, not round actions. They are
// counted per fight as context and NEVER classified as a delay
// cause. A delay round is classified from R-prefixed lines only.
//
// Frozen bars (prereg): pool floor observable Rage fights >= 8;
// taxonomy complete (0 unclassified Rage fights, 0 anomalies);
// dominant delay cause named with counts. Verdict GO iff all
// three hold; NO-GO METRIC-BROKEN iff the floor fails; NO-GO
// instrument iff the taxonomy is incomplete. This is a DIAG arm:
// the numbers ARE the answer — no threshold on the delay value.
// Usage:
//   node scripts/analyze-laterage-b.js --dir evidence/2026-11-19/perseed-laterage-b [--out evidence/2026-11-19/laterage-b-analysis.json]
//   node scripts/analyze-laterage-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

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
function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// FROZEN verb taxonomy — exact log signatures from fieldFights.js
// (field-chain verbs, in chain order) and godpath.js fieldAct
// (godpath turn verbs + free verbs). Peacemaker splits: success
// ends the fight (benign), failure leaves the fighter exposed.
var CHAIN_VERBS = [
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
// Godpath turn verbs: fieldAct consumed=true, the round's action.
var GP_VERBS = [
  { id: 'gp_mending_hands', sig: 'presses the wound and it knits' },
  { id: 'gp_cheese_wheel', sig: 'hurls a homing wheel of cheese' },
  { id: 'gp_static_toss', sig: 'hurls a crackling ball of static' },
  { id: 'gp_retribution', sig: 'the System returns' },
  { id: 'gp_bird_strike', sig: 'whistles up the birds' },
  { id: 'gp_turncoat', sig: 'whispers to the pack' },
  { id: 'gp_pocket_sand', sig: 'flings grit' },
  { id: 'gp_fear_aura', sig: 'goes very still and LOOMS' },
  { id: 'gp_landslide', sig: 'the ground heaves outward' },
  { id: 'gp_pack_hunt', sig: 'whistles once — wings, teeth, claws' },
  { id: 'gp_bribe', sig: 'holds out the food' },
  { id: 'gp_raise_earth', sig: 'slams a palm down and the earth STANDS UP' },
  { id: 'gp_switcheroo', sig: 'Its wind-up hits empty air' },
];
// Godpath FREE verbs: never consume the turn (they ride along, so
// a round with only these and no strike/verb is an anomaly).
var GP_FREE = [
  { id: 'gp_foresight', sig: 'eyes go distant' },
  { id: 'gp_coin_guard', sig: 'three coins of hard light' },
  { id: 'gp_stoke', sig: 'throws calories on the fire' },
  { id: 'gp_gravity_well', sig: 'lands staggered. (Gravity Well)' },
  { id: 'gp_blink', sig: 'is somewhere else, between one heartbeat' },
  { id: 'gp_crowd_moves', sig: 'says one word. "NOW."' },
  { id: 'gp_live_broadcast', sig: 'goes LIVE' },
  { id: 'gp_aegis_link', sig: 'a thread of light runs' },
];
// Trick actions (fieldFights.js trickAct branches). Each costs
// the round (trickAct displaces fieldAct entirely).
var TRICKS = [
  { id: 'trick_shout', sig: 'cups their hands and BELLOWS' },
  { id: 'trick_offer_food', sig: 'it CANNOT resist' },
  { id: 'trick_wait_spool', sig: 'gives the spool nothing' },
  { id: 'trick_wait_redactor', sig: 'goes quiet — no strikes' },
  { id: 'trick_wait_algorithm', sig: 'stands there and takes it soft' },
  { id: 'trick_wait_nielsen', sig: 'does the smallest, dullest thing' },
  { id: 'trick_wait_reunion', sig: 'does something they have never done' },
  { id: 'trick_wait_still', sig: 'stands perfectly still' },
  { id: 'trick_dance', sig: 'dances on the downbeat' },
  { id: 'trick_confess', sig: 'confesses first' },
  { id: 'trick_bore', sig: 'is deliberately boring' },
  { id: 'trick_examine', sig: 'reads the fine print' },
  { id: 'trick_farewell', sig: 'speaks to the face' },
  { id: 'trick_look_away', sig: 'looks away. The break runs' },
  { id: 'trick_meet_demand', sig: 'does the grid' },
  { id: 'trick_leave', sig: 'reads the sterile streets' },
  { id: 'trick_contradict', sig: 'contradicts the narration' },
  { id: 'trick_argue', sig: 'argues theology' },
  { id: 'trick_prone', sig: 'falls PRONE' },
  { id: 'trick_bad_note', sig: 'leans to the memo' },
  { id: 'trick_poison', sig: 'rancid, crawling' },
  { id: 'trick_focus_followers', sig: 'ignores the ring light' },
  { id: 'trick_inefficient', sig: 'is deliberately inefficient' },
  { id: 'trick_continuity', sig: 'does something utterly unexpected' },
  { id: 'trick_offscript', sig: 'goes off-script' },
];

var RAGE_RE = /^R(\d+): (.+?)'s eyes go red\. Next 3 strikes hit twice as hard\. \(Rage\)/;
var HOLD_LINE_RE = /holds the line — /;

// Classify ONE round (r) of a Rage fight for the fighter's action.
// lines: the fight's full log. Returns { cause, detail } where
// cause is one of: strike_doubled | strike_undoubled | <verb id> |
// <trick id> | free_verb_only | silent | unclassified.
function classifyDelayRound(log, name, r) {
  var prefix = 'R' + r + ': ';
  var roundLines = [];
  for (var i = 0; i < log.length; i++) {
    if (log[i].indexOf(prefix) === 0) roundLines.push(log[i]);
  }
  if (roundLines.length === 0) return { cause: 'silent', detail: 'no R' + r + ' lines at all' };
  var strikeRe = new RegExp('^R' + r + ': ' + escRe(name) + ' strikes for (\\d+)(.*)$');
  for (var j = 0; j < roundLines.length; j++) {
    var sm = strikeRe.exec(roundLines[j]);
    if (sm) {
      var note = sm[2] || '';
      if (/\(x\d+\.\d+\)/.test(note)) return { cause: 'strike_doubled', detail: 'strike ' + sm[1] + ' ' + note.trim() };
      return { cause: 'strike_undoubled', detail: 'strike ' + sm[1] + ' with no multiplier note' };
    }
  }
  var groups = [CHAIN_VERBS, GP_VERBS, TRICKS];
  for (var g = 0; g < groups.length; g++) {
    for (var v = 0; v < groups[g].length; v++) {
      for (var k = 0; k < roundLines.length; k++) {
        if (roundLines[k].indexOf(groups[g][v].sig) !== -1) return { cause: groups[g][v].id, detail: groups[g][v].sig };
      }
    }
  }
  for (var f = 0; f < GP_FREE.length; f++) {
    for (var m = 0; m < roundLines.length; m++) {
      if (roundLines[m].indexOf(GP_FREE[f].sig) !== -1) return { cause: 'free_verb_only', detail: 'only free verb ' + GP_FREE[f].id + ' on the round' };
    }
  }
  // A fighter-prefixed line that matches nothing is unclassified;
  // monster/ally lines with no fighter action are silent.
  var fighterLines = roundLines.filter(function (ln) { return ln.indexOf(prefix + name) === 0; });
  if (fighterLines.length) return { cause: 'unclassified', detail: fighterLines.join(' || ').slice(0, 400) };
  return { cause: 'silent', detail: 'only monster/ally lines on R' + r };
}

// Classify ONE encounter row. Population: rows whose log contains
// a Rage line. Returns the full decomposition, or a status row for
// non-Rage / anomalous rows.
function classifyRow(seed, e) {
  var log = e.log || [];
  var base = { seed: seed, day: e.day, vid: e.vid, mid: e.mid, outcome: e.outcome, rounds: e.rounds, mDealt: e.mDealt, rageFiredFlag: !!e.rageFired };
  var rageIdxs = [];
  for (var i = 0; i < log.length; i++) {
    var m = RAGE_RE.exec(log[i]);
    if (m) rageIdxs.push({ idx: i, round: parseInt(m[1], 10), name: m[2] });
  }
  var moraleHolds = 0;
  for (var h = 0; h < log.length; h++) if (HOLD_LINE_RE.test(log[h])) moraleHolds++;
  base.moraleHolds = moraleHolds;
  if (rageIdxs.length === 0) {
    base.status = 'not_a_rage_fight';
    if (e.rageFired) { base.status = 'anomaly_flag_no_line'; }
    return base;
  }
  if (rageIdxs.length > 1) {
    base.status = 'anomaly_multi_fire'; base.rageRounds = rageIdxs.map(function (r) { return r.round; });
    return base;
  }
  var fire = rageIdxs[0];
  base.rageRound = fire.round; base.name = fire.name; base.lateFire = fire.round >= 2; base.lateFire4 = fire.round >= 4;
  if (!e.rageFired) { base.status = 'anomaly_line_no_flag'; return base; }
  // Fire-round sanity: no fighter strike on the fire round (Rage
  // consumed the turn on master substrate — a strike there would be
  // the RAGEFREE free-strike signature, not a master shape).
  var firePrefix = 'R' + fire.round + ': ';
  var fireStrikeRe = new RegExp('^R' + fire.round + ': ' + escRe(fire.name) + ' strikes for (\\d+)');
  for (var j = fire.idx + 1; j < log.length; j++) {
    if (log[j].indexOf(firePrefix) !== 0) continue;
    if (fireStrikeRe.exec(log[j])) { base.status = 'anomaly_strike_on_fire_round'; return base; }
  }
  // First doubled strike: the first fighter strike after the Rage
  // line (mechanism: fieldStrike decrements nextN only there).
  var strikeReAll = new RegExp('^R(\\d+): ' + escRe(fire.name) + ' strikes for (\\d+)(.*)$');
  var postStrikes = [];
  for (var k = fire.idx + 1; k < log.length; k++) {
    var sm2 = strikeReAll.exec(log[k]);
    if (sm2) postStrikes.push({ idx: k, round: parseInt(sm2[1], 10), dmg: parseInt(sm2[2], 10), note: (sm2[3] || '').trim() });
  }
  var doubled = postStrikes.filter(function (s) { return /\(x\d+\.\d+\)/.test(s.note); });
  base.postStrikeCount = postStrikes.length;
  base.doubledLanded = Math.min(3, doubled.length);
  base.doubledNotes = doubled.slice(0, 3).map(function (s) { return s.note; });
  var undoubled = postStrikes.slice(0, 3).filter(function (s) { return !/\(x\d+\.\d+\)/.test(s.note); });
  if (undoubled.length) {
    base.status = 'anomaly_strike_undoubled'; base.undoubled = undoubled; return base;
  }
  // Pre-fire normal strikes (for the foregone estimate's fallback
  // basis): fighter strikes before the Rage line.
  var preStrikes = [];
  for (var p = 0; p < fire.idx; p++) {
    var pm = strikeReAll.exec(log[p]);
    if (pm) preStrikes.push({ round: parseInt(pm[1], 10), dmg: parseInt(pm[2], 10) });
  }
  base.preStrikeDmgs = preStrikes.map(function (s) { return s.dmg; });
  base.zeroDamage = (e.mDealt | 0) === 0;
  base.dmgPerRound = (e.rounds | 0) > 0 ? (e.mDealt | 0) / (e.rounds | 0) : null;
  if (doubled.length) {
    base.firstDoubledRound = doubled[0].round;
    base.firstDoubledDmg = doubled[0].dmg;
    base.delay = doubled[0].round - fire.round;
    base.delayToEnd = null;
  } else {
    base.firstDoubledRound = null; base.firstDoubledDmg = null;
    base.delay = null; base.delayToEnd = (e.rounds | 0) - fire.round;
  }
  // Delay rounds: fire+1 .. firstDoubled-1, or fire+1 .. last round
  // when nothing ever lands.
  var lastDelayRound = doubled.length ? doubled[0].round - 1 : (e.rounds | 0);
  base.delayRounds = [];
  var unclassified = [];
  for (var r = fire.round + 1; r <= lastDelayRound; r++) {
    var c = classifyDelayRound(log, fire.name, r);
    base.delayRounds.push({ round: r, cause: c.cause, detail: c.detail });
    if (c.cause === 'unclassified') unclassified.push(r);
  }
  if (unclassified.length) { base.status = 'unclassified'; base.unclassifiedRounds = unclassified; return base; }
  // A delay round classified strike_doubled cannot happen (the loop
  // stops at the first doubled round); if it does, the loop bound
  // is wrong — surface it, do not silently absorb it.
  var badDoubled = base.delayRounds.filter(function (d) { return d.cause === 'strike_doubled'; });
  if (badDoubled.length) { base.status = 'anomaly_delay_has_doubled'; return base; }
  var badUndoubled = base.delayRounds.filter(function (d) { return d.cause === 'strike_undoubled'; });
  if (badUndoubled.length) { base.status = 'anomaly_delay_has_undoubled'; return base; }
  base.status = 'classified';
  return base;
}

function coarseCause(cause) {
  if (cause.indexOf('trick_') === 0) return 'trick';
  if (cause === 'free_verb_only') return 'free_verb_only';
  return cause;
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

function readCorpus(dir) {
  var names = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  var files = [], errors = 0;
  for (var i = 0; i < names.length; i++) {
    var d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, names[i]), 'utf8')); }
    catch (e) { errors++; continue; }
    if (d.mode !== 'laterage' || d.arm !== 'laterage-b') throw new Error('CORPUS MISMATCH: ' + names[i] + ' is not a laterage-b corpus file (mode=' + d.mode + ', arm=' + d.arm + ')');
    if (d.ragePresent !== true) throw new Error('CORPUS MISMATCH: ' + names[i] + ' ragePresent!=' + true + ' — the Rage mechanism is not on this leg');
    if ((d.instrumentErrors || []).length) errors += d.instrumentErrors.length;
    files.push(d);
  }
  var rows = [];
  for (var f = 0; f < files.length; f++) {
    var enc = files[f].v4encounters || [];
    for (var k = 0; k < enc.length; k++) rows.push(classifyRow(files[f].seed, enc[k]));
  }
  return { dir: dir, n: files.length, errors: errors, wall: wallOf(files), rows: rows };
}

function summarize(rows) {
  var rage = rows.filter(function (r) { return r.status === 'classified' || r.status === 'unclassified' || r.status.indexOf('anomaly') === 0; });
  var classified = rage.filter(function (r) { return r.status === 'classified'; });
  var unclassified = rage.filter(function (r) { return r.status === 'unclassified'; });
  var anomalies = rage.filter(function (r) { return r.status.indexOf('anomaly') === 0; });
  var fireRounds = classified.map(function (r) { return r.rageRound; });
  var late = classified.filter(function (r) { return r.lateFire; });
  var late4 = classified.filter(function (r) { return r.lateFire4; });
  var landed = classified.filter(function (r) { return r.delay != null; });
  var neverLanded = classified.filter(function (r) { return r.delay == null; });
  var delays = landed.map(function (r) { return r.delay; });
  var zeroDmg = classified.filter(function (r) { return r.zeroDamage; });
  // Delay-cause rollup over every delay round of every classified fight.
  var causeCounts = {}, coarseCounts = {};
  classified.forEach(function (r) {
    r.delayRounds.forEach(function (d) {
      causeCounts[d.cause] = (causeCounts[d.cause] || 0) + 1;
      var cc = coarseCause(d.cause);
      coarseCounts[cc] = (coarseCounts[cc] || 0) + 1;
    });
  });
  var dominant = null, dominantN = 0;
  Object.keys(coarseCounts).forEach(function (c) { if (coarseCounts[c] > dominantN) { dominant = c; dominantN = coarseCounts[c]; } });
  var totalDelayRounds = classified.reduce(function (a, r) { return a + r.delayRounds.length; }, 0);
  // Damage/round: late-fire (>= 2) vs R1-fire.
  var lateDpr = late.map(function (r) { return r.dmgPerRound; }).filter(function (x) { return x != null; });
  var r1Dpr = classified.filter(function (r) { return r.rageRound === 1; }).map(function (r) { return r.dmgPerRound; }).filter(function (x) { return x != null; });
  // Doubled strikes landed distribution.
  var landedDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
  classified.forEach(function (r) { landedDist[r.doubledLanded] = (landedDist[r.doubledLanded] || 0) + 1; });
  // Foregone estimate (ESTIMATE, formula in the prereg): per fight,
  // (3 - landed) x mean doubled-strike damage in that fight; when
  // none landed, 2 x mean pre-fire normal strike; when no fighter
  // strike exists at all, the corpus mean doubled-strike damage.
  var corpusDoubledDmgs = [];
  classified.forEach(function (r) {
    if (r.firstDoubledDmg != null) corpusDoubledDmgs.push(r.firstDoubledDmg);
  });
  var corpusMeanDoubled = mean(corpusDoubledDmgs);
  var foregone = 0, foregoneRows = [];
  classified.forEach(function (r) {
    if (r.doubledLanded >= 3) return;
    var basis, unit;
    if (r.doubledLanded > 0) { unit = r.firstDoubledDmg; basis = 'own doubled strike (' + r.firstDoubledDmg + ')'; }
    else if (r.preStrikeDmgs.length) { unit = 2 * mean(r.preStrikeDmgs); basis = '2x own pre-fire mean strike (' + mean(r.preStrikeDmgs).toFixed(1) + ')'; }
    else if (corpusMeanDoubled != null) { unit = corpusMeanDoubled; basis = 'corpus mean doubled strike (' + corpusMeanDoubled.toFixed(1) + ')'; }
    else { unit = null; basis = 'no basis'; }
    if (unit == null) return;
    var f = (3 - r.doubledLanded) * unit;
    foregone += f;
    foregoneRows.push({ seed: r.seed, day: r.day, vid: r.vid, mid: r.mid, rageRound: r.rageRound, doubledLanded: r.doubledLanded, unit: unit, basis: basis, foregone: f });
  });
  return {
    encounters: rows.length,
    rageFights: rage.length, observable: classified.length,
    unclassified: unclassified.length, anomalies: anomalies.length,
    anomalyRows: anomalies, unclassifiedRows: unclassified,
    fireRoundDist: fireRounds.reduce(function (a, r) { a[r] = (a[r] || 0) + 1; return a; }, {}),
    lateFire: late.length, lateFireShare: classified.length ? late.length / classified.length : null,
    lateFire4: late4.length, lateFire4Share: classified.length ? late4.length / classified.length : null,
    meanDelay: mean(delays), medianDelay: median(delays),
    delayDist: delays.reduce(function (a, d) { a[d] = (a[d] || 0) + 1; return a; }, {}),
    neverLanded: neverLanded.length, neverLandedShare: classified.length ? neverLanded.length / classified.length : null,
    meanDelayToEnd: mean(neverLanded.map(function (r) { return r.delayToEnd; })),
    zeroDamage: zeroDmg.length, zeroDamageShare: classified.length ? zeroDmg.length / classified.length : null,
    doubledLandedDist: landedDist,
    causeCounts: causeCounts, coarseCounts: coarseCounts,
    dominantCause: dominant, dominantCauseN: dominantN, totalDelayRounds: totalDelayRounds,
    dmgPerRoundLate: mean(lateDpr), dmgPerRoundR1: mean(r1Dpr),
    foregoneEstimate: foregone, foregoneRows: foregoneRows,
    corpusMeanDoubled: corpusMeanDoubled,
    rows: classified,
  };
}

function judge(dir, outFile) {
  var corpus = readCorpus(dir);
  var s = summarize(corpus.rows);
  var bars = [
    { id: 'pool-floor', pass: s.observable >= 8, detail: 'observable Rage fights ' + s.observable + ' (floor 8; Rage fights in corpus ' + s.rageFights + ' of ' + s.encounters + ' wave-4+ encounters)' },
    { id: 'taxonomy-complete', pass: s.unclassified === 0 && s.anomalies === 0, detail: 'unclassified ' + s.unclassified + ', anomalies ' + s.anomalies },
    { id: 'dominant-cause-named', pass: s.dominantCause != null && s.dominantCauseN > 0, detail: 'dominant delay cause ' + (s.dominantCause || 'none') + ' (' + s.dominantCauseN + ' of ' + s.totalDelayRounds + ' delay rounds)' },
    { id: 'instrument-errors', pass: corpus.errors === 0, detail: 'instrument errors ' + corpus.errors },
  ];
  var allPass = bars.every(function (b) { return b.pass; });
  var verdict = allPass ? 'DIAG-GO' : (s.observable < 8 ? 'DIAG-NO-GO METRIC-BROKEN' : (s.unclassified > 0 || s.anomalies > 0 ? 'DIAG-NO-GO instrument' : 'DIAG-NO-GO'));
  var result = { verdict: verdict, kind: 'diag-laterage', bars: bars, corpus: { dir: corpus.dir, n: corpus.n, wall: corpus.wall }, summary: s };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 1) + '\n');
  return result;
}

function check(name, cond, state) {
  state.total++;
  if (cond) { state.passed++; }
  else { state.failed++; console.log('FAIL: ' + name); }
}

function row(log, extra) {
  var e = { day: 118, vid: 'v1', mid: 'reunion', outcome: 'vFlee', rounds: 9, mDealt: 101, rageFired: true, log: log };
  if (extra) for (var k in extra) e[k] = extra[k];
  return classifyRow(106111, e);
}

function selftest() {
  var state = { total: 0, passed: 0, failed: 0 };
  // 1. R1 fire, strike next round: delay 1, not late.
  var r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R2: Ana strikes for 22 (x2.0) (900 left)',
    'R3: Ana strikes for 20 (x2.0) (880 left)',
  ], { rounds: 3, mDealt: 42 });
  check('R1 fire delay 1', r.status === 'classified' && r.rageRound === 1 && r.lateFire === false && r.delay === 1 && r.doubledLanded === 2 && r.delayRounds.length === 0, state);
  // 2. Fatima shape: fire R4, R5 field medicine, first doubled R6.
  // Morale hold lines (no R-prefix) must NOT count as delay causes.
  r = row([
    'R1: Fatima strikes for 12 (1365 left)',
    'R2: Fatima strikes for 11 (1354 left)',
    "R3: Fatima does something they have never done — stands on one foot and recites a poem mid-fight. The Reunion falters; it has nothing to wear. (Novelty.)",
    "R4: Fatima's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'Fatima holds the line — working the trick, not the damage race.',
    'R5: Fatima stops mid-fight and binds the wound — field medicine, +20 HP.',
    'Fatima holds the line — they know how this one is fought, and have not had their turn to prove it.',
    'R6: Fatima strikes for 22 (x2.0) (1332 left)',
    'R7: Fatima strikes for 22 (x2.0) (1310 left)',
    'R9: Fatima strikes for 26 (x2.0) (1284 left)',
  ], { day: 118, vid: 'fatima', mid: 'reunion', rounds: 9, mDealt: 101 });
  check('Fatima: fire R4 late, delay 2, medicine cause', r.status === 'classified' && r.rageRound === 4 && r.lateFire === true && r.lateFire4 === true && r.delay === 2 && r.doubledLanded === 3 && r.delayRounds.length === 1 && r.delayRounds[0].cause === 'field_medicine' && r.moraleHolds === 2, state);
  // 3. Never lands: fire R2, dies R3, 0 doubled, delay-to-end 1.
  r = row([
    'R1: Ana strikes for 10 (900 left)',
    "R2: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R3: The Algorithm hits Ana for 31 (0 left)',
  ], { outcome: 'vDie', rounds: 3, mDealt: 10 });
  check('never lands: delay null, delayToEnd 1', r.status === 'classified' && r.delay === null && r.delayToEnd === 1 && r.doubledLanded === 0 && r.delayRounds.length === 1 && r.delayRounds[0].cause === 'silent', state);
  // 4. Late fire R5 after trick rounds; trick fills the delay.
  r = row([
    'R1: Ana strikes for 12 (900 left)',
    "R2: Ana cups their hands and BELLOWS — raw noise, no words. (the trick — 1/2)",
    "R3: Ana cups their hands and BELLOWS — raw noise, no words. (the trick — 2/2)",
    "R4: Ana does something they have never done — stands on one foot and recites a poem mid-fight. The Reunion falters; it has nothing to wear. (Novelty.)",
    "R5: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    "R6: Ana cups their hands and BELLOWS — raw noise, no words. (the trick — 1/2)",
    'R7: Ana strikes for 30 (x2.5) (800 left)',
  ], { rounds: 7, mDealt: 72 });
  check('late R5, trick delay, x2.5 counts as doubled', r.status === 'classified' && r.rageRound === 5 && r.lateFire === true && r.delay === 2 && r.delayRounds.length === 1 && r.delayRounds[0].cause === 'trick_shout' && r.doubledLanded === 1 && r.firstDoubledDmg === 30, state);
  // 5. Two Rage lines -> anomaly_multi_fire.
  r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R2: Ana strikes for 20 (x2.0) (880 left)',
    "R5: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
  ]);
  check('multi fire -> anomaly', r.status === 'anomaly_multi_fire', state);
  // 6. Post-fire strike with no multiplier note -> anomaly.
  r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R2: Ana strikes for 11 (889 left)',
  ]);
  check('undoubled post-fire strike -> anomaly', r.status === 'anomaly_strike_undoubled', state);
  // 7. Strike on the fire round -> anomaly (master has no free strike).
  r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R1: Ana strikes for 22 (x2.0) (878 left)',
  ]);
  check('strike on fire round -> anomaly', r.status === 'anomaly_strike_on_fire_round', state);
  // 8. Window spent: 3 doubled, 4th normal, no anomaly.
  r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R2: Ana strikes for 22 (x2.0) (878 left)',
    'R3: Ana strikes for 21 (x2.0) (857 left)',
    'R4: Ana strikes for 24 (x2.0) (833 left)',
    'R5: Ana strikes for 12 (821 left)',
  ], { rounds: 5, mDealt: 79 });
  check('4th strike normal, window spent cleanly', r.status === 'classified' && r.doubledLanded === 3 && r.delay === 1, state);
  // 9. GP verb fills the delay (mending hands).
  r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    "R2: Ana presses the wound and it knits: +15 HP. (Mending Hands)",
    'R3: Ana strikes for 26 (x2.0) (800 left)',
  ], { rounds: 3, mDealt: 26 });
  check('gp mending fills delay', r.status === 'classified' && r.delay === 2 && r.delayRounds.length === 1 && r.delayRounds[0].cause === 'gp_mending_hands', state);
  // 10. Peacemaker-failed fills the delay; peacemaker-success too.
  r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    "R2: Ana walks in open-handed — and it goes wrong. It doesn't want peace. They're exposed, off-balance. (Walk In — failed)",
    'R3: Ana strikes for 28 (x2.0) (800 left)',
  ], { rounds: 3, mDealt: 28 });
  check('peacemaker failed fills delay', r.status === 'classified' && r.delayRounds[0].cause === 'peacemaker_failed', state);
  // 11. Unclassifiable fighter line -> unclassified, never silent.
  r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R2: Ana does a mysterious unlogged thing.',
    'R3: Ana strikes for 28 (x2.0) (800 left)',
  ], { rounds: 3, mDealt: 28 });
  check('unknown fighter line -> unclassified', r.status === 'unclassified', state);
  // 12. Ally strike lines never count as the fighter's strike.
  r = row([
    "R1: Ana's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R2: Bea strikes for 23 (877 left)',
    'R2: Ana strikes for 24 (x2.0) (853 left)',
  ], { rounds: 2, mDealt: 47 });
  check('ally strike ignored, fighter doubled found', r.status === 'classified' && r.delay === 1 && r.firstDoubledDmg === 24, state);
  // 13. No Rage line, flag false -> not_a_rage_fight; flag true -> anomaly.
  r = row(['R1: Ana strikes for 12 (900 left)'], { rageFired: false });
  check('no Rage line -> not_a_rage_fight', r.status === 'not_a_rage_fight', state);
  r = row(['R1: Ana strikes for 12 (900 left)'], { rageFired: true });
  check('flag without line -> anomaly_flag_no_line', r.status === 'anomaly_flag_no_line', state);
  // 14. summarize: rates, shares, dominant cause, foregone estimate.
  var s = summarize([
    { status: 'classified', rageRound: 1, lateFire: false, lateFire4: false, delay: 1, delayToEnd: null, doubledLanded: 3, delayRounds: [], zeroDamage: false, dmgPerRound: 20, firstDoubledDmg: 22, preStrikeDmgs: [12] },
    { status: 'classified', rageRound: 4, lateFire: true, lateFire4: true, delay: 2, delayToEnd: null, doubledLanded: 3, delayRounds: [{ round: 5, cause: 'field_medicine', detail: '' }], zeroDamage: false, dmgPerRound: 11, firstDoubledDmg: 22, preStrikeDmgs: [12, 11] },
    { status: 'classified', rageRound: 2, lateFire: true, lateFire4: false, delay: null, delayToEnd: 1, doubledLanded: 0, delayRounds: [{ round: 3, cause: 'silent', detail: '' }], zeroDamage: true, dmgPerRound: 3.3, firstDoubledDmg: null, preStrikeDmgs: [10] },
    { status: 'unclassified', rageRound: 1, lateFire: false, lateFire4: false, delay: 1, delayToEnd: null, doubledLanded: 1, delayRounds: [], zeroDamage: false, dmgPerRound: 10, firstDoubledDmg: 20, preStrikeDmgs: [] },
    { status: 'not_a_rage_fight' },
  ]);
  check('summarize aggregates', s.rageFights === 4 && s.observable === 3 && s.unclassified === 1 && s.anomalies === 0 && s.lateFire === 2 && Math.abs(s.lateFireShare - 2 / 3) < 1e-9 && Math.abs(s.meanDelay - 1.5) < 1e-9 && s.neverLanded === 1 && s.zeroDamage === 1 && s.dominantCause === 'field_medicine' && s.dominantCauseN === 1 && s.totalDelayRounds === 2 && Math.abs(s.dmgPerRoundLate - (11 + 3.3) / 2) < 1e-9 && Math.abs(s.dmgPerRoundR1 - 20) < 1e-9 && s.foregoneEstimate === 3 * 20 && s.foregoneRows.length === 1, state);
  // 15. wall(): national threshold + medians.
  var w = wallOf([
    { days: 150, scaleRank: 'regional', maxWave: 5, unlockedWave: 5, won: false, villageLost: false },
    { days: 100, scaleRank: 'national', maxWave: 4, unlockedWave: 4, won: true, villageLost: true },
  ]);
  check('wall counts', w.national === 1 && w.wave4 === 2 && w.wave5 === 1 && w.wins === 1 && w.medianSurvival === 125 && w.communityLoss === 1, state);
  console.log('analyze-laterage-b --selftest: ' + state.passed + ' passed, ' + state.failed + ' failed');
  if (state.failed) process.exit(1);
}

var args = process.argv.slice(2);
if (args.indexOf('--selftest') !== -1) { selftest(); return; }
function argVal(flag, def) {
  var i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}
var dir = argVal('--dir', null);
var outFile = argVal('--out', null);
if (!dir) { console.error('usage: analyze-laterage-b.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
var result = judge(dir, outFile);
console.log(JSON.stringify({ verdict: result.verdict, bars: result.bars, summary: { rageFights: result.summary.rageFights, observable: result.summary.observable, lateFire: result.summary.lateFire, lateFireShare: result.summary.lateFireShare, meanDelay: result.summary.meanDelay, neverLanded: result.summary.neverLanded, zeroDamage: result.summary.zeroDamage, dominantCause: result.summary.dominantCause, dominantCauseN: result.summary.dominantCauseN, foregoneEstimate: result.summary.foregoneEstimate } }, null, 1));
if (result.verdict !== 'DIAG-GO') process.exit(1);
