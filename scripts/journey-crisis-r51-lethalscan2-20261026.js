#!/usr/bin/env node
// journey-crisis-r51-lethalscan2-20261026.js — CRISIS LEG (6) r51, Phase A v2: SCAN WITH CONVOS.
// Scan v1 (no convo driver) diverged from the drive: convos consume seeded
// RNG, so the drive's first lingerer (d44 on 9414) was nowhere near the
// scan's (d104). This scan runs the drive's convo driver verbatim and
// stops at the first lingerer WITHOUT answering — the snapshot it reports
// is the drive's pre-sortie state, reproducible by the drive script.
// Direct handoff from r48/r49's carried caveat: 0 sorties across 10 seeds.
// The gorge text offers a sortie nobody has ever taken in a measured run,
// so this run INTERVENES: whenever a lingerer set is present at a day
// boundary, the driver answers it with Game.answerLingerer('sortie') —
// the exact beat-panel call app.js makes (kind 'lingerer', spec 'sortie').
// Up to twice per lingerer object (second only if it still lingers 3+
// days after the first). Endure is the control only where a sortie is
// refused (no fighters) or a set is truncated by horizon/village death.
//
// PRE-REGISTRATION: goal hidden_files/evidence/2026-10-25/journey-crisis-r50-prereg.md
// Usage: SEED=9405 node scripts/journey-crisis-r50-sortie-20261025.js
// Output: JSON record to stdout; narrative to stderr (driver redirects).
// Per-seed transcripts: $EVID/journey-crisis-r51-seed<SEED>-*.txt
// r51 additions over r50: sortie-fight full logs, deathGriefBeat wrap,
// muster + leader-hp snapshot at every sortie, first-lingerer snapshot
// (for comparison against the lethalscan record of the same seed).
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '9414', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-26';

const RAID_RE = /🐗 RAID —/;
const DEFENSE_BEAT_RE = /🛡️ .* met them at the door/;
const UNMET_RE = /Nobody met .* — it's still out there at the treeline/;
const GORGE_RE = /🌙 Night\. The lingering .* gorges at the treeline/;
const SORTIE_RE = /⚔️ SORTIE —/;
const MOURN_RE = /mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|first grave|we buried|laid to rest|succumbed to|didn't come back/i;
const FABRIC_RE = /we've always|since the beginning|you remember when|like old times|remember the old|back when we|for as long as/i;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round(Game.pantryKcalLive(Game.state.village)); } catch (e) {
    try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e2) { return 0; }
  }
}
function healthOf(Game, vid) {
  try { const h = (Game.state.village || {}).health || {}; if (h[vid] != null) return h[vid]; } catch (e) {}
  return 100;
}
const fs2 = require('fs');
let MON2 = [];
try { MON2 = JSON.parse(fs2.readFileSync(require('path').join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8')); } catch (e) {}
function maxHitOf(id) {
  const m = MON2.find(x => x && x.id === id);
  if (!m) return null;
  let best = 0;
  const add = (d) => { if (Array.isArray(d) && d.length === 2 && Number.isFinite(d[1])) best = Math.max(best, d[1]); };
  if (m.attack) add(m.attack.damage);
  for (const a of (m.attacks || [])) add(a && a.damage);
  return best || null;
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
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return npcLines;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-lethalscan2-r51', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, days: 0, endReason: '',
    raids: [], defenseBeats: [], defendedFights: [], unmetRaiders: [],
    gorgeNights: [], sorties: [], aidResolutions: [],
    deaths: [], sayLines: [], convosDriven: [], fabricHits: [], mournLines: [],
    removals: [], lingerDaily: [], census: null,
    sortieFights: [], // fieldFight wrap, sortie-flagged only (with full log)
    griefBeats: [], firstLingerer: null,
  };
  let sortieFlag = false;

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

  const _ff = Game.fieldFight ? Game.fieldFight.bind(Game) : null;
  if (_ff) {
    Game.fieldFight = function (leader, mdef, m, opts) {
      let r = null;
      let hpBeforeCall = null;
      try { hpBeforeCall = healthOf(Game, leader); } catch (e) {}
      try { r = _ff(leader, mdef, m, opts); } catch (e) { r = null; }
      try {
        if (sortieFlag && r) rec.sortieFights.push({
          day: dayOf(Game), leader: String(leader), leaderName: rawName(Game, leader),
          leaderHpBefore: hpBeforeCall,
          monster: (mdef && mdef.id) || (m && m.id) || '?',
          outcome: r.outcome || '?', vTaken: r.vTaken || 0, rounds: r.rounds || 0,
          log: (r.log || []).slice(),
        });
      } catch (e) {}
      return r;
    };
  } else rec.fieldFightWrapMissing = true;

  const _rwm = Game.removeWorldMonster ? Game.removeWorldMonster.bind(Game) : null;
  if (_rwm) {
    Game.removeWorldMonster = function (m) {
      try { rec.removals.push({ day: dayOf(Game), id: m && m.id, hp: m && (m.hp || 0), lingering: !!(m && m.lingering) }); } catch (e) {}
      return _rwm(m);
    };
  }
  const _rac = Game.resolveAidCrisis ? Game.resolveAidCrisis.bind(Game) : null;
  if (_rac) {
    Game.resolveAidCrisis = function (how) {
      let r;
      try { r = _rac(how); } catch (e) { r = null; }
      try { rec.aidResolutions.push({ day: dayOf(Game), how: String(how), via: 'wrap' }); } catch (e) {}
      return r;
    };
  }
  const _dgb = Game.deathGriefBeat ? Game.deathGriefBeat.bind(Game) : null;
  if (_dgb) {
    Game.deathGriefBeat = function (vid) {
      let r = null;
      try { r = _dgb(vid); } catch (e) { r = null; }
      try { rec.griefBeats.push({ day: dayOf(Game), vid: String(vid), name: rawName(Game, vid) }); } catch (e) {}
      return r;
    };
  } else rec.griefBeatWrapMissing = true;
  const _rwme = Game.resolveWildMonsterEncounter ? Game.resolveWildMonsterEncounter.bind(Game) : null;
  if (_rwme) {
    Game.resolveWildMonsterEncounter = function (vid, m, opts) {
      let rec2 = null;
      try { rec2 = _rwme(vid, m, opts); } catch (e) { rec2 = null; }
      try {
        if (opts && opts.raid && rec2) rec.defendedFights.push({
          day: dayOf(Game), vid: String(vid), name: rawName(Game, vid),
          monster: (m && (m.id || m.name)) || '?', outcome: rec2.outcome || '?', vTaken: rec2.vTaken || 0,
        });
      } catch (e) {}
      return rec2;
    };
  }

  const policy = {
    id: 'crisis-journey-r51',
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
  let convosThisRun = 0, raidConvoDone = new Set();
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

    // ---- SCAN v2: stop at the FIRST lingerer set, WITHOUT answering ----
    // RNG parity with the drive script is the whole point: the convo driver
    // below runs on earlier days exactly as the drive runs it (convos consume
    // seeded RNG — scan v1, without convos, diverged from the drive by d44).
    // This block runs BEFORE that day's convo, exactly where the drive's
    // sortie call sits, so the snapshot is the drive's pre-sortie state.
    try {
      const day = dayOf(Game);
      let lingering = [];
      try { lingering = (Game.worldMonsters() || []).filter(m => m && m.lingering && (m.hp || 0) > 0); } catch (e) {}
      rec.lingerDaily.push({ day, n: lingering.length });
      if (lingering.length) {
        let mu = [];
        try { mu = Game._musterAway ? Game._musterAway(3, 'defense') : []; } catch (e) {}
        rec.firstLingerer = {
          day, lingerers: lingering.map(m => ({ id: m.id, hp: m.hp || 0 })),
          muster: mu.map(id => ({ id, name: rawName(Game, id), hp: healthOf(Game, id) })),
        };
        endReason = 'first-lingerer';
        break;
      }
    } catch (e) { rec.sortieDecisionError = String(e && e.message || e); }

    // ---- convos: raid-day defender + day+2 sheltered witness, cap 8 ----
    try {
      const day = dayOf(Game);
      const raidToday = rec.raids.some(r => r.day === day);
      const raidDayMinus2 = rec.raids.some(r => day - r.day === 2);
      if ((raidToday || raidDayMinus2) && convosThisRun < 8 && !raidConvoDone.has(day)) {
        raidConvoDone.add(day);
        const v = Game.state.village || {};
        let target = null, tag = '';
        if (raidToday) {
          const todayFights = rec.defendedFights.filter(f => f.day === day && String(f.vid) !== String(Game.villagerId));
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
          const npc = driveConvo(Game, target, `seed${SEED} d${day} ${tag}`, lines);
          const f = `journey-crisis-r51-scan-seed${SEED}-d${day}-${tag.toLowerCase().replace(/[^a-z]+/g, '-')}.txt`;
          fs.writeFileSync(path.join(EVID, f), lines.join('\n'), 'utf8');
          rec.convosDriven.push({ day, tag, file: f, npcLines: npc.length });
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
    rec.lingerBook = [...lingerBook.values()].map(b => ({ id: b.id, firstSeenDay: b.firstSeenDay, sorties: b.sorties, lastSortieDay: b.lastSortieDay, clearedBySortieDay: b.clearedBySortieDay, draftHp: b.draftHp }));
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

  const fl = rec.firstLingerer;
  const out = { seed: SEED, found: !!fl, endReason, days: rec.days,
    convosBefore: (rec.convosDriven || []).length };
  if (fl) {
    const beasts = fl.lingerers.map(b => ({ id: b.id, hp: b.hp, maxHit: maxHitOf(b.id) }));
    const leader = fl.muster[0] || null;
    const best = beasts.reduce((a, b) => (!a || (b.maxHit || 0) > (a.maxHit || 0) ? b : a), null);
    out.day = fl.day; out.alive = null; out.lingerers = beasts; out.muster = fl.muster;
    out.leader = leader; out.bestBeast = best;
    out.ratio = (best && best.maxHit != null && leader) ? +(best.maxHit / leader.hp).toFixed(3) : null;
  }
  console.log(JSON.stringify(out));
}

(async () => {
  try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
  try { await main(); }
  catch (e) { console.log(JSON.stringify({ seed: SEED, error: String(e && e.message || e) })); }
})();
