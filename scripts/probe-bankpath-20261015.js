#!/usr/bin/env node
// scripts/probe-bankpath-20261015.js — EXERCISE-FEASIBILITY PROBE for the
// bankpath arm (loop B, 2026-10-15, food-economy axis).
//
// Answers BEFORE any sweep spend: does deep_reserves EVER appear in a System
// offer sheet on the courtship road? Instruments (read-only, zero game-code
// changes):
//   - wraps Game.chooseAbility: logs every sheet's ids + src at take time
//   - samples scholar craft-track {level, xp} + held abilities at run end
//
// Substrate: FEASTSCALE_R13=1 (the courtship substrate the arm measures on),
// policies leadfeast/belongfeast (the feastscale-wrapped courtship policies),
// seeds from SEEDS env, DAYS env, 180d death-aware.
//
// Usage:
//   FEASTSCALE_R13=1 SEEDS="111,222" DAYS=180 node scripts/probe-bankpath-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

const REG = { leadcourt: leadfeast, belongseek: belongfeast };

function trackOf(Game) {
  try {
    const t = Game.playerTracks ? Game.playerTracks() : {};
    const c = t.craft || {};
    return { level: c.level || 0, xp: Math.round(c.xp || 0) };
  } catch (e) { return { level: -1, xp: -1 }; }
}

async function oneRun(seed, pid, days) {
  const base = REG[pid];
  const { Game } = await loadGame({ seed, mode: 'bankpath-probe-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const obs = { sheets: [], takes: [] };
  const offerBeats = [];
  const oSay = Game.say;
  if (typeof oSay === 'function') {
    Game.say = function (s) {
      try {
        const line = String(s);
        if (/Ability gained|LEVEL UP|PICK A TRICK|CHOOSE|We\'ve been watching|for your service/i.test(line) &&
            offerBeats.length < 60) {
          offerBeats.push('d' + ((Game.state.scholar || {}).day || 0) + ' ' + line.slice(0, 220));
        }
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
  }
  const oChoose = Game.chooseAbility;
  if (typeof oChoose === 'function') {
    Game.chooseAbility = function (id, replaceId) {
      try {
        const sheet = ((Game.state.scholar || {}).abilityChoices || []).map(c => ({
          id: c.id, src: c.src || '?', level: c.level == null ? '' : c.level,
        }));
        obs.takes.push({ day: (Game.state.scholar || {}).day || 0, sheet, chose: id });
      } catch (e) {}
      return oChoose.apply(this, arguments);
    };
  }
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const ch = ((G.state.scholar || {}).abilityChoices || []);
      if (ch.length) {
        const key = ch.map(c => (c.id || '?') + '@' + (c.src || '?')).join(',');
        if (!obs.sheets.length || obs.sheets[obs.sheets.length - 1].key !== key) {
          obs.sheets.push({
            day: (G.state.scholar || {}).day || 0,
            key,
            ids: ch.map(c => c.id),
            srcs: [...new Set(ch.map(c => c.src || '?'))],
          });
        }
      }
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, policy, { days, sampleEvery: 1000 }); });
  const ab = ((Game.state.scholar || {}).abilities || []).map(a => (a && a.id) || a);
  const deepSheets = obs.sheets.filter(s => s.ids.includes('deep_reserves'));
  const row = {
    policy: pid, seed, days: (Game.state.scholar || {}).day || 0,
    craft: trackOf(Game), abilities: ab,
    nSheets: obs.sheets.length, nTakes: obs.takes.length,
    deepSheets: deepSheets.length,
    deepSheetDays: deepSheets.map(s => s.day),
    sheetSrcs: [...new Set(obs.sheets.flatMap(s => s.srcs))],
    sheets: obs.sheets.map(s => ({ day: s.day, ids: s.ids, srcs: s.srcs })),
    offerBeats,
  };
  try { Game.say = oSay; } catch (e) {}
  const outDir = process.env.PERSEED_DIR;
  if (outDir) {
    try {
      require('fs').mkdirSync(outDir, { recursive: true });
      require('fs').writeFileSync(`${outDir}/bankpath-probe-${pid}-s${seed}.json`, JSON.stringify(row, null, 1));
    } catch (e) {}
  }
  return row;
}

async function main() {
  const seeds = (process.env.SEEDS || '111,222').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  console.log(`FEASTSCALE_R13=${process.env.FEASTSCALE_R13 || '(unset)'} — the probe runs the courtship substrate`);
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    console.log(`\n[${r.policy} s${r.seed}] scholar-day=${r.days} craft=${r.craft.level}L/${r.craft.xp}xp ` +
      `abilities=[${r.abilities.join(',')}] sheets=${r.nSheets} takes=${r.nTakes} ` +
      `deepSheets=${r.deepSheets}${r.deepSheetDays.length ? ' days=' + r.deepSheetDays.join(',') : ''} srcs=[${r.sheetSrcs.join(',')}]`);
    for (const s of r.sheets.slice(0, 12)) console.log('    ' + `d${s.day} [${s.ids.join(',')}] src=${s.srcs.join('|')}`);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
