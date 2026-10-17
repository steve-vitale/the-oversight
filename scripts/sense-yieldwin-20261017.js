#!/usr/bin/env node
// sense-yieldwin-20261017.js — SENSE-TESTING capture for sim-yieldwin.
// Re-runs an armed yieldwin seed with an unbounded narration capture;
// dumps the transcript window around the FIRST companion wave-3 kill so a
// human can judge whether the yield reads as a deliberate, sensible fight
// in the fiction — not just a counter increment.
// Usage: SENSE_SEED=1253 SENSE_POLICY=yieldwin-lead node scripts/sense-yieldwin-20261017.js
// Output: evidence/2026-10-17/yieldwin-sense-<policy>-s<seed>.txt
'use strict';
const fs = require('fs');
const path = require('path');

// KILL-PROTOCOL INFO-SKIP: the layer was deleted after the PRIMARY NO-GO
// (evidence/2026-10-17/sim-yieldwin.md). Without the layer the sense
// capture is not applicable — exit green instead of FATAL-ing on the
// require below.
if (!fs.existsSync(path.join(__dirname, 'policies', 'yieldwin.js'))) {
  console.log('INFO-SKIP: yieldwin layer deleted per kill protocol (sim-yieldwin PRIMARY NO-GO) — sense capture not applicable.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { yieldwinLead, yieldwinBelong } = require('./policies/yieldwin');

async function main() {
  process.env.VETREL = '1';
  process.env.YIELDWIN = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const seed = parseInt(process.env.SENSE_SEED || '1251', 10);
  const policyId = process.env.SENSE_POLICY || 'yieldwin-lead';
  const { Game } = await loadGame({ seed, mode: 'yieldwin-sense', narration: true });
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
  const base = policyId === 'yieldwin-lead' ? yieldwinLead : yieldwinBelong;
  const origDaily = base.daily;
  let killDay = null, killInfo = null, ywSnap = {};
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
        for (const k of ['ywFirstBlood', 'ywYields', 'ywKillRangeHolds', 'ywStealRefusals']) {
          if (ctx[k] != null) ywSnap[k] = ctx[k];
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
  out.push(`# yieldwin sense transcript — ${policyId} seed ${seed}`);
  out.push(`# first companion wave-3 kill: ${killInfo ? JSON.stringify(killInfo) : 'NONE'}`);
  out.push(`# yieldwin telemetry at stop: ${JSON.stringify(ywSnap)}`);
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
  } else {
    out.push('NO COMPANION WAVE-3 KILL RECORDED ON THIS RUN.');
  }
  const fp = path.join(__dirname, '..', 'evidence', '2026-10-17', `yieldwin-sense-${policyId}-s${seed}.txt`);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, out.join('\n'));
  console.log('wrote ' + fp + ` (${narration.length} lines, killDay=${killDay})`);
  delete process.env.VETREL;
  delete process.env.YIELDWIN;
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
