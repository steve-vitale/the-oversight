#!/usr/bin/env node
// test-knower-ledger.js — knower-ledger BUILD proof (gaps2-knower, 2026-10-29).
// Builds on the build-map audit (evidence/2026-10-29/build-map-knower-arrivals.md):
// the audit proved knower-trace DOES NOT TRACE CLEANLY (anonymous rumor opens
// the gate for everyone; 8 NPC sites read the player flag; peer proposals skip
// the gate; region entries carry no knower). This script proves the BUILD:
//  - a per-knower villageLore store exists (knowledge belongs to a knower);
//  - a rumor grants ONLY on delivery/read (roll alone opens nothing);
//  - all 4 leak classes are closed (see bars L1-L6 below);
//  - player legacy is preserved (visit flags + delivered rumors still count);
//  - raidVillage stays ungated by design (audit K5, confirmed-by-design).
// DECIDED CALL under test (Steve may overrule): peer proposals for
// covenant/trade ARE gated on knower-traced knowledge like proposeLink.
// Uses the shared sim harness (loadGame + setupGame), never copied eval code.
// Run: node scripts/test-knower-ledger.js  (exit 1 on any failure)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [7, 42, 99];
let passes = 0, fails = 0;
const failures = [];
function check(cond, msg) {
  if (cond) { passes++; console.log('  ok: ' + msg); }
  else { fails++; failures.push(msg); console.log('  FAIL: ' + msg); }
}
function skip(msg) { console.log('  SKIP: ' + msg); }

function loreEntry(Game, knowerId, villageId) {
  try {
    if (typeof Game.villageLoreEntry === 'function') return Game.villageLoreEntry(knowerId, villageId);
    const store = Game.state && Game.state.village && Game.state.village.villageLore;
    return (store && store[knowerId] && store[knowerId][villageId]) || null;
  } catch (e) { return null; }
}

async function runSeed(seed) {
  console.log(`\n=== seed ${seed} ===`);
  const { Game } = await loadGame({ seed, narration: true });
  const lines = [];
  const realSay = Game.say;
  Game.say = function (...a) { lines.push(a.join(' ')); try { return realSay.apply(this, a); } catch (e) { return null; } };
  const saySince = (n) => lines.slice(n).join(' ');
  await setupGame(Game, 'Columbus, Ohio');

  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
  check(ovs.length >= 2, `setup: >=2 other villages (${ovs.length})`);
  if (ovs.length < 2) return;
  const player = Game.villagerId || 'player';
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const npc = roster.find(id => id && id !== player) || 'npc-test';
  const npc2 = roster.find(id => id && id !== player && id !== npc) || npc;
  const [A, B, C] = [ovs[0], ovs[1], ovs[2] || null];
  const unknown = (v) => v && !v.generated && !v.rumored && !loreEntry(Game, player, v.id);

  // L0: the ledger API exists.
  check(typeof Game.recordVillageLore === 'function', 'L0 recordVillageLore exists');
  check(typeof Game.tellVillageLore === 'function', 'L0 tellVillageLore exists');
  check(typeof Game.villageKnowsVillage === 'function', 'L0 villageKnowsVillage exists');
  check(typeof Game.knowsVillage === 'function' && Game.knowsVillage.length >= 2,
    `L0 knowsVillage takes a knower argument (length=${Game.knowsVillage ? Game.knowsVillage.length : 'n/a'})`);
  // The store is ensured lazily (mapmem pattern): touch it once, then it exists.
  try { if (typeof Game.villageLoreOf === 'function') Game.villageLoreOf(player); } catch (e) {}
  check(Game.state.village && typeof Game.state.village.villageLore === 'object',
    'L0 state.village.villageLore store exists');

  // L9 (confirmed-by-design, runs FIRST while villages are still unknown):
  // raids still need no introduction.
  {
    const R = ovs[ovs.length - 1];
    if (R && typeof Game.raidVillage === 'function' && unknown(R)) {
      let m = lines.length;
      try { Game.raidVillage(R.id); } catch (e) {}
      const said = saySince(m);
      check(!/don't know them well enough/.test(said),
        'L9 raidVillage is NOT knowledge-gated (by design, audit K5)');
    } else { skip('L9 no unknown village left for the raid guard'); }
  }

  // L1 (leak 3): peer proposals are knowledge-gated like proposeLink.
  if (!unknown(B)) { skip('L1 B already known'); }
  else {
    try { Game._nudgeOpinion(B.id, 15, 'proof'); } catch (e) {}
    let m = lines.length;
    let peerRes = null, peerErr = null;
    try { peerRes = Game.proposeCovenant(B.id); } catch (e) { peerErr = e.message; }
    const said = saySince(m);
    check(peerErr === null && peerRes === null && /don't know them well enough/.test(said),
      `L1 proposeCovenant on unknown village refused on knowledge (res=${JSON.stringify(peerRes)} said=${JSON.stringify(said.slice(0, 100))})`);
    check(!(Game.linkWith && Game.linkWith(B.id)),
      'L1 no covenant link formed with the unheard-of village');
  }

  // L2 (leak 1): a rumor ROLL grants nothing; only delivery/read grants.
  let fired = false;
  for (let i = 0; i < 2000 && !fired; i++) {
    try { fired = !!Game.maybeVillageRumor(A); } catch (e) { break; }
  }
  check(fired, 'L2 rumor roll fired for A within 2000 calls');
  if (fired) {
    check(!loreEntry(Game, player, A.id), 'L2 roll creates NO player lore entry yet');
    check(Game.knowsVillage(A) === false,
      `L2 gate still closed after roll, before delivery (knows=${Game.knowsVillage(A)})`);
    check(!loreEntry(Game, npc, A.id) && Game.knowsVillage(A, npc) === false,
      'L2 NPC knower knows nothing from the player\'s queued rumor');
    check(!loreEntry(Game, 'village:' + A.id, 'haven'),
      'L2 the rumored village itself gains no Haven lore at roll time');
    // Drive delivery until A's rumor is read (one per call, at most 20).
    let delivered = false;
    for (let i = 0; i < 20 && !delivered; i++) {
      try { Game.deliverVillageRumors(); } catch (e) {}
      delivered = (Game.state.scholar.rumors || []).some(r => r && r.villageId === A.id && r.delivered);
    }
    check(delivered, 'L2 A\'s rumor delivered/read via deliverVillageRumors');
    if (delivered) {
      const e = loreEntry(Game, player, A.id);
      check(!!e && e.how === 'rumor' && e.toldBy === 'traveler-anonymous' && e.secondhand === true,
        `L2 delivery grants player lore {how:rumor, toldBy:traveler-anonymous, secondhand} (got ${JSON.stringify(e)})`);
      check(Game.knowsVillage(A) === true, 'L2 gate opens AFTER delivery');
      check(Game.knowsVillage(A, npc) === false,
        'L2 delivery to the player does NOT teach every villager (NPC still closed)');
      const ve = loreEntry(Game, 'village:' + A.id, 'haven');
      check(!!ve && ve.how === 'rumor',
        `L2 traveler carries word home: village lore about Haven recorded (got ${JSON.stringify(ve)})`);
    }
  }

  // L3 (leak 2): foreign-village systems read the VILLAGE's lore, not the player's flag.
  if (!B) { skip('L3 no B village'); }
  else {
    const baseB = B.opinion || 0;
    const D = C && unknown(C) ? C : null;
    const baseD = D ? (D.opinion || 0) : null;
    check(Game.villageKnowsVillage ? Game.villageKnowsVillage(B.id, 'haven') === false : false,
      'L3 before any meeting, the village does not know Haven');
    try { Game.catchUpSim(B); } catch (e) { console.log('  catchUpSim threw: ' + e.message); }
    const ve = loreEntry(Game, player, B.id);
    check(!!ve && ve.how === 'visit',
      `L3 visit records player lore {how:visit} (got ${JSON.stringify(ve)})`);
    check(Game.villageKnowsVillage ? Game.villageKnowsVillage(B.id, 'haven') === true : false,
      'L3 a face-to-face visit teaches the village about Haven');
    // Behavioral arm: _foreignEyes nudges only villages that know Haven.
    try {
      Game._foreignEyes('proof-contest', 'won');
      check((B.opinion || 0) === baseB + 2,
        `L3 _foreignEyes nudges the visited village +2 (${baseB} -> ${B.opinion})`);
      if (D) check((D.opinion || 0) === baseD,
        `L3 _foreignEyes leaves the unmet village untouched (${baseD} -> ${D.opinion})`);
      else skip('L3 no unmet D village for the _foreignEyes negative arm');
    } catch (e) { check(false, 'L3 _foreignEyes threw: ' + e.message); }
  }

  // L4 (told spread, mapmemTell-shaped): a told villager knows, secondhand.
  if (typeof Game.tellVillageLore === 'function' && loreEntry(Game, player, A.id)) {
    const told = Game.tellVillageLore(player, npc, A.id);
    check(!!told && told.how === 'told' && told.toldBy === player && told.secondhand === true,
      `L4 tell grants {how:told, toldBy:player, secondhand} (got ${JSON.stringify(told)})`);
    check(Game.knowsVillage(A, npc) === true, 'L4 told villager passes the knower gate');
    const again = Game.tellVillageLore(player, npc, A.id);
    check(!!again && again.how === 'told', 'L4 re-telling returns the existing entry, no duplicate');
    const nope = Game.tellVillageLore(player, npc, 'no-such-village');
    check(nope === null, 'L4 cannot tell about a village the teller does not know');
  } else { skip('L4 no player lore for A (L2 failed) or no tellVillageLore'); }

  // L5 (leak 2, conversation): a villager discusses only villages THEY know.
  if (typeof Game.t2gen_neighbors === 'function' && B && !loreEntry(Game, npc2, B.id)) {
    let before = '';
    try { before = (Game.t2gen_neighbors(npc2) || []).join(' '); } catch (e) { before = 'ERR:' + e.message; }
    check(!before.includes(B.name),
      `L5 speaker who never heard of ${B.name} does not discuss it (got ${JSON.stringify(before.slice(0, 100))})`);
    if (typeof Game.tellVillageLore === 'function') Game.tellVillageLore(player, npc2, B.id);
    let after = '';
    try { after = (Game.t2gen_neighbors(npc2) || []).join(' '); } catch (e) { after = 'ERR:' + e.message; }
    check(after.includes(B.name),
      `L5 after being told, the speaker can discuss ${B.name} (got ${JSON.stringify(after.slice(0, 100))})`);
  } else { skip('L5 no t2gen_neighbors or npc2 already knows B'); }

  // L6 (leak 3, positive arm): a KNOWN village with courtship proceeds past the gate.
  if (B && loreEntry(Game, player, B.id)) {
    try { Game._nudgeOpinion(B.id, 30, 'proof'); } catch (e) {}
    const realPeer = Game._judgePeer;
    try { Game._judgePeer = function () { return { score: 90, reasons: ['proof: earned'], rep: null }; }; } catch (e) {}
    let m = lines.length;
    let res = null;
    try { Game.state.pendingCounter = null; res = Game.proposeCovenant(B.id); } catch (e) { res = 'ERR:' + e.message; }
    try { Game._judgePeer = realPeer; } catch (e) {}
    const said = saySince(m);
    check(!/don't know them well enough/.test(said) && !!(Game.linkWith && Game.linkWith(B.id)),
      `L6 known + earned village forms the covenant (res kind=${res && res.kind}, link=${!!(Game.linkWith && Game.linkWith(B.id))})`);
  } else { skip('L6 no player lore for B (L3 failed)'); }

  // L7 (player legacy preserved): visit flags still count; a bare rumor flag does not.
  const D2 = C && !C.generated ? C : null;
  if (D2) {
    D2.generated = true;
    check(Game.knowsVillage(D2) === true, 'L7 legacy visit flag (generated) still opens the player gate');
  } else { skip('L7 no fresh village for the generated-legacy arm'); }
  const F = ovs.find(v => v && v.id !== A.id && v.id !== B.id && v.id !== (C && C.id) && !v.generated && !v.rumored);
  if (F) {
    F.rumored = true; // a roll, nothing delivered
    check(Game.knowsVillage(F) === false,
      'L7 a bare rumored flag (roll, undelivered) does NOT open the gate anymore');
    (Game.state.scholar.rumors = Game.state.scholar.rumors || []).push(
      { type: 'village', villageId: F.id, text: 'proof legacy', day: 0, delivered: true });
    check(Game.knowsVillage(F) === true,
      'L7 legacy reconstruction: rumored + delivered rumor still opens the player gate');
  } else { skip('L7 no fresh village for the rumored-legacy arm'); }

  // L8 (leak 4): region entries carry the knower on learned grants.
  try {
    const regs = Game.state.world && Game.state.world.regions;
    const defs = Game.data.regions || [];
    const fresh = defs.find(r => regs && regs[r.id] && !regs[r.id].known) || null;
    if (!fresh) { skip('L8 no unknown region found'); }
    else {
      const ok = Game.hearOfRegion(fresh.id, 'trail', { knowerId: npc });
      const after = regs[fresh.id];
      check(ok === true && after.known === true && after.knowerId === npc,
        `L8 learned region grant records knowerId (got ${JSON.stringify({ known: after.known, knowerId: after.knowerId })})`);
    }
  } catch (e) { check(false, 'L8 hearOfRegion threw: ' + e.message); }
}

async function main() {
  for (const s of SEEDS) {
    try { await runSeed(s); }
    catch (e) { fails++; failures.push(`seed ${s} crashed: ${e && e.stack || e}`); console.log(`  FAIL: seed ${s} crashed: ${e && e.message}`); }
  }
  console.log(`\n${passes} passed, ${fails} failed`);
  if (failures.length) console.log('failures:\n - ' + failures.join('\n - '));
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
