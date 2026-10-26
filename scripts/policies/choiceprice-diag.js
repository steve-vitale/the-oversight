// choiceprice-diag — choice-price gap recorder for the scale-onramp
// axis (sim-choiceprice-a, 2026-10-26, flesh-out loop, DIAG ONLY:
// zero src/js changes, policy-side only).
//
// QUESTION (the 1040Z run's next blank #1, carried from
// sim-hunttable-a): driving off a feast draw silently forfeits
// feastSurgeUsed, the deed the lesser seat prices, and nothing
// in the game names that deed as the price of the choice. This
// recorder censuses the choice itself: every feast grant and its
// draw, every draw offer line, every drive-off (and face) with
// the deed state before/after, and every buff expiry that strands
// an unspent devotion — so the gap can be measured, not asserted.
//
// MECHANISM, READ FROM CODE (never invented):
//   - grantFeastBuff (feastBuff.js): a FRESH armed grant calls
//     drawFeastScavenger once; a refresh never draws. The draw
//     offer line is said by drawFeastScavenger itself.
//   - drawFeastScavenger: sets s.feastDraw + pendingEncounter +
//     pendingMonsterId and says the offer line ("Face it while
//     the feast is in you — or let the watch drive it off").
//   - faceFeastDraw: startCombat, then deletes s.feastDraw.
//   - driveOffFeastDraw: deletes s.feastDraw, clears the pending
//     encounter, says the drive-off line ("The devotion stays
//     armed..."). Every policy drive-off path (intercept,
//     precheck, pending) funnels through this one function, so
//     one wrapper catches all of them. No fight, no devotion
//     spent, buff stays live until its dawn.
//   - clearFeastBuff(expired): deletes s.feastBuff; a still-
//     circling draw dies with the buff. Expiry with
//     feastSurgeUsed still false is the forfeiture completing:
//     the devotion's window closed unspent.
//   - feastSurgeUsed marks ONLY in _spendFeastedPower
//     (feastBuff.js), via noteFeastedCombatUse / landed bonus
//     healing — never on grant, face, drive-off, or expiry.
//
// OBSERVATIONAL ONLY. The wraps record AROUND the original
// calls and return the original value untouched; they draw no
// RNG, write nothing to game state (store arrays only, plus one
// installed-flag on the Game object, the same class other
// recorders use), and never throw into the engine (a recording
// error is counted; an engine throw from the wrapped function
// itself is recorded and RETHROWN unchanged). The say wrapper
// captures matching lines only and always delegates. The sweep's
// daily wrapper calls base.daily exactly once, in the same
// position, and records only from pure reads (tableSeat /
// tablePreview pricing, progState fields, scholar.prog).
'use strict';

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}
function deedState(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const pg = s.prog || {};
    const b = s.feastBuff || null;
    return {
      feastSurgeUsed: !!pg.feastSurgeUsed,
      feastSurgeArmed: pg.feastSurge != null ? pg.feastSurge : null,
      buffLive: !!(b && typeof b === 'object'),
      buffUntilDay: b ? (b.untilDay != null ? b.untilDay : null) : null,
      buffUsed: b ? !!b.used : null,
      sentimentTaught: false, // filled by the sweep's progState read, not here
    };
  } catch (e) { return { feastSurgeUsed: false, err: true }; }
}
function liveDraw(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const d = s.feastDraw || null;
    if (!d || !d.monsterId) return null;
    return {
      monsterId: String(d.monsterId), veteran: !!d.veteran, day: d.day != null ? d.day : null,
      pendingEncounter: !!Game.pendingEncounter,
      pendingMonsterId: Game.pendingMonsterId || null,
    };
  } catch (e) { return null; }
}

const SAY_RE = /feast|scavenger|drive off|drove off|table|surge|food-thesis|ledger still wants|being set|circling the edge/i;

function newStore() {
  return {
    grants: [], offers: [], driveoffs: [], faces: [], expiries: [],
    sayLines: [], errs: [], errors: [],
    installed: {},
  };
}

function installChoicepriceDiag(Game, store) {
  if (!Game || !store) return false;
  try {
    if (Game._cpDiagInstalled) return true;
  } catch (e) {}
  // --- Game.say capture (matching lines only; always delegates).
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        let t = '';
        try { t = String((arguments.length ? arguments[0] : '') || ''); } catch (e) { t = ''; }
        try {
          if (t && SAY_RE.test(t) && store.sayLines.length < 600) {
            store.sayLines.push({ day: dayOf(Game), text: t.slice(0, 600) });
          }
        } catch (e) { try { store.errs.push('say:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
        return origSay.apply(this, arguments);
      };
      store.installed.say = true;
    }
  } catch (e) { try { store.errs.push('install-say:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
  // --- grantFeastBuff: grant + draw + deed before/after.
  try {
    const orig = Game.grantFeastBuff;
    if (typeof orig === 'function') {
      Game.grantFeastBuff = function () {
        const before = deedState(Game);
        const beforeDraw = liveDraw(Game);
        let r = null, threw = null;
        try { r = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          const after = deedState(Game);
          const rec = {
            day: dayOf(Game), granted: !!(r && r.granted), refreshed: !!(r && r.refreshed),
            mult: r ? (r.mult != null ? r.mult : null) : null,
            untilDay: r ? (r.untilDay != null ? r.untilDay : null) : null,
            quality: r ? (r.quality != null ? r.quality : null) : null,
            draw: r ? (r.draw || null) : null,
            drawPendingAfter: liveDraw(Game),
            before: before, after: after,
          };
          store.grants.push(rec);
          // The offer line is said by drawFeastScavenger during the
          // grant; join it here from the just-captured say lines.
          if (rec.draw) {
            for (let i = store.sayLines.length - 1; i >= 0; i--) {
              const sl = store.sayLines[i];
              if (sl.day === rec.day && /circling the edge of the light/i.test(sl.text)) {
                store.offers.push({ day: rec.day, monsterId: rec.draw, text: sl.text });
                break;
              }
            }
          }
        } catch (e) { try { store.errs.push('grant:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
        if (threw) throw threw;
        return r;
      };
      store.installed.grant = true;
    }
  } catch (e) { try { store.errs.push('install-grant:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
  // --- driveOffFeastDraw: EVERY drive-off path funnels through here.
  try {
    const orig = Game.driveOffFeastDraw;
    if (typeof orig === 'function') {
      Game.driveOffFeastDraw = function () {
        const before = deedState(Game);
        const beforeDraw = liveDraw(Game);
        const sayMark = store.sayLines.length;
        let r = null, threw = null;
        try { r = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          const after = deedState(Game);
          const said = store.sayLines.slice(sayMark).map(s => s.text);
          // Join the offer line: the most recent circling line for
          // this monster (or the most recent offer at all).
          let offer = null;
          for (let i = store.sayLines.length - 1; i >= 0; i--) {
            const sl = store.sayLines[i];
            if (/circling the edge of the light/i.test(sl.text)) { offer = sl.text; break; }
          }
          store.driveoffs.push({
            day: dayOf(Game), ok: !!(r && r.ok), drivenOff: !!(r && r.drivenOff),
            draw: beforeDraw, before: before, after: after,
            deedForfeitedSoFar: !before.feastSurgeUsed && !after.feastSurgeUsed,
            offerText: offer, driveoffLines: said,
          });
        } catch (e) { try { store.errs.push('driveoff:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
        if (threw) throw threw;
        return r;
      };
      store.installed.driveoff = true;
    }
  } catch (e) { try { store.errs.push('install-driveoff:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
  // --- faceFeastDraw: expected ~0 under driveoff-clean (intercept
  // replaces it; the fallback path still calls this wrapper).
  try {
    const orig = Game.faceFeastDraw;
    if (typeof orig === 'function') {
      Game.faceFeastDraw = function () {
        const before = deedState(Game);
        const beforeDraw = liveDraw(Game);
        let r = null, threw = null;
        try { r = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          store.faces.push({
            day: dayOf(Game), ok: !!(r && r.ok), monsterId: (r && r.monsterId) || null,
            draw: beforeDraw, before: before, after: deedState(Game),
          });
        } catch (e) { try { store.errs.push('face:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
        if (threw) throw threw;
        return r;
      };
      store.installed.face = true;
    }
  } catch (e) { try { store.errs.push('install-face:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
  // --- clearFeastBuff: buff expiry = forfeiture completion when the
  // deed is still unmarked. Note: feastedActive() calls this lazily,
  // so the recorded day is the first day the engine observes expiry.
  try {
    const orig = Game.clearFeastBuff;
    if (typeof orig === 'function') {
      Game.clearFeastBuff = function () {
        const before = deedState(Game);
        const beforeDraw = liveDraw(Game);
        const expiredArg = arguments.length ? arguments[0] : undefined;
        let r = null, threw = null;
        try { r = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          store.expiries.push({
            day: dayOf(Game), expiredArg: expiredArg === undefined ? null : !!expiredArg,
            drawPendingBefore: beforeDraw, before: before, after: deedState(Game),
            deedStillUnmarked: !before.feastSurgeUsed && !deedState(Game).feastSurgeUsed,
          });
        } catch (e) { try { store.errs.push('expiry:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
        if (threw) throw threw;
        return r;
      };
      store.installed.clear = true;
    }
  } catch (e) { try { store.errs.push('install-clear:' + String((e && e.message) || e).slice(0, 80)); } catch (e2) {} }
  try { Game._cpDiagInstalled = true; } catch (e) {}
  return true;
}

module.exports = { newStore, installChoicepriceDiag, dayOf, deedState, liveDraw };
