#!/usr/bin/env node
// journey-succession-r11-20261014.js — SUCCESSION LEG (7) r11: "whose word broke?"
//
// Pre-registered question (evidence/2026-10-14/journey-succession-r11.md):
// when the Bearer <redacted> blame stay personal and memory stay communal?
// Three lanes per seed. Old bearer: (A) promiseHelp promise (open),
// (B) favor-commit promise (open, not renounced), (C) favor-commit + renounce.
// Then death. As the successor:
//   F1 (the fix): C's renounced promise_broken memory has maker === oldId;
//       canMakeAmends(C) === false; promiseHelp(C) NOT refused.
//   F2 (design verification): A's and B's open promises are RELEASED at death
//       (kept === 'released', inherited === true); B's favor reverts to
//       'asked' and inheritedName names the predecessor on the re-ask.
// Secondary: mourning names the dead Bearer <redacted> within 3 days (crisis r8
// must not displace grief/mantle beats).
//
// Usage: SEEDS=611-614 node scripts/journey-succession-r11-20261014.js
// Output: one JSON line per seed to stdout; detail to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '16', 10);
const DAYS2 = parseInt(process.env.DAYS2 || '3', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '611-614';
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
function lastMem(Game, vid, t) {
  const mems = (((Game.state.village || {}).memory || {})[vid] || []).filter(m => m && m.t === t);
  return mems[mems.length - 1] || null;
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r11', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, checks: [], convo: [] };
  const check = (id, ok, detail) => rec.checks.push({ id, ok: !!ok, detail: detail || '' });

  await runDays(Game, competent, { days: DAYS1 });
  if (Game.over) { check('survived-to-death', false, 'village died before day 16'); return rec; }
  check('survived-to-death', true, `day ${(Game.state.scholar || {}).day}`);
  const oldId = Game.villagerId, oldName = rawName(Game, oldId), oldFirst = oldName.split(' ')[0];
  const v = Game.state.village;

  const roster = (v.roster || []).filter(id => id !== oldId);
  const clean = roster.filter(id => !lastMem(Game, id, 'promise_broken'));
  // Lane A: promiseHelp — try villagers until one takes a tracked promise.
  let vidA = null;
  for (const id of clean) {
    try { Game.promiseHelp(id); } catch (e) {}
    const open = ((v.promises || {})[id]);
    if (open && !open.kept) { vidA = id; break; }
    delete ((v.promises || {})[id]);
  }
  const vidB = clean.find(id => id !== vidA);
  // Lane C must ALSO have a keep-kind goal (so the successor's promiseHelp
  // is a real refusal test, not a deflection). Trial without keeping state.
  let vidC = null;
  for (const id of clean) {
    if (id === vidA || id === vidB) continue;
    try { Game.promiseHelp(id); } catch (e) {}
    const open = ((v.promises || {})[id]);
    if (open && !open.kept) { vidC = id; delete ((v.promises || {})[id]); break; }
    delete ((v.promises || {})[id]);
  }
  if (!vidA || !vidB || !vidC) { check('picks', false, 'not enough workable villagers'); return rec; }
  const openA = (v.promises || {})[vidA];
  check('laneA-promise', !!(openA && !openA.kept), `A=${rawName(Game, vidA)} maker-at-creation=${(openA && openA.maker) || '(none)'}`);

  // Lane B: real favor path, kept OPEN.
  const favorB = { id: 'fxB-r11-' + seed, vid: vidB, goal: 'heal', task: 'the creek water run', short: 'the creek water run', deadline: 3, state: 'asked' };
  Game.convoStoreFavor(favorB);
  const commitB = Game.convoFavorCommit(vidB, favorB);
  const openB = (v.promises || {})[vidB];
  check('laneB-favor-open', !!(commitB && commitB.ok && openB && !openB.kept),
    `B=${rawName(Game, vidB)} favor state=${(Game.convoGetFavor(vidB) || {}).state}`);

  // Lane C: real favor path, then RENOUNCED by the old bearer.
  const favorC = { id: 'fxC-r11-' + seed, vid: vidC, goal: 'heal', task: 'mending the fence line', short: 'the fence line', deadline: 3, state: 'asked' };
  Game.convoStoreFavor(favorC);
  const commitC = Game.convoFavorCommit(vidC, favorC);
  const renounced = commitC && commitC.ok ? Game.convoFavorRenounce(vidC) : false;
  const brokenMemC = lastMem(Game, vidC, 'promise_broken');
  check('F1-renounce-maker', brokenMemC && brokenMemC.maker === oldId,
    `C=${rawName(Game, vidC)} maker=${(brokenMemC && brokenMemC.maker) || '(none)'} expected=${oldFirst}`);
  check('F1-renounce-trustAtBreak', brokenMemC && typeof brokenMemC.trustAtBreak === 'number',
    `trustAtBreak=${(brokenMemC && brokenMemC.trustAtBreak) == null ? '(none)' : brokenMemC.trustAtBreak}`);
  const lanePreDeath = (() => {
    const lw = Game.lastPromiseWord(vidC);
    return lw.word === 'promise_broken' && (lw.mem == null || lw.mem.maker == null || lw.mem.maker === Game.villagerId);
  })();
  check('F1-amends-before-death', lanePreDeath === true,
    `broken-word lane pre-death=${lanePreDeath} (it IS the old bearer's word)`);

  // --- THE MANTLE PASSES ---
  const sayMark = says.length;
  Game.playerDeath('a hushwolf');
  const newId = Game.villagerId, newName = rawName(Game, newId), newFirst = newName.split(' ')[0];
  rec.death = { day: (Game.state.scholar || {}).day, oldBearer: oldName, newBearer: newName, over: !!Game.over };
  check('mantle-passes', !Game.over && newId !== oldId, `${oldName} -> ${newName}`);
  if (Game.over) return rec;

  // --- F1: the renounced word must not bind the successor ---
  // canMakeAmends has TWO lanes (rep lane + broken-word lane); test the
  // broken-word lane's own predicate directly so the rep lane can't mask it.
  const promiseLaneOpen = (vid) => {
    const lw = Game.lastPromiseWord(vid);
    return lw.word === 'promise_broken' && (lw.mem == null || lw.mem.maker == null || lw.mem.maker === Game.villagerId);
  };
  check('F1-amends-after-death', promiseLaneOpen(vidC) === false,
    `broken-word lane post-death=${promiseLaneOpen(vidC)} (expect false: not the successor's word; rep lane=${JSON.stringify(Game.worstRepAxis(vidC))})`);
  const sayP = says.length;
  Game.promiseHelp(vidC);
  const refused = says.slice(sayP).some(t => /You said that before|Not again/.test(t));
  check('F1-no-refusal', refused === false, `refusal fired for successor=${refused}`);
  const inhName = Game.inheritedName ? Game.inheritedName(lastMem(Game, vidC, 'promise_broken')) : null;
  check('F1-inherited-name', inhName === oldFirst, `inheritedName=${inhName} expected=${oldFirst}`);

  // --- F2: open promises released, never left to rot against the successor ---
  const pA = (v.promises || {})[vidA], pB = (v.promises || {})[vidB];
  check('F2-release-A', pA && pA.kept === 'released' && pA.inherited === true,
    `A kept=${pA && pA.kept} inherited=${pA && pA.inherited}`);
  check('F2-release-B', pB && pB.kept === 'released' && pB.inherited === true,
    `B kept=${pB && pB.kept} inherited=${pB && pB.inherited}`);
  const favB = Game.convoGetFavor(vidB) || {};
  check('F2-favor-reverts', favB.state === 'asked', `B favor state=${favB.state} (expect 'asked' — the NPC re-asks)`);
  const favInh = Game.inheritedName ? Game.inheritedName(favB) : null;
  check('F2-reask-names-predecessor', favInh === oldFirst,
    `favor inheritedName=${favInh} expected=${oldFirst}`);

  // --- SUCCESSOR: 3 days; mourning must name the dead ---
  for (let d = 0; d < DAYS2; d++) await runDays(Game, competent, { days: 1 });
  const postDeath = says.slice(sayMark);
  const named = postDeath.filter(t => t.includes(oldFirst));
  check('mourning-names-dead', named.length >= 1, `${named.length} post-death lines name "${oldFirst}"`);
  rec.mourningSample = named.slice(0, 4);

  // --- PEOPLE CHECK: one full grief-driven conversation as the new bearer ---
  const trust = v.trust || {};
  const roster2 = (v.roster || []).filter(id => id !== Game.villagerId);
  const talked = roster2.find(id => id === vidC) || roster2.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0))[0];
  if (talked) {
    const out = [`## seed ${seed}: successor [${newName}] talks to ${rawName(Game, talked)} (the renounced villager)`];
    try {
      Game.startConvo(talked);
      const GRIEF = /lately|mourn|grief|died|dead|gone|miss|bury|buried|grave|funeral|loss|lost|outbreak|promise|word/i;
      for (let t = 0; t < 14; t++) {
        const choices = Game.convoChoices(talked) || [];
        if (!choices.length) { out.push('(no choices)'); break; }
        let pick = choices.find(c => GRIEF.test((c.text || '') + ' ' + (c.id || '')) && !/^(leave|bye|goodbye)/.test(c.id));
        if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
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
      console.error('mourning: ' + JSON.stringify(rec.mourningSample));
      for (const t of (rec.convo || [])) console.error(t + '\n');
    } catch (e) {
      console.log(JSON.stringify({ seed, error: String(e && e.message || e) }));
      console.error('SEED ' + seed + ' THREW: ' + (e && e.stack || e));
    }
  }
})();
