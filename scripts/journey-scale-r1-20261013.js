#!/usr/bin/env node
// scripts/journey-scale-r1-20261013.js — journey leg SCALE (days 80-140) R1.
// People-check + census harness: plays the competent policy death-aware and
// captures FULL villager conversations at days 85/105/125 (the scale window),
// plus an end-of-run census and death log. SENSE-TESTING LAW: transcripts are
// the evidence, not counts.
//
// Usage: SEEDS="33,44" node scripts/journey-scale-r1-20261013.js
// Output: /tmp/journey-scale-r1-transcript-<seed>-day<day>.txt
//         /tmp/journey-scale-r1-census-<seed>.json
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10);
const CONVO_DAYS = [85, 105, 125];
const CONVO_PER_DAY = 2;

let _G = null, _currentSeed = null;

// ---- engage-first convo driver (from journey-deepening-r9) ----
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
  // beat-driven opening sets (scale-era villagers often open mid-beat):
  // yes/no questions -> honest non-committal; betrayal lures -> decline
  // (competent player doesn't take them); non-verbal sets -> listen/nod.
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
  const fp = `/tmp/journey-scale-r1-transcript-${_currentSeed}-day${day}-${tag}.txt`;
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
    // prefer least-talked-to alive villagers with a working comm channel
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

function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    let mood = null;
    try { mood = _G.npcMood ? _G.npcMood(id) : null; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants,
    };
  });
}
function deathsSoFar() {
  try { return (_G.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}

async function runSeed(seed) {
  _currentSeed = seed;
  console.log(`\n########## SEED ${seed} (journey-scale-r1) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r1', fullTelemetry: true });
  _G = Game;
  // capture scale-beat text markers (moot, national, table, exile)
  let capture = [];
  const cap = (s) => { try { if (typeof s === 'string' && s.length) capture.push(String(s)); } catch (e) {} };
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const policy = Object.assign({}, competent);
  const baseDaily = competent.daily;
  const convoFiles = [];
  policy.daily = function (G, ctx) {
    let gd = 0;
    try { gd = (G.state.scholar || {}).day || 0; } catch (e) {}
    if (CONVO_DAYS.includes(gd)) {
      for (const [i, vid] of pickVillagers().entries()) {
        try { convoFiles.push(runConversation(gd, vid, 'v' + i)); } catch (e) {}
      }
    }
    if (baseDaily) { try { return baseDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS });
  const capText = capture.join('\n');
  // word-boundary matching: naive substring hits are garbage ("moot" matches
  // "smooth", "table" matches "deepening"/"off the table" poker lines).
  const MARKERS = {
    national: [/\bnational\b/i, /\bfirst court\b/i, /\bbinding\b/i, /\bcourt sits\b/i, /\bseasoned\b/i],
    // "watchers" = the audience layer (show fiction), NOT the global scale rung.
    // The global rung's beat ("The Watchers: planetary broadcast tier") never
    // staged on any run; scaleRank() is the honest rung signal (see rows).
    watchers: [/\bwatchers\b/i, /\bplanetary broadcast\b/i],
    table: [/\bthe galactic table\b/i, /\btable prices\b/i, /\btable scene\b/i],
    moot: [/\bmoot\b/i],
    exile: [/\bcast out\b/i, /\bexiled\b/i],
    tribute: [/\btribute\b/i],
  };
  const markerCounts = {};
  for (const [k, pats] of Object.entries(MARKERS)) {
    markerCounts[k] = 0;
    for (const re of pats) {
      const m = capText.match(new RegExp(re.source, 'gi'));
      if (m) markerCounts[k] += m.length;
    }
  }
  const census = buildCensus();
  const deaths = deathsSoFar().map(d => ({ day: d.day, who: d.who, name: (d.who ? vname(d.who) : '?'), cause: d.cause, kind: d.kind }));
  const villagerDeaths = deaths.filter(d => d.kind === 'villager').length;
  const out = {
    seed, maxGameDay: result.gameDays, endReason: result.endReason,
    rosterAlive: census.filter(c => c.alive).length,
    villagerDeaths, monsterSlain: deaths.filter(d => d.kind === 'monster').length,
    markerCounts, convoFiles, census, deaths,
    finalRank: (() => { try { return _G.scaleRank ? _G.scaleRank() : '?'; } catch (e) { return '?'; } })(),
  };
  fs.writeFileSync(`/tmp/journey-scale-r1-census-${seed}.json`, JSON.stringify(out, null, 1));
  console.log(`  seed ${seed}: ${result.gameDays}d ${result.endReason} rosterAlive=${out.rosterAlive} villagerDeaths=${out.villagerDeaths} rank=${out.finalRank} markers=${JSON.stringify(markerCounts)}`);
  return out;
}

if (require.main === module) {
  (async () => {
    for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error('SEED FAIL', s, e && e.message); } }
    console.log('done');
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = { runSeed };
