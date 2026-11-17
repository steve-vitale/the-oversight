// test-nondeathplan-live-b.js — proof for arm sim-nondeathplan-live-b.
// STAGED-REMOVAL LIVE OBSERVATION: the landed leave-cleanup fix
// (winPlanOnVillagerLeave, commit 446a96ef4) was fixture-proven only
// — zero non-death removals fired on bands 103241–103248 /
// 103231–103238, so the hook never fired live. This test drives each
// non-death removal how through its REAL game trigger inside a live
// seeded sim and proves the hook fires: the leaver's own plan is
// deleted, their name is struck from living holders' parties,
// removalCleanups bumps, the stage falls back on an emptied
// party/hunt plan — and nothing lingers 10 days later. It also
// proves finding #2482's classifier fix (the deadplan slot rule
// counted the death day's own census row) on synthetic corpora and
// on the real 103241–103248 band.
// Frozen prereg: evidence/2026-11-17/sim-nondeathplan-live-b-prereg.md
// No game-code change is expected in this arm: the branch diff must
// be ONLY this test + the prereg + the evidence + the classifier fix.
// Usage:
//   node scripts/test-nondeathplan-live-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-deadplan-b.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function branchFiles() {
  try {
    const mb = execSync('git merge-base HEAD master', { cwd: REPO }).toString().trim();
    const diffed = execSync('git diff --name-only ' + mb, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    // Porcelain lines are XY + space + path: slice the 3-char prefix
    // per line WITHOUT trimming the whole output first (trim() would
    // eat the first line's leading status space and shift its slice).
    const uncommitted = execSync('git status --porcelain', { cwd: REPO }).toString().split('\n').map(function (s) { return s.slice(3).trim(); }).filter(Boolean);
    const all = {};
    diffed.concat(uncommitted).forEach(function (f) { all[f] = true; });
    return Object.keys(all).sort();
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('win-plan.js provides winPlanOnVillagerLeave (the landed fix)',
  winPlanJs.indexOf('winPlanOnVillagerLeave(vid) {') !== -1);
check('leave method deletes the leaver entry + purges party refs + falls party/hunt back to party',
  winPlanJs.indexOf('delete v.winPlan[key]') !== -1 &&
  winPlanJs.indexOf("plan.party = plan.party.filter(function (pid) { return pid !== vid; })") !== -1 &&
  winPlanJs.indexOf("if (!plan.party.length && (plan.stage === 'party' || plan.stage === 'hunt')) plan.stage = 'party';") !== -1);
check('removalCleanups bumped only when something was cleaned',
  winPlanJs.indexOf("if (deleted || purged > 0) bump(this, 'removalCleanups');") !== -1);
check('DEATH PIN: exactly TWO `delete v.winPlan[vid]` spellings still exist',
  (winPlanJs.match(/delete v\.winPlan\[vid\]/g) || []).length === 2);
check('DEATH PIN: death bump line exact and present',
  winPlanJs.indexOf("if (deleted || purged > 0) bump(this, 'deathCleanups');") !== -1);
const betrayalJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'betrayal.js'), 'utf8');
check('removeVillager non-death branch calls winPlanOnVillagerLeave (after the death hook)',
  (function () {
    const fn = betrayalJs.indexOf('removeVillager(vid, how)');
    if (fn === -1) return false;
    const seg = betrayalJs.slice(fn, fn + 12000);
    const deadMark = seg.indexOf('rec.dead = true');
    const hook = seg.indexOf('winPlanOnVillagerLeave(vid)');
    const deathHook = seg.indexOf('winPlanOnVillagerDeath(vid)');
    return deadMark !== -1 && hook !== -1 && deathHook !== -1 && deadMark < deathHook && deathHook < hook;
  })());
const partyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'party.js'), 'utf8');
check('party.js tbEnd routes the fled betrayer through the choke point (removeVillager fled)',
  partyJs.indexOf("this.removeVillager(fled.villagerId, 'fled')") !== -1);
check('party.js carries no winPlan literal (the choke point owns the cleanup)',
  partyJs.indexOf('winPlan') === -1);
// #2482 classifier fix: the death day's own census row must NOT count.
const analyzerJs = fs.readFileSync(path.join(REPO, 'scripts', 'analyze-deadplan-b.js'), 'utf8');
check('#2482: slot rule excludes the death day (strict deathDay < r.day)',
  analyzerJs.indexOf('deathDay[pid] != null && deathDay[pid] < r.day') !== -1);
check('#2482: no <= death-day comparison remains in the slot rule',
  analyzerJs.indexOf('deathDay[pid] <= r.day') === -1);
const allowedBranchFiles = [
  'evidence/2026-11-17/sim-nondeathplan-live-b-prereg.md',
  'evidence/2026-11-17/sim-nondeathplan-live-b.md',
  'scripts/test-nondeathplan-live-b.js',
  'scripts/analyze-deadplan-b.js',
  // #2482 fixture update (same commit, same design change as the
  // classifier fix): the D4/D8 fixtures in test-deadplan-b.js
  // encoded the old death-day-inclusive counting, so they are
  // updated to the corrected semantics here. No game-code change.
  'scripts/test-deadplan-b.js',
];
(function () {
  const files = branchFiles();
  check('branch diff touches ONLY prereg + evidence + this proof + the classifier fix (+ its test-deadplan-b.js fixture update) (' + JSON.stringify(files) + ')',
    files.length > 0 && files.indexOf('GIT-UNAVAILABLE') === -1 &&
    files.every(function (f) { return allowedBranchFiles.indexOf(f) !== -1; }),
    JSON.stringify(files));
  check('branch diff includes the classifier fix (scripts/analyze-deadplan-b.js)',
    files.indexOf('scripts/analyze-deadplan-b.js') !== -1);
})();

// ---------- 2. Live staged removals ----------
console.log('== live staged removals ==');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

async function freshGame(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'nondeathplan-live-test', fullTelemetry: false });
  await setupGame(Game);
  const sayLines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) { try { sayLines.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: String(msg) }); } catch (e) {} return origSay(msg); };
  const roster = ((Game.state || {}).village || {}).roster || [];
  const npcs = roster.filter(function (id) { return id && id !== Game.villagerId; });
  return { Game: Game, npcs: npcs, sayLines: sayLines };
}
function mkHuntPair(Game, holder, comp) {
  const hp = Game.winPlanOf(holder); hp.stage = 'hunt'; hp.party = [comp];
  const cp = Game.winPlanOf(comp); cp.stage = 'hunt'; cp.party = [holder];
}
function stats(Game) {
  const s = Game.winPlanStats();
  return { rc: (s && s.removalCleanups) || 0, dc: (s && s.deathCleanups) || 0 };
}
function lingering(Game, leaverVid) {
  const store = (Game.state.village || {}).winPlan || {};
  const entryGone = !store[leaverVid];
  let refs = [];
  for (const vid of Object.keys(store)) {
    if (vid === leaverVid) continue;
    if (((store[vid] || {}).party || []).indexOf(leaverVid) !== -1) refs.push(vid);
  }
  return { entryGone: entryGone, refs: refs };
}
function exilesEntry(Game, vid) {
  const ex = ((Game.state.village || {}).exiles || []);
  return ex.filter(function (e) { return e && e.vid === vid; });
}
function personAlive(Game, vid) {
  // The leaver must be GONE, not dead: the exiles ledger is the
  // primary proof (removeVillager writes it for non-death hows);
  // a retrievable person record must read not-dead. If no record
  // is retrievable the ledger alone carries the check.
  try { const vp = Game.vpOf ? Game.vpOf(vid) : null; if (vp) return vp.dead !== true; } catch (e) {}
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p) return p.dead !== true; } catch (e) {}
  return null; // no record retrievable
}
const GHOST_TRIPWIRE = /still (planning|hunting|walking|with us|in the party|on the hunt)|joins (you|the party|the hunt)/i;
async function observeTenDays(Game, holder, comp, leaverVid, label) {
  // Run 10 competent days in the live loop and re-check lingering.
  // Returns the run record for the evidence (endReason + deaths).
  const day0 = ((Game.state || {}).scholar || {}).day || 0;
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, competent, { days: 10, manifest: undefined, sampleEvery: 1 });
  });
  const day1 = ((Game.state || {}).scholar || {}).day || 0;
  const ling = lingering(Game, leaverVid);
  const deaths = ((result && result.samples && result.samples.deaths) || []).slice();
  console.log('  info: [' + label + '] 10d run day ' + day0 + '->' + day1 +
    ' end=' + (result && result.endReason) + ' deaths=' + deaths.length +
    ' (' + deaths.map(function (d) { return (d.who || '?') + ':' + (d.cause || '?'); }).join(', ') + ')');
  check('[' + label + '] after 10 live days: leaver entry still gone, no living holder party names them',
    ling.entryGone && ling.refs.length === 0,
    'entryGone=' + ling.entryGone + ' refs=' + JSON.stringify(ling.refs));
  check('[' + label + '] 10-day run completed without throwing (endReason recorded)',
    !!(result && result.endReason), 'endReason=' + (result && result.endReason));
  check('[' + label + '] no death row for the leaver in the 10 days (the staging removes, never kills)',
    !deaths.some(function (d) { return d && d.who === leaverVid; }),
    JSON.stringify(deaths.filter(function (d) { return d && d.who === leaverVid; })));
  return { result: result, deaths: deaths, day0: day0, day1: day1 };
}
function senseCheck(sayLines, leaverVid, leaverName, removalDay, label) {
  // Print every post-removal line naming the leaver for the evidence
  // reader, and trip on any line that talks about them as still
  // planning / still walking with the living.
  const after = sayLines.filter(function (l) { return l.day >= removalDay && l.text.indexOf(leaverName) !== -1; });
  console.log('  info: [' + label + '] post-removal lines naming the leaver (' + leaverName + '): ' + after.length);
  after.slice(0, 8).forEach(function (l) { console.log('    d' + l.day + ': ' + l.text.slice(0, 220)); });
  const ghost = after.filter(function (l) { return GHOST_TRIPWIRE.test(l.text); });
  check('[' + label + '] sense: no post-removal line treats the leaver as still planning / still walking',
    ghost.length === 0, JSON.stringify(ghost.map(function (l) { return l.text.slice(0, 160); })));
  return after;
}
async function assertRemovalInstant(Game, holder, comp, rc0, dc0, expectedBump, label) {
  const v = Game.state.village;
  const st = stats(Game);
  const ling = lingering(Game, holder);
  check('[' + label + '] leaver off the roster',
    (v.roster || []).indexOf(holder) === -1);
  check('[' + label + '] leaver plan deleted at the removal instant',
    ling.entryGone);
  check('[' + label + '] companion party purged of the leaver',
    ling.refs.length === 0, 'refs=' + JSON.stringify(ling.refs));
  check('[' + label + '] companion hunt plan falls back to party stage',
    ((v.winPlan || {})[comp] && v.winPlan[comp].stage === 'party'),
    'stage=' + (((v.winPlan || {})[comp] || {}).stage));
  check('[' + label + '] removalCleanups bumps exactly +' + expectedBump + ', deathCleanups untouched',
    st.rc === rc0 + expectedBump && st.dc === dc0,
    'rc ' + rc0 + '->' + st.rc + ' dc ' + dc0 + '->' + st.dc);
  check('[' + label + '] exiles ledger carries the leaver (removal, not death)',
    exilesEntry(Game, holder).length >= 1,
    JSON.stringify(exilesEntry(Game, holder)));
  const alive = personAlive(Game, holder);
  check('[' + label + '] leaver person record (if retrievable) reads not-dead',
    alive !== false, 'alive=' + alive);
}

async function liveLegs() {
  const results = {};

  // ---- fled: bully a terrified withdrawn villager until they run ----
  {
    const label = 'fled';
    let staged = null;
    for (let seed = 103241; seed <= 103248 && !staged; seed++) {
      const g = await freshGame(seed);
      const Game = g.Game;
      const cands = g.npcs.filter(function (id) { return ['cautious', 'withdrawn'].indexOf(Game.npcTemper(id)) !== -1; });
      for (const vid of cands) {
        const comp = g.npcs.find(function (id) { return id !== vid; });
        mkHuntPair(Game, vid, comp);
        const rc0 = stats(Game).rc, dc0 = stats(Game).dc;
        try { Game.npcNeeds(vid).fear = 100; } catch (e) {}
        let res = null;
        try { res = Game.intimidate(vid); } catch (e) { console.log('  info: [' + label + '] intimidate threw: ' + String(e && e.message)); }
        if (res === 'fled') { staged = { g: g, Game: Game, holder: vid, comp: comp, rc0: rc0, dc0: dc0, seed: seed }; break; }
        if (res === 'fight') break; // snapped — a fight started; abandon this game
        // yielded / refused: try the next candidate (fear is already 100,
        // the break point only trips on a fresh call after 2 threats —
        // a single call cannot yield twice, so move on)
        break;
      }
      if (!staged) { /* fresh game per seed; the loop re-creates */ }
    }
    check('[fled] staged through the real trigger (intimidate -> fled)',
      !!staged, 'no withdrawn/cautious villager fled on seeds 103241-103248');
    if (staged) {
      const Game = staged.Game;
      const removalDay = ((Game.state || {}).scholar || {}).day || 0;
      const name = Game.displayName(staged.holder);
      await assertRemovalInstant(Game, staged.holder, staged.comp, staged.rc0, staged.dc0, 1, label);
      results.fled = await observeTenDays(Game, staged.holder, staged.comp, staged.holder, label);
      results.fled.seed = staged.seed; results.fled.holder = staged.holder;
      senseCheck(staged.g.sayLines, staged.holder, name, removalDay, label);
    }
  }

  // ---- splinter: leadership loser walks out (resolve the contend arc) ----
  {
    const label = 'splinter';
    const g = await freshGame(103243);
    const Game = g.Game;
    const cid = g.npcs[0], comp = g.npcs[1];
    mkHuntPair(Game, cid, comp);
    const rc0 = stats(Game).rc, dc0 = stats(Game).dc;
    const v = Game.state.village;
    let result = null, attempts = 0;
    // Trust is re-pinned to 10 before EVERY attempt: a respect
    // resolution bumps trust +4, so re-rolling without re-pinning
    // closes the canLeave (trust <= 25) window after ~4 resolutions
    // (120 attempts with trust pinned once never left; probe
    // sim-nondeathplan-live-b). The re-pin maintains the staged
    // precondition — a low-trust leadership loser — it never touches
    // the roll.
    for (let i = 0; i < 200 && result !== 'leave'; i++) {
      attempts++;
      v.trust = v.trust || {}; v.trust[cid] = 10;
      v.contendArc = v.contendArc || {};
      v.contendArc[cid] = { stoodDown: 9, yielded: 0, state: 'open' };
      try { result = Game._maybeResolveContendArc(cid, v.contendArc[cid]); } catch (e) { console.log('  info: [splinter] resolve threw: ' + String(e && e.message)); break; }
    }
    console.log('  info: [splinter] resolved to ' + result + ' after ' + attempts + ' attempts');
    check('[splinter] staged through the real trigger (contend arc -> leave)',
      result === 'leave', 'result=' + result + ' attempts=' + attempts);
    if (result === 'leave') {
      const removalDay = ((Game.state || {}).scholar || {}).day || 0;
      const name = Game.displayName(cid);
      await assertRemovalInstant(Game, cid, comp, rc0, dc0, 1, label);
      results.splinter = await observeTenDays(Game, cid, comp, cid, label);
      results.splinter.seed = 103243; results.splinter.holder = cid; results.splinter.attempts = attempts;
      senseCheck(g.sayLines, cid, name, removalDay, label);
    }
  }

  // ---- exiled: moot vote-out (freeloadVote) ----
  {
    const label = 'exiled';
    const g = await freshGame(103244);
    const Game = g.Game;
    const vid = g.npcs[0], comp = g.npcs[1];
    mkHuntPair(Game, vid, comp);
    const rc0 = stats(Game).rc, dc0 = stats(Game).dc;
    try { Game.freeloadVote(vid); } catch (e) { console.log('  info: [exiled] freeloadVote threw: ' + String(e && e.message)); }
    const exiled = (Game.state.village.roster || []).indexOf(vid) === -1;
    check('[exiled] staged through the real trigger (moot vote-out)',
      exiled, 'still on roster');
    if (exiled) {
      const removalDay = ((Game.state || {}).scholar || {}).day || 0;
      const name = Game.displayName(vid);
      await assertRemovalInstant(Game, vid, comp, rc0, dc0, 1, label);
      results.exiled = await observeTenDays(Game, vid, comp, vid, label);
      results.exiled.seed = 103244; results.exiled.holder = vid;
      senseCheck(g.sayLines, vid, name, removalDay, label);
    }
  }

  // ---- tribute: pay two living wave-4 veterans to the table ----
  {
    const label = 'tribute';
    const g = await freshGame(103245);
    const Game = g.Game;
    const A = g.npcs[0], B = g.npcs[1], comp = g.npcs[2];
    const hpA = Game.winPlanOf(A); hpA.stage = 'hunt'; hpA.party = [comp];
    const hpB = Game.winPlanOf(B); hpB.stage = 'hunt'; hpB.party = [comp];
    const hpC = Game.winPlanOf(comp); hpC.stage = 'hunt'; hpC.party = [A, B];
    Game.state.waveKillLog = [{ by: A, w: 4 }, { by: B, w: 4 }];
    const ready = Game.ladderCapstoneReady('military_tribute');
    check('[tribute] staged veterans read ready (2 payable)',
      !!(ready && ready.ready && ready.payable === 2), JSON.stringify(ready));
    const rc0 = stats(Game).rc, dc0 = stats(Game).dc;
    let res = null;
    try { res = Game.ladderDeliverCapstone('military_tribute'); } catch (e) { console.log('  info: [tribute] delivery threw: ' + String(e && e.message)); }
    check('[tribute] staged through the real trigger (table delivery ok)',
      !!(res && res.ok), JSON.stringify(res));
    if (res && res.ok) {
      const v = Game.state.village;
      const st = stats(Game);
      check('[tribute] BOTH veterans off the roster',
        (v.roster || []).indexOf(A) === -1 && (v.roster || []).indexOf(B) === -1);
      check('[tribute] BOTH veterans plans deleted',
        !((v.winPlan || {})[A]) && !((v.winPlan || {})[B]));
      check('[tribute] companion party purged of both veterans, falls back to party',
        ((v.winPlan || {})[comp] && (v.winPlan[comp].party || []).length === 0 && v.winPlan[comp].stage === 'party'),
        'party=' + JSON.stringify(((v.winPlan || {})[comp] || {}).party) + ' stage=' + (((v.winPlan || {})[comp] || {}).stage));
      check('[tribute] removalCleanups bumps exactly +2, deathCleanups untouched',
        st.rc === rc0 + 2 && st.dc === dc0, 'rc ' + rc0 + '->' + st.rc + ' dc ' + dc0 + '->' + st.dc);
      check('[tribute] exiles ledger carries both veterans',
        exilesEntry(Game, A).length >= 1 && exilesEntry(Game, B).length >= 1);
      const removalDay = ((Game.state || {}).scholar || {}).day || 0;
      const nameA = Game.displayName(A);
      const obs = await observeTenDays(Game, A, comp, A, label);
      // The second veteran's lingering is checked on the same run.
      const lingB = lingering(Game, B);
      check('[tribute] after 10 live days: second veteran entry still gone, no refs',
        lingB.entryGone && lingB.refs.length === 0, JSON.stringify(lingB));
      results.tribute = obs; results.tribute.seed = 103245; results.tribute.holders = [A, B];
      senseCheck(g.sayLines, A, nameA, removalDay, label);
    }
  }

  // ---- relay: name the relay's person on the defiant path ----
  {
    const label = 'relay';
    const g = await freshGame(103246);
    const Game = g.Game;
    const holder = g.npcs[0], comp = g.npcs[1];
    mkHuntPair(Game, holder, comp);
    const v = Game.state.village;
    v.trust = v.trust || {};
    g.npcs.forEach(function (id) { v.trust[id] = 10; });
    v.trust[holder] = 95; // relayPerson() names the most-trusted living villager
    const rc0 = stats(Game).rc, dc0 = stats(Game).dc;
    let started = false;
    try {
      Game.tableStartPath('defiant');
      const T = Game.tableState();
      started = !!(T && T.path === 'defiant' && T.phase === 'challenge' && T.beat === 0);
      // Beat 0 is the food price — take 'grain' (dignity, no pantry cost).
      if (started) Game.tableChoose('beat:grain');
      const T2 = Game.tableState();
      check('[relay] defiant path advanced to the relay beat (beat 1)',
        !!(T2 && T2.beat === 1), 'beat=' + (T2 && T2.beat));
      if (T2 && T2.beat === 1) Game.tableChoose('beat:name');
      const T3 = Game.tableState();
      check('[relay] the relay took the staged holder (relayTaken.id === holder)',
        !!((T3 || {}).relayTaken && T3.relayTaken.id === holder),
        JSON.stringify((T3 || {}).relayTaken));
    } catch (e) { console.log('  info: [relay] path threw: ' + String(e && e.stack || e).slice(0, 400)); }
    check('[relay] staged through the real trigger (defiant beat -> name)',
      started && (Game.state.village.roster || []).indexOf(holder) === -1,
      'started=' + started + ' onRoster=' + ((Game.state.village.roster || []).indexOf(holder) !== -1));
    if ((Game.state.village.roster || []).indexOf(holder) === -1) {
      const removalDay = ((Game.state || {}).scholar || {}).day || 0;
      const name = Game.displayName(holder);
      await assertRemovalInstant(Game, holder, comp, rc0, dc0, 1, label);
      results.relay = await observeTenDays(Game, holder, comp, holder, label);
      results.relay.seed = 103246; results.relay.holder = holder;
      senseCheck(g.sayLines, holder, name, removalDay, label);
    }
  }

  // ---- tbEnd fled betrayer: the betrayer breaks and runs mid-fight ----
  {
    const label = 'tbend-fled';
    const g = await freshGame(103247);
    const Game = g.Game;
    const betrayer = g.npcs.find(function (id) { return Game.npcTemper(id) === 'bold'; }) || g.npcs[0];
    const comp = g.npcs.find(function (id) { return id !== betrayer; });
    mkHuntPair(Game, betrayer, comp);
    const rc0 = stats(Game).rc, dc0 = stats(Game).dc;
    let fled = false;
    try {
      Game.npcBetrays(betrayer, { reason: 'rage' });
      check('[tbend-fled] betrayal fight started', !!(Game.tbfight && Game.tbfight.betrayal));
      const h = Game.tbfight ? Game.tbfight.fighters.find(function (x) { return x.kind === 'hostile'; }) : null;
      check('[tbend-fled] hostile fighter exists', !!h);
      if (h) {
        // A losing betrayer at 20% HP: the flee check (hpFrac < 0.3 +
        // 0.4 roll) runs before any strike. Bold, so the yield check
        // (hpFrac < 0.12) cannot fire first at this HP.
        h.hp = Math.floor((h.maxHp || 100) * 0.2);
        for (let i = 0; i < 40 && Game.tbfight && !Game.tbfight.over; i++) {
          Game.tbHostileTurn(h);
          if (h.fled) { fled = true; break; }
          if (!Game.tbfight || Game.tbfight.over) break;
        }
        // The in-turn tbEndCheck ends the fight and clears tbfight
        // (wrapper sets tbfight = null at the routed ending); if the
        // fight is somehow still open with the betrayer fled, end it.
        if (Game.tbfight && !Game.tbfight.over && h.fled) { try { Game.tbEndCheck(); } catch (e) {} }
      }
    } catch (e) { console.log('  info: [tbend-fled] threw: ' + String(e && e.stack || e).slice(0, 400)); }
    check('[tbend-fled] staged through the real trigger (betrayer fled the TB fight)',
      fled, 'betrayer=' + betrayer);
    if (fled) {
      const removalDay = ((Game.state || {}).scholar || {}).day || 0;
      const name = Game.displayName(betrayer);
      await assertRemovalInstant(Game, betrayer, comp, rc0, dc0, 1, label);
      results.tbend = await observeTenDays(Game, betrayer, comp, betrayer, label);
      results.tbend.seed = 103247; results.tbend.holder = betrayer;
      senseCheck(g.sayLines, betrayer, name, removalDay, label);
    }
  }

  console.log('  info: live-leg summary: ' + JSON.stringify(Object.keys(results).map(function (k) {
    const r = results[k];
    return k + '@' + (r.seed || '?') + ' end=' + ((r.result && r.result.endReason) || '?') + ' deaths10d=' + (r.deaths || []).length;
  })));
  return results;
}

// ---------- 3. No-creation live case ----------
console.log('== no-creation live case ==');
async function noCreationCase() {
  // A plan-less staged village must gain no winPlan store from the
  // removal calls alone. Prefer a seed whose setupGame leaves NO
  // winPlan key at all (strongest form); otherwise assert the key
  // SET is unchanged by the removal (no new keys, no stats bump).
  let staged = null, fallback = null;
  for (let seed = 103241; seed <= 103248 && !staged; seed++) {
    const g = await freshGame(seed);
    const Game = g.Game;
    const v = Game.state.village;
    const keysBefore = { winPlan: ('winPlan' in v), winPlanStats: ('winPlanStats' in v) };
    if (!keysBefore.winPlan && !keysBefore.winPlanStats) {
      staged = { g: g, Game: Game, seed: seed, keysBefore: keysBefore, strong: true };
      break;
    }
    if (!fallback) fallback = { g: g, Game: Game, seed: seed, keysBefore: keysBefore, strong: false };
  }
  if (!staged) staged = fallback;
  check('no-creation case staged (a seed with no winPlan store at setup, or the weakest-form fallback)',
    !!staged, 'all 8 seeds already hold a store at setup');
  if (!staged) return;
  const Game = staged.Game, v = Game.state.village;
  console.log('  info: no-creation seed=' + staged.seed + ' strong=' + staged.strong +
    ' keysBefore=' + JSON.stringify(staged.keysBefore));
  const vid = staged.g.npcs[0];
  // The villager must hold no plan and sit in no party (fresh
  // fixture village — nothing was seeded with winPlanOf).
  const storeBefore = v.winPlan || {};
  const inAnyParty = Object.keys(storeBefore).some(function (hid) { return ((storeBefore[hid] || {}).party || []).indexOf(vid) !== -1; });
  check('no-creation fixture villager holds no plan and sits in no party',
    !storeBefore[vid] && !inAnyParty);
  const rcBefore = (((Game.state.village || {}).winPlanStats || {}).removalCleanups || 0);
  try { Game.freeloadVote(vid); } catch (e) { console.log('  info: no-creation freeloadVote threw: ' + String(e && e.message)); }
  const exiled = (v.roster || []).indexOf(vid) === -1;
  check('no-creation removal itself fired (freeloadVote exiled the villager)',
    exiled, 'still on roster');
  const keysAfter = { winPlan: ('winPlan' in v), winPlanStats: ('winPlanStats' in v) };
  check('no-creation: the removal calls alone create NO winPlan store',
    JSON.stringify(keysAfter) === JSON.stringify(staged.keysBefore),
    'before=' + JSON.stringify(staged.keysBefore) + ' after=' + JSON.stringify(keysAfter));
  const rcAfter = (((Game.state.village || {}).winPlanStats || {}).removalCleanups || 0);
  check('no-creation: removalCleanups did not bump for a plan-less removal',
    rcAfter === rcBefore, 'rc ' + rcBefore + '->' + rcAfter);
  if (exiled) {
    // A short live run afterwards: the village may ignite plans on
    // its own schedule, but the removal itself created nothing.
    const obs = await observeTenDays(Game, vid, staged.g.npcs[1], vid, 'no-creation');
    console.log('  info: no-creation 10d end=' + (obs.result && obs.result.endReason));
  }
}

// ---------- 4. #2482 classifier proof ----------
console.log('== #2482 classifier proof ==');
function synthCorpus(censusRows, deathRows) {
  // Minimal corpus shape for analyzeOne: planCensus + deaths +
  // daily + the empty instrument arrays. Holder H is alive on every
  // row; party member D dies on deathRows[0].day.
  return {
    seed: 900001, gameDays: 20, standing: 0, scaleRank: null, won: false,
    maxWave: 1, deaths: deathRows, daily: [],
    planCensus: censusRows, deadTouches: [], v4creates: [], v4seeds: [],
    dawnbidScores: [], dawnScored: [], companionPool: [], v4departs: [],
    instrumentErrors: [],
  };
}
function classifierProof() {
  // (a) Death-day-only ref: holder names D on the day D dies — NOT a linger.
  const a = synthCorpus(
    [{ vid: 'holder_a', holderAlive: true, day: 11, stage: 'hunt', party: ['dead_d'], target: null }],
    [{ kind: 'villager', who: 'dead_d', day: 11, cause: 'the wild' }]);
  const ca = ANALYZE.classify([a]);
  check('#2482 (a): death-day-only party ref counts 0 slot holders (verdict NOISE-ONLY)',
    ca.slotTotal === 0 && ca.verdict === 'NOISE-ONLY',
    'slotTotal=' + ca.slotTotal + ' verdict=' + ca.verdict);
  // (b) Ref on the death day AND the day after: the post-death row IS a linger.
  const b = synthCorpus(
    [{ vid: 'holder_b', holderAlive: true, day: 11, stage: 'hunt', party: ['dead_d'], target: null },
     { vid: 'holder_b', holderAlive: true, day: 12, stage: 'hunt', party: ['dead_d'], target: null }],
    [{ kind: 'villager', who: 'dead_d', day: 11, cause: 'the wild' }]);
  const cb = ANALYZE.classify([b]);
  const hb = cb.leg.perSeed[0].slot.holders;
  check('#2482 (b): ref on death day + day after counts 1 holder with days=1 (the post-death row)',
    cb.slotTotal === 1 && hb.length === 1 && hb[0].days === 1 && hb[0].firstDeadRefDay === 12,
    'slotTotal=' + cb.slotTotal + ' holders=' + JSON.stringify(hb));
  // (c) Refs 2+ days after: days counts the post-death rows only.
  const c = synthCorpus(
    [{ vid: 'holder_c', holderAlive: true, day: 11, stage: 'hunt', party: ['dead_d'], target: null },
     { vid: 'holder_c', holderAlive: true, day: 12, stage: 'party', party: ['dead_d'], target: null },
     { vid: 'holder_c', holderAlive: true, day: 13, stage: 'party', party: ['dead_d'], target: null }],
    [{ kind: 'villager', who: 'dead_d', day: 11, cause: 'the wild' }]);
  const cc = ANALYZE.classify([c]);
  const hc = cc.leg.perSeed[0].slot.holders;
  check('#2482 (c): refs 2 days after death count 1 holder with days=2',
    cc.slotTotal === 1 && hc.length === 1 && hc[0].days === 2 && hc[0].firstDeadRefDay === 12,
    'slotTotal=' + cc.slotTotal + ' holders=' + JSON.stringify(hc));
  // Real band re-classify: the 3 single-day death-day instances must stop reading COSTLY.
  const dir = path.join(REPO, 'evidence', '2026-11-17', 'perseed-nondeathplan-b-armed');
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort()
    .map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  check('#2482 real band: 8 armed corpora load', files.length === 8, 'n=' + files.length);
  const real = ANALYZE.classify(files);
  check('#2482 real band: armed 103241–103248 reads slotTotal 0, verdict NOISE-ONLY (was COSTLY/3 pre-fix)',
    real.slotTotal === 0 && real.verdict === 'NOISE-ONLY' && real.poolTotal === 0 && real.validityOk === true,
    'slotTotal=' + real.slotTotal + ' verdict=' + real.verdict + ' pool=' + real.poolTotal);
  const dirC = path.join(REPO, 'evidence', '2026-11-17', 'perseed-nondeathplan-b-control');
  const filesC = fs.readdirSync(dirC).filter(function (f) { return /\.json$/.test(f); }).sort()
    .map(function (f) { return JSON.parse(fs.readFileSync(path.join(dirC, f), 'utf8')); });
  const realC = ANALYZE.classify(filesC);
  check('#2482 real band: control 103241–103248 reads slotTotal 0, verdict NOISE-ONLY',
    realC.slotTotal === 0 && realC.verdict === 'NOISE-ONLY' && realC.validityOk === true,
    'slotTotal=' + realC.slotTotal + ' verdict=' + realC.verdict);
}

// ---------- 5. Regression gate: the deadplan proof's SEMANTICS still hold ----------
// test-deadplan-b.js carries three checks frozen to its own arm's era
// that fail on ANY current-master branch, before this arm's change:
//   (a) 'scripts worktree diff is deadplan-* files only' — this arm
//       adds its own proof test, so the diff is not deadplan-only;
//   (b) 'exactly ONE delete of a winPlan entry exists in src/js' —
//       the deathcleanup landing added the second delete spelling;
//   (c) 'static reader check: winPlan lives only in ...' — betrayal.js
//       is a sanctioned winPlan reader since deathcleanup.
// (b) and (c) fail identically on clean master: this arm changes no
// src files, so the counted deletes and the reader list are
// byte-identical to master. The gate therefore runs the test and
// fails ONLY on a failure outside that known set — i.e. the
// classifier fix must introduce no NEW failure (the D4/D8 fixtures
// were updated to the corrected #2482 semantics in the same commit
// as the fix, per the repo rule for a deliberate design change).
console.log('== regression gate ==');
const KNOWN_DEADPLAN_ARTIFACTS = [
  'scripts worktree diff is deadplan-* files only',
  'exactly ONE delete of a winPlan entry exists in src/js (the table-active case, no death cleanup)',
  'static reader check: winPlan lives only in game/agency/brain/win-plan; standing/table clean',
];
function regressionGate() {
  let out = '';
  try {
    out = execFileSync('node', ['scripts/test-deadplan-b.js'], { cwd: REPO, encoding: 'utf8', stdio: 'pipe', maxBuffer: 16 * 1024 * 1024 });
  } catch (e) {
    out = String((e && e.stdout) || '') + String((e && e.stderr) || '');
  }
  const fails = out.split('\n').filter(function (l) { return l.indexOf(' - ') === 0; })
    .map(function (l) { return l.slice(3).split(' — ')[0]; });
  const unknown = fails.filter(function (name) {
    return !KNOWN_DEADPLAN_ARTIFACTS.some(function (k) { return name.indexOf(k) === 0; });
  });
  console.log('  info: test-deadplan-b.js failures: ' + JSON.stringify(fails));
  check('regression gate: test-deadplan-b.js has NO failure outside the 3 known pre-existing artifacts',
    unknown.length === 0, 'unknown=' + JSON.stringify(unknown));
  const m = out.match(/== result: (\d+) passed, (\d+) failed ==/);
  console.log('  info: test-deadplan-b.js result: ' + (m ? m[0] : 'unparsed') + ' (known artifacts: ' + fails.length + ')');
}

(async function () {
  try {
    await liveLegs();
    await noCreationCase();
  } catch (e) {
    fail++;
    failures.push('live legs threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live legs threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  try { classifierProof(); } catch (e) {
    fail++;
    failures.push('classifier proof threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: classifier proof threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  try { regressionGate(); } catch (e) {
    fail++;
    failures.push('regression gate threw: ' + String(e));
    console.log('  FAIL: regression gate threw: ' + String(e));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
