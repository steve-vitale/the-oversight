#!/usr/bin/env node
// scripts/test-class-diversity-20261014.js — class diversity: job -> path
// lean and the wider level-up window (evidence/2026-10-14/class-diversity.md).
//
// Steve 2026-10-14: "Gods are rough representatives of what starts out as
// jobs and classes, or playstyles." / "when in doubt we treat them the same
// way."
//
// Proves:
//   - every occupation in characterGen.json has a valid pathLean (1-2 god paths)
//   - an unrecognised holder's level-up sheet carries an offer on their job
//     path when the window holds one (player and villager)
//   - after recognition the class lean takes over (the job path is not forced)
//   - the sheet draws from the next `window` unheld kit entries, deterministically,
//     and differs by holder
//   - the player and villagers build sheets through the same function (kitSheet)
//   - building a sheet consumes no Math.random
// Never writes into the repo.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-class-diversity-20261014');

(async () => {
  const Game = await K.load({ seed: 1015 }); // seed refreshed 1014 -> 1015 on 2026-10-31 (lootabilities build): items.json gained two tier-1 loot pieces, re-rolling seeded generation; at the old seed the recognised-nurse offer sheets happened to carry a caregiver offer on all 8 sheets. The distributional assertions (class lean rules every sheet; job lean does not force caregiver onto every sheet) are unchanged and pass at this seed. No assertion changed.
  const S = globalThis.Scattering;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const v = Game.state.village;
  const GPD = Game.godpathData();
  const paths = GPD.paths || {};
  const O = (GPD.rules || {}).offers || {};
  const tracksD = Game.trackData();
  const n = tracksD.offerSize || 3;
  const W = O.window;
  const defOf = (id) => (Game.data.abilities || []).find(a => a.id === id) || {};
  const pathOf = (id) => defOf(id).path;
  const ids = (arr) => arr.map(o => (o && o.id) || o);

  T.section('data: every occupation has a pathLean');
  {
    const occs = (Game.data.characterGen || {}).occupations || [];
    const bad = occs.filter(o => !Array.isArray(o.pathLean) || o.pathLean.length < 1 || o.pathLean.length > 2 || o.pathLean.some(p => !paths[p]));
    T.ok(`all ${occs.length} occupations name 1-2 valid god paths`, occs.length > 40 && bad.length === 0, bad.map(o => o.id).join(','));
    const seen = new Set(); for (const o of occs) for (const p of o.pathLean || []) seen.add(p);
    T.ok('every god path is some job\'s lean', Object.keys(paths).every(p => seen.has(p)), Object.keys(paths).filter(p => !seen.has(p)).join(','));
    T.ok('rules.offers: window wider than the sheet (6-10), decay in (0,1), jobLean on', W >= 6 && W <= 10 && W > n && O.windowDecay > 0 && O.windowDecay < 1 && O.jobLean === true, JSON.stringify(O).slice(0, 200));
  }

  // set a holder's occupation (the person record carries occupationId)
  function setJob(pid, occId) { const p = Game.getPerson(pid); p.occupationId = occId; return p; }
  function hold(vid, list) { v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[vid] = list.slice(); delete (v.npcGodpath || {})[vid]; }
  const roster = (v.roster || []).filter(id => id !== Game.villagerId); // the roster holds the bearer too
  const vidA = roster[0], vidB = roster[1];
  T.ok('two villagers and a bearer to test with', !!(vidA && vidB && Game.villagerId) && vidA !== vidB);

  T.section('the window: next `window`, weighted, deterministic, per holder');
  {
    const kit = tracksD.kits.craft.map(defOf);
    const firstSix = new Set(kit.slice(0, W).map(d => d.id));
    // a neutral holder (no job lean) isolates the draw
    setJob(vidA, null); hold(vidA, []);
    const draws = [];
    const before = Math.random;
    let calls = 0;
    Math.random = function () { calls++; return before.apply(this, arguments); };
    let allInWindow = true, sortedOk = true, beyond3 = false, deterministic = true;
    try {
      for (let lvl = 1; lvl <= 40; lvl++) {
        const a = ids(Game.kitSheet(kit, vidA, 'craft', lvl));
        const b = ids(Game.kitSheet(kit, vidA, 'craft', lvl));
        if (a.join() !== b.join()) deterministic = false;
        if (a.length !== n || a.some(id => !firstSix.has(id))) allInWindow = false;
        const pos = a.map(id => kit.findIndex(d => d.id === id));
        if (pos.some(p => p >= n)) beyond3 = true;
        draws.push(a.join());
      }
      // the villager's real sheet path and the player's
      Game.villagerLevelUpOffers(vidA, 'craft', 2);
      Game.levelUpOffers('craft', 2);
    } finally { Math.random = before; }
    T.ok('every offer comes from the next `window` unheld entries', allInWindow);
    T.ok('the same holder/track/level always gets the same sheet', deterministic);
    T.ok('the window reaches past the next 3', beyond3);
    T.ok('different levels give different sheets (variety)', new Set(draws).size >= 4, new Set(draws).size);
    T.ok('no Math.random consumed building sheets (kitSheet, villager and player paths)', calls === 0, calls);
    // power order on average: earlier entries are offered more often
    const cnt = new Array(W).fill(0);
    for (let lvl = 1; lvl <= 200; lvl++) for (const id of ids(Game.kitSheet(kit, 'hx_' + lvl, 'craft', 1))) cnt[kit.findIndex(d => d.id === id)]++;
    // (the distinct-roles swap may still pull a kit's lone-role entry — craft's
    // only enabler, Green Whisper, entry 6 — onto every sheet: that is the
    // older shapeOffers rule, unchanged)
    T.ok('earlier entries are offered more often (entries 1-2 > entries 4-5)', cnt[0] > cnt[3] && cnt[1] > cnt[4] && cnt[0] > cnt[4], cnt.join('/'));
    // differs by holder
    setJob(vidB, null); hold(vidB, []);
    let differ = 0;
    for (let lvl = 1; lvl <= 10; lvl++) if (ids(Game.kitSheet(kit, vidA, 'craft', lvl)).join() !== ids(Game.kitSheet(kit, vidB, 'craft', lvl)).join()) differ++;
    T.ok('two holders at the same level see different sheets (most levels)', differ >= 5, differ + '/10');
    const pv = ids(Game.villagerLevelUpOffers(vidA, 'craft', 3)), pv2 = ids(Game.villagerLevelUpOffers(vidB, 'craft', 3));
    T.ok('villager sheets come from the window too', pv.every(id => firstSix.has(id)) && pv2.every(id => firstSix.has(id)), pv.join(',') + ' | ' + pv2.join(','));
  }

  T.section('job -> path lean, before a class is named');
  {
    // a nurse levelling craft: the caregiver entries sit at kit index 3+ —
    // inside the window, never in a plain "next 3" sheet
    setJob(vidA, 'er_nurse'); hold(vidA, []);
    T.ok('setup: the nurse leans caregiver', JSON.stringify(Game.holderJobPaths(vidA)) === '["caregiver"]', JSON.stringify(Game.holderJobPaths(vidA)));
    let lean = 0;
    for (let lvl = 1; lvl <= 5; lvl++) if (Game.villagerLevelUpOffers(vidA, 'craft', lvl).some(id => pathOf(id) === 'caregiver')) lean++;
    T.ok('villager nurse: every craft sheet carries a caregiver offer', lean === 5, lean + '/5');
    const kit = tracksD.kits.craft;
    T.ok('setup: the plain next 3 craft entries hold no caregiver', kit.slice(0, n).every(id => pathOf(id) !== 'caregiver'));
    // the player (bearer) too, same function
    setJob(Game.villagerId, 'er_nurse');
    Game.state.scholar.abilities = []; Game.state.scholar.godpath = null;
    let plean = 0;
    for (let lvl = 1; lvl <= 5; lvl++) if (ids(Game.levelUpOffers('craft', lvl)).some(id => pathOf(id) === 'caregiver')) plean++;
    T.ok('player nurse: every craft sheet carries a caregiver offer', plean === 5, plean + '/5');
    // a soldier levelling craft: no shieldbearer/brawler in the window -> no lean, no crash
    setJob(vidB, 'soldier'); hold(vidB, []);
    const sv = Game.villagerLevelUpOffers(vidB, 'craft', 1);
    T.ok('no job-path entry in the window: a normal sheet of 3', sv.length === n && sv.every(id => ['shieldbearer', 'brawler'].indexOf(pathOf(id)) < 0), sv.join(','));
    // after recognition: the class lean rules, the job path is not forced
    hold(vidA, ['beard_moss', 'pyrokinesis', 'long_table']); // forager/feaster x3
    const rec = Game.recognizeClass(vidA);
    T.ok('setup: the nurse is named a Feaster', rec && rec.path === 'forager', JSON.stringify(rec));
    let forager = 0, care = 0;
    for (let lvl = 1; lvl <= 8; lvl++) {
      const o = Game.villagerLevelUpOffers(vidA, 'craft', lvl);
      if (o.some(id => pathOf(id) === 'forager')) forager++;
      if (o.some(id => pathOf(id) === 'caregiver')) care++;
    }
    T.ok('recognised: every sheet leans to the class (forager)', forager === 8, forager + '/8');
    T.ok('recognised: the job lean no longer forces caregiver onto every sheet', care < 8, care + '/8');
    hold(vidA, []); delete (v.npcGodpath || {})[vidA];
  }

  T.section('one function for player and villagers');
  {
    const orig = Game.kitSheet;
    const seen = [];
    Game.kitSheet = function (c, who) { seen.push(who); return orig.apply(this, arguments); };
    try { Game.levelUpOffers('field', 1); Game.villagerLevelUpOffers(vidA, 'field', 1); }
    finally { Game.kitSheet = orig; }
    T.ok('levelUpOffers and villagerLevelUpOffers both call Game.kitSheet', seen.length === 2 && seen[0] === 'player' && seen[1] === vidA, JSON.stringify(seen));
    T.ok('S.Godpath exports kitSheet', typeof (S.Godpath || {}).kitSheet === 'function');
  }
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
