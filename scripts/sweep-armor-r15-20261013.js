#!/usr/bin/env node
// scripts/sweep-armor-r15-20261013.js — scale-wall r15 ARMOR UPTAKE driver.
//
// Step 1 (baseline, lever off): seeds 11/22/33/44 x belongseek/leadcourt,
// 150d death-aware, no env gates. Measures the r14 question: do day-7+
// scholars actually wear P>=20, or does wave 2 meet them naked?
//   SEEDS="11,22,33,44" POLICIES="belongseek,leadcourt" DAYS=150 \
//     OUT=evidence/2026-10-13/sim-scale-wall-r15-baseline.json \
//     node scripts/sweep-armor-r15-20261013.js
// Step 4 (pilot, lever on): HIDE_R15=1, policies belonghide/leadhide
// (withHide wrappers — default-OFF pure delegation without the gate).
//   HIDE_R15=1 SEEDS="11,22,33,44" POLICIES="belonghide,leadhide" DAYS=150 \
//     OUT=evidence/2026-10-13/sim-scale-wall-r15-pilot.json \
//     node scripts/sweep-armor-r15-20261013.js
//
// TOOLING + policy-side lever only. No game-code balance changes.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const { belonghide, leadhide } = require('./policies/hide');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const POLICY_REGISTRY = { belongseek, leadcourt, belonghide, leadhide };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
const armorP = (Game) => { try { return (typeof Game.armorBonus === 'function' ? Game.armorBonus() : 0) || 0; } catch (e) { return 0; } };
const itemIdsOf = (arr) => (arr || []).map(i => (i && (i.itemId || i.id)) || null).filter(Boolean);

function attachArmor(Game) {
  const a = {
    daily: [],          // {day, P}
    crafts: {},         // recipeId -> n
    hidesTaken: 0,      // material==='hide' items taken via corpseTakeItem
    hidesLooted: 0,     // any hide looted (incl. pack-start)
    beam: { fired: 0, landed: 0, fights: 0 },
  };
  // craft: count per recipe (player-side only; NPCs never call Game.craft)
  if (typeof Game.craft === 'function' && !Game.craft._armorWrapped) {
    const oc = Game.craft;
    const w = function (rid) {
      let r;
      try { r = oc.apply(this, arguments); } catch (e) { throw e; }
      try { if (r) a.crafts[rid] = (a.crafts[rid] || 0) + 1; } catch (e2) {}
      return r;
    };
    w._armorWrapped = true;
    Game.craft = w;
  }
  // corpseTakeItem: count hide-material units entering the pack
  if (typeof Game.corpseTakeItem === 'function' && !Game.corpseTakeItem._armorWrapped) {
    const ot = Game.corpseTakeItem;
    const w = function (cid, idx) {
      let corpse = null, before = null;
      try { corpse = (Game.corpses || (() => []))().find(c => c && c.id === cid); } catch (e) {}
      try { before = corpse && corpse.items && corpse.items[idx]; } catch (e) {}
      let r;
      try { r = ot.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (r && before && before.material === 'hide') {
          a.hidesTaken += (before.units || 1);
        }
      } catch (e2) {}
      return r;
    };
    w._armorWrapped = true;
    Game.corpseTakeItem = w;
  }
  // tbBeamSweepTick: gallowdeer Ocular Discharge fire-turn honesty —
  // each non-visual tick = one of the 6 fire turns; landed = player HP
  // actually dropped across the tick (covers dodge/armor/wounds math).
  if (typeof Game.tbBeamSweepTick === 'function' && !Game.tbBeamSweepTick._armorWrapped) {
    const ob = Game.tbBeamSweepTick;
    const w = function (m, tg, visualOnly) {
      const isDeer = (() => { try { return Game.deerIs(m); } catch (e) { return false; } })();
      const atk = (tg && tg.attackName) || '';
      const ocular = isDeer && /ocular/i.test(atk);
      let php = null;
      if (ocular && !visualOnly) {
        try { const pf = Game.tbfight && Game.tbfight.fighters && Game.tbfight.fighters.find(x => x && x.kind === 'player'); php = pf ? pf.hp : null; } catch (e) {}
      }
      let r;
      try { r = ob.apply(this, arguments); } catch (e) { throw e; }
      if (ocular && !visualOnly) {
        a.beam.fired++;
        try {
          const pf = Game.tbfight && Game.tbfight.fighters && Game.tbfight.fighters.find(x => x && x.kind === 'player');
          if (pf && php != null && pf.hp < php) a.beam.landed++;
        } catch (e) {}
      }
      return r;
    };
    w._armorWrapped = true;
    Game.tbBeamSweepTick = w;
  }
  return a;
}

function armorRow(Game) {
  return { day: gday(Game), P: armorP(Game) };
}

function finalizeArmor(Game, a, result) {
  const out = {};
  // death causes (from harness samples)
  try {
    out.deathCauses = {};
    for (const d of ((result && result.samples && result.samples.deaths) || [])) {
      const k = d.cause || d.kind || 'unknown';
      out.deathCauses[k] = (out.deathCauses[k] || 0) + 1;
    }
  } catch (e) { out.deathCauses = {}; }
  try {
    const rec = ((Game.state.codex || {}).recipes || {});
    for (const rid of ['hide_armor', 'bark_armor']) {
      const e = rec[rid] || {};
      out[rid] = { level: e.level || 0, via: e.via || null, learnedFrom: e.learnedFrom || null, learnedDay: e.learnedDay != null ? e.learnedDay : null };
    }
  } catch (e) { out.hide_armor = { level: 0 }; out.bark_armor = { level: 0 }; }
  out.crafts = a.crafts;
  out.hidesTaken = a.hidesTaken;
  out.beam = { fired: a.beam.fired, landed: a.beam.landed, rate: a.beam.fired ? +(a.beam.landed / a.beam.fired).toFixed(3) : null };
  // scholar armor state: worn ids + owned armor
  try {
    const s = Game.state.scholar || {};
    out.wornIds = itemIdsOf(Object.values(s.equipped || {}));
    out.wornP = armorP(Game);
    const defOf = (it) => (Game.data.items || []).find(d => d.id === (it.itemId || it.id));
    out.ownedArmor = itemIdsOf((s.inventory || []).filter(it => { const d = defOf(it); return d && d.armor; }));
  } catch (e) { out.wornIds = []; out.ownedArmor = []; }
  // NPCs: do any villagers own/wear hide or bark armor?
  try {
    out.npcArmor = [];
    for (const vid of ((Game.state.village || {}).roster || [])) {
      let person = null;
      try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      if (!person) continue;
      const pool = []
        .concat(itemIdsOf(person.items || []))
        .concat(itemIdsOf(person.stashed || []))
        .concat(itemIdsOf(Object.values(person.equipped || {})));
      const found = pool.filter(id => id === 'hide_armor' || id === 'bark_armor');
      if (found.length) out.npcArmor.push({ vid: String(vid).slice(0, 12), ids: found });
    }
  } catch (e) { out.npcArmor = []; }
  // daily P curve -> uptake counters
  const days = a.daily;
  out.scholarDaysP20 = days.filter(r => r.P >= 20).length;
  out.scholarDaysP10 = days.filter(r => r.P >= 10).length;
  const pAt = (d) => { const r = days.filter(x => x.day <= d).pop(); return r ? r.P : null; };
  out.pByDay = { d7: pAt(7), d14: pAt(14), d25: pAt(25) };
  return out;
}

async function main() {
  const label = process.env.LEVER || 'armor-r15';
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'belongseek,leadcourt').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'armor-r15-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      const am = attachArmor(Game);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        try { am.daily.push(armorRow(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const row = Object.assign({ label, policy: pid, seed },
        fc.finalize(Game, m, result), finalizeScale(Game, m), finalizeArmor(Game, am, result));
      rows.push(row);
      const hr = row.hide_armor, br = row.bark_armor;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} P@d7/${row.pByDay.d7}@14/${row.pByDay.d14}@25/${row.pByDay.d25} dP20=${row.scholarDaysP20} hides=${row.hidesTaken} hideR=${hr.level}(${hr.via || '?'}) barkR=${br.level}(${br.via || '?'}) crafts=${JSON.stringify(row.crafts)} beam=${row.beam.landed}/${row.beam.fired} rank=${row.rank} natHeld=${row.nationalHeldDays} wave=${row.maxWave}`);
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const s = {
    label, runs: rows.length,
    national: agg(r => (r.nationalHeldDays > 0 ? 1 : 0)),
    table: agg(r => r.table),
    won: agg(r => r.won),
    wave4: agg(r => (r.maxWave >= 4 ? 1 : 0)),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    vests: agg(r => r.vests),
    exiledEver: agg(r => r.exiledEver),
    // r15 armor aggregates
    p20ByD25: agg(r => (r.pByDay.d25 != null && r.pByDay.d25 >= 20 ? 1 : 0)),
    p10ByD25: agg(r => (r.pByDay.d25 != null && r.pByDay.d25 >= 10 ? 1 : 0)),
    hideCrafts: agg(r => (r.crafts.hide_armor || 0)),
    barkCrafts: agg(r => (r.crafts.bark_armor || 0)),
    hidesTaken: agg(r => r.hidesTaken),
    hideRecipeEver: agg(r => (r.hide_armor.level >= 1 ? 1 : 0)),
    scholarDaysP20: agg(r => r.scholarDaysP20),
    beamFired: agg(r => r.beam.fired),
    beamLanded: agg(r => r.beam.landed),
    ms: Date.now() - t0,
  };
  console.log(`\nwall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4 ${s.wave4}/${s.runs} medianDays ${s.medianDays} maxDays ${s.maxDays} vests ${s.vests} exiledEver ${s.exiledEver}/${s.runs}`);
  console.log(`armor: P>=20@D25 ${s.p20ByD25}/${s.runs} P>=10@D25 ${s.p10ByD25}/${s.runs} hideCrafts ${s.hideCrafts} barkCrafts ${s.barkCrafts} hidesTaken ${s.hidesTaken} hideRecipeEver ${s.hideRecipeEver}/${s.runs} scholarDaysP20 ${s.scholarDaysP20} beamLandRate ${s.beamFired ? (s.beamLanded / s.beamFired).toFixed(3) : 'n/a'} (${s.beamLanded}/${s.beamFired})`);
  const out = process.env.OUT;
  const rep = { summary: s, rows };
  if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  else console.log(JSON.stringify(rep.summary));
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = { attachArmor, finalizeArmor };
