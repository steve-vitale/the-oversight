// fifthlink-r26 — tend-first layer on 5th+ lead links (fifthlink-r26 arm, 2026-10-14).
//
// Opt-in policy-side layer, gate: FIFTHLINK=1 (default OFF — unset exports
// fourthlink unchanged, so the file is inert unless the gate is on).
//
// Recreation of r22's fifthlink.js (deleted per kill protocol; rebuilt fresh
// from the r22 evidence description in evidence/2026-10-14/sim-fifthlink.md):
// the tend-vs-decay race on 5th+ primary-Haven links. r22 PROVED the race can
// be won (scripted race 24->14 baseline vs 24->54 layered) but KILLED the arm
// at pilot on a miscalibrated GO (absolute >=2/8 demanded ~100% conversion on
// forming seeds); the named next step was "use forming-seeds as denominator"
// — this arm (r26) is that next run.
//
// The layer sits on fourthlink (FOURTHLINK=1 uncapped courtship) and runs
// AFTER its daily pass, honest engine verbs only, no engine edits:
//
// 1. Young-link grief, answered: answerRenegotiation(link.id, 'gift'|'visit')
//    on live primary-Haven links with a staged beat — gift (1,500 kcal, +8,
//    same pricing as a tend) when the pantry can carry it (> 8000 kcal),
//    visit (+5/+2, speaker rides out 2 days or word-and-promises) otherwise.
//    Baseline leadcourt never clicks these beats: unanswered beats expire
//    aloud after 7 days (trust -6 each).
// 2. Thin-first tends at the lower gate: the base tends every link at pantry
//    > 20000 and none below; the layer tends THIN links first when the pantry
//    sits between the courtship floor + one tend price (13500) and the fat
//    gate (20000) — never spending below 12000. Thin = trust<30, or 2+
//    short-tribute weeks in the last 3 read from the link's own tribute
//    history ("paid thin:" / "paid nothing" notes). tendedWeek dedups against
//    the base's pass, so no link is tended twice in one week.
'use strict';

const FIFTHLINK = process.env.FIFTHLINK === '1';
const { fourthlink } = require('./fourthlink');

// Gate off: this module is inert — the fourthlink policy, same object.
if (!FIFTHLINK) {
  module.exports = { fifthlink: fourthlink };
  return;
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

// linkIsThin: trust under 30, or the link's own recent tribute history shows
// 2+ short weeks in the last 3 ("paid thin:" / "paid nothing" notes).
function linkIsThin(link) {
  try {
    if (!link) return false;
    if ((link.trust | 0) < 30) return true;
    const hist = (link.history || []).filter(h => h && h.kind === 'tribute');
    const last3 = hist.slice(-3);
    let short = 0;
    for (const h of last3) {
      const note = String(h.note || '');
      if (note.indexOf('paid thin') >= 0 || note.indexOf('paid nothing') >= 0) short++;
    }
    return short >= 2;
  } catch (e) { return false; }
}

function fifthlinkLayer(Game, ctx) {
  try {
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    const week = (Game._week ? Game._week() : 0);

    // 1. Answer young-link grief beats first — expiry is time-driven (7 days).
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      if (link.primary !== 'haven') continue;
      if (!link.pendingRenegotiation || !Game.answerRenegotiation) continue;
      const how = pantryKcal(Game) > 8000 ? 'gift' : 'visit';
      try {
        Game.answerRenegotiation(link.id, how);
        ctx['renegAnswered_' + how] = (ctx['renegAnswered_' + how] || 0) + 1;
      } catch (e) {}
    }

    // 2. Thin-first tends at the lower gate. The base's fat-gate pass
    //    (pantry > 20000) already ran inside fourthlink.daily; tendedWeek
    //    dedups, so no link is ever tended twice in one week. Pantry is
    //    re-read per tend so a multi-thin-link week never spends below 12000.
    if (Game.tendLink) {
      for (const link of links) {
        const pk = pantryKcal(Game);
        if (pk <= 13500 || pk > 20000) break;  // outside the lower-gate band
        if (!link || link.status !== 'active') continue;
        if (link.primary !== 'haven') continue;
        if (link.tendedWeek === week) continue;
        if (!linkIsThin(link)) continue;
        try {
          Game.tendLink(link.id);
          ctx.fifthTended = (ctx.fifthTended || 0) + 1;
        } catch (e) {}
      }
    }
  } catch (e) {}
}

const fifthlink = Object.assign({}, fourthlink, {
  id: 'fifthlink-r26',
  desc: 'fourthlink + tend-first layer: answered young-link grief + thin-first tends at the lower gate (FIFTHLINK=1)',
  daily(Game, ctx) {
    fourthlink.daily(Game, ctx);
    fifthlinkLayer(Game, ctx);
  },
});

module.exports = { fifthlink, fifthlinkLayer, linkIsThin };
