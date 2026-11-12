#!/usr/bin/env node
'use strict';
// Proof: confront dry-replacement defect (journey-succession r187).
// RED (crisis r186, seed 14421 d124, Yara Haddad): the second confront in
// one sitting — after the first already confessed — dry-replaced with
// "...Sorry, lost my train of thought." right after a real confession on
// another thread. Same class as the warn-details defect (r183/r186),
// different surface (confront, not warning): a truth-pool outcome line
// whose text already sits in the no-repeat run ledger gets dry-replaced
// by sayLine, even though the line is the correct, meaningful answer to
// the accusation.
// Mechanism under test: the second press in a sitting takes the
// ONE-CONFESSION-PER-SITTING branch and draws a staleConfessed variant;
// when that variant's text is already in the 48-entry run ledger
// (spoken by another villager recently — the 4-line pool recycles),
// sayLine blocks it and speaks the dry line instead.
// GREEN (post-fix): the draw is ledger-aware — a blocked variant is
// skipped for a fresh one from the same pool, so the second press speaks
// honest content, never the dry line.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const speaker = roster.find(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  }) || roster[0];
  v.trust = v.trust || {};
  v.trust[speaker] = 50;
  const first = Game.displayName(speaker).split(' ')[0];
  console.log(`speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  // ---- Plant two lies (origin + occupation), motive shame -> confesses ----
  const vp = Game.vpOf(speaker);
  const lieO = Game.makeLie(vp, 'origin', 'shame');
  const lieC = Game.makeLie(vp, 'occupation', 'shame');
  lieO.confessed = false; lieC.confessed = false;
  vp.lies = { origin: lieO, occupation: lieC };
  console.log(`lies: origin told=${lieO.told} truth=${lieO.truth}; occupation told=${lieC.told} truth=${lieC.truth}`);

  // ---- Plant two slip doubts (one per lie) ----
  Game.truthSlip(speaker, lieO);
  Game.truthSlip(speaker, lieC);
  const doubts = Game.getDoubts(speaker);
  check('two open slip doubts planted', doubts.length === 2, 'got ' + doubts.length);
  const d1 = doubts[0], d2 = doubts[1];
  console.log(`doubts: ${d1.id} (${d1.field}), ${d2.id} (${d2.field})`);

  // ---- SAYTRACE: record every sayLine fallback with pre-call ledger state ----
  const sayTrace = [];
  const sayOrig = Game.sayLine.bind(Game);
  Game.sayLine = function (vid, line, opts) {
    let key = null, preSelf = false, preRun = false;
    try {
      const c = Game.convoGet(vid);
      const chunks = Game.convoSplitBeats(String(line == null ? '' : line));
      key = (chunks[0] || '').trim();
      preSelf = !!(c && (c.saidLinesConvo || []).indexOf(key) !== -1);
      const rl = (typeof Game.convoRunLedger === 'function') ? Game.convoRunLedger() : [];
      preRun = !!(rl && rl.indexOf(key) !== -1);
    } catch (e) {}
    const r = sayOrig(vid, line, opts);
    try {
      const c = Game.convoGet(vid);
      const fellBack = !!(c && c._sayFellBack);
      if (fellBack || (r == null && key)) {
        const sites = [];
        try {
          const st = (new Error().stack || '').split('\n').slice(1);
          for (const ln of st) {
            if (/test-journey-succession-r187|sim-harness/.test(ln)) continue;
            const m = ln.match(/([A-Za-z0-9_./-]+\.js:\d+:\d+)/);
            if (m) { sites.push(m[1]); if (sites.length >= 3) break; }
          }
        } catch (e) {}
        sayTrace.push({ key: (key || '').slice(0, 120), preSelf, preRun, fellBack, nullReturn: r == null, sites });
      }
    } catch (e) {}
    return r;
  };

  // ---- Open the sitting; answer the opening question first (a live
  // pendingQ suppresses the confront choice until it is answered) ----
  const opened = Game.startConvo(speaker);
  check('conversation opens', !!(opened && !opened.refused && !opened.ended), JSON.stringify(opened && opened.refused));
  const c = Game.convoGet(speaker);
  let choices = Game.convoChoices(speaker) || [];
  const ansPick = choices.find(ch => String(ch.id).indexOf('ans:') === 0);
  if (ansPick) {
    console.log('answering opening question: ' + ansPick.id);
    Game.convoTurn(speaker, ansPick.id);
    choices = Game.convoChoices(speaker) || [];
  }
  const pick1 = choices.find(ch => ch.id === 'confront:' + d1.id) ||
    choices.find(ch => String(ch.id).indexOf('confront:') === 0);
  check('first confront offered', !!pick1, 'choices: ' + choices.map(x => x.id).join(','));
  const rnd = Math.random;
  let prevLen = (c.transcript || []).length;
  try { Math.random = () => 0; Game.convoTurn(speaker, pick1.id); } finally { Math.random = rnd; }
  const turn1 = (c.transcript || []).slice(prevLen);
  console.log('TURN1 new entries:');
  for (const e of turn1) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  const turn1Text = turn1.map(e => String(e.text)).join(' ');
  check('first confront confesses the lie', /I'm not from|I wasn't/.test(turn1Text), turn1Text.slice(0, 200));
  check('first confront speaks no dry line', !/lost my train of thought/.test(turn1Text));
  check('first doubt resolved by confession', Game.getDoubts(speaker).every(d => d.id !== d1.id || d.resolved));

  // ---- Seed the run ledger with the staleConfessed variant the second
  // press WILL draw (variant 0 under the stubbed RNG): this is the wild
  // condition — another villager spoke it within the 48-entry window. ----
  const stalePool = Game.truthLinePools.staleConfessed;
  check('staleConfessed pool has variants', Array.isArray(stalePool) && stalePool.length >= 2, String(stalePool && stalePool.length));
  const variant0 = String(stalePool[0]).split('{first}').join(Game.firstRef(speaker));
  Game.convoRunLedger().push(variant0);
  console.log('SEEDED ledger with staleConfessed[0]: ' + variant0.slice(0, 120));

  // ---- Drive confront #2 in the same sitting ----
  choices = Game.convoChoices(speaker) || [];
  const pick2 = choices.find(ch => ch.id === 'confront:' + d2.id) ||
    choices.find(ch => String(ch.id).indexOf('confront:') === 0);
  check('second confront offered', !!pick2, 'choices: ' + choices.map(x => x.id).join(','));
  prevLen = (c.transcript || []).length;
  try { Math.random = () => 0; Game.convoTurn(speaker, pick2.id); } finally { Math.random = rnd; }
  const turn2 = (c.transcript || []).slice(prevLen);
  console.log('TURN2 new entries:');
  for (const e of turn2) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  const turn2Text = turn2.map(e => String(e.text)).join(' ');
  console.log('SAYTRACE fellBack entries: ' + JSON.stringify(sayTrace, null, 1).slice(0, 2000));
  check('second confront speaks no dry line', !/lost my train of thought/.test(turn2Text), turn2Text.slice(0, 300));
  check('second confront answers honestly (a stale-confessed variant, not the seeded one)',
    /already told you the truth|confessed that already|it's told|same truth as last time/i.test(turn2Text) &&
    !turn2Text.includes(variant0),
    turn2Text.slice(0, 300));
  check('no sayLine fell back on either confront turn', sayTrace.length === 0, JSON.stringify(sayTrace));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
