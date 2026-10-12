// policies/passive.js — the "do nothing" run (Steve 2026-10-12).
// Bare-minimum self-preservation ONLY: eat, drink, flee danger. The harness
// sleeps automatically. The policy NEVER initiates: no foraging expeditions,
// no hunting, no talk/teach, no proposals/courtship, no contest prep, no
// ability seeking, no scale actions, no table politicking. Villagers run with
// full agency. Contests grab the player (unavoidable by design) — minimum
// participation via the harness default. If dragged into table prompts,
// answer the current one once per day (neutral default = first option), no
// draining. Scripts-only; the game is untouched.
'use strict';
const { playerEat } = require('./idle');

// Self-preservation water: fill a bottle when standing on a water tile (no
// expeditions), boil, drink when hydration is low.
function passiveDrink(Game, ctx) {
  try {
    const s = Game.state.scholar;
    if ((s.hydration || 0) >= 60) return;
    try {
      const t = Game.playerTile ? Game.playerTile() : null;
      if (t && /creek|well|spring|river|pond/i.test(t.type || '') && (s.water || []).length < 3) {
        try { Game.fillWater(); } catch (e) {}
      }
    } catch (e) {}
    if (!(s.water || []).length) return;
    try { Game.boilWater(); } catch (e) {}
    try { Game.doAction('drink'); ctx.drank = (ctx.drank || 0) + 1; } catch (e) {}
  } catch (e) {}
}

// Always flee: walk to the nearest edge (flee-by-barrier), end turn. Never
// strikes. If the move fails, still end the turn so the harness can't stall.
function passiveFlee(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    const endTurn = () => {
      try {
        const q = Game.tbFighter('p');
        q.moveLeft = 0; q.acted = true;
        Game.tbAfterPlayerAction();
      } catch (e) {}
    };
    try {
      const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
      const tx = px <= 4 ? 0 : 8;
      Game.tbPlayerMove(tx, py);
      ctx.passiveFled = (ctx.passiveFled || 0) + 1;
    } catch (e) {}
    endTurn();
    return true;
  } catch (e) { return false; }
}

const passive = {
  id: 'passive',
  desc: 'do-nothing run: eat/drink/flee only; villagers run with full agency',
  upkeep(Game, ctx) {
    try { playerEat(Game, ctx); } catch (e) {}
    passiveDrink(Game, ctx);
  },
  daily(Game, ctx) {
    // Dragged into the table? Answer the current prompt once (neutral
    // default), no draining, no politicking.
    try {
      if (Game.over) return;
      const s = Game.state.scholar || {};
      const tc = s.tableChoices;
      if (tc && tc.options && tc.options.length && typeof Game.chooseTableOption === 'function') {
        Game.chooseTableOption(tc.options[0].id);
        ctx.tableAnswers = (ctx.tableAnswers | 0) + 1;
      }
    } catch (e) {}
  },
  fight(Game, ctx) { return passiveFlee(Game, ctx); },
  contest(Game, ctx) { return false; }, // harness default: participate, no prep
};

module.exports = { passive };
