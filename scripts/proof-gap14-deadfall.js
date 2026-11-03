#!/usr/bin/env node
// proof-gap14-deadfall.js — gap-batch item 14: the competent policy must
// assign the 'deadfall' duty (it never did: journey-scale r61-r73, 0 duty
// lines on every seed). Before/after on identical seeds, same harness,
// only the policy file differs: BEFORE = the master competent.js (no
// deadfall staffing path), AFTER = this tree's competent.js (counterPlay
// -> staffDeadfallDuty, fish-crew shape, deadfall-b thresholds 6/2).
//
// Parts: (a) fake-Game fixture for staffDeadfallDuty's guards (free-only,
// pile cap, want cap, refusal walk-down, at-Haven gate); (b) live forced
// staffing per seed (fresh game, pile 0, no assignments -> staffed +
// a resolution grows the pile); (c) natural runDays panel (identical
// seeds/days) counting staffed assignments, observed deadfall
// assignments, engine hauls, and fish/cook staffing as the regression
// check (fish and cook run BEFORE deadfall in counterPlay, so deadfall
// takes only leftover hands).
//
// Usage: node scripts/proof-gap14-deadfall.js
//   SEEDS=85101,85102 DAYS=30 node scripts/proof-gap14-deadfall.js
//   POLICY_FILE=<path> PROOF_ARM=after node scripts/proof-gap14-deadfall.js
//     (child mode: prints one JSON line to stdout, progress to stderr)
// Writes nothing into the repo; child output is stdout JSON only.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const MAIN_REPO = path.resolve(REPO, '..', '..', 'the-scattering');
const POLICY_AFTER = path.join(REPO, 'scripts', 'policies', 'competent.js');
const POLICY_BEFORE = path.join(MAIN_REPO, 'scripts', 'policies', 'competent.js');
const SEEDS = (process.env.SEEDS || '85101,85102,85103,85104').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '30', 10) || 30;

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function fakeGame(opts) {
  const asg = Object.assign({}, opts.assignments || {});
  const calls = [];
  return {
    calls, asg,
    villagerId: 'scholar',
    state: { village: { roster: opts.roster, assignments: asg } },
    getPerson: (id) => ({ id, dead: false, formerOccupation: (opts.occ || {})[id] || '' }),
    villagerCompetence: () => 1,
    playerAtHaven: () => !!opts.atHaven,
    stashState: () => ({ materials: { stick: opts.sticks } }),
    assignTask: (id, task) => {
      calls.push(id);
      if (opts.refuse && opts.refuse.includes(id)) return { ok: false };
      asg[id] = { task };
      return { ok: true };
    },
  };
}

function runFixture() {
  console.log('== fixture: staffDeadfallDuty guards (fake Game) ==');
  const after = require(POLICY_AFTER);
  check('after policy exports staffDeadfallDuty', typeof after.staffDeadfallDuty === 'function');
  const beforeSrc = fs.existsSync(POLICY_BEFORE) ? fs.readFileSync(POLICY_BEFORE, 'utf8') : '';
  check('before policy has no deadfall staffing path', beforeSrc && !beforeSrc.includes('staffDeadfallDuty') && !beforeSrc.includes("assignAnother(Game, 'deadfall'"),
    beforeSrc ? 'before file unexpectedly contains a deadfall staffing path' : 'before policy file not found at ' + POLICY_BEFORE);
  if (typeof after.staffDeadfallDuty !== 'function') return;
  const F = after.staffDeadfallDuty;
  {
    const ctx = {};
    const g = fakeGame({ roster: ['v1', 'v2', 'v3', 'v4'], assignments: { v1: { task: 'wood' } }, sticks: 0, atHaven: true, occ: { v2: 'forager', v3: 'carpenter' } });
    const n = F(g, ctx);
    check('staffs to WANT=2 from free only', n === 2 && g.asg.v2 && g.asg.v2.task === 'deadfall' && g.asg.v3 && g.asg.v3.task === 'deadfall' && !g.asg.v4,
      `n=${n} asg=${JSON.stringify(g.asg)}`);
    check('ctx.deadfallStaffed counts staffed', ctx.deadfallStaffed === 2, String(ctx.deadfallStaffed));
    check('second call staffs none (already staffed)', F(g, ctx) === 0);
  }
  {
    let called = false;
    const g = fakeGame({ roster: ['v9'], sticks: 6, atHaven: true });
    g.assignTask = () => { called = true; return { ok: true }; };
    check('pile at cap staffs none', F(g, {}) === 0 && !called);
  }
  {
    const g = fakeGame({ roster: ['r1', 'r2', 'r3'], sticks: 0, atHaven: true, refuse: ['r1', 'r2'] });
    const n = F(g, {});
    // Slot 1 walks r1,r2 -> r3 (staffed); slot 2 re-walks the remaining
    // refusers r1,r2 and fails honestly — same shape as the fish loop.
    check('refusal walks down to next candidate', n === 1 && g.asg.r3 && g.asg.r3.task === 'deadfall' && g.calls.slice(0, 3).join(',') === 'r1,r2,r3',
      `n=${n} calls=${g.calls.join(',')}`);
  }
  {
    const g = fakeGame({ roster: ['r1', 'r2'], sticks: 0, atHaven: true, refuse: ['r1', 'r2'] });
    check('all-refuse staffs none', F(g, {}) === 0);
  }
  {
    const g = fakeGame({ roster: ['v1'], sticks: 0, atHaven: false });
    check('away from Haven staffs none', F(g, {}) === 0 && !g.asg.v1);
  }
}

async function runLiveForced(arm, policyFile) {
  console.log(`== live forced staffing per seed (${arm}) ==`);
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const pol = require(policyFile);
  const out = [];
  for (const seed of SEEDS) {
    if (arm === 'before') { out.push({ seed, staffed: 0, note: 'no staffDeadfallDuty export in before policy' }); continue; }
    const { Game } = await loadGame({ seed, mode: 'gap14-proof', fullTelemetry: false });
    await setupGame(Game);
    // Fresh-game trust (<20) refuses non-food work by engine design, so
    // the fixture raises trust to isolate staffing from the trust gate
    // (the panel below measures the unforced, trust-gated path).
    try {
      const v = Game.state.village || {};
      v.trust = v.trust || {};
      for (const id of (v.roster || [])) v.trust[id] = 80;
    } catch (e) {}
    const ctx = {};
    const n = pol.staffDeadfallDuty(Game, ctx);
    const asg = Game.state.village.assignments || {};
    const staffedIds = Object.keys(asg).filter(id => asg[id] && asg[id].task === 'deadfall');
    let sticksBefore = 0, sticksAfter = 0, hauled = false;
    try { sticksBefore = (Game.stashState().materials.stick || 0); } catch (e) {}
    if (staffedIds.length) {
      try { Game.resolveOneAssignment(staffedIds[0], { task: 'deadfall' }); hauled = true; } catch (e) {}
    }
    try { sticksAfter = (Game.stashState().materials.stick || 0); } catch (e) {}
    out.push({ seed, staffed: n, assigned: staffedIds.length, sticksBefore, sticksAfter, hauled });
    console.log(`  seed ${seed}: staffed=${n} assigned=${staffedIds.length} sticks ${sticksBefore}->${sticksAfter} hauled=${hauled}`);
  }
  return out;
}

async function runPanelChild(arm, policyFile) {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const pol = require(policyFile);
  const base = pol.competent;
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'gap14-panel', fullTelemetry: false });
    await setupGame(Game);
    let seenCtx = null, maxDead = 0, everDead = false, maxFish = 0, maxCook = 0;
    const sample = (Gm) => {
      const asg = (Gm.state.village || {}).assignments || {};
      let d = 0, f = 0, c = 0;
      for (const a of Object.values(asg)) {
        if (!a) continue;
        if (a.task === 'deadfall') d++;
        if (a.task === 'fish') f++;
        if (a.task === 'cook') c++;
      }
      if (d > maxDead) maxDead = d;
      if (d > 0) everDead = true;
      if (f > maxFish) maxFish = f;
      if (c > maxCook) maxCook = c;
    };
    const wrapped = Object.assign({}, base, {
      upkeep(Gm, ctx) { seenCtx = ctx; try { sample(Gm); } catch (e) {} return base.upkeep(Gm, ctx); },
      daily(Gm, ctx) { seenCtx = ctx; const r = base.daily(Gm, ctx); try { sample(Gm); } catch (e) {} return r; },
    });
    let result = null;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS }); });
    let hauls = 0;
    try { hauls = Game._deadfallHauls || 0; } catch (e) {}
    const starvDeaths = ((result.samples || {}).deaths || []).filter(d => /starv|hunger|kcal/i.test(d.cause || '')).length;
    rows.push({
      seed, endReason: result.endReason, gameDays: result.gameDays,
      deadfallStaffed: (seenCtx && seenCtx.deadfallStaffed) || 0,
      fishStaffed: (seenCtx && seenCtx.fishStaffed) || 0,
      cookStaffed: (seenCtx && seenCtx.cookStaffed) || 0,
      maxDeadfallAssigned: maxDead, everDeadfall: everDead,
      maxFishAssigned: maxFish, maxCookAssigned: maxCook,
      deadfallHauls: hauls, starvDeaths,
    });
    console.error(`  [${arm}] seed ${seed} done: ${JSON.stringify(rows[rows.length - 1])}`);
  }
  return { arm, seeds: SEEDS, days: DAYS, rows };
}

(async () => {
  const arm = process.env.PROOF_ARM;
  if (arm) {
    const policyFile = process.env.POLICY_FILE || (arm === 'before' ? POLICY_BEFORE : POLICY_AFTER);
    const out = await runPanelChild(arm, policyFile);
    console.log(JSON.stringify(out));
    return;
  }
  runFixture();
  const forcedAfter = await runLiveForced('after', POLICY_AFTER);
  check('live forced: every seed staffs >=1', forcedAfter.every(r => r.staffed >= 1),
    JSON.stringify(forcedAfter.map(r => `${r.seed}:${r.staffed}`)));
  check('live forced: a resolution grows the pile on every seed', forcedAfter.every(r => r.sticksAfter > r.sticksBefore),
    JSON.stringify(forcedAfter.map(r => `${r.seed}:${r.sticksBefore}->${r.sticksAfter}`)));
  const runArm = (a) => {
    const env = Object.assign({}, process.env, { PROOF_ARM: a, POLICY_FILE: a === 'before' ? POLICY_BEFORE : POLICY_AFTER });
    const r = spawnSync(process.execPath, [__filename], { cwd: REPO, env, encoding: 'utf8' });
    if (r.status !== 0) {
      console.log(r.stdout || '');
      console.log(r.stderr || '');
      throw new Error(`panel child ${a} exited ${r.status}`);
    }
    const lines = (r.stdout || '').trim().split('\n').filter(Boolean);
    return JSON.parse(lines[lines.length - 1]);
  };
  console.log(`== natural panel: ${SEEDS.length} seeds x ${DAYS} days, before vs after ==`);
  const before = runArm('before');
  const after = runArm('after');
  const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
  console.log(`  BEFORE staffed=${sum(before.rows, 'deadfallStaffed')} everDeadfallSeeds=${before.rows.filter(r => r.everDeadfall).length}/${before.rows.length} hauls=${sum(before.rows, 'deadfallHauls')} fish=${sum(before.rows, 'fishStaffed')} cook=${sum(before.rows, 'cookStaffed')}`);
  console.log(`  AFTER  staffed=${sum(after.rows, 'deadfallStaffed')} everDeadfallSeeds=${after.rows.filter(r => r.everDeadfall).length}/${after.rows.length} hauls=${sum(after.rows, 'deadfallHauls')} fish=${sum(after.rows, 'fishStaffed')} cook=${sum(after.rows, 'cookStaffed')}`);
  for (const r of after.rows) console.log(`  AFTER seed ${r.seed}: staffed=${r.deadfallStaffed} maxDead=${r.maxDeadfallAssigned} hauls=${r.deadfallHauls} fish=${r.fishStaffed} cook=${r.cookStaffed} end=${r.endReason} starvDeaths=${r.starvDeaths}`);
  for (const r of before.rows) console.log(`  BEFORE seed ${r.seed}: staffed=${r.deadfallStaffed} maxDead=${r.maxDeadfallAssigned} hauls=${r.deadfallHauls} fish=${r.fishStaffed} cook=${r.cookStaffed} end=${r.endReason} starvDeaths=${r.starvDeaths}`);
  check('panel: before assigns no deadfall anywhere', sum(before.rows, 'deadfallStaffed') === 0 && before.rows.every(r => !r.everDeadfall));
  check('panel: after assigns deadfall on every seed', after.rows.every(r => r.deadfallStaffed > 0 && r.everDeadfall),
    JSON.stringify(after.rows.map(r => `${r.seed}:${r.deadfallStaffed}`)));
  const fb = sum(before.rows, 'fishStaffed'), fa = sum(after.rows, 'fishStaffed');
  const cb = sum(before.rows, 'cookStaffed'), ca = sum(after.rows, 'cookStaffed');
  check('panel: fish staffing not collapsed (after >= 50% of before)', fa >= fb * 0.5, `before=${fb} after=${fa}`);
  check('panel: cook staffing not collapsed (after >= 50% of before)', ca >= cb * 0.5, `before=${cb} after=${ca}`);
  console.log(`\nproof-gap14-deadfall: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e && e.stack); process.exit(1); });
