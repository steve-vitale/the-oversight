#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40 window, 42d horizon per r71)
// R83 (2026-11-03). Clone of the r82 driver + DOOR-WALK WEDGE (see prereg):
// competent policy, one seed per process, dawn-signal instrumentation,
// daily alive/pantry trace, end census, 2 held convos (goon-first).
// Wedge: each dawn, if no open promised joint favor and no live run, sit
// up to 2 fresh-first villagers and press dlg:commit ONLY for an ask_favor
// want of kind forage_help/water_haul (r78 sit mechanics). If a live run
// exists, sit with the partner and press dlg:favor_action if offered.
// If a promised favor exists, the DOOR-WALK probe runs first: record
// door state, cross the Haven door with the honest enterBuilding() /
// exitBuilding() verb when player and partner are on opposite sides of
// it, greedy tap-walk (microMove, 1 tick/square, blocked cells refuse,
// cap 20 steps, stop on adjacency / dayPart leaving 0 / no progress),
// then sit mode 'start' and press dlg:favor_action if offered.
// NEVER dlg:favor_cancel. Sits are location-free in the harness
// (r78/r81 liberty, noted in prereg). People-check convos gated on
// !Game.over (r81 driver flaw fix).
// Usage: SEEDS=981 DAYS=42 node scripts/journey-establishment-r83-20261103.js
//   EVID defaults to the goal hidden_files evidence dir for 2026-11-03.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-03';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [981]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[r83:' + k + ']', (e && e.message) || e); } }
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function nameOf(Game, id) { try { return Game.displayName(id); } catch (e) { return String(id); } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
}
function isDead(Game, id) { try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const dayLines = {};
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }
  // Dawn-signal instrument: wrap the method (endDay calls it via this.*),
  // log every call's return; never mutate, never consume RNG.
  const dawnCalls = [];
  if (typeof Game.jointFavorDawnSignal === 'function') {
    const orig = Game.jointFavorDawnSignal.bind(Game);
    Game.jointFavorDawnSignal = function (...a) {
      const out = orig(...a);
      try { dawnCalls.push({ day: nowDay(Game), out: (out || []).map(o => ({ vid: String(o.vid), kind: o.kind, due: o.due, line: o.line })) }); } catch (e) {}
      return out;
    };
  } else { dawnCalls.push({ day: null, out: null, note: 'METHOD-MISSING' }); }

  // R82 lifecycle instruments (read-only wraps; never mutate, never consume RNG).
  const storeLog = [], commitLog = [], performLog = [];
  if (Game.convoStoreFavor) { const _s = Game.convoStoreFavor.bind(Game);
    Game.convoStoreFavor = function (favor) { try { storeLog.push({ day: nowDay(Game), vid: String(favor && favor.vid), kind: favor && favor.kind, state: favor && favor.state }); } catch (e) {} return _s.apply(this, arguments); }; }
  if (Game.convoFavorCommit) { const _c = Game.convoFavorCommit.bind(Game);
    Game.convoFavorCommit = function (vid, favor) { const r = _c.apply(this, arguments);
      try { commitLog.push({ day: nowDay(Game), vid: String(vid), kind: favor && favor.kind, ok: !!(r && r.ok), away: !!(r && r.away), blocked: !!(r && r.blocked), line: r && r.line ? String(r.line).slice(0, 160) : null }); } catch (e) {} return r; }; }
  if (Game.performForageFavor) { const _p = Game.performForageFavor.bind(Game);
    Game.performForageFavor = function (vid, f, ending) { const r = _p.apply(this, arguments);
      try { performLog.push({ day: nowDay(Game), vid: String(vid), kind: 'forage_help', ending: !!ending, ok: !!(r && r.ok), line: r && r.line ? String(r.line).slice(0, 160) : null }); } catch (e) {} return r; }; }
  if (Game.performWaterFavor) { const _w = Game.performWaterFavor.bind(Game);
    Game.performWaterFavor = function (vid, f, ending) { const r = _w.apply(this, arguments);
      try { performLog.push({ day: nowDay(Game), vid: String(vid), kind: 'water_haul', ending: !!ending, ok: !!(r && r.ok), line: r && r.line ? String(r.line).slice(0, 160) : null }); } catch (e) {} return r; }; }

  // R82 wedge helpers. JOINT kinds only. NO_PICK mirrors r78 (never press
  // a state-changing dlg:* choice as a fallback).
  const JOINT = new Set(['forage_help', 'water_haul']);
  const NO_PICK = new Set(['leave', 'bye', 'dlg:commit', 'dlg:favor_action', 'dlg:favor_cancel', 'dlg:renounce', 'dlg:invite']);
  const wedgeSits = [];
  const doorWalkLog = [];
  let sitCursor = 0;
  // R83 door-walk probe helpers. All reads are instruments; the only
  // state changes are the honest player verbs in wedgeDawn (door verbs
  // + microMove) — never direct state writes, never teleports.
  function homePoint83() {
    const v = Game.state.village || {};
    if (Number.isFinite(v.px) && Number.isFinite(v.py)) return { x: v.px, y: v.py };
    try { for (let y = 0; y < Game.map.tiles.length; y++) for (let x = 0; x < Game.map.tiles[y].length; x++) if (Game.map.tiles[y][x].type === 'haven') return { x, y }; } catch (e) {}
    return { x: 4, y: 4 };
  }
  function doorState83(vid) {
    const v = Game.state.village || {}, s = Game.state.scholar || {};
    const home = homePoint83();
    let partnerInside = null;
    try { partnerInside = (typeof Game.npcInside === 'function') ? !!Game.npcInside(vid) : (((v.npcInside || {})[vid] !== false)); } catch (e) { partnerInside = null; }
    const node = (v.nodePos || {})[vid] || null;
    return { home, playerAtHaven: (Game.map.px === home.x && Game.map.py === home.y),
      partnerAtHavenNode: !node || (node.nx === home.x && node.ny === home.y),
      playerInside: (s.insideHaven !== false), partnerInside,
      playerPos: { mx: s.mx ?? null, my: s.my ?? null },
      partnerPos: ((v.positions || {})[vid] ? { mx: (v.positions[vid]).mx ?? null, my: (v.positions[vid]).my ?? null } : null),
      dayPart: Game.dayPart ?? null };
  }
  function cheby83(a, b) { return Math.max(Math.abs((a.mx ?? 0) - (b.mx ?? 0)), Math.abs((a.my ?? 0) - (b.my ?? 0))); }
  function walkToPartner83(vid) {
    const rec = { steps: 0, squares: [], finalDist: null, dayPartStart: Game.dayPart ?? null, dayPartEnd: null, stoppedReason: null };
    const visited = new Set();
    try {
      const s0 = Game.state.scholar || {};
      visited.add((s0.mx ?? 4) + ',' + (s0.my ?? 4));
      const DELTAS = [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (let step = 0; step < 20; step++) {
        if (Game.over) { rec.stoppedReason = 'game-over'; break; }
        if (Game.dayPart !== 0) { rec.stoppedReason = 'daypart-left-0'; break; }
        const st = doorState83(vid);
        if (!st.partnerPos) { rec.stoppedReason = 'partner-pos-null'; break; }
        const dist = cheby83(st.playerPos, st.partnerPos);
        rec.finalDist = dist;
        if (dist <= 1) { rec.stoppedReason = 'adjacent'; break; }
        const cands = [];
        for (let i = 0; i < DELTAS.length; i++) {
          const cx = st.playerPos.mx + DELTAS[i][0], cy = st.playerPos.my + DELTAS[i][1];
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (visited.has(cx + ',' + cy)) continue;
          cands.push({ cx, cy, d: Math.max(Math.abs(cx - st.partnerPos.mx), Math.abs(cy - st.partnerPos.my)), order: i });
        }
        cands.sort((a, b) => (a.d - b.d) || (a.order - b.order));
        let moved = false;
        for (const c of cands) {
          let ok = false;
          try { ok = !!Game.microMove(c.cx, c.cy); } catch (e) { ok = false; }
          if (ok) { visited.add(c.cx + ',' + c.cy); rec.steps++; rec.squares.push([c.cx, c.cy]); moved = true; break; }
        }
        if (!moved) { rec.stoppedReason = 'no-progress'; break; }
      }
      if (!rec.stoppedReason) rec.stoppedReason = 'step-cap';
      const stEnd = doorState83(vid);
      rec.dayPartEnd = Game.dayPart ?? null;
      if (stEnd.partnerPos && stEnd.playerPos.mx !== null) rec.finalDist = cheby83(stEnd.playerPos, stEnd.partnerPos);
    } catch (e) { rec.stoppedReason = 'error'; rec.error = String(e && e.message).slice(0, 200); }
    return rec;
  }
  function jointLedger() {
    const v = Game.state.village || {};
    const out = [];
    for (const vid of (v.roster || [])) {
      const f = (v.favorLedger || {})[vid];
      if (!f || !JOINT.has(f.kind)) continue;
      const p = (v.promises || {})[vid];
      out.push({ vid: String(vid), name: nameOf(Game, vid), kind: f.kind, state: f.state,
        promised: !!(f.state === 'promised' && p && p.favorId === f.id),
        live: !!(f.forageRun || f.waterRun),
        run: f.forageRun ? { forageCount: f.forageRun.forageCount || 0, playerKcal: (f.forageRun.playerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0), partnerKcal: (f.forageRun.partnerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0) } : null });
    }
    return out;
  }
  // Sit one villager: work mode presses dlg:favor_action when offered;
  // accept mode presses dlg:commit only for an ask_favor joint want.
  function sit(vid, mode) {
    const rec = { day: nowDay(Game), vid: String(vid), name: nameOf(Game, vid), mode, picks: [], result: 'no-offer' };
    try {
      let r = Game.startConvo(vid);
      const seen = {};
      for (let turn = 0; turn < 12; turn++) {
        let c = null; try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
        if (!c || !c.active) break;
        const choices = (r && r.choices) || (c && c.choices) || [];
        if (!choices.length) break;
        const wantFavor = (c.want && c.want.favor) || null;
        const wantId = (c.want && c.want.id) || null;
        let pick = null;
        if ((mode === 'work' || mode === 'start') && choices.find(ch => ch.id === 'dlg:favor_action')) pick = choices.find(ch => ch.id === 'dlg:favor_action');
        else if (mode === 'accept' && wantId === 'ask_favor' && wantFavor && JOINT.has(wantFavor.kind) && choices.find(ch => ch.id === 'dlg:commit')) pick = choices.find(ch => ch.id === 'dlg:commit');
        else if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
        else pick = choices.find(ch => !NO_PICK.has(ch.id) && !seen[ch.id]) || null;
        if (!pick) break;
        seen[pick.id] = 1;
        rec.picks.push({ id: pick.id, wantId, wantFavorKind: wantFavor ? wantFavor.kind : null });
        if (wantId === 'ask_favor' && wantFavor && JOINT.has(wantFavor.kind)) rec.askFavorOffered = true;
        r = Game.convoTurn(vid, pick.id);
        if (pick.id === 'dlg:commit') {
          const f = ((Game.state.village || {}).favorLedger || {})[vid] || null;
          const p = ((Game.state.village || {}).promises || {})[vid] || null;
          rec.result = (f && f.state === 'promised' && p && p.favorId === f.id) ? 'committed' : 'refused';
          rec.commitLine = r && r.line ? String(r.line).slice(0, 300) : null;
          rec.meetDay = f ? (f.meetDay ?? null) : null;
          break;
        }
        if (pick.id === 'dlg:favor_action') { rec.result = 'favor-action'; rec.actionLine = r && r.line ? String(r.line).slice(0, 200) : null; break; }
        if (r && r.ended) break;
      }
    } catch (e) { rec.result = 'error'; rec.error = String(e && e.message).slice(0, 200); }
    try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {}
    wedgeSits.push(rec);
    return rec;
  }
  function wedgeDawn() {
    if (Game.over) return;
    try {
      const jl = jointLedger();
      const live = jl.find(j => j.live);
      if (live) { sit(live.vid, 'work'); return; }
      // R83 door-walk probe: a promised favor at dawn gets the door +
      // walk recovery attempt BEFORE the manual start sit. The dawn
      // signal itself says "Talk to them before you leave today" and
      // the dawn note names the door — so a real player walks through
      // it. The start sit still runs whatever the probe finds, so the
      // r82 baseline sit evidence is preserved.
      const promised = jl.find(j => j.promised);
      if (promised) {
        const probe = { day: nowDay(Game), vid: String(promised.vid), name: promised.name, kind: promised.kind, pre: null, dawnNote: null, doorVerb: null, doorVerbOk: null, postDoor: null, walk: null, postWalk: null, skippedReason: null, sitResult: null, sitActionLine: null, departed: null };
        try {
          probe.pre = doorState83(promised.vid);
          const fav = ((Game.state.village || {}).favorLedger || {})[promised.vid];
          probe.dawnNote = (fav && fav.outingAttempts && fav.outingAttempts.length) ? fav.outingAttempts[fav.outingAttempts.length - 1] : null;
          const pre = probe.pre;
          const todayNote = !!(probe.dawnNote && probe.dawnNote.day === nowDay(Game) && probe.dawnNote.outcome === 'noted');
          if (!todayNote) probe.skippedReason = 'no-dawn-note-today';
          else if (Game.dayPart !== 0) probe.skippedReason = 'not-daypart-0';
          else if (!pre.playerAtHaven) probe.skippedReason = 'player-away';
          else if (!pre.partnerAtHavenNode) probe.skippedReason = 'partner-not-at-haven';
          else if (pre.playerInside === pre.partnerInside) probe.skippedReason = 'same-side';
          else if (pre.playerInside === null || pre.partnerInside === null) probe.skippedReason = 'inside-unknown';
          else {
            try {
              if (pre.partnerInside && !pre.playerInside) { probe.doorVerb = 'enterBuilding'; probe.doorVerbOk = !!Game.enterBuilding(); }
              else if (!pre.partnerInside && pre.playerInside) { probe.doorVerb = 'exitBuilding'; probe.doorVerbOk = !!Game.exitBuilding(); }
            } catch (e) { probe.doorError = String(e && e.message).slice(0, 200); }
            probe.postDoor = doorState83(promised.vid);
            const pd = probe.postDoor;
            if (pd.partnerPos && pd.playerPos.mx !== null && pd.playerPos.my !== null) {
              const d0 = cheby83(pd.playerPos, pd.partnerPos);
              probe.walk = (d0 > 1) ? walkToPartner83(promised.vid) : { steps: 0, squares: [], finalDist: d0, dayPartStart: Game.dayPart ?? null, dayPartEnd: Game.dayPart ?? null, stoppedReason: 'already-adjacent' };
            } else probe.walk = { steps: 0, squares: [], finalDist: null, stoppedReason: 'partner-pos-null' };
            probe.postWalk = doorState83(promised.vid);
          }
        } catch (e) { probe.error = String(e && e.message).slice(0, 200); }
        const sitRec = sit(promised.vid, 'start');
        probe.sitResult = sitRec.result; probe.sitActionLine = sitRec.actionLine || null;
        try { const jlAfter = jointLedger(); const after = jlAfter.find(j => String(j.vid) === String(promised.vid)); probe.departed = !!(after && after.live); } catch (e) { probe.departed = null; }
        doorWalkLog.push(probe);
        return;
      }
      const v = Game.state.village || {};
      const cands = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
      // R83 rotation fix (pilot finding): the r82 "fresh-first" pool never
      // cleared satSet, so after cycle 1 it sat roster-head forever
      // (981: Jorge 36 + DeShawn 32 of 83 sits; Nikos, the only joint
      // asker, sat once). Round-robin through the living roster instead:
      // 2 per dawn, cursor advancing, so every villager is sampled.
      const picked = [];
      for (let i = 0; i < Math.min(2, cands.length); i++) picked.push(cands[(sitCursor + i) % cands.length]);
      if (picked.length) sitCursor = (sitCursor + picked.length) % cands.length;
      for (const vid of picked) {
        const rec = sit(vid, 'accept');
        if (rec.result === 'committed') break;
      }
    } catch (e) { warnOnce('wedge', e); }
  }

  const daily = [];
  const dawnOpps = [];
  const dawnLedgers = [];
  let startCensus = null;
  try {
    const v0 = Game.state.village || {};
    startCensus = (v0.roster || []).map(id => ({ id: String(id), name: nameOf(Game, id) }));
  } catch (e) { startCensus = null; }
  let deadTail = 0;
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('wait', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    // Post-sleep dawn scan: predicates still read true for signaled favors
    // (they check window + partner-at-home + dayPart 0, not the signal flag),
    // so this is an honest opportunity denominator for the dawn just passed.
    try {
      const v = Game.state.village || {};
      const waiting = [];
      const allJoint = [];
      for (const vid of (v.roster || [])) {
        const f = (v.favorLedger || {})[vid];
        if (!f || (f.kind !== 'forage_help' && f.kind !== 'water_haul')) continue;
        allJoint.push({ vid: String(vid), name: nameOf(Game, vid), kind: f.kind, dawnSignaledDay: f.dawnSignaledDay ?? null,
          state: f.state, outingAttempts: (f.outingAttempts || []).slice(),
          playerAtHaven: (() => { try { return Game.playerAtHaven ? Game.playerAtHaven() : null; } catch (e) { return null; } })() });
        let w = false;
        try { w = f.kind === 'forage_help' ? !!Game.forageFavorWaiting?.(vid) : !!Game.waterFavorWaiting?.(vid); } catch (e) { w = false; }
        if (w) waiting.push({ vid: String(vid), name: nameOf(Game, vid), kind: f.kind, dawnSignaledDay: f.dawnSignaledDay ?? null });
      }
      if (allJoint.length) dawnLedgers.push({ day: nowDay(Game), joint: allJoint });
      if (waiting.length) dawnOpps.push({ day: nowDay(Game), waiting });
    } catch (e) { warnOnce('dawnOpp', e); }
    // R82 wedge at dawn: accept a joint outing, or work a live run.
    wedgeDawn();
    const roster = ((Game.state.village || {}).roster || []);
    const alive = roster.filter(id => !isDead(Game, id)).length;
    daily.push({ day: nowDay(Game), alive, roster: roster.length, pantryKcal: Math.round(pantryKcal(Game)), over: !!Game.over });
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; } else deadTail = 0;
  }

  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  const deaths = [];
  for (const t of tele) if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  let wave = 1; try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const v = Game.state.village || {};
  const census = [];
  for (const id of (v.roster || [])) {
    let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    let health = null; try { health = ((v.health || {})[id] !== undefined ? v.health[id] : null); } catch (e) {}
    let sick = false; try { sick = !!((v.sick || {})[id]); } catch (e) {}
    let equipped = []; try { equipped = Object.values((p && p.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
    let known = null;
    try {
      const k = p && (p.knownPlants || p.known || p.codex);
      known = k ? (Array.isArray(k) ? k.length : Object.keys(k).length) : null;
    } catch (e) {}
    census.push({ id: String(id), name: nameOf(Game, id), dead: isDead(Game, id),
      occ: (p && (p.occupation || p.formerOccupation)) || '?', health, sick, equipped, knownCount: known });
  }
  const saySignalLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/is waiting at Haven to/.test(ln)) saySignalLines.push({ day: parseInt(d, 10), line: ln.replace(/^SAY: /, '') });
  // R82 legibility evidence: every dawn SAY line about an outing (the
  // favor-outing.js "noted blocker" lines a player would actually see).
  const dawnOutingLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/outing|waited at Haven|Haven this dawn/i.test(ln)) dawnOutingLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, '') });

  // People check: 2 held convos at end of run (top cook-ish fallback: first
  // two living non-player villagers in roster order), goon-first, 8 turns.
  const convoLines = [];
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
  if (Game.over) convoLines.push('(people check skipped: game over — r81 driver flaw fixed, no post-collapse sample)');
  for (const vid of (Game.over ? [] : living.slice(0, 2))) {
    const nm = nameOf(Game, vid);
    const p = (() => { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } })();
    convoLines.push(`\n-- ${nm} (${String(vid)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      const seen = {};
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) { convoLines.push('(choices empty)'); break; }
        let pick = null;
        if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
        else if (choices.find(ch => ch.id === 'ask:personal') && !seen['ask:personal']) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => ch.id !== 'leave' && ch.id !== 'bye' && !seen[ch.id])
          || null;
        if (!pick) { convoLines.push('(no pick)'); break; }
        if (pick.id !== 'goon') seen[pick.id] = 1;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        convoLines.push(`THEM: ${r.line == null ? '(null)' : r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { convoLines.push('ERROR: ' + e.message); }
  }

  let finalLedger = null;
  try {
    const vF = Game.state.village || {};
    finalLedger = Object.entries(vF.favorLedger || {}).map(([vid, f]) => ({ vid: String(vid), name: nameOf(Game, vid), kind: f && f.kind, dawnSignaledDay: f && f.dawnSignaledDay !== undefined ? f.dawnSignaledDay : null }));
  } catch (e) { finalLedger = null; }
  const out = { seed, run: 'r83', days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, startCensus,
    aliveAt40: (daily.find(x => x.day === 40) || daily[daily.length - 1] || {}).alive ?? null,
    aliveEnd: daily.length ? daily[daily.length - 1].alive : null,
    waveReached: wave, pantryKcalEnd: Math.round(pantryKcal(Game)),
    deaths, census, daily, dawnCalls, dawnOpportunities: dawnOpps, dawnLedgers, finalFavorLedger: finalLedger, saySignalLines,
    wedgeSits, doorWalkLog, storeLog, commitLog, performLog, dawnOutingLines, jointLedgerEnd: (() => { try { return jointLedger(); } catch (e) { return null; } })(),
    favorTele: (() => { const counts = {}; for (const t of tele) if (t && typeof t.type === 'string' && t.type.includes('favor')) counts[t.type] = (counts[t.type] || 0) + 1; return counts; })() };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `journey-establishment-r83-seed${seed}.json`), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(EVID, `journey-establishment-r83-convo-seed${seed}.txt`), convoLines.join('\n'));
  console.log(`SEED ${seed}: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${out.aliveEnd} aliveAt40=${out.aliveAt40} wave=${wave} deaths=${deaths.length} dawnCalls=${dawnCalls.filter(c => c.out && c.out.length).length} dawnOppDays=${dawnOpps.length} saySignals=${saySignalLines.length} pantryEnd=${out.pantryKcalEnd} wedgeSits=${wedgeSits.length} committed=${commitLog.filter(c => c.ok).length} askOffered=${wedgeSits.filter(s => s.askFavorOffered).length} favorActions=${wedgeSits.filter(s => s.result === 'favor-action').length} perform=${performLog.length} doorProbes=${doorWalkLog.length} doorDeparted=${doorWalkLog.filter(p => p.departed).length} favorTele=${JSON.stringify(out.favorTele)}`);
  return out;
}

(async () => {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
})();
