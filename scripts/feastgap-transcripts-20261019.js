#!/usr/bin/env node
// feastgap-transcripts-20261019.js — sense-testing probe for sim-feastgap.
// Re-runs a sweep seed (deterministic) with Game.say wrapped AND
// Game.sysSay restored (the w5census probe-artifact lesson: sim-harness
// stubs sysSay to a no-op, so a say-only wrap renders the System silent)
// and captures SAY lines in the window around the seed-pair's divergence
// day (from feastgap-corpus-summary.json), for a human read of what the
// two villages looked like and why one's path stalls (SENSE-TESTING LAW).
// READ-ONLY. Writes evidence/2026-10-19/feastgap-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   POLICY=leadfeast SEED=64201 node scripts/feastgap-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-feastgap-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.VETREL === '1') { console.error('STOP: VETREL must not be 1.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64201', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-feastgap', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
// first def5 day from the sweep's own daily series.
let firstDef5 = null;
for (const rec of (seedRec.recs || [])) {
  if (rec.st && rec.st.def5) { firstDef5 = rec.d; break; }
}
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evidence', '2026-10-19', 'feastgap-corpus-summary.json'), 'utf8'));
const pair = (corpus.pairs || []).find(p => p.seed === SEED);
const divDay = pair && pair.divergenceDay != null ? pair.divergenceDay : null;

// Capture window: divergence day ±7d; else the last 15 days.
let anchor, endD;
if (divDay != null) { anchor = Math.max(1, divDay - 7); endD = divDay + 7; }
else { const ed = seedRec.gameDays || 180; anchor = Math.max(1, ed - 15); endD = ed; }
const keep = new Set();
for (let d = anchor; d <= endD; d++) if (d >= 1) keep.add(d);

(async () => {
  const policy = SW.policyFor(POLICY);
  // Sweep-identical loadGame args — trajectory must match the measured run.
  const { Game } = await loadGame({ seed: SEED, mode: 'feastgap', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      if (keep.has(day)) lines.push(`[d${day}] SAY: ${String(x).slice(0, 700)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  // sysSay restore — the sim-harness stubs it to a no-op; restore the
  // engine's format (game.js) so the System's hold/death beats are heard.
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'feastgap-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const wdLines = ((seedRec.deathsAttributed || {}).deaths || []).map(d => `d${d.day} ${d.who} (${d.player ? 'scholar' : 'villager'}) — ${d.channel}/${d.cause}`).join('; ');
  const head = `# feastgap transcript — pre-seat-winside-novetrel/${POLICY} seed ${SEED}\n` +
    `# divergence: ${divDay == null ? '—' : 'd' + divDay}, door: ${firstDef5 == null ? 'n/a' : 'd' + firstDef5}, ` +
    `w4d=${seedRec.wave4Day == null ? '—' : 'd' + seedRec.wave4Day}, end=${seedRec.endReason}:d${seedRec.gameDays}\n` +
    `# flows: tribute=${(seedRec.flowAgg || {}).tributePaid}, tend=${(seedRec.flowAgg || {}).tendPaid}, feasts=${(seedRec.flowAgg || {}).feasts}\n` +
    `# deaths: ${((seedRec.deathsAttributed || {}).deaths || []).length}${wdLines ? ' — ' + wdLines : ''}\n` +
    `# say-lines captured d[${anchor}, ${endD}]: ${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
