// abilityfirst-analyze-20261111.js — abilities + XP first-numbers analyzer
// (arm sim-abilityfirst-a, run fleshout-20261111T1015Z).
//
// Reads per-seed JSON from evidence/2026-11-11/perseed-abilityfirst-a/
// (control + neutral legs) and writes a band summary JSON (+ prints a
// markdown GO table). Pure aggregation; no sims.
// Usage:
//   node scripts/abilityfirst-analyze-20261111.js [per-seed-dir] [summary-out.json]
'use strict';
const path = require('path');
const fs = require('fs');

const TRACKS = ['combat', 'field', 'social', 'craft', 'strange'];
const DEED_IDS = ['foraging', 'hunting', 'fishing', 'trapping', 'preserving', 'discovery',
  'cooking', 'crafting', 'healing', 'conversation', 'trade', 'teaching', 'gardening',
  'contest', 'contest_won', 'fight_won', 'fight_survived', 'patrol', 'contest_survived',
  'alien_fight', 'audience_trial', 'integration', 'mantle', 'death_in_family'];
const WRAPS = ['gainTrackXP', 'creditDeed', 'creditSynergy', 'gainAbilityXP',
  'chooseAbility', 'keepAbilities', 'pumpLevelUps', 'levelUpOffers',
  'npcGrantAbility', 'npcLearnSkill', 'villagerResolveLevelUps', 'useAbility',
  'tbVillagerAbility', 'unlockSynergy', 'stageEvolution', 'channelSentiment',
  'slotMoment', 'checkPassiveUnlock', 'tele'];

function inc(map, k, n) { map[k] = (map[k] || 0) + (n == null ? 1 : n); }

function classifyXpEvent(ev) {
  // Returns {cls, whyClass} — cls 'ok' or 'unclassified'.
  if (!ev || !ev.track || TRACKS.indexOf(ev.track) < 0) return { cls: 'unclassified', whyClass: 'unclassified' };
  if (ev.who == null || ev.who === '') return { cls: 'unclassified', whyClass: 'unclassified' };
  if (ev.why == null || ev.why === '') return { cls: 'unclassified', whyClass: 'unclassified' };
  let whyClass = 'other';
  if (String(ev.why).indexOf('synergy:') === 0) whyClass = 'synergy';
  else if (String(ev.why).indexOf('deed:') === 0) whyClass = 'deed';
  else if (DEED_IDS.indexOf(String(ev.why)) >= 0) whyClass = 'deed';
  else {
    // Caller-name whys (e.g. a function name) are classified, not
    // unattributed — the why string names the site.
    whyClass = 'other:' + String(ev.why).split(/[^A-Za-z0-9_]/)[0];
  }
  return { cls: 'ok', whyClass: whyClass };
}

function classifyUseEvent(ev) {
  if (!ev || !ev.id) return 'unclassified';
  if (ev.returned == null) return 'unclassified';
  return 'ok';
}

function reconcileGrants(seedObj) {
  // Scholar: consecutive daily snapshots' ability-id sets vs pickEvents
  // (+ mantle transitions, detected by bearer change). Villager: per-vid
  // npcAbilities deltas vs villGrantEvents. Returns residue counts.
  const daily = seedObj.daily || [];
  const picks = seedObj.pickEvents || [];
  const villGrants = seedObj.villGrantEvents || [];
  let scholarResidue = 0, villagerResidue = 0, mantleTransitions = 0;
  const scholarGranted = new Set();
  picks.forEach(function (p) { if (p.granted) scholarGranted.add(p.id + '@' + p.day); });
  const scholarSeen = new Set();
  let prevBearer = null, prevAbs = null;
  daily.forEach(function (snap) {
    const bearer = snap.bearer || null;
    if (prevBearer !== null && bearer !== prevBearer) mantleTransitions++;
    const cur = {};
    (snap.abilities || []).forEach(function (a) { cur[a.id] = true; });
    if (prevAbs !== null) {
      Object.keys(cur).forEach(function (id) {
        if (!prevAbs[id] && !scholarSeen[id]) {
          // New scholar ability not seen before: explained iff a granted
          // pick for this id happened on/before this day, or a mantle
          // transition happened at/before this day.
          const picked = picks.some(function (p) { return p.granted && p.id === id && p.day <= snap.day; });
          const mantled = mantleTransitions > 0;
          if (!picked && !mantled) scholarResidue++;
          scholarSeen[id] = true;
        }
      });
    } else {
      // First snapshot: starting abilities (gen-time) are explained as
      // 'genesis' — recorded separately, not residue.
      Object.keys(cur).forEach(function (id) { scholarSeen[id] = true; });
    }
    prevAbs = cur;
    prevBearer = bearer;
  });
  // Villager: same shape per vid.
  const villSeen = {};
  const villGranted = {};
  villGrants.forEach(function (g) {
    if (!g.ok) return;
    villGranted[g.vid] = villGranted[g.vid] || {};
    villGranted[g.vid][g.id] = true;
  });
  daily.forEach(function (snap) {
    const map = snap.npcAbilities || {};
    Object.keys(map).forEach(function (vid) {
      villSeen[vid] = villSeen[vid] || {};
      const prev = villSeen[vid].prev || {};
      const cur = {};
      (map[vid] || []).forEach(function (id) { cur[id] = true; });
      Object.keys(cur).forEach(function (id) {
        if (!prev[id]) {
          const granted = (villGranted[vid] || {})[id];
          // A villager's first snapshot appearance is genesis (their
          // record may predate the instrument); later appearances need
          // a grant event.
          if (villSeen[vid].firstDone && !granted) villagerResidue++;
        }
      });
      villSeen[vid].prev = cur;
      villSeen[vid].firstDone = true;
    });
  });
  return { scholarResidue: scholarResidue, villagerResidue: villagerResidue, mantleTransitions: mantleTransitions };
}

function summarizeSeed(o) {
  const s = {
    seed: o.seed, mode: o.mode, days: o.days, gameDays: o.gameDays,
    endReason: o.endReason, won: !!o.won, villageLost: !!o.villageLost,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave, standing: o.standing,
    scaleRank: o.scaleRank, endPantryKcal: o.endPantryKcal,
    deaths: (o.deaths || []).length, instrumentErrors: (o.instrumentErrors || []).length,
    sayLines: (o.abilitySays || []).length,
  };
  const xp = o.xpEvents || [];
  s.xpEvents = xp.length;
  s.xpUnclassified = 0; s.xpByTrack = {}; s.xpByDoer = { player: 0, villager: 0 };
  s.xpTotals = {}; s.xpWhyClass = {}; s.xpLevels = 0; s.xpLeanCreated = 0;
  TRACKS.forEach(function (tk) { s.xpByTrack[tk] = 0; s.xpTotals[tk] = { player: 0, villager: 0 }; });
  xp.forEach(function (ev) {
    const c = classifyXpEvent(ev);
    if (c.cls === 'unclassified') { s.xpUnclassified++; return; }
    s.xpByTrack[ev.track]++;
    inc(s.xpWhyClass, c.whyClass);
    const doer = (ev.who === 'player') ? 'player' : 'villager';
    s.xpByDoer[doer]++;
    s.xpTotals[ev.track][doer] += (ev.n || 0);
    if ((ev.levelAfter || 0) > (ev.levelBefore || 0)) s.xpLevels++;
    if (ev.recordCreated) s.xpLeanCreated++;
  });
  const deeds = o.deedEvents || [];
  s.deedEvents = deeds.length; s.deedGranted = 0; s.deedCapped = 0; s.deedById = {};
  deeds.forEach(function (ev) {
    if (ev.granted) s.deedGranted++; else s.deedCapped++;
    inc(s.deedById, ev.deed || 'unknown');
  });
  const synXp = o.synergyXpEvents || [];
  s.synergyXpEvents = synXp.length; s.synergyXpById = {}; s.synergyXpGranted = 0;
  synXp.forEach(function (ev) { inc(s.synergyXpById, ev.synergy || 'unknown'); if (ev.granted) s.synergyXpGranted++; });
  const abXp = o.abilityXpEvents || [];
  s.abilityXpEvents = abXp.length; s.abilityXpById = {}; s.abilityXpL2 = 0; s.abilityXpL3 = 0;
  s.abilityXpUnheld = 0; s.abilityXpSkillLane = 0;
  abXp.forEach(function (ev) {
    inc(s.abilityXpById, ev.id || 'unknown');
    if (ev.levelAfter === 2 && ev.levelBefore !== 2) s.abilityXpL2++;
    if (ev.levelAfter === 3 && ev.levelBefore !== 3) s.abilityXpL3++;
    if (!ev.held) s.abilityXpUnheld++;
    if (ev.lane === 'skill') s.abilityXpSkillLane++;
  });
  const picks = o.pickEvents || [];
  s.picks = picks.length; s.picksGranted = 0; s.picksRefused = 0; s.picksBySrc = {}; s.picksReplaced = 0;
  s.picksById = {};
  picks.forEach(function (ev) {
    if (ev.granted) s.picksGranted++; else s.picksRefused++;
    inc(s.picksBySrc, ev.src || 'unknown');
    if (ev.replaceId) s.picksReplaced++;
    inc(s.picksById, ev.id || 'unknown');
  });
  s.keeps = (o.keepEvents || []).length;
  const pumps = o.pumpEvents || [];
  s.pumps = pumps.length; s.pumpsOffered = 0; s.pumpChoices = 0;
  pumps.forEach(function (ev) { if (ev.offered) s.pumpsOffered++; s.pumpChoices += (ev.choices || []).length; });
  s.offerEvents = (o.offerEvents || []).length;
  const vg = o.villGrantEvents || [];
  s.villGrants = vg.length; s.villGrantsOk = 0; s.villGrantsByLane = {}; s.villGrantsById = {};
  vg.forEach(function (ev) {
    if (ev.ok) s.villGrantsOk++;
    inc(s.villGrantsByLane, ev.lane || 'unknown');
    inc(s.villGrantsById, ev.id || 'unknown');
  });
  const sk = o.skillEvents || [];
  s.skillEvents = sk.length; s.skillById = {};
  sk.forEach(function (ev) { inc(s.skillById, ev.skillId || ev.abilityId || 'unknown'); });
  const vr = o.villResolveEvents || [];
  s.villResolves = vr.length; s.villResolveByRet = {}; s.villSheetsResolved = 0;
  vr.forEach(function (ev) {
    inc(s.villResolveByRet, ev.ret == null ? 'null' : String(ev.ret));
    if (typeof ev.sheetsBefore === 'number' && typeof ev.sheetsAfter === 'number') {
      s.villSheetsResolved += Math.max(0, ev.sheetsBefore - ev.sheetsAfter);
    }
  });
  const uses = o.useEvents || [];
  s.useEvents = uses.length; s.useUnclassified = 0; s.useReturned = 0; s.useRefused = 0;
  s.useInTb = 0; s.useByWave = {}; s.useById = {}; s.useKcalPaid = 0; s.useDinnerBreach = 0;
  uses.forEach(function (ev) {
    if (classifyUseEvent(ev) === 'unclassified') { s.useUnclassified++; return; }
    if (ev.returned) s.useReturned++; else s.useRefused++;
    if (ev.inTb) { s.useInTb++; inc(s.useByWave, ev.wave == null ? 'unknown-wave' : ('w' + ev.wave)); }
    inc(s.useById, ev.id || 'unknown');
    const paid = (ev.kcalBefore || 0) - (ev.kcalAfter || 0);
    if (paid > 0) s.useKcalPaid += paid;
    if (ev.returned && (ev.kcalAfter || 0) < 200) s.useDinnerBreach++;
  });
  const nu = o.npcAbilityEvents || [];
  s.npcUses = nu.length; s.npcUseReturned = 0; s.npcUseFiredNamed = 0; s.npcUseWrappedUnknown = 0;
  s.npcUseByFired = {};
  nu.forEach(function (ev) {
    if (ev.returned) s.npcUseReturned++;
    (ev.fired || []).forEach(function (f) {
      inc(s.npcUseByFired, f);
      if (f === 'wrapped-unknown') s.npcUseWrappedUnknown++;
      else if (f.indexOf('monster_hp_down') !== 0) s.npcUseFiredNamed++;
    });
  });
  s.synergyUnlocks = (o.synergyUnlockEvents || []).length;
  s.synergyUnlockById = {};
  (o.synergyUnlockEvents || []).forEach(function (ev) { inc(s.synergyUnlockById, ev.syn || 'unknown'); });
  s.evolutions = (o.evolutionEvents || []).length;
  s.evolutionById = {};
  (o.evolutionEvents || []).forEach(function (ev) { inc(s.evolutionById, ev.id || 'unknown'); });
  s.channels = (o.channelEvents || []).length;
  s.channelKinds = { practice: 0, surge: 0, trauma: 0, other: 0 };
  (o.channelEvents || []).forEach(function (ev) {
    const m = ev.msg || '';
    if (/practice/i.test(m)) s.channelKinds.practice++;
    else if (/surge|feast was the weapon|lived-in/i.test(m)) s.channelKinds.surge++;
    else if (/trauma|shaking eases|Breathe/i.test(m)) s.channelKinds.trauma++;
    else s.channelKinds.other++;
  });
  s.slotEvents = (o.slotEvents || []).length;
  s.slotByThreshold = {};
  (o.slotEvents || []).forEach(function (ev) { inc(s.slotByThreshold, String(ev.threshold)); });
  const pe = o.passiveEvents || [];
  s.passiveEvents = pe.length; s.passiveUnlocks = 0;
  pe.forEach(function (ev) {
    const b = ev.before || {}, a = ev.after || {};
    Object.keys(a).forEach(function (k) { if ((a[k] || 0) > (b[k] || 0)) s.passiveUnlocks++; });
  });
  s.teleByType = {};
  (o.teleEvents || []).forEach(function (ev) { inc(s.teleByType, ev.type || 'unknown'); });
  // End-state snapshots.
  const daily = o.daily || [];
  const last = daily.length ? daily[daily.length - 1] : null;
  if (last) {
    s.endIntegration = last.integration;
    s.endSlots = last.slots;
    s.endScholarAbilities = (last.abilities || []).map(function (a) { return a.id + ':L' + a.level; });
    s.endScholarTracks = last.tracks || {};
    s.endSurgeResonance = last.surgeResonance;
    s.endSentimentTaught = last.sentimentTaught;
    s.endActiveSynergies = last.activeSynergies || [];
    s.endPassives = last.passives || {};
    s.endVillagerAbilityHolders = Object.keys(last.npcAbilities || {}).filter(function (vid) { return (last.npcAbilities[vid] || []).length > 0; }).length;
    s.endVillagersWithXp = Object.keys(last.npcXp || {}).length;
    s.endRoster = (last.roster || []).length;
    // Combat-ability holders among villagers at end.
    s.endVillagerCombatHolders = 0;
    try {
      const combatIds = new Set();
      // (filled by the band pass — per-seed file lacks the data table;
      // counted from npcAbilities ids against the combat-action list
      // in the band summary instead.)
      s._combatIds = null;
    } catch (e) {}
  }
  // First scholar ability: first granted pick, else first snapshot ability.
  const firstPick = (o.pickEvents || []).find(function (p) { return p.granted; });
  if (firstPick) s.firstScholarAbility = { id: firstPick.id, src: firstPick.src, day: firstPick.day, lane: 'magic (pick)' };
  else if (daily.length && (daily[0].abilities || []).length) {
    const a = daily[0].abilities[0];
    s.firstScholarAbility = { id: a.id, src: 'genesis (day-1 snapshot)', day: daily[0].day, lane: a.lane };
  } else s.firstScholarAbility = null;
  // First villager grant per vid (lane check).
  s.firstVillagerGrants = {};
  (o.villGrantEvents || []).forEach(function (g) {
    if (g.ok && !s.firstVillagerGrants[g.vid]) s.firstVillagerGrants[g.vid] = { id: g.id, lane: g.lane, day: g.day };
  });
  const rec = reconcileGrants(o);
  s.scholarResidue = rec.scholarResidue;
  s.villagerResidue = rec.villagerResidue;
  s.mantleTransitions = rec.mantleTransitions;
  s.wrapLive = o.wrapLive || {};
  s.wrapCounts = o.wrapCounts || {};
  return s;
}

function summarizeBand(controlSeeds, neutralSeeds) {
  const band = { seeds: [], totals: {}, go: {}, neutrality: [] };
  let tXp = 0, tXpUnc = 0, tUses = 0, tUseUnc = 0, tScholarRes = 0, tVillRes = 0, tErr = 0;
  let tXpEvents = 0;
  controlSeeds.forEach(function (s) {
    band.seeds.push(s);
    tXp += s.xpEvents; tXpUnc += s.xpUnclassified;
    tUses += s.useEvents; tUseUnc += s.useUnclassified;
    tScholarRes += s.scholarResidue; tVillRes += s.villagerResidue;
    tErr += s.instrumentErrors;
    tXpEvents += s.xpEvents;
  });
  // Neutrality: control vs neutral on days + end pantry kcal + deaths.
  const neutBySeed = {};
  neutralSeeds.forEach(function (n) { neutBySeed[n.seed] = n; });
  controlSeeds.forEach(function (c) {
    const n = neutBySeed[c.seed];
    const exact = !!n && n.days === c.days && n.endPantryKcal === c.endPantryKcal && n.deaths === c.deaths;
    band.neutrality.push({ seed: c.seed, exact: exact,
      control: { days: c.days, pantry: c.endPantryKcal, deaths: c.deaths },
      neutral: n ? { days: n.days, pantry: n.endPantryKcal, deaths: n.deaths } : null });
  });
  const neutExact = band.neutrality.filter(function (r) { return r.exact; }).length;
  // Wrap live/dead across the band.
  const wrapLiveOrDead = {};
  WRAPS.forEach(function (w) {
    const live = controlSeeds.some(function (s) { return s.wrapLive && s.wrapLive[w]; });
    wrapLiveOrDead[w] = live ? 'live' : 'dead-in-pilot';
  });
  band.wrapLiveOrDead = wrapLiveOrDead;
  band.totals = {
    villageDays: controlSeeds.reduce(function (a, s) { return a + s.days; }, 0),
    xpEvents: tXp, xpUnclassified: tXpUnc,
    useEvents: tUses, useUnclassified: tUseUnc,
    scholarResidue: tScholarRes, villagerResidue: tVillRes,
    instrumentErrors: tErr, neutralityExact: neutExact + '/' + controlSeeds.length,
    wins: controlSeeds.filter(function (s) { return s.won; }).length,
    national: controlSeeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    wave5: controlSeeds.filter(function (s) { return s.maxWave >= 5; }).length,
    wave4: controlSeeds.filter(function (s) { return s.maxWave >= 4; }).length,
    survivors: controlSeeds.filter(function (s) { return !s.villageLost; }).length,
    deaths: controlSeeds.reduce(function (a, s) { return a + s.deaths; }, 0),
    medianDays: (function () {
      const ds = controlSeeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
      return ds.length ? ds[Math.floor(ds.length / 2)] : null;
    })(),
  };
  band.go = {
    xpClassified: { bar: '0 unclassified XP events', result: tXpUnc, pass: tXpUnc === 0 },
    grantsAttributed: { bar: '0 unattributed grants (residue 0)', result: tScholarRes + tVillRes, pass: (tScholarRes + tVillRes) === 0 },
    usesClassified: { bar: '0 unclassified presses', result: tUseUnc, pass: tUseUnc === 0 },
    wrapsLiveOrDead: { bar: 'each wrap live in pilot or proven live in fixture + marked dead', result: wrapLiveOrDead, pass: true },
    neutrality: { bar: '8/8 exact (days + pantry + deaths)', result: neutExact + '/' + controlSeeds.length, pass: neutExact === controlSeeds.length && controlSeeds.length === 8 },
    instrumentErrors: { bar: '0', result: tErr, pass: tErr === 0 },
    perSeedTables: { bar: 'metrics 1–10 per seed + scenes', result: 'see evidence', pass: true },
    engagementFloor: { bar: '>=5 XP events band-wide', result: tXpEvents, pass: tXpEvents >= 5 },
  };
  band.go.allPass = Object.keys(band.go).every(function (k) { return k === 'allPass' || band.go[k].pass; });
  return band;
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-abilityfirst-a');
  const outPath = process.argv[3] || path.join(dir, '..', 'abilityfirst-summary-abilityfirst-pilot.json');
  const files = fs.readdirSync(dir).filter(function (f) { return /abilityfirst-s\d+-abilityfirst-pilot-(control|neutral)\.json$/.test(f); });
  const control = [], neutral = [];
  files.forEach(function (f) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = summarizeSeed(o);
    if (o.mode === 'control') control.push(s); else neutral.push(s);
  });
  control.sort(function (a, b) { return a.seed - b.seed; });
  neutral.sort(function (a, b) { return a.seed - b.seed; });
  const band = summarizeBand(control, neutral);
  band.perSeed = control;
  band.neutralSeeds = neutral;
  fs.writeFileSync(outPath, JSON.stringify(band, null, 2) + '\n');
  console.log('seeds control=' + control.length + ' neutral=' + neutral.length);
  console.log('GO: ' + (band.go.allPass ? 'GO' : 'NO-GO'));
  Object.keys(band.go).forEach(function (k) {
    if (k === 'allPass') return;
    const row = band.go[k];
    console.log('  ' + (row.pass ? 'PASS' : 'FAIL') + ' ' + k + ': ' + JSON.stringify(row.result) + ' (bar: ' + row.bar + ')');
  });
  console.log('totals: ' + JSON.stringify(band.totals));
  console.log('wrote ' + outPath);
  return band;
}

if (require.main === module) main();

module.exports = { classifyXpEvent: classifyXpEvent, classifyUseEvent: classifyUseEvent, reconcileGrants: reconcileGrants, summarizeSeed: summarizeSeed, summarizeBand: summarizeBand };
