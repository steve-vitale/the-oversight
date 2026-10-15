// wave5reach — scale-onramp lever: deliberate wave-4 counter-learning
// expeditions after wave-4 unlock, to move wave-5 UNLOCKS on the win-side
// stack (flesh-out loop, 2026-10-15, sim-wave5reach).
//
// CONTEXT: sim-seatdrive / sim-winconfirm measured 12/16 wins on the armed
// win-side stack (FEASTSCALE_R13 + TRIBFLOOR + SUCCGRACE + RAIDDENSITY +
// WINPURSUIT + WINDEFER + SEATDRIVE=1), but wave-5 unlocks are unmoved —
// 4/16 armed vs 8/16 control on winconfirm, EXPLAINED as win-truncation
// (wins end ~d90; wave-5 unlocks land d112–176). sim-survdiff #281:
// wave-1/2 counters bright (12–25), wave-3+ tricks dark (0–1).
//
// THE GATE (standing.js, docs/MONSTER-WAVES.md — the lever touches the
// wave law, so it reads it): wave 5 unlocks when villageStandingTotal()
// >= t5(200) AND waveUnlockReady(5).ready — waveEngaged(4) >= 2 distinct
// wave-4 types faced blow-by-blow (FLEEING COUNTS: "you stood on the
// grid"). Standing: war +25 per wave-3+ ledger kill point (per-type cap
// 2), diplomacy +34 per seasoned regional+ link, plenty +20 per major
// feast (capped at 100 toward t5). The rungs sit on top of the wave-3
// rung. The wave-3/4/5 rungs the OLD gate used (3 wave-4 points +
// national) were retired 2026-10-15 as unreachable by construction —
// this lever works the CURRENT gate, not the dead one.
//
// THE LEVER (policy-side only, ZERO src/js changes): after wave-4 unlock
// and before wave-5 unlock (never during the table sequence), the scholar
// deliberately pursues wave-5's counter knowledge through HONEST PLAY
// VERBS ONLY:
//   1. COUNTER-LEARNING EXPEDITIONS (courtkill-proven pattern): every 3rd
//      day, healthy and fed, travel to monster-country nodes and engage
//      visible wave-3/4+ monsters — each engagement feeds waveEngaged
//      (the readiness gate's own knowledge currency; fleeing counts) and
//      real kills feed the war ledger (+25 standing each).
//   2. FIGHT COMMITMENT: wave-3 in fight -> ctx._huntCommit (the proven
//      courtkill mechanism); wave-4+ in fight + scholar >= 50% HP ->
//      ctx._w5Commit, honored by the extended legacy flee block in
//      competent.js (start-of-fight walk-away overridden ONLY; the
//      mid-fight 35% eject is unchanged — wave-4 attrition is bloodier
//      than wave-3, retreat when losing stays honest).
//   3. VILLAGE TEACHING: the base (competent.js) already asks
//      askAbout(vid, 'beasttricks') whenever counterTeachable() says the
//      village knows something — no reinvention; wave-4/5 have no
//      teachable topic in the engine (no counter field, not in
//      villagerTrickDefs — deliberately counter-less), so there is no
//      honest teaching verb for them and the layer invents none.
//
// Never free knowledge (no engine state writes), never combat cheats
// (real fights, real attrition, the 35% retreat stays), never
// reimplementing the engine's wave deed bars (reads only).
//
// Env gate WAVE5REACH=1 opts IN (default OFF). Gate off = pure
// delegation: no hunt legs, no commit flags, byte-identical to the
// seatdrive composition (the proof's det-gate pins that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law), docs/TABLE.md.
// "Trick" per wave-5 monster (the lever respects it, never shortcuts it):
//   Cancellation — go off-script or spend favor (un-teaches abilities);
//   Editor — retrieve from the cutting-room floor, or contradict yourself
//   to jam the blades; Rerun — leave mechanical messages in the margins,
//   or win fast; Spoiler — ask binding questions, fulfill cheaply, or make
//   it a lie; Timeslot — own the venue or get bumped; Nielsen — FIGHT
//   BORING; Finale — feed it a sacrifice, or end it first; Network Note —
//   kill it first, or feed it bad notes. All engine-real in sigW5.js; the
//   bot fights them on honest terms through the base's fight handler.
'use strict';
const SD = require('./seatdrive');

function wave5reachOn() { return process.env.WAVE5REACH === '1'; }

function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function unlockedWave(Game) {
  try { return (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 1) | 0; }
  catch (e) { return 1; }
}
function tableBusy(Game) {
  try {
    const pg = Game.progState ? Game.progState() : {};
    return !!(pg.tableDone || pg.tableWaiting);
  } catch (e) { return false; }
}
// The hunt is live: opted in, wave-4 unlocked, wave-5 not yet, and the
// scholar is not sitting the table sequence. Once wave-5 unlocks the goal
// is met and the hunt stands down.
function huntLive(Game) {
  if (!wave5reachOn()) return false;
  const uw = unlockedWave(Game);
  return uw >= 4 && uw < 5 && !tableBusy(Game);
}
function scholarHpPct(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    return (s.hp || s.health || 100) / Math.max(1, maxHp);
  } catch (e) { return 1; }
}

// ENGAGE (seek side, engine-honest — courtkill's engageVisibleWave3
// pattern): a visible wave-3+ world monster on the scholar's node gets
// walked up to on the detail grid — the same thing a player tapping the
// monster does. beginPathWalk/pathStep run monsterTurn per square;
// contact starts the fight via the engine's own startCombat. Bounded: 12
// steps, then the world has answered (it closed, fled, or lost the
// trail — all honest outcomes). Wave-4+ is the facing prize (the
// readiness rung); wave-3 is blood (war ledger).
function engageVisibleWaveTarget(Game, ctx, minWave) {
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return false;
    const wm = Game.monsterAt && Game.monsterAt(Game.map.px, Game.map.py);
    if (!wm || !wm.id) return false;
    if (beastWaveOf(Game, wm.id) < minWave) return false;
    let steps = 0;
    while (!Game.over && !Game.tbfight && steps++ < 12) {
      const cur = Game.monsterAt(Game.map.px, Game.map.py);
      if (!cur || cur.id !== wm.id) break; // gone: fled, died, despawned
      const s = Game.state.scholar || {};
      const sx = s.mx ?? 4, sy = s.my ?? 4;
      const cx = cur.mx ?? 4, cy = cur.my ?? 4;
      const dx = Math.sign(cx - sx), dy = Math.sign(cy - sy);
      if (!dx && !dy) break; // on top of it — contact should have fired
      let ok = false;
      try { ok = Game.pathStep(sx + dx, sy + dy); } catch (e) { ok = false; }
      if (!ok && dx && dy) { try { ok = Game.pathStep(sx + dx, sy); } catch (e) { ok = false; } }
      if (!ok) break; // blocked — the walk stops here, honestly
      ctx.w5HuntSteps = (ctx.w5HuntSteps || 0) + 1;
    }
    if (Game.tbfight) { ctx.w5HuntEngaged = (ctx.w5HuntEngaged || 0) + 1; return true; }
    return false;
  } catch (e) { return false; }
}

// HUNT LEG (seek side): a deliberate counter-learning expedition. Every
// 3rd day after wave-4 unlock, healthy and fed, the scholar travels out
// to monster-country nodes — each node entry rolls the real
// checkEncounter (the honest gradient) — engages visible wave-3/4+
// monsters (facing feeds waveEngaged; kills feed the war ledger), then
// comes home. The win-side verbs already ran (base.daily first); the hunt
// never preempts a proposal, a tend, a tribute, or the table sequence.
function huntLeg(Game, ctx) {
  if (!huntLive(Game)) return;
  try {
    if (Game.over || Game.tbfight) return;
    const s = (Game.state || {}).scholar || {};
    if (s.exiled) return;
    if (scholarHpPct(Game) < 0.6) return; // hunt healthy or not at all
    if ((s.kcal || 0) < 200) return;      // don't hunt hungry
    const day = s.day || 0;
    if (day - (ctx._lastW5HuntDay == null ? -99 : ctx._lastW5HuntDay) < 3) return;
    const cands = [];
    for (const tt of (Game.travelTargets() || [])) {
      let t = null;
      try { t = Game.tileAt(tt.x, tt.y); } catch (e) {}
      if (!t || t.type === 'haven' || t.type === 'oldhaven') continue;
      if (t.type !== 'thicket' && t.type !== 'ruin' && t.type !== 'forest' && t.type !== 'grove') continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d || 0, type: t.type, revealed: !!t.revealed });
    }
    if (!cands.length) return;
    // Revealed thickets first — player-visible world knowledge; the fog
    // keeps its secrets (same honesty as courtkill's forage-trip logic).
    cands.sort((a, b) => ((b.revealed - a.revealed) ||
      ((a.type === 'thicket' ? 0 : 1) - (b.type === 'thicket' ? 0 : 1)) || (a.d - b.d)));
    ctx._lastW5HuntDay = day;
    ctx.w5Hunts = (ctx.w5Hunts || 0) + 1;
    const home = { x: Game.map.px, y: Game.map.py };
    for (const leg of cands.slice(0, 2)) {
      if (Game.over || Game.tbfight) break;
      try { Game.travelTo(leg.x, leg.y); } catch (e) { break; }
      ctx.w5HuntLegs = (ctx.w5HuntLegs || 0) + 1;
      if (Game.over || Game.tbfight) break;
      if (engageVisibleWaveTarget(Game, ctx, 3)) break; // fight started — the harness drives it
    }
    if (!Game.over && !Game.tbfight && (Game.map.px !== home.x || Game.map.py !== home.y)) {
      try { Game.travelTo(home.x, home.y); } catch (e) {}
    }
  } catch (e) {}
}

function withWave5Reach(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!wave5reachOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // win-side verbs run FIRST and fully — never preempted
      huntLeg(Game, ctx);    // additive counter-learning expedition
    },
    fight(Game, ctx) {
      // COMMIT (fight side): mark live wave-3/4+ fights as committed
      // hunts before delegating. competent.fight reads:
      //   ctx._huntCommit — the proven courtkill mechanism (wave-3:
      //     overrides start-of-fight walk-away, holds to 12%)
      //   ctx._w5Commit — the wave5reach mechanism (wave-4+ at >=50% HP:
      //     overrides start-of-fight walk-away ONLY; the mid-fight 35%
      //     eject is unchanged — see the competent.js extension comment)
      // Recomputed every player turn; false whenever the gate is off, the
      // hunt is not live, or no wave-3/4+ monster is in the fight.
      try {
        ctx._huntCommit = false;
        ctx._w5Commit = false;
        if (huntLive(Game)) {
          const f = Game.tbfight;
          if (f && !f.over) {
            const mons = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0);
            const waves = mons.map(m => beastWaveOf(Game, beastMidOf(m)));
            const hpOk = scholarHpPct(Game) >= 0.5;
            if (hpOk && waves.some(w => w === 3)) {
              ctx._huntCommit = true;
              ctx.w5BloodFights = (ctx.w5BloodFights || 0) + 1;
            }
            if (hpOk && waves.some(w => w >= 4)) {
              ctx._w5Commit = true;
              ctx.w5FacingFights = (ctx.w5FacingFights || 0) + 1;
            }
          }
        }
      } catch (e) { ctx._huntCommit = false; ctx._w5Commit = false; }
      return base.fight(Game, ctx);
    },
  });
}

// The sweep imports these ids ('leadfeast-windefer', 'belongfeast-windefer'
// — the same ids sim-winconfirm's armed side used; both sides share the
// objects, WAVE5REACH is the only switch). The composition mirrors the
// seatdrive armed stack exactly: tribfloor base -> withWinDefer ->
// withSeatDrive -> withWave5Reach.
const leadseat = withWave5Reach(
  SD.leadseat,
  'leadfeast-windefer',
  'seatdrive stack + wave5reach (WAVE5REACH=1): counter-learning expeditions for wave-4 after wave-4 unlock; committed wave-3/4+ fights'
);
const belongseat = withWave5Reach(
  SD.belongseat,
  'belongfeast-windefer',
  'seatdrive stack + wave5reach (WAVE5REACH=1): counter-learning expeditions for wave-4 after wave-4 unlock; committed wave-3/4+ fights'
);

module.exports = {
  wave5reachOn, withWave5Reach, huntLive, unlockedWave, beastWaveOf, beastMidOf,
  engageVisibleWaveTarget, huntLeg, scholarHpPct, leadseat, belongseat,
};
