#!/usr/bin/env node
// analyze-hurttraveler-b.js — diag census + baseline/armed identity check.
// Usage:
//   node scripts/analyze-hurttraveler-b.js <corpus-dir>
//   node scripts/analyze-hurttraveler-b.js --compare <baseline-dir> <armed-dir>
// Corpus dir holds hurttraveler-b-competent-s*.json per-seed files.
'use strict';
const fs = require('fs');
const path = require('path');

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^hurttraveler-b-competent-s\d+\.json$/.test(f)) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function census(corpus, label) {
  const seeds = Object.keys(corpus).sort((a, b) => a - b);
  let lines = 0, cases = 0;
  const byPurpose = {}, byTiming = {}, byPartsLeft = {}, byHp = {};
  const samples = [];
  let survived = 0, national = 0, wins = 0, maxWave = 0;
  const deathCauses = {};
  const survivals = [];
  for (const s of seeds) {
    const p = corpus[s];
    if (/village|lost|dead|ended/i.test(p.endReason || '') || p.daysAlive >= 100) { /* watch only */ }
    survivals.push(p.daysAlive);
    if (p.daysAlive >= 100) survived++;
    if (p.national) national++;
    if (p.win) wins++;
    if (p.maxWave > maxWave) maxWave = p.maxWave;
    for (const c of Object.keys(p.deathCauses || {})) deathCauses[c] = (deathCauses[c] || 0) + p.deathCauses[c];
    for (const hl of p.hurtLines || []) {
      lines++;
      const sn = hl.snap;
      const purp = (sn.away && sn.away.purpose) || '(no-away-record)';
      byPurpose[purp] = (byPurpose[purp] || 0) + 1;
      byTiming[sn.hurtTiming || 'unknown'] = (byTiming[sn.hurtTiming || 'unknown'] || 0) + 1;
      const pl = sn.partsLeft == null ? 'null' : (sn.partsLeft <= 0 ? '<=0' : sn.partsLeft <= 4 ? '1-4' : sn.partsLeft <= 8 ? '5-8' : '9+');
      byPartsLeft[pl] = (byPartsLeft[pl] || 0) + 1;
      byHp[String(sn.hp)] = (byHp[String(sn.hp)] || 0) + 1;
      if (samples.length < 40) samples.push({ seed: p.seed, ...sn, line: hl.line });
      cases++;
    }
  }
  survivals.sort((a, b) => a - b);
  const med = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
  console.log(`== ${label}: seeds=${seeds.length} hurtLines=${lines} survived100d=${survived}/${seeds.length} national=${national} wins=${wins} maxWave=${maxWave} medianDaysAlive=${med}`);
  console.log('  byPurpose:', JSON.stringify(byPurpose));
  console.log('  byHurtTiming:', JSON.stringify(byTiming));
  console.log('  byPartsLeft:', JSON.stringify(byPartsLeft));
  console.log('  deathCauses:', JSON.stringify(deathCauses));
  return { lines, samples };
}
function stripLines(perSeed) {
  const c = JSON.parse(JSON.stringify(perSeed));
  for (const hl of c.hurtLines || []) delete hl.line;
  return c;
}
const args = process.argv.slice(2);
if (args[0] === '--compare') {
  const base = loadDir(args[1]), armed = loadDir(args[2]);
  census(base, 'BASELINE'); census(armed, 'ARMED');
  let identical = 0, differ = 0;
  for (const s of Object.keys(base).sort((a, b) => a - b)) {
    if (!armed[s]) { console.log(`seed ${s}: MISSING in armed`); differ++; continue; }
    const b = JSON.stringify(stripLines(base[s])), a = JSON.stringify(stripLines(armed[s]));
    if (b === a) { identical++; }
    else {
      differ++;
      console.log(`seed ${s}: TRAJECTORY DIFFERS (line-stripped)`);
      // first differing key, for diagnosis
      const bk = Object.keys(base[s]), ak = Object.keys(armed[s]);
      for (const k of new Set([...bk, ...ak])) {
        if (JSON.stringify(stripLines(base[s])[k]) !== JSON.stringify(stripLines(armed[s])[k])) console.log(`   key differs: ${k}`);
      }
    }
    const bl = (base[s].hurtLines || []).length, al = (armed[s].hurtLines || []).length;
    if (bl !== al) console.log(`seed ${s}: hurtLine count baseline=${bl} armed=${al}`);
  }
  console.log(`IDENTITY: identical=${identical} differ=${differ} (line text stripped; count diffs listed above)`);
  process.exit(differ ? 1 : 0);
} else {
  const corpus = loadDir(args[0]);
  const { samples } = census(corpus, args[0]);
  for (const s of samples) {
    console.log(`-- s${s.seed} d${s.day} ${s.name} hp=${s.hp} take=${s.take} want=${s.want} purpose=${(s.away && s.away.purpose) || '?'} partsLeft=${s.partsLeft} dist=${s.distFromHaven} timing=${s.hurtTiming} lastHurt=${s.lastHurt ? s.lastHurt.cause + ' d' + s.lastHurt.day + ' dmg' + s.lastHurt.dmg : 'none'} obj=${s.obj ? s.obj.kind + '/' + s.obj.state + ' pl' + s.obj.partsLeft : 'none'} exped=${s.exped ? 'legs' + s.exped.legs + ' ' + JSON.stringify(s.exped.encounters) : 'none'}`);
    console.log(`   "${s.line}"`);
  }
}
