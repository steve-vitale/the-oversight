#!/usr/bin/env node
// scripts/test-ammo-a.js — proof test, arm sim-ammo-a (finding #2590,
// serve half, ammo first: the served bow departs with pocket ammo).
//
// Proves the AMMO served-bow quiver rate in villagerPocketAmmo step 3
// (game.js): at the departure arrow/bolt craft attempt, a carrier
// whose bow was staged THIS departure (served — bowOpenByVid day ===
// today, source crafted/fromStash/fromArmory) faces 60% on the first
// make instead of the blind 35%; the learned 85% for a carrier who
// has actually made arrows (lv >= 2) is untouched, and everyone else
// (alreadyHad bows, non-served carriers) keeps the blind rate. The
// rate is a threshold swap on the SAME single Math.random() draw —
// zero new draws. The duty is called DIRECTLY on a staged village
// (the proof-lootabilities-w3 pattern): the bow is served for real
// via villagerStageBow first (DEPMAT + ROLL35 substrate), then
// villagerPocketAmmo is called with Math.random stubbed around it
// so the craft succeeds or fails deterministically, and restored
// right after.
//
// Usage: node scripts/test-ammo-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
process.env.DAYS = '5';
process.env.SENSEEXPED = '1';
process.env.BOWOPEN = '1';
process.env.SPEARGATE = '1';
process.env.DEPMAT = '1';
process.env.ROLL35 = '1';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  // ---- 1. Static wiring ----
  const game = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('AMMO env gate read in villagerPocketAmmo', /process\.env\.AMMO === '1'/.test(game));
  check('quiver block present (AMMO marker + 0.60 first-make rate)', /AMMO \(sim-ammo-a/.test(game) && /0\.60/.test(game));
  check('quiver block scopes to served bows (bowOpenByVid day + source read)', /bowOpenByVid/.test(game) && /rec\.source === 'crafted'/.test(game));
  check('pocket anchor preserved (const rate = level >= 2 ? 0.85 : 0.35)', /const rate = level >= 2 \? 0\.85 : 0\.35;/.test(game));
  // The quiver block (AMMO marker -> the success draw) must add no
  // draw of its own: the rate is a threshold swap on the one draw
  // the craft already makes. Strip full-line // comments first: the
  // block's own comment names the draw ("same single draw"), which
  // is prose, not a draw.
  const quiverBlock = (game.split('AMMO (sim-ammo-a')[1] || '').split('const success = Math.random()')[0];
  const quiverCode = quiverBlock.split('\n').filter(function (ln) { return ln.trim().indexOf('//') !== 0; }).join('\n');
  check('quiver block draws no Math.random (threshold swap only)', quiverCode.indexOf('Math.random') === -1, quiverCode.slice(0, 200));

  // ---- 2. Staged village (seed 31031, same pattern as test-roll35-a.js) ----
  const g2 = await loadGame({ seed: 31031, mode: 'ammo-stage' });
  const G = g2.Game;
  check('villagerPocketAmmo callable', typeof G.villagerPocketAmmo === 'function');
  check('villagerStageBow callable', typeof G.villagerStageBow === 'function');
  if (typeof G.villagerPocketAmmo !== 'function' || typeof G.villagerStageBow !== 'function') { console.log('AMMO_FAILS ' + failed); process.exit(1); }
  const teleEvents = [];
  const origTele = G.tele;
  G.tele = function (t, d) { try { teleEvents.push({ t: t, d: d }); } catch (e) {} return origTele.apply(this, arguments); };
  const sayLines = [];
  const origSay = G.say;
  G.say = function () { try { sayLines.push(String(arguments[0] || '')); } catch (e) {} return origSay.apply(this, arguments); };
  await quietLog(async () => { await setupGame(G); });
  const v = G.state.village || {};
  const vessel = G.villagerId;
  const others = (v.roster || []).filter(function (id) { return id !== vessel; });
  check('roster has >=4 non-vessel villagers', others.length >= 4, others);
  const learner = others[0];
  const person = function (vid) { return G.getPerson(vid); };
  const EQ = (globalThis.Scattering || {}).equipment;
  const resetVillager = function (vid) {
    const p = person(vid);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[vid];
    return p;
  };
  const setPile = function (mats) {
    const st = G.stashState();
    for (const m of ['wood', 'branch', 'stone', 'fiber', 'stick', 'vine', 'bark']) st.materials[m] = 0;
    Object.assign(st.materials, mats);
    try { st.weapons = []; } catch (e) {}
    return st.materials;
  };
  const pileOf = function () { const st = G.stashState(); return { stick: st.materials.stick || 0, stone: st.materials.stone || 0, fiber: st.materials.fiber || 0 }; };
  const equippedId = function (vid, slot) { const e = (person(vid).equipped || {})[slot]; return e ? (e.itemId || e.id || null) : null; };
  const arrowsCarried = function (vid) {
    let n = 0;
    for (const e of (person(vid).items || [])) {
      const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
      if (eid === 'arrow') n += (typeof e === 'string') ? 1 : (e.units || 1);
    }
    return n;
  };
  const setAmmo = function (on) { if (on) process.env.AMMO = '1'; else delete process.env.AMMO; };
  const setDepmat = function (on) { if (on) process.env.DEPMAT = '1'; else delete process.env.DEPMAT; };
  const setRoll35 = function (on) { if (on) process.env.ROLL35 = '1'; else delete process.env.ROLL35; };
  // serveBow(roll): reset the learner to a spear-holder knowing
  // crude_bow lv 1, empty pile, and serve a bow for real via
  // villagerStageBow with Math.random stubbed to `roll`. Returns
  // the staging return (the bow must be seated in the ranged slot
  // for the pocket step to see a served bow).
  const serveBow = function (roll) {
    resetVillager(learner);
    v.weaponCraft = {};
    v.weaponCraft[learner] = { crude_bow: 1 };
    v.ammoCraft = {};
    v.bowOpen = {}; v.bowOpenByVid = {};
    const lp = person(learner);
    lp.items = ['hunting_spear'];
    if (EQ) EQ.autoEquip(lp, G.data.items);
    setPile({});
    const origRandom = Math.random;
    try {
      Math.random = function () { return roll; };
      const out = G.villagerStageBow(learner);
      return out;
    } finally { Math.random = origRandom; }
  };
  // pocket(roll): run villagerPocketAmmo on the learner with
  // Math.random stubbed to `roll`, return the draws consumed (the
  // counting wrapper proves draw-neutrality) + the return object +
  // arrows carried after.
  const pocket = function (roll) {
    let draws = 0;
    const origRandom = Math.random;
    try {
      Math.random = function () { draws++; return roll; };
      const out = G.villagerPocketAmmo(learner);
      return { out: out, draws: draws, carried: arrowsCarried(learner) };
    } finally { Math.random = origRandom; }
  };
  const servedRec = function () { return ((v.bowOpenByVid || {})[learner] || null); };
  if (G.map) { G.map.px = v.px != null ? v.px : 4; G.map.py = v.py != null ? v.py : 4; }

  // M1: AMMO OFF — served bow, stocked pile, roll 0.50: the blind
  // 35% fails (old behavior — the control).
  console.log('\n=== M1: flag off — served bow, roll 0.50 fails the blind 35% (old behavior) ===');
  setDepmat(true); setRoll35(true); setAmmo(false);
  const s1 = serveBow(0.01);
  console.log('served: source=' + (servedRec() && servedRec().source) + ' ranged=' + equippedId(learner, 'ranged'));
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m1 = pocket(0.50);
  console.log('after: carried=' + m1.carried + ' draws=' + m1.draws + ' ammoRate=' + m1.out.ammoRate + ' ammoServed=' + m1.out.ammoServed + ' pile=' + JSON.stringify(pileOf()));
  check('M1 staging served a crude bow (prerequisite)', s1.staged === true && equippedId(learner, 'ranged') === 'crude_bow', JSON.stringify(s1) + ' ' + equippedId(learner, 'ranged'));
  check('M1 flag off: no arrows pocketed (0.50 >= 0.35)', m1.carried === 0, 'carried=' + m1.carried);
  check('M1 flag off: the craft ran and failed (crafted 1, ok false)', m1.out.crafted === 1 && m1.out.craftedOk === false, JSON.stringify(m1.out));
  check('M1 flag off: return carries the blind rate 0.35', m1.out.ammoRate === 0.35, JSON.stringify(m1.out));
  check('M1 flag off: the served rate did not fire (ammoServed false)', m1.out.ammoServed === false, JSON.stringify(m1.out));
  check('M1 flag off: exactly one craft draw', m1.draws === 1, 'draws=' + m1.draws);
  const offRecord = JSON.stringify(v.ammoCraft);

  // M2: AMMO ON — same setup, roll 0.50: the learned 60% serves.
  console.log('\n=== M2: flag on — served bow, roll 0.50 succeeds at the learned 60% ===');
  setDepmat(true); setRoll35(true); setAmmo(true);
  const s2 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m2 = pocket(0.50);
  console.log('after: carried=' + m2.carried + ' draws=' + m2.draws + ' ammoRate=' + m2.out.ammoRate + ' ammoServed=' + m2.out.ammoServed + ' pile=' + JSON.stringify(pileOf()));
  check('M2 flag on: staging served a crude bow again (prerequisite)', s2.staged === true && equippedId(learner, 'ranged') === 'crude_bow', JSON.stringify(s2));
  check('M2 flag on: 5 arrows pocketed (0.50 < 0.60, one batch)', m2.carried === 5, 'carried=' + m2.carried);
  check('M2 flag on: the craft ran and succeeded', m2.out.crafted === 1 && m2.out.craftedOk === true, JSON.stringify(m2.out));
  check('M2 flag on: return carries ammoRate 0.60', m2.out.ammoRate === 0.60, JSON.stringify(m2.out));
  check('M2 flag on: the served rate fired (ammoServed true)', m2.out.ammoServed === true, JSON.stringify(m2.out));
  check('M2 flag on: exactly one craft draw (same as flag-off)', m2.draws === 1 && m2.draws === m1.draws, 'draws=' + m2.draws);
  check('M2 flag on: the pile spent exactly the recipe (stick 0, stone 0, fiber 0)', pileOf().stick === 0 && pileOf().stone === 0 && pileOf().fiber === 0, JSON.stringify(pileOf()));

  // M3: AMMO OFF, repeat — byte-identical to M1 (the (g) control).
  console.log('\n=== M3: flag off repeat — byte-identical to M1 ===');
  setDepmat(true); setRoll35(true); setAmmo(false);
  const s3 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m3 = pocket(0.50);
  check('M3 flag-off repeat: staging served a crude bow again', s3.staged === true, JSON.stringify(s3));
  check('M3 flag-off repeat: ammoCraft record identical to M1', JSON.stringify(v.ammoCraft) === offRecord, JSON.stringify(v.ammoCraft) + ' vs ' + offRecord);
  check('M3 flag-off repeat: no arrows pocketed again', m3.carried === 0, 'carried=' + m3.carried);
  check('M3 flag-off repeat: return carries the blind rate 0.35', m3.out.ammoRate === 0.35, JSON.stringify(m3.out));

  // M4: AMMO ON, NON-served bow-holder (alreadyHad bow, never
  // staged this departure), roll 0.50: the scoping — the blind
  // 35% still fails.
  console.log('\n=== M4: flag on, alreadyHad bow — the scoping: blind 35% still fails ===');
  setDepmat(true); setRoll35(true); setAmmo(true);
  resetVillager(learner);
  v.weaponCraft = {}; v.ammoCraft = {}; v.bowOpen = {}; v.bowOpenByVid = {};
  const lp4 = person(learner);
  lp4.items = [{ itemId: 'crude_bow' }];
  if (EQ) EQ.autoEquip(lp4, G.data.items);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m4 = pocket(0.50);
  console.log('after: ranged=' + equippedId(learner, 'ranged') + ' carried=' + m4.carried + ' draws=' + m4.draws + ' ammoRate=' + m4.out.ammoRate + ' ammoServed=' + m4.out.ammoServed);
  check('M4 non-served: the crude bow is seated in the ranged slot', equippedId(learner, 'ranged') === 'crude_bow', equippedId(learner, 'ranged'));
  check('M4 non-served: no staging record this departure (never served)', servedRec() === null, JSON.stringify(servedRec()));
  check('M4 non-served: no arrows pocketed (0.50 >= 0.35)', m4.carried === 0, 'carried=' + m4.carried);
  check('M4 non-served: return carries the blind rate 0.35', m4.out.ammoRate === 0.35, JSON.stringify(m4.out));
  check('M4 non-served: the served rate did not fire (ammoServed false)', m4.out.ammoServed === false, JSON.stringify(m4.out));
  check('M4 non-served: exactly one craft draw', m4.draws === 1, 'draws=' + m4.draws);

  // M5: AMMO ON, served carrier at lv[arrow]=2, roll 0.80: the
  // learned 85% is untouched — the roll succeeds.
  console.log('\n=== M5: flag on, served, lv[arrow]=2, roll 0.80 — the learned 85% is untouched ===');
  setDepmat(true); setRoll35(true); setAmmo(true);
  const s5 = serveBow(0.01);
  v.ammoCraft[learner] = { arrow: 2 };
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m5 = pocket(0.80);
  console.log('after: carried=' + m5.carried + ' draws=' + m5.draws + ' ammoRate=' + m5.out.ammoRate + ' ammoServed=' + m5.out.ammoServed);
  check('M5 learned rate: staging served a crude bow (prerequisite)', s5.staged === true, JSON.stringify(s5));
  check('M5 learned rate: roll 0.80 succeeds at 85% (would fail the blind 35% and the 60%)', m5.carried === 5, 'carried=' + m5.carried);
  check('M5 learned rate: return carries ammoRate 0.85', m5.out.ammoRate === 0.85, JSON.stringify(m5.out));
  check('M5 learned rate: the served rate fired (ammoServed true)', m5.out.ammoServed === true, JSON.stringify(m5.out));
  check('M5 learned rate: exactly one craft draw', m5.draws === 1, 'draws=' + m5.draws);

  // M6: AMMO ON, served carrier, roll 0.99 — fails even the
  // learned rate; the pile is never driven negative.
  console.log('\n=== M6: flag on, served, roll 0.99 — fails the learned 60%, pile never negative ===');
  setDepmat(true); setRoll35(true); setAmmo(true);
  const s6 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m6 = pocket(0.99);
  console.log('after: carried=' + m6.carried + ' draws=' + m6.draws + ' ammoRate=' + m6.out.ammoRate + ' pile=' + JSON.stringify(pileOf()));
  check('M6 failing roll: staging served a crude bow (prerequisite)', s6.staged === true, JSON.stringify(s6));
  check('M6 failing roll: no arrows pocketed', m6.carried === 0, 'carried=' + m6.carried);
  check('M6 failing roll: return carries ammoRate 0.60', m6.out.ammoRate === 0.60, JSON.stringify(m6.out));
  check('M6 failing roll: pile never driven negative', pileOf().stick >= 0 && pileOf().stone >= 0 && pileOf().fiber >= 0, JSON.stringify(pileOf()));
  check('M6 failing roll: exactly one craft draw', m6.draws === 1, 'draws=' + m6.draws);

  // M7: AMMO ON, served carrier, pile WITHOUT fiber — no craft
  // attempt runs; the flag conjures nothing.
  console.log('\n=== M7: flag on, served, pile lacks fiber — no craft attempt, nothing conjured ===');
  setDepmat(true); setRoll35(true); setAmmo(true);
  const s7 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 0 });
  const m7 = pocket(0.01);
  console.log('after: carried=' + m7.carried + ' draws=' + m7.draws + ' ammoRate=' + m7.out.ammoRate + ' ammoServed=' + m7.out.ammoServed + ' pile=' + JSON.stringify(pileOf()));
  check('M7 no materials: staging served a crude bow (prerequisite)', s7.staged === true, JSON.stringify(s7));
  check('M7 no materials: no arrows pocketed', m7.carried === 0, 'carried=' + m7.carried);
  check('M7 no materials: no craft attempt ran (crafted 0)', m7.out.crafted === 0, JSON.stringify(m7.out));
  check('M7 no materials: ZERO Math.random draws (no attempt, no roll)', m7.draws === 0, 'draws=' + m7.draws);
  check('M7 no materials: the served rate did not fire (no attempt to rate)', m7.out.ammoServed === false || m7.out.ammoServed == null, JSON.stringify(m7.out));
  check('M7 no materials: pile untouched (stick 2, stone 1, fiber 0)', pileOf().stick === 2 && pileOf().stone === 1 && pileOf().fiber === 0, JSON.stringify(pileOf()));

  // M8: AMMO ON, sling carrier (ammo stone, no pile recipe) —
  // the stone path is untouched by the flag: stones pocketed from
  // the pile, no craft attempt, no served rate.
  console.log('\n=== M8: flag on, sling carrier — the stone path is untouched ===');
  setDepmat(true); setRoll35(true); setAmmo(true);
  resetVillager(learner);
  v.weaponCraft = {}; v.ammoCraft = {}; v.bowOpen = {}; v.bowOpenByVid = {};
  const lp8 = person(learner);
  lp8.items = [{ itemId: 'sling' }];
  if (EQ) EQ.autoEquip(lp8, G.data.items);
  setPile({ stick: 0, stone: 4, fiber: 0 });
  const m8 = pocket(0.01);
  let stonesCarried = 0;
  for (const e of (person(learner).items || [])) {
    const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (eid === 'stone') stonesCarried += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  console.log('after: ranged=' + equippedId(learner, 'ranged') + ' stones=' + stonesCarried + ' draws=' + m8.draws + ' ammoServed=' + m8.out.ammoServed);
  check('M8 sling: the sling is seated in the ranged slot', equippedId(learner, 'ranged') === 'sling', equippedId(learner, 'ranged'));
  check('M8 sling: 4 stones pocketed from the pile', stonesCarried === 4, 'stones=' + stonesCarried);
  check('M8 sling: no craft attempt ran (crafted 0)', m8.out.crafted === 0, JSON.stringify(m8.out));
  check('M8 sling: the served rate did not fire', m8.out.ammoServed === false || m8.out.ammoServed == null, JSON.stringify(m8.out));
  check('M8 sling: ZERO Math.random draws', m8.draws === 0, 'draws=' + m8.draws);

  console.log('\nAMMO ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — FAILS: ' + fails.join('; ') : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
