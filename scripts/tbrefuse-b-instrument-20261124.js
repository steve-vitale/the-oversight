// tbrefuse-b-instrument-20261124.js — non-building-TB-start tracer
// (arm sim-tbrefuse-b). Scripts only, zero src/js. V2 (Amendment #1):
// the pilot proved the judged phenomenon is NOT guard refusals
// (0 on 8 seeds) but ALL non-building startCombat calls —
// guard-refusal, titan-refusal (titans.js no-solo-titans hard
// gate), instant-resolve (fight built + ended in the opening
// turns inside the call), and noop-unexplained (fail-closed).
// Reuses the bloodcluster instrument VERBATIM as the base (daily
// snapshots, killEvents, deathEvents, fieldFights, tbStarts with the
// rebuilt flag, tbKillCtx) and ADDS no-op tracing on top:
//   - startCombat: EVERY call that returns without building a
//     fight is a row (callKind assigned from tbEnd-during-call /
//     titan line / live fight before). The row records the caller
//     (live stack, first game frame), the live fight's id +
//     monster (guard rows), the refused monster id (monsterId ||
//     pendingMonsterId), the player-tile world monster object
//     (TAGGED by object identity so its later fate is tracked,
//     not guessed by species id — guard/titan/noop rows only;
//     instant-resolve rows get their fate at the call from the
//     ended fight), the verbatim lines fired during the call,
//     and the return value.
//   - removeWorldMonster: resolves a tagged monster's fate on
//     removal (vanished / fled-across); removals inside a
//     successful startCombat resolve as re-engaged-tb; removals
//     inside an instant-resolve resolve with the opening outcome.
//   - fieldFight: a tagged monster object killed here resolves
//     as killed-field.
//   - tbEnd: fight-end records WITH monster ids, so refusal
//     episodes link to the live fight that blocked them and wait
//     times are measurable; ends fired during a startCombat call
//     are stashed for the call's row (instant-resolve linkage).
//   - say/sysSay: a ring buffer of the last 8 lines + capture of
//     every 'Already in a fight' firing, linked to the refusal
//     call it fired during; every line fired during a
//     startCombat call is attached to that call's row.
//   - snapshot sweep: open refusals are checked once per day
//     (tagged monster still in worldMonsters()? on the player
//     tile? pending still live?) and resolved at end of run by
//     finalize().
// All wraps are call-through and RNG-neutral (no Math.random, no
// state mutation except the diagnostic __tbrefuse tag on the
// monster object, which no game code reads). Every catch reports
// into t.instrumentErrors, never silently.
// Usage: const INST = require('./tbrefuse-b-instrument-20261124');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';

const path = require('path');
const REPO = path.join(__dirname, '..');
const BASE = require('./bloodcluster-b-instrument-20261124');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}
function relStackLine(line) {
  try { return String(line || '').replace(REPO, '').replace(/\\/g, '/').trim().slice(0, 220); } catch (e) { return ''; }
}
// First stack frame outside this instrument file and outside the
// wrapped function itself: the real caller.
function callerFrame() {
  let frames = [];
  try {
    const st = (new Error('tbrefuse-caller')).stack || '';
    frames = st.split('\n').slice(1).map(function (l) { return l.trim(); })
      .filter(function (l) { return l && l.indexOf('tbrefuse-b-instrument') < 0; });
  } catch (e) {}
  return frames.slice(0, 3).map(relStackLine);
}
function callerClass(frames) {
  const f0 = frames[0] || '';
  if (/monsterTurn/.test(f0)) return 'monsterTurn';
  if (/reengageWaitingMonsters/.test(f0)) return 'waiting-monsters';
  if (/gwTrapTick/.test(f0)) return 'trap';
  if (/faceFeastDraw|feastBuff/.test(f0)) return 'feast-draw';
  if (/_contestArena|contests\.js/.test(f0)) return 'contest-arena';
  if (/policies\/competent/.test(f0)) return 'policy';
  if (/alienPlayers/.test(f0)) return 'other-alienPlayers';
  const m = f0.match(/at (?:[A-Za-z_$][\w$.]* )?\(?([^()\s:]+)(?::\d+)?/);
  const fn = (f0.match(/at ([A-Za-z_$][\w$.]*) /) || [])[1] || 'unknown';
  if (/unknown/.test(fn) && frames.length === 0) return 'caller-unknown';
  return 'other-' + fn;
}

function install(Game) {
  const base = BASE.install(Game);
  const t = base.t;
  t.refusals = [];
  t.tbEnds = [];
  t.refusalSayLines = [];
  t.refusalSayCount = 0;
  const orig = {};
  let seq = 0;
  // Internal maps (never serialized — the driver writes explicit fields).
  const openMon = {};   // refusal seq -> tagged world monster object
  const openPending = {}; // refusal seq -> pendingMonsterId at refusal
  const openNoMon = {}; // refusal seq -> mid (no world monster, no pending)
  let inStartCombat = false;
  let pendingRemovals = []; // {seqs, day} stashed during a startCombat call
  let endsDuringCall = []; // {fightId, result, monsterIds, day} stashed during a startCombat call
  let callLines = []; // {via, line} fired during the current startCombat call
  let sayRing = [];      // last 8 {day, via, line}
  function isTitanMid(mid) {
    try {
      const td = (Game.data && Game.data.titans) || {};
      return !!mid && mid.charAt(0) !== '_' && !!td[mid];
    } catch (e) { return false; }
  }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  function resolveRefusal(row, fate, detail) {
    if (!row || row.fate) return;
    row.fate = fate;
    row.fateDay = dayOf(Game);
    if (detail) row.fateDetail = detail;
    try { delete openMon[row.seq]; } catch (e) {}
    try { delete openPending[row.seq]; } catch (e) {}
    try { delete openNoMon[row.seq]; } catch (e) {}
  }

  // --- say/sysSay: ring buffer + refusal-line capture ---
  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') { err('install.' + fnName, new Error('not a function')); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      const arg = arguments.length ? arguments[0] : null;
      try {
        if (typeof arg === 'string') {
          sayRing.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 300) });
          if (sayRing.length > 8) sayRing.shift();
          if (inStartCombat) {
            callLines.push({ via: fnName, line: String(arg).slice(0, 300) });
            if (callLines.length > 8) callLines.shift();
          }
          if (arg.indexOf('Already in a fight') >= 0) {
            t.refusalSayCount += 1;
            t.refusalSayLines.push({ day: dayOf(Game), via: fnName, seq: null, line: String(arg).slice(0, 300) });
          }
        }
      } catch (e) { err(fnName + '-wrap', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  // --- startCombat: the refusal site ---
  if (typeof Game.startCombat === 'function') {
    orig.startCombat = Game.startCombat;
    Game.startCombat = function (monsterId) {
      const beforeTf = Game.tbfight || null;
      const beforeId = (beforeTf && beforeTf.id) || null;
      const beforeLive = !!(beforeTf && !beforeTf.over);
      let liveMonsterMid = null, liveRound = null;
      try {
        const mf = (beforeTf && Array.isArray(beforeTf.fighters)) ? beforeTf.fighters : [];
        const mm = mf.find(function (f) { return f && f.kind === 'monster' && (f.mdef || f.monsterId); });
        liveMonsterMid = mm ? ((mm.mdef && mm.mdef.id) || mm.monsterId || null) : null;
        liveRound = (beforeTf && beforeTf.round != null) ? beforeTf.round : null;
      } catch (e) {}
      let tileMon = null, pendingId = null;
      try { tileMon = (typeof Game.playerMonster === 'function') ? Game.playerMonster() : null; } catch (e) {}
      try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
      const mid = monsterId || pendingId || null;
      const frames = callerFrame();
      const cls = callerClass(frames);
      const sayBefore = t.refusalSayCount;
      inStartCombat = true;
      pendingRemovals = [];
      endsDuringCall = [];
      callLines = [];
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { inStartCombat = false; throw e; }
      inStartCombat = false;
      try {
        const afterTf = Game.tbfight || null;
        const afterId = (afterTf && afterTf.id) || null;
        const rebuilt = afterId !== beforeId;
        if (!rebuilt) {
          // NON-BUILDING START (v2, Amendment #1): guard refusal,
          // titan refusal, instant-resolve, or unexplained no-op.
          // callKind, in order: a tbEnd fired during the call =
          // instant-resolve; the guard line fired = guard-refusal
          // (the guard always says its line, so a silent live-fight
          // call cannot be the guard); the titan line fired =
          // titan-refusal; a titan mid = titan-refusal (the gate
          // fired silently — its line dedups to once per day, and
          // a ready muster would have built instead); a live fight
          // before = guard-refusal (defensive); else
          // noop-unexplained (fail-closed, bar 1). The line is the
          // distinguisher, not beforeLive: the titan wrapper sits
          // OUTSIDE the guard, so a titan call during a live fight
          // hits the titan gate first, never the guard.
          const sayDelta = t.refusalSayCount - sayBefore;
          const guardLine = sayDelta > 0;
          const titanLine = callLines.some(function (l) { return l.line.indexOf('does not notice you') >= 0; });
          let callKind;
          let ended = null;
          if (endsDuringCall.length > 0) { callKind = 'instant-resolve'; ended = endsDuringCall[0]; }
          else if (guardLine) callKind = 'guard-refusal';
          else if (titanLine) callKind = 'titan-refusal';
          else if (isTitanMid(mid)) callKind = 'titan-refusal';
          else if (beforeLive) callKind = 'guard-refusal';
          else callKind = 'noop-unexplained';
          const row = {
            seq: seq, day: dayOf(Game), mid: mid, wave: waveOf(Game, mid),
            callKind: callKind, isTitan: isTitanMid(mid), titanLineFired: titanLine,
            caller: cls, callerFrame: frames[0] || null,
            liveFightId: beforeId, liveMonsterMid: liveMonsterMid, liveRound: liveRound,
            pendingMonsterId: pendingId,
            hasWorldMonster: !!tileMon,
            worldMonsterId: tileMon ? (tileMon.id || null) : null,
            worldMonsterOnTile: !!(tileMon && tileMon.mx !== undefined),
            worldMonsterHp: tileMon ? (tileMon.hp | 0) : null,
            worldMonsterVeteran: tileMon ? !!tileMon.veteran : null,
            worldMonsterStance: tileMon ? (tileMon.stance || null) : null,
            returnValue: (r && r.id) ? r.id : (r == null ? null : 'non-fight'),
            sayFired: false, sayFirings: 0,
            linesDuringCall: callLines.slice(),
            contextLines: sayRing.slice(),
            endedFightId: ended ? ended.fightId : null,
            endedResult: ended ? ended.result : null,
            endedMonsterIds: ended ? ended.monsterIds : null,
            fate: null, fateDay: null, fateDetail: null,
          };
          // The guard say line fires DURING orig.startCombat, before
          // this row exists — attach it by exact delta (sayDelta was
          // computed above, before callKind was assigned).
          if (sayDelta > 0) {
            row.sayFired = true; row.sayFirings = sayDelta;
            for (let i = t.refusalSayLines.length - sayDelta; i < t.refusalSayLines.length; i++) {
              if (t.refusalSayLines[i]) t.refusalSayLines[i].seq = seq;
            }
          }
          t.refusals.push(row);
          if (callKind === 'instant-resolve') {
            // Fate AT the call, from the ended fight. The monster
            // was already lifted out of the world by the start, so
            // it is NOT tagged/tracked — its story in this fight
            // ended in the opening turns. Monsters lifted in by
            // this same call (stashed tags from removeWorldMonster)
            // share the opening outcome.
            let fate = null, detail = null;
            const killed = (t.tbKillCtx || []).some(function (c) { return c && c.fightId === ended.fightId; });
            if (killed) { fate = 'killed-in-opening'; detail = 'kill in tbKillCtx for fight ' + ended.fightId; }
            else if (ended.result === 'routed' || ended.result === 'fled' || ended.result === 'calmed') { fate = 'fled-in-opening'; detail = 'fight ' + ended.fightId + ' ended ' + ended.result + ' in opening turns'; }
            else if (ended.result === 'lost') { fate = 'lost-in-opening'; detail = 'fight ' + ended.fightId + ' ended lost in opening turns'; }
            else { fate = 'instant-other'; detail = 'fight ' + ended.fightId + ' ended ' + ended.result + ' in opening turns'; }
            row.fate = fate; row.fateDay = dayOf(Game); row.fateDetail = detail;
            for (const pr of pendingRemovals) {
              for (const s of pr.seqs) {
                const orow = t.refusals[s];
                if (orow && !orow.fate) resolveRefusal(orow, fate, 'lifted into instant-resolve fight ' + ended.fightId + ' (' + detail + ')');
              }
            }
          } else if (tileMon && mid && tileMon.id === mid) {
            try {
              const prevTags = tileMon.__tbrefuse || [];
              row.repeatOf = prevTags.length ? prevTags[prevTags.length - 1] : null;
              tileMon.__tbrefuse = tileMon.__tbrefuse || [];
              tileMon.__tbrefuse.push(seq);
              openMon[seq] = tileMon;
            } catch (e) { err('tag', e); }
          } else if (pendingId) {
            openPending[seq] = pendingId;
          } else {
            openNoMon[seq] = mid;
          }
          seq += 1;
          pendingRemovals = [];
          endsDuringCall = [];
        } else if (rebuilt) {
          // SUCCESSFUL start — resolve refusals whose tagged
          // monster was lifted in (stashed by the
          // removeWorldMonster wrap during this call), and
          // pending-refusals whose pending id this start consumed.
          for (const pr of pendingRemovals) {
            for (const s of pr.seqs) {
              const row = t.refusals[s];
              if (row && !row.fate) { row.reengagedFightId = afterId; resolveRefusal(row, 're-engaged-tb', 'lifted by startCombat day ' + dayOf(Game)); }
            }
          }
          pendingRemovals = [];
          if (pendingId) {
            for (const k of Object.keys(openPending)) {
              if (openPending[k] === pendingId) {
                const row = t.refusals[Number(k)];
                if (row && !row.fate) { row.reengagedFightId = afterId; resolveRefusal(row, 're-engaged-tb', 'pending ' + pendingId + ' consumed by startCombat'); }
              }
            }
          }
          // A successful start can also resolve a pending-refusal
          // whose pending was a DIFFERENT id but the same mid
          // (pending slot rewritten between refusal and start), and
          // a no-monster refusal (trap/arena instantiation) whose
          // monster re-starts with the same mid. Same-day only —
          // the retry happens on the next tick, not days later, so
          // a same-mid start days later is a different monster.
          if (mid) {
            for (const k of Object.keys(openPending)) {
              const row = t.refusals[Number(k)];
              if (row && !row.fate && row.mid === mid && row.day === dayOf(Game)) {
                row.reengagedFightId = afterId;
                resolveRefusal(row, 're-engaged-tb', 'same-mid start same day ' + dayOf(Game));
              }
            }
            for (const k of Object.keys(openNoMon)) {
              const row = t.refusals[Number(k)];
              if (row && !row.fate && openNoMon[k] === mid && row.day === dayOf(Game)) {
                row.reengagedFightId = afterId;
                resolveRefusal(row, 're-engaged-tb', 'same-mid start same day ' + dayOf(Game));
              }
            }
          }
          endsDuringCall = [];
        }
      } catch (e) { err('startCombat-row', e); }
      return r;
    };
  } else { err('install.startCombat', new Error('not a function')); }

  // --- removeWorldMonster: fate on removal ---
  if (typeof Game.removeWorldMonster === 'function') {
    orig.removeWorldMonster = Game.removeWorldMonster;
    Game.removeWorldMonster = function (m) {
      let tags = null;
      try { tags = (m && Array.isArray(m.__tbrefuse)) ? m.__tbrefuse.slice() : null; } catch (e) {}
      let fledAcross = false;
      try {
        const fm = (Game.state || {}).fledMonsters || {};
        if (m && Object.keys(fm).some(function (k) { return fm[k] && fm[k].id === m.id; })) fledAcross = true;
      } catch (e) {}
      let r;
      try { r = orig.removeWorldMonster.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (tags && tags.length) {
          if (inStartCombat) {
            pendingRemovals.push({ seqs: tags, day: dayOf(Game) });
          } else {
            for (const s of tags) {
              const row = t.refusals[s];
              if (!row || row.fate) continue;
              if (fledAcross) {
                resolveRefusal(row, 'removed-fled-across', 'fledMonsters entry for ' + (m && m.id));
              } else {
                let sub = 'other';
                try {
                  if ((m && m.lostSight) > 6) sub = 'lostSight';
                  else if ((m && m.fearTurns) >= 4) sub = 'fearful-gave-up';
                  else if (m && m.id === 'glasswing') sub = 'glasswing-trap';
                } catch (e) {}
                resolveRefusal(row, 'removed-vanished', sub);
              }
            }
          }
        }
      } catch (e) { err('removeWorldMonster-row', e); }
      return r;
    };
  } else { err('install.removeWorldMonster', new Error('not a function')); }

  // --- fieldFight: tagged monster killed here ---
  if (typeof Game.fieldFight === 'function') {
    orig.fieldFight = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      let tags = null;
      try { tags = (m && Array.isArray(m.__tbrefuse)) ? m.__tbrefuse.slice() : null; } catch (e) {}
      let rec;
      try { rec = orig.fieldFight.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (tags && tags.length && rec && rec.outcome === 'vKill') {
          for (const s of tags) {
            const row = t.refusals[s];
            if (row && !row.fate) resolveRefusal(row, 'killed-field', 'fieldFight vKill day ' + dayOf(Game) + ' by ' + (vid || '?'));
          }
        }
      } catch (e) { err('fieldFight-row', e); }
      return rec;
    };
  } else { err('install.fieldFight', new Error('not a function')); }

  // --- tbEnd: fight-end records (with monster ids; ends fired
  // during a startCombat call are stashed for that call's row) ---
  if (typeof Game.tbEnd === 'function') {
    orig.tbEnd = Game.tbEnd;
    Game.tbEnd = function (result) {
      let fid = null, mids = null;
      try {
        fid = (Game.tbfight && Game.tbfight.id) || null;
        mids = ((Game.tbfight && Array.isArray(Game.tbfight.fighters)) ? Game.tbfight.fighters : [])
          .filter(function (f) { return f && f.kind === 'monster'; })
          .map(function (f) { return (f.mdef && f.mdef.id) || f.monsterId || null; })
          .filter(Boolean);
      } catch (e) {}
      try {
        if (inStartCombat) endsDuringCall.push({ fightId: fid, result: result || null, monsterIds: mids, day: dayOf(Game) });
      } catch (e) { err('tbEnd-stash', e); }
      let r;
      try { r = orig.tbEnd.apply(this, arguments); } catch (e) { throw e; }
      try { t.tbEnds.push({ day: dayOf(Game), fightId: fid, result: result || null, monsterIds: mids, duringStartCombat: inStartCombat }); } catch (e) { err('tbEnd-row', e); }
      return r;
    };
  } else { err('install.tbEnd', new Error('not a function')); }

  // --- daily sweep of open refusals ---
  function sweep() {
    try {
      const px = (Game.state && Game.state.scholar) ? (Game.state.scholar.mx ?? 4) : 4;
      const py = (Game.state && Game.state.scholar) ? (Game.state.scholar.my ?? 4) : 4;
      let wms = [];
      try { wms = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : []; } catch (e) {}
      for (const k of Object.keys(openMon)) {
        const row = t.refusals[Number(k)];
        const mon = openMon[k];
        if (!row || row.fate) { delete openMon[k]; continue; }
        if (wms.indexOf(mon) < 0) {
          resolveRefusal(row, 'gone-untracked', 'tagged monster left worldMonsters() with no recorded removal/lift/kill (day ' + dayOf(Game) + ')');
        } else {
          row.lastSeenDay = dayOf(Game);
          row.lastSeenOnPlayerTile = (mon.mx === px && mon.my === py);
          row.lastSeenMx = mon.mx; row.lastSeenMy = mon.my;
        }
      }
      let pendLive = null;
      try { pendLive = !!Game.pendingEncounter; } catch (e) {}
      let pendId = null;
      try { pendId = Game.pendingMonsterId || null; } catch (e) {}
      for (const k of Object.keys(openPending)) {
        const row = t.refusals[Number(k)];
        if (!row || row.fate) { delete openPending[k]; continue; }
        row.lastSeenDay = dayOf(Game);
        if (!pendLive && !pendId) {
          resolveRefusal(row, 'pending-resolved', 'pending cleared without a fight (day ' + dayOf(Game) + ')');
        }
      }
    } catch (e) { err('sweep', e); }
  }

  function finalize() {
    try { sweep(); } catch (e) {}
    try {
      for (const row of t.refusals) {
        if (row.fate) continue;
        if (row.hasWorldMonster || row.worldMonsterId) {
          resolveRefusal(row, 'still-waiting-at-end', 'tagged monster still tracked at end of run');
        } else {
          // Pending-refusal in the prereg's broad sense: no matching
          // world monster at refusal (pending / contest / trap /
          // arena instantiation) — never re-started in-window.
          resolveRefusal(row, 'pending-unresolved-at-end', 'never consumed nor cleared');
        }
      }
    } catch (e) { err('finalize', e); }
  }

  function snapshot() {
    try { base.snapshot(); } catch (e) { err('snapshot-base', e); }
    sweep();
  }

  function uninstall() {
    Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} });
    try { base.uninstall(); } catch (e) {}
  }
  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, callerClass: callerClass };
