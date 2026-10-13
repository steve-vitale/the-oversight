// sense-plentyb-villagers.js — do villagers act like people around the r13 feasts?
// Runs one leadfeast run (seed 11, 90d), captures Game.say lines mentioning
// feasts/villager names, plus the final villager snapshot (occupations,
// profiles, xp tracks, kills). Human judge reads the output.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEED = parseInt(process.env.SEED || '11', 10);
const DAYS = parseInt(process.env.DAYS || '90', 10);

(async () => {
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'plentyb-sense' });
  await setupGame(Game);
  const sayLines = [];
  const osay = Game.say;
  Game.say = function (m) { sayLines.push(String(m)); return osay ? osay.call(this, m) : undefined; };
  const policy = Object.assign({}, leadfeast);
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const feastLines = sayLines.filter(l => /feast|feasted|FEASTED/i.test(l));
  console.log(`days=${result.days} ${result.endReason} feastSayLines=${feastLines.length} totalSay=${sayLines.length}`);
  console.log('\n-- first 12 feast-adjacent lines --');
  feastLines.slice(0, 12).forEach(l => console.log('  ' + l.slice(0, 220)));
  console.log('\n-- last 6 feast-adjacent lines --');
  feastLines.slice(-6).forEach(l => console.log('  ' + l.slice(0, 220)));
  try {
    const snap = (result.samples.villagers || []).slice(-1)[0];
    console.log('\n-- final villager snapshot (vid occ profile xp{t/s/b} kills) --');
    for (const v of (snap || [])[1] || []) {
      console.log(`  ${v.vid} occ=${v.occ} prof=${v.profile} xp=${v.xp.t}/${v.xp.s}/${v.xp.b} kills=${v.kills} exped=${v.exped} abils=${(v.abilities||[]).slice(0,3).join(',')}`);
    }
  } catch (e) { console.log('snapshot read failed:', e.message); }
  delete process.env.FEASTSCALE_R13;
})().catch(e => { console.error('HARNESS FAILURE:', e); process.exit(2); });
