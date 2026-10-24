#!/usr/bin/env node
// journey-crisis-r50-sortie-20261024.js — CRISIS LEG (6) r50: THE SORTIE, PLAYED.
// R48's open blank: 0 sorties across 5 seeds / 86 gorge nights — "the gorge
// text promises a verb nobody uses". R38 proved the endure valve but never
// answered 'sortie'. This run plays it: a competent player who sees the
// gorge text taps "Send a sortie" (Game.answerLingerer('sortie') — exactly
// what the beats-panel button calls) on the first day an episode has a
// gorge line on record. One sortie per episode. No other intervention.
//
// PRE-REGISTRATION: hidden_files/evidence/2026-10-24/journey-crisis-r50-prereg.md
// Usage: SEED=9405 node scripts/journey-crisis-r50-sortie-20261024.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '9405', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVID = process.env.EVID || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24');

const RAID_RE = /🐗 RAID —/;
const UNMET_RE = /Nobody met .* — it's still out there at the treeline/;
const GORGE_RE = /🌙 Night\. The lingering (.*?) gorges at the treeline — ([\d,]+) kcal/;
const MUSTER_RE = /⚔️ SORTIE — (.*?) take up arms/;
const SORTIE_FIGHT_RE = /⚔️ .* at the treeline/;
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
function lingerersNow(Game) {
  try { if (typeof Game.lingeringRaiders === 'function') return Game.lingeringRaiders() || []; } catch (e) {}
  try { return (Game.worldMonsters() || []).filter(m => m && m.lingering && (m.hp || 0) > 0); } catch (e) { return []; }
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
    if (!pick) pick = choices.find(c => /raid|siege|treeline|muster|afraid|worried|dead|died|gone|mourn|fight|defend|monster|shelter|sortie/i.test(c.text || ''));
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
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-sortie-r50', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, days: 0, endReason: '',
    raids: [], unmetRaiders: [], gorgeNights: [], // {day, monster, kcal, line}
    sortieAttempts: [], // answerLingerer wrap: {day, ret, pantryBefore, pantryAfter, lingerersBefore}
    sortieFights: [],   // fieldFight wrap during sortie: {day, leader, leaderName, monster, outcome, vTaken}
    sortieMusters: [],  // SORTIE say lines: {day, line}
    episodes: [],       // closed: {firstDay, lastDay, gorgeSeen, sortied, sortieDay}
    musterDiags: [],   // R50_DIAG_MUSTER=1 only: read-only _musterAway log (roster/alive/picked)
    deaths: [], sayLines: [], convosDriven: [], fabricHits: [], mournLines: [],
    census: null, wrapsMissing: [],
  };

  const _say = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const day = dayOf(Game), line = String(t);
      rec.sayLines.push({ day, line });
      if (RAID_RE.test(line)) rec.raids.push({ day, line: line.slice(0, 200) });
      if (UNMET_RE.test(line)) rec.unmetRaiders.push({ day, line: line.slice(0, 200) });
      const gm = GORGE_RE.exec(line);
      if (gm) rec.gorgeNights.push({ day, monster: gm[1], kcal: parseInt(gm[2].replace(/,/g, ''), 10) || 0, line: line.slice(0, 200) });
      if (MUSTER_RE.test(line)) rec.sortieMusters.push({ day, line: line.slice(0, 300) });
      if (MOURN_RE.test(line)) rec.mournLines.push({ day, line: line.slice(0, 200) });
      if (FABRIC_RE.test(line)) rec.fabricHits.push({ day, line: line.slice(0, 160) });
    } catch (e) {}
    return _say(t);
  };

  // fieldFight wrap: only records fights fought while the sortie flag is set.
  const _ff = Game.fieldFight ? Game.fieldFight.bind(Game) : null;
  if (_ff) {
    Game.fieldFight = function (...args) {
      let r = null;
      try { r = _ff(...args); } catch (e) { r = null; }
      try {
        if (Game._r50Sortie && r) {
          const mdef = args[1] || {};
          rec.sortieFights.push({
            day: dayOf(Game), leader: String(args[0]), leaderName: rawName(Game, args[0]),
            monster: mdef.id || (args[2] && args[2].id) || '?',
            outcome: r.outcome || '?', vTaken: r.vTaken || 0,
          });
        }
      } catch (e) {}
      return r;
    };
  } else rec.wrapsMissing.push('fieldFight');

  // answerLingerer wrap: the button press, with isolated pantry measurement.
  const _ans = Game.answerLingerer ? Game.answerLingerer.bind(Game) : null;
  if (!_ans) rec.wrapsMissing.push('answerLingerer');
  if (_ans) {
    Game.answerLingerer = function (how) {
      const before = pantryKcal(Game);
      let lingBefore = [];
      try { lingBefore = lingerersNow(Game).map(m => ({ id: m.id, hp: m.hp || 0 })); } catch (e) {}
      let r = null;
      Game._r50Sortie = true;
      try { r = _ans(how); } catch (e) { r = { threw: String(e && e.message).slice(0, 120) }; }
      Game._r50Sortie = false;
      try {
        rec.sortieAttempts.push({
          day: dayOf(Game), how: String(how),
          ret: (r && typeof r === 'object') ? { ok: !!r.ok, cleared: r.cleared, broke: !!r.broke, remaining: r.remaining, paid: r.paid, why: r.why || null } : String(r),
          pantryBefore: before, pantryAfter: pantryKcal(Game), lingerersBefore: lingBefore,
        });
      } catch (e) {}
      return r;
    };
  }

  // Optional read-only muster diagnostic (R50_DIAG_MUSTER=1): records the
  // bench composition at every 'defense' muster call. Calls the original
  // unchanged, so seeded timelines are identical with/without it.
  if (process.env.R50_DIAG_MUSTER) {
    const _ma = Game._musterAway ? Game._musterAway.bind(Game) : null;
    if (_ma) {
      Game._musterAway = function (n, what) {
        const r = _ma(n, what);
        try {
          if (what === 'defense') {
            const roster = (Game.state.village.roster || []).slice();
            const alive = roster.filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return false; } });
            rec.musterDiags.push({ day: dayOf(Game), n, what, roster: roster.length, alive: alive.length, picked: r.slice(), pickedNames: r.map(id => rawName(Game, id)) });
          }
        } catch (e) {}
        return r;
      };
    }
  }

  // Episode tracker: object-identity keyed. A gorge line on a day marks all
  // currently-tracked lingerers gorgeSeen (attribution approximation: gorge
  // lines name a display name, not an entity id; episodes here are small).
  const tracked = new Map(); // obj -> {firstDay, gorgeSeen, sortied, sortieDay}
  function episodeDayHook() {
    try {
      const now = lingerersNow(Game);
      const nowSet = new Set(now);
      for (const [obj, ep] of [...tracked]) {
        if (!nowSet.has(obj)) {
          rec.episodes.push({ firstDay: ep.firstDay, lastDay: dayOf(Game), gorgeSeen: ep.gorgeSeen, sortied: ep.sortied, sortieDay: ep.sortieDay || null });
          tracked.delete(obj);
        }
      }
      for (const obj of now) {
        if (!tracked.has(obj)) tracked.set(obj, { firstDay: dayOf(Game), gorgeSeen: false, sortied: false, sortieDay: null });
      }
      const gorgedToday = rec.gorgeNights.some(g => g.day <= dayOf(Game));
      if (gorgedToday) for (const ep of tracked.values()) ep.gorgeSeen = true;
      const cands = [...tracked.values()].filter(ep => ep.gorgeSeen && !ep.sortied);
      if (cands.length && _ans) {
        for (const ep of cands) { ep.sortied = true; ep.sortieDay = dayOf(Game); }
        try { Game.answerLingerer('sortie'); } catch (e) {}
      }
    } catch (e) {}
  }

  const policy = {
    id: 'crisis-journey-r50',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      episodeDayHook();
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };

  let convosThisRun = 0, seenDeaths = 0, deadTail = 0, endReason = 'horizon';
  const sortieDays = new Set();
  function maybeDriveConvo() {
    try {
      const day = dayOf(Game);
      const sortieToday = rec.sortieAttempts.some(a => a.day === day);
      const sortieMinus2 = rec.sortieAttempts.some(a => day - a.day === 2);
      if (convosThisRun >= 8 || !(sortieToday || sortieMinus2) || sortieDays.has(day)) return;
      sortieDays.add(day);
      const v = Game.state.village || {};
      let target = null, tag = '';
      if (sortieToday) {
        const f = rec.sortieFights.filter(x => x.day === day)[0];
        target = f ? f.leader : (v.roster || []).find(r => String(r) !== String(Game.villagerId));
        tag = 'SORTIE-day-leader';
      } else {
        let sh = [];
        try { sh = Game.shelteredVillagers ? Game.shelteredVillagers() : []; } catch (e) {}
        target = (sh && sh.length ? sh[0] : (v.roster || []).find(r => String(r) !== String(Game.villagerId)));
        tag = 'SORTIE-plus2-witness';
      }
      if (target) {
        const lines = [];
        const npc = driveConvo(Game, target, `seed${SEED} d${day} ${tag}`, lines);
        const f = `journey-crisis-r50-seed${SEED}-d${day}-${tag.toLowerCase().replace(/[^a-z]+/g, '-')}.txt`;
        fs.writeFileSync(path.join(EVID, f), lines.join('\n'), 'utf8');
        rec.convosDriven.push({ day, tag, file: f, npcLines: npc.length });
        convosThisRun++;
      }
    } catch (e) {}
  }

  for (let d = 1; d <= DAYS; d++) {
    let res;
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
    maybeDriveConvo();
    if (Game.over) { endReason = 'game-over'; break; }
    try {
      const alive = livingCount(Game);
      if (alive <= 0) { if (++deadTail >= 10) { endReason = 'village-dead'; break; } }
      else deadTail = 0;
    } catch (e) {}
  }
  rec.endReason = endReason;
  for (const [obj, ep] of tracked) {
    rec.episodes.push({ firstDay: ep.firstDay, lastDay: dayOf(Game), gorgeSeen: ep.gorgeSeen, sortied: ep.sortied, sortieDay: ep.sortieDay || null, openAtEnd: true });
  }

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
