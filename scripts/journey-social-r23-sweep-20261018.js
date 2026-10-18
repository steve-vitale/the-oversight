#!/usr/bin/env node
// journey-social-r23-sweep-20261018.js -- SOCIAL leg (leg 5), r23 POST-FIX
// sweep. Runs the r23 pilot's favoritism driver on 3 fresh seeds against
// the FIXED code and records per-seed evidence + rival-conversation
// transcripts for sense-reading.
//
// Binding (from the pre-registered r23 note):
//   M2 (post-fix surface): 0 warm INVITE_DEFS labels presented by
//     depth<=-1 (or v<=-25) villagers across 3 seeds; every rival invite
//     presentment carries its inviteCold line.
//   M3 (honesty): 0 fabricated shared events in new cold lines (asserted
//     in the proof test; re-asserted on wild presentments).
//   M4 (people): >=5/6 sense-read transcripts meet the conversation
//     quality bar (done by hand from social-r23-transcripts/).
//   M5 (guardrail): >=2/3 seeds end 60d with >=5 alive; invite volume
//     within +/-30% of the pre-fix pilot mean (~30/seed); conversation
//     cost unchanged (10 kcal/open, asserted in proof test run).
//
// Seeds: 1601, 1602, 1603 (1601/1602 re-run post-fix for comparability).
// Horizon: DAYCAP=60, death-aware (+10d tail). Policy: r22 "favorites".
// Usage: node scripts/journey-social-r23-sweep-20261018.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');
const TRDIR = path.join(EVIDIR, 'social-r23-transcripts');
for (const d of [EVIDIR, TRDIR]) { try { fs.mkdirSync(d, { recursive: true }); } catch (e) {} }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1601, 1602, 1603]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);

const { mulberry32, loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

const WARM_INVITE_LABELS = [
  'Walk with me? I want another pair of eyes on something.',
  'Help me haul something back? Too much for one.',
  'Come get air with me. I need to think out loud.',
  "Come see what I found. You won't believe it.",
  'Walk my trap line with me? Extra hands, extra eyes.',
];

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
function bondOf(Game, a, b) { try { return Game.bondGet ? (Game.bondGet(a, b) || { v: 0, depth: 0 }) : { v: 0, depth: 0 }; } catch (e) { return { v: 0, depth: 0 }; } }
const isRival = (b) => ((b && b.depth) || 0) <= -1 || ((b && b.v) || 0) <= -25;

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
  for (let t = 0; t < 12; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    let pick = null;
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
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
      if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
      if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:)/.test(String(x.id || '')));
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
  if (!out.naturalEnd && out.turns >= 12) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
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
  const { Game, manifest: mf } = await loadGame({ seed, mode: 'journey-social-r23-sweep', fullTelemetry: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const invitePresentments = [];

  const _sayLine = Game.sayLine ? Game.sayLine.bind(Game) : null;
  if (_sayLine) {
    Game.sayLine = function (vid, line, opts) {
      try {
        if (opts && opts.inviteBeat) {
          const b = bondOf(Game, me(), vid);
          const pend = safe(() => Game.pendingInvite(vid), null);
          invitePresentments.push({
            day: curDay(), vid, name: vname(Game, vid),
            depth: (b && b.depth) || 0, v: Math.round((b && b.v) || 0),
            label: String(line).slice(0, 140),
            warmLabel: WARM_INVITE_LABELS.some(w => String(line).indexOf(w) !== -1),
            plot: !!(pend && pend.plotId),
          });
        }
      } catch (e) {}
      return _sayLine(vid, line, opts);
    };
  }

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = me();
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  const aliveCount = () => livingIds().length + 1;
  function trustOf(vid) { try { const t = (Game.state.village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return 10; } }

  const ctx2 = { favorites: null, outsiders: null };
  function pickFactions() {
    const living = livingIds();
    const byTrust = living.slice().sort((a, b) => trustOf(b) - trustOf(a));
    ctx2.favorites = byTrust.slice(0, 2);
    ctx2.outsiders = byTrust.slice(-2).reverse();
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
      if (day % 5 === 0 && day > 2 && Game.stealFrom) { try { Game.stealFrom(vid); } catch (e) {} }
    }
    const living = livingIds();
    const favAlive = (ctx2.favorites || []).filter(id => living.includes(id));
    const outAlive = (ctx2.outsiders || []).filter(id => living.includes(id));
    if (day >= 3) {
      if (day % 2 === 0 && favAlive.length) driveOne(Game, favAlive[(day / 2) % favAlive.length | 0], 'kind-daily', 'kind', convoLog);
      else if (day % 2 === 1 && outAlive.length) driveOne(Game, outAlive[day % outAlive.length], 'hostile-daily', 'hostile', convoLog);
    }
  }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: 'journey-social-r23-sweep',
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      if (curDay() === 2 && !ctx2.favorites) pickFactions();
      if (ctx2.favorites) kindnessRound();
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay() });
      }
    },
  });
  await runDays(Game, pol, { days: DAYCAP, manifest: mf });

  // Save transcripts for rival conversations (sense-reading corpus).
  const trFiles = [];
  for (const o of convoLog) {
    const b = bondOf(Game, me(), o.vid);
    if (!isRival(b) && o.mode !== 'hostile') continue;
    const fn = `r23-s${seed}-d${o.day}-${o.mode}-${String(o.vid).slice(0, 12)}.txt`;
    const lines = [`CONVERSATION — seed ${seed} day ${o.day} [${o.mode}] ${o.name} (${o.vid}) tag=${o.tag} bondDepth=${(b && b.depth) || 0} bondV=${Math.round((b && b.v) || 0)}`,
      `threads: ${o.threads.join(', ')} | turns: ${o.turns} | naturalEnd: ${o.naturalEnd}`, '---'];
    for (const e of o.transcript) lines.push(`${e.who}: ${e.text}`);
    fs.writeFileSync(path.join(TRDIR, fn), lines.join('\n'));
    trFiles.push(fn);
  }

  const rivalInvites = invitePresentments.filter(p => p.depth <= -1 || p.v <= -25);
  const warmRivalInvites = rivalInvites.filter(p => p.warmLabel);
  const out = {
    seed, days: curDay(), alive: aliveCount(), deaths,
    convos: convoLog.length,
    invitesPresented: invitePresentments.length,
    rivalInvites: rivalInvites.length,
    warmRivalInvites: warmRivalInvites.length,
    rivalInviteLabels: rivalInvites.map(p => ({ day: p.day, name: p.name, depth: p.depth, v: p.v, label: p.label })),
    warmRivalInviteLabels: warmRivalInvites.map(p => p.label),
    transcripts: trFiles,
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-social-r23-sweep-s${seed}.json`), JSON.stringify(out, null, 1));
  return out;
}

(async () => {
  const results = [];
  for (const s of SEEDS) {
    try { results.push(await oneSeed(s)); }
    catch (e) { results.push({ seed: s, error: String(e && e.stack || e).slice(0, 2000) }); }
  }
  for (const r of results) {
    console.log(`seed ${r.seed}: days=${r.days} alive=${r.alive} convos=${r.convos} invites=${r.invitesPresented} rivalInvites=${r.rivalInvites} WARM_RIVAL=${r.warmRivalInvites}`);
    for (const p of (r.rivalInviteLabels || [])) console.log(`    d${p.day} ${p.name} depth=${p.depth} v=${p.v}: ${p.label}`);
    if (r.error) console.log(`  ERROR: ${r.error.slice(0, 300)}`);
  }
  const m2 = results.every(r => !r.error && (r.warmRivalInvites || 0) === 0);
  const m5alive = results.filter(r => !r.error && (r.alive || 0) >= 5).length;
  const vols = results.filter(r => !r.error).map(r => r.invitesPresented || 0);
  const meanVol = vols.length ? vols.reduce((a, b) => a + b, 0) / vols.length : 0;
  console.log(`M2 (0 warm rival invites): ${m2 ? 'GO' : 'NO-GO'} | M5 alive>=5: ${m5alive}/3 | mean invite vol: ${meanVol.toFixed(1)}/seed (pre-fix pilot ~29.5)`);
})();
