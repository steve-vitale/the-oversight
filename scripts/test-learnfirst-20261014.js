#!/usr/bin/env node
// test-learnfirst-20261014.js — PROOF for the learn-first engagement lever (policy-side).
//
// Mechanism: the learnfirst layer (LEARNFIRST=1) runs the DPS-race assessment
// at ENGAGEMENT time — before the first committed strike — reusing the r1
// instrument math (measured dealt/strike vs taken/turn → rounds-to-kill vs
// rounds-to-die) and the r3 knowledge convention (codex → lore →
// pessimistic prior). Steve's design call (2026-10-13): default learn-first
// (observe/track/teach); engage only in an assessed party of real strength
// or when the opening damage exchange shows good odds.
//
// RED (gate off — pristine behavior pinned): a losing-race engagement is
// TAKEN — no refusal, no probe, the base fights (the r1 bug: HP-threshold
// decisions, not the damage race).
// GREEN (LEARNFIRST=1):
//   A: losing race (bare-handed vs 200-HP hushwolf, unknown species) →
//      REFUSED at fight start while healthy; the scholar walks away alive.
//   B: same losing race + 2 real allies + codex knowledge → PARTY OVERRIDE:
//      engaged (lfPartyEngaged), no refusal.
//   C: winning race (bare-handed vs 20-HP hushwolf, codex-known) → PROBE
//      then COMMIT on good measured odds (lfProbed, lfGoodOdds); monster dies.
//   D: lfProbeAssess unit cases — synthetic losing → refuse; winning/gentle/
//      unmeasured/nearly-over → commit.
//   E: learn-first stance honesty — a refused observation is TEACHABLE:
//      lfTeach writes a threat memory a villager actually holds (t2mem).
//
// Usage: node scripts/test-learnfirst-20261014.js
// Exit non-zero on any FAIL.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { learnfirst, _lf } = require('./policies/learnfirst');

function drive(Game, policy, ctx, maxCalls) {
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls++ < (maxCalls || 80) && !Game.over) {
    if (!Game.tbIsPlayerTurn()) break;
    let handled = false;
    try { handled = policy.fight(Game, ctx); }
    catch (e) { console.error('fight threw: ' + (e && e.message)); break; }
    if (!handled) break;
  }
  return calls;
}

async function scenario(o) {
  if (o.gateOn) process.env.LEARNFIRST = '1';
  else delete process.env.LEARNFIRST;
  const { Game } = await loadGame({ seed: o.seed, mode: 'learnfirst-proof' });
  await setupGame(Game);
  const ctx = {};
  const s = Game.state.scholar;
  s.health = 100; s.kcal = 2600; s.hydration = 80; s.energy = 100; s.trauma = 0;
  if (o.wildNode) { Game.map.px = o.wildNode[0]; Game.map.py = o.wildNode[1]; }
  if (o.codexKnown) {
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters[o.monsterId] = { stage: 'observed' };
  }
  Game.startCombat(o.monsterId);
  const f = Game.tbfight;
  if (!f) throw new Error('no fight started for ' + o.monsterId);
  const mo = f.fighters.find(x => x.kind === 'monster');
  mo.hp = o.monsterHp; mo.maxHp = o.monsterHp;
  const p0 = Game.tbFighter('p');
  p0.hp = 100; p0.maxHp = Math.max(p0.maxHp || 100, 100); p0.alive = true;
  if (o.scholarPos) { p0.mx = o.scholarPos[0]; p0.my = o.scholarPos[1]; }
  if (o.allies) {
    for (const a of o.allies) {
      f.fighters.push(Object.assign(
        { kind: 'villager', alive: true, fled: false, hp: 30, maxHp: 30, speed: 3, mx: 3, my: 4 }, a));
    }
  }
  return { Game, ctx, f, mo, p0 };
}

(async () => {
  let fails = 0;
  const check = (name, cond, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : ''));
    if (!cond) fails++;
  };

  // RED: gate off — pristine behavior. Losing race is TAKEN.
  // Fixture: speedbump_turtle (non-chaser) on a wild node — the cleanest
  // losing race (armor 15 eats bare-handed strikes; dmg [18,26]).
  {
    const { Game, ctx, mo } = await scenario({ seed: 11, gateOn: false, monsterId: 'speedbump_turtle', monsterHp: 60, wildNode: [3, 3] });
    drive(Game, learnfirst, ctx, 30);
    console.log('RED: lfRefused=' + (ctx.lfRefused || 0), 'lfProbed=' + (ctx.lfProbed || 0),
      'struck=' + (ctx.struck || 0), 'gameOver=' + !!Game.over);
    check('RED: gate off → no refusal (the bug: losing fight taken)', (ctx.lfRefused || 0) === 0, 'lfRefused=' + (ctx.lfRefused || 0));
    check('RED: gate off → no probe', (ctx.lfProbed || 0) === 0, 'lfProbed=' + (ctx.lfProbed || 0));
    check('RED: gate off → the base actually fights (struck>0)', (ctx.struck || 0) > 0, 'struck=' + (ctx.struck || 0));
    check('RED: gate off → layer id is learnfirst (delegation, not a different policy)', learnfirst.id === 'learnfirst');
    void mo;
  }

  // A GREEN: losing race refused at engagement, scholar disengages alive.
  // The turtle can't chase (follows:false) → the barrier push is a clean
  // getaway: the honest end-to-end refuse.
  {
    const { Game, ctx, p0 } = await scenario({
      seed: 11, gateOn: true, monsterId: 'speedbump_turtle', monsterHp: 60,
      wildNode: [3, 3], scholarPos: [4, 4],
    });
    drive(Game, learnfirst, ctx, 60);
    const d = ctx.lfFirstRefuse;
    console.log('A: lfRefused=' + (ctx.lfRefused || 0), 'firstRefuse=' + JSON.stringify(d),
      'pushes=' + (ctx.lfBarrierPushes || 0),
      'fightOver=' + (!Game.tbfight || !!Game.tbfight.over), 'gameOver=' + !!Game.over, 'php=' + Math.round(p0.hp));
    check('A: losing race refused (lfRefused>=1)', (ctx.lfRefused || 0) >= 1, 'lfRefused=' + (ctx.lfRefused || 0));
    check('A: refusal at engagement — scholar still healthy (php@refuse>50)',
      d && d.php > 50, 'php@refuse=' + (d && d.php));
    check('A: the race projection is sane (fewer rounds to die than to kill)',
      d && d.roundsToDie < d.roundsToKill, JSON.stringify(d));
    check('A: no probe on a refused race (judgment came first)', (ctx.lfProbed || 0) === 0, 'lfProbed=' + (ctx.lfProbed || 0));
    check('A: the scholar disengaged on foot (walked toward a reachable edge)',
      (ctx.lfRefuseWalks || 0) >= 1, 'lfRefuseWalks=' + (ctx.lfRefuseWalks || 0) + ' pushes=' + (ctx.lfBarrierPushes || 0));
    check('A: the fight ended (non-chaser gives up at the barrier)',
      !Game.tbfight || !!Game.tbfight.over);
    check('A: the scholar survives the walk-away', !Game.over && p0.hp > 0, 'gameOver=' + !!Game.over + ' php=' + Math.round(p0.hp));
    check('A: observation recorded (learn-first observe)', (ctx.lfObserved || 0) >= 1, 'lfObserved=' + (ctx.lfObserved || 0));
  }

  // A2 GREEN: the push branch — a CHASER (hushwolf) pursues through the
  // barrier, so the walk alone can't end it. The scholar pushes through
  // (deliberate exit), the chase plays out honestly, and Haven's gate ends
  // it. Seed-11 trace: (3,3)→push→(3,4)→push→(4,4 haven) — alive at 69 HP.
  {
    const { Game, ctx, p0 } = await scenario({
      seed: 11, gateOn: true, monsterId: 'hushwolf', monsterHp: 200,
      wildNode: [3, 3], scholarPos: [0, 4],
    });
    drive(Game, learnfirst, ctx, 30);
    console.log('A2: lfRefused=' + (ctx.lfRefused || 0), 'pushes=' + (ctx.lfBarrierPushes || 0),
      'pushFirst=' + JSON.stringify(ctx.lfPushFirst),
      'fightOver=' + (!Game.tbfight || !!Game.tbfight.over), 'gameOver=' + !!Game.over, 'php=' + Math.round(p0.hp));
    check('A2: losing race refused (lfRefused>=1)', (ctx.lfRefused || 0) >= 1, 'lfRefused=' + (ctx.lfRefused || 0));
    check('A2: the scholar pushed through the barrier (deliberate exit)',
      (ctx.lfBarrierPushes || 0) >= 1, 'lfBarrierPushes=' + (ctx.lfBarrierPushes || 0));
    check('A2: the chase resolved (fight over)', !Game.tbfight || !!Game.tbfight.over);
    check('A2: the scholar survives the chase', !Game.over && p0.hp > 0, 'gameOver=' + !!Game.over + ' php=' + Math.round(p0.hp));
  }

  // B GREEN: party override — losing solo race + real party → engaged.
  {
    const { Game, ctx } = await scenario({
      seed: 22, gateOn: true, monsterId: 'hushwolf', monsterHp: 200, codexKnown: true,
      allies: [
        { key: 'v_a1', villagerId: 'a1', name: 'Ally One', wbonus: 20 },
        { key: 'v_a2', villagerId: 'a2', name: 'Ally Two', wbonus: 20 },
      ],
    });
    // one fight() call is enough — the verdict is made at fight start
    try { learnfirst.fight(Game, ctx); } catch (e) { console.error('B fight threw: ' + e.message); }
    console.log('B: lfPartyEngaged=' + (ctx.lfPartyEngaged || 0), 'lfRefused=' + (ctx.lfRefused || 0),
      'lfProbed=' + (ctx.lfProbed || 0));
    check('B: party override engages (lfPartyEngaged>=1)', (ctx.lfPartyEngaged || 0) >= 1);
    check('B: no refusal under party override', (ctx.lfRefused || 0) === 0, 'lfRefused=' + (ctx.lfRefused || 0));
    check('B: no probe under party override (engaged outright)', (ctx.lfProbed || 0) === 0, 'lfProbed=' + (ctx.lfProbed || 0));
  }

  // B2: weak party does NOT override — one unarmed villager can't flip it.
  {
    const { Game, ctx } = await scenario({
      seed: 22, gateOn: true, monsterId: 'hushwolf', monsterHp: 200, codexKnown: true,
      allies: [{ key: 'v_a1', villagerId: 'a1', name: 'Ally One', wbonus: 0 }],
    });
    try { learnfirst.fight(Game, ctx); } catch (e) { console.error('B2 fight threw: ' + e.message); }
    console.log('B2: lfPartyEngaged=' + (ctx.lfPartyEngaged || 0), 'lfRefused=' + (ctx.lfRefused || 0));
    check('B2: a weak party does not override (no lfPartyEngaged)', (ctx.lfPartyEngaged || 0) === 0);
  }

  // C GREEN: good-odds override — winnable race → probe → measured commit.
  // Fixture: mirrormoth (solitary — no pack-break flee like the hushwolf,
  // no pack spawn like the belltoad), codex-known, 40 HP. Two probe
  // exchanges, then the verdict; the base finishes the fight.
  {
    const { Game, ctx, mo, p0 } = await scenario({
      seed: 33, gateOn: true, monsterId: 'mirrormoth', monsterHp: 40, codexKnown: true,
      wildNode: [3, 3],
    });
    drive(Game, learnfirst, ctx, 40);
    const pv = ctx._lfProbeVerdict;
    console.log('C: lfProbed=' + (ctx.lfProbed || 0), 'lfGoodOdds=' + (ctx.lfGoodOdds || 0),
      'probeVerdict=' + JSON.stringify(pv && { why: pv.why, measured: pv.measured }),
      'monsterHp=' + mo.hp, 'gameOver=' + !!Game.over);
    check('C: winnable race → probe ran (lfProbed>=1)', (ctx.lfProbed || 0) >= 1, 'lfProbed=' + (ctx.lfProbed || 0));
    check('C: good measured odds → committed (lfGoodOdds>=1)', (ctx.lfGoodOdds || 0) >= 1, 'lfGoodOdds=' + (ctx.lfGoodOdds || 0));
    check('C: the probe measured a real exchange', !!(pv && pv.measured && pv.measured.strikes >= 1),
      JSON.stringify(pv && pv.measured));
    check('C: the monster dies (committed fights still kill)', mo.hp <= 0, 'monsterHp=' + mo.hp);
    check('C: the scholar lives', !Game.over, 'gameOver=' + !!Game.over);
    void p0;
  }

  // D: lfProbeAssess unit cases — the r1 math, both directions.
  {
    const losing = _lf.lfProbeAssess({ strikes: 2, dealtPerStrike: 1, takenPerTurn: 14, remaining: 190, php: 100 });
    const winning = _lf.lfProbeAssess({ strikes: 2, dealtPerStrike: 14, takenPerTurn: 8, remaining: 40, php: 100 });
    const gentle = _lf.lfProbeAssess({ strikes: 2, dealtPerStrike: 5, takenPerTurn: 2, remaining: 100, php: 100 });
    const unmeasured = _lf.lfProbeAssess({ strikes: 0, dealtPerStrike: 0, takenPerTurn: 0, remaining: 100, php: 100 });
    const nearlyOver = _lf.lfProbeAssess({ strikes: 2, dealtPerStrike: 14, takenPerTurn: 30, remaining: 20, php: 40 });
    console.log('D:', JSON.stringify({ losing, winning, gentle, unmeasured, nearlyOver }));
    check('D: measured losing race → refuse', losing.verdict === 'refuse', JSON.stringify(losing));
    check('D: measured winning race → commit', winning.verdict === 'commit', JSON.stringify(winning));
    check('D: gentle incoming → commit (no conviction)', gentle.verdict === 'commit', JSON.stringify(gentle));
    check('D: unmeasured → commit (base decides)', unmeasured.verdict === 'commit', JSON.stringify(unmeasured));
    check('D: nearly over → commit (finish it)', nearlyOver.verdict === 'commit', JSON.stringify(nearlyOver));
  }

  // E: learn-first stance honesty — refused observations are teachable.
  // Drive the REAL internal path: judge → observe → teach.
  {
    delete process.env.LEARNFIRST;
    const { Game } = await loadGame({ seed: 44, mode: 'learnfirst-teach' });
    await setupGame(Game);
    const ctx = {};
    const atHaven = !!(Game.playerAtHaven && Game.playerAtHaven());
    check('E: scholar starts at haven (teach fixture valid)', atHaven);
    Game.startCombat('hushwolf');
    const f = Game.tbfight;
    if (!f) throw new Error('no fight for teach fixture');
    const verdict = _lf.lfEngageJudge(Game, ctx, f);
    _lf.lfObserve(Game, ctx, f, verdict); // the real observe path
    check('E: observation recorded', (ctx.lfObserved || 0) >= 1, 'lfObserved=' + (ctx.lfObserved || 0));
    const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
    const tgt = roster[0];
    const before = (tgt && Game.t2mem) ? Game.t2mem(tgt).filter(m => m.t === 'threat').length : -1;
    _lf.lfTeach(Game, ctx); // the real teach path
    const after = (tgt && Game.t2mem) ? Game.t2mem(tgt).filter(m => m.t === 'threat').length : -1;
    console.log('E: verdict=' + verdict.act, 'lfTaught=' + (ctx.lfTaught || 0), 'threatMems=' + before + '->' + after);
    check('E: teach shared the observation (lfTaught>=1)', (ctx.lfTaught || 0) >= 1, 'lfTaught=' + (ctx.lfTaught || 0));
    check('E: the warning lands where the convo system reads it (t2mem threat)',
      after > before, before + '->' + after);
    // knowledge gating: the note never uses the true name on an unobserved species
    const mems = tgt && Game.t2mem ? Game.t2mem(tgt) : [];
    const note = (mems.find(m => m.t === 'threat') || {}).note || '';
    check('E: the note is knowledge-gated (no true name leak)', !/hushwolf/i.test(note), note.slice(0, 80));
  }

  console.log(fails ? `\n${fails} FAIL(s)` : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
