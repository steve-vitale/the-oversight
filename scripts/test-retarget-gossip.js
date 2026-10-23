#!/usr/bin/env node
// test-retarget-gossip.js — ROGUE P1 (audit Talk 2 G2/P2-3) mid-trip re-targeting proof.
//
// Seeds gossip mid-trip in the harness and asserts:
//   1. low-severity gossip does NOT interrupt in-flight objectives
//   2. high-severity gossip ('attack', then 'death') re-runs objDanger for
//      in-flight villagers; a 'defer' verdict flips out→returning via the
//      existing return path, with a narrated cause citing the gossip
//   3. villagers whose re-run verdict is not 'defer' stay out (same bar as
//      departure — no RNG, no mood rolls)
//   4. flipped villagers actually come home through the existing return
//      machinery (npcNodeTravel return clock + objReturnEffect)
// BEFORE/AFTER: RETARGET_GATE=0 emulates the pre-change behavior (gossip is
//   polled only) — the same script then expects zero flips and zero
//   turn-back lines.
//
// Usage:
//   node scripts/test-retarget-gossip.js [seed]
// ENV:
//   RETARGET_GATE=0  restore old behavior for the before/after comparison
//   SEED             override the default seed
//
// Shared kit only (AGENTS.md): sim-harness loadGame/setupGame. Prints to
// stdout; writes nothing into the repo.
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || process.argv[2] || '20261022', 10);
const OLD_BEHAVIOR = process.env.RETARGET_GATE === '0';

let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log('  PASS ' + name); }
  else { failures++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function firstName(Game, vid) {
  try { return Game.displayName(vid).split(' ')[0]; } catch (e) { return '?'; }
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'retarget' });
  if (typeof Game.npcTrigger !== 'function') { console.log('FAIL npcTrigger missing — registry not loaded'); process.exit(1); }
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy; // player at haven: objective lines are said
  Game.state.weather = 'rain'; // +1 danger, deterministic

  // capture say() lines
  const said = [];
  const origSay = Game.say;
  Game.say = function (m) { said.push(String(m)); return origSay.call(this, m); };
  const turnLines = () => said.filter(s => s.indexOf('reaches the trail') !== -1);

  // pick three villagers with known range profiles; set tempers explicitly
  // (temperament is data; the test needs specific data, deterministically)
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const far1 = roster.find(id => Game.npcMaxDist(id) <= 3);
  const near = roster.find(id => id !== far1 && Game.npcMaxDist(id) >= 1);
  const far2 = roster.find(id => id !== far1 && id !== near && Game.npcMaxDist(id) <= 3);
  if (!far1 || !near || !far2) { console.log('FAIL villager selection — seed unsuitable'); process.exit(1); }
  function setTemper(vid, t) {
    const vp = (Game.data.villagers || []).find(x => x.id === vid)
      || (Game.data.background_survivors || []).find(x => x.id === vid);
    vp.personality = vp.personality || {};
    vp.personality.temperament = t;
  }
  setTemper(far1, 'cautious'); // base danger: 1 (temper) + 2 (far) + 1 (rain) = 4
  setTemper(near, 'bold');     // base danger: -1 + 0 + 1 = 0 (clamped)
  setTemper(far2, 'steady');   // base danger: 0 + 2 + 1 = 3

  // depart all three on real FORAGE objectives via the real departure path
  function departForage(vid, dist, partsLeft) {
    Game.npcSetNode(vid, hx, hy);
    try { Game.npcSetInside(vid, false); } catch (e) {}
    const o = Game.objOf(vid);
    o.kind = 'FORAGE'; o.purpose = 'forage'; o.state = 'ready'; o.indoor = false;
    o.tx = Math.max(0, Math.min(8, hx + dist)); o.ty = hy;
    o.tightness = 99; o.partsLeft = partsLeft; o.tightened = false;
    o.targetVid = null; o.companion = null;
    const ok = Game.objDepart(vid, o, hx, hy, true);
    if (!ok) { console.log('FAIL objDepart refused for ' + firstName(Game, vid)); process.exit(1); }
  }
  const d1 = Game.npcMaxDist(far1) + 1, d3 = Game.npcMaxDist(far2) + 1;
  departForage(far1, d1, 3);
  departForage(near, 1, 8);
  departForage(far2, d3, 3);
  said.length = 0; // drop the departure lines; we only care about turn-backs

  const st = vid => Game.objOf(vid).state;
  check('setup: three villagers in-flight', st(far1) === 'out' && st(near) === 'out' && st(far2) === 'out',
    [st(far1), st(near), st(far2)].join(','));
  // sanity: the re-run bar reads as engineered
  const dg1 = Game.objDanger(far1, Game.objOf(far1).tx, Game.objOf(far1).ty, hx, hy);
  const dg2 = Game.objDanger(near, Game.objOf(near).tx, Game.objOf(near).ty, hx, hy);
  const dg3 = Game.objDanger(far2, Game.objOf(far2).tx, Game.objOf(far2).ty, hx, hy);
  check('setup: base verdicts (tighten,go,ask)',
    dg1.verdict === 'tighten' && dg2.verdict === 'go' && dg3.verdict === 'ask',
    [dg1.verdict + '/' + dg1.score, dg2.verdict + '/' + dg2.score, dg3.verdict + '/' + dg3.score].join(' '));

  // ---- phase 1: low-severity gossip must not interrupt ----
  Game.seedGossip('feast', { host: Game.villagerId }, roster.slice(0, 3));
  check('low-severity gossip: all still out', st(far1) === 'out' && st(near) === 'out' && st(far2) === 'out');
  check('low-severity gossip: no turn-back narration', turnLines().length === 0,
    JSON.stringify(turnLines()));

  // ---- phase 2: high-severity 'attack' ----
  Game.seedGossip('attack', { brave: -8 }, roster.slice(0, 3));
  const flipWord = OLD_BEHAVIOR ? 'stays out (old behavior)' : "flips to 'returning'";
  const expectFlip1 = !OLD_BEHAVIOR; // far1: 4+2=6 defer
  check('attack gossip: far cautious villager ' + flipWord, (st(far1) === 'returning') === expectFlip1, st(far1));
  check('attack gossip: bold near villager stays out (2=ask)', st(near) === 'out', st(near));
  check('attack gossip: steady far villager stays out (5=tighten)', st(far2) === 'out', st(far2));
  const tl1 = turnLines();
  check('attack gossip: turn-back narrated with cause', (tl1.length === 1) === expectFlip1, JSON.stringify(tl1));
  if (!OLD_BEHAVIOR && tl1.length === 1) {
    check('attack gossip: line cites the attack', tl1[0].indexOf('attack out in the wilds') !== -1, tl1[0]);
    check('attack gossip: line names the villager', tl1[0].indexOf(firstName(Game, far1)) !== -1, tl1[0]);
    check('attack gossip: retreatCause recorded', (Game.objOf(far1).retreatCause || '').indexOf('attack') !== -1,
      Game.objOf(far1).retreatCause);
  }

  // ---- phase 3: 'death' gossip — the steady far villager's turn ----
  const deadVid = roster.find(id => id !== far1 && id !== near && id !== far2);
  Game.seedGossip('death', { who: deadVid }, []);
  const expectFlip3 = !OLD_BEHAVIOR; // far2: 3+2(attack)+1(death)=6 defer
  check('death gossip: steady far villager ' + flipWord, (st(far2) === 'returning') === expectFlip3, st(far2));
  check('death gossip: bold near villager still out (3=ask)', st(near) === 'out', st(near));
  check('death gossip: already-returning villager not re-touched',
    OLD_BEHAVIOR ? st(far1) === 'out' : st(far1) === 'returning', st(far1));
  const tl2 = turnLines();
  if (!OLD_BEHAVIOR) {
    check('death gossip: second turn-back narrated', tl2.length === 2, JSON.stringify(tl2));
    if (tl2.length === 2) {
      check('death gossip: line cites the death', tl2[1].indexOf("didn't come back") !== -1, tl2[1]);
      check('death gossip: line names the dead', tl2[1].indexOf(firstName(Game, deadVid)) !== -1, tl2[1]);
    }
  } else {
    check('old behavior: no turn-back lines at all', tl2.length === 0, JSON.stringify(tl2));
  }

  // ---- phase 4: existing return path brings them home ----
  if (!OLD_BEHAVIOR) {
    for (let p = 0; p < 4; p++) Game.advancePart();
    const n1 = Game.npcNode(far1), n3 = Game.npcNode(far2);
    check('return path: flipped villager 1 home', !v.away[far1] && n1.nx === hx && n1.ny === hy,
      'away=' + !!v.away[far1] + ' node=' + (n1 && n1.nx + ',' + n1.ny));
    check('return path: flipped villager 2 home', !v.away[far2] && n3.nx === hx && n3.ny === hy,
      'away=' + !!v.away[far2] + ' node=' + (n3 && n3.nx + ',' + n3.ny));
    check('return path: unflipped villager still away', !!v.away[near], 'away=' + !!v.away[near]);
  }

  // ---- phase 5: table sanctity gate (hard gate on the new row) ----
  if (!OLD_BEHAVIOR) {
    const used = [far1, near, far2, deadVid];
    const v4 = roster.find(id => !used.includes(id) && Game.npcMaxDist(id) <= 3);
    if (!v4) { console.log('FAIL phase 5: no fourth villager'); process.exit(1); }
    setTemper(v4, 'cautious');
    departForage(v4, Game.npcMaxDist(v4) + 1, 8); // base 4, like far1
    said.length = 0;
    const origTA = Game.tableActive;
    Game.tableActive = () => true; // the table sits: the world holds its breath
    Game.seedGossip('murder', { honest: -20 }, roster.slice(0, 3)); // +2: 4+2=6 defer — would flip
    check('table sits: high-severity gossip does not re-target', st(v4) === 'out', st(v4));
    check('table sits: no turn-back narration', turnLines().length === 0, JSON.stringify(turnLines()));
    Game.tableActive = origTA;
    Game.seedGossip('raid', { raiders: 5 }, roster.slice(0, 3)); // gate lifted: 4+2(murder)+2(raid)=8 defer
    check('gate lifted: villager flips', st(v4) === 'returning', st(v4));
    const tl5 = turnLines();
    check('gate lifted: raid cause narrated', tl5.length === 1 && tl5[0].indexOf('raiders are on the move (5 of them)') !== -1,
      JSON.stringify(tl5));
  }

  console.log(failures === 0 ? 'RETARGET-GOSSIP: ALL GREEN' : 'RETARGET-GOSSIP: ' + failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
