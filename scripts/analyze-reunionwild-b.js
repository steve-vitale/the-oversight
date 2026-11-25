// analyze-reunionwild-b.js — join the wilddeath death numerator to the
// bloodcluster contact denominator (both landed corpora, read-only).
// Pure JSON join: no game harness, no new sims.
// Usage: node scripts/analyze-reunionwild-b.js
//   [--bc-dir evidence/2026-11-24/perseed-bloodcluster-b]
//   [--wd-dir evidence/2026-11-24/perseed-wilddeath-b]
// Prints the by-kind kills-per-contact table, the Reunion rate ratio
// vs the pooled other wave-4 kinds (>=5 TB contacts), and the frozen
// bar checks. Exit 0 on a clean join (bars are judged by the reader
// against the prereg, not by this script's exit code).
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readDir(dir, pred) {
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json') && pred(f))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function isBcV2(f) { return f.includes('-bloodcluster-b-v2.json'); }
function isWd(f) { return f.includes('-wilddeath-b.json'); }

// Null-wave monster ids are fight adds (e.g. focus_group_eye), not kinds.
function deathKinds(pd) {
  const ids = (pd.tb && pd.tb.monsterIds) || [];
  const waves = (pd.tb && pd.tb.monsterWaves) || [];
  const kinds = new Set();
  for (let i = 0; i < ids.length; i++) {
    if (waves[i] != null && ids[i] != null) kinds.add(ids[i]);
  }
  return Array.from(kinds).sort();
}

function analyze(opts) {
  opts = opts || {};
  const bcDir = opts.bcDir || path.join(ROOT, 'evidence/2026-11-24/perseed-bloodcluster-b');
  const wdDir = opts.wdDir || path.join(ROOT, 'evidence/2026-11-24/perseed-wilddeath-b');
  const bc = readDir(bcDir, isBcV2);
  const wd = readDir(wdDir, isWd);

  const out = {
    bcFiles: bc.length, wdFiles: wd.length,
    bcSeeds: bc.map((d) => d.seed), wdSeeds: wd.map((d) => d.seed),
    deaths: [], unclassified: [], multiKind: [],
    deathsByKind: {}, tbContactsByKind: {}, fieldContactsByKind: {},
    tbRefusedW4: 0, tbStartsW4: 0, fieldW4: 0,
    bcScholarWildDeaths: 0, bcDays: 0, wdDays: 0,
    regDeathsWildPlayer: 0, playerDeathsTotal: 0,
  };

  // --- numerator: wild deaths ---
  for (const d of wd) {
    out.wdDays += d.days | 0;
    out.playerDeathsTotal += (d.playerDeaths || []).length;
    for (const r of (d.regDeaths || [])) {
      if (r.cause === 'the wild' && r.player) out.regDeathsWildPlayer++;
    }
    for (const pd of (d.playerDeaths || [])) {
      if (pd.causeArg !== 'the wild') continue;
      if (!pd.hasTbEnd) { out.unclassified.push({ seed: d.seed, day: pd.day, reason: 'wild death without tbEnd' }); continue; }
      if (pd.tb && pd.tb.arenaContest) { out.unclassified.push({ seed: d.seed, day: pd.day, reason: 'wild death flagged arenaContest' }); continue; }
      const kinds = deathKinds(pd);
      if (kinds.length === 0) {
        out.unclassified.push({ seed: d.seed, day: pd.day, reason: 'no non-null-wave monster kind in tb.monsterIds', monsterIds: (pd.tb && pd.tb.monsterIds) || [] });
        continue;
      }
      if (kinds.length > 1) out.multiKind.push({ seed: d.seed, day: pd.day, kinds: kinds });
      const rec = { seed: d.seed, day: pd.day, kinds: kinds };
      out.deaths.push(rec);
      for (const k of kinds) out.deathsByKind[k] = (out.deathsByKind[k] || 0) + 1;
    }
  }

  // --- denominator: bloodcluster contacts ---
  for (const d of bc) {
    out.bcDays += d.days | 0;
    for (const r of (d.deathEvents || [])) {
      if (r.player && r.cause === 'the wild') out.bcScholarWildDeaths++;
    }
    for (const r of (d.fieldFights || [])) {
      if ((r.wave | 0) >= 4) {
        out.fieldW4++;
        if (r.outcome !== 'alreadyDead') out.fieldContactsByKind[r.mid] = (out.fieldContactsByKind[r.mid] || 0) + 1;
      }
    }
    for (const r of (d.tbStarts || [])) {
      if ((r.wave | 0) >= 4) {
        out.tbStartsW4++;
        if (r.rebuilt === false) { out.tbRefusedW4++; continue; }
        out.tbContactsByKind[r.mid] = (out.tbContactsByKind[r.mid] || 0) + 1;
      }
    }
  }
  out.fieldContactsTotal = Object.values(out.fieldContactsByKind).reduce((a, b) => a + b, 0);
  out.tbContactsTotal = Object.values(out.tbContactsByKind).reduce((a, b) => a + b, 0);
  out.pooledContactsTotal = out.fieldContactsTotal + out.tbContactsTotal;

  // --- wave lookup for kinds (from the bloodcluster monster rows; the
  // wilddeath corpus has no roster — wave comes from tb.monsterWaves) ---
  const kindWave = {};
  for (const d of wd) {
    for (const pd of (d.playerDeaths || [])) {
      const ids = (pd.tb && pd.tb.monsterIds) || [];
      const waves = (pd.tb && pd.tb.monsterWaves) || [];
      for (let i = 0; i < ids.length; i++) {
        if (waves[i] != null && ids[i] != null && kindWave[ids[i]] == null) kindWave[ids[i]] = waves[i];
      }
    }
  }
  // Wave-5 kinds seen only in contacts also need a wave: pull from BC rows.
  for (const d of bc) {
    for (const r of (d.tbStarts || []).concat(d.fieldFights || [])) {
      if (r.mid && r.wave != null && kindWave[r.mid] == null) kindWave[r.mid] = r.wave;
    }
  }
  out.kindWave = kindWave;

  // --- rate table, wave-4+ kinds ---
  const kinds = new Set([
    ...Object.keys(out.deathsByKind),
    ...Object.keys(out.tbContactsByKind),
    ...Object.keys(out.fieldContactsByKind),
  ]);
  const table = [];
  for (const k of Array.from(kinds).sort()) {
    const wave = kindWave[k] == null ? null : kindWave[k];
    if (wave != null && wave < 4) continue; // wave-3 and lower: classification only
    const deaths = out.deathsByKind[k] || 0;
    const tb = out.tbContactsByKind[k] || 0;
    const field = out.fieldContactsByKind[k] || 0;
    table.push({
      kind: k, wave: wave, deaths: deaths, tbContacts: tb,
      fieldContacts: field, pooledContacts: tb + field,
      killsPerTbContact: tb > 0 ? deaths / tb : null,
      killsPerPooledContact: (tb + field) > 0 ? deaths / (tb + field) : null,
      killsPerFieldContact: field > 0 ? deaths / field : null,
      lowN: tb < 5, denomZero: tb === 0 && deaths > 0,
    });
  }
  out.table = table;

  // --- rate ratio: Reunion vs pooled other w4 kinds with >=5 TB contacts ---
  const pool = table.filter((r) => r.kind !== 'reunion' && r.tbContacts >= 5);
  const d1 = out.deathsByKind.reunion || 0;
  const c1 = out.tbContactsByKind.reunion || 0;
  const d0 = pool.reduce((a, r) => a + r.deaths, 0);
  const c0 = pool.reduce((a, r) => a + r.tbContacts, 0);
  const rate1 = c1 > 0 ? d1 / c1 : null;
  const rate0 = c0 > 0 ? d0 / c0 : null;
  let rr = null, rrLo = null, rrHi = null;
  if (rate1 != null && rate0 != null && rate0 > 0 && d1 > 0 && d0 > 0) {
    rr = rate1 / rate0;
    const se = Math.sqrt(1 / d1 + 1 / d0 + 1 / c1 + 1 / c0);
    rrLo = Math.exp(Math.log(rr) - 1.96 * se);
    rrHi = Math.exp(Math.log(rr) + 1.96 * se);
  }
  out.rateRatio = {
    reunion: { deaths: d1, contacts: c1, rate: rate1 },
    pooledOthers: { kinds: pool.map((r) => r.kind), deaths: d0, contacts: c0, rate: rate0 },
    rr: rr, ci95: rrLo != null ? [rrLo, rrHi] : null,
  };
  out.interpretation = interpret(rr, rrLo, rrHi);
  return out;
}

function interpret(rr, lo, hi) {
  if (rr == null || lo == null || hi == null) return 'INCONCLUSIVE';
  if (rr > 1.5 && lo > 1.0) return 'OVER-LETHAL';
  if (rr >= 0.67 && rr <= 1.5) return 'PROPORTIONAL';
  if (rr > 1.5) return 'ELEVATED-BUT-UNPROVEN';
  if (rr < 0.67 && hi < 1.0) return 'UNDER-LETHAL';
  return 'INCONCLUSIVE';
}

function fmt(n, digits) {
  if (n == null || !isFinite(n)) return '—';
  return n.toFixed(digits == null ? 2 : digits);
}

function print(a) {
  console.log('sim-reunionwild-b — wild Reunion kills-per-contact join');
  console.log('corpora: bloodcluster v2 files=' + a.bcFiles + ' seeds ' + a.bcSeeds.join(','));
  console.log('         wilddeath files=' + a.wdFiles + ' seeds ' + a.wdSeeds.join(','));
  console.log('wild deaths: ' + a.deaths.length + ' (playerDeaths total ' + a.playerDeathsTotal
    + '; regDeaths wild+player cross-check ' + a.regDeathsWildPlayer + ')');
  console.log('unclassified deaths: ' + a.unclassified.length + '; multi-kind deaths: ' + a.multiKind.length);
  console.log('TB contacts w4+: genuine ' + a.tbContactsTotal + ' + refused ' + a.tbRefusedW4
    + ' = ' + a.tbStartsW4 + ' starts; field w4+ ' + a.fieldContactsTotal
    + '; pooled ' + a.pooledContactsTotal);
  console.log('cross-band scaling: BC scholar wild deaths ' + a.bcScholarWildDeaths + ' / ' + a.bcDays
    + ' days vs WD ' + a.deaths.length + ' / ' + a.wdDays + ' days');
  console.log('');
  console.log('kind         wave  deaths  TB-ct  kills/TB-ct  field-ct  kills/field  pooled-ct  kills/pooled  flag');
  for (const r of a.table) {
    const flag = r.denomZero ? 'DENOM-ZERO' : (r.lowN ? 'LOW-N' : (r.kind === 'reunion' ? 'TARGET' : ''));
    console.log(
      r.kind.padEnd(13) + String(r.wave == null ? '?' : r.wave).padEnd(6)
      + String(r.deaths).padEnd(8) + String(r.tbContacts).padEnd(7)
      + fmt(r.killsPerTbContact).padEnd(13)
      + String(r.fieldContacts).padEnd(10) + fmt(r.killsPerFieldContact).padEnd(13)
      + String(r.pooledContacts).padEnd(11) + fmt(r.killsPerPooledContact).padEnd(14) + flag);
  }
  console.log('');
  const rr = a.rateRatio;
  console.log('Reunion: ' + rr.reunion.deaths + ' deaths / ' + rr.reunion.contacts + ' TB contacts = ' + fmt(rr.reunion.rate));
  console.log('Pooled others (>=5 TB contacts: ' + rr.pooledOthers.kinds.join(', ') + '): '
    + rr.pooledOthers.deaths + ' / ' + rr.pooledOthers.contacts + ' = ' + fmt(rr.pooledOthers.rate));
  console.log('Rate ratio RR = ' + fmt(rr.rr) + '  95% CI [' + fmt(rr.ci95 && rr.ci95[0]) + ', ' + fmt(rr.ci95 && rr.ci95[1]) + ']');
  console.log('Interpretation (frozen ladder): ' + a.interpretation);
}

if (require.main === module) {
  const a = analyze();
  print(a);
}

module.exports = { analyze: analyze, deathKinds: deathKinds, interpret: interpret };
