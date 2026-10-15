#!/usr/bin/env node
// repro-havendehy-20261015.js — REPRODUCE finding #320 (loop B ARM 2, 2026-10-15):
// belongseek s606 d51 — Nathan Costa died of dehydration AT HAVEN
// (neverAway=true, dist=1) with pack=0 and cistern clean=20.
// PRISTINE base (no layers), rangedehy instrument ON. Dumps the FULL
// attribution record (trajectory3d, verbs3d, refusedFills, location, beats)
// so the mechanism autopsy reads from measured data, not guesses.
// Usage: node scripts/repro-havendehy-20261015.js   (writes /tmp/havendehy-repro-s606.json)
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installRangeDehy } = require('./rangedehy-lib-20261015');
// ARMED side mirrors the rfconfirm sweep: RANGEREFILL=1 wraps the base policy
// (rangerefill.js gate-on exports). PRISTINE (default) uses belongseek bare.
let policy, policyId;
if (process.env.RANGEREFILL === '1') {
  policy = require('./policies/rangerefill').rangerefillBelongseek;
  policyId = 'rangerefill-belongseek';
} else {
  policy = require('./policies/belongseek').belongseek;
  policyId = 'belongseek';
}

async function main() {
  const seed = 606;
  const { Game } = await loadGame({ seed, mode: 'havendehy-repro-' + policyId, fullTelemetry: false });
  await setupGame(Game);
  const track = installRangeDehy(Game);
  let dailyCalls = 0;
  const pwrap = Object.assign({}, policy);
  const od = policy.daily;
  pwrap.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, pwrap, { days: 60, sampleEvery: 10 }); });
  const fin = track.finalize();
  const out = {
    seed, policyId, dailyCalls, gameDays: Game.state.scholar.day,
    scholarName: (Game.data.villagers || []).find(x => x.id === Game.villagerId) || null,
    nDehydration: fin.nDehydration, coverage: fin.coverage,
    deaths: fin.deaths,          // full attribution records
    refusedFillsAll: fin.refusedFills,
    verbsAll: fin.verbsAll,
    instrErrors: fin.instrErrors,
  };
  fs.writeFileSync('/tmp/havendehy-repro-s606.json', JSON.stringify(out, null, 1));
  console.log('dailyCalls=' + dailyCalls, 'days=' + out.gameDays,
    'nDehydration=' + fin.nDehydration,
    'names=' + fin.deaths.map(d => d.scholarName + ' d' + d.day + ' ranging=' + d.ranging).join(';'));
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
