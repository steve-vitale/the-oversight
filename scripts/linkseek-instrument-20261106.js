// linkseek-instrument-20261106.js — link-seeking probe instrument
// (arm sim-linkseek-b, run fleshout-loop-b-20261106T0730Z). Scripts
// only, zero src/js. Wraps the standaccum instrument (daily standing
// breakdown, ledger, full link roll, feasts, readiness-5) and adds a
// per-snapshot KNOWLEDGE roll: every other village with generated /
// rumored / lore / knowsVillage / distance from the scholar /
// opinion / linked?. Link formation/seasoning/dissolution events
// are derived by the analyzer from consecutive-snapshot
// transitions — the engine records no link-event log (stated, not
// hidden).
// Usage: const INST = require('./linkseek-instrument-20261106');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';
const path = require('path');
const STAND = require(path.join(__dirname, 'standaccum-instrument-20261104'));

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function knowledgeRoll(Game, t) {
  const roll = { scholar: null, villages: [], knownCount: 0, generatedCount: 0, loreCount: 0 };
  try {
    const st = Game.state || {};
    const px = (Game.map || {}).px, py = (Game.map || {}).py;
    roll.scholar = { x: px, y: py };
    let knower = null;
    try { knower = (typeof Game.playerKnowerId === 'function') ? Game.playerKnowerId() : null; } catch (e) {}
    for (const v of (st.otherVillages || [])) {
      if (!v) continue;
      const entry = { id: v.id || null, name: v.name || null, x: v.x, y: v.y };
      try { entry.generated = !!v.generated; } catch (e) { entry.generated = false; }
      try { entry.rumored = !!v.rumored; } catch (e) { entry.rumored = false; }
      try { entry.opinion = (v.opinion || 0) | 0; } catch (e) { entry.opinion = 0; }
      try { entry.dist = Math.abs((v.x || 0) - (px || 0)) + Math.abs((v.y || 0) - (py || 0)); } catch (e) { entry.dist = null; }
      try {
        const lore = (typeof Game.villageLoreEntry === 'function') ? Game.villageLoreEntry(knower, v.id) : null;
        entry.lore = lore ? { how: lore.how || null, day: (lore.day || 0) | 0 } : null;
      } catch (e) { entry.lore = null; }
      try { entry.known = (typeof Game.knowsVillage === 'function') ? !!Game.knowsVillage(v) : false; } catch (e) { entry.known = false; }
      try { entry.linked = (typeof Game.linkWith === 'function') ? !!Game.linkWith(v.id) : false; } catch (e) { entry.linked = false; }
      try { entry.isSplinter = !!v.isSplinter; } catch (e) { entry.isSplinter = false; }
      if (entry.generated) roll.generatedCount++;
      if (entry.lore) roll.loreCount++;
      if (entry.known) roll.knownCount++;
      roll.villages.push(entry);
    }
  } catch (e) { t.instrumentErrors.push('knowledge: ' + String(e.message).slice(0, 80)); }
  return roll;
}

function install(Game) {
  const base = STAND.install(Game);
  const t = base.t;
  function snapshot() {
    const snap = base.snapshot();
    try { snap.knowledge = knowledgeRoll(Game, t); } catch (e) { snap.knowledge = null; t.instrumentErrors.push('knowledge-snap: ' + String(e.message).slice(0, 80)); }
    try { snap.pendingCounter = !!((Game.state || {}).pendingCounter); } catch (e) { snap.pendingCounter = null; }
    try { snap.pendingAccord = !!((Game.state || {}).pendingAccord); } catch (e) { snap.pendingAccord = null; }
    return snap;
  }
  return { t: t, snapshot: snapshot, uninstall: base.uninstall };
}

module.exports = { install: install };
