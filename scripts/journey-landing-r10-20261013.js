#!/usr/bin/env node
// Journey leg: LANDING (days 1-14) R10 — favor-acceptance + starvation-pathway
// probes on the post-r9-fix tree.
//
// Pre-registered (docs/MEASUREMENT.md §§9-12):
//   Question: (a) FAVOR: when a competent player ACCEPTS villager favors
//     (r9's picker always deflected 8/8 — promise->kept/broken machinery
//     untested in-sim), do kept/broken arcs fire with real consequences,
//     and do the transcripts read like people? (b) STARVATION: when a
//     distracted player runs thin (EAT_FRAC=0.10), does the starvation
//     pathway fire coherently — autopsy with mechanism, succession after?
//     (r9: 0 starvation deaths; seed-999's r7 day-11 player starvation with
//     ~30k pantry still unexplained.)
//   Interesting: >=1 kept or broken favor arc with consequence lines; >=1
//     starvation death with coherent autopsy; OR confirmed silence =
//     documented blank.
//   Seeds: favor-accept 515, 616, 717; distracted 818, 919. Pilot scale;
//     expand only if something interesting fires.
//   Policy: competent (policies/competent) + knobs:
//     FAVOR_ACCEPT=1 — pickChoice takes dlg:commit on ask_favor wants
//       (only dlg:commit creates a real obligation; r9 proved the picker
//       never offered it).
//     EAT_FRAC=0.10 — competentEat triggers at 10% of kcal cap (the
//       distracted forager who forgets to eat).
//
// Changes vs r9:
//   - pickChoice gains FAVOR_ACCEPT: dlg:commit taken for ask_favor wants.
//   - New MET.favorAccepted counter; kept/broken narration scans retained.
//   - Keeps r9: gossip asks, player rumor, gossip census, monster-news,
//     tellbeast/namebeast asks, starvation autopsy, NV sit, lure checks,
//     System contact, feast social half, all sense metrics.
//
// Usage: FAVOR_ACCEPT=1 node scripts/journey-landing-r10-20261013.js
//        EAT_FRAC=0.10 node scripts/journey-landing-r10-20261013.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [515, 616, 717]);
const DAYS = parseInt(process.env.DAYS || '14', 10);
const FAVOR_ACCEPT = process.env.FAVOR_ACCEPT === '1';

// ---- text-stream capture (loadGame silences Game.say; we keep the silence) ----
let capture = [];
let _lastArmText = null;
let _spamRun = 0; // feasted per-strike lines since last fight start
function feastScan(line) {
  const s = String(line || '');
  if (FEAST_ARM_RE.test(s)) {
    MET.armMessages++;
    if (_lastArmText !== null && s === _lastArmText) MET.armVerbatimRepeats++;
    _lastArmText = s;
  }
  if (FEAST_SPAM_RE.test(s)) { MET.feastedSpamLines++; _spamRun++; }
  if (FEAST_DRAW_RE.test(s)) MET.feastDraws++;
  if (VILLAGER_FEAST_PUSH_RE.test(s)) MET.villagerFeastPush++;
}
function cap(line) {
  if (line == null) return;
  const s = String(line);
  feastScan(s);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  // r9: favor kept/broken narration (game.js promise resolution lines)
  // r10: also stash the lines so the evidence note can quote them
  if (/You kept your word/i.test(s)) { MET.favorKept++; (MET.keptLines = MET.keptLines || []).push(s.slice(0, 220)); }
  if (/Promises rot/i.test(s)) { MET.favorBroken++; (MET.brokenLines = MET.brokenLines || []).push(s.slice(0, 220)); }
}

// ---- sense metrics ----
const MET = {
  sittings: 0, reofferFlags: 0, npcQuestions: 0,
  wants: {},
  justSaid: 0, maras: 0,
  commaStutter: 0, punctStutter: 0,
  lureOffered: 0, lureSpoken: 0, lureGesture: 0, lureSilent: 0,
  declineTaken: 0, declineHonest: 0, declineDry: 0,
  thirdPersonFavorHead: 0,
  fabricHistoryFlags: 0,
  verbatimRepeats: 0,
  abilitiesChosen: 0,
  forageTrips: 0, trapsCrafted: 0, trapsSet: 0, trapsWireSet: 0,
  cleanedCarcasses: 0, knappedKnives: 0,
  beastTricks: 0, fledBad: 0, fled: 0,
  aidOfferAccepted: 0, aidGivenKcal: 0, aidRefused: 0, looted: 0,
  fightsSeen: 0,
  timeFreezeCleared: 0,
  // r8 feast-chain telemetry
  devotionChannels: 0, sentimentTaughtDay: null,
  armMessages: 0, armVerbatimRepeats: 0,
  feastsHosted: 0, armedFeasts: 0, unarmedFeasts: 0,
  feastedSpamLines: 0, feastedSpamFights: 0, feastedSpamMaxPerFight: 0,
  feastDraws: 0, feastedCombatUses: 0,
  villagerFeastPush: 0,
  starvationDeaths: 0,
  // r9 gossip/information telemetry
  gossipAsks: 0, gossipRenders: 0, gossipNoNews: 0,
  rumorPlanted: 0, tellbeastAsks: 0, namebeastAsks: 0,
  favorPromised: 0, favorKept: 0, favorBroken: 0, favorAccepted: 0,
};
function bump(obj, k) { obj[k] = (obj[k] || 0) + 1; }
const FEAST_ARM_RE = /Your gifts are not mastered — but they are lived-in/i;
const FEAST_SPAM_RE = /^FEASTED ×[\d.]+: the feast was the weapon\.$/;
const FEAST_DRAW_RE = /followed the feast here|The .* is circling the edge of the light/i;
const VILLAGER_FEAST_PUSH_RE = /should (host|throw|have) a feast|feast (tonight|soon)|let'?s (host|throw|have) a feast/i;

// comma-closer stutter; punct: ?! doubles / 4+ dots (literary "..." allowed)
const COMMA_STUTTER_RE = /[.!?]["\u201d]?\s*,/;
const PUNCT_STUTTER_RE = /([!?])\1|\.{4,}/;
const LURE_RE = /walk with me|haul something|get air|come see what i found|trap line|extra hands|another pair of eyes/i;
const GESTURE_RE = /\(.*(mime|mimes|gesture|gestures|points? at|toward the|unmistakable).*\)/is;
// r5 fix alternates (declineLine pool) — acknowledging lines
const DECLINE_ACK_RE = /another time|rain check|suit yourself|fair enough/i;
const DECLINE_DRY_RE = /lost my train of thought/i;
// establishment r4 fix: third-person favor heads spoken by the asker
const THIRDPERSON_FAVOR_RE = /about their injury|about their sickness|the food they needed|the sickness they are fighting|their injury — still need/i;
// succession r5 fix: hardcoded people-count lies
const COUNT_LIE_RE = /\b(twelve|eleven|ten|nine|eight|seven) (people|villagers)\b/i;

function senseCheckThem(line) {
  const s = String(line || '');
  if (/I just said/i.test(s)) { MET.justSaid++; return '!! FALLBACK "I just said" fired'; }
  if (/Mara/.test(s)) { MET.maras++; return '!! PHANTOM "Mara"'; }
  if (COMMA_STUTTER_RE.test(s)) { MET.commaStutter++; return '!! COMMA-CLOSER STUTTER: ' + s.slice(0, 120); }
  if (PUNCT_STUTTER_RE.test(s) && !/^\.*$/.test(s)) { MET.punctStutter++; return '!! PUNCT STUTTER: ' + s.slice(0, 120); }
  if (THIRDPERSON_FAVOR_RE.test(s)) { MET.thirdPersonFavorHead++; return '!! THIRD-PERSON FAVOR HEAD: ' + s.slice(0, 120); }
  return null;
}

// ---- helpers ----
let Game = null;
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }

const DEEPEN = ['dlg:help', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy'];
let lastPickId = null; // harness hygiene: don't hammer the same deepen choice twice running
function pickChoice(choices, turn, wantId) {
  const list = choices || [];
  // r10 FAVOR_ACCEPT: only dlg:commit creates a real favor obligation
  // (convo-wants.js: 'engaged' is unreachable for favors; heard-but-not-
  // committed resolves as 'stated'). r9's picker never offered it, so all
  // favors deflected. When the want is ask_favor and commit is offered,
  // take it — the promise->kept/broken machinery gets exercised.
  if (FAVOR_ACCEPT && wantId === 'ask_favor') {
    const commit = list.find(x => x && x.id === 'dlg:commit');
    if (commit) { MET.favorAccepted++; lastPickId = 'dlg:commit'; return commit; }
  }
  // r9: on the second turn, ask for gossip ("heard anything?") — the
  // information-machinery leg wants rendered gossip, not just deepening.
  if (turn === 1) {
    const g = list.find(x => x && x.id === 'ask:gossip');
    if (g) { MET.gossipAsks++; lastPickId = 'ask:gossip'; return g; }
  }
  for (const id of DEEPEN) {
    if (id === lastPickId) continue;
    const c = list.find(x => x && x.id === id);
    if (c) { lastPickId = id; return c; }
  }
  for (const id of DEEPEN) { const c = list.find(x => x && x.id === id); if (c) { lastPickId = id; return c; } }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) { lastPickId = ans.id; return ans; }
  const yn = list.find(x => x && (x.id === 'gq:yn:yes' || x.id === 'gq:open:take'));
  if (yn) { lastPickId = yn.id; return yn; }
  const wantEngage = list.find(x => x && x.id && x.id.indexOf('alive:want:') === 0);
  if (wantEngage) { lastPickId = wantEngage.id; return wantEngage; }
  const agree = list.find(x => x && x.id === 'agree');
  if (agree && turn < 7) { lastPickId = 'agree'; return agree; }
  const cant = list.find(x => x && x.id === 'dlg:cant');
  if (cant) { lastPickId = 'dlg:cant'; return cant; }
  const bdecl = list.find(x => x && x.id === 'betrayal:decline');
  if (bdecl) { lastPickId = 'betrayal:decline'; return bdecl; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) { lastPickId = 'dlg:react'; return react; }
  lastPickId = 'leave';
  return list.find(x => x && x.id === 'leave') || null;
}

function pantryKcal() {
  try {
    const p = (Game.state.village && Game.state.village.pantry) || [];
    return Math.round(p.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
  } catch (e) { return null; }
}
function deathsSoFar() {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function popAlive() {
  try {
    return (Game.state.village.roster || []).filter(id => { const p = person(id); return !p.dead; }).length;
  } catch (e) { return null; }
}

// (favor stage-line cross-run template scan removed: the want object carries
// no .line field — the scan was dead code. Cross-run template repetition is
// checked by grepping the saved transcripts instead.)

function runConversation(seed, day, vid, nvSit) {
  const fp = `/tmp/journey-landing-r10-transcript-${seed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  let sawBetrayalMenu = false, commNone = false;
  const themLines = [];
  let declinedThisTurn = false, gossipAskedThisTurn = false;
  try {
    try { commNone = (Game.commLevel && Game.commLevel(vid).level === 'none') || false; } catch (e) {}
    const nm = vname(vid);
    const p = person(vid);
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    MET.sittings++;
    bump(MET.wants, want.id || 'none');
    const seenIds = new Set();
    const seenAtTurn = new Map();
    const noteMenu = (choices, turn) => {
      for (const ch of (choices || [])) {
        if (!ch || !ch.id) continue;
        if (ch.id.indexOf('ans:') === 0) MET.npcQuestions++;
        if (/^betrayal:(accept|decline)/.test(ch.id)) sawBetrayalMenu = true;
        if (seenIds.has(ch.id)) {
          MET.reofferFlags++;
          log(`!! RE-OFFER: [${ch.id}] re-offered at turn ${turn} (first at turn ${seenAtTurn.get(ch.id)})`);
        } else { seenIds.add(ch.id); seenAtTurn.set(ch.id, turn); }
      }
    };
    log(`=== seed ${seed} day ${day} — conversation with ${nm} (${vid})${nvSit ? ' [deliberate nonverbal sit]' : ''} ===`);
    log(`occupation=${p.occupation || '?'} temperament=${p.temperament || '?'} trust=${((Game.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} commNone=${commNone}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log(''); noteMenu(r0.choices || [], 0);
    log(`opening menu (${(r0.choices || []).length} choices):`);
    for (const ch of (r0.choices || [])) log(`  [${ch.id}] ${String(ch.label || '').slice(0, 120)}`);
    log('');
    const sayThem = (line) => {
      if (!line) { log('THEM: (no line)'); return; }
      const s = String(line);
      themLines.push(s);
      log(`THEM: ${s}`);
      const flag = senseCheckThem(s);
      if (flag) log(flag);
      // decline-line honesty: did the decline get acknowledged in the fiction?
      if (declinedThisTurn) {
        MET.declineTaken++;
        if (DECLINE_DRY_RE.test(s)) { MET.declineDry++; log('!! DECLINE DRY-LINE (non-sequitur after decline)'); }
        else if (DECLINE_ACK_RE.test(s)) { MET.declineHonest++; log('decline: acknowledged ✓'); }
        else log('decline: neutral line (neither dry nor pool): ' + s.slice(0, 100));
        declinedThisTurn = false;
      }
      // fabricated-history scan: hardcoded people counts vs living roster
      const cl = s.match(COUNT_LIE_RE);
      if (cl) {
        MET.fabricHistoryFlags++;
        log(`!! POSSIBLE COUNT LIE "${cl[0]}" (living roster: ${popAlive()})`);
      }
      // r10: gossip-ask render detection — the ask renders as a framing beat
      // ("Huh. Let me think about that." / "You want to know about that?
      // Okay." / "Good question.") FOLLOWED BY the gossip in a second
      // quoted segment. The r9 regex matched only a few content patterns
      // and scored most renders as quiet — every ask in r10's favor pilot
      // actually rendered (26/26). A render = 2+ quoted segments.
      if (gossipAskedThisTurn) {
        gossipAskedThisTurn = false;
        const quotes = (s.match(/"[^"]*"/g) || []).length;
        if (quotes >= 2) {
          MET.gossipRenders++; log('gossip render ✓');
        } else { MET.gossipNoNews++; log('gossip ask: no news (quiet)'); }
      }
    };
    sayThem(r0.line);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      log('');
      noteMenu(choices, turn + 1);
      log(`menu (${(choices || []).length}): ` + (choices || []).map(ch => `[${ch && ch.id}] ${String((ch && ch.label) || '').slice(0, 60)}`).join(' | '));
      const pickWant = ((Game.convoGet(vid) || {}).want || {}).id || null;
      const pick = pickChoice(choices, turn, pickWant);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      if (pick.id === 'betrayal:decline') declinedThisTurn = true;
      if (pick.id === 'ask:gossip') gossipAskedThisTurn = true;
      r = Game.convoTurn(vid, pick.id);
      sayThem(r.line);
      const w = (Game.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    // r9: monster-news beats — if the player has an unreported encounter or an
    // active naming debate, ask about it in-conversation and log the render.
    try {
      if (Game.monsterTellActive && Game.monsterTellActive()) {
        const before = capture.length;
        Game.askAbout(vid, 'tellbeast', { inConvo: true });
        MET.tellbeastAsks++;
        log('YOU: [tellbeast] "You saw something out there..."');
        for (let i = before; i < capture.length; i++) { log('THEM: ' + capture[i]); senseCheckThem(capture[i]); }
      }
    } catch (e) { log('tellbeast ERROR: ' + (e && e.message)); }
    try {
      if (Game.monsterNamingActive && Game.monsterNamingActive()) {
        const before = capture.length;
        Game.askAbout(vid, 'namebeast', { inConvo: true });
        MET.namebeastAsks++;
        log('YOU: [namebeast] "What are we calling that thing?"');
        for (let i = before; i < capture.length; i++) { log('THEM: ' + capture[i]); senseCheckThem(capture[i]); }
      }
    } catch (e) { log('namebeast ERROR: ' + (e && e.message)); }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    log('');
    log('--- END ---');
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = Game.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    // r9: favor-promise tracking (favorTask teaching machinery)
    // r10: the task lives on the favor instance / promise, not the person
    // (person(vid).favorTask was always undefined — the old log printed the
    // literal "favor").
    if ((want.id || 'none') === 'ask_favor' && (w2.resolution || '') === 'promised') {
      MET.favorPromised++;
      let task = null;
      try { task = ((Game.convoGetFavor && Game.convoGetFavor(vid)) || {}).task || null; } catch (e) {}
      if (!task) { try { task = ((((Game.state.village || {}).promises || {})[vid]) || {}).favorTask || null; } catch (e) {} }
      log(`favor promised: "${(task || 'favor')}"`.slice(0, 140));
    }
    const t = (c2 && c2.transcript) || [];
    log(`transcript entries: ${t.length}`);
    const themT = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themT.filter((x, i) => themT.indexOf(x) !== i);
    if (dupes.length) { MET.verbatimRepeats += dupes.length; log(`!! VERBATIM REPEATS (${dupes.length}): ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`); }
    const allText = themT.join('\n') + '\n' + themLines.join('\n');
    if (/\(last time\)/i.test(allText)) log('!! leaked "(last time)" internal note');
    // lure check: betrayal invite menu offered — spoken, gestured, or silent?
    if (sawBetrayalMenu) {
      MET.lureOffered++;
      const spoken = LURE_RE.test(allText) && !GESTURE_RE.test(allText);
      const gesture = GESTURE_RE.test(allText);
      if (spoken) { MET.lureSpoken++; log('lure: SPOKEN ✓'); }
      else if (gesture) { MET.lureGesture++; log(`lure: GESTURED ✓ (commNone=${commNone})`); }
      else { MET.lureSilent++; log('!! lure: menu offered a betrayal invite but the NPC neither spoke nor gestured it'); }
    }
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

function buildCensus() {
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const trust = (Game.state.village && Game.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (Game.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = Game.agencyOf ? Game.agencyOf(id) : null; } catch (e) {}
    let mood = p.mood || null;
    let want = null;
    try { const c = Game.convoGet(id); want = (c && c.want && c.want.id) || null; } catch (e) {}
    return {
      id, name: vname(id),
      alive: !p.dead,
      occupation: p.occupation || null,
      temperament: p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants, want,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
}

async function runSeed(seed) {
  capture = [];
  console.log(`\n########## SEED ${seed} ##########`);
  const lg = await loadGame({ seed });
  Game = lg.Game;
  if (lg.loadFails && lg.loadFails.length) console.log('LOAD FAILS: ' + JSON.stringify(lg.loadFails));
  // capture the narration stream (keeps the sim-harness silence)
  (function wrapStream() {
    const _emit = Game.emit, _say = Game.say;
    if (typeof _emit === 'function') {
      Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
    }
    if (typeof _say === 'function') {
      Game.say = function (...a) { cap(a[0]); }; // silenced by design (sim-harness)
    }
  })();
  // fight counter: the competent player should never see a blind-sided fight.
  // r10 TRACE_DEATH=1: wrap registerDeath to snapshot exact pantry/health
  // state the moment any death fires (starvation-mechanism forensics).
  if (process.env.TRACE_DEATH === '1' && typeof Game.registerDeath === 'function') {
    const origRD = Game.registerDeath.bind(Game);
    Game.registerDeath = function (rec) {
      try {
        const v = Game.state.village || {};
        console.log('### registerDeath FIRED ' + JSON.stringify({
          rec, gameDay: (Game.state.scholar || {}).day,
          pantryLen: (v.pantry || []).length,
          pantryKcal: Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)),
          victimHealth: (v.health || {})[rec.villagerId],
          granaryFedDay: v._granaryFedDay,
        }));
        console.log(new Error('death-stack').stack.split('\n').slice(1, 9).join('\n'));
      } catch (e) { console.log('trace ERROR: ' + (e && e.message)); }
      return origRD(rec);
    };
  }
  // r8: fold any in-progress feasted-spam run into per-fight telemetry.
  try {
    const _sc = Game.startCombat.bind(Game);
    Game.startCombat = function (...a) {
      MET.fightsSeen++;
      if (_spamRun > 0) {
        MET.feastedSpamFights++;
        if (_spamRun > MET.feastedSpamMaxPerFight) MET.feastedSpamMaxPerFight = _spamRun;
        _spamRun = 0;
      }
      return _sc.apply(this, a);
    };
  } catch (e) {}
  Game.genDetail = function () { return {}; };
  await setupGame(Game);

  const ctx = { policyId: 'competent-landing-r9' };
  const pid = Game.villagerId;
  const pp = person(pid);
  const spawn = {
    seed, day: gday(),
    scholarName: vname(pid), scholarId: pid,
    occupation: pp.occupation || null, temperament: pp.temperament || null,
    hp: (Game.state.scholar && Game.state.scholar.health) || null,
    fullness: (Game.state.scholar && Game.state.scholar.kcal) || null,
    rosterCount: (Game.state.village.roster || []).length,
  };
  console.log('SPAWN: ' + JSON.stringify(spawn));
  console.log('--- first 40 emitted lines (what the new player sees) ---');
  console.log(capture.slice(0, 40).join('\n'));
  console.log('--- end of spawn stream ---');

  const talked = new Set();
  let sysWas = !!(Game.state && Game.state.systemArrived);
  let systemDay = sysWas ? gday() : null;
  let systemFile = null;
  const series = [];
  const transcriptFiles = [];
  let overAt = null;
  let lastSday = null, frozenIters = 0;

  const atHaven = () => { try { return Game.playerAtHaven ? Game.playerAtHaven() : true; } catch (e) { return true; } };
  const pickVillager = (nvSit) => {
    try {
      const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && !talked.has(id));
      for (const id of roster) {
        let lvl = 'full';
        try { const nc = Game.commLevel ? Game.commLevel(id) : { level: 'full' }; lvl = (nc && nc.level) || 'full'; } catch (e) {}
        if (nvSit ? lvl !== 'none' : lvl === 'none') continue;
        let cnt = -1;
        try { const c0 = Game.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
        if (cnt === 0) return id;
      }
      return roster.length ? roster[0] : null;
    } catch (e) { return null; }
  };
  const daySnapshot = () => {
    let loc = null, packKcal = null, sentiment = null, feastState = null;
    try { loc = atHaven() ? 'haven' : 'wild'; } catch (e) {}
    try {
      const pack = (Game.state.scholar && Game.state.scholar.pack) || [];
      packKcal = Math.round(pack.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
    } catch (e) {}
    try { sentiment = !!(Game.sentimentTaught && Game.sentimentTaught()); } catch (e) {}
    try {
      const s = Game.state.scholar || {};
      feastState = {
        feasted: !!(Game.feastedActive && Game.feastedActive()),
        armed: !!((s.prog && s.prog.feastSurge)),
        surgeUsed: !!((s.prog && s.prog.feastSurgeUsed)),
        resonance: (s.prog && s.prog.surgeResonance) || 0,
      };
    } catch (e) {}
    // r9: daily gossip census — the information machinery's ledger
    let gossipCensus = null, monsterCodex = null, rumorTrack = null;
    try {
      gossipCensus = ((Game.state.village || {}).gossip || []).map(g => ({
        action: g.action || null,
        who: (g.dims && g.dims.who) || null,
        hearers: (g.heard || []).length,
        distortion: g.distortion || 0,
        day: g.day, playerRumor: !!g.playerRumor,
      }));
    } catch (e) {}
    try {
      monsterCodex = Object.entries(((Game.state.codex || {}).monsters) || {}).map(([mid, e]) => ({
        mid, reported: !!e.reported, knowers: (e.knowers || []).length,
        namingKicked: !!e.namingKicked, villageName: e.villageName || null,
        proposals: Object.keys(e.proposals || {}).length,
      }));
    } catch (e) {}
    try {
      if (ctx._rumorTarget) {
        const t = ctx._rumorTarget;
        rumorTrack = {
          target: t, targetName: vname(t),
          repGenerous: (Game.repOf(t) || {}).generous,
          trustOfPlayer: (((Game.state.village || {}).trust) || {})[t],
          rumors: ((Game.state.village || {}).gossip || []).filter(g => g.playerRumor)
            .map(g => ({ action: g.action, hearers: (g.heard || []).length, distortion: g.distortion || 0 })),
        };
      }
    } catch (e) {}
    // r10: per-villager vitals — trace starvation declines (health/away/hunger)
    let vitals = null;
    try {
      const v = Game.state.village || {};
      vitals = (v.roster || []).map(rid => {
        let n = {};
        try { n = Game.npcNeeds(rid) || {}; } catch (e) {}
        return {
          id: rid,
          health: (v.health && v.health[rid] !== undefined) ? Math.round(v.health[rid]) : null,
          away: !!((v.away || {})[rid]),
          hunger: (n.hunger != null) ? Math.round(n.hunger) : null,
          dead: (() => { try { return !!Game.getPerson(rid).dead; } catch (e) { return null; } })(),
        };
      });
    } catch (e) {}
    return {
      day: gday(), pantryKcal: pantryKcal(), pop: popAlive(),
      deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause })),
      scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
      scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
      scholarAlive: !!(Game.state.scholar) && !Game.over,
      loc, packKcal, sentiment, feastState,
      gossipCensus, monsterCodex, rumorTrack, vitals,
    };
  };
  // r8: starvation-death autopsy — record context the day it happens
  const starvAutopsies = [];
  const checkStarvationDeaths = (snap) => {
    for (const d of snap.deaths) {
      const cause = String(d.cause || '').toLowerCase();
      if (!/starv|hunger|kcal/.test(cause)) continue;
      if (starvAutopsies.some(a => a.who === d.who && a.day === d.day)) continue;
      let pantryEdible = null;
      try {
        const p = (Game.state.village && Game.state.village.pantry) || [];
        pantryEdible = Math.round(p.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
      } catch (e) {}
      starvAutopsies.push({
        who: d.who, day: d.day, cause: d.cause,
        loc: snap.loc, scholarKcal: snap.scholarKcal, packKcal: snap.packKcal,
        pantryEdible, pop: snap.pop,
        seriesTail: series.slice(-3).map(x => ({ day: x.day, scholarKcal: x.scholarKcal, pantryKcal: x.pantryKcal, loc: x.loc })),
      });
      MET.starvationDeaths++;
      console.log(`*** STARVATION DEATH: ${d.who} day ${d.day} loc=${snap.loc} pack=${snap.packKcal} pantry=${pantryEdible}`);
    }
  };

  // game-day-bounded loop (a forage trip can roll the day mid-iteration;
  // social beats fire once per OBSERVED game day, at haven)
  const day0 = gday();
  let lastGd = -1, lastNvGd = -1, loop = 0;
  while (!Game.over && loop++ < 80) {
    const gd = gday();
    if (gd >= day0 + DAYS) break;
    if (gd !== lastGd) {
      lastGd = gd;
      // social beat: one full conversation per game day. The second observed
      // game-day deliberately sits a nonverbal villager (robust to day skips —
      // a forage trip can roll a day boundary mid-iteration).
      const nvSit = (lastNvGd < 0 && gd > day0);
      if (atHaven()) {
        const vid = pickVillager(nvSit && lastNvGd < 0) || pickVillager(false);
        if (vid) {
          const didNv = nvSit && lastNvGd < 0;
          try {
            const fp = runConversation(seed, gd, vid, didNv);
            transcriptFiles.push(fp);
            console.log(`convo with ${vname(vid)}${didNv ? ' [NV]' : ''} -> ${fp}`);
          } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
          talked.add(vid);
          if (didNv) lastNvGd = gd;
        } else console.log('no fresh conversational villager today');
      } else console.log(`day ${gd}: player away from haven — no conversation beat`);
      // System contact detection
      const sysNow = !!(Game.state && Game.state.systemArrived);
      if (!sysWas && sysNow) {
        systemDay = gday();
        systemFile = `/tmp/journey-landing-r10-system-${seed}.txt`;
        fs.writeFileSync(systemFile,
          `=== seed ${seed}: System contact fired on game-day ${systemDay} ===\n\n` +
          capture.slice(-30).join('\n'));
        console.log(`*** SYSTEM CONTACT on day ${systemDay} -> ${systemFile}`);
      }
      sysWas = sysNow;
      const snap = daySnapshot();
      series.push(snap);
      checkStarvationDeaths(snap);
      // r9: day-3 rumor plant — the player starts a 'generous' rumor about a
      // villager (social verb, drama-grade). Then gossip machinery is watched
      // to carry it: hearers, distortion, rep movement (canon: REP only,
      // never trust — the subject's trust of the player must not move).
      if (!ctx._rumorPlanted && gd >= day0 + 2) {
        ctx._rumorPlanted = true;
        try {
          const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && !person(id).dead);
          if (roster.length >= 3 && Game.spreadRumor) {
            const target = roster[0], hearer = roster[1];
            const g = Game.spreadRumor(target, 'generous', hearer);
            ctx._rumorTarget = target; ctx._rumorDay = gd;
            MET.rumorPlanted++;
            console.log(`*** rumor planted day ${gd}: 'generous' about ${vname(target)} (first told ${vname(hearer)}) -> ${g ? 'seeded' : 'refused'}`);
          }
        } catch (e) { console.log('rumor plant ERROR: ' + (e && e.message)); }
      }
      // r8: first day the sentiment lesson lands (devotion channel unlock)
      try {
        if (MET.sentimentTaughtDay === null && Game.sentimentTaught && Game.sentimentTaught()) {
          MET.sentimentTaughtDay = gd;
          console.log(`*** sentiment taught on game-day ${gd}`);
        }
      } catch (e) {}
      console.log(`--- seed ${seed} game-day ${gd} (loop ${loop}) pantry=${snap.pantryKcal} pop=${snap.pop} ---`);
    }
    // villagerTurn-corrected day clock (sim-harness pattern)
    let brokeEarly = false;
    for (let p = 0; p < 3; p++) {
      try { competent.upkeep(Game, ctx); } catch (e) { console.log('upkeep ERROR: ' + (e && e.message)); }
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) { brokeEarly = true; break; }
      try { Game.doAction('wait'); } catch (e) { console.log('wait ERROR: ' + (e && e.message)); }
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) { brokeEarly = true; break; }
    }
    if (brokeEarly) break;
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily ERROR: ' + (e && e.message)); }
    driveFights(Game, competent, ctx);
    driveContests(Game, competent, ctx);
    try { Game.sleep(); } catch (e) { console.log('sleep note: ' + (e && e.message)); }
    driveContests(Game, competent, ctx);
    // time-freeze watchdog (sim-harness)
    try {
      const sday = (Game.state.scholar || {}).day || 0;
      if (lastSday !== null && sday === lastSday && Game.tbfight && !Game.tbfight.over) {
        if (++frozenIters >= 8) {
          try { Game.tbEnd('routed'); MET.timeFreezeCleared++; ctx.timeFreezeCleared = (ctx.timeFreezeCleared || 0) + 1; } catch (e) {}
          frozenIters = 0;
        }
      } else { frozenIters = 0; lastSday = sday; }
    } catch (e) {}
  }
  if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); }
  if (loop >= 80) console.log(`SEED ${seed}: LOOP GUARD HIT at game-day ${gday()}`);

  // fold ctx telemetry into MET
  for (const k of ['aidOffersAccepted', 'aidGivenKcal', 'aidRefused', 'looted', 'forageTrips',
    'trapsCrafted', 'trapsSet', 'trapsWireSet', 'cleanedCarcasses', 'knappedKnife',
    'beastTricks', 'fledBad', 'fled', 'choseAbility',
    'devotionChannels', 'feasts', 'armedFeasts', 'facedDraw', 'soothed']) {
    MET[k] = (MET[k] || 0) + (ctx[k] || 0);
  }
  // r8: fold any trailing feasted-spam run (fight never formally ended)
  if (_spamRun > 0) {
    MET.feastedSpamFights++;
    if (_spamRun > MET.feastedSpamMaxPerFight) MET.feastedSpamMaxPerFight = _spamRun;
    _spamRun = 0;
  }

  const census = buildCensus();
  const censusPath = `/tmp/journey-landing-r10-census-${seed}.json`;
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, spawn, systemDay, systemFile, transcriptFiles, series, census, overAt,
    starvAutopsies,
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    ctx: Object.fromEntries(Object.entries(ctx).filter(([k]) => !k.startsWith('_'))),
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | systemDay=${systemDay} | over=${overAt || 'no'} | transcripts=${transcriptFiles.length}`);
  return { seed, spawn, systemDay, censusPath, transcriptFiles, series, overAt };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  // (favor stage-line cross-run template scan removed with the dead harvest —
  // the want object carries no .line field; checked by grepping transcripts)
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  console.log('SENSE METRICS: ' + JSON.stringify(MET, null, 1));
  console.log('WANT ENGAGEMENT: ' + JSON.stringify(MET.wants));
  for (const r of results) {
    console.log(`seed ${r.seed}: spawn=${r.spawn && r.spawn.scholarName} | systemDay=${r.systemDay} | over=${r.overAt || 'no'} | census=${r.censusPath}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
