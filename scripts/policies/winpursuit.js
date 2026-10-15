// winpursuit — table pursuit layer (sim-wintrace PHASE 2, 2026-10-15,
// sim-findings #233).
//
// Closes the concrete policy gap the wintrace diagnostic named: on the
// courtship roads (leadfeast/belongfeast — the roads that actually REACH
// the table) the table modal is NEVER answered. 8/8 table-reaching traced
// runs ended with the modal pending: 0 answers, modal streaks 14–119
// days, pathsEntered empty. Only winseek's tableRoad drives the modal, and
// winseek never reaches the table on this tip. The win was UNATTEMPTED.
//
// Env-gated WINPURSUIT=1 (default OFF — unset delegates to the base policy
// byte-identically; the proof pins that). The layer: at the START of
// daily, drain the table modal with winseek's tableRoad — the proven drain
// (answers until no choice pending / 30-answer cap / stall guard / fight
// starts; never picks the trial — options[0] is never the trial door,
// verified on current src/js/table-*.js: only table-feared.js offers a
// trial and it is pushed LAST in its beat's choice list).
//
// The drain answers options[0] throughout — it PLAYS the challenge, it
// does not play it well. Branch/choice quality is a separate lever; this
// layer closes the "unattempted" gap only.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';
const FS = require('./feastscale');
const { tableRoad } = require('./winseek');

function layerOn() { return process.env.WINPURSUIT === '1'; }

function policyForRun() {
  const pid = String(process.env.POLICY || 'belongseek').toLowerCase();
  return pid.indexOf('lead') === 0 ? FS.leadfeast : FS.belongfeast;
}

function withWinPursuit(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      // Answer the table FIRST (dawn): the finale is time-sensitive — the
      // winseek comment documents a seed lost to a 4-day unanswered modal
      // (finals pending, bearer died that night). Never sleep between beats.
      try { tableRoad(Game, ctx); } catch (e) {}
      return base.daily(Game, ctx);
    },
  });
}

const leadpursuit = withWinPursuit(FS.leadfeast, 'leadfeast-winpursuit',
  'leadfeast + table pursuit (WINPURSUIT=1): drives the table modal via winseek tableRoad');
const belongpursuit = withWinPursuit(FS.belongfeast, 'belongfeast-winpursuit',
  'belongfeast + table pursuit (WINPURSUIT=1): drives the table modal via winseek tableRoad');

module.exports = { layerOn, policyForRun, withWinPursuit, tableRoad, leadpursuit, belongpursuit };
