#!/usr/bin/env node
// journey-social-r10-recall-20261013.js — LEG 5 SOCIAL LIFE, r10.
// Pre-registration:
//   QUESTION: the four canon questions (q_plan/q_scared/q_miss/q_think) now have
//     answer-specific `recalls` maps, and the dead-data generic recalls on
//     q_hands/q_theory are live via the generalized recall opener loop in
//     conversation.js (see test-qrecall-canon-20261013.js, ALL GREEN). Does the
//     "they remembered" opener fire in NATURAL play, and do the recalled lines
//     read as real memory (answer-specific, opt-out-gated) rather than
//     fabricated history?
//   INTERESTING FINDING: recalls never firing in 60d of natural talk (dead
//     data again), a recall misquoting the player's answer, a recall firing on
//     an opt-out answer, or a recall opener reading robotic in a full arc.
//   SEEDS: 505, 606, 707 (r9 talk seeds) x DAYCAP=60, death-aware stop.
//   POLICY: socialite (competent + talks/feasts/moots) + one full driveOne
//     convo per villager per day (r9 pattern). Driver answers every bespoke
//     question with the first non-opt-out answer.
//   HORIZON: 60d is enough for ask->answer->recall arcs (recall fires on the
//     next convo after a question is answered).
// Output: evidence/2026-10-13/journey-social-r10-recall-<seed>.json +
//   journey-social-r10-recall.json (aggregate)
// Usage: SEEDS=505,606,707 DAYCAP=60 node scripts/journey-social-r10-recall-20261013.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [505, 606, 707]);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-13');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }

// --- conversation driver: one full exchange per villager (r7/r9 driveOne pattern) ---
function driveOne(Game, vid, tag, convoLog) {
  const day = (() => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } })();
  const out = { vid, tag, day, turns: 0, naturalEnd: false, asked: [], answered: [], transcript: [] };
  const askedSet = new Set();
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  const askLineOf = () => {
    try {
      const c = Game.convoGet(vid);
      const tr = (c && c.transcript) || [];
      for (let i = tr.length - 1; i >= 0; i--) {
        if (tr[i].who !== 'you' && tr[i].text) return String(tr[i].text);
      }
    } catch (e) {}
    return '';
  };
  for (let t = 0; t < 12; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
    if (ansChoices.length) {
      const qid = String(ansChoices[0].id).split(':')[1];
      if (!askedSet.has(qid)) {
        askedSet.add(qid);
        out.asked.push({ qid, askLine: askLineOf().slice(0, 300), offers: ansChoices.map(x => String(x.id).split(':')[2]) });
      }
    }
    let pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices[0];
    if (!pick) break;
    const pid = String(pick.id || '');
    if (/^ans:/.test(pid) && !/honest_pass/.test(pid)) {
      const parts = pid.split(':');
      out.answered.push({ qid: parts[1], aid: parts[2] });
    }
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
  }
  if (!out.naturalEnd && out.turns >= 12) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  try {
    const c = Game.convoGet(vid);
    const tr = ((c && c.transcript) || []);
    out.transcript = tr.map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '') }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function oneSeed(seed) {
  const t0 = Date.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r10', fullTelemetry: true });
  const curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

  // recall signature set, loaded from the same data the game reads
  const cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'characterGen.json'), 'utf8'));
  const recallSigs = []; // {qid, aid, sig}
  for (const q of (cg.convo && cg.convo.questions) || []) {
    if (q.recalls) for (const [aid, text] of Object.entries(q.recalls)) {
      // sig = literal prefix before any {placeholder} — the game substitutes
      // {region} with the player's home region, so a verbatim sig can never
      // match the rendered line (r10 detector bug on q_origin).
      const raw = String(text).replace(/"/g, '');
      const sig = raw.split('{')[0].slice(0, 45);
      recallSigs.push({ qid: q.id, aid, sig });
    }
  }

  const qa = { askedTotal: 0, answeredTotal: 0, perQid: {}, recallHits: [], recallConvos: [] };
  function bumpQid(qid, field) {
    qa.perQid[qid] = qa.perQid[qid] || { asked: 0, answered: 0, recalled: 0 };
    qa.perQid[qid][field]++;
  }
  const convoLog = [];
  const answeredPairs = new Map(); // vid -> Map(qid -> {aid, day}) for arc assembly

  function driveConvos() {
    const vv = Game.state.village || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    for (const vid of roster) {
      const out = driveOne(Game, vid, 'warmup', convoLog);
      for (const a of out.asked) { qa.askedTotal++; bumpQid(a.qid, 'asked'); }
      for (const a of out.answered) {
        qa.answeredTotal++; bumpQid(a.qid, 'answered');
        if (!answeredPairs.has(vid)) answeredPairs.set(vid, new Map());
        answeredPairs.get(vid).set(a.qid, { aid: a.aid, day: out.day });
      }
      // recall detection: any NPC line matching a known recall signature
      for (const e of out.transcript) {
        if (e.who !== 'NPC') continue;
        const clean = e.text.replace(/"/g, '');
        const hit = recallSigs.find(s => clean.indexOf(s.sig) !== -1);
        if (hit) {
          const prev = (answeredPairs.get(vid) || new Map()).get(hit.qid);
          qa.recallHits.push({
            day: out.day, vid: vname(Game, vid), qid: hit.qid, aid: hit.aid,
            answeredAid: prev ? prev.aid : null, answeredDay: prev ? prev.day : null,
            match: hit.aid === (prev && prev.aid), text: e.text.slice(0, 320),
          });
          bumpQid(hit.qid, 'recalled');
          if (qa.recallConvos.length < 12) {
            qa.recallConvos.push({ day: out.day, vid: vname(Game, vid), qid: hit.qid, aid: hit.aid, transcript: out.transcript.slice(0, 24) });
          }
        }
      }
    }
  }

  await setupGame(Game);
  const pol = Object.assign({}, socialite, {
    id: 'journey-social-r10',
    daily(Game2, ctx) {
      if (socialite.daily) socialite.daily(Game2, ctx);
      driveConvos();
      ctx.socialConvs = convoLog.length;
    },
  });

  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Date.now() - t0;
  const end = (() => {
    try {
      const vv = Game.state.village || {};
      const alive = (vv.roster || []).length;
      return { day: curDay(), alive, outcome: (result && result.outcome) || null };
    } catch (e) { return { day: curDay(), alive: -1 }; }
  })();

  const evidence = { seed, daycap: DAYCAP, ms, end, qa: {
    askedTotal: qa.askedTotal, answeredTotal: qa.answeredTotal,
    perQid: qa.perQid, recallHits: qa.recallHits, recallConvos: qa.recallConvos,
  } };
  return evidence;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const all = [];
  for (const seed of SEEDS) {
    console.log(`=== seed ${seed} (DAY_CAP=${DAYCAP}) ===`);
    const ev = await oneSeed(seed);
    console.log(`  days=${ev.end.day} alive=${ev.end.alive} outcome=${ev.end.outcome} asked=${ev.qa.askedTotal} answered=${ev.qa.answeredTotal} recalls=${ev.qa.recallHits.length}`);
    fs.writeFileSync(path.join(OUTDIR, `journey-social-r10-recall-${seed}.json`), JSON.stringify(ev, null, 1));
    all.push(ev);
  }
  const agg = { seeds: SEEDS, daycap: DAYCAP, runs: all.map(e => ({ seed: e.seed, end: e.end, perQid: e.qa.perQid, nRecall: e.qa.recallHits.length })) };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r10-recall.json'), JSON.stringify(agg, null, 1));
  console.log('wrote aggregate', path.join(OUTDIR, 'journey-social-r10-recall.json'));
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
