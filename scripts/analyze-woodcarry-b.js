#!/usr/bin/env node
// analyze-woodcarry-b.js — judge sim-woodcarry-b legs against
// the prereg (evidence/2026-10-29/sim-woodcarry-b-prereg.md).
// Usage: node scripts/analyze-woodcarry-b.js <offDir> <onDir>
// Prints a JSON report + a human summary. Exits 0; the proof
// script (scripts/test-woodcarry-b.js) asserts the GO bars.
'use strict';
const fs = require('fs');
const path = require('path');

function wilson(k, n) {
  if (n === 0) return { lo: null, hi: null };
  const z = 1.96, p = k / n, d = 1 + (z * z) / n;
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

// A creek evening, from the wrapper record + driver row.
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
    // Carries live in the store summary only as a count; the
    // per-day carry records are on evening rows (woodcarryCarry
    // = the morning carry of that loop-day).
    for (const e of (inst.evenings || [])) {
      const c = e.woodcarryCarry;
      if (!c) continue;
      if (c.acted) acted.push({ seed: Number(seed), loopDay: c.loopDay, took: c.took, woodBefore: c.woodBefore, woodAfter: c.woodAfter, pileBefore: c.pileBefore, pileAfter: c.pileAfter, kcal: c.kcal });
      else skips[c.skip || 'unknown'] = (skips[c.skip || 'unknown'] || 0) + 1;
    }
  }
  return { acted, actedCount: acted.length, skips };
}

function episodes(rows) {
  // Maximal runs of consecutive loop-days per seed.
  const bySeed = {};
  for (const r of rows) (bySeed[r.seed] = bySeed[r.seed] || []).push(r);
  const eps = [];
  for (const seed of Object.keys(bySeed).sort((a, b) => a - b)) {
    const rs = bySeed[seed].sort((a, b) => a.loopDay - b.loopDay);
    let cur = null;
    for (const r of rs) {
      if (!cur || r.loopDay !== cur.lastDay + 1) {
        if (cur) eps.push(cur);
        cur = { seed: Number(seed), firstDay: r.loopDay, lastDay: r.loopDay, evenings: [r], firstRescued: !!r.driverAtHaven };
      } else {
        cur.lastDay = r.loopDay; cur.evenings.push(r);
      }
    }
    if (cur) eps.push(cur);
  }
  return eps;
}

function deathsOf(corpus) {
  // Prereg guard counts PLAYER deaths only (death.player true);
  // runDays samples mix villager + monster deaths.
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

// Divergence audit: first loop-day where OFF/ON evening rows
// differ (stripped of wc fields + say tails) vs first ON
// lever-action loop-day (carry acted, bridge attempted, or
// narration said).
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
    let firstAction = null;
    for (const e of (onInst.evenings || [])) {
      const c = e.woodcarryCarry;
      if (c && c.acted) { firstAction = c.loopDay; break; }
    }
    if (firstAction === null) {
      for (const e of (onInst.evenings || [])) {
        const wc = e.woodcarry;
        if (wc && (wc.bridge.attempted || wc.narration)) { firstAction = wc.loopDay; break; }
      }
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

function main() {
  const offArg = process.argv[2], onArg = process.argv[3];
  if (!offArg || !onArg) { console.error('usage: analyze-woodcarry-b.js <offDir[,offDir2]> <onDir[,onDir2]>'); process.exit(2); }
  // Multiple dirs (pilot + fallback extension) pool by seed filename.
  const off = Object.assign({}, ...offArg.split(',').map(loadDir));
  const on = Object.assign({}, ...onArg.split(',').map(loadDir));
  const offCreek = creekEvenings(off), onCreek = creekEvenings(on);
  const rescued = onCreek.filter((r) => r.driverAtHaven);
  const w = wilson(rescued.length, onCreek.length);
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
  const eps = episodes(onCreek);
  const epsRescued = eps.filter((e) => e.firstRescued).length;
  const offDeathsAll = deathsOf(off), onDeathsAll = deathsOf(on);
  const offDeaths = offDeathsAll.player, onDeaths = onDeathsAll.player;
  const div = divergenceAudit(off, on);
  const divOk = Object.values(div).every((d) => d.ok);
  const honestFails = honestyCheck(onCreek);
  // Wrapper-vs-driver rescue agreement.
  const rescueDisagree = onCreek.filter((r) => r.wrapperRescued !== null && r.wrapperRescued !== r.driverAtHaven);
  const perSeedOff = {}, perSeedOn = {};
  for (const r of offCreek) perSeedOff[r.seed] = (perSeedOff[r.seed] || 0) + 1;
  for (const r of onCreek) perSeedOn[r.seed] = (perSeedOn[r.seed] || 0) + 1;
  const report = {
    seedsOff: Object.keys(off).sort(), seedsOn: Object.keys(on).sort(),
    creekOff: offCreek.length, perSeedOff, creekOn: onCreek.length, perSeedOn,
    rescued: rescued.length, rescuedInside: rescued.filter((r) => r.driverInside).length,
    rescuedOutsideAtHaven: rescued.filter((r) => !r.driverInside).length,
    share: onCreek.length ? rescued.length / onCreek.length : null, wilson: w,
    unclassifiedOff: offUnc, unclassifiedOn: onUnc,
    errsOff: offErrs, errsOn: onErrs, errListOff: offErrList, errListOn: onErrList,
    otherRefusedOff: otherRefused(off), otherRefusedOn: otherRefused(on),
    carries, bridgeSkips, bridgeOutcomes, floorFeasibleOn: floorFeas,
    episodes: eps.map((e) => ({ seed: e.seed, firstDay: e.firstDay, lastDay: e.lastDay, evenings: e.evenings.length, firstRescued: e.firstRescued })),
    episodeRescue: eps.length ? epsRescued / eps.length : null, episodeCount: eps.length, episodesRescued: epsRescued,
    deathsOff: offDeaths.length, deathsOn: onDeaths.length, deathsOffList: offDeaths, deathsOnList: onDeaths,
    deathsAllOff: offDeathsAll.all.length, deathsAllOn: onDeathsAll.all.length,
    divergence: div, divergenceOk: divOk,
    honestyFails: honestFails, rescueDisagree: rescueDisagree.map((r) => ({ seed: r.seed, loopDay: r.loopDay, wrapper: r.wrapperRescued, driver: r.driverAtHaven })),
    onCreek: onCreek.map((r) => ({ seed: r.seed, loopDay: r.loopDay, rescued: r.driverAtHaven, inside: r.driverInside, bridge: r.bridge, retry: r.retry, entry: r.entryOutcome })),
  };
  console.log(JSON.stringify(report, null, 2));
  console.log('--- SUMMARY ---');
  console.log(`creek OFF=${offCreek.length} ON=${onCreek.length} rescued=${rescued.length} share=${report.share === null ? 'n/a' : report.share.toFixed(3)} wilson=[${w.lo === null ? 'n/a' : w.lo.toFixed(3)},${w.hi === null ? 'n/a' : w.hi.toFixed(3)}]`);
  console.log(`unclassified OFF=${offUnc.n} ON=${onUnc.n} errs OFF=${offErrs} ON=${onErrs} divergenceOk=${divOk} honestyFails=${honestFails.length} rescueDisagree=${rescueDisagree.length}`);
  console.log(`carries acted=${carries.actedCount} skips=${JSON.stringify(carries.skips)} bridgeSkips=${JSON.stringify(bridgeSkips)} bridgeOutcomes=${JSON.stringify(bridgeOutcomes)}`);
  console.log(`episodes=${eps.length} episodeRescue=${report.episodeRescue === null ? 'n/a' : report.episodeRescue.toFixed(3)} playerDeaths OFF=${offDeaths.length} ON=${onDeaths.length} allDeaths OFF=${offDeathsAll.all.length} ON=${onDeathsAll.all.length}`);
}

if (require.main === module) main();
module.exports = { wilson, loadDir, creekEvenings, divergenceAudit };
