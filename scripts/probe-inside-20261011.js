#!/usr/bin/env node
// Probe: does goInside actually restore pantry access?
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
_s = 777;
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.localStorage = { _m: {}, getItem(k) { return (k in this._m) ? this._m[k] : null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } };
global.window = global;
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
delete global.window;
const Game = globalThis.Scattering.Game;

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const acc = () => { try { return Game.havenStoresAccess(); } catch (e) { return 'ERR:' + e.message; } };
  const tile = () => { try { const t = Game.playerTile(); return t && t.type; } catch (e) { return 'ERR'; } };
  console.log('day1 start: tile=' + tile() + ' insideHaven=' + Game.state.scholar.insideHaven + ' access=' + acc());
  // simulate a forage trip out and back, like the policy does
  const cands = [];
  for (const tt of (Game.travelTargets() || [])) {
    const t = Game.tileAt(tt.x, tt.y);
    if (!t || t.type === 'haven' || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
    cands.push({ x: tt.x, y: tt.y, d: tt.d });
  }
  cands.sort((a, b) => a.d - b.d);
  const hx = Game.map.px, hy = Game.map.py;
  console.log('travel out to', cands[0].x, cands[0].y);
  Game.travelTo(cands[0].x, cands[0].y);
  console.log('away: tile=' + tile() + ' insideHaven=' + Game.state.scholar.insideHaven + ' access=' + acc());
  try { Game.doAction('forage', {}); } catch (e) { console.log('forage err', e.message); }
  Game.travelTo(hx, hy);
  console.log('back: tile=' + tile() + ' insideHaven=' + Game.state.scholar.insideHaven + ' access=' + acc());
  // now goInside
  try { const r = Game.enterBuilding(); console.log('enterBuilding ->', r); } catch (e) { console.log('enterBuilding threw:', e.message); }
  console.log('after: tile=' + tile() + ' insideHaven=' + Game.state.scholar.insideHaven + ' access=' + acc());
  // can we take from pantry?
  const pk0 = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  console.log('pantry kcal before take:', Math.round(pk0));
  try { const r = Game.takeFromPantry(0); console.log('takeFromPantry(0) ->', r === null ? 'null' : 'ok'); } catch (e) { console.log('take threw:', e.message); }
  const pk1 = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  console.log('pantry kcal after take:', Math.round(pk1));
}
main().catch(e => { console.error('PROBE ERROR:', e); process.exit(2); });
