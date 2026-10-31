#!/usr/bin/env node
// analyze-axefirst-b.js — pure reads over axefirst census corpora.
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

function main() {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir) { console.error('usage: analyze-axefirst-b.js <corpusDir> [outJson]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const legs = files.map((f) => censusLeg(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
  const axeLegs = legs.filter((l) => l.firstAxeEvening !== null || l.firstAxeMorning !== null);
  const sourceCounts = {};
  for (const l of axeLegs) sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  const pairingTriples = [];
  for (const l of legs) for (const d of l.pairing) pairingTriples.push({ seed: l.seed, woodwarm: l.woodwarm, loopDay: d });
  const summary = {
    corpusDir: dir, legs: legs.length,
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

module.exports = { strandMornings, censusLeg, classifySource, invIds, eqIds };
