#!/usr/bin/env node
// test-favor-debt-help-coherence-20261108.js — dialog audit defect #1.
// Help on an unfinished favor/debt resume must not contradict the opener.
//
// Repros (dialog-coherence-audit.md):
//   1) seed-7 Nolan shape: debt resume + thanked ledger favor + live need →
//      Help said "It's already handled" while the opener claimed unfinished debt.
//   2) seed-99 Nora shape: missed-promise outing opener → Help dried to
//      "lost my train of thought" / closed with "we're square".
//
// GREEN: Help restates coherent unfinished engagement (or honest deferred ask);
//   never "already handled", never dry train-of-thought, never "we're square"
//   while cargo/promise is still unfinished.
// RED (pre-fix): Nolan → already handled; Nora → square/dry.
'use strict';
process.env.TRIBFLOOR = '1';
const path = require('path');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

const BAD = /already handled|lost my train of thought|we're square|we\'re square/i;
const safe = (fn, d) => { try { return fn(); } catch (e) { console.error(e && e.stack); return d; } };

async function nolanShape() {
  const { Game } = await loadGame({ seed: 7, mode: 'favor-debt-help-nolan' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) throw new Error('no villager');
  const v = Game.state.village;
  v.trust = v.trust || {}; v.trust[vid] = 40;
  // Thanked ledger favor — repay will not select; ask_favor can still win.
  v.favorLedger = v.favorLedger || {};
  v.favorLedger[vid] = {
    id: 'f-old-heal', vid, kind: 'heal_help', short: 'that wound care',
    state: 'thanked', deadline: 999, task: 'wound care',
  };
  v.health = v.health || {}; v.health[vid] = 50;
  // Snippet must pass convoSnippetIsRealBeat (PR #10 rejects stage-direction
  // narration like "A tired smile." and convoThreadOpen refuses the plant).
  Game.convoThreadOpen(vid, 'want', 'that debt', 'walked away mid-thread',
    'I still owe you for that promise we left hanging.');
  if (!(Game.convoOpenThreads(vid) || []).some(o => o.tid === 'want')) {
    throw new Error('Nolan open thread failed to plant');
  }
  const orig = Math.random;
  Math.random = () => 0.1; // force resume
  const opened = Game.startConvo(vid);
  Math.random = orig;
  const c = Game.convoGet(vid);
  const opener = opened && opened.line ? String(opened.line) : '';
  if (!/that debt|never finished/i.test(opener)) {
    throw new Error('Nolan opener did not claim unfinished debt: ' + opener);
  }
  if (!(c.want && c.want.id === 'ask_favor')) {
    throw new Error('Nolan shape needs ask_favor want, got ' + (c.want && c.want.id));
  }
  const r = safe(() => Game.convoTurn(vid, 'dlg:help'), null);
  const line = r && r.line ? String(r.line) : '';
  Game.endConvo(vid, 'left');
  return { opener, line, wantId: c.want && c.want.id };
}

async function noraShape() {
  const { Game } = await loadGame({ seed: 99, mode: 'favor-debt-help-nora' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) throw new Error('no villager');
  const v = Game.state.village, s = Game.state.scholar;
  v.trust = v.trust || {}; v.trust[vid] = 40;
  const home = { x: v.px ?? 4, y: v.py ?? 4 };
  Game.map.px = home.x; Game.map.py = home.y;
  s.mx = 4; s.my = 4; s.insideHaven = false;
  v.nodePos = v.nodePos || {}; v.nodePos[vid] = { nx: home.x, ny: home.y };
  v.positions = v.positions || {}; v.positions[vid] = { mx: 4, my: 4 };
  v.npcInside = v.npcInside || {}; v.npcInside[vid] = false;
  if (v.away) delete v.away[vid];
  const favor = Game.convoBuildFavor(vid, { kind: 'forage_help', urgency: 2, kcal: 0 });
  favor.state = 'broken';
  favor.forageRun = {
    bearer: Game.villagerId, startedDay: s.day,
    playerHaul: [{ name: 'greens', kcalEach: 100, units: 2 }],
    partnerHaul: [{ name: 'greens', kcalEach: 100, units: 2 }],
    returned: false, talked: false,
  };
  Game.convoStoreFavor(favor);
  v.promises = v.promises || {};
  v.promises[vid] = {
    day: s.day - 2, favorId: favor.id, favorTask: favor.task,
    maker: Game.villagerId, kept: 'broken', favorDeadline: s.day + 2,
  };
  // Poison run ledger with the old false engageBeat so a regression that
  // returns "we're square" dries into train-of-thought (Nora's audit hit).
  const square = '"Good. Then we\'re square." They look lighter for it.';
  const key = Game.convoSplitBeats(square)[0].trim();
  Game.convoRunLedger().push(key);

  const opened = Game.startConvo(vid);
  const opener = opened && opened.line ? String(opened.line) : '';
  if (!/missed the promise|still need to get home/i.test(opener)) {
    throw new Error('Nora opener did not claim unfinished outing: ' + opener);
  }
  const r = safe(() => Game.convoTurn(vid, 'dlg:help'), null);
  const line = r && r.line ? String(r.line) : '';
  Game.endConvo(vid, 'left');
  return { opener, line };
}

async function main() {
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  // Separate processes would be ideal; sim-harness forbids two loads in one
  // process. Spawn children so both seeded shapes run cleanly.
  const { spawnSync } = require('child_process');
  const self = __filename;
  if (!process.argv.includes('--child')) {
    for (const shape of ['nolan', 'nora']) {
      const r = spawnSync(process.execPath, [self, '--child', shape], {
        encoding: 'utf8', env: process.env,
      });
      process.stdout.write(r.stdout || '');
      process.stderr.write(r.stderr || '');
      if (r.status !== 0) fails++;
    }
    // Keep the r35 settled spend-out honest: pinned settled favor still
    // answers "already handled" and spends the choice.
    const settled = spawnSync(process.execPath, [
      path.join(__dirname, 'test-social-r35-helpspendout-20261020.js'),
    ], { encoding: 'utf8', env: process.env });
    process.stdout.write(settled.stdout || '');
    process.stderr.write(settled.stderr || '');
    if (settled.status !== 0) {
      fail('r35 settled help spend-out regressed');
    }
    console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — favor/debt Help matches unfinished openers');
    process.exit(fails ? 1 : 0);
  }

  const shape = process.argv[process.argv.indexOf('--child') + 1];
  if (shape === 'nolan') {
    const { opener, line } = await nolanShape();
    console.log('Nolan opener:', opener);
    console.log('Nolan Help:', line);
    if (!line) fail('Nolan Help produced no line');
    if (BAD.test(line)) fail('Nolan Help contradicts unfinished debt opener: ' + line);
    if (!/(need|help|hand|favor|wound|care|ask)/i.test(line)) {
      fail('Nolan Help did not engage a concrete ask: ' + line);
    }
  } else if (shape === 'nora') {
    const { opener, line } = await noraShape();
    console.log('Nora opener:', opener);
    console.log('Nora Help:', line);
    if (!line) fail('Nora Help produced no line');
    if (BAD.test(line)) fail('Nora Help contradicts unfinished outing opener: ' + line);
    if (!/(home|unload|haul|pack|outing|finish)/i.test(line)) {
      fail('Nora Help did not restate unfinished outing work: ' + line);
    }
  } else {
    fail('unknown child shape ' + shape);
  }
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
