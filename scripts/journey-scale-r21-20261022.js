// scripts/journey-scale-r21-20261022.js — journey leg SCALE (days 80–140) R21:
// THE LEAD ROAD. The r-line proved belong/trade (r12–r18) and covenant (r20)
// aloud in the scale window; the LEAD road (primary-Haven subordinate links,
// tribute, tending, bids for primacy) has baselines (scale-lead.json) but no
// r-line pilot since the scale-wall fix landed the tending engine (tendLink,
// weekly grain → trust). The 2026-10-12 god-jealousy diagnosis found LEAD
// structurally unreachable (P(seasoning)=0 for links 2+); this pilot tests
// whether that diagnosis is resolved in play on current master.
//
// PRE-REGISTER (2026-10-22, MEASUREMENT.md sections 9-12, 14):
//   Leg question: on the LEAD road, does a competent player reach national
//   scale in days 80–140, and does the regional→national transition FEEL
//   like a moment (voiced, consequential) rather than a silent threshold?
//   Do primary demands, tribute beats, defense calls, and the national
//   'feast' choice play aloud and honestly?
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 road-alive — >=2/4 seeds form >=2 lead (primary-Haven) links.
//     M2 national — >=2/4 seeds reach national scale at game-day <=140.
//     M3 moment — every national seed has the transition VOICED aloud in the
//       beat capture (sense-read, not just a flag flip).
//     M4 honesty — every fired primary demand / defense call answered aloud
//       (policy ctx answered counts vs fired markers in capture).
//     M5 people — >=4 full transcripts sense-read, 0 senseless flags.
//     M6 survival — villages alive+coherent at decision day (150 loop-days)
//       or honest death (death-aware stop, +10d tail max).
//   Interesting-finding bar: whether the tending engine seasons links; what
//   primary demands ask; whether 'feast' plays aloud; whether the transition
//   feels like a moment; where lead links break (trust drift vs tending).
//   Horizon: DAYCAP=150 loop-days, death-aware stop.
//   PILOT FIRST: 4 seeds 30001-30004 (fresh, disjoint from r1-r20).
//   Policy: leadcourt (competent + lead-road courtship), no other layers.
// Usage: SEEDS=30001,30002 node scripts/journey-scale-r21-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [30001, 30002, 30003, 30004]);
const DAYCAP = parseInt(process.env.DAYCAP || '150', 10);
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-22', 'journey-scale-r21-lead');
fs.mkdirSync(EVIDIR, { recursive: true });

const { mulberry32, loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

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

const CONVO_DAYS = [60, 90, 120, 140];
const convoFiles = [];
// conversation driver — engage-first (from journey-scale r19/r20).
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
  const fp = path.join(EVIDIR, `journey-scale-r21-transcript-${_currentSeed}-day${day}.txt`);
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
  const day = gday();
  const active = L.filter(l => l && l.status === 'active');
  const lead = active.filter(l => l.primary === 'haven');
  const seasoned = lead.filter(l => ((day - (l.day | 0)) >= 30) && (l.trust | 0) >= 40);
  const capText = capture.join('\n');
  const countMark = (re) => { const m = capText.match(re); return m ? m.length : 0; };
  const rank = (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })();
  return {
    seed: _currentSeed,
    day: day,
    over: !!_G.over,
    overCause: _G.overCause || null,
    popAlive: (_G.state.village.roster || []).filter(id => !person(id).dead).length,
    popTotal: (_G.state.village.roster || []).length,
    pantryKcal: Math.round(pantryKcal()),
    links: active.map(l => ({ kind: l.kind || (l.primary ? 'primary-sub' : '?'), primary: l.primary === 'haven', other: l.primary === 'haven' ? l.subordinate : (l.primary || l.a), trust: l.trust, ageDays: day - (l.day | 0), status: l.status })),
    leadActive: lead.length,
    leadSeasoned: seasoned.length,
    scaleRank: rank,
    nationalLive: (rank === 'national' || rank === 'global'),
    nationalDay: (() => { try { return _G.state.nationalDay || null; } catch (e) { return null; } })(),
    globalDay: (() => { try { return _G.state.globalDay || null; } catch (e) { return null; } })(),
    networkLiveDay: (() => { try { return _G.state.networkLiveDay || null; } catch (e) { return null; } })(),
    // the actual voicing markers of the national/global transitions (not /national/i — matches 'swears')
    nationalVoiced: /rises national|the realm bows|the first court sat|the oath was sworn/i.test(capText),
    globalVoiced: /species agency: unlocked/i.test(capText),
    primaryDemandsFired: countMark(/demand|tribute/gi),
    defenseFired: countMark(/defense call|call for aid|defend us/gi),
    maxWave: (() => { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } })(),
    tableSeat: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).seat || null; } catch (e) { return 'err'; } })(),
    convoFiles: convoFiles.slice(),
  };
}

async function playSeed(seed) {
  _currentSeed = seed;
  capture = [];
  convoFiles.length = 0;
  console.log(`\n===== SEED ${seed} (lead road) =====`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r21' });
  _G = Game;
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { cap(a[0]); try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { cap(a[0]); try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const policy = Object.create(leadcourt);
  policy.id = 'journey-scale-r21-leadcourt';
  policy._ctx = null;
  const baseDaily = leadcourt.daily.bind(leadcourt);
  const baseSetup = leadcourt.setup ? leadcourt.setup.bind(leadcourt) : null;
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
    manifest: { seed, mode: 'journey-scale-r21-lead', date: new Date().toISOString().slice(0, 10), node: process.version },
  });
  const ctx = policy._ctx || {};
  const c = census();
  c.proposedLead = ctx.proposedLead | 0;
  c.tended = ctx.tended | 0;
  c.defenseCalls = ctx.defenseCalls | 0;
  c.courtNational = ctx.courtNational | 0;
  const deaths = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (e && e.type === 'death') deaths.push({ day: e.day, who: e.who, cause: e.cause, player: !!e.player });
    }
  } catch (e2) {}
  c.deathLog = deaths;
  const out = { census: c, notes: (ctx.notes || []).slice(-20) };
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r21-lead-${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r21-capture-${seed}.txt`), capture.join('\n'));
  const beatLines = capture.filter(s => /lead|subordinate|tribute|national|defense|feast|primary|demand|swear|allegiance|granary|court/i.test(s)).slice(0, 120);
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r21-beats-${seed}.txt`), beatLines.join('\n'));
  const momentLines = capture.filter(s => /rises national|the realm bows|the first court sat|the oath was sworn|species agency: unlocked|one fire was a village|coordination layer: online/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r21-moments-${seed}.txt`), momentLines.join('\n'));
  console.log(`seed ${seed}: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} lead=${c.leadActive}/${c.leadSeasoned} rank=${c.scaleRank} natVoiced=${c.nationalVoiced} globVoiced=${c.globalVoiced} proposed=${ctx.proposedLead|0} tended=${ctx.tended|0} defense=${ctx.defenseCalls|0} seat=${c.tableSeat}`);
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
  console.log('\n===== R21 PILOT SUMMARY =====');
  for (const r of results) {
    if (r.crash) { console.log(`seed ${r.seed}: CRASH ${r.crash}`); continue; }
    console.log(`seed ${r.seed}: day=${r.day} over=${r.over} pop=${r.popAlive}/${r.popTotal} lead=${r.leadActive}/${r.leadSeasoned} rank=${r.scaleRank} natV=${r.nationalVoiced} globV=${r.globalVoiced} proposed=${r.proposedLead} tended=${r.tended} defense=${r.defenseCalls} seat=${r.tableSeat}`);
  }
})().catch(e => { console.error('DRIVER ERROR:', e && e.stack || e); process.exit(2); });
