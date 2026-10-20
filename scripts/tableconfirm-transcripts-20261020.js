#!/usr/bin/env node
// tableconfirm-transcripts-20261020.js — sense-testing probe for the
// sim-tablepathdriver scoped confirm. Re-runs an armed sweep seed
// (deterministic, SEATDRIVE=1 + TABLEPATHDRIVER=1 + RELAYDARK=1) with
// Game.say wrapped AND Game.sysSay restored (sim-harness stubs sysSay to a
// no-op, so a say-only wrap renders the System silent) and captures SAY
// lines from just before the table SITTING through the village's end, for
// a human read of the walked table paths — the seated windows must read as
// real people making choices, not stat readouts (SENSE-TESTING LAW).
// READ-ONLY. Writes evidence/2026-10-20/tableconfirm-transcripts/<policy>-s<seed>.txt.
//
// The slot placement MUST match the sweep: process.env.SEEDS is set from
// tableconfirm-slots-20261020.js BEFORE the probe module is required, so
// seedIdx (and the assigned door) is identical to the measured run.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 RELAYDARK=1 \
//   POLICY=leadfeast SEED=81302 node scripts/tableconfirm-transcripts-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const POLICY = process.env.POLICY;
const SEED = parseInt(process.env.SEED || '', 10);
if (POLICY !== 'leadfeast' && POLICY !== 'belongfeast') { console.error('STOP: POLICY=leadfeast|belongfeast.'); process.exit(2); }
if (!Number.isFinite(SEED)) { console.error('STOP: SEED=<fresh seed>.'); process.exit(2); }

const { FRESH_SEEDS, SLOTS } = require('./tableconfirm-slots-20261020');
if (!FRESH_SEEDS.includes(SEED)) { console.error(`STOP: seed ${SEED} not in the confirm seed set.`); process.exit(2); }
const SEEDIDX = SLOTS[POLICY].indexOf(SEED);
if (SEEDIDX < 0) { console.error(`STOP: seed ${SEED} not in ${POLICY} slots.`); process.exit(2); }
process.env.SEEDS = SLOTS[POLICY].join(','); // identical seedIdx -> identical assignment

const SW = require('./probe-tablepathdriver-20261020');
const TPD = require('./policies/tablepathdriver');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tableconfirm', 'armed', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: armed sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));

const assigned = seedRec.tpAssigned || TPD.assignedDoor(POLICY, SEEDIDX);
// Walks from doorEvents + finalsEvents (the pilot's instrument fix).
const tpd = seedRec.tpdSummary || {};
const doorEvents = tpd.doorEvents || [];
const finalsByPath = {};
for (const f of (tpd.finalsEvents || [])) finalsByPath[f.path] = f;
const walked = doorEvents.map(d => {
  const pid = String(d.picked || '').replace(/^path:/, '');
  const fin = finalsByPath[pid];
  return `${pid}/${(fin && fin.branch) || '?'}${d.fellBack ? ' (fallback)' : ''}`;
}).join(', ') || '—';
const terminal = seedRec.tableDoneDay != null && (seedRec.phaseTrace || []).indexOf('done') >= 0;

const sitDay = seedRec.sittingDay;
const gameDays = seedRec.gameDays || 0;
let anchor, endD;
if (sitDay != null) { anchor = Math.max(1, sitDay - 3); endD = gameDays; }
else if (seedRec.tableDay != null) { anchor = Math.max(1, seedRec.tableDay - 3); endD = gameDays; }
else { anchor = Math.max(1, gameDays - 15); endD = gameDays; }
const keep = new Set();
for (let d = anchor; d <= endD; d++) if (d >= 1) keep.add(d);

(async () => {
  const policy = SW.policyFor(POLICY, SEEDIDX);
  // Sweep-identical loadGame args — trajectory must match the measured
  // run so the captured lines cover the measured table walk.
  const { Game } = await loadGame({ seed: SEED, mode: 'posttable', fullTelemetry: false });
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
  // engine's format (game.js) so the System's table beats are heard.
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  // FIDELITY PIN: the probe trajectory must end where the sweep measured.
  const probeEnd = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
  const sweepEnd = gameDays | 0;
  const fid = probeEnd === sweepEnd ? 'FIDELITY-OK' : `FIDELITY-DIVERGED(probe d${probeEnd} vs sweep d${sweepEnd})`;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-20', 'tableconfirm-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const rs = seedRec.relayAtSit || {};
  const head = `# tableconfirm transcript — tablepathdriver-win-side/${POLICY} seed ${SEED} [${fid}]\n` +
    `# assigned door=${assigned}, walked=[${walked}], terminal=${terminal}, sat=${sitDay != null ? 'd' + sitDay : 'no'}, end=${seedRec.endReason}:d${gameDays}, won=${seedRec.won}\n` +
    `# relay at sit: lean=${rs.lean} band=${rs.band} grounding=${rs.grounding} darkUses=${rs.darkUses} lightUses=${rs.lightUses} bond=${rs.bond} stage=${rs.stage} held=${rs.held}\n` +
    `# window d${anchor}–d${endD}\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} SAY lines) [${fid}]`);
})().catch(e => { console.error('TRANSCRIPT FATAL:', e && e.stack || e); process.exit(1); });
