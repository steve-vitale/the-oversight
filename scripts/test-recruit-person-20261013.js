// test-recruit-person-20261013.js — RECRUIT-GHOST FIX proof (journey deepening r11).
// Arrivals (application accept, auto-recruit, visitor invite) pushed bare roster
// ids with no person record: vpOf missed -> startConvo null -> Talk dead-ended,
// census "Someone" with no occupation. Fix: ensureRosterPerson hydrates once at
// arrival (game.js), called from membership.js arrivalTick and betrayal.js
// visitorInteract. RED on pre-fix code, GREEN post-fix.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); }
  console.log((cond ? '  ok  ' : '  FAIL') + ' ' + name + (detail && !cond ? ' — ' + detail : ''));
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '0x911', 16);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
const FILES = ['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js', 'src/js/convo-mood.js',
  'src/js/convoTopics.js', 'src/js/convo-wants.js', 'src/js/convo-dialogue.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js', 'src/js/contests.js',
  'src/js/broadcast.js', 'src/js/contestEngine.js', 'src/js/alienPlayers.js', 'src/js/storage.js',
  'src/js/perceive.js', 'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js', 'src/js/lifeseed.js',
  'src/js/progression.js', 'src/js/ledger.js', 'src/js/abilityActions.js', 'src/js/monsterBehaviors.js',
  'src/js/statusEffects.js', 'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js', 'src/js/membership.js',
  'src/js/hierarchy.js', 'src/js/debug-scenarios.js', 'src/js/build.js'];
for (const f of FILES) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('EVAL FAIL', f, e.message); process.exit(2); } }
delete global.window;
const Game = globalThis.Scattering.Game;
Game.say = () => {}; Game.sysSay = () => {}; Game.audioEvent = () => {}; Game.drama = () => {};

function vpResolves(id) {
  try { const vp = Game.vpOf(id); return !!(vp && vp.id === id); } catch (e) { return false; }
}
function convoOpens(id) {
  try { const r = Game.startConvo(id); if (r) { try { Game.endConvo(id, 'done'); } catch (e) {} return true; } return false; }
  catch (e) { return false; }
}

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);

  console.log('== baseline: starting roster resolves ==');
  {
    const roster = Game.state.village.roster || [];
    const bad = roster.filter(id => !vpResolves(id));
    ok(bad.length === 0, 'starting roster: every id resolves via vpOf', JSON.stringify(bad));
  }

  // A background-survivor id NOT in the starting roster (the Nina case).
  const rosterSet = new Set(Game.state.village.roster || []);
  const bgUnused = (Game.data.background_survivors || []).find(s => s && s.id && !rosterSet.has(s.id));
  ok(!!bgUnused, 'found an unused background-survivor seed for the test', 'none unused?!');

  console.log('== 1. application arrival (background-survivor applicant) ==');
  const bgId = bgUnused.id;
  {
    const m = Game.mshipState();
    m.arrivals.push({ id: 'app_bg1', charId: bgId, name: bgUnused.name, formerOccupation: bgUnused.formerOccupation, arriveDay: 0 });
    Game.arrivalTick();
    const roster = Game.state.village.roster || [];
    ok(roster.indexOf(bgId) >= 0, 'bg applicant arrived onto roster');
    ok(vpResolves(bgId), 'bg applicant resolves via vpOf (was ghost pre-fix)', bgId);
    ok(convoOpens(bgId), 'bg applicant conversation opens (was null pre-fix)', bgId);
  }

  console.log('== 2. application arrival (drifter, no character) ==');
  {
    const m = Game.mshipState();
    m.arrivals.push({ id: 'app_drift1', charId: null, name: 'a tired cook', formerOccupation: 'cook', arriveDay: 0 });
    Game.arrivalTick();
    ok(vpResolves('app_drift1'), 'drifter resolves via vpOf (was ghost pre-fix)');
    let nm = null;
    try { nm = Game.vpOf('app_drift1').name; } catch (e) {}
    ok(typeof nm === 'string' && nm && !/^a (tired|lean|weathered|young|quiet) /.test(nm),
      'drifter got a real name, not the descriptor', String(nm));
    ok(convoOpens('app_drift1'), 'drifter conversation opens (was null pre-fix)');
  }

  console.log('== 3. visitor invite path ==');
  {
    const v = Game.state.village;
    const day = (Game.state.scholar || {}).day || 1;
    v.visitors = v.visitors || [];
    v.visitors.push({ id: 'vis_ghost1', type: 'curious', name: 'Road Ghost', day: day });
    let r = null;
    try { r = Game.visitorInteract('vis_ghost1', 'invite'); } catch (e) { ok(false, 'visitorInteract invite threw', e.message); }
    const nid = 'visjoin_' + day;
    const roster = Game.state.village.roster || [];
    ok(roster.indexOf(nid) >= 0, 'invited visitor joined roster as ' + nid);
    ok(vpResolves(nid), 'invited visitor resolves via vpOf (was ghost pre-fix)', nid);
    ok(convoOpens(nid), 'invited visitor conversation opens (was null pre-fix)', nid);
  }

  console.log('== 4. idempotency + roster invariant ==');
  {
    const m = Game.mshipState();
    m.arrivals.push({ id: 'app_bg2', charId: bgId, name: bgUnused.name, arriveDay: 0 });
    Game.arrivalTick();
    const n = (Game.data.villagers || []).filter(x => x && x.id === bgId).length;
    ok(n === 1, 'double arrival does not duplicate the person record', 'count=' + n);
    const roster = Game.state.village.roster || [];
    const bad = roster.filter(id => !vpResolves(id));
    ok(bad.length === 0, 'post-arrival roster: every id resolves via vpOf', JSON.stringify(bad));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log(' - ' + f)); }
  process.exit(fail ? 1 : 0);
})();
