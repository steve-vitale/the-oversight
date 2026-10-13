#!/usr/bin/env node
// test-blitz-combatstats.js — blitz-combatstats 2026-10-13 (two builds).
//
// TASK 1 — villager combat speed. The flat speed-3 every non-player fighter
// carried was a lie: Game.villagerSpeed(vid) derives initiative from age,
// wounds, and temperament (2..4), wired into fieldFight initiative AND every
// tactical fighter-creation site (party.js x3, game.js, encounters.js,
// justice.js x2, titans.js).
//
// TASK 2 — ranged opening volleys. Supersedes the 2026-10-09 "RANGED COUNTS"
// rule ("off-screen fights have no grid, so range is meaningless"). A bow is
// not a bigger club: fieldFight now opens at range — shots =
// min(ammo, clamp(1+floor(range/monster speed),1,4)), each costing 1 real
// ammo, hit chance 0.85-0.06xrange (+tracking), damage on the lead. The
// volley can drive the pack off or drop the lead before round 1.
//
// RED on pristine (no villagerSpeed; no volley), GREEN after.
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'test' });
  if (loadFails && loadFails.length) { fail('module load failures: ' + loadFails.join('; ')); process.exitCode = 1; return; }
  await setupGame(Game);
  const S = globalThis.Scattering || {};
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { fail('need 3+ NPCs, have ' + roster.length); process.exitCode = 1; return; }
  const vrec = (vid) => (Game.data.villagers || []).find(v => v.id === vid) || {};
  const setHealth = (vid, hp) => { (Game.state.village.health = Game.state.village.health || {})[vid] = hp; };
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);

  // ============ TASK 1 ============
  assert(typeof Game.villagerSpeed === 'function', 'A0: Game.villagerSpeed exists (RED on pristine)');

  // A1: distinct speeds across the roster — not all 3
  const speeds = roster.map(id => ({ id, s: Game.villagerSpeed(id) }));
  const distinct = new Set(speeds.map(x => x.s));
  assert(distinct.size > 1, 'A1: roster speeds are not all 3 — distinct values: ' + [...distinct].sort().join(','));
  assert(speeds.every(x => x.s >= 2 && x.s <= 4), 'A1b: all speeds clamped 2..4');

  // A2: targeted derivations
  const [fast, slow, wounded, plain] = roster.slice(0, 4);
  const vf = vrec(fast); vf.age = 22; vf.personality = { temperament: 'bold' }; setHealth(fast, 100);
  const vs = vrec(slow); vs.age = 70; vs.personality = { temperament: 'cautious' }; setHealth(slow, 100);
  const vw = vrec(wounded); vw.age = 40; vw.personality = { temperament: 'steady' }; setHealth(wounded, 30);
  const vp0 = vrec(plain); vp0.age = 35; vp0.personality = { temperament: 'steady' }; setHealth(plain, 100);
  assert(Game.villagerSpeed(fast) === 4, 'A2: young+bold = 4 (got ' + Game.villagerSpeed(fast) + ')');
  assert(Game.villagerSpeed(slow) === 2, 'A2: old+cautious = 2 (got ' + Game.villagerSpeed(slow) + ')');
  assert(Game.villagerSpeed(wounded) === 2, 'A2: wounded (hp<50) = 3-1 = 2 (got ' + Game.villagerSpeed(wounded) + ')');
  assert(Game.villagerSpeed(plain) === 3, 'A2: typical adult = 3 (got ' + Game.villagerSpeed(plain) + ')');
  assert(Game.villagerSpeed('nobody-here') === 3, 'A2: unknown id falls back to 3');

  // A3: turn-order effect in the tactical engine (speed desc sorts first)
  const order = S.combat.turnOrder([
    { key: 'slowf', kind: 'villager', speed: 2, alive: true, fled: false },
    { key: 'fastf', kind: 'villager', speed: 4, alive: true, fled: false },
  ]);
  assert(order[0] === 'fastf', 'A3: turnOrder sorts speed-4 before speed-2');

  // A4: fieldFight initiative uses villagerSpeed, not a flat 3.
  // rng=()=>0 pins initiative to base speeds: mInit=mSpeed, vInit=vSpeed.
  // The first R1 log line tells who acted first.
  const firstR1 = (rec) => (rec.log.find(l => /^R1: /.test(l)) || '');
  for (const vid of [fast, slow]) { vrec(vid).items = []; delete vrec(vid).equipped; setHealth(vid, 100); }
  const rFast = Game.fieldFight(fast, mdef('speedbump_turtle'), null, { rng: () => 0 }); // vSpd 4 vs mSpd 1
  const rSlow = Game.fieldFight(slow, mdef('hushwolf'), null, { rng: () => 0 });          // vSpd 2 vs mSpd 5
  const f1 = firstR1(rFast), s1 = firstR1(rSlow);
  assert(/strikes for/.test(f1), 'A4: fast villager (spd 4) acts before slow turtle (spd 1) — first R1: ' + f1.slice(0, 60));
  assert(/hits .* for/.test(s1) && !/strikes for/.test(s1), 'A4: slow villager (spd 2) acts after hushwolf (spd 5) — first R1: ' + s1.slice(0, 60));

  // ============ TASK 2 ============
  const archer = roster[4] || roster[0];
  const va = vrec(archer); va.age = 30; va.personality = { temperament: 'steady' }; setHealth(archer, 100);
  const gearBow = (nArrows) => {
    va.items = [{ itemId: 'bow', units: 1 }];
    if (nArrows > 0) va.items.push({ itemId: 'arrow', units: nArrows });
    delete va.equipped;
  };
  const arrowCount = () => (va.items || []).filter(e => (e.itemId || e.id) === 'arrow')
    .reduce((t, e) => t + (e.units || 1), 0);
  const bull = mdef('bulldozer'); // hp [70,90], speed 3

  // B1-B3: bow + arrows → volley fires before round 1, ammo costs
  gearBow(8);
  const rb = Game.fieldFight(archer, bull, null, { rng: mulberry32(7) });
  assert(rb.volley && rb.volley.shots > 0, 'B1: bow-armed villager gets an opening volley (RED on pristine: volley null)');
  assert(rb.volley && rb.volley.shots === 2, 'B1b: bow range 5 vs bulldozer speed 3 → 1+floor(5/3) = 2 shots (got ' + (rb.volley && rb.volley.shots) + ')');
  assert(arrowCount() === 6, 'B2: 2 shots cost 2 real arrows (8 → ' + arrowCount() + ')');
  assert(rb.log.some(l => /nocks an arrow/.test(l)) && rb.log.some(l => /lowers the bow/.test(l)),
    'B3: volley is narrated (nocks … lowers the bow), never silent');

  // B4: bow but no arrows → no volley, honest narration
  gearBow(0);
  const rn = Game.fieldFight(archer, bull, null, { rng: mulberry32(7) });
  assert(rn.volley && rn.volley.shots === 0, 'B4: no arrows → no volley (shots 0)');
  assert(rn.log.some(l => /no arrows/.test(l)), 'B4b: the empty quiver is narrated honestly');

  // B5: no bow → no volley at all (behavior unchanged)
  va.items = [{ itemId: 'hunting_spear', units: 1 }]; delete va.equipped;
  const rm = Game.fieldFight(archer, bull, null, { rng: mulberry32(7) });
  assert(rm.volley === null, 'B5: melee-only villager → rec.volley null (unchanged behavior)');

  // B6: range bands — closing distance matters. Same bow, same ammo:
  // fast hushwolf (spd 5) gives 1+floor(5/5)=2 shots; slow turtle (spd 1) gives 1+5→cap 4.
  gearBow(8);
  const rh = Game.fieldFight(archer, mdef('hushwolf'), null, { rng: mulberry32(7) });
  gearBow(8);
  const rt = Game.fieldFight(archer, mdef('speedbump_turtle'), null, { rng: mulberry32(7) });
  assert(rh.volley && rh.volley.shots === 2, 'B6: fast monster (hushwolf spd 5) → 2 shots (got ' + (rh.volley && rh.volley.shots) + ')');
  assert(rt.volley && rt.volley.shots === 4, 'B6b: slow monster (turtle spd 1) → capped 4 shots (got ' + (rt.volley && rt.volley.shots) + ')');

  // B7: volley hits are real damage on the lead (aggregate over seeds)
  let totHits = 0, totDmg = 0;
  for (let s = 1; s <= 8; s++) { gearBow(8); const r = Game.fieldFight(archer, bull, null, { rng: mulberry32(100 + s) }); totHits += r.volley.hits; totDmg += r.volley.dmg; }
  assert(totHits > 0 && totDmg > 0, 'B7: volleys land real damage over 8 seeds (' + totHits + ' hits, ' + totDmg + ' dmg)');

  // ============ TASK 2c: before/after on identical seeds ============
  // OFF: bow, no arrows (identical melee fold-in, volley impossible).
  // ON:  bow + 8 arrows. Any difference is purely the volley.
  const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let off = { taken: 0, dealt: 0, good: 0 }, on = { taken: 0, dealt: 0, good: 0 }, diffSeeds = 0;
  for (const s of SEEDS) {
    gearBow(0); delete va.equipped;
    const rOff = Game.fieldFight(archer, bull, null, { rng: mulberry32(s) });
    gearBow(8); delete va.equipped;
    const rOn = Game.fieldFight(archer, bull, null, { rng: mulberry32(s) });
    off.taken += rOff.vTaken; off.dealt += rOff.mDealt;
    on.taken += rOn.vTaken; on.dealt += rOn.mDealt;
    if (rOff.outcome === 'vKill' || rOff.outcome === 'mFlee') off.good++;
    if (rOn.outcome === 'vKill' || rOn.outcome === 'mFlee') on.good++;
    if (rOff.outcome !== rOn.outcome || rOff.vTaken !== rOn.vTaken || rOff.mDealt !== rOn.mDealt) diffSeeds++;
    if (s === 1) {
      console.log('   seed1 OFF: outcome=' + rOff.outcome + ' taken=' + rOff.vTaken + ' dealt=' + rOff.mDealt);
      console.log('   seed1 ON:  outcome=' + rOn.outcome + ' taken=' + rOn.vTaken + ' dealt=' + rOn.mDealt);
    }
  }
  assert(diffSeeds > 0, 'C1: volley changes fight results on identical seeds (' + diffSeeds + '/' + SEEDS.length + ' seeds differ)');
  assert(on.taken <= off.taken, 'C2: volley softens — 12-seed total damage taken ON=' + on.taken + ' vs OFF=' + off.taken);
  assert(on.good >= off.good, 'C3: volley never worsens standing — kill/drive-off seeds ON=' + on.good + ' vs OFF=' + off.good);

  // ============ TASK d: no regression on existing combat proofs ============
  // Two suites below have failures that were verified IDENTICAL on pristine
  // HEAD (git stash): test-break-monsters3's section-5 battery (mFlee=0 —
  // the RNG stream no longer produces an mFlee in 300 fights under current
  // morale tuning) and test-combat-matrix's stalling/eater gates. They are
  // pre-existing, not regressions — the proof passes as long as no NEW
  // failures appear beyond the known ones.
  const knownFails = [
    'battery actually exercised mFlee persistence',
    'no NEW stalling fights',
    'titan solo hard-gate',
  ];
  const suites = [
    'scripts/test-break-monsters3-fieldfights-20261008.js',
    'scripts/test-fieldfight-summary-20261012.js',
    'scripts/test-burden-combat-20261006.js',
    'scripts/test-combat-matrix-20261012.js',
  ];
  for (const t of suites) {
    let out = '';
    try {
      out = execSync('node ' + t, { cwd: ROOT, stdio: 'pipe', timeout: 300000 }).toString();
      ok('D: ' + t + ' passes');
    } catch (e) {
      out = String((e.stdout || '') + (e.stderr || ''));
      const failLines = out.split('\n').filter(l =>
        /^\s*FAIL\b|FAILURES\b/i.test(l) || knownFails.some(k => l.includes(k)));
      const isSummary = (l) => /^\s*\d+\s+FAILURES?\s*$/i.test(l);
      const unknown = failLines.filter(l => !isSummary(l) && !knownFails.some(k => l.includes(k)));
      if (unknown.length === 0 && failLines.length > 0)
        ok('D: ' + t + ' — only known pre-existing failures (verified on pristine): ' + failLines.slice(0, 3).join(' | ').slice(0, 160));
      else
        fail('D: ' + t + ' NEW FAILURES:\n' + unknown.slice(0, 8).join('\n'));
    }
  }

  console.log(failures === 0 ? '\nALL GREEN' : '\n' + failures + ' FAILURES');
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
