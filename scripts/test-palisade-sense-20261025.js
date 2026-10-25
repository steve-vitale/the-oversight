#!/usr/bin/env node
// scripts/test-palisade-sense-20261025.js — sim-palisade-a SENSE capture.
// SENSE-ONLY, NON-MEASURED: narration on (trajectories shift vs the
// silent census, exactly as the landed sense replays). The stock
// sense replay keeps only a 240-line ring, so a raid rarely lands in
// its window; this capture records EVERY say line (record-then-call
// the real say, so sense behavior is unchanged) and pairs each
// raftdraft census raid, in order, with its RAID line and the
// following line (the escalation beat iff present).
// Usage: node scripts/test-palisade-sense-20261025.js [seed] [days]
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { newStore, installRaftdraftDiag, withRaftdraftDiag } = require('./policies/raftdraft-diag');

async function main() {
  const seed = parseInt(process.argv[2] || '73671', 10);
  const days = parseInt(process.argv[3] || '180', 10);
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.RAFTDRAFT = '1';
  const store = newStore();
  const armed = withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', store);
  const { Game } = await loadGame({ seed, mode: 'palisade-sense', fullTelemetry: false, narration: true });
  const said = [];
  const origSay = Game.say;
  Game.say = function () {
    const line = Array.prototype.slice.call(arguments).join(' ');
    said.push(line);
    if (typeof origSay === 'function') { try { return origSay.apply(this, arguments); } catch (e) {} }
  };
  await setupGame(Game);
  try { installRaftdraftDiag(Game, store); } catch (e) {}
  const result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 });
  const raidLines = [];
  for (let i = 0; i < said.length; i++) {
    if (said[i].indexOf('🐗 RAID —') === 0) raidLines.push({ idx: i, line: said[i], next: said[i + 1] || null });
  }
  const raids = store.raids || [];
  console.log('SENSE-CAPTURE seed=' + seed + ' days=' + result.days + ' gameDays=' + result.gameDays + ' end=' + result.endReason + ' censusRaids=' + raids.length + ' raidLines=' + raidLines.length + ' saidTotal=' + said.length);
  raids.forEach((r, k) => {
    const w = (r.raiders || []).map(x => x.wave | 0);
    const wmax = w.length ? Math.max.apply(null, w) : 1;
    const win = raidLines[k] || {};
    const beat = !!(win.next && win.next.indexOf('bigger than the usual teeth at the door') !== -1);
    console.log('SENSE-RAID day=' + r.day + ' wmax=' + wmax + ' raidN=' + (r.raiders || []).length + ' beat=' + beat);
    console.log('  RAID: ' + (win.line || '(no matching RAID line)'));
    console.log('  NEXT: ' + (win.next || '(none)'));
  });
  if (raidLines.length !== raids.length) console.log('SENSE-PAIRING-MISMATCH raidLines=' + raidLines.length + ' censusRaids=' + raids.length);
}
main().catch(e => { console.error('PALISADE-SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
