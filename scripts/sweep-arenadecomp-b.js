#!/usr/bin/env node
// sweep-arenadecomp-b.js — ARENA DECOMPOSITION (DIAG, zero src/js)
// (arm sim-arenadecomp-b, run fleshout-loop-b-20261109T1739Z, Loop B, axis
// scale-onramp / winnability chain. The sickness band (58201-58208) measured
// arena deaths 12/99 pre-90 (12.1%) against 5/154 (3.2%) on the prefloor band
// (55201-55212) — different seeds on different bases, medic-duty widening in
// between. This arm is the verdict: fresh band 43001-43008, winseek, 150d
// death-aware, current master, same cause-class recorder family.
//
// MODELED on scripts/sweep-sicknessdiag-b.js (read in-tree; own code, same
// harness pattern). Declared deltas:
//   1. Policy: winseek (scripts/policies/winseek.js, UNMODIFIED), default env.
//      Seeds: exactly 43001-43008 (8 seeds, FRESH band — verified in the
//      prereg across every dated sim-*-prereg.md, evidence .md, corpus
//      filenames, contaminated lists, and the goal mirror). Days 150 ONLY.
//   2. Sickness wrappers DROPPED (fever anatomy out of scope here). Kept
//      verbatim in pattern: the registerDeath capture (EXTENDED with the
//      arena snapshot — see below; still the documented exception: no
//      Game-state writes, no RNG), the say-wrap death sample (+ the
//      choice-offer line capture), the door-verb wrappers (any sit-verb call
//      is a loud contradiction: winseek never sits), the lean daily snapshot
//      (day, pop, healthMap, healerPresent — the entry-HP series the arena
//      join reads), the fallen list read at run end (full entries incl.
//      monsterName) for the reused prefloor classifier, and the fresh-child
//      writeRobust.
//   3. NEW: hurtVillager wrapper (call-through; logs every damage event per
//      villager per day — vid, dmg, cause, HP before/after, settlement flag,
//      monsterId/monsterName. This is the sicknessdiag gap (c) fix: the
//      damage that crashes a victim from healthy morning HP during the
//      policy day is now attributed, not guessed).
//   4. NEW: contestInterruption wrapper (call-through; logs every contest
//      take — day, contestId, cat, name, participantIds, isPlayerTake — and
//      whether the engine's own choice-offer line ("The System offers you a
//      choice: participate or refuse.") fired inside the take. givesChoice
//      itself is a local const (contests.js:2266) the engine never stores, so
//      the SAY LINE is the only engine-exposed choice-offered signal; a take
//      with no line observed is recorded as "no choice line observed", never
//      as "mandatory").
//   5. NEW: _contestArena wrapper (call-through; logs every arena-fight
//      start — contestId, beast ids, beast waves resolved from
//      Game.data.monsters) and _contestArenaAfter wrapper (call-through;
//      logs the arena outcome: won/lost/fled per contestId).
//   6. NEW: the registerDeath capture snapshots, at death time (pure reads):
//      state.arenaContest (contestId, waveIdx, waves, current beast id +
//      wave), state.activeContest (contestId, cat, name, participant, others,
//      _approach — the engine's own per-phase choice record), the live
//      tbfight (id, round, fighters with HP/_taken — the arena fight's own
//      damage record), the victim's waveKillLog kills (veteran status:
//      wave-3+ and wave-4 kills to date), HP at death, contestsHeld.
//      The arena-vs-fallback split reads this snapshot: arenaContest live
//      at death = a real contest-arena death; no arenaContest live = the
//      tbFightDeathCause fallback label on a non-contest fight loss.
//   7. BARE mode (ARENADECOMP_BARE=1): same seeds/days/policy, all recorders
//      SKIPPED except the registerDeath capture, writes only a fingerprint
//      per seed. The recorded run must match it exactly (G2).
//   8. Per-seed corpus also carries the final waveKillLog, contestDeathsById
//      and contestsHeld (pure end-of-run reads).
'use strict';
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');

const BARE = process.env.ARENADECOMP_BARE === '1';
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [43001, 43002, 43003, 43004, 43005, 43006, 43007, 43008];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-09', 'perseed-arenadecomp-b', 'sweep-winseek.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-09', 'perseed-arenadecomp-b');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// Writes go through a FRESH child process per attempt. Host EPERM-flap
// denial is STICKY per process once a write fails (2026-11-07: an in-process
// retry loop failed 300/300 over ~10 min while fresh processes wrote 1.5MB
// files 5/5 in the same minute). Retrying in-process is futile; each child
// reads the payload from stdin (a pipe, never a filesystem write), writes +
// readback-verifies + renames, and exits 0/1/3.
const CHILD_WRITER = `
// NOTE: with node -e, argv has NO script filename: args are argv[1]/argv[2].
const fs = require('fs');
const tmp = process.argv[1], dest = process.argv[2];
let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { data += c; });
process.stdin.on('end', () => {
  try {
    fs.writeFileSync(tmp, data);
    const back = fs.readFileSync(tmp, 'utf8');
    if (back.length !== data.length) process.exit(3);
    fs.renameSync(tmp, dest);
    process.exit(0);
  } catch (e) { process.exit(1); }
});
`;
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 300; i++) {
    const r = child_process.spawnSync(process.execPath,
      ['-e', CHILD_WRITER, tmp, filePath],
      { input: data, encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status === 0) return;
    if (i === 299) { console.error('WRITE FAIL LOUDLY', filePath, 'child status=' + r.status); process.exit(2); }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500 + Math.floor(Math.random() * 2500));
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed, days, opts) {
  const bare = !!(opts && opts.bare);
  const { Game } = await loadGame({ seed, mode: 'arenadecomp-b-winseek', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(),
    daySeries: [], sayWin: [],
    hurtEvents: [], contestTakes: [], arenaEvents: [], arenaAfterEvents: [],
    choiceOfferLines: [], choiceOfferCount: 0,
    deathSays: [], sitVerbMsgs: [], doorVerbMsgs: [],
    instrumentErrors: [],
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
  const npcName = (vid) => {
    try { const p = Game.getPerson && Game.getPerson(vid); if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
    return 'Someone';
  };
  // HP of a villager id as the engine reads it: the scholar's real pool is
  // scholar.health; everyone else reads v.health (default 100).
  const hpOf = (vid) => {
    try {
      if (vid === 'player' || vid === Game.villagerId) return ((Game.state || {}).scholar || {}).health;
      const h = (((Game.state || {}).village || {}).health || {})[vid];
      return h === undefined ? 100 : h;
    } catch (e) { return null; }
  };
  const healerPresentNow = () => {
    try { return Game.campHealerId ? Game.campHealerId('haven') != null : null; } catch (e) { return null; }
  };
  const beastWave = (mid) => {
    try {
      const m = (Game.data.monsters || []).find(function (x) { return x.id === mid; });
      return m ? (m.wave || 1) : null;
    } catch (e) { return null; }
  };
  // The victim's kills to date, from the engine's own per-kill log
  // (state.waveKillLog: {d, mid, w, by, via, trick}). Scholar kills are
  // filed under the scholar's villagerId; 'player' is counted too when the
  // victim IS the player, in case any call site files it that way.
  const veteranAtDeath = (vid, isPlayer) => {
    const out = { w3: 0, w4: 0, maxWave: 0, kills: [] };
    try {
      const log = (Game.state || {}).waveKillLog || [];
      for (const e of log) {
        if (!e) continue;
        if (e.by !== vid && !(isPlayer && e.by === 'player')) continue;
        const w = e.w | 0;
        if (w >= 3) out.w3++;
        if (w >= 4) out.w4++;
        if (w > out.maxWave) out.maxWave = w;
        out.kills.push({ d: e.d, mid: e.mid, w: w, via: e.via || null });
      }
    } catch (e) {}
    return out;
  };
  // The arena snapshot at death time (pure reads; see header note 6).
  const arenaSnapshot = (whoId, isPlayer) => {
    const snap = { arenaContest: null, activeContest: null, tbfight: null,
      veteran: null, hpAtDeath: null, contestsHeld: null };
    try {
      const arc = (Game.state || {}).arenaContest;
      if (arc) {
        const waves = Array.isArray(arc.waves) ? arc.waves.slice(0, 8) : null;
        const idx = arc.waveIdx | 0;
        const beastId = waves ? waves[idx] : null;
        snap.arenaContest = { contestId: arc.contestId || null, waveIdx: idx,
          waves: waves, beastId: beastId, beastWave: beastId ? beastWave(beastId) : null };
      }
    } catch (e) {}
    try {
      const ac = (Game.state || {}).activeContest;
      if (ac) {
        let scaled = null;
        try { if (typeof Game._cxScaledContest === 'function') scaled = Game._cxScaledContest(ac); } catch (e2) {}
        snap.activeContest = { contestId: ac.contestId || (scaled && scaled.id) || null,
          cat: (scaled && scaled.cat) || ac.cat || null,
          name: (scaled && scaled.name) || ac.name || null,
          participant: ac.participant || null,
          others: Array.isArray(ac.others) ? ac.others.slice(0, 8) : null,
          approach: ac._approach ? JSON.parse(JSON.stringify(ac._approach)) : null,
          refused: !!ac._refused };
      }
    } catch (e) {}
    try {
      const f = Game.tbfight;
      if (f) {
        snap.tbfight = { id: f.id || null, round: f.round == null ? null : f.round,
          fighters: (f.fighters || []).slice(0, 12).map(function (p) {
            return { key: p.key || null, kind: p.kind || null,
              villagerId: p.villagerId || null, hp: p.hp == null ? null : p.hp,
              maxHp: p.maxHp == null ? null : p.maxHp,
              alive: p.alive == null ? null : !!p.alive,
              taken: p._taken == null ? null : p._taken };
          }) };
      }
    } catch (e) {}
    try { snap.veteran = veteranAtDeath(whoId, isPlayer); } catch (e) {}
    try { snap.hpAtDeath = hpOf(whoId); } catch (e) {}
    try { snap.contestsHeld = (Game.state || {}).contestsHeld == null ? null : (Game.state || {}).contestsHeld; } catch (e) {}
    return snap;
  };

  // --- deaths: CALL-THROUGH capture (kept even in BARE mode: the documented
  // exception — it performs no Game-state writes and consumes no RNG, it only
  // appends to the external W array, so it cannot change the trajectory) ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    let row = null;
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const whoId = String((opts && (opts.villagerId || '')) || '');
        const who = whoId || String((opts && opts.name) || '?');
        const day = dayOf();
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          let whoName = who.slice(0, 24);
          try {
            const nm = Game.npcName && Game.npcName(who);
            if (nm && nm !== 'Someone') whoName = String(nm).slice(0, 24);
          } catch (e) {}
          const isPlayer = whoId ? (whoId === Game.villagerId) : false;
          row = { day, who: who.slice(0, 24), whoName, kind, cause,
            causeRaw: (opts && opts.cause) || null,
            monsterName: (opts && opts.monsterName) || null,
            monsterId: (opts && opts.monsterId) || null,
            isPlayer: isPlayer,
            sayWin: bare ? [] : W.sayWin.slice(-8),
            arena: arenaSnapshot(whoId, isPlayer) };
          W.deaths.push(row);
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  if (!bare) {
    // --- say-wrap death sample (prefloor pattern, tightened word-boundary regex)
    // + the choice-offer line capture (the engine's only exposed choice signal).
    const oSay = Game.say;
    if (typeof oSay === 'function') Game.say = function (txt) {
      try {
        W.sayWin.push('d' + dayOf() + ' ' + trunc(txt));
        if (W.sayWin.length > 20) W.sayWin.shift();
        if (typeof txt === 'string') {
          if (/offers you a choice/.test(txt)) {
            W.choiceOfferCount++;
            if (W.choiceOfferLines.length < 200) W.choiceOfferLines.push({ day: dayOf(), line: String(txt).slice(0, 300) });
          }
          if (/\bdead\b|\bdied\b|didn't come back|\bgrave\b|\bburied\b|\bscreams\b|starts digging|\bslain\b|\bis dead\b|\bveteran\b/i.test(txt) && W.deathSays.length < 400) W.deathSays.push({ day: dayOf(), line: String(txt).slice(0, 600) });
        }
      } catch (e) { W.instrumentErrors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return oSay.apply(this, arguments);
    };

    // --- door-verb wrappers: ANY sit-verb call contradicts the no-seat
    // configuration and is a loud contradiction, never smoothed. ---
    const snapTable = () => {
      const s = {};
      try {
        const T = (typeof Game.tableState === 'function') ? Game.tableState() : null;
        s.phase = T && T.phase != null ? String(T.phase) : null;
        s.path = T && T.path != null ? String(T.path) : null;
        s.branch = T && T.branch != null ? String(T.branch) : null;
        s.beat = T && T.beat != null ? (T.beat | 0) : null;
        s.trialPending = !!(T && T.trialPending);
      } catch (e) {}
      return s;
    };
    const offeredIds = () => {
      try {
        const tc = ((Game.state || {}).scholar || {}).tableChoices;
        return (tc && tc.options) ? tc.options.map(function (o) { return String(o.id); }) : [];
      } catch (e) { return []; }
    };
    ['tableTakeSeat', 'tableOfferSeatTaker', 'tableChooseSeatTaker', 'chooseTableOption'].forEach(function (name) {
      try {
        const inner = Game[name];
        if (typeof inner !== 'function') { W.instrumentErrors.push('doorverb-missing-' + name); return; }
        Game[name] = function () {
          const before = snapTable();
          const offered = offeredIds();
          let arg = null;
          try { arg = (arguments.length && arguments[0] != null) ? String(arguments[0]) : null; } catch (e) {}
          let ret;
          try { ret = inner.apply(this, arguments); } catch (e) { throw e; }
          try {
            const rec = { day: gday(Game), call: name, arg: arg, ok: !!(ret && ret.ok), msg: (ret && typeof ret.msg === 'string') ? ret.msg.slice(0, 200) : null, before: before, after: snapTable(), offered: offered };
            W.doorVerbMsgs.push(rec);
            if (name === 'tableTakeSeat' || name === 'tableOfferSeatTaker' || name === 'tableChooseSeatTaker') W.sitVerbMsgs.push(rec);
          } catch (e2) { W.instrumentErrors.push('doorverb-record: ' + String(e2.message).slice(0, 80)); }
          return ret;
        };
      } catch (e) { W.instrumentErrors.push('doorverb-install-' + name + ': ' + String(e.message).slice(0, 80)); }
    });

    // ---- NEW: hurtVillager wrapper (the sicknessdiag gap (c) fix) ----
    // Call-through; logs every damage event per villager per day with HP
    // before/after. Pure reads + an external append; consumes no RNG and
    // writes no Game state. A throwing inner call is re-thrown after the
    // (null-HP) record, so the engine's error behavior is unchanged.
    const oHV = Game.hurtVillager;
    if (typeof oHV === 'function') Game.hurtVillager = function (vid, dmg, cause, settlement, damageContext) {
      let normVid = vid;
      try { if (vid === 'player') normVid = Game.villagerId; } catch (e) {}
      let hpBefore = null;
      try { hpBefore = hpOf(normVid); } catch (e) {}
      let r, threw = null;
      try { r = oHV.apply(this, arguments); } catch (e) { threw = e; }
      try {
        let hpAfter = null;
        try { hpAfter = hpOf(normVid); } catch (e) {}
        W.hurtEvents.push({ day: dayOf(), who: String(normVid == null ? vid : normVid).slice(0, 24),
          whoName: npcName(normVid == null ? vid : normVid),
          dmg: dmg == null ? null : dmg, cause: cause == null ? null : String(cause).slice(0, 32),
          hpBefore: hpBefore, hpAfter: hpAfter,
          settlement: settlement != null,
          monsterId: (damageContext && damageContext.monsterId) || null,
          monsterName: (damageContext && damageContext.monsterName) || null,
          threw: threw ? String(threw.message || threw).slice(0, 80) : null });
      } catch (e) { W.instrumentErrors.push('hurtVillager-record: ' + String(e.message).slice(0, 80)); }
      if (threw) throw threw;
      return r;
    };
    else W.instrumentErrors.push('hurtVillager-missing');

    // ---- NEW: contestInterruption wrapper (contest takes + choice-offer signal) ----
    const oCI = Game.contestInterruption;
    if (typeof oCI === 'function') Game.contestInterruption = function (contest, participantIds) {
      const before = W.choiceOfferCount;
      let r, threw = null;
      try { r = oCI.apply(this, arguments); } catch (e) { threw = e; }
      try {
        let cat = null, nm = null, cid = null;
        try { cid = (contest && contest.id) || null; cat = (contest && contest.cat) || null; nm = (contest && contest.name) || null; } catch (e) {}
        const parts = Array.isArray(participantIds) ? participantIds.slice(0, 8) : (participantIds != null ? [String(participantIds)] : null);
        W.contestTakes.push({ day: dayOf(), contestId: cid, cat: cat, name: nm,
          participantIds: parts,
          isPlayerTake: !!(parts && parts.indexOf('player') >= 0),
          choiceOffered: W.choiceOfferCount > before,
          threw: threw ? String(threw.message || threw).slice(0, 80) : null });
      } catch (e) { W.instrumentErrors.push('contestInterruption-record: ' + String(e.message).slice(0, 80)); }
      if (threw) throw threw;
      return r;
    };
    else W.instrumentErrors.push('contestInterruption-missing');

    // ---- NEW: _contestArena wrapper (arena-fight starts) ----
    const oCA = Game._contestArena;
    if (typeof oCA === 'function') Game._contestArena = function (ac, spec, log) {
      let r, threw = null;
      try { r = oCA.apply(this, arguments); } catch (e) { threw = e; }
      try {
        const arc = (Game.state || {}).arenaContest;
        if (arc) {
          const waves = Array.isArray(arc.waves) ? arc.waves.slice(0, 8) : null;
          W.arenaEvents.push({ day: dayOf(), contestId: arc.contestId || (ac && ac.contestId) || null,
            waves: waves, beastWaves: waves ? waves.map(function (id) { return { id: id, wave: beastWave(id) }; }) : null,
            threw: threw ? String(threw.message || threw).slice(0, 80) : null });
        } else {
          W.arenaEvents.push({ day: dayOf(), contestId: (ac && ac.contestId) || null,
            waves: null, beastWaves: null, void: true,
            threw: threw ? String(threw.message || threw).slice(0, 80) : null });
        }
      } catch (e) { W.instrumentErrors.push('_contestArena-record: ' + String(e.message).slice(0, 80)); }
      if (threw) throw threw;
      return r;
    };
    else W.instrumentErrors.push('_contestArena-missing');

    // ---- NEW: _contestArenaAfter wrapper (arena outcomes) ----
    const oCAA = Game._contestArenaAfter;
    if (typeof oCAA === 'function') Game._contestArenaAfter = function (arc, result) {
      let r, threw = null;
      try { r = oCAA.apply(this, arguments); } catch (e) { threw = e; }
      try {
        W.arenaAfterEvents.push({ day: dayOf(), contestId: (arc && arc.contestId) || null,
          result: result == null ? null : String(result), waveIdx: arc ? (arc.waveIdx | 0) : null,
          threw: threw ? String(threw.message || threw).slice(0, 80) : null });
      } catch (e) { W.instrumentErrors.push('_contestArenaAfter-record: ' + String(e.message).slice(0, 80)); }
      if (threw) throw threw;
      return r;
    };
    else W.instrumentErrors.push('_contestArenaAfter-missing');
  } // end if (!bare) — recorders above are skipped in BARE mode

  const policy = Object.assign({}, winseek);
  const origDaily = winseek.daily;
  if (!bare) policy.daily = (G, ctx) => {
    try {
      const v = (G.state || {}).village || {};
      const roster = v.roster || [];
      const healthMap = {};
      try { for (const id of roster) { const h = (v.health || {})[id]; healthMap[id] = (h === undefined ? 100 : h); } } catch (e) {}
      W.daySeries.push({ day: dayOf(), pop: roster.length, healthMap: healthMap,
        healerPresent: healerPresentNow() });
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  // The fallen list is the authoritative death record (full entries incl.
  // monsterName) — read once at run end, a pure read.
  const fallen = (() => {
    try {
      const f = (((Game.state || {}).village || {}).fallen) || [];
      return JSON.parse(JSON.stringify(f));
    } catch (e) { return []; }
  })();
  const waveKillLog = (() => {
    try { return JSON.parse(JSON.stringify((Game.state || {}).waveKillLog || [])); } catch (e) { return []; }
  })();
  const contestDeathsById = (() => {
    try { return JSON.parse(JSON.stringify((Game.state || {}).contestDeathsById || {})); } catch (e) { return {}; }
  })();
  const contestsHeld = (() => {
    try { return (Game.state || {}).contestsHeld == null ? null : (Game.state || {}).contestsHeld; } catch (e) { return null; }
  })();

  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const finalPop = (() => { try { return (((Game.state || {}).village || {}).roster || []).length; } catch (e) { return null; } })();
  const deathKeys = W.deaths.map(d => d.day + '|' + d.who + '|' + d.cause).sort();
  const fingerprint = { seed, daysAlive: result.days, endReason: result.endReason,
    rank, maxWave, national, table: won, win: won,
    deathCauses, deathKeys, finalPop };
  if (bare) return { seed, perSeed: null, diag: null, fingerprint };

  const perSeed = {
    seed, policy: 'winseek',
    daysAlive: result.days, villageDays: W.daySeries.length,
    endReason: result.endReason,
    deathCauses, deathRows: W.deaths, fallen,
    daySeries: W.daySeries, national, rank,
    table: won, win: won,
    waveReach, finalPop,
    hurtEvents: W.hurtEvents,
    contestTakes: W.contestTakes, arenaEvents: W.arenaEvents,
    arenaAfterEvents: W.arenaAfterEvents,
    choiceOfferLines: W.choiceOfferLines,
    waveKillLog: waveKillLog, contestDeathsById: contestDeathsById,
    contestsHeld: contestsHeld,
    deathSays: W.deathSays, sitVerbMsgs: W.sitVerbMsgs, doorVerbMsgs: W.doorVerbMsgs,
    instrumentErrors: W.instrumentErrors,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave,
    deathRowCount: W.deaths.length, fallenCount: fallen.length, ms,
    hurtEventCount: W.hurtEvents.length,
    contestTakeCount: W.contestTakes.length,
    arenaEventCount: W.arenaEvents.length,
    arenaAfterCount: W.arenaAfterEvents.length,
    choiceOfferCount: W.choiceOfferCount,
    sitVerbCount: W.sitVerbMsgs.length, doorVerbCount: W.doorVerbMsgs.length,
    instrumentErrorCount: W.instrumentErrors.length,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly 43001-43008, got: ' + (process.env.SEEDS || '(unset)'));
    process.exit(2);
  }
  if (DAYS !== 150) {
    console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
    process.exit(2);
  }
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag, fingerprint } = await oneRun(seed, DAYS, { bare: false });
    rows.push({ seed: s, perSeed, diag, fingerprint });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    const file = path.join(PERSEED_DIR, `arenadecomp-b-winseek-s${s}.json`);
    if (fs.existsSync(file)) { console.error('SWEEP STOP: refusing to overwrite ' + file); process.exit(3); }
    writeRobust(file, JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} fallen=${diag.fallenCount} hurt=${diag.hurtEventCount} takes=${diag.contestTakeCount} arenaEv=${diag.arenaEventCount} arenaAfter=${diag.arenaAfterCount} choiceOffers=${diag.choiceOfferCount} sitVerbs=${diag.sitVerbCount} errors=${diag.instrumentErrorCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // BARE pass (G2 neutrality): same seeds/days/policy, recorders skipped.
  const bareRows = [];
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `arenadecomp-b-bare-s${seed}.json`),
      JSON.stringify(fingerprint));
    console.log(`bare seed=${seed} days=${fingerprint.daysAlive} end=${fingerprint.endReason} deaths=${Object.values(fingerprint.deathCauses).reduce((a, b) => a + b, 0)}`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  let merged = rows;
  try {
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      const bySeed = new Map();
      for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
      for (const r of rows) bySeed.set(r.seed, r);
      merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
    }
  } catch (e) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a - b);
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'winseek', policy: 'winseek', days: DAYS, seeds: allSeeds }, rows: merged, bare: bareRows }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows, ' + bareRows.length + ' bare)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, BATCH, DAYS, writeRobust };
