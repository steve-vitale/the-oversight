#!/usr/bin/env node
// vetaidcrisis-analyze.js — attribution + fight-day contrast for the
// aid-crisis haven-defense channel (arm sim-aidcrisis-b, DIAG).
//
// PART 1 (OFFLINE-PRIMARY): the six vetautopsy killer deaths on the landed
//   vetautopsy corpus (evidence/2026-10-24/perseed-vetautopsy + attribution
//   JSON) — named by (a) crisis active/inactive at death, (b) scholar vs
//   companion, (c) picked-successor / tenure <=14d of first blood.
// PART 2 (FRESH-CENSUS): the vetaidcrisis sweep corpus
//   (evidence/2026-10-24/perseed-aidcrisis) — crisis timeline stats, scholar
//   haven-defense fight-day lethality: crisis vs non-crisis.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const VCORP = path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetautopsy');
const ACORP = path.join(REPO, 'evidence', '2026-10-24', 'perseed-aidcrisis');

const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const vfiles = () => fs.readdirSync(VCORP).filter(f => /^s70\d+-(lead|belong)\.json$/.test(f)).sort();
const afiles = () => fs.readdirSync(ACORP).filter(f => /^s70\d+-(lead|belong)\.json$/.test(f)).sort();

// ---------- PART 1: offline primary on the landed vetautopsy corpus ----------
function primary() {
  const att = load(path.join(REPO, 'evidence', '2026-10-24', 'vetautopsy-attribution.json'));
  const rows = {};
  for (const f of vfiles()) {
    const d = load(path.join(VCORP, f));
    for (const r of d.deathRows) rows[f + '|' + r.who + '|' + r.day] = r;
  }
  const detail = [];
  let missing = 0;
  for (const det of att.detail) {
    const r = rows[det.config + '|' + det.vid + '|' + det.deathDay];
    if (!r) { missing++; continue; }
    detail.push({
      config: det.config, vid: det.vid, deathDay: det.deathDay,
      a_crisisActive: !!r.ctx.aid,
      b_isScholar: r.who === r.scholarVidAtDeath,
      b_player: !!r.player,
      c_pickedSuccessor: !!det.pickedSuccessor,
      c_bloodWindow14d: !!det.bloodWindow14d,
      c_bloodToDeath: det.bloodToDeath,
      atHaven: !!r.ctx.atHaven,
      oppMid: det.oppMid, oppWave: det.oppWave, fightBasis: det.fightBasis,
      armor: det.armor,
    });
  }
  // Corpus-wide: all wave-4+ combat deaths, scholar vs not, crisis at death.
  let w4combat = 0, w4crisis = 0, w4scholar = 0, w4scholarCrisis = 0;
  for (const f of vfiles()) {
    const d = load(path.join(VCORP, f));
    for (const r of d.deathRows) {
      const w = r.wave || 0;
      const combat = /combat|raid|split-fight|aid-runner|sortie/i.test(String(r.cause || '')) || r.fightBasis !== 'none';
      if (w >= 4 && combat && (r.kind === 'person' || r.kind === 'scholar' || r.kind == null || r.player)) {
        w4combat++;
        const scholar = r.who === r.scholarVidAtDeath;
        if (scholar) w4scholar++;
        if (r.ctx.aid) { w4crisis++; if (scholar) w4scholarCrisis++; }
      }
    }
  }
  return { nDeaths: att.detail.length, missing, detail, w4combat, w4crisis, w4scholar, w4scholarCrisis };
}

// ---------- PART 2: fresh census on the vetaidcrisis corpus ----------
// Exact attribution: a scholar combat death is paired to the nearest
// preceding combat_end on the same day whose start had scholarIn=true and
// whose result='lost' (or php<=0). No same-day guessing.
function census() {
  const files = afiles();
  const crises = []; const fights = []; const ends = []; const deaths = []; const successions = [];
  let nFiles = 0;
  for (const f of files) {
    const d = load(path.join(ACORP, f));
    nFiles++;
    for (const e of d.crisisEvents) crises.push(Object.assign({ config: f }, e));
    for (const e of d.fights) fights.push(Object.assign({ config: f }, e));
    for (const e of (d.fightEnds || [])) ends.push(Object.assign({ config: f }, e));
    for (const e of d.deaths) deaths.push(Object.assign({ config: f }, e));
    for (const e of d.successions) successions.push(Object.assign({ config: f }, e));
  }
  const raised = crises.filter(e => e.event === 'raised');
  const resolved = crises.filter(e => e.event === 'resolved');
  const byKind = {};
  for (const e of resolved) { const k = e.kind || 'unknown'; byKind[k] = byKind[k] || { n: 0, how: {} }; byKind[k].n++; byKind[k].how[e.how || '?'] = (byKind[k].how[e.how || '?'] || 0) + 1; }
  const waveDist = {};
  for (const e of resolved) { const w = e.wave == null ? '?' : e.wave; waveDist[w] = (waveDist[w] || 0) + 1; }

  // Scholar wave-4+ haven fight-days (combat_start starts), crisis vs non.
  const sd = { crisis: [], nonCrisis: [] };
  for (const f of fights) {
    if (f.via !== 'combat_start' || !f.scholarIn || (f.wave | 0) < 4 || !f.atHaven) continue;
    (f.crisisActive ? sd.crisis : sd.nonCrisis).push(f);
  }
  // Exact death pairing: nearest preceding same-day combat_end with
  // scholarIn start, result='lost' (or php<=0).
  const paired = [];
  let unpaired = 0;
  for (const e of deaths) {
    if (!e.isScholar || !e.combatCause || !e.atHaven) continue;
    let best = null;
    for (const x of ends) {
      if (x.config !== e.config || x.day !== e.day || !x.scholarIn) continue;
      if (x.seq >= e.seq) continue;
      if (x.result === 'lost' || (x.php != null && x.php <= 0)) {
        if (!best || x.seq > best.seq) best = x;
      }
    }
    if (best && (best.wave | 0) >= 4) paired.push({ death: e, end: best });
    else unpaired++;
  }
  const schDeaths = { crisis: [], nonCrisis: [] };
  for (const p of paired) (p.end.crisisActive ? schDeaths.crisis : schDeaths.nonCrisis).push(p);
  const leth = k => sd[k].length ? (schDeaths[k].length / sd[k].length) : null;
  const ten = k => schDeaths[k].map(p => p.death.tenureDays).filter(x => x != null);
  const blo = k => schDeaths[k].map(p => p.death.bloodTenure).filter(x => x != null);

  return {
    nFiles, nRaised: raised.length, nResolved: resolved.length, byKind, waveDist,
    resolvedHows: (() => { const h = {}; for (const e of resolved) h[e.how || '?'] = (h[e.how || '?'] || 0) + 1; return h; })(),
    crisisDays: resolved.map(e => e.crisisDays).filter(x => x != null),
    fightDaysCrisis: sd.crisis.length, fightDaysNonCrisis: sd.nonCrisis.length,
    pairedSchDeaths: paired.length, unpairedSchCombatDeaths: unpaired,
    schDeathsCrisis: schDeaths.crisis.length, schDeathsNonCrisis: schDeaths.nonCrisis.length,
    lethCrisis: leth('crisis'), lethNonCrisis: leth('nonCrisis'),
    tenureCrisis: ten('crisis'), tenureNonCrisis: ten('nonCrisis'),
    bloodCrisis: blo('crisis'), bloodNonCrisis: blo('nonCrisis'),
    deathDetail: paired.map(p => ({
      config: p.death.config, who: p.death.who, day: p.death.day,
      oppMid: p.end.mid, oppWave: p.end.wave, endResult: p.end.result, endPhp: p.end.php,
      crisisActive: p.end.crisisActive, crisisName: p.end.crisisName, crisisKind: p.end.crisisKind,
      tenureDays: p.death.tenureDays, bloodTenure: p.death.bloodTenure,
    })),
  };
}

const out = { primary: primary() };
try { out.census = census(); } catch (e) { out.censusError = String((e && e.message) || e); }
console.log(JSON.stringify(out, null, 1));
