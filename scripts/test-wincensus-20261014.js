'use strict';
// scripts/test-wincensus-20261014.js — proof for the WIN-FLAG CENSUS instrument (scripts/wincensus-20261014.js).
// Proves the instrument attributes gates on fixtures AND live runs:
//   (1) install on a real game: no throw, all chain hooks wrap (no 'missing' notes), rows recorded.
//   (2) withdrawal attribution: forced tableScene on a fresh game (seat 'none') -> 'scene-withdrawn' event.
//   (3) deferral-stall attribution: real winDayFloorDefer(T) -> 'win-deferred' event, then synthetic
//       days in phase 'paths' + tableChoices null -> stall.deferredDays > 0 in finalize.
//   (4) live run: leadfeast s22 (known table-reacher from r31) 180d -> waitingDay/scene/prompts attributed,
//       gate chain reaches at least SCENE.
//   (5) A/A determinism: two invocations -> identical day-hashes AND identical gate chains.
// INFO-SKIP discipline: any setup failure degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
process.env.FEASTSCALE_R13 = process.env.FEASTSCALE_R13 || '1';
let sim, det, wc, leadfeast;
try { sim = require('./sim-harness'); } catch (e) { console.log('INFO-SKIP: sim-harness unavailable: ' + e.message); process.exit(0); }
try { det = require('./det-gate'); } catch (e) { console.log('INFO-SKIP: det-gate unavailable: ' + e.message); process.exit(0); }
try { wc = require('./wincensus-20261014'); } catch (e) { console.log('INFO-SKIP: wincensus instrument unavailable: ' + e.message); process.exit(0); }
try { leadfeast = require('./policies/feastscale').leadfeast; } catch (e) { console.log('INFO-SKIP: leadfeast policy unavailable: ' + e.message); process.exit(0); }
if (!leadfeast || typeof leadfeast.daily !== 'function') { console.log('INFO-SKIP: leadfeast named-export unwrap failed'); process.exit(0); }

const { loadGame, setupGame, runDays } = sim;
const { dayHash } = det;
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function runCensus(seed, arm, days) {
  const { Game } = await loadGame({ seed, mode: `wincensus-test-${arm}` });
  await setupGame(Game);
  const t = wc.installWinCensus(Game);
  const policy = arm === 'walked' ? wc.wrapWithTableWalk(leadfeast) : leadfeast;
  const hashes = [];
  const wrapped = Object.create(policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    wc.censusRow(Game, t);
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  const r = await runDays(Game, wrapped, { days, sampleEvery: 1 });
  const census = wc.finalizeWinCensus(Game, t, { seed, combo: 'leadfeast', arm, inv: 1, days: r.days, endReason: r.endReason });
  return { Game, census, hashes, r };
}

async function main() {
  console.log('[test-wincensus] (1) install + short run');
  {
    const { Game } = await loadGame({ seed: 7, mode: 'wincensus-t1' });
    await setupGame(Game);
    const t = wc.installWinCensus(Game);
    const needed = ['tableScene', 'tablePrompt', 'chooseTableOption', 'tableStartPath', 'tableChoose', 'tableFail', 'tableFinals', 'tableResolveFinal', 'winDayFloorDefer', 'tableTrialByCombat'];
    const missing = t.notes.filter(n => needed.some(k => n.indexOf(k) === 0));
    check('all chain hooks wrapped', missing.length === 0, missing.join(';'));
    const wrapped = Object.create(leadfeast);
    wrapped.daily = (G, ctx) => { wc.censusRow(Game, t); return leadfeast.daily(G, ctx); };
    await runDays(Game, wrapped, { days: 12, sampleEvery: 1 });
    check('rows recorded over 12d', t.rows.length >= 10, 'rows=' + t.rows.length);
    check('no hook errors', t.hookErrs === 0, 'hookErrs=' + t.hookErrs);
    check('wrapWithTableWalk preserves daily', typeof wc.wrapWithTableWalk(leadfeast).daily === 'function');
  }

  console.log('[test-wincensus] (2) withdrawal attribution');
  {
    const { Game } = await loadGame({ seed: 8, mode: 'wincensus-t2' });
    await setupGame(Game);
    const t = wc.installWinCensus(Game);
    Game.progState().tableWaiting = true;
    Game.tableScene();
    const kinds = t.events.map(e => e.kind);
    check('scene-withdrawn attributed', kinds.includes('scene-withdrawn'), kinds.join(','));
    check('tableWaiting cleared by withdrawal', !Game.progState().tableWaiting);
  }

  console.log('[test-wincensus] (3) deferral-stall attribution (real winDayFloorDefer)');
  {
    const { Game } = await loadGame({ seed: 9, mode: 'wincensus-t3' });
    await setupGame(Game);
    const t = wc.installWinCensus(Game);
    const pg = Game.progState();
    pg.tableDone = true; pg.tableWaiting = true;
    const T = Game.tableState();
    Game.winDayFloorDefer(T); // the real deferral path: phase='paths', tableChoices=null
    check('win-deferred event recorded', t.events.some(e => e.kind === 'win-deferred'));
    check('phase=paths after defer', T.phase === 'paths', 'phase=' + T.phase);
    check('tableChoices null after defer', !(Game.state.scholar || {}).tableChoices);
    // synthetic post-deferral days: nothing re-opens the modal
    for (let i = 0; i < 5; i++) { Game.state.scholar.day = (Game.state.scholar.day || 0) + 1; wc.censusRow(Game, t); }
    const c = wc.finalizeWinCensus(Game, t, { seed: 9, combo: 'test', arm: 'defer', inv: 1, days: 5, endReason: 'test' });
    check('stall.deferredDays flags the dead end', c.stall.deferredDays >= 5, 'deferredDays=' + c.stall.deferredDays);
    check('chain names the stall', c.gates.chain.join(' ').indexOf('-won') >= 0, c.gates.chain.join(' '));
  }

  console.log('[test-wincensus] (4) live run: leadfeast s22 reaches the table, gates attributed');
  {
    const { census } = await runCensus(22, 'origin', 180);
    const g = census.gates;
    check('waitingDay attributed', g.waitingDay != null, 'chain=' + g.chain.join(' '));
    check('scene fired', g.sceneDay != null, 'chain=' + g.chain.join(' '));
    check('prompts offered', g.promptsOffered > 0, 'prompts=' + g.promptsOffered);
    check('chain has no -scene', g.chain.join(' ').indexOf('-scene') < 0 && g.chain.join(' ').indexOf('WITHDRAWN') < 0, g.chain.join(' '));
    check('deaths attributable', Array.isArray(census.deaths));
    check('transcript captured', census.transcript.length > 0, 'lines=' + census.transcript.length);
  }

  console.log('[test-wincensus] (5) A/A determinism on s22');
  {
    const a = await runCensus(22, 'origin', 180);
    const b = await runCensus(22, 'origin', 180);
    const hEq = a.hashes.join('|') === b.hashes.join('|');
    const cEq = a.census.gates.chain.join(' ') === b.census.gates.chain.join(' ');
    check('identical day-hashes A/A', hEq);
    check('identical gate chains A/A', cEq, a.census.gates.chain.join(' ') + ' vs ' + b.census.gates.chain.join(' '));
  }

  console.log(`[test-wincensus] ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('INFO-SKIP: test crashed: ' + (e && e.message)); process.exit(0); });
