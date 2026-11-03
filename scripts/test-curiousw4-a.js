#!/usr/bin/env node
// test-curiousw4-a.js — proof for scripts/policies/curiousw4.js.
// Leg 1: forbidden roster/position API tokens absent from the policy
// file, including comments. Leg 2: stub-Game determinism — an enabled
// sig verb is pressed by priority up to its per-fight cap, a disabled
// button is never pressed, a wave-3-only fight is untouched, the
// low-HP-only verb is gated, and no random call is made.
// Observable effect, not just green assertions: the stub records every
// verb call in order, so the test asserts the exact call sequence.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { withCuriousW4 } = require(path.join(REPO, 'scripts', 'policies', 'curiousw4'));

let failures = 0;
function check(name, cond, extra) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---- Leg 1: forbidden tokens ----
const FORBIDDEN = ['worldMonsters', 'nearestWorldMonster', 'monsterAt',
  'monsterPositions', 'worldMonster', 'npcsOnNode', 'npcIds', 'roster',
  'villageLinks', 'linkWith', 'linkList', 'travelTargets', 'tileAt',
  'map.px', 'map.py', 'Math.random', '__policyRandom'];
const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'curiousw4.js'), 'utf8');
for (const t of FORBIDDEN) check('forbidden token absent: ' + t, src.indexOf(t) < 0);

// ---- Leg 2: stub-Game determinism ----
let randomCalls = 0;
const realRandom = Math.random;
Math.random = function () { randomCalls++; return 0.5; };

function makeGame(opts) {
  const fighter = { hp: opts.hp || 100, maxHp: 100, acted: false };
  const fight = { id: opts.fightId || 'f1', over: false, fighters: opts.fighters };
  const calls = [];
  const G = {
    state: { scholar: { day: 42 } },
    data: { monsters: opts.monsters },
    tbfight: fight,
    tbIsPlayerTurn: function () { return !fighter.acted && !fight.over; },
    tbFighter: function () { return fighter; },
    unlockedWave: function () { return opts.unlocked || 4; },
    sigW4CombatButtons: function () { return opts.buttons || ''; },
    _calls: calls, _fighter: fighter, _fight: fight,
  };
  for (const v of ['tbEulogyRewrite', 'tbEulogyContradict', 'tbCongRefuse', 'tbSuburbRest', 'tbSuburbLeave']) {
    G[v] = function () { calls.push(v); fighter.acted = true; };
  }
  return G;
}
function makeBase() {
  const base = { id: 'base', fight: function () { base.calls = (base.calls || 0) + 1; return false; } };
  return base;
}
const W4 = [{ id: 'eulogy', wave: 4 }, { id: 'congregation', wave: 4 }, { id: 'suburb', wave: 4 }];
const W3 = [{ id: 'redactor', wave: 3 }];

// Priority + caps: Rewrite(10,cap1) then Contradict(7,cap4), disabled Refuse never.
{
  const G = makeGame({ monsters: W4, fighters: [{ kind: 'monster', alive: true, monsterId: 'eulogy' }],
    buttons: '<button class="self-btn" data-sigw4="tbEulogyContradict" title="x">C</button>'
      + '<button class="self-btn" data-sigw4="tbCongRefuse" disabled title="x">R</button>'
      + '<button class="self-btn" data-sigw4="tbEulogyRewrite" title="x">W</button>' });
  const base = makeBase();
  const pol = withCuriousW4(base, 't', 't');
  const ctx = {};
  const seq = [];
  for (let i = 0; i < 7; i++) {
    G._fighter.acted = false;
    const r = pol.fight(G, ctx);
    seq.push(r ? G._calls[G._calls.length - 1] : 'base');
    if (!r) break;
  }
  check('priority order rewrite-first', seq[0] === 'tbEulogyRewrite', seq.join(','));
  check('contradict follows, disabled refuse never pressed',
    seq.slice(1, 5).every(s => s === 'tbEulogyContradict') && seq.indexOf('tbCongRefuse') < 0, seq.join(','));
  check('cap exhausted falls through to base', seq[5] === 'base', seq.join(','));
  check('uses recorded with day + mids', ctx.curious && ctx.curious.uses.length === 5
    && ctx.curious.uses[0].day === 42 && ctx.curious.uses[0].mids[0] === 'eulogy',
    JSON.stringify(ctx.curious || null));
}
// Wave-3-only fight untouched.
{
  const G = makeGame({ monsters: W3, fighters: [{ kind: 'monster', alive: true, monsterId: 'redactor' }],
    buttons: '<button class="self-btn" data-sigw4="tbEulogyContradict" title="x">C</button>' });
  const base = makeBase();
  const pol = withCuriousW4(base, 't', 't');
  const ctx = {};
  pol.fight(G, ctx);
  check('wave-3 fight delegates to base, no verb', base.calls === 1 && G._calls.length === 0,
    'base=' + (base.calls || 0) + ' calls=' + G._calls.length);
}
// SuburbRest gated on HP < 50%.
{
  const G = makeGame({ monsters: W4, hp: 80, fighters: [{ kind: 'monster', alive: true, monsterId: 'suburb' }],
    buttons: '<button class="self-btn" data-sigw4="tbSuburbRest" title="x">Rest</button>' });
  const base = makeBase();
  const pol = withCuriousW4(base, 't', 't');
  pol.fight(G, {});
  check('suburb rest skipped at 80% HP', base.calls === 1 && G._calls.length === 0, '');
  G._fighter.hp = 40; G._fighter.acted = false;
  const ctx2 = {};
  pol.fight(G, ctx2);
  check('suburb rest pressed below 50% HP', G._calls[0] === 'tbSuburbRest', G._calls.join(','));
}
// Locked wave: no press even with a wave-4 fighter present (defensive).
{
  const G = makeGame({ unlocked: 3, monsters: W4, fighters: [{ kind: 'monster', alive: true, monsterId: 'eulogy' }],
    buttons: '<button class="self-btn" data-sigw4="tbEulogyContradict" title="x">C</button>' });
  const base = makeBase();
  const pol = withCuriousW4(base, 't', 't');
  pol.fight(G, {});
  check('locked wave delegates to base', base.calls === 1 && G._calls.length === 0, '');
}
check('no random calls by the layer', randomCalls === 0, 'randomCalls=' + randomCalls);
Math.random = realRandom;
console.log(failures ? ('CURIOUSW4 PROOF: ' + failures + ' FAILURES') : 'CURIOUSW4 PROOF: ALL PASS');
process.exit(failures ? 1 : 0);
