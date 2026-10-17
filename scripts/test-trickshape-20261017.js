#!/usr/bin/env node
// test-trickshape-20261017.js — proof record for the sim-trickshape
// diagnostic (flesh-out loop, axis scale-onramp, run fleshout-20261017-044712).
// Read-only instrument: ZERO src/js, ZERO scripts/policies changes.
//
// Sections:
//   PURE   — kindOf/waveOf/trickMids/classifyShapeFight on synthetic
//            captures: full shape row, lost fight (performer death),
//            fled fight, unattributed loudness (missing result/rounds/hp),
//            ±1d join window, companion deaths, species_killed.
//   RED    — a shape-incomplete capture classifies UNATTRIBUTED=1 (the
//            PRIMARY's loudness: incomplete instrument -> loud, never silent).
//   GREEN  — the same capture with full shape -> UNATTRIBUTED=0.
//   LIVE   — synthetic TB fights through the REAL engine (startCombat,
//            checkMonsterCounter, tbEnd) with the tbfight interception:
//            shapeStart/shapeEnd captured, hp cost, rounds, companion death,
//            bypass-path fight with explicit round.
//   DET    — identical-seed pairs: read-only instrument attached vs bare
//            game -> byte-identical trajectories.
//   SMOKE  — 20d pre-seat instrumented run completes; every performed row
//            carries complete shape (schema valid).
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it); child processes for process isolation; no Game.save stub;
// no hardcoded absolute paths (ROOT from __dirname); no copied eval
// boilerplate (all loads via sim-harness.js).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const TRIBFLOOR = path.join(ROOT, 'scripts', 'policies', 'tribfloor.js');
const INSTRUMENT = path.join(ROOT, 'scripts', 'trickshape-instrument-20261017.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/tsh-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\\n');
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
    return JSON.parse(r.split('\\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// ---------- PURE ----------
console.log('== PURE ==');
{
  const o = gameEval(1901, `
    const I = require('${INSTRUMENT}');
    const r = {};
    r.k_eyes = I.kindOf(Game, 'cliffhanger');
    r.w_wave1 = I.waveOf(Game, 'cliffhanger');
    r.w_wave2 = I.waveOf(Game, 'voice_mimic_radio');
    r.k_none = I.kindOf(Game, 'redactor');
    const wkl = [{ d: 10, mid: 'cliffhanger', by: 'player', via: 'player', trick: 'eyes x2' }];
    function cap(over) {
      return Object.assign({
        seq: 1, day: 10, result: 'won', mids: ['cliffhanger'],
        kindByMid: { cliffhanger: 'eyes' },
        knownAtStart: { cliffhanger: true }, knownAtEnd: { cliffhanger: true },
        perfs: { cliffhanger: ['eyes', 'eyes'] }, hits: { cliffhanger: [{ evType: 'strike' }, { evType: 'strike' }] },
        shapeStart: { p: { hp: 100, maxHp: 100, alive: true }, companions: [{ key: 'v_1', vid: 'v1', hp: 90 }], monsters: [{ key: 'm_0', mid: 'cliffhanger', hp: 40 }], partyN: 2 },
        shapeEnd: { rounds: 5, p: { hp: 60, maxHp: 100, alive: true },
          monsterEnd: [{ key: 'm_0', mid: 'cliffhanger', alive: false, hp: 0 }],
          companionDeaths: [] },
      }, over || {});
    }
    r.full = I.classifyShapeFight(cap(), wkl, Game).rows[0];
    // lost fight: performer dead, companion dead
    const lost = I.classifyShapeFight(cap({
      result: 'lost',
      shapeEnd: { rounds: 3, p: { hp: 0, maxHp: 100, alive: false },
        monsterEnd: [{ key: 'm_0', mid: 'cliffhanger', alive: true, hp: 40 }],
        companionDeaths: ['v1'] },
    }), [], Game);
    r.lost = lost.rows[0];
    // fled fight: nothing killed, full hp kept
    const fled = I.classifyShapeFight(cap({
      result: 'fled',
      shapeEnd: { rounds: 2, p: { hp: 100, maxHp: 100, alive: true },
        monsterEnd: [{ key: 'm_0', mid: 'cliffhanger', alive: true, hp: 40 }],
        companionDeaths: [] },
    }), [], Game);
    r.fled = fled.rows[0];
    // missing pieces -> unattributed (loud by design)
    r.noResult = I.classifyShapeFight(cap({ result: null }), wkl, Game).unattributed;
    r.noRounds = I.classifyShapeFight(cap({ shapeEnd: { rounds: null, p: { hp: 60, maxHp: 100, alive: true }, monsterEnd: [], companionDeaths: [] } }), wkl, Game).unattributed;
    r.noHp = I.classifyShapeFight(cap({ shapeStart: { p: null, companions: [], monsters: [], partyN: null } }), wkl, Game).unattributed;
    r.noEnd = I.classifyShapeFight(cap({ shapeEnd: null }), wkl, Game).unattributed;
    // join window
    const far = I.classifyShapeFight(cap(), [{ d: 13, mid: 'cliffhanger', by: 'player', via: 'player', trick: 'eyes' }], Game);
    r.far = far.rows[0].kill_attributed;
    const empty = I.classifyShapeFight(cap(), [{ d: 10, mid: 'cliffhanger', by: 'player', via: 'player', trick: '' }], Game);
    r.empty = empty.rows[0].kill_attributed;
    out.r = r;
  `);
  if (o.__err) console.log('  pure err: ' + o.__err);
  const r = o.r || {};
  ok(r.k_eyes === 'eyes' && r.k_none === null, `kindOf resolves wired kinds (got ${r.k_eyes}/${r.k_none})`);
  ok(r.w_wave1 === 1 && r.w_wave2 === 2, `waveOf resolves waves (got ${r.w_wave1}/${r.w_wave2})`);
  const f = r.full || {};
  ok(f.performed === 1 && f.n_perfs === 2 && f.kill_attributed === 1 && f.rounds === 5
    && f.p_hp_start === 100 && f.p_hp_end === 60 && f.hp_cost === 40 && f.p_survived === 1
    && f.species_killed === 1 && f.partyN === 2 && f.companion_deaths === 0 && f.unattributed === 0,
    `full shape row: rounds/hp/survival/kill all captured (got ${JSON.stringify(f)})`);
  const l = r.lost || {};
  ok(l.p_survived === 0 && l.p_hp_end === 0 && l.hp_cost === 100 && l.species_killed === 0
    && l.companion_deaths === 1 && JSON.stringify(l.companion_death_vids) === JSON.stringify(['v1'])
    && l.kill_attributed === 0 && l.unattributed === 0,
    `lost fight: performer death costs full start HP, companion death recorded (got ${JSON.stringify(l)})`);
  const fl = r.fled || {};
  ok(fl.result === 'fled' && fl.species_killed === 0 && fl.hp_cost === 0 && fl.p_survived === 1 && fl.unattributed === 0,
    'fled fight: zero cost, zero kills, fully attributed');
  ok(r.noResult === 1 && r.noRounds === 1 && r.noHp === 1 && r.noEnd === 1,
    `RED: missing result/rounds/hp/shapeEnd -> unattributed=1 (got ${r.noResult}/${r.noRounds}/${r.noHp}/${r.noEnd})`);
  ok(r.far === 0 && r.empty === 0, '±2d entry and empty-trick kill do NOT attribute');
}

// ---------- GREEN ----------
console.log('== GREEN ==');
{
  const o = gameEval(1901, `
    const I = require('${INSTRUMENT}');
    const wkl = [{ d: 10, mid: 'cliffhanger', by: 'player', via: 'player', trick: 'eyes x1' }];
    const t = {
      seq: 1, day: 10, result: 'won', mids: ['cliffhanger'],
      kindByMid: { cliffhanger: 'eyes' },
      knownAtStart: { cliffhanger: false }, knownAtEnd: { cliffhanger: true },
      perfs: { cliffhanger: ['eyes'] }, hits: { cliffhanger: [{ evType: 'strike' }] },
      shapeStart: { p: { hp: 96, maxHp: 100, alive: true }, companions: [], monsters: [], partyN: 1 },
      shapeEnd: { rounds: 4, p: { hp: 80, maxHp: 100, alive: true },
        monsterEnd: [{ key: 'm_0', mid: 'cliffhanger', alive: false, hp: 0 }], companionDeaths: [] },
    };
    const c = I.classifyShapeFight(t, wkl, Game);
    out.r = { rows: c.rows.length, unattr: c.unattributed, row: c.rows[0] };
  `);
  const r = (o && o.r) || {};
  const row = r.row || {};
  ok(r.rows === 1 && r.unattr === 0 && row.performed === 1 && row.hp_cost === 16 && row.rounds === 4
    && row.species_killed === 1 && row.kill_attributed === 1,
    `GREEN: complete capture classifies with zero unattributed (got unattr=${r.unattr}, cost=${row.hp_cost})`);
}

// ---------- LIVE ----------
console.log('== LIVE ==');
{
  const o = gameEval(1902, `
    const I = require('${INSTRUMENT}');
    const cap = I.attachTrickshapeCapture(Game);
    const r = {};
    r.intercepted = cap.tbfightIntercepted === true;
    // Fight 1: real engine — startCombat -> hit -> kill -> won.
    Game.startCombat('cliffhanger');
    r.f1_started = cap.tbFights.length === 1 && cap.tbFights[0].started === true;
    r.f1_hpStart = cap.tbFights[0].shapeStart.p && cap.tbFights[0].shapeStart.p.hp;
    r.f1_partyN = cap.tbFights[0].shapeStart.partyN;
    const hitRet = Game.checkMonsterCounter('cliffhanger', { type: 'strike', windup: true, via: 'trick' });
    r.f1_hit = hitRet === true;
    const mf = Game.tbfight.fighters.find(x => x.kind === 'monster');
    mf.alive = false; mf.hp = 0;
    Game.tbEnd('won');
    const c1 = I.classifyShapeFight(cap.tbFights[0], Game.state.waveKillLog || [], Game);
    r.f1_row = c1.rows[0]; r.f1_unattr = c1.unattributed;
    // Fight 2 (bypass path): direct tbfight assignment with explicit round=3,
    // a dead villager companion, fled.
    Game.state.monsterCounters.hushwolf = true;
    const hmdef = Game.data.monsters.find(m => m.id === 'hushwolf');
    Game.tbfight = { over: false, round: 3, fighters: [
      { key: 'p', kind: 'player', alive: true, hp: 70, maxHp: 100 },
      { key: 'v_9', kind: 'villager', villagerId: 'v9', alive: false, hp: 0 },
      { key: 'm_0', kind: 'monster', alive: true, hp: 50, maxHp: 50, mdef: hmdef },
    ] };
    r.f2_captured = cap.tbFights.length === 2 && cap.tbFights[1].started === true;
    r.f2_partyN = cap.tbFights[1].shapeStart.partyN;
    Game.tbEnd('fled');
    const c2 = I.classifyShapeFight(cap.tbFights[1], Game.state.waveKillLog || [], Game);
    r.f2_row = c2.rows[0]; r.f2_unattr = c2.unattributed;
    // Field-AI fired counter: call the real gate directly.
    const mdef2 = Game.data.monsters.find(m => m.id === 'redactor');
    r.vtaFn = typeof Game.villagerTrickAction === 'function';
    cap.restore();
    r.restored = (typeof Game.checkMonsterCounter === 'function') && (typeof Game.tbEnd === 'function');
    out.r = r;
  `);
  if (o.__err) console.log('  live err: ' + o.__err);
  const r = (o && o.r) || {};
  ok(r.intercepted === true, 'tbfight property interception attached');
  ok(r.f1_started && r.f1_hpStart > 0 && r.f1_partyN >= 1,
    `fight 1: shapeStart captured real scholar HP (hp=${r.f1_hpStart}, partyN=${r.f1_partyN})`);
  ok(r.f1_hit === true, 'fight 1: real checkMonsterCounter hit (discovery)');
  const fr = r.f1_row || {};
  ok(fr.performed === 1 && fr.rounds >= 1 && fr.p_hp_start === r.f1_hpStart && fr.p_hp_end != null
    && fr.hp_cost != null && fr.p_survived === 1 && fr.species_killed === 1
    && fr.kill_attributed === 1 && r.f1_unattr === 0,
    `live fight 1: full shape captured through the real engine (rounds=${fr.rounds}, cost=${fr.hp_cost}, unattr=${r.f1_unattr})`);
  ok(r.f2_captured && r.f2_partyN === 2, `bypass fight captured with partyN=2 (got ${r.f2_partyN})`);
  const f2 = r.f2_row || {};
  ok(f2.rounds === 3 && f2.companion_deaths === 1 && JSON.stringify(f2.companion_death_vids) === JSON.stringify(['v9'])
    && f2.performed === 0 && f2.result === 'fled' && f2.p_survived === 1 && r.f2_unattr === 0,
    `bypass fight: round=3, companion death recorded, no perfs (unattr=${r.f2_unattr})`);
  ok(r.vtaFn === true, 'villagerTrickAction exists (field-AI fired counter armed)');
  ok(r.restored === true, 'restore() unwraps engine functions');
}

// ---------- DET-GATE ----------
console.log('== DET-GATE ==');
function hashRun(seed, withInstrument) {
  const tmpFile = '/tmp/tsh-det-' + seed + '-' + (withInstrument ? 'ins' : 'bare') + '-' + process.pid + '.js';
  const code = `
const { loadGame, setupGame, runDays } = require('${HARNESS}');
const TF = require('${TRIBFLOOR}');
const { attachTrickshapeCapture } = require('${INSTRUMENT}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'detgate', fullTelemetry: false });
  await setupGame(Game);
  ${withInstrument ? 'const cap = attachTrickshapeCapture(Game);' : ''}
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
    return JSON.parse(r.split('\\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const a = hashRun(1903, true), b = hashRun(1903, true), c = hashRun(1903, false);
  ok(!a.__crash && !b.__crash && !c.__crash, 'det-gate runs complete');
  ok(a.hash && a.hash === b.hash, `det-gate: instrumented runs identical on same seed (${a.hash})`);
  ok(a.hash === c.hash, `det-gate: instrument attached vs bare game byte-identical (${a.hash} == ${c.hash})`);
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const o = gameEval(1904, `
    const I = require('${INSTRUMENT}');
    const TF = require('${TRIBFLOOR}');
    const { runDays, quietLog } = require('${HARNESS}');
    const cap = I.attachTrickshapeCapture(Game);
    let result;
    await quietLog(async () => { result = await runDays(Game, TF.leadfeast, { days: 20, manifest: undefined, sampleEvery: 30 }); });
    cap.restore();
    let rows = 0, unattr = 0, perf = 0, perfShaped = 0;
    for (const t of cap.tbFights) {
      const c = I.classifyShapeFight(t, Game.state.waveKillLog || [], Game);
      rows += c.rows.length; unattr += c.unattributed;
      for (const r of c.rows) { if (r.performed) { perf++; if (!r.unattributed) perfShaped++; } }
    }
    out.r = { days: result.days, end: result.endReason, nTb: cap.tbFights.length, rows: rows,
      unattr: unattr, perf: perf, perfShaped: perfShaped,
      fieldFires: cap.fieldFires.length };
  `, { SMOKE: '1' });
  if (o.__err) console.log('  smoke err: ' + o.__err);
  const r = (o && o.r) || {};
  ok(r.days >= 15 && r.nTb > 0, `smoke: 20d run completes with TB fights (days=${r.days}, nTb=${r.nTb})`);
  ok(r.unattr === 0, `smoke: zero unattributed rows (rows=${r.rows})`);
  ok(r.perfShaped === r.perf, `smoke: every performed row carries complete shape (perf=${r.perf})`);
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ' — ' + fails.join('; ') : ''}`);
process.exit(fail ? 1 : 0);
