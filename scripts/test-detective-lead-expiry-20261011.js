#!/usr/bin/env node
// PROOF TEST: gossip-lead expiry is FIELD-SCOPED (detective 2026-10-11).
//
// BREAK (before fix): stampHeardStory stamped ALL open gossip doubts of a
// villager whenever ANY claim was tracked — hearing their GOAL story expired
// a lead about their OCCUPATION. doubtIsLead flipped false, the menu label
// and windup turned accusatory ("doesn't match what you told me" — they told
// you nothing on that field), and a baseless clear ran the full accuserPays
// machinery (honest -5 on hearers, false-accusation village gossip,
// wrongly_accused memory, -2 trust) for a question that was never an
// accusation. The engine narrated and punished an accusation that never
// happened — the H1-class copy lie r13 was built to kill, reintroduced via
// cross-field stamping.
//
// AFTER: the stamp carries the claim's field; only same-field leads expire.
// A goal chat leaves an occupation lead tentative (clears neutrally); hearing
// the occupation story expires it (real accusation path, real cost).
// doubtIsLead is also field-aware for legacy untagged stamps.
//
// SECOND FIND (honesty): the convoChoices confrontation label for slip-kind
// doubts said "I've been watching. Things don't add up." — a slip is verbal,
// not watched. Slip doubts get their own label now.
//
// Run: node scripts/test-detective-lead-expiry-20261011.js (exit 0 = pass)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function makeSharedRng() {
  let a = 1 >>> 0;
  const f = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.reset = (seed) => { a = seed >>> 0; };
  return f;
}
const sharedRng = makeSharedRng();
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global; // equipment.js load-time need; deleted before play
Math.random = sharedRng; sharedRng.reset(41111);
const files = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .match(/src\/js\/[^\"]*\.js/g)
  .filter(f => !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f));
const seen = new Set();
for (const f of files) { if (seen.has(f)) continue; seen.add(f); eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

const failures = [];
const ok = (cond, label, extra) => {
  if (cond) console.log('  PASS', label);
  else { console.log('  FAIL', label, extra === undefined ? '' : JSON.stringify(extra)); failures.push(label); }
};
const trustOf = (vid) => ((Game.state.village.trust || {})[vid] === undefined ? 10 : Game.state.village.trust[vid]);
const memTypes = (vid) => (((Game.state.village.memory || {})[vid]) || []).map(m => m.t);
const honestView = (vid) => (Game.repOf(vid) || {}).honest || 0;

async function newSession(seed) {
  sharedRng.reset(seed);
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = Game.state.village.roster.filter(id => id !== Game.villagerId);
  return roster;
}
// a villager with NO lies at all — any accusation against them is baseless
const cleanVillager = (roster) => roster.find(vid => {
  const lies = Game.npcLies(vid) || {};
  return !Object.values(lies).some(l => l && !l.confessed);
});

(async () => {
  // ---- 1. the break: goal chat must not expire an occupation lead ----
  console.log('1. cross-field stamping (the break)');
  let roster = await newSession(101);
  const vid = cleanVillager(roster);
  const teller = roster.find(id => id !== vid);
  ok(!!vid && !!teller, 'found a clean villager and a teller', { vid, teller });
  // gossip-first lead: no claims on file -> tentative lead about occupation
  Game.checkGossipClaim(vid, 'occupation', 'surgeon', teller);
  let lead = Game.getDoubts(vid).find(d => d.kind === 'gossip');
  ok(!!lead, 'gossip lead planted');
  ok(Game.doubtIsLead(lead) === true, 'lead starts tentative');
  // the player chats about their GOAL — an unrelated field
  Game.trackClaim(vid, 'goal', 'belong');
  lead = Game.getDoubts(vid).find(d => d.kind === 'gossip');
  ok(Game.doubtIsLead(lead) === true, 'goal chat does NOT expire the occupation lead', Game.doubtIsLead(lead));
  const stampedOcc = (lead.evidence || []).filter(e => /own story \(day/.test(String(e)));
  ok(stampedOcc.length === 0, 'no story-heard stamp from the unrelated field', stampedOcc);

  // ---- 2. the tentative clear stays neutral (no phantom accusation cost) ----
  console.log('2. tentative clear of an unexpired lead costs nothing');
  const hearers = Game.npcIds().filter(id => id !== vid).slice(0, 3);
  const h0 = hearers.map(honestView);
  const t0 = trustOf(vid);
  const r = Game.confrontDoubt(vid, lead.id);
  ok(r.outcome === 'cleared', 'lead clears', r.outcome);
  ok(lead.resolved === true, 'doubt resolved');
  ok(trustOf(vid) - t0 === 0, 'no trust move on a tentative clear', trustOf(vid) - t0);
  ok(!memTypes(vid).includes('wrongly_accused'), 'no wrongly_accused memory for a question', memTypes(vid).slice(-3));
  const h1 = hearers.map(honestView);
  ok(h1.every((v, i) => v === h0[i]), 'accuserPays did NOT fire (hearers unchanged)', { h0, h1 });
  const gossipTexts = (Game.state.village.gossip || []).map(g => g.text || '');
  ok(!gossipTexts.some(t => /false_accusation|called .* a liar, and you were wrong/.test(t)),
    'no false-accusation gossip seeded');

  // ---- 3. hearing the SAME field's story DOES expire the lead ----
  console.log('3. same-field story expires the lead (earned accusation path intact)');
  roster = await newSession(202);
  const vid2 = cleanVillager(roster);
  const teller2 = roster.find(id => id !== vid2);
  Game.checkGossipClaim(vid2, 'occupation', 'surgeon', teller2);
  let lead2 = Game.getDoubts(vid2).find(d => d.kind === 'gossip');
  ok(Game.doubtIsLead(lead2) === true, 'second lead starts tentative');
  Game.trackClaim(vid2, 'occupation', 'baker'); // now they've told you their story
  lead2 = Game.getDoubts(vid2).find(d => d.kind === 'gossip');
  ok(Game.doubtIsLead(lead2) === false, 'occupation story heard -> lead expired, accusation earned');
  const stamp2 = (lead2.evidence || []).find(e => /own story.*\(day/.test(String(e)));
  ok(/\[occupation\]/.test(String(stamp2)), 'stamp carries its field', String(stamp2));
  // and the earned accusation against an innocent still stings
  const hearers2 = Game.npcIds().filter(id => id !== vid2).slice(0, 3);
  const hh0 = hearers2.map(honestView);
  const r2 = Game.confrontDoubt(vid2, lead2.id);
  ok(r2.outcome === 'cleared', 'baseless earned accusation clears', r2.outcome);
  ok(memTypes(vid2).includes('wrongly_accused'), 'wrongly_accused memory recorded');
  const hh1 = hearers2.map(honestView);
  ok(hh1.every((v, i) => v <= hh0[i] - 5), 'accuserPays fired: hearers honest dropped by >=5 (direct -5 + gossip ripple)', { hh0, hh1 });

  // ---- 4. origin lead + occupation chat: the other cross-field direction ----
  console.log('4. origin lead survives an occupation chat');
  roster = await newSession(303);
  const vid3 = cleanVillager(roster);
  const teller3 = roster.find(id => id !== vid3);
  Game.checkGossipClaim(vid3, 'origin', 'Denver', teller3);
  const lead3 = Game.getDoubts(vid3).find(d => d.kind === 'gossip');
  ok(!!lead3 && Game.doubtIsLead(lead3) === true, 'origin lead starts tentative');
  Game.trackClaim(vid3, 'occupation', 'baker');
  ok(Game.doubtIsLead(lead3) === true, 'occupation chat does NOT expire the origin lead');

  // ---- 5. honesty: slip doubts get their own menu label (real convoChoices path) ----
  console.log('5. slip-doubt menu label is honest');
  roster = await newSession(404);
  const vid4 = cleanVillager(roster);
  const slip = Game.addDoubt(vid4, 'slip', 'test slip text', ['claimed "baker"', 'slipped: ...'], { field: 'occupation' });
  let slipLabel = null;
  try {
    Game.startConvo(vid4);
    const choices = Game.convoChoices(vid4) || [];
    const cc = choices.find(ch => String(ch.id).indexOf('confront:') === 0);
    slipLabel = cc ? cc.label : null;
    try { Game.endConvo(vid4, 'left'); } catch (e) {}
  } catch (e) { slipLabel = 'HARNESS-ERR ' + e.message; }
  ok(!!slipLabel, 'confront choice offered for the slip doubt', slipLabel);
  ok(slipLabel && !/watching/i.test(slipLabel),
    'slip label does not claim watching (a slip is verbal)', slipLabel);
  Game.resolveDoubt(slip.id, 'test cleanup');

  console.log(failures.length ? `\n${failures.length} FAILURES` : '\nALL PASS');
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
