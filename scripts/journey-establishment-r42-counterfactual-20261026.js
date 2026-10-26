#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R42 — PANEL ON THE NEW BASE +
// INTERVENTION-WINDOW AUDIT (2026-10-26).
// Rotation index 1 (establishment; this run plays it and verifies the
// 1->2 write at landing). Base: master@63c116421 (landing r55 + r41's own
// landing + fishfallback/scale-r38/endgame-r53 landings since r41's base).
// No game change pre-planned: r41 driver + the same read-only daily food
// ledger (pantry/pack/alive/hungryStreak + per-day telemetry event-type
// counts, observation only — no game state is mutated by the ledger, so
// panel RNG is identical to r41's driver). New vs r41: (a) the panel is
// read fresh on the moved base; (b) the W audit asks, for every seed
// that enters a sustained under-eating streak (hs>=3), whether ANY
// game system intervened inside the streak window (arrival, contest
// prize, tier-up, forage surge) and whether the streak broke before a
// starvation death. The counterfactual prize arm (239 + 20k kcal at
// dawn d22) runs as a SEPARATE script/file and never feeds panel
// metrics. C3 on 239 has now failed 6 straight runs; r42-counterfactual tests
// whether the game ever intervenes in the window, instead of
// re-running 239 passively a seventh time.
//
// PRE-REGISTRATION: see hidden_files/evidence/2026-10-26/journey-establishment-r42-counterfactual-prereg.md
// (written BEFORE the full run, AFTER the seed-209 pilot; matched panel
// 209/228/238/239 full mode + LIGHT scan band, C1/C2 table re-verification,
// C3 food bar, C4 with prefix party-pick carve-out, exact-match hunter
// arrival hunt, minAlive + roster-length arrival logging).
// Usage: SEEDS=209 DAYS=42 node scripts/journey-establishment-r42-counterfactual-20261026.js
// Usage (LIGHT scan, convos skipped): LIGHT=1 SEEDS=240,241 DAYS=42 node scripts/journey-establishment-r42-counterfactual-20261026.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-26';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const LIGHT = process.env.LIGHT === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [209, 228, 238, 239]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const TASKS = ['butcher', 'cook', 'spotter', 'builder', 'preserver'];
// Pristine tables (pre-r35, hardcoded) for the C1/C2 counterfactual re-score.
const OLD = {
  butcher: [['hunter', 3], ['line cook / hunter', 3], ['veterinary tech', 3], ['veterinarian', 3], ['fisherman', 2], ['chef', 2], ['sushi chef', 2], ['farmer', 2], ['park ranger', 2], ['butcher', 3]],
  cook: [['chef', 3], ['sushi chef', 3], ['line cook / hunter', 2], ['cafeteria manager', 2], ['cook', 2], ['baker', 2]],
  spotter: [['botanist', 3], ['gardener', 2], ['farmer', 2], ['hiker', 2], ['park ranger', 2], ['herbalist', 3]],
  builder: [['carpenter', 3], ['construction worker', 3], ['engineer', 2], ['mechanic', 1]],
  preserver: [['fisherman', 3], ['fishing guide', 2], ['hunting guide', 2], ['sailor', 2], ['chef', 2], ['line cook', 2], ['butcher', 2], ['farmer', 2], ['rancher', 2], ['beekeeper', 1], ['mushroom grower', 1]],
};
function oldSkill(occ, task) {
  const o = String(occ || '').toLowerCase();
  let s = 0;
  for (const [m, v] of (OLD[task] || [])) { if (o.includes(m)) s = Math.max(s, v); }
  return s;
}

const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r42-counterfactual:' + key + ']', (e && e.message) || e);
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
function occOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : {}; return p.occupation || p.formerOccupation || '?'; } catch (e) { return '?'; }
}
function skillOf(Game, vid, task) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    return (Game.specialistSkill ? Game.specialistSkill(p || {}, task) : 0) || 0;
  } catch (e) { return 0; }
}
function tierOf(Game) {
  try { return Game.havenTier ? Game.havenTier() : ((Game.state.village || {}).havenTier || 0); } catch (e) { return 0; }
}
function storesOf(Game) {
  try {
    if (Game.havenStores) { const s = Game.havenStores(); return { food: s.food, wood: s.wood, stone: s.stone }; }
  } catch (e) { warnOnce('havenStores', e); }
  return { food: Math.round(pantryKcal(Game)), wood: 0, stone: 0 };
}
function census(Game) {
  const rows = [];
  for (const id of livingVids(Game)) {
    const occ = occOf(Game, id);
    const row = { id: String(id), name: nameOf(Game, id), occ };
    for (const t of TASKS) {
      row[t] = skillOf(Game, id, t);
      row['old_' + t] = oldSkill(occ, t);
    }
    rows.push(row);
  }
  return rows;
}
function censusSummary(rows) {
  const out = {};
  for (const t of TASKS) {
    out[t] = {
      n1: rows.filter(r => r[t] >= 1).length,
      n2: rows.filter(r => r[t] >= 2).length,
      old_n1: rows.filter(r => r['old_' + t] >= 1).length,
      names: rows.filter(r => r[t] >= 1).map(r => r.name + ' (' + r.occ + ':' + r[t] + ')'),
    };
  }
  return out;
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('policy.setup', e); } }

  const dayLines = {};
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }
  const contests = [];
  let pilotDay = null;
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
  const knownIds = new Set(censusStart.map(r => r.id));
  const arrivals = [];
  const pantryTrace = [];
  let topUpDone = false, topUp = null; // r42-X arm only: dawn-d22 pantry top-up record
  // r42-counterfactual FOOD LEDGER (read-only): one row per dawn — pantry/pack/alive/
  // hungryStreak + telemetry event-type counts for events added since the
  // previous dawn. Reading Game.state.telemetry never mutates game state.
  const foodLedger = [];
  let teleMark = 0;
  try { teleMark = ((Game.state.telemetry || []).length); } catch (e) { teleMark = 0; }
  let minAlive = livingVids(Game).length;
  function noteArrivals() {
    try {
      for (const id of livingVids(Game)) {
        const k = String(id);
        if (!knownIds.has(k)) {
          knownIds.add(k);
          let rosterLen = null;
          try { rosterLen = ((Game.state.village || {}).roster || []).length; } catch (e) { warnOnce('rosterLen', e); }
          arrivals.push({ day: nowDay(Game), id: k, name: nameOf(Game, id), occ: occOf(Game, id), rosterLen, aliveAtArrival: livingVids(Game).length });
        }
      }
    } catch (e) { warnOnce('arrivals', e); }
  }
  let crisisStreak = 0, maxCrisisStreak = 0;
  const waveDay = {};
  const tierUps = [];
  const _tierUp = Game.havenTierUp ? Game.havenTierUp.bind(Game) : null;
  if (_tierUp) {
    Game.havenTierUp = function (...a) {
      const before = tierOf(Game);
      const r = _tierUp(...a);
      try { tierUps.push({ day: nowDay(Game), from: before, to: tierOf(Game) }); }
      catch (e) { warnOnce('tierUp', e); }
      return r;
    };
  }

  for (let d = 1; d <= DAYS; d++) {
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
    // r42-X COUNTERFACTUAL (arm only, never in the panel driver): at dawn d22
    // add +20,000 kcal by increasing units of an already-held pantry item
    // (largest kcalEach>0). No RNG is consumed, so the run matches the panel
    // 239 run up to d22 and diverges only through game state afterwards.
    try {
      if (!topUpDone && nowDay(Game) === 22) {
        const pan = (Game.state.village || {}).pantry || [];
        let best = null;
        for (const it of pan) { const k = (it && it.kcalEach) || 0; if (k > 0 && (!best || k > best.kcalEach)) best = it; }
        if (best) {
          const add = Math.ceil(20000 / best.kcalEach);
          topUp = { item: JSON.parse(JSON.stringify(best)), addUnits: add, addedKcal: add * best.kcalEach, pantryBefore: Math.round(pantryKcal(Game)) };
          best.units = (best.units || 1) + add;
          topUp.pantryAfter = Math.round(pantryKcal(Game));
        } else { topUp = { none: true, pantryBefore: Math.round(pantryKcal(Game)) }; }
        topUpDone = true;
      }
    } catch (e) { warnOnce('topUp', e); topUp = topUp || { error: e.message }; topUpDone = true; }
    try { noteArrivals(); const al = livingVids(Game).length; if (al < minAlive) minAlive = al; pantryTrace.push({ day: nowDay(Game), pantryKcal: Math.round(pantryKcal(Game)), alive: al }); } catch (e) { warnOnce('trace', e); }
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
      const crisis = hs >= 3 && (p + pk) < liv * 2000;
      crisisStreak = crisis ? crisisStreak + 1 : 0;
      if (crisisStreak > maxCrisisStreak) maxCrisisStreak = crisisStreak;
    } catch (e) { warnOnce('foodTrace', e); }
    try {
      const allTele = (Game.state.telemetry || []).slice();
      const fresh = allTele.slice(teleMark); teleMark = allTele.length;
      const typeCounts = {};
      for (const t of fresh) { const k = (t && t.type) || '?'; typeCounts[k] = (typeCounts[k] || 0) + 1; }
      let hs2 = 0; try { hs2 = (Game.progState ? Game.progState() : {}).hungryStreak || 0; } catch (e2) {}
      foodLedger.push({ day: nowDay(Game), pantryKcal: Math.round(pantryKcal(Game)), packKcal: Math.round(packKcal(Game)), alive: livingVids(Game).length, hungryStreak: hs2, newTele: fresh.length, typeCounts });
    } catch (e) { warnOnce('foodLedger', e); }
  }

  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  const deaths = [];
  for (const t of tele) {
    if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  }
  const censusEnd = census(Game);
  const sumStart = censusSummary(censusStart);
  const sumEnd = censusSummary(censusEnd);
  const regressions = [];
  for (const r of censusEnd) {
    for (const t of TASKS) { if (r[t] < r['old_' + t]) regressions.push({ who: r.name, occ: r.occ, task: t, now: r[t], old: r['old_' + t] }); }
  }
  const c1 = {};
  for (const t of ['butcher', 'cook', 'spotter', 'builder']) c1[t] = sumEnd[t].n1 > sumEnd[t].old_n1;
  const starvation = deaths.filter(x => x.day >= 15 && /starvat|hunger|thirst/.test(String(x.cause || '')));

  // ---- C4: people — 2 held convos per seed (top cook + top builder); LIGHT scan skips convos ----
  const convoPath = EVID + `/journey-establishment-r42-counterfactual-convo-seed${seed}.txt`;
  const convoLines = [];
  const byTask = (t) => censusEnd.filter(r => r[t] >= 1).sort((a, b) => b[t] - a[t])[0];
  const convoTargets = [];
  if (!LIGHT) {
    for (const t of ['cook', 'builder']) {
      const b = byTask(t);
      if (b && !convoTargets.some(x => x.id === b.id)) convoTargets.push({ id: b.id, why: 'top-' + t });
    }
    for (const vid of livingVids(Game)) {
      if (convoTargets.length >= 2) break;
      if (convoTargets.some(x => String(x.id) === String(vid))) continue;
      convoTargets.push({ id: vid, why: 'fellow-villager' });
    }
  } else {
    convoLines.push('LIGHT scan mode: convos skipped by design (arrival hunt only).');
  }
  const STRUCT = { leave: 1, bye: 1, goon: 1, 'menu:more': 1, deflect_q: 1, honest_pass: 1, silence: 1 };
  let nullCount = 0, partySilentCount = 0, errorCount = 0, quietCloseCount = 0;
  for (const tg of convoTargets.slice(0, 2)) {
    const vid = tg.id;
    const nm = nameOf(Game, vid);
    const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
    convoLines.push(`\n-- ${nm} (${String(vid)}) occ=${p.occupation || p.formerOccupation || '?'} role=${tg.why} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      if (r.line == null) nullCount++;
      const seen = {};
      let lastPick = null;
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
        lastPick = pick.id;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        const isPartyPick = typeof lastPick === 'string' && (lastPick.startsWith('party_namepick') || lastPick.startsWith('party_rolepick'));
        if (r.line == null && isPartyPick) { partySilentCount++; convoLines.push('THEM: (silent confirmation — party pick, announced in main area)'); }
        else if (r.line == null && r.ended) { quietCloseCount++; convoLines.push('THEM: (quiet close — null line on an ended turn, r36 metric-review exemption)'); }
        else if (r.line == null) { nullCount++; convoLines.push('THEM: null'); }
        else convoLines.push(`THEM: ${r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { errorCount++; convoLines.push('ERROR: ' + e.message); }
  }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) { warnOnce('convoWrite', e); }


  // ---- B-PROBE (r40): betrayal:accept state consequence (scale r36 named next:
  // "measure accept's state consequence first"). Runs AFTER census (so the probe's
  // trust/pantry/time effects cannot move C1/C2/C3) and writes its own file, never
  // touching the panel JSON shape. One accept per seed max: scan living villagers
  // in roster order, open (no picks) until a betrayal:accept choice appears, then
  // snapshot state, accept, snapshot again, stop. No invite found = NOT-ENCOUNTERED.
  const probePath = EVID + `/journey-establishment-r42-counterfactual-betrayal-seed${seed}.json`;
  const probe = { seed, run: 'r42-counterfactual', attempts: [], found: null, accepted: null, pre: null, post: null, verdict: 'NOT-ENCOUNTERED' };
  const snapState = (vid) => {
    const snap = {};
    try { snap.day = nowDay(Game); } catch (e) { snap.day = null; }
    try { snap.trust = ((Game.state.village || {}).trust || {})[vid]; } catch (e) { snap.trust = null; }
    try { snap.pendingInvite = Game.pendingInvite ? Game.pendingInvite(vid) : null; } catch (e) { snap.pendingInvite = 'ERR:' + e.message; }
    try { const h = Game.inviteHistory ? Game.inviteHistory(vid) : null; snap.inviteHistory = h ? { count: h.count, accepted: h.accepted, outcomes: (h.outcomes || []).slice(-3) } : null; } catch (e) { snap.inviteHistory = 'ERR:' + e.message; }
    try { snap.pantryKcal = Math.round(pantryKcal(Game)); } catch (e) { snap.pantryKcal = null; }
    try { const st = Game.stashState ? Game.stashState() : null; snap.stashMaterials = st ? (st.materials || null) : null; } catch (e) { snap.stashMaterials = 'ERR:' + e.message; }
    try { snap.alive = !(Game.getPerson(vid) || {}).dead; } catch (e) { snap.alive = null; }
    try { const bs = Game.betrayalState ? Game.betrayalState() : null; snap.betrayalPlots = bs ? (bs.plots || []).filter(pl => pl.active).map(pl => ({ id: pl.id, inviter: pl.inviter, target: pl.target })) : null; snap.betrayalInvitesKeys = bs && bs.invites ? Object.keys(bs.invites) : null; } catch (e) { snap.betrayalPlots = 'ERR:' + e.message; }
    return snap;
  };
  if (!LIGHT) {
    for (const vid of livingVids(Game)) {
      if (probe.found) break;
      let r0 = null;
      try { r0 = Game.startConvo(vid); } catch (e) { probe.attempts.push({ vid: String(vid), error: e.message }); continue; }
      const choices = (r0 && r0.choices) || [];
      const hasAccept = choices.some(ch => ch.id === 'betrayal:accept');
      const hasDecline = choices.some(ch => ch.id === 'betrayal:decline');
      probe.attempts.push({ vid: String(vid), name: nameOf(Game, vid), opening: r0 ? (r0.line || null) : null, hasAccept, hasDecline, nChoices: choices.length });
      if (!hasAccept) { try { Game.endConvo(vid, 'done'); } catch (e) {} continue; }
      probe.found = { vid: String(vid), name: nameOf(Game, vid), opening: r0.line || null };
      probe.pre = snapState(vid);
      let r1 = null;
      try { r1 = Game.convoTurn(vid, 'betrayal:accept'); } catch (e) { probe.accepted = { error: e.message }; }
      if (r1) probe.accepted = { line: r1.line || null, ended: !!r1.ended };
      probe.post = snapState(vid);
      probe.verdict = 'ACCEPT-DRIVEN';
      try { Game.endConvo(vid, 'done'); } catch (e) {}
    }
  } else {
    probe.verdict = 'SKIP-light';
  }
  try { fs.writeFileSync(probePath, JSON.stringify(probe, null, 1)); } catch (e) { warnOnce('probeWrite', e); }

  const out = { seed, run: 'r42-counterfactual', light: LIGHT, reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    c1, regressions, c1PassCount: Object.values(c1).filter(Boolean).length,
    c3: { starvationDeaths: starvation.length, maxCrisisStreak, verdict: (starvation.length === 0 && maxCrisisStreak < 3) ? 'GO' : 'NO-GO' },
    c4: { convos: convoTargets.length, nullCount, partySilentCount, quietCloseCount, errorCount,
      verdict: LIGHT ? 'SKIP-light' : ((nullCount === 0 && errorCount === 0) ? 'GO' : 'NO-GO') },
    guardrails: { tier: tierOf(Game), tierUps, stores: storesOf(Game), pantryKcal: Math.round(pantryKcal(Game)),
      waveUnlockDays: waveDay, pilotDay, contests: contests.length, contestList: contests,
      deaths: deaths.length, popAlive: livingVids(Game).length, minAlive, arrivals: arrivals.length },
    censusStartSummary: sumStart, censusEndSummary: sumEnd,
    censusEnd, deaths, convoPath, ctxNotes: ctx.notes.slice(0, 10),
    arrivals, pantryTrace, foodLedger, topUp, topUpDone,
    // r40 FIX vs r37: exact-match 'hunter' only — r37's /hunter/i also matched
    // 'hunting guide' (the one hunt-occupation in the 100-person bg pool).
    // huntingGuideArrivals reported separately so the two channels never mix.
    hunterArrivals: arrivals.filter(a => String(a.occ || '').toLowerCase().trim() === 'hunter').map(a => {
      const end = censusEnd.find(r => r.id === a.id);
      return { ...a, aliveAtEnd: !!end, preserverAtEnd: end ? end.preserver : null, butcherAtEnd: end ? end.butcher : null, old_preserver: end ? end.old_preserver : null };
    }),
    huntingGuideArrivals: arrivals.filter(a => String(a.occ || '').toLowerCase().includes('hunting guide')).map(a => {
      const end = censusEnd.find(r => r.id === a.id);
      return { ...a, aliveAtEnd: !!end, preserverAtEnd: end ? end.preserver : null };
    }) };
  const outPath = EVID + `/journey-establishment-r42-counterfactual-seed${seed}.json`;
  try { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('outWrite', e); }
  return { seed, outPath, c1, regressions: regressions.length, c3: out.c3, c4: out.c4, guardrails: out.guardrails, arrivals: arrivals.length, hunterArrivals: out.hunterArrivals.length, huntingGuideArrivals: out.huntingGuideArrivals.length, minAlive };
}

async function main() {
  for (const seed of SEEDS) {
    console.log(`--- r42-counterfactual seed=${seed} light=${LIGHT} ---`);
    const r = await runSeed(seed);
    console.log(JSON.stringify({ seed, c1: r.c1, regressions: r.regressions, c3: r.c3, c4: r.c4, guardrails: r.guardrails }, null, 1));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
