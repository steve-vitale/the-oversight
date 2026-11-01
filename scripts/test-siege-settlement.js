'use strict';
// Prepared low-HP raiders expose settlement ordering; no natural-balance claim.
// Every child owns one shared seeded runtime and uses real encounter results.
const K = require('./godpath/lib');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');

async function scene(mode, seed) {
  const G = await K.load({ seed, narration: true });
  const scholar = K.newRun(G);
  const village = G.state.village;
  const resident = village.roster.find(id => id !== G.villagerId);
  assert(resident);
  const lines = [], calls = [], say = G.say;
  G.say = function (...args) {
    lines.push(String(args[0]));
    return say.apply(this, args);
  };
  G.worldMonsters().splice(0);
  const definition = G.data.monsters.find(row => row.id === 'hushwolf');
  assert(definition);
  const fleeing = mode.includes('flee');
  const multi = mode.includes('multi');
  const waiting = mode.startsWith('wait');
  const first = G.spawnWorldMonster(definition, waiting ? 5 : 4, 4, {
    hp: fleeing ? 1 : 5, maxHp: fleeing ? 50 : 5,
    lingering: true, mx: 5, my: 4,
  });
  const second = multi ? G.spawnWorldMonster(definition, waiting ? 6 : 5, 4, {
    lingering: true, mx: 3, my: 3,
  }) : null;
  if (waiting) {
    scholar.day = 20;
    G.dayPart = 0;
    scholar.dayTicks = 127;
    scholar.actionClock = 0;
    G.map.px = 4; G.map.py = 4; G.location = 'village';
    scholar.mx = 4; scholar.my = 4;
    village.assignments = { [resident]: {
      task: 'patrol', assignedDay: 20, assignedPart: 0, via: 'prepared test',
    } };
  }
  G.raiseAidCrisis('Prepared siege', 1);
  const crisis = G.aidCrisis();
  crisis.raiders = mode !== 'generic';
  const fieldFight = G.fieldFight;
  G.fieldFight = function (...args) {
    const record = fieldFight.apply(this, args);
    calls.push({
      resident: args[0], outcome: record?.outcome,
      vTaken: record?.vTaken, actualTarget: args[2] === first,
    });
    return record;
  };
  const wounds = [], treatments = [];
  const hurtVillager = G.hurtVillager, healCheck = G.villagerHealCheck;
  G.hurtVillager = function (...args) {
    const before = village.health?.[args[0]] ?? 100;
    const value = hurtVillager.apply(this, args);
    const after = village.health?.[args[0]] ?? 100;
    if (args[0] === resident && after < before) wounds.push({ before, after, debit: before - after });
    return value;
  };
  G.villagerHealCheck = function (...args) {
    const before = village.health?.[args[0]] ?? 100;
    const value = healCheck.apply(this, args);
    const after = village.health?.[args[0]] ?? 100;
    if (args[0] === resident && after > before) treatments.push({ before, after, gain: after - before });
    return value;
  };
  const startHp = village.health?.[resident] ?? 100;
  const startTicks = scholar.dayTicks;
  let guardResult = null;
  if (mode === 'guard') {
    guardResult = G.resolveAidCrisis('fought');
  } else if (mode === 'active') {
    G.map.px = 4; G.map.py = 4;
    scholar.mx = 2; scholar.my = 4; scholar.monster = first;
    G.startCombat('hushwolf');
    assert(G.tbfight && !G.tbfight.over && G.tbfight.worldOrigin === first,
      'Actual lifted world-origin fight required');
    assert(!G.worldMonsters().includes(first));
    guardResult = G.resolveAidCrisis('fought');
    crisis.ageParts = 3;
    G.commsTick();
  } else if (waiting) {
    G.doAction('wait');
  } else if (mode.startsWith('patrol')) {
    G.resolvePatrol(resident, 'Prepared resident');
  } else {
    G.resolveWildMonsterEncounter(resident, first, { raid: true });
  }
  return {
    mode, seed, resident, calls,
    crisisOpen: G.aidCrisis() === crisis, guardResult,
    remaining: G.lingeringRaiders().map(m => ({ id: m.id, hp: m.hp })),
    firstPresent: G.worldMonsters().includes(first),
    secondPresent: !!second && G.worldMonsters().includes(second),
    hp: village.health?.[resident] ?? 100, startHp, wounds, treatments,
    startTicks, ticks: scholar.dayTicks, lines,
    killEntries: (G.state.waveKillLog || []).filter(row =>
      row.by === resident && row.mid === 'hushwolf'),
    active: !!(G.tbfight && !G.tbfight.over && G.tbfight.worldOrigin === first),
  };
}

if (process.argv[2] === '--child') {
  scene(process.argv[3], Number(process.argv[4]))
    .then(row => console.log('SIEGE_RESULT ' + JSON.stringify(row)))
    .catch(error => { console.error(error.stack); process.exitCode = 1; });
} else {
  const T = K.reporter('Siege settled threats');
  const modes = [
    'wild-multi-kill', 'patrol-multi-kill', 'wild-multi-flee', 'patrol-multi-flee',
    'wild-last-kill', 'patrol-last-kill', 'wild-last-flee', 'patrol-last-flee',
    'generic', 'guard', 'active', 'wait-multi-kill', 'wait-last-kill',
  ];
  for (const seed of [7, 42]) for (const mode of modes) {
    const child = spawnSync(process.execPath, [__filename, '--child', mode, String(seed)], {
      cwd: K.ROOT, encoding: 'utf8', timeout: 120000, maxBuffer: 4e6,
    });
    assert.equal(child.status, 0, child.stderr);
    const marked = child.stdout.split('\n').filter(line => line.startsWith('SIEGE_RESULT '));
    assert.equal(marked.length, 1);
    const row = JSON.parse(marked[0].slice('SIEGE_RESULT '.length));
    console.log(JSON.stringify(row));
    const label = seed + ' ' + mode;
    if (mode === 'guard' || mode === 'active') {
      T.ok(label + ' live raid cannot be declared fought',
        row.crisisOpen && row.guardResult === 'ongoing' &&
        !row.lines.some(line => line.includes('door is quiet')));
      if (mode === 'active') T.ok(label + ' actual lifted body remains guarded after tick',
        row.active && row.remaining.length === 0);
      continue;
    }
    const kill = mode.includes('kill') || mode === 'generic';
    T.ok(label + ' actual single full-engine fight',
      row.calls.length === 1 && row.calls[0].actualTarget &&
      row.calls[0].resident === row.resident &&
      row.calls[0].outcome === (kill ? 'vKill' : 'mFlee'));
    T.ok(label + ' actual incoming costs and one credited kill',
      row.wounds.length === (row.calls[0].vTaken > 0 ? 1 : 0) &&
      row.wounds.reduce((sum, wound) => sum + wound.debit, 0) === row.calls[0].vTaken &&
      row.hp === row.startHp - row.calls[0].vTaken +
        row.treatments.reduce((sum, treatment) => sum + treatment.gain, 0) && row.hp > 0 &&
      row.killEntries.length === (kill ? 1 : 0));
    const shouldClose = mode.includes('last-kill') || mode === 'generic';
    T.ok(label + ' crisis matches actual remaining threats',
      row.crisisOpen !== shouldClose && (shouldClose
        ? row.lines.filter(line => line === 'The door is quiet. Haven breathes.').length === 1
        : !row.lines.some(line => line.includes('door is quiet'))));
    T.ok(label + ' settled body stays removed or lingering honestly',
      kill ? !row.firstPresent : row.firstPresent && row.remaining.length > 0);
    if (mode.includes('multi')) T.ok(label + ' sibling survives unchanged',
      row.secondPresent && row.remaining.some(monster => monster.hp === 50));
    if (mode.startsWith('wait')) {
      T.ok(label + ' public Wait pays the actual part boundary',
        row.startTicks === 127 && row.ticks === 128);
      T.ok(label + ' final Wait narration preserves the actual siege result',
        row.lines.at(-1) === (shouldClose
          ? 'You wait. The treeline is quiet now.'
          : 'The siege continues. Something still moves beyond the firelight.'));
    }
  }
  T.done();
}
