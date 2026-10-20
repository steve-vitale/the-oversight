#!/usr/bin/env node
// outshone-corpus-20261020.js — epilogue liveness corpus for the
// sim-outshone-liveness diag arm.
// Re-runs the tableconfirm armed sweep seeds (81301-81312 x
// {leadfeast, belongfeast}, SIDE=armed substrate — FIX IN TREE) and
// captures every epilogue naming beat (OUTSHONE / THE ARCHITECT /
// THE PANTHEON / AUDIT ascension line), then checks each NAMED
// villager against the live dead flags at run end.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 RELAYDARK=1 \
//   POLICY=leadfeast node scripts/outshone-corpus-20261020.js
// Output: evidence/2026-10-20/outshone-corpus/<policy>/s<seed>.json
// NOTE: reads the pre-fix armed sweep JSONs from the MAIN tree only for
// the fidelity pin (expected end day); never writes there.
'use strict';
const fs = require('fs');
const path = require('path');

const POLICY = process.env.POLICY;
if (POLICY !== 'leadfeast' && POLICY !== 'belongfeast') { console.error('STOP: POLICY=leadfeast|belongfeast.'); process.exit(2); }
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'NODEWITNESS', 'KILLDISC', 'TABLEPATHDRIVER', 'RELAYDARK']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 is required (armed substrate).`); process.exit(2); }
}

const { FRESH_SEEDS, SLOTS } = require('./tableconfirm-slots-20261020');
process.env.SEEDS = SLOTS[POLICY].join(','); // identical seedIdx -> identical assignment

const SW = require('./probe-tablepathdriver-20261020');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-20', 'outshone-corpus', POLICY);
fs.mkdirSync(OUTDIR, { recursive: true });
// Pre-fix armed sweep record in the MAIN tree (fidelity pin only — read-only).
const MAINTREE = path.join(process.env.HOME, 'workspace', 'the-scattering', 'evidence', '2026-10-20', 'perseed-tableconfirm', 'armed', POLICY);

const EPI_PATTERNS = [/◈ OUTSHONE/, /◈ THE ARCHITECT/, /◈ THE PANTHEON/, /The table notes \d+ ascension/];

function extractNamed(sayLines) {
  // Pull villager names out of the three beats: "— NAME1 and NAME2 did/what..."
  const named = [];
  for (const ln of sayLines) {
    const m = ln.match(/◈ (?:OUTSHONE|THE ARCHITECT|THE PANTHEON) — (.+?)(?: did | ascended )/);
    if (m) for (const n of m[1].split(' and ')) named.push(n.trim());
  }
  return named;
}

(async () => {
  let n = 0;
  for (const seed of FRESH_SEEDS) {
    const SEEDIDX = SLOTS[POLICY].indexOf(seed);
    const policy = SW.policyFor(POLICY, SEEDIDX);
    const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
    await setupGame(Game);
    const epilines = [];
    const osay = Game.say.bind(Game);
    Game.say = function (x) {
      try {
        const s = String(x);
        if (EPI_PATTERNS.some(p => p.test(s))) {
          const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
          epilines.push(`[d${day}] ${s.slice(0, 400)}`);
        }
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

    const endDay = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
    let asc = [];
    try { asc = Game.tableAscended() || []; } catch (e) {}
    const people = Game.data.villagers || [];
    const named = extractNamed(epilines);
    const liveness = named.map(nm => {
      const rec = people.find(v => v.name === nm);
      return { name: nm, found: !!rec, dead: !!(rec && rec.dead), deadDay: rec ? (rec.deadDay || null) : null };
    });
    const ascLiveness = asc.map(a => {
      const rec = people.find(v => v.id === a.vid);
      return { name: a.name, score: a.score, dead: !!(rec && rec.dead), deadDay: rec ? (rec.deadDay || null) : null };
    });
    const deadNamed = liveness.filter(x => x.found && x.dead);
    const deadCounted = ascLiveness.filter(x => x.dead);

    let fidNote = 'no-prefi-record';
    try {
      const prev = JSON.parse(fs.readFileSync(path.join(MAINTREE, `s${seed}.json`), 'utf8'));
      const sweepEnd = prev.gameDays | 0;
      fidNote = (endDay === sweepEnd) ? `FIDELITY-OK(d${endDay})` : `FIDELITY-DIVERGED(post d${endDay} vs pre d${sweepEnd})`;
    } catch (e) {}

    const rec = {
      seed, policy, endDay, endReason: (Game.state && Game.state.run && Game.state.run.endReason) || null,
      won: (Game.state && Game.state.run && Game.state.run.won) || false,
      sat: (Game.state && Game.state.table && Game.state.table.sat) || null,
      epilogueBeats: epilines,
      namedInBeats: liveness,
      ascendedPool: ascLiveness,
      deadNamed, deadCounted,
      metric: { beatsFired: epilines.length, deadNamed: deadNamed.length, deadCounted: deadCounted.length },
      fidelity: fidNote,
    };
    fs.writeFileSync(path.join(OUTDIR, `s${seed}.json`), JSON.stringify(rec, null, 1));
    console.log(`  [${POLICY} s${seed}] end=d${endDay} beats=${epilines.length} deadNamed=${deadNamed.length} deadCounted=${deadCounted.length} [${fidNote}]`);
    n++;
  }
  console.log(`OUTSHONE CORPUS COMPLETE: ${POLICY} ${n} runs -> ${OUTDIR}`);
})().catch(e => { console.error('CORPUS FATAL:', e && e.stack || e); process.exit(1); });
