#!/usr/bin/env node
// scripts/sense-ambientfix-20261017.js — transcript capture for the
// SENSE-TESTING LAW sense-reads of sim-ambientfix-b (#440).
//
// Captures the full apVillageGossip output (benevolent-pilot food lines +
// general audience lines + sadistic lines) on the real engine over
// long-horizon armed runs, plus a deterministic per-pilot persona sequence
// (each pilot x 4 days x 2 speakers) for the sense-read in
// evidence/2026-10-17/sim-ambientfix-b.md.
//
// SEEDS/POLICIES env-overridable. OUT = transcript dir (required).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     OUT=evidence/2026-10-17/ambientfix-transcripts node scripts/sense-ambientfix-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (!process.env[k]) { console.log(`  (default: ${k}=1)`); process.env[k] = '1'; }
}
if (!process.env.SEATDRIVE) { console.log('  (default: SEATDRIVE=0)'); process.env.SEATDRIVE = '0'; }

const SEEDS = (process.env.SEEDS || '1505,1606').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim());
const DAYS = Number(process.env.DAYS || 180);
const OUT = process.env.OUT;
if (!OUT) { console.error('OUT= required'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const PMAP = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };

function classify(t) {
  const s = String(t || '');
  if (!/^\u{1F4AC}/u.test(s)) return null;
  // Pilot-food: all four variants (v0 the original template, v1 names the
  // pilot without "leaving food out", v2 "written all over it", v3 the
  // "won't admit a thing" whisper).
  if (/leaving food out|written all over it|Wren|Old Tam/.test(s) && !/That (Wren|Old Tam)\.\.\./.test(s)) return 'pilot-food';
  if (/That .*\.\.\. I don.t like the way it looks/.test(s)) return 'pilot-sadistic';
  return 'audience-general';
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const perKey = { 'pilot-food': [], 'pilot-sadistic': [], 'audience-general': [] };

  // PART 1 — deterministic persona sequences: each pilot x 4 days x 2 speakers
  let G0 = null;
  await quietLog(async () => {
    const r = await loadGame({ seed: 424242, mode: 'sense-ambientfix' });
    G0 = r.Game;
    await setupGame(G0);
  });
  const seqs = [];
  for (const [pid, pname] of [['wren', 'Wren'], ['old_tam', 'Old Tam']]) {
    for (const vid of ['v_sense_1', 'v_sense_2']) {
      for (let d = 1; d <= 4; d++) {
        G0.state.scholar.day = d;
        const per = G0.apPersona(pid);
        seqs.push({ pid, vid, day: d, text: G0.apPilotFoodLine(vid, pid, per, {}) });
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'persona-sequences.json'), JSON.stringify(seqs, null, 1));
  console.log(`persona sequences: ${seqs.length} lines`);

  // PART 2 — full gossip transcripts on armed long runs
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const base = PMAP[pid];
      const policy = Object.assign({}, base);
      const od = base.daily;
      const lines = [];
      await quietLog(async () => {
        const { Game } = await loadGame({ seed, mode: 'sense-run' });
        await setupGame(Game);
        const oSay = Game.say;
        Game.say = function (t) {
          try {
            const k = classify(t);
            if (k) { lines.push({ day: (this.state.scholar || {}).day || 0, kind: k, text: String(t) }); perKey[k].push(String(t)); }
          } catch (e) {}
          return oSay.apply(this, arguments);
        };
        policy.daily = (G, ctx) => (od ? od(G, ctx) : undefined);
        await runDays(Game, policy, { days: DAYS, sampleEvery: 1 });
        Game.say = oSay;
      });
      fs.writeFileSync(path.join(OUT, `${pid}-s${seed}-gossip.json`), JSON.stringify(lines, null, 1));
      console.log(`${pid} s${seed}: ${lines.length} gossip lines (pilot-food ${lines.filter(l => l.kind === 'pilot-food').length})`);
    }
  }
  const summary = {};
  for (const k of Object.keys(perKey)) {
    summary[k] = { firings: perKey[k].length, distinct: new Set(perKey[k]).size, samples: Array.from(new Set(perKey[k])).slice(0, 12) };
  }
  fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
