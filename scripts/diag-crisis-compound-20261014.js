#!/usr/bin/env node
// diag-crisis-compound-20261014.js — CRISIS LEG r9: the compound crisis.
// Controlled REAL famine (blight from d20: pantryAdd+stockPantry refused) +
// controlled REAL outbreak (gut-rot staged on 5 adults at d25, every
// downstream machine — sick behavior, dawn ticks, tending, relief, moots,
// conversations — fully real). Run to d55 or collapse (+10d tail, death-aware).
// Question: when famine and outbreak hit TOGETHER, does the village bend like
// people — do conversations carry both crises, do villagers prioritize
// sensibly (tend the sick / keep foraging / call moots), do the two crisis
// systems interact without deadlocking each other?
// Usage: SEED=777 node scripts/diag-crisis-compound-20261014.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '777', 10);
const ESTABLISH = 20, OUTBREAK_DAY = 25, END_DAY = 55;

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
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return 0; }
}

const rec = { seed: SEED, staged: [], crises: [], dawns: [], deaths: [], convos: [], notes: [], sickPeak: 0 };
const E = (s) => console.error(s);

const CRISIS_RE = /hunger|hungry|starv|food|eat\b|sick|ill|fever|tired|tire|worse|disease|gut|tending|tend|heal|water|boil|herb|dead|died|gone|grief|mourn|buri|funeral|moot|cannibal/i;

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))} (sick=${isSick(Game, vid) ? 'yes' : 'no'})`];
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
    if (!pick) pick = choices.find(c => /sick|ill|fever|water|boil|herb|heal|tire|worse|disease|gut|hunger|hungry|starv|food|eat|dead|died|gone|grief|mourn|buri|funeral|scared|afraid|cannibal|meat|desperat/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
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
  let full = [];
  try { const c = Game.convoGet(vid); full = (c && c.transcript) || []; } catch (e) {}
  const fullText = full.map(e => `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  const carried = CRISIS_RE.test(fullText.join('\n'));
  out.push('\n### FULL TRANSCRIPT');
  out.push(...fullText);
  return { vid, name: firstName(rawName(Game, vid)), tag, latelyKind, carried, lines: out };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-compound', fullTelemetry: true });
  await setupGame(Game);

  // instrumentation (all call-through)
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    rec.crises.push({ day: dayOf(Game), kind });
    E(`[CRISIS] d${dayOf(Game)} ${kind}`);
    return _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
  };

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);

  // ---- phase 2: the blight — refuse ALL pantry inflows ----
  let blockedKcal = 0;
  const _pa = Game.pantryAdd;
  Game.pantryAdd = function (item) {
    blockedKcal += (item.kcalEach || 0) * (item.units || 1);
    return false;
  };
  const _sp = Game.stockPantry;
  Game.stockPantry = function (kcal) { blockedKcal += (kcal || 0); return undefined; };
  rec.notes.push('blight: pantryAdd+stockPantry refused from d' + dayOf(Game));

  // ---- phase 3: the outbreak at d25 ----
  while (dayOf(Game) < OUTBREAK_DAY && !Game.over) await runDays(Game, oracleV2, { days: 1 });
  const adults = livingRoster(Game).filter(id => isAdult(Game, id) && id !== Game.villagerId);
  const staged = adults.slice(0, 5);
  const v = Game.state.village;
  v.sick = v.sick || {};
  const popBefore = livingRoster(Game).slice();
  for (const id of staged) {
    v.sick[id] = { name: 'gut rot', daysLeft: 14, severity: 3 };
    rec.staged.push({ who: firstName(rawName(Game, id)) });
  }
  rec.notes.push(`staged gut-rot outbreak on ${staged.length} adults at d${dayOf(Game)}; downstream fully real`);
  E(`[OUTBREAK] d${dayOf(Game)} staged on ${staged.map(id => firstName(rawName(Game, id))).join(', ')}`);

  // ---- phase 4: compound run to d55 (death-aware, +10d tail on collapse) ----
  const sampleDawn = () => {
    const pop = livingRoster(Game);
    const sickNow = pop.filter(id => isSick(Game, id));
    if (sickNow.length > rec.sickPeak) rec.sickPeak = sickNow.length;
    let unburied = 0;
    try {
      const isP = (c) => Game.corpseIsPerson ? Game.corpseIsPerson(c) : (c.kind === 'person' || c.kind === 'villager');
      for (const c of (Game.corpses ? Game.corpses() : [])) if (isP(c) && !c.buried) unburied++;
    } catch (e) {}
    const d = { day: dayOf(Game), pantry: pantryKcal(Game), pop: pop.length, sick: sickNow.length, unburied, blockedKcal };
    rec.dawns.push(d);
    E(`[DAWN] d${d.day} pantry=${d.pantry} pop=${d.pop} sick=${d.sick} unburied=${d.unburied}`);
  };
  let collapsed = false, tail = 0, midDone = false;
  while (dayOf(Game) < END_DAY && !Game.over) {
    await runDays(Game, oracleV2, { days: 5 });
    if (Game.over) break;
    sampleDawn();
    // mid-crisis conversation checkpoint: the crisis is raging and the
    // village is still alive — this is when talk should carry both crises.
    if (!midDone && dayOf(Game) >= 35 && livingRoster(Game).length >= 4) {
      midDone = true;
      const sickM = livingRoster(Game).filter(id => isSick(Game, id));
      const healM = livingRoster(Game).filter(id => !isSick(Game, id) && id !== Game.villagerId);
      for (const id of [...sickM.slice(0, 1), ...healM.slice(0, 1)]) {
        const c = driveConvo(Game, id, 'MID', 12);
        rec.convos.push({ ...c, lines: undefined });
        E(c.lines.join('\n'));
      }
    }
    if (livingRoster(Game).length <= 2) { collapsed = true; tail++; if (tail >= 2) break; }
  }

  // ---- deaths ----
  const popAfter = new Set(livingRoster(Game));
  const fallen = ((Game.state.village || {}).fallen || []);
  rec.deaths = fallen.map(f => ({ day: f.day, name: firstName(f.name || rawName(Game, f.villagerId)), cause: f.cause || '?' }));
  E(`[DEATHS] ${rec.deaths.length}: ${rec.deaths.map(d => `${d.name} d${d.day}(${d.cause})`).join('; ') || 'none'}`);

  // ---- conversations: 2 sick + 2 healthy ----
  const sickNow = livingRoster(Game).filter(id => isSick(Game, id));
  const healthy = livingRoster(Game).filter(id => !isSick(Game, id) && id !== Game.villagerId);
  for (const id of sickNow.slice(0, 2)) {
    const c = driveConvo(Game, id, 'SICK', 12);
    rec.convos.push({ ...c, lines: undefined });
    E(c.lines.join('\n'));
  }
  for (const id of healthy.slice(0, 2)) {
    const c = driveConvo(Game, id, 'HEALTHY', 12);
    rec.convos.push({ ...c, lines: undefined });
    E(c.lines.join('\n'));
  }
  // keep one full transcript in the record for the evidence file
  if (rec.convos.length) {
    const keep = rec.convos[0];
    // re-drive? no — just note carried flags; transcripts live in the .log
  }
  rec.carriedCount = rec.convos.filter(c => c.carried).length;
  rec.collapsed = collapsed;
  E(`[CARRY] ${rec.carriedCount}/${rec.convos.length} convos carried a crisis topic`);
  console.log(JSON.stringify(rec));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
