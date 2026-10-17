#!/usr/bin/env node
// scripts/probe-takeseat-remarks-20261017.js — one-off sense probe: on a
// seated run (leadfeast + TAKESEAT=1, seed 9702 — seated d124, survives to
// d182), count villagers who fired the r11 table-sitting convo opener
// (c.tableRemarked) and print the remark pools the engine offers.
// Read-only instrumentation; the game itself is untouched.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadtakeseat } = require('./policies/takeseat');

process.env.TAKESEAT = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';

(async () => {
  const { Game } = await loadGame({ seed: 9702, mode: 'takeseat-remarks' });
  await setupGame(Game);
  // Opener wrap (read-only): record the EXACT line the villager opens with
  // when the once-per table remark fires. convoTableOpener returns
  // {line, thread} or null — the line is the verbatim remark.
  const seenOp = {};
  try {
    const _op = Game.convoTableOpener.bind(Game);
    Game.convoTableOpener = function (vid) {
      let r = null;
      try { r = _op(vid); } catch (e) { r = null; }
      if (r && r.line && !seenOp[vid]) {
        seenOp[vid] = true;
        out.push('REMARK d' + (((Game.state || {}).scholar || {}).day || 0) + ' vid=' + vid + ' :: ' + String(r.line).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300));
      }
      return r;
    };
  } catch (e) { out.push('OPWRAP-ERR: ' + (e && e.message)); }
  const base = leadtakeseat.upkeep.bind(leadtakeseat);
  let sitDay = null;
  const out = []; // printed AFTER quietLog (which swallows console.log during the run)
  const wrapped = Object.assign({}, leadtakeseat, {
    upkeep(G, ctx) {
      base(G, ctx);
      try {
        const pg = G.progState();
        if (sitDay == null && pg.tableDone) sitDay = (G.state.scholar || {}).day || 0;
        // In-flight capture: wrap the opener itself — record the EXACT line
        // the villager opens with when the once-per table remark fires.
        const conv = (((G.state || {}).village || {}).conv) || {};
        void conv;
      } catch (e) { out.push('SCAN-ERR: ' + (e && e.message)); }
    },
  });
  await quietLog(async () => { await runDays(Game, wrapped, { days: 182, sampleEvery: 30 }); });
  for (const l of out.slice(0, 12)) console.log(l);
  const conv = (((Game.state || {}).village || {}).conv) || {};
  let remarked = 0, unremarked = 0;
  const kinds = {};
  const samples = [];
  for (const vid of Object.keys(conv)) {
    const c = conv[vid];
    const tr = c && c.tableRemarked;
    if (tr && tr.sitting) { remarked++; kinds[tr.kind || '?'] = (kinds[tr.kind || '?'] | 0) + 1; }
    else unremarked++;
  }
  console.log('convRecords ' + Object.keys(conv).length + ' remarked ' + remarked + ' unremarked ' + unremarked + ' kinds ' + JSON.stringify(kinds));
  console.log('seated day: ' + sitDay + ' (null = the seat was never taken in this run)');
  // Verbatim: pull the table-remark lines from the transcripts of the
  // first 3 remarking villagers (the r11 opener plays at convo open).
  let shown = 0;
  for (const vid of Object.keys(conv)) {
    const c = conv[vid];
    const tr = c && c.tableRemarked;
    if (!(tr && tr.sitting)) continue;
    const t = (c.transcript || []).filter(x => /table/i.test(String((x && (x.text || x.line || x.msg))) || ''));
    for (const x of t.slice(0, 2)) {
      if (shown >= 6) break;
      const who = (() => { try { return Game.repName ? Game.repName(vid) : vid; } catch (e) { return vid; } })();
      console.log('  [' + who + ' /' + (tr.kind || '?') + '] ' + String(x.text || x.line || x.msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400));
      shown++;
    }
    if (shown >= 6) break;
  }
  console.log('talk-opener predicate live:', (() => { try { return Game.convoTableSitting ? Game.convoTableSitting() : 'n/a'; } catch (e) { return 'err'; } })());
})().catch(e => { console.error('PROBE FATAL', e); process.exit(1); });
