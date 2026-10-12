#!/usr/bin/env node
// Proof: the [SLEEP] diagnostic console spam is gone, and sleep still works.
// RED on master (console.log fired every sleep); GREEN after the 2026-10-12 fix.
// Also asserts the wake line still reports honest net health (the diagnostic's
// replacement, not a hole in the accounting).
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let _s = 424242;
Math.random = function () { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.localStorage = { _m: {}, getItem(k) { return (k in this._m) ? this._m[k] : null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.window = global;
const files = ['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js', 'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js', 'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js', 'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js', 'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js', 'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js', 'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js', 'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js', 'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js', 'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js', 'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js', 'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js', 'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js', 'src/js/monsterBehaviors.js', 'src/js/partyTactics.js', 'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js', 'src/js/metaProgression.js', 'src/js/sigW3c.js', 'src/js/villager-agency.js', 'src/js/fieldFights.js', 'src/js/villager-objectives.js', 'src/js/codex-people.js', 'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js', 'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js', 'src/js/debug-scenarios.js', 'src/js/build.js'];
for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
delete global.window;
const Game = globalThis.Scattering.Game;

let failures = 0;
function check(name, cond) { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) failures++; }

(async () => {
  await Game.init();
  Game.genDetail = () => ({});
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const says = [];
  const _say = Game.say;
  Game.say = function (...a) { says.push(String(a[0])); return _say.apply(this, a); };
  const logged = [];
  const _log = console.log;
  console.log = function (...a) { logged.push(a.map(String).join(' ')); };
  try { Game.tickAction(64); } catch (e) {}
  let wakeLine = null;
  try { Game.sleep(); } catch (e) { _log('sleep threw: ' + (e && e.message)); }
  for (const s of says) if (/Dawn\. You wake/.test(s)) wakeLine = s;
  console.log = _log;
  const sleepSpam = logged.filter(l => /\[SLEEP\]/.test(l));
  check('no [SLEEP] console lines during sleep (got ' + sleepSpam.length + ')', sleepSpam.length === 0);
  check('wake line present', !!wakeLine);
  check('wake line reports net health honestly', !!wakeLine && /\([+-]?\d+ health,/.test(wakeLine));
  if (wakeLine) _log('  wake line: ' + wakeLine.slice(0, 160));
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
