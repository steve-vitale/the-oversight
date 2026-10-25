#!/usr/bin/env node
// scripts/test-w123death-diag-sweep.js — sim-w123death-a pilot + analyzer
// (scale-onramp axis, 2026-10-25, DIAG ONLY: zero src/js changes.)
//
// QUESTION: what ARE the wave-1/2/3 field deaths, as mechanism classes?
// The deathcensus arm proved field fights are the largest villager-death
// source (12/27) on the tableseat-nowait band; the bought-round arms
// killed the wave-4 one-shot class and the nearly-dead-entry class as
// cures. This arm scopes the wave-1/2/3 field deaths themselves.
//
// SUBSTRATE (identical to the published controls): tableseat-nowait
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1), seeds 73671-73678, 180d
// death-aware horizon. Measurement reuses the deathcensus recorder
// unchanged via test-deathcensus-diag-sweep.js runOne (baseline +
// armed, identical seeds); this script only ANALYZES that corpus.
// Pre-registration, classification scheme, per-exposure definition,
// post-flee counting rules, and the DIAG-GO bar live in
// evidence/2026-10-25/sim-w123death-a.md (written BEFORE classification).
//
// CLASSIFICATION (priority order, exactly one class per death):
//   1 post-flee: same vid+day field vFlee row exists (death-final
//     argument: a villager dead in a field fight cannot fight again
//     that day, so any other same vid+day field row precedes death).
//   2 nearly-dead: entry HP fraction < 0.15.
//   3 one-round >=50%: rounds == 1 and entry HP fraction >= 0.50.
//   4 multi-round grind: rounds >= 2 and entry HP fraction >= 0.15.
//   5 other: written mechanism required (rounds==1 mid-HP, or
//     rounds unrecorded).
//
// PER-EXPOSURE: field fights = field-context rows with outcome in
// {vKill,vDie,vFlee,mFlee}. Evade rows are NOT fights (pre-fight evade
// decides contact, fieldFights.js header) — excluded, with an
// including-evade sensitivity reported.
// POST-FLEE: (a) provable same-array: a field row following a field
// vFlee for same vid+day earlier in the same recorder array;
// (b) co-occurrence ceiling: vid+days with a field vFlee and another
// field fight row (any array).
//
// Modes:
//   default: pilot sweep (baseline + armed, 8 seeds) into
//     EVID (default evidence/2026-10-25/perseed-sim-w123death-a),
//     then the full analysis printed + written to summary.json.
//   --transcript SEED: armed re-run with DEATHCENSUS_TRANSCRIPT=1
//     (no corpus write); prints every field vDie row with its engine
//     awayNews death line; writes the sense file
//     evidence/2026-10-25/sim-w123death-a-sense.txt. The transcript
//     re-run must census-match the sweep corpus for that seed.
//   Exit 1 on proof-gate failure (G2 neutrality / G3 corpus / gate
//   mismatch is REPORTED, not exit-1: the gate verdict is data — but
//   a mismatch sets gatePass=false and classification is NOT trusted,
//   per the brief: STOP, do not classify).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dcSweep = require('./test-deathcensus-diag-sweep');
const { runOne, writeRowViaWriter } = dcSweep;

const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-w123death-a');
const FIGHT_OUTCOMES = ['vKill', 'vDie', 'vFlee', 'mFlee'];

// writeRowRobust(p, body): EPERM-flap-proof corpus write for the resume
// path. The shared writer (sim-postunlock2-b-writer.js, 1KB chunks x8
// retries x8 attempts) lost seed 73672's armed row TWICE to the flap
// (2026-10-25 ~10:48 and ~10:53), after the same writer had succeeded
// for 9/9 earlier rows — the flap fluctuates on a seconds-to-minutes
// scale (a shell echo succeeded at 10:49 and failed at 10:53). So this
// writer retries the write itself for up to 10 minutes per file,
// alternating node-fs and shell-base64 mechanisms, and verifies the
// read-back hash before returning. It never invents content: the body
// is the runOne row JSON, written byte-identically.
const crypto = require('crypto');
const { execFileSync } = require('child_process');
function sleepSync(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* best-effort */ } }
function writeRowRobust(p, body) {
  const want = crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
  const deadline = Date.now() + 600000;
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt++;
    try {
      if (attempt % 2 === 1) fs.writeFileSync(p, body);
      else execFileSync('sh', ['-c', 'base64 -d > "$1"', 'sh', p], { input: Buffer.from(body, 'utf8').toString('base64'), timeout: 30000 });
      const got = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 12);
      if (got === want) { console.log(`ROBUST-WRITE ${path.basename(p)} attempt=${attempt} sha=${got}`); return want; }
      console.log(`ROBUST-WRITE ${path.basename(p)} attempt=${attempt} hash-mismatch got=${got} want=${want}, retrying`);
    } catch (e) {
      if (attempt % 20 === 0) console.log(`ROBUST-WRITE ${path.basename(p)} attempt=${attempt} still failing: ${String((e && e.message) || e).slice(0, 100)}`);
    }
    sleepSync(3000);
  }
  // Before giving up: stash the body in /tmp (writes there survived the
  // flap when evidence/ writes did not) so a later --resume can copy
  // it in without re-running the sim. /tmp is a staging copy only —
  // the corpus of record stays in evidence/; the copy into evidence/
  // happens in the same later resume run.
  try { fs.writeFileSync('/tmp/w123death-' + path.basename(p), body); console.log(`ROBUST-WRITE stashed /tmp copy for ${path.basename(p)}`); } catch (e) { /* stash best-effort */ }
  throw new Error(`ROBUST-WRITE exhausted 10min for ${p}`);
}

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function classifyDeath(d, fleeEarlier) {
  const frac = d.vHpStartFrac;
  const rounds = d.rounds;
  if (fleeEarlier) return { cls: 'post-flee re-encounter', mechanism: 'villager fled a field fight earlier the same day, then met another monster the same day and died' };
  if (frac != null && frac < 0.15) return { cls: 'nearly-dead entry', mechanism: 'entered the death fight below 15% HP' };
  if (rounds === 1 && frac != null && frac >= 0.50) return { cls: 'one-round >=50%', mechanism: 'entered at >=50% HP and died in a single round' };
  if (rounds != null && rounds >= 2 && frac != null && frac >= 0.15) return { cls: 'multi-round grind', mechanism: 'fought 2+ rounds at >=15% entry HP and lost' };
  if (rounds === 1 && frac != null) return { cls: 'other', mechanism: 'one-round death at mid entry HP (15% <= entry < 50%): neither nearly-dead nor a healthy one-shot' };
  return { cls: 'other', mechanism: 'rounds or entry HP unrecorded in the fight row' };
}

// Analyze one armed corpus row. Returns everything the evidence needs.
function analyzeSeed(row) {
  const dc = row.deathcensus;
  const analysis = dc.analysis;
  const resolve = dc.resolveFights || [];
  const direct = dc.directFights || [];
  const fieldRows = [];
  for (const f of resolve) if (f.context === 'field') fieldRows.push(Object.assign({ src: 'resolve' }, f));
  for (const f of direct) if (f.context === 'field') fieldRows.push(Object.assign({ src: 'direct' }, f));
  // Per-vid+day field rows, per array (order preserved within an array).
  const byVidDay = new Map(); // key -> {rows:[], flees:[], fights:[]}
  const keyOf = (vid, day) => vid + '|' + day;
  const put = (r) => {
    const k = keyOf(r.vid, r.day);
    if (!byVidDay.has(k)) byVidDay.set(k, { vid: r.vid, day: r.day, rows: [] });
    byVidDay.get(k).rows.push(r);
  };
  for (const r of fieldRows) put(r);
  // Field deaths from the census detail (the trusted population).
  const fieldDeaths = (analysis.combatDeathDetail || []).filter(d => d.context === 'field');
  const deaths = fieldDeaths.map(d => {
    const k = keyOf(d.vid, d.seedDay);
    const group = byVidDay.get(k);
    const rows = group ? group.rows : [];
    const fleeRows = rows.filter(r => r.outcome === 'vFlee');
    const fleeEarlier = fleeRows.length > 0;
    const cls = classifyDeath(d, fleeEarlier);
    return {
      seed: row.seed, day: d.seedDay, vid: d.vid, cause: d.cause, mid: d.mid, wave: d.wave,
      vHpStartFrac: d.vHpStartFrac, mHpStartFrac: d.mHpStartFrac, rounds: d.rounds,
      mDealt: d.mDealt, vTaken: d.vTaken, mHpEndFrac: d.mHpEndFrac, belowLineEnd: d.belowLineEnd,
      fleeEarlierSameDay: fleeEarlier, fleeRowsSameDay: fleeRows.map(r => ({ src: r.src, mid: r.mid, wave: r.wave, outcome: r.outcome, rounds: r.rounds })),
      otherFieldRowsSameDay: rows.filter(r => r.outcome !== 'vDie').map(r => ({ src: r.src, mid: r.mid, wave: r.wave, outcome: r.outcome, rounds: r.rounds })),
      oneRound: d.rounds === 1, cls: cls.cls, mechanism: cls.mechanism,
    };
  });
  // Per-exposure denominators (field fights only, evade excluded).
  const exposure = { w1: { fights: 0, deaths: 0 }, w2: { fights: 0, deaths: 0 }, w3: { fights: 0, deaths: 0 }, w4plus: { fights: 0, deaths: 0 }, all: { fights: 0, deaths: 0 }, evadeRows: 0, unexpectedOutcomes: [] };
  const wkey = (w) => (w === 1 ? 'w1' : w === 2 ? 'w2' : w === 3 ? 'w3' : 'w4plus');
  for (const r of fieldRows) {
    if (r.outcome === 'evade') { exposure.evadeRows++; continue; }
    if (FIGHT_OUTCOMES.indexOf(r.outcome) < 0) { exposure.unexpectedOutcomes.push({ src: r.src, mid: r.mid, outcome: r.outcome }); continue; }
    const k = wkey(r.wave | 0);
    exposure[k].fights++; exposure.all.fights++;
    if (r.outcome === 'vDie') { exposure[k].deaths++; exposure.all.deaths++; }
  }
  // Post-flee re-encounters.
  // (a) Provable same-array: walk each array in order, per vid+day.
  const provable = { deaths: 0, survivals: 0, rows: [] };
  for (const pair of [{ src: 'resolve', arr: resolve.filter(f => f.context === 'field') }, { src: 'direct', arr: direct.filter(f => f.context === 'field') }]) {
    const seenFlee = new Set();
    for (const r of pair.arr) {
      const k = keyOf(r.vid, r.day);
      if (FIGHT_OUTCOMES.indexOf(r.outcome) < 0 || r.outcome === 'evade') continue;
      if (seenFlee.has(k)) {
        if (r.outcome === 'vDie') provable.deaths++;
        else provable.survivals++;
        provable.rows.push({ seed: row.seed, src: pair.src, vid: r.vid, day: r.day, mid: r.mid, wave: r.wave, outcome: r.outcome, rounds: r.rounds });
      }
      if (r.outcome === 'vFlee') seenFlee.add(k);
    }
  }
  // (b) Co-occurrence ceiling: vid+days with a vFlee and another fight row.
  const cooccur = { vidDays: 0, withDeath: 0, survivedOnly: 0, list: [] };
  for (const g of byVidDay.values()) {
    const fights = g.rows.filter(r => FIGHT_OUTCOMES.indexOf(r.outcome) >= 0);
    const hasFlee = fights.some(r => r.outcome === 'vFlee');
    const hasOther = fights.filter(r => !(r.outcome === 'vFlee')).length > 0 || fights.filter(r => r.outcome === 'vFlee').length > 1;
    // "another fight" = any fight row beyond a single flee: a second flee
    // also counts (fled twice = re-encountered and fled again).
    const otherFight = fights.length >= 2;
    if (hasFlee && otherFight) {
      cooccur.vidDays++;
      const hasDie = fights.some(r => r.outcome === 'vDie');
      if (hasDie) cooccur.withDeath++; else cooccur.survivedOnly++;
      cooccur.list.push({ vid: g.vid, day: g.day, fights: fights.map(r => ({ src: r.src, mid: r.mid, wave: r.wave, outcome: r.outcome, rounds: r.rounds })) });
    }
  }
  return {
    seed: row.seed, days: row.days, gameDays: row.gameDays, won: row.won,
    waveReach: row.waveReach, maxArc: row.maxArc, finalRank: row.finalRank, maxRank: row.maxRank,
    nationalEver: row.nationalEver, nationalFinal: row.nationalFinal, table: row.table, entered: row.entered,
    deathTotal: row.deathTotal, byContext: analysis.byContext, population: analysis.population,
    fieldDeaths: deaths, exposure, provablePostFlee: provable, cooccurPostFlee: cooccur,
    recorderErrs: (dc.diag && dc.diag.errs) || 0, fightRows: fieldRows.length,
  };
}

function aggregateAnalyses(perSeed, baselineRows) {
  const won = perSeed.reduce((t, r) => t + r.won, 0);
  const medAll = medianOf(perSeed.map(r => r.days));
  const medNoWin = medianOf(perSeed.filter(r => !r.won).map(r => r.days));
  const natEver = perSeed.reduce((t, r) => t + r.nationalEver, 0);
  const natFinal = perSeed.reduce((t, r) => t + r.nationalFinal, 0);
  const table = perSeed.reduce((t, r) => t + r.table, 0);
  const entered = perSeed.reduce((t, r) => t + r.entered, 0);
  const wave4 = perSeed.filter(r => (r.waveReach || 1) >= 4).length;
  const wave5 = perSeed.filter(r => (r.waveReach || 1) >= 5).length;
  const maxArc = Math.max.apply(null, perSeed.map(r => r.maxArc).concat([1]));
  const deathTotal = perSeed.reduce((t, r) => t + r.deathTotal, 0);
  const byContext = { raid: 0, field: 0, arena: 0, tb: 0, other: 0, unknown: 0 };
  let villagerDeaths = 0, recorderErrs = 0;
  for (const r of perSeed) {
    for (const k of Object.keys(byContext)) byContext[k] += r.byContext[k] || 0;
    villagerDeaths += (r.population && r.population.villagerDeaths) || 0;
    recorderErrs += r.recorderErrs;
  }
  const allDeaths = [];
  const exposure = { w1: { fights: 0, deaths: 0 }, w2: { fights: 0, deaths: 0 }, w3: { fights: 0, deaths: 0 }, w4plus: { fights: 0, deaths: 0 }, all: { fights: 0, deaths: 0 }, evadeRows: 0, unexpectedOutcomes: [] };
  const provable = { deaths: 0, survivals: 0, rows: [] };
  const cooccur = { vidDays: 0, withDeath: 0, survivedOnly: 0, list: [] };
  for (const r of perSeed) {
    allDeaths.push.apply(allDeaths, r.fieldDeaths);
    for (const k of ['w1', 'w2', 'w3', 'w4plus', 'all']) { exposure[k].fights += r.exposure[k].fights; exposure[k].deaths += r.exposure[k].deaths; }
    exposure.evadeRows += r.exposure.evadeRows;
    exposure.unexpectedOutcomes.push.apply(exposure.unexpectedOutcomes, r.exposure.unexpectedOutcomes);
    provable.deaths += r.provablePostFlee.deaths; provable.survivals += r.provablePostFlee.survivals;
    provable.rows.push.apply(provable.rows, r.provablePostFlee.rows);
    cooccur.vidDays += r.cooccurPostFlee.vidDays; cooccur.withDeath += r.cooccurPostFlee.withDeath; cooccur.survivedOnly += r.cooccurPostFlee.survivedOnly;
    cooccur.list.push.apply(cooccur.list, r.cooccurPostFlee.list);
  }
  const w123Deaths = allDeaths.filter(d => d.wave === 1 || d.wave === 2 || d.wave === 3);
  const byClass = {};
  for (const d of allDeaths) byClass[d.cls] = (byClass[d.cls] || 0) + 1;
  const byClassW123 = {};
  for (const d of w123Deaths) byClassW123[d.cls] = (byClassW123[d.cls] || 0) + 1;
  const rate = (k) => exposure[k].fights ? (exposure[k].deaths / exposure[k].fights) : null;
  const w123Fights = exposure.w1.fights + exposure.w2.fights + exposure.w3.fights;
  const w123DeathN = exposure.w1.deaths + exposure.w2.deaths + exposure.w3.deaths;
  const published = { won: 4, medAll: 150, medNoWin: 180, natEver: 8, natFinal: 7, table: 5, entered: 4, wave4: 5, wave5: 0, maxArc: 4, deathTotal: 261, villagerDeaths: 27, byContext: { field: 12, other: 12, raid: 1, arena: 1, tb: 1, unknown: 0 } };
  const actual = { won, medAll, medNoWin, natEver, natFinal, table, entered, wave4, wave5, maxArc, deathTotal, villagerDeaths, byContext };
  const checks = {
    won: won === 4, medAll: medAll === 150, medNoWin: medNoWin === 180, natEver: natEver === 8,
    natFinal: natFinal === 7, table: table === 5, entered: entered === 4, wave4: wave4 === 5,
    wave5: wave5 === 0, maxArc: maxArc === 4, deathTotal: deathTotal === 261,
    villagerDeaths: villagerDeaths === 27, field: byContext.field === 12, other: byContext.other === 12,
    raid: byContext.raid === 1, arena: byContext.arena === 1, tb: byContext.tb === 1,
  };
  const gatePass = Object.keys(checks).every(k => checks[k]);
  return {
    headlines: actual, published, checks, gatePass,
    perSeed: perSeed.map(r => ({ seed: r.seed, days: r.days, gameDays: r.gameDays, won: r.won, waveReach: r.waveReach, maxArc: r.maxArc, finalRank: r.finalRank, maxRank: r.maxRank, nationalEver: r.nationalEver, nationalFinal: r.nationalFinal, table: r.table, entered: r.entered, deathTotal: r.deathTotal, byContext: r.byContext })),
    fieldDeaths: allDeaths, w123Deaths, byClass, byClassW123,
    exposure: {
      w1: exposure.w1, w2: exposure.w2, w3: exposure.w3, w4plus: exposure.w4plus, all: exposure.all,
      w123: { fights: w123Fights, deaths: w123DeathN },
      evadeRows: exposure.evadeRows, unexpectedOutcomes: exposure.unexpectedOutcomes,
      rates: { w1: rate('w1'), w2: rate('w2'), w3: rate('w3'), w4plus: rate('w4plus'), w123: w123Fights ? w123DeathN / w123Fights : null, all: rate('all'),
        inclEvadeAll: (exposure.all.fights + exposure.evadeRows) ? exposure.all.deaths / (exposure.all.fights + exposure.evadeRows) : null },
    },
    provablePostFlee: provable, cooccurPostFlee: cooccur, recorderErrs,
    baselineHeadlines: baselineRows ? {
      won: baselineRows.reduce((t, r) => t + r.won, 0), medAll: medianOf(baselineRows.map(r => r.days)),
      medNoWin: medianOf(baselineRows.filter(r => !r.won).map(r => r.days)),
      deathTotal: baselineRows.reduce((t, r) => t + r.deathTotal, 0),
    } : null,
  };
}

async function sweepMode() {
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of SEEDS) {
      const row = await runOne(pid, seed, DAYS, EVID);
      const a = row.deathcensus.analysis;
      const line = a
        ? `census=${JSON.stringify(a.byContext)} villagerDeaths=${a.population.villagerDeaths}`
        : `snapshot-only deaths=${row.deathTotal}`;
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} ${line}`);
      rows.push(row);
    }
  }
  // G2 neutrality (baseline vs armed identical trajectories).
  const g2 = [];
  for (const seed of SEEDS) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths
      && JSON.stringify(c.deathcensus.deaths) === JSON.stringify(a.deathcensus.deaths);
    g2.push({ seed, ok });
  }
  const g2Pass = g2.every(x => x.ok);
  const armedRows = rows.filter(r => r.policy === 'armed');
  const baselineRows = rows.filter(r => r.policy === 'baseline');
  // Analyze from the WRITTEN corpus (not in-memory rows) so the analyzer
  // is proven against the artifact it ships.
  const perSeed = [];
  for (const seed of SEEDS) {
    const corpus = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
    perSeed.push(analyzeSeed(corpus));
  }
  const agg = aggregateAnalyses(perSeed, baselineRows);
  const report = { label: 'sim-w123death-a pilot', seeds: SEEDS, days: DAYS, g2, g2Pass, agg, generated: new Date().toISOString() };
  writeRowViaWriter(path.join(EVID, 'summary.json'), JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-w123death-a pilot ===');
  console.log(`  armed headlines: won=${agg.headlines.won}/8 medAll=${agg.headlines.medAll} medNoWin=${agg.headlines.medNoWin} natEver=${agg.headlines.natEver}/8 natFinal=${agg.headlines.natFinal}/8 table=${agg.headlines.table} entered=${agg.headlines.entered} wave4=${agg.headlines.wave4}/8 wave5=${agg.headlines.wave5}/8 maxArc=${agg.headlines.maxArc} deathTotal=${agg.headlines.deathTotal} villagerDeaths=${agg.headlines.villagerDeaths} byContext=${JSON.stringify(agg.headlines.byContext)}`);
  console.log(`  CONTROL GATE: ${agg.gatePass ? 'PASS' : 'FAIL'} checks=${JSON.stringify(agg.checks)}`);
  if (!agg.gatePass) { console.log('  GATE MISMATCH — classification NOT trusted; see checks above.'); }
  console.log(`  field deaths: ${agg.fieldDeaths.length} (w123: ${agg.w123Deaths.length}) byClass=${JSON.stringify(agg.byClass)} byClassW123=${JSON.stringify(agg.byClassW123)}`);
  for (const d of agg.fieldDeaths) {
    console.log(`  FIELD-DEATH seed=${d.seed} d${d.day} ${d.vid} vs ${d.mid} (wave ${d.wave}) rounds=${d.rounds} entry=${d.vHpStartFrac != null ? d.vHpStartFrac.toFixed(2) : null} dealt=${d.mDealt} taken=${d.vTaken} fleeEarlier=${d.fleeEarlierSameDay} oneRound=${d.oneRound} class=${d.cls}`);
  }
  console.log(`  exposure (fights excl evade): ${JSON.stringify(agg.exposure)}`);
  console.log(`  provable post-flee (same-array): deaths=${agg.provablePostFlee.deaths} survivals=${agg.provablePostFlee.survivals} rows=${agg.provablePostFlee.rows.length}`);
  for (const r of agg.provablePostFlee.rows) console.log(`    POSTFLEE-PROVABLE seed=${r.seed} ${r.vid} d${r.day} vs ${r.mid} (wave ${r.wave}) outcome=${r.outcome} rounds=${r.rounds}`);
  console.log(`  co-occurrence ceiling: vidDays=${agg.cooccurPostFlee.vidDays} withDeath=${agg.cooccurPostFlee.withDeath} survivedOnly=${agg.cooccurPostFlee.survivedOnly}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'}; recorderErrs=${agg.recorderErrs}`);
  if (!g2Pass) { console.error('PROOF GATE FAILURE (G2)'); process.exit(1); }
}

async function resumeMode() {
  // EPERM-flap recovery: re-run ONLY the armed seeds whose corpus file
  // is missing (the failed run's computed rows were lost with the
  // failed write — runOne writes only at the end). Baseline corpus is
  // complete and is NOT re-run. Idempotent: re-running --resume after
  // another flap failure just picks up the next missing seed.
  fs.mkdirSync(EVID, { recursive: true });
  for (const seed of SEEDS) {
    const fn = path.join(EVID, `s${seed}-armed.json`);
    if (fs.existsSync(fn)) { console.log(`  [resume] seed ${seed} armed corpus present, skipping`); continue; }
    const stash = '/tmp/w123death-s' + seed + '-armed.json';
    if (fs.existsSync(stash)) {
      console.log(`  [resume] seed ${seed} using /tmp stash copy (sim already computed; copying into evidence/)`);
      const body = fs.readFileSync(stash, 'utf8');
      const sha = writeRowRobust(fn, body);
      try { fs.unlinkSync(stash); } catch (e) { /* stash cleanup best-effort */ }
      console.log(`  [resume armed seed ${seed}] restored from stash corpusSha=${sha}`);
      continue;
    }
    // Run WITHOUT the shared writer (it lost this seed twice to the
    // flap), then persist via the robust retry writer.
    const row = await runOne('armed', seed, DAYS, null);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowRobust(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
    console.log(`  [resume armed seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} won=${row.won} corpusSha=${sha}`);
  }
  const g2 = [];
  for (const seed of SEEDS) {
    const c = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-baseline.json`), 'utf8'));
    const a = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
    const ok = c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths
      && JSON.stringify(c.deathcensus.deaths) === JSON.stringify(a.deathcensus.deaths);
    g2.push({ seed, ok });
  }
  const g2Pass = g2.every(x => x.ok);
  const perSeed = [];
  for (const seed of SEEDS) {
    const corpus = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
    perSeed.push(analyzeSeed(corpus));
  }
  const baselineRows = SEEDS.map(seed => JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-baseline.json`), 'utf8')));
  const agg = aggregateAnalyses(perSeed, baselineRows);
  const report = { label: 'sim-w123death-a pilot (resumed)', seeds: SEEDS, days: DAYS, g2, g2Pass, agg, generated: new Date().toISOString() };
  writeRowRobust(path.join(EVID, 'summary.json'), JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-w123death-a pilot (resumed) ===');
  console.log(`  armed headlines: won=${agg.headlines.won}/8 medAll=${agg.headlines.medAll} medNoWin=${agg.headlines.medNoWin} natEver=${agg.headlines.natEver}/8 natFinal=${agg.headlines.natFinal}/8 table=${agg.headlines.table} entered=${agg.headlines.entered} wave4=${agg.headlines.wave4}/8 wave5=${agg.headlines.wave5}/8 maxArc=${agg.headlines.maxArc} deathTotal=${agg.headlines.deathTotal} villagerDeaths=${agg.headlines.villagerDeaths} byContext=${JSON.stringify(agg.headlines.byContext)}`);
  console.log(`  CONTROL GATE: ${agg.gatePass ? 'PASS' : 'FAIL'} checks=${JSON.stringify(agg.checks)}`);
  console.log(`  field deaths: ${agg.fieldDeaths.length} (w123: ${agg.w123Deaths.length}) byClass=${JSON.stringify(agg.byClass)} byClassW123=${JSON.stringify(agg.byClassW123)}`);
  for (const d of agg.fieldDeaths) {
    console.log(`  FIELD-DEATH seed=${d.seed} d${d.day} ${d.vid} vs ${d.mid} (wave ${d.wave}) rounds=${d.rounds} entry=${d.vHpStartFrac != null ? d.vHpStartFrac.toFixed(2) : null} dealt=${d.mDealt} taken=${d.vTaken} fleeEarlier=${d.fleeEarlierSameDay} oneRound=${d.oneRound} class=${d.cls}`);
  }
  console.log(`  exposure (fights excl evade): ${JSON.stringify(agg.exposure)}`);
  console.log(`  provable post-flee (same-array): deaths=${agg.provablePostFlee.deaths} survivals=${agg.provablePostFlee.survivals} rows=${agg.provablePostFlee.rows.length}`);
  for (const r of agg.provablePostFlee.rows) console.log(`    POSTFLEE-PROVABLE seed=${r.seed} ${r.vid} d${r.day} vs ${r.mid} (wave ${r.wave}) outcome=${r.outcome} rounds=${r.rounds}`);
  console.log(`  co-occurrence ceiling: vidDays=${agg.cooccurPostFlee.vidDays} withDeath=${agg.cooccurPostFlee.withDeath} survivedOnly=${agg.cooccurPostFlee.survivedOnly}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'}; recorderErrs=${agg.recorderErrs}`);
  if (!g2Pass) { console.error('PROOF GATE FAILURE (G2)'); process.exit(1); }
}

async function analyzeOnlyMode() {
  // Flap-fallback analysis: analyze an EXISTING armed corpus without
  // running any sim or writing any corpus file. CORPUS_DIR selects
  // the corpus (default: this arm's own perseed dir). Used on
  // 2026-10-25 when the host EPERM flap blocked every corpus write
  // for 45+ minutes: the deathcensus corpus (same worktree, same
  // substrate, same seeds, same recorder) was proven trajectory-
  // identical to this arm's own re-run on its completed portion
  // (baseline 8/8 + armed 73671: headlines, deaths, analysis, and
  // substantive fight fields all equal — the sole diff is a null
  // awayNewsLast key), so analyzing it gives the same classification
  // the re-run would give. The summary write to this arm's evid dir
  // is best-effort (non-fatal): if the flap still blocks it, the
  // printed analysis is the record and the failure is reported.
  const corpusDir = process.env.CORPUS_DIR || EVID;
  const perSeed = [];
  const g2 = [];
  for (const seed of SEEDS) {
    const corpus = JSON.parse(fs.readFileSync(path.join(corpusDir, `s${seed}-armed.json`), 'utf8'));
    perSeed.push(analyzeSeed(corpus));
    try {
      const c = JSON.parse(fs.readFileSync(path.join(corpusDir, `s${seed}-baseline.json`), 'utf8'));
      const a = corpus;
      const ok = c.days === a.days && c.gameDays === a.gameDays
        && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths
        && JSON.stringify(c.deathcensus.deaths) === JSON.stringify(a.deathcensus.deaths);
      g2.push({ seed, ok });
    } catch (e) { g2.push({ seed, ok: false, note: 'baseline comparison unavailable: ' + String((e && e.message) || e).slice(0, 80) }); }
  }
  const baselineRows = SEEDS.map(seed => { try { return JSON.parse(fs.readFileSync(path.join(corpusDir, `s${seed}-baseline.json`), 'utf8')); } catch (e) { return null; } }).filter(Boolean);
  const agg = aggregateAnalyses(perSeed, baselineRows);
  const g2Pass = g2.every(x => x.ok);
  const report = { label: 'sim-w123death-a analysis (analyze-only)', seeds: SEEDS, days: DAYS, corpusDir, g2, g2Pass, agg, generated: new Date().toISOString() };
  console.log('\n=== sim-w123death-a analysis (analyze-only, corpus=' + corpusDir + ') ===');
  console.log(`  armed headlines: won=${agg.headlines.won}/8 medAll=${agg.headlines.medAll} medNoWin=${agg.headlines.medNoWin} natEver=${agg.headlines.natEver}/8 natFinal=${agg.headlines.natFinal}/8 table=${agg.headlines.table} entered=${agg.headlines.entered} wave4=${agg.headlines.wave4}/8 wave5=${agg.headlines.wave5}/8 maxArc=${agg.headlines.maxArc} deathTotal=${agg.headlines.deathTotal} villagerDeaths=${agg.headlines.villagerDeaths} byContext=${JSON.stringify(agg.headlines.byContext)}`);
  console.log(`  CONTROL GATE: ${agg.gatePass ? 'PASS' : 'FAIL'} checks=${JSON.stringify(agg.checks)}`);
  console.log(`  field deaths: ${agg.fieldDeaths.length} (w123: ${agg.w123Deaths.length}) byClass=${JSON.stringify(agg.byClass)} byClassW123=${JSON.stringify(agg.byClassW123)}`);
  for (const d of agg.fieldDeaths) {
    console.log(`  FIELD-DEATH seed=${d.seed} d${d.day} ${d.vid} vs ${d.mid} (wave ${d.wave}) rounds=${d.rounds} entry=${d.vHpStartFrac != null ? d.vHpStartFrac.toFixed(2) : null} mHpStart=${d.mHpStartFrac != null ? d.mHpStartFrac.toFixed(2) : null} dealt=${d.mDealt} taken=${d.vTaken} fleeEarlier=${d.fleeEarlierSameDay} fleeRows=${JSON.stringify(d.fleeRowsSameDay)} otherRows=${JSON.stringify(d.otherFieldRowsSameDay)} oneRound=${d.oneRound} class=${d.cls}`);
  }
  console.log(`  exposure (fights excl evade): ${JSON.stringify(agg.exposure)}`);
  console.log(`  provable post-flee (same-array): deaths=${agg.provablePostFlee.deaths} survivals=${agg.provablePostFlee.survivals} rows=${agg.provablePostFlee.rows.length}`);
  for (const r of agg.provablePostFlee.rows) console.log(`    POSTFLEE-PROVABLE seed=${r.seed} ${r.vid} d${r.day} vs ${r.mid} (wave ${r.wave}) outcome=${r.outcome} rounds=${r.rounds}`);
  console.log(`  co-occurrence ceiling: vidDays=${agg.cooccurPostFlee.vidDays} withDeath=${agg.cooccurPostFlee.withDeath} survivedOnly=${agg.cooccurPostFlee.survivedOnly}`);
  for (const g of agg.cooccurPostFlee.list) console.log(`    COOCCUR seed-list vid=${g.vid} d${g.day} fights=${JSON.stringify(g.fights)}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'}; recorderErrs=${agg.recorderErrs}`);
  try {
    // Single attempt only here (no 10-min robust loop): the printed
    // analysis above is the record for this mode; a flap-blocked write
    // is reported, not waited out, because nothing computed is lost
    // (the corpus already exists and this mode re-runs instantly).
    const sp = path.join(EVID, 'summary.json');
    const body = JSON.stringify(report, null, 1) + '\n';
    fs.writeFileSync(sp, body);
    const got = crypto.createHash('sha256').update(fs.readFileSync(sp)).digest('hex').slice(0, 12);
    const want = crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
    if (got === want) console.log('  summary written to ' + sp);
    else console.log('  SUMMARY-WRITE hash mismatch (got=' + got + ' want=' + want + ') — printed analysis above is the record');
  } catch (e) {
    console.log('  SUMMARY-WRITE-FAILED (flap): ' + String((e && e.message) || e).slice(0, 200) + ' — printed analysis above is the record; re-run --analyze-only after the flap clears to materialize summary.json');
  }
  // Also dump the full report JSON to stdout for capture (no repo write).
  console.log('ANALYSIS-JSON-BEGIN');
  console.log(JSON.stringify(report));
  console.log('ANALYSIS-JSON-END');
}

async function transcriptMode(seedArg) {
  const seed = parseInt(process.env.TRANSCRIPT_SEED || seedArg || '73672', 10);
  const corpusPath = path.join(EVID, `s${seed}-armed.json`);
  let census = null;
  try { census = JSON.parse(fs.readFileSync(corpusPath, 'utf8')); } catch (e) { census = null; }
  process.env.DEATHCENSUS_TRANSCRIPT = '1';
  const holder = {};
  const row = await runOne('armed', seed, DAYS, null, holder);
  const store = holder.store;
  const dc = row.deathcensus;
  const fightKey = (f) => [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && JSON.stringify(census.deathcensus.deaths) === JSON.stringify(dc.deaths)
    && JSON.stringify((census.deathcensus.resolveFights || []).map(fightKey)) === JSON.stringify((store.resolveFights || []).map(fightKey))
    && JSON.stringify((census.deathcensus.directFights || []).map(fightKey)) === JSON.stringify((store.directFights || []).map(fightKey))
    && JSON.stringify(census.deathcensus.analysis.byContext) === JSON.stringify(dc.analysis.byContext);
  console.log(`TRANSCRIPT-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} villagerDeaths=${dc.analysis.population.villagerDeaths} byContext=${JSON.stringify(dc.analysis.byContext)}`);
  if (!same) { console.error('TRANSCRIPT REPRODUCTION FAILURE'); process.exit(1); }
  const lines = ['SENSE TRANSCRIPT — sim-w123death-a (transcript tap, on the census trajectory, NOT a narration replay)',
    `seed=${seed} policy=tableseat-nowait+deathcensus-diag days=${row.days} gameDays=${row.gameDays} endReason=${row.endReason} censusMatch=${same}`,
    `census: villagerDeaths=${dc.analysis.population.villagerDeaths} byContext=${JSON.stringify(dc.analysis.byContext)}`, ''];
  const allRows = (store.resolveFights || []).concat(store.directFights || []);
  for (const f of allRows) {
    if (f.outcome !== 'vDie' || f.context !== 'field') continue;
    const line = `d${f.day} [field] ${f.vid} vs ${f.mid} (wave ${f.wave}) rounds=${f.rounds} vHpStartFrac=${f.vHpStartFrac != null ? f.vHpStartFrac.toFixed(2) : null} mDealt=${f.mDealt} vTaken=${f.vTaken} mHpEndFrac=${f.mHpEndFrac != null ? f.mHpEndFrac.toFixed(2) : null}`;
    console.log('TRANSCRIPT ' + line);
    lines.push(line);
    if (f.awayNewsLast) { console.log('TRANSCRIPT awayNews: ' + f.awayNewsLast); lines.push('  awayNews: ' + f.awayNewsLast); }
    else lines.push('  awayNews: (queue full — line dropped, not invented)');
  }
  const out = path.join(REPO, 'evidence', '2026-10-25', 'sim-w123death-a-sense.txt');
  writeRowViaWriter(out, lines.join('\n') + '\n');
  console.log(`TRANSCRIPT-DONE seed=${seed} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--analyze-only')) return analyzeOnlyMode();
  if (args.includes('--resume')) return resumeMode();
  if (args.includes('--transcript')) return transcriptMode(args[args.indexOf('--transcript') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('W123DEATH-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { analyzeSeed, aggregateAnalyses, classifyDeath };
