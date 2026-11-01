#!/usr/bin/env node
// scripts/sim-wave4leth-a-analyze.js — analyzer + judge for sim-wave4leth-a.
// Reads evidence/2026-11-01/sim-wave4leth-a/s<seed>-played.json (EVID
// override), judges against evidence/2026-11-01/sim-wave4leth-a-prereg.md.
// Prints the verdict after every rebase. Exit 0 on DIAG-GO or
// INSUFFICIENT-DATA (both are honest verdicts); exit 1 on DIAG-NO-GO
// (a judged leg failed) or CORPUS-INVALID.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'sim-wave4leth-a');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

function medianOf(a) { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
function share(n, d) { return d ? +(n / d).toFixed(3) : null; }
function dist(a) { const m = {}; for (const v of a) m[String(v)] = (m[String(v)] || 0) + 1; return m; }
function endState(o) {
  if (o === 'vKill') return 'KILL';
  if (o === 'mFlee') return 'DRIVE-OFF';
  if (o === 'vFlee') return 'FLED';
  if (o === 'vDie') return 'DIED';
  if (o === 'evade') return 'EVADE';
  return 'OTHER:' + String(o);
}
function serious(f) {
  return (f.mHpStart | 0) >= 100 && (((f.mDealt | 0) >= 200) || ((f.mHpLeft != null && f.mHpStart) && f.mHpLeft <= 0.5 * f.mHpStart));
}

function main() {
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-played.json`), 'utf8')));
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0)
    && (r.wrapDiag.errs | 0) === 0);
  const w4 = [];
  for (const r of rows) for (const f of (r.wave4Fights || [])) w4.push(Object.assign({ seed: r.seed }, f));
  const diagW4 = [];
  for (const r of rows) for (const m of (r.fieldparty.meetings || [])) if ((m.wave | 0) === 4) diagW4.push(Object.assign({ seed: r.seed }, m));

  const fought = w4.filter(f => f.outcome !== 'evade');
  const evades = w4.filter(f => f.outcome === 'evade');
  const byState = {};
  for (const f of w4) { const s = endState(f.outcome); byState[s] = (byState[s] || 0) + 1; }
  const byStateFought = {};
  for (const f of fought) { const s = endState(f.outcome); byStateFought[s] = (byStateFought[s] || 0) + 1; }
  const byCaller = dist(w4.map(f => f.caller));
  const byCallerFought = dist(fought.map(f => f.caller));

  const leaderDeaths = fought.filter(f => f.outcome === 'vDie').length;
  const joined = fought.filter(f => f.joined);
  const allyDeaths = joined.filter(f => f.allyDied === true).length;
  const allyUnstruck = joined.filter(f => f.allyDied === null).length;
  const beastDeaths = fought.filter(f => f.outcome === 'vKill').length;
  const kills = fought.filter(f => f.outcome === 'vKill');
  const seriousFights = fought.filter(serious);
  const ksFights = [...kills, ...seriousFights.filter(f => f.outcome !== 'vKill')];
  const ksLeaderAlive = ksFights.filter(f => f.outcome !== 'vDie').length;
  const ksJoined = ksFights.filter(f => f.joined);
  const ksAllyAlive = ksJoined.filter(f => f.allyDied === false).length;
  const ksAllyUnstruck = ksJoined.filter(f => f.allyDied === null).length;

  const roundsFlee = fought.filter(f => f.outcome === 'vFlee').map(f => f.rounds);
  const roundsDie = fought.filter(f => f.outcome === 'vDie').map(f => f.rounds);
  const roundsKill = kills.map(f => f.rounds);
  const roundsDrive = fought.filter(f => f.outcome === 'mFlee').map(f => f.rounds);
  const fleeMech = { hopeless: fought.filter(f => f.outcome === 'vFlee' && f.fleeHopeless).length,
    hpFloor: fought.filter(f => f.outcome === 'vFlee' && f.fleeHpFrac != null).length,
    learn: fought.filter(f => f.outcome === 'vFlee' && f.fleeLearn).length,
    cap15: fought.filter(f => f.rounds === 15 && f.outcome !== 'vKill').length };

  const conc = ksFights.filter(f => (f.mDealt | 0) > 0).map(f => {
    const leader = (f.mDealt - f.allyDealt) / f.mDealt;
    const ally = f.allyDealt / f.mDealt;
    const volley = (f.volleyDmg | 0) / f.mDealt;
    return { leader, ally, volley, top: Math.max(leader, ally) };
  });
  const medLeader = medianOf(conc.map(c => +c.leader.toFixed(3)));
  const medAlly = medianOf(conc.map(c => +c.ally.toFixed(3)));
  const medVolley = medianOf(conc.map(c => +c.volley.toFixed(3)));
  const medTop = medianOf(conc.map(c => +c.top.toFixed(3)));

  const joinedDist = dist(fought.map(f => f.joined ? 2 : 1));
  const musteredDist = dist(fought.map(f => ((f.engineAllies | 0) + 1)));
  const shoutJoined = fought.filter(f => f.calledHelp && !f.allyFromStart).length;
  const gap = fought.map(f => ((f.engineAllies | 0) + 1) - (f.joined ? 2 : 1));
  const hpBands = { le64: fought.filter(f => (f.mHpStart | 0) <= 64).length,
    b65_90: fought.filter(f => (f.mHpStart | 0) >= 65 && (f.mHpStart | 0) <= 90).length,
    ge91: fought.filter(f => (f.mHpStart | 0) >= 91).length };
  const hpBandKills = { le64: fought.filter(f => (f.mHpStart | 0) <= 64 && f.outcome === 'vKill').length,
    b65_90: fought.filter(f => (f.mHpStart | 0) >= 65 && (f.mHpStart | 0) <= 90 && f.outcome === 'vKill').length,
    ge91: fought.filter(f => (f.mHpStart | 0) >= 91 && f.outcome === 'vKill').length };
  const hpBandLeaderDeaths = { le64: fought.filter(f => (f.mHpStart | 0) <= 64 && f.outcome === 'vDie').length,
    b65_90: fought.filter(f => (f.mHpStart | 0) >= 65 && (f.mHpStart | 0) <= 90 && f.outcome === 'vDie').length,
    ge91: fought.filter(f => (f.mHpStart | 0) >= 91 && f.outcome === 'vDie').length };

  // Context from diag meetings (leader gear + readiness, wave-4 subset).
  const ctx = { leaderArmed: diagW4.filter(m => m.leader && m.leader.armed).length,
    leaderTotal: diagW4.length,
    armorPs: diagW4.map(m => (m.leader && m.leader.armorP != null) ? m.leader.armorP : null).filter(v => v != null),
    trickKnown: diagW4.filter(m => m.trickKnown).length,
    cornered: diagW4.filter(m => m.cornered).length,
    everHopeless: diagW4.filter(m => m.everHopeless).length };
  const pantryAt = fought.map(f => f.pantryBefore).filter(v => v != null);

  const wall = { won: rows.reduce((t, r) => t + r.won, 0),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4reach: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5reach: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: medianOf(rows.map(r => r.days)),
    starv: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deaths: rows.reduce((t, r) => t + r.deathTotal, 0) };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;

  // Sense picks: DIED first, then FLED, then serious/kill.
  const sense = {};
  const died = fought.filter(f => f.outcome === 'vDie');
  const fled = fought.filter(f => f.outcome === 'vFlee');
  if (died.length) sense.died = died[0];
  if (fled.length) sense.fled = fled[0];
  if (ksFights.length) sense.seriousOrKill = ksFights[0];

  const out = { corpusOk, rows: rows.length, w4Total: w4.length, fought: fought.length, evades: evades.length,
    byState, byStateFought, byCaller, byCallerFought,
    leaderDeathRate: share(leaderDeaths, fought.length), leaderDeaths,
    allyDeathRate: share(allyDeaths, joined.length), allyDeaths, joinedFights: joined.length, allyUnstruck,
    beastDeathRate: share(beastDeaths, fought.length), beastDeaths,
    killerSurvival: { fights: ksFights.length, leaderAlive: ksLeaderAlive, leaderAliveRate: share(ksLeaderAlive, ksFights.length),
      joined: ksJoined.length, allyAlive: ksAllyAlive, allyAliveRate: share(ksAllyAlive, ksJoined.length), allyUnstruck: ksAllyUnstruck },
    rounds: { flee: { n: roundsFlee.length, median: medianOf(roundsFlee), min: roundsFlee.length ? Math.min(...roundsFlee) : null, max: roundsFlee.length ? Math.max(...roundsFlee) : null },
      die: { n: roundsDie.length, median: medianOf(roundsDie), min: roundsDie.length ? Math.min(...roundsDie) : null, max: roundsDie.length ? Math.max(...roundsDie) : null },
      kill: { n: roundsKill.length, median: medianOf(roundsKill) },
      driveOff: { n: roundsDrive.length, median: medianOf(roundsDrive) } },
    fleeMech,
    concentration: { n: conc.length, medLeaderShare: medLeader, medAllyShare: medAlly, medVolleyShare: medVolley, medTopShare: medTop,
      verdict: conc.length ? (medTop >= 0.9 ? 'CONCENTRATED' : 'SPREAD') : null },
    engineCap: { joinedDist, musteredDist, shoutJoined, shoutJoinedRate: share(shoutJoined, fought.length),
      gapMedian: medianOf(gap), gapDist: dist(gap) },
    hpBands: { counts: hpBands, kills: hpBandKills, leaderDeaths: hpBandLeaderDeaths },
    context: { diagW4: diagW4.length, wrapperW4: w4.length, countMatch: diagW4.length === w4.length,
      leaderArmed: ctx.leaderArmed, leaderTotal: ctx.leaderTotal,
      armorPMedian: medianOf(ctx.armorPs), trickKnown: ctx.trickKnown, cornered: ctx.cornered,
      everHopeless: ctx.everHopeless, pantryMedian: medianOf(pantryAt) },
    wall, deathsByCause,
    perSeed: rows.map(r => ({ seed: r.seed, days: r.days, end: r.endReason, wave: r.waveReach, w4: (r.wave4Fights || []).length, diagW4: (r.fieldparty.meetings || []).filter(m => (m.wave | 0) === 4).length })),
    sense: sense,
  };
  console.log(JSON.stringify(out, null, 1));

  // Judge.
  const endStateComplete = w4.length > 0 && Object.values(byState).reduce((t, v) => t + v, 0) === w4.length;
  const ksRecorded = ksFights.every(f => f.outcome != null && (f.joined ? f.allyDied !== undefined : true));
  let verdict, exit = 0;
  if (!corpusOk) { verdict = 'CORPUS-INVALID'; exit = 1; }
  else if (fought.length < 8) { verdict = 'INSUFFICIENT-DATA'; }
  else if (!endStateComplete || !ksRecorded) { verdict = 'DIAG-NO-GO'; exit = 1; }
  else if (!sense.died && !sense.fled && !sense.seriousOrKill) { verdict = 'DIAG-NO-GO (no transcript)'; exit = 1; }
  else verdict = 'DIAG-GO';
  console.log(`VERDICT: ${verdict} (fought=${fought.length} offered=${w4.length} evades=${evades.length} seedsWave4=${wall.wave4reach})`);
  if (verdict === 'INSUFFICIENT-DATA') {
    console.log(`OPPORTUNITY: seedsReachingWave4=${wall.wave4reach}/8 offered=${w4.length} fought=${fought.length} byCaller=${JSON.stringify(byCaller)} byCallerFought=${JSON.stringify(byCallerFought)}`);
  }
  process.exit(exit);
}
main();
