#!/usr/bin/env node
// test-feast-climax-copy-20261012.js — PROOF for journey-endgame r6.
//
// The r6 blank: the feast-surge chain's CLIMAX narration lies about the buff
// window and tells the story backwards.
//   (a) STALE WINDOW COPY: the buff window is durationNights dawns (2 since
//       the 2026-10-12 longsim winpath r3 change — "a dusk feast buys the
//       night plus the full next day", data lever in feast-surge.json).
//       grantFeastBuff's own line says "until tomorrow's dawn", but the two
//       lines that PROMISE the buff — channelSentiment's arm message and the
//       feast broadcast's surge bit (game.js + the app.js report panel) —
//       still say "until dawn". Telegraph honesty (feastBuff.js ontology).
//   (b) INVERTED NARRATION ORDER: hostFeast calls grantFeastBuff BEFORE it
//       says the FEAST broadcast line, so a player reads "FEASTED x2.03"
//       and "a scavenger is circling" BEFORE "the feast is held". The
//       contract comment says "the feast completes -> the buff" — the lines
//       run backwards.
//   (c) DEMO WART: teachSentiment's demo says 'Give me that — the ${name}',
//       which reads "the Grandma's Tin Cup" for possessive keepsake names.
//
// Fix: a shared Game.feastDawnWord() read from the same data lever every
// promise of the window uses; the FEAST broadcast moves above the grant;
// the demo drops the stray "the".
//
// T1 feastDawnWord() reads the lever ("tomorrow's dawn" at durationNights=2)
// T2 arm message promises the true window (no stale "until dawn")
// T3 feast broadcast precedes the grant line (causal order)
// T4 feast broadcast's surge bit promises the true window
// T5 demo line has no "the Grandma's" wart
// T6 app.js report panel uses the shared word (static check — app.js is DOM-only)
//
// Usage: node scripts/test-feast-climax-copy-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
};

async function freshGame(seed) {
  Math.random = mulberry32(seed);
  const { Game, loadFails } = await loadGame({ seed, mode: 'feast-climax-copy' });
  if (loadFails && loadFails.length) console.log('  loadFails: ' + loadFails.join('; '));
  await setupGame(Game);
  const lines = [];
  const _say = Game.say;
  Game.say = function (l) { try { lines.push(String(l)); } catch (e) {} try { return _say.apply(this, arguments); } catch (e2) {} };
  Game._capLines = lines;
  return Game;
}

// Drive the honest chain: teach -> keepsake -> devotion resonance -> channel (arms) -> feast.
async function honestArmedFeast(Game) {
  const s = Game.state.scholar || {};
  const pg = Game.progState ? Game.progState() : (s.prog = s.prog || {});
  pg.sentimentTaught = true;
  s.trauma = 0;
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'test_keepsake', name: "Grandma's Tin Cup", sentimental: true, units: 1 });
  pg.surgeResonance = 35; // devotion lane
  const idxs = Game.channelReadyKeepsakes ? Game.channelReadyKeepsakes() : [];
  check('setup: keepsake ready to channel', idxs.length > 0);
  const armMsg = Game.channelSentiment(idxs[0]);
  check('setup: surge armed by channel', !!(s.prog && s.prog.feastSurge), 'feastSurge=' + (s.prog && s.prog.feastSurge));
  const rep = Game.hostFeast();
  check('setup: feast held + buff granted', !!(rep && rep.ok && rep.buffGranted), JSON.stringify(rep && { ok: rep.ok, buffGranted: rep.buffGranted, why: rep.why }));
  return { armMsg, rep, lines: Game._capLines };
}

async function main() {
  console.log('PART 1 — the deed-chain climax copy');
  const Game = await freshGame(4242);

  // T1: shared dawn word reads the data lever
  const word = (typeof Game.feastDawnWord === 'function') ? Game.feastDawnWord() : null;
  check('T1 feastDawnWord() reads the lever', word === "tomorrow's dawn", 'got: ' + JSON.stringify(word));

  const { armMsg, rep, lines } = await honestArmedFeast(Game);

  // T2: the arm message promises the true window
  check('T2 arm message names the true window', typeof armMsg === 'string' && armMsg.indexOf("tomorrow's dawn") !== -1,
    'armMsg=' + JSON.stringify(String(armMsg).slice(0, 160)));
  check('T2 arm message has no stale "until dawn"', typeof armMsg === 'string' && armMsg.indexOf('until dawn:') === -1,
    'armMsg=' + JSON.stringify(String(armMsg).slice(0, 160)));

  // T3: causal order — the feast broadcast comes before the grant line
  const feastIdx = lines.findIndex(l => /opens the pantry wide/.test(l));
  const grantIdx = lines.findIndex(l => /FEASTED ×/.test(l));
  check('T3 feast broadcast precedes grant line', feastIdx !== -1 && grantIdx !== -1 && feastIdx < grantIdx,
    `feastIdx=${feastIdx} grantIdx=${grantIdx}`);

  // T4: the broadcast's surge bit promises the true window
  const feastLine = feastIdx !== -1 ? lines[feastIdx] : '';
  check('T4 broadcast surge bit names the true window', /tomorrow's dawn/.test(feastLine),
    'feastLine=' + JSON.stringify(feastLine.slice(0, 200)));
  check('T4 broadcast has no stale "until dawn"', !/until dawn,/.test(feastLine) && !/until dawn\)/.test(feastLine),
    'feastLine=' + JSON.stringify(feastLine.slice(0, 200)));

  // T5: the demo line
  const Game2 = await freshGame(4243);
  {
    const s = Game2.state.scholar || {};
    const pg = Game2.progState ? Game2.progState() : (s.prog = s.prog || {});
    // isolate: the demo grabs ready[0], so the possessive-named keepsake
    // must be the ONLY keepsake or the wart is never exercised.
    s.inventory = [{ itemId: 'test_keepsake2', name: "Grandma's Tin Cup", sentimental: true, units: 1 }];
    Game2.teachSentiment();
    const demoLine = (Game2._capLines || []).find(l => /DEMONSTRATION/.test(l)) || '';
    check('T5 demo line fired', !!demoLine, 'no DEMONSTRATION line captured');
    check('T5 demo has no "the Grandma\'s" wart', demoLine && !/the Grandma's/.test(demoLine),
      'demoLine=' + JSON.stringify(demoLine.slice(0, 120)));
  }

  // T6: app.js panel copy (static — app.js is DOM-only, not loadable in node)
  {
    const appSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'app.js'), 'utf8');
    check('T6 app.js panel uses the shared dawn word', /feastDawnWord\(\)/.test(appSrc), 'no feastDawnWord() call in app.js');
    check('T6 app.js has no stale "until dawn" surge line', !/rides the fire until dawn/.test(appSrc), 'stale copy still in app.js');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST ERROR:', e); process.exit(2); });
