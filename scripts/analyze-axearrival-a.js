#!/usr/bin/env node
// analyze-axearrival-a.js — axe-arrival census analyzer (sim-axearrival-a;
// prereg: evidence/2026-10-30/sim-axearrival-a-prereg.md).
// PURE READS: parses axearrival-trace-a.js corpora, never runs the
// game. Per seed it builds the snap sequence (spawn, then per
// loop-day morning then evening), finds the first axe snap, brackets
// it to one loop-day or one overnight, and classifies the mechanism
// ONLY from evidence inside the bracket (wrap entries, day lines,
// vessel change + death record, pool shrink). 'Day N fell succeeds'
// alone is never a mechanism. Usage:
//   node scripts/analyze-axearrival-a.js <corpusDir> [outJson]
// When required as a module it exports the classifier + scanners
// for scripts/test-axearrival-a.js and runs no main.
'use strict';
const fs = require('fs');
const path = require('path');

function axeHeld(snap) {
  if (!snap || snap.error) return false;
  return !!snap.hasHatchet || !!snap.canFell;
}

function snapDesc(kind, loopDay, gameDay, snap) {
  return {
    kind, loopDay, gameDay,
    villagerId: snap ? (snap.villagerId || null) : null,
    vesselName: snap ? (snap.vesselName || null) : null,
    hasHatchet: snap ? !!snap.hasHatchet : null,
    tier: snap ? (snap.tier || null) : null,
    toolName: snap ? (snap.toolName || null) : null,
    canFell: snap ? (snap.canFell === undefined ? null : !!snap.canFell) : null,
    inv: snap ? (snap.inv || []) : [],
    eq: snap ? (snap.eq || []) : [],
  };
}

// classifyBracket(bracketDayRow, prevSnap, firstSnap, deaths, morningPools)
// bracketDayRow: the evening row of the loop-day the arrival brackets
// to (for an overnight bracket, the row of the loop-day AFTER the
// overnight? No — see below). Bracket semantics, fixed here:
//  - intraday bracket: previous snap = that loop-day's MORNING snap,
//    first snap = that loop-day's EVENING snap. Evidence day = that
//    loop-day's evening row (fullDaySay + dayEvents).
//  - overnight bracket: previous snap = loop-day N's EVENING snap,
//    first snap = loop-day N+1's MORNING snap. Evidence day = the
//    loop-day N+1 evening row is NOT the bracket day (the arrival
//    happened before its daily ran); the overnight evidence is the
//    vessel change + deaths + the N+1 morning pool, plus any
//    N+1-morning lines only if they name the arrival (they run
//    after the snap, so they cannot explain it — they are noted,
//    never counted). Overnight classification therefore rests on
//    vessel-change + death (succession) or on pool shrink between
//    the N evening pool (unavailable — evening snaps carry no pool)
//    and the N+1 morning pool vs the last morning pool that held
//    the hatchet stashed (stash-equip cannot be confirmed
//    overnight without an equip wrap entry, and wrap entries only
//    fire inside a daily — so an overnight arrival with no vessel
//    change is 'unknown' unless a death+succession record names it).
// The caller passes evidenceDayRow (the intraday row, or null for
// overnight) and morningPoolBefore / morningPoolAfter (pool lists
// from the morning snaps bracketing the arrival, or null).
function classifyBracket(evidenceDayRow, prevSnap, firstSnap, deaths, morningPoolBefore, morningPoolAfter) {
  const candidates = [];
  const evidence = [];
  const lines = (evidenceDayRow && Array.isArray(evidenceDayRow.fullDaySay)) ? evidenceDayRow.fullDaySay : [];
  const events = (evidenceDayRow && Array.isArray(evidenceDayRow.dayEvents)) ? evidenceDayRow.dayEvents : [];
  const vesselChanged = !!(prevSnap && firstSnap && prevSnap.villagerId && firstSnap.villagerId && prevSnap.villagerId !== firstSnap.villagerId);
  // succession: vessel change + a death record naming the outgoing vessel
  if (vesselChanged) {
    const outId = prevSnap.villagerId, outName = prevSnap.vesselName;
    const deathHit = (deaths || []).find((d) => {
      const s = JSON.stringify(d);
      return (outId && s.includes(outId)) || (outName && s.includes(outName));
    });
    if (deathHit) {
      candidates.push('succession');
      evidence.push('vessel ' + outId + ' -> ' + firstSnap.villagerId + '; death record: ' + JSON.stringify(deathHit).slice(0, 300));
    } else {
      evidence.push('vessel changed ' + outId + ' -> ' + firstSnap.villagerId + ' but no death record names the outgoing vessel (succession unconfirmed)');
    }
  }
  // loot: wrap entry lootCorpse flipping hasHatchet, or a take-from line naming the hatchet
  const lootEvent = events.find((e) => e.method === 'lootCorpse' && e.before && !e.before.hasHatchet && e.after && e.after.hasHatchet);
  if (lootEvent) { candidates.push('loot'); evidence.push('lootCorpse wrap loopDay ' + lootEvent.loopDay + ' args ' + JSON.stringify(lootEvent.args)); }
  const lootLine = lines.find((l) => /you take .*hatchet.* from/i.test(l) || /hatchet.*from .*body/i.test(l) || /take .*hatchet.*from/i.test(l));
  if (lootLine) { if (!candidates.includes('loot')) candidates.push('loot'); evidence.push('loot line: ' + lootLine); }
  // stash-equip: equip wrap flipping hasHatchet + morning pool shrink
  const equipEvent = events.find((e) => (e.method === 'equip' || e.method === 'unequip') && e.before && !e.before.hasHatchet && e.after && e.after.hasHatchet);
  const poolShrank = !!(morningPoolBefore && morningPoolAfter &&
    Array.isArray(morningPoolBefore.stashed) && morningPoolBefore.stashed.includes('hatchet') &&
    Array.isArray(morningPoolAfter.stashed) && !morningPoolAfter.stashed.includes('hatchet'));
  // NOTE: poolShrank is shared by stash-equip and stash-fetch above.
  if (equipEvent && poolShrank) { candidates.push('stash-equip'); evidence.push('equip wrap loopDay ' + equipEvent.loopDay + ' + stashed hatchet pool shrink'); }
  else if (equipEvent) { evidence.push('equip wrap flips hasHatchet but no morning-pool shrink observed (stash-equip unconfirmed)'); }
  // grant
  const grantEvent = events.find((e) => e.method === 'alienLootGrant' && e.after && e.after.hasHatchet && !(e.before && e.before.hasHatchet));
  if (grantEvent) { candidates.push('grant'); evidence.push('alienLootGrant wrap loopDay ' + grantEvent.loopDay + ' args ' + JSON.stringify(grantEvent.args)); }
  const grantLine = lines.find((l) => /grant.*hatchet|hatchet.*grant/i.test(l));
  if (grantLine) { if (!candidates.includes('grant')) candidates.push('grant'); evidence.push('grant line: ' + grantLine); }
  // trade-gift
  const giftLine = lines.find((l) => /gave you .*hatchet|gift.*hatchet|hatchet.*gift|traded .*hatchet|hatchet.*trade/i.test(l));
  if (giftLine) { candidates.push('trade-gift'); evidence.push('gift/trade line: ' + giftLine); }
  // stash-fetch: a haven fetch line naming the hatchet + morning-pool
  // shrink (the fetch is not an equip() call, so no wrap entry fires).
  // poolShrank is computed by the caller from the morning pools
  // bracketing the arrival (spawn pool counts as the pre-arrival
  // pool for a loopDay-1 arrival).
  const fetchLine = lines.find((l) => /remember.*hatchet.*fetch|fetch.*hatchet|hatchet.*fetch/i.test(l));
  if (fetchLine && poolShrank) { candidates.push('stash-fetch'); evidence.push('fetch line: ' + fetchLine + ' + stashed hatchet pool shrink'); }
  else if (fetchLine) { evidence.push('fetch line present but no morning-pool shrink observed (stash-fetch unconfirmed)'); }
  // craft
  const craftLine = lines.find((l) => /craft.*hatchet|made .*hatchet|forged .*hatchet/i.test(l));
  if (craftLine) { candidates.push('craft'); evidence.push('craft line: ' + craftLine); }
  const mechanism = candidates.length ? candidates[0] : 'unknown';
  return { mechanism, candidates, evidence, vesselChanged };
}

function analyzeSeed(inst) {
  const evenings = inst.evenings || [];
  const mornings = inst.mornings || [];
  const morningByLoop = new Map(mornings.map((m) => [m.loopDay, m]));
  // Snap sequence: spawn, then per loop-day morning then evening.
  const snaps = [];
  snaps.push({ ...snapDesc('spawn', 0, (inst.spawnSnap || {}).gameDay || 0, inst.spawnSnap), snap: inst.spawnSnap });
  const eveningByLoop = new Map(evenings.map((e) => [e.loopDay, e]));
  const loopDays = [...new Set([...mornings.map((m) => m.loopDay), ...evenings.map((e) => e.loopDay)])].sort((a, b) => a - b);
  for (const ld of loopDays) {
    const m = morningByLoop.get(ld);
    if (m) snaps.push({ ...snapDesc('morning', ld, m.gameDay, m.axe), snap: m.axe });
    const e = eveningByLoop.get(ld);
    if (e) snaps.push({ ...snapDesc('evening', ld, e.gameDay, e.eveningAxe), snap: e.eveningAxe, row: e });
  }
  // First axe snap.
  let firstIdx = -1;
  for (let i = 0; i < snaps.length; i++) {
    if (axeHeld(snaps[i].snap)) { firstIdx = i; break; }
  }
  let firstAxe = null;
  if (firstIdx >= 0) {
    const first = snaps[firstIdx];
    const prev = firstIdx > 0 ? snaps[firstIdx - 1] : null;
    // Intraday brackets: morning->evening of one loop-day, AND
    // spawn->evening of loopDay 1 (there is no loopDay-1 morning snap
    // by driver design — callIdx>1 — so the spawn snap IS the
    // loopDay-1 morning state; treating it as an overnight hid the
    // loopDay-1 evening row's lines from classification).
    const intraday = !!((prev && prev.kind === 'morning' && first.kind === 'evening' && prev.loopDay === first.loopDay) ||
      (prev && prev.kind === 'spawn' && first.kind === 'evening' && first.loopDay === 1));
    const bracketDay = intraday ? first.loopDay : (first.kind === 'morning' ? first.loopDay : null);
    const evidenceRow = intraday ? eveningByLoop.get(first.loopDay) : null;
    // Morning pools bracketing the arrival (for stash-equip /
    // stash-fetch shrink). For an evening first-snap, poolBefore is
    // that loop-day's morning pool, falling back to the spawn pool
    // on loopDay 1; poolAfter is the NEXT morning's pool (the
    // fetch/equip lands in the pack by evening, and the pool
    // shrink is visible the next morning).
    let poolBefore = null, poolAfter = null;
    if (first.kind === 'morning') {
      poolAfter = (first.snap && first.snap.pool) || null;
      // Last earlier morning snap carrying a pool.
      for (let i = firstIdx - 1; i >= 0; i--) {
        if (snaps[i].kind === 'morning' && snaps[i].snap && snaps[i].snap.pool) { poolBefore = snaps[i].snap.pool; break; }
      }
      if (!poolBefore && inst.spawnSnap && inst.spawnSnap.pool) poolBefore = inst.spawnSnap.pool;
    } else if (first.kind === 'evening') {
      const m = morningByLoop.get(first.loopDay);
      poolBefore = (m && m.axe && m.axe.pool) || ((inst.spawnSnap && inst.spawnSnap.pool) || null);
      const mNext = morningByLoop.get(first.loopDay + 1);
      poolAfter = (mNext && mNext.axe && mNext.axe.pool) || null;
    }
    const cls = classifyBracket(evidenceRow, prev, first, inst.deaths || [], poolBefore, poolAfter);
    firstAxe = {
      loopDay: first.loopDay, gameDay: first.gameDay, kind: first.kind,
      bracket: intraday ? ('intraday loopDay ' + first.loopDay) : ('overnight into loopDay ' + first.loopDay + ' (prev snap: ' + (prev ? (prev.kind + ' loopDay ' + prev.loopDay) : 'none') + ')'),
      bracketDay,
      prevSnap: prev ? { kind: prev.kind, loopDay: prev.loopDay, gameDay: prev.gameDay, villagerId: prev.villagerId, hasHatchet: prev.hasHatchet, tier: prev.tier, canFell: prev.canFell } : null,
      firstSnap: { kind: first.kind, loopDay: first.loopDay, gameDay: first.gameDay, villagerId: first.villagerId, hasHatchet: first.hasHatchet, tier: first.tier, toolName: first.toolName, canFell: first.canFell, inv: first.inv, eq: first.eq },
      mechanism: cls.mechanism, candidates: cls.candidates, evidence: cls.evidence, vesselChanged: cls.vesselChanged,
    };
  }
  // Morning/evening axe table for gameDays 7..20 (verdict bar (a)).
  const windowRows = [];
  for (const e of evenings) {
    if (e.gameDay < 7 || e.gameDay > 20) continue;
    const m = morningByLoop.get(e.loopDay);
    windowRows.push({
      loopDay: e.loopDay, gameDay: e.gameDay,
      morning: m ? { villagerId: (m.axe || {}).villagerId || null, hasHatchet: !!(m.axe || {}).hasHatchet, tier: (m.axe || {}).tier || null, canFell: (m.axe || {}).canFell === undefined ? null : !!(m.axe || {}).canFell, error: (m.axe || {}).error || null } : null,
      evening: e.eveningAxe ? { villagerId: e.eveningAxe.villagerId || null, hasHatchet: !!e.eveningAxe.hasHatchet, tier: e.eveningAxe.tier || null, canFell: e.eveningAxe.canFell === undefined ? null : !!e.eveningAxe.canFell, error: e.eveningAxe.error || null } : null,
      inside: e.inside, tile: e.tile,
      woodcarry: e.woodcarry ? { bucket: e.woodcarry.bucket || null, rescued: !!e.woodcarry.rescued } : null,
      strandfixAttempt: !!e.strandfixAttempt,
    });
  }
  const windowComplete = windowRows.length > 0 && windowRows.every((r) =>
    r.morning && !r.morning.error && r.morning.tier !== null && r.morning.canFell !== null &&
    r.evening && !r.evening.error && r.evening.tier !== null && r.evening.canFell !== null);
  // Strand nights in window (creek, not rescued) for context.
  const strandNights = evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued).map((e) => e.gameDay);
  const axeByDay20 = firstAxe && firstAxe.gameDay <= 20 ? firstAxe : null;
  return {
    seed: inst.seed, endReason: inst.endReason, daysAlive: inst.daysAlive,
    recorderErrs: (inst.recorder || {}).errs || 0, recorderErrors: (inst.recorder || {}).errors || [],
    wrapInstalled: (inst.recorder || {}).wrapInstalled || null,
    axeEvents: (inst.axeEvents || []).length,
    spawnAxe: { hasHatchet: !!((inst.spawnSnap || {}).hasHatchet), tier: (inst.spawnSnap || {}).tier || null, canFell: (inst.spawnSnap || {}).canFell === undefined ? null : !!(inst.spawnSnap || {}).canFell, poolHatchet: !!((inst.spawnSnap || {}).pool && Array.isArray((inst.spawnSnap || {}).pool.stashed) && (inst.spawnSnap || {}).pool.stashed.includes('hatchet')) },
    firstAxe, axeByDay20,
    windowRows, windowComplete, windowEvenings: windowRows.length,
    strandNights, strandCount: strandNights.length,
    deaths: inst.deaths || [],
  };
}

function main() {
  const dir = process.argv[2];
  const out = process.argv[3] || null;
  if (!dir) { console.error('usage: analyze-axearrival-a.js <corpusDir> [outJson]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const seeds = {};
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const a = analyzeSeed(inst);
    seeds[a.seed] = a;
    const fa = a.firstAxe ? ('firstAxe loopDay ' + a.firstAxe.loopDay + ' gameDay ' + a.firstAxe.gameDay + ' ' + a.firstAxe.kind + ' mechanism=' + a.firstAxe.mechanism + ' bracket=' + a.firstAxe.bracket) : 'no axe in window';
    console.log('seed ' + a.seed + ' end=' + a.endReason + ' days=' + a.daysAlive + ' recErrs=' + a.recorderErrs + ' windowComplete=' + a.windowComplete + ' windowEvenings=' + a.windowEvenings + ' strand=' + a.strandCount + ' ' + fa);
  }
  const census = { dir, files, seeds };
  if (out) fs.writeFileSync(out, JSON.stringify(census, null, 2));
  return census;
}

if (require.main === module) main();
module.exports = { axeHeld, classifyBracket, analyzeSeed, snapDesc };
