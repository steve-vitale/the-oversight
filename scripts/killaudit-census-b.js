#!/usr/bin/env node
// scripts/killaudit-census-b.js — KILL-SIDE AUDIT (flesh-out loop B,
// 2026-10-18, arm sim-killaudit-b). Diagnostic census of every kill channel
// on current master, answering the fatpipe-b NAMED NEXT: why do boar/bear
// never enter the village's orbit?
//
// Canon (docs/BEAR.md, read twice): separable fat is animal-specific
// (bear 6 slabs, boar 3, javelina 2 — ~20% of gross); bear is a non-monster
// monster fight (bow > spear > knife > bare hands; maul 8-17 at range<=2).
// Trap species table (src/data/recipes.json): snare catches rabbit/squirrel/
// opossum; pit_trap catches deer/boar/raccoon/opossum — the ONLY trap that
// can take boar; NO trap catches javelina or black_bear. Hunt duties resolve
// via Game.villagerHuntResolve (real animal from real tile wildlife,
// huntAnimal's chance machinery).
//
// Census design (channels — every kill must land in exactly one):
//   1. trap      — foodCarcass(..., how='trapped') from checkTraps
//   2. hunt      — Game.villagerHuntResolve (layer-assigned AND task-lead
//                  duties both resolve here; assignments tracked separately:
//                  Game.assignTask wrap = layer path, daily v.taskLeads
//                  snapshot = contender-challenge engine path)
//   3. emergency — safetynets crisis-relief hunt (flat kcal, species-free)
//   4. monster   — tele('death') kind='monster' (villager field-fight kills)
//   5. scholar   — Game.huntAnimal (bots are not expected to call it)
// Cross-check: every carcass that gets CLEANED (carcassToMeat/askSpecialist)
// must trace to a captured kill (species match within its 2d spoil window).
// Unmatched cleaned carcasses = unattributed leak; the pre-registered bar
// is leak share < 10%.
//
// INSTRUMENT HONESTY: every wrap is read-only (counters + event lists only;
// zero RNG draws, zero game-state writes). The wildlife snapshot reads only
// tiles that ALREADY have t.wildlife (no backfill writes).
//
// ZERO src/js, ZERO scripts/policies edits. Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/killaudit-census-b.js
// Targeted: SEEDS="105101" POLICIES="leadfeast" DAYS=60 SMOKE=1 ...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const census = require('./camptask-census-b');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [105101, 105102, 105103, 105104]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const EVID = process.env.EVID_DIR || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-killaudit');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);

function attachKillInstrument(Game, t) {
  t.killEvents = [];      // canonical kill records {day, channel, species, speciesName, grossKcal, outcome}
  t.huntResolves = [];    // every villagerHuntResolve call {day, vid, aid, kill, kcal, msg}
  t.huntAssigns = [];     // assignTask('hunt') layer firings {day, vid, via}
  t.taskLeadHunts = [];   // daily taskLeads snapshots {day, leads:[{task,vid}]}
  t.trapsSet = {};        // setTrap counts by recipeId
  t.trapsOnTiles = [];    // daily {day, byRecipe}
  t.emergHunts = [];      // stockPantry('Emergency hunt meat', ...) {day, kcal}
  t.monsterKills = [];    // tele death kind=monster {day, who, cause}
  t.personDeaths = [];    // tele death kind=person/villager {day, who, cause} (dedup later)
  t.carcassesCleaned = [];// carcassToMeat/askSpecialist {day, species, via}
  t.wildSnaps = [];       // every 10d: {day, speciesTiles:{sid: nTiles}, nearHaven:{sid: n}}
  t.huntBeats = [];       // say() msgs matching hunt/trap RE (sense-test corpus), capped
  t.errors = t.errors || 0;

  // --- 1. trap channel: foodCarcass how='trapped' / 'hunted' / fishing hows
  try {
    if (typeof Game.foodCarcass === 'function') {
      const orig = Game.foodCarcass.bind(Game);
      Game.foodCarcass = function (animal, kcal, day, how) {
        let out = null, err = null;
        try { out = orig(animal, kcal, day, how); } catch (e) { err = e; }
        try {
          const ch = how === 'trapped' ? 'trap'
            : how === 'hunted' ? 'scholar'
            : how === 'charred' ? 'scholar-charred'
            : (how === 'netted' || how === 'fished') ? 'fishing' : 'food-other';
          t.killEvents.push({ day: gday(Game), channel: ch, species: (animal && animal.id) || null,
            speciesName: (animal && animal.name) || null, grossKcal: num(kcal), outcome: ch === 'fishing' ? 'fish' : 'kill' });
        } catch (e) { t.errors++; }
        if (err) throw err;
        return out;
      };
    } else t.errors++;
  } catch (e) { t.errors++; }

  // --- setTrap: which trap recipes the policy actually puts down
  try {
    if (typeof Game.setTrap === 'function') {
      const orig = Game.setTrap.bind(Game);
      Game.setTrap = function (recipeId) {
        let out = null, err = null;
        try { out = orig(recipeId); } catch (e) { err = e; }
        try { if (out) t.trapsSet[String(recipeId)] = (t.trapsSet[String(recipeId)] || 0) + 1; } catch (e) { t.errors++; }
        if (err) throw err;
        return out;
      };
    }
  } catch (e) { t.errors++; }

  // --- 2. hunt-duty channel: villagerHuntResolve (both assign paths resolve here)
  try {
    if (typeof Game.villagerHuntResolve === 'function') {
      const orig = Game.villagerHuntResolve.bind(Game);
      Game.villagerHuntResolve = function (vid, eff) {
        let ret = null, err = null;
        try { ret = orig(vid, eff); } catch (e) { err = e; }
        try {
          const kill = !!(ret && num(ret.kcal) > 0 && ret.aid);
          t.huntResolves.push({ day: gday(Game), vid: String(vid), aid: (ret && ret.aid) || null,
            kill, kcal: num(ret && ret.kcal), msg: strip(ret && ret.msg) });
          if (kill) {
            const animals = Game.data.animals || [];
            const adef = animals.find(a => a.id === ret.aid) || {};
            t.killEvents.push({ day: gday(Game), channel: 'hunt', species: ret.aid,
              speciesName: adef.name || ret.aid, grossKcal: adef.calories || null, outcome: 'kill', vid: String(vid) });
          }
        } catch (e) { t.errors++; }
        if (err) throw err;
        return ret;
      };
    } else t.errors++;
  } catch (e) { t.errors++; }

  // --- 2b. layer assign path: assignTask('hunt')
  try {
    if (typeof Game.assignTask === 'function') {
      const orig = Game.assignTask.bind(Game);
      Game.assignTask = function (vid, task, opts) {
        let out = null, err = null;
        try { out = orig(vid, task, opts); } catch (e) { err = e; }
        try {
          if (String(task) === 'hunt') t.huntAssigns.push({ day: gday(Game), vid: String(vid), via: (opts && opts.via) || 'in-person' });
        } catch (e) { t.errors++; }
        if (err) throw err;
        return out;
      };
    }
  } catch (e) { t.errors++; }

  // --- 3. emergency hunt: stockPantry('Emergency hunt meat', gain)
  try {
    if (typeof Game.stockPantry === 'function') {
      const orig = Game.stockPantry.bind(Game);
      Game.stockPantry = function (kcal, name, opts) {
        let out = null, err = null;
        try { out = orig(kcal, name, opts); } catch (e) { err = e; }
        try {
          if (/emergency hunt/i.test(String(name || ''))) {
            t.emergHunts.push({ day: gday(Game), kcal: num(kcal) });
            t.killEvents.push({ day: gday(Game), channel: 'emergency', species: null,
              speciesName: null, grossKcal: num(kcal), outcome: 'flat' });
          }
        } catch (e) { t.errors++; }
        if (err) throw err;
        return out;
      };
    }
  } catch (e) { t.errors++; }

  // --- 4. monster kills + 4b. death tele with kind (tooling caution #525)
  try {
    if (typeof Game.tele === 'function') {
      const oTele = Game.tele.bind(Game);
      Game.tele = function (type, data) {
        let r; try { r = oTele.apply(this, arguments); } catch (e) { r = undefined; }
        try {
          if (type === 'death') {
            const rec = { day: gday(Game), who: data && data.who, cause: data && data.cause != null ? String(data.cause) : null,
              kind: data && data.kind != null ? String(data.kind) : null, player: !!(data && data.player) };
            if (rec.kind === 'monster') {
              t.monsterKills.push(rec);
              t.killEvents.push({ day: rec.day, channel: 'monster', species: rec.who,
                speciesName: rec.who, grossKcal: null, outcome: 'kill' });
            } else if (rec.kind === 'person' || rec.kind === 'villager') {
              t.personDeaths.push(rec);
            }
          }
        } catch (e) { t.errors++; }
        return r;
      };
    }
  } catch (e) { t.errors++; }

  // --- 5. scholar huntAnimal (bots not expected to call it; the kill itself is
  // captured through foodCarcass 'hunted' — this wrap only counts the verb)
  try {
    if (typeof Game.huntAnimal === 'function') {
      const orig = Game.huntAnimal.bind(Game);
      Game.huntAnimal = function () {
        let out = null, err = null;
        try { out = orig.apply(this, arguments); } catch (e) { err = e; }
        try { t.huntAnimalCalls = (t.huntAnimalCalls || 0) + 1; } catch (e) { t.errors++; }
        if (err) throw err;
        return out;
      };
    }
  } catch (e) { t.errors++; }

  // --- 6. carcass-cleaning cross-check: carcassToMeat + askSpecialist
  function recordClean(via, inv, idx) {
    try {
      const it = inv && inv[idx];
      if (!it || it.foodState !== 'carcass') return;
      const sp = String(it.plantId || '').replace(/^meat_/, '') || 'unknown';
      t.carcassesCleaned.push({ day: gday(Game), species: sp, via });
    } catch (e) { t.errors++; }
  }
  try {
    if (typeof Game.carcassToMeat === 'function') {
      const orig = Game.carcassToMeat.bind(Game);
      Game.carcassToMeat = function (inv, i, knows) {
        try { recordClean('carcassToMeat', inv, i); } catch (e) { t.errors++; }
        return orig(inv, i, knows);
      };
    }
  } catch (e) { t.errors++; }
  try {
    if (typeof Game.askSpecialist === 'function') {
      const orig = Game.askSpecialist.bind(Game);
      Game.askSpecialist = function (vid, idx, container, forceTask) {
        try {
          const inv = container || Game.state.scholar.inventory;
          recordClean('askSpecialist', inv, idx);
        } catch (e) { t.errors++; }
        return orig(vid, idx, container, forceTask);
      };
    }
  } catch (e) { t.errors++; }

  // --- 7. hunt/trap narration corpus (sense-test law)
  try {
    const base = Game.say && Game.say.bind(Game);
    if (base) {
      Game.say = function (msg) {
        try {
          const s = strip(msg);
          if (/🏹|🪤|brings down|stalks? a|winds them|hunted out|snare|trapline/i.test(s)) {
            if (t.huntBeats.length < 4000) t.huntBeats.push({ day: gday(Game), text: s });
          }
        } catch (e) {}
        return base(msg);
      };
    }
  } catch (e) { t.errors++; }
}

function wildlifeSnapshot(Game) {
  // read-only: only tiles that ALREADY carry t.wildlife (no backfill writes)
  const speciesTiles = {}, nearHaven = {};
  try {
    const v = Game.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    const tiles = (Game.map && Game.map.tiles) || [];
    for (let y = 0; y < tiles.length; y++) for (let x = 0; x < (tiles[y] || []).length; x++) {
      const wl = tiles[y][x] && tiles[y][x].wildlife;
      if (!wl) continue;
      const near = (Math.abs(x - hx) + Math.abs(y - hy)) <= 3;
      for (const sid of Object.keys(wl)) {
        if ((wl[sid] || 0) > 0) {
          speciesTiles[sid] = (speciesTiles[sid] || 0) + 1;
          if (near) nearHaven[sid] = (nearHaven[sid] || 0) + 1;
        }
      }
    }
  } catch (e) {}
  return { day: 0, speciesTiles, nearHaven };
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'killaudit-census', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const t = { errors: 0 };
  census.attachBeatRing(Game, t);
  attachKillInstrument(Game, t);
  const hist = { maxRank: 0, table: false, exiled: false, starvedDays: 0, maxArc: 1, maxWave: 1, wins: 0 };
  let prevLeads = {};
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting || pg.tableDone) hist.table = true;
      if (pg.gameWon) hist.wins = 1;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1; if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
      // task-lead snapshot (tooling caution #528: engine hunt duties bypass assignTask)
      try {
        const leads = Object.entries((G.state.village || {}).taskLeads || {}).map(([task, vid]) => ({ task: String(task), vid: String(vid) }));
        if (leads.length) {
          t.taskLeadHunts.push({ day, leads });
          for (const l of leads) {
            const key = l.task + '|' + l.vid;
            if (!prevLeads[key] && l.task === 'hunt') t.taskLeadHunts.push({ day, newLead: true, task: 'hunt', vid: l.vid });
          }
        }
        prevLeads = {};
        for (const l of leads) prevLeads[l.task + '|' + l.vid] = 1;
      } catch (e) { t.errors++; }
      // traps present on tiles, by recipe
      try {
        const byRecipe = {};
        const tiles = (G.map && G.map.tiles) || [];
        for (let y = 0; y < tiles.length; y++) for (let x = 0; x < (tiles[y] || []).length; x++) {
          const tr = (tiles[y][x] || {}).traps || [];
          for (const tp of tr) if (tp && tp.recipeId) byRecipe[String(tp.recipeId)] = (byRecipe[String(tp.recipeId)] || 0) + 1;
        }
        t.trapsOnTiles.push({ day, byRecipe });
      } catch (e) { t.errors++; }
      // wildlife availability, every 10d (read-only)
      try { if (day % 10 === 0) { const snap = wildlifeSnapshot(G); snap.day = day; t.wildSnaps.push(snap); } } catch (e) { t.errors++; }
    } catch (e) { t.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: EFF_DAYS, sampleEvery: 30 }); });
  const days = num(result && result.days);

  // attribution: every cleaned carcass must trace to a captured kill (2d spoil window)
  let leaks = 0;
  try {
    for (const c of t.carcassesCleaned) {
      const hit = t.killEvents.some(k => k.species === c.species && k.outcome === 'kill' && (c.day - k.day) >= 0 && (c.day - k.day) <= 3);
      if (!hit) leaks++;
    }
  } catch (e) { t.errors++; }
  const totalKills = t.killEvents.filter(k => k.channel !== 'fishing' && k.channel !== 'food-other').length;

  const out = {
    schema: 'killaudit-census-b/1', seed, policy: policyId, days, errors: t.errors,
    kills: t.killEvents,
    totalKills, carcassesCleaned: t.carcassesCleaned, leaks,
    huntResolves: t.huntResolves, huntAssigns: t.huntAssigns,
    trapsSet: t.trapsSet, trapsOnTiles: t.trapsOnTiles,
    emergHunts: t.emergHunts, monsterKills: t.monsterKills,
    personDeaths: t.personDeaths, taskLeadHunts: t.taskLeadHunts,
    wildSnaps: t.wildSnaps, huntBeats: t.huntBeats,
    beats: t.beats || [],
    wall: { maxRank: hist.maxRank, table: hist.table, exiled: hist.exiled, starvedDays: hist.starvedDays,
      maxArc: hist.maxArc, maxWave: hist.maxWave, wins: hist.wins },
  };
  out.schemaClean = !!(out.kills && out.huntResolves && out.wildSnaps && out.personDeaths)
    && out.kills.every(k => k.day != null && k.channel && k.outcome);
  out.unattributed = t.killEvents.filter(k => !k.channel || k.channel === 'food-other').length;
  return out;
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid);
      fs.writeFileSync(path.join(EVID, `${pid}-${seed}.json`), JSON.stringify(r, null, 1));
      rows.push(r);
      console.log(`${pid}-${seed}: days=${r.days} kills=${r.totalKills} huntResolves=${r.huntResolves.length} huntAssigns=${r.huntAssigns.length} leaks=${r.leaks} boarKills=${r.kills.filter(k=>k.species==='wild_boar').length} bearKills=${r.kills.filter(k=>k.species==='black_bear').length} errors=${r.errors} schemaClean=${r.schemaClean}`);
    }
  }
  const sum = (f) => rows.reduce((a, r) => a + (r[f] || 0), 0);
  console.log('\n=== corpus ===');
  console.log(`  totalKills=${sum('totalKills')} carcassesCleaned=${rows.reduce((a, r) => a + r.carcassesCleaned.length, 0)}`);
  console.log(`  leaks=${sum('leaks')} unattributed=${sum('unattributed')}`);
  const byCh = {};
  for (const r of rows) for (const k of r.kills) {
    const key = k.channel + '|' + (k.outcome || '?');
    byCh[key] = (byCh[key] || 0) + 1;
  }
  console.log('  by channel|outcome:', JSON.stringify(byCh, null, 1));
  const bySp = {};
  for (const r of rows) for (const k of r.kills) {
    const key = (k.species || 'unknown') + '|' + k.channel;
    bySp[key] = (bySp[key] || 0) + 1;
  }
  console.log('  by species|channel:');
  for (const k of Object.keys(bySp).sort((a, b) => bySp[b] - bySp[a])) console.log(`    ${k}: ${bySp[k]}`);
  const hr = rows.reduce((a, r) => a + r.huntResolves.length, 0);
  const hrKill = rows.reduce((a, r) => a + r.huntResolves.filter(h => h.kill).length, 0);
  console.log(`  huntResolves=${hr} huntKills=${hrKill}`);
  const wall = { national: 0, table: 0, wins: 0, maxWave4: 0, maxWave5: 0 };
  for (const r of rows) {
    if (r.wall.maxRank >= 2) wall.national++;
    if (r.wall.table) wall.table++;
    if (r.wall.wins) wall.wins++;
    if (r.wall.maxWave >= 4) wall.maxWave4++;
    if (r.wall.maxWave >= 5) wall.maxWave5++;
  }
  console.log('  wall:', JSON.stringify(wall));
  const err = rows.filter(r => r.errors > 0 || !r.schemaClean);
  console.log(`  errors/schemaDirty: ${err.length}/${rows.length}`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { attachKillInstrument, wildlifeSnapshot, EVID, oneRun };
