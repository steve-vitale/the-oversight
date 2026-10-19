#!/usr/bin/env node
'use strict';
// Prepared spoken memory -> real death/inheritance -> actual resume opener.
// Each same-bearer/inherited arm loads one shared-harness world per child.
const assert = require('assert');
const { execFileSync } = require('child_process');
const K = require('./godpath/lib');
let pass = 0;
function check(name, condition) { assert(condition, name); pass++; console.log('  ok ' + name); }
const doubled = text => /never finished talking about[^\"]{0,200}?never finished/i.test(text);
async function scenario(inherited) {
  const Game = await K.load({ seed: Number(process.env.SEED || (inherited ? 4242 : 777)) });
  K.newRun(Game);
  const v = Game.state.village, oldId = Game.villagerId;
  const oldFirst = Game.displayName(oldId).split(' ')[0];
  const [heir, speaker] = Game.npcIds();
  v.trust[heir] = 90; v.trust[speaker] = 50;
  check('prepared speaker shares a language', Game.commLevel(speaker).level === 'full');
  Game.convoThreadOpen(speaker, 'ghost', 'an unsaid conversation', 'unfinished business');
  check('unquoted ghost thread is rejected', Game.convoOpenThreads(speaker).length === 0);
  const quote = '"The creek is clear past the old trees. I can show you the crossing tomorrow."';
  const spoken = Game.sayLine(speaker, quote);
  check('prepared substantive beat reaches actual speech ledger', !!spoken && Game.convoGet(speaker).transcript.some(row => row.who === 'them' && row.text.includes('The creek is clear')));
  Game.convoThreadOpen(speaker, 'waterthread', 'the water thing', 'unfinished business', spoken);
  const thread = Game.convoOpenThreads(speaker)[0];
  check('one substantive unfinished thread is stored', Game.convoOpenThreads(speaker).length === 1 && thread.tid === 'waterthread' && thread.snippet.includes('The creek is clear'));
  if (inherited) {
    Game.playerDeath('the hunt');
    check('actual succession changes the bearer', Game.villagerId === heir && Game.villagerId !== oldId);
    check('same-day thread stamped with actual predecessor', Game.inheritedName(thread) === oldFirst);
  } else check('same-bearer thread has no inherited name', Game.inheritedName(thread) === null);
  const random = Math.random, original = Game.convoResumeOpener;
  let resume = null, firstLine;
  Game.convoResumeOpener = function () { const result = original.apply(this, arguments); resume = result; return result; };
  Math.random = () => 0; // pass the resume gate and choose the sole thread
  try {
    Game.startConvo(speaker);
    firstLine = (Game.convoGet(speaker).transcript[0] || {}).text || '';
    Game.endConvo(speaker, 'left');
  } finally { Math.random = random; Game.convoResumeOpener = original; }
  check('startConvo actually selects the unfinished resume', !!resume && resume.thread === 'waterthread');
  check('resume uses the substantive stored quote', resume.line.includes('The creek is clear'));
  check('resume explains unfinished business without doubling', resume.line.includes('we left it mid-thought') && !doubled(resume.line));
  if (inherited) check('spoken opener names the actual predecessor', firstLine.includes(oldFirst) && resume.line.includes(oldFirst));
  else check('same-bearer opener owns its own conversation', /We never finished/.test(resume.line) && !/wearing .* shoes now/.test(resume.line));
  console.log(JSON.stringify({ inherited, firstLine, fullResume: resume.line, storedQuote: thread.snippet }));
}
async function main() {
  const arm = process.env.OPENER_CHILD;
  if (arm) { assert(['inherited', 'same'].includes(arm)); await scenario(arm === 'inherited'); }
  else for (const kind of ['inherited', 'same']) {
    process.stdout.write(execFileSync(process.execPath, [__filename], { env: { ...process.env, OPENER_CHILD: kind }, encoding: 'utf8' }));
  }
  console.log('opener proof green' + (arm ? ': ' + pass + ' checks' : ': two isolated arms'));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
