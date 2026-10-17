#!/usr/bin/env node
// test-attrition-scholar-20261017.js — proof test for the scholar-death
// instrument blind spot (gap-closure 2026-10-17).
//
// analyze-attrition.js classified scholar deaths with `d.scholar` — a field
// that never exists on tele('death') records (they carry player:true since
// the 2026-10-13 deathattr fix). Every scholar death was silently bucketed
// as a villager death, and the "player deaths by cause" section always
// printed empty.
//
// Fix: isScholarDeath(d) — player:true first, /player|scholar/i kind
// fallback (same convention as succhain-lib's isBearerDeath).
//
// Method: build a tiny sweep shard with one scholar death (player:true,
// cause 'combat') and one villager death (kind 'villager', cause
// 'sickness'), run analyze-attrition.js on it, assert the PLAYER-combat
// bucket and the non-empty player-deaths section.
// RED (pre-fix): scholar death bucketed V-combat; player deaths {}.
// GREEN (post-fix): PLAYER-combat bucketed; player deaths {"combat":1}.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const shard = [{
  days: 60,
  deaths: [
    { day: 20, kind: 'villager', who: 'v-scholar', cause: 'combat', player: true },
    { day: 42, kind: 'villager', who: 'v-other', cause: 'sickness' },
  ],
}];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'attr-scholar-'));
const shardPath = path.join(dir, 'shard.json');
fs.writeFileSync(shardPath, JSON.stringify(shard));

let out;
try {
  out = execFileSync('node', [path.join(__dirname, 'analyze-attrition.js'), shardPath], { encoding: 'utf8' });
} catch (e) {
  console.error('FATAL: analyze-attrition.js crashed', String(e && e.message).slice(0, 200));
  process.exit(2);
}
console.log(out.split('\n').filter(l => /PLAYER|player deaths|V-combat|V-sickness/.test(l)).join('\n'));

let fails = 0;
const fail = (m) => { fails++; console.log('  FAIL:', m); };
if (!/PLAYER-combat/.test(out)) fail('scholar death (player:true, combat) not bucketed PLAYER-combat');
else console.log('bucket ok: PLAYER-combat present');
if (!/"combat":1/.test(out)) fail('player deaths by cause section missing {"combat":1}');
else console.log('section ok: player deaths {"combat":1}');
if (/V-other:\s*combat|V-combat[^:]*\|[^|]*1\.00/.test(out) && !/PLAYER-combat/.test(out)) fail('scholar death leaked into a villager bucket');
if (!/V-sickness/.test(out)) fail('villager sickness death not bucketed V-sickness (regression)');
else console.log('regression ok: villager death still V-sickness');

fs.rmSync(dir, { recursive: true, force: true });
if (fails) { console.log(`\nRED: ${fails} failing assertion(s)`); process.exit(1); }
console.log('\nGREEN: scholar deaths attributed via player:true');
