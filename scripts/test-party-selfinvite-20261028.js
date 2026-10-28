#!/usr/bin/env node
// test-party-selfinvite-20261028.js — proof for journey establishment r51.
// BLANK (r51, 2026-10-28): the establishment panel's census/gossip
// sittings conversed with the bearer as if they were an NPC (the roster
// includes the bearer), and the party-invite path evaluated the bearer
// as a candidate: npcInviteDecision(bearer, bearer) accepted, pushing
// the bearer into their own party (r51: 3/2/1 self-invite rows on
// 209/228/239). inviteToParty has guards for system/codex/party-full/
// roster/trust — but no self guard.
// FIX: inviteToParty refuses vid === villagerId outright, before any
// decision roll, so you can never invite yourself.
// RED (HEAD code) = self invite reaches the decision path (accepted, or
// declined with an ordinary line — never the self refusal).
// GREEN (fixed code) = self invite refused with the self message, bearer
// never enters the party, and an ordinary invite still runs its path.
// State setup only (unlock flags + trust); the method under test runs
// fully, unstubbed.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 209, mode: 'party-selfinvite' });
  await setupGame(Game);
  const checks = [];
  const ok = (name, cond, detail) => {
    checks.push({ name, pass: !!cond, detail: detail || '' });
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  };
  const v = Game.state.village;
  v.partyUnlocked = true;
  Game.state.systemArrived = true;
  Game.state.scholar.codexUnlocked = true;
  v.party = [];
  v.trust = v.trust || {};
  const bearer = Game.villagerId;
  const other = (v.roster || []).filter(id => id !== bearer)[0];
  if (!bearer || !other) { console.log('FAIL no bearer/other in roster'); process.exit(1); }
  v.trust[bearer] = 90;
  v.trust[other] = 90;

  const rSelf = Game.inviteToParty(bearer);
  ok('self invite refused', rSelf && rSelf.ok === false, 'ok=' + (rSelf && rSelf.ok) + ' msg=' + (rSelf && rSelf.msg));
  ok('self refusal names the self', rSelf && /that's you/i.test(rSelf.msg || ''), 'msg=' + (rSelf && rSelf.msg));
  ok('bearer never enters party via self invite', !(v.party || []).includes(bearer), 'party=' + JSON.stringify(v.party));

  const rOther = Game.inviteToParty(other);
  ok('ordinary invite runs its own path (not the self refusal)', rOther && !/that's you/i.test(rOther.msg || ''), 'ok=' + (rOther && rOther.ok) + ' msg=' + (rOther && rOther.msg));
  ok('bearer still not in party after ordinary invite', !(v.party || []).includes(other && bearer) && !(v.party || []).includes(bearer), 'party=' + JSON.stringify(v.party));

  const failed = checks.filter(c => !c.pass);
  console.log(failed.length ? ('RESULT FAIL ' + failed.length + '/' + checks.length) : ('RESULT PASS ' + checks.length + '/' + checks.length));
  process.exit(failed.length ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
