#!/usr/bin/env node
// test-tricksurvive-20261017.js — proof record for the sim-tricksurvive arm
// (flesh-out loop, axis scale-onramp, finding #433's named next: a
// performer-survival arm — can the trick-user live to land the kill?).
//
// Policy-side ONLY: scripts/policies/tricksurvive.js. ZERO src/js, ZERO
// other scripts/policies changes.
//
// Sections:
//   RED    — gate OFF: unit reads + the new behavior is ABSENT (yield never
//            fires, no assembly) + det-gate byte-identical trajectories.
//   GREEN  — gate ON: knowledge-gated party assembly (invites the strongest
//            combat-capable villager; nothing when unknown); post-
//            performance yield fires on a real TB fight (scholar waits,
//            handled); the landed tricktag channel attributes a
//            companion-finished kill by=<vid> via='companion' WITH the trick
//            summary; negatives (hurt scholar, no companion, full-hp
//            monster all fall through to the base).
//   SMOKE  — 20d pre-seat run with TRICKSURVIVE=1 completes.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it); child processes for process isolation (never two harnesses in
// one process); no Game.save stub; no hardcoded absolute paths (ROOT
// derived from __dirname); loads via sim-harness.js; no concurrent jest.
'use strict';
const fs = require('fs');
const path = require('path');
// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (TRICKSURVIVE_KILLED=1
// set by the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1). (Precedent: test-arming-20261016.js.)
if (!fs.existsSync(path.join(__dirname, 'policies', 'tricksurvive.js'))) {
  if (process.env.TRICKSURVIVE_KILLED === '1') {
    console.log('INFO-SKIP: tricksurvive layer deleted per kill protocol (sim-tricksurvive PRIMARY NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/tricksurvive.js missing and TRICKSURVIVE_KILLED not set.');
  process.exit(1);
}
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const TS = path.join(ROOT, 'scripts', 'policies', 'tricksurvive.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/tsv-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 900); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, {
      cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, FEASTSCALE_R13: '1', SEATDRIVE: '0' },
    }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// Shared fixture: a real TB fight vs hushwolf with a villager beside the
// scholar (positioned within 4 so the engine's proximity join fires) and in
// the party (so the yield's engagedCompanions read sees them). Returns
// { vid, mf } and leaves it the PLAYER's turn, round 2.
const FIGHT_FIXTURE = `
  const vid = (Game.state.village.roster || []).find(id => id && id !== Game.villagerId);
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  Game.state.village.positions = Game.state.village.positions || {};
  Game.state.village.positions[vid] = { mx: 4, my: 4 };
  Game.state.village.party = [vid];
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 50;
  Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[vid] = 100;
  Game.startCombat('hushwolf');
  const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
  const vf = Game.tbfight.fighters.find(x => x.villagerId === vid);
  const p = Game.tbFighter('p');
  // the scholar performs the trick for real: strike the lead
  const hitRet = Game.checkMonsterCounter('hushwolf', { type: 'strike', target: mf, via: 'trick' });
  const perfs = (Game.tbfight.trickLogByMid || {}).hushwolf || [];
  mf.hp = Math.floor((mf.maxHp || 60) * 0.3); // half-dead: the kill is yieldable
  p.hp = 85; p.maxHp = 100;                  // healthy: luxury discipline fires
  Game.tbfight.round = 2;
  Game.tbfight.turnIdx = Game.tbfight.order.indexOf('p');
`;

// ---------- RED ----------
console.log('== RED ==');
{
  // 1. unit: wave-1/2 trick-bearing species read
  const o = gameEval(3701, `
    const TS = require('${TS}');
    const r = {};
    const mids = TS.trickBearingMids(Game);
    r.n = mids.length;
    r.hushwolf = mids.includes('hushwolf');
    r.belltoad = mids.includes('belltoad');
    r.ducks = mids.includes('ducks_in_a_row');
    r.redactor = mids.includes('redactor'); // wave 3: counter-less by design, must be OUT
    r.allW12 = mids.every(mid => {
      const d = Game.data.monsters.find(m => m.id === mid);
      return d && d.counter && (d.wave || 1) <= 2;
    });
    r.knownClosed = TS.trickKnowledgeOpen(Game) === false; // fresh game: nothing known
    // combatCapable: gear, not optimism
    const vid = (Game.state.village.roster || []).find(id => id && id !== Game.villagerId);
    const vp = Game.vpOf(vid) || {};
    r.ccBare = TS.combatCapable(Game, vid) === false;
    vp.equipped = Object.assign({}, vp.equipped, { melee: { itemId: 'fire_hardened_spear' } });
    r.ccArmed = TS.combatCapable(Game, vid) === true;
    out.r = r;
  `);
  if (o.__err) console.log('  red-unit err: ' + o.__err);
  const r = o.r || {};
  ok(r.n >= 10, `trick-bearing wave-1/2 species enumerated (n=${r.n})`);
  ok(r.hushwolf && r.belltoad && r.ducks, 'includes hushwolf / belltoad / ducks_in_a_row');
  ok(r.redactor === false, 'wave-3 redactor excluded (counter-less by design)');
  ok(r.allW12 === true, 'every listed species is wave<=2 with a counter kind');
  ok(r.knownClosed === true, 'trickKnowledgeOpen false on a fresh game (knowledge gate closed)');
  ok(r.ccBare === true, 'combatCapable false for an unarmed villager');
  ok(r.ccArmed === true, 'combatCapable true once a spear is equipped');

  // 2. RED: gate OFF — yield never fires even in a yield-ready fight
  const o2 = gameEval(3702, `
    const TS = require('${TS}');
    ${FIGHT_FIXTURE}
    const r = {};
    r.perfReg = perfs.length === 1 && hitRet === true;
    r.companionIn = !!vf && vf.alive === true;
    const ctx = {};
    const handled = TS.tricksurviveLead.fight(Game, ctx);
    r.handled = handled === true;         // the BASE handled the turn (struck)
    r.noYield = ctx.tsYields == null;     // the yield never fired
    out.r = r;
  `);
  if (o2.__err) console.log('  red-yield err: ' + o2.__err);
  const r2 = o2.r || {};
  ok(r2.perfReg === true, 'RED fixture: scholar performance registered in trickLogByMid');
  ok(r2.companionIn === true, 'RED fixture: villager joined the real fight');
  ok(r2.handled === true && r2.noYield === true, 'RED: gate OFF — yield absent, base fight handled the turn');

  // 3. RED: gate OFF — no assembly even with knowledge open
  const o3 = gameEval(3703, `
    const TS = require('${TS}');
    const r = {};
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    Game.state.monsterCounters.belltoad = true; // knowledge OPEN
    r.gateOpen = TS.trickKnowledgeOpen(Game) === true;
    const vid = (Game.state.village.roster || []).find(id => id && id !== Game.villagerId);
    const vp = Game.vpOf(vid) || {};
    vp.equipped = Object.assign({}, vp.equipped, { melee: { itemId: 'fire_hardened_spear' } });
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 50;
    Game.state.village.health = Game.state.village.health || {};
    Game.state.village.health[vid] = 100;
    Game.map.px = Game.state.village.px != null ? Game.state.village.px : 4;
    Game.map.py = Game.state.village.py != null ? Game.state.village.py : 4;
    let inviteCalls = 0;
    const origInvite = Game.inviteToParty.bind(Game);
    Game.inviteToParty = (id) => { inviteCalls++; return origInvite(id); };
    const ctx = {};
    TS.tricksurviveLead.daily(Game, ctx);
    r.inviteCalls = inviteCalls;
    r.noInvite = ctx.tsInvitesOk == null;
    out.r = r;
  `);
  if (o3.__err) console.log('  red-assembly err: ' + o3.__err);
  const r3 = o3.r || {};
  ok(r3.gateOpen === true, 'RED fixture: knowledge gate open (belltoad discovered)');
  ok(r3.inviteCalls === 0 && r3.noInvite === true, 'RED: gate OFF — no assembly despite open knowledge');
}

// ---------- DET-GATE ----------
console.log('== DET-GATE ==');
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  const TSP = require('./policies/tricksurvive');
  async function trajectory(seed, tsOn, policyObj) {
    if (tsOn) process.env.TRICKSURVIVE = '1'; else delete process.env.TRICKSURVIVE;
    const { Game } = await loadGame({ seed, mode: 'tricksurvive-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, TSP.tricksurviveLead);
  const tOff2 = await trajectory(204, false, leadfeast);
  ok(tOff1 === tOff2 && tOff1.length > 0, `RED det-gate: gate-off tricksurvive-lead byte-identical to leadfeast (s204) len=${tOff1.length}`);
  const tOff3 = await trajectory(204, false, TSP.tricksurviveBelong);
  const tOff4 = await trajectory(204, false, belongfeast);
  ok(tOff3 === tOff4 && tOff3.length > 0, `RED det-gate: gate-off tricksurvive-belong byte-identical to belongfeast (s204) len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, TSP.tricksurviveLead);
  const tOn2 = await trajectory(204, true, TSP.tricksurviveLead);
  ok(tOn1 === tOn2 && tOn1.length > 0, 'gate-on deterministic (identical armed 60d byte-identical)');
  delete process.env.TRICKSURVIVE;

  // ---------- GREEN ----------
  console.log('== GREEN ==');
  // 4. assembly: knowledge open -> invites the strongest combat-capable villager
  {
    const o = gameEval(3704, `
      const TS = require('${TS}');
      const r = {};
      Game.state.monsterCounters = Game.state.monsterCounters || {};
      Game.state.monsterCounters.belltoad = true; // knowledge OPEN
      const roster = (Game.state.village.roster || []).filter(id => id && id !== Game.villagerId);
      const armed = roster[0], bare = roster[1];
      const vpa = Game.vpOf(armed) || {};
      vpa.equipped = Object.assign({}, vpa.equipped, { melee: { itemId: 'fire_hardened_spear' } });
      Game.state.village.trust = Game.state.village.trust || {};
      Game.state.village.health = Game.state.village.health || {};
      for (const id of [armed, bare]) { Game.state.village.trust[id] = 50; Game.state.village.health[id] = 100; }
      Game.map.px = Game.state.village.px != null ? Game.state.village.px : 4;
      Game.map.py = Game.state.village.py != null ? Game.state.village.py : 4;
      const asked = [];
      Game.inviteToParty = (id) => { asked.push(id); return { ok: true, id }; }; // forced accept: tests the protocol's choice
      const ctx = {};
      TS.tricksurviveLead.daily(Game, ctx);
      r.invitesOk = ctx.tsInvitesOk || 0;
      r.askedArmedFirst = asked[0] === armed;
      r.askedBare = asked.includes(bare);
      r.oneInvite = asked.length === 1;
      out.r = r;
    `, { TRICKSURVIVE: '1' });
    if (o.__err) console.log('  green-assembly err: ' + o.__err);
    const r = o.r || {};
    ok(r.invitesOk === 1, `GREEN: knowledge open -> one combat-capable companion invited (tsInvitesOk=${r.invitesOk})`);
    ok(r.askedArmedFirst === true, 'GREEN: the protocol asked the ARMED (combat-capable) villager first');
    ok(r.askedBare !== true && r.oneInvite === true, 'GREEN: the unarmed villager was never asked; exactly one invite');
  }
  // 5. no assembly when unknown
  {
    const o = gameEval(3705, `
      const TS = require('${TS}');
      const r = {};
      r.gateClosed = TS.trickKnowledgeOpen(Game) === false;
      const roster = (Game.state.village.roster || []).filter(id => id && id !== Game.villagerId);
      const armed = roster[0];
      const vpa = Game.vpOf(armed) || {};
      vpa.equipped = Object.assign({}, vpa.equipped, { melee: { itemId: 'fire_hardened_spear' } });
      Game.state.village.trust = Game.state.village.trust || {};
      Game.state.village.health = Game.state.village.health || {};
      Game.state.village.trust[armed] = 50; Game.state.village.health[armed] = 100;
      Game.map.px = Game.state.village.px != null ? Game.state.village.px : 4;
      Game.map.py = Game.state.village.py != null ? Game.state.village.py : 4;
      let inviteCalls = 0;
      Game.inviteToParty = (id) => { inviteCalls++; return { ok: true, id }; };
      const ctx = {};
      TS.tricksurviveLead.daily(Game, ctx);
      r.inviteCalls = inviteCalls;
      out.r = r;
    `, { TRICKSURVIVE: '1' });
    if (o.__err) console.log('  green-noassembly err: ' + o.__err);
    const r = o.r || {};
    ok(r.gateClosed === true, 'GREEN fixture: knowledge gate closed (nothing known)');
    ok(r.inviteCalls === 0, `GREEN: unknown tricks -> zero invites ("If you don't know, it doesn't show", calls=${r.inviteCalls})`);
  }
  // 6. yield fires on a real fight
  {
    const o = gameEval(3706, `
      const TS = require('${TS}');
      ${FIGHT_FIXTURE}
      const r = {};
      r.perfReg = perfs.length === 1;
      r.companionIn = !!vf && vf.alive === true;
      r.playerTurn = Game.tbIsPlayerTurn() === true;
      const pIdxBefore = Game.tbfight.turnIdx;
      const ctx = {};
      const handled = TS.tricksurviveLead.fight(Game, ctx);
      r.handled = handled === true;
      r.yielded = (ctx.tsYields || 0) === 1;
      // The wait's full cycle ran: tbPlayerWait marks acted, then the engine
      // advances through the AI turns (tbBeginTurn resets the player's flags
      // — so "acted" is NOT the signal; the advanced turn is).
      try {
        r.turnAdvanced = Game.tbfight.over === true ||
          Game.tbfight.turnIdx !== pIdxBefore ||
          (Game.tbfight.round || 0) > 2;
      } catch (e) { r.turnAdvanced = false; }
      out.r = r;
    `, { TRICKSURVIVE: '1' });
    if (o.__err) console.log('  green-yield err: ' + o.__err);
    const r = o.r || {};
    ok(r.perfReg === true, 'GREEN fixture: real checkMonsterCounter hit registered the performance');
    ok(r.companionIn === true && r.playerTurn === true, 'GREEN fixture: companion in the real fight, player turn');
    ok(r.handled === true && r.yielded === true, 'GREEN: post-performance yield fires — scholar holds, turn handled');
    ok(r.turnAdvanced === true, 'GREEN: the wait advanced the fight (turn moved on or the fight resolved)');
  }
  // 7. tricktag attributes the companion-finished kill to the trick
  {
    const o = gameEval(3707, `
      const TS = require('${TS}');
      ${FIGHT_FIXTURE}
      const r = {};
      // the companion lands the killing blow through the real damage path
      const dealt = Game.tbDamage(mf.key, 99999, 'test companion strike', 'v_' + vid);
      r.stamped = mf._tbKilledBy === ('v_' + vid);
      Game.tbEnd('won');
      const wkl = Game.state.waveKillLog || [];
      const e = wkl.find(k => k.mid === 'hushwolf');
      r.entry = !!e;
      r.byComp = e && e.by === vid;
      r.viaComp = e && e.via === 'companion';
      r.trickCarried = !!(e && e.trick && /strike_lead/.test(e.trick));
      out.r = r;
    `, { TRICKSURVIVE: '1' });
    if (o.__err) console.log('  green-attr err: ' + o.__err);
    const r = o.r || {};
    ok(r.stamped === true, 'GREEN: tbDamage stamped the companion as the killing-blow source');
    ok(r.entry === true && r.byComp === true && r.viaComp === true,
      `GREEN: waveKillLog carries by=<companion vid> via='companion' (by=${r.byComp}, via=${r.viaComp})`);
    ok(r.trickCarried === true, "GREEN: the trick summary rode along on the companion's kill (tricktag channel confirmed)");
  }
  // 8. negatives: hurt scholar / no companion / full-hp monster -> base owns it
  {
    const o = gameEval(3708, `
      const TS = require('${TS}');
      const r = {};
      // (i) hurt scholar: hpPct 0.6 < 0.7 -> no yield
      { ${FIGHT_FIXTURE}
        p.hp = 60;
        const ctx = {};
        TS.tricksurviveLead.fight(Game, ctx);
        r.hurtNoYield = ctx.tsYields == null;
      }
      try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
      // (ii) no companion in the fight -> no yield
      { ${FIGHT_FIXTURE.replace(/Game\.state\.village\.positions\[vid\] = \{ mx: 4, my: 4 \};/, 'Game.state.village.positions = {};').replace(/Game\.state\.village\.party = \[vid\];/, 'Game.state.village.party = [];')}
        const solo = !Game.tbfight.fighters.some(x => x.kind === 'villager' || x.kind === 'ally');
        const ctx = {};
        TS.tricksurviveLead.fight(Game, ctx);
        r.soloFight = solo === true;
        r.soloNoYield = ctx.tsYields == null;
      }
      try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
      // (iii) monster at full hp -> no yield (this is yielding the KILL, not the fight)
      { ${FIGHT_FIXTURE}
        mf.hp = mf.maxHp || 60;
        const ctx = {};
        TS.tricksurviveLead.fight(Game, ctx);
        r.fullHpNoYield = ctx.tsYields == null;
      }
      try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
      out.r = r;
    `, { TRICKSURVIVE: '1' });
    if (o.__err) console.log('  green-neg err: ' + o.__err);
    const r = o.r || {};
    ok(r.hurtNoYield === true, 'GREEN negative: scholar at 60% HP — luxury discipline does not fire, base owns the turn');
    ok(r.soloFight === true, 'GREEN fixture: solo fight has no villager fighter');
    ok(r.soloNoYield === true, 'GREEN negative: no companion in the fight — no yield');
    ok(r.fullHpNoYield === true, 'GREEN negative: monster at full HP — no yield (finishing discipline, not fight-yielding)');
  }

  // ---------- SMOKE ----------
  console.log('== SMOKE ==');
  {
    process.env.TRICKSURVIVE = '1';
    process.env.SEATDRIVE = '0';
    process.env.FEASTSCALE_R13 = '1';
    const TS2 = require('./policies/tricksurvive');
    const { Game } = await loadGame({ seed: 3709, mode: 'tricksurvive-smoke', fullTelemetry: false });
    await setupGame(Game);
    const rr = await quietLog(async () => { return await runDays(Game, TS2.tricksurviveLead, { days: 20, sampleEvery: 30 }); });
    ok(rr && (rr.days | 0) >= 1, `20d pre-seat run with TRICKSURVIVE=1 completes (days=${rr && rr.days})`);
    delete process.env.TRICKSURVIVE; delete process.env.SEATDRIVE; delete process.env.FEASTSCALE_R13;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
