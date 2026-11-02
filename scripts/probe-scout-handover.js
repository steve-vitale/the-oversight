// probe-scout-handover.js — r112 Q1 (scout-handover probe, prereg).
// r108 wrinkle 2: a villager re-picked scout while another held it, and no
// handover line appeared in the panel transcripts — yet assignRole speaks
// one. The driven transcripts are built ONLY from convo.transcript, never
// from the say log, while assignRole says its lines and the rolepick
// handler returns line:null. This probe settles the channel question with
// real machinery: form a party through real conversation invites, name it
// through the real name menu, assign scout to A through the real role
// menu, then have B pick scout through the real role menu — capturing
// (a) the sayLog lines emitted during B's pick and (b) the convo
// transcript entries after B's pick.
// Verdicts (prereg): BUG if no handover line in EITHER channel (silent
// transfer); CLOSED-as-channel if the line fires into the sayLog but not
// convo.transcript (narrated, consistent with the nameParty line:null +
// say() pattern — a transcript-capture limit, not a game defect); NO-DATA
// if the shape cannot be constructed, with the exact blocker.
// Throwaway seed only. Writes
// evidence/2026-11-02/journey-succession-r112-handover-probe.json.
// No game-code change inside the probe; no probe state writes at all
// (party formation, naming, and role picks all go through convoTurn).
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.PROBE_SEED || '39997', 10);
const EVID = path.join(ROOT, 'evidence', '2026-11-02');

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  try { return (Game.state.village.roster || []).filter(id => ((Game.state.village.health || {})[id] ?? 100) > 0); } catch (e) { return []; }
}
function trustOf(Game, vid) {
  try { return ((Game.state.village || {}).trust || {})[vid] || 0; } catch (e) { return 0; }
}
function transcript(Game, vid) {
  try { return ((Game.convoGet(vid) || {}).transcript || []).map(e => `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 300)}`); } catch (e) { return ['(transcript read failed: ' + e.message + ')']; }
}
// Drive one convo until the choice with id wantId appears, then pick it.
// v1 failed NO-DATA because it looked only at the FIRST menu: the invite
// appears mid-conversation (r108's driven convos accept invites over up
// to 12 turns), not on turn 1. So each turn checks for the target first
// and otherwise takes a filler pick (want: > dlg:help/details > first
// non-leave), like the succession driver's own pick logic. Returns
// {picked, refused, transcriptAfter, turns}.
function drivePick(Game, vid, wantId, maxTurns) {
  const r = Game.startConvo(vid);
  if (r && (r.refused || r.ended)) return { picked: false, refused: true, turns: 0 };
  const c0 = Game.convoGet(vid);
  if (!c0 || !c0.active) return { picked: false, refused: true, turns: 0 };
  let picked = false, turns = 0;
  for (let t = 0; t < (maxTurns || 14); t++) {
    turns = t + 1;
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) break;
    const target = choices.find(x => x.id === wantId);
    if (target) {
      try { Game.convoTurn(vid, target.id); } catch (e) { break; }
      picked = true;
      break;
    }
    // Filler priority (v3 lesson): after a party_role pick the menu is the
    // commit menu [dlg:commit, dlg:cant, leave] — the role picks are offered
    // by partyConvoChoices on the MAIN menu, reached via commit/cant. The
    // old filler set excluded both and dead-ended here.
    let filler = choices.find(x => /^want:/.test(x.id));
    if (!filler) filler = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!filler) filler = choices.find(x => x.id === 'dlg:commit');
    if (!filler) filler = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id));
    if (!filler) filler = choices.find(x => x.id === 'dlg:cant');
    if (!filler) break;
    try { Game.convoTurn(vid, filler.id); } catch (e) { break; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  // Transcript read AFTER endConvo, exactly like the succession driver's
  // sense-read channel (the channel under test).
  const tx = transcript(Game, vid);
  return { picked, refused: false, transcriptAfter: tx, turns };
}
// Drive ONE convo through an ordered list of wanted picks (e.g. the name
// menu then a name pick): sub-menu state (pendingPartyNames /
// pendingPartyRole) lives on the convo object, so the steps MUST share
// one conversation — v2 failed naming by opening a fresh convo per step.
// hooks: {onBeforePick(id), onAfterPick(id)} fire around wanted picks.
function driveSteps(Game, vid, wantIds, maxTurns, hooks) {
  const r = Game.startConvo(vid);
  if (r && (r.refused || r.ended)) return { pickedAll: false, refused: true, picked: [], turns: 0 };
  const c0 = Game.convoGet(vid);
  if (!c0 || !c0.active) return { pickedAll: false, refused: true, picked: [], turns: 0 };
  const picked = [];
  let turns = 0;
  for (let t = 0; t < (maxTurns || 20) && picked.length < wantIds.length; t++) {
    turns = t + 1;
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) break;
    const wantId = wantIds[picked.length];
    const target = choices.find(x => x.id === wantId);
    if (target) {
      try { if (hooks && hooks.onBeforePick) hooks.onBeforePick(wantId); } catch (e) {}
      try { Game.convoTurn(vid, target.id); } catch (e) { break; }
      try { if (hooks && hooks.onAfterPick) hooks.onAfterPick(wantId); } catch (e) {}
      picked.push(wantId);
      const cc = Game.convoGet(vid);
      if (!cc || !cc.active) break;
      continue;
    }
    // Filler priority (v3 lesson): after a party_role pick the menu is the
    // commit menu [dlg:commit, dlg:cant, leave] — the role picks are offered
    // by partyConvoChoices on the MAIN menu, reached via commit/cant. The
    // old filler set excluded both and dead-ended here.
    let filler = choices.find(x => /^want:/.test(x.id));
    if (!filler) filler = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!filler) filler = choices.find(x => x.id === 'dlg:commit');
    if (!filler) filler = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id));
    if (!filler) filler = choices.find(x => x.id === 'dlg:cant');
    if (!filler) break;
    try { Game.convoTurn(vid, filler.id); } catch (e) { break; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const tx = transcript(Game, vid);
  return { pickedAll: picked.length === wantIds.length, refused: false, picked, transcriptAfter: tx, turns };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'handover-probe-r112', fullTelemetry: true });
  await setupGame(Game);
  const out = { seed: SEED, phaseUnlock: null, invites: [], naming: null, roleA: null, roleB: null, verdict: 'NO-DATA', reason: '' };

  // Say capture: wrap Game.say exactly like the succession driver does.
  const sayLog = [];
  const _say = Game.say;
  Game.say = function (text) {
    try { sayLog.push(String(typeof text === 'function' ? text() : text)); } catch (e) {}
    return _say.apply(this, arguments);
  };

  // PHASE 0: run competent play in 5-day steps until the party unlocks
  // (village.partyUnlocked + systemArrived + codexUnlocked), max 40 days.
  let unlockedDay = null;
  for (let d = 0; d < 40; d += 5) {
    await runDays(Game, competent, { days: 5 });
    try {
      if (Game.partyUnlocked && Game.partyUnlocked()) { unlockedDay = Game.state.scholar.day; break; }
    } catch (e) {}
  }
  out.phaseUnlock = { unlocked: unlockedDay != null, day: unlockedDay, scholarDay: Game.state.scholar.day };
  if (unlockedDay == null) {
    out.reason = 'party never unlocked in 40 competent days (systemArrived/codexUnlocked/partyUnlocked gate)';
    finish(out);
    return;
  }

  // PHASE 1: invite two villagers through real conversation invites.
  const self = Game.villagerId;
  const byTrust = livingRoster(Game).filter(id => id !== self).sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
  const members = [];
  for (const vid of byTrust) {
    if (members.length >= 2) break;
    const d = drivePick(Game, vid, 'dlg:invite', 14);
    let inParty = false;
    try { inParty = !!(Game.inParty && Game.inParty(vid)); } catch (e) {}
    out.invites.push({ villager: firstName(rawName(Game, vid)), trust: trustOf(Game, vid), picked: d.picked, refused: d.refused, turns: d.turns, inParty });
    if (inParty) members.push(vid);
  }
  if (members.length < 2) {
    out.reason = `only ${members.length} invite(s) accepted (need 2); attempts: ${JSON.stringify(out.invites)}`;
    finish(out);
    return;
  }
  const [A, B] = members;

  // PHASE 2: name the party through the real name menu (member A).
  // One conversation: the name picks live on the convo's pending list.
  let named = false;
  try { named = !!(Game.partyNamed && Game.partyNamed()); } catch (e) {}
  if (!named) {
    const d = driveSteps(Game, A, ['party_name', 'party_namepick:0'], 20, null);
    try { named = !!(Game.partyNamed && Game.partyNamed()); } catch (e) {}
    out.naming = { stepsPicked: d.picked, pickedAll: d.pickedAll, turns: d.turns, named, partyName: (() => { try { return Game.partyName(); } catch (e) { return null; } })() };
  } else {
    out.naming = { alreadyNamed: true, partyName: (() => { try { return Game.partyName(); } catch (e) { return null; } })() };
  }
  if (!named) {
    out.reason = 'party naming did not complete through the real name menu';
    finish(out);
    return;
  }

  // PHASE 3: A takes scout through the real role menu (one conversation).
  const da = driveSteps(Game, A, ['party_role', 'party_rolepick:scout'], 20, null);
  let roleA = null;
  try { roleA = Game.roleOf ? Game.roleOf(A) : null; } catch (e) {}
  out.roleA = { stepsPicked: da.picked, pickedAll: da.pickedAll, turns: da.turns, roleOfA: roleA };
  if (roleA !== 'scout') {
    out.reason = `A did not end holding scout (roleOf=${roleA}); steps: ${JSON.stringify(da.picked)}`;
    finish(out);
    return;
  }

  // PHASE 4: B picks scout through the real role menu — THE measurement.
  // Say slice covers exactly B's rolepick turn (hooks around that pick).
  let markBefore = -1, markAfter = -1;
  const db = driveSteps(Game, B, ['party_role', 'party_rolepick:scout'], 20, {
    onBeforePick: (id) => { if (id === 'party_rolepick:scout') markBefore = sayLog.length; },
    onAfterPick: (id) => { if (id === 'party_rolepick:scout') markAfter = sayLog.length; },
  });
  const sayDuringPick = (markBefore >= 0 && markAfter >= markBefore) ? sayLog.slice(markBefore, markAfter) : [];
  let roleB = null, roleAAfter = null;
  try { roleB = Game.roleOf ? Game.roleOf(B) : null; } catch (e) {}
  try { roleAAfter = Game.roleOf ? Game.roleOf(A) : null; } catch (e) {}
  const txAfter = db.transcriptAfter || [];
  const handoverInSay = sayDuringPick.filter(s => /stepping back|is yours now/i.test(s));
  const assignInSay = sayDuringPick.filter(s => /is .* Scout now/i.test(s));
  const handoverInTx = txAfter.filter(s => /stepping back|is yours now/i.test(s));
  out.roleB = {
    stepsPicked: db.picked, pickedAll: db.pickedAll, turns: db.turns, roleOfB: roleB, roleOfAAfter: roleAAfter,
    sayDuringPick: sayDuringPick.map(s => s.slice(0, 300)),
    handoverInSay, assignInSay,
    transcriptAfter: txAfter.map(s => s.slice(0, 300)),
    handoverInTx,
  };
  if (!db.pickedAll || roleB !== 'scout') {
    out.reason = `B's scout pick did not complete (pickedAll=${db.pickedAll}, steps=${JSON.stringify(db.picked)}, roleOfB=${roleB})`;
    finish(out);
    return;
  }
  if (handoverInSay.length === 0 && handoverInTx.length === 0) {
    out.verdict = 'BUG';
    out.reason = 'transfer completed (B holds scout, A no longer does) with no handover line in sayLog or transcript';
  } else if (handoverInSay.length > 0 && handoverInTx.length === 0) {
    out.verdict = 'CLOSED-as-channel';
    out.reason = 'handover line fires into the sayLog (narration) but not convo.transcript — the r108 transcript gap is a capture-channel limit, not a silent transfer';
  } else if (handoverInTx.length > 0) {
    out.verdict = 'CLOSED-in-transcript';
    out.reason = 'handover line IS in the convo transcript — the r108 transcripts must have missed it another way (investigate capture, not the transfer)';
  } else {
    out.verdict = 'UNDECIDED';
    out.reason = 'unexpected channel combination';
  }
  finish(out);
}

function finish(out) {
  if (!fs.existsSync(EVID)) fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, 'journey-succession-r112-handover-probe.json'), JSON.stringify(out, null, 1));
  console.log('HANDOVER-PROBE verdict: ' + out.verdict + (out.reason ? ' — ' + out.reason : ''));
  console.log('unlock: ' + JSON.stringify(out.phaseUnlock));
  console.log('invites: ' + JSON.stringify(out.invites));
  console.log('naming: ' + JSON.stringify(out.naming));
  console.log('roleA: ' + JSON.stringify(out.roleA));
  if (out.roleB) {
    console.log('roleB: pickedAll=' + out.roleB.pickedAll + ' roleB=' + out.roleB.roleOfB + ' roleA=' + out.roleB.roleOfAAfter);
    console.log('sayDuringPick: ' + JSON.stringify(out.roleB.sayDuringPick));
    console.log('handoverInSay: ' + JSON.stringify(out.roleB.handoverInSay));
    console.log('handoverInTx: ' + JSON.stringify(out.roleB.handoverInTx));
  }
}

main().catch(e => { console.error('HANDOVER-PROBE FAILED: ' + (e && e.stack || e)); process.exit(1); });
