#!/usr/bin/env node
// journey-social-r23-pilot-20261018.js -- SOCIAL leg (leg 5), r23 PILOT.
// PRE-REGISTERED (MEASUREMENT.md sections 9-12, 14 -- written before the
// pilot ran; full note at evidence/2026-10-18/journey-social-r23.md):
//
// Context: r22 (landed b2a0b6ab8, ~1h before this run) proved bond DEPTH
// now colors conversation openers + entry beats + grace beats. Its
// documented-not-fixed blank #1: "the want system is bond-blind -- a -69
// rival still invites you to 'walk my trap line' and accepts favors warmly
// ('glad it's you saying it'). The surface marks the greeting; the want
// machinery doesn't know about bonds."
//
// Leg question: does the INVITE layer (betrayal.js npcInviteTick +
// conversation.js startConvo inviteBeat) and the REOPENER layer
// (convoPick 'small' -> cg.reopeners) respect bond depth -- or do
// depth<=-1 rivals still present warm micro-quest invites and warm
// "glad it's you" reopeners?
//
// Binding (pilot; a miss is NO-GO, never re-scored):
//   P1 gap-invite: >=1 presentment of a warm INVITE_DEFS label by a
//     villager whose bond depth <= -1 (or v <= -25) with the player,
//     on >=1/2 seeds -> gap REAL.
//   P2 gap-reopener: >=1 warm reopener ("glad it's you" / "hoping you'd
//     come back" class) spoken by a depth<=-1 villager on >=1/2 seeds.
//   Either GO -> the fix proceeds; both miss -> document and move on.
//
// Interesting-finding bar: a hostile villager warmly inviting the player
// on a trap line (label text + bond depth recorded); or a hostile
// reopener. Post-fix (separate script): 0 warm invites / warm reopeners
// from depth<=-1 villagers across 3 seeds.
//
// Seeds: 1601, 1602 (fresh; r21/r22 used 1501-1503). Horizon: DAYCAP=60,
// death-aware (+10d tail). Policy: r22 "favorites" (competent base +
// 2 favorites kind, 2 outsiders hostile/theft).
// TOOLING ONLY -- no game code changes in this file.
// Usage: SEEDS=1601,1602 node scripts/journey-social-r23-pilot-20261018.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1601, 1602]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);

const { mulberry32, loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

// Warm invite labels (INVITE_DEFS in betrayal.js) and warm reopeners
// (characterGen.json convo.reopeners) -- the exact strings to detect.
const INVITE_LABELS = [
  'Walk with me? I want another pair of eyes on something.',
  'Help me haul something back? Too much for one.',
  'Come get air with me. I need to think out loud.',
  "Come see what I found. You won't believe it.",
  'Walk my trap line with me? Extra hands, extra eyes.',
];
const REOPENERS = [
  "Back again? Alright. What's on my mind",
  'I was just thinking about what you said earlier',
  "Hey. Got another minute?",
  "You again. I don't mind. What's up?",
  "I was hoping you'd come back.",
  'Hey. I keep meaning to tell you something.',
  "Back for more? I've got more.",
  'Good timing. I was just thinking of our last talk.',
  "I'm glad it's you. I needed a friendly face.",
  'You caught me at a good moment. Ask me things.',
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
  const { Game, manifest: mf } = await loadGame({ seed, mode: 'journey-social-r23-pilot', fullTelemetry: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const invitePresentments = []; // {day, vid, name, depth, v, label, plot}
  const reopenerHits = [];       // {day, vid, name, depth, v, line}

  // Intercept the invite beat at presentation: sayLine(vid, label, {inviteBeat:true}).
  const _sayLine = Game.sayLine ? Game.sayLine.bind(Game) : null;
  if (_sayLine) {
    Game.sayLine = function (vid, line, opts) {
      try {
        if (opts && opts.inviteBeat) {
          const b = bondOf(Game, me(), vid);
          const pend = safe(() => Game.pendingInvite(vid), null);
          invitePresentments.push({
            day: curDay(), vid, name: vname(Game, vid),
            depth: (b && b.depth) || 0, v: (b && b.v) || 0,
            label: String(line).slice(0, 120),
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
    const sid = me();
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
    id: 'journey-social-r23-pilot',
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
  const result = await runDays(Game, pol, { days: DAYCAP, manifest: mf });

  // Scan transcripts for warm reopeners + bond depth of speaker.
  for (const o of convoLog) {
    for (const e of o.transcript) {
      if (e.who !== 'NPC') continue;
      for (const r of REOPENERS) {
        if (e.text.indexOf(r) !== -1) {
          const b = bondOf(Game, me(), o.vid);
          reopenerHits.push({ day: o.day, vid: o.vid, name: o.name, depth: (b && b.depth) || 0, v: (b && b.v) || 0, line: r.slice(0, 80) });
          break;
        }
      }
    }
  }

  const out = {
    seed, days: curDay(),
    deaths,
    rivalsFormed: livingIds().map(vid => ({ name: vname(Game, vid), bond: bondOf(Game, me(), vid) }))
      .filter(x => isRival(x.bond)).map(x => ({ name: x.name, depth: x.bond.depth, v: Math.round(x.bond.v) })),
    friendsFormed: livingIds().map(vid => ({ name: vname(Game, vid), bond: bondOf(Game, me(), vid) }))
      .filter(x => ((x.bond && x.bond.depth) || 0) >= 2).map(x => ({ name: x.name, depth: x.bond.depth, v: Math.round(x.bond.v) })),
    invitePresentments,
    rivalInvites: invitePresentments.filter(p => p.depth <= -1 || p.v <= -25),
    reopenerHits,
    rivalReopeners: reopenerHits.filter(p => p.depth <= -1 || p.v <= -25),
    convos: convoLog.length,
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-social-r23-pilot-s${seed}.json`), JSON.stringify(out, null, 1));
  return out;
}

(async () => {
  const results = [];
  for (const s of SEEDS) {
    try { results.push(await oneSeed(s)); }
    catch (e) { results.push({ seed: s, error: String(e && e.stack || e).slice(0, 2000) }); }
  }
  for (const r of results) {
    console.log(`seed ${r.seed}: days=${r.days} convos=${r.convos} rivals=${(r.rivalsFormed || []).length} friends=${(r.friendsFormed || []).length}`);
    console.log(`  invites presented: ${(r.invitePresentments || []).length} (rival: ${(r.rivalInvites || []).length})`);
    for (const p of (r.rivalInvites || [])) console.log(`    RIVAL INVITE d${p.day} ${p.name} depth=${p.depth} v=${p.v} plot=${p.plot}: ${p.label}`);
    console.log(`  warm reopeners: ${(r.reopenerHits || []).length} (rival: ${(r.rivalReopeners || []).length})`);
    for (const p of (r.rivalReopeners || [])) console.log(`    RIVAL REOPENER d${p.day} ${p.name} depth=${p.depth} v=${p.v}: ${p.line}`);
    if (r.error) console.log(`  ERROR: ${r.error.slice(0, 300)}`);
  }
  const p1 = results.some(r => (r.rivalInvites || []).length >= 1);
  const p2 = results.some(r => (r.rivalReopeners || []).length >= 1);
  console.log(`P1 gap-invite: ${p1 ? 'GO (gap REAL)' : 'MISS'} | P2 gap-reopener: ${p2 ? 'GO (gap REAL)' : 'MISS'}`);
  if (!p1 && !p2) console.log('Both pilot metrics MISS -- document and move on per MEASUREMENT.md section 9.');
})();
