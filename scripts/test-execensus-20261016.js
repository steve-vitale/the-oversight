#!/usr/bin/env node
'use strict';
// test-execensus-20261016.js — proof record for the sim-execensus arm
// (axis scale-onramp): the EXECUTION-WINDOW census on the landed
// nodewitness channel (commit a2c02684).
//
// READ-ONLY diagnostic instrument: zero src/js changes. The instrument is
// scripts/sweep-execensus-20261016.js (attachExecensusCapture +
// classifyLearning + trickTokensFor), exercised here against synthetic
// fixtures and the det-gate.
//
// Sections:
//   UNIT — the trick-token map covers every villagerTrickDef key and every
//          w1/w2 counter kind; DISMISS set sane; exports present.
//   DET  — identical-seed 40d pairs, full instrument attached vs bare:
//          byte-identical trajectories (the instrument changes nothing).
//   ATTR — attribution on a fixed seed (synthetic):
//          A. eater learned via node-witness kill x2 -> villager with spoiled
//             food fights the eater -> gate fires -> poison -> mFlee;
//             funnel class 'flee' / 'flee, trick-driven'.
//          B. same, no spoiled food -> 'conditions-never-met'.
//          C. herald (known, no field-AI gate) -> 'un-actuatable'.
//          D. learning with no subsequent fights -> verdict 'no-opportunity'.
//          E. TB path: hummice learned via 'node-witnessed' -> scholar
//             performs shout mid-TB-fight -> tbEnd captures per-species
//             performance -> classified 'flee' / 'flee, trick performed'.
//   SMOKE — oneRun(961, leadfeast) 20d via the sweep: per-seed JSON
//           schema-valid; every witness-sourced learning carries a verdict.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
// New tests must not write into the repo: SMOKE points the sweep's dirs at
// tmp via EXECENSUS_EVID / EXECENSUS_BEATS.
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1';
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0';
process.env.NODEWITNESS = '1';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const SWEEP = path.join(ROOT, 'scripts', 'sweep-execensus-20261016.js');
const GPLIB = path.join(ROOT, 'scripts', 'godpath', 'lib.js');

const _tmpEvid = fs.mkdtempSync(path.join(os.tmpdir(), 'ex-smoke-evid-'));
const _tmpBeats = fs.mkdtempSync(path.join(os.tmpdir(), 'ex-smoke-beats-'));
process.env.EXECENSUS_EVID = _tmpEvid;
process.env.EXECENSUS_BEATS = _tmpBeats;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

// ---------- UNIT ----------
console.log('== UNIT: trick-token map ==');
{
  const SW = require(SWEEP);
  ok(typeof SW.attachExecensusCapture === 'function', 'unit: attachExecensusCapture exported');
  ok(typeof SW.classifyLearning === 'function', 'unit: classifyLearning exported');
  ok(typeof SW.trickTokensFor === 'function', 'unit: trickTokensFor exported');
  ok(typeof SW.oneRun === 'function', 'unit: oneRun exported');
  // The map must cover every villagerTrickDef key (checked against a live
  // game so the def list can't drift silently).
  const code = `
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: 941, mode: 'execensus-unit', fullTelemetry: false });
  await setupGame(Game);
  const out = { defs: Object.keys(Game.villagerTrickDefs()), counters: [] };
  for (const m of (Game.data.monsters || [])) if (m.counter) out.counters.push(m.id + ':' + m.counter.kind);
  console.log(JSON.stringify(out));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  const f = '/tmp/execensus-unit-' + process.pid + '.js';
  fs.writeFileSync(f, code);
  let g;
  try { g = JSON.parse(execSync(`node ${f}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString().trim().split('\n').pop()); }
  finally { try { fs.unlinkSync(f); } catch (e) {} }
  ok(!g.__crash, 'unit: live game loads for def enumeration');
  if (!g.__crash) {
    // trickTokensFor evaluated against the live game (def list can't drift).
    const code2 = `
const { loadGame, setupGame } = require('${HARNESS}');
const SW = require('${SWEEP}');
(async () => {
  const { Game } = await loadGame({ seed: 942, mode: 'execensus-unit2', fullTelemetry: false });
  await setupGame(Game);
  const out = { map: {} };
  for (const k of Object.keys(Game.villagerTrickDefs())) out.map[k] = SW.trickTokensFor(Game, k);
  // every w1/w2 counter kind maps to something sane
  out.kinds = {};
  for (const m of (Game.data.monsters || [])) {
    if (m.counter && !(m.id in out.map)) out.kinds[m.counter.kind] = (out.kinds[m.counter.kind] || []).concat([SW.trickTokensFor(Game, m.id).join(',')]);
  }
  console.log(JSON.stringify(out));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
    const f2 = '/tmp/execensus-unit2-' + process.pid + '.js';
    fs.writeFileSync(f2, code2);
    let g2;
    try { g2 = JSON.parse(execSync(`node ${f2}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString().trim().split('\n').pop()); }
    finally { try { fs.unlinkSync(f2); } catch (e) {} }
    ok(!g2.__crash, 'unit: token map evaluates on the live game');
    if (!g2.__crash) {
      const defs = g.defs;
      const missing = defs.filter(k => !(k in g2.map));
      ok(missing.length === 0, `unit: every villagerTrickDef key has a token-map entry (${defs.length} defs)`);
      const empty = defs.filter(k => g2.map[k].length === 0);
      console.log(`  unit: un-actuatable defs (no field-AI gate): ${empty.join(', ') || 'none'}`);
      ok(empty.indexOf('herald') >= 0, 'unit: herald is un-actuatable (documented gap)');
      const shoutKinds = (g2.kinds.shout || []).filter(s => s === 'shout').length;
      ok(shoutKinds > 0, `unit: shout-kind counters map to ['shout'] (${shoutKinds})`);
    }
  }
}

// ---------- DET ----------
console.log('== DET: instrument attached vs bare byte-identical ==');
function hashRun(seed, withInstrument) {
  const tmpFile = path.join(os.tmpdir(), 'ex-det-' + seed + '-' + (withInstrument ? 'w' : 'b') + '-' + process.pid + '.js');
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1'; process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.NODEWITNESS = '1';
const { loadGame, setupGame, runDays, quietLog } = require('${HARNESS}');
const SW = require('${SWEEP}');
const TF = require('${path.join(ROOT, 'scripts', 'policies', 'tribfloor.js')}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'execensus-det', fullTelemetry: false });
  await setupGame(Game);
  let cap = null;
  ${withInstrument ? 'cap = SW.attachExecensusCapture(Game);' : ''}
  const res = await quietLog(async () => await runDays(Game, TF.leadfeast, { days: 40, manifest: undefined, sampleEvery: 30 }));
  if (cap) { cap.restore(); }
  const st = Game.state;
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
    days: res.days,
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16) }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString();
    return JSON.parse(r.trim().split('\n').pop() || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const a = hashRun(951, true), b = hashRun(951, false);
  ok(!a.__crash && !b.__crash, 'det: 951 instrumented + bare runs complete');
  ok(a.hash === b.hash, `det: full instrument attached vs bare byte-identical (${a.hash} == ${b.hash})`);
  const c = hashRun(952, true), d = hashRun(952, false);
  ok(c.hash === d.hash, `det: seed 952 pair byte-identical (${c.hash} == ${d.hash})`);
  ok(a.hash !== c.hash, 'det: different seeds differ (digest is live)');
}

// ---------- ATTRIBUTION ----------
console.log('== ATTR: synthetic learning -> fight -> classification ==');
function attrEval(seed, js) {
  const tmpFile = '/tmp/execensus-attr-' + seed + '-' + process.pid + '.js';
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1'; process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.NODEWITNESS = '1';
const { loadGame, setupGame } = require('${HARNESS}');
const SW = require('${SWEEP}');
const GPLIB = require('${GPLIB}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'execensus-attr', fullTelemetry: false });
  await setupGame(Game);
  const cap = SW.attachExecensusCapture(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 1500); }
  cap.restore();
  console.log(JSON.stringify(out));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString();
    return JSON.parse(r.trim().split('\n').pop() || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
const ATTR_PRE = `
  const G = Game;
  const rs = ((G.state.village || {}).roster || []).filter(v => v && v !== 'player');
  const fighter = rs[0], victim = rs[1], wit = rs[2];
  // fighter: strong, alive, positioned with the witness on the monster tile
  G.state.village = G.state.village || {};
  G.state.village.health = G.state.village.health || {};
  G.state.village.health[fighter] = 500;
  const fv = (G.data.villagers || []).find(x => x.id === fighter);
  if (fv) { fv.abilities = []; }
  G.npcSetNode(fighter, 5, 5);
  G.npcSetNode(wit, 5, 5);
`;
// A. eater poison arc: witness-learned -> spoiled food on hand -> poison fires
{
  const o = attrEval(941, ATTR_PRE + `
    const mdef = G.data.monsters.find(m => m.id === 'eater');
    // two witness reports -> discovery via 'node-witnessed'
    G.noteNodeWitnessKill(victim, 'eater', [wit]);
    G.noteNodeWitnessKill(rs[3] || victim, 'eater', [wit]);
    out.learned = !!((G.state.villagerTricks || {}).eater);
    out.discVia = (cap.discoveries.filter(d => d.id === 'eater').map(d => d.via) || []).join(',');
    out.discSeq = (cap.discoveries.find(d => d.id === 'eater') || {}).seq;
    // spoiled meal in hand (spoilDay <= today)
    if (fv) fv.items = [{ name: 'old meat', kcalEach: 200, units: 1, spoilDay: 0 }];
    const rec = G.fieldFight(fighter, mdef, { id: 'eater', tx: 5, ty: 5, hp: 1200, maxHp: 1200 }, {});
    out.outcome = rec.outcome; out.trickLog = rec.trickLog || [];
    const ff = cap.fieldFights[cap.fieldFights.length - 1];
    out.evals = ff.evals; out.fires = ff.fires;
    const learning = { id: 'eater', seq: out.discSeq };
    const c = SW.classifyLearning(G, cap, learning);
    out.verdict = c.verdict; out.execs = c.execs;
    out.cls = (c.fights[0] || {}).cls; out.sub = (c.fights[0] || {}).sub;
    out.nFights = c.fights.length;
  `);
  if (o.__err) console.log('  attr-A err: ' + o.__err);
  ok(o.learned === true, 'attr-A: two witness reports learn the eater trick');
  ok(o.discVia === 'node-witnessed', `attr-A: discovery via is node-witnessed (got ${o.discVia})`);
  ok(o.fires > 0, `attr-A: poison gate fires with spoiled food (fires=${o.fires})`);
  ok((o.trickLog || []).indexOf('poison') >= 0, `attr-A: trickLog carries poison (${JSON.stringify(o.trickLog)})`);
  ok(o.outcome === 'mFlee', `attr-A: poisoned meal -> mFlee (got ${o.outcome})`);
  ok(o.cls === 'flee' && /trick-driven/.test(o.sub || ''), `attr-A: funnel class flee / trick-driven (got ${o.cls} / ${o.sub})`);
  ok(o.verdict === 'traced' && o.execs === 1, `attr-A: learning traced with 1 execution (verdict=${o.verdict} execs=${o.execs})`);
}
// B. eater, no spoiled food -> conditions never met
{
  const o = attrEval(942, ATTR_PRE + `
    const mdef = G.data.monsters.find(m => m.id === 'eater');
    G.noteNodeWitnessKill(victim, 'eater', [wit]);
    G.noteNodeWitnessKill(rs[3] || victim, 'eater', [wit]);
    out.discSeq = (cap.discoveries.find(d => d.id === 'eater') || {}).seq;
    if (fv) fv.items = []; // no food at all
    const rec = G.fieldFight(fighter, mdef, { id: 'eater', tx: 5, ty: 5, hp: 1200, maxHp: 1200 }, {});
    out.outcome = rec.outcome;
    const ff = cap.fieldFights[cap.fieldFights.length - 1];
    out.evals = ff.evals; out.fires = ff.fires;
    const c = SW.classifyLearning(G, cap, { id: 'eater', seq: out.discSeq });
    out.cls = (c.fights[0] || {}).cls;
  `);
  if (o.__err) console.log('  attr-B err: ' + o.__err);
  ok((o.evals | 0) > 0, `attr-B: gate evaluated (evals=${o.evals})`);
  ok((o.fires | 0) === 0, `attr-B: gate never fires without spoiled food (fires=${o.fires})`);
  ok(o.cls === 'conditions-never-met', `attr-B: funnel class conditions-never-met (got ${o.cls})`);
}
// C. herald: known but no field-AI gate -> un-actuatable
{
  const o = attrEval(943, ATTR_PRE + `
    const mdef = G.data.monsters.find(m => m.id === 'herald');
    G.noteNodeWitnessKill(victim, 'herald', [wit]);
    G.noteNodeWitnessKill(rs[3] || victim, 'herald', [wit]);
    out.learned = !!((G.state.villagerTricks || {}).herald);
    out.discSeq = (cap.discoveries.find(d => d.id === 'herald') || {}).seq;
    out.tokens = SW.trickTokensFor(G, 'herald');
    const rec = G.fieldFight(fighter, mdef, { id: 'herald', tx: 5, ty: 5, hp: 300, maxHp: 300 }, {});
    out.outcome = rec.outcome;
    const ff = cap.fieldFights[cap.fieldFights.length - 1];
    out.evals = ff.evals; out.fires = ff.fires;
    const c = SW.classifyLearning(G, cap, { id: 'herald', seq: out.discSeq });
    out.cls = (c.fights[0] || {}).cls; out.verdict = c.verdict;
  `);
  if (o.__err) console.log('  attr-C err: ' + o.__err);
  ok(o.learned === true, 'attr-C: herald learned via the witness channel');
  ok(Array.isArray(o.tokens) && o.tokens.length === 0, 'attr-C: herald has no field-AI tokens');
  ok(o.cls === 'un-actuatable', `attr-C: funnel class un-actuatable (got ${o.cls}, outcome=${o.outcome})`);
  ok(o.verdict === 'traced', `attr-C: learning still traced (verdict=${o.verdict})`);
}
// D. learning with no subsequent fights -> explicit no-opportunity verdict
{
  const o = attrEval(944, ATTR_PRE + `
    G.noteNodeWitnessKill(victim, 'spoiler', [wit]);
    G.noteNodeWitnessKill(rs[3] || victim, 'spoiler', [wit]);
    const disc = cap.discoveries.find(d => d.id === 'spoiler') || {};
    const c = SW.classifyLearning(G, cap, { id: 'spoiler', seq: disc.seq });
    out.verdict = c.verdict; out.nFights = c.fights.length + c.tbFights.length;
  `);
  if (o.__err) console.log('  attr-D err: ' + o.__err);
  ok(o.verdict === 'no-opportunity', `attr-D: learning with no later fights -> no-opportunity verdict (got ${o.verdict})`);
}
// E. TB path: hummice (w1, shout) learned via node-witnessed; scholar shouts
{
  const o = attrEval(945, ATTR_PRE + `
    G.discoverMonsterCounter('hummice', 'node-witnessed');
    out.learned = !!((G.state.monsterCounters || {}).hummice);
    out.discVia = (cap.discoveries.filter(d => d.id === 'hummice').map(d => d.via) || []).join(',');
    out.discSeq = (cap.discoveries.find(d => d.id === 'hummice') || {}).seq;
    out.tokens = SW.trickTokensFor(G, 'hummice');
    GPLIB.fight(G, 'hummice', { hp: 200 });
    let shouted = false, guard = 0;
    while (G.tbfight && !G.tbfight.over && guard++ < 40 && !shouted) {
      if (G.tbIsPlayerTurn()) {
        shouted = G.tbPlayerShout() !== false;
        if (!shouted) break;
      } else {
        try { G.tbAdvance(); } catch (e) { out.advErr = String(e).slice(0, 120); break; }
      }
    }
    out.shoutOk = shouted;
    try { G.tbEnd('fled'); } catch (e) { out.endErr = String(e).slice(0, 120); }
    const tb = cap.tbFights[cap.tbFights.length - 1] || {};
    out.tbResult = tb.result; out.tbPerfs = tb.perfs && tb.perfs.hummice;
    const c = SW.classifyLearning(G, cap, { id: 'hummice', seq: out.discSeq });
    out.tbCls = ((c.tbFights[0]) || {}).cls; out.tbSub = ((c.tbFights[0]) || {}).sub;
    out.verdict = c.verdict;
  `);
  if (o.__err) console.log('  attr-E err: ' + o.__err);
  ok(o.learned === true && o.discVia === 'node-witnessed', `attr-E: hummice learned via node-witnessed (via=${o.discVia})`);
  ok(o.shoutOk === true, 'attr-E: scholar shouts mid-TB-fight');
  ok(Array.isArray(o.tbPerfs) && o.tbPerfs.indexOf('shout') >= 0, `attr-E: tbEnd captures per-species shout performance (${JSON.stringify(o.tbPerfs)})`);
  ok(o.tbCls === 'flee' && /trick performed/.test(o.tbSub || ''), `attr-E: TB fight classified flee / trick performed (got ${o.tbCls} / ${o.tbSub})`);
}

// ---------- SMOKE ----------
console.log('== SMOKE: oneRun(961, leadfeast) 20d ==');
(async () => {
  const SW = require(SWEEP);
  process.env.SEEDS = '961';
  process.env.POLICIES = 'leadfeast';
  process.env.DAYS = '20';
  process.env.ARM = 'execensus';
  let out = null, err = null;
  try { out = await SW.oneRun(961, 'leadfeast'); }
  catch (e) { err = String(e && e.stack || e).slice(0, 500); }
  if (err) console.log('  smoke err: ' + err);
  ok(!err && out && out.days >= 20, `smoke: 20-day census run completes (days=${out && out.days})`);
  const fp = path.join(_tmpEvid, 'leadfeast-s961-execensus.json');
  let j = null;
  try { j = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
  ok(!!j, 'smoke: per-seed JSON written');
  ok(j && ['national', 'table', 'won', 'wins', 'exiled'].every(k => typeof j[k] === 'number'),
    'smoke: schema carries numeric national/table/won/wins/exiled');
  ok(j && Array.isArray(j.witnessLearnings) && Array.isArray(j.funnel),
    'smoke: schema carries witnessLearnings + funnel');
  ok(j && j.funnel.every(f => ['traced', 'no-opportunity'].indexOf(f.verdict) >= 0),
    `smoke: every funnel entry carries a verdict (${j && j.funnel.length} learnings)`);
  ok(j && typeof j.nFieldFights === 'number' && typeof j.nTbFights === 'number',
    `smoke: fight capture recorded (field=${j && j.nFieldFights} tb=${j && j.nTbFights})`);
  console.log(`  smoke: learnings=${j && j.nLearnings} fieldFights=${j && j.nFieldFights} tbFights=${j && j.nTbFights} end=${j && j.endReason}`);
})().then(() => {
  console.log(`\n== ${pass} passed, ${fail} failed ==`);
  if (fails.length) { console.log('failures:'); fails.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
}).catch(e => { console.error('PROOF CRASH', e); process.exit(1); });
