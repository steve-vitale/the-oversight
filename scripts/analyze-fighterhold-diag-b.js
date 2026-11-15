// Stage-0 DIAG for sim-fighterhold-b: decompose combat deaths of national
// villages on the COMMITTED holdbuild pilot corpus (16 files, ON + OFF).
// No new sims. Reads only committed evidence.
// Usage: node scripts/analyze-fighterhold-diag-b.js
// Output: evidence/2026-11-14/fighterhold-b-diag.json (+ stdout summary).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-11-14');
const LEGS = ['perseed-holdbuild-b-pilot-off', 'perseed-holdbuild-b-pilot-on'];

// Channel map for PEOPLE deaths (kind villager/person). Monster deaths
// (kind monster) are kills, not villager deaths — excluded from the
// decomposition (counted separately as context).
// Call-site grounding (src/js): 'combat' = field fight (game.js:40081/91/137,
// statusEffects.js:407); 'raid'/'raid-defense' = raid (hierarchy.js:3785);
// 'expedition'/'the expedition' = expedition (ledger.js playerDeath,
// villager-mapmem kill hook is monster-kind); 'the wild' = scholar death
// default (ledger.js:744); 'monster' = killed by a monster via the
// hurtVillager path (game.js:8335 playerDeath(cause)); 'contest' =
// contests.js:6121; 'ambush' = betrayal.js:1072; 'alien'/'alien_beam' =
// alienPlayers.js; starvation/hunger/thirst/disease/injuries = non-combat.
function channelOf(cause) {
  const c = String(cause || '?');
  if (c === 'combat' || c === 'monster') return 'field-combat';
  if (c === 'raid' || c === 'raid-defense') return 'raid';
  if (c === 'expedition' || c === 'the expedition') return 'expedition';
  if (c === 'the wild') return 'wild';
  if (c === 'contest') return 'contest';
  if (c === 'ambush') return 'ambush';
  if (c === 'alien' || c === 'alien_beam') return 'alien';
  if (/starv|hunger|thirst|disease|sick|wound|injur/i.test(c)) return 'non-combat';
  return 'other:' + c;
}

const COMBAT_ABILITIES = new Set([
  'rage', 'war_cry', 'pyrokinesis', 'beast_calm', 'pocket_sand',
  'bloodhound', 'night_eyes', 'the_touch', 'scream_cheese', 'beard_moss',
  'green_whisper', 'green_thumb', 'echo_location', 'lucky_rock',
]);

function isNationalRow(r) {
  return r.nationalLive === true || r.scale === 'national' || r.scale === 'global';
}

// National episodes from the per-day series: [startDay, endDay] inclusive.
function nationalEpisodes(series) {
  const eps = [];
  let cur = null;
  for (const r of series) {
    if (isNationalRow(r)) {
      if (!cur) cur = { start: r.d, end: r.d };
      else cur.end = r.d;
    } else if (cur) { eps.push(cur); cur = null; }
  }
  if (cur) eps.push(cur);
  return eps;
}

function episodeOf(eps, day) {
  for (const e of eps) if (day >= e.start && day <= e.end) return e;
  return null;
}

// Nearest villagers snapshot at or before a day. snapshots are [day, rows].
function snapshotAt(samples, day) {
  const snaps = (samples && samples.villagers) || [];
  let best = null;
  for (const s of snaps) {
    if (s[0] <= day && (!best || s[0] > best[0])) best = s;
  }
  return best;
}

function classifyVictim(vid, snap) {
  if (!snap) return { bucket: 'unknown', kills: null, exped: null, abilities: null, occ: null, profile: null };
  const row = (snap[1] || []).find((v) => v.vid === vid || String(v.vid).slice(0, 12) === String(vid).slice(0, 12));
  if (!row) return { bucket: 'unknown', kills: null, exped: null, abilities: null, occ: null, profile: null };
  const kills = row.kills || 0;
  const combatAbils = (row.abilities || []).filter((a) => COMBAT_ABILITIES.has(a));
  // Fighter = has killed a monster. Armed = carries a combat ability but no
  // kill yet. Non-fighter = neither. (HP/gear/party at death are NOT in the
  // corpus — no per-death HP, gear, or party fields exist in the driver.)
  const bucket = kills > 0 ? 'fighter' : (combatAbils.length > 0 ? 'armed-non-killer' : 'non-fighter');
  return { bucket, kills, exped: row.exped || 0, abilities: row.abilities || [], occ: row.occ, profile: row.profile };
}

const out = { legs: {}, pooled: {} };
let pooledNatDeaths = [];
let pooledAllPeopleDeaths = [];

for (const leg of LEGS) {
  const dir = path.join(DIR, leg);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const legOut = { files: [], seeds: {}, totals: {} };
  for (const fn of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
    const seed = rec.seed;
    const eps = nationalEpisodes(rec.series || []);
    const heldDays = eps.reduce((t, e) => t + (e.end - e.start + 1), 0);
    const peopleDeaths = (rec.deaths || []).filter((d) => d.kind === 'villager' || d.kind === 'person');
    const monsterKills = (rec.deaths || []).filter((d) => d.kind === 'monster');
    const natDeaths = [];
    const preNatDeaths = [];
    const postNatDeaths = [];
    for (const d of peopleDeaths) {
      const ep = episodeOf(eps, d.day);
      const vic = classifyVictim(d.who, snapshotAt(rec.samples, d.day));
      const item = {
        day: d.day, who: d.who, cause: d.cause, player: !!d.player,
        channel: channelOf(d.cause),
        daysNationalAtDeath: ep ? d.day - ep.start : null,
        nationalEpisodeStart: ep ? ep.start : null,
        victim: vic,
      };
      if (ep) natDeaths.push(item);
      else if (eps.length && d.day < eps[0].start) preNatDeaths.push(item);
      else postNatDeaths.push(item);
    }
    // Monster kills while national, by wave of the killed monster (from the
    // series w1..w5 cumulative counters at episode boundaries — approx via
    // the death record's monster id wave lookup is not in the corpus, so
    // report kills by cause instead).
    const natKills = monsterKills.filter((d) => episodeOf(eps, d.day));
    const killCause = {};
    for (const d of natKills) killCause[d.cause] = (killCause[d.cause] || 0) + 1;
    const lastRow = (rec.series || [])[(rec.series || []).length - 1] || {};
    legOut.seeds[seed] = {
      days: rec.days, endReason: rec.endReason, villageLost: !!rec.villageLost,
      maxWave: rec.maxWave, scaleEnd: rec.scaleRank,
      nationalEver: eps.length > 0, episodes: eps, heldDays,
      diedWhileNational: !!rec.villageLost && eps.length > 0 && (rec.series || []).length > 0
        && isNationalRow(lastRow),
      peopleDeaths: peopleDeaths.length,
      natDeaths, preNatDeaths: preNatDeaths.length, postNatDeaths: postNatDeaths.length,
      natMonsterKills: natKills.length, natKillCauses: killCause,
      totalDeaths: (rec.deaths || []).length,
    };
    pooledNatDeaths = pooledNatDeaths.concat(natDeaths.map((x) => ({ leg, seed, ...x })));
    pooledAllPeopleDeaths = pooledAllPeopleDeaths.concat(peopleDeaths.map((d) => ({ leg, seed, day: d.day, cause: d.cause, player: !!d.player })));
  }
  legOut.files = files;
  out.legs[leg] = legOut;
}

// Pooled tallies: deaths WHILE NATIONAL only.
function tally(list, keyFn) {
  const t = {};
  for (const x of list) { const k = keyFn(x); t[k] = (t[k] || 0) + 1; }
  return t;
}
out.pooled = {
  natPeopleDeaths: pooledNatDeaths.length,
  byLeg: tally(pooledNatDeaths, (x) => x.leg),
  byChannel: tally(pooledNatDeaths, (x) => x.channel),
  byChannelAndLeg: tally(pooledNatDeaths, (x) => x.leg + '|' + x.channel),
  byVictimBucket: tally(pooledNatDeaths, (x) => x.victim.bucket),
  byVictimBucketAndChannel: tally(pooledNatDeaths, (x) => x.victim.bucket + '|' + x.channel),
  playerDeathsWhileNational: pooledNatDeaths.filter((x) => x.player).length,
  nonPlayerWhileNational: pooledNatDeaths.filter((x) => !x.player).length,
  allPeopleDeaths: pooledAllPeopleDeaths.length,
  allPeopleByCause: tally(pooledAllPeopleDeaths, (x) => x.cause),
  // days-national-at-death distribution (combat channels only)
  combatNatDeaths: pooledNatDeaths.filter((x) => ['field-combat', 'raid', 'expedition', 'wild', 'contest', 'ambush'].includes(x.channel)),
  natDeaths: pooledNatDeaths,
};

const outPath = path.join(DIR, 'fighterhold-b-diag.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('wrote ' + outPath);

// ---- stdout summary ----
console.log('\n=== DIAG: deaths WHILE NATIONAL (pooled 16 pilot files) ===');
console.log('people deaths while national:', out.pooled.natPeopleDeaths,
  '(ON ' + (out.pooled.byLeg['perseed-holdbuild-b-pilot-on'] || 0) +
  ' / OFF ' + (out.pooled.byLeg['perseed-holdbuild-b-pilot-off'] || 0) + ')');
console.log('by channel:', JSON.stringify(out.pooled.byChannel, null, 1));
console.log('by victim bucket:', JSON.stringify(out.pooled.byVictimBucket, null, 1));
console.log('bucket x channel:', JSON.stringify(out.pooled.byVictimBucketAndChannel, null, 1));
console.log('player(scholar) deaths while national:', out.pooled.playerDeathsWhileNational,
  '| non-player:', out.pooled.nonPlayerWhileNational);
console.log('\nper-seed (diedWhileNational / heldDays / natDeaths):');
for (const leg of LEGS) {
  for (const [seed, s] of Object.entries(out.legs[leg].seeds)) {
    console.log(' ', leg.includes('-on') ? 'ON ' : 'OFF', seed,
      'days=' + s.days, s.endReason, 'natEver=' + s.nationalEver,
      'held=' + s.heldDays, 'diedWhileNat=' + s.diedWhileNational,
      'natDeaths=' + s.natDeaths.length, 'preNat=' + s.preNatDeaths,
      'postNat=' + s.postNatDeaths, 'natKills=' + s.natMonsterKills);
  }
}
console.log('\nall people deaths by cause (whole corpus, all days):',
  JSON.stringify(out.pooled.allPeopleByCause, null, 1));
console.log('\ncombat-channel deaths while national (day, seed, leg, channel, victim bucket, kills, daysNat):');
for (const x of out.pooled.combatNatDeaths) {
  console.log(' ', x.leg.includes('-on') ? 'ON ' : 'OFF', x.seed, 'd' + x.day,
    x.channel, x.who, 'player=' + x.player, x.victim.bucket,
    'kills=' + x.victim.kills, 'exped=' + x.victim.exped,
    'occ=' + x.victim.occ, 'prof=' + x.victim.profile,
    'daysNat=' + x.daysNationalAtDeath);
}
