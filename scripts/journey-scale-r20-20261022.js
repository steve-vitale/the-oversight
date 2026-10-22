// scripts/journey-scale-r20-20261022.js — journey leg SCALE (days 80–140) R20:
// THE COVENANT ROAD. The r-line (r12–r19) proved the belong/trade roads and
// the table approach aloud; the covenant road (peer league, no primary —
// mutual defense + shared pool, council votes) has not been played in the
// scale window since longsim food r2 (2026-10-11), and never with the
// courtship-honesty fixes (r2-20261011) or the Founding Council pool-pour
// voicing. This pilot plays it end-to-end as a competent player.
//
// PRE-REGISTER (2026-10-22, MEASUREMENT.md sections 9-12, 14):
//   Leg question: does the covenant road play aloud end-to-end in the scale
//   window — courtship, the Founding Council beat (pact vs pool), covenant
//   crises, defense calls — and can a real player reach national on it?
//   Arms (COVENANT_ANSWER per seed): 20001,20002 = 'pact' (mutual defense);
//   20003,20004 = 'pool' (shared granary founding pour — the road's real-food
//   moment, never taken by a policy before).
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 links — >=2/4 seeds form >=2 covenant links (the road is alive).
//     M2 founding — every seed that reaches 3 seasoned covenant links fires
//       the Founding Council beat ALOUD (copy captured) and answers it aloud.
//       A seed that never qualifies is a miss on M1's terms, not M2's.
//     M3 crises — every fired covenant crisis / defense call is answered aloud
//       (answered count == fired count among active links).
//     M4 people — >=4 full transcripts sense-read, 0 senseless flags.
//     M5 survival — villages alive+coherent at the decision day (185 loop-days
//       or death-aware stop, +10d tail max).
//   Interesting-finding bar: the pool-pour's real-food debit said aloud; how
//   pact's mutual-defense obligation plays vs trade's priced refusal; whether
//   the league holds under wave-3/4 pressure; what the covenant crises ask.
//   Horizon: DAYCAP=185 loop-days, death-aware stop.
//   PILOT FIRST: 4 seeds 20001-20004 (fresh, disjoint from r9-r19).
//   Policy: scalecourt (competent + covenant-road courtship), no other layers.
// Usage: SEEDS=20001,20002 node scripts/journey-scale-r20-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20001, 20002, 20003, 20004]);
const DAYCAP = parseInt(process.env.DAYCAP || '185', 10);
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-22', 'journey-scale-r20-covenant');
fs.mkdirSync(EVIDIR, { recursive: true });

const { mulberry32, loadGame, setupGame, runDays } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt');

let _G = null, _currentSeed = null, capture = [];

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function links() { try { return _G.hierarchyState ? (_G.hierarchyState() || []) : []; } catch (e) { return []; } }

const CONVO_DAYS = [60, 90, 120, 150];
const convoFiles = [];
// conversation driver — engage-first (from journey-scale r19, 2026-10-21).
// The r20 pilot's first cut bailed at turn 0 (picked 'leave' when the opener
// offered only yes/no answers) and captured 2-line stubs. Full transcripts
// are the sense-testing bar — answer honestly, engage the want, then leave.
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious',
  'nv:nod', 'nv:smile', 'nv:pointself', 'nv:listen'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
const GQYN = ['gq:yn:unsure', 'gq:yn:honest_pass', 'gq:yn:no', 'gq:yn:yes'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of GQYN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid) {
  const fp = path.join(EVIDIR, `journey-scale-r20-transcript-${_currentSeed}-day${day}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) { log(`THEM: (no line — startConvo returned null for ${vid})`); fs.writeFileSync(fp, L.join('\n')); return fp; }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  fs.writeFileSync(fp, L.join('\n'));
  return fp;
}

function census() {
  const L = links();
  const active = L.filter(l => l && l.status === 'active');
  const cov = active.filter(l => l.kind === 'covenant');
  const seasoned = cov.filter(l => (l.ageDays | 0) >= 30 && (l.trust | 0) >= 40);
  const capText = capture.join('\n');
  const countMark = (re) => { const m = capText.match(re); return m ? m.length : 0; };
  return {
    seed: _currentSeed,
    day: gday(),
    over: !!_G.over,
    overCause: _G.overCause || null,
    popAlive: (_G.state.village.roster || []).filter(id => !person(id).dead).length,
    popTotal: (_G.state.village.roster || []).length,
    pantryKcal: Math.round(pantryKcal()),
    links: active.map(l => ({ kind: l.kind, other: l.primary === 'haven' ? l.subordinate : l.primary, trust: l.trust, ageDays: l.ageDays, status: l.status })),
    covenantActive: cov.length,
    covenantSeasoned: seasoned.length,
    scaleRank: (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })(),
    national: (() => { try { const n = _G.state.nationalPolity || _G.state.polity; return n ? (n.shape || n.kind || true) : null; } catch (e) { return '?'; } })(),
    foundCouncilFired: /founding council/i.test(capText),
    foundCouncilAnswered: /founding council/i.test(capText) && /war-PACT|shared POOL|WALK from this table/i.test(capText),
    poolPourFired: /poured|granary/i.test(capText) && /founding/i.test(capText),
    covenantCrisesFired: countMark(/covenant crisis/gi),
    // answered counters tracked via policy ctx below
    maxWave: (() => { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } })(),
    tableSeat: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).seat || null; } catch (e) { return 'err'; } })(),
    convoFiles: convoFiles.slice(),
  };
}

async function playSeed(seed) {
  _currentSeed = seed;
  capture = [];
  convoFiles.length = 0;
  process.env.COVENANT_ANSWER = (seed === 20001 || seed === 20002) ? 'pact' : 'pool';
  const arm = process.env.COVENANT_ANSWER;
  console.log(`\n===== SEED ${seed} (covenant answer: ${arm}) =====`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r20' });
  _G = Game;
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { cap(a[0]); try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { cap(a[0]); try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const policy = Object.create(scalecourt);
  policy.id = 'journey-scale-r20-scalecourt';
  policy._ctx = null;
  const baseDaily = scalecourt.daily.bind(scalecourt);
  const baseSetup = scalecourt.setup ? scalecourt.setup.bind(scalecourt) : null;
  policy.setup = function (G, ctx) { if (baseSetup) baseSetup(G, ctx); policy._ctx = ctx; };
  policy.daily = function (G, ctx) {
    baseDaily(G, ctx);
    const gd = gday();
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (G.state.village.roster || []).filter(id => id !== G.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = G.npcComm ? G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) {}
      if (vid) { try { convoFiles.push(runConversation(gd, vid)); } catch (e) {} }
    }
  };
  const result = await runDays(Game, policy, {
    days: DAYCAP,
    manifest: { seed, mode: 'journey-scale-r20-covenant', covenantAnswer: arm, date: new Date().toISOString().slice(0, 10), node: process.version },
  });
  const ctx = policy._ctx || {};
  const c = census();
  c.arm = arm;
  c.covenantCrisesAnswered = ctx.covenantCrises | 0;
  c.defenseCalls = ctx.defenseCalls | 0;
  c.tradeCalls = ctx.tradeCalls | 0;
  c.proposedPeer = ctx.proposedPeer | 0;
  c.courtNational = ctx.courtNational | 0;
  const deaths = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (e && e.type === 'death') deaths.push({ day: e.day, who: e.who, cause: e.cause, player: !!e.player });
    }
  } catch (e2) {}
  c.deathLog = deaths;
  const out = { census: c, notes: (ctx.notes || []).slice(-20) };
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r20-covenant-${arm}-${seed}.json`), JSON.stringify(out, null, 1));
  const beatLines = capture.filter(s => /covenant|founding council|granary|mutual defense|pact|pool/i.test(s)).slice(0, 60);
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r20-beats-${seed}.txt`), beatLines.join('\n'));
  console.log(`seed ${seed}: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} cov=${c.covenantActive}/${c.covenantSeasoned} rank=${c.scaleRank} council=${c.foundCouncilFired} crises=${ctx.covenantCrises|0} defense=${ctx.defenseCalls|0} seat=${c.tableSeat}`);
  return c;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    try {
      results.push(await playSeed(seed));
    } catch (e) {
      console.log(`SEED ${seed} CRASH: ${e && e.stack || e}`);
      results.push({ seed, crash: String(e && e.message || e) });
    }
  }
  console.log('\n===== R20 PILOT SUMMARY =====');
  for (const r of results) {
    if (r.crash) { console.log(`seed ${r.seed}: CRASH ${r.crash}`); continue; }
    console.log(`seed ${r.seed} (${r.arm}): day=${r.day} over=${r.over} pop=${r.popAlive}/${r.popTotal} cov=${r.covenantActive}/${r.covenantSeasoned} rank=${r.scaleRank} council=${r.foundCouncilFired}/${r.foundCouncilAnswered} crisesFired~${r.covenantCrisesFired} crisesAns=${r.covenantCrisesAnswered} defense=${r.defenseCalls} seat=${r.tableSeat}`);
  }
})().catch(e => { console.error('DRIVER ERROR:', e && e.stack || e); process.exit(2); });
