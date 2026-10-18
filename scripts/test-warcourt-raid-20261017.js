#!/usr/bin/env node
// scripts/test-warcourt-raid-20261017.js — proof for the warcourt policy
// (journey scale r4 2026-10-17): the conquest road's verbs must fire through
// the real engine on a real game.
//
// RED (pre-policy): competent never calls raidVillage — raidsMustered is 0,
// no conquered links ever form.
// GREEN (post-policy): warcourt with WARCOURT_RAID=1 musters at least one
// raid by day 60 on a live seed, resolves the muster (terms yield, strike,
// or honest withdraw), and the Iron Court answers through the env gate.
//
// Usage: WARCOURT_RAID=1 node scripts/test-warcourt-raid-20261017.js
'use strict';
const assert = require('assert');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { warcourt, ironAnswer } = require('./policies/warcourt');
const { competent } = require('./policies/competent');

async function main() {
  // 1. Gate-off warcourt carries competent's shape (no raid layer without the env).
  assert.strictEqual(typeof warcourt.daily, 'function', 'warcourt.daily exists');
  assert.strictEqual(warcourt.id, 'warcourt');
  // 2. ironAnswer env parsing.
  delete process.env.IRONCOURT_ANSWER;
  assert.strictEqual(ironAnswer(), 'mercy', 'default mercy');
  process.env.IRONCOURT_ANSWER = 'yoke';
  assert.strictEqual(ironAnswer(), 'yoke', 'env yoke');
  process.env.IRONCOURT_ANSWER = 'bogus';
  assert.strictEqual(ironAnswer(), 'mercy', 'bogus falls back to mercy');
  delete process.env.IRONCOURT_ANSWER;

  // 3. Live raid flow on a real game: 60 days, raid layer on.
  process.env.WARCOURT_RAID = '1';
  const { Game } = await loadGame({ seed: 8601, mode: 'test-warcourt-raid' });
  // silence say like the journey harness does
  const _say = Game.say;
  const said = [];
  Game.say = function (...a) { said.push(String(a[0])); return _say.apply(this, a); };
  await setupGame(Game);
  const policy = Object.create(warcourt);
  policy.id = 'test-warcourt';
  let hctx = null;
  policy.setup = function (G, c) { hctx = c; competent.setup(G, c); c.raidProbe = true; };
  policy.upkeep = function (G, c) { competent.upkeep(G, c); };
  policy.daily = function (G, c) { warcourt.daily(G, c); };
  policy.fight = function () { return false; };
  policy.contest = function () { return false; };
  const result = await runDays(Game, policy, { days: 60, manifest: { seed: 8601, mode: 'test-warcourt-raid' } });
  const ctx = hctx || {};
  console.log('days:', result.gameDays, 'end:', result.endReason,
    'raidsMustered:', ctx.raidsMustered || 0,
    'yielded:', ctx.raidsYielded || 0, 'struck:', ctx.raidsStruck || 0, 'withdrawn:', ctx.raidsWithdrawn || 0,
    'musterFails:', ctx.raidMusterFails || 0);
  assert.ok((ctx.raidsMustered || 0) >= 1, 'warcourt musters at least one raid by day 60 (RED would be 0)');
  assert.strictEqual(Game.state.pendingRaid || null, null, 'no muster left unanswered');
  const links = (Game.hierarchyState() || []).filter(l => l && l.status === 'active' && l.primary === 'haven');
  const conquered = links.filter(l => l.conquered);
  console.log('haven-primary links:', links.length, 'conquered:', conquered.length);
  assert.ok(conquered.length >= 1, 'at least one conquered link formed');
  for (const l of conquered) {
    // formation is recorded in link.history; weekly drift (accord gift +10,
    // tribute +1/wk) legitimately moves trust after — assert the FORMATION.
    const form = (l.history || []).find(h => h.kind === 'conquered');
    assert.ok(form, 'conquered link carries its formation note');
    console.log('formation note:', form.note);
    assert.ok(/5,000 kcal\/week under duress/.test(form.note) || /7,000 kcal\/week under duress/.test(form.note),
      'formation note names the duress tribute: ' + form.note);
    assert.ok((l.trust || 0) > 0 && (l.trust || 0) <= 100, 'trust in sane range, got ' + l.trust);
  }
  // the raid copy must be said aloud (no silent actions)
  const raidLines = said.filter(s => /war party musters|burns, and then it kneels|chooses the tribute over the pyre|stands down/.test(s));
  assert.ok(raidLines.length >= 1, 'raid beats are narrated, got ' + raidLines.length);
  console.log('sample raid line:', raidLines[0].slice(0, 160));
  // 4. Iron Court answer path through the env gate (unit-level on the engine).
  process.env.IRONCOURT_ANSWER = 'mercy';
  assert.strictEqual(ironAnswer(), 'mercy');
  console.log('GREEN: warcourt raids, resolves, and narrates through the real engine.');
}

main().catch(e => { console.error('RED:', e && e.message); process.exit(1); });
