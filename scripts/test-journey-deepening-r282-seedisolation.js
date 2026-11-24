// test-journey-deepening-r282-seedisolation.js -- Q6 proof (r282):
// per-seed state isolation via a fresh process per seed.
//
// Bar (r282 prereg Q6): on the new base, seed 109305 via the wrapper
// as the 5th invocation EQUALS the standalone draw -- the panel's own
// position-5 draw is the contaminated control. If the wrapper equals
// the standalone draw but differs from the panel draw, isolation is
// proven AND the r278 leak is confirmed on the new base. If the
// wrapper also equals the panel draw, the leak did not reproduce on
// this seed/base and the proof is weaker (reported honestly).
// Seed 109301 (1st in both configs) must match everywhere -- it is
// the position-stability control.
//
// Comparison is on normalized JSONs: the 'ms' runtime key is dropped
// and the EVIDIR path prefix is replaced, so scratch dirs do not
// count as differences. Transcript FILES are not compared; the per-seed
// JSON is the scored artifact.
//
// SLOW (~8 min: 5 wrapper invocations incl. probe + 2 standalone
// controls). Run manually; NOT in the check.js green list.
// Usage: node scripts/test-journey-deepening-r282-seedisolation.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PANEL_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-24');
const WRAP_DIR = '/tmp/r282-seediso-wrapper';
const CTL_DIR = '/tmp/r282-seediso-control';
const DRIVER = path.join(__dirname, 'journey-deepening-r282-20261124.js');
const WRAPPER = path.join(__dirname, 'journey-deepening-r282-seedisolation.js');

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' -- ' + extra : '')); }
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function normalize(x, prefixes) {
  if (typeof x === 'string') {
    let s = x;
    for (const p of prefixes) s = s.split(p).join('<EVIDIR>');
    return s;
  }
  if (Array.isArray(x)) return x.map(v => normalize(v, prefixes));
  if (x && typeof x === 'object') {
    const out = {};
    for (const k of Object.keys(x)) {
      if (k === 'ms') continue; // runtime only
      out[k] = normalize(x[k], prefixes);
    }
    return out;
  }
  return x;
}

function diffPaths(a, b, prefix, out) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (!(k in a)) out.push(prefix + k + ' (only B)');
      else if (!(k in b)) out.push(prefix + k + ' (only A)');
      else diffPaths(a[k], b[k], prefix + k + '.', out);
    }
  } else {
    out.push(prefix.slice(0, -1) + ': ' + JSON.stringify(a).slice(0, 80) + ' vs ' + JSON.stringify(b).slice(0, 80));
  }
}

function main() {
  cleanDir(WRAP_DIR);
  cleanDir(CTL_DIR);

  // 1. Wrapper: 109301-109305 in order (109305 is the 5th invocation),
  //    then the probe (6th). Each in a fresh process.
  console.log('seediso proof: wrapper run (109301-109305 + probe)...');
  execFileSync('node', [WRAPPER, '109301', '109302', '109303', '109304', '109305'],
    { env: Object.assign({}, process.env, { EVIDIR: WRAP_DIR }), encoding: 'utf8', timeout: 30 * 60 * 1000, stdio: 'inherit' });

  // 2. Standalone controls: each seed FIRST in its own process.
  for (const seed of [109305, 109301]) {
    console.log(`seediso proof: standalone control ${seed}...`);
    execFileSync('node', [DRIVER],
      { env: Object.assign({}, process.env, { POLICY: 'competent', SEEDS: String(seed), EVIDIR: CTL_DIR }), encoding: 'utf8', timeout: 30 * 60 * 1000, stdio: 'pipe' });
  }

  // 3. Compare normalized JSONs.
  const prefixes = [WRAP_DIR, CTL_DIR, PANEL_EVIDIR];
  for (const seed of [109305, 109301]) {
    const wrap = normalize(JSON.parse(fs.readFileSync(path.join(WRAP_DIR, `journey-deepening-r282-seed${seed}.json`), 'utf8')), prefixes);
    const ctl = normalize(JSON.parse(fs.readFileSync(path.join(CTL_DIR, `journey-deepening-r282-seed${seed}.json`), 'utf8')), prefixes);
    const panel = normalize(JSON.parse(fs.readFileSync(path.join(PANEL_EVIDIR, `journey-deepening-r282-seed${seed}.json`), 'utf8')), prefixes);
    const wvsc = [];
    diffPaths(wrap, ctl, '', wvsc);
    check(`seed ${seed}: wrapper == standalone control`, wvsc.length === 0, wvsc.slice(0, 5).join(' | '));
    const wvsp = [];
    diffPaths(wrap, panel, '', wvsp);
    if (seed === 109305) {
      // The leak verdict is descriptive, not the bar: report it.
      console.log(`  info seed 109305: wrapper vs panel draw: ${wvsp.length === 0 ? 'IDENTICAL (leak NOT reproduced on this seed/base)' : 'DIFFERS in ' + wvsp.length + ' paths (leak reproduced; first: ' + wvsp.slice(0, 3).join(' | ') + ')'}`);
    } else {
      check(`seed ${seed}: wrapper == panel draw (position-1 control)`, wvsp.length === 0, wvsp.slice(0, 5).join(' | '));
    }
  }

  console.log(`\nr282 seediso proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

if (require.main === module) main();
