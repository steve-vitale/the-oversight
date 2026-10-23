#!/usr/bin/env node
'use strict';
// Proof for rogue P0-2 (shared text module) + P0-7 (verb-conjugation pipe).
// Roguelike Celebration 2026 audit, Talk 5 (Bucklew & Frang).
// Uses the shared sim harness: Math.random seeded BEFORE eval, full src/js
// list in index.html order minus DOM-only files. Writes nothing to the repo;
// console output + exit code only.
const path = require('path');
const assert = require('assert/strict');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const { loadGame } = require(path.join(root, 'scripts/sim-harness'));
const seed = Number(process.env.SEED || 20261022);

let checks = 0;
function check(name, value) { assert(value, name); checks++; console.log('PASS ' + name); }

// Capture authoring warnings (the pipe fails LOUD, never silent).
const warned = [];
const realWarn = console.warn;
console.warn = (...a) => { warned.push(a.join(' ')); };

(async () => {
  const { Game: G, loadFails } = await loadGame({ seed });
  check('complete shared module load', loadFails.length === 0);
  check('Text module global exists', typeof globalThis.Text === 'object');
  const T = globalThis.Text;

  // ---- P0-2: articles (the LIVE "an eSL teacher" bug) ----
  check('live bug fixed: anPhrase(ESL teacher)', T.anPhrase('ESL teacher') === 'an ESL teacher');
  check('article(ESL teacher) is an', T.article('ESL teacher') === 'an');
  check('a fisherman', T.anPhrase('fisherman') === 'a fisherman');
  check('an ER nurse', T.anPhrase('ER nurse') === 'an ER nurse');
  check('an appliance repair tech', T.anPhrase('appliance repair tech') === 'an appliance repair tech');
  for (const [w, a] of [['hour', 'an'], ['honest', 'an'], ['heir', 'an'], ['herb', 'an'],
    ['unicorn', 'a'], ['university lecturer', 'a'], ['one', 'a'], ['once', 'a'],
    ['european', 'a'], ['user', 'a'], ['FBI agent', 'an'], ['UFO', 'a'],
    ['apple', 'an'], ['house', 'a'], ['uninterested', 'an'], ['union', 'a']]) {
    check(`article(${w})=${a}`, T.article(w) === a);
  }
  check('lowerLead keeps ESL', T.lowerLead('ESL teacher') === 'ESL teacher');
  check('lowerLead keeps ER nurse', T.lowerLead('ER nurse') === 'ER nurse');
  check('lowerLead lowercases Fisherman', T.lowerLead('Fisherman') === 'fisherman');

  // End-to-end through the real fillTalkLine (wakeUpSpeeches path).
  const v = { name: 'Mara K', formerOccupation: 'ESL teacher', homeRegion: 'Ohio' };
  const rendered = G.fillTalkLine('I was {an_occ}, back in {origin}.', v);
  check('fillTalkLine renders "an ESL teacher"',
    rendered === 'I was an ESL teacher, back in Ohio.');
  // t2fill-owned slots survive fillTalkLine (deferred, filled downstream).
  check('fillTalkLine defers {hope} for t2fill',
    G.fillTalkLine('I {hope} I was {an_occ}.', v).includes('{hope}'));

  // ---- P0-2: pronouns ----
  const she = T.proBundle('she');
  check('proBundle she', she.Sub === 'She' && she.obj === 'her' && she.poss === 'her' &&
    she.Poss === 'Her' && she.refl === 'herself' && she.plural === false);
  const they = T.proBundle('they');
  check('proBundle they', they.Sub === 'They' && they.obj === 'them' && they.poss === 'their' &&
    they.refl === 'themselves' && they.plural === true);
  const unk = T.proBundle('xenon');
  check('unknown pronouns fall back to they/them', unk.sub === 'they' && unk.plural === true);

  // ---- P0-2: slot leaks never reach output ----
  warned.length = 0;
  const leaked = T.fill('I {hope} and {bogus} x', { hope: 'win' });
  check('unfilled {bogus} stripped', leaked === 'I win and x');
  check('leak warned LOUD', warned.some(w => w.includes('{bogus}')));
  check('deferred slots survive', T.fill('{hope}!', {}, { deferred: ['hope'] }) === '{hope}!');

  // ---- P0-7: verb pipe — the 3 LIVE breaks ----
  check('She beds down (was: She bed down)', T.conj3s('bed') === 'beds');
  check('she sleeps better (was: she sleep better)', T.conj3s('sleep') === 'sleeps');
  check('she listens (was: she listen)', T.conj3s('listen') === 'listens');

  // The real data templates through the shared slot step both
  // fillPronouns copies now call (characterGen.json:26 and :2796).
  const note = '{They} bed down at the edge of the light, back to the warmth, eyes on the dark. ' +
    "When asked {they} said {they} sleep better knowing what's behind {them}.";
  const noteShe = T.conjVerbSlots(note, 'she');
  check('face_away note conjugates for she',
    noteShe === 'She beds down at the edge of the light, back to the warmth, eyes on the dark. ' +
    "When asked she said she sleeps better knowing what's behind {them}.");
  check('face_away note keeps base forms for they',
    T.conjVerbSlots(note, 'they') ===
    'They bed down at the edge of the light, back to the warmth, eyes on the dark. ' +
    "When asked they said they sleep better knowing what's behind {them}.");
  const piano = 'A piano tells {them} everything if {they} listen long enough.';
  check('piano backstory conjugates',
    T.conjVerbSlots(piano, 'she') === 'A piano tells {them} everything if she listens long enough.');

  // Irregulars + morphology.
  for (const [base, s3] of [['have', 'has'], ['are', 'is'], ['were', 'was'], ['do', 'does'],
    ['go', 'goes'], ['be', 'is'], ['try', 'tries'], ['cry', 'cries'], ['watch', 'watches'],
    ['pass', 'passes'], ['wash', 'washes'], ['stay', 'stays'], ['say', 'says'],
    ['keep', 'keeps'], ['talk', 'talks'], ['know', 'knows'], ['build', 'builds']]) {
    check(`conj3s(${base})=${s3}`, T.conj3s(base) === s3);
  }
  // Pass-through classes from the verb-pool audit (never conjugate).
  for (const w of ['learned', 'said', 'went', 'checked', 'did', 'left', 'laughed',
    'shrugged', 'stopped', 'set', 'bent', 'drank', 'dismantled', 'asked',
    'believed', 'kept', 'built', 'grew', 'spent', 'gave', 'studied', 'got',
    'covered', 'noticed', 'can', 'could', 'couldn', 'will', 'never', 'always',
    'for', 'is', 'has']) {
    check(`passthrough ${w}`, T.conj3s(w) === w);
  }
  check('conj respects they', T.conj('keep', 'they') === 'keep' && T.conj('keep', 'she') === 'keeps');
  check('conj copula', T.conj('be', 'they') === 'are' && T.conj('be', 'she') === 'is');
  // ohandle pattern (convoTopics.js): "she handles" / "he handles" / "they handle".
  for (const [pro, want] of [['she', 'she handles'], ['he', 'he handles'], ['they', 'they handle']]) {
    check(`ohandle ${pro}`, T.proBundle(pro).sub + ' ' + T.conj('handle', pro) === want);
  }

  // Fail LOUD on malformed verbs: warn + pass through unchanged.
  warned.length = 0;
  for (const bad of ['', '{verb}', 'sleep better', null, 'Sleep', 42]) {
    const out = T.conj3s(bad);
    check(`malformed ${JSON.stringify(bad)} passes through`, out === bad);
  }
  check('malformed verbs warned LOUD', warned.length > 0);
  // Unaudited -ed word: passes through (correct for past tense) but warns.
  warned.length = 0;
  check('unaudited past passes through', T.conj3s('walked') === 'walked');
  check('unaudited past warned LOUD', warned.some(w => w.includes('walked')));

  console.warn = realWarn;
  console.log(`\ntext-module proof: ${checks} checks green (seed ${seed})`);
})().catch(e => { console.warn = realWarn; console.error('FAIL', e); process.exit(1); });
