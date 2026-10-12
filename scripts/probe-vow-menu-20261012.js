// probe-vow-menu-20261012.js — trace exactly when offer_help appears in the
// menu across a real goal-thread arc. Usage: node scripts/probe-vow-menu-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 60606 });
  Game.say = function () {};
  Game.sysSay = function () {};
  await setupGame(Game);
  const me = Game.villagerId;
  const vname = id => { try { return Game.displayName(id); } catch (e) { return String(id); } };

  let target = null;
  for (const vid of (Game.state.village.roster || [])) {
    if (vid === me) continue;
    try {
      const g = Game.npcGoal(vid);
      if (g && Game.promiseKeepKind && Game.promiseKeepKind(g)) { target = vid; break; }
    } catch (e) {}
  }
  Game.state.village.trust[target] = 50;
  console.log(`target ${vname(target)} goal ${Game.npcGoal(target)}`);

  Game.startConvo(target);
  const menu = () => { try { return (Game.convoChoices(target) || []).map(x => x.id); } catch (e) { return []; } };
  const state = () => { try { const c = Game.convoGet(target); return `thread=${c.thread} depth=${c.depth} openedUp=${!!c.goalOpenedUp} offeredHelp=${!!c.offeredHelp}`; } catch (e) { return '?'; } };
  const show = (label) => console.log(`[${label}] ${state()} menu=[${menu().join(',')}]`);

  // plan: answer Q, ask:goal, goon x2 (depth), then pivot out via dlg:subject, then look for offer_help
  const plan = ['answer', 'ask:goal', 'goon', 'goon', 'dlg:subject', 'watch', 'watch'];
  for (const step of plan) {
    const c = Game.convoGet(target);
    if (!c || !c.active) { console.log('conversation closed'); break; }
    const ids = menu();
    show('before ' + step);
    let pick = null;
    if (step === 'answer') pick = ids.find(id => /^ans:/.test(id)) || ids.find(id => !/^(leave|bye)/.test(id));
    else if (step === 'watch') pick = ids.find(id => id === 'offer_help') || 'leave';
    else pick = ids.find(id => id === step) || ids.find(id => !/^(leave|bye)/.test(id));
    if (!pick) { console.log('no pick'); break; }
    console.log(`  -> picking ${pick}`);
    Game.convoTurn(target, pick);
    if (step === 'watch' && pick === 'offer_help') {
      console.log('  *** VOW TAKEN ***');
      const cc = Game.convoGet(target);
      console.log('===== FULL TRANSCRIPT =====');
      for (const e of (cc.transcript || [])) console.log(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text || '').slice(0, 280)}`);
      break;
    }
  }
  // --- part 2: NEW conversation — the sticky goalOpenedUp should surface offer_help at the opening menu ---
  console.log('\n--- new conversation (sticky goalOpenedUp) ---');
  try { Game.endConvo(target, 'left'); } catch (e) {}
  Game.startConvo(target);
  const c2 = Game.convoGet(target);
  console.log(`sticky state: goalOpenedUp=${!!c2.goalOpenedUp} goalKnown=${Game.goalKnown(target)} thread=${c2.thread}`);
  const ids2 = menu();
  console.log(`opening menu=[${ids2.join(',')}]`);
  // answer any pending question first — the full menu comes after
  let ans = ids2.find(id => /^ans:/.test(id));
  if (ans) { console.log(`  -> answering ${ans}`); Game.convoTurn(target, ans); }
  const ids3 = menu();
  console.log(`post-answer menu=[${ids3.join(',')}]`);
  const offer = ids3.find(id => id === 'offer_help');
  if (offer) {
    console.log('  *** offer_help PRESENT — taking the vow ***');
    Game.convoTurn(target, 'offer_help');
    const cc = Game.convoGet(target);
    console.log('===== FULL VOW TRANSCRIPT (this sitting) =====');
    for (const e of (cc.transcript || [])) console.log(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text || '').slice(0, 280)}`);
  } else {
    console.log('  offer_help ABSENT from post-answer menu');
  }
  console.log('promise record:', JSON.stringify((Game.state.village.promises || {})[target]));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
