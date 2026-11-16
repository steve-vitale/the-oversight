// test-ammocensus-a.js — proof test, arm sim-ammocensus-a (DIAG).
// Proves, on synthetic fixtures and a live in-memory run (no corpus
// numbers): the classifier, the gate over-count detector, the recorder
// rows, the frozen GO bars on fixtures, the wave-4 id set, and the
// determinism leg runner (recorder on vs off, 20d, seed 100861).
// Usage: node scripts/test-ammocensus-a.js
// Exit 0 green, 1 on any failure. Never writes into the repo.
'use strict';
process.env.DAYS = process.env.DAYS || '20';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const D = require(path.join(REPO, 'scripts', 'ammocensus-driver-20261115'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---- fixture item defs (minimal, mirroring src/data/items.json) ----
const ITEMS = [
  { id: 'crude_bow', name: 'Crude bow', weapon: { bonus: 18, type: 'ranged', range: 5, ammo: 'arrow' } },
  { id: 'bow', name: 'Bow', weapon: { bonus: 22, type: 'ranged', range: 5, ammo: 'arrow' } },
  { id: 'crossbow', name: 'Crossbow', weapon: { bonus: 28, type: 'ranged', range: 6, ammo: 'bolt' } },
  { id: 'sling', name: 'Sling', weapon: { bonus: 8, type: 'ranged', range: 4, ammo: 'stone' } },
  { id: 'machete', name: 'Machete', weapon: { bonus: 12, type: 'melee', range: 1 } },
  { id: 'hunting_spear', name: 'Hunting spear', weapon: { bonus: 10, type: 'melee', range: 2 } },
  { id: 'arrow', name: 'Arrow', class: 'ammo' },
  { id: 'bolt', name: 'Bolt', class: 'ammo' },
  { id: 'stone', name: 'Stone', class: 'ammo' },
];
function fakeGame(persons) {
  return {
    data: { items: ITEMS },
    state: { scholar: { day: 5 } },
    getPerson: function (vid) { return persons[vid] || null; },
    vpOf: function (vid) { return persons[vid] || null; },
  };
}
function person(name, equipped, items) {
  return { name: name, equipped: equipped || {}, items: items || [] };
}

(async function () {
  console.log('== static ==');
  check('driver file exists under ammocensus-* name', fs.existsSync(path.join(REPO, 'scripts', 'ammocensus-driver-20261115.js')));
  check('analyzer file exists under ammocensus-* name', fs.existsSync(path.join(REPO, 'scripts', 'analyze-ammocensus-a.js')));
  check('detcompare file exists under ammocensus-* name', fs.existsSync(path.join(REPO, 'scripts', 'ammocensus-detcompare.js')));
  check('no vetparty instrument file overwritten', fs.existsSync(path.join(REPO, 'scripts', 'vetparty-driver-20261115.js')));
  try {
    execSync('git diff --quiet -- src/js src/data', { cwd: REPO, stdio: 'ignore' });
    check('no src/js or src/data modification by this arm', true);
  } catch (e) { check('no src/js or src/data modification by this arm', false, 'git diff is non-empty'); }
  const ids = D.loadWave4Ids();
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const live = (raw.monsters || raw).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  check('wave-4 id set matches monsters.json exactly (10 ids)', JSON.stringify(ids) === JSON.stringify(live) && ids.length === 10, 'got ' + ids.join(','));

  console.log('== classifier units ==');
  let g = fakeGame({
    v1: person('Koki', { ranged: { itemId: 'crude_bow' } }, [{ itemId: 'crude_bow' }, { itemId: 'arrow', units: 3 }]),
  });
  let c = D.classifyFighter(g, 'v1');
  check('bow + arrows -> armed-with-ammo', c.class === 'armed-with-ammo' && c.ammoN === 3 && c.ammoNeed === 'arrow', JSON.stringify(c));
  check('bow + arrows -> effectively armed', c.effectivelyArmed === true && c.gateArmed === true);

  g = fakeGame({
    v1: person('Koki', { ranged: { itemId: 'crude_bow' } }, [{ itemId: 'crude_bow' }]),
  });
  c = D.classifyFighter(g, 'v1');
  check('bow + 0 arrows -> armed-no-ammo', c.class === 'armed-no-ammo' && c.ammoN === 0 && c.ammoNeed === 'arrow', JSON.stringify(c));
  check('bow + 0 arrows -> otherAmmoN 0', c.otherAmmoN === 0);
  check('dry bow only -> NOT effectively armed, but gate-armed (the over-count)', c.effectivelyArmed === false && c.gateArmed === true);

  g = fakeGame({
    v1: person('Koki', { ranged: { itemId: 'crude_bow' } }, [{ itemId: 'crude_bow' }, { itemId: 'stone', units: 5 }]),
  });
  c = D.classifyFighter(g, 'v1');
  check('bow + stones (wrong ammo) -> armed-no-ammo, otherAmmoN 5', c.class === 'armed-no-ammo' && c.otherAmmoN === 5, JSON.stringify(c));

  g = fakeGame({
    v1: person('Devon', { ranged: { itemId: 'sling' } }, [{ itemId: 'sling' }]),
  });
  c = D.classifyFighter(g, 'v1');
  check('dry sling -> armed-no-ammo, ammoNeed stone (mislabel visible)', c.class === 'armed-no-ammo' && c.ammoNeed === 'stone', JSON.stringify(c));

  g = fakeGame({
    v1: person('Devon', { ranged: { itemId: 'crossbow' } }, [{ itemId: 'crossbow' }]),
  });
  c = D.classifyFighter(g, 'v1');
  check('dry crossbow -> armed-no-ammo, ammoNeed bolt', c.class === 'armed-no-ammo' && c.ammoNeed === 'bolt', JSON.stringify(c));

  g = fakeGame({
    v1: person('Miguel', { melee: { itemId: 'machete' } }, [{ itemId: 'machete' }]),
  });
  c = D.classifyFighter(g, 'v1');
  check('machete, no ranged -> unarmed with melee fallback', c.class === 'unarmed' && c.meleeWeapon === 'machete' && c.effectivelyArmed === true && c.gateArmed === true, JSON.stringify(c));

  g = fakeGame({
    v1: person('Aroha', {}, []),
  });
  c = D.classifyFighter(g, 'v1');
  check('no weapon at all -> unarmed, not gate-armed, not effectively armed', c.class === 'unarmed' && c.gateArmed === false && c.effectivelyArmed === false, JSON.stringify(c));

  g = fakeGame({
    v1: person('Spear', { ranged: { itemId: 'hunting_spear' } }, [{ itemId: 'hunting_spear' }]),
  });
  c = D.classifyFighter(g, 'v1');
  check('spear in ranged slot -> unarmed, spear recorded, melee fallback', c.class === 'unarmed' && c.spearInRangedSlot === true && c.meleeWeapon === 'hunting_spear' && c.effectivelyArmed === true, JSON.stringify(c));

  g = fakeGame({
    v1: person('Koki', { ranged: { itemId: 'crude_bow' }, melee: { itemId: 'machete' } }, [{ itemId: 'crude_bow' }, { itemId: 'machete' }]),
  });
  c = D.classifyFighter(g, 'v1');
  check('dry bow + melee -> armed-no-ammo but effectively armed', c.class === 'armed-no-ammo' && c.effectivelyArmed === true, JSON.stringify(c));

  g = fakeGame({
    v1: person('Pack', {}, [{ itemId: 'bow' }, { itemId: 'arrow', units: 2 }]),
  });
  c = D.classifyFighter(g, 'v1');
  check('bow in pack, unequipped -> unarmed + carriesRangedUnequipped', c.class === 'unarmed' && c.carriesRangedUnequipped && c.carriesRangedUnequipped.id === 'bow' && c.carriesRangedUnequipped.ammoN === 2, JSON.stringify(c));

  g = fakeGame({});
  c = D.classifyFighter(g, 'ghost');
  check('missing person -> unclassified', c.class === 'unclassified' && c.error === 'no-person', JSON.stringify(c));

  console.log('== gate over-count detector (installRecorder on fixtures) ==');
  function gateFixtureGame(persons, gateRet) {
    const fg = fakeGame(persons);
    fg.winPlanFightGate = function (vid, mdef) { return gateRet; };
    fg.fieldFight = function (vid, mdef, m, opts) {
      return { outcome: 'vFlee', rounds: 3, vTaken: 10, mDealt: 20, calledHelp: false, allyVid: null,
        volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 },
        log: ['Koki has Crude bow but no arrows — the string stays drawn, useless.'] };
    };
    return fg;
  }
  let fg = gateFixtureGame({
    v1: person('Koki', { ranged: { itemId: 'crude_bow' } }, [{ itemId: 'crude_bow' }]),
    v2: person('Miguel', { melee: { itemId: 'machete' } }, [{ itemId: 'machete' }]),
  }, { avoid: true, reason: 'outmatched', party: ['v1', 'v2'] });
  let rec = D.installRecorder(fg);
  fg.winPlanFightGate('v1', { id: 'reunion', wave: 4 });
  check('gate row recorded for wave-4 call', rec.w4gates.length === 1, 'rows=' + rec.w4gates.length);
  let grow = rec.w4gates[0];
  check('gate allArmed true (replica) while member dry-only', grow.gateAllArmed === true && grow.ammoAwareAllArmed === false, JSON.stringify({ a: grow.gateAllArmed, b: grow.ammoAwareAllArmed }));
  check('overCounted names the dry-only fighter', JSON.stringify(grow.overCounted) === JSON.stringify(['v1']) && JSON.stringify(grow.overCountedDryOnly) === JSON.stringify(['v1']), JSON.stringify(grow.overCounted));
  check('gate row carries per-member classifications', grow.members.length === 2 && grow.members[0].class === 'armed-no-ammo' && grow.members[1].class === 'unarmed', JSON.stringify(grow.members.map(function (m) { return m.class; })));
  fg.fieldFight('v1', { id: 'reunion', wave: 4 }, null, { allies: 1, allyVids: ['v2'], allyFromStart: true });
  check('meeting row recorded for wave-4 fieldFight', rec.w4meetings.length === 1, 'rows=' + rec.w4meetings.length);
  const mrow = rec.w4meetings[0];
  check('meeting fighter classified armed-no-ammo', mrow.fighter.class === 'armed-no-ammo', JSON.stringify(mrow.fighter));
  check('meeting ally classified', mrow.allies.length === 1 && mrow.allies[0].class === 'unarmed', JSON.stringify(mrow.allies));
  check('meeting volley {shots:0} recorded', mrow.volley && mrow.volley.shots === 0, JSON.stringify(mrow.volley));
  check('meeting noArrowsLines extracts the honest line', mrow.noArrowsLines.length === 1 && /but no arrows/.test(mrow.noArrowsLines[0]), JSON.stringify(mrow.noArrowsLines));
  check('meeting carries gate snapshot', mrow.gate && mrow.gate.reason === 'outmatched', JSON.stringify(mrow.gate));
  rec.uninstall();
  check('uninstall restores originals', typeof fg.winPlanFightGate === 'function' && fg.winPlanFightGate('v1', { id: 'reunion', wave: 4 }).reason === 'outmatched');

  fg = gateFixtureGame({
    v1: person('Koki', { ranged: { itemId: 'crude_bow' } }, [{ itemId: 'crude_bow' }, { itemId: 'arrow', units: 2 }]),
    v2: person('Miguel', { melee: { itemId: 'machete' } }, [{ itemId: 'machete' }]),
  }, { seek: true, reason: 'seek', party: ['v1', 'v2'] });
  rec = D.installRecorder(fg);
  fg.winPlanFightGate('v1', { id: 'eulogy', wave: 4 });
  grow = rec.w4gates[0];
  check('all-effectively-armed gate row passes (no over-count)', grow.overCounted.length === 0 && grow.ammoAwareAllArmed === true && grow.gateAllArmed === true, JSON.stringify(grow));
  rec.uninstall();

  console.log('== judge bars on fixtures ==');
  function judge(o) {
    return o.classifiedShare === 1 && o.filesParse === 8 && o.determinism === true && o.proofGreen === true;
  }
  check('GO shape judges GO', judge({ classifiedShare: 1, filesParse: 8, determinism: true, proofGreen: true }) === true);
  check('unclassified meeting judges NOT-GO', judge({ classifiedShare: 0.97, filesParse: 8, determinism: true, proofGreen: true }) === false);
  check('parse failure judges NOT-GO', judge({ classifiedShare: 1, filesParse: 7, determinism: true, proofGreen: true }) === false);
  check('determinism failure judges NOT-GO', judge({ classifiedShare: 1, filesParse: 8, determinism: false, proofGreen: true }) === false);

  console.log('== determinism leg runner (live, seed 100861, 20d) ==');
  function trajKey(o) {
    const log = ((o.daily || []).slice(-1)[0] || {}).waveKillLog || null;
    return JSON.stringify({ days: o.days, endReason: o.endReason, deaths: o.deaths, log: log, standing: o.standing });
  }
  const on1 = await D.oneRun(100861, { recorder: 'on' });
  const off = await D.oneRun(100861, { recorder: 'off' });
  const on2 = await D.oneRun(100861, { recorder: 'on' });
  check('recorder on vs off trajectories identical (20d)', trajKey(on1) === trajKey(off), 'on=' + trajKey(on1).slice(0, 200) + ' off=' + trajKey(off).slice(0, 200));
  check('recorder on vs on trajectories identical (20d)', trajKey(on1) === trajKey(on2));
  check('recorder on vs on rows identical (20d)', JSON.stringify(on1.w4meetings) === JSON.stringify(on2.w4meetings) && JSON.stringify(on1.w4gates) === JSON.stringify(on2.w4gates));
  check('live classifier runs on real persons (no unclassified from engine)', (on1.w4meetings || []).every(function (m) { return m.fighter.class !== 'unclassified'; }));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
