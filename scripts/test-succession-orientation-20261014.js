#!/usr/bin/env node
// test-succession-orientation-20261014.js — PROOF for journey-succession r12.
//
// The handoff told the player who they're NOT ("you're not Miriam") but never
// who they ARE: a silent identity swap with a silent kit change. The fix adds
// one orientation beat after the Codex page-turn line in playerDeath
// (ledger.js): "🪞 You wake up somebody else. <Name>, <age> — a <occupation>.
// <Poss> hands know different work now: <kit>."
//
// RED: no "wake up somebody else" line post-death (pristine).
// GREEN: the line names the successor, their occupation, and their new kit.
//
// Usage: node scripts/test-succession-orientation-20261014.js
// Exit 0 = all green, 1 = any red.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = [611, 612];
let failures = 0;
function check(id, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-succession-orientation', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  await runDays(Game, competent, { days: 16 });
  if (Game.over) { check(`seed${seed}-survived`, false, 'village died before death'); return; }
  const mark = says.length;
  Game.playerDeath('a hushwolf');
  const newId = Game.villagerId;
  const newChar = ((Game.data || {}).villagers || []).find(x => x.id === newId) || {};
  const post = says.slice(mark);
  const line = post.find(t => /wake up somebody else/.test(t));
  check(`seed${seed}-orientation-line`, !!line, line ? line.slice(0, 140) : 'no orientation line post-death');
  if (!line) return;
  const first = (newChar.name || '').split(' ')[0];
  check(`seed${seed}-names-successor`, line.includes(first), `names "${first}"`);
  const occWord = String(newChar.formerOccupation || '').split(' ')[0].toLowerCase();
  check(`seed${seed}-names-occupation`, !!occWord && line.toLowerCase().includes(occWord),
    `names occupation "${newChar.formerOccupation}"`);
  const kit = ((Game.state.scholar || {}).backgroundAbilities || []).map(a => a.name || a.id);
  if (kit.length) {
    check(`seed${seed}-names-kit`, kit.some(k => line.includes(k)), `names kit [${kit.join(', ')}]`);
  } else {
    check(`seed${seed}-kit-clause-absent`, !/hands know different work/.test(line), 'no kit, no clause');
  }
  // ordering: orientation comes right after the page-turn line
  const pageIdx = post.findIndex(t => /The mantle passes to/.test(t));
  const lineIdx = post.indexOf(line);
  check(`seed${seed}-ordering`, pageIdx >= 0 && lineIdx === pageIdx + 1,
    `page-turn@${pageIdx} orientation@${lineIdx}`);
  // pronouns: Esther/Ernestine are unambiguously feminine (NAME_GENDER)
  const pro = newChar.pro || 'they';
  check(`seed${seed}-pronouns`, ['he', 'she', 'they'].includes(pro) &&
    (/ernestine|esther/i.test(newChar.name || '') ? pro === 'she' : true),
    `pro=${pro} for ${newChar.name}`);
}

async function pronouns() {
  const { Game } = await loadGame({ seed: 7, mode: 'test-succession-orientation-pro', fullTelemetry: false });
  check('namegender-esther', Game.guessNameGender('Esther') === 'f', 'Esther -> f');
  check('namegender-ernestine', Game.guessNameGender('Ernestine') === 'f', 'Ernestine -> f');
  check('namegender-erich', Game.guessNameGender('Erich') === 'm', 'Erich -> m');
}

(async () => {
  for (const s of SEEDS) {
    try { await playSeed(s); }
    catch (e) { check(`seed${s}-threw`, false, String((e && e.message) || e)); }
  }
  try { await pronouns(); }
  catch (e) { check('pronouns-threw', false, String((e && e.message) || e)); }
  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
})();
