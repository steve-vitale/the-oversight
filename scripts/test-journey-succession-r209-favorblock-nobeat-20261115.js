#!/usr/bin/env node
// test-journey-succession-r209-favorblock-nobeat-20261115.js — proof test
// for the r209 NO-BEAT fix (journey-succession r209, second seam).
//
// The r202 second seam: seed 34262 d85, Logan's resume opener quoted a
// second voice — "We never did finish talking about that water haul —
// that was 9 days back. Still on your mind? 'Your partner is inside the
// Haven hall. Go through the door to meet them.'" The quoted bit is a
// favor-partner block line: favor-water.js's inside/outside mismatch
// block returns the door direction as the favor action's reason, the
// favor handler speaks it through sayLine, and sayLine notes every
// spoken line as a thread beat — so the direction became the 'want'
// thread's last beat, was planted as the thread's memory snippet, and
// was quoted in the next sitting's resume opener as if Logan had said
// it about the water haul. The line-92 block carries no reasonKey, so
// the r130 rotation never applies and the raw direction is what speaks.
//
// The fix (src/js, conversation.js sayLine + convo-dialogue.js favor
// handler): sayLine accepts opts.noBeat — the line is still spoken,
// ledgered, and voiced, it just never becomes thread content. The
// favor handler passes noBeat for BLOCKED favor lines only (result.ok
// false); successful performances keep the current behavior. The code's
// own comment at the call site says it: "Requirements are interface
// information, never fabricated NPC speech" — the fix makes the thread
// log agree.
//
// Cases (each in its own process — never two harnesses in one process):
//   handler: real path — water_haul favor, scholar outside / partner
//            inside (the line-92 mismatch), dlg:favor_requirements.
//            The direction is spoken, but the thread's last beat stays
//            the favor ask — never the door direction.
//   direct : source-level flag proof — speak a real beat, then the
//            block line with noBeat (snippet stays the real beat), then
//            a third line without the flag (snippet moves — noting
//            still works when the flag is absent).
//   control: clean-ledger handler path — no mismatch, the favor action
//            is ready; the requirements text is spoken and the thread's
//            last beat stays the favor ask.
// Usage: node scripts/test-journey-succession-r209-favorblock-nobeat-20261115.js [handler|direct|control]
//   Default (no arg): runs all three cases, spawning children for the
//   two non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

const BLOCK_RE = /Haven hall|Go through the door|same side of the Haven door/i;
const ASK_RE = /cistern|liters|creek water run/i;

// Stage the whole roster for a water-haul need at 0 liters (same shape
// as the deferred-ask proof: cistern dry + believed dry + no competing
// acute need). Returns the roster.
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

// Open a sitting on the water-haul ask_favor, favor PINNED (the handler
// path needs the favor on the want). Loops the roster; first meetings
// lead with curiosity and seek_taken's grief floor can outrank a chronic
// need, so each candidate opens as a returning conversation (count = 2).
async function openFavorSitting(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const vid of roster) {
    try {
      const need = Game.convoFindFavorNeed(vid);
      if (!need || need.kind !== 'water_haul') continue;
      const rec = Game.convoGet(vid);
      if (rec) rec.count = 2;
      const r = Game.startConvo(vid);
      if (!(r && !r.refused)) continue;
      const c = Game.convoGet(vid);
      if (!c || !c.want || c.want.id !== 'ask_favor') { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
      const favor = (typeof Game.convoGetFavor === 'function') ? Game.convoGetFavor(vid) : null;
      if (!favor || favor.kind !== 'water_haul') { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
      return { vid, c, favor };
    } catch (e) { try { Game.endConvo(vid, 'left'); } catch (e2) {} continue; }
  }
  return null;
}

function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}

async function runCase(mode) {
  const seed = { handler: 5531, direct: 5532, control: 5533 }[mode] || 5531;
  const { Game } = await loadGame({ seed, mode: 'succession-r209-favorblock-nobeat-proof', fullTelemetry: true });
  await setupGame(Game);
  const roster = await setupWaterHaul(Game);
  check(`${mode}: roster staged for the water haul`, roster.length > 0, `roster=${roster.length}`);
  if (!roster.length) return;

  if (mode === 'direct') {
    // Any open sitting; the thread is whatever startConvo sets.
    const vid = roster[0];
    const rec = Game.convoGet(vid);
    if (rec) rec.count = 2;
    const r = Game.startConvo(vid);
    check('direct: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    if (!(r && !r.refused)) return;
    const c = Game.convoGet(vid);
    const thread = c.thread;
    check('direct: sitting has a thread', !!thread, `thread=${thread}`);
    const beatA = '"The cistern\'s nearly dry — 0 liters left. I need someone to haul water with me at first light."';
    const blockB = '"Your partner is inside the Haven hall. Go through the door to meet them."';
    const beatC = '"First light, then. Bring something to carry."';
    Game.sayLine(vid, beatA);
    check('direct: real beat becomes the snippet', Game.convoLastThreadSnippet(vid, thread) === Game.convoSplitBeats(beatA)[0].trim().slice(0, 110) || (Game.convoLastThreadSnippet(vid, thread) || '').includes('cistern'), `snippet=${Game.convoLastThreadSnippet(vid, thread)}`);
    Game.sayLine(vid, blockB, { diegeticAct: true, noBeat: true });
    const snipB = Game.convoLastThreadSnippet(vid, thread);
    check('direct: noBeat block line does NOT become the snippet', !!snipB && !BLOCK_RE.test(snipB), `snippet=${snipB}`);
    check('direct: snippet is still the real beat', !!snipB && ASK_RE.test(snipB), `snippet=${snipB}`);
    Game.sayLine(vid, beatC);
    const snipC = Game.convoLastThreadSnippet(vid, thread);
    check('direct: a later real beat still notes (flag is opt-in)', !!snipC && /First light/.test(snipC), `snippet=${snipC}`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  const st = await openFavorSitting(Game);
  check(`${mode}: water-haul favor sitting opened`, !!st, 'vid=' + (st && st.vid));
  if (!st) return;
  const vid = st.vid;
  const c = Game.convoGet(vid);
  const thread = c.thread;
  check(`${mode}: sitting thread is want`, thread === 'want', `thread=${thread}`);

  if (mode === 'handler') {
    // The line-92 mismatch: scholar outside, partner inside (default).
    Game.state.scholar.insideHaven = false;
    const choices = Game.convoChoices(vid) || [];
    const hasReq = choices.some(x => x.id === 'dlg:favor_requirements');
    check('handler: dlg:favor_requirements offered', hasReq, `choices=${choices.map(x => x.id).join(',')}`);
    if (!hasReq) return;
    const before = Game.convoLastThreadSnippet(vid, thread);
    Game.convoTurn(vid, 'dlg:favor_requirements');
    const turn = lastNpcLine(Game, vid);
    check('handler: the door direction IS spoken to the player', BLOCK_RE.test(turn), turn.slice(0, 140));
    const after = Game.convoLastThreadSnippet(vid, thread);
    check('handler: the direction does NOT become the thread memory', !!after && !BLOCK_RE.test(after), `snippet=${after}`);
    check('handler: the thread memory stays the favor ask', !!after && ASK_RE.test(after), `snippet=${after} (before=${before})`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'control') {
    // No mismatch: scholar inside (default), partner inside (default).
    const choices = Game.convoChoices(vid) || [];
    const hasReq = choices.some(x => x.id === 'dlg:favor_requirements');
    check('control: dlg:favor_requirements offered', hasReq, `choices=${choices.map(x => x.id).join(',')}`);
    if (!hasReq) return;
    Game.convoTurn(vid, 'dlg:favor_requirements');
    const turn = lastNpcLine(Game, vid);
    check('control: requirements turn speaks (no silence)', !!turn, turn.slice(0, 140));
    const after = Game.convoLastThreadSnippet(vid, thread);
    check('control: thread memory stays the favor ask', !!after && ASK_RE.test(after), `snippet=${after}`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['handler', 'direct', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('handler');
    for (const m of ['direct', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r209-favorblock-nobeat-20261115.js'), m],
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
