// RED/GREEN probe: snare_wire skill ranks -> hunt.trap_catch (player trapline).
// Uses the shared kit (scripts/godpath/lib.js). Never copies eval boilerplate.
// RED (unwired): modTarget('hunt.trap_catch', 0.4) stays 0.4 regardless of skill.
// GREEN (wired): L2 -> 0.6, L3 -> 1.0 (before the 0.95 cap at the checkTraps call site).
'use strict';
const K = require('./godpath/lib');

(async () => {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const S = globalThis.Scattering;

  const control = Game.modTarget('hunt.trap_catch', 0.4);
  console.log('CONTROL (no skill)  trap_catch =', control.toFixed(3));

  Game.learnSkill('snare_wire', 2, 'probe');
  const l2 = Game.modTarget('hunt.trap_catch', 0.4);
  console.log('L2                 trap_catch =', l2.toFixed(3));

  Game.learnSkill('snare_wire', 3, 'probe');
  const l3 = Game.modTarget('hunt.trap_catch', 0.4);
  console.log('L3 (cumulative)    trap_catch =', l3.toFixed(3));

  const km = S.modifiers.collectKnowledgeModifiers(
    { snare_wire: { level: 3 } },
    Game.data.knowledge
  ).filter(m => m.target === 'hunt.trap_catch');
  console.log('knowledge modifiers at L3:', JSON.stringify(km.map(m => ({ op: m.op, value: m.value, source: m.source }))));

  console.log('checkTraps effective at L3 (after 0.95 cap) =', Math.min(0.95, l3).toFixed(3));

  const ok = Math.abs(control - 0.4) < 1e-9 && Math.abs(l2 - 0.6) < 1e-9 && Math.abs(l3 - 1.0) < 1e-9;
  console.log(ok ? 'PROBE: WIRED (bonus flows end-to-end)' : 'PROBE: NOT WIRED');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('PROBE FAILED:', e); process.exit(2); });
