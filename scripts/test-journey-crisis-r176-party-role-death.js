'use strict';
// test-journey-crisis-r176-party-role-death.js -- R176 F1/F3 proof.
// DEAD MEMBER KEEPS PARTY ROLE (journey crisis r168 filed #3):
// Fatima died in the arena (d38) but "scout (held by Fatima)" still
// showed d39/d51. Root cause, two parts: (1) the only role-release on
// death was partyDeathBeat, called only from the tbVillagerFalls wrapper
// (field-fight deaths only); (2) partyDeathBeat's guard was inParty(),
// which requires roster membership — and every death path removes the
// villager from the roster BEFORE the beat can run, so the beat silently
// no-op'd for EVERY death. Fix: partyDeathBeat guards on the raw party
// array / role map; the tbVillagerFalls wrapper beats BEFORE orig (while
// membership is still readable); registerDeath (THE hook every villager
// death routes through) releases a held role too.
// F3 (same file): re-assigning a role the villager already holds said
// "X is Scout now" again (r168 d27 loop). assignRole now says "already".
// Cases (engine, real Game; one process, K.newRun per case):
// (1) contest-style death: roster removed FIRST (like _cxKillContestant),
//     then registerDeath -> role released, beat said exactly once.
// (2) field-fight death: tbVillagerFalls then registerDeath (the combat
//     path order) -> beat said exactly once, role released.
// (3) non-party death: registerDeath touches no role, says no beat.
// (4) role menu: after (1), the party_role list no longer shows the dead
//     holder.
// (5) F3: assignRole twice for the same role -> second says "already",
//     does not re-say the assignment.
// RED/FAILURE MODE: on the unfixed code (1)/(2) leave partyRoles[vid]
// set and say no beat line; (5) says "is Scout now" twice.
const K = require('./godpath/lib');
const T = K.reporter('R176 dead member keeps party role (engine)');

function livingRoster(G) {
  try { return (Game.state.village.roster || []).filter(id => ((Game.state.village.health || {})[id] ?? 100) > 0); } catch (e) { return []; }
}

(async () => {
  const G = await K.load({ seed: 43407 });
  const store = new Map();
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), key: i => [...store.keys()][i] ?? null, get length() { return store.size; } };

  function setup() {
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    s.languages = { english: 2 };
    s.langExposure = {};
    s.day = 10; s.dayTicks = 0; G.dayPart = 0; s.kcal = 6000; s.health = 100; s.hydration = 100; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.px = v.px ?? 4; v.py = v.py ?? 4; G.map.px = v.px; G.map.py = v.py;
    v.away = {}; v.engaged = {}; v.promises = {}; v.favorLedger = {};
    G.state.systemArrived = true;
    G.state.scholar.codexUnlocked = true;
    v.partyUnlocked = true;
    v.partyMax = 3;
  }
  function makeParty() {
    const v = G.state.village;
    const members = livingRoster(G).filter(id => id !== G.villagerId).slice(0, 2);
    if (members.length < 2) throw Error('setup: fewer than 2 living roster members');
    v.party = members.slice();
    v.trust = v.trust || {};
    for (const id of members) v.trust[id] = 90;
    v.partyName = 'The Test Party';
    return members;
  }
  // Capture say lines (beat lines go through Game.say).
  let said = [];
  const origSay = G.say;
  G.say = function (text) { try { said.push(String(text)); } catch (e) {} return origSay.call(G, text); };
  const beatLines = () => said.filter(t => /the role sits empty now/.test(t));
  const resetSaid = () => { said = []; };

  // (1) contest-style death: roster removed first, then registerDeath.
  setup();
  const [A1, B1] = makeParty();
  let r = G.assignRole(A1, 'scout');
  T.ok('setup (1): assignRole scout ok', !!r.ok, 'assignRole failed: ' + JSON.stringify(r));
  T.ok('setup (1): role held before death', G.partyFormalState().partyRoles[A1] === 'scout', 'role=' + JSON.stringify(G.partyFormalState().partyRoles));
  resetSaid();
  G.state.village.roster = G.state.village.roster.filter(id => id !== A1); // _cxKillContestant order
  G.registerDeath({ kind: 'villager', villagerId: A1, name: G.displayName(A1), cause: 'contest', killerId: null });
  T.ok('(1) contest death releases the role', !G.partyFormalState().partyRoles[A1], 'partyRoles=' + JSON.stringify(G.partyFormalState().partyRoles));
  T.ok('(1) contest death beats exactly once', beatLines().length === 1, 'beat lines=' + beatLines().length + ' :: ' + JSON.stringify(beatLines()));
  T.ok('(1) contest death removes from party array', !(G.state.village.party || []).includes(A1), 'party=' + JSON.stringify(G.state.village.party));

  // (2) field-fight death: tbVillagerFalls then registerDeath (combat order).
  setup();
  const [A2, B2] = makeParty();
  r = G.assignRole(A2, 'scout');
  T.ok('setup (2): assignRole scout ok', !!r.ok, 'assignRole failed: ' + JSON.stringify(r));
  resetSaid();
  G.tbVillagerFalls({ kind: 'villager', villagerId: A2, name: G.displayName(A2) });
  G.registerDeath({ kind: 'person', villagerId: A2, name: G.displayName(A2), cause: 'combat', witnesses: [] });
  T.ok('(2) field-fight death releases the role', !G.partyFormalState().partyRoles[A2], 'partyRoles=' + JSON.stringify(G.partyFormalState().partyRoles));
  T.ok('(2) field-fight death beats exactly once', beatLines().length === 1, 'beat lines=' + beatLines().length + ' :: ' + JSON.stringify(beatLines()));

  // (3) non-party death touches nothing.
  setup();
  const [A3, B3] = makeParty();
  r = G.assignRole(A3, 'scout');
  T.ok('setup (3): assignRole scout ok', !!r.ok, 'assignRole failed');
  const outsider = livingRoster(G).find(id => id !== G.villagerId && id !== A3 && id !== B3);
  T.ok('setup (3): outsider exists', !!outsider, 'no outsider on roster');
  resetSaid();
  G.registerDeath({ kind: 'villager', villagerId: outsider, name: G.displayName(outsider), cause: 'wild', killerId: null });
  T.ok('(3) non-party death keeps the role', G.partyFormalState().partyRoles[A3] === 'scout', 'partyRoles=' + JSON.stringify(G.partyFormalState().partyRoles));
  T.ok('(3) non-party death says no beat', beatLines().length === 0, 'beat lines=' + beatLines().length);

  // (4) role menu no longer shows the dead holder.
  setup();
  const [A4, B4] = makeParty();
  r = G.assignRole(A4, 'scout');
  T.ok('setup (4): assignRole scout ok', !!r.ok, 'assignRole failed');
  G.state.village.roster = G.state.village.roster.filter(id => id !== A4);
  G.registerDeath({ kind: 'villager', villagerId: A4, name: G.displayName(A4), cause: 'contest', killerId: null });
  const s4 = G.startConvo(B4);
  T.ok('setup (4): convo opens', !!s4 && !s4.refused, 'startConvo refused/ended');
  const c4 = G.convoGet(B4);
  const menuLine = G.partyConvoTurn(B4, 'party_role', c4);
  const menuText = (menuLine && menuLine.line) || '';
  const deadFirst = G.displayName(A4).split(' ')[0];
  T.ok('(4) role menu hides the dead holder', !menuText.includes('(held by ' + deadFirst + ')'), 'menu still shows dead holder :: ' + JSON.stringify(menuText));
  try { G.endConvo(B4, 'left'); } catch (e) {}

  // (5) F3: re-assigning the same role says "already", not "is Scout now".
  setup();
  const [A5, B5] = makeParty();
  resetSaid();
  const first = G.assignRole(A5, 'scout');
  T.ok('setup (5): first assign ok', !!first.ok, 'first assign failed');
  T.ok('setup (5): first assign says the assignment', said.some(t => /is .* Scout now/.test(t)), 'said=' + JSON.stringify(said));
  resetSaid();
  const second = G.assignRole(A5, 'scout');
  T.ok('(5) re-assign returns ok', !!second.ok, 'second assign failed: ' + JSON.stringify(second));
  T.ok('(5) re-assign flags already', second.already === true, 'already=' + JSON.stringify(second));
  T.ok('(5) re-assign says already, not the assignment', said.some(t => /already .* Scout/.test(t)) && !said.some(t => /is .* Scout now/.test(t)), 'said=' + JSON.stringify(said));
  T.ok('(5) re-assign keeps the role', G.partyFormalState().partyRoles[A5] === 'scout', 'partyRoles=' + JSON.stringify(G.partyFormalState().partyRoles));

  T.done();
})().catch(e => { console.error('R176 party-role-death proof CRASH:', e && e.stack || e); process.exit(1); });
