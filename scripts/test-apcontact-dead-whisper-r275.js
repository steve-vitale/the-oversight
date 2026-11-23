// test-apcontact-dead-whisper-r275.js — journey-endgame r275 (lane B, 2026-11-23).
// PROOF for the r275 pilot finding on seed 107583: Rosa (the alien contact)
// died d90 in the betrayal fight (hostile-branch combat death) and spoke
// again d91 — "💬 Rosa says: 'They said you're doing well...'" — a dead
// villager whispering from the grave.
//
// The 2026-10-09 fix in alienPlayers.js guards this two ways:
//   (a) apContactedVillager only contacts the LIVING (roster filtered on
//       vpOf().dead), and
//   (b) apContactWarning releases a contact who died since establishment:
//       `if (cvp && cvp.dead) { delete ap.contactedVid; return false; }`
// Guard (b) reads vpOf(vid).dead — the data-record flag. This test asks,
// per death path, whether the flag is actually set when the villager dies:
//   A. HOSTILE combat death (the Rosa path): tbDamage's hostile branch
//      says the kill line, fires the murder event, and calls registerDeath
//      — but never tbVillagerFalls and never removeVillager('killed').
//   B. VILLAGER combat death: tbDamage's villager branch calls
//      tbVillagerFalls + registerDeath. tbVillagerFalls removes the
//      villager from the roster but never sets the data-record dead flag.
//   C. CONTROL — removeVillager('killed'): betrayal.js marks
//      rec.dead = true. The guard should release the contact; silence.
// A case FAILS if apContactWarning speaks the dead villager's name after
// that death path. A case PASSES if the contact is released (no line).
// Exit 0 only when all three pass (after the fix); exit 1 otherwise.
const { loadGame, setupGame } = require('./sim-harness');

function pickContact(Game) {
  const roster = (Game.state.village || {}).roster || [];
  const vid = roster.find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no non-scholar roster villager to contact');
  const ap = Game.apState();
  ap.contactedVid = vid;
  ap.lastContactWarningDay = -999; // clear the 4-day warning gap
  return vid;
}

function tryWarning(Game) {
  // Force the warning roll to pass and pick warning 0; capture say() lines.
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (l) { lines.push(String(l)); return origSay.apply(this, arguments); };
  const origRandom = Math.random;
  Math.random = () => 0.1;
  let warned = false;
  try { warned = !!Game.apContactWarning(); } finally { Math.random = origRandom; Game.say = origSay; }
  const spoke = lines.filter(l => /says:/.test(l));
  return { warned, spoke, contactStillSet: !!Game.apState().contactedVid };
}

async function runCase(label, seed, killFn) {
  const { Game } = await loadGame({ seed, mode: 'test-apcontact-dead-whisper', fullTelemetry: true, narration: true });
  await setupGame(Game, 'Columbus, Ohio');
  const vid = pickContact(Game);
  const name = Game.displayName(vid);
  let killErr = null;
  try { killFn(Game, vid); } catch (e) { killErr = e; }
  const vp = Game.vpOf(vid) || {};
  const res = tryWarning(Game);
  const deadFlag = !!vp.dead;
  const pass = !res.spoke.length && !res.contactStillSet;
  console.log(`[${label}] contact=${name} (${vid}) killErr=${killErr ? killErr.message : 'none'} vpOf.dead=${deadFlag} warned=${res.warned} spoke=${JSON.stringify(res.spoke)} contactStillSet=${res.contactStillSet} -> ${pass ? 'PASS' : 'FAIL (dead contact whispered)'}`);
  return pass;
}

(async () => {
  const results = [];
  // A. HOSTILE combat death — the Rosa path: registerDeath only, exactly
  //    what tbDamage's hostile branch does for its death-marking side.
  results.push(await runCase('A-hostile-combat', 107583, (Game, vid) => {
    Game.registerDeath({ kind: 'person', villagerId: vid, name: Game.displayName(vid), cause: 'combat', killerId: Game.villagerId, witnesses: [] });
  }));
  // B. VILLAGER combat death — tbVillagerFalls + registerDeath.
  results.push(await runCase('B-villager-combat', 107583, (Game, vid) => {
    Game.tbVillagerFalls({ villagerId: vid, kind: 'villager' });
    Game.registerDeath({ kind: 'person', villagerId: vid, name: Game.displayName(vid), cause: 'combat', witnesses: [] });
  }));
  // C. CONTROL — removeVillager('killed') marks rec.dead; guard must hold.
  results.push(await runCase('C-removeVillager-killed', 107583, (Game, vid) => {
    Game.removeVillager(vid, 'killed');
  }));
  console.log(results.every(Boolean) ? 'ALL PASS' : 'FAILURES PRESENT');
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e && e.stack || e); process.exit(2); });
