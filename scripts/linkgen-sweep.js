#!/usr/bin/env node
// linkgen-sweep.js — regional link-formation + roster-generation decomposition
// (sim-linkgen-a). MEASUREMENT ONLY: event wrappers record but never draw RNG
// and never write game state; no policy or game system is steered. Silent
// runs do NOT override say/sysSay, so they stay byte-identical to the
// harness baseline; transcript runs pass --capture and must match the silent
// run's event sequences (checked by scripts/linkgen-transcript.js).
// Usage:
//   node scripts/linkgen-sweep.js --seeds 76201,76202 --days 200 \
//     --policy leadcourt --outdir evidence/2026-10-30/perseed-linkgen-a-leadcourt
//   node scripts/linkgen-sweep.js --seeds 76201 --policy leadcourt \
//     --outdir /tmp/linkgen-x --capture   (transcript run; writes capturedLines)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { leadcourt } = require('./policies/leadcourt');
const { linkgenSnapshot, classifyProposal } = require('./linkgen-snapshot');

function argVal(name, def) {
  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--' + name && i + 1 < argv.length) return argv[i + 1];
    if (argv[i].indexOf('--' + name + '=') === 0) return argv[i].slice(name.length + 3);
  }
  return def;
}

async function runSeed(seed, opts) {
  opts = opts || {};
  const days = opts.days || 200;
  const capture = opts.capture || null;
  const policyName = opts.policy || 'competent';
  const basePolicy = policyName === 'leadcourt' ? leadcourt : competent;
  const { Game, manifest, loadFails } = await loadGame({ seed: seed, mode: 'linkgen' });
  if (loadFails && loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  const events = { proposals: [], counters: [], catchUps: [], genEvents: [] };
  const instrumentErrors = [];
  await setupGame(Game, 'Columbus, Ohio');
  // ---- wrappers: record only, no RNG, no state writes ----
  const origPropose = Game.proposeLink;
  if (typeof origPropose === 'function') {
    Game.proposeLink = function (targetId, popts) {
      let knowsBefore = false, opinionBefore = 0, linkExistedBefore = false, pendingBefore = null;
      try {
        const ov = (Game._otherVillage ? Game._otherVillage(targetId) : null);
        knowsBefore = !!(ov && Game.knowsVillage && Game.knowsVillage(ov));
        opinionBefore = ov ? (ov.opinion || 0) : 0;
        linkExistedBefore = !!(Game.linkWith && Game.linkWith(targetId));
        pendingBefore = Game.state ? (Game.state.pendingCounter || null) : null;
      } catch (e) { instrumentErrors.push('propose-pre: ' + e.message); }
      let ret = null, threw = null;
      try { ret = origPropose.call(this, targetId, popts); }
      catch (e) { threw = String(e && e.message || e); }
      try {
        events.proposals.push({
          day: ((Game.state || {}).scholar || {}).day || 0,
          targetId: targetId, knowsBefore: knowsBefore, opinionBefore: opinionBefore,
          linkExistedBefore: linkExistedBefore, pendingBefore: !!pendingBefore,
          outcome: threw ? 'THREW' : classifyProposal({
            knowsBefore: knowsBefore, opinionBefore: opinionBefore,
            linkExistedBefore: linkExistedBefore, pendingBefore: pendingBefore, ret: ret,
          }),
          retKind: ret === 'counter' ? 'counter' : (ret && ret.id ? 'link' : 'null'),
          threw: threw,
        });
      } catch (e) { instrumentErrors.push('propose-post: ' + e.message); }
      if (threw) throw new Error(threw);
      return ret;
    };
  } else { instrumentErrors.push('proposeLink missing at wrap time'); }
  const origAnswer = Game.answerCounter;
  if (typeof origAnswer === 'function') {
    Game.answerCounter = function (how) {
      const pendingBefore = Game.state ? (Game.state.pendingCounter || null) : null;
      let ret = null, threw = null;
      try { ret = origAnswer.call(this, how); }
      catch (e) { threw = String(e && e.message || e); }
      try {
        events.counters.push({
          day: ((Game.state || {}).scholar || {}).day || 0, how: how,
          targetId: pendingBefore ? pendingBefore.targetId : null,
          pendingBefore: !!pendingBefore,
          retKind: ret === 'counter' ? 'counter-still' : (ret && ret.id ? 'link' : 'null'),
          threw: threw,
        });
      } catch (e) { instrumentErrors.push('counter-post: ' + e.message); }
      if (threw) throw new Error(threw);
      return ret;
    };
  } else { instrumentErrors.push('answerCounter missing at wrap time'); }
  const origCatchUp = Game.catchUpSim;
  if (typeof origCatchUp === 'function') {
    Game.catchUpSim = function (village, copts) {
      const pre = { generated: !!(village && village.generated), roster: !!(village && village.roster),
        villageDay: (village && village.day) || 0 };
      let px = null, py = null, dist = null, linkedBefore = false;
      try {
        px = (Game.map || {}).px; py = (Game.map || {}).py;
        if (village && px != null) dist = Math.abs((village.x || 0) - px) + Math.abs((village.y || 0) - py);
        linkedBefore = !!(Game.linkWith && village && Game.linkWith(village.id));
      } catch (e) {}
      const scholarDay = ((Game.state || {}).scholar || {}).day || 0;
      let threw = null;
      try { origCatchUp.call(this, village, copts); }
      catch (e) { threw = String(e && e.message || e); }
      try {
        events.catchUps.push({
          day: scholarDay, villageId: village ? village.id : null,
          how: (copts && copts.how) || 'visit', dist: dist,
          linkedBefore: linkedBefore,
          villageDayBefore: pre.villageDay, scholarDay: scholarDay,
          daysToSim: scholarDay - pre.villageDay,
          generatedBefore: pre.generated, rosterBefore: pre.roster,
          generatedAfter: !!(village && village.generated),
          rosterAfter: !!(village && village.roster),
          loreOnlyApproach: !pre.generated && !(village && village.generated),
          threw: threw,
        });
      } catch (e) { instrumentErrors.push('catchup-post: ' + e.message); }
      if (threw) throw new Error(threw);
    };
  } else { instrumentErrors.push('catchUpSim missing at wrap time'); }
  const origGen = Game.genVillageRoster;
  if (typeof origGen === 'function') {
    Game.genVillageRoster = function (village) {
      let ret = null, threw = null;
      try { ret = origGen.call(this, village); }
      catch (e) { threw = String(e && e.message || e); }
      try {
        events.genEvents.push({
          day: ((Game.state || {}).scholar || {}).day || 0,
          villageId: village ? village.id : null,
          rosterSize: village && village.roster ? village.roster.length : 0,
          threw: threw,
        });
      } catch (e) { instrumentErrors.push('gen-post: ' + e.message); }
      if (threw) throw new Error(threw);
      return ret;
    };
  } else { instrumentErrors.push('genVillageRoster missing at wrap time'); }
  if (capture) {
    Game.say = function () { capture.push(Array.prototype.slice.call(arguments).join(' ')); };
    Game.sysSay = function () { capture.push('[SYS] ' + Array.prototype.slice.call(arguments).join(' ')); };
  }
  // ---- daily snapshot ----
  const daily = [];
  let firstLinkDetail = null, peakLinksDetail = null, peakLinks = -1;
  const firstKnown = {};
  let maxRank = 'village', nationalEver = false;
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  const wrapped = Object.assign({}, basePolicy, {
    id: policyName,
    daily: function (G, ctx) {
      try { if (typeof basePolicy.daily === 'function') basePolicy.daily(G, ctx); } catch (e) {}
      try {
        const snap = linkgenSnapshot(G);
        snap.villages.forEach(function (v) {
          if (v.known && !firstKnown[v.id]) {
            firstKnown[v.id] = { day: snap.day, how: v.loreHow, generated: v.generated, deliveredRumor: v.deliveredRumor };
          }
        });
        const rank = (typeof G.scaleRank === 'function') ? (G.scaleRank() || 'village') : 'village';
        if ((RANK[rank] || 0) > (RANK[maxRank] || 0)) maxRank = rank;
        if ((RANK[rank] || 0) >= 2) nationalEver = true;
        const active = snap.links.filter(function (l) { return l.status === 'active'; });
        const linkedGen = active.filter(function (l) { return l.generated; }).length;
        daily.push({
          day: snap.day, links: active.length, linkedGenerated: linkedGen,
          linkedUngenerated: active.length - linkedGen,
          knownVillages: snap.villages.filter(function (v) { return v.known; }).length,
          generatedVillages: snap.villages.filter(function (v) { return v.generated; }).length,
          playerPos: snap.playerPos, rank: rank, errors: snap.errors,
        });
        if (active.length && !firstLinkDetail) firstLinkDetail = { day: snap.day, snap: snap };
        if (active.length > peakLinks) { peakLinks = active.length; peakLinksDetail = { day: snap.day, snap: snap }; }
        if (snap.errors.length) instrumentErrors.push('snap day ' + snap.day + ': ' + snap.errors.join('; '));
      } catch (e) {
        daily.push({ day: ((G.state || {}).scholar || {}).day || 0, instrumentError: String(e && e.message || e) });
        instrumentErrors.push('daily: ' + e.message);
      }
    },
  });
  const result = await runDays(Game, wrapped, { days: days, manifest: manifest });
  let finalSnap = null;
  try { finalSnap = linkgenSnapshot(Game); } catch (e) { finalSnap = { errors: ['final: ' + e.message] }; instrumentErrors.push('final: ' + e.message); }
  let prog = {};
  try { prog = Game.progState ? Game.progState() : {}; } catch (e) {}
  let wave = 1;
  try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const deaths = (result.samples && result.samples.deaths) || [];
  const causeCounts = {};
  deaths.forEach(function (d) { const k = (d && d.cause) || 'unknown'; causeCounts[k] = (causeCounts[k] || 0) + 1; });
  // Per-village rollup from events + snapshots.
  const villageIds = [];
  (Game.state.otherVillages || []).forEach(function (v) { if (v) villageIds.push(v.id); });
  const villages = villageIds.map(function (vid) {
    const fin = (finalSnap.villages || []).find(function (v) { return v.id === vid; }) || null;
    const first = (firstLinkDetail && firstLinkDetail.snap.villages.find(function (v) { return v.id === vid; })) || null;
    const gens = events.genEvents.filter(function (g) { return g.villageId === vid; });
    const cups = events.catchUps.filter(function (c) { return c.villageId === vid; });
    const firstGen = gens.length ? gens[0] : null;
    const genCatch = firstGen ? cups.filter(function (c) { return c.day === firstGen.day; })[0] || null : null;
    const linkDays = (finalSnap.links || []).concat(firstLinkDetail ? firstLinkDetail.snap.links : [])
      .filter(function (l) { return l.villageId === vid; });
    const props = events.proposals.filter(function (p) { return p.targetId === vid; });
    // First-known is tracked in the daily wrapper (firstKnown map above).
    return {
      id: vid, name: fin ? fin.name : null, x: fin ? fin.x : null, y: fin ? fin.y : null,
      final: fin, firstLinkSnap: first,
      firstKnown: firstKnown[vid] || null,
      proposals: props.length,
      proposalOutcomes: props.map(function (p) { return p.outcome; }),
      linkDay: linkDays.length ? Math.min.apply(null, linkDays.map(function (l) { return l.linkDay; })) : null,
      linkedAtEnd: !!((finalSnap.links || []).find(function (l) { return l.villageId === vid && l.status === 'active'; })),
      generatedEver: gens.length > 0,
      firstGenDay: firstGen ? firstGen.day : null,
      firstGenTrigger: genCatch ? { dist: genCatch.dist, how: genCatch.how, linkedBefore: genCatch.linkedBefore } : (firstGen ? 'gen-without-catchup-event' : null),
      catchUpCount: cups.length,
      loreOnlyApproaches: cups.filter(function (c) { return c.loreOnlyApproach; }).length,
      firstCatchUp: cups.length ? cups[0] : null,
      finalGenerated: fin ? fin.generated : false,
      finalRosterSize: fin ? fin.rosterSize : 0,
      finalAliveAdults: fin ? fin.aliveAdults : 0,
    };
  });
  // Instrument completeness: every village generated at end must have a
  // gen event; every gen event must have a same-day catchUp event (the
  // only in-sim caller is catchUpSim).
  villages.forEach(function (v) {
    if (v.finalGenerated && !v.generatedEver) instrumentErrors.push('generated-at-end without gen event: ' + v.id);
    if (v.generatedEver && v.firstGenTrigger === 'gen-without-catchup-event') instrumentErrors.push('gen event without catchUp event: ' + v.id);
  });
  const row = {
    seed: seed, commit: manifest.commit, policy: policyName, daysCap: days,
    gameDays: result.gameDays, daysSimulated: result.days, endReason: result.endReason,
    won: !!Game.won, villageLost: !!Game.villageLost,
    finalRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) { return 'village'; } })(),
    maxRank: maxRank, nationalEver: nationalEver,
    nationalFinal: (function () { try { const r = Game.scaleRank ? Game.scaleRank() : 'village'; return RANK[r] >= 2; } catch (e) { return false; } })(),
    tableWaiting: !!prog.tableWaiting, tableEntered: !!prog.tableDone,
    waveUnlocked: wave, waveKills: result.waveKills || {},
    deathCount: deaths.length, deathCauses: causeCounts,
    proposals: events.proposals, counters: events.counters,
    catchUps: events.catchUps, genEvents: events.genEvents,
    villages: villages,
    firstLink: firstLinkDetail ? { day: firstLinkDetail.day, links: firstLinkDetail.snap.links } : null,
    peakLinks: peakLinksDetail ? { day: peakLinksDetail.day, links: peakLinksDetail.snap.links } : null,
    final: finalSnap ? { links: finalSnap.links, villages: finalSnap.villages } : null,
    daily: daily,
    instrumentErrors: instrumentErrors,
  };
  if (capture) row.capturedLines = capture.slice();
  return row;
}

async function main() {
  const seeds = argVal('seeds', '').split(',').filter(Boolean).map(Number);
  if (!seeds.length) { console.error('usage: --seeds 76201,76202 [--days 200] [--policy leadcourt|competent] [--outdir dir] [--capture]'); process.exit(2); }
  const days = Number(argVal('days', '200'));
  const policy = argVal('policy', 'competent');
  const outdir = argVal('outdir', path.join(__dirname, '..', 'evidence', '2026-10-30', 'perseed-linkgen-a'));
  const wantCapture = process.argv.indexOf('--capture') >= 0;
  fs.mkdirSync(outdir, { recursive: true });
  for (const seed of seeds) {
    const t0 = process.hrtime.bigint();
    const captureArr = wantCapture ? [] : null;
    const row = await runSeed(seed, { days: days, policy: policy, capture: captureArr });
    const elapsed = (Number(process.hrtime.bigint() - t0) / 1e9).toFixed(1);
    const fp = path.join(outdir, 's' + seed + '.json');
    fs.writeFileSync(fp, JSON.stringify(row, null, 2));
    const nProp = row.proposals.length;
    const nLinks = row.final ? row.final.links.filter(function (l) { return l.status === 'active'; }).length : 0;
    const nGen = row.genEvents.length;
    console.log('seed ' + seed + ' ' + policy + ': days=' + row.gameDays + ' end=' + row.endReason +
      ' proposals=' + nProp + ' linksEnd=' + nLinks + ' genEvents=' + nGen +
      ' rank=' + row.maxRank + ' wave=' + row.waveUnlocked +
      ' instrErr=' + row.instrumentErrors.length + ' (' + elapsed + 's)');
    if (row.instrumentErrors.length) console.log('  INSTRUMENT ERRORS: ' + row.instrumentErrors.join(' | '));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error('linkgen-sweep FAILED: ' + (e && e.stack || e)); process.exit(1); });
}
module.exports = { runSeed, linkgenSnapshot, classifyProposal };
