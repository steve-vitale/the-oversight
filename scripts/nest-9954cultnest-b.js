#!/usr/bin/env node
// nest-9954cultnest-b.js — analysis printer for sim-cultnest-b.
// Reads the cultnest replay, correlates the seq-124 cultivate span
// and the seq-466/474 meal draws in monotonic evt order, and prints
// the span/draw evt table used by the evidence. Exit 0; judging
// lives in scripts/test-9954cultnest-b.js.
'use strict';
const fs = require('fs');
const path = require('path');
const p = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-9954cultnest-b-replay', '9954cultnest-b-belongseek-nofeast-s9954.json'), 'utf8'));
const ev = p.nestEvents || [];
const key = (items) => (items || []).map((i) => [i.name, i.kcalEach, i.units, i.spoilDay].join('|')).join(';');
const direct124 = (p.directRecords || []).find((r) => r.seq === 124);
console.log('direct124:', direct124 ? ('day ' + direct124.day + ' path ' + direct124.path + ' totalKcal ' + direct124.totalKcal) : 'MISSING');
const spanExit = ev.find((e) => e.kind === 'spanExit' && e.directBefore === 123 && e.directAfter === 124 && e.ability === 'green_whisper' && e.action === 'cultivate');
let spanEnter = null;
if (spanExit) {
  for (let i = ev.indexOf(spanExit) - 1; i >= 0; i--) {
    if (ev[i].kind === 'spanEnter' && ev[i].ability === 'green_whisper' && ev[i].action === 'cultivate' && ev[i].depth === spanExit.depth) { spanEnter = ev[i]; break; }
    if (ev[i].kind === 'spanExit' && ev[i].depth === spanExit.depth) break;
  }
}
console.log('seq124 span: enter evt ' + (spanEnter ? spanEnter.evt + ' day ' + spanEnter.day : 'MISSING') +
  ' -> exit evt ' + (spanExit ? spanExit.evt + ' day ' + spanExit.day : 'MISSING'));
for (const seq of [466, 474]) {
  const rec = (p.mealDrawRecords || []).find((r) => r.seq === seq && r.kind === 'pantryDraw');
  if (!rec) { console.log('meal ' + seq + ': MISSING'); continue; }
  const rk = key(rec.items.map((i) => ({ name: i.name, kcalEach: i.kcalEach, units: i.units, spoilDay: i.spoilDay })));
  const exits = ev.filter((e) => e.kind === 'drawExit' && e.want === Math.round(rec.want) && e.taken === Math.round(rec.taken) && key(e.items) === rk);
  console.log('meal ' + seq + ': day ' + rec.day + ' context ' + rec.context + ' want ' + rec.want + ' taken ' + rec.taken +
    ' nestMatches ' + exits.length + exits.map((e) => 'evt' + e.evt + '/day' + e.day).join(','));
  for (const ex of exits) {
    let de = null;
    for (let i = ev.indexOf(ex) - 1; i >= 0; i--) {
      if (ev[i].kind === 'drawEnter') { de = ev[i]; break; }
      if (ev[i].kind === 'drawExit') break;
    }
    const inside = spanEnter && spanExit && de && de.evt > spanEnter.evt && de.evt < spanExit.evt;
    console.log('  drawEnter evt ' + (de ? de.evt + ' day ' + de.day : 'MISSING') + ' frames ' + (de ? de.frames.join(' <- ') : '') + ' INSIDE_SEQ124_SPAN=' + inside);
  }
}
console.log('events strictly inside span:');
if (spanEnter && spanExit) for (const e of ev.filter((x) => x.evt > spanEnter.evt && x.evt < spanExit.evt)) console.log('  evt ' + e.evt + ' ' + e.kind + ' day ' + e.day + (e.want != null ? ' want ' + e.want : '') + (e.taken != null ? ' taken ' + e.taken : ''));
console.log('cultivate spans (enter day -> exit day, directBefore -> directAfter):');
for (const e of ev.filter((x) => x.kind === 'spanEnter' && x.ability === 'green_whisper')) {
  const x = ev.find((y) => y.kind === 'spanExit' && y.evt > e.evt && y.ability === e.ability && y.depth === e.depth);
  console.log('  enter evt ' + e.evt + ' day ' + e.day + ' -> exit evt ' + (x ? x.evt + ' day ' + x.day : '?') + ' ' + e.directBefore + ' -> ' + (x ? x.directAfter : '?'));
}
