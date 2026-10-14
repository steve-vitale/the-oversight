#!/usr/bin/env node
// journey-social-r14-pilot-20261014.js — LEG 5 SOCIAL LIFE, r14 pilot.
// Pre-registration: see evidence/2026-10-14/run-journey-social-r14.md.
//   M1 (blank hunt): curiousResumeCoherent — every curious-seed resume in
//     natural play must (a) re-hang the SAME question id the player walked
//     away from, (b) name the question (no generic "that question").
//     Pre-fix reproduction: the RED proof (test-curious-seed-resume) showed
//     q_hope -> q_skill + "About that question". Post-fix natural play: 0.
//   M2 (people check): 8 full transcripts sense-read vs the quality bar.
// Policy: socialite + one full driveOne convo per villager per day (r13
// pattern). qa counters restored per r13 metric-review note.
// Usage: SEEDS=818,929,1040 DAYCAP=60 node scripts/journey-social-r14-pilot-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [818, 929, 1040]);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-14');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }

function driveOne(Game, vid, tag, convoLog, resumeTrack) {
  const day = (() => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } })();
  const out = { vid, tag, day, turns: 0, naturalEnd: false, asked: [], answered: [], transcript: [] };
  const askedSet = new Set();
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  // --- curious-resume check: did THIS convo open by resuming a seed?
  try {
    const c0 = Game.convoGet(vid);
    const tr0 = (c0 && c0.transcript) || [];
    const npc0 = tr0.filter(e => e && e.who !== 'you');
    const openLine = npc0.length ? String(npc0[0].text || '') : '';
    const pend = (c0 && c0.pendingQ) || null;
    const prev = resumeTrack[vid];
    if (prev && /^"About /.test(openLine)) {
      const okId = pend && pend.id === prev.qid;
      const named = !/that question/i.test(openLine);
      resumeTrack.resumes.push({
        vid: vname(Game, vid), day, prevQid: prev.qid, hungQid: pend ? pend.id : null,
        sameQuestion: !!okId, named: !!named, opener: openLine.slice(0, 220),
      });
      delete resumeTrack[vid];
    } else if (prev) {
      // seed expired or want didn't surface — drop the expectation
      delete resumeTrack[vid];
    }
  } catch (e) {}
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
    // Prefer recap once per convo (turn>=3) so recap beats fire.
    let pick = null;
    if (t >= 3 && !out.recapPicked) {
      pick = choices.find(x => x && /^recap$/.test(String(x.id || '')));
      if (pick) out.recapPicked = 1;
    }
    if (!pick) {
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (ansChoices.length) {
        const qid = String(ansChoices[0].id).split(':')[1];
        if (!askedSet.has(qid)) {
          askedSet.add(qid);
          out.asked.push({ qid, askLine: askLineOf().slice(0, 300), offers: ansChoices.map(x => String(x.id).split(':')[2]) });
        }
      }
      pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^ask:/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    }
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
  // --- curious-seed expectation: did walking away plant a curious seed?
  try {
    const seed = (((Game.state || {}).village || {}).convoSeeds || {})[vid] || null;
    if (seed && seed.wantId === 'curious' && seed.qid) {
      resumeTrack[vid] = { qid: seed.qid, day, note: seed.note };
    }
  } catch (e) {}
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({
      who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || ''),
    }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function oneSeed(seed) {
  const t0 = Date.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r14p', fullTelemetry: true });
  const curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

  const cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'characterGen.json'), 'utf8'));
  const recallSigs = [];
  for (const q of (cg.convo && cg.convo.questions) || []) {
    if (q.recalls) for (const [aid, text] of Object.entries(q.recalls)) {
      const raw = String(text).replace(/\\"/g, '');
      recallSigs.push({ qid: q.id, aid, sig: raw.split('{')[0].slice(0, 45) });
    }
  }

  const qa = { askedTotal: 0, answeredTotal: 0, recallHits: [] };
  const answeredPairs = new Map();
  const convoLog = [];
  const resumeTrack = { resumes: [] };

  function driveConvos() {
    const vv = Game.state.village || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    const day = curDay();
    for (const vid of roster) {
      const out = driveOne(Game, vid, 'daily', convoLog, resumeTrack);
      qa.askedTotal += out.asked.length;
      qa.answeredTotal += out.answered.length;
      for (const a of out.answered) {
        if (!answeredPairs.has(vid)) answeredPairs.set(vid, new Map());
        answeredPairs.get(vid).set(a.qid, { aid: a.aid, day: out.day });
      }
      for (const e of out.transcript) {
        if (e.who !== 'NPC') continue;
        const clean = e.text.replace(/\\"/g, '');
        const hit = recallSigs.find(s => clean.indexOf(s.sig) !== -1);
        if (hit) {
          const prev = (answeredPairs.get(vid) || new Map()).get(hit.qid);
          qa.recallHits.push({
            day: out.day, vid: vname(Game, vid), qid: hit.qid, aid: hit.aid,
            answeredAid: prev ? prev.aid : null, answeredDay: prev ? prev.day : null,
            match: hit.aid === (prev && prev.aid), text: e.text.slice(0, 200),
          });
        }
      }
    }
    // WALKAWAY PROBE (r14): once per seed (day 5, first villager), walk away
    // from a hanging bespoke question so the curious seed -> resume path
    // fires in natural play. The fix must hold in the live flow, not just
    // the targeted proof.
    if (day === 5 && roster.length && !walkawayProbe.done) {
      walkawayProbe.done = true;
      walkawayProbeFn(Game, roster[0], day, resumeTrack);
    }
  }

  function walkawayProbeFn(Game, vid, day, resumeTrack) {
    try { Game.startConvo(vid); } catch (e) { return; }
    let hung = null;
    try { const c = Game.convoGet(vid); hung = c && c.pendingQ ? c.pendingQ.id : null; } catch (e) {}
    for (let t = 0; t < 3 && !hung; t++) {
      let cc = null; try { cc = Game.convoGet(vid); } catch (e) {}
      if (!cc || !cc.active) break;
      let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
      if (!choices.length) break;
      // deliberately do NOT answer: pick a neutral non-answer choice
      let pick = choices.find(x => x && /^(dlg:help|dlg:details)/.test(String(x.id || '')))
        || choices.find(x => x && !/^(ans:|leave|bye|goodbye|silence)/.test(String(x.id || '')))
        || choices[0];
      if (!pick || /^(leave|bye|goodbye)/.test(String(pick.id || ''))) break;
      try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
      try { const c2 = Game.convoGet(vid); hung = c2 && c2.pendingQ ? c2.pendingQ.id : null; } catch (e) {}
    }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    if (hung) {
      try {
        const seed = (((Game.state || {}).village || {}).convoSeeds || {})[vid] || null;
        if (seed && seed.wantId === 'curious' && seed.qid) {
          resumeTrack[vid] = { qid: seed.qid, day, note: seed.note, probed: true };
          console.log(`  [probe] walked away from ${seed.qid} (day ${day}); seed note: "${seed.note}"`);
        }
      } catch (e) {}
    }
  }
  const walkawayProbe = { done: false };

  await setupGame(Game);
  const pol = Object.assign({}, socialite, {
    id: 'journey-social-r14p',
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
      return { day: curDay(), alive: (vv.roster || []).length, fallen: ((Game.state.dead || []).length) || 0, outcome: (result && result.outcome) || null };
    } catch (e) { return { day: curDay(), alive: -1 }; }
  })();
  const spread = [];
  const byVidDay = {};
  for (const o of convoLog) {
    const key = o.vid + ':' + Math.floor(o.day / 10);
    if (!byVidDay[key] && o.turns >= 3 && o.transcript.length >= 6 && spread.length < 12) {
      byVidDay[key] = 1; spread.push(o);
    }
  }
  const out = {
    seed, daycap: DAYCAP, ms, endReason: result ? result.endReason : null, end,
    nConvos: convoLog.length,
    qa: { askedTotal: qa.askedTotal, answeredTotal: qa.answeredTotal, recallHits: qa.recallHits.length },
    curiousResumes: resumeTrack.resumes,
    transcripts: spread,
  };
  fs.writeFileSync(path.join(OUTDIR, `journey-social-r14-pilot-${seed}.json`), JSON.stringify(out, null, 1));
  const bad = resumeTrack.resumes.filter(r => !r.sameQuestion || !r.named);
  console.log(`seed ${seed}: day=${end.day} alive=${end.alive} fallen=${end.fallen} convos=${convoLog.length} asked=${qa.askedTotal} answered=${qa.answeredTotal} recalls=${qa.recallHits.length} resumes=${resumeTrack.resumes.length} badResumes=${bad.length} (${ms}ms)`);
  return out;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const all = [];
  for (const seed of SEEDS) all.push(await oneSeed(seed));
  const resumes = all.flatMap(e => e.curiousResumes);
  const bad = resumes.filter(r => !r.sameQuestion || !r.named);
  const agg = {
    seeds: SEEDS, daycap: DAYCAP,
    'qa.askedTotal': all.reduce((a, e) => a + e.qa.askedTotal, 0),
    'qa.answeredTotal': all.reduce((a, e) => a + e.qa.answeredTotal, 0),
    'qa.recallHits': all.reduce((a, e) => a + e.qa.recallHits, 0),
    'end.day': all.reduce((a, e) => a + e.end.day, 0),
    'end.alive': all.reduce((a, e) => a + (e.end.alive < 0 ? 0 : e.end.alive), 0),
    nConvos: all.reduce((a, e) => a + e.nConvos, 0),
    curiousResumes: resumes.length,
    badCuriousResumes: bad.length,
    runs: all.map(e => ({ seed: e.seed, end: e.end, nConvos: e.nConvos, resumes: e.curiousResumes.length })),
  };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r14-pilot.json'), JSON.stringify(agg, null, 1));
  console.log('aggregate:', JSON.stringify(agg));
  if (bad.length) {
    console.log('BAD RESUMES:');
    for (const r of bad.slice(0, 10)) console.log('  ' + JSON.stringify(r));
  }
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
