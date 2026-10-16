#!/usr/bin/env node
// journey-establishment-r4-20261015.js — ESTABLISHMENT leg (days 14–40):
// village routines, specialists, pantry, first contests, wave 1 → wave 2.
//
// PRE-REGISTER (2026-10-15, MEASUREMENT.md §§9–12, 14):
//   Leg question: on the current tip (many commits since the 2026-10-11
//     establishment pass — feast-surge redesign, wave-3 signature mechanics,
//     succession honesty, villager-agency instruments), does the day 14–40
//     window still deliver: pilot episode + regular contests, wave-1 → wave-2
//     progression, specialist duties, a working pantry, and villagers who
//     read as people in conversation?
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 contests — pilot episode fired by day 40 on ≥3/4 seeds; ≥2 total
//        contest/show events per seed on ≥3/4 seeds.
//     M2 wave-2  — wave-2 ledger > 0 on ≥2/4 seeds by day 40 (wave 1 → 2 is
//        the leg's progression heartbeat; full unlock not required).
//     M3 food    — village alive with pantry ≥ 0 and no scattering at day 40
//        on ≥2/4 seeds (scattering/death is an honest finding, not a fill).
//     M4 people  — ≥6 transcripts sense-read across seeds, 0 senseless.
//     M5 duties  — ≥1 staffed duty (garden/fish/cook/smoke) logged per seed
//        on ≥3/4 seeds.
//     M6 alive   — village alive at day 40 on ≥3/4 seeds.
//   Interesting-finding bar: a NEW blank since the 10-11 pass — something
//     that broke (feast-surge interactions, counter-parity in wave 1,
//     favor/promise closure in the window), a senseless transcript, or a
//     cause-dishonest death.
//   Horizon: 40 days, death-aware stop (runDays stops dead villages).
//   Seeds: 8501–8504 pilot (fresh per-round convention). Policy: competent.
//
// Usage: SEEDS=8501,8502 node scripts/journey-establishment-r4-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [8501, 8502, 8503, 8504]);
const DAYCAP = parseInt(process.env.DAYCAP || '40', 10);
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-15');
try { fs.mkdirSync(EVIDIR, { recursive: true }); } catch (e) {}

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent: BASE } = require('./policies/competent');

let _G = null, _currentSeed = null;
let capture = [];
function cap(s) { if (s != null) { try { capture.push(String(s)); } catch (e) {} } }
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function popAlive() {
  try {
    return (_G.state.village.roster || []).filter(id => { try { return !(_G.getPerson(id) || {}).dead; } catch (e) { return true; } }).length;
  } catch (e) { return null; }
}

// ---- conversation driver (from journey-deepening-r12, engage-first) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
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
const CONVO_DAYS = [20, 30, 38];
const CONVOS_PER_DAY = 2;
function runConversation(day, vid) {
  const fp = path.join(EVIDIR, `journey-establishment-r4-transcript-${_currentSeed}-day${day}-${vid}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) {
      log(`THEM: (no line — startConvo returned null for ${vid}; un-talkable roster id)`);
      log('want final: id=none stage=0 resolution=none (conversation never opened)');
      fs.writeFileSync(fp, L.join('\n'));
      return fp;
    }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = _G.npcMood ? _G.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(c => c && c.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
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
function driveConversations(ctx) {
  if (CONVO_DAYS.indexOf(gday()) < 0) return;
  const roster = (_G.state.village.roster || []).filter(id => {
    try { return !((_G.getPerson(id) || {}).dead) && id !== _G.villagerId; } catch (e) { return false; }
  });
  let done = 0;
  for (const vid of roster) {
    if (done >= CONVOS_PER_DAY) break;
    try {
      const c = _G.convoGet ? _G.convoGet(vid) : null;
      // prefer talkable: attempt startConvo directly (cheap in harness)
    } catch (e) {}
    const fp = runConversation(gday(), vid);
    ctx.convoFiles.push(fp);
    done++;
  }
}

// ---- census ----
function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = _G.agencyOf ? _G.agencyOf(id) : null; } catch (e) {}
    // agencyOf returns the VILLAGE-wide agency state; per-villager XP is
    // keyed by id inside it (same convention as contestEngine/fieldFights).
    // Reading ax.xp whole puts the full map on every villager (identical XP
    // for all) — the 2026-10-11 journey-establishment fix G.
    let axp = null;
    try { axp = ((ax || {}).xp || {})[id] || null; } catch (e2) {}
    let mood = null;
    try { mood = _G.npcMood ? _G.npcMood(id) : null; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants,
      agencyXP: axp,
    };
  });
}

function pantryKcal() {
  try {
    const v = _G.state.village || {};
    if (v.pantry && Array.isArray(v.pantry)) {
      return v.pantry.reduce((t, it) => t + (it.kcal || 0), 0);
    }
    return v.pantryKcal || 0;
  } catch (e) { return null; }
}

function makePolicy() {
  const policy = Object.create(BASE);
  policy.id = 'journey-establishment-r4-competent';
  policy.setup = function (G, ctx) {
    BASE.setup(G, ctx);
    policy._ctx = ctx;
    ctx.convoFiles = [];
    ctx.liveEvents = [];   // side-channel: contest/show/wave/duty/death events as they fire
    ctx.deathMislabels = [];
    ctx._deaths = [];
    const _tele = G.tele;
    G.tele = function (type, data) {
      try {
        if (/contest|show_aired|prize_|wave|duty_|garden|fish|smoke_|cook_|scattering|famine|funeral|moot/i.test(String(type))) {
          const s0 = (G.state && G.state.scholar) || {};
          ctx.liveEvents.push({ day: s0.day || 0, type, data: data && (data.id || data.contestId || data.name || data.kind || data.what) });
        }
        if (type === 'death') {
          const s0 = (G.state && G.state.scholar) || {};
          ctx._deaths.push({ day: s0.day || 0, who: data && data.who, cause: data && data.cause, kind: data && data.kind });
        }
      } catch (e) {}
      return _tele.apply(this, arguments);
    };
  };
  policy.daily = function (G, ctx) {
    if (BASE.daily) BASE.daily(G, ctx);
    try { driveConversations(ctx); } catch (e) { ctx.notes.push('convo driver: ' + e.message); }
  };
  return policy;
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  console.log(`\n########## SEED ${seed} POLICY=journey-establishment-r4-competent ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-establishment-r4', fullTelemetry: true });
  _G = Game;
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return _emit.apply(this, a); } };
  }
  // death-honesty wrap (from deepening r10): verify epitaph carries the cause
  try {
    if (typeof Game.playerDeath === 'function') {
      const _pd = Game.playerDeath.bind(Game);
      const ctx0 = null;
      Game.playerDeath = function (cause) {
        const c = String(cause || 'the wild');
        const mark = capture.length;
        const r = _pd(cause);
        const epitaph = capture.slice(mark, mark + 14).map(x => String(x));
        const epLine = epitaph.find(x => /is dead —/.test(x)) || '';
        const honest = !/starvat/i.test(epLine) || /starvat/i.test(c);
        if (!honest) console.log(`*** MISLABEL day ${gday()}: recorded=${c} epitaph=${epLine.slice(0, 120)}`);
        else console.log(`*** PLAYER DEATH day ${gday()}: cause=${c} epitaph=${epLine.slice(0, 120)}`);
        return r;
      };
    }
  } catch (e) { console.log('playerDeath wrap ERROR: ' + (e && e.message)); }
  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-establishment-r4', date: new Date().toISOString().slice(0, 10), node: process.version } });
  const ctx = policy._ctx || {};

  // contests from telemetry (ring has 300 cap — 40 days won't fill it, but
  // read the live side-channel too and merge)
  const teleContests = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (!e || !e.type) continue;
      if (/^(contest_fired|contest_end|show_aired|prize_)/.test(e.type)) teleContests.push({ day: e.day, type: e.type, info: e.data && (e.data.contestId || e.data.id || e.data.name) });
    }
  } catch (e2) {}

  // wave-2 ledger
  let ledger = null, w2Day = null;
  try { ledger = Object.assign({}, Game.state.waveLedger); } catch (e2) {}
  // wave-2 unlock day: read from live events
  const w2ev = (ctx.liveEvents || []).find(e => /wave.*2.*unlock|wave2|wave_2/i.test(e.type + '' + JSON.stringify(e.data)));
  if (w2ev) w2Day = w2ev.day;

  // specialist duties fired (garden/fish/cook/smoke duty events)
  const dutyEvents = (ctx.liveEvents || []).filter(e => /duty|garden|fish|smoke|cook/i.test(String(e.type)));

  // specialist duties fire through say(), not telemetry — scan the capture
  // ("works the garden", "worked the creek", "cooked for the haven",
  //  "worked the smoke racks"). Dedupe per-line.
  const dutyDays = { garden: 0, fish: 0, cook: 0, smoke: 0 };
  try {
    const seen = new Set();
    for (const line of capture) {
      if (seen.has(line)) continue;
      if (/works the garden/.test(line)) { dutyDays.garden++; seen.add(line); }
      else if (/worked the creek/.test(line)) { dutyDays.fish++; seen.add(line); }
      else if (/cooked for the haven/.test(line)) { dutyDays.cook++; seen.add(line); }
      else if (/worked the smoke racks/.test(line)) { dutyDays.smoke++; seen.add(line); }
    }
  } catch (e2) {}

  // pilot episode: announced via sysSay (captured), flag in state
  let pilotAired = false, pilotLines = [];
  try { pilotAired = !!Game.state.pilotAired; } catch (e2) {}
  try {
    pilotLines = capture.filter(l => /PILOT EPISODE/.test(String(l))).slice(0, 4).map(String);
  } catch (e2) {}

  const out = {
    seed, policy: 'journey-establishment-r4-competent',
    maxGameDay: result.gameDays, endReason: result.endReason,
    finalWave: waveNow(),
    pilotAired, pilotLines,
    waveLedger: ledger, wave2UnlockDay: w2Day,
    pantryKcal: pantryKcal(),
    popAlive: popAlive(),
    deaths: ctx._deaths || [],
    dutyDays,
    contestTelemetry: teleContests,
    liveContestEvents: (ctx.liveEvents || []).filter(e => /contest|show_aired|prize_/i.test(String(e.type))),
    dutyEvents: dutyEvents.map(d => ({ day: d.day, type: d.type, data: d.data })),
    census: buildCensus(),
    convoFiles: ctx.convoFiles || [],
    notes: ctx.notes || [],
    pacing: result.pacing,
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-establishment-r4-competent-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  console.log(`SEED ${seed} DONE: day=${out.maxGameDay} end=${out.endReason} wave=${out.finalWave} pop=${out.popAlive} pantry=${out.pantryKcal} contests=${out.liveContestEvents.length}+${teleContests.length} duties=${JSON.stringify(out.dutyDays)} convos=${out.convoFiles.length} ms=${result.ms} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const s of summary) {
    const died = (s.deaths || []).length;
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} wave=${s.finalWave} pop=${s.popAlive} deaths=${died} pantry=${s.pantryKcal} contests=${((s.liveContestEvents || []).length)} duties=${JSON.stringify(s.dutyDays)} convos=${(s.convoFiles || []).length}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
}

main().catch(e => { console.error('MAIN FATAL: ' + (e && e.stack || e)); process.exit(1); });
