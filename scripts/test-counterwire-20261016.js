#!/usr/bin/env node
// test-counterwire-20261016.js — proof record for the sim-counterwire arm
// (axis scale-onramp): EXTEND THE LEDGER CONVENTION TO WAVE-3+.
//
// What changed (game code):
//   game.js — villagerTrickDefs() promoted to waves 3-5 (26 entries: 6 w3
//     unwired + 10 w4 + 10 w5); checkMonsterCounter gains blindside/face_it/
//     eyes cases + f.trickLog performance logging; tbEnd kill loop passes
//     trickSummary(f) as recordWaveKill detail.
//   fieldFights.js — villagerTrickAction: 15 per-species actuable gates;
//     resolution branches for the new trick actions; redactor starve
//     weakening in the damage section.
//   sigW3a.js — sigFieldGavel: confess halves the verdict (on the record).
//   sigW3c.js — callback farewell disables face-shift bonus; ad_break
//     look-away starves the heal.
//   sigW4.js — strike stand-down, congregation argue, eulogy contradict
//     (verse restore, 3 = kindly dismissed), algorithm tank (halved).
//   sigW5.js — spoiler prone (cheap fulfillment), network_note bad_note
//     (buff misfires).
//
// Sections:
//   DEFS   — the 26 trick defs exist, canon-faithful spot checks.
//   OBS    — synthetic observations wire w4/w5 species into villagerTricks;
//            villageKnowsTrick sees them.
//   GATES  — each of the 15 actuable gates returns its action when known.
//   RESOLVE— the sig-hook effects fire on the rec flags (redactor starve,
//            gavel confess, focus bore-out, tos loophole, callback farewell,
//            ad_break look-away, strike stand-down, eulogy contradict,
//            algorithm tank, congregation argue, spoiler prone, network_note
//            bad_note, suburb leave, nielsen boring).
//   KINDS  — the 3 dead perform-kinds now discover via checkMonsterCounter;
//            f.trickLog records performances.
//   TBATTR — recordWaveKill carries the trick detail into waveKillLog.
//   DET    — trajectory-identical: instrument attached vs bare game
//            byte-identical on identical seeds.
//   SMOKE  — 20-day run green; per-seed JSON schema-valid.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const TRIBFLOOR = path.join(ROOT, 'scripts', 'policies', 'tribfloor.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/cw2-synth-' + seed + '-' + process.pid + '.js';
  const envLines = Object.entries(env || {}).map(([k, v]) => `process.env.${k} = '${v}';`).join('\n');
  const code = `
${envLines}
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 600); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// ---------- DEFS ----------
console.log('== DEFS ==');
{
  const o = gameEval(702, `
    const defs = Game.villagerTrickDefs();
    out.n = Object.keys(defs).length;
    out.ids = Object.keys(defs).sort();
    for (const [k, v] of Object.entries(defs)) {
      if (!v.trick || !v.reveal) out['bad_' + k] = true;
    }
    // canon-faithful spot checks: the trick text must name the canon mechanic
    out.redactor = /quiet/i.test(defs.redactor.trick) && /starve/i.test(defs.redactor.reveal);
    out.gavel = /confess/i.test(defs.gavel.trick);
    out.focus = /boring/i.test(defs.focus_group.trick) && /LEAVE/.test(defs.focus_group.reveal);
    out.tos = /loophole/i.test(defs.terms_of_service.reveal);
    out.callback = /goodbye/i.test(defs.callback.trick);
    out.adbreak = /look away/i.test(defs.ad_break.trick);
    out.eater = /poison/i.test(defs.eater.trick);
    out.spoiler = /prone/i.test(defs.spoiler.trick);
    out.nielsen = /boring/i.test(defs.nielsen.trick);
    out.suburb = /leave/i.test(defs.suburb.trick);
    out.eulogy = /contradict/i.test(defs.eulogy.trick);
    out.strike = /demand/i.test(defs.strike.trick);
    out.algorithm = /lose on purpose/i.test(defs.algorithm.trick);
    out.congregation = /argue/i.test(defs.congregation.trick);
    out.network = /bad notes/i.test(defs.network_note.trick);
    out.w6absent = !defs.network_heart && !defs.network_limb && !defs.network_tower;
  `);
  if (o.__err) console.log('  defs err: ' + o.__err);
  ok(o.n === 29, `villagerTrickDefs has 29 entries (26 new + 3 kept), got ${o.n}`);
  const expect = ['redactor', 'gavel', 'focus_group', 'terms_of_service', 'callback', 'ad_break',
    'congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald',
    'cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'finale_crew', 'finale_opening', 'network_note',
    'spool', 'chorus_line', 'buffering'];
  ok(expect.every(id => (o.ids || []).includes(id)), 'all 26 new + 3 kept ids present');
  ok(!Object.keys(o).some(k => k.startsWith('bad_')), 'every def has trick + reveal');
  for (const k of ['redactor', 'gavel', 'focus', 'tos', 'callback', 'adbreak', 'eater', 'spoiler', 'nielsen', 'suburb', 'eulogy', 'strike', 'algorithm', 'congregation', 'network']) {
    ok(o[k] === true, `canon-faithful: ${k}`);
  }
  ok(o.w6absent === true, 'wave-6 has no entries (canon-doc silent, documented blank)');
}

// ---------- OBS ----------
console.log('== OBS ==');
{
  const o = gameEval(703, `
    const seq = [];
    seq.push(['knowsEater0', Game.villageKnowsTrick('eater')]);
    seq.push(['obs1', Game.noteVillagerTrickObservation('v_1', 'eater')]);
    seq.push(['obs2', Game.noteVillagerTrickObservation('v_2', 'eater')]);
    seq.push(['vtEater', !!(Game.state.villagerTricks || {}).eater]);
    seq.push(['knowsEater', Game.villageKnowsTrick('eater')]);
    seq.push(['obsCx1', Game.noteVillagerTrickObservation('v_1', 'cancellation')]);
    seq.push(['obsCx2', Game.noteVillagerTrickObservation('v_2', 'cancellation')]);
    seq.push(['vtCx', !!(Game.state.villagerTricks || {}).cancellation]);
    seq.push(['knowsRedactor', Game.villageKnowsTrick('redactor')]);
    const tele = (Game.state.telemetry || []).filter(e => e.type === 'counter_discovered');
    out.seq = seq;
    out.teleIds = tele.map(e => e.id);
  `);
  if (o.__err) console.log('  obs err: ' + o.__err);
  const m = Object.fromEntries(o.seq || []);
  ok(m.knowsEater0 === false, 'eater unknown before observations');
  ok(m.obs1 === false && m.obs2 === true && m.vtEater === true, 'two villager observations wire eater into villagerTricks');
  ok(m.knowsEater === true, 'villageKnowsTrick sees eater after wiring');
  ok(m.obsCx1 === false && m.obsCx2 === true && m.vtCx === true, 'cancellation (w5) wires the same way');
  ok(m.knowsRedactor === false, 'redactor still unknown (no observations yet)');
  ok((o.teleIds || []).includes('eater') && (o.teleIds || []).includes('cancellation'), 'counter_discovered tele fires for w4/w5 wiring');
}

// ---------- GATES ----------
console.log('== GATES ==');
{
  const o = gameEval(704, `
    const results = {};
    function gate(mid, fctxExtra) {
      Game.state.villagerTricks = Game.state.villagerTricks || {};
      Game.state.villagerTricks[mid] = true;
      const mdef = (Game.data.monsters || []).find(m => m.id === mid);
      const rec = { trickLog: [] };
      const fctx = Object.assign({ round: 1, vHp: 100, vHpMax: 100, lead: { hp: 50 }, rec: rec, vp: {}, members: [{ sigG: { trial: { crime: 'x' } }, sigR: {} }] }, fctxExtra || {});
      // give the test villager food for the meet_demand gate
      Game.data.villagers = Game.data.villagers || [];
      const r = Game.villagerTrickAction('player', mdef, fctx);
      delete Game.state.villagerTricks[mid];
      return r;
    }
    // stub food for strike gate
    const _hvf = Game.villagerHasFood, _sf = Game.villagerSpendFood;
    Game.villagerHasFood = () => true; Game.villagerSpendFood = () => 'jerky';
    results.redactor = gate('redactor');
    results.gavel = gate('gavel');
    results.focus = gate('focus_group');
    results.tos = gate('terms_of_service');
    results.callback = gate('callback');
    results.adbreak = gate('ad_break', { round: 4 });
    results.adbreakOff = gate('ad_break', { round: 3 });
    results.strike = gate('strike', { vHp: 50 });
    results.strikeHealthy = gate('strike', { vHp: 90 });
    results.suburb = gate('suburb', { round: 1 });
    results.suburbR2 = gate('suburb', { round: 2 });
    results.eulogy = gate('eulogy');
    results.algorithm = gate('algorithm');
    results.algorithmTanked = gate('algorithm', {});
    results.congregation = gate('congregation', { round: 3 });
    results.congregationOff = gate('congregation', { round: 2 });
    results.nielsen = gate('nielsen');
    results.spoiler = gate('spoiler');
    results.badnote = gate('network_note');
    results.eater = gate('eater');           // knowledge-only: no gate
    results.influencer = gate('influencer'); // knowledge-only: no gate
    Game.villagerHasFood = _hvf; Game.villagerSpendFood = _sf;
    // unknown control: no trick set at all
    {
      const mdef = (Game.data.monsters || []).find(m => m.id === 'redactor');
      results.noTrick = Game.villagerTrickAction('player', mdef, { round: 1, vHp: 100, vHpMax: 100, lead: { hp: 1 }, rec: {}, vp: {}, members: [] });
    }
    out.r = results;
  `);
  if (o.__err) console.log('  gates err: ' + o.__err);
  const r = o.r || {};
  const t = (x) => (x && x.type) || null;
  ok(t(r.redactor) === 'wait' && r.redactor.why === 'redactor-quiet', 'redactor → wait:redactor-quiet');
  ok(t(r.gavel) === 'confess', 'gavel (trial active) → confess');
  ok(t(r.focus) === 'bore', 'focus_group → bore');
  ok(t(r.tos) === 'examine', 'terms_of_service → examine');
  ok(t(r.callback) === 'farewell', 'callback → farewell');
  ok(t(r.adbreak) === 'look_away', 'ad_break (round 4) → look_away');
  ok(t(r.adbreakOff) === null, 'ad_break (round 3) → no trick');
  ok(t(r.strike) === 'meet_demand', 'strike (hurting, has food) → meet_demand');
  ok(t(r.strikeHealthy) === null, 'strike (healthy) → no trick (reactive, not opening)');
  ok(t(r.suburb) === 'leave', 'suburb (round 1) → leave');
  ok(t(r.suburbR2) === null, 'suburb (round 2) → no trick');
  ok(t(r.eulogy) === 'contradict', 'eulogy → contradict');
  ok(t(r.algorithm) === 'wait' && r.algorithm.why === 'algorithm-tank', 'algorithm → wait:algorithm-tank');
  ok(t(r.congregation) === 'argue', 'congregation (round 3) → argue');
  ok(t(r.congregationOff) === null, 'congregation (round 2) → no trick');
  ok(t(r.nielsen) === 'wait' && r.nielsen.why === 'nielsen-boring', 'nielsen (ratings high) → wait:nielsen-boring');
  ok(t(r.spoiler) === null, 'spoiler (spN 0, not fulfillment-eve) → no trick');
  ok(t(r.badnote) === 'bad_note', 'network_note → bad_note');
  ok(t(r.eater) === null && t(r.influencer) === null, 'eater/influencer knowledge-only → no gate (never faked)');
  ok(t(r.noTrick) === null, 'unknown trick → no trick action');
}

// ---------- RESOLVE ----------
console.log('== RESOLVE ==');
{
  const o = gameEval(705, `
    const out2 = {};
    const G = Game;
    function mkrec() { return { log: [], trickLog: [], mDealt: 0, vTaken: 0 }; }
    // --- sigW3cFieldRound: callback farewell ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'callback');
      const rec = mkrec();
      const sigFx = { mSkip: false, vMiss: false, mDmgBonus: 0 };
      G.sigW3cFieldRound(mdef, 'v_1', 3, rec, sigFx, { RR: Math.random, lroll: (r) => r[0], vName: 'Yara', mName: 'Callback', members: [] });
      out2.cbNoMourn = sigFx.mDmgBonus;
      const rec2 = mkrec(); rec2.trickMourned = 1;
      const fx2 = { mSkip: false, vMiss: false, mDmgBonus: 0 };
      G.sigW3cFieldRound(mdef, 'v_1', 3, rec2, fx2, { RR: Math.random, lroll: (r) => r[0], vName: 'Yara', mName: 'Callback', members: [] });
      out2.cbMourned = fx2.mDmgBonus;
      out2.cbMournLog = rec2.log.join(' ').includes('goodbye holds');
    }
    // --- sigW3cFieldRound: ad_break look-away ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'ad_break');
      const lead = { hp: 200, maxHp: 300 };
      const rec = mkrec();
      G.sigW3cFieldRound(mdef, 'v_1', 4, rec, { mSkip: false, vMiss: false, mDmgBonus: 0 }, { RR: Math.random, lroll: (r) => r[0], vName: 'Yara', mName: 'Ad', members: [lead] });
      out2.adHeal = lead.hp - 200;
      const lead2 = { hp: 200, maxHp: 300 };
      const rec2 = mkrec(); rec2.trickUnwatched = 1;
      G.sigW3cFieldRound(mdef, 'v_1', 4, rec2, { mSkip: false, vMiss: false, mDmgBonus: 0 }, { RR: Math.random, lroll: (r) => r[0], vName: 'Yara', mName: 'Ad', members: [lead2] });
      out2.adNoHeal = lead2.hp - 200;
      out2.adFlagConsumed = rec2.trickUnwatched === 0;
    }
    // --- sigFieldGavel: confess halves the verdict ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'gavel');
      const member = { sigG: { trial: { crime: 'COUNT ONE' }, cool: 0 } };
      const rec = mkrec();
      const ctx = { vHp: 500, wb: 5 };
      G.sigFieldMonster(mdef, member, ctx, { vid: 'v_1', vName: 'Yara', mName: 'Gavel', round: 5, RR: Math.random, lroll: (r) => r[0] }, rec);
      out2.gavelPlain = 500 - ctx.vHp;
      const member2 = { sigG: { trial: { crime: 'COUNT ONE' }, cool: 0 } };
      const rec2 = mkrec(); rec2.trickConfess = 1;
      const ctx2 = { vHp: 500, wb: 5 };
      G.sigFieldMonster(mdef, member2, ctx2, { vid: 'v_1', vName: 'Yara', mName: 'Gavel', round: 5, RR: Math.random, lroll: (r) => r[0] }, rec2);
      out2.gavelConfess = 500 - ctx2.vHp;
      out2.gavelFlagConsumed = rec2.trickConfess === 0;
      out2.gavelLog = rec2.log.join(' ').includes('LIGHTER');
    }
    // --- sigW4FieldMonster: strike stand-down / congregation argue / eulogy / algorithm ---
    {
      const lroll = (r) => r[0];
      const RR = Math.random;
      const sm = G.data.monsters.find(m => m.id === 'strike');
      const rec = mkrec(); rec.trickStoodDown = 1;
      const t1 = G.sigW4FieldMonster(sm, rec, { total: 60, round: 5, rr: RR, lroll, vName: 'Yara', mName: 'Strike' });
      out2.strikeDown = t1;
      const rec1b = mkrec();
      const t1b = G.sigW4FieldMonster(sm, rec1b, { total: 60, round: 5, rr: RR, lroll, vName: 'Yara', mName: 'Strike' });
      out2.strikePlain = t1b;
      const cm = G.data.monsters.find(m => m.id === 'congregation');
      const rec2 = mkrec(); rec2.trickArgue = 1;
      const t2 = G.sigW4FieldMonster(cm, rec2, { total: 40, round: 4, rr: RR, lroll, vName: 'Yara', mName: 'Congregation' });
      out2.congArgue = t2;
      const rec2b = mkrec();
      const t2b = G.sigW4FieldMonster(cm, rec2b, { total: 40, round: 4, rr: RR, lroll, vName: 'Yara', mName: 'Congregation' });
      out2.congPlain = t2b;
      const em = G.data.monsters.find(m => m.id === 'eulogy');
      const rec3 = mkrec(); rec3.trickContradict = 1; rec3.trickContradict = 1;
      G.sigW4FieldMonster(em, rec3, { total: 30, round: 1, rr: RR, lroll, vName: 'Yara', mName: 'Eulogy' });
      out2.euVerses1 = rec3.sigW4.euV;
      out2.euContradicts1 = rec3.eulogyContradicts;
      const rec4 = mkrec();
      for (let rd = 1; rd <= 3; rd++) { rec4.trickContradict = 1; G.sigW4FieldMonster(em, rec4, { total: 30, round: rd, rr: RR, lroll, vName: 'Yara', mName: 'Eulogy' }); }
      out2.euOutcome = rec4.outcome;
      const am = G.data.monsters.find(m => m.id === 'algorithm');
      const rec5 = mkrec(); rec5.algorithmTank = 2;
      const t5 = G.sigW4FieldMonster(am, rec5, { total: 80, round: 2, rr: RR, lroll, vName: 'Yara', mName: 'Algorithm' });
      out2.algoTank = t5;
      out2.algoLeft = rec5.algorithmTank;
      const rec5b = mkrec();
      const t5b = G.sigW4FieldMonster(am, rec5b, { total: 80, round: 2, rr: RR, lroll, vName: 'Yara', mName: 'Algorithm' });
      out2.algoPlain = t5b;
    }
    // --- sigW5FieldMonster: spoiler prone / network_note bad_note ---
    {
      const lroll = (r) => r[0];
      const RR = Math.random;
      const spm = G.data.monsters.find(m => m.id === 'spoiler');
      const rec = mkrec();
      // drive to the fulfillment round: spN 1..4
      for (let rd = 1; rd <= 3; rd++) G.sigW5FieldMonster(spm, rec, { total: 50, round: rd, rr: RR, lroll, vName: 'Yara', mName: 'Spoiler' });
      rec.trickProne = 1;
      const wBefore = rec.sigW5.spWeight || 0;
      G.sigW5FieldMonster(spm, rec, { total: 50, round: 4, rr: RR, lroll, vName: 'Yara', mName: 'Spoiler' });
      out2.spWeightAfterProne = rec.sigW5.spWeight || 0;
      out2.spWeightBefore = wBefore;
      const rec2 = mkrec();
      for (let rd = 1; rd <= 4; rd++) G.sigW5FieldMonster(spm, rec2, { total: 50, round: rd, rr: RR, lroll, vName: 'Yara', mName: 'Spoiler' });
      out2.spWeightNoProne = rec2.sigW5.spWeight || 0;
      const nnm = G.data.monsters.find(m => m.id === 'network_note');
      const rec3 = mkrec(); rec3.trickBadNote = 1;
      G.sigW5FieldMonster(nnm, rec3, { total: 100, round: 1, rr: RR, lroll, vName: 'Yara', mName: 'Note' });
      const tEven = G.sigW5FieldMonster(nnm, rec3, { total: 100, round: 2, rr: RR, lroll, vName: 'Yara', mName: 'Note' });
      out2.nnBad = tEven;
      const rec4 = mkrec();
      G.sigW5FieldMonster(nnm, rec4, { total: 100, round: 1, rr: RR, lroll, vName: 'Yara', mName: 'Note' });
      const tEven2 = G.sigW5FieldMonster(nnm, rec4, { total: 100, round: 2, rr: RR, lroll, vName: 'Yara', mName: 'Note' });
      out2.nnPlain = tEven2;
    }
    out.r = out2;
  `);
  if (o.__err) console.log('  resolve err: ' + o.__err);
  const r = o.r || {};
  ok(r.cbNoMourn === 10 && r.cbMourned === 0 && r.cbMournLog === true, `callback: farewell kills the face-shift bonus (10→0), got ${r.cbNoMourn}/${r.cbMourned}`);
  ok(r.adHeal === 18 && r.adNoHeal === 0 && r.adFlagConsumed === true, `ad_break: look-away starves the heal (18→0), got ${r.adHeal}/${r.adNoHeal}`);
  ok(r.gavelPlain === 40 && r.gavelConfess === 20 && r.gavelFlagConsumed === true && r.gavelLog === true, `gavel: confess halves the verdict (40→20), got ${r.gavelPlain}/${r.gavelConfess}`);
  ok(r.strikeDown === 0 && r.strikePlain === 60, `strike: stand-down zeroes the round (0 vs 60), got ${r.strikeDown}/${r.strikePlain}`);
  ok(r.congArgue === 40 && r.congPlain === 90, `congregation: argue eats the beam (40 vs 90), got ${r.congArgue}/${r.congPlain}`);
  ok(r.euVerses1 === 5 && r.euContradicts1 === 1, `eulogy: contradiction restores a verse (verses ${r.euVerses1}, contradicts ${r.euContradicts1})`);
  ok(r.euOutcome === 'mFlee', `eulogy: 3 contradictions dismiss kindly (mFlee), got ${r.euOutcome}`);
  ok(r.algoTank === 40 && r.algoLeft === 1 && r.algoPlain === 125, `algorithm: tank halves (80→40, 1 round left; plain 80+45=125), got ${r.algoTank}/${r.algoLeft}/${r.algoPlain}`);
  ok(r.spWeightAfterProne === r.spWeightBefore && r.spWeightNoProne === 1, `spoiler: prone blocks the weight gain (${r.spWeightBefore}→${r.spWeightAfterProne}; no-prone →${r.spWeightNoProne})`);
  ok(r.nnBad === 100 && r.nnPlain === 125, `network_note: bad note misfires the buff (100 vs 125), got ${r.nnBad}/${r.nnPlain}`);
}

// ---------- KINDS ----------
console.log('== KINDS ==');
{
  const o = gameEval(708, `
    // synthetic TB fight scaffolding: the minimum checkMonsterCounter reads
    function mkfight(mid) {
      const mdef = Game.data.monsters.find(m => m.id === mid);
      Game.tbfight = { over: false, round: 1, fighters: [
        { key: 'p', kind: 'player', alive: true, hp: 100, maxHp: 100 },
        { key: 'm_0', kind: 'monster', alive: true, mdef: mdef, telegraph: { cells: [] } },
      ] };
      return mdef;
    }
    const res = {};
    // blindside (sunback): move during the arch
    mkfight('sunback');
    res.blindsideHit = Game.checkMonsterCounter('sunback', { type: 'move', windup: true, via: 'trick' });
    res.blindsideKnown = !!Game.state.monsterCounters.sunback;
    // face_it (sweeps_week): move away without fleeing
    mkfight('sweeps_week');
    res.faceHit = Game.checkMonsterCounter('sweeps_week', { type: 'move', closer: false, via: 'trick' });
    res.faceKnown = !!Game.state.monsterCounters.sweeps_week;
    // face_it must NOT fire on approach
    mkfight('sweeps_week');
    Game.state.monsterCounters = {};
    res.faceApproach = Game.checkMonsterCounter('sweeps_week', { type: 'move', closer: true, via: 'trick' });
    // eyes (cliffhanger): strike on the lunge
    mkfight('cliffhanger');
    res.eyesHit = Game.checkMonsterCounter('cliffhanger', { type: 'strike', windup: true, target: {}, via: 'trick' });
    res.eyesKnown = !!Game.state.monsterCounters.cliffhanger;
    // trickLog performance recording (known trick still logs the performance)
    mkfight('sunback');
    Game.state.monsterCounters = { sunback: true };
    Game.tbfight.trickLog = [];
    Game.checkMonsterCounter('sunback', { type: 'move', windup: true, via: 'trick' });
    res.trickLogKnown = (Game.tbfight.trickLog || []).join(',');
    Game.tbfight = null;
    out.r = res;
  `);
  if (o.__err) console.log('  kinds err: ' + o.__err);
  const r = o.r || {};
  ok(r.blindsideHit === true && r.blindsideKnown === true, 'blindside (sunback): move-during-arch discovers');
  ok(r.faceHit === true && r.faceKnown === true, 'face_it (sweeps_week): backing away discovers');
  ok(r.faceApproach === false, 'face_it: approaching does NOT discover');
  ok(r.eyesHit === true && r.eyesKnown === true, 'eyes (cliffhanger): strike-on-lunge discovers');
  ok(r.trickLogKnown === 'blindside', `f.trickLog records the performance even when known (got '${r.trickLogKnown}')`);
}

// ---------- TBATTR ----------
console.log('== TBATTR ==');
{
  const o = gameEval(709, `
    Game.state.waveKillLog = [];
    Game._attrKills = true;
    Game.recordWaveKill('hummice', 'v_9', 'player', 'shout,shout');
    Game.recordWaveKill('redactor', 'player', 'player', null);
    const log = Game.state.waveKillLog;
    out.e0 = log[0]; out.e1 = log[1];
    out.sum = Game.trickSummary ? Game.trickSummary({ trickLog: ['wait:redactor-quiet', 'wait:redactor-quiet'] }) : null;
  `);
  if (o.__err) console.log('  tbattr err: ' + o.__err);
  ok(o.e0 && o.e0.trick === 'shout,shout' && o.e0.via === 'player' && o.e0.by === 'v_9', 'recordWaveKill carries trick detail into waveKillLog');
  ok(o.e1 && o.e1.trick === null, 'recordWaveKill with no detail keeps trick null');
  ok(o.sum === 'wait:redactor-quiet,wait:redactor-quiet', 'trickSummary joins the fight trickLog');
}

// ---------- DET-GATE ----------
console.log('== DET-GATE ==');
function hashRun(seed, withInstrument) {
  const tmpFile = '/tmp/cw2-det-' + seed + '-' + (withInstrument ? 'ins' : 'bare') + '-' + process.pid + '.js';
  const code = `
const { loadGame, setupGame, runDays } = require('${HARNESS}');
const TF = require('${TRIBFLOOR}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'detgate', fullTelemetry: false });
  await setupGame(Game);
  ${withInstrument ? `
  let n = 0;
  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) { if (type === 'counter_discovered' || type === 'counter_observed') n++; return _t(type, data); };
  const _s = Game.say.bind(Game);
  Game.say = function (t) { return _s(t); };
  ` : ''}
  const res = await runDays(Game, TF.leadfeast, { days: 60, manifest: undefined, sampleEvery: 30 });
  const st = Game.state;
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16), n: typeof n !== 'undefined' ? n : -1 }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const a = hashRun(702, true), b = hashRun(702, true), c = hashRun(702, false);
  ok(!a.__crash && !b.__crash && !c.__crash, 'det-gate runs complete');
  ok(a.hash && a.hash === b.hash, `det-gate: instrumented runs identical on same seed (${a.hash})`);
  ok(a.hash === c.hash, `det-gate: instrument attached vs bare game byte-identical (${a.hash} == ${c.hash})`);
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const o = gameEval(710, `
    const { runDays } = require('${HARNESS}');
    const TF = require('${TRIBFLOOR}');
    const seen = [];
    const _t = Game.tele.bind(Game);
    Game.tele = function (type, data) { if (type === 'counter_discovered' || type === 'counter_observed') seen.push({ type, id: data && data.id }); return _t(type, data); };
    const res = await runDays(Game, TF.leadfeast, { days: 20, manifest: undefined, sampleEvery: 10 });
    out.days = res.days;
    out.seen = seen;
    const r = { seed: 710, policyId: 'leadfeast', national: 0, table: 0, won: 0, wins: 0, exiled: 0, days: res.days };
    out.schemaOk = ['national', 'table', 'won', 'wins', 'exiled'].every(k => typeof r[k] === 'number');
  `, { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1' });
  ok(!o.__err && !o.__crash, 'smoke: 20-day win-side run completes');
  ok(o.schemaOk === true, 'smoke: per-seed JSON carries numeric national/table/won/wins/exiled');
  console.log(`  smoke: counter events captured live: ${JSON.stringify(o.seen || [])}`);
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ' — ' + fails.join(' | ') : ''}`);
process.exit(fail ? 1 : 0);
