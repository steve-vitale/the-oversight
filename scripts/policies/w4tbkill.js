// w4tbkill — sim-w4tbkill-a phase-A policy-side engagement discipline.
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: W4TBKILL unset or not
// '1' -> daily and fight delegate to tableseat-nowait exactly
// (the det-gate in scripts/test-w4tbkill-sweep.js pins that: off
// daily/fight are tableseat-nowait, byte-identical days on the
// det-gate seed).
//
// RULE (pre-registered, evidence/2026-10-28/sim-w4tbkill-a-prereg.md):
// a wave-4 TB fight is FIGHTABLE only when ALL hold at fight start
// (first player turn of that fight id):
//   party >= 3 (player + >= 2 live villager/ally fighters),
//   AND monster fighter count == 1 (no overtime crew, no packmate),
//   AND total monster fighter HP <= 1500 (canon band top, single),
//   AND scholar HP >= 70% of max.
// Otherwise the fight is UNWINNABLE by the rule, and the policy
// NEVER strikes: every player turn it walks to the nearest x-edge
// and pushes through the barrier (tbBarrierExit), repeating across
// nodes until the fight ends 'fled' (chasers give up after their
// pursuit stamina) or the scholar dies. Sealed fights (arena
// contest or noFlee) do not flee — the barrier holds, so the policy
// fights it out through competent instead of hammering a sealed
// barrier. Non-wave-4 fights delegate to competent unchanged.
//
// WHY (code + lethality data, stated in the prereg): a strike-only
// party deals ~15/round solo, ~40-55/round with villagers, against
// canon's 220/round godhood bar; the census band's best TB result
// dealt 715 in 17 rounds and still lost, and even the two
// party>=3 single-HP fights on the band lost. Competent already
// flees unwinnable fights at turn 1, but its legacy flee walks to
// the nearest edge once and then fights it out when chasers follow
// across barriers — the 25/25 'lost' is that sequence. This policy
// persists the flee instead of striking an unwinnable fight.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

function layerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.W4TBKILL) || '0') === '1'; } catch (e) { return false; }
}

// Pure rule, unit-tested by scripts/test-w4tbkill-rule.js.
// Input: { wave4: bool, party: int, monsterCount: int, totalMhp: number, scholarPct: number }
// Output: { fightable: bool, reason: string } — fightable is false
// for non-wave-4 fights too, but the caller only applies the rule
// to wave-4 fights and delegates everything else.
function assessW4TbFight(input) {
  const inp = input || {};
  if (!inp.wave4) return { fightable: false, reason: 'not-wave4' };
  if ((inp.party || 0) < 3) return { fightable: false, reason: 'party<3' };
  if ((inp.monsterCount || 0) !== 1) return { fightable: false, reason: 'monsterCount!=1' };
  if ((inp.totalMhp || 0) > 1500) return { fightable: false, reason: 'totalMhp>1500' };
  if ((inp.scholarPct || 0) < 0.70) return { fightable: false, reason: 'scholar<70%' };
  return { fightable: true, reason: 'fightable' };
}

function monsterWave(Game, fighter) {
  try {
    if (fighter && fighter.mdef && fighter.mdef.wave != null) return fighter.mdef.wave | 0;
    const list = (Game.data && Game.data.monsters) || [];
    const def = list.find(d => d && (d.id === (fighter && (fighter.monsterId || (fighter.mdef && fighter.mdef.id)))));
    if (def && def.wave != null) return def.wave | 0;
  } catch (e) { /* unknown wave: caller treats as non-wave-4 */ }
  return null;
}

const w4tbkill = Object.assign({}, tableseatNowait, {
  id: 'w4tbkill',
  desc: 'tableseat-nowait + W4TBKILL-gated TB engagement discipline (fight only party>=3, single, <=1500 HP, scholar>=70%; else persistent barrier flee; default off = tableseat-nowait)',
  daily(Game, ctx) {
    if (!layerOn()) return tableseatNowait.daily(Game, ctx);
    return tableseatNowait.daily(Game, ctx);
  },
  fight(Game, ctx) {
    if (!layerOn()) return tableseatNowait.fight ? tableseatNowait.fight(Game, ctx) : false;
    try {
      const f = Game.tbfight;
      if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
      const fighters = f.fighters || [];
      const liveMonsters = fighters.filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
      if (!liveMonsters.length) return false;
      const isW4 = liveMonsters.some(m => monsterWave(Game, m) === 4);
      if (!isW4) return tableseatNowait.fight ? tableseatNowait.fight(Game, ctx) : false;
      const sealed = !!((Game.state || {}).arenaContest) || !!(f.noFlee);
      if (sealed) return tableseatNowait.fight ? tableseatNowait.fight(Game, ctx) : false;
      if (ctx._w4tbFightId !== f.id) {
        ctx._w4tbFightId = f.id;
        const party = fighters.filter(x => x && (x.kind === 'player' || x.kind === 'villager' || x.kind === 'ally') && (x.hp || 0) > 0 && !x.fled).length;
        const totalMhp = liveMonsters.reduce((t, m) => t + (m.maxHp || m.hp || 0), 0);
        const p = Game.tbFighter ? Game.tbFighter('p') : null;
        const scholarPct = (p && p.maxHp) ? (p.hp || 0) / p.maxHp : 1;
        const verdict = assessW4TbFight({ wave4: true, party: party, monsterCount: liveMonsters.length, totalMhp: totalMhp, scholarPct: scholarPct });
        ctx._w4tbFightable = verdict.fightable;
        ctx.w4tbAssessed = (ctx.w4tbAssessed || 0) + 1;
        if (verdict.fightable) ctx.w4tbFightable = (ctx.w4tbFightable || 0) + 1;
        ctx.w4tbLastVerdict = verdict.reason;
      }
      if (ctx._w4tbFightable) return tableseatNowait.fight ? tableseatNowait.fight(Game, ctx) : false;
      // UNWINNABLE: persistent barrier flee, never strike.
      const p = Game.tbFighter ? Game.tbFighter('p') : null;
      if (!p) return false;
      const px = (p.mx != null ? p.mx : 4), py = (p.my != null ? p.my : 4);
      try {
        if (px === 0) Game.tbBarrierExit(-1, 0);
        else if (px === 8) Game.tbBarrierExit(1, 0);
        else if (py === 0) Game.tbBarrierExit(0, -1);
        else if (py === 8) Game.tbBarrierExit(0, 1);
        else {
          const tx = px <= 4 ? 0 : 8;
          try { Game.tbPlayerMove(tx, py); } catch (e) { /* walk may fail; turn still ends below */ }
        }
      } catch (e) { /* push/walk failure still ends the turn below */ }
      ctx.w4tbFleeTurns = (ctx.w4tbFleeTurns || 0) + 1;
      try {
        const q = Game.tbFighter('p');
        if (q) { q.moveLeft = 0; q.acted = true; }
        Game.tbAfterPlayerAction();
      } catch (e) { /* best-effort end turn */ }
      return true;
    } catch (e) { return false; }
  },
});

module.exports = { w4tbkill, layerOn, assessW4TbFight };
