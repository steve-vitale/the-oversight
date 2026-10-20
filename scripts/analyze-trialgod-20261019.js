#!/usr/bin/env node
// analyze-trialgod-20261019.js — god-build trial attribution analyzer
// (flesh-out loop arm sim-trialgod, run fleshout-20261019T2331Z, axis
// scale-onramp).
//
// Reads the armed corpus at evidence/2026-10-19/perseed-trialgod/
// (written by scripts/probe-trialgod-20261019.js, SEATDRIVE=1 +
// TABLEPATHS=1 + TRIALGOD=1, door='feared' + trial=true on every run) and
// the committed control corpus at
// evidence/2026-10-19/perseed-posttable-seatdrive/ (SEATDRIVE=1,
// TABLEPATHS=0 — no trial opt-in).
//
// Layers on the parent arm's seatAttribute(): the god-build record (prep
// snapshots, sacrifices, abilities used), trial resumes, the trial damage
// ledger (Finale HP, per-round in/out, the round clock), and the trial
// verdict: bearer wins across the corpus (the pre-registered primary),
// plus the guardrails (invitation->sitting >= 70%, no new death mode,
// national/table within +-2 of control).
// Writes evidence/2026-10-19/trialgod-corpus-summary.json.
// Exports { analyzeRun, pathChannel, loadCorpus } for the proof test.
//
// Usage: node scripts/analyze-trialgod-20261019.js [--out <dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const PARENT = require('./analyze-seatdriveposttable-20261019');

const REPO = path.join(__dirname, '..');
const ARMED_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-trialgod');
const CONTROL_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-posttable-seatdrive');
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const OUT_DIR = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-19'));

function loadCorpus(dir) { return PARENT.loadCorpus(dir); }

// pathChannel(d, a): the path-specific mortality channel for one seated
// death — identical-by-construction with analyze-tablepaths.
function pathChannel(d, a) {
  if (!a || !a.sat || (d.day | 0) < (a.sittingDay | 0)) return 'pre-table';
  const tab = d.tableAtDeath || {};
  if (tab.trialPending) return 'trial-combat';
  return 'seated-' + (d.channel || 'other');
}

// trialDamage(rec): group the trial damage ledger by trial (day) — Finale
// HP, rounds fought, per-round in/out, the round clock.
function trialDamage(rec) {
  const rows = rec.trialDmg || [];
  const byDay = {};
  for (const e of rows) {
    const d = e.day | 0;
    (byDay[d] = byDay[d] || []).push(e);
  }
  const trials = [];
  for (const day of Object.keys(byDay).map(Number).sort((a, b) => a - b)) {
    const es = byDay[day];
    const rounds = {};
    let outTot = 0, inTot = 0, maxRound = 0;
    for (const e of es) {
      const r = e.round | 0;
      maxRound = Math.max(maxRound, r);
      (rounds[r] = rounds[r] || { out: 0, in: 0 });
      if (e.target === 'p') { rounds[r].in += e.landed | 0; inTot += e.landed | 0; }
      else { rounds[r].out += e.landed | 0; outTot += e.landed | 0; }
    }
    trials.push({
      day, rounds: maxRound,
      outTotal: outTot, inTotal: inTot,
      perRound: Object.keys(rounds).map(Number).sort((a, b) => a - b)
        .map(r => ({ round: r, out: rounds[r].out, in: rounds[r].in })),
    });
  }
  return trials;
}

// analyzeRun(rec): the full per-run trialgod attribution.
function analyzeRun(rec) {
  const sa = PARENT.seatAttribute(rec);
  const tp = rec.tp || null;
  const tg = rec.tg || null;
  const walked = ((tp && tp.walked) || []).map(w => ({
    day: w.day | 0, path: String(w.path), branch: w.branch != null ? String(w.branch) : null,
    door: w.door != null ? String(w.door) : null, fellBack: !!w.fellBack,
  }));
  const trialResumes = ((rec.trialResumes && rec.trialResumes.length ? rec.trialResumes : (tp && tp.trialResumes) || [])).map(t => ({
    day: t.day | 0, result: t.result != null ? String(t.result) : null,
    bearerDied: !!t.bearerDied, path: t.path != null ? String(t.path) : null,
  }));
  const preps = ((tg && tg.preps) || []).map(p => ({
    day: p.day | 0, round: p.round,
    weapon: p.weapon ? { name: p.weapon.name, bonus: p.weapon.bonus | 0 } : null,
    armorBonus: p.armorBonus, hp: p.hp, maxHp: p.maxHp,
    kcalAfter: p.kcalAfter, kcalCap: p.kcalCap,
    overcharged: !!p.overcharged, feasted: !!p.feasted,
    abilities: p.abilities || [], slots: p.slots,
    finaleHp: p.finaleHp, finaleMaxHp: p.finaleMaxHp,
  }));
  const allDeaths = (((rec.deathsAttributed || {}).attributed) || []);
  const sittingDay = rec.sittingDay;
  const sat = rec.satEver === true && sittingDay != null;
  const seatedDeaths = sat ? allDeaths.filter(d => (d.day | 0) >= (sittingDay | 0)) : [];
  const a = {
    seed: rec.seed, policyId: rec.policyId || rec.policy,
    complete: !!(rec.recs && rec.recs.length > 0),
    endReason: rec.endReason, gameDays: rec.gameDays | 0,
    won: !!rec.won, national: !!rec.national, table: !!rec.table,
    invited: rec.tableDay != null || sat, tableDay: rec.tableDay,
    sat, sittingDay, seat: rec.seatAtSit || null,
    maxWave: rec.maxWave | 0, wave4Day: rec.wave4Day, wave5Day: rec.wave5Day,
    deathsAttributed: rec.deathsAttributed || null,
    assigned: 'feared',
    walked, trialResumes,
    trialFired: trialResumes.length > 0,
    bearerWins: trialResumes.filter(t => t.result === 'won' && !t.bearerDied).length,
    tg: tg ? {
      preps,
      sacrifices: tg.sacrifices | 0, abilities: tg.abilities | 0,
      strikes: tg.strikes | 0, errors: tg.errors | 0,
      fightLog: (tg.fights || []).slice(-60),
    } : null,
    trialDmg: trialDamage(rec),
    instrumentErrors: rec.instrumentErrors | 0,
    kdErrors: rec.kdErrors | 0,
  };
  a.seatedDeaths = seatedDeaths.map(d => ({
    day: d.day | 0, name: d.name, player: !!d.player, cause: d.cause,
    channel: d.channel, rule: d.rule,
    pathChannel: pathChannel(d, a),
    tablePhase: (d.tableAtDeath || {}).phase, tablePath: (d.tableAtDeath || {}).path,
    tableBranch: (d.tableAtDeath || {}).branch,
    trialPending: !!((d.tableAtDeath || {}).trialPending),
  }));
  return Object.assign({}, sa, a);
}

function summarize(recs) {
  const runs = recs.map(analyzeRun);
  const s = {
    n: runs.length,
    complete: runs.filter(r => r.complete).length,
    invited: runs.filter(r => r.invited).length,
    sat: runs.filter(r => r.sat).length,
    won: runs.filter(r => r.won).length,
    national: runs.filter(r => r.national).length,
    table: runs.filter(r => r.table).length,
    wave4: runs.filter(r => (r.maxWave | 0) >= 4).length,
    wave5: runs.filter(r => (r.maxWave | 0) >= 5).length,
    maxWave: Math.max.apply(null, runs.map(r => r.maxWave | 0).concat([0])),
    medianSurvival: 0, maxSurvival: 0,
  };
  const survivals = runs.map(r => r.gameDays | 0).sort((a, b) => a - b);
  if (survivals.length) {
    s.maxSurvival = survivals[survivals.length - 1];
    s.medianSurvival = survivals[Math.floor(survivals.length / 2)];
  }
  // ---- the trial verdict (the pre-registered primary) ----
  const resumes = [];
  for (const r of runs) for (const t of r.trialResumes) resumes.push(Object.assign({ seed: r.seed, policyId: r.policyId }, t));
  const trials = resumes.length;
  const bearerWins = resumes.filter(t => t.result === 'won' && !t.bearerDied).length;
  const bearerDeaths = resumes.filter(t => t.bearerDied).length;
  // ---- damage numbers (the Steve-call surface on a miss) ----
  const dmgTrials = [];
  for (const r of runs) for (const t of r.trialDmg) dmgTrials.push(Object.assign({ seed: r.seed, policyId: r.policyId }, t));
  const preps = [];
  for (const r of runs) if (r.tg) for (const p of r.tg.preps) preps.push(Object.assign({ seed: r.seed, policyId: r.policyId }, p));
  const sacrifices = runs.reduce((n, r) => n + ((r.tg && r.tg.sacrifices) | 0), 0);
  const abilities = runs.reduce((n, r) => n + ((r.tg && r.tg.abilities) | 0), 0);
  const tgErrors = runs.reduce((n, r) => n + ((r.tg && r.tg.errors) | 0), 0);
  // ---- mortality channels ----
  const chanCounts = {};
  const causeSpace = {};
  for (const r of runs) {
    for (const d of r.seatedDeaths) chanCounts[d.pathChannel] = (chanCounts[d.pathChannel] | 0) + 1;
    const cs = ((r.deathsAttributed || {}).causeSpace) || {};
    for (const k of Object.keys(cs)) causeSpace[k] = (causeSpace[k] | 0) + cs[k];
  }
  // ---- guardrails vs the committed seatdrive control ----
  const ctrl = loadCorpus(CONTROL_DIR).recs.map(analyzeRun);
  const cg = {
    n: ctrl.length,
    invited: ctrl.filter(r => r.invited).length,
    sat: ctrl.filter(r => r.sat).length,
    national: ctrl.filter(r => r.national).length,
    table: ctrl.filter(r => r.table).length,
    causeSpace: {},
  };
  for (const r of ctrl) {
    const cs = ((r.deathsAttributed || {}).causeSpace) || {};
    for (const k of Object.keys(cs)) cg.causeSpace[k] = (cg.causeSpace[k] | 0) + cs[k];
  }
  const invConv = s.invited > 0 ? s.sat / s.invited : 0;
  const newModes = Object.keys(causeSpace).filter(k => !(k in cg.causeSpace));
  s.trial = {
    fired: trials, bearerWins, bearerDeaths,
    resumes: resumes.map(t => ({ seed: t.seed, policyId: t.policyId, day: t.day, result: t.result, bearerDied: t.bearerDied })),
    sacrifices, abilitiesUsed: abilities, tgErrors,
    preps: preps.map(p => ({
      seed: p.seed, policyId: p.policyId, day: p.day,
      weapon: p.weapon, armorBonus: p.armorBonus, hp: p.hp, maxHp: p.maxHp,
      kcalAfter: p.kcalAfter, kcalCap: p.kcalCap,
      overcharged: p.overcharged, feasted: p.feasted, abilities: p.abilities,
      finaleHp: p.finaleHp, finaleMaxHp: p.finaleMaxHp,
    })),
    damage: dmgTrials,
  };
  s.guardrails = {
    invitationToSitting: { invited: s.invited, sat: s.sat, conv: +invConv.toFixed(3), bar: 0.7, pass: invConv >= 0.7 },
    newDeathModes: newModes,
    nationalDelta: s.national - cg.national,
    tableDelta: s.table - cg.table,
    withinBand: Math.abs(s.national - cg.national) <= 2 && Math.abs(s.table - cg.table) <= 2,
    control: { n: cg.n, invited: cg.invited, sat: cg.sat, national: cg.national, table: cg.table },
  };
  s.channels = chanCounts;
  s.causeSpace = causeSpace;
  s.runs = runs.map(r => ({
    seed: r.seed, policyId: r.policyId, endReason: r.endReason, gameDays: r.gameDays,
    won: r.won, national: r.national, table: r.table, sat: r.sat, sittingDay: r.sittingDay,
    maxWave: r.maxWave, walked: r.walked.map(w => `${w.path}/${w.branch || '?'}`),
    trials: r.trialResumes.map(t => `${t.result}${t.bearerDied ? '/died' : ''}`),
    tg: r.tg ? { sacrifices: r.tg.sacrifices, abilities: r.tg.abilities, strikes: r.tg.strikes, errors: r.tg.errors } : null,
    seatedDeaths: r.seatedDeaths.map(d => `${d.day}:${d.name}:${d.pathChannel}`),
  }));
  return s;
}

async function main() {
  const { recs, bad } = loadCorpus(ARMED_DIR);
  if (bad.length) console.log(`  load warnings: ${bad.join('; ')}`);
  const s = summarize(recs);
  const out = path.join(OUT_DIR, 'trialgod-corpus-summary.json');
  fs.writeFileSync(out, JSON.stringify({ armed: s }, null, 1));
  console.log(`wrote ${out}`);
  const t = s.trial, g = s.guardrails;
  console.log(`  n=${s.n} complete=${s.complete} invited=${s.invited} sat=${s.sat} won=${s.won} national=${s.national} table=${s.table} wave4=${s.wave4} wave5=${s.wave5}`);
  console.log(`  trials fired=${t.fired} bearerWins=${t.bearerWins} bearerDeaths=${t.bearerDeaths} sacrifices=${t.sacrifices} abilities=${t.abilitiesUsed} tgErrors=${t.tgErrors}`);
  console.log(`  guardrails: inv->sit ${g.invitationToSitting.sat}/${g.invitationToSitting.invited} (${(g.invitationToSitting.conv * 100).toFixed(0)}%, bar 70%, ${g.invitationToSitting.pass ? 'PASS' : 'FAIL'}); newDeathModes=[${g.newDeathModes.join(',') || 'none'}]; nationalΔ=${g.nationalDelta} tableΔ=${g.tableDelta} (${g.withinBand ? 'IN BAND' : 'OUT OF BAND'})`);
  for (const r of s.runs) {
    console.log(`  [${r.policyId} s${r.seed}] end=${r.endReason} won=${r.won} sat=${r.sat} walked=[${r.walked.join(',') || '—'}] trial=[${r.trials.join(',') || '—'}] tg=${r.tg ? `sac=${r.tg.sacrifices} abil=${r.tg.abilities} str=${r.tg.strikes} err=${r.tg.errors}` : '—'} sdeaths=[${r.seatedDeaths.join(',') || '—'}]`);
  }
}

if (require.main === module) main().catch(e => { console.error('ANALYZE FATAL:', e && e.stack || e); process.exit(1); });
module.exports = { analyzeRun, pathChannel, loadCorpus, trialDamage };
