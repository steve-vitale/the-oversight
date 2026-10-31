#!/usr/bin/env node
// analyze-axefirst-r1430-b.js — pure reads over axefirst-r1430 corpora,
// plus the prereg's control-vs-lever comparison (primary axe-by-day-7,
// joint strand-morning proof, guardrails). Copy of
// scripts/analyze-axefirst-b.js with r1430 additions only; the
// classifier, strand extraction, and census shapes are unchanged.
// Usage:
//   node scripts/analyze-axefirst-r1430-b.js <corpusDir...> [--out <file>]
//   node scripts/analyze-axefirst-r1430-b.js --compare <controlDir> <leverDir>
// The compare prints one JSON object to stdout (redirect to the
// sim-axefirst-b-r1430-compare.json evidence file).
// Usage: node scripts/analyze-axefirst-b.js <corpusDir> [outJson]
// Per leg: first axe-tier held (evening + morning day), first-axe
// source class (spawn / stash fetch / corpse loot / craft / other),
// first fell-capable morning, strand census (jointgate method),
// strand-x-axe pairing set. Classifier rules are the prereg's,
// frozen: fetch lines name the hatchet at haven; loot lines name
// "You take ... hatchet from <name>"; craft lines name making one;
// a stash shrink by the hatchet across the arrival evening with a
// fetch flag is stash-fetch inferred; anything else is 'other' with
// quoted lines + diffs, never silently re-labeled.
'use strict';
const fs = require('fs');
const path = require('path');

function invIds(invSnap) {
  if (!invSnap || !Array.isArray(invSnap.inv)) return null;
  return invSnap.inv.map((it) => (it && it.itemId) || null);
}
function eqIds(invSnap) {
  if (!invSnap || !invSnap.eq) return null;
  return Object.values(invSnap.eq).map((e) => (e && e.itemId) || null);
}
function tierOfMorning(m) { return m && m.tool && m.tool.tier ? m.tool.tier.tier : null; }
function tierOfEvening(e) { return e && e.eveningTool && e.eveningTool.tier ? e.eveningTool.tier.tier : null; }

function strandMornings(inst) {
  const eveByLoop = new Map((inst.evenings || []).map((e) => [e.loopDay, e]));
  const out = [];
  for (const m of (inst.mornings || [])) {
    const prev = eveByLoop.get(m.loopDay - 1);
    if (!prev || !prev.woodcarry) continue;
    if (prev.woodcarry.bucket !== 'creek' || prev.woodcarry.rescued) continue;
    if (m.inside === true || m.tile === 'haven') continue;
    if (m.inCombat) continue;
    out.push({ morning: m, prevEvening: prev });
  }
  return out;
}

// classifySource(arrival): arrival = { spawnTierFell, lines[], prevStash,
// arrivalStash, arrivalInvIds, stashFetchDay } — pure, unit-tested.
function classifySource(a) {
  if (a.spawnTierFell) return 'spawn';
  const lines = (a.lines || []).join('\n');
  if (/fetch it/i.test(lines) && /hatchet/i.test(lines)) return 'stash fetch';
  if (/you take .*hatchet.* from/i.test(lines)) return 'corpse loot';
  if (/craft|fashion|make .*hatchet|hatchet.*craft/i.test(lines)) return 'craft';
  const prevStash = a.prevStash || [], arrStash = a.arrStash || [];
  if (prevStash.includes('hatchet') && !arrStash.includes('hatchet') &&
      (a.arrivalInvIds || []).includes('hatchet')) return 'stash fetch (stash-diff inferred)';
  return 'other';
}

function censusLeg(inst) {
  const evenings = (inst.evenings || []).slice().sort((a, b) => a.loopDay - b.loopDay);
  const mornings = (inst.mornings || []).slice().sort((a, b) => a.loopDay - b.loopDay);
  const eveByLoop = new Map(evenings.map((e) => [e.loopDay, e]));
  const spawnTier = inst.spawn && inst.spawn.inv ? null : null;
  let spawnTierFell = false;
  try {
    // Spawn snap has no toolSnap; recompute from spawn inv/eq is NOT
    // authoritative (tier reads engine state). The spawn tier is
    // recorded from the spawn snap's inventory: a hatchet in spawn
    // inventory/equipped is a spawn-held axe; the tier itself is
    // confirmed by the loopDay-1 evening / loopDay-2 morning snaps.
    const sInv = invIds(inst.spawn && inst.spawn.inv) || [];
    const sEq = eqIds(inst.spawn && inst.spawn.inv) || [];
    spawnTierFell = sInv.includes('hatchet') || sEq.includes('hatchet');
  } catch (e) { spawnTierFell = false; }
  const spawnStash = (inst.spawn && inst.spawn.stash) || null;
  const spawnInv = invIds(inst.spawn && inst.spawn.inv);
  const spawnEq = eqIds(inst.spawn && inst.spawn.inv);

  let firstAxeEvening = null, arrivalEvening = null;
  for (const e of evenings) {
    if (tierOfEvening(e) === 'fell') { firstAxeEvening = e.loopDay; arrivalEvening = e; break; }
  }
  let firstAxeMorning = null;
  for (const m of mornings) {
    if (tierOfMorning(m) === 'fell') { firstAxeMorning = m.loopDay; break; }
  }
  // Spawn-held axe: first evening snap (loopDay 1) already shows fell.
  // The spawn class is decided by the spawn snap, not by loopDay 1.
  let source = null, sourceEvidence = null;
  if (firstAxeEvening !== null || firstAxeMorning !== null) {
    if (spawnTierFell) {
      source = 'spawn';
      sourceEvidence = { lines: [], prevStash: null, arrivalStash: spawnStash, arrivalInvIds: spawnInv };
    } else {
      const arr = arrivalEvening || eveByLoop.get(firstAxeMorning - 1) || null;
      const prev = arr ? eveByLoop.get(arr.loopDay - 1) || null : null;
      const lines = arr ? [...(arr.hatchetLines || []), ...(arr.takeLines || [])] : [];
      const prevStash = prev ? prev.eveningStash : null;
      const arrivalStash = arr ? arr.eveningStash : null;
      const arrivalInvIds = arr ? invIds(arr.eveningInv) : null;
      const fetchDay = arr && arr.eveningInv ? arr.eveningInv.stashFetchDay : null;
      source = classifySource({ spawnTierFell: false, lines, prevStash, arrStash: arrivalStash, arrivalInvIds, stashFetchDay: fetchDay });
      sourceEvidence = { lines, prevStash, arrivalStash, arrivalInvIds, stashFetchDay: fetchDay };
    }
  }
  // Vessel at arrival (succession note): morning vessel ids around arrival.
  let vesselAtArrival = null, vesselChangedBeforeArrival = null;
  if (firstAxeMorning !== null) {
    const arrM = mornings.find((m) => m.loopDay === firstAxeMorning);
    vesselAtArrival = arrM ? arrM.vesselId : null;
    const firstVessel = mornings.length ? mornings[0].vesselId : null;
    vesselChangedBeforeArrival = (firstVessel !== null && vesselAtArrival !== null) ? (firstVessel !== vesselAtArrival) : null;
  }

  let firstFellCapableMorning = null;
  for (const m of mornings) {
    const tool = m.tool || {};
    if (tierOfMorning(m) === 'fell' && tool.cutInfo && tool.cutInfo.canFell === true && tool.target) {
      firstFellCapableMorning = m.loopDay; break;
    }
  }
  const heldButNeverFellCapable = (firstAxeMorning !== null && firstFellCapableMorning === null);

  const strands = strandMornings(inst);
  const strandRows = strands.map(({ morning: m, prevEvening: prev }) => ({
    loopDay: m.loopDay, afterStillEvening: prev.loopDay, vesselId: m.vesselId || null,
    wood: m.morningWood, kcal: m.kcal, tier: tierOfMorning(m),
    toolName: m.tool && m.tool.tier ? m.tool.tier.name : null,
    target: m.tool ? m.tool.target : null, canFell: m.tool && m.tool.cutInfo ? m.tool.cutInfo.canFell : null,
    ticksLeft: m.tool ? m.tool.ticksLeft : null,
  }));
  const pairing = strandRows.filter((r) => r.tier === 'fell').map((r) => r.loopDay);
  const incompleteMornings = mornings.filter((m) =>
    tierOfMorning(m) === null || m.inv === null || m.stash === null).length;
  const incompleteStrands = strandRows.filter((r) =>
    r.tier === null || r.kcal === null || r.ticksLeft === null || r.wood === null).length;
  const stillEvenings = evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued).map((e) => e.loopDay);
  const rescuedEvenings = evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && e.woodcarry.rescued).map((e) => e.loopDay);
  return {
    seed: inst.seed, woodwarm: inst.woodwarm,
    daysAlive: inst.daysAlive, endReason: inst.endReason, maxWaveUnlocked: inst.maxWaveUnlocked,
    errs: inst.errCount, evenings: evenings.length, mornings: mornings.length,
    incompleteMornings, incompleteStrands,
    spawnStash, spawnInv, spawnEq, spawnTierFell,
    firstAxeEvening, firstAxeMorning, source, sourceEvidence,
    vesselAtArrival, vesselChangedBeforeArrival,
    firstFellCapableMorning, heldButNeverFellCapable,
    stillEvenings, rescuedEvenings,
    strandMornings: strandRows.length, strandRows, pairing,
    vesselIds: [...new Set(mornings.map((m) => m.vesselId).filter(Boolean))],
  };
}

// --- r1430 additions: axe by day 7, joint proof, guardrails, compare ---

// Snap-level axe test: tier 'fell' OR hatchet itemId in pack/equipped
// (prereg primary-metric definition, verbatim).
function snapHasAxe(invSnap, tier) {
  if (tier === 'fell') return true;
  const ids = invIds(invSnap) || [];
  const eqs = eqIds(invSnap) || [];
  return ids.includes('hatchet') || eqs.includes('hatchet');
}

function axeByDay7(inst) {
  const evenings = (inst.evenings || []).slice().sort((a, b) => a.loopDay - b.loopDay);
  const mornings = (inst.mornings || []).slice().sort((a, b) => a.loopDay - b.loopDay);
  if (inst.spawn && inst.spawn.inv && snapHasAxe(inst.spawn.inv, null)) {
    return { byDay7: true, firstDay: 1, firstSnap: 'spawn', loopDay: null };
  }
  for (const e of evenings) {
    const gd = (e.gameDay === undefined || e.gameDay === null) ? e.loopDay : e.gameDay;
    if (gd <= 7 && snapHasAxe(e.eveningInv, tierOfEvening(e))) {
      return { byDay7: true, firstDay: gd, firstSnap: 'evening', loopDay: e.loopDay };
    }
  }
  for (const m of mornings) {
    const gd = (m.gameDay === undefined || m.gameDay === null) ? m.loopDay : m.gameDay;
    if (gd <= 7 && snapHasAxe(m.inv, tierOfMorning(m))) {
      return { byDay7: true, firstDay: gd, firstSnap: 'morning', loopDay: m.loopDay };
    }
  }
  return { byDay7: false, firstDay: null, firstSnap: null, loopDay: null };
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Per-leg r1430 extras, computed from the raw instance + its census.
function r1430LegExtras(inst, census) {
  const axRecs = (inst.axefirstStore && inst.axefirstStore.records) || [];
  const acted = axRecs.filter((r) => r && r.acted);
  const needsWood = (census.strandRows || []).filter((r) => r.wood !== null && r.wood < 4);
  const needsWoodAxe = needsWood.filter((r) => r.tier === 'fell').map((r) => r.loopDay);
  const fedRoomy = (census.strandRows || []).map((r) => {
    // ROOMY needs walkSteps: re-read the raw morning for it.
    const m = (inst.mornings || []).find((x) => x.loopDay === r.loopDay) || {};
    const walk = m.tool ? m.tool.walkSteps : null;
    const ticks = m.tool ? m.tool.ticksLeft : null;
    const roomy = (ticks !== null && walk !== null) ? (ticks - walk - 96 - 40 >= 96) : null;
    return { loopDay: r.loopDay, fed: (r.kcal !== null ? r.kcal >= 80 : null), roomy, tier: r.tier };
  });
  const lastEve = (inst.evenings || []).slice().sort((a, b) => a.loopDay - b.loopDay).pop() || null;
  return {
    axeByDay7: axeByDay7(inst),
    ruinRuns: acted.map((r) => ({
      loopDay: r.loopDay, gameDay: r.gameDay, ruin: r.ruin || null,
      searches: r.searches, found: !!r.found, stop: r.stop || null,
      unreached: r.unreached || null, return: r.return || null,
      kcalBefore: r.kcalBefore, kcalAfter: r.kcalAfter,
    })),
    ruinRunCount: acted.length,
    ruinFinds: acted.filter((r) => r.found).length,
    stillCount: (census.stillEvenings || []).length,
    needsWoodStrandMornings: needsWood.map((r) => r.loopDay),
    needsWoodAxeMornings: needsWoodAxe,
    strandFedRoomy: fedRoomy,
    survived30: (inst.daysAlive || 0) >= 30,
    earlyGameOver: (inst.daysAlive || 0) < 30 && !!(lastEve && lastEve.gameOver),
  };
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  return files.map((f) => {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const census = censusLeg(inst);
    return { file: f, inst, census, extras: r1430LegExtras(inst, census) };
  });
}

function compareCorpora(controlDir, leverDir) {
  const controls = loadCorpus(controlDir);
  const levers = loadCorpus(leverDir);
  const leverBySeed = new Map(levers.map((l) => [l.inst.seed, l]));
  const primaryControl = controls.filter((l) => l.extras.axeByDay7.byDay7);
  const primaryLever = levers.filter((l) => l.extras.axeByDay7.byDay7);
  const joint = [];
  for (const c of controls) {
    const seed = c.inst.seed;
    const lv = leverBySeed.get(seed);
    if (!lv) { joint.push({ seed, status: 'no-lever-leg' }); continue; }
    const controlStrands = c.census.stillEvenings.length > 0;
    const controlNeedsWood = c.extras.needsWoodStrandMornings.length > 0;
    if (!controlStrands || !controlNeedsWood) { joint.push({ seed, status: 'not-stranding-control', controlStill: c.census.stillEvenings.length, controlNeedsWood: c.extras.needsWoodStrandMornings }); continue; }
    if (lv.census.stillEvenings.length === 0) {
      joint.push({ seed, status: 'MOOT-DISSOLVED', controlStill: c.census.stillEvenings.length, leverStill: 0, leverNeedsWood: lv.extras.needsWoodStrandMornings });
    } else if (lv.extras.needsWoodStrandMornings.length === 0) {
      joint.push({ seed, status: 'MOOT-PACK-READY', controlStill: c.census.stillEvenings.length, leverStill: lv.census.stillEvenings.length, leverNeedsWood: [] });
    } else if (lv.extras.needsWoodAxeMornings.length > 0) {
      joint.push({ seed, status: 'PASS', controlStill: c.census.stillEvenings.length, leverStill: lv.census.stillEvenings.length, leverNeedsWood: lv.extras.needsWoodStrandMornings, leverNeedsWoodAxe: lv.extras.needsWoodAxeMornings });
    } else {
      joint.push({ seed, status: 'FAIL', controlStill: c.census.stillEvenings.length, leverStill: lv.census.stillEvenings.length, leverNeedsWood: lv.extras.needsWoodStrandMornings, leverNeedsWoodAxe: [] });
    }
  }
  const jointDecided = joint.filter((j) => j.status === 'PASS' || j.status === 'FAIL');
  const jointPasses = jointDecided.filter((j) => j.status === 'PASS').length;
  const guardDeaths = [];
  for (const c of controls) {
    const lv = leverBySeed.get(c.inst.seed);
    if (lv && c.extras.survived30 && lv.extras.earlyGameOver) guardDeaths.push(c.inst.seed);
  }
  const guardLengthen = [];
  for (const c of controls) {
    const lv = leverBySeed.get(c.inst.seed);
    if (lv && c.census.stillEvenings.length > 0 && lv.extras.stillCount > c.census.stillEvenings.length) guardLengthen.push(c.inst.seed);
  }
  const medControl = median(controls.map((l) => l.inst.daysAlive || 0));
  const medLever = median(levers.map((l) => l.inst.daysAlive || 0));
  const guardMedian = (medLever !== null && medControl !== null) ? (medLever >= medControl) : null;
  const n = controls.length;
  const aPass = (primaryLever.length >= Math.ceil(n / 2)) && (primaryControl.length <= 2);
  const bPass = jointDecided.length > 0 && jointDecided.every((j) => j.status === 'PASS');
  const guardsPass = guardDeaths.length === 0 && guardLengthen.length === 0 && guardMedian === true;
  let verdict = 'NO-GO';
  let verdictReason = '';
  const strandingControl = joint.filter((j) => j.status !== 'not-stranding-control' && j.status !== 'no-lever-leg');
  if (strandingControl.length === 0) { verdict = 'DIAG-NO-STRAND'; verdictReason = 'no control seed strands with a needs-wood strand morning; joint proof cannot be exercised'; }
  else if (!aPass) verdictReason = 'primary (a) fails: lever ' + primaryLever.length + '/' + n + ' vs control ' + primaryControl.length + '/' + n;
  else if (jointDecided.length === 0) { verdictReason = 'joint proof moot on every stranding seed (all MOOT-DISSOLVED/MOOT-PACK-READY); GO withheld pending re-read'; }
  else if (!bPass) verdictReason = 'joint (b) fails: ' + jointDecided.filter((j) => j.status === 'FAIL').map((j) => j.seed).join(',') + ' FAIL';
  else if (!guardsPass) verdictReason = 'guardrail (c) fails: deaths=' + guardDeaths.join(',') + ' lengthen=' + guardLengthen.join(',') + ' median lever=' + medLever + ' control=' + medControl;
  else { verdict = 'GO'; verdictReason = 'primary (a), joint (b), and guardrails (c) all hold'; }
  const leverSources = {};
  for (const l of levers) if (l.census.firstAxeEvening !== null || l.census.firstAxeMorning !== null) leverSources[l.census.source] = (leverSources[l.census.source] || 0) + 1;
  const ruinAgg = {
    runs: levers.reduce((s, l) => s + l.extras.ruinRunCount, 0),
    finds: levers.reduce((s, l) => s + l.extras.ruinFinds, 0),
    searches: levers.reduce((s, l) => s + l.extras.ruinRuns.reduce((t, r) => t + (r.searches || 0), 0), 0),
    unreached: levers.reduce((s, l) => s + l.extras.ruinRuns.filter((r) => r.unreached).length, 0),
    stops: {},
  };
  for (const l of levers) for (const r of l.extras.ruinRuns) ruinAgg.stops[r.stop] = (ruinAgg.stops[r.stop] || 0) + 1;
  return {
    controlDir, leverDir, nControl: controls.length, nLever: levers.length,
    primary: {
      lever: primaryLever.map((l) => ({ seed: l.inst.seed, firstDay: l.extras.axeByDay7.firstDay, firstSnap: l.extras.axeByDay7.firstSnap })),
      control: primaryControl.map((l) => ({ seed: l.inst.seed, firstDay: l.extras.axeByDay7.firstDay, firstSnap: l.extras.axeByDay7.firstSnap })),
      leverCount: primaryLever.length, controlCount: primaryControl.length,
    },
    joint, jointPasses, jointDecided: jointDecided.length,
    guardrails: { deaths: guardDeaths, lengthen: guardLengthen, medianLever: medLever, medianControl: medControl, pass: guardsPass },
    leverSources, ruinAgg,
    verdict, verdictReason,
    controlLegs: controls.map((l) => ({ seed: l.inst.seed, daysAlive: l.inst.daysAlive, endReason: l.inst.endReason, still: l.census.stillEvenings, strandMornings: l.census.strandMornings, axeByDay7: l.extras.axeByDay7 })),
    leverLegs: levers.map((l) => ({ seed: l.inst.seed, daysAlive: l.inst.daysAlive, endReason: l.inst.endReason, still: l.census.stillEvenings, strandMornings: l.census.strandMornings, axeByDay7: l.extras.axeByDay7, ruinRuns: l.extras.ruinRuns, firstAxeEvening: l.census.firstAxeEvening, firstAxeMorning: l.census.firstAxeMorning, source: l.census.source })),
  };
}

function main() {
  // Usage: analyze-axefirst-b.js [--out <file>] <corpusDir...>
  // Guard and ON legs live in separate dirs (same file names), so
  // multiple dirs are merged into one census. With one dir and no
  // --out, prints the summary only.
  const args = process.argv.slice(2);
  if (args[0] === '--compare') {
    if (args.length !== 3) { console.error('usage: analyze-axefirst-r1430-b.js --compare <controlDir> <leverDir>'); process.exit(2); }
    const cmp = compareCorpora(args[1], args[2]);
    console.log(JSON.stringify(cmp, null, 2));
    console.error(`compare: primary lever ${cmp.primary.leverCount}/${cmp.nLever} control ${cmp.primary.controlCount}/${cmp.nControl}; joint ${cmp.jointPasses}/${cmp.jointDecided} decided; verdict ${cmp.verdict}`);
    return cmp;
  }
  let out = null;
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0) { out = args[outIdx + 1]; args.splice(outIdx, 2); }
  const dirs = args;
  if (!dirs.length) { console.error('usage: analyze-axefirst-b.js [--out <file>] <corpusDir...>'); process.exit(2); }
  const legs = [];
  for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    for (const f of files) legs.push(censusLeg(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
  }
  const axeLegs = legs.filter((l) => l.firstAxeEvening !== null || l.firstAxeMorning !== null);
  const sourceCounts = {};
  for (const l of axeLegs) sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  const pairingTriples = [];
  for (const l of legs) for (const d of l.pairing) pairingTriples.push({ seed: l.seed, woodwarm: l.woodwarm, loopDay: d });
  const summary = {
    corpusDirs: dirs, legs: legs.length,
    legsWithAxe: axeLegs.length, sourceCounts,
    totalStrandMornings: legs.reduce((s, l) => s + l.strandMornings, 0),
    pairingTriples,
    legsDetail: legs,
  };
  if (out) fs.writeFileSync(out, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ legs: legs.length, axeLegs: axeLegs.length, sources: sourceCounts, strand: summary.totalStrandMornings, pairing: pairingTriples.length }));
  for (const l of legs) {
    console.log(`seed=${l.seed} ww=${l.woodwarm} still=[${l.stillEvenings.join(',')}] strand=${l.strandMornings} pairing=[${l.pairing.join(',')}] firstAxeEve=${l.firstAxeEvening} firstAxeMorn=${l.firstAxeMorning} source=${l.source} fellCapMorn=${l.firstFellCapableMorning} heldNeverFell=${l.heldButNeverFellCapable} errs=${l.errs} incM=${l.incompleteMornings} incS=${l.incompleteStrands} wave=${l.maxWaveUnlocked} end=${l.endReason}`);
  }
  return summary;
}

if (require.main === module) main();

module.exports = { strandMornings, censusLeg, classifySource, invIds, eqIds, axeByDay7, r1430LegExtras, compareCorpora, loadCorpus, median };
