#!/usr/bin/env node
// journey-succession-r12-20261014.js — SUCCESSION LEG (7) r12: "who are you now?"
//
// Pre-registered question (evidence/2026-10-14/journey-succession-r12.md):
// the new bearer's first hours — does the handoff introduce the new person,
// and does everything that should carry over actually carry over?
//
// CONTINUITY (binding, must be all-green):
//   C1: s.abilities (System slots) id+level identical pre/post death
//   C2: integrationStage() identical
//   C3: state.leadership deep-equal
//   C4: codexBreadth() identical
//   C5: s.backgroundAbilities rebuilt for the NEW occupation (granted list
//       match, background:true) — regression of the break-it r6 zero-legs bug
//   C6: successor excluded from npcIds() (roster still contains them, as at
//       game start — consistency check, documents the invariant)
// ORIENTATION (findings, documented):
//   O1: any say line introducing the successor's background/occupation/past
//   O2: raw handoff transcript read (death -> transfer -> newLife)
//   O3: phantom identity — old name used for the player post-death
// PEOPLE: one full conversation as the new bearer with a high-trust villager
//   — does the NPC treat the new face as someone who must earn it?
//
// Usage: SEEDS=611,612,613,615 node scripts/journey-succession-r12-20261014.js
// Output: one JSON line per seed to stdout; detail to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '16', 10);
const DAYS2 = parseInt(process.env.DAYS2 || '3', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '611,612,613,615';
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

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r12', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, checks: [], handoff: [], convo: [] };
  const check = (id, ok, detail) => rec.checks.push({ id, ok: !!ok, detail: detail || '' });

  await runDays(Game, competent, { days: DAYS1 });
  if (Game.over) { check('survived-to-death', false, 'village died before day 16'); return rec; }
  check('survived-to-death', true, `day ${(Game.state.scholar || {}).day}`);
  const oldId = Game.villagerId, oldChar = charOf(Game, oldId);
  const oldName = rawName(Game, oldId), oldFirst = oldName.split(' ')[0];
  const oldOccId = oldChar.occupationId || '(none)';

  // --- PRE snapshots ---
  const preAb = abSig(Game);
  let preStage = -1; try { preStage = Game.integrationStage(); } catch (e) {}
  let preLead = null; try { preLead = JSON.stringify(Game.leadership()); } catch (e) {}
  let preBreadth = -1; try { preBreadth = Game.codexBreadth(); } catch (e) {}
  const preBg = (((Game.state.scholar || {}).backgroundAbilities) || []).map(a => a.id).sort().join(',');

  // --- THE MANTLE PASSES ---
  const sayMark = says.length;
  Game.playerDeath('a hushwolf');
  const newId = Game.villagerId, newChar = charOf(Game, newId);
  const newName = rawName(Game, newId), newFirst = newName.split(' ')[0];
  rec.death = { day: (Game.state.scholar || {}).day, oldBearer: oldName, newBearer: newName, over: !!Game.over };
  check('mantle-passes', !Game.over && newId !== oldId, `${oldName} -> ${newName}`);
  if (Game.over) return rec;

  // --- C1-C4 continuity ---
  check('C1-abilities-carry', abSig(Game) === preAb,
    `slots pre=[${preAb}] post=[${abSig(Game)}]`);
  let postStage = -2; try { postStage = Game.integrationStage(); } catch (e) {}
  check('C2-integration-carry', postStage === preStage, `stage pre=${preStage} post=${postStage}`);
  let postLead = null; try { postLead = JSON.stringify(Game.leadership()); } catch (e) {}
  check('C3-leadership-carry', postLead === preLead, `vector equal=${postLead === preLead}`);
  let postBreadth = -2; try { postBreadth = Game.codexBreadth(); } catch (e) {}
  check('C4-codex-carry', postBreadth === preBreadth, `breadth pre=${preBreadth} post=${postBreadth}`);

  // --- C5: new body's own background legs ---
  const wantBg = occGranted(Game, newChar).slice().sort().join(',');
  const gotBg = (((Game.state.scholar || {}).backgroundAbilities) || []).map(a => a.id).sort().join(',');
  const bgFlags = (((Game.state.scholar || {}).backgroundAbilities) || []).every(a => a.background === true);
  check('C5-background-legs', gotBg === wantBg && (wantBg === '' || bgFlags),
    `occ=${newChar.occupationId || '(none)'} want=[${wantBg}] got=[${gotBg}] oldOcc=${oldOccId} oldBg=[${preBg}]`);

  // --- C6: npcIds excludes the new bearer (roster invariant) ---
  let npc = []; try { npc = Game.npcIds(); } catch (e) {}
  const inRoster = ((Game.state.village || {}).roster || []).includes(newId);
  check('C6-npc-exclusion', !npc.includes(newId) && inRoster,
    `npcIds excludes new bearer=${!npc.includes(newId)}; roster still contains=${inRoster} (matches game-start invariant)`);

  // --- tail: 3 days as the successor ---
  for (let d = 0; d < DAYS2; d++) await runDays(Game, competent, { days: 1 });
  const postDeath = says.slice(sayMark);
  rec.handoff = postDeath.filter(t => /🕯️|🌅|📖|MANTLE|mantle|not .*\.|Codex|pick up|wake|awaken/i).slice(0, 14);

  // --- O1: is the new person introduced? ---
  const occWord = (newChar.occupationId || '').replace(/_/g, ' ');
  const introLines = postDeath.filter(t => {
    const tl = t.toLowerCase();
    return tl.includes(newFirst.toLowerCase()) &&
      (tl.includes(occWord && occWord.split(' ')[0] ? occWord.split(' ')[0] : 'zzz-no-match') ||
       /was a |used to be|back when|before the|their hands|occupation|past/i.test(t));
  });
  check('O1-intro-finding', true, // finding, not pass/fail
    `${introLines.length} intro-ish lines name ${newFirst}; sample: ${JSON.stringify(introLines.slice(0, 2))}`);

  // --- O3: phantom identity — old name used FOR the player after transfer ---
  const oldNameHits = postDeath.filter(t => t.includes(oldFirst));
  const phantom = oldNameHits.filter(t =>
    /you are |^you |as you |your hands|you wake|you feel|you pick/i.test(t.replace(oldFirst, 'OLD')));
  check('O3-phantom-finding', true,
    `${oldNameHits.length} post-death lines mention "${oldFirst}"; ${phantom.length} look player-addressed`);

  // --- PEOPLE CHECK: full conversation as the new bearer ---
  const trust = (Game.state.village || {}).trust || {};
  const roster2 = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  const talked = roster2.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0))[0];
  if (talked) {
    const out = [`## seed ${seed}: successor [${newName}] talks to ${rawName(Game, talked)} (trust ${(trust[talked] || 0)})`];
    try {
      Game.startConvo(talked);
      for (let t = 0; t < 14; t++) {
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
      for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    } catch (e) { out.push('(convo threw: ' + e.message + ')'); }
    rec.convo.push(out.join('\n'));
  }
  return rec;
}

(async () => {
  const seeds = parseSeeds();
  for (const seed of seeds) {
    try {
      const rec = await playSeed(seed);
      console.log(JSON.stringify({ seed, checks: rec.checks.map(c => [c.id, c.ok, c.detail]) }));
      console.error('=== SEED ' + seed + ' ===');
      console.error('death: ' + JSON.stringify(rec.death));
      console.error('--- handoff lines ---');
      for (const t of rec.handoff) console.error(t);
      console.error('--- conversation ---');
      for (const t of (rec.convo || [])) console.error(t + '\n');
    } catch (e) {
      console.log(JSON.stringify({ seed, error: String(e && e.message || e) }));
      console.error('SEED ' + seed + ' THREW: ' + (e && e.stack || e));
    }
  }
})();
