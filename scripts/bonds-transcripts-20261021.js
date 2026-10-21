#!/usr/bin/env node
// bonds-transcripts-20261021.js — sense-testing capture for sim-belongbonds
// (2026-10-21, flesh-out loop, axis scale-onramp, backlog #742).
//
// Re-runs armed sweep seeds (deterministic) with Game.say wrapped (and
// Game.sysSay restored — sim-harness stubs sysSay to a no-op) and captures
// SAY lines around diplomatic beats: proposals, link formation, accords,
// the Charter/pact national beats, trust gains, league formation.
// SENSE-TESTING LAW: read the lines and judge whether the bonds read as
// relationships between people, or as ledger ticks.
//
// READ-ONLY (reuses the probe's composition; writes transcript files).
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 BONDS=1 \
//   SEED=64501 node scripts/bonds-transcripts-20261021.js
//   WINDOW=10 (days each side of the anchor; default 10)
'use strict';
const fs = require('fs');
const path = require('path');
// The probe module keys BONDS off ARM at require time — transcripts re-run
// the ARMED stack, so pin ARM before requiring.
process.env.ARM = 'armed';
const SW = require('./probe-bonds-20261021');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'BONDS'])
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
const SEED = parseInt(process.env.SEED || '64501', 10);
const WINDOW = parseInt(process.env.WINDOW || '10', 10) || 10;
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-belongbonds', 'armed', `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }

const KEEP = /covenant|Covenant|COVENANT|charter|Charter|CHARTER|trade|Trade|league|League|trust|Trust|opinion|proposal|Propose|🤝|📜|🌾|tribute|Tribute|accord|Accord|Founding Council|Binding|national|National|polity/i;

(async () => {
  const policy = SW.policyFor();
  const { Game } = await loadGame({ seed: SEED, mode: 'bonds-transcript', fullTelemetry: false });
  await setupGame(Game);
  try {
    if (Game.sysSay && Game.sysSay._harnessStub && Game._origSysSay) Game.sysSay = Game._origSysSay;
  } catch (e) {}
  const lines = [];
  const osay = Game.say.bind(Game);
  const ossy = Game.sysSay ? Game.sysSay.bind(Game) : osay;
  const seen = new Set();
  function cap(day, tag, x) {
    const s = String(x);
    if (!KEEP.test(s)) return;
    const key = day + '|' + s.slice(0, 120);
    if (seen.has(key)) return;
    seen.add(key);
    lines.push(`[d${day} ${tag}] ${s.slice(0, 600)}`);
  }
  Game.say = function (x) {
    try { cap((((Game.state || {}).scholar || {}).day) | 0, 'SAY', x); } catch (e) {}
    return osay.apply(this, arguments);
  };
  if (Game.sysSay) {
    const o = ossy;
    Game.sysSay = function (x) {
      try { cap((((Game.state || {}).scholar || {}).day) | 0, 'SYS', x); } catch (e) {}
      return o.apply(this, arguments);
    };
  }
  let anchorDay = null;
  policy.daily = ((oDaily) => (G, ctx) => {
    let r; if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      if (anchorDay == null && (ctx.bondsProposed || 0) > 0) anchorDay = ((G.state || {}).scholar || {}).day || 0;
    } catch (e) {}
    return r;
  })(policy.daily);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 1 }); });
  if (anchorDay == null) anchorDay = 60;
  const startD = Math.max(1, anchorDay - WINDOW), endD = anchorDay + WINDOW;
  const kept = lines.filter(l => {
    const m = l.match(/^\[d(\d+)/);
    const d = m ? parseInt(m[1], 10) : 0;
    return d >= startD && d <= endD;
  });
  const outDir = path.join(__dirname, '..', 'evidence', '2026-10-21', 'belongbonds-transcripts');
  fs.mkdirSync(outDir, { recursive: true });
  const fp = path.join(outDir, `belongfeast-s${SEED}.txt`);
  fs.writeFileSync(fp, `seed ${SEED}, armed, anchor day ${anchorDay} (first proposal), window d${startD}-d${endD}\n\n` + kept.join('\n') + '\n');
  console.log(`wrote ${fp} (${kept.length} lines)`);
})().catch(e => { console.error('TRANSCRIPT ERROR: ' + (e && e.stack || e)); process.exit(1); });
