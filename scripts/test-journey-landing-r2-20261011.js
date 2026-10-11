#!/usr/bin/env node
// Journey leg: LANDING (days 1-14) R2 — competent-player playthrough, 3 seeds.
// Full current index.html script list (minus DOM-only app/sprites/tile-scenes/move-anim + drama).
// Seeded PRNG BEFORE module eval (modules capture Math.random at load).
// Full production script list in index.html order (minus DOM-only
// app.js/sprites.js/tile-scenes.js/move-anim.js and drama.js).
//
// Usage: node scripts/test-journey-landing-20261011.js   (seeds 20261011, 777, 424242)

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
  'src/js/engine/state.js',
  'src/js/engine/modifiers.js',
  'src/js/engine/calories.js',
  'src/js/engine/day.js',
  'src/js/engine/forage.js',
  'src/js/engine/combat.js',
  'src/js/game.js',
  'src/js/encounters.js',
  'src/js/conversation.js',
  'src/js/convo-mood.js',
  'src/js/convoTopics.js',
  'src/js/convo-wants.js',
  'src/js/convo-dialogue.js',
  'src/js/convo-beats.js',
  'src/js/convo-scene.js',
  'src/js/voice-piper.js',
  'src/js/examine.js',
  'src/js/equipment.js',
  'src/js/journal.js',
  'src/js/party.js',
  'src/js/party-formal.js',
  'src/js/truth.js',
  'src/js/contests.js',
  'src/js/broadcast.js',
  'src/js/contestEngine.js',
  'src/js/alienPlayers.js',
  'src/js/storage.js',
  'src/js/perceive.js',
  'src/js/carexplore.js',
  'src/js/justice.js',
  'src/js/food.js',
  'src/js/betrayal.js',
  'src/js/corpses.js',
  'src/js/corruption.js',
  'src/js/lifeseed.js',
  'src/js/progression.js',
  'src/js/waveLedger.js',
  'src/js/feastBuff.js',
  'src/js/ledger.js',
  'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js',
  'src/js/partyTactics.js',
  'src/js/sigW3a.js',
  'src/js/statusEffects.js',
  'src/js/sigW3b.js',
  'src/js/metaProgression.js',
  'src/js/sigW3c.js',
  'src/js/villager-agency.js',
  'src/js/fieldFights.js',
  'src/js/villager-objectives.js',
  'src/js/codex-people.js',
  'src/js/membership.js',
  'src/js/havenGrowth.js',
  'src/js/hierarchy.js',
  'src/js/comms.js',
  'src/js/table.js',
  'src/js/table-feared.js',
  'src/js/table-indispensable.js',
  'src/js/table-beloved.js',
  'src/js/table-witness.js',
  'src/js/table-assimilated.js',
  'src/js/table-defiant.js',
  'src/js/relay-ext.js',
  'src/js/relay-dialogue.js',
  'src/js/table-relay.js',
  'src/js/safetynets.js',
  'src/js/villageAgency.js',
  'src/js/debug-scenarios.js',
  'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

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

// Choice policy: engage the want first, deflect honestly second, wander never.
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy'];
const DEFLECT = ['dlg:cant'];
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

function pantryKcal() {
  try {
    const p = (Game.state.village && Game.state.village.pantry) || [];
    return Math.round(p.reduce((t, i) => t + (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0), 0));
  } catch (e) { return null; }
}
function deathsSoFar() {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function popAlive() {
  try {
    return (Game.state.village.roster || []).filter(id => { const p = person(id); return !p.dead; }).length;
  } catch (e) { return null; }
}

function runConversation(seed, day, vid) {
  const fp = `/tmp/journey-landing-r2-transcript-${seed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${seed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.occupation || '?'} temperament=${p.temperament || '?'} trust=${((Game.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
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
    let ax = null;
    try { ax = Game.agencyOf ? Game.agencyOf(id) : null; } catch (e) {}
    return {
      id, name: vname(id),
      alive: !p.dead,
      occupation: p.occupation || null,
      temperament: p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood: p.mood || null,
      plantsKnown: plants,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
}

async function runSeed(seed) {
  _s = seed >>> 0; // re-seed for this run (modules hold the same closure)
  capture = [];
  console.log(`\n########## SEED ${seed} ##########`);
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const pid = Game.villagerId;
  const pp = person(pid);
  const spawn = {
    seed,
    day: gday(),
    scholarName: vname(pid),
    scholarId: pid,
    occupation: pp.occupation || null,
    temperament: pp.temperament || null,
    hp: (Game.state.scholar && Game.state.scholar.health) || null,
    fullness: (Game.state.scholar && Game.state.scholar.kcal) || null,
    rosterCount: (Game.state.village.roster || []).length,
  };
  console.log('SPAWN: ' + JSON.stringify(spawn));
  console.log('--- first 40 emitted lines (what the new player sees) ---');
  console.log(capture.slice(0, 40).join('\n'));
  console.log('--- end of spawn stream ---');

  const talked = new Set();
  let sysWas = !!(Game.state && Game.state.systemArrived);
  let systemDay = sysWas ? gday() : null;
  let systemFile = null;
  const series = [];
  const transcriptFiles = [];
  let overAt = null;

  for (let day = 1; day <= 14; day++) {
    const gd = gday();
    console.log(`\n--- seed ${seed} game-day ${gd} ---`);
    // (a) one full conversation with a villager we haven't really talked to yet
    let vid = null;
    try {
      const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && !talked.has(id));
      for (const id of roster) {
        try {
          const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
          if (comm.level === 'none') continue; // nonverbal — skip
        } catch (e) {}
        let cnt = -1;
        try { const c0 = Game.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
        if (cnt === 0) { vid = id; break; }
      }
      if (!vid && roster.length) vid = roster[0];
    } catch (e) { console.log('villager-pick ERROR: ' + (e && e.message)); }
    if (vid) {
      try {
        const fp = runConversation(seed, gd, vid);
        transcriptFiles.push(fp);
        console.log(`convo with ${vname(vid)} -> ${fp}`);
      } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
      talked.add(vid);
    } else {
      console.log('no fresh conversational villager today');
    }
    // (b) advance the day as a competent player: time passes, eat, drink, sleep
    try { Game.tickAction(256); } catch (e) { console.log('tickAction ERROR: ' + (e && e.message)); }
    try { Game.eat(); } catch (e) { console.log('eat() note: ' + (e && e.message)); }
    try { Game.fillWater(); } catch (e) { console.log('fillWater() note: ' + (e && e.message)); }
    try { Game.drinkWater(); } catch (e) { console.log('drinkWater() note: ' + (e && e.message)); }
    try { Game.sleep(); } catch (e) { console.log('sleep ERROR: ' + (e && e.message)); }

    const sysNow = !!(Game.state && Game.state.systemArrived);
    if (!sysWas && sysNow) {
      systemDay = gday();
      systemFile = `/tmp/journey-landing-r2-system-${seed}.txt`;
      fs.writeFileSync(systemFile,
        `=== seed ${seed}: System contact fired on game-day ${systemDay} ===\n\n` +
        capture.slice(-30).join('\n'));
      console.log(`*** SYSTEM CONTACT on day ${systemDay} -> ${systemFile}`);
    }
    sysWas = sysNow;

    series.push({
      day: gday(), pantryKcal: pantryKcal(), pop: popAlive(),
      deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause })),
      scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
      scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
      scholarAlive: !!(Game.state.scholar) && !Game.over,
    });
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }
  }

  const census = buildCensus();
  const censusPath = `/tmp/journey-landing-r2-census-${seed}.json`;
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, spawn, systemDay, systemFile, transcriptFiles, series, census, overAt,
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | systemDay=${systemDay} | over=${overAt || 'no'} | transcripts=${transcriptFiles.length}`);
  return { seed, spawn, systemDay, censusPath, transcriptFiles, series, overAt };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const r of results) {
    console.log(`seed ${r.seed}: spawn=${r.spawn && r.spawn.scholarName} | systemDay=${r.systemDay} | over=${r.overAt || 'no'} | census=${r.censusPath}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
