#!/usr/bin/env node
// sense-vetrel-20261016.js — SENSE-TESTING capture for sim-vetrel.
// Re-runs vetrel-belong seed 1227 (pilot: 2 companion wave-3 kills, 1 wave-4
// unlock) with an unbounded narration capture; dumps the transcript window
// around the FIRST companion wave-3 kill so a human can judge whether the
// beats read as people fighting together, not a bot.
// Usage: node scripts/sense-vetrel-20261016.js
// Output: evidence/2026-10-16/vetrel-sense-s1227.txt
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { vetrelBelong, vetrelLead } = require('./policies/vetrel');

async function main() {
  process.env.VETREL = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const seed = parseInt(process.env.SENSE_SEED || '1227', 10);
  const policyId = process.env.SENSE_POLICY || 'vetrel-belong';
  const { Game } = await loadGame({ seed, mode: 'vetrel-sense', narration: true });
  await setupGame(Game);
  const narration = [];
  const hook = (fnName, surface) => {
    const orig = Game[fnName].bind(Game);
    Game[fnName] = function (text) {
      try {
        const day = (Game.state.scholar || {}).day || 0;
        let msg = text;
        if (msg && typeof msg === 'object' && !(msg instanceof String)) {
          msg = msg.text || msg.desc || msg.msg || msg.message || String(msg);
        }
        msg = String(msg == null ? '' : msg);
        if (msg) narration.push({ day, surface, text: msg.slice(0, 600) });
      } catch (e) {}
      return orig(text);
    };
  };
  hook('say', 'narration');
  hook('sysSay', 'sys');
  const base = policyId === 'vetrel-lead' ? vetrelLead : vetrelBelong;
  const origDaily = base.daily;
  let killDay = null, killInfo = null;
  const seenKills = new Set();
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        for (const e of (G.state.waveKillLog || [])) {
          if (e && (e.w | 0) >= 3 && e.via === 'companion') {
            const key = e.d + ':' + e.mid + ':' + e.by;
            if (!seenKills.has(key)) {
              seenKills.add(key);
              if (killDay == null) { killDay = e.d; killInfo = e; }
            }
          }
        }
      } catch (e2) {}
      // Stop the run shortly after the first companion kill lands — the
      // transcript window is what we want, not the full 180d.
      if (killDay != null && ((G.state.scholar || {}).day || 0) >= killDay + 1) {
        G.over = true;
        G.state.scholar.deathCause = 'sense-stop';
      }
    },
  });
  await quietLog(async () => runDays(Game, policy, { days: 180, sampleEvery: 30 }));
  const out = [];
  out.push(`# vetrel sense transcript — ${policyId} seed ${seed}`);
  out.push(`# first companion wave-3 kill: ${killInfo ? JSON.stringify(killInfo) : 'NONE'}`);
  out.push(`# narration lines captured: ${narration.length}`);
  out.push('');
  if (killDay != null) {
    const lo = killDay - 3, hi = killDay + 1;
    out.push(`## window d${lo}..d${hi} (kill on d${killDay})`);
    let lastDay = null;
    for (const n of narration) {
      if (n.day < lo || n.day > hi) continue;
      if (n.day !== lastDay) { out.push(`\n----- day ${n.day} -----`); lastDay = n.day; }
      out.push(`[${n.surface}] ${n.text}`);
    }
    // Also dump the vetrel telemetry for context.
  } else {
    out.push('NO COMPANION WAVE-3 KILL RECORDED ON THIS RUN.');
  }
  const fp = path.join(__dirname, '..', 'evidence', '2026-10-16', `vetrel-sense-${policyId}-s${seed}.txt`);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, out.join('\n'));
  console.log('wrote ' + fp + ` (${narration.length} lines, killDay=${killDay})`);
  delete process.env.VETREL;
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
