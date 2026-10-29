#!/usr/bin/env node
// analyze-blocktype-b.js — refused-evening blockage census analyzer
// (sim-blocktype-b; prereg: evidence/2026-10-29/
// sim-blocktype-b-prereg.md).
//
//   node scripts/analyze-blocktype-b.js --dir <corpus-dir>
//     [--out <json>] [--diff-off <dir> --diff-on <dir>]
//     [--seeds 12001,12002]
//
// Census mode: per-seed + pooled tables — refused evenings by
// blockage type, route-around coverage (covered = BFS route
// exists; uncovered = no route), distinct blocked tiles,
// consecutive-day episodes, unclassified count, outcome
// partition. A refused evening is CLASSIFIED iff its blocktype
// record exists, has a non-null blockType, probeAgrees, and no
// error field (prereg definition).
//
// Diff mode (--diff-off/--diff-on): OFF vs ON deep-equal
// check (G-deep-equal): evening + morning rows with the
// `blocktype`/`blocktypeErrs` fields stripped must be
// deep-equal, as must daysAlive/endReason/deaths. Any diff
// is a recorder perturbation and invalidates the census.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { isClassified } = require('./policies/blocktype-diag');

function parseArgs(argv) {
  const o = { dir: null, out: null, diffOff: null, diffOn: null, seeds: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir') o.dir = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--diff-off') o.diffOff = argv[++i];
    else if (a === '--diff-on') o.diffOn = argv[++i];
    else if (a === '--seeds') o.seeds = argv[++i].split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isFinite);
  }
  return o;
}

function loadCorpus(dir, seeds) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const rows = [];
  for (const f of files) {
    const m = /-s(\d+)\.json$/.exec(f);
    if (!m) continue;
    const seed = parseInt(m[1], 10);
    if (seeds && !seeds.includes(seed)) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  rows.sort((a, b) => a.seed - b.seed);
  return rows;
}

function analyzeSeed(inst) {
  const evenings = inst.evenings || [];
  const partition = {};
  for (const e of evenings) partition[e.eveningOutcome || 'missing'] = (partition[e.eveningOutcome || 'missing'] || 0) + 1;
  const refused = evenings.filter((e) => e.eveningOutcome === 'travel-refused');
  const byType = {};
  const uncovered = [];
  const tiles = {};
  let classified = 0, unclassified = 0;
  const unclassifiedList = [];
  for (const e of refused) {
    const bt = e.blocktype || null;
    if (bt && isClassified(bt)) {
      classified++;
      const t = bt.blockType;
      byType[t] = byType[t] || { refused: 0, covered: 0, uncovered: 0, lengths: [], tiles: {} };
      byType[t].refused++;
      const key = bt.blockedTile ? (bt.blockedTile.x + ',' + bt.blockedTile.y) : 'null';
      byType[t].tiles[key] = (byType[t].tiles[key] || 0) + 1;
      tiles[key] = tiles[key] || { type: t, count: 0 };
      tiles[key].count++;
      if (bt.routeAroundLength !== null && bt.routeAroundLength !== undefined) {
        byType[t].covered++;
        byType[t].lengths.push(bt.routeAroundLength);
      } else {
        byType[t].uncovered++;
        uncovered.push({ seed: inst.seed, loopDay: e.loopDay, departure: bt.departure || null, blockedTile: bt.blockedTile, type: t });
      }
    } else {
      unclassified++;
      unclassifiedList.push({
        seed: inst.seed, loopDay: e.loopDay,
        hasRecord: !!bt, blockType: bt ? bt.blockType : null,
        probeAgrees: bt ? !!bt.probeAgrees : null,
        probeError: bt ? bt.probeError : 'no-record',
        routeAroundError: bt ? bt.routeAroundError : null,
        hopReturnKind: e.travel ? e.travel.hopReturnKind : null,
      });
    }
  }
  // Consecutive-day refused episodes (by loopDay runs).
  const days = refused.map((e) => e.loopDay).sort((a, b) => a - b);
  const episodes = [];
  for (const d of days) {
    const last = episodes[episodes.length - 1];
    if (last && d === last.end + 1) last.end = d;
    else episodes.push({ start: d, end: d });
  }
  const episodeLens = episodes.map((ep) => ep.end - ep.start + 1);
  return {
    seed: inst.seed, daysAlive: inst.daysAlive, endReason: inst.endReason,
    maxWaveUnlocked: inst.maxWaveUnlocked,
    evenings: evenings.length, partition,
    refused: refused.length, classified, unclassified, unclassifiedList,
    byType, uncovered, tiles,
    episodes: episodeLens.length, episodeLenMean: episodeLens.length ? (episodeLens.reduce((a, b) => a + b, 0) / episodeLens.length) : 0,
    episodeLenMax: episodeLens.length ? Math.max(...episodeLens) : 0,
    recorderErrs: (inst.evenings || []).reduce((m, e) => Math.max(m, e.blocktypeErrs || 0), 0),
  };
}

function pool(seedRows) {
  const byType = {};
  const uncovered = [];
  const unclassifiedList = [];
  let refused = 0, classified = 0, unclassified = 0, evenings = 0;
  const partition = {};
  for (const s of seedRows) {
    refused += s.refused; classified += s.classified; unclassified += s.unclassified;
    evenings += s.evenings;
    for (const [k, v] of Object.entries(s.partition)) partition[k] = (partition[k] || 0) + v;
    for (const u of s.unclassifiedList) unclassifiedList.push(u);
    for (const u of s.uncovered) uncovered.push(u);
    for (const [t, v] of Object.entries(s.byType)) {
      byType[t] = byType[t] || { refused: 0, covered: 0, uncovered: 0, lengths: [], tiles: {} };
      byType[t].refused += v.refused; byType[t].covered += v.covered; byType[t].uncovered += v.uncovered;
      byType[t].lengths.push(...v.lengths);
      for (const [k, c] of Object.entries(v.tiles)) byType[t].tiles[k] = (byType[t].tiles[k] || 0) + c;
    }
  }
  return { seeds: seedRows.length, evenings, partition, refused, classified, unclassified, unclassifiedList, byType, uncovered };
}

function stripForDiff(inst) {
  const evenings = (inst.evenings || []).map((e) => {
    const c = Object.assign({}, e);
    delete c.blocktype; delete c.blocktypeErrs;
    return c;
  });
  const mornings = (inst.mornings || []).map((m) => Object.assign({}, m));
  return {
    seed: inst.seed, daysAlive: inst.daysAlive, endReason: inst.endReason,
    gameDays: inst.gameDays, maxWaveUnlocked: inst.maxWaveUnlocked,
    waveKills: inst.waveKills, deaths: inst.deaths, evenings, mornings,
  };
}

function diffCorpora(offDir, onDir, seeds) {
  const off = loadCorpus(offDir, seeds);
  const on = loadCorpus(onDir, seeds);
  const diffs = [];
  const offBySeed = new Map(off.map((r) => [r.seed, r]));
  for (const onRow of on) {
    const offRow = offBySeed.get(onRow.seed);
    if (!offRow) { diffs.push({ seed: onRow.seed, kind: 'missing-off' }); continue; }
    const a = JSON.stringify(stripForDiff(offRow));
    const b = JSON.stringify(stripForDiff(onRow));
    if (a !== b) {
      // Locate the first differing evening/morning for the report.
      const sa = stripForDiff(offRow), sb = stripForDiff(onRow);
      let where = 'header';
      if (JSON.stringify(sa.evenings) !== JSON.stringify(sb.evenings)) {
        where = 'evenings';
        for (let i = 0; i < Math.max(sa.evenings.length, sb.evenings.length); i++) {
          if (JSON.stringify(sa.evenings[i]) !== JSON.stringify(sb.evenings[i])) { where = 'evenings[' + i + ']'; break; }
        }
      } else if (JSON.stringify(sa.mornings) !== JSON.stringify(sb.mornings)) where = 'mornings';
      else if (JSON.stringify(sa.deaths) !== JSON.stringify(sb.deaths)) where = 'deaths';
      diffs.push({ seed: onRow.seed, kind: 'diff', where });
    }
  }
  for (const offRow of off) if (!on.some((r) => r.seed === offRow.seed)) diffs.push({ seed: offRow.seed, kind: 'missing-on' });
  return { offSeeds: off.map((r) => r.seed), onSeeds: on.map((r) => r.seed), diffs };
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  const out = {};
  if (o.diffOff && o.diffOn) out.diff = diffCorpora(o.diffOff, o.diffOn, o.seeds);
  if (o.dir) {
    const corpus = loadCorpus(o.dir, o.seeds);
    const seedRows = corpus.map(analyzeSeed);
    out.perSeed = seedRows;
    out.pooled = pool(seedRows);
  }
  const text = JSON.stringify(out, null, 2);
  if (o.out) fs.writeFileSync(o.out, text);
  console.log(text);
}

if (require.main === module) main();
module.exports = { loadCorpus, analyzeSeed, pool, stripForDiff, diffCorpora };
