#!/usr/bin/env node
// measure-build-armor.js — build-armor seeding band (adopts fixall-armor).
// Port of scripts/measure-fixall-armor.js with seeding instrumentation added:
// a setup snapshot (wearers at village creation, by staying/escape goal, and
// the armorSeedVid flag), staying-knower days, and first attempt/craft/
// knower days. Everything else — substrate, policy, horizon, snapshot
// definitions — is identical to the fixall round-3 instrument, so the
// fixall confirm band (67701-67712) is directly comparable.
//
// Usage (pinned substrate, exactly as pre-registered):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 \
//   SEEDS=67801,67802,... DAYS=180 \
//   OUT=evidence/2026-10-29/build-armor-band-confirm.json \
//   node scripts/measure-build-armor.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`MEASURE STOP: ${k}=1 required (pinned substrate).`); process.exit(2); }
}
if ('ARMORVILLAGE' in process.env) { console.error('MEASURE STOP: ARMORVILLAGE must be UNSET — this band measures the live condition.'); process.exit(2); }
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
  let knowers = 0, barkWearers = 0, hideWearers = 0, stayingKnowers = 0;
  for (const vid of (v.roster || [])) {
    if (vid === sid) continue;
    if ((v.away || {})[vid]) continue;
    const p = personOf(Game, vid);
    if (!p || p.dead) continue;
    const worn = new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
    let isKnower = false;
    if (worn.has('bark_armor')) { knowers++; barkWearers++; isKnower = true; }
    if (worn.has('hide_armor')) { knowers++; hideWearers++; isKnower = true; }
    if (isKnower) {
      let goal = null;
      try { goal = Game.npcGoal ? Game.npcGoal(vid) : null; } catch (e) {}
      if (goal !== 'escape') stayingKnowers++;
    }
  }
  const complete = (barkWearers > 0 && bark >= 3 && vine >= 2) || (hideWearers > 0 && hide >= 2 && vine >= 1);
  let trust = null;
  try { trust = Game.villageTrustLevel ? Game.villageTrustLevel() : null; } catch (e) {}
  return { day: (Game.state.scholar || {}).day || 0, bark, vine, hide, branch, wood, knowers, barkWearers, hideWearers, stayingKnowers, complete, trust };
}

function setupSnapshot(Game) {
  const v = Game.state.village || {};
  const sid = Game.villagerId;
  const wearers = [];
  for (const vid of (v.roster || [])) {
    if (vid === sid) continue;
    const p = personOf(Game, vid);
    if (!p || p.dead) continue;
    const worn = new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
    let goal = null;
    try { goal = Game.npcGoal ? Game.npcGoal(vid) : null; } catch (e) {}
    if (worn.has('bark_armor')) wearers.push({ vid, item: 'bark_armor', goal, away: !!((v.away || {})[vid]) });
    if (worn.has('hide_armor')) wearers.push({ vid, item: 'hide_armor', goal, away: !!((v.away || {})[vid]) });
  }
  return { armorSeedVid: v.armorSeedVid || null, wearers,
    stayingWearers: wearers.filter(w => w.goal !== 'escape').length };
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'armor-craft-inflow', fullTelemetry: false });
  const ch = { attempts: 0, crafts: 0, deaths: 0, events: [], deathCauses: {}, firstAttemptDay: null, firstCraftDay: null };
  const sayLines = [];
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    const r = origTele.apply(this, arguments);
    try {
      if (type === 'armor_craft') {
        const day = (Game.state.scholar || {}).day || 0;
        ch.attempts++;
        if (ch.firstAttemptDay === null) ch.firstAttemptDay = day;
        if (data && data.ok) { ch.crafts++; if (ch.firstCraftDay === null) ch.firstCraftDay = day; }
        if (ch.events.length < 20) ch.events.push({ day, ok: !!(data && data.ok), item: data && data.item, vid: data && data.vid });
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
  let setup = null;
  try { setup = setupSnapshot(Game); } catch (e) { setup = { error: String(e && e.message || e) }; }
  const result = await quietLog(async () => runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }));
  Game.tele = origTele;
  Game.say = origSay;
  const coincidenceDays = days.filter(d => d.complete).length;
  const knowersDays = days.filter(d => d.knowers > 0).length;
  const stayingKnowersDays = days.filter(d => d.stayingKnowers > 0).length;
  const firstKnowerDay = (() => { const d = days.find(x => x.knowers > 0); return d ? d.day : null; })();
  const barkWearersDays = days.filter(d => d.barkWearers > 0).length;
  const hideWearersDays = days.filter(d => d.hideWearers > 0).length;
  const stashDays = {
    bark: days.filter(d => d.bark > 0).length,
    vine: days.filter(d => d.vine > 0).length,
    hide: days.filter(d => d.hide > 0).length,
    branch: days.filter(d => d.branch > 0).length,
    wood: days.filter(d => d.wood > 0).length,
  };
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
    coincidenceDays, knowersDays, stayingKnowersDays, firstKnowerDay,
    firstAttemptDay: ch.firstAttemptDay, firstCraftDay: ch.firstCraftDay,
    barkWearersDays, hideWearersDays, stashDays,
    craftEvents: ch.events,
    saySample: sayLines.slice(0, 12),
    finalStash: days.length ? { bark: days[days.length - 1].bark, vine: days[days.length - 1].vine, hide: days[days.length - 1].hide } : null,
    finalWornArmor, setup,
  };
}

(async () => {
  const perSeed = [];
  for (const seed of SEEDS) {
    console.log(`seed ${seed} ...`);
    const r = await oneRun(seed);
    console.log(`  seed ${seed}: attempts=${r.attempts} crafts=${r.crafts} knowersDays=${r.knowersDays} stayingKnowersDays=${r.stayingKnowersDays} survivalDays=${r.survivalDays} worn=${JSON.stringify(r.finalWornArmor)} setupFlag=${r.setup && r.setup.armorSeedVid}`);
    perSeed.push(r);
  }
  const deathCauses = {};
  for (const r of perSeed) for (const [c, n] of Object.entries(r.deathCauses || {})) deathCauses[c] = (deathCauses[c] || 0) + n;
  const finalWornArmor = {};
  for (const r of perSeed) for (const [id, n] of Object.entries(r.finalWornArmor || {})) finalWornArmor[id] = (finalWornArmor[id] || 0) + n;
  const totalSurvivalDays = perSeed.reduce((t, r) => t + (r.survivalDays || 0), 0);
  const starvationDeaths = perSeed.reduce((t, r) => t + ((r.deathCauses || {}).starvation || 0), 0);
  const summary = {
    seeds: SEEDS.length,
    seedsWithAttempts: perSeed.filter(r => r.attempts > 0).length,
    seedsWithCrafts: perSeed.filter(r => r.crafts >= 1).length,
    seedsWithHomeKnower: perSeed.filter(r => r.knowersDays > 0 || r.attempts > 0).length,
    seedsWithStayingKnower: perSeed.filter(r => r.stayingKnowersDays > 0 || r.attempts > 0).length,
    seedsGranted: perSeed.filter(r => r.setup && r.setup.armorSeedVid).length,
    totalAttempts: perSeed.reduce((t, r) => t + r.attempts, 0),
    totalCrafts: perSeed.reduce((t, r) => t + r.crafts, 0),
    totalDeaths: perSeed.reduce((t, r) => t + r.deaths, 0),
    totalSurvivalDays,
    starvationDeaths,
    survivedTo180: perSeed.filter(r => (r.survivalDays || 0) >= 180).length,
    deathCauses, finalWornArmor,
  };
  const out = {
    band: 'build-armor seeding',
    prereg: 'evidence/2026-10-29/build-armor-prereg.md',
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
