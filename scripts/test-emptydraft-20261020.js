#!/usr/bin/env node
// test-emptydraft-20261020.js — proof that the empty-draft census
// instrument attributes what it claims (fixture RED→GREEN).
//
// The fixture builds a fake Game whose havenRaidTick implements the
// engine's REAL defender-draft filter (copied from
// src/js/havenGrowth.js havenRaidTick, 2026-10-20 master:
//   const defenders = (v.roster || []).filter(id =>
//     id !== this.villagerId &&
//     !(v.away && v.away[id]) &&
//     !(this.isSheltered && this.isSheltered(id)) &&
//     ((v.health || {})[id] === undefined || (v.health || {})[id] > 40));
// — the proof pins instrument 'available' == engine draft ids on the
// same fixture, so parity is asserted, not assumed.
//
// Cases:
//   F1: all-away night — roster 6 (player + 5 away) -> 'all-away'
//   F2: mixed night — 2 away / 2 sheltered / 1 wounded -> 'mixed-away-sheltered'
//   F3: health edge — health exactly 40 is wounded; 41 is available
//   F4: say-capture — 2 "Nobody met" lines -> unmet 2; fight vids ->
//       engaged, surplus available -> benched
//   F5: player excluded from the draft even when healthy at home
//
// Usage: node scripts/test-emptydraft-20261020.js
'use strict';
const M = require('./measure-emptydraft-20261020');

let failures = 0;
function eq(actual, expected, label) {
  if (actual === expected) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

// The fixture engine: a faithful replica of the havenRaidTick draft
// filter + fight dispatch (one defender per raider, sequentially;
// unmet raiders get the "Nobody met" say line).
function fixtureGame(rosterCfg, opts) {
  // rosterCfg: [{id, away, sheltered, health}...] plus playerId
  opts = opts || {};
  const v = { roster: [], away: {}, health: {} };
  const shelteredSet = new Set();
  for (const r of rosterCfg) {
    v.roster.push(r.id);
    if (r.away) v.away[r.id] = true;
    if (r.sheltered) shelteredSet.add(String(r.id));
    if (r.health !== undefined) v.health[r.id] = r.health;
  }
  const G = {
    state: { village: v, scholar: { day: 59 } },
    villagerId: opts.playerId || 'scholar',
    isSheltered: (id) => shelteredSet.has(String(id)),
    pantryKcalLive: () => 9000,
    havenTier: () => 0,
    _fightVids: [],
    _sayLines: [],
    say(line) { this._sayLines.push(String(line)); },
    resolveWildMonsterEncounter(vid, m, o) { this._fightVids.push(String(vid)); return { outcome: 'vKill' }; },
    havenRaidTick() {
      const vv = this.state.village;
      const defenders = (vv.roster || []).filter(id =>
        String(id) !== String(this.villagerId) &&
        !(vv.away && vv.away[id]) &&
        !(this.isSheltered && this.isSheltered(id)) &&
        ((vv.health || {})[id] === undefined || (vv.health || {})[id] > 40));
      const raiders = (opts.raiders || []).slice();
      let di = 0;
      for (const m of raiders) {
        if (di < defenders.length) {
          const d = defenders[di++];
          this.resolveWildMonsterEncounter(d, m, { raid: true });
        } else {
          this.say(`Nobody met ${m} — it's still out there at the treeline. It'll gorge every night until it's driven off.`);
        }
      }
      this._engineDraft = defenders.map(String);
      return true;
    },
  };
  return G;
}

function runCensus(G, rosterCfg, opts) {
  const C = { raidNights: [], _fights: [], _says: [], _tickId: 0, instrumentErrors: 0 };
  M.installRaidCensus(G, C);
  G.havenRaidTick();
  if (C.raidNights.length !== 1) { failures++; console.log(`  FAIL census: expected 1 raid-night record, got ${C.raidNights.length}`); return null; }
  return C.raidNights[0];
}

console.log('F1 — all-away night attributes all-away');
{
  const cfg = [
    { id: 'scholar' },
    { id: 'v1', away: true }, { id: 'v2', away: true }, { id: 'v3', away: true },
    { id: 'v4', away: true }, { id: 'v5', away: true },
  ];
  const G = fixtureGame(cfg, { playerId: 'scholar', raiders: ['Murk', 'Loud'] });
  const rn = runCensus(G, cfg);
  if (rn) {
    eq(rn.engaged, 0, 'F1 engaged=0');
    eq(rn.unmet, 2, 'F1 unmet=2 (the engine said Nobody met x2)');
    eq(rn.raiders, 2, 'F1 raiders=2');
    eq(rn.attribution, 'all-away', 'F1 attribution');
    // parity: instrument 'available' ids == engine draft ids
    const avail = rn.comp.filter(r => r.cat === 'available' || r.cat === 'engaged' || r.cat === 'benched').map(r => r.id).sort().join(',');
    eq(avail, G._engineDraft.slice().sort().join(','), 'F1 instrument-available == engine draft');
  }
}

console.log('F2 — mixed night (2 away / 2 sheltered / 1 wounded) attributes mixed-away-sheltered');
{
  const cfg = [
    { id: 'scholar' },
    { id: 'v1', away: true }, { id: 'v2', away: true },
    { id: 'v3', sheltered: true }, { id: 'v4', sheltered: true },
    { id: 'v5', health: 12 },
  ];
  const G = fixtureGame(cfg, { playerId: 'scholar', raiders: ['Murk', 'Loud', 'Static'] });
  const rn = runCensus(G, cfg);
  if (rn) {
    eq(rn.engaged, 0, 'F2 engaged=0');
    eq(rn.attribution, 'mixed-away-sheltered', 'F2 attribution');
    const awayN = rn.counts.away, shN = rn.counts.sheltered, wN = rn.counts.wounded;
    eq([awayN, shN, wN].join(','), '2,2,1', 'F2 composition counts');
  }
}

console.log('F3 — health edge: 40 is wounded, 41 is available (engine parity)');
{
  const cfg = [
    { id: 'scholar' },
    { id: 'v1', health: 40 }, { id: 'v2', health: 41 },
  ];
  const G = fixtureGame(cfg, { playerId: 'scholar', raiders: ['Murk'] });
  const rn = runCensus(G, cfg);
  if (rn) {
    const cats = {}; for (const r of rn.comp) cats[r.id] = r.cat;
    eq(cats.v1, 'wounded', 'F3 health=40 -> wounded');
    eq(cats.v2, 'engaged', 'F3 health=41 -> available -> engaged (1 raider)');
  }
}

console.log('F4 — 3 available / 2 raiders: 2 engaged, 1 benched; unmet captured');
{
  const cfg = [
    { id: 'scholar' },
    { id: 'v1' }, { id: 'v2' }, { id: 'v3' },
    { id: 'v4', away: true },
  ];
  const G = fixtureGame(cfg, { playerId: 'scholar', raiders: ['Murk', 'Loud'] });
  const rn = runCensus(G, cfg);
  if (rn) {
    eq(rn.engaged, 2, 'F4 engaged=2');
    eq(rn.counts.benched, 1, 'F4 benched=1 (surplus available)');
    eq(rn.unmet, 0, 'F4 unmet=0');
    eq(rn.attribution, 'mixed-engaged-away', 'F4 attribution (engaged 2/4, then away)');
  }
}

console.log('F5 — the player is never drafted, even healthy at home');
{
  const cfg = [
    { id: 'scholar' }, // healthy, at home — engine excludes the villagerId
    { id: 'v1' },
  ];
  const G = fixtureGame(cfg, { playerId: 'scholar', raiders: ['Murk', 'Loud'] });
  const rn = runCensus(G, cfg);
  if (rn) {
    const cats = {}; for (const r of rn.comp) cats[r.id] = r.cat;
    eq(cats.scholar, 'player', 'F5 scholar counted as player');
    eq(rn.engaged, 1, 'F5 engaged=1 (only v1)');
    eq(rn.unmet, 1, 'F5 unmet=1');
  }
}

console.log(failures ? `PROOF: FAIL (${failures} failures)` : 'PROOF: ALL PASS');
process.exit(failures ? 1 : 0);
