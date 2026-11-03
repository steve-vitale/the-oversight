#!/usr/bin/env node
// test-peer-tend-r92-20261103.js — PROOF for journey-scale r92 Q2.
//
// BLANK (carried from r91): the covenant road stalls one tending short of
// national (r91 quad: peer trusts 35/29/17/39 vs the seasoned 40), and
// Tended = 0 everywhere — not just a bot fact. tendLink (hierarchy.js)
// refuses every peer link: it requires link.primary === HOME, but peer
// links are formed with primary: null, subordinate: null (a/b shape).
// The Haven panel still shows peer links a "Send grain (1,500 kcal)"
// button, so a player pressing it hears "There is no bond of ours to
// tend there." and nothing moves. The LEAD road got its verb in the
// 2026-10-12 scale-wall fix; peers never did. Worse, the panel renders
// a peer link as "them bows to Haven" (other resolves via subordinate,
// which is null for peers) and would throw on its missing tribute
// field — fixed alongside in app.js (DOM-only, not asserted here).
//
// RED on pristine HEAD: peer tend returns 0, trust stays 30, no grain
// line, peer pantry uncredited. GREEN post-fix: 1,500 kcal → +8 trust,
// once per week, mourning choke, partial-pantry partial gain, peer
// pantry credited, LEAD behavior unchanged, BELONG links still refused.
// No gate, threshold, or cap changes: the seasoned bar (30d + trust 40)
// is untouched — this adds the verb, not a lower bar.
//
// Usage: node scripts/test-peer-tend-r92-20261103.js
'use strict';
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

function topUp(Game, kcalEach, units) {
  const v = Game.state.village || {};
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'test grain', kcalEach, units, spoilDay: 9999 });
}
function pantryKcal(Game) {
  let t = 0;
  for (const it of ((Game.state.village || {}).pantry || [])) t += (it.kcalEach || 0) * (it.units || 0);
  return t;
}

async function main() {
  Math.random = mulberry32(777);
  const { Game } = await loadGame({ seed: 777, mode: 'peer-tend-r92', fullTelemetry: false });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  await runDays(Game, competent, { days: 6 });

  const ovs = Game.state.otherVillages || [];
  check('other-villages-exist', ovs.length >= 1, `otherVillages=${ovs.length}`);
  if (!ovs.length) { console.log(`\n${pass} passed, ${fail} failed`); process.exit(1); }
  const ov = ovs[0];
  const day = (Game.state.scholar || {}).day || 0;

  // A REAL peer link through the engine's own formation (not a hand-made
  // object): _formPeerLink is what proposeCovenant calls on acceptance.
  let peer = null;
  if (typeof Game._formPeerLink === 'function') peer = Game._formPeerLink(ov.id, { kind: 'covenant' });
  if (!peer) {
    peer = { id: 'test-peer-1', kind: 'covenant', a: 'haven', b: ov.id, primary: null, subordinate: null, trust: 30, history: [], status: 'active', day };
    Game.hierarchyState().push(peer);
  }
  check('peer-shape', peer.primary == null && peer.subordinate == null && peer.trust === 30,
    `primary=${peer.primary} subordinate=${peer.subordinate} trust=${peer.trust}`);
  const ovPantry0 = ov.pantryKcal || 0;

  // ---- the tend itself ----
  topUp(Game, 1500, 3);
  const mark = says.length;
  const paid = Game.tendLink(peer.id);
  const beat = says.slice(mark).join('\n');
  check('peer-tend-paid', paid === 1500, `paid=${paid}`);
  check('peer-tend-trust', peer.trust === 38, `trust=${peer.trust}`);
  check('peer-tend-line', /Haven sends 1,500 kcal of grain to/.test(beat) && beat.includes(ov.name || 'them'),
    beat.slice(0, 160) || 'no line');
  check('peer-tend-credit', (ov.pantryKcal || 0) === ovPantry0 + 1500,
    `ovPantry ${ovPantry0} -> ${ov.pantryKcal}`);
  check('peer-tend-note', (peer.history || []).some(h => (h.kind === 'tended') || /tended/.test(h.note || '')),
    `history=${JSON.stringify((peer.history || []).slice(-2))}`);

  // ---- once per week ----
  const paid2 = Game.tendLink(peer.id);
  check('peer-tend-weekly-dedup', paid2 === 0 && peer.trust === 38, `paid2=${paid2} trust=${peer.trust}`);

  // ---- mourning choke (dedup cleared so the choke is what refuses) ----
  peer.tendedWeek = -1;
  peer.mourningUntil = day + 7;
  const pantryBeforeMourn = pantryKcal(Game);
  const paidM = Game.tendLink(peer.id);
  check('peer-tend-mourning', paidM === 0 && peer.trust === 38 && pantryKcal(Game) === pantryBeforeMourn,
    `paidM=${paidM} trust=${peer.trust}`);

  // ---- partial pantry, partial gain ----
  peer.mourningUntil = 0;
  peer.tendedWeek = -1;
  Game.state.village.pantry = [{ name: 'test grain', kcalEach: 500, units: 1, spoilDay: 9999 }];
  const paidP = Game.tendLink(peer.id);
  check('peer-tend-partial', paidP === 500 && peer.trust === 41, `paidP=${paidP} trust=${peer.trust}`);

  // ---- LEAD behavior unchanged ----
  const lead = { id: 'test-lead-1', primary: 'haven', subordinate: ov.id, trust: 30, history: [], status: 'active', day };
  Game.hierarchyState().push(lead);
  topUp(Game, 1500, 1);
  const paidL = Game.tendLink(lead.id);
  check('lead-tend-unchanged', paidL === 1500 && lead.trust === 38, `paidL=${paidL} trust=${lead.trust}`);

  // ---- BELONG links still refused (tending your overlord is not the verb) ----
  const belong = { id: 'test-belong-1', primary: ov.id, subordinate: 'haven', trust: 30, history: [], status: 'active', day };
  Game.hierarchyState().push(belong);
  const paidB = Game.tendLink(belong.id);
  check('belong-still-refused', paidB === 0 && belong.trust === 30, `paidB=${paidB} trust=${belong.trust}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('TEST ERROR:', e && e.stack || e); process.exit(2); });
