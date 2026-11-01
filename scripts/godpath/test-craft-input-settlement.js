'use strict';
const assert = require('assert/strict'), fs = require('fs'), cp = require('child_process');
const K = require('./lib'), mode = process.argv[2], copy = x => JSON.parse(JSON.stringify(x));
async function child() {
  const disk = new Map(); let armed = false, writes = 0;
  const emit = () => fs.writeSync(1, 'CRAFT_DISK ' + JSON.stringify(Object.fromEntries(disk)) + '\n');
  globalThis.localStorage = { get length() { return disk.size; }, key: i => [...disk.keys()][i] ?? null,
    getItem: k => disk.get(k) ?? null, removeItem: k => disk.delete(k), setItem(k, v) {
      const run = k.startsWith('scattering-save-v1-');
      if (armed && run && mode === 'commit-before') process.exit(77);
      if (armed && run && mode === 'quota') throw Error('prepared quota');
      disk.set(k, String(v)); if (armed && run) { writes++; emit(); if (mode === 'commit-after') process.exit(77); }
    } };
  const read = fs.readFileSync;
  if (mode === 'removed') fs.readFileSync = function (file, ...args) {
    let text = read.call(this, file, ...args);
    if (String(file).replace(/\\/g, '/').endsWith('/src/js/timeSettlement.js')) {
      const before = String(text), after = before.replace("'examineCell','craft','tickAction'", "'examineCell','tickAction'");
      assert.notEqual(after, before); text = typeof text === 'string' ? after : Buffer.from(after);
    } return text;
  };
  let G; try { G = await K.load({ seed: 7 }); } finally { fs.readFileSync = read; }
  if (mode === 'recover') {
    const input = JSON.parse(fs.readFileSync(0, 'utf8'));
    for (const [k, v] of Object.entries(input.disk)) disk.set(k, v);
    const key = [...disk.keys()].find(k => k.startsWith('scattering-save-v1-')), raw = disk.get(key), saved = JSON.parse(raw);
    assert(G.load(key)); assert.equal(disk.get(key), raw);
    assert.deepEqual(copy(G.state.scholar), saved.scholar); assert.deepEqual(copy(G.state.codex), saved.codex);
    assert.equal(G.state.scholar.inventory.some(i => i.itemId === 'stone_knife'), input.phase === 'commit-after'); return;
  }
  K.newRun(G); const s = G.state.scholar;
  Object.assign(s, { day: 2, dayTicks: 0, actionClock: 0, kcal: 2400, health: 100, hydration: 100,
    inventory: [{ material: 'stone', units: 1 }, { material: 'vine', units: 1 }] });
  G.dayPart = 0; G.worldMonsters().length = 0; G.pendingEncounter = null;
  // Initialize the same lazy progression/synergy records Continue expects;
  // recovery comparisons below retain the entire scholar, without exclusions.
  G.progState(); G.recomputeActiveSynergies();
  if (mode === 'failure') G.state.codex.recipes.stone_knife = { level: 1 };
  if (mode === 'refused') s.inventory = [];
  const attempt = G.attemptRecipeCraft;
  G.attemptRecipeCraft = function (plan, chance) { return attempt.call(this, plan, chance, () => mode === 'failure' ? 1 : 0); };
  // A caller tail after the inner clock is exactly what the outer boundary
  // must retain. It is never an extra public action or an invented save.
  const tick = G.tickAction;
  G.tickAction = function (...args) {
    const result = tick.apply(this, args); this.state.craftSettlementTail = true;
    if (mode === 'nested') assert.equal(this.save(), 'deferred');
    if (mode === 'after-tail') process.exit(77);
    if (mode === 'throw-tail') throw Error('prepared craft tail failure'); return result;
  };
  assert.equal(G.save(), true); const key = G.state.runKey, prior = disk.get(key); emit(); armed = true;
  if (mode === 'throw-tail') {
    assert.throws(() => G.craft('stone_knife'), /prepared craft tail failure/);
    assert.equal(disk.get(key), prior); assert.equal(G.save(), 'settlement_failed'); return;
  }
  const result = G.craft('stone_knife');
  if (mode === 'refused') { assert.equal(result, null); assert.equal(writes, 0); assert.equal(s.dayTicks, 0); assert.equal(disk.get(key), prior); return; }
  assert.equal(s.dayTicks, 32, 'success and failure pay actual crafting time');
  assert(!s.inventory.some(i => i.material), 'actual recipe inputs consumed');
  assert.equal(s.inventory.some(i => i.itemId === 'stone_knife'), mode !== 'failure');
  if (mode === 'quota') { assert.equal(disk.get(key), prior); return; }
  const saved = JSON.parse(disk.get(key));
  assert.equal(saved.craftSettlementTail, true, 'whole craft tail must be durably committed');
  assert.deepEqual(saved.scholar, copy(s)); assert.deepEqual(saved.codex, copy(G.state.codex));
  assert.equal(writes, 1, 'one whole public craft checkpoint');
}
(async () => {
  if (mode) return child();
  const run = (phase, input) => cp.spawnSync(process.execPath, [__filename, phase], { input, encoding: 'utf8', windowsHide: true, maxBuffer: 30e6, timeout: 60000 });
  let count = 0, cold = 0;
  for (const phase of ['success', 'failure', 'refused', 'nested', 'throw-tail', 'quota', 'after-tail', 'commit-before', 'commit-after']) {
    const r = run(phase), crash = ['after-tail', 'commit-before', 'commit-after'].includes(phase);
    assert.equal(r.status, crash ? 77 : 0, phase + ': ' + (r.stderr || r.stdout.slice(-2500))); count++;
    if (crash) {
      const row = r.stdout.split('\n').filter(l => l.startsWith('CRAFT_DISK ')).at(-1); assert(row);
      const recovery = run('recover', JSON.stringify({ phase, disk: JSON.parse(row.slice(11)) }));
      assert.equal(recovery.status, 0, recovery.stderr); cold++;
    }
  }
  const removed = run('removed'); assert.notEqual(removed.status, 0);
  assert.match(removed.stderr, /whole craft tail must be durably committed/);
  console.log('Craft input settlement: ' + count + ' scenarios, ' + cold + ' fresh-process recoveries and actual removed boundary rejected');
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
