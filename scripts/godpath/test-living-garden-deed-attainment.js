#!/usr/bin/env node
// Seeded attainment panel: living_garden / harvest_fed hardness vs wiring.
// Measure-only. Does not retune garden yields or ability prices.
// Prepared pantry meals exercise the authored streak; natural campaign rate
// is reported from short production leans, not claimed as a balance pass.
'use strict';
const cp = require('child_process');
const path = require('path');
const K = require('./lib');

const SCREENING = (process.env.SEEDS
  ? process.env.SEEDS.split(',').map(s => Number(s.trim())).filter(Number.isFinite)
  : [7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9]);

const GARDENER = ['green_thumb', 'green_whisper', 'rain_dancer', 'cornucopia'];
const MARK = '@@LIVING_GARDEN_ATTAIN@@';

function childMain() {
  const seed = Number(process.env.SEED || 7);
  return runSeed(seed).then(row => {
    process.stdout.write(MARK + JSON.stringify(row) + '\n');
  });
}

async function runSeed(seed) {
  const saved = new Map();
  global.localStorage = {
    getItem: k => saved.get(String(k)) ?? null,
    setItem: (k, value) => saved.set(String(k), String(value)),
    removeItem: k => saved.delete(String(k)),
    key: i => [...saved.keys()][i] ?? null,
    get length() { return saved.size; },
  };

  const G = await K.load({ seed });
  const S = globalThis.Scattering, GH = S.Godhood;
  const god = GH.byId('living_garden');
  const deed = god.requires.deed;
  let s, v, me, roster;

  function fresh(neighborCount) {
    G.tbfight = null; G.over = false; G.won = false; K.newRun(G);
    s = G.state.scholar; v = G.state.village; me = G.villagerId;
    const others = v.roster.filter(id => id !== me);
    if (others.length < neighborCount) {
      throw new Error(`seed ${seed} roster too small: need ${neighborCount} neighbors, have ${others.length}`);
    }
    roster = [me, ...others.slice(0, neighborCount)];
    v.roster = roster.slice();
    G.state.systemArrived = true; s.day = 85; s.kcal = 3000; s.health = 100;
    s.backgroundAbilities = []; s.equipped = {}; s.godhood = { active: [], recognized: {} };
    s.abilities = GARDENER.map(id => ({ id, level: 1 })); s.activeSynergies = [];
    s.godpath = Object.assign({}, s.godpath || {}, { since: 1 });
    v.npcAbilities = {}; v.npcGodhood = {}; v.npcGodpath = {};
    delete v.godpathDeeds; delete v.godpathHarvestFeed; delete v.harvestIntake; delete v.harvestIntakeTotals;
    G.state.otherVillages = []; v.visitors = []; v.away = {};
    try { const m = G.mshipState && G.mshipState(); if (m) { m.arrivals = []; m.applications = []; } } catch (e) {}
    v.health = {};
    for (const id of roster) {
      if (id !== me) v.health[id] = 100;
      const p = G.getPerson(id); if (p) p.dead = false;
      G.npcNeeds(id).hunger = 60;
    }
    G.recognizeClass('player');
    return roster.slice();
  }

  const status = () => G.godpathDeedStatus('player', god.id) || { observed: false, complete: false, pending: false };
  const streakOf = () => (v.godpathHarvestFeed?.[me]?.streak || 0);
  const book = () => v.godpathDeeds?.[me]?.harvest_fed || null;

  function tagged(producer, kcalEach = 500, units = 400) {
    return {
      name: 'Harvest stores', units, kcalEach, safe: true, edible: true, foodState: 'ready',
      spoilDay: 9999, harvestShares: { [producer]: 1 },
    };
  }
  function anonymous(kcalEach = 500, units = 400) {
    return {
      name: 'Anonymous stores', units, kcalEach, safe: true, edible: true, foodState: 'ready',
      spoilDay: 9999,
    };
  }
  function dawn() {
    const prod = G.villagerDayProduction;
    const random = Math.random;
    try {
      G.villagerDayProduction = () => 0;
      Math.random = () => 0.99;
      G.endDay();
    } finally {
      G.villagerDayProduction = prod;
      Math.random = random;
    }
    s = G.state.scholar; v = G.state.village; me = G.villagerId;
  }
  function keepRoster(who) {
    roster = who.slice();
    v.roster = roster.slice();
    s.health = Math.max(s.health, 80); s.kcal = Math.max(s.kcal, 2500);
    v.health = v.health || {};
    for (const id of roster) {
      if (id === me) continue;
      const p = G.getPerson(id); if (p) p.dead = false;
      v.health[id] = 100;
      G.npcNeeds(id).hunger = Math.min(G.npcNeeds(id).hunger || 0, 40);
    }
    G.state.otherVillages = []; v.visitors = []; v.away = {};
    try { const m = G.mshipState && G.mshipState(); if (m) { m.arrivals = []; m.applications = []; } } catch (e) {}
  }
  function feedTagged(who, producer) {
    producer = producer || me;
    keepRoster(who);
    v.pantry = [tagged(producer)];
    for (const id of roster) G.npcNeeds(id).hunger = 60;
    s.kcal = 3000; s.inventory = [];
    dawn();
    keepRoster(who);
  }
  function feedAnonymous(who) {
    keepRoster(who);
    v.pantry = [anonymous()];
    for (const id of roster) G.npcNeeds(id).hunger = 60;
    s.kcal = 3000; s.inventory = [];
    dawn();
    keepRoster(who);
  }
  // Tagged calories below neighbors×minKcal cannot clear the day even if
  // anonymous food fills bellies — provenance, not fullness, is the gate.
  function feedInsufficientTagged(who, minKcal) {
    keepRoster(who);
    const neighbors = who.filter(id => id !== me).length;
    const need = neighbors * minKcal;
    v.pantry = [
      tagged(me, 100, Math.max(1, Math.floor((need - 1) / 100))),
      anonymous(500, 400),
    ];
    for (const id of roster) G.npcNeeds(id).hunger = 60;
    s.kcal = 3000; s.inventory = [];
    dawn();
    keepRoster(who);
  }

  const row = {
    seed,
    authored: {
      event: deed?.event || null,
      days: deed?.days ?? null,
      minKcal: deed?.minKcal ?? null,
    },
    wiring: {},
    prepared: {},
    rosterScale: {},
    dilution: {},
    naturalLean: {},
  };

  // Wiring + failing control (deed removed).
  {
    fresh(2);
    s.activeSynergies = (god.requires.synergies || []).slice();
    const armedClose = GH.godhoodCloseness(s, god, s.day);
    row.wiring.armedBlocksSynergyProxy = !armedClose.synergy && !armedClose.complete && !status().complete;

    const prevPaths = S.GODPATHS;
    const strippedRoot = JSON.parse(JSON.stringify(prevPaths));
    strippedRoot.paths.forager.god.deed = null;
    S.GODPATHS = strippedRoot; G.data.godpaths = strippedRoot;
    try {
      const stripped = GH.byId('living_garden');
      const open = GH.godhoodCloseness(s, stripped, s.day);
      row.wiring.removalControlOpensSynergy = stripped.requires.deed === null && !!open.synergy;
      row.wiring.failingControlWouldFailIfUnwired =
        row.wiring.armedBlocksSynergyProxy && row.wiring.removalControlOpensSynergy;
    } finally {
      S.GODPATHS = prevPaths; G.data.godpaths = prevPaths;
    }
    const restored = GH.byId('living_garden');
    row.wiring.restoredBlocksAgain =
      restored.requires.deed?.event === 'harvest_fed' &&
      !GH.godhoodCloseness(s, restored, s.day).synergy;
  }

  // Prepared attainment at small roster.
  {
    const who = fresh(2);
    s.activeSynergies = (god.requires.synergies || []).slice();
    for (let i = 0; i < 7; i++) feedTagged(who);
    G.checkPlayerGodhoodAscension();
    row.prepared = {
      neighbors: 2,
      complete: !!status().complete,
      streakBook: book()?.streak || 0,
      ascended: !!(s.godhood.active || []).includes(god.id),
    };
  }

  // Roster-scale with fully tagged pantry.
  for (const n of [2, 4, 8, 9]) {
    const who = fresh(n);
    let maxStreak = 0, completed = false, brokeAt = null;
    for (let day = 0; day < 7; day++) {
      feedTagged(who);
      maxStreak = Math.max(maxStreak, streakOf(), book()?.streak || 0);
      if (status().complete) { completed = true; break; }
      if (!status().pending && day > 0) { brokeAt = day + 1; break; }
    }
    row.rosterScale[n] = {
      complete: completed,
      maxStreak,
      brokeAt,
      minKcalDemandPerDay: n * (deed?.minKcal || 400),
    };
  }

  // Provenance hardness at baseline-like roster (~9).
  {
    const n = 9;
    const minKcal = deed?.minKcal || 400;
    const who = fresh(n);
    feedTagged(who);
    const afterFull = { pending: !!status().pending, streak: streakOf() };
    feedAnonymous(who);
    const afterAnonymous = { pending: !!status().pending, streak: streakOf(), complete: !!status().complete };
    const who2 = fresh(n);
    feedTagged(who2);
    feedInsufficientTagged(who2, minKcal);
    const afterShort = { pending: !!status().pending, streak: streakOf(), complete: !!status().complete };
    row.dilution = {
      neighbors: n,
      dailyNeighborFloorKcal: n * minKcal,
      afterFull,
      afterAnonymous,
      afterShort,
    };
  }

  // Short natural lean: no free village-wide tagged pantry.
  {
    K.newRun(G);
    s = G.state.scholar; v = G.state.village; me = G.villagerId;
    s.day = 40; s.kcal = 3000; s.health = 100;
    s.abilities = GARDENER.map(id => ({ id, level: 1 }));
    s.activeSynergies = (god.requires.synergies || []).slice();
    s.godhood = { active: [], recognized: {} };
    s.godpath = Object.assign({}, s.godpath || {}, { since: 1 });
    delete v.godpathDeeds; delete v.godpathHarvestFeed; delete v.harvestIntake;
    G.state.systemArrived = true;
    G.recognizeClass('player');
    v.health = v.health || {};
    let maxStreak = 0, completed = false, pendingDays = 0;
    const horizon = Number(process.env.NATURAL_DAYS || 21);
    const living0 = Math.max(0, (v.roster || []).filter(id => id !== me).length);
    for (let i = 0; i < horizon; i++) {
      v.health = v.health || {};
      for (const id of v.roster || []) {
        if (id === me) continue;
        const p = G.getPerson(id); if (p) p.dead = false;
        v.health[id] = Math.max(v.health[id] || 0, 80);
        try { G.npcNeeds(id).hunger = 50; } catch (e) {}
      }
      s.health = Math.max(s.health, 60); s.kcal = Math.max(s.kcal, 1200);
      if (!(s.inventory && s.inventory.length)) {
        s.inventory = [{
          name: 'Garden bite', units: 2, kcalEach: 400, safe: true, edible: true,
          foodState: 'ready', spoilDay: 9999, harvestShares: { [me]: 1 },
        }];
      }
      try { G.endDay(); } catch (e) { /* keep measuring */ }
      s = G.state.scholar; v = G.state.village; me = G.villagerId;
      const st = (v.godpathHarvestFeed?.[me]?.streak || 0);
      maxStreak = Math.max(maxStreak, st, v.godpathDeeds?.[me]?.harvest_fed?.streak || 0);
      const stStatus = G.godpathDeedStatus('player', god.id) || {};
      if (stStatus.pending) pendingDays++;
      if (stStatus.complete) { completed = true; break; }
      if (G.over) break;
    }
    row.naturalLean = {
      horizon,
      livingNeighbors: living0,
      maxStreak,
      pendingDays,
      complete: completed,
      ascended: !!(s.godhood?.active || []).includes(god.id),
    };
  }

  return row;
}

function spawnSeed(seed) {
  const r = cp.spawnSync(process.execPath, [__filename], {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, SEED: String(seed), ATTAIN_CHILD: '1' },
    encoding: 'utf8',
    timeout: 180000,
    maxBuffer: 8e6,
  });
  if (r.status !== 0) {
    return { seed, error: (r.stderr || r.stdout || 'spawn failed').slice(0, 1200) };
  }
  const line = (r.stdout || '').split('\n').reverse().find(l => l.includes(MARK));
  if (!line) return { seed, error: 'missing marker\n' + (r.stdout || '').slice(-500) };
  return JSON.parse(line.split(MARK).pop());
}

function summarize(rows) {
  const ok = rows.filter(r => !r.error);
  const wiringPass = ok.filter(r => r.wiring?.failingControlWouldFailIfUnwired && r.wiring?.restoredBlocksAgain).length;
  const preparedPass = ok.filter(r => r.prepared?.complete && r.prepared?.ascended).length;
  const roster = {};
  for (const n of [2, 4, 8, 9]) {
    roster[n] = { complete: ok.filter(r => r.rosterScale?.[n]?.complete).length, of: ok.length };
  }
  const dilutionBreaks = ok.filter(r =>
    r.dilution?.afterFull?.pending &&
    !r.dilution?.afterAnonymous?.pending &&
    !r.dilution?.afterShort?.pending).length;
  const natural = ok.map(r => r.naturalLean || {});
  const maxStreaks = natural.map(n => n.maxStreak || 0);
  return {
    seeds: ok.map(r => r.seed),
    errors: rows.filter(r => r.error).map(r => ({ seed: r.seed, error: r.error })),
    wiringPass: `${wiringPass}/${ok.length}`,
    preparedPass: `${preparedPass}/${ok.length}`,
    rosterScaleComplete: roster,
    dilutionBreaks: `${dilutionBreaks}/${ok.length}`,
    natural: {
      complete: natural.filter(n => n.complete).length,
      ascended: natural.filter(n => n.ascended).length,
      maxStreakMax: maxStreaks.length ? Math.max(...maxStreaks) : 0,
      maxStreakMean: maxStreaks.length ? maxStreaks.reduce((a, b) => a + b, 0) / maxStreaks.length : 0,
      of: ok.length,
    },
    authored: ok[0]?.authored || null,
  };
}

async function parentMain() {
  const T = K.reporter('living-garden-deed-attainment');
  const rows = [];
  for (const seed of SCREENING) {
    process.stderr.write(`seed ${seed}...\n`);
    rows.push(spawnSeed(seed));
  }
  const summary = summarize(rows);
  const sample = rows.find(r => !r.error) || rows[0];
  const n = summary.seeds.length;

  T.ok('authored harvest_fed deed is present (7d / 400 kcal)',
    summary.authored?.event === 'harvest_fed' && summary.authored.days === 7 && summary.authored.minKcal === 400);
  T.ok('wiring: armed deed blocks synergy proxies on every screening seed',
    n === SCREENING.length && summary.wiringPass === `${n}/${n}`, JSON.stringify(summary));
  T.ok('failing control: removing the deed opens synergy proxies (would fail if unwired)',
    n === SCREENING.length && summary.wiringPass === `${n}/${n}`);
  T.ok('prepared 2-neighbor tagged streak attains Living Garden on every seed',
    summary.preparedPass === `${n}/${n}`, JSON.stringify(summary.preparedPass));
  T.ok('roster scale: fully tagged pantry still completes at baseline-like 9 neighbors',
    summary.rosterScaleComplete[9]?.complete === n,
    JSON.stringify(summary.rosterScaleComplete));
  T.ok('hardness: anonymous or under-floor tagged kcal breaks the streak after a clean day',
    summary.dilutionBreaks === `${n}/${n}`, JSON.stringify(summary.dilutionBreaks));
  T.ok('natural lean: short production horizon does not complete harvest_fed on this bank',
    summary.natural.complete === 0 && summary.natural.ascended === 0,
    JSON.stringify(summary.natural));
  T.ok('natural lean: max streak stays below the authored 7-day gate',
    summary.natural.maxStreakMax < 7,
    JSON.stringify(summary.natural));

  const out = {
    panel: 'living-garden-deed-attainment',
    date: '2026-11-08',
    seeds: SCREENING,
    summary,
    sampleWiring: sample?.wiring || null,
    sampleDilution: sample?.dilution || null,
    sampleNatural: sample?.naturalLean || null,
    rows,
  };
  // Machine JSON on stdout after the human summary so redirects can slice it.
  T.done();
  process.stdout.write(MARK + 'PANEL\n' + JSON.stringify(out, null, 2) + '\n');
}

if (process.env.ATTAIN_CHILD === '1') {
  childMain().catch(e => { console.error(e.stack || e); process.exit(1); });
} else {
  parentMain().catch(e => { console.error(e.stack || e); process.exit(1); });
}
