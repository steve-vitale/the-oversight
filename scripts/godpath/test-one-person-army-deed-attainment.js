#!/usr/bin/env node
// Seeded attainment panel: one_person_army / outmatched_kill hardness vs wiring.
// Measure-only. Does not retune combat, food, garden, region, or Muse policies.
// Prepared juggernaut fights exercise the authored deed; natural campaign rate
// is reported from short juggernaut leans without forced outmatched fights.
'use strict';
const cp = require('child_process');
const path = require('path');
const K = require('./lib');

const SCREENING = (process.env.SEEDS
  ? process.env.SEEDS.split(',').map(s => Number(s.trim())).filter(Number.isFinite)
  : [7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9]);

const JUGGERNAUT = ['trade_of_blows', 'unbreakable', 'adrenaline_surge', 'cornered_rat'];
const MARK = '@@ONE_PERSON_ARMY_ATTAIN@@';

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
  const S = globalThis.Scattering, GH = S.Godhood, GP = S.Godpath;
  const god = GH.byId('one_person_army');
  const deed = god.requires.deed;
  let s, v, me, ally, f, m, p;

  function fresh() {
    G.tbfight = null; G.over = false; G.won = false; K.newRun(G);
    s = G.state.scholar; v = G.state.village; me = G.villagerId;
    ally = (v.roster || []).find(id => id !== me) || null;
    s.day = 85; s.kcal = 6000; s.health = G.maxHealth();
    s.backgroundAbilities = []; s.equipped = {}; s.godhood = { active: [], recognized: {} };
    s.abilities = JUGGERNAUT.map(id => ({ id, level: 1 }));
    s.activeSynergies = [];
    s.godpath = Object.assign({}, s.godpath || {}, { since: 1 });
    v.npcAbilities = {}; v.npcGodhood = {}; v.npcGodpath = {};
    delete v.godpathDeeds;
    G.state.systemArrived = true;
    G.recognizeClass('player');
    return { me, ally };
  }

  const status = () => G.godpathDeedStatus('player', god.id) || { observed: false, complete: false, pending: false };
  const book = () => v.godpathDeeds?.[me]?.outmatched_kill || null;

  function fight(mid = 'moderator', body = {}, party = false) {
    v.roster = party && ally ? [ally] : [];
    s.mx = 0; s.my = 0;
    if (party && ally) {
      v.positions = { [ally]: { mx: 1, my: 0 } };
      v.health = { [ally]: 100 };
      G.npcNeeds(ally).hunger = 0;
    }
    s.monster = { id: mid, mx: 8, my: 8, ...body };
    G.startCombat(mid);
    f = G.tbfight; m = f.fighters.find(x => x.kind === 'monster'); p = G.tbFighter('p');
    p.acted = false; f.order = ['p', m.key]; f.turnIdx = 0;
  }
  function helper() {
    const x = {
      key: 'v_opa', kind: 'villager', villagerId: ally, name: 'Prepared ally',
      hp: 100, maxHp: 100, mx: 1, my: 0, alive: true, fled: false, ai: 'brave',
    };
    f.fighters.push(x); f.order.push(x.key); G.npcNeeds(ally).hunger = 0;
    return x;
  }
  function bleed(n = 12) {
    const before = p.hp;
    G.tbDamage(p.key, n, 'prepared wound', m.key, { undodgeable: true });
    return before - p.hp;
  }
  function kill() {
    for (const x of f.fighters.filter(x => x.kind === 'monster' && x.alive && !x.fled))
      G.tbDamage(x.key, 10000, 'you', 'p', { undodgeable: true });
    G.tbEndCheck();
  }

  const row = {
    seed,
    authored: {
      event: deed?.event || null,
      afterDawn: deed?.afterDawn ?? null,
      path: 'brawler',
      subclassLean: 'juggernaut',
    },
    wiring: {},
    finishHookControl: {},
    prepared: {},
    hardness: {},
    naturalLean: {},
  };

  // Wiring + failing control (authored deed removed).
  {
    fresh();
    s.activeSynergies = (god.requires.synergies || []).slice();
    const armedClose = GH.godhoodCloseness(s, god, s.day);
    row.wiring.armedBlocksSynergyProxy = !armedClose.synergy && !armedClose.complete && !status().complete;

    const prevPaths = S.GODPATHS;
    const strippedRoot = JSON.parse(JSON.stringify(prevPaths));
    strippedRoot.paths.brawler.god.deed = null;
    S.GODPATHS = strippedRoot; G.data.godpaths = strippedRoot;
    try {
      const stripped = GH.byId('one_person_army');
      const open = GH.godhoodCloseness(s, stripped, s.day);
      row.wiring.removalControlOpensSynergy = stripped.requires.deed === null && !!open.synergy;
      row.wiring.failingControlWouldFailIfUnwired =
        row.wiring.armedBlocksSynergyProxy && row.wiring.removalControlOpensSynergy;
    } finally {
      S.GODPATHS = prevPaths; G.data.godpaths = prevPaths;
    }
    const restored = GH.byId('one_person_army');
    row.wiring.restoredBlocksAgain =
      restored.requires.deed?.event === 'outmatched_kill' &&
      !GH.godhoodCloseness(s, restored, s.day).synergy;
  }

  // Failing control: strip the lived-fight finish hook on a prepared kill.
  {
    fresh();
    fight();
    const wound = bleed();
    const finish = GP.finishApexHunt;
    let hooked = 0;
    GP.finishApexHunt = function () { hooked += 1; };
    try {
      kill();
      row.finishHookControl = {
        wound,
        hooked,
        complete: !!status().complete,
        book: !!book(),
        stripsDeed: hooked === 1 && !status().complete && !book(),
      };
    } finally {
      GP.finishApexHunt = finish;
    }
  }

  // Prepared juggernaut lean: bloodied solo outmatched kill → deed + ceremony.
  {
    fresh();
    fight();
    const openingOk = !!(f._gpApexHunt?.prey?.[0] &&
      f._gpApexHunt.prey[0].hp > f._gpApexHunt.actors[0].maxHp &&
      f._gpApexHunt.prey[0].full);
    const wound = bleed();
    kill();
    G.checkPlayerGodhoodAscension();
    row.prepared = {
      openingOk,
      wound,
      complete: !!status().complete,
      scene: book()?.scene || null,
      ascended: !!(s.godhood.active || []).includes(god.id),
      className: (s.godpath && s.godpath.subclass) || null,
    };
  }

  // Authored hardness: three live voids that look like "almost" wins.
  {
    const neg = {};
    fresh(); fight('bulldozer'); bleed(); kill();
    neg.weakerBody = { complete: !!status().complete, observed: !!status().observed };

    fresh(); fight(); kill();
    neg.unbloodied = { complete: !!status().complete, observed: !!status().observed };

    fresh();
    if (!ally) {
      neg.helper = { skipped: true, reason: 'no ally on roster' };
    } else {
      fight(); helper(); bleed(); kill();
      neg.helper = { complete: !!status().complete, observed: !!status().observed };
    }
    row.hardness = {
      weakerBodyVoids: !neg.weakerBody.complete && !neg.weakerBody.observed,
      unbloodiedVoids: !neg.unbloodied.complete && !neg.unbloodied.observed,
      helperVoids: neg.helper.skipped
        ? false
        : (!neg.helper.complete && !neg.helper.observed),
      detail: neg,
    };
  }

  // Short natural juggernaut lean: no prepared outmatched fight injection.
  {
    K.newRun(G);
    s = G.state.scholar; v = G.state.village; me = G.villagerId;
    s.day = 40; s.kcal = 6000; s.health = G.maxHealth();
    s.abilities = JUGGERNAUT.map(id => ({ id, level: 1 }));
    s.activeSynergies = (god.requires.synergies || []).slice();
    s.godhood = { active: [], recognized: {} };
    s.godpath = Object.assign({}, s.godpath || {}, { since: 1 });
    delete v.godpathDeeds;
    G.state.systemArrived = true;
    G.recognizeClass('player');
    let completed = false, observed = false, fightsSeen = 0;
    const horizon = Number(process.env.NATURAL_DAYS || 21);
    const classAtStart = s.godpath?.subclass || null;
    for (let i = 0; i < horizon; i++) {
      s.health = Math.max(s.health, 60); s.kcal = Math.max(s.kcal, 2000);
      if (G.tbfight && !G.tbfight.over) {
        fightsSeen++;
        try { G.tbEnd('fled'); } catch (e) { G.tbfight = null; }
      }
      try { G.endDay(); } catch (e) { /* keep measuring */ }
      s = G.state.scholar; v = G.state.village; me = G.villagerId;
      const st = G.godpathDeedStatus('player', god.id) || {};
      if (st.observed) observed = true;
      if (st.complete) { completed = true; break; }
      if (G.over) break;
    }
    row.naturalLean = {
      horizon,
      classAtStart,
      classAtEnd: s.godpath?.subclass || null,
      fightsInterrupted: fightsSeen,
      observed,
      complete: completed,
      ascended: !!(s.godhood?.active || []).includes(god.id),
      book: !!(v.godpathDeeds?.[me]?.outmatched_kill),
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
  const finishPass = ok.filter(r => r.finishHookControl?.stripsDeed).length;
  const preparedPass = ok.filter(r => r.prepared?.complete && r.prepared?.ascended && r.prepared?.openingOk).length;
  const hardnessPass = ok.filter(r =>
    r.hardness?.weakerBodyVoids && r.hardness?.unbloodiedVoids && r.hardness?.helperVoids).length;
  const natural = ok.map(r => r.naturalLean || {});
  return {
    seeds: ok.map(r => r.seed),
    errors: rows.filter(r => r.error).map(r => ({ seed: r.seed, error: r.error })),
    wiringPass: `${wiringPass}/${ok.length}`,
    finishHookPass: `${finishPass}/${ok.length}`,
    preparedPass: `${preparedPass}/${ok.length}`,
    hardnessPass: `${hardnessPass}/${ok.length}`,
    natural: {
      complete: natural.filter(n => n.complete).length,
      ascended: natural.filter(n => n.ascended).length,
      observed: natural.filter(n => n.observed || n.book).length,
      of: ok.length,
    },
    authored: ok[0]?.authored || null,
  };
}

async function parentMain() {
  const T = K.reporter('one-person-army-deed-attainment');
  const rows = [];
  for (const seed of SCREENING) {
    process.stderr.write(`seed ${seed}...\n`);
    rows.push(spawnSeed(seed));
  }
  const summary = summarize(rows);
  const sample = rows.find(r => !r.error) || rows[0];
  const n = summary.seeds.length;

  T.ok('authored outmatched_kill deed is present on brawler / one_person_army',
    summary.authored?.event === 'outmatched_kill', JSON.stringify(summary.authored));
  T.ok('wiring: armed deed blocks synergy proxies on every screening seed',
    n === SCREENING.length && summary.wiringPass === `${n}/${n}`, JSON.stringify(summary));
  T.ok('failing control: removing the deed opens synergy proxies (would fail if unwired)',
    n === SCREENING.length && summary.wiringPass === `${n}/${n}`);
  T.ok('failing control: stripping finishApexHunt earns no outmatched_kill',
    summary.finishHookPass === `${n}/${n}`, JSON.stringify(summary.finishHookPass));
  T.ok('prepared juggernaut bloodied solo attains One-Person Army on every seed',
    summary.preparedPass === `${n}/${n}`, JSON.stringify(summary.preparedPass));
  T.ok('hardness: weaker body, unbloodied kill, and helper each void the deed',
    summary.hardnessPass === `${n}/${n}`, JSON.stringify(summary.hardnessPass));
  T.ok('natural juggernaut lean: short horizon does not complete outmatched_kill on this bank',
    summary.natural.complete === 0 && summary.natural.ascended === 0,
    JSON.stringify(summary.natural));

  const out = {
    panel: 'one-person-army-deed-attainment',
    date: '2026-11-08',
    seeds: SCREENING,
    summary,
    sampleWiring: sample?.wiring || null,
    samplePrepared: sample?.prepared || null,
    sampleHardness: sample?.hardness || null,
    sampleNatural: sample?.naturalLean || null,
    rows,
  };
  T.done();
  process.stdout.write(MARK + 'PANEL\n' + JSON.stringify(out, null, 2) + '\n');
}

if (process.env.ATTAIN_CHILD === '1') {
  childMain().catch(e => { console.error(e.stack || e); process.exit(1); });
} else {
  parentMain().catch(e => { console.error(e.stack || e); process.exit(1); });
}
