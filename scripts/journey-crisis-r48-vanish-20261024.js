#!/usr/bin/env node
// journey-crisis-r48-vanish-20261024.js — CRISIS LEG (6) r48: THE VANISHING LINGERER.
// Direct handoff from r47's OPEN BLANK (seed9405 d85): The Terms of Service,
// drafted alive (hp>0, passed r47's dead-draft filter), unmet ("Nobody met"),
// then gone before its first gorge with no voice (no gorge, no staredown,
// no kill, no drift); the crisis resolved 'fought' d86. r47: "If it recurs,
// the next run should instrument removeWorldMonster for lingering entities."
// This run is that instrumentation: tick-boundary lingering diffs +
// a removeWorldMonster wrap name the mechanism (splice / flag-clear /
// hp-zero / other). OBSERVE-ONLY: no callForHelp intervention (r47 already
// proved the call chain); the vanish hunt must not perturb the crisis.
//
// PRE-REGISTRATION: hidden_files/evidence/2026-10-24/journey-crisis-r48-prereg.md
// Usage: SEED=9405 node scripts/journey-crisis-r48-vanish-20261024.js
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
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-vanish-r48', fullTelemetry: true });
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
          if (!before.has(obj)) rec.drafted.push({ day: dayOf(Game), tick: label, id: a.id, hp: a.hp, tx: a.tx, ty: a.ty });
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
    id: 'crisis-journey-r48',
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
    try { res = await runDays(Game, policy, { days: 1, sampleEvery: 1 }); }
    catch (e) { endReason = 'threw:' + e.message; break; }
    rec.days = d;
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
          const f = `journey-crisis-r48-seed${SEED}-d${dayOf(Game)}-${tag.toLowerCase().replace(/[^a-z]+/g, '-')}.txt`;
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
