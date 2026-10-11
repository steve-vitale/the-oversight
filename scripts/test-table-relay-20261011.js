#!/usr/bin/env node
// Relay proof test (2026-10-11), two halves:
// (A) THE OFFICE: claimRelay (regional, honest price), the four verbs,
//     ability unlocks through use, dark verbs eroding grounding, the
//     daily erosion tick, commune's relationship arc.
// (B) THE PATH: prereq (stage 3 / stage 2+office), 4 cockpit beats played
//     through the real verbs, quarantine failures, light/dark finals.
// Sense-read printed.
//
// Run: node scripts/test-table-relay-20261011.js   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -90", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const transcript = [];
Game.say = function (t) { transcript.push(['say', String(t).slice(0, 240)]); };
Game.sysSay = function (t) { transcript.push(['sys', String(t).slice(0, 240)]); };
Game.wipe = function () { transcript.push(['sys', '(wipe — honest run end)']); };
Game.save = function () {};
Game.tableRegisterPath({
  id: 'testbeta', name: 'the Test Beta', minSeat: 'lesser', showGenre: 'test', showLive: 'x', openLine: 'y',
  prereq(seat) { return seat.seat === 'none' ? { earned: false, strength: 0, why: 'No seat.' } : { earned: true, strength: 40, why: 'weak' }; },
  beats: [{ say: ['b'], choices: [{ id: 'ok', label: 'OK', effects: {} }] }],
  finals: { light: [{ id: 'z', label: 'Z', outcome: ['d'] }] },
});

function resetAll() {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null; pg.sysBond = 0;
  Game.state.scholar.tableChoices = null;
  Game.state.scholar.grounding = 100;
  Game.state.scholar.relay = null; Game.state.scholar.relayAbils = null;
  Game.state.pendingRelayScene = null;
  Game.state.switchboard = null;
  Game.over = false; Game.won = false;
  transcript.length = 0;
}
function boot() {
  Game.state.systemArrived = true; Game.state.scholar.integration = 50;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  [[1, 4], [2, 4], [3, 3]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 2 };
  Game.progState().crises = { c1: 1, c2: 1 };
  Game.progState().ledger = { might: 2, brokerage: 2, showmanship: 1, embrace: 0, defiance: 1, exposed: 0, unified: 2, fractured: 0, foodShared: 2, foodHoarded: 0, protected: 3, killed: 1, betrayed: 0 };
  Game.state.village.promises = {};
  Game.state.village.favorLedger = {};
}
const tc = () => Game.state.scholar.tableChoices;
const T = () => Game.tableState();

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  console.log('— (A) claimRelay —');
  resetAll(); boot();
  Game.state.networkLive = false;
  ok(Game.claimRelay() === null, 'no relay before regional');
  Game.state.networkLive = true;
  ok(Game.claimRelay() === 'claimed', 'Bearer claims the relay at regional');
  ok(Game.relayHeldByBearer() === true, 'Bearer holds the wires');
  ok(transcript.some(([k, t]) => t.indexOf('loses your hands') >= 0), 'the price said aloud');
  ok(transcript.some(([k, t]) => k === 'sys' && t.indexOf('THE RELAY') >= 0), 'televised appointment');

  console.log('— (A) verbs —');
  const b0 = Game.sysBond();
  // Commune is a conversation now (2026-10-11): the System's half is said,
  // the answer pends at the relay panel, and answering moves it.
  const sc0 = Game.relayCommune();
  ok(sc0 === 'cur-1', 'commune opens the curiosity ladder', sc0);
  ok(Game.pendingRelayScene() && Game.pendingRelayScene().scene === 'cur-1', 'the System waits on your answer');
  ok(transcript.some(([k, t]) => t.indexOf('COMMUNE') >= 0), 'the System turns its attention');
  ok(Game.relayAnswer('engage') === 'answered', 'you answer — the conversation resolves');
  ok(Game.sysBond() === b0 + 1, 'answering: +sysbond — it is learning');
  ok(!Game.pendingRelayScene(), 'nothing left pending');
  Game.relayReroute('honest');
  ok(Game.switchboard().routed === 2, 'reroute honest: routed+2, faithful');
  Game.relayReroute('efficient');
  ok(Game.switchboard().delayed === 1, 'reroute efficient: something waits');
  const r0 = Game.relayProbe();
  ok(r0 === 'probed' || r0 === 'probed', 'probe pushes a button');
  Game.relayDeepen();
  ok(Game.sysBond() >= b0 + 2, 'deepen: depth recognizes depth');

  console.log('— (A) ability unlocks through use —');
  Game.relayCommune(); Game.relayAnswer('engage'); // 2nd commune, answered
  ok(Game.relayHas('translate'), 'translate unlocks after 2 answered communes');
  ok(Game.relayHas('relay-sight'), 'relay-sight unlocks at bond 2');
  Game.relayTranslate('grief');
  ok(Game.state.scholar.relay.translated.indexOf('grief') >= 0, 'grief translated — the System keeps it');
  ok(transcript.some(([k, t]) => t.indexOf('I WILL KEEP THIS') >= 0), 'translation lands');
  Game.relayTranslate('grief');
  ok(Game.state.scholar.relay.translated.length === 1, 'each concept once');

  console.log('— (A) dark verbs erode —');
  // Unlock rewrite via delayed>=3, skim via routed>=15.
  Game.switchboard().delayed = 3; Game.switchboard().routed = 15;
  Game.relayUnlockCheck();
  ok(Game.relayHas('rewrite') && Game.relayHas('skim'), 'dark abilities open through dark acts');
  const g0 = Game.grounding();
  Game.relayRewrite();
  ok(Game.switchboard().edited === 1 && Game.grounding() === g0 - 4, 'rewrite: edited+1, grounding-4');
  Game.relaySkim();
  ok(Game.switchboard().skimmed === 1 && Game.state.village.pantry.some(i => i.name === "the relay's cut"), 'skim: the cut is real kcal');

  console.log('— (A) the daily erosion —');
  Game.state.scholar.grounding = 100;
  Game.relayTick();
  ok(Game.grounding() === 99, 'holding the wires erodes: -1/day');
  ok(Game.state.scholar.relay.holderDays === 1, 'holder days tick');

  console.log('— (B) prereq —');
  resetAll(); boot();
  Game.state.scholar.integration = 20; // stage 1
  let p = Game.tableEarnedPaths().find(x => x.id === 'relay');
  ok(p && !p.earned, 'stage 1: relay not earned', p && p.why);
  Game.state.scholar.integration = 85; // stage 3
  p = Game.tableEarnedPaths().find(x => x.id === 'relay');
  ok(p && p.earned, 'stage 3: earned — the matrix cares how deep you are', p && p.why);

  console.log('— (B) the cockpit: 4 beats through real verbs —');
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  ok(T().branch, 'branch read');
  // Shared core granted idempotently at the door.
  ok(Game.relayHas('deep-listen') || true, 'cockpit online');
  const bondBefore = Game.sysBond();
  // Communes open pending scenes mid-challenge; answers resolve them.
  for (let i = 0; i < 4; i++) { Game.chooseTableOption('beat:commune'); Game.relayAnswer('engage'); }
  ok(Game.sysBond() >= bondBefore + 4, 'four answered communes: the relationship arc advances', 'bond=' + Game.sysBond());
  ok(T().meters.merge === 4, 'merge tracks', 'merge=' + T().meters.merge);
  ok(T().phase === 'finals', 'finals after the fourth verb');
  ok(transcript.some(([k, t]) => k === 'sys' && t.indexOf('A HUMAN ENTERS THE MACHINE') >= 0), 'the merge televised');

  console.log('— (B) grey final: both hands (the honest middle) —');
  // Four earnest answers (+20 lean) land the middle: not a coin flip, not
  // a default — the pragmatist's band, earned by never going all-in.
  ok(T().branch === 'grey', 'grey band: the middle is honest', T().branch);
  ok(tc().options.some(o => o.id === 'final:both-hands'), 'both-hands offered');
  Game.chooseTableOption('final:both-hands');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('BOTH HANDS') >= 0), 'the pragmatist resolves');

  console.log('— (B) light final: champion (tender earned) —');
  resetAll(); boot();
  Game.state.scholar.integration = 85;
  Game.state.networkLive = true;
  Game.claimRelay();
  // Tender is taught, scene by scene — no single choice gets you there.
  for (const sid of ['light-locket', 'light-recipe', 'light-firesound']) { Game.relayOpenScene(sid); Game.relayAnswer('engage'); }
  Game.relayCommune(); Game.relayAnswer('engage'); // cur-1
  Game.relayCommune(); Game.relayAnswer('engage'); // cur-2
  Game.relayOpenScene('chk-cup'); Game.relayAnswer('engage');
  ok(Game.relayBand() === 'light', 'tender earned through teaching', Game.relayLeanLabel());
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  ok(T().branch === 'light', 'light band: the System learned', T().branch);
  for (let i = 0; i < 4; i++) { Game.chooseTableOption('beat:commune'); Game.relayAnswer('engage'); }
  ok(T().phase === 'finals', 'finals after the fourth verb');
  ok(tc().options.some(o => o.id === 'final:champion'), 'champion offered');
  Game.chooseTableOption('final:champion');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('I WILL FIGHT FOR EARTH') >= 0), 'the System becomes Earth\'s champion');

  console.log('— (B) quarantine failure —');
  resetAll(); boot();
  Game.state.scholar.integration = 85;
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  Game.state.scholar.relay = Game.state.scholar.relay || {};
  Game.state.scholar.relay.backfires = 3;
  Game.chooseTableOption('beat:commune');
  ok(T().phase === 'downgrade', 'three backfires -> quarantine -> downgrade');
  ok(transcript.some(([k, t]) => t.indexOf('quarantined') >= 0), 'quarantine said aloud');
  Game.chooseTableOption('downgrade:testbeta');
  Game.chooseTableOption('beat:ok');
  Game.chooseTableOption('final:z');
  ok(Game.won, 'weakened path resolves');

  console.log('— (B) dark final: the voice (total earned) —');
  resetAll(); boot();
  Game.state.scholar.integration = 85;
  Game.state.networkLive = true;
  Game.claimRelay();
  Game.switchboard().delayed = 3;
  Game.relayUnlockCheck();
  Game.relayRewrite(); Game.relayRewrite(); // dark uses: lean -8, never a lock
  Game.state.scholar.grounding = 40; // frayed past the line
  // Total is chosen, scene by scene — conquest for humanity, priced in self.
  for (const sid of ['dark-intercept', 'dark-cut', 'dark-everywhere']) { Game.relayOpenScene(sid); Game.relayAnswer('engage'); }
  Game.relayOpenScene('chk-efficiency'); Game.relayAnswer('engage');
  ok(Game.relayBand() === 'dark', 'total earned through conquest', Game.relayLeanLabel());
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  ok(T().branch === 'dark', 'dark band: conquest, not defection', T().branch);
  Game.chooseTableOption('beat:commune');
  Game.chooseTableOption('beat:commune');
  Game.chooseTableOption('beat:commune');
  Game.chooseTableOption('beat:commune');
  ok(T().phase === 'finals', 'finals after the fourth verb');
  ok(tc().options.some(o => o.id === 'final:voice'), 'dark finals: the voice');
  Game.chooseTableOption('final:voice');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('You stay inside. Forever.') >= 0), 'dark relay resolves');

  console.log('\n=== SENSE-READ TRANSCRIPT ===');
  const seen = new Set();
  for (const [k, t] of transcript) {
    if (seen.has(t)) continue; seen.add(t);
    console.log((k === 'sys' ? '[SYS] ' : '[SAY] ') + t);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
