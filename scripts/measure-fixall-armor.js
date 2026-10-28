#!/usr/bin/env node
// measure-fixall-armor.js — fixall-armor round 3 before/after band (see
// evidence/2026-10-28/fixall-armor-prereg.md, binding). Tooling only: no
// game change in this file. Measures, on identical seeds/policies, whether
// the NPC armor-craft beat fires in the LIVE condition (no ARMORVILLAGE
// flag in either leg — the flag must not bypass the enable being judged)
// and whether crafts fire and end up worn. Exits 0 on a completed band even
// when crafts are 0 — the bars are judged in the results file, not by this
// script's exit code. Coincidence is RECIPE-MATCHED (round 3 correction of
// r2's over-broad metric, pre-registered before this band runs): a day
// counts only when a wearer of THAT recipe is home AND that recipe is
// complete (bark-wearer + 3 bark + 2 vine, or hide-wearer + 2 hide + 1 vine).
//
// Usage (pinned substrate, exactly as pre-registered):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 \
//   SEEDS=67601,67602,67603,67604,67605,67606,67607,67608 DAYS=180 \
//   OUT=evidence/2026-10-28/fixall-armor-band-before.json \
//   node scripts/measure-fixall-armor.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`MEASURE STOP: ${k}=1 required (pinned substrate).`); process.exit(2); }
}
if ('ARMORVILLAGE' in process.env) { console.error('MEASURE STOP: ARMORVILLAGE must be UNSET — this band measures the live condition, and the flag would bypass the enable being judged.'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('MEASURE STOP: SEATDRIVE=0 required.'); process.exit(2); }
const SEEDS = String(process.env.SEEDS || '').split(',').map(s => parseInt(s, 10)).filter(Number.isFinite);
if (!SEEDS.length) { console.error('MEASURE STOP: SEEDS required.'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT;
if (!OUT) { console.error('MEASURE STOP: OUT required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));

function anchorCommit() {
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); }
  catch (e) { return 'unknown'; }
}

function personOf(Game, vid) {
  try { if (Game.getPerson) return Game.getPerson(vid); } catch (e) {}
  const v = Game.state.village || {};
  return (v.rosterChars || {})[vid] || null;
}

function snapshotDay(Game) {
  const v = Game.state.village || {};
  const sid = Game.villagerId;
  let stash = {};
  try { stash = (Game.stashState ? Game.stashState().materials : (v.stash && v.stash.materials)) || {}; }
  catch (e) { stash = (v.stash && v.stash.materials) || {}; }
  const bark = stash.bark || 0, vine = stash.vine || 0, hide = stash.hide || 0;
  const branch = stash.branch || 0, wood = stash.wood || 0;
  let knowers = 0, barkWearers = 0, hideWearers = 0;
  for (const vid of (v.roster || [])) {
    if (vid === sid) continue;
    if ((v.away || {})[vid]) continue;
    const p = personOf(Game, vid);
    if (!p || p.dead) continue;
    const worn = new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
    if (worn.has('bark_armor')) { knowers++; barkWearers++; }
    if (worn.has('hide_armor')) { knowers++; hideWearers++; }
  }
  // Recipe-matched coincidence: the wearer type must match the complete recipe.
  const complete = (barkWearers > 0 && bark >= 3 && vine >= 2) || (hideWearers > 0 && hide >= 2 && vine >= 1);
  let trust = null;
  try { trust = Game.villageTrustLevel ? Game.villageTrustLevel() : null; } catch (e) {}
  return { day: (Game.state.scholar || {}).day || 0, bark, vine, hide, branch, wood, knowers, barkWearers, hideWearers, complete, trust };
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'armor-craft-inflow', fullTelemetry: false });
  const ch = { attempts: 0, crafts: 0, deaths: 0, events: [], deathCauses: {} };
  const sayLines = [];
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    const r = origTele.apply(this, arguments);
    try {
      if (type === 'armor_craft') {
        ch.attempts++;
        if (data && data.ok) ch.crafts++;
        if (ch.events.length < 20) ch.events.push({ ok: !!(data && data.ok), item: data && data.item, vid: data && data.vid });
      }
      if (type === 'death') { ch.deaths++; const c = (data && data.cause) || '?'; ch.deathCauses[c] = (ch.deathCauses[c] || 0) + 1; }
    } catch (e) {}
    return r;
  };
  const origSay = Game.say;
  Game.say = function (line) {
    try {
      const s = String(line || '');
      if (/by the stash|sewing|sewed|came apart/i.test(s) && sayLines.length < 100) sayLines.push(s.slice(0, 220));
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const days = [];
  const base = AV.armedFor(AD.normBase('leadfeast'));
  const wrapped = Object.assign({}, base, {
    daily(Gm, ctx) {
      const r = base.daily ? base.daily(Gm, ctx) : null;
      try { days.push(snapshotDay(Gm)); } catch (e) {}
      return r;
    },
  });
  await setupGame(Game);
  const result = await quietLog(async () => runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }));
  Game.tele = origTele;
  Game.say = origSay;
  const coincidenceDays = days.filter(d => d.complete).length;
  const knowersDays = days.filter(d => d.knowers > 0).length;
  const barkWearersDays = days.filter(d => d.barkWearers > 0).length;
  const hideWearersDays = days.filter(d => d.hideWearers > 0).length;
  const stashDays = {
    bark: days.filter(d => d.bark > 0).length,
    vine: days.filter(d => d.vine > 0).length,
    hide: days.filter(d => d.hide > 0).length,
    branch: days.filter(d => d.branch > 0).length,
    wood: days.filter(d => d.wood > 0).length,
  };
  // D1 final worn armor: roster villagers (not the scholar) wearing any
  // armor item at run end, by item id — the "actually geared" diagnostic.
  let finalWornArmor = {};
  try {
    const v = Game.state.village || {};
    const defs = Game.data.items || [];
    const isArmor = (id) => { const d = defs.find(x => x && x.id === id); return !!(d && d.armor); };
    for (const vid of (v.roster || [])) {
      if (vid === Game.villagerId) continue;
      const p = personOf(Game, vid);
      if (!p || p.dead) continue;
      for (const e of Object.values(p.equipped || {})) {
        const id = e && e.itemId;
        if (id && isArmor(id)) finalWornArmor[id] = (finalWornArmor[id] || 0) + 1;
      }
    }
  } catch (e) {}
  return {
    seed, daysObserved: days.length, survivalDays: (Game.state.scholar || {}).day || 0,
    endReason: (result && result.endReason) || null,
    attempts: ch.attempts, crafts: ch.crafts, deaths: ch.deaths,
    deathCauses: ch.deathCauses,
    coincidenceDays, knowersDays, barkWearersDays, hideWearersDays, stashDays,
    craftEvents: ch.events,
    saySample: sayLines.slice(0, 12),
    finalStash: days.length ? { bark: days[days.length - 1].bark, vine: days[days.length - 1].vine, hide: days[days.length - 1].hide } : null,
    finalWornArmor,
  };
}

(async () => {
  const perSeed = [];
  for (const seed of SEEDS) {
    console.log(`seed ${seed} ...`);
    const r = await oneRun(seed);
    console.log(`  seed ${seed}: attempts=${r.attempts} crafts=${r.crafts} coincidenceDays=${r.coincidenceDays} knowersDays=${r.knowersDays} survivalDays=${r.survivalDays} worn=${JSON.stringify(r.finalWornArmor)}`);
    perSeed.push(r);
  }
  const knowerSeeds = perSeed.filter(r => r.knowersDays > 0);
  const b2Pass = knowerSeeds.filter(r => r.coincidenceDays > 0 || r.attempts > 0);
  const deathCauses = {};
  for (const r of perSeed) for (const [c, n] of Object.entries(r.deathCauses || {})) deathCauses[c] = (deathCauses[c] || 0) + n;
  const finalWornArmor = {};
  for (const r of perSeed) for (const [id, n] of Object.entries(r.finalWornArmor || {})) finalWornArmor[id] = (finalWornArmor[id] || 0) + n;
  const summary = {
    seeds: SEEDS.length,
    seedsWithAttempts: perSeed.filter(r => r.attempts > 0).length,
    seedsWithCoincidence: perSeed.filter(r => r.coincidenceDays > 0).length,
    seedsWithCrafts: perSeed.filter(r => r.crafts >= 1).length,
    knowerSeeds: knowerSeeds.length,
    b2Numerator: b2Pass.length,
    totalAttempts: perSeed.reduce((t, r) => t + r.attempts, 0),
    totalCrafts: perSeed.reduce((t, r) => t + r.crafts, 0),
    totalCoincidenceDays: perSeed.reduce((t, r) => t + r.coincidenceDays, 0),
    totalDeaths: perSeed.reduce((t, r) => t + r.deaths, 0),
    deathCauses, finalWornArmor,
  };
  const out = {
    band: 'fixall-armor round 3 armor-craft conversion',
    prereg: 'evidence/2026-10-28/fixall-armor-prereg.md',
    anchorCommit: anchorCommit(),
    policy: 'leadfeast via AD.armedFor + AV.armedFor (AV inert without flag; effective stack leadfeast + armorydrive)',
    days: DAYS,
    env: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '(unset — live condition)' },
    summary, perSeed,
  };
  const outPath = path.isAbsolute(OUT) ? OUT : path.join(REPO, OUT);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  console.log('SUMMARY', JSON.stringify(summary));
  console.log('wrote', outPath);
})().catch(e => { console.error('MEASURE FAILED', e && e.stack || e); process.exit(1); });
