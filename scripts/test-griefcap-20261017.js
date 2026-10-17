#!/usr/bin/env node
// test-griefcap-20261017.js — proof test for the uncapped grief-stacking
// blank (scale r4, 8705: tribute 5k→35k/week across five primary-speaker
// deaths in one season; pantry 71.6k→0, the national run lost).
//
// Root cause: three ×1.5 grief-leverage sites (successionCrisis for a
// Haven-subordinate link, theirSpeakerDied for a Haven-primary link,
// _resolveRenegotiation for a lapsed young link) compound without bound.
// The 2026-10-11 GRIEF COALESCES guard blocks burst deaths inside the
// mourning window, but slow-burn stacking across a season compounds
// freely: 5000 × 1.5^5 ≈ 38k.
//
// Balance call (gap-closure 2026-10-17): grief is leverage — twice per
// link. The third grab is refused aloud ("the grief card is spent"),
// tribute unchanged; the trust −8 still applies (the death still hurts
// the relationship). The fiction is coherent; the uncapped exponent was
// the bug.
//
// Pre-registration:
//   PRIMARY: 3 successive primary-speaker deaths on one Haven-subordinate
//   link, mourning windows expired between (the slow-burn shape GRIEF
//   COALESCES doesn't cover): grab 1 → 7500, grab 2 → 11250, grab 3 →
//   refused (tribute stays 11250, "spent" beat voiced).
//   GUARDRAIL: trust −8 still applies on the refused grab.
// RED (pre-fix): grab 3 compounds to 16875.
// GREEN (post-fix): grab 3 refused, tribute 11250, "spent" voiced.
// RNG is seeded by loadGame (mulberry32 BEFORE eval) — deterministic.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'proof-griefcap' });
  await setupGame(Game);
  let fails = 0;
  const fail = (m) => { fails++; console.log('  FAIL:', m); };

  const said = [];
  const realSay = Game.say;
  Game.say = function (t) { said.push(String(t)); try { return realSay.call(this, t); } catch (e) { return t; } };

  const day0 = (Game.state.scholar || {}).day || 0;
  const links = Game.hierarchyState();
  const link = {
    id: 'link-griefcap-test', status: 'active', kind: 'charter',
    subordinate: 'haven', primary: 'v-griefcap', // Haven subordinate
    trust: 60, tributeKcalPerWeek: 5000, day: -30,
    lastKeptDay: day0, mourningUntil: 0, pendingRenegotiation: null,
  };
  links.push(link);

  const tributes = [];
  for (let i = 1; i <= 3; i++) {
    // Slow burn: the mourning window expired between deaths (GRIEF
    // COALESCES covers burst; this is the shape it doesn't).
    link.mourningUntil = 0;
    link.pendingRenegotiation = null;
    const r = Game.successionCrisis(link.id);
    tributes.push(link.tributeKcalPerWeek);
    console.log(`grab ${i}: result=${r} tribute=${link.tributeKcalPerWeek} trust=${link.trust} griefGrabs=${link.griefGrabs || 0}`);
  }
  Game.say = realSay;

  if (tributes[0] !== 7500) fail(`grab 1: tribute ${tributes[0]} (expected 7500)`);
  else console.log('grab 1 ok: 5000 -> 7500');
  if (tributes[1] !== 11250) fail(`grab 2: tribute ${tributes[1]} (expected 11250)`);
  else console.log('grab 2 ok: 7500 -> 11250');
  if (tributes[2] !== 11250) {
    fail(`grab 3: tribute ${tributes[2]} (expected 11250 — refused) — uncapped stacking compounds to ${tributes[2]}`);
  } else {
    console.log('grab 3 ok: refused, tribute stays 11250');
  }
  const spentVoiced = said.some(t => /grief card is spent|heard it before/i.test(t));
  if (tributes[2] === 11250 && !spentVoiced) fail('grab 3: tribute refused but no "spent" beat was voiced');
  else if (spentVoiced) console.log('spent beat ok: voiced aloud');
  if (link.trust !== 36) fail(`guardrail: trust ${link.trust} after 3 grabs (expected 60-24=36 — the death still hurts)`);
  else console.log('guardrail ok: trust -8 applied on every grab, including the refused one');

  // Fixture hygiene: remove the test link so no later test in this
  // process sees it (one harness per process anyway, but be clean).
  const ix = links.indexOf(link);
  if (ix !== -1) links.splice(ix, 1);

  if (fails) { console.log(`\nRED: ${fails} failing assertion(s)`); process.exit(1); }
  console.log('\nGREEN: grief leverage capped at 2 grabs per link');
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
