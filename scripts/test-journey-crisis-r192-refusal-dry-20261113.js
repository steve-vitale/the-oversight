#!/usr/bin/env node
'use strict';
// Proof: "Not this again." dry-replacement defect (journey-crisis r192,
// F2 stretch from succession r187's carried items).
// RED: confrontDoubt + confrontTheft refuse a re-press with ONE fixed
// line ('"Not this again." {first} turns away. "We\'re done with that."').
// Whenever that line already sits in the 48-entry run ledger (spoken by
// any villager recently — the refusal fires per doubt, and a second
// villager's refusal inside the window recycles the same text),
// sayLine dry-replaces it with "...Sorry, lost my train of thought."
// — a non-sequitur right when the villager is refusing you, the moment
// the refusal most needs to read as a person drawing a line. Same class
// as warn-details (r186), confront (r187) and deflect_q (r192 F1).
// GREEN (post-fix): the refusal draws from a `refused` truth pool via
// drawTruthLineUnblocked — a blocked variant is skipped for a fresh one,
// so the refusal always speaks honest content, never the dry line. With
// a clean ledger and deterministic draws the ORIGINAL line still speaks
// (common-path preservation: refused[0] is the original, verbatim).
// REACHABILITY NOTE: the convoChoices menu FILTERS refused doubts
// (truth.js, 2026-10-09/10 — a second open doubt can't bypass the
// cooldown), so the live UI never offers the pick that reaches this
// guard; the guard is a backstop for direct/unfiltered calls. The test
// therefore drives the guard directly (convoTurn with the refused
// doubt's id, inside an open conversation) — the only path that reaches
// it. The fix is defense-in-depth for a latent, not live, surface: no
// panel has ever shown this line firing or drying.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const speaker = roster.find(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  }) || roster[0];
  v.trust = v.trust || {};
  v.trust[speaker] = 50;
  const first = Game.displayName(speaker).split(' ')[0];
  console.log(`speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  // ---- Plant two lies (origin + occupation), motive shame -> confesses ----
  const vp = Game.vpOf(speaker);
  const lieO = Game.makeLie(vp, 'origin', 'shame');
  const lieC = Game.makeLie(vp, 'occupation', 'shame');
  lieO.confessed = false; lieC.confessed = false;
  vp.lies = { origin: lieO, occupation: lieC };

  // ---- Plant two slip doubts (one per lie) ----
  Game.truthSlip(speaker, lieO);
  Game.truthSlip(speaker, lieC);
  const doubts = Game.getDoubts(speaker);
  check('two open slip doubts planted', doubts.length === 2, 'got ' + doubts.length);
  const d1 = doubts[0], d2 = doubts[1];
  console.log(`doubts: ${d1.id} (${d1.field}), ${d2.id} (${d2.field})`);

  // ---- Put d1 in refusal (the post-blowup guard: refusedUntil). The menu
  // hides refused doubts by design, so the guard is driven directly below. ----
  const dayNow = Game.state.scholar.day || 0;
  d1.refusedUntil = dayNow + 2;
  console.log(`d1 refusedUntil=${d1.refusedUntil} (today ${dayNow})`);

  // ---- SAYTRACE: record every sayLine fallback with pre-call ledger state ----
  const sayTrace = [];
  const sayOrig = Game.sayLine.bind(Game);
  Game.sayLine = function (vid, line, opts) {
    let key = null, preSelf = false, preRun = false;
    try {
      const c = Game.convoGet(vid);
      const chunks = Game.convoSplitBeats(String(line == null ? '' : line));
      key = (chunks[0] || '').trim();
      preSelf = !!(c && (c.saidLinesConvo || []).indexOf(key) !== -1);
      const rl = (typeof Game.convoRunLedger === 'function') ? Game.convoRunLedger() : [];
      preRun = !!(rl && rl.indexOf(key) !== -1);
    } catch (e) {}
    const r = sayOrig(vid, line, opts);
    try {
      const c = Game.convoGet(vid);
      const fellBack = !!(c && c._sayFellBack);
      if (fellBack || (r == null && key)) {
        sayTrace.push({ key: (key || '').slice(0, 120), preSelf, preRun, fellBack, nullReturn: r == null });
      }
    } catch (e) {}
    return r;
  };

  // ---- Open the sitting (the guard needs an active conversation; the
  // menu is NOT consulted — it hides refused doubts by design). ----
  const opened = Game.startConvo(speaker);
  check('conversation opens', !!(opened && !opened.refused && !opened.ended), JSON.stringify(opened && opened.refused));
  const c = Game.convoGet(speaker);
  // Sanity: the menu indeed hides the refused doubt (the reachability note).
  const menuIds = (Game.convoChoices(speaker) || []).map(ch => ch.id);
  check('menu hides the refused doubt (guard is backstop-only)', !menuIds.includes('confront:' + d1.id), 'menu: ' + menuIds.join(','));

  const rnd = Math.random;
  const firstRef = Game.firstRef(speaker);
  const origLine = `"Not this again." ${firstRef} turns away. "We're done with that."`;
  const refusedPool = Game.truthLinePools.refused || [];
  const subst = (line) => String(line).split('{first}').join(Game.nameFirst(speaker));

  // ---- Part A (common path): clean ledger, deterministic draws -> the
  // ORIGINAL refusal line speaks verbatim. ----
  let prevLen = (c.transcript || []).length;
  try { Math.random = () => 0; Game.convoTurn(speaker, 'confront:' + d1.id); } finally { Math.random = rnd; }
  const turnA = (c.transcript || []).slice(prevLen);
  const turnAText = turnA.map(e => String(e.text)).join(' ');
  console.log('TURN-A new entries:');
  for (const e of turnA) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  check('common-path refusal speaks the original line verbatim', turnAText.includes(origLine), turnAText.slice(0, 300));
  check('common-path refusal speaks no dry line', !/lost my train of thought/.test(turnAText), turnAText.slice(0, 300));

  // ---- Part B (blocked path): FRESH sitting (the per-sitting ledger
  // resets; only the run-ledger seed remains), seed the ledger with the
  // ORIGINAL refusal line, then re-press the same doubt. Pre-fix the
  // single fixed line is run-blocked and dry-replaces (RED) — the
  // same-sitting re-press instead goes SILENT (self-block, no fallback),
  // which is why the fresh sitting matters: it isolates the run-block
  // dry line. Post-fix the pool's no-repeat tracking has already spent
  // refused[0], so the draw falls to refused[1] — a fresh variant, never
  // the dry line (GREEN). ----
  try { Game.endConvo(speaker, 'left'); } catch (e) {}
  const openedB = Game.startConvo(speaker);
  check('second sitting opens', !!(openedB && !openedB.refused && !openedB.ended), JSON.stringify(openedB && openedB.refused));
  const cB = Game.convoGet(speaker);
  Game.convoRunLedger().push(Game.convoSplitBeats(origLine)[0].trim());
  console.log('SEEDED ledger with the original refusal line: ' + origLine.slice(0, 120));
  prevLen = (cB.transcript || []).length;
  try { Math.random = () => 0; Game.convoTurn(speaker, 'confront:' + d1.id); } finally { Math.random = rnd; }
  const turnB = (cB.transcript || []).slice(prevLen);
  const turnBText = turnB.map(e => String(e.text)).join(' ');
  console.log('TURN-B new entries:');
  for (const e of turnB) console.log(`  ${e.who}: ${String(e.text).slice(0, 160)}`);
  console.log('SAYTRACE fellBack entries: ' + JSON.stringify(sayTrace, null, 1).slice(0, 2000));
  check('blocked refusal speaks (not silent)', turnB.some(e => e.who === 'them'), turnBText.slice(0, 300));
  check('blocked refusal speaks no dry line', !/lost my train of thought/.test(turnBText), turnBText.slice(0, 300));
  check('blocked refusal answers honestly (a refused variant, not the seeded original)',
    refusedPool.slice(1).some(l => turnBText.includes(subst(l))) && !turnBText.includes(origLine),
    turnBText.slice(0, 300));
  check('no sayLine fell back on either refusal turn', sayTrace.length === 0, JSON.stringify(sayTrace));
  check('refused doubt stays open (refusal resolves nothing)', Game.getDoubts(speaker).some(d => d.id === d1.id && !d.resolved));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
