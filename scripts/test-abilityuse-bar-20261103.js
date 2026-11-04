// PROOF: combat-bar surfacing (ability-use game-code, 2026-11-03).
// Game side (node-provable): Game.combatBarAbilityActions() lists every
// held uncovered combat action exactly once, with ok/why identical to
// _actionAvailable, and needsTarget true exactly for stare_down.
// App side (DOM-only, so source-text only): combatActionsHTML renders
// data-combat-ability buttons from that list, wireCombatPanel wires them.
// Phone/browser verification at 390x844 is OUTSTANDING — this test does
// NOT prove a tappable bar.
// Usage: node scripts/test-abilityuse-bar-20261103.js
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./godpath/lib.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}

async function main() {
  const Game = await L.load({ seed: 99101 });
  L.newRun(Game, 'Columbus, Ohio');
  // Grant every uncovered combat action + the covered ones (which must
  // NOT appear). force:true bypasses the 6-slot cap for the fixture.
  const MAGIC = ['rage', 'bird_strike', 'pocket_sand', 'freeze_tag', 'fear_aura', 'turncoat', 'trade_of_blows'];
  const SKILL = ['ambush', 'tripwire', 'haymaker', 'intimidating_presence', 'peacemaker',
    'dead_aim', 'patient_aim', 'brawler_instinct', 'game_sense'];
  const COVERED = ['scream_cheese', 'shoulder_check', 'hogtie', 'come_get_some'];
  L.openSlots(Game, 6);
  for (const id of MAGIC.concat(COVERED)) L.giveAbility(Game, id, { force: true });
  for (const id of SKILL) L.giveAbility(Game, id, {});
  // Top up so kcal/hp gates don't mask pressability.
  Game.state.scholar.kcal = 5000;
  if ((Game.state.scholar.health || 0) < 100) Game.state.scholar.health = 100;
  // Stage a live fight (hummice pack: 4 monsters, adjacent-ish field).
  L.fight(Game, 'hummice', { party: true });
  const p = Game.tbFighter('p');
  if (p) { p.acted = false; }

  const entries = Game.combatBarAbilityActions();
  const keys = entries.map(e => e.aid + '.' + e.act);
  const counts = {};
  for (const k of keys) counts[k] = (counts[k] || 0) + 1;

  // Each held uncovered action appears exactly once.
  const data = Game.data.abilities || [];
  const byId = {};
  for (const a of data) byId[a.id] = a;
  const expected = [];
  for (const id of MAGIC.concat(SKILL)) {
    const def = byId[id];
    if (!def || !def.actions) continue;
    for (const act of def.actions) {
      if ((act.context || 'explore') !== 'combat') continue;
      if (act.automatic) continue;
      expected.push(id + '.' + act.id);
    }
  }
  console.log('BAR: expected ' + expected.length + ' entries, got ' + entries.length);
  for (const k of expected) {
    check('bar lists ' + k + ' exactly once', counts[k] === 1, 'count=' + (counts[k] || 0));
  }
  for (const k of keys) {
    check('bar entry ' + k + ' is expected', expected.indexOf(k) >= 0, 'unexpected');
  }
  // Covered actions must NOT appear (their hardcoded buttons own them).
  for (const id of COVERED) {
    const def = byId[id];
    if (!def || !def.actions) continue;
    for (const act of def.actions) {
      if ((act.context || 'explore') !== 'combat') continue;
      check('bar hides covered ' + id + '.' + act.id, counts[id + '.' + act.id] === undefined);
    }
  }
  // ok/why match _actionAvailable exactly, entry by entry.
  for (const e of entries) {
    const actDef = (byId[e.aid].actions || []).find(a => a.id === e.act);
    const avail = Game._actionAvailable(e.aid, actDef);
    check('ok/why match _actionAvailable for ' + e.aid + '.' + e.act,
      e.ok === avail.ok && (e.why || null) === (avail.why || null),
      'bar ok=' + e.ok + ' why=' + e.why + ' vs avail ok=' + avail.ok + ' why=' + avail.why);
  }
  // needsTarget true exactly for stare_down.
  for (const e of entries) {
    const want = (e.aid === 'intimidating_presence' && e.act === 'stare_down');
    check('needsTarget ' + e.aid + '.' + e.act + ' = ' + want, e.needsTarget === want, 'got ' + e.needsTarget);
  }
  // At least one pressable button (the bar must offer, not just list).
  const pressable = entries.filter(e => e.ok);
  check('at least one pressable entry', pressable.length >= 1, 'pressable=' + pressable.length + ' of ' + entries.length);
  console.log('  (pressable: ' + pressable.map(e => e.aid + '.' + e.act).join(', ') + ')');
  // kcal figures carried (dinner-test visibility: the cost is shown).
  for (const e of entries) {
    const actDef = (byId[e.aid].actions || []).find(a => a.id === e.act);
    const want = (actDef.cost && actDef.cost.kcal) || 0;
    check('kcal carried for ' + e.aid + '.' + e.act, e.kcal === want, 'got ' + e.kcal + ' want ' + want);
  }
  // Out of combat: empty (no combat buttons outside a fight).
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  Game.tbfight = null;
  check('empty out of combat', Game.combatBarAbilityActions().length === 0,
    'got ' + Game.combatBarAbilityActions().length);

  // App side: source-text assertions (app.js is DOM-only; node can't click it).
  const appSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'app.js'), 'utf8');
  check('app renders data-combat-ability buttons', appSrc.includes('data-combat-ability') && appSrc.includes('combatBarAbilityActions()'));
  check('app wires data-combat-ability generically', appSrc.includes("querySelectorAll('[data-combat-ability]')"));
  check('app stare_down picker present', appSrc.includes('Stare down which?'));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
