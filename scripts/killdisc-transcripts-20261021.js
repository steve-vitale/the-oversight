#!/usr/bin/env node
// killdisc-transcripts-20261021.js — sense-testing probe for sim-killdisc
// stage 2 (backlog #736).
//
// Re-runs a diagnostic seed (deterministic) with Game.say wrapped and
// captures SAY lines in windows around wave-4+ ENGAGEMENTS (scholar TB
// fights and villager field fights), for human reads of whether villagers
// read as people in these fights. READ-ONLY.
//
// Engagement days come from the diagnostic per-seed JSON (single source of
// truth). Writes evidence/2026-10-21/killdisc-transcripts/<policy>-s<seed>.txt.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        FULLSEAT=1 KILLDISC=1 POLICY=leadfeast SEED=64506 \
//        node scripts/killdisc-transcripts-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64506', 10);

const diagFp = path.join(REPO, 'evidence', '2026-10-21', 'perseed-killdisc', POLICY, `s${SEED}.json`);
let diag = null;
try { diag = JSON.parse(fs.readFileSync(diagFp, 'utf8')); }
catch (e) { console.error(`STOP: cannot read diagnostic ${diagFp} — run the sweep first.`); process.exit(2); }

const targets = [];
for (const f of (diag.fieldFights || [])) targets.push({ day: f.d, kind: 'field', mid: f.mid, vid: f.vid, outcome: f.outcome });
for (const e of (diag.tb || [])) targets.push({ day: e.d, kind: 'TB', mid: e.mid, end: e.end, kills: e.kills });
if (!targets.length) { console.log('no wave-4+ engagements in this run — nothing to transcribe.'); process.exit(0); }
console.log(`transcribing ${targets.length} wave-4+ engagement(s): ` + targets.slice(0, 12).map(t => `d${t.day} ${t.kind} ${t.mid}`).join(', ') + (targets.length > 12 ? ' ...' : ''));

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'killdisc2-transcript', fullTelemetry: false });
  await setupGame(Game);
  const base = POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = POLICY === 'leadfeast' ? 'lead' : 'belong';
  const policy = FD.withFullseatDiag(SD.withSeatDrive(WD.withWinDefer(base, `${tag}-windefer`, 'x'), `${tag}-seatdrive`, 'y'), `${tag}-fullseat`, 'z');
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${day}] ${String(x).replace(/\s+/g, ' ').slice(0, 500)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const outDir = path.join(REPO, 'evidence', '2026-10-21', 'killdisc-transcripts');
  fs.mkdirSync(outDir, { recursive: true });
  const parts = [];
  for (const t of targets) {
    const win = lines.filter(l => {
      const m = l.match(/^\[d(\d+)\]/);
      if (!m) return false;
      const d = parseInt(m[1], 10);
      return d >= t.day - 1 && d <= t.day + 1;
    });
    parts.push(`===== d${t.day} ${t.kind} ${t.mid}${t.vid ? ' (villager ' + t.vid + ')' : ''} outcome=${t.outcome || t.end || '?'} kills=${t.kills != null ? t.kills : '?'} =====`);
    parts.push(win.length ? win.join('\n') : '(no narration captured in window)');
    parts.push('');
  }
  const out = parts.join('\n');
  const fp = path.join(outDir, `${POLICY}-s${SEED}.txt`);
  fs.writeFileSync(fp, out);
  console.log(`wrote ${fp} (${lines.length} narration lines, ${targets.length} engagements)`);
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
