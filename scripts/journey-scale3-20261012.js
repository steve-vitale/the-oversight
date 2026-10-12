#!/usr/bin/env node
// journey-scale3-20261012.js — SCALE leg: days 80-140, regional -> national -> global -> table approach.
//
// Question: can a competent player who actively courts the scale ladder reach
// national organically, feel the beats, and walk toward the table by day 140?
// Known walls going in: (a) 0 of 180 post-retune sims ever left 'village'
// organically (scale on-ramp); (b) food, not gear, is the binding mid-game
// constraint — villages hit national ~day 39 (pre-pacing) then starve mid-ambition.
//
// Method: scalecourt policy (competent + covenant-road courtship, proposes/answers/tends
// links, answers national/global beats) over DAYCAP=140, 4 seeds. Scale telemetry at
// checkpoints: scaleRank, viewership, links, foreign polities, tableSeat/deedGate,
// pantry + tribute/pool/tariff flow, deaths by cause. Scale beats captured in full
// text (SENSE-TESTING LAW: read the Regional Dawn, the national beats, the Watchers).
// Conversations on days 85/105/125 (people check). Census at end.
// Policy answers beats: national feast/mercy/swear/pact/sign (via scalecourt), global 'feast'.
//
// Usage: SEEDS=50001,50002 node scripts/journey-scale3-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [50001, 50002, 50003, 50004]);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { scalecourt } = require('./policies/scalecourt');

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-12');

// ---- per-seed globals ----
let capture = [];
let _currentSeed = null;
let _G = null;
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}

function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function scaleNow() { try { return _G.scaleRank ? _G.scaleRank() : null; } catch (e) { return null; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function popAlive() {
  try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; }
}
function viewership() { try { return (_G.havenViewership ? _G.havenViewership() : 0) || 0; } catch (e) { return 0; } }
function tableSeat() { try { return _G.tableSeat ? _G.tableSeat() : null; } catch (e) { return null; } }
function linksActive() {
  try {
    const ls = _G.hierarchyState ? _G.hierarchyState() : [];
    return ls.filter(l => l && l.status === 'active').length;
  } catch (e) { return 0; }
}
function foreignPolityCount() {
  try {
    const fp = _G.foreignPolities ? _G.foreignPolities() : [];
    return Array.isArray(fp) ? fp.length : 0;
  } catch (e) { return 0; }
}
function nationalLive() { try { return !!_G.state.nationalLive; } catch (e) { return false; } }
function globalLive() { try { return !!_G.state.globalLive; } catch (e) { return false; } }
function networkLive() { try { return !!_G.state.networkLive; } catch (e) { return false; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function waveOf(mid) {
  try {
    const d = (_G.data.monsters || []).find(m => m.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}

// ---- goInside: travelTo leaves the scholar outside the hall ----
function goInside() {
  try {
    const t = _G.playerTile ? _G.playerTile() : null;
    if (t && t.type === 'haven') {
      const s = _G.state.scholar;
      if (s && !s.insideHaven && !s.insideTent && _G.enterBuilding) _G.enterBuilding();
    }
  } catch (e) {}
}

// ---- fight driver (journey-deepening r5/r7 lineage: flee-boxed-safe, standoff-aware) ----
function finalizeFight(ctx) {
  const rec = ctx._fr;
  ctx._fr = null;
  if (!rec) return;
  try {
    const f = rec.obj;
    rec.rounds = f.round;
    rec.result = f.result;
    rec.over = !!f.over;
    const slice = capture.slice(rec.capStart).join('\n');
    rec.dmgLines = (slice.match(/\(\d+ damage\)/g) || []).length;
    for (const m of rec.monsters) {
      const w = m.wave || 1;
      ctx.fightsByWave = ctx.fightsByWave || {};
      ctx.fightsByWave[w] = (ctx.fightsByWave[w] || 0) + 1;
    }
    ctx.fightsLog.push(rec);
  } catch (e) {
    ctx.fightsLog.push({ id: rec.id, err: String(e && e.message), monsters: rec.monsters });
  }
}

function fightPolicy(G, ctx) {
  try {
    const f = G.tbfight;
    if (ctx._fr && (!f || f.id !== ctx._fr.id)) finalizeFight(ctx);
    if (!f || f.over || !G.tbIsPlayerTurn()) return false;
    if (!ctx._fr || ctx._fr.id !== f.id) {
      const mons = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      ctx._fr = {
        id: f.id, obj: f, day: gday(), capStart: capture.length,
        startRound: f.round || 0,
        hp0Total: mons.reduce((t, m) => t + (m.maxHp || m.hp || 0), 0),
        monsters: mons.map(m => ({ key: m.key, mid: m.monsterId, wave: waveOf(m.monsterId), hp0: m.maxHp || m.hp })),
      };
      ctx.fightsStarted = (ctx.fightsStarted || 0) + 1;
    }
    const p = G.tbFighter('p');
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    const endTurn = () => {
      try { const q = G.tbFighter('p'); q.moveLeft = 0; q.acted = true; G.tbAfterPlayerAction(); } catch (e) {}
    };
    const flee = () => {
      try {
        const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
        const dirs = [];
        if (px === 0) dirs.push([-1, 0]);
        if (px === 8) dirs.push([1, 0]);
        if (py === 0) dirs.push([0, -1]);
        if (py === 8) dirs.push([0, 1]);
        if (G.tbBarrierExit) {
          for (const [dx, dy] of dirs) {
            try { if (G.tbBarrierExit(dx, dy)) { ctx.fled = (ctx.fled || 0) + 1; return true; } } catch (e) {}
          }
        }
        try {
          let sx = px, sy = py;
          if (py === 0 || py === 8) sx = px <= 4 ? Math.max(0, px - 1) : Math.min(8, px + 1);
          else sy = py <= 4 ? Math.max(0, py - 1) : Math.min(8, py + 1);
          if (sx === px && sy === py) sx = px <= 4 ? 0 : 8;
          const tryStep = (tx, ty) => {
            try {
              if (tx < 0 || tx > 8 || ty < 0 || ty > 8) return false;
              let path = null;
              try { path = G.findPath ? G.findPath(px, py, tx, ty) : [1]; } catch (e2) { path = null; }
              if (!path) return false;
              const before = p.mx + ',' + p.my;
              G.tbPlayerMove(tx, ty);
              return (p.mx + ',' + p.my) !== before;
            } catch (e2) { return false; }
          };
          let moved = tryStep(sx, sy);
          if (!moved) {
            for (let dx = -1; dx <= 1 && !moved; dx++) for (let dy = -1; dy <= 1 && !moved; dy++) {
              if (!dx && !dy) continue;
              moved = tryStep(px + dx, py + dy);
            }
            if (!moved) ctx.fleeBoxed = (ctx.fleeBoxed || 0) + 1;
          }
        } catch (e) {}
      } catch (e) {}
      endTurn();
      return true;
    };
    if (ctx._fightObjD !== f) {
      ctx._fightObjD = f;
      try {
        const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        let totalMhp = 0, maxWave = 1;
        for (const m of monsters) {
          totalMhp += m.maxHp || m.hp || 0;
          maxWave = Math.max(maxWave, waveOf(m.monsterId));
        }
        const pmax = p.maxHp || 100;
        const outmatched = (totalMhp > 4 * pmax ||
          (maxWave >= 3 && hpPct < 0.6) ||
          (maxWave >= 2 && hpPct < 0.5) ||
          hpPct < 0.5);
        if (outmatched && monsters.length) { ctx.fledScale = (ctx.fledScale || 0) + 1; return flee(); }
      } catch (e) {}
    }
    if (hpPct < 0.35) return flee();
    const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
    if (!alive.length) return false;
    if (ctx._standoff === f.id) return false;
    if (ctx._fr && (f.round || 0) - (ctx._fr.startRound || 0) > 40) {
      const curHp = alive.reduce((t, m) => t + (m.hp || 0), 0);
      if (curHp >= (ctx._fr.hp0Total || 1) * 0.9) {
        const sealed = !!(f.noFlee || (G.state || {}).arenaContest);
        const roundsIn = (f.round || 0) - (ctx._fr.startRound || 0);
        if (roundsIn > 120 && (sealed || (ctx.fleeBoxed || 0) > 20)) {
          ctx._standoff = f.id;
          ctx.standoffs = (ctx.standoffs || 0) + 1;
          return false;
        }
        ctx.stalemateFled = (ctx.stalemateFled || 0) + 1;
        return flee();
      }
    }
    alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
    const tgt = alive[0];
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
    try {
      const w = (G.equippedWeapon && G.equippedWeapon()) || { range: 1 };
      const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
      if (d0 > (w.range || 1)) {
        const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const cx = tmx + dx, cy = tmy + dy;
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (occupied.has(cx + ',' + cy)) continue;
          const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
          if (dd < bd) { bd = dd; bx = cx; by = cy; }
        }
        if (bx != null) { try { G.tbPlayerMove(bx, by); } catch (e) {} ctx.closed = (ctx.closed || 0) + 1; }
        endTurn();
        return true;
      }
    } catch (e) {}
    try { G.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
    endTurn();
    return true;
  } catch (e) { return false; }
}

function contestPolicy(G, ctx) {
  try {
    const ac = G.state && G.state.activeContest;
    if (!ac || ac.phase === 'done' || ac.arenaSuspended) return false;
    ctx.contestCalls = (ctx.contestCalls || 0) + 1;
    if (ctx.contestCalls > 600) { ctx.contestNote = 'contest call cap hit'; return false; }
    const phases = ac.phases || [];
    const pi = ac.phaseIdx || 0;
    const nChoices = ((phases[pi] || {}).choices || []).length;
    if (!nChoices) return false;
    ctx._cxIdx = ctx._cxIdx == null ? 0 : ctx._cxIdx;
    const idx = ctx._cxIdx % nChoices;
    let ret;
    try { ret = G.contestChoose(idx); } catch (e) { ctx._cxIdx++; return true; }
    const ac2 = G.state && G.state.activeContest;
    if (ac2 && ac2.phase !== 'done' && (ac2.phaseIdx || 0) === pi) {
      ctx._cxStuck = (ctx._cxStuck || 0) + 1;
      if (ctx._cxStuck >= 3) { ctx._cxIdx++; ctx._cxStuck = 0; ctx.contestStuck = (ctx.contestStuck || 0) + 1; }
    } else {
      ctx._cxStuck = 0;
    }
    return true;
  } catch (e) { return false; }
}

// ---- conversation driver (engage-first, 8 turns) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
const CONVO_DAYS = [85, 105, 125];
function runConversation(day, vid) {
  const fp = `/tmp/journey-scale3-transcript-${_currentSeed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = _G.npcMood ? _G.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood} scale=${scaleNow()}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

// ---- census ----
function deathsSoFar() {
  try { return (_G.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = _G.agencyOf ? _G.agencyOf(id) : null; } catch (e) {}
    let mood = null;
    try { mood = _G.npcMood ? _G.npcMood(id) : null; } catch (e) {}
    let abils = 0;
    try { const pk = _G.state.villagerAbilities || {}; abils = ((pk[id] || {}).slots || []).filter(Boolean).length; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
      abilitySlots: abils,
    };
  });
}

// ---- policy: scalecourt base + scale-leg instrumentation ----
function makePolicy() {
  const policy = Object.assign({}, scalecourt);
  policy.id = 'journey-scale3';
  policy.setup = function (G, ctx) {
    try { scalecourt.setup && scalecourt.setup(G, ctx); } catch (e) {}
    try { competent.setup && competent.setup(G, ctx); } catch (e) {}
    policy._ctx = ctx;
    ctx.fightsLog = [];
    ctx.scaleBeats = [];      // {day, beat, how, scale, text:[lines]} — sense-testing captures
    ctx.scaleTrack = [];      // per-day: scale, viewership, links, pantry, pop, wave
    ctx.checkpoints = [];
    ctx._fr = null;
    ctx.convoFiles = [];
    ctx.beatWatch = {};
    installBeatWraps(_G, ctx);
  };
  policy.upkeep = function (G, ctx) {
    goInside();
    try { scalecourt.upkeep && scalecourt.upkeep(G, ctx); } catch (e) {}
  };
  policy.daily = function (G, ctx) {
    goInside();
    // scalecourt.daily runs competent.daily + courtship (proposes/answers/tends)
    scalecourt.daily(G, ctx);
    // wrap answers in beat capture: pendingNational / pendingGlobal / pendingAccord
    // were handled by courtship above; capture the beat text that followed.
    // (courtship runs before our wrap, so detect a "beat staged" transition via flags.)
    const day = gday();
    if (ctx._lastScaleBeatCheck === day) { /* once per day is enough */ }
    else {
      ctx._lastScaleBeatCheck = day;
      // record beat transitions: capture any pendingNational/pendingGlobal answer results
      // by diffing known state markers
    }
    // scale trajectory, one row/day (cheap, plain fields)
    ctx.scaleTrack.push({
      day, scale: scaleNow(), vw: viewership(), links: linksActive(),
      foreign: foreignPolityCount(), pantry: Math.round(pantryKcal()), pop: popAlive(), wave: waveNow(),
      national: nationalLive(), global: globalLive(), network: networkLive(),
    });
    // checkpoints
    if ([40, 60, 80, 100, 120, 140].includes(day)) {
      let seat = null, seatDetail = null;
      try { const s = tableSeat(); seat = s && s.seat; seatDetail = s && s.detail; } catch (e) {}
      let crisesN = null, foodDeeds = null, sentimentTaught = null;
      try {
        const ps = G.progState ? G.progState() : null;
        crisesN = ps && ps.crises ? Object.keys(ps.crises).length : 0;
        foodDeeds = !!(ps && ps.sentimentTaught && G.state.scholar && G.state.scholar.prog && G.state.scholar.prog.feastSurgeUsed);
        sentimentTaught = !!(ps && ps.sentimentTaught);
      } catch (e) {}
      ctx.checkpoints.push({
        day, scale: scaleNow(), viewership: viewership(), links: linksActive(),
        foreignPolities: foreignPolityCount(), pantry: Math.round(pantryKcal()), pop: popAlive(),
        wave: waveNow(), national: nationalLive(), global: globalLive(),
        seat, seatDetail,
        crisesN, foodDeeds, sentimentTaught,
        crisesKinds: (function () { try { return Object.keys((G.progState() || {}).crises || {}); } catch (e) { return []; } })(),
        wavesFaced: (function () { try { const d2 = G.deedState ? G.deedState() : null; return d2 && d2.wavesFaced ? JSON.parse(JSON.stringify(d2.wavesFaced)) : null; } catch (e) { return null; } })(),
        contestsSurvived: (function () { try { const d2 = G.deedState ? G.deedState() : null; return d2 && d2.contestsSurvived; } catch (e) { return null; } })(),
        integrationStage: (function () { try { return G.integrationStage ? G.integrationStage() : null; } catch (e) { return null; } })(),
      });
    }
    // conversations on leg days (people check)
    if (CONVO_DAYS.includes(day)) {
      let vid = null;
      try {
        const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) {}
      if (vid) {
        try { ctx.convoFiles.push(runConversation(day, vid)); } catch (e) {}
      }
    }
  };
  policy.fight = function (G, ctx) { return fightPolicy(G, ctx); };
  policy.contest = function (G, ctx) { return contestPolicy(G, ctx); };
  return policy;
}

// Wrap the scale-beat answering paths so beat TEXT is captured (sense testing).
function installBeatWraps(G, ctx) {
  const watch = (name, fnName) => {
    try {
      const orig = G[fnName];
      if (typeof orig !== 'function') return;
      G[fnName] = function (...args) {
        const cap0 = capture.length;
        let r;
        try { r = orig.apply(this, args); } catch (e) { r = { err: String(e && e.message) }; }
        const text = capture.slice(cap0, cap0 + 40).filter(s => s && s.trim());
        ctx.scaleBeats.push({ day: gday(), beat: name, args: args.map(a => String(a)).slice(0, 3), scale: scaleNow(), text });
        return r;
      };
    } catch (e) {}
  };
  watch('accord', 'answerAccord');
  watch('counter', 'answerCounter');
  watch('national', 'answerNationalChoice');
  watch('global', 'answerGlobalChoice');
  watch('link-propose', 'proposeLink');
  watch('covenant-propose', 'proposeCovenant');
  watch('trade-propose', 'proposeTrade');
  watch('raid', 'raidVillage');
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  console.log(`\n########## SEED ${seed} ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale3', fullTelemetry: true });
  _G = Game;
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-scale3', date: new Date().toISOString().slice(0, 10), node: process.version } });
  if (policy._ctx && policy._ctx._fr) finalizeFight(policy._ctx);
  const ctx = policy._ctx || {};
  let waveKills = null, villageSlain = null, wavesFaced = null;
  try { waveKills = JSON.parse(JSON.stringify(Game.state.waveKills || {})); } catch (e) {}
  try { villageSlain = JSON.parse(JSON.stringify(Game.state.villageSlain || {})); } catch (e) {}
  try { const ds = Game.deedState ? Game.deedState() : null; wavesFaced = JSON.parse(JSON.stringify((ds && ds.wavesFaced) || {})); } catch (e) {}
  const track = ctx.scaleTrack || [];
  const scaleDays = {};
  for (const row of track) {
    if (!scaleDays[row.scale] && row.scale) scaleDays[row.scale] = row.day;
  }
  const out = {
    seed, maxGameDay: result.gameDays, endReason: result.endReason,
    scaleDays, finalScale: scaleNow(), wave: waveNow(),
    checkpoints: ctx.checkpoints || [],
    wavesFaced,
    census: buildCensus(),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    scaleBeats: (ctx.scaleBeats || []).map(b => ({
      day: b.day, beat: b.beat, args: b.args, scale: b.scale,
      text: (b.text || []).join('\n').slice(0, 4000),
    })),
    convoFiles: ctx.convoFiles || [],
    fightsByWave: ctx.fightsByWave || {}, fightsTotal: (ctx.fightsLog || []).length,
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fledScale: ctx.fledScale || 0,
      stalemateFled: ctx.stalemateFled || 0, fightsStarted: ctx.fightsStarted || 0,
      standoffs: ctx.standoffs || 0,
      courtAccords: ctx.courtAccords || 0, courtCounters: ctx.courtCounters || 0,
      courtNational: ctx.courtNational || 0, courtGlobal: ctx.courtGlobal || 0,
      proposed: ctx.proposed || 0, proposedPeer: ctx.proposedPeer || 0,
      defenseCalls: ctx.defenseCalls || 0, tributePaid: ctx.tributePaid || 0,
      poolPaid: ctx.poolPaid || 0,
    },
    contestStuck: ctx.contestStuck || 0, contestCalls: ctx.contestCalls || 0,
    pacing: result.pacing,
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-scale3-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  const cps = (ctx.checkpoints || []).map(c => `d${c.day}:${c.scale}(vw${c.viewership})`).join(' ');
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} scale=${scaleNow()} ${cps} pop=${popAlive()} ms=${result.ms} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const s of summary) {
    if (s.fatal) { console.log(`seed ${s.seed}: FATAL ${s.fatal}`); continue; }
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} scale=${s.finalScale} scaleDays=${JSON.stringify(s.scaleDays)} beats=${(s.scaleBeats || []).length} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
