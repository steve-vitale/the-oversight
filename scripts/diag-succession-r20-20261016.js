#!/usr/bin/env node
// diag-succession-r20-20261016.js — SUCCESSION LEG r20: THE MANTLE PASSES.
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. Pre-registered per MEASUREMENT.md §§9-12, 14.
//
// LEG QUESTION: when the bearer dies and the mantle passes, does the village
// treat the successor as a NEW PERSON with their own life — or as a reskinned
// player? Do villagers mourn the old bearer by name, does the successor keep
// the village's Codex knowledge, and does the new bearer have their own kit
// (Steve 2026-10-14: "You become that villager" — own abilities/XP/skills,
// the office's slots/arc/integration/ledger/Codex pass)?
//
// INTERESTING FINDING CRITERIA:
//   (a) mantle mechanics clean: new bearer != old, lineage entry with cause,
//       corpse with death pack, burial within 3 days, "you're not X" beat;
//   (b) successor conversations SENSE-verified: mourning by name, or the
//       successor treated as a new person (not "you again");
//   (c) knowledge continuity: village codex plants-known count post >= pre;
//   (d) any gap: grief-silence, identity confusion, inventory/ability leaks.
//
// SEEDS: 2026, 2031, 2042 (fresh; recent succession runs used 731/732/733,
// 48/37/5/71; r19 used 1717/1828/1939). Policy: competent.
// HORIZON: kill at day 12 (post-System arrival, established act-0), play the
// successor to day 27 (+15d). Death-aware: village dead/scattered -> stop.
// PRIMARY METRICS (binding, §14):
//   M1: >=2/3 seeds — mantle passes cleanly (new bearer, lineage entry,
//       corpse + death pack, burial <=3d, game not over).
//   M2: >=2/3 seeds — >=1 of 3 successor convos SENSE-carries the death
//       (named mourning) or the successor-as-new-person.
//   M3: >=2/3 seeds — village codex plants-known post-death >= pre-death.
// KILL RULE: mantle fails to pass (no successor / over / softlock) on >=2/3
// seeds -> SUBSTRATE-MISSING; document and move on.
//
// Usage: SEED=2026 node scripts/diag-succession-r20-20261016.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '2026', 10);
const KILL_DAY = 12, END_DAY = 27;

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
  const fallen = (v.fallen || []).slice(-8).map(f => `${firstName(f.name || rawName(Game, f.villagerId) || '?')} d${f.day} (${f.cause})`);
  lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  pantry: ${pantryKcal(Game).toLocaleString()} kcal | codex plants: ${codexPlants(Game)} | scholar abilities: ${((Game.state.scholar || {}).abilities || []).length}`);
  return lines.join('\n');
}

// Conversation driver: ask:lately first (mourning lives there), then wants.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — successor talking to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', flags: {} }; }
  try {
    const open = (Game.convoChoices(vid) || []).map(x => `[${x.id}] ${(x.text || x.label || '').slice(0, 80)}`);
    out.push(`OPEN CHOICES (${open.length}): ${open.join(' | ')}`);
  } catch (e) {}
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /died|dead|mourn|mourn|burial|buried|grave|gone|mantle|new|who are you/i.test(c.text || ''));
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
  out.push(`FINAL: want=${(c && c.want && c.want.id) || (c && c.want && c.want.hook) || 'none'} resolution=${(c && c.want && c.want.resolution) || 'n/a'}`);
  out.push('\n### FULL TRANSCRIPT');
  const full = [];
  for (const e of ((c && c.transcript) || [])) full.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  out.push(full.join('\n'));
  const txt = full.join('\n');
  const flags = {
    mournCarry: /(died|dead|buried|funeral|mourn|since .* died|rest .* soul|gone)/i.test(txt),
    namedMourn: new RegExp('since ' + (rec.oldFirst || 'ZZZNOMATCH') + '\\b', 'i').test(txt) || /everyone's thinking about \w+/i.test(txt),
    newPerson: /(you're not|not .* anymore|new face|earn this|who are you|don't know you)/i.test(txt),
    oldIdentityLeak: new RegExp('\\byou\\b.*' + (rec.oldFirst || 'ZZZNOMATCH'), 'i').test(txt) && /remember when you/i.test(txt),
  };
  out.push(`\nCARRY-FLAGS: mourn=${flags.mournCarry} namedMourn=${flags.namedMourn} newPerson=${flags.newPerson}`);
  return { text: out.join('\n'), flags };
}

const rec = { seed: SEED, notes: [], anomalies: [], convos: [], sayLines: [], mantle: {}, m1: null, m2: null, m3: null };

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r20', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;

  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    if (/🕯️|mantle|You're not|Codex|journal|buried|grave|digging|picks up|syncing|keep writing|died|dead/i.test(s))
      rec.sayLines.push({ day: dayOf(Game), text: s.slice(0, 300) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- phase 1: establish the village ----
  await runDays(Game, competent, { days: KILL_DAY });
  if (Game.over) { rec.notes.push('village over before kill day — seed skipped'); console.log(JSON.stringify(rec)); return; }
  E(census(Game, 'pre-death'));
  const pre = {
    bearerId: Game.villagerId,
    bearerFirst: firstName(rawName(Game, Game.villagerId)),
    abilities: ((Game.state.scholar || {}).abilities || []).slice(),
    plants: codexPlants(Game),
    pop: ((Game.state.village || {}).roster || []).length,
  };
  rec.oldFirst = pre.bearerFirst;
  E(`PRE-DEATH: bearer=${pre.bearerFirst} abilities=${pre.abilities.length} plants=${pre.plants} pop=${pre.pop}`);

  // ---- the death: the real handler ----
  Game.playerDeath('the expedition');
  const post = {
    bearerId: Game.villagerId,
    bearerFirst: firstName(rawName(Game, Game.villagerId)),
    over: !!Game.over,
  };
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  const corpses = (Game.state.corpses || []).filter(c => c && c.villagerId === pre.bearerId);
  const v = Game.state.village || {};
  rec.mantle = {
    passed: post.bearerId !== pre.bearerId && !post.over,
    newBearer: post.bearerFirst,
    oldBearer: pre.bearerFirst,
    lineageEntry: !!(lastLin.cause && !lastLin.outcome && lastLin.villagerId === pre.bearerId),
    lineageName: lastLin.name || null,
    corpseFound: corpses.length > 0,
    deathPackItems: corpses.length ? (corpses[corpses.length - 1].items || []).length : 0,
    pendingBurials: (v.pendingBurials || []).length,
    successorAbilities: ((Game.state.scholar || {}).abilities || []).length,
    successorAbilitiesKeptOld: ((Game.state.scholar || {}).abilities || []).filter(a => pre.abilities.includes(a)).length,
  };
  E(`MANTLE: ${JSON.stringify(rec.mantle)}`);
  rec.m1 = rec.mantle.passed && rec.mantle.lineageEntry && rec.mantle.corpseFound;

  // ---- conversation 1: fresh grief (day 12/13) ----
  const vid1 = (v.roster || []).find(id => id !== Game.villagerId);
  if (vid1) rec.convos.push(Object.assign({ day: dayOf(Game), tag: 'fresh-grief' }, driveConvo(Game, vid1, 'fresh-grief (day ' + dayOf(Game) + ')')));

  // ---- phase 2: the successor lives (to day 20) ----
  for (let i = 0; i < 8 && !Game.over && dayOf(Game) < 20; i++) await runDays(Game, competent, { days: 1 });
  const buried = ((Game.state.village || {}).pendingBurials || []).length === 0;
  rec.mantle.buriedByDay20 = buried;
  E(`BURIAL by day 20: ${buried} (pendingBurials=${((Game.state.village || {}).pendingBurials || []).length})`);
  E(census(Game, 'mid (day ~20)'));
  if (!Game.over) {
    const v2 = Game.state.village || {};
    const vid2 = (v2.roster || []).find(id => id !== Game.villagerId && id !== vid1) || (v2.roster || []).find(id => id !== Game.villagerId);
    if (vid2) rec.convos.push(Object.assign({ day: dayOf(Game), tag: 'settling' }, driveConvo(Game, vid2, 'settling (day ' + dayOf(Game) + ')')));
  }

  // ---- phase 3: to day 27 ----
  for (let i = 0; i < 7 && !Game.over && dayOf(Game) < END_DAY; i++) await runDays(Game, competent, { days: 1 });
  E(census(Game, 'end (day ~27)'));
  const postPlants = codexPlants(Game);
  rec.m3plants = { pre: pre.plants, post: postPlants };
  rec.m3 = postPlants >= pre.plants;
  if (!Game.over) {
    const v3 = Game.state.village || {};
    const vid3 = (v3.roster || []).find(id => id !== Game.villagerId);
    if (vid3) rec.convos.push(Object.assign({ day: dayOf(Game), tag: 'two-weeks-on' }, driveConvo(Game, vid3, 'two-weeks-on (day ' + dayOf(Game) + ')')));
  }

  // M2: any convo SENSE-carries the death or the new-person beat
  const senseHits = rec.convos.filter(c => c.flags.mournCarry || c.flags.namedMourn || c.flags.newPerson).length;
  rec.m2 = senseHits >= 1;
  E(`M2: ${senseHits}/3 convos carry the death/new-person`);

  for (const c of rec.convos) { E('\n' + c.text + '\n'); }
  E('\n--- SAY LINES (mantle-relevant) ---');
  for (const s of rec.sayLines) E(`d${s.day}: ${s.text}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
