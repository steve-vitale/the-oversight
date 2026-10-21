#!/usr/bin/env node
// test-heraldsplit-20261021.js — proof for the sim-heraldsplit attribution
// layer (backlog #749, herald-split wave-4 census).
//
// Gates (all GREEN before the sweep):
//   E0 shape — module loads, all exports present.
//   E1 det-gate — instrument-on vs instrument-off byte-identical trajectories
//     on the ARMED substrate (VCE.armedFor, VGEAR=1 winning stack), 2 seeds x
//     60d, with the noinstr-vs-noinstr stability pre-check (det-gate standard,
//     scripts/det-gate.js). The instrument is read-only: the trajectory must
//     be byte-identical with it installed.
//   E2 RED->GREEN on synthetic fixtures — titanClass resolution (herald /
//     wave4-monster / other-titan / unresolvable), triggerOf (omen/aid/onExped),
//     attributeRun RED cases (unresolvable class → unexplained; started TB
//     with no fightId AND no day+mid kill fallback → unexplained; unresolved
//     fieldFight with no kill fallback → unexplained) and GREEN cases
//     (refused-solo, outcome-join, kill-join, field-outcome, unmet-spawn).
//   E3 read-only static scan of the instrument source — zero Math.random(,
//     zero Game.state/this.state writes outside the install wraps, t.refusals
//     the only new telemetry sink.
//   E4 armed+instrument determinism — same seed twice, identical hashes.
//   D2 180d armed run completes with the census installed + deterministic
//     re-run (per-seed JSON byte-identical).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   node scripts/test-heraldsplit-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC'];
for (const k of REQ) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (process.env[k] === '1') { console.error(`STOP: ${k} must be unset for the pinned substrate.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const HS = require(path.join(REPO, 'scripts', 'instr-heraldsplit-20261021'));

console.log('== E0 shape ==');
for (const f of ['instrumentOn', 'install', 'titanMonsterKey', 'titanClass', 'triggerOf', 'scholarOf', 'tbEndDetail', 'fieldOutcomeDetail', 'attributeRun']) {
  check(`export ${f}`, typeof HS[f] === 'function');
}
check('instrumentOn() true under KILLDISC=1', HS.instrumentOn() === true);

function newT() {
  return { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, refusals: [], instrumentErrors: [] };
}
async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'heraldsplit-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

(async () => {
  console.log('== E1 det-gate: instrument on vs off, armed substrate, 60d ==');
  async function traj(seed, pid, useInstr) {
    const pol = VCE.armedFor(pid);
    const G = await newGame(seed);
    const t = newT();
    let uninstall = null;
    if (useInstr) uninstall = HS.install(G, t);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 1 }); });
    if (uninstall) uninstall();
    return { hashes: hs.join('\n'), t };
  }
  let gateGreen = 0, gateTotal = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    let judged = false;
    for (const seed of [64871, 64872, 64873, 64874]) {
      if (judged) break;
      const a = await traj(seed, pid, false);
      const b = await traj(seed, pid, false);
      if (a.hashes !== b.hashes) { console.log(`  .. ${pid} s${seed}: noinstr-vs-noinstr UNSTABLE — seed skipped`); continue; }
      gateTotal++;
      const c = await traj(seed, pid, true);
      const same = c.hashes === a.hashes;
      if (same) gateGreen++;
      check(`det ${pid} s${seed} trajectory identical (stable seed)`, same, same ? '' : 'trajectories diverged');
      check(`det ${pid} s${seed} KD base census live`, c.t.census.length > 0, `census=${c.t.census.length}`);
      check(`det ${pid} s${seed} zero instrumentErrors`, c.t.instrumentErrors.length === 0, JSON.stringify(c.t.instrumentErrors.slice(0, 2)));
      judged = true;
    }
    if (!judged) check(`det ${pid}: no stable seed found`, false, 'all 4 seeds flaky');
  }
  check('det-gate all green', gateGreen === gateTotal && gateTotal > 0, `${gateGreen}/${gateTotal}`);

  console.log('== E2 RED->GREEN synthetic fixtures ==');
  // titanClass on a synthetic Game (pure, no harness)
  {
    const fake = {
      data: {
        titans: {
          herald: { monster: 'herald' },
          nielsen: { monster: 'nielsen' },
          _comment: 'x',
        },
        monsters: [{ id: 'herald', wave: 4 }, { id: 'congregation', wave: 4 }, { id: 'eater', wave: 4 }, { id: 'timeslot', wave: 5 }, { id: 'the_redactor', wave: 3 }],
      },
    };
    check('titanClass herald', HS.titanClass(fake, 'herald') === 'herald');
    check('titanClass wave4-monster', HS.titanClass(fake, 'congregation') === 'wave4-monster');
    check('titanClass eater is wave4-monster (not titan)', HS.titanClass(fake, 'eater') === 'wave4-monster');
    check('titanClass wave5-monster', HS.titanClass(fake, 'timeslot') === 'wave5-monster');
    check('titanClass other-titan', HS.titanClass(fake, 'nielsen') === 'other-titan');
    check('titanClass wave-3 mid unresolvable', HS.titanClass(fake, 'the_redactor') === null);
    check('titanClass unknown mid unresolvable', HS.titanClass(fake, 'nope') === null);
    check('titanClass null unresolvable', HS.titanClass(fake, null) === null);
  }
  // triggerOf
  {
    check('trigger titan -> omen', HS.triggerOf({}, 'herald') === 'omen');
    check('trigger other-titan -> omen', HS.triggerOf({ aid: true }, 'other-titan') === 'omen');
    check('trigger aid -> raid', HS.triggerOf({ aid: true }, 'wave4-monster') === 'raid');
    check('trigger onExped -> expedition', HS.triggerOf({ onExped: true }, 'wave4-monster') === 'expedition');
    check('trigger else -> other', HS.triggerOf({}, 'wave4-monster') === 'other');
    check('trigger aid beats exped', HS.triggerOf({ aid: true, onExped: true }, 'wave4-monster') === 'raid');
  }
  // attributeRun RED cases — build a synthetic telemetry object
  {
    const fake = {
      data: {
        titans: { herald: { monster: 'herald' }, finale: { monster: 'finale' } },
        monsters: [
          { id: 'herald', wave: 4 }, { id: 'congregation', wave: 4 },
          { id: 'eater', wave: 4 }, { id: 'timeslot', wave: 5 },
          { id: 'the_redactor', wave: 3 }, { id: 'finale', wave: 5 },
        ],
      },
    };
    const t = newT();
    const ctx0 = { day: 80, scholarVid: 'v1', aid: false, atHaven: true, inTb: false, onExped: false, partyVids: [], fightId: null, nMonsters: 0 };
    // RED 1: engagement with unresolvable class (wave-3 mid in a w4-scoped list — simulate via waveOf override by injecting a fake wave>=4 record? No: unresolvable = waveOf!=4 and not titan. Use a w4-wave mid missing from data.)
    t.engagements.push({ day: 80, mid: 'mystery_w4', wave: 4, shape: 'wild', partySize: 1, fightId: 'f-red1', started: true, ctx: ctx0 });
    // RED 2: started TB, no fightId captured, no day+mid kill fallback → unexplained
    t.engagements.push({ day: 81, mid: 'congregation', wave: 4, shape: 'wild', partySize: 1, fightId: null, started: true, ctx: ctx0 });
    // RED 3: unresolved fieldFight, no kill fallback → unexplained
    t.fieldFights.push({ day: 82, vid: 'v2', mid: 'congregation', wave: 4, outcome: 'unresolved', rounds: null, vTaken: null, mDealt: null, vHpLeft: null, mHpLeft: null, ctx: ctx0 });
    // GREEN 1: refused-solo herald
    t.engagements.push({ day: 83, mid: 'herald', wave: 4, shape: 'wild', partySize: 1, fightId: null, started: false, ctx: ctx0 });
    t.refusals.push({ day: 83, mid: 'herald', titanKey: 'herald', engIdx: 2, reason: 'titan-gate', have: 0, need: 10, ready: false });
    // GREEN 2: outcome-join — started w4-monster TB with tbEnd outcome
    t.engagements.push({ day: 84, mid: 'congregation', wave: 4, shape: 'wild', partySize: 1, fightId: 'f-g2', started: true, ctx: Object.assign({}, ctx0, { fightId: 'f-g2' }) });
    t.tbOutcomes['f-g2'] = 'won';
    // GREEN 3: kill-join — started TB, no tbEnd, but a kill on the fightId
    t.engagements.push({ day: 85, mid: 'congregation', wave: 4, shape: 'raid', partySize: 2, fightId: 'f-g3', started: true, ctx: Object.assign({}, ctx0, { fightId: 'f-g3', aid: true }) });
    t.kills.push({ day: 85, mid: 'congregation', wave: 4, by: 'v1', via: 'player', pyrrhic: false, ctx: Object.assign({}, ctx0, { fightId: 'f-g3' }) });
    // GREEN 4: field-outcome — vKill field fight (kill absorbed by day+mid+vid)
    t.fieldFights.push({ day: 86, vid: 'v2', mid: 'congregation', wave: 4, outcome: 'vKill', rounds: 5, vTaken: 40, mDealt: 900, vHpLeft: 60, mHpLeft: 0, ctx: ctx0 });
    t.kills.push({ day: 86, mid: 'congregation', wave: 4, by: 'v2', via: 'agency', pyrrhic: false, ctx: Object.assign({}, ctx0, { fightId: null }) });
    // GREEN 5: unmet-spawn — w4 spawn with no contact (eater: no units at all)
    t.spawns.push({ day: 87, mid: 'eater', wave: 4, veteran: false, src: 'world' });
    // GREEN 6: contacted spawn — spawn earlier than an engagement, skipped (not a unit)
    t.spawns.push({ day: 70, mid: 'congregation', wave: 4, veteran: false, src: 'cast' });
    // GREEN 7: kill-unjoined unit (aid kill with no engagement)
    t.kills.push({ day: 88, mid: 'congregation', wave: 4, by: 'v3', via: 'aid-crisis', pyrrhic: false, ctx: Object.assign({}, ctx0, { aid: true, fightId: null }) });
    // GREEN 8: titan fieldFight combat outcome → delegated
    t.fieldFights.push({ day: 89, vid: 'v4', mid: 'herald', wave: 4, outcome: 'vFlee', rounds: 3, vTaken: 100, mDealt: 50, vHpLeft: 10, mHpLeft: 5000, ctx: ctx0 });
    // GREEN 9: already-in-fight refusal on a wave-4 monster → refused-solo, end already-in-fight
    t.engagements.push({ day: 90, mid: 'congregation', wave: 4, shape: 'wild', partySize: 1, fightId: null, started: false, ctx: ctx0 });
    t.refusals.push({ day: 90, mid: 'congregation', titanKey: null, engIdx: 5, reason: 'already-in-fight', have: 0, need: 0, ready: false });
    // GREEN 10: wave-5 monster engagement → wave5-monster class, entered
    t.engagements.push({ day: 91, mid: 'timeslot', wave: 5, shape: 'wild', partySize: 1, fightId: 'f-g10', started: true, ctx: Object.assign({}, ctx0, { fightId: 'f-g10' }) });
    t.tbOutcomes['f-g10'] = 'won';

    const a = HS.attributeRun(fake, t);
    check('attribution runs', Array.isArray(a.units));
    check('unexplained == 3 (RED cases)', a.unexplained === 3, `got ${a.unexplained}: ` + JSON.stringify(a.units.filter(u => u.unexplained).map(u => [u.kind, u.mid, u.day, u.resolution])));
    const ux = a.units.filter(u => u.unexplained);
    check('RED1 unresolvable class unexplained', ux.some(u => u.day === 80 && u.resolution === 'unexplained' && u.end === 'unresolvable-class'));
    check('RED2 no-fightId-no-fallback unexplained', ux.some(u => u.day === 81 && u.resolution === 'unexplained'));
    check('RED3 unresolved field no-fallback unexplained', ux.some(u => u.day === 82 && u.resolution === 'unexplained'));
    const byDay = d => a.units.filter(u => u.day === d);
    check('GREEN1 refused-solo herald', byDay(83).some(u => u.outcome === 'refused-solo' && u.end === 'tb-refused' && u.resolution === 'tb-refused' && u.cls === 'herald' && u.trigger === 'omen' && u.refusal && u.refusal.reason === 'titan-gate' && u.refusal.need === 10));
    check('GREEN2 outcome-join won', byDay(84).some(u => u.outcome === 'entered' && u.end === 'won' && u.resolution === 'tb-outcome-join'));
    check('GREEN3 kill-join raid', byDay(85).some(u => u.outcome === 'entered' && u.resolution === 'kill-join' && u.trigger === 'raid' && u.kills === 1));
    check('GREEN4 field-outcome vKill absorbed', byDay(86).some(u => u.kind === 'field' && u.outcome === 'entered' && u.end === 'killed' && u.resolution === 'field-outcome' && u.kills === 1));
    check('GREEN5 unmet-spawn unit', byDay(87).some(u => u.kind === 'spawn' && u.outcome === 'unmet' && u.resolution === 'unmet-spawn'));
    check('GREEN6 contacted spawn skipped', byDay(70).length === 0);
    check('GREEN7 kill-unjoined unit', byDay(88).some(u => u.kind === 'kill' && u.resolution === 'kill-join' && u.trigger === 'raid'));
    check('GREEN8 titan field vFlee → fled', byDay(89).some(u => u.outcome === 'fled' && u.cls === 'herald'));
    check('GREEN9 already-in-fight refusal', byDay(90).some(u => u.outcome === 'refused-solo' && u.end === 'already-in-fight' && u.resolution === 'tb-refused' && u.refusal && u.refusal.reason === 'already-in-fight'));
    check('GREEN10 wave5-monster entered', byDay(91).some(u => u.cls === 'wave5-monster' && u.outcome === 'entered' && u.end === 'won'));
    check('zero instrumentErrors on fixture', a.instrumentErrors === 0);
  }

  console.log('== E3 read-only static scan ==');
  {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'instr-heraldsplit-20261021.js'), 'utf8');
    const lines = src.split('\n');
    const sinkOK = /t\.(kills|engagements|fieldFights|spawns|tbOutcomes|census|dmg|refusals|instrumentErrors)/;
    const badGame = lines.filter(l => {
      if (/^\s*\/\//.test(l)) return false;
      if (sinkOK.test(l)) return false;
      const m = l.match(/Game\.\w+\s*=(?!=)/);
      if (!m) return false;
      // install-time wrap install/uninstall only
      if (/Game\[name\] = function/.test(l)) return false;
      if (/Game\.startCombat = (function|origStart)/.test(l)) return false;
      return true;
    });
    check('no Game.<x> assignments outside install wraps', badGame.length === 0, badGame.slice(0, 3).join(' | '));
    const badState = lines.filter(l => {
      if (/^\s*\/\//.test(l)) return false;
      if (sinkOK.test(l)) return false;
      return /Game\.state\.\w+\s*=(?!=)|this\.state\.\w+\s*=(?!=)/.test(l);
    });
    check('no Game.state / this.state writes', badState.length === 0, badState.slice(0, 3).join(' | '));
    const rngLines = lines.filter(l => !/^\s*\/\//.test(l) && /Math\.random\s*\(/.test(l));
    check('no RNG draws in instrument', rngLines.length === 0, rngLines.slice(0, 3).join(' | '));
  }

  console.log('== E4 armed+instrument determinism ==');
  {
    async function run(seed) {
      const pol = VCE.armedFor('leadfeast');
      const G = await newGame(seed);
      const t = newT();
      const uninstall = HS.install(G, t);
      const hs = [];
      const wrapped = Object.assign({}, pol, {
        daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
      });
      await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 1 }); });
      uninstall();
      const a = HS.attributeRun(G, t);
      return { h: hs.join('\n'), errs: t.instrumentErrors.length, units: a.units.length };
    }
    const r1 = await run(64871);
    const r2 = await run(64871);
    check('instrument-on run deterministic', r1.h === r2.h, 'hashes diverged');
    check('instrument-on zero errors x2', r1.errs === 0 && r2.errs === 0, `${r1.errs}/${r2.errs}`);
  }

  console.log(`\n${pass} passed, ${fail} failed (gates E0-E4)`);
  if (fail) process.exit(1);

  console.log('== D2: 180d armed run through the REAL sweep + deterministic re-run ==');
  {
    const outDir = '/tmp/hs-proof-sweep';
    execSync(`rm -rf ${outDir} && mkdir -p ${outDir}`);
    const env = Object.assign({}, process.env, { SEEDS: '64871', POLICIES: 'leadfeast', EVID: outDir, DAYS: '180' });
    const run = () => execFileSync('node', [path.join(REPO, 'scripts', 'sweep-heraldsplit-20261021.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    run();
    const fp = path.join(outDir, 'leadfeast', 's64871.json');
    check('sweep wrote per-seed JSON', fs.existsSync(fp));
    let j1 = null;
    try { j1 = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
    check('zero instrument errors', j1 && (j1.instrumentErrors || []).length === 0, JSON.stringify(j1 && j1.instrumentErrors));
    check('attribution present (nUnits>0 or no w4 reached)', j1 && (typeof j1.nUnits === 'number'), JSON.stringify(j1 && j1.nUnits));
    check('PRIMARY shape: unexplained is a number', j1 && typeof j1.unexplained === 'number', JSON.stringify(j1 && j1.unexplained));
    const b1 = fs.readFileSync(fp, 'utf8');
    run();
    const b2 = fs.readFileSync(fp, 'utf8');
    check('re-run byte-identical', b1 === b2, `len ${b1.length} vs ${b2.length}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
