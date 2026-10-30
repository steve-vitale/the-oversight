#!/usr/bin/env node
// scripts/test-geartier-d-party.js — sim-geartier-d PARTY-UNIVERSE analyzer.
// Reads the test-geartier-b-sweep.js corpus VERBATIM (never edits per-seed
// files) and judges the PARTY universe U2 defined in the geartier-d prereg.
// Join: wrapper fights to fieldparty meetings by order index, verified
// mid+vid at every index (same rule as the sweep --summary analyzer).
// U2 (party universe): rounds >= 1 AND party-A line present:
//   allyFromStart OR allyVids non-empty OR engineAllies > 0 OR joinedAllyVid.
// All waves, all channels, all callers, leader any.
// Exit 2 on corpus invalid (missing rows, join mismatch, wrapper/recorder
// errors). Otherwise exit 0 and print leg verdicts; the final note judges
// (D5 fixture guard + D6 sense are judged in the final note, not here).
// Writes summary-party.json into each band dir (run output, not input).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS || '75301,75302,75303,75304,75305,75306,75307,75308,75309,75310,75311,75312,75313,75314,75315,75316')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function evidDirOf(band) { return path.join(process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-geartier-d-party'), band); }
function medianOf(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
function meanOf(a) { return a.length ? a.reduce((t, x) => t + x, 0) / a.length : 0; }
function isParty(m) {
  return !!m.allyFromStart || ((m.allyVids || []).length > 0) || ((m.engineAllies | 0) > 0) || !!m.joinedAllyVid;
}
function analyze(band) {
  const dir = evidDirOf(band);
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-${band}.json`), 'utf8')));
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0)
    && (r.wrapErrs || []).length === 0);
  let joinMismatch = 0;
  const joined = [];
  for (const r of rows) {
    const ms = r.fieldparty.meetings || [], fs = r.fights || [];
    if (ms.length !== fs.length) joinMismatch += Math.abs(ms.length - fs.length);
    const n = Math.min(ms.length, fs.length);
    for (let i = 0; i < n; i++) {
      const m = ms[i], f = fs[i];
      if (m.mid !== f.mid || String(m.vid) !== String(f.vid)) joinMismatch++;
      joined.push(Object.assign({ seed: r.seed }, m, {
        wHeldPavise: f.heldPavise, wPavisePlanted: f.pavisePlanted, wPaviseAbsorbed: f.paviseAbsorbed,
        wPaviseBroken: f.paviseBroken, wGranted: f.granted,
      }));
    }
  }
  const party = joined.filter(m => (m.rounds | 0) >= 1 && isParty(m));
  const partyBySeed = {};
  for (const m of party) partyBySeed[m.seed] = (partyBySeed[m.seed] || 0) + 1;
  const kills = party.filter(m => m.outcome === 'vKill').length;
  const drives = party.filter(m => m.outcome === 'mFlee').length;
  const fled = party.filter(m => m.outcome === 'vFlee').length;
  const died = party.filter(m => m.outcome === 'vDie').length;
  const everWinning = party.filter(m => m.wEverWinning !== undefined ? m.wEverWinning : m.everWinning).length;
  const hpRows = party.filter(m => (m.mHpStart | 0) > 0);
  const hpShares = hpRows.map(m => (m.mDealt || 0) / m.mHpStart);
  const stats = {
    band, n: party.length, perSeed: partyBySeed,
    roundsMed: medianOf(party.map(m => m.rounds || 0)),
    roundsMean: +meanOf(party.map(m => m.rounds || 0)).toFixed(2),
    mDealtMean: +meanOf(party.map(m => m.mDealt || 0)).toFixed(1),
    mDealtMed: medianOf(party.map(m => m.mDealt || 0)),
    vTakenMean: +meanOf(party.map(m => m.vTaken || 0)).toFixed(1),
    kills, drives, fled, died,
    killsDrives: kills + drives,
    killsDrivesRate: party.length ? +((kills + drives) / party.length).toFixed(3) : 0,
    planted: party.filter(m => m.wPavisePlanted).length,
    held: party.filter(m => m.wHeldPavise).length,
    absorbedMean: +meanOf(party.map(m => m.wPaviseAbsorbed || 0)).toFixed(1),
    broken: party.filter(m => m.wPaviseBroken).length,
    everWinning,
    everWinningRate: party.length ? +(everWinning / party.length).toFixed(3) : 0,
    hpShareMean: hpShares.length ? +meanOf(hpShares).toFixed(3) : 0,
    hpShareN: hpShares.length,
    scholarLeaders: party.filter(m => m.leader && m.leader.isScholar).length,
    waves: party.reduce((o, m) => { o[m.wave] = (o[m.wave] || 0) + 1; return o; }, {}),
    outcomes: party.map(m => m.outcome).join('/'),
  };
  const summary = { band, corpusOk, joinMismatch, meetings: joined.length, party: stats,
    bandOut: {
      starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
      deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
      granted: rows.reduce((t, r) => t + (r.granted || 0), 0),
    } };
  fs.writeFileSync(path.join(dir, 'summary-party.json'), JSON.stringify(summary, null, 1) + '\n');
  return summary;
}
function main() {
  const nat = analyze('natural');
  const sat = analyze('pavise');
  let corpusInvalid = !nat.corpusOk || !sat.corpusOk || nat.joinMismatch || sat.joinMismatch;
  for (const s of [nat, sat]) {
    const p = s.party;
    console.log(`=== geartier-d party ${s.band} === corpusOk=${s.corpusOk} joinMismatch=${s.joinMismatch} meetings=${s.meetings}`);
    console.log(`U2: n=${p.n} perSeed=${JSON.stringify(p.perSeed)} roundsMed=${p.roundsMed} roundsMean=${p.roundsMean} mDealtMean=${p.mDealtMean} mDealtMed=${p.mDealtMed} vTakenMean=${p.vTakenMean}`);
    console.log(`U2 outcomes: kills=${p.kills} drives=${p.drives} fled=${p.fled} died=${p.died} killsDrives=${p.killsDrives} rate=${p.killsDrivesRate} planted=${p.planted}/${p.n} held=${p.held} absorbedMean=${p.absorbedMean} broken=${p.broken} everWinning=${p.everWinning}/${p.n} rate=${p.everWinningRate} hpShareMean=${p.hpShareMean} (n=${p.hpShareN}) scholarLeaders=${p.scholarLeaders} waves=${JSON.stringify(p.waves)}`);
    console.log(`WALL: starv=${s.bandOut.starvationTotal} deaths=${s.bandOut.deathTotal} granted=${s.bandOut.granted}`);
  }
  const n = nat.party, p = sat.party;
  const insufficient = n.n < 24 || p.n < 24;
  console.log('--- LEG VERDICTS (prereg geartier-d; D5 fixture + D6 sense judged in final note) ---');
  console.log(`D0 corpus: ${!corpusInvalid ? 'PASS' : 'FAIL'} (both bands corpusOk, joinMismatch 0, wrapErrs 0)`);
  console.log(`D2 applicability: ${insufficient ? 'INSUFFICIENT-DATA' : 'PASS'} (n natural=${n.n}, sat=${p.n}, need >=24/band; sat planted ${p.planted}/${p.n} need >=50%)${(!insufficient && p.planted < p.n * 0.5) ? ' -> FAIL plant rate' : ''}`);
  const d2fail = !insufficient && p.planted < p.n * 0.5;
  console.log(`D1 PRIMARY kills+drives rate >=0.90 AND >= natural: sat=${p.killsDrivesRate} vs natural=${n.killsDrivesRate} -> ${insufficient ? 'INSUFFICIENT-DATA' : (p.killsDrivesRate >= 0.90 && p.killsDrivesRate >= n.killsDrivesRate ? 'PASS' : 'FAIL')}`);
  console.log(`D3 everWinning rate >= natural AND >= 0.80: sat=${p.everWinningRate} vs natural=${n.everWinningRate} -> ${insufficient ? 'INSUFFICIENT-DATA' : (p.everWinningRate >= n.everWinningRate && p.everWinningRate >= 0.80 ? 'PASS' : 'FAIL')}`);
  console.log(`D4 deaths sat<=natural: sat=${p.died} vs natural=${n.died} -> ${insufficient ? 'INSUFFICIENT-DATA' : (p.died <= n.died ? 'PASS' : 'FAIL')}`);
  console.log(`D4 starvation sat<=natural+1: sat=${sat.bandOut.starvationTotal} vs natural=${nat.bandOut.starvationTotal} -> ${sat.bandOut.starvationTotal <= nat.bandOut.starvationTotal + 1 ? 'PASS' : 'FAIL'}`);
  console.log(`D4b vTakenMean sat<=natural: sat=${p.vTakenMean} vs natural=${n.vTakenMean} -> ${insufficient ? 'INSUFFICIENT-DATA' : (p.vTakenMean <= n.vTakenMean ? 'PASS' : 'FAIL')}`);
  console.log(`REPORTED (not gated): mDealtMean sat=${p.mDealtMean} vs natural=${n.mDealtMean}; hpShareMean sat=${p.hpShareMean} (n=${p.hpShareN}) vs natural=${n.hpShareMean} (n=${n.hpShareN})`);
  const go = !corpusInvalid && !insufficient && !d2fail
    && p.killsDrivesRate >= 0.90 && p.killsDrivesRate >= n.killsDrivesRate
    && p.everWinningRate >= n.everWinningRate && p.everWinningRate >= 0.80
    && p.died <= n.died && sat.bandOut.starvationTotal <= nat.bandOut.starvationTotal + 1
    && p.vTakenMean <= n.vTakenMean;
  console.log(`OVERALL (analyzer legs D0-D4b only): ${corpusInvalid ? 'CORPUS-INVALID' : insufficient ? 'INSUFFICIENT-DATA' : go ? 'GO (pending D5 + D6 in final note)' : 'NO-GO'}`);
  if (corpusInvalid) process.exit(2);
}
main();
