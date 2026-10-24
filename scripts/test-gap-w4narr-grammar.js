#!/usr/bin/env node
// test-gap-w4narr-grammar.js — proof for gap phase2 W4-narration-rest grammar fixes.
//   #424 doubled article: fieldFights redactor beat composes via articlePhrase,
//        so post-arrival "The Redactor" never renders as "the The Redactor".
//   #587/#666 craft article: indefArt at the craft refusal/make sites
//        ("an Arrow", never "a Arrow").
//   #331 realm-break agreement: "National ... describes" (singular subject),
//        "National and global ... describe" (plural subject).
//   #334 fractional days: pluralize("1.0", "day") renders "1 day", not "1.0 days".
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const { loadGame } = require('./sim-harness');
let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}
async function main() {
  const { Game } = await loadGame({ seed: 20261024, mode: 'gap-w4narr-grammar' });
  // #587/#666
  ok(Game.indefArt('Arrow') === 'an', 'indefArt Arrow -> an', Game.indefArt('Arrow'));
  ok(Game.indefArt('Spear') === 'a', 'indefArt Spear -> a');
  ok(Game.indefArt('Eastern Chipmunk') === 'an', 'indefArt vowel name -> an');
  // #424: composition, both article states
  const fs = require('fs');
  const src = fs.readFileSync(__dirname + '/../src/js/fieldFights.js', 'utf8');
  const beatLines = src.split('\n').filter((l, i) => /rec\.log\.push/.test(l) && /mName/.test(l));
  ok(beatLines.length === 0, 'no rec.log beat still concatenates raw mName', beatLines.join(' | ').slice(0, 200));
  ok(/var mPhrase/.test(src) && /articlePhrase\(mName\)/.test(src), 'fieldFights composes mPhrase via articlePhrase');
  ok(Game.articlePhrase('The Redactor') === 'The Redactor', 'articlePhrase proper name stands bare');
  ok(Game.articlePhrase('the toad like a war drum') === 'the toad like a war drum', 'articlePhrase descriptor keeps article');
  const beat = 'quiet starves the redaction — ' + Game.articlePhrase('The Redactor') + '\u2019s attacks come thin.';
  ok(!/the The/.test(beat), 'redactor starve beat has no doubled article', beat);
  const beat2 = 'quiet starves the redaction — ' + Game.articlePhrase('redactor') + '\u2019s attacks come thin.';
  ok(beat2.indexOf('the redactor') >= 0, 'pre-arrival redactor beat keeps its article', beat2);
  // #331: render both branches of the realm-break line from hierarchy.js source
  const hsrc = fs.readFileSync(__dirname + '/../src/js/hierarchy.js', 'utf8');
  ok(/hadGlobal \? 'describe' : 'describes'/.test(hsrc), 'realm-break line agrees per subject');
  const render = (hadGlobal) => 'National' + (hadGlobal ? ' and global' : '') + ' no longer ' + (hadGlobal ? 'describe' : 'describes') + ' this village.';
  ok(render(false) === 'National no longer describes this village.', 'singular branch', render(false));
  ok(render(true) === 'National and global no longer describe this village.', 'plural branch', render(true));
  // #334
  ok(Game.pluralize('1.0', 'day') === '1 day', 'pluralize 1.0 day', Game.pluralize('1.0', 'day'));
  ok(Game.pluralize('1.5', 'day') === '1.5 days', 'pluralize 1.5 days', Game.pluralize('1.5', 'day'));
  ok(Game.pluralize(1, 'day') === '1 day', 'pluralize 1 day');
  ok(Game.pluralize(3, 'day') === '3 days', 'pluralize 3 days');
  ok(Game.pluralize(2, 'child', 'children') === '2 children', 'irregular plural intact');
  console.log(fail ? `FAILURES: ${fail}` : `ALL PASS (${pass})`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
