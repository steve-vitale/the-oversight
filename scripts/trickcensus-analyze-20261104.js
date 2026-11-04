// trickcensus-analyze-20261104.js — pure census summaries for arm
// sim-trickcensus-a. No Game access: operates on driver JSON only.
'use strict';

function barsOf(snap) {
  if (!snap || !snap.readiness5) return null;
  const r = snap.readiness5;
  return { armored: r.armored | 0, armed: r.armed | 0, tricks: r.tricks | 0, veterans: r.veterans | 0,
    demand: r.demand || null, short: (r.short || []).slice(), ready: !!r.ready };
}
function lastSnap(out) {
  const d = out.daily || [];
  return d.length ? d[d.length - 1] : null;
}
// Shortfall cause for the TRICKS bar on one seed, from daily snapshots +
// final kind inventory. 'tricks-met' when the bar is met at end; otherwise
// the structural split the engine itself forces: the bar counts ONLY
// wave 1-2 counters (monsterCounterKnown requires a `counter` field),
// so a village can know every wave-4 signature and still score 0 new
// bar tricks from it. A genuinely low counter count with no
// observations in flight is a different cause (no teachers / no
// survived encounters) from a count that is high but still short.
function trickShortfallCause(out) {
  const end = barsOf(lastSnap(out));
  const inv = (out.endInventory && out.endInventory.kinds) || {};
  const w4Known = Object.keys(inv).filter(function (k) { return inv[k] && inv[k].villageKnowsTrick; });
  const w4Obs = Object.keys(inv).filter(function (k) { return inv[k] && (inv[k].villageCounterObs | 0) > 0; });
  if (!end) return 'unknown: no daily snapshots';
  if (end.tricks >= ((end.demand && end.demand.tricks) | 0)) return 'tricks-met';
  const daily = out.daily || [];
  const maxTricks = daily.reduce(function (m, s) { const b = barsOf(s); return b ? Math.max(m, b.tricks) : m; }, 0);
  if (w4Known.length) return 'mixed: bar short at ' + end.tricks + ' but ' + w4Known.length + ' wave-4/5 signature(s) known outside the bar count';
  if (w4Obs.length) return 'in-flight: bar short at ' + end.tricks + ' with ' + w4Obs.length + ' wave-4/5 kind(s) at 1/2 observations, none completed';
  if (maxTricks === 0) return 'no-counters-known: village knows 0 bar tricks all run (no teachers, no discoveries)';
  return 'bar-short: ' + end.tricks + ' of ' + ((end.demand && end.demand.tricks) | 0) + ', max ' + maxTricks + ' during run';
}
// Which single bar binds most often across daily snapshots (for the
// "comparable, not anecdotal" leg): count days each bar is short.
function barShortDays(out) {
  const counts = { armor: 0, weapons: 0, tricks: 0, veterans: 0, days: 0 };
  for (const s of (out.daily || [])) {
    const b = barsOf(s);
    if (!b) continue;
    counts.days++;
    for (const sh of b.short) { if (counts[sh] != null) counts[sh]++; }
  }
  return counts;
}
function fightCensus(ex) {
  const start = ex.trickInventoryStart || null;
  const availAtStart = (start && start.activatables) || [];
  const availIds = availAtStart.filter(function (a) { return a && a.available; }).map(function (a) { return a.id; });
  const pressed = [];
  for (const a of (ex.abilityUses || [])) {
    const raw = (a && a.args && a.args[0] != null) ? String(a.args[0]) : null;
    if (!raw) continue;
    // useAbility is called with the bare ability id ('rage'), while
    // activatables carry composite ids ('rage.unleash_rage'): join on
    // the composite when one matches, else keep the raw id.
    const match = availIds.find(function (id) { return id === raw || id.indexOf(raw + '.') === 0; });
    pressed.push(match || raw);
  }
  const pressedSet = {};
  pressed.forEach(function (id) { pressedSet[id] = (pressedSet[id] || 0) + 1; });
  const neverPressed = availIds.filter(function (id) { return !pressedSet[id]; });
  const abilityHits = (ex.hits || []).filter(function (h) { return h.sourceClass === 'ability-or-trick'; });
  const abilityDamage = abilityHits.reduce(function (s, h) { return s + ((h.hpDelta != null && h.hpDelta < 0) ? -h.hpDelta : 0); }, 0);
  const turns = ex.turns || [];
  const abilityTurns = turns.filter(function (tr) { return (tr.actions || []).some(function (a) { return a.kind === 'ability'; }); }).length;
  return {
    seq: ex.seq, day: ex.day, mid: ex.mid, outcome: ex.end ? ex.end.result : null,
    trickKnown: ex.trickKnown, villageKnowsTrick: start && start.trick ? start.trick.villageKnowsTrick : null,
    sigDef: start && start.trick ? start.trick.hasSigDef : null,
    obsAtStart: start && start.trick ? start.trick.villageCounterObs : null,
    slainAtStart: start && start.trick ? start.trick.villageSlain : null,
    scholarAbilitiesAtStart: start ? start.scholarAbilities : null,
    availAtStart: availIds, pressedCounts: pressedSet, neverPressed: neverPressed,
    abilityTurns: abilityTurns, abilityHits: abilityHits.length, abilityDamage: abilityDamage,
    round1Actions: (ex.round1Actions || []).map(function (a) { return a.fn; }),
    turns: turns.length,
  };
}
// Round-1 correction (pilot finding): the pending-buffer hypothesis was
// wrong. Round-1 player actions do NOT run inside startCombat: startCombat
// only advances AI turns until the player turn arrives, then returns;
// the policy's round-1 action runs AFTER startCombat returns, when the
// exposure already exists — but the round-1 TURN record was never opened,
// because tbBeginTurn fired inside startCombat while no exposure existed.
// The action itself IS in actionAvailLog (round 1, turnIndex 0): that log,
// not ex.round1Actions, is the round-1 census. round1Actions stays empty
// by construction and must not be read as "no round-1 action".
function round1Summary(out) {
  const bySeq = {};
  for (const l of (out.actionAvailLog || [])) {
    if (l.round !== 1 || l.seq == null) continue;
    if (!bySeq[l.seq]) bySeq[l.seq] = [];
    bySeq[l.seq].push(l.fn);
  }
  return { fightsWithRound1: Object.keys(bySeq).length, bySeq: bySeq };
}
function summarizeSeed(out) {
  const exps = out.exposures || [];
  const fights = exps.map(fightCensus);
  const bars = barsOf(lastSnap(out));
  const best = {};
  for (const s of (out.daily || [])) {
    const b = barsOf(s);
    if (!b) continue;
    for (const k of ['armored', 'armed', 'tricks', 'veterans']) best[k] = Math.max(best[k] || 0, b[k]);
  }
  const pressCounts = {};
  for (const f of fights) for (const id of Object.keys(f.pressedCounts)) pressCounts[id] = (pressCounts[id] || 0) + f.pressedCounts[id];
  const neverPressedPool = {};
  for (const f of fights) for (const id of f.neverPressed) neverPressedPool[id] = (neverPressedPool[id] || 0) + 1;
  const withRound1 = round1Summary(out).fightsWithRound1;
  const unclassifiedFighters = fights.filter(function (f) { return !f.scholarAbilitiesAtStart; }).length;
  return {
    seed: out.seed, days: out.days, endReason: out.endReason,
    endBars: bars, bestBars: best, barShortDays: barShortDays(out),
    trickCause: trickShortfallCause(out),
    exposures: exps.length, fights: fights,
    pressCounts: pressCounts, neverPressedPool: neverPressedPool,
    abilityDamageTotal: fights.reduce(function (s, f) { return s + f.abilityDamage; }, 0),
    withRound1: withRound1, unclassifiedFighters: unclassifiedFighters,
    trickEvents: (out.trickEvents || []).length,
    instrumentErrors: (out.instrumentErrors || []).length,
    orphanTbEnds: (out.orphanTbEnds || []).length,
    killRows: (out.killRows || []).length,
  };
}
module.exports = { barsOf: barsOf, lastSnap: lastSnap, trickShortfallCause: trickShortfallCause,
  barShortDays: barShortDays, fightCensus: fightCensus, summarizeSeed: summarizeSeed,
  round1Summary: round1Summary };
