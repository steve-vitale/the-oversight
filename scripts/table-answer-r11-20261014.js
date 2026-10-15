#!/usr/bin/env node
// table-answer-r11-20261014.js — ENDGAME leg r11: ANSWER the table in-harness.
// r10's scenes sat unanswered (sanctity froze the world); this run drives the
// natural scene to completion as a competent player would: pick the strongest
// earned path, play its challenge beats, take the opt-in trial-by-combat when
// offered (it's legible and real), refuse the dark conscript, then keep the
// run going to see the aftermath. Seat-none runs: the withdrawal beat plays.
// SEED env: 84 = full-seat completion candidate; 51 = no-seat withdrawal.
// TOOLING ONLY — no game balance changes.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-14');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
const SEED = parseInt(process.env.SEED || '84', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const { loadGame, setupGame, runDays, driveFights } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
const LINES = [];
function hookSay(G) {
  const osay = G.say, osys = G.sysSay;
  G.say = function (t) { try { LINES.push('[say] ' + String(t)); } catch (e) {} return osay.call(this, t); };
  G.sysSay = function (t) { try { LINES.push('[sys] ' + String(t)); } catch (e) {} return osys.call(this, t); };
}
function choicesOf(G) {
  try { return (G.state.scholar.tableChoices || {}).options || []; } catch (e) { return []; }
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'endgame-r11-answer' });
  await setupGame(Game);
  hookSay(Game);
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  let answered = false, answerDay = null, auditMark = 0, lastSig = null, reoffers = 0;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  // We need the answer to happen right after the scene fires at dawn. The
  // daily hook runs once per day; the scene fires inside the day tick. Check
  // post-tick state each day: tableDone && phase == 'paths' with choices.
  const checkDaily = (G) => {
    try {
      const pg = (G.progState && G.progState()) || {};
      const T = G.tableState ? G.tableState() : {};
      const opts = choicesOf(G);
      if (T && T.phase === 'paths' && opts.length > 0 && pg.tableDone) {
        // Re-offer (win-day-floor deferral) has a fresh modal signature —
        // answer each new offer once.
        const sig = opts.map(o => o.id).join(',');
        if (sig === lastSig) return;
        lastSig = sig;
        if (!answered) { answerDay = day(G); auditMark = LINES.length; }
        else { reoffers++; LINES.push(`[driver] re-offer day ${day(G)} — answering again`); }
        answered = true;
        answerScene(G);
      } else if (T && T.phase === 'paths' && pg.tableWaiting && !pg.tableDone) {
        // withdrawal beat fired silently? the scene only fires at dawn;
        // seat-none withdraws inside tableScene — capture it once.
        if (pg._r11withdrew == null) { pg._r11withdrew = day(G); }
      }
    } catch (e) {}
  };
  const wrapped = Object.assign({}, policy, { daily: (G, ctx) => { if (origDaily) { try { origDaily(G, ctx); } catch (e) {} } checkDaily(G); } });
  const result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 30 });
  const pg = Game.progState();
  const out = {
    label: 'journey-endgame-r11-answer', seed: SEED, days: result.days, endReason: result.endReason,
    answerDay, withdrawalDay: pg._r11withdrew != null ? pg._r11withdrew : null,
    reoffers,
    won: !!Game.won, over: !!Game.over,
    tableFinalPhase: (Game.tableState && Game.tableState().phase) || null,
    tableFinalPath: (Game.tableState && Game.tableState().path) || null,
    bearer: (Game.state.scholar || {}).name || null,
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r11-answer-s${SEED}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r11-answer-s${SEED}.txt`), LINES.join('\n'));
  console.log(`[answer s${SEED}] d=${out.days} ${out.endReason} answerDay=${out.answerDay} withdrawalDay=${out.withdrawalDay} phase=${out.tableFinalPhase} path=${out.tableFinalPath} won=${out.won} over=${out.over} bearer=${out.bearer}`);
}

function answerScene(G) {
  const LOG = [];
  try {
    const paths = (G.tableEarnedPaths && G.tableEarnedPaths()) || [];
    const earned = paths.filter(p => p.earned).sort((a, b) => (b.strength | 0) - (a.strength | 0));
    LINES.push(`[driver] earned: ${earned.map(p => p.id + '(' + p.strength + ')').join(', ') || 'none'}; unearned: ${paths.filter(p => !p.earned).map(p => p.id).join(', ')}`);
    if (!earned.length) { LINES.push('[driver] no earned paths — nothing to answer with'); return; }
    const pick = earned[0];
    LINES.push(`[driver] competent player walks the path of ${pick.id} (strongest earned, strength ${pick.strength})`);
    G.chooseTableOption('path:' + pick.id);
    let steps = 0, fails = 0;
    const seen = {};
    while (steps++ < 100) {
      const T = G.tableState();
      const phase = T.phase;
      if (phase === 'done') { LINES.push(`[driver] resolved: done after ${steps} steps, won=${!!G.won} over=${!!G.over}`); break; }
      if (T.trialPending && G.tbfight && !G.tbfight.over) {
        LINES.push('[driver] trial-by-combat offered — a competent player takes it (opt-in, legible, real)');
        try { driveFights(G, require('./policies/feastscale').leadfeast, {}); } catch (e) { LINES.push('[driver] driveFights threw: ' + (e && e.message)); }
        LINES.push(`[driver] trial exit: tbfight=${G.tbfight ? 'still up' : 'none'}, phase=${G.tableState().phase}`);
        continue;
      }
      const opts = choicesOf(G);
      if (!opts.length) { LINES.push(`[driver] DEAD BEAT: phase=${phase} beat=${T.beat} — no options`); break; }
      const sig = phase + '|' + T.beat + '|' + opts.map(o => o.id).join(',');
      seen[sig] = (seen[sig] || 0) + 1;
      if (seen[sig] > 3) { LINES.push(`[driver] DEAD BEAT: choice loop at ${sig}`); break; }
      let c = null;
      if (phase === 'challenge') c = opts[0];           // play the beats honestly
      else if (phase === 'finals') c = opts[0];
      else if (phase === 'downgrade') { fails++; c = opts[0]; LINES.push(`[driver] downgrade: taking ${c.id}`); }
      else if (phase === 'demand-price') c = opts[0];
      else if (phase === 'conscript') { c = opts.find(o => o.id === 'conscript:no') || opts[0]; LINES.push(`[driver] conscript refused (${c.id})`); }
      else c = opts[0];
      LINES.push(`[driver] [${phase} beat ${T.beat}] -> ${c.id} "${String(c.label).slice(0, 70)}"`);
      try { G.chooseTableOption(c.id); } catch (e) { LINES.push(`[driver] chooseTableOption(${c.id}) THREW: ` + (e && e.message)); break; }
      if (fails > 2) { LINES.push('[driver] too many downgrades — stopping'); break; }
    }
  } catch (e) { LINES.push('[driver] FATAL: ' + (e && e.stack || e)); }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
