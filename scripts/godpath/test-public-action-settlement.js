'use strict';
const K = require('./lib');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const phases = ['after-clock', 'commit-before', 'commit-after'];

function storage(initial = {}) {
  const blobs = new Map(Object.entries(initial));
  let armed = false, phase = '', writes = 0;
  const disk = () => console.log('ACTION_DISK ' + JSON.stringify(Object.fromEntries(blobs)));
  globalThis.localStorage = {
    get length() { return blobs.size; }, key: i => [...blobs.keys()][i] ?? null,
    getItem: key => blobs.get(key) ?? null, removeItem: key => blobs.delete(key),
    setItem(key, value) {
      const run = key.startsWith('scattering-save-v1-');
      if (armed && run && phase === 'commit-before') process.exit(77);
      blobs.set(key, String(value));
      if (armed && run) {
        writes++; disk();
        if (phase === 'commit-after') process.exit(77);
      }
    },
  };
  return { blobs, disk, arm(value) { phase = value; armed = true; }, count: () => writes };
}

async function act(phase) {
  const store = storage(), G = await K.load({ seed: 7002, narration: true });
  K.newRun(G);
  const scholar = G.state.scholar;
  G.map.px = 4; G.map.py = 4; G.location = 'haven';
  scholar.insideHaven = true; scholar.day = 2; scholar.dayTicks = 127;
  scholar.actionClock = 0; G.dayPart = 0;
  scholar.health = 100; scholar.kcal = 2400; scholar.hydration = 100;
  G.pendingEncounter = false; scholar.monster = null;
  const say = G.say;
  let nested = null;
  G.say = function (...args) {
    const value = say.apply(this, args);
    if (String(args[0]) === 'You wait. The light changes. Nothing asks anything of you.') {
      this.state.actionSettlementProbe = { afterClock: true };
      nested = this.save();
      if (phase === 'after-clock') process.exit(77);
      if (phase === 'throw-after-clock') throw Error('prepared post-clock action failure');
    }
    return value;
  };
  assert.equal(G.save(), true);
  const key = G.state.runKey, prior = store.blobs.get(key);
  store.disk(); store.arm(phase);
  if (phase === 'throw-after-clock') {
    assert.throws(() => G.doAction('wait'), /prepared post-clock action failure/);
    assert.equal(store.blobs.get(key), prior, 'whole failed action keeps prior bytes');
    assert.equal(G.save(), 'settlement_failed', 'partial action cannot autosave later');
  } else {
    G.doAction('wait');
    assert.equal(store.count(), 1, 'one complete action payload');
    const saved = JSON.parse(store.blobs.get(key));
    assert.equal(saved.scholar.dayTicks, 128);
    assert.equal(saved.run.dayPart, 1);
    assert.equal(saved.actionSettlementProbe.afterClock, true);
    assert(saved.run.log.some(line => (typeof line === 'string' ? line : line.text) ===
      'You wait. The light changes. Nothing asks anything of you.'), 'final words committed');
  }
  assert.equal(nested, 'deferred', 'post-clock request is not durable success');
  console.log('Public action settlement ' + phase + ' passed');
}

async function recover() {
  const input = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const store = storage(input.disk), G = await K.load({ seed: 7002, narration: true });
  const key = [...store.blobs.keys()].find(key => key.startsWith('scattering-save-v1-'));
  const raw = store.blobs.get(key), saved = JSON.parse(raw);
  assert.equal(G.load(key), true);
  assert.equal(store.blobs.get(key), raw, 'fresh Continue does not replay/rewrite');
  const completed = input.phase === 'commit-after';
  assert.equal(G.state.scholar.dayTicks, completed ? 128 : 127);
  assert.equal(G.dayPart, completed ? 1 : 0);
  assert.equal(!!G.state.actionSettlementProbe?.afterClock, completed);
  for (const field of ['health', 'kcal', 'energy', 'hydration']) {
    assert.equal(G.state.scholar[field], saved.scholar[field], field + ' restored once');
  }
  if (completed) assert(saved.run.log.some(line =>
    (typeof line === 'string' ? line : line.text) ===
    'You wait. The light changes. Nothing asks anything of you.'));
  console.log('Fresh action recovery ' + input.phase + ' passed');
}

(async () => {
  if (process.argv[2] === 'recover') return recover();
  if (process.argv[2]) return act(process.argv[2]);
  for (const phase of ['normal', 'throw-after-clock', ...phases]) {
    const child = spawnSync(process.execPath, [__filename, phase], {
      encoding: 'utf8', maxBuffer: 20e6, timeout: 120000,
    });
    assert.equal(child.status, phases.includes(phase) ? 77 : 0, child.stderr);
    if (phases.includes(phase)) {
      const snapshots = child.stdout.split('\n').filter(line => line.startsWith('ACTION_DISK '));
      assert(snapshots.length);
      const disk = JSON.parse(snapshots.at(-1).slice('ACTION_DISK '.length));
      const recovered = spawnSync(process.execPath, [__filename, 'recover'], {
        encoding: 'utf8', input: JSON.stringify({ phase, disk }), timeout: 120000,
      });
      assert.equal(recovered.status, 0, recovered.stderr);
      process.stdout.write(recovered.stdout);
    } else console.log('Public action settlement ' + phase + ' passed');
  }
  console.log('Public action settlement: 5 scenarios and 3 fresh recoveries passed');
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
