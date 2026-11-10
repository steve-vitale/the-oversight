// knowledge-b-instrument-20261110.js — Knowledge → behavior, BROAD recorder
// (arm sim-knowledge-b, run fleshout-loop-b-20261110T1930Z). Scripts only,
// zero src/js. Records per-domain knowledge-driven choice events so the
// band can answer, per domain, whether what a villager knows changes what
// they do — FOOD, LOOTING, PEOPLE, FORAGING, EXPLORING. The combat slice
// is NOT re-measured here (audit §3 baseline pointer in the prereg).
//
// Method wraps call the original, return its value unchanged, record only
// — never alter state, never consume RNG. Any failure in the RECORDING path
// is pushed to t.instrumentErrors, never thrown into the game. (AGENTS.md:
// no empty catch in new code — every catch reports.)
//
//   (1) DAILY SNAPSHOTS: roster, pantry kcal, sharedKnowledge breadth,
//       tested verdicts, mapmem sites, visitedTiles totals, wave/standing.
//   (2) FOOD: villagerMealDay reentrancy flag tags pantryDraw calls as
//       villager meals (other draws go in the otherDraws bucket);
//       per-item known-status via pantryItemKnown; villagerExperimentBeat
//       fires (unknown-food testing).
//   (3) LOOTING: mapmemHaulCandidate offers (channel famine/knowledge +
//       flesh known-status), mapmemHaulSites ranked lists (outside a
//       candidate call), objHaulFromSite formations, mapmemHaulAt arrivals,
//       expeditionCache finds (knowledge-independent luck, counted).
//   (4) PEOPLE: objPick VISIT formations, objVisitTarget choices
//       (channels mate/trust/away + zero-score never-chosen count),
//       tele('bond_proposed') events (lazy wrap — the harness installs its
//       own Game.tele wrapper inside runDays, AFTER the instrument installs,
//       so the instrument chains onto the live wrapper at first daily).
//   (5) FORAGING/EXPLORING: objPick FORAGE/EXPLORE formations with the
//       destination's visited-before flag (per-villager visitedTiles);
//       compareMaps events (map knowledge shared through conversation);
//       expeditionSign events (places learned).
//
// Usage: const INST = require('./knowledge-b-instrument-20261110');
//   const inst = INST.install(Game); inst.snapshot(); ...
//   inst.installTeleLazy(); // called from the policy daily wrapper
//   ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function rosterOf(Game) {
  try { return ((Game.state || {}).village || {}).roster || []; } catch (e) { return []; }
}

function vpOf(Game, vid) {
  try {
    const all = ((Game.data || {}).villagers || []).concat((Game.data || {}).background_survivors || []);
    for (let i = 0; i < all.length; i++) if (all[i] && all[i].id === vid) return all[i];
  } catch (e) {}
  return null;
}

function knownOf(Game, item) {
  // THE known check for a pantry item (game.js:48481). Returns true/false,
  // or 'error' when the check itself is unavailable — never throws.
  try {
    if (typeof Game.pantryItemKnown !== 'function') return 'error';
    const r = Game.pantryItemKnown(item);
    return r === true;
  } catch (e) { return 'error'; }
}

function corpseByRef(Game, ref) {
  try {
    const cs = (typeof Game.corpses === 'function') ? Game.corpses() : [];
    for (let i = 0; i < cs.length; i++) if (cs[i] && cs[i].id === ref) return cs[i];
  } catch (e) {}
  return null;
}

function foodKnownOf(Game, corpse) {
  try {
    if (typeof Game.mapmemFoodKnown !== 'function') return 'error';
    return Game.mapmemFoodKnown(corpse) === true;
  } catch (e) { return 'error'; }
}

function install(Game) {
  const t = {
    daily: [], foodDraws: [], otherDraws: [], experimentBeats: [],
    haulCandidates: [], haulSites: [], haulFormed: [], haulArrivals: [],
    cacheFinds: [], visitTargets: [], objPicks: [], bondEvents: [],
    compareMaps: [], signEvents: [], instrumentErrors: [],
  };
  let teleWrapped = false;
  let origTele = null;
  let inVillagerMeal = null; // vid while inside villagerMealDay
  let inHaulCandidate = false; // true while inside mapmemHaulCandidate
  const wrapped = {}; // name -> original fn (for uninstall)

  function err(where, e) {
    try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  // Wrap a Game method: call the original first, record, return its value
  // unchanged. Recording failures are logged, never thrown into the game.
  // If the original throws, the throw propagates (game semantics preserved)
  // and the record still lands with threw=true.
  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try { record(Array.prototype.slice.call(arguments), r, threw); } catch (e) { err(name + '-record', e); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { err(name + '-wrap', e); }
  }

  // ---- FOOD ----
  // villagerMealDay: reentrancy flag so pantryDraw calls inside a villager
  // meal are tagged with the eater; the flag is restored afterwards.
  try {
    const origMeal = Game.villagerMealDay;
    if (typeof origMeal !== 'function') { t.instrumentErrors.push('villagerMealDay-missing: not a function'); }
    else {
      wrapped.villagerMealDay = origMeal;
      Game.villagerMealDay = function (vid) {
        const prev = inVillagerMeal;
        inVillagerMeal = vid || null;
        let r, threw = null;
        try { r = origMeal.apply(Game, arguments); } catch (e) { threw = e; }
        inVillagerMeal = prev;
        if (threw) throw threw;
        return r;
      };
    }
  } catch (e) { err('villagerMealDay-wrap', e); }

  wrapMethod('pantryDraw', function (args, r) {
    try {
      const items = ((r && r.items) || []).map(function (d) {
        const it = (d && d.item) || {};
        return {
          known: knownOf(Game, it),
          foodKind: it.foodKind || null,
          plantId: it.plantId || null,
          units: d.units || 0,
          effectiveKcal: d.effectiveKcal || 0,
          cooked: !!d.cooked,
        };
      });
      const row = {
        day: dayOf(Game), vid: inVillagerMeal,
        context: inVillagerMeal ? 'villager-meal' : 'other',
        want: args[1] || 0, taken: (r && r.taken) || 0, items: items,
      };
      if (inVillagerMeal) t.foodDraws.push(row); else t.otherDraws.push(row);
      for (let i = 0; i < items.length; i++) {
        if (items[i].known === 'error') t.instrumentErrors.push('pantryDraw-known-check-error: day ' + dayOf(Game));
      }
    } catch (e) { err('pantryDraw-record', e); }
  });

  wrapMethod('villagerExperimentBeat', function (args, r) {
    t.experimentBeats.push({ day: dayOf(Game), vid: args[0] || null, ok: r !== false });
  });

  // ---- LOOTING ----
  wrapMethod('mapmemHaulCandidate', function (args, r) {
    // NOTE: this wrapper runs AFTER the original, which calls
    // mapmemHaulSites internally — inHaulCandidate is only set around
    // the RECORD step below, not the original call, so nested sites
    // calls are still recorded (they are deduped by the analyzer via
    // the inCandidate flag recorded on each haulSites row).
    const vid = args[0];
    let known = null, channel = 'none';
    try {
      const site = r || null;
      if (site) {
        const corpse = corpseByRef(Game, site.ref);
        known = corpse ? foodKnownOf(Game, corpse) : 'no-corpse';
        let pantry = 0, hunger = 0;
        try { pantry = Game.pantryKcalLive ? Game.pantryKcalLive(Game.state.village) : 0; } catch (e) { err('haulCandidate-pantry', e); }
        try { hunger = ((Game.npcNeeds ? (Game.npcNeeds(vid) || {}) : {}).hunger || 0); } catch (e) { err('haulCandidate-hunger', e); }
        if (pantry < 5000 || hunger > 50) channel = 'famine';
        else if (known === false) channel = 'knowledge';
        else channel = 'other';
      }
    } catch (e) { err('haulCandidate-record', e); }
    t.haulCandidates.push({
      day: dayOf(Game), vid: vid || null,
      ref: (r && r.ref) || null, known: known, channel: channel,
    });
  });

  // mapmemHaulSites: record ranked lists. Calls nested inside a candidate
  // call are flagged (the candidate wrapper sets the flag only around its
  // own record step, so this flag is set by the candidate ORIGINAL's
  // internal call only when the candidate wrapper itself is mid-record —
  // in practice nested calls arrive with inHaulCandidate false; the
  // analyzer dedupes by (day, vid, refs) instead. The flag is kept as a
  // best-effort marker, not a correctness claim.)
  wrapMethod('mapmemHaulSites', function (args, r) {
    try {
      const ranked = r || [];
      let nKnown = 0, nUnknown = 0, nErr = 0;
      const refs = [];
      for (let i = 0; i < ranked.length; i++) {
        const site = (ranked[i] && ranked[i].site) || null;
        refs.push(site ? site.ref : null);
        if (!site) continue;
        const corpse = corpseByRef(Game, site.ref);
        const k = corpse ? foodKnownOf(Game, corpse) : 'no-corpse';
        if (k === true) nKnown++;
        else if (k === false) nUnknown++;
        else nErr++;
      }
      t.haulSites.push({
        day: dayOf(Game), vid: args[0] || null, inCandidate: inHaulCandidate,
        nRanked: ranked.length, nKnown: nKnown, nUnknown: nUnknown, nOther: nErr, refs: refs,
      });
    } catch (e) { err('haulSites-record', e); }
  });

  wrapMethod('objHaulFromSite', function (args, r) {
    try {
      const site = args[4] || null; // (vid, hx, hy, o, site)
      const corpse = site ? corpseByRef(Game, site.ref) : null;
      let fresh = null;
      try { fresh = (typeof Game.objFreshKillUnrevealed === 'function') ? Game.objFreshKillUnrevealed(site ? site.ref : null) : 'error'; } catch (e) { fresh = 'error'; }
      t.haulFormed.push({
        day: dayOf(Game), vid: args[0] || null,
        ref: site ? site.ref : null, label: site ? (site.label || null) : null,
        known: corpse ? foodKnownOf(Game, corpse) : 'no-corpse',
        freshUnrevealed: fresh,
        secondhand: !!(site && site.secondhand),
      });
    } catch (e) { err('haulFormed-record', e); }
  });

  wrapMethod('mapmemHaulAt', function (args, r) {
    try {
      let ref = null;
      try { const o = Game.objOf ? Game.objOf(args[0]) : null; ref = (o && o.targetRef) || null; } catch (e) {}
      t.haulArrivals.push({ day: dayOf(Game), vid: args[0] || null, ref: ref, ok: r === true });
    } catch (e) { err('haulArrivals-record', e); }
  });

  wrapMethod('expeditionCache', function (args, r, threw) {
    try {
      let kcal = null;
      try {
        const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
        const finds = st && st.exped && st.exped[args[0]] ? (st.exped[args[0]].finds || []) : [];
        if (finds.length) kcal = finds[finds.length - 1].kcal ?? null;
      } catch (e) {}
      t.cacheFinds.push({ day: dayOf(Game), vid: args[0] || null, dist: args[1] || 0, kcal: kcal, threw: !!threw });
    } catch (e) { err('cacheFinds-record', e); }
  });

  // ---- PEOPLE ----
  wrapMethod('objVisitTarget', function (args, r) {
    try {
      const vid = args[0];
      const v = (Game.state || {}).village || {};
      const roster = rosterOf(Game);
      const mates = {};
      try {
        for (let gi = 0; gi < (v.groups || []).length; gi++) {
          const gr = v.groups[gi];
          if (gr.members && gr.members.indexOf(vid) !== -1) {
            for (let mi = 0; mi < gr.members.length; mi++) mates[gr.members[mi]] = true;
          }
        }
      } catch (e) { err('visitTarget-mates', e); }
      let nZero = 0;
      const channels = { mate: false, trustHigh: false, trustMid: false, away: false };
      if (r) {
        if (mates[r]) channels.mate = true;
        let tr = 0;
        try { tr = ((v.trust || {})[r]) || 0; } catch (e) {}
        if (tr > 40) channels.trustHigh = true; else if (tr > 20) channels.trustMid = true;
        try { if ((v.away || {})[r]) channels.away = true; } catch (e) {}
      }
      for (let i = 0; i < roster.length; i++) {
        const id = roster[i];
        if (id === vid) continue;
        let s = 0;
        if (mates[id]) s += 3;
        let tr = 0;
        try { tr = ((v.trust || {})[id]) || 0; } catch (e) {}
        if (tr > 40) s += 2; else if (tr > 20) s += 1;
        try { if ((v.away || {})[id]) s += 2; } catch (e) {}
        if (s <= 0) nZero++;
      }
      t.visitTargets.push({
        day: dayOf(Game), vid: vid || null, target: r || null,
        channels: channels, nZeroScore: nZero, rosterSize: roster.length,
      });
    } catch (e) { err('visitTargets-record', e); }
  });

  // ---- FORAGING / EXPLORING ----
  wrapMethod('objPick', function (args, r) {
    try {
      const vid = args[0];
      let o = null;
      try { o = Game.objOf ? Game.objOf(vid) : null; } catch (e) {}
      // objPick returns the objective in most builds; fall back to objOf.
      if (!o && r && typeof r === 'object') o = r;
      if (!o) return;
      const kind = o.kind || null;
      if (kind !== 'FORAGE' && kind !== 'EXPLORE' && kind !== 'VISIT' && kind !== 'HAUL' && kind !== 'SEEK') return;
      let visitedBefore = null;
      if (o.tx !== undefined && o.ty !== undefined) {
        try {
          const vp = vpOf(Game, vid);
          const tiles = (vp && vp.visitedTiles) || [];
          visitedBefore = tiles.indexOf(o.tx + ',' + o.ty) !== -1;
        } catch (e) { visitedBefore = 'error'; }
      }
      t.objPicks.push({
        day: dayOf(Game), vid: vid || null, kind: kind, purpose: o.purpose || null,
        tx: (o.tx !== undefined ? o.tx : null), ty: (o.ty !== undefined ? o.ty : null),
        targetVid: o.targetVid || null, visitedBefore: visitedBefore,
        goal: o.goal || null,
      });
    } catch (e) { err('objPicks-record', e); }
  });

  wrapMethod('compareMaps', function (args, r) {
    t.compareMaps.push({ day: dayOf(Game), vid: args[0] || null, newCount: (r && r.newCount) || 0 });
  });

  wrapMethod('expeditionSign', function (args) {
    t.signEvents.push({ day: dayOf(Game), vid: args[0] || null, dist: args[1] || 0 });
  });

  function installTeleLazy() {
    if (teleWrapped) return;
    try {
      const live = Game.tele;
      if (typeof live !== 'function') { t.instrumentErrors.push('tele-missing: not a function at lazy install'); return; }
      origTele = live;
      teleWrapped = true;
      Game.tele = function (kind, data) {
        let r;
        try { r = live.apply(Game, arguments); } catch (e) { throw e; }
        try {
          if (kind === 'bond_proposed' && data) {
            t.bondEvents.push({
              day: dayOf(Game),
              initiator: data.initiator || null, target: data.target || null,
              kind: data.kind || null, outcome: data.outcome || null,
              chance: (data.chance === undefined ? null : data.chance),
            });
          }
        } catch (e) { err('bondEvents-record', e); }
        return r;
      };
    } catch (e) { err('tele-lazy-wrap', e); }
  }

  function snapshot() {
    try {
      const v = (Game.state || {}).village || {};
      const roster = v.roster || [];
      let alive = 0;
      for (let i = 0; i < roster.length; i++) {
        try { const p = Game.getPerson ? Game.getPerson(roster[i]) : null; if (p && !p.dead) alive++; } catch (e) {}
      }
      const shared = v.sharedKnowledge || {};
      let tested = 0;
      for (const k in shared) if (shared[k] && shared[k].tested) tested++;
      let mapmemSites = 0, mapmemVids = 0;
      const mm = v.mapmem || {};
      for (const k in mm) {
        const n = ((mm[k] && mm[k].sites) || []).length;
        if (n > 0) mapmemVids++;
        mapmemSites += n;
      }
      let visitedTotal = 0;
      try {
        const all = ((Game.data || {}).villagers || []).concat((Game.data || {}).background_survivors || []);
        for (let i = 0; i < all.length; i++) visitedTotal += ((all[i] && all[i].visitedTiles) || []).length;
      } catch (e) {}
      let pantryKcal = 0;
      try { pantryKcal = (v.pantry || []).reduce(function (s, it) { return s + ((it.kcalEach || 0) * (it.units || 1)); }, 0); } catch (e) {}
      let wave = null, standing = null, scaleRank = null;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
      t.daily.push({
        day: dayOf(Game), roster: roster.length, alive: alive,
        pantryKcal: pantryKcal, sharedKnown: Object.keys(shared).length,
        testedVerdicts: tested, mapmemSites: mapmemSites,
        mapmemVids: mapmemVids, visitedTilesTotal: visitedTotal,
        wave: wave, standing: standing, scaleRank: scaleRank,
        fallen: ((v.fallen || []).length),
      });
    } catch (e) { err('snapshot', e); }
  }

  function uninstall() {
    try {
      for (const name in wrapped) {
        try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
      }
      if (teleWrapped && origTele) {
        try { Game.tele = origTele; } catch (e) { err('uninstall-tele', e); }
      }
    } catch (e) { err('uninstall', e); }
  }

  // Install-time availability check: pantryItemKnown is the FOOD known
  // check; if it is missing the FOOD rate cannot be computed honestly.
  try {
    if (typeof Game.pantryItemKnown !== 'function') t.instrumentErrors.push('pantryItemKnown-missing at install');
  } catch (e) { err('install-check', e); }

  return { t: t, snapshot: snapshot, installTeleLazy: installTeleLazy, uninstall: uninstall };
}

module.exports = { install: install };
