#!/usr/bin/env node
// diag-succession-r26-20261019.js — SUCCESSION LEG r26: THE SUCCESSOR'S OWN STORY
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. Pre-registered per MEASUREMENT.md §§9-12, 14.
//
// LEG QUESTION: "You become that villager" (Steve 2026-10-14) — the kit
// transfers (mantleBecome: abilities, XP, tracks, gear, godhood; the office
// keeps integration/slots/Codex/ledger/trust-discounted). But does the
// VILLAGE remember who the successor was? Their spouse, their close bonds,
// their pre-bearer identity — or does the office erase the person? And does
// anything fabricate bearer-era history for the successor (they "remember"
// things only the dead bearer did)?
//
// PRIOR ART: r20 (mantle/name fix), r21 (double mantle, "You're not X" beat
// closed), r22 (death pack), r23 (successor's grief for the OLD bearer),
// r24 (docket reset), r25 (open-book: promises die with their maker, named
// once). None touched the successor's OWN pre-bearer relationships.
//
// INTERESTING FINDING CRITERIA:
//   (a) the successor's spouse / closest pre-bearer bond speaks only to the
//       OFFICE (bearer, mantle, the job) with zero personal recognition —
//       blank: the person is erased by the office;
//   (b) a conversation fabricates old-bearer-only experiences onto the
//       successor ("remember when you led us through the famine" — they
//       were a villager then) — SENSE-TESTING violation: fabricated shared
//       history;
//   (c) the opposite: the village holds both — the office's standing AND
//       the person's name — named behavior worth keeping.
//
// SEEDS: 5101-5104. POLICY: competent. HORIZON: kill at day 14, play the
// successor to day 30. Death-aware: village dead/scattered -> stop.
// The successor is forced: highest-trust NPC with the strongest pre-bearer
// bond (spouse preferred), trust set to 100 so the mantle picks them.
//
// PRIMARY METRICS (binding, §14):
//   M1: >=3/4 seeds — mantle passes cleanly (new bearer, office continues).
//   M2 (people check): >=2/4 seeds — a full post-handoff transcript with the
//       successor's closest pre-bearer bond meets the quality bar (the NPC
//       wants something; options engage or deflect it; endings
//       resolve/plant/owe).
//   M3: fabrication count — lines attributing dead-bearer-only experiences
//       to the successor. 0/4 seeds required for GO; >=2/4 seeds with a
//       fabrication -> blank confirmed.
// KILL RULE: mantle fails to pass (no successor / over / softlock) on >=2/4
// seeds -> SUBSTRATE-MISSING; document and move on.
//
// Usage: SEED=5101 node scripts/diag-succession-r26-20261019.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '5101', 10);
const KILL_DAY = 14, END_DAY = 30;

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function bondV(Game, a, b) { try { const g = Game.bondGet ? Game.bondGet(a, b) : null; return (g && g.v) || 0; } catch (e) { return 0; } }
function census(Game, label) {
  const v = Game.state.village || {};
  const lines = [`--- CENSUS (${label}), day ${dayOf(Game)}, Bearer: ${firstName(rawName(Game, Game.villagerId))} ---`];
  const pk = ((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
  lines.push(`  roster: ${(v.roster || []).length} living | pantry: ${Math.round(pk).toLocaleString()} kcal`);
  const fallen = (v.fallen || []).slice(-6).map(f => `${firstName(f.name || '?')} d${f.day} (${f.cause})`);
  lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  return lines.join('\n');
}

// Conversation driver: steer toward the personal — lately, bonds, the dead.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — successor talks to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', flags: {} }; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => c.id === 't2:lately');
    if (!pick) pick = choices.find(c => /died|dead|mourn|burial|buried|grave|gone|mantle|you're not|not .*anymore/i.test(c.text || ''));
    if (!pick && t < 3) pick = choices.find(c => c.id === 'dlg:subject');
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
  const flags = {
    want: (c && c.want && (c.want.id || c.want.hook)) || 'none',
    turns: full.length,
  };
  out.push(`\nWANT: ${flags.want} | turns: ${flags.turns}`);
  return { text: out.join('\n'), flags, full: txt };
}

const rec = {
  seed: SEED, notes: [], anomalies: [],
  preBonds: [], successor: null, closest: null, spouseOf: null,
  mantle: {}, convos: [], sayLines: [],
  m1: null, m2: null, m3: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r26', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;

  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    if (/🕯️|mantle|You're not|Codex|journal|buried|grave|digging|died|dead|trauma|spouse|wife|husband|married|knew you|used to/i.test(s))
      rec.sayLines.push({ day: dayOf(Game), text: s.slice(0, 300) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- phase 1: establish ----
  await runDays(Game, competent, { days: KILL_DAY });
  if (Game.over) { rec.notes.push('village over before kill — seed skipped'); console.log(JSON.stringify(rec)); return; }
  E(census(Game, 'pre-death'));

  const v = Game.state.village || {};
  const oldId = Game.villagerId;
  const oldFirst = firstName(rawName(Game, oldId));

  // ---- pick the successor: prefer the old bearer's strongest-bond NPC with a
  // ---- living close bond of their own (spouse/kin/friend), else strongest bond
  const roster = (v.roster || []).filter(id => id !== oldId);
  let spouseOf = {};
  try {
    for (const ch of (Game.data.villagers || [])) {
      if (ch && ch.spouseId) spouseOf[ch.id] = ch.spouseId;
    }
  } catch (e) {}
  const scored = roster.map(id => {
    const sp = spouseOf[id];
    const spAlive = sp && roster.includes(sp);
    // successor's own closest bond (excluding the old bearer)
    let best = { id: null, v: -999 };
    for (const o of roster) { if (o === id) continue; const bv = bondV(Game, id, o); if (bv > best.v) best = { id: o, v: bv }; }
    return { id, name: firstName(rawName(Game, id)), spAlive: !!spAlive, spouse: spAlive ? sp : null, bestBond: best.id, bestV: best.v };
  });
  scored.sort((a, b) => ((b.spAlive ? 1000 : 0) + b.bestV) - ((a.spAlive ? 1000 : 0) + a.bestV));
  const pick = scored[0];
  if (!pick) { rec.notes.push('no candidates — seed skipped'); console.log(JSON.stringify(rec)); return; }
  // force the mantle: highest trust wins
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 5;
  v.trust[pick.id] = 100;
  rec.preBonds = scored.slice(0, 4).map(s => `${s.name}: spouse=${s.spAlive ? firstName(rawName(Game, s.spouse)) : 'no'} bestBond=${s.bestBond ? firstName(rawName(Game, s.bestBond)) + '(' + s.bestV + ')' : 'none'}`);
  E('PRE-BEARER BONDS:\n' + rec.preBonds.join('\n'));

  // ---- the kill ----
  Game.playerDeath('the expedition');
  const newId = Game.villagerId;
  const newFirst = firstName(rawName(Game, newId));
  rec.mantle = { passed: newId !== oldId && !Game.over && newId === pick.id, oldFirst, newFirst, forced: pick.id };
  rec.successor = { id: newId, name: newFirst };
  const succRec = scored.find(s => s.id === newId) || pick;
  rec.closest = succRec.bestBond ? { id: succRec.bestBond, name: firstName(rawName(Game, succRec.bestBond)), v: succRec.bestV } : null;
  rec.spouseOf = succRec.spouse ? { id: succRec.spouse, name: firstName(rawName(Game, succRec.spouse)) } : null;
  E(`MANTLE: ${oldFirst} -> ${newFirst} | passed=${rec.mantle.passed} (forced=${newId === pick.id})`);
  E(`SUCCESSOR'S PEOPLE: spouse=${rec.spouseOf ? rec.spouseOf.name : 'none'} closest=${rec.closest ? rec.closest.name + '(' + rec.closest.v + ')' : 'none'}`);
  if (!rec.mantle.passed) { rec.notes.push('mantle did not pass cleanly'); console.log(JSON.stringify(rec)); return; }

  // ---- phase 2: the successor lives; play to day 30 ----
  await runDays(Game, competent, { days: END_DAY - dayOf(Game) });
  E(census(Game, 'post (day 30)'));
  if (Game.over) { rec.notes.push('village over during successor phase'); }

  // ---- people check: talk to the successor's own people ----
  const targets = [];
  if (rec.spouseOf && (v.roster || []).includes(rec.spouseOf.id)) targets.push({ id: rec.spouseOf.id, tag: 'SPOUSE' });
  if (rec.closest && (v.roster || []).includes(rec.closest.id) && (!rec.spouseOf || rec.closest.id !== rec.spouseOf.id)) targets.push({ id: rec.closest.id, tag: 'CLOSEST-BOND' });
  // one more: a villager who was close to the OLD bearer (grief carrier)
  if (!Game.over) {
    let gb = { id: null, v: -999 };
    for (const id of (v.roster || [])) { if (id === newId) continue; const bv = bondV(Game, id, oldId); if (bv > gb.v) gb = { id, v: bv }; }
    if (gb.id && gb.v > 0) targets.push({ id: gb.id, tag: `OLD-BEARER-BOND(${gb.v})` });
  }
  for (const t of targets.slice(0, 3)) {
    if (Game.over) break;
    const r = driveConvo(Game, t.id, `${t.tag} ${firstName(rawName(Game, t.id))}`);
    rec.convos.push({ tag: t.tag, with: firstName(rawName(Game, t.id)), want: r.flags.want, turns: r.flags.turns });
    E(r.text);
    E('=====');
  }
  rec.m1 = rec.mantle.passed;
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
