#!/usr/bin/env node
// test-journey-succession-r209-deferred-ask-block-20261115.js — proof test
// for the r209 DEFERRED-ASK BLOCKED fix (journey-succession r209).
//
// The r202 gap: seed 34262 d85, Logan, dlg:help. The sitting opened with a
// resume opener calling back the unfinished water haul ("We never did
// finish talking about that water haul — that was 9 days back"), so the
// want's ask was never stated in this sitting; dlg:help -> engageBeat ->
// DEFERRED OPENER returned the templated cistern ask verbatim. The
// identical ask was already in the 48-entry run ledger (another villager
// stated it recently — water_haul has 9 opener/ask combos over a
// village-wide cistern level, so collisions are routine), sayLine
// run-blocked it and dry-replaced it with "...Sorry, lost my train of
// thought." — while the handler returned the unspoken ask as its line.
// The whyLine path directly above the deferred branch already had the
// r147/r151/r166 guard; the deferred branch had none.
//
// The fix (src/js, convo-wants.js ask_favor.engageBeat — the deferred
// branch only): when the deferred ask would block, try the three fresh
// need phrasings in order; return null when every one is blocked, so the
// caller falls back to its own graceful line (dlg:help's nowant pool).
// Same shape as the r147 whyLine guard, at the source so no caller can
// miss it. No RNG: fixed order, pure-read checks only.
//
// Cases (each in its own process — never two harnesses in one process):
//   engage    : cistern at 0L, deferred state, all 9 ask combos poisoned
//               in the run ledger. engageBeat must return a need phrasing
//               naming the creek water run — never the blocked ask, never
//               a dry line, never null.
//   allblocked: same, plus all 3 need phrasings poisoned. engageBeat must
//               return null (the caller's graceful fallback answers).
//   control   : clean ledger. engageBeat returns the deferred ask itself
//               (the fix must not change the unblocked path).
//   ledger    : sayLine itself is untouched — the same line spoken twice
//               in one sitting still dry-replaces the second.
//
// NO menu-driven dlg:help case (same bar as r147): on the current base
// dlg:help for ask_favor is offered only through the resume-opener shape,
// which needs a stored favor + no live seed + an open thread + a 65% RNG
// gate — every construction fails in the unit harness. The `engage` case
// IS the dlg:help guard's proof at the source: dlg:help calls exactly
// this engageBeat and speaks its return value. The dlg:help turn itself
// is judged at the SIM level by the after-leg dry census across the
// full panel.
// Usage: node scripts/test-journey-succession-r209-deferred-ask-block-20261115.js [engage|allblocked|control|ledger]
//   Default (no arg): runs all four cases, spawning children for the
//   three non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

const DRY = [
  '"...Sorry, lost my train of thought."',
  '"Hm. Never mind — go on."',
  '"...Actually, forget it."',
  '"...Where was I? Gone. Ask me something else."',
  '"Huh. That went clean out of my head."',
  '"...No, it\'s not coming back. What were you saying?"',
  '"Lost it. The thought, I mean. Go on."',
  '"...Sorry — that one slipped away from me."',
];
const isDry = (t) => DRY.some(d => String(t || '').includes(d.replace(/"/g, '')));

function firstChunk(Game, line) {
  try { return Game.convoSplitBeats(line)[0].trim(); } catch (e) { return String(line); }
}

// All 9 water_haul ask combos at 0 liters (convo-wants.js build):
// 3 openers x 3 asks, liters from the believed cistern level.
function waterAskKeys(Game) {
  const openers = [
    'The cistern\'s nearly dry \u2014 0 liters left.',
    'We\'re down to 0 liters of clean water.',
    'Water\'s almost gone \u2014 0 liters.',
  ];
  const asks = [
    'I need someone to haul water with me at first light. Two of us, half the trips. Will you come?',
    'Haul the creek with me at dawn? Two buckets each, there and back.',
    'I can\'t carry enough alone. First light, the creek, you and me?',
  ];
  const keys = [];
  for (const o of openers) for (const a of asks) keys.push(firstChunk(Game, '"' + o + ' ' + a + '"'));
  return keys;
}

function needKeys(Game, vid, favor) {
  const keys = [];
  for (let vi = 0; vi < 3; vi++) {
    try {
      const n = Game.convoFavorNeedLine(vid, favor, true, vi);
      if (n) keys.push(firstChunk(Game, n));
    } catch (e) {}
  }
  return keys;
}

function poisonRunLedger(Game, chunks) {
  const rl = Game.convoRunLedger();
  for (const k of chunks) if (k && !rl.includes(k)) rl.push(k);
  while (rl.length > 48) rl.shift();
}

// Stage the whole roster for a water-haul need at 0 liters: cistern dry
// + believed dry (perception write, as if everyone at Haven saw it) +
// no competing acute need. Returns the roster.
async function setupWaterHaul(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.water = { clean: 0, dirty: 0 };
  v.health = v.health || {};
  v.hunger = v.hunger || {};
  v.energy = v.energy || {};
  v.fear = v.fear || {};
  v.sick = v.sick || {};
  v.promises = v.promises || {};
  v.favorDeclined = v.favorDeclined || {};
  v.trust = v.trust || {};
  for (const vid of roster) {
    v.health[vid] = 100;
    v.hunger[vid] = 0;
    v.energy[vid] = 100;
    v.fear[vid] = 0;
    delete v.sick[vid];
    delete v.promises[vid];
    delete v.favorDeclined[vid];
    v.trust[vid] = 90;
    try { if (typeof Game.objResourceSee === 'function') Game.objResourceSee(vid); } catch (e) {}
  }
  return roster;
}

function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}

// Open a sitting and force the DEFERRED state: the resume opener
// preempted the want's opener, so the ask was never stated in this
// sitting (c._resumedOnce, no favor pinned on the want, stage 0).
// Loops the roster for a speaker whose want IS the water_haul ask_favor:
// first meetings lead with curiosity (chronic needs dampened), and on
// repeat sittings seek_taken's 3.1 grief floor can outrank a chronic
// urgency-3 need — so each candidate is opened as a RETURNING
// conversation (count = 2) and kept only when the want lands on the
// water haul. Rejected candidates are closed cleanly.
// Returns { vid, c, favor } or null.
async function openDeferred(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const vid of roster) {
    try {
      const need = Game.convoFindFavorNeed(vid);
      if (!need || need.kind !== 'water_haul') continue;
      const rec = Game.convoGet(vid);
      if (rec) rec.count = 2; // returning conversation, not a first meeting
      const r = Game.startConvo(vid);
      if (!(r && !r.refused)) continue;
      const c = Game.convoGet(vid);
      if (!c || !c.want || c.want.id !== 'ask_favor') { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
      const favor = (typeof Game.convoGetFavor === 'function') ? Game.convoGetFavor(vid) : null;
      if (!favor || favor.kind !== 'water_haul') { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
      // Deferred: the sitting resumed (opener preempted), the ask unspoken.
      c._resumedOnce = true;
      try { delete c.want.favor; } catch (e) {}
      if (c.want) c.want.stage = 0;
      return { vid, c, favor };
    } catch (e) { try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
  }
  return null;
}

async function runCase(mode) {
  const seed = { engage: 5521, allblocked: 5522, control: 5523, ledger: 5524 }[mode] || 5521;
  const { Game } = await loadGame({ seed, mode: 'succession-r209-deferred-ask-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupWaterHaul(Game);
  check(`${mode}: roster staged for the water haul`, roster.length > 0, `roster=${roster.length}`);
  if (!roster.length) return;
  const needy = roster.find(id => { try { const n = Game.convoFindFavorNeed(id); return n && n.kind === 'water_haul'; } catch (e) { return false; } });
  check(`${mode}: need is water_haul for a roster villager`, !!needy, `needy=${needy}`);
  if (!needy) return;

  if (mode === 'ledger') {
    const vid = needy;
    const rec = Game.convoGet(vid);
    if (rec) rec.count = 2;
    const r = Game.startConvo(vid);
    check('ledger: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    const line = '"A line no other test speaks, about the old fence."';
    const c = Game.convoGet(vid);
    Game.sayLine(vid, line);
    const fell1 = !!(c && c._sayFellBack);
    Game.sayLine(vid, line);
    const fell2 = !!(c && c._sayFellBack);
    check('ledger: first speak lands (no fellBack)', !fell1);
    check('ledger: second speak dry-replaces (fellBack)', fell2);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  const askKeys = waterAskKeys(Game);

  if (mode === 'engage') {
    poisonRunLedger(Game, askKeys);
    const st = await openDeferred(Game);
    check('engage: deferred water-haul sitting opened', !!st, 'vid=' + (st && st.vid));
    if (!st) return;
    const vid = st.vid;
    const opener = lastNpcLine(Game, vid);
    check('engage: opener states the ask (not dry)', !!opener && !isDry(opener), opener.slice(0, 90));
    const def = st.c.want.def;
    check('engage: want def has engageBeat', !!(def && typeof def.engageBeat === 'function'));
    if (!def || typeof def.engageBeat !== 'function') return;
    const beat = def.engageBeat.call(Game, vid);
    check('engage: beat is NOT a dry line', !!beat && !isDry(beat), String(beat || '').slice(0, 120));
    check('engage: beat is NOT any blocked ask combo',
      !!beat && !askKeys.some(k => String(beat).includes(k.replace(/"/g, '').slice(0, 40))),
      String(beat || '').slice(0, 120));
    check('engage: beat names the live need (creek water run)',
      !!beat && /creek water run/i.test(beat), String(beat || '').slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'allblocked') {
    const st0 = await openDeferred(Game);
    check('allblocked: deferred water-haul sitting opened', !!st0, 'vid=' + (st0 && st0.vid));
    if (!st0) return;
    const vid = st0.vid;
    poisonRunLedger(Game, askKeys.concat(needKeys(Game, vid, st0.favor)));
    const def = st0.c.want.def;
    const beat = def && typeof def.engageBeat === 'function' ? def.engageBeat.call(Game, vid) : 'NO-DEF';
    check('allblocked: engageBeat returns null (caller fallback answers)', beat === null, String(beat || '').slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'control') {
    const st = await openDeferred(Game);
    check('control: deferred water-haul sitting opened', !!st, 'vid=' + (st && st.vid));
    if (!st) return;
    const vid = st.vid;
    const def = st.c.want.def;
    const beat = def && typeof def.engageBeat === 'function' ? def.engageBeat.call(Game, vid) : null;
    check('control: engageBeat returns the deferred ask itself',
      !!beat && askKeys.some(k => String(beat).includes(k.replace(/"/g, '').slice(0, 40))),
      String(beat || '').slice(0, 120));
    check('control: ask is NOT a dry line', !!beat && !isDry(beat), String(beat || '').slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['engage', 'allblocked', 'control', 'ledger'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('engage');
    for (const m of ['allblocked', 'control', 'ledger']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r209-deferred-ask-block-20261115.js'), m],
          { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
        console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
        if (/FAIL/.test(out)) fails++;
      } catch (e) {
        check(`${m} child run passes`, false, String((e.stdout || e.message || e)).slice(0, 300));
      }
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
