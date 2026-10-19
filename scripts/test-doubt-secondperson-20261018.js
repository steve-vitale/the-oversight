#!/usr/bin/env node
// test-doubt-secondperson-20261018.js -- PROOF TEST (journey-social r26).
// Doubts are voiced TO their subject (confront menu only offers
// getDoubts(vid)), but observation texts are written in journal voice —
// third person ("Elijah has been suddenly warm toward you"). Voiced aloud
// that reads "I've been watching, Elijah. Elijah has been suddenly warm
// toward you" — the engine talking ABOUT the person TO the person.
// (transcript-caught 2026-10-18, s1902-late-d106-Elijah.)
// The fix: confrontSecondPerson reframes the subject's own name forms as
// second person when the doubt is voiced to its subject.
// GREEN = every corpus template below voices without third-person
// self-reference, and the journal text itself is untouched.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'doubt-secondperson-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  const first = safe(() => Game.firstRef(vid), 'Elijah');
  const tag = safe(() => Game.whoTag(vid), first);
  console.log(`subject: ${safe(() => Game.displayName(vid), vid)} (first="${first}", tag="${tag}")`);

  // Corpus: the actual doubt texts that name their subject (truth.js,
  // betrayal.js call sites), with the subject's real name forms baked in —
  // exactly as addDoubt stores them.
  const corpus = [
    { name: 'bribe-trace',
      text: `${tag} has been suddenly warm toward you \u2014 and there's a new something in their pack.`,
      bad: [new RegExp(`^"${"I"}|${first} has been`), new RegExp(`${first} has been suddenly warm toward you[^]`)],
      must: ["You've been suddenly warm toward me", 'in your pack'] },
    { name: 'wavered',
      text: `${tag} wavered when you talked instead of running. They don't want this.`,
      must: ['You wavered when I talked instead of running', "You don't want this"] },
    { name: 'their-story',
      text: `Their story doesn't explain your wounds.`,
      must: ["Your story doesn't explain my wounds"] },
    { name: 'confessed',
      text: `${tag} confessed and named the others.`,
      must: ["You've confessed and named the others"] },
    { name: 'accusation',
      text: `${tag}'s accusation doesn't match what others saw.`,
      must: ['Your accusation doesn\u2019t match', 'Your accusation doesn\'t match'] },
    { name: 'contradiction-told',
      text: `${first} told you they were a paramedic \u2014 now it's a nurse. Something doesn't add up.`,
      must: ['You told me you were a paramedic'] },
  ];

  let fails = 0;
  for (const t of corpus) {
    const doubt = { id: 'd_probe', vid, kind: 'observation', text: t.text, evidence: [], day: 1, resolved: false };
    let beats = null;
    try { beats = Game.confrontWindup(vid, doubt, null); } catch (e) { console.log(`FAIL ${t.name}: confrontWindup threw: ${e.message}`); fails++; continue; }
    const spoken = beats && beats[0] && beats[0].text;
    if (!spoken || beats[0].who !== 'you') { console.log(`FAIL ${t.name}: no you-beat`); fails++; continue; }
    // The subject's name must not appear in third person AFTER the address.
    // (The "I've been watching, {first}." address itself is fine.)
    const afterAddr = String(spoken).replace(/^"I've been watching, [^.]+\./, '');
    const ci = (x) => new RegExp(`\\b${x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const selfRef = ci(first).test(afterAddr) || (tag !== first && ci(tag).test(afterAddr));
    const mustOk = (t.must || []).some(m => String(spoken).includes(m));
    const status = (!selfRef && mustOk) ? 'ok' : 'FAIL';
    if (status === 'FAIL') fails++;
    console.log(`${status} [${t.name}]: ${String(spoken).slice(0, 130)}`);
    if (status === 'FAIL') {
      if (selfRef) console.log(`    third-person self-reference remains after the address`);
      if (!mustOk) console.log(`    expected one of: ${JSON.stringify(t.must)}`);
    }
  }
  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
