'use strict';
// Diagnostic only. Nominal person budgets are references, not a new god gate.
const clone = x => JSON.parse(JSON.stringify(x));
function roster(G, village = G.state.village) {
  const people = new Map((G.data.villagers || []).map(p => [p.id, p]));
  return [...new Set([...(village.roster || []), G.villagerId].filter(Boolean))].flatMap(id => {
    const p = people.get(id);
    if (p?.dead) return [];
    return [{ id, known: !!p, bearer: id === G.villagerId,
      nominalKcal: Number.isFinite(p?.kcalPerDay) && p.kcalPerDay > 0 ? p.kcalPerDay : null }];
  });
}
function coverage(dawn, settlement, book, intermediate = []) {
  // Preserve a departed/dead mouth in the diagnostic denominator. Never make
  // apparent whole-village coverage improve just because an unfed person left.
  const required = [...new Map([...dawn, ...intermediate.flat(), ...settlement].map(p => [p.id, p])).values()];
  const owners = [...new Set(Object.values(book).flatMap(r => Object.keys(r.harvestNourishment || {})))].sort();
  const unknown = required.filter(p => !p.known || !p.nominalKcal).map(p => p.id);
  const key = rows => [...new Set(rows.map(p => p.id))].sort().join('|');
  const sameIds = [settlement, ...intermediate].every(rows => key(rows) === key(dawn));
  return { required, unknown, rosterStable: sameIds,
    harvesters: owners.map(id => {
      const portions = required.map(p => ({ eater: p.id, nominalKcal: p.nominalKcal,
        kcal: book[p.id]?.harvestKcal?.[id] || 0, nourishment: book[p.id]?.harvestNourishment?.[id] || 0 }));
      const others = portions.filter(p => p.eater !== id);
      return { id, portions,
        minimumOtherNominalFraction: unknown.length || !others.length ? null : Math.min(...others.map(p => p.nourishment / p.nominalKcal)),
        minimumOtherNourishment: others.length ? Math.min(...others.map(p => p.nourishment)) : null,
        mouthsWithIntake: portions.filter(p => p.nourishment > 0).length,
        minimumNominalFraction: unknown.length || !required.length ? null : Math.min(...portions.map(p => p.nourishment / p.nominalKcal)),
        minimumKcal: portions.length ? Math.min(...portions.map(p => p.kcal)) : null,
        minimumNourishment: portions.length ? Math.min(...portions.map(p => p.nourishment)) : null };
    }) };
}
function install(G) {
  const days = [], errors = [];
  let dawn = roster(G), atMeal = null, depth = 0;
  const eats = G.villageEats, end = G.endDay;
  G.villageEats = function () {
    try { atMeal = roster(this); } catch (e) { errors.push('meal roster: ' + e.message); }
    return eats.apply(this, arguments);
  };
  G.endDay = function () {
    if (depth) return end.apply(this, arguments);
    depth++;
    const day = this.state.scholar.day, village = this.state.village;
    let before = [], completed = false;
    try { before = roster(this); } catch (e) { errors.push('closure roster: ' + e.message); }
    atMeal = null;
    try { const result = end.apply(this, arguments); completed = true; return result; }
    finally {
      try {
        const book = clone(village.harvestIntake?.[day] || {});
        const after = roster(this, village);
        days.push({ day, closed: completed && this.state.scholar.day > day && this.state.village === village,
          dawn: clone(dawn), before, atMeal, after, book,
          ...coverage(dawn, after, book, [before, ...(atMeal ? [atMeal] : [])]) });
        dawn = roster(this);
      } catch (e) { errors.push('day closure: ' + e.message); }
      depth--;
    }
  };
  return { days, errors };
}
module.exports = { roster, coverage, install };
