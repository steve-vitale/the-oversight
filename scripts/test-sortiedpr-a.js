#!/usr/bin/env node
// scripts/test-sortiedpr-a.js — sim-sortiedpr-a analyzer + judge.
// Reads the judged corpora (evidence/2026-10-28/perseed-sortiedpr-a/
// <band>/) and prints the sortie-DPR measurement exactly as the prereg
// binds it: mustered size vs joined fighters, sustained DPR distribution
// (mDealt/rounds, rounds >= 1), leader/ally shares, survival rounds by
// outcome, kills vs drive-offs SEPARATELY (drive-off never counts as a
// kill), round-0 one-shot fights listed separately, cap-fit for 850/1100
// HP at median DPR. Aid fights are a contrast table, never pooled.
// Secondary mode: --secondary <partyfinish-armed-dir> computes the same
// DPR stats over the committed partyfinish armed corpus (caller='sortie'
// rows of partyfinish.fights) as a gated-driver contrast, never pooled
// with the judged bands, never a re-judgment of partyfinish's GO.
// Usage:
//   node scripts/test-sortiedpr-a.js [--base <corpus-root>] [--sense-ok]
//   node scripts/test-sortiedpr-a.js --secondary <dir>
// Exit 0 when the corpora are valid (verdict printed); exit 1 on an
// invalid corpus. The FINAL verdict needs --sense-ok (the sense script
// must have passed first); without it the analyzer prints the corpus-leg
// verdict + "sense pending".
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

function q(arr, p) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}
function med(arr) { return q(arr, 0.5); }
function dist(arr) {
  const m = {};
  for (const v of arr) m[String(v)] = (m[String(v)] || 0) + 1;
  return m;
}
function fmt(n, d) { return (n == null || !isFinite(n)) ? 'n/a' : Number(n).toFixed(d == null ? 1 : d); }

function sortieStats(fights, label) {
  const byOutcome = {};
  for (const f of fights) {
    const o = f.outcome || 'OTHER';
    byOutcome[o] = (byOutcome[o] || 0) + 1;
  }
  const fought = fights.filter(f => (f.rounds | 0) >= 1);
  const round0 = fights.filter(f => (f.rounds | 0) === 0);
  const dprs = fought.map(f => f.mDealt / f.rounds);
  // allyDealt === null means the recorder does not carry the split
  // (partyfinish corpus): shares are n/a there, never silently 0.
  const splitKnown = fought.filter(f => f.allyDealt != null);
  const leaderShare = splitKnown.map(f => (f.mDealt - (f.allyDealt || 0)) / f.rounds);
  const allyShare = splitKnown.map(f => (f.allyDealt || 0) / f.rounds);
  const roundsByOutcome = {};
  for (const f of fought) {
    const o = f.outcome || 'OTHER';
    (roundsByOutcome[o] = roundsByOutcome[o] || []).push(f.rounds);
  }
  const roundsSummary = {};
  for (const [o, rs] of Object.entries(roundsByOutcome)) {
    roundsSummary[o] = { n: rs.length, median: med(rs), max: Math.max(...rs), min: Math.min(...rs) };
  }
  const mustered = fights.map(f => (f.engineAllies != null ? f.engineAllies + 1 : (f.partySize || null)));
  // joinedAllyVid === undefined means the recorder does not carry it
  // (partyfinish corpus): joined count is UNKNOWN there, never 1.
  const joinedKnown = fights.filter(f => f.joinedAllyVid !== undefined);
  const joined = joinedKnown.map(f => (f.joinedAllyVid != null ? 2 : 1));
  const joinedRate = joinedKnown.length ? joinedKnown.filter(f => f.joinedAllyVid != null).length / joinedKnown.length : null;
  const medianDpr = med(dprs);
  const capFit = medianDpr ? { at850: 850 / medianDpr, at1100: 1100 / medianDpr } : null;
  const waves = dist(fights.map(f => f.wave));
  const hpStarts = fights.map(f => f.mHpStart).filter(v => v != null);
  console.log(`--- ${label}: n=${fights.length} fought(rounds>=1)=${fought.length} round0=${round0.length} ---`);
  console.log(`outcomes: ${JSON.stringify(byOutcome)}  [KILL=vKill, DRIVE-OFF=mFlee, FLED=vFlee, DIED=vDie, EVADE=evade]`);
  console.log(`kills=${byOutcome.vKill || 0} driveOffs=${byOutcome.mFlee || 0} (drive-off NEVER counted as kill)`);
  if (fought.length) {
    console.log(`sustained DPR (mDealt/rounds): median=${fmt(medianDpr)} q25=${fmt(q(dprs, 0.25))} q75=${fmt(q(dprs, 0.75))} min=${fmt(Math.min(...dprs))} max=${fmt(Math.max(...dprs))}`);
    console.log(`leader share/round: median=${fmt(med(leaderShare))}  ally share/round: median=${fmt(med(allyShare))}  (ally share 0 = ally never joined or never struck)`);
    console.log(`survival rounds by outcome: ${JSON.stringify(roundsSummary)}`);
    console.log(`mustered size: ${JSON.stringify(dist(mustered))}  joined fighters: ${joinedKnown.length ? JSON.stringify(dist(joined)) : 'UNKNOWN (recorder carries no joined-ally field)'}  joined-ally rate=${joinedRate == null ? 'n/a' : (joinedRate * 100).toFixed(0) + '%'}`);
    console.log(`mHpStart: median=${fmt(med(hpStarts), 0)} min=${hpStarts.length ? Math.min(...hpStarts) : 'n/a'} max=${hpStarts.length ? Math.max(...hpStarts) : 'n/a'}`);
    if (capFit) console.log(`cap-fit at median DPR: 850 HP needs ${fmt(capFit.at850)} rounds (cap 15: ${capFit.at850 <= 15 ? 'FITS' : 'OVER'}), 1100 HP needs ${fmt(capFit.at1100)} rounds (cap 15: ${capFit.at1100 <= 15 ? 'FITS' : 'OVER'})`);
  }
  console.log(`waves: ${JSON.stringify(waves)}`);
  if (round0.length) {
    console.log(`round-0 one-shot fights (excluded from sustained DPR):`);
    for (const f of round0) console.log(`  s${f.seed} d${f.day} ${f.mid} w${f.wave} hpStart=${f.mHpStart} mDealt=${f.mDealt} outcome=${f.outcome} corneredHold=${!!f.corneredHold}`);
  }
  console.log(`per-fight (seed day mid wave hpStart->hpLeft rounds mDealt allyDealt DPR mustered joined outcome):`);
  for (const f of fought) {
    const mus = (f.engineAllies != null ? f.engineAllies + 1 : (f.partySize || '?'));
    const jn = f.joinedAllyVid === undefined ? '?' : (f.joinedAllyVid != null ? 2 : 1);
    const al = f.allyDealt == null ? '?' : f.allyDealt;
    console.log(`  s${f.seed} d${f.day} ${f.mid} w${f.wave} ${f.mHpStart}->${f.mHpLeft} r${f.rounds} dmg${f.mDealt} ally${al} dpr${fmt(f.mDealt / f.rounds)} mus${mus} joined${jn} ${f.outcome}${f.corneredHold ? ' HOLD' : ''}`);
  }
  return { n: fights.length, fought: fought.length, round0: round0.length, byOutcome,
    medianDpr, q25: q(dprs, 0.25), q75: q(dprs, 0.75),
    leaderMedian: med(leaderShare), allyMedian: med(allyShare),
    kills: byOutcome.vKill || 0, driveOffs: byOutcome.mFlee || 0,
    joinedRate, musteredDist: dist(mustered), roundsSummary, capFit,
    waves, hpMedian: med(hpStarts) };
}

function loadBand(root, band) {
  const dir = path.join(root, band);
  const rows = [];
  for (const fn of fs.readdirSync(dir).sort()) {
    if (!/^s\d+-/.test(fn) || !fn.endsWith('.json')) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8')));
  }
  const corpusOk = rows.length > 0 && rows.every(r => r.days > 0 && r.fieldparty
    && Array.isArray(r.fieldparty.meetings) && r.fieldparty.diag.errs === 0
    && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0));
  const meetings = [];
  for (const r of rows) for (const m of (r.fieldparty.meetings || [])) meetings.push(Object.assign({ seed: r.seed }, m));
  const opp = { episodes: 0, gorgeSeen: 0, sortied: 0, lingererDays: 0, gorgeNights: 0, answerCalls: 0, attempts: 0 };
  for (const r of rows) {
    const o = r.opportunities || {};
    opp.episodes += (o.episodes || []).length;
    opp.gorgeSeen += (o.episodes || []).filter(e => e.gorgeSeen).length;
    opp.sortied += (o.episodes || []).filter(e => e.sortied).length;
    opp.lingererDays += o.lingererDays || 0;
    opp.gorgeNights += (o.gorgeNights || []).length;
    opp.answerCalls += o.answerCalls || 0;
    opp.attempts += (o.sortieAttempts || []).length;
  }
  const wall = { won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: med(rows.map(r => r.days)),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0) };
  return { rows, corpusOk, meetings, opp, wall };
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--secondary') {
    const dir = args[1];
    const fights = [];
    for (const fn of fs.readdirSync(dir).sort()) {
      if (!/^s\d+-armed\.json$/.test(fn)) continue;
      const row = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
      const seed = row.seed;
      for (const f of ((row.partyfinish || {}).fights || [])) {
        if (f.caller !== 'sortie') continue;
        fights.push({ seed, day: f.day, mid: f.mid, wave: f.wave, mHpStart: f.mHpStart, mHpLeft: f.mHpLeft,
          rounds: f.rounds, mDealt: f.mDealt, allyDealt: null, outcome: f.outcome,
          engineAllies: null, partySize: f.partySize, corneredHold: !!f.corneredHold });
        // NOTE: no joinedAllyVid key — that recorder does not carry it,
        // so the analyzer reports joined fighters as UNKNOWN, never 1.
      }
    }
    console.log(`=== secondary: partyfinish armed corpus (gated driver contrast, NEVER pooled) ===`);
    console.log(`sortie rows=${fights.length} (allyDealt/joined not recorded by that recorder — shares n/a)`);
    const st = sortieStats(fights, 'partyfinish-armed sorties');
    console.log(JSON.stringify({ secondary: st }, null, 1));
    return;
  }
  let base = null, senseOk = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base') base = args[++i];
    if (args[i] === '--sense-ok') senseOk = true;
  }
  base = base || path.join(REPO, 'evidence', '2026-10-28', 'perseed-sortiedpr-a');
  const auto = loadBand(base, 'auto');
  const played = loadBand(base, 'played');
  console.log(`=== sim-sortiedpr-a judged corpora (${base}) ===`);
  console.log(`AUTO corpus: rows=${auto.rows.length} ok=${auto.corpusOk} meetings=${auto.meetings.length}`);
  console.log(`AUTO opportunities: episodes=${auto.opp.episodes} gorgeSeen=${auto.opp.gorgeSeen} sortied=${auto.opp.sortied} lingererDays=${auto.opp.lingererDays} gorgeNights=${auto.opp.gorgeNights} answerCalls=${auto.opp.answerCalls} attempts=${auto.opp.attempts}`);
  console.log(`AUTO wall: won=${auto.wall.won} (full=${auto.wall.wonFull}) natEver=${auto.wall.nationalEver} natFinal=${auto.wall.nationalFinal} table=${auto.wall.table} entered=${auto.wall.entered} wave4=${auto.wall.wave4} wave5=${auto.wall.wave5} median=${auto.wall.medianDays} starv=${auto.wall.starvationTotal} deaths=${auto.wall.deathTotal}`);
  console.log(`PLAYED corpus: rows=${played.rows.length} ok=${played.corpusOk} meetings=${played.meetings.length}`);
  console.log(`PLAYED opportunities: episodes=${played.opp.episodes} gorgeSeen=${played.opp.gorgeSeen} sortied=${played.opp.sortied} lingererDays=${played.opp.lingererDays} gorgeNights=${played.opp.gorgeNights} answerCalls=${played.opp.answerCalls} attempts=${played.opp.attempts}`);
  console.log(`PLAYED wall: won=${played.wall.won} (full=${played.wall.wonFull}) natEver=${played.wall.nationalEver} natFinal=${played.wall.nationalFinal} table=${played.wall.table} entered=${played.wall.entered} wave4=${played.wall.wave4} wave5=${played.wall.wave5} median=${played.wall.medianDays} starv=${played.wall.starvationTotal} deaths=${played.wall.deathTotal}`);
  if (!auto.corpusOk || !played.corpusOk) { console.log('CORPUS-INVALID'); process.exit(1); }
  const autoSorties = auto.meetings.filter(m => m.caller === 'sortie');
  const playedSorties = played.meetings.filter(m => m.caller === 'sortie');
  const playedAids = played.meetings.filter(m => m.caller === 'aid');
  const autoAids = auto.meetings.filter(m => m.caller === 'aid');
  console.log(`AUTO sortie meetings=${autoSorties.length} (autonomous sorties — expect 0)`);
  const pst = sortieStats(playedSorties, 'PLAYED sorties (judged)');
  console.log(`--- contrast: aid fights (allyFromStart, NEVER pooled) ---`);
  const aidAll = autoAids.concat(playedAids);
  if (aidAll.length) {
    const aFought = aidAll.filter(f => (f.rounds | 0) >= 1);
    console.log(`aid fights total=${aidAll.length} fought=${aFought.length} outcomes=${JSON.stringify(dist(aidAll.map(f => f.outcome || 'OTHER')))} medianDPR=${aFought.length ? fmt(med(aFought.map(f => f.mDealt / f.rounds))) : 'n/a'}`);
  } else console.log('aid fights total=0');
  const foughtN = pst.fought;
  let corpusVerdict;
  if (playedSorties.length === 0 && played.opp.episodes === 0) corpusVerdict = 'SUBSTRATE-EMPTY';
  else if (playedSorties.length === 0 && played.opp.episodes > 0) corpusVerdict = 'ABSENCE-FINDING';
  else if (foughtN >= 10) corpusVerdict = 'DISTRIBUTION-COMPLETE';
  else corpusVerdict = 'DIAG-PARTIAL';
  console.log(`CORPUS-VERDICT: ${corpusVerdict} (fought sorties=${foughtN}, threshold 10)`);
  if (!senseOk) { console.log('FINAL-VERDICT: PENDING (sense leg not yet confirmed — re-run with --sense-ok after the sense script passes)'); return; }
  let final;
  if (corpusVerdict === 'DISTRIBUTION-COMPLETE') final = 'DIAG-GO';
  else if (corpusVerdict === 'ABSENCE-FINDING') final = 'DIAG-GO (absence leg only; distribution legs N/A with reason)';
  else if (corpusVerdict === 'SUBSTRATE-EMPTY') final = 'SUBSTRATE-EMPTY (not a kill, not a GO)';
  else if (corpusVerdict === 'DIAG-PARTIAL') final = 'DIAG-PARTIAL';
  else final = 'DIAG-NO-GO';
  console.log(`FINAL-VERDICT: ${final}`);
  console.log(JSON.stringify({ autoOpp: auto.opp, playedOpp: played.opp, autoWall: auto.wall, playedWall: played.wall, playedSorties: pst }, null, 1));
}

main();
