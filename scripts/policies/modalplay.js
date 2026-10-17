// modalplay — the table-modal driver for the feastscale+takeseat road
// (flesh-out loop, axis scale-onramp, 2026-10-17; finding #480's named next).
//
// THE GATE (evidence/2026-10-17/sim-takeseat.md: 'the named next gate'):
// the take-seat driver (takeseat.js, TAKESEAT=1) sits villages at the table
// — tableDone 13/16 armed vs 0/16 control — but wins are 0/16 BOTH arms:
// Game.tableTakeSeat() opens the table modal (phase 'paths', the seven
// doors) and nothing on the feastscale road answers it. The seatdrive stack
// has windefer for the modal; the feastscale substrate has no modal driver.
// This layer is the driver on the feastscale road: it plays the seven doors
// in the modal via the REAL Game.chooseTableOption() verb. Zero src/js —
// policy-side only.
//
// THE DOOR RULE (finding #452 — pre-registered, POLICY-SIDE, NOT canon):
// the layer NEVER chooses doors via options[0] (that would be feared, by
// index.html load order — a substantive choice made by accident). At the
// 7-door offer (every option id 'path:'):
//   1. Read Game.tableEarnedPaths() — the engine's own audit pricing
//      (strength 0-100, voiced aloud at the table: "the table prices the
//      run"). Engine-honest input, not load order.
//   2. Candidates = offered doors that are EARNED per that pricing. A door
//      never offered cannot be taken — recorded, never forced (the witness
//      door: ledger.exposed >= 3, table-witness.js prereq, is dead substrate
//      on this road — exposed 0/6 on the probe; indispensable needs a full
//      seat — never earned here).
//   3. Choose the candidate with the highest strength.
//   4. Ties: the fixed pre-registered preference
//      ['beloved','feared','relay','assimilated','defiant','witness','indispensable']
//      (policy-side, not canon): prefer the door that plays the feast
//      road's demonstrated engine (audience/community: beloved) over the
//      terror tightrope (feared); the scale-independent relay next; the
//      always-open safe doors (assimilated, defiant) over the never-offered
//      ones; witness/indispensable last (dead substrate / full-seat-only —
//      listed for completeness, they can never win a tie here).
// THE BEAT RULE (challenge/finals/demand-price/conscript/downgrade):
//   - challenge/finals: the first presented option — the winpursuit drain
//     precedent. Beats are an authored live sequence (first option = the
//     straightforward walk), NOT load order; the door choice is the only
//     load-order-sensitive pick, and that is where #452 bites. One carve-out:
//     NEVER the trial (any option id containing 'trial' — trial-by-combat is
//     opt-in existential risk, a Steve call, never a policy default).
//   - downgrade: the remaining earned paths — re-apply the DOOR rule.
//   - conscript: refuse ('conscript:no' — policy-side call; canon TABLE.md:
//     refusable, and the refusal is voiced "The mourners exhale").
//   - demand-price: first presented option (drain precedent).
// THE LOOP mirrors winseek.tableRoad (the synchronous modal chain — a human
// clicks through in one sitting): answer until no choice is pending,
// Game.over, a live fight (trial-by-combat pauses — the harness drives the
// fight), the 30-answer cap, or the no-progress stall guard. Every terminal
// in the table engine sets won=true (table.js x4), so a completed drain is
// a completed story — never a wiped run (TABLE.md law 4).
//
// MODALPLAY=1 (default OFF — gate off = pure delegation, byte-identical,
// pinned by the proof's RED phase + det-gate). Composes OVER takeseat:
// leadmodalplay = withModalPlay(leadtakeseat), belongmodalplay =
// withModalPlay(belongtakeseat). The drain runs at dawn, before the base
// daily (the windefer placement precedent); the seat was taken in upkeep
// by takeseat, so the doors are answered the same dawn.
'use strict';
const { leadtakeseat, belongtakeseat } = require('./takeseat');

function layerOn() { return process.env.MODALPLAY === '1'; }

// TIE_BREAK: the pre-registered door preference (policy-side, not canon).
// See the header for the rationale.
const TIE_BREAK = ['beloved', 'feared', 'relay', 'assimilated', 'defiant', 'witness', 'indispensable'];
function tieRank(door) {
  const i = TIE_BREAK.indexOf(door);
  return i < 0 ? 99 : i; // unknown doors sort last, never first
}

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function pendingOptions(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const tc = s.tableChoices;
    if (!tc || !tc.options || !tc.options.length) return null;
    if (typeof Game.chooseTableOption !== 'function') return null;
    return tc.options;
  } catch (e) { return null; }
}

function ensureMP(ctx) {
  let MP = ctx._modalplay;
  if (!MP) MP = ctx._modalplay = { doors: [], beats: [] };
  return MP;
}

// pickDoor: the pre-registered door rule. Returns the chosen option object
// or null (no honest pick — never invent one).
function pickDoor(Game, options, ctx) {
  let priced = [];
  try { priced = (typeof Game.tableEarnedPaths === 'function') ? Game.tableEarnedPaths() : []; } catch (e) { priced = []; }
  const earnedById = {};
  const offeredIds = [];
  for (const p of priced) {
    if (!p || !p.id) continue;
    offeredIds.push({ id: p.id, earned: !!p.earned, strength: (p.strength | 0) || 0 });
    if (p.earned) earnedById[p.id] = p;
  }
  const cands = [];
  for (const o of options) {
    const id = String((o && o.id) || '');
    const door = id.indexOf('path:') === 0 ? id.slice(5) : (id.indexOf('downgrade:') === 0 ? id.slice(10) : null);
    if (door == null) continue;
    if (!earnedById[door]) continue; // a door never offered cannot be taken — recorded, never forced
    cands.push({ o, door, strength: (earnedById[door].strength | 0) || 0 });
  }
  if (!cands.length) { ctx.mpDoorNoHonest = (ctx.mpDoorNoHonest | 0) + 1; return null; }
  cands.sort((a, b) => (b.strength - a.strength) || (tieRank(a.door) - tieRank(b.door)));
  const win = cands[0];
  try {
    const MP = ensureMP(ctx);
    MP.doors.push({
      day: gday(Game), door: win.door, strength: win.strength,
      tie: cands.filter(c => c.strength === win.strength).map(c => c.door),
      offered: offeredIds,
      witnessEarned: !!(earnedById.witness),
    });
    if (MP.doors.length > 40) MP.doors.splice(0, MP.doors.length - 40);
  } catch (e) {}
  ctx.mpDoorsPlayed = (ctx.mpDoorsPlayed | 0) + 1;
  if (win.door === 'witness') ctx.mpWitnessTaken = (ctx.mpWitnessTaken | 0) + 1; // honest tripwire — dead substrate says this never fires
  return win.o;
}

// pickOption: the pre-registered beat rule. Returns the chosen option or null.
function pickOption(Game, options, ctx) {
  const ids = options.map(o => String((o && o.id) || ''));
  if (ids.every(id => id.indexOf('path:') === 0)) return pickDoor(Game, options, ctx);       // the 7-door offer
  if (ids.every(id => id.indexOf('downgrade:') === 0)) return pickDoor(Game, options, ctx);  // downgrade: remaining earned paths, same rule
  if (ids.some(id => id.indexOf('conscript:') === 0)) {                                      // dark conscript: refuse (policy-side call)
    ctx.mpConscriptRefused = (ctx.mpConscriptRefused | 0) + 1;
    return options.find(o => String(o.id) === 'conscript:no') || options[0];
  }
  // challenge beats / finals / demand-price: the winpursuit drain precedent —
  // first presented option, but NEVER the trial (opt-in existential risk is
  // a Steve call, not a policy default).
  const nonTrial = options.filter(o => String(o.id).indexOf('trial') < 0);
  if (nonTrial.length < options.length) ctx.mpTrialSkipped = (ctx.mpTrialSkipped | 0) + 1;
  return nonTrial[0] || null;
}

// drainModal: play the modal to completion in one daily (the synchronous
// modal chain — winseek.tableRoad's structure, with the door rule above).
function drainModal(Game, ctx) {
  if (!layerOn()) return; // gate off: pure delegation — never drive
  if (Game.over) return;
  let n = 0, lastSig = null, stall = 0;
  for (;;) {
    if (Game.over) break;
    if (n >= 30) break;
    try { if (Game.tbfight && !Game.tbfight.over) break; } catch (e) {} // trial-by-combat pauses the challenge — the harness drives the fight
    let tc = null;
    try { tc = (Game.state.scholar || {}).tableChoices; } catch (e) { tc = null; }
    const options = pendingOptions(Game);
    if (!options) break;
    const sig = (tc && tc.frame) + '|' + options.map(o => String(o.id)).join(',');
    if (sig === lastSig && ++stall >= 2) break; // no progress — stop
    lastSig = sig;
    const pick = pickOption(Game, options, ctx);
    if (!pick) break; // no honest pick — never invent one
    Game.chooseTableOption(pick.id);
    n++;
    ctx.mpAnswers = (ctx.mpAnswers | 0) + 1;
    try {
      const MP = ensureMP(ctx);
      MP.beats.push({ day: gday(Game), id: String(pick.id), frame: (tc && tc.frame) || null });
      if (MP.beats.length > 60) MP.beats.splice(0, MP.beats.length - 60);
    } catch (e) {}
  }
  if (n > 0) ctx.mpDrained = true;
}

function withModalPlay(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      try { drainModal(Game, ctx); } catch (e) { ctx.mpDriveError = (ctx.mpDriveError | 0) + 1; }
      return base.daily(Game, ctx);
    },
  });
}

const leadmodalplay = withModalPlay(
  leadtakeseat, 'leadmodalplay',
  'leadtakeseat + modalplay (MODALPLAY=1): plays the table modal — the 7 doors by the pre-registered strength/tie-break rule (never options[0] by load order), beats by the drain precedent, never the trial'
);
const belongmodalplay = withModalPlay(
  belongtakeseat, 'belongmodalplay',
  'belongtakeseat + modalplay (MODALPLAY=1): plays the table modal — the 7 doors by the pre-registered strength/tie-break rule (never options[0] by load order), beats by the drain precedent, never the trial'
);

module.exports = {
  layerOn, withModalPlay, drainModal, pickDoor, pickOption, TIE_BREAK,
  leadmodalplay, belongmodalplay,
};
