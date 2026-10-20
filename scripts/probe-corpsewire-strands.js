#!/usr/bin/env node
// scripts/probe-corpsewire-strands.js — strand autopsy for arm sim-corpsewire-b.
//
// Re-runs the 3 strand seeds (leadfeast/s31702, belongfeast/s31707,
// belongfeast/s31708) with wire instruments + a daily scan that records, for
// each wire-depositing corpse: death node, whether the scholar ever stood on
// that node while the corpse existed (freshness window), and the corpse's
// final fate. Decides the CORPSEWIRE layer shape:
//   - scholar visited the node but never looted -> in-range/timing gap
//     (loot pass runs only in daily() at haven) -> layer can fix honestly.
//   - scholar never visited -> knowledge/routing gap -> needs omniscience
//     or new knowledge (game-code, not policy-side).
//
// READ-ONLY instruments. TOOLING ONLY.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const { instrumentWire, wireUnitsOf } = require('./corpsewire-instruments');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROBE STOP: SEATDRIVE=0 required.'); process.exit(2); }

const CASES = [
  ['leadfeast', 31702],
  ['belongfeast', 31707],
  ['belongfeast', 31708],
];

async function main() {
  for (const [pid, seed] of CASES) {
    const { Game } = await loadGame({ seed, mode: 'cw-strandprobe-' + pid });
    await setupGame(Game);
    const W = instrumentWire(Game);
    const wireCorpses = new Map(); // cid -> {node, dayDied, who}
    // TRUE VISITATION (not just daily-time position): wrap travelTo and
    // record every node the scholar steps on, per day.
    const visited = new Map(); // "x,y" -> Set of days
    const oTravel = Game.travelTo;
    Game.travelTo = function (x, y) {
      const r = oTravel.apply(this, arguments);
      try {
        const day = (this.state.scholar || {}).day || 0;
        const k = this.map.px + ',' + this.map.py;
        if (!visited.has(k)) visited.set(k, new Set());
        visited.get(k).add(day);
      } catch (e) {}
      return r;
    };
    const oReg = Game.registerDeath;
    Game.registerDeath = function (opts) {
      const c = oReg.apply(this, arguments);
      try {
        if (c && c.id && wireUnitsOf(c.items) > 0) {
          wireCorpses.set(c.id, {
            node: { x: c.node.x, y: c.node.y }, dayDied: c.dayDied, who: c.villagerId || c.name,
            visitedDays: 0, inRangeDays: 0, deathKnown: !!c.deathKnown,
          });
        }
      } catch (e) {}
      return c;
    };
    const base = POLICY_REGISTRY[pid];
    const haven = { x: 4, y: 4 };
    try { haven.x = (Game.state.village.px != null ? Game.state.village.px : 4); haven.y = (Game.state.village.py != null ? Game.state.village.py : 4); } catch (e) {}
    const wrapped = Object.assign({}, base, {
      daily(G, ctx) {
        let r;
        if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
        try {
          const day = (G.state.scholar || {}).day || 0;
          const px = G.map.px, py = G.map.py;
          for (const c of (G.corpses() || [])) {
            const rec = wireCorpses.get(c.id);
            if (!rec || c.looted || c.buried) continue;
            if (c.node.x === px && c.node.y === py) {
              rec.visitedDays++;
              try { if (G._corpseCheckRange(c, true) !== false) rec.inRangeDays++; } catch (e) {}
            }
            if (!rec.deathKnown && c.deathKnown) rec.deathKnown = true;
          }
        } catch (e) {}
        return r;
      },
    });
    let result;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: 180, sampleEvery: 10 }); });
    console.log(`\n=== ${pid} s${seed}: ${result.days}d ${result.endReason} (haven=${haven.x},${haven.y})`);
    for (const [cid, rec] of wireCorpses) {
      const c = (Game.corpses() || []).find(x => x.id === cid);
      const took = W.lootedByCorpse.get(cid) || 0;
      const nk = rec.node.x + ',' + rec.node.y;
      const vdays = visited.get(nk);
      const visitList = vdays ? Array.from(vdays).sort((a, b) => a - b) : [];
      const afterDeath = visitList.filter(d => d >= rec.dayDied);
      console.log(`  ${rec.who} d${rec.dayDied} node=(${rec.node.x},${rec.node.y}) ` +
        `nodeVisitsAfterDeath=${afterDeath.length}${afterDeath.length ? ' (days ' + afterDeath.slice(0, 8).join(',') + (afterDeath.length > 8 ? '...' : '') + ')' : ''} ` +
        `inRangeAtDaily=${rec.inRangeDays} ` +
        `deathKnown=${rec.deathKnown} took=${took} ` +
        `final=${c ? (c.looted ? 'looted' : (wireUnitsOf(c.items) > 0 ? 'STILL-HOLDS-WIRE' : 'empty')) : 'gone'}`);
    }
  }
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
