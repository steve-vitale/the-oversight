#!/usr/bin/env node
// analyze-seatdriveposttable-20261019.js — seated-table mortality attribution
// analyzer (flesh-out loop arm sim-seatdrive-posttable, run
// fleshout-20261019T2015Z, axis scale-onramp).
//
// Reads the armed corpus at evidence/2026-10-19/perseed-posttable-seatdrive/
// (written by scripts/probe-seatdriveposttable-20261019.js, SEATDRIVE=1) plus
// the tier-stamped OFF-side series at
// evidence/2026-10-19/seatdriveposttable-fidelity/ (FIDELITY=1 + FIDWRITE=1,
// SEATDRIVE=0) plus the committed control corpus at
// evidence/2026-10-19/perseed-posttable/ (SEATDRIVE=0, reused not re-run).
// Writes seatdriveposttable-corpus-summary.json + seatdriveposttable-taxonomy.md.
//
// The per-run attribution reuses scripts/analyze-posttable-20261019.js's
// attribute() (the parent arm's post-table machinery) and layers the SEATED
// attribution on top: invitation→sitting conversion, per-run seated
// survival, seated deaths (day >= sittingDay) split during-table vs
// post-table, channel + killer-wave per seated death, the overtime-tier
// dose-response (deaths per tier-day), and the armed-vs-control before/after.
//
// Usage: node scripts/analyze-seatdriveposttable-20261019.js [--out <dir>]
// Exports { seatAttribute, doseResponse, loadCorpus } for the proof test.
'use strict';
const fs = require('fs');
const path = require('path');
const PARENT = require('./analyze-posttable-20261019');

const REPO = path.join(__dirname, '..');
const ARMED_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-posttable-seatdrive');
const FID_DIR = path.join(REPO, 'evidence', '2026-10-19', 'seatdriveposttable-fidelity');
const CONTROL_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-posttable');
const POLICIES = ['leadfeast', 'belongfeast'];
const OUT_DIR = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-19'));

// The w5census 0-byte lesson: validate every per-seed file BEFORE
// aggregating; never trust a successful shell exit as proof the reads
// inside succeeded.
function loadCorpus(dir) {
  const recs = [];
  const bad = [];
  for (const policyId of POLICIES) {
    const pdir = path.join(dir, policyId);
    if (!fs.existsSync(pdir)) { bad.push(`${policyId}/<missing-dir>`); continue; }
    for (const f of fs.readdirSync(pdir).filter(ff => /^s\d+\.json$/.test(ff)).sort()) {
      const fp = path.join(pdir, f);
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

// seatAttribute(rec): the seated-table attribution layered on the parent
// arm's attribute().
// - invitation outcome: won | sat | withdrawn | invitation-only | no-table
//   (the invitation-vs-sitting distinction, recorded separately).
// - seated survival: sittingDay -> gameDays (death/end), seatedDays.
// - seated deaths: day >= sittingDay, split during-table
//   (sittingDay <= day <= tableDoneDay ?? endDay — sanctity applies) and
//   post-table (tableDoneDay != null && day > tableDoneDay).
// - channel + killer-wave per seated death (the parent join).
// - tier-at-death per seated death (the dose-response stamp).
function seatAttribute(rec) {
  const base = PARENT.attribute(rec);
  const sittingDay = rec.sittingDay;
  const sat = rec.satEver === true && sittingDay != null;
  const tableDoneDay = rec.tableDoneDay;
  const endDay = rec.gameDays | 0;
  // Seated deaths: the killer-wave join is applied by the parent's
  // attribute() (joinKillerWave mutates the shared death objects).
  const allDeaths = (((rec.deathsAttributed || {}).attributed) || []);
  const seated = sat ? allDeaths.filter(d => (d.day | 0) >= (sittingDay | 0)) : [];
  const doneDay = tableDoneDay != null ? (tableDoneDay | 0) : null;
  const during = seated.filter(d => doneDay == null || (d.day | 0) <= doneDay);
  const post = doneDay != null ? seated.filter(d => (d.day | 0) > doneDay) : [];
  const channels = {};
  for (const d of seated) channels[d.channel] = (channels[d.channel] || 0) + 1;
  const waves = {};
  for (const d of seated) {
    const w = d.killerWave == null ? 'unmapped' : 'w' + d.killerWave;
    waves[w] = (waves[w] || 0) + 1;
  }
  const tiers = {};
  for (const d of seated) {
    const t = (d.tableAtDeath || {}).otier;
    const k = t == null ? 'null' : 't' + t;
    tiers[k] = (tiers[k] || 0) + 1;
  }
  const seatedDays = sat ? Math.max(0, endDay - (sittingDay | 0)) : null;
  const duringScholar = during.filter(d => d.player).length;
  const postScholar = post.filter(d => d.player).length;
  return Object.assign({}, base, {
    otierMax: rec.otierMax | 0,
    seated: {
      sat, sittingDay, seatAtSit: rec.seatAtSit || null, tableDoneDay,
      seatedDays, duringTableDays: sat ? Math.max(0, (doneDay == null ? endDay : doneDay) - (sittingDay | 0)) : null,
      count: seated.length, during: during.length, post: post.length,
      duringScholar, duringVillager: during.length - duringScholar,
      postScholar, postVillager: post.length - postScholar,
      channels, waves, tiers,
      rows: seated.map(d => ({
        day: d.day, name: d.name, player: d.player, cause: d.cause,
        channel: d.channel, rule: d.rule, killerWave: d.killerWave, killerMid: d.killerMid,
        dayAfterSit: (d.day | 0) - (sittingDay | 0),
        duringTable: doneDay == null || (d.day | 0) <= doneDay,
        otier: (d.tableAtDeath || {}).otier,
        pantry: (d.stateAtDeath || {}).pantry, roster: (d.stateAtDeath || {}).roster,
        tablePhase: (d.tableAtDeath || {}).phase, tablePath: (d.tableAtDeath || {}).path,
        tableBranch: (d.tableAtDeath || {}).branch, tableActive: (d.tableAtDeath || {}).active,
      })),
    },
  });
}

// doseResponse(recsList): deaths per tier-day across tier-stamped corpora.
// Tier-days come from daily recs (otier per rec); tier-deaths from death
// recs (tableAtDeath.otier). recsList = [{label, recs}] — the armed corpus
// plus the tier-stamped OFF-side fidelity series.
function doseResponse(recsList) {
  const tierDays = {}, tierDeaths = {};
  for (const { recs } of recsList) {
    for (const r of recs) {
      for (const rec of (r.recs || [])) {
        const t = rec.otier;
        if (t == null) continue;
        tierDays[t] = (tierDays[t] || 0) + 1;
      }
      const deaths = (((r.deathsAttributed || {}).attributed) || []);
      for (const d of deaths) {
        const t = (d.tableAtDeath || {}).otier;
        if (t == null) continue;
        tierDeaths[t] = (tierDeaths[t] || 0) + 1;
      }
    }
  }
  const tiers = [...new Set([...Object.keys(tierDays), ...Object.keys(tierDeaths)])]
    .map(Number).sort((a, b) => a - b);
  return tiers.map(t => ({
    tier: t,
    tierDays: tierDays[t] || 0,
    deaths: tierDeaths[t] || 0,
    deathsPer100Days: (tierDays[t] || 0) > 0 ? Math.round((tierDeaths[t] || 0) * 10000 / (tierDays[t] || 0)) / 100 : null,
  }));
}

function writeOutputs() {
  const { recs, bad } = loadCorpus(ARMED_DIR);
  if (bad.length) { console.error('BAD FILES:', bad.join(', ')); process.exit(2); }
  const attrs = recs.map(seatAttribute);
  const n = attrs.length;
  const agg = (f) => attrs.filter(f).length;
  // Wall (armed).
  const wall = {
    national: agg(a => a.wall.national), table: agg(a => a.wall.table), wins: agg(a => a.wall.won),
    wave4: agg(a => a.wall.wave45), wave5: agg(a => a.wall.wave5), exiled: agg(a => a.wall.exiled),
  };
  const survivals = attrs.map(a => a.wall.gameDays).sort((x, y) => x - y);
  const median = survivals.length % 2 ? survivals[(survivals.length - 1) / 2]
    : (survivals[survivals.length / 2 - 1] + survivals[survivals.length / 2]) / 2;
  const ends = {};
  for (const a of attrs) ends[a.wall.endReason] = (ends[a.wall.endReason] || 0) + 1;
  const outcomes = {};
  for (const a of attrs) outcomes[a.table.tableOutcome] = (outcomes[a.table.tableOutcome] || 0) + 1;
  // Invitation->sitting conversion (the backlog distinction). The invitation
  // (tableWaiting ever observed) and the sitting (tableSittingId>0 ever) are
  // separate facts: the seat drive can take the seat the same dawn the
  // invitation appears, so fast sittings never show a waiting==true daily
  // rec. "Invited" = the table was ever pending OR sat.
  const invited = attrs.filter(a => a.table.reached || a.seated.sat).length;
  const sat = agg(a => a.seated.sat);
  const conversion = invited ? Math.round(sat / invited * 1000) / 10 : null;
  // Seated deaths.
  const seatedRuns = attrs.filter(a => a.seated.sat);
  const seatedDeaths = seatedRuns.flatMap(a => a.seated.rows);
  const sChannels = {};
  for (const d of seatedDeaths) sChannels[d.channel] = (sChannels[d.channel] || 0) + 1;
  const sWaves = {};
  for (const d of seatedDeaths) {
    const w = d.killerWave == null ? 'unmapped' : 'w' + d.killerWave;
    sWaves[w] = (sWaves[w] || 0) + 1;
  }
  const sTiers = {};
  for (const d of seatedDeaths) {
    const k = d.otier == null ? 'null' : 't' + d.otier;
    sTiers[k] = (sTiers[k] || 0) + 1;
  }
  const duringDeaths = seatedDeaths.filter(d => d.duringTable).length;
  const postDeaths = seatedDeaths.length - duringDeaths;
  // #1 seated channel with the margin over #2 (the pre-registered bar).
  const chSorted = Object.entries(sChannels).sort((a, b) => b[1] - a[1]);
  const ch1 = chSorted[0] || ['none', 0], ch2 = chSorted[1] || ['none', 0];
  const margin = ch2[1] > 0 ? Math.round(ch1[1] / ch2[1] * 100) / 100 : (ch1[1] > 0 ? Infinity : null);
  // Per-run seated survival.
  const seatedSurvivals = seatedRuns.map(a => ({ run: `${a.policyId}-s${a.seed}`, sittingDay: a.seated.sittingDay, seatedDays: a.seated.seatedDays, end: a.wall.endReason, seatedDeaths: a.seated.count, during: a.seated.during, phases: a.table.phasesSeen.join('+') || '—' }));
  const medianSeated = seatedSurvivals.length ? seatedSurvivals.map(s => s.seatedDays).sort((a, b) => a - b)[Math.floor(seatedSurvivals.length / 2)] : null;
  // Tier-stamp completeness (the pre-registered bar): recs with otier null.
  const nullRecs = recs.reduce((t, r) => t + ((r.recs || []).filter(x => x.otier == null).length), 0);
  const totalRecs = recs.reduce((t, r) => t + (r.recs || []).length, 0);
  const nullDeathTiers = seatedDeaths.filter(d => d.otier == null).length;
  // Death rates: pre-table vs post-sitting (armed) — the control measured
  // pre 0.080/day -> post 0.157/day on the never-sat substrate.
  let preDays = 0, preDeaths = 0, postSitDays = 0, postSitDeaths = 0;
  for (const r of recs) {
    const td = r.tableDay, sd = r.sittingDay;
    for (const rec of (r.recs || [])) {
      if (td != null && rec.d >= td && sd != null && rec.d >= sd) postSitDays++;
      else if (td == null || rec.d < td) preDays++;
    }
    const deaths = (((r.deathsAttributed || {}).attributed) || []);
    for (const d of deaths) {
      if (sd != null && d.day >= sd) postSitDeaths++;
      else if (td == null || d.day < td) preDeaths++;
    }
  }
  // Dose-response: armed corpus + the tier-stamped OFF-side fidelity series.
  const fid = loadCorpus(FID_DIR);
  const dose = doseResponse([{ label: 'armed', recs }, { label: 'fidelity-offside', recs: fid.recs }]);
  // Control before/after (the committed SEATDRIVE=0 corpus, reused).
  const ctrl = loadCorpus(CONTROL_DIR);
  const cAttrs = ctrl.recs.map(a => PARENT.attribute(a));
  const cn = cAttrs.length;
  const cagg = (f) => cAttrs.filter(f).length;
  const cSurv = cAttrs.map(a => a.wall.gameDays).sort((x, y) => x - y);
  const cMedian = cSurv.length % 2 ? cSurv[(cSurv.length - 1) / 2]
    : (cSurv[cSurv.length / 2 - 1] + cSurv[cSurv.length / 2]) / 2;
  const unattributed = attrs.reduce((t, a) => t + a.deaths.unattributed, 0);
  const fullyAttributed = seatedRuns.filter(a => a.deaths.unattributed === 0).length;
  const corpus = {
    arm: 'sim-seatdrive-posttable', generatedUtc: new Date().toISOString(),
    n, seeds: attrs.map(a => a.seed).sort((x, y) => x - y),
    substrate: 'seatdrive-win-side', controlSubstrate: 'pre-seat-win-side',
    wall, medianSurvival: median, maxSurvival: survivals[survivals.length - 1],
    endReasons: ends,
    tableOutcomes: outcomes,
    invited, satEver: sat, invitationToSitting: conversion,
    seatedRuns: seatedRuns.length, medianSeatedDays: medianSeated,
    seatedDeaths: seatedDeaths.length, seatedDuringTable: duringDeaths, seatedPostTable: postDeaths,
    seatedChannels: sChannels, seatedWaves: sWaves, seatedTiers: sTiers,
    seatedChannelRank: chSorted.map(([c, k]) => `${c}:${k}`).join(', '),
    seatedChannelMargin: margin === Infinity ? 'inf' : margin,
    tierStamp: { totalRecs, nullRecs, nullDeathTiers },
    deathRates: {
      preTablePerDay: preDays ? Math.round(preDeaths / preDays * 1000) / 1000 : null,
      postSitPerDay: postSitDays ? Math.round(postSitDeaths / postSitDays * 1000) / 1000 : null,
      controlPrePerDay: 0.080, controlPostPerDay: 0.157, // parent arm, committed
    },
    doseResponse: dose, fidelityRuns: fid.recs.length, fidelityBad: fid.bad.length,
    control: {
      n: cn, bad: ctrl.bad.length,
      wall: { national: cagg(a => a.wall.national), table: cagg(a => a.wall.table), wins: cagg(a => a.wall.won), wave4: cagg(a => a.wall.wave45), wave5: cagg(a => a.wall.wave5) },
      medianSurvival: cMedian, maxSurvival: cSurv[cSurv.length - 1],
    },
    unattributedTotal: unattributed,
    seatedRunsFullyAttributed: fullyAttributed,
    perRun: attrs.map(a => ({
      seed: a.seed, policyId: a.policyId,
      end: `${a.wall.endReason}:d${a.wall.gameDays}`, won: a.wall.won,
      national: a.wall.national, wave: a.wall.wave45 ? (a.wall.wave5 ? 5 : 4) : '—',
      table: a.table.tableOutcome, tableDay: a.table.tableDay,
      sat: a.seated.sat, sittingDay: a.seated.sittingDay, seat: a.seated.seatAtSit,
      seatedDays: a.seated.seatedDays, phases: a.table.phasesSeen.join('+') || '—',
      activeDays: a.table.tableActiveDays, done: a.tableDoneDay,
      seatedDeaths: a.seated.count, during: a.seated.during, post: a.seated.post,
      otierMax: a.otierMax,
      unmet: a.unmet.join(',') || '—',
    })),
    seatedSurvivals,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'seatdriveposttable-corpus-summary.json'), JSON.stringify(corpus, null, 1) + '\n');
  // Taxonomy markdown.
  const lines = [];
  lines.push('# sim-seatdrive-posttable — seated-table mortality taxonomy (2026-10-19)');
  lines.push('');
  lines.push(`**Corpus:** ${n} armed runs (seeds ${corpus.seeds.join(', ')} x {leadfeast,belongfeast}), substrate seatdrive-win-side (SEATDRIVE=1), 180d death-aware. Control: the committed pre-seat corpus (n=${cn}, SEATDRIVE=0, base e374e9a3a — reused, not re-run).`);
  lines.push('');
  lines.push(`**Wall (armed):** national ${wall.national}/${n}, table ${wall.table}/${n}, wins ${wall.wins}/${n}, wave-4 ${wall.wave4}/${n}, wave-5 ${wall.wave5}/${n}, median survival ${median}d, max ${corpus.maxSurvival}d.`);
  lines.push(`**Wall (control):** national ${corpus.control.wall.national}/${cn}, table ${corpus.control.wall.table}/${cn}, wins ${corpus.control.wall.wins}/${cn}, wave-4 ${corpus.control.wall.wave4}/${cn}, wave-5 ${corpus.control.wall.wave5}/${cn}, median survival ${cMedian}d.`);
  lines.push('');
  lines.push(`**End reasons (armed):** ${Object.entries(ends).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
  lines.push('');
  lines.push(`**Table outcomes (armed):** ${Object.entries(outcomes).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
  lines.push('');
  lines.push(`**Invitation→sitting (the backlog distinction):** ${invited} invitations, ${sat} sittings → conversion ${conversion == null ? '—' : conversion + '%'} (control: 12 invitations, 0 sittings → 0%).`);
  lines.push('');
  lines.push(`**Seated survival:** ${seatedRuns.length} seated runs, median ${medianSeated == null ? '—' : medianSeated + 'd'} seated (sitting → death/end).`);
  lines.push('');
  lines.push(`**Seated deaths:** ${seatedDeaths.length} (during-table ${duringDeaths}, post-table ${postDeaths}). Channels: ${chSorted.map(([c, k]) => `${c} ${k}`).join(', ')}. #1 margin over #2: ${margin === Infinity ? '∞' : margin + 'x'}.`);
  lines.push(`Waves: ${Object.entries(sWaves).map(([k, v]) => `${k} ${v}`).join(', ')}. Tiers at death: ${Object.entries(sTiers).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
  lines.push('');
  lines.push(`**Death rates:** armed pre-table ${corpus.deathRates.preTablePerDay}/day → post-sitting ${corpus.deathRates.postSitPerDay}/day (control: pre 0.080/day → post-table 0.157/day, 1.97x).`);
  lines.push('');
  lines.push('**Overtime dose-response (deaths per 100 tier-days, armed + fidelity OFF-side series):**');
  lines.push('');
  lines.push('| tier | tier-days | deaths | deaths/100d |');
  lines.push('|---|---|---|---|');
  for (const d of dose) lines.push(`| t${d.tier} | ${d.tierDays} | ${d.deaths} | ${d.deathsPer100Days == null ? '—' : d.deathsPer100Days} |`);
  lines.push('');
  lines.push(`**Tier-stamp completeness:** ${totalRecs} daily recs, ${nullRecs} null otier; ${seatedDeaths.length} seated deaths, ${nullDeathTiers} null otier.`);
  lines.push('');
  lines.push(`**Attribution:** ${fullyAttributed}/${seatedRuns.length} seated runs fully attributed (0 unattributed); ${unattributed} unattributed deaths total (armed corpus).`);
  lines.push('');
  lines.push('## Per-run seated trace');
  lines.push('');
  lines.push('| run | end | nat | wave | table | tday | sat (seat) | seatedDays | phases | activeDays | done | seatedDeaths (dur/post) | unmet |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const a of attrs) {
    lines.push(`| ${a.policyId}-s${a.seed} | ${a.wall.endReason}:d${a.wall.gameDays} | ${a.wall.national ? 1 : 0} | ${a.wall.wave45 ? (a.wall.wave5 ? 5 : 4) : '—'} | ${a.table.tableOutcome} | ${a.table.tableDay == null ? '—' : 'd' + a.table.tableDay} | ${a.seated.sat ? 'd' + a.seated.sittingDay + ' (' + (a.seated.seatAtSit || '?') + ')' : '—'} | ${a.seated.seatedDays == null ? '—' : a.seated.seatedDays} | ${a.table.phasesSeen.join('+') || '—'} | ${a.table.tableActiveDays} | ${a.table.tableDoneDay == null ? '—' : 'd' + a.table.tableDoneDay} | ${a.seated.count} (${a.seated.during}/${a.seated.post}) | ${a.unmet.join(',') || '—'} |`);
  }
  lines.push('');
  lines.push('## Seated death rows (day-after-sitting indexed)');
  lines.push('');
  lines.push('| run | day (d+after sit) | who | cause | channel | kwave | tier | pantry | roster | phase | path | branch | active |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const a of attrs) {
    for (const d of a.seated.rows) {
      lines.push(`| ${a.policyId}-s${a.seed} | d${d.day} (+${d.dayAfterSit})${d.duringTable ? '' : ' [post-table]'} | ${d.name}${d.player ? ' (scholar)' : ''} | ${d.cause} | ${d.channel} | ${d.killerWave == null ? '—' : 'w' + d.killerWave} | ${d.otier == null ? '—' : 't' + d.otier} | ${d.pantry == null ? '—' : d.pantry} | ${d.roster == null ? '—' : d.roster} | ${d.tablePhase || '—'} | ${d.tablePath || '—'} | ${d.tableBranch || '—'} | ${d.tableActive ? 1 : 0} |`);
    }
  }
  lines.push('');
  fs.writeFileSync(path.join(OUT_DIR, 'seatdriveposttable-taxonomy.md'), lines.join('\n'));
  console.log(`seatdriveposttable: ${n} runs, wall national=${wall.national} table=${wall.table} wins=${wall.wins} wave4=${wall.wave4} wave5=${wall.wave5}, outcomes=${JSON.stringify(outcomes)}, invited=${invited} sat=${sat} (${conversion}%), seatedDeaths=${seatedDeaths.length} (during ${duringDeaths}/post ${postDeaths}), #1 channel ${ch1[0]}:${ch1[1]} margin=${margin}, nullTierRecs=${nullRecs}/${totalRecs}, unattributed=${unattributed}`);
  return { corpus, attrs };
}

if (require.main === module) writeOutputs();
module.exports = { seatAttribute, doseResponse, loadCorpus, writeOutputs };
