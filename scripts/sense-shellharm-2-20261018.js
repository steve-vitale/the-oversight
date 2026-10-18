#!/usr/bin/env node
// Targeted sense read for sim-shellharm-b: the shell arm had FEWER starvation
// deaths than control, but each still deserves a reading — do the beats show
// the shelling taking food out of mouths, or ordinary famine in longer-lived
// villages? Targets: (leadfeast s7303 shell, scholar death d103) and
// (leadfeast s7308 shell, villager death d160), plus paired controls.
'use strict';
const { leadfeast } = require('./policies/feastscale');
const SC = require('./policies/shellcounter');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';

const TARGETS = [
  { seed: 7303, deathDays: [103], label: 'leadfeast s7303 shell (scholar d103)' },
  { seed: 7303, deathDays: [65], label: 'leadfeast s7303 CONTROL (scholar d65)' },
  { seed: 7308, deathDays: [160], label: 'leadfeast s7308 shell (villager d160)' },
  { seed: 7308, deathDays: [135, 137], label: 'leadfeast s7308 CONTROL (villagers d135,d137)' },
];

async function capture(seed, arm, targetDays) {
  const base = leadfeast;
  const policy = arm === 'shell' ? SC.withShellCounter(base, 'leadfeast+shellcounter', 'sense2') : base;
  if (arm === 'shell') process.env.SHELLCOUNTER = '1'; else delete process.env.SHELLCOUNTER;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const beats = [];
  Game.say = function (m) {
    try {
      const s = String((m && (m.text || m.msg || m.message)) || m);
      beats.push({ day: (Game.state.scholar || {}).day || 0, text: s.slice(0, 300) });
      if (beats.length > 5000) beats.splice(0, 500);
    } catch (e) {}
  };
  const deaths = [];
  const oTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    const r = oTele.apply(this, arguments);
    try {
      if (type === 'death') deaths.push({ day: (Game.state.scholar || {}).day || 0, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
    } catch (e) {}
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  delete process.env.SHELLCOUNTER;
  return { beats, deaths };
}

const KEEP = /starv|hunger|nothing edible|no food|half ration|pantry is empty|went bad|put away|crack and pick|counter|ration|scrounge|forag|died/i;

(async () => {
  for (const t of TARGETS) {
    const arm = t.label.includes('CONTROL') ? 'control' : 'shell';
    const { beats, deaths } = await capture(t.seed, arm, t.deathDays);
    console.log(`\n===== ${t.label} =====`);
    console.log('deaths:', JSON.stringify(deaths.filter(d => /starv/i.test(d.cause || '')).slice(0, 6)));
    const win = new Set();
    for (const d of t.deathDays) for (let x = d - 3; x <= d + 1; x++) win.add(x);
    const shown = beats.filter(b => win.has(b.day) && KEEP.test(b.text));
    for (const b of shown.slice(-40)) console.log(`  d${b.day}: ${b.text}`);
    if (!shown.length) console.log('  (no food-death beats in the window)');
  }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
