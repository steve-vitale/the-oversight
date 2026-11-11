// siegefirst-analyze-20261111.js — siege first-numbers analyzer
// (arm sim-siegefirst-a). Reads evidence/2026-11-11/perseed-siegefirst-a/
// control-leg JSON and prints per-seed + pooled tables as JSON.
// Classification is the preregistered GO bar: EVERY recorded row lands in
// a named bucket; anything that fits no bucket is counted `unclassified`
// and the run is NO-GO on instrument validity. `residue` counts rows in
// buckets that mean the instrument failed to capture meaning (unknown wave,
// unknown death location, unknown cause, unexplained lingerer end, unknown
// contest id, unknown crisis kind, malformed snapshot) — GO needs both
// counters at zero. Named-but-unexpected classes (other-caller pillage,
// non-monster fight) are classified, reported, and NOT residue.
// Usage: node scripts/siegefirst-analyze-20261111.js [--out <summary.json>]
//   [--dir <perseed-dir>] [--run <run-tag>] [--mode control]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return (i >= 0 && args[i + 1]) ? args[i + 1] : def;
}
const DIR = argVal('--dir', path.join(REPO, 'evidence', '2026-11-11', 'perseed-siegefirst-a'));
const RUN = argVal('--run', 'siegefirst-pilot');
const MODE = argVal('--mode', 'control');
const OUT = argVal('--out', null);

let MONSTER_IDS = {};
let MONSTER_WAVE = {};
try {
  const ms = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of ms) { MONSTER_IDS[m.id] = true; MONSTER_WAVE[m.id] = (typeof m.wave === 'number' ? m.wave : null); }
} catch (e) { MONSTER_IDS = {}; MONSTER_WAVE = {}; }
let CONTEST_IDS = {};
try {
  const cs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'contests.json'), 'utf8'));
  for (const c of cs) CONTEST_IDS[c.id] = true;
} catch (e) { CONTEST_IDS = {}; }
// SHOW IDS (pilot diagnosis 2026-11-11): contestTick serves TWO rosters —
// contests.json AND the inline TV-show pool G.showPool() in
// src/js/contests.js ('why_eat', 'swear_jar', ...). The first analyzer
// run knew only contests.json, so all 73 show ticks were 'unclassified'.
// Shows are extracted from the showPool block (bounded, not a whole-file
// grep). '__summons' is the Ratings Summons pseudo-contest (contests.js),
// also served by the tick.
let SHOW_IDS = {};
try {
  const src = fs.readFileSync(path.join(REPO, 'src', 'js', 'contests.js'), 'utf8');
  const start = src.indexOf('G.showPool = function()');
  const end = start === -1 ? -1 : src.indexOf('];', start);
  const block = (start !== -1 && end !== -1) ? src.slice(start, end) : '';
  const re = /\{\s*id:\s*'([^']+)'/g;
  let mm;
  while ((mm = re.exec(block)) !== null) SHOW_IDS[mm[1]] = true;
} catch (e) { SHOW_IDS = {}; }
const CRISIS_KINDS = { 'hunger-winter': 1, 'first-grave': 1, 'breach': 1, 'schism': 1, 'blood-on-air': 1, 'the-siege': 1 };
const RAID_NONFIRE = { 'table-active': 1, 'cooldown': 1, 'too-few-monsters': 1, 'pantry-too-low': 1, 'roll': 1 };
const RESOLVE_HOW = { 'fought': 1, 'moved-on': 1 };

function sayBucket(line) {
  const l = String(line || '');
  if (/siege|besieg/i.test(l)) return 'siege-word';
  if (/treeline/i.test(l)) return 'treeline';
  if (/palisade/i.test(l)) return 'palisade';
  if (/gorge/i.test(l)) return 'gorge';
  if (/lingering|lingerer/i.test(l)) return 'lingerer';
  if (/\braid\b/i.test(l)) return 'raid';
  if (/hold the line|chokepoint|barricade|the wall/i.test(l)) return 'hold-line';
  return null;
}
function pillageBucket(caller) {
  const c = String(caller || '');
  if (c.indexOf('havenGrowthDaily') !== -1) return 'gorge';
  if (c.indexOf('havenRaidTick') !== -1) return 'raid';
  return 'other-caller';
}

// Lingerer episode ending, from the engine's verified clearing paths:
//  - drifted: the ~6-night clock in havenGrowthDaily (age >= 6).
//  - met-in-fight: a combat_start row vs the id on the end day (the
//    startCombat path — scholar fights, most villager encounters).
//  - killed: no combat_start row, but a monster death row for the id on
//    [endDay-1, endDay] — fieldFight kills (sortie / patrol / raid-defense
//    via resolveWildMonsterEncounter) never emit combat_start, but they
//    do registerDeath, which teles a death row. (Pilot: chorus_line d96,
//    murkcap d51.)
//  - driven-off: no death, but the raid crisis resolved 'fought' on the
//    end day — commsTick only resolves 'fought' when no living lingerer
//    threatens, so the treeline went clear that day; the clearing fight
//    was a sortie mFlee (driven off, entity persists, no death row).
//    (Pilot: buffering d71, alien_tick d85, herald d85.)
//  - moved-on-valve: the raid crisis resolved 'moved-on' in the window —
//    commsTick's safety valve clears ALL lingering flags when a crisis
//    ages past 6 days, whatever each raider's own clock says.
//  - unexplained-end: none of the above — a real gap, counted as residue.
// Twin ambiguity: death rows carry the def id, not the entity key, so a
// 'killed' call can misattribute when twins share an id. Census-level.
function classifyLingerEnd(m, endDay, o) {
  const since = (m.lingerSince !== null && m.lingerSince !== undefined) ? m.lingerSince : endDay;
  if (endDay - since >= 6) return 'drifted';
  const fights = (o && o.fights) || [];
  if (fights.some(function (fg) { return fg.day === endDay && fg.vs === m.id; })) return 'met-in-fight';
  const deaths = (o && o.teleDeaths) || [];
  if (deaths.some(function (d) { return d.who === m.id && d.kind === 'monster' && d.day >= endDay - 1 && d.day <= endDay; })) return 'killed';
  const crises = (o && o.aidCrises) || [];
  if (crises.some(function (a) { return a.verb === 'resolve' && a.how === 'fought' && a.raiders && a.day >= endDay - 1 && a.day <= endDay; })) return 'driven-off';
  if (crises.some(function (a) { return a.verb === 'resolve' && a.how === 'moved-on' && a.raiders && a.day >= endDay - 1 && a.day <= endDay; })) return 'moved-on-valve';
  return 'unexplained-end';
}

if (require.main !== module) {
  module.exports = { sayBucket: sayBucket, pillageBucket: pillageBucket, CRISIS_KINDS: CRISIS_KINDS, RAID_NONFIRE: RAID_NONFIRE, SHOW_IDS: SHOW_IDS, classifyLingerEnd: classifyLingerEnd };
  return;
}

const files = fs.readdirSync(DIR)
  .filter(function (f) { return f.indexOf('siegefirst-s') === 0 && f.indexOf('-' + RUN + '-' + MODE + '.json') !== -1; })
  .sort();
if (!files.length) { console.error('SIEGEFIRST-ANALYZE STOP: no control files in ' + DIR); process.exit(2); }

const perSeed = [];
const pooled = {
  seeds: files.length,
  unclassified: 0, residue: 0,
  unclassifiedRows: [], residueRows: [],
  raids: { calls: 0, fired: 0, nonfire: {}, raiders: 0, raiderWaves: {}, wallDamageKcal: 0, wallDamageRows: 0, palisadeRaids: 0, bigRaider: 0, redrafted: 0, diedInDraft: 0 },
  pillages: { calls: 0, byCaller: {}, kcal: 0, gorgeKcal: 0, gorgeNights: 0 },
  lingerers: { episodes: 0, byEnd: {}, totalNights: 0, totalGorgeKcal: 0, maxNights: 0, stillLingering: 0 },
  aidCrises: { raised: 0, raisedRaiders: 0, echoes: 0, resolved: 0, byHow: {}, foughtRaiders: 0 },
  crisisFires: { total: 0, byKind: {}, theSiege: 0, theSiegeSeeds: 0 },
  contests: { fired: 0, byId: {}, siegeFired: 0, siegeSeeds: 0, siegeSeen: 0, shows: 0, showsById: {}, summons: 0 },
  shelter: { calls: 0, byVerb: {}, withThreat: 0, noThreat: 0 },
  spawns: { total: 0, byWave: {}, wave6: 0, wave6Ids: {} },
  fights: { total: 0, byWave: {}, lingerFights: 0, nonMonster: 0, ends: {} },
  deaths: { total: 0, home: 0, away: 0, byKind: {}, playerHome: 0, playerAway: 0, villagerHome: 0, villagerAway: 0 },
  says: { total: 0, byBucket: {}, capped: 0 },
  snapshots: 0, malformedSnapshots: 0,
  instrumentErrors: 0,
  wall: { wins: 0, national: 0, table: 0, wave4: 0, wave5: 0, regional: 0, survivals: [], deaths: 0 },
  wrapLive: {},
};

function uncl(kind, row) {
  pooled.unclassified++;
  if (pooled.unclassifiedRows.length < 50) pooled.unclassifiedRows.push({ kind: kind, row: row });
}
function resid(kind, row) {
  pooled.residue++;
  if (pooled.residueRows.length < 50) pooled.residueRows.push({ kind: kind, row: row });
}

for (const f of files) {
  const o = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const s = { seed: o.seed, days: o.days, endReason: o.endReason, won: o.won, villageLost: o.villageLost, scaleRank: o.scaleRank, maxWave: o.maxWave, standing: o.standing, deaths: o.deaths.length, endPantryKcal: o.endPantryKcal, errors: o.instrumentErrors.length };
  pooled.instrumentErrors += o.instrumentErrors.length;
  pooled.wall.survivals.push(o.days);
  if (o.won) pooled.wall.wins++;
  if (o.table) pooled.wall.table++;
  if (o.scaleRank === 'national' || o.scaleRank === 'global') pooled.wall.national++;
  if (o.scaleRank === 'regional') pooled.wall.regional++;
  if (o.maxWave >= 4) pooled.wall.wave4++;
  if (o.maxWave >= 5) pooled.wall.wave5++;
  pooled.wall.deaths += o.deaths.length;
  if (o.wrapLive) for (const k of Object.keys(o.wrapLive)) pooled.wrapLive[k] = (pooled.wrapLive[k] || 0) + 1;

  // (1) raids
  s.raidsFired = 0; s.raiders = 0; s.palisadeWallDmg = 0;
  for (const r of (o.raids || [])) {
    pooled.raids.calls++;
    if (r.fired) {
      pooled.raids.fired++; s.raidsFired++;
      if (!Array.isArray(r.raiders)) { uncl('raid-raiders-not-array', { seed: o.seed, day: r.day }); continue; }
      for (const rd of r.raiders) {
        pooled.raids.raiders++; s.raiders++;
        if (rd.redraft) pooled.raids.redrafted++;
        if (typeof rd.hpAfter === 'number' && rd.hpAfter <= 0) pooled.raids.diedInDraft++;
        if (typeof rd.wave !== 'number') { resid('raider-wave-unknown', { seed: o.seed, day: r.day, id: rd.id }); continue; }
        pooled.raids.raiderWaves[String(rd.wave)] = (pooled.raids.raiderWaves[String(rd.wave)] || 0) + 1;
        if (typeof rd.hpBefore === 'number' && typeof rd.hpAfter === 'number' && rd.hpAfter < rd.hpBefore) {
          pooled.raids.wallDamageRows++;
          s.palisadeWallDmg += (rd.hpBefore - rd.hpAfter);
        }
      }
      if (r.palisade) pooled.raids.palisadeRaids++;
      if (r.bigRaider) pooled.raids.bigRaider++;
    } else {
      if (!RAID_NONFIRE[r.reason]) { uncl('raid-nonfire-reason', { seed: o.seed, day: r.day, reason: r.reason }); continue; }
      pooled.raids.nonfire[r.reason] = (pooled.raids.nonfire[r.reason] || 0) + 1;
    }
  }
  pooled.raids.wallDamageKcal += s.palisadeWallDmg;

  // (2) pillages
  s.pillageKcal = 0; s.gorgeKcal = 0;
  for (const p of (o.pillages || [])) {
    pooled.pillages.calls++;
    const b = pillageBucket(p.caller);
    pooled.pillages.byCaller[b] = (pooled.pillages.byCaller[b] || 0) + 1;
    if (typeof p.gotKcal !== 'number') { uncl('pillage-got-not-number', { seed: o.seed, day: p.day }); continue; }
    pooled.pillages.kcal += p.gotKcal; s.pillageKcal += p.gotKcal;
    if (b === 'gorge') { pooled.pillages.gorgeKcal += p.gotKcal; s.gorgeKcal += p.gotKcal; }
  }

  // (3) lingerer episodes — stitch by key across consecutive lingerDays.
  const episodes = {}; // key -> {id, wave, firstDay, lastDay, nights, gorgeKcal, end}
  const pillageByDay = {};
  for (const p of (o.pillages || [])) {
    if (pillageBucket(p.caller) !== 'gorge') continue;
    pillageByDay[p.day] = (pillageByDay[p.day] || 0) + (typeof p.gotKcal === 'number' ? p.gotKcal : 0);
  }
  let prevAfter = [];
  for (const ld of (o.lingerDays || [])) {
    const afterKeys = {};
    for (const m of (ld.after || [])) {
      afterKeys[m.key] = m;
      if (!episodes[m.key]) episodes[m.key] = { id: m.id, wave: m.wave, firstDay: ld.day, lastDay: ld.day, nights: 0, gorgeKcal: 0 };
      const ep = episodes[m.key];
      ep.lastDay = ld.day;
      ep.nights++;
      ep.gorgeKcal += 0; // per-lingerer split unknown; pooled below
    }
    // Endings: keys in prevAfter but not in this after.
    for (const m of prevAfter) {
      if (afterKeys[m.key]) continue;
      const ep = episodes[m.key];
      if (!ep || ep.end) continue;
      ep.end = classifyLingerEnd(m, ld.day, o);
    }
    prevAfter = ld.after || [];
  }
  // Episodes still present at the last lingerDay: still lingering, unless
  // the run ended (village dead / game over) — still a classified ending.
  const lastLd = (o.lingerDays || [])[(o.lingerDays || []).length - 1];
  for (const k of Object.keys(episodes)) {
    const ep = episodes[k];
    if (!ep.end) ep.end = 'still-lingering';
    pooled.lingerers.episodes++;
    pooled.lingerers.byEnd[ep.end] = (pooled.lingerers.byEnd[ep.end] || 0) + 1;
    pooled.lingerers.totalNights += ep.nights;
    if (ep.nights > pooled.lingerers.maxNights) pooled.lingerers.maxNights = ep.nights;
    if (ep.end === 'still-lingering') pooled.lingerers.stillLingering++;
    if (ep.end === 'unexplained-end') resid('linger-unexplained-end', { seed: o.seed, key: k, id: ep.id, firstDay: ep.firstDay, lastDay: ep.lastDay });
  }
  pooled.lingerers.totalGorgeKcal += s.gorgeKcal;
  s.lingerEpisodes = Object.keys(episodes).length;
  s.lingerEnds = {};
  for (const k of Object.keys(episodes)) { const e = episodes[k].end; s.lingerEnds[e] = (s.lingerEnds[e] || 0) + 1; }

  // (4) aid crises
  for (const a of (o.aidCrises || [])) {
    if (a.verb === 'raise') {
      // Echo rows (created:false — raiseAidCrisis returned null because
      // a crisis was already open) are classified, not counted as raises.
      if (a.created === false) { pooled.aidCrises.echoes++; continue; }
      pooled.aidCrises.raised++;
      if (a.raiders) pooled.aidCrises.raisedRaiders++;
      if (typeof a.raiders !== 'boolean') uncl('aid-raise-raiders-not-bool', { seed: o.seed, day: a.day });
    } else if (a.verb === 'resolve') {
      pooled.aidCrises.resolved++;
      if (!RESOLVE_HOW[a.how]) { uncl('aid-resolve-how', { seed: o.seed, day: a.day, how: a.how }); continue; }
      pooled.aidCrises.byHow[a.how] = (pooled.aidCrises.byHow[a.how] || 0) + 1;
      if (a.how === 'fought' && a.raiders) pooled.aidCrises.foughtRaiders++;
    } else {
      uncl('aid-verb', { seed: o.seed, day: a.day, verb: a.verb });
    }
  }

  // (5) crisis fires
  let seedSiege = false;
  for (const c of (o.crisisFires || [])) {
    pooled.crisisFires.total++;
    if (!c.kind || !CRISIS_KINDS[c.kind]) { uncl('crisis-kind', { seed: o.seed, day: c.day, kind: c.kind }); continue; }
    pooled.crisisFires.byKind[c.kind] = (pooled.crisisFires.byKind[c.kind] || 0) + 1;
    if (c.kind === 'the-siege') { pooled.crisisFires.theSiege++; seedSiege = true; }
  }
  if (seedSiege) pooled.crisisFires.theSiegeSeeds++;

  // (6) contests — three kinds served by the one tick: contests
  // (contests.json), TV shows (G.showPool), the '__summons' pseudo-contest.
  let seedSiegeFired = false;
  for (const c of (o.contests || [])) {
    pooled.contests.fired++;
    if (!c.id) { uncl('contest-id', { seed: o.seed, day: c.day, id: c.id }); continue; }
    if (CONTEST_IDS[c.id]) {
      pooled.contests.byId[c.id] = (pooled.contests.byId[c.id] || 0) + 1;
      if (c.id === 'siege') { pooled.contests.siegeFired++; seedSiegeFired = true; }
    } else if (SHOW_IDS[c.id]) {
      pooled.contests.shows++;
      pooled.contests.showsById[c.id] = (pooled.contests.showsById[c.id] || 0) + 1;
    } else if (c.id === '__summons') {
      pooled.contests.summons++;
    } else {
      uncl('contest-id', { seed: o.seed, day: c.day, id: c.id }); continue;
    }
  }
  for (const c of (o.contestFiredTele || [])) {
    if (!c.id || !CONTEST_IDS[c.id]) uncl('contest-tele-id', { seed: o.seed, day: c.day, id: c.id });
  }
  if (seedSiegeFired) pooled.contests.siegeSeeds++;
  if (o.daily && o.daily.length) {
    const last = o.daily[o.daily.length - 1];
    if (last && last.contestsSeen && typeof last.contestsSeen.siege === 'number') pooled.contests.siegeSeen += last.contestsSeen.siege;
  }
  s.siegeContestFired = seedSiegeFired;

  // (7) shelter
  for (const sh of (o.shelter || [])) {
    pooled.shelter.calls++;
    if (['shelterVillagers', 'shelterEveryoneBut', 'shelterMuster', 'releaseShelter', 'shelterAllClear'].indexOf(sh.verb) === -1) { uncl('shelter-verb', { seed: o.seed, day: sh.day, verb: sh.verb }); continue; }
    pooled.shelter.byVerb[sh.verb] = (pooled.shelter.byVerb[sh.verb] || 0) + 1;
    if (sh.threat) pooled.shelter.withThreat++; else pooled.shelter.noThreat++;
  }

  // (8) spawns
  for (const sp of (o.spawns || [])) {
    pooled.spawns.total++;
    if (!sp.id || !MONSTER_IDS[sp.id]) { uncl('spawn-id', { seed: o.seed, day: sp.day, id: sp.id }); continue; }
    if (typeof sp.wave !== 'number') { resid('spawn-wave-unknown', { seed: o.seed, day: sp.day, id: sp.id }); continue; }
    pooled.spawns.byWave[String(sp.wave)] = (pooled.spawns.byWave[String(sp.wave)] || 0) + 1;
    if (sp.wave === 6) { pooled.spawns.wave6++; pooled.spawns.wave6Ids[sp.id] = (pooled.spawns.wave6Ids[sp.id] || 0) + 1; }
  }

  // (9) fights + ends + deaths
  for (const fg of (o.fights || [])) {
    pooled.fights.total++;
    if (!fg.vs || !MONSTER_IDS[fg.vs]) {
      pooled.fights.nonMonster++;
      continue; // named class: fight vs a non-monster (stranger/alien) — classified, not residue
    }
    if (typeof fg.wave !== 'number') { resid('fight-wave-unknown', { seed: o.seed, day: fg.day, vs: fg.vs }); continue; }
    pooled.fights.byWave[String(fg.wave)] = (pooled.fights.byWave[String(fg.wave)] || 0) + 1;
    if ((fg.lingeringAtStart || []).some(function (l) { return l.id === fg.vs; })) pooled.fights.lingerFights++;
  }
  for (const fe of (o.fightEnds || [])) {
    if (!fe.result) { uncl('fight-end-no-result', { seed: o.seed, day: fe.day }); continue; }
    pooled.fights.ends[fe.result] = (pooled.fights.ends[fe.result] || 0) + 1;
  }
  for (const d of (o.teleDeaths || [])) {
    pooled.deaths.total++;
    if (d.loc !== 'home' && d.loc !== 'away') { resid('death-loc-unknown', { seed: o.seed, day: d.day, who: d.who, kind: d.kind }); continue; }
    if (!d.cause) { resid('death-cause-unknown', { seed: o.seed, day: d.day, who: d.who, kind: d.kind }); continue; }
    pooled.deaths[d.loc]++;
    pooled.deaths.byKind[d.kind || 'unknown-kind'] = (pooled.deaths.byKind[d.kind || 'unknown-kind'] || 0) + 1;
    if (d.player) { if (d.loc === 'home') pooled.deaths.playerHome++; else pooled.deaths.playerAway++; }
    else { if (d.loc === 'home') pooled.deaths.villagerHome++; else pooled.deaths.villagerAway++; }
  }

  // (10) siege say lines
  s.sayBuckets = {};
  for (const sline of (o.siegeSays || [])) {
    pooled.says.total++;
    const b = sayBucket(sline.line);
    if (!b) { uncl('say-no-bucket', { seed: o.seed, day: sline.day, line: String(sline.line).slice(0, 120) }); continue; }
    pooled.says.byBucket[b] = (pooled.says.byBucket[b] || 0) + 1;
    s.sayBuckets[b] = (s.sayBuckets[b] || 0) + 1;
  }
  if ((o.siegeSays || []).length >= 200) pooled.says.capped++;

  // (11) snapshots
  for (const snap of (o.daily || [])) {
    pooled.snapshots++;
    if (typeof snap.day !== 'number' || (snap.havenTier !== null && typeof snap.havenTier !== 'number')) {
      pooled.malformedSnapshots++;
      resid('malformed-snapshot', { seed: o.seed, day: snap.day });
    }
  }
  s.theSiege = seedSiege;
  perSeed.push(s);
}

pooled.wall.survivals.sort(function (a, b) { return a - b; });
const mid = pooled.wall.survivals[Math.floor(pooled.wall.survivals.length / 2)];

const summary = {
  run: RUN, mode: MODE, seeds: pooled.seeds,
  GO: { unclassified: pooled.unclassified, residue: pooled.residue, verdict: (pooled.unclassified === 0 && pooled.residue === 0) ? 'GO' : 'NO-GO' },
  unclassifiedRows: pooled.unclassifiedRows,
  residueRows: pooled.residueRows,
  raids: pooled.raids,
  pillages: pooled.pillages,
  lingerers: pooled.lingerers,
  aidCrises: pooled.aidCrises,
  crisisFires: pooled.crisisFires,
  contests: pooled.contests,
  shelter: pooled.shelter,
  spawns: pooled.spawns,
  fights: pooled.fights,
  deaths: pooled.deaths,
  says: pooled.says,
  snapshots: pooled.snapshots, malformedSnapshots: pooled.malformedSnapshots,
  instrumentErrors: pooled.instrumentErrors,
  wall: { wins: pooled.wall.wins, national: pooled.wall.national, table: pooled.wall.table, wave4: pooled.wall.wave4, wave5: pooled.wall.wave5, regional: pooled.wall.regional, medianSurvival: mid, survivals: pooled.wall.survivals, deaths: pooled.wall.deaths },
  wrapLive: pooled.wrapLive,
  perSeed: perSeed,
};

console.log(JSON.stringify(summary, null, 2));
// Atomic --out write (write-flap lesson 2026-11-11): a direct
// writeFileSync truncates the old file first, so a flap mid-write
// destroys the previous summary (happened this run — the pre-fix
// summary was left 0 bytes). Write a temp sibling, fsync it, then
// rename over the target; a failed write leaves the old file intact.
if (OUT) {
  const tmp = OUT + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(summary, null, 2) + '\n');
  const fd = fs.openSync(tmp, 'r');
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(tmp, OUT);
}
