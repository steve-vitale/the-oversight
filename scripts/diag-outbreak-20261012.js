#!/usr/bin/env node
// diag-outbreak-20261012.js — CRISIS LEG r3: disease outbreak at scale.
// Establishes a village (~day 12, oracleV2 competent play), then injects a
// 5-villager mundane-disease outbreak (the same v.sick record shape the
// engine writes) and runs 14 more days, tracking:
//   - who tends whom (villagerCareTick wrap), diagnoses, treatments
//   - deaths / recoveries, favor/want flow, news-feed sensibility
//   - the medic-down case: what happens when the only medic is sick
// Usage: SEED=424242 DAYS_PRE=12 DAYS_POST=14 node scripts/diag-outbreak-20261012.js
// Output: JSON record to stdout; narrative lines + census to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '424242', 10);
const DAYS_PRE = parseInt(process.env.DAYS_PRE || '12', 10);
const DAYS_POST = parseInt(process.env.DAYS_POST || '14', 10);

function rawName(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) return rc.name;
  } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function isMedic(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (!p || p.dead) return false;
    const occ = String(p.formerOccupation || '').toLowerCase();
    return /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i.test(occ);
  } catch (e) { return false; }
}

async function main() {
  const { Game, manifest } = await loadGame({ seed: SEED, mode: 'outbreak-probe', fullTelemetry: true });
  await setupGame(Game);
  const day = () => { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } };

  // ---- narrative capture ----
  const lines = [];
  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    if (/🤒|🤢|💀|tended|sick|fever|cramps|mending|mend|diagnos|healer|medic|doctor|cure|treat/i.test(s))
      lines.push({ day: day(), text: s.slice(0, 280) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- care tracking ----
  const tends = [];      // {day, medic, target, targetDaysLeft}
  const _vct = Game.villagerCareTick;
  Game.villagerCareTick = function (nm) {
    const v = this.state.village || {};
    const before = JSON.stringify(v.sick || {});
    const r = _vct ? _vct.call(this, nm) : undefined;
    // diff: any daysLeft that dropped by exactly the tend amount (-1) counts
    try {
      const after = v.sick || {};
      const b = JSON.parse(before);
      for (const vid of Object.keys(after)) {
        if (b[vid] && after[vid].daysLeft === b[vid].daysLeft - 1)
          tends.push({ day: day(), target: firstName(rawName(Game, vid)), vid: String(vid).slice(0, 12) });
      }
    } catch (e) {}
    return r;
  };

  // ---- death / recovery tracking ----
  const deaths = [], recoveries = [];
  const sickSeen = new Map(); // vid -> name
  const scanSick = (label) => {
    const v = Game.state.village || {};
    const now = new Set(Object.keys(v.sick || {}));
    for (const vid of now) {
      if (!sickSeen.has(vid)) {
        sickSeen.set(vid, (v.sick[vid] || {}).name || '?');
        deaths; // placeholder
      }
    }
    for (const vid of [...sickSeen.keys()]) {
      if (!now.has(vid)) {
        const alive = (v.roster || []).map(String).includes(String(vid));
        const nm = firstName(rawName(Game, vid));
        if (!alive) deaths.push({ day: day(), label, name: nm, of: sickSeen.get(vid) });
        else recoveries.push({ day: day(), label, name: nm, of: sickSeen.get(vid) });
        sickSeen.delete(vid);
      }
    }
  };

  // ---- phase 1: establish ----
  const basePolicy = {
    id: 'outbreak-probe',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try { scanSick('pre'); } catch (e) {}
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };
  const r1 = await runDays(Game, basePolicy, { days: DAYS_PRE, manifest });
  console.error(`pre-phase: ${r1.gameDays}d, end=${r1.endReason}`);

  // MEDICS_DOWN=1: strip medical occupations (probe the no-healer bend/break)
  if (process.env.MEDICS_DOWN === '1') {
    const vv0 = Game.state.village || {};
    for (const id of (vv0.roster || [])) {
      const p = Game.getPerson ? Game.getPerson(id) : null;
      if (p && /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i.test(String(p.formerOccupation || ''))) {
        console.error(`  (probe) ${p.name} stripped of medic occupation`);
        p.formerOccupation = 'laborer';
      }
    }
  }

  // ---- inject the outbreak ----
  const v = Game.state.village || {};
  const cands = (v.roster || []).filter(id => id !== Game.villagerId);
  const medics = cands.filter(id => isMedic(Game, id));
  const inj = cands.slice(0, 5);
  const defs = [
    { name: 'gut rot', daysLeft: 5, severity: 2 },
    { name: 'gut rot', daysLeft: 4, severity: 2 },
    { name: 'the fever', daysLeft: 5, severity: 1 },
    { name: 'wound fever', daysLeft: 6, severity: 3 },
    { name: 'gut rot', daysLeft: 3, severity: 1 },
  ];
  v.sick = v.sick || {};
  const injected = [];
  inj.forEach((vid, i) => {
    const d = defs[i % defs.length];
    v.sick[vid] = { name: d.name, daysLeft: d.daysLeft, severity: d.severity };
    const nm = firstName(rawName(Game, vid));
    injected.push({ name: nm, vid: String(vid).slice(0, 12), medic: medics.map(String).includes(String(vid)), def: d.name + '/sev' + d.severity });
  });
  console.error(`OUTBREAK injected day ${day()}: ${injected.map(x => x.name + '(' + x.def + (x.medic ? ',MEDIC' : '') + ')').join(', ')}`);
  console.error(`medics in village: ${medics.map(id => firstName(rawName(Game, id))).join(', ') || 'NONE'}`);

  // ---- phase 2: the outbreak fortnight ----
  const postPolicy = {
    id: 'outbreak-probe',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try { scanSick('post'); } catch (e) {}
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };
  const r2 = await runDays(Game, postPolicy, { days: DAYS_POST, manifest });

  // ---- report ----
  const rec = {
    seed: SEED, preDays: r1.gameDays, postDays: r2.gameDays, endReason: r2.endReason,
    injected, tends, deaths, recoveries,
    lines: lines.length,
  };
  console.log(JSON.stringify(rec));
  console.error(`\n=== TENDS (${tends.length}) ===`);
  for (const t of tends.slice(0, 40)) console.error(`  d${t.day}: ${t.target} tended`);
  console.error(`\n=== DEATHS (${deaths.length}) ===`);
  for (const d of deaths) console.error(`  d${d.day} [${d.label}]: ${d.name} of ${d.of}`);
  console.error(`\n=== RECOVERIES (${recoveries.length}) ===`);
  for (const d of recoveries) console.error(`  d${d.day} [${d.label}]: ${d.name} of ${d.of}`);
  console.error(`\n=== NARRATIVE (sick/tend/fever, ${lines.length}) ===`);
  const seenL = new Set();
  for (const l of lines) {
    const k = l.text.slice(0, 80);
    if (seenL.has(k)) continue;
    seenL.add(k);
    console.error(`  d${l.day}: ${l.text}`);
    if (seenL.size > 45) { console.error('  ... (truncated)'); break; }
  }
  // census
  console.error(`\n=== CENSUS ===`);
  const vv = Game.state.village || {};
  const alive = new Set((vv.roster || []).map(String));
  for (const vid of (vv.roster || [])) {
    const rc = (vv.rosterChars || {})[vid] || {};
    console.error(`  + ${rc.name || vid} [${rc.occupationId || rc.formerOccupation || '?'}]${isMedic(Game, vid) ? ' MEDIC' : ''} trust=${(vv.trust || {})[vid]}`);
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
