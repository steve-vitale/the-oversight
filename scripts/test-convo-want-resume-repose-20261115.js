#!/usr/bin/env node
// Want-thread resume re-pose — PROOF (journey-landing r137, 2026-11-15).
// Defect (r136, two confirmed takes — Liam 1144-d6, Yara 1142-d5): picking
// "We never finished — <question>" on a deflected curious question speaks
// only the generic acknowledgment ("About needing to be alone — yeah, we
// never did get back to that.") — the question is never re-posed and the
// thread dies there.
//
// Mechanism: the alive:thread:want handler calls convoThreadBeat, which
// for a want calls the def's engageBeat; curious engageBeat returns null
// by the r121 first-reveal guard (no answer in this sitting — correct,
// must not break), so the handler falls through to the generic line.
//
// Fix (conversation.js, alive:thread:want handler): when the beat is null
// and the live want is a question-want (def.answerEngages — today only
// curious) with a known, unanswered qid, re-hang THE SAME question via
// convoQuestionDef + convoAcceptWantQuestion, speak the question itself
// as the resume line (bare, per the r215 stutter ruling), and reopen the
// want (stage 3 -> 1, resolution cleared) so a later answer engages it.
//
// Cases (scripted sittings via startConvo/convoTurn):
//   1. Liam shape: curious opener -> deflect_q -> change subject -> take
//      alive:thread:want. The THEM line IS the same question; pendingQ is
//      the same qid; the next menu offers ans:<qid>:*; stage 1.
//      FAILS pre-fix (generic line, pendingQ null, no ans: choices).
//   2. Answer arc: answer the re-posed question -> stage 2; endConvo
//      ('left') -> resolution 'engaged'. (The reopened want must complete
//      honestly; a re-posed question that cannot engage is a new defect.)
//   3. honest_pass shape: curious -> honest_pass -> resume-take ->
//      question re-posed (the player re-opened it).
//   4. Control (non-question thread): resume a 'village' thread -> its
//      beat / generic line, pendingQ stays null, no ans: choices.
//   5. Observation (not an assertion): after case 2's endConvo('left'),
//      does a curious seed for the ANSWERED qid plant? (resolve() plants
//      on how==='left' for any non-deflected resolution — if it plants,
//      the next sitting would re-ask an answered question. Carried as an
//      observation, out of this run's scope.)
//
// Seeded PRNG BEFORE module eval. Full production script list, minus
// DOM-only modules.
//
// Usage: node scripts/test-convo-want-resume-repose-20261115.js [SEED=...]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261115', 10);

let _s = SEED >>> 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.window = global;
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/text.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

if (typeof Game.emit !== 'function') {
  Game.emit = function (msg) {
    try { (this.log = this.log || []).push(String(msg)); } catch (e) {}
    return msg;
  };
}

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}
function vname(vid) {
  try { return Game.villagerName(vid) || vid; } catch (e) { return vid; }
}
function choicesOf(r, vid) {
  return (r && r.choices && r.choices.length) ? r.choices : Game.convoChoices(vid);
}
// Drive a sitting until the menu offers alive:thread:<tid> (bounded).
// The resume is suppressed while the beat thread IS the planted thread
// (convo-scene.js: open threads skip scene.beat.thread), and the plant
// fires when a topic ask moves the beat thread off it — so the walk is:
// topic ask (moves the thread, plants) -> change subject -> resume.
// Mirrors the r136 driver's probe (Liam 1144-d6: deflect -> subject ->
// more -> ask:village -> subject -> resume offered).
function takeResume(vid, tid, r0) {
  let r = r0;
  let moved = false;
  for (let turn = 0; turn < 12; turn++) {
    const choices = choicesOf(r, vid);
    const resume = (choices || []).find(x => x && x.id === 'alive:thread:' + tid);
    if (resume) {
      console.log(`YOU: ${resume.label}`);
      const rr = Game.convoTurn(vid, resume.id);
      if (rr.line) console.log(`THEM: ${rr.line}`);
      return rr;
    }
    const threadNow = (Game.convoGet(vid) || {}).thread;
    let nav = null;
    if (!moved) {
      nav = (choices || []).find(x => x && x.id === 'ask:village')
        || (choices || []).find(x => x && x.id && x.id.indexOf('ask:') === 0);
      if (nav) moved = true;
    }
    if (!nav) nav = (choices || []).find(x => x && x.id === 'dlg:subject');
    if (!nav) nav = (choices || []).find(x => x && x.id === 'menu:more');
    if (!nav) nav = (choices || []).find(x => x && x.id === 'goon');
    if (!nav) { console.log(`(no navigation choice; thread=${threadNow} menu: ${(choices || []).map(x => x && x.id).join(',')})`); return null; }
    console.log(`YOU: ${nav.label}`);
    r = Game.convoTurn(vid, nav.id);
    if (r.line) console.log(`THEM: ${r.line}`);
    if (r.ended) return null;
  }
  console.log('(resume never offered in 12 turns)');
  return null;
}

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;

  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const commAble = npcs.filter(id => { try { return Game.npcComm(id).level !== 'none'; } catch (e) { return true; } });
  ok('has comm-able villagers', commAble.length >= 3, `npcs=${npcs.length} commAble=${commAble.length}`);

  // Collect villagers whose fresh want is curious with a hanging question.
  const curiousVids = [];
  for (const vid of commAble) {
    if (curiousVids.length >= 2) break;
    try { Game.state.village.trust[vid] = 65; } catch (e) {}
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    if (!r0.refused && c.want && c.want.id === 'curious' && c.pendingQ && c.pendingQ.id) {
      curiousVids.push({ vid, qid: c.pendingQ.id, opener: String(r0.line || '') });
      console.log(`\n--- curious villager: ${vname(vid)} qid=${c.pendingQ.id} ---`);
      console.log(`THEM: ${r0.line}`);
      // Leave the sitting open for the case below — do NOT endConvo yet.
      // (The sitting stays live; the case drives it to completion.)
      break; // take the first; the second is collected fresh below
    }
    Game.endConvo(vid, 'left');
  }
  ok('found a curious villager with a hanging question', curiousVids.length >= 1,
    `tried ${commAble.length} villagers`);

  // ---- CASE 1+2: deflect, resume, answer (Liam shape) ----
  const A = curiousVids[0];
  const qdA = Game.convoQuestionDef(A.qid);
  const qCoreA = String((qdA && qdA.q) || '').replace(/^"|"$/g, '').slice(0, 40);
  console.log(`\n=== CASE 1 (deflect -> resume) ${vname(A.vid)} qid=${A.qid} ===`);
  let r = Game.convoTurn(A.vid, 'deflect_q');
  if (r.line) console.log(`THEM: ${r.line}`);
  const wAfterDeflect = Game.convoGet(A.vid).want || {};
  ok('case 1: deflect leaves the want deflected (stage 3)', wAfterDeflect.stage === 3,
    `stage=${wAfterDeflect.stage} resolution=${wAfterDeflect.resolution}`);
  const rr = takeResume(A.vid, 'want', r);
  ok('case 1: the resume choice was offered and taken', !!rr, 'never offered');
  if (rr) {
    const line = String(rr.line || '');
    ok('case 1: the resume line IS the same question (re-posed, not the generic ack)',
      line.includes(qCoreA), `line=${line.slice(0, 140)}`);
    ok('case 1: the generic acknowledgment is gone',
      !/we never did get back to that/i.test(line), line.slice(0, 140));
    const c = Game.convoGet(A.vid);
    ok('case 1: the same question hangs again (pendingQ)',
      !!(c.pendingQ && c.pendingQ.id === A.qid),
      `pendingQ=${c.pendingQ && c.pendingQ.id}`);
    const menu = Game.convoChoices(A.vid) || [];
    ok('case 1: the next menu offers the question answers',
      menu.some(x => x && x.id === 'ans:' + A.qid + ':' + ((qdA.answers || [])[0] || {}).id) ||
      menu.some(x => x && x.id && x.id.indexOf('ans:' + A.qid + ':') === 0),
      menu.map(x => x && x.id).join(','));
    ok('case 1: the want reopened (stage 1, resolution cleared)',
      (c.want.stage || 0) === 1 && !c.want.resolution,
      `stage=${c.want.stage} resolution=${c.want.resolution}`);

    // ---- CASE 2: answer the re-posed question ----
    console.log(`\n=== CASE 2 (answer the re-posed question) ===`);
    const ans = (menu || []).find(x => x && x.id && x.id.indexOf('ans:' + A.qid + ':') === 0 && x.id.indexOf('honest_pass') === -1);
    ok('case 2: an answer choice exists', !!ans, `menu=${menu.map(x => x && x.id).join(',')}`);
    if (ans) {
      console.log(`YOU: ${ans.label}`);
      const ra = Game.convoTurn(A.vid, ans.id);
      if (ra.line) console.log(`THEM: ${ra.line}`);
      const wAfterAnswer = Game.convoGet(A.vid).want || {};
      ok('case 2: answering engages the want (stage 2)',
        (wAfterAnswer.stage || 0) === 2, `stage=${wAfterAnswer.stage}`);
      Game.endConvo(A.vid, 'left');
      const wFinal = Game.convoGet(A.vid).want || {};
      ok('case 2: the sitting resolves engaged',
        wFinal.resolution === 'engaged', `resolution=${wFinal.resolution} stage=${wFinal.stage}`);
      const seed = ((Game.state.village.convoSeeds || {})[A.vid]) || null;
      console.log(`OBSERVATION (case 5): seed after answer+leave: ${seed ? seed.wantId + ' qid=' + (seed.qid || null) + ' note="' + seed.note + '"' : 'none'}`);
    } else {
      Game.endConvo(A.vid, 'left');
    }
  } else {
    Game.endConvo(A.vid, 'left');
  }

  // ---- CASE 3: honest_pass, then resume ----
  console.log(`\n=== CASE 3 (honest_pass -> resume) ===`);
  let B = null;
  Game.state.scholar.day = 21;
  for (const vid of commAble) {
    if (vid === A.vid) continue;
    try { Game.state.village.trust[vid] = 65; } catch (e) {}
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    // Need the literal honest_pass choice: some questions carry a bespoke
    // opt-out answer instead (q_plan), which the ans: handler treats as a
    // real answer — only the literal opt-out leaves the question unanswered.
    const hpHere = !r0.refused && c.want && c.want.id === 'curious' && c.pendingQ && c.pendingQ.id &&
      (choicesOf(r0, vid) || []).some(x => x && x.id === 'ans:' + c.pendingQ.id + ':honest_pass');
    if (hpHere) {
      B = { vid, qid: c.pendingQ.id, r0 };
      console.log(`curious villager: ${vname(vid)} qid=${c.pendingQ.id}`);
      console.log(`THEM: ${r0.line}`);
      break;
    }
    Game.endConvo(vid, 'left');
  }
  ok('case 3: found a second curious villager', !!B, 'none found');
  if (B) {
    const qdB = Game.convoQuestionDef(B.qid);
    const qCoreB = String((qdB && qdB.q) || '').replace(/^"|"$/g, '').slice(0, 40);
    const hp = (choicesOf(B.r0, B.vid) || []).find(x => x && x.id === 'ans:' + B.qid + ':honest_pass');
    ok('case 3: honest_pass offered', !!hp, `menu=${(choicesOf(B.r0, B.vid) || []).map(x => x && x.id).join(',')}`);
    let rb = hp ? Game.convoTurn(B.vid, hp.id) : null;
    if (rb && rb.line) console.log(`THEM: ${rb.line}`);
    const rrb = rb ? takeResume(B.vid, 'want', rb) : null;
    ok('case 3: the resume choice was offered and taken', !!rrb, 'never offered');
    if (rrb) {
      const line = String(rrb.line || '');
      ok('case 3: the resume line IS the same question (player re-opened it)',
        line.includes(qCoreB), `line=${line.slice(0, 140)}`);
      const c = Game.convoGet(B.vid);
      ok('case 3: the same question hangs again',
        !!(c.pendingQ && c.pendingQ.id === B.qid), `pendingQ=${c.pendingQ && c.pendingQ.id}`);
    }
    Game.endConvo(B.vid, 'left');
  }

  // ---- CASE 4: control — resume a non-question thread ----
  console.log(`\n=== CASE 4 (control: topic-thread resume) ===`);
  Game.state.scholar.day = 22;
  let C = null;
  for (const vid of commAble) {
    if (vid === A.vid || (B && vid === B.vid)) continue;
    try { Game.state.village.trust[vid] = 65; } catch (e) {}
    const r0 = Game.startConvo(vid);
    if (r0.refused) { Game.endConvo(vid, 'left'); continue; }
    // Take any topic ask to move the beat thread and plant that thread:
    // ask:* choices surface after the opener beat (dlg:subject first),
    // not in the opening menu — so navigate before looking for one.
    let r = r0, tid = null;
    for (let t = 0; t < 8 && !tid; t++) {
      const ch = choicesOf(r, vid);
      const ask = (ch || []).find(x => x && x.id && x.id.indexOf('ask:') === 0);
      if (ask) { tid = ask.id.slice(4); console.log(`YOU: ${ask.label}`); r = Game.convoTurn(vid, ask.id); if (r.line) console.log(`THEM: ${r.line}`); break; }
      const subj = (ch || []).find(x => x && x.id === 'dlg:subject');
      if (subj) { console.log(`YOU: ${subj.label}`); r = Game.convoTurn(vid, subj.id); if (r.line) console.log(`THEM: ${r.line}`); if (r.ended) break; continue; }
      const more = (ch || []).find(x => x && x.id === 'menu:more');
      if (!more) break;
      r = Game.convoTurn(vid, more.id);
      if (r.ended) break;
    }
    if (tid) { C = { vid, tid, r }; break; }
    Game.endConvo(vid, 'left');
  }
  ok('case 4: found a villager with a topic ask to plant a thread', !!C, 'none found');
  if (C) {
    const rrc = takeResume(C.vid, C.tid, C.r);
    ok(`case 4: the ${C.tid} resume was offered and taken`, !!rrc, 'never offered');
    if (rrc) {
      const c = Game.convoGet(C.vid);
      ok('case 4: no question hangs after a non-question resume',
        !c.pendingQ, `pendingQ=${c.pendingQ && c.pendingQ.id}`);
      const menu = Game.convoChoices(C.vid) || [];
      ok('case 4: no ans: choices after a non-question resume',
        !menu.some(x => x && x.id && x.id.indexOf('ans:') === 0),
        menu.map(x => x && x.id).join(','));
    }
    Game.endConvo(C.vid, 'left');
  }

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
