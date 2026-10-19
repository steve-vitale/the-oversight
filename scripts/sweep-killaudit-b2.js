#!/usr/bin/env node
// scripts/sweep-killaudit-b2.js — KILL-SIDE AUDIT CENSUS (flesh-out loop B,
// 2026-10-19, arm sim-killaudit-b2, the fatpipe-b named next "kill-side audit").
//
// DIAGNOSTIC ARM: instruments + evidence only. NO lever, NO game-code change.
// ZERO src/js, ZERO scripts/policies edits.
//
// Canon (read before judging): docs/BEAR.md (bear = a FIGHT, not a harvest;
//   separable fat bear 6 / boar 3 / javelina 2; ~20% of gross; L4 rendering),
//   docs/PRESERVATION.md (render ladder), docs/CANON.md.
//
// Motivating finding (evidence/2026-10-18/sim-fatpipe-b.md): the render
// ladder is SUPPLY-STARVED AT THE KILL LEVEL — 0 fat slabs over 2,121
// run-days; render known 0/16 runs. The kill channel that fires is monster
// carcasses (alien, no butcher.fat) + snare hauls as pantry credit. Hunt
// duties never assigned (control-only census).
//
// This arm answers WHY boar/bear never enter the village's orbit, per kill
// channel, with a ranked binding-gate attribution:
//
//   Q1 (static): trap species table composition — which fat-bearing species
//       can even enter the snare/pit/deadfall/box/spring tables (census of
//       Game data, not guess). Done in scripts/test-killaudit-b2.js PART A
//       (data join) and re-stated here from live Game.data.
//   Q2 (staffing): hunt-duty staffing — wrap Game.assignTask ('hunt') AND
//       snapshot v.taskLeads daily (b3 lesson: the task-lead system bypasses
//       assignTask; finding #528). Every hunt duty ALSO resolves through
//       Game.villagerHuntResolve, so the wrap there sees all channels.
//   Q3 (bear): bear-hunt feasibility — villagerHuntResolve bear path. BEAR.md
//       canon: the bear is a FIGHT ("a non monster monster fight"), not a
//       stalk-kill. The code resolves it as a stalk-kill. The census counts
//       bear draws + resolutions and documents the canon conflict.
//   Q4 (pipeline): haul->butcher — butcher.fat production per kill channel.
//       Fat separates ONLY in carcassToMeat (a carcass ITEM in an inventory).
//       Village channels (hunt duty, snare line, pit line) stockPantry
//       anonymous/named kcal — NO carcass item. The wrap proves it.
//
// PRE-REGISTRATION (binding, MEASUREMENT.md §14):
//   PRIMARY: a ranked attribution of the binding gate per kill channel —
//     boar-via-pit, boar/bear-via-hunt, bear-via-stalk — e.g. "X% of boar
//     absence is knowledge-gating, Y% staffing, Z% trap species table".
//     GO = every census question answered with numbers AND the attribution
//     fully explains the observed 0 fat slabs (no unattributed absence).
//   SEEDS: 99101-99108 x {leadfeast,belongfeast} (matches fatpipe's census;
//     verified fresh 2026-10-18). 16 runs.
//   SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (pre-seat), 180d
//     death-aware (engine tail), control-only (competent base policy).
//   INSTRUMENT HONESTY: scripts/test-killaudit-b2.js — PART A RED/GREEN
//     fixtures, PART B det-gate byte-identical trajectories on/off.
//   COMPLETION GATES: 16/16 runs complete, 0 instrument errors,
//     schema-clean output, 0 unattributed kill events.
//   §15 balanced panel: N/A — diagnostic census, single-arm, no lever.
//   SENSE: read full transcript slices of hunt duties and bear encounters.
//
// Method lessons honored (b3/b4): (1) death-tele kind captured, filter to
// person/villager; (2) v.taskLeads snapshotted daily; (3) wound->fever
// chains: assigned hunter dying within ~7d of a wounding hunt resolve
// counts as hunt-attributable.
//
// INSTRUMENT HONESTY: wraps are read-only (side-ledger only, zero RNG draws,
// zero writes to game state). The wildlife availability scan reads existing
// t.wildlife objects ONLY — never backfillWildlife (backfilling would start
// a tile's ecology sim early and change the trajectory).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-killaudit-b2.js
// Targeted: SEEDS="99101" POLICIES="leadfeast" DAYS=60 SMOKE=1 ...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [99101, 99102, 99103, 99104, 99105, 99106, 99107, 99108]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const EVID = process.env.EVID_DIR || path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-killaudit');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const FAT_SPECIES = ['black_bear', 'wild_boar', 'javelina'];

// ---- the kill ledger: side-ledger only, zero game-state writes ----
function attachKillInstrument(Game, t) {
  t.errors = t.errors || 0;
  t.assignHunts = [];      // assignTask('hunt') calls: {day, vid, via}
  t.taskLeadsDays = [];    // daily snapshot: {day, leads:{task:vid}, huntLead}
  t.huntResolves = [];     // villagerHuntResolve: {day, vid, channel, aid, killed, kcal, difficulty, isHunter}
  t.huntWounds = [];       // hurtVillager cause ~ /hunt/i: {day, vid, dmg, cause}
  t.trapCatches = [];      // foodCarcass: {day, aid, how, grossKcal} (scholar's own traps/nets/lines)
  t.carcassButchers = [];  // carcassToMeat: {day, aid, fatUnits, fatSpecies, fatHiddenKcalEach, caller}
  t.pantryStocks = [];     // stockPantry: {day, label, kcal}
  t.npcTraps = [];         // tele npc_trap: {day, vid, caught, kcal}
  t.npcPits = [];          // tele npc_pit: {day, vid, species, kcal}
  t.deaths = [];           // tele death WITH kind: {day, who, kind, cause, player}
  t.beats = [];            // sense ring
  t.wildAvail = [];        // daily wildlife availability: {day, tiles, bearTiles, boarTiles, javelinaTiles, preySpecies}
  t.knowDays = [];         // daily: {day, renderKnown, book}

  function err() { t.errors++; }

  // A. assignTask wrap — the leader's verb (b3 lesson: blind to task leads)
  try {
    if (typeof Game.assignTask === 'function') {
      const orig = Game.assignTask.bind(Game);
      Game.assignTask = function (vid, task, opts) {
        let out = null, e2 = null;
        try { out = orig(vid, task, opts); } catch (e) { e2 = e; }
        try {
          if (task === 'hunt') t.assignHunts.push({ day: gday(Game), vid: String(vid), via: (opts && opts.via) || 'in-person' });
        } catch (e) { err(); }
        if (e2) throw e2;
        return out;
      };
    } else err();
  } catch (e) { err(); }

  // B. villagerHuntResolve wrap — EVERY hunt duty resolves here (assigned,
  //    task-lead, or other). Zero RNG added, zero state written.
  try {
    if (typeof Game.villagerHuntResolve === 'function') {
      const orig = Game.villagerHuntResolve.bind(Game);
      Game.villagerHuntResolve = function (vid, eff) {
        let channel = 'other';
        try {
          const v = Game.state.village || {};
          const asg = (v.assignments || {})[vid];
          if (asg && asg.task === 'hunt') channel = 'assigned';
          else if ((v.taskLeads || {}).hunt === vid) channel = 'lead';
        } catch (e) { /* read-only probe; never throws outward */ }
        let out = null, e2 = null;
        try { out = orig(vid, eff); } catch (e) { e2 = e; }
        try {
          const aid = out && out.aid ? String(out.aid) : null;
          let difficulty = null, isHunter = null;
          try {
            const adef = (Game.data.animals || []).find(a => a.id === aid) || {};
            difficulty = adef.difficulty || null;
          } catch (e) {}
          try {
            const vp = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
            isHunter = Game.occHuntTier ? Game.occHuntTier(vp) === 1.4 : null;
          } catch (e) {}
          t.huntResolves.push({
            day: gday(Game), vid: String(vid), channel, aid,
            killed: !!(out && (out.kcal || 0) > 0), kcal: (out && out.kcal) || 0,
            difficulty, isHunter,
            bearDrawn: aid === 'black_bear', boarDrawn: aid === 'wild_boar', javelinaDrawn: aid === 'javelina',
          });
        } catch (e) { err(); }
        if (e2) throw e2;
        return out;
      };
    } else err();
  } catch (e) { err(); }

  // C. hurtVillager wrap — wound roll on hunt duties (wound->fever chain input)
  try {
    if (typeof Game.hurtVillager === 'function') {
      const orig = Game.hurtVillager.bind(Game);
      Game.hurtVillager = function (vid, dmg, cause) {
        let out = null, e2 = null;
        try { out = orig(vid, dmg, cause); } catch (e) { e2 = e; }
        try {
          if (/hunt/i.test(String(cause || ''))) t.huntWounds.push({ day: gday(Game), vid: String(vid), dmg: num(dmg), cause: String(cause || '') });
        } catch (e) { err(); }
        if (e2) throw e2;
        return out;
      };
    } else err();
  } catch (e) { err(); }

  // D. foodCarcass wrap — the scholar's own trap/net/line kills become items
  try {
    if (typeof Game.foodCarcass === 'function') {
      const orig = Game.foodCarcass.bind(Game);
      Game.foodCarcass = function (animal, kcal, day, how) {
        let out = null, e2 = null;
        try { out = orig(animal, kcal, day, how); } catch (e) { e2 = e; }
        try {
          t.trapCatches.push({ day: gday(Game), aid: animal && animal.id ? String(animal.id) : '?', how: String(how || '?'), grossKcal: num(kcal) });
        } catch (e) { err(); }
        if (e2) throw e2;
        return out;
      };
    } else err();
  } catch (e) { err(); }

  // E. carcassToMeat wrap — the ONLY fat-separation site. Classify the caller
  //    from the stack (read-only): village-duty (resolveOneAssignment),
  //    scholar (cleanCarcass), specialist (askSpecialist), ability, other.
  try {
    if (typeof Game.carcassToMeat === 'function') {
      const orig = Game.carcassToMeat.bind(Game);
      Game.carcassToMeat = function (inv, i, knows) {
        let aid = '?', fatBefore = 0, caller = 'other';
        try {
          const it = (inv || [])[i] || {};
          aid = String((it.plantId || '').replace(/^meat_/, '') || '?');
          const adef = (Game.data.animals || []).find(a => a.id === aid) || {};
          fatBefore = (adef.butcher || {}).fat || 0;
          const st = new Error().stack || '';
          if (/resolveOneAssignment/.test(st)) caller = 'village-duty';
          else if (/cleanCarcass/.test(st)) caller = 'scholar';
          else if (/askSpecialist/.test(st)) caller = 'specialist';
          else if (/useAbility|abilityActions/.test(st)) caller = 'ability';
        } catch (e) { /* classification is best-effort; never blocks */ }
        const fatSet = new Set();
        try { for (const it of (inv || [])) if (it && it.foodKind === 'fat') fatSet.add(it); } catch (e) {}
        let out = null, e2 = null;
        try { out = orig(inv, i, knows); } catch (e) { e2 = e; }
        try {
          let fatUnits = 0, fatHidden = 0;
          for (const it of (inv || [])) {
            if (it && it.foodKind === 'fat' && !fatSet.has(it)) {
              fatUnits += (it.units || 1);
              fatHidden = num(it.hiddenKcal) || fatHidden;
            }
          }
          t.carcassButchers.push({ day: gday(Game), aid, fatUnits, fatSpecies: fatUnits > 0 ? aid : null, fatHiddenKcalEach: fatHidden, caller, fatCapable: fatBefore > 0 });
        } catch (e) { err(); }
        if (e2) throw e2;
        return out;
      };
    } else err();
  } catch (e) { err(); }

  // F. stockPantry wrap — the village's anonymous/named kcal flows
  try {
    if (typeof Game.stockPantry === 'function') {
      const orig = Game.stockPantry.bind(Game);
      Game.stockPantry = function (kcal, name, opts) {
        let out = null, e2 = null;
        try { out = orig(kcal, name, opts); } catch (e) { e2 = e; }
        try { t.pantryStocks.push({ day: gday(Game), label: String(name || '?').slice(0, 80), kcal: num(kcal) }); } catch (e) { err(); }
        if (e2) throw e2;
        return out;
      };
    } else err();
  } catch (e) { err(); }

  // G. tele wrap — death WITH kind (b3/b4 lesson), npc_trap, npc_pit
  try {
    const oTele = Game.tele ? Game.tele.bind(Game) : null;
    if (!oTele) { err(); return; }
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          t.deaths.push({ day: gday(Game), who: data && data.who, kind: data && data.kind, cause: data && data.cause == null ? null : String(data.cause), player: !!(data && data.player) });
        } else if (type === 'npc_trap') {
          t.npcTraps.push({ day: gday(Game), vid: data && data.vid, caught: !!(data && data.caught), kcal: num(data && data.kcal) });
        } else if (type === 'npc_pit') {
          t.npcPits.push({ day: gday(Game), vid: data && data.vid, species: data && data.species, kcal: num(data && data.kcal) });
        }
      } catch (e) { err(); }
      return r;
    };
  } catch (e) { err(); }

  // H. sense ring — hunt/bear/trap/pit/fat beats for transcript reads
  try {
    const oSay = Game.say ? Game.say.bind(Game) : null;
    if (!oSay) { err(); return; }
    const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
    const RE = /🏹|hunt|bear|boar|javelina|🪤|snare|pit|trap|fat|render|tallow|carcass|butcher|maul/i;
    Game.say = function (msg) {
      try {
        const s = strip(msg);
        if (RE.test(s)) {
          t.beats.push({ day: gday(Game), text: s });
          if (t.beats.length > 4000) t.beats.splice(0, 800);
        }
      } catch (e) {}
      return oSay(msg);
    };
  } catch (e) { err(); }
}

// ---- daily sampling (read-only; never backfillWildlife) ----
function dailySnapshot(Game, t, hist) {
  try {
    const day = gday(Game);
    const v = Game.state.village || {};
    // task leads (finding #528: the assignTask-blind channel)
    try {
      const leads = Object.assign({}, v.taskLeads || {});
      t.taskLeadsDays.push({ day, leads, huntLead: leads.hunt || null });
    } catch (e) { t.errors++; }
    // wildlife availability: read existing t.wildlife only
    try {
      let tiles = 0, bear = 0, boar = 0, jav = 0;
      const prey = {};
      const tilesAll = (Game.map && Game.map.tiles) || [];
      for (const row of tilesAll) for (const tl of (row || [])) {
        const wl = tl && tl.wildlife;
        if (!wl) continue;
        tiles++;
        if ((wl.black_bear || 0) > 0) bear++;
        if ((wl.wild_boar || 0) > 0) boar++;
        if ((wl.javelina || 0) > 0) jav++;
        for (const sid of Object.keys(wl)) prey[sid] = (prey[sid] || 0) + 1;
      }
      t.wildAvail.push({ day, tiles, bearTiles: bear, boarTiles: boar, javelinaTiles: jav, preySpecies: Object.keys(prey).length });
    } catch (e) { t.errors++; }
    // render knowledge (scholar-side; the village's render gate)
    try {
      const rk = !!Game.knowsTechnique('render');
      const book = ((Game.state.scholar || {}).inventory || []).some(i => i && i.bookId === 'tallow_and_keeping');
      t.knowDays.push({ day, renderKnown: rk, book });
      if (rk) hist.renderKnown = true;
    } catch (e) { t.errors++; }
    // wall metrics (report-only)
    try {
      const pg = Game.progState ? Game.progState() : {};
      if (pg.tableWaiting || pg.tableDone) hist.table = true;
      let rank = 'village';
      try { rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((Game.state.scholar || {}).exiled) hist.exiled = true;
      if ((((Game.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = (((Game.state || {}).scholar || {}).prog || {}).arc || 1; if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = Game.unlockedWave ? (Game.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) { t.errors++; }
  } catch (e) { t.errors++; }
}

// wound->fever chain attribution (b4 lesson): an assigned/lead hunter's
// death within ~7d of a wounding hunt resolve counts as hunt-attributable,
// even when the recorded cause is not literally 'hunt' (fever chains).
function computeWoundChains(t) {
  const out = [];
  try {
    const deathsByWho = {};
    for (const d of t.deaths) {
      if (d.kind !== 'person' && d.kind !== 'villager') continue;
      (deathsByWho[d.who] = deathsByWho[d.who] || []).push(d);
    }
    for (const w of t.huntWounds) {
      for (const d of (deathsByWho[w.vid] || [])) {
        if (d.day > w.day && d.day <= w.day + 7) {
          out.push({ vid: w.vid, woundDay: w.day, woundDmg: w.dmg, deathDay: d.day, cause: d.cause, kind: d.kind });
        }
      }
    }
  } catch (e) { t.errors++; }
  return out;
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'killaudit-b', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const t = { errors: 0 };
  attachKillInstrument(Game, t);
  const hist = { maxRank: 0, table: false, exiled: false, starvedDays: 0, maxArc: 1, maxWave: 1, renderKnown: false };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    dailySnapshot(G, t, hist);
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: EFF_DAYS, sampleEvery: 30 }); });
  const days = num(result && result.days);

  // wound->fever chains (b4 lesson): hunt-wounded villager dying within ~7d
  const woundChains = computeWoundChains(t);

  // per-run aggregates
  const agg = (arr, f) => arr.reduce((a, x) => a + (f(x) || 0), 0);
  const huntKcal = agg(t.huntResolves, r => r.killed ? r.kcal : 0);
  const npcSnareKcal = agg(t.npcTraps, r => r.caught ? (r.kcal || 0) : 0);
  const npcPitKcal = agg(t.npcPits, r => r.kcal || 0);
  const pantryByLabel = {};
  for (const p of t.pantryStocks) pantryByLabel[p.label] = (pantryByLabel[p.label] || 0) + (p.kcal || 0);
  const fatSlabs = agg(t.carcassButchers, b => b.fatUnits || 0);
  const villDeaths = t.deaths.filter(d => d.kind === 'person' || d.kind === 'villager');
  const causeShares = {};
  for (const d of villDeaths) causeShares[d.cause || '?'] = (causeShares[d.cause || '?'] || 0) + 1;

  const out = {
    schema: 'killaudit-b/1', seed, policy: policyId, days, errors: t.errors,
    assignHunts: t.assignHunts,
    taskLeadsDays: t.taskLeadsDays,
    huntResolves: t.huntResolves,
    huntWounds: t.huntWounds,
    woundChains,
    trapCatches: t.trapCatches,
    carcassButchers: t.carcassButchers,
    pantryStocks: t.pantryStocks,
    pantryByLabel,
    npcTraps: t.npcTraps,
    npcPits: t.npcPits,
    deaths: t.deaths,
    beats: t.beats,
    wildAvail: t.wildAvail,
    knowDays: t.knowDays,
    agg: {
      huntAssigns: t.assignHunts.length,
      huntLeadDayRows: t.taskLeadsDays.filter(d => d.huntLead).length,
      huntResolves: t.huntResolves.length,
      huntKills: t.huntResolves.filter(r => r.killed).length,
      huntKcal,
      bearDraws: t.huntResolves.filter(r => r.bearDrawn).length,
      boarDraws: t.huntResolves.filter(r => r.boarDrawn).length,
      javelinaDraws: t.huntResolves.filter(r => r.javelinaDrawn).length,
      bearKills: t.huntResolves.filter(r => r.bearDrawn && r.killed).length,
      boarKills: t.huntResolves.filter(r => r.boarDrawn && r.killed).length,
      huntWounds: t.huntWounds.length,
      woundChains: woundChains.length,
      npcSnareCatches: t.npcTraps.filter(r => r.caught).length,
      npcSnareKcal,
      npcPitCatches: t.npcPits.length,
      npcPitKcal,
      npcPitBoar: t.npcPits.filter(r => r.species === 'wild_boar').length,
      scholarTrapCatches: t.trapCatches.length,
      carcassButcherCalls: t.carcassButchers.length,
      fatSlabs,
      villagerDeaths: villDeaths.length,
      monsterKills: t.deaths.filter(d => d.kind === 'monster').length,
    },
    causeShares,
    wall: {
      maxRank: hist.maxRank, table: hist.table, won: !!Game.won, exiled: hist.exiled,
      starvedDays: hist.starvedDays, maxArc: hist.maxArc, maxWave: hist.maxWave, renderKnown: hist.renderKnown,
    },
  };
  out.schemaClean = !!(out.assignHunts && out.taskLeadsDays && out.huntResolves && out.deaths && out.beats && out.wildAvail && out.wall)
    && out.deaths.every(d => d.kind != null);
  // unattributed kill events: a kill that cannot be tied to a species/channel
  out.unattributed = out.huntResolves.filter(r => r.killed && !r.aid).length
    + out.npcPits.filter(p => !p.species).length
    + out.trapCatches.filter(c => !c.aid || c.aid === '?').length;
  return out;
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid);
      const fn = `${pid}-${seed}.json`;
      fs.writeFileSync(path.join(EVID, fn), JSON.stringify(r, null, 1));
      rows.push(r);
      console.log(`${pid}-${seed}: days=${r.days} huntResolves=${r.agg.huntResolves} boarDraws=${r.agg.boarDraws} bearDraws=${r.agg.bearDraws} fatSlabs=${r.agg.fatSlabs} villDeaths=${r.agg.villagerDeaths} errors=${r.errors} schemaClean=${r.schemaClean}`);
    }
  }
  const sum = (f) => rows.reduce((a, r) => a + (r.agg[f] || 0), 0);
  console.log('\n=== corpus ===');
  for (const k of ['huntAssigns', 'huntLeadDayRows', 'huntResolves', 'huntKills', 'bearDraws', 'boarDraws', 'javelinaDraws', 'bearKills', 'boarKills', 'huntWounds', 'woundChains', 'npcSnareCatches', 'npcPitCatches', 'npcPitBoar', 'scholarTrapCatches', 'carcassButcherCalls', 'fatSlabs', 'villagerDeaths', 'monsterKills']) {
    console.log(`  ${k}=${sum(k)}`);
  }
  console.log(`  huntKcal=${sum('huntKcal')} npcSnareKcal=${sum('npcSnareKcal')} npcPitKcal=${sum('npcPitKcal')}`);
  const wall = { national: 0, table: 0, won: 0, maxWave4: 0, maxWave5: 0, renderKnown: 0, maxArc: 0 };
  for (const r of rows) {
    if (r.wall.maxRank >= 2) wall.national++;
    if (r.wall.table) wall.table++;
    if (r.wall.won) wall.won++;
    if (r.wall.maxWave >= 4) wall.maxWave4++;
    if (r.wall.maxWave >= 5) wall.maxWave5++;
    if (r.wall.renderKnown) wall.renderKnown++;
    wall.maxArc = Math.max(wall.maxArc, r.wall.maxArc || 1);
  }
  console.log(`  wall: national=${wall.national}/16 table=${wall.table}/16 won=${wall.won}/16 wave4=${wall.maxWave4}/16 wave5=${wall.maxWave5}/16 renderKnown=${wall.renderKnown}/16 maxArc=${wall.maxArc}`);
  const err = rows.filter(r => r.errors > 0 || !r.schemaClean);
  console.log(`  errors/schemaDirty: ${err.length}/16`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { attachKillInstrument, dailySnapshot, computeWoundChains, EVID, oneRun, FAT_SPECIES };
