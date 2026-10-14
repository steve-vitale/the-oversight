#!/usr/bin/env node
// diag-crisis-outbreak-convo-20261014.js — CRISIS LEG r8: the outbreak in conversation.
// Controlled REAL outbreak: establish 14d (oracleV2), stage gut-rot on 4 adults
// (v.sick staging — the same staging the r3 proof test uses; every downstream
// machine — sick behavior, dawn ticks, tending, relief speeches, wants,
// conversations — fully real), run 5 more days, then drive full transcripts
// with 2 sick + 2 healthy villagers asking 'lately' first.
// Question: does the village's conversation carry the outbreak, or does only
// the sick villager's opener mention it while everyone else talks creek concerts?
// Usage: SEED=777 node scripts/diag-crisis-outbreak-convo-20261014.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '777', 10);
const ESTABLISH = parseInt(process.env.ESTABLISH || '14', 10), OUTBREAK_DAYS = parseInt(process.env.OUTBREAK_DAYS || '3', 10);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function isAdult(Game, vid) { try { return Game.npcAge(vid) >= 15; } catch (e) { return true; } }
function isSick(Game, vid) {
  try { const s = (Game.state.village.sick || {})[vid]; return s && (s.daysLeft || 0) > 0 && Game.vpOf(vid) && !Game.vpOf(vid).dead; } catch (e) { return false; }
}
function sickName(Game, vid) {
  try { return String(((Game.state.village.sick || {})[vid] || {}).name || 'sick'); } catch (e) { return 'sick'; }
}

const rec = { seed: SEED, day: 0, staged: [], stillSick: [], convos: [], notes: [] };
const E = (s) => console.error(s);

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))} (sick=${isSick(Game, vid) ? sickName(Game, vid) : 'no'})`];
  let latelyKind = 'unknown';
  try { const ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; latelyKind = ev ? ev.kind : 'none'; } catch (e) {}
  out.push(`[latelyKind=${latelyKind}]`);
  try { Game.startConvo(vid); } catch (e) { return { vid, tag, latelyKind, lines: out, err: 'startConvo threw: ' + e.message }; }
  for (let t = 0; t < maxTurns; t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { out.push('(convoChoices threw)'); break; }
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /sick|ill|fever|water|boil|herb|heal|tire|worse|disease|gut/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    out.push(`> [${pick.id}] ${pick.text}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push('(convoTurn threw: ' + e.message + ')'); break; }
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return { vid, name: firstName(rawName(Game, vid)), sick: isSick(Game, vid), latelyKind, lines: out.filter(l => !/^## /.test(l) === false || true).map(String) };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-outbreak-convo', fullTelemetry: true });
  await setupGame(Game);
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length}`);

  // ---- stage the outbreak (controlled): 5 adults, deep gut-rot ----
  // daysLeft deliberately > OUTBREAK_DAYS so the outbreak is still raging
  // at conversation time (pilot lesson: daysLeft 6 ≈ the tick count, all recovered).
  const adults = livingRoster(Game).filter(id => isAdult(Game, id) && id !== Game.villagerId);
  const staged = adults.slice(0, 5);
  const v = Game.state.village;
  v.sick = v.sick || {};
  const popBefore = livingRoster(Game).slice();
  for (const id of staged) {
    v.sick[id] = { name: 'gut rot', daysLeft: 12, severity: 3 };
    rec.staged.push({ who: firstName(rawName(Game, id)), vid: String(id).slice(0, 12) });
  }
  rec.notes.push(`staged gut-rot outbreak on ${staged.length} adults at d${dayOf(Game)}; downstream (ticks/tending/relief/convo) fully real`);
  E(`[OUTBREAK] staged on ${staged.map(id => firstName(rawName(Game, id))).join(', ')}`);

  // ---- let it develop ----
  await runDays(Game, oracleV2, { days: OUTBREAK_DAYS });
  if (Game.over) { E('[OUTBREAK] game over during outbreak development — recording partial'); }
  rec.day = dayOf(Game);
  const sickNow = livingRoster(Game).filter(id => isSick(Game, id));
  const popAfter = new Set(livingRoster(Game));
  rec.deaths = popBefore.filter(id => !popAfter.has(id)).map(id => ({ who: firstName(rawName(Game, id)) }));
  rec.sickRecords = sickNow.map(id => { try { return { who: firstName(rawName(Game, id)), rec: (Game.state.village.sick || {})[id] }; } catch (e) { return { who: '?', rec: null }; } });
  rec.stillSick = sickNow.map(id => ({ who: firstName(rawName(Game, id)), what: sickName(Game, id) }));
  E(`[DAY ${rec.day}] still sick: ${rec.stillSick.map(s => s.who + '(' + s.what + ')').join(', ') || 'NONE'}`);

  // ---- conversations ----
  const sick = sickNow.slice(0, 2);
  const healthy = livingRoster(Game).filter(id => !isSick(Game, id) && id !== Game.villagerId).slice(0, 2);
  for (const id of sick) {
    const c = driveConvo(Game, id, 'SICK', 12);
    rec.convos.push(c);
    E(c.lines.join('\n'));
  }
  for (const id of healthy) {
    const c = driveConvo(Game, id, 'HEALTHY', 12);
    rec.convos.push(c);
    E(c.lines.join('\n'));
  }
  console.log(JSON.stringify(rec));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
