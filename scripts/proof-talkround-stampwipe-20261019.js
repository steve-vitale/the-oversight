'use strict';
// PROOF: a zero-exchange talkTo/endConvo (the competent policy's daily
// talkRound) rebuilds a stamped inherited favor, wiping inhFrom.
const { loadGame, setupGame, runDays } = require('/home/hatch/workspace/worktrees/journey2-succession/scripts/sim-harness');
const { competent } = require('/home/hatch/workspace/worktrees/journey2-succession/scripts/policies/competent');
async function main() {
  const { Game } = await loadGame({ seed: 8105, mode: 'proof', fullTelemetry: true });
  await setupGame(Game);
  // replicate ORCH seed: force a commit on d15 like the r26 script
  const E = console.error;
  for (let d = 1; d <= 15; d++) await runDays(Game, competent, { days: 1 });
  // find highest-trust NPC with a live favor need, drive a commit via real convo path
  const v = Game.state.village || {};
  const self = Game.villagerId;
  let target = null;
  for (const vid of (v.roster || [])) {
    if (vid === self) continue;
    try { if (Game.convoFindFavorNeed && Game.convoFindFavorNeed(vid)) { target = vid; break; } } catch (e) {}
  }
  if (!target) { console.log('NO TARGET'); return; }
  // commit via the real choice path
  Game.startConvo(target);
  for (let t = 0; t < 14; t++) {
    const choices = Game.convoChoices(target) || [];
    let pick = choices.find(c => c.id === 'dlg:commit') || choices.find(c => /^want:/.test(c.id)) || choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    Game.convoTurn(target, pick.id);
    const c = Game.convoGet(target);
    if (!c || !c.active) break;
  }
  try { Game.endConvo(target, 'left'); } catch (e) {}
  const p = ((Game.state.village || {}).promises || {})[target];
  console.log('promise open pre-death:', !!(p && !p.kept));
  await runDays(Game, competent, { days: 1 });
  const oldFirst = String((Game.state.village.rosterChars || {})[Game.villagerId]?.name || '?').split(' ')[0];
  Game.playerDeath('the expedition');
  const fl1 = (Game.state.village.favorLedger || {})[target];
  console.log('POST-DEATH favor:', fl1 && fl1.id, 'state=', fl1 && fl1.state, 'inhFrom=', fl1 && fl1.inhFrom);
  // THE ACT: zero-exchange talkTo/endConvo, exactly what talkRound does daily
  try { Game.talkTo(target); } catch (e) { console.log('talkTo threw', e.message); }
  try { Game.endConvo(target, 'left'); } catch (e) {}
  const fl2 = (Game.state.village.favorLedger || {})[target];
  console.log('POST-TALKROUND favor:', fl2 && fl2.id, 'state=', fl2 && fl2.state, 'inhFrom=', fl2 && fl2.inhFrom);
  const sameId = fl1 && fl2 && fl1.id === fl2.id;
  const stampKept = !!(fl2 && fl2.inhFrom);
  console.log('RESULT: sameInstance=' + sameId + ' stampKept=' + stampKept + ' -> ' + ((!sameId || !stampKept) ? 'BUG REPRODUCED: stamp wiped by zero-exchange check-in' : 'no bug: stamp survived'));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
