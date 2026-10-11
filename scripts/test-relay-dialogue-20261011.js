#!/usr/bin/env node
// test-relay-dialogue-20261011.js — proof for the relay dialogue rework
// (Steve 2026-10-11): the System as conversational presence, the leaning
// gradient (tender +100 .. total -100), light/dark conversation chains,
// the grey-middle pragmatist band, gradient-gated abilities.
//
// Proves on fixed seeds:
//   R1  modules load clean; relay-dialogue API attached (18 scenes)
//   R2  scene structure: every scene has a System want (sys lines), exactly
//       2 choices, every choice has label + outcome lines, |lean| <= 10
//   R3  GRADIENT LAW: no single choice from neutral crosses the band
//       threshold (|lean| < 40 after any one choice); data-level max |n|=10
//   R4  accumulation, not locking: 3x max-dark choice stays grey, 4x crosses
//   R5  both tracks fire through relayCommune: light-*, dark-*, chk-* scenes
//       all appear; lean moves
//   R6  grey-middle resolution: tableBranch('relay').band is grey/light/dark
//       by lean; tableFinals offers the grey endings; a grey final resolves
//       with its own honest outcome (not a coin flip)
//   R7  ability gating follows the gradient: full-total lean closes light
//       abilities and opens dark; full-tender does the reverse
//   R8  System notices: band shifts say a NOTICED line (meter is visible)
//   R9  transcript capture: full light + dark scene transcripts print for
//       sense-reading (SENSE-TESTING LAW — read them in the evidence file)
//
// Run: [SEED=123] node scripts/test-relay-dialogue-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  const seed = parseInt(process.env.SEED || '424242', 10);
  const { Game, loadFails } = await loadGame({ seed, mode: 'relay-dialogue' });
  ok('R1 modules loaded clean', !loadFails || !loadFails.length, (loadFails || []).join('; '));
  await setupGame(Game);
  const api = ['relayLean', 'addRelayLean', 'relayBand', 'relayLeanLabel',
    'relayAllScenes', 'relaySceneById', 'relayCommuneScene', 'relayOpenScene',
    'relayAnswer', 'pendingRelayScene', 'relayLeanNoticed'];
  ok('R1 relay-dialogue API attached', api.every(f => typeof Game[f] === 'function'),
    api.filter(f => typeof Game[f] !== 'function').join(','));

  // Capture narration for transcript sense-reads.
  const said = [];
  Game.say = (t) => { said.push(String(t)); };

  // The Bearer holds the relay.
  Game.state.switchboard = {
    holderId: Game.villagerId, bearerHeld: true, stage: 'village relay',
    routed: 0, delayed: 0, edited: 0, skimmed: 0, log: [],
  };
  const resetRelay = () => {
    Game.state.scholar.relay = {
      lean: 0, communes: 0, checkins: 0, sceneIdx: 0, lightIdx: 0, darkIdx: 0,
      probes: 0, reroutes: 0, deepens: 0, holderDays: 0, backfires: 0,
      translated: [], systemWantsTalk: false,
    };
    Game.state.scholar.relayAbils = {};
    Game.state.pendingRelayScene = null;
  };
  resetRelay();
  const setLean = (v) => { Game.state.scholar.relay.lean = v; };

  // ---- R2 scene structure ----
  const ids = Game.relayAllScenes();
  ok('R2 18 scenes', ids.length === 18, ids.length + ': ' + ids.join(','));
  let structOk = true, structWhy = '';
  let maxNudge = 0;
  for (const id of ids) {
    const sc = Game.relaySceneById(id);
    if (!sc || !(sc.sys || []).length) { structOk = false; structWhy = id + ' no sys lines'; break; }
    if (!sc.sys[0].includes('◈ COMMUNE')) { structOk = false; structWhy = id + ' sys lacks scene marker'; break; }
    if ((sc.choices || []).length !== 2) { structOk = false; structWhy = id + ' choices != 2'; break; }
    for (const ch of sc.choices) {
      if (!ch.label || !(ch.say || []).length) { structOk = false; structWhy = id + '/' + ch.id + ' label/say'; break; }
      maxNudge = Math.max(maxNudge, Math.abs(ch.lean | 0));
    }
    if (!structOk) break;
  }
  ok('R2 every scene: System voice + want, 2 choices, outcome lines', structOk, structWhy);
  ok('R2 data-level max |lean nudge| <= 10', maxNudge <= 10, 'max=' + maxNudge);

  // ---- R3 gradient law: no single choice locks from neutral ----
  let lockOk = true, lockWhy = '';
  for (const id of ids) {
    const sc = Game.relaySceneById(id);
    for (const ch of sc.choices) {
      resetRelay();
      Game.relayOpenScene(id);
      const r = Game.relayAnswer(ch.id);
      if (r !== 'answered') { lockOk = false; lockWhy = id + '/' + ch.id + ' did not answer'; break; }
      const l = Game.relayLean();
      if (Math.abs(l) >= 40 || Game.relayBand() !== 'grey') {
        lockOk = false; lockWhy = `${id}/${ch.id}: one choice -> lean ${l}`; break;
      }
      if (Game.pendingRelayScene()) { lockOk = false; lockWhy = id + ' pending not cleared'; break; }
    }
    if (!lockOk) break;
  }
  ok('R3 no single choice crosses the threshold from neutral', lockOk, lockWhy);

  // ---- R4 accumulation ----
  resetRelay();
  for (let i = 0; i < 3; i++) { Game.relayOpenScene('dark-everywhere'); Game.relayAnswer('engage'); }
  const after3 = Game.relayLean(), band3 = Game.relayBand();
  Game.relayOpenScene('dark-everywhere'); Game.relayAnswer('engage');
  const after4 = Game.relayLean(), band4 = Game.relayBand();
  ok('R4 3x max-dark choice (-30) stays grey', band3 === 'grey' && after3 === -30, `lean=${after3} band=${band3}`);
  ok('R4 4x max-dark choice (-40) crosses to dark', band4 === 'dark' && after4 === -40, `lean=${after4} band=${band4}`);

  // ---- R5 both tracks fire through commune ----
  resetRelay(); said.length = 0;
  const seen = new Set();
  for (let i = 0; i < 14; i++) {
    const sid = Game.relayCommune();
    if (!sid || sid === 'waiting') break;
    seen.add(sid);
    Game.relayAnswer('engage');
  }
  const tracks = { curiosity: 0, checkin: 0, light: 0, dark: 0 };
  for (const sid of seen) {
    const sc = Game.relaySceneById(sid);
    if (sc && tracks[sc.track] !== undefined) tracks[sc.track]++;
  }
  ok('R5 curiosity ladder fires', tracks.curiosity === 5, JSON.stringify(tracks));
  ok('R5 check-in scenes fire', tracks.checkin >= 3, JSON.stringify(tracks));
  ok('R5 light chain fires', tracks.light >= 1, JSON.stringify(tracks));
  ok('R5 dark chain fires', tracks.dark >= 1, JSON.stringify(tracks));
  ok('R5 lean moved by answers', Game.relayLean() !== 0, 'lean=' + Game.relayLean());

  // ---- R6 grey-middle resolution ----
  setLean(10);
  const bGrey = Game.tableBranch('relay');
  setLean(45);
  const bLight = Game.tableBranch('relay');
  setLean(-45);
  const bDark = Game.tableBranch('relay');
  ok('R6 lean +10 -> band grey', bGrey.band === 'grey', 'band=' + bGrey.band);
  ok('R6 lean +45 -> band light', bLight.band === 'light', 'band=' + bLight.band);
  ok('R6 lean -45 -> band dark', bDark.band === 'dark', 'band=' + bDark.band);
  // The table offers the grey endings and one resolves honestly.
  // (tableState() lives on progState().table — mutate the live object.)
  const T = Game.tableState();
  T.path = 'relay'; T.branch = 'grey'; T.phase = 'challenge'; T.beat = 0;
  said.length = 0;
  Game.tableFinals();
  const tcOpts = ((Game.state.scholar || {}).tableChoices || {}).options || [];
  const optIds = tcOpts.map(o => o.id);
  ok('R6 grey finals offered (both-hands + the-contract)',
    optIds.includes('final:both-hands') && optIds.includes('final:the-contract'), optIds.join(','));
  said.length = 0;
  Game.tableResolveFinal('final:both-hands');
  const out = said.join('\n');
  ok('R6 grey final resolves with its own honest outcome',
    out.includes('BOTH HANDS') && out.includes('refuse to choose'),
    said.slice(0, 2).join(' | ').slice(0, 160));

  // ---- R7 ability gating follows the gradient ----
  resetRelay();
  setLean(-50); // full total
  Game.state.scholar.relay.communes = 3;
  Game.state.switchboard.delayed = 3;
  Game.relayUnlockCheck();
  const darkGetsDark = Game.relayHas('rewrite');
  const darkShutLight = !Game.relayHas('translate');
  resetRelay();
  setLean(50); // full tender
  Game.state.scholar.relay.communes = 3;
  Game.state.switchboard.delayed = 10;
  Game.relayUnlockCheck();
  const lightGetsLight = Game.relayHas('translate');
  const lightShutDark = !Game.relayHas('rewrite');
  ok('R7 total lean: dark ability opens', darkGetsDark);
  ok('R7 total lean: light ability stays shut', darkShutLight);
  ok('R7 tender lean: light ability opens', lightGetsLight);
  ok('R7 tender lean: dark ability stays shut', lightShutDark);
  // ...but drift back reopens: gradient, not a lock.
  setLean(0);
  Game.relayUnlockCheck();
  ok('R7 drift back to middle reopens the dark ability', Game.relayHas('rewrite'));

  // ---- R8 the System notices ----
  // (addRelayLean clamps each nudge to ±10 per the GRADIENT LAW, so cross
  // the band with a near-threshold lean + one legal nudge.)
  resetRelay(); said.length = 0;
  setLean(-35); Game.addRelayLean(-10, 'test');
  const noticedDark = said.join('\n').includes('SHIFTING TOTAL');
  said.length = 0;
  setLean(35); Game.addRelayLean(10, 'test');
  const noticedLight = said.join('\n').includes('SHIFTING TENDER');
  ok('R8 System comments on dark shift (NOTICED)', noticedDark);
  ok('R8 System comments on light shift (NOTICED)', noticedLight);
  ok('R8 honest player-facing label', Game.relayLeanLabel() === 'tender +45', Game.relayLeanLabel());

  // ---- R9 transcripts for sense-reading ----
  resetRelay(); said.length = 0;
  Game.relayOpenScene('light-locket'); Game.relayAnswer('engage');
  const lightTranscript = said.slice();
  said.length = 0;
  Game.relayOpenScene('dark-everywhere'); Game.relayAnswer('engage');
  const darkTranscript = said.slice();
  console.log('\n--- TRANSCRIPT light-locket/engage (sense-read) ---');
  lightTranscript.forEach(l => console.log(l));
  console.log('\n--- TRANSCRIPT dark-everywhere/engage (sense-read) ---');
  darkTranscript.forEach(l => console.log(l));
  console.log('--- end transcripts ---\n');
  ok('R9 transcripts captured', lightTranscript.length >= 4 && darkTranscript.length >= 4,
    `light=${lightTranscript.length} dark=${darkTranscript.length}`);

  console.log(`\n${pass} passed, ${fail} failed (seed ${seed})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
