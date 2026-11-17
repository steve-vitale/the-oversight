// test-nondeathplan-b.js — proof for arm sim-nondeathplan-b (BUILD).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the leave method exists in win-plan.js (delete own entry
// + purge the vid from every holder's party + party/hunt -> party
// fallback on empty + honest removalCleanups stat, never deathCleanups),
// removeVillager's NON-DEATH branch calls it (fled / splinter /
// exiled / tribute / relay — one unit case per how), the death path is
// untouched (deathcleanup's pins still hold: exactly two
// `delete v.winPlan[vid]` spellings, the death bump line exact, the
// death method called exactly once in removeVillager, tbVillagerFalls
// intact, registerDeath NOT a hook, staticReaderCheck clean), the
// party.js fled-betrayer bypass is routed through the choke point
// (tbEnd calls removeVillager('fled'); no direct roster filter left;
// no `winPlan` literal in party.js), the leave method never creates
// the winPlan store (no-creation regression — the deathcleanup
// correction lesson), and D1 determinism holds on the armed code
// (60d, seed 103241, identical full corpus) with a 150d live run
// proving the armed code leaves zero lingering non-death entries.
// Usage:
//   node scripts/test-nondeathplan-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-deadplan-b.js'));
const NONDEATH = require(path.join(REPO, 'scripts', 'analyze-nondeathplan-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitBranchSrcFiles() {
  try {
    const mb = execSync('git merge-base HEAD master', { cwd: REPO }).toString().trim();
    const diffed = execSync('git diff --name-only ' + mb + ' -- src', { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    const uncommitted = execSync('git status --porcelain -- src', { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim().slice(3); }).filter(Boolean);
    const all = {};
    diffed.concat(uncommitted).forEach(function (f) { all[f] = true; });
    return Object.keys(all).sort();
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function methodSegment(src, sig) {
  const i = src.indexOf(sig);
  if (i === -1) return null;
  // Methods in the win-plan `methods` object end with "\n    }," at
  // 4-space indent; slice to the first such close after the signature
  // so the segment never bleeds into the next method (which may
  // legitimately call stateOf).
  const end = src.indexOf('\n    },', i + sig.length);
  return end === -1 ? src.slice(i, i + 4000) : src.slice(i, end);
}

// ---------- 1. Static ----------
console.log('== static ==');
const srcFiles = gitBranchSrcFiles();
const srcAllowed = ['src/js/win-plan.js', 'src/js/betrayal.js', 'src/js/party.js'];
check('branch src diff touches ONLY win-plan.js + betrayal.js + party.js (' + JSON.stringify(srcFiles) + ')',
  srcFiles.length > 0 && srcFiles.every(function (f) { return srcAllowed.indexOf(f) !== -1; }) &&
  srcAllowed.every(function (f) { return srcFiles.indexOf(f) !== -1; }),
  JSON.stringify(srcFiles));
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('win-plan.js provides winPlanOnVillagerLeave',
  winPlanJs.indexOf('winPlanOnVillagerLeave(vid)') !== -1);
check('leave method deletes the leaver entry (deliberate [key] spelling — see comment)',
  winPlanJs.indexOf('delete v.winPlan[key]') !== -1);
check('shared purge core purgePartyRefs exists and both methods call it',
  winPlanJs.indexOf('purgePartyRefs') !== -1 &&
  winPlanJs.indexOf('purgePartyRefs(v, vid)') !== -1);
check('leave method purges the vid from every holder party + party/hunt fallback to party on empty',
  winPlanJs.indexOf("plan.party = plan.party.filter(function (pid) { return pid !== vid; })") !== -1 &&
  winPlanJs.indexOf("if (!plan.party.length && (plan.stage === 'party' || plan.stage === 'hunt')) plan.stage = 'party';") !== -1);
check('removalCleanups stat initialized in stateOf and bumped only when something was cleaned',
  winPlanJs.indexOf('removalCleanups: 0') !== -1 &&
  winPlanJs.indexOf("if (v.winPlanStats.removalCleanups == null) v.winPlanStats.removalCleanups = 0;") !== -1 &&
  winPlanJs.indexOf("if (deleted || purged > 0) bump(this, 'removalCleanups');") !== -1);
check('leave method never calls stateOf (non-creating read only — the ignition rule)',
  (function () {
    const seg = methodSegment(winPlanJs, 'winPlanOnVillagerLeave(vid) {');
    return seg !== null && seg.indexOf('stateOf(') === -1 && seg.indexOf('if (!v || !v.winPlan) return') !== -1;
  })());
// --- deathcleanup pins still hold (this arm must not weaken them) ---
check('DEATH PIN: exactly TWO `delete v.winPlan[vid]` spellings still exist (death method + table-active)',
  (winPlanJs.match(/delete v\.winPlan\[vid\]/g) || []).length === 2);
check('DEATH PIN: death bump line exact and present',
  winPlanJs.indexOf("if (deleted || purged > 0) bump(this, 'deathCleanups');") !== -1);
check('DEATH PIN: winPlan assignment count unchanged (3: havenTick, seed, winPlanOf)',
  (function () {
    const re = /v\.winPlan\[vid\] = /g;
    let m, n = 0;
    while ((m = re.exec(winPlanJs)) !== null) n++;
    return n === 3;
  })());
const betrayalJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'betrayal.js'), 'utf8');
check('removeVillager death branch still calls winPlanOnVillagerDeath exactly once',
  (function () {
    const fn = betrayalJs.indexOf('removeVillager(vid, how)');
    const seg = betrayalJs.slice(fn, fn + 12000);
    return (seg.match(/winPlanOnVillagerDeath\(vid\)/g) || []).length === 1;
  })());
check('removeVillager non-death branch calls winPlanOnVillagerLeave (after the dead-mark block)',
  (function () {
    const fn = betrayalJs.indexOf('removeVillager(vid, how)');
    if (fn === -1) return false;
    const seg = betrayalJs.slice(fn, fn + 12000);
    const deadMark = seg.indexOf('rec.dead = true');
    const hook = seg.indexOf('winPlanOnVillagerLeave(vid)');
    const deathHook = seg.indexOf('winPlanOnVillagerDeath(vid)');
    return deadMark !== -1 && hook !== -1 && deathHook !== -1 && deadMark < deathHook && deathHook < hook;
  })());
check('removeVillager hook sits AFTER the phoenix early-return (a held death keeps its plan)',
  (function () {
    const fn = betrayalJs.indexOf('removeVillager(vid, how)');
    if (fn === -1) return false;
    const seg = betrayalJs.slice(fn, fn + 12000);
    const phoenix = seg.indexOf('phoenixVillagerTrigger(vid)');
    const hook = seg.indexOf('winPlanOnVillagerLeave(vid)');
    return phoenix !== -1 && hook !== -1 && phoenix < hook;
  })());
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
check('tbVillagerFalls still calls winPlanOnVillagerDeath (death hook intact)',
  (function () {
    const i = gameJs.indexOf('tbVillagerFalls(t) {');
    if (i === -1) return false;
    const seg = gameJs.slice(i, i + 1200);
    return seg.indexOf('winPlanOnVillagerDeath(t.villagerId)') !== -1;
  })());
const corpsesJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'corpses.js'), 'utf8');
check('registerDeath is NOT a hook site for either cleanup',
  corpsesJs.indexOf('winPlanOnVillagerDeath') === -1 && corpsesJs.indexOf('winPlanOnVillagerLeave') === -1);
check('static reader check: winPlan lives only in game/agency/brain/win-plan/betrayal; standing/table clean',
  (function () {
    const s = ANALYZE.staticReaderCheck(REPO);
    return s.problems.length === 0 &&
      JSON.stringify(s.filesWithWinPlan) === JSON.stringify(['betrayal.js', 'game.js', 'villager-agency.js', 'villager-brain.js', 'win-plan.js']) &&
      s.standingTableClean === true;
  })());
const partyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'party.js'), 'utf8');
check('party.js tbEnd routes the fled betrayer through the choke point (removeVillager fled)',
  partyJs.indexOf("this.removeVillager(fled.villagerId, 'fled')") !== -1);
check('party.js no longer removes the fled betrayer from the roster directly',
  partyJs.indexOf('v.roster = (v.roster || []).filter(id => id !== fled.villagerId);') === -1);
check('party.js carries no winPlan literal (the choke point owns the cleanup)',
  partyJs.indexOf('winPlan') === -1);

// ---------- 2. Unit fixtures (live Game) ----------
console.log('== unit fixtures ==');
async function unitFixtures() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 103241, mode: 'nondeathplan-test', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const npcs = roster.filter(function (id) { return id && id !== Game.villagerId; });
  check('fixture game has NPC villagers to plan with', npcs.length >= 12, 'npcs=' + npcs.length);
  // REGRESSION (ignition, sim-deathcleanup-b lesson): the leave
  // cleanup must NEVER create the winPlan store. Call the method
  // with a bare village object that has no winPlan key at all, and
  // with an empty store — both must stay untouched.
  (function () {
    const bareVillage = {};
    const r = Game.winPlanOnVillagerLeave.call({ state: { village: bareVillage } }, 'gen_nonexistent_vid');
    check('leave on a village with NO winPlan store is a no-op and creates NOTHING',
      r.deleted === false && r.purged === 0 &&
      !('winPlan' in bareVillage) && !('winPlanStats' in bareVillage),
      JSON.stringify(r) + ' keys=' + Object.keys(bareVillage).join(','));
    const emptyVillage = { winPlan: {} };
    const r2 = Game.winPlanOnVillagerLeave.call({ state: { village: emptyVillage } }, 'gen_nonexistent_vid');
    check('leave on an EMPTY winPlan store is a no-op and creates no stats object',
      r2.deleted === false && r2.purged === 0 && !('winPlanStats' in emptyVillage),
      JSON.stringify(r2) + ' keys=' + Object.keys(emptyVillage).join(','));
  })();
  // One removeVillager case per non-death how. Each holder's plan is
  // deleted, the companion's party is purged, removalCleanups bumps
  // exactly once, deathCleanups does NOT move, and the villager is
  // off the roster.
  const hows = ['fled', 'splinter', 'exiled', 'tribute', 'relay'];
  for (let h = 0; h < hows.length; h++) {
    const how = hows[h];
    const holder = npcs[h * 2], comp = npcs[h * 2 + 1];
    const hp = Game.winPlanOf(holder); hp.stage = 'hunt'; hp.party = [comp];
    const cp = Game.winPlanOf(comp); cp.stage = 'hunt'; cp.party = [holder];
    const rc0 = Game.winPlanStats().removalCleanups || 0;
    const dc0 = Game.winPlanStats().deathCleanups || 0;
    Game.removeVillager(holder, how);
    check('removeVillager(' + how + ') deletes the leaver plan + purges the companion party ref',
      !((Game.state.village.winPlan || {})[holder]) &&
      (Game.state.village.winPlan[comp].party || []).indexOf(holder) === -1,
      'how=' + how);
    check('removeVillager(' + how + ') falls the companion hunt plan back to party stage',
      Game.state.village.winPlan[comp].stage === 'party',
      'stage=' + Game.state.village.winPlan[comp].stage);
    check('removeVillager(' + how + ') bumps removalCleanups exactly once, deathCleanups untouched',
      (Game.winPlanStats().removalCleanups || 0) === rc0 + 1 &&
      (Game.winPlanStats().deathCleanups || 0) === dc0,
      'rc ' + rc0 + '->' + Game.winPlanStats().removalCleanups + ' dc ' + dc0 + '->' + Game.winPlanStats().deathCleanups);
    check('removeVillager(' + how + ') takes the villager off the roster',
      ((Game.state.village.roster || []).indexOf(holder) === -1));
    // Second leave for the same vid is a no-op (idempotent).
    const rc1 = Game.winPlanStats().removalCleanups || 0;
    const r2 = Game.winPlanOnVillagerLeave(holder);
    check('second leave for the same vid is a no-op (idempotent, no second bump): ' + how,
      r2.deleted === false && r2.purged === 0 &&
      (Game.winPlanStats().removalCleanups || 0) === rc1,
      JSON.stringify(r2));
  }
  // Standing / table plans keep their stage when the party empties
  // (same rule as the death method — the kill is banked).
  const sv = npcs[10], svComp = npcs[11];
  const sp = Game.winPlanOf(sv); sp.stage = 'standing'; sp.party = [svComp];
  const scp = Game.winPlanOf(svComp); scp.stage = 'gear'; scp.party = [];
  const rcBefore = Game.winPlanStats().removalCleanups || 0;
  const rS = Game.winPlanOnVillagerLeave(svComp);
  check('standing plan keeps its stage when its party empties via a leave',
    rS.deleted === true && rS.purged === 1 &&
    Game.state.village.winPlan[sv].party.length === 0 &&
    Game.state.village.winPlan[sv].stage === 'standing' &&
    !((Game.state.village.winPlan || {})[svComp]),
    JSON.stringify(rS) + ' stage=' + Game.state.village.winPlan[sv].stage);
  check('leave bumps removalCleanups for the standing case too',
    (Game.winPlanStats().removalCleanups || 0) === rcBefore + 1);
  // A vid with no plan and in no party is a no-op with no bump.
  const statsBefore = Game.winPlanStats().removalCleanups || 0;
  const ghost = 'gen_nonexistent_vid';
  const rG = Game.winPlanOnVillagerLeave(ghost);
  check('leave for a vid with no plan and no refs is a no-op with no stat bump',
    rG.deleted === false && rG.purged === 0 &&
    (Game.winPlanStats().removalCleanups || 0) === statsBefore,
    JSON.stringify(rG));
  check('leave with a null vid is a safe no-op',
    (function () { const r = Game.winPlanOnVillagerLeave(null); return r.deleted === false && r.purged === 0; })());
  return { Game: Game, npcs: npcs };
}

// ---------- 3. Live integration: the death path still bumps death only ----------
console.log('== live integration ==');
async function integration() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 103242, mode: 'nondeathplan-test2', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const npcs = roster.filter(function (id) { return id && id !== Game.villagerId; });
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
    check('refusal-saved villager keeps their plan (no cleanup on a held death): ' + vid,
      !!((Game.state.village.winPlan || {})[vid]));
  }
  check('lethal hurtVillager kills a fixture villager (death pipeline runs in the harness)',
    !!killed, 'killed=' + killed);
  if (killed) {
    const rc = Game.winPlanStats().removalCleanups || 0;
    check('hurtVillager death deletes the plan via the removeVillager death hook',
      !((Game.state.village.winPlan || {})[killed]));
    check('hurtVillager death bumps deathCleanups and NOT removalCleanups',
      (Game.winPlanStats().deathCleanups || 0) >= 1 &&
      (Game.winPlanStats().removalCleanups || 0) === rc,
      'deathCleanups=' + Game.winPlanStats().deathCleanups + ' removalCleanups=' + Game.winPlanStats().removalCleanups);
  }
  // tbVillagerFalls still deletes via the TB death hook.
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
  check('deathCleanups bumped by the TB death',
    (Game.winPlanStats().deathCleanups || 0) === before + 1,
    'before=' + before + ' after=' + Game.winPlanStats().deathCleanups);
}

// ---------- 4. Recorder live + D1 determinism + 150d coverage ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  process.env.NONDEATH_RECORDER = 'on';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'deadplan-driver-20261117.js'));
  const out = await driver.oneRun(103241);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries planCensus + deadTouches + removals arrays', Array.isArray(out.planCensus) && Array.isArray(out.deadTouches) && Array.isArray(out.removals));
  check('live run policy sha is competent verbatim (df9b7dff4de4)', out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  console.log('  info: live 5d run recorded ' + (out.planCensus || []).length + ' planCensus rows, ' +
    (out.deadTouches || []).length + ' touches, ' + (out.removals || []).length + ' removals, deathCleanups=' +
    ((out.winPlanStats && out.winPlanStats.deathCleanups) || 0) + ' removalCleanups=' +
    ((out.winPlanStats && out.winPlanStats.removalCleanups) || 0));
  return out;
}
console.log('== determinism legs D1 + 150d coverage ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days), NONDEATH_RECORDER: 'on' }, envExtra || {});
  const script = "const d=require('./scripts/deadplan-driver-20261117.js');" +
    "d.oneRun(103241).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily,removals:o.removals};" +
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
  const lg = NONDEATH.lingerForSeed(long.full);
  check('150d live run: zero lingering non-death entries on the armed code',
    lg.entryRows === 0,
    'entryRows=' + lg.entryRows + ' removals=' + lg.removalCount);
  check('150d live run: zero lingering party refs to removed villagers on the armed code',
    lg.partyRows === 0,
    'partyRows=' + lg.partyRows);
  console.log('  info: 150d run seed 103241 end=' + long.full.endReason + ' standing=' + long.full.standing +
    ' wave=' + long.full.maxWave + ' deaths=' + (long.full.deaths || []).length +
    ' removals=' + (long.full.removals || []).length + ' removalCleanups=' +
    ((long.full.winPlanStats && long.full.winPlanStats.removalCleanups) || 0) +
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
