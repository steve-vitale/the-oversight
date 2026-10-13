#!/usr/bin/env node
// journey-social-r11-askfreq-20261013.js — LEG 5 SOCIAL LIFE, r11 (ask-frequency probe).
// Pre-registration:
//   QUESTION: among the 28 bespoke questions with NO recall (r10's long tail),
//     which are asked most often in natural play? r11 fills the blank by adding
//     answer-specific `recalls` maps to the top-asked ones, prioritized by ask
//     frequency, not list order (r10 watch item 3).
//   BONUS blank: q_scared's `"when": "scared"` gate never fired in 3x60d
//     (r10 watch item 1). Does the scared mood ever occur at all in natural
//     play? If not, the question is dead content by construction.
//   INTERESTING FINDING: a no-recall question in the top-asked tier, the scared
//     mood occurring (or provably never occurring), or recall-openable content
//     patterns (e.g. smallTalk-tagged questions that would misfire recalls).
//   SEEDS: 808, 909, 1010, 1111, 1212, 1313 x DAYCAP=60, death-aware stop.
//   POLICY: socialite + one full driveOne convo per villager per day (r9/r10
//     pattern, so frequencies are comparable across runs). Driver answers
//     every bespoke question with the first non-opt-out answer.
// Output: evidence/2026-10-13/journey-social-r11-askfreq-<seed>.json +
//   journey-social-r11-askfreq.json (aggregate)
// Usage: SEEDS=808,909,1010 DAYCAP=60 node scripts/journey-social-r11-askfreq-20261013.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [808, 909, 1010, 1111, 1212, 1313]);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-13');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }

function driveOne(Game, vid, tag, convoLog, stats) {
  const day = (() => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } })();
  const out = { vid, tag, day, turns: 0, naturalEnd: false, asked: [], answered: [], transcript: [] };
  const askedSet = new Set();
  let mood = '';
  try { mood = (Game.npcMood && Game.npcMood(vid)) || ''; } catch (e) {}
  out.mood = mood;
  stats.moodCount[mood] = (stats.moodCount[mood] || 0) + 1;
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
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
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
        out.asked.push({
          qid,
          askLine: askLineOf().slice(0, 300),
          offers: ansChoices.map(x => ({ id: String(x.id).split(':')[2], label: String(x.label || '').slice(0, 200) })),
          mood,
        });
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
      out.answered.push({ qid: parts[1], aid: parts[2], mood });
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
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r11', fullTelemetry: true });
  const curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

  const cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'characterGen.json'), 'utf8'));
  const noRecall = new Set();
  const qMeta = {};
  for (const q of (cg.convo && cg.convo.questions) || []) {
    qMeta[q.id] = { minTrust: q.minTrust || 0, minDay: q.minDay || 0, when: q.when || null, smallTalk: !!q.smallTalk };
    if (!q.recalls) noRecall.add(q.id);
  }

  const stats = {
    askedTotal: 0, answeredTotal: 0, perQid: {}, moodCount: {},
    askExamples: {}, // qid -> up to 3 {askLine, offers, answeredAid}
  };
  function bumpQid(qid, field) {
    stats.perQid[qid] = stats.perQid[qid] || { asked: 0, answered: 0 };
    stats.perQid[qid][field]++;
  }
  const convoLog = [];

  function driveConvos() {
    const vv = Game.state.village || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    for (const vid of roster) {
      const out = driveOne(Game, vid, 'warmup', convoLog, stats);
      for (const a of out.asked) {
        stats.askedTotal++; bumpQid(a.qid, 'asked');
        if (noRecall.has(a.qid)) {
          stats.askExamples[a.qid] = stats.askExamples[a.qid] || [];
          if (stats.askExamples[a.qid].length < 3) {
            stats.askExamples[a.qid].push({ askLine: a.askLine, offers: a.offers, answeredAid: null, mood: a.mood });
          }
        }
      }
      for (const a of out.answered) {
        stats.answeredTotal++; bumpQid(a.qid, 'answered');
        if (noRecall.has(a.qid) && stats.askExamples[a.qid]) {
          const ex = stats.askExamples[a.qid].find(e => !e.answeredAid);
          if (ex) ex.answeredAid = a.aid;
        }
      }
    }
  }

  await setupGame(Game);
  const pol = Object.assign({}, socialite, {
    id: 'journey-social-r11',
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

  const evidence = { seed, daycap: DAYCAP, ms, end, stats: { askedTotal: stats.askedTotal, answeredTotal: stats.answeredTotal, perQid: stats.perQid, moodCount: stats.moodCount, askExamples: stats.askExamples, qMeta } };
  return evidence;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const all = [];
  for (const seed of SEEDS) {
    console.log(`=== seed ${seed} (DAY_CAP=${DAYCAP}) ===`);
    const ev = await oneSeed(seed);
    console.log(`  days=${ev.end.day} alive=${ev.end.alive} outcome=${ev.end.outcome} asked=${ev.stats.askedTotal} answered=${ev.stats.answeredTotal} convos=${Object.values(ev.stats.moodCount).reduce((a, b) => a + b, 0)}`);
    fs.writeFileSync(path.join(OUTDIR, `journey-social-r11-askfreq-${seed}.json`), JSON.stringify(ev, null, 1));
    all.push(ev);
  }
  const agg = { seeds: SEEDS, daycap: DAYCAP, runs: all.map(e => ({ seed: e.seed, end: e.end, perQid: e.stats.perQid, moodCount: e.stats.moodCount })) };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r11-askfreq.json'), JSON.stringify(agg, null, 1));
  console.log('wrote aggregate', path.join(OUTDIR, 'journey-social-r11-askfreq.json'));
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
