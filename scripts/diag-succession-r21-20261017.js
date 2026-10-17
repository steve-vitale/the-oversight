#!/usr/bin/env node
// diag-succession-r21-20261017.js — SUCCESSION LEG r21: THE MANTLE PASSES TWICE.
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life — and then it happens AGAIN. Pre-registered per
// MEASUREMENT.md §§9-12, 14.
//
// LEG QUESTION: when the mantle passes TWICE in one run, does the village's
// lineage, mourning, trust inheritance, and the third bearer's identity stay
// coherent? r20 (2026-10-16) covered one clean mantle (M1/M2/M3 all HIT);
// r21 stresses the chain: does the third bearer inherit TWO deaths' worth of
// history honestly, or does identity/mourning/ledger blur?
//
// INTERESTING FINDING CRITERIA:
//   (a) both mantles pass cleanly: new bearer != old both times, lineage has
//       two entries with causes, corpses + death packs, burials drain;
//   (b) third-bearer conversations SENSE-carry the dead (named mourning for
//       bearer1 and/or bearer2) and treat the third bearer as a new person
//       (no identity blending: no "remember when YOU..." addressed to a body
//       that wasn't there);
//   (c) trust inheritance across two passes stays sane (floor holds, no
//       compounding collapse or runaway);
//   (d) any gap: lineage-ordering bugs, mourning-silence on the second death,
//       identity confusion, ability/gear leaks into the third body.
//
// SEEDS: 3050, 3055, 3061 (fresh; r20 used 2026/2031/2042). Policy: competent.
// HORIZON: kill1 at day 12, kill2 at day 26, play to day 40. Death-aware:
// village dead/scattered -> stop.
// PRIMARY METRICS (binding, §14):
//   M1: >=2/3 seeds — both mantles pass cleanly (new bearer both times,
//       lineage entries x2 with causes, corpse found each time, game not over).
//   M2: >=2/3 seeds — >=1 of the third-bearer's convos SENSE-carries a dead
//       bearer by NAME (bearer1 or bearer2) OR the new-person beat.
//   M3: >=2/3 seeds — third bearer is THEIR OWN body: 0 abilities carried
//       from the first two bearers' kits, background legs = their own
//       occupation, no identity-leak flags in transcripts.
// KILL RULE: a mantle fails to pass (no successor / over / softlock) on
// >=2/3 seeds -> SUBSTRATE-MISSING; document and move on.
//
// Usage: SEED=3050 node scripts/diag-succession-r21-20261017.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '3050', 10);
const KILL1_DAY = 12, KILL2_DAY = 26, END_DAY = 40;

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function codexPlants(Game) {
  try { return Object.values((Game.state.codex || {}).plants || {}).filter(e => (e && (e.level || 0)) >= 1).length; } catch (e) { return -1; }
}
function census(Game, label) {
  const v = Game.state.village || {};
  const lines = [`--- CENSUS (${label}), day ${dayOf(Game)}, Bearer: ${firstName(rawName(Game, Game.villagerId))} ---`];
  for (const vid of (v.roster || [])) {
    const rc = (v.rosterChars || {})[vid] || {};
    const hp = (v.health || {})[vid];
    lines.push(`  ${firstName(rc.name || vid)} [${rc.occupationId || rc.formerOccupation || '?'}]${hp !== undefined && hp < 100 ? ' HP' + Math.round(hp) : ''}${vid === Game.villagerId ? ' <= BEARER' : ''}`);
  }
  const fallen = (v.fallen || []).slice(-10).map(f => `${firstName(f.name || rawName(Game, f.villagerId) || '?')} d${f.day} (${f.cause})`);
  lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  pantry: ${pantryKcal(Game).toLocaleString()} kcal | codex plants: ${codexPlants(Game)} | scholar abilities: ${((Game.state.scholar || {}).abilities || []).length}`);
  return lines.join('\n');
}
function lineageDump(Game) {
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  return lin.map((e, i) => `  #${i} ${e.name || '?'} (${(e.villagerId || '').slice(0, 10)}) d${e.day || '?'} cause=${e.cause || e.outcome || '?'}`).join('\n') || '  (empty)';
}
function trustOf(Game, vid) {
  try { return (Game.state.village.trust || {})[vid]; } catch (e) { return undefined; }
}

// Conversation driver: ask:lately first (mourning lives there), then wants.
function driveConvo(Game, vid, tag, deadFirsts, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — third bearer talking to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', flags: {} }; }
  try {
    const open = (Game.convoChoices(vid) || []).map(x => `[${x.id}] ${(x.text || x.label || '').slice(0, 80)}`);
    out.push(`OPEN CHOICES (${open.length}): ${open.join(' | ')}`);
  } catch (e) {}
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    // lately lives behind the subject switch when a want holds the opening
    // (r21: on the death day itself the want took the opening slot)
    if (!pick) pick = choices.find(c => c.id === 't2:lately');
    if (!pick && t < 3) pick = choices.find(c => c.id === 'dlg:subject');
    if (!pick) pick = choices.find(c => /died|dead|mourn|burial|buried|grave|gone|mantle|new|who are you/i.test(c.text || ''));
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
  out.push(`FINAL: want=${(c && c.want && c.want.id) || (c && c.want && c.want.hook) || 'none'}`);
  out.push('\n### FULL TRANSCRIPT');
  const full = [];
  for (const e of ((c && c.transcript) || [])) full.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  out.push(full.join('\n'));
  const txt = full.join('\n');
  const namedAny = (deadFirsts || []).some(f => new RegExp('since ' + f + '\\b', 'i').test(txt) || new RegExp('\\b' + f + '\\b.{0,40}(died|dead|buried|grave)', 'i').test(txt));
  const flags = {
    mournCarry: /(died|dead|buried|funeral|mourn|since .* died|rest .* soul|gone)/i.test(txt),
    namedMourn: namedAny,
    newPerson: /(you're not|not .* anymore|new face|earn this|who are you|don't know you|mantle)/i.test(txt),
    // identity blend: the third bearer addressed as if they WERE a dead one
    identityLeak: (deadFirsts || []).some(f => new RegExp('\\byou\\b[^.]{0,60}\\b' + f + '\\b', 'i').test(txt) && /remember when/i.test(txt)),
  };
  out.push(`\nCARRY-FLAGS: mourn=${flags.mournCarry} namedMourn=${flags.namedMourn} newPerson=${flags.newPerson} identityLeak=${flags.identityLeak}`);
  return { text: out.join('\n'), flags };
}

const rec = { seed: SEED, notes: [], anomalies: [], convos: [], sayLines: [], mantle1: {}, mantle2: {}, m1: null, m2: null, m3: null };

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r21', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;

  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    if (/🕯️|mantle|You're not|Codex|journal|buried|grave|digging|picks up|syncing|keep writing|died|dead|wake up somebody/i.test(s))
      rec.sayLines.push({ day: dayOf(Game), text: s.slice(0, 300) });
    return _say ? _say.call(this, t) : undefined;
  };

  function killBearer(cause) {
    const oldId = Game.villagerId;
    const oldFirst = firstName(rawName(Game, oldId));
    const oldAbilities = ((Game.state.scholar || {}).abilities || []).map(a => a && (a.id || a)).slice();
    const oldTrust = trustOf(Game, oldId);
    Game.playerDeath(cause);
    const newId = Game.villagerId;
    const newFirst = firstName(rawName(Game, newId));
    const v = Game.state.village || {};
    const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
    const lastLin = lin[lin.length - 1] || {};
    const corpses = (Game.state.corpses || []).filter(c => c && c.villagerId === oldId);
    const packItems = corpses.length ? (corpses[corpses.length - 1].items || []).length : 0;
    const newAbilities = ((Game.state.scholar || {}).abilities || []).map(a => a && (a.id || a)).slice();
    const carriedOver = newAbilities.filter(a => oldAbilities.includes(a));
    const bg = (((Game.state.scholar || {}).backgroundAbilities) || []).map(a => a && (a.name || a.id || a)).filter(Boolean);
    const m = {
      passed: newId !== oldId && !Game.over,
      oldFirst, newFirst, oldAbilities: oldAbilities.length,
      lineageEntry: !!(lastLin.cause && !lastLin.outcome && lastLin.villagerId === oldId),
      corpseFound: corpses.length > 0, deathPackItems: packItems,
      pendingBurials: (v.pendingBurials || []).length,
      newTrust: trustOf(Game, newId), oldTrust,
      successorAbilities: newAbilities.length,
      carriedOverFromOld: carriedOver.length,
      backgroundLegs: bg.slice(0, 8),
    };
    E(`MANTLE-KILL(${cause}): ${oldFirst} -> ${newFirst} | passed=${m.passed} lineage=${m.lineageEntry} corpse=${m.corpseFound} pack=${packItems} newTrust=${m.newTrust} oldTrust=${oldTrust} carriedOver=${carriedOver.length}`);
    return m;
  }

  // ---- phase 1: establish the village ----
  await runDays(Game, competent, { days: KILL1_DAY });
  if (Game.over) { rec.notes.push('village over before kill1 — seed skipped'); console.log(JSON.stringify(rec)); return; }
  E(census(Game, 'pre-death-1'));
  const pre1 = { bearerId: Game.villagerId, plants: codexPlants(Game), pop: ((Game.state.village || {}).roster || []).length };
  rec.mantle1 = killBearer('the expedition');
  E(`LINEAGE after death 1:\n${lineageDump(Game)}`);

  // ---- phase 2: bearer 2 lives (to day 26) ----
  for (let i = 0; i < 14 && !Game.over && dayOf(Game) < KILL2_DAY; i++) await runDays(Game, competent, { days: 1 });
  if (Game.over) { rec.notes.push('village over before kill2 — seed scored on mantle1 only'); rec.m1 = null; console.log(JSON.stringify(rec)); return; }
  E(census(Game, 'pre-death-2'));
  // the forced death must be the CURRENT bearer; if a natural mantle happened first, note it
  const pre2 = { bearerId: Game.villagerId, bearerFirst: firstName(rawName(Game, Game.villagerId)), plants: codexPlants(Game) };
  if (pre2.bearerId !== undefined) {
    const lin2 = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
    if (lin2.length > 1) rec.anomalies.push(`natural mantle before kill2: lineage length ${lin2.length}`);
  }
  rec.mantle2 = killBearer('the expedition');
  E(`LINEAGE after death 2:\n${lineageDump(Game)}`);

  // ---- conversations with the third bearer ----
  // R21 FIX (2026-10-17): the first r21 pass drove convos ONLY at day 40 —
  // 14 days after kill2, outside the 10-day mantle-memory window (convoTopics.js
  // "the night lingers, then it becomes old news"), so M2 read grief-silence
  // that was the driver's timing, not the village's. Drive one convo at d27
  // (inside the window) plus the d40 set; M2 counts any of them.
  const deadFirstsD27 = [rec.mantle1.oldFirst, rec.mantle2.oldFirst].filter(f => f && f !== 'Someone');
  if (!Game.over) {
    const vd = Game.state.village || {};
    const partner = (vd.roster || []).find(id => id !== Game.villagerId);
    if (partner) rec.convos.push(Object.assign({ day: dayOf(Game), tag: 'third-bearer-fresh' }, driveConvo(Game, partner, 'third-bearer-fresh (day ' + dayOf(Game) + ')', deadFirstsD27)));
  }

  // ---- phase 3: bearer 3 lives (to day 40) ----
  for (let i = 0; i < 14 && !Game.over && dayOf(Game) < END_DAY; i++) await runDays(Game, competent, { days: 1 });
  E(census(Game, 'end (day ~40)'));
  E(`LINEAGE final:\n${lineageDump(Game)}`);

  const deadFirsts = [rec.mantle1.oldFirst, rec.mantle2.oldFirst].filter(f => f && f !== 'Someone');
  E(`DEAD BEARERS: ${deadFirsts.join(' -> ')} -> ${rec.mantle2.newFirst} (current)`);

  if (!Game.over) {
    const v = Game.state.village || {};
    const partners = (v.roster || []).filter(id => id !== Game.villagerId);
    const picks = [partners[0], partners[1], partners[2]].filter(Boolean);
    picks.forEach((vid, i) => {
      rec.convos.push(Object.assign({ day: dayOf(Game), tag: 'third-bearer-' + i }, driveConvo(Game, vid, 'third-bearer-' + i + ' (day ' + dayOf(Game) + ')', deadFirsts)));
    });
  }

  // ---- metrics ----
  const k1 = rec.mantle1.passed && rec.mantle1.lineageEntry && rec.mantle1.corpseFound;
  const k2 = rec.mantle2.passed && rec.mantle2.lineageEntry && rec.mantle2.corpseFound;
  rec.m1 = !!(k1 && k2);
  const senseHits = rec.convos.filter(c => c.flags.namedMourn || c.flags.newPerson).length;
  rec.m2 = senseHits >= 1;
  E(`M2: ${senseHits}/${rec.convos.length} convos carry a dead bearer by name / new-person`);
  const kitOk = (rec.mantle1.carriedOverFromOld || 0) === 0 && (rec.mantle2.carriedOverFromOld || 0) === 0;
  const leaks = rec.convos.filter(c => c.flags.identityLeak).length;
  rec.m3 = !!(kitOk && leaks === 0);
  E(`M3: carriedOver1=${rec.mantle1.carriedOverFromOld} carriedOver2=${rec.mantle2.carriedOverFromOld} identityLeaks=${leaks}`);
  E(`M1: mantle1=${k1} mantle2=${k2}`);

  for (const c of rec.convos) { E('\n' + c.text + '\n'); }
  E('\n--- SAY LINES (mantle-relevant) ---');
  for (const s of rec.sayLines) E(`d${s.day}: ${s.text}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
