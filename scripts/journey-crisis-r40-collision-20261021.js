#!/usr/bin/env node
// journey-crisis-r40-collision-20261021.js — CRISIS LEG r40: the interruption collision.
// Leg question: contests are UNAVOIDABLE and raids are reactive; when they collide —
// a grab on a raid day, a raid on a contest day, a lingering siege while the stars are
// on camera — does the village hold, or does something stick?
// Canon: docs/CONTESTS.md (played not RNG; unavoidable), docs/MONSTER-WAVES.md.
// Instruments: fireContest + contestInterruption (day, cat, participants incl player),
// havenRaidTick, lingering episodes (r38 tracker), resolveWildMonsterEncounter {raid:true},
// registerDeath (person filter), resolveAidCrisis, raidPillage.
// Collision = a contest day d with (lingering episode open at d) OR (raid fired d-1..d+1)
// OR (raid crisis open at d) OR ({raid:true} fights on d); plus raids firing on days a
// roster villager was contest-taken.
// Usage: SEED=101 node scripts/journey-crisis-r40-collision-20261021.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const ESTABLISH = 20, WINDOW_DAYS = parseInt(process.env.WINDOW_DAYS || '70', 10);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return 0; }
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function lingeringCount(Game) {
  try { return (Game.lingeringRaiders() || []).length; } catch (e) { return 0; }
}
function isPersonDeath(o) {
  const k = String((o && o.kind) || '');
  return k === 'person' || k === 'villager';
}

function pickLately(choices, lastPickId) {
  let pool = choices.filter(c => c.id !== lastPickId);
  if (!pool.length) pool = choices;
  let pick = pool.find(c => c.id === 'ask:lately');
  if (!pick) pick = pool.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
  if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id));
  return pick || null;
}

// One ask:lately convo with a witness after a collision. The TOPIC is the NPC's
// own — the driver only asks "what's new". Scans NPC lines for defense content
// and for contest/taken/camera content (does the village acknowledge?).
function driveLately(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 8;
  const out = [`## ${tag} — lately with ${firstName(rawName(Game, vid))} (d${dayOf(Game)})`];
  const npcLines = [];
  let lastPickId = null;
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', defense: false, contest: false }; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const pick = pickLately(choices, lastPickId);
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    lastPickId = pick.id;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) {
      out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
      if (e.who !== 'you') npcLines.push(String(e.text));
    }
    out.push('');
    if (pick.id === 'ask:lately' && t >= 1) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const defenseRe = /raid|treeline|defend|defense|defended|stood|fought|fight|monster|attack|wound/i;
  const contestRe = /contest|taken|grabbed|camera|show|arena|lights|System took|watch/i;
  return {
    text: out.join('\n'),
    defense: npcLines.some(l => defenseRe.test(l)),
    contest: npcLines.some(l => contestRe.test(l)),
    npcLines: npcLines.slice(0, 12),
  };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-collision-r40', fullTelemetry: true });
  await setupGame(Game);
  const playerVid = (() => { try { return String(Game.villagerId || ''); } catch (e) { return ''; } })();
  const rec = {
    seed: SEED, playerVid,
    raids: [], raidFights: [], contests: [], deaths: [], crises: [],
    aidResolutions: [], gorges: [], latelyConvos: [], episodes: [],
    dawns: [], notes: [], sayLog: [], convos: [], tickOrder: [],
  };

  // ---- instrumentation (all call-through) ----
  const _say = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (/📺|💀|mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|🐗 RAID|lingering|gorges at the treeline|drove them back|met them at the door|Nobody met|treeline is quiet|still hold.*treeline|didn't come back|drift off|moved-on|The treeline holds|taken|CONTEST|INTERRUPTION/i.test(s))
        rec.sayLog.push({ day: dayOf(Game), line: s.slice(0, 280) });
    } catch (e) {}
    return _say ? _say.apply(this, arguments) : undefined;
  };
  const _raidTick = Game.havenRaidTick;
  Game.havenRaidTick = function () {
    const before = ((Game.state.village || {}).lastRaidDay) || 0;
    const r = _raidTick ? _raidTick.apply(this, arguments) : false;
    const after = ((Game.state.village || {}).lastRaidDay) || 0;
    rec.tickOrder.push({ day: dayOf(Game), event: 'havenRaidTick', fired: after > before });
    if (after > before) {
      rec.raids.push({ day: dayOf(Game), lingeringAfter: lingeringCount(Game) });
      E(`[RAID] d${dayOf(Game)} fired; lingering=${lingeringCount(Game)}`);
    }
    return r;
  };
  const _fireContest = Game.fireContest;
  Game.fireContest = function (contest) {
    rec.tickOrder.push({ day: dayOf(Game), event: 'fireContest', id: (contest && contest.id) || '?' });
    const r = _fireContest ? _fireContest.apply(this, arguments) : undefined;
    try {
      // participants are chosen inside fireContest; recover from the taken line via tele is hard —
      // record what we can: contest id/cat; interruption instrument captures participants.
      rec.contests.push({
        day: dayOf(Game), id: String((contest && contest.id) || '?'),
        name: String((contest && contest.name) || '?').slice(0, 60),
        cat: String((contest && contest.cat) || '?'),
        risk: String((contest && contest.risk) || '?'),
        participants: [], playerTaken: false, via: 'fireContest',
      });
      E(`[CONTEST] d${dayOf(Game)} fired: ${(contest && contest.name) || '?'} (${(contest && contest.cat) || '?'})`);
    } catch (e) {}
    return r;
  };
  const _cxInterrupt = Game.contestInterruption;
  Game.contestInterruption = function (contest, participantIds) {
    const ids = Array.isArray(participantIds) ? participantIds.slice() : [participantIds];
    const r = _cxInterrupt ? _cxInterrupt.apply(this, arguments) : undefined;
    try {
      const playerTaken = ids.includes('player') || ids.includes(playerVid);
      const others = ids.filter(id => id !== 'player' && id !== playerVid)
        .map(id => firstName(rawName(Game, id)));
      // attach participants to the most recent contest record for today
      const mine = [...rec.contests].reverse().find(c => c.day === dayOf(Game));
      if (mine) { mine.participants = ids.map(String); mine.playerTaken = playerTaken; mine.via = 'interruption'; }
      else rec.contests.push({
        day: dayOf(Game), id: String((contest && contest.id) || '?'),
        name: String((contest && contest.name) || '?').slice(0, 60),
        cat: String((contest && contest.cat) || '?'), risk: String((contest && contest.risk) || '?'),
        participants: ids.map(String), playerTaken, via: 'interruption-direct',
      });
      E(`[TAKEN] d${dayOf(Game)} player=${playerTaken} others=[${others.join(',')}]`);
    } catch (e) {}
    return r;
  };
  const _rwme = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) {
    const r = _rwme ? _rwme.apply(this, arguments) : undefined;
    try {
      if (opts && opts.raid) {
        rec.raidFights.push({ day: dayOf(Game), vid: String(vid).slice(0, 16), outcome: (r && r.outcome) || '?' });
        E(`[RAIDFIGHT] d${dayOf(Game)} ${firstName(rawName(Game, vid))}: ${(r && r.outcome) || '?'}`);
      }
    } catch (e) {}
    return r;
  };
  const _regDeath = Game.registerDeath;
  Game.registerDeath = function (opts) {
    const r = _regDeath ? _regDeath.call(this, opts) : undefined;
    try {
      const o = opts || {};
      const person = isPersonDeath(o);
      rec.deaths.push({
        day: dayOf(Game),
        vid: String(o.villagerId || o.vid || o.id || '?').slice(0, 16),
        kind: String(o.kind || '?'),
        cause: String(o.cause || '?').slice(0, 60),
        name: String(o.name || rawName(Game, o.villagerId) || '?').slice(0, 40),
        person,
      });
      E(`[DEATH] d${dayOf(Game)} person=${person} kind=${o.kind} cause=${o.cause}`);
    } catch (e) {}
    return r;
  };
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    rec.crises.push({ day: dayOf(Game), kind });
    E(`[CRISIS] d${dayOf(Game)} ${kind}`);
    return _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
  };
  const _resolveAid = Game.resolveAidCrisis;
  Game.resolveAidCrisis = function (how) {
    const r = _resolveAid ? _resolveAid.apply(this, arguments) : undefined;
    try { rec.aidResolutions.push({ day: dayOf(Game), how: String(how) }); E(`[AID-RESOLVE] d${dayOf(Game)} ${how}`); } catch (e) {}
    return r;
  };
  const _pillage = Game.raidPillage;
  Game.raidPillage = function (v, kcal) {
    const got = _pillage ? _pillage.apply(this, arguments) : 0;
    try { rec.gorges.push({ day: dayOf(Game), asked: Math.round(kcal || 0), got: Math.round(got || 0) }); } catch (e) {}
    return got;
  };

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);

  // ---- lingering episode tracker (r38) ----
  let openEp = null;
  const trackLingering = () => {
    const n = lingeringCount(Game);
    const d = dayOf(Game);
    if (n > 0 && !openEp) {
      openEp = { startDay: d, startLingering: n, gorge: 0, maxLingering: n };
      E(`[EPISODE] d${d} opens with ${n} lingerers`);
    }
    if (openEp) {
      openEp.maxLingering = Math.max(openEp.maxLingering, n);
      if (n === 0) {
        const sinceStart = rec.aidResolutions.filter(x => x.day >= openEp.startDay);
        openEp.endDay = d;
        openEp.days = d - openEp.startDay;
        openEp.resolution = sinceStart.length ? sinceStart[sinceStart.length - 1].how : 'unknown';
        rec.episodes.push(openEp);
        E(`[EPISODE] d${d} closed after ${openEp.days}d via ${openEp.resolution}; gorge=${openEp.gorge}`);
        openEp = null;
      }
    }
  };

  // ---- phase 2: the window, 3-day chunks ----
  const endDay = ESTABLISH + WINDOW_DAYS;
  const collisionDays = new Set();
  const latelyDone = new Set();
  while (dayOf(Game) < endDay && !Game.over) {
    await runDays(Game, oracleV2, { days: 3 });
    if (Game.over) break;
    const d = dayOf(Game);
    if (livingRoster(Game).length <= 1) { rec.notes.push(`death-aware stop d${d}: pop<=1`); break; }
    trackLingering();
    if (openEp) {
      const newG = rec.gorges.filter(g => g.day >= openEp.startDay && !g.epCounted);
      for (const g of newG) { g.epCounted = true; openEp.gorge += g.got; }
    }

    // collision detection for the last 3 days
    for (let cd = d - 2; cd <= d; cd++) {
      if (cd <= ESTABLISH || collisionDays.has(cd)) continue;
      const contest = rec.contests.find(c => c.day === cd);
      const raidNear = rec.raids.some(r => Math.abs(r.day - cd) <= 1);
      const raidFightOn = rec.raidFights.some(f => f.day === cd);
      const epOpen = openEp && openEp.startDay <= cd;
      const epWasOpen = rec.episodes.some(e => e.startDay <= cd && (e.endDay || 999) >= cd);
      if (contest && (raidNear || raidFightOn || epOpen || epWasOpen)) {
        collisionDays.add(cd);
        const cParts = contest.participants.filter(p => p !== 'player' && p !== playerVid)
          .map(p => firstName(rawName(Game, p)));
        rec.notes.push(`COLLISION d${cd}: contest "${contest.name}" (${contest.cat}, playerTaken=${contest.playerTaken}, taken=[${cParts.join(',')}]) + raid activity`);
        E(`[COLLISION] d${cd}: ${contest.name} x raid`);
        // per-collision lately convo with a witness (first living non-player, non-taken)
        const takenSet = new Set(contest.participants);
        const witness = livingRoster(Game).find(id => !takenSet.has(id) && id !== playerVid)
          || livingRoster(Game).find(id => id !== playerVid);
        if (witness && !latelyDone.has(cd)) {
          latelyDone.add(cd);
          const cv = driveLately(Game, witness, `lately-d${d} collision-d${cd}`, 8);
          rec.latelyConvos.push({ day: d, collisionDay: cd, defense: cv.defense, contest: cv.contest });
          rec.convos.push(cv.text);
          E(`[LATELY] collision-d${cd}: defense=${cv.defense} contest=${cv.contest}`);
        }
      }
    }
    rec.dawns.push({
      day: d, pantry: pantryKcal(Game), pop: livingRoster(Game).length,
      lingering: lingeringCount(Game),
      contestsSoFar: rec.contests.length, collisionsSoFar: collisionDays.size,
    });
  }
  if (openEp) {
    openEp.endDay = dayOf(Game); openEp.days = openEp.endDay - openEp.startDay;
    openEp.resolution = 'unresolved-at-window-end';
    rec.episodes.push(openEp); openEp = null;
  }

  // collision-day tick order: did the raid fire before or after the grab?
  rec.collisionTickOrder = [...collisionDays].map(cd => ({
    day: cd,
    order: rec.tickOrder.filter(t => t.day === cd).map(t => t.event + (t.fired === false ? '(dry)' : '')),
  }));
  rec.collisionDays = [...collisionDays].sort((a, b) => a - b);

  rec.notes.push(`ended d${dayOf(Game)} over=${!!Game.over} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);
  E(`[DONE] seed ${SEED}: contests=${rec.contests.length} raids=${rec.raids.length} collisions=${collisionDays.size} personDeaths=${rec.deaths.filter(x => x.person).length}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
