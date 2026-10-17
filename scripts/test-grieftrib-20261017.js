#!/usr/bin/env node
// scripts/test-grieftrib-20261017.js — PROOF for sim-grieftrib (2026-10-17,
// scale-onramp axis, findings #459/#460 follow-up).
//
// THE LEVER (policy-side only, scripts/policies/grieftrib.js, GRIEFTRIB=1,
// default OFF — ZERO src/js changes): when a succession hits a mature
// (>=21d) subordinate-road link, stage the engine's renegotiation beat
// BEFORE the engine's grab path runs; the GRIEF COALESCES guard then returns
// 'grieving' (no x1.5 grab, no -8 haircut, no mourning window) and the layer
// answers the beat the same event — 'gift' (1,500 kcal, trust +8) when the
// pantry carries it above the 2-day floor, else 'visit' (2-day speaker,
// trust +5). Young-link beats the base never answers are answered too.
//
// RED PHASE (GRIEFTRIB unset):
//   R1. gate-off byte-identical: the wrapper delegates to the base daily,
//       Game.successionCrisis is NOT wrapped (reference unchanged).
//   R2. mechanism RED: mature subordinate link + successionCrisis -> the
//       engine's grab lands (terms 4000->6000, griefGrabs 1, trust 50->42,
//       mourning marked). Proves the test discriminates the grab's presence.
// ARMED PHASE (GRIEFTRIB=1):
//   A1. mature subordinate link: beat staged + answered 'gift' — terms stay
//       4000, griefGrabs 0, trust 50->58, pantry -1500, say-line carries
//       "grief met with grain".
//   A2. thin pantry (< 1500 + 2d floor): answered 'visit' — terms unchanged,
//       no grab, trust +5 (or +2 on an empty bench).
//   A3. young link (<21d): wrapper does NOT stage; the engine stages its own
//       beat and the layer answers it — terms unchanged, no grab.
//   A4. already-grieving link (mourning live): wrapper skips; the coalesce
//       guard prices the grief in — no grab, terms unchanged.
//   A5. griefGrabs=2 link: wrapper skips; the cap's "spent" refusal holds —
//       terms unchanged.
//   A6. lead-road link (Haven primary): untouched — the engine presses
//       tribute DOWN x0.75 as designed; the layer does not interfere.
//   A7. armed determinism: same seed twice -> identical day hash.
//   A8. zero src/js: no grieftrib marker in src/js/hierarchy.js.
//
// Usage:
//   node scripts/test-grieftrib-20261017.js          # RED
//   GRIEFTRIB=1 node scripts/test-grieftrib-20261017.js # ARMED
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
let GT = null;
try { GT = require('./policies/grieftrib'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: grieftrib driver absent');
    process.exit(0);
  }
  throw e;
}

const ARMED = process.env.GRIEFTRIB === '1';
const PHASE = ARMED ? 'ARMED (GRIEFTRIB=1)' : 'RED (gate off)';
console.log('== grieftrib proof — ' + PHASE + ' ==');

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

function havenPantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}
function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const m = Game.mshipState ? Game.mshipState() : { links: [] };
    const linkBits = (m.links || []).map(l => [l.id, l.status, Math.round(l.trust || 0), Math.round(l.tributeKcalPerWeek || 0), l.griefGrabs || 0].join(':')).join(';');
    return [s.day, Math.round(s.health || 0), (v.roster || []).length,
      Math.round(havenPantryKcal(Game) / 100), linkBits].join('|');
  } catch (e) { return 'ERR'; }
}

// addSubLink: a Haven-subordinate link (primary bigkeep -> subordinate haven).
// ageDays: link age in days (scholar.day - link.day).
function addSubLink(Game, opts) {
  opts = opts || {};
  const day = 40;
  Game.state.scholar.day = day;
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'bigkeep', name: 'Bigkeep', pantryKcal: 50000, population: 20, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  const link = {
    id: opts.id || 'link_grief', primary: 'bigkeep', subordinate: 'haven',
    day: day - (opts.ageDays != null ? opts.ageDays : 40),
    trust: opts.trust != null ? opts.trust : 50, status: 'active',
    tributeKcalPerWeek: opts.tributeKcalPerWeek || 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: opts.mourningUntil || 0,
    griefGrabs: opts.griefGrabs || 0,
  };
  m.links.push(link);
  return link;
}
function addLeadLink(Game) {
  Game.state.scholar.day = 40;
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'thinval', name: 'Thinvale', pantryKcal: 1000, population: 10, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  const link = {
    id: 'link_lead', primary: 'haven', subordinate: 'thinval',
    day: 0, trust: 50, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: 0,
  };
  m.links.push(link);
  return link;
}
async function buildWorld(seed, pantryKcal) {
  const { Game } = await loadGame({ seed, mode: 'grieftrib-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); return t; };
  Game.feedback = function () {};
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', pantryKcal, 3)];
  return { Game, said };
}

async function redPhase() {
  // R1: gate-off — pure delegation, successionCrisis unwrapped.
  {
    const { Game } = await buildWorld(4242, 150000);
    const before = Game.successionCrisis;
    const stub = { id: 'stub', daily(G, c) { c.called = true; } };
    const wrapped = GT.withGrieftrib(stub, 'stub', 'stub');
    const ctx = {};
    wrapped.daily(Game, ctx);
    check('R1 gate-off delegates to base daily', ctx.called === true);
    check('R1 gate-off leaves successionCrisis unwrapped', Game.successionCrisis === before);
  }
  // R2: mechanism RED — the grab lands without the layer.
  {
    const { Game } = await buildWorld(4242, 150000);
    const link = addSubLink(Game, {});
    Game.successionCrisis(link.id);
    check('R2 grab lands: terms 4000->6000', link.tributeKcalPerWeek === 6000,
      'got ' + link.tributeKcalPerWeek);
    check('R2 grab counted', (link.griefGrabs || 0) === 1);
    check('R2 trust haircut -8', link.trust === 42, 'got ' + link.trust);
    check('R2 mourning marked', (link.mourningUntil || 0) > 40);
  }
}

async function armedPhase() {
  // A1: mature subordinate link — beat staged + answered 'gift'.
  {
    const { Game, said } = await buildWorld(4242, 150000);
    const link = addSubLink(Game, {});
    const ctx = {};
    GT.installWrapper(Game, ctx);
    check('A1 wrapper installed', Game.successionCrisis._grieftribWrapped === true);
    Game.successionCrisis(link.id);
    check('A1 no grab: terms stay 4000', link.tributeKcalPerWeek === 4000, 'got ' + link.tributeKcalPerWeek);
    check('A1 grab counter untouched', (link.griefGrabs || 0) === 0);
    check('A1 trust +8 (gift)', link.trust === 58, 'got ' + link.trust);
    check('A1 pantry paid 1500', havenPantryKcal(Game) === 150000 - 1500, 'got ' + havenPantryKcal(Game));
    check('A1 no beat left pending', !link.pendingRenegotiation);
    check('A1 staged+answered counted', ctx.gtStaged === 1 && ctx.gtAnswered_gift === 1,
      JSON.stringify({ staged: ctx.gtStaged, gift: ctx.gtAnswered_gift }));
    const line = said.find(s => /grief met with grain/i.test(s));
    check('A1 grief-met-with-grain said aloud', !!line, line ? line.slice(0, 120) : 'no line');
  }
  // A2: thin pantry — answered 'visit'.
  {
    const { Game } = await buildWorld(4243, 5000);
    const link = addSubLink(Game, {});
    const ctx = {};
    GT.installWrapper(Game, ctx);
    Game.successionCrisis(link.id);
    check('A2 no grab on thin pantry', link.tributeKcalPerWeek === 4000, 'got ' + link.tributeKcalPerWeek);
    check('A2 grab counter untouched', (link.griefGrabs || 0) === 0);
    check('A2 visit answered (trust +5, or +2 bench-empty)', link.trust === 55 || link.trust === 52,
      'got ' + link.trust);
    check('A2 visit counted', ctx.gtAnswered_visit === 1, 'got ' + ctx.gtAnswered_visit);
  }
  // A3: young link — wrapper skips staging; engine stages its own beat; layer answers.
  {
    const { Game } = await buildWorld(4244, 150000);
    const link = addSubLink(Game, { ageDays: 10 });
    const ctx = {};
    GT.installWrapper(Game, ctx);
    const r = Game.successionCrisis(link.id);
    check('A3 young link takes the grace path', r === 'grace', 'got ' + r);
    check('A3 wrapper did not stage', (ctx.gtStaged || 0) === 0);
    check('A3 engine beat answered: no grab', (link.griefGrabs || 0) === 0 && link.tributeKcalPerWeek === 4000);
    check('A3 gift counted', ctx.gtAnswered_gift === 1, 'got ' + ctx.gtAnswered_gift);
  }
  // A4: already-grieving link — skipped, coalesce guard holds.
  {
    const { Game } = await buildWorld(4245, 150000);
    const link = addSubLink(Game, { mourningUntil: 45 });
    const ctx = {};
    GT.installWrapper(Game, ctx);
    const r = Game.successionCrisis(link.id);
    check('A4 grieving link returns grieving', r === 'grieving', 'got ' + r);
    check('A4 no grab on grieving link', link.tributeKcalPerWeek === 4000 && (link.griefGrabs || 0) === 0);
    check('A4 wrapper did not stage', (ctx.gtStaged || 0) === 0);
  }
  // A5: grabs spent (2/2) — the cap's refusal holds, wrapper skips.
  {
    const { Game } = await buildWorld(4246, 150000);
    const link = addSubLink(Game, { griefGrabs: 2, tributeKcalPerWeek: 9000 });
    const ctx = {};
    GT.installWrapper(Game, ctx);
    Game.successionCrisis(link.id);
    check('A5 spent link: terms unchanged at 9000', link.tributeKcalPerWeek === 9000,
      'got ' + link.tributeKcalPerWeek);
    check('A5 wrapper did not stage', (ctx.gtStaged || 0) === 0);
  }
  // A6: lead road — untouched (engine presses tribute down x0.75).
  {
    const { Game } = await buildWorld(4247, 150000);
    const link = addLeadLink(Game);
    const ctx = {};
    GT.installWrapper(Game, ctx);
    Game.successionCrisis(link.id);
    check('A6 lead road untouched: tribute pressed down x0.75', link.tributeKcalPerWeek === 3000,
      'got ' + link.tributeKcalPerWeek);
    check('A6 no beat staged on lead road', (ctx.gtStaged || 0) === 0);
  }
  // A7: armed determinism.
  {
    const run = async () => {
      const { Game } = await buildWorld(4248, 150000);
      const link = addSubLink(Game, {});
      GT.installWrapper(Game, {});
      Game.successionCrisis(link.id);
      return dayHash(Game);
    };
    const h1 = await run(), h2 = await run();
    check('A7 armed determinism', h1 === h2 && h1 !== 'ERR', h1.slice(0, 40));
  }
  // A8: zero src/js.
  {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'hierarchy.js'), 'utf8');
    check('A8 no grieftrib marker in src/js', src.indexOf('grieftrib') < 0 && src.indexOf('GRIEFTRIB') < 0);
    const mod = fs.readFileSync(path.join(__dirname, 'policies', 'grieftrib.js'), 'utf8');
    const codeOnly = mod.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
    check('A8 no RNG/Date in the layer', !/Math\.random|Date\.now/.test(codeOnly));
  }
}

(async () => {
  if (ARMED) await armedPhase(); else await redPhase();
  if (fails.length) { console.error('PROOF FAILED: ' + fails.join(', ')); process.exit(1); }
  console.log('PROOF GREEN (' + PHASE + ')');
})().catch(e => { console.error('FATAL', e); process.exit(2); });
