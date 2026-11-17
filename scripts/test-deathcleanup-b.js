// test-deathcleanup-b.js — proof for arm sim-deathcleanup-b (BUILD).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the cleanup method exists in win-plan.js (delete own entry
// + purge the vid from every holder's party + party/hunt -> party
// fallback on empty + honest deathCleanups stat), BOTH hook sites call
// it (removeVillager's death branch in betrayal.js, AFTER the phoenix
// early-return; tbVillagerFalls in game.js, the TB funnel that bypasses
// removeVillager), registerDeath is NOT a hook site (it fires before
// removeVillager's phoenix decision — a held death must keep its plan),
// the src diff is exactly the three files, a lethal hurtVillager deletes
// the plan through the live pipeline, a tbVillagerFalls deletes it
// through the TB pipeline, the method is idempotent, and D1 determinism
// holds on the armed code (60d, seed 103231, identical full corpus) with
// a 150d live run proving the cleanup fires in sims and leaves zero
// stale refs / zero dead-holder census rows.
// Usage:
//   node scripts/test-deathcleanup-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-deadplan-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitStatus(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const srcAllowed = ['src/js/win-plan.js', 'src/js/betrayal.js', 'src/js/game.js'];
check('uncommitted src diff touches ONLY win-plan.js + betrayal.js + game.js (' + JSON.stringify(srcStatus) + ')',
  srcStatus.every(function (s) { return srcAllowed.some(function (f) { return s.indexOf(f) !== -1; }); }),
  JSON.stringify(srcStatus));
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('win-plan.js provides winPlanOnVillagerDeath',
  winPlanJs.indexOf('winPlanOnVillagerDeath(vid)') !== -1);
check('winPlanOnVillagerDeath deletes the dead holder entry',
  winPlanJs.indexOf('delete v.winPlan[vid]') !== -1);
check('exactly TWO winPlan-entry deletes exist in src/js now (table-active + death cleanup)',
  (function () {
    const re = /delete v\.winPlan\[vid\]/g;
    const hits = winPlanJs.match(re) || [];
    if (hits.length !== 2) return false;
    const first = winPlanJs.indexOf('delete v.winPlan[vid]');
    const second = winPlanJs.indexOf('delete v.winPlan[vid]', first + 1);
    // Cleanup delete: inside winPlanOnVillagerDeath (signature precedes
    // it; comment blocks make a fixed proximity window fragile).
    const sig = winPlanJs.indexOf('winPlanOnVillagerDeath(vid) {');
    const cleanupOk = sig !== -1 && sig < first && first - sig < 3000;
    // Table delete: a tableActive mention precedes it closely.
    const ctx2 = winPlanJs.slice(Math.max(0, second - 900), second + 50);
    return cleanupOk && ctx2.indexOf('tableActive') !== -1;
  })());
check('winPlanOnVillagerDeath purges the vid from every holder party + party/hunt fallback to party on empty',
  winPlanJs.indexOf("plan.party = plan.party.filter(function (pid) { return pid !== vid; })") !== -1 &&
  winPlanJs.indexOf("if (!plan.party.length && (plan.stage === 'party' || plan.stage === 'hunt')) plan.stage = 'party';") !== -1);
check('deathCleanups stat initialized in stateOf and bumped only when something was cleaned',
  winPlanJs.indexOf('deathCleanups: 0') !== -1 &&
  winPlanJs.indexOf("if (v.winPlanStats.deathCleanups == null) v.winPlanStats.deathCleanups = 0;") !== -1 &&
  winPlanJs.indexOf("if (deleted || purged > 0) bump(this, 'deathCleanups');") !== -1);
check('winPlan assignment count unchanged (3: havenTick, seed, winPlanOf)',
  (function () {
    const re = /v\.winPlan\[vid\] = /g;
    let m, n = 0;
    while ((m = re.exec(winPlanJs)) !== null) n++;
    return n === 3;
  })());
const betrayalJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'betrayal.js'), 'utf8');
check('removeVillager death branch calls winPlanOnVillagerDeath',
  (function () {
    const i = betrayalJs.indexOf("if (how === 'killed' || how === 'ambushed') {");
    if (i === -1) return false;
    const seg = betrayalJs.slice(i, i + 1500);
    return seg.indexOf('winPlanOnVillagerDeath(vid)') !== -1;
  })());
check('removeVillager hook sits AFTER the phoenix early-return (a held death keeps its plan)',
  (function () {
    const fn = betrayalJs.indexOf('removeVillager(vid, how)');
    if (fn === -1) return false;
    const seg = betrayalJs.slice(fn, fn + 12000);
    const phoenix = seg.indexOf('phoenixVillagerTrigger(vid)');
    const hook = seg.indexOf('winPlanOnVillagerDeath(vid)');
    const deadMark = seg.indexOf('rec.dead = true');
    return phoenix !== -1 && hook !== -1 && deadMark !== -1 && phoenix < deadMark && deadMark < hook;
  })());
check('removeVillager non-death removals do NOT call the cleanup (fled/exiled/splinter keep their plans)',
  (function () {
    const fn = betrayalJs.indexOf('removeVillager(vid, how)');
    const seg = betrayalJs.slice(fn, fn + 12000);
    // Count CALLS (the name also appears once in the comment above it).
    return (seg.match(/winPlanOnVillagerDeath\(vid\)/g) || []).length === 1;
  })());
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
check('tbVillagerFalls calls winPlanOnVillagerDeath (the TB funnel bypasses removeVillager)',
  (function () {
    const i = gameJs.indexOf('tbVillagerFalls(t) {');
    if (i === -1) return false;
    const seg = gameJs.slice(i, i + 1200);
    return seg.indexOf('winPlanOnVillagerDeath(t.villagerId)') !== -1;
  })());
check('tbVillagerFalls hook sits AFTER the roster-membership double-death guard',
  (function () {
    const i = gameJs.indexOf('tbVillagerFalls(t) {');
    if (i === -1) return false;
    const seg = gameJs.slice(i, i + 1200);
    const guard = seg.indexOf("if (!((v.roster || []).includes(t.villagerId))) return;");
    const hook = seg.indexOf('winPlanOnVillagerDeath(t.villagerId)');
    return guard !== -1 && hook !== -1 && guard < hook;
  })());
const corpsesJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'corpses.js'), 'utf8');
check('registerDeath is NOT a hook site (it fires before removeVillager phoenix decision)',
  corpsesJs.indexOf('winPlanOnVillagerDeath') === -1);
check('static reader check: winPlan lives only in game/agency/brain/win-plan/betrayal; standing/table clean',
  (function () {
    const s = ANALYZE.staticReaderCheck(REPO);
    return s.problems.length === 0 &&
      JSON.stringify(s.filesWithWinPlan) === JSON.stringify(['betrayal.js', 'game.js', 'villager-agency.js', 'villager-brain.js', 'win-plan.js']) &&
      s.standingTableClean === true;
  })());

// ---------- 2. Unit fixtures (live Game, no deaths) ----------
console.log('== unit fixtures ==');
async function unitFixtures() {
  const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 103231, mode: 'deathcleanup-test', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const npcs = roster.filter(function (id) { return id && id !== Game.villagerId; });
  check('fixture game has NPC villagers to plan with', npcs.length >= 8, 'npcs=' + npcs.length);
  // REGRESSION (ignition, sim-deathcleanup-b): the cleanup must NEVER
  // create the winPlan store. winPlanHavenTick gates on the store's
  // existence (`if (!v.winPlan) return null`), so materializing it on
  // a death would ignite the plan system in villages where it sleeps
  // (seed 103237: first death day 15, first plan day 16, trajectory
  // diverged day 18 with zero cleanups). Call the method with a bare
  // village object that has no winPlan key at all.
  (function () {
    const bareVillage = {};
    const r = Game.winPlanOnVillagerDeath.call({ state: { village: bareVillage } }, 'gen_nonexistent_vid');
    check('cleanup on a village with NO winPlan store is a no-op and creates NOTHING',
      r.deleted === false && r.purged === 0 &&
      !('winPlan' in bareVillage) && !('winPlanStats' in bareVillage),
      JSON.stringify(r) + ' keys=' + Object.keys(bareVillage).join(','));
    const emptyVillage = { winPlan: {} };
    const r2 = Game.winPlanOnVillagerDeath.call({ state: { village: emptyVillage } }, 'gen_nonexistent_vid');
    check('cleanup on an EMPTY winPlan store is a no-op and creates no stats object',
      r2.deleted === false && r2.purged === 0 && !('winPlanStats' in emptyVillage),
      JSON.stringify(r2) + ' keys=' + Object.keys(emptyVillage).join(','));
  })();
  const v1 = npcs[0], v2 = npcs[1], v3 = npcs[2], v4 = npcs[3], v5 = npcs[4], v6 = npcs[5], v7 = npcs[6], v8 = npcs[7];
  // v1 holds a plan; v2's hunt plan names v1; v3's party plan names v1.
  const p1 = Game.winPlanOf(v1);
  const p2 = Game.winPlanOf(v2); p2.stage = 'hunt'; p2.party = [v1];
  const p3 = Game.winPlanOf(v3); p3.stage = 'party'; p3.party = [v1];
  check('fixture plans created (v1 own, v2 hunt+[v1], v3 party+[v1])',
    !!p1 && p2.stage === 'hunt' && p2.party[0] === v1 && p3.stage === 'party');
  const stats0 = Game.winPlanStats().deathCleanups || 0;
  const r1 = Game.winPlanOnVillagerDeath(v1);
  check('cleanup deletes the dead holder entry + purges 2 party refs',
    r1.deleted === true && r1.purged === 2 &&
    !((Game.state.village.winPlan || {})[v1]) &&
    (Game.state.village.winPlan[v2].party.indexOf(v1) === -1) &&
    (Game.state.village.winPlan[v3].party.indexOf(v1) === -1),
    JSON.stringify(r1));
  check('hunt plan with emptied party falls back to party stage; party plan stays party',
    Game.state.village.winPlan[v2].stage === 'party' &&
    Game.state.village.winPlan[v3].stage === 'party',
    'v2=' + Game.state.village.winPlan[v2].stage + ' v3=' + Game.state.village.winPlan[v3].stage);
  check('deathCleanups bumped exactly once for the cleanup',
    (Game.winPlanStats().deathCleanups || 0) === stats0 + 1,
    'before=' + stats0 + ' after=' + Game.winPlanStats().deathCleanups);
  const r2 = Game.winPlanOnVillagerDeath(v1);
  check('second cleanup for the same vid is a no-op (idempotent, no second bump)',
    r2.deleted === false && r2.purged === 0 &&
    (Game.winPlanStats().deathCleanups || 0) === stats0 + 1,
    JSON.stringify(r2));
  // Standing / table plans keep their stage when the party empties
  // (the kill is banked; the party list is vestigial there). Two
  // separate pairs: killing v6 empties v5's standing party; killing
  // v8 empties v7's table party. The killed holder's own entry is
  // deleted in the same call — the stage assertion reads the SURVIVOR.
  const p5 = Game.winPlanOf(v5); p5.stage = 'standing'; p5.party = [v6];
  const p6 = Game.winPlanOf(v6); p6.stage = 'gear'; p6.party = [];
  const r3 = Game.winPlanOnVillagerDeath(v6);
  check('standing plan keeps its stage when its party empties (kill banked, list vestigial)',
    r3.deleted === true && r3.purged === 1 &&
    Game.state.village.winPlan[v5].party.length === 0 &&
    Game.state.village.winPlan[v5].stage === 'standing' &&
    !((Game.state.village.winPlan || {})[v6]),
    JSON.stringify(r3) + ' stage=' + Game.state.village.winPlan[v5].stage);
  const p7 = Game.winPlanOf(v7); p7.stage = 'table'; p7.party = [v8];
  const p8 = Game.winPlanOf(v8); p8.stage = 'gear'; p8.party = [];
  const r4 = Game.winPlanOnVillagerDeath(v8);
  check('table plan keeps its stage when its party empties; the killed holder entry is deleted',
    r4.deleted === true && r4.purged === 1 &&
    Game.state.village.winPlan[v7].party.length === 0 &&
    Game.state.village.winPlan[v7].stage === 'table' &&
    !((Game.state.village.winPlan || {})[v8]),
    JSON.stringify(r4) + ' stage=' + Game.state.village.winPlan[v7].stage);
  // A vid with no plan and in no party is a no-op with no bump.
  const statsBefore = Game.winPlanStats().deathCleanups || 0;
  const ghost = 'gen_nonexistent_vid';
  const r5 = Game.winPlanOnVillagerDeath(ghost);
  check('cleanup for a vid with no plan and no refs is a no-op with no stat bump',
    r5.deleted === false && r5.purged === 0 &&
    (Game.winPlanStats().deathCleanups || 0) === statsBefore,
    JSON.stringify(r5));
  check('cleanup with a null vid is a safe no-op',
    (function () { const r = Game.winPlanOnVillagerDeath(null); return r.deleted === false && r.purged === 0; })());
  return { Game: Game, npcs: npcs };
}

// ---------- 3. Live integration: real death pipelines ----------
console.log('== live integration ==');
async function integration() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 103232, mode: 'deathcleanup-test2', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const npcs = roster.filter(function (id) { return id && id !== Game.villagerId; });
  // (a) Lethal hurtVillager -> removeVillager hook -> plan gone.
  let killed = null;
  for (const vid of npcs.slice(0, 6)) {
    const plan = Game.winPlanOf(vid);
    plan.stage = 'hunt'; plan.party = [];
    try { Game.hurtVillager(vid, 1000, 'monster'); } catch (e) {}
    let dead = false;
    try { const p = Game.getPerson ? Game.getPerson(vid) : null; dead = !!(p && p.dead); } catch (e) {}
    if (!dead) {
      try { dead = !((Game.state.village.roster || []).includes(vid)); } catch (e) {}
    }
    if (dead) { killed = vid; break; }
    // A refusal saved them (godpath) — their plan must SURVIVE: the
    // death never completed, so no cleanup may fire.
    check('refusal-saved villager keeps their plan (no cleanup on a held death): ' + vid,
      !!((Game.state.village.winPlan || {})[vid]));
  }
  check('lethal hurtVillager kills a fixture villager (death pipeline runs in the harness)',
    !!killed, 'killed=' + killed);
  if (killed) {
    check('hurtVillager death deletes the plan via the removeVillager hook',
      !((Game.state.village.winPlan || {})[killed]));
    check('deathCleanups bumped by the hurtVillager death',
      (Game.winPlanStats().deathCleanups || 0) >= 1,
      'deathCleanups=' + Game.winPlanStats().deathCleanups);
  }
  // (b) tbVillagerFalls -> TB hook -> plan gone. Use a fresh villager
  // (still on the roster) with a plan naming a living companion.
  const rest = npcs.filter(function (id) { return id !== killed && ((Game.state.village.roster || []).includes(id)); });
  const tv = rest[0], comp = rest[1];
  const tp = Game.winPlanOf(tv); tp.stage = 'hunt'; tp.party = [comp];
  const cp = Game.winPlanOf(comp); cp.stage = 'hunt'; cp.party = [tv];
  const before = Game.winPlanStats().deathCleanups || 0;
  try {
    Game.tbVillagerFalls({ kind: 'villager', villagerId: tv, name: 'Test', mx: 4, my: 4 });
  } catch (e) {
    check('tbVillagerFalls runs without throwing', false, String(e && e.stack || e).slice(0, 300));
  }
  check('tbVillagerFalls removes the villager from the roster',
    !((Game.state.village.roster || []).includes(tv)));
  check('tbVillagerFalls death deletes the plan via the TB hook',
    !((Game.state.village.winPlan || {})[tv]));
  check('tbVillagerFalls death purges the vid from the living companion plan party',
    (Game.state.village.winPlan[comp].party || []).indexOf(tv) === -1);
  check('tbVillagerFalls death falls the companion hunt plan back to party stage',
    Game.state.village.winPlan[comp].stage === 'party',
    'stage=' + Game.state.village.winPlan[comp].stage);
  check('deathCleanups bumped by the TB death',
    (Game.winPlanStats().deathCleanups || 0) === before + 1,
    'before=' + before + ' after=' + Game.winPlanStats().deathCleanups);
}

// ---------- 4. Recorder live + D1 determinism + 150d coverage ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'));
  const out = await driver.oneRun(103231);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries planCensus + deadTouches arrays', Array.isArray(out.planCensus) && Array.isArray(out.deadTouches));
  check('live run policy sha is competent verbatim (df9b7dff4de4)', out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  console.log('  info: live 5d run recorded ' + (out.planCensus || []).length + ' planCensus rows, ' +
    (out.deadTouches || []).length + ' touches, deathCleanups=' +
    ((out.winPlanStats && out.winPlanStats.deathCleanups) || 0));
  return out;
}
console.log('== determinism legs D1 + 150d coverage ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days) }, envExtra || {});
  const script = "const d=require('./scripts/deadplan-driver-20261117.js');" +
    "d.oneRun(103231).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childRun(60, {});
  const b = childRun(60, {});
  check('D1 repeatability: identical full corpus, armed code twice (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const long = childRun(150, {});
  const one = ANALYZE.analyzeOne(long.full);
  check('150d live run: cleanup fires in sims (deathCleanups > 0)',
    ((long.full.winPlanStats && long.full.winPlanStats.deathCleanups) || 0) > 0,
    'deathCleanups=' + ((long.full.winPlanStats && long.full.winPlanStats.deathCleanups) || 0));
  check('150d live run: zero dead-holder census rows on the armed code',
    one.linger.censusDead === 0,
    'censusDead=' + one.linger.censusDead + '/' + one.linger.censusTotal);
  check('150d live run: zero stale party refs (slot holder-days 0) on the armed code',
    one.slot.holderDays === 0 && one.slot.holders.length === 0,
    'holderDays=' + one.slot.holderDays + ' holders=' + JSON.stringify(one.slot.holders));
  check('150d live run: analyzer classifies the armed corpus NOISE-ONLY',
    ANALYZE.classify([long.full]).verdict === 'NOISE-ONLY',
    'verdict=' + ANALYZE.classify([long.full]).verdict);
  console.log('  info: 150d run seed 103231 end=' + long.full.endReason + ' standing=' + long.full.standing +
    ' wave=' + long.full.maxWave + ' deaths=' + (long.full.deaths || []).length +
    ' creates=' + (long.full.v4creates || []).length + ' census=' + (long.full.planCensus || []).length);
}

(async function () {
  try {
    await unitFixtures();
    await integration();
    await liveRuns();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
