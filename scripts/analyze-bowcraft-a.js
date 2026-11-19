// analyze-bowcraft-a.js — analyzer + judge, arm sim-bowcraft-a.
// BUILD: the bow-craft verb never fires (finding #2597). Judges the
// BOWCRAFT fix before/after on identical seeds from
// bowcraft-driver-a.js corpora (two legs, ctl vs arm, 8 seeds each,
// 150d, competent policy).
//
// Attribution (per seed): every bow's first appearance in a
// villager's personal union (held + stashed) after the day-1
// baseline is attributed to exactly one of:
//   starting  — present in the day-1 baseline census
//   crafted   — a weapon_craft tele event (ok) for that vid+item on
//               the appearance day (the home duty; stageBow is off)
//   looted    — a villagerKillLoot drop of that item for that vid on
//               the appearance day
//   spawned   — the bow arrives on a villager new to the roster
//   moved     — a gift / armory take the same day (another
//               villager's union loses the same id, or the stash
//               pile loses it), i.e. redistribution, not new supply
//   unexplained — none of the above; named and counted, never hidden
// Moved-attribution is same-day id matching, not instance tracking
// (bows carry no serial numbers): a same-day loss+gain of one id is
// read as one move. The pile is tracked the same way (deposits in,
// takes out); a pile gain with no unmatched villager loss is
// pile-unexplained, a pile loss with no unmatched villager gain is
// pile-unexplained the other way.
//
// CENSUS CADENCE (harness property, inherited from the bowopen
// driver block): the census rides policy.daily's finally block, so
// it fires once per OBSERVED day-boundary — and the scholar day can
// roll past a game day between boundaries (a 5-day smoke observes
// days [2,4,5,6]: day 3 is never a boundary). Event attribution
// therefore matches events in the GAP WINDOW (prevRowDay, rowDay],
// not on the row day exactly: a bow crafted on an unobserved day
// appears in the next observed row and is still its craft.
//
// Primary (frozen, prereg): attribution completeness =
// (starting + attributed appearances) / (starting + all appearances);
// pool floor = departures >= 100; craft measured = the
// eligible-villager-day denominator is recorded on every census row
// AND the tele wrap is proven live (craft events seen, or no
// unexplained earth-bow appearance could hide a missed craft).
// DIAG-GO iff completeness >= 0.90 AND departures >= 100 AND craft
// measured. (The fourth prereg condition — a named next arm — is a
// run-level step recorded in the evidence file, not in this judge.)
//
// Usage:
//   node scripts/analyze-bowcraft-a.js --dir DIR [--out FILE] [--no-judge]
//   node scripts/analyze-bowcraft-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RANGED = ['sling', 'crude_bow', 'bow', 'crossbow', 'phase_sling', 'starfall_bow', 'searcaster', 'apex_bow'];
const RANGED_SET = new Set(RANGED);
const EARTH_BOWS = ['sling', 'crude_bow', 'bow', 'crossbow'];
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}
function unionOf(row, vid) {
  const u = new Set();
  const held = (row.held || {})[vid] || [];
  const stashed = (row.stashed || {})[vid] || [];
  for (const id of held) if (RANGED_SET.has(id)) u.add(id);
  for (const id of stashed) if (RANGED_SET.has(id)) u.add(id);
  return u;
}
function pileBows(row) {
  const out = {};
  const pile = (row && row.stashWeapons) || {};
  for (const id of Object.keys(pile)) if (RANGED_SET.has(id)) out[id] = pile[id] | 0;
  return out;
}

function seedStats(d) {
  const st = { seed: d.seed != null ? d.seed : null, days: d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0),
    gameDays: d.gameDays != null ? d.gameDays : 0, endReason: d.endReason || null,
    scaleRank: d.scaleRank || null, won: !!d.won, maxWave: (d.maxWave | 0) || 0,
    errors: (d.instrumentErrors || []).length, launchpartyOn: !!d.launchpartyOn, bowopenOn: !!d.bowopenOn,
    bowcraftOn: !!d.bowcraftOn, bowcraftPresent: !!d.bowcraftPresent,
    // attribution
    starting: 0, startingById: {},
    appearances: 0, attributed: { crafted: 0, looted: 0, spawned: 0, moved: 0 }, unexplained: 0,
    appearancesDetail: [], // {day, vid, item, source, note}
    disappearances: 0, diedWith: 0, deposited: 0, pileUnexplainedGain: 0, pileUnexplainedLoss: 0,
    // craft
    craftEvents: 0, craftOk: 0, craftFail: 0, craftByItem: {}, craftByVid: {},
    craftBowEvents: 0, craftBowOk: 0, // bow / crude_bow rungs only (the BOWCRAFT verb)
    eligibleDays: 0, knowsBowDays: 0, // sums over census rows
    rangedlessEligibleDays: 0, spearArmedKnowsDays: 0, // BOWCRAFT denominators
    deathsTotal: 0,
    // loot / moves
    lootDrops: 0, lootBowDrops: 0, lootBowById: {},
    gearMoves: 0, gearBowMoves: 0,
    // departures
    departs: 0, bowless: 0, bowlessSourced: 0, bowlessNoSource: 0, bowlessSpear: 0,
    departsWave4: 0, bowlessWave4: 0,
    // stock series (day -> villageBowTotal, stash bow units)
    stockSeries: [],
    // encounters (volley-capable at entry, expedition wave-4+)
    encMeetings: 0, encRanged: 0,
    // wall
    communityLost: ['village-lost', 'village-dead', 'pop-zero'].includes(d.endReason) ? 1 : 0,
    national: (RANK_ORDER[d.scaleRank] || 0) >= 2 ? 1 : 0,
    starvation: 0, starvationVillager: 0 };
  for (const death of (d.deaths || [])) {
    st.deathsTotal++;
    if (isStarvation(death)) { st.starvation++; if (!death.player) st.starvationVillager++; }
  }
  // ---- events indexed by day ----
  const craftByDay = {}; // day -> [{vid, item, ok}]
  const lootByDay = {}; // day -> [{vid, item}]
  const gearByDay = {}; // day -> [{vid, item, via, from}]
  for (const ev of (d.bowEvents || [])) {
    if (!ev || ev.day == null) continue;
    const day = ev.day | 0;
    if (ev.type === 'weapon_craft') {
      if (ev.item && RANGED_SET.has(ev.item)) {
        st.craftEvents++;
        if (ev.ok) { st.craftOk++; } else { st.craftFail++; }
        st.craftByItem[ev.item] = st.craftByItem[ev.item] || { ok: 0, fail: 0 };
        st.craftByItem[ev.item][ev.ok ? 'ok' : 'fail']++;
        if (ev.ok && ev.vid) st.craftByVid[ev.vid] = (st.craftByVid[ev.vid] || 0) + 1;
        if (ev.item === 'bow' || ev.item === 'crude_bow') {
          st.craftBowEvents++;
          if (ev.ok) st.craftBowOk++;
        }
      }
      (craftByDay[day] = craftByDay[day] || []).push({ vid: ev.vid || null, item: ev.item || null, ok: !!ev.ok });
    } else if (ev.type === 'villager_gear') {
      if (ev.item && RANGED_SET.has(ev.item)) {
        st.gearBowMoves++;
        (gearByDay[day] = gearByDay[day] || []).push({ vid: ev.vid || null, item: ev.item, via: ev.via || null, from: ev.from || null });
      }
      st.gearMoves++;
    }
  }
  for (const k of (d.bowKills || [])) {
    if (!k || k.day == null) continue;
    st.lootDrops++;
    if (k.dropId && RANGED_SET.has(k.dropId)) {
      st.lootBowDrops++;
      st.lootBowById[k.dropId] = (st.lootBowById[k.dropId] || 0) + 1;
      (lootByDay[k.day | 0] = lootByDay[k.day | 0] || []).push({ vid: k.vid || null, item: k.dropId });
    }
  }
  // ---- baseline: starting gear ----
  const baseline = d.bowBaseline || null;
  const holdings = {}; // vid -> Set(ids)
  const seenRoster = new Set();
  if (baseline) {
    for (const vid of (baseline.roster || [])) seenRoster.add(vid);
    for (const vid of Object.keys(baseline.held || {})) {
      const u = unionOf(baseline, vid);
      if (u.size) { holdings[vid] = u; st.starting += u.size; for (const id of u) st.startingById[id] = (st.startingById[id] || 0) + 1; }
    }
    for (const vid of Object.keys(baseline.stashed || {})) {
      const u = unionOf(baseline, vid);
      const prev = holdings[vid] || new Set();
      for (const id of u) if (!prev.has(id)) { prev.add(id); st.starting++; st.startingById[id] = (st.startingById[id] || 0) + 1; }
      if (prev.size) holdings[vid] = prev;
    }
    st.stockSeries.push({ day: baseline.day | 0, total: baseline.villageBowTotal | 0,
      pile: pileBows(baseline), knows: baseline.nKnowsBow | 0, eligible: baseline.nWeaponlessKnowsBow | 0 });
  }
  // ---- walk the census in day order ----
  const rows = (d.bowCensus || []).slice().sort(function (a, b) { return (a.day | 0) - (b.day | 0); });
  let prevPile = baseline ? pileBows(baseline) : {};
  let prevDay = baseline ? (baseline.day | 0) : null;
  // Gap-window event lookup: events dated (prevDay, day] explain
  // appearances in the row for `day` (see the cadence note above).
  function eventsInWindow(byDay, fromDay, toDay) {
    const out = [];
    for (const k of Object.keys(byDay || {})) {
      const kd = parseInt(k, 10);
      if (kd > fromDay && kd <= toDay) for (const e of byDay[k]) out.push(e);
    }
    return out;
  }
  for (const row of rows) {
    if (!row || row.day == null) continue;
    const day = row.day | 0;
    // The day-1 daily row duplicates the baseline day (same state,
    // end of day 1); pile state refresh only, no attribution.
    if (prevDay != null && day === prevDay && baseline) { prevPile = pileBows(row); continue; }
    const windowStart = (prevDay != null ? prevDay : day - 1);
    const windowCraft = eventsInWindow(craftByDay, windowStart, day);
    const windowLoot = eventsInWindow(lootByDay, windowStart, day);
    const windowGear = eventsInWindow(gearByDay, windowStart, day);
    prevDay = day;
    st.eligibleDays += (row.nWeaponlessKnowsBow | 0);
    st.knowsBowDays += (row.nKnowsBow | 0);
    st.rangedlessEligibleDays += (row.nRangedlessKnowsBow | 0);
    st.spearArmedKnowsDays += (row.nSpearArmedKnowsBow | 0);
    const pile = pileBows(row);
    const pileLost = {}; // id -> units lost this day (vs prev row)
    const pileGained = {};
    for (const id of Object.keys(prevPile)) if ((pile[id] | 0) < prevPile[id]) pileLost[id] = prevPile[id] - (pile[id] | 0);
    for (const id of Object.keys(pile)) if ((pile[id] | 0) > (prevPile[id] | 0)) pileGained[id] = (pile[id] | 0) - (prevPile[id] | 0);
    // Losses and gains per vid (union diffs). A loss matched by a
    // same-day gain elsewhere is a transfer, not a disappearance;
    // a loss matched by a pile gain is a deposit. The diff runs
    // over every roster vid's CURRENT union, not just vids already
    // in holdings — a villager holding their first bow is a gain
    // too (a known vid's first bow is not a spawn).
    const losses = {}; // vid -> [ids lost]
    const gains = {}; // vid -> [ids gained]
    const rosterSet = new Set(row.roster || []);
    const nowUnions = {};
    for (const vid of (row.roster || [])) {
      const u = unionOf(row, vid);
      if (u.size) nowUnions[vid] = u;
    }
    for (const vid of Object.keys(holdings)) {
      if (!rosterSet.has(vid)) { // left the roster: the bow dies with them
        const lost = holdings[vid];
        st.disappearances += lost.size;
        st.diedWith += lost.size;
        delete holdings[vid];
        continue;
      }
      const now = nowUnions[vid] || new Set();
      const prev = holdings[vid];
      for (const id of prev) if (!now.has(id)) (losses[vid] = losses[vid] || []).push(id);
      for (const id of now) if (!prev.has(id)) (gains[vid] = gains[vid] || []).push(id);
    }
    for (const vid of Object.keys(nowUnions)) {
      if (holdings[vid]) continue;
      for (const id of nowUnions[vid]) (gains[vid] = gains[vid] || []).push(id);
    }
    // New vids (in this row's roster, never seen): their union is
    // spawned gear — they arrived with it.
    const newVids = [];
    for (const vid of (row.roster || [])) {
      if (!seenRoster.has(vid)) { seenRoster.add(vid); newVids.push(vid); }
    }
    for (const vid of newVids) {
      const now = unionOf(row, vid);
      if (now.size) { holdings[vid] = now; for (const id of now) { st.appearances++; st.attributed.spawned++; st.appearancesDetail.push({ day: day, vid: vid, item: id, source: 'spawned', note: 'arrived with it' }); } }
    }
    // Appearances on known vids.
    for (const vid of Object.keys(gains)) {
      if (newVids.indexOf(vid) !== -1) continue;
      for (const id of gains[vid]) {
        st.appearances++;
        let source = null, note = '';
        if (windowCraft.some(function (e) { return e.vid === vid && e.item === id && e.ok; })) { source = 'crafted'; }
        else if (windowLoot.some(function (e) { return e.vid === vid && e.item === id; })) { source = 'looted'; }
        else if (windowGear.some(function (e) { return e.vid === vid && e.item === id; })) {
          source = 'moved';
          const g = windowGear.find(function (e) { return e.vid === vid && e.item === id; });
          note = 'via ' + (g.via || '?') + (g.from ? ' from ' + g.from : '');
        } else if (pileLost[id]) { source = 'moved'; note = 'armory take (pile -' + pileLost[id] + ')'; }
        else {
          // Another villager lost the same id today (a gift or swap
          // with no tele row of its own).
          let loser = null;
          for (const lvid of Object.keys(losses)) if (losses[lvid].indexOf(id) !== -1) { loser = lvid; break; }
          if (loser) { source = 'moved'; note = 'same-day loss by ' + loser; }
        }
        if (source) { st.attributed[source]++; }
        else { st.unexplained++; source = 'unexplained'; note = 'no craft/loot/gear/pile event for this vid+item in the gap window (' + windowStart + ',' + day + ']'; }
        st.appearancesDetail.push({ day: day, vid: vid, item: id, source: source, note: note });
        const prev = holdings[vid] || new Set();
        prev.add(id);
        holdings[vid] = prev;
      }
    }
    // Disappearances: losses not matched by a same-day gain (transfer)
    // or a pile gain (deposit) are bows that left the village economy
    // with their holder (death / departure from the roster's view).
    const gainedIds = {};
    for (const vid of Object.keys(gains)) for (const id of gains[vid]) gainedIds[id] = (gainedIds[id] || 0) + 1;
    const pileGainedLeft = Object.assign({}, pileGained);
    for (const vid of Object.keys(losses)) {
      for (const id of losses[vid]) {
        if ((gainedIds[id] || 0) > 0) { gainedIds[id]--; /* transferred */ }
        else if ((pileGainedLeft[id] || 0) > 0) { pileGainedLeft[id]--; st.deposited++; }
        else { st.disappearances++; st.diedWith++; }
        const prev = holdings[vid] || new Set();
        prev.delete(id);
        if (prev.size) holdings[vid] = prev; else delete holdings[vid];
      }
    }
    // Pile gains/losses left unmatched by villager flows.
    for (const id of Object.keys(pileGainedLeft)) {
      if (pileGainedLeft[id] > 0) st.pileUnexplainedGain += pileGainedLeft[id];
    }
    const pileLostLeft = Object.assign({}, pileLost);
    for (const vid of Object.keys(gains)) for (const id of gains[vid]) {
      if ((pileLostLeft[id] || 0) > 0) pileLostLeft[id]--;
    }
    for (const id of Object.keys(pileLostLeft)) {
      if (pileLostLeft[id] > 0) st.pileUnexplainedLoss += pileLostLeft[id];
    }
    prevPile = pile;
    if (day === 30 || day === 60 || day === 90 || day === 120 || day === 150) {
      st.stockSeries.push({ day: day, total: row.villageBowTotal | 0, pile: pile, knows: row.nKnowsBow | 0, eligible: row.nWeaponlessKnowsBow | 0 });
    }
  }
  // ---- departures ----
  for (const dep of (d.bowDeparts || [])) {
    if (!dep) continue;
    st.departs++;
    if (dep.wave4Plan) st.departsWave4++;
    if (!dep.hasVolley) {
      st.bowless++;
      if (dep.wave4Plan) st.bowlessWave4++;
      if (dep.spearInSlot) st.bowlessSpear++;
      if (dep.couldSource) st.bowlessSourced++; else st.bowlessNoSource++;
    }
  }
  // ---- encounters: volley-capable at entry (expedition, wave 4+) ----
  for (const r of (d.v4encounters || [])) {
    if (!r || r.origin !== 'expedition' || (r.wave | 0) < 4) continue;
    if ((r.rounds | 0) <= 0) continue;
    st.encMeetings++;
    if (r.rangedId != null) st.encRanged++;
  }
  return st;
}

function aggregate(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const per = [];
  const agg = { dir: dir, n: 0, valid: 0, errors: 0,
    launchpartyOn: {}, bowopenOn: {}, senseexpedOn: {}, bowcraftOn: {},
    starting: 0, startingById: {},
    appearances: 0, crafted: 0, looted: 0, spawned: 0, moved: 0, unexplained: 0,
    disappearances: 0, diedWith: 0, deposited: 0, pileUnexplainedGain: 0, pileUnexplainedLoss: 0,
    craftEvents: 0, craftOk: 0, craftFail: 0, craftByItem: {}, craftByVid: {},
    craftBowEvents: 0, craftBowOk: 0,
    eligibleDays: 0, knowsBowDays: 0, rangedlessEligibleDays: 0, spearArmedKnowsDays: 0,
    deathsTotal: 0,
    lootDrops: 0, lootBowDrops: 0, lootBowById: {},
    gearMoves: 0, gearBowMoves: 0,
    departs: 0, bowless: 0, bowlessSourced: 0, bowlessNoSource: 0, bowlessSpear: 0,
    departsWave4: 0, bowlessWave4: 0,
    encMeetings: 0, encRanged: 0,
    days: [], medianDays: null, national: 0, seedWins: 0, wave4: 0, wave5: 0,
    communityLost: 0, starvation: 0, starvationVillager: 0, scaleRanks: {},
    stockAt: {}, // day -> {totals[], piles[], knows[], eligible[]}
    unexplainedEarth: 0 };
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { agg.errors++; continue; }
    agg.n++;
    if (!d || typeof d !== 'object') { agg.errors++; continue; }
    agg.valid++;
    const s = seedStats(d);
    per.push(s);
    agg.errors += s.errors;
    if (d.launchpartyOn != null) agg.launchpartyOn[String(d.launchpartyOn)] = (agg.launchpartyOn[String(d.launchpartyOn)] || 0) + 1;
    if (d.bowopenOn != null) agg.bowopenOn[String(d.bowopenOn)] = (agg.bowopenOn[String(d.bowopenOn)] || 0) + 1;
    if (d.senseexpedOn != null) agg.senseexpedOn[String(d.senseexpedOn)] = (agg.senseexpedOn[String(d.senseexpedOn)] || 0) + 1;
    if (d.bowcraftOn != null) agg.bowcraftOn[String(d.bowcraftOn)] = (agg.bowcraftOn[String(d.bowcraftOn)] || 0) + 1;
    agg.starting += s.starting;
    for (const k of Object.keys(s.startingById)) agg.startingById[k] = (agg.startingById[k] || 0) + s.startingById[k];
    agg.appearances += s.appearances;
    agg.crafted += s.attributed.crafted;
    agg.looted += s.attributed.looted;
    agg.spawned += s.attributed.spawned;
    agg.moved += s.attributed.moved;
    agg.unexplained += s.unexplained;
    for (const a of s.appearancesDetail) if (a.source === 'unexplained' && EARTH_BOWS.indexOf(a.item) !== -1) agg.unexplainedEarth++;
    agg.disappearances += s.disappearances;
    agg.diedWith += s.diedWith;
    agg.deposited += s.deposited;
    agg.pileUnexplainedGain += s.pileUnexplainedGain;
    agg.pileUnexplainedLoss += s.pileUnexplainedLoss;
    agg.craftEvents += s.craftEvents;
    agg.craftOk += s.craftOk;
    agg.craftFail += s.craftFail;
    agg.craftBowEvents += s.craftBowEvents;
    agg.craftBowOk += s.craftBowOk;
    agg.deathsTotal += s.deathsTotal;
    for (const k of Object.keys(s.craftByItem)) {
      agg.craftByItem[k] = agg.craftByItem[k] || { ok: 0, fail: 0 };
      agg.craftByItem[k].ok += s.craftByItem[k].ok;
      agg.craftByItem[k].fail += s.craftByItem[k].fail;
    }
    for (const k of Object.keys(s.craftByVid)) agg.craftByVid[k] = (agg.craftByVid[k] || 0) + s.craftByVid[k];
    agg.eligibleDays += s.eligibleDays;
    agg.knowsBowDays += s.knowsBowDays;
    agg.rangedlessEligibleDays += s.rangedlessEligibleDays;
    agg.spearArmedKnowsDays += s.spearArmedKnowsDays;
    agg.lootDrops += s.lootDrops;
    agg.lootBowDrops += s.lootBowDrops;
    for (const k of Object.keys(s.lootBowById)) agg.lootBowById[k] = (agg.lootBowById[k] || 0) + s.lootBowById[k];
    agg.gearMoves += s.gearMoves;
    agg.gearBowMoves += s.gearBowMoves;
    agg.departs += s.departs;
    agg.bowless += s.bowless;
    agg.bowlessSourced += s.bowlessSourced;
    agg.bowlessNoSource += s.bowlessNoSource;
    agg.bowlessSpear += s.bowlessSpear;
    agg.departsWave4 += s.departsWave4;
    agg.bowlessWave4 += s.bowlessWave4;
    agg.encMeetings += s.encMeetings;
    agg.encRanged += s.encRanged;
    agg.days.push(s.days);
    if (s.national) agg.national++;
    if (s.won) agg.seedWins++;
    if ((s.maxWave | 0) >= 4) agg.wave4++;
    if ((s.maxWave | 0) >= 5) agg.wave5++;
    agg.communityLost += s.communityLost;
    agg.starvation += s.starvation;
    agg.starvationVillager += s.starvationVillager;
    agg.scaleRanks[s.scaleRank || '?'] = (agg.scaleRanks[s.scaleRank || '?'] || 0) + 1;
    for (const ss of s.stockSeries) {
      const e = agg.stockAt[ss.day] = agg.stockAt[ss.day] || { totals: [], piles: [], knows: [], eligible: [] };
      e.totals.push(ss.total);
      e.piles.push(ss.pile);
      e.knows.push(ss.knows);
      e.eligible.push(ss.eligible);
    }
  }
  const attributedAppearances = agg.crafted + agg.looted + agg.spawned + agg.moved;
  const allBows = agg.starting + agg.appearances;
  const attributedAll = agg.starting + attributedAppearances;
  agg.attributionCompleteness = allBows ? attributedAll / allBows : null;
  agg.appearanceAttribution = agg.appearances ? attributedAppearances / agg.appearances : null;
  agg.bowlessShare = agg.departs ? agg.bowless / agg.departs : null;
  agg.sourcedShareOfBowless = agg.bowless ? agg.bowlessSourced / agg.bowless : null;
  agg.craftSuccessRate = agg.craftEvents ? agg.craftOk / agg.craftEvents : null;
  agg.attemptsPerEligibleDay = agg.eligibleDays ? agg.craftEvents / agg.eligibleDays : null;
  agg.attemptsPerRangedlessDay = agg.rangedlessEligibleDays ? agg.craftBowEvents / agg.rangedlessEligibleDays : null;
  agg.deathsPerSeed = agg.valid ? agg.deathsTotal / agg.valid : null;
  agg.encRangedShare = agg.encMeetings ? agg.encRanged / agg.encMeetings : null;
  agg.medianDays = median(agg.days);
  agg.craftWrapLive = (agg.craftEvents > 0) || (agg.unexplainedEarth === 0);
  agg.perSeed = per;
  return agg;
}

function judge(ctl, arm) {
  // Frozen bars (prereg): the fix must (1) fire the bow-craft verb
  // (attempts >= 3 on the arm leg), (2) actually make bows
  // (crafted ok >= 3), (3) cut the bowless-departure share by >=
  // 0.05 absolute vs control, and (4) not regress survival /
  // starvation / deaths. A miss on any bar is NO-GO — never
  // re-scored against a friendlier metric mid-run (§14).
  const bars = [];
  const attPass = arm.craftBowEvents >= 3;
  bars.push({ id: 'craft-attempts', pass: attPass,
    detail: 'bow-rung craft attempts (bow / crude_bow): arm ' + arm.craftBowEvents +
      ' (ok ' + arm.craftBowOk + ', fail ' + (arm.craftBowEvents - arm.craftBowOk) + ') vs ctl ' +
      ctl.craftBowEvents + ' (bar arm >= 3); attempts per ranged-less-knows day arm ' +
      (arm.attemptsPerRangedlessDay == null ? 'n/a' : arm.attemptsPerRangedlessDay.toFixed(3)) +
      ' on ' + arm.rangedlessEligibleDays + ' ranged-less-knows days (ctl ' +
      ctl.rangedlessEligibleDays + ')' });
  const madePass = arm.craftBowOk >= 3;
  bars.push({ id: 'bows-crafted', pass: madePass,
    detail: 'bows crafted (bow / crude_bow, ok): arm ' + arm.craftBowOk + ' vs ctl ' +
      ctl.craftBowOk + ' (bar arm >= 3); by item ' + JSON.stringify(arm.craftByItem) });
  const delta = (ctl.bowlessShare == null || arm.bowlessShare == null) ? null : ctl.bowlessShare - arm.bowlessShare;
  const depPass = delta != null && delta >= 0.05;
  bars.push({ id: 'bowless-falls', pass: depPass,
    detail: 'bowless departure share: ctl ' + (ctl.bowlessShare == null ? 'n/a' : ctl.bowlessShare.toFixed(3)) +
      ' (' + ctl.bowless + '/' + ctl.departs + ') -> arm ' +
      (arm.bowlessShare == null ? 'n/a' : arm.bowlessShare.toFixed(3)) +
      ' (' + arm.bowless + '/' + arm.departs + '), delta ' +
      (delta == null ? 'n/a' : delta.toFixed(3)) + ' (bar >= 0.05)' });
  const medPass = arm.medianDays != null && ctl.medianDays != null && arm.medianDays >= 0.8 * ctl.medianDays;
  const starvPass = arm.starvation <= ctl.starvation + 2;
  const deathPass = arm.deathsPerSeed != null && ctl.deathsPerSeed != null && arm.deathsPerSeed <= ctl.deathsPerSeed * 1.10;
  const guardPass = medPass && starvPass && deathPass;
  bars.push({ id: 'no-regression', pass: guardPass,
    detail: 'median survival arm ' + arm.medianDays + ' vs ctl ' + ctl.medianDays +
      ' (bar >= 0.8x ctl: ' + (medPass ? 'pass' : 'FAIL') + '); starvation deaths arm ' +
      arm.starvation + ' vs ctl ' + ctl.starvation + ' (bar <= ctl+2: ' + (starvPass ? 'pass' : 'FAIL') +
      '); deaths/seed arm ' + (arm.deathsPerSeed == null ? 'n/a' : arm.deathsPerSeed.toFixed(1)) +
      ' vs ctl ' + (ctl.deathsPerSeed == null ? 'n/a' : ctl.deathsPerSeed.toFixed(1)) +
      ' (bar <= 1.10x ctl: ' + (deathPass ? 'pass' : 'FAIL') + ')' });
  const verdict = (attPass && madePass && depPass && guardPass) ? 'GO' : 'NO-GO';
  return { verdict: verdict, bars: bars };
}

function summarize(a) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'launchpartyOn', 'bowopenOn', 'senseexpedOn', 'bowcraftOn',
    'starting', 'startingById', 'appearances', 'crafted', 'looted', 'spawned', 'moved', 'unexplained',
    'attributionCompleteness', 'appearanceAttribution',
    'disappearances', 'diedWith', 'deposited', 'pileUnexplainedGain', 'pileUnexplainedLoss',
    'craftEvents', 'craftOk', 'craftFail', 'craftByItem', 'craftByVid', 'craftSuccessRate',
    'craftBowEvents', 'craftBowOk', 'attemptsPerRangedlessDay',
    'eligibleDays', 'knowsBowDays', 'rangedlessEligibleDays', 'spearArmedKnowsDays',
    'attemptsPerEligibleDay', 'craftWrapLive', 'unexplainedEarth',
    'lootDrops', 'lootBowDrops', 'lootBowById', 'gearMoves', 'gearBowMoves',
    'departs', 'bowless', 'bowlessShare', 'bowlessSourced', 'bowlessNoSource', 'bowlessSpear',
    'sourcedShareOfBowless', 'departsWave4', 'bowlessWave4',
    'encMeetings', 'encRanged', 'encRangedShare',
    'medianDays', 'national', 'seedWins', 'wave4', 'wave5', 'communityLost',
    'starvation', 'starvationVillager', 'deathsTotal', 'deathsPerSeed', 'scaleRanks', 'stockAt']) o[k] = a[k];
  o.perSeed = (a.perSeed || []).map(function (s) {
    return { seed: s.seed, days: s.days, endReason: s.endReason, scaleRank: s.scaleRank,
      starting: s.starting, appearances: s.appearances, attributed: s.attributed, unexplained: s.unexplained,
      craftEvents: s.craftEvents, craftOk: s.craftOk, craftFail: s.craftFail,
      craftBowEvents: s.craftBowEvents, craftBowOk: s.craftBowOk,
      eligibleDays: s.eligibleDays, rangedlessEligibleDays: s.rangedlessEligibleDays,
      spearArmedKnowsDays: s.spearArmedKnowsDays, deathsTotal: s.deathsTotal,
      departs: s.departs, bowless: s.bowless,
      bowlessSourced: s.bowlessSourced, bowlessNoSource: s.bowlessNoSource,
      encMeetings: s.encMeetings, encRanged: s.encRanged, errors: s.errors };
  });
  return o;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bs-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  function censusRow(day, o) {
    return Object.assign({ day: day, roster: ['h1', 'c1'], held: {}, stashed: {}, heldSpears: {},
      stashWeapons: {}, mats: { branch: 5, vine: 5, wood: 5, fiber: 5 },
      knows: { h1: { bow: 0, crude_bow: 0 }, c1: { bow: 0, crude_bow: 0 } },
      nWeaponless: 1, nWeaponlessKnowsBow: 0, nArmedKnowsBow: 0, nKnowsBow: 0,
      nRangedlessKnowsBow: 0, nSpearArmedKnowsBow: 0, villageBowTotal: 0 }, o);
  }
  // Seed 1: baseline h1 holds a bow (starting); day-10 c1 crafts a
  // crude_bow (tele ok) + a failed bow attempt day-11; day-20 h1 is
  // kill-looted a phase_sling; day-30 c2 ARRIVES with a sling
  // (spawned — c2 is new to the roster); day-40 h1 gifts the bow to
  // c1 (gear event; h1 loses it, c1 gains it — a move) while the
  // pile GAINS a bow from nowhere (pile-unexplained 1); day-50 an
  // unexplained crossbow appears on c2.
  const seed1 = { seed: 107001, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
    maxWave: 4, endReason: 'survived', instrumentErrors: [], launchpartyOn: false, senseexpedOn: true, bowopenOn: false,
    deaths: [], daily: [], samples: {}, v4encounters: [
      { day: 60, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', rounds: 5, rangedId: 'bow' },
      { day: 61, vid: 'c1', mid: 'audit', wave: 4, origin: 'expedition', rounds: 4, rangedId: null },
    ],
    bowBaseline: censusRow(1, { roster: ['h1', 'c1'], held: { h1: ['bow'] }, villageBowTotal: 1 }),
    bowEvents: [
      { day: 10, type: 'weapon_craft', vid: 'c1', item: 'crude_bow', ok: true, via: null, from: null },
      { day: 11, type: 'weapon_craft', vid: 'c1', item: 'bow', ok: false, via: null, from: null },
      { day: 40, type: 'villager_gear', vid: 'c1', item: 'bow', ok: null, via: 'gift', from: 'h1' },
    ],
    bowKills: [
      // Gap-window case: the drop is day 15 (an unobserved day
      // between census rows 10 and 20) and the bow appears in the
      // day-20 row — still 'looted', not unexplained.
      { day: 15, vid: 'h1', mid: 'audit', wave: 4, dropId: 'phase_sling' },
      { day: 21, vid: 'h1', mid: 'congregation', wave: 4, dropId: 'meat' },
    ],
    bowCensus: [
      censusRow(10, { roster: ['h1', 'c1'], held: { h1: ['bow'], c1: ['crude_bow'] }, villageBowTotal: 2,
        knows: { h1: { bow: 0, crude_bow: 0 }, c1: { bow: 2, crude_bow: 2 } },
        nWeaponless: 1, nWeaponlessKnowsBow: 1, nKnowsBow: 1 }),
      censusRow(20, { roster: ['h1', 'c1'], held: { h1: ['bow', 'phase_sling'], c1: ['crude_bow'] }, villageBowTotal: 3,
        knows: { h1: { bow: 0, crude_bow: 0 }, c1: { bow: 2, crude_bow: 2 } },
        nWeaponless: 1, nWeaponlessKnowsBow: 1, nKnowsBow: 1 }),
      censusRow(30, { roster: ['h1', 'c1', 'c2'], held: { h1: ['bow', 'phase_sling'], c1: ['crude_bow'], c2: ['sling'] }, villageBowTotal: 4,
        knows: { h1: { bow: 0, crude_bow: 0 }, c1: { bow: 2, crude_bow: 2 }, c2: { bow: 0, crude_bow: 0 } },
        nWeaponless: 1, nWeaponlessKnowsBow: 1, nKnowsBow: 1 }),
      censusRow(40, { roster: ['h1', 'c1', 'c2'], held: { h1: ['phase_sling'], c1: ['crude_bow', 'bow'], c2: ['sling'] }, villageBowTotal: 5,
        stashWeapons: { bow: 1 },
        knows: { h1: { bow: 0, crude_bow: 0 }, c1: { bow: 2, crude_bow: 2 }, c2: { bow: 0, crude_bow: 0 } },
        nWeaponless: 1, nWeaponlessKnowsBow: 1, nKnowsBow: 1 }),
      censusRow(50, { roster: ['h1', 'c1', 'c2'], held: { h1: ['phase_sling'], c1: ['crude_bow', 'bow'], c2: ['sling', 'crossbow'] }, villageBowTotal: 6,
        stashWeapons: { bow: 1 },
        knows: { h1: { bow: 0, crude_bow: 0 }, c1: { bow: 2, crude_bow: 2 }, c2: { bow: 0, crude_bow: 0 } },
        nWeaponless: 1, nWeaponlessKnowsBow: 1, nKnowsBow: 1 }),
    ],
    bowDeparts: [
      { day: 5, vid: 'h1', wave4Plan: true, hasVolley: true, spearInSlot: false, couldSource: false, ownStashBow: false, armoryBow: false, craftableAny: false },
      { day: 6, vid: 'c1', wave4Plan: true, hasVolley: false, spearInSlot: true, couldSource: true, ownStashBow: true, armoryBow: false, craftableAny: false },
      { day: 7, vid: 'c2', wave4Plan: false, hasVolley: false, spearInSlot: false, couldSource: false, ownStashBow: false, armoryBow: false, craftableAny: false },
    ],
  };
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed1));
  const a = aggregate(dir);
  check('starting counts the baseline bow', a.starting === 1 && a.startingById.bow === 1, JSON.stringify(a.startingById));
  check('senseexped flag recorded on (launchparty off)', a.senseexpedOn['true'] === 1 && a.launchpartyOn['false'] === 1, JSON.stringify({ se: a.senseexpedOn, lp: a.launchpartyOn }));
  check('appearances total 5 (craft + loot + spawn + move + unexplained)', a.appearances === 5, 'got ' + a.appearances);
  check('crafted 1 (crude_bow, tele ok)', a.crafted === 1, 'got ' + a.crafted);
  check('looted 1 (phase_sling)', a.looted === 1, 'got ' + a.looted);
  check('spawned 1 (sling on new vid c2)', a.spawned === 1, 'got ' + a.spawned);
  check('moved 1 (gift bow h1->c1)', a.moved === 1, 'got ' + a.moved);
  check('unexplained 1 (crossbow on c2)', a.unexplained === 1, 'got ' + a.unexplained);
  check('attribution completeness (1+4)/6 = 0.833', Math.abs(a.attributionCompleteness - 5 / 6) < 1e-9, 'got ' + a.attributionCompleteness);
  check('craft events 2 (1 ok crude_bow, 1 fail bow)', a.craftEvents === 2 && a.craftOk === 1 && a.craftFail === 1, JSON.stringify({ e: a.craftEvents, ok: a.craftOk, f: a.craftFail }));
  check('craft by item: crude_bow ok 1, bow fail 1', a.craftByItem.crude_bow.ok === 1 && a.craftByItem.bow.fail === 1, JSON.stringify(a.craftByItem));
  check('eligible days 5 (1 per census row)', a.eligibleDays === 5, 'got ' + a.eligibleDays);
  check('attempts per eligible day 2/5 = 0.4', Math.abs(a.attemptsPerEligibleDay - 0.4) < 1e-9, 'got ' + a.attemptsPerEligibleDay);
  check('loot bow drops 1 (phase_sling); meat drop not counted', a.lootBowDrops === 1 && a.lootDrops === 2, JSON.stringify({ b: a.lootBowDrops, t: a.lootDrops }));
  check('pile unexplained gain 1 (bow in pile, gift explains no pile flow)', a.pileUnexplainedGain === 1, 'got ' + a.pileUnexplainedGain);
  check('gift transfer is not a disappearance', a.disappearances === 0 && a.diedWith === 0, JSON.stringify({ d: a.disappearances, w: a.diedWith }));
  check('departures 3, bowless 2, sourced 1, no-source 1, spear 1', a.departs === 3 && a.bowless === 2 && a.bowlessSourced === 1 && a.bowlessNoSource === 1 && a.bowlessSpear === 1, JSON.stringify({ d: a.departs, b: a.bowless, s: a.bowlessSourced, n: a.bowlessNoSource, sp: a.bowlessSpear }));
  check('bowless share 2/3, sourced share of bowless 1/2', Math.abs(a.bowlessShare - 2 / 3) < 1e-9 && Math.abs(a.sourcedShareOfBowless - 0.5) < 1e-9, JSON.stringify({ bs: a.bowlessShare, ss: a.sourcedShareOfBowless }));
  check('encounters 2, ranged at entry 1', a.encMeetings === 2 && a.encRanged === 1 && Math.abs(a.encRangedShare - 0.5) < 1e-9, JSON.stringify({ m: a.encMeetings, r: a.encRanged }));
  check('craft wrap live (events seen)', a.craftWrapLive === true, 'got ' + a.craftWrapLive);
  check('unexplained earth 1 (crossbow)', a.unexplainedEarth === 1, 'got ' + a.unexplainedEarth);
  // Judge shapes — the before/after compare (frozen prereg bars).
  // The fixture leg above is the ARM shape (1 bow-rung attempt ok,
  // 1 fail; bowless 2/3). A control leg with 0 attempts, 0 crafted
  // and a higher bowless share is built by overriding its counts.
  const ctlBase = Object.assign({}, a, { craftBowEvents: 0, craftBowOk: 0,
    departs: 120, bowless: 96, bowlessShare: 0.80,
    medianDays: 140, starvation: 1, deathsPerSeed: 70 });
  const armBase = Object.assign({}, a, { craftBowEvents: 4, craftBowOk: 3,
    departs: 120, bowless: 84, bowlessShare: 0.70,
    medianDays: 140, starvation: 1, deathsPerSeed: 70 });
  let j = judge(ctlBase, armBase);
  check('judge GO when all four bars pass', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j.bars));
  j = judge(ctlBase, Object.assign({}, armBase, { craftBowEvents: 2, craftBowOk: 2 }));
  check('judge NO-GO when craft attempts < 3', j.verdict === 'NO-GO' && !j.bars[0].pass, JSON.stringify(j.bars));
  j = judge(ctlBase, Object.assign({}, armBase, { craftBowOk: 2 }));
  check('judge NO-GO when bows crafted < 3 (attempts pass)', j.verdict === 'NO-GO' && j.bars[0].pass && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(ctlBase, Object.assign({}, armBase, { bowlessShare: 0.78, bowless: 94 }));
  check('judge NO-GO when the bowless delta is < 0.05', j.verdict === 'NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(ctlBase, Object.assign({}, armBase, { medianDays: 100 }));
  check('judge NO-GO when median survival falls below 0.8x ctl', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(ctlBase, Object.assign({}, armBase, { starvation: 4 }));
  check('judge NO-GO when starvation exceeds ctl+2', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(ctlBase, Object.assign({}, armBase, { deathsPerSeed: 80 }));
  check('judge NO-GO when deaths/seed exceeds 1.10x ctl', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  // The fixture leg's own bow-rung counts (2 attempts: crude_bow
  // ok + bow fail) and ranged-less denominator (0 in the fixture —
  // the helper defaults the new counts to 0) aggregate correctly.
  check('fixture leg aggregates 2 bow-rung attempts, 1 ok', a.craftBowEvents === 2 && a.craftBowOk === 1, JSON.stringify({ e: a.craftBowEvents, ok: a.craftBowOk }));
  check('fixture leg ranged-less denominator aggregates (0 in fixture)', a.rangedlessEligibleDays === 0, 'got ' + a.rangedlessEligibleDays);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-bowcraft-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, ctlDir = null, armDir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--ctl') ctlDir = args[++i];
    else if (args[i] === '--arm') armDir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (ctlDir && armDir) {
    const ctl = aggregate(ctlDir);
    const arm = aggregate(armDir);
    const j = judge(ctl, arm);
    const result = { verdict: j.verdict, bars: j.bars, ctl: summarize(ctl), arm: summarize(arm) };
    console.log(JSON.stringify(result, null, 2));
    if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
    process.exit(j.verdict === 'GO' ? 0 : 1);
  }
  if (!dir) { console.error('usage: analyze-bowcraft-a.js --ctl DIR --arm DIR [--out FILE] | --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const a = aggregate(dir);
  const result = { verdict: null, bars: null, summary: summarize(a) };
  console.log(JSON.stringify(result, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { aggregate: aggregate, seedStats: seedStats, judge: judge, summarize: summarize, unionOf: unionOf, pileBows: pileBows };
