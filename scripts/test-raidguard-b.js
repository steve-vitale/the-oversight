#!/usr/bin/env node
// test-raidguard-b.js — proof for the sim-raidguard-b DIAG arm
// (backlog #1451 residual (1): the raid-aftermath guard in
// src/js/game.js startCombat fired 0 times on the raidname band).
// Question: prove a firing case, or prove the case cannot occur.
//   T1 (unit): tbHumanFighter — the ONLY villager-seating path in
//       startCombat's party loop — returns null for a dead-flagged
//       villager, for hp 0, hp < 0, and non-finite hp, and returns a
//       fighter with alive === true and hp > 0 for a healthy one.
//   T2 (firing-case attempt, paired same-seed): a raid-born fight
//       whose seated villagers are set to 0 HP before startCombat
//       must NOT seat them and must NOT fire the aftermath line.
//       Positive control first: the same seed with health intact
//       MUST seat at least one villager, so the negative is a gate
//       effect, not a positioning accident.
//   T3 (snapshot-timing leg): a 1-HP villager seated in a raid-born
//       fight who dies in the fight's own opening turns must NOT
//       trigger the aftermath line — the snapshot precedes the
//       opening turns. Searched across fixture seeds until one
//       stages an opening-turn villager death; SKIP (not pass) if
//       none stages, and the SKIP is reported, not hidden.
//   T4 (corpus, --corpus DIR --base-corpus DIR): removal
//       neutrality — the guard-removed corpus deep-equals the
//       guard-present corpus on ALL recorded fields INCLUDING say,
//       modulo stackLines only (source line numbers shift with ANY
//       edit — the same named edit artifact as sim-raidname-b).
//       Also counts aftermath lines in both corpora (must be 0),
//       AND the G1c corpus-witness leg: in the guard-present
//       corpus, every creation whose post-startCombat fighter
//       snapshot shows a dead villager AND whose tail carries
//       the raid line must NOT carry the aftermath line — the
//       raid line proves the guard's outer condition held, the
//       dead fighter proves a villager died by startCombat
//       return, and the aftermath line is said last inside the
//       same block, so it could not have been truncated out
//       of the 12-line tail. Such a creation is therefore a
//       villager who was alive at the pre-opening-turn snapshot
//       and died in the opening turns, without triggering the
//       guard. At least one witness is required. (This is the
//       G1c proposition proven on real corpus fights; the
//       fixture leg T3 reports SKIP when it cannot stage one —
//       the SKIP stays visible, it is not converted to a pass.)
// Run (unit only): node scripts/test-raidguard-b.js
// Run (full): node scripts/test-raidguard-b.js --corpus
//   evidence/2026-10-29/sim-raidguard-b-corpus --base-corpus
//   evidence/2026-10-29/sim-raidname-b-corpus-on
// Exit 0 = all green (a T3 SKIP does not fail; the G1c
// proposition is additionally proven by the T4 corpus-witness
// leg on real fights — see the evidence file's metric review
// for the fixture-vs-corpus instrument note, stated openly
// rather than hidden).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0, fail = 0, skip = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}
const args = process.argv.slice(2);
let corpus = null, baseCorpus = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--corpus') corpus = args[++i];
  else if (args[i] === '--base-corpus') baseCorpus = args[++i];
}
const AFTERMATH_RE = /already fell to the raid before this fight/;
const RAID_LINE = 'This one came with the raid on Haven';

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'raidguard-proof', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 10 });
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  try { Game.map.px = hx; Game.map.py = hy; } catch (e) {}
  try { if (!Game.playerAtHaven()) Game.travelTo(hx, hy); } catch (e) {}
  return { Game, v, hx, hy };
}
function startCombatCapture(Game, monsterId) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (...a) { try { lines.push(String(a[0] || '')); } catch (e) {} return orig.apply(this, a); };
  let err = null;
  try { Game.startCombat(monsterId); } catch (e) { err = String(e && e.message); }
  Game.say = orig;
  return { lines, err };
}
function endFight(Game) {
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd && Game.tbEnd('fled'); } catch (e) {}
}

async function main() {
  console.log('T1: tbHumanFighter gates (the only villager-seating path)');
  {
    const { Game, v } = await freshGame(515011);
    const roster = (v.roster || []).filter((id) => id !== Game.villagerId);
    ok(roster.length > 0, 'roster has non-player villagers (' + roster.length + ')');
    const rid = roster[0];
    const pos = { mx: 4, my: 4 };
    // Healthy baseline: seated, alive, hp > 0.
    const healthy = Game.tbHumanFighter(rid, 'villager', pos);
    ok(!!healthy && healthy.alive === true && healthy.hp > 0,
      'healthy villager seats alive with hp>0 (hp=' + (healthy && healthy.hp) + ')');
    // Dead flag: null even with healthy hp.
    const person = Game.vpOf(rid);
    const hadDead = person.dead;
    person.dead = true;
    let deadFlagged = null;
    try { deadFlagged = Game.tbHumanFighter(rid, 'villager', pos); } catch (e) { deadFlagged = 'threw:' + e.message; }
    ok(deadFlagged === null, 'dead-flagged villager is NOT seated (got ' + (deadFlagged === null ? 'null' : 'a fighter') + ')');
    if (hadDead === undefined) delete person.dead; else person.dead = hadDead;
    // HP gates: 0, negative, NaN — all null.
    v.health = v.health || {};
    const savedHp = v.health[rid];
    for (const bad of [0, -5, NaN]) {
      v.health[rid] = bad;
      let got = null;
      try { got = Game.tbHumanFighter(rid, 'villager', pos); } catch (e) { got = 'threw:' + e.message; }
      ok(got === null, 'hp=' + String(bad) + ' villager is NOT seated');
    }
    if (savedHp === undefined) delete v.health[rid]; else v.health[rid] = savedHp;
    // Undefined hp defaults to 100 and seats (the filter's hp!==undefined
    // branch passes it through; tbHumanFighter supplies the default).
    delete v.health[rid];
    let undef = null;
    try { undef = Game.tbHumanFighter(rid, 'villager', pos); } catch (e) { undef = 'threw:' + e.message; }
    ok(!!undef && undef.alive === true && undef.hp > 0, 'hp-undefined villager seats alive (default 100, hp=' + (undef && undef.hp) + ')');
    if (savedHp !== undefined) v.health[rid] = savedHp;
  }

  console.log('T2: firing-case attempt — raid-born fight, villagers pre-set to 0 HP');
  {
    // Positive control first: find a seed that seats >= 1 villager.
    let controlSeed = null, controlSeated = null;
    for (let seed = 515011; seed <= 515030 && !controlSeed; seed++) {
      const { Game, v, hx, hy } = await freshGame(seed);
      const m = Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
      m.raidBorn = true;
      try { Game.syncMonsterAlias(); } catch (e) {}
      const r = startCombatCapture(Game, 'bulldozer');
      const seated = ((Game.tbfight && Game.tbfight.fighters) || [])
        .filter((f) => f.kind === 'villager').map((f) => f.villagerId);
      endFight(Game);
      if (!r.err && seated.length > 0) { controlSeed = seed; controlSeated = seated; }
    }
    ok(controlSeed !== null, 'positive control: some seed seats a villager (seed=' + controlSeed + ')');
    if (controlSeed !== null) {
      ok(controlSeated.length > 0, 'control seats ' + controlSeated.length + ' villager(s)');
      // Paired run: SAME seed, the seated villagers at 0 HP.
      const { Game, v, hx, hy } = await freshGame(controlSeed);
      v.health = v.health || {};
      for (const rid of controlSeated) v.health[rid] = 0;
      const m = Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
      m.raidBorn = true;
      try { Game.syncMonsterAlias(); } catch (e) {}
      // FIXTURE NOTE: the entity path alone is NOT a reliable
      // raid-born guarantee in fixtures — a bystander tile
      // monster (here a rut_king already on the haven tile)
      // can shadow the spawned monster for playerMonster(),
      // so _originIsFighter is false and path (b) stays
      // silent (probe-raidguard-t2: control raidLine=false
      // for exactly this reason). The pending shadow is the
      // provenance that does not depend on tile occupancy
      // (raidname T1b), so the firing-case attempt sets it:
      // if a pre-dead villager were seated, the guard WOULD
      // fire through this path. The entity flag stays set too,
      // so both provenances are armed.
      Game.raidPendingMonsterId = 'bulldozer';
      const r = startCombatCapture(Game, 'bulldozer');
      const seated = ((Game.tbfight && Game.tbfight.fighters) || [])
        .filter((f) => f.kind === 'villager').map((f) => f.villagerId);
      const leaked = seated.filter((id) => controlSeated.includes(id));
      ok(!r.err, 'paired 0-HP startCombat runs (err=' + r.err + ')');
      ok(leaked.length === 0, 'no 0-HP villager seated (leaked=' + leaked.length + ', seated=' + seated.length + ')');
      ok(r.lines.some((l) => l.includes(RAID_LINE)), 'raid line still fires (fight IS raid-born)');
      ok(!r.lines.some((l) => AFTERMATH_RE.test(l)), 'aftermath line does NOT fire (no pre-dead seated fighter)');
      // And the guard predicate itself is empty over the seated fighters.
      const pred = ((Game.tbfight && Game.tbfight.fighters) || [])
        .filter((f) => f.kind === 'villager' && (f.alive === false || (typeof f.hp === 'number' && f.hp <= 0)));
      ok(pred.length === 0, 'guard predicate empty over seated fighters (' + pred.length + ')');
      endFight(Game);
    }
  }

  console.log('T3: snapshot-timing leg — 1-HP villager dying in opening turns');
  {
    // Search fixture seeds for an opening-turn villager death.
    let staged = null;
    for (let seed = 515031; seed <= 515060 && !staged; seed++) {
      for (const mid of ['bulldozer', 'hummice']) {
        if (staged) break;
        const { Game, v, hx, hy } = await freshGame(seed);
        // Probe: who seats healthy on this seed?
        const m0 = Game.spawnWorldMonster({ id: mid }, hx, hy, {});
        m0.raidBorn = true;
        try { Game.syncMonsterAlias(); } catch (e) {}
        const probe = startCombatCapture(Game, mid);
        const seated = ((Game.tbfight && Game.tbfight.fighters) || [])
          .filter((f) => f.kind === 'villager').map((f) => f.villagerId);
        endFight(Game);
        if (probe.err || seated.length === 0) continue;
        // Real run: SAME seed, those villagers at 1 HP.
        const g2 = await freshGame(seed);
        g2.v.health = g2.v.health || {};
        for (const rid of seated) g2.v.health[rid] = 1;
        const mm = g2.Game.spawnWorldMonster({ id: mid }, g2.hx, g2.hy, {});
        mm.raidBorn = true;
        try { g2.Game.syncMonsterAlias(); } catch (e) {}
        // Same fixture note as T2: arm the pending shadow so the
        // fight is raid-born regardless of tile bystanders.
        g2.Game.raidPendingMonsterId = mid;
        const r = startCombatCapture(g2.Game, mid);
        const fighters = (g2.Game.tbfight && g2.Game.tbfight.fighters) || [];
        const deadNow = fighters.filter((f) => f.kind === 'villager' && (f.alive === false || (typeof f.hp === 'number' && f.hp <= 0)));
        endFight(g2.Game);
        if (!r.err && deadNow.length > 0) staged = { seed, mid, dead: deadNow.map((f) => f.name), lines: r.lines };
      }
    }
    if (staged) {
      ok(!staged.lines.some((l) => AFTERMATH_RE.test(l)),
        'opening-turn villager death does NOT trigger aftermath (seed=' + staged.seed + ' ' + staged.mid + ', fell in opening: ' + staged.dead.join(',') + ')');
      ok(staged.lines.some((l) => l.includes(RAID_LINE)), 'raid line present in the timing-leg fight');
    } else {
      skip++; console.log('  SKIP no fixture seed staged an opening-turn villager death (bulldozer/hummice x 30 seeds) — G1c unproven dynamically; see evidence');
    }
  }

  if (corpus && baseCorpus) {
    console.log('T4: corpus legs — zero-fire + removal neutrality (say EXACT)');
    const strip = (o) => {
      if (Array.isArray(o)) return o.map(strip);
      if (o && typeof o === 'object') {
        const out = {};
        for (const [k, val] of Object.entries(o)) {
          if (k === 'stackLines') continue;
          out[k] = strip(val);
        }
        return out;
      }
      return o;
    };
    const countAftermath = (d) => {
      let n = 0;
      const walk = (o) => {
        if (typeof o === 'string') { if (AFTERMATH_RE.test(o)) n++; return; }
        if (Array.isArray(o)) { o.forEach(walk); return; }
        if (o && typeof o === 'object') Object.values(o).forEach(walk);
      };
      walk(d);
      return n;
    };
    const files = fs.readdirSync(corpus).filter((f) => f.endsWith('.json')).sort();
    const baseFiles = fs.readdirSync(baseCorpus).filter((f) => f.endsWith('.json')).sort();
    // Pilot runs compare a subset (8 seeds) against the full
    // guard-present band; the confirm run compares all 16.
    // Every corpus file must have a same-named base file.
    ok(files.length > 0, 'corpus has files (' + files.length + ', base has ' + baseFiles.length + ')');
    let neutBad = 0, aftOn = 0, aftBase = 0, missing = 0;
    for (const f of files) {
      if (!baseFiles.includes(f)) { missing++; continue; }
      const on = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
      const base = JSON.parse(fs.readFileSync(path.join(baseCorpus, f), 'utf8'));
      aftOn += countAftermath(on);
      aftBase += countAftermath(base);
      if (JSON.stringify(strip(base)) !== JSON.stringify(strip(on))) {
        neutBad++;
        // Report the first differing top-level key for diagnosis.
        const keys = new Set([...Object.keys(base), ...Object.keys(on)]);
        for (const k of keys) {
          if (JSON.stringify(strip(base[k])) !== JSON.stringify(strip(on[k]))) { console.log('    DIFF file=' + f + ' key=' + k); break; }
        }
      }
    }
    ok(missing === 0, 'every guard-removed file has a guard-present twin (missing=' + missing + ')');
    ok(aftBase === 0, 'guard-present corpus: 0 aftermath lines (' + aftBase + ')');
    ok(aftOn === 0, 'guard-removed corpus: 0 aftermath lines (' + aftOn + ')');
    ok(neutBad === 0, 'removal neutrality: all compared files deep-equal incl. say, modulo stackLines (' + (files.length - neutBad) + '/' + files.length + ')');
    // G1c corpus witnesses, over the FULL guard-present band
    // (baseCorpus), not just the compared subset.
    let wit = 0, witBad = 0;
    for (const f of baseFiles) {
      const base = JSON.parse(fs.readFileSync(path.join(baseCorpus, f), 'utf8'));
      for (const c of (base.fightCreations || [])) {
        const dead = (c.fighters || []).filter((x) => x.kind === 'villager' && (x.alive === false || (typeof x.hp === 'number' && x.hp <= 0)));
        if (!dead.length) continue;
        const tail = (c.sayTail || []).join('\n');
        if (!tail.includes(RAID_LINE)) continue;
        wit++;
        console.log('    G1c witness ' + f + ' creation#' + c.ordinal + ' day' + c.loopDay + ' dead=' + dead.map((x) => x.name + ':' + x.hp).join(','));
        if (AFTERMATH_RE.test(tail)) witBad++;
      }
    }
    ok(wit > 0, 'G1c corpus witnesses exist (opening-turn villager deaths with raid line, no aftermath: ' + wit + ')');
    ok(witBad === 0, 'G1c witnesses: no aftermath line in any witness tail (bad=' + witBad + ')');
  } else {
    console.log('T4 skipped (no --corpus/--base-corpus given)');
  }
  console.log(`RESULT pass=${pass} fail=${fail} skip=${skip}`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('FATAL', e && e.stack || e); process.exit(2); });
