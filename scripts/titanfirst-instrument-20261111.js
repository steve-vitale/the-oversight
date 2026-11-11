// titanfirst-instrument-20261111.js — titans + heralds first-numbers
// recorder (arm sim-titanfirst-a, run fleshout-loop-20261111T1115Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) STARTCOMBAT (startCombat): every call on a titan id — mid,
//       isTitan, placed-instance identity (world monster with that id
//       at call time: tile, hp, maxHp), say lines spoken during the
//       call (seq range into titanSays), returned null (refused) vs
//       fight (fight id), threw or not. Non-titan calls counted only.
//   (2) TBEND (tbEnd): every call closing a titan fight — result,
//       fight id, round observed, titan id, allies dead/alive at
//       close. Non-titan tbEnds counted only.
//   (3) FIELDFIGHT (fieldFight): every call with a titan mdef — vid,
//       monster id, instance tile/hp, outcome, rounds, vTaken, mDealt,
//       mHpLeft. Non-titan calls counted only.
//   (4) SPAWNS (spawnWorldMonster): every call with a titan id — id,
//       tile, hp, opts (titan flag, campaign node), spawn day. One
//       spawn = one distinct instance (instance key: id + tile +
//       spawn day).
//   (5) REMOVALS (removeWorldMonster): every call with a titan id —
//       id, tile, hp left, day.
//   (6) DAWN (titanDawnTick): every call — before/after diff of titan
//       state (cast, omens {stage, day}, musters {allies, haven
//       blades, lastUpkeep}, slain, outcome-log length), link-trust
//       map (villageId -> trust + titan-kind history entries added),
//       SCHOLAR PACK kcal (the raid/upkeep target — playerPackSpend
//       draws from the scholar's finished-food inventory, never the
//       village pantry) and village pantry kcal. One dawnEvent per
//       dawn with any diff; the analyzer classifies it
//       (strike-pantry / strike-trust / muster-hunger / turn / none /
//       other-cause).
//   (7) ACTIONS (titanSelfDo / soundTitanCall / titanWarCouncil /
//       titanCommitOwn / titanStandDown / titanCallReadiness): every
//       call — args, return summary, muster size before/after.
//       Expected zero under competent; proven live in the fixture.
//   (8) SAY (Game.say): titan-regex lines only (uncapped up to a
//       5000-line cap with a dropped counter), day + seq — the
//       per-call attribution source and the refusal-repeat census.
//   (9) DAILY SNAPSHOT: titan state (cast, omens, musters, slain,
//       outcome log copy), placed titan monsters, link trust map,
//       pantry kcal, roster size, standing, scaleRank, nationalLive,
//       wave.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game.
//
// KNOWN WRAP LIMIT (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game
// method. titanEscalate is closure-internal — it is NOT a Game
// method and is NOT wrapped, by construction. Strikes are detected
// by the dawn-diff (6) joined to the strike say lines (8), and the
// proof forces a strike in a fixture to verify that path. The
// proof (scripts/test-titanfirst-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence.
//
// Usage: const TF = require('./titanfirst-instrument-20261111');
//   const tf = TF.install(Game); tf.snapshot(); ... tf.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function clone(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}
// Scholar pack kcal — the raid/upkeep target. playerPackSpend draws
// from the SCHOLAR's finished-food inventory, never the village
// pantry (betrayal.js playerPackSpend). Read-only: prefer the
// engine's own reader; fall back to a plain inventory sum.
function packKcalOf(Game) {
  try {
    if (typeof Game.playerPackKcal === 'function') return Game.playerPackKcal();
  } catch (e) {}
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .reduce(function (t, i) { return t + ((i && i.kcalEach > 0 && (i.units || 0) > 0 && !i.bonded) ? i.kcalEach * i.units : 0); }, 0);
  } catch (e) { return null; }
}

// The titan say regex: broad enough to catch every titan-system line
// (omens, strikes, muster, gate refusals, calls, councils, victories)
// plus the two known other-system matches (finale-campaign muster
// line, godverbs 'not titans'), which the analyzer classifies with
// their own cited classes. Word boundaries on 'omen' and 'the
// finale' (Amendment 1, smoke-driven): bare 'omen' matched 'moment'
// in a dozen unrelated lines, and bare 'finale' matched the
// 'SEASON FINALE' announcements. The 🔭/📻 prefixes are needed
// because the data-driven omen lines carry no keyword at all (the
// herald's omen0 is 'The sky looks wrong...', the nielsen's 'The
// System's ratings spike...'); they pull in exactly two other-system
// say lines (the 🔭 scouting line, game.js:7593; the 📻 pellet
// line, game.js:25117), both classified with cited classes.
const TITAN_SAY_RE = /titan|herald|nielsen|\bthe finale\b|\bomen\b|muster|allied blades|sound the call|war council|the call to arms|🔭|📻/i;
const SAY_CAP = 5000;

function isTitanId(Game, mid) {
  try { return (typeof Game.isTitan === 'function') ? !!Game.isTitan(mid) : false; } catch (e) { return false; }
}
function titanStateClone(Game) {
  try {
    if (Game._titanTest && typeof Game._titanTest.titanState === 'function') return clone(Game._titanTest.titanState());
  } catch (e) {}
  try { return clone((Game.state || {}).titans || {}); } catch (e) { return {}; }
}
function outcomeLogClone(Game) {
  try {
    if (Game._titanTest && typeof Game._titanTest.titanOutcomeLog === 'function') return clone(Game._titanTest.titanOutcomeLog());
  } catch (e) {}
  try { return clone((((Game.state || {}).titans || {}).outcomes) || []); } catch (e) { return []; }
}
function linkTrustMap(Game) {
  const out = {};
  try {
    const links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    links.forEach(function (l) {
      if (!l) return;
      let other = null;
      try { other = (typeof Game._linkOther === 'function') ? Game._linkOther(l, 'haven') : (l.other || l.villageId || null); } catch (e) { other = l.other || l.villageId || null; }
      const hist = (l.history || []).filter(function (h) {
        return h && (h.kind === 'titan' || h.kind === 'muster-hunger' || h.kind === 'betrayal');
      }).map(function (h) { return { day: h.day, kind: h.kind, amount: h.amount, note: String(h.note || '').slice(0, 160) }; });
      out[String(other)] = { trust: (l.trust == null ? null : l.trust), status: l.status || null, titanHist: hist };
    });
  } catch (e) {}
  return out;
}
function musterSummary(Game) {
  const out = {};
  try {
    const st = (Game.state || {}).titans || {};
    Object.keys(st.musters || {}).forEach(function (tid) {
      const m = st.musters[tid];
      if (!m) { out[tid] = null; return; }
      let havenN = 0;
      try { havenN = (typeof Game.titanHavenBlades === 'function') ? Game.titanHavenBlades(m).length : ((m.haven || []).length); } catch (e) { havenN = (m.haven || []).length; }
      out[tid] = { allies: (m.allies || []).length, haven: havenN, lastUpkeep: (m.lastUpkeep == null ? null : m.lastUpkeep),
        turned: Object.keys(m.turned || {}), };
    });
  } catch (e) {}
  return out;
}
function placedTitans(Game) {
  const out = [];
  try {
    (Game.worldMonsters() || []).forEach(function (m) {
      if (!m || !isTitanId(Game, m.id)) return;
      out.push({ id: m.id, tx: m.tx, ty: m.ty, mx: m.mx, my: m.my, hp: m.hp, maxHp: m.maxHp, wave: m.wave || null });
    });
  } catch (e) {}
  return out;
}
function fightTitanId(Game) {
  try {
    const tf = ((Game.state || {}).titans || {})._fight;
    if (tf && tf.titan) return tf.titan;
  } catch (e) {}
  try {
    const f = Game.tbfight;
    if (f && f.fighters) {
      for (const m of f.fighters) {
        if (!m || m.kind !== 'monster') continue;
        const mid = (m.monsterId || (m.mdef && m.mdef.id) || m.id) || null;
        if (mid && isTitanId(Game, mid)) return mid;
      }
    }
  } catch (e) {}
  return null;
}

function install(Game) {
  const t = {
    startCombatEvents: [], tbEndEvents: [], fieldFightEvents: [],
    spawnEvents: [], removeEvents: [], dawnEvents: [], actionEvents: [],
    titanSays: [],
    daily: [], instrumentErrors: [], wrapLive: {}, wrapCounts: {},
    nonTitanStartCombat: 0, nonTitanTbEnd: 0, nonTitanFieldFight: 0,
    sayDropped: 0,
  };
  let seq = 0;
  let saySeq = 0;
  const origs = {};

  function mark(name) {
    t.wrapLive[name] = true;
    t.wrapCounts[name] = (t.wrapCounts[name] || 0) + 1;
  }
  function err(where, msg) {
    try { t.instrumentErrors.push(where + ': ' + String(msg).slice(0, 100)); } catch (e) {}
  }
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { err(name + '-missing', 'Game.' + name + ' is not a function'); return; }
      origs[name] = Game[name];
      Game[name] = fn;
    } catch (e) { err(name + '-wrap', e.message); }
  }
  function saySeqNow() { return saySeq; }

  // ---- (8) say capture (installed first: other wraps read its seq) ----
  try {
    if (typeof Game.say === 'function') {
      origs.say = Game.say;
      Game.say = function () {
        let ret;
        try { ret = origs.say.apply(Game, arguments); } catch (e) { err('say-call', e.message); }
        try {
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string' && TITAN_SAY_RE.test(arg)) {
            if (t.titanSays.length < SAY_CAP) {
              t.titanSays.push({ seq: ++saySeq, day: dayOf(Game), line: String(arg).slice(0, 600) });
            } else { t.sayDropped++; }
          }
        } catch (e) { err('say-log', e.message); }
        return ret;
      };
      mark('say');
    } else { err('say-missing', 'Game.say is not a function'); }
  } catch (e) { err('say-wrap', e.message); }

  // ---- (1) startCombat ----
  wrap('startCombat', function (mid, opts) {
    mark('startCombat');
    const titan = isTitanId(Game, mid);
    if (!titan) { t.nonTitanStartCombat++; }
    let inst = null, sayBefore = saySeqNow(), fightIdBefore = null, outcomeLenBefore = 0;
    try {
      const f0 = Game.tbfight; fightIdBefore = (f0 && f0.id) || null;
      outcomeLenBefore = outcomeLogClone(Game).length;
      if (titan) {
        const m = (Game.worldMonsters() || []).find(function (w) { return w && w.id === mid; });
        if (m) inst = { tx: m.tx, ty: m.ty, mx: m.mx, my: m.my, hp: m.hp, maxHp: m.maxHp };
      }
    } catch (e) { err('startCombat-pre', e.message); }
    let ret = null, threw = null;
    // A throw here is the ENGINE's behavior (e.g. unknown monster
    // id), not an instrument failure: record it and rethrow, so the
    // caller's behavior is unchanged and no instrument error is
    // logged for a throw the engine itself produced.
    try { ret = origs.startCombat.call(Game, mid, opts); } catch (e) { threw = String(e.message).slice(0, 120); }
    try {
      if (titan) {
        let fightIdAfter = null, roundAfter = null;
        try { const f1 = Game.tbfight; fightIdAfter = (f1 && f1.id) || null; roundAfter = (f1 && f1.round != null) ? f1.round : null; } catch (e) {}
        let outcomeAdded = [];
        try { outcomeAdded = outcomeLogClone(Game).slice(outcomeLenBefore); } catch (e) {}
        t.startCombatEvents.push({ seq: ++seq, day: dayOf(Game), mid: mid || null,
          instance: inst, saySeqBefore: sayBefore, saySeqAfter: saySeqNow(),
          returnedNull: (ret == null), fightIdBefore: fightIdBefore, fightIdAfter: fightIdAfter,
          roundAfter: roundAfter, threw: threw, outcomeAdded: outcomeAdded, via: 'startCombat' });
      }
    } catch (e) { err('startCombat-log', e.message); }
    if (threw) throw new Error(threw);
    return ret;
  });

  // ---- (2) tbEnd ----
  wrap('tbEnd', function (result) {
    mark('tbEnd');
    let fid = null, round = null, titan = null, alliesBefore = null;
    try {
      const f = Game.tbfight;
      fid = (f && f.id) || null; round = (f && f.round != null) ? f.round : null;
      titan = fightTitanId(Game);
      if (f && f.fighters) {
        alliesBefore = f.fighters.filter(function (x) { return x && x.kind === 'ally'; })
          .map(function (a) { return { key: a.key, name: a.name, villageId: a.villageId || null, alive: !!a.alive }; });
      }
    } catch (e) { err('tbEnd-pre', e.message); }
    let ret;
    try { ret = origs.tbEnd.call(Game, result); } catch (e) { err('tbEnd-call', e.message); }
    try {
      if (titan) {
        t.tbEndEvents.push({ seq: ++seq, day: dayOf(Game), result: (result == null ? null : String(result)),
          fightId: fid, round: round, titan: titan, alliesBefore: alliesBefore, via: 'tbEnd' });
      } else { t.nonTitanTbEnd++; }
    } catch (e) { err('tbEnd-log', e.message); }
    return ret;
  });

  // ---- (3) fieldFight ----
  wrap('fieldFight', function (vid, mdef, m, opts) {
    mark('fieldFight');
    const mid = (mdef && (mdef.id || mdef)) || null;
    const titan = isTitanId(Game, mid);
    if (!titan) { t.nonTitanFieldFight++; }
    // Capture the instance BEFORE the call: m is mutated by the
    // fight, so a post-call read reports post-fight hp (Amendment 1:
    // the smoke read the herald at 14 hp for a fight that began at
    // 104, which made the wound arithmetic unreadable).
    let instBefore = null;
    try { if (titan && m) instBefore = { tx: m.tx, ty: m.ty, hp: m.hp, maxHp: m.maxHp }; } catch (e) {}
    let ret = null;
    try { ret = origs.fieldFight.call(Game, vid, mdef, m, opts); } catch (e) { err('fieldFight-call', e.message); }
    try {
      if (titan) {
        t.fieldFightEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, mid: mid,
          instance: instBefore,
          outcome: (ret && ret.outcome) || null, rounds: (ret && ret.rounds) || 0,
          vTaken: (ret && ret.vTaken) || 0, mDealt: (ret && ret.mDealt) || 0,
          mHpLeft: (ret && ret.mHpLeft) || null, vHpLeft: (ret && ret.vHpLeft) || null,
          via: 'fieldFight' });
      }
    } catch (e) { err('fieldFight-log', e.message); }
    return ret;
  });

  // ---- (4) spawns ----
  wrap('spawnWorldMonster', function (mdef, tx, ty, opts) {
    mark('spawnWorldMonster');
    const id = (typeof mdef === 'string') ? mdef : (mdef && mdef.id) || null;
    const titan = isTitanId(Game, id);
    let ret = null;
    try { ret = origs.spawnWorldMonster.call(Game, mdef, tx, ty, opts); } catch (e) { err('spawnWorldMonster-call', e.message); }
    try {
      if (titan) {
        t.spawnEvents.push({ seq: ++seq, day: dayOf(Game), id: id, tx: tx, ty: ty,
          hp: (ret && ret.hp) || null, maxHp: (ret && ret.maxHp) || null,
          opts: clone(opts || {}), via: 'spawnWorldMonster' });
      }
    } catch (e) { err('spawnWorldMonster-log', e.message); }
    return ret;
  });

  // ---- (5) removals ----
  wrap('removeWorldMonster', function (m) {
    mark('removeWorldMonster');
    const id = (m && m.id) || null;
    const titan = isTitanId(Game, id);
    let inst = null;
    try { if (titan && m) inst = { tx: m.tx, ty: m.ty, hp: m.hp, maxHp: m.maxHp }; } catch (e) {}
    let ret;
    try { ret = origs.removeWorldMonster.call(Game, m); } catch (e) { err('removeWorldMonster-call', e.message); }
    try {
      if (titan) {
        t.removeEvents.push({ seq: ++seq, day: dayOf(Game), id: id, instance: inst, via: 'removeWorldMonster' });
      }
    } catch (e) { err('removeWorldMonster-log', e.message); }
    return ret;
  });

  // ---- (6) dawn tick diff ----
  wrap('titanDawnTick', function () {
    mark('titanDawnTick');
    let before = null;
    try {
      before = { state: titanStateClone(Game), links: linkTrustMap(Game),
        pantry: pantryKcal(Game), pack: packKcalOf(Game), outcomes: outcomeLogClone(Game), saySeq: saySeqNow() };
    } catch (e) { err('titanDawnTick-pre', e.message); }
    let ret;
    try { ret = origs.titanDawnTick.apply(Game, arguments); } catch (e) { err('titanDawnTick-call', e.message); }
    try {
      const after = { state: titanStateClone(Game), links: linkTrustMap(Game),
        pantry: pantryKcal(Game), pack: packKcalOf(Game), outcomes: outcomeLogClone(Game), saySeq: saySeqNow() };
      const diffs = { omen: [], muster: [], slain: [], cast: null, trust: [], pantry: null, pack: null, outcomesAdded: [] };
      try {
        const bO = (before.state.omens || {}), aO = (after.state.omens || {});
        const tids = {};
        Object.keys(bO).forEach(function (k) { tids[k] = 1; });
        Object.keys(aO).forEach(function (k) { tids[k] = 1; });
        Object.keys(tids).forEach(function (tid) {
          const b = bO[tid] || null, a = aO[tid] || null;
          if (JSON.stringify(b) !== JSON.stringify(a)) {
            diffs.omen.push({ titan: tid, before: b, after: a });
          }
        });
        const bM = musterSummaryFromState(before.state), aM = musterSummaryFromState(after.state);
        Object.keys(aM).forEach(function (tid) {
          if (JSON.stringify(bM[tid]) !== JSON.stringify(aM[tid])) {
            diffs.muster.push({ titan: tid, before: bM[tid] || null, after: aM[tid] });
          }
        });
        Object.keys(bM).forEach(function (tid) {
          if (!(tid in aM)) diffs.muster.push({ titan: tid, before: bM[tid], after: null });
        });
        const bS = before.state.slain || {}, aS = after.state.slain || {};
        Object.keys(aS).forEach(function (tid) {
          if (!bS[tid] && aS[tid]) diffs.slain.push({ titan: tid, slain: true });
        });
        if (JSON.stringify(before.state.cast || null) !== JSON.stringify(after.state.cast || null)) {
          diffs.cast = { before: before.state.cast || null, after: after.state.cast || null };
        }
        const lids = {};
        Object.keys(before.links).forEach(function (k) { lids[k] = 1; });
        Object.keys(after.links).forEach(function (k) { lids[k] = 1; });
        Object.keys(lids).forEach(function (vid) {
          const b = before.links[vid] || null, a = after.links[vid] || null;
          const bT = b ? b.trust : null, aT = a ? a.trust : null;
          const bH = (b && b.titanHist) || [], aH = (a && a.titanHist) || [];
          // History caps at 40 with shift(), so compare by identity
          // (day+kind+note), never by slice offset.
          const bKeys = {};
          bH.forEach(function (h) { bKeys[h.day + '|' + h.kind + '|' + h.note] = 1; });
          const added = aH.filter(function (h) { return !bKeys[h.day + '|' + h.kind + '|' + h.note]; });
          if (bT !== aT || added.length) {
            diffs.trust.push({ village: vid, trustBefore: bT, trustAfter: aT, delta: (aT == null || bT == null) ? null : (aT - bT), titanHistAdded: added });
          }
        });
        if (before.pantry !== after.pantry) diffs.pantry = { before: before.pantry, after: after.pantry, delta: (after.pantry == null || before.pantry == null) ? null : (after.pantry - before.pantry) };
        if (before.pack !== after.pack) diffs.pack = { before: before.pack, after: after.pack, delta: (after.pack == null || before.pack == null) ? null : (after.pack - before.pack) };
        diffs.outcomesAdded = (after.outcomes || []).slice((before.outcomes || []).length);
      } catch (e) { err('titanDawnTick-diff', e.message); }
      const anyDiff = diffs.omen.length || diffs.muster.length || diffs.slain.length || diffs.cast ||
        diffs.trust.length || diffs.pantry || diffs.pack || diffs.outcomesAdded.length;
      if (anyDiff) {
        t.dawnEvents.push({ seq: ++seq, day: dayOf(Game), saySeqBefore: before.saySeq, saySeqAfter: after.saySeq, diffs: diffs, via: 'titanDawnTick' });
      }
    } catch (e) { err('titanDawnTick-log', e.message); }
    return ret;
  });
  function musterSummaryFromState(st) {
    const out = {};
    try {
      Object.keys((st || {}).musters || {}).forEach(function (tid) {
        const m = st.musters[tid];
        if (!m) { out[tid] = null; return; }
        out[tid] = { allies: (m.allies || []).length, haven: (m.haven || []).length,
          lastUpkeep: (m.lastUpkeep == null ? null : m.lastUpkeep), turned: Object.keys(m.turned || {}) };
      });
    } catch (e) {}
    return out;
  }

  // ---- (7) player titan actions ----
  function wrapAction(name) {
    wrap(name, function () {
      mark(name);
      const args = Array.prototype.slice.call(arguments).map(function (a) { return (a == null ? null : String(a)).slice(0, 120); });
      let before = null;
      try { before = musterSummary(Game); } catch (e) {}
      let ret;
      try { ret = origs[name].apply(Game, arguments); } catch (e) { err(name + '-call', e.message); }
      try {
        let after = null;
        try { after = musterSummary(Game); } catch (e) {}
        let retSummary = null;
        try {
          if (ret == null) retSummary = null;
          else if (typeof ret === 'object') retSummary = clone(ret);
          else retSummary = String(ret).slice(0, 300);
        } catch (e) { retSummary = '[unclonable]'; }
        t.actionEvents.push({ seq: ++seq, day: dayOf(Game), action: name, args: args,
          ret: retSummary, musterBefore: before, musterAfter: after, via: name });
      } catch (e) { err(name + '-log', e.message); }
      return ret;
    });
  }
  ['titanSelfDo', 'soundTitanCall', 'titanWarCouncil', 'titanCommitOwn', 'titanStandDown', 'titanCallReadiness'].forEach(wrapAction);

  // ---- (9) daily snapshot ----
  function snapshot() {
    const snap = { day: dayOf(Game), seq: seq };
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    try { snap.packKcal = packKcalOf(Game); } catch (e) { snap.packKcal = null; }
    try {
      const st = (Game.state || {}).titans || {};
      snap.cast = clone(st.cast || null);
      snap.omens = clone(st.omens || {});
      snap.musters = musterSummary(Game);
      snap.slain = clone(st.slain || {});
      snap.outcomes = outcomeLogClone(Game);
    } catch (e) { err('snapshot-titans', e.message); }
    try { snap.placed = placedTitans(Game); } catch (e) { snap.placed = null; }
    try { snap.links = linkTrustMap(Game); } catch (e) { snap.links = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.wave = null; }
    try { snap.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.standing = null; }
    try { snap.nationalLive = !!(Game.state || {}).nationalLive; } catch (e) { snap.nationalLive = null; }
    try { snap.rosterSize = ((Game.state.village || {}).roster || []).length; } catch (e) { snap.rosterSize = null; }
    try { snap.bearer = Game.villagerId || null; } catch (e) { snap.bearer = null; }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try {
      Object.keys(origs).forEach(function (name) {
        try { Game[name] = origs[name]; } catch (e) { err('uninstall-' + name, e.message); }
      });
    } catch (e) { err('uninstall', e.message); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall, SAY_RE: TITAN_SAY_RE };
}

module.exports = { install: install, TITAN_SAY_RE: TITAN_SAY_RE };
