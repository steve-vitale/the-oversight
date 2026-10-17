#!/usr/bin/env node
// scripts/armorbreak-analyze.js — read-only classifier over the two existing
// wave-4 corpora (sim-armorbreak, 2026-10-17, axis scale-onramp).
//
// Reads evidence/2026-10-17/perseed-wave4reach/ (32 runs) and
// evidence/2026-10-17/perseed-vetshape/ (32 runs). NO game load, NO sims,
// NO src/js or scripts/policies changes. Outputs:
//   - unlock census: every run with maxWaveUnlocked>=4 (10 total), armor at
//     unlock (bar-level from the corpus), post-unlock survival, binding bar
//   - deferral census: wave4reach bindingSnapshot (last-unready-day short
//     bars) on all 32 runs; vetshape end-state readiness4 short bars only
//     (labeled as end-state, not binding-at-deferral)
//   - wall numbers: national / table / wave-4 unlocks / median survival
//
// Usage: node scripts/armorbreak-analyze.js [--json]
// Exit 0 always (diagnostic, never a gate). Exports classifyCorpora() for the
// proof test (scripts/test-armorbreak-20261017.js).
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17');
const CORPORA = {
  wave4reach: { dir: 'perseed-wave4reach', hasSnapshots: true },
  vetshape: { dir: 'perseed-vetshape', hasSnapshots: false },
};

function loadCorpus(name) {
  const { dir } = CORPORA[name];
  const rows = [];
  for (const f of fs.readdirSync(path.join(EVID, dir)).sort()) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(EVID, dir, f), 'utf8'));
    d._file = f; d._corpus = name;
    rows.push(d);
  }
  return rows;
}

// Armor-coverage class at unlock, bar level (from the corpus itself).
// snap: the last-unready-day bindingSnapshot (wave4reach) or null (vetshape).
function armorAtUnlock(row, snap) {
  if (snap) return {
    source: 'bindingSnapshot',
    day: snap.day, armored: snap.armored, demand: 4, armorP: 15,
    short: snap.short || [],
    armorMetAtUnlock: !(snap.short || []).includes('armor'),
  };
  const r4 = row.readiness4 || {};
  return {
    source: 'end-state readiness4 (no unlock-day snapshot in corpus)',
    day: null, armored: r4.armored, demand: 4, armorP: 15,
    short: r4.short || [],
    armorMetAtUnlock: 'unknown — no unlock-day snapshot',
  };
}

function classifyUnlockRow(row) {
  const snap = row.bindingSnapshot || null;
  const ac = armorAtUnlock(row, snap);
  const firstW4 = row.firstW4Day;
  const postDays = (firstW4 != null && row.gameDays != null)
    ? row.gameDays - firstW4 : null;
  return {
    corpus: row._corpus, file: row._file,
    arm: row.arm, policyId: row.policyId, seed: row.seed,
    firstW4Day: firstW4,
    bindingBars: row.bindingBars || null,           // short bars at unlock (wave4reach)
    armorAtUnlock: ac,
    endReadiness4: row.readiness4 || null,          // post-unlock armor collapse check
    postUnlockDays: postDays,                        // gameDays - firstW4Day (village clock)
    endReason: row.endReason, gameDays: row.gameDays, harnessDays: row.days,
    won: row.won | 0,
    deathsTotal: row.deaths ? row.deaths.total : null,
    deathsByCause: row.deaths ? row.deaths.byCause : null,
    deathsStarv: row.deaths ? row.deaths.starv : null,
    attributed: true,                                // filled by census for per-villager detail
  };
}

function deferralClass(short) {
  const s = new Set(short || []);
  const armor = s.has('armor'), vet = s.has('veterans');
  if (armor && vet) return 'armor+veterans';
  if (armor) return 'armor-bound';
  if (vet) return 'veterans-bound';
  if (s.size === 0) return 'none (ready at end)';
  return 'other (' + [...s].join('+') + ')';
}

function classifyCorpora() {
  const out = { unlocks: [], deferrals: { wave4reach: [], vetshape: [] }, wall: {} };
  for (const [name] of Object.entries(CORPORA)) {
    const rows = loadCorpus(name);
    const unlocks = rows.filter(r => (r.maxWaveUnlocked || 1) >= 4);
    for (const r of unlocks) out.unlocks.push(classifyUnlockRow(r));
    if (name === 'wave4reach') {
      for (const r of rows) {
        const snap = r.bindingSnapshot;
        out.deferrals.wave4reach.push({
          file: r._file, arm: r.arm, policyId: r.policyId, seed: r.seed,
          maxWave: r.maxWaveUnlocked || 1,
          snapshotDay: snap ? snap.day : null,
          counts: snap ? { armored: snap.armored, armed: snap.armed, tricks: snap.tricks, veterans: snap.veterans } : null,
          short: snap ? snap.short : null,
          deferralClass: snap ? deferralClass(snap.short) : 'no snapshot recorded',
        });
      }
    } else {
      for (const r of rows) {
        const r4 = r.readiness4 || {};
        out.deferrals.vetshape.push({
          file: r._file, arm: r.arm, policyId: r.policyId, seed: r.seed,
          maxWave: r.maxWaveUnlocked || 1,
          endShort: r4.short || null,
          endClass: deferralClass(r4.short),
          note: 'end-state only — corpus carries no deferral snapshots',
        });
      }
    }
    // Wall numbers per corpus per arm.
    const wall = {};
    for (const arm of ['control', 'armed']) {
      const rs = rows.filter(r => r.arm === arm);
      const nat = rs.reduce((t, r) => t + (r.reachedNational | 0), 0);
      const hasNat = rs.some(r => r.reachedNational != null);
      const w4 = rs.filter(r => (r.maxWaveUnlocked || 1) >= 4).length;
      const table = rs.filter(r => (r.won | 0) === 1).length;
      const ds = rs.map(r => r.gameDays).filter(Number.isFinite).sort((a, b) => a - b);
      const lost = rs.filter(r => r.endReason === 'village-lost').length;
      wall[arm] = { n: rs.length, national: hasNat ? nat : 'n/a (not recorded)',
        table, w4unlocks: w4, medianGameDays: ds.length ? ds[Math.floor(ds.length / 2)] : null,
        villageLost: lost };
    }
    out.wall[name] = wall;
  }
  return out;
}

function mdTable(rows, cols) {
  const head = '| ' + cols.join(' | ') + ' |';
  const sep = '|' + cols.map(() => '---').join('|') + '|';
  const body = rows.map(r => '| ' + cols.map(c => String(r[c] == null ? '' : r[c])).join(' | ') + ' |');
  return [head, sep, ...body].join('\n');
}

function main() {
  const o = classifyCorpora();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(o, null, 1)); return; }
  console.log('== sim-armorbreak unlock census (10 runs) ==');
  console.log(mdTable(o.unlocks.map(u => ({
    run: `${u.corpus}/${u.arm}-${u.policyId}-s${u.seed}`,
    w4: u.firstW4Day,
    bind: (u.bindingBars || []).join('+') || '(none recorded)',
    armorSnap: u.armorAtUnlock.source === 'bindingSnapshot'
      ? `${u.armorAtUnlock.armored}/4 @d${u.armorAtUnlock.day} armorMet=${u.armorAtUnlock.armorMetAtUnlock}`
      : `end-state ${u.armorAtUnlock.armored}/4 (${u.armorAtUnlock.source})`,
    endArmor: u.endReadiness4 ? `${u.endReadiness4.armored}/4 short=[${(u.endReadiness4.short || []).join('+')}]` : '',
    postDays: u.postUnlockDays,
    end: u.endReason,
    deaths: u.deathsTotal,
  })), ['run', 'w4', 'bind', 'armorSnap', 'endArmor', 'postDays', 'end', 'deaths']));
  console.log('\n== deferral census: wave4reach (bindingSnapshot, last unready day) ==');
  const tally = {};
  for (const d of o.deferrals.wave4reach) tally[d.deferralClass] = (tally[d.deferralClass] || 0) + 1;
  console.log(JSON.stringify(tally, null, 1));
  console.log('\n== deferral census: vetshape (END-STATE readiness4 only) ==');
  const tally2 = {};
  for (const d of o.deferrals.vetshape) tally2[d.endClass] = (tally2[d.endClass] || 0) + 1;
  console.log(JSON.stringify(tally2, null, 1));
  console.log('\n== wall numbers ==');
  console.log(JSON.stringify(o.wall, null, 1));
  const unatt = o.unlocks.filter(u => !u.attributed).length;
  console.log(`\nattribution: ${o.unlocks.length - unatt}/${o.unlocks.length} unlock runs classified, ${unatt} unattributed`);
}

if (require.main === module) main();
module.exports = { classifyCorpora, loadCorpus, deferralClass };
