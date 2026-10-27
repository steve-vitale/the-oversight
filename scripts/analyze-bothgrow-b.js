#!/usr/bin/env node
// analyze-bothgrow-b.js — paired single-seed case study (CASE-DIAG)
// for sim-bothgrow-b: 9761 Cattail vs 9762 Lamb's Quarters, judged
// ONLY against sim-bothgrow-b-prereg.md (revision (a) from the
// cattailband metric review). Measurement only.
//
// Reads evidence/2026-10-26/sim-bothgrow-b-corpus/*.json (deterministic
// re-run of the spoilvol capture instrument on the lqpersist band
// 9760-9767) and prints: per-seed per-channel inflow / draws /
// sweep-removal / median post-arrival DAY-END stock (snapshot basis
// named in the prereg — never the post-sweep floor), the CASE-DIAG
// legs, (dried)-family ledgers for the two case seeds, bonus
// statistics, violation totals, wall numbers, determinism
// cross-check vs the cattailband corpus (per-seed per-channel inflow
// differences), and the sense block (verbatim spoil voice + day-by-day
// narratives for 9761 Cattail and 9762 LQ). No game code is loaded;
// pure JSON arithmetic over the committed corpus.
//
// Appearance rule (prereg): a channel grows on a seed iff it has >= 1
// inflow record (any door) on that seed in THIS re-run's records,
// counted with the recorder's honesty rules (stock records only when
// kcal > 0; pantryAdd records only when added === true).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.env.CORPUS_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-26', 'sim-bothgrow-b-corpus');
const REF_DIR = process.env.REF_CORPUS_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-26', 'sim-cattailband-b-corpus');
const FOCAL = ["Lamb's Quarters", 'Cattail', 'Burdock'];

function medianOf(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function fmt(n) {
  if (n == null || !Number.isFinite(n)) return String(n);
  return Math.round(n).toLocaleString();
}
function pct(x) { return x == null || !Number.isFinite(x) ? 'n/a' : (x * 100).toFixed(1) + '%'; }

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  return files.map(f => ({ file: f, data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

function channelStats(ps) {
  const m = new Map();
  const get = (c) => {
    if (!m.has(c)) m.set(c, { inflow: 0, inflowRecs: 0, mealDrawn: 0, otherDrawn: 0, sweep: 0, firstDay: null, stocks: [] });
    return m.get(c);
  };
  for (const r of (ps.inflows || [])) {
    if (r.name == null) continue;
    const b = get(String(r.name));
    b.inflowRecs += 1;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    b.inflow += r.kcal || 0;
    if (b.firstDay == null || r.day < b.firstDay) b.firstDay = r.day;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    for (const it of (r.items || [])) {
      if (it.name == null) continue;
      const b = get(String(it.name));
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      if (r.context === 'other') b.otherDrawn += kcal; else b.mealDrawn += kcal;
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    const pan = (sw.removed || {}).pantry || {};
    for (const bc of (pan.byChannel || [])) {
      const b = get(String(bc.channel));
      b.sweep += bc.kcal || 0;
    }
  }
  for (const sd of (ps.spoilDays || [])) {
    for (const ch of (sd.channels || [])) {
      const b = get(String(ch.channel));
      b.stocks.push({ day: sd.day, fresh: ch.freshKcal || 0 });
    }
  }
  for (const b of m.values()) {
    const post = b.stocks.filter(s => b.firstDay != null && s.day >= b.firstDay).map(s => s.fresh);
    b.medianPostStock = medianOf(post);
    b.postN = post.length;
    const first = b.stocks.find(s => b.firstDay != null && s.day < b.firstDay);
    const last = b.stocks[b.stocks.length - 1];
    b.firstStock = first ? first.fresh : 0;
    b.lastStock = last ? last.fresh : 0;
    b.residual = (b.lastStock - b.firstStock) - (b.inflow - b.mealDrawn - b.otherDrawn - b.sweep);
  }
  return m;
}

function dayNarrative(ps, channel) {
  const byDay = new Map();
  const at = (d) => {
    if (!byDay.has(d)) byDay.set(d, { in: 0, meal: 0, other: 0, sweep: 0, standing: null });
    return byDay.get(d);
  };
  for (const r of (ps.inflows || [])) {
    if (String(r.name) !== channel) continue;
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    at(r.day).in += r.kcal || 0;
  }
  for (const r of (ps.mealDrawRecords || [])) {
    if (r.kind !== 'pantryDraw') continue;
    for (const it of (r.items || [])) {
      if (String(it.name) !== channel) continue;
      const kcal = (it.units || 0) * (it.kcalEach || 0);
      if (r.context === 'other') at(r.day).other += kcal; else at(r.day).meal += kcal;
    }
  }
  for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
    for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
      if (String(bc.channel) === channel) at(sw.day).sweep += bc.kcal || 0;
    }
  }
  for (const sd of (ps.spoilDays || [])) {
    for (const ch of (sd.channels || [])) {
      if (String(ch.channel) === channel) at(sd.day).standing = ch.freshKcal || 0;
    }
  }
  return [...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([d, v]) => ({ day: d, ...v }));
}

function printNarrative(ps, channel) {
  const narr = dayNarrative(ps, channel);
  console.log(`\nSENSE ${ps.seed} ${channel} day-by-day (in / meal / other / sweep / standing; only days with movement or a standing change):`);
  let prevStanding = null;
  for (const d of narr) {
    const moved = d.in || d.meal || d.other || d.sweep;
    const changed = d.standing !== prevStanding;
    if (!moved && !changed) continue;
    console.log(`  day ${d.day}: in=${fmt(d.in)} meal=${fmt(d.meal)} other=${fmt(d.other)} sweep=${fmt(d.sweep)} standing=${d.standing == null ? 'n/a' : fmt(d.standing)}`);
    prevStanding = d.standing;
  }
}

function main() {
  const corpus = loadDir(DIR);
  console.log(`corpus: ${DIR} (${corpus.length} seeds)`);
  let totSweeps = 0, violRemoved = 0, violKept = 0, bonusVals = [];
  let packKcal = 0, prepKcal = 0, corpseKcal = 0;
  const bonusSavedPerSweep = [];
  const appearances = new Map();
  const wall = { national: 0, table: 0, wins: 0, wave45: 0, survival: [], deaths: 0, causes: {}, waveReach: {} };
  const perSeed = [];
  for (const { file, data: ps } of corpus) {
    const ch = channelStats(ps);
    const sweeps = ((ps.spoilEvents || {}).sweeps || []);
    totSweeps += sweeps.length;
    for (const sw of sweeps) {
      const v = ((sw.violations || {}).pantry || {});
      violRemoved += v.removedNotSpoiledKcal || 0;
      violKept += v.keptSpoiledKcal || 0;
      if (sw.bonus != null) bonusVals.push(sw.bonus);
      let sweepSaved = 0;
      for (const bc of (((sw.bonusSaved || {}).pantry || {}).byChannel || [])) sweepSaved += bc.kcal || 0;
      bonusSavedPerSweep.push(sweepSaved);
      for (const cont of ['pack', 'prep', 'corpse']) {
        const k = ((sw.removed || {})[cont] || {}).totalKcal || 0;
        if (cont === 'pack') packKcal += k;
        if (cont === 'prep') prepKcal += k;
        if (cont === 'corpse') corpseKcal += k;
      }
    }
    for (const [c, b] of ch) {
      if (b.inflowRecs > 0) appearances.set(c, (appearances.get(c) || 0) + 1);
    }
    wall.national += ps.national ? 1 : 0;
    wall.table += ps.table ? 1 : 0;
    wall.wins += ps.win ? 1 : 0;
    if ((ps.waveReach || []).includes(4) || (ps.waveReach || []).includes(5)) wall.wave45 += 1;
    wall.survival.push(ps.daysAlive || 0);
    wall.deaths += ps.deaths || 0;
    wall.waveReach[ps.seed] = (ps.waveReach || []).length;
    for (const [k, v] of Object.entries(ps.deathCauses || {})) wall.causes[k] = (wall.causes[k] || 0) + v;
    perSeed.push({ seed: ps.seed, days: ps.daysAlive, rank: ps.rank, wave: (ps.waveReach || []).length,
      deaths: ps.deaths, sweeps: sweeps.length, ch, ps });
  }
  for (const s of perSeed) {
    console.log(`\nseed ${s.seed}: days=${s.days} rank=${s.rank} wave=${s.wave} deaths=${s.deaths} sweeps=${s.sweeps}`);
    for (const [c, b] of [...s.ch.entries()].sort((a, b) => b[1].inflow - a[1].inflow)) {
      if (b.inflow < 10000 && !FOCAL.includes(c)) continue;
      console.log(`  ${c}: in=${fmt(b.inflow)} (recs=${b.inflowRecs}) meal=${fmt(b.mealDrawn)} other=${fmt(b.otherDrawn)} sweep=${fmt(b.sweep)} medPostDayEnd=${fmt(b.medianPostStock)} (n=${b.postN}) firstDay=${b.firstDay} resid=${fmt(b.residual)}`);
    }
  }
  console.log(`\nAPPEARANCE (this re-run's inflow records): Cattail=${appearances.get('Cattail') || 0}/8 LQ=${appearances.get("Lamb's Quarters") || 0}/8 Burdock=${appearances.get('Burdock') || 0}/8`);
  // Case study: 9761 Cattail vs 9762 LQ.
  const s9761 = perSeed.find(s => s.seed === 9761);
  const s9762 = perSeed.find(s => s.seed === 9762);
  const caseOf = (s, channel) => {
    const b = s.ch.get(channel) || { inflow: 0, mealDrawn: 0, otherDrawn: 0, sweep: 0, medianPostStock: null };
    const draws = b.mealDrawn + b.otherDrawn;
    return { b, draws,
      shareIn: b.inflow > 0 ? b.sweep / b.inflow : null,
      shareUneaten: (b.inflow - draws) > 0 ? b.sweep / (b.inflow - draws) : null };
  };
  if (s9761 && s9762) {
    const cat = caseOf(s9761, 'Cattail');
    const lq = caseOf(s9762, "Lamb's Quarters");
    const gapPp = (cat.shareUneaten != null && lq.shareUneaten != null) ? (cat.shareUneaten - lq.shareUneaten) * 100 : null;
    console.log('\nCASE-DIAG LEGS (prereg revision (a); leg 1 det-gate run separately, see proof):');
    console.log(`  leg2 integrity: removedNotSpoiledKcal=${fmt(violRemoved)} keptSpoiledKcal=${fmt(violKept)} (bar: both 0) sweeps=${totSweeps}`);
    console.log(`  case 9761 Cattail: in=${fmt(cat.b.inflow)} draws=${fmt(cat.draws)} sweep=${fmt(cat.b.sweep)} shareOfInflow=${pct(cat.shareIn)} shareOfUneaten=${pct(cat.shareUneaten)} medPostDayEnd=${fmt(cat.b.medianPostStock)}`);
    console.log(`  case 9762 LQ: in=${fmt(lq.b.inflow)} draws=${fmt(lq.draws)} sweep=${fmt(lq.b.sweep)} shareOfInflow=${pct(lq.shareIn)} shareOfUneaten=${pct(lq.shareUneaten)} medPostDayEnd=${fmt(lq.b.medianPostStock)}`);
    console.log(`  leg3a gap: Cattail shareOfUneaten - LQ shareOfUneaten = ${gapPp == null ? 'n/a' : gapPp.toFixed(1) + 'pp'} (bar: >= 10pp)`);
    console.log(`  leg3b sweep: Cattail ${fmt(cat.b.sweep)} >= LQ ${fmt(lq.b.sweep)} ? ${cat.b.sweep >= lq.b.sweep}`);
    console.log(`  CASE VERDICT (legs 2+3 only; leg 1 in proof): ${(violRemoved === 0 && violKept === 0 && gapPp != null && gapPp >= 10 && cat.b.sweep >= lq.b.sweep) ? 'CASE-DIAG-SUPPORTS' : 'CASE-DIAG-NOT-SUPPORTS'}`);
    // Family ledgers for the two case seeds.
    for (const [s, channel] of [[s9761, 'Cattail'], [s9762, "Lamb's Quarters"]]) {
      const a = s.ch.get(channel) || { inflow: 0, mealDrawn: 0, otherDrawn: 0, sweep: 0 };
      const d = s.ch.get(channel + ' (dried)') || { inflow: 0, mealDrawn: 0, otherDrawn: 0, sweep: 0 };
      const fi = a.inflow + d.inflow, fd = a.mealDrawn + a.otherDrawn + d.mealDrawn + d.otherDrawn, fs = a.sweep + d.sweep;
      console.log(`  FAMILY ${channel} (seed ${s.seed}): inflow=${fmt(fi)} draws=${fmt(fd)} sweep=${fmt(fs)} shareOfUneaten=${pct((fi - fd) > 0 ? fs / (fi - fd) : null)} (dried-variant inflow=${fmt(d.inflow)} — dried stock enters with NO door record)`);
    }
  }
  console.log(`\nBONUS: sweeps=${totSweeps} bonus median=${medianOf(bonusVals)} min=${bonusVals.length ? Math.min(...bonusVals) : null} max=${bonusVals.length ? Math.max(...bonusVals) : null}`);
  const bonusDist = {};
  for (const b of bonusVals) bonusDist[b] = (bonusDist[b] || 0) + 1;
  console.log(`  bonus distribution (sweeps by spoilBonusDays): ${JSON.stringify(bonusDist)}`);
  console.log(`  bonus-saved standing pantry pile per sweep: median=${fmt(medianOf(bonusSavedPerSweep))} max=${fmt(Math.max(...bonusSavedPerSweep))} (a STANDING pile re-counted each sweep, NOT a flow — never summed as volume)`);
  console.log(`  secondary sweep totals: pack=${fmt(packKcal)} prep=${fmt(prepKcal)} corpse=${fmt(corpseKcal)}`);
  console.log(`\nWALL: national=${wall.national}/${corpus.length} table=${wall.table}/${corpus.length} wins=${wall.wins}/${corpus.length} wave45=${wall.wave45}/${corpus.length} medianSurvival=${medianOf(wall.survival)} maxSurvival=${Math.max(...wall.survival)} deaths=${wall.deaths}`);
  console.log(`  waveReach per seed: ${JSON.stringify(wall.waveReach)}`);
  console.log(`  deathCauses: ${JSON.stringify(wall.causes)}`);
  // Determinism cross-check vs cattailband corpus.
  try {
    const ref = loadDir(REF_DIR);
    const refBySeed = new Map(ref.map(({ data }) => [data.seed, data]));
    let diffChannels = 0, diffSeeds = [];
    for (const { data: ps } of corpus) {
      const r = refBySeed.get(ps.seed);
      if (!r) { diffSeeds.push(ps.seed + ':no-ref'); continue; }
      const sumIn = (j) => {
        const m = new Map();
        for (const rec of (j.inflows || [])) {
          if (rec.door === 'stock' && !(rec.kcal > 0)) continue;
          if (rec.door === 'pantryAdd' && !rec.added) continue;
          m.set(String(rec.name), (m.get(String(rec.name)) || 0) + (rec.kcal || 0));
        }
        return m;
      };
      const a = sumIn(ps), b = sumIn(r);
      const names = new Set([...a.keys(), ...b.keys()]);
      let d = 0;
      for (const n of names) if ((a.get(n) || 0) !== (b.get(n) || 0)) d++;
      if (d) { diffChannels += d; diffSeeds.push(ps.seed + ':' + d); }
      if (ps.deaths !== r.deaths || JSON.stringify(ps.waveReach) !== JSON.stringify(r.waveReach)) diffSeeds.push(ps.seed + ':deaths/waves-differ');
    }
    console.log(`\nDETERMINISM vs cattailband corpus: differing inflow channels total=${diffChannels} (${diffSeeds.length ? diffSeeds.join(', ') : 'none'})`);
  } catch (e) {
    console.log(`\nDETERMINISM vs cattailband corpus: REF READ FAILED (${e.message})`);
  }
  // Sense.
  if (s9761) {
    printNarrative(s9761.ps, 'Cattail');
    const line = (s9761.ps.spoilSayLines || [])[0];
    if (line) console.log(`\nSENSE 9761 first spoil voice, day ${line.day}: ${line.line}`);
    const catLines = (s9761.ps.spoilSayLines || []).filter(l => /Cattail/i.test(l.line));
    console.log(`SENSE 9761 spoil voice lines mentioning Cattail: ${catLines.length} of ${(s9761.ps.spoilSayLines || []).length}`);
    if (catLines[0]) console.log(`SENSE 9761 first Cattail spoil voice, day ${catLines[0].day}: ${catLines[0].line}`);
  }
  if (s9762) {
    printNarrative(s9762.ps, "Lamb's Quarters");
    const line = (s9762.ps.spoilSayLines || [])[0];
    if (line) console.log(`\nSENSE 9762 first spoil voice, day ${line.day}: ${line.line}`);
  }
}

main();
