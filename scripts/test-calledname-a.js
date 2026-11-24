// test-calledname-a.js — proof test, arm sim-calledname-a.
// Proves the calledName drift-line fix (sim-findings lines 2742/2743;
// coordinator decision, Steve can overrule): when a companion has a
// bestowed use-name (Ash), the departure beat says "Ash" but the
// teach's drift line used to speak the TRUE first name ("Ashley"),
// because revealName (game.js:17806) read v.name, not npcName. The
// overheard-chat path at game.js:19504 has the same shape — it
// already speaks the use-name itself, only the drift line it triggers
// leaked the true name. DECISION: the drift line speaks the USE-name.
// The fix is one token in revealName (npcName when one exists, else
// the true name) plus the same token in the journal.js revealName
// wrap, whose name entry would otherwise keep recording "Ashley"
// while the drift line says "Ash".
//
// This test loads the REAL game via scripts/sim-harness.js
// (loadGame + setupGame) — no mirrors of revealName: the drift
// lines asserted here are the ones real game.js speaks, through the
// real journal.js wrap, and the departure beat is the real
// winPlanDepartLaunchBeat. (The departteach proof test's §B9 fixture
// mirrors revealName locally and pins the OLD drift line; it does
// not load real game.js, so it is unaffected by this fix.)
//
//   §A code pins (read-only greps).
//   §B staged fixtures on the real Game — pre-System, day 6, holder
//       known / companions unknown (the departteach repro shape):
//       direct overheard, departure beat, no-use-name control,
//       intro + gesture channels, idempotent + post-System no-op,
//       nameless record, no over-reveal.
// Usage: node scripts/test-calledname-a.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

const DRIFT_RE = /A name drifts over from the fire: /;
const BEAT_RE = /sets out .* — the fire marks the trail\./;

// ---- §A CODE PINS (read-only greps) ----
(function sectionA() {
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const journalSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'journal.js'), 'utf8');
  // revealName body: from its definition to the next method.
  const ri = gameSrc.indexOf('revealName(vid, how) {');
  const rBody = ri !== -1 ? gameSrc.slice(ri, ri + 1400) : '';
  check('§A revealName speaks the use-name (npcName), not v.name',
    rBody.indexOf('this.npcName(vid)') !== -1 && rBody.indexOf('String(v.name)') === -1,
    rBody.slice(0, 200));
  // journal.js wrap of revealName records what was actually heard.
  const ji = journalSrc.indexOf('const origReveal = Game.revealName;');
  const jBody = ji !== -1 ? journalSrc.slice(ji, ji + 800) : '';
  check('§A journal revealName wrap records the use-name (npcName)',
    jBody.indexOf('this.npcName(vid)') !== -1,
    jBody.slice(0, 200));
  // The overheard-chat caller (game.js ~19504) already speaks the
  // use-name and funnels the teach through revealName 'overheard' —
  // verified, not edited: the fix in revealName covers it.
  check('§A overheard-chat caller speaks npcName and calls revealName overheard',
    gameSrc.indexOf('const otherSaid = otherId ? this.npcName(otherId) : ') !== -1 &&
    gameSrc.indexOf("this.revealName(otherId, 'overheard')") !== -1,
    null);
})();

// ---- §B STAGED FIXTURES ON THE REAL GAME ----
(async function sectionB() {
  const { Game } = await loadGame({ seed: 99104, mode: 'calledname-a-proof', fullTelemetry: false });
  await setupGame(Game);

  // Capture every say line (Game.say -> emit -> Game.log; wrapping
  // say keeps the log behavior intact and gives us the exact text).
  const says = [];
  const _say = Game.say.bind(Game);
  Game.say = function (m) { says.push(String(m)); return _say(m); };

  const village = Game.state.village;
  const roster = (village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  check('§B fixture: roster has enough non-scholar villagers', roster.length >= 8, 'roster=' + roster.length);
  if (roster.length < 8) { finish(); return; }
  const holder = roster[0];
  const ash = roster[1], ashBeat = roster[2], mara = roster[3],
    ashIntro = roster[4], ashGesture = roster[5], known = roster[6], noname = roster[7];
  function person(id) { return Game.getPerson(id); }
  // Stage the Ash/Ashley shape on real person records: true name
  // "Ashley …", bestowed use-name "Ash …". Mara keeps her true name
  // and NO use-name (the control). The nameless record has neither.
  person(ash).name = 'Ashley Kim'; person(ash).calledName = 'Ash River';
  person(ash).pro = 'she'; person(ash).age = 31;
  person(ashBeat).name = 'Ashley Kim'; person(ashBeat).calledName = 'Ash River';
  person(ashBeat).pro = 'she'; person(ashBeat).age = 31;
  person(mara).name = 'Mara Voss'; delete person(mara).calledName;
  person(mara).pro = 'she'; person(mara).age = 42;
  person(ashIntro).name = 'Ashley Park'; person(ashIntro).calledName = 'Ash Lane';
  person(ashIntro).pro = 'she'; person(ashIntro).age = 28;
  person(ashGesture).name = 'Ashley Cole'; person(ashGesture).calledName = 'Ash Field';
  person(ashGesture).pro = 'they'; person(ashGesture).age = 45;
  delete person(noname).name; delete person(noname).calledName;
  person(noname).pro = 'he'; person(noname).age = 52;
  person(known).name = 'Nadia Rao'; delete person(known).calledName;
  person(known).pro = 'she'; person(known).age = 36;

  // Pre-System, day 6 (the teachable window): holder known, nobody
  // else known, no goals known.
  Game.state.systemArrived = false;
  Game.state.scholar.day = 6;
  village.knownNames = {}; village.knownNames[holder] = true;
  village.goalsKnown = {};
  // npcName is the village's voice — sanity: the beat's name source
  // already says Ash for a use-named companion.
  check('§B fixture: npcName prefers the use-name (Ash) / true name (Mara)',
    Game.npcName(ash) === 'Ash' && Game.npcName(mara) === 'Mara' &&
    Game.npcName(noname) === 'Someone',
    { ash: Game.npcName(ash), mara: Game.npcName(mara), noname: Game.npcName(noname) });
  function driftLines() { return says.filter(function (l) { return DRIFT_RE.test(l); }); }
  function beatLines() { return says.filter(function (l) { return BEAT_RE.test(l); }); }
  function journalName(id) {
    try { const e = Game.journalPerson(id); return e && e.name ? e.name : null; } catch (e2) { return null; }
  }

  // B1: the direct overheard channel — the exact function the
  // 19504 chat caller invokes. The drift line must speak the
  // use-name, and the journal must record what was heard.
  const d0 = driftLines().length;
  const r1 = Game.revealName(ash, 'overheard');
  const dr1 = driftLines().slice(d0);
  check('§B B1 direct overheard on Ash: drift line speaks the use-name, never the true name',
    r1 === true && dr1.length === 1 &&
    dr1[0] === 'A name drifts over from the fire: Ash. That\'s the woman, maybe 30s — now they have a name.' &&
    dr1[0].indexOf('Ashley') === -1,
    dr1);
  check('§B B1 displayName is consistent after the teach (Ash everywhere)',
    Game.nameKnown(ash) === true && Game.displayName(ash) === 'Ash',
    { known: Game.nameKnown(ash), display: Game.displayName(ash) });
  const jn1 = journalName(ash);
  check('§B B1 journal name entry records the use-name (Ash, overheard by the fire)',
    jn1 && jn1.value === 'Ash' && jn1.how === 'overheard by the fire',
    jn1);

  // B2: the real departure beat with a use-named companion — one
  // consistent name from the beat line through the drift line.
  village.winPlan = village.winPlan || {};
  village.winPlan[holder] = { stage: 'party', target: 'herald', needWave: 4,
    node: null, party: [], sinceDay: 6, holdSinceDay: -1 };
  const b0 = beatLines().length, dd0 = driftLines().length;
  const beatOk = Game.winPlanDepartLaunchBeat(holder, [ashBeat]);
  const bl2 = beatLines().slice(b0), dr2 = driftLines().slice(dd0);
  check('§B B2 departure beat with Ash: beat line says Ash, drift line says Ash',
    beatOk === true && bl2.length === 1 && BEAT_RE.test(bl2[0]) &&
    bl2[0].indexOf(' with Ash ') !== -1 && bl2[0].indexOf('Ashley') === -1 &&
    dr2.length === 1 && dr2[0].indexOf(': Ash.') !== -1 && dr2[0].indexOf('Ashley') === -1,
    { beat: bl2, drift: dr2 });
  check('§B B2 displayName consistent after the beat teach (Ash)',
    Game.nameKnown(ashBeat) === true && Game.displayName(ashBeat) === 'Ash',
    { known: Game.nameKnown(ashBeat), display: Game.displayName(ashBeat) });

  // B3: the no-use-name control — the true name is spoken, exactly
  // as before the fix. This is the pin that the fix changes NOTHING
  // for companions without a bestowed name.
  const d3 = driftLines().length;
  const r3 = Game.revealName(mara, 'overheard');
  const dr3 = driftLines().slice(d3);
  check('§B B3 no-use-name companion: drift line speaks the true name, as before',
    r3 === true && dr3.length === 1 &&
    dr3[0] === 'A name drifts over from the fire: Mara. That\'s the woman, maybe 40s — now they have a name.',
    dr3);
  check('§B B3 displayName for Mara is the true name',
    Game.displayName(mara) === 'Mara', Game.displayName(mara));

  // B4: the other revealName channels speak the use-name too — the
  // fix is in revealName, so intro and gesture follow it.
  const s4 = says.length;
  Game.revealName(ashIntro, 'intro');
  Game.revealName(ashGesture, 'gesture');
  const new4 = says.slice(s4);
  check('§B B4 intro channel speaks the use-name (Ash, never Ashley)',
    new4.some(function (l) { return l.indexOf('"Ash," they say') !== -1; }) &&
    !new4.some(function (l) { return l.indexOf('Ashley') !== -1; }),
    new4);
  check('§B B4 gesture channel speaks the use-name (Ash, never Ashley)',
    new4.some(function (l) { return l.indexOf('It sounds like a name: Ash.') !== -1; }),
    new4);

  // B5: already-known is idempotent; post-System is a no-op — both
  // exactly as before the fix.
  const d5 = driftLines().length;
  const r5a = Game.revealName(known, 'overheard');
  const r5b = Game.revealName(known, 'overheard');
  check('§B B5 already-known: first teach speaks once, second is a no-op',
    r5a === true && r5b === false && driftLines().length === d5 + 1,
    { r5a: r5a, r5b: r5b, drift: driftLines().length - d5 });
  Game.state.systemArrived = true;
  const d5b = driftLines().length;
  const r5c = Game.revealName(roster[8] || noname, 'overheard');
  check('§B B5 post-System: revealName is a no-op, nothing spoken',
    r5c === false && driftLines().length === d5b, { r5c: r5c });
  Game.state.systemArrived = false;

  // B6: a nameless record never throws and never renders "undefined".
  const d6 = driftLines().length;
  let r6 = null, threw = false;
  try { r6 = Game.revealName(noname, 'overheard'); } catch (e) { threw = true; }
  const dr6 = driftLines().slice(d6);
  check('§B B6 nameless record: speaks "Someone", no throw',
    threw === false && r6 === true && dr6.length === 1 &&
    dr6[0].indexOf(': Someone.') !== -1 && dr6[0].indexOf('undefined') === -1,
    dr6);

  // B7: no over-reveal — the teach writes the NAME only. Mechanics
  // stays gated on goalsKnown/systemArrived, and the journal holds
  // a name-only entry (no goal, no occupation smuggled in).
  let mech = null;
  try { mech = Game.canShow('npc', ash, 'mechanics'); } catch (e) { mech = 'error:' + e.message; }
  const jn7 = journalName(ash);
  check('§B B7 no over-reveal: mechanics still gated after the teach',
    mech === false, { mechanics: mech });
  check('§B B7 journal entry is name-only (no goal / occupation learned)',
    jn7 && jn7.value === 'Ash' && !(jn7.goal || jn7.occupation) &&
    (function () { try { const e = Game.journalPerson(ash); return !e.goal && !e.occupation; } catch (e2) { return false; } })(),
    jn7);

  finish();
})().catch(function (e) { console.log('FAIL §B harness error :: ' + (e && e.stack || e)); failed++; finish(); });

function finish() {
  console.log('---');
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}
