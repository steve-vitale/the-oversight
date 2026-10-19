#!/usr/bin/env node
// test-killbeat-20261019.js — proof for the companion wave-3+ killing-blow
// beat (sim-killbeat 2026-10-19, loop oversight-flesh-out-loop, axis
// scale-onramp). The documented blank: a companion's wave-3+ killing blow
// inside the scholar's TB fight landed in waveKillLog/tele and the fiction
// never noticed. The beat: one System-broadcast line naming the companion
// (disp convention) + the knowledge-gated monster (monsterNoun), then one
// witness reaction.
// RED/GREEN:
//  (1) beat fires on an instrumented companion wave-3+ kill — the FULL TB
//      path (_tbKilledBy stamp -> tricktag via='companion' -> recordWaveKill
//      -> companionKillBeat), not just a direct recordWaveKill call
//  (2) never fires on scholar kills (via='player')
//  (3) never fires on wave-1/2 companion kills
//  (4) fires exactly once per kill (one tele event + one System line per kill)
//  (5) no knowledge leak: pre-arrival, the unknown descriptor composes and
//      the true monster name never appears; the companion's descriptor is
//      never truncated to a first-name split
// Sim-harness rules: seeded BEFORE eval (sim-harness does it), no Game.save
// stub, no copied eval boilerplate (lib.js kit), no absolute paths.
// The beat's cosmetics run on a dedicated mulberry32 stream, so they cannot
// perturb the main RNG stream the game rolls on.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-killbeat-20261019');

function beatTele(Game) {
  return (Game.state.telemetry || []).filter(e => e && e.type === 'companion_kill_beat');
}
function sysLines(said) {
  return said.filter(t => /SYSTEM:/.test(t) && /put down/.test(t));
}

// One instrumented TB kill: the monster dies, the killing-blow source is
// stamped exactly like the damage path stamps it (see the TB KILL
// ATTRIBUTION site), then tbEnd resolves the record path.
function instrumentedKill(Game, mid, via, compVid) {
  const mf = (Game.tbfight.fighters || []).find(f => f && f.kind === 'monster' && (f.mdef || {}).id === mid);
  if (!mf) return false;
  const cf = (Game.tbfight.fighters || []).find(f => f && f.kind === 'villager' && f.villagerId === compVid);
  mf.hp = 0; mf.alive = false;
  mf._tbKilledBy = via === 'companion' ? (cf ? cf.key : 'p') : 'p';
  Game.tbEnd('won');
  return true;
}

async function main() {
  const Game = await K.load({ seed: 4242, narration: true });
  K.newRun(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { said.push(String(t)); return origSay(t); };
  const scholarVid = Game.villagerId;
  const compVid = (Game.state.village.roster || []).find(id => id && id !== scholarVid);
  T.ok('companion on roster', !!compVid, compVid);
  // Park the companion next to the scholar so startCombat's party join
  // (villagers within 4 squares) picks them up.
  const vpos = Game.state.village.positions || (Game.state.village.positions = {});
  const px = 2, py = 4;
  vpos[compVid] = { mx: px, my: py };

  const compNamePre = Game.disp(compVid); // L0 descriptor form, for the (5) section
  const mdef = (Game.data.monsters || []).find(m => m.id === 'redactor');

  // ---- (1) companion wave-3+ kill: the beat fires ----
  Game.state.systemArrived = true; // wave-3 is a post-arrival world (day 25+)
  const compName = Game.disp(compVid); // post-arrival true name
  said.length = 0;
  K.fight(Game, 'redactor', { party: true, px, py });
  const cf = (Game.tbfight.fighters || []).find(f => f && f.kind === 'villager' && f.villagerId === compVid);
  T.ok('companion joined the TB fight', !!cf);
  T.ok('instrumented redactor kill', instrumentedKill(Game, 'redactor', 'companion', compVid));
  const t1 = beatTele(Game);
  T.ok('(1) beat tele fires once on companion wave-3 kill', t1.length === 1, `tele=${t1.length}`);
  const s1 = sysLines(said);
  T.ok('(1) System line names companion + monster', s1.length === 1
    && s1[0].includes(compName) && s1[0].includes('Redactor'),
    JSON.stringify(s1[0] || '').slice(0, 160));
  T.ok('(1) waveKillLog via=companion (tricktag attribution intact)',
    (Game.state.waveKillLog || []).some(e => e && e.mid === 'redactor' && e.via === 'companion' && e.by === compVid));

  // ---- (4) exactly once per kill: two kills -> two beats, no more ----
  said.length = 0;
  K.fight(Game, 'gavel', { party: true, px, py });
  T.ok('instrumented gavel kill', instrumentedKill(Game, 'gavel', 'companion', compVid));
  const t4 = beatTele(Game).filter(e => e.id === 'gavel');
  T.ok('(4) second kill fires exactly one more beat', t4.length === 1, `tele=${t4.length}`);
  const s4 = sysLines(said);
  T.ok('(4) second kill fires exactly one System line', s4.length === 1, `lines=${s4.length}`);
  const witnessRe = /write it down|at the fire|SEE that|shopping list|go first|make them angry|sit down|needs to hear|should not be able to die/;
  const witnessLine4 = said.find(t => !/SYSTEM:/.test(t) && witnessRe.test(t));
  T.ok('(4) witness reaction line present', !!witnessLine4,
    said.filter(t => !/SYSTEM:/.test(t)).slice(-2).join(' | ').slice(0, 140));

  // ---- (2) scholar kill: no beat ----
  const tBefore2 = beatTele(Game).length;
  said.length = 0;
  K.fight(Game, 'spool', { party: true, px, py });
  T.ok('instrumented spool kill (scholar)', instrumentedKill(Game, 'spool', 'player', compVid));
  T.ok('(2) scholar wave-3 kill fires no beat',
    beatTele(Game).length === tBefore2 && sysLines(said).length === 0);

  // ---- (3) wave-1/2 companion kill: no beat ----
  const tBefore3 = beatTele(Game).length;
  said.length = 0;
  K.fight(Game, 'hushwolf', { party: true, px, py });
  T.ok('instrumented hushwolf kill (companion)', instrumentedKill(Game, 'hushwolf', 'companion', compVid));
  T.ok('(3) companion wave-1 kill fires no beat',
    beatTele(Game).length === tBefore3 && sysLines(said).length === 0);

  // ---- (5) knowledge gate: pre-arrival, no true-name leak ----
  // Same game, L0-knowledge world forced: the beat reads systemArrived live.
  Game.state.systemArrived = false;
  const said2 = [];
  Game.say = (t) => { said2.push(String(t)); return origSay(t); };
  const cname2 = Game.disp(compVid);
  const tBefore5 = beatTele(Game).length;
  K.fight(Game, 'redactor', { party: true, px, py });
  T.ok('pre-arrival companion joined', (Game.tbfight.fighters || []).some(f => f && f.kind === 'villager' && f.villagerId === compVid));
  T.ok('pre-arrival instrumented kill', instrumentedKill(Game, 'redactor', 'companion', compVid));
  const beatLines2 = said2.filter(t => /put down/.test(t));
  T.ok('(5) beat still fires pre-arrival (words land without the tag)',
    beatTele(Game).length === tBefore5 + 1 && beatLines2.length >= 1
    && beatLines2.every(t => !/SYSTEM:/.test(t)));
  const bl2 = beatLines2.join(' ');
  T.ok('(5) no true-name leak pre-arrival', !bl2.includes('The Redactor') && bl2.includes(Game.monsterNoun('redactor')),
    'noun=' + Game.monsterNoun('redactor'));
  T.ok('(5) companion named by full disp convention, never truncated',
    bl2.includes(cname2) && !/\bA['"]? just put/.test(bl2),
    'cname=' + cname2);
  Game.state.systemArrived = true; // restore

  T.section('sense read — the beat as the player sees it');
  const show = s1[0] || '';
  console.log('  ' + show);
  if (witnessLine4) console.log('  ' + witnessLine4);
  console.log(`  (pre-arrival: ${beatLines2[0] || '(none)'})`);

  T.done();
}

main().catch(e => { console.error('FATAL', e); process.exitCode = 1; });
