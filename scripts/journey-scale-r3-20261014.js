#!/usr/bin/env node
// scripts/journey-scale-r3-20261014.js — journey leg SCALE (days 80–140) R3.
// R2 (2026-10-14 00:45) ran courtship policies (leadcourt/belongseek): national
// beats PLAY, 3/5 national, reachability via diplomacy established. R3 asks the
// COMPETENT question on the current tip: deepening r10 showed competent now
// seasons links (4/8) and unlocked wave-4 organically (8106, war path) — so
// does the scale window (days 80–140) now PLAY for a competent player, or does
// it still pass silently (R1's finding on the old tip)?
// Two arms: POLICY=competent baseline (gates OFF, pinned) vs POLICY_TAG suffix
// 'armed' with COMPETENT_TALK=1 COMPETENT_SURPLUS_FEAST=1 (blitz simpolicy
// layers — the load-bearing conversation + feast verbs R1 flagged missing).
// Usage: SEEDS="11,22" POLICY=competent POLICY_TAG=competent-armed \
//          COMPETENT_TALK=1 COMPETENT_SURPLUS_FEAST=1 \
//          node scripts/journey-scale-r3-20261014.js
// Output: evidence/2026-10-14/journey-scale-r3-<tag>-<seed>.json (per-seed
//         evidence for telemetry-check) + transcripts under /tmp.
// Link-seasoning timeline sampled at days 70/85/100/120: seasoned =
// age>=30d && trust>=40 (SCALE.md).
//
// Usage: SEEDS="11,22" POLICY=leadcourt node scripts/journey-scale-r3-20261014.js
//        REFUSE_TEST=1 answers 'refuse' on the first beat of that run.
// Output: evidence/2026-10-14/journey-scale-r3-<policy>-<seed>.json (per-seed
//         evidence for telemetry-check) + transcripts under /tmp.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '11,22').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const POLICY_NAME = process.env.POLICY || 'competent';
const POLICY_TAG = process.env.POLICY_TAG || POLICY_NAME;
const REFUSE_TEST = !!process.env.REFUSE_TEST;
const DAYS = parseInt(process.env.DAYS || '150', 10);
const CONVO_DAYS = [85, 105, 125];
const LINK_SNAP_DAYS = [70, 85, 100, 120];
const CONVO_PER_DAY = 2;
const EVIDENCE_DIR = 'evidence/2026-10-14';

let _G = null, _currentSeed = null;

// ---- engage-first convo driver (from journey-scale-r1-20261013.js) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  const yn = list.find(x => x && x.id === 'gq:yn:unsure') || list.find(x => x && x.id === 'gq:yn:yes') || list.find(x => x && x.id === 'gq:yn:no');
  if (yn) return yn;
  const bdec = list.find(x => x && x.id === 'betrayal:decline');
  if (bdec) return bdec;
  const nv = list.find(x => x && x.id === 'nv:listen') || list.find(x => x && x.id === 'nv:nod') || list.find(x => x && x.id && x.id.indexOf('nv:') === 0);
  if (nv) return nv;
  return list.find(x => x && x.id === 'leave') || list[0] || null;
}
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }

function runConversation(day, vid, tag) {
  const fp = `/tmp/journey-scale-r3-${POLICY_TAG}-${_currentSeed}-day${day}-${tag}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
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
      const pick = pickChoice(choices, turn);
      if (!pick) { log('YOU: (no usable choice; ending)'); break; }
      if (pick.id === 'leave') { log('YOU: (leave)'); break; }
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

function pickVillagers() {
  try {
    const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
    const alive = roster.filter(id => !person(id).dead);
    const scored = alive.map(id => {
      let cnt = 999;
      try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
      let commOk = true;
      try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; commOk = comm.level !== 'none'; } catch (e) {}
      return { id, cnt, commOk };
    }).filter(x => x.commOk).sort((a, b) => a.cnt - b.cnt);
    return scored.slice(0, CONVO_PER_DAY).map(x => x.id);
  } catch (e) { return []; }
}

// ---- beat answering strategy (docs/SCALE.md canon options) ----
const BEAT_OPTIONS = {
  lead: ['feast', 'host', 'cold'],
  belong: ['swear', 'serve', 'walk'],
  covenant: ['pact', 'pool', 'walk'],
  trade: ['sign', 'bargain', 'walk'],
  conquest: ['mercy', 'yoke', 'release'],
};
function chooseBeatAnswer(shape, nthForShape, runCtx) {
  if (REFUSE_TEST && runCtx.beatsAnswered === 0) return 'refuse';
  const opts = BEAT_OPTIONS[shape] || ['refuse'];
  return opts[Math.min(nthForShape, opts.length - 1)];
}

async function runSeed(seed) {
  _currentSeed = seed;
  console.log(`\n########## SEED ${seed} policy=${POLICY_NAME} (journey-scale-r3) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r3', fullTelemetry: true });
  _G = Game;
  // capture engine text with day stamps
  let dayBuf = [];
  const runCtx = { beats: [], beatsAnswered: 0, shapeCount: {}, rankDays: {}, lastRank: null, convos: [], globalAnswered: 0, seenPn: null, seenPg: null, linkSnaps: {} };
  const cap = (s) => {
    try {
      if (typeof s === 'string' && s.length) {
        const d = ((Game.state.scholar || {}).day) || 0;
        dayBuf.push({ day: d, text: String(s) });
        if (dayBuf.length > 400) dayBuf.splice(0, dayBuf.length - 400);
      }
    } catch (e) {}
  };
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  let policyMod;
  try { policyMod = require(`./policies/${POLICY_NAME}`); } catch (e) { throw new Error('unknown policy ' + POLICY_NAME); }
  const base = policyMod[POLICY_NAME] || policyMod;
  const policy = Object.assign({}, base);
  const baseDaily = base.daily;

  const BEAT_MARKERS = {
    lead: /first court/i, conquest: /Iron Court/i, covenant: /founding council/i,
    trade: /charter/i, belong: /oath of the realm/i, global: /Broadcast tier: planetary|world feed/i,
  };
  function dumpBeatContext(pn, day, shape) {
    // find the staging block: search backwards for the shape's marker line —
    // the beat stages "the morning after the deed" and the daily hook may
    // see it later, so day-filtering misses the block.
    const marker = BEAT_MARKERS[shape] || /./;
    let idx = -1;
    for (let i = dayBuf.length - 1; i >= 0; i--) {
      if (marker.test(dayBuf[i].text)) { idx = i; break; }
    }
    let lines;
    if (idx >= 0) lines = dayBuf.slice(Math.max(0, idx - 2), idx + 15).map(e => `[d${e.day}] ${e.text}`);
    else lines = dayBuf.slice(-40).map(e => `[d${e.day}] ${e.text}`);
    const beat = JSON.parse(JSON.stringify(pn));
    delete beat._r2captured;
    return { beatDay: day, beat, stagingLines: lines };
  }

  function snapLinks() {
    // seasoned = age>=30d && trust>=40 (docs/SCALE.md); shape matches
    // journey-deepening-r10's linkSnap for cross-run comparison.
    let gd = 0;
    try { gd = (Game.state.scholar || {}).day || 0; } catch (e) {}
    let links = [];
    try { links = _G.hierarchyState() || []; } catch (e) {}
    return links.map(l => {
      const other = (l.primary === 'haven' ? l.subordinate : l.primary) || (l.a === 'haven' ? l.b : l.a) || '?';
      const age = gd - (l.day || 0);
      return { id: String(l.id).slice(-6), kind: l.kind || 'hier', other, status: l.status,
               trust: Math.round(l.trust || 0), age, arrears: l.arrears || 0,
               seasoned: age >= 30 && (l.trust || 0) >= 40 };
    });
  }

  function watchBeats() {
    let gd = 0;
    try { gd = (Game.state.scholar || {}).day || 0; } catch (e) {}
    // fill aftermath lines for yesterday's answered beat (effects are
    // emitted in later ticks, not synchronously by the answer call)
    if (runCtx.openBeat && runCtx.openBeat.beatDay < gd) {
      runCtx.openBeat.followLines = dayBuf.slice(-30).map(e => `[d${e.day}] ${e.text}`);
      runCtx.openBeat = null;
    }
    // scale rank timeline
    let rank = '?';
    try { rank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
    if (runCtx.lastRank === null) runCtx.lastRank = rank;
    if (rank !== runCtx.lastRank) {
      runCtx.rankDays[rank] = gd;
      runCtx.lastRank = rank;
    }
    // national beat (single slot; identity-tracked so a later re-stage is a new beat)
    const pn = (Game.state || {}).pendingNational;
    if (pn && runCtx.seenPn !== pn) {
      runCtx.seenPn = pn;
      const shape = pn.shape || 'lead';
      const nth = runCtx.shapeCount[shape] || 0;
      const answer = chooseBeatAnswer(shape, nth, runCtx);
      const entry = dumpBeatContext(pn, gd, shape);
      entry.answer = answer;
      entry.nthForShape = nth;
      try {
        const before = dayBuf.length;
        const res = Game.answerNationalChoice(answer);
        entry.answerResult = (typeof res === 'object' ? JSON.stringify(res) : String(res)).slice(0, 200);
        entry.answerLines = dayBuf.slice(before).map(e => String(e.text)).slice(0, 20);
      } catch (e) { entry.answerResult = 'ERROR: ' + (e && e.message); }
      entry.followLines = [];
      runCtx.openBeat = entry;
      runCtx.beats.push(entry);
      runCtx.beatsAnswered++;
      runCtx.shapeCount[shape] = nth + 1;
      console.log(`  DAY ${gd}: national beat staged shape=${shape} villages=${(pn.villages || []).join(',')} answered='${answer}' (${entry.answerResult})`);
    }
    // global beat (probably never stages; capture if it does)
    const pg = (Game.state || {}).pendingGlobal;
    if (pg && runCtx.seenPg !== pg && runCtx.globalAnswered === 0) {
      runCtx.seenPg = pg;
      const entry = dumpBeatContext(pg, gd, 'global');
      entry.answer = 'champion';
      try { const res = Game.answerGlobalChoice('champion'); entry.answerResult = (typeof res === 'object' ? JSON.stringify(res) : String(res)).slice(0, 200); } catch (e) { entry.answerResult = 'ERROR: ' + (e && e.message); }
      entry.followLines = [];
      runCtx.openBeat = entry;
      runCtx.beats.push(entry);
      runCtx.globalAnswered++;
      console.log(`  DAY ${gd}: GLOBAL beat staged — answered 'champion'`);
    }
  }

  policy.daily = function (G, ctx) {
    let gd = 0;
    try { gd = (G.state.scholar || {}).day || 0; } catch (e) {}
    if (CONVO_DAYS.includes(gd)) {
      for (const [i, vid] of pickVillagers().entries()) {
        try { runCtx.convos.push(runConversation(gd, vid, 'v' + i)); } catch (e) {}
      }
    }
    watchBeats();
    if (LINK_SNAP_DAYS.includes(gd) && !runCtx.linkSnaps[gd]) {
      runCtx.linkSnaps[gd] = snapLinks();
    }
    if (baseDaily) { try { return baseDaily(G, ctx); } catch (e) {} }
  };

  const result = await runDays(Game, policy, { days: DAYS });
  watchBeats();

  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  const census = roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    return { id, name: vname(id), alive: !p.dead, occupation: p.formerOccupation || p.occupation || null,
      trust: (trust[id] !== undefined) ? trust[id] : null, plantsKnown: plants };
  });
  const deaths = ((_G.state.telemetry || []).filter(e => e && e.type === 'death'))
    .map(d => ({ day: d.day, who: d.who, name: d.who ? vname(d.who) : '?', cause: d.cause, kind: d.kind }));
  const capText = dayBuf.map(e => e.text).join('\n');
  const MARKERS = {
    national: [/\bnational\b/i, /\bfirst court\b/i, /\bbinding\b/i, /\bcourt sits\b/i, /\bseasoned\b/i],
    watchers: [/\bplanetary broadcast\b/i],
    table: [/\bthe galactic table\b/i, /\btable prices\b/i, /\btable scene\b/i],
    moot: [/\bmoot\b/i],
    exile: [/\bcast out\b/i, /\bexiled\b/i],
    tribute: [/\btribute\b/i],
    wave4: [/\bwave 4\b/i, /\bwave four\b/i],
    wave5: [/\bwave 5\b/i, /\bwave five\b/i],
  };
  const markerCounts = {};
  for (const [k, pats] of Object.entries(MARKERS)) {
    markerCounts[k] = 0;
    for (const re of pats) {
      const m = capText.match(new RegExp(re.source, 'gi'));
      if (m) markerCounts[k] += m.length;
    }
  }
  let finalRank = '?';
  try { finalRank = _G.scaleRank ? _G.scaleRank() : '?'; } catch (e) {}
  const out = {
    leg: 'scale', script: 'journey-scale-r3-20261014', seed, policy: POLICY_NAME, refuseTest: REFUSE_TEST,
    maxGameDay: result.gameDays, endReason: result.endReason,
    rosterAlive: census.filter(c => c.alive).length, rosterSize: census.length,
    villagerDeaths: deaths.filter(d => d.kind === 'villager').length,
    monsterSlain: deaths.filter(d => d.kind === 'monster').length,
    finalRank, rankDays: runCtx.rankDays, beats: runCtx.beats, shapeCount: runCtx.shapeCount,
    linkSnaps: runCtx.linkSnaps,
    markerCounts, convos: runCtx.convos, census, deaths,
    nationalLive: !!((_G.state || {}).nationalLive),
    networkLive: !!((_G.state || {}).networkLive),
    globalLive: !!((_G.state || {}).globalLive),
  };
  const fp = `${EVIDENCE_DIR}/journey-scale-r3-${POLICY_TAG}-${seed}.json`;
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  console.log(`  seed ${seed}: ${result.gameDays}d ${result.endReason} rank=${finalRank} rankDays=${JSON.stringify(runCtx.rankDays)} beats=${runCtx.beats.length} deaths=${deaths.filter(d => d.kind === 'villager').length}`);
  return out;
}

if (require.main === module) {
  (async () => {
    for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error('SEED FAIL', s, e && e.message); } }
    console.log('done');
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = { runSeed };
