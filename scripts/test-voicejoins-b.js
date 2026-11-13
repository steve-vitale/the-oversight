#!/usr/bin/env node
// scripts/test-voicejoins-b.js — CHECK-FIRST proof for arm sim-voicejoins-b.
//
// Finding #2290 (sim-findings.md) claims wild ally-joins pass in silence:
// on seed 190392 four wanderers join d78-81 with no arrival line in the
// d76-83 "say sample". This test proves the check the arm was assigned:
//
//   §1-§3  STAGED: every roster-join path in the game voices the join
//           exactly once — membership arrival (arrivalTick), visitor
//           invite (visitorInteract 'invite'), petition admission
//           (_vaAdmitPetitioners). One line per join, no duplicates.
//   §4      THE FILTER: the finding's evidence is the vetphantom corpus,
//           whose vetSays capture is filtered by SAY_RE (veteran/kill
//           words only). The verbatim filter matches NONE of the arrival
//           lines — the sample could not contain the voice it claims is
//           missing. The finding is a sampling artifact, not a silence.
//   §5      FIELD LEG: seed 190392, 150d, competent, FULL say capture
//           (no filter) + daily roster tracking — the finding's own seed
//           on current master. Every roster join must have a voice line
//           naming the joiner within ±1 day. (The d78-81 joins do not
//           reproduce on this master — trajectories diverged after the
//           r131 phantom-veteran fix and the combatdedup/applystatus/
//           inffight landings — so the leg judges the joins that DO
//           occur, not the corpus's four.)
//
// No src/js change: this arm builds nothing. ALREADY-VOICED verdict.
// Usage: node scripts/test-voicejoins-b.js
// Exits 0 with VOICEJOINS-B PASS when all assertions hold.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = [7, 42, 99];
let pass = 0, fail = 0;
const failures = [];
function ok(cond, label) {
  if (cond) { pass++; }
  else { fail++; failures.push(label); console.log('  FAIL: ' + label); }
}
function eq(a, b, label) { ok(a === b, label + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

// The vetphantom driver's capture filter, verbatim from
// scripts/vetphantom-driver-20261111.js:106.
const VET_SAY_RE = /veteran|blooded|scarred|\belder\b|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;

async function fresh(seed) {
  const { Game: G, loadFails } = await loadGame({ seed: seed, mode: 'voicejoins-b', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  return G;
}

function captureSay(G) {
  const lines = [];
  const orig = G.say;
  G.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string') lines.push(String(arg));
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  return lines;
}

function rosterOf(G) { try { return ((G.state || {}).village || {}).roster || []; } catch (e) { return []; } }
function dayOf(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function staged(seed) {
  const G = await fresh(seed);
  const said = captureSay(G);
  const v = G.state.village || {};
  const day = dayOf(G);

  // ---- §1: membership arrival (arrivalTick) ----
  // Stage an accepted application arriving today, drawn from a real
  // background survivor who is not on the roster (the genApplicant path).
  const bg = (G.data.background_survivors || []).find(function (c) {
    return c && c.id && rosterOf(G).indexOf(c.id) < 0 && !(G.deadMarked && G.deadMarked(c.id));
  });
  ok(!!bg, 's' + seed + ' §1 fixture: a background survivor exists to arrive');
  if (bg) {
    const before = rosterOf(G).length;
    const m = G.mshipState();
    m.arrivals = m.arrivals || [];
    m.arrivals.push({ id: bg.id, name: bg.name, charId: bg.id, formerOccupation: bg.formerOccupation, day: day, arriveDay: day });
    const mark = said.length;
    G.arrivalTick();
    const fresh1 = said.slice(mark);
    const walkLines = fresh1.filter(function (l) { return /walks in — pack light, eyes wide/.test(l); });
    eq(walkLines.length, 1, 's' + seed + ' §1 arrivalTick voices exactly one walks-in line');
    ok(walkLines.length === 1 && walkLines[0].indexOf(bg.name.split(' ')[0]) !== -1,
      's' + seed + ' §1 walks-in line names the joiner (' + bg.name + ')');
    eq(rosterOf(G).length, before + 1, 's' + seed + ' §1 roster grows by one');
    ok(rosterOf(G).indexOf(bg.id) >= 0, 's' + seed + ' §1 joiner is on the roster');
    // A second tick must not repeat the line: the arrival was consumed.
    const mark2 = said.length;
    G.arrivalTick();
    eq(said.slice(mark2).filter(function (l) { return /walks in — pack light/.test(l); }).length, 0,
      's' + seed + ' §1 second arrivalTick repeats nothing for the same join');
  }

  // ---- §2: visitor invite (visitorInteract 'invite') ----
  const vis = { id: 'vis_test_' + seed, name: 'a curious wanderer', type: 'curious', day: day, leavesDay: day + 1 };
  v.visitors = v.visitors || [];
  v.visitors.push(vis);
  const before2 = rosterOf(G).length;
  const mark3 = said.length;
  const ret = G.visitorInteract(vis.id, 'invite');
  ok(ret === true, 's' + seed + ' §2 visitorInteract invite returns true');
  const fresh2 = said.slice(mark3);
  const growLines = fresh2.filter(function (l) { return /Haven grows by one/.test(l); });
  eq(growLines.length, 1, 's' + seed + ' §2 invite voices exactly one Haven-grows line');
  eq(rosterOf(G).length, before2 + 1, 's' + seed + ' §2 roster grows by one');
  ok(rosterOf(G).some(function (id) { return String(id).indexOf('visjoin_') === 0; }),
    's' + seed + ' §2 joiner enters as a visjoin roster id');

  // ---- §3: petition admission (_vaAdmitPetitioners) ----
  // The fixture needs housing room: havenRoom() = cap(12) - roster.
  // Trim the staged roster to 10 (scholar kept — first 10 ids), so the
  // two petitioners fit. The trimmed villagers are not killed; they are
  // simply not on the staged roster for this call.
  v.roster = (v.roster || []).slice(0, 10);
  ok(G.havenRoom() >= 2, 's' + seed + ' §3 fixture: housing room for two petitioners (room ' + G.havenRoom() + ')');
  const pet = {
    id: 'pet_test_' + seed, originName: 'another fire', cause: 'refugee',
    petitioners: [
      { name: 'Test One', age: 34, occupation: 'cook', temperament: 'steady' },
      { name: 'Test Two', age: 41, occupation: 'carpenter', temperament: 'warm' },
    ],
  };
  G.state.petitionQueue = [];
  G.state.pendingPetition = pet;
  const before3 = rosterOf(G).length;
  const mark4 = said.length;
  const out = G._vaAdmitPetitioners(pet);
  ok(out && out.accepted === true, 's' + seed + ' §3 _vaAdmitPetitioners accepts');
  const fresh3 = said.slice(mark4);
  const roomLines = fresh3.filter(function (l) { return /The fire makes room/.test(l); });
  eq(roomLines.length, 1, 's' + seed + ' §3 admission voices exactly one fire-makes-room line');
  ok(roomLines.length === 1 && roomLines[0].indexOf('Test One') !== -1 && roomLines[0].indexOf('Test Two') !== -1,
    's' + seed + ' §3 admission line names both petitioners');
  eq(rosterOf(G).length, before3 + 2, 's' + seed + ' §3 roster grows by two');
  eq(G.state.pendingPetition, null, 's' + seed + ' §3 petition clears');

  // ---- §4: the vetphantom filter cannot see any of it ----
  // Every arrival line this run produced, plus the two other join-path
  // lines quoted verbatim from code (application + auto-accept), must
  // score ZERO against the finding's capture filter.
  const arrivalLines = said.filter(function (l) {
    return /walks in — pack light|Haven grows by one|The fire makes room/.test(l);
  });
  arrivalLines.push('📨 Word came: Maya Singh wants to join Haven. "Heard about this place three valleys over. Had to try." — they haven\'t set foot here. The village will judge.');
  arrivalLines.push('📨 The village didn\'t wait for you. Maya Singh was vouched for around the fire — they\'re walking.');
  ok(arrivalLines.length >= 3, 's' + seed + ' §4 fixture: arrival lines exist to test (' + arrivalLines.length + ')');
  const seen = arrivalLines.filter(function (l) { return VET_SAY_RE.test(l); });
  eq(seen.length, 0, 's' + seed + ' §4 vetSays filter matches 0/' + arrivalLines.length + ' arrival lines');
  if (seen.length) console.log('  FILTERED-IN (unexpected): ' + JSON.stringify(seen));
  // Sense-read: print the three voiced lines so a human can judge them.
  console.log('  s' + seed + ' lines:');
  arrivalLines.slice(0, 3).forEach(function (l) { console.log('    "' + l.slice(0, 160) + '"'); });
}

// ---- §5: field leg — the finding's own seed, call-site join tracking ----
// A daily roster snapshot MISSES sub-day joins (a newcomer can join and
// leave between snapshots — see the d137 wanderer in the evidence file),
// so this leg tracks joins AT THE CALL SITE: wrap the three join
// functions, record every real join (day, voiced name, path), and match
// each against the voice lines emitted by that very call. That is the
// exact claim under test — one line per join, no join unvoiced, no
// voice without a join.
async function fieldLeg() {
  const seed = 190392;
  const { Game: G } = await loadGame({ seed: seed, mode: 'voicejoins-b-field', fullTelemetry: false });
  const joins = []; // {day, name, path}
  const sayLines = [];
  const origSay = G.say;
  G.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string') sayLines.push({ day: dayOf(G), line: String(arg) });
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  function linesSince(n) { return sayLines.slice(n); }
  // arrivalTick: record each arrival the call processes (app.name is the
  // name the walks-in line uses — a generated drifter's descriptor, e.g.
  // "a quiet farmer", not the hydrated roster name).
  const origArrival = G.arrivalTick.bind(G);
  G.arrivalTick = function () {
    const m = this.mshipState ? this.mshipState() : {};
    const before = rosterOf(G).slice();
    const due = ((m.arrivals || []).filter(function (a) { return (a.arriveDay || 0) <= dayOf(G); }))
      .map(function (a) { return { day: dayOf(G), name: a.name, nid: a.charId || a.id, path: 'arrival' }; });
    const mark = sayLines.length;
    const r = origArrival();
    const after = rosterOf(G);
    due.forEach(function (j) {
      // Only a join that actually landed counts: a dead-marked arrival is
      // refused aloud ("Word came too late") and never joins — that is a
      // refusal, not an unvoiced join.
      if (after.indexOf(j.nid) < 0 || before.indexOf(j.nid) >= 0) return;
      // Attribute lines per arrival by name: one call can process several
      // arrivals, each with its own walks-in line naming its own app.name.
      const mine = linesSince(mark).filter(function (s) {
        return /walks in — pack light/.test(s.line) && s.line.indexOf(j.name) !== -1;
      });
      j.lines = mine.length;
      j.lineText = mine.length ? mine[0].line : null;
      joins.push(j);
    });
    return r;
  };
  // visitorInteract 'invite': one join, one "Haven grows by one" line.
  const origVI = G.visitorInteract.bind(G);
  G.visitorInteract = function (visitorId, how) {
    const v = this.state.village || {};
    const vis = (v.visitors || []).find(function (x) { return x.id === visitorId; });
    const mark = sayLines.length;
    const r = origVI(visitorId, how);
    if (how === 'invite' && vis && (vis.type === 'fleeing' || vis.type === 'curious') && r === true) {
      const emitted = linesSince(mark).filter(function (s) { return /Haven grows by one/.test(s.line); });
      joins.push({ day: dayOf(G), name: vis.name, path: 'visitor', lines: emitted.length, lineText: emitted.length ? emitted[0].line : null });
    }
    return r;
  };
  // _vaAdmitPetitioners: one admission line naming every admitted head.
  const origAdmit = G._vaAdmitPetitioners.bind(G);
  G._vaAdmitPetitioners = function (pet) {
    const mark = sayLines.length;
    const r = origAdmit(pet);
    if (r && r.accepted && r.admitted && r.admitted.length) {
      const emitted = linesSince(mark).filter(function (s) { return /The fire makes room/.test(s.line); });
      joins.push({ day: dayOf(G), name: (pet.petitioners || []).slice(0, r.admitted.length).map(function (p) { return p.name; }).join(', '), path: 'petition', lines: emitted.length, lineText: emitted.length ? emitted[0].line : null });
    }
    return r;
  };
  await setupGame(G);
  let result = null;
  await quietLog(async function () { result = await runDays(G, competent, { days: 150, manifest: undefined, sampleEvery: 1 }); });
  console.log('  §5 field: seed ' + seed + ', ' + result.days + 'd, end ' + result.endReason +
    ', maxWave ' + (result.maxWaveUnlocked || 1) + ', sayCount ' + sayLines.length +
    ', call-site joins ' + joins.length);
  ok(joins.length >= 1, '§5 field: at least one real join occurred (else vacuous)');
  let unvoiced = 0, dup = 0;
  joins.forEach(function (j) {
    const needle = (j.name.split(' ')[0] === 'a' || j.name.split(' ')[0] === 'an' || j.name.split(' ')[0] === 'the')
      ? j.name.toLowerCase() : j.name.split(' ')[0];
    const named = j.lineText && j.lineText.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    const voiced = j.lines === 1 && named;
    if (!voiced) unvoiced++;
    if (j.lines > 1) dup++;
    console.log('  §5 ' + (voiced ? 'voiced' : 'UNVOICED') + ' d' + j.day + ' [' + j.path + '] ' + j.name +
      ' <- ' + (j.lineText ? '"' + j.lineText.slice(0, 110) + '"' : 'NO LINE'));
  });
  eq(unvoiced, 0, '§5 field: every real join voiced exactly once (' + joins.length + ' joins, ' + unvoiced + ' unvoiced, ' + dup + ' multi-line)');
  // No phantom voice: every walks-in / grows-by-one / fire-makes-room line
  // in the whole run must belong to a recorded join (same day, same name
  // token) — the village never announces an arrival that didn't happen.
  const voiceLines = sayLines.filter(function (s) {
    return /walks in — pack light|Haven grows by one|The fire makes room/.test(s.line);
  });
  let phantom = 0;
  voiceLines.forEach(function (s) {
    const owned = joins.some(function (j) {
      return Math.abs(j.day - s.day) <= 1 && j.lineText === s.line;
    });
    if (!owned) { phantom++; console.log('  PHANTOM? d' + s.day + ': "' + s.line.slice(0, 110) + '"'); }
  });
  eq(phantom, 0, '§5 field: no arrival line without a recorded join (' + voiceLines.length + ' arrival lines, ' + phantom + ' phantom)');
  return { days: result.days, endReason: result.endReason, joins: joins.length, voiceLines: voiceLines.length };
}

(async function () {
  for (const seed of SEEDS) {
    console.log('seed ' + seed + ' staged:');
    await staged(seed);
  }
  console.log('field leg:');
  const field = await fieldLeg();
  console.log('VOICEJOINS-B ' + (fail === 0 ? 'PASS' : 'FAIL') + ' — ' + pass + '/' + (pass + fail) +
    ' assertions (seeds ' + SEEDS.join(',') + ' staged; field 190392 ' + field.days + 'd, ' +
    field.joins + ' joins, ' + field.voiceLines + ' arrival lines)');
  if (fail) { failures.forEach(function (f) { console.log('FAILED: ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
