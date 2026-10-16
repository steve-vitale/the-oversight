#!/usr/bin/env node
// diag-crisis-healerarc-20261016.js — CRISIS LEG r18: the healer arc.
// Does the village rally around the sick? Tests the full care ladder:
// villagerCareTick (medics tend the sick), villagerDiagnosisTick (a medic
// names YOUR sickness), villagerTreatTick (a medic eases you unasked),
// diagnosis-gated cure tiers, tendVillager (the player's care act).
// Method: oracleV2 establish 15d -> stage gut-rot on 5 adults at d15
// (v.sick entries; every downstream machine real) -> run to d55 or
// collapse (+10d tail). Call-through instrumentation throughout.
// Usage: SEED=121 node scripts/diag-crisis-healerarc-20261016.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '121', 10);
const ESTABLISH = 15, OUTBREAK_DAY = 15, END_DAY = 55;

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
function occupationOf(Game, vid) {
  try { const p = Game.getPerson(vid); return String((p && p.formerOccupation) || ''); } catch (e) { return ''; }
}

const rec = { seed: SEED, staged: [], tends: [], diagnoses: [], cures: [],
  eases: 0, playerActs: { tendVillager: 0, treatVillager: 0, treatDisease: 0, folkRemedy: 0 },
  recoveries: [], sickDeaths: [], deaths: [], convos: [], dawns: [], notes: [],
  sickPeak: 0, medics: [], carriedCount: 0, careCount: 0 };
const E = (s) => console.error(s);

const CARE_RE = /tend|sits with|sat with|care|caring|nurse|medic|doctor|heal|tea\b|boil|diagnos|fever|recover|mend|remedy|triage|herbal|doctor's orders|on the mend|sick/i;
const OUTBREAK_RE = /hunger|hungry|starv|food|eat\b|sick|ill|fever|worse|disease|gut|dead|died|gone|grief|mourn|buri|funeral|moot/i;

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
    if (!pick) pick = choices.find(c => /sick|ill|fever|tend|care|heal|tea|medic|doctor|diagnos|recover|mend|tired|worse|disease|gut|hunger|hungry|starv|food|eat|dead|died|gone|grief|mourn|buri|funeral|scared|afraid/i.test(c.text || ''));
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
  const text = fullText.join('\n');
  const carried = OUTBREAK_RE.test(text);
  const care = CARE_RE.test(text);
  out.push('\n### FULL TRANSCRIPT');
  out.push(...fullText);
  return { vid, name: firstName(rawName(Game, vid)), tag, latelyKind, carried, care, lines: out };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-healerarc', fullTelemetry: true });
  await setupGame(Game);

  // ---- instrumentation: all call-through ----
  const _remember = Game.remember;
  Game.remember = function (who, key, text) {
    if (key === 'tended') {
      rec.tends.push({ day: dayOf(Game), medic: firstName(rawName(Game, who)), detail: String(text).slice(0, 80) });
      E(`[TEND] d${dayOf(Game)} ${firstName(rawName(Game, who))}: ${String(text).slice(0, 80)}`);
    }
    if (key === 'cured') {
      rec.cures.push({ day: dayOf(Game), target: firstName(rawName(Game, who)), via: 'treatVillager(remember)' });
      E(`[CURE] d${dayOf(Game)} ${firstName(rawName(Game, who))} cured (treatVillager remember: ${String(text).slice(0, 80)})`);
    }
    return _remember ? _remember.call(this, who, key, text) : undefined;
  };
  const _diag = Game.diagnoseDisease;
  Game.diagnoseDisease = function (target, id, opts) {
    rec.diagnoses.push({ day: dayOf(Game), target: String(target), id: String(id), by: (opts && opts.by) || '?' });
    E(`[DIAGNOSIS] d${dayOf(Game)} ${String(id)} on ${String(target)} (by ${((opts && opts.by) || '?')})`);
    return _diag ? _diag.call(this, target, id, opts) : undefined;
  };
  const _cure = Game.cureStatus;
  Game.cureStatus = function (target, id, via) {
    rec.cures.push({ day: dayOf(Game), target: String(target), id: String(id), via: String(via) });
    E(`[CURE] d${dayOf(Game)} ${String(id)} cured on ${String(target)} via ${String(via)}`);
    return _cure ? _cure.call(this, target, id, via) : undefined;
  };
  const _ease = Game.easeDisease;
  Game.easeDisease = function (target, id, parts, why) {
    rec.eases++;
    return _ease ? _ease.call(this, target, id, parts, why) : undefined;
  };
  for (const fn of ['tendVillager', 'treatVillager', 'treatDisease', 'folkRemedy']) {
    const orig = Game[fn];
    Game[fn] = function (...args) {
      rec.playerActs[fn]++;
      if (fn === 'tendVillager' || fn === 'treatVillager') E(`[PLAYER-${fn.toUpperCase()}] d${dayOf(Game)} on ${firstName(rawName(Game, args[0]))}${args[1] ? ' (' + args[1] + ')' : ''}`);
      return orig ? orig.apply(this, args) : undefined;
    };
  }

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  rec.notes.push(`established d${dayOf(Game)} pop=${livingRoster(Game).length}`);
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length}`);
  // record medical occupations present
  rec.medics = livingRoster(Game).filter(id => /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i.test(occupationOf(Game, id)))
    .map(id => `${firstName(rawName(Game, id))}(${occupationOf(Game, id)})`);
  E(`[MEDICS] ${rec.medics.join(', ') || 'NONE'}`);
  rec.notes.push('medics at outbreak: ' + (rec.medics.join(', ') || 'none'));

  // ---- phase 2: the outbreak at d15 ----
  while (dayOf(Game) < OUTBREAK_DAY && !Game.over) await runDays(Game, oracleV2, { days: 1 });
  const adults = livingRoster(Game).filter(id => isAdult(Game, id) && id !== Game.villagerId);
  const staged = adults.slice(0, 5);
  const v = Game.state.village;
  v.sick = v.sick || {};
  for (const id of staged) {
    v.sick[id] = { name: 'gut rot', daysLeft: 14, severity: 3 };
    rec.staged.push({ who: firstName(rawName(Game, id)) });
  }
  rec.notes.push(`staged gut-rot outbreak on ${staged.length} adults at d${dayOf(Game)}; downstream fully real`);
  E(`[OUTBREAK] d${dayOf(Game)} staged on ${staged.map(id => firstName(rawName(Game, id))).join(', ')}`);

  if (Game.over) {
    rec.earlyEnd = { day: dayOf(Game), villageLost: !!((Game.state || {}).villageLost) };
    E(`[EARLY-END] game over at d${dayOf(Game)} — recorded, finishing`);
    console.log(JSON.stringify(rec)); return;
  }

  // ---- phase 3: run to d55 (death-aware, +10d tail) ----
  let prevSick = new Set(Object.keys(v.sick || {}));
  const sampleDawn = () => {
    const pop = livingRoster(Game);
    const sickNow = pop.filter(id => isSick(Game, id));
    if (sickNow.length > rec.sickPeak) rec.sickPeak = sickNow.length;
    // player-side examine diagnoses villagers via rec.diagnosed (no diagnoseDisease call) — catch them here
    for (const id of Object.keys((Game.state.village || {}).sick || {})) {
      const r = (Game.state.village.sick || {})[id];
      if (r && r.diagnosed && !rec.diagnoses.some(x => x.target === String(id) && x.via === 'examine')) {
        rec.diagnoses.push({ day: dayOf(Game), target: String(id), id: String(r.diagnosed), by: 'you', via: 'examine' });
        E(`[DIAGNOSIS] d${dayOf(Game)} ${String(r.diagnosed)} on ${firstName(rawName(Game, id))} (player examine)`);
      }
    }
    const nowSet = new Set(Object.keys((Game.state.village || {}).sick || {}));
    for (const id of prevSick) {
      if (!nowSet.has(id)) {
        const nm = firstName(rawName(Game, id));
        let dead = false;
        try { const vp = Game.vpOf(id); dead = !!(vp && vp.dead); } catch (e) {}
        if (dead) {
          const fallen = ((Game.state.village || {}).fallen || []);
          const f = fallen.find(x => x.villagerId === id)
            || fallen.find(x => firstName(String(x.name || '')).toLowerCase() === nm.toLowerCase());
          const cause = (f && f.cause) || '?';
          if (/sick|gut|disease|fever/i.test(cause)) rec.sickDeaths.push({ who: nm, day: dayOf(Game), cause });
        } else {
          rec.recoveries.push({ who: nm, day: dayOf(Game) });
          E(`[RECOVERY] d${dayOf(Game)} ${nm} recovered`);
        }
      }
    }
    prevSick = nowSet;
    const d = { day: dayOf(Game), pop: pop.length, sick: sickNow.length };
    rec.dawns.push(d);
    E(`[DAWN] d${d.day} pop=${d.pop} sick=${d.sick} tends=${rec.tends.length} diag=${rec.diagnoses.length} cures=${rec.cures.length} eases=${rec.eases}`);
  };
  let collapsed = false, tail = 0, midDone = false;
  while (dayOf(Game) < END_DAY && !Game.over) {
    await runDays(Game, oracleV2, { days: 5 });
    if (Game.over) break;
    sampleDawn();
    if (!midDone && dayOf(Game) >= 30 && livingRoster(Game).length >= 4) {
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
  if (Game.over && !rec.earlyEnd) {
    rec.earlyEnd = { day: dayOf(Game), villageLost: !!((Game.state || {}).villageLost) };
    E(`[EARLY-END] game over at d${dayOf(Game)} villageLost=${rec.earlyEnd.villageLost} (mid-phase-3)`);
  }

  // ---- deaths ----
  const fallen = ((Game.state.village || {}).fallen || []);
  rec.deaths = fallen.map(f => ({ day: f.day, name: firstName(f.name || rawName(Game, f.villagerId)), cause: f.cause || '?' }));
  E(`[DEATHS] ${rec.deaths.length}: ${rec.deaths.map(d => `${d.name} d${d.day}(${d.cause})`).join('; ') || 'none'}`);

  // ---- conversations: 2 sick/recovered + 2 healthy ----
  // sick first; fall back to villagers who recovered this run (their care
  // arc is the leg question), then healthy — never pad with empty slots.
  const recoveredIds = livingRoster(Game).filter(id =>
    rec.recoveries.some(r => r.who === firstName(rawName(Game, id))));
  const sickNow = livingRoster(Game).filter(id => isSick(Game, id));
  const others = livingRoster(Game).filter(id => !isSick(Game, id) && id !== Game.villagerId);
  const endTargets = [...sickNow.slice(0, 2),
    ...recoveredIds.filter(id => !sickNow.includes(id)).slice(0, Math.max(0, 2 - sickNow.length))];
  for (const id of endTargets) {
    const c = driveConvo(Game, id, isSick(Game, id) ? 'SICK' : 'RECOVERED', 12);
    rec.convos.push({ ...c, lines: undefined });
    E(c.lines.join('\n'));
  }
  for (const id of others.filter(id => !endTargets.includes(id)).slice(0, 2)) {
    const c = driveConvo(Game, id, 'WELL', 12);
    rec.convos.push({ ...c, lines: undefined });
    E(c.lines.join('\n'));
  }
  rec.carriedCount = rec.convos.filter(c => c.carried).length;
  rec.careCount = rec.convos.filter(c => c.care).length;
  rec.collapsed = collapsed;
  E(`[CARRY] outbreak ${rec.carriedCount}/${rec.convos.length}, care ${rec.careCount}/${rec.convos.length}`);
  E(`[SUMMARY] tends=${rec.tends.length} diagnoses=${rec.diagnoses.length} cures=${rec.cures.length} eases=${rec.eases} recoveries=${rec.recoveries.length} sickDeaths=${rec.sickDeaths.length}`);
  console.log(JSON.stringify(rec));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
