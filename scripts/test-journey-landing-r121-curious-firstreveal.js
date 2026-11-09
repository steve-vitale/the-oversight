#!/usr/bin/env node
// test-journey-landing-r121-curious-firstreveal.js — proof test for the
// r121 CURIOUS-FIRST-REVEAL fix (journey-landing r121 2026-11-09).
//
// The defect (panel r121, seeds 1142-1151, 6 occurrences): the curious
// want's engageBeat — "Huh. I wouldn't have guessed that about you." —
// is a FIRST-REVEAL reaction: it only makes sense right after the player
// revealed something about themself by answering the NPC's question.
// But engageBeat is the want's generic "engage" beat, served by three
// call sites that never check whether anything was revealed:
//
//   alive:thread:want resume (convoThreadBeat t==='want'): the player
//     picks up an old thread cold — 5 of the 6 panel cases, e.g. seed
//     1142 d5 Aroha: the player DEFLECTED "Is there someone here you
//     don't trust?", wandered off, then resumed "We never finished —
//     who you don't trust." and the NPC reacted as if the player had
//     just told them something surprising. They had told them nothing.
//   dlg:more "Go on" on a talk-request thread (convoThreadBeat
//     t==='request' fallback): the NPC has said nothing yet — 1 of the
//     6, seed 1144 d9 Heidi: "Can we talk?" then "Go on" then the
//     reveal-reaction, before any question was even asked.
//
// The fix (src/js, convo-wants.js curious.engageBeat — ONE guard at the
// source, same shape as the wantQDone check in convoNoteBeat): return
// null unless the want's question was answered in THIS sitting
// (c.answered[qid], not honest_pass). c.answered resets per conversation,
// so a prior sitting's answer never re-arms it. Each call site then falls
// through to its honest line (the resume acknowledgment, the dry
// admission). The legit path is untouched: answer the question, then
// "tell me more", and the reaction fires.
//
// Cases (each in its own process — never two harnesses in one process):
//   engage : direct def.engageBeat calls. Unanswered (question hung, no
//            answer yet) -> null. After answering -> the line.
//   resume : menu-driven alive:thread:want after deflect_q. The served
//            line must NOT be the first-reveal line (it must be the
//            resume acknowledgment naming the thread).
//   request: talk request opens the convo, no question available (all
//            asked), player picks dlg:more first. The served line must
//            NOT be the first-reveal line.
//   control: answer the question, then ask for more (goon/dlg:more).
//            The continuer must serve the question's deeper beat —
//            real content, never the first-reveal line, never dry.
//            (The engageBeat's legit direction is proven at the source
//            by the `engage` case: answered -> the line.)
//
// Usage: node scripts/test-journey-landing-r121-curious-firstreveal.js [engage|resume|request|control]
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

const MISFIT = "wouldn't have guessed that about you";

const DRY = [
  '"...Sorry, lost my train of thought."',
  '"Hm. Never mind — go on."',
  '"...Actually, forget it."',
  '"...Where was I? Gone. Ask me something else."',
  '"Huh. That went clean out of my head."',
  '"...No, it\'s not coming back. What were you saying?"',
  '"Lost it. The thought, I mean. Go on."',
  '"...Sorry — that one slipped away from me."',
  '"That\'s the whole of it. Sorry."',
  '"That\'s... pretty much all of it, honestly."',
];
const isDry = (t) => DRY.some(d => String(t || '').includes(d.replace(/"/g, '')));

function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}

// A healthy villager with no acute needs: first meetings lead with
// curiosity (convo gaps 2026-10-11), and no need outranks it.
function setupCalm(Game, vid) {
  const v = Game.state.village || {};
  v.health = v.health || {};
  v.health[vid] = 100;
  v.sick = v.sick || {};
  delete v.sick[vid];
  v.hunger = v.hunger || {};
  v.hunger[vid] = 0;
  v.energy = v.energy || {};
  v.energy[vid] = 100;
  v.fear = v.fear || {};
  v.fear[vid] = 0;
  v.trust = v.trust || {};
  v.trust[vid] = 90;
  v.promises = v.promises || {};
  delete v.promises[vid];
  v.favorDeclined = v.favorDeclined || {};
  delete v.favorDeclined[vid];
}

async function openCuriousConvo(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const vid of roster) {
    try { setupCalm(Game, vid); } catch (e) {}
    let r = null;
    try { r = Game.startConvo(vid); } catch (e) { continue; }
    if (!r || r.refused) continue;
    const c = Game.convoGet(vid);
    if (c && c.want && c.want.id === 'curious') return { vid, c };
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  return null;
}

function choices(Game, vid) {
  try { return Game.convoChoices(vid) || []; } catch (e) { return []; }
}

async function runCase(mode) {
  const seed = { engage: 5611, resume: 5612, request: 5613, control: 5614 }[mode] || 5611;
  const { Game } = await loadGame({ seed, mode: 'landing-r121-curious-firstreveal-proof', fullTelemetry: true });
  await setupGame(Game);

  if (mode === 'request') {
    // Heidi's shape (1144 d9): the NPC asks to talk; the player says
    // "Go on" before any question is asked. Set the talk request on the
    // first roster villager, then open with them.
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    const vid = roster[0];
    if (!vid) { check('request: roster villager exists', false); return; }
    setupCalm(Game, vid);
    v.talkRequests = v.talkRequests || {};
    v.talkRequests[vid] = { line: '"Can we talk? I wanted to ask you something."', day: 1 };
    const r = Game.startConvo(vid);
    check('request: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
    if (!r || r.refused) return;
    const c = Game.convoGet(vid);
    check('request: want is curious', !!(c && c.want && c.want.id === 'curious'), `want=${c && c.want && c.want.id}`);
    check('request: thread is request (talk request leads)', !!(c && c.thread === 'request'), `thread=${c && c.thread}`);
    const ch0 = choices(Game, vid);
    const hasMore = ch0.some(x => x.id === 'dlg:more');
    check('request: dlg:more offered at open', hasMore, `choices=${ch0.map(x => x.id).join(',')}`);
    if (!hasMore) return;
    // No question available: mark every question asked (village-wide and
    // per-conversation) AFTER the want was selected, so the deferred
    // opener finds nothing to hang. (On unfixed code the request branch
    // then falls to engageBeat; on fixed code it falls to the dry
    // admission.)
    try {
      const qs = (((Game.data || {}).characterGen || {}).convo || {}).questions || [];
      for (const q of qs) {
        try { Game.noteAskedQ(q.id); } catch (e) {}
        if (c.askedQs.indexOf(q.id) === -1) c.askedQs.push(q.id);
      }
    } catch (e) {}
    Game.convoTurn(vid, 'dlg:more');
    const line = lastNpcLine(Game, vid);
    check('request: "Go on" does NOT serve the first-reveal line', !line.includes(MISFIT), line.slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  const opened = await openCuriousConvo(Game);
  check(`${mode}: curious convo opened`, !!opened, opened ? `vid=${opened.vid}` : 'no curious villager found');
  if (!opened) return;
  const { vid } = opened;
  let c = Game.convoGet(vid);
  check(`${mode}: question hung at open (pendingQ)`, !!(c && c.pendingQ && c.pendingQ.id), `pendingQ=${c && c.pendingQ && c.pendingQ.id}`);
  check(`${mode}: want.qid set`, !!(c && c.want && c.want.qid), `qid=${c && c.want && c.want.qid}`);
  const def = c.want.def;
  check(`${mode}: want def has engageBeat`, !!(def && typeof def.engageBeat === 'function'));

  if (mode === 'engage') {
    // Direct calls: unanswered -> null; answered -> the line.
    const beat0 = def.engageBeat.call(Game, vid);
    check('engage: unanswered engageBeat returns null', beat0 === null, `got=${String(beat0 || '').slice(0, 80)}`);
    const ch = choices(Game, vid);
    const ans = ch.find(x => x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
    check('engage: an answer is offered', !!ans, `choices=${ch.map(x => x.id).join(',')}`);
    if (!ans) return;
    Game.convoTurn(vid, ans.id);
    const beat1 = def.engageBeat.call(Game, vid);
    check('engage: answered engageBeat returns the first-reveal line', !!(beat1 && beat1.includes(MISFIT)), String(beat1 || '').slice(0, 80));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'resume') {
    // Aroha's shape (1142 d5): deflect the question, change the subject
    // (plants the want thread), then resume it from the menu.
    const ch0 = choices(Game, vid);
    const hasDeflect = ch0.some(x => x.id === 'deflect_q');
    check('resume: deflect_q offered', hasDeflect, `choices=${ch0.map(x => x.id).join(',')}`);
    if (!hasDeflect) return;
    Game.convoTurn(vid, 'deflect_q');
    c = Game.convoGet(vid);
    check('resume: want deflected (stage 3)', !!(c && c.want && (c.want.stage || 0) === 3), `stage=${c && c.want && c.want.stage}`);
    let picked = false;
    // The plant fires on a SUBJECT CHANGE (convoNoteBeat: prev thread !==
    // new thread) — dlg:subject alone never flips c.thread, so the driver
    // must pick a real topic ask (ask:personal / ask:goal / ...) to move
    // off 'want' and plant it. (Panel shape, 1142 d5: deflect, subject,
    // more, ask:personal, subject, then the resume is offered.)
    const TOPIC = ['ask:personal', 'ask:goal', 'ask:others', 'ask:gossip', 'ask:fears', 'ask:you', 'ask:lately'];
    for (let turn = 0; turn < 10 && !picked; turn++) {
      const ch = choices(Game, vid);
      const resume = ch.find(x => x.id === 'alive:thread:want');
      if (resume) {
        Game.convoTurn(vid, 'alive:thread:want');
        picked = true;
        break;
      }
      const cNow = Game.convoGet(vid);
      if (cNow && cNow.thread === 'want') {
        const topic = ch.find(x => TOPIC.includes(x.id));
        if (topic) { Game.convoTurn(vid, topic.id); continue; }
      }
      const subj = ch.find(x => x.id === 'dlg:subject');
      if (subj) { Game.convoTurn(vid, 'dlg:subject'); continue; }
      const more = ch.find(x => x.id === 'menu:more');
      if (more) { Game.convoTurn(vid, 'menu:more'); continue; }
      check('resume: alive:thread:want offered within 10 turns', false, `stuck at turn ${turn}: ${ch.map(x => x.id).join(',')}`);
      return;
    }
    check('resume: alive:thread:want offered within 10 turns', picked);
    if (!picked) return;
    const line = lastNpcLine(Game, vid);
    check('resume: resumed thread does NOT serve the first-reveal line', !line.includes(MISFIT), line.slice(0, 120));
    check('resume: resumed thread names the unfinished thread', /never did get back to that/i.test(line), line.slice(0, 120));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }

  if (mode === 'control') {
    // The answer flow must be untouched by the fix: answer, then ask
    // for more — the continuer serves the question's DEEPER beat (the
    // data-driven elaboration), never the first-reveal line and never
    // a dry line. (Every question carries a deeper + a follow, so the
    // continuer always has real content before the thread is spent;
    // the engageBeat's legit direction is proven at the source by the
    // `engage` case — answered -> the line.)
    const ch = choices(Game, vid);
    const ans = ch.find(x => x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
    check('control: an answer is offered', !!ans, `choices=${ch.map(x => x.id).join(',')}`);
    if (!ans) return;
    Game.convoTurn(vid, ans.id);
    c = Game.convoGet(vid);
    check('control: answer recorded (answered[qid])', !!(c && c.answered && c.want && c.want.qid && (c.want.qid in c.answered)), `answered=${c && JSON.stringify(c.answered)}`);
    const ch2 = choices(Game, vid);
    const more = ch2.find(x => x.id === 'dlg:more' || x.id === 'goon');
    check('control: a continuer (dlg:more/goon) is offered after answering', !!more, `choices=${ch2.map(x => x.id).join(',')}`);
    if (!more) return;
    Game.convoTurn(vid, more.id);
    const line = lastNpcLine(Game, vid);
    check('control: continuer does NOT serve the first-reveal line', !line.includes(MISFIT), line.slice(0, 120));
    check('control: continuer serves real content (not dry)', !isDry(line), line.slice(0, 120));
    // Best-effort: the served line should be the question's deeper beat.
    try {
      const qs = (((Game.data || {}).characterGen || {}).convo || {}).questions || [];
      const qd = qs.find(q => q.id === (c && c.want && c.want.qid));
      if (qd && qd.deeper) {
        const prefix = String(qd.deeper).replace(/"/g, '').split('{')[0].slice(0, 30);
        check('control: continuer serves the deeper beat', line.includes(prefix), line.slice(0, 120));
      }
    } catch (e) {}
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode && ['engage', 'resume', 'request', 'control'].includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('engage');
    for (const m of ['resume', 'request', 'control']) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-landing-r121-curious-firstreveal.js'), m],
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
