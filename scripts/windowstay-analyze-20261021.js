#!/usr/bin/env node
// windowstay-analyze-20261021.js — post-unlock-window survival census analyzer
// (flesh-out loop arm sim-windowstay-r2, run fleshout-20261021T1215Z, axis
// scale-onramp). PURE: no harness, no Game — works from the sweep's
// per-seed JSONs + src/data/monsters.json (wave/name resolution from data).
//
// ATTRIBUTION DEFINITIONS (the r2 pre-registration, binding):
//   attributed engagement (wave>=4) = known mid + resolvable wave (from data)
//     + taxonomy shape + (captured fight-id joined to a kill record OR to a
//     tbOutcome OR explicit unresolved reason: fled/aborted/unrecorded).
//     (Reused verbatim from windowreach-analyze-20261021.js.)
//   attributed window death (villager/scholar, person-kind) = known who +
//     known cause + named taxonomy channel (the windowsurvive channel set,
//     identical-by-construction) + for combat/monster channels a resolved
//     killer wave (tele wave | field-fight vDie join | monster-name lookup
//     | fight-start join). unexplained = no-who | no-cause |
//     cause-unmapped | combat-channel death with no resolvable killer wave.
//     Phantom teles (real=false) are excluded from the census, counted.
//   attributed wave-5 kill = day + mid + resolvable wave + killer + via.
//   unexplained = unresolvable wave OR engagement without fight-id AND
//     without day+mid fallback kill match.
//   instrumentErrors = any entry in the instrument's error sink.
// GO: every unlocking run 100% attributed (deaths + engagements), 0
// unexplained, 0 instrumentErrors.
// Minimum: >=2 unlocking runs; below 2 = insufficient-data, report-only.
//
// The killer-wave join order for a combat death: (1) the death tele's own
// `wave` (corpses.js stamps it when opts.monsterId is set); (2) the same
// day+vid field fight with outcome vDie (killdisc fieldFights, all waves —
// villager blow-by-blow deaths); (3) monster-name cause lookup in
// data.monsters; (4) the latest fight-start (combat_start tele / patrol /
// wild / aidFight router wraps) with day <= death day. (1)-(3) are certain;
// (4) is the windowsurvive fallback, honest about its looseness.
//
// Usage:
//   node scripts/windowstay-analyze-20261021.js [perseedDir] [outJson]
//   (defaults: evidence/2026-10-21/perseed-windowstay-r2, prints summary to
//   stdout and writes windowstay-r2-attribution.json into perseedDir.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const PERSEED = process.argv[2] || path.join(REPO, 'evidence', '2026-10-21', 'perseed-windowstay-r2');
const OUT = process.argv[3] || path.join(PERSEED, 'windowstay-r2-attribution.json');

const WR_A = require('./windowreach-analyze-20261021');
const { attributeEng, attributeFF, attributeKill, resolvable } = WR_A;

let WAVE_OF = {}, NAME2ID = {};
try {
  const defs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of defs) {
    if (!m || !m.id) continue;
    if ((m.wave | 0) >= 1) WAVE_OF[m.id] = m.wave | 0;
    if (m.name) NAME2ID[String(m.name).toLowerCase()] = m.id;
    NAME2ID[String(m.id).toLowerCase()] = m.id;
    NAME2ID[String(m.id).toLowerCase().replace(/_/g, ' ')] = m.id;
  }
} catch (e) { console.error('cannot load monsters.json: ' + e.message); process.exit(2); }

// ---------------------------------------------------------------------------
// DEATH-CHANNEL TAXONOMY — copied VERBATIM from
// scripts/probe-windowsurvive-20261019.js (identical-by-construction, so
// channel shares compare with the windowsurvive DIAG taxonomy).
const DISEASE_IDS = new Set(['gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever', 'trembles',
  'howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind',
  'eurika', 'east_nile', 'lemons']);
const DISEASE_RES = [/^sickness$/i, /food poisoning|bad belly|spoiled gut|poisoned/i,
  /^(wound fever|gut rot|tick fever)$/i];

function classifyDeath(causeRaw, ctx, monsterNames) {
  const cause = String(causeRaw == null ? 'unknown' : causeRaw);
  const lc = cause.toLowerCase();
  ctx = ctx || {};
  monsterNames = monsterNames || new Set();
  if (cause === 'raid' || cause === 'raid-defense') return ['raid', 'cause'];
  if (cause === 'expedition') return ['expedition', 'cause'];
  if (monsterNames.has(lc)) return ['expedition', 'monster-name=expedDeath'];
  if (cause === 'aid-runner' || cause === 'sortie combat' || cause.startsWith('split-fight:')) {
    return ['expedition', 'cause'];
  }
  if (ctx.onExped && (cause === 'monster' || cause === 'combat' || cause === 'injuries')) {
    return ['expedition', 'ctx:on-expedition'];
  }
  if (cause === 'the wild') return ['wild', 'cause'];
  if (cause === 'patrol combat') return ['patrol', 'cause'];
  if (cause === 'hunting') return ['wild', 'cause'];
  if (cause === 'alien' || cause === 'alien_beam') return ['alien', 'cause'];
  if (DISEASE_IDS.has(lc) || DISEASE_RES.some(re => re.test(cause))) return ['disease', 'cause'];
  if (cause === 'starvation' || cause === 'thirst') return ['haven', 'cause'];
  if (cause === 'injuries' || cause === "a wound that wouldn't close") return ['haven', 'cause'];
  if (cause === 'monster' || cause === 'combat') {
    if (ctx.aid) return ['raid', 'ctx:aid-crisis'];
    if (ctx.router === 'patrol') return ['patrol', 'ctx:router'];
    if (ctx.router === 'wild') return ['wild', 'ctx:router'];
    if (cause === 'combat' && ctx.atHaven) return ['raid', 'ctx:scholar-fight-at-haven'];
    if (cause === 'combat') return ['wild', 'ctx:scholar-fight-in-wild'];
    return ['other', 'ctx:unresolved-monster'];
  }
  return ['other', 'cause-unmapped'];
}

function isPersonDeath(t) {
  return !!(t.player || t.kind === 'person' || t.kind === 'villager' || t.kind === 'scholar' || t.kind == null);
}

const COMBAT_CHANNELS = new Set(['raid', 'expedition', 'wild', 'patrol']);

// attributeDeath(rec, j): attribute one window death record. PURE
// (unit-testable). j = the per-seed JSON (fieldFightsAll, fightStarts).
// Scholar/villager split uses playerRepaired (the harness's lazy-repaired
// player flag) when present — see the sweep's cross-check note.
function attributeDeath(rec, j) {
  if (!rec) return { attributed: false, reason: 'no-rec' };
  const playerFlag = (rec.playerRepaired != null) ? !!rec.playerRepaired : !!rec.player;
  if (!isPersonDeath(rec) && !playerFlag) return { attributed: true, reason: 'non-person-excluded' };
  if (rec.real === false) return { attributed: true, reason: 'phantom-excluded' };
  if (rec.who == null || rec.who === '?' || rec.who === 'unknown')
    return { attributed: false, reason: 'no-who' };
  if (!rec.cause || rec.cause === 'unknown')
    return { attributed: false, reason: 'no-cause' };
  const monsterNames = new Set(Object.keys(NAME2ID));
  const [channel, basis] = classifyDeath(rec.cause, rec.ctx, monsterNames);
  if (channel === 'other' && (basis === 'cause-unmapped' || basis === 'ctx:unresolved-monster'))
    return { attributed: false, reason: basis, channel, basis, scholar: playerFlag };
  let killerWave = (rec.wave != null) ? (rec.wave | 0) : null;
  let killerMid = null, joinVia = killerWave != null ? 'tele.wave' : null;
  if (COMBAT_CHANNELS.has(channel) && killerWave == null) {
    // (2) same day+vid field fight with outcome vDie.
    for (const ff of (j.fieldFightsAll || [])) {
      if (ff.outcome === 'vDie' && String(ff.vid) === String(rec.who) && (ff.d | 0) === (rec.day | 0)) {
        killerWave = (ff.wave | 0) || null; killerMid = ff.mid || null; joinVia = 'fieldfight-vDie';
        break;
      }
    }
  }
  if (COMBAT_CHANNELS.has(channel) && killerWave == null) {
    // (3) monster-name cause lookup.
    const mid = NAME2ID[String(rec.cause).toLowerCase()] || null;
    if (mid && WAVE_OF[mid]) { killerMid = mid; killerWave = WAVE_OF[mid]; joinVia = 'monster-name'; }
  }
  if (COMBAT_CHANNELS.has(channel) && killerWave == null) {
    // (4) latest fight-start with day <= death day (windowsurvive fallback).
    let best = null;
    for (const fss of (j.fightStarts || [])) {
      if ((fss.day | 0) <= (rec.day | 0) && (best == null || (fss.day | 0) >= (best.day | 0))) best = fss;
    }
    if (best && best.wave != null) { killerWave = best.wave | 0; killerMid = best.mid; joinVia = 'fightstart:' + best.via; }
  }
  if (COMBAT_CHANNELS.has(channel) && killerWave == null)
    return { attributed: false, reason: 'unjoined-no-killer-wave', channel, basis, scholar: playerFlag };
  return {
    attributed: true, channel, basis, killerWave, killerMid, joinVia,
    scholar: playerFlag,
    reason: channel + ':' + basis + (joinVia ? ' wave=' + killerWave + ' via ' + joinVia : ''),
  };
}

// analyzeRun(j): full per-run attribution + secondary reads.
function analyzeRun(j) {
  const out = {
    seed: j.seed, policyId: j.policyId,
    instrumentErrors: (j.instrumentErrors || []).length,
    unlockDay4: j.w4Day != null ? j.w4Day : null,
    unlockDay5: j.w5Day != null ? j.w5Day : null,
    unlocked5: j.w5Day != null,
    winDay: j.winDay != null ? j.winDay : null,
    winPath: j.winPath || null, winResumed: !!j.winResumed, postWinDays: j.postWinDays | 0,
    w4eng: null, w5eng: null, w4ff: null, w5ff: null, w5kills: null,
    w5fought: null, windowDeaths: null, windowSurvivalDays: null,
    national: j.national | 0, table: j.table | 0, won: j.won | 0,
    endReason: j.endReason || null, gameDays: j.gameDays | 0,
  };
  const census = (arr, label) => {
    const res = { n: arr.length, attributed: 0, unexplained: 0, unexplainedList: [], byReason: {} };
    for (const x of arr) {
      const a = label === 'eng' ? attributeEng(x) : label === 'ff' ? attributeFF(x)
        : label === 'kill' ? attributeKill(x) : attributeDeath(x, j);
      res.byReason[a.reason] = (res.byReason[a.reason] || 0) + 1;
      if (a.attributed) res.attributed++;
      else { res.unexplained++; res.unexplainedList.push(Object.assign({ d: x.d != null ? x.d : x.day, mid: x.mid, who: x.who }, { reason: a.reason })); }
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

  // SECONDARY: was wave-5 actually FOUGHT?
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

  // PRIMARY (a): post-unlock-window deaths.
  if (out.unlockDay5 != null) {
    const wrecs = (j.deathRecs || []).filter(d => (d.day | 0) >= out.unlockDay5);
    out.windowDeaths = census(wrecs, 'death');
    out.windowDeaths.byChannel = {};
    out.windowDeaths.scholar = 0; out.windowDeaths.villager = 0;
    out.windowDeaths.phantoms = 0;
    for (const d of wrecs) {
      const a = attributeDeath(d, j);
      if (a.reason === 'phantom-excluded') { out.windowDeaths.phantoms++; continue; }
      if (!a.attributed) continue;
      out.windowDeaths.byChannel[a.channel] = (out.windowDeaths.byChannel[a.channel] || 0) + 1;
      if (a.scholar) out.windowDeaths.scholar++; else out.windowDeaths.villager++;
      if (a.killerWave != null) {
        const k = 'w' + a.killerWave;
        out.windowDeaths['killer' + k] = (out.windowDeaths['killer' + k] || 0) + 1;
      }
    }
    out.windowSurvivalDays = (j.gameDays | 0) - (out.unlockDay5 | 0);
  }
  return out;
}

if (require.main === module) {
  const runs = [];
  for (const policyId of fs.readdirSync(PERSEED)) {
    const dir = path.join(PERSEED, policyId);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/^s\d+\.json$/.test(f)) continue;
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      runs.push(analyzeRun(j));
    }
  }
  const unlocking = runs.filter(r => r.unlocked5);
  const summary = {
    runs: runs.length, unlocking: unlocking.length,
    perRun: runs.map(r => ({
      seed: r.seed, policy: r.policyId, unlockDay5: r.unlockDay5,
      winDay: r.winDay, winPath: r.winPath, winResumed: r.winResumed, postWinDays: r.postWinDays,
      deaths: r.windowDeaths ? { n: r.windowDeaths.n, attr: r.windowDeaths.attributed, ux: r.windowDeaths.unexplained, channels: r.windowDeaths.byChannel, scholar: r.windowDeaths.scholar, villager: r.windowDeaths.villager, phantoms: r.windowDeaths.phantoms } : null,
      w5eng: { n: r.w5eng.n, attr: r.w5eng.attributed, ux: r.w5eng.unexplained },
      w5ff: { n: r.w5ff.n, attr: r.w5ff.attributed, ux: r.w5ff.unexplained },
      w5kills: { n: r.w5kills.n, attr: r.w5kills.attributed, ux: r.w5kills.unexplained },
      instrErr: r.instrumentErrors,
      w5fights: r.w5fought.fights, byWhom: r.w5fought.byWhom, outcomes: r.w5fought.outcomes,
      windowSurvivalDays: r.windowSurvivalDays,
      wall: { national: r.national, table: r.table, won: r.won, endReason: r.endReason, gameDays: r.gameDays },
    })),
    verdict: null,
  };
  if (unlocking.length < 2) {
    summary.verdict = { kind: 'insufficient-data', detail: `${unlocking.length}/${runs.length} runs unlocked wave-5 (minimum 2) — report-only, no lever judged` };
  } else {
    let allAttr = true, totalUx = 0, totalErr = 0;
    for (const r of unlocking) {
      totalErr += r.instrumentErrors;
      for (const c of [r.windowDeaths, r.w4eng, r.w5eng, r.w4ff, r.w5ff, r.w5kills]) {
        if (!c) continue;
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

module.exports = { analyzeRun, attributeDeath, classifyDeath, isPersonDeath, COMBAT_CHANNELS };
