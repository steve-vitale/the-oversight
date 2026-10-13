#!/usr/bin/env node
// scripts/meat-discovery-20261013.js — the MONSTER-MEAT DISCOVERY AUDIT
// (longsim scale-wall r10, 2026-10-13). Steve 2026-10-13 (main chat): "Monster
// kills are supposed to sometimes be a food source once discovered." The r5
// "55 kcal/kill" was a POLICY measurement — competent never cautious-tests
// unknown flesh. This instrument measures meat-as-food with the discovery
// chain actually exercised (meatseek policy vs competent baseline).
//
// TOOLING ONLY — no game balance changes (measurement §8). Wraps (Game
// methods, no RNG touched, no game state mutated):
//   markMonsterFoodSafe(mid, how) -> discovery events {day, mid, how, byNPC}
//   testMonsterMeat(idx, container) -> player test attempts {day, mid, outcome}
//   carcassToMeat(inv,i,knows) -> monster-meat HARVEST POTENTIAL
//        (gross x 0.40 standard yield — the honest net the reveal would
//        grant; at clean time undiscovered flesh reads net 0, which is why
//        r5 measured 55 kcal/kill) vs all-meat harvest
//   Game.eat -> player monster-meat kcal eaten (pack+pantry delta of edible
//        monster-meat kcal across each eat() call)
//   stockPantry/donateToPantry -> total village food influx (the denominator)
//   sweepSpoiled -> monster-meat rot (what never got eaten)
//   contractDisease -> sickness events (discovery cost accounting)
//   exilePlayer/removeVillager -> exiled count (wall numbers)
//   Game.say -> transcript sample of meat/flesh/test lines (SENSE-TESTING)
// Wall fields per run: national/table/won/maxWave/medianDays/exiled.
//
// Usage:
//   SEEDS="11,22,33,44" POLICIES="competent,meatseek" DAYS=150 \
//   OUT=/tmp/meat-r1.json node scripts/meat-discovery-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { meatseek } = require('./policies/meatseek');

const POLICY_REGISTRY = { competent, meatseek };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const MEAT_RE = /flesh|meat|test it cautiously|cautious|it sits fine|NOT food|tongue goes numb|carcass|butcher|cleaned/i;

function attachInstruments(Game) {
  const m = {
    kills: 0, killsByWave: {},
    carcasses: 0, carcassBy: {}, carcassKcal: 0, // kill->carcass funnel
    meatPotential: 0,   // monster-meat harvest potential kcal (gross x 0.40)
    meatPotentialBy: {}, // mid -> kcal
    revealedKcal: 0, revealedBy: {}, // kcal the reveal granted (meat became food)
    animalMeatNet: 0,   // non-monster meat net (context)
    influx: {},          // total village food inflow by source
    discoveries: [],     // {day, mid, how, byNPC}
    tests: [],           // {day, mid, outcome} player testMonsterMeat attempts
    meatEatenKcal: 0,    // player-consumed monster-meat kcal
    meatRotKcal: 0,      // monster-meat kcal that rotted uneaten
    corpseRotKcal: 0,    // monster-meat kcal that rotted ON CORPSES unlooted
    sickness: [],        // {day, source}
    exiles: 0,
    transcript: [],       // sampled say-lines (cap 80/run)
  };
  const day = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const isMonsterMeatId = (plantId) => {
    const mid = String(plantId || '').replace(/^meat_/, '');
    if (!mid || mid === 'human') return null;
    try { return (Game.data.monsters || []).some(x => x.id === mid) ? mid : null; }
    catch (e) { return null; }
  };
  const monsterMeatKcalIn = (cont) => {
    let k = 0;
    try {
      for (const it of (cont || [])) {
        if (!it || it.foodKind !== 'meat' || !it.edible || !(it.kcalEach > 0)) continue;
        if (isMonsterMeatId(it.plantId)) k += (it.kcalEach || 0) * (it.units || 1);
      }
    } catch (e) {}
    return k;
  };
  const wrap = (name, fn) => {
    const f = Game[name];
    if (typeof f !== 'function') return;
    Game[name] = function (...a) { try { fn.apply(this, a); } catch (e) {} return f.apply(this, a); };
  };

  // discoveries: markMonsterFoodSafe is the single funnel (player test, NPC
  // fireside experiment, villager word/Codex paths). byNPC is attributed
  // DEFERRED at finalize via the codex foodTestedBy flag — the NPC beat
  // sets it AFTER markMonsterFoodSafe returns, so reading it in the wrap
  // always says false (instrument bug r10a, fixed r10b).
  const origMark = Game.markMonsterFoodSafe;
  if (typeof origMark === 'function') {
    Game.markMonsterFoodSafe = function (mid, how) {
      let revealedK = 0;
      try {
        const e0 = ((Game.state.codex || {}).monsters || {})[mid] || {};
        m.discoveries.push({ day: day(), mid: String(mid), how: String(how || '?'),
          already: !!e0.foodSafe });
      } catch (e) {}
      const r = origMark.apply(this, arguments);
      try {
        // REVEALED KCAL: the reveal grants kcalEach to matching pack+stash
        // meat — this is "meat that became food" (vs potential = harvested).
        const mid2 = String(mid);
        const scan = (cont) => {
          for (const it of (cont || [])) {
            if (it && it.foodKind === 'meat' && it.edible && (it.kcalEach || 0) > 0 &&
                String(it.plantId || '') === 'meat_' + mid2)
              revealedK += (it.kcalEach || 0) * (it.units || 1);
          }
        };
        scan(Game.state.scholar.inventory);
        try { const ps = Game.prepStash ? Game.prepStash() : null; if (ps && ps !== Game.state.scholar.inventory) scan(ps); } catch (e) {}
        m.revealedKcal += revealedK;
        m.revealedBy[mid2] = (m.revealedBy[mid2] || 0) + revealedK;
      } catch (e) {}
      return r;
    };
  }
  // kill->carcass funnel: how many edible kills actually left a carcass.
  const origMME = Game.monsterMeatEntry;
  if (typeof origMME === 'function') {
    Game.monsterMeatEntry = function (mdef) {
      const r = origMME.apply(this, arguments);
      try {
        if (r && mdef && mdef.id) {
          m.carcasses++;
          m.carcassBy[mdef.id] = (m.carcassBy[mdef.id] || 0) + 1;
          m.carcassKcal += (mdef.edible && mdef.edible.calories) || 0;
        }
      } catch (e) {}
      return r;
    };
  }
  // the specialist's knife is a second cleaning path (askSpecialist auto-
  // chooses 'butcher' on carcasses) — it bypasses Game.carcassToMeat, so
  // without this wrap the potential metric undercounts (instrument bug r10a).
  const origAskSpec = Game.askSpecialist;
  if (typeof origAskSpec === 'function') {
    Game.askSpecialist = function (vid, idx, container, forceTask) {
      let itRef = null, gross = 0, mid = null;
      try {
        const inv = container || Game.state.scholar.inventory;
        itRef = inv && inv[idx];
        if (itRef && itRef.foodState === 'carcass' && (itRef.hiddenKcal || 0) > 0) {
          mid = isMonsterMeatId(itRef.plantId);
          gross = itRef.hiddenKcal || 0;
        }
      } catch (e) {}
      const r = origAskSpec.apply(this, arguments);
      try {
        // success = the carcass reference no longer sits uncleaned
        if (mid && gross > 0 && itRef && itRef.foodState !== 'carcass') {
          const pot = Math.round(gross * 0.40);
          m.meatPotential += pot;
          m.meatPotentialBy[mid] = (m.meatPotentialBy[mid] || 0) + pot;
        }
      } catch (e) {}
      return r;
    };
  }
  // player test attempts (testMonsterMeat): outcome by before/after codex read.
  const origTest = Game.testMonsterMeat;
  if (typeof origTest === 'function') {
    Game.testMonsterMeat = function (idx, container) {
      let mid = '?', before = false;
      try {
        const cont = container || Game.state.scholar.inventory;
        const it = cont && cont[idx];
        mid = String((it && it.plantId) || '').replace(/^meat_/, '') || '?';
        before = !!(Game.monsterFoodSafe && Game.monsterFoodSafe(mid));
      } catch (e) {}
      const r = origTest.apply(this, arguments);
      try {
        const after = !!(Game.monsterFoodSafe && Game.monsterFoodSafe(mid));
        const e2 = ((Game.state.codex || {}).monsters || {})[mid] || {};
        m.tests.push({ day: day(), mid,
          outcome: after && !before ? 'safe' : (e2.foodTested === 'poison' ? 'poison' : 'none') });
      } catch (e) {}
      return r;
    };
  }
  // harvest potential: gross x 0.40 standard yield for monster meat (what the
  // reveal grants per markMonsterFoodSafe — the break-it 2026-10-09 honesty
  // rule). Non-monster meat tracked as context.
  const origCTM = Game.carcassToMeat;
  if (typeof origCTM === 'function') {
    Game.carcassToMeat = function (inv, i, knows) {
      let gross = 0, mid = null;
      try {
        const it = inv && inv[i];
        gross = (it && it.hiddenKcal) || 0;
        mid = isMonsterMeatId(it && it.plantId);
      } catch (e) {}
      const r = origCTM.apply(this, arguments);
      try {
        if (mid && gross > 0) {
          const pot = Math.round(gross * 0.40);
          m.meatPotential += pot;
          m.meatPotentialBy[mid] = (m.meatPotentialBy[mid] || 0) + pot;
        } else if (gross > 0) {
          const it2 = inv && inv[i];
          m.animalMeatNet += Math.round(((it2 && it2.kcalEach) || 0) * ((it2 && it2.units) || 1));
        }
      } catch (e) {}
      return r;
    };
  }
  // player monster-meat eaten: pack+pantry delta of edible monster-meat kcal
  // across each eat() call (eat() only consumes; nothing else moves food here).
  const origEat = Game.eat;
  if (typeof origEat === 'function') {
    Game.eat = function (...a) {
      let before = 0;
      try {
        before = monsterMeatKcalIn(Game.state.scholar.inventory) +
          monsterMeatKcalIn((Game.state.village || {}).pantry);
      } catch (e) {}
      const r = origEat.apply(this, a);
      try {
        const after = monsterMeatKcalIn(Game.state.scholar.inventory) +
          monsterMeatKcalIn((Game.state.village || {}).pantry);
        if (after < before) m.meatEatenKcal += (before - after);
      } catch (e) {}
      return r;
    };
  }
  // total village food influx (the share denominator).
  wrap('stockPantry', (kcal, name) => {
    const k = Math.round(kcal || 0);
    if (k > 0) m.influx[String(name || 'unknown')] = (m.influx[String(name || 'unknown')] || 0) + k;
  });
  const origDonate = Game.donateToPantry;
  if (typeof origDonate === 'function') {
    Game.donateToPantry = function (idx) {
      let k = 0;
      try {
        const it = (Game.state.scholar.inventory || [])[idx];
        if (it) k = (it.kcalEach || 0) * (it.units || 1);
      } catch (e) {}
      const r = origDonate.apply(this, arguments);
      try { if (k > 0) m.influx['Player donation'] = (m.influx['Player donation'] || 0) + k; } catch (e) {}
      return r;
    };
  }
  // monster-meat rot (uneaten waste).
  const origSweep = Game.sweepSpoiled;
  if (typeof origSweep === 'function') {
    Game.sweepSpoiled = function (...a) {
      try {
        const scan = (cont) => {
          for (const it of (cont || [])) {
            if (it && !it.bonded && Game.isSpoiled && Game.isSpoiled(it) && isMonsterMeatId(it.plantId))
              m.meatRotKcal += Math.round((it.kcalEach || 0) * (it.units || 1) + (it.hiddenKcal || 0) * 0.40);
          }
        };
        scan(Game.state.scholar.inventory);
        try { const ps = Game.prepStash ? Game.prepStash() : null; if (ps && ps !== Game.state.scholar.inventory) scan(ps); } catch (e) {}
        scan((Game.state.village || {}).pantry);
        // CORPSE-SIDE ROT (r10b): carcasses rot ON CORPSES in 3 days via the
        // same sweep — the un-instrumented sink. Loot-as-action means an
        // unlooted kill's meat dies where it fell.
        try {
          for (const c of (Game.corpses ? Game.corpses() : [])) {
            for (const it of ((c && c.items) || [])) {
              if (it && !it.bonded && Game.isSpoiled && Game.isSpoiled(it)) {
                const mid = isMonsterMeatId(it.plantId);
                if (mid) m.corpseRotKcal += Math.round((it.hiddenKcal || 0));
                else if (it.foodKind === 'meat') m.corpseRotKcal += Math.round((it.hiddenKcal || 0) * 0.4);
              }
            }
          }
        } catch (e) {}
      } catch (e) {}
      return origSweep.apply(this, a);
    };
  }
  // sickness cost (discovery chain pays in energy; eating raw would pay here).
  wrap('contractDisease', (id, opts) => {
    try { m.sickness.push({ day: day(), id: String(id), source: String((opts && opts.source) || '?') }); } catch (e) {}
  });
  // exiles (wall numbers).
  wrap('exilePlayer', () => { m.exiles++; });
  wrap('removeVillager', (vid, why) => { if (String(why) === 'exiled') m.exiles++; });
  // kills for context.
  wrap('recordWaveKill', (mid) => {
    try {
      m.kills++;
      const d = (Game.data.monsters || []).find(x => x.id === mid);
      const w = (d && d.wave) || 1;
      m.killsByWave[w] = (m.killsByWave[w] || 0) + 1;
    } catch (e) {}
  });
  // transcript sampling (SENSE-TESTING): keep meat/flesh/test lines.
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...a) {
      try {
        const line = String(a[0] || '');
        if (m.transcript.length < 80 && MEAT_RE.test(line)) m.transcript.push({ day: day(), line: line.slice(0, 300) });
      } catch (e) {}
      return origSay.apply(this, a);
    };
  }
  return m;
}

function finalize(Game, m, result) {
  const out = { days: result.days, endReason: result.endReason,
    kills: m.kills, killsByWave: m.killsByWave,
    carcasses: m.carcasses, carcassBy: m.carcassBy, carcassKcal: Math.round(m.carcassKcal),
    meatPotentialK: Math.round(m.meatPotential),
    meatPotentialBy: m.meatPotentialBy,
    revealedK: Math.round(m.revealedKcal), revealedBy: m.revealedBy,
    animalMeatNetK: Math.round(m.animalMeatNet),
    meatEatenK: Math.round(m.meatEatenKcal),
    meatRotK: Math.round(m.meatRotKcal),
    corpseRotK: Math.round(m.corpseRotKcal),
    influx: m.influx,
    discoveries: m.discoveries, discoveryCount: m.discoveries.filter(d => !d.already).length,
    tests: m.tests,
    sickness: m.sickness,
    exiles: m.exiles,
    transcript: m.transcript,
  };
  // DEFERRED NPC attribution: the NPC experiment beat sets foodTestedBy
  // after markMonsterFoodSafe returns — read the final codex here.
  try {
    const cm = (Game.state.codex || {}).monsters || {};
    for (const d of out.discoveries) {
      const e = cm[d.mid] || {};
      d.byNPC = !!e.foodTestedBy;
      d.tester = e.foodTestedBy || e.foodSafeHow || d.how;
    }
  } catch (e) {}
  out.npcDiscoveries = out.discoveries.filter(d => !d.already && d.byNPC).length;
  const totalInflux = Object.values(m.influx).reduce((t, v) => t + v, 0);
  out.totalInfluxK = Math.round(totalInflux);
  out.meatSharePct = totalInflux > 0 ? +((m.meatPotential / totalInflux) * 100).toFixed(2) : 0;
  out.meatEatenSharePct = totalInflux > 0 ? +((m.meatEatenKcal / totalInflux) * 100).toFixed(2) : 0;
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { out.maxWave = 1; }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { out.rank = 'village'; }
  out.won = !!Game.won;
  out.national = (RANK_ORDER[out.rank] || 0) >= 2 ? 1 : 0;
  out.table = out.tableWaiting ? 1 : 0;
  // wave 4-5 unlocks: any seed whose maxWave reached 4/5
  return out;
}

async function runMeatAudit(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'meat-r1';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'competent,meatseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'meataudit-' + pid });
      await setupGame(Game);
      const m = attachInstruments(Game);
      const policy = Object.assign({}, base);
      const hist = { maxRank: 0, everTable: false, maxWave: 1 };
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          const rk = RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village')] || 0;
          hist.maxRank = Math.max(hist.maxRank, rk);
          if (G.progState && G.progState().tableWaiting) hist.everTable = true;
          if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave());
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const row = Object.assign({ label, policy: pid, seed }, finalize(Game, m, result));
      row.national = hist.maxRank >= 2 ? 1 : 0; // reachability needs history
      row.table = (hist.everTable || row.table) ? 1 : 0;
      row.maxWave = Math.max(row.maxWave, hist.maxWave);
      rows.push(row);
      console.log(`  [${pid} seed ${seed}] d=${row.days} ${row.endReason} kills=${row.kills} meatPot=${(row.meatPotentialK/1000).toFixed(1)}k share=${row.meatSharePct}% eaten=${(row.meatEatenK/1000).toFixed(1)}k disc=${row.discoveryCount}(npc:${row.npcDiscoveries}) tests=${row.tests.length} sick=${row.sickness.length} exiled=${row.exiles} nat=${row.national} tab=${row.table} wave=${row.maxWave}`);
    }
  }
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const byPolicy = {};
  for (const pid of policyIds) {
    const rs = rows.filter(r => r.policy === pid);
    byPolicy[pid] = {
      n: rs.length,
      won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: med(rs.map(r => r.days)),
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      exiled: rs.reduce((t, r) => t + r.exiles, 0),
      maxWave: Math.max.apply(null, rs.map(r => r.maxWave).concat([1])),
      wave45: rs.filter(r => r.maxWave >= 4).length,
      kills: rs.reduce((t, r) => t + r.kills, 0),
      carcasses: rs.reduce((t, r) => t + r.carcasses, 0),
      carcassKcal: rs.reduce((t, r) => t + r.carcassKcal, 0),
      meatPotentialK: rs.reduce((t, r) => t + r.meatPotentialK, 0),
      revealedK: rs.reduce((t, r) => t + r.revealedK, 0),
      meatEatenK: rs.reduce((t, r) => t + r.meatEatenK, 0),
      meatRotK: rs.reduce((t, r) => t + r.meatRotK, 0),
      corpseRotK: rs.reduce((t, r) => t + r.corpseRotK, 0),
      totalInfluxK: rs.reduce((t, r) => t + r.totalInfluxK, 0),
      discoveries: rs.reduce((t, r) => t + r.discoveryCount, 0),
      npcDiscoveries: rs.reduce((t, r) => t + r.npcDiscoveries, 0),
      tests: rs.reduce((t, r) => t + r.tests.length, 0),
      sickness: rs.reduce((t, r) => t + r.sickness.length, 0),
    };
    const b = byPolicy[pid];
    b.meatSharePct = b.totalInfluxK > 0 ? +((b.meatPotentialK / b.totalInfluxK) * 100).toFixed(2) : 0;
    b.meatEatenSharePct = b.totalInfluxK > 0 ? +((b.meatEatenK / b.totalInfluxK) * 100).toFixed(2) : 0;
  }
  return { label, seeds, policies: policyIds, days, byPolicy, rows };
}

function printSummary(rep) {
  console.log(`\n=== ${rep.label} === policies=[${rep.policies.join(',')}] seeds=[${rep.seeds.join(',')}] days=${rep.days}`);
  for (const pid of rep.policies) {
    const b = rep.byPolicy[pid];
    console.log(`[${pid}] n=${b.n} won=${b.won} medDays=${b.medianDays} national=${b.national}/${b.n} table=${b.table}/${b.n} exiled=${b.exiled} maxWave=${b.maxWave} wave45=${b.wave45}/${b.n}`);
    console.log(`  meat: carcasses=${b.carcasses} (gross ${(b.carcassKcal/1000).toFixed(1)}k) potential=${(b.meatPotentialK/1000).toFixed(1)}k share=${b.meatSharePct}% revealed=${(b.revealedK/1000).toFixed(1)}k eaten=${(b.meatEatenK/1000).toFixed(1)}k eatenShare=${b.meatEatenSharePct}% rot=${(b.meatRotK/1000).toFixed(1)}k corpseRot=${(b.corpseRotK/1000).toFixed(1)}k influx=${(b.totalInfluxK/1000).toFixed(0)}k`);
    console.log(`  discovery: total=${b.discoveries} npc=${b.npcDiscoveries} playerTests=${b.tests} sickness=${b.sickness} kills=${b.kills}`);
  }
  console.log('');
}

if (require.main === module) {
  (async () => {
    const rep = await runMeatAudit();
    printSummary(rep);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.log('wrote', out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runMeatAudit, attachInstruments };
