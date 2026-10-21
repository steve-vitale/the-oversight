#!/usr/bin/env node
// instr-heraldsplit-20261021.js — herald-split attribution layer
// (flesh-out loop arm sim-heraldsplit, run fleshout-20261021T1215Z, axis
// scale-onramp, backlog #749). DIAGNOSTIC — no lever, no control arm.
//
// #749: "the Herald refuses solo TB entry 163/168 — wave-4 engagement
// censuses must split the titan class" (evidence/2026-10-21/
// sim-windowreach-r2.md). Every wave-4 engagement census so far has lumped
// herald fights vs monster wave-4 fights — different channels, different
// entry mechanics. This instrument splits them.
//
// DESIGN: layers on top of killdisc v2 (scripts/killdisc-instrument-
// 20261021.js, on master, proven non-perturbing). install(Game, t) calls
// KD.install(Game, t) FIRST, then adds exactly one read-only outer wrap on
// Game.startCombat that captures titan-refusal context (muster state at
// refusal time — have/need/ready, pure reads) for refused titan entries.
// ZERO game-state writes, ZERO RNG draws. The census itself
// (attributeRun) is PURE analysis of the killdisc v2 telemetry object,
// run in-process (fight ids carry Date.now() and are only joinable live).
//
// TITAN CLASS (from src/data/titans.json, read LIVE — never hardcoded):
//   herald        — the wave-4 tutorial titan (titan key 'herald')
//   wave4-monster — wave==4 AND not a titan-flagged monster (the other 9:
//                   congregation, strike, influencer, audit, reunion,
//                   suburb, eulogy, algorithm, eater)
//   wave5-monster — wave==5 AND not a titan-flagged monster (timeslot,
//                   editor, cancellation, spoiler, rerun, finale_crew)
//   other-titan   — titan-flagged monster that is not the herald
//                   (nielsen, finale, network_heart)
//   unresolvable  — in-census-scope (wave>=4) mid with no class → unexplained
//
// TRIGGER (enum: omen | expedition | raid | other):
//   titans → 'omen' (design rule, titans.js ontology: titans_never_wander —
//   "They arrive by omen only"; the fiction and the spawn path agree)
//   ctx.aid → 'raid'; ctx.onExped → 'expedition'; else → 'other'
//   (killdisc v2's killCtx already captures aid/onExped/atHaven for every
//   engagement, field fight and kill.)
//
// OUTCOME (enum: entered | refused-solo | fled | unmet | delegated):
//   TB engagement started=false            → 'refused-solo' (end detail names
//                                            the MECHANISM: 'tb-refused' =
//                                            the titan hard gate;
//                                            'already-in-fight' = game.js NO
//                                            SILENT CLOBBER; 'unknown-refusal'
//                                            = no fight, no live fight — the
//                                            corpus's 4 are stale
//                                            pendingEncounter echoes: fight
//                                            created then instantly dissolved
//                                            mid-call, return this.tbfight
//                                            === null)
//   TB engagement started on a titan       → 'delegated' (coalition muster —
//                                            the ONLY way past the gate)
//   TB engagement started on a w4-monster → 'entered' (sub: tbEnd won/lost/
//                                            fled/dissolved/unrecorded)
//   fieldFight on w4-monster: vKill/vDie→'entered', vFlee/mFlee→'fled',
//     evade/alreadyDead→'unmet', unresolved→kill-fallback or unexplained
//   fieldFight on a titan: combat outcomes → 'delegated' (villager-side
//     titan contact = the coalition field path); evade/alreadyDead → 'unmet'
//   kill with no engagement/fieldFight     → 'entered' (end='killed' — the
//                                            channel's kills by killer)
//   spawn with no contact                 → 'unmet' (spawned, never engaged)
//
// ATTRIBUTION (PRIMARY): attributed = known mid + resolvable titan class +
// trigger + outcome + (fight-id joined to a kill record OR explicit
// unresolved reason: tb-refused / tb-outcome-join / kill-join / field-
// outcome / unmet-spawn / explicit-unresolved). unexplained = unresolvable
// class OR no explicit resolution AND no day+mid kill fallback.
// instrumentErrors = any entry in t.instrumentErrors (KD's sink, shared).
'use strict';

const KD = require('./killdisc-instrument-20261021');

function instrumentOn() { return process.env.KILLDISC === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

// titanMonsterKey(Game): LIVE reverse map monsterId -> titan key, from
// Game.data.titans (never hardcoded). Keys starting with '_' are comments.
function titanMonsterKey(Game) {
  const map = {};
  try {
    const raw = (Game.data && Game.data.titans) || {};
    for (const k of Object.keys(raw)) {
      if (k.charAt(0) === '_') continue;
      const def = raw[k] || {};
      if (def.monster) map[String(def.monster)] = k;
    }
  } catch (e) {}
  return map;
}

// titanClass(Game, mid): 'herald' | 'wave4-monster' | 'wave5-monster' |
// 'other-titan' | null. Pure reads. null = unresolvable in census scope
// (mid not in data, or wave<4). Non-titan wave>=4 mids classify by wave so
// the wave-5 door's own engagements stay attributed.
function titanClass(Game, mid) {
  try {
    if (!mid) return null;
    const m = String(mid);
    const key = titanMonsterKey(Game)[m];
    if (key) return key === 'herald' ? 'herald' : 'other-titan';
    const w = KD.waveOf(Game, m) | 0;
    if (w === 4) return 'wave4-monster';
    if (w === 5) return 'wave5-monster';
    return null;
  } catch (e) { return null; }
}

// triggerOf(ctx, cls): 'omen' | 'expedition' | 'raid' | 'other'.
function triggerOf(ctx, cls) {
  try {
    if (cls === 'herald' || cls === 'other-titan') return 'omen';
    if (ctx && ctx.aid) return 'raid';
    if (ctx && ctx.onExped) return 'expedition';
    return 'other';
  } catch (e) { return 'other'; }
}

// scholarOf(Game, byVid, ctx): 'scholar' | 'villager' | 'other' — who killed.
function scholarOf(Game, byVid, ctx) {
  try {
    const sv = (ctx && ctx.scholarVid) || null;
    if (byVid && sv && byVid === sv) return 'scholar';
    if (byVid === 'player' || byVid === 'p') return 'scholar';
    if (byVid) return 'villager';
    return 'other';
  } catch (e) { return 'other'; }
}

// tbEndOutcome(r): normalizes the tbEnd result string into the outcome enum
// detail. Returns {outcome, end}.
function tbEndDetail(result) {
  const r = String(result || '').toLowerCase();
  if (r === 'fled') return { outcome: 'fled', end: 'fled' };
  if (r === 'dissolved') return { outcome: 'entered', end: 'dissolved' };
  if (r === 'won' || r === 'victory') return { outcome: 'entered', end: 'won' };
  if (r === 'lost' || r === 'defeat') return { outcome: 'entered', end: 'lost' };
  return { outcome: 'entered', end: 'unrecorded' };
}

// fieldOutcomeDetail(rec): fieldFight outcome → {outcome, end, resolved}.
// resolved=false only for 'unresolved' (needs the kill fallback).
function fieldOutcomeDetail(rec, cls) {
  const o = rec && rec.outcome;
  const titan = (cls === 'herald' || cls === 'other-titan');
  switch (o) {
    case 'vKill': return { outcome: titan ? 'delegated' : 'entered', end: 'killed', resolved: true };
    case 'vDie': return { outcome: titan ? 'delegated' : 'entered', end: 'died', resolved: true };
    case 'vFlee': return { outcome: 'fled', end: 'villager-fled', resolved: true };
    case 'mFlee': return { outcome: 'fled', end: 'monster-fled', resolved: true };
    case 'evade': return { outcome: 'unmet', end: 'evaded', resolved: true };
    case 'alreadyDead': return { outcome: 'unmet', end: 'already-dead', resolved: true };
    default: return { outcome: 'entered', end: 'unresolved', resolved: false };
  }
}

// install(Game, t): KD base install + one read-only outer startCombat wrap
// capturing titan-refusal context (muster have/need/ready at refusal time).
// t gains t.refusals: [{day, mid, engIdx, have, need, ready}].
function install(Game, t) {
  if (!t.refusals) t.refusals = [];
  const uninstallKD = KD.install(Game, t);
  const origStart = Game.startCombat;
  if (typeof origStart !== 'function') { err(t, 'install.missing:startCombat', new Error('not a function')); return uninstallKD; }
  Game.startCombat = function (monsterId) {
    let r;
    try { r = origStart.apply(this, arguments); } catch (e) { err(t, 'startCombat.call', e); throw e; }
    try {
      // KD's inner wrap already pushed the engagement (started=false on any
      // refusal). Capture the refusal REASON for every refused entry — pure
      // reads. Reasons: 'titan-gate' (the hard gate; have/need/ready), 
      // 'already-in-fight' (game.js NO SILENT CLOBBER), 'unknown'.
      // Evaluation order mirrors the engine: the titan gate fires before the
      // already-in-fight check (titans.js wraps outside game.js).
      const last = t.engagements && t.engagements[t.engagements.length - 1];
      const refused = last && last.mid === String(monsterId) && !last.started;
      if (refused) {
        const key = titanMonsterKey(Game)[String(monsterId || '')] || null;
        let reason = 'unknown', have = 0, need = 0, ready = false;
        if (key) {
          reason = 'titan-gate';
          try {
            const ms = (typeof Game.titanMusterState === 'function') ? Game.titanMusterState(key) : null;
            have = ms && Array.isArray(ms.allies) ? ms.allies.length : 0;
          } catch (e) {}
          try {
            const def = ((Game.data || {}).titans || {})[key] || {};
            need = (def.minAllies | 0) || 0;
          } catch (e) {}
          try { ready = (typeof Game.titanMusterReady === 'function') ? !!Game.titanMusterReady(key) : false; } catch (e) {}
        } else {
          let live = false;
          try { live = !!(Game.tbfight && !Game.tbfight.over); } catch (e) {}
          reason = live ? 'already-in-fight' : 'unknown';
        }
        let day = 0;
        try { day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
        t.refusals.push({ day, mid: String(monsterId), titanKey: key, engIdx: t.engagements.length - 1, reason, have, need, ready });
      }
    } catch (e) { err(t, 'startCombat.refusalCtx', e); }
    return r;
  };
  return function uninstall() {
    try { Game.startCombat = origStart; } catch (e) {}
    try { if (uninstallKD) uninstallKD(); } catch (e) {}
  };
}

// attributeRun(Game, t): PURE analysis of the killdisc v2 telemetry object.
// In-process only (fight ids carry Date.now — never persisted). Returns
// {units, unexplained, counts} where each unit is
// {kind, day, mid, cls, trigger, outcome, end, actor, resolution, kills}.
// kind ∈ engagement | field | kill | spawn.
function attributeRun(Game, t) {
  const units = [];
  const eng = (t.engagements || []).filter(e => (e.wave | 0) >= 4);
  const ff = (t.fieldFights || []).filter(f => (f.wave | 0) >= 4);
  const kills = (t.kills || []).filter(k => (k.wave | 0) >= 4);
  const spawns = (t.spawns || []).filter(s => (s.wave | 0) >= 4);
  const tbOutcomes = t.tbOutcomes || {};

  const killByFightId = {};
  for (const k of kills) {
    const fid = k.ctx && k.ctx.fightId;
    if (fid) (killByFightId[fid] = killByFightId[fid] || []).push(k);
  }
  // day+mid fallback index (for unjoined kills and unresolved fields)
  const killByDayMid = {};
  for (const k of kills) {
    const key = k.day + '|' + k.mid;
    (killByDayMid[key] = killByDayMid[key] || []).push(k);
  }
  const absorbedKill = new Set();

  // 1. TB engagements
  for (let i = 0; i < eng.length; i++) {
    const e = eng[i];
    const cls = titanClass(Game, e.mid);
    const u = {
      kind: 'engagement', day: e.day, mid: e.mid, cls,
      trigger: triggerOf(e.ctx, cls), party: e.partySize | 0,
      shape: e.shape || null, kills: 0, killers: [],
    };
    if (!cls) { u.outcome = null; u.end = 'unresolvable-class'; u.actor = 'scholar'; u.resolution = 'unexplained'; u.unexplained = true; units.push(u); continue; }
    const titan = (cls === 'herald' || cls === 'other-titan');
    if (!e.started) {
      u.outcome = 'refused-solo'; u.actor = 'scholar'; u.resolution = 'tb-refused';
      const rf = (t.refusals || []).find(r => r.engIdx === (t.engagements || []).indexOf(e));
      const reason = rf ? (rf.reason || 'unknown') : 'unknown';
      // End detail names the refusal MECHANISM, not just the gate: the 4
      // non-titan refusals in the corpus are stale pendingEncounter echoes
      // (proven: feast-drawn suburb fight dissolved via "comes apart", then
      // the harness fired the stale pending suburb → fight created and
      // instantly dissolved mid-call → return this.tbfight === null).
      u.end = reason === 'titan-gate' ? 'tb-refused' : (reason === 'already-in-fight' ? 'already-in-fight' : 'unknown-refusal');
      u.refusal = rf ? { reason, have: rf.have, need: rf.need, ready: rf.ready } : null;
    } else {
      const fid = e.fightId;
      const fk = fid ? (killByFightId[fid] || []) : [];
      for (const k of fk) { absorbedKill.add(k); u.kills++; u.killers.push(scholarOf(Game, k.by, k.ctx) + ':' + (k.by || '?')); }
      const det = tbEndDetail(fid ? tbOutcomes[fid] : null);
      if (titan) { u.outcome = 'delegated'; u.actor = 'muster'; }
      else { u.outcome = det.outcome; u.actor = 'scholar'; }
      u.end = titan ? ('titan-' + det.end) : det.end;
      if (fid && tbOutcomes[fid] !== undefined) u.resolution = 'tb-outcome-join';
      else if (fk.length) u.resolution = 'kill-join';
      else {
        // day+mid fallback before calling it unexplained. An engagement WITH
        // a captured fightId but no recorded end/kill is an explicit
        // unresolved reason ('unrecorded'); an encounter WITHOUT fight-id and
        // without day+mid fallback is unexplained (pre-reg).
        const fb = killByDayMid[u.day + '|' + u.mid] || [];
        const fbUnabs = fb.filter(k => !absorbedKill.has(k));
        if (fbUnabs.length) { for (const k of fbUnabs) { absorbedKill.add(k); u.kills++; u.killers.push(scholarOf(Game, k.by, k.ctx) + ':' + (k.by || '?')); } u.resolution = 'kill-join'; }
        else if (fid) u.resolution = 'explicit-unresolved';
        else u.resolution = 'unexplained';
      }
    }
    u.unexplained = (u.resolution === 'unexplained');
    units.push(u);
  }

  // 2. field fights
  const absorbedFF = new Set();
  for (const f of ff) {
    const cls = titanClass(Game, f.mid);
    const u = {
      kind: 'field', day: f.day, mid: f.mid, cls,
      trigger: triggerOf(f.ctx, cls), vid: f.vid,
      rounds: f.rounds, kills: 0, killers: [],
    };
    if (!cls) { u.outcome = null; u.end = 'unresolvable-class'; u.actor = 'villager'; u.resolution = 'unexplained'; u.unexplained = true; units.push(u); continue; }
    const det = fieldOutcomeDetail({ outcome: f.outcome }, cls);
    u.outcome = det.outcome; u.end = det.end; u.actor = 'villager';
    // attach matching kills (day+mid+vid — the villager's own kill)
    const fb = killByDayMid[f.day + '|' + f.mid] || [];
    for (const k of fb) {
      if (absorbedKill.has(k)) continue;
      if (k.by && f.vid && String(k.by) === String(f.vid)) { absorbedKill.add(k); u.kills++; u.killers.push('villager:' + k.by); }
    }
    if (det.resolved) u.resolution = 'field-outcome';
    else if (u.kills) u.resolution = 'kill-join';
    else {
      const fbUnabs = (killByDayMid[f.day + '|' + f.mid] || []).filter(k => !absorbedKill.has(k));
      if (fbUnabs.length) { for (const k of fbUnabs) { absorbedKill.add(k); u.kills++; u.killers.push(scholarOf(Game, k.by, k.ctx) + ':' + (k.by || '?')); } u.resolution = 'kill-join'; }
      else u.resolution = 'unexplained';
    }
    u.unexplained = (u.resolution === 'unexplained');
    units.push(u);
    absorbedFF.add(f);
  }

  // 3. unjoined kills → their own units (agency/aid/contest/trap channels)
  for (const k of kills) {
    if (absorbedKill.has(k)) continue;
    const cls = titanClass(Game, k.mid);
    const u = {
      kind: 'kill', day: k.day, mid: k.mid, cls,
      trigger: triggerOf(k.ctx, cls),
      outcome: 'entered', end: k.pyrrhic ? 'pyrrhic-killed' : 'killed',
      actor: scholarOf(Game, k.by, k.ctx),
      by: k.by || null, via: k.via || 'unknown',
      kills: 1, killers: [scholarOf(Game, k.by, k.ctx) + ':' + (k.by || '?')],
    };
    if (!cls) { u.outcome = null; u.end = 'unresolvable-class'; u.resolution = 'unexplained'; }
    else u.resolution = 'kill-join';
    u.unexplained = (u.resolution === 'unexplained');
    units.push(u);
  }

  // 4. spawns with no contact → 'unmet' units
  const contacted = new Set();
  for (const u of units) {
    if (u.kind === 'spawn') continue;
    contacted.add(u.mid);
  }
  // contact is mid-level with day-ordering: a spawn is contacted if any
  // unit for the same mid exists on/after the spawn day.
  const unitsByMid = {};
  for (const u of units) { (unitsByMid[u.mid] = unitsByMid[u.mid] || []).push(u.day); }
  for (const s of spawns) {
    const days = unitsByMid[s.mid] || [];
    const hasContact = days.some(d => d >= s.day);
    if (hasContact) continue;
    const cls = titanClass(Game, s.mid);
    const u = {
      kind: 'spawn', day: s.day, mid: s.mid, cls,
      trigger: (cls === 'herald' || cls === 'other-titan') ? 'omen' : 'other',
      outcome: 'unmet', end: 'never-engaged', actor: 'none',
      veteran: !!s.veteran, src: s.src || null,
      kills: 0, killers: [],
    };
    if (!cls) { u.outcome = null; u.end = 'unresolvable-class'; u.resolution = 'unexplained'; }
    else u.resolution = 'unmet-spawn';
    u.unexplained = (u.resolution === 'unexplained');
    units.push(u);
  }

  units.sort((a, b) => (a.day - b.day) || (a.kind < b.kind ? -1 : 1));
  const unexplained = units.filter(u => u.unexplained).length;
  const counts = {};
  for (const u of units) {
    const k = [u.kind, u.cls || 'unresolvable', u.outcome || 'none', u.resolution].join('|');
    counts[k] = (counts[k] || 0) + 1;
  }
  return { units, unexplained, counts, instrumentErrors: (t.instrumentErrors || []).length };
}

module.exports = { instrumentOn, install, titanMonsterKey, titanClass, triggerOf, scholarOf, tbEndDetail, fieldOutcomeDetail, attributeRun };
