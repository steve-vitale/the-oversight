// journey-deepening-r282-seedisolation.js -- Q6 (r282): per-seed state
// isolation wrapper for the deepening driver.
//
// FINDING (r278): a seed's outcome depends on its position in a
// one-process panel -- seed 109305 run standalone (first) LOST the
// village day 82 (scatter-hunger); run 5th in the panel it survived
// to day 101 (71 top-level JSON keys differ). Panels stay comparable
// at identical seed order/config, but cross-config seed comparisons
// are invalid until per-seed state is isolated.
//
// FIX (mechanism-agnostic): run the SAME driver once per seed in a
// FRESH node process, so no module-level state can leak across seeds.
// The wrapper changes no game code and no driver logic -- it only
// changes how the driver is invoked (one seed per process).
//
// Usage:
//   node scripts/journey-deepening-r282-seedisolation.js [seed ...]
//   (default seeds: the r282 panel band 109301-109308; the probe seed
//   109309 runs last, standalone, via the same wrapper path.)
// Env:
//   EVIDIR     -- evidence dir (default: the driver's own default)
//   RUN_PROBE  -- passed through to the driver (default '1'; the
//                wrapper sets '0' for panel seeds and runs the probe
//                as its own single-seed invocation)
//   POLICY     -- passed through (default 'competent')
// Requires the r282 driver's post-panel env hooks: EVIDIR and
// RUN_PROBE (added for Q6; defaults preserve the panel behavior).
// Exit 0 when every invocation exits 0; non-zero otherwise, with the
// failing seed printed. Each invocation's stdout is returned by runOne;
// main() prints the SEED ... DONE line per seed.
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');

const DRIVER = path.join(__dirname, 'journey-deepening-r282-20261124.js');
const DEFAULT_SEEDS = [109301, 109302, 109303, 109304, 109305, 109306, 109307, 109308];
const PROBE_SEED = parseInt(process.env.PROBE_SEED || '109309', 10);
const POLICY = process.env.POLICY || 'competent';
const EVIDIR = process.env.EVIDIR || '';

function runOne(seed) {
  const env = Object.assign({}, process.env, {
    POLICY,
    SEEDS: String(seed),
    PROBE_SEED: String(PROBE_SEED),
    RUN_PROBE: '0',
  });
  if (EVIDIR) env.EVIDIR = EVIDIR;
  const out = execFileSync('node', [DRIVER], { env, encoding: 'utf8', timeout: 30 * 60 * 1000 });
  return out;
}

function main() {
  const seeds = (process.argv.slice(2).map(s => parseInt(s, 10)).filter(n => !Number.isNaN(n)));
  const list = seeds.length ? seeds : DEFAULT_SEEDS;
  let fail = 0;
  for (const seed of list.concat([PROBE_SEED])) {
    const tag = seed === PROBE_SEED ? 'probe' : 'seed' + seed;
    console.log(`seediso: running ${tag} in a fresh process...`);
    try {
      const out = runOne(seed);
      const done = out.split('\n').find(l => l.indexOf('SEED ' + seed + ' DONE') !== -1);
      console.log(`seediso: ${tag} OK ${done ? done.split('->')[0].trim() : ''}`);
    } catch (e) {
      fail++;
      console.log(`seediso: ${tag} FAILED: ` + (e && e.message || e));
      if (e && e.stdout) console.log(String(e.stdout).slice(-2000));
      if (e && e.stderr) console.log(String(e.stderr).slice(-2000));
    }
  }
  console.log(fail ? `seediso: ${fail} invocation(s) FAILED` : 'seediso: all invocations OK');
  process.exit(fail ? 1 : 0);
}

if (require.main === module) main();
module.exports = { runOne, DEFAULT_SEEDS, PROBE_SEED };
