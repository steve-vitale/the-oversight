#!/usr/bin/env node
// PROOF: the courtship climb is visible, and the shut door re-opens.
// journey-scale r2 (2026-10-11). RED->GREEN against src/js/hierarchy.js.
//
// The prior scale run found: 48/48 cold proposals declined in 3 seeds, 0
// counters, decline -5 opinion spirals, and the player is never told the
// climb exists. Root causes found in code:
//   A. The decline lines never name the climb verbs (join +5, study +3 —
//      real, once-per-village numbers from the joinVillageReal /
//      studyVillageCodex wrappers).
//   B. Negative opinion never eases — "the door isn't shut forever" is a
//      lie in the engine; opinion <= -20 shuts the door permanently.
//   C. Knocking on a shut door nudges opinion -5 AGAIN (spiral below -20).
//
// Fix (hierarchy.js): decline lines name the climb with real numbers;
// old slights ease +1/week toward 0 for unlinked villages (linkTick);
// a shut door no longer deepens when knocked on (silence, not fresh
// insult). The counter band itself is untouched (sanity check D).
//
// Usage: node scripts/test-courtship-climb-20261011.js   (exit 1 on any FAIL)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Seed Math.random BEFORE eval — modules capture it at load.
let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function resetRng(seed) { _s = seed >>> 0; }
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global; // stub for eval phase only
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

let passes = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { passes++; console.log('PASS: ' + name); }
  else { fails++; console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

async function main() {
  resetRng(20261011);
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const said = [];
  const _say = Game.say;
  Game.say = function (...a) { said.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };

  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
  if (!ovs.length) { console.log('BLOCKED: no other villages generated'); process.exit(2); }
  const t = ovs[0];
  t.generated = true; // known
  const nm = t.name || t.id;
  const t2 = ovs[1] || null;
  if (t2) t2.generated = true;

  // Deterministic bands: override the scorers (the scoring distribution
  // itself is sampled separately in the probe; this test pins the lines).
  const realPeer = Game._judgePeer, realLink = Game.judgeLink;
  const lowScore = function () { return { score: 20, reasons: ['test: cold courtship'], rep: null }; };
  Game._judgePeer = lowScore;
  Game.judgeLink = lowScore;

  // ---- A: score-miss decline names the climb, with real numbers ----
  // (and does NOT present "join them" as a climb verb — joinVillageReal is
  // defection, which ends proposing standing: break-it regional r4)
  Game.state.pendingCounter = null;
  t.opinion = 0;
  said.length = 0;
  const rA = Game.proposeCovenant(t.id);
  const lineA = said.filter(s => s.indexOf('declines the covenant') >= 0).pop() || '';
  check('A1 covenant score-miss declines (null)', rA === null, 'got ' + JSON.stringify(rA));
  check('A2 decline names studying the codex (+3)', /study/i.test(lineA) && /\+3/.test(lineA), 'line: ' + lineA.slice(0, 200));
  check('A3 decline names broadcast wins (+2)', /victory|win/i.test(lineA) && /\+2/.test(lineA), 'line: ' + lineA.slice(0, 200));
  check('A4 decline names time easing (+1 a week)', /week/i.test(lineA) && /\+1/.test(lineA), 'line: ' + lineA.slice(0, 200));
  check('A5 decline does not sell joining as a climb verb', !/join them \(\+5/.test(lineA) && /leaving yours|only Haven/.test(lineA), 'line: ' + lineA.slice(0, 200));
  check('A6 decline is honest about the cold-ask cost', /-5/.test(lineA), 'line: ' + lineA.slice(0, 200));

  Game.state.pendingCounter = null;
  t.opinion = 0;
  said.length = 0;
  const rA2 = Game.proposeLink(t.id);
  const lineA2 = said.filter(s => s.indexOf('declines.') >= 0).pop() || '';
  check('A7 proposeLink score-miss decline names the climb too', rA2 === null && /study/i.test(lineA2) && /\+3/.test(lineA2) && /leaving yours|only Haven/.test(lineA2), 'line: ' + lineA2.slice(0, 200));

  // ---- C: a shut door is silence, not a fresh insult ----
  Game.state.pendingCounter = null;
  t.opinion = -20;
  said.length = 0;
  const rC = Game.proposeCovenant(t.id);
  check('C1 shut door still declines (null)', rC === null, 'got ' + JSON.stringify(rC));
  check('C2 shut door does not nudge opinion deeper (-20 stays -20)', t.opinion === -20, 'opinion now ' + t.opinion);
  const lineC = said.filter(s => s.indexOf(nm) >= 0).pop() || '';
  check('C3 shut-door line says old slights fade with weeks', /week/i.test(lineC), 'line: ' + lineC.slice(0, 200));

  // ---- B: old slights ease +1/week for unlinked villages (linkTick) ----
  const day0 = ((Game.state.scholar || {}).day || 0);
  t.opinion = -25;
  let tickOk = true;
  for (let w = 1; w <= 4; w++) {
    Game.state.scholar.day = day0 + w * 7; // force the next week boundary
    try { Game.linkTick(); } catch (e) { tickOk = false; console.log('linkTick threw: ' + (e && e.message)); }
  }
  check('B1 linkTick runs clean across 4 week boundaries', tickOk);
  check('B2 negative opinion eases +1/week (-25 -> -21)', t.opinion === -21, 'opinion now ' + t.opinion);
  t.opinion = -2;
  Game.state.scholar.day = day0 + 5 * 7;
  try { Game.linkTick(); } catch (e) {}
  check('B3a easing moves -2 -> -1 in one week', t.opinion === -1, 'opinion now ' + t.opinion);
  Game.state.scholar.day = day0 + 6 * 7;
  try { Game.linkTick(); } catch (e) {}
  check('B3b easing clamps at 0 (never goes positive)', t.opinion === 0, 'opinion now ' + t.opinion);
  Game.state.scholar.day = day0 + 7 * 7;
  try { Game.linkTick(); } catch (e) {}
  check('B3c easing stays at 0', t.opinion === 0, 'opinion now ' + t.opinion);
  t.opinion = 10;
  Game.state.scholar.day = day0 + 8 * 7;
  try { Game.linkTick(); } catch (e) {}
  check('B4 positive opinion is untouched by easing', t.opinion === 10, 'opinion now ' + t.opinion);

  // ---- D: sanity — the counter band itself is untouched (fixed seed) ----
  Game._judgePeer = realPeer; Game.judgeLink = realLink;
  const tt = t2 || t;
  tt.opinion = 10;
  let c = 0, a = 0, d = 0;
  for (let i = 0; i < 60; i++) {
    const s = Game._judgePeer(tt.id).score;
    if (s >= 55) a++; else if (s >= 35) c++; else d++;
  }
  check('D1 counter band still fires sometimes (opinion +10)', c >= 1, 'counters=' + c + ' accepts=' + a + ' declines=' + d);

  console.log('\n' + passes + ' passed, ' + fails + ' failed');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
