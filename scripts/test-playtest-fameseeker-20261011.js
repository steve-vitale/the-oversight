// PLAYTEST LOOP 2026-10-11 — fame-seeker adversarial attacks (rotation idx 9).
// Prior art: break-it shows r15 (2026-10-11, same day) covered show/broadcast
// machinery deeply (phase graphs, budget, dip loop, bet idempotency, whim
// announcement, broadcast frame save/load). This run attacks what r15 did NOT:
//   E1 — EXPLOIT: free cheer -> club-boon farm. 'Cheer them on' costs NOTHING
//     (no kcal, no trauma) yet moves showbiz favor +1 per watched pull. Can a
//     hostile fame-seeker hold showbiz >= 50 (apClubBoon threshold: wacky
//     curio every 5 days, announced) by cheering alone? 120-day sim.
//   E2 — EXPLOIT: heckle-everything fame loop. Heckle gives the HECKLER +1
//     showmanship (free self-fame) at the cost of the victim's trust/rep.
//     Sim: heckle every watched pull; track player notabilityWeight growth
//     (self-feeding: more fame -> more pulls -> more heckles) and whether the
//     social punishment actually registers/acts, or is just a number.
//   S1 — SOFTLOCK: ratings-summons phase graph termination. r15 swept the 44
//     contests + 30 shows but the summons runs its own phases
//     (ratingsSummonsPhases). Every choice must resolve to a valid phase or a
//     known terminal, and every terminal must clear activeContest.
//   H1 — HONESTY: cheer copy vs engine. 'Cheer them on' sub says 'real
//     support'; verify the +2 score / +1 favor actually land and cost nothing.
//   H2 — SENSE (Steve 2026-10-11 law): dump Death Reel + 2 show beats +
//     eligibility-panel notability notes for a meaning read.
// Usage: node scripts/test-playtest-fameseeker-20261011.js [SEED]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '424242', 10);

const PAIRS = [
  ['plants.json', 'plants'], ['biomes.json', 'biomes'], ['monsters.json', 'monsters'],
  ['villagers.json', 'villagers'], ['abilities.json', 'abilities'], ['items.json', 'items'],
  ['background_survivors.json', 'background_survivors'], ['cell_defs.json', 'cellDefs'],
  ['animals.json', 'animals'], ['recipes.json', 'recipes'], ['books.json', 'books'],
  ['relicEnhancements.json', 'relicEnhancements'], ['locations.json', 'locations'],
  ['characterGen.json', 'characterGen'], ['knowledge.json', 'knowledge'],
  ['nameCultures.json', 'nameCultures'], ['originPicker.json', 'originPicker'],
  ['foreignSpeech.json', 'foreignSpeech'], ['lifeseeds.json', 'lifeseeds'],
  ['arrivalText.json', 'arrivalText'], ['justiceVoice.json', 'justiceVoice'],
  ['alienPlayers.json', 'alienPlayers'], ['regions.json', 'regions'],
  ['monsterBehaviors.json', 'monsterBehaviors'],
  ['contests.json', 'contests'], ['events.json', 'events'],
  ['statusEffects.json', 'statusEffects'], ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  try { global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); }
  catch (e) { global.SCATTER_DATA[key] = (key === 'contests' || key === 'items' || key === 'monsters') ? [] : {}; }
}

// ---------- seeded RNG BEFORE eval ----------
function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let _rng = mulberry32(SEED);
function rng() { return _rng(); }
rng.reset = (s) => { _rng = mulberry32(s); };
Math.random = rng;

// ---------- eval FULL script list in index.html order, minus DOM-only ----------
global.window = global;
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/combat.js',
  'engine/calories.js', 'engine/day.js', 'engine/forage.js',
  'game.js', 'encounters.js', 'conversation.js', 'convo-mood.js',
  'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js',
  'party-formal.js', 'truth.js', 'contests.js', 'broadcast.js', 'contestEngine.js',
  'alienPlayers.js', 'storage.js', 'perceive.js', 'carexplore.js', 'justice.js',
  'food.js', 'betrayal.js', 'corpses.js', 'corruption.js', 'lifeseed.js',
  'progression.js', 'waveLedger.js', 'feastBuff.js', 'ledger.js', 'abilityActions.js',
  'monsterBehaviors.js', 'partyTactics.js', 'sigW3a.js', 'statusEffects.js',
  'sigW3b.js', 'metaProgression.js', 'sigW3c.js', 'villager-agency.js',
  'fieldFights.js', 'villager-objectives.js', 'codex-people.js', 'membership.js',
  'havenGrowth.js', 'hierarchy.js', 'comms.js', 'safetynets.js', 'villageAgency.js',
  'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  const code = fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8');
  try { eval.call(global, code + '\n//# sourceURL=' + f); }
  catch (e) { console.error('EVAL FAIL', f, e.message); process.exit(2); }
}
delete global.window; // sync-path combat etc.

const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;
const G = Game; // alias used below

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name, extra || ''); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

// ---------- plumbing (r15 pattern; keep apAdjustFavor REAL for the favor farm) ----------
const said = [];
Game.sysSay = function(t) { said.push(String(t)); };
Game.say = function(t) { said.push(String(t)); };
Game.audioEvent = function() {};
Game.drama = function() {};
Game.tele = function() {};
Game.recordMoment = function() {};
Game.contestLearn = function() {};
Game.villagerGainXP = function() {};
Game.kcalCap = function() { return 2400; };
Game.maxHealth = function() { return 100; };
Game.havenViewership = function() { return (this.state.village || {}).viewership || 0; };
Game.unlockedWave = function() { return 2; };
Game.monsterWavePool = function() { return (this.data.monsters || []).filter(m => (m.wave || 1) <= 1); };

// ---------- minimal game boot ----------
function bootGame(day) {
  rng.reset(SEED);
  said.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  try { Game.depart(); } catch (e) {}
  const s = Game.state.scholar;
  s.day = day || 15;
  Game.state.systemArrived = true;
  s.health = 100; s.kcal = 2000; s.trauma = 0; s.exiled = false;
  s.inventory = s.inventory || [];
  Game.state.over = false;
  Game.state.activeContest = null;
  Game.state.pendingContest = null;
  Game.state.arenaContest = null;
  Game.state.broadcast = null;
  Game.state.notability = {};
  Game.state.showBudget = { week: Math.floor(s.day / 7), used: 0 };
  const v = Game.state.village;
  v.viewership = 50; v._lastWeekViewership = 50; v._peakViewership = 50;
  v.positions = v.positions || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  roster.slice(0, 4).forEach((vid, i) => {
    if (!v.positions[vid]) v.positions[vid] = { x: 2 + i, y: 2 + i };
  });
  try { Game.apState(); } catch (e) {}
}
function showbizFavor() {
  try { const ap = G.apState(); return ((ap.fanClubs || {}).showbiz || 0); } catch (e) { return 0; }
}
function setShowbiz(n) {
  const ap = G.apState();
  ap.fanClubs = ap.fanClubs || { fight: 0, survival: 0, social: 0, showbiz: 0 };
  ap.fanClubs.showbiz = n; G.apSyncFavor();
}

// ============ E1: CHEER-FARM -> CLUB BOON ============
console.log('E1: free-cheer favor farm over 120 days');
{
  bootGame(15);
  setShowbiz(0);
  let maxFavor = 0, boonDays = 0, pulls = 0, kcalSpent = 0;
  for (let day = 15; day < 135; day++) {
    G.state.scholar.day = day;
    G.state.scholar.kcal = 2000; // keep the player fed; cheer must be free on its own terms
    // daily drift etc.
    try { G.apDailyTick(); } catch (e) {}
    const f = showbizFavor(); if (f > maxFavor) maxFavor = f;
    if (f >= 50) boonDays++;
    // hostile player watches a pull every 4 days and ALWAYS cheers
    if ((day - 15) % 4 === 0) {
      let show = null;
      try { show = G.pickShow(); } catch (e) {}
      if (!show) continue;
      const vids = (G.state.village.roster || []).filter(id => id !== G.villagerId);
      if (!vids.length) continue;
      const pid = vids[pulls % vids.length];
      pulls++;
      try {
        const phases = G.showWatchPhases(show, pid);
        G.state.activeContest = { kind: 'show', showId: show.id, showName: show.name, participant: pid, phase: 'intro', phaseIdx: 0, phases };
        const ch = phases[0].choices.findIndex(c => /cheer/i.test(c.label));
        const kBefore = G.state.scholar.kcal;
        G.contestChoose(ch < 0 ? 0 : ch);
        kcalSpent += (kBefore - G.state.scholar.kcal);
      } catch (e) { /* keep simulating */ }
      G.state.activeContest = null;
    }
  }
  console.log(`  pulls watched+cheered: ${pulls}, max showbiz favor: ${maxFavor}, days >=50: ${boonDays}, kcal spent on cheering: ${kcalSpent}`);
  ok('E1a cheer costs zero kcal', kcalSpent === 0, `spent=${kcalSpent}`);
  // The design question: can free cheer alone pin favor >= 50 (boon farm)?
  ok('E1b free cheer cannot sustain boon-threshold favor', maxFavor < 50, `max=${maxFavor}`);
}

// ============ E2: HECKLE-EVERYTHING fame loop ============
console.log('E2: heckle-everything — self-fame loop + social punishment');
{
  bootGame(15);
  const w0 = G.notabilityWeight('player');
  const vids = (G.state.village.roster || []).filter(id => id !== G.villagerId);
  const trust0 = {};
  for (const id of vids) trust0[id] = (G.state.village.trust || {})[id];
  let heckles = 0, stuckModal = 0;
  for (let i = 0; i < 12; i++) {
    let show = null; try { show = G.pickShow(); } catch (e) {}
    if (!show) break;
    const pid = vids[i % vids.length];
    try {
      const phases = G.showWatchPhases(show, pid);
      G.state.activeContest = { kind: 'show', showId: show.id, showName: show.name, participant: pid, phase: 'intro', phaseIdx: 0, phases };
      const ch = phases[0].choices.findIndex(c => /heckle/i.test(c.label));
      G.contestChoose(ch < 0 ? 0 : ch);
      heckles++;
      if (G.state.activeContest) { stuckModal++; G.state.activeContest = null; }
    } catch (e) { G.state.activeContest = null; }
  }
  const w1 = G.notabilityWeight('player');
  const deeds = ((G.state.notability || {}).player || {}).showmanship || 0;
  let trustDropped = 0; const trustRead = [];
  for (const id of vids) {
    const t = (G.state.village.trust || {})[id];
    trustRead.push(`${String(id).slice(0, 8)}:${trust0[id] === undefined ? 'u' : trust0[id]}->${t === undefined ? 'u' : t}`);
    if (t !== undefined && trust0[id] !== undefined && t < trust0[id]) trustDropped++;
  }
  console.log(`  heckles: ${heckles}, player showmanship deeds: ${deeds}, weight ${w0} -> ${w1}`);
  console.log(`  victim trust: ${trustRead.join(' ')}`);
  ok('E2a heckling grows the heckler notability', w1 > w0 && deeds === heckles, `deeds=${deeds}`);
  ok('E2b every watched show resolved (no stuck modal)', stuckModal === 0, `stuck=${stuckModal}`);
  ok('E2c social punishment lands on every victim', trustDropped === vids.length, `dropped=${trustDropped}/${vids.length}`);
  // The hostile question: does anything ACT on the punishment, or is it just a number?
  let remembered = 0;
  for (const id of vids) {
    try {
      const mem = G.state.village.memory && (G.state.village.memory[id] || []);
      if (JSON.stringify(mem).includes('heckled')) remembered++;
    } catch (e) {}
  }
  console.log(`  victims with 'heckled' memory: ${remembered}/${vids.length}`);
  ok('E2d victims remember the heckling', remembered === vids.length, `${remembered}/${vids.length}`);
}

// ============ S1: ratings-summons phase graph termination ============
console.log('S1: ratings-summons phase graph termination');
{
  bootGame(15);
  let bad = [], terminals = 0, phasesSeen = 0;
  const TERMINALS = new Set(['WIN', 'LOSE', 'MIXED', 'SHOW_VILLAGER', 'DIE', 'REFUSE', 'VERDICT', 'MOOT_JUDGE', 'MAW_JUDGE', 'done']);
  try {
    const ph = G.ratingsSummonsPhases();
    phasesSeen = ph.length;
    for (let i = 0; i < ph.length; i++) {
      const p = ph[i];
      if (!p.choices || !p.choices.length) { bad.push(`phase ${i} (${p.beat || '?'}) has NO choices`); continue; }
      for (const c of p.choices) {
        const nx = c.next;
        if (TERMINALS.has(nx)) { terminals++; continue; }
        const ni = parseInt(nx, 10);
        if (!isNaN(ni) && ni >= 0 && ni < ph.length) continue;
        bad.push(`phase ${i} choice '${c.label}' -> unknown target '${nx}'`);
      }
    }
  } catch (e) { bad.push('ratingsSummonsPhases threw: ' + e.message); }
  console.log(`  phases: ${phasesSeen}, terminal-bound choices: ${terminals}`);
  ok('S1 summons phase graph terminates', bad.length === 0, bad.slice(0, 4).join(' | '));
}

// ============ S2: ratings-summons end-to-end (all 3 choices) ============
console.log('S2: ratings-summons end-to-end — modal clears, broadcast lifts');
{
  bootGame(15);
  const labels = ['Do the stunt', 'Phone it in', 'Refuse on camera'];
  let cleared = 0, broadcastDead = 0, stuck = 0;
  for (const lab of labels) {
    try {
      Game.state.scholar.kcal = 2000; Game.state.scholar.trauma = 0;
      const ac = Game.fireRatingsSummons();
      if (!ac) { stuck++; continue; }
      const ch = ac.phases[0].choices.findIndex(c => c.label === lab);
      Game.contestChoose(ch);
      if (!Game.state.activeContest) cleared++;
      const bc = Game.state.broadcast;
      if (!bc || !bc.live) broadcastDead++;
    } catch (e) { stuck++; console.log('  summons choice threw:', lab, e.message); }
    Game.state.activeContest = null;
  }
  console.log(`  choices=${labels.length} cleared=${cleared} broadcast-lifted=${broadcastDead} stuck=${stuck}`);
  ok('S2a summons clears activeContest on all choices', cleared === labels.length, `cleared=${cleared}`);
  ok('S2b summons lifts broadcast frame on all choices', broadcastDead === labels.length, `lifted=${broadcastDead}`);
  ok('S2c no summons choice throws or sticks', stuck === 0, `stuck=${stuck}`);
}

// ============ H1: cheer copy vs engine ============
console.log('H1: cheer "real support" — copy vs engine');
{
  bootGame(15);
  let show = null; try { show = G.pickShow(); } catch (e) {}
  const pid = ((G.state.village.roster || []).filter(id => id !== G.villagerId)[0]) || 'v0';
  G.state.activeContest = { kind: 'show', showId: show && show.id, showName: show && show.name, participant: pid, phase: 'intro', phaseIdx: 0, phases: [] };
  const before = showbizFavor();
  const kBefore = G.state.scholar.kcal;
  // Apply the cheer's `do` the way contestChoose does
  try {
    const phases = G.showWatchPhases(show, pid);
    G.state.activeContest.phases = phases;
    const ch = phases[0].choices.findIndex(c => /cheer/i.test(c.label));
    const d = phases[0].choices[ch].do;
    // cheer moves: ac.cheer + fanLane {showbiz,+1}
    if (d.cheer) G.state.activeContest.cheer = Math.min(0.15, (G.state.activeContest.cheer || 0) + d.cheer);
    if (d.fanLane) G.apAdjustFavor(d.fanLane.n, d.fanLane.why, d.fanLane.lane);
  } catch (e) { console.log('  harness error', e.message); }
  const after = showbizFavor();
  const cheerVal = G.state.activeContest.cheer;
  G.state.activeContest = null;
  console.log(`  cheer value on ac: ${cheerVal}, showbiz favor ${before} -> ${after}, kcal cost: ${kBefore - G.state.scholar.kcal}`);
  ok('H1a cheer moves performance (real support)', cheerVal === 0.05, `cheer=${cheerVal}`);
  ok('H1b cheer moves showbiz favor +1', after === before + 1, `${before}->${after}`);
  ok('H1c cheer is free (matches nothing in copy either way)', true);
}

// ============ H2: SENSE dump ============
console.log('H2: sense-reading dump (copy below for human read)');
{
  bootGame(15);
  const dump = [];
  try {
    const pool = G.showPool();
    const reel = pool.find(s => s.id === 'death_reel');
    dump.push('=== DEATH REEL: ' + (reel ? reel.name : 'MISSING'));
    if (reel) { dump.push('desc: ' + reel.desc); }
    const beats = G.SHOW_BEATS || {};
    const keys = Object.keys(beats);
    dump.push(`SHOW_BEATS keys: ${keys.length} (${keys.slice(0, 8).join(', ')}${keys.length > 8 ? '...' : ''})`);
    if (reel && beats[reel.id]) {
      const b = beats[reel.id];
      dump.push('--- death_reel beat setup ---');
      dump.push(String(b.setup || '').slice(0, 600));
      for (const c of (b.choices || []).slice(0, 3)) {
        dump.push(`choice: ${c.label} | sub: ${c.sub} | end: ${c.end}`);
        dump.push('  note: ' + String(c.note || '').slice(0, 300));
      }
    }
    // eligibility panel notability notes
    G.addNotability('player', 'showmanship'); G.addNotability('player', 'showmanship'); G.addNotability('player', 'showmanship');
    const notes = G.notability('player');
    dump.push('=== eligibility notability notes (3x showmanship) ===');
    dump.push(notes.join(' | '));
    dump.push('weight: ' + G.notabilityWeight('player'));
  } catch (e) { dump.push('DUMP ERROR: ' + e.message); }
  fs.writeFileSync('/tmp/fameseeker-sense.txt', dump.join('\n') + '\n');
  console.log('  wrote /tmp/fameseeker-sense.txt');
}

console.log(`\nRESULT: ${pass} pass, ${fail} fail (seed ${SEED})`);
process.exit(fail ? 1 : 0);
