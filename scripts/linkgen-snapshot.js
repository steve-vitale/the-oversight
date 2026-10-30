// linkgen-snapshot.js — pure-read regional link + roster-generation snapshot
// (sim-linkgen-a). Records ONLY traced knowledge: lore how/day, generated
// flag, delivered rumors, approach distance. Proposes NO roster-fed or
// list-fed decision (perception law, Steve 2026-10-28).
// snapshotLinkgen(Game) -> { day, playerPos, links, villages, errors }.
// classifyProposal(knowsBefore, opinionBefore, linkExistedBefore,
//   pendingBefore, ret) -> ACCEPT | COUNTER | DECLINE | BLOCKED-UNKNOWN |
//   SHUT-DOOR | BLOCKED-PENDING | ALREADY-LINKED (no RNG, pure logic).
'use strict';

function linkgenSnapshot(Game) {
  const out = { day: 0, playerPos: null, links: [], villages: [], errors: [] };
  try { out.day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  try {
    const m = Game.map || {};
    out.playerPos = { x: m.px, y: m.py };
  } catch (e) { out.errors.push('pos: ' + e.message); }
  let links = [];
  try {
    links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
  } catch (e) { out.errors.push('links: ' + e.message); }
  const ovById = {};
  try {
    (Game.state.otherVillages || []).forEach(function (v) { if (v) ovById[v.id] = v; });
  } catch (e) {}
  function villageView(v) {
    if (!v) return null;
    let known = false, lore = null;
    try { known = !!(Game.knowsVillage && Game.knowsVillage(v)); } catch (e) {}
    try {
      lore = (Game.villageLoreEntry && Game.playerKnowerId)
        ? Game.villageLoreEntry(Game.playerKnowerId(), v.id) : null;
    } catch (e) {}
    const roster = v.roster || null;
    let aliveAdults = 0;
    if (roster) roster.forEach(function (r) {
      if (r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0)) aliveAdults++;
    });
    let dist = null;
    try {
      if (out.playerPos && out.playerPos.x != null) {
        dist = Math.abs((v.x || 0) - out.playerPos.x) + Math.abs((v.y || 0) - out.playerPos.y);
      }
    } catch (e) {}
    let deliveredRumor = false;
    try {
      ((Game.state.scholar || {}).rumors || []).forEach(function (r) {
        if (r && r.type === 'village' && r.villageId === v.id && r.delivered) deliveredRumor = true;
      });
    } catch (e) {}
    return {
      id: v.id, name: v.name || null, x: v.x, y: v.y, dist: dist,
      generated: !!v.generated, rosterSize: roster ? roster.length : 0,
      aliveAdults: aliveAdults, population: v.population || 0,
      villageDay: v.day || 0, opinion: v.opinion || 0, rumored: !!v.rumored,
      known: known, loreHow: lore ? lore.how : null, loreDay: lore ? lore.day : null,
      deliveredRumor: deliveredRumor,
    };
  }
  try {
    (Game.state.otherVillages || []).forEach(function (v) {
      const view = villageView(v);
      if (view) out.villages.push(view);
    });
  } catch (e) { out.errors.push('villages: ' + e.message); }
  links.forEach(function (link) {
    if (!link) return;
    let vid = null;
    try { vid = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : null; } catch (e) {}
    const ov = vid ? ovById[vid] : null;
    const view = ov ? villageView(ov) : null;
    out.links.push({
      id: link.id || null, status: link.status || null,
      primary: link.primary || null, subordinate: link.subordinate || null,
      villageId: vid, name: view ? view.name : null,
      trust: link.trust || 0, opinion: view ? view.opinion : 0,
      arrears: link.arrears || 0, linkDay: link.day || 0,
      generated: view ? view.generated : false,
      rosterSize: view ? view.rosterSize : 0,
      aliveAdults: view ? view.aliveAdults : 0,
      population: view ? view.population : 0,
      villageDay: view ? view.villageDay : 0,
    });
  });
  return out;
}

function classifyProposal(o) {
  if (o.linkExistedBefore) return 'ALREADY-LINKED';
  if (o.pendingBefore) return 'BLOCKED-PENDING';
  if (o.ret && typeof o.ret === 'object' && o.ret.id) return 'ACCEPT';
  if (o.ret === 'counter') return 'COUNTER';
  if (!o.knowsBefore) return 'BLOCKED-UNKNOWN';
  if ((o.opinionBefore || 0) <= -20) return 'SHUT-DOOR';
  return 'DECLINE';
}

module.exports = { linkgenSnapshot, classifyProposal };
