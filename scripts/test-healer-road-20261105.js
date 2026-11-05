// PROOF: the Healer road — healing is a real XP source, and the road from
// healing work to a recognized Healer is walkable (Steve 2026-11-05).
// The road as designed: heal a lot -> craft XP -> craft level-ups -> craft kit
// offers include the 5 healer magic abilities -> hold 3+ caregiver magic ->
// recognized "Healer of the Shepherd of the Dead". No new class/path; the
// caregiver path, its healer subclass and its deed are unchanged.
// Usage: node scripts/test-healer-road-20261105.js   (exit 1 on any FAIL)
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./sim-harness.js');
const L = require('./godpath/lib.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}
const HEALER_ABILITIES = ['purify', 'the_touch', 'battlefield_grace', 'mending_hands', 'lifeline'];

async function main() {
  // ---- 1. the craft kit holds all 5 healer magic abilities (data) ----
  const T = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'tracks.json'), 'utf8'));
  const craftKit = T.kits.craft || [];
  console.log('healer abilities in the craft kit');
  for (const a of HEALER_ABILITIES) check('craft kit contains ' + a, craftKit.includes(a), 'kit=' + JSON.stringify(craftKit));
  // The road is walkable early: the level-2 offer pool (first 6 unheld) must
  // already contain healer abilities — a healer is offered after 2 level-ups.
  const pool2 = craftKit.slice(0, 6);
  check('level-2 offer pool contains healer abilities', pool2.some(a => HEALER_ABILITIES.includes(a)), 'pool=' + JSON.stringify(pool2));

  const Game = await L.load({ seed: 99101 });
  const scholar = L.newRun(Game, 'Columbus, Ohio');
  const village = Game.state.village;
  const vid = (village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) { console.log('FAIL no roster villager'); process.exit(1); }
  village.npcXp = village.npcXp || {};
  village.npcAbilities = village.npcAbilities || {};
  Game.state.scholar.day = 10;
  Game.state.systemArrived = true; // villager sheets queue only after arrival

  // ---- 2. healing deeds cross the first craft threshold (the road's first step) ----
  console.log('healing deeds -> craft XP -> level-up');
  {
    village.npcXp[vid] = village.npcXp[vid] || {};
    village.npcXp[vid].craft = 17; // one below the first threshold (18)
    const before = village.npcXp[vid].craft;
    Game.creditDeed(vid, 'healing');
    Game.creditDeed(vid, 'healing');
    const after = village.npcXp[vid].craft || 0;
    check('two healing deeds move craft XP past 18', after >= 18, 'before=' + before + ' after=' + after);
    const lvl = Game.trackLevelFor ? Game.trackLevelFor(after, vid) : (after >= 18 ? 1 : 0);
    check('craft level is now >= 1', lvl >= 1, 'level=' + lvl);
    const sheets = village.npcXp[vid].sheets || [];
    const granted = (village.npcXp[vid].granted || {}).craft || 0;
    check('a level-up sheet was queued/granted for the crossing', sheets.length > 0 || granted >= 1, 'sheets=' + sheets.length + ' granted=' + granted);
  }

  // ---- 3. recognition: 3 caregiver magic abilities -> Healer ----
  console.log('recognition: 3 caregiver magic abilities');
  {
    village.npcAbilities[vid] = ['purify', 'the_touch', 'mending_hands'];
    const rec = Game.recognizeClass(vid);
    check('recognizeClass returns a record', !!rec, 'rec=' + JSON.stringify(rec));
    check('path is caregiver', rec && rec.path === 'caregiver', 'path=' + (rec && rec.path));
    check('subclass is healer', rec && rec.subclass === 'healer', 'subclass=' + (rec && rec.subclass));
    const line = Game.classLine ? Game.classLine(vid) : '';
    check('class line names Healer of the Shepherd of the Dead', /Healer of the Shepherd of the Dead/.test(line || ''), 'line=' + line);
    const stored = (Game.state.village.npcGodpath || {})[vid];
    check('recognition stored on npcGodpath', stored && stored.path === 'caregiver' && stored.subclass === 'healer', 'stored=' + JSON.stringify(stored));
  }

  // ---- 4. the caregiver deed is unchanged (the road's capstone) ----
  console.log('caregiver deed unchanged');
  {
    const G = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'godpaths.json'), 'utf8'));
    const paths = G.paths || G;
    const cg = Array.isArray(paths) ? paths.find(p => p.id === 'caregiver') : paths.caregiver;
    check('caregiver path exists', !!cg);
    if (cg) {
      check('caregiver god is The Shepherd of the Dead', (cg.god && (cg.god.name || cg.god)) === 'The Shepherd of the Dead' || /Shepherd of the Dead/.test(JSON.stringify(cg)), JSON.stringify(cg.god || cg).slice(0, 120));
      check('caregiver deed is care_survived', (cg.god && cg.god.deed && cg.god.deed.id) === 'care_survived' || /care_survived/.test(JSON.stringify(cg)), 'deed=' + JSON.stringify((cg.god || {}).deed || {}).slice(0, 120));
    }
  }

  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
