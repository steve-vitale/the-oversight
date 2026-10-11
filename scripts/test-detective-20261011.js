#!/usr/bin/env node
// Detective adversarial 2026-10-11: the trust-heard story.
// HOSTILE VERBS: false accusations without cost, evidence forgery (can the
// player manufacture a baseless accusation?), confrontation softlocks.
//
// ATTACK 1 — STALE-CONFESSED FIELD MISS (break): a liar's occupation lie is
// confessed via one doubt; a second (gossip-lead) doubt about the SAME lie is
// then confronted. When the player's heard story was the TRUTH (trust>60
// honesty), the lead's evidence never contains the cover string — the old
// evidence-string stale check missed, the doubt fell through to 'cleared',
// and the engine branded the player a false accuser ("you called them a
// liar, and you were wrong") + seeded false_accusation gossip for a TRUE
// accusation. H1 copy lie + wrongful punishment.
//
// ATTACK 2 — MOOT LEAD (break): gossip names a cover and a truth; the player
// then hears the TRUTH straight from the target (trust-gated) and never
// hears the cover from them. The old code fell through to the field
// fallback, confronted over a cover story never told to the player, and the
// windup spoke a fabrication ("You said you were a paramedic") — then let
// them deflect or counter-attack a story that checked out.
//
// CHARACTERIZATION — GUILT ORACLE (design finding, no fix): every
// non-tentative doubt-planting path requires a real unconfessed lie / real
// witnessed event / live plot case. The engine cannot doubt an innocent
// person, so every ❓ is guilt-certified and the accuser-pays teeth for
// false accusations can never bite through engine flows. Interrogation is a
// solved, near-risk-free grind (deflects ratchet +15% toward confession).
// Run: node scripts/test-detective-20261011.js (exit 0 = pass)
// Seeds: SEED env or default; also loops fixed seeds for determinism.
'use strict';
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
global.window = global;
Math.random = sharedRng; sharedRng.reset(101011);
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
const memTypes = (vid) => (((Game.state.village.memory || {})[vid]) || []).map(m => m.t);
const falseAccGossip = () => (Game.state.village.gossip || []).filter(g =>
  g && g.action === 'false_accusation' && g.dims && g.dims.who === Game.villagerId);

async function newSession(seed) {
  sharedRng.reset(seed);
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  return Game.state.village.roster.filter(id => id !== Game.villagerId);
}
// a liar with a live, unconfessed occupation lie (force one if the roll had none)
function liarWithOccLie(roster) {
  for (const vid of roster) {
    const l = (Game.npcLies(vid) || {}).occupation;
    if (l && l.told && l.truth && !l.confessed) return { vid, lie: l };
  }
  for (const vid of roster) {
    const vp = Game.vpOf(vid);
    let guard = 0;
    while (guard++ < 40) {
      const lies = Game.genLies(vp);
      if (lies && lies.occupation && lies.occupation.told) { vp.lies = lies; return { vid, lie: lies.occupation }; }
    }
  }
  return null;
}
const setTrust = (vid, v) => { Game.state.village.trust = Game.state.village.trust || {}; Game.state.village.trust[vid] = v; };

(async () => {
  // ---- ATTACK 1: stale-confessed field miss → wrongful false-accuser brand ----
  console.log('1. stale-confessed: second doubt about a confessed lie must not punish');
  let roster = await newSession(1101);
  let pick = liarWithOccLie(roster);
  ok(!!pick, 'found/forced a liar with an occupation lie');
  const L = pick.vid, lie = pick.lie;
  // CONTROLLED cover/truth with no substring overlap either way: the old
  // evidence-string stale check must not catch this by substring luck
  // ("ER nurse".includes("nurse")).
  lie.told = 'paramedic'; lie.truth = 'blacksmith';
  // POST-SYSTEM: firstRef returns the bare first name — the pre-System
  // whoTag descriptor ("the man in his 30s, the paramedic") incidentally
  // smuggles the cover into the "haven't heard" evidence string, which
  // masked this bug. Post-System there is no such luck.
  Game.state.systemArrived = true;
  const T = roster.find(id => id !== L);
  setTrust(L, 70); // trust-gated honesty: they tell the truth now
  Game.checkGossipClaim(L, 'occupation', lie.truth, T); // village talk BEFORE hearing their story → lead
  const lead = Game.getDoubts(L).find(d => d.kind === 'gossip');
  ok(!!lead, 'gossip lead planted');
  Game.trackClaimSilent(L, 'occupation', lie.truth); // hear their TRUTHFUL story → lead expires
  ok(!Game.doubtIsLead(lead), 'lead expired once the truthful story was heard');
  ok(lead.evidence.every(e => !String(e).includes('paramedic')), 'evidence never names the cover (truth heard, not cover)');
  // the lie gets confessed via a different doubt (the contradiction from the flip)
  Game.addDoubt(L, 'contradiction', `${L} told one thing then another`,
    [`said "${lie.truth}"`, `now says "${lie.truth}"`], { field: 'occupation' });
  lie.confessed = true;
  const g0 = falseAccGossip().length;
  const r1 = Game.confrontDoubt(L, lead.id);
  ok(r1.outcome === 'already-confessed', 'second doubt resolves as already-confessed, not cleared', r1.outcome);
  ok(lead.resolved === true, 'doubt resolved');
  ok(!memTypes(L).includes('wrongly_accused'), 'no wrongly_accused brand for a TRUE accusation', memTypes(L).slice(-4));
  ok(falseAccGossip().length === g0, 'no false_accusation gossip seeded against the player');

  // ---- ATTACK 2: moot lead — corroborated intel is not a confrontation ----
  console.log('2. moot lead: truth heard straight must not fabricate "You said"');
  roster = await newSession(1102);
  pick = liarWithOccLie(roster);
  ok(!!pick, 'found/forced a liar with an occupation lie');
  const L2 = pick.vid, lie2 = pick.lie;
  const T2 = roster.find(id => id !== L2);
  setTrust(L2, 70);
  Game.checkGossipClaim(L2, 'occupation', lie2.truth, T2);
  const lead2 = Game.getDoubts(L2).find(d => d.kind === 'gossip');
  Game.trackClaimSilent(L2, 'occupation', lie2.truth); // truth heard; cover NEVER heard from them
  const said = [];
  const origSay = Game.say;
  Game.say = (t) => { said.push(String(t)); try { return origSay.call(Game, t); } catch (e) {} };
  const t0 = (Game.state.village.trust || {})[L2] || 10;
  const r2 = Game.confrontDoubt(L2, lead2.id);
  Game.say = origSay;
  const spoken = said.join(' ');
  ok(r2.outcome === 'moot', 'corroborated lead resolves as moot, not an accusation', r2.outcome);
  ok(lead2.resolved === true, 'doubt resolved, no open thread');
  ok(!/You said you were/i.test(spoken), 'windup never fabricates "You said" for unheard words');
  ok(!memTypes(L2).includes('wrongly_accused') && !memTypes(L2).includes('hostile'),
    'no hostile/wrongly_accused memories from a checked-out story', memTypes(L2).slice(-4));
  ok(((Game.state.village.trust || {})[L2] || 10) === t0, 'moot is trust-neutral');

  // ---- 2b. heard story CONTRADICTS the gossip (but isn't the cover): still confrontable ----
  console.log('2b. mismatching heard story stays confrontable, "Word is"-attributed');
  roster = await newSession(1109);
  pick = liarWithOccLie(roster);
  ok(!!pick, 'found/forced a liar with an occupation lie');
  const L2b = pick.vid, lie2b = pick.lie;
  const T2b = roster.find(id => id !== L2b);
  setTrust(L2b, 10);
  Game.trackClaimSilent(L2b, 'occupation', 'baker'); // heard 'baker' — not the cover, not the truth
  Game.checkGossipClaim(L2b, 'occupation', lie2b.truth, T2b);
  const d2b = Game.getDoubts(L2b).find(d => d.kind === 'gossip' && !d.resolved);
  ok(!!d2b, 'gossip doubt planted with claim on file');
  const said2b = [];
  const origSay2b = Game.say;
  Game.say = (t) => { said2b.push(String(t)); try { return origSay2b.call(Game, t); } catch (e) {} };
  const r2b = Game.confrontDoubt(L2b, d2b.id);
  Game.say = origSay2b;
  const spoken2b = said2b.join(' ');
  ok(['confessed', 'deflected', 'attacked'].includes(r2b.outcome), 'real mismatch plays a real scene, not moot', r2b.outcome);
  ok(!/You said you were/i.test(spoken2b), 'cover attributed to talk ("Word is"), never to their mouth');
  ok(/Word is you were/i.test(spoken2b), 'windup uses the "Word is" attribution', spoken2b.slice(0, 200));

  // ---- CHARACTERIZATION: the guilt oracle ----
  console.log('3. oracle invariant: engine paths never doubt the guiltless');
  let oracleHolds = true, observed = 0;
  for (const seed of [1103, 1104, 1105]) {
    roster = await newSession(seed);
    for (const vid of roster) {
      const lies = Game.npcLies(vid) || {};
      const hasLie = Object.values(lies).some(l => l && l.told && !l.confessed);
      if (hasLie) continue;
      // observation: 25 watches, must never plant (guard requires a real lie)
      for (let i = 0; i < 25; i++) { const r = Game.observePerson(vid); if (r.found) oracleHolds = false; observed++; }
      // gossip cross-reference via the real entry point (only fires if g.lie)
      const teller = roster.find(id => id !== vid);
      Game.npcGossipAbout(teller, vid);
      const d = Game.getDoubts(vid);
      if (d.length) { oracleHolds = false; console.log('    doubt on guiltless', vid, d.map(x => x.kind)); }
    }
  }
  ok(oracleHolds, `no doubt planted on any guiltless villager (${observed} observations + gossip xrefs)`);
  ok(true, 'NOTE(design): every non-tentative doubt is guilt-certified — accuser-pays can never bite via engine flows; see run note');

  // ---- CHARACTERIZATION: the deflect grind ----
  console.log('4. grind: confrontation loop terminates, confession costs the accuser nothing');
  const grindSeqs = [];
  for (const seed of [1106, 1107, 1108]) {
    roster = await newSession(seed);
    pick = liarWithOccLie(roster);
    const L4 = pick.vid, lie4 = pick.lie;
    setTrust(L4, 10);
    Game.trackClaim(L4, 'occupation', lie4.told);   // cover, via talk
    setTrust(L4, 70);
    Game.trackClaim(L4, 'occupation', lie4.truth);   // flip → contradiction doubt
    const outcomes = [];
    for (let rounds = 0; rounds < 10; rounds++) {
      const d = Game.getDoubts(L4).find(x => x.kind === 'contradiction' && !x.resolved);
      if (!d) break;
      const r = Game.confrontDoubt(L4, d.id);
      outcomes.push(r.outcome || (r.ok === false ? 'refused' : '?'));
      if (r.outcome === 'refused' || r.ok === false) Game.state.scholar.day += 3; // wait out refusal
      if (lie4.confessed) break;
    }
    const open = Game.getDoubts(L4).filter(x => !x.resolved);
    grindSeqs.push(outcomes.join('>') || '(none)');
    ok(open.length === 0, `seed ${seed}: loop terminates, no open doubt [${outcomes.join(',')}]`, outcomes);
    ok(!memTypes(L4).includes('wrongly_accused'), `seed ${seed}: no false-accuser brand from pressing a real liar`);
  }
  console.log('    grind sequences:', grindSeqs.join(' | '));

  console.log(failures.length ? `\n${failures.length} FAILURES` : '\nALL PASS');
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
