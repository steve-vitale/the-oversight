// bypass-instrument-20261106.js — fight-interior recorder (copy of the
// survivaltime instrument, arm sim-bypass-b, run fleshout-loop-b-20261106T2300Z).
// Lineage change vs survivaltime: the closeTrace won-branch kill join is
// the midnightkill ±1-day join (kill day within ±1 of the fight day,
// same beast, killer fought in the fight). Scripts only, zero src/js.
// DIAG ONLY: no policy built, no lever piloted.
//
// Layers on the stageally instrument (which itself reuses bankkiller /
// killerdeath) and adds a PER-TURN damage trace for every wave-4+
// turn-based fight, so the next blank — what happens INSIDE the fight
// once company is there — can be classified from engine records instead
// of guessed from fight-level aggregates:
//
//  - HIT LOG: every tbDamage call while a wave-4+ TB fight is open,
//    with round, acting fighter (f.order[f.turnIdx]), source key/label,
//    target key/kind, damage requested vs actually applied (tbDamage
//    returns the applied number), and target HP after. tbDamage is the
//    single damage choke point for TB combat (player strikes, ally
//    strikes, monster attacks, beams, shrapnel, status ticks routed
//    through it), so the log is the fight's damage ledger. Direct HP
//    writes that bypass tbDamage are NOT captured (noted as a caveat);
//    no such path is known to carry fight damage on this engine.
//  - TURN RECORDS: tbVillagerTurn / tbMonsterTurn wraps record each
//    world-side turn with damage dealt/taken during that turn (sliced
//    from the hit log), so damage/round splits by side AND by actor.
//  - VERB RECORDS: the player's own verbs — strike / wait / move /
//    rally / warcry / shout / offer_food / flee / useAbility — with
//    round, target, and return value. Rally is the live suspect: the
//    rally verb sets p.acted and advances the turn, so a round-1 rally
//    costs the scholar's round-1 strike; the trace shows whether the
//    scholar strikes in the rally round and what round-1 player damage
//    looks like with vs without a rally.
//  - FIGHT CLOSE: at tbEnd each traced fight is classified from engine
//    records — kill (won + a same-day wave-4 kill-log match whose
//    killer fought in this fight), rout (won, no match), scholar-death
//    (lost), scholar-flee (fled), unfinished (still open at finalize:
//    village died mid-fight). Beast HP at end, rounds, scholar HP at
//    end, and rally cost are attached to the trace.
//
// Wrappers never throw into game code: a recording failure is counted
// in instrumentErrors and the original call's result is returned
// untouched. The trace adds zero RNG draws and zero game-state writes.
//
// Usage: const INST = require('./bypass-instrument-20261106');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
//   inst.t.traces holds the per-fight traces; inst.t.tbFights (from the
//   stageally layer) carries the fight-level rows, each linked by traceSeq.
'use strict';
const STAGEALLY = require('./stageally-instrument-20261106'); // unchanged base

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function kindOf(Game, key) {
  try {
    const f = Game.tbfight;
    const o = f && (f.fighters || []).find(function (x) { return x && x.key === key; });
    if (o) return o.kind || null;
  } catch (e) {}
  return null;
}

function install(Game) {
  const base = STAGEALLY.install(Game);
  const t = base.t;
  t.traces = [];
  t._traceSeq = 0;
  t._trace = null; // open trace session (at most one TB fight at a time)

  function roundOf() {
    try { const f = Game.tbfight; return (f && f.round != null) ? (f.round | 0) : null; } catch (e) { return null; }
  }
  function actorOf() {
    try {
      const f = Game.tbfight;
      if (f && Array.isArray(f.order) && f.turnIdx != null && f.order[f.turnIdx] != null) return String(f.order[f.turnIdx]);
    } catch (e) {}
    return null;
  }
  function fighterHp(key) {
    try {
      const o = Game.tbFighter ? Game.tbFighter(key) : null;
      if (!o) return { hp: null, maxHp: null };
      return { hp: (o.hp != null ? o.hp : null), maxHp: (o.maxHp != null ? o.maxHp : null) };
    } catch (e) { return { hp: null, maxHp: null }; }
  }
  function monsterHpSum(f) {
    try {
      let hp = 0, max = 0;
      (f.fighters || []).forEach(function (o) {
        if (o && (o.kind === 'monster' || o.kind === 'hostile')) { hp += Math.max(0, o.hp || 0); max += Math.max(0, o.maxHp || o.hp || 0); }
      });
      return { hp: hp, max: max };
    } catch (e) { return { hp: null, max: null }; }
  }
  function humanFighters(f) {
    try {
      return (f.fighters || []).filter(function (x) { return x && (x.kind === 'villager' || x.kind === 'ally' || x.kind === 'player') && x.villagerId; })
        .map(function (x) { return x.villagerId; });
    } catch (e) { return []; }
  }

  // ---- startCombat: open a trace session for wave-4+ TB fights ----
  const origStart = Game.startCombat;
  if (typeof origStart === 'function') {
    Game.startCombat = function () {
      const midArg = arguments.length ? arguments[0] : null;
      let ret;
      try { ret = origStart.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        // A fight that dissolved without tbEnd leaves a stale open trace;
        // close it as unfinished before opening the new one — never two
        // sessions open, never a silently dropped fight.
        if (t._trace) closeTrace('unfinished');
        const f = Game.tbfight;
        if (f && !f.over) {
          let maxWave = null, mids = [];
          (f.fighters || []).forEach(function (o) {
            if (!o) return;
            if (o.kind === 'monster' || o.kind === 'hostile') {
              const w = (o.mdef && o.mdef.wave != null) ? (o.mdef.wave | 0) : null;
              if (w != null && (maxWave == null || w > maxWave)) maxWave = w;
              const id = (o.mdef && o.mdef.id) || o.monsterId || o.id || null;
              if (id) mids.push(id);
            }
          });
          if (maxWave != null && maxWave >= 4) {
            t._traceSeq += 1;
            const ms = monsterHpSum(f);
            const humans = humanFighters(f);
            const sv = Game.villagerId || null;
            if (sv && humans.indexOf(sv) < 0) humans.push(sv);
            const row0 = t._currentTb || null;
            t._trace = {
              seq: t._traceSeq, tbSeq: row0 ? row0.seq : null,
              day: dayOf(Game), mid: mids[0] || midArg || null, mids: mids, wave: maxWave,
              entryHp: ms.hp, entryMaxHp: ms.max,
              entryFrac: (ms.max > 0) ? +(ms.hp / ms.max).toFixed(3) : null,
              fighters: humans.slice(),
              alliesAtEntry: row0 ? row0.alliesAtEntry : null,
              partyAtEntry: row0 ? row0.partyAtEntry : null,
              hits: [], turns: [], verbs: [],
              outcome: null, ending: null, mHpLeft: null, mHpLeftFrac: null,
              rounds: null, scholarHpEnd: null, scholarHpFracEnd: null,
              rallyRound: null, rallyOk: null, scholarStruckRallyRound: null,
              _open: true, _fight: f,
            };
            if (row0) row0.traceSeq = t._trace.seq;
          }
        }
      } catch (e) { t.instrumentErrors.push('startCombat-trace: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing'); }

  // ---- tbDamage: the hit log (single damage choke point) ----
  const origDamage = Game.tbDamage;
  if (typeof origDamage === 'function') {
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
      let ret;
      try { ret = origDamage.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (t._trace) {
          const after = fighterHp(targetKey);
          t._trace.hits.push({
            r: roundOf(), actor: actorOf(), actorKind: actorOf() ? kindOf(Game, actorOf()) : null,
            src: sourceKey != null ? String(sourceKey) : null,
            srcLabel: sourceLabel != null ? String(sourceLabel).slice(0, 80) : null,
            tgt: targetKey != null ? String(targetKey) : null,
            tgtKind: kindOf(Game, targetKey),
            req: (dmg != null ? dmg : null), dmg: (ret != null ? ret : null),
            hpAfter: after.hp, maxHp: after.maxHp,
          });
        }
      } catch (e) { t.instrumentErrors.push('tbDamage-trace: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('tbDamage-missing'); }

  // ---- world-side turns: damage dealt/taken per actor turn ----
  function wrapTurn(name) {
    const orig = Game[name];
    if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing'); return null; }
    Game[name] = function (actor) {
      const before = t._trace ? t._trace.hits.length : 0;
      const r0 = roundOf();
      let ret;
      try { ret = orig.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (t._trace && actor) {
          const key = actor.key != null ? String(actor.key) : null;
          const added = t._trace.hits.slice(before);
          let dealt = 0, dealtToMonster = 0, taken = 0, hitCount = 0, struck = 0;
          added.forEach(function (h) {
            if (h.actor === key) {
              hitCount++;
              if ((h.dmg | 0) > 0) {
                dealt += (h.dmg | 0);
                if (h.tgtKind === 'monster' || h.tgtKind === 'hostile') { dealtToMonster += (h.dmg | 0); struck++; }
              }
            }
            if (h.tgt === key && (h.dmg | 0) > 0) taken += (h.dmg | 0);
          });
          const after = fighterHp(key);
          t._trace.turns.push({
            r: r0, actor: key, kind: actor.kind || null, name: actor.name || null,
            verb: name, hits: hitCount, dealt: dealt, dealtToMonster: dealtToMonster,
            struck: struck, taken: taken, hpAfter: after.hp, maxHp: after.maxHp,
          });
        }
      } catch (e) { t.instrumentErrors.push(name + '-trace: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
    return orig;
  }
  const origVillagerTurn = wrapTurn('tbVillagerTurn');
  const origMonsterTurn = wrapTurn('tbMonsterTurn');

  // ---- player verbs ----
  function wrapVerb(name, verb, argPick) {
    const orig = Game[name];
    if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing'); return null; }
    Game[name] = function () {
      const r0 = roundOf();
      let ret;
      try { ret = orig.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (t._trace) {
          const rec = { r: r0, verb: verb, ok: !!ret };
          if (argPick) {
            const picked = argPick.apply(null, arguments);
            if (picked) Object.assign(rec, picked);
          }
          t._trace.verbs.push(rec);
          if (verb === 'rally' && ret) { t._trace.rallyRound = r0; t._trace.rallyOk = true; }
        }
      } catch (e) { t.instrumentErrors.push(name + '-trace: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
    return orig;
  }
  const origStrike = wrapVerb('tbPlayerStrike', 'strike', function (targetKey) { return { target: targetKey != null ? String(targetKey) : null }; });
  const origWait = wrapVerb('tbPlayerWait', 'wait', null);
  const origMove = wrapVerb('tbPlayerMove', 'move', function (x, y) { return { to: [x, y] }; });
  const origRally = wrapVerb('tbPlayerRally', 'rally', null);
  const origWarCry = wrapVerb('tbPlayerWarCry', 'warcry', null);
  const origShout = wrapVerb('tbPlayerShout', 'shout', null);
  const origOffer = wrapVerb('tbPlayerOfferFood', 'offer_food', null);
  let origFlee = null;
  if (typeof Game.tbPlayerFlee === 'function') origFlee = wrapVerb('tbPlayerFlee', 'flee', null);
  const origUseAbility = wrapVerb('useAbility', 'ability', function (aid, act) {
    return { aid: aid != null ? String(aid) : null, act: act != null ? String(act) : null, actor: actorOf() };
  });

  // ---- tbEnd: close the trace with the finishing classification ----
  const origTbEnd = Game.tbEnd;
  if (typeof origTbEnd === 'function') {
    Game.tbEnd = function (result) {
      const f0 = Game.tbfight;
      const row0 = t._currentTb || null;
      const trace0 = t._trace || null;
      let ret;
      try { ret = origTbEnd.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (trace0) closeTrace(result, f0, row0);
      } catch (e) { t.instrumentErrors.push('tbEnd-trace: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('tbEnd-missing'); }

  function closeTrace(result, f0, row0) {
    const tr = t._trace;
    if (!tr) return;
    t._trace = null;
    tr._open = false;
    try {
      // End state reads off the trace's own fight object (it survives
      // detachment; its fighters still carry end HP) — never off the
      // live Game.tbfight, which may already be a NEW fight when a
      // stale session is closed at the next startCombat.
      const f = (tr._fight || f0 || Game.tbfight);
      const ms = f ? monsterHpSum(f) : { hp: null, max: null };
      tr.outcome = (result == null ? null : String(result));
      tr.rounds = (f && f.round != null) ? (f.round | 0) : tr.rounds;
      tr.mHpLeft = ms.hp;
      tr.mHpLeftFrac = (ms.max > 0) ? +(ms.hp / ms.max).toFixed(3) : null;
      try {
        const p = (f && f.fighters ? f.fighters : []).find(function (o) { return o && o.key === 'p'; });
        if (p) { tr.scholarHpEnd = (p.hp != null ? p.hp : null); tr.scholarHpFracEnd = +(((p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1)).toFixed(3)); }
      } catch (e2) {}
      // Finishing classification from engine records (finishprobe shape):
      // won + a same-day wave-4 kill-log match whose killer fought here
      // is a kill; won without one is a rout (monster fled/dismissed);
      // lost is the scholar's death; fled is the scholar's flight.
      // CORRECTION (sim-fightinterior-b, 2026-11-06): tbEnd also emits
      // result 'routed' (e.g. the 51006 d105 Strike standoff) — the
      // preregged taxonomy holds only 'rout', so un-normalized it
      // counted as UNCLASSIFIED and cost D1 by one fight. Normalize it
      // here; the judged corpus is NOT re-run.
      let ending = tr.outcome;
      if (tr.outcome === 'won') {
        let matched = false;
        try {
          const kills = t.killsLive || [];
          // MIDNIGHTKILL ±1-DAY JOIN (sim-bypass-b; sibling arm
          // sim-midnightkill-b): a fight that starts one day and logs
          // its kill the next scores as a kill, not a rout. Same-beast
          // guard — an adjacent-day kill of a different monster by
          // the same fighter must NOT match. killsLive entries carry
          // day/mid/wave/by (waveKillLog uses d/w instead).
          matched = kills.some(function (k) {
            return k && Math.abs((k.day | 0) - (tr.day | 0)) <= 1 &&
              ((k.wave | 0) >= 4) && tr.fighters.indexOf(k.by) >= 0 &&
              ((tr.mids || []).indexOf(k.mid) >= 0 || tr.mid === k.mid);
          });
        } catch (e2) {}
        ending = matched ? 'kill' : 'rout';
      } else if (tr.outcome === 'lost') ending = 'scholar-death';
      else if (tr.outcome === 'fled') ending = 'scholar-flee';
      else if (tr.outcome === 'routed') ending = 'rout';
      else if (tr.outcome === 'unfinished') ending = 'unfinished';
      tr.ending = ending;
      // Rally cost: did the scholar strike in the rally round? A rally
      // sets p.acted and advances the turn, so a strike in the same
      // round should be impossible unless a commanded extra turn fired.
      if (tr.rallyRound != null) {
        tr.scholarStruckRallyRound = tr.hits.some(function (h) {
          return h.r === tr.rallyRound && h.actor === 'p' && (h.tgtKind === 'monster' || h.tgtKind === 'hostile') && (h.dmg | 0) > 0;
        });
      }
      if (row0) { row0.traceSeq = tr.seq; row0.traceEnding = tr.ending; }
      // The fight object is a live engine reference (circular, huge) —
      // never let it into the serialized corpus.
      try { delete tr._fight; } catch (e2) {}
      t.traces.push(tr);
    } catch (e) { t.instrumentErrors.push('closeTrace: ' + String(e.message).slice(0, 80)); }
  }

  const origFinalize = base.finalize;
  base.finalize = function () {
    try { if (t._trace) closeTrace('unfinished'); } catch (e) { t.instrumentErrors.push('finalize-trace: ' + String(e.message).slice(0, 80)); }
    return origFinalize();
  };

  const origUninstall = base.uninstall;
  base.uninstall = function () {
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origDamage === 'function') Game.tbDamage = origDamage; } catch (e) {}
    try { if (typeof origVillagerTurn === 'function') Game.tbVillagerTurn = origVillagerTurn; } catch (e) {}
    try { if (typeof origMonsterTurn === 'function') Game.tbMonsterTurn = origMonsterTurn; } catch (e) {}
    try { if (typeof origStrike === 'function') Game.tbPlayerStrike = origStrike; } catch (e) {}
    try { if (typeof origWait === 'function') Game.tbPlayerWait = origWait; } catch (e) {}
    try { if (typeof origMove === 'function') Game.tbPlayerMove = origMove; } catch (e) {}
    try { if (typeof origRally === 'function') Game.tbPlayerRally = origRally; } catch (e) {}
    try { if (typeof origWarCry === 'function') Game.tbPlayerWarCry = origWarCry; } catch (e) {}
    try { if (typeof origShout === 'function') Game.tbPlayerShout = origShout; } catch (e) {}
    try { if (typeof origOffer === 'function') Game.tbPlayerOfferFood = origOffer; } catch (e) {}
    try { if (typeof origFlee === 'function') Game.tbPlayerFlee = origFlee; } catch (e) {}
    try { if (typeof origUseAbility === 'function') Game.useAbility = origUseAbility; } catch (e) {}
    try { if (typeof origTbEnd === 'function') Game.tbEnd = origTbEnd; } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };

  return base;
}

module.exports = { install: install };
