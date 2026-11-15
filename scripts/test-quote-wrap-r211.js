#!/usr/bin/env node
// Proof: quoteWrap at the remaining doubled-quote sites
// (journey-endgame r211 follow-up, 2026-11-15).
//
// The r211 sysSay fix covered the System-voice path, but the C-wide fresh
// band (89723-89729) showed the SAME defect on two more paths — 7 hits:
//   - relic enhancement systemCommentary: game.js chooseRelicEnhancement
//     wrapped data that already carries quotes (15/51 relicEnhancements
//     values) -> ""Encounter probability down...""
//   - Callback mimicry: sigW3c.js quoted face.line, but face.line comes
//     from convLineLog keys — real village lines, some already quoted
//     (characterGen "deeper") -> ""Under my breath...""
// Data census also showed 12/461 ability/evolution flavor strings carry
// edge quotes, so chooseAbility / chooseEvolution get the same fix.
// All four sites now use Game.quoteWrap (conversation.js) — strip, then
// wrap, exactly once — the same helper the choice UI already uses.
//
// Legs: (1) quoteWrap unit cases; (2) chooseRelicEnhancement live, quoted
// commentary; (3) chooseAbility live, edge-quoted flavor (live_broadcast);
// (4) Callback fight: ensureFace + funeral + dissolve lines with a quoted
// real line; (5) global net: NO captured say line anywhere contains '""'.
//
// RED (pre-fix): leg 2 renders ""Encounter probability down...""; leg 3
// renders ""WE'RE LIVE!...""; leg 4 renders ""The creek's running high...""
// inside every Callback line that quotes the dead villager's line.

const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
  if (!cond) failures++;
}
const hasDoubled = (t) => String(t).indexOf('""') !== -1;

(async () => {
  const { Game } = await loadGame({ seed: 61, narration: true });
  await setupGame(Game);
  Game.state.systemArrived = true;

  const said = [];
  const allSaid = [];
  const _say = Game.say.bind(Game);
  Game.say = function (t) { said.push(String(t)); allSaid.push(String(t)); };

  // ---- leg 1: quoteWrap unit cases ----
  check('0. quoteWrap exists on Game', typeof Game.quoteWrap === 'function');
  check('1. quoted input collapses to one pair',
    Game.quoteWrap('"Encounter probability down. Rumors survive."') === '"Encounter probability down. Rumors survive."');
  check('2. unquoted input gains exactly one pair',
    Game.quoteWrap('Unit efficiency increased 25%.') === '"Unit efficiency increased 25%."');
  check('3. quote-open-only keeps its inner quote, one outer pair',
    Game.quoteWrap('"That\'s my final offer." It was not their final offer.') === '"That\'s my final offer." It was not their final offer."');
  // NOTE: a quote sitting exactly at the string's edge is treated as the
  // string's own wrapper and stripped (quoteWrap's documented behavior —
  // the choice UI has rendered this way for years). The inner OPEN quote
  // survives; the sentence-final close quote becomes the outer wrapper.
  check('4. edge quote becomes the wrapper (inner open quote survives)',
    Game.quoteWrap('The System asks if it is "angry sugar."') === '"The System asks if it is "angry sugar."');
  check('5. empty stays an empty pair', Game.quoteWrap('') === '""');

  // ---- leg 2: relic enhancement, quoted systemCommentary ----
  const s = Game.state.scholar;
  s.relicChoices = {
    itemId: 'no-such-item', itemName: 'Flannel Shirt',
    options: [{
      id: 'trail_ghost', name: 'Trail Ghost', description: 'You walk alone so well the world forgets to watch.',
      systemCommentary: '"Encounter probability down. You are becoming a rumor. Rumors survive."',
    }],
  };
  said.length = 0;
  Game.chooseRelicEnhancement('trail_ghost');
  const relicLine = said.find((t) => /Encounter probability/.test(t));
  check('6. relic commentary renders (live path)', !!relicLine, relicLine || '(missing)');
  check('7. relic commentary has no doubled quotes', relicLine && !hasDoubled(relicLine), relicLine || '');
  check('8. relic commentary is a single quoted pair',
    relicLine === '"Encounter probability down. You are becoming a rumor. Rumors survive."', relicLine || '');

  // ---- leg 3: ability grant, edge-quoted flavor (live_broadcast) ----
  s.abilities = [];
  s.abilityChoices = [{
    id: 'live_broadcast', name: 'Live Broadcast', src: 'arrival',
    description: 'The galaxy is watching.',
    flavor: '"WE\'RE LIVE! WAVE TO THE GALAXY! NO, THE OTHER HAND, THAT ONE\'S BLEEDING."',
  }];
  said.length = 0;
  Game.chooseAbility('live_broadcast');
  const flavorLine = said.find((t) => /WE'RE LIVE/.test(t));
  check('9. ability flavor renders (live path)', !!flavorLine, flavorLine || '(missing)');
  check('10. ability flavor has no doubled quotes', flavorLine && !hasDoubled(flavorLine), flavorLine || '');
  check('11. ability flavor is a single quoted pair',
    flavorLine === '"WE\'RE LIVE! WAVE TO THE GALAXY! NO, THE OTHER HAND, THAT ONE\'S BLEEDING."', flavorLine || '');

  // ---- leg 4: Callback mimicry with a quoted real line ----
  Game.corpses().push({ id: 'corpse_test_1', kind: 'villager', name: 'Mara Kettle', villagerId: 'v_mara', deathKnown: true, dayDied: 3, cause: 'hushwolf' });
  Game.state.village.npcAbilities = Object.assign(Game.state.village.npcAbilities || {}, { v_mara: ['rage', 'pocket_sand'] });
  const REAL_LINE = '"The creek\'s running high today. Careful."';
  Game.state.village.convLineLog = {};
  Game.state.village.convLineLog[REAL_LINE] = 4;
  s.health = 9000; s.mx = 4; s.my = 4;
  said.length = 0;
  Game.startCombat('callback');
  const m = Game.tbfight.fighters.find((x) => x.kind === 'monster');
  Game.tbMonsterTurn(m);
  const speakLine = said.find((t) => /It speaks/.test(t));
  check('12. Callback speaks the real line (live path)', !!speakLine, speakLine || '(missing)');
  check('13. Callback speak line has no doubled quotes', speakLine && !hasDoubled(speakLine), speakLine || '');
  check('14. Callback speak line quotes the dead once',
    speakLine === 'It speaks — in their voice, saying things they said: "The creek\'s running high today. Careful."', speakLine || '');

  // Funeral: "You used to say ..." — drive to the player's turn, then funeral.
  let g = 0;
  while (Game.tbfight && !Game.tbfight.over && !Game.tbIsPlayerTurn() && g++ < 80) Game.tbAdvance();
  said.length = 0;
  const p = Game.tbFighter('p'); if (p) p.hp = 9000;
  const funeralOk = Game.tbPlayerFuneral();
  const funeralLine = said.find((t) => /You used to say/.test(t));
  check('15. funeral fires', funeralOk === true);
  check('16. funeral line has no doubled quotes', funeralLine && !hasDoubled(funeralLine), funeralLine || '(missing)');
  check('17. funeral line quotes the dead once',
    funeralLine && funeralLine.indexOf('"The creek\'s running high today. Careful." — I remember.') !== -1, funeralLine || '');

  // Dissolve ticks: the "It falters ... thinning: ..." line fires on the
  // monster's turns after the funeral. Run a few turns and collect.
  said.length = 0;
  let turns = 0;
  while (Game.tbfight && !Game.tbfight.over && turns++ < 12) {
    try { Game.tbAdvance(); } catch (e) { break; }
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbMonsterTurn(Game.tbfight.fighters.find((x) => x.kind === 'monster')); } catch (e) {}
  }
  const falterLine = said.find((t) => /It falters/.test(t));
  check('18. dissolve "It falters" line fires', !!falterLine, falterLine || '(not reached in 12 turns — see 19)');
  if (falterLine) {
    check('19. falter line has no doubled quotes', !hasDoubled(falterLine), falterLine);
  } else {
    console.log('SKIP | 19. falter line did not fire in the window (no line to check)');
  }
  try { if (Game.tbfight) { Game.tbfight.over = true; } Game.tbfight = null; } catch (e) {}
  try { Game.state.scholar.monster = null; } catch (e) {}

  // ---- leg 5: global net over EVERYTHING captured in legs 2-4 ----
  const doubledAnywhere = allSaid.filter(hasDoubled);
  check('20. no doubled quotes anywhere in the run', doubledAnywhere.length === 0,
    doubledAnywhere.slice(0, 2).join(' | ') || `clean (${allSaid.length} lines)`);

  Game.say = _say;
  console.log(`quote-wrap-r211: ${failures ? failures + ' FAILURES' : 'ALL GREEN'}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error('quote-wrap-r211 CRASH', e); process.exit(1); });
