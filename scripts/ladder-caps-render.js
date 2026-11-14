'use strict';
// ladder-caps-render.js — render one ladder-file `caps:` column honestly.
//
// The ladder instrument snapshots per-kind readiness from
// Game.ladderCapstoneReady(kind). That read returns reason 'delivered' for
// EVERY kind once ANY capstone is delivered (ladder.js: the delivery is
// one-shot by design — table.js refuses a second delivery — so every
// capstone road is closed once one is delivered, and the UI's "A capstone
// is already delivered — the seat is open" line is correct for every
// button). The old driver rendering printed that reason verbatim per kind,
// so a ladder line read `caps: trade_charter=delivered,
// feast_embassy=delivered, military_tribute=delivered` on the same line
// whose `delivered=` field named the one real delivery (r196 seed 135203
// d140) — the caps column collapsed a global state into per-kind state.
//
// This renderer distinguishes them: the delivered kind renders
// 'delivered'; any other kind whose reason is 'delivered' renders
// 'seat-open' (the seat is open because another capstone delivered); a
// ready kind renders 'ready'; anything else renders its reason. The
// `delivered=` field on the same line stays the authority for which kind
// delivered. Pure function, no game state — proof-tested directly.
const DELIVERY_ORDER = ['trade_charter', 'feast_embassy', 'military_tribute'];
function renderCaps(d) {
  if (!d || !d.capstones) return 'caps=-';
  const parts = [];
  for (const k of DELIVERY_ORDER) {
    const c = d.capstones[k];
    if (!c) { parts.push(k + '=?'); continue; }
    if (d.delivered === k) { parts.push(k + '=delivered'); continue; }
    if (c.ready) { parts.push(k + '=ready'); continue; }
    if (c.reason === 'delivered') { parts.push(k + '=seat-open'); continue; }
    parts.push(k + '=' + (c.reason || '?'));
  }
  return parts.join(',');
}
module.exports = { renderCaps, DELIVERY_ORDER };
