#!/usr/bin/env node
// Proof: dormant motivations wired into objPick (rogue P1, audit Talk 2 P2-2).
//
// Usage:
//   node scripts/test-motivation-wire.js                 # bias checks + wired-goal regression
//   node scripts/test-motivation-wire.js --record-baseline
//       # (PRE-CHANGE code only) writes scripts/test-motivation-wire-baseline.json,
//       # the exact objPick kind sequences for the 7 already-wired goals.
//
// BEFORE/AFTER: the bias assertions (Part A) are RED on pre-change code —
// the 11 dormant goals have no objPick voice there (SEEK never fires, VISIT/
// HAVEN_CHORE/EXPLORE shares don't move with goal) — and GREEN with the
// wiring. Part B (regression) passes on both: the 7 wired goals'
// (feed/escape/lead/explore/prove/heal/protect) objPick sequences are
// byte-identical pre/post, because the wiring adds zero RNG draws and zero
// weight changes on their paths (all edits gated on dormant goal ids).
//
// Method: shared kit (scripts/godpath/lib.js), one seeded game, controlled
// conditions (fed pantry, full cistern, neutral needs, no corpses, no
// build-knowledge seeks), one test villager per channel. The goal is driven
// through the GENERATED goal slot (data.villagers[].goal + bgGoals — the
// same channel npcGoal reads in the live game; unique-person law: no
// fixed-cast scripting, the test only overrides the generated value).
// Profiles are recomputed per goal (agencyState().profiles cleared) so a
// stale cached profile from a previous goal can't leak across runs.
const path = require('path');
const fs = require('fs');
const lib = require('./godpath/lib.js');

const SEED = 20261022;
const PICKS = 600;          // picks per goal for share assertions
const REG_PICKS = 400;      // picks per goal for the regression baseline
const BASELINE = path.join(__dirname, 'test-motivation-wire-baseline.json');

const DORMANT = ['family', 'belong', 'remember', 'joy', 'record', 'understand',
  'answers', 'survive', 'peace', 'alone', 'home', 'legacy'];
const WIRED = ['feed', 'escape', 'lead', 'explore', 'prove', 'heal', 'protect'];

let failures = [];
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures.push(name); }
}

async function setup() {
  const Game = await lib.load({ seed: SEED });
  lib.newRun(Game);
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  Game.stockPantry(20000, 'test'); // FED: forage gate shut, EAT gate needs hunger
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0; // waterDays >> 2
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) {
    const n = Game.npcNeeds(id);
    n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10;
    Game.npcSetNode(id, hx, hy);
    try { Game.npcSetInside(id, true); } catch (e) {}
    v.trust[id] = 50; // objVisitTarget: trusted faces -> VISIT is offered
  }
  return { Game, v, hx, hy, ids };
}

function setGoal(Game, vid, goal) {
  const dv = (Game.data.villagers || []).find(x => x.id === vid);
  if (dv) dv.goal = goal;
  Game.state.village.bgGoals = Game.state.village.bgGoals || {};
  Game.state.village.bgGoals[vid] = goal;
  try { Game.agencyState().profiles = {}; } catch (e) {}
  if (Game.npcGoal(vid) !== goal) throw new Error('goal override failed for ' + vid);
}

// sanity: the lottery — not the early-return paths — is what we're measuring
function assertLotteryClean(Game, vid, hx, hy) {
  let wk = null, hc = null, nt = null;
  try { wk = Game.villagerWantsKnowledge ? Game.villagerWantsKnowledge(vid) : null; } catch (e) {}
  try { hc = Game.mapmemHaulCandidate ? Game.mapmemHaulCandidate(vid, hx, hy) : null; } catch (e) {}
  try { nt = Game.villagerNeedTrack ? Game.villagerNeedTrack(vid) : null; } catch (e) {}
  if (wk || hc || nt) throw new Error(`lottery not clean for ${vid}: wantKnow=${wk} haul=${!!hc} needTrack=${nt}`);
  if (!Game.objVisitTarget(vid)) throw new Error('no VISIT target for ' + vid);
}

function pickKinds(Game, vid, hx, hy, n) {
  const kinds = [];
  const chores = [];
  for (let i = 0; i < n; i++) {
    const o = Game.objOf(vid);
    o.kind = 'idle'; o.state = 'idle';
    Game.objPick(vid, hx, hy);
    kinds.push(o.kind);
    chores.push(o.chore || null);
  }
  return { kinds, chores };
}

function share(kinds, kind) {
  return kinds.filter(k => k === kind).length / kinds.length;
}

async function main() {
  const record = process.argv.includes('--record-baseline');
  const { Game, v, hx, hy, ids } = await setup();

  // test villagers: A = forager (VISIT/SEEK/CHORE channels), B = wanderer/explorer
  setGoal(Game, ids[0], 'home');
  const profOf = {};
  for (const id of ids) profOf[id] = Game.npcRangeProfile(id);
  const vidA = ids.find(id => profOf[id] === 'forager');
  const vidB = ids.find(id => profOf[id] === 'wanderer' || profOf[id] === 'explorer');
  const vidC = ids.find(id => id !== vidA && id !== vidB);
  if (!vidA || !vidB || !vidC) throw new Error('no suitable test villagers');
  assertLotteryClean(Game, vidA, hx, hy);
  assertLotteryClean(Game, vidB, hx, hy);
  assertLotteryClean(Game, vidC, hx, hy);
  console.log(`test villagers: A=${vidA} (forager), B=${vidB} (${profOf[vidB]}), C=${vidC}`);

  // ---------- measurements (identical stream position in record & check modes) ----------
  function measurePartA() {
    const res = {};
    for (const g of DORMANT) {
      const vid = (g === 'survive' || g === 'peace') ? vidB : vidA;
      setGoal(Game, vid, g);
      res[g] = pickKinds(Game, vid, hx, hy, PICKS);
    }
    // caution-channel control: 'family' measured on the SAME wanderer (vidB) —
    // vidA is a forager and never explores, so it can't control EXPLORE; and
    // 'home' itself boosts HAVEN_CHORE, so 'family' (no chore/explore wiring)
    // is the clean control for both channels.
    setGoal(Game, vidB, 'family');
    res['familyB'] = pickKinds(Game, vidB, hx, hy, PICKS);
    // legacy teach-bias: same villager, same knowledge, legacy vs home
    try { Game.vpOf(vidC).knowsSnare = true; } catch (e) {}
    setGoal(Game, vidC, 'legacy');
    res['legacyTeach'] = pickKinds(Game, vidC, hx, hy, PICKS);
    setGoal(Game, vidC, 'home');
    res['homeTeach'] = pickKinds(Game, vidC, hx, hy, PICKS);
    // SEEK well-formedness probe
    setGoal(Game, vidA, 'record');
    let seekO = null;
    for (let i = 0; i < 50 && !seekO; i++) {
      const o = Game.objOf(vidA); o.kind = 'idle'; o.state = 'idle';
      Game.objPick(vidA, hx, hy);
      if (o.kind === 'SEEK') seekO = {
        indoor: o.indoor, state: o.state, purpose: o.purpose,
        partsLeft: o.partsLeft, tightness: o.tightness, targetVid: o.targetVid,
      };
    }
    res['seekO'] = seekO;
    return res;
  }

  function measurePartA2() {
    const m = {};
    for (const id of ids) Game.npcSetNode(id, hx, hy); // everyone home
    setGoal(Game, vidA, 'alone');
    Game.objPick(vidA, hx, hy);
    m.soloAlone = Game.objOf(vidA).solo;
    setGoal(Game, vidA, 'protect');
    Game.objPick(vidA, hx, hy);
    m.soloCtl = Game.objOf(vidA).solo;
    // objAskCompanion: alone villager as the only eligible candidate
    const leader = ids.find(id => id !== vidA && id !== vidC);
    m.leader = leader;
    for (const id of ids) { if (id !== vidA) Game.npcSetNode(id, hx + 1, hy); } // everyone else away
    Game.npcSetNode(vidA, hx, hy); Game.npcSetNode(leader, hx, hy);
    setGoal(Game, vidA, 'alone');
    const ao = Game.objOf(vidA); ao.kind = 'FORAGE'; ao.state = 'ready'; ao.indoor = false;
    m.cidAlone = Game.objAskCompanion(leader, { tx: hx + 1, ty: hy, tightness: 1, partsLeft: 2 }, hx, hy);
    setGoal(Game, vidA, 'protect');
    const ao2 = Game.objOf(vidA); ao2.kind = 'FORAGE'; ao2.state = 'ready'; ao2.indoor = false;
    m.cidCtl = Game.objAskCompanion(leader, { tx: hx + 1, ty: hy, tightness: 1, partsLeft: 2 }, hx, hy);
    // objMaybeDepart on a forced 'ask' verdict
    v.away = v.away || {};
    for (const id of ids) { Game.npcSetNode(id, hx, hy); delete v.away[id]; }
    v.gossip = v.gossip || [];
    const day = Game.state.scholar.day;
    const mate = ids.find(id => id !== vidC && id !== leader);
    m.mate = mate;
    setGoal(Game, mate, 'protect'); // never 'alone' — must be askable in the control
    const pinIndoor = (except) => {
      for (const id of ids) {
        if (except.includes(id)) continue;
        const oo = Game.objOf(id);
        oo.kind = 'HAVEN_CHORE'; oo.state = 'indoor'; oo.indoor = true;
      }
    };
    const readyOutdoor = (id) => {
      const mo = Game.objOf(id);
      mo.kind = 'FORAGE'; mo.state = 'ready'; mo.indoor = false;
      mo.tx = hx + 1; mo.ty = hy; mo.tightness = 1; mo.partsLeft = 3; mo.companion = null;
    };
    const forceAsk = (rid) => {
      // recent attacks until objDanger verdicts 'ask' (1 attack=2; bold/restless temp -1)
      for (let k = 0; k < 3; k++) {
        const ro = Game.objOf(rid);
        ro.kind = 'FORAGE'; ro.state = 'ready'; ro.indoor = false;
        ro.tx = hx + 1; ro.ty = hy; ro.tightness = 1; ro.partsLeft = 3; ro.companion = null;
        const dg = Game.objDanger(rid, ro.tx, ro.ty, hx, hy);
        if (dg.verdict === 'ask') return true;
        v.gossip.push({ action: 'attack', day: day, who: 'probe' });
      }
      return false;
    };
    pinIndoor([vidC, mate]);
    Game.npcSetNode(mate, hx, hy);
    readyOutdoor(mate);
    setGoal(Game, vidC, 'alone');
    Game.objPick(vidC, hx, hy); // sets o.solo
    m.askSoloForced = forceAsk(vidC);
    const roS = Game.objOf(vidC);
    Game.objMaybeDepart(vidC, Game.npcNode(vidC), true, hx, hy);
    m.soloAway = Object.keys(v.away || {});
    m.soloCompanion = roS.companion;
    for (const id of ids) { Game.npcSetNode(id, hx, hy); delete v.away[id]; }
    pinIndoor([vidC, mate]);
    Game.npcSetNode(mate, hx, hy);
    readyOutdoor(mate);
    setGoal(Game, vidC, 'protect');
    Game.objPick(vidC, hx, hy);
    m.askCtlForced = forceAsk(vidC);
    const roC = Game.objOf(vidC);
    Game.objMaybeDepart(vidC, Game.npcNode(vidC), true, hx, hy);
    m.ctlAway = Object.keys(v.away || {});
    m.ctlCompanion = roC.companion;
    return m;
  }

  function measurePartB() {
    const out = {};
    for (const g of WIRED) {
      setGoal(Game, vidA, g);
      out[g] = pickKinds(Game, vidA, hx, hy, REG_PICKS).kinds;
    }
    return out;
  }

  // Part B is measured FIRST: its RNG stream position then depends only on
  // setup (change-independent), never on Part A's dormant-goal behavior —
  // the wiring intentionally changes Part A's draw counts (new kinds picked,
  // legacy teach-bias skips a chore draw), so anything measured after Part A
  // could never be stream-aligned pre/post.
  const partBSeqs = measurePartB();

  if (record) {
    // PRE-CHANGE ONLY: capture the wired goals' exact objPick sequences.
    const out = { seed: SEED, picks: REG_PICKS, goals: partBSeqs };
    fs.writeFileSync(BASELINE, JSON.stringify(out, null, 1));
    console.log('baseline written to', BASELINE);
    return;
  }

  const res = measurePartA();
  const m2 = measurePartA2();

  // ---------- Part A: dormant-goal bias ----------
  console.log('Part A: dormant-goal bias (RED pre-change, GREEN post-change)');
  const S = (g, k) => share(res[g].kinds, k);

  // VISIT channel: family/belong/remember/joy up; alone down. Control: home (no VISIT wiring).
  check('family seeks people out (VISIT up)', S('family', 'VISIT') > S('home', 'VISIT') + 0.15,
    `family=${S('family', 'VISIT').toFixed(2)} home=${S('home', 'VISIT').toFixed(2)}`);
  check('belong is social (VISIT up)', S('belong', 'VISIT') > S('home', 'VISIT') + 0.08,
    `belong=${S('belong', 'VISIT').toFixed(2)} home=${S('home', 'VISIT').toFixed(2)}`);
  check('remember keeps stories (VISIT up)', S('remember', 'VISIT') > S('home', 'VISIT') + 0.08,
    `remember=${S('remember', 'VISIT').toFixed(2)} home=${S('home', 'VISIT').toFixed(2)}`);
  check('joy seeks company (VISIT up)', S('joy', 'VISIT') > S('home', 'VISIT') + 0.05,
    `joy=${S('joy', 'VISIT').toFixed(2)} home=${S('home', 'VISIT').toFixed(2)}`);
  check('alone deprioritizes company (VISIT down)', S('alone', 'VISIT') < S('home', 'VISIT'),
    `alone=${S('alone', 'VISIT').toFixed(2)} home=${S('home', 'VISIT').toFixed(2)}`);

  // SEEK channel: record/understand/answers go learn. Control home: SEEK share is exactly 0.
  for (const g of ['record', 'understand', 'answers']) {
    check(`${g} seeks knowledge (SEEK fires)`, S(g, 'SEEK') > 0.15 && S('home', 'SEEK') === 0,
      `${g}=${S(g, 'SEEK').toFixed(2)} home=${S('home', 'SEEK').toFixed(2)}`);
  }
  // SEEK objectives are well-formed: indoor, short clock, a real target slot
  const seekO = res['seekO'];
  check('SEEK objective is indoor with a short clock',
    !!seekO && seekO.indoor === true && seekO.state === 'indoor' && seekO.purpose === 'seek'
    && seekO.partsLeft === 2 && seekO.tightness === 0,
    seekO ? `indoor=${seekO.indoor} partsLeft=${seekO.partsLeft} targetVid=${seekO.targetVid}` : 'never picked');

  // Caution channel: survive/peace avoid EXPLORE, stay near the fire.
  // Control familyB: 'family' on the same wanderer (no explore/chore wiring).
  check('survive is cautious (EXPLORE down)', S('survive', 'EXPLORE') < S('familyB', 'EXPLORE') * 0.7,
    `survive=${S('survive', 'EXPLORE').toFixed(2)} familyB=${S('familyB', 'EXPLORE').toFixed(2)}`);
  check('peace avoids the wild (EXPLORE down)', S('peace', 'EXPLORE') < S('familyB', 'EXPLORE') * 0.7,
    `peace=${S('peace', 'EXPLORE').toFixed(2)} familyB=${S('familyB', 'EXPLORE').toFixed(2)}`);
  check('survive stays near the fire (HAVEN_CHORE up)', S('survive', 'HAVEN_CHORE') > S('familyB', 'HAVEN_CHORE') + 0.10,
    `survive=${S('survive', 'HAVEN_CHORE').toFixed(2)} familyB=${S('familyB', 'HAVEN_CHORE').toFixed(2)}`);
  check('peace keeps hall life (HAVEN_CHORE up)', S('peace', 'HAVEN_CHORE') > S('familyB', 'HAVEN_CHORE') + 0.08,
    `peace=${S('peace', 'HAVEN_CHORE').toFixed(2)} familyB=${S('familyB', 'HAVEN_CHORE').toFixed(2)}`);

  // Hearth channel: home/legacy/belong lean into hall life. Control: family (no chore wiring).
  check('home tends the hall (HAVEN_CHORE up)', S('home', 'HAVEN_CHORE') > S('family', 'HAVEN_CHORE') + 0.08,
    `home=${S('home', 'HAVEN_CHORE').toFixed(2)} family=${S('family', 'HAVEN_CHORE').toFixed(2)}`);
  check('legacy works the hall (HAVEN_CHORE up)', S('legacy', 'HAVEN_CHORE') > S('family', 'HAVEN_CHORE') + 0.05,
    `legacy=${S('legacy', 'HAVEN_CHORE').toFixed(2)} family=${S('family', 'HAVEN_CHORE').toFixed(2)}`);
  check('belong keeps hall life (HAVEN_CHORE up)', S('belong', 'HAVEN_CHORE') > S('family', 'HAVEN_CHORE') + 0.03,
    `belong=${S('belong', 'HAVEN_CHORE').toFixed(2)} family=${S('family', 'HAVEN_CHORE').toFixed(2)}`);

  // legacy teach-bias: a legacy villager who CAN teach, teaches — every time.
  const leg = res['legacyTeach'];
  const legChores = leg.chores.filter((c, i) => leg.kinds[i] === 'HAVEN_CHORE');
  check('legacy teaches when they can (chore=teach)', legChores.length > 0 && legChores.every(c => c === 'teach'),
    `${legChores.filter(c => c === 'teach').length}/${legChores.length} teach`);
  const hom = res['homeTeach']; // control: same villager, same knowledge, no legacy drive
  const homChores = hom.chores.filter((c, i) => hom.kinds[i] === 'HAVEN_CHORE');
  check('non-legacy chore choice is not forced teach', homChores.length > 0 && homChores.some(c => c !== 'teach'),
    `teach share=${(homChores.filter(c => c === 'teach').length / homChores.length).toFixed(2)}`);

  // ---------- alone companion mechanics ----------
  console.log('Part A2: alone deprioritizes companions');
  check("alone sets o.solo", m2.soloAlone === true, `solo=${m2.soloAlone}`);
  check("non-alone leaves o.solo false", m2.soloCtl !== true, `solo=${m2.soloCtl}`);
  check("alone villager is never asked as companion", m2.cidAlone === null, `cid=${m2.cidAlone}`);
  check("non-alone villager can be asked as companion", m2.cidCtl === vidA, `cid=${m2.cidCtl}`);
  if (!m2.askSoloForced) throw new Error('could not force ask verdict (solo)');
  check("solo villager departs without a companion on 'ask'",
    m2.soloAway.includes(vidC) && m2.soloCompanion == null && !m2.soloAway.includes(m2.mate),
    `away=[${m2.soloAway}] companion=${m2.soloCompanion}`);
  if (!m2.askCtlForced) throw new Error('could not force ask verdict (control)');
  check("non-solo villager brings a companion on 'ask'",
    m2.ctlAway.includes(vidC) && m2.ctlCompanion === m2.mate && m2.ctlAway.includes(m2.mate),
    `away=[${m2.ctlAway}] companion=${m2.ctlCompanion}`);

  // ---------- Part B: no-regression on the 7 wired goals ----------
  console.log('Part B: wired-goal regression (must match the pre-change baseline exactly)');
  let base = null;
  try { base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')); }
  catch (e) { check('baseline present (record with --record-baseline on pre-change code)', false, BASELINE); }
  if (base) {
    if (base.seed !== SEED || base.picks !== REG_PICKS || WIRED.some(g => !base.goals[g])) {
      check('baseline params match', false, `seed=${base.seed} picks=${base.picks}`);
    } else {
      for (const g of WIRED) {
        const now = partBSeqs[g];
        const same = now.length === base.goals[g].length && now.every((k, i) => k === base.goals[g][i]);
        check(`wired goal '${g}' unchanged`, same,
          same ? `${now.length} picks identical` : `first diff at pick ${now.findIndex((k, i) => k !== base.goals[g][i])}`);
      }
    }
  }

  console.log(failures.length ? `\nRESULT: FAIL (${failures.length})` : '\nRESULT: PASS');
  process.exit(failures.length ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
