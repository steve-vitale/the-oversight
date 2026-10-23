#!/usr/bin/env node
// sense-sample-easingchannels-b.js — SENSE-TESTING LAW: samples throttle/
// compensation-adjacent say lines from the full-sweep say files and checks
// they read as sensible villager/game narration (not robotic repeats).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const DIR = path.join(os.homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-easingchannels-b');
const FILES = ['say-easingchannels-b-pd1dg0-leadfeast', 'say-easingchannels-b-pd1dg1-leadfeast', 'say-easingchannels-b-pd0dg0-belongfeast', 'say-easingchannels-b-pd1dg1-belongfeast'];
const PAT = /easing|harvest standing|glut|surplus|shelves are full|racks are.*full|fresh pile|pantry keeps|depri|eaten at the fire instead/i;
for (const f of FILES) {
  const p = path.join(DIR, f + '.json');
  if (!fs.existsSync(p)) { console.log('MISSING ' + f); continue; }
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const all = [];
  for (const s of Object.keys(j.say)) for (const l of j.say[s]) all.push({ seed: s, day: l.day, line: l.line || '' });
  const hits = all.filter(x => PAT.test(x.line));
  console.log('=== ' + f + ' === total ' + all.length + ' hits ' + hits.length);
  const by = {};
  for (const h of hits) { const k = h.line.slice(0, 110); by[k] = (by[k] || 0) + 1; }
  for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(v + 'x :: ' + k);
  // a concrete coherent passage: first seed, days with >=2 easing hits
  const s0 = Object.keys(j.say).sort()[0];
  const dayHits = {};
  for (const h of hits.filter(x => String(x.seed) === String(s0))) { dayHits[h.day] = dayHits[h.day] || []; dayHits[h.day].push(h.line.slice(0, 200)); }
  const days = Object.keys(dayHits).sort((a, b) => a - b).filter(d => dayHits[d].length >= 2).slice(0, 2);
  for (const d of days) { console.log('  -- sample s' + s0 + ' day ' + d + ' --'); for (const ln of dayHits[d]) console.log('     ' + ln); }
}
