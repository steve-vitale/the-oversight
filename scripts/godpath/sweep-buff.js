#!/usr/bin/env node
// scripts/godpath/sweep-buff.js — the god-path follow-up measurement
// (villagers use the new verbs, kit order, ascension tuning, buff everyone).
//
// One seed per process (AGENTS.md: never two harnesses in one process):
//   SEED=7 DAYS=150 node scripts/godpath/sweep-buff.js        -> one RESULT line
// Driver (forks one process per seed, PAR at a time, prints the summary):
//   SEEDS=7,42,... DAYS=150 PAR=4 node scripts/godpath/sweep-buff.js --all [--out file.json]
// Counts telemetry live (the phone ring is capped). Writes nothing into the
// repo unless --out names a file.
'use strict';
const path = require('path');
const { spawn } = require('child_process');

const SEEDS_DEFAULT = '7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9';

function median(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

async function one() {
  const harness = require('../sim-harness');
  const C = {
    classPlayer: 0, classPlayerDay: null, classVillagers: new Set(), subclasses: {},
    ascPlayer: 0, ascVillager: 0, ascPaths: [],
    verbPlayer: 0, verbVillager: 0, verbs: {}, passives: {}, villageLostDay: null,
    gates: { p: {}, v: {} }, lostCause: null,
  };
  const _loadGame = harness.loadGame;
  harness.loadGame = async function () {
    const r = await _loadGame.apply(this, arguments);
    const G = r.Game;
    const _tele = G.tele;
    G.tele = function (type, data) {
      try {
        const d = data || {};
        const day = ((G.state || {}).scholar || {}).day || 0;
        if (type === 'class_recognized') {
          if (d.who === 'player') { C.classPlayer++; if (C.classPlayerDay == null) C.classPlayerDay = day; }
          else C.classVillagers.add(d.who);
          const k = d.path + '/' + d.subclass;
          C.subclasses[k] = (C.subclasses[k] || 0) + 1;
        } else if (type === 'ascension') {
          if (d.who === 'villager') C.ascVillager++; else C.ascPlayer++;
          C.ascPaths.push((d.who === 'villager' ? 'v:' : 'p:') + d.godhood);
        } else if (type === 'godpath_verb') {
          if (d.who && d.who !== 'player') C.verbVillager++; else C.verbPlayer++;
          const k = (d.who && d.who !== 'player' ? 'v:' : 'p:') + d.ability;
          C.verbs[k] = (C.verbs[k] || 0) + 1;
        } else if (/^godpath_(lifeline|ember|feed_camp|bribe|passive)$/.test(type)) {
          const k = (d.who && d.who !== 'player' ? 'v:' : 'p:') + (d.ability || type.replace('godpath_', ''));
          C.passives[k] = (C.passives[k] || 0) + 1;
        } else if (type === 'village_lost' && C.villageLostDay == null) C.villageLostDay = day;
      } catch (e) { console.warn('[sweep-buff] count', e.message); }
      return _tele.apply(this, arguments);
    };
    // how the village was lost: famine (the scattering) or no successor
    const _say = G.say;
    G.say = function (m) {
      try {
        const t = String(m || '');
        if (!C.lostCause && /Haven couldn.t hold/.test(t)) C.lostCause = 'famine';
        else if (!C.lostCause && /No one is left to pick up the Codex/.test(t)) C.lostCause = 'no-successor';
      } catch (e) { console.warn('[sweep-buff] say', e.message); }
      return _say.apply(this, arguments);
    };
    // ascension gates at day 80+: which ones the best build passes (per run)
    const _ed = G.endDay;
    G.endDay = function () {
      try {
        const day = ((G.state || {}).scholar || {}).day || 0;
        const GH = (globalThis.Scattering || {}).Godhood;
        if (day >= 80 && GH && GH.godhoods) {
          const mark = (who, cl) => {
            const g = C.gates[who];
            if (cl.classOk) g.cls = true;
            if (cl.classOk && cl.kit >= cl.needKit) g.kit = true;
            if (cl.classOk && cl.kit >= cl.needKit && cl.coreHit) g.pay = true;
            if (cl.classOk && cl.kit >= cl.needKit && cl.synergy) g.kitDeed = true;
          };
          for (const gh of GH.godhoods()) {
            mark('p', GH.godhoodCloseness(G.state.scholar, gh, day));
            for (const vid of ((G.state.village || {}).roster || [])) {
              if ((((G.state.village.npcAbilities || {})[vid]) || []).length < 3) continue;
              mark('v', GH.villagerGodhoodCloseness(G, vid, gh));
            }
          }
        }
      } catch (e) { console.warn('[sweep-buff] gates', e.message); }
      return _ed.apply(this, arguments);
    };
    return r;
  };
  const { runComparison } = require('../sweep-compare');
  const seed = parseInt(process.env.SEED || '7', 10);
  const rep = await runComparison({
    label: 'godpath-buff', seeds: [seed], policies: [process.env.POLICY || 'capable'],
    days: parseInt(process.env.DAYS || '150', 10),
    extraMetrics: (Game) => {
      let vAbil = 0, vHolders = 0;
      try { const na = (Game.state.village || {}).npcAbilities || {}; for (const k of Object.keys(na)) { vAbil += (na[k] || []).length; if ((na[k] || []).length) vHolders++; } } catch (e) { console.warn('[sweep-buff] abil', e.message); }
      return { villageLost: !!Game.villageLost, vAbil, vHolders };
    },
  });
  const r = rep.runs[0];
  const out = {
    seed, days: r.days, end: r.endReason, won: r.won, invited: r.table, sat: r.entered,
    villageLost: (r.extra || {}).villageLost || r.endReason === 'village-lost' || r.endReason === 'village-dead', vAbil: (r.extra || {}).vAbil, vHolders: (r.extra || {}).vHolders,
    classPlayer: C.classPlayer > 0, classPlayerDay: C.classPlayerDay, classVillagers: C.classVillagers.size,
    subclasses: C.subclasses, ascPlayer: C.ascPlayer, ascVillager: C.ascVillager, ascPaths: C.ascPaths,
    verbPlayer: C.verbPlayer, verbVillager: C.verbVillager, verbs: C.verbs, passives: C.passives,
    deaths: r.deaths, gates: C.gates, lostCause: C.lostCause,
  };
  console.log('RESULT ' + JSON.stringify(out));
}

function summarize(rows) {
  const n = rows.length;
  const subs = {};
  for (const r of rows) for (const k of Object.keys(r.subclasses || {})) subs[k] = (subs[k] || 0) + r.subclasses[k];
  const verbs = {};
  for (const r of rows) for (const k of Object.keys(r.verbs || {})) verbs[k] = (verbs[k] || 0) + r.verbs[k];
  const passives = {};
  for (const r of rows) for (const k of Object.keys(r.passives || {})) passives[k] = (passives[k] || 0) + r.passives[k];
  const long = rows.filter(r => r.days >= 100);
  return {
    n,
    won: rows.reduce((t, r) => t + (r.won ? 1 : 0), 0),
    sat: rows.reduce((t, r) => t + (r.sat ? 1 : 0), 0),
    invited: rows.reduce((t, r) => t + (r.invited ? 1 : 0), 0),
    villageLost: rows.reduce((t, r) => t + (r.villageLost ? 1 : 0), 0),
    medDays: median(rows.map(r => r.days)),
    subclassesSeen: Object.keys(subs).length,
    subclasses: subs,
    classPlayerPct: Math.round(100 * rows.filter(r => r.classPlayer).length / Math.max(1, n)),
    villagersClassed: rows.reduce((t, r) => t + (r.classVillagers || 0), 0),
    ascPlayer: rows.reduce((t, r) => t + (r.ascPlayer || 0), 0),
    ascPlayerRuns: rows.filter(r => r.ascPlayer > 0).length,
    runs100: long.length,
    ascPlayerRuns100: long.filter(r => r.ascPlayer > 0).length,
    ascVillager: rows.reduce((t, r) => t + (r.ascVillager || 0), 0),
    verbPlayer: rows.reduce((t, r) => t + (r.verbPlayer || 0), 0),
    verbVillager: rows.reduce((t, r) => t + (r.verbVillager || 0), 0),
    verbs, passives,
    gates: ['p', 'v'].reduce((o, w) => { o[w] = {}; for (const k of ['cls', 'kit', 'pay', 'kitDeed']) o[w][k] = rows.filter(r => r.gates && r.gates[w] && r.gates[w][k]).length; return o; }, {}),
  };
}

async function all() {
  const seeds = (process.env.SEEDS || SEEDS_DEFAULT).split(',').map(Number);
  const par = parseInt(process.env.PAR || '4', 10);
  const rows = [];
  let next = 0;
  const runOne = (seed) => new Promise((resolve) => {
    const ch = spawn(process.execPath, [__filename], { env: Object.assign({}, process.env, { SEED: String(seed) }), stdio: ['ignore', 'pipe', 'ignore'] });
    let buf = '';
    ch.stdout.on('data', d => { buf += d; });
    ch.on('close', () => {
      const line = buf.split('\n').find(l => l.startsWith('RESULT '));
      if (line) { const r = JSON.parse(line.slice(7)); rows.push(r); console.error(`seed ${seed}: days=${r.days} end=${r.end} won=${r.won} lost=${r.villageLost} asc=${r.ascPlayer}/${r.ascVillager} verbs=${r.verbPlayer}/${r.verbVillager}`); }
      else console.error(`seed ${seed}: NO RESULT`);
      resolve();
    });
  });
  const workers = [];
  for (let w = 0; w < par; w++) workers.push((async () => { while (next < seeds.length) { const s = seeds[next++]; await runOne(s); } })());
  await Promise.all(workers);
  rows.sort((a, b) => seeds.indexOf(a.seed) - seeds.indexOf(b.seed));
  const sum = summarize(rows);
  console.log(JSON.stringify(sum, null, 1));
  const oi = process.argv.indexOf('--out');
  if (oi > 0) require('fs').writeFileSync(process.argv[oi + 1], JSON.stringify({ summary: sum, rows }, null, 1));
}

if (process.argv.includes('--all')) all().catch(e => { console.error('FATAL', e); process.exit(1); });
else one().catch(e => { console.error('FATAL', e); process.exit(1); });
module.exports = { summarize };
