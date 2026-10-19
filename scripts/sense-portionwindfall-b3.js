#!/usr/bin/env node
// sense-portionwindfall-b3.js — capture windfall beats on the sweep's own
// substrate (same hooks as sweep-portionwindfall-b3.js, including the
// neutered registerDeath recorder the whole portionwindfall line uses).
// SEED=<seed> POLICY=leadfeast|belongfeast DAYS=180
// Env: FEASTSCALE_R13=1 SEATDRIVE=0 PORTIONWINDFALL=1 (asserted).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { withPortionWindfall } = require('./policies/portionwindfall');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.PORTIONWINDFALL !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1 SEATDRIVE=0 PORTIONWINDFALL=1 required');
  process.exit(2);
}
const POLICIES = {
  leadfeast: withPortionWindfall(leadfeast, 't', 't'),
  belongfeast: withPortionWindfall(belongfeast, 't', 't'),
};
const POLICY = POLICIES[process.env.POLICY || 'leadfeast'];
const SEED = parseInt(process.env.SEED || '7208', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'portionwindfall-b3-' + (process.env.POLICY || 'leadfeast'), fullTelemetry: false });
  await setupGame(Game);
  // sweep-identical hooks
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') { /* recorded by analyzer; neutered like the sweep */ }
    } catch (e) {}
  };
  const lines = [];
  const oSay = Game.say;
  Game.say = function (s) {
    const str = String(s);
    if (/won't keep till tomorrow|FEAST|🍖/i.test(str)) lines.push('d' + ((Game.state.scholar || {}).day || 0) + ': ' + str.slice(0, 500));
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, POLICY);
  let ctxCap = null;
  const oUp = policy.upkeep;
  policy.upkeep = (G, ctx) => { ctxCap = ctx; return oUp(G, ctx); };
  await runDays(Game, policy, { days: DAYS, manifest: null });
  console.log('seed=' + SEED + ' fires=' + ((ctxCap && ctxCap._pwFeasts) || 0) +
    ' fireDays=[' + ((ctxCap && ctxCap._pwFireDays) || []).slice(0, 20).join(',') + '...]');
  let shown = 0;
  for (let i = 0; i < lines.length && shown < 8; i++) {
    if (/won't keep till tomorrow/.test(lines[i])) {
      console.log(lines[i]);
      if (lines[i + 1]) console.log('  > ' + lines[i + 1].slice(0, 320));
      console.log('');
      shown++;
    }
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(2); });
