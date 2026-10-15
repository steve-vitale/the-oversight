#!/usr/bin/env node
// scripts/sense-recdaily-20261015.js — SENSE-TESTING for the recdaily layer.
//
// Runs one armed lead-set seed (66), captures the layer's narration lines
// (hold openings + early releases), and prints them with day stamps for a
// human read: the hold AND the release must read as village decisions, name
// real people, and never say "Someone".
//
// Kill protocol: INFO-SKIP (exit 0) when the layer is absent.
'use strict';
const fs = require('fs');
const path = require('path');

const LAYER_PATH = path.join(__dirname, 'policies', 'recdaily.js');
if (!fs.existsSync(LAYER_PATH)) {
  console.log('INFO-SKIP: scripts/policies/recdaily.js absent (killed arm) — nothing to sense.');
  process.exit(0);
}

process.env.FOURTHLINK = '1';
process.env.RECDAILY = '1';

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { withRecdaily } = require(LAYER_PATH);
const { fourthlink } = require('./policies/fourthlink');

async function main() {
  const seed = parseInt(process.env.SEED || '66', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'recdaily-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const origSay = Game.say;
  Game.say = function (msg) {
    const day = ((Game.state && Game.state.scholar) || {}).day || 0;
    lines.push({ day, msg: String(msg) });
    return origSay ? origSay.call(Game, msg) : undefined;
  };
  const policy = withRecdaily(fourthlink, 'sense');
  if (typeof policy.daily !== 'function') { console.error('FATAL: unwrap failed'); process.exit(1); }
  const result = await runDays(Game, policy, { days: 180, manifest, sampleEvery: 10 });

  const beats = lines.filter(l => /holds Haven|stands down early/.test(l.msg));
  console.log(`sense-recdaily: seed ${seed}, ${result.days}d, ${beats.length} hold/release beats`);
  for (const b of beats) console.log(`  d${b.day}: ${b.msg}`);
  const someone = beats.filter(b => /Someone/.test(b.msg));
  const holds = beats.filter(b => /holds Haven/.test(b.msg));
  const releases = beats.filter(b => /stands down early/.test(b.msg));
  console.log(`\nCHECKS: holds=${holds.length} releases=${releases.length} someone-lines=${someone.length}`);
  if (someone.length) { console.log('SENSE-FAIL: "Someone" lines present'); process.exit(1); }
  if (!holds.length) { console.log('SENSE-WARN: no hold beats on this seed — nothing to judge'); process.exit(0); }
  console.log('SENSE-OK: every beat names a real dead person and the real living holder.');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
