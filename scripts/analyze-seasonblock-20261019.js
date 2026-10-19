#!/usr/bin/env node
// analyze-seasonblock-20261019.js — seasoning-blocker attribution for
// sim-seasonblock (flesh-out loop arm sim-seasonblock, run
// fleshout-20261019T2015Z, axis scale-onramp).
//
// Reads evidence/2026-10-19/perseed-seasonblock/{leadfeast,belongfeast}/
// s{seed}.json (the probe's bond census) and names, per bond, the seasoning
// blocker from the pre-registered set:
//   (age-reset by succession / age-reset by v3 re-court / primary polity < 4 fires)
// with day-exact evidence on the stall seeds (64201, 64202, 64207 belongfeast).
//
// The three blockers, as the engine defines them (hierarchy.js /
// standing.js, grep-verified 2026-10-19):
//   - age-reset: link.day is written once at _formLink and NEVER reassigned.
//     An age reset is ALWAYS a break+re-form. The break's how (noted
//     day-exact in link.history[] by breakLink) names the cause:
//       'walked'     -> age-reset by v3 re-court (the consolidator switch, or
//                       the Binding WALK — distinguished by re-court
//                       within 14d vs scale refusal)
//       'succession' -> age-reset by succession (the funeral-hour
//                       neglect snap, trust<20 + no upkeep for 14d)
//       other        -> age-reset by other (<how>), named honestly
//   - primary polity < 4 fires: the BELONG diplomacy leg needs
//     _linkRegionalPlus = polityOf(primary), which requires good standing
//     (trust>=50, arrears 0, age>=14) AND the foreign realm at >=4 fires
//     (2 + fp.subs.length). Age>=30 and trust>=40 but rplus==false with
//     fires<4 names this blocker.
// A bond-day's failing leg (dip==0) is named by dipFailLeg: age<30,
// trust<40, arrears, good-standing, polity<4fires, granted, unexplained.
// Any 'unexplained' day is a LOUD unexplained pair — the pre-registered
// bar (0 unexplained stall seed-pairs) fails closed on it.
//
// Writes evidence/2026-10-19/seasonblock-corpus-summary.json.
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-seasonblock');
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-19', 'seasonblock-corpus-summary.json');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const STALL_SEEDS = [64201, 64202, 64207]; // belongfeast focus

function load(policy, seed) {
  const p = path.join(EVID, policy, `s${seed}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// dipFailLeg(b): the failing leg of a bond-day where this link earns no +34.
// Mirrors the engine's leg order: age (>=30) -> trust (>=40) -> arrears (0)
// -> regional+ (good standing then foreign-realm fire count).
function dipFailLeg(b) {
  if (!b) return 'no-bond';
  if (b.dip) return 'granted';
  if (b.st !== 'active') return 'inactive';
  if (b.age < 30) return 'age<30';
  if (b.trust < 40) return 'trust<40';
  if (b.arrears > 0) return 'arrears';
  if (!b.rplus) {
    if (b.fires != null && b.fires < 4) return 'polity<4fires';
    return 'good-standing';
  }
  return 'unexplained';
}

// nameReset(breakNote): the age-reset cause from breakLink's day-exact
// history note ('Link broken (<how>).').
function nameReset(breakNote) {
  const n = String(breakNote || '');
  if (/walked/.test(n)) return 'age-reset by v3 re-court';
  if (/succession/.test(n)) return 'age-reset by succession';
  if (/gambit|revolt|seceded|released/.test(n)) return 'age-reset by other (' + n.slice(0, 60) + ')';
  if (/broken/.test(n)) return 'age-reset by other (' + n.slice(0, 60) + ')';
  return 'no-break-note';
}

// Upward bonds (the BELONG road): subordinate==='haven', not a peer kind.
function upwardLinks(linkDump) {
  return (linkDump || []).filter(l => l && l.sub === 'haven' && !l.kind);
}

// Subordinate bonds (the LEAD road): primary==='haven'.
function downLinks(linkDump) {
  return (linkDump || []).filter(l => l && l.prim === 'haven' && !l.kind);
}

// Per-link daily rows (by link id) from the bond census.
function bondRowsById(run) {
  const byId = {};
  for (const day of (run.bond || [])) {
    for (const l of (day.links || [])) {
      (byId[l.id] = byId[l.id] || []).push({ day: day.d, ...l });
    }
  }
  return byId;
}

function breakOf(dumpLink) {
  for (const h of (dumpLink.history || [])) {
    if (h.kind === 'broken') return h;
  }
  return null;
}

// The bond timeline: for each upward bond, formed/broken days, reset name,
// re-court within 14d (new upward bond formed to any primary), and the
// per-day failing-leg intervals once age>=30.
function bondTimeline(run) {
  const ups = upwardLinks(run.linkDump);
  const byId = bondRowsById(run);
  const succ = new Set((run.successionDays || []).map(s => s.day));
  return ups.map(l => {
    const bk = breakOf(l);
    const resetName = bk ? nameReset(bk.note) : 'no-break (run end or active)';
    const formedDay = l.fday;
    const brokenDay = bk ? bk.day : null;
    // re-court: a later upward bond formed the same day or within 14 days of
    // this bond's break (the consolidator courts the rising power the same
    // day it walks the old bond).
    let recourt = null;
    if (brokenDay != null) {
      for (const o of ups) {
        if (o.id === l.id) continue;
        if (o.fday >= brokenDay && o.fday <= brokenDay + 14) {
          recourt = { day: o.fday, prim: o.prim, lag: o.fday - brokenDay };
          break;
        }
      }
    }
    // failing-leg intervals for this bond's days at age>=30.
    const rows = (byId[l.id] || []).filter(r => r.st === 'active' && r.age >= 30);
    const allRows = (byId[l.id] || []).filter(r => r.st === 'active');
    const maxAge = allRows.length ? Math.max(...allRows.map(r => r.age)) : 0;
    const legs = rows.map(r => ({ day: r.day, leg: dipFailLeg(r), trust: r.trust, arrears: r.arrears, fires: r.fires, age: r.age }));
    const grantedDay = rows.find(r => r.dip) ? rows.find(r => r.dip).day : null;
    const legShare = {};
    for (const x of legs) legShare[x.leg] = (legShare[x.leg] || 0) + 1;
    return {
      id: l.id, prim: l.prim, formedDay, brokenDay, endTrust: l.endTrust,
      breakHow: bk ? String(bk.note).slice(0, 80) : null,
      resetName, recourt,
      agedDays: legs.length, maxAge, grantedDay, legShare,
      legs, succOnLife: [...succ].filter(d => formedDay != null && d >= formedDay && (brokenDay == null || d <= brokenDay)),
    };
  });
}

// Join "bond is young" beats to the bond's TRUE age that day.
function beatsWithAge(run) {
  const byId = bondRowsById(run);
  return (run.beats || []).map(b => {
    let age = null, prim = null, trust = null;
    for (const id of Object.keys(byId)) {
      const row = byId[id].find(r => r.day === b.day && r.sub === 'haven' && !r.kind && r.st === 'active');
      if (row) { age = row.age; prim = row.prim; trust = row.trust; break; }
    }
    return { day: b.day, tag: b.tag, bondAge: age, bondPrim: prim, bondTrust: trust, text: String(b.text).slice(0, 220) };
  });
}

// The verdict for one stall seed (belongfeast): the blocker named PER BOND
// from the pre-registered set, with day-exact evidence. Rules:
//   - a bond that never reached age 30: the blocker is the reset that kept
//     it young (resetName from breakLink's day-exact history note), or
//     'never-aged' if it simply ran out of horizon (death/end).
//   - a bond that reached age>=30: the majority failing leg over its aged
//     days (polity<4fires / good-standing / trust<40 / arrears); if it
//     granted dip and later lost it, the loss leg is named too (the dip-
//     HOLDING problem — outside the pre-registered set, flagged honestly).
// A seed is unexplained if any bond-day carries an 'unexplained' leg.
function stallVerdict(run) {
  if (!run) return { verdict: 'no-run-data', blocker: null, bondBlockers: [] };
  const tl = bondTimeline(run);
  if (!tl.length) return { verdict: 'no bond ever formed', blocker: 'no-bond-formed', bondBlockers: [] };
  let unexplainedDays = 0;
  const bondBlockers = tl.map(t => {
    unexplainedDays += (t.legShare.unexplained || 0);
    if (!t.agedDays) {
      // A never-aged bond that another bond's re-court points at is the
      // re-court's product — its age was reset by that re-court. Otherwise
      // name the reset that ended it (from breakLink's day-exact note), or
      // 'never-aged' if the horizon/death simply ended it.
      const productOf = tl.find(o => o.recourt && o.recourt.prim === t.prim && o.recourt.day === t.formedDay);
      let b;
      if (productOf) b = `age-reset by v3 re-court (re-court product of the d${productOf.brokenDay} walk; reached age ${t.maxAge} before death)`;
      else if (t.brokenDay != null) b = t.resetName;
      else b = 'never-aged (horizon/death ended it)';
      return { prim: t.prim, formedDay: t.formedDay, brokenDay: t.brokenDay, blocker: b, recourt: t.recourt };
    }
    const share = t.legShare;
    const top = Object.entries(share).sort((a, b) => b[1] - a[1])[0];
    const dipDays = (t.legs || []).filter(x => x.leg === 'granted').length;
    if (t.grantedDay == null) {
      // Never seasoned: the majority failing leg is the blocker.
      return { prim: t.prim, formedDay: t.formedDay, brokenDay: t.brokenDay, blocker: top[0],
        legShare: share, recourt: t.recourt };
    }
    // Granted dip. If it held to the end, the bond seasoned honestly.
    const lossLegs = Object.entries(share).filter(([leg]) => leg !== 'granted').sort((a, b) => b[1] - a[1]);
    const lossDays = lossLegs.reduce((s, [, n]) => s + n, 0);
    if (!lossDays) {
      return { prim: t.prim, formedDay: t.formedDay, brokenDay: t.brokenDay, blocker: 'seasoned (dip earned)',
        dipGrantedDay: t.grantedDay, dipDays, legShare: share, recourt: t.recourt };
    }
    // Granted then lost: name the loss (the dip-HOLDING problem — outside
    // the pre-registered set, flagged honestly) and the break that ended it.
    const lossLeg = lossLegs[0][0];
    const ended = t.brokenDay != null ? `; ended d${t.brokenDay} by ${t.resetName}` : '';
    return {
      prim: t.prim, formedDay: t.formedDay, brokenDay: t.brokenDay,
      blocker: `dip granted d${t.grantedDay}, held ${dipDays}d, lost to ${lossLeg}${ended}`,
      dipGrantedDay: t.grantedDay, dipDays, lossLeg,
      dipLost: `dip granted d${t.grantedDay}, held ${dipDays}d, then lost to ${lossLeg}`,
      legShare: share, recourt: t.recourt,
    };
  });
  const seedBlocker = bondBlockers.map(b => `${b.prim}:${b.blocker}`).join(' → ');
  return { verdict: 'per-bond blockers named', blocker: seedBlocker, bondBlockers, unexplainedDays };
}

// Lead paired comparison: per seed, the 3 subordinate bonds — first dip-grant
// day per bond, and the day the +102 lands (or never).
function leadCompare(run) {
  if (!run) return { verdict: 'no-run-data' };
  const downs = downLinks(run.linkDump);
  const byId = bondRowsById(run);
  const bonds = downs.map(l => {
    const rows = (byId[l.id] || []).filter(r => r.st === 'active');
    const firstDip = rows.find(r => r.dip);
    return { prim: l.sub, formedDay: l.fday, brokenDay: breakOf(l) ? breakOf(l).day : null,
      firstDipDay: firstDip ? firstDip.day : null, maxAge: rows.length ? rows[rows.length - 1].age : null };
  });
  const dipDays = bonds.map(b => b.firstDipDay).filter(d => d != null).sort((a, b) => a - b);
  return { bonds, dipGrantDays: dipDays };
}

function analyze() {
  const corpus = { seeds: SEEDS, stalls: {}, leadPairs: {}, summary: {} };
  let unexplainedPairs = 0;
  for (const seed of STALL_SEEDS) {
    const run = load('belongfeast', seed);
    const v = stallVerdict(run);
    const beats = run ? beatsWithAge(run) : [];
    const youngBeats = beats.filter(b => b.tag === 'bond-is-young');
    const beatsOlderThan21 = youngBeats.filter(b => b.bondAge != null && b.bondAge >= 21);
    corpus.stalls[seed] = {
      policy: 'belongfeast',
      gameDays: run ? run.gameDays : null, endReason: run ? run.endReason : null,
      def5ever: null,
      dipEver: run ? !!(run.bond || []).find(d => (d.links || []).some(l => l.dip && l.sub === 'haven')) : null,
      successions: run ? run.successionDays : null,
      timeline: bondTimeline(run),
      verdict: v,
      beats: beats,
      beatsYoungCount: youngBeats.length,
      beatsOlderThan21: beatsOlderThan21.map(b => ({ day: b.day, bondAge: b.bondAge, bondPrim: b.bondPrim })),
    };
    if (v.unexplainedDays > 0) unexplainedPairs++;
    if (!v.blocker) unexplainedPairs++;
  }
  for (const seed of SEEDS) {
    const run = load('leadfeast', seed);
    corpus.leadPairs[seed] = { gameDays: run ? run.gameDays : null, endReason: run ? run.endReason : null, compare: leadCompare(run) };
  }
  corpus.summary = { stallSeeds: STALL_SEEDS.length, unexplainedPairs };
  fs.writeFileSync(OUT, JSON.stringify(corpus, null, 1));
  // Console: the day-exact verdict table.
  console.log('=== sim-seasonblock: seasoning-blocker verdicts (belongfeast stall seeds) ===');
  for (const seed of STALL_SEEDS) {
    const s = corpus.stalls[seed];
    console.log(`\ns${seed} (${s.gameDays}d, ${s.endReason}):`);
    for (const b of (s.verdict.bondBlockers || [])) {
      const rc = b.recourt ? `re-courted d${b.recourt.day} (${b.recourt.prim}, +${b.recourt.lag}d)` : 'NO re-court';
      console.log(`  bond ${b.prim}: formed d${b.formedDay}` +
        (b.brokenDay != null ? `, broken d${b.brokenDay}` : ', never broken') +
        ` -> BLOCKER: ${b.blocker}${b.dipLost ? ' [' + b.dipLost + ']' : ''} | ${rc}`);
      if (b.legShare) console.log('    leg-share: ' + JSON.stringify(b.legShare));
    }
    console.log(`  succession days: ${(s.successions || []).map(x => x.day).join(', ') || 'none'}`);
    console.log(`  'bond is young' beats: ${s.beatsYoungCount}; beats at true age>=21: ${s.beatsOlderThan21.length}` +
      (s.beatsOlderThan21.length ? ' -> ' + s.beatsOlderThan21.map(b => `d${b.day}@age${b.bondAge}`).join(', ') : ''));
  }
  console.log('\n=== lead paired comparison: dip-grant days per bond ===');
  for (const seed of SEEDS) {
    const lp = corpus.leadPairs[seed];
    const c = lp.compare;
    if (!c || !c.bonds) { console.log(`s${seed}: no data`); continue; }
    console.log(`s${seed} (${lp.gameDays}d): ` + c.bonds.map(b => `${b.prim} formed d${b.formedDay}, dip ${b.firstDipDay == null ? 'never' : 'd' + b.firstDipDay}`).join(' | '));
  }
  console.log(`\nSUMMARY: ${STALL_SEEDS.length} stall seeds, unexplainedPairs=${corpus.summary.unexplainedPairs}`);
  console.log('wrote ' + OUT);
}

module.exports = { dipFailLeg, nameReset, bondTimeline, stallVerdict, leadCompare, beatsWithAge, upwardLinks, downLinks, STALL_SEEDS };

if (require.main === module) analyze();
