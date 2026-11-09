// /tmp/r122-preload.js — r122 walk diagnostic (READ-ONLY w.r.t. the repo).
// Preloaded via `node -r /tmp/r122-preload.js scripts/journey-scale-r113-20261109.js`.
// Wraps sim-harness loadGame so every Game the driver loads carries logging
// wrappers on travelTo / travelTargets / say / studyVillageCodex. All output
// goes to /tmp/r122-walkdiag-<seed>.log. Wrappers never throw and never change
// return values; on any logging error they degrade to a plain passthrough.
'use strict';
const fs = require('fs');
const HARNESS = '/home/hatch/workspace/the-scattering/scripts/sim-harness.js';
const harness = require(HARNESS);
const origLoadGame = harness.loadGame;

function logLine(seed, s) {
  try { fs.appendFileSync('/tmp/r122-walkdiag-' + seed + '.log', s + '\n'); } catch (e) {}
}
function dayOf(G) {
  try { return (G.state && G.state.scholar && G.state.scholar.day) | 0; } catch (e) { return -1; }
}
function posOf(G) {
  try { return (G.map && G.map.px) + ',' + (G.map && G.map.py); } catch (e) { return '?'; }
}

harness.loadGame = async function (opts) {
  const out = await origLoadGame(opts);
  const seed = (opts && opts.seed) || '?';
  const G = out && out.Game;
  if (!G) return out;
  try {
    const origTravelTo = G.travelTo.bind(G);
    G.travelTo = function (x, y, force, combatExit) {
      const d0 = dayOf(G), p0 = posOf(G);
      let ret, threw = null;
      try { ret = origTravelTo(x, y, force, combatExit); } catch (e) { threw = e; throw e; }
      try {
        const kind = (ret === null) ? 'null'
          : (ret && ret.kind) ? ('obj:' + ret.kind + ':' + (ret.blockType || ''))
          : (ret && ret.blockType) ? ('block:' + ret.blockType)
          : (typeof ret);
        logLine(seed, `d${d0} travelTo from=(${p0}) to=(${x},${y}) ret=${kind} after=(${posOf(G)})`);
      } catch (e) {}
      return ret;
    };
    const origTargets = G.travelTargets.bind(G);
    G.travelTargets = function () {
      const r = origTargets();
      try {
        const d0 = dayOf(G);
        if (d0 >= 25) {
          const list = (r || []).map(t => `(${t.x},${t.y})`).join(' ');
          logLine(seed, `d${d0} travelTargets from=(${posOf(G)}) n=${(r || []).length} ${list}`);
        }
      } catch (e) {}
      return r;
    };
    const origSay = G.say.bind(G);
    G.say = function (s) {
      try {
        if (typeof s === 'string' && /creek runs fast|fallen tree blocks|rubble chokes|washed out|blocks the path|^Travel |Not in the middle|Not mid-fight|lost my train/i.test(s)) {
          logLine(seed, `d${dayOf(G)} say@${posOf(G)}: ${String(s).slice(0, 160).replace(/\n/g, ' | ')}`);
        }
      } catch (e) {}
      return origSay.apply(G, arguments);
    };
    if (typeof G.studyVillageCodex === 'function') {
      const origStudy = G.studyVillageCodex.bind(G);
      G.studyVillageCodex = function (vid) {
        let ret;
        try { ret = origStudy.apply(G, arguments); } catch (e) { throw e; }
        try { logLine(seed, `d${dayOf(G)} studyVillageCodex vid=${vid} ret=${JSON.stringify(ret)} pos=(${posOf(G)})`); } catch (e) {}
        return ret;
      };
    }
    logLine(seed, `--- loadGame wrapped seed=${seed} mode=${(opts && opts.mode) || ''} ---`);
  } catch (e) {
    try { logLine(seed, 'WRAP-ERROR ' + (e && e.message)); } catch (e2) {}
  }
  return out;
};
