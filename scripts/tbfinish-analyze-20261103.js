// tbfinish-analyze-20261103.js — turn-economy analyzer (arm sim-tbfinish-a).
// Pure functions over the tbfinish instrument's per-seed JSONs.
// Turn classes are mutually exclusive, fixed by the prereg, applied in
// this order: stunned-full, strike-landed, strike-missed, wait,
// flee-attempt, trick-or-ability, move-only, failed-strike, no-action.
// A turn whose class cannot be read is an analyzer error, never folded.
'use strict';

function classify(ex) {
  const end = ex.end;
  if (!end) return 'tb-unended';
  const kills = ex.kills || [];
  const r = String(end.result);
  if ((r === 'won' || r === 'routed') && kills.length) return 'kill';
  if (r === 'lost' && kills.length) return 'pyrrhic';
  if (r === 'lost') return 'fighter-died';
  if (r === 'fled') return 'fled';
  return 'tb-other:' + r;
}

function ledgerFor(ex) {
  const out = [];
  for (const m of (ex.monsters || [])) {
    const dealt = (ex.hits || []).filter(function (h) {
      return h.targetKind === 'monster' && h.targetKey === m.key && (h.hpDelta || 0) < 0;
    }).reduce(function (s, h) { return s + (-h.hpDelta); }, 0);
    const healed = (ex.hits || []).filter(function (h) {
      return h.targetKind === 'monster' && h.targetKey === m.key && (h.hpDelta || 0) > 0;
    }).reduce(function (s, h) { return s + h.hpDelta; }, 0);
    let endHp = null;
    if (ex.end && ex.end.monsters) {
      const em = ex.end.monsters.find(function (x) { return x.key === m.key; });
      if (em) endHp = em.hp;
    }
    const gap = (endHp == null || m.hpStart == null) ? null : (endHp - (m.hpStart - dealt + healed));
    out.push({ key: m.key, mid: m.mid, startHp: m.hpStart, maxHp: m.maxHp,
      dealt: dealt, healed: healed, endHp: endHp, gap: gap, joinedMidFight: !!m.joinedMidFight });
  }
  return out;
}

function turnHits(ex, turn) {
  return (ex.hits || []).filter(function (h) { return h.turnSeq === turn.turnSeq; });
}
function leaderHitsOnMonsters(ex, turn) {
  return turnHits(ex, turn).filter(function (h) {
    return h.targetKind === 'monster' && h.sourceClass === 'leader' && (h.hpDelta || 0) < 0;
  });
}
function actedFlag(a) {
  // An action "spent" the turn if the post snapshot shows acted, or the
  // call returned true on a verb that sets acted (strike/wait/etc.).
  return !!(a.post && a.post.player && a.post.player.acted);
}
function strikeReason(turn) {
  const lines = turn.sayLines || [];
  const pats = ['Too far', "can't reach", 'No movement left', 'Already acted',
    'No ', 'afterimages', 'too high', 'circling high', 'already down', 'gone — fled'];
  for (const ln of lines) {
    for (const p of pats) { if (ln.indexOf(p) >= 0) return ln.slice(0, 120); }
  }
  return 'UNRECORDED-reason';
}
function isEdge(pos, gridMax) {
  if (!pos || pos.mx == null || pos.my == null) return false;
  const gm = (gridMax == null ? 8 : gridMax);
  return pos.mx <= 0 || pos.my <= 0 || pos.mx >= gm || pos.my >= gm;
}

function classifyTurn(ex, turn) {
  const acts = turn.actions || [];
  const byKind = function (k) { return acts.filter(function (a) { return a.kind === k; }); };
  const strikes = byKind('strike');
  const moves = byKind('move');
  const waits = byKind('wait');
  const barriers = byKind('barrierExit');
  const tricks = acts.filter(function (a) {
    return ['shout', 'offerFood', 'study', 'talk', 'rally', 'warcry', 'flip', 'ability'].indexOf(a.kind) >= 0;
  });
  const start = turn.start || {};
  const sp = start.player || {};
  const landed = leaderHitsOnMonsters(ex, turn);
  const dealt = turnHits(ex, turn).filter(function (h) {
    return h.targetKind === 'monster' && (h.hpDelta || 0) < 0;
  }).reduce(function (s, h) { return s + (-h.hpDelta); }, 0);
  const movesSpent = (sp.moveLeft != null && turn.end && turn.end.player && turn.end.player.moveLeft != null)
    ? (sp.moveLeft - turn.end.player.moveLeft) : null;
  const dists = start.dists || [];
  const minDist = dists.length ? Math.min.apply(null, dists.map(function (d) { return d.dist; }).filter(function (d) { return d != null; })) : null;
  const range = (start.weapon || {}).range;
  const outOfRangeAtStart = (minDist != null && range != null) ? (minDist > range) : null;
  const endDists = (turn.end && turn.end.dists) || [];
  const endMinDist = endDists.length ? Math.min.apply(null, endDists.map(function (d) { return d.dist; }).filter(function (d) { return d != null; })) : null;
  const endOutOfRange = (endMinDist != null && range != null) ? (endMinDist > range) : null;
  const edgeAtEnd = (turn.end && turn.end.player) ? isEdge(turn.end.player, 8) : false;
  const fleeAttempt = barriers.length > 0 || (moves.length > 0 && edgeAtEnd);
  const flags = { outOfRangeAtStart: outOfRangeAtStart, endOutOfRange: endOutOfRange,
    stunned: (sp.stunned || 0) > 0, blind: (sp.blindTurns || 0) > 0,
    edgeAtEnd: edgeAtEnd, fleeAttempt: fleeAttempt, extra: !!turn.extra,
    movesSpent: movesSpent, minDistStart: minDist, endMinDist: endMinDist,
    strikesAttempted: strikes.length, strikesLanded: landed.length, dealt: dealt };

  let cls = null, reason = null;
  if (sp.stunFull && acts.length === 0) cls = 'stunned-full';
  else if (strikes.some(function (a) { return a.returned === true; }) && landed.length > 0)
    cls = moves.length ? 'move-strike' : 'strike';
  else if (strikes.some(function (a) { return a.returned === true; }))
    cls = moves.length ? 'move-strike-missed' : 'strike-missed';
  else if (waits.length) cls = moves.length ? 'move-wait' : 'wait';
  else if (fleeAttempt) cls = 'flee-attempt';
  else if (tricks.length) cls = 'trick-or-ability';
  else if (moves.length) cls = 'move-only';
  else if (strikes.length) { cls = 'failed-strike'; reason = strikeReason(turn); }
  else cls = 'no-action';
  return { cls: cls, reason: reason, flags: flags };
}

function classifyNpcTurn(nt) {
  const hits = nt.hits || [];
  const dmgToHuman = hits.filter(function (h) { return h.targetKind !== 'monster' && (h.hpDelta || 0) < 0; });
  const dmgToMonster = hits.filter(function (h) { return h.targetKind === 'monster' && (h.hpDelta || 0) < 0; });
  const healToHuman = hits.filter(function (h) { return h.targetKind !== 'monster' && (h.hpDelta || 0) > 0; });
  const finisher = hits.some(function (h) { return (h.requested || 0) >= 9999; });
  const moved = !!(nt.pre && nt.post && (nt.pre.pos.mx !== nt.post.pos.mx || nt.pre.pos.my !== nt.post.pos.my));
  const telegraphSet = !!(!nt.pre.telegraph && nt.post.telegraph);
  const telegraphHeld = !!(nt.post.telegraph);
  if (nt.kind === 'ally') {
    if (dmgToMonster.length) return 'ally-damage';
    if (healToHuman.length) return 'ally-heal';
    if (moved) return 'ally-move';
    return 'ally-other';
  }
  if (finisher) return 'finisher';
  if (dmgToHuman.length) return 'damage';
  if (telegraphSet) return 'telegraph';
  if (telegraphHeld) return 'telegraph-held';
  if (moved) return 'move';
  return 'non-damage';
}

function summarize(ex) {
  const turns = (ex.turns || []).map(function (turn) {
    const c = classifyTurn(ex, turn);
    return { turnSeq: turn.turnSeq, round: turn.round, extra: !!turn.extra,
      cls: c.cls, reason: c.reason, flags: c.flags, closeReason: turn.closeReason,
      nActions: (turn.actions || []).length,
      actionKinds: (turn.actions || []).map(function (a) { return a.kind; }) };
  });
  const npc = (ex.npcTurns || []).map(function (nt) {
    return { kind: nt.kind, key: nt.key, mid: nt.mid, round: nt.round,
      cls: classifyNpcTurn(nt),
      dealtToHuman: nt.hits.filter(function (h) { return h.targetKind !== 'monster' && (h.hpDelta || 0) < 0; }).reduce(function (s, h) { return s + (-h.hpDelta); }, 0),
      dealtToMonster: nt.hits.filter(function (h) { return h.targetKind === 'monster' && (h.hpDelta || 0) < 0; }).reduce(function (s, h) { return s + (-h.hpDelta); }, 0),
      finisher: nt.hits.some(function (h) { return (h.requested || 0) >= 9999; }),
      fled: !!(nt.post && nt.post.fled), died: !!(nt.post && !nt.post.alive) };
  });
  const led = ledgerFor(ex);
  const ledgerOpen = led.some(function (r) { return r.gap !== 0; });
  const finisherHit = (ex.hits || []).find(function (h) { return (h.requested || 0) >= 9999; });
  const hist = {};
  for (const tr of turns) hist[tr.cls] = (hist[tr.cls] || 0) + 1;
  const npcHist = {};
  for (const n of npc) npcHist[n.cls] = (npcHist[n.cls] || 0) + 1;
  const strikesLanded = turns.reduce(function (s, tr) { return s + tr.flags.strikesLanded; }, 0);
  const strikesAttempted = turns.reduce(function (s, tr) { return s + tr.flags.strikesAttempted; }, 0);
  const dealtTotal = turns.reduce(function (s, tr) { return s + tr.flags.dealt; }, 0);
  return { seq: ex.seq, day: ex.day, mid: ex.mid, outcome: classify(ex),
    partySizeStart: ex.partySizeStart, trickKnown: ex.trickKnown,
    rounds: (ex.end && ex.end.round) || null,
    nTurns: turns.length, turns: turns, turnHist: hist,
    npcTurns: npc, npcHist: npcHist,
    strikesAttempted: strikesAttempted, strikesLanded: strikesLanded,
    dealtInPlayerTurns: dealtTotal,
    ledger: led, ledgerOpen: ledgerOpen,
    finisher: finisherHit ? { round: finisherHit.round, requested: finisherHit.requested, landed: -finisherHit.hpDelta } : null,
    kills: ex.kills || [], superseded: !!ex.superseded };
}

module.exports = { classify: classify, classifyTurn: classifyTurn, classifyNpcTurn: classifyNpcTurn,
  ledgerFor: ledgerFor, summarize: summarize, turnHits: turnHits };
