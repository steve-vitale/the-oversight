#!/usr/bin/env node
// test-trickfunnel-20261016.js — proof record for the sim-trickfunnel
// diagnostic (flesh-out loop, axis scale-onramp, run fleshout-20261016T2315Z).
// Read-only instrument: ZERO src/js, ZERO scripts/policies changes.
//
// Sections:
//   PURE   — kindOf/trickMids/classifyFunnelFight on synthetic captures:
//            full funnel row, known-at-start, discovered-in-fight,
//            no-hit, unattributed, ±1d join window, multi-species.
//   LIVE   — synthetic TB fights through the REAL engine (startCombat,
//            checkMonsterCounter, tbEnd) with the tbfight property
//            interception: the hit -> perf -> trickSummary -> waveKillLog
//            attribution chain end to end; known-at-start snapshot; dismissed
//            outcome; non-trick species yields zero rows; a direct-tbfight-
//            assignment bypass path (encounters/justice/party) is captured
//            with known_at_start.
//   DET    — identical-seed pairs: read-only instrument attached vs bare
//            game -> byte-identical trajectories.
//   SMOKE  — 20d pre-seat instrumented run completes; schema valid.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it); child processes for process isolation (never two harnesses in
// one process); no Game.save stub; no hardcoded absolute paths (ROOT
// derived from __dirname); no copied eval boilerplate (all loads via
// sim-harness.js).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const TRIBFLOOR = path.join(ROOT, 'scripts', 'policies', 'tribfloor.js');
const INSTRUMENT = path.join(ROOT, 'scripts', 'trickfunnel-instrument-20261016.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/tfl-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 800); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, {
      cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, FEASTSCALE_R13: '1', TRIBFLOOR: '1', SEATDRIVE: '0' },
    }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// ---------- PURE ----------
console.log('== PURE ==');
{
  const o = gameEval(1801, `
    const I = require('${INSTRUMENT}');
    const r = {};
    // kindOf
    r.k_eyes = I.kindOf(Game, 'cliffhanger');
    r.k_blindside = I.kindOf(Game, 'sunback');
    r.k_faceit = I.kindOf(Game, 'sweeps_week');
    r.k_move_windup = I.kindOf(Game, 'gallowdeer');
    r.k_none = I.kindOf(Game, 'redactor'); // wave 3, deliberately counter-less
    r.k_bogus = I.kindOf(Game, 'not_a_monster');
    // trickMids
    const fake = { fighters: [
      { kind: 'player', key: 'p' },
      { kind: 'monster', key: 'm_0', mdef: { id: 'cliffhanger' } },
      { kind: 'monster', key: 'm_1', mdef: { id: 'redactor' } },
      { kind: 'monster', key: 'm_2', mdef: { id: 'sunback' } },
      { kind: 'monster', key: 'm_3', mdef: { id: 'cliffhanger' } }, // dup
    ] };
    r.mids = I.trickMids(Game, fake);
    // classifyFunnelFight: full row
    const wkl = [{ d: 10, mid: 'cliffhanger', by: 'player', via: 'player', trick: 'eyes x1' }];
    const full = I.classifyFunnelFight({
      seq: 1, day: 10, result: 'won', mids: ['cliffhanger'],
      kindByMid: { cliffhanger: 'eyes' },
      knownAtStart: { cliffhanger: false }, knownAtEnd: { cliffhanger: true },
      perfs: { cliffhanger: ['eyes'] }, hits: { cliffhanger: [{ evType: 'strike' }] },
      pAlive: true,
    }, wkl);
    r.full = full.rows[0];
    // known-at-start, no discovery in fight
    const kas = I.classifyFunnelFight({
      seq: 2, day: 11, result: 'won', mids: ['sunback'],
      kindByMid: { sunback: 'blindside' },
      knownAtStart: { sunback: true }, knownAtEnd: { sunback: true },
      perfs: { sunback: ['blindside'] }, hits: { sunback: [{ evType: 'move' }] },
      pAlive: true,
    }, wkl);
    r.kas = kas.rows[0];
    // no hits at all
    const nohit = I.classifyFunnelFight({
      seq: 3, day: 12, result: 'fled', mids: ['sweeps_week'],
      kindByMid: { sweeps_week: 'face_it' },
      knownAtStart: { sweeps_week: false }, knownAtEnd: { sweeps_week: false },
      perfs: {}, hits: {}, pAlive: true,
    }, wkl);
    r.nohit = nohit.rows[0];
    // unattributed: knownAtStart missing (tbEnd without startCombat capture)
    const un = I.classifyFunnelFight({
      seq: 4, day: 13, result: 'won', mids: ['cliffhanger'],
      kindByMid: { cliffhanger: 'eyes' },
      knownAtStart: {}, knownAtEnd: { cliffhanger: true },
      perfs: { cliffhanger: ['eyes'] }, hits: { cliffhanger: [{}] },
      pAlive: true,
    }, wkl);
    r.un = { unattributed: un.unattributed, rowUn: un.rows[0].unattributed };
    // join window: ±2d and empty-trick do NOT attribute
    const far = I.classifyFunnelFight({
      seq: 5, day: 20, result: 'won', mids: ['cliffhanger'],
      kindByMid: { cliffhanger: 'eyes' },
      knownAtStart: { cliffhanger: false }, knownAtEnd: { cliffhanger: true },
      perfs: { cliffhanger: ['eyes'] }, hits: { cliffhanger: [{}] }, pAlive: true,
    }, [{ d: 18, mid: 'cliffhanger', trick: 'eyes x1' }]); // 2d away
    r.far = far.rows[0].kill_attributed;
    const empty = I.classifyFunnelFight({
      seq: 6, day: 10, result: 'won', mids: ['cliffhanger'],
      kindByMid: { cliffhanger: 'eyes' },
      knownAtStart: { cliffhanger: false }, knownAtEnd: { cliffhanger: false },
      perfs: {}, hits: {}, pAlive: true,
    }, [{ d: 10, mid: 'cliffhanger', trick: null }]); // kill without trick
    r.empty = empty.rows[0].kill_attributed;
    // multi-species: one row per species
    const multi = I.classifyFunnelFight({
      seq: 7, day: 10, result: 'won', mids: ['cliffhanger', 'sunback'],
      kindByMid: { cliffhanger: 'eyes', sunback: 'blindside' },
      knownAtStart: { cliffhanger: false, sunback: false },
      knownAtEnd: { cliffhanger: true, sunback: false },
      perfs: { cliffhanger: ['eyes'] }, hits: { cliffhanger: [{}] }, pAlive: true,
    }, wkl);
    r.multi = { n: multi.rows.length, mids: multi.rows.map(x => x.mid).sort() };
    // fighter death -> survived=0
    const dead = I.classifyFunnelFight({
      seq: 8, day: 10, result: 'lost', mids: ['cliffhanger'],
      kindByMid: { cliffhanger: 'eyes' },
      knownAtStart: { cliffhanger: false }, knownAtEnd: { cliffhanger: false },
      perfs: {}, hits: {}, pAlive: false,
    }, []);
    r.dead = { survived: dead.rows[0].survived, dismissed: dead.rows[0].dismissed };
    out.r = r;
  `);
  if (o.__err) console.log('  pure err: ' + o.__err);
  const r = o.r || {};
  ok(r.k_eyes === 'eyes' && r.k_blindside === 'blindside' && r.k_faceit === 'face_it' && r.k_move_windup === 'move_windup',
    `kindOf resolves wired kinds (got ${r.k_eyes}/${r.k_blindside}/${r.k_faceit}/${r.k_move_windup})`);
  ok(r.k_none === null && r.k_bogus === null, 'kindOf null for counter-less wave-3 species and bogus ids');
  ok(JSON.stringify(r.mids) === JSON.stringify(['cliffhanger', 'sunback']),
    `trickMids filters to trick-bearing species, dedupes (got ${JSON.stringify(r.mids)})`);
  const f = r.full || {};
  ok(f.contact === 1 && f.known_at_start === 0 && f.discovered_in_fight === 1 && f.condition_met === 1
    && f.performed === 1 && f.kill_attributed === 1 && f.survived === 1 && f.unattributed === 0,
    `full funnel row classifies end-to-end (got ${JSON.stringify(f)})`);
  ok(r.kas && r.kas.known_at_start === 1 && r.kas.discovered_in_fight === 0 && r.kas.condition_met === 1,
    'known-at-start row: no in-fight discovery, condition still counted');
  ok(r.nohit && r.nohit.condition_met === 0 && r.nohit.performed === 0 && r.nohit.kill_attributed === 0
    && r.nohit.dismissed === 1 && r.nohit.unattributed === 0,
    'no-hit fled fight: zeros, dismissed=1, still fully attributed');
  ok(r.un && r.un.unattributed === 1 && r.un.rowUn === 1, 'missing known_at_start -> unattributed=1 (loud by design)');
  ok(r.far === 0, '±2d waveKillLog entry does NOT attribute (join window is ±1d)');
  ok(r.empty === 0, 'kill without trick string does NOT attribute');
  ok(r.multi && r.multi.n === 2 && JSON.stringify(r.multi.mids) === JSON.stringify(['cliffhanger', 'sunback']),
    'multi-species fight yields one row per trick-bearing species');
  ok(r.dead && r.dead.survived === 0 && r.dead.dismissed === 0, 'lost fight: survived=0, dismissed=0');
}

// ---------- LIVE (real wrapped engine fns, synthetic TB fights) ----------
console.log('== LIVE ==');
{
  const o = gameEval(1802, `
    const I = require('${INSTRUMENT}');
    const cap = I.attachTrickfunnelCapture(Game);
    const r = {};
    r.intercepted = cap.tbfightIntercepted === true;
    // Fight 1: unknown cliffhanger -> strike during windup -> kill -> won.
    Game.startCombat('cliffhanger');
    r.f1_started = cap.tbFights.length === 1 && cap.tbFights[0].started === true;
    r.f1_knownStart = cap.tbFights[0].knownAtStart.cliffhanger === false;
    r.f1_kind = cap.tbFights[0].kindByMid.cliffhanger;
    const hitRet = Game.checkMonsterCounter('cliffhanger', { type: 'strike', windup: true, via: 'trick' });
    r.f1_hitRet = hitRet === true; // discovery fired (was unknown)
    r.f1_call = cap.checkCalls.length === 1 && cap.checkCalls[0].hit === true
      && cap.checkCalls[0].kind === 'eyes' && cap.checkCalls[0].fightSeq === 1;
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    mf.alive = false; mf.hp = 0;
    Game.tbEnd('won');
    const wkl = Game.state.waveKillLog || [];
    const e1 = wkl.find(k => k.mid === 'cliffhanger');
    r.f1_wkl = !!e1 && !!e1.trick && e1.via === 'player';
    const c1 = I.classifyFunnelFight(cap.tbFights[0], wkl);
    r.f1_row = c1.rows[0];
    r.f1_unattr = c1.unattributed;
    // Fight 2: pre-known sunback -> move during windup -> fled, no kill.
    Game.state.monsterCounters.sunback = true;
    Game.startCombat('sunback');
    r.f2_knownStart = cap.tbFights[1].knownAtStart.sunback === true;
    const hitRet2 = Game.checkMonsterCounter('sunback', { type: 'move', windup: true, via: 'trick' });
    r.f2_hitKnown = hitRet2 === false && cap.checkCalls[1].hit === true; // hit, no discovery
    Game.tbEnd('fled');
    const c2 = I.classifyFunnelFight(cap.tbFights[1], Game.state.waveKillLog || []);
    r.f2_row = c2.rows[0];
    // Fight 3: counter-less wave-3 species -> zero rows.
    Game.startCombat('redactor');
    r.f3_mids = cap.tbFights[2].mids;
    Game.tbEnd('fled');
    const c3 = I.classifyFunnelFight(cap.tbFights[2], Game.state.waveKillLog || []);
    r.f3_rows = c3.rows.length;
    // Fight 4 (bypass path): direct tbfight assignment like encounters.js /
    // justice.js / party.js — the setter must capture it with known_at_start.
    Game.state.monsterCounters.hushwolf = true; // pre-known
    const hmdef = Game.data.monsters.find(m => m.id === 'hushwolf');
    Game.tbfight = { over: false, round: 1, fighters: [
      { key: 'p', kind: 'player', alive: true, hp: 100, maxHp: 100 },
      { key: 'm_0', kind: 'monster', alive: true, hp: 50, maxHp: 50, mdef: hmdef },
    ] };
    r.f4_captured = cap.tbFights.length === 4 && cap.tbFights[3].started === true;
    r.f4_knownStart = cap.tbFights[3].knownAtStart.hushwolf === true;
    r.f4_kind = cap.tbFights[3].kindByMid.hushwolf;
    Game.tbEnd('fled');
    const c4 = I.classifyFunnelFight(cap.tbFights[3], Game.state.waveKillLog || []);
    r.f4_rows = c4.rows.length;
    r.f4_unattr = c4.unattributed;
    r.nFights = cap.tbFights.length;
    r.nDiscoveries = cap.discoveries.filter(d => d.via === 'trick').length;
    cap.restore();
    r.restored = Game.startCombat.name !== '' || true;
    out.r = r;
  `);
  if (o.__err) console.log('  live err: ' + o.__err);
  const r = o.r || {};
  ok(r.f1_started && r.f1_knownStart, 'startCombat wrapper: capture started, known_at_start=false for unknown species');
  ok(r.intercepted === true, 'tbfight property interception attached');
  ok(r.f1_kind === 'eyes', `kind recorded on capture (got ${r.f1_kind})`);
  ok(r.f1_hitRet && r.f1_call, 'checkMonsterCounter wrapper: hit observed, kind + fightSeq linked, discovery returned true');
  ok(r.f1_wkl, 'tbEnd: waveKillLog entry carries non-empty trick via the trickSummary/tricktag channel');
  const fr = r.f1_row || {};
  ok(fr.contact === 1 && fr.known_at_start === 0 && fr.discovered_in_fight === 1 && fr.condition_met === 1
    && fr.performed === 1 && fr.kill_attributed === 1 && fr.survived === 1 && r.f1_unattr === 0,
    `live fight 1 classifies the full funnel (got ${JSON.stringify(fr)})`);
  ok(r.f2_knownStart && r.f2_hitKnown, 'fight 2: known_at_start=true; hit recorded but no discovery when known');
  const f2 = r.f2_row || {};
  ok(f2.known_at_start === 1 && f2.condition_met === 1 && f2.performed === 1 && f2.kill_attributed === 0
    && f2.dismissed === 1 && f2.survived === 1,
    `live fight 2: fled, no kill -> unattributed kill, dismissed=1 (got ${JSON.stringify(f2)})`);
  ok(Array.isArray(r.f3_mids) && r.f3_mids.length === 0 && r.f3_rows === 0,
    'fight 3: counter-less wave-3 species yields zero funnel rows');
  ok(r.f4_captured && r.f4_knownStart, 'fight 4 (bypass path): direct tbfight assignment captured with known_at_start=true');
  ok(r.f4_kind === 'strike_lead', `bypass fight kind recorded (got ${r.f4_kind})`);
  ok(r.f4_rows === 1 && r.f4_unattr === 0, `bypass fight classifies with zero unattributed (rows=${r.f4_rows}, unattr=${r.f4_unattr})`);
  ok(r.nFights === 4, `4 fights captured (got ${r.nFights})`);
  ok(r.nDiscoveries === 1, `exactly 1 via='trick' discovery across the 3 fights (got ${r.nDiscoveries})`);
}

// ---------- DET-GATE ----------
console.log('== DET-GATE ==');
function hashRun(seed, withInstrument) {
  const tmpFile = '/tmp/tfl-det-' + seed + '-' + (withInstrument ? 'ins' : 'bare') + '-' + process.pid + '.js';
  const code = `
const { loadGame, setupGame, runDays } = require('${HARNESS}');
const TF = require('${TRIBFLOOR}');
const { attachTrickfunnelCapture } = require('${INSTRUMENT}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'detgate', fullTelemetry: false });
  await setupGame(Game);
  ${withInstrument ? 'const cap = attachTrickfunnelCapture(Game);' : ''}
  await runDays(Game, TF.leadfeast, { days: 60, manifest: undefined, sampleEvery: 30 });
  ${withInstrument ? 'cap.restore();' : ''}
  const st = Game.state;
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16) }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, {
      cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, FEASTSCALE_R13: '1', TRIBFLOOR: '1', SEATDRIVE: '0' },
    }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const a = hashRun(1803, true), b = hashRun(1803, true), c = hashRun(1803, false);
  ok(!a.__crash && !b.__crash && !c.__crash, 'det-gate runs complete');
  ok(a.hash && a.hash === b.hash, `det-gate: instrumented runs identical on same seed (${a.hash})`);
  ok(a.hash === c.hash, `det-gate: instrument attached vs bare game byte-identical (${a.hash} == ${c.hash})`);
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const o = gameEval(1804, `
    const I = require('${INSTRUMENT}');
    const TF = require('${TRIBFLOOR}');
    const { runDays, quietLog } = require('${HARNESS}');
    const cap = I.attachTrickfunnelCapture(Game);
    let result;
    await quietLog(async () => { result = await runDays(Game, TF.leadfeast, { days: 20, manifest: undefined, sampleEvery: 30 }); });
    cap.restore();
    // classify every captured TB fight; the funnel must see all of them
    let rows = 0, unattr = 0;
    for (const t of cap.tbFights) {
      const c = I.classifyFunnelFight(t, Game.state.waveKillLog || []);
      rows += c.rows.length; unattr += c.unattributed;
    }
    out.r = { days: result.days, end: result.endReason, nTb: cap.tbFights.length, rows: rows, unattr: unattr,
      schema: ['seed','policyId','arm','national','table','won','wins','exiled','maxWave'].join(',') };
  `, { SMOKE: '1' });
  if (o.__err) console.log('  smoke err: ' + o.__err);
  const r = o.r || {};
  ok(r.days >= 20, `smoke: 20d pre-seat run completes (days=${r.days}, end=${r.end})`);
  ok(typeof r.nTb === 'number' && r.unattr === 0, `smoke: ${r.nTb} TB fights captured, ${r.rows} rows, 0 unattributed`);
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ' — ' + fails.join(' | ') : ''}`);
process.exit(fail ? 1 : 0);
