#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40 window, 42d horizon per r71)
// R136 (2026-11-13). Clone of the r85 driver + PAGING SIT (see prereg):
// competent policy, one seed per process, dawn-signal instrumentation,
// daily alive/pantry trace, end census, 2 held convos (goon-first).
// R136 PAGING (the r85 next blank, Yara seed 997): when an open betrayal
// case lengthens the menu, convoMenuPage paginates — betrayal actions
// (rank 0) fill page 1 and dlg:favor_cancel (rank 4) lands on page 2,
// so the r85 wedge, which only ever read page 1, sat 7 dawns. The sit()
// below now presses menu:more (the player's own verb, via
// Game.convoNextMenu) when its target verb is not on the current page,
// before giving up — for every mode with a target verb (end cancel,
// work favor_action, accept commit). No case action is ever pressed to
// clear a menu (probe: moot/site do not free page 1 and are real
// village actions). No behavior change when the verb is on page 1.
// Usage: SEEDS=2701 DAYS=42 node scripts/journey-establishment-r136-20261113.js
// Wedge: each dawn, if no open promised joint favor and no live run, sit
// up to 2 round-robin villagers and press dlg:commit ONLY for an ask_favor
// want of kind forage_help/water_haul (r78 sit mechanics, r83 rotation).
// If a promised favor exists, the r83 DOOR-WALK probe runs first (door
// verbs + greedy tap-walk, then sit mode 'start').
// If a live FORAGE run exists, the TRAVEL-OUT wedge runs: read the
// forageFavorAction status, get adjacent (door verbs + tap-walk), travel
// out on offered travelTargets to green ground, sit mode 'work' to press
// forage_together, travel home, sit mode 'work' to deliver. Water live
// runs keep the r83 sit-work behavior. R84 driver fix: jointLedger
// counts a run live only while !returned (r83 counted delivered runs
// live forever). R136 END WEDGE: a BROKEN live forage run (state 'broken'
// or promise kept 'broken') is closed with the honest end — deliver
// first if haul > 0 (r84 branch), else travel home and sit mode 'end'
// to press dlg:favor_cancel when the ending status is ready; the run
// flips returned=true and stops blocking later departures, with trust
// read before/after every end press (renounce is skipped for an
// already-broken promise, so trust must not move). NEVER dlg:favor_cancel
// on an unbroken run. Sits are location-free in the harness
// (r78/r81 liberty, noted in prereg). People-check convos gated on
// !Game.over (r81 driver flaw fix).
// PILOT MODE (pilot seed only): R136_PILOT_BREAK=1 makes the wedge HOLD
// on the first live forage run — honest inaction, no work presses — so
// the run breaks at its deadline and the end-wedge has something to
// close. Panel runs WITHOUT the flag.
// Usage: SEEDS=991 DAYS=42 node scripts/journey-establishment-r136-20261113.js
//   EVID defaults to the goal hidden_files evidence dir for 2026-11-13.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-13';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const PILOT_BREAK = process.env.R136_PILOT_BREAK === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [991]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[r136:' + k + ']', (e && e.message) || e); } }
// R136: evidence writes retry through write-flap windows (host EPERM
// episodes leave 0-byte files and nuke a finished sim — the pilot's
// first run died exactly this way). One big write usually lands
// between refused ones; this episode is refusing consistently, so the
// retry budget spans it: every 10s for up to 60 min, logging every
// 10 min so the run looks alive instead of wedged.
function writeFileRetry(p, data) {
  let last = null;
  for (let i = 0; i < 360; i++) {
    try { fs.writeFileSync(p, data); return true; }
    catch (e) { last = e; if (i > 0 && i % 60 === 0) console.warn('[r136:write-retry] ' + p.split('/').pop() + ' still EPERM after ' + (i * 10) + 's, retrying'); try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000); } catch (e2) {} }
  }
  throw last;
}
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
  const travelOutLog = [];
  // R136 end-wedge state. endLog: one record per end attempt (trust
  // before/after included). jamLog: dawns where a promised run existed
  // while a broken-live run was live (the r84 poison). endDisabled
  // trips on the first trust drop on an end press (hard guard).
  const endLog = [];
  const jamLog = [];
  let brokenWaterDawns = 0;
  let pilotBreakVid = null;
  let endDisabled = false;
  let sitCursor = 0;
  // R84 door-walk probe helpers. All reads are instruments; the only
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
  function walkToPartner84(vid) {
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
        promiseKept: p ? (p.kept ?? null) : null,
        promised: !!(f.state === 'promised' && p && p.favorId === f.id),
        live: !!((f.forageRun && !f.forageRun.returned) || (f.waterRun && !f.waterRun.returned)),
        run: f.forageRun ? { forageCount: f.forageRun.forageCount || 0, playerKcal: (f.forageRun.playerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0), partnerKcal: (f.forageRun.partnerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0), returned: !!f.forageRun.returned, deliveredKcal: f.forageRun.deliveredKcal || 0 } : null });
    }
    return out;
  }
  // Sit one villager: work mode presses dlg:favor_action when offered;
  // accept mode presses dlg:commit only for an ask_favor joint want;
  // end mode (r136) presses ONLY dlg:favor_cancel when offered — if it
  // is not offered, the sit ends without pressing anything.
  // R136 PAGING: a target verb can sit on page 2+ when betrayal/agency
  // prepends lengthen the menu (Yara r85: cancel on page 2 behind 4
  // betrayal actions). A real player taps menu:more — the wedge does
  // the same, up to all pages, before giving up on the verb. No case
  // action is ever pressed to clear a menu. pagesTurned/menuPages are
  // recorded on the sit rec; when the verb is absent after all pages,
  // offeredIds carries every page's ids (not just page 1).
  function targetForMode136(mode) {
    if (mode === 'end') return 'dlg:favor_cancel';
    if (mode === 'work' || mode === 'start') return 'dlg:favor_action';
    if (mode === 'accept') return 'dlg:commit';
    return null;
  }
  function sit(vid, mode) {
    const rec = { day: nowDay(Game), vid: String(vid), name: nameOf(Game, vid), mode, picks: [], result: 'no-offer', pagesTurned: 0, menuPages: null };
    try {
      let r = Game.startConvo(vid);
      const seen = {};
      for (let turn = 0; turn < 12; turn++) {
        let c = null; try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
        if (!c || !c.active) break;
        let choices = (r && r.choices) || (c && c.choices) || [];
        if (!choices.length) break;
        if (rec.menuPages === null) { try { rec.menuPages = (c.menuPages != null) ? c.menuPages : null; } catch (e) {} }
        // R136 paging: if this mode's target verb is not on the current
        // page and menu:more is offered, turn pages looking for it.
        // ONCE per sit (a real player pages through the menu once to
        // find the verb — re-sweeping every turn cycled pages up to 66x
        // in one sit on the pilot), and never past the starting page
        // (convoNextMenu wraps, so without the stop the sweep revisits
        // the same pages). Accept mode pages only when the commit is
        // actually its target (an ask_favor joint want); otherwise
        // dlg:commit is not a verb this sit wants, and paging for it
        // is nonsense that also changes fallback picks.
        const wantFavor136 = (c.want && c.want.favor) || null;
        const wantId136 = (c.want && c.want.id) || null;
        const target136 = (mode === 'accept' && !(wantId136 === 'ask_favor' && wantFavor136 && JOINT.has(wantFavor136.kind)))
          ? null : targetForMode136(mode);
        if (target136 && !rec.pagedSweep136 && !choices.some(ch => ch.id === target136)) {
          rec.allPagesOffered = choices.map(ch => ch.id);
          const startPage136 = (c.menuPage != null) ? c.menuPage : 0;
          let guard136 = 0;
          while (guard136 < 6 && choices.some(ch => ch.id === 'menu:more') && !choices.some(ch => ch.id === target136)) {
            guard136++;
            let nr = null;
            try { nr = (typeof Game.convoNextMenu === 'function') ? Game.convoNextMenu(vid) : null; } catch (e) { rec.pageError = String(e && e.message).slice(0, 120); break; }
            if (!nr || !nr.choices) break;
            r = nr;
            choices = nr.choices || [];
            rec.pagesTurned = (rec.pagesTurned || 0) + 1;
            rec.allPagesOffered = rec.allPagesOffered.concat(choices.map(ch => ch.id));
            try { const cc = Game.convoGet ? Game.convoGet(vid) : null; if (cc && cc.menuPages != null) rec.menuPages = cc.menuPages; } catch (e) {}
            try { const cc2 = Game.convoGet ? Game.convoGet(vid) : null; if (cc2 && (cc2.menuPage != null) && cc2.menuPage === startPage136) break; } catch (e) {}
          }
          rec.pagedSweep136 = true;
        }
        const wantFavor = (c.want && c.want.favor) || null;
        const wantId = (c.want && c.want.id) || null;
        let pick = null;
        if (mode === 'end') {
          const cancel = choices.find(ch => ch.id === 'dlg:favor_cancel');
          if (!cancel) { rec.result = 'end-cancel-not-offered'; rec.offeredIds = (rec.allPagesOffered && rec.allPagesOffered.length) ? rec.allPagesOffered : choices.map(ch => ch.id); break; }
          pick = cancel;
        } else if ((mode === 'work' || mode === 'start') && choices.find(ch => ch.id === 'dlg:favor_action')) pick = choices.find(ch => ch.id === 'dlg:favor_action');
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
        if (pick.id === 'dlg:favor_cancel') { rec.result = 'favor-cancel'; rec.actionLine = r && r.line ? String(r.line).slice(0, 300) : null; break; }
        if (r && r.ended) break;
      }
    } catch (e) { rec.result = 'error'; rec.error = String(e && e.message).slice(0, 200); }
    try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {}
    wedgeSits.push(rec);
    return rec;
  }
  // R84 travel-out wedge helpers. All state changes are honest player
  // verbs (door verbs, travelTo on offered targets, microMove, convo
  // favor_action presses). forageFavorAction status calls are read-only.
  function runSnap84(vid) {
    try {
      const f = ((Game.state.village || {}).favorLedger || {})[vid];
      const p = ((Game.state.village || {}).promises || {})[vid];
      if (!f || !f.forageRun) return null;
      const r = f.forageRun;
      return { forageCount: r.forageCount || 0,
        playerKcal: (r.playerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0),
        partnerKcal: (r.partnerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0),
        returned: !!r.returned, deliveredKcal: r.deliveredKcal || 0,
        state: f.state, promiseKept: p ? (p.kept ?? null) : null };
    } catch (e) { return null; }
  }
  function favorStatus84(vid) {
    try {
      const f = ((Game.state.village || {}).favorLedger || {})[vid];
      if (!f || typeof Game.forageFavorAction !== 'function') return null;
      const s = Game.forageFavorAction(vid, f, false);
      return s ? { ready: !!s.ready, action: s.action || null, reason: s.reason ? String(s.reason).slice(0, 200) : null, label: s.label || null } : null;
    } catch (e) { return { ready: false, action: null, reason: 'status-error: ' + String(e && e.message).slice(0, 120) }; }
  }
  function favorStatusEnd84(vid) {
    // R136: the ENDING branch of the same read-only status call — ready
    // means the menu will offer dlg:favor_cancel for this live run.
    try {
      const f = ((Game.state.village || {}).favorLedger || {})[vid];
      if (!f || typeof Game.forageFavorAction !== 'function') return null;
      const s = Game.forageFavorAction(vid, f, true);
      return s ? { ready: !!s.ready, action: s.action || null, reason: s.reason ? String(s.reason).slice(0, 200) : null, label: s.label || null } : null;
    } catch (e) { return { ready: false, action: null, reason: 'status-error: ' + String(e && e.message).slice(0, 120) }; }
  }
  function trustOf84(vid) {
    try { const t = ((Game.state.village || {}).trust || {})[vid]; return (t === undefined || t === null) ? null : t; } catch (e) { return null; }
  }
  // R136 END WEDGE: close a BROKEN live forage run with the honest end.
  // Deliver-first already ran (haul > 0 closes via forage_deliver), so
  // this handles the 0-haul (or otherwise undeliverable) broken run:
  // travel home, check the ending status, sit mode 'end' and press
  // dlg:favor_cancel IF OFFERED. Trust is read before/after the press:
  // renounce is skipped for an already-broken promise, so trust must
  // not move — a drop trips the hard guard (endDisabled) for the rest
  // of this seed. Never presses cancel on an unbroken run; never
  // presses cancel away from home (ending is not ready there).
  function endWedge84(live, rec) {
    const vid = live.vid;
    const end = { day: nowDay(Game), vid: String(vid), name: live.name, kind: live.kind,
      preRun: rec.preRun || null, preTrust: trustOf84(vid), homeHops: null, endStatus: null,
      sitResult: null, sitActionLine: null, postTrust: null, postRun: null, outcome: null };
    rec.end = end;
    try {
      if (endDisabled) { end.outcome = 'end-disabled-after-trust-drop'; rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return; }
      const home = homePoint83();
      if (!(Game.map.px === home.x && Game.map.py === home.y)) {
        end.homeHops = travelHome84();
        if (!end.homeHops.atHome) { end.outcome = 'end-stranded'; rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return; }
      } else end.homeHops = { atHome: true, hops: [] };
      // Haul may have appeared since the pre-status (it cannot — haul
      // only changes via presses — but re-checking costs nothing and
      // keeps deliver the better verb whenever it is offered).
      const stNow = favorStatus84(vid);
      if (stNow && stNow.ready && stNow.action === 'forage_deliver') {
        const dRec = sit(vid, 'work');
        end.sitResult = dRec.result; end.sitActionLine = dRec.actionLine || null;
        end.pagesTurned = dRec.pagesTurned || 0; end.menuPages = (dRec.menuPages != null) ? dRec.menuPages : null;
        end.postRun = runSnap84(vid); end.postTrust = trustOf84(vid);
        end.outcome = (end.postRun && end.postRun.returned) ? 'end-via-deliver' : 'end-deliver-sit-no-return';
        rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return;
      }
      let es = favorStatusEnd84(vid);
      end.endStatus = es;
      // PILOT FIX (991): the ending branch shares the adjacency check —
      // a door-split partner (one side in, one out) blocks ending even
      // at home. The work wedge already recovers this with
      // ensureAdjacent84; the end-wedge does the same before giving up.
      if ((!es || !es.ready) && es && /door|next to your partner|same side/i.test(es.reason || '')) {
        ensureAdjacent84(vid, end);
        es = favorStatusEnd84(vid);
        end.endStatusAfterAdj = es;
      }
      if (!es || !es.ready || es.action !== 'forage_end') {
        end.outcome = 'end-not-ready:' + ((es && es.reason) ? es.reason.slice(0, 120) : 'no-status');
        rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return;
      }
      const sitRec = sit(vid, 'end');
      end.sitResult = sitRec.result; end.sitActionLine = sitRec.actionLine || null;
      end.pagesTurned = sitRec.pagesTurned || 0; end.menuPages = (sitRec.menuPages != null) ? sitRec.menuPages : null;
      if (sitRec.result === 'end-cancel-not-offered') end.offeredIds = sitRec.offeredIds || null;
      end.postRun = runSnap84(vid); end.postTrust = trustOf84(vid);
      if (end.preTrust !== null && end.postTrust !== null && end.postTrust < end.preTrust) {
        endDisabled = true;
        end.outcome = 'end-trust-drop:' + end.preTrust + '->' + end.postTrust;
        rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return;
      }
      end.outcome = (end.postRun && end.postRun.returned) ? 'ended' : 'end-press-no-return';
      rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return;
    } catch (e) {
      end.error = String(e && e.message).slice(0, 200);
      try { if (end.homeHops && !end.homeHops.atHome) end.homeHops = travelHome84(); } catch (e2) {}
      end.outcome = 'end-wedge-error';
      rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec);
    }
  }
  function walkToPartnerNoGate84(vid) {
    // Same greedy tap-walk as walkToPartner84 but without the dayPart-0
    // stop: working an outing is daytime play, not a dawn appointment.
    const rec = { steps: 0, squares: [], finalDist: null, stoppedReason: null };
    const visited = new Set();
    try {
      const s0 = Game.state.scholar || {};
      visited.add((s0.mx ?? 4) + ',' + (s0.my ?? 4));
      const DELTAS = [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (let step = 0; step < 20; step++) {
        if (Game.over) { rec.stoppedReason = 'game-over'; break; }
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
      if (stEnd.partnerPos && stEnd.playerPos.mx !== null) rec.finalDist = cheby83(stEnd.playerPos, stEnd.partnerPos);
    } catch (e) { rec.stoppedReason = 'error'; rec.error = String(e && e.message).slice(0, 200); }
    return rec;
  }
  function ensureAdjacent84(vid, rec) {
    // Door + walk until the favor status stops naming a door/adjacency
    // block, or no progress. Returns the final status.
    let status = favorStatus84(vid);
    for (let attempt = 0; attempt < 3 && status && !status.ready; attempt++) {
      const reason = status.reason || '';
      if (!/door|next to your partner|same side/i.test(reason)) break;
      const st = doorState83(vid);
      let acted = false;
      if (st.playerAtHaven && st.partnerAtHavenNode && st.playerInside !== null && st.partnerInside !== null && st.playerInside !== st.partnerInside) {
        try {
          if (st.partnerInside && !st.playerInside) { rec.doorVerbs = rec.doorVerbs || []; rec.doorVerbs.push({ verb: 'enterBuilding', ok: !!Game.enterBuilding() }); acted = true; }
          else if (!st.partnerInside && st.playerInside) { rec.doorVerbs = rec.doorVerbs || []; rec.doorVerbs.push({ verb: 'exitBuilding', ok: !!Game.exitBuilding() }); acted = true; }
        } catch (e) { rec.doorError = String(e && e.message).slice(0, 200); }
      }
      const walk = walkToPartnerNoGate84(vid);
      rec.walks = rec.walks || []; rec.walks.push(walk);
      if (!acted && walk.steps === 0 && walk.stoppedReason !== 'adjacent') break;
      status = favorStatus84(vid);
    }
    return status;
  }
  function travelStep84(goalX, goalY) {
    // One honest hop toward (goalX,goalY) on an offered travelTarget.
    try {
      const targets = Game.travelTargets ? (Game.travelTargets() || []) : [];
      if (!targets.length) return { ok: false, reason: 'no-targets' };
      const cur = { x: Game.map.px, y: Game.map.py };
      if (cur.x === goalX && cur.y === goalY) return { ok: false, reason: 'already-there' };
      let best = null;
      for (const t of targets) {
        const d = Math.abs(t.x - goalX) + Math.abs(t.y - goalY);
        if (!best || d < best.d) best = { x: t.x, y: t.y, d };
      }
      if (!best) return { ok: false, reason: 'no-target' };
      const before = Game.map.px + ',' + Game.map.py;
      let res = null;
      try { res = Game.travelTo(best.x, best.y); } catch (e) { return { ok: false, reason: 'travel-error: ' + String(e && e.message).slice(0, 120) }; }
      const after = Game.map.px + ',' + Game.map.py;
      return { ok: before !== after, to: [best.x, best.y], res: res ? String(res.blockType || 'ok') : 'null' };
    } catch (e) { return { ok: false, reason: 'travel-error: ' + String(e && e.message).slice(0, 120) }; }
  }
  function travelHome84() {
    const home = homePoint83();
    const hops = [];
    for (let i = 0; i < 12; i++) {
      if (Game.over) break;
      if (Game.map.px === home.x && Game.map.py === home.y) break;
      const step = travelStep84(home.x, home.y);
      hops.push(step);
      if (!step.ok) break;
    }
    return { atHome: Game.map.px === home.x && Game.map.py === home.y, hops };
  }
  function wedgeTravelOut(live) {
    const vid = live.vid;
    const rec = { day: nowDay(Game), vid: String(vid), name: live.name, kind: live.kind,
      pre: null, preRun: null, preStatus: null, doorVerbs: null, walks: null, outHops: [],
      press: null, homeHops: null, deliver: null, post: null, outcome: null, moved: false };
    try {
      rec.pre = doorState83(vid);
      rec.preRun = runSnap84(vid);
      let status = favorStatus84(vid);
      rec.preStatus = status;
      if (!status) { rec.outcome = 'no-status'; travelOutLog.push(rec); return; }
      if (status.action === 'forage_deliver') {
        const sitRec = sit(vid, 'work');
        rec.deliver = { sitResult: sitRec.result, actionLine: sitRec.actionLine || null };
        rec.post = runSnap84(vid);
        rec.outcome = (rec.post && rec.post.returned) ? 'delivered-at-home' : 'deliver-sit-no-return';
        travelOutLog.push(rec); return;
      }
      // R136 END WEDGE (replaces the r84 skip): a broken promise can
      // never become kept, but the live run still blocks every later
      // departure until it is closed. Ending a BROKEN run is not
      // canceling a live promise — the word is already broken and its
      // price already paid — so the wedge closes it with the honest
      // end (deliver if haul > 0, else dlg:favor_cancel at home).
      // A broken run WITH haul still takes the deliver-first branch
      // above; this branch only fires when deliver was not offered.
      const favNow = ((Game.state.village || {}).favorLedger || {})[vid];
      if (favNow && (favNow.state === 'broken' || (rec.preRun && rec.preRun.promiseKept === 'broken'))) {
        endWedge84(live, rec);
        return;
      }
      // Hard blocks no travel can fix: event/fight, partner gone, deadline.
      if (!status.ready && /current event|finish the fight|no longer available|deadline has passed/i.test(status.reason || '')) {
        rec.outcome = 'blocked:' + (status.reason || '').slice(0, 120);
        travelOutLog.push(rec); return;
      }
      if (!status.ready || status.action !== 'forage_together') status = ensureAdjacent84(vid, rec);
      rec.afterAdjStatus = status;
      const home = homePoint83();
      const atHome = (Game.map.px === home.x && Game.map.py === home.y);
      if ((!status || !status.ready || status.action !== 'forage_together') && atHome) {
        const st0 = doorState83(vid);
        if (st0.playerInside) { try { rec.exitOk = !!Game.exitBuilding(); } catch (e) { rec.exitError = String(e && e.message).slice(0, 200); } }
        try {
          const targets = Game.travelTargets ? (Game.travelTargets() || []) : [];
          const out = targets.find(t => !(t.x === home.x && t.y === home.y));
          if (out) {
            const before = Game.map.px + ',' + Game.map.py;
            let res = null;
            try { res = Game.travelTo(out.x, out.y); } catch (e) { rec.outError = String(e && e.message).slice(0, 200); }
            const moved = before !== (Game.map.px + ',' + Game.map.py);
            rec.outHops.push({ to: [out.x, out.y], moved, res: res ? String(res.blockType || 'ok') : 'null' });
            if (moved) rec.moved = true;
          } else rec.outHops.push({ to: null, moved: false, res: 'no-out-target' });
        } catch (e) { rec.outError = String(e && e.message).slice(0, 200); }
        status = ensureAdjacent84(vid, rec);
        rec.afterOutStatus = status;
        let tries = 0;
        while (status && !status.ready && /nothing left to take here/i.test(status.reason || '') && tries < 2 && !Game.over) {
          tries++;
          let stepped = null;
          try {
            const cur = { x: Game.map.px, y: Game.map.py };
            const targets = Game.travelTargets ? (Game.travelTargets() || []) : [];
            const alt = targets.find(t => !(t.x === cur.x && t.y === cur.y) && !(t.x === home.x && t.y === home.y));
            if (alt) {
              const before = Game.map.px + ',' + Game.map.py;
              try { Game.travelTo(alt.x, alt.y); } catch (e) {}
              stepped = { to: [alt.x, alt.y], moved: before !== (Game.map.px + ',' + Game.map.py) };
              if (stepped.moved) rec.moved = true;
            }
          } catch (e) { stepped = { error: String(e && e.message).slice(0, 120) }; }
          rec.outHops.push(stepped);
          if (!stepped || !stepped.moved) break;
          status = ensureAdjacent84(vid, rec);
        }
        rec.afterRetriesStatus = status;
      } else if ((!status || !status.ready || status.action !== 'forage_together') && !atHome) {
        status = ensureAdjacent84(vid, rec);
        rec.afterOutStatus = status;
      }
      // PILOT FIX (991): a ready status is NOT a guarantee — the press
      // itself can fail on a bare patch ("Nothing came of that press"),
      // and the old code counted that failed press as work and then
      // re-tried the SAME first target every dawn (991: 29 failed
      // presses, 0 food). The game's own line says to walk to another
      // green patch, so a failed press rotates to the next untried
      // non-home target (up to 8 patches this dawn). VERIFICATION FIX
      // (991 rerun): a press can also "succeed" with ZERO edible food
      // ("wood and green we cannot name yet" — unknown plants split
      // nothing), which the first fix counted as work. Success is
      // judged by EDIBLE kcal increasing, never by forageCount or the
      // sit result alone. Pack-full failures do not rotate (another
      // patch cannot fix them).
      const dawnStartEdible = (rec.preRun ? (rec.preRun.playerKcal + rec.preRun.partnerKcal) : 0);
      const triedNodes = new Set([Game.map.px + ',' + Game.map.py]);
      let pressedOk = false;
      for (let attempt = 0; attempt < 8 && !Game.over; attempt++) {
        if (!(status && status.ready && status.action === 'forage_together')) break;
        const sitRec = sit(vid, 'work');
        rec.pressAttempts = rec.pressAttempts || [];
        rec.pressAttempts.push({ node: [Game.map.px, Game.map.py], sitResult: sitRec.result, actionLine: sitRec.actionLine || null });
        const snap = runSnap84(vid);
        const snapEdible = snap ? (snap.playerKcal + snap.partnerKcal) : 0;
        rec.pressAttempts[rec.pressAttempts.length - 1].edibleKcal = snapEdible;
        if (sitRec.result === 'favor-action' && snap && snapEdible > dawnStartEdible) {
          pressedOk = true;
          rec.press = rec.pressAttempts[rec.pressAttempts.length - 1];
          rec.postPress = snap;
          break;
        }
        rec.lastPressFail = sitRec.actionLine || null;
        if (/pack is full/i.test(sitRec.actionLine || '')) break;
        let stepped = null;
        try {
          const targets = Game.travelTargets ? (Game.travelTargets() || []) : [];
          const alt = targets.find(t => !(t.x === home.x && t.y === home.y) && !triedNodes.has(t.x + ',' + t.y));
          if (alt) {
            const before = Game.map.px + ',' + Game.map.py;
            try { Game.travelTo(alt.x, alt.y); } catch (e) {}
            stepped = { to: [alt.x, alt.y], moved: before !== (Game.map.px + ',' + Game.map.py) };
            if (stepped.moved) { rec.moved = true; triedNodes.add(alt.x + ',' + alt.y); rec.outHops.push(stepped); }
          }
        } catch (e) { stepped = { error: String(e && e.message).slice(0, 120) }; }
        if (!stepped || !stepped.moved) break;
        status = ensureAdjacent84(vid, rec);
        rec.afterRetryStatus = status;
      }
      if (pressedOk) {
        rec.homeHops = travelHome84();
        if (rec.homeHops.atHome) {
          const stH = ensureAdjacent84(vid, rec);
          rec.homeStatus = stH;
          if (stH && stH.ready && stH.action === 'forage_deliver') {
            const dRec = sit(vid, 'work');
            rec.deliver = { sitResult: dRec.result, actionLine: dRec.actionLine || null };
          }
        }
        rec.post = runSnap84(vid);
        rec.outcome = (rec.post && rec.post.returned)
          ? (rec.post.promiseKept === true ? 'worked-and-delivered-kept' : 'worked-and-delivered-missed')
          : 'pressed-not-delivered';
        travelOutLog.push(rec); return;
      }
      if (rec.moved) rec.homeHops = travelHome84();
      rec.post = runSnap84(vid);
      rec.outcome = 'unworked:' + ((rec.lastPressFail || (status && status.reason)) ? (rec.lastPressFail || status.reason).slice(0, 120) : 'no-status');
      travelOutLog.push(rec); return;
    } catch (e) {
      rec.error = String(e && e.message).slice(0, 200);
      try { if (rec.moved) rec.homeHops = travelHome84(); } catch (e2) {}
      rec.outcome = 'wedge-error';
      travelOutLog.push(rec);
    }
  }
  function wedgeDawn() {
    if (Game.over) return;
    try {
      const jl = jointLedger();
      const live = jl.find(j => j.live);
      // R136 instruments (every dawn, before any wedge action): jam-days
      // — a promised run exists while a broken-live run is live (the
      // r84 poison) — and broken-live water dawns (report-only; a water
      // end-wedge is a follow-up blank, not this run).
      const brokenLiveJ = jl.find(j => j.live && (j.state === 'broken' || j.promiseKept === 'broken'));
      const promisedJ = jl.find(j => j.promised);
      if (brokenLiveJ && promisedJ && String(brokenLiveJ.vid) !== String(promisedJ.vid)) jamLog.push({ day: nowDay(Game), promisedVid: String(promisedJ.vid), promisedName: promisedJ.name, brokenVid: String(brokenLiveJ.vid), brokenName: brokenLiveJ.name, kind: brokenLiveJ.kind });
      if (jl.some(j => j.live && j.kind === 'water_haul' && (j.state === 'broken' || j.promiseKept === 'broken'))) brokenWaterDawns++;
      if (live) {
        // R136 PILOT MODE: hold the first live forage run unworked so it
        // breaks at its deadline and the end-wedge has something to
        // close. Honest inaction only — no presses, no travel-out;
        // travel home for safety so the policy day never starts
        // stranded. The hold lifts the dawn the run breaks.
        if (PILOT_BREAK && live.kind === 'forage_help') {
          const favH = ((Game.state.village || {}).favorLedger || {})[live.vid];
          const pH = ((Game.state.village || {}).promises || {})[live.vid];
          const isBrokenH = !!(favH && (favH.state === 'broken' || (pH && pH.kept === 'broken')));
          if (!isBrokenH && (pilotBreakVid === null || pilotBreakVid === String(live.vid))) {
            if (pilotBreakVid === null) pilotBreakVid = String(live.vid);
            const holdRec = { day: nowDay(Game), vid: String(live.vid), name: live.name, kind: live.kind,
              pre: doorState83(live.vid), preRun: runSnap84(live.vid), preStatus: favorStatus84(live.vid),
              homeHops: null, post: null, outcome: 'pilot-break-hold', moved: false };
            const homeH = homePoint83();
            if (!(Game.map.px === homeH.x && Game.map.py === homeH.y)) { holdRec.homeHops = travelHome84(); holdRec.moved = true; }
            holdRec.post = runSnap84(live.vid);
            travelOutLog.push(holdRec);
            return;
          }
        }
        if (live.kind === 'forage_help') wedgeTravelOut(live);
        else { sit(live.vid, 'work'); travelOutLog.push({ day: nowDay(Game), vid: String(live.vid), name: live.name, kind: live.kind, outcome: 'skipped-water-kind' }); }
        return;
      }
      // R84 door-walk probe: a promised favor at dawn gets the door +
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
              probe.walk = (d0 > 1) ? walkToPartner84(promised.vid) : { steps: 0, squares: [], finalDist: d0, dayPartStart: Game.dayPart ?? null, dayPartEnd: Game.dayPart ?? null, stoppedReason: 'already-adjacent' };
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
      // R84 rotation fix (pilot finding): the r82 "fresh-first" pool never
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
  // R136 Q3 (spotter guard, carried): end-only foodXp snapshot, read-only
  // (r135 foodXpOf pattern: live getPerson record first, wrapper second).
  let foodXpEnd = null;
  try {
    foodXpEnd = ((Game.state.village || {}).roster || []).map(id => {
      let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      const vp = (() => { try { return (Game.villagePeople ? Game.villagePeople() : []).find(x => String(x.id) === String(id)); } catch (e) { return null; } })();
      const fx = (p && p.foodXp) || (vp && vp._src && vp._src.foodXp) || {};
      return { id: String(id), name: nameOf(Game, id), alive: !(p && p.dead),
        spotter: fx.spotter || 0, butcher: fx.butcher || 0, cook: fx.cook || 0,
        preserver: fx.preserver || 0, builder: fx.builder || 0 };
    });
  } catch (e) { foodXpEnd = null; }
  const out = { seed, run: 'r136', days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, startCensus,
    aliveAt40: (daily.find(x => x.day === 40) || daily[daily.length - 1] || {}).alive ?? null,
    aliveEnd: daily.length ? daily[daily.length - 1].alive : null,
    waveReached: wave, pantryKcalEnd: Math.round(pantryKcal(Game)),
    deaths, census, daily, dawnCalls, dawnOpportunities: dawnOpps, dawnLedgers, finalFavorLedger: finalLedger, saySignalLines,
    wedgeSits, doorWalkLog, travelOutLog, endLog, jamLog, brokenWaterDawns, pilotBreakVid, endDisabled,
    foodXpEnd,
    storeLog, commitLog, performLog, dawnOutingLines, jointLedgerEnd: (() => { try { return jointLedger(); } catch (e) { return null; } })(),
    favorTele: (() => { const counts = {}; for (const t of tele) if (t && typeof t.type === 'string' && t.type.includes('favor')) counts[t.type] = (counts[t.type] || 0) + 1; return counts; })() };
  fs.mkdirSync(EVID, { recursive: true });
  writeFileRetry(path.join(EVID, `journey-establishment-r136-seed${seed}.json`), JSON.stringify(out, null, 2));
  writeFileRetry(path.join(EVID, `journey-establishment-r136-convo-seed${seed}.txt`), convoLines.join('\n'));
  console.log(`SEED ${seed}: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${out.aliveEnd} aliveAt40=${out.aliveAt40} wave=${wave} deaths=${deaths.length} dawnCalls=${dawnCalls.filter(c => c.out && c.out.length).length} dawnOppDays=${dawnOpps.length} saySignals=${saySignalLines.length} pantryEnd=${out.pantryKcalEnd} wedgeSits=${wedgeSits.length} committed=${commitLog.filter(c => c.ok).length} askOffered=${wedgeSits.filter(s => s.askFavorOffered).length} favorActions=${wedgeSits.filter(s => s.result === 'favor-action').length} favorCancels=${wedgeSits.filter(s => s.result === 'favor-cancel').length} perform=${performLog.length} doorProbes=${doorWalkLog.length} doorDeparted=${doorWalkLog.filter(p => p.departed).length} travelOut=${travelOutLog.length} travelPressed=${travelOutLog.filter(t => t.press).length} travelDelivered=${travelOutLog.filter(t => t.post && t.post.returned).length} ended=${endLog.filter(e => e.outcome === 'ended' || e.outcome === 'end-via-deliver').length} endAttempts=${endLog.length} jamDays=${jamLog.length} brokenWaterDawns=${brokenWaterDawns} favorTele=${JSON.stringify(out.favorTele)}`);
  return out;
}

(async () => {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
})();
