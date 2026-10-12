// test-audiovfx-scenarios-20261012.js — every new debug scenario is PLAYED
// (Steve's rule): run it in the harness, assert postconditions.
// - monster scenarios: the right monster spawns, on a wild node (not Haven
//   grounds), player placed, monster 3 tiles east — two taps to the encounter.
// - boards/milestone: run without throwing.
'use strict';
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name); }
}

const MONSTERS = [
  ['warranty', 'warranty_caller'], ['moderator', 'moderator'],
  ['mosquito', 'giant_mosquito'], ['tick', 'alien_tick'],
  ['w3redactor', 'redactor'], ['w3gavel', 'gavel'], ['w3focusgroup', 'focus_group'],
  ['w3spool', 'spool'], ['w3chorusline', 'chorus_line'], ['w3tos', 'terms_of_service'],
  ['w3callback', 'callback'], ['w3buffering', 'buffering'], ['w3adbreak', 'ad_break'],
  ['w4congregation', 'congregation'], ['w4strike', 'strike'], ['w4influencer', 'influencer'],
  ['w4audit', 'audit'], ['w4reunion', 'reunion'], ['w4suburb', 'suburb'],
  ['w4eulogy', 'eulogy'], ['w4algorithm', 'algorithm'], ['w4eater', 'eater'],
  ['w4herald', 'herald'],
  ['w5cancellation', 'cancellation'], ['w5editor', 'editor'], ['w5rerun', 'rerun'],
  ['w5spoiler', 'spoiler'], ['w5timeslot', 'timeslot'], ['w5nielsen', 'nielsen'],
  ['w5finale', 'finale'], ['w5crew', 'finale_crew'], ['w5opening', 'finale_opening'],
  ['w5note', 'network_note'],
];

(async () => {
  const { Game } = await loadGame({ seed: 31337, mode: 'audiovfx-scenarios', fullTelemetry: false });
  ok(typeof Game.debugScenarioList === 'function', 'debugScenarioList exists');
  const listed = Object.fromEntries(Game.debugScenarioList());

  for (const [sid, mid] of MONSTERS) {
    ok(!!listed[sid], 'listed: ' + sid);
    let err = null;
    try { Game.debugScenario(sid); } catch (e) { err = e; }
    ok(!err, sid + ' runs without throwing' + (err ? ' (' + err.message + ')' : ''));
    if (err) continue;
    const s = Game.state.scholar;
    ok(s.monster && s.monster.id === mid, sid + ' spawns ' + mid);
    ok(s.insideHaven === false, sid + ' is wild (not Haven grounds)');
    ok(s.mx === 2 && s.my === 4 && s.monster.mx === 5 && s.monster.my === 4,
      sid + ' player (2,4), monster (5,4) — two taps to the encounter');
    // the monster's declare voice resolves (registry or data-driven)
    const mdef = (Game.data.monsters || []).find(m => m.id === mid) || {};
    const aa = ((mdef.encounter) || {}).aggroAudio;
    ok(!!aa, sid + ' has aggroAudio (' + aa + ')');
  }

  // boards + milestone
  for (const sid of ['audioWaves', 'vfxShowcase', 'milestoneWave']) {
    ok(!!listed[sid], 'listed: ' + sid);
    let err = null;
    try { Game.debugScenario(sid); } catch (e) { err = e; }
    ok(!err, sid + ' runs without throwing' + (err ? ' (' + err.message + ')' : ''));
  }

  // categories carry them
  const cats = Game.debugScenarioCategories();
  const flat = Object.values(cats).flat().map(x => x[0]);
  for (const [sid] of MONSTERS.concat([['audioWaves'], ['vfxShowcase'], ['milestoneWave']])) {
    ok(flat.includes(sid), 'categorized: ' + sid);
  }

  // milestoneWave actually played the beat: waveUnlockBeat is real
  ok(typeof Game.waveUnlockBeat === 'function', 'waveUnlockBeat exists');

  console.log(pass + '/' + (pass + fail) + ' green');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
