'use strict';
// sense-test: capture a feast evening's transcript from a live sim (r13)
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
async function main() {
  const seed = parseInt(process.argv[2] || '22', 10);
  const { Game } = await loadGame({ seed, mode: 'sense-feast' });
  await setupGame(Game);
  const says = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (m) { says.push({ day: (Game.state.scholar || {}).day || 0, part: Game.dayPart, m: String(m) }); return origSay(m); };
  const feastDays = [];
  const oh = Game.hostFeast.bind(Game);
  Game.hostFeast = function (...a) {
    const r = oh.apply(this, a);
    if (r && r.ok) feastDays.push((Game.state.scholar || {}).day || 0);
    return r;
  };
  await runDays(Game, belongfeast, { days: 100, sampleEvery: 10 });
  const d = feastDays[Math.min(2, feastDays.length - 1)];
  console.log('feast days:', feastDays.join(','));
  console.log('--- transcript: the feast evening (day ' + d + ') ---');
  for (const s of says.filter(x => x.day === d || x.day === d - 1)) {
    if (/FEAST|🍖|surge|keepsake|tribute|Tribute/i.test(s.m)) console.log(`[d${s.day} p${s.part}] ${s.m}`);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
