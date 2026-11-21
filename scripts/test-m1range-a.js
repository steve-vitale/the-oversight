// test-m1range-a.js — proof test, arm sim-m1range-a
// (finding #2590, evade-on-a-quivered-bow, Step 2: the M1 term —
// give the awareness check a ranged term). Proves the lever +
// the classifier + the game behavior it reads. It does NOT run the
// judged leg — the pilot's own corpora prove the live path (plus the
// 1-seed smoke).
//   - Static: the term sits in the awareness block after the ability
//     terms and the godpath detection term, before the clamp; term
//     values -0.15 (ranged+ammo) / -0.25 (armed searcaster);
//     env-gated on M1RANGE=1; the predicate is the volley's own
//     (equipped ranged weapon whose def carries weapon.ammo, >=1
//     ammo by item id OR material); flag unset = base behavior
//     (the term is 0 and only a record-only rec field is added).
//   - Static driver: the leg/flag match is asserted, the lever and
//     the supply stack are recorded per corpus file.
//   - Classifier fixtures: one synthetic meeting per class (the
//     priority order inside vFlee), 0 UNCLASSIFIED on fixture
//     corpora, served/fought-served/served-volley counts, the
//     engine-vs-driver term mismatch read, evadeP replication
//     incl. the term.
//   - Analyzer: its --selftest runs green from here.
//   - LIVE (sim harness, opts.rng fixed-draw): a staged bow-holder
//     with a known replicated evadeP — a draw between (evadeP-term)
//     and evadeP evades with the flag unset and reaches contact with
//     it set; a draw below both evades either way; a draw above both
//     contacts either way; unarmed and 0-ammo fixtures are identical
//     with the flag set or unset; the clamp holds at the 0.05 floor;
//     a searcaster fixture takes the -0.25 term. The monster is a
//     real wave-4 def (eulogy) with hp/attack overridden weak so
//     the contact fights cannot kill the fixture villager.
// Harness: shared sim-harness (seeded Math.random BEFORE eval).
'use strict';
process.env.VETREENGAGE = '1';
process.env.PARTYSIZE4 = '1';
process.env.FLEEREPAIR2 = '1';
process.env.FIGHTALLY2 = '1';
process.env.SENSEEXPED = '1';
process.env.BOWOPEN = '1';
process.env.SPEARGATE = '1';
process.env.GUNRATE = '1';
process.env.CELLGATE = '1';
process.env.M1RANGE = '1';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const analyzer = require('./analyze-m1range-a');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function mrow(over) {
  const base = { seed: 1, day: 50, vid: 'v1', mid: 'eater', wave: 4, origin: 'expedition',
    rangedId: 'crude_bow', ammoAtEntry: 4,
    evade: { awareness: true, tracking: 0, behavior: 'territorial', mSpeed: 3, mNotice: 5, mSize: 1, potential: false, abs: {}, abNight: false, m1rangeTerm: 0, evadeP: 0.24, gpTerm: false, obsBefore: 0, obsAfter: 0 },
    m1rangeTermEngine: 0,
    outcome: 'evade', rounds: 0, vTaken: 0, mDealt: 0, mHpStart: 1000, calledHelp: false,
    allyVid: null, ally2Vid: null, alliesN: 0, fleeHpFrac: null, fleeWise: false, fleeLearn: false,
    fleeHopeless: false, everHopeless: false, everWinning: false, intent: 'engage', intentWhy: 'seek',
    volley: null };
  return Object.assign(base, over || {});
}
const STAGE = [
  { day: 10, vid: 'v1', staged: true, source: 'crafted', itemId: 'crude_bow', spearHolder: true, depmatSite: true },
  { day: 40, vid: 'v1', staged: true, source: 'fromStash', itemId: 'bow', spearHolder: false, depmatSite: false },
];

async function main() {
  // ---- 1. Static wiring: no game.js substrate is re-landed ----
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('GUNRATE present (supply stack)', /GUNRATE \(sim-gunrate-a/.test(gameSrc));
  check('BOWOPEN present (supply stack)', /BOWOPEN/.test(gameSrc) && /villagerStageBow/.test(gameSrc));
  check('SPEARGATE present (supply stack)', /SPEARGATE/.test(gameSrc) && /volleyWeaponOf/.test(gameSrc));
  check('DEPMAT NOT re-landed (not this arm\'s substrate)', !/DEPMAT/.test(gameSrc));
  check('ROLL35 NOT re-landed (not this arm\'s substrate)', !/ROLL35/.test(gameSrc));
  check('AMMO NOT re-landed (not this arm\'s substrate)', !/AMMO \(sim-ammo-a/.test(gameSrc));
  check('FIBERFETCH absent (concept-dead)', !/FIBERFETCH \(sim-fiberfetch-a/.test(gameSrc));

  // ---- 2. Static M1: the ranged term in the awareness block ----
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  const awStart = ffSrc.indexOf('// ---- awareness:');
  const clampIdx = ffSrc.indexOf('evade = clamp(evade, 0.05, 0.90)', awStart);
  const awBlock = (awStart !== -1 && clampIdx !== -1) ? ffSrc.slice(awStart, clampIdx) : '';
  check('awareness block found (clamp follows it)', awStart !== -1 && clampIdx !== -1);
  check('M1 comment header present', /M1RANGE \(sim-m1range-a/.test(ffSrc));
  check('M1 env-gates on M1RANGE=1', /process\.env\.M1RANGE === '1'/.test(awBlock));
  check('M1 reads the equipped ranged weapon (volley predicate)', /S\.equipment\.rangedWeaponOf\(vp, this\.data\.items\)/.test(awBlock));
  check('M1 reads the weapon def ammo id', /_m1rdef\.weapon\) \? _m1rdef\.weapon\.ammo : null/.test(awBlock));
  check('M1 counts ammo by id OR material', /_m1eid === _m1ammo \|\| _m1mat === _m1ammo/.test(awBlock));
  check('M1 bow term is -0.15', /_m1Term = \(_m1rid === 'searcaster'\) \? -0\.25 : -0\.15/.test(awBlock));
  check('M1 searcaster term is -0.25', /_m1rid === 'searcaster'\) \? -0\.25/.test(awBlock));
  check('M1 term applies before the clamp', awBlock.indexOf('evade += _m1Term') !== -1 && awBlock.indexOf('evade += _m1Term') < awBlock.length);
  check('M1 sits after the ability terms', awBlock.indexOf("vHasAb('game_sense')") !== -1 && awBlock.indexOf('evade += _m1Term') > awBlock.indexOf("vHasAb('game_sense')"));
  check('M1 sits after the godpath detection term', awBlock.indexOf('GPf.fieldEvade') !== -1 && awBlock.indexOf('evade += _m1Term') > awBlock.indexOf('GPf.fieldEvade'));
  check('M1 records the term on the fight record', /rec\.m1rangeTerm = _m1Term/.test(awBlock));
  check('M1 requires >=1 ammo', /if \(_m1n >= 1\)/.test(awBlock));
  // Flag unset = base behavior: the only lines outside the env gate
  // are `evade += _m1Term` (0 when off) and the record-only
  // `rec.m1rangeTerm` assignment — no other awareness line changed.
  const m1Lines = (ffSrc.match(/_m1Term/g) || []).length;
  check('M1 touches nothing outside its own lines (' + m1Lines + ' _m1Term refs, all in-block)',
    m1Lines === 4 && /evade \+= _m1Term;/.test(awBlock) && !/M1RANGE/.test(ffSrc.slice(0, awStart) + ffSrc.slice(clampIdx)));
  // The volley predicate is untouched: the volley block still reads
  // the same ranged weapon + ammo the term reads.
  const volleyStart = ffSrc.indexOf('RANGED OPENING VOLLEY');
  check('volley block still uses rangedWeaponOf + weapon.ammo',
    volleyStart !== -1 && /S\.equipment\.rangedWeaponOf\(vp, this\.data\.items\)/.test(ffSrc.slice(volleyStart, volleyStart + 3000)) &&
    /_w\.ammo/.test(ffSrc.slice(volleyStart, volleyStart + 3000)));

  // ---- 3. Driver: the leg/flag match is asserted, the lever is recorded ----
  const drvSrc = fs.readFileSync(path.join(REPO, 'scripts', 'm1range-driver-a.js'), 'utf8');
  check('driver requires M1RANGE=1 on the arm leg', /MODE=arm requires M1RANGE=1/.test(drvSrc));
  check('driver requires M1RANGE unset on the ctl leg', /MODE=ctl requires M1RANGE unset/.test(drvSrc));
  check('driver requires GUNRATE=1 on BOTH legs', /GUNRATE=1 required on BOTH legs/.test(drvSrc));
  check('driver requires CELLGATE=1 on BOTH legs', /CELLGATE=1 required on BOTH legs/.test(drvSrc));
  check('driver requires DEPMAT/ROLL35/AMMO unset on BOTH legs',
    /DEPMAT must be unset on BOTH legs/.test(drvSrc) && /ROLL35 must be unset on BOTH legs/.test(drvSrc) && /AMMO must be unset on BOTH legs/.test(drvSrc));
  check('driver records m1rangePresent/m1rangeOn per corpus file',
    /m1rangePresent: M1RANGE_PRESENT, m1rangeOn: M1RANGE_ON/.test(drvSrc));
  check('driver records gunrate/cellgate per corpus file',
    /gunratePresent: GUNRATE_PRESENT, gunrateOn: GUNRATE_ON/.test(drvSrc) &&
    /cellgatePresent: CELLGATE_PRESENT, cellgateOn: CELLGATE_ON/.test(drvSrc));
  check('driver applies the term in its evadeP replication',
    /m1rangeTerm = \(rangedId === 'searcaster'\) \? -0\.25 : -0\.15/.test(drvSrc));
  check('driver records the engine term off the fight record',
    /row\.m1rangeTermEngine = \(rec\.m1rangeTerm/.test(drvSrc));
  check('driver counts ammo by id OR material (engine predicate)',
    /eid === ammoId \|\| emat === ammoId/.test(drvSrc));

  // ---- 4. Classifier fixtures (one per class + priority order) ----
  const maps = analyzer.servedBowMaps(STAGE);
  check('awareness-evade', analyzer.classifyMeeting(mrow(), maps).cls === 'awareness-evade');
  check('hopeless-after-help', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 5, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.3 }), maps).cls === 'hopeless-after-help');
  check('hopeless-alone', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 4, fleeHopeless: true, fleeHpFrac: 0.22 }), maps).cls === 'hopeless-alone');
  check('floor-hp', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeHopeless: false, fleeHpFrac: 0.12 }), maps).cls === 'floor-hp');
  check('wise-leave beats hopeless (priority)', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeWise: true, fleeHopeless: true, calledHelp: true }), maps).cls === 'wise-leave');
  check('learn-withdraw', analyzer.classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeLearn: true, intent: 'learn' }), maps).cls === 'learn-withdraw');
  check('engaged-vKill with volley', analyzer.classifyMeeting(mrow({ outcome: 'vKill', rounds: 6, mDealt: 400, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }), maps).cls === 'engaged-vKill');
  check('engaged-vDie (volley then R2 death)', analyzer.classifyMeeting(mrow({ outcome: 'vDie', rounds: 2, mDealt: 34, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }), maps).cls === 'engaged-vDie');
  check('alreadyDead', analyzer.classifyMeeting(mrow({ outcome: 'alreadyDead', rounds: 0 }), maps).cls === 'alreadyDead');
  check('unknown outcome is unclassified', analyzer.classifyMeeting(mrow({ outcome: 'mKill', rounds: 1 }), maps).cls === 'unclassified');
  check('unarmed lead is not in the population', analyzer.classifyMeeting(mrow({ rangedId: null, ammoAtEntry: 0 }), maps) === null);
  check('ranged but 0 ammo is not in the population', analyzer.classifyMeeting(mrow({ ammoAtEntry: 0 }), maps) === null);
  check('searcaster with cells is in the population', analyzer.classifyMeeting(mrow({ rangedId: 'searcaster', ammoAtEntry: 2 }), maps) !== null);
  check('classifier passes awareness through', analyzer.classifyMeeting(mrow(), maps).awareness === true);
  check('classifier passes the engine term through', analyzer.classifyMeeting(mrow({ m1rangeTermEngine: -0.15 }), maps).m1rangeTermEngine === -0.15);

  // ---- 5. Fixture corpora: no UNCLASSIFIED, served counts ----
  const fj = { seed: 1, days: 150, endReason: 'survived', villageLost: false, maxWave: 5, standing: 199, scaleRank: 'regional', won: false,
    deaths: [], instrumentErrors: [], depmatRows: STAGE, ammoRows: [],
    v4encounters: [
      mrow({}),
      mrow({ day: 60, outcome: 'vFlee', rounds: 5, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.3, mDealt: 120 }),
      mrow({ day: 65, outcome: 'vFlee', rounds: 4, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.37, mDealt: 187, mHpStart: 900, volley: { shots: 1, hits: 1, dmg: 13, ammoLeft: 0 } }),
      mrow({ day: 70, outcome: 'vKill', rounds: 6, mDealt: 400, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }),
      mrow({ day: 75, outcome: 'vDie', rounds: 2, mDealt: 34, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }),
      mrow({ day: 80, outcome: 'mFlee', rounds: 4, mDealt: 300, volley: null }),
      mrow({ day: 90, vid: 'v9', rangedId: null, ammoAtEntry: 0, outcome: 'evade', rounds: 0 }),
    ] };
  const fa = analyzer.analyzeFile(fj);
  check('fixture corpus: pool is 6', fa.classified.length === 6, 'got ' + fa.classified.length);
  check('fixture corpus: 0 unclassified', fa.classified.every(function (m) { return m.cls !== 'unclassified'; }), JSON.stringify(fa.classified.map(function (m) { return m.cls; })));
  check('fixture corpus: termMismatch 0', fa.termMismatch === 0);
  // Served meetings: the two vFlees + vKill + vDie + mFlee = 5 served
  // (the awareness-evade is not served); fought-served 5; served
  // volleys 3 (the 107152-shape vFlee, vKill, vDie volleys).
  let servedN = 0, foughtServedN = 0, servedVolleyN = 0;
  for (const m of fa.classified) {
    if (m.cls !== 'unclassified' && m.cls !== 'awareness-evade' && m.cls !== 'alreadyDead') {
      servedN++;
      if ((m.rounds | 0) >= 1 || (m.volley && (m.volley.shots | 0) > 0)) foughtServedN++;
      if (m.volley && (m.volley.shots | 0) > 0) servedVolleyN++;
    }
  }
  check('fixture corpus: served 5 / fought-served 5 / served volleys 3',
    servedN === 5 && foughtServedN === 5 && servedVolleyN === 3, servedN + '/' + foughtServedN + '/' + servedVolleyN);
  check('evadeP replication matches the driver value 0.24', analyzer.replicateEvadeP(mrow().evade) === 0.24);
  check('evadeP replication with bow term 0.09', analyzer.replicateEvadeP(Object.assign({}, mrow().evade, { m1rangeTerm: -0.15 })) === 0.09);

  // ---- 6. Analyzer selftest green from here ----
  const stFails = analyzer.selftest();
  check('analyzer --selftest green', stFails === 0, stFails + ' failures');

  // ---- 7. LIVE legs: the engine applies the term (fixed-draw rng) ----
  const { Game } = await loadGame({ seed: 31031, mode: 'm1range-a-test', fullTelemetry: false });
  await quietLog(async function () { await setupGame(Game); });
  check('live: Game.fieldFight is a function', typeof Game.fieldFight === 'function');
  const roster = (((Game.state || {}).village || {}).roster || []).slice();
  check('live: roster non-empty after setup', roster.length > 0, 'roster=' + roster.length);
  // Pick a villager with NO godpath detection abilities — the
  // replication below cannot see the fieldEvade term, so the
  // fixture must hold none of its inputs (bird_whisperer /
  // third_eye / beast_calm).
  let vid = null;
  for (const cand of roster) {
    let abs = [];
    try { abs = (typeof Game.npcOwnedIds === 'function') ? (Game.npcOwnedIds(cand) || []) : (((Game.state.village || {}).npcAbilities || {})[cand] || []).slice(); } catch (e) {}
    if (abs.indexOf('bird_whisperer') === -1 && abs.indexOf('third_eye') === -1 && abs.indexOf('beast_calm') === -1) { vid = cand; break; }
  }
  check('live: found a villager with no detection abilities', !!vid);
  const vp = Game.getPerson ? Game.getPerson(vid) : null;
  check('live: fixture villager readable via getPerson', !!vp);
  const RANGED_IDS = ['crude_bow', 'bow', 'crossbow', 'sling', 'searcaster'];
  const AMMO_IDS = ['arrow', 'bolt', 'stone', 'fusion_cell'];
  function stripRanged() {
    // Strip the ranged weapons AND their ammo: a 0-ammo fixture must
    // carry no leftover arrows from an earlier leg (the volley spends
    // them, and a stale arrow would arm the bow again).
    vp.items = (vp.items || []).filter(function (e) {
      const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
      return RANGED_IDS.indexOf(id) === -1 && AMMO_IDS.indexOf(id) === -1;
    });
    if (vp.equipped) delete vp.equipped.ranged;
  }
  function giveWeapon(itemId, ammoId, ammoN) {
    stripRanged();
    vp.items = vp.items || [];
    vp.items.push({ itemId: itemId, units: 1 });
    if (ammoId) vp.items.push({ itemId: ammoId, units: ammoN });
  }
  function resetHp() {
    try { ((Game.state.village || {}).health || {})[vid] = 100; } catch (e) {}
  }
  // Replicate the engine's evadeP from the LIVE inputs (same reads
  // as the driver, same operation order as the engine) — so the
  // decisive draws sit exactly between the thresholds.
  function repEvadeP(mdef) {
    const a = (typeof Game.agencyOf === 'function') ? (Game.agencyOf(vid) || {}) : {};
    const xp = ((a.xp || {})[vid] || {});
    const stAg = (typeof Game.agencyState === 'function') ? (Game.agencyState() || {}) : {};
    let vAbs = [];
    try { vAbs = (typeof Game.npcOwnedIds === 'function') ? (Game.npcOwnedIds(vid) || []) : (((Game.state.village || {}).npcAbilities || {})[vid] || []).slice(); } catch (e) {}
    const hasAb = function (id) { return vAbs.indexOf(id) >= 0; };
    const behaviorMod = { ambush: -0.15, pack: -0.10, swarm: -0.05, snake: -0.05, territorial: 0.05, curious: 0.05, drifter: 0.10 }[mdef.behavior || 'territorial'];
    let p = 0.35 + Math.min(0.30, (xp.tracking || 0) * 0.01) + (behaviorMod === undefined ? 0 : behaviorMod)
      - 0.02 * (mdef.speed || 3) - 0.03 * ((mdef.encounter && mdef.encounter.noticeRange) || 5) + 0.05 * (mdef.size || 1)
      + ((((stAg.potential || {})[vid]) ? 0.05 : 0));
    if (hasAb('game_sense')) p += 0.10;
    if (hasAb('tracker')) p += 0.05;
    let night = false;
    try { night = Game.isNight ? Game.isNight() : false; } catch (e) {}
    if (hasAb('echo_location') && night) p += 0.10;
    return Math.max(0.05, Math.min(0.90, p));
  }
  // Real wave-4 def (eulogy), hp/attack overridden weak so the
  // contact fights cannot kill the fixture villager.
  let mdefBase = null;
  try {
    const all = (Game.data && Game.data.monsters) || [];
    for (let i = 0; i < all.length; i++) if (all[i] && all[i].id === 'eulogy') mdefBase = all[i];
  } catch (e) {}
  check('live: eulogy wave-4 def found', !!mdefBase && mdefBase.wave === 4);
  function weakDef(over) {
    const d = Object.assign({}, mdefBase, { hp: [20, 20], pack: 1, attack: { name: 'nip', damage: [1, 1] } });
    return Object.assign(d, over || {});
  }
  function fight(mdef, draw) {
    resetHp();
    return Game.fieldFight(vid, mdef, null, { awareness: true, rng: function () { return draw; } });
  }
  // A decisive draw sits exactly between the flag-off evadeP and the
  // flag-on evadeP (the term applied, then clamped) — the midpoint,
  // so float noise and the 0.05 floor can never push it across either
  // threshold. (A fixed offset like rep-0.20 lands ON the floor when
  // rep is ~0.25, and the floor evades it either way.)
  function decisiveDraw(rep, term) {
    const armed = Math.max(0.05, rep + term);
    return { draw: (rep + armed) / 2, armed: armed };
  }
  // Leg A — the engine reads the term off live state: bow + 7
  // arrows, flag ON, draw 0.99 (contact) — the record carries -0.15
  // and the volley fired.
  process.env.M1RANGE = '1';
  giveWeapon('crude_bow', 'arrow', 7);
  const mdef = weakDef();
  let rec = fight(mdef, 0.99);
  check('live A: bow-holder record carries m1rangeTerm -0.15', rec && rec.m1rangeTerm === -0.15, 'got ' + (rec && rec.m1rangeTerm));
  check('live A: bow-holder volley fired on contact', rec && rec.volley && (rec.volley.shots | 0) >= 1, JSON.stringify(rec && rec.volley));
  check('live A: draw 0.99 reaches contact', rec && rec.outcome !== 'evade', 'outcome ' + (rec && rec.outcome));
  // Leg B — the decisive bow draw: between (evadeP-0.15) and evadeP.
  let rep = repEvadeP(mdef);
  check('live B: replicated evadeP in the decisive band', rep > 0.20 && rep < 0.90, 'rep ' + rep);
  const bowDraw = decisiveDraw(rep, -0.15);
  check('live B: decisive draw sits between the bow thresholds', bowDraw.armed < bowDraw.draw && bowDraw.draw < rep, 'rep ' + rep + ' armed ' + bowDraw.armed + ' draw ' + bowDraw.draw);
  const drawB = bowDraw.draw;
  delete process.env.M1RANGE;
  giveWeapon('crude_bow', 'arrow', 7);
  rec = fight(mdef, drawB);
  check('live B: flag OFF, decisive draw evades', rec && rec.outcome === 'evade', 'outcome ' + (rec && rec.outcome) + ' rep ' + rep + ' draw ' + drawB);
  check('live B: flag OFF record carries term 0', rec && rec.m1rangeTerm === 0, 'got ' + (rec && rec.m1rangeTerm));
  process.env.M1RANGE = '1';
  giveWeapon('crude_bow', 'arrow', 7);
  rec = fight(mdef, drawB);
  check('live B: flag ON, same draw reaches contact', rec && rec.outcome !== 'evade', 'outcome ' + (rec && rec.outcome) + ' rep ' + rep + ' draw ' + drawB);
  check('live B: flag ON record carries term -0.15', rec && rec.m1rangeTerm === -0.15, 'got ' + (rec && rec.m1rangeTerm));
  // Leg C — below both thresholds: evades with the flag on.
  rep = repEvadeP(mdef);
  const drawC = Math.max(0.01, rep - 0.30);
  check('live C: low draw sits below both thresholds', drawC < Math.max(0.05, rep - 0.15), 'rep ' + rep + ' draw ' + drawC);
  giveWeapon('crude_bow', 'arrow', 7);
  rec = fight(mdef, drawC);
  check('live C: flag ON, low draw evades', rec && rec.outcome === 'evade', 'outcome ' + (rec && rec.outcome));
  // Leg D — above both thresholds: contacts with the flag on.
  giveWeapon('crude_bow', 'arrow', 7);
  rec = fight(mdef, 0.99);
  check('live D: flag ON, draw 0.99 reaches contact', rec && rec.outcome !== 'evade', 'outcome ' + (rec && rec.outcome));
  // Leg E — unarmed: the decisive draw evades even with the flag on.
  rep = repEvadeP(mdef);
  const drawE = decisiveDraw(rep, -0.15).draw;
  stripRanged();
  rec = fight(mdef, drawE);
  check('live E: unarmed, decisive draw evades with flag ON', rec && rec.outcome === 'evade', 'outcome ' + (rec && rec.outcome) + ' rep ' + rep);
  check('live E: unarmed record carries term 0', rec && rec.m1rangeTerm === 0, 'got ' + (rec && rec.m1rangeTerm));
  // Leg F — bow with 0 arrows: same draw evades with the flag on.
  giveWeapon('crude_bow', null, 0);
  rec = fight(mdef, drawE);
  check('live F: 0-ammo bow, decisive draw evades with flag ON', rec && rec.outcome === 'evade', 'outcome ' + (rec && rec.outcome));
  check('live F: 0-ammo record carries term 0', rec && rec.m1rangeTerm === 0, 'got ' + (rec && rec.m1rangeTerm));
  // Leg G — searcaster: the -0.25 term moves a draw the bow term
  // cannot (the midpoint between rep-0.25 and rep).
  rep = repEvadeP(mdef);
  const gunDraw = decisiveDraw(rep, -0.25);
  check('live G: searcaster draw sits between the gun thresholds', gunDraw.armed < gunDraw.draw && gunDraw.draw < rep, 'rep ' + rep + ' armed ' + gunDraw.armed + ' draw ' + gunDraw.draw);
  const drawG = gunDraw.draw;
  delete process.env.M1RANGE;
  giveWeapon('searcaster', 'fusion_cell', 3);
  rec = fight(mdef, drawG);
  check('live G: flag OFF, searcaster draw evades', rec && rec.outcome === 'evade', 'outcome ' + (rec && rec.outcome));
  process.env.M1RANGE = '1';
  giveWeapon('searcaster', 'fusion_cell', 3);
  rec = fight(mdef, drawG);
  check('live G: flag ON, same draw reaches contact', rec && rec.outcome !== 'evade', 'outcome ' + (rec && rec.outcome) + ' rep ' + rep);
  check('live G: searcaster record carries term -0.25', rec && rec.m1rangeTerm === -0.25, 'got ' + (rec && rec.m1rangeTerm));
  // Leg H — the clamp holds at the 0.05 floor: a max-stealth def
  // (ambush, speed 9, notice 9) replicates to a floored 0.05, so
  // the term cannot move it — draw 0.04 evades and 0.06 contacts
  // with the flag on AND off.
  const mdefStealth = weakDef({ behavior: 'ambush', speed: 9, encounter: { noticeRange: 9 }, size: 1 });
  rep = repEvadeP(mdefStealth);
  check('live H: stealth def replicates to the 0.05 floor', rep === 0.05, 'rep ' + rep);
  giveWeapon('crude_bow', 'arrow', 7);
  rec = fight(mdefStealth, 0.04);
  check('live H: flag ON, draw 0.04 evades at the floor', rec && rec.outcome === 'evade', 'outcome ' + (rec && rec.outcome));
  giveWeapon('crude_bow', 'arrow', 7);
  rec = fight(mdefStealth, 0.06);
  check('live H: flag ON, draw 0.06 contacts at the floor', rec && rec.outcome !== 'evade', 'outcome ' + (rec && rec.outcome));
  delete process.env.M1RANGE;
  giveWeapon('crude_bow', 'arrow', 7);
  rec = fight(mdefStealth, 0.04);
  check('live H: flag OFF, draw 0.04 evades at the floor', rec && rec.outcome === 'evade', 'outcome ' + (rec && rec.outcome));
  giveWeapon('crude_bow', 'arrow', 7);
  rec = fight(mdefStealth, 0.06);
  check('live H: flag OFF, draw 0.06 contacts at the floor', rec && rec.outcome !== 'evade', 'outcome ' + (rec && rec.outcome));

  console.log('\nM1RANGE_TEST ' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.log('failures: ' + fails.join('; ')); process.exit(1); }
}

if (require.main === module) {
  main().catch(function (e) { console.error('M1RANGE_TEST FATAL: ' + (e && e.stack || e)); process.exit(1); });
}
