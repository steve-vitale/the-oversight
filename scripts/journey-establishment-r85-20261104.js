#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40 window, 42d horizon per r71/r84)
// R85 (2026-11-04). Lean clone of the r84 driver loop, NO favor wedge:
// competent policy, daily alive/pantry trace, end census, 2 held convos
// (goon-first). Instruments are read-only wraps + a per-dawn material
// trace: Game.craft (armor attempts), Game.villagerArmorCraftDay (NPC
// craft-beat calls), stash / player-pack / NPC-pack materials per dawn.
// Question (see prereg): does armor get made and worn in-window after
// the bark-flow + villager-hide + player-hide-craft fixes?
// Usage: SEEDS=1101 DAYS=42 node scripts/journey-establishment-r85-20261104.js
//   EVID defaults to evidence/2026-11-04 in this repo checkout.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-11-04');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1101]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[r85:' + k + ']', (e && e.message) || e); } }
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function nameOf(Game, id) { try { return Game.displayName(id); } catch (e) { return String(id); } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
}
function isDead(Game, id) { try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }
function livingVids(Game) {
  try { return ((Game.state.village || {}).roster || []).filter(id => !isDead(Game, id)); } catch (e) { return []; }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const dayLines = {};
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }

  // --- Armor instruments (read-only wraps; originals called exactly once) ---
  const craftLog = [];
  let craftWrap = false;
  if (typeof Game.craft === 'function') {
    const _c = Game.craft.bind(Game);
    craftWrap = true;
    Game.craft = function (item) {
      const r = _c.apply(this, arguments);
      try {
        if (item === 'bark_armor' || item === 'hide_armor') {
          let ret = null;
          try { ret = JSON.stringify(r); } catch (e) { ret = String(r); }
          craftLog.push({ day: nowDay(Game), item: String(item), ret: (ret || '').slice(0, 300) });
        }
      } catch (e) {}
      return r;
    };
  }
  const npcCraftLog = [];
  let npcCraftWrap = false;
  if (typeof Game.villagerArmorCraftDay === 'function') {
    const _n = Game.villagerArmorCraftDay.bind(Game);
    npcCraftWrap = true;
    Game.villagerArmorCraftDay = function (...a) {
      const r = _n.apply(this, a);
      try {
        let ret = null;
        try { ret = JSON.stringify(r); } catch (e) { ret = String(r); }
        npcCraftLog.push({ day: nowDay(Game), ret: (ret || '').slice(0, 300) });
      } catch (e) {}
      return r;
    };
  }
  function matSnap() {
    try {
      const v = Game.state.village || {};
      const stash = Object.assign({}, (v.stash && v.stash.materials) || {});
      const pack = {};
      for (const it of ((Game.state.scholar || {}).inventory || [])) {
        if (it && it.material) pack[it.material] = (pack[it.material] || 0) + (it.units || 0);
      }
      const npcTotal = {};
      const npcDetail = [];
      for (const id of livingVids(Game)) {
        let p = null;
        try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
        if (!p) continue;
        const mats = {};
        const armor = [];
        for (const it of (p.items || [])) {
          if (!it) continue;
          if (it.material) { mats[it.material] = (mats[it.material] || 0) + (it.units || 0); }
          if (it.itemId === 'bark_armor' || it.itemId === 'hide_armor') armor.push(it.itemId);
        }
        for (const m of Object.keys(mats)) npcTotal[m] = (npcTotal[m] || 0) + mats[m];
        if (Object.keys(mats).length || armor.length) npcDetail.push({ vid: String(id), name: nameOf(Game, id), mats, armor });
      }
      return { day: nowDay(Game), stash, pack, npcTotal, npcDetail };
    } catch (e) { return { day: nowDay(Game), error: e.message }; }
  }

  const daily = [];
  const matTrace = [];
  let startCensus = null;
  try {
    const v0 = Game.state.village || {};
    startCensus = (v0.roster || []).map(id => ({ id: String(id), name: nameOf(Game, id) }));
  } catch (e) { startCensus = null; }
  let deadTail = 0;
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('wait', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    try { matTrace.push(matSnap()); } catch (e) { warnOnce('matSnap', e); }
    const roster = ((Game.state.village || {}).roster || []);
    const alive = roster.filter(id => !isDead(Game, id)).length;
    daily.push({ day: nowDay(Game), alive, roster: roster.length, pantryKcal: Math.round(pantryKcal(Game)), over: !!Game.over });
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; } else deadTail = 0;
  }

  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  const deaths = [];
  for (const t of tele) if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  let wave = 1; try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const v = Game.state.village || {};
  const census = [];
  for (const id of (v.roster || [])) {
    let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    let health = null; try { health = ((v.health || {})[id] !== undefined ? v.health[id] : null); } catch (e) {}
    let sick = false; try { sick = !!((v.sick || {})[id]); } catch (e) {}
    let equipped = []; try { equipped = Object.values((p && p.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
    let ownedArmor = []; try { ownedArmor = ((p && p.items) || []).filter(x => x && (x.itemId === 'bark_armor' || x.itemId === 'hide_armor')).map(x => x.itemId); } catch (e) {}
    let known = null;
    try {
      const k = p && (p.knownPlants || p.known || p.codex);
      known = k ? (Array.isArray(k) ? k.length : Object.keys(k).length) : null;
    } catch (e) {}
    census.push({ id: String(id), name: nameOf(Game, id), dead: isDead(Game, id),
      occ: (p && (p.occupation || p.formerOccupation)) || '?', health, sick, equipped, ownedArmor, knownCount: known });
  }
  // Player armor + recipes.
  let playerPackArmor = [];
  try { playerPackArmor = ((Game.state.scholar || {}).inventory || []).filter(x => x && (x.itemId === 'bark_armor' || x.itemId === 'hide_armor')).map(x => x.itemId); } catch (e) {}
  let playerEquipped = [];
  try { const sp = Game.getPerson ? Game.getPerson(Game.villagerId) : null; playerEquipped = Object.values((sp && sp.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
  let playerRecipes = null;
  try { const rc = ((Game.state.codex || {}).recipes) || {}; playerRecipes = { bark_armor: (rc.bark_armor || {}).level || 0, hide_armor: (rc.hide_armor || {}).level || 0 }; } catch (e) {}
  const contestTele = tele.filter(t => t && typeof t.type === 'string' && /contest/i.test(t.type)).map(t => ({ day: t.day, type: t.type, result: t.result || t.outcome || null, who: t.who ? nameOf(Game, t.who) : null }));
  const contestCounts = {};
  for (const t of contestTele) contestCounts[t.type] = (contestCounts[t.type] || 0) + 1;

  // People check: 2 held convos at end of run (first two living
  // non-player villagers in roster order), goon-first, 8 turns.
  const convoLines = [];
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
  if (Game.over) convoLines.push('(people check skipped: game over — r81 driver flaw fixed, no post-collapse sample)');
  for (const vid of (Game.over ? [] : living.slice(0, 2))) {
    const nm = nameOf(Game, vid);
    const p = (() => { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } })();
    convoLines.push(`\n-- ${nm} (${String(vid)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      const seen = {};
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) { convoLines.push('(choices empty)'); break; }
        let pick = null;
        if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
        else if (choices.find(ch => ch.id === 'ask:personal') && !seen['ask:personal']) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => ch.id !== 'leave' && ch.id !== 'bye' && !seen[ch.id])
          || null;
        if (!pick) { convoLines.push('(no pick)'); break; }
        if (pick.id !== 'goon') seen[pick.id] = 1;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        convoLines.push(`THEM: ${r.line == null ? '(null)' : r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { convoLines.push('ERROR: ' + e.message); }
  }

  const out = { seed, run: 'r85', days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, startCensus,
    aliveAt40: (daily.find(x => x.day === 40) || daily[daily.length - 1] || {}).alive ?? null,
    aliveEnd: daily.length ? daily[daily.length - 1].alive : null,
    waveReached: wave, pantryKcalEnd: Math.round(pantryKcal(Game)),
    deaths, census, daily, matTrace, craftLog, craftWrap, npcCraftLog, npcCraftWrap,
    playerPackArmor, playerEquipped, playerRecipes,
    contestTele: contestTele.slice(0, 100), contestCounts };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `journey-establishment-r85-seed${seed}.json`), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(EVID, `journey-establishment-r85-convo-seed${seed}.txt`), convoLines.join('\n'));
  console.log(`SEED ${seed}: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${out.aliveEnd} aliveAt40=${out.aliveAt40} wave=${wave} deaths=${deaths.length} pantryEnd=${out.pantryKcalEnd} craftLog=${craftLog.length} npcCraftCalls=${npcCraftLog.length} contests=${JSON.stringify(contestCounts)}`);
  return out;
}

(async () => {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
})();
