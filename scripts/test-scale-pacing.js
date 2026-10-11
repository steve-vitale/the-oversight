#!/usr/bin/env node
// SCALE PACING PROOF (2026-10-11, Steve: "National is being hit way too quickly").
// Pacing correction: 1 season = 30 days. The ladder is one rung per season:
//   VILLAGE days 1–30, REGIONAL days 31–60, NATIONAL days 61–90, GLOBAL/table 91+.
//
// Seed-99 diagnosis: village→regional (day 26)→national (day 34) in 10 days
// from first proposal, via COVENANT — three peer proposals accepted days
// 31–33, national beat day 34. _covenantPolity()/_tradePolity() counted ≥3
// peer links with ZERO maturity requirements.
//
// The fix:
//   - Polity links must be seasoned: 30+ days old AND trust 40+
//     (conquered: the season, not the trust). BELONG unchanged.
//   - The Regional Dawn waits until a bond is 21+ days old (gesture stages
//     at formation; the Dawn is not the gesture). Regional < ~day 25 impossible.
//   - National requires regional ≥ 30 days old (one rung per season).
//   - Peer proposals need courtship first (opinion ≥ 10).
//   - Declines bank progress: climb verbs land +1 harder for 28 days.
//
// Asserts (pinned day counts):
//   - zero seeds national before day 60
//   - median national in the 65–90 window on courtship seeds
//   - regional before ~day 25 impossible
// RED first on pristine master, GREEN after the fix.
// Run: node scripts/test-scale-pacing.js (SEED env override)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '99', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
[
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js', 'src/js/party.js',
  'src/js/party-formal.js', 'src/js/truth.js', 'src/js/contests.js',
  'src/js/broadcast.js', 'src/js/contestEngine.js', 'src/js/alienPlayers.js',
  'src/js/storage.js', 'src/js/perceive.js', 'src/js/carexplore.js',
  'src/js/justice.js', 'src/js/food.js', 'src/js/betrayal.js', 'src/js/corpses.js',
  'src/js/corruption.js', 'src/js/lifeseed.js', 'src/js/progression.js',
  'src/js/ledger.js', 'src/js/abilityActions.js', 'src/js/monsterBehaviors.js',
  'src/js/statusEffects.js', 'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js', 'src/js/membership.js',
  'src/js/hierarchy.js', 'src/js/debug-scenarios.js', 'src/js/build.js',
].forEach(f => eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
delete global.window;
const Game = globalThis.Scattering.Game;

const says = [];
const osay = Game.say.bind(Game);
Game.say = (t) => { says.push(String(t)); return osay(t); };
function saidHas(re) { return says.some(t => re.test(t)); }

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}
const setDay = (d) => { Game.state.scholar.day = d; };

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  try { Game.depart(); } catch (e) {}

  while (Game.state.otherVillages.filter(v => v && v.id !== 'haven').length < 7) {
    const base = Game.state.otherVillages.filter(v => v && v.id !== 'haven');
    const t = Object.assign({}, base[base.length - 1]);
    const n = base.length;
    t.id = 'village_sp' + n; t.name = 'Pace' + n; t.x = (t.x + 3 * n) % 9;
    t.generated = true; t.rumored = false; t.opinion = 0;
    Game.state.otherVillages.push(t);
  }
  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
  ovs.forEach(v => { v.generated = true; v.opinion = 0; delete v.courtshipDeclined; delete v._codexOpinionGiven; });
  const V = ovs.slice(0, 6).map(v => v.id);

  function resetPolity() {
    Game.hierarchyState().forEach(l => { l.status = 'broken'; });
    Game.state.nationalLive = false; Game.state.networkLive = false;
    Game.state.networkLiveDay = 0; Game.state._regionalPending = null;
    Game.state.globalLive = false;
    Game.state.pendingNational = null; Game.state.pendingCounter = null;
    Game.state.pendingAccord = null; Game.state.accordUnanswered = false;
    Game.state.scaleRefused = false; Game.state._natDefer = {};
    says.length = 0;
  }

  // Run the real daily flow: form links on given days, tend to trust 40,
  // tick _checkRegional + _checkNational daily, record rung days.
  function runCourtship(firstLinkDay, peerDays) {
    resetPolity();
    setDay(firstLinkDay);
    const fl = Game._formLink(V[0], { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
    const formed = [{ link: fl, day: firstLinkDay }];
    for (let i = 0; i < peerDays.length; i++) {
      setDay(peerDays[i]);
      formed.push({ link: Game._formPeerLink(V[i + 1], { kind: 'covenant' }), day: peerDays[i] });
    }
    formed.forEach(f => { if (f.link) f.link.trust = 40; });
    let regionalDay = null, nationalDay = null;
    const start = Math.min(firstLinkDay, ...peerDays);
    for (let d = start; d <= 140; d++) {
      setDay(d);
      if (Game._checkRegional) Game._checkRegional();
      if (Game.state.networkLive && regionalDay === null) regionalDay = d;
      Game._checkNational();
      if (Game.state.pendingNational && nationalDay === null) nationalDay = d;
      if (nationalDay !== null) break;
    }
    return { regionalDay, nationalDay };
  }

  // ---- (g) the Dawn waits for seasons: regional < ~day 25 impossible ----
  console.log('(g) regional Dawn timing (21-day bond)');
  resetPolity(); setDay(4); // earliest realistic contact
  Game._formLink(V[0], { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  let dawnDay = null;
  for (let d = 4; d <= 60; d++) {
    setDay(d); if (Game._checkRegional) Game._checkRegional();
    if (Game.state.networkLive && dawnDay === null) dawnDay = d;
  }
  // On pristine (no _checkRegional), networkLive fires at formation (day 4):
  // the test below asserts the NEW behavior and fails there.
  ok(Game.state.networkLive === true, 'the Dawn fires once a bond is 21+ days old');
  ok(dawnDay === 25, `link day 4 → Dawn day ${dawnDay} (21-day bond age; before-25 impossible)`);
  ok(saidHas(/Three weeks/i), 'the gesture says the Dawn waits for seasons');
  // networkLiveDay tracked for the rung gate
  ok(Game.state.networkLiveDay === dawnDay, 'networkLiveDay tracks the Dawn');

  // ---- (a) covenant national: 30-day season + trust 40 ----
  console.log('(a) maturity gates on covenant polity (30d + trust 40)');
  resetPolity(); setDay(31);
  const l1 = Game._formPeerLink(V[0], { kind: 'covenant' });
  const l2 = Game._formPeerLink(V[1], { kind: 'covenant' });
  const l3 = Game._formPeerLink(V[2], { kind: 'covenant' });
  ok(Game._covenantPolity() === null, 'fresh links (day 31, trust 30) do NOT form a polity');
  l1.trust = 80; l2.trust = 80; l3.trust = 80;
  ok(Game._covenantPolity() === null, 'high trust alone (no season) still does NOT form a polity');
  setDay(31 + 30);
  l1.trust = 30; l2.trust = 30; l3.trust = 30;
  ok(Game._covenantPolity() === null, 'season alone (trust 30, untended) still does NOT form a polity');
  l1.trust = 40; l2.trust = 40; l3.trust = 40;
  const pol = Game._covenantPolity();
  ok(pol && pol.shape === 'covenant' && pol.size === 4, 'seasoned + tended links form the covenant polity');
  l3.trust = 30;
  ok(Game._covenantPolity() === null, 'only 2/3 seasoned links → no polity');

  // ---- (a2) trade polity, same gates ----
  console.log('(a2) maturity gates on trade polity');
  resetPolity(); setDay(40);
  Game._formPeerLink(V[0], { kind: 'trade' });
  Game._formPeerLink(V[1], { kind: 'trade' });
  Game._formPeerLink(V[2], { kind: 'trade' });
  ok(Game._tradePolity() === null, 'fresh trade links do NOT form a polity');
  setDay(70);
  Game._peerLinks('trade').forEach(l => { l.trust = 40; });
  const tpol = Game._tradePolity();
  ok(tpol && tpol.shape === 'trade', 'seasoned + tended trade links form the trade polity');

  // ---- (a3) LEAD: subordinates seasoned; CONQUEST: season only ----
  console.log('(a3) maturity gates on LEAD / CONQUEST');
  resetPolity(); setDay(50);
  Game._formLink(V[0], { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  Game._formLink(V[1], { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  Game._formLink(V[2], { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
  ok(Game.polityOf('haven') === null, 'three fresh subordinates do NOT form a led realm');
  setDay(80);
  Game.hierarchyState().forEach(l => { if (l.primary === 'haven') l.trust = 40; });
  const lead = Game.polityOf('haven');
  ok(lead && lead.shape === 'lead' && lead.led === true, 'seasoned + tended subordinates form the LEAD realm');
  resetPolity(); setDay(60);
  const c1 = Game._formLink(V[0], { asSubordinate: false, tributeKcalPerWeek: 7000 }, null);
  const c2 = Game._formLink(V[1], { asSubordinate: false, tributeKcalPerWeek: 7000 }, null);
  const c3 = Game._formLink(V[2], { asSubordinate: false, tributeKcalPerWeek: 7000 }, null);
  [c1, c2, c3].forEach(l => { l.conquered = true; l.trust = 15; });
  ok(Game.polityOf('haven') === null, 'three FRESH conquests do NOT form a realm');
  setDay(90);
  const conq = Game.polityOf('haven');
  ok(conq && conq.shape === 'conquest', 'seasoned conquests (trust 15) form the CONQUEST realm');

  // ---- (b) courtship seeds: zero national before 60, median 65–90 ----
  console.log('(b) courtship-seed distribution (pinned ladder)');
  const courtships = [
    { name: 'aggressive', first: 20, peers: [25, 27, 30] },
    { name: 'seed-99-like', first: 25, peers: [31, 32, 33] },
    { name: 'steady', first: 35, peers: [40, 45, 50] },
    { name: 'slow', first: 38, peers: [43, 48, 53] },
  ];
  const results = [];
  for (const c of courtships) {
    const r = runCourtship(c.first, c.peers);
    results.push({ name: c.name, ...r });
    ok(r.nationalDay !== null && r.nationalDay >= 60,
      `${c.name}: national day ${r.nationalDay} (≥ 60, never day 34)`);
    ok(r.regionalDay !== null && r.regionalDay >= 25 && r.regionalDay <= 60,
      `${c.name}: regional day ${r.regionalDay} (ladder window 31–60, ~25 floor)`);
  }
  const nats = results.map(r => r.nationalDay).sort((a, b) => a - b);
  const median = (nats[1] + nats[2]) / 2;
  console.log(`  INFO national days: [${nats.join(', ')}], median ${median}`);
  ok(median >= 65 && median <= 90, `median national ${median} in the 65–90 window`);
  // the beat that stages is the Founding Council, answered honestly
  resetPolity();
  const rr = runCourtship(25, [31, 32, 33]);
  Game.answerNationalChoice('pact');
  ok(Game.scaleRank() === 'national', 'scaleRank reads national after the Founding Council');

  // ---- (c) cold-proposal spam cannot brute-force a polity ----
  console.log('(c) spam cannot brute-force');
  resetPolity(); setDay(30);
  ovs.forEach(v => { v.opinion = 50; });
  const realJudge = Game._judgePeer;
  Game._judgePeer = () => ({ score: 95, reasons: ['mocked'], rep: null });
  Game.proposeCovenant(V[0]); Game.proposeCovenant(V[1]); Game.proposeCovenant(V[2]);
  Game._judgePeer = realJudge;
  ok(Game.hierarchyState().filter(l => l.status === 'active' && l.kind === 'covenant').length === 3,
    'spam formed 3 links (accepts still work)');
  let beatDay = null;
  for (let d = 30; d <= 120; d++) {
    setDay(d); if (Game._checkRegional) Game._checkRegional(); Game._checkNational();
    if (Game.state.pendingNational) { beatDay = d; break; }
  }
  ok(beatDay === null, `spam links (trust 30, untended) NEVER stage a beat (got ${beatDay})`);

  // ---- (d) climb verbs move opinion; decline banks the watch bonus ----
  console.log('(d) climb verbs + decline watch bonus');
  resetPolity();
  const vid = V[3];
  const ov = ovs.find(v => v.id === vid);
  ov.opinion = 0; delete ov.courtshipDeclined;
  Game._nudgeOpinion(vid, 3, 'codex');
  ok(ov.opinion === 3, 'codex study moves opinion +3 with no decline banked');
  setDay(70); ov.courtshipDeclined = 70;
  Game._nudgeOpinion(vid, 2, 'broadcast');
  ok(ov.opinion === 6, 'broadcast win inside the watch window: +2+1=3 (total 6)');
  setDay(70 + 29);
  Game._nudgeOpinion(vid, 2, 'broadcast');
  ok(ov.opinion === 8, 'broadcast win outside the watch window: +2 flat (total 8)');
  setDay(71); ov.courtshipDeclined = 71; ov.opinion = 0;
  Game._nudgeOpinion(vid, 2);
  ok(ov.opinion === 2, 'unmarked nudge inside the window: no bonus');
  Game._nudgeOpinion(vid, -5, 'codex');
  ok(ov.opinion === -3, 'negative nudge: no bonus (total -3)');

  // ---- (d2) peer proposals need courtship (opinion ≥ 10) ----
  console.log('(d2) courtship floor on peer proposals');
  resetPolity(); setDay(80);
  const coldOv = ovs.find(v => v.id === V[4]);
  coldOv.opinion = 0; delete coldOv.courtshipDeclined;
  says.length = 0;
  const r1 = Game.proposeCovenant(coldOv.id);
  ok(r1 === null, 'opinion 0: peer proposal refused before judgment');
  ok(saidHas(/barely know/i), 'the refusal says courtship aloud, human');
  ok(coldOv.opinion === 0, 'the courtship-floor refusal costs no opinion (not an ask)');
  coldOv.opinion = 10;
  Game._judgePeer = () => ({ score: 95, reasons: ['mocked'], rep: null });
  const r2 = Game.proposeCovenant(coldOv.id);
  Game._judgePeer = realJudge;
  ok(r2 && r2.kind === 'covenant', 'opinion 10: peer proposal proceeds to judgment');

  // ---- (e) BELONG road still reachable (gates unchanged) ----
  console.log('(e) BELONG reachable');
  resetPolity(); setDay(100);
  const bLink = Game._formLink(V[0], { asSubordinate: true, tributeKcalPerWeek: 4000 }, null);
  bLink.trust = 50; bLink.day = 100 - 14; bLink.arrears = 0;
  const fps = Game.foreignPolities();
  fps.push({ primary: V[0], subs: [V[1], V[2]], day: 50 });
  const belong = Game._belongPolity();
  ok(belong && belong.shape === 'belong', 'BELONG road reachable (gates unchanged)');
  fps.pop();

  // ---- (f) REFUSE still offered and permanent ----
  console.log('(f) REFUSE offered and permanent');
  const fr = runCourtship(25, [31, 32, 33]);
  ok(fr.nationalDay !== null && !!Game.state.pendingNational, 'national beat staged for seasoned league');
  ok(saidHas(/REFUSE/i), 'the beat offers REFUSE');
  Game.answerNationalChoice('refuse');
  ok(Game.state.scaleRefused === true, 'refuse sets scaleRefused');
  ok(Game.scaleRank() !== 'national', 'refusing does not grant national');
  setDay(200);
  Game._checkNational();
  ok(!Game.state.pendingNational, 'the offer never returns after REFUSE');

  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
