// courtkill — scale-wall r18 arm 1: deliberate wave-3 hunting on the
// courtship road (Steve 2026-10-13 throughput: second-axis lever run).
//
// CONTEXT (r17 tablerecon finding): the wave-4 unlock gate is a TWO-RUNG
// bind — (1) 4 wave-3 ledger kill points (kills only, per-type cap 2), (2)
// regional+ scale. The courtship road (leadcourt/belongseek) holds rung 2
// but scores 0/8 on rung 1: the policy flees every wave-3 fight at fight
// start (legacy `outmatched`: a 240-420 HP wave-3 monster vs ~120 maxHp
// scholar trips `totalMhp > 2.5 * pmax`) and again at 35% HP mid-fight —
// so the ledger never sees a wave-3 kill. The kill road has kills but no
// scale. Question: can the COURTSHIP road produce BOTH?
//
// LEVER: after wave-3 unlocks, the scholar deliberately hunts wave-3
// encounters — engine-honest hunting expeditions (real travelTo node entries
// rolling the real checkEncounter, thicket/ruin tiles for the honest 15%/12%
// spawn chance; 60% of post-unlock spawns are wave-3 by spawnWaveTarget) —
// and FIGHTS them on honest terms. The r16 dmgmath finding says wave-1/2+3
// fights are attrition and winnable, not burst deaths (103/104 scholars
// survived; wave-3 is 4-6 rounds at mid build) — so a committed hunt holds
// to 12% HP instead of fleeing at 35%, and never walks away at fight start.
// Counters are found-but-not-executed (r16): wave-3 has no `counter` field
// by design (signature-mechanics space) — the hunt is pure attrition, no
// trick play.
//
// CRITICAL: the courtship behavior is untouched — base.daily runs FIRST and
// fully (proposeLink/tendLink/tribute all fire exactly as before); the hunt
// leg is additive. One playstyle holding both rungs.
//
// Env gate COURTKILL=1 opts IN (default OFF). Gate off = pure delegation:
// no hunt legs, no fight marking, byte-identical to the base policy.
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-3 roster, bands,
// ledger law), docs/PROGRESSION.md §12 (ledger config).
'use strict';
const { leadcourt } = require('./leadcourt');
const { belongseek } = require('./belongseek');

function courtkillOn() { return process.env.COURTKILL === '1'; }

function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function wave3Unlocked(Game) {
  try { return (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 1) >= 3; }
  catch (e) { return false; }
}
function wave3Points(Game) {
  try { return (typeof Game.waveLedgerPoints === 'function' ? (Game.waveLedgerPoints(3) | 0) : 0); }
  catch (e) { return 0; }
}
// The hunt is live: opted in, wave-3 unlocked, and the rung not yet met.
// Once 4 wave-3 ledger points are banked the hunt stands down — the scholar
// goes back to pure courtship and the normal (cautious) fight behavior.
function huntLive(Game) {
  return courtkillOn() && wave3Unlocked(Game) && wave3Points(Game) < 4;
}
function scholarHpPct(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    return (s.hp || s.health || 100) / Math.max(1, maxHp);
  } catch (e) { return 1; }
}

// ENGAGE (seek side, engine-honest): a visible wave-3 world monster on the
// scholar's node gets walked up to on the detail grid — the same thing a
// player tapping the monster does. beginPathWalk/pathStep run monsterTurn
// per square ("monsters move when you do"); contact starts the fight via
// the engine's own startCombat. Bounded: 12 steps, then the world has
// answered (it closed, fled, or lost the trail — all honest outcomes).
function engageVisibleWave3(Game, ctx) {
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return false;
    const px = Game.map.px, py = Game.map.py;
    const wm = Game.monsterAt && Game.monsterAt(px, py);
    if (!wm || !wm.id) return false;
    if (beastWaveOf(Game, wm.id) !== 3) return false;
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
      ctx.huntSteps = (ctx.huntSteps || 0) + 1;
    }
    if (Game.tbfight) { ctx.huntEngaged = (ctx.huntEngaged || 0) + 1; return true; }
    return false;
  } catch (e) { return false; }
}

// HUNT LEG (seek side): a deliberate excursion into monster country. Every
// 3rd day after wave-3 unlock, healthy and fed, the scholar travels out to
// thicket/ruin nodes — each node entry rolls the real checkEncounter
// (thicket 15%, ruin 12%, the honest gradient) — engages visible wave-3
// monsters, then comes home. The court's business already ran (base.daily
// first); the hunt never preempts a proposal, a tend, or a tribute.
function huntLeg(Game, ctx) {
  if (!huntLive(Game)) return;
  try {
    if (Game.over || Game.tbfight) return;
    const s = (Game.state || {}).scholar || {};
    if (s.exiled) return;
    if (scholarHpPct(Game) < 0.6) return; // hunt healthy or not at all
    if ((s.kcal || 0) < 200) return;      // don't hunt hungry
    const day = s.day || 0;
    if (day - (ctx._lastHuntDay == null ? -99 : ctx._lastHuntDay) < 3) return;
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
    // keeps its secrets (same honesty as the forage trip's vine logic).
    cands.sort((a, b) => ((b.revealed - a.revealed) ||
      ((a.type === 'thicket' ? 0 : 1) - (b.type === 'thicket' ? 0 : 1)) || (a.d - b.d)));
    ctx._lastHuntDay = day;
    ctx.hunts = (ctx.hunts || 0) + 1;
    const home = { x: Game.map.px, y: Game.map.py };
    for (const leg of cands.slice(0, 2)) {
      if (Game.over || Game.tbfight) break;
      try { Game.travelTo(leg.x, leg.y); } catch (e) { break; }
      ctx.huntLegs = (ctx.huntLegs || 0) + 1;
      if (Game.over || Game.tbfight) break;
      if (engageVisibleWave3(Game, ctx)) break; // fight started — the harness drives it
    }
    if (!Game.over && !Game.tbfight && (Game.map.px !== home.x || Game.map.py !== home.y)) {
      try { Game.travelTo(home.x, home.y); } catch (e) {}
    }
  } catch (e) {}
}

function withCourtKill(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      base.daily(Game, ctx); // courtship verbs run FIRST and fully — never preempted
      huntLeg(Game, ctx);    // additive hunt leg
    },
    fight(Game, ctx) {
      // COMMIT (fight side): mark live wave-3 fights as committed hunts
      // before delegating — competent.fight reads ctx._huntCommit (its two
      // flee decision points) and holds the attrition instead of walking
      // away. Recomputed every player turn; false whenever the gate is off,
      // the rung is met, or no wave-3 monster is in the fight.
      try {
        ctx._huntCommit = false;
        if (huntLive(Game)) {
          const f = Game.tbfight;
          if (f && !f.over) {
            const mons = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0);
            if (mons.some(m => beastWaveOf(Game, beastMidOf(m)) === 3)) {
              ctx._huntCommit = true;
              ctx.huntFights = (ctx.huntFights || 0) + 1;
            }
          }
        }
      } catch (e) { ctx._huntCommit = false; }
      return base.fight(Game, ctx);
    },
  });
}

const courtkillLead = withCourtKill(leadcourt, 'courtkill-lead',
  'leadcourt + COURTKILL wave-3 hunting (deliberate thicket expeditions, committed attrition fights); courtship verbs preserved');
const courtkillBelong = withCourtKill(belongseek, 'courtkill-belong',
  'belongseek + COURTKILL wave-3 hunting (deliberate thicket expeditions, committed attrition fights); courtship verbs preserved');

module.exports = {
  courtkillOn, huntLive, wave3Unlocked, wave3Points, beastWaveOf, beastMidOf,
  scholarHpPct, engageVisibleWave3, huntLeg,
  withCourtKill, courtkillLead, courtkillBelong,
};
