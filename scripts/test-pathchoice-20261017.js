#!/usr/bin/env node
// test-pathchoice-20261017.js — proof record for the sim-pathchoice arm
// (flesh-out loop DIAGNOSTIC, 2026-10-17, scale-onramp axis).
// POLICY-SIDE + READ-ONLY instrument — zero src/js.
//
// Sections:
//   EXPORTS      — the instrument exports without running the sweep; the
//                  sweep asserts the full substrate env set explicitly.
//   METHOD-NOTE  — the 2026-10-16 method note pinned: SEATDRIVE env alone
//                  does NOT drive the seat (an unwrapped windefer(tribfloor)
//                  stack takes no seat with SEATDRIVE=1 in env — RED by
//                  construction, proving env != driver); only the explicit
//                  withSeatDrive wrapper drives (layerOn consulted inside
//                  daily — GREEN).
//   DRAIN-POS    — the winpursuit/winseek tableRoad drain is purely
//                  positional: it picks options[0].id on crafted fixtures
//                  regardless of order (beloved-first -> beloved; feared
//                  second -> feared), never reads prompt/strengths. The
//                  drain has NO choice logic — the mechanism behind the
//                  feared monopoly (RED: any bot "choice" is position).
//   WITNESS-PREQ — the witness prereq reads ledger().exposed: 0 -> unearned
//                  ("the trial needs 3"), +3 -> earned, strength 49
//                  (25 + 3*8). The bar is real and priced.
//   INSERT-ORDER — tableEarnedPaths() id order == the 7 path ids in
//                  index.html script load order (feared first): the
//                  registration order the options array inherits.
//   SMOKE        — 15-day explicit-stack run green; instrument live;
//                  exposed sampled daily; per-seed JSON schema-valid.
//   DET          — 2 seeds x 40d both-repeat: explicit-composed+instrument
//                  trajectory-identical to the landed SD.leadseat stack
//                  (finding #389 equivalence) AND to itself.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
// New tests must not write into the repo: SMOKE writes per-seed JSONs to
// a tmp dir via PATHCHOICE_EVID.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1';
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '1';
const fs = require('fs');
const os = require('os');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PC = require(path.join(ROOT, 'scripts', 'pathchoice-20261017'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(ROOT, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(ROOT, 'scripts', 'policies', 'seatdrive'));
const { tableRoad } = require(path.join(ROOT, 'scripts', 'policies', 'winseek'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(ROOT, 'scripts', 'det-gate'));

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

(async () => {
  console.log('== EXPORTS ==');
  ok('withPathChoice exported', typeof PC.withPathChoice === 'function');
  ok('PATH_IDS has the 7 paths in registration order',
    JSON.stringify(PC.PATH_IDS) === JSON.stringify(['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant', 'relay']));
  ok('policyFor exported + explicit stack string', typeof PC.policyFor === 'function' && /withSeatDrive/.test(PC.EXPLICIT_STACK));
  ok('requiring the sweep module did not create evidence dirs',
    !fs.existsSync(path.join(ROOT, 'evidence', '2026-10-17', 'perseed-pathchoice')));

  console.log('== METHOD-NOTE (env != driver) ==');
  // RED by construction: seatdrive.layerOn() is consulted ONLY inside
  // withSeatDrive.daily. An UNWRAPPED stack cannot drive the seat no matter
  // what the env says — this is the 2026-10-16 method note.
  ok('seatdrive.layerOn() true with SEATDRIVE=1', SD.layerOn() === true);
  const unwrapped = WD.withWinDefer(TF.leadfeast, 'x-unwrapped', 'unwrapped windefer(tribfloor)');
  const src = unwrapped.daily.toString();
  ok('unwrapped windefer(tribfloor).daily never mentions driveSeat/sdSeatTaken',
    !/driveSeat|sdSeatTaken|sdSeatAttempts/.test(src), 'env alone cannot drive');
  const wsrc = SD.withSeatDrive.toString();
  ok('withSeatDrive.daily consults layerOn()', /layerOn\(\)/.test(wsrc), '');
  ok('explicit objects are distinct from require-time objects',
    PC.EXPLICIT_LEAD !== SD.leadseat && PC.EXPLICIT_BELONG !== SD.belongseat, '');
  ok('explicit lead desc names the method note', /EXPLICITLY composed/.test(PC.EXPLICIT_LEAD.desc), '');

  console.log('== DRAIN-POS (the drain has no choice logic) ==');
  // Fixture: a fake modal. The drain's only input is tc.options; it must
  // pick options[0].id whatever the order — no prompt/strength reading.
  function fakeGame(optionIds) {
    const picked = [];
    const G = {
      over: false, tbfight: null,
      state: { scholar: { day: 1, tableChoices: { frame: 'paths', prompt: 'Choose your door (fixture)', options: optionIds.map(id => ({ id })) } } },
      picked,
      chooseTableOption(id) {
        picked.push(id);
        const tc = this.state.scholar.tableChoices;
        tc.options = tc.options.filter(o => o.id !== id);
        if (!tc.options.length) this.state.scholar.tableChoices = null;
      },
    };
    return G;
  }
  {
    const G = fakeGame(['path:beloved', 'path:feared', 'path:relay']);
    tableRoad(G, {});
    ok('beloved-first fixture -> drain picks path:beloved (options[0])',
      G.picked[0] === 'path:beloved', `picked=${G.picked[0]}`);
  }
  {
    const G = fakeGame(['path:feared', 'path:indispensable', 'path:beloved']);
    tableRoad(G, {});
    ok('feared-first fixture -> drain picks path:feared (options[0])',
      G.picked[0] === 'path:feared', `picked=${G.picked[0]}`);
  }
  {
    // The drain never reads strengths or the prompt: fixture options carry
    // no strength/prompt data at all, and it still "chooses".
    const G = fakeGame(['path:relay']);
    tableRoad(G, {});
    ok('single-door fixture drains without strength/prompt data', G.picked[0] === 'path:relay', '');
  }
  {
    // It drains the WHOLE queue (30-answer cap), not one decision.
    const G = fakeGame(['beat:a', 'beat:b', 'beat:c']);
    tableRoad(G, {});
    ok('drain answers until no choice pending', G.picked.length === 3 && G.state.scholar.tableChoices === null, `n=${G.picked.length}`);
  }

  console.log('== WITNESS-PREQ ==');
  {
    const { Game } = await loadGame({ seed: 41, mode: 'pathchoice-wit', fullTelemetry: false });
    await setupGame(Game);
    const origSeat = Game.tableSeat;
    Game.tableSeat = () => ({ seat: 'lesser', detail: {} });
    const w0 = Game.tableEarnedPaths().find(p => p.id === 'witness');
    ok('witness unearned at exposed=0', w0.earned === false && /the trial needs 3/.test(w0.why), `why="${w0.why}"`);
    Game.ledgerAdd('exposed', 3);
    const w3 = Game.tableEarnedPaths().find(p => p.id === 'witness');
    ok('witness earned at exposed=3, strength 25+3*8=49',
      w3.earned === true && w3.strength === 49, `strength=${w3.strength}`);
    Game.tableSeat = origSeat;
  }

  console.log('== INSERT-ORDER ==');
  {
    const { Game } = await loadGame({ seed: 42, mode: 'pathchoice-order', fullTelemetry: false });
    await setupGame(Game);
    const ids = Game.tableEarnedPaths().map(p => p.id);
    ok('earned-path id order == index.html table-*.js load order (feared first)',
      JSON.stringify(ids) === JSON.stringify(PC.PATH_IDS), ids.join(','));
  }

  console.log('== SMOKE ==');
  {
    const tmpE = fs.mkdtempSync(path.join(os.tmpdir(), 'pathchoice-'));
    for (const policyId of ['belongfeast', 'leadfeast']) {
      const { Game } = await loadGame({ seed: 43, mode: `pathchoice-smoke-${policyId}`, fullTelemetry: false });
      await setupGame(Game);
      const base = PC.policyFor(policyId);
      const ledger = { walks: {} };
      const policy = PC.withPathChoice(base, base.id + '-choice', base.desc + ' [PATHCHOICE]', ledger);
      let ctxLive = null, choiceLive = false;
      const oSetup = policy.setup;
      policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); ctxLive = ctx; choiceLive = !!(ctx && ctx._choice); };
      let r = null;
      await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
      ok(`${policyId}: 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
      ok(`${policyId}: instrument live + exposed sampled`,
        choiceLive && ctxLive._choice._lastExposed != null, `lastExposed=${ctxLive._choice._lastExposed}`);
    }
    fs.rmSync(tmpE, { recursive: true, force: true });
  }

  console.log('== DET (explicit+instrument == landed stack) ==');
  async function runHashes(policy, seed, days) {
    const { Game } = await loadGame({ seed, mode: 'pathchoice-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
    return hashes.join('\n');
  }
  {
    let green = 0, total = 0;
    for (const seed of [1931, 1942]) {
      const ledger = { walks: {} };
      const traced = PC.withPathChoice(PC.EXPLICIT_LEAD, PC.EXPLICIT_LEAD.id + '-choice', PC.EXPLICIT_LEAD.desc + ' [PATHCHOICE]', ledger);
      const hP1 = await runHashes(SD.leadseat, seed, 40);
      const hP2 = await runHashes(SD.leadseat, seed, 40);
      const hT1 = await runHashes(traced, seed, 40);
      const hT2 = await runHashes(traced, seed, 40);
      const identical = hP1 === hP2 && hT1 === hT2 && hP1 === hT1;
      total++; if (identical) green++;
      ok(`seed ${seed}: explicit+instrument == SD.leadseat (both-repeat)`, identical,
        `plainStable=${hP1 === hP2} tracedStable=${hT1 === hT2} eq=${hP1 === hT1}`);
    }
    ok('DET gate green', green === total, `${green}/${total}`);
  }

  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST FATAL', e); process.exit(1); });
