#!/usr/bin/env node
// scripts/sense-wireacquire-b3.js — SENSE-TESTING for the wireacquire arm.
// Wraps Game.say/sysSay with an UNBOUNDED capture (the engine's Game.log
// ring caps at ~40 entries, so early-day trade conversations scroll off).
// Runs armed seeds with narration ON for ~35 days, then dumps captured
// lines mentioning hawkers, wire, snares, traps, asks. Read them like a
// player: does the ask read as a person asking? Is the refusal polite? Is
// the "(The snare wire becomes the snare — improvised, 2 uses.)" honesty
// intact? TOOLING ONLY.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 WIREACQUIRE=1 node scripts/sense-wireacquire-b3.js [seed...]
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
// KILL RECORD (2026-10-19, sim-wireacquire-b3): layer KILLED-AT-PILOT,
// scripts/policies/wireacquire.js deleted zero-trace. Kept as instrument.
let wa = null;
try { wa = require('./policies/wireacquire'); }
catch (e) { console.log('LAYER DELETED (killed at pilot 2026-10-19); see evidence/2026-10-19/sim-wireacquire-b3.md'); process.exit(0); }

const SEEDS = process.argv.slice(2).map(Number).filter(Boolean);
if (!SEEDS.length) SEEDS.push(31711, 31712, 31713);
const DAYS = 35;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'wireacquire-sense-b3');

const KEEP = /hawker|wire|snare|trap|trade|deal|Got anything/i;

async function main() {
  if (!wa.layerOn()) { console.error('SENSE STOP: WIREACQUIRE=1 required'); process.exit(2); }
  fs.mkdirSync(OUTDIR, { recursive: true });
  const base = POLICY_REGISTRY['belongfeast'];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'wireacquire-sense', narration: true });
    await setupGame(Game);
    const senseLog = [];
    const cap = (fn) => function () {
      try { senseLog.push(Array.prototype.map.call(arguments, String).join(' ')); } catch (e) {}
      return fn.apply(this, arguments);
    };
    Game.say = cap(Game.say.bind(Game));
    Game.sysSay = cap(Game.sysSay.bind(Game));
    const oOffer = Game.hawkerOffer ? Game.hawkerOffer.bind(Game) : null;
    if (oOffer) Game.hawkerOffer = function (vid) {
      const w = oOffer(vid);
      try {
        const day = ((Game.state || {}).scholar || {}).day;
        senseLog.push(`[hawkerOffer d${day} vid=${vid} ware=${w && w.itemId} price=${w && w.price} sold=${w && w.sold}]`);
      } catch (e) {}
      return w;
    };
    const oSetTrap = Game.setTrap ? Game.setTrap.bind(Game) : null;
    if (oSetTrap) Game.setTrap = function (rid) {
      const r = oSetTrap(rid);
      try {
        const day = ((Game.state || {}).scholar || {}).day;
        senseLog.push(`[setTrap d${day} recipe=${rid} result=${r ? 'OK' : 'refused'}]`);
      } catch (e) {}
      return r;
    };
    const policy = wa.withWireAcquire(base, 'belongfeast-wa');
    let ctxRef = null;
    const wrapped = Object.assign({}, policy, {
      setup(G, ctx) { ctxRef = ctx; if (policy.setup) return policy.setup(G, ctx); },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS }); });
    const kept = senseLog.filter(l => KEEP.test(l));
    const header = [
      `# sense transcript — wireacquire b3, belongfeast s${seed}, ${DAYS}d, narration on`,
      `layer telemetry: checks=${ctxRef._waHawkerChecks || 0} asks=${ctxRef._waAsks || 0} refusals=${ctxRef._waAskRefusals || 0} wares=${ctxRef._waWireWares || 0} bought=${ctxRef._waWireBought || 0} sets=${ctxRef._waWireSets || 0}`,
      `raw captured lines: ${senseLog.length}, kept: ${kept.length}`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(OUTDIR, `belongfeast-s${seed}.txt`), header + kept.join('\n') + '\n');
    console.log(`  s${seed}: ${senseLog.length} lines captured, ${kept.length} kept`);
  }
  console.log('wrote ' + OUTDIR);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
