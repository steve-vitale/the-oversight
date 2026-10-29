#!/usr/bin/env node
// scripts/test-hunthold-a.js — sim-hunthold-a analyzer (pure reads).
// Judges the HUNT-holds-through-danger lever against
// evidence/2026-10-29/sim-hunthold-a-prereg.md (binding).
// Inputs: the OFF corpus (HUNTHOLD unset, DEPARTHOLD=1) and
// the ON corpus (HUNTHOLD=1, DEPARTHOLD=1), same seeds, plus
// the departhold-ON corpus for a drift comparison that is
// REPORTED, never scored.
//   node scripts/test-hunthold-a.js --off <dir> --on <dir>
//     [--drift <dir>] [--seeds 75101..75108] [--out <json>]
//     [--sense] [--confirm]
// The --confirm flag switches P2 to the strict bar (ON departed
// strictly greater than OFF departed); without it P2 is the
// pilot bar (ON departed >= OFF departed). Machine legs:
// unknown == 0, unexplained other-held == 0, no recorder
// action 'other' on wave-4 HUNT objectives, hygiene clean,
// wave-lookup coverage complete, determinism (two runs
// byte-identical). Exit 1 unless the verdict is GO; the
// analysis JSON is still written before exiting.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

function parseArgs(argv) {
  const o = {
    off: path.join(REPO, 'evidence', '2026-10-29', 'perseed-hunthold-off'),
    on: path.join(REPO, 'evidence', '2026-10-29', 'perseed-hunthold-on'),
    drift: path.join(REPO, 'evidence', '2026-10-29', 'perseed-departhold-on'),
    seeds: [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108],
    out: null, sense: false, confirm: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--off') o.off = argv[++i];
    else if (a === '--on') o.on = argv[++i];
    else if (a === '--drift') o.drift = argv[++i];
    else if (a === '--seeds') o.seeds = argv[++i].split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--sense') o.sense = true;
    else if (a === '--confirm') o.confirm = true;
  }
  return o;
}

function loadRow(dir, seed) {
  return JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
}

function waveMap() {
  const defs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const m = {};
  for (const d of defs) if (d && d.id) m[d.id] = (d.wave | 0) || null;
  return m;
}

function isW4(waves, mid) { return !!mid && waves[mid] === 4; }

// Dedupe exact duplicate danger records (same verdict, same
// score, adjacent): the lever's pre-check plus the engine's
// identical re-check on delegated evaluations. The first
// record is the verdict either way.
function dedupeDanger(danger) {
  const out = [];
  for (const d of (danger || [])) {
    const prev = out[out.length - 1];
    if (prev && prev.verdict === d.verdict && prev.score === d.score) continue;
    out.push(d);
  }
  return out;
}

// The lever's hold, as recorded: the recorder's 'other-held'
// action (post still 'ready', danger present, no heal sat-out)
// with every danger verdict in {ask, tighten}. The engine
// alone never produces this: on 'go' it departs, on non-'go'
// it overwrites for HUNT, and the heal sat-out path records
// held-ready/heal-sat-out instead.
function heldByLever(ev) {
  if (!ev || ev.action !== 'other-held') return false;
  const dg = dedupeDanger(ev.danger);
  if (!dg.length) return false;
  return dg.every(d => d.verdict === 'ask' || d.verdict === 'tighten');
}

// Evaluations belonging to one pick's objective: same vid, mid
// matches the pick's huntMid (pre-mid for ordinary evaluations,
// post-mid for fresh-pick-in-call evaluations), part >= pick.part.
function evalsForObjective(evals, vid, mid, pickPart) {
  return (evals || []).filter(e => e.vid === vid && e.part >= pickPart
    && ((e.pre && e.pre.huntMid === mid) || (e.freshPickInCall && e.post && e.post.huntMid === mid)));
}

// Departhold taxonomy, verbatim, plus held annotations.
// Returns the class, the reason, the evaluation list, and the
// held bookkeeping for this pick.
function classifyPick(row, pick, waves) {
  const vid = pick.vid;
  const mid = pick.chosen.huntMid;
  const picks = (row.funnel.picks || []).filter(p => p.vid === vid).sort((a, b) => a.part - b.part);
  const laterPicks = picks.filter(p => p.part > pick.part);
  const firstLater = laterPicks.length ? laterPicks[0] : null;
  const deps = (row.returns.departures || []).filter(d =>
    d.vid === vid && d.objective && d.objective.huntMid === mid && d.part >= pick.part);
  let linkedDep = null;
  for (const d of deps.sort((a, b) => a.part - b.part)) {
    const intervening = picks.some(p => p.part > pick.part && p.part < d.part);
    if (!intervening) { linkedDep = d; break; }
  }
  const evals = evalsForObjective((row.departhold || {}).evaluations || [], vid, mid, pick.part);
  // Bound the chain to this pick's objective lifetime: at/before
  // its linked departure, strictly before its first later pick
  // (same-part-as-pick included).
  const chainEvals = evals.filter(e =>
    (linkedDep == null || e.part <= linkedDep.part)
    && (firstLater == null || e.part < firstLater.part || e.part === pick.part));
  const heldEvals = chainEvals.filter(heldByLever);
  const held = {
    heldLeverEvals: heldEvals.length,
    heldParts: heldEvals.map(e => e.part),
    heldVerdicts: heldEvals.map(e => dedupeDanger(e.danger).map(d => d.verdict + '/' + d.score).join(',')),
  };
  const base = (cls, reason, extra) => Object.assign(
    { cls, reason, dep: linkedDep || null, evals: chainEvals, depPart: linkedDep ? linkedDep.part : null,
      firstLaterPart: firstLater ? firstLater.part : null, held },
    extra || {});
  if (linkedDep) {
    return base('departed-pick-linked', `dep part=${linkedDep.part} day=${linkedDep.day}`,
      { heldThenDeparted: heldEvals.length > 0 });
  }
  const deaths = (row.deathsList || []).filter(d => d.who === vid && d.day >= pick.day);
  if (deaths.length && !firstLater) {
    const sameDay = deaths[0].day === pick.day ? ' SAME-DAY' : '';
    return base('died-before-departure',
      `death d${deaths[0].day} cause ${deaths[0].cause}, no later pick${sameDay}`);
  }
  const overwrite = chainEvals.filter(e => e.action === 'overwritten')
    .sort((a, b) => a.part - b.part)[0];
  if (overwrite) {
    const dg = dedupeDanger(overwrite.danger)[0] || null;
    const heldBefore = heldEvals.some(e => e.part < overwrite.part);
    return base('overwritten-danger',
      `eval part=${overwrite.part} day=${overwrite.day} danger=${dg ? dg.verdict + '/' + dg.score : 'NONE'} sub=${overwrite.sub}`,
      { overwrite, heldBeforeOverwrite: heldBefore, freshPickOverwrite: !!overwrite.freshPickInCall });
  }
  if (firstLater) {
    const ck = (firstLater.chosen || {}).kind;
    if (ck === 'EAT' || ck === 'WATER') {
      return base('superseded-by-needs-pick',
        `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck}`);
    }
    const cand = firstLater.candidate || null;
    const preHas = (firstLater.preSightings || []).some(s => s[0] === mid);
    const pickHas = (pick.preSightings || []).some(s => s[0] === mid);
    if ((!cand || cand.mid !== mid) && (preHas || pickHas)) {
      const mem = (firstLater.preSightings || []).find(s => s[0] === mid);
      const memDay = mem ? mem[3] : (pick.chosen.huntDay != null ? pick.chosen.huntDay : null);
      const age = memDay != null ? (firstLater.day - memDay) : null;
      let gate = 'unknown-gate';
      if (age != null && age > 3) gate = 'age';
      else if (firstLater.gates) {
        if (firstLater.gates.postFleeResting) gate = 'postFleeResting';
        else if (firstLater.gates.sheltered) gate = 'sheltered';
        else if (!firstLater.gates.armed) gate = 'unarmed';
        else if (firstLater.gates.maxD != null && mem && (Math.max(Math.abs(mem[1] - 4), Math.abs(mem[2] - 4)) > firstLater.gates.maxD)) gate = 'range';
      }
      return base('candidate-null-after-pick',
        `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck} candidate null gate=${gate} age=${age}`);
    }
    return base('superseded-by-re-pick',
      `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck} candidate=${cand ? cand.mid : 'null'}`);
  }
  const heldReady = chainEvals.filter(e => e.action === 'held-ready' || e.action === 'skipped-not-at-haven' || heldByLever(e));
  if (heldReady.length) {
    const last = heldReady[heldReady.length - 1];
    return base('held-ready-at-end',
      `${heldReady.length} held/skipped evaluation(s), last part=${last.part} action=${last.action}`);
  }
  const g = pick.gates || {};
  if (g.postFleeResting || g.sheltered || g.armed === false) {
    const flag = g.postFleeResting ? 'postFleeResting' : (g.sheltered ? 'sheltered' : 'unarmed');
    return base('gate-blocked', `pick-time gate flag ${flag}`);
  }
  return base('horizon', 'no later pick, no departure, no overwrite, no hold, gates green');
}

function censusFor(dir, seeds, waves, wantW4) {
  const entries = [];
  const classes = {};
  let unknown = 0;
  const unknownWave = [];
  for (const seed of seeds) {
    const row = loadRow(dir, seed);
    for (const pick of (row.funnel.picks || [])) {
      if (!pick.chosen || pick.chosen.kind !== 'HUNT') continue;
      const mid = pick.chosen.huntMid;
      if (!mid || waves[mid] == null) unknownWave.push({ seed, vid: pick.vid, mid });
      if (isW4(waves, mid) !== wantW4) continue;
      const rec = classifyPick(row, pick, waves);
      const entry = {
        seed, vid: pick.vid, mid, wave: waves[mid] || null,
        pickDay: pick.day, pickPart: pick.part, pickDayPart: pick.dayPart,
        huntDay: pick.chosen.huntDay, huntTx: pick.chosen.huntTx, huntTy: pick.chosen.huntTy,
        cls: rec.cls, reason: rec.reason,
        heldLeverEvals: rec.held.heldLeverEvals,
        heldParts: rec.held.heldParts,
        heldVerdicts: rec.held.heldVerdicts,
        heldThenDeparted: !!rec.heldThenDeparted,
        heldBeforeOverwrite: !!rec.heldBeforeOverwrite,
        freshPickOverwrite: !!rec.freshPickOverwrite,
        evalCount: rec.evals.length,
        evalChain: rec.evals.map(e => ({
          part: e.part, day: e.day, dayPart: e.dayPart, atHaven: e.atHaven,
          freshPickInCall: !!e.freshPickInCall, action: e.action, sub: e.sub, reason: e.reason,
          danger: dedupeDanger(e.danger).map(d => ({ verdict: d.verdict, score: d.score })),
          dangerRawCount: (e.danger || []).length,
          heal: (e.heal || []).map(h => ({ satOut: h.satOut, cached: h.cached })),
          tighten: (e.tighten || []).map(t => ({ preKind: t.preKind, postKind: t.postKind, postState: t.postState })),
          depart: (e.depart || []).map(d => ({ ret: d.ret, postState: d.postState })),
          heldByLever: heldByLever(e),
        })),
      };
      entries.push(entry);
      classes[rec.cls] = (classes[rec.cls] || 0) + 1;
      if (rec.cls === 'unknown') unknown++;
    }
  }
  return { entries, classes, unknown, unknownWave };
}

// Held-starvation guard, any wave, one corpus: a HUNT pick with
// >= 1 lever hold whose villager dies of starvation while the
// pick is still open (no linked departure, and no later pick
// with day strictly before the death day). Day-granular, as
// the deaths channel is.
function heldStarvationDeaths(dir, seeds, waves) {
  const STARV_RE = /starv|hunger/i;
  const hits = [];
  for (const seed of seeds) {
    const row = loadRow(dir, seed);
    for (const pick of (row.funnel.picks || [])) {
      if (!pick.chosen || pick.chosen.kind !== 'HUNT') continue;
      const rec = classifyPick(row, pick, waves);
      if (rec.held.heldLeverEvals < 1) continue;
      if (rec.dep) continue;
      const laterPicks = (row.funnel.picks || []).filter(p => p.vid === pick.vid && p.part > pick.part)
        .sort((a, b) => a.part - b.part);
      for (const d of (row.deathsList || [])) {
        if (d.who !== pick.vid || d.day < pick.day || !STARV_RE.test(String(d.cause || ''))) continue;
        const cleared = laterPicks.length > 0 && laterPicks[0].day < d.day;
        if (!cleared) hits.push({ seed, vid: pick.vid, mid: pick.chosen.huntMid, pickDay: pick.day, deathDay: d.day, cause: d.cause });
      }
    }
  }
  return hits;
}

function totals(dir, seeds) {
  let starv = 0, deaths = 0, days = [], w4 = 0, wins = 0;
  for (const seed of seeds) {
    const r = loadRow(dir, seed);
    starv += r.starvationDeaths || 0; deaths += r.deathTotal || 0; days.push(r.days || 0);
    if ((r.waveReach || 1) >= 4) w4++; wins += r.won || 0;
  }
  days.sort((a, b) => a - b);
  return { starvation: starv, deaths, medianDays: days[Math.floor(days.length / 2)] || 0, wave4: w4, wins };
}

function hygieneOf(dir, seeds) {
  const out = {};
  for (const seed of seeds) {
    const r = loadRow(dir, seed);
    const recs = {};
    for (const k of ['fieldparty', 'returns', 'funnel', 'departhold']) recs[k] = r[k] ? r[k].diag : null;
    recs.hunthold = r.hunthold ? { errs: r.hunthold.errs, installed: r.hunthold.installed } : null;
    out[seed] = recs;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const waves = waveMap();
  const out = {
    seeds: args.seeds, confirm: args.confirm,
    primaryOff: [], primaryOn: [], secondaryOn: [],
    classesOff: {}, classesOn: {}, secondaryClassesOn: {},
    unknown: 0, unknownWave: [],
    instrument: { onOther: 0, onOtherHeldUnexplained: 0, offOtherHeldUnexplained: 0, onOverwriteWithoutVerdict: 0 },
    heldStarvation: [], guards: {}, hygiene: {}, drift: {},
  };
  // Instrument leg, both corpora, wave-4 HUNT objective evaluations.
  for (const [label, dir] of [['off', args.off], ['on', args.on]]) {
    for (const seed of args.seeds) {
      const row = loadRow(dir, seed);
      for (const e of ((row.departhold || {}).evaluations || [])) {
        const mid = (e.pre && e.pre.huntMid) || (e.freshPickInCall && e.post && e.post.huntMid) || null;
        if (!isW4(waves, mid)) continue;
        if (label === 'on') {
          if (e.action === 'other') out.instrument.onOther++;
          if (e.action === 'overwritten' && !dedupeDanger(e.danger).length) out.instrument.onOverwriteWithoutVerdict++;
          if (e.action === 'other-held' && !heldByLever(e)) out.instrument.onOtherHeldUnexplained++;
        } else {
          if (e.action === 'other-held') out.instrument.offOtherHeldUnexplained++;
        }
      }
    }
  }
  const offC = censusFor(args.off, args.seeds, waves, true);
  const onC = censusFor(args.on, args.seeds, waves, true);
  const secC = censusFor(args.on, args.seeds, waves, false);
  out.primaryOff = offC.entries;
  out.primaryOn = onC.entries;
  out.secondaryOn = secC.entries;
  out.classesOff = offC.classes;
  out.classesOn = onC.classes;
  out.secondaryClassesOn = secC.classes;
  out.unknown = onC.unknown;
  out.unknownWave = onC.unknownWave.concat(offC.unknownWave);
  out.heldStarvation = heldStarvationDeaths(args.on, args.seeds, waves);
  out.guards.off = totals(args.off, args.seeds);
  out.guards.on = totals(args.on, args.seeds);
  out.hygiene.off = hygieneOf(args.off, args.seeds);
  out.hygiene.on = hygieneOf(args.on, args.seeds);
  // Hygiene verdicts: every recorder errs 0 + overflow empty, both
  // corpora; recorder installed in both; lever store present in ON
  // (errs 0) and null in OFF.
  let hygieneOk = true;
  for (const seed of args.seeds) {
    for (const [label, dir] of [['off', args.off], ['on', args.on]]) {
      const r = loadRow(dir, seed);
      for (const k of ['fieldparty', 'returns', 'funnel', 'departhold']) {
        const d = r[k] ? r[k].diag : null;
        if (!d || d.errs !== 0 || Object.values(d.overflow || {}).some(v => (v | 0) !== 0) || d.installed !== true) hygieneOk = false;
      }
      if (label === 'on') {
        if (!r.hunthold || r.hunthold.errs !== 0 || r.hunthold.installed !== true) hygieneOk = false;
      } else {
        if (r.hunthold != null) hygieneOk = false;
      }
    }
  }
  out.hygieneOk = hygieneOk;
  // Drift vs departhold-ON (reported, not scored).
  try {
    const driftC = censusFor(args.drift, args.seeds, waves, true);
    out.drift = {
      departholdOnPrimary: driftC.entries.length,
      departholdOnDeparted: driftC.entries.filter(e => e.cls === 'departed-pick-linked').length,
      freshOffPrimary: offC.entries.length,
      freshOffDeparted: offC.entries.filter(e => e.cls === 'departed-pick-linked').length,
    };
  } catch (e) { out.drift = { error: String((e && e.message) || e).slice(0, 120) }; }

  const offDeparted = offC.entries.filter(e => e.cls === 'departed-pick-linked').length;
  const onDeparted = onC.entries.filter(e => e.cls === 'departed-pick-linked').length;
  const mechanism = onC.entries.some(e => e.heldThenDeparted);
  const p1 = mechanism;
  const p2 = args.confirm ? (onDeparted > offDeparted) : (onDeparted >= offDeparted);
  const p3 = onC.unknown === 0 && offC.unknown === 0 && onC.entries.length > 0
    && out.instrument.onOther === 0 && out.instrument.onOverwriteWithoutVerdict === 0
    && out.instrument.onOtherHeldUnexplained === 0 && out.instrument.offOtherHeldUnexplained === 0;
  const p4 = hygieneOk;
  const g1 = out.guards.on.starvation <= out.guards.off.starvation;
  const g2 = out.guards.on.wins >= out.guards.off.wins && out.guards.on.wave4 >= out.guards.off.wave4;
  const g3 = out.heldStarvation.length === 0;
  const empty = onC.entries.length === 0 || offC.entries.length === 0;
  out.counts = { offDeparted, onDeparted, mechanismHeldThenDeparted: mechanism };
  out.legs = {
    p1_mechanism: p1, p2_count: p2, p3_completenessInstrument: p3, p4_hygiene: p4,
    g1_starvation: g1, g2_wall: g2, g3_noHeldStarvation: g3,
    verdict: empty ? 'INSUFFICIENT-DATA'
      : (p1 && p2 && p3 && p4 && g1 && g2 && g3) ? 'GO' : 'NO-GO',
  };
  // Secondary aggregates for the evidence (reported, not scored).
  out.secondaryHeld = {
    picksWithHolds: secC.entries.filter(e => e.heldLeverEvals > 0).length,
    heldThenDeparted: secC.entries.filter(e => e.heldThenDeparted).length,
    heldBeforeOverwrite: secC.entries.filter(e => e.heldBeforeOverwrite).length,
    freshPickOverwrites: secC.entries.filter(e => e.freshPickOverwrite).length,
  };
  out.primaryHeld = {
    picksWithHolds: onC.entries.filter(e => e.heldLeverEvals > 0).length,
    heldThenDeparted: onC.entries.filter(e => e.heldThenDeparted).length,
    heldBeforeOverwrite: onC.entries.filter(e => e.heldBeforeOverwrite).length,
    freshPickOverwrites: onC.entries.filter(e => e.freshPickOverwrite).length,
  };

  if (args.sense) {
    console.log('=== SENSE: full verdict chains, every wave-4 HUNT pick (ON corpus) ===');
    for (const e of out.primaryOn) {
      console.log(`PICK s${e.seed} ${e.vid} ${e.mid} d${e.pickDay} part=${e.pickPart} huntDay=${e.huntDay} -> ${e.cls} (${e.reason}) heldLever=${e.heldLeverEvals} heldThenDeparted=${e.heldThenDeparted} heldBeforeOverwrite=${e.heldBeforeOverwrite}`);
      for (const ev of e.evalChain) {
        console.log(`  EVAL part=${ev.part} d${ev.day} dayPart=${ev.dayPart} atHaven=${ev.atHaven} fresh=${ev.freshPickInCall} action=${ev.action} sub=${ev.sub} reason=${ev.reason} danger=${JSON.stringify(ev.danger)} heldByLever=${ev.heldByLever} heal=${JSON.stringify(ev.heal)} tighten=${JSON.stringify(ev.tighten)} depart=${JSON.stringify(ev.depart)}`);
      }
      if (!e.evalChain.length) console.log('  (no evaluation records for this pick)');
    }
    if (!out.primaryOn.length) console.log('(primary universe empty)');
  }
  console.log('=== sim-hunthold-a analysis' + (args.confirm ? ' (CONFIRM)' : ' (PILOT)') + ' ===');
  console.log(`primary wave-4 HUNT picks: OFF ${offC.entries.length} classes=${JSON.stringify(out.classesOff)} | ON ${onC.entries.length} classes=${JSON.stringify(out.classesOn)} unknown=${out.unknown}`);
  console.log(`departed: OFF ${offDeparted} ON ${onDeparted} | mechanism held-then-departed: ${mechanism}`);
  console.log(`primary held: ${JSON.stringify(out.primaryHeld)} secondary held: ${JSON.stringify(out.secondaryHeld)}`);
  console.log(`instrument: ${JSON.stringify(out.instrument)}`);
  console.log(`guards off=${JSON.stringify(out.guards.off)} on=${JSON.stringify(out.guards.on)} hygieneOk=${hygieneOk}`);
  console.log(`heldStarvation: ${JSON.stringify(out.heldStarvation)} drift: ${JSON.stringify(out.drift)} unknownWave=${JSON.stringify(out.unknownWave)}`);
  console.log(`LEGS: ${JSON.stringify(out.legs)}`);
  if (args.out) fs.writeFileSync(args.out, JSON.stringify(out, null, 1) + '\n');
  if (out.legs.verdict !== 'GO') process.exit(1);
}

if (require.main === module) main();
module.exports = { classifyPick, evalsForObjective, heldByLever, dedupeDanger };
