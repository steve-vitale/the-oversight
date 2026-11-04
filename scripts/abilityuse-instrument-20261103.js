// abilityuse-instrument-20261103.js — ability-use diagnosis instrument
// (arm ability-use, 2026-11-03). DIAG-ONLY, scripts only, zero src/js.
// Records, per turn-based wave-4 fight, per human fighter, per held
// combat ability: HELD, AVAILABLE, SELECTED, FIRED — plus the reason
// each held-but-unfired ability did not fire. Follows the tbleth
// instrument pattern: identity at fight START, RNG-neutral
// call-through wraps, UNRECORDED where the engine records nothing —
// never guessed. Field fights are NOT exposures here; they are
// counted only in wrapCounts.
// Every catch reports into t.instrumentErrors, never silently
// (repo rule: no empty catch blocks).
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}
function kcalOf(Game) { try { return ((Game.state || {}).scholar || {}).kcal || 0; } catch (e) { return 0; } }

// Combat-action map, built at install from Game.data.abilities:
// id -> { lane, actions: [{id, cost}] } for context 'combat' actions.
function combatMap(Game) {
  const map = {};
  try {
    for (const a of (Game.data.abilities || [])) {
      if (!a || !a.id) continue;
      const acts = (a.actions || []).filter(function (x) { return x && x.context === 'combat'; });
      if (acts.length) map[a.id] = { lane: a.lane || 'unknown', actions: acts.map(function (x) { return { id: x.id, cost: x.cost || {} }; }) };
    }
  } catch (e) {}
  return map;
}

function heldCombat(Game, cmap, vid, isScholar) {
  // Returns [{id, lane, actions}] held at this moment. Guarded: any
  // read failure yields [] plus a readError string, never a throw.
  const out = { list: [], readError: null };
  try {
    let ids = [];
    if (isScholar) {
      if (typeof Game.ownedAbilityIds === 'function') ids = Game.ownedAbilityIds() || [];
    } else {
      if (typeof Game.npcOwnedIds === 'function') ids = Game.npcOwnedIds(vid) || [];
      else if (Game.state && Game.state.village && Game.state.village.npcAbilities) ids = (Game.state.village.npcAbilities[vid] || []);
    }
    for (const id of ids) {
      if (cmap[id]) out.list.push({ id: id, lane: cmap[id].lane, actions: cmap[id].actions });
    }
  } catch (e) { out.readError = String((e && e.message) || e).slice(0, 80); }
  return out;
}

function foodTierOf(Game) {
  try { if (typeof Game.villageFoodTier === 'function') return Game.villageFoodTier(); } catch (e) {}
  return 'UNRECORDED';
}

function install(Game) {
  const t = {
    exposures: [], killRows: [], unlinkedKills: [], spawns: [],
    orphanTbEnds: [], instrumentErrors: [], notes: [],
    wrapCounts: {}, tbCalls: 0, fieldCallsW4: 0,
  };
  const orig = {};
  let seq = 0;
  let openTb = null; // {seq, fight}
  let abilityDepth = 0; // >0 while inside a useAbility call stack
  let actionDepth = 0; // >0 while inside an _actionAvailable call stack (observer re-entrancy guard)
  let turnAction = null; // action class of the current player turn, set by action wraps
  let turnActionCount = 0; // action wraps fired since last turn record
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }
  const cmap = combatMap(Game);
  const DINNER_RESERVE = 200;

  function currentExposure() {
    if (!openTb) return null;
    return t.exposures.find(function (x) { return x.seq === openTb.seq; }) || null;
  }

  function fighterSnap(fight) {
    const humans = [], monsters = [];
    try {
      for (const f of ((fight && fight.fighters) || [])) {
        if (!f) continue;
        if (f.kind === 'monster') {
          const mid = ((f.mdef || {}).id || f.monsterId || f.id) || null;
          monsters.push({ key: f.key || null, mid: mid, alive: !!f.alive, fled: !!f.fled,
            hp: (f.hp != null ? f.hp : null), maxHp: (f.maxHp != null ? f.maxHp : null) });
        } else if (f.key === 'p' || f.kind === 'villager' || f.kind === 'ally') {
          const vid = f.villagerId || (f.key === 'p' ? (Game.villagerId || null) : null);
          humans.push({ key: f.key || null, kind: f.kind || null, vid: vid,
            alive: (f.alive !== false), fled: !!f.fled,
            hp: (f.hp != null ? f.hp : null), maxHp: (f.maxHp != null ? f.maxHp : null) });
        }
      }
    } catch (e) { err('fighterSnap', e); }
    return { humans: humans, monsters: monsters };
  }

  function npcTurnState(v) {
    // Entry-state snapshot for one NPC fighter turn (trigger analysis).
    const s = { vid: v.villagerId || null, hp: v.hp != null ? v.hp : null, maxHp: v.maxHp != null ? v.maxHp : null,
      mx: v.mx != null ? v.mx : null, my: v.my != null ? v.my : null,
      stunned: (v.stunned || 0), fled: !!v.fled,
      fieldMedicated: !!v._fieldMedicated, warCried: !!v._warCried,
      screamedDay: (v._vScreamedDay != null ? v._vScreamedDay : null),
      sandThrown: !!v._vSandThrown, loomed: !!v._vLoomed, raged: !!v._vRaged, shoved: !!v._vShoved,
      liveMonsters: [] };
    try {
      const f = Game.tbfight || null;
      for (const m of ((f && f.fighters) || [])) {
        if (!m || m.kind !== 'monster' || !m.alive || m.fled) continue;
        s.liveMonsters.push({ key: m.key || null, mid: ((m.mdef || {}).id || m.monsterId || m.id) || null,
          hp: m.hp != null ? m.hp : null, maxHp: m.maxHp != null ? m.maxHp : null,
          mx: m.mx != null ? m.mx : null, my: m.my != null ? m.my : null,
          blind: (m.blind || 0), stunned: (m.stunned || 0), frozen: (m._frozen || 0),
          bound: (m._bound || 0), hesitate: (m.hesitate || 0), elderCalm: !!m.elderCalm });
      }
    } catch (e) { err('npcTurnState', e); }
    return s;
  }

  function observerAvail(ex) {
    // Turn-boundary availability snapshot for the SCHOLAR's held combat
    // actions. Observer calls are tagged observer:true and are NEVER
    // counted as policy attempts. _actionAvailable is documented pure
    // (button reads move day/kcal by exactly 0).
    if (!ex || !ex.scholarHeld) return null;
    const kcal = kcalOf(Game);
    const round = (Game.tbfight && Game.tbfight.round != null) ? Game.tbfight.round : null;
    const avail = [];
    // Fight state at this boundary, for cascade-trigger analysis:
    // live = live monsters, totalMaxHp = their summed max HP,
    // scholarHpPct = scholar fighter HP fraction (losing iff < 0.5).
    const fightState = { live: null, totalMaxHp: null, scholarHp: null, scholarMaxHp: null, scholarHpPct: null };
    try {
      const f = Game.tbfight || null;
      if (f && f.fighters) {
        let live = 0, tot = 0;
        for (const m of f.fighters) {
          if (m && m.kind === 'monster' && m.alive && !m.fled) { live++; tot += (m.maxHp || 0); }
        }
        fightState.live = live; fightState.totalMaxHp = tot;
      }
      if (typeof Game.tbFighter === 'function') {
        const pf = Game.tbFighter('p');
        if (pf) { fightState.scholarHp = pf.hp; fightState.scholarMaxHp = pf.maxHp;
          if (pf.maxHp) fightState.scholarHpPct = pf.hp / pf.maxHp; }
      }
    } catch (e) { err('observerFightState', e); }
    for (const h of ex.scholarHeld) {
      for (const a of h.actions) {
        let ok = false, why = 'UNRECORDED';
        try {
          if (typeof Game._actionAvailable === 'function' && actionDepth === 0) {
            actionDepth++;
            try {
              const r = Game._actionAvailable(h.id, { id: a.id, cost: a.cost, context: 'combat' });
              if (r) { ok = !!r.ok; why = r.why || (r.ok ? '' : 'UNRECORDED'); }
            } catch (e) { why = 'OBSERVER-ERROR:' + String((e && e.message) || e).slice(0, 60); }
            actionDepth--;
          } else { why = 'OBSERVER-SKIPPED'; }
        } catch (e) { why = 'OBSERVER-ERROR:' + String((e && e.message) || e).slice(0, 60); }
        const cost = (a.cost && a.cost.kcal) || 0;
        avail.push({ id: h.id, act: a.id, lane: h.lane, ok: ok, why: why,
          kcal: kcal, cost: cost, dinnerOk: (kcal - cost) >= DINNER_RESERVE });
      }
    }
    return { round: round, kcal: kcal, avail: avail, fightState: fightState };
  }

  // --- spawn (census reconciliation only) ---
  if (typeof Game.spawnWorldMonster === 'function') {
    orig.spawnWorldMonster = Game.spawnWorldMonster;
    Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
      count('spawnWorldMonster');
      const mon = orig.spawnWorldMonster.apply(this, arguments);
      try {
        const mid = mon ? mon.id : (typeof mdef === 'string' ? mdef : (mdef && mdef.id));
        if (mid && waveOf(Game, mid) === 4) t.spawns.push({ day: dayOf(Game), id: mid, tx: tx, ty: ty });
      } catch (e) { err('spawn', e); }
      return mon;
    };
  } else { err('install.spawnWorldMonster', new Error('not a function')); }

  // --- turn-based: identity at START + held-set snapshot ---
  if (typeof Game.startCombat === 'function') {
    orig.startCombat = Game.startCombat;
    Game.startCombat = function (mid) {
      count('startCombat');
      let effId = null;
      try {
        let worldId = null, pendingId = null;
        try { const s = Game.state.scholar || {}; if (s.monster) worldId = s.monster.id || null; } catch (e) {}
        try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
        effId = mid || pendingId || worldId || null;
      } catch (e) { err('start.pre', e); }
      const isW4 = !!(effId && waveOf(Game, effId) === 4);
      if (isW4) t.tbCalls++;
      const beforeFight = Game.tbfight || null;
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (isW4) {
          const fight = Game.tbfight || null;
          if (fight && fight !== beforeFight) {
            if (openTb && !openTb.ended) {
              const prev = t.exposures.find(function (x) { return x.seq === openTb.seq; });
              if (prev) prev.superseded = true;
            }
            seq++;
            const snap = fighterSnap(fight);
            const scholarId = Game.villagerId || null;
            const scholarHeld = heldCombat(Game, cmap, scholarId, true);
            const party = snap.humans.map(function (h) {
              const isScholar = (h.key === 'p');
              const held = isScholar ? scholarHeld : heldCombat(Game, cmap, h.vid, false);
              return { key: h.key, kind: h.kind, vid: h.vid, hpStart: h.hp, maxHp: h.maxHp,
                held: held.list, heldReadError: held.readError };
            });
            const monsters = snap.monsters.map(function (m) {
              let tk = 'UNRECORDED';
              try { tk = (typeof Game.monsterCounterKnown === 'function') ? !!Game.monsterCounterKnown(m.mid) : 'UNRECORDED'; } catch (e) { tk = 'UNRECORDED'; }
              return { key: m.key, mid: m.mid, hpStart: m.hp, maxHp: m.maxHp,
                wave: (m.mid ? waveOf(Game, m.mid) : null), joinedMidFight: false, trickKnown: tk };
            });
            t.exposures.push({
              seq: seq, type: 'tb', day: dayOf(Game), mid: effId, wave: 4,
              fightId: fight.id || null, scholarAtStart: scholarId,
              partySizeStart: snap.humans.length,
              party: party, monsters: monsters,
              scholarHeld: scholarHeld.list, scholarHeldReadError: scholarHeld.readError,
              scholarKcalStart: kcalOf(Game), foodTierStart: foodTierOf(Game),
              turns: [], availSnapshots: [], abilityUses: [], availCalls: [],
              npcTurns: [], npcAbilityCalls: [], hits: [], transcript: [], transcriptOverflow: false,
              end: null, kills: [], superseded: false,
            });
            openTb = { seq: seq, fight: fight, ended: false };
            turnAction = null; turnActionCount = 0;
          }
        }
      } catch (e) { err('start.post', e); }
      return r;
    };
  } else { err('install.startCombat', new Error('not a function')); }

  // --- turn-based end: PRE-call snapshot (fighters still present) ---
  if (typeof Game.tbEnd === 'function') {
    orig.tbEnd = Game.tbEnd;
    Game.tbEnd = function (result) {
      count('tbEnd');
      let pre = null;
      try {
        const f = Game.tbfight || null;
        if (f && !f.over) {
          const snap = fighterSnap(f);
          const w4 = snap.monsters.some(function (m) { return m.mid && waveOf(Game, m.mid) === 4; });
          pre = { fight: f, result: result, snap: snap, hasW4: w4, round: f.round || null };
        }
      } catch (e) { err('tbEnd.pre', e); }
      let r;
      try { r = orig.tbEnd.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (pre && pre.hasW4) {
          if (openTb && openTb.fight === pre.fight && !openTb.ended) {
            const ex = t.exposures.find(function (x) { return x.seq === openTb.seq; });
            if (ex) {
              ex.end = {
                result: (pre.result === undefined || pre.result === null) ? 'unknown' : String(pre.result),
                day: dayOf(Game), round: pre.round,
                monsters: pre.snap.monsters, humans: pre.snap.humans,
                monsterDeadW4: pre.snap.monsters.filter(function (m) { return m.mid && waveOf(Game, m.mid) === 4 && !m.alive; }).length,
                monsterTotalW4: pre.snap.monsters.filter(function (m) { return m.mid && waveOf(Game, m.mid) === 4; }).length,
                humansDead: pre.snap.humans.filter(function (h) { return !h.alive; }).map(function (h) { return h.vid; }),
                humansFled: pre.snap.humans.filter(function (h) { return !!h.fled; }).map(function (h) { return h.vid; }),
                monstersFled: pre.snap.monsters.filter(function (m) { return !!m.fled; }).map(function (m) { return m.mid; }),
              };
            }
            openTb.ended = true; openTb = null;
          } else {
            t.orphanTbEnds.push({ day: dayOf(Game), result: String(pre.result), monsters: pre.snap.monsters });
          }
        }
      } catch (e) { err('tbEnd.post', e); }
      return r;
    };
  } else { err('install.tbEnd', new Error('not a function')); }

  // --- field fights: counted only ---
  if (typeof Game.fieldFight === 'function') {
    orig.fieldFight = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      count('fieldFight');
      try {
        const mid = (typeof mdef === 'string') ? mdef : ((mdef && mdef.id) || (m && m.id) || null);
        if (mid && waveOf(Game, mid) >= 4) t.fieldCallsW4++;
      } catch (e) { err('field.pre', e); }
      return orig.fieldFight.apply(this, arguments);
    };
  } else { t.notes.push('fieldFight not a function at install'); }

  // --- damage: the ledger (ability-stack classification + rage flag) ---
  if (typeof Game.tbDamage === 'function') {
    orig.tbDamage = Game.tbDamage;
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
      count('tbDamage');
      const ex = currentExposure();
      let target = null, hpBefore = null, roundPre = null, rageActive = false;
      try {
        if (ex && Game.tbfight === openTb.fight && typeof Game.tbFighter === 'function') {
          target = Game.tbFighter(targetKey);
          if (target) hpBefore = target.hp;
          roundPre = Game.tbfight.round != null ? Game.tbfight.round : null;
          if (sourceKey != null) {
            try {
              const src = Game.tbFighter(sourceKey);
              if (src) rageActive = (src._vRageRounds || 0) > 0;
            } catch (e) {}
          }
        }
      } catch (e) { err('tbDamage.pre', e); }
      let r;
      try { r = orig.tbDamage.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (ex && target && hpBefore != null) {
          const hpAfter = target.hp;
          const hit = {
            round: roundPre,
            targetKey: targetKey, targetKind: target.kind || null,
            targetVid: target.villagerId || null,
            targetMid: ((target.mdef || {}).id || target.monsterId || target.id) || null,
            sourceKey: (sourceKey == null ? null : sourceKey),
            sourceLabel: (sourceLabel == null ? null : String(sourceLabel)),
            requested: dmg, returned: r, hpBefore: hpBefore, hpAfter: hpAfter,
            hpDelta: (hpAfter != null ? hpAfter - hpBefore : null),
            abilityStack: abilityDepth > 0, rageActive: rageActive,
          };
          if (abilityDepth > 0) hit.sourceClass = 'ability-or-trick';
          else if (hit.sourceKey === 'p' || hit.sourceKey === 'player' ||
              (hit.sourceKey == null && hit.sourceLabel === 'you')) hit.sourceClass = 'leader';
          else if (hit.sourceKey) {
            try {
              const f = Game.tbfight || null;
              const src = (f && f.fighters || []).find(function (x) { return x && x.key === hit.sourceKey; });
              if (src && (src.kind === 'villager' || src.kind === 'ally')) hit.sourceClass = 'ally';
              else if (src && src.kind === 'monster') hit.sourceClass = 'other';
              else hit.sourceClass = 'other';
            } catch (e) { hit.sourceClass = 'other'; }
          } else hit.sourceClass = 'other';
          if (hit.targetKind === 'monster' && hit.targetMid && waveOf(Game, hit.targetMid) === 4) {
            const known = ex.monsters.find(function (mm) { return mm.key === hit.targetKey; });
            if (!known) {
              ex.monsters.push({ key: hit.targetKey, mid: hit.targetMid, hpStart: hpBefore,
                maxHp: target.maxHp != null ? target.maxHp : null,
                wave: 4, joinedMidFight: true, trickKnown: 'UNRECORDED' });
            }
          }
          ex.hits.push(hit);
        }
      } catch (e) { err('tbDamage.post', e); }
      return r;
    };
  } else { err('install.tbDamage', new Error('not a function')); }

  // --- transcript capture (bounded; narration honesty for the fix) ---
  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') { t.notes.push(fnName + ' not a function at install'); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (line) {
      const ex = currentExposure();
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { throw e; }
      try {
        if (ex && Game.tbfight === openTb.fight) {
          if (ex.transcript.length < 400) ex.transcript.push({ kind: fnName, line: String(line) });
          else ex.transcriptOverflow = true;
        }
      } catch (e) { err(fnName + '.post', e); }
      return r;
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  // --- player ability presses ---
  if (typeof Game.useAbility === 'function') {
    orig.useAbility = Game.useAbility;
    Game.useAbility = function (abilityId, actionId, target) {
      count('useAbility');
      const ex = currentExposure();
      const inFight = !!(ex && Game.tbfight === openTb.fight);
      const kcalBefore = kcalOf(Game);
      // Set before the original so any internal turn-advance sees it.
      try { if (inFight && ex) { turnAction = 'ability'; turnActionCount++; } } catch (e) {}
      abilityDepth++;
      let r;
      try { r = orig.useAbility.apply(this, arguments); } catch (e) { abilityDepth--; throw e; }
      abilityDepth--;
      try {
        if (inFight && ex) {
          let turnSpent = null;
          try { const pf = (typeof Game.tbFighter === 'function') ? Game.tbFighter('p') : null; if (pf) turnSpent = !!pf.acted; } catch (e) {}
          ex.abilityUses.push({ aid: String(abilityId), act: String(actionId),
            round: (Game.tbfight && Game.tbfight.round != null) ? Game.tbfight.round : null,
            returned: !!r, turnSpent: turnSpent, kcalBefore: kcalBefore, kcalAfter: kcalOf(Game) });
        }
      } catch (e) { err('useAbility.post', e); }
      return r;
    };
  } else { err('install.useAbility', new Error('not a function')); }

  // --- availability checks: policy attempts (depth 0) vs internal (depth 1) ---
  if (typeof Game._actionAvailable === 'function') {
    orig._actionAvailable = Game._actionAvailable;
    Game._actionAvailable = function (abilityId, action) {
      count('_actionAvailable');
      const ex = currentExposure();
      const inFight = !!(ex && Game.tbfight === openTb.fight);
      const inUse = abilityDepth > 0;
      const observer = actionDepth > 0;
      let r;
      try { r = orig._actionAvailable.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (inFight && ex && !observer) {
          ex.availCalls.push({ aid: String(abilityId), act: (action && action.id) ? String(action.id) : null,
            ok: !!(r && r.ok), why: (r && r.why) || (r && r.ok ? '' : 'UNRECORDED'),
            inUse: inUse,
            round: (Game.tbfight && Game.tbfight.round != null) ? Game.tbfight.round : null });
        }
      } catch (e) { err('_actionAvailable.post', e); }
      return r;
    };
  } else { err('install._actionAvailable', new Error('not a function')); }

  // --- NPC ability selection (outermost wrap: sees foodPower + god wraps) ---
  // GAMECODE-ARM EXTENSION (2026-11-03, marked): monster-flag diffs around
  // the call, so godpath KIT casts (bird/static/turncoat/freeze/cheese/
  // retribution, which set monster flags or deal damage instead of villager
  // flags) are NAMED in the analyzer instead of lumped as wrapped-unknown.
  // Pure reads; trajectory-neutral.
  function monFlagSnap() {
    const out = {};
    try {
      const f = Game.tbfight || null;
      for (const m of ((f && f.fighters) || [])) {
        if (!m || m.kind !== 'monster') continue;
        out[m.key || ''] = { hp: m.hp != null ? m.hp : null, bird: (m._birdStrike || 0),
          frozen: (m._frozen || 0), turncoat: (m._turncoatRounds || 0),
          goadedBy: (m._goadedBy || null), bound: (m._bound || 0) };
      }
    } catch (e) {}
    return out;
  }
  // GAMECODE-ARM EXTENSION 2 (2026-11-03, marked): twin-flag diffs for the
  // after-leg. Same pure-read diff pattern as the base five + kitDiffs.
  function twinFlagSnap(v) {
    if (!v) return null;
    return { warCried: !!v._warCried, stared: !!v._vStared, walkedIn: !!v._vWalkedIn,
      goaded: !!v._vGoaded, bound: !!v._vBound, ambushed: !!v._vAmbushed,
      haymakerPressed: !!v._vHaymakerPressed, deadAimed: !!v._vDeadAimed,
      aimed: !!v._vAimed, tradeOpened: !!v._vTradeOpened, debtSettled: !!v._vDebtSettled,
      readFight: !!v._vReadFight,
      tripwireSet: !!((Game.tbfight || {})._tripwireSet) };
  }
  if (typeof Game.tbVillagerAbility === 'function') {
    orig.tbVillagerAbility = Game.tbVillagerAbility;
    Game.tbVillagerAbility = function (v) {
      count('tbVillagerAbility');
      const ex = currentExposure();
      const inFight = !!(ex && Game.tbfight === openTb.fight);
      const flagsBefore = v ? { screamedDay: (v._vScreamedDay != null ? v._vScreamedDay : null),
        sand: !!v._vSandThrown, loomed: !!v._vLoomed, raged: !!v._vRaged, shoved: !!v._vShoved } : null;
      const twinBefore = twinFlagSnap(v);
      const monsBefore = inFight ? monFlagSnap() : null;
      let r;
      try { r = orig.tbVillagerAbility.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (inFight && ex && v) {
          const flagsAfter = { screamedDay: (v._vScreamedDay != null ? v._vScreamedDay : null),
            sand: !!v._vSandThrown, loomed: !!v._vLoomed, raged: !!v._vRaged, shoved: !!v._vShoved };
          const twinAfter = twinFlagSnap(v);
          const monsAfter = monFlagSnap();
          const kitDiffs = [];
          if (monsBefore) {
            for (const k of Object.keys(monsAfter)) {
              const b = monsBefore[k] || {}, a = monsAfter[k] || {};
              const d = [];
              if ((a.bird || 0) > (b.bird || 0)) d.push('bird_up');
              if ((a.frozen || 0) > (b.frozen || 0)) d.push('frozen_up');
              if ((a.turncoat || 0) > (b.turncoat || 0)) d.push('turncoat_up');
              if ((a.hp != null && b.hp != null) && a.hp < b.hp) d.push('hp_down:' + (b.hp - a.hp));
              if (d.length) kitDiffs.push({ key: k, diffs: d });
            }
          }
          const fired = [];
          if (flagsBefore) {
            if (flagsAfter.screamedDay !== flagsBefore.screamedDay) fired.push('scream_cheese');
            if (flagsAfter.sand && !flagsBefore.sand) fired.push('pocket_sand');
            if (flagsAfter.loomed && !flagsBefore.loomed) fired.push('fear_aura');
            if (flagsAfter.raged && !flagsBefore.raged) fired.push('rage');
            if (flagsAfter.shoved && !flagsBefore.shoved) fired.push('shoulder_check');
          }
          if (twinBefore && twinAfter) {
            if (twinAfter.warCried && !twinBefore.warCried) fired.push('war_cry');
            if (twinAfter.tripwireSet && !twinBefore.tripwireSet) fired.push('tripwire');
            if (twinAfter.stared && !twinBefore.stared) fired.push('intimidating_presence');
            if (twinAfter.walkedIn && !twinBefore.walkedIn) fired.push('peacemaker');
            if (twinAfter.goaded && !twinBefore.goaded) fired.push('come_get_some');
            if (twinAfter.bound && !twinBefore.bound) fired.push('hogtie');
            if (twinAfter.ambushed && !twinBefore.ambushed) fired.push('ambush');
            if (twinAfter.haymakerPressed && !twinBefore.haymakerPressed) fired.push('haymaker');
            if (twinAfter.deadAimed && !twinBefore.deadAimed) fired.push('dead_aim');
            if (twinAfter.aimed && !twinBefore.aimed) fired.push('patient_aim');
            if (twinAfter.tradeOpened && !twinBefore.tradeOpened) fired.push('trade_of_blows');
            if (twinAfter.debtSettled && !twinBefore.debtSettled) fired.push('trade_of_blows_settle');
            if (twinAfter.readFight && !twinBefore.readFight) fired.push('brawler_instinct');
          }
          if (r && !fired.length) fired.push('wrapped-unknown');
          ex.npcAbilityCalls.push({ vid: v.villagerId || null,
            round: (Game.tbfight && Game.tbfight.round != null) ? Game.tbfight.round : null,
            returned: !!r, fired: fired, flagsBefore: flagsBefore, flagsAfter: flagsAfter,
            twinBefore: twinBefore, twinAfter: twinAfter,
            kitDiffs: kitDiffs });
          if (ex._npcTurnOpen) ex._npcTurnOpen.abilityCalled = true;
        }
      } catch (e) { err('tbVillagerAbility.post', e); }
      return r;
    };
  } else { err('install.tbVillagerAbility', new Error('not a function')); }

  // --- NPC turns: did the turn reach the ability check? ---
  if (typeof Game.tbVillagerTurn === 'function') {
    orig.tbVillagerTurn = Game.tbVillagerTurn;
    Game.tbVillagerTurn = function (v) {
      count('tbVillagerTurn');
      const ex = currentExposure();
      const inFight = !!(ex && Game.tbfight === openTb.fight);
      let entry = null;
      if (inFight && ex && v) {
        entry = npcTurnState(v);
        entry.foodTier = foodTierOf(Game);
        entry.round = (Game.tbfight && Game.tbfight.round != null) ? Game.tbfight.round : null;
        entry.abilityCalled = false;
        ex._npcTurnOpen = entry;
      }
      let r;
      try { r = orig.tbVillagerTurn.apply(this, arguments); } catch (e) { if (ex) ex._npcTurnOpen = null; throw e; }
      try {
        if (inFight && ex && entry) {
          entry.abilityCalled = !!entry.abilityCalled;
          entry.exitHp = (v.hp != null ? v.hp : null);
          entry.exitFled = !!v.fled;
          ex.npcTurns.push(entry);
          ex._npcTurnOpen = null;
        }
      } catch (e) { err('tbVillagerTurn.post', e); }
      return r;
    };
  } else { err('install.tbVillagerTurn', new Error('not a function')); }

  // --- player-turn action classification + boundary availability snapshot ---
  function markAction(cls) {
    return function () {
      count('act.' + cls);
      const ex = currentExposure();
      // Set BEFORE the original: tbPlayerWait advances internally,
      // so the hook fires during the original call, not after it.
      try {
        if (ex && Game.tbfight === openTb.fight) { turnAction = cls; turnActionCount++; }
      } catch (e) { err('act.' + cls + '.pre', e); }
      let r;
      const fn = orig['__act_' + cls];
      try { r = fn.apply(this, arguments); } catch (e) { throw e; }
      return r;
    };
  }
  [['tbPlayerStrike', 'strike'], ['tbPlayerShout', 'shout'],
   ['tbPlayerOfferFood', 'offer'], ['tbPlayerWait', 'wait']].forEach(function (pair) {
    const fnName = pair[0], cls = pair[1];
    if (typeof Game[fnName] === 'function') {
      orig['__act_' + cls] = Game[fnName];
      Game[fnName] = markAction(cls);
    } else { t.notes.push(fnName + ' not a function at install'); }
  });

  if (typeof Game.tbAfterPlayerAction === 'function') {
    orig.tbAfterPlayerAction = Game.tbAfterPlayerAction;
    Game.tbAfterPlayerAction = function () {
      count('tbAfterPlayerAction');
      const ex = currentExposure();
      let snap = null;
      if (ex && Game.tbfight === openTb.fight) {
        try { snap = observerAvail(ex); } catch (e) { err('observerAvail', e); }
      }
      let r;
      try { r = orig.tbAfterPlayerAction.apply(this, arguments); } catch (e) { throw e; }
      try {
        // ex was captured BEFORE the original: if the original ended
        // the fight (tbEnd ran inside the advance), openTb is already
        // null — the turn still belongs to ex. Never deref openTb here.
        if (ex) {
          ex.turns.push({ cls: turnAction || 'move-or-flee-or-other',
            round: (snap && snap.round != null) ? snap.round : ((Game.tbfight && Game.tbfight.round != null) ? Game.tbfight.round : null),
            kcal: snap ? snap.kcal : kcalOf(Game) });
          if (snap) ex.availSnapshots.push(snap);
          turnAction = null; turnActionCount = 0;
        }
      } catch (e) { err('tbAfterPlayerAction.post', e); }
      return r;
    };
  } else { err('install.tbAfterPlayerAction', new Error('not a function')); }

  // --- kill choke points: exact linkage ---
  function wrapKill(fnName, pyrrhic) {
    if (typeof Game[fnName] !== 'function') { err('install.' + fnName, new Error('not a function')); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (monsterId, killerVid, via, detail) {
      count(fnName);
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { err(fnName, e); throw e; }
      try {
        const w = waveOf(Game, monsterId);
        if (w != null && w >= 4) {
          let linkSeq = null, linkHow = null;
          if (openTb && Game.tbfight === openTb.fight) { linkSeq = openTb.seq; linkHow = 'tb-open'; }
          const row = {
            day: dayOf(Game), fn: fnName, pyrrhic: !!pyrrhic, mid: monsterId, wave: w,
            by: (killerVid == null ? null : killerVid), via: via || 'unknown',
            scholarAtKill: Game.villagerId || null,
            linkSeq: linkSeq, linkHow: linkHow,
          };
          t.killRows.push(row);
          if (linkSeq != null) {
            const ex = t.exposures.find(function (x) { return x.seq === linkSeq; });
            if (ex) ex.kills.push(row);
            else t.unlinkedKills.push(row);
          } else {
            t.unlinkedKills.push(row);
          }
        }
      } catch (e) { err(fnName + '-row', e); }
      return r;
    };
  }
  wrapKill('recordWaveKill', false);
  wrapKill('recordPyrrhicKill', true);

  function uninstall() {
    Object.keys(orig).forEach(function (n) {
      if (n.indexOf('__act_') === 0) return; // action wraps restored below
      try { Game[n] = orig[n]; } catch (e) {}
    });
    [['tbPlayerStrike', 'strike'], ['tbPlayerShout', 'shout'],
     ['tbPlayerOfferFood', 'offer'], ['tbPlayerWait', 'wait']].forEach(function (pair) {
      try { if (orig['__act_' + pair[1]]) Game[pair[0]] = orig['__act_' + pair[1]]; } catch (e) {}
    });
  }
  return { t: t, uninstall: uninstall, combatMap: cmap };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, combatMap: combatMap };
