#!/usr/bin/env node
// diverge-probe.js — find the first divergence day between control and
// SCHOLARDIST=1-armed runs on identical seeds, and whether the layer's
// wrapper perturbs anything before the first thin day.
//
// Runs each arm for DAYS days on the same seed, hashing a daily digest
// (pop, pantry kcal, fresh-days, scholar fullness/HP, death count, dayRng
// state) after each day. Reports the first day the digests differ and the
// first thin-day seen by the armed run.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const scholardist = require('./layers/scholardist-b');
const crypto = require('crypto');

const SEED = +(process.argv[2] || 67501);
const DAYS = +(process.argv[3] || 30);
const POLICY = process.argv[4] || 'leadfeast';

function digest(G) {
  const s = G.state;
  const v = s.village || {};
  const sch = s.scholar || {};
  const pop = (v.pop || []).length;
  const pan = Math.round(G.pantryKcal ? G.pantryKcal() : -1);
  const fd = +(G.pantryFreshDays ? G.pantryFreshDays().toFixed(2) : -1);
  const full = Math.round((sch.fullness || 0));
  const hp = Math.round((sch.hp || 0));
  const deaths = (s.deathLog || []).length;
  return [pop, pan, fd, full, hp, deaths].join('|');
}

async function run(arm) {
  const prev = process.env.SCHOLARDIST;
  if (arm === 'armed') process.env.SCHOLARDIST = '1'; else delete process.env.SCHOLARDIST;
  try {
    const { Game, manifest } = await loadGame({ seed: SEED, mode: 'diverge-' + arm });
    await setupGame(Game, 'Columbus, Ohio');
    const layer = scholardist.install(Game);
    const digests = [];
    const base = POLICY_REGISTRY[POLICY];
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => {
      digests.push(digest(G));
      if (origDaily) return origDaily(G, ctx);
    };
    await runDays(Game, policy, { days: DAYS, manifest });
    const tele = JSON.parse(JSON.stringify(layer.tele));
    layer.uninstall();
    return { digests, tele };
  } finally {
    if (prev === undefined) delete process.env.SCHOLARDIST;
    else process.env.SCHOLARDIST = prev;
  }
}

(async () => {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const c = await run('control');
  const a = await run('armed');
  let first = -1;
  const n = Math.min(c.digests.length, a.digests.length);
  for (let d = 0; d < n; d++) {
    if (c.digests[d] !== a.digests[d]) { first = d + 1; break; }
  }
  console.log(`seed=${SEED} policy=${POLICY} days ran: control=${c.digests.length} armed=${a.digests.length}`);
  console.log(`first divergence day: ${first === -1 ? 'NONE (digests identical)' : first}`);
  console.log(`armed tele: ${JSON.stringify({ halves: a.tele.halves, grants: a.tele.grants, grantedKcal: a.tele.grantedKcal, errors: a.tele.errors })}`);
  if (first > 0) {
    console.log('control d' + first + ': ' + c.digests[first - 1]);
    console.log('armed   d' + first + ': ' + a.digests[first - 1]);
  }
})().catch(e => { console.error('PROBE FAIL: ' + (e && e.stack || e)); process.exitCode = 1; });
