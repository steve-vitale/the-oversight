#!/usr/bin/env node
// scripts/test-shoutrec-a.js — sim-shoutrec-a analyzer + judge.
// DIAG ONLY: reads the shoutrec corpus, prices each joined fight at
// SHOUT TIME (prereg formulas, evidence/2026-10-29/sim-shoutrec-a-prereg.md),
// and judges exactly against the prereg header. Modes:
//   (no args)          : fixture tests + corpus judge (ONDIR env or
//                        evidence/2026-10-29/perseed-shoutrec-a/on).
//   --neutrality A B   : compare per-seed rows in dirs A and B after
//                        deleting the shoutrec store key; exit 0 iff
//                        every row is byte-identical (recorder-off ==
//                        recorder-on on identical seeds).
// Exit 0 only on DIAG-GO. Any other exit is the judged verdict,
// printed in full; the evidence file carries the numbers.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const ONDIR = process.env.ONDIR || path.join(REPO, 'evidence', '2026-10-29', 'perseed-shoutrec-a', 'on');

function fmt(x, d) { return (x === null || x === undefined || !Number.isFinite(x)) ? 'inf' : x.toFixed(d === undefined ? 2 : d); }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function shareLE(xs, t) { return xs.length ? xs.filter(k => k <= t).length / xs.length : null; }

// Pure pricing core (fixture-tested below; the judge uses it verbatim).
function priceFight(j) {
  // j: { S, HPs, vHps, Mmax, mBreak, shoutMdealt, shoutVtaken,
  //      rounds, allyDealt }
  const S = j.S;
  const dprTot = j.shoutMdealt / S;
  const mDpr = j.shoutVtaken / S;
  const rtdS = j.vHps / Math.max(1, mDpr);
  const rtkS = j.HPs / Math.max(1, dprTot);
  const active = Math.max(0, j.rounds - S);
  const observed = active > 0 ? j.allyDealt / active : 0;
  const needS = j.HPs - j.mBreak * j.Mmax;
  const out = { rtdS, rtkS, active, observed, needS,
    hopelessCheck: rtdS < rtkS * 0.85, kKill: null, kSurv: null, kind: null };
  if (active === 0) { out.kind = 'zero-window'; out.kKill = Infinity; out.kSurv = Infinity; return out; }
  if (observed <= 0) { out.kind = 'active-zero-dealt'; out.kKill = Infinity; out.kSurv = Infinity; return out; }
  out.kKill = (j.HPs / rtdS) / observed;
  if (needS <= 0) { out.kSurv = 0; out.kind = 'already-below-break'; }
  else { out.kSurv = (needS / rtdS) / observed; out.kind = 'priced'; }
  return out;
}

// Per-round damage from cumulative roundTotals + rec totals.
// Returns { perRound: [{round, leader, ally, taken, allyTaken}], flags: [] }.
// Residual (rec total minus morale-entry diffs) is assigned to the
// final round and flagged; sums then reconcile exactly, or the fight
// is flagged parse-mismatch.
function perRoundDamage(roundTotals, rounds, totals) {
  const flags = [];
  if (!Array.isArray(roundTotals)) return { perRound: null, flags: ['no-round-totals'] };
  const sorted = roundTotals.slice().sort((a, b) => a.round - b.round);
  const byRound = {};
  let prev = { mDealt: 0, vTaken: 0, allyDealt: 0, allyTaken: 0 };
  for (const t of sorted) {
    byRound[t.round] = { round: t.round,
      leader: (t.mDealt - prev.mDealt) - (t.allyDealt - prev.allyDealt),
      ally: t.allyDealt - prev.allyDealt,
      taken: t.vTaken - prev.vTaken, allyTaken: t.allyTaken - prev.allyTaken };
    prev = { mDealt: t.mDealt, vTaken: t.vTaken, allyDealt: t.allyDealt, allyTaken: t.allyTaken };
  }
  const sums = { leader: 0, ally: 0, taken: 0, allyTaken: 0 };
  for (const r of Object.values(byRound)) { sums.leader += r.leader; sums.ally += r.ally; sums.taken += r.taken; sums.allyTaken += r.allyTaken; }
  const wantLeader = totals.mDealt - totals.allyDealt;
  const res = { leader: wantLeader - sums.leader, ally: totals.allyDealt - sums.ally,
    taken: totals.vTaken - sums.taken, allyTaken: totals.allyTaken - sums.allyTaken };
  if (res.leader !== 0 || res.ally !== 0 || res.taken !== 0 || res.allyTaken !== 0) {
    const fin = byRound[rounds];
    if (fin) {
      fin.leader += res.leader; fin.ally += res.ally; fin.taken += res.taken; fin.allyTaken += res.allyTaken;
      flags.push('residual-merged-final-round');
    } else {
      byRound[rounds] = { round: rounds, leader: res.leader, ally: res.ally, taken: res.taken, allyTaken: res.allyTaken };
      flags.push('residual-final-round');
    }
  }
  const check = { leader: 0, ally: 0, taken: 0, allyTaken: 0 };
  for (const r of Object.values(byRound)) { check.leader += r.leader; check.ally += r.ally; check.taken += r.taken; check.allyTaken += r.allyTaken; }
  if (check.leader !== wantLeader || check.ally !== totals.allyDealt || check.taken !== totals.vTaken || check.allyTaken !== totals.allyTaken) flags.push('parse-mismatch');
  const perRound = Object.values(byRound).sort((a, b) => a.round - b.round);
  return { perRound, flags };
}

function isU(f) {
  const leader = f.leader || {};
  return f.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(f.caller) >= 0 &&
    f.wave >= 1 && f.wave <= 4 && leader.isScholar !== true;
}

function censusJoined(rows) {
  const joined = [];
  let joinErrors = 0, uFought = 0;
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [];
    const tj = (r.tilejoin || {}).meetings || [];
    const bl = (r.breakline || {}).meetings || [];
    const sr = (r.shoutrec || {}).meetings || [];
    for (const arr of [tj, bl, sr]) if (arr.length !== fp.length) joinErrors += Math.abs(arr.length - fp.length);
    for (let i = 0; i < fp.length; i++) {
      const f = fp[i], t = tj[i], b = bl[i], s = sr[i];
      if (!t || !s) { joinErrors++; continue; }
      if (f.day !== t.day || String(f.vid) !== String(t.vid) || String(f.mid) !== String(t.mid)) joinErrors++;
      if (s && (f.day !== s.day || String(f.vid) !== String(s.vid) || String(f.mid) !== String(s.mid))) joinErrors++;
      if (!isU(f)) continue;
      if (!((f.rounds | 0) >= 1)) continue;
      uFought++;
      if (!t.joinedAllyVid) continue;
      joined.push({ seed: r.seed, day: t.day, vid: t.vid, mid: t.mid, wave: t.wave,
        caller: t.caller, rounds: t.rounds, outcome: t.outcome,
        joinedAllyVid: t.joinedAllyVid, fedVids: t.fedVids || [],
        mHpStart: f.mHpStart, mHpLeft: f.mHpLeft, mDealt: t.mDealt, vTaken: t.vTaken,
        allyDealt: t.allyDealt, allyTaken: t.allyTaken,
        branch: b ? b.branch : null, everHopeless: t.everHopeless, intent: t.intent,
        allyFromStart: !!(s.allyFromStart || (b && b.allyFromStart)),
        shoutRound: s.shoutRound, shoutMhp: s.shoutMhp, shoutMmax: s.shoutMmax,
        shoutVhp: s.shoutVhp, shoutVhpMax: s.shoutVhpMax, shoutMdealt: s.shoutMdealt,
        shoutVtaken: s.shoutVtaken, shoutAllyDealt: s.shoutAllyDealt,
        shoutMbreak: s.shoutMbreak, shoutFleeAt: s.shoutFleeAt, shoutVbreak: s.shoutVbreak,
        roundTotals: s.roundTotals });
    }
  }
  return { joined, joinErrors, uFought };
}

function runFixtures() {
  let fail = 0;
  const ck = (name, cond, detail) => { console.log(`FIXTURE ${name}: ${cond ? 'PASS' : 'FAIL'}${detail !== undefined ? ' ' + detail : ''}`); if (!cond) fail++; };
  // Kill 5.00x / survival 2.50x on a hand-computed fight.
  const p = priceFight({ S: 2, HPs: 100, vHps: 50, Mmax: 200, mBreak: 0.25, shoutMdealt: 40, shoutVtaken: 30, rounds: 3, allyDealt: 6 });
  ck('kill-flip 5.00x', Math.abs(p.kKill - 5) < 1e-9, `kKill=${p.kKill}`);
  ck('survival-flip 2.50x', Math.abs(p.kSurv - 2.5) < 1e-9, `kSurv=${p.kSurv}`);
  ck('rtd 3.333', Math.abs(p.rtdS - 10 / 3) < 1e-9, `rtdS=${p.rtdS}`);
  ck('hopeless-check true', p.hopelessCheck === true, `rtk=${p.rtkS}`);
  ck('active 1', p.active === 1, `active=${p.active}`);
  const f0 = priceFight({ S: 2, HPs: 100, vHps: 50, Mmax: 200, mBreak: 0.25, shoutMdealt: 40, shoutVtaken: 30, rounds: 2, allyDealt: 0 });
  ck('zero-window infinite', f0.kind === 'zero-window' && !Number.isFinite(f0.kKill) && !Number.isFinite(f0.kSurv), `kind=${f0.kind}`);
  const az = priceFight({ S: 2, HPs: 100, vHps: 50, Mmax: 200, mBreak: 0.25, shoutMdealt: 40, shoutVtaken: 30, rounds: 4, allyDealt: 0 });
  ck('active-zero-dealt infinite', az.kind === 'active-zero-dealt' && !Number.isFinite(az.kKill), `kind=${az.kind}`);
  const ab = priceFight({ S: 2, HPs: 40, vHps: 50, Mmax: 200, mBreak: 0.25, shoutMdealt: 40, shoutVtaken: 30, rounds: 3, allyDealt: 6 });
  ck('already-below-break kSurv=0', ab.kind === 'already-below-break' && ab.kSurv === 0, `needS=${ab.needS}`);
  // Per-round diffs + residual reconciliation.
  const pr = perRoundDamage(
    [{ round: 1, mDealt: 20, vTaken: 10, allyDealt: 0, allyTaken: 0 },
     { round: 2, mDealt: 35, vTaken: 25, allyDealt: 0, allyTaken: 0 }],
    3, { mDealt: 50, vTaken: 30, allyDealt: 8, allyTaken: 5 });
  ck('per-round residual-final-round', pr.flags.indexOf('residual-final-round') >= 0 && pr.perRound.length === 3, `flags=${pr.flags.join(',')}`);
  ck('per-round sums reconcile', pr.perRound.reduce((t, r) => t + r.ally, 0) === 8 && pr.perRound.reduce((t, r) => t + r.leader, 0) === 42, `ally=${pr.perRound.reduce((t, r) => t + r.ally, 0)} leader=${pr.perRound.reduce((t, r) => t + r.leader, 0)}`);
  ck('median even', median([1, 2, 3, 4]) === 2.5, `median=${median([1, 2, 3, 4])}`);
  ck('shareLE', shareLE([1, 2, 5], 3) === 2 / 3, `share=${shareLE([1, 2, 5], 3)}`);
  return fail;
}

function stripShoutrec(row) {
  const c = JSON.parse(JSON.stringify(row));
  delete c.shoutrec;
  return c;
}
function firstDiff(a, b, prefix) {
  if (a === b) return null;
  if (typeof a !== typeof b) return `${prefix}: type ${typeof a} vs ${typeof b}`;
  if (a === null || b === null || typeof a !== 'object') return `${prefix}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
  const keys = new Set(Object.keys(a).concat(Object.keys(b)));
  for (const k of keys) {
    if (!(k in a)) return `${prefix}.${k}: missing in A`;
    if (!(k in b)) return `${prefix}.${k}: missing in B`;
    const d = firstDiff(a[k], b[k], `${prefix}.${k}`);
    if (d) return d;
  }
  return null;
}
function neutralityMode(dirA, dirB) {
  let fail = 0;
  for (const seed of SEEDS) {
    const a = stripShoutrec(JSON.parse(fs.readFileSync(path.join(dirA, `s${seed}-fresh.json`), 'utf8')));
    const b = stripShoutrec(JSON.parse(fs.readFileSync(path.join(dirB, `s${seed}-fresh.json`), 'utf8')));
    const d = firstDiff(a, b, `s${seed}`);
    console.log(`NEUTRALITY s${seed}: ${d ? 'DIFF ' + d : 'IDENTICAL'}`);
    if (d) fail++;
  }
  console.log(fail ? `NEUTRALITY: FAIL (${fail} seeds differ)` : 'NEUTRALITY: PASS (all rows identical minus shoutrec store)');
  process.exit(fail ? 1 : 0);
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--neutrality') { neutralityMode(args[1], args[2]); return; }
  const fixtureFails = runFixtures();
  if (fixtureFails) { console.log(`FIXTURES: ${fixtureFails} FAILURES — judge aborted`); process.exit(1); }
  const rows = SEEDS.map(seed => JSON.parse(fs.readFileSync(path.join(ONDIR, `s${seed}-fresh.json`), 'utf8')));
  const on = censusJoined(rows);
  const J = on.joined;
  const outcomes = {};
  let allyDealtTot = 0, allyTakenTot = 0, joinedDeaths = 0;
  for (const j of J) {
    outcomes[j.outcome] = (outcomes[j.outcome] || 0) + 1;
    allyDealtTot += j.allyDealt | 0; allyTakenTot += j.allyTaken | 0;
    if (j.outcome === 'vDie') joinedDeaths++;
  }
  const checks = [
    ['U joined == 24', J.length === 24],
    ['U fought (ON) == 250', on.uFought === 250],
    ['index-join errors == 0', on.joinErrors === 0],
    ['joined outcomes 2/4/15/3', outcomes.vKill === 2 && outcomes.mFlee === 4 && outcomes.vFlee === 15 && outcomes.vDie === 3],
    ['ally dealt total == 137', allyDealtTot === 137],
    ['ally taken total == 296', allyTakenTot === 296],
  ];
  for (const [n, ok] of checks) console.log(`CHECK ${n}: ${ok ? 'PASS' : 'FAIL'}`);
  const recomputeOk = checks.every(c => c[1]);
  console.log(`RECOMPUTE: ${recomputeOk ? 'PASS' : 'FAIL'}`);
  // Split + price.
  const shoutJoined = [], noShout = [];
  for (const j of J) {
    if (j.shoutRound != null) shoutJoined.push(j);
    else noShout.push(j);
  }
  const noShoutFromStart = noShout.filter(j => j.allyFromStart).length;
  const noShoutUnexplained = noShout.filter(j => !j.allyFromStart).length;
  const priced = [];
  let zeroWindow = 0, activeZero = 0, shoutAllyNonzero = 0, hopelessCheckFail = 0, parseMismatch = 0;
  for (const j of shoutJoined) {
    if ((j.shoutAllyDealt | 0) !== 0) { shoutAllyNonzero++; j.priceKind = 'shout-ally-dealt-nonzero'; continue; }
    const p = priceFight({ S: j.shoutRound, HPs: j.shoutMhp, vHps: j.shoutVhp, Mmax: j.shoutMmax,
      mBreak: j.shoutMbreak, shoutMdealt: j.shoutMdealt, shoutVtaken: j.shoutVtaken,
      rounds: j.rounds, allyDealt: j.allyDealt });
    Object.assign(j, { rtdS: p.rtdS, rtkS: p.rtkS, activeRounds: p.active, observedDpr: p.observed,
      needS: p.needS, kKill: p.kKill, kSurv: p.kSurv, priceKind: p.kind });
    if (!p.hopelessCheck) hopelessCheckFail++;
    const pr = perRoundDamage(j.roundTotals, j.rounds, { mDealt: j.mDealt, vTaken: j.vTaken, allyDealt: j.allyDealt, allyTaken: j.allyTaken });
    j.perRound = pr.perRound; j.perRoundFlags = pr.flags;
    if (pr.flags.indexOf('parse-mismatch') >= 0) parseMismatch++;
    j.allyStrikeRounds = pr.perRound ? pr.perRound.filter(r => r.round > j.shoutRound && r.ally > 0).length : null;
    if (p.kind === 'zero-window') zeroWindow++;
    else if (p.kind === 'active-zero-dealt') activeZero++;
    else priced.push(j);
  }
  // Priced population for the GO bar: shout-joined, active > 0,
  // shoutAllyDealt == 0. Finite for BOTH flips = priced with finite
  // kKill and finite kSurv (already-below-break kSurv=0 counts finite).
  const pricedFiniteKill = priced.filter(j => Number.isFinite(j.kKill));
  const pricedFiniteBoth = priced.filter(j => Number.isFinite(j.kKill) && Number.isFinite(j.kSurv));
  const denom = shoutJoined.filter(j => (j.rounds - j.shoutRound) > 0 && (j.shoutAllyDealt | 0) === 0).length;
  const killXs = pricedFiniteBoth.map(j => j.kKill);
  const survXs = pricedFiniteBoth.map(j => j.kSurv);
  const branches = {};
  for (const j of J) branches[j.branch] = (branches[j.branch] || 0) + 1;
  console.log('=== sim-shoutrec-a: shout-time flip prices (U, fresh ON band) ===');
  console.log(`joined total: ${J.length}; shout-joined: ${shoutJoined.length}; no-shout: ${noShout.length} (ally-from-start ${noShoutFromStart}, unexplained ${noShoutUnexplained})`);
  console.log(`zero-window (floor, infinite): ${zeroWindow}; active-but-dealt-0 (infinite): ${activeZero}; shoutAllyDealt-nonzero (excluded): ${shoutAllyNonzero}`);
  console.log(`priced population (active>0, shoutAllyDealt==0): ${denom}; finite BOTH flips: ${pricedFiniteBoth.length}; finite kill only: ${pricedFiniteKill.length}`);
  console.log(`primary finite share (both flips): ${denom ? (pricedFiniteBoth.length / denom * 100).toFixed(1) : 'n/a'}% (${pricedFiniteBoth.length}/${denom}) — GO bar >= 80%`);
  console.log(`kKill median (finite both): ${fmt(median(killXs), 2)}x; kSurv median (finite both): ${fmt(median(survXs), 2)}x`);
  for (const t of [1.5, 3, 5]) {
    console.log(`kKill share <= ${t}x: finite-both-denom ${fmt(shareLE(killXs, t) * 100, 1)}% (${killXs.filter(k => k <= t).length}/${killXs.length}); all-joined-denom ${fmt(shareLE(killXs, t) * 100 * killXs.length / Math.max(1, J.length), 1)}% (${killXs.filter(k => k <= t).length}/${J.length})`);
    console.log(`kSurv share <= ${t}x: finite-both-denom ${fmt(shareLE(survXs, t) * 100, 1)}% (${survXs.filter(k => k <= t).length}/${survXs.length}); all-joined-denom ${fmt(shareLE(survXs, t) * 100 * survXs.length / Math.max(1, J.length), 1)}% (${survXs.filter(k => k <= t).length}/${J.length})`);
  }
  console.log(`outcome mix: ${JSON.stringify(outcomes)}; branch mix: ${JSON.stringify(branches)}`);
  console.log(`joined deaths: ${joinedDeaths}/${J.length} = ${(joinedDeaths / Math.max(1, J.length) * 100).toFixed(1)}%`);
  console.log(`integrity: hopelessCheckFail=${hopelessCheckFail} parseMismatch=${parseMismatch} shoutFleeAt==shoutVbreak mismatches=${shoutJoined.filter(j => j.shoutFleeAt !== null && j.shoutVbreak !== null && Math.abs(j.shoutFleeAt - j.shoutVbreak) > 1e-9).length}`);
  console.log('--- per-fight shout-time prices ---');
  for (const j of J) {
    const pr = (j.perRound || []).map(r => `R${r.round}:L${r.leader}/A${r.ally}`).join(' ');
    console.log(`  s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} ${j.caller} r${j.rounds} ${j.outcome} branch=${j.branch} ally=${j.joinedAllyVid} S=${j.shoutRound} HPs=${j.shoutMhp} vHps=${j.shoutVhp}/${j.shoutVhpMax} Mmax=${j.shoutMmax} mBreak=${j.shoutMbreak} fleeAt=${j.shoutFleeAt} rtdS=${fmt(j.rtdS, 2)} active=${j.activeRounds} strikes=${j.allyStrikeRounds} allyDealt=${j.allyDealt} obsDpr=${fmt(j.observedDpr, 2)} needS=${fmt(j.needS, 1)} kKill=${fmt(j.kKill, 2)} kSurv=${fmt(j.kSurv, 2)} kind=${j.priceKind || (j.shoutRound == null ? (j.allyFromStart ? 'no-shout-ally-from-start' : 'no-shout-unexplained') : 'excluded')} perRound=[${pr}] flags=${(j.perRoundFlags || []).join(',')}`);
  }
  for (const w of [1, 2, 3, 4]) {
    const sub = pricedFiniteBoth.filter(j => j.wave === w);
    console.log(`wave ${w}: priced-both n=${sub.length} median kKill=${fmt(median(sub.map(j => j.kKill)), 2)}x median kSurv=${fmt(median(sub.map(j => j.kSurv)), 2)}x`);
  }
  const go = recomputeOk && noShoutUnexplained === 0 && denom > 0 && pricedFiniteBoth.length / denom >= 0.8;
  console.log(go ? 'DIAG-GO' : (recomputeOk ? 'DIAG-NO-GO / INSUFFICIENT-DATA (primary bar: >=80% finite both flips over active>0 shout-joined, or unexplained no-shout rows)' : 'DIVERGENCE (recompute checks failed — substrate moved; no price trusted until explained)'));
  if (!go) process.exit(1);
}
main();
