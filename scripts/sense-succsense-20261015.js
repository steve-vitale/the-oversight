#!/usr/bin/env node
// sense-succsense: extract succession-day beat transcripts for the sense test.
// Deterministic replay: same seed + policy + gate as the sim-succgrace sweep
// (det-gate verified; same tree as the lever commits). Extraction only — no
// numbers are mixed with the committed sweep JSONs.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const fs = require('fs');

const RE = /dead hold no treaties|bond is fraying|realm came apart|silence answered|new speaker|funeral|mourning|succession|grief|dissolv|renegotiat|GOVERNANCE|fray/i;

async function dump(seed, policy, policyName, armed) {
  if (armed) process.env.SUCCGRACE = '1'; else delete process.env.SUCCGRACE;
  const { Game } = await loadGame({ seed, mode: `succsense-${policyName}-${seed}-${armed ? 'a' : 'c'}` });
  await setupGame(Game);
  const beats = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      if (RE.test(t)) beats.push(`d${gday()} ${t.slice(0, 300)}`);
    } catch (e) {}
    return origSay(msg);
  };
  const p = Object.assign({}, policy);
  const result = await runDays(Game, p, { days: 180, sampleEvery: 10 });
  delete process.env.SUCCGRACE;
  return { header: `# ${policyName} s${seed} ${armed ? 'ARMED' : 'CONTROL'} — ${result.days}d, ${result.endReason}\n`, beats };
}

function primLink(Game, id, trust, day) {
  const l = { id, status: 'active', primary: 'haven', subordinate: 'v-' + id,
    trust, day: day || 60, tributeKcalPerWeek: 4000, arrears: 0, tendedWeek: -1,
    lastKeptDay: 99, kind: 'lead' };
  Game.mshipState().links.push(l);
  return l;
}

// fixture answers: the base policies never answer beats, so the answered
// path only exists in the proof fixture. Capture its narration verbatim.
async function fixtureAnswer(kind) {
  process.env.SUCCGRACE = '1';
  const { Game } = await loadGame({ seed: 4242, mode: `succsense-fixture-${kind}` });
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 100;
  Game.state.village = Game.state.village || {};
  Game.state.village.pantry = [{ kcalEach: 1000, units: 40 }];
  Game.mshipState().links = [];
  Game.state.nationalLive = true;
  primLink(Game, 'l-a', 80);
  primLink(Game, 'l-b', 76);
  primLink(Game, 'l-c', 44);
  const beats = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      beats.push(`d${gday()} ${t.slice(0, 300)}`);
    } catch (e) {}
    return origSay(msg);
  };
  Game.successionCrisis('l-a');
  Game.successionCrisis('l-b');
  Game.successionCrisis('l-c');
  beats.push(`-- answered '${kind}' --`);
  const r = Game.answerRenegotiation('l-c', kind);
  beats.push(`-- answerRenegotiation returned: ${r}, trust now ${Game.mshipState().links.find(l => l.id === 'l-c').trust}, nationalLive ${Game.state.nationalLive} --`);
  Game._checkNational();
  beats.push(`-- after _checkNational: nationalLive ${Game.state.nationalLive} --`);
  delete process.env.SUCCGRACE;
  return { header: `# fixture answered '${kind}' — d100 funeral, answers land through the mourning choke\n`, beats };
}

async function fixtureLapse() {
  process.env.SUCCGRACE = '1';
  const { Game } = await loadGame({ seed: 4242, mode: 'succsense-fixture-lapse' });
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 100;
  Game.state.village = Game.state.village || {};
  Game.state.village.pantry = [{ kcalEach: 1000, units: 40 }];
  Game.mshipState().links = [];
  Game.state.nationalLive = true;
  primLink(Game, 'l-a', 80);
  primLink(Game, 'l-b', 76);
  primLink(Game, 'l-c', 44);
  const beats = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      beats.push(`d${gday()} ${t.slice(0, 300)}`);
    } catch (e) {}
    return origSay(msg);
  };
  Game.successionCrisis('l-c');
  beats.push('-- beat unanswered; advancing to d107 --');
  Game.state.scholar.day = 107;
  Game._renegotiationTick();
  Game._checkNational();
  beats.push(`-- after tick: nationalLive ${Game.state.nationalLive} --`);
  delete process.env.SUCCGRACE;
  return { header: `# fixture unanswered — 7d lapse, dissolution\n`, beats };
}

(async () => {
  const runs = [
    [22, leadfeast, 'leadfeast', true], [22, leadfeast, 'leadfeast', false],
    [44, leadfeast, 'leadfeast', true], [44, leadfeast, 'leadfeast', false],
    [11, belongfeast, 'belongfeast', true], [11, belongfeast, 'belongfeast', false],
    [22, belongfeast, 'belongfeast', true], [22, belongfeast, 'belongfeast', false],
    [33, belongfeast, 'belongfeast', true], [33, belongfeast, 'belongfeast', false],
  ];
  const out = [];
  for (const [seed, pol, name, armed] of runs) {
    const r = await dump(seed, pol, name, armed);
    out.push(r.header + r.beats.join('\n') + `\n(${r.beats.length} beats)\n`);
    console.log(`${name} s${seed} ${armed ? 'armed' : 'control'}: ${r.beats.length} beats`);
  }
  for (const kind of ['gift', 'visit', 'wait']) {
    const r = await fixtureAnswer(kind);
    out.push(r.header + r.beats.join('\n') + '\n');
    console.log(`fixture ${kind}: ${r.beats.length} beats`);
  }
  const l = await fixtureLapse();
  out.push(l.header + l.beats.join('\n') + '\n');
  console.log(`fixture lapse: ${l.beats.length} beats`);
  fs.writeFileSync('evidence/2026-10-15/sense-succsense-episodes.txt', out.join('\n' + '='.repeat(70) + '\n') + '\n');
  console.log('wrote evidence/2026-10-15/sense-succsense-episodes.txt');
})().catch(e => { console.error('FATAL', e); process.exit(2); });
