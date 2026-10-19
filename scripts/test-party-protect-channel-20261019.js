#!/usr/bin/env node
// test-party-protect-channel-20261019.js — proof for r24 blank.
// BLANK: ledger.js's registerDeath wrap reads `this.state.party` (never
// written outside debug-scenarios) instead of `this.state.village.party`
// (the real party, party.js/party-formal.js). Party-present monster kills
// should ledgerAdd('protected', 1) — the beloved-light channel r23 named.
// RED = no protected accrues with a real party formed; GREEN = +1 per kill.
// alienPlayers.js apReadinessCheck reads the same wrong path (documents the
// sibling instance; the fix covers ledger only, per lane discipline — the
// alien-players one is lane A's lever domain if they want it).
'use strict';
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 9031, mode: 'party-protect-red' });
  await setupGame(Game);
  const checks = [];
  const ok = (name, cond, detail) => {
    checks.push({ name, pass: !!cond, detail: detail || '' });
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  };

  // Form a real party in the real state path.
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const v = Game.partyState();
  v.party = roster.slice(0, 2); // two party members, day-0 style
  ok('party formed at state.village.party', (v.party || []).length === 2, 'n=' + (v.party || []).length);
  ok('state.party is NOT written (the bug)', !Game.state.party, 'state.party=' + JSON.stringify(Game.state.party));

  const before = (Game.ledger() || {}).protected || 0;
  try {
    Game.registerDeath({ kind: 'monster', killerId: Game.villagerId, name: 'test hushwolf' });
  } catch (e) { ok('registerDeath threw', false, String(e && e.message).slice(0, 120)); }
  const after = (Game.ledger() || {}).protected || 0;
  ok('party-present monster kill adds protected +1', after === before + 1,
    `before=${before} after=${after}`);
  // a second kill should add another
  Game.registerDeath({ kind: 'monster', killerId: Game.villagerId, name: 'test hushwolf 2' });
  const after2 = (Game.ledger() || {}).protected || 0;
  ok('second kill stacks to +2', after2 === before + 2, `after2=${after2}`);

  // solo kill (no party) should NOT add protected
  v.party = [];
  Game.registerDeath({ kind: 'monster', killerId: Game.villagerId, name: 'solo hushwolf' });
  const after3 = (Game.ledger() || {}).protected || 0;
  ok('solo kill adds no protected', after3 === after2, `after3=${after3}`);

  const fails = checks.filter(c => !c.pass);
  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
