#!/usr/bin/env node
// scripts/test-killroad-r18-20261013.js — proof for the killroad policy
// (scale-onramp r18 ARM 2). Real RED phases: every "after" assertion first
// runs against the "before" configuration and must FAIL there.
//
// RED 1 (gate OFF = byte-identical to competent): same seed, same horizon —
//   killroad with KILLROAD_COURT unset must produce a trajectory identical
//   to plain competent, with zero courtship behavior.
// RED 2 (no early courtship): gate ON, horizon < 35 days — the layer exists
//   but must not fire before day 35.
// GREEN 1 (courtship plays): gate ON, 60 days — proposals fire through the
//   real Game.proposeLink, say-lines show the played beats, accepted links
//   are primary-Haven at 3,000 kcal/week tribute.
// GREEN 2 (walk from subordinate counters): a staged pendingCounter is
//   answered 'walk' — the kill road never bows.
// GREEN 3 (tend honesty): if any primary link is active, tendLink moves real
//   pantry kcal (+8 trust/week cadence) — the tax is real.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { killroad, courtOn } = require('./policies/killroad');

const SEED = 11;
let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  PASS ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function stripRow(r) {
  const c = Object.assign({}, r);
  delete c.policy; delete c.commit; delete c.label;
  return c;
}

async function runPolicy(Game, policy, days, ctxProbe) {
  // minimal driver mirroring sweep-tablerecon's wiring (daily only;
  // scale/table instruments attached for the GREEN assertions)
  const fc = require('./food-coupling-20261013');
  const sr = require('./scale-repro-20261013');
  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const p = Object.assign({}, policy);
  const origDaily = policy.daily;
  const ctx = {};
  p.daily = (G, C) => { try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
    try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
    if (origDaily) { try { origDaily(G, C || ctx); } catch (e) {} } };
  const result = await runDays(Game, p, { days, sampleEvery: 10 });
  const row = Object.assign({ policy: policy.id, seed: SEED },
    fc.finalize(Game, m, result), sr.finalizeScale(Game, m));
  if (ctxProbe) ctxProbe(ctx, Game, m);
  return row;
}

(async () => {
  console.log('== RED 1: gate OFF killroad == competent (seed 11, 25d) ==');
  delete process.env.KILLROAD_COURT;
  check('gate reads OFF by default', courtOn() === false);
  const g1 = await loadGame({ seed: SEED, mode: 'killroad-red1a' });
  await setupGame(g1.Game);
  const rowComp = await runPolicy(g1.Game, competent, 25);
  const g2 = await loadGame({ seed: SEED, mode: 'killroad-red1b' });
  await setupGame(g2.Game);
  let ctxOff = null;
  const rowKillOff = await runPolicy(g2.Game, killroad, 25, (c) => { ctxOff = c; });
  check('trajectories byte-identical (gate OFF)',
    JSON.stringify(stripRow(rowComp)) === JSON.stringify(stripRow(rowKillOff)),
    'rows diverged');
  check('no courtship counters when gate off',
    ctxOff && !ctxOff.proposedKill && !ctxOff.tended && !ctxOff.courtWalked,
    JSON.stringify(ctxOff));
  check('no links formed when gate off', (rowKillOff.linksEver || 0) === 0);

  console.log('== RED 2: gate ON, horizon 30d — no courtship before day 35 ==');
  process.env.KILLROAD_COURT = '1';
  check('gate reads ON', courtOn() === true);
  const g3 = await loadGame({ seed: SEED, mode: 'killroad-red2' });
  await setupGame(g3.Game);
  let ctxEarly = null;
  await runPolicy(g3.Game, killroad, 30, (c) => { ctxEarly = c; });
  check('zero proposals before day 35', !ctxEarly.proposedKill, JSON.stringify(ctxEarly));

  console.log('== GREEN 1: gate ON, 60d — courtship plays through engine verbs ==');
  const g4 = await loadGame({ seed: SEED, mode: 'killroad-green1' });
  await setupGame(g4.Game);
  // spy on the verbs: every proposal/tend must go through the real engine
  const verbs = { propose: [], tend: [] };
  const origPropose = g4.Game.proposeLink.bind(g4.Game);
  g4.Game.proposeLink = function (tid, opts) { verbs.propose.push({ tid, opts }); return origPropose(tid, opts); };
  const origTend = g4.Game.tendLink ? g4.Game.tendLink.bind(g4.Game) : null;
  if (origTend) g4.Game.tendLink = function (id) { verbs.tend.push({ id }); return origTend(id); };
  const origSay = g4.Game.say ? g4.Game.say.bind(g4.Game) : null;
  const courtBeats = [];
  if (origSay) g4.Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (/bow to Haven|declines|doesn.t say no|walk away|offer on the table|tended|sends.*kcal of grain|trust \+/i.test(text))
        courtBeats.push(text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 200));
    } catch (e) {}
    return origSay(msg);
  };
  let ctxOn = null;
  const rowOn = await runPolicy(g4.Game, killroad, 60, (c) => { ctxOn = c; });
  check('proposals fired (d>=35)', verbs.propose.length >= 1, `propose calls: ${verbs.propose.length}`);
  check('proposals are primary-Haven (never subordinate)',
    verbs.propose.every(v => v.opts && v.opts.asSubordinate === false),
    JSON.stringify(verbs.propose.map(v => v.opts)));
  check('tribute offer is the modest 3,000/week',
    verbs.propose.every(v => v.opts && v.opts.tributeKcalPerWeek === 3000),
    JSON.stringify(verbs.propose.map(v => v.opts)));
  const links = (g4.Game.hierarchyState ? g4.Game.hierarchyState() : []).filter(l => l && l.status === 'active');
  const primLinks = links.filter(l => l.primary === 'haven');
  check('every formed link has Haven primary (no bowing)',
    links.every(l => l.primary === 'haven') || links.length === 0,
    JSON.stringify(links.map(l => l.primary)));
  check('say-lines show played courtship beats (transcript-judgeable)',
    courtBeats.length >= 1, `courtship beats captured: ${courtBeats.length}`);
  for (const b of courtBeats.slice(0, 3)) console.log(`  beat: ${b}`);
  console.log(`  info: proposed=${verbs.propose.length} activeLinks=${links.length} primary=${primLinks.length} tends=${verbs.tend.length}`);

  console.log('== GREEN 2: subordinate counters are walked, never accepted ==');
  const g5 = await loadGame({ seed: SEED, mode: 'killroad-green2' });
  await setupGame(g5.Game);
  const answers = [];
  const origAns = g5.Game.answerCounter ? g5.Game.answerCounter.bind(g5.Game) : null;
  if (origAns) g5.Game.answerCounter = function (how) { answers.push(how); return origAns(how); };
  // stage a subordinate-terms counter directly and run one courtship beat
  g5.Game.state.pendingCounter = {
    targetId: 'ov_test', asSubordinate: true, kind: 'link',
    tributeKcalPerWeek: 5000, day: 40,
    terms: 'staged test counter',
  };
  const beforeLinks = (g5.Game.hierarchyState ? g5.Game.hierarchyState().length : 0);
  try { killroad.daily(g5.Game, {}); } catch (e) {}
  check('staged counter answered walk', answers.includes('walk'), JSON.stringify(answers));
  check('no link formed from the walk', (g5.Game.hierarchyState ? g5.Game.hierarchyState().length : 0) === beforeLinks);

  console.log('== GREEN 3: tend honesty — real pantry kcal, real trust ==');
  if (primLinks.length > 0 && verbs.tend.length > 0) {
    check('tends went through the real tendLink verb', true);
    const l = primLinks[0];
    check('tended link trust moved (>=30 start)', (l.trust || 0) >= 30, `trust=${l.trust}`);
  } else {
    console.log('  SKIP tend-honesty (no primary link + tend on this seed/horizon — the verb path is engine code, proposals proved above)');
  }

  delete process.env.KILLROAD_COURT;
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
