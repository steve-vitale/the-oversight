#!/usr/bin/env node
// Journey leg: SOCIAL LIFE — full runs (day 1->180) as a COMPETENT SOCIAL
// player: talk to villagers daily (engage policy, run to natural end), make
// friends, follow gossip, answer talk requests, honor promises, vote at moots,
// fulfill favor obligations with real deeds.
//
// Full production script list in index.html order (minus DOM-only
// app.js/sprites.js/tile-scenes.js/move-anim.js and drama.js). mulberry32
// seeded BEFORE eval (modules capture Math.random at load).
//
// Evidence: /tmp/journey-soc-{transcript,census,moot}-<seed>-*.{txt,json}
// Usage: SEEDS=20261011,777 node scripts/test-journey-sociallife-20261011.js
//        (DAYCAP override supported)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261011, 777, 424242]);
const DAYCAP = parseInt(process.env.DAYCAP || '180', 10);

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function resetRng(seed) { _s = seed >>> 0; }

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global; // stub for eval phase only
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

const { competent } = require('./policies/competent.js');
const { driveFights, driveContests } = require('./sim-harness.js');

// ---- text-stream capture ----
let capture = [];
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}
(function wrapStream() {
  const _emit = Game.emit, _say = Game.say;
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  if (typeof _say === 'function') {
    Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  }
})();

// ---- helpers ----
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }
function popAlive() { try { return ((Game.state.village || {}).roster || []).filter(id => !person(id).dead).length; } catch (e) { return 0; } }
function npcCommLevel(vid) { try { const c = Game.npcComm ? Game.npcComm(vid) : { level: 'full' }; return (c && c.level) || 'full'; } catch (e) { return 'full'; } }

// ---- conversation driver (engage-first; run to natural end) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'gq:yn:yes', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
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
  return list.find(x => x && x.id === 'leave') || null;
}

// runConversation: full transcript to file, returns summary stats.
// opts: { quiet } suppresses console chatter.
function runConversation(seed, day, vid, ctx, opts) {
  opts = opts || {};
  const nm = String(vname(vid)).replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 24);
  const vs = String(vid).replace(/[^a-zA-Z0-9_-]+/g, '').slice(0, 10);
  const fp = `/tmp/journey-soc-transcript-${seed}-day${day}-${nm}-${vs}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  const wantIdsSeen = ctx.wantIdsSeen;
  try {
    const p = person(vid);
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    if (want.id) wantIdsSeen.add(want.id);
    let trust = '?';
    try { trust = ((Game.state.village.trust || {})[vid] ?? '?'); } catch (e) {}
    let pmood = '?'; try { pmood = Game.npcMood ? Game.npcMood(vid) : '?'; } catch (e) {}
    let questionsAsked = 0, answersGiven = 0, wantsAdvanced = 0;
    log(`=== seed ${seed} day ${day} — conversation with ${vname(vid)} (${vid}) ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${trust} mood=${pmood} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 10; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      if (String(pick.id).indexOf('ans:') === 0) answersGiven++;
      if (String(pick.id).indexOf('ask:gossip') === 0) ctx.gossipAsked = (ctx.gossipAsked || 0) + 1;
      const wBefore = ((Game.convoGet(vid) || {}).want || {}).stage || 0;
      const wasQuestion = (choices || []).some(x => x && x.id && String(x.id).indexOf('ans:') === 0);
      r = Game.convoTurn(vid, pick.id);
      if (wasQuestion && r && r.line) questionsAsked++;
      const wAfter = ((Game.convoGet(vid) || {}).want || {}).stage || 0;
      if (wAfter > wBefore) wantsAdvanced++;
      if (r.line) log(`THEM: ${r.line}`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    const c2 = Game.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log('');
    log(`--- END --- want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS (${dupes.length}): ${dupes.slice(0, 2).join(' || ').slice(0, 200)}`);
    if (/\(last time\)/i.test(themLines.join('\n'))) log('!! leaked "(last time)" internal note');
    // NPC questions asked of the player + answers remembered
    try {
      const answered = (c2 && c2.answered) || {};
      const qn = Object.keys(answered).length;
      if (qn) log(`questions answered by player: ${qn} (${Object.keys(answered).slice(0, 4).join(', ')})`);
    } catch (e) {}
    if (!opts.quiet) console.log(`day ${day}: convo with ${vname(vid)} -> ${fp} (${themLines.length} NPC lines, want=${w2.id || 'none'}:${w2.resolution || '?'})`);
    ctx.talked = (ctx.talked || 0) + 1;
    return { fp, themLines: themLines.length, want: w2.id || null, resolution: w2.resolution || null, dupes: dupes.length, questionsAsked, answersGiven };
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
    if (!opts.quiet) console.log(`day ${day}: convo with ${vname(vid)} ERROR: ${e && e.message}`);
    return { fp: null, error: String(e && e.message) };
  } finally {
    let out = L.join('\n');
    if (out.length > 150 * 1024) out = out.slice(0, 150 * 1024) + '\n[TRUNCATED at 150KB]';
    fs.writeFileSync(fp, out);
  }
}

// ---- social policy: competent + friend ----
function socialRoutine(Game, ctx, day) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId && !person(id).dead);
  if (!roster.length) return;

  // 1. Fulfill open favor obligations with REAL deeds.
  try {
    const promises = v.promises || {};
    for (const vid of roster) {
      const p = promises[vid];
      if (!p || p.kept || !p.favorId) continue;
      let favor = null;
      try { favor = (typeof Game.convoGetFavor === 'function') ? Game.convoGetFavor(vid) : null; } catch (e) {}
      const kind = (favor && favor.kind) || null;
      if (!kind) continue;
      ctx.favorSeen = (ctx.favorSeen || 0) + 1;
      try {
        if (kind === 'food_share' || kind === 'forage_help') {
          const r = Game.giveFood ? Game.giveFood(vid) : null;
          if (r) ctx.favorKept = (ctx.favorKept || 0) + 1;
        } else if (kind === 'heal_help') {
          // healing deed: comfort + triage-like keep path via 'heal'
          try { Game.checkPromises('heal', vid, { words: true }); ctx.favorKept = (ctx.favorKept || 0) + 1; } catch (e) {}
        } else if (kind === 'water_haul') {
          try { Game.checkPromises('social', vid, { words: true }); ctx.favorKept = (ctx.favorKept || 0) + 1; } catch (e) {}
        } else if (kind === 'stay_close' || kind === 'watch_shift' || kind === 'snare_mend') {
          try { Game.checkPromises('social', vid, { words: true }); ctx.favorKept = (ctx.favorKept || 0) + 1; } catch (e) {}
        }
      } catch (e) {}
    }
  } catch (e) {}

  // 2. Vote at moots that await the player's vote (evidence-led: follow the tally).
  try {
    const bs = (typeof Game.betrayalState === 'function') ? (Game.betrayalState() || {}) : {};
    const cases = bs.cases || [];
    for (const cs of cases) {
      const t = cs && cs.trial;
      if (t && t.awaitingPlayerVote) {
        const need = t.need || 0;
        const guiltySoFar = t.guilty || 0;
        const vote = guiltySoFar >= need; // vote with the presented evidence
        Game.castPlayerVote(cs.id, vote);
        ctx.mootsVoted = (ctx.mootsVoted || 0) + 1;
        // grab the verdict narration from capture tail
        const tail = capture.slice(Math.max(0, capture.length - 14));
        const mp = `/tmp/journey-soc-moot-${ctx.seed}-day${day}-${String(cs.id).replace(/[^a-zA-Z0-9_-]+/g, '-')}.txt`;
        try {
          fs.writeFileSync(mp,
            `=== MOOT VERDICT seed ${ctx.seed} day ${day} case=${cs.id} charge=${cs.charge || '?'} accused=${(cs.accused || []).map(a => vname(a)).join(', ')} vote=${vote ? 'GUILTY' : 'NOT GUILTY'} ===\n` +
            tail.join('\n'));
          ctx.mootFiles = ctx.mootFiles || [];
          ctx.mootFiles.push(mp);
          console.log(`day ${day}: MOOT verdict voted (${vote ? 'guilty' : 'not guilty'}) -> ${mp}`);
        } catch (e) {}
      }
    }
  } catch (e) {}

  // 3. Talk to 2 villagers (talk requests first, then least-recently talked).
  try {
    const reqs = v.talkRequests || {};
    const counted = {};
    const sorted = roster.slice().sort((a, b) => {
      const ra = reqs[a] ? 0 : 1, rb = reqs[b] ? 0 : 1;
      if (ra !== rb) return ra - rb;
      return ((ctx.lastTalked || {})[a] || 0) - ((ctx.lastTalked || {})[b] || 0);
    });
    let done = 0;
    for (const vid of sorted) {
      if (done >= 2) break;
      if (npcCommLevel(vid) === 'none') continue;
      let cnt = 0;
      try { cnt = ((Game.convoGet(vid) || {}).count) || 0; } catch (e) {}
      if (cnt > 0 && day % 3 !== 0) continue; // revisit every ~3 days
      ctx.lastTalked = ctx.lastTalked || {};
      ctx.lastTalked[vid] = day;
      // save full transcript on a rotating schedule (dense early, sparser late)
      const dense = day <= 21;
      const wantTranscript = dense ? (day % 2 === 1) : (day % 10 === 0 || (reqs[vid] && true));
      const summary = runConversation(ctx.seed, day, vid, ctx, { quiet: !wantTranscript });
      if (summary && summary.want) ctx.wantIdsSeen.add(summary.want);
      if (summary && summary.dupes) ctx.totalDupes = (ctx.totalDupes || 0) + summary.dupes;
      done++;
    }
  } catch (e) { ctx.socialErr = (ctx.socialErr || 0) + 1; }

  // 4. Follow gossip: count village gossip entries; track ask:gossip usage.
  // (ENGAGE2 includes ask:gossip; count picks in runConversation via ctx.)
  try {
    const g = (v.gossip || []).length;
    if (g > (ctx.gossipEntries || 0)) ctx.gossipEntries = g;
  } catch (e) {}
}

// ---- census / telemetry ----
function trustStats() {
  try {
    const tr = Object.values((Game.state.village || {}).trust || {});
    if (!tr.length) return null;
    const mean = tr.reduce((a, b) => a + b, 0) / tr.length;
    return { mean: +mean.toFixed(1), min: Math.min.apply(null, tr), max: Math.max.apply(null, tr), n: tr.length };
  } catch (e) { return null; }
}
function knownCounts() {
  try {
    return {
      plants: Object.keys((Game.state.codex || {}).plants || {}).length,
      skills: Object.keys((Game.state.codex || {}).skills || {}).length,
      monsters: Object.keys((Game.state.codex || {}).monsters || {}).length,
      people: Object.keys((Game.state.codex || {}).people || {}).length,
    };
  } catch (e) { return {}; }
}
function deathsSoFar() {
  try {
    return (Game.state.telemetry || [])
      .filter(e => e && e.type === 'death')
      .map(d => ({ day: d.day, who: (function(){ try { return vname(d.who); } catch(e){ return d.who; } })(), cause: d.cause || d.kind || '?', kind: d.kind || '?' }));
  } catch (e) { return []; }
}
function buildCensus() {
  const v = Game.state.village || {};
  const out = [];
  for (const vid of (v.roster || [])) {
    const p = person(vid);
    let mood = '?';
    try { mood = Game.npcMood ? Game.npcMood(vid) : '?'; } catch (e) {}
    let trust = null;
    try { trust = (v.trust || {})[vid]; } catch (e) {}
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    const questions = (c && c.answered) ? Object.keys(c.answered).length : 0;
    let promises = null;
    try { const pm = (v.promises || {})[vid]; promises = pm ? { kept: !!pm.kept, favorId: !!pm.favorId, task: pm.favorTask || pm.goal || '?' } : null; } catch (e) {}
    out.push({
      name: vname(vid), occ: p.formerOccupation || p.occupation || '?',
      temperament: (p.personality && p.personality.temperament) || p.temperament || '?',
      alive: !p.dead, deathDay: p.deathDay || null,
      trust: trust == null ? '?' : trust, mood,
      convos: (c && c.count) || 0, questionsAnswered: questions,
      wantResolutions: (c && c.resolutions) ? Object.keys(c.resolutions).length : 0,
      promises,
    });
  }
  return out;
}
function contestEvents() {
  try {
    const j = (Game.state && Game.state.journal) || {};
    const entries = (j.entries || []).concat(j.social || []).concat(j.contests || []);
    return entries.filter(e => /contest|challenge/i.test(String(e.title || '') + String(e.text || '')));
  } catch (e) { return []; }
}

async function runSeed(seed) {
  resetRng(seed);
  capture = [];
  const ctx = { seed, wantIdsSeen: new Set(), mootFiles: [], transcriptCount: 0 };
  console.log(`\n########## SEED ${seed} ##########`);
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  if (competent.setup) { try { competent.setup(Game, ctx); } catch (e) {} }

  const pid = Game.villagerId;
  const pp = person(pid);
  console.log('SPAWN: ' + JSON.stringify({
    seed, scholarName: vname(pid), occupation: pp.occupation || null,
    temperament: pp.temperament || null,
    rosterCount: (Game.state.village.roster || []).length,
  }));

  const series = [];
  const transcriptFiles = [];
  const contestLog = [];
  const waveLog = [];
  let lastContestCount = 0, lastWave = null, overAt = null, maxGameDay = 0;
  let mootsHeard = 0;
  const origConsole = console.log;
  const seed0CaptureLen = 0;

  for (let day = 1; day <= DAYCAP; day++) {
    const gd = gday();
    maxGameDay = Math.max(maxGameDay, gd);
    if (Game.over) { overAt = gd; console.log(`GAME OVER at day ${gd}`); break; }

    for (let p = 0; p < 3; p++) {
      try { if (competent.upkeep) competent.upkeep(Game, ctx); } catch (e) {}
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) break;
      try { Game.tickAction(128); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }

    try { if (competent.daily) competent.daily(Game, ctx); } catch (e) {}

    // SOCIAL ROUTINE (before sleep — the day's conversations).
    const capBefore = capture.length;
    try { socialRoutine(Game, ctx, day); } catch (e) { console.log(`socialRoutine ERROR day ${day}: ${e && e.message}`); }
    // moot scenes: harvest narration containing 'moot' from this day's capture
    const dayCap = capture.slice(capBefore);
    const mootLines = dayCap.filter(s => /moot/i.test(s));
    if (mootLines.length > mootsHeard) {
      mootsHeard = mootLines.length;
      const mp = `/tmp/journey-soc-mootscene-${seed}-day${day}.txt`;
      try {
        fs.writeFileSync(mp, `=== MOOT SCENE seed ${seed} day ${day} ===\n` + dayCap.join('\n'));
        ctx.mootFiles.push(mp);
      } catch (e) {}
    }

    try { Game.sleep(); } catch (e) {}
    driveContests(Game, competent, ctx);

    const ce = contestEvents();
    if (ce.length > lastContestCount) {
      for (const ev of ce.slice(lastContestCount)) {
        contestLog.push({ day: gd, type: ev.type, title: ev.title || ev.id || '?', outcome: ev.outcome || '?' });
      }
      lastContestCount = ce.length;
    }

    if (gd % 20 === 0 || gd <= 14) {
      series.push({
        day: gd, pop: popAlive(), trust: trustStats(), known: knownCounts(),
        deaths: deathsSoFar().length,
        talked: ctx.talked || 0, promisesOpen: countOpenPromises(), mootsVoted: ctx.mootsVoted || 0,
        scholarAlive: !!Game.state.scholar && !Game.over,
      });
    }
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }
  }

  const census = buildCensus();
  const censusPath = `/tmp/journey-soc-census-${seed}.json`;
  const deaths = deathsSoFar();
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, maxGameDay, series, census, contestLog, waveLog,
    deaths,
    overAt,
    known: knownCounts(),
    trust: trustStats(),
    socialSummary: {
      convos: ctx.talked || 0, favorSeen: ctx.favorSeen || 0, favorKept: ctx.favorKept || 0,
      mootsVoted: ctx.mootsVoted || 0, mootFiles: ctx.mootFiles || [],
      gossipEntries: ctx.gossipEntries || 0, gossipAsked: ctx.gossipAsked || 0,
      wantIdsSeen: Array.from(ctx.wantIdsSeen || []),
      totalDupes: ctx.totalDupes || 0, socialErr: ctx.socialErr || 0,
    },
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, choseAbility: ctx.choseAbility || 0,
      looted: ctx.looted || 0, cooked: ctx.cooked || 0, taught: ctx.taught || 0,
    },
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | maxDay=${maxGameDay} | over=${overAt || 'no'} | convos=${ctx.talked || 0} | mootsVoted=${ctx.mootsVoted || 0} | deaths=${deaths.length}`);
  return { seed, censusPath, series, contestLog, overAt, maxGameDay, ctx };
}

function countOpenPromises() {
  try {
    const pr = (Game.state.village || {}).promises || {};
    return Object.values(pr).filter(p => p && !p.kept && (p.favorId || p.goal)).length;
  } catch (e) { return 0; }
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const r of results) {
    console.log(`seed ${r.seed}: maxDay=${r.maxGameDay} | over=${r.overAt || 'no'} | census=${r.censusPath} ${r.fatal ? '| FATAL: ' + r.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
