#!/usr/bin/env node
// journey-social-r13-pilot-20261014.js — LEG 5 SOCIAL LIFE, r13 pilot.
// Pre-registration: see evidence/2026-10-14/run-journey-social.md header.
//   M1 (blank hunt): topicLeaks — NPC speech lines that reuse a t2
//     ask-question label as a topic noun ("We started on Who's on your mind
//     around here?..."). GO: pre-fix pilot >0, post-fix proof = 0.
//   M2 (people check): 8 full transcripts sense-read against the quality bar.
// Policy: socialite + one full driveOne convo per villager per day.
// Usage: SEEDS=515,626,737 DAYCAP=60 node scripts/journey-social-r13-pilot-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [515, 626, 737]);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-14');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }

// A leaked-topic line: NPC names a menu-question phrase as the topic noun.
const LEAK_RE = /we (started on|were talking about|never finished talking about|left \S+ hanging|settle[ds]? (feels|\S*))[^"“”'«»]{0,90}\?/i;
const TOPIC_FRAME_RE = /we (started on|were talking about|never finished talking about|still on|talking about)/i;

function driveOne(Game, vid, tag, convoLog) {
  const day = (() => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } })();
  const out = { vid, tag, day, turns: 0, naturalEnd: false, recapPicked: 0, transcript: [] };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  for (let t = 0; t < 12; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    // Prefer recap once per convo (turn>=3) so recap beats fire in natural play.
    let pick = null;
    if (t >= 3 && out.recapPicked === 0) {
      pick = choices.find(x => x && /^recap$/.test(String(x.id || '')));
      if (pick) out.recapPicked = 1;
    }
    if (!pick) {
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^ask:/.test(String(x.id || '')));  // t2 topics
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    }
    if (!pick) break;
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
  }
  if (!out.naturalEnd && out.turns >= 12) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
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
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r13p', fullTelemetry: true });
  const curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

  const convoLog = [];
  const topicLeaks = [];
  const askedTotal = { n: 0 }, answeredTotal = { n: 0 };
  let sampled = 0;

  function driveConvos() {
    const vv = Game.state.village || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    for (const vid of roster) {
      const out = driveOne(Game, vid, 'daily', convoLog);
      // leak scan: NPC lines only
      for (const e of out.transcript) {
        if (e.who !== 'NPC') continue;
        const clean = e.text.replace(/"/g, '');
        if (LEAK_RE.test(clean)) {
          topicLeaks.push({ day: out.day, vid: vname(Game, vid), turns: out.turns, text: e.text.slice(0, 260) });
        }
      }
      // count questions/answers for telemetry comparability with r12
      const tr = out.transcript;
      for (const e of tr) {
        if (e.who === 'YOU' && /^"/.test(e.text)) askedTotal.n += /ans:/i.test(e.text) ? 0 : 0;
      }
    }
  }

  await setupGame(Game);
  const pol = Object.assign({}, socialite, {
    id: 'journey-social-r13p',
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
  // sample transcripts spread across days/villagers for the people check
  const spread = [];
  const byVidDay = {};
  for (const o of convoLog) {
    const key = o.vid + ':' + Math.floor(o.day / 10);
    if (!byVidDay[key] && o.turns >= 3 && o.transcript.length >= 6 && spread.length < 12) {
      byVidDay[key] = 1; spread.push(o);
    }
  }
  const out = { seed, daycap: DAYCAP, ms, endReason: result ? result.endReason : null, end,
    topicLeaks, nConvos: convoLog.length, transcripts: spread };
  fs.writeFileSync(path.join(OUTDIR, `journey-social-r13-pilot-${seed}.json`), JSON.stringify(out, null, 1));
  console.log(`seed ${seed}: day=${end.day} alive=${end.alive} fallen=${end.fallen} convos=${convoLog.length} leaks=${topicLeaks.length} sampled=${spread.length} (${ms}ms)`);
  return out;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const all = [];
  for (const seed of SEEDS) all.push(await oneSeed(seed));
  const agg = {
    seeds: SEEDS, daycap: DAYCAP,
    'topicLeaks': all.reduce((a, e) => a + e.topicLeaks.length, 0),
    'nConvos': all.reduce((a, e) => a + e.nConvos, 0),
    'end.day': all.reduce((a, e) => a + e.end.day, 0),
    'end.alive': all.reduce((a, e) => a + (e.end.alive < 0 ? 0 : e.end.alive), 0),
    runs: all.map(e => ({ seed: e.seed, end: e.end, leaks: e.topicLeaks.length, nConvos: e.nConvos })),
  };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r13-pilot.json'), JSON.stringify(agg, null, 1));
  console.log('aggregate:', JSON.stringify(agg));
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
