#!/usr/bin/env node
// analyze-posttable-20261019.js — post-table mortality attribution analyzer
// (flesh-out loop arm sim-posttable, run fleshout-20261019T1415Z, axis
// scale-onramp).
//
// Reads evidence/2026-10-19/perseed-posttable/{leadfeast,belongfeast}/s<seed>.json
// (written by scripts/probe-posttable-20261019.js), attributes the
// POST-TABLE-ENTRY deaths (day >= tableDay) with the vetwindow/
// windowsurvive-identical classifier, traces each run's table state
// (invitation → sat/withdrawn → phase trace → win-side state at death),
// and writes the corpus summary JSON + taxonomy markdown.
//
// Usage: node scripts/analyze-posttable-20261019.js [--out <dir>]
// Exports { attribute, loadValid, joinKillerWave } for the transcript probe
// and the proof test.
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-posttable');
const POLICIES = ['leadfeast', 'belongfeast'];
const OUT_DIR = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-19'));

let NAME2WAVE = null;
function nameToWave(name) {
  if (!NAME2WAVE) {
    NAME2WAVE = new Map();
    try {
      const ms = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
      for (const m of (ms.monsters || ms)) {
        if (!m) continue;
        if (m.name) NAME2WAVE.set(String(m.name).toLowerCase(), m.wave | 0 || null);
        if (m.id) NAME2WAVE.set(String(m.id).toLowerCase(), m.wave | 0 || null);
        if (m.id) NAME2WAVE.set(String(m.id).toLowerCase().replace(/_/g, ' '), m.wave | 0 || null);
      }
    } catch (e) { /* static data missing: lookups yield null, honestly */ }
  }
  return NAME2WAVE.get(String(name).toLowerCase()) ?? null;
}
// KILLER-WAVE JOIN — identical-by-construction with
// scripts/analyze-windowsurvive-20261019.js.
function joinKillerWave(rec) {
  const fights = (rec.fightStarts || []).slice().sort((a, b) => (a.day | 0) - (b.day | 0));
  const deaths = (((rec.deathsAttributed || {}).attributed) || []);
  for (const d of deaths) {
    let kw = (d.wave != null) ? (d.wave | 0) : null, km = null, kv = null;
    const nm = nameToWave(d.cause);
    if (nm != null) { kw = nm; km = d.cause; kv = 'name-lookup'; }
    else if (d.cause === 'combat' || d.cause === 'monster') {
      let best = null;
      for (const f of fights) {
        if ((f.day | 0) <= (d.day | 0)) best = f; else break;
      }
      if (best) { kw = best.wave != null ? (best.wave | 0) : null; km = best.mid; kv = best.via; }
    }
    d.killerWave = kw; d.killerMid = km; d.killerVia = kv;
  }
  return deaths;
}

// The w5census 0-byte lesson: validate every per-seed file BEFORE
// aggregating; never trust a successful shell exit as proof the reads
// inside succeeded.
function loadValid() {
  const recs = [];
  const bad = [];
  for (const policyId of POLICIES) {
    const dir = path.join(SWEEP_DIR, policyId);
    if (!fs.existsSync(dir)) { bad.push(`${policyId}/<missing-dir>`); continue; }
    for (const f of fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort()) {
      const fp = path.join(dir, f);
      try {
        const raw = fs.readFileSync(fp, 'utf8');
        if (!raw || raw.length < 100) { bad.push(`${policyId}/${f}:empty`); continue; }
        const r = JSON.parse(raw);
        if (!r || typeof r.seed !== 'number' || !r.deathsAttributed) { bad.push(`${policyId}/${f}:shape`); continue; }
        r.policyId = policyId;
        recs.push(r);
      } catch (e) { bad.push(`${policyId}/${f}:parse:${e.message}`); }
    }
  }
  return { recs, bad };
}

// attribute(rec): per-run post-table mortality attribution.
// - table block: invitation day, sat/withdrawn/never-sat, phase trace,
//   table-active days, withdrawal count, days held post-table.
// - post-table deaths: day >= tableDay, channel taxonomy (copied
//   vetwindow-identical classifier in the probe), day-after-table index,
//   state at death.
// - win-state at death: endRec.tb (phase, path, beat, seat, floorOk,
//   active) + what the win flag requires that sat unmet.
function attribute(rec) {
  const attr = (rec.deathsAttributed || {});
  const deaths = joinKillerWave(rec);
  const tableDay = rec.tableDay;
  const reached = tableDay != null;
  const post = reached ? deaths.filter(d => (d.day | 0) >= (tableDay | 0)) : [];
  // Table-state trace from the daily series: invitation → withdrawal
  // transitions (waiting true→false with no sitting yet), sitting events.
  const recs = rec.recs || [];
  let withdrawals = 0, prevWaiting = false, satAt = null;
  const phasePath = [];
  let phasesSeen = new Set();
  for (const r of recs) {
    const tb = r.tb || {};
    if (tb.waiting && !prevWaiting) phasePath.push(`d${r.d}:invited`);
    if (prevWaiting && !tb.waiting && satAt == null) { withdrawals++; phasePath.push(`d${r.d}:withdrawn`); }
    if (tb.sitting > 0 && satAt == null) { satAt = r.d; phasePath.push(`d${r.d}:sat(seat=${tb.seat || '?'})`); }
    prevWaiting = !!tb.waiting;
    if (tb.phase) phasesSeen.add(tb.phase);
  }
  // Table outcome: won | sat | withdrawn | invitation-only | no-table
  let tableOutcome = 'no-table';
  if (rec.won) tableOutcome = 'won';
  else if (rec.satEver) tableOutcome = 'sat';
  else if (reached && withdrawals > 0) tableOutcome = 'withdrawn';
  else if (reached) tableOutcome = 'invitation-only';
  const endDay = rec.gameDays | 0;
  const daysPostTable = reached ? Math.max(0, endDay - (tableDay | 0)) : null;
  // Scholar successions among post-table deaths (player==true = the scholar persona died).
  const postScholar = post.filter(d => d.player).length;
  const postVillager = post.length - postScholar;
  // Inter-death gaps post-table.
  const pdays = post.map(d => d.day | 0).sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < pdays.length; i++) gaps.push(pdays[i] - pdays[i - 1]);
  const meanGap = gaps.length ? (gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
  // Channel shares post-table.
  const channels = {};
  for (const d of post) channels[d.channel] = (channels[d.channel] || 0) + 1;
  // Wave shares post-table (killer wave).
  const waves = {};
  for (const d of post) {
    const w = d.killerWave == null ? 'unmapped' : 'w' + d.killerWave;
    waves[w] = (waves[w] || 0) + 1;
  }
  // State means at post-table deaths.
  const st = { pantry: [], roster: [], hungryStreak: [] };
  for (const d of post) {
    const s = d.stateAtDeath || {};
    if (typeof s.pantry === 'number' && s.pantry >= 0) st.pantry.push(s.pantry);
    if (typeof s.roster === 'number' && s.roster >= 0) st.roster.push(s.roster);
    if (typeof s.hungryStreak === 'number' && s.hungryStreak >= 0) st.hungryStreak.push(s.hungryStreak);
  }
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  // Win-state at death (the terminal observation): what the win flag
  // requires (a table path's final resolution + day >= 90) and what sat
  // unmet.
  const etb = (rec.endRec && rec.endRec.tb) || {};
  const winState = {
    phase: etb.phase || null, path: etb.path || null, branch: etb.branch || null,
    beat: etb.beat, seat: etb.seat || null, winDeferred: !!etb.winDeferred,
    floorOk: etb.floorOk, tableActive: etb.active,
    waitingAtDeath: !!etb.waiting, doneAtDeath: !!etb.done, sittingAtDeath: etb.sitting | 0,
  };
  const unmet = [];
  if (!rec.won) {
    if (!reached) unmet.push('no-invitation');
    else {
      if (!rec.satEver) unmet.push('seat-never-taken');
      if (etb.phase && etb.phase !== 'done') unmet.push(`phase-stuck:${etb.phase}`);
      if (rec.tableDayFloorOk === false) unmet.push('day-90-floor-unmet-at-invite');
      if (!etb.done) unmet.push('table-never-completed');
    }
  }
  return {
    seed: rec.seed, policyId: rec.policyId, substrate: rec.substrate,
    wall: { won: !!rec.won, national: !!rec.national, table: !!rec.table, wave45: !!rec.wave45, wave5: !!rec.wave5, exiled: !!rec.exiled, endReason: rec.endReason, gameDays: rec.gameDays, nationalDay: rec.nationalDay, wave4Day: rec.wave4Day },
    table: {
      reached, tableDay, tableDayFloorOk: rec.tableDayFloorOk,
      satEver: !!rec.satEver, sittingDay: rec.sittingDay, seatAtSit: rec.seatAtSit,
      tableDoneDay: rec.tableDoneDay, tableActiveDays: rec.tableActiveDays | 0,
      phaseTrace: (rec.phaseTrace || []).slice(), phasesSeen: [...phasesSeen].sort(),
      withdrawals, phasePath, tableOutcome, daysPostTable,
    },
    deaths: {
      rawCount: attr.rawCount | 0, attributedCount: attr.attributedCount | 0,
      phantoms: attr.phantomCount | 0, unattributed: attr.unattributedCount | 0,
      causeSpace: attr.causeSpace || {},
    },
    postTable: {
      count: post.length, scholar: postScholar, villager: postVillager,
      meanGapDays: meanGap == null ? null : Math.round(meanGap * 10) / 10,
      channels, waves,
      meanPantryAtDeath: mean(st.pantry) == null ? null : Math.round(mean(st.pantry)),
      meanRosterAtDeath: mean(st.roster) == null ? null : Math.round(mean(st.roster) * 10) / 10,
      meanHungryStreak: mean(st.hungryStreak) == null ? null : Math.round(mean(st.hungryStreak) * 10) / 10,
      rows: post.map(d => ({
        day: d.day, name: d.name, player: d.player, cause: d.cause,
        channel: d.channel, rule: d.rule, killerWave: d.killerWave, killerMid: d.killerMid,
        dayAfterTable: (d.day | 0) - (tableDay | 0),
        pantry: (d.stateAtDeath || {}).pantry, roster: (d.stateAtDeath || {}).roster,
        tablePhase: (d.tableAtDeath || {}).phase, tablePath: (d.tableAtDeath || {}).path,
        tableActive: (d.tableAtDeath || {}).active,
      })),
    },
    winState, unmet,
  };
}

function writeOutputs() {
  const { recs, bad } = loadValid();
  if (bad.length) { console.error('BAD FILES:', bad.join(', ')); process.exit(2); }
  const attrs = recs.map(attribute);
  // Corpus summary.
  const n = attrs.length;
  const agg = (f) => attrs.filter(f).length;
  const wall = {
    national: agg(a => a.wall.national), table: agg(a => a.wall.table), wins: agg(a => a.wall.won),
    wave4: agg(a => a.wall.wave45), wave5: agg(a => a.wall.wave5), exiled: agg(a => a.wall.exiled),
  };
  const survivals = attrs.map(a => a.wall.gameDays).sort((x, y) => x - y);
  const median = survivals.length % 2 ? survivals[(survivals.length - 1) / 2]
    : (survivals[survivals.length / 2 - 1] + survivals[survivals.length / 2]) / 2;
  const ends = {};
  for (const a of attrs) ends[a.wall.endReason] = (ends[a.wall.endReason] || 0) + 1;
  const reachedRuns = attrs.filter(a => a.table.reached);
  const postDeaths = reachedRuns.flatMap(a => a.postTable.rows);
  const channels = {};
  for (const d of postDeaths) channels[d.channel] = (channels[d.channel] || 0) + 1;
  const outcomes = {};
  for (const a of attrs) outcomes[a.table.tableOutcome] = (outcomes[a.table.tableOutcome] || 0) + 1;
  const unattributed = attrs.reduce((t, a) => t + a.deaths.unattributed, 0);
  const fullyAttributed = reachedRuns.filter(a => a.deaths.unattributed === 0).length;
  const corpus = {
    arm: 'sim-posttable', generatedUtc: new Date().toISOString(),
    n, seeds: attrs.map(a => a.seed).sort((x, y) => x - y),
    wall, medianSurvival: median, maxSurvival: survivals[survivals.length - 1],
    endReasons: ends,
    tableOutcomes: outcomes,
    tableReached: reachedRuns.length,
    satEver: agg(a => a.table.satEver),
    postTableDeaths: postDeaths.length,
    postTableChannels: channels,
    postTableScholar: reachedRuns.reduce((t, a) => t + a.postTable.scholar, 0),
    postTableVillager: reachedRuns.reduce((t, a) => t + a.postTable.villager, 0),
    unattributedTotal: unattributed,
    tableReachingFullyAttributed: fullyAttributed,
    perRun: attrs.map(a => ({
      seed: a.seed, policyId: a.policyId,
      end: `${a.wall.endReason}:d${a.wall.gameDays}`, won: a.wall.won,
      national: a.wall.national, wave: a.wall.wave45 ? (a.wall.wave5 ? 5 : 4) : (a.wall.wave4Day ? 4 : '—'),
      table: a.table.tableOutcome, tableDay: a.table.tableDay,
      sat: a.table.satEver, phases: a.table.phasesSeen.join('+') || '—',
      activeDays: a.table.tableActiveDays, daysPostTable: a.table.daysPostTable,
      postDeaths: a.postTable.count, postScholar: a.postTable.scholar,
      unmet: a.unmet.join(',') || '—',
    })),
  };
  fs.writeFileSync(path.join(OUT_DIR, 'posttable-corpus-summary.json'), JSON.stringify(corpus, null, 1) + '\n');
  // Taxonomy markdown.
  const lines = [];
  lines.push('# sim-posttable — post-table mortality taxonomy (2026-10-19)');
  lines.push('');
  lines.push(`**Corpus:** ${n} runs (seeds ${corpus.seeds.join(', ')}, x {leadfeast,belongfeast}), substrate pre-seat-win-side, 180d death-aware.`);
  lines.push('');
  lines.push(`**Wall:** national ${wall.national}/${n}, table ${wall.table}/${n}, wins ${wall.wins}/${n}, wave-4 ${wall.wave4}/${n}, wave-5 ${wall.wave5}/${n}, median survival ${median}d, max ${corpus.maxSurvival}d.`);
  lines.push('');
  lines.push(`**End reasons:** ${Object.entries(ends).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
  lines.push('');
  lines.push(`**Table outcomes:** ${Object.entries(outcomes).map(([k, v]) => `${k} ${v}`).join(', ')}. Sat ever: ${corpus.satEver}/${n}.`);
  lines.push('');
  lines.push(`**Post-table deaths:** ${corpus.postTableDeaths} (scholar ${corpus.postTableScholar}, villager ${corpus.postTableVillager}). Channels: ${Object.entries(channels).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
  lines.push('');
  lines.push(`**Attribution:** ${fullyAttributed}/${reachedRuns.length} table-reaching runs fully attributed (0 unattributed); ${unattributed} unattributed deaths total.`);
  lines.push('');
  lines.push('## Per-run table trace');
  lines.push('');
  lines.push('| run | end | nat | wave | table | tday | sat | phases | activeDays | daysPostTable | postDeaths (S/V) | unmet |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const a of attrs) {
    lines.push(`| ${a.policyId}-s${a.seed} | ${a.wall.endReason}:d${a.wall.gameDays} | ${a.wall.national ? 1 : 0} | ${a.wall.wave45 ? (a.wall.wave5 ? 5 : 4) : '—'} | ${a.table.tableOutcome} | ${a.table.tableDay == null ? '—' : 'd' + a.table.tableDay} | ${a.table.satEver ? 1 : 0} | ${a.table.phasesSeen.join('+') || '—'} | ${a.table.tableActiveDays} | ${a.table.daysPostTable == null ? '—' : a.table.daysPostTable} | ${a.postTable.count} (${a.postTable.scholar}/${a.postTable.villager}) | ${a.unmet.join(',') || '—'} |`);
  }
  lines.push('');
  lines.push('## Post-table death rows (day-after-table indexed)');
  lines.push('');
  lines.push('| run | day (d+after) | who | cause | channel | kwave | pantry | roster | tablePhase | tableActive |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|');
  for (const a of attrs) {
    for (const d of a.postTable.rows) {
      lines.push(`| ${a.policyId}-s${a.seed} | d${d.day} (+${d.dayAfterTable}) | ${d.name}${d.player ? ' (scholar)' : ''} | ${d.cause} | ${d.channel} | ${d.killerWave == null ? '—' : 'w' + d.killerWave} | ${d.pantry == null ? '—' : d.pantry} | ${d.roster == null ? '—' : d.roster} | ${d.tablePhase || '—'} | ${d.tableActive ? 1 : 0} |`);
    }
  }
  lines.push('');
  fs.writeFileSync(path.join(OUT_DIR, 'posttable-taxonomy.md'), lines.join('\n'));
  console.log(`posttable: ${n} runs, wall national=${wall.national} table=${wall.table} wins=${wall.wins} wave4=${wall.wave4} wave5=${wall.wave5}, outcomes=${JSON.stringify(outcomes)}, postDeaths=${corpus.postTableDeaths}, unattributed=${unattributed}, fullyAttributed=${fullyAttributed}/${reachedRuns.length}`);
  return { corpus, attrs };
}

if (require.main === module) writeOutputs();
module.exports = { attribute, loadValid, joinKillerWave, nameToWave, writeOutputs };
