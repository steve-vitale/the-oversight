#!/usr/bin/env node
// sense-repairrate-b.js — SENSE-TESTING LAW transcript capture for sim-repairrate-b.
//
// Re-runs one seed/policy/arm with full say-line capture so a human can READ
// the succession beats, beat-gift answers, and realm (non-)dissolution
// narratives for meaning and coherence — never just counts.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 [REPAIRRATE=1 SUCCPOLITY=1] \
//   SEED=8806 POLICY=leadfeast-repairrate DAYS=180 OUT=/tmp/sense-rr-8806.txt \
//   node scripts/sense-repairrate-b.js
// Then READ the transcript yourself.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { leadfeast_repairrate, belongfeast_repairrate } = require('./policies/repairrate');
const { dayOf } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1, SEATDRIVE=0, SURPLUSFEED=1 required');
  process.exit(2);
}
const POLICIES = {
  leadfeast, belongfeast,
  'leadfeast-repairrate': leadfeast_repairrate,
  'belongfeast-repairrate': belongfeast_repairrate,
};
const POLICY_ID = process.env.POLICY || 'leadfeast-repairrate';
const POLICY = POLICIES[POLICY_ID];
if (!POLICY) { console.error('FATAL: unknown POLICY ' + POLICY_ID); process.exit(2); }
const SEED = parseInt(process.env.SEED || '8806', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || '/tmp/sense-repairrate-b.txt';

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-repairrate-b', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (text) {
    try { lines.push(`[d${dayOf(Game)}] ${String(text)}`); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  // tag beat-gift answers and lapses distinctly
  const oAns = Game.answerRenegotiation;
  if (typeof oAns === 'function') Game.answerRenegotiation = function (id, how) {
    try { lines.push(`[d${dayOf(Game)}] <<< POLICY answers succession beat on ${id} with '${how}'`); } catch (e) {}
    return oAns.apply(this, arguments);
  };
  const result = await runDays(Game, POLICY, { days: DAYS, manifest: null });
  // filter to the beats that matter: succession, renegotiation, tribute,
  // tending, realm/court/national, dissolution
  const keep = lines.filter(l =>
    /succession|renegot|beat|silence|tribute|tend|grain|realm|court|national|polity|dissolv|mourning|funeral|speaker|trust/i.test(l));
  const header = [
    `SENSE seed=${SEED} policy=${POLICY_ID} days=${result.days} end=${result.endReason}`,
    `REPAIRRATE=${process.env.REPAIRRATE || 'off'} SUCCPOLITY=${process.env.SUCCPOLITY || 'off'}`,
    `captured ${lines.length} say-lines, ${keep.length} realm-relevant`,
    '',
  ].join('\n');
  fs.writeFileSync(OUT, header + keep.join('\n') + '\n');
  console.log(`wrote ${OUT} (${keep.length} realm-relevant lines)`);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
