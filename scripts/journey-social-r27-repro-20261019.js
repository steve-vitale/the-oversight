#!/usr/bin/env node
// journey-social-r27-repro-20261019.js -- re-run seed 2002 to day 56 and dump
// the full transcripts of the conversations that produced L2' hits
// (d34 Wei recap, d53 Isabella betrayal press/wounds, d122 Wei recap) plus
// any gossip convo on those days, for the sense-read. TOOLING ONLY.
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'evidence', '2026-10-19', 'social-r27-transcripts');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const { mulberry32, loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

// Import the r27 drive machinery by requiring the pilot and reusing internals?
// Simpler: copy the minimal driver. Actually reuse via module cache is
// impossible (pilot's main() runs on require). Re-implement compactly.
const CG = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characterGen.json'), 'utf8'));
const EXHAUSTED = (CG.convo && CG.convo.exhausted) || [];
const WINDDOWN_POOL = [];
if (CG.convo && CG.convo.winddowns) {
  for (const k of Object.keys(CG.convo.winddowns)) {
    const v = CG.convo.winddowns[k]; if (Array.isArray(v)) WINDDOWN_POOL.push(...v);
  }
}
const norm = (t) => String(t == null ? '' : t).trim().replace(/^"+|"+$/g, '');
const EXH_SET = new Set(EXHAUSTED.map(norm));
const WD_SET = new Set(WINDDOWN_POOL.map(norm));

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

const TARGET_DAYS = new Set([34, 53, 122]);
const dump = [];

function driveOne(Game, vid, tag, mode, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const want = TARGET_DAYS.has(day);
  try { Game.startConvo(vid); } catch (e) { return; }
  const seenIds = [];
  const lines = [];
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) break;
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) break;
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
      if (runState.gossipPicks < 3) {
        const g = byId(/^ask:gossip$/);
        if (g && (fresh(g) || !seenIds.some(id => id === 'ask:gossip'))) { pick = g; runState.gossipPicks++; }
      }
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (!pick && ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
        pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
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
    const pickId = String(pick.id || '');
    seenIds.push(pickId);
    const beforeLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    const tr = safe(() => { const cc = Game.convoGet(vid); return cc.transcript || []; }, []);
    if (want) {
      lines.push(`--- turn ${t} PICK <${pickId}> ---`);
      for (const e of tr.slice(beforeLen)) lines.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  if (want && lines.length) {
    dump.push(`===== day ${day} ${vname(Game, vid)} (${tag}/${mode}) =====\n` + lines.join('\n'));
  }
}

(async () => {
  const seed = 2002;
  const { Game, manifest: mf } = await loadGame({ seed, mode: 'journey-social-r27-repro', fullTelemetry: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const seenCorpseIds = new Set();
  const runState = { gossipPicks: 0 };
  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = me();
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
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
      if (day % 2 === 0 && favAlive.length) driveOne(Game, favAlive[(day / 2) % favAlive.length | 0], 'deep-daily', 'deep', runState);
      else if (day % 2 === 1 && outAlive.length) driveOne(Game, outAlive[day % outAlive.length], 'hostile-daily', 'hostile', runState);
    }
  }
  function mootDuty() {
    const sid = me();
    const cases = safe(() => ((Game.state.village || {}).betrayal || {}).cases || [], []);
    for (const c of cases) {
      if (!c || c.resolution) continue;
      if (!c.trial && !c._r27convened) {
        try { Game.callMoot(c.id, sid); c._r27convened = true; } catch (e) {}
      }
      if (c.trial && c.trial.awaitingPlayerVote && Game.castPlayerVote) {
        try {
          const need = Math.floor(((c.trial.present || []).length + 1) / 2) + 1;
          const guiltySoFar = c.trial.guiltySoFar || c.trial.guilty || 0;
          Game.castPlayerVote(c.id, guiltySoFar >= need ? 1 : 0);
        } catch (e) {}
      }
    }
  }
  const base = competent;
  const pol = Object.assign({}, base, {
    id: 'journey-social-r27-repro',
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      if (curDay() === 2 && !ctx2.favorites) pickFactions();
      if (ctx2.favorites) kindnessRound();
      mootDuty();
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
      }
    },
  });
  await runDays(Game, pol, { days: 126, manifest: mf });
  fs.writeFileSync(path.join(OUT, 's2002-l2prime-repro.txt'), dump.join('\n\n') + '\n');
  console.log(`dumped ${dump.length} conversation(s)`);
})();
