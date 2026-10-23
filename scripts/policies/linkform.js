// linkform — leadcourt with LINKFORM-gated courtship levers (sim-links-diag,
// axis scale-onramp, run fleshout-20261023T1015Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: LINKFORM unset, '0', or '1' →
// the daily delegates to leadcourt.daily through the identical code path
// (byte-identical behavior; the det-gate in scripts/test-linksdiag-pilot.js
// pins that).
//
// LINKFORM=2 (overcourt): court to 5 subordinate links (was stop-at-3); tend
//   all weekly. Attacks the DIAG's 8 dissolution events (-102 steps,
//   including armed s65518's 4x form/dissolve loop): with 5 links, one link
//   dipping below the trust-40 seasoned bar no longer dissolves the polity
//   (dip drops 34, not 102).
//
// KILLED (2026-10-23 pilot NO-GO, wrong lever — removed, no trace):
// LINKFORM=1 (cadence: propose from day 15, 2/day, tend every 3 days, always
// sweeten) BACKFIRED — 6 vs 7 formations, starvation 6 vs 2, dissolutions
// 4 vs 1. Root cause: the extra courtship spends pantry (accord gifts, 2.3x
// tends, always-sweeten) and forms links faster than the trust/tend economy
// can season them. The binding is the HOLD, not the attempt rate.
// Evidence: evidence/2026-10-23/sim-links-diag.md.
//
// Exact numbers (lever discipline): propose tribute 4000 kcal/week (unchanged);
// tend 1500 kcal → +8 trust (engine; unchanged); pantry gates unchanged
// (propose >12000, tend >20000, sweeten-always 1500 kept-or-lost per engine).
'use strict';
const { competent } = require('./competent');
const { leadcourt } = require('./leadcourt');
const FS = require('./feastscale');
const TF = require('./tribfloor');
const WD = require('./windefer');
const SD = require('./seatdrive');
const AD = require('./armorydrive');
const AV = require('./armorvillage');

function linkformMode() {
  try {
    // NOTE: '1' (cadence) was KILLED 2026-10-23 — it now behaves as off.
    const v = String((typeof process !== 'undefined' && process.env && process.env.LINKFORM) || '0');
    if (v === '2') return 2;
    return 0;
  } catch (e) { return 0; }
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function popAlive(Game) {
  try { return ((Game.state.village || {}).roster || []).length; } catch (e) { return 0; }
}

// linkformCourtship: leadcourt's courtship with the LINKFORM parameters.
// mode 0/1 are never reached here (daily delegates to leadcourt directly).
function linkformCourtship(Game, ctx, mode) {
  try {
    const day = gday(Game);
    const st = Game.state;
    // answer pending offers/beats — a competent player answers, never leaves mail unread
    if (st.pendingCounter && Game.answerCounter) {
      const rich = pantryKcal(Game) > 25000;
      try { Game.answerCounter(rich ? 'sweeten' : 'accept'); } catch (e) {}
      ctx.courtCounters = (ctx.courtCounters || 0) + 1;
    }
    if (st.pendingAccord && Game.answerAccord) {
      try { Game.answerAccord('gift'); } catch (e) {}
      ctx.courtAccords = (ctx.courtAccords || 0) + 1;
    }
    if (st.pendingNational && Game.answerNationalChoice) {
      const shape = st.pendingNational.shape;
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: 'sign' }[shape] || 'feast';
      try { Game.answerNationalChoice(pick); } catch (e) {}
      ctx.courtNational = (ctx.courtNational || 0) + 1;
    }
    if (st.pendingGlobal && Game.answerGlobalChoice) {
      try { Game.answerGlobalChoice('feast'); } catch (e) {}
      ctx.courtGlobal = (ctx.courtGlobal || 0) + 1;
    }
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    const week = (Game._week ? Game._week() : 0);
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      // TEND OUR SUBORDINATES: the LEAD road's engine.
      if (link.primary === 'haven' && Game.tendLink) {
        if (link.tendedWeek !== week && pantryKcal(Game) > 20000) {
          try { Game.tendLink(link.id); } catch (e) {}
          ctx.tended = (ctx.tended || 0) + 1;
        }
      }
      if (link.pendingDefense && Game.answerDefenseCall) {
        const canSend = popAlive(Game) >= 5;
        try { Game.answerDefenseCall(link.id, canSend ? 'send' : 'refuse'); } catch (e) {}
        ctx.defenseCalls = (ctx.defenseCalls || 0) + 1;
      }
    }
    // LEAD courtship: LINKFORM=2 courts to 5 subordinate links (was stop-at-3);
    // everything else is leadcourt's.
    const proposeFrom = 25;
    const subCap = (mode === 2) ? 5 : 3;
    const perDay = 1;
    if (day >= proposeFrom && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal(Game) > 12000) {
      const active = links.filter(l => l && l.status === 'active');
      const subs = active.filter(l => l.primary === 'haven' && !l.conquered).length;
      if (subs >= subCap) return;
      ctx._leadCool = ctx._leadCool || {};
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
      let made = 0;
      for (const t of cands) {
        if (made >= perDay) break;
        if ((ctx._leadCool[t.id] || 0) + 7 > day) continue;
        ctx._leadCool[t.id] = day;
        try { Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }); } catch (e) {}
        ctx.proposedLead = (ctx.proposedLead || 0) + 1;
        made++;
      }
    }
  } catch (e) {}
}

const linkform = Object.assign({}, competent, {
  id: 'linkform',
  desc: 'leadcourt + LINKFORM-gated courtship levers (1=cadence, 2=overcourt; default off = leadcourt)',
  daily(Game, ctx) {
    const mode = linkformMode();
    if (mode === 0) return leadcourt.daily(Game, ctx); // gate off: pure delegation
    competent.daily(Game, ctx);
    linkformCourtship(Game, ctx, mode);
  },
});

// linkformArmedFor: the census chain with the linkform base swapped in —
// feastscale -> tribfloor -> windefer -> seatdrive -> armorydrive ->
// armorvillage, same order and env gates as AV.armedFor('leadfeast'), so the
// ONLY delta between the baseline leg and the LINKFORM legs is the base.
function linkformArmedFor() {
  const fs = FS.withFeastScale(linkform, 'linkform-feast',
    'linkform + r13 feast layer (FEASTSCALE_R13=1): tribute/tend count as feast contribution');
  const tf = TF.withTribFloor(fs, 'linkform-feast-tribfloor',
    'linkform-feast + tribfloor (TRIBFLOOR=1): tribute payments never leave the pantry below the 2-day floor');
  const wd = WD.withWinDefer(tf, 'linkform-feast-windefer',
    'linkform-feast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const sd = SD.withSeatDrive(wd, 'linkform-feast-seat',
    'linkform-feast + seat drive (SEATDRIVE=0: pure delegation)');
  const ad = AD.withArmoryDrive(sd, 'linkform-armorydrive',
    'linkform-feast-seat + ARMORYDRIVE (ARMORYDRIVE=1): the non-seat long substrate\'s armory drive');
  return AV.withArmorVillage(ad, 'linkform-armorvillage',
    'linkform-armorydrive + ARMORVILLAGE=1 (armor structure)');
}

module.exports = { linkform, linkformMode, linkformArmedFor, linkformCourtship };
