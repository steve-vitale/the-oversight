#!/usr/bin/env node
// probe-witnesource-walk-20261017.js — verify the witness path WALKS
// end-to-end when the door is earned: drive the real table engine through
// the 3 beats + final, verify the opening charges name the real kept-list
// records. READ-ONLY wrt game code (forces exposures via the real
// recordExposure).
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.TAKESEAT = '1';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '76202', 10);

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'witnesource-walk' });
  await setupGame(Game);

  // force 3 real exposures (the door's bar)
  const vids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (vids.length < 4) { console.log('SKIP: not enough villagers'); return; }
  const r1 = Game.recordExposure({ kind: 'lie', accuser: vids[0], accused: vids[1], charge: "lied about where they're from", amount: 1 });
  const r2 = Game.recordExposure({ kind: 'lie', accuser: vids[2], accused: vids[3], charge: 'lied about their trade', amount: 1 });
  const r3 = Game.recordExposure({ kind: 'bribe', accuser: Game.villagerId, accused: vids[1], charge: "bought a vote", amount: 2 });
  console.log('forced exposures:', Game.ledger().exposed, 'records:', Game.exposureRecord().length);
  const accuserName = (() => { try { return Game.getPerson(vids[0]).name.split(' ')[0]; } catch (e) { return '?'; } })();
  const accusedName = (() => { try { return Game.getPerson(vids[1]).name.split(' ')[0]; } catch (e) { return '?'; } })();

  // mock a lesser seat so the door is offered
  Game.tableSeat = () => ({ seat: 'lesser', detail: {} });
  const priced = Game.tableEarnedPaths();
  const wit = priced.find(p => p.id === 'witness');
  console.log('witness earned:', wit.earned, 'strength:', wit.strength, 'why:', wit.why);
  if (!wit.earned) { console.log('FAIL: door not earned with 4 exposures'); process.exit(1); }

  // drive the real table engine
  const says = [];
  const _say = Game.say;
  Game.say = function (m) { says.push(String(m)); return _say.apply(this, arguments); };

  Game.tableState().phase = 'paths';
  console.log('DEBUG: phase set');
  await quietLog(async () => {
    Game.tableStartPath('witness');
    // walk beats: answer each beat with its first presented option
    for (let step = 0; step < 12; step++) {
      const tc = Game.state.scholar.tableChoices;
      if (!tc) break;
      const opts = tc.options || [];
      const pick = opts[0];
      if (!pick) break;
      Game.chooseTableOption(pick.id);
      if (Game.won) break;
    }
  });
  Game.say = _say;

  const Tf = Game.tableState();
  console.log('won:', !!Game.won, 'path:', Tf.path, 'phase:', Tf.phase);
  // verify the opening charges named the real records
  const chargeHits = says.filter(s => s.includes(accuserName) && s.includes(accusedName));
  console.log('charge lines naming real records:', chargeHits.length);
  for (const h of chargeHits.slice(0, 3)) console.log('  ' + h.slice(0, 140));
  const beatLines = says.filter(s => /OPENING|DEFENSE|SETTLEMENT|CHANT/.test(s));
  console.log('beat headers seen:', beatLines.length);
  if (!Game.won) { console.log('FAIL: trial did not complete to a win'); process.exit(1); }
  if (!chargeHits.length) { console.log('FAIL: opening charges did not name the real records'); process.exit(1); }
  console.log('WALK OK: witness path plays end-to-end, charges read the real list.');
}

main().catch(e => { console.error('WALK FAIL', e); process.exit(1); });
