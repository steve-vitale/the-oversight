'use strict';
// test-havenneedgossip-20261016.js — proof for the havenNeedGossip "A"-listener fix.
//
// The 2026-10-16 sim-villagevoice finding: havenNeedGossip rendered
// `String(this.displayName(listener)).split(' ')[0]`; for a name-unknown
// listener the descriptor "A woman, maybe 40s, with a shaved head" splits
// to "A" → beats like "🗣️ Ashley to A, by the fire: 'Stone. We need 59…'".

// The fix (src/js/havenGrowth.js): a local write-free render — name-known /
// post-System → first name; unknown → the FULL descriptor, unsplit
// (knowledge-gating: what the player would actually perceive), with the
// descriptor's leading "A" lowercased in the mid-sentence listener slot
// ("Ashley to a woman, maybe 40s, with a shaved head, by the fire").
//
// Design detour, documented: Game.firstRef was tried first (it's the
// codebase's documented answer to this line pattern), but its whoTag path
// calls journalPerson — which CREATES state.codex.people stubs. A render
// writing state broke the display-only det-gate (paired state hashes
// diverged). personDescriptor is render-pure, so the local render keeps
// trajectories byte-identical.
//
// Part A (unit): RED pins the old formula producing "A"; asserts the fixed
//   source no longer splits a displayName; asserts havenNeedGossip creates
//   NO new state.codex.people entries (the firstRef side-effect guard).
// Part B (e2e): drive havenNeedGossip on a scratch game with two unknown
//   villagers; capture the say beat; assert it fired and both parties read
//   as people (SENSE-TESTING LAW: read the beat).
// Exit non-zero on any failure.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const LISTENER_TRUNC = / to A, by the fire/; // "… to A, by the fire"
const SPEAKER_TRUNC = /🗣️ A to /;           // "🗣️ A to <name>" — same defect, speaker side

async function main() {
  // ---- Part A1: RED pin — the old formula produces "A" ----
  {
    const { Game } = await loadGame({ seed: 118, mode: 'havenneedgossip-unitA' });
    await setupGame(Game);
    assert.strictEqual(typeof Game.havenNeedGossip, 'function', 'havenNeedGossip must exist');
    const roster = (Game.state.village.roster || []).filter((id) => id !== Game.villagerId);
    const unk = roster.filter((id) => { try { return !Game.nameKnown(id); } catch (e) { return false; } });
    assert.ok(unk.length >= 2, 'need ≥2 name-unknown villagers pre-System');
    assert.ok(!Game.state.systemArrived, 'test runs pre-System');
    const vid = unk[0];
    const oldRender = String(Game.displayName(vid)).split(' ')[0];
    assert.strictEqual(oldRender, 'A',
      `RED pin: old formula must produce "A" (got ${JSON.stringify(oldRender)})`);
    console.log(`RED pinned: displayName=${JSON.stringify(Game.displayName(vid))} -> old formula "A"`);
  }

  // ---- Part A2: the fixed source must not split a displayName ----
  {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'havenGrowth.js'), 'utf8');
    assert.ok(!src.includes("displayName(speaker)).split(' ')[0]"),
      'fixed source must not split speaker displayName');
    assert.ok(!src.includes("displayName(listener)).split(' ')[0]"),
      'fixed source must not split listener displayName');
    console.log('source check: no displayName split in havenGrowth.js');
  }

  // ---- Part A3: havenNeedGossip must not write state (no journalPerson stubs) ----
  {
    const { Game } = await loadGame({ seed: 148, mode: 'havenneedgossip-unitC' });
    await setupGame(Game);
    const roster = (Game.state.village.roster || []).filter((id) => id !== Game.villagerId);
    const unk = roster.filter((id) => { try { return !Game.nameKnown(id); } catch (e) { return false; } });
    const realRoster = Game.state.village.roster;
    Game.state.village.roster = [unk[0], unk[1]];
    const before = new Set(Object.keys(((Game.state.codex || {}).people) || {}));
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) { return origSay(msg); };
    try {
      await quietLog(async () => {
        for (let i = 0; i < 3; i++) {
          Game.havenNeedGossip({ name: 'Longhouse', bars: [{ key: 'stone', have: 10 + i, req: 69, done: false }] });
        }
      });
    } finally {
      Game.say = origSay;
      Game.state.village.roster = realRoster;
    }
    const after = Object.keys(((Game.state.codex || {}).people) || {}).filter((k) => !before.has(k));
    assert.strictEqual(after.length, 0,
      `render must not create journal stubs (new codex.people keys: ${JSON.stringify(after)}) — this is what killed the firstRef attempt`);
    console.log('state-write guard: havenNeedGossip created 0 new codex.people entries');
  }

  // ---- Part B: end-to-end — drive the real function, read the beat ----
  {
    const { Game } = await loadGame({ seed: 138, mode: 'havenneedgossip-unitB' });
    await setupGame(Game);
    const roster = (Game.state.village.roster || []).filter((id) => id !== Game.villagerId);
    const unk = roster.filter((id) => { try { return !Game.nameKnown(id); } catch (e) { return false; } });
    assert.ok(unk.length >= 2, 'need ≥2 unknown villagers for the e2e');

    const realRoster = Game.state.village.roster;
    Game.state.village.roster = [unk[0], unk[1]]; // force: every draw is unknown
    const beats = [];
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) { try { beats.push(String(msg)); } catch (e) {} return origSay(msg); };
    try {
      await quietLog(async () => {
        Game.havenNeedGossip({ name: 'Longhouse', bars: [{ key: 'stone', have: 10, req: 69, done: false }] });
      });
    } finally {
      Game.say = origSay;
      Game.state.village.roster = realRoster;
    }
    const gossip = beats.filter((t) => t.includes('🗣️') && t.includes('by the fire'));
    assert.ok(gossip.length >= 1, 'GUARDRAIL: the gossip beat must still fire (no beats lost)');
    const beat = gossip[0];
    console.log('SENSE-READ fixed beat:', beat);
    assert.ok(!LISTENER_TRUNC.test(beat), `listener must not truncate to "A": ${beat}`);
    assert.ok(!SPEAKER_TRUNC.test(beat), `speaker must not truncate to "A": ${beat}`);
    // Both parties read as people: either a first name or a descriptor.
    assert.ok(/🗣️ (A (woman|man|person),|[A-Z][a-z]+) /.test(beat),
      `speaker must read as a person, got: ${beat}`);
    assert.ok(/ to (a [a-z]|[A-Z][a-z]+)/.test(beat),
      `listener must read as a person (descriptor or first name), got: ${beat}`);
    assert.ok(/Stone\. We need 59 more/.test(beat), `beat content must be intact, got: ${beat}`);

    // Known-side beat for contrast: post-System it first-names.
    Game.state.systemArrived = true;
    Game.state.village.roster = [unk[0], unk[1]];
    const beats2 = [];
    const origSay2 = Game.say.bind(Game);
    Game.say = function (msg) { try { beats2.push(String(msg)); } catch (e) {} return origSay2(msg); };
    try {
      await quietLog(async () => {
        Game.havenNeedGossip({ name: 'Longhouse', bars: [{ key: 'stone', have: 11, req: 69, done: false }] });
      });
    } finally {
      Game.say = origSay2;
      Game.state.village.roster = realRoster;
      Game.state.systemArrived = false;
    }
    const gossip2 = beats2.filter((t) => t.includes('🗣️') && t.includes('by the fire'));
    assert.ok(gossip2.length >= 1, 'known-side beat must fire too');
    console.log('SENSE-READ known beat:  ', gossip2[0]);
    assert.ok(!LISTENER_TRUNC.test(gossip2[0]) && !SPEAKER_TRUNC.test(gossip2[0]),
      'known-side beat must not truncate either');
  }

  // ---- Part A4: pin WHY havenGrowth must not use firstRef here ----
  // firstRef -> whoTag -> journalPerson CREATES a state.codex.people stub
  // for the villager ("get (or create)"). A render writing state is what
  // the det-gate forbids in a hot daily path — hence the local write-free
  // render in havenNeedGossip. If whoTag ever becomes side-effect-free,
  // update this pin (and the fix could switch back to firstRef).
  {
    const { Game } = await loadGame({ seed: 158, mode: 'havenneedgossip-unitD' });
    await setupGame(Game);
    const roster = (Game.state.village.roster || []).filter((id) => id !== Game.villagerId);
    const unk = roster.filter((id) => { try { return !Game.nameKnown(id); } catch (e) { return false; } });
    const vid = unk[0];
    const before = new Set(Object.keys(((Game.state.codex || {}).people) || {}));
    assert.ok(!before.has(vid), 'precondition: no journal entry yet for the unknown villager');
    Game.firstRef(vid);
    const created = Object.keys(((Game.state.codex || {}).people) || {}).filter((k) => !before.has(k));
    assert.ok(created.length > 0,
      'pin: firstRef must currently create a codex.people stub (this is why havenNeedGossip uses its own render)');
    console.log(`design-detour pinned: firstRef created stub(s) ${JSON.stringify(created)}`);
  }

  console.log('test-havenneedgossip-20261016: ALL GREEN');
}

main().then(() => process.exit(0)).catch((e) => { console.error('FAIL:', e && e.message); process.exit(1); });
