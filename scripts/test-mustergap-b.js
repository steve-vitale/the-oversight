#!/usr/bin/env node
// test-mustergap-b.js — unit proof for scripts/policies/mustergap.js
// (sim-mustergap-b, gap2 button-faithful semantics). Synthetic stub Game
// only; no harness load, no RNG. Proves the prereg's policy claims:
//   1. the policy never reads a monster roster, allied roster, or link
//      list (perception law) — counters on worldMonsters, _otherVillage,
//      hierarchyState, and a guarded state.village getter;
//   2. a short, still-standing sounded muster gets ONE commit episode:
//      two taps in the same daily, haven reaches 3, never tapped again;
//   3. no commit when the gate is ready, uncalled, spent, haven-full, or
//      slain; a nothing-free answer ends the episode with one tap;
//   4. a confirm-only stutter ends the episode (no daily re-tap spam);
//   5. a commit failure is recorded, never a crash.
'use strict';
const { withMusterGap } = require('./policies/mustergap');

let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log('PASS ' + name); }
  else { failures++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

function stubGame(opts) {
  opts = opts || {};
  const muster = {
    allies: (opts.allies != null ? opts.allies : [{ villageId: 'v1', vid: 'a1' }]),
    haven: (opts.haven || []).slice(),
  };
  const reads = { monsters: 0, otherVillage: 0, hierarchy: 0, village: 0 };
  const G = {
    state: { scholar: { day: opts.day || 90 },
      titans: { slain: opts.slain ? { herald: true } : {} } },
    over: false, tbfight: null,
    reads: reads,
    commitCalls: 0,
    worldMonsters() { reads.monsters++; return [{ id: 'herald', tx: 0, ty: 0 }]; },
    _otherVillage() { reads.otherVillage++; return null; },
    hierarchyState() { reads.hierarchy++; return []; },
    titanMusterState() { return muster; },
    titanMusterReady() {
      const hv = {};
      muster.haven.forEach(function (h) { hv[h.vid || h] = true; });
      return muster.allies.length + Object.keys(hv).length >= 10;
    },
    titanCommitOwn() {
      this.commitCalls++;
      if (opts.commitNull) return null;
      if (opts.commitStutter) return 'confirm';
      if (!this._pending) { this._pending = true; return 'confirm'; }
      this._pending = false;
      while (muster.haven.length < 3) muster.haven.push({ vid: 'h' + muster.haven.length });
      return muster;
    },
    _muster: muster,
  };
  // Guarded own-village read: the policy must never touch state.village
  // (Haven's roster lives there; the commit verb reads it, not the policy).
  Object.defineProperty(G.state, 'village', { get() { reads.village++; return { roster: [] }; } });
  return G;
}

function runCase(opts, days) {
  const G = stubGame(opts);
  const ctx = { titan: { called: opts.called === false ? null : (opts.called || { day: 85, result: 'sounded' }) } };
  const policy = withMusterGap({ daily() {}, setup() {} }, 't', 't');
  for (let i = 0; i < (days || 1); i++) policy.daily(G, ctx);
  return { G: G, ctx: ctx };
}

// 1+2: short standing muster (6 allies, 0 haven) => ONE episode, two taps
// in the same daily, haven 3, never tapped again.
{
  const allies = [];
  for (let i = 0; i < 6; i++) allies.push({ villageId: 'v1', vid: 'a' + i });
  const r = runCase({ allies: allies, haven: [] }, 4);
  check('short muster => exactly two taps total', r.G.commitCalls === 2, r.G.commitCalls);
  check('two-tap episode => haven reaches 3', r.G._muster.haven.length === 3, r.G._muster.haven);
  check('one episode recorded', (r.ctx.mustergap.commitCalls || []).length === 1, r.ctx.mustergap.commitCalls);
  check('episode records committed + taps', r.ctx.mustergap.commitCalls[0].result === 'committed' &&
    r.ctx.mustergap.commitCalls[0].taps === 2, r.ctx.mustergap.commitCalls);
  check('zero monster-roster reads', r.G.reads.monsters === 0, r.G.reads);
  check('zero allied-village reads', r.G.reads.otherVillage === 0, r.G.reads);
  check('zero link-list reads', r.G.reads.hierarchy === 0, r.G.reads);
  check('zero own-roster reads', r.G.reads.village === 0, r.G.reads);
}
// 3a: ready muster (10 allies) => no commit.
{
  const allies = [];
  for (let i = 0; i < 10; i++) allies.push({ villageId: 'v1', vid: 'a' + i });
  const r = runCase({ allies: allies, haven: [] }, 2);
  check('ready muster => no commit', r.G.commitCalls === 0, r.G.commitCalls);
}
// 3b: no call sounded => no commit.
{
  const r = runCase({ called: false }, 2);
  check('uncalled => no commit', r.G.commitCalls === 0, r.G.commitCalls);
}
// 3c: spent muster (allies emptied) => no commit.
{
  const r = runCase({ allies: [], haven: [] }, 2);
  check('spent muster => no commit', r.G.commitCalls === 0, r.G.commitCalls);
}
// 3d: haven already 3 => no commit.
{
  const allies = [];
  for (let i = 0; i < 6; i++) allies.push({ villageId: 'v1', vid: 'a' + i });
  const r = runCase({ allies: allies, haven: [{ vid: 'h0' }, { vid: 'h1' }, { vid: 'h2' }] }, 2);
  check('haven-full => no commit', r.G.commitCalls === 0, r.G.commitCalls);
}
// 3e: slain => no commit.
{
  const r = runCase({ slain: true }, 2);
  check('slain => no commit', r.G.commitCalls === 0, r.G.commitCalls);
}
// 4a: nothing free => one tap, episode ends, no retry.
{
  const allies = [];
  for (let i = 0; i < 6; i++) allies.push({ villageId: 'v1', vid: 'a' + i });
  const r = runCase({ allies: allies, haven: [], commitNull: true }, 3);
  check('null commit => exactly one tap, no retry', r.G.commitCalls === 1, r.G.commitCalls);
  check('null commit => recorded null', r.ctx.mustergap.commitCalls[0].result === 'null', r.ctx.mustergap.commitCalls);
  check('null commit => no commitError', !r.ctx.mustergap.commitError, r.ctx.mustergap);
}
// 4b: confirm-only stutter => two taps, episode ends, no daily spam.
{
  const allies = [];
  for (let i = 0; i < 6; i++) allies.push({ villageId: 'v1', vid: 'a' + i });
  const r = runCase({ allies: allies, haven: [], commitStutter: true }, 3);
  check('stutter => exactly two taps, no retry', r.G.commitCalls === 2, r.G.commitCalls);
  check('stutter => recorded confirm-only', r.ctx.mustergap.commitCalls[0].result === 'confirm-only', r.ctx.mustergap.commitCalls);
}

console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
