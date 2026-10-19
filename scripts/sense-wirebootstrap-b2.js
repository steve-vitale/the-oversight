#!/usr/bin/env node
// scripts/sense-wirebootstrap-b2.js — SENSE-TESTING for the wirebootstrap arm.
// v2: wraps Game.say/sysSay with an UNBOUNDED capture (the engine's Game.log
// ring caps at ~40 entries, so early-day hawker conversations scroll off).
// Runs 3 armed seeds (31705/31707/31708 belongfeast — the engaging ones) with
// narration ON for ~35 days, then dumps captured lines mentioning hawkers,
// wire, snares, traps. Read them like a player. TOOLING ONLY.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const wb = require('./policies/wirebootstrap');

const SEEDS = [31705, 31707, 31708];
const DAYS = 35;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'wirebootstrap-sense-b2');

async function main() {
  if (!wb.layerOn()) { console.error('SENSE STOP: WIREBOOTSTRAP=1 required'); process.exit(2); }
  fs.mkdirSync(OUTDIR, { recursive: true });
  const base = POLICY_REGISTRY['belongfeast'];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'wirebootstrap-sense', narration: true });
    await setupGame(Game);
    const senseLog = [];
    const cap = (fn) => function () {
      try { senseLog.push(Array.prototype.map.call(arguments, String).join(' ')); } catch (e) {}
      return fn.apply(this, arguments);
    };
    Game.say = cap(Game.say.bind(Game));
    Game.sysSay = cap(Game.sysSay.bind(Game));
    // capture hawker ware offers as the layer sees them
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
    const policy = wb.withWireBootstrap(base, 'belongfeast-wb');
    let ctxRef = null;
    const wrapped = Object.assign({}, policy, {
      setup(G, ctx) { ctxRef = ctx; if (policy.setup) return policy.setup(G, ctx); },
      daily(G, ctx) { if (!ctxRef) ctxRef = ctx; return policy.daily ? policy.daily(G, ctx) : undefined; },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS }); });
    const day = (() => { try { return Game.state.scholar.day; } catch (e) { return '?'; } })();
    const lines = senseLog.filter(t => /hawker|wire|snare|trap/i.test(t));
    const out = [
      `# sense transcript: belongfeast s${seed}, WIREBOOTSTRAP=1, ${DAYS}d (reached day ${day})`,
      `# wb telemetry: hawkerChecks=${(ctxRef && ctxRef._wbHawkerChecks) || 0} wireWares=${(ctxRef && ctxRef._wbWireWares) || 0} wireBought=${(ctxRef && ctxRef._wbWireBought) || 0} wireHeldDay=${(ctxRef && ctxRef._wbWireHeldDay) || 'null'} wireSets=${(ctxRef && ctxRef._wbWireSets) || 0} done=${(ctxRef && ctxRef._wbDone) || 'null'}`,
      `# ${lines.length} matching captured lines out of ${senseLog.length} total`,
      '',
      ...lines,
    ].join('\n');
    fs.writeFileSync(path.join(OUTDIR, `sense-belongfeast-s${seed}.md`), out);
    console.log(`s${seed}: day ${day}, ${lines.length}/${senseLog.length} matching lines`);
  }
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
