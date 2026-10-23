// scripts/journey-scale-r24-20261023.js — journey leg SCALE (days 80–140) R24:
// THE LEAD ROAD, STAY-GREEN + TABLE-APPROACH VOICING (recovery for the
// 2026-10-23 07:45 CDT lane-A run, which EPERM-failed before playing its
// scale leg; rotation was advanced 3→0 by that run, so r24 plays leg 3 and
// writes 0 on completion).
//
// r21 (2026-10-22) proved the lead road aloud: 4/4 national ≤d98, 2/4 global,
// 30001's lesser seat open at d151. r22 did the armor road (structural NO-GO,
// named blocker — Steve's design question, not re-litigated here); r23 did
// the conquest/mercy road (kind answer no longer a trap — GO). r24 replays
// the LEAD road on fresh seeds at the current tip (stay-green) and adds the
// table-approach arm: r23's 60001 reached GLOBAL with seat 'none' (w2 3<4)
// and the run sat silent at the top of the ladder — no Arc IV, no seat
// voicing, no "ledger still wants". L3 asks whether that silence is the
// current-tip behavior on the lead road too, and whether the seat bars are
// voiced anywhere when the approach opens or fails to open.
//
// PRE-REGISTER (2026-10-23, MEASUREMENT.md sections 9-12, 14 — binding):
//   Leg question: on the lead road at the current tip, does the climb stay
//   green (national ≤140, global earned), and is the table approach honest —
//   when the seat opens is it voiced, and when it doesn't (seat 'none' at
//   national/global), does the game name what's missing or sit silent?
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     L1 stay-green — >=2/4 seeds reach national scale at game-day <=140.
//     L2 moment — every national seed has the transition VOICED aloud in the
//       beat capture (sense-read).
//     L3 table-approach honesty — for every seed ending national/global:
//       sample tableSeat() detail weekly + at end; every seat-'full'/'lesser'
//       opening must be voiced aloud (Arc IV / tableAnnounced lines in
//       capture, sense-read); every seed ending national/global with seat
//       'none' is checked for ANY seat-bar voicing ("ledger still wants",
//       withdrawal beat, seat-honest line) — silence is a DOCUMENTED BLANK
//       (finding, not a game bug claim — the approach may be lane B's).
//     L4 people — >=4 full transcripts sense-read in the scale window,
//       0 senseless flags.
//     L5 survival — villages alive+coherent at decision day (150 loop-days)
//       or honest death (death-aware stop, +10d tail max).
//   Interesting-finding bar: whether the tending engine still seasons links
//   at this tip; what the seat detail reads on lead-road globals; whether
//   the Watchers' feast answer still plays; where lead links break.
//   Horizon: DAYCAP=150 loop-days, death-aware stop.
//   PILOT FIRST: 4 seeds 70001-70004 (fresh; r21 30001-30004, r22 40001-40004,
//   r23 60001-60004).
//   Policy: leadcourt (competent + lead-road courtship), no other layers.
// Usage: SEEDS=70001,70002 node scripts/journey-scale-r24-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [70001, 70002, 70003, 70004]);
const DAYCAP = parseInt(process.env.DAYCAP || '150', 10);
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-23', 'journey-scale-r24-lead');
fs.mkdirSync(EVIDIR, { recursive: true });

const { mulberry32, loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

let _G = null, _currentSeed = null, capture = [];
// R24 table-approach instruments: weekly seat samples + global-answer notes,
// reset per seed in playSeed().
let seatWatch = [], globalNotes = [];

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
  const fp = path.join(EVIDIR, `journey-scale-r24-transcript-${_currentSeed}-day${day}.txt`);
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

function seatSample() {
  try {
    const seat = (_G.tableSeat ? _G.tableSeat() : {}) || {};
    const pg = (_G.progState ? _G.progState() : {}) || {};
    return {
      day: gday(),
      seat: seat.seat || 'none',
      detail: seat.detail || null,
      arc: pg.arc || 0,
      tableWaiting: !!pg.tableWaiting,
      tableAnnounced: !!pg.tableAnnounced,
      nationalLive: !!_G.state.nationalLive,
      globalLive: !!_G.state.globalLive,
      viewership: (_G.state.village || {}).viewership == null ? null : Math.round(_G.state.village.viewership),
    };
  } catch (e) { return { day: gday(), err: String(e && e.message) }; }
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
    // the actual voicing markers of the national/global transitions (r21 metric
    // review: "GOVERNANCE LAYER: online" stages the realm, "The shared granary
    // opens" resolves the court — the old /rises national/ markers matched
    // only drama-card text that never reaches the say-capture)
    nationalVoiced: /governance layer: online|the shared granary opens/i.test(capText),
    globalVoiced: /species agency: unlocked/i.test(capText),
    primaryDemandsFired: countMark(/demand|tribute/gi),
    defenseFired: countMark(/defense call|call for aid|defend us/gi),
    maxWave: (() => { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } })(),
    tableSeat: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).seat || null; } catch (e) { return 'err'; } })(),
    tableSeatDetail: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).detail || null; } catch (e) { return null; } })(),
    arcNow: (() => { try { return (_G.progState ? _G.progState().arc : null); } catch (e) { return null; } })(),
    tableWaiting: (() => { try { return !!_G.progState().tableWaiting; } catch (e) { return null; } })(),
    tableAnnounced: (() => { try { return !!_G.progState().tableAnnounced; } catch (e) { return null; } })(),
    seatWatch: seatWatch.slice(),
    globalNotes: globalNotes.slice(),
    convoFiles: convoFiles.slice(),
  };
}

async function playSeed(seed) {
  _currentSeed = seed;
  capture = [];
  convoFiles.length = 0;
  seatWatch = [];
  globalNotes = [];
  console.log(`\n===== SEED ${seed} (lead road) =====`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r24' });
  _G = Game;
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { cap(a[0]); try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { cap(a[0]); try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const policy = Object.create(leadcourt);
  policy.id = 'journey-scale-r24-leadcourt';
  policy._ctx = null;
  const baseDaily = leadcourt.daily.bind(leadcourt);
  const baseSetup = leadcourt.setup ? leadcourt.setup.bind(leadcourt) : null;
  policy.setup = function (G, ctx) { if (baseSetup) baseSetup(G, ctx); policy._ctx = ctx; };
  policy.daily = function (G, ctx) {
    const hadPendingGlobal = !!((G.state || {}).pendingGlobal);
    baseDaily(G, ctx);
    const gd = gday();
    // R24: detect the Watchers answer (leadcourt answers 'feast' in baseDaily)
    if (hadPendingGlobal && !(G.state || {}).pendingGlobal) {
      globalNotes.push({ day: gd, how: 'feast', globalLive: !!G.state.globalLive, viewership: (G.state.village || {}).viewership });
    }
    // R24: weekly seat sample for the table-approach arm
    if (gd % 7 === 0) seatWatch.push(seatSample());
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
    manifest: { seed, mode: 'journey-scale-r24-lead', date: new Date().toISOString().slice(0, 10), node: process.version },
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
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r24-lead-${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r24-capture-${seed}.txt`), capture.join('\n'));
  const beatLines = capture.filter(s => /lead|subordinate|tribute|national|defense|feast|primary|demand|swear|allegiance|granary|court/i.test(s)).slice(0, 120);
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r24-beats-${seed}.txt`), beatLines.join('\n'));
  const momentLines = capture.filter(s => /governance layer: online|the shared granary opens|species agency: unlocked|one fire was a village|coordination layer: online/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r24-moments-${seed}.txt`), momentLines.join('\n'));
  // R24 table-approach arm: every line that voices the approach (or its absence)
  const tableLines = capture.filter(s => /table is being set|ARC IV|the ledger still wants|lesser seat|full seat|the table has your name|does not come|NO HUNGER ON THE RECORD|THE DEEDS ARE NOT|priced for what you built|the ring of pale light/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r24-table-${seed}.txt`), tableLines.join('\n'));
  console.log(`seed ${seed}: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} lead=${c.leadActive}/${c.leadSeasoned} rank=${c.scaleRank} natVoiced=${c.nationalVoiced} globVoiced=${c.globalVoiced} proposed=${ctx.proposedLead|0} tended=${ctx.tended|0} defense=${ctx.defenseCalls|0} seat=${c.tableSeat} arc=${c.arcNow} tW=${c.tableWaiting}`);
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
  console.log('\n===== R24 SUMMARY =====');
  for (const r of results) {
    if (r.crash) { console.log(`seed ${r.seed}: CRASH ${r.crash}`); continue; }
    console.log(`seed ${r.seed}: day=${r.day} over=${r.over} pop=${r.popAlive}/${r.popTotal} lead=${r.leadActive}/${r.leadSeasoned} rank=${r.scaleRank} natV=${r.nationalVoiced} globV=${r.globalVoiced} proposed=${r.proposedLead} tended=${r.tended} defense=${r.defenseCalls} seat=${r.tableSeat} arc=${r.arcNow} tW=${r.tableWaiting} gAns=${(r.globalNotes||[]).length}`);
  }
})().catch(e => { console.error('DRIVER ERROR:', e && e.stack || e); process.exit(2); });
