#!/usr/bin/env node
// scripts/proof-lootabilities-w2.js — Lootabilities WAVE 2 (Arms 4–5) proof.
// Pattern: test-geartier-a.js (sim-harness loadGame + setupGame, roster
// leader+ally, mulberry rng per fight, scholar day 120, fed pantry).
//
// Prints:
//  (a) coverage count BEFORE/AFTER — BEFORE is the coordinator's verified
//      baseline list (evidence/2026-10-31/lootabilities-w2-baseline-20261031.md:
//      18 vHasAb ids in fieldFights.js + godpath FIELD_IDS + FIELD_KIT);
//      AFTER is counted by the same counter pointed at the CURRENT source
//      (vHasAb/ffFired ids in fieldFights.js + FIELD_IDS/FIELD_KIT in
//      godpath.js).
//  (b) fixture field fights WITH vs WITHOUT a previously-dead ability, same
//      seed, for: blind, stun, displacement-or-bind, ally action,
//      cheat-death (plus tripwire / stare-down / peacemaker / brawler).
//  (c) Arm 5 determinism: a classed villager's fixture run twice — once
//      with the class-surfacing layer live, once with classLine/classify
//      patched out (the pre-Arm-5 state). Outcomes must be identical and
//      the logs must match exactly once the class tags are stripped.
//  (d) one full fight transcript excerpt with a classed villager's named
//      log line.
// Fixture seed-scan disclosure: for chance-gated families (stare-down,
// peacemaker, cheat-death) the script scans a fixed seed list for the
// first seed where the WITH fight shows the effect, then runs WITHOUT at
// that same seed. The scan is deterministic and printed.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- (a) coverage counter ----------
const BASE_VHASAB = ['ambush', 'blood_trail', 'bodyguard', 'dead_aim', 'draw_fire', 'echo_location', 'field_medicine', 'game_sense', 'haymaker', 'patient_aim', 'rally', 'scream_cheese', 'shield_wall', 'stalk', 'tracker', 'trade_of_blows', 'unbreakable', 'war_cry'];
const BASE_FIELD_IDS = ['raise_earth', 'gravity_well', 'landslide', 'pack_hunt', 'mending_hands', 'blink', 'switcheroo', 'foresight', 'live_broadcast', 'the_crowd_moves', 'stoke', 'coin_guard', 'bribe', 'aegis_link', 'misdirection', 'prophecy', 'ember_heart', 'back_from_the_brink', 'rally_aura', 'lifeline', 'last_rites', 'sweetener'];
const BASE_FIELD_KIT = ['rage', 'pocket_sand', 'fear_aura', 'static_toss', 'cheese_wheel', 'bird_strike', 'turncoat', 'retribution', 'second_wind', 'molt'];
function coverageFromSource() {
  const ff = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'fieldFights.js'), 'utf8');
  const gp = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'godpath.js'), 'utf8');
  const ids = new Set();
  for (const m of ff.matchAll(/vHasAb\('([a-z_0-9]+)'\)/g)) ids.add(m[1]);
  for (const m of ff.matchAll(/ffFired\('([a-z_0-9]+)'\)/g)) ids.add(m[1]);
  for (const name of ['FIELD_IDS', 'FIELD_KIT']) {
    const mm = gp.match(new RegExp('const ' + name + " = \\[([^\\]]+)\\]"));
    if (mm) for (const q of mm[1].matchAll(/'([a-z_0-9]+)'/g)) ids.add(q[1]);
  }
  return ids;
}

// ---------- fixture runner (one fresh load per fight, geartier pattern) ----------
async function runFight(cfg) {
  const { Game: G, loadFails } = await loadGame({ seed: 424242, mode: 'lootabilities-w2', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  try { G.state.scholar.day = 120; } catch (e) {}
  try {
    const tier = G.villageFoodTier ? G.villageFoodTier() : 'secure';
    if (tier === 'tight' || tier === 'starving') {
      if (typeof G.pantryAdd === 'function') G.pantryAdd(200000, 'w2 fixture top-up');
    }
  } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (roster.length < 2) throw new Error('fewer than 2 roster villagers');
  const leader = roster[0], ally = roster[1];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (!vp) throw new Error('no villager record ' + vid);
    vp.items = ['machete'];
    if (vid === leader && cfg.items) vp.items = vp.items.concat(cfg.items);
    vp.equipped = { melee: { itemId: 'machete', name: 'machete' } };
  }
  const v = G.state.village || (G.state.village = {});
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[leader] = (cfg.abils || []).slice();
  v.npcAbilities[ally] = [];
  const needs = v.needs || {};
  needs[leader] = Object.assign({}, needs[leader], { hunger: 0, fear: 0 });
  needs[ally] = Object.assign({}, needs[ally], { hunger: 0, fear: 0 });
  v.needs = needs;
  v.health = v.health || {};
  v.health[leader] = cfg.leaderHp || 100; v.health[ally] = 100;
  const def = (G.data.monsters || []).find(m => m && m.id === cfg.mid);
  if (!def) throw new Error('monster def not found: ' + cfg.mid);
  const entity = { id: def.id, hp: cfg.hp, maxHp: cfg.hp, tx: 2, ty: 2 };
  const opts = { allies: cfg.ally ? 1 : 0, allyVids: cfg.ally ? [ally] : [], allyFromStart: !!cfg.ally, rng: mulberry32(cfg.seed), noFlee: !!cfg.noFlee };
  const rec = G.fieldFight(leader, def, entity, opts);
  return { G, rec, leader, ally };
}

const SEEDS = [9101, 9102, 9103, 9104, 9105, 9106, 9107, 9108, 9109, 9110, 9111, 9112];
let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? ' — ' + detail : ''));
  if (!ok) failures++;
}
function hasLine(rec, re) { return (rec.log || []).some(l => re.test(l)); }

async function family(label, baseCfg, markerRe, extraAssert) {
  // scan for first seed where WITH shows the marker; WITHOUT at same seed must not.
  for (const seed of SEEDS) {
    const withR = await runFight(Object.assign({}, baseCfg, { seed }));
    if (!hasLine(withR.rec, markerRe)) continue;
    const withoutR = await runFight(Object.assign({}, baseCfg, { seed, abils: [] }));
    const markerAbsent = !hasLine(withoutR.rec, markerRe);
    const differs = JSON.stringify(withR.rec.log) !== JSON.stringify(withoutR.rec.log) ||
                    withR.rec.outcome !== withoutR.rec.outcome || withR.rec.vTaken !== withoutR.rec.vTaken;
    let extra = true, extraDetail = '';
    if (extraAssert) { const r = extraAssert(withR.rec, withoutR.rec); extra = r.ok; extraDetail = r.detail || ''; }
    check(label + ' (seed ' + seed + ')', markerAbsent && differs && extra,
      'WITH outcome=' + withR.rec.outcome + ' rounds=' + withR.rec.rounds + ' vTaken=' + withR.rec.vTaken + ' mDealt=' + withR.rec.mDealt +
      ' | WITHOUT outcome=' + withoutR.rec.outcome + ' rounds=' + withoutR.rec.rounds + ' vTaken=' + withoutR.rec.vTaken + ' mDealt=' + withoutR.rec.mDealt +
      (extraDetail ? ' | ' + extraDetail : ''));
    return { withR, withoutR, seed };
  }
  check(label, false, 'no seed in scan showed the marker ' + markerRe);
  return null;
}

(async () => {
  // (a) coverage
  const before = new Set([...BASE_VHASAB, ...BASE_FIELD_IDS, ...BASE_FIELD_KIT]);
  const after = coverageFromSource();
  const newIds = [...after].filter(x => !before.has(x)).sort();
  console.log('=== (a) COVERAGE ===');
  console.log('BEFORE: ' + before.size + ' distinct held abilities with a field-fight effect (18 vHasAb + ' + BASE_FIELD_IDS.length + ' godpath FIELD_IDS + ' + BASE_FIELD_KIT.length + ' godpath FIELD_KIT)');
  console.log('AFTER:  ' + after.size + ' distinct');
  console.log('NEWLY TRANSLATED: ' + newIds.join(', '));
  check('coverage grows by exactly the Arm-4 translations', after.size === before.size + newIds.length && newIds.length === 9, 'new=' + newIds.length);

  console.log('=== (b) FIXTURE FAMILIES (WITH vs WITHOUT, same seed) ===');
  // BLIND — pocket_sand (godpath FIELD_KIT path, mapped for the record)
  await family('blind / pocket_sand', { mid: 'gallowdeer', hp: 160, abils: ['pocket_sand'] }, /Pocket Sand/);
  // STUN — freeze_tag (new)
  const freeze = await family('stun+root / freeze_tag', { mid: 'gallowdeer', hp: 160, abils: ['freeze_tag'] }, /Freeze Tag/);
  // STUN (pre-set) — tripwire (new)
  await family('stun / tripwire', { mid: 'gallowdeer', hp: 160, abils: ['tripwire'] }, /Tripwire/);
  // BIND — hogtie (new; tripwire supplies the controlled state, rope in pack)
  await family('bind / hogtie', { mid: 'hushwolf', hp: 60, abils: ['tripwire', 'hogtie'], items: ['rope_50ft'] }, /Hogtie/);
  // DISPLACEMENT — shoulder_check (new; tripwire supplies controlled, pack supplies the slam)
  await family('displacement / shoulder_check', { mid: 'hushwolf', hp: 60, abils: ['tripwire', 'shoulder_check'] }, /Shoulder Check/);
  // ALLY ACTION — leech (new): the holder takes half the ally's hits
  await family('ally action / leech', { mid: 'gallowdeer', hp: 160, ally: true, abils: ['leech'] }, /\(Leech\)/,
    (w, wo) => ({ ok: (w.allyTaken || 0) <= (wo.allyTaken || 0), detail: 'allyTaken WITH=' + w.allyTaken + ' WITHOUT=' + wo.allyTaken }));
  // ALLY ACTION (GEARTIER-A regression guard) — live_broadcast extra ally strikes
  await family('ally action / live_broadcast (Oct 29 regression guard)', { mid: 'gallowdeer', hp: 160, ally: true, abils: ['live_broadcast'] }, /strikes again, louder/);
  // CHEAT-DEATH — second_wind (godpath FIELD_KIT via fieldCheatDeath): arena,
  // hurt leader. The observable is the refusal itself: the WITH villager takes
  // a blow that puts them at 0 and stands back up at 1 HP (the card, verbatim);
  // in a sealed arena the next blow still lands, so final outcome may be vDie
  // in both — the cheat is measured by the survived killing blow + extra time
  // alive, not by arena survival.
  {
    let done = false;
    for (const seed of SEEDS) {
      const withR = await runFight({ mid: 'gallowdeer', hp: 160, abils: ['second_wind'], leaderHp: 30, noFlee: true, seed });
      if (!hasLine(withR.rec, /Second Wind/)) continue;
      const withoutR = await runFight({ mid: 'gallowdeer', hp: 160, abils: [], leaderHp: 30, noFlee: true, seed });
      const ok = !hasLine(withoutR.rec, /Second Wind/) && withoutR.rec.outcome === 'vDie' &&
        (withR.rec.rounds > withoutR.rec.rounds || withR.rec.outcome !== 'vDie');
      check('cheat-death / second_wind (seed ' + seed + ')', ok,
        'WITH refused a killing blow (rounds=' + withR.rec.rounds + ', outcome=' + withR.rec.outcome + ') | WITHOUT died unrefused at round ' + withoutR.rec.rounds);
      done = true; break;
    }
    if (!done) check('cheat-death / second_wind', false, 'no seed showed the Second Wind refusal line');
  }
  // GOAD/FLEE class — intimidating_presence stare-down (new)
  await family('goad-flee / intimidating_presence stare-down', { mid: 'gallowdeer', hp: 160, abils: ['intimidating_presence'] }, /Stare Down — it backed down/);
  // PEACEMAKER (new)
  await family('peaceful end / peacemaker walk-in', { mid: 'gallowdeer', hp: 160, abils: ['peacemaker'] }, /Peacemaker: Walk In/);
  // BRAWLER (new): spends round 1, +2 speed — log marker is the observable
  await family('speed / brawler_instinct read-the-fight', { mid: 'gallowdeer', hp: 160, abils: ['brawler_instinct'] }, /Brawler's Instinct/);

  console.log('=== (c) ARM 5 DETERMINISM + CLASS VISIBILITY ===');
  const classCfg = { mid: 'gallowdeer', hp: 160, ally: true, leaderHp: 45, abils: ['mending_hands', 'lifeline', 'last_rites'] };
  let arm5 = null;
  for (const seed of SEEDS) {
    const a = await runFight(Object.assign({}, classCfg, { seed }));
    if (!hasLine(a.rec, /Mending Hands/)) continue;
    // Run B: identical fixture, class surfacing patched out (pre-Arm-5 state)
    const GP = (global.Scattering || {}).Godpath || (a.G.Scattering || {}).Godpath;
    const b = await (async () => {
      const { Game: G2, loadFails } = await loadGame({ seed: 424242, mode: 'lootabilities-w2', fullTelemetry: false });
      if (loadFails.length) throw new Error('loadFails B');
      await setupGame(G2);
      const GP2 = (global.Scattering || {}).Godpath;
      const savedLine = GP2.classLine, savedClassify = GP2.classify;
      GP2.classLine = () => null; GP2.classify = () => null;
      try {
        // rebuild the same fixture on G2 by re-running runFight's steps via a fresh fight:
        // (runFight loads its own game, so instead we replicate the fixture here minimally
        //  by calling runFightWithGame below)
        return await runFightOn(G2, Object.assign({}, classCfg, { seed }));
      } finally { GP2.classLine = savedLine; GP2.classify = savedClassify; }
    })();
    const strip = ls => (ls || []).map(l => l.replace(/ \[[^\]]+ — [^\]]+\]$/, ''));
    const sameOutcome = a.rec.outcome === b.rec.outcome && a.rec.rounds === b.rec.rounds &&
      a.rec.vTaken === b.rec.vTaken && a.rec.mDealt === b.rec.mDealt && (a.rec.allyTaken || 0) === (b.rec.allyTaken || 0);
    const sameStripped = JSON.stringify(strip(a.rec.log)) === JSON.stringify(b.rec.log);
    const tagged = (a.rec.log || []).filter(l => /— .+ of the /.test(l) || /— \S+ of \S/.test(l));
    check('Arm 5 determinism (seed ' + seed + ')', sameOutcome && sameStripped && tagged.length > 0,
      'outcomes A=' + a.rec.outcome + '/' + a.rec.rounds + 'r B=' + b.rec.outcome + '/' + b.rec.rounds + 'r; stripped-logs-equal=' + sameStripped + '; tagged lines=' + tagged.length + '; classLine=' + (a.rec.classLine || 'none'));
    arm5 = { a, b, seed, tagged };
    break;
  }
  if (!arm5) check('Arm 5 determinism', false, 'no seed showed a Mending Hands line for the classed villager');

  console.log('=== (d) TRANSCRIPT EXCERPT (classed villager, Arm 5) ===');
  if (arm5) {
    console.log('class: ' + (arm5.a.rec.classLine || '?') + ' | outcome: ' + arm5.a.rec.outcome + ' | rounds: ' + arm5.a.rec.rounds);
    for (const l of arm5.a.rec.log) console.log('  ' + l);
  }
  if (freeze && freeze.withR) {
    console.log('=== TRANSCRIPT EXCERPT (freeze_tag fight, WITH) ===');
    for (const l of freeze.withR.rec.log) console.log('  ' + l);
  }
  console.log(failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });

// Fixture replication on an already-loaded game (used only by the Arm 5
// patched run, where the patch must be applied to that game's Godpath).
async function runFightOn(G, cfg) {
  try { G.state.scholar.day = 120; } catch (e) {}
  try {
    const tier = G.villageFoodTier ? G.villageFoodTier() : 'secure';
    if ((tier === 'tight' || tier === 'starving') && typeof G.pantryAdd === 'function') G.pantryAdd(200000, 'w2 fixture top-up');
  } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  const leader = roster[0], ally = roster[1];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) || (G.data.background_survivors || []).find(x => x.id === vid);
    vp.items = ['machete'];
    vp.equipped = { melee: { itemId: 'machete', name: 'machete' } };
  }
  const v = G.state.village || (G.state.village = {});
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[leader] = (cfg.abils || []).slice();
  v.npcAbilities[ally] = [];
  const needs = v.needs || {};
  needs[leader] = Object.assign({}, needs[leader], { hunger: 0, fear: 0 });
  needs[ally] = Object.assign({}, needs[ally], { hunger: 0, fear: 0 });
  v.needs = needs;
  v.health = v.health || {};
  v.health[leader] = cfg.leaderHp || 100; v.health[ally] = 100;
  const def = (G.data.monsters || []).find(m => m && m.id === cfg.mid);
  const entity = { id: def.id, hp: cfg.hp, maxHp: cfg.hp, tx: 2, ty: 2 };
  const rec = G.fieldFight(leader, def, entity, { allies: cfg.ally ? 1 : 0, allyVids: cfg.ally ? [ally] : [], allyFromStart: !!cfg.ally, rng: mulberry32(cfg.seed), noFlee: !!cfg.noFlee });
  return { G, rec, leader, ally };
}
