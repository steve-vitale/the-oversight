#!/usr/bin/env node
// Real game plus the actual app sheet queue/render/click/pending functions.
// The minimal DOM only supplies the sheet root and parsed setting buttons.
'use strict';
const K = require('./lib'), T = K.reporter('table-sheet-handoff');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 7) }); K.newRun(G);
  const s = G.state.scholar; s.day = 100; G.state.systemArrived = true;
  // Full seat requires national standing since the Steve 2026-10-27 ruling
  // (sim-scalegate-a): without it deedGateReady().ok is false and there is
  // no Table setting to hand off. Same fixture class as the
  // test-fullseat-superset-20261014 update in that arm.
  G.state.nationalLive = true;
  s.abilityChoices = null; s.knackChoices = null; s.relicChoices = null;
  s.integration=40;s.insideHaven=true;G.playerTile().type='haven';
  const pg=G.progState();pg.arc=4;pg.tableWaiting=true;pg.tableDone=false;pg.table={};
  pg.sentimentTaught=true;pg.feastSurgeUsed=true;pg.crises={raid:true,illness:true,fire:true};
  pg.deeds={wavesFaced:{},contestsSurvived:3};
  for(const m of G.data.monsters.filter(m=>m.wave<=5))pg.deeds.wavesFaced[m.id]=m.wave;
  T.ok('prepared actual deed, food and integration gates provide a full seat',G.tableSeat().seat==='full');
  // Real wipe/save tombstone path remains active.
  const source = K.readSrc('src/js/app.js');
  const take = (from, to) => { const a = source.indexOf('  function ' + from), b = source.indexOf('  function ' + to, a + 1); if (a < 0 || b < 0) throw new Error('Missing app function ' + from); return source.slice(a, b); };
  const root = { html: '', buttons: [], className: '',
    set innerHTML(html) { this.html = html; this.buttons = [...html.matchAll(/data-sheetpick="(\d+)"/g)].map(m => ({ dataset: { sheetpick: m[1] } })); },
    querySelector: () => null, querySelectorAll() { return this.buttons; } };
  const document = { getElementById: id => id === 'sheet-root' ? root : null, querySelector: () => null };
  const app = new Function('Game', 'document', 'esc',
    'let sheetQueue = [], sheetSeq = 0;\n' +
    take('openSheet(', 'updateSheet(') + take('closeSheet(', 'sheetQueued(') + take('sheetQueued(', 'renderSheets(') +
    take('renderSheets(', 'enterTargeting(').split('  // ============ TARGETING MODE')[0] +
    take('tableSheet(', 'abilitySheet(') + take('processPendingSheets(', 'rerender(') +
    'function refresh() { processPendingSheets(); }\nreturn { refresh, queued: () => sheetQueue };')(G, document, x => String(x));
  G.tableScene(); app.refresh();
  const pick = id => {
    const i = s.tableChoices.options.findIndex(o => o.id === id);
    const btn = root.buttons.find(b => Number(b.dataset.sheetpick) === i);
    if (!btn?.onclick) return false; btn.onclick(); return true;
  };
  T.ok('actual app renderer queues the initial Table setting', app.queued().length === 1 && root.buttons.length > 0);
  pick('path:assimilated');
  T.ok('choosing the door immediately keeps its replacement challenge visible', G.tableState().phase === 'challenge' && app.queued().length === 1 && root.buttons.length > 0);
  let walked = 0;
  while (G.tableState().phase === 'challenge' && app.queued().length && walked < 5) {
    const next = s.tableChoices.options.find(o => /^beat:/.test(o.id));
    if (!next || !pick(next.id)) break; walked++;
  }
  T.ok('consecutive real setting clicks reach visible final choices', walked >= 3 && G.tableState().phase === 'finals' && app.queued().length === 1 && root.buttons.length > 0);
  if (G.tableState().phase === 'finals' && app.queued().length) pick(s.tableChoices.options[0].id);
  T.ok('the real final setting resolves the win and leaves no stale Table sheet', G.won === true && s.tableChoices === null && app.queued().length === 0);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
