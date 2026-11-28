// policies/competent-capstonedeliver-a.js — sim-capstoneready-a leg 2.
// Competent verbatim PLUS the tribute delivery verb, nothing else.
// POLICY-SIDE ONLY. ZERO src/js changes.
//
// The verb: at the START of daily() — dawn, at Haven, before
// competent.daily() runs the day's trips — if no capstone is
// delivered yet AND the military tribute reads DELIVERABLE
// (ready AND payable >= 2, re-read live through
// ladderCapstoneReady('military_tribute')), call
// ladderDeliverCapstone('military_tribute') once and record the
// attempt on the exported deliveryAttempts array (day, kind, ok,
// reason, veterans, names). The delivery function itself carries no
// location guard; the policy places the call where the player would
// make it (the Haven panel, at dawn), and the placement matters for
// the prediction: leg 1's readiness was snapshotted at the top of
// each day, so the verb is attempted on the same dawn read.
//
// The policy NEVER delivers when merely ready (the scholar-veteran
// split: ready with payable < 2 must stay undelivered), NEVER
// attempts charter/feast (never ready on this band), and NEVER
// delivers twice (after a success ladderCapstoneDelivered() is
// non-null and the gate stays shut; a refusal is also recorded,
// and the policy retries on later deliverable dawns — a refusal on
// a deliverable day is a finding, not a silent retry loop: the
// attempt log shows every try).
//
// A GO verdict here means GO CANDIDATE as an instrument — landing
// this as competent play is a coordinator/Steve call, NOT made by
// this arm. No default flips.
'use strict';
const { competent } = require('./competent');

const KIND = 'military_tribute';

// deliveryAttempts: the attempt log, in call order. The driver reads
// it after runDays. Entries are plain JSON (no wall-clock fields) so
// per-seed rows stay byte-identical across reruns. Reset per run by
// the driver (see resetDeliveryAttempts); a policy module is
// process-scoped, and leg-2 drivers run one seed per process, so the
// log cannot leak across seeds — but the reset exists anyway so a
// proof test that runs two villages in one process stays honest.
const deliveryAttempts = [];
function resetDeliveryAttempts() { deliveryAttempts.length = 0; }

function gdayOf(Game) {
  try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }
  catch (e) { return 0; }
}

function tryDeliverTribute(Game) {
  const day = gdayOf(Game);
  try {
    if (typeof Game.ladderCapstoneDelivered === 'function' && Game.ladderCapstoneDelivered()) return null;
    if (typeof Game.ladderCapstoneReady !== 'function' || typeof Game.ladderDeliverCapstone !== 'function') return null;
    let read = null;
    try { read = Game.ladderCapstoneReady(KIND); } catch (e) { return null; }
    if (!read || !read.ready) return null; // not ready: no attempt, no log
    if (((read.payable | 0) < 2)) return null; // ready but NOT deliverable (scholar-veteran split): no attempt, no log
    let res = null;
    try { res = Game.ladderDeliverCapstone(KIND); } catch (e) { res = { ok: false, kind: KIND, reason: 'deliver-threw:' + String((e && e.message) || e).slice(0, 80) }; }
    const attempt = {
      day, kind: KIND,
      ok: !!(res && res.ok),
      reason: (res && typeof res.reason === 'string') ? res.reason : (res && res.ok ? 'delivered' : 'unknown'),
      veterans: (res && Array.isArray(res.veterans)) ? res.veterans.slice() : null,
      names: (res && Array.isArray(res.names)) ? res.names.slice() : null,
    };
    deliveryAttempts.push(attempt);
    return attempt;
  } catch (e) {
    deliveryAttempts.push({ day, kind: KIND, ok: false, reason: 'policy-threw:' + String((e && e.message) || e).slice(0, 80), veterans: null, names: null });
    return null;
  }
}

const competentCapstonedeliver = Object.assign({}, competent, {
  id: 'competent-capstonedeliver-a',
  desc: 'competent verbatim + military-tribute delivery verb at dawn (sim-capstoneready-a leg 2)',
  daily(Game, ctx) {
    tryDeliverTribute(Game);
    return competent.daily(Game, ctx);
  },
});

module.exports = { competentCapstonedeliver, deliveryAttempts, resetDeliveryAttempts, tryDeliverTribute };
