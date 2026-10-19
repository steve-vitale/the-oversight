#!/usr/bin/env node
// compresence-transcripts-20261018.js — sense-testing probe for
// sim-compresence (SENSE-TESTING LAW).
//
// Re-runs a sweep seed (deterministic) with Game.say wrapped and captures
// SAY lines in windows around wave-3 killing fights attributed to channels
// b/c/e/f (present-but-far or absent) — for human reads of whether the
// presence/absence makes in-fiction sense (a bodyguard three tiles away
// doing nothing must have a reason, or that's a blank to name).
// READ-ONLY.
//
// Kill days/channels come from the sweep per-seed JSONs (single source of
// truth). Target channels selectable via CHANS=b,c,e,f (default). Writes
// evidence/2026-10-18/compresence-transcripts/<policy>-s<seed>.txt.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//        POLICY=leadfeast SEED=63301 CHANS=b,c,e,f \
//        node scripts/compresence-transcripts-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }
if (!TF.layerOn()) { console.error('STOP: tribfloor layerOn() false.'); process.exit(2); }

const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '63301', 10);
const CHANS = (process.env.CHANS || 'b,c,e,f').split(',').map(s => s.trim());
const policy = POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;

const sweepFp = path.join(REPO, 'evidence', '2026-10-18', 'perseed-compresence', `${POLICY}-s${SEED}.json`);
let sweep = null;
try { sweep = JSON.parse(fs.readFileSync(sweepFp, 'utf8')); }
catch (e) { console.error(`STOP: cannot read sweep ${sweepFp} — run the sweep first.`); process.exit(2); }
const targets = (sweep.kills || []).filter(k => CHANS.indexOf(k.channel) >= 0);
if (!targets.length) { console.log(`no channel [${CHANS.join(',')}] wave-3 kills in this run — nothing to transcribe.`); process.exit(0); }
console.log(`transcribing ${targets.length} kill(s): ` + targets.map(k => `d${k.d} ${k.mid} (ch ${k.channel})`).join(', '));

function mechLine(k) {
  const ev = k.channelEvidence || {};
  if (k.channel === 'b') return (ev.joiners || []).map(j => `${j.name} dist ${j.d}`).join('; ');
  if (k.channel === 'c') return 'party: ' + (ev.party || []).map(p => `${p.name}@${p.sameNode ? 'node' : p.node.nx + ',' + p.node.ny}`).join('; ');
  if (k.channel === 'e') return `scholar@${(ev.scholarNode || {}).nx},${(ev.scholarNode || {}).ny} vs ${JSON.stringify(ev.nodeDist || {})}`;
  if (k.channel === 'f') {
    const near = ev.nearest || [];
    return near.map(n => `${n.name} ${n.side || '?'}${n.gridDist != null ? ' d' + n.gridDist : ' no-pos'}${n.sideMatch === false ? ' DOOR' : ''}`).join('; ');
  }
  return '';
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'compresence-transcript', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${day}] ${String(x).slice(0, 400)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const outDir = path.join(REPO, 'evidence', '2026-10-18', 'compresence-transcripts');
  fs.mkdirSync(outDir, { recursive: true });
  const windows = [];
  for (const t of targets) {
    const win = lines.filter(l => {
      const m = /^\[d(\d+)\]/.exec(l);
      return m && Math.abs(parseInt(m[1], 10) - t.d) <= 2;
    });
    windows.push(`===== d${t.d} ${t.mid} — channel ${t.channel} (${t.channelNote}) =====\nMECH: ${mechLine(t)}\n` + win.join('\n'));
  }
  const fp = path.join(outDir, `${POLICY}-s${SEED}.txt`);
  fs.writeFileSync(fp, windows.join('\n\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say-lines captured)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e && e.stack || e); process.exit(2); });
