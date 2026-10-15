#!/usr/bin/env node
// journey-succession-r13-20261015.js — SUCCESSION LEG (7) r13: "the chain of faces"
//
// Pre-registered question (run note 2026-10-15): does the succession arc stay
// coherent across TWO deaths in one run? r12 proved single-transfer continuity
// + the orientation beat green. r13 pushes the chain: two forced deaths,
// grief that names the right dead, threads/favors honestly attributed to the
// right bearer, and a successor who steps into a village that remembers both.
//
// BINDING (§14 metric-binding):
//   CHAIN1-d1/d2: continuity invariants on BOTH transfers (slots id+level,
//       integrationStage, leadership deep-equal, codexBreadth, background
//       legs rebuilt for the NEW occupation, npcIds excludes new bearer)
//   CHAIN2-d1/d2: the "you're not X" beat names the IMMEDIATE predecessor
//       (the just-dead bearer), not an earlier face — when a closeId exists
//   CHAIN3: v.mantleOf has 2 entries after death 2, ordered death1 then death2
//   CHAIN4: successor-2 office trust in [10,100] (floor 10 holds across chains)
//   CHAIN5: promise release on death 2 — every open promise (not kept) is
//       'released' + inherited, its favor back to 'asked'
// FINDINGS (documented, not gated):
//   F-GRIEF: grief beats in the feed on both deaths; npcMood 'grieving' count
//       within 3 days; sense-read
//   F-REASK: if an open promise existed at a death, did the NPC re-ask the
//       successor within the run naming the predecessor?
//   F-THREAD: inheritedName() attribution — does the highest-trust NPC's
//       conversation name the right predecessor for pre-death threads?
//   F-PEOPLE: one full conversation as successor 2 — does the NPC treat the
//       new face as someone who must earn it? Full transcript, sense-read.
//   F-CENSUS: plain-words census for the run note.
//
// Usage: SEEDS=711,712,713 node scripts/journey-succession-r13-20261015.js
// Output: JSON checks per seed to stdout; detail (handoff, grief, convo) to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '14', 10);
const GAP = parseInt(process.env.GAP || '8', 10);
const TAIL = parseInt(process.env.TAIL || '6', 10);

function parseSeeds() {
  const s = process.env.SEEDS || '711,712,713';
  const out = [];
  for (const part of s.split(',')) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (/^\d+$/.test(part)) out.push(+part);
  }
  return out;
}
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function charOf(Game, vid) {
  try { return (Game.data.villagers || []).find(x => x.id === vid) || {}; } catch (e) { return {}; }
}
function occGranted(Game, char) {
  try {
    const occ = (((Game.data.characterGen || {}).occupations) || []).find(o => o.id === char.occupationId) || {};
    return (occ.granted || []).filter(id => (Game.data.abilities || []).find(a => a.id === id));
  } catch (e) { return []; }
}
function abSig(Game) {
  return ((Game.state.scholar || {}).abilities || []).map(a => (a.id || a) + '@' + (a.level || 1)).sort().join(',');
}
function snapshot(Game) {
  let stage = -1; try { stage = Game.integrationStage(); } catch (e) {}
  let lead = null; try { lead = JSON.stringify(Game.leadership()); } catch (e) {}
  let breadth = -1; try { breadth = Game.codexBreadth(); } catch (e) {}
  return { ab: abSig(Game), stage, lead, breadth };
}
function openPromises(Game) {
  const pr = (Game.state.village || {}).promises || {};
  return Object.entries(pr).filter(([, p]) => p && !p.kept && p.kept !== 'released');
}
function moodOf(Game, vid) {
  try { return Game.npcMood(vid); } catch (e) { return '?'; }
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r13', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, checks: [], handoff: [], grief: [], convo: [], census: '' };
  const check = (id, ok, detail) => rec.checks.push({ id, ok: !!ok, detail: detail || '' });

  await runDays(Game, competent, { days: DAYS1 });
  if (Game.over) { check('survived-to-d1', false, 'village died before first death'); return rec; }
  check('survived-to-d1', true, `day ${(Game.state.scholar || {}).day}`);

  const deaths = [];
  for (let dn = 1; dn <= 2; dn++) {
    const oldId = Game.villagerId, oldChar = charOf(Game, oldId);
    const oldName = rawName(Game, oldId), oldFirst = oldName.split(' ')[0];
    const pre = snapshot(Game);
    const prePromises = openPromises(Game).map(([pid, p]) => ({ pid, favorId: p.favorId, what: p.what || '' }));
    const mark = says.length;
    const trustBefore = JSON.parse(JSON.stringify((Game.state.village || {}).trust || {}));
    Game.playerDeath('a hushwolf');
    const newId = Game.villagerId, newChar = charOf(Game, newId);
    const newName = rawName(Game, newId), newFirst = newName.split(' ')[0];
    deaths.push({ day: (Game.state.scholar || {}).day, oldName, oldFirst, newName, newFirst, oldId, newId });
    const post = says.slice(mark);
    check(`mantle-passes-d${dn}`, !Game.over && newId !== oldId, `${oldName} -> ${newName}`);
    if (Game.over) return rec;

    // --- CHAIN1: continuity on this transfer ---
    const pst = snapshot(Game);
    check(`CHAIN1-d${dn}-abilities`, pst.ab === pre.ab, `pre=[${pre.ab.slice(0, 80)}]`);
    check(`CHAIN1-d${dn}-integration`, pst.stage === pre.stage, `pre=${pre.stage} post=${pst.stage}`);
    check(`CHAIN1-d${dn}-leadership`, pst.lead === pre.lead, `equal=${pst.lead === pre.lead}`);
    check(`CHAIN1-d${dn}-codex`, pst.breadth === pre.breadth, `pre=${pre.breadth} post=${pst.breadth}`);
    const wantBg = occGranted(Game, newChar).slice().sort().join(',');
    const gotBg = (((Game.state.scholar || {}).backgroundAbilities) || []).map(a => a.id).sort().join(',');
    const bgFlags = (((Game.state.scholar || {}).backgroundAbilities) || []).every(a => a.background === true);
    check(`CHAIN1-d${dn}-bglegs`, gotBg === wantBg && (wantBg === '' || bgFlags),
      `occ=${newChar.occupationId || '(none)'} want=[${wantBg}] got=[${gotBg}]`);
    let npc = []; try { npc = Game.npcIds(); } catch (e) {}
    const inRoster = ((Game.state.village || {}).roster || []).includes(newId);
    check(`CHAIN1-d${dn}-npc-excl`, !npc.includes(newId) && inRoster, `excl=${!npc.includes(newId)} roster=${inRoster}`);

    // --- CHAIN2: "you're not X" names THIS death's predecessor ---
    const notLine = post.find(t => new RegExp(`You're not ${oldFirst}`).test(t));
    const liveTrust = (Game.state.village || {}).trust || {};
    const liveRoster = new Set((Game.state.village || {}).roster || []);
    const closeExists = Object.keys(trustBefore).some(id => id !== newId && liveRoster.has(id) && (trustBefore[id] || 0) > 55 && liveRoster.has(id));
    if (closeExists) check(`CHAIN2-d${dn}-names-predecessor`, !!notLine,
      notLine ? notLine.slice(0, 120) : `closeId existed but no "You're not ${oldFirst}" line`);
    else check(`CHAIN2-d${dn}-names-predecessor`, true, 'no closeId (trust>55 living) — beat correctly absent (finding)');

    // --- CHAIN4: trust floor holds across the chain ---
    const trust = (Game.state.village || {}).trust || {};
    const t2 = trust[newId];
    check(`CHAIN4-d${dn}-trust-floor`, t2 != null && t2 >= 10 && t2 <= 100, `successor trust=${t2}`);

    // --- CHAIN5: promises released honestly on death 2 ---
    if (prePromises.length) {
      const pr = (Game.state.village || {}).promises || {};
      const released = prePromises.every(x => { const p = pr[x.pid]; return p && p.kept === 'released' && p.inherited; });
      const favors = prePromises.map(x => {
        const fav = ((Game.state.village || {}).favorLedger || {})[x.pid];
        return fav ? fav.state : '(no favor)';
      });
      check(`CHAIN5-d${dn}-promise-release`, released,
        `${prePromises.length} open promise(s); favor states=[${favors.join(',')}]`);
    } else {
      check(`CHAIN5-d${dn}-promise-release`, true, 'no open promises at death (finding)');
    }
    rec[`prePromises_d${dn}`] = prePromises;

    // --- F-GRIEF: beats in the feed + grieving moods ---
    const griefBeats = post.filter(t => /🕯️|🪞|grave|mourns|mourn|grief|gone\b|starts digging|buried|funeral/i).slice(0, 10);
    rec.grief.push(`## seed ${seed} death ${dn} (${oldName} -> ${newName}):`);
    for (const b of griefBeats) rec.grief.push('  ' + b.slice(0, 200));

    // handoff capture for the note
    rec.handoff.push(`### death ${dn}: ${oldName} -> ${newName}`);
    for (const t of post.filter(t => /🕯️|🌅|📖|MANTLE|mantle|pick up|wake|awaken|grave|speak for/i).slice(0, 16)) rec.handoff.push('  ' + t.slice(0, 200));

    // play the gap as the successor
    for (let d = 0; d < (dn === 1 ? GAP : TAIL); d++) await runDays(Game, competent, { days: 1 });
    if (Game.over) { check(`survived-past-d${dn}`, false, 'village died after death'); return rec; }
    check(`survived-past-d${dn}`, true, `day ${(Game.state.scholar || {}).day}`);

    // grieving mood sweep ~3 days after each death (re-run right after gap days)
    const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
    const grieving = roster.filter(id => moodOf(Game, id) === 'grieving');
    rec.grief.push(`  moods +~${dn === 1 ? GAP : TAIL}d post-death: grieving=${grieving.length}/${roster.length}${grieving.length ? ' [' + grieving.map(id => rawName(Game, id).split(' ')[0]).join(',') + ']' : ''}`);
  }

  // --- CHAIN3: mantleOf chain ---
  try {
    const mo = (Game.state.village || {}).mantleOf || [];
    const ok = mo.length === 2 &&
      mo[0].fromName === deaths[0].oldName && mo[0].toName === deaths[0].newName &&
      mo[1].fromName === deaths[1].oldName && mo[1].toName === deaths[1].newName;
    check('CHAIN3-mantle-chain', ok, JSON.stringify(mo.map(m => `${m.fromName || '?'} -> ${m.toName || '?'}`)));
  } catch (e) { check('CHAIN3-mantle-chain', false, 'threw: ' + e.message); }

  // --- F-THREAD: inherited attribution — open threads/seeds from before death 2 ---
  try {
    const mo = (Game.state.village || {}).mantleOf || [];
    const last = mo[mo.length - 1] || {};
    const stamped = [];
    for (const fid of Object.keys((Game.state.village || {}).favorLedger || {})) {
      const fb = (Game.state.village || {}).favorLedger[fid];
      if (fb && fb.inhFrom) stamped.push({ what: 'favor', inhFrom: fb.inhFrom, state: fb.state });
    }
    for (const sid of Object.keys((Game.state.village || {}).convoSeeds || {})) {
      const sd = (Game.state.village || {}).convoSeeds[sid];
      if (sd && sd.inh) stamped.push({ what: 'seed', inh: sd.inh, want: sd.wantId || '' });
    }
    rec.thread = { lastHandoff: last, sample: stamped.slice(0, 8) };
    check('F-THREAD-stamps', true, `${stamped.length} stamped records; last handoff ${last.fromName || '?'}->${last.toName || '?'}`);
  } catch (e) { check('F-THREAD-stamps', false, 'threw'); }

  // --- F-REASK: scan convo seeds/threads for a re-ask naming the predecessor ---
  try {
    const preds = deaths.map(d => d.oldFirst);
    const seeds2 = (Game.state.village || {}).convoSeeds || {};
    const reasks = [];
    for (const [pid, sd] of Object.entries(seeds2)) {
      if (!sd) continue;
      const blob = JSON.stringify(sd);
      const namesPred = preds.some(p => new RegExp(p).test(blob));
      if (/repay|asked|favor/i.test(blob) && namesPred) reasks.push({ pid, want: sd.wantId || '', snippet: blob.slice(0, 160) });
    }
    check('F-REASK-finding', true, `${reasks.length} re-ask-ish seeds name a predecessor`);
    rec.reasks = reasks.slice(0, 5);
  } catch (e) { check('F-REASK-finding', true, 'threw: ' + e.message); }

  // --- F-PEOPLE: full conversation as successor 2 with highest-trust villager ---
  const trust = (Game.state.village || {}).trust || {};
  const roster2 = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  const talked = roster2.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0))[0];
  if (talked) {
    const preds = deaths.map(d => d.oldFirst);
    const out = [`## seed ${seed}: successor 2 [${deaths[1].newName}] talks to ${rawName(Game, talked)} (trust ${(trust[talked] || 0)}; predecessors: ${preds.join(', ')})`];
    try {
      Game.startConvo(talked);
      for (let t = 0; t < 16; t++) {
        const choices = Game.convoChoices(talked) || [];
        if (!choices.length) { out.push('(no choices)'); break; }
        let pick = choices.find(c => !/^(betrayal:|leave|bye|goodbye)/.test(c.id));
        if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
        if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
        out.push(`> YOU [${pick.id}] ${(pick.text || pick.label || '').slice(0, 90)}`);
        try { Game.convoTurn(talked, pick.id); } catch (e) { out.push('(turn threw: ' + e.message + ')'); break; }
        const c = Game.convoGet(talked);
        if (!c || !c.active) { out.push('(ended by engine)'); break; }
      }
      try { Game.endConvo(talked, 'left'); } catch (e) {}
      const c = Game.convoGet(talked);
      out.push('### FULL TRANSCRIPT');
      const full = [];
      for (const e of ((c && c.transcript) || [])) { const line = `${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`; out.push(line); full.push(line); }
      const namesEither = preds.filter(p => full.some(l => new RegExp(`\\b${p}\\b`).test(l)));
      out.push(`### attribution: predecessor names in transcript: ${namesEither.join(',') || '(none)'}`);
    } catch (e) { out.push('(convo threw: ' + e.message + ')'); }
    rec.convo.push(out.join('\n'));
  }

  // --- F-CENSUS ---
  try {
    const v = Game.state.village, s = Game.state.scholar;
    const roster = (v.roster || []);
    const dead = (v.fallen || []).length;
    const aliveNames = roster.slice(0, 12).map(id => rawName(Game, id).split(' ')[0]).join(', ');
    const trusts = roster.map(id => `${rawName(Game, id).split(' ')[0]}:${trust[id] != null ? trust[id] : '?'}`);
    rec.census = `seed ${seed} day ${s.day}: ${roster.length} alive, ${dead} dead this run; bearer <redacted> ${rawName(Game, Game.villagerId)}; trust: ${trusts.slice(0, 8).join(' ')}; alive: ${aliveNames}${roster.length > 12 ? '...' : ''}`;
  } catch (e) { rec.census = 'census threw: ' + e.message; }

  rec.deaths = deaths;
  return rec;
}

(async () => {
  const seeds = parseSeeds();
  for (const seed of seeds) {
    try {
      const rec = await playSeed(seed);
      console.log(JSON.stringify({ seed, checks: rec.checks.map(c => [c.id, c.ok, c.detail]) }));
      console.error('=== SEED ' + seed + ' ===');
      console.error('deaths: ' + JSON.stringify(rec.deaths));
      console.error('--- handoff lines ---');
      for (const t of rec.handoff) console.error(t);
      console.error('--- grief ---');
      for (const t of rec.grief) console.error(t);
      console.error('--- thread stamps ---'); console.error(JSON.stringify(rec.thread));
      console.error('--- reasks ---'); console.error(JSON.stringify(rec.reasks));
      console.error('--- census ---'); console.error(rec.census);
      console.error('--- conversation ---');
      for (const t of (rec.convo || [])) console.error(t + '\n');
    } catch (e) {
      console.log(JSON.stringify({ seed, error: String(e && e.message || e) }));
      console.error('SEED ' + seed + ' THREW: ' + (e && e.stack || e));
    }
  }
})();
