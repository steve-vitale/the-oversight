#!/usr/bin/env node
// sim-routing-panel.js — Triage A4-routing panel for sim-routing-gap
// (2026-10-27, gap-closure item: villagers routed to known monsters).
//
// MEASUREMENT ONLY. No game behaviour changes here: the objPick /
// objDepart wraps only write down what the game already decided, draw
// no extra random numbers, and never throw into the game (every read
// is guarded). The wraps are installed after loadGame and before
// setupGame, so they see every errand pick and departure in the run.
//
// What counts:
//   - HUNT departure: objDepart called with an objective whose kind is
//     'HUNT'. A routed trip counts only on departure, not on the pick
//     (a pick that danger-defers never leaves Haven).
//   - Provenance: a HUNT departure is knowledge-gated only when the
//     departing objective itself carries huntMid / huntTx / huntTy from
//     that villager's own fight memory, with huntTx/huntTy equal to the
//     departure target. Anything else is counted as unprovenanced and
//     fails the panel's negative control.
//   - Coincidence: a non-HUNT, non-GUARD departure whose target tile
//     holds a living world monster at departure time. The villager did
//     not aim at the monster; this is reported separately and never
//     counted as a routed trip.
//   - Guard: a GUARD departure to a monster tile (a companion walking
//     with a leader) is reported separately, never as an independent
//     routed trip.
//   - Duties: departures by errand kind, so food/social work can be
//     compared baseline vs after.
//
// Usage:
//   SEEDS=101,102 DAYS=90 LABEL=baseline OUT=evidence/2026-10-27/sim-routing-panel-baseline.json \
//     node scripts/sim-routing-panel.js
// Defaults: SEEDS=101..112, DAYS=90, LABEL=routing-panel, OUT under
// evidence/2026-10-27/sim-routing-panel-<LABEL>.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '90', 10) || 90;
const LABEL = process.env.LABEL || 'routing-panel';
const OUT = process.env.OUT || path.join(REPO, 'evidence', '2026-10-27', 'sim-routing-panel-' + LABEL + '.json');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function monsterTiles(Game) {
  const set = new Set();
  try {
    const pool = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (const m of pool) { if (m && m.tx != null && m.ty != null) set.add(m.tx + ',' + m.ty); }
  } catch (e) {}
  return set;
}
function sightingCount(Game) {
  try {
    const s = ((Game.state || {}).village || {}).monsterSightings || {};
    let n = 0; for (const k of Object.keys(s)) n += (s[k] || []).length;
    return n;
  } catch (e) { return 0; }
}

async function oneRun(seed) {
  const store = {
    picks: [], departures: [], censusDays: [],
    huntPicks: 0, huntDepartures: 0, huntDeparturesUnprovenanced: 0,
    coincidenceDepartures: 0, guardToMonsterDepartures: 0,
    departuresByKind: {}, errors: 0,
  };
  const { Game } = await loadGame({ seed, mode: 'routing-gap', fullTelemetry: false });
  // Install source wraps before setupGame so no pick/departure is missed.
  try {
    const origPick = Game.objPick ? Game.objPick.bind(Game) : null;
    if (origPick) {
      Game.objPick = function (vid, hx, hy) {
        const o = origPick(vid, hx, hy);
        try {
          const rec = { day: dayOf(Game), vid: vid, kind: o && o.kind, tx: o && o.tx, ty: o && o.ty,
            huntMid: o && o.huntMid, huntTx: o && o.huntTx, huntTy: o && o.huntTy, huntDay: o && o.huntDay };
          store.picks.push(rec);
          if (rec.kind === 'HUNT') store.huntPicks++;
        } catch (e) { store.errors++; }
        return o;
      };
    }
  } catch (e) { store.errors++; }
  try {
    const origDepart = Game.objDepart ? Game.objDepart.bind(Game) : null;
    if (origDepart) {
      Game.objDepart = function (vid, obj, hx, hy, playerAtHaven) {
        const tiles = monsterTiles(Game);
        const r = origDepart(vid, obj, hx, hy, playerAtHaven);
        try {
          const kind = obj && obj.kind;
          const tx = obj && obj.tx, ty = obj && obj.ty;
          const onMonster = (tx != null && ty != null) && tiles.has(tx + ',' + ty);
          const rec = { day: dayOf(Game), vid: vid, kind: kind, purpose: obj && obj.purpose, tx: tx, ty: ty,
            departed: r === true, onMonsterTile: onMonster,
            huntMid: obj && obj.huntMid, huntTx: obj && obj.huntTx, huntTy: obj && obj.huntTy, huntDay: obj && obj.huntDay };
          store.departures.push(rec);
          if (r === true) {
            store.departuresByKind[kind] = (store.departuresByKind[kind] || 0) + 1;
            if (kind === 'HUNT') {
              store.huntDepartures++;
              const ok = !!(obj && obj.huntMid && obj.huntTx === tx && obj.huntTy === ty);
              if (!ok) store.huntDeparturesUnprovenanced++;
            } else if (kind === 'GUARD') {
              if (onMonster) store.guardToMonsterDepartures++;
            } else if (onMonster) {
              store.coincidenceDepartures++;
            }
          }
        } catch (e) { store.errors++; }
        return r;
      };
    }
  } catch (e) { store.errors++; }

  // Wrapper policy: competent behaviour unchanged, plus a daily census.
  const policy = Object.assign({}, competent, {
    id: competent.id,
    daily(Game2, ctx) {
      let r;
      try { r = competent.daily ? competent.daily(Game2, ctx) : undefined; } catch (e) { throw e; }
      try {
        const objs = (typeof Game2.objState === 'function') ? Game2.objState() : {};
        const kinds = {};
        for (const k of Object.keys(objs)) { const kind = (objs[k] && objs[k].kind) || 'idle'; kinds[kind] = (kinds[kind] || 0) + 1; }
        store.censusDays.push({ day: dayOf(Game2), kinds: kinds, sightings: sightingCount(Game2),
          monsters: monsterTiles(Game2).size });
      } catch (e) { store.errors++; }
      return r;
    },
  });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let gameDays = 0, livingNpcs = 0;
  try { gameDays = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  try {
    const v = (Game.state || {}).village || {};
    livingNpcs = (v.roster || []).filter(id => {
      if (id === Game.villagerId) return false;
      try { const vp = Game.vpOf ? Game.vpOf(id) : null; return !(vp && vp.dead); } catch (e) { return true; }
    }).length;
  } catch (e) {}
  return { seed, days: DAYS, gameDays, endReason: result && result.endReason,
    livingNpcs, sightingsAtEnd: sightingCount(Game), store };
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const row = await oneRun(seed);
    rows.push(row);
    console.log(`seed ${seed}: gameDays=${row.gameDays} huntPicks=${row.store.huntPicks} huntDepartures=${row.store.huntDepartures} huntUnprov=${row.store.huntDeparturesUnprovenanced} coincidence=${row.store.coincidenceDepartures} guardToMonster=${row.store.guardToMonsterDepartures} sightingsEnd=${row.sightingsAtEnd} departures=${JSON.stringify(row.store.departuresByKind)}`);
  }
  const totals = { huntPicks: 0, huntDepartures: 0, huntDeparturesUnprovenanced: 0,
    coincidenceDepartures: 0, guardToMonsterDepartures: 0, departuresByKind: {}, errors: 0 };
  for (const row of rows) {
    totals.huntPicks += row.store.huntPicks;
    totals.huntDepartures += row.store.huntDepartures;
    totals.huntDeparturesUnprovenanced += row.store.huntDeparturesUnprovenanced;
    totals.coincidenceDepartures += row.store.coincidenceDepartures;
    totals.guardToMonsterDepartures += row.store.guardToMonsterDepartures;
    totals.errors += row.store.errors;
    for (const k of Object.keys(row.store.departuresByKind)) totals.departuresByKind[k] = (totals.departuresByKind[k] || 0) + row.store.departuresByKind[k];
  }
  let commit = 'unknown';
  try { commit = require('child_process').execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
  const out = { label: LABEL, seeds: SEEDS, days: DAYS, commit, totals, rows };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log('TOTALS ' + JSON.stringify(totals));
  console.log('wrote ' + OUT);
}
main().catch(e => { console.error('sim-routing-panel FAILED: ' + (e && e.stack || e)); process.exit(1); });
