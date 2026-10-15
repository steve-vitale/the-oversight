#!/usr/bin/env node
// scripts/wildtile-lib-20261015.js — pure tile-localization row builder for
// the wild-channel death instrument (sim-findings #256, scale-onramp
// 2026-10-15).
//
// The sim-siegeroster arm (evidence/2026-10-15/sim-siegeroster.md) was KILLED
// AT PILOT because its defense was built on an untested assumption: that
// post-unlock wild villager deaths happen at Haven when the scholar is away.
// Its diagnostic measured channels (raid/wild) but never the TILE. This lib
// turns tile snapshots into answerable rows.
//
// No Game reads here: the sweep driver gathers plain snapshots and this lib
// computes distances, flags, death<->fight pairing, and the #256 answer.
// That keeps the logic unit-testable (scripts/test-wildtile-20261015.js)
// without a live sim.
//
// Tile semantics (engine code, read 2026-10-15 — NOT invented):
//   monsterTile: the world-monster entity's (tx, ty) at fight start.
//     Snapshot BEFORE the fight: mFlee re-tiles the monster mid-resolution.
//   scholarTile: Game.map.px/py — the scholar's world tile.
//   havenTile:  state.village.px/py (default 4,4) — the Haven tile.
//   villagerTile (DERIVED, documented): the engine resolves villager combat
//     face-to-face on one tile; no per-villager position is read here.
//     - wild:   the monster's node (villagerMonsterTick jumps npcsOnNode(m.tx,
//               m.ty) — the villager is ON the monster's tile). game.js.
//     - patrol: the monster's node (resolvePatrol hunts the nearest world
//               monster TO its tile). game.js.
//     - raid:   the Haven tile (havenRaidTick teleports raiders to Haven:
//               m.tx=hx,m.ty=hy; defenders are drafted AT Haven).
//               havenGrowth.js.
//     - other:  null — unknown is unknown, never a friendly guess.
'use strict';

function cleanTile(t) {
  if (!t || t.x == null || t.y == null) return null;
  const x = Number(t.x), y = Number(t.y);
  if (!isFinite(x) || !isFinite(y)) return null;
  return { x, y };
}

// Chebyshev distance on the 9x9 world grid (grid steps, diagonal = 1).
function cheb(a, b) {
  a = cleanTile(a); b = cleanTile(b);
  if (!a || !b) return null;
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

// Villager-tile derivation rule (documented above).
function deriveVillagerTile(channel, monsterTile, havenTile) {
  const m = cleanTile(monsterTile), h = cleanTile(havenTile);
  if (channel === 'wild' || channel === 'patrol') return m;
  if (channel === 'raid') return h;
  return null;
}

// buildTileRow: snapshot -> answerable row. All pairwise chebyshev
// distances, plus the three #256 flags. attributed=false exactly when any
// direct-read tile is missing (derived villagerTile missing counts too —
// an 'other'-channel fight cannot answer #256).
function buildTileRow(o) {
  o = o || {};
  const monsterTile = cleanTile(o.monsterTile);
  const scholarTile = cleanTile(o.scholarTile);
  const havenTile = cleanTile(o.havenTile);
  const villagerTile = cleanTile(o.villagerTile != null
    ? o.villagerTile
    : deriveVillagerTile(o.channel, monsterTile, havenTile));
  const attributed = !!(monsterTile && scholarTile && havenTile && villagerTile);
  const d = (a, b) => cheb(a, b);
  return {
    seed: o.seed != null ? o.seed : null,
    day: o.day != null ? o.day : null,
    vid: String(o.vid || '?'),
    channel: String(o.channel || 'other'),
    monsterId: String(o.monsterId || '?'),
    wave: o.wave != null ? o.wave : null,
    outcome: o.outcome != null ? o.outcome : null,
    intent: o.intent != null ? o.intent : null,
    rounds: o.rounds != null ? o.rounds : null,
    monsterTile, villagerTile, scholarTile, havenTile,
    dVillagerHaven: d(villagerTile, havenTile),
    dVillagerScholar: d(villagerTile, scholarTile),
    dMonsterHaven: d(monsterTile, havenTile),
    dMonsterScholar: d(monsterTile, scholarTile),
    dScholarHaven: d(scholarTile, havenTile),
    // #256 flags (meaningful only when attributed):
    onHavenTile: attributed ? d(villagerTile, havenTile) === 0 : null,
    scholarAwayFromHaven: attributed ? d(scholarTile, havenTile) > 0 : null,
    scholarAwayFromDeath: attributed ? d(scholarTile, villagerTile) > 0 : null,
    scholarAtDeathTile: attributed ? d(scholarTile, villagerTile) === 0 : null,
    attributed,
  };
}

// Death filter — byte-identical to the siegeroster diagnostic's population:
// post-unlock villager (non-scholar, kind villager/person, NEVER monsters)
// combat deaths.
function isVillagerCombatDeath(d) {
  return d && (d.kind === 'villager' || d.kind === 'person') &&
    !d.player && (d.cause === 'monster' || d.cause === 'combat');
}

// pairDeathsToFights: each death finds its fatal fight. Greedy by vid:
// the unused vDie fight for the same vid with the smallest |day diff|
// (<= 1 day window — the death registers the same day as the fight; the
// window absorbs day-boundary spill). Each fight is consumed once
// (registerDeath's double-death guard means one death per vid per run).
// Returns { pairs: [{death, fight}], unmatched: [deaths] }.
function pairDeathsToFights(deaths, fights) {
  const dies = (fights || []).filter(f => f && f.outcome === 'vDie');
  const used = new Set();
  const pairs = [], unmatched = [];
  const sorted = (deaths || []).slice().sort((a, b) => (a.day || 0) - (b.day || 0));
  for (const d of sorted) {
    let best = -1, bestScore = 1e9;
    for (let i = 0; i < dies.length; i++) {
      if (used.has(i)) continue;
      const f = dies[i];
      if (String(f.vid) !== String(d.vid)) continue;
      const diff = Math.abs((f.day || 0) - (d.day || 0));
      if (diff > 1) continue;
      // Tie-break: a fatal fight starting AFTER the death was recorded is
      // causally impossible (one death per vid per run) — prefer the fight
      // on/before the death day. diff dominates; the +1 only breaks ties.
      const score = diff * 10 + ((f.day || 0) > (d.day || 0) ? 1 : 0);
      if (score < bestScore) { bestScore = score; best = i; }
    }
    if (best >= 0) { used.add(best); pairs.push({ death: d, fight: dies[best] }); }
    else unmatched.push(d);
  }
  return { pairs, unmatched };
}

// tileAttribution: the instrument-honesty rollup. A death is attributed
// iff it paired to a fight AND the fight's row is tile-attributed.
// byChannel splits pairs by fight channel; 'unpaired' carries deaths with
// no fatal fight (their channel is unknowable by this instrument).
function tileAttribution(pairs, unmatched) {
  const total = (pairs || []).length + (unmatched || []).length;
  const attr = (pairs || []).filter(p => p.fight && p.fight.attributed);
  const byChannel = {};
  for (const p of (pairs || [])) {
    const ch = (p.fight && p.fight.channel) || 'unknown';
    byChannel[ch] = byChannel[ch] || { n: 0, attributed: 0 };
    byChannel[ch].n++;
    if (p.fight.attributed) byChannel[ch].attributed++;
  }
  byChannel.unpaired = { n: (unmatched || []).length, attributed: 0 };
  return {
    total,
    attributed: attr.length,
    rate: total ? +(attr.length / total).toFixed(3) : null,
    byChannel,
  };
}

// answer256: THE question — "do wild deaths happen on the Haven tile when
// the scholar is away, or on wild tiles where villagers work?"
// Input: pairs whose fight channel is 'wild' and whose row is attributed.
// Output: a 2x2 that names the mechanism, never a narrative.
function answer256(pairs) {
  const wild = (pairs || []).filter(p =>
    p.fight && p.fight.channel === 'wild' && p.fight.attributed);
  const cell = (onHaven, scholarAway) => wild.filter(p =>
    p.fight.onHavenTile === onHaven && p.fight.scholarAwayFromHaven === scholarAway).length;
  const n = wild.length;
  const breakdown = {
    havenTile_scholarAway: cell(true, true),
    havenTile_scholarHome: cell(true, false),
    wildTile_scholarAway: cell(false, true),
    wildTile_scholarHome: cell(false, false),
  };
  // The siegeroster arm's assumption, stated as a falsifiable claim:
  const assumption = 'wild deaths happen at Haven (monsterTile==havenTile) while the scholar is away (scholarTile!=havenTile)';
  const assumptionHolds = breakdown.havenTile_scholarAway;
  return {
    n, breakdown,
    shareOnHavenTile: n ? +( (breakdown.havenTile_scholarAway + breakdown.havenTile_scholarHome) / n ).toFixed(3) : null,
    shareScholarAway: n ? +( (breakdown.havenTile_scholarAway + breakdown.wildTile_scholarAway) / n ).toFixed(3) : null,
    assumption,
    assumptionHolds,
    verdict: n === 0 ? 'no wild deaths measured — question unanswered'
      : assumptionHolds === n ? 'assumption CONFIRMED: all wild deaths on Haven tile with scholar away'
      : assumptionHolds === 0 ? 'assumption REFUTED: no wild death on Haven tile with scholar away'
      : 'assumption PARTIAL: ' + assumptionHolds + '/' + n + ' wild deaths on Haven tile with scholar away',
  };
}

// aggregateTiles: channel x tile table for the evidence file.
function aggregateTiles(pairs) {
  const chans = {};
  for (const p of (pairs || [])) {
    const f = p.fight; if (!f) continue;
    const ch = f.channel || 'unknown';
    chans[ch] = chans[ch] || { n: 0, attributed: 0, onHavenTile: 0, wildTile: 0, scholarAway: 0, scholarHome: 0 };
    const c = chans[ch];
    c.n++;
    if (f.attributed) {
      c.attributed++;
      if (f.onHavenTile) c.onHavenTile++; else c.wildTile++;
      if (f.scholarAwayFromHaven) c.scholarAway++; else c.scholarHome++;
    }
  }
  return chans;
}

module.exports = {
  cheb, cleanTile, deriveVillagerTile, buildTileRow,
  isVillagerCombatDeath, pairDeathsToFights, tileAttribution,
  answer256, aggregateTiles,
};
