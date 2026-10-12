// probe-promise-arc-20261012.js — sense-test the full vow arc: drive a real
// conversation to a formal vow, dump the FULL transcript, then play days and
// show what the keep/break looks like. Usage: node scripts/probe-promise-arc-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 50505 });
  const sayLog = [];
  Game.say = function (m) { sayLog.push(String(m).slice(0, 400)); };
  Game.sysSay = function (m) { sayLog.push('[SYSTEM] ' + String(m).slice(0, 400)); };
  await setupGame(Game);
  const me = Game.villagerId;
  const vname = id => { try { return Game.displayName(id); } catch (e) { return String(id); } };

  // find a villager with a keepable goal
  let target = null, tgoal = null;
  for (const vid of (Game.state.village.roster || [])) {
    if (vid === me) continue;
    try {
      const g = Game.npcGoal(vid);
      if (g && Game.promiseKeepKind && Game.promiseKeepKind(g)) { target = vid; tgoal = g; break; }
    } catch (e) {}
  }
  console.log(`target: ${vname(target)} goal: ${tgoal}`);
  if (!target) { console.log('no keepable-goal villager'); process.exit(0); }

  // established-relationship stand-in: the vow is gated on trust>=35 or
  // relAge>=8 (intimacy gate). The sense question is the vow arc, not the gate.
  Game.state.village.trust[target] = 50;

  // natural-path conversation: answer questions, engage wants, ask, then vow
  Game.startConvo(target);
  const EXIT = /duty calls|good pause|should get back|should be going|i should|let me get back|time to go|see you|good talking/i;
  let vowTaken = false, turns = 0;
  for (let t = 0; t < 14 && !vowTaken; t++) {
    const c = Game.convoGet(target);
    if (!c || !c.active) break;
    const choices = Game.convoChoices(target) || [];
    if (!choices.length) break;
    const lastNPC = (c.transcript || []).filter(e => e.who !== 'you').slice(-1)[0];
    let pick = null;
    // take the vow when offered (only after some real engagement)
    const offer = choices.find(x => x && x.id === 'offer_help');
    if (offer && turns >= 3) { pick = offer; vowTaken = true; }
    if (!pick && lastNPC && EXIT.test(String(lastNPC.text || '')))
      pick = choices.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && x.id === 'ask:goal'); // drive the want thread: the vow is earned through their goal
    if (!pick) pick = choices.find(x => x && x.id === 'more'); // go deeper on the goal thread (depth 2+ opens the vow)
    if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) break;
    Game.convoTurn(target, pick.id);
    turns++;
    // instrument thread state
    try {
      const cc = Game.convoGet(target);
      const ids = (Game.convoChoices(target) || []).map(x => x && x.id).filter(Boolean).slice(0, 12);
      console.log(`   [after turn ${turns} pick=${pick.id}] thread=${cc.thread} depth=${cc.depth} goalOpenedUp=${!!cc.goalOpenedUp} goalKnown=${Game.goalKnown(target)} choices=[${ids.join(',')}]`);
    } catch (e) {}
  }
  const c = Game.convoGet(target);
  console.log(`\n===== FULL VOW CONVERSATION (${turns} turns, vowTaken=${vowTaken}) =====`);
  for (const e of (c.transcript || [])) console.log(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text || '').slice(0, 300)}`);

  // promise state + the surrounding say lines
  const pr = (Game.state.village.promises || {})[target];
  console.log('\npromise record:', JSON.stringify(pr));
  console.log('\nsay lines around the vow:');
  for (const l of sayLog.slice(-8)) console.log('> ' + l);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
