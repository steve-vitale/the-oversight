// vetkilltale-analyze-20261107.js — judge the vet-tale pilot corpora.
// Pure function over per-seed driver JSON (no game load).
// Eligible repeat kill = a queued vet tale whose killer was alive at the
// night beat (killer not in fallen with death day <= queue day). The
// beat marks every untold tale told-or-moot the same night it is queued,
// so death-day <= queue-day is the exact moot test.
// Also asserts trajectory identity baseline-vs-armed per seed (days,
// endReason, waveKillLog, first-tale count) — the lever is
// narration-only, so the trajectories must match exactly.
// Usage: node scripts/vetkilltale-analyze-20261107.js <baseline-glob...> -- <armed-glob...>
// Prints a JSON verdict + human summary. Exit 1 on instrument errors or
// a trajectory mismatch.
'use strict';
const fs = require('fs');
const path = require('path');

function loadGlob(files) {
  const out = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    out.push(d);
  }
  return out.sort((a, b) => a.seed - b.seed);
}

function judgeLeg(rows, label) {
  let eligible = 0, told = 0, queued = 0, moot = 0;
  const perSeed = [];
  for (const r of rows) {
    const fallen = r.fallen || [];
    const deadBy = {};
    for (const f of fallen) { if (f && f.villagerId) deadBy[f.villagerId] = f.day; }
    const vetQ = (r.queueEvents || []).filter(e => e.kind === 'vet');
    queued += vetQ.length;
    let eSeed = 0, tSeed = 0, mSeed = 0;
    for (const q of vetQ) {
      const dd = deadBy[q.killer];
      if (dd !== undefined && dd <= q.day) { moot++; mSeed++; continue; }
      eligible++; eSeed++;
    }
    // told = vet tales in the log + vet tele events (they must agree)
    const logTold = (r.vetKillerTaleLog || []).length;
    const teleTold = (r.teleEvents || []).filter(e => e.kind === 'vet_killer_tale').length;
    const sayTold = (r.taleLines || []).filter(e => e.kind === 'vet').length;
    told += logTold; tSeed += logTold;
    perSeed.push({ seed: r.seed, days: r.days, endReason: r.endReason, won: !!r.won,
      maxWave: r.maxWave, standing: r.standing, scaleRank: r.scaleRank,
      w4kills: (r.waveKillLog || []).filter(e => (e.w | 0) >= 4).length,
      vetQueued: vetQ.length, vetEligible: eSeed, vetMoot: mSeed,
      vetToldLog: logTold, vetToldTele: teleTold, vetToldSay: sayTold,
      firstTold: (r.killerTaleLog || []).length,
      logTeleAgree: logTold === teleTold, logSayAgree: logTold === sayTold,
      errors: (r.instrumentErrors || []).length });
  }
  return { label, seeds: rows.length, queued, eligible, moot, told,
    rate: eligible ? told / eligible : null, perSeed };
}

function main() {
  const argv = process.argv.slice(2);
  const sep = argv.indexOf('--');
  if (sep < 0) { console.error('usage: vetkilltale-analyze-20261107.js <baseline files...> -- <armed files...>'); process.exit(2); }
  const base = judgeLeg(loadGlob(argv.slice(0, sep)), 'baseline');
  const armed = judgeLeg(loadGlob(argv.slice(sep + 1)), 'armed');
  let failures = [];
  for (const row of base.perSeed.concat(armed.perSeed)) {
    if (!row.logTeleAgree) failures.push(`seed ${row.seed}: vet log/tele disagree (${row.vetToldLog} vs ${row.vetToldTele})`);
    if (!row.logSayAgree) failures.push(`seed ${row.seed}: vet log/say disagree (${row.vetToldLog} vs ${row.vetToldSay})`);
    if (row.errors) failures.push(`seed ${row.seed}: ${row.errors} instrument errors`);
  }
  // trajectory identity: same seed, same days/endReason/waveKillLog/first tales
  const traj = [];
  for (const b of base.perSeed) {
    const a = armed.perSeed.find(x => x.seed === b.seed);
    if (!a) { failures.push(`seed ${b.seed}: no armed counterpart`); continue; }
    const bRow = loadGlob(argv.slice(0, sep)).find(x => x.seed === b.seed);
    const aRow = loadGlob(argv.slice(sep + 1)).find(x => x.seed === b.seed);
    const sameDays = bRow.days === aRow.days;
    const sameEnd = bRow.endReason === aRow.endReason;
    const sameKills = JSON.stringify(bRow.waveKillLog) === JSON.stringify(aRow.waveKillLog);
    const sameFirst = (bRow.killerTaleLog || []).length === (aRow.killerTaleLog || []).length;
    traj.push({ seed: b.seed, sameDays, sameEnd, sameKills, sameFirst });
    if (!sameDays) failures.push(`seed ${b.seed}: days differ baseline ${bRow.days} vs armed ${aRow.days}`);
    if (!sameEnd) failures.push(`seed ${b.seed}: endReason differs (${bRow.endReason} vs ${aRow.endReason})`);
    if (!sameKills) failures.push(`seed ${b.seed}: waveKillLog differs baseline vs armed`);
    if (!sameFirst) failures.push(`seed ${b.seed}: first-tale count differs (${(bRow.killerTaleLog || []).length} vs ${(aRow.killerTaleLog || []).length})`);
  }
  const verdict = {
    baseline: base, armed: armed,
    trajectory: traj,
    go: armed.eligible > 0 && base.told === 0 && armed.rate !== null && armed.rate >= 0.8 && failures.length === 0,
    failures: failures,
  };
  console.log(JSON.stringify(verdict, null, 2));
  console.log(`\nBASELINE: ${base.seeds} seeds, vet queued ${base.queued}, eligible ${base.eligible}, told ${base.told}`);
  console.log(`ARMED: ${armed.seeds} seeds, vet queued ${armed.queued}, eligible ${armed.eligible}, moot ${armed.moot}, told ${armed.told}, rate ${armed.rate === null ? 'n/a (0 eligible)' : (armed.rate * 100).toFixed(1) + '%'}`);
  console.log(`TRAJECTORY: ${traj.filter(t => t.sameDays && t.sameEnd && t.sameKills && t.sameFirst).length}/${traj.length} seeds identical`);
  console.log(failures.length ? `FAILURES: ${failures.length}\n- ${failures.join('\n- ')}` : 'no failures');
  process.exit(failures.length ? 1 : 0);
}
main();
