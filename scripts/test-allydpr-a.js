#!/usr/bin/env node
// scripts/test-allydpr-a.js — sim-allydpr-a analyzer + judge.
// DIAG ONLY: reads the tilejoin corpus, prices nothing by hand.
// Recomputes the tilejoin headline counts from the corpus (index-joined
// fieldparty + tilejoin rows, universe U verbatim from test-tilejoin-a.js),
// then prices each of the 24 U joined fights two ways:
//  (a) PRIMARY shout-time price (prereg formula): requires shoutRound,
//      HP at shout, leader HP at shout, per-round DPR at shout. The
//      corpus rows carry NONE of these keys, so the primary priced count
//      is computed by key presence, not by assumption — it is 0 by
//      construction of the corpus, and that IS the finding.
//  (b) PROXY end-state sufficient price (prereg formula, labeled PROXY):
//      vKill -> 1.0; else allyDealt > 0 -> 1 + mHpLeft / allyDealt;
//      allyDealt == 0 -> infinite/undefined (ally never struck).
// Exits 0 only on DIAG-GO (>= 20 primary-priced). Any other exit is the
// judged verdict, printed in full; the evidence file carries the numbers.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const ONDIR = process.env.ONDIR || path.join(REPO, 'evidence', '2026-10-29', 'perseed-tilejoin-a', 'on');
const OFFDIR = process.env.OFFDIR || path.join(REPO, 'evidence', '2026-10-29', 'perseed-tilejoin-a', 'off');

function loadLeg(dir) {
  return SEEDS.map(seed => JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8')));
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
    if (fp.length !== tj.length) joinErrors += Math.abs(fp.length - tj.length);
    for (let i = 0; i < fp.length; i++) {
      const f = fp[i], t = tj[i], b = bl[i];
      if (!t) { joinErrors++; continue; }
      if (f.day !== t.day || String(f.vid) !== String(t.vid) || String(f.mid) !== String(t.mid)) joinErrors++;
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
        // Primary-price inputs: presence-checked, never assumed.
        hasShoutRound: ('shoutRound' in t) || ('shoutRound' in f),
        hasHpAtShout: ('mHpAtShout' in t) || ('mHpAtShout' in f),
        hasVHpAtShout: ('vHpAtShout' in t) || ('vHpAtShout' in f),
        hasAllyActiveRounds: ('allyActiveRounds' in t) || ('allyActiveRounds' in f) });
    }
  }
  return { joined, joinErrors, uFought };
}

function censusOffAddressable(rows) {
  let pool = 0, fled = 0, kills = 0, deaths = 0;
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [];
    const tj = (r.tilejoin || {}).meetings || [];
    for (let i = 0; i < fp.length; i++) {
      const f = fp[i], t = tj[i];
      if (!t || !isU(f) || !((f.rounds | 0) >= 1)) continue;
      const fedN = (t.tileFed || []).length;
      if (fedN > 0 && t.everHopeless && t.intent !== 'learn' && t.outcome === 'vFlee') {
        pool++; fled++;
        if (t.outcome === 'vKill') kills++;
        if (t.outcome === 'vDie') deaths++;
      }
    }
  }
  return { pool, fled, kills, deaths };
}

function fmt(x, d) { return (x === null || x === undefined || !Number.isFinite(x)) ? 'inf' : x.toFixed(d === undefined ? 2 : d); }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function main() {
  const on = censusJoined(loadLeg(ONDIR));
  const offAddr = censusOffAddressable(loadLeg(OFFDIR));
  const J = on.joined;
  // Recomputation checks against sim-tilejoin-a.md headlines.
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
  // Primary price: finite only when every shout-time input is present.
  let primaryFinite = 0;
  for (const j of J) {
    j.primaryPriced = j.hasShoutRound && j.hasHpAtShout && j.hasVHpAtShout && j.hasAllyActiveRounds && (j.allyDealt | 0) > 0;
    if (j.primaryPriced) primaryFinite++;
  }
  // Proxy price.
  for (const j of J) {
    if (j.outcome === 'vKill') { j.kProxy = 1.0; j.proxyKind = 'kill-already'; }
    else if ((j.allyDealt | 0) > 0) { j.kProxy = 1 + j.mHpLeft / j.allyDealt; j.proxyKind = 'end-state'; }
    else { j.kProxy = Infinity; j.proxyKind = 'zero-dealt-infinite'; }
  }
  const finite = J.filter(j => Number.isFinite(j.kProxy)).map(j => j.kProxy);
  const med = median(finite);
  const share = (t, denom) => denom ? (finite.filter(k => k <= t).length / denom) : null;
  const branches = {};
  for (const j of J) branches[j.branch] = (branches[j.branch] || 0) + 1;
  console.log('=== sim-allydpr-a: joined-fight prices (U, ON leg, 24 fights) ===');
  console.log(`primary-priced (finite shout-time multiplier): ${primaryFinite}/24`);
  console.log(`proxy finite: ${finite.length}/24; proxy infinite (allyDealt==0): ${J.length - finite.length}`);
  console.log(`proxy median (finite only): ${fmt(med, 2)}x`);
  for (const t of [1.5, 3, 5]) {
    console.log(`proxy share <= ${t}x: finite-denom ${fmt(share(t, finite.length) * 100, 1)}% (${finite.filter(k => k <= t).length}/${finite.length}); all-24-denom ${fmt(share(t, 24) * 100, 1)}% (${finite.filter(k => k <= t).length}/24)`);
  }
  console.log(`outcome mix: ${JSON.stringify(outcomes)}; branch mix: ${JSON.stringify(branches)}`);
  console.log(`joined deaths: ${joinedDeaths}/24 = ${(joinedDeaths / 24 * 100).toFixed(1)}%`);
  console.log(`OFF addressable pool: ${offAddr.pool} fights, fled ${offAddr.fled}, kills ${offAddr.kills}, deaths ${offAddr.deaths}`);
  console.log('--- per-fight proxy prices ---');
  for (const j of J) {
    console.log(`  s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} ${j.caller} r${j.rounds} ${j.outcome} branch=${j.branch} ally=${j.joinedAllyVid} mHpStart=${j.mHpStart} mHpLeft=${j.mHpLeft} mDealt=${j.mDealt} allyDealt=${j.allyDealt} allyTaken=${j.allyTaken} k_proxy=${fmt(j.kProxy, 2)} (${j.proxyKind}) primary=${j.primaryPriced ? 'priced' : 'UNPRICEABLE'}`);
  }
  // Wave split of finite proxy prices.
  for (const w of [1, 2, 3, 4]) {
    const sub = J.filter(j => j.wave === w);
    const fin = sub.filter(j => Number.isFinite(j.kProxy)).map(j => j.kProxy);
    console.log(`wave ${w}: n=${sub.length} finite=${fin.length} median=${fmt(median(fin), 2)}x`);
  }
  const go = recomputeOk && primaryFinite >= 20;
  console.log(go ? 'DIAG-GO' : 'DIAG-NO-GO / INSUFFICIENT-DATA (primary bar: >=20/24 primary-priced)');
  if (!go) process.exit(1);
}
main();
