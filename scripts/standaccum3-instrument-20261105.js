// standaccum3-instrument-20261105.js — standing-decomposition diag
// instrument (arm sim-standaccum3-b, run fleshout-loop-b-20261105T0830Z).
// DIAGNOSTIC ONLY, zero src/js. Wraps the vetprod instrument VERBATIM
// (same fight wrappers, same snapshots, same finalize) and extends each
// daily snapshot with the standing DECOMPOSITION: the honest breakdown
// (war/diplomacy/plenty + warPts/links/feasts), the per-wave ledger
// points + wave-3 per-type map, the link roll (total/seasoned/
// regional+), the feast-log quality histogram, the plenty-capped
// total, the peak wave, and the defer4/defer5 hold objects — so the
// gated number on any day can be traced to a named input or a named
// hold. Pure reads, except the daily villageStandingTotal() call the
// vetprod snapshot already makes (peak release + hold beats, parity
// with standaccum/standaccum2). Wrappers never throw into game code.
// Usage: const INST = require('./standaccum3-instrument-20261105');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';
const VETPROD = require('./vetprod-instrument-20261104');

function install(Game) {
  const base = VETPROD.install(Game);
  const t = base.t;

  function decomp(snap) {
    try {
      const s = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
      if (s) {
        snap.war = (s.war | 0); snap.diplomacy = (s.diplomacy | 0); snap.plenty = (s.plenty | 0);
        snap.warPts = (s.warPts | 0); snap.links = (s.links | 0); snap.feasts = (s.feasts | 0);
      } else { snap.war = null; snap.diplomacy = null; snap.plenty = null; snap.warPts = null; snap.links = null; snap.feasts = null; }
    } catch (e) { snap.war = null; snap.diplomacy = null; snap.plenty = null; t.instrumentErrors.push('decomp-standing: ' + String(e.message).slice(0, 80)); }
    try {
      snap.w3pts = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(3) | 0) : null;
      snap.w4pts = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(4) | 0) : null;
      snap.w5pts = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(5) | 0) : null;
    } catch (e) { snap.w3pts = null; snap.w4pts = null; snap.w5pts = null; t.instrumentErrors.push('decomp-ledgerpts: ' + String(e.message).slice(0, 80)); }
    try {
      const L = (typeof Game.ledgerState === 'function') ? Game.ledgerState() : null;
      const pt3 = (L && L[3] && L[3].perType) || {};
      snap.perType3 = Object.assign({}, pt3);
      const pt4 = (L && L[4] && L[4].perType) || {};
      snap.perType4 = Object.assign({}, pt4);
    } catch (e) { snap.perType3 = null; snap.perType4 = null; t.instrumentErrors.push('decomp-pertype: ' + String(e.message).slice(0, 80)); }
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      snap.linksTotal = ls.length;
      let seasoned = 0, regional = 0;
      for (const l of ls) {
        let isSeas = false;
        try { isSeas = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!l.conquered) : false; } catch (e2) { isSeas = false; }
        if (isSeas) {
          seasoned++;
          try { if (typeof Game._linkRegionalPlus === 'function' && Game._linkRegionalPlus(l)) regional++; } catch (e2) {}
        }
      }
      snap.linksSeasoned = seasoned;
      snap.linksRegionalDirect = regional;
    } catch (e) { snap.linksTotal = null; snap.linksSeasoned = null; snap.linksRegionalDirect = null; t.instrumentErrors.push('decomp-links: ' + String(e.message).slice(0, 80)); }
    try {
      const log = ((Game.state || {}).feastLog) || [];
      snap.feastLogLen = log.length;
      const hist = {};
      for (const f of log) { const q = ((f && f.quality) | 0); hist[q] = (hist[q] | 0) + 1; }
      snap.feastQualityHist = hist;
    } catch (e) { snap.feastLogLen = null; snap.feastQualityHist = null; t.instrumentErrors.push('decomp-feasts: ' + String(e.message).slice(0, 80)); }
    try { snap.capped = (typeof Game.standingPlentyCappedTotal === 'function') ? (Game.standingPlentyCappedTotal() | 0) : null; } catch (e) { snap.capped = null; t.instrumentErrors.push('decomp-capped: ' + String(e.message).slice(0, 80)); }
    try { snap.peak = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : null; } catch (e) { snap.peak = null; t.instrumentErrors.push('decomp-peak: ' + String(e.message).slice(0, 80)); }
    try {
      const d4 = (typeof Game.standingDeferral === 'function') ? Game.standingDeferral(4) : null;
      const d5 = (typeof Game.standingDeferral === 'function') ? Game.standingDeferral(5) : null;
      snap.defer4 = d4 ? { deferred: !!d4.deferred, ready: !!d4.ready, short: (d4.bars && d4.bars.short) || d4.short || null, raw: d4.raw, threshold: d4.threshold, grandfathered: !!d4.grandfathered } : null;
      snap.defer5 = d5 ? { deferred: !!d5.deferred, ready: !!d5.ready, short: (d5.bars && d5.bars.short) || d5.short || null, raw: d5.raw, capped: d5.capped, threshold: d5.threshold, grandfathered: !!d5.grandfathered } : null;
    } catch (e) { snap.defer4 = null; snap.defer5 = null; t.instrumentErrors.push('decomp-defer: ' + String(e.message).slice(0, 80)); }
    return snap;
  }

  function snapshot() {
    const snap = base.snapshot();
    return decomp(snap);
  }

  function finalize() {
    const out = base.finalize();
    try {
      const s = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
      out.standingBreakdown = s;
      out.w3pts = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(3) | 0) : null;
      out.w4pts = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(4) | 0) : null;
      out.w5pts = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(5) | 0) : null;
      const L = (typeof Game.ledgerState === 'function') ? Game.ledgerState() : null;
      out.perType3 = (L && L[3] && L[3].perType) ? Object.assign({}, L[3].perType) : null;
      out.perType4 = (L && L[4] && L[4].perType) ? Object.assign({}, L[4].perType) : null;
      out.perType5 = (L && L[5] && L[5].perType) ? Object.assign({}, L[5].perType) : null;
      const log = ((Game.state || {}).feastLog) || [];
      out.feastLog = log.map(function (f) { return { quality: (f && f.quality) | 0, day: (f && f.day) || null }; });
    } catch (e) { t.instrumentErrors.push('decomp-finalize: ' + String(e.message).slice(0, 80)); }
    return out;
  }

  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: base.uninstall, decomp: decomp };
}

module.exports = { install: install };
