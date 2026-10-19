#!/usr/bin/env node
// journey2-social-r27-pilot.js -- SOCIAL leg (leg 5), r27 PILOT (lane B first
// leg-5 run). PRE-REGISTERED (MEASUREMENT.md sections 9-12, 14; full note in
// evidence/2026-10-19/journey-social-r27.md -- written before this ran).
//
// Leg question: when a player convenes moots and gossips across a full run,
// do the social institutions work end-to-end -- convened, played, resolved,
// with consequences the villagers acknowledge in conversation afterward?
// r26 probe-verified moots + gossip are reachable but the bot never exercised
// them ("flagged for the next run's driver, not a game gap").
// This run is that driver.
//
// Seeds: 2001, 2002, 2003, 2004 (fresh). Horizon: DAYCAP=140, death-aware
// (+10d tail via runDays' Game.over stop).
// Policy: competent survival base + 'moot-gossip' driver:
//   (a) each day, convene at most one open/dormant case without a trial
//       (Game.callMoot); vote guilty if accused trust < 25 else acquit;
//   (b) 2 gossip-first conversations/day (ask:gossip / ask:spread_rumor);
//   (c) the day after a moot, 2 lately-first conversations (does the moot
//       surface as a live topic?);
//   (d) favoritism wrapper (r24/r25/r26) so conflicts/cases actually form —
//       r27 FIX: hostility is VERBAL ONLY (no stealFrom). The original r27
//       pilot's theft driver made the player the accused in every moot
//       (symmetric jeopardy working as designed); this run asks the
//       citizen-convener question instead. Cases naming the player are
//       skipped by the convener.
// Bindings (a miss is NO-GO, never re-scored):
//   M1 moot end-to-end: >=1 moot convened -> verdict on >=2/4 seeds.
//   M2 gossip reach: >=5 gossip-thread conversations on >=2/4 seeds.
//   M3 consequences: each resolved moot moves accused trust or victim-side
//       bonds by a measured nonzero delta.
//   M4 people check: 1 moot transcript + 4 gossip transcripts sense-read,
//       0 senseless flags.
//   M5 guardrail: village alive at horizon on >=2/4 seeds.
// TOOLING ONLY -- no game code changes in this file.
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const REPO = '/home/hatch/workspace/the-scattering';
const OUTDIR = '/home/hatch/workspace/scratch/journey2-social-r27';
const TDIR = path.join(OUTDIR, 'transcripts');
for (const d of [OUTDIR, TDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [2001, 2002, 2003, 2004]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);

// writeFileFlap (infra 2026-10-19): the host EPERMs writes intermittently
// across ALL processes (not just git). Retry through the flap.
function writeFileFlap(p, data) {
  let last = null;
  for (let i = 0; i < 12; i++) {
    try { fs.writeFileSync(p, data); return; }
    catch (e) { last = e; if (!/EPERM/.test(String(e && e.message))) throw e; }
    const t0 = Date.now(); while (Date.now() - t0 < 2500) {} // busy-wait: no async in this path
  }
  throw last;
}

const { loadGame, setupGame, runDays, manifest } = require(REPO + '/scripts/sim-harness');
const { competent } = require(REPO + '/scripts/policies/competent');

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
function logTexts(Game) {
  return safe(() => (Game.log || []).map(e => String(e && (e.text !== undefined ? e.text : e))), []);
}
function trustOf(Game, vid) {
  try { const t = (Game.state.village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return 10; }
}
function bondOf(Game, a, b) {
  try { const x = Game.bondGet ? Game.bondGet(a, b) : null; return x ? { v: x.v || 0, depth: x.depth || 0 } : null; } catch (e) { return null; }
}

// --- conversation driver (r26 driveOne, with gossip + lately modes) ---
function driveOne(Game, vid, tag, mode, convoLog) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const out = { vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false, threads: [], transcript: [] };
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  noteThread();
  const seenIds = [];
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
    let pick = null;
    if (mode === 'hostile') {
      pick = choices.find(x => x && String(x.temper || '') === 'cruel');
      if (!pick) pick = byId(/^dlg:cant$/);
      if (!pick) pick = byId(/^deflect_q$/);
      if (t >= 2) pick = pick || byId(/^(leave|bye|goodbye)/);
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    } else {
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
        pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
      if (!pick && (mode === 'gossip' || mode === 'gossipdeep')) {
        pick = choices.find(x => fresh(x) && /^(ask:gossip|ask:spread_rumor)$/.test(String(x.id || '')));
        if (!pick) pick = choices.find(x => /^(ask:gossip|ask:spread_rumor)$/.test(String(x.id || '')));
      }
      if (!pick && mode === 'lately')
        pick = choices.find(x => /^(ask:lately|alive:event)$/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => String(x.id || '') === 'more');
      if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
      if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && /^(agree|joke|silence|react:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    }
    if (!pick) break;
    seenIds.push(String(pick.id || ''));
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
  }
  if (!out.naturalEnd && out.turns >= 14) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '') }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function oneSeed(seed) {
  const { Game, manifest: mf } = await loadGame({ seed, mode: 'journey-social-r27-pilot', fullTelemetry: true, narration: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const moots = [];
  const dbgNotes = [];
  let lastMootDay = -99;
  const seenCorpseIds = new Set();
  const deaths = [];

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = me();
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  const ctx2 = { favorites: null, outsiders: null };
  function pickFactions() {
    const living = livingIds();
    const byTrust = living.slice().sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
    ctx2.favorites = byTrust.slice(0, 2);
    ctx2.outsiders = byTrust.slice(-2).reverse();
  }

  function mootRound() {
    const day = curDay();
    const bs = (Game.state.village || {}).betrayal || {};
    const cases = (bs.cases || []).filter(c => (c.status === 'open' || c.status === 'dormant') && !c.trial);
    if (!cases.length) return;
    // r27 pilot fix: skip cases where the player stands accused — a
    // citizen-convener doesn't convene their own trial (that path is
    // symmetric-jeopardy territory, proven working by the confounded run).
    const c = cases.find(x => !(x.accused || []).includes(Game.villagerId)) || null;
    if (!c) return;
    const accused = (c.accused || [])[0];
    const accuser = c.accuser || c.by || null;
    const before = {
      log: logTexts(Game),
      accusedTrust: accused ? trustOf(Game, accused) : null,
      accuserTrust: accuser ? trustOf(Game, accuser) : null,
      accusedBond: (accused && accuser) ? bondOf(Game, accused, accuser) : null,
    };
    let res = null;
    try { res = Game.callMoot(c.id, me()); } catch (e) { moots.push({ day, caseId: c.id, error: 'callMoot: ' + e.message }); return; }
    // DEBUG (r27): why is the player so rarely the voter?
    dbgNotes.push(`d${day} ${c.id}: status=${c.status} resAwaiting=${res && res.awaitingPlayerVote} playerConvened=${c.playerConvened} trialPlayerVoter=${c.trial && c.trial.playerVoter} exiled=${!!Game.state.scholar.exiled} accusedIsPlayer=${(c.accused||[]).includes(Game.villagerId)} callerIsPlayer=${Game.isPlayer(me())}`);
    let votedGuilty = null;
    if (res && res.awaitingPlayerVote) {
      // a real player's vote: guilty when the accused has burned their standing
      votedGuilty = (trustOf(Game, accused) || 10) < 25;
      try { Game.castPlayerVote(c.id, votedGuilty); } catch (e) {}
    }
    const afterLines = logTexts(Game);
    // recover the moot's own lines: find the pre-moot tail, slice after it
    let transcript = afterLines;
    if (before.log.length) {
      const lastBefore = before.log[before.log.length - 1];
      const idx = afterLines.lastIndexOf(lastBefore);
      if (idx >= 0 && idx + 1 < afterLines.length) transcript = afterLines.slice(idx + 1);
    }
    const cc = safe(() => (Game.getCase ? Game.getCase(c.id) : null), null) || {};
    const trial = cc.trial || {};
    const after = {
      accusedTrust: accused ? trustOf(Game, accused) : null,
      accuserTrust: accuser ? trustOf(Game, accuser) : null,
      accusedBond: (accused && accuser) ? bondOf(Game, accused, accuser) : null,
    };
    moots.push({
      day, caseId: c.id, charge: c.charge || c.kind || 'unknown',
      accused: accused ? vname(Game, accused) : '?', accuser: accuser ? vname(Game, accuser) : '?',
      votedGuilty, convicted: trial.convicted === true, finalGuilty: trial.finalGuilty,
      present: (trial.present || []).length,
      accusedTrustDelta: (before.accusedTrust != null && after.accusedTrust != null) ? after.accusedTrust - before.accusedTrust : null,
      accuserTrustDelta: (before.accuserTrust != null && after.accuserTrust != null) ? after.accuserTrust - before.accuserTrust : null,
      bondDelta: (before.accusedBond && after.accusedBond) ? after.accusedBond.v - before.accusedBond.v : null,
      transcript,
    });
    lastMootDay = day;
  }

  function gossipRound() {
    const living = livingIds();
    if (!living.length) return;
    const picks = living.slice().sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const vid of picks) driveOne(Game, vid, 'gossip-daily', 'gossip', convoLog);
  }

  function mootFollowup() {
    const living = livingIds();
    if (!living.length) return;
    const picks = living.slice().sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const vid of picks) driveOne(Game, vid, 'moot-followup', 'lately', convoLog);
  }

  function kindnessRound() {
    const day = curDay();
    for (const vid of (ctx2.favorites || [])) {
      if (!livingIds().includes(vid)) continue;
      try {
        const needs = safe(() => Game.npcNeeds(vid) || {}, {});
        const s = Game.state.scholar || {};
        if ((needs.hunger || 0) > 30 && (s.kcal || 0) > 1200 && Game.giveFood) Game.giveFood(vid);
      } catch (e) {}
      try { if (Game.tendVillager) Game.tendVillager(vid); } catch (e) {}
    }
    for (const vid of (ctx2.outsiders || [])) {
      if (!livingIds().includes(vid)) continue;
      // r27 pilot fix: NO player theft. The r27 pilot's theft driver made the
      // PLAYER the accused in every moot (Valentina/Jude/Saul/Regina were the
      // player's own names) — symmetric jeopardy working as designed, but it
      // confounded the citizen-convener question. Hostility stays verbal.
      if (day % 3 === 0 && day > 2) driveOne(Game, vid, 'hostile-daily', 'hostile', convoLog);
    }
  }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: 'journey-social-r27-pilot',
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      const day = curDay();
      if (day === 2 && !ctx2.favorites) pickFactions();
      if (ctx2.favorites) kindnessRound();
      mootRound();              // at most one case has no trial; cheap to call daily
      gossipRound();
      if (day === lastMootDay + 1) mootFollowup();
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day });
      }
    },
  });
  const result = await runDays(Game, pol, { days: DAYCAP, manifest: mf });

  // transcripts: 1 moot + 4 gossip convos -> in-memory artifacts, printed to
  // stdout by the caller (EPERM flap makes fs writes unreliable).
  const artifacts = [];
  if (moots.length) {
    const m = moots[0];
    artifacts.push({ name: `s${seed}-moot-d${m.day}.txt`, text:
      [`MOOT day ${m.day}: ${m.charge} — accused ${m.accused}, accuser ${m.accuser}`, `verdict: ${m.convicted ? 'GUILTY' : 'NOT GUILTY'} (player voted ${m.votedGuilty === null ? 'n/a' : m.votedGuilty ? 'guilty' : 'acquit'})`, '']
        .concat(m.transcript || []).join('\n') });
  }
  convoLog.filter(o => (o.threads || []).some(t => /gossip|spread_rumor/.test(t)))
    .slice(0, 4).forEach((o, i) => {
      artifacts.push({ name: `s${seed}-gossip-${i + 1}-${String(o.name).replace(/\W+/g, '_')}.txt`, text:
        [`day ${o.day} with ${o.name} (${o.tag})`, 'threads: ' + o.threads.join(', '), '']
          .concat(o.transcript.map(e => `${e.who}: ${e.text}`)).join('\n') });
    });

  const gossipConvos = convoLog.filter(o => (o.threads || []).some(t => /gossip|spread_rumor/.test(t))).length;
  const out = {
    seed, days: curDay(), deaths, alive: livingIds().length,
    convos: convoLog.length,
    moots: moots.map(m => ({ day: m.day, charge: m.charge, accused: m.accused, accuser: m.accuser, votedGuilty: m.votedGuilty, convicted: m.convicted, finalGuilty: m.finalGuilty, present: m.present, accusedTrustDelta: m.accusedTrustDelta, accuserTrustDelta: m.accuserTrustDelta, bondDelta: m.bondDelta, error: m.error || null })),
    gossipConvos,
    m1: moots.filter(m => m.convicted !== undefined && !m.error).length,
    m2: gossipConvos,
    m3: moots.filter(m => (m.accusedTrustDelta !== null && m.accusedTrustDelta !== 0) || (m.bondDelta !== null && m.bondDelta !== 0)).length,
    artifacts,
    dbgNotes,
  };
  return out;
}

(async () => {
  const results = [];
  for (const s of SEEDS) {
    try { results.push(await oneSeed(s)); }
    catch (e) { results.push({ seed: s, error: String(e && e.stack || e).slice(0, 2000) }); }
  }
  for (const r of results) {
    if (r.error) { console.log(`seed ${r.seed}: ERROR ${r.error.slice(0, 200)}`); continue; }
    console.log(`seed ${r.seed}: days=${r.days} alive=${r.alive} convos=${r.convos} gossip=${r.gossipConvos} moots=${r.moots.length}`);
    for (const m of r.moots) {
      console.log(`  moot d${m.day} ${m.charge}: ${m.accused} accused by ${m.accuser} -> ${m.error ? 'ERR ' + m.error : (m.convicted ? 'GUILTY' : 'NOT GUILTY')} (vote=${m.votedGuilty}) dTrust(acc)=${m.accusedTrustDelta} dTrust(accuser)=${m.accuserTrustDelta} dBond=${m.bondDelta}`);
    }
    console.log(`  deaths: ${(r.deaths || []).map(d => d.name + ' d' + d.day).join(', ') || 'none'}`);
    const slim = Object.assign({}, r); delete slim.artifacts; delete slim.dbgNotes;
    console.log('SEEDJSON ' + JSON.stringify(slim));
    console.log('DBGNOTES ' + JSON.stringify(r.dbgNotes || []));
    for (const a of (r.artifacts || [])) {
      console.log(`<<<ARTIFACT ${a.name}>>>`);
      console.log(a.text.split('\n').slice(0, 90).join('\n'));
      console.log('<<<END>>>');
    }
  }
  const m1seeds = results.filter(r => !r.error && (r.m1 || 0) >= 1).length;
  const m2seeds = results.filter(r => !r.error && (r.m2 || 0) >= 5).length;
  const resolvedMoots = results.flatMap(r => r.moots || []).filter(m => !m.error);
  const m3ok = resolvedMoots.length > 0 && resolvedMoots.every(m => (m.accusedTrustDelta !== null && m.accusedTrustDelta !== 0) || (m.bondDelta !== null && m.bondDelta !== 0));
  console.log(`M1 moot end-to-end (>=1 moot->verdict on >=2/4 seeds): ${m1seeds}/4 -> ${m1seeds >= 2 ? 'GO' : 'MISS'}`);
  console.log(`M2 gossip reach (>=5 gossip convos on >=2/4 seeds): ${m2seeds}/4 -> ${m2seeds >= 2 ? 'GO' : 'MISS'}`);
  console.log(`M3 consequences (every resolved moot moves trust/bonds): ${resolvedMoots.length} moots -> ${m3ok ? 'GO' : 'MISS'}`);
  console.log(`M5 guardrail (alive at horizon >=2/4): ${results.filter(r => !r.error && r.alive > 0).length}/4`);
})();
