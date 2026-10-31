#!/usr/bin/env node
// test-deadfall-b.js — proof for the sim-deadfall-b prototype.
// (a) STATIC: duty entry + resolve branch + competence + perceive
//     stick line + staffing-layer env gate all present in source.
// (b) LIVE FIXTURE: resolveOneAssignment('deadfall') on a real loaded
//     game produces sticks (+sometimes fiber) into the communal stash,
//     counts the off-state ledger, and says a return line.
// (c) STAFFING FIXTURE: staffDeadfall assigns only free villagers,
//     never pulls an assigned one, respects WANT and the pile cap.
// (d) LIVE SWEEP GATE: 60d seed 85101 — staffing-off pile sticks 0 +
//     hauls 0; staffing-on hauls > 0 + pile sticks > 0; staffing-on
//     re-run byte-identical.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
//        FULLSEAT=1 AMMODIAG=1 SUPPLYDIAG=1 STICKFIBERDIAG=1 node scripts/test-deadfall-b.js
// (DEADFALL_B is set by the script itself for the on-gate runs.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'AMMODIAG', 'SUPPLYDIAG', 'STICKFIBERDIAG']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const DF = require(path.join(REPO, 'scripts', 'policies', 'deadfall-b'));

function sweepEnv(extra) {
  const env = Object.assign({}, process.env, extra);
  delete env.DEADFALL_B;
  return Object.assign(env, extra);
}

(async () => {
  // (a) static
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('static: delegateTasks deadfall entry', gameSrc.includes("deadfall: { icon: '🪾'"));
  check('static: resolve deadfall branch', gameSrc.includes("a.task === 'deadfall'"));
  check('static: deadfall writes pile stick', gameSrc.includes('st.materials.stick = (st.materials.stick || 0) + sticks'));
  check('static: deadfall writes pile fiber', gameSrc.includes('st.materials.fiber = (st.materials.fiber || 0) + fiber'));
  check('static: deadfall off-state ledger', gameSrc.includes('this._deadfallHauls'));
  check('static: competence deadfall branch', gameSrc.includes("task === 'deadfall'"));
  // The branch comment names the axe gate only to say it does NOT apply;
  // the real check is that the branch calls no tool-gate function.
  const _branch = (gameSrc.split("a.task === 'deadfall'")[1] || '').split('} else if')[0];
  check('static: no axe gate on deadfall', _branch.includes('no axe gate') && !/toolTier|axeTier|hasAxe|requireTool/.test(_branch));
  const percSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'perceive.js'), 'utf8');
  check('static: perceive stash lists stick', percSrc.includes("'branch', 'wood', 'stone', 'fiber', 'stick'") && percSrc.includes("stick: 'sticks'"));
  const dfSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'deadfall-b.js'), 'utf8');
  check('static: staffing env-gated', dfSrc.includes("process.env.DEADFALL_B === '1'"));
  check('static: staffing never pulls assigned', dfSrc.includes('if (asg[id]) continue'));
  check('static: staffing checks pile threshold', dfSrc.includes('PILE_STICK_WANT'));

  // (c) staffing fixture on a fake Game
  {
    const assigned = {};
    const fake = {
      villagerId: 'scholar',
      state: { village: { roster: ['v1', 'v2', 'v3', 'v4'], assignments: { v1: { task: 'wood' } } } },
      getPerson: (id) => ({ id, dead: false }),
      playerAtHaven: () => true,
      stashState: () => ({ materials: { stick: 0 } }),
      assignTask: (id) => { assigned[id] = true; fake.state.village.assignments[id] = { task: 'deadfall' }; return { ok: true }; },
    };
    const n = DF.staffDeadfall(fake);
    check('fixture: staffs up to WANT from free only', n === 2 && assigned.v2 && assigned.v3 && !assigned.v1 && !assigned.v4,
      JSON.stringify(Object.keys(assigned)));
    check('fixture: second call staffs none (already staffed)', DF.staffDeadfall(fake) === 0);
    const fakeFull = Object.assign({}, fake, { stashState: () => ({ materials: { stick: 6 } }),
      state: { village: { roster: ['v9'], assignments: {} } } });
    fakeFull.assignTask = () => { throw new Error('should not assign at pile cap'); };
    check('fixture: pile at cap staffs none', DF.staffDeadfall(fakeFull) === 0);
    // Attempt cap: all-refusing roster -> at most 3 attempts, none staffed.
    let attempts = 0;
    const fakeRefuse = {
      villagerId: 'scholar',
      state: { village: { roster: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'], assignments: {} } },
      getPerson: (id) => ({ id, dead: false }),
      playerAtHaven: () => true,
      stashState: () => ({ materials: { stick: 0 } }),
      assignTask: () => { attempts++; return { ok: false, refused: true }; },
    };
    check('fixture: attempt cap stops roster-walking', DF.staffDeadfall(fakeRefuse) === 0 && attempts === 3,
      `staffed/attempts: attempts=${attempts}`);
  }

  // (b) live fixture: resolve the duty on a real game
  {
    const { Game } = await loadGame({ seed: 85101, mode: 'deadfall-proof', fullTelemetry: false });
    await setupGame(Game);
    const roster = (Game.state.village.roster || []).filter(id => { try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; } });
    check('fixture: roster has a living villager', roster.length > 0, String(roster.length));
    const vid = roster[0];
    const tasks = Game.delegateTasks();
    check('fixture: delegateTasks offers deadfall', !!tasks.deadfall);
    const comp = Game.villagerCompetence(vid, 'deadfall');
    check('fixture: competence returns a number', typeof comp === 'number' && comp > 0, String(comp));
    const said = [];
    const origSay = Game.say.bind(Game);
    Game.say = (m) => { said.push(String(m)); try { return origSay(m); } catch (e) { return m; }; };
    const before = (() => { try { return Game.stashState().materials.stick || 0; } catch (e) { return 0; } })();
    for (let i = 0; i < 5; i++) Game.resolveOneAssignment(vid, { task: 'deadfall' });
    const after = (() => { try { return Game.stashState().materials.stick || 0; } catch (e) { return 0; } })();
    check('fixture: 5 resolutions add >=5 pile sticks', after - before >= 5, `${before} -> ${after}`);
    check('fixture: ledger counts 5 hauls', Game._deadfallHauls === 5, String(Game._deadfallHauls));
    check('fixture: ledger sticks match pile gain', Game._deadfallSticks === after - before, `${Game._deadfallSticks} vs ${after - before}`);
    const lines = said.filter(m => m.includes('deadfall'));
    check('fixture: return line narrates deadfall + pile growth', lines.length === 5 && lines.every(m => m.includes('The pile grows')),
      JSON.stringify(lines.slice(0, 2)));
    Game.say = origSay;
  }

  // (d) live sweep gate, 60d, seed 85101, scratch EVID
  const scratch = '/tmp/proof-deadfall-b';
  function runSweep(arm, deadfall) {
    const env = sweepEnv({ SEEDS: '85101', ARM: arm, DAYS: '60', EVID: scratch });
    if (deadfall) env.DEADFALL_B = '1';
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'deadfall-sweep-20261031.js')], { cwd: REPO, env, stdio: 'pipe' });
    return JSON.parse(fs.readFileSync(path.join(scratch, arm, 's85101.json'), 'utf8'));
  }
  const off = runSweep('baseline', false);
  check('gate: staffing-off hauls 0', off.deadfallHauls === 0, String(off.deadfallHauls));
  const offStickDays = (off.supplyDaily || []).filter(r => r.pile && (r.pile.stick || 0) > 0).length;
  check('gate: staffing-off pile sticks 0 every day', offStickDays === 0, String(offStickDays));
  const on1 = runSweep('prototype', true);
  check('gate: staffing-on hauls > 0', (on1.deadfallHauls || 0) > 0, String(on1.deadfallHauls));
  check('gate: staffing-on pile sticks > 0 some day', (on1.supplyDaily || []).some(r => r.pile && (r.pile.stick || 0) > 0));
  check('gate: staffing-on zero instrument errors', (on1.instrumentErrors || []).length === 0 && (on1.supplyErrors || []).length === 0 && (on1.stickfiberErrors || []).length === 0,
    JSON.stringify([on1.instrumentErrors, on1.supplyErrors, on1.stickfiberErrors]));
  const bytes1 = fs.readFileSync(path.join(scratch, 'prototype', 's85101.json'), 'utf8');
  runSweep('prototype', true);
  const bytes2 = fs.readFileSync(path.join(scratch, 'prototype', 's85101.json'), 'utf8');
  check('gate: staffing-on re-run byte-identical', bytes1 === bytes2);

  console.log(`\ntest-deadfall-b: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e && e.stack); process.exit(1); });
