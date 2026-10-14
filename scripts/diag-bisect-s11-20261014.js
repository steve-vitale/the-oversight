#!/usr/bin/env node
// scripts/diag-bisect-s11-20261014.js — bisect the s11 day-41 divergence.
// Runs leadfeast s11 twice in-process, captures a rich per-day snapshot,
// prints the first divergence day and a diff of the snapshot keys.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays } = require('./sim-harness');

function snap(Game) {
  const o = {};
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    o.day = s.day; o.hp = Math.round(s.health || 0); o.kcal = Math.round(s.kcal || 0);
    o.pos = Game.map.px + ',' + Game.map.py;
    o.wave = Game.unlockedWave ? Game.unlockedWave() : 0;
    o.pantry = Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
    o.roster = (v.roster || []).map(id => {
      let dead = '?';
      try { dead = (Game.getPerson(id) || {}).dead ? 'D' : 'a'; } catch (e) {}
      return dead;
    }).join('');
    o.scholarVid = (s.villagerId || '').slice(-6);
    o.trustN = Object.keys(v.trust || {}).length;
    o.groups = JSON.stringify((v.groups || []).map(g => g.members.length).join(','));
    try { o.cx = Game.progState ? JSON.stringify(Game.progState()).length : 0; } catch (e) { o.cx = -1; }
  } catch (e) { o.err = String(e).slice(0, 60); }
  return o;
}

async function runOnce() {
  const { Game } = await loadGame({ seed: 11, mode: 'bisect-s11' });
  await setupGame(Game);
  const snaps = [];
  const wrapped = Object.assign({}, leadfeast);
  const base = leadfeast.daily;
  wrapped.daily = (G, ctx) => { snaps.push(Game.state.scholar.day + ':' + JSON.stringify(snap(Game))); return base(G, ctx); };
  const r = await runDays(Game, wrapped, { days: 180, sampleEvery: 1 });
  return { snaps, days: r.days, endReason: r.endReason };
}

function diffSnap(a, b) {
  const pa = JSON.parse(a.split(':').slice(1).join(':'));
  const pb = JSON.parse(b.split(':').slice(1).join(':'));
  const out = [];
  for (const k of Object.keys(pa)) if (JSON.stringify(pa[k]) !== JSON.stringify(pb[k])) out.push(`${k}: ${JSON.stringify(pa[k])} vs ${JSON.stringify(pb[k])}`);
  return out;
}

async function main() {
  const A = await runOnce();
  const B = await runOnce();
  console.log(`A: ${A.days}/${A.endReason} B: ${B.days}/${B.endReason} snaps ${A.snaps.length}/${B.snaps.length}`);
  const n = Math.min(A.snaps.length, B.snaps.length);
  for (let i = 0; i < n; i++) {
    if (A.snaps[i] !== B.snaps[i]) {
      console.log(`FIRST DIVERGENCE at snap idx ${i}:`);
      for (const d of diffSnap(A.snaps[i], B.snaps[i]).slice(0, 8)) console.log('  ' + d);
      // context: previous 2 snaps identical?
      console.log('  prev identical:', A.snaps[i - 1] === B.snaps[i - 1], ' prev2 identical:', A.snaps[i - 2] === B.snaps[i - 2]);
      return;
    }
  }
  console.log(n === A.snaps.length && n === B.snaps.length ? 'IDENTICAL' : 'LENGTH MISMATCH only');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
