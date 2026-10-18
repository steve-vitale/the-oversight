#!/usr/bin/env node
// diag-succession-r24-20261018.js — SUCCESSION LEG r24: THE SENTENCE DIES WITH THE BEARER
// Journey leg 7: death of the player character, the mantle passing — when the
// bearer <redacted> EXILED.
//
// LEG QUESTION: the bearer <redacted> exiled. Does the sentence end with the old body,
// or does the innocent successor inherit the exile machinery (the 2026-10-06
// BUG 1 class)? With Steve's 2026-10-17 cold-shoulder ruling (r20b) live,
// an inherited exile would socially cut, pantry-deny, and uprising-target
// the successor for a crime they didn't commit.
//
// PRIOR ART: 2026-10-06 BUG 1 (filed, never verified); the uprising-'lost'
// path already implements "the crimes died with the criminal" (brawler loop
// 2026-10-08, justice.js ~880: docket resets, s.exiled=false); r20b assumed
// "post-succession the docket resets anyway" — unverified. playerDeath
// (ledger.js 622-1092) never touches s.exiled / s.drifting / s.founding /
// s.exileStartDay / v.justice. r22/r23 covered death-pack voice + successor
// grief; neither touched exile.
//
// INTERESTING-FINDING CRITERIA:
//   (a) s.exiled true on the successor and/or v.justice still live after the
//       mantle -> BUG CONFIRMED. Fix: reset the docket + clear exile-family
//       flags on mantle, per the uprising precedent.
//   (b) justiceTick fires startVillageUprising('defied exile') against the
//       innocent successor -> the bug has teeth (mechanical, not cosmetic).
//   (c) the successor's convos resolve as cold-shoulder refusals via
//       justiceExiled() -> the r20b ruling misfires through the mantle.
//   (d) recoverBearer brings the exiled bearer's body home with the standard
//       line -> sense question (document; Steve-call on the fiction).
//   (e) handoff/grief beats mourn-by-name with zero acknowledgment of the
//       exile -> sense question (document).
//
// SEEDS: 6101, 6102 (exile d20, kill same-day at Haven); 6103, 6104
// (WALKOFF=1: exiled d20, walked off Haven ground, killed d21 in the wild).
// POLICY: competent. HORIZON: successor plays to d35.
// Death-aware: village dead/scattered -> stop.
// PRIMARY METRICS (binding, MEASUREMENT.md §14):
//   M1: >=3/4 mantles pass cleanly (new bearer, lineage entry, game continues).
//   M2 (mechanism): on all exiled-bearer deaths, by d22: successor
//       s.exiled === false AND v.justice = {stage 0, exiled false, crimes []}.
//       <3/4 -> BUG CONFIRMED -> fix justified.
//   M3: no startVillageUprising against the successor in the d20-d35 window.
//   M4 (people): >=2/4 seeds — a full grief transcript sense-read; does
//       anyone name the exile, or does the village mourn-by-name blindly?
// KILL RULE: mantle fails to pass on >=2/4 seeds -> SUBSTRATE-MISSING.
//
// Usage: SEED=6101 node scripts/diag-succession-r24-20261018.js
//        SEED=6103 WALKOFF=1 MOOTSYNC=1 node scripts/diag-succession-r24-20261018.js
//   WALKOFF=1: bearer walked off Haven ground before the kill (wild death).
//   MOOTSYNC=1: full moot-exile end state (j.stage=3) via syncJusticeAfterMoot.
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '6101', 10);
const EXILE_DAY = 20, END_DAY = 35;
const WALKOFF = process.env.WALKOFF === '1';

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function justiceSnap(Game) {
  try {
    const j = Game.justiceState();
    return { stage: j.stage || 0, exiled: !!j.exiled, exileDay: j.exileDay || null, crimes: (j.crimes || []).map(c => c.type || c.kind || '?') };
  } catch (e) { return { err: String(e.message).slice(0, 60) }; }
}
function exileFam(Game) {
  const s = Game.state.scholar || {};
  return { exiled: !!s.exiled, drifting: !!s.drifting, founding: !!s.founding, exileStartDay: s.exileStartDay != null ? s.exileStartDay : null, insideHaven: !!s.insideHaven };
}

// Conversation driver: chase grief/mourning topics first.
function driveConvo(Game, vid, tag, deadFirst, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — bearer <redacted> to ${firstName(rawName(Game, vid))}`];
  let refused = false;
  try {
    const r = Game.startConvo(vid);
    if (r && (r.refused || r.ended)) refused = true;
  } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', refused: 'throw', flags: {} }; }
  const c0 = Game.convoGet(vid);
  if (refused || !c0 || !c0.active) {
    out.push(`(convo refused or never opened — cold-shoulder shape: ${JSON.stringify({ refused })}`);
    const last = ((c0 && c0.transcript) || []).slice(-3).map(e => `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 300)}`).join('\n');
    if (last) out.push(last);
    return { text: out.join('\n'), refused, flags: {} };
  }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => c.id === 't2:lately');
    if (!pick && t < 3) pick = choices.find(c => c.id === 'dlg:subject');
    if (!pick) pick = choices.find(c => /died|dead|mourn|burial|buried|grave|gone|lost|grief|exil|cast out|how are you|holding up/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^want:/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  const full = [];
  for (const e of ((c && c.transcript) || [])) full.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  out.push('\n### FULL TRANSCRIPT');
  out.push(full.join('\n'));
  const txt = full.join('\n');
  const df = deadFirst || '';
  const flags = {
    namedDeceased: df ? new RegExp('\\b' + df + '\\b', 'i').test(txt) : false,
    namedExile: /exil|cast (you|them|him|her) out|cast-out|the sentence|drove (you|them|him|her) off|walked (you|them|him|her) out/i.test(txt),
    want: (c && c.want && (c.want.id || c.want.hook)) || 'none',
  };
  out.push(`\nCARRY-FLAGS: namedDeceased=${flags.namedDeceased} namedExile=${flags.namedExile} want=${flags.want}`);
  return { text: out.join('\n'), refused: false, flags, fullText: txt };
}

const rec = {
  seed: SEED, walkoff: WALKOFF, notes: [], anomalies: [],
  mantle: {}, exilePre: null, exileFamPre: null, postMantle: null,
  handoffSay: [], recoverySay: [], uprisingFired: null, coldShoulder: null,
  convos: [], tele: {},
  m1: null, m2: null, m3: null, m4: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r24', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;

  const _say = Game.say;
  let capturing = false, recovering = false;
  const handoffSay = [], recoverySay = [];
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) handoffSay.push({ day: dayOf(Game), text: s.slice(0, 400) });
    if (recovering && /bring .* home|grave is dug|quarrel|sentence|docket|cast .* out|exil/i.test(s)) recoverySay.push({ day: dayOf(Game), text: s.slice(0, 400) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- phase 1: establish ----
  await runDays(Game, competent, { days: EXILE_DAY });
  if (Game.over) { rec.notes.push('village over before exile — seed skipped'); console.log(JSON.stringify(rec)); return; }
  const oldId = Game.villagerId;
  const oldFirst = firstName(rawName(Game, oldId));
  const vd = Game.state.village || {};
  E(`--- PRE-EXILE d${dayOf(Game)}: bearer ${oldFirst}, roster ${(vd.roster || []).length} living`);

  // ---- the exile: the game's own flow ----
  Game.exilePlayer('moot');
  rec.exilePre = justiceSnap(Game);
  rec.exileFamPre = exileFam(Game);
  E(`EXILED: justice=${JSON.stringify(rec.exilePre)} scholarFam=${JSON.stringify(rec.exileFamPre)}`);
  if (WALKOFF) {
    // the sentence says be off Haven's ground by dawn — walk (pilot scripting,
    // same class as r22's walk-to-the-body writes)
    const hx = vd.px != null ? vd.px : 4, hy = vd.py != null ? vd.py : 4;
    try {
      Game.state.scholar.mx = hx + 2; Game.state.scholar.my = hy;
      Game.state.scholar.insideHaven = false;
      if (Game.map) { Game.map.px = hx + 2; Game.map.py = hy; }
    } catch (e) { rec.anomalies.push('walkoff write threw: ' + e.message); }
    E('WALKOFF: bearer off Haven ground (wild node)');
  }

  // ---- the kill (same tick — the defied-exile grace covers same-day) ----
  // MOOTSYNC=1: complete the real moot-exile sequence
  // (resolveCase('exile') -> exilePlayer -> syncJusticeAfterMoot('exile')),
  // which sets j.stage = 3 — the full sentence, not just the exile flag.
  if (process.env.MOOTSYNC === '1') {
    try { Game.syncJusticeAfterMoot('exile'); } catch (e) { rec.anomalies.push('mootsync threw: ' + e.message); }
    rec.exilePre = justiceSnap(Game);
    E(`MOOTSYNC: justice=${JSON.stringify(rec.exilePre)}`);
  }
  handoffSay.length = 0; capturing = true;
  Game.playerDeath(WALKOFF ? 'the wild' : 'the expedition');
  capturing = false;
  // NOTE: the say wrapper stays installed through phase 2 (recoverySay);
  // it is restored at the very end.
  const newId = Game.villagerId;
  const newFirst = firstName(rawName(Game, newId));
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  rec.mantle = {
    passed: newId !== oldId && !Game.over,
    oldFirst, newFirst,
    lineageEntry: !!(lastLin.cause && lastLin.villagerId === oldId),
  };
  rec.handoffSay = handoffSay;
  // ---- M2: the post-mantle docket ----
  const sPost = Game.state.scholar || {};
  const jPost = justiceSnap(Game);
  rec.postMantle = {
    sExiled: !!sPost.exiled, sDrifting: !!sPost.drifting, sFounding: !!sPost.founding,
    justice: jPost,
    docketClear: jPost.stage === 0 && !jPost.exiled && (jPost.crimes || []).length === 0,
  };
  rec.m2 = { sExiledFalse: !rec.postMantle.sExiled, docketClear: rec.postMantle.docketClear };
  E(`MANTLE: ${oldFirst} -> ${newFirst} | passed=${rec.mantle.passed}`);
  E(`POST-MANTLE: s.exiled=${rec.postMantle.sExiled} s.drifting=${rec.postMantle.sDrifting} s.founding=${rec.postMantle.sFounding}`);
  E(`POST-MANTLE justice: ${JSON.stringify(jPost)}`);
  E('HANDOFF SAY (' + handoffSay.length + ' captured):');
  for (const l of handoffSay) E(`  d${l.day}: ${l.text.slice(0, 200)}`);
  const docketVoice = handoffSay.filter(l => /quarrel|sentence|docket/i.test(l.text));
  rec.docketVoiceLines = docketVoice.length;
  E(`DOCKET VOICE lines in handoff: ${docketVoice.length}`);

  // ---- phase 2: overnight recovery + grief convos INSIDE the mourning window ----
  let uprisingFired = null;
  const _up = Game.startVillageUprising;
  Game.startVillageUprising = function (reason) {
    uprisingFired = { reason: String(reason || ''), day: dayOf(Game) };
    E(`!!! UPRISING FIRED: '${reason}' on day ${dayOf(Game)} against ${firstName(rawName(Game, Game.villagerId))}`);
    return _up ? _up.call(this, reason) : undefined;
  };
  recovering = true;
  await runDays(Game, competent, { days: 1 });
  recovering = false;
  E('RECOVERY SAY (' + recoverySay.length + ' captured):');
  for (const l of recoverySay) E(`  d${l.day}: ${l.text.slice(0, 220)}`);

  if (!Game.over) {
    // ---- cold-shoulder check: one convo as the successor ----
    const living = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
    if (living.length) {
      const vid = living[0];
      let refused = 'unknown', note = '';
      try {
        const r = Game.startConvo(vid);
        const c = Game.convoGet(vid);
        refused = !!(r && (r.refused || r.ended)) || !(c && c.active);
        note = refused ? 'REFUSED (cold-shoulder shape)' : 'opened';
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) { note = 'threw: ' + e.message; }
      rec.coldShoulder = { partner: firstName(rawName(Game, vid)), refused, note, justiceExiledNow: (() => { try { return Game.justiceExiled(); } catch (e) { return 'err'; } })() };
      E(`COLD-SHOULDER CHECK with ${rec.coldShoulder.partner}: ${note} | justiceExiled()=${rec.coldShoulder.justiceExiledNow}`);
    }
    // ---- people check (M4): two grief convos, sense-read later ----
    // Driven the morning after the death — inside the 10-day mantle-memory
    // mourning window, the same timing r23 used.
    let bestF = null, bestFV = -999;
    for (const id of living) {
      let bv = 0; try { const g = Game.bondGet(oldId, id); bv = (g && g.v) || 0; } catch (e) {}
      if (bv > bestFV) { bestFV = bv; bestF = id; }
    }
    if (bestF) {
      E(`\nDeceased's closest living friend: ${firstName(rawName(Game, bestF))} (bond ${bestFV})`);
      const dc = driveConvo(Game, bestF, `grief-friend-d${dayOf(Game)}`, oldFirst);
      rec.convos.push(Object.assign({ day: dayOf(Game), partner: firstName(rawName(Game, bestF)), kind: 'deceased-friend', refused: dc.refused }, { text: dc.text, flags: dc.flags, fullText: dc.fullText }));
      E(dc.text.split('\n### FULL TRANSCRIPT')[0].slice(0, 1500));
    }
    const living2 = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId && id !== bestF);
    if (living2.length) {
      const vid2 = living2[0];
      const dc2 = driveConvo(Game, vid2, `grief-other-d${dayOf(Game)}`, oldFirst);
      rec.convos.push(Object.assign({ day: dayOf(Game), partner: firstName(rawName(Game, vid2)), kind: 'other', refused: dc2.refused }, { text: dc2.text, flags: dc2.flags, fullText: dc2.fullText }));
      E(dc2.text.split('\n### FULL TRANSCRIPT')[0].slice(0, 1500));
    }
  } else {
    rec.notes.push('game over before convos — ' + (Game.villageLost ? 'village lost' : 'over'));
  }

  // ---- phase 3: the successor's first fortnight (uprising watch) ----
  await runDays(Game, competent, { days: END_DAY - EXILE_DAY - 1 });
  rec.uprisingFired = uprisingFired;
  rec.m3 = { noUprising: uprisingFired === null, uprising: uprisingFired };
  E(`UPRISING in d${EXILE_DAY}-d${END_DAY} window: ${uprisingFired ? 'FIRED (' + uprisingFired.reason + ')' : 'none'}`);

  // ---- metrics + telemetry ----
  rec.m1 = { passed: rec.mantle.passed && rec.mantle.lineageEntry };
  rec.m4 = { convosDriven: rec.convos.length, withFullText: rec.convos.filter(c => c.fullText).length };
  const alive = ((Game.state.village || {}).roster || []).length;
  const fallen = ((Game.state.village || {}).fallen || []).length;
  let mentions = 0;
  const dfRe = new RegExp('\\b' + oldFirst + '\\b', 'gi');
  for (const c of rec.convos) { const m = (c.fullText || '').match(dfRe); if (m) mentions += m.length; }
  rec.tele = {
    'deaths.bearer': 1,
    'census.alive': alive,
    'census.fallen': fallen,
    'census.integrationStage': (() => { try { return Game.integrationStage ? Game.integrationStage() : 0; } catch (e) { return 0; } })(),
    'week2.deadBearerMentions': mentions,
  };
  E(`\nTELE: ${JSON.stringify(rec.tele)}`);
  E(`M1 mantle=${rec.m1.passed} M2 sExiledFalse=${rec.m2.sExiledFalse} docketClear=${rec.m2.docketClear} M3 noUprising=${rec.m3.noUprising}`);
  Game.say = _say;
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('DIAG FATAL: ' + (e && e.stack || e)); process.exit(1); });
