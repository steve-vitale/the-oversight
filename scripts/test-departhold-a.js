#!/usr/bin/env node
// scripts/test-departhold-a.js — sim-departhold-a analyzer (pure reads).
// Judges the departure-hold recorder against
// evidence/2026-10-29/sim-departhold-a-prereg.md (binding).
// Inputs: the OFF corpus (recorder unset) and the ON corpus
// (DEPARTHOLD=1), same seeds, plus the lottery-base corpus for
// a drift comparison that is REPORTED, never scored.
//   node scripts/test-departhold-a.js --off <dir> --on <dir>
//     [--lottery <dir>] [--seeds 75101..75108] [--out <json>] [--sense]
// Machine legs: unknown == 0, other/other-held == 0, perturbation
// diffs empty, wave-lookup coverage complete, determinism (two
// runs byte-identical). Exit 1 if any scored leg fails; the
// evidence file reports the verdict, this script proves it.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

function parseArgs(argv) {
  const o = {
    off: path.join(REPO, 'evidence', '2026-10-29', 'perseed-departhold-off'),
    on: path.join(REPO, 'evidence', '2026-10-29', 'perseed-departhold-on'),
    lottery: path.join(REPO, 'evidence', '2026-10-29', 'perseed-lottery-base'),
    seeds: [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108],
    out: null, sense: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--off') o.off = argv[++i];
    else if (a === '--on') o.on = argv[++i];
    else if (a === '--lottery') o.lottery = argv[++i];
    else if (a === '--seeds') o.seeds = argv[++i].split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--sense') o.sense = true;
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

// Evaluations belonging to one pick's objective: same vid, mid
// matches the pick's huntMid (pre-mid for ordinary evaluations,
// post-mid for fresh-pick-in-call evaluations), part >= pick.part.
function evalsForObjective(evals, vid, mid, pickPart) {
  return (evals || []).filter(e => e.vid === vid && e.part >= pickPart
    && ((e.pre && e.pre.huntMid === mid) || (e.freshPickInCall && e.post && e.post.huntMid === mid)));
}

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
  if (linkedDep) {
    return { cls: 'departed-pick-linked', reason: `dep part=${linkedDep.part} day=${linkedDep.day}`, dep: linkedDep, evals, depPart: linkedDep.part, firstLaterPart: firstLater ? firstLater.part : null };
  }
  const deaths = (row.deathsList || []).filter(d => d.who === vid && d.day >= pick.day);
  if (deaths.length && !firstLater) {
    const sameDay = deaths[0].day === pick.day ? ' SAME-DAY' : '';
    return { cls: 'died-before-departure', reason: `death d${deaths[0].day} cause ${deaths[0].cause}, no later pick${sameDay}`, dep: null, evals, depPart: null, firstLaterPart: null };
  }
  // Overwrite: first qualifying evaluation — part >= pick.part,
  // and (same part as the pick [fresh-pick-in-call or same-step
  // evaluation] OR strictly before the first later pick). An
  // evaluation at/after the first later pick belongs to the new
  // objective, not this pick.
  const overwrite = evals.filter(e => e.action === 'overwritten'
    && (e.part === pick.part || !firstLater || e.part < firstLater.part))
    .sort((a, b) => a.part - b.part)[0];
  if (overwrite) {
    const dg = (overwrite.danger || [])[0] || null;
    return {
      cls: 'overwritten-danger',
      reason: `eval part=${overwrite.part} day=${overwrite.day} danger=${dg ? dg.verdict + '/' + dg.score : 'NONE'} sub=${overwrite.sub}`,
      dep: null, evals, overwrite, depPart: null, firstLaterPart: firstLater ? firstLater.part : null,
    };
  }
  if (firstLater) {
    const ck = (firstLater.chosen || {}).kind;
    if (ck === 'EAT' || ck === 'WATER') {
      return { cls: 'superseded-by-needs-pick', reason: `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck}`, dep: null, evals, depPart: null, firstLaterPart: firstLater.part };
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
      return { cls: 'candidate-null-after-pick', reason: `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck} candidate null gate=${gate} age=${age}`, dep: null, evals, depPart: null, firstLaterPart: firstLater.part };
    }
    return { cls: 'superseded-by-re-pick', reason: `first later pick part=${firstLater.part} day=${firstLater.day} chose ${ck} candidate=${cand ? cand.mid : 'null'}`, dep: null, evals, depPart: null, firstLaterPart: firstLater.part };
  }
  const held = evals.filter(e => e.action === 'held-ready' || e.action === 'skipped-not-at-haven');
  if (held.length) {
    return { cls: 'held-ready-at-end', reason: `${held.length} held/skipped evaluation(s), last part=${held[held.length - 1].part} action=${held[held.length - 1].action}`, dep: null, evals, depPart: null, firstLaterPart: null };
  }
  const g = pick.gates || {};
  if (g.postFleeResting || g.sheltered || g.armed === false) {
    const flag = g.postFleeResting ? 'postFleeResting' : (g.sheltered ? 'sheltered' : 'unarmed');
    return { cls: 'gate-blocked', reason: `pick-time gate flag ${flag}`, dep: null, evals, depPart: null, firstLaterPart: null };
  }
  return { cls: 'horizon', reason: 'no later pick, no departure, no overwrite, no hold, gates green', dep: null, evals, depPart: null, firstLaterPart: null };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const waves = waveMap();
  const out = {
    seeds: args.seeds, primary: [], secondary: [],
    classes: {}, classesByCorpus: {}, unknown: 0,
    leg2: { wave4Evals: 0, otherEvals: 0, otherHeldEvals: 0, overwriteWithoutVerdict: 0, outside: {} },
    perturbation: { diffs: [], equal: false },
    drift: {}, guards: {}, hygiene: {},
  };
  let unknownWave = [];
  for (const seed of args.seeds) {
    const row = loadRow(args.on, seed);
    const picks = row.funnel.picks || [];
    const evals = (row.departhold || {}).evaluations || [];
    // Leg 2 scope: evaluations for wave-4 HUNT objectives.
    for (const e of evals) {
      const mid = (e.pre && e.pre.huntMid) || (e.freshPickInCall && e.post && e.post.huntMid) || null;
      if (!isW4(waves, mid)) continue;
      out.leg2.wave4Evals++;
      if (e.action === 'other') out.leg2.otherEvals++;
      if (e.action === 'held-ready' && e.sub === 'other-held') out.leg2.otherHeldEvals++;
      if (e.action === 'overwritten' && !(e.danger || []).length) out.leg2.overwriteWithoutVerdict++;
    }
    for (const k of ['dangerOutside', 'departOutside', 'healOutside', 'tightenOutside']) {
      out.leg2.outside[k] = (out.leg2.outside[k] || 0) + (((row.departhold || {})[k]) || []).length;
    }
    for (const pick of picks) {
      if (!pick.chosen || pick.chosen.kind !== 'HUNT') continue;
      const mid = pick.chosen.huntMid;
      if (!mid || waves[mid] == null) unknownWave.push({ seed, vid: pick.vid, mid });
      const rec = classifyPick(row, pick, waves);
      // Bound the displayed chain to this pick's objective lifetime:
      // evaluations at/before its linked departure, and strictly
      // before its first later pick (same-part-as-pick included).
      const chainEvals = rec.evals.filter(e =>
        (rec.depPart == null || e.part <= rec.depPart)
        && (rec.firstLaterPart == null || e.part < rec.firstLaterPart || e.part === pick.part));
      const entry = {
        seed, vid: pick.vid, mid, wave: waves[mid] || null,
        pickDay: pick.day, pickPart: pick.part, pickDayPart: pick.dayPart,
        huntDay: pick.chosen.huntDay, huntTx: pick.chosen.huntTx, huntTy: pick.chosen.huntTy,
        cls: rec.cls, reason: rec.reason,
        evalCount: chainEvals.length,
        evalChain: chainEvals.map(e => ({
          part: e.part, day: e.day, dayPart: e.dayPart, atHaven: e.atHaven,
          freshPickInCall: !!e.freshPickInCall, action: e.action, sub: e.sub, reason: e.reason,
          danger: (e.danger || []).map(d => ({ verdict: d.verdict, score: d.score })),
          heal: (e.heal || []).map(h => ({ satOut: h.satOut, cached: h.cached })),
          tighten: (e.tighten || []).map(t => ({ preKind: t.preKind, postKind: t.postKind, postState: t.postState })),
          depart: (e.depart || []).map(d => ({ ret: d.ret, postState: d.postState })),
        })),
      };
      if (isW4(waves, mid)) {
        out.primary.push(entry);
        out.classes[rec.cls] = (out.classes[rec.cls] || 0) + 1;
        if (rec.cls === 'unknown') out.unknown++;
      } else {
        out.secondary.push(entry);
      }
    }
    out.hygiene[seed] = row.departhold ? row.departhold.diag : null;
  }
  out.unknownWave = unknownWave;

  // Secondary census classes (all-wave HUNT picks).
  out.secondaryClasses = {};
  for (const e of out.secondary) out.secondaryClasses[e.cls] = (out.secondaryClasses[e.cls] || 0) + 1;

  // Leg 4 perturbation: OFF vs ON per seed, prereg channels only.
  const wallKeys = ['won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'starvationDeaths'];
  function wallOf(r) { const w = {}; for (const k of wallKeys) w[k] = r[k]; w.deaths = r.deaths || {}; return w; }
  for (const seed of args.seeds) {
    const off = loadRow(args.off, seed);
    const on = loadRow(args.on, seed);
    const cmp = (name, a, b) => {
      if (JSON.stringify(a) !== JSON.stringify(b)) out.perturbation.diffs.push({ seed, channel: name });
    };
    cmp('funnelPicks', off.funnel.picks, on.funnel.picks);
    cmp('returnsMeetings', off.returns.meetings, on.returns.meetings);
    cmp('returnsDepartures', off.returns.departures, on.returns.departures);
    cmp('returnsDrops', off.returns.drops, on.returns.drops);
    cmp('wall', wallOf(off), wallOf(on));
    cmp('offHasNoDeparthold', off.departhold, null);
    cmp('onHasDeparthold', !!on.departhold, true);
  }
  out.perturbation.equal = out.perturbation.diffs.length === 0;

  // Guards: OFF vs ON totals + lottery-base drift (reported, not scored).
  function totals(dir) {
    let starv = 0, deaths = 0, days = [], w4 = 0, wins = 0;
    for (const seed of args.seeds) {
      const r = loadRow(dir, seed);
      starv += r.starvationDeaths || 0; deaths += r.deathTotal || 0; days.push(r.days || 0);
      if ((r.waveReach || 1) >= 4) w4++; wins += r.won || 0;
    }
    days.sort((a, b) => a - b);
    return { starvation: starv, deaths, medianDays: days[Math.floor(days.length / 2)] || 0, wave4: w4, wins };
  }
  out.guards.off = totals(args.off);
  out.guards.on = totals(args.on);
  try { out.guards.lotteryBase = totals(args.lottery); } catch (e) { out.guards.lotteryBase = { error: String((e && e.message) || e).slice(0, 120) }; }
  // Drift: primary universe + departed counts, lottery-base vs fresh OFF.
  try {
    let lotPrimary = 0, lotDeparted = 0;
    for (const seed of args.seeds) {
      const r = loadRow(args.lottery, seed);
      for (const p of (r.funnel.picks || [])) {
        if (p.chosen && p.chosen.kind === 'HUNT' && isW4(waves, p.chosen.huntMid)) {
          lotPrimary++;
          const deps = (r.returns.departures || []).filter(d => d.vid === p.vid && d.objective && d.objective.huntMid === p.chosen.huntMid && d.part >= p.part);
          const later = (r.funnel.picks || []).filter(q => q.vid === p.vid && q.part > p.part);
          if (deps.some(d => !later.some(q => q.part > p.part && q.part < d.part))) lotDeparted++;
        }
      }
    }
    out.drift = {
      lotteryPrimary: lotPrimary, lotteryDeparted: lotDeparted,
      freshPrimary: out.primary.length,
      freshDeparted: out.primary.filter(e => e.cls === 'departed-pick-linked').length,
    };
  } catch (e) { out.drift = { error: String((e && e.message) || e).slice(0, 120) }; }

  // Orphan check: wave-4 overwritten evaluations claimed by a primary pick.
  let wave4OverwrittenEvals = 0;
  for (const seed of args.seeds) {
    const row = loadRow(args.on, seed);
    for (const e of ((row.departhold || {}).evaluations || [])) {
      const mid = (e.pre && e.pre.huntMid) || (e.freshPickInCall && e.post && e.post.huntMid) || null;
      if (e.action === 'overwritten' && isW4(waves, mid)) wave4OverwrittenEvals++;
    }
  }
  const claimedOverwrites = out.primary.filter(e => e.cls === 'overwritten-danger').length;
  out.orphanOverwrites = wave4OverwrittenEvals - claimedOverwrites;
  out.wave4OverwrittenEvals = wave4OverwrittenEvals;

  const leg1 = out.unknown === 0 && out.primary.length > 0;
  const leg2 = out.leg2.otherEvals === 0 && out.leg2.otherHeldEvals === 0 && out.leg2.overwriteWithoutVerdict === 0;
  const leg3a = out.primary.some(e => e.cls === 'overwritten-danger');
  const leg3 = out.primary.length > 0 && (leg3a || (out.unknown === 0 && leg2));
  const leg4 = out.perturbation.equal;
  out.legs = {
    leg1_completeness: leg1, leg2_noUnrecordedOverwrites: leg2,
    leg3_overwriteAnswered: leg3, leg3a_recordedOverwrite: leg3a,
    leg4_perturbation: leg4,
    verdict: (!out.primary.length) ? 'INSUFFICIENT-DATA'
      : (leg1 && leg2 && leg3 && leg4) ? 'DIAG-GO' : 'DIAG-NO-GO',
  };

  if (args.sense) {
    console.log('=== SENSE: full verdict chains, every wave-4 HUNT pick (ON corpus) ===');
    for (const e of out.primary) {
      console.log(`PICK s${e.seed} ${e.vid} ${e.mid} d${e.pickDay} part=${e.pickPart} huntDay=${e.huntDay} -> ${e.cls} (${e.reason})`);
      for (const ev of e.evalChain) {
        console.log(`  EVAL part=${ev.part} d${ev.day} dayPart=${ev.dayPart} atHaven=${ev.atHaven} fresh=${ev.freshPickInCall} action=${ev.action} sub=${ev.sub} reason=${ev.reason} danger=${JSON.stringify(ev.danger)} heal=${JSON.stringify(ev.heal)} tighten=${JSON.stringify(ev.tighten)} depart=${JSON.stringify(ev.depart)}`);
      }
      if (!e.evalChain.length) console.log('  (no evaluation records for this pick)');
    }
    if (!out.primary.length) console.log('(primary universe empty)');
  }
  console.log('=== sim-departhold-a analysis ===');
  console.log(`primary wave-4 HUNT picks: ${out.primary.length} classes=${JSON.stringify(out.classes)} unknown=${out.unknown}`);
  console.log(`secondary all-wave HUNT picks: ${out.secondary.length} classes=${JSON.stringify(out.secondaryClasses)}`);
  console.log(`leg2: wave4Evals=${out.leg2.wave4Evals} other=${out.leg2.otherEvals} otherHeld=${out.leg2.otherHeldEvals} overwriteWithoutVerdict=${out.leg2.overwriteWithoutVerdict} outside=${JSON.stringify(out.leg2.outside)} orphanOverwrites=${out.orphanOverwrites} wave4OverwrittenEvals=${out.wave4OverwrittenEvals}`);
  console.log(`leg4 perturbation: equal=${out.perturbation.equal} diffs=${JSON.stringify(out.perturbation.diffs)}`);
  console.log(`guards off=${JSON.stringify(out.guards.off)} on=${JSON.stringify(out.guards.on)} lotteryBase=${JSON.stringify(out.guards.lotteryBase)}`);
  console.log(`drift: ${JSON.stringify(out.drift)} unknownWave=${JSON.stringify(unknownWave)}`);
  console.log(`LEGS: ${JSON.stringify(out.legs)}`);
  if (args.out) fs.writeFileSync(args.out, JSON.stringify(out, null, 1) + '\n');
  if (out.legs.verdict === 'DIAG-NO-GO') process.exit(1);
}

if (require.main === module) main();
module.exports = { classifyPick, evalsForObjective };
