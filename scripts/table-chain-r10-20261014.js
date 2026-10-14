#!/usr/bin/env node
// table-chain-r10-20261014.js — exercise the full table chain end-to-end in
// the harness: audit/pricing beat -> all 7 paths (beats, branches, finals)
// -> resolution. Names dead beats concretely. Also sense-reads the pricing
// lines. Runs AFTER the measurement run (best seed via SEED env).
//
// Method: run leadfeast to 180d on SEED, then per path: reset ONLY the
// table-scoped state (pg.table fresh, pg.tableDone/tableWaiting false,
// scholar.tableChoices null, over/won false) and drive via chooseTableOption
// reading scholar.tableChoices like the UI would. Game.say/sysSay wrapped
// to capture the transcript per path.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-14');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
const SEED = parseInt(process.env.SEED || '11', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const { loadGame, setupGame, runDays, driveFights } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

let Game = null;
const LINES = []; // captured per path walk: {path, kind, text}

function hookSay(G) {
  const osay = G.say, osys = G.sysSay;
  G.say = function (t) { try { LINES.push({ path: CUR.path, kind: 'say', text: String(t) }); } catch (e) {} return osay.call(this, t); };
  G.sysSay = function (t) { try { LINES.push({ path: CUR.path, kind: 'sys', text: String(t) }); } catch (e) {} return osys.call(this, t); };
}
const CUR = { path: 'prelude' };

function resetTable(G) {
  const pg = G.progState();
  pg.table = {};
  pg.tableDone = false;
  pg.tableWaiting = false;
  G.state.scholar.tableChoices = null;
  G.over = false; G.won = false;
}

function choicesOf(G) {
  try { return (G.state.scholar.tableChoices || {}).options || []; } catch (e) { return []; }
}

function walkPath(G, pathId, earned) {
  const log = [];
  resetTable(G);
  CUR.path = pathId;
  const mark = LINES.length;
  log.push(`--- path ${pathId} (earned=${earned ? 'yes strength=' + earned.strength : 'NO'}) ---`);
  // 1. the scene: audit + pricing
  try { G.tableScene(); } catch (e) { log.push(`tableScene THREW: ${e && e.message}`); return { pathId, ok: false, why: 'tableScene threw' }; }
  let T = G.tableState();
  log.push(`scene -> phase=${T.phase} seat=${T.seat}`);
  const auditLines = LINES.slice(mark).map(l => l.text);
  const auditText = auditLines.join('\n');
  log.push(`audit/pricing lines captured: ${auditLines.length}`);
  // 2. choose the path (drive directly even if unearned — exercising the chain)
  try { G.chooseTableOption('path:' + pathId); } catch (e) { log.push(`chooseTableOption(path) THREW: ${e && e.message}`); }
  T = G.tableState();
  log.push(`start -> phase=${T.phase} branch=${T.branch || T.band || '?'}`);
  let steps = 0, fails = 0, trialTaken = 0, trialOffered = 0, seen = {};
  let deadBeat = null;
  while (steps++ < 80) {
    T = G.tableState();
    const phase = T.phase;
    if (phase === 'done') { log.push(`resolved: phase=done after ${steps} steps, won=${!!G.won} over=${!!G.over}`); break; }
    // trial fight in progress / pending
    if (T.trialPending && G.tbfight && !G.tbfight.over) {
      trialTaken++;
      log.push(`trial-by-combat: fight started (${G.tbfight.id || 'fight'}), driving...`);
      try { driveFights(Game, null, {}); } catch (e) { log.push(`driveFights THREW: ${e && e.message}`); }
      log.push(`trial fight exit: tbfight=${G.tbfight ? 'still up' : 'none'}, phase=${G.tableState().phase}`);
      continue;
    }
    if (T.trialPending && (!G.tbfight || G.tbfight.over)) {
      log.push(`trial pending but no live fight — treating as refused-strand`);
    }
    const opts = choicesOf(G);
    if (!opts.length) {
      deadBeat = `phase=${phase} beat=${T.beat} — NO options offered (strand)`;
      log.push('DEAD BEAT: ' + deadBeat);
      break;
    }
    const sig = phase + '|' + T.beat + '|' + opts.map(o => o.id).join(',');
    seen[sig] = (seen[sig] || 0) + 1;
    if (seen[sig] > 3) { deadBeat = `phase=${phase} beat=${T.beat} — choice loop (same options 4x)`; log.push('DEAD BEAT: ' + deadBeat); break; }
    let pick = null;
    if (phase === 'paths') pick = opts.find(o => o.id === 'path:' + pathId) || opts[0];
    else if (phase === 'challenge') {
      // skip the opt-in trial beat in the chain walk unless it is the only option
      const nonTrial = opts.filter(o => !/trial/i.test(o.id + ' ' + o.label));
      if (nonTrial.length < opts.length) { trialOffered++; log.push(`trial offered among [${opts.map(o => o.id).join(', ')}] — skipped (opt-in)`); }
      pick = nonTrial[0] || opts[0];
    }
    else if (phase === 'finals') pick = opts[0];
    else if (phase === 'downgrade') { fails++; pick = opts[0]; log.push(`downgrade: taking ${pick.id} (fail #${fails})`); }
    else if (phase === 'demand-price') pick = opts[0];
    else if (phase === 'conscript') { pick = opts.find(o => o.id === 'conscript:no') || opts[0]; log.push(`conscript: refusing (${pick.id})`); }
    else { pick = opts[0]; log.push(`unknown phase ${phase}: picking ${pick.id}`); }
    if (!pick) { deadBeat = `phase=${phase} — no pickable option`; log.push('DEAD BEAT: ' + deadBeat); break; }
    log.push(`  [${phase} beat ${T.beat}] -> ${pick.id} "${String(pick.label).slice(0, 80)}"`);
    try { G.chooseTableOption(pick.id); } catch (e) { log.push(`chooseTableOption(${pick.id}) THREW: ${e && e.message}`); deadBeat = 'choose threw'; break; }
    if (fails > 2) { log.push('too many downgrades — stopping'); break; }
  }
  T = G.tableState();
  const outcome = {
    pathId, earned: !!earned, earnedStrength: earned ? earned.strength : 0,
    steps, fails, trialOffered, trialTaken,
    finalPhase: T.phase, won: !!G.won, over: !!G.over,
    deadBeat, ok: T.phase === 'done',
    transcript: LINES.slice(mark).map(l => `[${l.kind}] ${l.text}`).join('\n'),
  };
  log.push(`final: phase=${T.phase} won=${outcome.won} ok=${outcome.ok}${deadBeat ? ' DEADBEAT=' + deadBeat : ''}`);
  return { pathId, ok: outcome.ok, why: deadBeat, log, outcome };
}

async function main() {
  const { Game: G0 } = await loadGame({ seed: SEED, mode: 'endgame-r10-tablechain' });
  Game = G0;
  await setupGame(Game);
  hookSay(Game);
  // run to the endgame window with the feast-road policy
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  let sceneNaturalDay = null;
  policy.daily = (G, ctx) => {
    try {
      const pg = (G.progState && G.progState()) || {};
      if (pg.tableDone && sceneNaturalDay == null) sceneNaturalDay = day(G);
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 });
  const endDay = day(Game);
  console.log(`[chain] seed ${SEED}: ran ${result.days}d (${result.endReason}), natural scene day=${sceneNaturalDay}`);
  let seat = { seat: 'none' };
  try { seat = Game.tableSeat() || seat; } catch (e) {}
  console.log(`[chain] end-state seat=${seat.seat}`);
  let earnedPaths = [];
  try { earnedPaths = Game.tableEarnedPaths() || []; } catch (e) { console.log('[chain] tableEarnedPaths threw: ' + (e && e.message)); }
  console.log(`[chain] earned paths: ${earnedPaths.filter(p => p.earned).map(p => p.id + '(' + p.strength + ')').join(', ') || 'none'}`);
  console.log(`[chain] unearned: ${earnedPaths.filter(p => !p.earned).map(p => p.id + ': ' + String(p.why).slice(0, 60)).join(' | ') || 'none'}`);
  const PATH_IDS = ['feared', 'indispensable', 'beloved', 'witness', 'defiant', 'assimilated', 'relay'];
  const results = [];
  for (const pid of PATH_IDS) {
    const earned = earnedPaths.find(p => p.id === pid);
    const r = walkPath(Game, pid, earned && earned.earned ? earned : null);
    results.push(r);
    console.log(`[chain] ${pid}: ${r.ok ? 'OK done' : 'BROKEN ' + (r.why || '')} steps=${r.outcome ? r.outcome.steps : '?'} fails=${r.outcome ? r.outcome.fails : '?'} trialOffered=${r.outcome ? r.outcome.trialOffered : 0}`);
    const fp = path.join(EVIDIR, `journey-endgame-r10-tablechain-${pid}.txt`);
    fs.writeFileSync(fp, (r.log || []).join('\n') + '\n\n===== TRANSCRIPT =====\n' + (r.outcome ? r.outcome.transcript : '(none)'));
  }
  const summary = {
    label: 'journey-endgame-r10-tablechain', seed: SEED, days: result.days, endReason: result.endReason,
    endSeat: seat.seat, sceneNaturalDay,
    earned: earnedPaths.filter(p => p.earned).map(p => ({ id: p.id, strength: p.strength, why: p.why })),
    unearned: earnedPaths.filter(p => !p.earned).map(p => ({ id: p.id, why: p.why })),
    paths: results.map(r => ({
      id: r.pathId, ok: r.ok, why: r.why || null,
      steps: r.outcome && r.outcome.steps, fails: r.outcome && r.outcome.fails,
      trialOffered: r.outcome && r.outcome.trialOffered, trialTaken: r.outcome && r.outcome.trialTaken,
      finalPhase: r.outcome && r.outcome.finalPhase, won: r.outcome && r.outcome.won,
    })),
  };
  fs.writeFileSync(path.join(EVIDIR, 'journey-endgame-r10-tablechain-summary.json'), JSON.stringify(summary, null, 1));
  console.log(`\n=== table chain: ${results.filter(r => r.ok).length}/7 paths resolved end-to-end ===`);
  for (const r of results) if (!r.ok) console.log(`  BROKEN: ${r.pathId} — ${r.why}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
