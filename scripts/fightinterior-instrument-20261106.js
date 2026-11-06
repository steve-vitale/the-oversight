// fightinterior-instrument-20261106.js — fight-interior recorder
// (arm sim-fightinterior-b, run fleshout-loop-b-20261106T1430Z). Scripts
// only, zero src/js. DIAG ONLY: no policy built, no lever piloted.
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
//  - PYRRHIC / UNCLOSED (sim-pyrrhic-b, 2026-11-06, findings #1811/
//    #1822): closeTrace ALSO reads Game.state.waveKillLog — the
//    authority (MONSTER-WAVES.md veterans rule) — so the two shapes
//    the 'won'-only kill match hid are visible: a 'lost' fight whose
//    beast died anyway (recordPyrrhicKill wrote the log directly,
//    bypassing recordWaveKill) closes as 'pyrrhic-kill', and an
//    'unfinished' fight with a matching log entry and the beast at 0
//    HP closes as 'kill-unclosed'. A still-'unfinished' trace carries
//    unfinishedKind (village-died / dissolved / horizon) by close
//    path. The 'won' path is unchanged; 'routed' normalizes to
//    'rout' (sim-fightinterior-b D1, 304ced6cf).
//
// Wrappers never throw into game code: a recording failure is counted
// in instrumentErrors and the original call's result is returned
// untouched. The trace adds zero RNG draws and zero game-state writes.
// The close-time log read is a READ only — it never calls
// recordWaveKill, never scores deeds, never touches loot (the
// 2026-10-17 pyrrhic steve-call boundary is untouched).
//
// Usage: const INST = require('./fightinterior-instrument-20261106');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
//   inst.t.traces holds the per-fight traces; inst.t.tbFights (from the
//   stageally layer) carries the fight-level rows, each linked by traceSeq.
'use strict';
const STAGEALLY = require('./stageally-instrument-20261106');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function kindOf(Game, key) {
  try {
    const f = Game.tbfight;
    const o = f && (f.fighters || []).find(function (x) { return x && x.key === key; });
    if (o) return o.kind || null;
  } catch (e) {}
  return null;
}

// ---- PYRRHIC / UNCLOSED classification (sim-pyrrhic-b, 2026-11-06) ----
// Pure functions over (trace, waveKillLog entries, killsLive entries) so
// the committed corpus can be re-classified offline with the SAME logic
// the live close path runs — not a copy. Log entries use {d, w};
// killsLive entries use {day, wave}; both normalize to {day, mid, wave,
// by, via}. A match is: wave >= 4, fight day ± 1 (sim-midnightkill-b,
// 2026-11-06 — a fight that starts one day and logs its kill the next
// scores 0 under strict same-day matching), same monster id, killer in
// this fight's fighters list. The ±1 window NEEDS the same-beast guard:
// without it a 'won' rout trace could match a field/contest kill by the
// same fighter on an adjacent day, so the kill's mid must be one of the
// trace's mids (falling back to tr.mid, and to the old day+fighter+wave
// check only when the trace carries no monster id at all).
//   pyrrhic match: the entry must NOT be in killsLive — recordWaveKill
//     writes BOTH the log and killsLive, so a log-only entry is exactly
//     the recordPyrrhicKill shape (tbEnd 'lost' branch). Without the
//     exclusion, a same-day grind kill by a companion who also fought
//     in a later lost fight would false-match as pyrrhic.
//   unclosed match: any log entry (live or not — a recordWaveKill kill
//     whose fight never closed through tbEnd IS in killsLive); the
//     caller additionally requires mHpLeft === 0, so a same-day kill
//     from a LATER fight cannot match a trace whose beast survived.
// logEntries SHOULD be the entries appended during this fight (the
// live path slices from the trace-open snapshot); the offline path
// passes the whole log and leans on the guards above instead.
function sameBeast(tr, mid) {
  if (!mid) return false;
  try {
    if (Array.isArray(tr.mids) && tr.mids.length) return tr.mids.indexOf(mid) >= 0;
    if (tr.mid) return tr.mid === mid;
  } catch (e) {}
  return true; // trace carries no monster id at all: cannot disprove
}
function withinOneDay(a, b) {
  if (a == null || b == null) return false;
  return Math.abs((a | 0) - (b | 0)) <= 1;
}
function normKill(e) {
  if (!e || typeof e !== 'object') return null;
  const day = (e.d != null) ? e.d : e.day;
  const wave = (e.w != null) ? e.w : e.wave;
  if (day == null || !e.mid) return null;
  return { day: day, mid: e.mid, wave: (wave | 0) || 0, by: e.by || null, via: e.via || null };
}
function killKey(k) { return k.day + '|' + k.mid + '|' + (k.by || null) + '|' + (k.via || 'unknown'); }

function matchLogKills(tr, logEntries, liveEntries, excludeLive) {
  const liveKeys = {};
  try {
    (liveEntries || []).forEach(function (e) {
      const n = normKill(e);
      if (n) liveKeys[killKey(n)] = true;
    });
  } catch (e) {}
  const out = [];
  try {
    (logEntries || []).forEach(function (e) {
      const n = normKill(e);
      if (!n) return;
      if ((n.wave | 0) < 4) return;
      if (!withinOneDay(n.day, tr.day)) return;
      if (!sameBeast(tr, n.mid)) return;
      if (!tr.fighters || tr.fighters.indexOf(n.by) < 0) return;
      if (excludeLive && liveKeys[killKey(n)]) return;
      out.push(n);
    });
  } catch (e) {}
  return out;
}
function matchLogKill(tr, logEntries, liveEntries, excludeLive) {
  const hits = matchLogKills(tr, logEntries, liveEntries, excludeLive);
  return hits.length ? hits[0] : null;
}

// The 'won'-branch kill join, as a list (sim-midnightkill-b): killsLive
// entries matching this trace — wave >= 4, fight day ± 1, same beast,
// killer fought in this fight. The live close path uses matchWonKill
// (first match); the reclassifier counts the list for ambiguity.
function matchWonKills(tr, liveEntries) {
  const out = [];
  try {
    (liveEntries || []).forEach(function (e) {
      const n = normKill(e);
      if (!n) return;
      if ((n.wave | 0) < 4) return;
      if (!withinOneDay(n.day, tr.day)) return;
      if (!sameBeast(tr, n.mid)) return;
      if (!tr.fighters || tr.fighters.indexOf(n.by) < 0) return;
      out.push(n);
    });
  } catch (e) {}
  return out;
}
function matchWonKill(tr, liveEntries) {
  const hits = matchWonKills(tr, liveEntries);
  return hits.length ? hits[0] : null;
}

// The single finishing classifier. closeKind is where the trace closed:
// 'tbEnd' (a real tbEnd result), 'stale' (closed when the next fight
// opened — the fight dissolved without tbEnd while the run continued),
// 'finalize' (closed at run end with the fight still open), 'unknown'
// (offline re-classification of a pre-fix corpus, which recorded no
// close path). villageLost is only read on the 'finalize' path.
// Unknown tbEnd results pass through unchanged (fail-visible: the
// analyzer counts them unclassified rather than inventing a class).
function classifyEnding(tr, logEntries, liveEntries, closeKind, villageLost) {
  const outcome = (tr.outcome != null) ? String(tr.outcome) : null;
  if (outcome === 'won') {
    // ±1-day join (sim-midnightkill-b): a fight that starts one day and
    // logs its kill the next scores as a kill, not a rout. Same-beast
    // guard via matchWonKill — an adjacent-day kill of a different
    // monster by the same fighter must NOT match.
    const hit = matchWonKill(tr, liveEntries || []);
    return { ending: hit ? 'kill' : 'rout', unfinishedKind: null };
  }
  if (outcome === 'lost') {
    const hit = matchLogKill(tr, logEntries, liveEntries, true);
    return { ending: hit ? 'pyrrhic-kill' : 'scholar-death', unfinishedKind: null };
  }
  if (outcome === 'fled') return { ending: 'scholar-flee', unfinishedKind: null };
  if (outcome === 'routed') return { ending: 'rout', unfinishedKind: null };
  if (outcome === 'unfinished') {
    const hit = matchLogKill(tr, logEntries, liveEntries, false);
    if (hit && tr.mHpLeft === 0) return { ending: 'kill-unclosed', unfinishedKind: null };
    let kind = 'unknown';
    if (closeKind === 'finalize') kind = villageLost ? 'village-died' : 'horizon';
    else if (closeKind === 'stale') kind = 'dissolved';
    return { ending: 'unfinished', unfinishedKind: kind };
  }
  return { ending: outcome, unfinishedKind: null };
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
        // sessions open, never a silently dropped fight. Close path
        // 'stale': the run continued, so an unclosed trace here is a
        // dissolved fight, not a dead village (sim-pyrrhic-b).
        if (t._trace) closeTrace('unfinished', null, null, 'stale');
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
            // PYRRHIC SNAPSHOT (sim-pyrrhic-b): waveKillLog length at
            // trace open — only entries appended during this fight are
            // candidates at close, so a later same-day grind kill can
            // never false-match this trace as pyrrhic.
            let _logLenAtOpen = 0;
            try { _logLenAtOpen = (((Game.state || {}).waveKillLog) || []).length; } catch (e) {}
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
              _open: true, _fight: f, _logLenAtOpen: _logLenAtOpen,
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
        if (trace0) closeTrace(result, f0, row0, 'tbEnd');
      } catch (e) { t.instrumentErrors.push('tbEnd-trace: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('tbEnd-missing'); }

  function closeTrace(result, f0, row0, closeKind) {
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
      // Finishing classification from engine records (finishprobe shape),
      // now via the single shared classifier (sim-pyrrhic-b): the
      // 'won' match against killsLive is unchanged; 'lost' and
      // 'unfinished' additionally match the waveKillLog entries written
      // during this fight (see classifyEnding). closeKind tells the
      // 'unfinished' split which shape closed the trace. The log read
      // is a READ only — no deed, no loot, no game-state write.
      let logNew = [];
      try {
        const full = (((Game.state || {}).waveKillLog) || []);
        const from = (tr._logLenAtOpen != null) ? tr._logLenAtOpen : 0;
        logNew = full.slice(from);
      } catch (e2) {}
      let villageLost = false;
      try { villageLost = !!Game.villageLost; } catch (e2) {}
      const cls = classifyEnding(tr, logNew, t.killsLive || [], closeKind || 'tbEnd', villageLost);
      tr.ending = cls.ending;
      if (cls.unfinishedKind != null) tr.unfinishedKind = cls.unfinishedKind;
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
      // never let it into the serialized corpus. The log snapshot is
      // internal timing too — same treatment.
      try { delete tr._fight; } catch (e2) {}
      try { delete tr._logLenAtOpen; } catch (e2) {}
      t.traces.push(tr);
    } catch (e) { t.instrumentErrors.push('closeTrace: ' + String(e.message).slice(0, 80)); }
  }

  const origFinalize = base.finalize;
  base.finalize = function () {
    try { if (t._trace) closeTrace('unfinished', null, null, 'finalize'); } catch (e) { t.instrumentErrors.push('finalize-trace: ' + String(e.message).slice(0, 80)); }
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

module.exports = { install: install, classifyEnding: classifyEnding,
  matchLogKill: matchLogKill, matchLogKills: matchLogKills, normKill: normKill,
  matchWonKill: matchWonKill, matchWonKills: matchWonKills, sameBeast: sameBeast,
  killKey: killKey, withinOneDay: withinOneDay };
