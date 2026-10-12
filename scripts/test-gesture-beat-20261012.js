#!/usr/bin/env node
// test-gesture-beat-20261012.js — travel lever r4 proof.
// THE LEVER: "the first gesture is played." The first gesture (pendingAccord:
// gift 2,000 kcal / the representative's three days / cold ink) is the
// designed regional moment — but no sim policy ever answered it, so the
// gesture path (rep loans, trust deltas, the copy) was unmeasured. winseek
// now answers it (gift when the pantry can spare it, visit when a rep can
// walk, cold otherwise — a played choice, never silence).
// Same round, same bug class as r3's "A walks into the light": two more
// `.split(' ')[0]`-on-descriptor sites in regional/away-party copy:
//   - villager-objectives.js objReturnEffect: "🚶 Sofia is back — found A."
//   - membership.js loanedReturnTick: "A walks back in — days at X's fire"
// Both now name via _repName (descriptors used whole).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { winseek, accordRoad } = require('./policies/winseek');
const SEEDS = [4242, 7, 99];

let pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + label + (detail ? ' — ' + detail : '')); }
}

function descVid(Game) {
  const ros = Game.state.village.roster || [];
  for (const id of ros) {
    if (id === Game.villagerId) continue;
    try { if (/^a /i.test(Game.displayName(id) || '')) return id; } catch (e) {}
  }
  return null;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'gesturebeat', fullTelemetry: false });
  await setupGame(Game);
  const say = [];
  const osay = Game.say;
  Game.say = function (m) { if (typeof m === 'string') say.push(m); return osay.apply(this, arguments); };
  const saidClear = () => { say.length = 0; };
  const saidHas = (re) => say.some(m => re.test(m));

  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
  ok(ovs.length >= 1, 'setup: at least one other village', `n=${ovs.length}`);
  const A = ovs[0];

  // ---- 1. the policy answers the accord (gift path: fat pantry) ----
  // stock the pantry so the policy can afford the gift
  try {
    const v = Game.state.village || {}; v.pantry = v.pantry || [];
    v.pantry.push({ name: 'Test grain', kcalEach: 20000, units: 1, spoilDay: 999 });
  } catch (e) {}
  const link = Game._formLink(A.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  ok(!!Game.state.pendingAccord, '1a accord staged at link formation');
  saidClear();
  const ctx = {};
  accordRoad(Game, ctx);
  ok(!Game.state.pendingAccord, '1b policy answered the accord (pendingAccord cleared)');
  ok(ctx.accordAnswered === 1, '1c policy counted the answer', `accordAnswered=${ctx.accordAnswered}`);
  ok(saidHas(/first gesture|2,000 kcal|walks out to sit|cold ink|dries on its own/i),
    '1d the gesture was said aloud', say.join(' | ').slice(0, 160));

  // ---- 2. visit path: thin pantry, rep available -> loan issued ----
  const B = ovs[1] || A;
  Game._formLink(B.id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  // drain the pantry so gift is unaffordable
  try { (Game.state.village.pantry || []).length = 0; } catch (e) {}
  saidClear();
  const ctx2 = {};
  accordRoad(Game, ctx2);
  ok(!Game.state.pendingAccord, '2a accord answered on the visit path');
  let loaned = null;
  try { const m = Game.mshipState(); if (m && m.loaned) loaned = m.loaned; } catch (e) {}
  const repAvail = (() => { try { return !!Game._availableRepresentative(); } catch (e) { return false; } })();
  if (repAvail) {
    ok(!!loaned, '2b visit path loaned a representative (real absence)', JSON.stringify(loaned));
  } else {
    ok(saidHas(/cold|You go yourself/i), '2b no rep available: cold or player-visit, said aloud');
  }

  // ---- 3. "found A" is gone: return line names the whole descriptor ----
  const dv = descVid(Game);
  ok(!!dv, '3a found an unnamed (descriptor) villager for the return line');
  if (dv) {
    // fabricate a visit objective with an unnamed target
    let o = null;
    try { o = Game.objOf(dv); } catch (e) {}
    if (o) {
      o.kind = 'visit'; o.state = 'out'; o.targetVid = dv; o.companion = null;
      saidClear();
      try { Game.objReturnEffect(dv, 'visit'); } catch (e) { console.log('  objReturnEffect threw: ' + e.message); }
      const line = say.find(m => /is back/.test(m)) || '';
      ok(!/— found A[.]?$/.test(line.trim()), '3b no "found A" truncation', line.slice(0, 120));
      ok(/— found A person|— found A man|— found A woman/i.test(line) || /— found [A-Z]/.test(line),
        '3c return line names the found one honestly', line.slice(0, 120));
    } else {
      ok(false, '3b objOf returned nothing');
    }
  }

  // ---- 4. loanedReturnTick names the whole descriptor ----
  if (dv) {
    try {
      const m = Game.mshipState();
      m.loaned = { vid: dv, untilDay: ((Game.state.scholar || {}).day || 0) - 1, to: A.id };
    } catch (e) {}
    saidClear();
    try { Game.loanedReturnTick(); } catch (e) { console.log('  loanedReturnTick threw: ' + e.message); }
    const line = say.find(m => /walks back in|never made it home/.test(m)) || '';
    ok(!/^A walks back in/.test(line), '4a no "A walks back in"', line.slice(0, 120));
    ok(/walks back in|never made it home/.test(line), '4b the return is still said aloud', line.slice(0, 120));
  }

  console.log(`seed ${seed}: done`);
}

async function main() {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.log(`seed ${s} ERROR: ${e && e.message}`); fail++; } }
  console.log(`\nRESULT: ${pass} pass, ${fail} fail (seeds ${SEEDS.join(',')})`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
