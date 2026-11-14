// linklines-capture.js — segmented link-line capture for sim recorders
// (sim-holdrealm-b, 2026-11-14).
//
// THE PROBLEM: recorders cap the general link-line buffer (150 in the
// diploverb driver, 600 in the answercourt driver) and the cap is hit on
// chatter long before the late-horizon events that matter. In the
// answercourt confirm corpus, 5 of 7 realm dissolutions left NO captured
// dissolution line — the cap was already hit days earlier — so the
// sense-testing of those dissolutions had to be inferred from the per-day
// series instead of read in the villagers' words.
//
// THE FIX: a second, small ring buffer that keeps ONLY the dissolution
// episode — the lines that say a realm is coming apart, a speaker died,
// the mantle moved, or a bond is cooling — and keeps them even after the
// general buffer is full. The general buffer is untouched (same cap, same
// regex, same output shape); the episode buffer is an ADDITIVE field
// (`dissolutionLines`) on the per-seed JSON, so existing consumers are
// unaffected. A future driver adopts it by requiring this module and
// calling push() from its Game.say wrapper; see the diploverb driver.
//
// Usage:
//   const { createLinkCapture } = require('./linklines-capture');
//   const cap = createLinkCapture({ cap: 150, episodeCap: 60 });
//   cap.push(day, line);            // call for every Game.say string
//   cap.linkLines;                  // general buffer (capped, first-N)
//   cap.episodeLines;               // dissolution-episode ring (last-N)
'use strict';

// Lines that belong to a realm-dissolution episode. Deliberately narrow:
// the dissolution itself, the funeral that triggers it, the drift warning
// that precedes it, and the succession leverage that follows it. NOT the
// everyday tribute/feast chatter — that is what fills the general buffer.
const EPISODE_RE = /realm came apart|world feed goes quiet|fire is drifting|bond with .* is cooling|dead hold no treaties|mantle just\.\.\. transfers|presses the tribute down|installs their own speaker|yoke is thrown off|neglected link snaps/i;

function createLinkCapture(opts) {
  const o = opts || {};
  const cap = (typeof o.cap === 'number') ? o.cap : 150;
  const episodeCap = (typeof o.episodeCap === 'number') ? o.episodeCap : 60;
  const linkRe = o.linkRe || /tend|season|polity|realm|trust|tribute|feast|link|bond|accord|court|drift|bow|table|seat|lesser/i;
  const linkLines = [];
  const episodeLines = [];
  return {
    linkLines,
    episodeLines,
    push: function (day, line) {
      if (typeof line !== 'string') return;
      if (EPISODE_RE.test(line)) {
        episodeLines.push({ day: day | 0, line: line.slice(0, 400) });
        if (episodeLines.length > episodeCap) episodeLines.shift();
      }
      if (linkRe.test(line) && linkLines.length < cap) {
        linkLines.push({ day: day | 0, line: line.slice(0, 400) });
      }
    },
  };
}

module.exports = { createLinkCapture, EPISODE_RE };
