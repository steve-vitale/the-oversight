// policies/treatment-seeking.js — competent player who also seeks treatment
// (longsim disease lever r2, 2026-10-11).
//
// Closes the r1-documented diagnosis->cure gap from the POLICY side: r1 found
// zero cures in 12 runs partly because no policy ever sought treatment. A
// competent player who gets diagnosed would (a) examine themselves to name
// the sickness, (b) take the matching pills or use their medical training,
// (c) when diagnosed with a pill-needing class and holding no pills, walk to
// the nearest unsearched ruin and search it for a medicine cabinet.
//
// The game-side half of the lever (src/js/statusEffects.js): the diagnosis
// narration names a concrete ruin direction for bacterial/parasitic classes,
// so a real player gets the same hint the policy acts on from its own tile
// scan. Policy honesty note: the policy scans tile.loot from afar when
// choosing a ruin; a real player sees the map epithet ("there might be cans
// left" / "picked clean") — same information, coarser. The travel + search
// costs are real (64 ticks + 100 kcal per search).
'use strict';
const { competent } = require('./competent');

const CURE_ABILITIES = ['triage', 'field_medicine', 'herbal_remedy'];

// Dedicated medicine run: visit up to 2 ruins with loot remaining, search
// each (up to 4 forages) until pills are found. Returns to home tile after.
function ruinMedicineRun(Game, ctx) {
  try {
    const cands = [];
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      let t = null;
      try { t = Game.tileAt(x, y); } catch (e) { continue; }
      if (!t || t.type !== 'ruin') continue;
      if ((t.loot || []).length <= 0) continue;
      cands.push({ x, y, d: Math.abs(x - Game.map.px) + Math.abs(y - Game.map.py) });
    }
    cands.sort((a, b) => a.d - b.d);
    if (!cands.length) return false;
    const home = { x: Game.map.px, y: Game.map.py };
    let visited = 0;
    for (const c of cands) {
      if (visited >= 2) break;
      visited++;
      try { Game.travelTo(c.x, c.y); } catch (e) { continue; }
      if (Game.over || Game.tbfight) { try { Game.travelTo(home.x, home.y); } catch (e2) {} return false; }
      if (Game.map.px !== c.x || Game.map.py !== c.y) continue;
      for (let f = 0; f < 4; f++) {
        let t = null;
        try { t = Game.tileAt(c.x, c.y); } catch (e) { break; }
        if (!t || (t.loot || []).length <= 0) break;
        try { Game.doAction('forage', {}); ctx.ruinSearches = (ctx.ruinSearches || 0) + 1; } catch (e) { break; }
        if (Game.over || Game.tbfight) break;
        const inv = (Game.state.scholar || {}).inventory || [];
        if (inv.some(i => i.medType && (i.doses || 0) > 0)) break;
      }
      ctx.ruinRuns = (ctx.ruinRuns || 0) + 1;
      const inv = (Game.state.scholar || {}).inventory || [];
      if (inv.some(i => i.medType && (i.doses || 0) > 0)) break;
    }
    try { Game.travelTo(home.x, home.y); } catch (e) {}
    return true;
  } catch (e) { return false; }
}

// The treatment step. Runs in upkeep (before the day's main action): a sick
// person deals with being sick first.
function seekTreatment(Game, ctx) {
  try {
    let sick = Game.sickDiseases ? Game.sickDiseases() : [];
    if (!sick.length) return;
    const isDiag = id => { try { return Game.isDiagnosed('scholar', id); } catch (e) { return false; } };
    // 1) NAME IT: examine yourself when nothing is diagnosed yet.
    if (!sick.some(e => isDiag(e.id)) && Game.examineSick) {
      try { Game.examineSick(); ctx.examinedSick = (ctx.examinedSick || 0) + 1; } catch (e) {}
      sick = Game.sickDiseases ? Game.sickDiseases() : [];
      if (!sick.length) return;
    }
    const inv = () => ((Game.state.scholar || {}).inventory || []);
    const hasPills = kind => inv().some(i => i.medType === kind && (i.doses || 0) > 0);
    // 2) TREAT: matching pills for a diagnosed class, then medical training.
    for (const e of sick) {
      let def = null;
      try { def = Game.seDef(e.id); } catch (x) {}
      if (!def || !isDiag(e.id)) continue;
      const cls = def['class'] || '';
      if (cls === 'bacterial' && hasPills('antibiotics') && Game.useMedicine) {
        try { Game.useMedicine('antibiotics'); ctx.usedPills = (ctx.usedPills || 0) + 1; } catch (x) {}
        return;
      }
      if (cls === 'parasitic' && hasPills('antiparasitic') && Game.useMedicine) {
        try { Game.useMedicine('antiparasitic'); ctx.usedPills = (ctx.usedPills || 0) + 1; } catch (x) {}
        return;
      }
      for (const ab of CURE_ABILITIES) {
        let has = false;
        try { has = Game.hasAbility && Game.hasAbility(ab); } catch (x) {}
        if (has && Game.treatDisease) {
          try { Game.treatDisease(ab); ctx.treatedSelf = (ctx.treatedSelf || 0) + 1; } catch (x) {}
          break;
        }
      }
    }
    // 3) QUEST: diagnosed with a pill-needing class but no pills -> ruins.
    let needPills = false;
    for (const e of sick) {
      let def = null;
      try { def = Game.seDef(e.id); } catch (x) {}
      if (def && (def['class'] === 'bacterial' || def['class'] === 'parasitic') && isDiag(e.id)) {
        needPills = true;
        break;
      }
    }
    if (needPills) ruinMedicineRun(Game, ctx);
  } catch (e) {}
}

const treatment_seeking = {
  id: 'treatment_seeking',
  desc: 'competent + seeks treatment: examines, uses pills/training, ruin-runs for medicine when diagnosed',
  setup: competent.setup,
  upkeep(Game, ctx) {
    try { competent.upkeep(Game, ctx); } catch (e) {}
    seekTreatment(Game, ctx);
  },
  daily: competent.daily,
  fight: competent.fight,
};

module.exports = { treatment_seeking };
