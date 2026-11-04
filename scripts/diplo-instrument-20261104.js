// diplo-instrument-20261104.js — diplomacy-pipeline instrument
// (arm sim-diplo-b, run fleshout-loop-b-20261104T0730Z).
// Scripts only, zero src/js. Decomposes the inter-village link
// pipeline into stages S0-S8 (see sim-diplo-b-prereg.md):
//   S0 villages exist, S1 known (knowsVillage), S2 opinion >= 10
//   (peer-proposal prerequisite) / any opinion movement,
//   S3 travel to a village tile and/or codex study,
//   S4 proposal attempted, S5 proposal judged (accept/counter/
//   decline vs gate-refused), S6 link formed, S7 seasoned
//   (30+ days, trust 40+), S8 regional+ (polity filter).
// Wraps are call-through and RNG-neutral; every catch reports
// into t.instrumentErrors, never silently. The snapshot NEVER
// calls villageStandingTotal() or unlockedWave() (both
// side-effecting). Link formation is detected by diffing
// hierarchyState() link ids across snapshots, never inferred
// from a say-line.
// Usage: const INST = require('./diplo-instrument-20261104');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function shallow(x, keys) {
  const o = {};
  try {
    for (const k of keys) {
      const v = x ? x[k] : undefined;
      if (v == null) o[k] = null;
      else if (typeof v === 'object') o[k] = '[obj]';
      else o[k] = v;
    }
  } catch (e) {}
  return o;
}
// Diplomacy say-lines only: proposals, counters, declines, bonds,
// polity, opinion, codex study, village visits. Deliberately NOT
// matching bare 'standing' (the ready5 pantry flood).
const SAY_RE = /propos|covenant|trade league|declines|counter|bond|polity|opinion|alliance|study.*codex|codex.*stud|don't know them well enough|not today|they're watching/i;

function install(Game) {
  const t = {
    daily: [], proposalEvents: [], courtshipEvents: [], travelCalls: [],
    linkFormedEvents: [], deathEvents: [], sayLines: [],
    instrumentErrors: [], wrapCounts: {},
  };
  const orig = {};
  let prevLinkIds = null;
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  function describeRet(r) {
    try {
      if (r == null) return null;
      if (typeof r === 'string' || typeof r === 'number' || typeof r === 'boolean') return r;
      if (Array.isArray(r)) return '[array:' + r.length + ']';
      return shallow(r, ['id', 'kind', 'status', 'primary', 'subordinate', 'a', 'b', 'score', 'accepted', 'counter', 'terms']);
    } catch (e) { return '[unreadable]'; }
  }

  function wrapVerb(fnName, bucket) {
    if (typeof Game[fnName] !== 'function') { return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      count(fnName);
      let r, threw = null;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { threw = e; throw e; }
      try {
        const ev = { day: dayOf(Game), fn: fnName, target: (arguments.length ? arguments[0] : null),
          opts: (arguments.length > 1 && arguments[1] && typeof arguments[1] === 'object') ? shallow(arguments[1], ['asSubordinate', 'tributeKcalPerWeek', 'kind']) : null,
          ret: describeRet(r) };
        (bucket === 'proposal' ? t.proposalEvents : t.courtshipEvents).push(ev);
      } catch (e) { err(fnName + '-row', e); }
      return r;
    };
  }
  wrapVerb('proposeLink', 'proposal');
  wrapVerb('proposeCovenant', 'proposal');
  wrapVerb('proposeTrade', 'proposal');
  wrapVerb('proposeAlliance', 'proposal');
  wrapVerb('studyVillageCodex', 'courtship');
  wrapVerb('tendLink', 'courtship');
  wrapVerb('answerCounter', 'courtship');
  wrapVerb('answerAccord', 'courtship');
  wrapVerb('answerDefenseCall', 'courtship');
  wrapVerb('answerNationalChoice', 'courtship');

  if (typeof Game.travelTo === 'function') {
    orig.travelTo = Game.travelTo;
    Game.travelTo = function (x, y) {
      count('travelTo');
      let r;
      try { r = orig.travelTo.apply(this, arguments); } catch (e) { throw e; }
      try {
        const ovs = ((Game.state || {}).otherVillages || []);
        const px = (Game.map || {}).px, py = (Game.map || {}).py;
        const hit = ovs.find(function (v) { return v && v.x === px && v.y === py; });
        t.travelCalls.push({ day: dayOf(Game), toX: x, toY: y, landedX: px, landedY: py,
          onVillageTile: hit ? hit.id : null });
      } catch (e) { err('travelTo-row', e); }
      return r;
    };
  } else { err('install.travelTo', new Error('not a function')); }

  if (typeof Game.tele === 'function') {
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'death' && data && typeof data === 'object') {
          t.deathEvents.push({ day: dayOf(Game), kind: data.kind || null, who: data.who || null, cause: data.cause || null, player: !!data.player });
        }
      } catch (e) { err('tele', e); }
      return r;
    };
  } else { err('install.tele', new Error('not a function')); }

  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      const arg = arguments.length ? arguments[0] : null;
      try {
        if (typeof arg === 'string' && SAY_RE.test(arg) && t.sayLines.length < 400) {
          t.sayLines.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 600) });
        }
      } catch (e) { err(fnName + '-wrap', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  function isLiving(Game, vid, scholarId) {
    if (vid === scholarId) return true;
    try {
      const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
      return !!(vp && !vp.dead);
    } catch (e) { return false; }
  }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.tile = { x: (Game.map || {}).px, y: (Game.map || {}).py }; } catch (e) { snap.tile = null; }
    try { snap.insideHaven = !!((Game.state || {}).scholar || {}).insideHaven; } catch (e) { snap.insideHaven = null; }
    try {
      const ovs = ((Game.state || {}).otherVillages || []);
      snap.ovs = ovs.map(function (v) {
        let known = null, allied = null, linkWith = null;
        try { known = (typeof Game.knowsVillage === 'function') ? !!Game.knowsVillage(v) : null; } catch (e) { err('knowsVillage', e); }
        try { allied = (typeof Game.isAllied === 'function') ? !!Game.isAllied('haven', v.id) : null; } catch (e) {}
        try { linkWith = (typeof Game.linkWith === 'function') ? Game.linkWith(v.id) : null; } catch (e) {}
        return { id: v.id, name: v.name || null, x: (v.x == null ? null : v.x), y: (v.y == null ? null : v.y),
          opinion: (v.opinion == null ? null : v.opinion), known: known, generated: !!v.generated,
          rumored: !!v.rumored, isSplinter: !!v.isSplinter, parentVillage: v.parentVillage || null,
          codexGiven: !!v._codexOpinionGiven, allied: allied,
          linkWith: (linkWith && typeof linkWith === 'object') ? shallow(linkWith, ['id', 'kind', 'status']) : linkWith };
      });
      if (snap.tile) {
        const hit = ovs.find(function (v) { return v && v.x === snap.tile.x && v.y === snap.tile.y; });
        snap.onVillageTile = hit ? hit.id : null;
      } else snap.onVillageTile = null;
    } catch (e) { snap.ovs = null; snap.onVillageTile = null; err('ovs', e); }
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      const funnel = { total: ls.length, active: 0, seasoned: 0, regionalPlus: 0, seasonedNotRegional: 0, detail: [] };
      const ids = new Set();
      for (const l of ls) {
        if (l && l.id != null) ids.add(String(l.id));
        const active = (l && l.status === 'active');
        if (active) funnel.active++;
        let seasoned = false, regional = false;
        try { seasoned = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!(l && l.conquered)) : false; } catch (e) {}
        try { regional = (typeof Game._linkRegionalPlus === 'function') ? !!Game._linkRegionalPlus(l) : false; } catch (e) {}
        if (seasoned) funnel.seasoned++;
        if (seasoned && regional) funnel.regionalPlus++;
        if (seasoned && !regional) funnel.seasonedNotRegional++;
        if (funnel.detail.length < 30) funnel.detail.push(shallow(l, ['id', 'kind', 'primary', 'subordinate', 'a', 'b', 'status', 'trust', 'day', 'formedDay', 'createdDay']));
        if (funnel.detail.length <= 30) { const d = funnel.detail[funnel.detail.length - 1]; if (d) { d.seasoned = seasoned; d.regionalPlus = regional; } }
      }
      snap.linkFunnel = funnel;
      if (prevLinkIds) {
        for (const id of ids) {
          if (!prevLinkIds.has(id)) {
            const link = ls.find(function (l) { return l && String(l.id) === id; });
            t.linkFormedEvents.push({ day: snap.day, link: link ? shallow(link, ['id', 'kind', 'primary', 'subordinate', 'a', 'b', 'status', 'trust']) : { id: id } });
          }
        }
      }
      prevLinkIds = ids;
    } catch (e) { snap.linkFunnel = null; err('linkFunnel', e); }
    try {
      const st = Game.state || {};
      snap.pending = {
        counter: !!st.pendingCounter, accord: !!st.pendingAccord,
        national: !!st.pendingNational, global: !!st.pendingGlobal,
        counterDetail: st.pendingCounter ? shallow(st.pendingCounter, ['targetId', 'kind', 'terms']) : null,
      };
    } catch (e) { snap.pending = null; err('pending', e); }
    try { snap.standing = Game.villageStanding ? Game.villageStanding() : null; } catch (e) { snap.standing = null; err('standing', e); }
    try { snap.capped = Game.standingPlentyCappedTotal ? Game.standingPlentyCappedTotal() : null; } catch (e) { snap.capped = null; err('capped', e); }
    try { snap.peak = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) { snap.peak = null; err('peak', e); }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; err('scaleRank', e); }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; err('readiness5', e); }
    try { snap.w4faced = Game.waveEngaged ? Game.waveEngaged(4) : null; } catch (e) { snap.w4faced = null; err('w4faced', e); }
    try { snap.w5faced = Game.waveEngaged ? Game.waveEngaged(5) : null; } catch (e) { snap.w5faced = null; err('w5faced', e); }
    try {
      const roster = (((Game.state || {}).village || {}).roster || []);
      snap.roster = roster.slice();
      snap.livingCount = roster.filter(function (vid) { return isLiving(Game, vid, snap.scholarId); }).length;
    } catch (e) { snap.roster = []; snap.livingCount = null; err('livingCount', e); }
    try {
      snap.pantryKcal = (((Game.state || {}).village || {}).pantry || []).reduce(function (s, i) { return s + ((i.kcalEach || 0) * (i.units || 1)); }, 0);
    } catch (e) { snap.pantryKcal = null; err('pantryKcal', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() { Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} }); }
  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, SAY_RE: SAY_RE };
