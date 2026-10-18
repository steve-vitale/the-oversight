#!/usr/bin/env node
// diag-succession-r23-20261017.js — SUCCESSION LEG r23: THE SUCCESSOR'S OWN GRIEF
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life — and the successor's own relationship with the dead.
// Pre-registered per MEASUREMENT.md §§9-12, 14.
//
// LEG QUESTION: when the mantle passes, the successor had a real personal
// history with the dead bearer — a measured bond (v.bonds, -100..+100),
// shared meals, maybe a deep talk. Does the new bearer's inner life reflect
// WHO they lost? Trauma is set to a flat 10 for every successor ("the shock
// of stepping up"). Do the handoff beats name the successor's personal loss?
// Do villagers acknowledge it ("I know you two were close")? Or does the
// successor talk about their dead friend like a stranger with a briefing?
//
// PRIOR ART: r12 (orientation: who they ARE), r16 (revolving door, multi-
// mourning fix), r20 (village names its dead), r21 (double mantle, "you're
// not X"), r22 (death-pack voice). None examined the successor's OWN bond
// with the deceased: bonds form between the bearer <redacted> NPCs (bondAdd in
// carexplore/conversation/game) AND between NPCs (feasts, lingering meals),
// so bondGet(newId, oldId) is a real measured number at every handoff —
// currently read by NOTHING in the succession path.
//
// INTERESTING-FINDING CRITERIA:
//   (a) on seeds where the successor's bond with the deceased was strong
//       (|v| >= 20 or depth >= 1), ZERO handoff beats or convo lines name
//       the successor's personal loss -> fiction blank (the heaviest grief
//       in the game is the one nobody mentions);
//   (b) the successor's trauma is 10 in every case regardless of bond ->
//       mechanism note (is flat-10 senseless? or fine? documented either way);
//   (c) a villager spontaneously acknowledges the successor's grief, or the
//       successor's own convo options let them express it -> sensical, document;
//   (d) the successor talks about the dead bearer with fabricated distance
//       ("never really knew them") while the bond was strong -> SENSE violation.
//
// SEEDS: 5101, 5102, 5103, 5104 (fresh; r22 used 410x).
// POLICY: competent. HORIZON: kill at day 14, successor played to day 28.
// Death-aware: village dead/scattered -> stop.
// PRIMARY METRICS (binding, §14):
//   M1: >=3/4 seeds — mantle passes cleanly (new bearer, lineage entry, game continues).
//   M2: on seeds where |bond(newId,oldId).v| >= 20 or depth >= 1 (close or
//       hostile), >=1 line in the handoff beats or either driven convo names
//       the successor's personal relationship with the deceased. <2 qualifying
//       seeds hit -> BLANK CONFIRMED (fix justified).
//   M3: successor trauma at pass recorded (expect flat 10; measurement only).
//   M4 (people): >=2/4 seeds — a full death-convo transcript meets the quality
//       bar (NPC wants something; options engage/deflect; endings resolve/plant/owe).
// KILL RULE: mantle fails to pass on >=2/4 seeds -> SUBSTRATE-MISSING.
//
// Usage: SEED=5101 node scripts/diag-succession-r23-20261017.js              (natural bonds)
//        SEED=5102 BONDSEED=close node scripts/diag-succession-r23-20261017.js   (close-friend successor)
//        SEED=5104 BONDSEED=hostile node scripts/diag-succession-r23-20261017.js (bad-blood successor)
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '5101', 10);
const KILL_DAY = 14, END_DAY = 28;
// BONDSEED: 'close' | 'hostile' | 'none'. Scripts a strong personal bond
// between the old bearer <redacted> the likely successor(s) just before the kill —
// pilot-only (game code untouched). The handoff is what's under test: what
// does it do with a strong bond? Natural bonds at d14 are ~0-3 (5101), so
// without seeding the question is untestable in the pilot window.
const BONDSEED = process.env.BONDSEED || 'none';

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function traumaOf(Game) { try { return Game.state.scholar.trauma || 0; } catch (e) { return 0; } }
function bondOf(Game, a, b) {
  try { const g = Game.bondGet(a, b); return g ? { v: g.v || 0, depth: g.depth || 0 } : { v: 0, depth: 0 }; } catch (e) { return { v: 0, depth: 0 }; }
}
function census(Game, label) {
  const v = Game.state.village || {};
  const lines = [`--- CENSUS (${label}), day ${dayOf(Game)}, Bearer: ${firstName(rawName(Game, Game.villagerId))} ---`];
  const pantry = Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
  lines.push(`  roster: ${((v.roster || []).length)} living | pantry: ${pantry.toLocaleString()} kcal | trauma: ${traumaOf(Game)}`);
  return lines.join('\n');
}

// Conversation driver: mourning lives in ask:lately / t2:lately. We want the
// SUCCESSOR's grief in the frame, so we chase death/mourning choices first.
function driveConvo(Game, vid, tag, deadFirst, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — bearer <redacted> to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', flags: {} }; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => c.id === 't2:lately');
    if (!pick && t < 3) pick = choices.find(c => c.id === 'dlg:subject');
    if (!pick) pick = choices.find(c => /died|dead|mourn|burial|buried|grave|gone|lost|grief|how are you|holding up/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^want:/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
    out.push('');
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
    // does anyone acknowledge the SUCCESSOR's personal bond with the dead?
    successorGriefNamed: /(you two were|you were close|your friend|must be hard (for you|on you)|how are you holding|i know (this|it) hits|lost someone|knew them well|they were (dear|close) to you)/i.test(txt),
    // fabricated distance while the bond was strong
    fabricatedDistance: /(never (really )?knew|didn't know them|barely knew)/i.test(txt),
    want: (c && c.want && (c.want.id || c.want.hook)) || 'none',
  };
  out.push(`\nCARRY-FLAGS: namedDeceased=${flags.namedDeceased} successorGriefNamed=${flags.successorGriefNamed} fabricatedDistance=${flags.fabricatedDistance} want=${flags.want}`);
  return { text: out.join('\n'), flags };
}

const rec = {
  seed: SEED, notes: [], anomalies: [],
  mantle: {}, bondAtPass: null, handoffSay: [], convos: [],
  m1: null, m2: null, m3: null, m4: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r23', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;

  // Capture ONLY the handoff burst: reset just before the kill. No filter —
  // playerDeath emits a bounded burst (~10-25 lines); we read them all.
  const _say = Game.say;
  let capturing = false;
  Game.say = function (t) {
    if (capturing) rec.handoffSay.push({ day: dayOf(Game), text: String(t || '').slice(0, 400) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- phase 1: establish ----
  await runDays(Game, competent, { days: KILL_DAY });
  if (Game.over) { rec.notes.push('village over before kill — seed skipped'); console.log(JSON.stringify(rec)); return; }
  E(census(Game, 'pre-death'));
  const oldId = Game.villagerId;
  const oldFirst = firstName(rawName(Game, oldId));

  // Pre-death bond map: old bearer <-> every living villager.
  const vd0 = Game.state.village || {};
  const living0 = (vd0.roster || []).filter(id => id !== oldId);
  const bondMap = living0.map(id => ({ id, name: firstName(rawName(Game, id)), bond: bondOf(Game, oldId, id) }));
  bondMap.sort((a, b) => b.bond.v - a.bond.v);
  E('BONDS (old bearer <-> villagers): ' + bondMap.slice(0, 6).map(b => `${b.name}:${b.bond.v}(d${b.bond.depth})`).join(' '));

  // ---- the kill ----
  // BONDSEED: script a strong personal bond old-bearer <-> likely successors.
  // The successor is the highest-trust NPC; seed the top 3 so whoever is
  // chosen carries the bond. Trust sort replicated from ledger.js playerDeath.
  if (BONDSEED === 'close' || BONDSEED === 'hostile') {
    try {
      const vd = Game.state.village || {};
      const trust = vd.trust || {};
      let cands = [];
      try { cands = Game.npcIds(); } catch (e) { cands = (vd.roster || []).filter(id => id !== oldId); }
      cands = cands.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0)).slice(0, 3);
      const dv = BONDSEED === 'close' ? 55 : -45;
      // Direct state write (pilot-only): bondAdd's +6/day formation cap is
      // about pacing, not the handoff — the handoff reads the VALUE. A
      // {v:55, depth:2} bond is legitimate game state (NPC-NPC bonds hit 28
      // in 16 unscripted days on 5101); we need it NOW to test the handoff.
      try {
        const vb = Game.state.village.bonds || (Game.state.village.bonds = {});
        const day = dayOf(Game);
        for (const cid of cands) vb[Game.bondKey(oldId, cid)] = { v: dv, depth: dv > 0 ? 2 : -2, day, dayGain: 0 };
      } catch (e) { rec.anomalies.push('bondseed write threw: ' + e.message); }
      rec.notes.push(`bondseed ${BONDSEED}: ${dv} with ${cands.map(c => firstName(rawName(Game, c))).join(',')}`);
      E(`BONDSEED ${BONDSEED}: set ${dv} old-bearer <-> ${cands.map(c => firstName(rawName(Game, c))).join(', ')}`);
    } catch (e) { rec.anomalies.push('bondseed threw: ' + e.message); }
  }
  rec.handoffSay = []; capturing = true;
  Game.playerDeath('the expedition');
  capturing = false;
  const newId = Game.villagerId;
  const newFirst = firstName(rawName(Game, newId));
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  const bondAtPass = bondOf(Game, newId, oldId); // entry persists across death
  const traumaAtPass = traumaOf(Game);
  rec.mantle = {
    passed: newId !== oldId && !Game.over,
    oldFirst, newFirst,
    lineageEntry: !!(lastLin.cause && lastLin.villagerId === oldId),
  };
  rec.bondAtPass = bondAtPass;
  rec.m3 = { traumaAtPass, bondV: bondAtPass.v, bondDepth: bondAtPass.depth };
  E(`MANTLE: ${oldFirst} -> ${newFirst} | passed=${rec.mantle.passed}`);
  E(`BOND(successor,deceased) at pass: v=${bondAtPass.v} depth=${bondAtPass.depth} | trauma=${traumaAtPass}`);
  E('HANDOFF SAY (' + rec.handoffSay.length + ' captured):');
  for (const l of rec.handoffSay) E(`  d${l.day}: ${l.text.slice(0, 220)}`);

  // ---- phase 2: overnight recovery + two grief convos ----
  await runDays(Game, competent, { days: 1 });
  if (!Game.over) {
    const vd = Game.state.village || {};
    const living = (vd.roster || []).filter(id => id !== Game.villagerId);
    // (a) the DECEASED's closest living friend — mourning convo
    let bestF = null, bestFV = -999;
    for (const id of living) { const b = bondOf(Game, oldId, id); if (b.v > bestFV) { bestFV = b.v; bestF = id; } }
    // (b) the SUCCESSOR's closest living friend — do they acknowledge the loss?
    let bestS = null, bestSV = -999;
    for (const id of living) { const b = bondOf(Game, newId, id); if (b.v > bestSV) { bestSV = b.v; bestS = id; } }
    if (bestF) {
      E(`\nDeceased's closest living friend: ${firstName(rawName(Game, bestF))} (bond ${bestFV})`);
      const dc = driveConvo(Game, bestF, `grief-friend-d${dayOf(Game)}`, oldFirst);
      rec.convos.push(Object.assign({ day: dayOf(Game), partner: firstName(rawName(Game, bestF)), partnerBondWithDeceased: bestFV, kind: 'deceased-friend' }, dc));
      E(dc.text.split('\n### FULL TRANSCRIPT')[0]);
    }
    if (bestS && bestS !== bestF) {
      E(`\nSuccessor's closest living friend: ${firstName(rawName(Game, bestS))} (bond ${bestSV})`);
      const dc = driveConvo(Game, bestS, `grief-self-d${dayOf(Game)}`, oldFirst);
      rec.convos.push(Object.assign({ day: dayOf(Game), partner: firstName(rawName(Game, bestS)), partnerBondWithSuccessor: bestSV, kind: 'successor-friend' }, dc));
      E(dc.text.split('\n### FULL TRANSCRIPT')[0]);
    }
  }

  // ---- phase 3: successor lives to day 28 ----
  for (let i = 0; i < 20 && !Game.over && dayOf(Game) < END_DAY; i++) await runDays(Game, competent, { days: 1 });
  E(census(Game, 'end (day ~28)'));

  // ---- metric roll-up ----
  rec.m1 = !!(rec.mantle.passed && rec.mantle.lineageEntry && !Game.over);
  const strong = Math.abs(rec.bondAtPass.v) >= 20 || rec.bondAtPass.depth >= 1;
  // First-pass regex; the real judgment is the SENSE read of handoffSay + transcripts.
  const namedAnywhere = rec.handoffSay.some(l => /you two|your friend|close to|knew (him|her|them) well|will miss|meant .* to you|dear to you|bad blood|never liked|hated/i.test(l.text)) ||
    rec.convos.some(c => c.flags && c.flags.successorGriefNamed);
  rec.m2 = { qualifying: strong, named: namedAnywhere, hit: strong && namedAnywhere };
  const quals = rec.convos.map(c => c.flags);
  rec.m4 = quals.filter(f => f && f.namedDeceased && f.want !== 'none').length;

  const outPath = path.join(ROOT, 'evidence', '2026-10-18', `journey-succession-r23-${SEED}.json`);
  try { fs.writeFileSync(outPath, JSON.stringify(rec, null, 2)); E(`wrote ${outPath}`); } catch (e) { E('write failed: ' + e.message); }
  console.log(JSON.stringify({ seed: SEED, m1: rec.m1, m2: rec.m2, m3: rec.m3, m4: rec.m4, notes: rec.notes, anomalies: rec.anomalies }));
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
