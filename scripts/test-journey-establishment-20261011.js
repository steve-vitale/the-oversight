#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) — competent-player playthrough, 3 seeds.
// Reuses the landing harness's eval boilerplate; day-driving uses the
// shared competent policy (scripts/policies/competent.js) and the
// driveFights/driveContests loops from sim-harness.js. Text capture stays ON
// (unlike long sims) so transcripts and contest narration are readable.
//
// Usage: node scripts/test-journey-establishment-20261011.js   (seeds 20261011, 777, 424242)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261011, 777, 424242]);

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

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

// ---- text-stream capture: wrap BOTH say and emit, dedupe adjacent repeats ----
let capture = [];
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return; // say→emit double path
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

const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}

function pantryStats() {
  try {
    const p = (Game.state.village && Game.state.village.pantry) || [];
    let kcal = 0, preserved = 0;
    for (const i of p) {
      const k = (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0);
      kcal += k;
      const fs = (i.foodState || '').toLowerCase();
      if (/smok|render|pemmican|dried|preserv/.test(fs)) preserved += k;
    }
    return { kcal: Math.round(kcal), preserved: Math.round(preserved), items: p.length };
  } catch (e) { return { kcal: null, preserved: null, items: null }; }
}
function deathsSoFar() {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function contestEvents() {
  try {
    return (Game.state.telemetry || []).filter(e => e && (e.type === 'contest_fired' || e.type === 'contest_end' || e.type === 'show_aired'));
  } catch (e) { return []; }
}
function popAlive() {
  try {
    return (Game.state.village.roster || []).filter(id => { const p = person(id); return !p.dead; }).length;
  } catch (e) { return null; }
}
function waveNow() { try { return Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { return null; } }
function dutiesStaffed() {
  try {
    const d = (Game.state.village && Game.state.village.assignments) || {};
    const out = {};
    for (const k of Object.keys(d)) {
      const v = d[k];
      out[k] = (v && v.task) ? v.task : v;
    }
    return out;
  } catch (e) { return null; }
}
function knownCounts() {
  try {
    return {
      plants: Object.keys((Game.state.codex || {}).plants || {}).length,
      skills: Object.keys((Game.state.codex || {}).skills || {}).length,
      monsters: Object.keys((Game.state.codex || {}).monsters || {}).length,
    };
  } catch (e) { return null; }
}

function runConversation(seed, day, vid) {
  const fp = `/tmp/journey-est-transcript-${seed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${seed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = Game.npcMood ? Game.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${p.temperament || '?'} trust=${((Game.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log(`opening menu (${(r0.choices || []).length} choices):`);
    for (const ch of (r0.choices || [])) log(`  [${ch.id}] ${String(ch.label || '').slice(0, 120)}`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      log('');
      log(`menu (${(choices || []).length}): ` + (choices || []).map(ch => `[${ch && ch.id}] ${String((ch && ch.label) || '').slice(0, 60)}`).join(' | '));
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = Game.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (Game.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    log('');
    log('--- END ---');
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = Game.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    log(`transcript entries: ${t.length}`);
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
    const allText = themLines.join('\n');
    if (/\(last time\)/i.test(allText)) log('!! leaked "(last time)" internal note');
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

function buildCensus() {
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const trust = (Game.state.village && Game.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (Game.plantsKnownBy(id) || []).length; } catch (e) {}
    // agencyOf(vid) returns the GLOBAL agency state (xp keyed by villager id)
    // — reading .xp directly gives every villager the identical whole map.
    // Per-villager: (agencyOf(id).xp||{})[id] (same convention as
    // contestEngine.js / fieldFights.js).
    let axp = null;
    try { const a = Game.agencyOf ? Game.agencyOf(id) : null; axp = (a && a.xp && a.xp[id]) || null; } catch (e) {}
    let mood = null;
    try { mood = Game.npcMood ? Game.npcMood(id) : null; } catch (e) {}
    return {
      id, name: vname(id),
      alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood: mood,
      plantsKnown: plants,
      agencyXP: axp,
    };
  });
}

const CONVO_DAYS = [15, 20, 25, 30, 35, 40];

async function runSeed(seed) {
  _s = seed >>> 0;
  capture = [];
  // TELEMETRY SIDE-CHANNEL (2026-10-11): state.telemetry is capped at 300
  // entries (game.js tele()) — on busy seeds the harness's once-per-day
  // contestEvents() read missed contest_fired entries that were trimmed
  // before the read (a 'honey' end with no fire, seed 777). Keep an
  // unbounded side log of contest/show/prize events from day 1.
  const teleSide = [];
  (function wrapTele() {
    const _tele = Game.tele;
    Game.tele = function (t, d) {
      try {
        if (typeof t === 'string' && /^(contest_fired|contest_end|show_aired|prize_)/.test(t)) {
          teleSide.push({ day: gday(), type: t, id: (d && d.id) || '?', who: (d && d.who) || null, outcome: (d && d.outcome) || null });
        }
      } catch (e) {}
      return _tele.apply(this, arguments);
    };
  })();
  const ctx = {};
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
  let lastContestCount = 0;
  let overAt = null;
  let maxGameDay = 0;

  for (let day = 1; day <= 40; day++) {
    const gd = gday();
    maxGameDay = Math.max(maxGameDay, gd);

    // (a) conversation on scheduled days
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try {
            const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
            if (comm.level === 'none') continue;
          } catch (e) {}
          let cnt = -1;
          try { const c0 = Game.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) { console.log('villager-pick ERROR: ' + (e && e.message)); }
      if (vid) {
        try {
          const fp = runConversation(seed, gd, vid);
          transcriptFiles.push(fp);
          console.log(`day ${gd}: convo with ${vname(vid)} -> ${fp}`);
        } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
      }
    }

    // (b) three day-parts: upkeep, fights, contests, then time passes
    for (let p = 0; p < 3; p++) {
      try { if (competent.upkeep) competent.upkeep(Game, ctx); } catch (e) {}
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) break;
      try { Game.tickAction(128); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }

    // (c) daily: forage trip, sort, sow, donate, teach, talk, loot, ability picks
    try { if (competent.daily) competent.daily(Game, ctx); } catch (e) {}
    try { Game.sleep(); } catch (e) {}
    driveContests(Game, competent, ctx);

    // (d) new contest events today? Read from the unbounded side-channel
    // (teleSide), not the capped state.telemetry — trims used to drop fires.
    if (teleSide.length > lastContestCount) {
      for (const ev of teleSide.slice(lastContestCount)) {
        contestLog.push({ day: ev.day, type: ev.type, id: ev.id, who: ev.who, outcome: ev.outcome, why: ev.why });
        console.log(`*** day ${ev.day}: ${ev.type} id=${ev.id || '?'} who=${ev.who || '?'} outcome=${ev.outcome || '?'}`);
      }
      lastContestCount = teleSide.length;
    }

    const ps = pantryStats();
    series.push({
      day: gd, pantryKcal: ps.kcal, preservedKcal: ps.preserved, pantryItems: ps.items,
      pop: popAlive(), wave: waveNow(),
      deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause })),
      scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
      scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
      known: knownCounts(),
      scholarAlive: !!Game.state.scholar && !Game.over,
    });
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }
  }

  const census = buildCensus();
  const censusPath = `/tmp/journey-est-census-${seed}.json`;
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, maxGameDay, transcriptFiles, series, census, contestLog, overAt,
    duties: dutiesStaffed(),
    known: knownCounts(),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    waveKills: (function () { try { return Object.assign({}, Game.state.waveKills); } catch (e) { return null; } })(),
    waveLedger: (function () { try { return Object.assign({}, Game.state.waveLedger); } catch (e) { return null; } })(),
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fledBad: ctx.fledBad || 0,
      choseAbility: ctx.choseAbility || 0, looted: ctx.looted || 0, donated: ctx.donated || 0,
    },
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | maxDay=${maxGameDay} | over=${overAt || 'no'} | contests=${contestLog.length} | transcripts=${transcriptFiles.length}`);
  return { seed, censusPath, transcriptFiles, series, contestLog, overAt, maxGameDay };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const r of results) {
    console.log(`seed ${r.seed}: maxDay=${r.maxGameDay} | over=${r.overAt || 'no'} | contests=${(r.contestLog || []).length} | census=${r.censusPath} ${r.fatal ? '| FATAL: ' + r.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
