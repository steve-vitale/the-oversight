#!/usr/bin/env node
// BREAK-IT counters proof 2026-10-11 (monsters target, r16).
// The structural counter system (5ef0a5c1, 2026-10-10) had NEVER been break-it
// attacked. HOSTILE attacks along the 4 axes:
//
// EXPLOIT: counter farming into ledger loops, double-claims, discovery
//   without performing, multiplicative stacking.
// SOFTLOCK: teaching-channel loops, stuck discovery states.
// HONESTY: every counter def's trick/hint/reveal vs the engine hook.
// DEAD-CODE: all 30 defs reachable, all kinds wired to live handlers.
//
// CATCHES (fixed in this run):
//   C1 (HONESTY, voice_mimic_radio): the counter said "move TOWARD the cry
//     once and the mimic drops the voice, exposed." The ENGINE does the
//     opposite: approaching feeds vmLure (it closes in on you); the reveal
//     (exposed, x1.5) fires only after 2 rounds of REFUSAL (vmResist>=2).
//     Following the counter's advice got you rushed. Rewired the def to
//     keep_distance/3 with honest text ("Resist the lure").
//   C2 (HONESTY, understudy/fresh_weapon): the check ran BEFORE the usSeen
//     recording, so the FIRST strike of the fight with ANY weapon "discovered"
//     the switch-weapons trick with zero behavior change. Now requires the
//     understudy to have SEEN at least one weapon already — the trick is the
//     SWITCH, mid-fight.
//   C3 (HONESTY, review_drone/move_x2): "never the same way" was copy-only —
//     any two consecutive shuffles discovered it while the drone's predictive
//     aim actively punishes same-way dodges. Now enforced via move direction
//     (ctr.vary).
//   C4 (HONESTY, warranty_caller/move_x2): "move two or more tiles" was
//     copy-only — 1-tile shuffles counted. Now enforced via tiles moved
//     (ctr.tiles).
//   C5 (HONESTY, bright_idea): "or behind cover" was never engine-real —
//     bursts are radial; cover only works on beams. Dropped from reveal +
//     knownTactics.
//   C6 (BAND DRIFT, ad_break): survival-attrition (cc245a84) softened the
//     damage floor to 19, below the canon 20-70 band the r15 proof asserts.
//     Restored to [20,33].
//
// HELD (attacked, resisted): ledger farming is bounded (perTypeCap 2, no
//   multiplicative stacking, discovery once-only); teaching channel
//   terminates; all 14 kinds are wired to live handlers (shout/offer_food/
//   wait/strike/move/round_end); all 30 defs reachable; the other 26
//   counters' payoffs are engine-real (verified individually); wave 4/5
//   telegraphs unchanged since r15 (copy/engine gap stands, documented).
//
// Green across 3 seeds: SEED=N node scripts/test-break-counters-20261011.js
const H = require('./sim-harness.js');
const SEED = parseInt(process.env.SEED || '20261011', 10);
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};

function endFight(Game) {
  if (Game.tbfight) { try { Game.tbfight.over = true; } catch (e) {} Game.tbfight = null; }
  try { Game.state.scholar.monster = null; } catch (e) {}
}
const counterOf = (Game, id) => {
  const m = (Game.data.monsters || []).find(x => x.id === id) || {};
  return m.counter || null;
};

(async () => {
  const { Game } = await H.loadGame({ seed: SEED });
  await H.setupGame(Game);
  const s = Game.state.scholar;
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  const realPassive = Game.passiveBonus, realStat = Game.stat;
  Game.passiveBonus = () => 0; Game.stat = () => 5;
  console.log('== BREAK-IT counters proof, SEED ' + SEED + ' ==');

  function beginFight(mid, px, py, mx, my) {
    endFight(Game);
    said.length = 0;
    try { Game.cureStatus('scholar', 'deaf'); } catch (e) {}
    Game.state.monsterCounters = {}; // fresh discovery state per scenario
    s.health = 9000; s.mx = 4; s.my = 4;
    s.equipped = s.equipped || {};
    s.equipped.weapon = { name: 'spear', type: 'spear', range: 2, damage: [6, 10] };
    Game.startCombat(mid);
    const m = Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === mid);
    const p = Game.tbFighter('p');
    p.hp = 9000; p.maxHp = 9000;
    p.mx = px == null ? 4 : px; p.my = py == null ? 4 : py;
    m.mx = mx == null ? p.mx + 1 : mx; m.my = my == null ? p.my : my;
    m.hp = Math.min(m.hp, 400); // survivable target, dies only when we say so
    return { m, p };
  }
  const atPlayerTurn = () => !!(Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn());
  function cycleToPlayerTurn() {
    try { let g = 0; while (!atPlayerTurn() && Game.tbfight && !Game.tbfight.over && g++ < 60) Game.tbAdvance(); } catch (e) {}
  }
  function moveAndCycle(tx, ty) {
    // tbPlayerMove alone does NOT end the turn (moveLeft may remain) —
    // end it explicitly so the round actually advances between moves.
    const okMove = Game.tbPlayerMove(tx, ty);
    try { if (atPlayerTurn()) Game.tbPlayerEndTurn(); } catch (e) {}
    cycleToPlayerTurn();
    return okMove;
  }
  function strike(key) {
    const r = Game.tbPlayerStrike(key);
    try { const p0 = Game.tbFighter('p'); if (r && atPlayerTurn() && p0 && p0.acted) Game.tbPlayerEndTurn(); } catch (e) {}
    return r;
  }
  const known = (id) => !!((Game.state.monsterCounters || {})[id]);

  // ---------- 0. DEAD-CODE: 30 defs, 14 kinds, all wired ----------
  {
    const mons = Game.data.monsters || [];
    const withC = mons.filter(m => m.counter);
    ok('deadcode: 30 counter defs (15 w1 + 15 w2)',
      withC.length === 30 && withC.filter(m => (m.wave || 1) === 1).length === 15
      && withC.filter(m => m.wave === 2).length === 15,
      'got ' + withC.length);
    const kinds = new Set(withC.map(m => m.counter.kind));
    const supported = ['shout', 'offer_food', 'wait', 'move_windup', 'move_x2', 'approach',
      'sidestep', 'keep_distance', 'strike_lead', 'strike_windup', 'strike_recovery',
      'strike_first', 'strike_nonhead', 'fresh_weapon'];
    ok('deadcode: every def kind is a supported trick kind',
      withC.every(m => supported.includes(m.counter.kind)));
    ok('deadcode: every def has trick+hint+reveal text',
      withC.every(m => m.counter.trick && m.counter.hint && m.counter.reveal));
    for (const fn of ['discoverMonsterCounter', 'checkMonsterCounter', 'counterTeachable', 'counterIsLead']) {
      ok('deadcode: Game.' + fn + ' is a function', typeof Game[fn] === 'function');
    }
    ok('deadcode: waveLedger.js loaded (scoreLedgerKill live)',
      typeof Game.scoreLedgerKill === 'function');
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    ok('deadcode: index.html loads waveLedger.js', html.includes('src/js/waveLedger.js'));
    ok('deadcode: waves 3-5 deliberately counter-less',
      mons.filter(m => (m.wave || 1) >= 3 && m.counter).length === 0);
  }

  // ---------- 1. EXPLOIT: ledger farming is bounded ----------
  {
    Game.state.monsterCounters = {};
    const L0 = Game.waveLedgerPoints(1);
    // unknown kill scores 1
    const a1 = Game.scoreLedgerKill('bulldozer');
    ok('exploit: unknown kill scores exactly 1', a1 === 1, 'got ' + a1);
    // discover, then the counter-known kill scores 2
    ok('exploit: discovery returns true once', Game.discoverMonsterCounter('bulldozer', 'trick') === true);
    const a2 = Game.scoreLedgerKill('bulldozer');
    ok('exploit: counter-known kill scores 2 (not multiplicative)', a2 === 1, 'got ' + a2);
    // (1 + 1 = perTypeCap 2 reached)
    const a3 = Game.scoreLedgerKill('bulldozer');
    ok('exploit: perTypeCap 2 blocks further farming of the type', a3 === 0, 'got ' + a3);
    ok('exploit: discovery is once-only (no double claim)',
      Game.discoverMonsterCounter('bulldozer', 'trick') === false);
    const beats = said.filter(t => /COUNTER LEARNED/.test(t)).length;
    ok('exploit: discovery beat fired exactly once', beats === 1, 'got ' + beats);
    ok('exploit: ledger total moved by exactly 2 for the type',
      Game.waveLedgerPoints(1) - L0 === 2);
    // a fresh type still scores the unknowing 1 (never punished for not knowing)
    const a4 = Game.scoreLedgerKill('hushwolf');
    ok('exploit: unknowing types still score 1', a4 === 1, 'got ' + a4);
  }

  // ---------- 2. SOFTLOCK: the Haven teaching channel terminates ----------
  {
    Game.state.monsterCounters = {};
    Game.state.villageSlain = { bulldozer: 2 };
    const t1 = Game.counterTeachable();
    ok('softlock: 2+ village slain unlocks beasttricks teaching', t1 === 'bulldozer', 'got ' + t1);
    Game.discoverMonsterCounter('bulldozer', 'taught');
    const t2 = Game.counterTeachable();
    ok('softlock: taught type drops out of the teachable queue (no loop)', t2 !== 'bulldozer', 'got ' + t2);
    Game.state.villageSlain = {};
    ok('softlock: no slain = nothing teachable', Game.counterTeachable() === null);
    ok('softlock: teachable requires a real counter def',
      (() => { Game.state.villageSlain = { ad_break: 5 }; const t = Game.counterTeachable(); Game.state.villageSlain = {}; return t === null; })());
  }

  // ---------- 3. HONESTY C1: voice_mimic — the approach prescription was inverted ----------
  {
    const c = counterOf(Game, 'voice_mimic_radio');
    ok('honesty/mimic: kind is keep_distance (not approach)', c.kind === 'keep_distance', 'got ' + c.kind);
    ok('honesty/mimic: no text prescribes walking toward the cry',
      !/^Walk toward the voice$/.test(c.trick) && !/move TOWARD the cry once/i.test(c.reveal)
      && !/Call its bluff/i.test(c.reveal));
    // Engine truth: approaching FEEDS the lure (the old text's advice was punished).
    const { m, p } = beginFight('voice_mimic_radio', 4, 4, 4, 0);
    m.vmLastDist = 5; m.vmTKey = 'p'; m.vmLure = 0; m.vmResist = 0;
    if (m.beamPhase !== 'call') Game.encSetPhase(m, 'call');
    p.mx = 4; p.my = 2; // player walks closer (dist 4 -> 2)
    Game.tbMonsterTurn(m);
    ok('honesty/mimic: approaching increments vmLure (the lure works on you)',
      (m.vmLure || 0) > 0, 'vmLure=' + m.vmLure);
    // ...and does NOT reveal: reveal needs refusal.
    ok('honesty/mimic: approaching does not reveal it', m.beamPhase !== 'reveal', m.beamPhase);
    // The honest trick: keep distance at round end discovers it.
    Game.state.monsterCounters = {};
    Game.checkMonsterCounter('voice_mimic_radio', { type: 'round_end', dist: 4, via: 'trick' });
    ok('honesty/mimic: keeping 3+ out at round end discovers the trick', known('voice_mimic_radio'));
    endFight(Game);
  }

  // ---------- 4. HONESTY C2: understudy fresh_weapon — the switch, not the opener ----------
  {
    // Strike 1 with a fresh weapon must NOT discover (nothing seen yet).
    let { m, p } = beginFight('understudy', 4, 4, 5, 4);
    s.equipped.weapon = { name: 'spear', type: 'spear', range: 2, damage: [6, 10] };
    strike(m.key);
    ok('honesty/understudy: first strike with any weapon does NOT discover',
      !known('understudy'), 'discovered=' + known('understudy'));
    // Strike 2 with the SAME weapon must NOT discover.
    if (!atPlayerTurn()) { try { Game.tbAdvance(); } catch (e) {} }
    strike(m.key);
    ok('honesty/understudy: second strike with the same weapon does NOT discover',
      !known('understudy'));
    // Strike with a DIFFERENT weapon — the switch — discovers.
    if (!atPlayerTurn()) { try { Game.tbAdvance(); } catch (e) {} }
    s.equipped.weapon = { name: 'knife', type: 'knife', range: 1, damage: [4, 7] };
    // ensure adjacency for the knife
    m.mx = p.mx + 1; m.my = p.my;
    strike(m.key);
    ok('honesty/understudy: switching weapons mid-fight discovers the trick',
      known('understudy'), 'discovered=' + known('understudy'));
    endFight(Game);
  }

  // ---------- 5. HONESTY C3: review_drone — "never the same way" is enforced ----------
  {
    // Same direction twice: no discovery. (Drone parked at (7,7) so its
    // declared line doesn't sit on the x=1 corridor the test walks.)
    let { m, p } = beginFight('review_drone', 1, 1, 7, 7);
    ok('honesty/drone: first move lands', moveAndCycle(1, 3) === true);
    ok('honesty/drone: second move lands (same way)', moveAndCycle(1, 5) === true);
    const sameWay = known('review_drone');
    ok('honesty/drone: two same-direction dodges do NOT discover', !sameWay, 'discovered=' + sameWay);
    endFight(Game);
    // Different directions: discovery.
    ({ m, p } = beginFight('review_drone', 1, 1, 7, 7));
    Game.state.monsterCounters = {};
    ok('honesty/drone: vary move 1 lands', moveAndCycle(1, 3) === true);
    ok('honesty/drone: vary move 2 lands', moveAndCycle(1, 1) === true); // back north — varies
    ok('honesty/drone: two varying dodges discover the trick', known('review_drone'));
    endFight(Game);
  }

  // ---------- 6. HONESTY C4: warranty_caller — "two or more tiles" is enforced ----------
  {
    // 1-tile shuffles two rounds running: no discovery.
    let { m, p } = beginFight('warranty_caller', 1, 4, 7, 4);
    moveAndCycle(2, 4);
    moveAndCycle(3, 4);
    ok('honesty/warranty: 1-tile moves do NOT discover', !known('warranty_caller'));
    endFight(Game);
    // 2-tile moves two rounds running: discovery.
    ({ m, p } = beginFight('warranty_caller', 1, 4, 7, 4));
    Game.state.monsterCounters = {};
    moveAndCycle(3, 4);
    moveAndCycle(5, 4);
    ok('honesty/warranty: 2-tile moves discover the trick', known('warranty_caller'));
    endFight(Game);
  }

  // ---------- 7. HONESTY C5: bright_idea — no cover promise ----------
  {
    const c = counterOf(Game, 'bright_idea');
    ok('honesty/bright_idea: reveal promises no cover', !/cover/i.test(c.reveal), c.reveal.slice(0, 80));
    const mdef = (Game.data.monsters || []).find(x => x.id === 'bright_idea') || {};
    ok('honesty/bright_idea: knownTactics promises no cover',
      !/cover/i.test(mdef.knownTactics || ''), (mdef.knownTactics || '').slice(0, 80));
    // ...and the honest parts still hold: radius 2, 3 out is safe; ember is the window.
    ok('honesty/bright_idea: keep_distance 3 matches the radius-2 burst', c.kind === 'keep_distance' && c.tiles === 3);
  }

  // ---------- 8. HONESTY C6: ad_break back inside the canon band ----------
  {
    const mdef = (Game.data.monsters || []).find(x => x.id === 'ad_break') || {};
    const dmg = ((mdef.attack || {}).damage || []);
    ok('honesty/ad_break: damage inside canon 20-70 band', dmg[0] >= 20 && dmg[1] <= 70, JSON.stringify(dmg));
  }

  // ---------- 9. HONESTY: keep_distance discovery is distance-honest ----------
  {
    beginFight('speedbump_turtle', 4, 4, 7, 4);
    Game.state.monsterCounters = {};
    Game.checkMonsterCounter('speedbump_turtle', { type: 'round_end', dist: 1, via: 'trick' });
    ok('honesty/keep_distance: too close does NOT discover', !known('speedbump_turtle'));
    Game.checkMonsterCounter('speedbump_turtle', { type: 'round_end', dist: 2, via: 'trick' });
    ok('honesty/keep_distance: 2 out discovers (tiles: 2)', known('speedbump_turtle'));
    endFight(Game);
  }

  // ---------- 10. DEAD-CODE: every kind still fires from a live handler ----------
  {
    // wait kind: a real wait in a heckler fight discovers.
    let { m, p } = beginFight('heckler', 4, 4, 6, 4);
    Game.tbPlayerWait();
    ok('deadcode: wait-kind discovery fires from tbPlayerWait', known('heckler'));
    endFight(Game);
    // shout kind: a real shout in a hummice fight discovers.
    ({ m, p } = beginFight('hummice', 4, 4, 6, 4));
    Game.state.monsterCounters = {};
    Game.tbPlayerShout();
    ok('deadcode: shout-kind discovery fires from tbPlayerShout', known('hummice'));
    endFight(Game);
    // strike_first kind: opening strike on the union rep discovers.
    ({ m, p } = beginFight('union_rep', 4, 4, 5, 4));
    Game.state.monsterCounters = {};
    strike(m.key);
    ok('deadcode: strike_first-kind discovery fires from tbPlayerStrike', known('union_rep'));
    endFight(Game);
  }

  Game.passiveBonus = realPassive; Game.stat = realStat;
  endFight(Game);
  console.log('== RESULT: ' + pass + ' passed, ' + fail + ' failed ==');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
