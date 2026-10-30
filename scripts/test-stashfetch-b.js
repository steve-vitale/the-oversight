#!/usr/bin/env node
// test-stashfetch-b.js — proof for sim-stashfetch-b (prereg:
// evidence/2026-10-30/sim-stashfetch-b-prereg.md).
// Part A: static wiring assertions (method exists, called from the daily
// tick, villagerGearUp gates untouched).
// Part B: live harness on ONE loadGame (never two harnesses in one
// process): state surgery between cases, no reloads.
//   1. unarmed vessel + stashed hatchet -> fetched into scholar.inventory,
//      stash loses it, narrated, tele fired, exactly +1 inventory item.
//   2. best-of-stash: ['stone_knife','hatchet'] unarmed -> hatchet only.
//   3. better weapon wielded (hunting_spear 30) -> no fetch.
//   4. weaker weapon wielded (sharpened_stick 5) -> fetch.
//   5. away from haven -> no fetch (no teleport from a distant tile).
//   6. second call same day -> no-op (one fetch per day; sleeps double).
//   7. already carrying the same id in inventory -> no duplicate fetch.
//   8. object-form stash entries ({itemId}) handled; non-weapons ignored.
//   9. no grant: stash without weapons -> inventory unchanged.
// Part C: corpus assertions, run only when the after-corpus dir exists
// (after the judged sweeps): acceptance seeds 16103/16106/16110 show
// stash-loss + kit arrival inside the spawn-vessel window, and the band
// cost bar holds vs the hatchequip baseline corpus.
// Usage: node scripts/test-stashfetch-b.js [afterCorpusDir]
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
  const gj = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
  check('A1 vesselStashFetch defined', /vesselStashFetch\(\)\s*\{/.test(vb));
  check('A2 villagerBuildDay calls vesselStashFetch', /villagerBuildDay\(\)[\s\S]{0,1200}vesselStashFetch\(\)/.test(vb));
  check('A3 villagerGearUp gate untouched', gj.indexOf('if (wb > 0 || !acquire) return;') >= 0);
  const va = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'villager-agency.js'), 'utf8');
  const acqTrue = (gj.match(/villagerGearUp\([^)]*,\s*true\)/g) || []).length +
    (va.match(/villagerGearUp\([^)]*,\s*true\)/g) || []).length;
  check('A4 exactly two acquire=true call sites still (NPC departures)', acqTrue === 2, acqTrue);

  // ---- Part B: live ----
  const { Game } = await loadGame({ seed: 16103, mode: 'nighttravel-b', fullTelemetry: false });
  check('B0 vesselStashFetch callable', typeof Game.vesselStashFetch === 'function');
  if (typeof Game.vesselStashFetch !== 'function') { console.log('pass=' + pass + ' fail=' + fail); process.exit(1); }
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
  // Haven position: save map pos, force haven for the at-haven cases.
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
    sch()._stashFetchDay = null;
    setHaven(true);
  };
  const invIds = () => (sch().inventory || []).map((i) => i.itemId || i.id);
  const stashIds = () => (person().stashed || []).map((e) => (e && (e.itemId || e.id)) || e);

  // Case 1: unarmed + stashed hatchet.
  reset(['decoy_rattle', 'hatchet', 'swat_vest'], {}, []);
  sayLines.length = 0; teleEvents.length = 0;
  const r1 = Game.vesselStashFetch();
  check('B1 fetch returns hatchet', r1 && r1.item === 'hatchet', r1);
  check('B1 stash loses hatchet', JSON.stringify(stashIds()) === JSON.stringify(['decoy_rattle', 'swat_vest']), stashIds());
  check('B1 inventory gains exactly one hatchet', JSON.stringify(invIds()) === JSON.stringify(['hatchet']), invIds());
  const hatItem = (sch().inventory || []).find((i) => (i.itemId || i.id) === 'hatchet');
  check('B1 fetched item scholar-shaped (bonded, owned)', !!hatItem && hatItem.bonded === true && hatItem.owner === vid, hatItem);
  check('B1 narrated (hatchet line)', sayLines.some((l) => /hatchet/i.test(l)), sayLines);
  check('B1 tele fired', teleEvents.some((e) => e.t === 'vessel_stash_fetch' && e.d && e.d.item === 'hatchet'), teleEvents);

  // Case 2: best of stash.
  reset(['stone_knife', 'hatchet'], {}, []);
  const r2 = Game.vesselStashFetch();
  check('B2 best stashed weapon fetched', r2 && r2.item === 'hatchet', r2);
  check('B2 weaker stashed weapon stays', JSON.stringify(stashIds()) === JSON.stringify(['stone_knife']), stashIds());

  // Case 3: better weapon wielded.
  reset(['hatchet'], { melee: { itemId: 'hunting_spear', name: 'Hunting spear' } }, []);
  const r3 = Game.vesselStashFetch();
  check('B3 spear wielded -> no fetch', r3 === null || r3 === false, r3);
  check('B3 stash untouched', JSON.stringify(stashIds()) === JSON.stringify(['hatchet']), stashIds());
  check('B3 inventory untouched', invIds().length === 0, invIds());

  // Case 4: weaker weapon wielded.
  reset(['hatchet'], { melee: { itemId: 'sharpened_stick', name: 'Sharpened stick' } }, []);
  const r4 = Game.vesselStashFetch();
  check('B4 stick wielded -> fetch', r4 && r4.item === 'hatchet', r4);

  // Case 5: away from haven.
  reset(['hatchet'], {}, []);
  setHaven(false);
  const r5 = Game.vesselStashFetch();
  check('B5 away -> no fetch', r5 === null || r5 === false, r5);
  check('B5 stash untouched while away', JSON.stringify(stashIds()) === JSON.stringify(['hatchet']), stashIds());
  setHaven(true);

  // Case 6: one per day.
  reset(['hatchet', 'stone_knife'], {}, []);
  const r6a = Game.vesselStashFetch();
  const r6b = Game.vesselStashFetch();
  check('B6 first fetch fires', r6a && r6a.item === 'hatchet', r6a);
  check('B6 second same-day call no-op', r6b === null || r6b === false, r6b);
  check('B6 only one item moved', invIds().length === 1, invIds());
  sch().day = (sch().day || 1) + 1;
  const r6c = Game.vesselStashFetch();
  // Equipped melee is still empty (no policy gearUp in this fixture), so
  // the stone_knife (12) beats slot 0 and SHOULD fetch on the new day.
  check('B6 next day fetches stone_knife (equipped slot empty)', r6c && r6c.item === 'stone_knife', r6c);

  // Case 7: already carrying same id.
  reset(['hatchet'], {}, [{ itemId: 'hatchet', units: 1, kcalEach: 0, kg: 0.7, name: 'Hatchet' }]);
  const r7 = Game.vesselStashFetch();
  check('B7 already carrying hatchet -> no duplicate', r7 === null || r7 === false, r7);
  check('B7 inventory still one hatchet', invIds().filter((x) => x === 'hatchet').length === 1, invIds());

  // Case 8: object-form entries + non-weapons ignored.
  reset([{ itemId: 'hatchet' }, 'swat_vest', { itemId: 'decoy_rattle' }], {}, []);
  const r8 = Game.vesselStashFetch();
  check('B8 object-form hatchet fetched', r8 && r8.item === 'hatchet', r8);
  check('B8 non-weapons stay', stashIds().length === 2, stashIds());

  // Case 9: no grant.
  reset(['swat_vest', 'decoy_rattle'], {}, [{ itemId: 'wood', units: 1 }]);
  const r9 = Game.vesselStashFetch();
  check('B9 no stashed weapon -> no-op', r9 === null || r9 === false, r9);
  check('B9 inventory unchanged', JSON.stringify(invIds()) === JSON.stringify(['wood']), invIds());

  if (mapPos && Game.map) { Game.map.px = mapPos.px; Game.map.py = mapPos.py; }

  // ---- Part C: corpus (only when after-corpus exists) ----
  const afterDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-stashfetch-b-corpus');
  const beforeDir = path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-hatchequip-b-corpus');
  if (fs.existsSync(afterDir) && fs.readdirSync(afterDir).some((f) => f.endsWith('.json'))) {
    const ACCEPT = { 16103: 16, 16106: 18, 16110: 9 };
    const load = (dir) => {
      const out = {};
      for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
        try { const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); out[d.seed] = d; } catch (e) {}
      }
      return out;
    };
    const verdict = (d, kc) => {
      const spawnHatchet = (((d.spawnSnap || {}).pool || {}).stashed || []).indexOf('hatchet') >= 0;
      let stashLost = null, firstKit = null, firstEq = null, prev = spawnHatchet;
      const snaps = [{ gameDay: 0, scholar: d.spawnSnap.scholar, person: d.spawnSnap.person }].concat(d.mornings || []);
      for (const s of snaps) {
        const has = ((s.person || {}).stash || []).indexOf('hatchet') >= 0;
        if (prev && !has && stashLost === null) stashLost = s.gameDay;
        prev = has;
        const sch2 = s.scholar || {};
        if (firstKit === null && [].concat(sch2.inv || [], sch2.eq || []).indexOf('hatchet') >= 0) firstKit = s.gameDay;
        if (firstEq === null && (sch2.eq || []).indexOf('hatchet') >= 0) firstEq = s.gameDay;
      }
      const inW = (x) => x !== null && x < kc;
      if (inW(stashLost) && inW(firstEq)) return 'EQUIPPED';
      if (inW(stashLost) && inW(firstKit)) return 'FETCHED';
      return 'NO-GO';
    };
    const aft = load(afterDir);
    let eq = 0, fe = 0;
    for (const seed of [16103, 16106, 16110]) {
      const v = aft[seed] ? verdict(aft[seed], ACCEPT[seed]) : 'MISSING';
      if (v === 'EQUIPPED') eq++;
      if (v === 'FETCHED') fe++;
      console.log('CORPUS seed ' + seed + ' -> ' + v);
    }
    check('C1 acceptance EQUIPPED>=2 or FETCHED>=2', eq >= 2 || fe >= 2, { eq, fe });
    const band = (corpus) => {
      const rs = Object.keys(corpus).map((s) => corpus[s]);
      const lost = rs.filter((r) => r.endReason === 'village-lost').length;
      const days = rs.map((r) => r.daysAlive).sort((a, b) => a - b);
      return { n: rs.length, lost, median: days.length ? days[Math.floor(days.length / 2)] : null };
    };
    const bb = band(load(beforeDir)), ba = band(aft);
    check('C2 cost bar: lost<=before+1', ba.lost <= bb.lost + 1, { before: bb, after: ba });
    check('C3 cost bar: median>=0.8x before', ba.median >= 0.8 * bb.median, { before: bb, after: ba });
  } else {
    console.log('SKIP Part C (after-corpus not built yet)');
  }

  console.log('pass=' + pass + ' fail=' + fail);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
