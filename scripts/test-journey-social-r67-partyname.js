// test-journey-social-r67-partyname.js -- PROOF for the r67 party-naming
// fix (scripts: party-formal.js convo wrapper + menu builder).
// Journey social r67 found, on a full-run seed, 192 mid-conversation
// party_name turns that added zero transcript entries: the party-naming
// beat is offered (party member, no name yet) but tapping it speaks
// nothing into the transcript and the name-pick sub-menu is never
// offered by convoChoices — the wrapper returns the sub-choices in a
// single return value that chatChoice ignores, so naming can never
// complete through conversation and roles (gated on a name) never open.
// This test proves, on a fixture game: (1) party_name is offered,
// (2) tapping it grows the transcript, (3) convoChoices then offers
// party_namepick:* options, (4) picking one actually names the party,
// (5) the same holds for the party_role beat once named.
// Run with SEED=42 and SEED=7 (two separate processes; the harness is
// single-run per process). A miss here fails the fix before any r67
// seed re-runs; it is not a wild-run result.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('r67-partyname');
(async () => {
  const SEED = Number(process.env.SEED || 42);
  const G = await K.load({ seed: SEED, narration: false });
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  const vid = v.roster.find(id => id !== G.villagerId && G.getPerson(id));
  if (!vid) throw Error('No living conversation target');
  try { if (G.revealName) G.revealName(vid, 'intro'); } catch (e) {}
  const person = G.getPerson(vid);
  person.languages = { native: 'english', levels: { english: 2 } };
  s.languages = { english: 2 };
  Object.assign(G.npcNeeds(vid), { hunger: 10, fear: 10, social: 10, energy: 90 });
  v.health = v.health || {}; v.health[vid] = 100; v.sick = v.sick || {}; delete v.sick[vid];
  v.trust = v.trust || {}; v.trust[vid] = 30; s.kcal = 50000;
  // Formal-party fixture, the real way: System arrived + codex unlocked
  // + village flag + the villager on the party list (party.js).
  G.state.systemArrived = true;
  s.codexUnlocked = true;
  v.partyUnlocked = true;
  v.party = [vid];
  T.ok('party fixture: unlocked and villager in party', !!(G.partyUnlocked && G.partyUnlocked() && G.inParty && G.inParty(vid)), 'unlocked=' + (G.partyUnlocked && G.partyUnlocked()) + ' inParty=' + (G.inParty && G.inParty(vid)));
  T.ok('party starts unnamed', !G.partyName || !G.partyName(), String(G.partyName && G.partyName()));

  G.startConvo(vid);
  const c0 = G.convoGet(vid);
  T.ok('conversation opens', !!(c0 && c0.active), c0 ? 'active=' + c0.active : 'no convo');
  // The opener owns the first menu (a question owns its decision menu),
  // so walk past it with neutral picks until party_name is offered —
  // the journey driver sees it offered mid-conversation, not at open.
  let nameItem = null, walked = 0;
  for (let t = 0; t < 12 && !nameItem; t++) {
    const ch = G.convoChoices(vid) || [];
    nameItem = ch.find(x => String(x.id || '') === 'party_name');
    if (nameItem) break;
    const pick = ch.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) break;
    try { G.convoTurn(vid, pick.id); walked++; } catch (e) { break; }
    if (!(G.convoGet(vid) || {}).active) break;
  }
  T.ok('party_name is offered to a party member', !!nameItem, 'walked=' + walked + ' lastMenu=' + JSON.stringify((G.convoChoices(vid) || []).map(x => x.id)));

  const beforeLen = (G.convoGet(vid).transcript || []).length;
  const stName = G.convoTurn(vid, 'party_name');
  const afterLen = (G.convoGet(vid).transcript || []).length;
  T.ok('party_name turn speaks into the transcript', afterLen > beforeLen, 'before=' + beforeLen + ' after=' + afterLen + ' returnedLine=' + JSON.stringify(stName && stName.line ? stName.line.slice(0, 80) : stName && stName.line));
  const choices1 = G.convoChoices(vid) || [];
  const picks = choices1.filter(x => String(x.id || '').indexOf('party_namepick:') === 0);
  T.ok('name-pick options are offered after party_name', picks.length > 0, JSON.stringify(choices1.map(x => x.id)));
  if (picks.length) {
    const want = (G.convoGet(vid).pendingPartyNames || [])[0];
    const stPick = G.convoTurn(vid, picks[0].id);
    T.ok('picking a name names the party', !!(G.partyName && G.partyName()), 'partyName=' + (G.partyName && G.partyName()) + ' want=' + want + ' returnedLine=' + JSON.stringify(stPick && stPick.line));
    if (want) T.ok('picked name is one of the offered names', G.partyName() === want || (G.convoGet(vid).pendingPartyNames || []).includes(G.partyName()), 'partyName=' + G.partyName() + ' want=' + want);
    // Roles open once named, through the same path.
    const choices2 = G.convoChoices(vid) || [];
    const roleItem = choices2.find(x => String(x.id || '') === 'party_role');
    T.ok('party_role is offered once named', !!roleItem, JSON.stringify(choices2.map(x => x.id)));
    if (roleItem) {
      const b2 = (G.convoGet(vid).transcript || []).length;
      G.convoTurn(vid, 'party_role');
      const a2 = (G.convoGet(vid).transcript || []).length;
      T.ok('party_role turn speaks into the transcript', a2 > b2, 'before=' + b2 + ' after=' + a2);
      const choices3 = G.convoChoices(vid) || [];
      const rolePicks = choices3.filter(x => String(x.id || '').indexOf('party_rolepick:') === 0);
      T.ok('role-pick options are offered after party_role', rolePicks.length > 0, JSON.stringify(choices3.map(x => x.id)));
      if (rolePicks.length) {
        G.convoTurn(vid, rolePicks[0].id);
        T.ok('picking a role assigns it', !!(G.roleOf && G.roleOf(vid)), 'role=' + (G.roleOf && G.roleOf(vid)));
      }
    }
  }
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
