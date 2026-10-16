#!/usr/bin/env node
// test-fieldports-20261016.js — proof record for the sim-fieldports arm
// (finding #409): THE MISSING FIELD PORTS.
//
// sim-apexhook (2026-10-16) landed villagerTrickDefs for herald,
// finale_crew, finale_opening but left them knowledge-only ("no
// abstract-model hook" — documented in sim-apexhook.md's blank-fill
// record). Their counterplay ("kill the crew", "meet it while arriving",
// "read the omens") was TB-only. This arm ports them honestly into the
// villager field-fight model (sigW4FieldMonster / sigW5FieldMonster),
// following the sim-apexhook honest-port pattern: abstract-model gates +
// honest punishments, never faked knowledge-only ports. Gates in
// villagerTrickAction (fieldFights.js) are a sibling arm's file this run —
// the ports here are driven by observable villager behavior
// (rec.actionKinds, rec.mDealt deltas), so the mechanics are real for
// every villager and the trick is knowing how to exploit them.
//
// EXCLUDED (finding #410): wave 6 (network_tower/network_limb/
// network_heart) — MONSTER-WAVES.md is silent on wave 6; needs Steve's
// canon first. Asserted absent here.
//
// Sections:
//   RED      — MECHANIC=off: the layer is absent (ports unfire, generic path).
//   PORTS    — each port fires its honest mechanic (GREEN), exact numbers.
//   DET-GATE — layer-off is byte-identical to base; unrelated ports untouched.
//   SMOKE    — node --check on touched files (run in shell, recorded here).
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (the harness
// does it), full src/js list via the harness, no Game.save stub.

// KILL-PROTOCOL INFO-SKIP (coordinator repair 2026-10-16): the fieldports
// layer was reverted to zero trace per the kill protocol (killed at pilot) —
// src/js/sigW4.js no longer carries the herald port. INFO-SKIP instead of
// failing on the absent lever. The 35/35 RED->GREEN record stands pre-kill
// (evidence/2026-10-16/sim-fieldports.md).
(function () {
  const fs0 = require('fs');
  const path0 = require('path');
  try {
    const s4 = fs0.readFileSync(path0.join(__dirname, '..', 'src', 'js', 'sigW4.js'), 'utf8');
    if (s4.indexOf('raises its trumpet') === -1) {
      console.log('SKIP test-fieldports-20261016 (lever reverted per kill protocol — herald port absent from src/js/sigW4.js)');
      process.exit(0);
    }
  } catch (e) {}
})();
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
  const tmpFile = '/tmp/fieldports-synth-' + seed + '-' + process.pid + '.js';
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

const MDEF = `function mdef(id) { return (Game.data.monsters || []).find(m => m.id === id) || { id: id }; }`;
const SAYCAP = `
const said = [];
const _say = Game.say.bind(Game);
Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return _say(t); };
const minLroll = (r) => r[0];
`;

// ---------- RED: MECHANIC=off — the layer is absent ----------
console.log('== RED (MECHANIC=off) ==');
{
  const o = gameEval(7001, `
    out.sigW4 = typeof Game.sigW4FieldMonster;
    out.sigW5 = typeof Game.sigW5FieldMonster;
    // generic path: no port consumes the round — total passes through
    out.passthrough = null;
    `, { MECHANIC: 'off' });
  ok(!o.__err && !o.__crash, 'RED loads clean with MECHANIC=off');
  ok(o.sigW4 === 'undefined', 'RED: sigW4FieldMonster absent with layer off');
  ok(o.sigW5 === 'undefined', 'RED: sigW5FieldMonster absent with layer off');
}

// ---------- PORTS: herald ----------
console.log('== PORTS: herald ==');
{
  const o = gameEval(7002, `
    ${MDEF}
    ${SAYCAP}
    const h = mdef('herald');
    // ARC 1 (stand still): one rec across the rounds, like a real fight.
    // Round 1: the omen is announced — thunder still gathering (half).
    const recA = { actionKinds: ['strike'] };
    const t1 = Game.sigW4FieldMonster(h, recA, { total: 40, round: 1, vName: 'Ava', lroll: minLroll });
    out.r1total = t1;
    out.r1beat = said.some(s => s.indexOf('raises its trumpet') >= 0);
    // Round 2: the warning (half). The villager struck again (trading).
    recA.actionKinds.push('strike');
    const t2 = Game.sigW4FieldMonster(h, recA, { total: 40, round: 2, vName: 'Ava', lroll: minLroll });
    out.r2total = t2;
    out.r2beat = said.some(s => s.indexOf('WHITENS') >= 0);
    // Round 3, villager stood still trading (last action 'strike'): THE OMEN LANDS [80,120]
    said.length = 0;
    const t3 = Game.sigW4FieldMonster(h, recA, { total: 40, round: 3, vName: 'Ava', lroll: minLroll });
    out.r3standTotal = t3;
    out.r3punish = said.some(s => s.indexOf('THE OMEN LANDS') >= 0);
    out.r3punishText = said.filter(s => s.indexOf('THE OMEN LANDS') >= 0).join(' ').slice(0, 160);
    // ARC 2 (reposition): the villager reads the omen and moves (last action 'wait').
    const recB = { actionKinds: ['strike'] };
    Game.sigW4FieldMonster(h, recB, { total: 40, round: 1, vName: 'Ava', lroll: minLroll });
    recB.actionKinds.push('wait');
    Game.sigW4FieldMonster(h, recB, { total: 40, round: 2, vName: 'Ava', lroll: minLroll });
    said.length = 0;
    const t4 = Game.sigW4FieldMonster(h, recB, { total: 40, round: 3, vName: 'Ava', lroll: minLroll });
    out.r3moveTotal = t4;
    out.r3dodge = said.some(s => s.indexOf('read the omen and repositioned') >= 0);
    // the tutorial phrase is the one the trick def teaches
    out.err = null;
  `);
  ok(!o.__err && !o.__crash, 'herald port runs clean');
  ok(o.r1beat === true, 'herald R1 announces the omen (raises its trumpet)');
  ok(o.r1total === 20, 'herald R1: thunder still gathering, 40 -> 20 (got ' + o.r1total + ')');
  ok(o.r2beat === true, 'herald R2 warns (WHITENS)');
  ok(o.r2total === 20, 'herald R2: half thunder, 40 -> 20 (got ' + o.r2total + ')');
  ok(o.r3punish === true, 'herald R3: THE OMEN LANDS on the stand-still villager');
  ok(o.r3standTotal === 120, 'herald R3: omen 80 + base 40 = 120 (got ' + o.r3standTotal + ')');
  ok(o.r3dodge === true, 'herald R3: repositioning villager reads the omen, blast misses');
  ok(o.r3moveTotal === 10, 'herald R3: dodged blast, 40 -> 10 (got ' + o.r3moveTotal + ')');
}

// ---------- PORTS: finale_crew ----------
console.log('== PORTS: finale_crew ==');
{
  const o = gameEval(7003, `
    ${MDEF}
    ${SAYCAP}
    const c = mdef('finale_crew');
    // round 1: nobody has hit it — ratings climb 20 -> 28
    let rec = { log: [], mDealt: 0 };
    let t1 = Game.sigW5FieldMonster(c, rec, { total: 100, round: 1, vName: 'Ben', lroll: minLroll });
    out.r1ratings = rec.sigW5.crR;
    out.r1total = t1;
    out.r1beat = rec.log.some(s => s.indexOf('ratings climb (28)') >= 0);
    out.r1multLine = rec.log.filter(s => s.indexOf('reads the room') >= 0).join(' ');
    // round 2: the villager hits HARD (>=12) — the ratings stall 28 -> 18
    rec.mDealt = 15;
    let t2 = Game.sigW5FieldMonster(c, rec, { total: 100, round: 2, vName: 'Ben', lroll: minLroll });
    out.r2ratings = rec.sigW5.crR;
    out.r2total = t2;
    out.r2beat = rec.log.some(s => s.indexOf('ratings STALL') >= 0);
    // round 3: soft hits again (<12) — climb resumes 18 -> 26
    rec.mDealt = 20; // delta 5 < 12
    let t3 = Game.sigW5FieldMonster(c, rec, { total: 100, round: 3, vName: 'Ben', lroll: minLroll });
    out.r3ratings = rec.sigW5.crR;
    out.r3total = t3;
    out.err = null;
  `);
  ok(!o.__err && !o.__crash, 'crew port runs clean');
  ok(o.r1ratings === 28, 'crew R1: ratings climb 20 -> 28 (got ' + o.r1ratings + ')');
  ok(o.r1total === 103, 'crew R1: 100 x 1.03 = 103 (got ' + o.r1total + ')');
  ok(o.r1beat === true, 'crew R1: "ratings climb (28)" beat');
  ok(o.r2ratings === 18, 'crew R2: hard hits stall 28 -> 18 (got ' + o.r2ratings + ')');
  ok(o.r2total === 93, 'crew R2: 100 x 0.93 = 93 (got ' + o.r2total + ')');
  ok(o.r2beat === true, 'crew R2: "ratings STALL" beat');
  ok(o.r3ratings === 26, 'crew R3: soft hits, climb resumes 18 -> 26 (got ' + o.r3ratings + ')');
  ok(o.r3total === 101, 'crew R3: 100 x 1.01 = 101 (got ' + o.r3total + ')');
}

// ---------- PORTS: finale_opening ----------
console.log('== PORTS: finale_opening ==');
{
  const o = gameEval(7004, `
    ${MDEF}
    ${SAYCAP}
    const op = mdef('finale_opening');
    out.fiCardRange = op.fiCardRange;
    out.fiCountdownRounds = op.fiCountdownRounds;
    const rec = { log: [], sigW5: {} };
    // rounds 1-2: ARRIVING — hits land soft
    const t1 = Game.sigW5FieldMonster(op, rec, { total: 100, round: 1, vName: 'Cyd', lroll: minLroll });
    const t2 = Game.sigW5FieldMonster(op, rec, { total: 100, round: 2, vName: 'Cyd', lroll: minLroll });
    out.r1total = t1; out.r2total = t2;
    out.r1beat = rec.log.some(s => s.indexOf('credits are still ROLLING') >= 0);
    // round 3: the credits finish — declares the countdown (verbatim TB values)
    const t3 = Game.sigW5FieldMonster(op, rec, { total: 100, round: 3, vName: 'Cyd', lroll: minLroll });
    out.r3declared = !!rec.sigW5.opDeclared;
    out.r3count = rec.sigW5.opCount;
    out.r3beat = rec.log.some(s => s.indexOf('THE CREDITS FINISH ROLLING') >= 0 && s.indexOf('[100,140]') >= 0);
    // rounds 4-7: countdown ticks; round 8: THE TITLE CARD FALLS
    let cardTotal = null, cardBeat = false;
    for (let r = 4; r <= 8; r++) {
      const tt = Game.sigW5FieldMonster(op, rec, { total: 100, round: r, vName: 'Cyd', lroll: minLroll });
      if (r === 8) { cardTotal = tt; cardBeat = rec.log.some(s => s.indexOf('THE TITLE CARD FALLS') >= 0); }
    }
    out.cardTotal = cardTotal;
    out.cardBeat = cardBeat;
    out.err = null;
  `);
  ok(!o.__err && !o.__crash, 'opening port runs clean');
  ok(JSON.stringify(o.fiCardRange) === '[100,140]', 'opening mdef carries fiCardRange [100,140] (verbatim TB)');
  ok(o.fiCountdownRounds === 5, 'opening mdef carries fiCountdownRounds 5 (verbatim TB)');
  ok(o.r1beat === true, 'opening R1: "credits are still ROLLING" beat');
  ok(o.r1total === 50 && o.r2total === 50, 'opening R1-2: arriving, 100 -> 50 each (got ' + o.r1total + '/' + o.r2total + ')');
  ok(o.r3declared === true && o.r3count === 5, 'opening R3: declared, 5-round countdown (got ' + o.r3count + ')');
  ok(o.r3beat === true, 'opening R3: "THE CREDITS FINISH ROLLING" beat names the [100,140] card');
  ok(o.cardBeat === true, 'opening R8: THE TITLE CARD FALLS (the honest punishment)');
  ok(o.cardTotal === 200, 'opening R8: 100 + 100 (min card) = 200 (got ' + o.cardTotal + ')');
}

// ---------- DET-GATE: layer-off byte-identical; unrelated ports untouched; wave 6 excluded ----------
console.log('== DET-GATE ==');
{
  const o = gameEval(7005, `
    ${MDEF}
    ${SAYCAP}
    // unrelated species: eater growth unchanged, congregation beam unchanged
    let rec = {};
    const e = Game.sigW4FieldMonster(mdef('eater'), rec, { total: 40, round: 2, vName: 'Ava', lroll: (r) => r[0] });
    out.eaterR2 = e; // 40 + 45 + 15 = 100
    rec = {};
    const cg = Game.sigW4FieldMonster(mdef('congregation'), rec, { total: 40, round: 2, vName: 'Ava', lroll: (r) => r[0] });
    out.congR2 = cg; // round%3==1 false -> passthrough 40
    // cancellation still honest (apexhook's port untouched by this arm)
    rec = { log: [] };
    const cx = Game.sigW5FieldMonster(mdef('cancellation'), rec, { total: 40, round: 1, vName: 'Ava', lroll: (r) => r[0] });
    out.cxR1 = cx;
    out.cxBeat = rec.log.some(s => s.indexOf('the stamp descends') >= 0);
    // wave 6 explicitly NOT ported (finding #410)
    rec = { log: [] };
    const w6 = Game.sigW5FieldMonster(mdef('network_tower'), rec, { total: 55, round: 1, vName: 'Ava', lroll: (r) => r[0] });
    out.w6total = w6;
    out.w6silent = rec.log.length === 0;
    out.err = null;
  `);
  ok(!o.__err && !o.__crash, 'det-gate runs clean');
  ok(o.eaterR2 === 100, 'eater port untouched: 40 + 45 + 15 = 100 (got ' + o.eaterR2 + ')');
  ok(o.congR2 === 40, 'congregation non-beam round untouched: passthrough 40 (got ' + o.congR2 + ')');
  ok(o.cxR1 === 40 && o.cxBeat === true, 'cancellation port untouched: stamp descends, total 40');
  ok(o.w6total === 55 && o.w6silent === true, 'wave 6 excluded: network_tower passes through untouched, no beats');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fails.length) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
