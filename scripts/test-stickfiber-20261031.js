#!/usr/bin/env node
// test-stickfiber-20261031.js — proof for the sim-stickfiber-b
// instrument (stickfiber-diag-20261031.js) + sweep + events analyzer.
// (a) DET-GATE: no instrument vs AMMODIAG+SUPPLYDIAG vs all three —
//     per-day trajectory hashes identical on 60d of the leadfeast
//     seatdrive stack. Read-only proof: zero game-state writes, zero
//     RNG draws from the new instrument.
// (b) READ-ONLY STATIC SCAN: no Math.random / stashState( /
//     agencyState( / npcNode( / partyMembers( in the new instrument.
// (c) WRAP FIXTURES: counters count, original results pass through,
//     uninstall restores, missing methods are recorded not thrown.
// (d) REAL-SWEEP GATE: the stickfiber sweep on 1 pilot seed, 60d,
//     EVID pointed at a scratch dir — per-seed JSON written, zero
//     errors on all three instruments, re-run byte-identical,
//     analyzer + events script run clean.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
//        FULLSEAT=1 AMMODIAG=1 SUPPLYDIAG=1 STICKFIBERDIAG=1 node scripts/test-stickfiber-20261031.js
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

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const AD = require(path.join(REPO, 'scripts', 'ammo-diag-20261031'));
const SUP = require(path.join(REPO, 'scripts', 'supply-diag-20261031'));
const SF = require(path.join(REPO, 'scripts', 'stickfiber-diag-20261031'));

function seatPolicy() {
  const wd = WD.withWinDefer(TF.leadfeast, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'y');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'z');
}

(async () => {
  // (b) static scan
  const srcRaw = fs.readFileSync(path.join(REPO, 'scripts', 'stickfiber-diag-20261031.js'), 'utf8');
  const src = srcRaw.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
  check('scan: no Math.random', !src.includes('Math.random'));
  check('scan: no stashState(', !src.includes('stashState('));
  check('scan: no agencyState(', !src.includes('agencyState('));
  check('scan: no npcNode(', !src.includes('npcNode('));
  check('scan: no partyMembers(', !src.includes('partyMembers('));
  check('scan: env-gated', src.includes("process.env.STICKFIBERDIAG === '1'"));

  // (c) fake-Game wrap fixtures
  {
    const fake = {
      state: { scholar: { day: 5, inventory: [{ material: 'stick', units: 2 }, { material: 'fiber', units: 1 }] } },
      addMaterial(mat, n) { return n; },
      donateMaterial(mat, n) { return n; },
      inviteReward() { return { kind: 'bundle', line: 'x' }; },
      craft(id) { return { id }; },
    };
    const t = { stickfiberRows: [], stickfiberErrors: [] };
    const uninstall = SF.install(fake, t);
    check('fixture: passthrough addMaterial', fake.addMaterial('stick', 3) === 3);
    fake.addMaterial('fiber', 2);
    fake.donateMaterial('fiber', 4);
    fake.inviteReward('v1');
    fake.craft('arrow');
    SF.scanDay(fake, t);
    const row = t.stickfiberRows[0];
    check('fixture: counters counted', row && row.addStick === 3 && row.addFiber === 2 && row.donateFiber === 4 && row.inviteBundle === 1 && row.craftArrow === 1,
      JSON.stringify(row));
    check('fixture: scholar pack snapshot recorded', row && row.scholarStick === 2 && row.scholarFiber === 1, JSON.stringify(row));
    uninstall();
    check('fixture: uninstall restores + zero errors', t.stickfiberErrors.length === 0, JSON.stringify(t.stickfiberErrors));
    fake.addMaterial('stick', 9);
    SF.scanDay(fake, t);
    check('fixture: post-uninstall calls not counted', t.stickfiberRows[1].addStick === 3);
  }
  {
    // missing methods are recorded, not thrown
    const bare = { state: { scholar: { day: 1 } } };
    const t = { stickfiberRows: [], stickfiberErrors: [] };
    const uninstall = SF.install(bare, t);
    check('fixture: missing methods recorded', t.stickfiberErrors.length === 4, JSON.stringify(t.stickfiberErrors));
    uninstall();
  }

  // (a) det-gate: 60d, three instrument configs, identical hashes
  async function traj(mode) {
    const { Game } = await loadGame({ seed: 85101, mode: 'stickfiber-detgate', fullTelemetry: false });
    const t = { fights: [], pocketCalls: [], pocketOverflow: 0, instrumentErrors: [], fieldFightCalls: 0, lowWaveFights: 0,
      supplyPocketCalls: [], supplyDaily: [], supplyErrors: [], supplyOverflow: 0, stickfiberRows: [], stickfiberErrors: [] };
    let uninstallAD = () => {}, uninstallSUP = () => {}, uninstallSF = () => {};
    if (mode >= 1) uninstallAD = AD.install(Game, t);
    if (mode >= 2) uninstallSUP = SUP.install(Game, t);
    if (mode >= 3) uninstallSF = SF.install(Game, t);
    await setupGame(Game);
    const hashes = [];
    const policy = seatPolicy();
    const wrapped = Object.assign({}, policy, {
      daily(Gm, ctx) {
        hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
        const r = policy.daily(Gm, ctx);
        try { if (mode >= 1) AD.scanDay(Gm, t); } catch (e) {}
        try { if (mode >= 2) SUP.scanDay(Gm, t); } catch (e) {}
        try { if (mode >= 3) SF.scanDay(Gm, t); } catch (e) {}
        return r;
      },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    try { uninstallSF(); } catch (e) {}
    try { uninstallSUP(); } catch (e) {}
    try { uninstallAD(); } catch (e) {}
    return { hashes, errs: t.instrumentErrors, supplyErrs: t.supplyErrors, sfErrs: t.stickfiberErrors };
  }
  const off = await traj(0);
  const adSup = await traj(2);
  const all = await traj(3);
  check('det-gate: 60d hashes identical off vs AD+supply vs all-three',
    JSON.stringify(off.hashes) === JSON.stringify(adSup.hashes) && JSON.stringify(off.hashes) === JSON.stringify(all.hashes) && off.hashes.length > 0,
    `off=${off.hashes.length} adsup=${adSup.hashes.length} all=${all.hashes.length}`);
  check('det-gate: instrument errors zero on all-three', all.errs.length === 0 && all.supplyErrs.length === 0 && all.sfErrs.length === 0,
    JSON.stringify(all.errs) + JSON.stringify(all.supplyErrs) + JSON.stringify(all.sfErrs));

  // (d) real-sweep gate: 1 seed, 60d, scratch EVID, byte-identical re-run
  {
    const scratch = fs.mkdtempSync(path.join('/tmp', 'stickfiber-gate-'));
    const env = Object.assign({}, process.env, { SEEDS: '85101', DAYS: '60', ARM: 'gate', EVID: scratch });
    const run = () => execFileSync('node', [path.join(REPO, 'scripts', 'stickfiber-sweep-20261031.js')], { env, stdio: 'pipe' }).toString();
    run();
    const f1 = path.join(scratch, 'gate', 's85101.json');
    check('sweep gate: per-seed JSON written', fs.existsSync(f1));
    const b1 = fs.readFileSync(f1, 'utf8');
    const j1 = JSON.parse(b1);
    check('sweep gate: zero instrument errors (all three)', (j1.instrumentErrors || []).length === 0 && (j1.supplyErrors || []).length === 0 && (j1.stickfiberErrors || []).length === 0,
      JSON.stringify(j1.instrumentErrors) + JSON.stringify(j1.supplyErrors) + JSON.stringify(j1.stickfiberErrors));
    check('sweep gate: stickfiber fields present', Array.isArray(j1.stickfiberRows) && j1.stickfiberRows.length > 0 && Array.isArray(j1.supplyDaily));
    run();
    const b2 = fs.readFileSync(f1, 'utf8');
    check('sweep gate: re-run byte-identical', b1 === b2);
    const ana = execFileSync('node', [path.join(REPO, 'scripts', 'stickfiber-analyze-20261031.js')], { env: Object.assign({}, process.env, { ARM: 'gate', EVID: scratch + '/gate' }), stdio: 'pipe' }).toString();
    check('sweep gate: analyzer runs', ana.includes('seedCount') || ana.includes('seeds'));
    const ev = execFileSync('node', [path.join(REPO, 'scripts', 'stickfiber-events-20261031.js')], { env: Object.assign({}, process.env, { ARM: 'gate', EVID: scratch + '/gate' }), stdio: 'pipe' }).toString();
    check('sweep gate: events script runs', ev.includes('dailyIncreases'));
    fs.rmSync(scratch, { recursive: true, force: true });
  }

  console.log(`\nRESULT: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR: ' + (e && e.stack)); process.exit(2); });
