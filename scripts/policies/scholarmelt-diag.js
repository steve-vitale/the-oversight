// scholarmelt-diag — scholar TB-combat melt recorder for sim-scholarmelt-a
// (2026-10-30, flesh-out loop, axis scale-onramp, DIAG ONLY: zero src/js
// changes, policy-side recorder only).
//
// QUESTION (from sim-recurrence-a): 4 wild wave-4 chains end
// BEAST-VANISHED — the (mid,hp) instance is in the daily census one day
// and gone the next, with no villager fight killing it, no finale wipe
// (neither host seed entered the table), and 0 later same-type meetings.
// The remaining code path is a scholar turn-based encounter: startCombat
// lifts the tile monster into the fight, and tbEnd puts it back ONLY if
// it is a titan or a lingering raider. This recorder censuses EVERY
// scholar tb-combat on the band so each vanished chain can be resolved
// to scholar-kill vs scholar-flee-melt vs other, keyed by (seed,mid)
// instance, never type alone.
//
// MECHANISM, READ FROM CODE (game.js, never invented):
//   - startCombat: _origin = playerMonster() (tableTrial excepted);
//     the tile monster is lifted (removeWorldMonster) ONLY when it IS
//     one of this fight's monsters (_originIsFighter, by fighter id or
//     mdef id match — the journey-scale r42 bystander hold). A
//     bystander that is not a fighter stays on its tile, gets no
//     worldOrigin, and is NOT a melt.
//   - tbfight.worldOrigin is set ONLY for a lifted fighter that is a
//     titan or lingering (besieging raider).
//   - tbEnd restores worldOrigin only when result !== 'won'; a
//     lingerer only on 'fled'/'lost'; a titan on any non-won result
//     if still standing and the origin tile is unoccupied. A restored
//     lingerer comes back wounded (fighter HP, floored at 1, capped
//     at pre-fight world HP); a restored titan comes back full.
//   - Every other lifted monster is never put back: it melts.
//   - TB WORLD-HP (wave-4+ gate): the primary fighter (i == 0) for a
//     lifted world monster enters at that monster's world HP, so a
//     wave-4 scholar fight's fighter hpStart corroborates the lift HP
//     (veteran fights excepted: tbWorldHpFor returns null for
//     veterans, so a veteran fighter's hpStart is a fresh roll and
//     must NOT be used to match a chain).
//
// OBSERVATIONAL ONLY. SCHOLARMELT=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where it matters,
// write nothing to game state (store arrays only, plus the same
// installed-flag class the other recorders use), draw no RNG, never
// throw into the engine (recording errors are counted, and an engine
// throw is recorded and RETHROWN unchanged), and return the original
// value untouched. The tile monster is read via monsterAt(map.px,
// map.py) with a scholar mx/my fallback — a pure scan, NEVER via
// playerMonster(), which can adopt a detached alias and would mutate
// state on a refused call. Monster OBJECT references are kept in a
// module-side WeakMap keyed by store — never inside the serialized
// store — so JSON.stringify of a sweep row cannot drag a world object
// (or a cycle) into the corpus. tbfight.id is NEVER stored: it
// contains Date.now()+Math.random() and would break the determinism
// gate; fights are keyed by a per-seed sequential fightSeq assigned
// by the recorder. Same-call routed fights (tbEnd runs inside
// startCombat before the start wrapper's post-record) are handled by
// a pending stack: the start pre-record pushes a pending row; a tbEnd
// whose fight has a pending row adopts it; the start post-record
// then fills start fields only and never overwrites end fields.
// In node sims Game.say is stubbed to a no-op by sim-harness.js, so
// scholar tb fights have NO say transcript in this corpus; the trace
// (lift snapshot, fighter HP path, tb result, post-end world check)
// IS the transcript-equivalent evidence, and the prereg says so.
//
// DISSOLVE-CAUSE (sim-dissolvecause-a, 2026-10-30, flesh-out loop,
// axis scale-onramp): the dissolved population's FATE is settled
// (dissolve-a: 75 restored, 45 spawn-ended, 0 melts) but its CAUSE
// was unmeasured — no call-site field existed. This recorder now
// carries one, still policy-side and still zero src/js changes:
//   - dissolveCause / dissolveObservedAt / scholarHpAtDissolve on
//     every dissolved row (null on non-dissolved rows). The cause
//     is set at the moment the dissolve is OBSERVED and never
//     overwritten by a later flush: 'start-post-gone' (fight gone
//     at startCombat post-record, no tbEnd seen — the prior
//     corpus's only branch), 'flush-next-start' /
//     'flush-tbend-mismatch' / 'flush-sweep-end' (a pending row
//     flushed later by that trigger), or 'barrier-death' (the
//     tbBarrierExit wrap below observed the barrier-death
//     condition for that fight before its flush; the trigger is
//     kept in dissolveObservedAt so the overwrite is auditable).
//   - scholarHpAtDissolve is EXACT dissolve-time HP on
//     start-post rows (the post-record runs immediately after
//     the dissolving call returns, with no intervening action)
//     and FIRST-OBSERVATION HP on flush rows (a bound, not
//     exact: actions between dissolve and flush may have moved
//     HP). The analyzer must never blend the two.
//   - dissolveProbe (start-post rows): bearer/villagerId and
//     Game.over before vs after the dissolving call, scholar HP
//     before vs after, scholar.monster / pendingMonsterId after,
//     and the tbfight state seen ('null' | 'over'). This is what
//     discriminates the barrier-death lead (which needs a live
//     fight, a player turn, and a crossing) from an in-call
//     vanish (bearer unchanged, over false, tbfight null).
//   - tbBarrierExit wrap: delegate, record after, never throw
//     into the engine. It stamps ONLY the live fight's row (top
//     of the pending stack) when the post-call fight is gone
//     with no tbEnd result recorded AND the bearer changed or
//     Game.over is set — the barrier-death signature. Normal
//     barrier paths call tbEnd('fled'), which the tbEnd wrap
//     records, so they never stamp.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.SCHOLARMELT === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }
function scholarHp(Game) { try { return roundHp(((Game.state || {}).scholar || {}).health); } catch (e) { return null; } }

function newStore() {
  return { meetings: [], errs: 0, errors: [], overflow: {}, installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

// Module-side state per store (never serialized): pending start seqs
// in start order, lifted-object references by fightSeq, and
// start-pre snapshots (bearer/over/HP at startCombat pre-record,
// consumed by the post-record probe, never serialized).
const sideState = new WeakMap();
function side(store) {
  let s = sideState.get(store);
  if (!s) { s = { nextSeq: 1, pending: [], refs: new Map(), pre: new Map() }; sideState.set(store, s); }
  return s;
}

function tileMonsterOf(Game) {
  try {
    let px = null, py = null;
    try { if (Game.map && Game.map.px != null) { px = Game.map.px; py = Game.map.py; } } catch (e) {}
    if (px == null) { try { const sc = (Game.state || {}).scholar || {}; px = sc.mx; py = sc.my; } catch (e) {} }
    if (px == null) return { mon: null, px: null, py: null };
    if (typeof Game.monsterAt === 'function') {
      const m = Game.monsterAt(px, py);
      if (m) return { mon: m, px, py };
    }
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    const m = (list || []).find(x => x && x.tx === px && x.ty === py) || null;
    return { mon: m, px, py };
  } catch (e) { return { mon: null, px: null, py: null }; }
}

function snapMonster(m) {
  if (!m) return null;
  return {
    id: m.id != null ? String(m.id) : null,
    hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
    tx: (m.tx != null ? m.tx : null), ty: (m.ty != null ? m.ty : null),
    titan: !!m.titan, lingering: !!m.lingering, veteran: !!m.veteran,
    spawnSeq: (m._spawnSeq != null ? m._spawnSeq : null),
  };
}

function fighterMonsters(fight) {
  const out = [];
  try {
    for (const f of ((fight && fight.fighters) || [])) {
      if (!f || f.kind !== 'monster') continue;
      const mid = ((f.mdef || {}).id || f.monsterId || f.id);
      out.push({ key: f.key != null ? String(f.key) : null,
        monsterId: mid != null ? String(mid) : null,
        hp: roundHp(f.hp), maxHp: roundHp(f.maxHp),
        alive: f.alive !== false, fled: !!f.fled, veteran: !!f.veteran });
    }
  } catch (e) { /* fighters unreadable: caller records the error */ }
  return out;
}

function waveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) { /* fall through */ }
  return 1;
}

function worldCheck(Game, ref, snap) {
  const out = { restoredIdentity: false, restoredEntry: false, restoredHp: null };
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    if (ref && list.indexOf(ref) >= 0) { out.restoredIdentity = true; out.restoredHp = roundHp(ref.hp); }
    if (snap) {
      const hit = (list || []).find(m => m && String(m.id) === String(snap.id) && m.tx === snap.tx && m.ty === snap.ty);
      if (hit) { out.restoredEntry = true; if (out.restoredHp == null) out.restoredHp = roundHp(hit.hp); }
    }
  } catch (e) { /* world check failure: leave false/null, never throw */ }
  return out;
}

function flushDissolved(Game, store, st, seq, day, trigger) {
  // A pending start whose fight is gone without a tbEnd (the game
  // dissolves some fights silently: tbfight.over=true,
  // result='dissolved', tbfight=null — no tbEnd call). The melt
  // verdict still reads off the identity world check: tbEnd is the
  // only restore path, so a lifted object that is not back in the
  // world list by identity has melted. dayEnd here is the FLUSH day
  // (a later start, or sweep-end finalize), not the dissolve day;
  // chain matching uses startDay, never dayEnd, so this is safe.
  // DISSOLVE-CAUSE (sim-dissolvecause-a): a flush NEVER overwrites
  // a cause observed earlier (a start-post observation, or a
  // barrier-death stamp). It only fills the cause when unset:
  // barrier-stamped rows become 'barrier-death' with the stamp-time
  // HP (exact for the barrier site: stamped in the dissolving
  // call's own aftermath); unstamped rows become
  // 'flush-<trigger>' with first-observation HP (a bound).
  try {
    const rec = (store.meetings || []).find(r => r && r.fightSeq === seq) || null;
    if (!rec) return;
    if (rec.result == null) {
      rec.result = 'dissolved-no-tbend';
      rec.dayEnd = day;
      rec.dissolvedFlushed = true;
      const ref = st.refs.get(seq);
      const wc = worldCheck(Game, ref || null, rec.lift);
      rec.restoredIdentity = wc.restoredIdentity;
      rec.restoredEntry = wc.restoredEntry;
      rec.restoredHp = wc.restoredHp;
      if (rec.dissolveCause == null) {
        if (rec.barrierDeathStamp) {
          rec.dissolveCause = 'barrier-death';
          rec.scholarHpAtDissolve = rec.barrierStampHp;
        } else {
          rec.dissolveCause = 'flush-' + (trigger || 'unknown');
          rec.scholarHpAtDissolve = scholarHp(Game);
        }
        rec.dissolveObservedAt = trigger || 'unknown';
      }
    }
    const ix = st.pending.indexOf(seq);
    if (ix >= 0) st.pending.splice(ix, 1);
    try { st.pre.delete(seq); } catch (e2) {}
  } catch (e) { noteErr(store, 'flushDissolved', e); }
}

function fightMonsterIds(fight) {
  const ids = new Set();
  try { for (const f of ((fight && fight.fighters) || [])) if (f && f.kind === 'monster') ids.add(String(((f.mdef || {}).id || f.monsterId || f.id))); } catch (e) {}
  return ids;
}

function finalizeScholarmeltDiag(Game, store) {
  // Sweep-end finalize: if no fight is live, every pending start
  // ended without tbEnd (dissolved); flush it. If a fight IS live,
  // pending rows stay UNENDED (the run ended mid-fight).
  try {
    if (!Game || !store) return;
    const st = side(store);
    if (Game.tbfight && !Game.tbfight.over) return;
    const day = dayOf(Game);
    for (const seq of st.pending.slice()) flushDissolved(Game, store, st, seq, day, 'sweep-end');
  } catch (e) { noteErr(store, 'finalize', e); }
}

function installScholarmeltDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._scholarmeltDiagStore === store && Game._scholarmeltDiagInstalled) return Game._scholarmeltDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };
  const st = side(store);

  wrap('startCombat', (orig) => function () {
    const args = Array.prototype.slice.call(arguments);
    let rec = null;
    try {
      const live = !!(Game.tbfight && !Game.tbfight.over);
      const tm = tileMonsterOf(Game);
      const intended = args[0] || null;
      let pendingId = null;
      try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
      const seq = st.nextSeq++;
      rec = {
        fightSeq: seq,
        kind: live ? 'refused' : 'start',
        dayStart: dayOf(Game), dayEnd: null,
        intendedMid: intended != null ? String(intended) : (pendingId != null ? String(pendingId) : 'bulldozer'),
        tableTrial: !!(args[0] === 'finale' && args[1] && args[1].tableTrial),
        tilePx: tm.px, tilePy: tm.py,
        lift: snapMonster(tm.mon),
        lifted: null, bystander: null,
        fightersStart: null, fightersEnd: null,
        worldOrigin: null, result: null,
        scholarHpStart: null, scholarHpEnd: null,
        restoredIdentity: null, restoredEntry: null, restoredHp: null,
        threw: false, sameCallRouted: false, orphan: false, dissolvedFlushed: false,
        startPostFightGone: false, postStartPresent: null,
        dissolveCause: null, dissolveObservedAt: null, scholarHpAtDissolve: null,
        dissolveProbe: null, barrierDeathStamp: false, barrierStampHp: null,
        barrierStampDay: null, barrierStampBearerChanged: null, barrierStampGameOver: null,
      };
      try { const sc = (Game.state || {}).scholar || {}; rec.scholarHpStart = roundHp(sc.health); } catch (e) {}
      if (tm.mon) st.refs.set(seq, tm.mon);
      if (!live) {
        // A non-refused start proves no earlier fight is live: any
        // pending row left over ended without tbEnd (dissolved).
        for (const oldSeq of st.pending.slice()) flushDissolved(Game, store, st, oldSeq, dayOf(Game), 'next-start');
        // DISSOLVE-CAUSE pre snapshot (module-side, never
        // serialized): bearer/over/HP for the post-record probe.
        try { st.pre.set(seq, { bearer: Game.villagerId, over: !!Game.over, hp: scholarHp(Game) }); } catch (e) {}
        st.pending.push(seq);
        // Hold the row in the store immediately so a same-call tbEnd
        // can adopt it from the meetings array via the pending stack.
        pushCapped(store, 'meetings', rec);
      } else {
        // Refused: nothing is lifted, no pending, no tbEnd expected.
        pushCapped(store, 'meetings', rec);
        rec = null;
      }
    } catch (e) { noteErr(store, 'startCombat.pre', e); }
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) {
      try {
        if (rec) {
          rec.threw = true;
          const ix = st.pending.indexOf(rec.fightSeq);
          if (ix >= 0) st.pending.splice(ix, 1);
          st.pre.delete(rec.fightSeq);
        }
      } catch (e2) { noteErr(store, 'startCombat.throwRec', e2); }
      throw e;
    }
    try {
      if (rec) {
        // If tbEnd already ran inside orig (same-call routed fight),
        // the end fields are filled; fill start fields only.
        if (rec.result == null && Game.tbfight && !Game.tbfight.over) {
          const fight = Game.tbfight || null;
          if (fight) {
            rec.fightersStart = fighterMonsters(fight);
            try { rec.worldOrigin = fight.worldOrigin ? snapMonster(fight.worldOrigin) : null; } catch (e) { rec.worldOrigin = null; }
            // Lifted iff the tile monster is a fighter and is gone
            // from the world list after start.
            if (rec.lift) {
              const isFighter = rec.fightersStart.some(f => f.monsterId === rec.lift.id);
              const ref = st.refs.get(rec.fightSeq);
              let stillThere = false;
              try { const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : []; stillThere = ref ? list.indexOf(ref) >= 0 : false; } catch (e) {}
              rec.lifted = isFighter && !stillThere;
              rec.bystander = !isFighter;
            } else { rec.lifted = false; rec.bystander = false; }
          }
        } else if (rec.result == null) {
          // CORRECTION #2: fight already over (or null) at
          // post-record with NO tbEnd seen — the fight resolved
          // inside startCombat (the herald pattern: 120 dissolved
          // rows left lifted null by the old code). No fighter list
          // is trustworthy here, but lift presence IS observable:
          // present at call return => never removed by this fight
          // (lifted=false); absent => removed during the call with
          // no restore yet (lifted=true). The flush-time identity
          // check later decides melt vs restored; the sink answer
          // for a present object is "not this fight's melt" either
          // way. bystander stays null (fighter list unavailable).
          rec.startPostFightGone = true;
          const fight = Game.tbfight || null;
          if (fight) {
            rec.fightersStart = fighterMonsters(fight);
            try { rec.worldOrigin = fight.worldOrigin ? snapMonster(fight.worldOrigin) : null; } catch (e) { rec.worldOrigin = null; }
          }
          if (rec.lift) {
            const ref = st.refs.get(rec.fightSeq);
            let present = false;
            try { const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : []; present = ref ? list.indexOf(ref) >= 0 : false; } catch (e) {}
            rec.postStartPresent = present;
            rec.lifted = !present;
            rec.bystander = null;
          } else { rec.lifted = false; rec.bystander = false; }
          // DISSOLVE-CAUSE start-post observation (exact HP: this
          // post-record runs immediately after the dissolving call
          // returns, with no intervening action). Never overwrites
          // a barrier stamp (defensive: a stamp cannot pre-exist
          // here, since the fight never had turns — but if one
          // did, the flush resolves it to 'barrier-death').
          if (rec.dissolveCause == null && !rec.barrierDeathStamp) {
            const pre = st.pre.get(rec.fightSeq) || {};
            let bearerAfter = null, overAfter = false, monAfter = null, pendAfter = null;
            try { bearerAfter = Game.villagerId; } catch (e) {}
            try { overAfter = !!Game.over; } catch (e) {}
            try { const s = (Game.state || {}).scholar || {}; monAfter = s.monster ? String(s.monster.id) : null; } catch (e) {}
            try { pendAfter = Game.pendingMonsterId != null ? String(Game.pendingMonsterId) : null; } catch (e) {}
            const hpAfter = scholarHp(Game);
            rec.dissolveCause = 'start-post-gone';
            rec.dissolveObservedAt = 'start-post';
            rec.scholarHpAtDissolve = hpAfter;
            rec.dissolveProbe = {
              tbfightState: Game.tbfight ? 'over' : 'null',
              bearerBefore: (pre.bearer !== undefined ? pre.bearer : null),
              bearerAfter: bearerAfter,
              bearerChanged: (pre.bearer !== undefined ? (pre.bearer !== bearerAfter) : null),
              gameOverBefore: (pre.over !== undefined ? !!pre.over : null),
              gameOverAfter: overAfter,
              scholarHpBefore: (pre.hp !== undefined ? pre.hp : null),
              scholarHpAfter: hpAfter,
              scholarMonsterAfter: monAfter,
              pendingMonsterIdAfter: pendAfter,
            };
          }
        } else if (rec.result != null) {
          rec.sameCallRouted = true;
          // Start fighters are unrecoverable (tbEnd pre-call saw end
          // states); lift fields were filled by the tbEnd path from
          // the pre-start snapshot + post-end world check. Fill
          // lifted/bystander from the fightersEnd record if unset.
          if (rec.lift && rec.lifted == null) {
            const isFighter = (rec.fightersEnd || []).some(f => f.monsterId === rec.lift.id);
            rec.lifted = isFighter && !(rec.restoredIdentity || rec.restoredEntry);
            // NOTE: for a same-call fight, "restored" at tbEnd post
            // already answers lifted-vs-restored; lifted here means
            // "was a fighter and is not back", consistent with the
            // normal path's post-start absence test only when the
            // fight did not restore. If restored, lifted stays true
            // in the mechanism sense (it WAS lifted) — correct it:
            if (isFighter) rec.lifted = true;
            rec.bystander = !isFighter;
          } else if (!rec.lift) { rec.lifted = false; rec.bystander = false; }
        }
        try { st.pre.delete(rec.fightSeq); } catch (e) {}
      }
    } catch (e) { noteErr(store, 'startCombat.post', e); }
    return ret;
  });

  wrap('tbEnd', (orig) => function () {
    const args = Array.prototype.slice.call(arguments);
    const result = args.length ? args[0] : null;
    let rec = null, isOrphan = false;
    try {
      const fight = Game.tbfight || null;
      if (!fight || fight.over) { rec = null; }
      else {
        // Flush any pending row that does not match this fight
        // (dissolved without tbEnd, then a directly-set fight ends):
        // adopting it would misattribute this tbEnd.
        const ids = fightMonsterIds(fight);
        while (st.pending.length) {
          const top = st.pending[st.pending.length - 1];
          const cand = (store.meetings || []).find(r => r && r.fightSeq === top) || null;
          if (!cand) { st.pending.pop(); continue; }
          const matches = cand.lift ? (ids.has(String(cand.lift.id)) || ids.has(String(cand.intendedMid)))
            : ids.has(String(cand.intendedMid));
          if (matches) break;
          flushDissolved(Game, store, st, top, dayOf(Game), 'tbend-mismatch');
        }
        const seq = st.pending.length ? st.pending[st.pending.length - 1] : null;
        if (seq != null) {
          rec = (store.meetings || []).find(r => r && r.fightSeq === seq) || null;
          if (rec) {
            const ix = st.pending.indexOf(seq);
            if (ix >= 0) st.pending.splice(ix, 1);
          }
        }
        if (!rec) {
          // Orphan end: a fight whose start was not recorded (direct
          // tbfight set, save-restored fight, or pre-install start).
          isOrphan = true;
          const oseq = st.nextSeq++;
          rec = {
            fightSeq: oseq, kind: 'orphan-end', dayStart: null, dayEnd: null,
            intendedMid: null, tableTrial: !!(fight.tableTrial),
            tilePx: null, tilePy: null, lift: null, lifted: null, bystander: null,
            fightersStart: null, fightersEnd: null, worldOrigin: null,
            result: null, scholarHpStart: null, scholarHpEnd: null,
            restoredIdentity: null, restoredEntry: null, restoredHp: null,
            threw: false, sameCallRouted: false, orphan: true, dissolvedFlushed: false,
            dissolveCause: null, dissolveObservedAt: null, scholarHpAtDissolve: null,
            dissolveProbe: null, barrierDeathStamp: false, barrierStampHp: null,
            barrierStampDay: null, barrierStampBearerChanged: null, barrierStampGameOver: null,
          };
          pushCapped(store, 'meetings', rec);
        }
        rec.fightersEnd = fighterMonsters(fight);
        try { rec.worldOrigin = fight.worldOrigin ? snapMonster(fight.worldOrigin) : null; } catch (e) { rec.worldOrigin = null; }
        // For a normal (non-same-call) start, lifted/bystander are
        // filled by the start post-record; if tbEnd runs first
        // (same-call routed), fill them here from end fighters +
        // the pre-start snapshot. lifted=true means "was a fighter
        // and lifted out of the world" (mechanism sense); the
        // post-end world check below decides melt vs restored.
        if (rec.lift && rec.lifted == null) {
          const isFighter = (rec.fightersEnd || []).some(f => f.monsterId === rec.lift.id);
          rec.lifted = isFighter;
          rec.bystander = !isFighter;
        } else if (!rec.lift && rec.lifted == null) { rec.lifted = false; rec.bystander = false; }
        try {
          const pf = (fight.fighters || []).find(f => f && f.key === 'p');
          if (pf) rec.scholarHpEnd = roundHp(pf.hp);
        } catch (e) {}
      }
    } catch (e) { noteErr(store, 'tbEnd.pre', e); }
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      if (rec) {
        rec.result = result != null ? String(result) : null;
        rec.dayEnd = dayOf(Game);
        if (rec.dayStart == null) rec.dayStart = rec.dayEnd;
        const ref = st.refs.get(rec.fightSeq);
        const wc = worldCheck(Game, ref || null, rec.lift);
        rec.restoredIdentity = wc.restoredIdentity;
        rec.restoredEntry = wc.restoredEntry;
        rec.restoredHp = wc.restoredHp;
        try { const sc = (Game.state || {}).scholar || {}; if (rec.scholarHpEnd == null) rec.scholarHpEnd = roundHp(sc.health); } catch (e) {}
        if (isOrphan) {
          // Orphan ends have no lift snapshot; their monster
          // fighters' waves are computed by the analyzer from mdef.
        }
        try { st.pre.delete(rec.fightSeq); } catch (e) {}
      }
    } catch (e) { noteErr(store, 'tbEnd.post', e); }
    return ret;
  });

  // DISSOLVE-CAUSE barrier-death stamp (sim-dissolvecause-a).
  // The only non-tbEnd dissolve site in game code is tbBarrierExit's
  // death-mid-crossing branch (tbfight nulled, no tbEnd). Stamp ONLY
  // the live fight's row (top of the pending stack — a new start
  // flushes stale pendings first, so the top row is this fight's
  // row) when the post-call fight is gone with no tbEnd result
  // recorded AND the bearer changed or Game.over is set. Normal
  // barrier paths call tbEnd('fled'), which the tbEnd wrap records,
  // so the result==null guard never stamps them. Delegate first,
  // record after, never throw into the engine.
  wrap('tbBarrierExit', (orig) => function () {
    let preBearer = null;
    try { preBearer = Game.villagerId; } catch (e) {}
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const bearerAfter = Game.villagerId;
      const overAfter = !!Game.over;
      const fightGone = !(Game.tbfight && !Game.tbfight.over);
      if (fightGone && (bearerAfter !== preBearer || overAfter)) {
        const top = st.pending.length ? st.pending[st.pending.length - 1] : null;
        if (top != null) {
          const r = (store.meetings || []).find(x => x && x.fightSeq === top) || null;
          if (r && r.result == null && r.kind !== 'refused' && !r.barrierDeathStamp) {
            r.barrierDeathStamp = true;
            r.barrierStampHp = scholarHp(Game);
            r.barrierStampDay = dayOf(Game);
            r.barrierStampBearerChanged = (bearerAfter !== preBearer);
            r.barrierStampGameOver = overAfter;
          }
        }
      }
    } catch (e) { noteErr(store, 'tbBarrierExit.post', e); }
    return ret;
  });

  try {
    Game._scholarmeltDiagStore = store;
    Game._scholarmeltDiagInstalled = true;
    Game._scholarmeltDiagUninstall = () => { try { for (const u of uninstalls) u(); } catch (e) {} try { Game._scholarmeltDiagInstalled = false; } catch (e) {} };
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return Game._scholarmeltDiagUninstall || function () {};
}

function withScholarmeltDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installScholarmeltDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._scholarmelt = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installScholarmeltDiag, withScholarmeltDiag, finalizeScholarmeltDiag, MAX_EVENTS };
