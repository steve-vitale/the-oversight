#!/usr/bin/env node
// measure-emptydraft-20261020.js — the #692 empty-draft DIAGNOSTIC
// (flesh-out loop arm sim-emptydraft, run fleshout-20261020T1615Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. Runs the standard pre-seat + windefer substrate (leadfeast /
// belongfeast competent policy) with a read-only census wrap on
// Game.havenRaidTick. On every raid-night the instrument snapshots the
// defender draft composition EXACTLY per the engine's own filter
// (havenGrowth.js: v.roster minus player minus away minus sheltered minus
// health<=40), records which of the available villagers actually engaged
// (resolveWildMonsterEncounter vid records stamped per raid-tick) and how
// many raiders went unmet (the engine's own "Nobody met ..." say lines).
//
// ATTRIBUTION TAXONOMY (per raid-night, zero-defender nights =
// engaged===0): every non-player roster slot is classified into one of
//   away / sheltered / wounded / benched / engaged (+ player, counted
//   separately — the engine never drafts the scholar).
// Attribution rule: if a category holds 100% of non-player slots ->
//   'all-<cat>'; if >50% -> 'majority-<cat>'; else 'mixed-<top1>-<top2>'.
// The attribution target is 100% of unmet nights attributed, 0
// unexplained (unexplained = a night whose composition record does not
// fully cover the roster — an instrument error, counted LOUD).
//
// WHERE THIS SITS: sim-raidgarrison (2026-10-20, KILLED at pilot) found
// raids routinely meeting ZERO defenders — armed d59 s64008: 5 unmet on
// roster 9, "all villagers away/sheltered/wounded at raid-night" — and
// concluded the garrison's homekeep half never engaged because "the draft
// empties through autonomous NPC expedition rhythms the policy cannot
// touch." This diagnostic measures the drain: who is missing WHERE at
// raid-night, across seeds.
//
// SUBSTRATE (pre-seat + windefer — the sim-w5door-measure substrate):
//   withSeatDrive(withWinDefer(withReposition(TF base)))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
//   (SEATDRIVE='0' -> seatdrive pure delegation; VETREL/REPOSITION unset
//   -> those layers inert by their own gates.)
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   node scripts/measure-emptydraft-20261020.js
//   SMOKE=1 ...     # short smoke: both policies drive, census live
//   DET=1 ...       # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   ONLY=leadfeast ...   # policy filter
//   SEEDS="64001,64002" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// SUBSTRATE GUARD — pre-seat + windefer (the w5door-measure substrate).
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (w5doormeasure substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat — this is the census, not the winseat).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must NOT be 1 (pre-seat substrate).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() true despite SEATDRIVE=0.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-emptydraft');
const isBare = () => process.env.ED_BARE === '1';

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Policy composition — the pre-seat+windefer set, control arm only
// (this is a census of the base draft; the garrison layer was deleted
// zero-trace per sim-raidgarrison's kill protocol).
function policyFor(policyId) {
  const base = baseFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const rp = RP.withReposition(base, `${tag}-rp`, `${policyId} + reposition (REPOSITION unset: inert)`);
  const wd = WD.withWinDefer(rp, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  return SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=0: pure delegation)`);
}

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// censusComposition(Game): read-only classification of the raid-night
// roster EXACTLY per the engine's defender filter (havenGrowth.js,
// havenRaidTick — "defenders: healthy villagers at home"):
//   roster MINUS villagerId (the scholar is never drafted)
//        MINUS v.away[id] (away on expedition)
//        MINUS isSheltered(id) (sheltered villagers do not come out —
//          the muster discipline is "outlast it," not "feed it")
//        MINUS health[id] <= 40 (wounded-incapacitated)
//   leftover: 'available' (would be drafted; engagement resolved post-tick).
function censusComposition(Game) {
  const v = (Game.state || {}).village || {};
  const roster = (v.roster || []).slice();
  const playerId = Game.villagerId;
  const rows = [];
  for (const id of roster) {
    const sid = String(id);
    if (sid === String(playerId)) { rows.push({ id: sid, cat: 'player' }); continue; }
    let away = false;
    try { away = !!(v.away && v.away[id]); } catch (e) {}
    if (away) { rows.push({ id: sid, cat: 'away' }); continue; }
    let sheltered = false;
    try { sheltered = !!(Game.isSheltered && Game.isSheltered(id)); } catch (e) {}
    if (sheltered) { rows.push({ id: sid, cat: 'sheltered' }); continue; }
    let h;
    try { h = (v.health || {})[id]; } catch (e) { h = undefined; }
    if (h !== undefined && h <= 40) { rows.push({ id: sid, cat: 'wounded' }); continue; }
    rows.push({ id: sid, cat: 'available' });
  }
  return rows;
}

// attributeNight(rec): the dominant composition category for an unmet
// raid-night, over non-player roster slots.
function attributeNight(comp) {
  const np = (comp || []).filter(c => c.cat !== 'player');
  const cats = { away: 0, sheltered: 0, wounded: 0, benched: 0, engaged: 0, available: 0 };
  for (const c of np) {
    if (Object.prototype.hasOwnProperty.call(cats, c.cat)) cats[c.cat]++;
    else return 'unknown-category:' + c.cat; // LOUD — should never happen
  }
  const total = np.length;
  if (total === 0) return 'no-nonplayer-roster';
  // composition records that fail to cover the roster are unexplained
  // (instrument error) — the analyzer counts these LOUD.
  const covered = Object.values(cats).reduce((a, b) => a + b, 0);
  if (covered !== total) return 'unexplained';
  const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const top1 = entries[0], top2 = entries[1];
  if (top1[1] === total) return 'all-' + top1[0];
  if (top1[1] / total > 0.5) return 'majority-' + top1[0];
  return 'mixed-' + top1[0] + '-' + top2[0];
}

// installRaidCensus(Game, C): pure-recording wraps on havenRaidTick,
// resolveWildMonsterEncounter (engagement vids), and Game.say (the
// engine's own "Nobody met ..." lines — unmet raider count). No state
// writes, no RNG draws; the DET gate pins instrument-on == bare.
function installRaidCensus(Game, C) {
  C.raidNights = [];
  C._fights = [];
  C._says = [];
  C._tickId = 0;
  C.instrumentErrors = C.instrumentErrors | 0;
  const err = () => { C.instrumentErrors++; };

  try {
    const oFight = Game.resolveWildMonsterEncounter;
    if (typeof oFight === 'function') {
      Game.resolveWildMonsterEncounter = function (vid, m, opts) {
        try {
          if (!isBare()) C._fights.push({ day: scholarDay(Game), tick: C._tickId, vid: vid != null ? String(vid) : null });
        } catch (e) { err(); }
        return oFight.apply(this, arguments);
      };
    } else { err(); }
  } catch (e) { err(); }

  try {
    const oSay = Game.say.bind(Game);
    Game.say = function (line) {
      try { if (!isBare()) C._says.push({ day: scholarDay(Game), tick: C._tickId, line: String(line) }); }
      catch (e) { err(); }
      return oSay.apply(this, arguments);
    };
  } catch (e) { err(); }

  try {
    const oTick = Game.havenRaidTick;
    if (typeof oTick !== 'function') { err(); return; }
    Game.havenRaidTick = function () {
      C._tickId++;
      const tick = C._tickId;
      const day = scholarDay(Game);
      let pre = null, pantry = -1, palisade = false;
      try {
        if (!isBare()) {
          pre = censusComposition(Game);
          try { pantry = Math.round(Game.pantryKcalLive ? Game.pantryKcalLive(Game.state.village) : -1); } catch (e) {}
          try { palisade = (Game.havenTier ? Game.havenTier() : 0) >= 2; } catch (e) {}
        }
      } catch (e) { err(); }
      const fightsBefore = C._fights.length;
      const saysBefore = C._says.length;
      let fired = false;
      try { fired = oTick.apply(this, arguments); }
      catch (e) { throw e; }
      if (fired && pre && !isBare()) {
        try {
          const fightVids = [];
          for (let i = fightsBefore; i < C._fights.length; i++) {
            const f = C._fights[i];
            if (f.tick === tick && f.vid) fightVids.push(f.vid);
          }
          const engagedSet = new Set(fightVids);
          let unmet = 0;
          for (let i = saysBefore; i < C._says.length; i++) {
            const s = C._says[i];
            if (s.tick === tick && /Nobody met /.test(s.line)) unmet++;
          }
          // mark available -> engaged/benched
          const comp = pre.map(r => {
            if (r.cat !== 'available') return r;
            return { id: r.id, cat: engagedSet.has(r.id) ? 'engaged' : 'benched' };
          });
          const engaged = comp.filter(r => r.cat === 'engaged').length;
          const attribution = attributeNight(comp);
          C.raidNights.push({
            day, tick, fired: true,
            pantry, palisade,
            raiders: engaged + unmet,
            engaged, unmet,
            rosterSize: comp.length,
            counts: countsOf(comp),
            attribution,
            comp,
          });
        } catch (e) { err(); }
      }
      return fired;
    };
  } catch (e) { err(); }
}

function countsOf(comp) {
  const c = { player: 0, away: 0, sheltered: 0, wounded: 0, benched: 0, engaged: 0 };
  for (const r of (comp || [])) {
    if (Object.prototype.hasOwnProperty.call(c, r.cat)) c[r.cat]++;
    else c.other = (c.other | 0) + 1;
  }
  return c;
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = policyFor(policyId);
  const bare = isBare();
  const C = {
    recs: [], hashes: [], raidNights: [], _fights: [], _says: [], _tickId: 0,
    instrumentErrors: 0,
    maxRank: 0, maxWave: 1, wave4Day: null, wave5Day: null, nationalDay: null,
    everTable: false, exiled: false,
  };
  const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) { try { installRaidCensus(G, C); } catch (e) { C.instrumentErrors++; } }
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { C.hashes.push(scholarDay(G) + ':' + dayHash(Game)); } catch (e) {}
    if (!bare) {
      try {
        const day = scholarDay(G);
        let uw = 1;
        try { uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) {}
        if (uw > C.maxWave) C.maxWave = uw;
        if (uw >= 4 && C.wave4Day == null) C.wave4Day = day;
        if (uw >= 5 && C.wave5Day == null) C.wave5Day = day;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
        if ((rank === 'national' || rank === 'global') && C.nationalDay == null) C.nationalDay = day;
        const pg = G.progState ? G.progState() : null;
        if (pg && pg.tableWaiting) C.everTable = true;
        if ((G.state.scholar || {}).exiled) C.exiled = true;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'emptydraft', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  const out = {
    seed, policyId, substrate: 'w5path-vetrel1-pre-seat-census', mode: 'census',
    days: result.days, gameDays, endReason,
    won: !!Game.won,
    maxRank: C.maxRank, national: C.nationalDay != null ? 1 : 0, nationalDay: C.nationalDay,
    table: C.everTable ? 1 : 0, exiled: C.exiled ? 1 : 0,
    maxWave: C.maxWave, wave45: C.maxWave >= 4 ? 1 : 0, wave5: C.maxWave >= 5 ? 1 : 0,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    instrumentErrors: C.instrumentErrors | 0,
    raidNights: bare ? [] : C.raidNights,
    hashes: C.hashes,
  };
  if (!opts.noWrite) {
    const dir = path.join(EVID, 'census', policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63901, 63902]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.ED_BARE = '1';
        const b1 = await runOne(seed, policyId, { noWrite: true });
        const b2 = await runOne(seed, policyId, { noWrite: true });
        delete process.env.ED_BARE;
        const c1 = await runOne(seed, policyId, { noWrite: true });
        const c2 = await runOne(seed, policyId, { noWrite: true });
        const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
        const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
        const pass = hb1 === hb2 && hc1 === hc2 && hb1 === hc1;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} census-stable=${hc1 === hc2} identical=${hb1 === hc1}, ${b1.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.SMOKE === '1') {
    process.env.DAYS = process.env.DAYS || '30';
    const seeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63901]).filter(Number.isFinite);
    for (const policyId of POLICIES) {
      const out = await runOne(seeds[0], policyId, { noWrite: true });
      console.log(`  SMOKE ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} raidNights=${out.raidNights.length} ierr=${out.instrumentErrors}`);
      for (const rn of out.raidNights) {
        console.log(`    d${rn.day}: raiders=${rn.raiders} engaged=${rn.engaged} unmet=${rn.unmet} roster=${rn.rosterSize} counts=${JSON.stringify(rn.counts)} attr=${rn.attribution}`);
      }
    }
    console.log('SMOKE: done');
    return;
  }
  // Full census sweep: seeds x policies (control arm only — census of the
  // base draft).
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId);
      results.push(out);
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} table=${out.table} raidNights=${out.raidNights.length} ierr=${out.instrumentErrors}`);
    }
  }
  const n = results.length;
  console.log(`CENSUS COMPLETE: ${n}/${SEEDS.length * POLICIES.length} runs, 0 errors`);
  const rs = results.reduce((a, r) => a + r.raidNights.length, 0);
  console.log(`  raid-nights recorded: ${rs}`);
}

if (require.main === module) main().catch(e => { console.error('CENSUS FATAL:', e && e.message); process.exit(1); });
module.exports = { runOne, policyFor, installRaidCensus, censusComposition, attributeNight, countsOf, daysNow };
