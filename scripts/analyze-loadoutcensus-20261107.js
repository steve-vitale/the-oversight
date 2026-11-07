// analyze-loadoutcensus-20261107.js — C1 vs P2 keep-5 diff (arm sim-loadoutcensus-b).
// Reads two per-seed census corpora (scripts/loadoutcensus-20261107.js output)
// and prints pooled + per-seed tables plus the prereg GO/NO-GO read.
// Usage: node scripts/analyze-loadoutcensus-20261107.js <c1dir> <p2dir>
'use strict';
const fs = require('fs');
const path = require('path');

function loadCorpus(dir) {
  const out = {};
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).forEach(function (f) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  });
  return out;
}

// Pool identity: same villager id + same fullPool set in both corpora?
// A data-only retune must not move the pools (RNG stream identical); any
// mismatch is reported, not silently averaged away.
function checkPoolIdentity(c1, p2) {
  const mismatches = [];
  Object.keys(c1).forEach(function (seed) {
    const a = c1[seed], b = p2[seed];
    if (!b) { mismatches.push({ seed: seed, why: 'missing-p2' }); return; }
    const byId = {};
    (b.villagers || []).forEach(function (v) { byId[v.id] = v; });
    (a.villagers || []).forEach(function (v) {
      const w = byId[v.id];
      if (!w) { mismatches.push({ seed: seed, id: v.id, why: 'missing-villager-p2' }); return; }
      const pa = (v.pool || []).map(function (r) { return r.id; }).sort().join(',');
      const pb = (w.pool || []).map(function (r) { return r.id; }).sort().join(',');
      if (pa !== pb) mismatches.push({ seed: seed, id: v.id, name: v.name, why: 'pool-diff', c1: pa, p2: pb });
    });
  });
  return mismatches;
}

function aggregate(corpus) {
  let n = 0;
  const tot = { weaponsKept: 0, toolsKept: 0, armorKept: 0, sentimentalKept: 0, weaponsStashed: 0, toolsStashed: 0, armorStashed: 0, hasMelee: 0, hasRanged: 0, armorPiecesEquipped: 0, keptItems: 0 };
  const perSeed = {};
  Object.keys(corpus).sort().forEach(function (seed) {
    const c = corpus[seed];
    const vs = c.villagers || [];
    const s = { n: vs.length, weaponsKept: 0, toolsKept: 0, armorKept: 0, sentimentalKept: 0, weaponsStashed: 0, hasMelee: 0 };
    vs.forEach(function (v) {
      const sm = v.summary || {};
      n++;
      ['weaponsKept', 'toolsKept', 'armorKept', 'sentimentalKept', 'weaponsStashed', 'toolsStashed', 'armorStashed', 'hasMelee', 'hasRanged', 'armorPiecesEquipped'].forEach(function (f) { tot[f] += (sm[f] || 0); s[f] = (s[f] || 0) + (sm[f] || 0); });
      tot.keptItems += (v.kept || []).length;
    });
    s.meanWeaponsKept = vs.length ? +(s.weaponsKept / vs.length).toFixed(2) : null;
    s.meanArmorKept = vs.length ? +(s.armorKept / vs.length).toFixed(2) : null;
    s.armorShare = tot.keptItems && vs.length ? +((s.armorKept / (vs.length * 5))).toFixed(3) : null;
    perSeed[seed] = s;
  });
  return {
    villagers: n,
    meanWeaponsKept: n ? +(tot.weaponsKept / n).toFixed(3) : null,
    meanToolsKept: n ? +(tot.toolsKept / n).toFixed(3) : null,
    meanArmorKept: n ? +(tot.armorKept / n).toFixed(3) : null,
    meanSentimentalKept: n ? +(tot.sentimentalKept / n).toFixed(3) : null,
    armorKeptShare: tot.keptItems ? +(tot.armorKept / tot.keptItems).toFixed(3) : null,
    weaponsStashedTotal: tot.weaponsStashed,
    toolsStashedTotal: tot.toolsStashed,
    armorStashedTotal: tot.armorStashed,
    equippedMeleeRate: n ? +(tot.hasMelee / n).toFixed(3) : null,
    equippedRangedRate: n ? +(tot.hasRanged / n).toFixed(3) : null,
    meanArmorPiecesEquipped: n ? +(tot.armorPiecesEquipped / n).toFixed(2) : null,
    perSeed: perSeed,
  };
}

// Per-villager keep-5 diffs: who changed keeps, and what swapped.
function diffKeeps(c1, p2) {
  const changed = [];
  let nChanged = 0, nSame = 0;
  Object.keys(c1).sort().forEach(function (seed) {
    const a = c1[seed], b = p2[seed];
    if (!b) return;
    const byId = {};
    (b.villagers || []).forEach(function (v) { byId[v.id] = v; });
    (a.villagers || []).forEach(function (v) {
      const w = byId[v.id];
      if (!w) return;
      const ka = (v.kept || []).map(function (r) { return r.id; }).sort().join(',');
      const kb = (w.kept || []).map(function (r) { return r.id; }).sort().join(',');
      if (ka === kb) { nSame++; return; }
      nChanged++;
      const inA = {}, inB = {};
      (v.kept || []).forEach(function (r) { inA[r.id] = r; });
      (w.kept || []).forEach(function (r) { inB[r.id] = r; });
      const out = (v.kept || []).filter(function (r) { return !inB[r.id]; }).map(function (r) { return r.id + ' (' + r.kind + ', scoreDet ' + r.keepScoreDet + ')'; });
      const inn = (w.kept || []).filter(function (r) { return !inA[r.id]; }).map(function (r) { return r.id + ' (' + r.kind + ', scoreDet ' + r.keepScoreDet + ')'; });
      changed.push({ seed: seed, name: v.name, occupation: v.occupation, out: out, in: inn });
    });
  });
  return { nChanged: nChanged, nSame: nSame, changed: changed };
}

function main() {
  const c1dir = process.argv[2], p2dir = process.argv[3];
  if (!c1dir || !p2dir) { console.error('Usage: node scripts/analyze-loadoutcensus-20261107.js <c1dir> <p2dir>'); process.exit(2); }
  const c1 = loadCorpus(c1dir), p2 = loadCorpus(p2dir);
  const pools = checkPoolIdentity(c1, p2);
  const a1 = aggregate(c1), a2 = aggregate(p2);
  const d = diffKeeps(c1, p2);
  const dWeapons = +(a2.meanWeaponsKept - a1.meanWeaponsKept).toFixed(3);
  const dArmorShare = +(a2.armorKeptShare - a1.armorKeptShare).toFixed(3);
  const barA = dWeapons <= -1.0;
  const barB = dArmorShare >= 0.10;
  const verdict = (barA || barB) ? 'DIAG-GO' : 'DIAG-NO-GO';
  console.log(JSON.stringify({
    c1Seeds: Object.keys(c1).length, p2Seeds: Object.keys(p2).length,
    poolIdentityMismatches: pools.length, poolMismatches: pools.slice(0, 5),
    c1: a1, p2: a2,
    deltaMeanWeaponsKept: dWeapons, deltaArmorKeptShare: dArmorShare,
    deltaMeanToolsKept: +(a2.meanToolsKept - a1.meanToolsKept).toFixed(3),
    deltaMeanArmorKept: +(a2.meanArmorKept - a1.meanArmorKept).toFixed(3),
    deltaEquippedMeleeRate: +(a2.equippedMeleeRate - a1.equippedMeleeRate).toFixed(3),
    keepChangedVillagers: d.nChanged, keepSameVillagers: d.nSame,
    barA_weaponsDownGe1: barA, barB_armorShareUpGe10pp: barB,
    verdict: verdict,
    swaps: d.changed,
  }, null, 2));
}

if (require.main === module) main();

module.exports = { loadCorpus, checkPoolIdentity, aggregate, diffKeeps };
