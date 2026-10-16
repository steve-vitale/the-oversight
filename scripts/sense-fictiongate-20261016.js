#!/usr/bin/env node
// scripts/sense-fictiongate-20261016.js — sense-test transcript capture for
// sim-fictiongate-b (loop B, 2026-10-16, food-economy axis).
//
// SENSE-TESTING LAW: capture one clean-ledger cold-shoulder firing and one
// honest-ledger firing IN CONTEXT (the arming sequence), for a human read
// of coherence and meaning. Runs two short seeds on the ARMED code and
// writes transcripts the moment each firing voices (a post-hoc ring buffer
// evicts early-day context on long runs).
//
// s137 leadfeast: first firing d13, voluntaryNet7=0 (meal-driven) — expect
//   the meal-aware journal line.
// s470 leadfeast: first firing d4, voluntaryNet7=-750 (honest) — expect the
//   honest journal line.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     node scripts/sense-fictiongate-20261016.js
// Writes: evidence/2026-10-16/fictiongate-sense/<policy>-s<seed>-d<day>.txt
'use strict';
const fs = require('fs');
const path = require('path');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SENSE STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SENSE STOP: SEATDRIVE=0 required.'); process.exit(2); }
process.env.LEDGERDIAG = '1';

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'fictiongate-sense');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installLedgerDiag, classifyBeat } = require('./ledgerdiag-lib-20261016');
const SD = require('./policies/seatdrive');

async function oneRun(pid, seed, days) {
  const base = pid === 'leadfeast' ? SD.leadseat : SD.belongseat;
  const policy = Object.assign({}, base);
  const od = base.daily;
  let track = null;
  const window = []; // rolling last-60 say beats
  let firingN = 0;
  policy.daily = (G, ctx) => { try { track.dawn(G); } catch (e) {} return od ? od(G, ctx) : undefined; };
  await quietLog(async () => {
    const { Game } = await loadGame({ seed, mode: 'fictiongate-sense' });
    await setupGame(Game);
    track = installLedgerDiag(Game);
    const oSay = Game.say;
    const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
    Game.say = function (t) {
      try {
        const s = String(t);
        window.push({ day: gday(), text: s.slice(0, 500) });
        if (window.length > 60) window.shift();
        const cls = classifyBeat(s);
        if (cls === 'COLD_SHOULDER_SAY' || cls === 'COLD_SHOULDER_JOURNAL') {
          firingN++;
          const day = gday();
          const lines = [`# sense transcript: ${pid} s${seed} day ${day} (firing #${firingN} this run)`,
            `# the 40 beats before the cold-shoulder voice, then the voice itself`, ''];
          for (const b of window.slice(0, -1)) lines.push(`[d${b.day}] ${b.text}`);
          lines.push('--- the firing ---');
          lines.push(`[d${day}] ${s.slice(0, 500)}`);
          fs.writeFileSync(path.join(OUTDIR, `${pid}-s${seed}-d${day}-f${firingN}.txt`), lines.join('\n'));
        }
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
    await runDays(Game, policy, { days });
    try { track.dawn(Game); } catch (e) {}
    const fin = track.finalize();
    track.uninstall();
    Game.say = oSay;
    // annotate each transcript with the instrument's ledger reading
    for (const f of ((fin && fin.coldShoulder) || {}).firings || []) {
      const p = path.join(OUTDIR, `${pid}-s${seed}-d${f.day}-f`);
      const cands = fs.readdirSync(OUTDIR).filter(x => x.startsWith(`${pid}-s${seed}-d${f.day}-f`));
      for (const c of cands) {
        const fp = path.join(OUTDIR, c);
        const body = fs.readFileSync(fp, 'utf8');
        const head = `# ledger at firing: voluntaryNet7=${f.voluntaryNet7} voluntaryNet=${f.voluntaryNet} mealShare=${f.mealShare} heat=${f.heat}\n`;
        fs.writeFileSync(fp, head + body);
      }
    }
    console.log(`  ${pid} s${seed}: ${firingN} cold-shoulder voices captured`);
  });
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  await oneRun('leadfeast', 137, 30); // clean-ledger first firing
  await oneRun('leadfeast', 470, 30); // honest first firing
  console.log('SENSE DONE ->', OUTDIR);
}
main().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
