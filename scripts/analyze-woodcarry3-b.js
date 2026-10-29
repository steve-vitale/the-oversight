#!/usr/bin/env node
// analyze-woodcarry3-b.js — judge sim-woodcarry3-b legs against
// the prereg (evidence/2026-10-29/sim-woodcarry3-b-prereg.md).
// Usage: node scripts/analyze-woodcarry3-b.js <offDir> <onDir>
// Prints a JSON report + a human summary. Exits 0; the proof
// script (scripts/test-woodcarry3-b.js) asserts the GO bars.
//
// PRIMARY (prereg, superseding the prior run's evening share):
// episode rescue rate = rescued OFF-leg episodes / OFF-leg
// episodes. Episodes are maximal runs of consecutive refused
// creek evenings on the OFF leg per seed; an episode is RESCUED
// iff the ON leg's evening row for the episode's first refused
// loop-day ends at the haven node (mapPx/Py == haven hx/hy)
// and does not end refused after a creek refusal.
'use strict';
const fs = require('fs');
const path = require('path');

function wilson(k, n) {
  if (n === 0) return { lo: null, hi: null };
  const z = 1.96, p = k / n, d = 1 + (z * z) / (2 * n);
  const c = (p + (z * z) / (2 * n)) / d;
  const m = (z / d) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return { lo: Math.max(0, c - m), hi: Math.min(1, c + m) };
}

function loadDir(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}

function creekEvenings(corpus) {
  const rows = [];
  for (const seed of Object.keys(corpus).sort((a, b) => a - b)) {
    const inst = corpus[seed];
    for (const e of (inst.evenings || [])) {
      const wc = e.woodcarry;
      if (!wc || wc.outcome !== 'travel-refused') continue;
      if (wc.bucket !== 'creek') continue;
      const haven = e.haven || {};
      const atHaven = (e.mapPx === haven.hx && e.mapPy === haven.hy);
      rows.push({
        seed: Number(seed), loopDay: e.loopDay,
        bucket: wc.bucket, classification: wc.classification,
        bridge: wc.bridge, retry: wc.retry, entryOutcome: wc.entryOutcome,
        wrapperRescued: wc.rescued, driverAtHaven: atHaven,
        driverInside: e.inside === true, driverTile: e.tile,
        sayTail: e.eveningSayTail || [], narration: wc.narration,
        eveningOutcome: e.eveningOutcome,
      });
    }
  }
  return rows;
}

function otherRefused(corpus) {
  let n = 0; const per = {};
  for (const seed of Object.keys(corpus)) {
    const inst = corpus[seed];
    let c = 0;
    for (const e of (inst.evenings || [])) {
      const wc = e.woodcarry;
      if (wc && wc.outcome === 'travel-refused' && wc.bucket && wc.bucket !== 'creek') { c++; }
    }
    per[seed] = c; n += c;
  }
  return { n, per };
}

function unclassified(corpus) {
  let n = 0; const list = [];
  for (const seed of Object.keys(corpus)) {
    const inst = corpus[seed];
    for (const e of (inst.evenings || [])) {
      const wc = e.woodcarry;
      if (wc && wc.outcome === 'travel-refused' && wc.bucket === 'unclassified') {
        n++; list.push({ seed: Number(seed), loopDay: e.loopDay, hop: wc.hopReturnKind });
      }
    }
  }
  return { n, list };
}

function carryStats(corpus) {
  const acted = []; const skips = {};
  for (const seed of Object.keys(corpus)) {
    const inst = corpus[seed];
    for (const e of (inst.evenings || [])) {
      const c = e.woodcarryCarry;
      if (!c) continue;
      if (c.acted) acted.push({ seed: Number(seed), loopDay: c.loopDay, took: c.took, woodBefore: c.woodBefore, woodAfter: c.woodAfter, pileBefore: c.pileBefore, pileAfter: c.pileAfter, kcal: c.kcal });
      else skips[c.skip || 'unknown'] = (skips[c.skip || 'unknown'] || 0) + 1;
    }
  }
  return { acted, actedCount: acted.length, skips };
}

// Maximal runs of consecutive loop-days per seed, from creek rows.
function episodes(rows) {
  const bySeed = {};
  for (const r of rows) (bySeed[r.seed] = bySeed[r.seed] || []).push(r);
  const eps = [];
  for (const seed of Object.keys(bySeed).sort((a, b) => a - b)) {
    const rs = bySeed[seed].sort((a, b) => a.loopDay - b.loopDay);
    let cur = null;
    for (const r of rs) {
      if (!cur || r.loopDay !== cur.lastDay + 1) {
        if (cur) eps.push(cur);
        cur = { seed: Number(seed), firstDay: r.loopDay, lastDay: r.loopDay, evenings: [r] };
      } else {
        cur.lastDay = r.loopDay; cur.evenings.push(r);
      }
    }
    if (cur) eps.push(cur);
  }
  return eps;
}

// Prereg operationalization of RESCUED for one OFF episode.
function judgeEpisode(ep, off, on) {
  const onInst = on[ep.seed];
  const offFirst = ep.evenings[0];
  if (!onInst) return { rescued: false, reason: 'no-on-leg' };
  const onRow = (onInst.evenings || []).find((e) => e.loopDay === ep.firstDay) || null;
  if (!onRow) return { rescued: false, reason: 'no-on-row-first-day' };
  const haven = onRow.haven || offFirst.haven || null;
  // offFirst has no .haven field (creekEvenings rows drop it); use
  // the OFF inst's evening row for the same loop-day as fallback.
  let hx = null, hy = null;
  if (haven && haven.hx !== undefined) { hx = haven.hx; hy = haven.hy; }
  else {
    const offInst = off[ep.seed];
    const offRow = offInst ? (offInst.evenings || []).find((e) => e.loopDay === ep.firstDay) : null;
    if (offRow && offRow.haven) { hx = offRow.haven.hx; hy = offRow.haven.hy; }
  }
  const atHaven = (hx !== null && onRow.mapPx === hx && onRow.mapPy === hy);
  const endsRefusedCreek = !!(onRow.woodcarry && onRow.woodcarry.outcome === 'travel-refused' && onRow.woodcarry.bucket === 'creek' && !atHaven);
  const rescued = atHaven && !endsRefusedCreek;
  return {
    rescued,
    reason: rescued ? 'on-first-day-at-haven' : (atHaven ? 'at-haven-but-refused' : 'on-first-day-away'),
    onRow: onRow ? {
      loopDay: onRow.loopDay, eveningOutcome: onRow.eveningOutcome,
      inside: onRow.inside, tile: onRow.tile, mapPx: onRow.mapPx, mapPy: onRow.mapPy,
      woodcarryOutcome: onRow.woodcarry ? onRow.woodcarry.outcome : null,
      woodcarryBucket: onRow.woodcarry ? onRow.woodcarry.bucket : null,
      bridge: onRow.woodcarry ? onRow.woodcarry.bridge : null,
      entryOutcome: onRow.woodcarry ? onRow.woodcarry.entryOutcome : null,
    } : null,
  };
}

function deathsOf(corpus) {
  // Prereg guard counts PLAYER deaths only (death.player true),
  // from the start (backlog #1425).
  const list = [], all = [];
  for (const seed of Object.keys(corpus)) {
    const inst = corpus[seed];
    for (const d of (inst.deaths || [])) {
      all.push({ seed: Number(seed), death: d });
      if (d.player === true) list.push({ seed: Number(seed), death: d });
    }
  }
  return { player: list, all };
}

function divergenceAudit(off, on) {
  const res = {};
  for (const seed of Object.keys(on)) {
    const onInst = on[seed], offInst = off[seed];
    if (!offInst) { res[seed] = { error: 'no-off-leg' }; continue; }
    const strip = (e) => {
      const c = Object.assign({}, e);
      delete c.woodcarry; delete c.woodcarryCarry; delete c.eveningSayTail;
      return c;
    };
    const offRows = (offInst.evenings || []).map(strip);
    const onRows = (onInst.evenings || []).map(strip);
    let firstDiff = null;
    const n = Math.max(offRows.length, onRows.length);
    for (let i = 0; i < n; i++) {
      const a = JSON.stringify(offRows[i] || null), b = JSON.stringify(onRows[i] || null);
      if (a !== b) { firstDiff = (onRows[i] || offRows[i] || {}).loopDay || (i + 1); break; }
    }
    // First lever action = earliest of acted carry, bridge attempt,
    // or narration line on the ON leg.
    let firstAction = null;
    for (const e of (onInst.evenings || [])) {
      const c = e.woodcarryCarry;
      if (c && c.acted) { const d = (c.loopDay === undefined ? e.loopDay : c.loopDay); firstAction = (firstAction === null ? d : Math.min(firstAction, d)); }
      const wc = e.woodcarry;
      if (wc && (wc.bridge.attempted || wc.narration)) firstAction = (firstAction === null ? e.loopDay : Math.min(firstAction, e.loopDay));
    }
    res[seed] = { firstDiff, firstAction, ok: (firstDiff === null || firstAction === null) ? (firstDiff === null) : (firstDiff >= firstAction) };
  }
  return res;
}

function honestyCheck(onRows) {
  const fails = [];
  for (const r of onRows) {
    if (r.driverAtHaven) continue; // rescued: no line owed
    const tail = (r.sayTail || []).join('\n');
    const line = r.narration;
    if (!line || !tail.includes(line.slice(0, 60))) {
      fails.push({ seed: r.seed, loopDay: r.loopDay, narration: line, tailLast: (r.sayTail || []).slice(-3) });
    }
  }
  return fails;
}

function insideEvenings(corpus) {
  let n = 0; const per = {};
  for (const seed of Object.keys(corpus)) {
    const inst = corpus[seed];
    let c = 0;
    for (const e of (inst.evenings || [])) if (e.inside === true && e.tile === 'haven') c++;
    per[seed] = c; n += c;
  }
  return { n, per };
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function main() {
  const offArg = process.argv[2], onArg = process.argv[3];
  if (!offArg || !onArg) { console.error('usage: analyze-woodcarry3-b.js <offDir> <onDir>'); process.exit(2); }
  const off = Object.assign({}, ...offArg.split(',').map(loadDir));
  const on = Object.assign({}, ...onArg.split(',').map(loadDir));
  const offCreek = creekEvenings(off), onCreek = creekEvenings(on);
  const rescuedEvenings = onCreek.filter((r) => r.driverAtHaven);
  const w = wilson(rescuedEvenings.length, onCreek.length);
  const offUnc = unclassified(off), onUnc = unclassified(on);
  const offErrs = Object.values(off).reduce((t, i) => t + ((i.woodcarryStore && i.woodcarryStore.errs) || 0), 0);
  const onErrs = Object.values(on).reduce((t, i) => t + ((i.woodcarryStore && i.woodcarryStore.errs) || 0), 0);
  const offErrList = Object.values(off).flatMap((i) => (i.woodcarryStore && i.woodcarryStore.errors) || []);
  const onErrList = Object.values(on).flatMap((i) => (i.woodcarryStore && i.woodcarryStore.errors) || []);
  const carries = carryStats(on);
  const bridgeSkips = {}, bridgeOutcomes = {};
  for (const r of onCreek) {
    if (r.bridge.attempted) {
      const k = r.bridge.built ? (r.retry && r.retry.arrived ? (r.entryOutcome || 'arrived-no-entry') : 'retry-refused') : 'build-failed';
      bridgeOutcomes[k] = (bridgeOutcomes[k] || 0) + 1;
    } else {
      bridgeSkips[r.bridge.skip || 'unknown'] = (bridgeSkips[r.bridge.skip || 'unknown'] || 0) + 1;
    }
  }
  const floorFeas = onCreek.filter((r) => {
    const c = r.classification || {};
    return c.kcal !== null && c.kcal !== undefined && (c.kcal - 60) >= 200;
  }).length;
  // PRIMARY: OFF-leg episodes, judged on the ON leg's first day.
  const offEps = episodes(offCreek);
  const judged = offEps.map((ep) => {
    const j = judgeEpisode(ep, off, on);
    return { seed: ep.seed, firstDay: ep.firstDay, lastDay: ep.lastDay, evenings: ep.evenings.length, rescued: j.rescued, reason: j.reason, onFirstDay: j.onRow };
  });
  const epsRescued = judged.filter((e) => e.rescued).length;
  const epRate = judged.length ? epsRescued / judged.length : null;
  const epWilson = wilson(epsRescued, judged.length);
  const onEps = episodes(onCreek);
  const offDeathsAll = deathsOf(off), onDeathsAll = deathsOf(on);
  const offDeaths = offDeathsAll.player, onDeaths = onDeathsAll.player;
  const div = divergenceAudit(off, on);
  const divOk = Object.values(div).every((d) => d.ok);
  const honestFails = honestyCheck(onCreek);
  const stillRefusedOn = onCreek.filter((r) => !r.driverAtHaven);
  const rescueDisagree = onCreek.filter((r) => r.wrapperRescued !== null && r.wrapperRescued !== r.driverAtHaven);
  const perSeedOff = {}, perSeedOn = {};
  for (const r of offCreek) perSeedOff[r.seed] = (perSeedOff[r.seed] || 0) + 1;
  for (const r of onCreek) perSeedOn[r.seed] = (perSeedOn[r.seed] || 0) + 1;
  const insideOff = insideEvenings(off), insideOn = insideEvenings(on);
  const survOff = median(Object.values(off).map((i) => i.daysAlive));
  const survOn = median(Object.values(on).map((i) => i.daysAlive));
  const report = {
    seedsOff: Object.keys(off).sort(), seedsOn: Object.keys(on).sort(),
    creekOff: offCreek.length, perSeedOff, creekOn: onCreek.length, perSeedOn,
    // PRIMARY
    episodesOff: judged, episodeCount: judged.length, episodesRescued: epsRescued,
    episodeRescueRate: epRate, episodeWilson: epWilson,
    // SECONDARY evening share (not the judge)
    rescuedEvenings: rescuedEvenings.length, rescuedInside: rescuedEvenings.filter((r) => r.driverInside).length,
    rescuedOutsideAtHaven: rescuedEvenings.filter((r) => !r.driverInside).length,
    eveningShare: onCreek.length ? rescuedEvenings.length / onCreek.length : null, eveningWilson: w,
    onEpisodes: onEps.map((e) => ({ seed: e.seed, firstDay: e.firstDay, lastDay: e.lastDay, evenings: e.evenings.length })),
    unclassifiedOff: offUnc, unclassifiedOn: onUnc,
    errsOff: offErrs, errsOn: onErrs, errListOff: offErrList, errListOn: onErrList,
    otherRefusedOff: otherRefused(off), otherRefusedOn: otherRefused(on),
    carries, bridgeSkips, bridgeOutcomes, floorFeasibleOn: floorFeas,
    deathsOff: offDeaths.length, deathsOn: onDeaths.length, deathsOffList: offDeaths, deathsOnList: onDeaths,
    deathsAllOff: offDeathsAll.all.length, deathsAllOn: onDeathsAll.all.length,
    divergence: div, divergenceOk: divOk,
    honestyFails: honestFails, honestyVacuous: stillRefusedOn.length === 0, stillRefusedOnCount: stillRefusedOn.length,
    rescueDisagree: rescueDisagree.map((r) => ({ seed: r.seed, loopDay: r.loopDay, wrapper: r.wrapperRescued, driver: r.driverAtHaven })),
    insideOff, insideOn,
    medianSurvivalOff: survOff, medianSurvivalOn: survOn,
    survivalOff: Object.fromEntries(Object.entries(off).map(([k, v]) => [k, { daysAlive: v.daysAlive, endReason: v.endReason }])),
    survivalOn: Object.fromEntries(Object.entries(on).map(([k, v]) => [k, { daysAlive: v.daysAlive, endReason: v.endReason }])),
    onCreek: onCreek.map((r) => ({ seed: r.seed, loopDay: r.loopDay, rescued: r.driverAtHaven, inside: r.driverInside, bridge: r.bridge, retry: r.retry, entry: r.entryOutcome })),
    offCreek: offCreek.map((r) => ({ seed: r.seed, loopDay: r.loopDay, bridge: r.bridge })),
  };
  console.log(JSON.stringify(report, null, 2));
  console.log('--- SUMMARY ---');
  console.log(`PRIMARY episodes OFF=${judged.length} rescued=${epsRescued} rate=${epRate === null ? 'n/a' : epRate.toFixed(3)} wilson=[${epWilson.lo === null ? 'n/a' : epWilson.lo.toFixed(3)},${epWilson.hi === null ? 'n/a' : epWilson.hi.toFixed(3)}]`);
  console.log(`SECONDARY evening share ON=${onCreek.length} rescued=${rescuedEvenings.length} share=${report.eveningShare === null ? 'n/a' : report.eveningShare.toFixed(3)} creek OFF=${offCreek.length}`);
  console.log(`unclassified OFF=${offUnc.n} ON=${onUnc.n} errs OFF=${offErrs} ON=${onErrs} divergenceOk=${divOk} honestyFails=${honestFails.length} honestyVacuous=${report.honestyVacuous} rescueDisagree=${rescueDisagree.length}`);
  console.log(`carries acted=${carries.actedCount} skips=${JSON.stringify(carries.skips)} bridgeSkips=${JSON.stringify(bridgeSkips)} bridgeOutcomes=${JSON.stringify(bridgeOutcomes)}`);
  console.log(`inside OFF=${insideOff.n} ON=${insideOn.n} medianSurvival OFF=${survOff} ON=${survOn} playerDeaths OFF=${offDeaths.length} ON=${onDeaths.length} allDeaths OFF=${offDeathsAll.all.length} ON=${onDeathsAll.all.length}`);
}

if (require.main === module) main();
module.exports = { wilson, loadDir, creekEvenings, episodes, judgeEpisode, divergenceAudit };
