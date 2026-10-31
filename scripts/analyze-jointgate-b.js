#!/usr/bin/env node
// analyze-jointgate-b.js — pure reads over jointgate census corpora.
// Usage: node scripts/analyze-jointgate-b.js <corpusDir> [outJson]
// Prints a census summary and writes it (default: <corpusDir>.json
// replaced? No: writes <corpusDir>-census.json next to the dir's
// parent when outJson is omitted — caller passes an explicit path).
// Strand extraction (lackingline method): a strand morning is the
// morning after a still creek evening (woodcarry bucket 'creek',
// rescued false), waking NOT at haven, not game-over, not in combat.
// Joint definitions are the prereg's, frozen: fed = kcal >= 80,
// axe = tier 'fell', roomy = ticksLeft - walkSteps - 96 - 40 >= 96,
// joint = needsWood && fed && axe && roomy.
'use strict';
const fs = require('fs');
const path = require('path');

function invIds(invSnap) {
  if (!invSnap || !Array.isArray(invSnap.inv)) return null;
  return invSnap.inv.map((it) => (it && it.itemId) || null);
}
function isAxeTier(tier) { return tier === 'fell'; }
function axeItemIds() { return ['hatchet']; } // fell-tier weapon ids observed in items.json (hatchet: tool.woodcut 'fell')

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

function censusLeg(inst) {
  const strands = strandMornings(inst);
  const rows = strands.map(({ morning: m, prevEvening: prev }) => {
    const j = m.joint || {};
    const tool = m.tool || {};
    return {
      loopDay: m.loopDay, afterStillEvening: prev.loopDay,
      vesselId: m.vesselId || null,
      wood: m.morningWood, needsWood: j.needsWood,
      kcal: m.kcal, fed: j.fed,
      tier: tool.tier ? tool.tier.tier : null, toolName: tool.tier ? tool.tier.name : null,
      toolItemId: tool.tier ? tool.tier.itemId : null,
      target: tool.target || null, walkSteps: tool.walkSteps,
      canFell: tool.cutInfo ? tool.cutInfo.canFell : null,
      ticksLeft: tool.ticksLeft, projected: j.projected, roomy: j.roomy,
      joint: j.joint, tierCanFellAgree: j.tierCanFellAgree,
      invIds: invIds(m.inv), stashIds: m.stash || null,
      map: (m.mapPx !== undefined ? (m.mapPx + ',' + m.mapPy) : null),
      mx: m.mx, my: m.my,
    };
  });
  const needs = rows.filter((r) => r.needsWood === true);
  const packReady = rows.filter((r) => r.needsWood === false);
  const noTarget = needs.filter((r) => !r.target);
  const jointRows = needs.filter((r) => r.joint === true);
  const failTool = needs.filter((r) => r.axe !== true).length;
  const failKcal = needs.filter((r) => r.fed !== true).length;
  const failTicks = needs.filter((r) => r.target && r.roomy !== true).length;
  // Completeness: every strand morning carries all prereg fields.
  const incomplete = rows.filter((r) =>
    r.tier === null || r.kcal === null || r.ticksLeft === null || r.wood === null ||
    r.invIds === null || r.stashIds === null ||
    (r.target && r.canFell === null) || r.tierCanFellAgree === false).length;
  // Stash-fetch reconciliation.
  const spawnStash = (inst.spawn && inst.spawn.stash) || null;
  const spawnInv = invIds(inst.spawn && inst.spawn.inv);
  const spawnEq = (inst.spawn && inst.spawn.inv && inst.spawn.inv.eq)
    ? Object.values(inst.spawn.inv.eq).map((e) => (e && e.itemId) || null) : null;
  const day2 = (inst.mornings || []).find((m) => m.loopDay === 2) || null;
  const day2Stash = day2 ? day2.stash : null;
  const day2Inv = day2 ? invIds(day2.inv) : null;
  const day2Fetch = day2 ? { stashFetchDay: day2.inv ? day2.inv.stashFetchDay : null, armorFetchDay: day2.inv ? day2.inv.armorFetchDay : null } : null;
  // First axe morning + intraday bracket.
  let firstAxeMorning = null, arrivalBracket = null;
  const allMornings = (inst.mornings || []).slice().sort((a, b) => a.loopDay - b.loopDay);
  const eveByLoop = new Map((inst.evenings || []).map((e) => [e.loopDay, e]));
  for (const m of allMornings) {
    const tier = m.tool && m.tool.tier ? m.tool.tier.tier : null;
    if (tier === 'fell') {
      firstAxeMorning = m.loopDay;
      const prevEve = eveByLoop.get(m.loopDay - 1);
      const prevEveTier = prevEve && prevEve.eveningTool && prevEve.eveningTool.tier ? prevEve.eveningTool.tier.tier : null;
      const prevMorn = allMornings.find((x) => x.loopDay === m.loopDay - 1);
      const prevMornTier = prevMorn && prevMorn.tool && prevMorn.tool.tier ? prevMorn.tool.tier.tier : null;
      arrivalBracket = {
        morningTierBefore: prevMornTier, eveningTierBefore: prevEveTier,
        intraday: (prevMornTier !== 'fell' && prevEveTier === 'fell') ? ('loopDay ' + (m.loopDay - 1) + ' intraday') : null,
      };
      break;
    }
  }
  // First axe EVENING (arrival day when the morning still lacks it).
  let firstAxeEvening = null;
  for (const e of (inst.evenings || []).slice().sort((a, b) => a.loopDay - b.loopDay)) {
    const tier = e.eveningTool && e.eveningTool.tier ? e.eveningTool.tier.tier : null;
    if (tier === 'fell') { firstAxeEvening = e.loopDay; break; }
  }
  const vesselIds = [...new Set(allMornings.map((m) => m.vesselId).filter(Boolean))];
  const stillEvenings = (inst.evenings || []).filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued).map((e) => e.loopDay);
  const rescuedEvenings = (inst.evenings || []).filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && e.woodcarry.rescued).map((e) => e.loopDay);
  return {
    seed: inst.seed, woodwarm: inst.woodwarm,
    daysAlive: inst.daysAlive, endReason: inst.endReason, maxWaveUnlocked: inst.maxWaveUnlocked,
    errs: inst.errCount, wcErrs: inst.woodcarryStore ? inst.woodcarryStore.errs : null,
    wwErrs: inst.warmthStore ? inst.warmthStore.errs : null, wwActed: inst.warmthStore ? inst.warmthStore.acted : null,
    mornings: (inst.mornings || []).length, evenings: (inst.evenings || []).length,
    stillEvenings, rescuedEvenings,
    strandMornings: rows.length, needsWood: needs.length, packReady: packReady.length,
    noTarget: noTarget.length, joint: jointRows.length, jointLoopDays: jointRows.map((r) => r.loopDay),
    failTool, failKcal, failTicks, incomplete,
    rows,
    reconciliation: {
      spawnStash, spawnInv, spawnEq, day2Stash, day2Inv, day2Fetch,
      spawnHasAxeTierItem: (spawnInv || []).some((id) => axeItemIds().includes(id)) || (spawnEq || []).some((id) => axeItemIds().includes(id)),
      spawnStashHasAxeTierItem: spawnStash ? spawnStash.some((id) => axeItemIds().includes(id)) : null,
      firstAxeMorning, firstAxeEvening, arrivalBracket, vesselIds,
      fetchLines: (inst.fetchLines || []).length,
    },
  };
}

function main() {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir) { console.error('usage: analyze-jointgate-b.js <corpusDir> [outJson]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const legs = files.map((f) => censusLeg(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
  const summary = {
    corpusDir: dir, legs: legs.length,
    totalStrandMornings: legs.reduce((s, l) => s + l.strandMornings, 0),
    totalNeedsWood: legs.reduce((s, l) => s + l.needsWood, 0),
    totalJoint: legs.reduce((s, l) => s + l.joint, 0),
    totalPackReady: legs.reduce((s, l) => s + l.packReady, 0),
    totalNoTarget: legs.reduce((s, l) => s + l.noTarget, 0),
    legsDetail: legs,
  };
  if (out) fs.writeFileSync(out, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ legs: legs.length, strand: summary.totalStrandMornings, needs: summary.totalNeedsWood, joint: summary.totalJoint, packReady: summary.totalPackReady, noTarget: summary.totalNoTarget }));
  for (const l of legs) {
    console.log(`seed=${l.seed} ww=${l.woodwarm} still=[${l.stillEvenings.join(',')}] rescued=[${l.rescuedEvenings.join(',')}] strand=${l.strandMornings} needs=${l.needsWood} joint=${l.joint} failTool=${l.failTool} failKcal=${l.failKcal} failTicks=${l.failTicks} packReady=${l.packReady} noTarget=${l.noTarget} incomplete=${l.incomplete} firstAxeMorn=${l.reconciliation.firstAxeMorning} firstAxeEve=${l.reconciliation.firstAxeEvening}`);
  }
  return summary;
}

if (require.main === module) main();

module.exports = { strandMornings, censusLeg, invIds };
