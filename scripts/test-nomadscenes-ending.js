// Proof: nomad-scenes playEnding — light/dark composition, party epilogue.
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', msg); }
}

async function main() {
  const seed = parseInt(process.env.SEED || '1201', 10);
  const { Game } = await loadGame({ seed, narration: true });
  await setupGame(Game, 'Columbus, Ohio');

  // ---- light ----
  const light = Game.nomadScenes.playEnding({
    foundKin: ['Mara Voss', 'Joren Voss'],
    villageLeft: { name: 'Haven', fate: 'endures' },
    daysOnRoad: 96, partyIds: [],
  });
  ok(light && light.moral === 'light', 'light moral when village endures');
  ok(light.title === 'The Long Way Home', 'title exact');
  ok(light.lines.some(l => l.indexOf('We were never lost; we were just far apart.') !== -1),
    'light carries the spec line verbatim');
  ok(light.lines.some(l => l.indexOf('Mara Voss') !== -1), 'light names found kin');
  ok(light.lines.filter(l => l.indexOf('◈') !== 0).every(l => /you|your|we/i.test(l)),
    'light: narration second person or choral we (headers exempt)');

  // ---- dark: the village left behind fell ----
  const dark = Game.nomadScenes.playEnding({
    foundKin: ['Mara Voss'],
    villageLeft: { name: 'Haven', fate: 'fell' },
    daysOnRoad: 141, partyIds: [],
  });
  ok(dark && dark.moral === 'dark', 'dark moral when village fell');
  ok(dark.lines.some(l => /what it cost/i.test(l)), 'dark carries the cost verse');
  ok(dark.lines.some(l => l.indexOf('Haven') !== -1), 'dark names the fallen village');

  // ---- settled without finding everyone ----
  const settled = Game.nomadScenes.playEnding({
    foundKin: [], villageLeft: { name: 'Haven', fate: 'endures' },
    daysOnRoad: 200, partyIds: [], settled: true,
  });
  ok(settled && settled.moral === 'light', 'settle-empty is light, not broken');
  ok(settled.lines.some(l => /stop/i.test(l)), 'settle: acknowledges stopping');

  // ---- party epilogue: a party member's found kin appears ----
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length) {
    const pid = roster[0];
    const pk = (Game.state.world.kin || []).find(k => k.owner === pid && k.fate === 'scattered');
    if (pk) {
      pk.found = true;
      const ep = Game.nomadScenes.playEnding({
        foundKin: ['Mara Voss'], villageLeft: { name: 'Haven', fate: 'endures' },
        daysOnRoad: 100, partyIds: [pid],
      });
      ok(ep.lines.some(l => l.indexOf(pk.name) !== -1), 'epilogue names party member found kin (' + pk.name + ')');
    } else { console.log('SKIP: party member has no scattered kin this seed'); }
  } else { console.log('SKIP: no party members this seed'); }

  // ---- null-safe ----
  ok(Game.nomadScenes.playEnding(null) !== null, 'null data does not crash');

  console.log(`nomadscenes-ending: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
