#!/usr/bin/env node
// relaydarkcost-transcripts-20261020.js — sense-testing probe for
// sim-relaydarkcost. Re-runs a break-pair seed (deterministic) with
// Game.say wrapped AND Game.sysSay restored (sim-harness stubs sysSay to a
// no-op) and captures SAY lines from the road's claim day (or the first
// divergence day) through the run's end — a human read of what the road
// DID in the fiction and whether the break reads as the road's doing
// (SENSE-TESTING LAW). READ-ONLY. Writes
// evidence/2026-10-20/relaydarkcost-transcripts/<side>-<policy>-s<seed>.txt.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 \
//   SIDE=roadarmed POLICY=belongfeast SEED=64205 FROM=claim \
//   node scripts/relaydarkcost-transcripts-20261020.js
// FROM=claim (default): capture from the armed run's claimDay-3 through
// the end. FROM=<day>: capture from that day.
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./sweep-relaydarkcost-20261020');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC', 'SEATDRIVE'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SIDE !== 'control' && process.env.SIDE !== 'roadarmed') { console.error('STOP: SIDE=control|roadarmed.'); process.exit(2); }
if (process.env.TABLEPATHDRIVER === '1') { console.error('STOP: TABLEPATHDRIVER must NOT be 1.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64201', 10);
const SIDE = process.env.SIDE;
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-relaydarkcost', SIDE, POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const gameDays = seedRec.gameDays || 0;
const rd = seedRec.rdSummary || {};
let anchor;
const FROM = process.env.FROM || 'claim';
if (FROM === 'claim' && rd.claimDay != null) anchor = Math.max(1, rd.claimDay - 3);
else if (/^\d+$/.test(FROM)) anchor = parseInt(FROM, 10);
else if (seedRec.tableDay != null) anchor = Math.max(1, seedRec.tableDay - 5);
else anchor = Math.max(1, gameDays - 30);
const keep = new Set();
for (let d = anchor; d <= gameDays; d++) if (d >= 1) keep.add(d);

(async () => {
  const policy = SW.policyFor(POLICY);
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { Game } = await loadGame({ seed: SEED, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      if (keep.has(day)) lines.push(`[d${day}] SAY: ${String(x).slice(0, 900)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const probeEnd = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
  const fid = probeEnd === gameDays ? 'FIDELITY-OK' : `FIDELITY-DIVERGED(probe d${probeEnd} vs sweep d${gameDays})`;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-20', 'relaydarkcost-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${SIDE}-${POLICY}-s${SEED}.txt`);
  const deaths = ((seedRec.deathsAttributed && seedRec.deathsAttributed.attributed) || [])
    .map(d => `d${d.day} ${d.name || d.who} — ${d.channel}/${d.cause}`).join('; ');
  const head = `# relaydarkcost transcript — ${SIDE}/${POLICY} seed ${SEED} [${fid}]\n` +
    `# won=${seedRec.won} end=${seedRec.endReason} gameDays=${gameDays} tableDay=${seedRec.tableDay} satEver=${seedRec.satEver}\n` +
    `# road: claimDay=${rd.claimDay} done=${rd.done} doneDay=${rd.doneDay} verbs=${(rd.deepens | 0) + (rd.efficients | 0) + (rd.rewrites | 0) + (rd.skims | 0)} stoppedTable=${rd.stoppedTable}\n` +
    `# deaths: ${deaths || '—'}\n` +
    `# capture window: d${anchor}..d${gameDays}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} lines, ${fid})`);
})().catch(e => { console.error('TRANSCRIPT FATAL:', e && e.message); process.exit(1); });
