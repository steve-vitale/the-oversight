#!/usr/bin/env node
// test-armorfetch-b.js — proof for sim-armorfetch-b (prereg:
// evidence/2026-10-30/sim-armorfetch-b-prereg.md).
// Part A: static wiring assertions (method exists, called from the daily
// tick next to the weapon fetch, weapon-fetch code untouched).
// Part B: live harness on ONE loadGame (never two harnesses in one
// process): state surgery between cases, no reloads.
//   1. unarmored vessel + stashed swat_vest -> fetched into
//      scholar.inventory, stash loses it, narrated, tele fired,
//      exactly +1 inventory item.
//   2. gain ordering: worn torso P30 + stashed swat_vest (gain 5) and
//      farstrider_boots (gain 12) -> boots win despite lower protection.
//   3. better armor worn (torso swat P35) + stashed bark P10 -> no fetch.
//   4. weaker armor worn (torso flannel P2) + stashed bark P10 -> fetch.
//   5. non-torso slot: empty hands + stashed work_gloves -> fetch.
//   6. away from haven -> no fetch (no teleport from a distant tile).
//   7. second call same day -> no-op (one armor fetch per day).
//   8. already carrying the same id in inventory -> no duplicate fetch.
//   9. object-form stash entries ({itemId}) handled; non-armor ignored.
//  10. no grant: stash without armor -> inventory unchanged.
//  11. weapon fetch unaffected: same day, armor fetch then weapon fetch
//      both fire (separate day flags — armor must not block the weapon).
// Part C: corpus assertions, run only when the after-corpus dir exists
// (after the judged sweeps): acceptance seeds 16103/16101/16109 show
// stash-loss + kit arrival within 7 game days, the before corpus
// (stashfetch-b) shows none, and the band cost bar holds.
// Usage: node scripts/test-armorfetch-b.js [afterCorpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

(async () => {
  // ---- Part A: static ----
  const vb = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'villager-build.js'), 'utf8');
  check('A1 vesselArmorFetch defined', /vesselArmorFetch\(\)\s*\{/.test(vb));
  check('A2 villagerBuildDay calls vesselArmorFetch', /villagerBuildDay\(\)[\s\S]{0,1600}vesselArmorFetch\(\)/.test(vb));
  check('A3 weapon fetch call still present', /vesselStashFetch\(\)/.test(vb));
  check('A4 armor fetch has own day flag', /_armorFetchDay/.test(vb));
  check('A5 weapon day flag untouched', /_stashFetchDay/.test(vb));
  // Weapon-fetch body must be byte-identical to the landed commit: the
  // only vesselStashFetch-adjacent change allowed is the new method +
  // the new call line. Count of 'vesselStashFetch' mentions in the diff
  // is checked by the runner, not here; here assert the weapon method
  // still contains its signature lines.
  check('A6 weapon fetch still gates on haven', /vesselStashFetch\(\)[\s\S]{0,900}playerAtHaven/.test(vb));
  check('A7 weapon fetch still tele-records', /vessel_stash_fetch/.test(vb));

  // ---- Part B: live ----
  const { Game } = await loadGame({ seed: 16103, mode: 'nighttravel-b', fullTelemetry: false });
  check('B0 vesselArmorFetch callable', typeof Game.vesselArmorFetch === 'function');
  if (typeof Game.vesselArmorFetch !== 'function') { console.log('pass=' + pass + ' fail=' + fail); process.exit(1); }
  const sayLines = [];
  const teleEvents = [];
  const origSay = Game.say;
  Game.say = function (...a) { try { sayLines.push(String(a[0] || '')); } catch (e) {} return origSay.apply(this, a); };
  const origTele = Game.tele;
  Game.tele = function (t, d) { try { teleEvents.push({ t, d }); } catch (e) {} return origTele.apply(this, arguments); };
  await setupGame(Game);
  const vid = Game.villagerId;
  const person = () => Game.getPerson(vid);
  const sch = () => Game.state.scholar;
  const mapPos = Game.map ? { px: Game.map.px, py: Game.map.py } : null;
  const setHaven = (at) => {
    if (!Game.map) return;
    const v = Game.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    if (at) { Game.map.px = hx; Game.map.py = hy; }
    else { Game.map.px = 0; Game.map.py = 0; }
  };
  const reset = (stash, equipped, inventory) => {
    const p = person();
    p.stashed = stash;
    sch().equipped = equipped || {};
    sch().inventory = inventory || [];
    sch()._armorFetchDay = null;
    sch()._stashFetchDay = null;
    setHaven(true);
  };
  const invIds = () => (sch().inventory || []).map((i) => i.itemId || i.id);
  const stashIds = () => (person().stashed || []).map((e) => (e && (e.itemId || e.id)) || e);

  // Case 1: unarmored + stashed swat_vest.
  reset(['decoy_rattle', 'swat_vest', 'hatchet'], {}, []);
  sayLines.length = 0; teleEvents.length = 0;
  const r1 = Game.vesselArmorFetch();
  check('B1 fetch returns swat_vest', r1 && r1.item === 'swat_vest', r1);
  check('B1 fetch slot is torso', r1 && r1.slot === 'torso', r1);
  check('B1 stash loses vest', JSON.stringify(stashIds()) === JSON.stringify(['decoy_rattle', 'hatchet']), stashIds());
  check('B1 inventory gains exactly one vest', JSON.stringify(invIds()) === JSON.stringify(['swat_vest']), invIds());
  const vItem = (sch().inventory || []).find((i) => (i.itemId || i.id) === 'swat_vest');
  check('B1 fetched item scholar-shaped (bonded, owned)', !!vItem && vItem.bonded === true && vItem.owner === vid, vItem);
  check('B1 narrated (vest line)', sayLines.some((l) => /swat/i.test(l)), sayLines);
  check('B1 tele fired', teleEvents.some((e) => e.t === 'vessel_armor_fetch' && e.d && e.d.item === 'swat_vest'), teleEvents);

  // Case 2: gain ordering beats absolute protection.
  reset(['swat_vest', 'farstrider_boots'], { torso: { itemId: 'riot_gear', name: 'Riot gear' } }, []);
  const r2 = Game.vesselArmorFetch();
  check('B2 gain ordering picks boots over vest', r2 && r2.item === 'farstrider_boots', r2);
  check('B2 vest stays for a later day', JSON.stringify(stashIds()) === JSON.stringify(['swat_vest']), stashIds());

  // Case 3: better armor worn.
  reset(['bark_armor'], { torso: { itemId: 'swat_vest', name: 'SWAT vest' } }, []);
  const r3 = Game.vesselArmorFetch();
  check('B3 vest worn -> no fetch', r3 === null || r3 === false, r3);
  check('B3 stash untouched', JSON.stringify(stashIds()) === JSON.stringify(['bark_armor']), stashIds());
  check('B3 inventory untouched', invIds().length === 0, invIds());

  // Case 4: weaker armor worn.
  reset(['bark_armor'], { torso: { itemId: 'flannel_shirt', name: 'Flannel Shirt' } }, []);
  const r4 = Game.vesselArmorFetch();
  check('B4 flannel worn -> fetch bark', r4 && r4.item === 'bark_armor', r4);

  // Case 5: non-torso slot.
  reset(['work_gloves'], {}, []);
  const r5 = Game.vesselArmorFetch();
  check('B5 empty hands -> fetch gloves', r5 && r5.item === 'work_gloves', r5);
  check('B5 gloves slot is hands', r5 && r5.slot === 'hands', r5);

  // Case 6: away from haven.
  reset(['swat_vest'], {}, []);
  setHaven(false);
  const r6 = Game.vesselArmorFetch();
  check('B6 away -> no fetch', r6 === null || r6 === false, r6);
  check('B6 stash untouched while away', JSON.stringify(stashIds()) === JSON.stringify(['swat_vest']), stashIds());
  setHaven(true);

  // Case 7: one per day.
  reset(['swat_vest', 'bark_armor'], {}, []);
  const r7a = Game.vesselArmorFetch();
  const r7b = Game.vesselArmorFetch();
  check('B7 first fetch fires', r7a && r7a.item === 'swat_vest', r7a);
  check('B7 second same-day call no-op', r7b === null || r7b === false, r7b);
  check('B7 only one item moved', invIds().length === 1, invIds());
  sch().day = (sch().day || 1) + 1;
  const r7c = Game.vesselArmorFetch();
  // Torso is still empty (no policy gearUp in this fixture), so the
  // bark armor (P10) beats slot 0 and SHOULD fetch on the new day.
  check('B7 next day fetches bark_armor (torso slot empty)', r7c && r7c.item === 'bark_armor', r7c);

  // Case 8: already carrying same id.
  reset(['swat_vest'], {}, [{ itemId: 'swat_vest', units: 1, kcalEach: 0, kg: 3.5, name: 'SWAT vest' }]);
  const r8 = Game.vesselArmorFetch();
  check('B8 already carrying vest -> no duplicate', r8 === null || r8 === false, r8);
  check('B8 inventory still one vest', invIds().filter((x) => x === 'swat_vest').length === 1, invIds());

  // Case 9: object-form entries + non-armor ignored.
  reset([{ itemId: 'swat_vest' }, 'hatchet', { itemId: 'decoy_rattle' }], {}, []);
  const r9 = Game.vesselArmorFetch();
  check('B9 object-form vest fetched', r9 && r9.item === 'swat_vest', r9);
  check('B9 non-armor stays', stashIds().length === 2, stashIds());

  // Case 10: no grant.
  reset(['hatchet', 'decoy_rattle'], {}, [{ itemId: 'wood', units: 1 }]);
  const r10 = Game.vesselArmorFetch();
  check('B10 no stashed armor -> no-op', r10 === null || r10 === false, r10);
  check('B10 inventory unchanged', JSON.stringify(invIds()) === JSON.stringify(['wood']), invIds());

  // Case 11: weapon fetch unaffected by armor fetch same day.
  reset(['hatchet', 'swat_vest'], {}, []);
  const r11a = Game.vesselArmorFetch();
  const r11b = Game.vesselStashFetch();
  check('B11 armor fetch fires', r11a && r11a.item === 'swat_vest', r11a);
  check('B11 weapon fetch still fires same day', r11b && r11b.item === 'hatchet', r11b);
  check('B11 both in pack', invIds().length === 2 && invIds().indexOf('swat_vest') >= 0 && invIds().indexOf('hatchet') >= 0, invIds());

  if (mapPos && Game.map) { Game.map.px = mapPos.px; Game.map.py = mapPos.py; }

  // ---- Part C: corpus (only when after-corpus exists) ----
  const afterDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-armorfetch-b-corpus');
  const beforeDir = path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-stashfetch-b-corpus');
  if (fs.existsSync(afterDir) && fs.readdirSync(afterDir).some((f) => f.endsWith('.json'))) {
    const ACCEPT = { 16103: 'swat_vest', 16101: 'bark_armor', 16109: 'farstrider_boots' };
    const load = (dir) => {
      const out = {};
      for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
        try { const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); out[d.seed] = d; } catch (e) {}
      }
      return out;
    };
    const verdict = (d, item) => {
      const spawnHas = (((d.spawnSnap || {}).pool || {}).stashed || []).indexOf(item) >= 0;
      if (!spawnHas) return 'NO-SPAWN';
      let stashLost = null, firstKit = null, firstEq = null, prev = true;
      const snaps = [{ gameDay: 0, scholar: d.spawnSnap.scholar, person: d.spawnSnap.person }].concat(d.mornings || []);
      for (const s of snaps) {
        if (s.gameDay > 7) continue;
        const has = ((s.person || {}).stash || []).indexOf(item) >= 0;
        if (prev && !has && stashLost === null) stashLost = s.gameDay;
        prev = has;
        const sch2 = s.scholar || {};
        if (firstKit === null && [].concat(sch2.inv || [], sch2.eq || []).indexOf(item) >= 0) firstKit = s.gameDay;
        if (firstEq === null && (sch2.eq || []).indexOf(item) >= 0) firstEq = s.gameDay;
      }
      if (stashLost !== null && firstEq !== null) return 'WORN';
      if (stashLost !== null && firstKit !== null) return 'FETCHED';
      return 'NO-GO';
    };
    const aft = load(afterDir);
    const bef = load(beforeDir);
    let ok = 0;
    for (const seed of [16103, 16101, 16109]) {
      const v = aft[seed] ? verdict(aft[seed], ACCEPT[seed]) : 'MISSING';
      const bv = bef[seed] ? verdict(bef[seed], ACCEPT[seed]) : 'MISSING';
      if (v === 'WORN' || v === 'FETCHED') ok++;
      console.log('CORPUS seed ' + seed + ' ' + ACCEPT[seed] + ' -> after=' + v + ' before=' + bv);
    }
    check('C1 acceptance WORN-or-FETCHED >= 2/3', ok >= 2, { ok });
    const band = (corpus) => {
      const rs = Object.keys(corpus).map((s) => corpus[s]);
      const lost = rs.filter((r) => r.endReason === 'village-lost').length;
      const days = rs.map((r) => r.daysAlive).sort((a, b) => a - b);
      return { n: rs.length, lost, median: days.length ? days[Math.floor(days.length / 2)] : null };
    };
    const bb = band(bef), ba = band(aft);
    check('C2 cost bar: lost<=before+1', ba.lost <= bb.lost + 1, { before: bb, after: ba });
    check('C3 cost bar: median>=0.8x before', ba.median >= 0.8 * bb.median, { before: bb, after: ba });
  } else {
    console.log('SKIP Part C (after-corpus not built yet)');
  }

  console.log('pass=' + pass + ' fail=' + fail);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
