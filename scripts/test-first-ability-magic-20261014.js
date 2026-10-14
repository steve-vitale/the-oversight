#!/usr/bin/env node
// test-first-ability-magic-20261014.js: the first ability (spawn knack) is
// magic, and is spoken of as given, never as a learned human skill.
// Steve 2026-10-14: "the first ability is still talked about like a skill or
// something, and might just be offering skills?"
//  A. a new game's 3 choices are all lane 'magic' (8 seeds; one process each)
//  B. an old save holding skill-lane choices (still_hands, storm_ear) is
//     cleaned to 3 magic choices; picking a skill id is refused
//  C. the sheet copy never calls it an innate, learned trick
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog, ROOT } = require('./sim-harness');

let pass = 0, fail = 0;
const ok = (c, name, extra) => { if (c) pass++; else { fail++; console.log('  FAIL', name, extra === undefined ? '' : extra); } };

async function child(seed) {
  const { Game } = await loadGame({ seed });
  await quietLog(() => setupGame(Game));
  const lane = id => ((Game.data.abilities || []).find(a => a.id === id) || {}).lane;
  const s = Game.state.scholar;
  const fresh = (s.knackChoices || []).map(c => c.id);
  // B: simulate a pre-lanes save
  s.knackChosen = false;
  s.knackChoices = [
    { id: 'still_hands', name: 'Still Hands' },
    { id: 'storm_ear', name: 'Storm-ear' },
    { id: 'night_eyes', name: 'Night Eyes' },
  ];
  const before = (s.abilities || []).length;
  s.abilities = [];
  const refused = Game.chooseKnack('still_hands') === null && s.abilities.length === 0;
  const live = Game.liveKnackChoices().map(c => c.id);
  Game.chooseKnack(live[0]);
  const took = (s.abilities || []).map(a => a.id);
  return { fresh, freshLanes: fresh.map(lane), live, liveLanes: live.map(lane), refused, took, before };
}

async function main() {
  if (process.argv[2] === '--child') {
    const r = await child(+process.argv[3]);
    process.stdout.write('\nRESULT ' + JSON.stringify(r) + '\n');
    return;
  }
  for (const seed of [7, 42, 99, 1234, 555, 777, 2026, 31337]) {
    const out = execFileSync(process.execPath, [__filename, '--child', String(seed)], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
    const r = JSON.parse(out.split('\nRESULT ').pop());
    ok(r.fresh.length === 3, `A seed ${seed}: 3 first-ability choices`, r.fresh);
    ok(r.freshLanes.every(l => l === 'magic'), `A seed ${seed}: all magic`, r.fresh.join(','));
    if (seed === 7) {
      ok(r.refused, 'B: a retired skill-lane pick is refused');
      ok(r.live.length === 3 && r.liveLanes.every(l => l === 'magic'), 'B: old save cleaned to 3 magic choices', r.live.join(','));
      ok(r.live.includes('night_eyes'), 'B: the valid old choice is kept', r.live.join(','));
      ok(r.took.length === 1 && r.took[0] === r.live[0], 'B: choosing a live choice fills the slot', r.took);
    }
  }
  const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
  const i = app.indexOf('function knackSheet');
  const sheet = app.slice(i, app.indexOf('openSheet', i) + 900);
  ok(i > 0, 'C: knackSheet found');
  ok(!/always been there|learned long ago|A knack\.|A trick/.test(sheet), 'C: sheet copy does not call it an innate learned trick');
  ok(/didn\\u2019t learn it|You didn't learn it/.test(sheet), 'C: sheet copy says it was not learned');
  console.log(`test-first-ability-magic-20261014: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
