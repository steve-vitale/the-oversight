#!/usr/bin/env node
// journey-social-r20b-exile-20261017.js — LEG 5 SOCIAL LIFE, r20b pilot:
// STEVE'S 2026-10-17 EXILE RULING ("Social consequences too").
// Pre-registration: worktree evidence/2026-10-17/journey-social-r20-exile-social.md
// (written BEFORE any run).
// Leg question: does exile now carry social consequences — cold shoulders by
// default, loyalty exceptions at a trust cost, amends intact?
// Binding metrics (§14):
//   M1: post-exile, >=80% of convo attempts with NON-loyal villagers resolve
//       as cold-shoulder refusals. (The sim driver stands in for social-
//       engagement attempts; see metric review for the "villager-initiated"
//       reading.)
//   M2: >=1 loyalty-break event per run with a recorded trust delta.
//   M3: amends path intact — covered by scripts/test-exile-social.js
//       (justiceRespond restitution); pilot notes any natural pre-exile
//       confrontation/amends.
//   M4: 6+ transcripts sense-read by the author; >=5/6 meet the bar.
//   M5 (guardrail): no new death mode vs the r19 baseline; the village
//       doesn't starve from the change (cold shoulder is social, not logistical).
// Seeds: 1307, 1308, 1309 (fresh, adjacent to r19's 1304-1306).
// Policies: competent + larceny-leaning, identical seeds. DAYCAP=60.
// Exile exercise: if the scholar isn't exiled by day 20, the driver exiles
// them via the game's own Game.exilePlayer('moot') and walks them off Haven's
// ground (the sentence says be off by dawn; the defied-exile uprising is a
// different system, not this leg's question). The driver then keeps driving
// one convo per living villager per day — the exile coming back to try talking,
// exactly the r7 scenario (51 conversations post-exile).
// Driver: r19 pattern (driveOne: first non-opt-out bespoke answer, 12-turn
// budget, endConvo('left') on exhaustion), slimmed to the exile question.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1307, 1308, 1309]);
const POLICY_IDS = (process.env.POLICIES ? process.env.POLICIES.split(',') : ['competent', 'larceny-leaning']);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);
const EXILE_DAY = 20;
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
let larcenyLeaning = null;
try { larcenyLeaning = require('./policies/larceny-leaning').larcenyLeaning; } catch (e) { larcenyLeaning = competent; }
const POLICY_LIB = { competent, 'larceny-leaning': larcenyLeaning };

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-17',
  'perseed-exilesocial' + (process.env.COLD_OFF === '1' ? '-cold-off-control' : ''));
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function roleOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; return (p && (p.occupationId || p.formerOccupation)) || '?'; }
  catch (e) { return '?'; }
}
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
function trustOf(Game, vid) {
  try { const t = (Game.state.village.trust || {})[vid]; return t === undefined ? 10 : t; } catch (e) { return 10; }
}

function driveOne(Game, vid, tag, day, exileInfo) {
  const out = { vid, name: vname(Game, vid), tag, day, turns: 0, naturalEnd: false,
    refused: false, broke: false, loyal: null, loyaltyWhy: null, trustBefore: null,
    trustAfter: null, refusalLine: null, transcript: [], threads: [],
    exiledAtAttempt: false };
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  out.trustBefore = trustOf(Game, vid);
  // Succession resets the docket (justice.js): the new bearer is NOT exiled,
  // so the village must not cold-shoulder them. Record the live state per
  // attempt — M1 only counts attempts made while the scholar is exiled.
  try { out.exiledAtAttempt = (typeof Game.justiceExileSociallyCut === 'function') && Game.justiceExileSociallyCut(); } catch (e) { out.exiledAtAttempt = false; }
  try {
    const loy = (typeof Game.justiceExileLoyalty === 'function') ? Game.justiceExileLoyalty(vid) : null;
    if (loy) { out.loyal = !!loy.loyal; out.loyaltyWhy = loy.why || null; }
  } catch (e) {}
  let st = null;
  try { st = Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  if (st && st.refused) {
    out.refused = true; out.naturalEnd = true;
    out.refusalLine = String(st.line || '');
    out.transcript = [{ who: 'NPC', text: out.refusalLine }];
    return out;
  }
  if (st && st.broke) {
    out.broke = true;
    out.transcript.push({ who: 'NPC', text: String(st.line || '') });
    // the trust cost lands at initiation — read it before the conversation's
    // own trust effects (natural-end +3 etc.) muddy the delta.
    out.trustAtBreak = trustOf(Game, vid);
    out.breakCost = out.trustAtBreak - out.trustBefore;
  }
  noteThread();
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
    let pick = null;
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices[0];
    if (!pick) break;
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
  }
  if (!out.naturalEnd && out.turns >= 12) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
  try {
    const c = Game.convoGet(vid);
    const tr = ((c && c.transcript) || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '') }));
    out.transcript = out.transcript.concat(tr);
  } catch (e) {}
  out.trustAfter = trustOf(Game, vid);
  out.trustDelta = out.trustAfter - out.trustBefore;
  return out;
}

async function oneSeedPolicy(seed, policyId) {
  const t0 = performance.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-r20b-exile', fullTelemetry: true });
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const beatBuf = [];
  Game.say = function (msg) {
    try { beatBuf.push({ day: curDay(), kind: 'say', text: String(msg == null ? '' : msg) }); if (beatBuf.length > 20000) beatBuf.shift(); } catch (e) {}
  };
  Game.sysSay = function (msg) {
    try { beatBuf.push({ day: curDay(), kind: 'sys', text: String(msg == null ? '' : msg) }); if (beatBuf.length > 20000) beatBuf.shift(); } catch (e) {}
  };

  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const exileEvents = { exiled: false, exileDay: null, forced: false, naturalNote: null };
  const playerDeaths = [];
  let lastBearer = null;

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = Game.villagerId;
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  function scanDeaths() {
    const corpses = safe(() => Game.corpses() || [], []);
    for (const cp of corpses) {
      if (!cp || seenCorpseIds.has(cp.id)) continue;
      seenCorpseIds.add(cp.id);
      const kind = cp.kind || '';
      if (kind !== 'person' && kind !== 'villager') continue;
      deaths.push({ cid: cp.id, vid: cp.villagerId || null, name: cp.name || 'someone',
        role: cp.villagerId ? roleOf(Game, cp.villagerId) : '?', day: cp.dayDied || 0,
        cause: cp.cause || '?', killerId: cp.killerId || null });
    }
    try {
      if (lastBearer !== null && Game.villagerId !== lastBearer) {
        playerDeaths.push({ day: curDay(), prevBearer: lastBearer, prevName: vname(Game, lastBearer) });
      }
      lastBearer = Game.villagerId;
    } catch (e) {}
  }
  function havenXY() {
    const vn = Game.state.village || {};
    return { hx: vn.px ?? 4, hy: vn.py ?? 4 };
  }
  function stepOffHaven() {
    // The sentence says be off Haven's ground by dawn; the defied-exile
    // uprising is a different system. The exile keeps their distance but
    // comes back to try talking — the r7 scenario this leg exercises.
    try {
      const { hx, hy } = havenXY();
      if (Game.map && Game.map.px === hx && Game.map.py === hy) {
        Game.map.px = hx + 2; Game.map.py = hy;
      }
    } catch (e) {}
  }
  function ensureExile() {
    const day = curDay();
    const isEx = safe(() => Game.justiceExiled(), false) || !!((Game.state.scholar || {}).exiled);
    if (isEx && !exileEvents.exiled) {
      exileEvents.exiled = true; exileEvents.exileDay = day; exileEvents.forced = false;
      exileEvents.loyaltyCensus = loyaltyCensus();
    }
    if (!exileEvents.exiled && day >= EXILE_DAY) {
      try { Game.exilePlayer('moot'); } catch (e) { exileEvents.forceError = String(e && e.message); }
      exileEvents.exiled = true; exileEvents.exileDay = day; exileEvents.forced = true;
      exileEvents.loyaltyCensus = loyaltyCensus();
    }
    if (exileEvents.exiled) {
      try {
        const jd = (Game.justiceState() || {}).exileDay;
        if (day > (jd || 0)) stepOffHaven();
      } catch (e) {}
    }
    return exileEvents.exiled;
  }
  function loyaltyCensus() {
    const rows = [];
    for (const vid of livingIds()) {
      let loy = { loyal: false, why: null };
      try { if (typeof Game.justiceExileLoyalty === 'function') loy = Game.justiceExileLoyalty(vid); } catch (e) {}
      rows.push({ vid, name: vname(Game, vid), trust: trustOf(Game, vid), loyal: !!loy.loyal, why: loy.why || null });
    }
    return rows;
  }

  await setupGame(Game);
  lastBearer = safe(() => Game.villagerId, null);
  // M5 CONTROL (COLD_OFF=1): disable the social layer but keep the forced
  // exile — isolates whether death-profile shifts come from the change or
  // from the exile scenario itself (provider loss).
  if (process.env.COLD_OFF === '1') {
    Game.justiceExileSociallyCut = function () { return false; };
    console.log(`seed ${seed} ${policyId}: COLD_OFF control — social layer disabled`);
  }
  const initialRoster = livingIds().map(id => ({ vid: id, name: vname(Game, id), role: roleOf(Game, id) }));

  const base = POLICY_LIB[policyId];
  const pol = Object.assign({}, base, {
    id: 'journey-social-r20b-' + policyId,
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      const exiled = ensureExile();
      if (exiled) {
        const day = curDay();
        for (const vid of livingIds()) {
          const out = driveOne(Game2, vid, 'daily', day, exileEvents);
          convoLog.push(out);
        }
      }
      scanDeaths();
      ctx.socialConvs = convoLog.length;
    },
  });
  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Math.round(performance.now() - t0);
  scanDeaths();

  // ---- metrics ----
  const postExile = convoLog.filter(o => exileEvents.exileDay != null && o.day >= exileEvents.exileDay);
  // M1 denominator: attempts made WHILE the scholar was exiled. Succession
  // resets the docket — the new bearer isn't exiled, and the village
  // correctly stops refusing them (verified on the larceny seeds).
  const exiledAttempts = postExile.filter(o => o.exiledAtAttempt);
  const nonLoyal = exiledAttempts.filter(o => o.loyal === false);
  const refused = nonLoyal.filter(o => o.refused);
  const m1 = nonLoyal.length ? refused.length / nonLoyal.length : null;
  const breaks = postExile.filter(o => o.broke);
  const m2events = breaks.map(o => ({ day: o.day, name: o.name, trustBefore: o.trustBefore,
    trustAtBreak: o.trustAtBreak, breakCost: o.breakCost, trustAfter: o.trustAfter,
    trustDelta: o.trustDelta, loyaltyWhy: o.loyaltyWhy }));

  // transcripts for sense-reading: all breaks + a sample of refusals
  const TRF = [];
  for (const o of breaks) {
    TRF.push(`===== BREAK — seed ${seed} / ${policyId} — day ${o.day} — ${o.name} (${roleOf(Game, o.vid)}) trust ${o.trustBefore}->${o.trustAfter} (why: ${o.loyaltyWhy}) =====`);
    for (const e of o.transcript) TRF.push(`${e.who}: ${e.text}`);
    TRF.push('');
  }
  const refusalsByVillager = {};
  for (const o of postExile.filter(x => x.refused)) {
    (refusalsByVillager[o.vid] = refusalsByVillager[o.vid] || []).push(o);
  }
  let rCount = 0;
  for (const vid of Object.keys(refusalsByVillager)) {
    for (const o of refusalsByVillager[vid].slice(0, 2)) {
      TRF.push(`----- REFUSAL — seed ${seed} / ${policyId} — day ${o.day} — ${o.name} (${roleOf(Game, o.vid)}) trust=${o.trustBefore} loyal=${o.loyal} -----`);
      TRF.push(`NPC: ${o.refusalLine}`);
      if (++rCount >= 14) break;
    }
    if (rCount >= 14) break;
  }
  fs.writeFileSync(path.join(OUTDIR, `exile-${seed}-${policyId}-transcripts.txt`), TRF.join('\n') + '\n');

  const vv = Game.state.village || {};
  const out = {
    seed, policy: policyId, daycap: DAYCAP, ms,
    exile: exileEvents,
    loyaltyCensusAtExile: exileEvents.loyaltyCensus || null,
    'end.day': curDay(), 'end.alive': (vv.roster || []).length,
    endReason: result ? result.endReason : null,
    convos: convoLog.length, postExileConvos: postExile.length,
    m1: { exiledAttempts: exiledAttempts.length, nonLoyalAttempts: nonLoyal.length, refused: refused.length, share: m1 },
    m2: { breaks: breaks.length, events: m2events },
    m4: { transcriptFile: `exile-${seed}-${policyId}-transcripts.txt`, breakCount: breaks.length, refusalSample: rCount },
    deaths: deaths.map(d => ({ day: d.day, name: d.name, role: d.role, cause: d.cause })),
    starvationDeaths: deaths.filter(d => /starv/i.test(d.cause || '')).length,
    census: {
      alive: livingIds().map(id => ({ name: vname(Game, id), role: roleOf(Game, id) })),
      dead: deaths.map(d => ({ name: d.name, role: d.role, day: d.day, cause: d.cause })),
      playerDeaths,
      initialRoster,
    },
  };
  fs.writeFileSync(path.join(OUTDIR, `journey-social-r20b-exile-${seed}-${policyId}.json`), JSON.stringify(out, null, 1));
  console.log(`seed ${seed} ${policyId}: exiled=${exileEvents.exiled}(d${exileEvents.exileDay}${exileEvents.forced ? ',forced' : ',natural'}) ` +
    `m1=${refused.length}/${nonLoyal.length}${m1 == null ? '' : ' (' + (m1 * 100).toFixed(1) + '%)'} ` +
    `m2breaks=${breaks.length} fallen=${deaths.length} starv=${out.starvationDeaths} alive=${(vv.roster || []).length} (${ms}ms)`);
  return out;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const all = [];
  for (const seed of SEEDS) {
    for (const pid of POLICY_IDS) {
      if (!POLICY_LIB[pid]) { console.log('unknown policy ' + pid); continue; }
      all.push(await oneSeedPolicy(seed, pid));
    }
  }
  const agg = {
    seeds: SEEDS, policies: POLICY_IDS, daycap: DAYCAP, exileDay: EXILE_DAY,
    runs: all.map(e => ({ seed: e.seed, policy: e.policy, exiled: e.exile.exiled, exileDay: e.exile.exileDay,
      forced: e.exile.forced, m1: e.m1, m2breaks: e.m2.breaks, fallen: e.deaths.length,
      starvationDeaths: e.starvationDeaths, alive: e['end.alive'] })),
  };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r20b-exile-aggregate.json'), JSON.stringify(agg, null, 1));
  console.log('aggregate:', JSON.stringify(agg.runs, null, 1));
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
