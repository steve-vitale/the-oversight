#!/usr/bin/env node
// scripts/test-perfsurvive-20261017.js — proof for the perfsurvive layer
// (flesh-out loop, finding #433 named next: trick-performer survival via
// companion screening — assembly WITHOUT the tricksurvive yield).
//
//   RED    — gate OFF: unit reads (trick-bearing species, knowledge gate,
//            combatCapable), no assembly even with knowledge open, det-gate
//            byte-identical trajectories (gate-off perfsurvive-lead vs
//            leadfeast, gate-off perfsurvive-belong vs belongfeast).
//   GREEN  — gate ON: knowledge open -> asks the strongest combat-capable
//            villager exactly once (inviteToParty mocked forced-accept, the
//            tricksurvive precedent — tests the protocol's choice); knowledge
//            closed -> zero asks; on a REAL startCombat fight the companion
//            is in the fight and the scholar's turn is handled by the BASE
//            (strike flow intact — no yield); negatives (no combat-capable
//            candidate, need already met -> silence).
//   SMOKE  — 20d pre-seat run with PERFSURVIVE=1 completes.
//
// The real inviteToParty verb (unlock gates, probabilistic acceptance) is
// engine code, not this layer's — the layer calls it and honors r.ok. The
// live sweep is the real-verb proof (invitesOk counts real accepts).
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it); child processes for process isolation (never two harnesses in
// one process); no Game.save stub; no hardcoded absolute paths (ROOT
// derived from __dirname); loads via sim-harness.js; no concurrent jest.
'use strict';
const fs = require('fs');
const path = require('path');
// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (PERFSURVIVE_KILLED=1
// set by the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1). (Precedent: test-tricksurvive-20261017.js,
// test-arming-20261016.js.)
if (!fs.existsSync(path.join(__dirname, 'policies', 'perfsurvive.js'))) {
  if (process.env.PERFSURVIVE_KILLED === '1') {
    console.log('INFO-SKIP: perfsurvive layer deleted per kill protocol (sim-perfsurvive PRIMARY NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/perfsurvive.js missing and PERFSURVIVE_KILLED not set.');
  process.exit(1);
}
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const PS = path.join(ROOT, 'scripts', 'policies', 'perfsurvive.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/psv-synth-' + seed + '-' + process.pid + '.js';
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

// Shared fixture: haven, day 10, one armed + one unarmed villager, trust 50.
// The invite verb is MOCKED (forced accept + party push, recording asks) —
// the tricksurvive precedent: this tests the protocol's choice, not the
// engine verb's probabilistic acceptance.
const HAVEN_FIXTURE = `
  const PS = require('${PS}');
  Game.state.monsterCounters = Game.state.monsterCounters || {};
  Game.state.scholar.day = 10;
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  const roster = (Game.state.village.roster || []).filter(id => id && id !== Game.villagerId);
  const armed = roster[0], bare = roster[1];
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[armed] = 50; Game.state.village.trust[bare] = 50;
  Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[armed] = 100; Game.state.village.health[bare] = 100;
  const vpaFix = Game.vpOf(armed) || {};
  vpaFix.equipped = Object.assign({}, vpaFix.equipped, { melee: { itemId: 'fire_hardened_spear' } });
  Game.state.village.party = [];
  const asked = [];
  Game.inviteToParty = (id) => { asked.push(id); Game.state.village.party.push(id); return { ok: true, id }; };
  const atHaven = Game.playerAtHaven();
`;

(async () => {
// ---------- RED ----------
console.log('== RED ==');
{
  // 1. unit: wave-1/2 trick-bearing species read
  const o = gameEval(9931, `
    ${HAVEN_FIXTURE}
    const r = {};
    const mids = PS.trickBearingMids(Game);
    r.n = mids.length;
    r.hushwolf = mids.includes('hushwolf');
    r.belltoad = mids.includes('belltoad');
    r.ducks = mids.includes('ducks_in_a_row');
    r.redactor = mids.includes('redactor'); // wave 3: counter-less by design, must be OUT
    r.allW12 = mids.every(mid => {
      const d = Game.data.monsters.find(m => m.id === mid);
      return d && d.counter && (d.wave || 1) <= 2;
    });
    r.knownClosed = PS.trickKnowledgeOpen(Game) === false; // fresh game: nothing known
    r.ccBare = PS.combatCapable(Game, bare) === false;
    r.ccArmed = PS.combatCapable(Game, armed) === true;
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
}
{
  // 2. RED: gate OFF — no assembly even with knowledge open
  const o = gameEval(9932, `
    ${HAVEN_FIXTURE}
    const r = {};
    Game.state.monsterCounters.belltoad = true; // knowledge OPEN
    r.gateOpen = PS.trickKnowledgeOpen(Game) === true;
    const ctx = {};
    PS.perfsurviveLead.daily(Game, ctx); // gate OFF: pure delegation
    r.noInvite = ctx.psInvitesOk == null && asked.length === 0;
    out.r = r;
  `);
  if (o.__err) console.log('  red-asm err: ' + o.__err);
  const r = o.r || {};
  ok(r.gateOpen === true, 'RED fixture: knowledge gate open (belltoad discovered)');
  ok(r.noInvite === true, 'RED: gate OFF — no assembly despite open knowledge');
}
{
  // 3. det-gate: gate-off trajectories byte-identical to the base policies
  const { dayHash } = require('./det-gate');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  const PSP = require('./policies/perfsurvive');
  async function trajectory(seed, psOn, policyObj) {
    if (psOn) process.env.PERFSURVIVE = '1'; else delete process.env.PERFSURVIVE;
    const { Game } = await loadGame({ seed, mode: 'perfsurvive-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, PSP.perfsurviveLead);
  const tOff2 = await trajectory(204, false, leadfeast);
  ok(tOff1 === tOff2 && tOff1.length > 0, `RED det-gate: gate-off perfsurvive-lead byte-identical to leadfeast (s204) len=${tOff1.length}`);
  const tOff3 = await trajectory(204, false, PSP.perfsurviveBelong);
  const tOff4 = await trajectory(204, false, belongfeast);
  ok(tOff3 === tOff4 && tOff3.length > 0, `RED det-gate: gate-off perfsurvive-belong byte-identical to belongfeast (s204) len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, PSP.perfsurviveLead);
  const tOn2 = await trajectory(204, true, PSP.perfsurviveLead);
  ok(tOn1 === tOn2 && tOn1.length > 0, 'gate-on deterministic (identical armed 60d byte-identical)');
  delete process.env.PERFSURVIVE;
}

// ---------- GREEN ----------
console.log('== GREEN ==');
{
  // 4. assembly: knowledge open -> asks the strongest combat-capable villager, exactly once
  const o = gameEval(9933, `
    ${HAVEN_FIXTURE}
    const r = {};
    Game.state.monsterCounters.belltoad = true; // knowledge OPEN
    const ctx = {};
    PS.perfsurviveLead.daily(Game, ctx);
    r.invitesOk = ctx.psInvitesOk || 0;
    r.askedArmedFirst = asked[0] === armed;
    r.askedBare = asked.includes(bare);
    r.oneAsk = asked.length === 1;
    // second day: need already met (armed walks with us) -> silence
    Game.state.scholar.day = 11;
    const ctx2 = {};
    PS.perfsurviveLead.daily(Game, ctx2);
    r.secondDaySilent = asked.length === 1 && ctx2.psInvitesOk == null;
    out.r = r;
  `, { PERFSURVIVE: '1' });
  if (o.__err) console.log('  green-asm err: ' + o.__err);
  const r = o.r || {};
  ok(r.invitesOk === 1, `GREEN: knowledge open -> one combat-capable companion invited (psInvitesOk=${r.invitesOk})`);
  ok(r.askedArmedFirst === true, 'GREEN: the ARMED villager was asked first (strongest first)');
  ok(r.askedBare !== true && r.oneAsk === true, 'GREEN: the unarmed villager was never asked; exactly one ask');
  ok(r.secondDaySilent === true, 'GREEN: need met — silence while the companion walks with us');
}
{
  // 5. knowledge closed -> zero asks (gate ON)
  const o = gameEval(9934, `
    ${HAVEN_FIXTURE}
    const r = {};
    r.gateClosed = PS.trickKnowledgeOpen(Game) === false;
    const ctx = {};
    PS.perfsurviveLead.daily(Game, ctx);
    r.noAsk = asked.length === 0 && ctx.psInvitesOk == null;
    out.r = r;
  `, { PERFSURVIVE: '1' });
  if (o.__err) console.log('  green-closed err: ' + o.__err);
  const r = o.r || {};
  ok(r.gateClosed === true, 'GREEN fixture: knowledge gate closed (nothing known)');
  ok(r.noAsk === true, 'GREEN: knowledge closed -> zero asks ("If you don\'t know, it doesn\'t show")');
}
{
  // 6. real fight: companion in the fight, scholar's turn handled by the BASE (no yield)
  const o = gameEval(9935, `
    ${HAVEN_FIXTURE}
    const r = {};
    Game.state.village.party = [armed]; // the screen walks with the scholar
    Game.state.village.positions = Game.state.village.positions || {};
    Game.state.village.positions[armed] = { mx: 4, my: 4 };
    Game.startCombat('hushwolf');
    const vf = Game.tbfight.fighters.find(x => x.villagerId === armed);
    r.companionInFight = !!(vf && vf.alive);
    Game.tbfight.turnIdx = Game.tbfight.order.indexOf('p');
    const p = Game.tbFighter('p');
    const actedBefore = p.acted;
    const ctx = {};
    PS.perfsurviveLead.fight(Game, ctx); // pure delegation — the base decides
    r.scholarActed = (p.acted !== actedBefore) || (Game.tbfight.turnIdx !== Game.tbfight.order.indexOf('p'));
    r.noYieldFlag = ctx.psYields == null; // there is no yield in this layer
    out.r = r;
  `, { PERFSURVIVE: '1' });
  if (o.__err) console.log('  green-fight err: ' + o.__err);
  const r = o.r || {};
  ok(r.companionInFight === true, 'GREEN: companion joined the real TB fight (proximity join)');
  ok(r.scholarActed === true, 'GREEN: the base handled the scholar\'s turn (strike flow intact — no yield)');
  ok(r.noYieldFlag === true, 'GREEN: no yield machinery in this layer');
}
{
  // 7. negatives: no combat-capable candidate -> silence, no crash
  const o = gameEval(9936, `
    ${HAVEN_FIXTURE}
    const r = {};
    Game.state.monsterCounters.belltoad = true;
    vpaFix.equipped = {}; // disarm the armed one: nobody combat-capable
    const ctx = {};
    PS.perfsurviveLead.daily(Game, ctx);
    r.silent = asked.length === 0 && ctx.psInvitesOk == null;
    r.noCrash = true;
    out.r = r;
  `, { PERFSURVIVE: '1' });
  if (o.__err) console.log('  green-neg err: ' + o.__err);
  const r = o.r || {};
  ok(r.silent === true && r.noCrash === true, 'GREEN negative: no combat-capable candidate -> silence, no crash');
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const PSP = require('./policies/perfsurvive');
  process.env.PERFSURVIVE = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed: 9937, mode: 'perfsurvive-smoke', fullTelemetry: false });
  await setupGame(Game);
  let res = null;
  await quietLog(async () => { res = await runDays(Game, PSP.perfsurviveLead, { days: 20, sampleEvery: 10 }); });
  delete process.env.PERFSURVIVE; delete process.env.SEATDRIVE; delete process.env.FEASTSCALE_R13;
  ok(res && res.days >= 20, `SMOKE: 20d pre-seat run with PERFSURVIVE=1 completes (days=${res && res.days})`);
}

console.log(`\nperfsurvive proof: ${pass} pass, ${fail} fail`);
if (fail) { console.log('FAILURES: ' + fails.join(' | ')); process.exit(1); }
})().catch(e => { console.error('proof crashed: ' + e); process.exit(1); });
