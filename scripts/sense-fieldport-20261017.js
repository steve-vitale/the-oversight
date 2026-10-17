#!/usr/bin/env node
// sense-fieldport-20261017.js — SENSE-TESTING material: dump full rec.logs of
// synthetic audit-day and editor-cut field fights (honest ports) for a human
// coherence read. The sweep produced 0 port fights (no-coverage), so the
// sense read happens on the proof harness's synthetic fights instead.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const HARNESS = path.join(REPO, 'scripts', 'sim-harness.js');

const tmpFile = path.join(os.tmpdir(), 'fieldport-sense-' + process.pid + '.js');
const code = `
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: 1717, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = (t) => { try { said.push(String(t)); } catch (e) {} };
  function setupFighter() {
    const vs = Game.data.villagers || [];
    const v = vs.find(x => !x.dead) || vs[0];
    const vid = v.id;
    try { Game.state.village = Game.state.village || {}; Game.state.village.health = Game.state.village.health || {}; Game.state.village.health[vid] = 100000; } catch (e) {}
    try { v.abilities = []; } catch (e) {}
    return { vid, v };
  }
  function weakMdef(mid) {
    const c = Object.assign({}, Game.data.monsters.find(m => m.id === mid));
    c.hp = [60, 60];
    return c;
  }
  {
    const { vid, v } = setupFighter();
    const rec = Game.fieldFight(vid, weakMdef('audit'), null, {});
    out.audit = { vName: v.name || vid, rounds: rec.rounds, outcome: rec.outcome,
      say: said.splice(0).join('\\n'),
      log: (rec.log || []).join('\\n') };
  }
  {
    const { vid, v } = setupFighter();
    const rec = Game.fieldFight(vid, weakMdef('editor'), null, {});
    out.editor = { vName: v.name || vid, rounds: rec.rounds, outcome: rec.outcome,
      say: said.splice(0).join('\\n'),
      log: (rec.log || []).join('\\n') };
  }
  Game.say = _say;
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
fs.writeFileSync(tmpFile, code);
try {
  const r = execSync('node ' + tmpFile, { cwd: path.join(REPO, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString();
  const lines = r.trim().split('\n');
  const o = JSON.parse(lines[lines.length - 1] || '{}');
  if (o.__crash) { console.error('CRASH: ' + o.__crash); process.exit(2); }
  for (const k of ['audit', 'editor']) {
    const f = o[k];
    console.log('='.repeat(70));
    console.log('FIGHT: ' + k.toUpperCase() + ' — villager ' + f.vName + ', ' + f.rounds + ' rounds, outcome ' + f.outcome);
    console.log('-'.repeat(70) + '\n[SAY STREAM]');
    console.log(f.say || '(none)');
    console.log('-'.repeat(70) + '\n[REC.LOG]');
    console.log(f.log);
    console.log();
  }
} finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
