#!/usr/bin/env node
// test-apexhook-20261016.js — proof record for the sim-apexhook arm
// (axis scale-onramp): WIRE ABSTRACT-MODEL HOOKS FOR THE APEX-KILLER TRICK DEFS.
//
// The 0815Z counterwire arm landed villagerTrickDefs for 26 wave-3+ species
// but left eater/influencer/audit/reunion/cancellation/editor as
// knowledge-only ("no abstract-model hook"). The apexpredators diagnostic
// named these the teeth killing villages (Eater 8/8 one-round, Reunion 17,
// Audit 4/5 ork, Editor 5, Cancellation 5, Influencer 4). This arm wires them.
//
// What changed (game code):
//   fieldFights.js — villagerTrickAction: 6 apex gates (eater poison,
//     influencer focus_followers, audit inefficient, reunion improvise,
//     editor continuity, cancellation offscript); villagerHasSpoiledFood +
//     villagerSpendSpoiledFood helpers; 6 resolution branches; per-round
//     actionKinds + strikesThrown tracking in the villager phase;
//     villager-strike apex effects (editor cut, cancellation strip,
//     audit tax, reunion mirror).
//   sigW4.js — influencer branch honors follower kills; audit branch HONEST
//     (taxes the villager's strike — was inverted, halved the monster's
//     damage); reunion branch narrates the mirror (replaces the 0.8x
//     placeholder that softened the monster).
//   sigW5.js — editor branch HONEST (arms the cut on the villager's swing —
//     was inverted, zeroed the monster's damage); cancellation branch HONEST
//     (the stamp checks for a script and strips the villager — was inverted,
//     0.7x on the monster's damage).
//
// Sections:
//   GATES — each of the 6 gates returns its action when known (+ negatives).
//   PORTS — the sig hooks are honest: tax/cut/strip land on the villager's
//           side, and the trick consumptions (inefficient, follower kills,
//           off-script) defeat them.
//   ARCS  — full fieldFight trick arcs execute end to end.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js, env) {
  const tmpFile = '/tmp/apexhook-synth-' + seed + '-' + process.pid + '.js';
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
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    const lines = r.trim().split('\n');
    return JSON.parse(lines[lines.length - 1] || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// ---------- GATES ----------
console.log('== GATES ==');
{
  const o = gameEval(801, `
    const results = {};
    function gate(mid, fctxExtra, foodSetup) {
      Game.state.villagerTricks = Game.state.villagerTricks || {};
      Game.state.villagerTricks[mid] = true;
      const mdef = (Game.data.monsters || []).find(m => m.id === mid);
      const rec = { trickLog: [], actionKinds: [], strikesThrown: 0 };
      const fctx = Object.assign({ round: 1, vHp: 100, vHpMax: 100, lead: { hp: 50 }, rec: rec, vp: {}, members: [{}] }, fctxExtra || {});
      if (foodSetup) foodSetup();
      const r = Game.villagerTrickAction('test_vid', mdef, fctx);
      delete Game.state.villagerTricks[mid];
      return r;
    }
    // eater: needs spoiled food on the test villager
    Game.data.villagers = Game.data.villagers || [];
    Game.data.villagers.push({ id: 'test_vid', items: [] });
    const day = (Game.state.scholar || {}).day || 1;
    function giveSpoiled() {
      const v = Game.data.villagers.find(x => x.id === 'test_vid');
      v.items.push({ id: 'rot_meat', name: 'rotten meat', kcalEach: 200, units: 1, spoilDay: day - 30 });
    }
    function giveFresh() {
      const v = Game.data.villagers.find(x => x.id === 'test_vid');
      v.items.push({ id: 'fresh_meat', name: 'fresh meat', kcalEach: 400, units: 1, spoilDay: day + 5 });
    }
    results.eaterSpoiled = gate('eater', {}, giveSpoiled);
    // reset items between gates
    Game.data.villagers.find(x => x.id === 'test_vid').items = [];
    results.eaterFresh = gate('eater', {}, giveFresh);
    Game.data.villagers.find(x => x.id === 'test_vid').items = [];
    results.eaterNoFood = gate('eater', {});
    results.influencerR1 = gate('influencer', { round: 1 });
    results.influencerR2 = gate('influencer', { round: 2 });
    results.influencerR4 = gate('influencer', { round: 4 });
    results.auditR3 = gate('audit', { round: 3 });
    results.auditR2 = gate('audit', { round: 2 });
    results.auditR6 = gate('audit', { round: 6 });
    results.reunionFresh = gate('reunion', {});
    results.reunionTwoStrikes = gate('reunion', {}, null);
    // reunion with 2 strikes thrown, last was strike
    {
      Game.state.villagerTricks = Game.state.villagerTricks || {};
      Game.state.villagerTricks['reunion'] = true;
      const mdef = (Game.data.monsters || []).find(m => m.id === 'reunion');
      const rec = { trickLog: [], actionKinds: ['strike', 'strike'], strikesThrown: 2 };
      const r = Game.villagerTrickAction('test_vid', mdef, { round: 3, vHp: 100, vHpMax: 100, lead: { hp: 50 }, rec: rec, vp: {}, members: [{}] });
      results.reunionTwoStrikes = r;
      delete Game.state.villagerTricks['reunion'];
    }
    // editor / cancellation: last two strikes -> trick; varied -> null
    function gateKinds(mid, kinds) {
      Game.state.villagerTricks = Game.state.villagerTricks || {};
      Game.state.villagerTricks[mid] = true;
      const mdef = (Game.data.monsters || []).find(m => m.id === mid);
      const rec = { trickLog: [], actionKinds: kinds.slice(), strikesThrown: kinds.filter(k => k === 'strike').length };
      const r = Game.villagerTrickAction('test_vid', mdef, { round: 3, vHp: 100, vHpMax: 100, lead: { hp: 50 }, rec: rec, vp: {}, members: [{}] });
      delete Game.state.villagerTricks[mid];
      return r;
    }
    results.editorPattern = gateKinds('editor', ['strike', 'strike']);
    results.editorVaried = gateKinds('editor', ['strike', 'wait']);
    results.cancelPattern = gateKinds('cancellation', ['strike', 'strike']);
    results.cancelVaried = gateKinds('cancellation', ['strike', 'wait']);
    // unknown control
    {
      const mdef = (Game.data.monsters || []).find(m => m.id === 'eater');
      results.noTrick = Game.villagerTrickAction('test_vid', mdef, { round: 1, vHp: 100, vHpMax: 100, lead: { hp: 1 }, rec: {}, vp: {}, members: [] });
    }
    out.r = results;
  `);
  if (o.__err) console.log('  gates err: ' + o.__err);
  const r = o.r || {};
  const t = (x) => (x && x.type) || null;
  ok(t(r.eaterSpoiled) === 'poison', 'eater (spoiled food) → poison');
  ok(t(r.eaterFresh) === null, 'eater (only fresh food) → no trick (won\'t feed it fresh)');
  ok(t(r.eaterNoFood) === null, 'eater (no food) → no trick');
  ok(t(r.influencerR1) === null, 'influencer (round 1, no followers yet) → no trick');
  ok(t(r.influencerR2) === 'focus_followers', 'influencer (round 2, followers live) → focus_followers');
  ok(t(r.influencerR4) === 'focus_followers', 'influencer (round 4) → focus_followers');
  ok(t(r.auditR3) === 'inefficient', 'audit (round 3, audit day) → inefficient');
  ok(t(r.auditR2) === null, 'audit (round 2) → no trick');
  ok(t(r.auditR6) === 'inefficient', 'audit (round 6, audit day) → inefficient');
  ok(t(r.reunionFresh) === null, 'reunion (no strikes yet) → no trick');
  ok(t(r.reunionTwoStrikes) === 'wait' && r.reunionTwoStrikes.why === 'reunion-novel', 'reunion (2 strikes, last strike) → wait:reunion-novel');
  ok(t(r.editorPattern) === 'continuity', 'editor (strike,strike) → continuity');
  ok(t(r.editorVaried) === null, 'editor (strike,wait) → no trick');
  ok(t(r.cancelPattern) === 'offscript', 'cancellation (strike,strike) → offscript');
  ok(t(r.cancelVaried) === null, 'cancellation (strike,wait) → no trick');
  ok(t(r.noTrick) === null, 'unknown trick → no trick action');
}

// ---------- PORTS ----------
console.log('== PORTS ==');
{
  const o = gameEval(802, `
    const P = {};
    const G = Game;
    function mkrec() { return { log: [], trickLog: [], mDealt: 0, vTaken: 0, actionKinds: [] }; }
    const lroll = (r) => r[0];
    // --- AUDIT: honest port taxes the VILLAGER, not the monster ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'audit');
      const rec = mkrec();
      const before = 100;
      // capture say() narration (sigW4 narrates via game.say, not rec.log)
      const said = [];
      const _say = G.say.bind(G);
      G.say = (t) => { try { said.push(String(t)); } catch (e) {} return _say(t); };
      const got = G.sigW4FieldMonster(mdef, rec, { total: before, round: 3, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Audit' });
      P.auditTaxSet = rec.auditTaxRounds === 2;
      P.auditMonsterUntouched = got === before; // the monster's damage is NOT halved (the inversion)
      P.auditNarrates = said.join(' ').includes('taxed');
      const rec2 = mkrec(); rec2.trickInefficient = 1;
      said.length = 0;
      const got2 = G.sigW4FieldMonster(mdef, rec2, { total: before, round: 3, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Audit' });
      P.auditJankNoTax = (rec2.auditTaxRounds | 0) === 0 && rec2.trickInefficient === 0;
      P.auditJankNarrates = said.join(' ').includes('nothing to tax');
      G.say = _say;
    }
    // --- EDITOR: honest port arms the cut on the villager's swing ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'editor');
      const rec = mkrec();
      const before = 100;
      // drive edN to a cut round: 3 monster-phase calls
      let got = before;
      for (let i = 0; i < 3; i++) got = G.sigW5FieldMonster(mdef, rec, { total: before, round: i + 1, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Editor' });
      P.editorArmsCut = rec.editorCuts === 1;
      P.editorMonsterUntouched = got === before; // NOT zeroed (the inversion)
      P.editorWarns = rec.log.join(' ').includes('film strips');
    }
    // --- CANCELLATION: honest port strips the villager, and off-script defeats it ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'cancellation');
      // scripted villager: 3 strikes -> the stamp finds the script
      const rec = mkrec(); rec.actionKinds = ['strike', 'strike', 'strike'];
      let got = 100;
      for (let i = 0; i < 4; i++) got = G.sigW5FieldMonster(mdef, rec, { total: 100, round: i + 1, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Cancellation' });
      P.cancelScriptStrips = rec.cancelStrip === 1;
      P.cancelMonsterUntouched = got === 100; // NOT 0.7x (the inversion)
      P.cancelStampNarrates = rec.log.join(' ').includes('UNDER REVIEW');
      // improvising villager: varied -> the stamp finds nothing
      const rec2 = mkrec(); rec2.actionKinds = ['strike', 'offscript', 'strike'];
      for (let i = 0; i < 4; i++) G.sigW5FieldMonster(mdef, rec2, { total: 100, round: i + 1, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Cancellation' });
      P.cancelOffscriptFizzle = (rec2.cancelStrip | 0) === 0;
      P.cancelFizzleNarrates = rec2.log.join(' ').includes('empty air');
    }
    // --- INFLUENCER: follower kills reduce the buff ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'influencer');
      const rec = mkrec();
      const got = G.sigW4FieldMonster(mdef, rec, { total: 50, round: 4, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Influencer' });
      P.inflBase = got; // 50 + min(4,2)*6 = 62
      const rec2 = mkrec(); rec2.sigW4 = { inFolKilled: 2 };
      const got2 = G.sigW4FieldMonster(mdef, rec2, { total: 50, round: 4, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Influencer' });
      P.inflKilled = got2; // 50 + max(0, 2-2)*6 = 50
      const rec3 = mkrec(); rec3.sigW4 = { inFolKilled: 1 };
      const got3 = G.sigW4FieldMonster(mdef, rec3, { total: 50, round: 6, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Influencer' });
      P.inflPartial = got3; // 50 + max(0, 3-1)*6 = 62
    }
    out.p = P;
  `);
  if (o.__err) console.log('  ports err: ' + o.__err);
  const p = o.p || {};
  ok(p.auditTaxSet === true, 'audit: audit day sets auditTaxRounds=2 (villager taxed)');
  ok(p.auditMonsterUntouched === true, 'audit: monster damage NOT halved (inversion fixed)');
  ok(p.auditNarrates === true, 'audit: narrates the tax');
  ok(p.auditJankNoTax === true, 'audit: deliberate inefficiency → nothing to tax');
  ok(p.auditJankNarrates === true, 'audit: narrates the jank-out');
  ok(p.editorArmsCut === true, 'editor: cut round arms editorCuts (villager swing)');
  ok(p.editorMonsterUntouched === true, 'editor: monster damage NOT zeroed (inversion fixed)');
  ok(p.editorWarns === true, 'editor: film strips warn a round ahead');
  ok(p.cancelScriptStrips === true, 'cancellation: scripted (3x strike) → cancelStrip set');
  ok(p.cancelMonsterUntouched === true, 'cancellation: monster damage NOT 0.7x (inversion fixed)');
  ok(p.cancelStampNarrates === true, 'cancellation: stamp narrates UNDER REVIEW');
  ok(p.cancelOffscriptFizzle === true, 'cancellation: off-script (varied) → no strip');
  ok(p.cancelFizzleNarrates === true, 'cancellation: fizzle narrates empty air');
  ok(p.inflBase === 62, 'influencer: round 4, no kills → 50 + 2*6 = 62');
  ok(p.inflKilled === 50, 'influencer: 2 followers killed → buff gone (50)');
  ok(p.inflPartial === 62, 'influencer: round 6, 1 killed → 50 + 2*6 = 62');
}

// ---------- ARCS ----------
console.log('== ARCS ==');
{
  const o = gameEval(803, `
    const A = {};
    const G = Game;
    function setupFighter(mid, giveSpoiled) {
      const vs = G.data.villagers || [];
      const v = vs.find(x => !x.dead) || vs[0];
      const vid = v.id;
      G.state.villagerTricks = G.state.villagerTricks || {};
      G.state.villagerTricks[mid] = true;
      try { G.state.village = G.state.village || {}; G.state.village.health = G.state.village.health || {}; G.state.village.health[vid] = 10000; } catch (e) {}
      if (giveSpoiled) {
        const day = (G.state.scholar || {}).day || 1;
        v.items = v.items || [];
        v.items.push({ id: 'rot_meat', name: 'rotten haunch', kcalEach: 300, units: 2, spoilDay: day - 30 });
      }
      // strip abilities so the default action is the strike/trick choice
      try { v.abilities = []; } catch (e) {}
      return vid;
    }
    // low-HP monster clone: the test villager must survive to round 3+
    // (the tricks' setup window) without the damage race reading hopeless.
    function weakMdef(mid) {
      const base = G.data.monsters.find(m => m.id === mid);
      const c = Object.assign({}, base);
      c.hp = [60, 60];
      return c;
    }
    // --- EATER: poison the meal -> vomits out (mFlee), full arc round 1 ---
    {
      const mid = 'eater';
      const vid = setupFighter(mid, true);
      const mdef = G.data.monsters.find(m => m.id === mid);
      const rec = G.fieldFight(vid, mdef, null, {});
      A.eaterOutcome = rec.outcome;
      A.eaterTrick = (rec.trickLog || []).join(',');
      A.eaterVomit = rec.log.join(' ').includes('VOMITS');
      A.eaterRounds = rec.rounds;
      delete G.state.villagerTricks[mid];
    }
    // --- INFLUENCER: focus followers -> kills tracked, buff shrinks ---
    {
      const mid = 'influencer';
      const vid = setupFighter(mid, false);
      const mdef = G.data.monsters.find(m => m.id === mid);
      const rec = G.fieldFight(vid, mdef, null, {});
      A.inflTrick = (rec.trickLog || []).join(',');
      A.inflKilled = (rec.sigW4 || {}).inFolKilled | 0;
      A.inflFired = (rec.trickLog || []).includes('focus_followers');
      delete G.state.villagerTricks[mid];
    }
    // --- AUDIT: inefficient on audit day ---
    {
      const mid = 'audit';
      const vid = setupFighter(mid, false);
      const mdef = weakMdef(mid);
      const rec = G.fieldFight(vid, mdef, null, {});
      A.auditTrick = (rec.trickLog || []).join(',');
      A.auditFired = (rec.trickLog || []).includes('inefficient');
      delete G.state.villagerTricks[mid];
    }
    // --- REUNION: improvise resets the mirror ---
    {
      const mid = 'reunion';
      const vid = setupFighter(mid, false);
      const mdef = weakMdef(mid);
      const rec = G.fieldFight(vid, mdef, null, {});
      A.reunionTrick = (rec.trickLog || []).join(',');
      A.reunionFired = (rec.trickLog || []).some(t => t === 'wait:reunion-novel');
      delete G.state.villagerTricks[mid];
    }
    // --- EDITOR: continuity breaks the pattern ---
    {
      const mid = 'editor';
      const vid = setupFighter(mid, false);
      const mdef = weakMdef(mid);
      const rec = G.fieldFight(vid, mdef, null, {});
      A.editorTrick = (rec.trickLog || []).join(',');
      A.editorFired = (rec.trickLog || []).includes('continuity');
      delete G.state.villagerTricks[mid];
    }
    // --- CANCELLATION: off-script breaks the script ---
    {
      const mid = 'cancellation';
      const vid = setupFighter(mid, false);
      const mdef = weakMdef(mid);
      const rec = G.fieldFight(vid, mdef, null, {});
      A.cancelTrick = (rec.trickLog || []).join(',');
      A.cancelFired = (rec.trickLog || []).includes('offscript');
      delete G.state.villagerTricks[mid];
    }
    out.a = A;
  `);
  if (o.__err) console.log('  arcs err: ' + o.__err);
  const a = o.a || {};
  ok(a.eaterOutcome === 'mFlee', 'eater arc: poison → mFlee (vomits out)');
  ok((a.eaterTrick || '').includes('poison'), 'eater arc: trickLog has poison');
  ok(a.eaterVomit === true, 'eater arc: narrates VOMITS');
  ok(a.eaterRounds === 1, 'eater arc: resolved round 1');
  ok(a.inflFired === true, 'influencer arc: focus_followers executed');
  ok((a.inflKilled | 0) >= 1, 'influencer arc: ≥1 follower killed');
  ok(a.auditFired === true, 'audit arc: inefficient executed on audit day');
  ok(a.reunionFired === true, 'reunion arc: wait:reunion-novel executed');
  ok(a.editorFired === true, 'editor arc: continuity executed');
  ok(a.cancelFired === true, 'cancellation arc: offscript executed');
}

console.log(`\n== ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('failures:'); fails.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);
