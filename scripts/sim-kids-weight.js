// sim-kids-weight.js — the pods as a standing weight: is it felt?
// (Steve 2026-10-11: "Still too simple... let's simulate it.")
//
// 3 policies x 6 seeds, 120-day runs driving the pods system directly:
//   champion — acts at every intrusion, promises + keeps (podAsk), enters Jackpot
//   shrug    — shrugs every intrusion, never asks
//   gamble   — shrugs intrusions but enters the Jackpot when staged
//
// Measures:
//   (a) intrusion frequency per run (~1/season, never two in a week)
//   (b) cost bite — champion runs measurably poorer (pantry, favors owed)
//   (c) history differentiation — table possibility sets differ by policy
//   (d) oversight epilogue fires on shrug-runs
//
// Usage: node scripts/sim-kids-weight.js [seeds...]  (default 6 seeds)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = process.argv.slice(2).map(Number).filter(Boolean);
const seeds = SEEDS.length ? SEEDS : [101, 202, 303, 404, 505, 606];

function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

global.window = global;
const LIST = ['engine/state.js', 'game.js', 'lifeseed.js', 'table.js', 'pods.js'];
const codeCache = {};
for (const f of LIST) codeCache[f] = fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8');

function newGame(seed) {
  Math.random = mulberry32(seed);
  for (const f of LIST) eval(codeCache[f]);
  delete global.window;
  const Game = globalThis.Scattering.Game;
  Game.data = { villagers: [
    { id: 'm1', name: 'Mara Voss' }, { id: 'm2', name: 'Theo Lind' },
    { id: 'm3', name: 'June Park' },
  ]};
  Game.villagersMourningTaken = () => ['m1', 'm2'];
  Game.takenKinOf = (id) => [{ relation: id === 'm1' ? 'niece' : 'nephew', name: 'Little One' }];
  Game.havenViewership = () => 10;
  const said = [];
  Game.say = (t) => said.push(String(t));
  Game.sysSay = (t) => said.push(String(t));
  Game.state = {
    scholar: { day: 15, id: 'scholar1' },
    village: { day: 15, pantryKcal: 30000, pods: null, takenPromises: {} },
    systemArrived: true,
    systemFavorsOwed: 0,
  };
  Game.tableState = () => ({ branch: 'light', path: 'beloved', phase: 'finals' });
  return { Game, said };
}

const POLICIES = {
  champion: {
    onIntrusion(Game) { Game.podAnswer('act'); },
    onDay(Game, day) {
      // Promise + keep: every ~20 days a mourner promise, ask a week later.
      if (day % 20 === 0) {
        const vid = 'm' + ((day / 20) % 2 + 1 | 0);
        Game.state.village.takenPromises[vid] = day;
        Game.podRemember('promise', { vid });
      }
      if (day % 20 === 7) Game.podAsk();
      if (day === 60) { Game.podJackpotStage('dangle'); }
      const p = (Game.state.village.pods || {});
      if (p.jackpot && !p.jackpot.resolved) Game.podJackpotApproach('conviction');
    },
  },
  shrug: {
    onIntrusion(Game) { Game.podAnswer('shrug'); },
    onDay() {},
  },
  gamble: {
    onIntrusion(Game) { Game.podAnswer('shrug'); },
    onDay(Game, day) {
      if (day === 60) { Game.podJackpotStage('dangle'); }
      const p = (Game.state.village.pods || {});
      if (p.jackpot && !p.jackpot.resolved) Game.podJackpotApproach('ritual');
    },
  },
};

function runOne(seed, policyId) {
  const { Game, said } = newGame(seed * 1000 + policyId.length);
  const policy = POLICIES[policyId];
  const intrusionDays = [];
  let pantryStart = Game.state.village.pantryKcal;
  for (let day = 15; day <= 135; day++) {
    Game.state.scholar.day = day;
    Game.state.village.day = day;
    const before = (Game.state.village.pods || {}).lastIntrusion || 0;
    Game.podIntrusionTick();
    const after = (Game.state.village.pods || {}).lastIntrusion || 0;
    if (after > before) intrusionDays.push(day);
    if ((Game.state.village.pods || {}).pending) {
      policy.onIntrusion(Game);
    }
    policy.onDay(Game, day);
    // Pending auto-resolves after 3 days via tick; simulate by aging.
    const p = Game.state.village.pods || {};
    if (p.pending && day - p.pending.day >= 3) {
      // (real game: tick handles it; here force the shrug path)
      p.pending = null;
      Game.podRemember('shrugged', { intrusion: p.pending ? p.pending.type : 'unknown', note: 'unanswered' });
    }
  }
  const hist = Game.podHistory();
  // Table possibilities (mocked light branch).
  const demand = Game.podDemandAvailable();
  // Oversight.
  said.length = 0;
  Game.tableState = () => ({ branch: 'light', path: 'beloved', phase: 'done' });
  const oversight = Game.podOversightEpilogue();
  const gaps = intrusionDays.slice(1).map((d, i) => d - intrusionDays[i]);
  return {
    seed, policy: policyId,
    intrusions: intrusionDays.length,
    minGap: gaps.length ? Math.min(...gaps) : null,
    pantryDelta: Game.state.village.pantryKcal - pantryStart,
    favorsOwed: Game.state.systemFavorsOwed || 0,
    acted: hist.filter(e => e.kind === 'acted').length,
    shrugged: hist.filter(e => e.kind === 'shrugged').length,
    promises: hist.filter(e => e.kind === 'promise').length,
    kept: hist.filter(e => e.kind === 'promise-kept').length,
    jackpotWon: hist.some(e => e.kind === 'jackpot-won'),
    jackpotLost: hist.some(e => e.kind === 'jackpot-lost'),
    championed: Game.podChampioned(),
    demandAvailable: demand,
    oversightFired: oversight,
  };
}

console.log('# sim-kids-weight — pods as a standing weight\n');
const results = [];
for (const seed of seeds) {
  for (const pid of Object.keys(POLICIES)) {
    const r = runOne(seed, pid);
    results.push(r);
    console.log(`seed ${seed} ${pid}: intrusions=${r.intrusions} minGap=${r.minGap} pantryΔ=${r.pantryDelta} favors=${r.favorsOwed} acted=${r.acted} shrugged=${r.shrugged} kept=${r.kept} jackpot=${r.jackpotWon ? 'WON' : r.jackpotLost ? 'lost' : '-'} championed=${r.championed} demand=${r.demandAvailable} oversight=${r.oversightFired}`);
  }
}

// ---- aggregates ----
console.log('\n## (a) intrusion frequency');
for (const pid of Object.keys(POLICIES)) {
  const rs = results.filter(r => r.policy === pid);
  const mean = (rs.reduce((a, r) => a + r.intrusions, 0) / rs.length).toFixed(1);
  const minGap = Math.min(...rs.map(r => r.minGap || 999));
  console.log(`  ${pid}: mean ${mean} intrusions/120d, min gap ${minGap}d ${minGap >= 7 ? '(never two in a week ✓)' : '(VIOLATION)'}`);
}

console.log('\n## (b) cost bite');
for (const pid of Object.keys(POLICIES)) {
  const rs = results.filter(r => r.policy === pid);
  const pantry = (rs.reduce((a, r) => a + r.pantryDelta, 0) / rs.length).toFixed(0);
  const favors = (rs.reduce((a, r) => a + r.favorsOwed, 0) / rs.length).toFixed(1);
  console.log(`  ${pid}: mean pantry Δ ${pantry} kcal, mean favors owed ${favors}`);
}

console.log('\n## (c) history differentiation at the table');
for (const pid of Object.keys(POLICIES)) {
  const rs = results.filter(r => r.policy === pid);
  const dem = rs.filter(r => r.demandAvailable).length;
  const champ = rs.filter(r => r.championed).length;
  console.log(`  ${pid}: championed ${champ}/${rs.length}, demand available ${dem}/${rs.length}`);
}

console.log('\n## (d) oversight on shrug-runs');
{
  const rs = results.filter(r => r.policy === 'shrug');
  const over = rs.filter(r => r.oversightFired).length;
  console.log(`  shrug: oversight fired ${over}/${rs.length}`);
  const rs2 = results.filter(r => r.policy === 'champion');
  console.log(`  champion: oversight fired ${rs2.filter(r => r.oversightFired).length}/${rs2.length} (expect 0 — kids not home but championed blocks the sting)`);
}

const jackpotRuns = results.filter(r => r.jackpotWon || r.jackpotLost);
console.log(`\n## jackpot: ${jackpotRuns.filter(r => r.jackpotWon).length} won / ${jackpotRuns.length} played`);
