#!/usr/bin/env node
// journey-crisis-r85-delayed-20261031.js — CRISIS LEG (6) r85: DELAYED-SORTIE
// CRISIS SNAPSHOT + DRIFT CLASSIFICATION. Direct handoff from r52's metric
// review §1-§2: r52 left D4 inconclusive (no aidCrisis snapshot at sortie
// time) and its "drift" bucket conflated three exits. This driver is the r52
// driver verbatim EXCEPT: (1) snapCrisis() at every day boundary and
// before/after every sortie call; (2) resolveAidCrisis resolutions tagged
// 'sortie-call' vs 'tick'; (3) every drift classified melts-line /
// moved-on-valve / player-drawn-off / unknown; (4) removal records carry
// object identity + context. No src/js change; the game is untouched.
// The gorge text offers a sortie nobody has ever taken in a measured run,
// so this run INTERVENES: whenever a lingerer set is present at a day
// boundary, the driver answers it with Game.answerLingerer('sortie') —
// the exact beat-panel call app.js makes (kind 'lingerer', spec 'sortie').
// Up to twice per lingerer object (second only if it still lingers 3+
// days after the first). Endure is the control only where a sortie is
// refused (no fighters) or a set is truncated by horizon/village death.
//
// R58 (r57 verbatim EXCEPT): (1) lingerBook sorties increment gated on ret.ok, so a
// refused sortie no longer consumes a slot; (2) DEATH_SAY_RE died/dead word-boundaried,
// so 'bloodied' stare-down survivors stop landing in deathsDuringSay.
// PRE-REGISTRATION: goal hidden_files/evidence/2026-10-31/journey-crisis-r85-prereg.md
// Usage: SEED=9405 node scripts/journey-crisis-r85-delayed-20261031.js
// Output: JSON record to stdout; narrative to stderr (driver redirects).
// Per-seed transcripts: $EVID/journey-crisis-r85-seed<SEED>-*.txt
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '9405', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-31';

const RAID_RE = /🐗 RAID —/;
const DEFENSE_BEAT_RE = /🛡️ .* met them at the door/;
const UNMET_RE = /Nobody met .* — it's still out there at the treeline/;
const GORGE_RE = /🌙 Night\. The lingering .* gorges at the treeline/;
const SORTIE_RE = /⚔️ SORTIE —/;
const MELTS_RE = /melts back into the dark/;
const DRAWN_RE = /It followed you|You're on your own|won't follow much further|flagging — it won't follow/i;
const MOURN_RE = /mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|first grave|we buried|laid to rest|succumbed to|didn't come back/i;
const FABRIC_RE = /we've always|since the beginning|you remember when|like old times|remember the old|back when we|for as long as/i;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round(Game.pantryKcalLive(Game.state.village)); } catch (e) {
    try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e2) { return 0; }
  }
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
function aliveSet(Game) {
  const s = new Set();
  try {
    for (const id of (Game.state.village.roster || [])) {
      try { const vp = Game.vpOf(id); if (vp && !vp.dead) s.add(String(id)); } catch (e) {}
    }
  } catch (e) {}
  return s;
}
function displayNameOf(Game, obj) {
  try { return (Game.monsterDisplayName && Game.monsterDisplayName(obj.id)) || obj.id; } catch (e) { return obj.id; }
}

// R53: pure snapshot of the live aid crisis (comms.js aidCrisis() is a
// plain getter over state.aidCrisis — no mutation, verified by reading the
// source). Null means "no live crisis" and is itself data.
function snapCrisis(Game) {
  try {
    const c = Game.aidCrisis ? Game.aidCrisis() : null;
    if (!c) return null;
    return {
      name: c.name || null, wave: c.wave || null, sinceDay: c.sinceDay ?? null,
      raiders: !!c.raiders, ageParts: c.ageParts || 0,
      calls: (c.calls || []).length, helpAtDoor: (c.helpAtDoor || []).length,
      attracted: c.attracted || 0,
    };
  } catch (e) { return { error: String(e && e.message || e) }; }
}

let probeActive = false; // R82: true only while the post-convo probe calls convoFavorAction

function driveConvo(Game, vid, tag, out, opts) {
  const steerLately = !!(opts && opts.steerLately);
  let latelyOffered = false, latelyFired = false, subjectNavs = 0;
  out.push(`## ${tag} — talking to ${rawName(Game, vid)} (d${dayOf(Game)})`);
  const npcLines = [];
  let opened;
  try { opened = Game.startConvo(vid); } catch (e) { out.push(`(startConvo threw: ${e.message})`); return npcLines; }
  if (!opened || opened.refused || opened.ended) { out.push(`(conversation refused/ended)`); return npcLines; }
  for (let t = 0; t < 12; t++) {
    let choices;
    try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
    if (!choices.length) { out.push('(no choices offered)'); break; }
    // R82 STEER: on the steered convo, ask:lately wins on ANY turn, not
    // just t=0 — r71 never fired it first because it is often not
    // offered at convo open. PILOT AMENDMENT (seed 9407 v1): the driver
    // never even REACHES a menu offering ask:lately — its picks stay on
    // beats (betrayal/confront/comfort) and never take the subject pivot
    // ('dlg:subject'/'subject', which opens the topic menu where
    // ask:lately lives). So while steering, if lately is not offered,
    // take the subject pivot (max 2 navigations) to open that menu.
    // If the subject menu still offers no lately, the gate is closed
    // (t2LatelyEvent false) — recorded, not forced.
    let pick = null;
    if (steerLately && !latelyFired) {
      const lately = choices.find(c => c.id === 'ask:lately');
      if (lately) { latelyOffered = true; latelyFired = true; pick = lately; }
      else if (subjectNavs < 2) {
        const subj = choices.find(c => c.id === 'dlg:subject' || c.id === 'subject');
        if (subj) { subjectNavs++; pick = subj; }
      }
    }
    if (!pick) pick = (t === 0) ? choices.find(c => c.id === 'ask:lately') : null;
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /raid|siege|treeline|muster|afraid|worried|dead|died|gone|mourn|fight|defend|monster|shelter/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    // R82 RECORD FIX (post-panel, corrected placement): latelyOffered/
    // Fired reflect ANY ask:lately pick, steered or not — the first fix
    // sat before the generic fallback that actually selects lately on
    // most turns, so it still missed. Record-only: no Game call, no
    // RNG, no trajectory change. Panel re-run verifies byte-identical
    // transcripts.
    if (pick.id === 'ask:lately') { latelyOffered = true; latelyFired = true; }
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 90)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    let c;
    try { c = Game.convoGet(vid); } catch (e) { break; }
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    for (const e of (c.transcript || []).slice(-2)) {
      out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 420)}`);
      if (e.who !== 'you') npcLines.push(String(e.text));
    }
  }
  // R71 FAVOR-AVAILABILITY PROBE (r70 blank 2, read-only): dump every
  // disjunct of convoFavorAction's 'no longer available' line plus the
  // proximity components of the next check, so any occurrence of that
  // line in this transcript has a named cause in the same file.
  try {
    const fav = (typeof Game.convoGetFavor === 'function') ? Game.convoGetFavor(vid) : null;
    probeActive = true;
    let st = null;
    try { st = (typeof Game.convoFavorAction === 'function') ? Game.convoFavorAction(vid, fav) : null; } finally { probeActive = false; }
    const vv = Game.state.village || {}, ss = Game.state.scholar || {};
    let person = null, personDead = null, vpDead = null;
    try { person = Game.getPerson ? Game.getPerson(vid) : null; personDead = person ? !!person.dead : null; } catch (e) {}
    try { const vp = Game.vpOf ? Game.vpOf(vid) : null; vpDead = vp ? !!vp.dead : null; } catch (e) {}
    const node = vv.nodePos?.[vid] || { nx: vv.px ?? 4, ny: vv.py ?? 4 }, pos = vv.positions?.[vid];
    const haven = Game.map ? (Game.map.px === (vv.px ?? 4) && Game.map.py === (vv.py ?? 4)) : null;
    let cheb = null;
    try { if (pos && [pos.mx, pos.my, ss.mx, ss.my].every(Number.isFinite)) cheb = Math.max(Math.abs(pos.mx - ss.mx), Math.abs(pos.my - ss.my)); } catch (e) {}
    out.push('[FAVOR-PROBE] ' + JSON.stringify({ favorKind: fav ? fav.kind : null, favorState: fav ? fav.state : null, favorVid: fav ? fav.vid : null, statusReady: st ? !!st.ready : null, statusReason: st ? (st.reason || null) : null, rosterIncludes: (vv.roster || []).includes(vid), isPlayer: String(vid) === String(Game.villagerId), personExists: !!person, personDead, vpDead, away: !!(vv.away && vv.away[vid]), nodeNx: node.nx, nodeNy: node.ny, mapPx: Game.map ? Game.map.px : null, mapPy: Game.map ? Game.map.py : null, haven, npcInside: vv.npcInside ? !!vv.npcInside[vid] : null, scholarInside: ss.insideHaven !== false, posFinite: !!(pos && [pos.mx, pos.my, ss.mx, ss.my].every(Number.isFinite)), cheb }));
  } catch (e) { out.push('[FAVOR-PROBE error: ' + String(e && e.message || e) + ']'); }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  npcLines.latelyOffered = latelyOffered; npcLines.latelyFired = latelyFired; npcLines.subjectNavs = subjectNavs;
  return npcLines;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-delayed-r70', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, days: 0, endReason: '',
    raids: [], defenseBeats: [], defendedFights: [], unmetRaiders: [],
    gorgeNights: [], sorties: [], aidResolutions: [],
    deaths: [], sayLines: [], convosDriven: [], fabricHits: [], mournLines: [],
    removals: [], lingerDaily: [], census: null, crisisDaily: [],
    sortieFights: [], // fieldFight wrap, sortie-flagged only
    phoenixBurns: [], // R70: phoenixResolveBurn wrap, fight-grouped
    favorNoLongerCalls: [], // R82: convoFavorAction call-time 'no longer available' log
    instrumentErrors: [],
  };
  let sortieFlag = false;
  let wildFlag = false;
  let aidCtx = null; // R59: {m, outcome} while inside an aidFight call
  // R53 runtime-only logs (object identity cannot survive JSON.stringify).
  const removalLog = []; // {obj, day, id, name, hp, lingering, ctx}
  const recordErr = (where, e) => { try { rec.instrumentErrors.push({ where, err: String(e && e.message || e) }); } catch (e2) {} };

  const _say = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const day = dayOf(Game), line = String(t);
      rec.sayLines.push({ day, line });
      if (RAID_RE.test(line)) rec.raids.push({ day, line: line.slice(0, 200) });
      if (DEFENSE_BEAT_RE.test(line)) rec.defenseBeats.push({ day, line: line.slice(0, 300) });
      if (UNMET_RE.test(line)) rec.unmetRaiders.push({ day, line: line.slice(0, 200) });
      if (GORGE_RE.test(line)) rec.gorgeNights.push({ day, line: line.slice(0, 200) });
      if (MOURN_RE.test(line)) rec.mournLines.push({ day, line: line.slice(0, 200) });
      if (FABRIC_RE.test(line)) rec.fabricHits.push({ day, line: line.slice(0, 160) });
    } catch (e) {}
    return _say(t);
  };

  // R71 (=r70): fight-invocation stack for phoenix burn grouping (outermost
  // push/pop; burns outside any fight record fight=null).
  const fightStack = [];
  const _ff = Game.fieldFight ? Game.fieldFight.bind(Game) : null;
  if (_ff) {
    Game.fieldFight = function (leader, mdef, m, opts) {
      let r = null;
      fightStack.push((Game.__r71FightSeq = (Game.__r71FightSeq || 0) + 1));
      try { r = _ff(leader, mdef, m, opts); } catch (e) { r = null; }
      fightStack.pop();
      try {
        if (sortieFlag && r) rec.sortieFights.push({
          day: dayOf(Game), leader: String(leader), leaderName: rawName(Game, leader),
          monster: (mdef && mdef.id) || (m && m.id) || '?',
          outcome: r.outcome || '?', vTaken: r.vTaken || 0,
        });
      } catch (e) {}
      return r;
    };
  } else rec.fieldFightWrapMissing = true;

  // R59 CORPSE-COUNT CORRECTION: fieldFight writes wounds back onto
  // m.hp only when the monster lives; on vKill the world object keeps
  // pre-fight hp until the CALLER removes it after aidFight returns.
  // A lingeringRaiders() count taken inside aidFight therefore counts
  // the corpse. Track the fought monster + outcome so the resolve
  // wrap can report the TRUE count (corpse excluded on vKill).
  const _af = Game.aidFight ? Game.aidFight.bind(Game) : null;
  if (_af) {
    Game.aidFight = function (vid, mdef, m, opts) {
      aidCtx = { m: m || null, outcome: null };
      const _ffHere = Game.fieldFight;
      Game.fieldFight = function () {
        let r = null;
        try { r = _ffHere.apply(this, arguments); } catch (e) { r = null; }
        try { if (aidCtx && arguments[2] === aidCtx.m && r) aidCtx.outcome = r.outcome || null; } catch (e) {}
        return r;
      };
      let r;
      try { r = _af(vid, mdef, m, opts); } catch (e) { r = null; }
      Game.fieldFight = _ffHere;
      aidCtx = null;
      return r;
    };
  }

  const _rwm = Game.removeWorldMonster ? Game.removeWorldMonster.bind(Game) : null;
  if (_rwm) {
    Game.removeWorldMonster = function (m) {
      try {
        removalLog.push({
          obj: m, day: dayOf(Game), id: m && m.id, name: m ? displayNameOf(Game, m) : null,
          hp: m && (m.hp || 0), lingering: !!(m && m.lingering),
          ctx: sortieFlag ? 'sortie' : (wildFlag ? 'wild' : 'other'),
        });
      } catch (e) { recordErr('removeWorldMonster-wrap', e); }
      return _rwm(m);
    };
  } else rec.fieldFightWrapMissing = rec.fieldFightWrapMissing || false;
  const _rac = Game.resolveAidCrisis ? Game.resolveAidCrisis.bind(Game) : null;
  if (_rac) {
    Game.resolveAidCrisis = function (how) {
      let before = null, lingeringAtResolution = null;
      try { before = snapCrisis(Game); } catch (e) { recordErr('resolveAidCrisis-before', e); }
      // R54 RESOLUTION CENSUS: lingerers alive at the moment of
      // resolution. 'fought' with lingerers remaining is an
      // EARLY-RESOLUTION instance (aidFight's unconditional path).
      // lingeringAtResolution is the legacy r57/r58 count (it counts
      // the not-yet-removed corpse on a vKill inside aidFight);
      // lingeringAtResolutionTrue excludes that corpse by identity
      // when the resolution fires inside an aidFight vKill.
      try { lingeringAtResolution = (Game.lingeringRaiders ? Game.lingeringRaiders() : []).length; } catch (e) { recordErr('lingeringAtResolution', e); }
      let lingeringAtResolutionTrue = lingeringAtResolution;
      try {
        if (aidCtx && aidCtx.outcome === 'vKill' && aidCtx.m && Game.lingeringRaiders) {
          lingeringAtResolutionTrue = Game.lingeringRaiders().filter(x => x && x !== aidCtx.m && (x.hp || 0) > 0).length;
        }
      } catch (e) { recordErr('lingeringAtResolutionTrue', e); }
      let r;
      try { r = _rac(how); } catch (e) { r = null; }
      try {
        rec.aidResolutions.push({
          day: dayOf(Game), how: String(how), via: 'wrap',
          during: sortieFlag ? 'sortie-call' : 'tick',
          crisisBefore: before, lingeringAtResolution, lingeringAtResolutionTrue,
          returned: (r === null ? null : String(r)),
        });
      } catch (e) { recordErr('resolveAidCrisis-wrap', e); }
      return r;
    };
  }
  const _rwme = Game.resolveWildMonsterEncounter ? Game.resolveWildMonsterEncounter.bind(Game) : null;
  if (_rwme) {
    Game.resolveWildMonsterEncounter = function (vid, m, opts) {
      let rec2 = null;
      const prevWild = wildFlag;
      wildFlag = true;
      try { rec2 = _rwme(vid, m, opts); } catch (e) { rec2 = null; }
      wildFlag = prevWild;
      try {
        if (opts && opts.raid && rec2) rec.defendedFights.push({
          day: dayOf(Game), vid: String(vid), name: rawName(Game, vid),
          monster: (m && (m.id || m.name)) || '?', outcome: rec2.outcome || '?', vTaken: rec2.vTaken || 0,
        });
      } catch (e) { recordErr('resolveWildMonsterEncounter-wrap', e); }
      return rec2;
    };
  }

  // R71 (=r70) PHOENIX BURN RECORDER: phoenixResolveBurn is the actual burn
  // (LinkBeat narration alone overcounts: a 'protest' beat starts a
  // struggle, not a burn). fight = enclosing fieldFight invocation id,
  // or null outside a fight.
  const _prb = Game.phoenixResolveBurn ? Game.phoenixResolveBurn.bind(Game) : null;
  if (_prb) {
    Game.phoenixResolveBurn = function (bearerIsPlayer, bearerVid, victimVid, opts) {
      try {
        rec.phoenixBurns.push({
          day: dayOf(Game),
          bearerIsPlayer: !!bearerIsPlayer,
          bearer: bearerIsPlayer ? 'player' : rawName(Game, bearerVid),
          victim: rawName(Game, victimVid),
          willing: !!(opts && opts.willing),
          fight: fightStack.length ? fightStack[fightStack.length - 1] : null,
        });
      } catch (e) { recordErr('phoenixBurn-wrap', e); }
      return _prb(bearerIsPlayer, bearerVid, victimVid, opts);
    };
  } else rec.phoenixBurnWrapMissing = true;

  // R82 FAVOR CALL-TIME WRAP (r71 D2 blank): convoFavorAction is a
  // read-only readiness getter, so wrapping it changes no game
  // behavior — it only logs calls returning 'They are no longer
  // available to receive help.' with the four disjuncts computed AT
  // CALL TIME (the post-convo probe loses this for favors closed
  // in-convo). Dedupe by (day, vid, favorId): first call + count,
  // since the engine calls it several times per menu.
  const _cfa = Game.convoFavorAction ? Game.convoFavorAction.bind(Game) : null;
  if (_cfa) {
    const _favorSeen = new Map();
    Game.convoFavorAction = function (vid, favor) {
      let st;
      try { st = _cfa(vid, favor); } catch (e) { throw e; }
      try {
        if (st && st.reason === 'They are no longer available to receive help.') {
          const vv = Game.state.village || {};
          let person = null, personDead = null;
          try { person = Game.getPerson ? Game.getPerson(vid) : null; personDead = person ? !!person.dead : null; } catch (e) {}
          const key = dayOf(Game) + '|' + String(vid) + '|' + (favor && favor.id);
          if (_favorSeen.has(key)) { _favorSeen.get(key).calls++; }
          else {
            const entry = { day: dayOf(Game), vid: String(vid), name: rawName(Game, vid), favorKind: favor ? favor.kind : null, favorState: favor ? favor.state : null, favorId: favor ? favor.id : null, source: probeActive ? 'probe' : 'engine', rosterIncludes: (vv.roster || []).includes(vid), isPlayer: String(vid) === String(Game.villagerId), personExists: !!person, personDead, calls: 1 };
            _favorSeen.set(key, entry); rec.favorNoLongerCalls.push(entry);
          }
        }
      } catch (e) { recordErr('favorNoLonger-wrap', e); }
      return st;
    };
  } else rec.favorNoLongerWrapMissing = true;

  const policy = {
    id: 'crisis-journey-r70',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };

  // Per-lingerer-object sortie bookkeeping (object identity: ids repeat).
  const lingerBook = new Map(); // obj -> {id, firstSeenDay, sorties, lastSortieDay, clearedBySortieDay}
  let convosThisRun = 0, raidConvoDone = new Set(), defenderSteered = false;
  let prevLingering = []; // [{obj, id, name, firstSeenDay}] from previous day-boundary
  rec.drifts = [];
  // R53 drift-window cursors: say/resolution/removal indices at the last
  // drift check, so each vanished object is classified from exactly one
  // window of evidence (previous boundary's sortie + this day's runDays).
  let lastSayIdx = 0, lastResIdx = 0, lastRemIdx = 0;
  let deadTail = 0, endReason = 'horizon', seenDeaths = 0;

  for (let d = 1; d <= DAYS; d++) {
    let res;
    const sayMark = rec.sayLines.length;
    const fightsMark = rec.sortieFights.length;
    try { res = await runDays(Game, policy, { days: 1, sampleEvery: 1 }); }
    catch (e) { endReason = 'threw:' + e.message; break; }
    rec.days = d;
    try {
      const ds = (res.samples && res.samples.deaths) || [];
      for (const de of ds.slice(seenDeaths)) {
        seenDeaths++;
        rec.deaths.push({ day: dayOf(Game), name: rawName(Game, de.who), cause: String(de.cause || de.how || ''), player: !!de.player });
      }
    } catch (e) {}

    // ---- DAY-BOUNDARY SORTIE DECISION ----
    try {
      const day = dayOf(Game);
      let lingering = [];
      try { lingering = (Game.worldMonsters() || []).filter(m => m && m.lingering && (m.hp || 0) > 0); } catch (e) {}
      rec.lingerDaily.push({ day, n: lingering.length });
      try { rec.crisisDaily.push({ day, crisis: snapCrisis(Game), lingering: lingering.length }); } catch (e) { recordErr('crisisDaily', e); }
      // R54 EPISODE RESET (r53 metric review §2): an object absent from
      // >=1 day-boundary set whose previous episode ENDED (cleared by a
      // sortie, or drifted away and recorded) starts a NEW episode on
      // reappearance: firstSeenDay resets, sorties reset. firstSeenEver
      // is kept so old-vs-new nightsWaited can be compared. A mid-fight
      // lift across one boundary can also split an episode (it drifts
      // 'unknown' first) — visible via resetReason, not hidden.
      const todaySet = new Set(lingering);
      for (const m of lingering) {
        if (!lingerBook.has(m)) lingerBook.set(m, { id: m.id, name: displayNameOf(Game, m), firstSeenDay: day, firstSeenEver: day, episode: 1, sorties: 0, lastSortieDay: null, clearedBySortieDay: null, draftHp: m.hp || 0, absentBoundaries: 0, drifted: false, lastSeenDay: day, resetReason: null });
        else {
          const b = lingerBook.get(m);
          if (b.absentBoundaries > 0 && (b.clearedBySortieDay !== null || b.drifted)) {
            const wasCleared = b.clearedBySortieDay !== null;
            b.episode++; b.firstSeenDay = day; b.sorties = 0; b.lastSortieDay = null; b.clearedBySortieDay = null; b.drifted = false;
            b.resetReason = wasCleared ? 're-linger-after-clear' : 're-linger-after-drift';
          }
          b.lastSeenDay = day; b.absentBoundaries = 0;
        }
      }
      for (const [obj, b] of lingerBook) if (!todaySet.has(obj)) b.absentBoundaries++;
      // R53 drift classification: objects lingering yesterday, gone today,
      // not cleared by a sortie on this boundary (sorties run below, so a
      // disappearance recorded here predates today's sortie). Exactly one
      // label per object, priority-ordered; 'unknown' is a finding.
      try {
        const sayWindow = rec.sayLines.slice(lastSayIdx);
        const resWindow = rec.aidResolutions.slice(lastResIdx);
        const remWindow = removalLog.slice(lastRemIdx);
        for (const prev of prevLingering) {
          if (todaySet.has(prev.obj)) continue;
          const b = lingerBook.get(prev.obj);
          const names = [prev.name, prev.id].filter(Boolean);
          let label = 'unknown', evidence = null;
          if (b && b.clearedBySortieDay !== null) {
            label = 'sortie-clear'; evidence = 'clearedBySortieDay=' + b.clearedBySortieDay;
          } else {
            const melts = sayWindow.find(s => MELTS_RE.test(s.line) && names.some(nm => s.line.indexOf(nm) !== -1));
            if (melts) { label = 'melts-line'; evidence = melts.line.slice(0, 160); }
            else {
              const moved = resWindow.find(r => r.how === 'moved-on');
              if (moved) { label = 'moved-on-valve'; evidence = 'resolution day ' + moved.day + ' during ' + moved.during; }
              else {
                const drawnLine = sayWindow.find(s => DRAWN_RE.test(s.line) && names.some(nm => s.line.indexOf(nm) !== -1));
                const drawnRem = remWindow.find(r => r.obj === prev.obj && r.ctx !== 'sortie');
                if (drawnLine || drawnRem) { label = 'player-drawn-off'; evidence = drawnLine ? drawnLine.line.slice(0, 160) : ('removal ctx ' + drawnRem.ctx + ' id ' + drawnRem.id); }
              }
            }
          }
          if (b && label !== 'sortie-clear') b.drifted = true;
          rec.drifts.push({ day, id: prev.id, name: prev.name || null, firstSeenDay: prev.firstSeenDay, firstSeenEver: b ? b.firstSeenEver : null, episode: b ? b.episode : null, nightsWaited: day - prev.firstSeenDay, nightsWaitedOld: b ? (day - b.firstSeenEver) : null, sortiesBefore: b ? b.sorties : null, clearedBySortieDay: b ? b.clearedBySortieDay : null, label, evidence });
        }
        lastSayIdx = rec.sayLines.length; lastResIdx = rec.aidResolutions.length; lastRemIdx = removalLog.length;
      } catch (e) { recordErr('drift-classify', e); }
      prevLingering = lingering.map(m => ({ obj: m, id: m.id, name: lingerBook.get(m).name, firstSeenDay: lingerBook.get(m).firstSeenDay, firstSeenEver: lingerBook.get(m).firstSeenEver, episode: lingerBook.get(m).episode }));
      // R52 DELAYED RULE: first sortie only at >=3 nights waited; second
      // only if still lingering 3+ days after the first (r50 rule).
      const needsSortie = lingering.filter(m => {
        const b = lingerBook.get(m);
        if (!b) return false;
        if (b.sorties === 0) return day - b.firstSeenDay >= 3;
        if (b.sorties < 2 && b.lastSortieDay !== null && day - b.lastSortieDay >= 3) return true;
        return false;
      });
      if (needsSortie.length && typeof Game.answerLingerer === 'function') {
        const pantryBefore = pantryKcal(Game);
        const aliveBefore = aliveSet(Game);
        const deadBeforeNames = new Set();
        try {
          for (const id of (Game.state.village.roster || [])) {
            const vp = Game.vpOf(id);
            if (vp && vp.dead) deadBeforeNames.add(rawName(Game, id));
          }
        } catch (e) {}
        const beforeSnap = lingering.map(m => ({ obj: m, id: m.id, name: displayNameOf(Game, m), hp: m.hp || 0 }));
        const sayBefore = rec.sayLines.length;
        let ret = null, retErr = null;
        // R53: crisis snapshot around the sortie call (D4 instrument fix).
        const crisisBefore = snapCrisis(Game);
        const resBefore = rec.aidResolutions.length;
        sortieFlag = true;
        try { ret = Game.answerLingerer('sortie'); } catch (e) { retErr = String(e && e.message || e); }
        sortieFlag = false;
        const crisisAfter = snapCrisis(Game);
        const resolutionsDuring = rec.aidResolutions.slice(resBefore);
        const pantryAfter = pantryKcal(Game);
        const callLines = rec.sayLines.slice(sayBefore).map(s => s.line);
        const sortieLine = callLines.find(l => SORTIE_RE.test(l)) || null;
        // R57 MUSTER PARSING (r54 metric review §2): the sortie line
        // names the muster ("SORTIE — Dina, Yawo take up arms"), so
        // death lines are matched against roster ∪ muster, not the
        // roster alone. A death line matching neither stays visible
        // as an unattributed line in the analyzer.
        let musterNames = [];
        if (sortieLine) {
          const mm = /SORTIE — (.+?) take up arms/.exec(sortieLine);
          if (mm) musterNames = mm[1].split(/,\s*|\s+and\s+/).map(s => s.trim()).filter(Boolean);
        }
        const worldAfter = (() => { try { return Game.worldMonsters() || []; } catch (e) { return []; } })();
        const afterSnap = beforeSnap.map(b => {
          const still = worldAfter.find(w => w === b.obj);
          return {
            id: b.id, name: b.name, hpBefore: b.hp,
            removed: !still, lingeringAfter: still ? !!still.lingering : null, hpAfter: still ? (still.hp || 0) : null,
          };
        });
        const deadAfter = [];
        try {
          for (const id of (Game.state.village.roster || [])) {
            const vp = Game.vpOf(id);
            if (vp && vp.dead && aliveBefore.has(String(id))) deadAfter.push(rawName(Game, id));
          }
        } catch (e) {}
        const musterSize = (ret && typeof ret.paid === 'number' && ret.paid > 0) ? Math.round(ret.paid / 2000) : null;
        const deadInMusterLine = sortieLine ? [...deadBeforeNames].filter(nm => sortieLine.indexOf(nm) !== -1) : [];
        // R54 SAY-LINE DEATH ACCOUNTING (r53 metric review §4): the
        // roster diff misses non-roster muster deaths (r53 9406 Dina).
        // Scan the sortie call's own say lines for death language and
        // attribute villager names found in them.
        const DEATH_SAY_RE = /didn't come back|carries the body|goes down|fell at|fell in|\bdied\b|\bdead\b|buried|laid to rest|succumbed|didn't make it|mourn|grief|grave/i;
        const rosterNames = [];
        try {
          for (const id of (Game.state.village.roster || [])) {
            const nm = rawName(Game, id);
            if (nm) rosterNames.push(nm);
          }
        } catch (e) {}
        const deathsDuringSay = [];
        for (const l of callLines) {
          if (!DEATH_SAY_RE.test(l)) continue;
          const namesRoster = rosterNames.filter(nm => nm && l.indexOf(nm) !== -1);
          const namesMuster = musterNames.filter(nm => nm && l.indexOf(nm) !== -1);
          const names = [...new Set([...namesRoster, ...namesMuster])];
          deathsDuringSay.push({ line: l.slice(0, 300), names, namesRoster, namesMuster });
        }
        const episodeInfo = lingering.filter(m => lingerBook.get(m)).map(m => {
          const b = lingerBook.get(m);
          return { id: b.id, episode: b.episode, firstSeenDay: b.firstSeenDay, firstSeenEver: b.firstSeenEver };
        });
        const entry = {
          day, attempt: rec.sorties.length + 1,
          nightsWaited: Math.max(...lingering.filter(m=>lingerBook.get(m)).map(m=>day - lingerBook.get(m).firstSeenDay), 0),
          targets: beforeSnap.map(b => ({ id: b.id, name: b.name, hp: b.hp })),
          ret: ret ? { ok: !!ret.ok, cleared: ret.cleared, broke: !!ret.broke, remaining: ret.remaining, paid: ret.paid, why: ret.why || null } : null,
          retErr, crisisBefore, crisisAfter, resolutionsDuring,
          pantryBefore, pantryAfter, pantryDelta: pantryAfter - pantryBefore,
          musterSize, musterNames, sortieLine: sortieLine ? sortieLine.slice(0, 300) : null,
          callLines: callLines.map(l => l.slice(0, 300)),
          fights: rec.sortieFights.slice(fightsMark),
          after: afterSnap, deathsDuring: deadAfter, deadInMusterLine,
          deathsDuringSay, episodeInfo,
        };
        rec.sorties.push(entry);
        for (const m of lingering) {
          const b = lingerBook.get(m);
          if (b && ret && ret.ok) { b.sorties++; b.lastSortieDay = day; } // R58: refused calls consume no slot
        }
        // Mark cleared objects (removed, or lingering=false) for the gorge-after check.
        for (let i = 0; i < beforeSnap.length; i++) {
          const a = afterSnap[i];
          if (a.removed || a.lingeringAfter === false) {
            const b = lingerBook.get(beforeSnap[i].obj);
            if (b) b.clearedBySortieDay = day;
          }
        }
      }
    } catch (e) { rec.sortieDecisionError = String(e && e.message || e); }

    // ---- convos: defender-after-resolution + day+2 sheltered witness, cap 8 ----
    // R71 DEFENDER FIX (r70 blank 1): the day-boundary block runs the
    // morning AFTER a raid day, so a raid-day check never fires here.
    // defendedFights are recorded with the raid day, so the defender
    // convo triggers when yesterday's boundary-day-minus-1 fights exist
    // (first convo opportunity after the resolution), and the speaker
    // MUST be a recorded defender of that fight day, never a fallback
    // roster member (a fallback would fake the D1 speaker-fought bar).
    try {
      const day = dayOf(Game);
      const defendedYesterday = rec.defendedFights.filter(f => f.day === day - 1 && String(f.vid) !== String(Game.villagerId));
      const raidDayMinus2 = rec.raids.some(r => day - r.day === 2);
      if ((defendedYesterday.length > 0 || raidDayMinus2) && convosThisRun < 8 && !raidConvoDone.has(day)) {
        raidConvoDone.add(day);
        const v = Game.state.village || {};
        let target = null, tag = '';
        if (defendedYesterday.length > 0) {
          const def = defendedYesterday[0];
          target = def ? def.vid : null;
          tag = 'DEFENDER-after-resolution';
        } else {
          let sh = [];
          try { sh = Game.shelteredVillagers ? Game.shelteredVillagers() : []; } catch (e) {}
          target = (sh && sh.length ? sh[0] : (v.roster || []).find(r => String(r) !== String(Game.villagerId)));
          tag = 'SHELTERED-two-days-after';
        }
        // R85 V2 PROBE (r82-probe-d23 pattern, every defender morning):
        // read-only dump of the lately slot for the defender target —
        // what kind would the slot carry, and is ask:lately among the
        // offered asks. Writes probe JSONs only; trajectory unchanged.
        if (target && tag === 'DEFENDER-after-resolution') {
          try {
            const mem = (typeof Game.t2mem === 'function') ? Game.t2mem(target) : null;
            const ev = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(target) : null;
            const asks = (typeof Game.topic2Asks === 'function') ? Game.topic2Asks(target) : null;
            fs.writeFileSync(path.join(EVID, `r85-probe-seed${SEED}-d${day}.json`), JSON.stringify({ day, target, name: rawName(Game, target), defendedYesterday, mem: (mem || []).filter(m => m && (m.t === 'defended' || m.t === 'mustered')).slice(-6), ev, asks: (asks || []).map(a => a.id) }, null, 1), 'utf8');
          } catch (e) { fs.writeFileSync(path.join(EVID, `r85-probe-seed${SEED}-d${day}-error.txt`), String(e && e.message || e), 'utf8'); }
        }
        if (target) {
          const lines = [];
          const steerThis = (tag === 'DEFENDER-after-resolution' && !defenderSteered);
          if (steerThis) defenderSteered = true;
          const npc = driveConvo(Game, target, `seed${SEED} d${day} ${tag}`, lines, steerThis ? { steerLately: true } : null);
          const f = `probe-r85-seed${SEED}-d${day}-${tag.toLowerCase().replace(/[^a-z]+/g, '-')}.txt`;
          fs.writeFileSync(path.join(EVID, f), lines.join('\n'), 'utf8');
          // R54 CONTEST HISTORY (r53 metric review §3): snapshot the
          // player's contest history with the convo, so lines that
          // reference contests become verifiable instead of plausible.
          let playerContests = null;
          try {
            playerContests = {
              held: (Game.state && Game.state.contestsHeld) || 0,
              seen: Object.keys((Game.state && Game.state.contestsSeen) || {}),
            };
          } catch (e) { recordErr('playerContests-snapshot', e); }
          rec.convosDriven.push({ day, tag, file: f, vid: String(target), npcLines: npc.length, playerContests, latelySteered: steerThis, latelyOffered: !!npc.latelyOffered, latelyFired: !!npc.latelyFired, subjectNavs: npc.subjectNavs || 0 });
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

  // ---- gorge-after check (name-matched, secondary — r48 trap acknowledged) ----
  try {
    const cleared = [];
    for (const [obj, b] of lingerBook) {
      if (b.clearedBySortieDay !== null) {
        const names = [];
        try { names.push(displayNameOf(Game, obj)); } catch (e) {}
        if (b.id) names.push(b.id);
        const afterLines = rec.sayLines.filter(s => s.day > b.clearedBySortieDay && GORGE_RE.test(s.line) && names.some(nm => nm && s.line.indexOf(nm) !== -1));
        cleared.push({ id: b.id, clearedDay: b.clearedBySortieDay, gorgeAfterNameMatched: afterLines.map(s => ({ day: s.day, line: s.line.slice(0, 160) })) });
      }
    }
    rec.clearedGorgeAfter = cleared;
    rec.lingerBook = [...lingerBook.values()].map(b => ({ id: b.id, name: b.name || null, firstSeenDay: b.firstSeenDay, firstSeenEver: b.firstSeenEver, episode: b.episode, sorties: b.sorties, lastSortieDay: b.lastSortieDay, clearedBySortieDay: b.clearedBySortieDay, draftHp: b.draftHp, absentBoundaries: b.absentBoundaries, drifted: b.drifted, resetReason: b.resetReason }));
    // Serialize the runtime removal log without object refs.
    try { rec.removals = removalLog.map(r => ({ day: r.day, id: r.id, name: r.name, hp: r.hp, lingering: r.lingering, ctx: r.ctx })); } catch (e) { recordErr('removals-serialize', e); }
  } catch (e) { rec.gorgeAfterError = String(e && e.message || e); }

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
      aliveCount: alive.length, alive, dead, corpses, pantryKcal: pantryKcal(Game),
    };
  } catch (e) { rec.census = { error: e.message }; }

  console.log(JSON.stringify(rec));
}

(async () => {
  try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
  try { await main(); }
  catch (e) { console.log(JSON.stringify({ seed: SEED, error: String(e && e.message || e) })); }
})();
