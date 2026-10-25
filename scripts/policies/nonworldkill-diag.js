// nonworldkill-diag — TB-fight initiation recorder for the non-world
// wave-4 kill question (sim-nonworldkill-a, 2026-10-25, flesh-out loop,
// axis scale-onramp, DIAG ONLY: zero src/js changes, policy-side only).
//
// QUESTION (carried blank, findings #1053, measured by
// sim-w4funnel-a): the shared band's ONLY wave-4 kill (seed 73678,
// day 115, strike, by elif_demir, via 'player') matches NO world
// arrival, NO removal, and NO oldcore tbEnd row — a TB kill with a
// null origin and no world trace. This recorder names the door it
// came through by recording, for EVERY startCombat call, the
// initiation signals the engine itself leaves at call time, and by
// joining each fight's tbEnd to the waveKillLog entries it wrote.
//
// MECHANISM, READ FROM CODE (never invented):
//   - startCombat (game.js) builds its fighter from the monster DEF
//     for mid = monsterId || pendingMonsterId || 'bulldozer', and
//     lifts the world monster on the player's tile via
//     removeWorldMonster(playerMonster()) — a NO-OP when no world
//     monster sits on the player tile. A null-origin fight is
//     therefore exactly a startCombat call with no world monster on
//     the player tile at call time; the fight still proceeds and
//     tbKillRewards still logs via 'player'.
//   - Doors (every startCombat caller in src/js, plus the harness):
//     contest-arena (contests.js _contestArena/_contestArenaAfter —
//     state.arenaContest is set BEFORE startCombat, so the signal
//     is present at call time; NOTE: arena TB kills log via
//     'player' through the tbEnd kill loop — _contestArenaAfter
//     does NOT rewrite waveKillLog — so via='player' does NOT
//     exclude contest-arena, contra the w4funnel-a shorthand which
//     holds only for contestEngine field-fight kills via
//     'contest'); feast-draw (feastBuff.js faceFeastDraw —
//     s.feastDraw present with monsterId === mid, deleted only
//     AFTER startCombat returns); tent-intruder (game.js
//     faceTentIntruder — _tentBreachSpawn set before startCombat
//     and consumed inside it; pendingInTent true covers the
//     harness-fallback facing of a tent intruder);
//     door-flee-reengage (game.js reengageWaitingMonsters, called
//     from exitBuilding/enterBuilding/treelineAmbush — the stack
//     separates treeline-ambush from hall-door-reengage);
//     glasswing-trap (game.js gwTrapTick — the trap spawns its
//     monster onto the player tile, then startCombat, so the
//     origin is a FRESH spawn, not null); world-bump (game.js
//     monsterTurn — the player-tile world monster contacts the
//     player); wanderer-pending (scripts/sim-harness.js
//     driveContestsImpl — an unresolved pending encounter faced
//     by the harness fallback, game.js triggerEncounter / wanderer
//     cast via castMonster); policy-direct (a policy function
//     calling startCombat directly — our policy does not, but the
//     class exists so such a call is never misbucketed);
//     table-trial (startCombat('finale', {tableTrial}) — not a
//     monster fight, excluded from the monster census).
//   - Fights built WITHOUT startCombat (encounters.js alien duels,
//     uprising / party-betrayal fights) reach tbEnd directly: a
//     tbEnd row with no matching start row is DIRECT-BUILD, not a
//     missing door. They carry no monster def, so no wave kill is
//     expected from them — the analyzer verifies that.
//   - ORIGIN (independent axis): the pre-tile monster is read
//     from Game.worldMonsters() by tile (tx,ty) == (map.px,map.py)
//     — a pure read. playerMonster() is NEVER called here: it can
//     adopt a detached scholar.monster alias into the world, which
//     would mutate state on a REFUSED call (startCombat refuses
//     before its own sync when a fight is live).
//   - STACK: the recorder's wrapper is installed OUTERMOST (last
//     in the composition), so at pre-record time the stack holds
//     exactly [this wrapper, the true caller, ...] — inner engine
//     wrappers (godpath/finale/buildarounds/feel) are not on the
//     stack yet. Door rules that read the stack therefore see the
//     true caller. Both fn names and raw stack lines (file:line)
//     are recorded for audit.
//   - KILL JOIN: tbEnd is the only end for TB fights, and
//     recordWaveKill appends to state.waveKillLog inside it, so a
//     pre/post snapshot diff at tbEnd brackets exactly the kills
//     that fight wrote. A fight's kills are its tbEnd row's
//     newLog entries — never oldcore tbEnd kinds (which classify
//     the LIFTED tile monster, not the fought monster, and diverge
//     on world-origin-mismatch fights).
//
// OBSERVATIONAL ONLY. NONWORLDKILL=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where it matters,
// write nothing to game state (store arrays only, plus the same
// installed-flag class the other recorders use), draw no RNG,
// never throw into the engine (a startCombat throw from the
// engine itself is recorded and RETHROWN unchanged), and return
// the original value untouched.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.NONWORLDKILL === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { starts: [], ends: [], errs: 0, errors: [], overflow: { starts: 0, ends: 0 }, installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

// stackHint + stackLines: fn names (oldcore-style) and raw lines
// (file:line audit) from the CURRENT stack, skipping this helper
// itself. At pre-record time the top frame is this recorder's
// wrapper; it never matches a door rule, so no filtering is needed.
function stackInfo() {
  const names = [], lines = [];
  try {
    const st = (new Error()).stack || '';
    for (const line of st.split('\n')) {
      const t = line.trim();
      if (!t || t.indexOf('stackInfo') >= 0) continue;
      if (lines.length < 5) lines.push(t.slice(0, 180));
      const m = t.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m) {
        const fn = m[1];
        if (fn === 'Error') continue;
        if (names.indexOf(fn) < 0) names.push(fn);
      }
      if (names.length >= 10) break;
    }
  } catch (e) { /* stack capture must never throw */ }
  return { names: names.join(','), lines: lines };
}

function stackHas(stackNames, fn) {
  if (!stackNames) return false;
  return stackNames.split(',').indexOf(fn) >= 0;
}

function logSnapshot(Game) {
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    return log.map(e => ({
      d: (e && e.d) | 0, mid: (e && e.mid) || null, w: (e && e.w) | 0,
      by: (e && e.by !== undefined) ? e.by : null, via: (e && e.via) || 'unknown',
      trick: (e && e.trick !== undefined) ? e.trick : null,
    }));
  } catch (e) { return []; }
}

function logDiff(before, after) {
  const counts = {};
  for (const e of before) { const k = JSON.stringify(e); counts[k] = (counts[k] || 0) + 1; }
  const added = [];
  for (const e of after) {
    const k = JSON.stringify(e);
    if (counts[k] > 0) counts[k]--;
    else added.push(e);
  }
  return added;
}

function installNonworldkillDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._nonworldkillDiagStore === store && Game._nonworldkillDiagInstalled) return Game._nonworldkillDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  wrap('startCombat', (orig) => function (monsterId, options) {
    const pre = { stack: '', stackLines: [] };
    // Ends seen before the call: a fight that starts AND ends inside
    // this one call (opening turns route it — tbEnd nulls tbfight at
    // its tail, game.js) leaves no tbfight for the post-record below
    // to read its id from. Exactly one new end row during the call
    // IS that fight's end row, so its fightId is adopted (marked
    // fightIdSource 'end-row'); any other count leaves the id null
    // rather than guessing. Without this, same-call routed fights
    // read as direct-build ends in the analyzer — they are not.
    let endsBefore = 0;
    try { endsBefore = store.ends.length; } catch (e) { /* count best-effort */ }
    try {
      const s = (Game.state && Game.state.scholar) || {};
      pre.day = dayOf(Game);
      pre.arg = (monsterId === undefined || monsterId === null) ? null : String(monsterId);
      pre.tableTrial = !!(monsterId === 'finale' && options && options.tableTrial);
      pre.liveFight = !!(Game.tbfight && !Game.tbfight.over);
      pre.preFightId = (Game.tbfight && Game.tbfight.id) || null;
      pre.pendingEncounter = !!Game.pendingEncounter;
      pre.pendingMonsterId = (Game.pendingMonsterId === undefined || Game.pendingMonsterId === null) ? null : String(Game.pendingMonsterId);
      pre.pendingInTent = !!Game.pendingInTent;
      const fd = s.feastDraw || null;
      pre.feastDraw = fd ? { monsterId: (fd.monsterId || null), veteran: !!fd.veteran, day: fd.day || 0 } : null;
      pre.tentBreach = !!Game._tentBreachSpawn;
      pre.tentBreachAt = Game._tentBreachSpawn ? { mx: Game._tentBreachSpawn.mx, my: Game._tentBreachSpawn.my } : null;
      const ac = (Game.state && Game.state.arenaContest) || null;
      pre.arenaContest = ac ? { contestId: ac.contestId || null, waves: Array.isArray(ac.waves) ? ac.waves.slice() : null, waveIdx: ac.waveIdx | 0 } : null;
      pre.activeContestArena = !!((Game.state || {}).activeContest && Game.state.activeContest.arenaSuspended);
      const dw = (Game.state || {}).doorFledMonsters;
      pre.doorFled = Array.isArray(dw) ? dw.map(w => (w && w.id) ? String(w.id) : null) : null;
      let px = null, py = null;
      try { px = Game.map.px; py = Game.map.py; } catch (e) { /* tile best-effort */ }
      pre.playerTile = (px != null && py != null) ? [px, py] : null;
      let tile = null;
      try {
        const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
        tile = list.find(m => m && m.tx === px && m.ty === py) || null;
      } catch (e) { /* tile monster best-effort */ }
      pre.tileMonster = tile ? {
        id: tile.id || null, seq: (tile._spawnSeq != null ? tile._spawnSeq : null),
        src: tile._spawnsrc || null, hp: roundHp(tile.hp), maxHp: roundHp(tile.maxHp),
        titan: !!tile.titan, lingering: !!tile.lingering,
      } : null;
      const si = stackInfo();
      pre.stack = si.names; pre.stackLines = si.lines;
    } catch (e) { noteErr(store, 'start.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      let fightId = null, fighters = null, fightIdSource = 'tbfight';
      try {
        const f = Game.tbfight;
        if (f && !pre.liveFight) {
          fightId = f.id || null;
          fighters = (f.fighters || []).map(x => x ? {
            key: x.key || null, kind: x.kind || null,
            monsterId: x.monsterId || (x.mdef && x.mdef.id) || null,
            villagerId: x.villagerId || null, hp: roundHp(x.hp), maxHp: roundHp(x.maxHp),
          } : null);
        } else if (!f && !pre.liveFight) {
          // Same-call start-and-end (routed at the opening turns):
          // adopt the single new end row's fightId, if exactly one
          // appeared during this call. Refused/thrown calls grow no
          // end row, so they never adopt.
          try {
            if (store.ends.length === endsBefore + 1) {
              fightId = store.ends[store.ends.length - 1].fightId || null;
              if (fightId) fightIdSource = 'end-row';
            }
          } catch (e) { /* adoption best-effort */ }
        }
      } catch (e) { noteErr(store, 'start.post.fighters', e); }
      let mid = null;
      if (fighters && fighters.length) {
        const mf = fighters.find(x => x && x.kind === 'monster');
        mid = mf ? mf.monsterId : null;
      }
      let wave = null, waveSource = null;
      if (mid) {
        try {
          const def = ((Game.data && Game.data.monsters) || []).find(d => d && d.id === mid);
          if (def) { wave = def.wave | 0; waveSource = 'def'; }
        } catch (e) { /* wave best-effort */ }
      }
      let origin = null;
      if (pre.tileMonster && mid) origin = (pre.tileMonster.id === mid) ? 'world-origin' : 'world-origin-mismatch';
      else if (pre.tileMonster && !mid) origin = 'world-origin-unresolved';
      else origin = 'null-origin';
      pushCapped(store, 'starts', {
        day: pre.day, arg: pre.arg, mid: mid, wave: wave, waveSource: waveSource,
        tableTrial: !!pre.tableTrial, refused: !!pre.liveFight,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
        fightId: fightId, fightIdSource: fightIdSource, origin: origin, tileMonster: pre.tileMonster, playerTile: pre.playerTile,
        pendingEncounter: !!pre.pendingEncounter, pendingMonsterId: pre.pendingMonsterId,
        pendingInTent: !!pre.pendingInTent, feastDraw: pre.feastDraw,
        tentBreach: !!pre.tentBreach, tentBreachAt: pre.tentBreachAt,
        arenaContest: pre.arenaContest, activeContestArena: !!pre.activeContestArena,
        doorFled: pre.doorFled, stack: pre.stack || '', stackLines: pre.stackLines || [],
        fighters: fighters,
      });
    } catch (e) { noteErr(store, 'start.rec', e); }
    if (threw) throw threw;
    return result;
  });

  wrap('tbEnd', (orig) => function (result) {
    let fightId = null, before = [];
    try {
      const f = Game.tbfight;
      fightId = f ? (f.id || null) : null;
      before = logSnapshot(Game);
    } catch (e) { noteErr(store, 'tbEnd.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      const after = logSnapshot(Game);
      pushCapped(store, 'ends', {
        day: dayOf(Game), fightId: fightId, result: (result === undefined || result === null) ? null : String(result),
        logLenBefore: before.length, logLenAfter: after.length, newLog: logDiff(before, after),
      });
    } catch (e) { noteErr(store, 'tbEnd.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._nonworldkillDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._nonworldkillDiagStore = store;
    Game._nonworldkillDiagInstalled = true;
    Game._nonworldkillDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withNonworldkillDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installNonworldkillDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._nonworldkill = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// classifyStart(row): pure. Precedence (fixed in the evidence
// pre-registration): table-trial > refused > thrown >
// contest-arena > feast-draw > tent-intruder >
// door-flee-reengage > glasswing-trap > world-bump >
// wanderer-pending > policy-direct > other. Returns
// {door, excluded, sub, initiator} — excluded rows are NOT
// initiations (they never started a fight).
function classifyStart(row) {
  if (!row) return { door: 'other', excluded: false, sub: null, initiator: null };
  if (row.tableTrial) return { door: 'table-trial', excluded: true, sub: null, initiator: null };
  if (row.refused) return { door: 'refused', excluded: true, sub: null, initiator: null };
  if (row.threw) return { door: 'thrown', excluded: true, sub: null, initiator: null };
  const st = row.stack || '';
  if (row.arenaContest || row.activeContestArena) {
    return { door: 'contest-arena', excluded: false, sub: null,
      initiator: stackHas(st, '_contestArenaAfter') ? 'arena-next-wave' : stackHas(st, '_contestArena') ? 'arena-first-wave' : 'arena-unknown' };
  }
  if (row.feastDraw && row.feastDraw.monsterId && row.mid && row.feastDraw.monsterId === row.mid) {
    return { door: 'feast-draw', excluded: false, sub: null,
      initiator: stackHas(st, 'faceFeastDraw') ? 'faceFeastDraw' : stackHas(st, 'driveContestsImpl') ? 'harness-fallback' : 'other' };
  }
  if (row.tentBreach || row.pendingInTent) {
    return { door: 'tent-intruder', excluded: false, sub: null,
      initiator: stackHas(st, 'faceTentIntruder') ? 'faceTentIntruder' : stackHas(st, 'driveContestsImpl') ? 'harness-fallback' : 'other' };
  }
  if (stackHas(st, 'reengageWaitingMonsters')) {
    return { door: 'door-flee-reengage', excluded: false,
      sub: stackHas(st, 'treelineAmbush') ? 'treeline-ambush' : 'hall-door-reengage',
      initiator: stackHas(st, 'treelineAmbush') ? 'treelineAmbush' : 'building-door' };
  }
  if (stackHas(st, 'gwTrapTick')) return { door: 'glasswing-trap', excluded: false, sub: null, initiator: 'gwTrapTick' };
  if (stackHas(st, 'monsterTurn')) return { door: 'world-bump', excluded: false, sub: null, initiator: 'monsterTurn' };
  if (stackHas(st, 'driveContestsImpl')) return { door: 'wanderer-pending', excluded: false, sub: null, initiator: 'harness-fallback' };
  // Policy-direct: the caller frame's file lives under
  // scripts/policies/ (stack lines carry file:line). Engine doors
  // above already fired; anything left whose caller is a policy
  // file is a direct policy startCombat call.
  const lines = row.stackLines || [];
  for (const ln of lines) {
    if (ln && ln.indexOf('policies/') >= 0) return { door: 'policy-direct', excluded: false, sub: null, initiator: 'policy' };
  }
  return { door: 'other', excluded: false, sub: null, initiator: null };
}

// analyzeNonworldkill(store): pure over one seed's store.
// Returns initiations, ends joined to starts by fightId,
// kills by door (from tbEnd log deltas), and the unclassified
// / direct-build residuals. Field-fight and contestEngine kills
// never pass through tbEnd, so they appear in NO end row — the
// sweep analyzer cross-checks them against the raftdraft log
// separately; they are not TB kills and never count here.
function analyzeNonworldkill(store) {
  const starts = (store && store.starts) || [];
  const ends = (store && store.ends) || [];
  const classified = starts.map(s => ({ start: s, cls: classifyStart(s) }));
  const initiations = classified.filter(c => !c.cls.excluded);
  const excluded = classified.filter(c => c.cls.excluded);
  const byDoor = {}, byDoorWave = {}, byOrigin = {};
  for (const c of initiations) {
    const d = c.cls.door;
    byDoor[d] = (byDoor[d] || 0) + 1;
    const wk = 'w' + ((c.start.wave | 0) || 0);
    byDoorWave[d] = byDoorWave[d] || {};
    byDoorWave[d][wk] = (byDoorWave[d][wk] || 0) + 1;
    const o = c.start.origin || 'unknown';
    byOrigin[o] = (byOrigin[o] || 0) + 1;
  }
  const startByFightId = {};
  for (const c of initiations) {
    if (c.start.fightId) startByFightId[c.start.fightId] = c;
  }
  const endsJoined = ends.map(e => {
    const c = (e.fightId && startByFightId[e.fightId]) || null;
    return { end: e, start: c ? c.start : null, cls: c ? c.cls : null, directBuild: !c };
  });
  const killsByDoor = {}, killsByDoorWave = {};
  const tbKills = [];
  for (const j of endsJoined) {
    for (const k of (j.end.newLog || [])) {
      const door = j.directBuild ? 'direct-build' : (j.cls ? j.cls.door : 'other');
      killsByDoor[door] = (killsByDoor[door] || 0) + 1;
      const wk = 'w' + ((k.w | 0) || 0);
      killsByDoorWave[door] = killsByDoorWave[door] || {};
      killsByDoorWave[door][wk] = (killsByDoorWave[door][wk] || 0) + 1;
      tbKills.push({ day: j.end.day, result: j.end.result, door: door, sub: j.cls ? j.cls.sub : null,
        fightId: j.end.fightId, kill: k, startDay: j.start ? j.start.day : null,
        startArg: j.start ? j.start.arg : null, startMid: j.start ? j.start.mid : null,
        origin: j.start ? j.start.origin : null });
    }
  }
  const wave4Kills = tbKills.filter(k => (k.kill.w | 0) === 4);
  const otherRows = initiations.filter(c => c.cls.door === 'other');
  const directBuildEnds = endsJoined.filter(j => j.directBuild);
  const directBuildKills = tbKills.filter(k => k.door === 'direct-build');
  return {
    starts: starts.length, ends: ends.length,
    initiations: initiations.length,
    excluded: { total: excluded.length,
      byDoor: excluded.reduce((m, c) => { m[c.cls.door] = (m[c.cls.door] || 0) + 1; return m; }, {}) },
    byDoor: byDoor, byDoorWave: byDoorWave, byOrigin: byOrigin,
    otherRows: otherRows.map(c => ({ day: c.start.day, arg: c.start.arg, mid: c.start.mid, wave: c.start.wave, origin: c.start.origin, stack: c.start.stack, stackLines: c.start.stackLines })),
    endsJoined: endsJoined.length, directBuildEnds: directBuildEnds.length,
    directBuildEndRows: directBuildEnds.map(j => ({ day: j.end.day, fightId: j.end.fightId, result: j.end.result, newLog: j.end.newLog })),
    tbKills: tbKills, killsByDoor: killsByDoor, killsByDoorWave: killsByDoorWave,
    wave4Kills: wave4Kills, directBuildKills: directBuildKills,
    unclassifiedInitiations: otherRows.length,
  };
}

module.exports = { layerOn, newStore, installNonworldkillDiag, withNonworldkillDiag,
  classifyStart, analyzeNonworldkill, stackInfo, logDiff, MAX_EVENTS };
