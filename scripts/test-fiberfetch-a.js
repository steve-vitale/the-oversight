#!/usr/bin/env node
// scripts/test-fiberfetch-a.js — proof test, arm sim-fiberfetch-a
// (finding #2590, serve half: the trailhead fiber fetch).
//
// Proves the FIBERFETCH rule in villagerPocketAmmo step 3
// (game.js): at the departure arrow-craft attempt for a SERVED
// bow (bow staged THIS departure — bowOpenByVid day === today,
// source crafted/fromStash/fromArmory), when the pile is short
// on fiber and fiber ALONE, the crafter gathers the missing
// fiber from the brush at the departure site and the attempt
// proceeds. The fetched fiber is consumed by the attempt exactly
// like pile fiber — never added to the pile, lost on a failed
// roll. The fetch performs no Math.random draw of its own. It
// never fires at the bow craft, never for a non-served departure,
// never when another material is short too, and never for the
// sling/stone path. The fetch is independent of the AMMO rate:
// it is a supply mechanism, not a rate mechanism (F10 pins this).
// The duty is called DIRECTLY on a staged village (the
// proof-lootabilities-w3 pattern): the bow is served for real
// via villagerStageBow first (DEPMAT + ROLL35 substrate), then
// villagerPocketAmmo is called with Math.random stubbed around it
// so the craft succeeds or fails deterministically, and restored
// right after.
//
// Usage: node scripts/test-fiberfetch-a.js
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
process.env.AMMO = '1';
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
  check('FIBERFETCH env gate read in villagerPocketAmmo', /process\.env\.FIBERFETCH === '1'/.test(game));
  check('fetch block present (FIBERFETCH marker + ammo_fetch_site telemetry)', /FIBERFETCH \(sim-fiberfetch-a/.test(game) && /ammo_fetch_site/.test(game));
  check('fetch block scopes to served bows (servedBow read)', /servedBow/.test(game) && /bowOpenByVid/.test(game));
  check('fetch block scopes to the arrow craft (fiber shortfall only)', /ammoId === 'arrow'/.test(game) && /m === 'fiber'/.test(game));
  check('pocket anchor preserved (const rate = level >= 2 ? 0.85 : 0.35)', /const rate = level >= 2 \? 0\.85 : 0\.35;/.test(game));
  // The fetch block (FIBERFETCH marker -> the success draw) must
  // add no draw of its own: the fetch is deterministic — the craft
  // still consumes exactly one draw per attempt. Strip full-line //
  // comments first: the block's own comment names the draw ("no
  // draw of its own"), which is prose, not a draw.
  const fetchBlock = (game.split('FIBERFETCH (sim-fiberfetch-a')[1] || '').split('const success = Math.random()')[0];
  const fetchCode = fetchBlock.split('\n').filter(function (ln) { return ln.trim().indexOf('//') !== 0; }).join('\n');
  check('fetch block draws no Math.random (deterministic gather only)', fetchCode.indexOf('Math.random') === -1, fetchCode.slice(0, 200));

  // ---- 2. Staged village (seed 31031, same pattern as test-ammo-a.js) ----
  const g2 = await loadGame({ seed: 31031, mode: 'fiberfetch-stage' });
  const G = g2.Game;
  check('villagerPocketAmmo callable', typeof G.villagerPocketAmmo === 'function');
  check('villagerStageBow callable', typeof G.villagerStageBow === 'function');
  if (typeof G.villagerPocketAmmo !== 'function' || typeof G.villagerStageBow !== 'function') { console.log('FIBERFETCH_FAILS ' + failed); process.exit(1); }
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
  const setFiberfetch = function (on) { if (on) process.env.FIBERFETCH = '1'; else delete process.env.FIBERFETCH; };
  const setAmmo = function (on) { if (on) process.env.AMMO = '1'; else delete process.env.AMMO; };
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
  const fetchTeleFor = function (vid) { return teleEvents.filter(function (e) { return e.t === 'ammo_fetch_site' && e.d && e.d.vid === vid; }); };
  if (G.map) { G.map.px = v.px != null ? v.px : 4; G.map.py = v.py != null ? v.py : 4; }

  // F1: FIBERFETCH OFF — served bow, pile fiber 0, roll 0.01: no
  // craft attempt runs (old behavior — the control).
  console.log('\n=== F1: flag off — served bow, pile fiber 0: no attempt (old behavior) ===');
  setFiberfetch(false); setAmmo(true);
  const s1 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 0 });
  teleEvents.length = 0; sayLines.length = 0;
  const m1 = pocket(0.01);
  console.log('after: carried=' + m1.carried + ' draws=' + m1.draws + ' fiberFetch=' + m1.out.fiberFetch + ' pile=' + JSON.stringify(pileOf()));
  check('F1 staging served a crude bow (prerequisite)', s1.staged === true && equippedId(learner, 'ranged') === 'crude_bow', JSON.stringify(s1) + ' ' + equippedId(learner, 'ranged'));
  check('F1 flag off: no arrows pocketed (no attempt ran)', m1.carried === 0, 'carried=' + m1.carried);
  check('F1 flag off: no craft attempt ran (crafted 0)', m1.out.crafted === 0, JSON.stringify(m1.out));
  check('F1 flag off: no fetch on the return', !m1.out.fiberFetch, JSON.stringify(m1.out));
  check('F1 flag off: ZERO Math.random draws (no attempt, no roll)', m1.draws === 0, 'draws=' + m1.draws);
  check('F1 flag off: no fetch telemetry', fetchTeleFor(learner).length === 0, JSON.stringify(fetchTeleFor(learner)));
  check('F1 flag off: pile untouched (stick 2, stone 1, fiber 0)', pileOf().stick === 2 && pileOf().stone === 1 && pileOf().fiber === 0, JSON.stringify(pileOf()));
  const offRecord = JSON.stringify(v.ammoCraft);

  // F2: FIBERFETCH ON — same setup, roll 0.50: the fetch gathers
  // the fiber and the served 60% rate crafts 5 arrows.
  console.log('\n=== F2: flag on — served bow, pile fiber 0, roll 0.50: fetch serves ===');
  setFiberfetch(true); setAmmo(true);
  const s2 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 0 });
  teleEvents.length = 0; sayLines.length = 0;
  const m2 = pocket(0.50);
  console.log('after: carried=' + m2.carried + ' draws=' + m2.draws + ' fiberFetch=' + m2.out.fiberFetch + ' fiberSite=' + m2.out.fiberSite + ' ammoRate=' + m2.out.ammoRate + ' pile=' + JSON.stringify(pileOf()));
  check('F2 flag on: staging served a crude bow again (prerequisite)', s2.staged === true && equippedId(learner, 'ranged') === 'crude_bow', JSON.stringify(s2));
  check('F2 flag on: 5 arrows pocketed (0.50 < 0.60, one batch)', m2.carried === 5, 'carried=' + m2.carried);
  check('F2 flag on: the craft ran and succeeded', m2.out.crafted === 1 && m2.out.craftedOk === true, JSON.stringify(m2.out));
  check('F2 flag on: return carries fiberFetch + fiberSite 1', m2.out.fiberFetch === true && m2.out.fiberSite === 1, JSON.stringify(m2.out));
  check('F2 flag on: return carries the served rate 0.60', m2.out.ammoRate === 0.60 && m2.out.ammoServed === true, JSON.stringify(m2.out));
  check('F2 flag on: fetch telemetry names learner + arrow + fiber', fetchTeleFor(learner).length === 1 && fetchTeleFor(learner)[0].d.item === 'arrow' && fetchTeleFor(learner)[0].d.mats[0] === 'fiber', JSON.stringify(fetchTeleFor(learner)));
  check('F2 flag on: the gathering is witnessed aloud at home', sayLines.some(function (s) { return /strips a length of plant fiber/.test(s); }), JSON.stringify(sayLines));
  check('F2 flag on: pile fiber stays 0 (the fetch never adds to the pile)', pileOf().fiber === 0, JSON.stringify(pileOf()));
  check('F2 flag on: pile spent exactly stick 2 + stone 1', pileOf().stick === 0 && pileOf().stone === 0, JSON.stringify(pileOf()));
  check('F2 flag on: exactly one craft draw (the fetch drew none)', m2.draws === 1, 'draws=' + m2.draws);

  // F3: FIBERFETCH OFF, repeat — byte-identical to F1 (the control).
  console.log('\n=== F3: flag off repeat — byte-identical to F1 ===');
  setFiberfetch(false); setAmmo(true);
  const s3 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 0 });
  teleEvents.length = 0; sayLines.length = 0;
  const m3 = pocket(0.01);
  check('F3 flag-off repeat: staging served a crude bow again', s3.staged === true, JSON.stringify(s3));
  check('F3 flag-off repeat: ammoCraft record identical to F1', JSON.stringify(v.ammoCraft) === offRecord, JSON.stringify(v.ammoCraft) + ' vs ' + offRecord);
  check('F3 flag-off repeat: no arrows pocketed again', m3.carried === 0, 'carried=' + m3.carried);
  check('F3 flag-off repeat: no fetch on the return', !m3.out.fiberFetch, JSON.stringify(m3.out));
  check('F3 flag-off repeat: ZERO Math.random draws', m3.draws === 0, 'draws=' + m3.draws);

  // F4: FIBERFETCH ON, NON-served bow-holder (alreadyHad bow, never
  // staged this departure), pile fiber 0: the scoping — no fetch.
  console.log('\n=== F4: flag on, alreadyHad bow — the scoping: no fetch ===');
  setFiberfetch(true); setAmmo(true);
  resetVillager(learner);
  v.weaponCraft = {}; v.ammoCraft = {}; v.bowOpen = {}; v.bowOpenByVid = {};
  const lp4 = person(learner);
  lp4.items = [{ itemId: 'crude_bow' }];
  if (EQ) EQ.autoEquip(lp4, G.data.items);
  setPile({ stick: 2, stone: 1, fiber: 0 });
  teleEvents.length = 0;
  const m4 = pocket(0.01);
  console.log('after: ranged=' + equippedId(learner, 'ranged') + ' carried=' + m4.carried + ' draws=' + m4.draws + ' fiberFetch=' + m4.out.fiberFetch);
  check('F4 non-served: the crude bow is seated in the ranged slot', equippedId(learner, 'ranged') === 'crude_bow', equippedId(learner, 'ranged'));
  check('F4 non-served: no staging record this departure (never served)', servedRec() === null, JSON.stringify(servedRec()));
  check('F4 non-served: no arrows pocketed (no attempt ran)', m4.carried === 0, 'carried=' + m4.carried);
  check('F4 non-served: no fetch on the return', !m4.out.fiberFetch, JSON.stringify(m4.out));
  check('F4 non-served: no fetch telemetry', fetchTeleFor(learner).length === 0, JSON.stringify(fetchTeleFor(learner)));
  check('F4 non-served: ZERO Math.random draws', m4.draws === 0, 'draws=' + m4.draws);

  // F5: FIBERFETCH ON, served, pile short on stick AND fiber: the
  // fetch fires only when fiber is the SOLE shortfall — no fetch.
  console.log('\n=== F5: flag on, served, stick + fiber short — fiber is not the sole shortfall: no fetch ===');
  setFiberfetch(true); setAmmo(true);
  const s5 = serveBow(0.01);
  setPile({ stick: 0, stone: 1, fiber: 0 });
  teleEvents.length = 0;
  const m5 = pocket(0.01);
  console.log('after: carried=' + m5.carried + ' draws=' + m5.draws + ' fiberFetch=' + m5.out.fiberFetch + ' pile=' + JSON.stringify(pileOf()));
  check('F5 other-short: staging served a crude bow (prerequisite)', s5.staged === true, JSON.stringify(s5));
  check('F5 other-short: no arrows pocketed (no attempt ran)', m5.carried === 0, 'carried=' + m5.carried);
  check('F5 other-short: no craft attempt ran (crafted 0)', m5.out.crafted === 0, JSON.stringify(m5.out));
  check('F5 other-short: no fetch on the return', !m5.out.fiberFetch, JSON.stringify(m5.out));
  check('F5 other-short: no fetch telemetry', fetchTeleFor(learner).length === 0, JSON.stringify(fetchTeleFor(learner)));
  check('F5 other-short: ZERO Math.random draws', m5.draws === 0, 'draws=' + m5.draws);
  check('F5 other-short: pile untouched (stick 0, stone 1, fiber 0)', pileOf().stick === 0 && pileOf().stone === 1 && pileOf().fiber === 0, JSON.stringify(pileOf()));

  // F6: FIBERFETCH ON, served, pile fiber STOCKED (1): the craft
  // proceeds from the pile — no fetch.
  console.log('\n=== F6: flag on, served, pile holds the fiber — no fetch ===');
  setFiberfetch(true); setAmmo(true);
  const s6 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  teleEvents.length = 0;
  const m6 = pocket(0.50);
  console.log('after: carried=' + m6.carried + ' draws=' + m6.draws + ' fiberFetch=' + m6.out.fiberFetch + ' pile=' + JSON.stringify(pileOf()));
  check('F6 pile-stocked: staging served a crude bow (prerequisite)', s6.staged === true, JSON.stringify(s6));
  check('F6 pile-stocked: 5 arrows pocketed (0.50 < 0.60)', m6.carried === 5, 'carried=' + m6.carried);
  check('F6 pile-stocked: no fetch on the return (the pile covered it)', !m6.out.fiberFetch, JSON.stringify(m6.out));
  check('F6 pile-stocked: no fetch telemetry', fetchTeleFor(learner).length === 0, JSON.stringify(fetchTeleFor(learner)));
  check('F6 pile-stocked: pile spent exactly the recipe (stick 0, stone 0, fiber 0)', pileOf().stick === 0 && pileOf().stone === 0 && pileOf().fiber === 0, JSON.stringify(pileOf()));
  check('F6 pile-stocked: exactly one craft draw', m6.draws === 1, 'draws=' + m6.draws);

  // F7: FIBERFETCH ON, served, pile fiber 0, roll 0.99: the fetch
  // fires and the craft fails — the fetched fiber is lost, the
  // pile is never driven negative.
  console.log('\n=== F7: flag on, served, pile fiber 0, roll 0.99 — fetch fires, craft fails ===');
  setFiberfetch(true); setAmmo(true);
  const s7 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 0 });
  teleEvents.length = 0;
  const m7 = pocket(0.99);
  console.log('after: carried=' + m7.carried + ' draws=' + m7.draws + ' fiberFetch=' + m7.out.fiberFetch + ' pile=' + JSON.stringify(pileOf()));
  check('F7 failing roll: staging served a crude bow (prerequisite)', s7.staged === true, JSON.stringify(s7));
  check('F7 failing roll: no arrows pocketed', m7.carried === 0, 'carried=' + m7.carried);
  check('F7 failing roll: the craft ran and failed', m7.out.crafted === 1 && m7.out.craftedOk === false, JSON.stringify(m7.out));
  check('F7 failing roll: the fetch still fired (fiberFetch true)', m7.out.fiberFetch === true && m7.out.fiberSite === 1, JSON.stringify(m7.out));
  check('F7 failing roll: fetch telemetry still fired (the gathering happened)', fetchTeleFor(learner).length === 1, JSON.stringify(fetchTeleFor(learner)));
  check('F7 failing roll: pile never driven negative', pileOf().stick >= 0 && pileOf().stone >= 0 && pileOf().fiber >= 0, JSON.stringify(pileOf()));
  check('F7 failing roll: exactly one craft draw', m7.draws === 1, 'draws=' + m7.draws);

  // F8: FIBERFETCH ON, sling carrier (ammo stone, no pile recipe)
  // — the stone path is untouched by the flag.
  console.log('\n=== F8: flag on, sling carrier — the stone path is untouched ===');
  setFiberfetch(true); setAmmo(true);
  resetVillager(learner);
  v.weaponCraft = {}; v.ammoCraft = {}; v.bowOpen = {}; v.bowOpenByVid = {};
  const lp8 = person(learner);
  lp8.items = [{ itemId: 'sling' }];
  if (EQ) EQ.autoEquip(lp8, G.data.items);
  setPile({ stick: 0, stone: 4, fiber: 0 });
  teleEvents.length = 0;
  const m8 = pocket(0.01);
  let stonesCarried = 0;
  for (const e of (person(learner).items || [])) {
    const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (eid === 'stone') stonesCarried += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  console.log('after: ranged=' + equippedId(learner, 'ranged') + ' stones=' + stonesCarried + ' draws=' + m8.draws + ' fiberFetch=' + m8.out.fiberFetch);
  check('F8 sling: the sling is seated in the ranged slot', equippedId(learner, 'ranged') === 'sling', equippedId(learner, 'ranged'));
  check('F8 sling: 4 stones pocketed from the pile', stonesCarried === 4, 'stones=' + stonesCarried);
  check('F8 sling: no craft attempt ran (crafted 0)', m8.out.crafted === 0, JSON.stringify(m8.out));
  check('F8 sling: no fetch on the return', !m8.out.fiberFetch, JSON.stringify(m8.out));
  check('F8 sling: ZERO Math.random draws', m8.draws === 0, 'draws=' + m8.draws);

  // F9: FIBERFETCH ON, served, pile fiber 0, lv[arrow]=2, roll 0.80:
  // the fetch fires and the learned 85% rate is untouched.
  console.log('\n=== F9: flag on, served, lv[arrow]=2, roll 0.80 — fetch + learned rate ===');
  setFiberfetch(true); setAmmo(true);
  const s9 = serveBow(0.01);
  v.ammoCraft[learner] = { arrow: 2 };
  setPile({ stick: 2, stone: 1, fiber: 0 });
  teleEvents.length = 0;
  const m9 = pocket(0.80);
  console.log('after: carried=' + m9.carried + ' draws=' + m9.draws + ' fiberFetch=' + m9.out.fiberFetch + ' ammoRate=' + m9.out.ammoRate);
  check('F9 learned rate: staging served a crude bow (prerequisite)', s9.staged === true, JSON.stringify(s9));
  check('F9 learned rate: roll 0.80 succeeds at 85% (would fail the blind 35% and the 60%)', m9.carried === 5, 'carried=' + m9.carried);
  check('F9 learned rate: the fetch fired (fiberFetch true)', m9.out.fiberFetch === true, JSON.stringify(m9.out));
  check('F9 learned rate: return carries ammoRate 0.85', m9.out.ammoRate === 0.85, JSON.stringify(m9.out));
  check('F9 learned rate: exactly one craft draw', m9.draws === 1, 'draws=' + m9.draws);

  // F10: FIBERFETCH ON, AMMO OFF, served, pile fiber 0, roll 0.50:
  // the fetch is independent of the AMMO rate — it fires, and the
  // craft faces the blind 35% (0.50 fails). The prereg freezes
  // this independence; the pilot always runs AMMO=1 alongside.
  console.log('\n=== F10: flag on, AMMO off — the fetch is independent of the rate ===');
  setFiberfetch(true); setAmmo(false);
  const s10 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 0 });
  teleEvents.length = 0;
  const m10 = pocket(0.50);
  console.log('after: carried=' + m10.carried + ' draws=' + m10.draws + ' fiberFetch=' + m10.out.fiberFetch + ' ammoRate=' + m10.out.ammoRate);
  check('F10 ammo-off: staging served a crude bow (prerequisite)', s10.staged === true, JSON.stringify(s10));
  check('F10 ammo-off: the fetch fired (fiberFetch true)', m10.out.fiberFetch === true, JSON.stringify(m10.out));
  check('F10 ammo-off: the craft faces the blind 35% (0.50 fails, no arrows)', m10.carried === 0 && m10.out.ammoRate === 0.35 && m10.out.crafted === 1 && m10.out.craftedOk === false, JSON.stringify(m10.out));
  check('F10 ammo-off: exactly one craft draw', m10.draws === 1, 'draws=' + m10.draws);

  console.log('\nFIBERFETCH ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — FAILS: ' + fails.join('; ') : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
