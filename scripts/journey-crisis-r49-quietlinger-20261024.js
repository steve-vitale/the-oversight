#!/usr/bin/env node
// journey-crisis-r49-quietlinger-20261024.js — CRISIS LEG (6) r49: THE QUIET LINGERER.
// Direct handoff from r48's TWO open items: (1) the tracer gap — the 9405
// Ugly Beast's linger→wander transition was voiced by the game but NOT
// recorded by the r48 tracer (outside the five wrapped ticks); (2) quiet
// lingerers — drafted lingerers that never gorged and never got an unmet
// line (r48: 9406 callback, 9408 focus_group), persisting with no voice.
// This run keeps r48's tick tracer AND adds a DAY-BOUNDARY census (which no
// tick can dodge), per-day display-name gorge attribution, and post-drift
// wild-fight tracking, so every lingerer exit gets a named explanation.
// OBSERVE-ONLY: no callForHelp intervention; the measurement must not
// perturb the crisis.
//
// PRE-REGISTRATION: hidden_files/evidence/2026-10-24/journey-crisis-r49-prereg.md
// Usage: SEED=9405 node scripts/journey-crisis-r49-quietlinger-20261024.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '9405', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24';

const RAID_RE = /🐗 RAID —/;
const DEFENSE_BEAT_RE = /🛡️ .* met them at the door/;
const UNMET_RE = /Nobody met .* — it's still out there at the treeline/;
const GORGE_RE = /🌙 Night\. The lingering .* gorges at the treeline/;
const SORTIE_RE = /⚔️ .* faced .* at the treeline/;
const AID_RAISE_RE = /🚨 .* is at Haven's door/;
const AID_QUIET_FOUGHT_RE = /The door is quiet\. Haven breathes/;
const AID_QUIET_MOVEDON_RE = /has moved on — or found easier meat/;
const MOURN_RE = /mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|first grave|we buried|laid to rest|succumbed to|didn't come back/i;
const FABRIC_RE = /we've always|since the beginning|you remember when|like old times|remember the old|back when we|for as long as/i;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e) { return 0; }
}
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingCount(Game) {
  try {
    return (Game.state.village.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } }).length;
  } catch (e) { return 1; }
}
function mems(Game, vid) {
  try { return (typeof Game.t2mem === 'function' ? Game.t2mem(vid) : []) || []; } catch (e) { return []; }
}

function driveConvo(Game, vid, tag, out) {
  out.push(`## ${tag} — talking to ${rawName(Game, vid)} (d${dayOf(Game)})`);
  const npcLines = [];
  let opened;
  try { opened = Game.startConvo(vid); } catch (e) { out.push(`(startConvo threw: ${e.message})`); return npcLines; }
  if (!opened || opened.refused || opened.ended) { out.push(`(conversation refused/ended)`); return npcLines; }
  for (let t = 0; t < 12; t++) {
    let choices;
    try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = (t === 0) ? choices.find(c => c.id === 'ask:lately') : null;
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /raid|siege|treeline|muster|afraid|worried|dead|died|gone|mourn|fight|defend|monster|shelter/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 90)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    let c;
    try { c = Game.convoGet(vid); } catch (e) { break; }
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    for (const e of (c.transcript || []).slice(-2)) {
      out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 420)}`);
      if (e.who !== 'you') npcLines.push(String(e.text));
    }
    out.push('');
    if (t >= 3 && pick.id === 'ask:lately') break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return npcLines;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-quietlinger-r49', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, days: 0, endReason: '',
    raids: [],            // {day, line}
    aidRaises: [],        // {day, name, wave, raidersFlag}
    aidResolutions: [],   // {day, how}
    defenseBeats: [],     // {day, line}
    defendedFights: [],   // {day, vid, name, monster, outcome} via resolveWildMonsterEncounter wrap
    unmetRaiders: [],     // {day, line}
    gorgeNights: [],      // {day, line}
    sorties: [],          // {day, line}
    lingerDaily: [],      // {day, n}
    aidCalls: [],         // {day, tier, result}
    deaths: [],
    sayLines: [],
    convosDriven: [],
    fabricHits: [], mournLines: [],
    census: null,
    removals: [],       // removeWorldMonster wrap: {day, id, hp, lingering, tx, ty, stack}
    tickEvents: [],     // lingering-set leavers per tick wrap: {day, tick, id, hpBefore, hpAfter, stillPresent, lingeringAfter, cls, removal?}
    drafted: [],        // newly lingering per tick wrap: {day, tick, id, hp, tx, ty} (draft-time hp for M4)
    tickWrapsMissing: [], // tick methods absent on Game (tracer blind spot if non-empty)
    gorgeUnmatched: 0, gorgeAmbiguous: 0,
    dayBoundaryExits: null, wildFights: null, quietLingerers: null,
  };

  // ---- say capture ----
  const _say = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const day = dayOf(Game), line = String(t);
      rec.sayLines.push({ day, line });
      if (RAID_RE.test(line)) rec.raids.push({ day, line: line.slice(0, 200) });
      if (DEFENSE_BEAT_RE.test(line)) rec.defenseBeats.push({ day, line: line.slice(0, 300) });
      if (UNMET_RE.test(line)) rec.unmetRaiders.push({ day, line: line.slice(0, 200) });
      if (GORGE_RE.test(line)) rec.gorgeNights.push({ day, line: line.slice(0, 200) });
      if (SORTIE_RE.test(line)) rec.sorties.push({ day, line: line.slice(0, 200) });
      if (AID_RAISE_RE.test(line)) {
        // the aidRaise record itself is captured by the raiseAidCrisis wrap
        // (below) — the flag is read on a microtask after the wrapper returns
      }
      if (AID_QUIET_FOUGHT_RE.test(line)) rec.aidResolutions.push({ day, how: 'fought' });
      if (AID_QUIET_MOVEDON_RE.test(line)) rec.aidResolutions.push({ day, how: 'moved-on' });
      if (MOURN_RE.test(line)) rec.mournLines.push({ day, line: line.slice(0, 200) });
      if (FABRIC_RE.test(line)) rec.fabricHits.push({ day, line: line.slice(0, 160) });
    } catch (e) {}
    return _say(t);
  };

  // ---- aid crisis capture: wrap raiseAidCrisis ----
  // havenRaidTick sets crisis.raiders=true synchronously AFTER raiseAidCrisis
  // returns, so the flag is read on a microtask: the sync stack completes
  // (flag set) before the microtask runs. The one-time competent
  // callForHelp('runner') also goes in the microtask — while the raid crisis
  // is live, before commsTick can resolve it at dawn.
  const _raiseAC = Game.raiseAidCrisis ? Game.raiseAidCrisis.bind(Game) : null;
  if (_raiseAC) {
    Game.raiseAidCrisis = function (name, wave) {
      let r;
      try { r = _raiseAC(name, wave); } catch (e) { r = null; }
      if (!r) return r; // "one crisis at a time" — no new crisis
      const entry = { day: dayOf(Game), name: String(name || '?'), wave: (wave || null), raidersFlag: false };
      rec.aidRaises.push(entry);
      // TRAP the raiders flag synchronously: havenRaidTick sets
      // crisis.raiders=true on this exact object right after raiseAidCrisis
      // returns, but the crisis may resolve before any microtask drains —
      // so intercept the assignment itself, not a later read.
      try {
        let flagVal = false;
        Object.defineProperty(r, 'raiders', {
          configurable: true,
          get() { return flagVal; },
          set(v) { flagVal = !!v; entry.raidersFlag = !!v; if (process.env.R47DEBUG) { try { fs.appendFileSync('/tmp/r47trap.log', JSON.stringify({ day: entry.day, setterFired: true, v: !!v }) + '\n'); } catch (e) {} } },
        });
        if (process.env.R47DEBUG) { try { fs.appendFileSync('/tmp/r47trap.log', JSON.stringify({ day: entry.day, trapInstalled: true, extensible: Object.isExtensible(r) }) + '\n'); } catch (e) {} }
      } catch (e) {
        if (process.env.R47DEBUG) { try { fs.appendFileSync('/tmp/r47trap.log', JSON.stringify({ day: entry.day, trapInstallFailed: String(e && e.message).slice(0, 80) }) + '\n'); } catch (ee) {} }
      }
      Promise.resolve().then(() => {
        try {
          let c = null;
          try { c = Game.aidCrisis ? Game.aidCrisis() : null; } catch (e) {}
          // NB: entry.raidersFlag is captured SYNCHRONOUSLY by the raiders
          // setter trap above — never overwrite it from a possibly-nulled
          // live read (fast-resolved crises are null by microtask time).
          if (c) {
            entry.name = c.name;
            entry.wave = c.wave;
            entry.raidersFlag = !!c.raiders;
          }
          // r48 OBSERVE-ONLY: no callForHelp intervention. r47 proved the
          // call chain (runner sent 3/4, died 1/4); intervening here would
          // perturb the vanish hunt (aid marches change the treeline).
        } catch (e) {}
      }).catch(() => {});
      return r;
    };
  }
  // ---- defender fight capture: wrap resolveWildMonsterEncounter ----
  const _rwme = Game.resolveWildMonsterEncounter ? Game.resolveWildMonsterEncounter.bind(Game) : null;
  if (_rwme) {
    Game.resolveWildMonsterEncounter = function (vid, m, opts) {
      let rec2 = null;
      try { rec2 = _rwme(vid, m, opts); } catch (e) { rec2 = null; }
      try {
        // r49: record EVERY wild fight with object identity, so a drifted
        // lingerer fought in the wild afterwards is the wander capture.
        if (rec2) wildFights.push({ day: dayOf(Game), obj: m, raid: !!(opts && opts.raid), outcome: rec2.outcome || '?' });
        if (opts && opts.raid && rec2) {
          let sheltered = null;
          try { sheltered = Game.isSheltered ? !!Game.isSheltered(vid) : null; } catch (e) {}
          rec.defendedFights.push({
            day: dayOf(Game), vid: String(vid), name: rawName(Game, vid),
            monster: (m && (m.id || m.name)) || '?', outcome: rec2.outcome || '?',
            vTaken: rec2.vTaken || 0, sheltered,
          });
        }
      } catch (e) {}
      return rec2;
    };
  }

  // ---- resolveAidCrisis capture ----
  const _rac = Game.resolveAidCrisis ? Game.resolveAidCrisis.bind(Game) : null;
  if (_rac) {
    Game.resolveAidCrisis = function (how) {
      let r;
      try { r = _rac(how); } catch (e) { r = null; }
      try { rec.aidResolutions.push({ day: dayOf(Game), how: String(how), via: 'wrap' }); } catch (e) {}
      return r;
    };
  }

  // ---- r49 DAY-BOUNDARY + QUIET-LINGERER TRACKING (on top of r48's tracer) ----
  // Object-identity tracking: ids repeat across entities, so the track key
  // is the monster object itself. Per-day display names let gorge/unmet
  // lines be attributed to the right beast despite renames.
  const DRIFT_RE = /paces the treeline one last night/;
  const MOVEDON_RE = /has moved on — or found easier meat/;
  const SORTIE_FLEE_RE = /breaks and runs — the treeline is clear of it/;
  const lingerTrack = new Map(); // obj -> {id, draftDay, names:{day:name}, gorge:0, unmet:false, exitDay, exitKind}
  const dayBoundaryExits = [];   // {day, id, name, stillPresent, hp, cls, tickEvent, voice}
  const wildFights = [];         // every resolveWildMonsterEncounter: {day, obj, raid, outcome}
  let prevDayLinger = new Map(); // obj -> {id, name} at previous day boundary
  function displayNameOf(obj) {
    try { return (Game.monsterDisplayName && Game.monsterDisplayName(obj.id)) || obj.id; } catch (e) { return obj.id; }
  }
  function trackGet(obj, day) {
    let t = lingerTrack.get(obj);
    if (!t) { t = { id: obj.id, draftDay: day, names: {}, gorge: 0, unmet: false, exitDay: null, exitKind: null, boundaryDays: 0, draftName: null }; lingerTrack.set(obj, t); }
    return t;
  }
  // Precise gorge attribution: havenGrowthDaily's linger loop says one line
  // per lingering monster IN worldMonsters() ORDER (drift line, table-skip
  // silence, or gorge line). Intercepting say during that call and aligning
  // lines to the pre-call list beats display-name matching (renames and
  // same-name duplicates made name matching ambiguous on the pilot).
  function alignGorgeLines(preList, saidLines, tableActive) {
    let li = 0, aligned = 0;
    for (const obj of preList) {
      const t = lingerTrack.get(obj);
      const line = saidLines[li];
      if (!line) break;
      if (DRIFT_RE.test(line)) { li++; continue; }
      if (GORGE_RE.test(line)) { if (t) { t.gorge++; aligned++; } li++; continue; }
      // Any other line: not a loop line (table-skip silence means the next
      // loop line belongs to the NEXT monster only if this monster skipped;
      // tableActive skips say nothing, so advance the monster, not the line).
      if (tableActive) continue;
      // Non-table, non-loop line: stop aligning rather than misattributing.
      break;
    }
    return aligned;
  }
  function snapshotDayNames(day) {
    try {
      for (const m of (Game.worldMonsters() || [])) {
        if (m && m.lingering) { const t = trackGet(m, day); t.names[day] = displayNameOf(m); }
      }
    } catch (e) {}
  }
  function attributeDayLines(day, sayToday) {
    // UNMET attribution only (gorge is attributed precisely by the
    // havenGrowthDaily alignment wrapper — name matching double-counted
    // and went ambiguous on same-name duplicates). An unmet line and its
    // draft happen in the SAME havenRaidTick call, so stamps match: match
    // the line against draft names of objects drafted that day.
    for (const s of sayToday) {
      if (!UNMET_RE.test(s.line)) continue;
      for (const d of rec.drafted) {
        if (d.day !== s.day) continue;
        for (const [obj, t] of lingerTrack) {
          if (t.draftDay === d.day && t.draftName && s.line.indexOf(t.draftName) !== -1) t.unmet = true;
        }
      }
    }
  }
  function dayBoundaryCensus(day, sayToday) {
    const now = new Map();
    try {
      for (const m of (Game.worldMonsters() || [])) {
        if (m && m.lingering) {
          now.set(m, { id: m.id, name: displayNameOf(m) });
          const t = trackGet(m, day);
          t.boundaryDays = (t.boundaryDays || 0) + 1;
          if (!t.names[day]) t.names[day] = displayNameOf(m);
        }
      }
    } catch (e) {}
    for (const [obj, prev] of prevDayLinger) {
      if (now.has(obj)) continue;
      const t = lingerTrack.get(obj) || { id: prev.id, names: {}, gorge: 0, unmet: false };
      const worldNow = (() => { try { return Game.worldMonsters() || []; } catch (e) { return []; } })();
      const still = worldNow.indexOf(obj) !== -1;
      const hp = still ? (obj.hp || 0) : null;
      // Dawn-boundary tolerance: tick/removal stamps may carry the
      // pre-advance day, so match day or day-1 (voice classes are checked
      // first below, so a stale tick match cannot mask a voiced close).
      const tickEv = rec.tickEvents.filter(e => (e.day === day || e.day === day - 1) && e.id === prev.id).slice(-1)[0] || null;
      const removal = rec.removals.filter(x => (x.day === day || x.day === day - 1) && x.id === prev.id).slice(-1)[0] || null;
      const driftVoice = sayToday.find(s => DRIFT_RE.test(s.line)) || null;
      const movedVoice = sayToday.find(s => MOVEDON_RE.test(s.line)) || null;
      const sortieLine = sayToday.find(s => SORTIE_RE.test(s.line) || SORTIE_FLEE_RE.test(s.line)) || null;
      let cls = 'unexplained', voice = null;
      if (removal) { cls = 'spliced'; }
      else if (driftVoice) { cls = 'drift-voiced'; voice = driftVoice.line.slice(0, 160); }
      else if (movedVoice) { cls = 'movedon-voiced'; voice = movedVoice.line.slice(0, 160); }
      else if (sortieLine) { cls = 'sortie'; voice = sortieLine.line.slice(0, 160); }
      else if (tickEv) { cls = 'tick-' + (tickEv.cls || '?'); }
      else if (still && (hp || 0) <= 0) { cls = 'hp-zero'; }
      else if (!still) { cls = 'gone-no-record'; }
      t.exitDay = day; t.exitKind = cls;
      if (cls === 'drift-voiced' || (tickEv && tickEv.cls === 'flag-cleared' && driftVoice)) t.drifted = true;
      dayBoundaryExits.push({ day, id: prev.id, name: prev.name, stillPresent: still, hp, cls, tickEvent: tickEv ? tickEv.cls : null, removal: !!removal, voice });
    }
    prevDayLinger = now;
  }
  // ---- r48 LINGERER TRACER (r47's open blank: s9405 d85 silent vanish) ----
  // A lingerer that leaves the lingering set between two ticks is pinned to
  // the exact tick boundary; the removeWorldMonster wrap names the splicer.
  // Classes: spliced-or-replaced (gone from worldMonsters + removal record),
  // flag-cleared (present, lingering=false, hp>0), hp-zero (present, hp<=0
  // — dawn loop + commsTick both treat this as no-threat, so it LOOKS like
  // a vanish), other (unexplained: array identity change / state reload).
  function lingerSnap() {
    const out = new Map();
    try {
      for (const m of (Game.worldMonsters() || [])) {
        if (m && m.lingering) out.set(m, { id: m.id, hp: m.hp || 0, tx: m.tx, ty: m.ty, lingerSince: m.lingerSince });
      }
    } catch (e) {}
    return out;
  }
  function classifyLeft(before, after, worldNow) {
    const evs = [];
    for (const [obj, b] of before) {
      if (after.has(obj)) continue;
      const still = worldNow.indexOf(obj) !== -1;
      const hpNow = still ? (obj.hp || 0) : null;
      const lingNow = still ? !!obj.lingering : null;
      let cls = 'other';
      if (!still) cls = 'spliced-or-replaced';
      else if (lingNow) cls = 'still-lingering?';
      else if ((hpNow || 0) <= 0) cls = 'hp-zero';
      else cls = 'flag-cleared';
      const ev = { id: b.id, hpBefore: b.hp, hpAfter: hpNow, stillPresent: still, lingeringAfter: lingNow, cls };
      if (!still) ev.removal = rec.removals.filter(x => x.id === ev.id).slice(-1)[0] || null;
      evs.push(ev);
    }
    return evs;
  }
  function traceTick(label, fnName) {
    const orig = Game[fnName] ? Game[fnName].bind(Game) : null;
    if (!orig) { rec.tickWrapsMissing.push(fnName); return; }
    Game[fnName] = function (...args) {
      const before = lingerSnap();
      let r = null;
      try { r = orig(...args); } catch (e) { r = null; }
      try {
        const after = lingerSnap();
        const worldNow = Game.worldMonsters() || [];
        for (const ev of classifyLeft(before, after, worldNow)) {
          ev.day = dayOf(Game); ev.tick = label;
          rec.tickEvents.push(ev);
        }
        for (const [obj, a] of after) {
          if (!before.has(obj)) {
            rec.drafted.push({ day: dayOf(Game), tick: label, id: a.id, hp: a.hp, tx: a.tx, ty: a.ty });
            const t = trackGet(obj, dayOf(Game));
            if (!t.draftName) t.draftName = displayNameOf(obj);
          }
        }
      } catch (e) {}
      return r;
    };
  }
  traceTick('havenRaidTick', 'havenRaidTick');
  traceTick('havenGrowthDaily', 'havenGrowthDaily');
  traceTick('commsTick', 'commsTick');
  traceTick('wanderWorldMonsters', 'wanderWorldMonsters');
  traceTick('villagerMonsterTick', 'villagerMonsterTick');
  // r49 alignment wrapper OUTSIDE the generic havenGrowthDaily tick wrap:
  // say interception here covers the whole call; the generic wrap's
  // snapshots say nothing, so order is safe.
  try {
    const _hgd = Game.havenGrowthDaily.bind(Game);
    Game.havenGrowthDaily = function (...args) {
      const pre = (() => { try { return (Game.worldMonsters() || []).filter(m => m && m.lingering); } catch (e) { return []; } })();
      const said = [];
      const _sayCur = Game.say.bind(Game);
      Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return _sayCur(t); };
      let r = null;
      try { r = _hgd(...args); } catch (e) { r = null; }
      Game.say = _sayCur;
      try {
        let tableActive = false;
        try { tableActive = !!(Game.tableActive && Game.tableActive()); } catch (e) {}
        rec.gorgeAligned = (rec.gorgeAligned || 0) + alignGorgeLines(pre, said, tableActive);
      } catch (e) {}
      return r;
    };
  } catch (e) { rec.hgdWrapFailed = String(e && e.message || e); }
  // ---- removeWorldMonster wrap: name every splicer ----
  const _rwm = Game.removeWorldMonster ? Game.removeWorldMonster.bind(Game) : null;
  if (_rwm) {
    Game.removeWorldMonster = function (m) {
      try {
        let stackTop = '';
        try {
          stackTop = (new Error().stack || '').split('\n').slice(2, 7)
            .filter(l => /src\/js/.test(l)).join(' | ').slice(0, 300);
        } catch (e) {}
        rec.removals.push({ day: dayOf(Game), id: m && m.id, hp: m && (m.hp || 0), lingering: !!(m && m.lingering), tx: m && m.tx, ty: m && m.ty, stack: stackTop });
      } catch (e) {}
      return _rwm(m);
    };
  } else rec.tickWrapsMissing.push('removeWorldMonster');

  const policy = {
    id: 'crisis-journey-r49',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      // NB: the aid-crisis backfill + one-time runner call live in the
      // raiseAidCrisis wrapper's microtask (see above) — nothing to do here.
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try {
        // linger daily count
        let n = 0;
        try { n = (Game.worldMonsters() || []).filter(m => m.lingering).length; } catch (e) {}
        rec.lingerDaily.push({ day: dayOf(Game), n });
      } catch (e) {}
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };

  let convosThisRun = 0, raidConvoDone = new Set();
  let deadTail = 0, endReason = 'horizon', seenDeaths = 0;

  for (let d = 1; d <= DAYS; d++) {
    let res;
    const sayMark = rec.sayLines.length;
    try { snapshotDayNames(dayOf(Game)); } catch (e) {}
    try { res = await runDays(Game, policy, { days: 1, sampleEvery: 1 }); }
    catch (e) { endReason = 'threw:' + e.message; break; }
    rec.days = d;
    try {
      // r49 day-boundary census: runs BEFORE convo driving so no convo
      // side-effect can masquerade as a day-boundary exit.
      // All lines said during this iteration (no day-stamp filter: dawn
      // straddles the day increment, so stamps mix pre/post-advance days).
      const sayToday = rec.sayLines.slice(sayMark);
      attributeDayLines(dayOf(Game), sayToday);
      dayBoundaryCensus(dayOf(Game), sayToday);
    } catch (e) {}
    try {
      const ds = (res.samples && res.samples.deaths) || [];
      for (const de of ds.slice(seenDeaths)) {
        seenDeaths++;
        const cause = String(de.cause || de.how || '');
        rec.deaths.push({ day: dayOf(Game), name: rawName(Game, de.who), cause, player: !!de.player });
      }
    } catch (e) {}
    // drive convos: on each raid day (defender) + day+2 (sheltered witness), cap 8
    try {
      const raidToday = rec.raids.some(r => r.day === dayOf(Game));
      const raidDayMinus2 = rec.raids.some(r => dayOf(Game) - r.day === 2);
      if ((raidToday || raidDayMinus2) && convosThisRun < 8 && !raidConvoDone.has(dayOf(Game))) {
        raidConvoDone.add(dayOf(Game));
        const v = Game.state.village || {};
        let target = null, tag = '';
        if (raidToday) {
          const todayFights = rec.defendedFights.filter(f => f.day === dayOf(Game) && String(f.vid) !== String(Game.villagerId));
          const def = todayFights[0];
          target = def ? def.vid : (v.roster || []).find(r => String(r) !== String(Game.villagerId));
          tag = 'DEFENDER-on-raid-day';
        } else {
          let sh = [];
          try { sh = Game.shelteredVillagers ? Game.shelteredVillagers() : []; } catch (e) {}
          target = (sh && sh.length ? sh[0] : (v.roster || []).find(r => String(r) !== String(Game.villagerId)));
          tag = 'SHELTERED-two-days-after';
        }
        if (target) {
          const lines = [];
          const npc = driveConvo(Game, target, `seed${SEED} d${dayOf(Game)} ${tag}`, lines);
          const f = `journey-crisis-r49-seed${SEED}-d${dayOf(Game)}-${tag.toLowerCase().replace(/[^a-z]+/g, '-')}.txt`;
          fs.writeFileSync(path.join(EVID, f), lines.join('\n'), 'utf8');
          rec.convosDriven.push({ day: dayOf(Game), tag, file: f, npcLines: npc.length });
          convosThisRun++;
        }
      }
    } catch (e) {}
    if (Game.over) { endReason = 'game-over'; break; }
    try {
      const alive = livingCount(Game);
      if (alive <= 0) { if (++deadTail >= 10) { endReason = 'village-dead'; break; } }
      else deadTail = 0;
    } catch (e) {}
  }
  rec.endReason = endReason;
  // ---- r49 final computation: serialize object-identity tracking ----
  try {
    rec.dayBoundaryExits = dayBoundaryExits;
    rec.wildFights = wildFights.map(w => {
      const t = lingerTrack.get(w.obj);
      return { day: w.day, id: (w.obj && w.obj.id) || '?', raid: w.raid, outcome: w.outcome, wasTracked: !!t, drifted: !!(t && t.drifted), driftExitDay: (t && t.exitDay) || null };
    });
    const lastDay = dayOf(Game);
    const quiet = [];
    const transient = [];
    for (const [obj, t] of lingerTrack) {
      // Transient drafted: drafted at a tick but never present at a day
      // boundary (fought/lifted the same day) — not a "quiet lingerer" in
      // r48's sense (which persisted across days); reported separately.
      if ((t.boundaryDays || 0) === 0) { transient.push({ id: t.id, draftDay: t.draftDay, exitDay: t.exitDay, exitKind: t.exitKind, gorge: t.gorge, unmet: t.unmet }); continue; }
      if (t.gorge !== 0 || t.unmet) continue;
      const names = [...new Set(Object.values(t.names))].filter(Boolean);
      const lo = t.draftDay, hi = t.exitDay || lastDay;
      let voicedLine = null;
      for (const s of rec.sayLines) {
        if (s.day < lo || s.day > hi) continue;
        if (names.some(nm => s.line.indexOf(nm) !== -1)) { voicedLine = s.line.slice(0, 160); break; }
      }
      const wildAfter = wildFights.filter(w => w.obj === obj && w.day >= (t.exitDay || 0));
      quiet.push({ id: t.id, draftDay: t.draftDay, exitDay: t.exitDay, exitKind: t.exitKind, boundaryDays: t.boundaryDays, gorge: t.gorge, unmet: t.unmet, names, voiced: !!voicedLine, voicedLine, wildAfterDrift: wildAfter.length });
    }
    rec.quietLingerers = quiet;
    rec.transientDrafted = transient;
    // Wander capture: drifted objects later fought in the wild.
    rec.wanderCaptures = [];
    for (const [obj, t] of lingerTrack) {
      if (!t.drifted) continue;
      const after = wildFights.filter(w => w.obj === obj && t.exitDay !== null && w.day > t.exitDay);
      if (after.length) rec.wanderCaptures.push({ id: t.id, driftExitDay: t.exitDay, firstWildFightDay: after[0].day, outcome: after[0].outcome, fights: after.length });
    }
  } catch (e) { rec.quietComputeError = String(e && e.message || e); }

  // ---- end-of-run census ----
  try {
    const v = Game.state.village || {};
    const alive = [], dead = [];
    for (const id of (v.roster || [])) {
      let p = null; try { p = Game.vpOf(id); } catch (e) {}
      let nm = id; try { nm = Game.displayName(id) || id; } catch (e) {}
      if (p && !p.dead) alive.push(nm); else dead.push(nm);
    }
    let corpses = [];
    try {
      const cs = (typeof Game.corpses === 'function') ? Game.corpses() : (Game.state.corpses || []);
      corpses = cs.filter(c => c && ((typeof Game.corpseIsPerson === 'function' && Game.corpseIsPerson(c)) || c.kind === 'person' || c.kind === 'villager'))
        .map(c => ({ name: c.name || c.villagerId, cause: String(c.cause || ''), day: c.dayDied, player: !!c.player }));
    } catch (e) {}
    rec.census = {
      scattered: !!v.scattered, extinct: !!v.extinct,
      aliveCount: alive.length, alive, dead, corpses,
      pantryKcal: (() => { try { return Math.round(Game.pantryKcalLive(v)); } catch (e) { return 0; } })(),
    };
  } catch (e) { rec.census = { error: e.message }; }

  console.log(JSON.stringify(rec));
}

(async () => {
  try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
  try { await main(); }
  catch (e) { console.log(JSON.stringify({ seed: SEED, error: String(e && e.message || e) })); }
})();
