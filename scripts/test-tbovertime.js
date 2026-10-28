#!/usr/bin/env node
// scripts/test-tbovertime.js — sim-tbovertime-a decomposition
// analyzer / proof validator (DIAG ONLY, zero src/js changes).
//
// Reads evidence/2026-10-28/perseed-tbovertime-a/s*-armed.json
// (no re-simulation), builds the construction -> start -> end
// join for world-origin wave-4 TB fights exactly per
// evidence/2026-10-28/sim-tbovertime-a-prereg.md, and checks:
//   - every unit fight joins construction + start + end +
//     direct overtime-tier record by fightId;
//   - direct tier == ratio-inferred tier AND startMax ==
//     round(constrMax * (1 + 0.25*t_rec)) exactly;
//   - opening damage (startMax - startHp) == fighterconstruct
//     opening tbDamage sum for m_0 on that fightId exactly;
//   - the additive identities tile->end and construction->end
//     hold per fight (a failed identity is a hard failure);
//   - in-fight maxHp growth (endMax - startMax) is reported
//     per fight (predicted 0 everywhere);
//   - parity vs the fighterconstruct corpus (per-seed days,
//     gameDays, won, waveReach, nationalEver/Final, table,
//     entered, deathTotal, courtship combined, and the
//     world-origin wave-4 fightId sets).
// Exit 0 only when corpusOk && substrateOk &&
// joined == total && tierDisagreements == 0 &&
// openingDisagreements == 0 && identityFailures == 0 &&
// unexplainedGaps == 0. Parity vs the fighterconstruct corpus
// is PRINTED separately (parityPass + parityDiffs) and is NOT
// a mechanical gate: the prereg's parity rule allows a
// divergence diagnosed with a detgate PASS (base drift —
// here, the world-HP TB rule fa3516cc1 landed between the
// two corpora) to be reported as a diagnosis, never hidden.
// The analyzer never re-scores a
// verdict: it prints the tables; the evidence judges them
// against the prereg. In-fight maxHp growth, if any, is
// REPORTED (it would be a mechanism finding, not a gate
// failure by itself — but it must be cited per fight).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-tbovertime-a');
const PRIOR = process.env.PRIOR || path.join(REPO, 'evidence', '2026-10-28', 'perseed-fighterconstruct-a');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

function loadRow(dir, seed) { return JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8')); }
function loadDefs() {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(raw) ? raw : (raw.monsters || []);
  const m = {};
  for (const d of list) if (d && d.id) m[d.id] = d;
  return m;
}
function f0(fighters) {
  if (!Array.isArray(fighters)) return null;
  return fighters.find(f => f && f.key === 'm_0') || null;
}
function crewOf(fighters) {
  if (!Array.isArray(fighters)) return [];
  return fighters.filter(f => f && typeof f.key === 'string' && f.key.indexOf('m_crew_') === 0);
}
function unitChecks() {
  const fails = [];
  const chk = (name, cond) => { if (!cond) fails.push(name); };
  // Synthetic decomposition identity: tile 975, constr 1475,
  // tier 6 -> startMax 3688, opening 0, end 3688.
  const T = 975, C = 1475, t = 6, Smax = Math.round(C * (1 + 0.25 * t));
  chk('synthetic startMax 3688', Smax === 3688);
  const S = Smax, E = 3688;
  chk('synthetic tile->end identity', (E - T) === (C - T) + (S - C) + (E - S));
  chk('synthetic constr->end identity', (E - C) === (Smax - C) - (Smax - S) + (E - S));
  chk('synthetic inferred tier 6', Math.round((Smax / C - 1) / 0.25) === 6);
  // Synthetic unscaled + opening: constr 1211, opening 71.
  const C2 = 1211, Smax2 = 1211, S2 = 1140, E2 = 832;
  chk('synthetic opening 71', Smax2 - S2 === 71);
  chk('synthetic unscaled identity', (E2 - 825) === (C2 - 825) + (S2 - C2) + (E2 - S2));
  chk('synthetic inferred tier 0', Math.round((Smax2 / C2 - 1) / 0.25) === 0);
  return fails;
}

function main() {
  const fails = unitChecks();
  if (fails.length) { console.error('UNIT CHECK FAILURES:', fails.join(', ')); process.exit(1); }
  const defs = loadDefs();
  const rows = [];
  const gaps = [];
  const fights = [];
  let corpusOk = true;
  const recorderNames = ['raftdraft', 'spawnsrc', 'oldcore', 'w5births', 'defwound', 'nonworldkill', 'tbdmg', 'w4damage', 'fighterconstruct', 'tbovertime'];
  for (const seed of SEEDS) {
    const r = loadRow(CORPUS, seed);
    rows.push(r);
    if (!(r.days > 0)) { corpusOk = false; gaps.push(`seed ${seed}: days not > 0`); }
    for (const name of recorderNames) {
      const rec = r[name];
      if (!rec || !rec.diag || rec.diag.errs !== 0) { corpusOk = false; gaps.push(`seed ${seed}: ${name} errs != 0 or missing`); }
      else if (rec.diag.overflow && Object.values(rec.diag.overflow).some(v => (v | 0) !== 0)) { corpusOk = false; gaps.push(`seed ${seed}: ${name} overflow`); }
    }
    const nw = r.nonworldkill, fc = r.fighterconstruct, tb = r.tbdmg, tbov = r.tbovertime;
    const constrById = new Map();
    for (const c of (fc.constructions || [])) {
      if (!c.fightId) continue;
      if (constrById.has(c.fightId)) gaps.push(`seed ${seed}: duplicate construction fightId ${c.fightId}`);
      else constrById.set(c.fightId, c);
    }
    const openingById = new Map();
    for (const ev of (fc.openingDamage || [])) {
      if (ev.targetKey !== 'm_0' || !ev.fightId) continue;
      const cur = openingById.get(ev.fightId) || { sum: 0, returnedSum: 0, n: 0 };
      cur.sum += ((ev.preHp == null || ev.postHp == null) ? 0 : (ev.preHp - ev.postHp));
      cur.returnedSum += (ev.returned == null ? 0 : ev.returned);
      cur.n++;
      openingById.set(ev.fightId, cur);
    }
    const endById = new Map();
    for (const e of (tb.tbEnds || [])) {
      if (!e.fightId) continue;
      if (endById.has(e.fightId)) gaps.push(`seed ${seed}: duplicate tbEnd fightId ${e.fightId}`);
      else endById.set(e.fightId, e);
    }
    const tierById = new Map();
    for (const s of (tbov.starts || [])) {
      if (s.liveFightPre) continue; // refused call: describes the old live fight, not a new one
      if (!s.fightId) { gaps.push(`seed ${seed}: tbovertime start with no fightId (arg ${s.arg})`); continue; }
      if (tierById.has(s.fightId)) gaps.push(`seed ${seed}: duplicate tbovertime start fightId ${s.fightId}`);
      else tierById.set(s.fightId, s);
    }
    const tbovEndById = new Map();
    for (const e of (tbov.ends || [])) {
      if (!e.fightId) continue;
      if (!tbovEndById.has(e.fightId)) tbovEndById.set(e.fightId, e);
    }
    for (const s of (nw.starts || [])) {
      if (s.wave !== 4 || s.origin !== 'world-origin') continue;
      if (s.refused) { gaps.push(`seed ${seed}: refused world-origin w4 start ${s.fightId}`); continue; }
      if (s.tableTrial) continue;
      const fid = s.fightId;
      const sm = f0(s.fighters);
      const c = constrById.get(fid);
      const cm = c ? f0(c.fighters) : null;
      const e = endById.get(fid);
      const em = e ? f0(e.fighters) : null;
      const tv = tierById.get(fid);
      const te = tbovEndById.get(fid);
      const op = openingById.get(fid) || { sum: 0, returnedSum: 0, n: 0 };
      const tile = s.tileMonster || null;
      const row = {
        seed, day: s.day, monster: s.mid, fightId: fid,
        tileHp: tile ? tile.hp : null, tileMaxHp: tile ? tile.maxHp : null,
        constrHp: cm ? cm.hp : null, constrMaxHp: cm ? cm.maxHp : null,
        startHp: sm ? sm.hp : null, startMaxHp: sm ? sm.maxHp : null,
        endHp: em ? em.hp : null, endMaxHp: em ? em.maxHp : null,
        endResult: e ? e.result : null, endRound: e ? e.round : null,
        tierRec: tv ? tv.tierPost : null, tierPre: tv ? tv.tierPre : null,
        tierAtEnd: te ? te.tierAtEnd : null, fightOtTier: tv ? tv.fightOtTier : null,
        openingSum: op.sum, openingReturnedSum: op.returnedSum, openingEvents: op.n,
        crewStart: crewOf(s.fighters).map(f => ({ key: f.key, hp: f.hp, maxHp: f.maxHp, otTier: f.otTier })),
        crewEnd: e ? crewOf(e.fighters).map(f => ({ key: f.key, hp: f.hp, maxHp: f.maxHp })) : null,
        joined: !!(c && cm && sm && e && em && tv),
      };
      if (row.joined) {
        row.tierInf = Math.round((row.startMaxHp / row.constrMaxHp - 1) / 0.25);
        row.predStartMax = Math.round(row.constrMaxHp * (1 + 0.25 * row.tierRec));
        row.tierAgree = (row.tierRec === row.tierInf) && (row.predStartMax === row.startMaxHp) && (row.tierPre === row.tierRec) && (row.tierAtEnd === row.tierRec || row.tierAtEnd === null);
        row.openingFromStart = row.startMaxHp - row.startHp;
        row.openingAgree = (row.openingFromStart === row.openingSum);
        row.tileToConstr = row.constrHp - row.tileHp;
        row.preFightScaling = row.startMaxHp - row.constrMaxHp;
        row.preFightNet = row.startHp - row.constrHp;
        row.inFightChange = row.endHp - row.startHp;
        row.inFightMaxGrowth = row.endMaxHp - row.startMaxHp;
        row.tileToEnd = row.endHp - row.tileHp;
        row.constrToEnd = row.endHp - row.constrHp;
        row.identityTile = (row.tileToEnd === row.tileToConstr + row.preFightNet + row.inFightChange);
        row.identityConstr = (row.constrToEnd === row.preFightScaling - row.openingFromStart + row.inFightChange);
        row.defRange = defs[s.mid] ? defs[s.mid].hp : null;
        row.constrInDefRange = row.defRange ? (row.constrMaxHp >= row.defRange[0] && row.constrMaxHp <= row.defRange[1]) : null;
        if (!row.tierAgree) gaps.push(`seed ${seed} d${s.day} ${s.mid}: tier disagreement rec=${row.tierRec} pre=${row.tierPre} end=${row.tierAtEnd} inf=${row.tierInf} predStartMax=${row.predStartMax} startMax=${row.startMaxHp}`);
        if (!row.openingAgree) gaps.push(`seed ${seed} d${s.day} ${s.mid}: opening disagreement startMax-startHp=${row.openingFromStart} fcSum=${row.openingSum} events=${row.openingEvents}`);
        if (!row.identityTile || !row.identityConstr) gaps.push(`seed ${seed} d${s.day} ${s.mid}: sum identity failed`);
        if (row.tierAtEnd !== null && row.tierAtEnd !== row.tierRec) gaps.push(`seed ${seed} d${s.day} ${s.mid}: tier moved during fight pre/post=${row.tierRec} end=${row.tierAtEnd}`);
      } else {
        gaps.push(`seed ${seed} d${s.day} ${s.mid} ${fid}: UNJOINED constr=${!!cm} start=${!!sm} end=${!!em} tier=${!!tv}`);
      }
      fights.push(row);
    }
  }
  const total = fights.length;
  const joined = fights.filter(f => f.joined).length;
  const joinedPct = total ? (joined / total) * 100 : 0;
  const tierDis = fights.filter(f => f.joined && !f.tierAgree).length;
  const openDis = fights.filter(f => f.joined && !f.openingAgree).length;
  const identFail = fights.filter(f => f.joined && (!f.identityTile || !f.identityConstr)).length;
  const unexplained = gaps.length;
  // Aggregates (joined fights only).
  const agg = (fn) => fights.filter(f => f.joined).reduce((t, f) => t + fn(f), 0);
  const scaled = fights.filter(f => f.joined && f.preFightScaling > 0);
  const scalesUp = fights.filter(f => f.joined && f.constrToEnd > 0);
  const aggregates = {
    total, joined, joinedPct,
    scaledFights: scaled.length,
    totalPreFightScaling: agg(f => f.preFightScaling),
    totalOpeningDamage: agg(f => f.openingFromStart),
    totalInFightChange: agg(f => f.inFightChange),
    totalInFightMaxGrowth: agg(f => f.inFightMaxGrowth),
    totalTileToConstr: agg(f => f.tileToConstr),
    totalTileToEnd: agg(f => f.tileToEnd),
    totalConstrToEnd: agg(f => f.constrToEnd),
    scalesUpFights: scalesUp.length,
    scalesUpPreFightScaling: scalesUp.reduce((t, f) => t + f.preFightScaling, 0),
    scalesUpOpeningDamage: scalesUp.reduce((t, f) => t + f.openingFromStart, 0),
    scalesUpInFightChange: scalesUp.reduce((t, f) => t + f.inFightChange, 0),
    scalesUpConstrToEnd: scalesUp.reduce((t, f) => t + f.constrToEnd, 0),
    maxGrowthNonzero: fights.filter(f => f.joined && f.inFightMaxGrowth !== 0).length,
    inFightPositive: fights.filter(f => f.joined && f.inFightChange > 0).length,
  };
  // Parity vs fighterconstruct corpus.
  let parityPass = true;
  const parityDiffs = [];
  const PAR_KEYS = ['days', 'gameDays', 'won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal'];
  for (const seed of SEEDS) {
    let pr;
    try { pr = loadRow(PRIOR, seed); } catch (e) { parityPass = false; parityDiffs.push(`seed ${seed}: prior row unreadable`); continue; }
    const r = rows.find(x => x.seed === seed);
    for (const k of PAR_KEYS) {
      if (r[k] !== pr[k]) { parityPass = false; parityDiffs.push(`seed ${seed}: ${k} this=${r[k]} prior=${pr[k]}`); }
    }
    const court = (x) => (x.courtship && x.courtship.combined) | 0;
    if (court(r) !== court(pr)) { parityPass = false; parityDiffs.push(`seed ${seed}: courtship this=${court(r)} prior=${court(pr)}`); }
    const ids = (x) => (x.nonworldkill.starts || []).filter(s => s.wave === 4 && s.origin === 'world-origin' && !s.refused && !s.tableTrial).map(s => s.fightId).sort().join(',');
    if (ids(r) !== ids(pr)) { parityPass = false; parityDiffs.push(`seed ${seed}: w4world fightId set differs`); }
  }
  const courtTotals = rows.reduce((t, r) => t + ((r.courtship && r.courtship.combined) | 0), 0);
  const courtSeedsActive = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  const substrateOk = courtTotals > 0 && courtSeedsActive >= 6;
  const mechanicalPass = corpusOk && substrateOk && joined === total && tierDis === 0 && openDis === 0 && identFail === 0 && unexplained === 0;
  const out = {
    label: 'sim-tbovertime-a TB overtime decomposition',
    seeds: SEEDS, corpusOk, parityPass, parityDiffs, substrateOk,
    courtship: { combined: courtTotals, seedsActive: courtSeedsActive },
    aggregates, gaps, fights, mechanicalPass,
    generated: new Date().toISOString(),
  };
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(out, null, 1) + '\n');
  console.log('=== sim-tbovertime-a decomposition ===');
  console.log(`  fights total=${total} joined=${joined} (${joinedPct.toFixed(1)}%) tierDisagreements=${tierDis} openingDisagreements=${openDis} identityFailures=${identFail} unexplainedGaps=${unexplained}`);
  console.log(`  aggregates: preFightScaling=${aggregates.totalPreFightScaling} openingDamage=${aggregates.totalOpeningDamage} inFightChange=${aggregates.totalInFightChange} inFightMaxGrowth=${aggregates.totalInFightMaxGrowth} tileToConstr=${aggregates.totalTileToConstr} tileToEnd=${aggregates.totalTileToEnd} constrToEnd=${aggregates.totalConstrToEnd}`);
  console.log(`  scales-up set (constrToEnd>0): n=${aggregates.scalesUpFights} preFightScaling=${aggregates.scalesUpPreFightScaling} opening=${aggregates.scalesUpOpeningDamage} inFight=${aggregates.scalesUpInFightChange} constrToEnd=${aggregates.scalesUpConstrToEnd}`);
  console.log(`  scaled fights: ${scaled.length}; inFightMaxGrowth nonzero rows: ${aggregates.maxGrowthNonzero}; inFightChange positive rows: ${aggregates.inFightPositive}`);
  console.log(`  parity: ${parityPass ? 'PASS' : 'FAIL'} ${parityDiffs.join(' | ')}`);
  console.log(`  substrate: combined=${courtTotals} seedsActive=${courtSeedsActive} ok=${substrateOk}`);
  console.log(`  MECHANICAL: ${mechanicalPass ? 'PASS' : 'FAIL'}`);
  for (const f of fights) {
    console.log(`  [${f.seed} d${f.day} ${f.monster}] tile=${f.tileHp}/${f.tileMaxHp} constr=${f.constrHp}/${f.constrMaxHp} start=${f.startHp}/${f.startMaxHp} end=${f.endHp}/${f.endMaxHp} tierRec=${f.tierRec} tierInf=${f.tierInf} scaling=${f.preFightScaling} opening=${f.openingFromStart} inFight=${f.inFightChange} maxGrowth=${f.inFightMaxGrowth} result=${f.endResult} round=${f.endRound} crewStart=${(f.crewStart || []).length} joined=${f.joined}`);
  }
  if (gaps.length) { console.log('  GAPS:'); for (const g of gaps) console.log('    ' + g); }
  if (!mechanicalPass) process.exit(1);
}
if (require.main === module) main();
module.exports = { unitChecks };
