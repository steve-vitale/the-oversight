#!/usr/bin/env node
// scripts/test-staying-b.js — sim-staying-b analyzer + judge.
// Reads evidence/2026-10-29/perseed-staying-b/summary-{base,armed}.json
// (EVID env override) plus the per-seed rows for fight-level detail.
// --diag : base-leg break decomposition only (root-cause record).
// (no args) : full pilot judgment against the prereg bars.
// Exit 0 when the analysis completes (verdict printed, not encoded in
// the exit code — a NO-GO is a completed run, not a script failure);
// exit 1 only on missing/invalid corpora.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-staying-b');

function loadSummary(tag) {
  const p = path.join(EVID, `summary-${tag}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function loadRows(tag, seeds) {
  const rows = [];
  for (const s of seeds) {
    const p = path.join(EVID, `s${s}-${tag}.json`);
    if (fs.existsSync(p)) rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return rows;
}
function breakReason(m) {
  if (m.outcome === 'vKill') return 'KILL';
  if (m.outcome === 'mFlee' && (m.rounds | 0) < 15 && !m.capLine) return 'DRIVE-OFF';
  if ((m.rounds | 0) === 15 && m.capLine) return 'CAP';
  if (m.outcome === 'vDie') return 'PARTY-DEATH';
  if (m.outcome === 'vFlee' && m.fleeHopeless) return 'HOPELESS';
  // Engine-faithful LEARN: the learn-withdrawal branch (fieldFights.js)
  // requires round >= 3. fleeLearn is ALSO set by the wound-floor branch
  // for learning villagers, so a round-1 flee with fleeLearn=true is a
  // wound-floor break, not a learn withdrawal (proven on 75106 d104b,
  // 75108 d86b — both round 1, both learners, both below the floor).
  if (m.outcome === 'vFlee' && m.fleeLearn && !m.fleeHopeless && (m.rounds | 0) >= 3) return 'LEARN-WITHDRAWAL';
  if (m.outcome === 'vFlee' && !m.fleeHopeless && !(m.fleeLearn && (m.rounds | 0) >= 3)) return 'WOUND-FLOOR';
  return 'OTHER';
}
function med(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function mean(arr) { return arr.length ? arr.reduce((t, x) => t + x, 0) / arr.length : null; }

function judged(rows) {
  const out = [];
  for (const r of rows) for (const m of (r.stayingb.meetings || [])) {
    if ((m.wave | 0) === 4 && m.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !m.leaderIsScholar) {
      out.push(Object.assign({ seed: r.seed }, m));
    }
  }
  return out;
}

function diagMode() {
  const base = loadSummary('base');
  if (!base || !base.corpusOk) { console.log('DIAG-FAIL: base summary missing or corpus-invalid'); process.exit(1); }
  const rows = loadRows('base', [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108]);
  const j = judged(rows);
  const fought = j.filter(m => (m.rounds | 0) >= 1 && ['vKill', 'mFlee', 'vFlee', 'vDie'].indexOf(m.outcome) >= 0);
  const breaks = {};
  for (const m of fought) { const b = breakReason(m); breaks[b] = (breaks[b] || 0) + 1; }
  const r1 = fought.filter(m => (m.rounds | 0) === 1);
  const r1Flee = r1.filter(m => m.outcome === 'vFlee');
  const r1Die = r1.filter(m => m.outcome === 'vDie');
  const wf = fought.filter(m => breakReason(m) === 'WOUND-FLOOR');
  const party = fought.filter(m => m.calledHelp || (m.alliesJoined && m.alliesJoined.length));
  const solo = fought.filter(m => !m.calledHelp && !(m.alliesJoined && m.alliesJoined.length));
  console.log('=== sim-staying-b DIAG (base leg) ===');
  console.log(`judgedA=${j.length} foughtA=${fought.length} (unfought=${j.length - fought.length}: evade/alreadyDead/round-0)`);
  console.log(`BREAKS: ${JSON.stringify(breaks)}`);
  console.log(`ROUND-1 ends: ${r1.length}/${fought.length} (vFlee=${r1Flee.length} vDie=${r1Die.length} other=${r1.length - r1Flee.length - r1Die.length})`);
  console.log(`WOUND-FLOOR: ${wf.length}/${fought.length} (of which round-1: ${wf.filter(m => (m.rounds | 0) === 1).length})`);
  console.log(`HOPELESS: ${breaks.HOPELESS || 0} LEARN-WITHDRAWAL: ${breaks['LEARN-WITHDRAWAL'] || 0} OTHER: ${breaks.OTHER || 0}`);
  const others = fought.filter(m => breakReason(m) === 'OTHER');
  for (const m of others) console.log(`  OTHER s${m.seed} d${m.day} ${m.mid} out=${m.outcome} rounds=${m.rounds} fleeH=${m.fleeHopeless} fleeL=${m.fleeLearn} cap=${m.capLine}`);
  console.log(`party fights (shout/from-start on base): ${party.length} roundsMed=${med(party.map(m => m.rounds | 0))} mDealtMed=${med(party.map(m => m.mDealt | 0))}`);
  console.log(`solo fights: ${solo.length} roundsMed=${med(solo.map(m => m.rounds | 0))} mDealtMed=${med(solo.map(m => m.mDealt | 0))} vDie=${solo.filter(m => m.outcome === 'vDie').length}`);
  console.log(`survival gap (fought): roundsMed=${med(fought.map(m => m.rounds | 0))} mDealtMed=${med(fought.map(m => m.mDealt | 0))} vTakenMed=${med(fought.map(m => m.vTaken | 0))}`);
  console.log('DIAG-COMPLETE');
}

function judgeMode() {
  const base = loadSummary('base');
  const armed = loadSummary('armed');
  if (!base || !base.corpusOk) { console.log('JUDGE-FAIL: base summary missing or corpus-invalid'); process.exit(1); }
  if (!armed || !armed.corpusOk) { console.log('JUDGE-FAIL: armed summary missing or corpus-invalid'); process.exit(1); }
  const bRows = loadRows('base', [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108]);
  const aRows = loadRows('armed', [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108]);
  const bj = judged(bRows), aj = judged(aRows);
  const bSolo = bj.filter(m => ['resolve', 'patrol'].indexOf(m.caller) >= 0 && (m.tileJoined | 0) === 0 && !m.calledHelp && !(m.alliesJoined && m.alliesJoined.length));
  const aSolo = aj.filter(m => ['resolve', 'patrol'].indexOf(m.caller) >= 0 && (m.tileJoined | 0) === 0 && !m.calledHelp && !(m.alliesJoined && m.alliesJoined.length));
  const bSoloDie = bSolo.filter(m => m.outcome === 'vDie').length;
  const aSoloDie = aSolo.filter(m => m.outcome === 'vDie').length;
  const bSoloMed = med(bSolo.filter(m => (m.rounds | 0) >= 1).map(m => m.rounds | 0));
  const aSoloMed = med(aSolo.filter(m => (m.rounds | 0) >= 1).map(m => m.rounds | 0));
  const legs = {
    primary: armed.tileKills >= 3,
    mechanism: (armed.partyRoundsMed != null && armed.partyRoundsMed >= 4),
    soloControl: (aSoloDie <= bSoloDie + 2) && (bSoloMed != null && aSoloMed != null && Math.abs(aSoloMed - bSoloMed) <= 1),
    costStarv: armed.band.starvationTotal <= base.band.starvationTotal + 2,
    costPartyDie: armed.judgedPartyDeaths <= base.judgedPartyDeaths + 2,
    costMedian: armed.band.medianDays >= base.band.medianDays - 20,
  };
  console.log('=== sim-staying-b PILOT JUDGMENT ===');
  console.log(`BASE: judgedA=${base.judgedA} tileParty=0 tileKills=0 median=${base.band.medianDays} starv=${base.band.starvationTotal} deaths=${base.band.deathTotal} natEver=${base.band.nationalEver}`);
  console.log(`ARMED: judgedA=${armed.judgedA} tileParty=${armed.tileParty} tileKills=${armed.tileKills} tileDrive=${armed.tileDrive} tileDeaths=${armed.tileDeaths} partyRoundsMed=${armed.partyRoundsMed} partyMDealtMed=${armed.partyMDealtMed} median=${armed.band.medianDays} starv=${armed.band.starvationTotal} deaths=${armed.band.deathTotal} natEver=${armed.band.nationalEver} (diagnostic)`);
  console.log(`SOLO-CONTROL: base soloWild=${bSolo.length} die=${bSoloDie} roundsMed=${bSoloMed} | armed soloWild=${aSolo.length} die=${aSoloDie} roundsMed=${aSoloMed}`);
  console.log(`LEGS: PRIMARY(kills>=3)=${legs.primary ? 'PASS' : 'FAIL'} MECHANISM(partyRoundsMed>=4)=${legs.mechanism ? 'PASS' : 'FAIL'} SOLO-CONTROL=${legs.soloControl ? 'PASS' : 'FAIL'} COST-starv=${legs.costStarv ? 'PASS' : 'FAIL'} COST-partyDie=${legs.costPartyDie ? 'PASS' : 'FAIL'} COST-median=${legs.costMedian ? 'PASS' : 'FAIL'}`);
  const go = Object.values(legs).every(Boolean);
  console.log(`PILOT VERDICT: ${go ? 'GO (confirm 16 seeds)' : 'NO-GO (kill the game code, keep evidence)'}`);
  console.log('JUDGE-COMPLETE');
}

// --- Extracts mode (EPERM-flap fallback) ---
// When disk writes fail, the sweep prints one compact JUDGEDJSON extract
// per seed (judgedA staying-b rows + wall fields + recorder counts).
// The extracts file (assembled from stdout) has shape:
//   { tag, seeds: [ { seed, tag, wall: {...}, counts: {...}, judged: [...] } ] }
// This mode judges from extracts alone — no per-seed row files needed.
// It never invents rows: judged rows are verbatim recorder output.
function loadExtracts(tag) {
  // Extracts live in the dated evidence dir (the corpus file), not the
  // per-seed dir; accept either location.
  const cands = [path.join(REPO, 'evidence', '2026-10-29', `extracts-${tag}.json`),
                 path.join(EVID, `extracts-${tag}.json`)];
  for (const p of cands) if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return null;
}
function extractsJudged(ex) {
  const out = [];
  for (const s of (ex.seeds || [])) for (const m of (s.judged || [])) out.push(Object.assign({ seed: s.seed }, m));
  return out;
}
function extractsWall(ex) {
  const walls = (ex.seeds || []).map(s => s.wall || {});
  const medDays = med(walls.map(w => w.days || 0));
  return { n: walls.length, won: walls.reduce((t, w) => t + (w.won || 0), 0),
    medianDays: medDays, nationalEver: walls.reduce((t, w) => t + (w.nationalEver || 0), 0),
    nationalFinal: walls.reduce((t, w) => t + (w.nationalFinal || 0), 0),
    table: walls.reduce((t, w) => t + (w.table || 0), 0),
    entered: walls.reduce((t, w) => t + (w.entered || 0), 0),
    wave4: walls.filter(w => (w.waveReach || 1) >= 4).length,
    wave5: walls.filter(w => (w.waveReach || 1) >= 5).length,
    starvationTotal: walls.reduce((t, w) => t + (w.starvationDeaths || 0), 0),
    deathTotal: walls.reduce((t, w) => t + (w.deathTotal || 0), 0) };
}
function extractsMode() {
  const base = loadExtracts('base');
  if (!base) { console.log('EXTRACTS-FAIL: extracts-base.json missing'); process.exit(1); }
  const bCounts = (base.seeds || []).reduce((t, s) => ({ fp: t.fp + (s.counts.fpMeetings | 0), fpJ: t.fpJ + (s.counts.fpJudgedA | 0), sbJ: t.sbJ + (s.counts.sbJudgedA | 0), fpE: t.fpE + (s.counts.fpErrs | 0), sbE: t.sbE + (s.counts.sbErrs | 0) }), { fp: 0, fpJ: 0, sbJ: 0, fpE: 0, sbE: 0 });
  const bj = extractsJudged(base);
  const bfought = bj.filter(m => (m.rounds | 0) >= 1 && ['vKill', 'mFlee', 'vFlee', 'vDie'].indexOf(m.outcome) >= 0);
  const breaks = {};
  for (const m of bfought) { const b = breakReason(m); breaks[b] = (breaks[b] || 0) + 1; }
  const r1 = bfought.filter(m => (m.rounds | 0) === 1);
  const wf = bfought.filter(m => breakReason(m) === 'WOUND-FLOOR');
  const bParty = bfought.filter(m => m.calledHelp || ((m.alliesJoined || []).length > 0));
  const bSolo = bfought.filter(m => !m.calledHelp && ((m.alliesJoined || []).length === 0));
  const bWall = extractsWall(base);
  console.log('=== sim-staying-b EXTRACTS DIAG (base leg) ===');
  console.log(`CONTROL-SHAPE: fpMeetings=${bCounts.fp} (expect 1272) fpJudgedA=${bCounts.fpJ} (expect 24) sbJudgedA=${bCounts.sbJ} errs fp=${bCounts.fpE} sb=${bCounts.sbE} kills=${bj.filter(m => m.outcome === 'vKill').length} (expect 0)`);
  console.log(`judgedA=${bj.length} foughtA=${bfought.length} BREAKS: ${JSON.stringify(breaks)}`);
  console.log(`ROUND-1 ends: ${r1.length}/${bfought.length} (vFlee=${r1.filter(m => m.outcome === 'vFlee').length} vDie=${r1.filter(m => m.outcome === 'vDie').length})`);
  console.log(`WOUND-FLOOR: ${wf.length}/${bfought.length} (round-1: ${wf.filter(m => (m.rounds | 0) === 1).length}) OTHER: ${breaks.OTHER || 0}`);
  for (const m of bfought.filter(x => breakReason(x) === 'OTHER')) console.log(`  OTHER s${m.seed} d${m.day} ${m.mid} out=${m.outcome} rounds=${m.rounds} fleeH=${m.fleeHopeless} fleeL=${m.fleeLearn} cap=${m.capLine}`);
  console.log(`party fights: ${bParty.length} roundsMed=${med(bParty.map(m => m.rounds | 0))} mDealtMed=${med(bParty.map(m => m.mDealt | 0))}`);
  console.log(`solo fights: ${bSolo.length} roundsMed=${med(bSolo.map(m => m.rounds | 0))} mDealtMed=${med(bSolo.map(m => m.mDealt | 0))} vDie=${bSolo.filter(m => m.outcome === 'vDie').length}`);
  const armed = loadExtracts('armed');
  if (!armed) { console.log('EXTRACTS-DIAG-COMPLETE (no armed extracts — pilot not judged)'); return; }
  const aj = extractsJudged(armed);
  const aWall = extractsWall(armed);
  const tileParty = aj.filter(m => (m.tileJoined | 0) >= 1);
  const tileKills = tileParty.filter(m => m.outcome === 'vKill');
  const tileDrive = tileParty.filter(m => m.outcome === 'mFlee');
  const tileDeaths = tileParty.filter(m => m.outcome === 'vDie');
  const partyRoundsMed = med(tileParty.filter(m => (m.rounds | 0) >= 1).map(m => m.rounds | 0));
  const bSoloW = bj.filter(m => ['resolve', 'patrol'].indexOf(m.caller) >= 0 && (m.tileJoined | 0) === 0 && !m.calledHelp && ((m.alliesJoined || []).length === 0));
  const aSoloW = aj.filter(m => ['resolve', 'patrol'].indexOf(m.caller) >= 0 && (m.tileJoined | 0) === 0 && !m.calledHelp && ((m.alliesJoined || []).length === 0));
  const bSoloDie = bSoloW.filter(m => m.outcome === 'vDie').length;
  const aSoloDie = aSoloW.filter(m => m.outcome === 'vDie').length;
  const bSoloMed = med(bSoloW.filter(m => (m.rounds | 0) >= 1).map(m => m.rounds | 0));
  const aSoloMed = med(aSoloW.filter(m => (m.rounds | 0) >= 1).map(m => m.rounds | 0));
  const judgedDieB = bj.filter(m => m.outcome === 'vDie').length;
  const judgedDieA = aj.filter(m => m.outcome === 'vDie').length;
  const legs = {
    primary: tileKills.length >= 3,
    mechanism: (partyRoundsMed != null && partyRoundsMed >= 4),
    soloControl: (aSoloDie <= bSoloDie + 2) && (bSoloMed != null && aSoloMed != null && Math.abs(aSoloMed - bSoloMed) <= 1),
    costStarv: aWall.starvationTotal <= bWall.starvationTotal + 2,
    costPartyDie: judgedDieA <= judgedDieB + 2,
    costMedian: aWall.medianDays >= bWall.medianDays - 20,
  };
  console.log('=== sim-staying-b EXTRACTS PILOT JUDGMENT ===');
  console.log(`BASE: judgedA=${bj.length} median=${bWall.medianDays} starv=${bWall.starvationTotal} deaths=${bWall.deathTotal} natEver=${bWall.nationalEver}`);
  console.log(`ARMED: judgedA=${aj.length} tileParty=${tileParty.length} tileKills=${tileKills.length} tileDrive=${tileDrive.length} tileDeaths=${tileDeaths.length} partyRoundsMed=${partyRoundsMed} median=${aWall.medianDays} starv=${aWall.starvationTotal} deaths=${aWall.deathTotal} natEver=${aWall.nationalEver} (diagnostic)`);
  console.log(`SOLO-CONTROL: base soloWild=${bSoloW.length} die=${bSoloDie} roundsMed=${bSoloMed} | armed soloWild=${aSoloW.length} die=${aSoloDie} roundsMed=${aSoloMed}`);
  console.log(`LEGS: PRIMARY(kills>=3)=${legs.primary ? 'PASS' : 'FAIL'} MECHANISM(partyRoundsMed>=4)=${legs.mechanism ? 'PASS' : 'FAIL'} SOLO-CONTROL=${legs.soloControl ? 'PASS' : 'FAIL'} COST-starv=${legs.costStarv ? 'PASS' : 'FAIL'} COST-partyDie=${legs.costPartyDie ? 'PASS' : 'FAIL'} COST-median=${legs.costMedian ? 'PASS' : 'FAIL'}`);
  console.log(`PILOT VERDICT: ${Object.values(legs).every(Boolean) ? 'GO (confirm 16 seeds)' : 'NO-GO (kill the game code, keep evidence)'}`);
  console.log('EXTRACTS-COMPLETE');
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--diag') diagMode();
  else if (args[0] === '--extracts') extractsMode();
  else judgeMode();
}
main().catch(e => { console.error('ANALYZE-FAIL', e && e.stack || e); process.exit(1); });
