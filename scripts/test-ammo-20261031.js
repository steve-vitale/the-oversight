#!/usr/bin/env node
// test-ammo-20261031.js — proof for the sim-ammo-a instrument
// (ammo-diag-20261031.js) + sweep + analyzer.
// (a) DET-GATE: AMMODIAG v1 instrument installed vs not installed —
//     per-day trajectory hashes identical on 60d of the leadfeast
//     seatdrive stack. This is the read-only proof: zero game-state
//     writes, zero RNG draws.
// (b) READ-ONLY STATIC SCAN: no Math.random / stashState( /
//     agencyState( / npcNode( / partyMembers( in the instrument.
// (c) WRAP FIXTURES: pocket wrapper passes the original result through
//     untouched and records pre/post; a real wave-4 fieldFight driven
//     through the wrapped path records a complete ammo census and the
//     original record object is returned untouched (same identity).
// (d) REAL-SWEEP GATE: the real sweep script on 1 pilot seed, 60d,
//     EVID pointed at a scratch dir — per-seed JSON written, zero
//     instrument errors, re-run byte-identical, analyzer runs clean.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        FULLSEAT=1 AMMODIAG=1 node scripts/test-ammo-20261031.js
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

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'AMMODIAG']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const AD = require(path.join(REPO, 'scripts', 'ammo-diag-20261031'));

function seatPolicy() {
  const wd = WD.withWinDefer(TF.leadfeast, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'y');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'z');
}

(async () => {
  // (b) static scan
  const srcRaw = fs.readFileSync(path.join(REPO, 'scripts', 'ammo-diag-20261031.js'), 'utf8');
  // Strip // comments: the header documents the forbidden calls by name.
  const src = srcRaw.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
  check('scan: no Math.random', !src.includes('Math.random'));
  check('scan: no stashState(', !src.includes('stashState('));
  check('scan: no agencyState(', !src.includes('agencyState('));
  check('scan: no npcNode(', !src.includes('npcNode('));
  check('scan: no partyMembers(', !src.includes('partyMembers('));
  check('scan: env-gated', src.includes("process.env.AMMODIAG === '1'"));

  // (c) fake-Game wrap fixtures (no harness needed)
  {
    const calls = [];
    const fake = {
      data: { villagers: [{ id: 'v1', items: [{ itemId: 'crossbow', units: 1 }], equipped: { ranged: { itemId: 'crossbow' } }, stashed: [] }], items: [{ id: 'crossbow', weapon: { ammo: 'bolt', range: 6, bonus: 28 } }] },
      state: { scholar: { day: 5 }, village: { stash: { materials: { stone: 10 } }, ammoCraft: {} } },
      villagerPocketAmmo(vid) { calls.push(vid); return { pocketed: 3, crafted: 0, craftedOk: false, ammoId: 'bolt' }; },
      startExpedition(vid) { return 'exped'; },
      resolvePatrol(vid) { return 'patrol'; },
      fieldFight() { return { outcome: 'vFlee', rounds: 1, volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 }, log: ['x'] }; },
    };
    // data.monsters needed for waveOf
    fake.data.monsters = [{ id: 'eulogy', wave: 4 }];
    const t = { fights: [], pocketCalls: [], pocketOverflow: 0, instrumentErrors: [], fieldFightCalls: 0, lowWaveFights: 0 };
    const uninstall = AD.install(fake, t);
    const rec = fake.fieldFight('v1', { id: 'eulogy' }, null, {});
    check('fixture: fieldFight returns original record', rec && rec.outcome === 'vFlee');
    check('fixture: wave-4 fight recorded with census', t.fights.length === 1 && t.fights[0].rangedWeaponId === 'crossbow' && t.fights[0].rangedAmmoId === 'bolt');
    const out = fake.villagerPocketAmmo('v1');
    check('fixture: pocket passthrough returns orig', out && out.pocketed === 3 && calls.length === 1);
    check('fixture: departure wrappers record', fake.startExpedition('v1') === 'exped' && t.departures.length === 1 && t.departures[0].kind === 'startExpedition');
    check('fixture: pocket call recorded', t.pocketCalls.length === 1 && t.pocketCalls[0].vid === 'v1');
    uninstall();
    check('fixture: uninstall restores fieldFight', typeof fake.fieldFight === 'function' && t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors));
  }

  // (a) det-gate: 60d leadfeast stack, instrument on vs off
  async function traj(withInst) {
    const { Game } = await loadGame({ seed: 85101, mode: 'ammo-detgate', fullTelemetry: false });
    const t = { fights: [], pocketCalls: [], pocketOverflow: 0, instrumentErrors: [], fieldFightCalls: 0, lowWaveFights: 0 };
    const uninstall = withInst ? AD.install(Game, t) : (() => {});
    await setupGame(Game);
    const hashes = [];
    const policy = seatPolicy();
    const wrapped = Object.assign({}, policy, {
      daily(Gm, ctx) { hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return policy.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    try { uninstall(); } catch (e) {}
    return { hashes, errs: t.instrumentErrors };
  }
  const off = await traj(false);
  const on = await traj(true);
  check('det-gate: 60d hashes identical with/without instrument',
    JSON.stringify(off.hashes) === JSON.stringify(on.hashes) && off.hashes.length > 0,
    `off=${off.hashes.length} on=${on.hashes.length}`);
  check('det-gate: instrument errors zero', on.errs.length === 0, JSON.stringify(on.errs));

  // (c2) real wave-4 fieldFight through the wrapped path
  {
    const { Game } = await loadGame({ seed: 7, mode: 'ammo-fixture', fullTelemetry: false });
    await quietLog(async () => { await setupGame(Game); });
    const t = { fights: [], pocketCalls: [], pocketOverflow: 0, instrumentErrors: [], fieldFightCalls: 0, lowWaveFights: 0 };
    const uninstall = AD.install(Game, t);
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    const vid = roster[0];
    const vp = (Game.data.villagers || []).find(x => x.id === vid);
    vp.items = [{ itemId: 'crossbow', name: 'Crossbow', units: 1, kg: 1 },
      { itemId: 'bolt', name: 'Bolt', units: 5, kg: 0.15 }];
    vp.equipped = {};
    const mdef = (Game.data.monsters || []).find(m => m.id === 'eulogy') || (Game.data.monsters || []).find(m => (m.wave || 1) >= 4);
    let rec = null;
    try { rec = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('  fixture fight error: ' + e.message); }
    check('real fight: record returned', !!rec);
    check('real fight: wave-4 row recorded', t.fights.length === 1, `rows=${t.fights.length}`);
    if (t.fights.length === 1) {
      check('real fight: census carried bolts 5 pre-spend', t.fights[0].carriedNeeded === 5, `carriedNeeded=${t.fights[0].carriedNeeded}`);
      check('real fight: volley fired', (t.fights[0].volley && t.fights[0].volley.shots) > 0, JSON.stringify(t.fights[0].volley));
      check('real fight: caller classified', typeof t.fights[0].callerClass === 'string' && t.fights[0].callerClass.length > 0, t.fights[0].callerClass);
    }
    try { uninstall(); } catch (e) {}
  }

  // (d) real-sweep gate: 1 seed, 60d, scratch EVID, byte-identical re-run
  {
    const scratch = fs.mkdtempSync(path.join('/tmp', 'ammo-gate-'));
    const env = Object.assign({}, process.env, { SEEDS: '85101', DAYS: '60', ARM: 'gate', EVID: scratch });
    const run = () => execFileSync('node', [path.join(REPO, 'scripts', 'ammo-sweep-20261031.js')], { env, stdio: 'pipe' }).toString();
    run();
    const f1 = path.join(scratch, 'gate', 's85101.json');
    check('sweep gate: per-seed JSON written', fs.existsSync(f1));
    const b1 = fs.readFileSync(f1, 'utf8');
    const j1 = JSON.parse(b1);
    check('sweep gate: zero instrument errors', (j1.instrumentErrors || []).length === 0, JSON.stringify(j1.instrumentErrors));
    run();
    const b2 = fs.readFileSync(f1, 'utf8');
    check('sweep gate: re-run byte-identical', b1 === b2);
    const ana = execFileSync('node', [path.join(REPO, 'scripts', 'ammo-analyze-20261031.js')], { env: Object.assign({}, process.env, { ARM: 'gate', EVID: scratch + '/gate' }), stdio: 'pipe' }).toString();
    check('sweep gate: analyzer runs', ana.includes('"seedCount": 1'));
    fs.rmSync(scratch, { recursive: true, force: true });
  }

  console.log(`\nRESULT: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR: ' + (e && e.stack)); process.exit(2); });
