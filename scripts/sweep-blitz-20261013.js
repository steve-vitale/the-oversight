#!/usr/bin/env node
// scripts/sweep-blitz-20261013.js — blitz simpolicy pilot driver (2026-10-13).
//
// Before/after on identical seeds for the two new competent layers:
//   COMPETENT_SURPLUS_FEAST=1  -> surplusFeast (feasts on surplus, fed village)
//   COMPETENT_TALK=1           -> deepTalk (held conversations)
//
// Before:  SEEDS="11,22,33,44" POLICIES="competent" DAYS=100 node scripts/sweep-blitz-20261013.js
// After:   COMPETENT_SURPLUS_FEAST=1 COMPETENT_TALK=1 SEEDS="11,22,33,44" POLICIES="competent" DAYS=100 node scripts/sweep-blitz-20261013.js
// Meat leg: SEEDS="11,22" POLICIES="meatseek" DAYS=60 (before/after the same way)
//
// Telemetry per run: feasts hosted, armed feasts, buff grants, ctx counters
// (surplusFeasts, deepConvos, deepTurns, talked, meatTests), talkTo/convoTurn
// verb counts, player-involved bonds, village bonds, trust mean, run ms
// (hang watch). Conversation transcripts (BLITZ_TRANSCRIPTS=1) go to
// /tmp/blitz-transcripts/<label>-s<seed>/ for sense-testing.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { meatseek } = require('./policies/meatseek');

const POLICY_REGISTRY = { competent, meatseek };

function bonds(Game) {
  try {
    const all = (Game.state.village || {}).bonds || {};
    const me = Game.villagerId;
    let mine = 0, village = 0;
    for (const k of Object.keys(all)) {
      const b = all[k] || {};
      if ((b.v || 0) <= 0) continue;
      village++;
      if (k.split('|').includes(me)) mine++;
    }
    return { mine, village };
  } catch (e) { return { mine: 0, village: 0 }; }
}
function trustMean(Game) {
  try {
    const tr = Object.values((Game.state.village || {}).trust || {});
    if (!tr.length) return null;
    return +(tr.reduce((a, b) => a + b, 0) / tr.length).toFixed(1);
  } catch (e) { return null; }
}
function discoveries(Game) {
  try {
    return Object.keys((Game.state.codex || {}).monsters || {})
      .filter(m => ((Game.state.codex.monsters[m] || {}).foodSafe)).length;
  } catch (e) { return 0; }
}

async function main() {
  const label = process.env.LEVER || 'blitz';
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'competent').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '100', 10);
  const capTranscripts = process.env.BLITZ_TRANSCRIPTS === '1';
  const tdir = '/tmp/blitz-transcripts';
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const t0 = Date.now();
      const { Game } = await loadGame({ seed, mode: 'blitz-' + pid });
      await setupGame(Game);
      const ft = { feasts: 0, armed: 0, grants: 0, talkTo: 0, convoTurn: 0 };
      const oh = Game.hostFeast, og = Game.grantFeastBuff;
      if (typeof oh === 'function') {
        Game.hostFeast = function (...a) {
          const r = oh.apply(this, a);
          try { if (r && r.ok) { ft.feasts++; if (r.surgeSpent > 0) ft.armed++; } } catch (e) {}
          return r;
        };
      }
      if (typeof og === 'function') {
        Game.grantFeastBuff = function (...a) {
          const r = og.apply(this, a);
          try { if (r && r.granted) ft.grants++; } catch (e) {}
          return r;
        };
      }
      const ot = Game.talkTo, oc = Game.convoTurn;
      if (typeof ot === 'function') Game.talkTo = function (...a) { ft.talkTo++; return ot.apply(this, a); };
      if (typeof oc === 'function') Game.convoTurn = function (...a) { ft.convoTurn++; return oc.apply(this, a); };
      // transcript capture
      let tcount = 0;
      const oe = Game.endConvo;
      const tseeddir = path.join(tdir, `${label}-s${seed}`);
      if (capTranscripts && typeof oe === 'function') {
        Game.endConvo = function (vid, how) {
          const r = oe.apply(this, arguments);
          try {
            if (tcount < 4) {
              const c = Game.convoGet(vid);
              const tr = (c && c.transcript) || [];
              if (tr.length >= 4) {
                tcount++;
                fs.mkdirSync(tseeddir, { recursive: true });
                const nm = (() => { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } })();
                const lines = [`=== ${label} seed ${seed} policy ${pid} — conversation with ${nm} (${vid}), closed '${how}' ===`];
                for (const e of tr) lines.push(`${e.who === 'them' ? 'THEM' : 'YOU'}: ${String(e.text || '').slice(0, 500)}`);
                fs.writeFileSync(path.join(tseeddir, `${tcount}-${vid}.txt`), lines.join('\n'));
              }
            }
          } catch (e) {}
          return r;
        };
      }
      let ctxRef = null;
      const policy = Object.assign({}, base);
      const od = base.daily;
      policy.daily = (G, c) => { ctxRef = c; try { return od(G, c); } catch (e) {} };
      const result = await runDays(Game, policy, { days, sampleEvery: 20 });
      const bd = bonds(Game);
      const c = ctxRef || {};
      const row = {
        policy: pid, seed, days: result.days, endReason: result.endReason,
        feasts: ft.feasts, armed: ft.armed, grants: ft.grants,
        talkTo: ft.talkTo, convoTurn: ft.convoTurn,
        talked: c.talked || 0, deepConvos: c.deepConvos || 0, deepTurns: c.deepTurns || 0,
        surplusFeasts: c.surplusFeasts || 0, surplusArmed: c.surplusArmedFeasts || 0,
        meatTests: c.meatTests || 0, discoveries: discoveries(Game),
        bondsMine: bd.mine, bondsVillage: bd.village, trust: trustMean(Game),
        ms: Date.now() - t0,
      };
      try {
        const s = Game.state.scholar || {};
        row.feastSurgeUsed = !!((s.prog || {}).feastSurgeUsed);
        row.sentimentTaught = !!(Game.sentimentTaught && Game.sentimentTaught());
      } catch (e) {}
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `feast=${row.feasts}/${row.armed} grants=${row.grants} used=${row.feastSurgeUsed ? 1 : 0} ` +
        `talkTo=${row.talkTo} turns=${row.convoTurn} deep=${row.deepConvos}/${row.deepTurns} ` +
        `meatTests=${row.meatTests} disc=${row.discoveries} ` +
        `bonds(mine/village)=${row.bondsMine}/${row.bondsVillage} trust=${row.trust} ms=${row.ms}`);
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + fn(r), 0);
  console.log(`\n${label}: runs=${rows.length} feasts=${agg(r => r.feasts)} grants=${agg(r => r.grants)} ` +
    `used=${agg(r => (r.feastSurgeUsed ? 1 : 0))}/${rows.length} ` +
    `deepConvos=${agg(r => r.deepConvos)} deepTurns=${agg(r => r.deepTurns)} ` +
    `meatTests=${agg(r => r.meatTests)} discoveries=${agg(r => r.discoveries)} ` +
    `bondsMine=${agg(r => r.bondsMine)} bondsVillage=${agg(r => r.bondsVillage)}`);
  const out = process.env.OUT;
  if (out) { fs.writeFileSync(out, JSON.stringify({ label, rows }, null, 1)); console.error('wrote ' + out); }
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = {};
