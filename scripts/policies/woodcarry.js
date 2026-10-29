// policies/woodcarry.js — daytime wood-carrying precondition lever
// (sim-woodcarry3-b, 2026-10-29, flesh-out loop B, axis
// food-economy). POLICY-SIDE LEVER ONLY: zero src/js changes.
// Default OFF: WOODCARRY=1 enables, WOODCARRY=0 delegates
// (classifying refused evenings only, pure reads).
//
// Rebuilt from the spec in evidence/2026-10-29/
// sim-woodcarry2-b-prereg.md (the 1530Z lever, reverted on
// INSUFFICIENT-DATA; the algorithm is fully specified there
// and here). Two steps, both policy-side:
//
// 1. MORNING CARRY (pre-inner.daily, each loop-day, only when
//    the player starts the day at haven — inside, or outside
//    on the haven tile — not dead, not in combat): if player
//    wood < 4 AND pile minus deficit >= 8 (PILE_FLOOR: the
//    hearth reserve competent.js trips at pile < 8) AND
//    morning kcal >= 60 (KCAL_FLOOR: the bridge's own cost)
//    AND canCarry(deficit * 2), take exactly deficit =
//    4 - wood logs via the same honest transaction as
//    Game.takeWood (pile -= deficit, addWood(deficit), say
//    line, tickAction(2)).
// 2. EVENING BRIDGE (post-inner.daily, only on a
//    travel-refused evening with hopReturnKind block:creek):
//    classify the refusal from refusal-time state (reusing
//    creekremedy-diag's pure classifyRefusedEvening /
//    bucketOf — pure reads, no RNG, no game writes). If
//    classified creek AND wood >= 4 AND evening kcal >= 60
//    AND ticks-to-day-end >= 96 AND the probe tile carries
//    needsBridge true and bridged not-true AND not dead
//    AND not in combat, call Game.buildBridge on the probe
//    tile; if bridged, retry Game.travelTo(haven) once; if
//    arrived at the haven node, delegate to insideevening's
//    eveningStep for the lodge leg, exactly as nighttravel
//    delegates after a hop. If the evening is STILL refused
//    after any attempt (or no attempt was made), say ONE
//    honest line naming what is lacking. The line fires
//    only on the ON leg.
//
// The wrapper NEVER touches src/js, NEVER writes game state
// except through the engine verbs above (addWood,
// buildBridge, travelTo, eveningStep), and draws NO RNG
// itself (a retry hop's arrival may run the engine's own
// encounter checks, exactly as nighttravel's hop does —
// downstream of the lever, not an instrument draw).
'use strict';

const { classifyRefusedEvening, bucketOf } = require('./creekremedy-diag');
const { eveningStep } = require('./insideevening');

const PILE_FLOOR = 8;
const KCAL_FLOOR = 60;
const TICKS_NEEDED = 96;
const WOOD_NEEDED = 4;

function leverOn() {
  try { return process.env.WOODCARRY === '1'; } catch (e) { return false; }
}

function newStore() {
  return { records: 0, errs: 0, errors: [], classified: 0, unclassified: 0, otherRefused: 0 };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

function startsAtHaven(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    if (sch.insideHaven === true) return true;
    const t = Game.playerTile();
    return !!(t && t.type === 'haven');
  } catch (e) { return false; }
}

function scholarKcal(Game) {
  try { return Math.round((Game.state || {}).scholar.kcal || 0); } catch (e) { return 0; }
}

function pileWood(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return (v.wood === undefined ? null : v.wood);
  } catch (e) { return null; }
}

function playerWood(Game) {
  try { return (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { return null; }
}

function atHavenNode(Game, hx, hy) {
  try { return Game.map && Game.map.px === hx && Game.map.py === hy; } catch (e) { return false; }
}

// Pure carry gate (unit-tested by scripts/test-woodcarry3-b.js
// T1). Returns { take: n } or { skip: reason }.
function carryDecision(o) {
  const wood = o.wood, pile = o.pile, kcal = o.kcal;
  if (wood === null || wood === undefined) return { skip: 'wood-unknown' };
  if (wood >= WOOD_NEEDED) return { skip: 'already-carrying' };
  const deficit = WOOD_NEEDED - wood;
  if (pile === null || pile === undefined || pile - deficit < PILE_FLOOR) return { skip: 'pile-floor' };
  if (kcal === null || kcal === undefined || kcal < KCAL_FLOOR) return { skip: 'kcal-floor' };
  if (!o.canCarryKg) return { skip: 'cannot-carry' };
  return { take: deficit };
}

// Pure bridge gate (unit-tested by scripts/test-woodcarry3-b.js
// T2). blockedTileBridged null (engine: flag unset) counts as
// not bridged — only true blocks. Returns { attempt: true }
// or { skip: reason }.
function bridgeDecision(r) {
  if (r.gameOver) return { skip: 'game-over' };
  if (r.combatLive) return { skip: 'combat' };
  if (!r.isCreek) return { skip: 'not-creek' };
  if (r.blockedTileBridged === true) return { skip: 'already-bridged' };
  if (r.blockedTileNeedsBridge !== true) return { skip: 'no-gap' };
  if (r.woodPlayer === null || r.woodPlayer === undefined || r.woodPlayer < WOOD_NEEDED) return { skip: 'wood-short' };
  if (r.kcal === null || r.kcal === undefined || r.kcal < KCAL_FLOOR) return { skip: 'kcal-short' };
  if (r.ticksToDayEnd === null || r.ticksToDayEnd === undefined || r.ticksToDayEnd < TICKS_NEEDED) return { skip: 'ticks-short' };
  return { attempt: true };
}

// One honest line naming what is lacking (unit-tested by
// scripts/test-woodcarry3-b.js T3). info carries the live
// numbers so the line names them, never a generic excuse.
function lackingLine(skip, info) {
  const i = info || {};
  switch (skip) {
    case 'wood-short':
      return 'No bridge tonight — the pack holds ' + (i.woodPlayer === null || i.woodPlayer === undefined ? 'no' : i.woodPlayer) + ' log' + (i.woodPlayer === 1 ? '' : 's') + ', and a bridge needs 4.';
    case 'kcal-short':
      return 'No bridge tonight — ' + (i.kcal === null || i.kcal === undefined ? 'no' : i.kcal) + ' kcal in hand, and the lashing takes 60.';
    case 'ticks-short':
      return 'No bridge tonight — ' + (i.ticksToDayEnd === null || i.ticksToDayEnd === undefined ? 'no' : i.ticksToDayEnd) + ' ticks left in the day, and a bridge takes 96 ticks.';
    case 'pile-floor':
      return 'No logs to spare tonight — the hearth pile must hold 8.';
    case 'retry-refused':
      return 'The bridge stands, but the way home still refuses — ' + (i.hopReturnKind || 'blocked') + '.';
    case 'build-refused':
      return 'The logs would not lash here tonight — no bridge stands.';
    case 'already-bridged':
      return 'A bridge already spans this gap — the way home lies elsewhere tonight.';
    case 'combat':
      return 'No bridge mid-fight — the barrier is the way out.';
    case 'game-over':
      return 'No bridge tonight — the day is over.';
    case 'not-creek':
    case 'no-gap':
      return 'No gap to span here — save your wood.';
    default:
      return 'No bridge tonight — something is lacking.';
  }
}

function withWoodcarry(inner, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'woodcarry',
    desc: 'nighttravel + morning wood carry + evening bridge attempt (WOODCARRY=1)',
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      try { ctx._wcLast = null; } catch (e) {}
      try { ctx._wcCarry = null; } catch (e) {}
      // ---- MORNING CARRY (pre-inner.daily) ----
      let carryRec = null;
      if (!leverOn()) {
        carryRec = { acted: false, skip: 'lever-off', loopDay };
      } else {
        try {
          if (Game.over) {
            carryRec = { acted: false, skip: 'game-over', loopDay };
          } else if (combatLive(Game)) {
            carryRec = { acted: false, skip: 'combat', loopDay };
          } else if (!startsAtHaven(Game)) {
            carryRec = { acted: false, skip: 'not-at-haven', loopDay };
          } else {
            const wood = playerWood(Game);
            const pile = pileWood(Game);
            const kcal = scholarKcal(Game);
            let canKg = false;
            if (wood !== null && wood < WOOD_NEEDED) {
              try { canKg = !!Game.canCarry((WOOD_NEEDED - wood) * 2); }
              catch (e) { noteErr(st, 'carry.canCarry', e); canKg = false; }
            }
            const dec = carryDecision({ wood, pile, kcal, canCarryKg: canKg });
            if (dec.take) {
              const n = dec.take;
              const pileBefore = pile, woodBefore = wood;
              Game.state.village.wood -= n;
              Game.addWood(n);
              const pileAfter = Game.state.village.wood;
              const woodAfter = playerWood(Game);
              Game.say('You take ' + n + ' log' + (n > 1 ? 's' : '') + ' from the woodpile for the road home. (' + pileAfter + ' left for the hearth.)');
              Game.tickAction(2);
              carryRec = { acted: true, took: n, woodBefore, woodAfter, pileBefore, pileAfter, kcal, loopDay };
            } else {
              carryRec = { acted: false, skip: dec.skip, woodBefore: wood, pileBefore: pile, kcal, loopDay };
            }
          }
        } catch (e) {
          noteErr(st, 'carry', e);
          carryRec = { acted: false, skip: 'error', loopDay };
        }
      }
      try { ctx._wcCarry = carryRec; } catch (e) { noteErr(st, 'carry.ctx', e); }
      // ---- INNER DAY (competent + night step) ----
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      // ---- EVENING BRIDGE (post-inner.daily) ----
      let last = null;
      try {
        const nt = ctx._ntLast || {};
        if (nt.outcome === 'travel-refused') {
          let cls = null, bucket = 'none';
          try {
            cls = classifyRefusedEvening(Game, nt);
            bucket = bucketOf(cls);
            st.records++;
            if (bucket === 'creek') st.classified++;
            else if (bucket === 'unclassified') st.unclassified++;
            else if (bucket === 'other-refused') st.otherRefused++;
          } catch (e) {
            noteErr(st, 'evening.classify', e);
            cls = null; bucket = 'unclassified'; st.records++; st.unclassified++;
          }
          const hopKind = (nt.travel && nt.travel.hopReturnKind) || (cls && cls.hopReturnKind) || null;
          if (!leverOn() || bucket !== 'creek' || !cls) {
            last = {
              outcome: 'travel-refused', bucket, classification: cls, hopReturnKind: hopKind,
              bridge: { attempted: false, skip: null, built: null },
              retry: null, entryOutcome: null, rescued: false, narration: null,
            };
          } else {
            const hx = cls.haven.hx, hy = cls.haven.hy;
            const kcalLive = (cls.kcalLive === null || cls.kcalLive === undefined) ? cls.kcal : cls.kcalLive;
            const dec = bridgeDecision({
              isCreek: true, gameOver: !!cls.gameOver, combatLive: !!cls.combatLive,
              blockedTileNeedsBridge: cls.blockedTileNeedsBridge, blockedTileBridged: cls.blockedTileBridged,
              woodPlayer: cls.woodPlayer, kcal: kcalLive, ticksToDayEnd: cls.ticksToDayEnd,
            });
            let bridge = null, retry = null, entryOutcome = null, narration = null;
            if (dec.attempt) {
              let built = false, buildErr = null;
              try { built = !!Game.buildBridge(cls.blockedTile.x, cls.blockedTile.y); }
              catch (e) { buildErr = String(e && e.message).slice(0, 120); }
              bridge = { attempted: true, skip: null, built, error: buildErr };
              if (built) {
                let retryErr = null;
                try { Game.travelTo(hx, hy); } catch (e) { retryErr = String(e && e.message).slice(0, 120); }
                const arrived = atHavenNode(Game, hx, hy);
                retry = { arrived, error: retryErr };
                if (arrived && !Game.over && !combatLive(Game)) {
                  try { const ie = eveningStep(Game, ctx); entryOutcome = ie.outcome; }
                  catch (e) { noteErr(st, 'evening.entry', e); entryOutcome = null; }
                }
              }
              const rescued = atHavenNode(Game, hx, hy);
              if (!rescued) {
                narration = lackingLine(built ? 'retry-refused' : 'build-refused', { hopReturnKind: hopKind });
                try { Game.say(narration); } catch (e) { noteErr(st, 'evening.say', e); }
              }
              last = {
                outcome: 'travel-refused', bucket, classification: cls, hopReturnKind: hopKind,
                bridge, retry, entryOutcome, rescued, narration,
              };
            } else {
              bridge = { attempted: false, skip: dec.skip, built: null };
              const rescued = atHavenNode(Game, hx, hy);
              if (!rescued) {
                narration = lackingLine(dec.skip, { woodPlayer: cls.woodPlayer, kcal: kcalLive, ticksToDayEnd: cls.ticksToDayEnd, hopReturnKind: hopKind });
                try { Game.say(narration); } catch (e) { noteErr(st, 'evening.say', e); }
              }
              last = {
                outcome: 'travel-refused', bucket, classification: cls, hopReturnKind: hopKind,
                bridge, retry: null, entryOutcome: null, rescued, narration,
              };
            }
          }
        }
      } catch (e) {
        noteErr(st, 'evening', e);
        last = {
          outcome: 'travel-refused', bucket: 'unclassified', classification: null, hopReturnKind: null,
          bridge: { attempted: false, skip: null, built: null },
          retry: null, entryOutcome: null, rescued: false, narration: null,
        };
      }
      try { ctx._wcLast = last; } catch (e) { noteErr(st, 'evening.ctx', e); }
      return r;
    },
  });
}

module.exports = {
  PILE_FLOOR, KCAL_FLOOR, TICKS_NEEDED, WOOD_NEEDED,
  leverOn, newStore, carryDecision, bridgeDecision, lackingLine, withWoodcarry,
};
