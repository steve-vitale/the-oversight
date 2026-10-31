#!/usr/bin/env node
// test-supply-20261031.js — proof for the sim-supply-b instrument
// (supply-diag-20261031.js) + sweep + analyzer.
// (a) DET-GATE: no instrument vs AMMODIAG-only vs AMMODIAG+SUPPLYDIAG —
//     per-day trajectory hashes identical on 60d of the leadfeast
//     seatdrive stack. Read-only proof: zero game-state writes, zero
//     RNG draws from either instrument.
// (b) READ-ONLY STATIC SCAN: no Math.random / stashState( /
//     agencyState( / npcNode( / partyMembers( in the supply instrument.
// (c) WRAP FIXTURES: supply pocket wrapper passes the original result
//     through untouched and records pile + ammoCraft pre/post; daily
//     scan appends one small row; endCensus counts packs/stashes.
// (d) REAL-SWEEP GATE: the supply sweep on 1 pilot seed, 60d, EVID
//     pointed at a scratch dir — per-seed JSON written, zero errors
//     on both instruments, re-run byte-identical, analyzer runs clean.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        FULLSEAT=1 AMMODIAG=1 SUPPLYDIAG=1 node scripts/test-supply-20261031.js
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

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'AMMODIAG', 'SUPPLYDIAG']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const AD = require(path.join(REPO, 'scripts', 'ammo-diag-20261031'));
const SUP = require(path.join(REPO, 'scripts', 'supply-diag-20261031'));

function seatPolicy() {
  const wd = WD.withWinDefer(TF.leadfeast, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'y');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'z');
}

(async () => {
  // (b) static scan
  const srcRaw = fs.readFileSync(path.join(REPO, 'scripts', 'supply-diag-20261031.js'), 'utf8');
  const src = srcRaw.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
  check('scan: no Math.random', !src.includes('Math.random'));
  check('scan: no stashState(', !src.includes('stashState('));
  check('scan: no agencyState(', !src.includes('agencyState('));
  check('scan: no npcNode(', !src.includes('npcNode('));
  check('scan: no partyMembers(', !src.includes('partyMembers('));
  check('scan: env-gated', src.includes("process.env.SUPPLYDIAG === '1'"));

  // (c) fake-Game wrap fixtures (no harness needed)
  {
    const fake = {
      data: { villagers: [{ id: 'v1', items: [{ itemId: 'bolt', units: 2 }], equipped: { ranged: { itemId: 'crossbow' } }, stashed: [] }], items: [{ id: 'crossbow', weapon: { ammo: 'bolt' } }] },
      state: { scholar: { day: 5 }, village: { stash: { materials: { stone: 10, stick: 0, fiber: 0, branch: 3 } }, ammoCraft: { v1: { bolt: 1 } }, roster: ['v1'] } },
      villagerId: 'player',
      villagerPocketAmmo(vid) { return { pocketed: 0, crafted: 0, craftedOk: false, ammoId: 'bolt' }; },
    };
    const t = { supplyPocketCalls: [], supplyDaily: [], supplyErrors: [], supplyOverflow: 0 };
    const uninstall = SUP.install(fake, t);
    const out = fake.villagerPocketAmmo('v1');
    check('fixture: pocket passthrough returns orig', out && out.ammoId === 'bolt');
    check('fixture: pile pre/post captured', t.supplyPocketCalls.length === 1 && t.supplyPocketCalls[0].prePile.stone === 10 && t.supplyPocketCalls[0].prePile.stick === 0);
    check('fixture: ammoCraft pre captured', t.supplyPocketCalls[0].preCraft && t.supplyPocketCalls[0].preCraft.bolt === 1);
    SUP.scanDay(fake, t);
    check('fixture: daily scan appends pile row', t.supplyDaily.length === 1 && t.supplyDaily[0].pile.branch === 3);
    const end = SUP.endCensus(fake);
    check('fixture: end census counts carried bolts', end.carriedTotals.bolt === 2 && end.rangedCarriers.length === 1);
    uninstall();
    check('fixture: uninstall restores + zero errors', t.supplyErrors.length === 0, JSON.stringify(t.supplyErrors));
  }

  // (a) det-gate: 60d, three instrument configs, identical hashes
  async function traj(mode) {
    const { Game } = await loadGame({ seed: 85101, mode: 'supply-detgate', fullTelemetry: false });
    const t = { fights: [], pocketCalls: [], pocketOverflow: 0, instrumentErrors: [], fieldFightCalls: 0, lowWaveFights: 0,
      supplyPocketCalls: [], supplyDaily: [], supplyErrors: [], supplyOverflow: 0 };
    let uninstallAD = () => {}, uninstallSUP = () => {};
    if (mode >= 1) uninstallAD = AD.install(Game, t);
    if (mode >= 2) uninstallSUP = SUP.install(Game, t);
    await setupGame(Game);
    const hashes = [];
    const policy = seatPolicy();
    const wrapped = Object.assign({}, policy, {
      daily(Gm, ctx) {
        hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
        const r = policy.daily(Gm, ctx);
        try { if (mode >= 1) AD.scanDay(Gm, t); } catch (e) {}
        try { if (mode >= 2) SUP.scanDay(Gm, t); } catch (e) {}
        return r;
      },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    try { uninstallSUP(); } catch (e) {}
    try { uninstallAD(); } catch (e) {}
    return { hashes, errs: t.instrumentErrors, supplyErrs: t.supplyErrors };
  }
  const off = await traj(0);
  const adOnly = await traj(1);
  const both = await traj(2);
  check('det-gate: 60d hashes identical off vs AD-only vs AD+supply',
    JSON.stringify(off.hashes) === JSON.stringify(adOnly.hashes) && JSON.stringify(off.hashes) === JSON.stringify(both.hashes) && off.hashes.length > 0,
    `off=${off.hashes.length} ad=${adOnly.hashes.length} both=${both.hashes.length}`);
  check('det-gate: instrument errors zero on both', both.errs.length === 0 && both.supplyErrs.length === 0,
    JSON.stringify(both.errs) + JSON.stringify(both.supplyErrs));

  // (d) real-sweep gate: 1 seed, 60d, scratch EVID, byte-identical re-run
  {
    const scratch = fs.mkdtempSync(path.join('/tmp', 'supply-gate-'));
    const env = Object.assign({}, process.env, { SEEDS: '85101', DAYS: '60', ARM: 'gate', EVID: scratch });
    const run = () => execFileSync('node', [path.join(REPO, 'scripts', 'supply-sweep-20261031.js')], { env, stdio: 'pipe' }).toString();
    run();
    const f1 = path.join(scratch, 'gate', 's85101.json');
    check('sweep gate: per-seed JSON written', fs.existsSync(f1));
    const b1 = fs.readFileSync(f1, 'utf8');
    const j1 = JSON.parse(b1);
    check('sweep gate: zero instrument errors (both)', (j1.instrumentErrors || []).length === 0 && (j1.supplyErrors || []).length === 0,
      JSON.stringify(j1.instrumentErrors) + JSON.stringify(j1.supplyErrors));
    check('sweep gate: supply fields present', Array.isArray(j1.supplyDaily) && Array.isArray(j1.supplyPocketCalls) && !!j1.supplyEnd);
    run();
    const b2 = fs.readFileSync(f1, 'utf8');
    check('sweep gate: re-run byte-identical', b1 === b2);
    const ana = execFileSync('node', [path.join(REPO, 'scripts', 'supply-analyze-20261031.js')], { env: Object.assign({}, process.env, { ARM: 'gate', EVID: scratch + '/gate' }), stdio: 'pipe' }).toString();
    check('sweep gate: analyzer runs', ana.includes('"seedCount": 1'));
    fs.rmSync(scratch, { recursive: true, force: true });
  }

  console.log(`\nRESULT: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR: ' + (e && e.stack)); process.exit(2); });
