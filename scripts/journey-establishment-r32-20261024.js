#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R32 — THE PALISADE QUESTION (2026-10-24).
// Rotation index 1 (establishment). Base: master@eb2fb7e8e (includes r31 preserver fix).
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §14 — a miss is NO-GO, never re-scored mid-run).
//   Question (r31's metric review, verbatim direction): r31 made the village
//     WEALTHY (real preserved kcal, pantries 18-47k) and its A/B showed the
//     wealth channel firing a 5-raider max raid on seed 103 (13 combat deaths,
//     no palisade). Deepening r40 reached tier 2 at d27-41 on OTHER seeds.
//     On the establishment leg's own seeds, does the palisade rise in-window,
//     and what feeds wood/stone? The competent policy staffs wood ONLY when
//     the pile < 8 (hearth maintenance, competent.js) and NEVER staffs stone;
//     the tier-2 bar is food 14k + wood 350 + stone 60 (havenGrowth.js).
//   Interesting-finding bar: any tier-2 in-window; OR wood/stone trajectories
//     that explain the gap (maintenance equilibrium vs deepening's d27-41);
//     OR a non-assignment wood/stone source (player stash, cistern alts,
//     self-assignment) doing the real hauling.
//   Seeds: 61/82/103/124 (matched r15-r31). Horizon: 42d (+death-aware 10d
//     tail). Policy: competent PINNED, landed env defaults.
//   Binding metrics:
//     W1 (palisade reach): havenTier >= 2 by d42. GO if >=2/4 seeds; 1/4 =
//       METRIC-REVIEW; 0/4 = NO-GO (the gap, documented with trajectories).
//     W2a (wood staffing): >=1 wood-duty resolution on >=3/4 seeds; and the
//       share staffed at 1.4 wood competence (carpenter-family) reported.
//     W2b (stone staffing): >=1 stone-duty resolution on >=2/4 seeds = GO;
//       1/4 = METRIC-REVIEW; 0/4 = NO-GO (policy never staffs stone).
//     W2c (builder signal, census): living builder-skill >= 2 villagers at
//       day 35 reported per seed (SPECIALTIES.builder: carpenter 3,
//       construction worker 3, engineer 2, mechanic 1 — ghost audit is the
//       offline proof test, not this metric).
//     W3 (food guardrail, r27/r31 standing bar): zero leg-window (day>=15)
//       starvation/hunger/thirst deaths AND maxCrisisStreak < 3.
//     W4 (people): 8 held convos (2/seed: best builder + a wood/stone
//       worker), 0 senseless, 0 fabricated history, 0 null renders.
//   Observed, non-binding: havenStores trajectories + unexplained wood/stone
//     deltas (sources outside duty resolutions); tier-1 dates; raid counts;
//     builder-skill distribution; wood/stone assignment counts.
//   Guardrails: no softlock through d42 (+tail); wave-2 gate >= d8;
//     death-aware stop; pilot smoke.
// Usage: SEEDS=82 DAYS=42 node scripts/journey-establishment-r32-20261024.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103, 124]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const SNAP_DAYS = [15, 20, 25, 30, 35, 40, 42];

const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r32:' + key + ']', (e && e.message) || e);
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function packKcal(Game) {
  try {
    return (((Game.state.scholar || {}).inventory) || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function pantryUnitAtom(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((m, i) => Math.max(m, (i.kcalEach || 0)), 0);
  } catch (e) { return 0; }
}
function livingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) { warnOnce('livingVids', e); }
      return true;
    });
  } catch (e) { return []; }
}
function nameOf(Game, id) {
  try { return id === 'player' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function teleStream(Game) {
  try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; }
}
function specSkillOf(Game, vid, task) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    return (Game.specialistSkill ? Game.specialistSkill(p || {}, task) : 0) || 0;
  } catch (e) { return 0; }
}
function competenceOf(Game, vid, task) {
  try { return (Game.villagerCompetence ? Game.villagerCompetence(vid, task) : 1.0) || 1.0; }
  catch (e) { return 1.0; }
}
function occOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : {}; return p.occupation || p.formerOccupation || '?'; } catch (e) { return '?'; }
}
// havenStores, with a manual fallback (v.wood + stash materials).
function storesOf(Game) {
  try {
    if (Game.havenStores) { const s = Game.havenStores(); return { food: s.food, wood: s.wood, stone: s.stone, preserved: s.preserved }; }
  } catch (e) { warnOnce('havenStores', e); }
  try {
    const v = Game.state.village || {};
    let wood = v.wood || 0, stone = 0;
    const st = Game.stashState ? Game.stashState() : null;
    const mats = st && st.materials ? st.materials : null;
    if (mats) { wood += (mats.wood || 0); stone += (mats.stone || 0); }
    return { food: Math.round(pantryKcal(Game)), wood: Math.round(wood), stone: Math.round(stone), preserved: 0 };
  } catch (e) { return { food: 0, wood: 0, stone: 0, preserved: 0 }; }
}
function tierOf(Game) {
  try { return Game.havenTier ? Game.havenTier() : ((Game.state.village || {}).havenTier || 0); } catch (e) { return 0; }
}
function census(Game) {
  const out = [];
  for (const id of livingVids(Game)) {
    out.push({ id: String(id), name: nameOf(Game, id), occ: occOf(Game, id),
      builder: specSkillOf(Game, id, 'builder'), woodComp: competenceOf(Game, id, 'wood'),
      stoneComp: competenceOf(Game, id, 'stone') });
  }
  return out;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('policy.setup', e); } }

  const dayLines = {};
  const assignments = [];
  const woodEvents = [];   // duty resolutions
  const stoneEvents = [];
  const tierUps = [];
  const contests = [];
  const snaps = [];
  let pilotDay = null;
  const waveDay = {};
  let prevStores = null;
  let dayWoodDelta = 0, dayStoneDelta = 0; // resolution deltas within the current day

  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }
  const _assignTask = Game.assignTask ? Game.assignTask.bind(Game) : null;
  if (_assignTask) {
    Game.assignTask = function (vid, task, opts) {
      const r = _assignTask(vid, task, opts);
      try {
        if (task === 'wood' || task === 'stone')
          assignments.push({ day: nowDay(Game), vid: String(vid), name: nameOf(Game, vid),
            occ: occOf(Game, vid), task, comp: competenceOf(Game, vid, task),
            builder: specSkillOf(Game, vid, 'builder'), ok: !!(r && (r.ok !== false)) });
      } catch (e) { warnOnce('assignTask', e); }
      return r;
    };
  }
  const _resolve = Game.resolveOneAssignment ? Game.resolveOneAssignment.bind(Game) : null;
  if (_resolve) {
    Game.resolveOneAssignment = function (vid, a) {
      const d = nowDay(Game);
      const task = (a && a.task) || '?';
      let pre = null;
      if (task === 'wood' || task === 'stone') { try { pre = storesOf(Game); } catch (e) { warnOnce('preStores', e); } }
      const r = _resolve(vid, a);
      try {
        if ((task === 'wood' || task === 'stone') && pre) {
          const post = storesOf(Game);
          const ev = { day: d, vid: String(vid), name: nameOf(Game, vid), occ: occOf(Game, vid),
            task, comp: competenceOf(Game, vid, task), builder: specSkillOf(Game, vid, 'builder'),
            dWood: post.wood - pre.wood, dStone: post.stone - pre.stone };
          if (task === 'wood') { woodEvents.push(ev); dayWoodDelta += ev.dWood; }
          else { stoneEvents.push(ev); dayStoneDelta += ev.dStone; }
        }
      } catch (e) { warnOnce('resolveOneAssignment', e); }
      return r;
    };
  }
  const _tierUp = Game.havenTierUp ? Game.havenTierUp.bind(Game) : null;
  if (_tierUp) {
    Game.havenTierUp = function (...a) {
      const before = tierOf(Game);
      const r = _tierUp(...a);
      try { tierUps.push({ day: nowDay(Game), from: before, to: tierOf(Game), stores: storesOf(Game) }); }
      catch (e) { warnOnce('tierUp', e); }
      return r;
    };
  }
  const _fireContest = Game.fireContest ? Game.fireContest.bind(Game) : null;
  if (_fireContest) {
    Game.fireContest = function (contest) {
      const wasPilotAired = !!Game.state.pilotAired;
      const r = _fireContest(contest);
      try { if (!wasPilotAired && Game.state.pilotAired) pilotDay = nowDay(Game); }
      catch (e) { warnOnce('fireContest', e); }
      return r;
    };
  }
  const _tele0 = Game.tele;
  Game.tele = function (type, data) {
    const r = _tele0.apply(this, arguments);
    try { if (type === 'contest_end') contests.push({ day: nowDay(Game), cid: (data && data.id) || '?', outcome: (data && data.outcome) || '?' }); }
    catch (e) { warnOnce('tele.contest_end', e); }
    return r;
  };

  const censusStart = census(Game);
  let foodTrace = [];
  let crisisStreak = 0, maxCrisisStreak = 0;
  let builderSnap = null;

  for (let d = 1; d <= DAYS; d++) {
    dayWoodDelta = 0; dayStoneDelta = 0;
    const dayStartStores = storesOf(Game);
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('doAction', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    // Daily stores accounting: total delta minus duty-resolution deltas =
    // unexplained (hearth burn, player stash/donate, cistern alts, other).
    try {
      const gd = nowDay(Game);
      const end = storesOf(Game);
      const unexplWood = (end.wood - dayStartStores.wood) - dayWoodDelta;
      const unexplStone = (end.stone - dayStartStores.stone) - dayStoneDelta;
      if (SNAP_DAYS.indexOf(gd) >= 0) {
        let meter = null;
        try { meter = Game.havenGrowthMeter ? Game.havenGrowthMeter() : null; } catch (e) { warnOnce('meter', e); }
        snaps.push({ day: gd, tier: tierOf(Game), stores: end, meterNext: meter ? meter.next : null,
          unexplWood, unexplStone, woodEventsToDate: woodEvents.length, stoneEventsToDate: stoneEvents.length });
      }
      if (gd >= 35 && builderSnap === null) builderSnap = { day: gd, rows: census(Game).filter(r => r.builder >= 1) };
    } catch (e) { warnOnce('snap', e); }
    try {
      const w = Game.unlockedWave ? Game.unlockedWave() : 1;
      const gd = nowDay(Game);
      if (waveDay[w] == null) waveDay[w] = gd;
    } catch (e) { warnOnce('waveDay', e); }
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
    try {
      let hs = 0;
      try { hs = (Game.progState ? Game.progState() : {}).hungryStreak || 0; } catch (e2) { warnOnce('hungryStreak', e2); }
      const p = Math.round(pantryKcal(Game)), pk = Math.round(packKcal(Game));
      foodTrace.push({ day: nowDay(Game), pantryKcal: p, packKcal: pk, atom: pantryUnitAtom(Game), alive: liv, hungryStreak: hs });
      const crisis = hs >= 3 && (p + pk) < liv * 2000;
      crisisStreak = crisis ? crisisStreak + 1 : 0;
      if (crisisStreak > maxCrisisStreak) maxCrisisStreak = crisisStreak;
    } catch (e) { warnOnce('foodTrace', e); }
    prevStores = storesOf(Game);
  }

  const tele = teleStream(Game);
  const deaths = [];
  for (const t of tele) {
    if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  }
  const censusEnd = census(Game);
  const finalTier = tierOf(Game);
  const finalStores = storesOf(Game);

  const w1 = { tier: finalTier, tierUps: tierUps.length,
    verdict: finalTier >= 2 ? 'GO' : 'NO-GO' };
  const wood14 = woodEvents.filter(e => e.comp >= 1.4);
  const w2a = { woodEvents: woodEvents.length, wood14: wood14.length,
    woodTotal: woodEvents.reduce((a, e) => a + e.dWood, 0),
    verdict: woodEvents.length > 0 ? 'GO' : 'NO-GO' };
  const w2b = { stoneEvents: stoneEvents.length,
    stoneTotal: stoneEvents.reduce((a, e) => a + e.dStone, 0),
    verdict: stoneEvents.length > 0 ? 'GO' : 'NO-GO' };
  const w2c = { builderRows: (builderSnap && builderSnap.rows) || [],
    verdict: 'REPORT' };
  const starvation = deaths.filter(t => t.day >= 15 && /starvat|hunger|thirst/.test(String(t.cause || '')));
  const w3 = { starvationDeaths: starvation.length, maxCrisisStreak,
    verdict: (starvation.length === 0 && maxCrisisStreak < 3) ? 'GO' : 'NO-GO' };
  const mG = { reachedDay: nowDay(Game), over: !!Game.over,
    pantryUnitAtom: pantryUnitAtom(Game), waveUnlockDays: waveDay,
    wave2GateOk: (waveDay[2] == null) || waveDay[2] >= 8,
    popAlive: livingVids(Game).length, pantryEnd: Math.round(pantryKcal(Game)),
    deaths: deaths.length, contestsFired: contests.length, pilotDay,
    finalStores, tierUps };

  // ---- W4: people — 2 held convos per seed (best builder + a wood/stone worker) ----
  const convoPath = EVID + `/journey-establishment-r32-convo-seed${seed}.txt`;
  const convoLines = [];
  const bestBuilder = censusEnd.filter(r => r.builder >= 1).sort((a, b) => b.builder - a.builder)[0];
  const workerEv = woodEvents.concat(stoneEvents);
  const workerVid = workerEv.length ? workerEv[workerEv.length - 1].vid : null;
  const convoTargets = [];
  if (bestBuilder) convoTargets.push({ vid: bestBuilder.id, why: 'best-builder' });
  if (workerVid && !convoTargets.some(t => t.vid === workerVid)) convoTargets.push({ vid: workerVid, why: 'wood/stone-worker' });
  for (const vid of livingVids(Game)) {
    if (convoTargets.length >= 2) break;
    if (convoTargets.some(t => String(t.vid) === String(vid))) continue;
    convoTargets.push({ vid, why: 'fellow-villager' });
  }
  const STRUCT = { leave: 1, bye: 1, goon: 1, 'menu:more': 1, deflect_q: 1, honest_pass: 1, silence: 1 };
  for (const t of convoTargets.slice(0, 2)) {
    const vid = t.vid;
    const nm = nameOf(Game, vid);
    const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
    convoLines.push(`\n-- ${nm} (${String(vid).slice(0, 8)}) occ=${p.occupation || p.formerOccupation || '?'} role=${t.why} builder=${specSkillOf(Game, vid, 'builder')} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      const seen = {};
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) break;
        const fresh = (id) => choices.find(ch => ch.id === id) && !seen[id];
        let pick = null;
        if (fresh('ask:personal')) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => !STRUCT[ch.id] && !seen[ch.id] && ch.id !== 'leave' && ch.id !== 'bye')
          || null;
        if (!pick) break;
        seen[pick.id] = 1;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        if (r.line == null && r.ended) convoLines.push('THEM: (quiet close — no line, ended)');
        else convoLines.push(`THEM: ${r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { convoLines.push('ERROR: ' + e.message); }
  }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) { warnOnce('convoWrite', e); }
  const nullConvoLines = convoLines.filter((l, i) => {
    if (!/^THEM: (null|undefined)\s*$/.test(l) && !/^(OPENING|closing): (null|undefined)$/.test(l)) return false;
    const nxt = convoLines[i + 1] || '';
    return nxt.indexOf('(quiet close') !== 0;
  });
  const errorConvoLines = convoLines.filter(l => /^ERROR: /.test(l));
  const w4 = { convos: convoTargets.length, nullLineCount: nullConvoLines.length,
    errorLineCount: errorConvoLines.length,
    verdict: (nullConvoLines.length === 0 && errorConvoLines.length === 0) ? 'GO' : 'NO-GO' };

  const wk = (() => { try { return (Game.state.waveKills || {}); } catch (e) { return {}; } })();
  const killTotal = Object.values(wk).reduce((a, b) => a + (b || 0), 0);
  const metrics = {
    contestFinal: { held: contests.length },
    codexKillSummary: { waveKills: wk, total: killTotal },
    pilotAired: pilotDay,
    deaths: deaths.length,
    popAlive: livingVids(Game).length,
    pantryKcal: Math.round(pantryKcal(Game)),
  };

  const out = { seed, run: 'r32', reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    metrics, w1, w2a, w2b, w2c, w3, w4,
    guardrails: mG,
    censusStart, censusEnd, builderSnap,
    snaps,
    woodAssignments: assignments.filter(a => a.task === 'wood').length,
    stoneAssignments: assignments.filter(a => a.task === 'stone').length,
    assignments: assignments.slice(0, 80),
    woodEvents: woodEvents.slice(0, 60), stoneEvents: stoneEvents.slice(0, 60),
    tierUps, deaths, convoPath, ctxNotes: ctx.notes.slice(0, 10) };
  const outPath = EVID + `/journey-establishment-r32-seed${seed}.json`;
  try { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('outWrite', e); }
  return { seed, outPath, w1, w2a, w2b, w2c, w3, w4, guardrails: mG };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`--- r32 seed=${seed} ---`);
    const r = await runSeed(seed);
    results.push(r);
    console.log(JSON.stringify({ seed, w1: r.w1, w2a: r.w2a, w2b: r.w2b, w2c: r.w2c, w3: r.w3, w4: r.w4,
      guardrails: r.guardrails }, null, 1));
    console.log('analysis: per-seed JSON + convos written; compose the r32 note by hand');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
