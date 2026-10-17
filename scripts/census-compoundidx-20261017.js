#!/usr/bin/env node
// census-compoundidx-20261017.js — READ-ONLY census instrument for the
// hostile-region compound index (sim-compoundidx, scale-onramp axis,
// findings #459/#460, evidence/2026-10-17/sim-hardseed.md).
//
// ZERO src/js changes, ZERO policy changes, ZERO behavior change: this
// script only READS game state (plus the same read-only wrappers the
// sim-hardseed instrument used: registerDeath, say, named raid/tribute
// verbs). Across village-lost runs on the courtship road it computes per
// run: hostile splinter count, raid-kcal hemorrhage, forage-competition
// beats, tribute-kcal/week trajectory, wave-3/contest death share,
// pantry-death-spiral rate — and classifies which of the five compound
// parts are present.
//
// The five parts (sim-hardseed's named compound):
//   1. forage  — forage-ground competition (commons rumorStage >= 1)
//   2. raid    — raid-kcal hemorrhage (>= 2000 kcal extracted)
//   3. tribute — grief-leveraged tribute (grief grab fired AND terms >= 6000/wk)
//   4. meatgrinder — wave-3/contest death share (>= 2 combat deaths at/after
//      wave-3 release, >= 50% of villager deaths)
//   5. spiral  — pantry death spiral (peak >= 20k kcal, < 2k within <= 10 days)
//
// Substrate (asserted up front):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 (explicit — base courtship)
//   ALLOWGATE2 unset.
// Corpus: fresh seeds x {leadfeast, belongfeast}, 180d death-aware.
// Pre-registration (evidence/2026-10-17/sim-compoundidx.md):
//   PRIMARY = share of village-lost runs with >= 3 compound parts present.
//   GO (compound systematic) iff >= 8/16; else "seed-sporadic".
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     node scripts/census-compoundidx-20261017.js
// Output: evidence/2026-10-17/perseed-compoundidx/compound-<policy>-s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
    if (process.env[k] !== '1') { console.error(`COMPOUNDIDX STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') {
    console.error('COMPOUNDIDX STOP: SEATDRIVE=0 is required — base courtship, no seat driver.'); process.exit(2);
  }
  if (process.env.ALLOWGATE2 === '1') {
    console.error('COMPOUNDIDX STOP: ALLOWGATE2=1 is set — substrate moved; STOP.'); process.exit(2);
  }
}

// Pre-registered classification thresholds (evidence header binds these).
const THRESHOLDS = {
  raidKcal: 2000,          // raid hemorrhage: kcal extracted from Haven's pantry
  tributeTerms: 6000,      // grief-leveraged terms: courtship base 4000 x 1.5 grab
  meatgrinderShare: 0.5,   // wave-3/contest death share of villager deaths
  meatgrinderMinDeaths: 2,  // a single combat death is not a meatgrinder
  spiralPeak: 20000,       // death spiral needs a real pantry to collapse from
  spiralDays: 10,          // peak -> <2k within 10 days (hardseed: ~8d)
  compoundParts: 3,        // >= 3 of 5 parts = the compound is present
};

// classifyParts(rec): pure classifier over the instrument's per-run record.
// rec fields (all optional — missing means absent):
//   forageMaxStage, raidKcal, griefGrabs, tributeMaxTerms,
//   wave3Day, villagerDeaths, meatgrinderDeaths, meatgrinderShare,
//   pantryPeak, spiralDays
function classifyParts(rec) {
  const r = rec || {};
  const parts = {
    forage: (r.forageMaxStage | 0) >= 1,
    raid: (r.raidKcal | 0) >= THRESHOLDS.raidKcal,
    tribute: (r.griefGrabs | 0) >= 1 && (r.tributeMaxTerms | 0) >= THRESHOLDS.tributeTerms,
    meatgrinder: r.wave3Day != null &&
      (r.meatgrinderDeaths | 0) >= THRESHOLDS.meatgrinderMinDeaths &&
      (+r.meatgrinderShare || 0) >= THRESHOLDS.meatgrinderShare,
    spiral: (r.pantryPeak | 0) >= THRESHOLDS.spiralPeak &&
      r.spiralDays != null && r.spiralDays <= THRESHOLDS.spiralDays,
  };
  const partCount = Object.values(parts).filter(Boolean).length;
  return { parts, partCount, compound: partCount >= THRESHOLDS.compoundParts };
}

const SEEDS = [2271117, 2381213, 2491319, 2601421, 2711513, 2821609, 2931717, 3041813,
               3151919, 3262027, 3372119, 3482213, 3592319, 3702413, 3812519, 3922613];
const EXTRA_SEEDS = [4032717, 4142813, 4252919, 4363027, 4473119, 4583213, 4693319, 4803413,
                     4913519, 5023627, 5133719, 5243813, 5353919, 5464027, 5574119, 5684213];
const POLICIES = ['leadfeast', 'belongfeast'];
const TREE = path.join(__dirname, '..');
const OUTDIR = path.join(TREE, 'evidence', '2026-10-17', 'perseed-compoundidx');

function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
}
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function pantryKcal(Game) {
  try {
    return Math.round((Game.state.village.pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
  } catch (e) { return 0; }
}
const stripTags = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');

// Fresh-seed collision assertion (the winconfirm3 discipline): none of this
// run's seed literals may already appear in evidence/ filenames.
function existingSeedLiterals() {
  const out = new Set();
  const walk = (dir) => {
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else { const m = /-s(\d+)\.json$/.exec(e.name); if (m) out.add(m[1]); }
    }
  };
  walk(path.join(TREE, 'evidence'));
  return out;
}

// attachInstrument(Game, t): read-only wrappers. Mirrors the sim-hardseed
// instrument's wrapper pattern; nothing here mutates game state.
function attachInstrument(Game, t) {
  t.deaths = []; t.raidEvents = []; t.gardenRaids = 0; t.tributePays = []; t.beats = [];

  // --- registerDeath: named death log ---
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 600) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 80),
          });
        }
      } catch (e) {}
      return r;
    };
  }

  // --- say: raid say-lines carry exact kcal; plus a small beat buffer ---
  const BEAT_RE = /died|dead|starv|wave [345]|national|regional|schism|split|cannibal|hardliner|bloodied|red table/i;
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const pushSay = (text) => {
    try {
      const s = stripTags((text && (text.text || text.msg || text.message)) || text || '').slice(0, 300);
      let m;
      if ((m = /carried off ~([\d,]+) kcal from the pantry/.exec(s))) {
        const nm = (/Raid — (.+?) came in the night/.exec(s) || [])[1] || '?';
        t.raidEvents.push({ day: gday(Game), channel: 'commons', name: nm.slice(0, 40), kcal: parseInt(m[1].replace(/,/g, ''), 10) });
      }
      if ((m = /trampled (\d+) garden plots into mud/.exec(s))) {
        t.gardenRaids += parseInt(m[1], 10);
      }
      if ((m = /of (.+?) didn't wait — they hit the stores and melted back into the dark with ([\d,]+) kcal/.exec(s))) {
        t.raidEvents.push({ day: gday(Game), channel: 'treeline', name: m[1].slice(0, 40), kcal: parseInt(m[2].replace(/,/g, ''), 10) });
      }
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s.slice(0, 200) });
        if (t.beats.length > 400) t.beats.splice(0, 50);
      }
    } catch (e) {}
  };
  Game.say = function (msg) { pushSay(msg); return origSay ? origSay(msg) : msg; };

  // --- commonsRaid: exact pantry delta around the call ---
  const origCR = Game.commonsRaid ? Game.commonsRaid.bind(Game) : null;
  if (origCR) {
    Game.commonsRaid = function (ov) {
      const before = pantryKcal(Game);
      const r = origCR(ov);
      try {
        const after = pantryKcal(Game);
        const delta = before - after;
        if (delta > 0) {
          const ev = t.raidEvents[t.raidEvents.length - 1];
          if (ev && ev.channel === 'commons' && ev.day === gday(Game)) ev.kcalExact = delta;
          else t.raidEvents.push({ day: gday(Game), channel: 'commons', name: String((ov && ov.name) || '?').slice(0, 40), kcal: delta });
        }
      } catch (e) {}
      return r;
    };
  }

  // --- answerRaidDefense: the policy answers nothing in this census, but the
  // wrapper is cheap insurance and attributes any pantry movement ---
  const origARD = Game.answerRaidDefense ? Game.answerRaidDefense.bind(Game) : null;
  if (origARD) {
    Game.answerRaidDefense = function (how) {
      const vid = String((Game.state.pendingRaidDefense || {}).villageId || '?');
      const before = pantryKcal(Game);
      const r = origARD(how);
      try {
        const delta = before - pantryKcal(Game);
        t.raidEvents.push({ day: gday(Game), channel: 'defense-' + how, vid: vid.slice(0, 24), kcal: Math.max(0, delta), outcome: String(r).slice(0, 20) });
      } catch (e) {}
      return r;
    };
  }

  // --- payTribute: tribute outflow per link ---
  const origPT = Game.payTribute ? Game.payTribute.bind(Game) : null;
  if (origPT) {
    Game.payTribute = function (linkId, kcal) {
      const r = origPT(linkId, kcal);
      try {
        t.tributePays.push({ day: gday(Game), linkId: String(linkId).slice(0, 24), paid: r | 0 });
      } catch (e) {}
      return r;
    };
  }
}

// snapDay(Game, t): per-day state scan (read-only).
function snapDay(Game, t) {
  const day = gday(Game);
  t.pantrySeries.push({ day, kcal: pantryKcal(Game) });
  try {
    const ovs = Game.state.otherVillages || [];
    for (const v of ovs) {
      if (!v) continue;
      if (v.isSplinter && (v.splinterCause === 'hardline' || v.splinterCause === 'cannibal')) {
        t.splinterEver.add(v.id || v.name);
      }
      const st = (v.commons && v.commons.rumorStage) | 0;
      if (st > t.forageMaxStage) { t.forageMaxStage = st; t.forageMaxDay = day; }
    }
  } catch (e) {}
  try {
    const links = (typeof Game.hierarchyState === 'function' ? Game.hierarchyState() : []) || [];
    let gg = 0;
    for (const l of links) {
      if (!l) continue;
      const terms = l.tributeKcalPerWeek | 0;
      if (terms > t.tributeMaxTerms) { t.tributeMaxTerms = terms; t.tributeMaxDay = day; }
      gg += (l.griefGrabs | 0);
    }
    if (gg > t.griefGrabs) { t.griefGrabs = gg; t.griefGrabsDay = day; }
    t.linkCountMax = Math.max(t.linkCountMax, links.length);
  } catch (e) {}
  try {
    if (t.wave3Day == null && typeof Game.unlockedWave === 'function' && Game.unlockedWave() >= 3) {
      t.wave3Day = day;
    }
  } catch (e) {}
}

async function oneRun(seed, policyId) {
  process.env.SEATDRIVE = '0'; // explicit, every run
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `compoundidx-${policyId}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const t = {
    pantrySeries: [], splinterEver: new Set(), forageMaxStage: 0, forageMaxDay: null,
    tributeMaxTerms: 0, tributeMaxDay: null, griefGrabs: 0, griefGrabsDay: null,
    linkCountMax: 0, wave3Day: null, hashes: [],
  };
  attachInstrument(Game, t);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { snapDay(G, t); } catch (e) {}
    try { t.hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: seat=${seatLive} (need false) defer=${deferLive} (need true)`);

  // --- reduce the instrument record ---
  const raidKcal = t.raidEvents.reduce((a, e) => a + (e.kcalExact != null ? e.kcalExact : (e.kcal | 0)), 0);
  const isVillager = (d) => d.kind === 'person' || d.kind === 'villager';
  const villagerDeaths = t.deaths.filter(isVillager);
  const COMBAT = { 'combat': 1, 'villager combat': 1, 'patrol combat': 1, 'raid-defense': 1 };
  const meatgrinderDeaths = t.wave3Day == null ? 0 :
    villagerDeaths.filter(d => COMBAT[d.cause] && d.day >= t.wave3Day).length;
  const meatgrinderShare = villagerDeaths.length ? meatgrinderDeaths / villagerDeaths.length : 0;

  // pantry death spiral: peak -> first sub-2000 day
  let pantryPeak = 0, peakDay = null;
  for (const s of t.pantrySeries) if (s.kcal > pantryPeak) { pantryPeak = s.kcal; peakDay = s.day; }
  let spiralDays = null;
  if (peakDay != null) {
    for (const s of t.pantrySeries) {
      if (s.day >= peakDay && s.kcal < 2000) { spiralDays = s.day - peakDay; break; }
    }
  }
  const tributePaidTotal = t.tributePays.reduce((a, p) => a + (p.paid | 0), 0);

  const rec = {
    seed, policyId,
    endReason: result.endReason, gameDays: result.gameDays,
    hostileSplinterEver: t.splinterEver.size, hostileSplinterNames: Array.from(t.splinterEver).slice(0, 12),
    forageMaxStage: t.forageMaxStage, forageMaxDay: t.forageMaxDay,
    raidKcal, raidEvents: t.raidEvents, gardenRaids: t.gardenRaids,
    tributeMaxTerms: t.tributeMaxTerms, tributeMaxDay: t.tributeMaxDay,
    griefGrabs: t.griefGrabs, griefGrabsDay: t.griefGrabsDay,
    tributePaidTotal, tributePayCount: t.tributePays.length, linkCountMax: t.linkCountMax,
    wave3Day: t.wave3Day,
    villagerDeaths: villagerDeaths.length, meatgrinderDeaths, meatgrinderShare: +meatgrinderShare.toFixed(3),
    pantryPeak, spiralDays,
    deathLog: t.deaths,
    hashes: t.hashes,
    beats: t.beats.slice(-120),
    seatLive, deferLive,
  };
  rec.classification = classifyParts({
    forageMaxStage: rec.forageMaxStage, raidKcal: rec.raidKcal,
    griefGrabs: rec.griefGrabs, tributeMaxTerms: rec.tributeMaxTerms,
    wave3Day: rec.wave3Day, villagerDeaths: rec.villagerDeaths,
    meatgrinderDeaths: rec.meatgrinderDeaths, meatgrinderShare: rec.meatgrinderShare,
    pantryPeak: rec.pantryPeak, spiralDays: rec.spiralDays,
  });
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, `compound-${policyId}-s${seed}.json`), JSON.stringify(rec, null, 1));
  const c = rec.classification;
  const on = Object.entries(c.parts).filter(([, v]) => v).map(([k]) => k).join(',');
  console.log(`  [${policyId} s${seed}] end=${rec.endReason} days=${rec.gameDays} ` +
    `spl=${rec.hostileSplinterEver} forage=${rec.forageMaxStage} raid=${rec.raidKcal} ` +
    `trib=${rec.tributeMaxTerms}(g${rec.griefGrabs}) wave3=${rec.wave3Day} mgrind=${rec.meatgrinderDeaths}/${rec.villagerDeaths} ` +
    `peak=${rec.pantryPeak} spiral=${rec.spiralDays}d parts=${c.partCount}[${on}]`);
  return rec;
}

async function main() {
  assertSubstrate();
  const pre = existingSeedLiterals();
  const allSeeds = SEEDS.concat(EXTRA_SEEDS);
  const collisions = allSeeds.filter(s => pre.has(String(s)));
  if (collisions.length) {
    console.error('COMPOUNDIDX STOP: seed literals already exist in evidence/ filenames: ' +
      collisions.map(s => `s${s}`).join(', ') + ' — seeds are not fresh. STOP.');
    process.exit(2);
  }
  console.log(`seed collision check: ${allSeeds.length} seeds clean.`);
  console.log(`substrate: ${require('child_process').execSync('git rev-parse --short HEAD', { cwd: TREE }).toString().trim()}`);

  // Extension rule (pre-registered): run 4-seed blocks until >= 16
  // village-lost runs, cap 40 runs total.
  const recs = [];
  let seedIdx = 0, lost = 0;
  while (seedIdx < SEEDS.length || (lost < 16 && recs.length < 40 && seedIdx < allSeeds.length)) {
    const seed = allSeeds[seedIdx++];
    for (const policyId of POLICIES) {
      const rec = await oneRun(seed, policyId);
      recs.push(rec);
      if (rec.endReason === 'village-lost') lost++;
    }
  }
  const lostRecs = recs.filter(r => r.endReason === 'village-lost');
  const compound = lostRecs.filter(r => r.classification.compound).length;
  const summary = {
    seeds: allSeeds.slice(0, seedIdx), runs: recs.length,
    villageLost: lostRecs.length,
    compound, primary: lostRecs.length ? +(compound / lostRecs.length).toFixed(3) : 0,
    verdict: lostRecs.length >= 16 && (compound / lostRecs.length) >= 0.5 ? 'DIAGNOSTIC-GO' : 'DIAGNOSTIC-MISS',
    thresholds: THRESHOLDS,
  };
  fs.writeFileSync(path.join(OUTDIR, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log('\n== compoundidx summary ==');
  console.log(`runs=${summary.runs} village-lost=${summary.villageLost} compound=${compound} ` +
    `primary=${summary.primary} verdict=${summary.verdict}`);
  const perPart = {};
  for (const r of lostRecs) for (const [k, v] of Object.entries(r.classification.parts)) {
    perPart[k] = perPart[k] || { on: 0, n: 0 };
    perPart[k].n++; if (v) perPart[k].on++;
  }
  for (const [k, v] of Object.entries(perPart)) console.log(`  part ${k}: ${v.on}/${v.n}`);
}

if (require.main === module) {
  main().catch(e => { console.error('CENSUS CRASH:', e); process.exit(2); });
}

module.exports = { classifyParts, THRESHOLDS, oneRun };
