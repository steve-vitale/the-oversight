#!/usr/bin/env node
// windowreach-r3-analyze-20261021.js — post-unlock-window attribution analyzer,
// round 3 (flesh-out loop arm sim-windowreach-r3, axis scale-onramp).
// PURE: no harness, no Game — works from the sweep's per-seed JSONs +
// src/data/monsters.json (wave resolution from data).
//
// ATTRIBUTION DEFINITIONS (the r2 pre-registration, binding):
//   attributed engagement (wave>=4) = known mid + resolvable wave (from data)
//     + taxonomy shape + (captured fight-id joined to a kill record OR to a
//     tbOutcome OR explicit unresolved reason: fled/aborted/unrecorded).
//   attributed wave-5 kill = day + mid + resolvable wave + killer + via.
//   unexplained = unresolvable wave OR engagement without fight-id AND
//     without day+mid fallback kill match.
//   instrumentErrors = any entry in the instrument's error sink.
// GO: every unlocking run 100% attributed, 0 unexplained, 0 instrumentErrors.
// Minimum: >=2 unlocking runs (across phases 1+2); below 2 =
//   insufficient-data, report-only.
//
// The sweep (windowreach-r3-sweep-20261021.js) performs the fight-id joins
// in-process (fight ids contain Date.now and are never persisted) and writes
// per engagement: fightIdPresent, outcome, outcomeSource
// ('tbEnd'|'dissolved'|'unrecorded'), killJoin, killBy, killVia. The analyzer
// never needs the raw ids.
//
// Field fights carry their outcome on the record; they are attributed iff
// mid known + wave resolvable + outcome classified (not 'unresolved').
//
// #760 fields: the analyzer carries winTrack{path,branch,resolution,phase},
// seat, rankAtEnd, maxRank, everNational through to the per-run and summary
// records (the vgear/twovets instruments never recorded them).
//
// Usage:
//   node scripts/windowreach-r3-analyze-20261021.js [perseedDir] [outJson]
//   (defaults: evidence/2026-10-21/perseed-windowreach-r3, prints summary to
//   stdout and writes windowreach-r3-attribution.json into perseedDir.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const PERSEED = process.argv[2] || path.join(REPO, 'evidence', '2026-10-21', 'perseed-windowreach-r3');
const OUT = process.argv[3] || path.join(PERSEED, 'windowreach-r3-attribution.json');

let WAVE_OF = {};
try {
  const defs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of defs) if (m && m.id && (m.wave | 0) >= 1) WAVE_OF[m.id] = m.wave | 0;
} catch (e) { console.error('cannot load monsters.json: ' + e.message); process.exit(2); }

// resolvable(mid): wave resolvable from data (1..6), else null.
function resolvable(mid) {
  const w = WAVE_OF[mid];
  return (w >= 1 && w <= 6) ? w : null;
}

// attributeEng(e): attribute one TB engagement record from the sweep JSON.
// Returns {attributed, reason} — reason is the taxonomy class or the
// unexplained cause. PURE (unit-testable).
function attributeEng(e) {
  if (!e || !e.mid) return { attributed: false, reason: 'no-mid' };
  const w = resolvable(e.mid);
  if (w == null) return { attributed: false, reason: 'unresolvable-wave' };
  if ((e.wave | 0) !== 0 && (e.wave | 0) !== w) return { attributed: false, reason: 'wave-mismatch' };
  if (!e.started) return { attributed: true, reason: 'aborted' }; // TB-REFUSED class
  if (!e.fightIdPresent && !e.killJoin)
    return { attributed: false, reason: 'no-fight-id-and-no-kill-match' };
  if (e.fightIdPresent && e.killJoin) return { attributed: true, reason: 'kill-join' };
  if (e.fightIdPresent && e.outcome != null) return { attributed: true, reason: 'outcome-join' };
  if (e.fightIdPresent) return { attributed: true, reason: 'unrecorded' }; // fight-id captured, nothing resolved
  return { attributed: true, reason: 'kill-match' }; // day+mid fallback
}

// attributeFF(f): attribute one fieldFight record. PURE.
function attributeFF(f) {
  if (!f || !f.mid) return { attributed: false, reason: 'no-mid' };
  const w = resolvable(f.mid);
  if (w == null) return { attributed: false, reason: 'unresolvable-wave' };
  if ((f.wave | 0) !== 0 && (f.wave | 0) !== w) return { attributed: false, reason: 'wave-mismatch' };
  if (!f.outcome || f.outcome === 'unresolved') return { attributed: false, reason: 'unresolved-outcome' };
  return { attributed: true, reason: 'outcome:' + f.outcome };
}

// attributeKill(k): attribute one wave-4+ kill record. PURE.
function attributeKill(k) {
  if (!k || (k.d == null && k.day == null)) return { attributed: false, reason: 'no-day' };
  if (!k.mid) return { attributed: false, reason: 'no-mid' };
  const w = resolvable(k.mid);
  if (w == null) return { attributed: false, reason: 'unresolvable-wave' };
  if ((k.wave | 0) !== 0 && (k.wave | 0) !== w) return { attributed: false, reason: 'wave-mismatch' };
  if (!k.by) return { attributed: false, reason: 'no-killer' };
  if (k.via == null || k.via === '') return { attributed: false, reason: 'no-via' };
  return { attributed: true, reason: 'via:' + k.via };
}

// analyzeRun(j): full per-run attribution + secondary reads. j = parsed
// per-seed JSON from the sweep.
function analyzeRun(j) {
  const out = {
    seed: j.seed, policyId: j.policyId,
    instrumentErrors: (j.instrumentErrors || []).length,
    unlockDay4: null, unlockDay5: null, unlocked5: false,
    w4eng: null, w5eng: null, w4ff: null, w5ff: null, w5kills: null,
    w5fought: null, windowDeaths: [], windowSurvivalDays: null,
    deathsByMechanism: j.deaths || {},
    // #760: win-track fields carried through.
    won: j.won || 0, winTrack: j.winTrack || null, seat: j.seat || null,
    rankAtEnd: j.rankAtEnd || 'unknown', maxRank: j.maxRank || 'village',
    everNational: j.everNational || 0,
    national: j.national || 0, table: j.table || 0,
    gameDays: j.gameDays || 0, endReason: j.endReason || 'unknown',
  };
  // Unlock days from the window trace (first day uw >= 4 / >= 5).
  try {
    for (const w of (j.window || [])) {
      if (out.unlockDay4 == null && (w.uw | 0) >= 4) out.unlockDay4 = w.day;
      if (out.unlockDay5 == null && (w.uw | 0) >= 5) out.unlockDay5 = w.day;
    }
  } catch (e) {}
  if (out.unlockDay5 == null && (j.maxWave | 0) >= 5) out.unlockDay5 = j.gameDays; // fallback
  out.unlocked5 = out.unlockDay5 != null;

  const census = (arr, label) => {
    const res = { n: arr.length, attributed: 0, unexplained: 0, unexplainedList: [], byReason: {} };
    for (const x of arr) {
      const a = label === 'eng' ? attributeEng(x) : label === 'ff' ? attributeFF(x) : attributeKill(x);
      res.byReason[a.reason] = (res.byReason[a.reason] || 0) + 1;
      if (a.attributed) res.attributed++;
      else { res.unexplained++; res.unexplainedList.push({ d: x.d != null ? x.d : x.day, mid: x.mid, reason: a.reason }); }
    }
    res.pct = res.n ? (100 * res.attributed / res.n).toFixed(1) + '%' : 'n/a';
    return res;
  };
  const eng4 = (j.engagements || []).filter(e => (e.wave | 0) >= 4 || (resolvable(e.mid) || 0) >= 4);
  const eng5 = (j.engagements || []).filter(e => (e.wave | 0) === 5 || resolvable(e.mid) === 5);
  out.w4eng = census(eng4, 'eng');
  out.w5eng = census(eng5, 'eng');
  const ff4 = (j.fieldFights || []).filter(f => (f.wave | 0) >= 4);
  const ff5 = (j.fieldFights || []).filter(f => (f.wave | 0) === 5);
  out.w4ff = census(ff4, 'ff');
  out.w5ff = census(ff5, 'ff');
  const k5 = (j.kills || []).filter(k => (k.wave | 0) === 5 || resolvable(k.mid) === 5);
  out.w5kills = census(k5, 'kill');

  // SECONDARY (report, don't judge): was wave-5 actually fought?
  const byWhom = { scholar: 0, villager: 0, unknown: 0 };
  const outcomes = {};
  let fights = 0;
  for (const e of eng5) {
    fights++;
    const whom = e.killerIsScholar ? 'scholar' : (e.killJoin ? 'villager' : 'unknown');
    byWhom[whom]++;
    const o = e.outcome || 'unrecorded';
    outcomes[o] = (outcomes[o] || 0) + 1;
  }
  for (const f of ff5) {
    fights++;
    byWhom.villager++;
    const o = 'ff:' + f.outcome;
    outcomes[o] = (outcomes[o] || 0) + 1;
  }
  out.w5fought = { fights, byWhom, outcomes };

  // Post-unlock-window deaths + window survival.
  if (out.unlockDay5 != null) {
    for (const d of (j.deathList || [])) {
      if ((d.day | 0) >= out.unlockDay5) out.windowDeaths.push(d);
    }
    out.windowSurvivalDays = (j.gameDays | 0) - (out.unlockDay5 | 0);
  }
  return out;
}

// collectDirs(root): all phase leaf dirs containing per-seed JSONs.
function collectDirs(root) {
  const dirs = [];
  try {
    for (const sub of fs.readdirSync(root)) {
      const p = path.join(root, sub);
      if (!fs.statSync(p).isDirectory()) continue;
      // phase dir (contains policy subdirs) or policy dir (contains s*.json)
      let hasSeeds = false;
      for (const f of fs.readdirSync(p)) if (/^s\d+\.json$/.test(f)) { hasSeeds = true; break; }
      if (hasSeeds) { dirs.push(p); continue; }
      for (const pol of fs.readdirSync(p)) {
        const pp = path.join(p, pol);
        if (!fs.statSync(pp).isDirectory()) continue;
        let h2 = false;
        for (const f of fs.readdirSync(pp)) if (/^s\d+\.json$/.test(f)) { h2 = true; break; }
        if (h2) dirs.push(pp);
      }
    }
  } catch (e) {}
  return dirs;
}

if (require.main === module) {
  const runs = [];
  for (const dir of collectDirs(PERSEED)) {
    for (const f of fs.readdirSync(dir)) {
      if (!/^s\d+\.json$/.test(f)) continue;
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      runs.push(analyzeRun(j));
    }
  }
  // Dedupe: the same (policy, seed) may appear in several phase dirs (phase 3
  // is a deterministic EXTENSION of a phase-2 run, not a new run — one
  // trajectory). Keep the longest-horizon record per (policy, seed).
  const byKey = {};
  for (const r of runs) {
    const k = r.policyId + ':' + r.seed;
    if (!byKey[k] || (r.gameDays | 0) > (byKey[k].gameDays | 0)) byKey[k] = r;
  }
  const deduped = Object.values(byKey);
  const unlocking = deduped.filter(r => r.unlocked5);
  const summary = {
    runs: deduped.length, unlocking: unlocking.length,
    wall: {
      national: deduped.filter(r => r.national).length,
      table: deduped.filter(r => r.table).length,
      wins: deduped.filter(r => r.won).length,
      everNational: deduped.filter(r => r.everNational).length,
      w4: deduped.filter(r => r.unlockDay4 != null).length,
      w5: unlocking.length,
    },
    winTracks: deduped.filter(r => r.won).map(r => ({
      seed: r.seed, policy: r.policyId,
      path: r.winTrack && r.winTrack.path, branch: r.winTrack && r.winTrack.branch,
      seat: r.seat && r.seat.seat, rank: r.rankAtEnd, days: r.gameDays,
    })),
    perRun: deduped.map(r => ({
      seed: r.seed, policy: r.policyId, unlockDay5: r.unlockDay5,
      won: r.won, winPath: r.winTrack && r.winTrack.path, seat: r.seat && r.seat.seat,
      rankAtEnd: r.rankAtEnd, maxRank: r.maxRank, everNational: r.everNational,
      w4eng: { n: r.w4eng.n, attr: r.w4eng.attributed, ux: r.w4eng.unexplained },
      w5eng: { n: r.w5eng.n, attr: r.w5eng.attributed, ux: r.w5eng.unexplained },
      w4ff: { n: r.w4ff.n, attr: r.w4ff.attributed, ux: r.w4ff.unexplained },
      w5ff: { n: r.w5ff.n, attr: r.w5ff.attributed, ux: r.w5ff.unexplained },
      w5kills: { n: r.w5kills.n, attr: r.w5kills.attributed, ux: r.w5kills.unexplained },
      instrErr: r.instrumentErrors,
      w5fights: r.w5fought.fights, byWhom: r.w5fought.byWhom, outcomes: r.w5fought.outcomes,
      windowDeaths: r.windowDeaths.length, windowSurvivalDays: r.windowSurvivalDays,
      endReason: r.endReason, gameDays: r.gameDays,
    })),
    verdict: null,
  };
  if (unlocking.length < 2) {
    summary.verdict = { kind: 'insufficient-data', detail: `${unlocking.length}/${deduped.length} runs unlocked wave-5 (minimum 2) — report-only, no lever judged` };
  } else {
    let allAttr = true, totalUx = 0, totalErr = 0;
    for (const r of unlocking) {
      totalErr += r.instrumentErrors;
      for (const c of [r.w4eng, r.w5eng, r.w4ff, r.w5ff, r.w5kills]) {
        totalUx += c.unexplained;
        if (c.attributed !== c.n) allAttr = false;
      }
    }
    summary.verdict = {
      kind: (allAttr && totalUx === 0 && totalErr === 0) ? 'DIAG-GO' : 'NO-GO',
      unlocking: unlocking.length,
      allAttr100: allAttr, totalUnexplained: totalUx, totalInstrumentErrors: totalErr,
    };
  }
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 1) + '\n');
  console.log(JSON.stringify(summary, null, 1));
}

module.exports = { analyzeRun, attributeEng, attributeFF, attributeKill, resolvable };
