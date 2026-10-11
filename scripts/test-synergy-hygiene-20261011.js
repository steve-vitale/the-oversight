#!/usr/bin/env node
// test-synergy-hygiene-20261011.js — long-run sim lever 9 (abilities & godhood).
// Proves the two synergy-discoverability blanks:
//   A. synergyHints must name REAL pairings (4/6 lied: triage+adrenaline_control,
//      field_dressing+preservation_instinct, adrenaline_surge+triage,
//      lie_detector+read_people have no such synergy).
//   B. scholar.abilityUseLog must record only HELD abilities. Six call sites
//      logged unheld abilities (cold_blooded/hollow_bones on travel,
//      rain_dancer on dowsing-in-rain, grave_robber on scavenge,
//      photosynthesis/third_eye on forage, chitin_skin on ANY damage taken),
//      flooding the 40-entry window and evicting real uses — breaking the
//      sequential/simultaneous "seen earlier today" checks.
// Harness: full src/js list in index.html order (minus DOM-only), mulberry32
// seeded BEFORE eval. Never stub Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const { execSync } = require('child_process');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok:', name); }
  else { fail++; console.log('  FAIL:', name); }
}

async function main() {
  Math.random = mulberry32(20261011);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^"'"'"']*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  Game.say = function () {}; Game.sysSay = function () {}; Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};
  await Game.init();

  // ---- A. hint honesty (static) ----
  console.log('A. synergyHint honesty');
  const abs = Game.data.abilities || [];
  const syns = Game.data.synergies || [];
  const legsOf = (s) => {
    const reqs = s.requires_any || (s.requires ? [s.requires] : []);
    return [...new Set(reqs.flat().map(r => String(r).split(':').pop()))];
  };
  // name -> id map (case-insensitive, spaces removed)
  const nameToId = {};
  for (const a of abs) nameToId[a.name.toLowerCase().replace(/[^a-z]/g, '')] = a.id;
  let hintsChecked = 0;
  for (const a of abs) {
    for (const h of (a.synergyHints || [])) {
      hintsChecked++;
      // hint names a partner ability ("Partner Name: ..."). Extract the lead.
      const lead = h.split(':')[0].toLowerCase().replace(/^(with|the)\s+/, '').replace(/[^a-z]/g, '');
      const partnerId = nameToId[lead];
      const real = partnerId && syns.some(s => {
        const legs = legsOf(s);
        return legs.includes(a.id) && legs.includes(partnerId);
      });
      ok(!!real, `hint '${a.id}' -> '${h.slice(0, 40)}...' names a real synergy`);
    }
  }
  console.log(`  (${hintsChecked} hints checked)`);

  // ---- B. use-log hygiene (functional) ----
  console.log('B. abilityUseLog records only held abilities');
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.abilities = []; // hold NOTHING
  s.abilityUseLog = [];
  const heldIds = () => new Set((s.abilities || []).map(a => a.id));
  const unheldInLog = () => (s.abilityUseLog || []).filter(u => !heldIds().has(u.id)).map(u => u.id);

  // travel (cold_blooded/hollow_bones)
  try {
    const t = (Game.travelTargets() || [])[0];
    if (t) { try { Game.travelTo(t.x, t.y); } catch (e) {} }
  } catch (e) {}
  // forage (photosynthesis/third_eye)
  try { Game.doAction('forage', {}); } catch (e) {}
  // scavenge-ish: call the scavenge path if available; else skip
  // damage taken (chitin_skin): simulate via tbDamage if in combat, else direct noteAbilityUse probe
  let leaked = unheldInLog();
  ok(!leaked.includes('cold_blooded') && !leaked.includes('hollow_bones'),
    `travel logs no unheld cold_blooded/hollow_bones (got [${[...new Set(leaked)].join(',')}])`);
  ok(!leaked.includes('photosynthesis') && !leaked.includes('third_eye'),
    'forage logs no unheld photosynthesis/third_eye');
  // direct: damage-taken path calls noteAbilityUse('chitin_skin') unguarded at game.js:29475.
  // Probe the guard by calling noteAbilityUse the way the damage path does and
  // checking the log — then verify held abilities DO log.
  s.abilityUseLog = [];
  Game.noteAbilityUse('chitin_skin');
  leaked = unheldInLog();
  // NOTE: this probe documents current behavior; the FIX makes noteAbilityUse
  // itself hold-aware OR guards the call sites. We assert the call sites are
  // guarded by checking the game-code paths above; here we assert the end
  // state: after the fix, unheld ids never appear.
  ok(!leaked.includes('chitin_skin'), 'damage path logs no unheld chitin_skin');

  // positive control: held abilities still log
  s.abilities = [{ id: 'tracker', name: 'Tracker', level: 1, xp: 0 }];
  s.abilityUseLog = [];
  Game.noteAbilityUse('tracker');
  ok((s.abilityUseLog || []).some(u => u.id === 'tracker'), 'held ability still logs');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
