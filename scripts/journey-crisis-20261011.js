#!/usr/bin/env node
// journey-crisis-20261011.js — CRISIS LEG (6): famine, disease, siege, succession.
// Plays N seeds as a COMPETENT player (oracleV2, 180-day cap) and answers:
//   how does the village bend or break?
// Tracks:
//   - crisis beats fired (hunger-winter, first-grave, breach, schism, blood-on-air)
//   - deaths with causes (player vs villagers), succession outcome (mantle pass)
//   - disease cases by pool (mundane/alien) across villagers + player
//   - famine days (hungryStreak), siege days (combat at the haven)
//   - village census at end: who lived/died, what they knew, who they trusted
// Usage: SEEDS=1-6 node scripts/journey-crisis-20261011.js
//        DAYS=180 node scripts/journey-crisis-20261011.js
// Output: one JSON line per seed to stdout + human census blocks to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const DAYS = parseInt(process.env.DAYS || '180', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '1-6';
  const out = [];
  for (const part of s.split(',')) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (/^\d+$/.test(part)) out.push(+part);
  }
  return out;
}

function rawName(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) return rc.name;
  } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}

async function playSeed(seed) {
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-crisis', fullTelemetry: true });
  await setupGame(Game);
  const day = () => { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } };

  const rec = {
    seed, days: 0, gameDays: 0, endReason: '',
    crises: [],           // {day, kind}
    playerDeaths: [],     // {day, cause, oldBearer, newBearer, over}
    villagerDeaths: [],   // {day, name, cause, vid}
    sieges: [],           // {day, monster, atHaven}
    diseaseCases: [],     // {day, target, disease, pool, kind: 'contracted'|'ended'}
    famineDays: [],       // days with hungryStreak>0
    maxHungerStreak: 0,
    everRoster: [],       // union of roster ids seen
  };
  const seen = new Set();
  const diseaseState = new Map(); // key targetId:diseaseId -> {target,disease,pool}

  // ---- wraps ----
  const _fc = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    // fireCrisis returns true only on a REAL fire (deduped calls return false)
    const fired = _fc ? _fc.call(this, kind, ctx) : undefined;
    try { if (fired === true) rec.crises.push({ day: day(), kind }); } catch (e) {}
    return fired;
  };
  const _pd = Game.playerDeath;
  Game.playerDeath = function (cause) {
    const d = day();
    let oldBearer = '?';
    try { oldBearer = rawName(Game, Game.villagerId); } catch (e) {}
    const oldVid = Game.villagerId;
    let r;
    try { r = _pd ? _pd.call(this, cause) : undefined; }
    catch (e) { r = 'threw:' + e.message; }
    let newBearer = oldVid, newBearerName = '?';
    try { newBearer = Game.villagerId; } catch (e) {}
    try { newBearerName = rawName(Game, newBearer); } catch (e) {}
    rec.playerDeaths.push({ day: d, cause: String(cause || ''), oldBearer, newBearerName, changed: oldVid !== newBearer, over: !!Game.over });
    return r;
  };
  const _rd = Game.registerDeath;
  Game.registerDeath = function (info) {
    try {
      if (info && (info.kind === 'person' || info.kind === 'villager') && info.villagerId && info.villagerId !== Game.villagerId)
        rec.villagerDeaths.push({ day: day(), name: String(info.name || rawName(Game, info.villagerId)), cause: String(info.cause || ''), vid: String(info.villagerId).slice(0, 14) });
    } catch (e) {}
    return _rd ? _rd.call(this, info) : undefined;
  };
  const _sc = Game.startCombat;
  Game.startCombat = function (monsterId) {
    try {
      const atH = !!(Game.playerAtHaven && Game.playerAtHaven());
      rec.sieges.push({ day: day(), monster: String(monsterId || '?'), atHaven: atH });
    } catch (e) {}
    return _sc ? _sc.apply(this, arguments) : undefined;
  };

  const scanDiseases = () => {
    const targets = [];
    try {
      const v = Game.state.village || {};
      for (const rid of (v.roster || [])) {
        const p = (v.rosterChars || {})[rid];
        targets.push({ key: 'v:' + rid, obj: p || null, name: rawName(Game, rid) });
      }
    } catch (e) {}
    targets.push({ key: 'player', obj: 'scholar', name: rawName(Game, Game.villagerId) + ' (you)' });
    const now = new Set();
    for (const t of targets) {
      let list = [];
      try { list = Game.seList(t.obj === 'scholar' ? 'scholar' : (t.obj || {})); } catch (e) {}
      for (const st of list) {
        const id = st && (st.id || st);
        if (!id || typeof id !== 'string') continue;
        let isD = false, pool = '?';
        try { isD = Game.seIsDisease(id); } catch (e) {}
        if (!isD) continue;
        try { pool = (Game.seDef(id) || {}).pool || '?'; } catch (e) {}
        const key = t.key + ':' + id;
        now.add(key);
        if (!diseaseState.has(key)) {
          diseaseState.set(key, 1);
          rec.diseaseCases.push({ day: day(), target: t.name, disease: id, pool, kind: 'contracted' });
        }
      }
    }
    for (const key of [...diseaseState.keys()]) {
      if (!now.has(key)) {
        diseaseState.delete(key);
        const [k, id] = key.split(/:(.+)/);
        rec.diseaseCases.push({ day: day(), target: k === 'player' ? 'player' : k.slice(2, 14), disease: id, pool: '?', kind: 'ended' });
      }
    }
  };

  const policy = {
    id: 'crisis-journey',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try {
        const v = Game.state.village || {};
        for (const rid of (v.roster || [])) {
          const k = String(rid);
          if (!seen.has(k)) { seen.add(k); rec.everRoster.push(k); }
        }
        const hs = (Game.progState && Game.progState().hungryStreak) || 0;
        if (hs > 0) rec.famineDays.push(day());
        if (hs > rec.maxHungerStreak) rec.maxHungerStreak = hs;
        scanDiseases();
      } catch (e) {}
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };

  const r = await runDays(Game, policy, { days: DAYS, manifest });
  rec.days = r.days; rec.gameDays = r.gameDays; rec.endReason = r.endReason;
  try { rec.waveKills = r.waveKills; rec.maxWaveUnlocked = r.maxWaveUnlocked; } catch (e) {}

  // ---- census ----
  const census = [];
  try {
    const v = Game.state.village || {};
    const trust = v.trust || {};
    const alive = new Set((v.roster || []).map(String));
    for (const rid of rec.everRoster) {
      const rc = (v.rosterChars || {})[rid] || {};
      const death = rec.villagerDeaths.find(d => String(d.vid).slice(0, 14) === rid.slice(0, 14));
      // a roster id that vanished with no registerDeath was usually a dead
      // player character (playerDeath registers with kind 'villager' but the
      // wrapper skips ids === Game.villagerId at death time) — check the
      // player-death log before calling it unknown
      let cause = death ? death.cause : (alive.has(rid) ? 'survived' : 'left/unknown');
      if (!death && !alive.has(rid)) {
        const pd = rec.playerDeaths.find(p => p.oldBearer === (rc.name || rid.slice(0, 12)));
        if (pd) cause = 'player-death: ' + pd.cause + ' → mantle to ' + pd.newBearerName;
      }
      let mood = '?';
      try { mood = Game.npcMood ? Game.npcMood(rid) : '?'; } catch (e) {}
      census.push({
        name: rc.name || rid.slice(0, 12),
        alive: alive.has(rid),
        cause,
        occ: rc.occupationId || rc.formerOccupation || '?',
        abilities: ((v.npcAbilities || {})[rid] || []).length,
        trust: trust[rid] != null ? trust[rid] : '?',
        mood: String(mood || '?'),
      });
    }
  } catch (e) {}
  rec.census = census;
  return rec;
}

function human(rec) {
  const L = [];
  L.push(`SEED ${rec.seed}: ${rec.gameDays}d, end=${rec.endReason}`);
  L.push(`  crises fired: ${rec.crises.length ? rec.crises.map(c => `${c.kind}@d${c.day}`).join(', ') : 'none'}`);
  L.push(`  villager deaths: ${rec.villagerDeaths.length}${rec.villagerDeaths.length ? ' — ' + rec.villagerDeaths.slice(0, 6).map(d => `${d.name} (${d.cause})@d${d.day}`).join('; ') : ''}`);
  L.push(`  player deaths: ${rec.playerDeaths.length}${rec.playerDeaths.length ? ' — ' + rec.playerDeaths.map(d => `${d.oldBearer}→${d.changed ? d.newBearerName : 'SAME/over=' + d.over} (${d.cause})@d${d.day}`).join('; ') : ''}`);
  const contracted = rec.diseaseCases.filter(c => c.kind === 'contracted');
  L.push(`  disease cases: ${contracted.length} (${contracted.slice(0, 8).map(c => `${c.disease}[${c.pool}]@${c.target}@d${c.day}`).join(', ')})`);
  L.push(`  famine: ${rec.famineDays.length} hungry-days, max streak ${rec.maxHungerStreak}`);
  L.push(`  sieges: ${rec.sieges.filter(s => s.atHaven).length} haven combats / ${rec.sieges.length} total combats`);
  L.push(`  census (${rec.census.length} villagers ever):`);
  for (const c of rec.census.slice(0, 14)) {
    L.push(`    ${c.alive ? '+' : 'x'} ${c.name} [${c.occ}] ${c.alive ? 'alive' : 'died: ' + c.cause} trust=${c.trust} mood=${c.mood} abilities=${c.abilities}`);
  }
  return L.join('\n');
}

(async () => {
  const seeds = parseSeeds();
  const all = [];
  for (const s of seeds) {
    const rec = await playSeed(s);
    all.push(rec);
    console.log(JSON.stringify(rec));
    console.error(human(rec));
  }
  // rollup
  const R = { seeds, endReasons: {}, crises: {}, deaths: 0, playerDeaths: 0, famineRuns: 0, siegeRuns: 0, diseaseRuns: 0 };
  for (const rec of all) {
    R.endReasons[rec.endReason] = (R.endReasons[rec.endReason] || 0) + 1;
    for (const c of rec.crises) R.crises[c.kind] = (R.crises[c.kind] || 0) + 1;
    R.deaths += rec.villagerDeaths.length;
    R.playerDeaths += rec.playerDeaths.length;
    if (rec.famineDays.length) R.famineRuns++;
    if (rec.sieges.some(s => s.atHaven)) R.siegeRuns++;
    if (rec.diseaseCases.some(c => c.kind === 'contracted')) R.diseaseRuns++;
  }
  console.error('\nROLLUP ' + seeds.length + ' seeds: ' + JSON.stringify(R));
})();
