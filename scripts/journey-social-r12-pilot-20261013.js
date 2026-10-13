#!/usr/bin/env node
// journey-social-r12-pilot-20261013.js — LEG 5 SOCIAL LIFE, r12 pilot.
// Pre-registration:
//   QUESTION: do the 11 new answer-specific `recalls` maps (q_angry, q_read,
//     q_skill, q_alone_time, q_laugh_memory, q_first_week, q_fight, q_laugh,
//     q_someone, q_quiet, q_night) fire in NATURAL play, and do they read as
//     real memory (answer-matched, opt-out-gated) rather than fabricated
//     history?
//   INTERESTING FINDING: recalls never firing (dead data), a recall misquoting
//     the player's answer, a recall firing on an opt-out, or a recall opener
//     reading robotic in a full arc.
//   SEEDS: 505, 606, 707 (r10's seeds, for comparability) x DAYCAP=60,
//     death-aware stop.
//   POLICY: socialite + one full driveOne convo per villager per day (r9/r10
//     pattern). Driver answers every bespoke question with the first
//     non-opt-out answer.
// Output: evidence/2026-10-13/journey-social-r12-pilot-<seed>.json +
//   journey-social-r12-pilot.json (aggregate, telemetry-baseline shape)
// Usage: SEEDS=505,606,707 DAYCAP=60 node scripts/journey-social-r12-pilot-20261013.js
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
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r12p', fullTelemetry: true });
  const curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

  const cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'characterGen.json'), 'utf8'));
  const recallSigs = [];
  for (const q of (cg.convo && cg.convo.questions) || []) {
    if (q.recalls) for (const [aid, text] of Object.entries(q.recalls)) {
      const raw = String(text).replace(/\"/g, '');
      const sig = raw.split('{')[0].slice(0, 45);
      recallSigs.push({ qid: q.id, aid, sig });
    }
  }
  const NEW11 = new Set(['q_first_memory','q_song','q_change','q_useful','q_dream','q_fun','q_system_fear','q_kindness','q_guilty','q_regret','q_hope','q_before_skill','q_left_behind','q_believe','q_stay','q_teach_me','q_name_day']);

  const qa = { askedTotal: 0, answeredTotal: 0, recallHits: [], recallConvos: [], newRecallHits: 0 };
  const answeredPairs = new Map();
  const convoLog = [];

  function driveConvos() {
    const vv = Game.state.village || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    for (const vid of roster) {
      const out = driveOne(Game, vid, 'warmup', convoLog);
      qa.askedTotal += out.asked.length;
      qa.answeredTotal += out.answered.length;
      for (const a of out.answered) {
        if (!answeredPairs.has(vid)) answeredPairs.set(vid, new Map());
        answeredPairs.get(vid).set(a.qid, { aid: a.aid, day: out.day });
      }
      for (const e of out.transcript) {
        if (e.who !== 'NPC') continue;
        const clean = e.text.replace(/\"/g, '');
        const hit = recallSigs.find(s => clean.indexOf(s.sig) !== -1);
        if (hit) {
          const prev = (answeredPairs.get(vid) || new Map()).get(hit.qid);
          const isNew = NEW11.has(hit.qid);
          if (isNew) qa.newRecallHits++;
          qa.recallHits.push({
            day: out.day, vid: vname(Game, vid), qid: hit.qid, aid: hit.aid, isNew,
            answeredAid: prev ? prev.aid : null, answeredDay: prev ? prev.day : null,
            match: hit.aid === (prev && prev.aid), text: e.text.slice(0, 320),
          });
          if (isNew && qa.recallConvos.length < 14) {
            qa.recallConvos.push({ day: out.day, vid: vname(Game, vid), qid: hit.qid, aid: hit.aid, transcript: out.transcript.slice(0, 24) });
          }
        }
      }
    }
  }

  await setupGame(Game);
  const pol = Object.assign({}, socialite, {
    id: 'journey-social-r12p',
    daily(Game2, ctx) {
      if (socialite.daily) socialite.daily(Game2, ctx);
      driveConvos();
      ctx.socialConvs = convoLog.length;
    },
  });

  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Date.now() - t0;
  const endReason = result ? result.endReason : null;
  const end = (() => {
    try {
      const vv = Game.state.village || {};
      const alive = (vv.roster || []).length;
      const fallen = ((Game.state.dead || []).length) || 0;
      return { day: curDay(), alive, fallen, outcome: (result && result.outcome) || null };
    } catch (e) { return { day: curDay(), alive: -1 }; }
  })();
  return { seed, daycap: DAYCAP, ms, endReason, end, qa: { askedTotal: qa.askedTotal, answeredTotal: qa.answeredTotal, recallHits: qa.recallHits, newRecallHits: qa.newRecallHits, recallConvos: qa.recallConvos } };
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const all = [];
  for (const seed of SEEDS) {
    console.log(`=== seed ${seed} (DAY_CAP=${DAYCAP}) ===`);
    const ev = await oneSeed(seed);
    console.log(`  days=${ev.end.day} alive=${ev.end.alive} fallen=${ev.end.fallen} asked=${ev.qa.askedTotal} answered=${ev.qa.answeredTotal} recalls=${ev.qa.recallHits.length} new11=${ev.qa.newRecallHits}`);
    fs.writeFileSync(path.join(OUTDIR, `journey-social-r12-pilot-${seed}.json`), JSON.stringify(ev, null, 1));
    all.push(ev);
  }
  // aggregate in the telemetry-baseline shape for the social leg
  const agg = {
    seeds: SEEDS, daycap: DAYCAP,
    'qa.askedTotal': all.reduce((a, e) => a + e.qa.askedTotal, 0),
    'qa.answeredTotal': all.reduce((a, e) => a + e.qa.answeredTotal, 0),
    'qa.recallHits': all.reduce((a, e) => a + e.qa.recallHits.length, 0),
    'end.day': all.reduce((a, e) => a + e.end.day, 0),
    'end.alive': all.reduce((a, e) => a + (e.end.alive < 0 ? 0 : e.end.alive), 0),
    runs: all.map(e => ({ seed: e.seed, end: e.end, newRecallHits: e.qa.newRecallHits, nRecall: e.qa.recallHits.length })),
  };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r12-pilot.json'), JSON.stringify(agg, null, 1));
  console.log('wrote aggregate', path.join(OUTDIR, 'journey-social-r12-pilot.json'));
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
