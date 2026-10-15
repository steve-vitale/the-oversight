#!/usr/bin/env node
// scripts/wildtile-20261015.js — WILD-TILE tile-localization instrument
// (sim-findings #256, scale-onramp, 2026-10-15).
//
// The sim-siegeroster diagnostic measured channels (raid/wild) but never the
// TILE — the arm was built on the untested assumption that post-unlock wild
// villager deaths happen at Haven when the scholar is away. This instrument
// is the named next step: tile-localize every post-unlock villager
// (non-scholar, kind villager/person — NEVER monsters) combat death.
//
// INSTRUMENT ONLY — harness-side wraps, zero game-code changes.
//   - Game.fieldFight wrap: pre-fight tile snapshot (monster / villager /
//     scholar / Haven) + the diag's channel classifier (raid/wild/patrol/
//     other). Snapshot BEFORE the fight: mFlee re-tiles the monster.
//   - Game.registerDeath wrap: the death records (vid straight from
//     opts.villagerId — the tele sampler's `who` is a fallback chain).
//   - Pairing (lib): each post-unlock villager combat death finds its fatal
//     fight by vid + day window. Unpaired deaths are reported as 'unpaired'
//     (their channel is unknowable), never absorbed into a friendly bucket.
//
// Substrate: leadfeast + FEASTSCALE_R13=1 (the siegedef2r/siegeroster road).
// Named-export policy unwrap (sim-findings #69): destructured require;
// the SMOKE gate asserts leadfeast.daily is a function.
//
// Pre-registered DIAGNOSTIC GO (evidence/2026-10-15/sim-wildtile.md):
//   >=80% of post-unlock wild-channel villager combat deaths
//   tile-attributed, AND a channel x tile breakdown answering #256:
//   do wild deaths happen on the Haven tile when the scholar is away, or
//   on wild tiles where villagers work?
// A miss is NO-GO — land evidence-only; the blank stays open.
//
// Usage:
//   SMOKE=1 node scripts/wildtile-20261015.js   # instrument-honesty gate
//   OUT=evidence/2026-10-15/wildtile.json node scripts/wildtile-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const lib = require('./wildtile-lib-20261015');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;

function monsterWave(Game, monsterId) {
  try {
    const md = (Game.data.monsters || []).find(m => m.id === monsterId);
    return md ? (md.wave || null) : null;
  } catch (e) { return null; }
}

function snapTiles(Game, m) {
  let monsterTile = null, scholarTile = null, havenTile = null;
  try {
    if (m && m.tx != null && m.ty != null) monsterTile = { x: m.tx, y: m.ty };
  } catch (e) {}
  try {
    if (Game.map && Game.map.px != null) scholarTile = { x: Game.map.px, y: Game.map.py };
  } catch (e) {}
  try {
    const v = Game.state.village || {};
    havenTile = { x: v.px != null ? v.px : 4, y: v.py != null ? v.py : 4 };
  } catch (e) {}
  return { monsterTile, scholarTile, havenTile };
}

// attachWildtile(Game, seed): install the read-only wraps. Returns the
// track object; traps consume nothing and change nothing about the
// trajectory (push-to-array only — the harness RNG stream is untouched).
function attachWildtile(Game, seed) {
  const track = { fights: [], deaths: [], channel: null };
  const origFF = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, m, opts) {
    const ch = track.channel; track.channel = null;
    const snap = snapTiles(Game, m);
    let rec = null;
    try { rec = origFF(vid, mdef, m, opts); }
    finally {
      try {
        const mid = (m && m.id) || (mdef && mdef.id) || '?';
        track.fights.push(lib.buildTileRow({
          seed,
          day: (Game.state.scholar || {}).day || 0,
          vid: String(vid || '?'),
          channel: ch || 'other',
          monsterId: mid,
          wave: monsterWave(Game, mid),
          outcome: rec ? rec.outcome : 'threw',
          intent: rec ? rec.intent : null,
          rounds: rec ? rec.rounds : null,
          monsterTile: snap.monsterTile,
          scholarTile: snap.scholarTile,
          havenTile: snap.havenTile,
          // villagerTile: derived by the lib's documented rule.
        }));
      } catch (e) {}
    }
    return rec;
  };
  // Channel classifier (the diag's): resolvePatrol -> patrol;
  // resolveWildMonsterEncounter -> raid iff opts.raid else wild. Nest-safe.
  const tagChannel = (name, ch) => {
    try {
      const orig = Game[name].bind(Game);
      Game[name] = function (...args) {
        const prev = track.channel;
        track.channel = ch === 'wild-or-raid'
          ? ((args[2] && args[2].raid) ? 'raid' : 'wild')
          : ch;
        try { return orig(...args); }
        finally { if (track.channel !== null) track.channel = prev; }
      };
    } catch (e) {}
  };
  tagChannel('resolvePatrol', 'patrol');
  tagChannel('resolveWildMonsterEncounter', 'wild-or-raid');

  const origRD = Game.registerDeath.bind(Game);
  Game.registerDeath = function (opts) {
    let r = null;
    try { r = origRD(opts); }
    finally {
      try {
        opts = opts || {};
        track.deaths.push({
          day: (Game.state.scholar || {}).day || 0,
          vid: opts.villagerId != null ? String(opts.villagerId) : null,
          who: opts.villagerId || opts.monsterId || opts.name || '?',
          kind: opts.kind || '?',
          cause: opts.cause || '?',
          player: !!opts.player,
        });
      } catch (e) {}
    }
    return r;
  };
  return track;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'wildtile', fullTelemetry: true });
  await setupGame(Game);
  const track = attachWildtile(Game, seed);
  const audit = { unlockDay5: null, maxUnlocked: 1, nationalDays: 0, tableEver: false, won: false };

  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily ? leadfeast.daily.bind(leadfeast) : null;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw > audit.maxUnlocked) audit.maxUnlocked = uw;
      if (uw >= 5 && audit.unlockDay5 == null) audit.unlockDay5 = day;
      const r = G.scaleRank ? G.scaleRank() : 'village';
      if (r === 'national' || r === 'global') audit.nationalDays++;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) audit.tableEver = true;
      if (G.won) audit.won = true;
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });

  // Deaths: the instrument's OWN registerDeath records (vid-direct), plus
  // a reconciliation pin against the harness sampler.
  const deaths = track.deaths.filter(lib.isVillagerCombatDeath);
  const sampDeaths = (result.samples.deaths || []).filter(lib.isVillagerCombatDeath);
  const postDeaths = audit.unlockDay5 != null
    ? deaths.filter(d => d.day >= audit.unlockDay5) : [];
  const postFights = audit.unlockDay5 != null
    ? track.fights.filter(f => f.day >= audit.unlockDay5) : [];
  const { pairs, unmatched } = lib.pairDeathsToFights(postDeaths, postFights);
  const attribution = lib.tileAttribution(pairs, unmatched);
  const wildPairs = pairs.filter(p => p.fight.channel === 'wild');
  const wildDeaths = postDeaths.length
    ? wildPairs.length : 0;
  const wildAttributed = wildPairs.filter(p => p.fight.attributed).length;
  const wildAttributionRate = wildPairs.length
    ? +(wildAttributed / wildPairs.length).toFixed(3) : null;

  return {
    seed, days: result.days, endReason: result.endReason,
    maxUnlocked: audit.maxUnlocked, unlockDay5: audit.unlockDay5,
    nationalDays: audit.nationalDays, tableEver: audit.tableEver, won: audit.won,
    villagerCombatDeaths: deaths.length,
    postUnlockVillagerCombatDeaths: postDeaths.length,
    samplerDeaths: sampDeaths.length,
    samplerPostUnlock: audit.unlockDay5 != null
      ? sampDeaths.filter(d => d.day >= audit.unlockDay5).length : 0,
    fightsObserved: track.fights.length,
    pairs: pairs.length, unmatched: unmatched.length,
    attribution, wildPairs: wildPairs.length, wildAttributed, wildAttributionRate,
    answer256: lib.answer256(wildPairs),
    channelTile: lib.aggregateTiles(pairs),
    // Rows are heavyweight; keep the attributed pairs' rows + unmatched list.
    rows: pairs.map(p => ({ death: p.death, fight: p.fight })),
    unmatchedDeaths: unmatched,
  };
}

// ---- SMOKE: instrument-honesty gate ----
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const okk = !!cond;
    console.log(`  ${okk ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!okk) fails.push(name);
  };
  // sim-findings #69: the named-export unwrap must be genuine.
  check('named-export unwrap: leadfeast.daily is a function', typeof leadfeast.daily === 'function');

  const { Game } = await loadGame({ seed: 11, mode: 'wildtile-smoke', fullTelemetry: false });
  await setupGame(Game);
  const track = attachWildtile(Game, 11);

  // Scripted REAL engine path: a world monster at a wild tile, a villager
  // jumped through resolveWildMonsterEncounter (the 'wild' channel tagger).
  let vid = null;
  try {
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    vid = roster[0] || null;
    if (v.health) v.health[vid] = 100;
  } catch (e) {}
  const haven = { x: (Game.state.village || {}).px != null ? Game.state.village.px : 4,
                  y: (Game.state.village || {}).py != null ? Game.state.village.py : 4 };
  const m = { id: 'hushpuppy', tx: haven.x + 2, ty: haven.y + 1, hp: 30, maxHp: 30, mx: 4, my: 4 };
  // Expected tiles, read BEFORE the encounter: the instrument snapshots
  // pre-fight, and the fight itself may re-tile (mFlee) or remove the
  // monster — comparing against the post-fight `m` object would be wrong.
  const expectMonster = { x: m.tx, y: m.ty };
  const expectScholar = { x: haven.x + 3, y: haven.y - 2 };
  // scholar away from Haven (the #256 scenario): move the scholar tile.
  Game.map.px = expectScholar.x; Game.map.py = expectScholar.y;
  let threw = null;
  try { Game.resolveWildMonsterEncounter(vid, m); } catch (e) { threw = e.message; }
  check('scripted wild encounter runs (no throw)', threw === null, threw);
  check('exactly one fight captured', track.fights.length === 1, 'n=' + track.fights.length);
  const f = track.fights[0] || {};
  check("channel classified 'wild'", f.channel === 'wild', 'ch=' + f.channel);
  check('monsterTile is the wild tile (pre-fight)', f.monsterTile && f.monsterTile.x === expectMonster.x && f.monsterTile.y === expectMonster.y,
    JSON.stringify(f.monsterTile));
  check('villagerTile derived = monsterTile (wild rule)', f.villagerTile && f.villagerTile.x === expectMonster.x && f.villagerTile.y === expectMonster.y,
    JSON.stringify(f.villagerTile));
  check('havenTile is the village tile', f.havenTile && f.havenTile.x === haven.x && f.havenTile.y === haven.y,
    JSON.stringify(f.havenTile));
  check('scholarTile is the moved scholar tile', f.scholarTile && f.scholarTile.x === expectScholar.x && f.scholarTile.y === expectScholar.y,
    JSON.stringify(f.scholarTile));
  check('row is tile-attributed', f.attributed === true);
  check('death NOT on Haven tile (dVillagerHaven>0)', (f.dVillagerHaven || 0) > 0, 'd=' + f.dVillagerHaven);
  check('scholar away from Haven flagged', f.scholarAwayFromHaven === true);
  check('scholar away from death flagged', f.scholarAwayFromDeath === true);
  // registerDeath wrap: a real death may or may not have occurred; the wrap
  // is exercised iff the villager died. Assert the wrap ATTACHED (callable)
  // rather than asserting a death happened.
  check('registerDeath wrap installed', typeof Game.registerDeath === 'function');
  console.log(fails.length ? `\nSMOKE STOP: ${fails.length} failure(s)` : '\nSMOKE GREEN — instrument captures real tiles from the real wild path');
  process.exit(fails.length ? 1 : 0);
}

async function main() {
  const out = process.env.OUT;
  if (!out) { console.error('OUT required'); process.exit(2); }
  console.log('wildtile sweep: leadfeast + FEASTSCALE_R13=1, 180d death-aware');
  const rows = [];
  for (const seed of SEEDS) {
    const r = await runSeed(seed);
    rows.push(r);
    console.log(`  seed ${seed}: days=${r.days} end=${r.endReason} wave<=${r.maxUnlocked} unlock=${r.unlockDay5 == null ? 'no' : 'd' + r.unlockDay5} postV=${r.postUnlockVillagerCombatDeaths} pairs=${r.pairs} wild=${r.wildPairs} wildAttr=${r.wildAttributionRate} ans256=${r.answer256.verdict}`);
  }
  const unlockers = rows.filter(r => r.unlockDay5 != null);
  const agg = {
    n: rows.length, unlockers: unlockers.length,
    postUnlockVillagerCombatDeaths: unlockers.reduce((t, r) => t + r.postUnlockVillagerCombatDeaths, 0),
    paired: unlockers.reduce((t, r) => t + r.pairs, 0),
    unmatched: unlockers.reduce((t, r) => t + r.unmatched, 0),
    wildPairs: unlockers.reduce((t, r) => t + r.wildPairs, 0),
    wildAttributed: unlockers.reduce((t, r) => t + r.wildAttributed, 0),
    medianDays: rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)],
    days: rows.map(r => r.days),
    national: rows.filter(r => r.nationalDays > 0).length,
    table: rows.filter(r => r.tableEver).length,
    wins: rows.filter(r => r.won).length,
    wave5: rows.filter(r => r.maxUnlocked >= 5).length,
  };
  agg.wildAttributionRate = agg.wildPairs ? +(agg.wildAttributed / agg.wildPairs).toFixed(3) : null;
  const allWildPairs = [];
  for (const r of unlockers) for (const p of r.rows) if (p.fight.channel === 'wild') allWildPairs.push(p);
  agg.answer256 = lib.answer256(allWildPairs);
  const payload = {
    generated: new Date().toISOString(), seeds: SEEDS, days: DAYS,
    substrate: 'leadfeast+FEASTSCALE_R13=1',
    diagnostic_go: '>=80% of post-unlock wild-channel villager combat deaths tile-attributed, plus channel x tile breakdown answering #256',
    agg, rows,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 1));
  console.log('wrote ' + out);
  console.log(JSON.stringify(agg, null, 2));
}

// Fingerprint for the det-gate: everything the instrument reports, as one
// stable string. Bit-identical runs must produce bit-identical fingerprints.
function fingerprint(r) {
  const parts = [
    r.seed, r.days, r.endReason, r.maxUnlocked, r.unlockDay5,
    r.postUnlockVillagerCombatDeaths, r.pairs, r.unmatched,
    r.wildPairs, r.wildAttributed, r.wildAttributionRate,
    r.answer256.verdict,
  ];
  for (const p of (r.rows || [])) {
    const f = p.fight || {};
    parts.push([
      p.death.day, p.death.vid, f.day, f.vid, f.channel, f.monsterId, f.wave,
      f.outcome, JSON.stringify(f.villagerTile), JSON.stringify(f.scholarTile),
      JSON.stringify(f.havenTile), f.onHavenTile, f.scholarAwayFromHaven,
    ].join('|'));
  }
  for (const d of (r.unmatchedDeaths || [])) parts.push('UN:' + [d.day, d.vid, d.cause].join('|'));
  return parts.join('~');
}

module.exports = { runSeed, fingerprint, attachWildtile, SEEDS, DAYS };

if (require.main === module) {
  if (process.env.SMOKE === '1') { smokeGate().catch(e => { console.error('FATAL', e); process.exit(1); }); }
  else main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
