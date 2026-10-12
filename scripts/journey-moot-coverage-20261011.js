#!/usr/bin/env node
// journey-moot-coverage-20261011.js — LEG 5 SOCIAL LIFE, moot-coverage angle.
//
// Fills the documented blank from evidence/2026-10-11/journey-sociallife.md:
//   "Moots never fire in peaceful play. ~175 village-days, 0 moots, 0 votes."
// Plays a competent KLEPTO: a real player archetype (theft allowed, socially
// punished — Steve 2026-10-05). Otherwise decent (talks, shares) so the
// justice voice can use its close-friend variants. The crime signal is
// deliberate: one pack theft/day from the richest mark, via the REAL player
// path (Game.stealFrom — same call the person-card button makes).
//
// Expected natural arc: cold shoulder (heat 25) -> confrontation (heat 50) ->
// refusal -> moot demand (justiceDemandMoot) -> case (forcePlayerAccusation)
// -> trial in ~2 days (playerCaseTick/callMoot) -> verdict -> sentence ->
// aftermath. The policy answers the confrontation the way a player would:
// one day of silence, then 'refuse' via Game.justiceRespond (same function
// the person-card justiceRefuse button calls).
//
// After the first verdict the thief goes straight — the rest of the run
// observes the aftermath (trust, grief, gossip memory).
//
// SENSE-TESTING LAW: the full justice arc is captured VERBATIM (say/sysSay
// log) and dumped to text files for human reading — meaning, coherence,
// consequences, never counts.
//
// Usage: SEEDS="20261011,777" DAYCAP=60 node scripts/journey-moot-coverage-20261011.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261011, 777, 424242]);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-11');
const TXDIR = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-moot-r1';

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function trustOf(Game, vid) {
  try { const t = (Game.state.village.trust || {})[vid]; return t === undefined ? 10 : t; } catch (e) { return 10; }
}
function justiceOf(Game) {
  try { return Game.justiceState ? Game.justiceState() : {}; } catch (e) { return {}; }
}
function heatOf(Game) {
  try { return Game.justiceHeat ? Game.justiceHeat() : -1; } catch (e) { return -1; }
}
function playerCases(Game) {
  try {
    const bs = Game.betrayalState ? Game.betrayalState() : null;
    const me = Game.villagerId;
    return ((bs && bs.cases) || []).filter(c => c && c.accused && c.accused.includes(me));
  } catch (e) { return []; }
}

// Richest living mark with a pack worth taking (>= 250 kcal), excluding self.
function richestMark(Game) {
  try {
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    let best = null, bestKcal = 250;
    for (const id of (vv.roster || [])) {
      if (id === me) continue;
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      if (!p || p.dead) continue;
      let k = 0;
      try { k = Game.packKcal ? (Game.packKcal(id) || 0) : 0; } catch (e) {}
      if (k >= bestKcal) { bestKcal = k; best = id; }
    }
    return best;
  } catch (e) { return null; }
}

function makePolicy(Game, shared) {
  const pol = Object.assign({}, competent, {
    id: 'moot-coverage-klepto',
    desc: 'competent survival + decent neighbor + one pack theft/day (richest mark) until the first moot verdict; defiant at confrontation',
    setup(Game2, ctx) {
      if (competent.setup) competent.setup(Game2, ctx);
      ctx.moot = {
        thefts: 0, caught: 0, unseen: 0, arc: [], cases: [], refused: false,
        doneStealing: false, verdictDay: null, confrontDay: null,
        sayLog: [], justiceLines: [],
      };
      shared.ctx = ctx;
    },
    upkeep(Game2, ctx) { if (competent.upkeep) competent.upkeep(Game2, ctx); },
    daily(Game2, ctx) {
      if (competent.daily) competent.daily(Game2, ctx);
      const M = ctx.moot;
      const day = (Game2.state.scholar || {}).day || 0;
      ctx._stoleToday = false; // one theft per day max
      const j = justiceOf(Game2);
      const stage = j.stage || 0;
      // --- justice arc polling: record every stage/heat transition ---
      const heat = heatOf(Game2);
      const last = M.arc[M.arc.length - 1];
      if (!last || last.stage !== stage || last.heat !== heat || (j.crimes || []).length !== last.crimes) {
        M.arc.push({ day, stage, heat, crimes: (j.crimes || []).length,
          confrontedBy: j.confrontedBy ? vname(Game2, j.confrontedBy) : null,
          pendingConfront: !!j.pendingConfront, mootDemanded: !!j.mootDemanded,
          exiled: !!j.exiled });
      }
      // --- case tracking ---
      try {
        for (const c of playerCases(Game2)) {
          if (!M.cases.find(x => x.id === c.id)) {
            M.cases.push({ id: c.id, day: c.day, charge: c.charge, accuser: c.accuser ? vname(Game2, c.accuser) : null,
              status: c.status, opened: day });
          } else {
            const rec = M.cases.find(x => x.id === c.id);
            if (rec.status !== c.status || rec.resolution !== c.resolution) {
              rec.status = c.status; rec.resolution = c.resolution; rec.resolvedDay = day;
              if (c.trial) rec.trial = { convicted: !!c.trial.convicted, guilty: c.trial.finalGuilty,
                present: (c.trial.present || []).length, wildDay: !!c.trial.wildDay };
            }
          }
        }
      } catch (e) {}
      // --- exile: a real exile walks. "Take what you can carry and go" —
      // staying on Haven's ground past dawn is defiance (uprising). The
      // policy leaves the same day the sentence lands and lives wild.
      const exiled = !!((Game2.state.scholar || {}).exiled);
      if (exiled) {
        try {
          const vv2 = Game2.state.village || {};
          const hx = vv2.px ?? 4, hy = vv2.py ?? 4;
          const atHaven = Game2.map && Game2.map.px === hx && Game2.map.py === hy;
          if (atHaven && !Game2.tbfight && !ctx._exileWalked) {
            Game2.travelTo(hx + 2, hy);
            ctx._exileWalked = true;
            M.justiceLines.push({ day, kind: 'policy', text: '[policy] exiled: walked off Haven ground' });
          }
        } catch (e) {}
      }
      // --- the theft: every 3rd day from day 3 (a sustainable klepto — daily
      // robbery intercepts the harvest in transit and starves the camp before
      // the moot can fire; verified by debug). Skipped while the village is
      // already hungry, and retired after the first verdict lands.
      const verdictLanded = M.cases.some(c => c.resolution || c.status === 'resolved' || c.status === 'acquitted');
      if (verdictLanded && !M.doneStealing) { M.doneStealing = true; M.verdictDay = day; }
      const villageHungry = ((Game2.state.village || {}).hungryDays || 0) > 0;
      if (!M.doneStealing && !villageHungry && day >= 3 && day % 3 === 0 && stage < 3 && !ctx._stoleToday) {
        const mark = richestMark(Game2);
        if (mark) {
          let r = null;
          try { r = Game2.stealFrom(mark); } catch (e) {}
          if (r === 'caught' || r === 'unseen') {
            M.thefts++; ctx._stoleToday = true;
            if (r === 'caught') M.caught++; else M.unseen++;
          }
        }
      }
      // --- confrontation: one day of silence, then refuse (defiant thief) ---
      if (j.pendingConfront && !M.refused && day > (j.confrontDay || day)) {
        try {
          const r = Game2.justiceRespond('refuse');
          M.refused = true; M.refuseDay = day;
          M.justiceLines.push({ day, kind: 'policy', text: `[policy] refused the confrontation (justiceRespond -> ${JSON.stringify(r && r.ok !== undefined ? r.ok : r)})` });
        } catch (e) {}
      }
      // --- social glue: two real conversations/day so the thief has relationships ---
      try {
        const vv = Game2.state.village || {};
        const roster = (vv.roster || []).filter(id => id !== Game2.villagerId);
        let talked = 0;
        for (const vid of roster) {
          if (talked >= 2) break;
          if (Math.random() < 0.5) continue;
          try {
            Game2.talkTo(vid);
            const choices = (Game2.convoChoices && Game2.convoChoices(vid)) || [];
            // answer their question first (engage), else ask about them
            let pick = choices.find(x => x && /^gq:/.test(String(x.id || ''))) ||
                       choices.find(x => x && /^(dlg:help|dlg:details)/.test(String(x.id || ''))) ||
                       choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
            if (pick && Game2.convoTurn) Game2.convoTurn(vid, pick.id);
            try { Game2.endConvo(vid, 'left'); } catch (e2) {}
            talked++;
          } catch (e) {}
        }
      } catch (e) {}
    },
  });
  return pol;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'moot-coverage' });
  const shared = {};
  // capture say/sysSay VERBATIM (loadGame silenced them)
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  Game.say = function (t) {
    const d = dayOf(); const s = String(t == null ? '' : t);
    if (shared.ctx && shared.ctx.moot) {
      shared.ctx.moot.sayLog.push({ day: d, who: 'say', text: s });
      if (/⚖|moot|trial|verdict|guilty|confront|exile|restitution|sentence|accus/i.test(s))
        shared.ctx.moot.justiceLines.push({ day: d, kind: 'say', text: s });
    }
  };
  Game.sysSay = function (t) {
    const d = dayOf(); const s = String(t == null ? '' : t);
    if (shared.ctx && shared.ctx.moot) {
      shared.ctx.moot.sayLog.push({ day: d, who: 'sys', text: s });
      if (/moot|trial|verdict|guilty/i.test(s))
        shared.ctx.moot.justiceLines.push({ day: d, kind: 'sys', text: s });
    }
  };
  await setupGame(Game);
  const policy = makePolicy(Game, shared);
  const res = await runDays(Game, policy, { days: DAYCAP, manifest: 'moot-coverage-' + seed });
  const ctx = shared.ctx || {};
  const M = ctx.moot || {};
  // village census (plain words data)
  let census = null;
  try {
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    census = (vv.roster || []).map(id => {
      let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      return { id, name: vname(Game, id), self: id === me, dead: !!(p && p.dead),
        trust: trustOf(Game, id), temper: null };
    });
    for (const c of census) { try { c.temper = Game.npcTemper ? Game.npcTemper(c.id) : null; } catch (e) {} }
  } catch (e) {}
  // deaths (telemetry)
  let deaths = [];
  try {
    deaths = (Game.state.telemetry || []).filter(e => e && e.type === 'death')
      .map(e => ({ day: e.day, kind: e.kind, who: e.who, cause: e.cause }));
  } catch (e) {}
  const out = {
    seed, days: res.days, endReason: res.endReason,
    thefts: M.thefts, caught: M.caught, unseen: M.unseen,
    refused: !!M.refused, refuseDay: M.refuseDay || null, verdictDay: M.verdictDay,
    exiledEnd: !!((Game.state.scholar || {}).exiled),
    walkedOut: !!(shared.ctx && shared.ctx._exileWalked),
    arc: M.arc || [], cases: M.cases || [],
    justiceLineCount: (M.justiceLines || []).length,
    sayLogCount: (M.sayLog || []).length,
    deaths,
    census,
  };
  // write evidence JSON (full) + justice transcript text (sense-reading)
  try { fs.mkdirSync(OUTDIR, { recursive: true }); } catch (e) {}
  try { fs.mkdirSync(TXDIR, { recursive: true }); } catch (e) {}
  const slim = Object.assign({}, out);
  delete slim.sayLogFull;
  fs.writeFileSync(path.join(OUTDIR, `journey-moot-coverage-${seed}.json`),
    JSON.stringify(Object.assign(slim, { justiceLines: M.justiceLines || [] }), null, 1));
  const tx = [];
  tx.push(`# MOOT COVERAGE — seed ${seed} — ${res.days} days (${res.endReason})`);
  tx.push(`thefts: ${M.thefts} (caught ${M.caught}, unseen ${M.unseen})  refused: ${M.refused ? 'day ' + M.refuseDay : 'no'}  verdict day: ${M.verdictDay}`);
  tx.push('');
  tx.push('## justice arc (stage/heat per transition)');
  for (const a of (M.arc || [])) tx.push(`day ${a.day}: stage ${a.stage} heat ${a.heat} crimes ${a.crimes}` +
    (a.confrontedBy ? ` confrontedBy=${a.confrontedBy}` : '') +
    (a.mootDemanded ? ' MOOT-DEMANDED' : '') + (a.exiled ? ' EXILED' : ''));
  tx.push('');
  tx.push('## cases');
  for (const c of (M.cases || [])) tx.push(JSON.stringify(c));
  tx.push('');
  tx.push('## JUSTICE TRANSCRIPT (verbatim)');
  // Dedupe consecutive identical lines (the exiled policy retries blocked
  // pantry takes; each refusal is honest per-action, but 500 identical lines
  // bury the sense-read — keep the first of each run).
  let prev = null;
  for (const l of (M.justiceLines || [])) {
    if (l.text === prev) continue;
    prev = l.text;
    tx.push(`[day ${l.day}${l.kind === 'sys' ? ' SYS' : ''}${l.kind === 'policy' ? ' POLICY' : ''}] ${l.text}`);
  }
  fs.writeFileSync(path.join(TXDIR, `arc-${seed}.txt`), tx.join('\n'));
  return out;
}

(async () => {
  const summary = [];
  for (const seed of SEEDS) {
    try {
      const r = await runSeed(seed);
      summary.push({ seed, days: r.days, end: r.endReason, thefts: r.thefts,
        caught: r.caught, unseen: r.unseen, refused: r.refused,
        verdictDay: r.verdictDay,
        cases: r.cases.map(c => `${c.charge}/${c.status || '?'}${c.resolution ? ':' + c.resolution : ''}`),
        deaths: (r.deaths || []).map(d => `d${d.day}:${d.who}:${d.cause || d.kind}`),
        arc: r.arc.map(a => `d${a.day}:s${a.stage}h${a.heat}`) });
      console.log(JSON.stringify(summary[summary.length - 1]));
    } catch (e) {
      console.log(JSON.stringify({ seed, error: String(e && e.message || e) }));
      summary.push({ seed, error: String(e && e.message || e) });
    }
  }
  try { fs.mkdirSync(OUTDIR, { recursive: true }); } catch (e) {}
  fs.writeFileSync(path.join(OUTDIR, 'journey-moot-coverage-summary.json'), JSON.stringify(summary, null, 1));
  console.log('SUMMARY: ' + JSON.stringify(summary.map(s => s.seed + ':' + (s.error || (s.cases.length ? s.cases.join('|') : 'no-case')))));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
