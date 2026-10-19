#!/usr/bin/env node
'use strict';
// Real boot/save/Continue with an advancing harness clock. Storage failures
// are injected at the adapter; Game and state persistence stay unmodified.
const assert = require('assert');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const seed = Number(process.env.SEED || 12);
const INDEX = 'scattering-saves-index';
let checks = 0;
function check(label, condition) { assert(condition, label); checks++; console.log('  ok ' + label); }
function payload(G) {
  return { bearer: G.villagerId, day: G.state.scholar.day,
    kcal: G.state.scholar.kcal, inventory: G.state.scholar.inventory,
    pantry: G.state.village.pantry, map: G.map };
}
async function scenario(kind) {
  const blobs = new Map(), writes = [];
  let failure = null;
  globalThis.localStorage = {
    get length() { return blobs.size; },
    key: i => [...blobs.keys()][i] ?? null,
    getItem: key => blobs.get(key) ?? null,
    removeItem: key => { blobs.delete(key); },
    setItem(key, value) {
      const reject = failure === 'index' ? key === INDEX :
        failure === 'data' && key.startsWith('scattering-save-');
      writes.push({ key, rejected: !!reject });
      if (reject) throw new Error('prepared ' + failure + ' write failure');
      blobs.set(key, String(value));
    },
  };
  const { Game: G, loadFails } = await loadGame({ seed, mode: 'save-index-crash-proof' });
  check('all production modules load', loadFails.length === 0);
  await setupGame(G);
  check('real generated expedition is live with a map and bearer', !G.over && !!G.map && !!G.villagerId);
  const t0 = Date.now(), t1 = Date.now();
  check('proof clock advances rather than masking the key race', t1 > t0);
  // An empty disk isolates the first write under test, retaining the real
  // expedition identity created by newGame/depart rather than fabricating it.
  blobs.clear(); writes.length = 0;
  const expected = JSON.stringify(payload(G));
  failure = kind === 'corrupt-index' ? null : kind;
  const result = G.save(), key = G.state.runKey;
  check('save pins a stable key using the real run identity', !!key && !!G.state.startedAt &&
    globalThis.Scattering.state.saveKey(G.state) === key);
  const firstWrites = writes.slice();
  if (kind === 'data') {
    check('rejected data write reports false', result === false);
    check('failed data write leaves no blob or index write', !blobs.has(key) &&
      firstWrites.some(w => w.key === key && w.rejected) && !firstWrites.some(w => w.key === INDEX));
    check('failed data write never offers a phantom Continue', G.listSaves().length === 0 && G.load(key) === false);
  } else {
    check('save result distinguishes index failure from healthy write', result === (kind === 'index' ? false : true));
    const raw = JSON.parse(blobs.get(key) || 'null');
    check('complete expedition blob exists despite index failure', raw && raw.runKey === key &&
      raw.scholar.day === G.state.scholar.day && raw.scholar.kcal === G.state.scholar.kcal &&
      JSON.stringify(raw.run.map) === JSON.stringify(G.map));
    if (kind === 'index') {
      check('data is written before the rejected index and disk has no index',
        firstWrites[0]?.key === key && !firstWrites[0].rejected &&
        firstWrites.some(w => w.key === INDEX && w.rejected) && !blobs.has(INDEX));
    } else {
      blobs.set(INDEX, '{prepared broken index');
    }
    const listing = G.listSaves();
    check('listing adopts the orphan immediately, even while index writes fail',
      listing.length === 1 && listing[0].key === key && listing[0].adopted === true);
    G.state = null; G.villagerId = null; G.map = null;
    check('real Continue loads the orphaned expedition', G.load(key) === true);
    check('Continue preserves bearer, day, food, inventory, pantry and map', JSON.stringify(payload(G)) === expected);
  }
  failure = null;
  check('a later healthy save succeeds', G.save() === true);
  check('recovery preserves one key and one listing', G.state.runKey === key &&
    [...blobs.keys()].filter(k => k.startsWith('scattering-save-')).length === 1 &&
    G.listSaves().length === 1 && G.listSaves()[0].key === key);
  check('healthy recovery writes a durable index entry', JSON.parse(blobs.get(INDEX)).some(row => row.key === key));
  console.log('SAVE_INDEX_RESULT ' + JSON.stringify({ seed, kind, checks, key, firstWrites }));
}
async function main() {
  if (process.env.SAVE_INDEX_CHILD) return scenario(process.env.SAVE_INDEX_CHILD);
  for (const kind of ['index', 'data', 'corrupt-index']) {
    const out = execFileSync(process.execPath, [__filename], { env: { ...process.env,
      SAVE_INDEX_CHILD: kind }, encoding: 'utf8', maxBuffer: 2e6 });
    process.stdout.write(out);
    const row = JSON.parse(out.split('\n').find(line => line.startsWith('SAVE_INDEX_RESULT ')).slice(18));
    checks += row.checks;
  }
  console.log('save-index crash proof green: ' + checks + ' checks');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
