// analyze-lendpool-a.js — analyzer + judge, arm sim-lendpool-a.
// LENDPOOL: the diagnosis for finding #2628 (the lend-opportunity
// pool is 0 — why holders never stand in earshot of an unarmed
// lead). NO lend re-test, NO game-code change: this analyzer reads
// the lendpool driver corpora (perseed-lendpool-a-*) — the inherited
// cell/participation/presence/lend instruments (kept verbatim) PLUS
// the `v4lendPool` rows (re-verified) and the new `v4nearMiss` rows
// (one per wave-4+ fight launch: lead kind, nearest living armed
// holder, classified state, distance, earshot flags).
//
// Judge (frozen prereg, `judgeLendpool`): DIAG-GO iff (1)
// near-miss coverage — v4nearMiss rows exist for >= 95% of the
// unarmed-lead wave-4+ real fights derived independently from
// v4encounters (origin world-tick | aid, lead unarmed-or-empty at
// entry), with <= 5% of rows unclassified; (2) pool re-verified —
// the pool counter ran on all 8 seeds, the near-miss lendable
// count agrees with the v4lendPool moment count, and the lend
// stayed OFF (v4lends empty); (3) the answer is quantified — the
// breakdown names the dominant nearest-holder state with its
// share, and the earshot base rate over ALL wave-4+ launches is
// reported. If the largest class holds < 30% the breakdown is
// DIFFUSE (top two named) — the bar is the quantified answer,
// not a particular cause. Kind: coverage miss = METRIC-BROKEN;
// pool / cross-check / lend-fired miss = SUBSTRATE; an empty
// unarmed population = NO-POPULATION.
// The `judge` / `judgeParticipation` / `judgeLend` /
// `judgeLendfix` functions below are the inherited instruments
// (kept verbatim; none is the judge here).
//
// INSTRUMENT FIX (finding #2622): the `armedLeads` counter in
// `participationStats` is incremented here — the gunrate/cellgate
// analyzer initialized it to 0 and never added to it, so "armed
// leads 0" was an instrument artifact (the real count on the
// cellgate band was 1, read from armedDetail). The selftest's
// armed-entry fixture is an ALLY, so its armedLeads === 0
// assertion stays correct; a new armed-LEAD fixture row asserts
// armedLeads === 1.
//
// Presence stats (`presenceStats`): the v4tickPresence pool joined
// to v4encounters on (day, mid, origin world-tick) — pool ticks,
// pool fights, holder-led fights, draft misses (fight happened,
// holder pooled, lead is someone else); and the v4transfers rows
// (transfers / vanishes / new-holders / holder-died).
//
// Attribution (bowsource family): every fusion_cell first-appearance
// in a villager's personal union (held + stashed) after baseline is
// attributed to starting / looted (villager kill) / contest-prize /
// show-gift / trade / spawned (new roster vid) / crafted / moved
// (same-window loss+gain) / unexplained, from the census window
// (prevRowDay, rowDay] joined to the kill-loot / grant / craft event
// logs. Searcaster appearances are attributed the same way (where
// did the searcaster itself come from?). The scholar's cell
// appearances (cellPile scholar series) are attributed the same way
// (corpse-take / contest-prize / trade / crafted / unexplained) and
// count in the attribution denominator.
// v2 NOTE: the v1 `teleLoot` branch is DEAD and removed — the VF
// instrument's teleRows carries only veteran-relevant tele types, so
// no loot_dropped row can ever appear in it (proven: 0 rows across
// 3 seeds despite teleCounts 20-28). Grants are read from the
// driver's grantEvents wrap on alienLootGrant, never from teleRows.
//
// Judge (frozen prereg): DIAG-GO iff (1) holder census coverage
// complete on all 8 seeds; (2) acquisition-event attribution >= 0.90
// — OR zero appearances (PASS-vacuous, only when bar 1 passes and
// the frozen mechanism names loot as the sole route); (3)
// volley-opportunity pool >= 5 (wave-4+ engaged meetings with a
// cell-weapon participant at 0 cells) — OR the rare-rate conclusion
// (thin pool stated as a finding, not re-scored).
//
// Usage:
//   node scripts/analyze-lendpool-a.js --dir DIR [--out FILE] [--no-judge]
//   node scripts/analyze-lendpool-a.js --ctl DIR --fix DIR [--out FILE]
//   node scripts/analyze-lendpool-a.js --selftest
//
// Attribution (bowsource family): every fusion_cell first-appearance
// in a villager's personal union (held + stashed) after baseline is
// attributed to starting / looted (villager kill) / contest-prize /
// show-gift / trade / spawned (new roster vid) / crafted / moved
// (same-window loss+gain) / unexplained, from the census window
// (prevRowDay, rowDay] joined to the kill-loot / grant / craft event
// logs. Searcaster appearances are attributed the same way (where
// did the searcaster itself come from?). The scholar's cell
// appearances (cellPile scholar series) are attributed the same way
// (corpse-take / contest-prize / trade / crafted / unexplained) and
// count in the attribution denominator.
// v2 NOTE: the v1 `teleLoot` branch is DEAD and removed — the VF
// instrument's teleRows carries only veteran-relevant tele types, so
// no loot_dropped row can ever appear in it (proven: 0 rows across
// 3 seeds despite teleCounts 20-28). Grants are read from the
// driver's grantEvents wrap on alienLootGrant, never from teleRows.
//
// Judge (frozen prereg): DIAG-GO iff (1) holder census coverage
// complete on all 8 seeds; (2) acquisition-event attribution >= 0.90
// — OR zero appearances (PASS-vacuous, only when bar 1 passes and
// the frozen mechanism names loot as the sole route); (3)
// volley-opportunity pool >= 5 (wave-4+ engaged meetings with a
// cell-weapon participant at 0 cells) — OR the rare-rate conclusion
// (thin pool stated as a finding, not re-scored).
//
// Usage:
//   node scripts/analyze-lendpool-a.js --dir DIR [--out FILE] [--no-judge]
//   node scripts/analyze-lendpool-a.js --ctl DIR --fix DIR [--out FILE]
//   node scripts/analyze-lendpool-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}
function bucket(day) {
  if (day <= 30) return 'd0-30';
  if (day <= 60) return 'd31-60';
  if (day <= 100) return 'd61-100';
  return 'd101+';
}
function cellsTotal(row) { return (row.cells | 0) + (row.cellsStash | 0); }

// attributeIncrease(events, vid, prevDay, day, delta): the shared
// window attribution for one appearance event. `events` carries the
// seed's loot/craft logs + the per-vid totals series (for moved
// detection). Pure; exported for the proof test.
function attributeIncrease(ctx, vid, prevDay, day, itemKind) {
  // ctx: { loot: [{day, vid, dropId}], crafts: [{day, recipeId}],
  //   grants: [{day, itemId, toKind, toVid, caller}],
  //   takes: [{day, itemId}], series: { vid: [{day, total}] },
  //   baselineVids: Set, role: 'villager' | 'scholar' }
  // itemKind: 'fusion_cell' or 'searcaster'. The grant match is
  // role-aware: a villager appearance needs a grant TO that vid; a
  // scholar appearance needs a grant to the scholar (or a corpse
  // take for cells). 'moved' reads the series (villagers + the
  // scholar pseudo-vid '__scholar__') for a same-window decrease.
  const role = ctx.role || 'villager';
  if (role === 'villager' && !ctx.baselineVids.has(vid)) return 'spawned';
  for (const e of (ctx.loot || [])) {
    if (role === 'villager' && e.vid === vid && e.dropId === itemKind && e.day > prevDay && e.day <= day) return 'looted';
  }
  for (const g of (ctx.grants || [])) {
    if (g.itemId !== itemKind || !(g.day > prevDay && g.day <= day)) continue;
    if (role === 'villager' && g.toKind === 'villager' && g.toVid === vid) {
      if (g.caller === 'contest-prize') return 'contest-prize';
      if (g.caller === 'show-gift') return 'show-gift';
      if (g.caller === 'trade') return 'trade';
      return 'grant-other';
    }
    if (role === 'scholar' && g.toKind === 'scholar') {
      if (g.caller === 'contest-prize') return 'contest-prize';
      if (g.caller === 'show-gift') return 'show-gift';
      if (g.caller === 'trade') return 'trade';
      return 'grant-other';
    }
  }
  if (itemKind === 'fusion_cell') {
    for (const e of (ctx.crafts || [])) {
      if (e.recipeId === 'fusion_cell' && e.day > prevDay && e.day <= day) return 'crafted';
    }
    if (role === 'scholar') {
      for (const t of (ctx.takes || [])) {
        if (t.itemId === 'fusion_cell' && t.day > prevDay && t.day <= day) return 'corpse-take';
      }
    }
  }
  // moved: another holder's total fell in the same window (a gift,
  // a hand-off, a corpse stripped — the window cannot tell which).
  if (ctx.series) {
    for (const other of Object.keys(ctx.series)) {
      if (other === vid) continue;
      const rows = ctx.series[other];
      let before = null, after = null;
      for (const r of rows) {
        if (r.day <= prevDay) before = r.total;
        if (r.day <= day) after = r.total;
      }
      if (before != null && after != null && (before - after) >= 1) return 'moved';
    }
  }
  return 'unexplained';
}

function cellStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    bowopenOn: {}, senseexpedOn: {}, speargateOn: {}, gunrateOn: {},
    // coverage (bar 1)
    coverage: [], coverageComplete: 0,
    // holders
    searcasterHolders: [], // {seed, vid, holderDays, cellDays, maxCells, zeroDays}
    searcasterHolderDays: 0, searcasterCellDays: 0, searcasterZeroDays: 0,
    searcasterHoldersTotal: 0, cellHolderDays: 0, maxCellsEver: 0,
    // appearances + attribution (bar 2)
    cellAppearances: 0, cellAttributed: 0, cellAttribution: null,
    cellBySource: {}, cellAppearanceDetail: [],
    searcasterAppearances: 0, searcasterAttributed: 0, searcasterAttribution: null,
    searcasterBySource: {}, searcasterAppearanceDetail: [],
    searcasterBaseline: 0, cellBaseline: 0,
    // departures
    searcasterDeparts: 0, searcasterDepartsZero: 0, searcasterDepartOutcomes: {},
    // acquisition events
    lootCellDrops: 0, lootSearcasterDrops: 0, lootByDrop: {},
    grantCellByCaller: {}, grantSearcasterByCaller: {},
    grantCellTotal: 0, grantSearcasterTotal: 0,
    corpseTakeCell: 0, corpseTakeTotal: 0, contestPrizes: 0,
    scholarCellAppearances: 0, scholarCellAttributed: 0, scholarCellBySource: {},
    playerCrafts: 0, playerCraftCell: 0, playerCraftByRecipe: {},
    pileMaxTotal: 0, pileEverPositive: 0, scholarMaxCells: 0,
    // volley opportunities (bar 3)
    poolEngagedZero: 0, poolEngagedArmed: 0, poolAllZero: 0, poolEvadedZero: 0,
    poolDetail: [], volleyFiredFromSearcaster: 0, noFusionCellsLines: 0,
    encWave4Plus: 0, encEngaged: 0,
    // wall numbers
    days: [], medianDays: null, communityLost: 0, national: 0,
    seedWins: 0, wave4: 0, wave5: 0, scaleRanks: {},
    starvation: 0, starvationVillager: 0,
    perSeed: [] };
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    if (!d || typeof d !== 'object') { st.errors++; continue; }
    st.valid++;
    const seedErr = ((d.instrumentErrors || []).length);
    st.errors += seedErr;
    if (d.bowopenOn != null) st.bowopenOn[String(d.bowopenOn)] = (st.bowopenOn[String(d.bowopenOn)] || 0) + 1;
    if (d.senseexpedOn != null) st.senseexpedOn[String(d.senseexpedOn)] = (st.senseexpedOn[String(d.senseexpedOn)] || 0) + 1;
    if (d.speargateOn != null) st.speargateOn[String(d.speargateOn)] = (st.speargateOn[String(d.speargateOn)] || 0) + 1;
    if (d.gunrateOn != null) st.gunrateOn[String(d.gunrateOn)] = (st.gunrateOn[String(d.gunrateOn)] || 0) + 1;
    const seed = d.seed;
    st.days.push(d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0));
    if ((RANK_ORDER[d.scaleRank] || 0) >= 2) st.national++;
    if (d.won) st.seedWins++;
    if ((d.maxWave | 0) >= 4) st.wave4++;
    if ((d.maxWave | 0) >= 5) st.wave5++;
    if (['village-lost', 'village-dead', 'pop-zero'].includes(d.endReason)) st.communityLost++;
    st.scaleRanks[d.scaleRank || '?'] = (st.scaleRanks[d.scaleRank || '?'] || 0) + 1;
    for (const death of (d.deaths || [])) {
      if (isStarvation(death)) { st.starvation++; if (!death.player) st.starvationVillager++; }
    }
    // ---- coverage (bar 1) ----
    const baseline = d.ammoBaseline || null;
    const baselineRows = (baseline && Array.isArray(baseline.census)) ? baseline.census : [];
    const censusRows = d.ammoCensus || [];
    const pileRows = d.cellPile || [];
    const censusDays = {};
    for (const r of censusRows) censusDays[r.day | 0] = true;
    const livedDays = (d.gameDays | 0) || (d.days | 0) || 0;
    const coverDays = Object.keys(censusDays).length;
    const cov = { seed: seed, baselinePresent: baselineRows.length > 0,
      baselineRows: baselineRows.length, censusRows: censusRows.length,
      cellPileRows: pileRows.length, censusDays: coverDays,
      livedDays: livedDays, censusDayShare: livedDays ? coverDays / livedDays : null,
      instrumentErrors: seedErr,
      complete: baselineRows.length > 0 && censusRows.length > 0 && pileRows.length > 0
        && seedErr === 0 && livedDays > 0 && (coverDays / livedDays) >= 0.5 };
    st.coverage.push(cov);
    if (cov.complete) st.coverageComplete++;
    // ---- per-vid series (cells + searcaster presence) ----
    const baselineVids = new Set();
    const baseCells = {}, baseRanged = {};
    for (const r of baselineRows) {
      baselineVids.add(r.vid);
      baseCells[r.vid] = cellsTotal(r);
      baseRanged[r.vid] = r.rangedId || null;
      if (r.rangedId === 'searcaster') st.searcasterBaseline++;
      if (cellsTotal(r) > 0) st.cellBaseline += cellsTotal(r);
    }
    const series = {}; // vid -> [{day, total}] (cells)
    const rangedSeries = {}; // vid -> [{day, rangedId}]
    const holderAgg = {}; // vid -> {holderDays, cellDays, maxCells, zeroDays}
    const sortedCensus = censusRows.slice().sort(function (a, b) { return (a.day | 0) - (b.day | 0); });
    for (const r of sortedCensus) {
      if (!series[r.vid]) series[r.vid] = [];
      series[r.vid].push({ day: r.day | 0, total: cellsTotal(r) });
      if (!rangedSeries[r.vid]) rangedSeries[r.vid] = [];
      rangedSeries[r.vid].push({ day: r.day | 0, rangedId: r.rangedId || null });
      if (r.rangedId === 'searcaster') {
        const h = holderAgg[r.vid] || (holderAgg[r.vid] = { holderDays: 0, cellDays: 0, maxCells: 0, zeroDays: 0 });
        h.holderDays++;
        if (cellsTotal(r) > 0) h.cellDays++;
        else h.zeroDays++;
        if (cellsTotal(r) > h.maxCells) h.maxCells = cellsTotal(r);
      }
      if (cellsTotal(r) > 0) st.cellHolderDays++;
      if (cellsTotal(r) > st.maxCellsEver) st.maxCellsEver = cellsTotal(r);
    }
    for (const vid of Object.keys(holderAgg)) {
      const h = holderAgg[vid];
      st.searcasterHolders.push({ seed: seed, vid: vid, holderDays: h.holderDays,
        cellDays: h.cellDays, maxCells: h.maxCells, zeroDays: h.zeroDays });
      st.searcasterHolderDays += h.holderDays;
      st.searcasterCellDays += h.cellDays;
      st.searcasterZeroDays += h.zeroDays;
    }
    st.searcasterHoldersTotal += Object.keys(holderAgg).length;
    // ---- event logs for attribution ----
    const lootEvents = (d.ammoLoot || []).slice();
    const craftEvents = (d.ammoPlayerCraft || []).slice();
    const grantEvents = (d.grantEvents || []).slice();
    const takeEvents = (d.corpseTakeEvents || []).slice();
    st.contestPrizes += (d.contestPrizeEvents || []).length;
    for (const e of lootEvents) {
      if (e.dropId === 'fusion_cell') st.lootCellDrops++;
      if (e.dropId === 'searcaster') st.lootSearcasterDrops++;
      st.lootByDrop[e.dropId || '?'] = (st.lootByDrop[e.dropId || '?'] || 0) + 1;
    }
    for (const g of grantEvents) {
      if (g.itemId === 'fusion_cell') {
        st.grantCellTotal++;
        st.grantCellByCaller[g.caller || '?'] = (st.grantCellByCaller[g.caller || '?'] || 0) + 1;
      }
      if (g.itemId === 'searcaster') {
        st.grantSearcasterTotal++;
        st.grantSearcasterByCaller[g.caller || '?'] = (st.grantSearcasterByCaller[g.caller || '?'] || 0) + 1;
      }
    }
    for (const t of takeEvents) {
      st.corpseTakeTotal++;
      if (t.itemId === 'fusion_cell') st.corpseTakeCell++;
    }
    for (const e of craftEvents) {
      st.playerCrafts++;
      st.playerCraftByRecipe[e.recipeId || '?'] = (st.playerCraftByRecipe[e.recipeId || '?'] || 0) + 1;
      if (e.recipeId === 'fusion_cell') st.playerCraftCell++;
    }
    // ---- cell appearances (window attribution) ----
    // The scholar pseudo-vid carries the scholar's cell series so a
    // villager gaining while the scholar loses in-window reads as
    // 'moved' (a gift / hand-off).
    const scholarSeries = [];
    for (const p of pileRows) {
      scholarSeries.push({ day: p.day | 0, total: (p.scholar ? (p.scholar.cells | 0) : 0) });
    }
    const seriesWithScholar = Object.assign({}, series, { __scholar__: scholarSeries });
    const ctx = { loot: lootEvents, crafts: craftEvents, grants: grantEvents,
      takes: takeEvents, series: seriesWithScholar, baselineVids: baselineVids, role: 'villager' };
    for (const vid of Object.keys(series)) {
      const rows = series[vid];
      let prev = (baseCells[vid] != null ? baseCells[vid] : 0);
      let prevDay = (baseline && baseline.day != null) ? (baseline.day | 0) : 0;
      for (const r of rows) {
        const delta = r.total - prev;
        if (delta > 0) {
          const src = attributeIncrease(ctx, vid, prevDay, r.day, 'fusion_cell');
          st.cellAppearances++;
          if (src !== 'unexplained') st.cellAttributed++;
          st.cellBySource[src] = (st.cellBySource[src] || 0) + 1;
          st.cellAppearanceDetail.push({ seed: seed, vid: vid, day: r.day, prevDay: prevDay,
            delta: delta, source: src });
        }
        prev = r.total; prevDay = r.day;
      }
    }
    // ---- searcaster appearances (window attribution) ----
    const rangedCtx = { loot: lootEvents, crafts: [], grants: grantEvents,
      takes: takeEvents, series: null, baselineVids: baselineVids, role: 'villager' };
    // moved detection for weapons: presence series (0/1).
    const presSeries = {};
    for (const vid of Object.keys(rangedSeries)) {
      presSeries[vid] = rangedSeries[vid].map(function (r) { return { day: r.day, total: r.rangedId === 'searcaster' ? 1 : 0 }; });
    }
    rangedCtx.series = presSeries;
    for (const vid of Object.keys(rangedSeries)) {
      const rows = rangedSeries[vid];
      let prevR = (baseRanged[vid] != null ? baseRanged[vid] : null);
      let prevDay = (baseline && baseline.day != null) ? (baseline.day | 0) : 0;
      for (const r of rows) {
        if (r.rangedId === 'searcaster' && prevR !== 'searcaster') {
          const src = attributeIncrease(rangedCtx, vid, prevDay, r.day, 'searcaster');
          st.searcasterAppearances++;
          if (src !== 'unexplained') st.searcasterAttributed++;
          st.searcasterBySource[src] = (st.searcasterBySource[src] || 0) + 1;
          st.searcasterAppearanceDetail.push({ seed: seed, vid: vid, day: r.day, prevDay: prevDay, source: src });
        }
        prevR = r.rangedId; prevDay = r.day;
      }
    }
    // ---- pile + scholar stock ----
    let pileMax = 0, pilePos = 0, scholarMax = 0;
    for (const p of pileRows) {
      const t = p.total | 0;
      if (t > pileMax) pileMax = t;
      if (t > 0) pilePos++;
      if (p.scholar && (p.scholar.cells | 0) > scholarMax) scholarMax = p.scholar.cells | 0;
      // Pile/scholar increases are NOT folded into the villager
      // attribution denominator (the pile cannot receive loot and
      // the scholar's loot path is the tele log) — they are reported
      // as stock maxima above; any positive row is listed in the
      // evidence.
    }
    if (pileMax > st.pileMaxTotal) st.pileMaxTotal = pileMax;
    st.pileEverPositive += pilePos;
    if (scholarMax > st.scholarMaxCells) st.scholarMaxCells = scholarMax;
    // ---- scholar cell appearances (window attribution) ----
    // The scholar's series comes from the cellPile rows; the baseline
    // is the day-0 scholar cell count. Scholar appearances count in
    // the attribution denominator (prereg amendment).
    const scholarCtx = { loot: [], crafts: craftEvents, grants: grantEvents,
      takes: takeEvents, series: seriesWithScholar, baselineVids: baselineVids, role: 'scholar' };
    let prevScholarCells = (baseline && baseline.scholarCells) ? (baseline.scholarCells.cells | 0) : 0;
    let prevScholarDay = (baseline && baseline.day != null) ? (baseline.day | 0) : 0;
    for (const p of pileRows) {
      const cur = (p.scholar ? (p.scholar.cells | 0) : 0);
      if (cur > prevScholarCells) {
        const src2 = attributeIncrease(scholarCtx, '__scholar__', prevScholarDay, p.day | 0, 'fusion_cell');
        st.cellAppearances++;
        st.scholarCellAppearances++;
        if (src2 !== 'unexplained') { st.cellAttributed++; st.scholarCellAttributed++; }
        st.cellBySource[src2] = (st.cellBySource[src2] || 0) + 1;
        st.scholarCellBySource[src2] = (st.scholarCellBySource[src2] || 0) + 1;
        st.cellAppearanceDetail.push({ seed: seed, vid: '__scholar__', day: p.day | 0, prevDay: prevScholarDay,
          delta: cur - prevScholarCells, source: src2 });
      }
      prevScholarCells = cur; prevScholarDay = p.day | 0;
    }
    // ---- departures (searcaster) ----
    let seedSearDeparts = 0, seedSearZero = 0;
    for (const r of (d.ammoDeparts || [])) {
      if (r.rangedId !== 'searcaster') continue;
      seedSearDeparts++;
      st.searcasterDeparts++;
      st.searcasterDepartOutcomes[r.outcome || '?'] = (st.searcasterDepartOutcomes[r.outcome || '?'] || 0) + 1;
      if ((r.carriedAfter | 0) === 0) { seedSearZero++; st.searcasterDepartsZero++; }
    }
    // ---- encounters (volley-opportunity pool, read directly) ----
    let seedPoolEngagedZero = 0, seedPoolEngagedArmed = 0, seedPoolAllZero = 0,
      seedPoolEvadedZero = 0, seedWave4Plus = 0, seedEngaged = 0;
    for (const r of (d.v4encounters || [])) {
      if (((r.wave | 0)) < 4) continue;
      seedWave4Plus++;
      st.encWave4Plus++;
      const engaged = (r.rounds | 0) > 0;
      if (engaged) { seedEngaged++; st.encEngaged++; }
      const parts = r.partyCells || [];
      let hasZero = false, hasArmed = false;
      for (const p of parts) {
        if (p.rangedId === 'searcaster' && p.alive !== false) {
          if ((p.cells | 0) === 0) hasZero = true;
          else hasArmed = true;
        }
      }
      if (hasZero) {
        seedPoolAllZero++; st.poolAllZero++;
        if (engaged) { seedPoolEngagedZero++; st.poolEngagedZero++; }
        else { seedPoolEvadedZero++; st.poolEvadedZero++; }
        st.poolDetail.push({ seed: seed, day: r.day, vid: r.vid, mid: r.mid, origin: r.origin || null,
          outcome: r.outcome, rounds: r.rounds | 0, mDealt: r.mDealt, volley: r.volley || null,
          partyCells: parts.filter(function (p) { return p.rangedId === 'searcaster'; }) });
      }
      if (hasArmed) {
        if (engaged) { seedPoolEngagedArmed++; st.poolEngagedArmed++; }
      }
      if (r.volley && (r.volley.shots | 0) > 0 && (r.rangedId === 'searcaster' || hasArmed)) st.volleyFiredFromSearcaster++;
      for (const line of (r.log || [])) {
        if (/fusion cells/i.test(String(line))) st.noFusionCellsLines++;
      }
    }
    st.perSeed.push({ seed: seed, days: (d.days != null ? d.days : (d.gameDays | 0)),
      endReason: d.endReason, standing: d.standing, scaleRank: d.scaleRank,
      maxWave: d.maxWave, won: !!d.won, coverageComplete: cov.complete,
      searcasterHolders: Object.keys(holderAgg).length,
      searcasterHolderDays: Object.keys(holderAgg).reduce(function (a, v) { return a + holderAgg[v].holderDays; }, 0),
      searcasterDeparts: seedSearDeparts, searcasterDepartsZero: seedSearZero,
      poolEngagedZero: seedPoolEngagedZero, poolEngagedArmed: seedPoolEngagedArmed,
      wave4PlusMeetings: seedWave4Plus, engagedMeetings: seedEngaged });
  }
  st.cellAttribution = st.cellAppearances ? st.cellAttributed / st.cellAppearances : null;
  st.searcasterAttribution = st.searcasterAppearances ? st.searcasterAttributed / st.searcasterAppearances : null;
  st.medianDays = median(st.days);
  return st;
}


// ---- PARTICIPATION ----
// participationStats(dir): the three frozen bars, read off the same
// corpora cellStats reads. Lead attribution = a leadRule other than
// 'unclassified' (other:<fn> counts — the caller is named). Flee
// classification = a fleeCause other than 'unclassified' on a vFlee
// row. Pool floors are the raw counts. Also the secondary table:
// armed-holder entries, armed leads, armed volleys, flee shares,
// deaths per engaged meeting (exposure-normalized, per the fix-a §6
// proposal — recorded, never re-scored into the verdict).
function participationStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const p = { dir: dir, n: 0, valid: 0, errors: 0,
    meetings: 0, engaged: 0, flees: 0,
    leadAttributed: 0, leadRuleCounts: {}, leadUnclassified: 0,
    fleeClassified: 0, fleeUnclassified: 0, fleeCauseCounts: {},
    armedEntries: 0, armedLeads: 0, armedVolleys: 0,
    armedFlees: 0, armedMeetings: 0, unarmedFlees: 0, unarmedMeetings: 0,
    deathsTotal: 0, deathsPerEngaged: null,
    volleyDmgLeadRanged: 0, mDealtLeadRanged: 0,
    leadGearFlee: [], leadGearKill: [], leadGearOther: [],
    fleeDetail: [], armedDetail: [],
    national: 0, seedWins: 0, wave4: 0, wave5: 0, medianDays: null, days: [],
    communityLost: 0, perSeed: [] };
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { p.errors++; continue; }
    p.n++;
    if (!d || typeof d !== 'object') { p.errors++; continue; }
    p.valid++;
    const seed = d.seed;
    p.days.push(d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0));
    if ((RANK_ORDER[d.scaleRank] || 0) >= 2) p.national++;
    if (d.won) p.seedWins++;
    if ((d.maxWave | 0) >= 4) p.wave4++;
    if ((d.maxWave | 0) >= 5) p.wave5++;
    if (['village-lost', 'village-dead', 'pop-zero'].includes(d.endReason)) p.communityLost++;
    p.deathsTotal += (d.deaths || []).length;
    let seedMeet = 0, seedEng = 0, seedFlee = 0, seedArmed = 0;
    for (const r of (d.v4encounters || [])) {
      if ((r.wave | 0) < 4) continue;
      seedMeet++; p.meetings++;
      const engaged = (r.rounds | 0) > 0;
      if (engaged) { seedEng++; p.engaged++; }
      const lr = r.leadRule || 'unclassified';
      p.leadRuleCounts[lr] = (p.leadRuleCounts[lr] || 0) + 1;
      if (lr === 'unclassified') p.leadUnclassified++;
      else p.leadAttributed++;
      const parts = r.partyCells || [];
      let armedHere = false, armedLeadHere = false;
      for (const pc of parts) {
        if (pc.rangedId === 'searcaster' && pc.alive !== false && (pc.cells | 0) > 0) {
          armedHere = true;
          if (pc.vid === r.vid) armedLeadHere = true;
        }
      }
      if (armedHere) {
        seedArmed++; p.armedEntries++;
        // PRESENCE FIX (finding #2622): the counter was initialized
        // and read but NEVER incremented — "armed leads 0" was an
        // instrument artifact, not a finding. Count it here, from
        // the already-computed armedLeadHere.
        if (armedLeadHere) p.armedLeads++;
        p.armedMeetings++;
        p.armedDetail.push({ seed: seed, day: r.day, vid: r.vid, mid: r.mid,
          origin: r.origin || null, leadRule: lr, outcome: r.outcome,
          lead: armedLeadHere, volley: r.volley || null,
          partyCells: parts.filter(function (x) { return x.rangedId === 'searcaster'; }) });
      } else p.unarmedMeetings++;
      if (r.volley && (r.volley.shots | 0) > 0 && r.rangedId === 'searcaster') p.armedVolleys++;
      if (r.rangedId && r.volley && (r.volley.shots | 0) > 0) {
        p.volleyDmgLeadRanged += (r.volley.dmg | 0);
        p.mDealtLeadRanged += (r.mDealt | 0);
      }
      const lg = r.leadGear || null;
      if (r.outcome === 'vFlee') {
        seedFlee++; p.flees++;
        const fc = r.fleeCause || 'unclassified';
        p.fleeCauseCounts[fc] = (p.fleeCauseCounts[fc] || 0) + 1;
        if (fc === 'unclassified') p.fleeUnclassified++;
        else p.fleeClassified++;
        if (armedHere) p.armedFlees++; else p.unarmedFlees++;
        if (lg) p.leadGearFlee.push({ bravery: lg.bravery, armorP: lg.armorP, weaponB: lg.weaponB, temper: lg.temper });
        p.fleeDetail.push({ seed: seed, day: r.day, vid: r.vid, mid: r.mid, origin: r.origin || null,
          leadRule: lr, fleeCause: fc, rounds: r.rounds | 0, mDealt: r.mDealt,
          vTaken: r.vTaken, fleeHpFrac: r.fleeHpFrac, armed: armedHere,
          intent: r.intent || null, everHopeless: !!r.everHopeless, everWinning: !!r.everWinning,
          shoutRound: r.shoutRound, volley: r.volley || null });
      } else if (r.outcome === 'vKill') {
        if (lg) p.leadGearKill.push({ bravery: lg.bravery, armorP: lg.armorP, weaponB: lg.weaponB, temper: lg.temper });
      } else if (lg) p.leadGearOther.push({ bravery: lg.bravery, armorP: lg.armorP, weaponB: lg.weaponB, temper: lg.temper });
    }
    p.perSeed.push({ seed: seed, meetings: seedMeet, engaged: seedEng, flees: seedFlee, armed: seedArmed,
      days: (d.days != null ? d.days : (d.gameDays | 0)), endReason: d.endReason,
      standing: d.standing, scaleRank: d.scaleRank, maxWave: d.maxWave, won: !!d.won });
  }
  p.leadAttribution = p.meetings ? p.leadAttributed / p.meetings : null;
  p.fleeClassification = p.flees ? p.fleeClassified / p.flees : null;
  p.deathsPerEngaged = p.engaged ? p.deathsTotal / p.engaged : null;
  p.medianDays = median(p.days);
  return p;
}

// presenceStats(dir): the draft's contact pool + the gun-move
// ledger. Reads v4tickPresence (one row per wave-4+ world monster
// per tick) joined to v4encounters on (day, mid, origin
// 'world-tick'), and v4transfers rows. A pool row with a matching
// world-tick encounter is a tick where the fight happened; if the
// lead is one of the pooled holders the holder led that fight; if
// the lead is someone else while a holder was pooled, the draft
// MISSED (arm leg: a bug, not a finding — the draft fires whenever
// a holder is pooled and the fight happens). A pool row with no
// match is a tick the 0.5 coin flip (or the player's-tile skip)
// kept bloodless — no fight, no draft, no verdict.
// Transfers: kind transfer / vanish / new-holder / holder-died,
// with attribution (grant-*, kill-loot, corpse-take, unexplained).
function presenceStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const p = { dir: dir, n: 0, valid: 0, errors: 0,
    poolTicks: 0, poolHolderPresent: 0, poolOnTile: 0, poolAdjacent: 0, poolAbsent: 0,
    poolFights: 0, poolHolderLed: 0, poolDraftMiss: 0, poolNoFight: 0,
    transfers: 0, vanishes: 0, newHolders: 0, holderDied: 0,
    transferDetail: [], vanishDetail: [], draftMissDetail: [] };
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { p.errors++; continue; }
    p.n++;
    if (!d || typeof d !== 'object') { p.errors++; continue; }
    p.valid++;
    const seed = d.seed;
    const encByKey = {};
    for (const r of (d.v4encounters || [])) {
      if ((r.wave | 0) < 4) continue;
      if (r.origin !== 'world-tick') continue;
      const k = r.day + '|' + r.mid;
      (encByKey[k] = encByKey[k] || []).push(r);
    }
    for (const t of (d.v4tickPresence || [])) {
      p.poolTicks++;
      const pooled = (t.onTile || []).concat(t.adjacent || []);
      if (pooled.length) {
        p.poolHolderPresent++;
        if ((t.onTile || []).length) p.poolOnTile++;
        if ((t.adjacent || []).length) p.poolAdjacent++;
      } else p.poolAbsent++;
      const matches = encByKey[t.day + '|' + t.mid] || [];
      if (!matches.length) { p.poolNoFight++; continue; }
      p.poolFights++;
      let led = false;
      for (const m of matches) if (pooled.indexOf(m.vid) !== -1) { led = true; break; }
      if (led) p.poolHolderLed++;
      else if (pooled.length) {
        p.poolDraftMiss++;
        p.draftMissDetail.push({ seed: seed, day: t.day, mid: t.mid,
          pooled: pooled.slice(), leads: matches.map(function (m) { return m.vid; }) });
      }
    }
    for (const tr of (d.v4transfers || [])) {
      if (tr.kind === 'transfer') { p.transfers++; p.transferDetail.push({ seed: seed, day: tr.day, from: tr.from, to: tr.to, attribution: tr.attribution || null }); }
      else if (tr.kind === 'vanish') { p.vanishes++; p.vanishDetail.push({ seed: seed, day: tr.day, from: tr.from }); }
      else if (tr.kind === 'new-holder') p.newHolders++;
      else if (tr.kind === 'holder-died') p.holderDied++;
    }
  }
  return p;
}

// lendStats(dir): the lend's own fired-rows, joined to the fights
// they fed. Reads v4lends (one row per lend fire, from the driver's
// wraps on _lendSearcaster / _returnLentSearcaster) joined to
// v4encounters on (day, mid, borrower vid = encounter lead) for the
// lent fight's outcome + volley. Borrower survival for the
// separated guardrail: the joined encounter's outcome is not
// 'vDie' AND the borrower has no death row on the lend day in that
// seed (the same-day death-row read can catch a borrower who died
// later the same day in a different fight — disclosed in the
// prereg; the encounter-outcome read is the primary signal). A
// lend with no joined encounter is a lend whose fight never
// recorded (aidFight returning null, or a watch miss) — counted
// separately, never silently dropped.
function lendStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const p = { dir: dir, n: 0, valid: 0, errors: 0,
    lends: 0, lendsGun: 0, lendsCells: 0, lendsTile: 0, lendsAdjacent: 0,
    gunReturned: 0, borrowerKept: 0, cellsReturned: 0, cellsMoved: 0,
    lendsJoined: 0, lendsUnjoined: 0,
    lentVolleys: 0, lentVolleyDmg: 0, lentOutcomes: {},
    borrowerSurvived: 0, borrowerDied: 0, borrowerSurvival: null,
    lendDetail: [] };
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { p.errors++; continue; }
    p.n++;
    if (!d || typeof d !== 'object') { p.errors++; continue; }
    p.valid++;
    const seed = d.seed;
    const encByKey = {};
    for (const r of (d.v4encounters || [])) {
      if ((r.wave | 0) < 4) continue;
      const k = r.day + '|' + r.mid + '|' + r.vid;
      (encByKey[k] = encByKey[k] || []).push(r);
    }
    const deathByDayVid = {};
    for (const death of (d.deaths || [])) {
      const k = (death.day | 0) + '|' + (death.who || '');
      deathByDayVid[k] = true;
    }
    for (const l of (d.v4lends || [])) {
      p.lends++;
      if (l.kind === 'gun') p.lendsGun++;
      else if (l.kind === 'cells') p.lendsCells++;
      if (l.from === 'tile') p.lendsTile++;
      else if (l.from === 'adjacent') p.lendsAdjacent++;
      p.cellsMoved += (l.cellsMoved | 0);
      if (l.gunReturned) p.gunReturned++;
      if (l.lenderAlive === false) p.borrowerKept++;
      p.cellsReturned += (l.cellsReturned | 0);
      const matches = encByKey[l.day + '|' + l.mid + '|' + l.borrower] || [];
      const det = { seed: seed, day: l.day, mid: l.mid, lender: l.lender, borrower: l.borrower,
        kind: l.kind, from: l.from, cellsMoved: l.cellsMoved | 0,
        gunReturned: !!l.gunReturned, cellsReturned: l.cellsReturned | 0,
        lenderAlive: l.lenderAlive, borrowerAlive: l.borrowerAlive,
        joined: matches.length > 0, outcome: null, volley: null, borrowerSurvived: null };
      if (!matches.length) { p.lendsUnjoined++; p.lendDetail.push(det); continue; }
      p.lendsJoined++;
      const enc = matches[0];
      det.outcome = enc.outcome || null;
      det.volley = enc.volley || null;
      p.lentOutcomes[enc.outcome || '?'] = (p.lentOutcomes[enc.outcome || '?'] || 0) + 1;
      if (enc.volley && (enc.volley.shots | 0) > 0 && enc.rangedId === 'searcaster') {
        p.lentVolleys++;
        p.lentVolleyDmg += (enc.volley.dmg | 0);
      }
      const diedInFight = enc.outcome === 'vDie';
      const diedSameDay = !!deathByDayVid[l.day + '|' + l.borrower];
      const survived = !diedInFight && !diedSameDay;
      det.borrowerSurvived = survived;
      if (survived) p.borrowerSurvived++;
      else p.borrowerDied++;
      p.lendDetail.push(det);
    }
  }
  p.borrowerSurvival = p.lendsJoined ? p.borrowerSurvived / p.lendsJoined : null;
  return p;
}

function poolStats(dir) {
  // The lend-opportunity pool (finding #2628, sim-lendpool-a): one row
  // per lendable moment at a wave-4+ fight launch, from the driver's
  // v4lendPool recorder. Raw-moment count AND distinct-fight count
  // (a fight launches once, so one moment per fight by construction —
  // the two counts should agree; report both and let the guardrail
  // catch any divergence). A 0-moment band is a finding, not a
  // metric error: the bar is that the counter ran and reported.
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const p = { dir: dir, n: 0, valid: 0, errors: 0,
    moments: 0, momentsGun: 0, momentsCells: 0, momentsTile: 0, momentsAdjacent: 0,
    fights: 0, perSeed: {}, byKind: {}, byFrom: {}, detail: [] };
  const fightKeys = {};
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { p.errors++; continue; }
    p.n++;
    if (!d || typeof d !== 'object') { p.errors++; continue; }
    p.valid++;
    const seed = d.seed;
    p.perSeed[seed] = p.perSeed[seed] || 0;
    for (const r of (d.v4lendPool || [])) {
      p.moments++;
      p.perSeed[seed]++;
      if (r.kind === 'gun') p.momentsGun++;
      else if (r.kind === 'cells') p.momentsCells++;
      if (r.from === 'tile') p.momentsTile++;
      else if (r.from === 'adjacent') p.momentsAdjacent++;
      p.byKind[r.kind || '?'] = (p.byKind[r.kind || '?'] || 0) + 1;
      p.byFrom[r.from || '?'] = (p.byFrom[r.from || '?'] || 0) + 1;
      const fk = seed + '|' + r.day + '|' + r.mid + '|' + r.lead;
      if (!fightKeys[fk]) { fightKeys[fk] = true; p.fights++; }
      p.detail.push({ seed: seed, day: r.day, mid: r.mid, lead: r.lead, lender: r.lender, kind: r.kind, from: r.from });
    }
  }
  return p;
}

const NEAR_MISS_STATES = ['sheltered', 'resting', 'low-health', 'on-expedition', 'away',
  'at-home', 'in-camp', 'out-in-world', 'no-living-holder', 'unknown'];
function distBucket(d) {
  if (d == null) return 'none';
  if (d === 0) return '0';
  if (d === 1) return '1';
  if (d === 2) return '2';
  if (d === 3) return '3';
  if (d <= 5) return '4-5';
  return '6+';
}
function nearMissStats(dir) {
  // The near-miss diagnosis (finding #2628, sim-lendpool-a): one
  // v4nearMiss row per wave-4+ fight launch. The breakdown is over
  // UNARMED-lead NON-RAID launches only (leadKind gun | cells); the
  // earshot base rate is over ALL non-raid launches. RAID rows
  // (raid: true — defence at the Haven door, drafted defenders)
  // exist ONLY for the coverage join: the encounter recorder logs
  // raid fights through the same choke point, so a raid launch
  // without a near-miss row would read as a missed launch. Coverage
  // is judged against an INDEPENDENT denominator: the v4encounters
  // rows for the same choke-point population (origin world-tick |
  // aid — the resolveWildMonsterEncounter paths — wave >= 4,
  // real-fight outcome, lead unarmed-or-empty at entry from
  // rangedId + partyCells[0].cells, falling back to ammoAtEntry).
  // Join key is seed|day|mid|lead|leadKind, matched as a multiset
  // (the same species can be fought twice in one day by the same
  // lead; a raid and a wild fight by the same lead against the same
  // species on the same day can collide on the key — the encounter
  // row carries no raid flag — rare, and the multiset still counts
  // each fight once). Orphan rows — near-miss rows with no matching
  // encounter row — are counted, never dropped: a taxonomy drift
  // between the two recorders must show up in the coverage number,
  // not hide behind it.
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const p = { dir: dir, n: 0, valid: 0, errors: 0,
    launches: 0, launchesGun: 0, launchesCells: 0, launchesLoaded: 0,
    raidLaunches: 0,
    unarmedLaunches: 0, armedEarshot: 0, eligibleEarshot: 0,
    armedEarshotUnarmed: 0, eligibleEarshotUnarmed: 0,
    byState: {}, byDist: {}, noLivingHolder: 0, lendable: 0, unknown: 0,
    encDenominator: 0, encCovered: 0, coverage: null, orphanRows: 0,
    dominantState: null, dominantN: 0, dominantShare: null,
    secondState: null, secondN: 0, secondShare: null,
    perSeed: {}, detail: [] };
  for (const s of NEAR_MISS_STATES) p.byState[s] = 0;
  for (const b of ['0', '1', '2', '3', '4-5', '6+', 'none']) p.byDist[b] = 0;
  const REAL_OUTCOMES = { vKill: 1, mFlee: 1, vFlee: 1, vDie: 1 };
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { p.errors++; continue; }
    p.n++;
    if (!d || typeof d !== 'object') { p.errors++; continue; }
    p.valid++;
    const seed = d.seed;
    p.perSeed[seed] = p.perSeed[seed] || { launches: 0, unarmed: 0, armedEarshot: 0, eligibleEarshot: 0, lendable: 0, raidLaunches: 0 };
    const nmKeys = {};
    for (const r of (d.v4nearMiss || [])) {
      const isRaid = !!r.raid;
      const k = seed + '|' + r.day + '|' + r.mid + '|' + r.lead + '|' + r.leadKind;
      if (r.leadKind === 'gun' || r.leadKind === 'cells') nmKeys[k] = (nmKeys[k] || 0) + 1;
      if (isRaid) { p.raidLaunches++; p.perSeed[seed].raidLaunches++; continue; }
      p.launches++;
      p.perSeed[seed].launches++;
      if (r.leadKind === 'gun') p.launchesGun++;
      else if (r.leadKind === 'cells') p.launchesCells++;
      else if (r.leadKind === 'loaded') p.launchesLoaded++;
      if (r.anyArmedEarshot) { p.armedEarshot++; p.perSeed[seed].armedEarshot++; }
      if (r.anyEligibleEarshot) { p.eligibleEarshot++; p.perSeed[seed].eligibleEarshot++; }
      if (r.lendable) { p.lendable++; p.perSeed[seed].lendable++; }
      if (r.leadKind === 'gun' || r.leadKind === 'cells') {
        p.unarmedLaunches++;
        p.perSeed[seed].unarmed++;
        const st = (r.nearestState || 'unknown');
        p.byState[st] = (p.byState[st] || 0) + 1;
        p.byDist[distBucket(r.nearestDist)]++;
        if (st === 'no-living-holder') p.noLivingHolder++;
        if (st === 'unknown') p.unknown++;
        if (r.anyArmedEarshot) p.armedEarshotUnarmed++;
        if (r.anyEligibleEarshot) p.eligibleEarshotUnarmed++;
        p.detail.push({ seed: seed, day: r.day, mid: r.mid, lead: r.lead, leadKind: r.leadKind,
          nearestHolder: r.nearestHolder, nearestDist: r.nearestDist, nearestState: st,
          nearestHealth: r.nearestHealth, anyArmedEarshot: !!r.anyArmedEarshot,
          anyEligibleEarshot: !!r.anyEligibleEarshot, lendable: !!r.lendable });
      }
    }
    // Independent denominator from v4encounters (same choke point).
    for (const e of (d.v4encounters || [])) {
      if (((e.wave | 0) < 4) || !REAL_OUTCOMES[e.outcome]) continue;
      if (e.origin !== 'world-tick' && e.origin !== 'aid') continue;
      let leadCells = null;
      try {
        if (e.partyCells && e.partyCells[0]) leadCells = e.partyCells[0].cells | 0;
        else if (e.rangedId === 'searcaster') leadCells = e.ammoAtEntry | 0;
        else leadCells = 0;
      } catch (err) { leadCells = 0; }
      const unarmed = (e.rangedId !== 'searcaster') || (leadCells === 0);
      if (!unarmed) continue;
      p.encDenominator++;
      const encKind = (e.rangedId === 'searcaster') ? 'cells' : 'gun';
      const k = seed + '|' + e.day + '|' + e.mid + '|' + e.vid + '|' + encKind;
      if (nmKeys[k] > 0) { nmKeys[k]--; p.encCovered++; }
    }
    for (const k of Object.keys(nmKeys)) p.orphanRows += nmKeys[k];
  }
  p.coverage = (p.encDenominator > 0) ? (p.encCovered / p.encDenominator) : null;
  const ranked = NEAR_MISS_STATES.map(function (s) { return { state: s, n: p.byState[s] || 0 }; })
    .sort(function (a, b) { return b.n - a.n; });
  if (p.unarmedLaunches > 0) {
    p.dominantState = ranked[0].state; p.dominantN = ranked[0].n;
    p.dominantShare = ranked[0].n / p.unarmedLaunches;
    p.secondState = ranked[1].state; p.secondN = ranked[1].n;
    p.secondShare = ranked[1].n / p.unarmedLaunches;
  }
  return p;
}

function judgeLendpool(nm, pool, lend, pres) {
  // Frozen bars (prereg): (1) near-miss coverage >= 0.95 with <= 5%
  // unclassified rows (vacuous-pass only when the encounter
  // denominator is 0 — no unarmed launches to classify); (2) pool
  // re-verified — the counter ran on all 8 seeds, the near-miss
  // lendable count agrees with the v4lendPool moment count, and the
  // lend stayed OFF (v4lends empty); (3) the answer is quantified
  // — an unarmed population exists to break down, the dominant
  // nearest-holder state is named with its share, and the earshot
  // base rate has a denominator. Diffuse (< 30% largest class) is
  // still a quantified answer: the top two are named and the
  // evidence must say so plainly.
  const bars = [];
  const denom = nm.encDenominator;
  const unknownShare = (nm.unarmedLaunches > 0) ? (nm.unknown / nm.unarmedLaunches) : 0;
  const covOk = (denom === 0) ? true : (nm.coverage != null && nm.coverage >= 0.95 && unknownShare <= 0.05);
  bars.push({ id: 'near-miss-coverage', pass: covOk,
    detail: (denom === 0
      ? 'encounter denominator 0 — coverage vacuous (no unarmed-lead wave-4+ launches to classify); near-miss rows ' + nm.unarmedLaunches
      : 'encounter-derived unarmed launches ' + denom + ', covered ' + nm.encCovered +
        ' (coverage ' + (nm.coverage == null ? 'n/a' : (nm.coverage * 100).toFixed(1) + '%') + ', bar >= 95%)' +
        '; unclassified rows ' + nm.unknown + '/' + nm.unarmedLaunches + ' (' + (unknownShare * 100).toFixed(1) + '%, bar <= 5%)' +
        '; orphan near-miss rows ' + nm.orphanRows) });
  const poolOk = !!pool && pool.valid === 8 && pool.errors === 0;
  const crossOk = !!pool && nm.lendable === pool.moments;
  const lendOff = !!lend && ((lend.lends | 0) === 0);
  bars.push({ id: 'pool-reverified', pass: poolOk && crossOk && lendOff,
    detail: 'pool counter files ' + (pool ? pool.valid : 'n/a') + '/8 (errors ' + (pool ? pool.errors : 'n/a') + ')' +
      '; near-miss lendable rows ' + nm.lendable + ' vs v4lendPool moments ' + (pool ? pool.moments : 'n/a') +
      ' (' + (crossOk ? 'agree' : 'MISMATCH') + '); v4lends ' + (lend ? (lend.lends | 0) : 'n/a') +
      ' (' + (lendOff ? 'lend stayed OFF' : 'LEND FIRED') + ')' });
  const diffuse = nm.dominantShare != null && nm.dominantShare < 0.30;
  const ansOk = nm.unarmedLaunches > 0 && nm.launches > 0;
  bars.push({ id: 'answer-quantified', pass: ansOk,
    detail: (nm.unarmedLaunches === 0
      ? 'no unarmed-lead wave-4+ launches on the band — nothing to break down'
      : 'dominant nearest-holder state ' + nm.dominantState + ' ' + nm.dominantN + '/' + nm.unarmedLaunches +
        ' (' + (nm.dominantShare * 100).toFixed(1) + '%)' +
        (diffuse ? ' — DIFFUSE: no single class >= 30%; second ' + nm.secondState + ' ' + nm.secondN +
          '/' + nm.unarmedLaunches + ' (' + (nm.secondShare * 100).toFixed(1) + '%)' : '') +
        '; earshot base rate over ALL ' + nm.launches + ' NON-RAID wave-4+ launches: armed ' +
        nm.armedEarshot + ' (' + (nm.launches ? (nm.armedEarshot / nm.launches * 100).toFixed(1) : 'n/a') + '%)' +
        ', eligible ' + nm.eligibleEarshot + ' (' + (nm.launches ? (nm.eligibleEarshot / nm.launches * 100).toFixed(1) : 'n/a') + '%)' +
        '; raid launches ' + nm.raidLaunches + ' (coverage rows only, excluded from the breakdown)') +
      (pres ? '; draft-miss cross-check (tick rows): ' + pres.poolDraftMiss + ' misses over ' + pres.poolFights + ' pooled fights' : '') });
  const verdict = bars.every(function (b) { return b.pass; }) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const kind = !covOk ? 'METRIC-BROKEN' : ((!poolOk || !crossOk || !lendOff) ? 'SUBSTRATE' : (!ansOk ? 'NO-POPULATION' : null));
  return { verdict: verdict, kind: kind, bars: bars };
}

const GUARDRAIL_EXCLUDE = { arm: 1, run: 1, mode: 1, leg: 1, v4lendPool: 1 };
function firstDiff(a, b, path) {
  // First differing path between two parsed corpora, or null when
  // equal. Order-insensitive on object keys; reports lengths and
  // scalar values so a guardrail failure names the field, not just
  // the file.
  if (a === b) return null;
  if (typeof a !== typeof b) return path + ' (type ' + typeof a + ' vs ' + typeof b + ')';
  if (a && b && typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return path + ' (array vs object)';
    if (Array.isArray(a)) {
      if (a.length !== b.length) return path + '.length (' + a.length + ' vs ' + b.length + ')';
      for (let i = 0; i < a.length; i++) { const d = firstDiff(a[i], b[i], path + '[' + i + ']'); if (d) return d; }
      return null;
    }
    const keys = {};
    for (const k of Object.keys(a)) keys[k] = 1;
    for (const k of Object.keys(b)) keys[k] = 1;
    for (const k of Object.keys(keys)) {
      if (!(k in a)) return path + '.' + k + ' (missing in ctl)';
      if (!(k in b)) return path + '.' + k + ' (missing in fix)';
      const d = firstDiff(a[k], b[k], path + '.' + k); if (d) return d;
    }
    return null;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    // INSTRUMENT FIX (adoption, sim-lendpool-a): the grant/v4seed wraps
    // capture a stack frame naming the DRIVER's own file:line
    // (grantEvents[].frame, v4seeds[].caller). The two legs run
    // different driver files, so those strings differ by construction
    // and can never match — they record the instrument's identity,
    // not the game. Normalize the driver file:line:col out before
    // comparing; any other difference in the same string still fails.
    const normDriver = function (s) { return s.replace(/[^\s'"]*?(lend-driver-a|lendfix-driver-a)\.js:\d+:\d+/g, '<DRIVER>'); };
    if (normDriver(a) === normDriver(b)) return null;
  }
  return path + ' (' + JSON.stringify(a) + ' vs ' + JSON.stringify(b) + ')';
}
function guardrailIdentity(ctlDir, fixDir) {
  // The lend-off guardrail (prereg bar 3): with the lend OFF on both
  // legs, the two corpora must be byte-identical on every simulation
  // field EXCEPT the new v4lendPool rows and run/mode/leg metadata
  // (arm/run/mode/leg). Files are matched by their parsed `seed`,
  // not by file name (the two drivers write different prefixes).
  // Any other difference is STOP-and-diagnose, not a verdict input.
  const res = { identical: true, diffs: [], ctlFiles: 0, fixFiles: 0, seeds: 0 };
  function readMap(dir) {
    const m = {};
    if (!fs.existsSync(dir)) return m;
    for (const f of fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort()) {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (d && typeof d === 'object' && d.seed != null) m[d.seed] = d;
      } catch (e) {}
    }
    return m;
  }
  const ctl = readMap(ctlDir), fix = readMap(fixDir);
  res.ctlFiles = Object.keys(ctl).length;
  res.fixFiles = Object.keys(fix).length;
  const seeds = {};
  for (const s of Object.keys(ctl)) seeds[s] = 1;
  for (const s of Object.keys(fix)) seeds[s] = 1;
  res.seeds = Object.keys(seeds).length;
  function strip(d) {
    const o = {};
    for (const k of Object.keys(d)) if (!GUARDRAIL_EXCLUDE[k]) o[k] = d[k];
    return o;
  }
  for (const s of Object.keys(seeds).sort()) {
    if (!(s in ctl)) { res.identical = false; res.diffs.push({ seed: +s, diff: 'seed missing in ctl' }); continue; }
    if (!(s in fix)) { res.identical = false; res.diffs.push({ seed: +s, diff: 'seed missing in fix' }); continue; }
    const d = firstDiff(strip(ctl[s]), strip(fix[s]), 'seed ' + s);
    if (d) { res.identical = false; res.diffs.push({ seed: +s, diff: d }); }
  }
  return res;
}

function judgeLendfix(ctlPool, fixPool, ctlLend, fixLend, guard) {
  // Frozen bars (prereg): (1) pool measured — the fix leg carries
  // v4lendPool on all 8 seeds (the counter RAN and reported; the
  // moment count itself may be 0 — that is a finding, not a
  // failure); (2) guardrail — the two corpora are byte-identical
  // except v4lendPool + metadata; (3) lend stayed OFF — v4lends
  // empty on both legs (a non-empty v4lends is a STOP, not a row).
  const bars = [];
  const poolOk = !!fixPool && fixPool.valid === 8 && fixPool.errors === 0;
  bars.push({ id: 'pool-measured', pass: poolOk,
    detail: 'fix leg files read ' + (fixPool ? fixPool.valid : 'n/a') + '/8 (errors ' +
      (fixPool ? fixPool.errors : 'n/a') + '); moments ' + (fixPool ? fixPool.moments : 'n/a') +
      ' (' + (fixPool ? fixPool.momentsGun : 'n/a') + ' gun, ' + (fixPool ? fixPool.momentsCells : 'n/a') +
      ' cells; ' + (fixPool ? fixPool.momentsTile : 'n/a') + ' tile, ' + (fixPool ? fixPool.momentsAdjacent : 'n/a') +
      ' adjacent) across ' + (fixPool ? fixPool.fights : 'n/a') + ' distinct fights; per-seed ' +
      JSON.stringify(fixPool ? fixPool.perSeed : {}) +
      (poolOk && fixPool.moments === 0 ? ' — 0-moment band: a finding, not a metric error' : '') });
  const guardOk = !!guard && guard.identical;
  bars.push({ id: 'guardrail-byte-identity', pass: guardOk,
    detail: guardOk
      ? 'ctl/fix corpora identical on all simulation fields except v4lendPool + metadata (' +
        guard.seeds + ' seeds, ' + guard.ctlFiles + ' ctl files, ' + guard.fixFiles + ' fix files)'
      : 'GUARDRAIL FAILED — first diffs: ' + JSON.stringify((guard ? guard.diffs : []).slice(0, 5)) +
        ' (ctl files ' + (guard ? guard.ctlFiles : 'n/a') + ', fix files ' + (guard ? guard.fixFiles : 'n/a') + ')' });
  const ctlL = ctlLend ? (ctlLend.lends | 0) : -1;
  const fixL = fixLend ? (fixLend.lends | 0) : -1;
  const lendsOk = ctlL === 0 && fixL === 0;
  bars.push({ id: 'lend-stayed-off', pass: lendsOk,
    detail: 'v4lends rows ctl ' + ctlL + ', fix ' + fixL + ' (bar 0 on both — the lend stayed OFF)' });
  const verdict = (poolOk && guardOk && lendsOk) ? 'GO' : 'NO-GO';
  const kind = !guardOk ? 'SUBSTRATE' : (!lendsOk ? 'SUBSTRATE' : (!poolOk ? 'METRIC-BROKEN' : null));
  return { verdict: verdict, kind: kind, bars: bars };
}

function judgeParticipation(p) {
  // Frozen bars (prereg): (1) lead-rule attribution >= 0.80 of
  // wave-4+ meetings; (2) flee-cause classification >= 0.80 of flee
  // events AND <= 2 unclassified; (3) pool floors >= 25 meetings AND
  // >= 8 flees, else DIAG-NO-GO kind METRIC-BROKEN / pool-blocked.
  const bars = [];
  const leadOk = p.meetings > 0 && p.leadAttribution != null && p.leadAttribution >= 0.80;
  bars.push({ id: 'lead-rule-attribution', pass: leadOk,
    detail: 'lead rule attributed ' + p.leadAttributed + '/' + p.meetings +
      ' (' + (p.leadAttribution == null ? 'n/a' : p.leadAttribution.toFixed(3)) + ', bar >= 0.80); by rule ' +
      JSON.stringify(p.leadRuleCounts) + '; unclassified ' + p.leadUnclassified });
  const fleeOk = p.flees > 0 && p.fleeClassification != null && p.fleeClassification >= 0.80 && p.fleeUnclassified <= 2;
  bars.push({ id: 'flee-cause-classification', pass: fleeOk,
    detail: 'flee cause classified ' + p.fleeClassified + '/' + p.flees +
      ' (' + (p.fleeClassification == null ? 'n/a' : p.fleeClassification.toFixed(3)) + ', bar >= 0.80); unclassified ' +
      p.fleeUnclassified + ' (bar <= 2); by cause ' + JSON.stringify(p.fleeCauseCounts) });
  const poolOk = p.meetings >= 25 && p.flees >= 8;
  bars.push({ id: 'pool-floors', pass: poolOk,
    detail: 'wave-4+ meetings ' + p.meetings + ' (floor 25); flees ' + p.flees + ' (floor 8)' +
      (poolOk ? '' : ' — METRIC-BROKEN / pool-blocked: the band is too quiet to judge the bars') });
  const verdict = (leadOk && fleeOk && poolOk) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const kind = (!poolOk) ? 'METRIC-BROKEN' : ((!leadOk || !fleeOk) ? 'ATTRIBUTION' : null);
  return { verdict: verdict, kind: kind, bars: bars };
}

function judge(st) {
  // Frozen bars (prereg): (1) census coverage complete on all 8
  // seeds; (2) attribution >= 0.90, or zero appearances
  // (PASS-vacuous when bar 1 passes); (3) volley-opportunity pool
  // >= 5, or the rare-rate conclusion (pool < 5 stated as a finding).
  const bars = [];
  const covOk = st.n === 8 && st.coverageComplete === 8;
  bars.push({ id: 'census-coverage', pass: covOk,
    detail: 'seeds with complete holder census ' + st.coverageComplete + '/' + st.n +
      ' (baseline + daily census + cellPile rows, 0 instrument errors, census-day share >= 0.5); per-seed: ' +
      st.coverage.map(function (c) { return c.seed + ':' + (c.complete ? 'ok' : 'INCOMPLETE(baseline=' + c.baselineRows + ',census=' + c.censusRows + ',pile=' + c.cellPileRows + ',err=' + c.instrumentErrors + ',share=' + (c.censusDayShare == null ? 'n/a' : c.censusDayShare.toFixed(2)) + ')'); }).join(' ') });
  const zeroApp = st.cellAppearances === 0;
  const attrOk = zeroApp ? covOk : (st.cellAttribution != null && st.cellAttribution >= 0.90);
  bars.push({ id: 'attribution', pass: attrOk,
    detail: zeroApp
      ? 'cell appearances 0 — PASS-vacuous (bar 1 ' + (covOk ? 'passes' : 'FAILS') + '); zero-supply conclusion stands on the census + the frozen loot-pool mechanism (loot is the sole in-code route)'
      : 'cell appearances ' + st.cellAppearances + ', attributed ' + st.cellAttributed + ' (completeness ' + st.cellAttribution.toFixed(3) + ', bar >= 0.90); by source ' + JSON.stringify(st.cellBySource) });
  const poolOk = st.poolEngagedZero >= 5;
  const rareOk = !poolOk && st.searcasterHolderDays >= 0; // the rare-rate path: the pool size itself is the finding
  bars.push({ id: 'volley-opportunity-pool', pass: poolOk || rareOk,
    detail: 'engaged wave-4+ meetings with a 0-cell searcaster participant ' + st.poolEngagedZero +
      ' (floor 5); armed searcaster meetings ' + st.poolEngagedArmed +
      '; all wave-4+ meetings with a 0-cell searcaster participant ' + st.poolAllZero +
      ' (evaded ' + st.poolEvadedZero + '); searcaster holder-days ' + st.searcasterHolderDays +
      (poolOk ? '' : ' — RARE-RATE path: pool thin, stated as a finding, not re-scored') });
  const verdict = (covOk && attrOk && (poolOk || rareOk)) ? 'DIAG-GO' : 'DIAG-NO-GO';
  return { verdict: verdict, bars: bars };
}

function judgeLend(ctlDiag, ctlPart, armDiag, armPart, ctlLend, armLend) {
  // Frozen bars (prereg): (1) arm villager searcaster-holder-days
  // >= 40; (2) arm armed-holder entries (wave-4+ entry, searcaster +
  // >= 1 cell, any participant) >= 3; (3) arm armed volleys fired
  // (lead rangedId searcaster, shots > 0) >= 2; (4) no-regression
  // guardrail, SEPARATED (chosen before judging — presence §9
  // proposal): (i) lent-fight safety — the borrower is alive at
  // fight end in >= 50% of lent fights (applies only if >= 1 lend
  // fired; skipped, not failed, with 0 lends); (ii) downstream —
  // arm deaths per engaged wave-4+ meeting <= 1.10 x ctl AND arm
  // median survival >= 0.80 x ctl; (5) starvation guardrail: arm
  // villager starvation deaths <= ctl + 2.
  const bars = [];
  const hd = armDiag ? (armDiag.searcasterHolderDays | 0) : 0;
  const b1 = hd >= 40;
  bars.push({ id: 'searcaster-holder-days', pass: b1,
    detail: 'arm villager searcaster-holder-days ' + hd + ' (floor 40); ctl ' +
      (ctlDiag ? (ctlDiag.searcasterHolderDays | 0) : 'n/a') });
  const ae = armPart ? (armPart.armedEntries | 0) : 0;
  const b2 = ae >= 3;
  bars.push({ id: 'armed-holder-entries', pass: b2,
    detail: 'arm armed-holder entries ' + ae + ' (floor 3); armed leads ' +
      (armPart ? (armPart.armedLeads | 0) : 'n/a') + '; ctl entries ' +
      (ctlPart ? (ctlPart.armedEntries | 0) : 'n/a') });
  const av = armPart ? (armPart.armedVolleys | 0) : 0;
  const b3 = av >= 2;
  bars.push({ id: 'armed-volley-fired', pass: b3,
    detail: 'arm armed volleys fired ' + av + ' (floor 2); ctl ' +
      (ctlPart ? (ctlPart.armedVolleys | 0) : 'n/a') +
      (b3 ? '' : ' — PARTICIPATION finding if bars 1-2 pass: the gun reaches hands that never lead') });
  let b4 = false, gDetail = '';
  const ctlD = ctlPart ? ctlPart.deathsPerEngaged : null;
  const armD = armPart ? armPart.deathsPerEngaged : null;
  const ctlM = ctlPart ? ctlPart.medianDays : null;
  const armM = armPart ? armPart.medianDays : null;
  // (i) lent-fight safety — the mechanism's own harm, judged on
  // the lent fights themselves. With 0 lends this part is skipped
  // (bars 2-3 already fail as participation then).
  const armLends = armLend ? (armLend.lendsJoined | 0) : 0;
  const armSurv = armLend ? armLend.borrowerSurvival : null;
  let safeOk = true, safeDetail = '';
  if ((armLend ? (armLend.lends | 0) : 0) === 0) {
    safeDetail = 'lent fights 0 — safety part skipped (no lends fired; bars 2-3 judge participation)';
  } else if (armLends === 0) {
    safeOk = false;
    safeDetail = 'lent fights joined 0/' + (armLend.lends | 0) + ' — no lent fight recorded, cannot judge safety';
  } else {
    safeOk = armSurv != null && armSurv >= 0.50;
    safeDetail = 'borrower survived ' + (armLend.borrowerSurvived | 0) + '/' + armLends +
      ' lent fights (' + (armSurv == null ? 'n/a' : (armSurv * 100).toFixed(0) + '%') + ', bar >= 50%)';
  }
  // (ii) downstream — the cascade check, at the gunrate arm's 1.10x
  // allowance (the strict 1.00x bar cannot tell a harmful lever
  // from an unlucky cascade — presence §9).
  let downOk = false, downDetail = '';
  if (ctlD == null || armD == null || ctlM == null || armM == null) {
    downDetail = 'unjudgeable: deaths/engaged ctl ' + ctlD + ' arm ' + armD +
      '; median days ctl ' + ctlM + ' arm ' + armM + ' (a leg with zero engaged meetings cannot be guardrailed)';
  } else {
    const dOk = armD <= 1.10 * ctlD;
    const mOk = armM >= 0.80 * ctlM;
    downOk = dOk && mOk;
    downDetail = 'deaths per engaged meeting arm ' + armD.toFixed(2) + ' vs ctl ' + ctlD.toFixed(2) +
      ' (bar <= ' + (1.10 * ctlD).toFixed(2) + ', ' + (dOk ? 'pass' : 'FAIL') + '); median survival arm ' +
      armM + 'd vs ctl ' + ctlM + 'd (bar >= ' + (0.80 * ctlM).toFixed(1) + ', ' + (mOk ? 'pass' : 'FAIL') + ')';
  }
  b4 = safeOk && downOk;
  gDetail = 'SEPARATED guardrail — (i) lent-fight safety: ' + safeDetail + ' (' + (safeOk ? 'pass' : 'FAIL') +
    '); (ii) downstream: ' + downDetail + ' (' + (downOk ? 'pass' : 'FAIL') + ')';
  bars.push({ id: 'guardrail-separated', pass: b4, detail: gDetail });
  const ctlS = ctlDiag ? (ctlDiag.starvationVillager | 0) : null;
  const armS = armDiag ? (armDiag.starvationVillager | 0) : null;
  const b5 = (ctlS != null && armS != null) ? (armS <= ctlS + 2) : false;
  bars.push({ id: 'starvation-guardrail', pass: b5,
    detail: 'villager starvation deaths arm ' + armS + ' vs ctl ' + ctlS + ' (bar <= ' + (ctlS != null ? (ctlS + 2) : 'n/a') + ')' });
  const verdict = (b1 && b2 && b3 && b4 && b5) ? 'GO' : 'NO-GO';
  const kind = !b1 ? 'SUPPLY' : ((!b2 || !b3) ? 'PARTICIPATION' : ((!b4 || !b5) ? 'GUARDRAIL' : null));
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'bowopenOn', 'senseexpedOn', 'speargateOn', 'gunrateOn',
    'coverage', 'coverageComplete',
    'searcasterHolders', 'searcasterHolderDays', 'searcasterCellDays', 'searcasterZeroDays',
    'searcasterHoldersTotal', 'cellHolderDays', 'maxCellsEver',
    'cellAppearances', 'cellAttributed', 'cellAttribution', 'cellBySource',
    'searcasterAppearances', 'searcasterAttributed', 'searcasterAttribution', 'searcasterBySource',
    'searcasterBaseline', 'cellBaseline',
    'searcasterDeparts', 'searcasterDepartsZero', 'searcasterDepartOutcomes',
    'lootCellDrops', 'lootSearcasterDrops', 'lootByDrop',
    'grantCellByCaller', 'grantSearcasterByCaller',
    'grantCellTotal', 'grantSearcasterTotal',
    'corpseTakeCell', 'corpseTakeTotal', 'contestPrizes',
    'scholarCellAppearances', 'scholarCellAttributed', 'scholarCellBySource',
    'playerCrafts', 'playerCraftCell', 'playerCraftByRecipe',
    'pileMaxTotal', 'pileEverPositive', 'scholarMaxCells',
    'poolEngagedZero', 'poolEngagedArmed', 'poolAllZero', 'poolEvadedZero',
    'volleyFiredFromSearcaster', 'noFusionCellsLines',
    'encWave4Plus', 'encEngaged',
    'medianDays', 'communityLost', 'national', 'seedWins', 'wave4', 'wave5', 'scaleRanks',
    'starvation', 'starvationVillager', 'perSeed']) o[k] = st[k];
  return o;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  function mkSeed(o) {
    return Object.assign({ seed: 1, days: 4, gameDays: 4, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [], bowopenOn: false, senseexpedOn: true,
      deaths: [], teleCounts: {}, teleRows: [],
      v4encounters: [], ammoDeparts: [], ammoLoot: [], ammoPlayerCraft: [],
      ammoCensus: [], cellPile: [], ammoBaseline: null }, o);
  }
  // Seed 1: chen-like holder (searcaster from baseline, 0 cells all
  // along) + a looted cell + a spawned searcaster arrival.
  const seed = mkSeed({
    ammoBaseline: { day: 1, pile: {}, pileCells: { materials: 0, weapons: 0, armor: 0, tools: 0, medicine: 0, total: 0 },
      scholarCells: { cells: 0, rangedId: null, ammoId: null },
      census: [
        { vid: 'chen', rangedId: 'searcaster', ammoId: 'fusion_cell', ammo: 0, stashAmmo: 0, away: false, exped: false, cells: 0, cellsStash: 0 },
        { vid: 'ana', rangedId: 'bow', ammoId: 'arrow', ammo: 5, stashAmmo: 0, away: false, exped: false, cells: 0, cellsStash: 0 },
      ] },
    ammoCensus: [
      { day: 2, vid: 'chen', rangedId: 'searcaster', ammoId: 'fusion_cell', ammo: 0, stashAmmo: 0, away: false, exped: false, cells: 0, cellsStash: 0 },
      { day: 2, vid: 'ana', rangedId: 'bow', ammoId: 'arrow', ammo: 5, stashAmmo: 0, away: false, exped: false, cells: 0, cellsStash: 0 },
      { day: 3, vid: 'chen', rangedId: 'searcaster', ammoId: 'fusion_cell', ammo: 0, stashAmmo: 0, away: false, exped: false, cells: 0, cellsStash: 0 },
      { day: 3, vid: 'ana', rangedId: 'bow', ammoId: 'arrow', ammo: 5, stashAmmo: 0, away: false, exped: false, cells: 2, cellsStash: 0 },
      { day: 4, vid: 'chen', rangedId: 'searcaster', ammoId: 'fusion_cell', ammo: 0, stashAmmo: 0, away: false, exped: false, cells: 0, cellsStash: 0 },
      { day: 4, vid: 'ana', rangedId: 'bow', ammoId: 'arrow', ammo: 5, stashAmmo: 0, away: false, exped: false, cells: 1, cellsStash: 0 },
      { day: 4, vid: 'new1', rangedId: 'searcaster', ammoId: 'fusion_cell', ammo: 0, stashAmmo: 0, away: false, exped: false, cells: 0, cellsStash: 0 },
    ],
    cellPile: [
      { day: 2, materials: 0, weapons: 0, armor: 0, tools: 0, medicine: 0, total: 0, scholar: { cells: 0, rangedId: null, ammoId: null } },
      { day: 3, materials: 0, weapons: 0, armor: 0, tools: 0, medicine: 0, total: 0, scholar: { cells: 0, rangedId: null, ammoId: null } },
      { day: 4, materials: 0, weapons: 0, armor: 0, tools: 0, medicine: 0, total: 0, scholar: { cells: 1, rangedId: null, ammoId: null } },
    ],
    ammoLoot: [{ day: 3, vid: 'ana', mid: 'audit', dropId: 'arrow', kind: 'ammo' }],
    ammoPlayerCraft: [{ day: 5, vid: 'p', recipeId: 'arrow', ok: true }],
    teleRows: [],
    grantEvents: [{ day: 3, itemId: 'fusion_cell', toKind: 'villager', toVid: 'ana', caller: 'contest-prize', frame: 'at _cxItemPrize (contests.js:185)' }],
    corpseTakeEvents: [{ day: 4, itemId: 'fusion_cell', toKind: 'scholar' }],
    contestPrizeEvents: [{ day: 3, who: 'ana', contest: 'c1', granted: true }],
    ammoDeparts: [
      { day: 2, vid: 'chen', site: 'expedition', planWave4: true, rangedId: 'searcaster', ammoId: 'fusion_cell', carriedBefore: 0, carriedAfter: 0, stashBefore: 0, pocketed: 0, crafted: 0, craftedOk: false, outcome: 'no-source-kind', reason: 'no-source-kind' },
    ],
    v4encounters: [
      { day: 2, vid: 'chen', mid: 'audit', wave: 4, origin: 'expedition', outcome: 'vFlee', rounds: 6, mDealt: 200, mHpStart: 1000, vTaken: 50, rangedId: 'searcaster', ammoAtEntry: 0, volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 }, partyCells: [{ vid: 'chen', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 0, alive: true }], log: ['chen has Searcaster but no fusion cells — the string stays drawn, useless.'] },
      { day: 3, vid: 'ana', mid: 'eulogy', wave: 4, origin: 'world-tick', outcome: 'evade', rounds: 0, mDealt: 0, mHpStart: null, vTaken: 0, rangedId: 'bow', ammoAtEntry: 5, volley: null, partyCells: [{ vid: 'ana', rangedId: 'bow', ammoId: 'arrow', cells: 2, alive: true }], log: [] },
    ],
  });
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed));
  const st = cellStats(dir);
  check('coverage complete on the fixture seed', st.coverageComplete === 1 && st.coverage[0].complete, JSON.stringify(st.coverage));
  check('searcaster holders: chen 3 days + new1 1 day = 4 holder-days, 2 holders', st.searcasterHolderDays === 4 && st.searcasterHoldersTotal === 2, JSON.stringify({ d: st.searcasterHolderDays, n: st.searcasterHoldersTotal }));
  check('searcaster zero-days 4, cell-days 0', st.searcasterZeroDays === 4 && st.searcasterCellDays === 0, JSON.stringify({ z: st.searcasterZeroDays, c: st.searcasterCellDays }));
  check('cell holder-days 2 (ana d3-d4)', st.cellHolderDays === 2, 'got ' + st.cellHolderDays);
  check('max cells ever 2', st.maxCellsEver === 2, 'got ' + st.maxCellsEver);
  check('cell appearances 2 (ana contest-prize + scholar corpse-take), attributed 2', st.cellAppearances === 2 && st.cellAttributed === 2 && st.cellAttribution === 1 && st.cellBySource['contest-prize'] === 1 && st.cellBySource['corpse-take'] === 1, JSON.stringify({ a: st.cellAppearances, at: st.cellAttributed, by: st.cellBySource }));
  check('scholar cell appearances 1, attributed corpse-take', st.scholarCellAppearances === 1 && st.scholarCellAttributed === 1 && st.scholarCellBySource['corpse-take'] === 1, JSON.stringify({ a: st.scholarCellAppearances, by: st.scholarCellBySource }));
  check('searcaster appearances 1 (new1 spawned), baseline 1 (chen)', st.searcasterAppearances === 1 && st.searcasterBySource.spawned === 1 && st.searcasterBaseline === 1, JSON.stringify({ a: st.searcasterAppearances, by: st.searcasterBySource, b: st.searcasterBaseline }));
  check('grants: 1 cell via contest-prize; corpse takes: 1 cell', st.grantCellTotal === 1 && st.grantCellByCaller['contest-prize'] === 1 && st.corpseTakeCell === 1, JSON.stringify({ g: st.grantCellTotal, by: st.grantCellByCaller, t: st.corpseTakeCell }));
  check('contest prize events 1', st.contestPrizes === 1, 'got ' + st.contestPrizes);
  check('player crafts 1 (arrow), 0 fusion_cell', st.playerCrafts === 1 && st.playerCraftCell === 0, JSON.stringify({ n: st.playerCrafts, c: st.playerCraftCell }));
  check('searcaster departures 1, zero 1, no-source-kind', st.searcasterDeparts === 1 && st.searcasterDepartsZero === 1 && st.searcasterDepartOutcomes['no-source-kind'] === 1, JSON.stringify({ d: st.searcasterDeparts, z: st.searcasterDepartsZero, o: st.searcasterDepartOutcomes }));
  check('pool: engaged zero-cell 1, all zero 1, evaded 0, armed 0', st.poolEngagedZero === 1 && st.poolAllZero === 1 && st.poolEvadedZero === 0 && st.poolEngagedArmed === 0, JSON.stringify({ e: st.poolEngagedZero, a: st.poolAllZero, v: st.poolEvadedZero, ar: st.poolEngagedArmed }));
  check('no-fusion-cells log line counted 1', st.noFusionCellsLines === 1, 'got ' + st.noFusionCellsLines);
  check('volley fired from searcaster 0', st.volleyFiredFromSearcaster === 0, 'got ' + st.volleyFiredFromSearcaster);
  check('pile max 0, scholar max 1 (corpse-taken cell)', st.pileMaxTotal === 0 && st.scholarMaxCells === 1, JSON.stringify({ p: st.pileMaxTotal, s: st.scholarMaxCells }));
  // attributeIncrease unit checks (pure).
  const uctx = { loot: [], crafts: [], grants: [], takes: [], role: 'villager',
    baselineVids: new Set(['a', 'b']),
    series: { a: [{ day: 1, total: 0 }, { day: 5, total: 2 }], b: [{ day: 1, total: 2 }, { day: 5, total: 0 }] } };
  check('attributeIncrease moved (b lost 2 as a gained 2)', attributeIncrease(uctx, 'a', 1, 5, 'fusion_cell') === 'moved');
  check('attributeIncrease unexplained (no event, no decrease)', attributeIncrease({ loot: [], crafts: [], grants: [], takes: [], role: 'villager', baselineVids: new Set(['a']), series: { a: [{ day: 1, total: 0 }, { day: 5, total: 1 }] } }, 'a', 1, 5, 'fusion_cell') === 'unexplained');
  check('attributeIncrease spawned (new vid)', attributeIncrease({ loot: [], crafts: [], grants: [], takes: [], role: 'villager', baselineVids: new Set(['a']), series: {} }, 'newbie', 1, 5, 'fusion_cell') === 'spawned');
  check('attributeIncrease contest-prize via grant', attributeIncrease({ loot: [], crafts: [], grants: [{ day: 3, itemId: 'fusion_cell', toKind: 'villager', toVid: 'a', caller: 'contest-prize' }], takes: [], role: 'villager', baselineVids: new Set(['a']), series: {} }, 'a', 1, 5, 'fusion_cell') === 'contest-prize');
  check('attributeIncrease corpse-take for the scholar', attributeIncrease({ loot: [], crafts: [], grants: [], takes: [{ day: 3, itemId: 'fusion_cell' }], role: 'scholar', baselineVids: new Set([]), series: {} }, '__scholar__', 1, 5, 'fusion_cell') === 'corpse-take');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  // Judge shapes (bars: 0 coverage, 1 attribution, 2 pool).
  function mk(o) {
    return Object.assign({ n: 8, coverageComplete: 8,
      coverage: [1, 2, 3, 4, 5, 6, 7, 8].map(function (s) { return { seed: s, complete: true }; }),
      cellAppearances: 10, cellAttributed: 10, cellAttribution: 1,
      cellBySource: { looted: 10 },
      poolEngagedZero: 6, poolEngagedArmed: 0, poolAllZero: 6, poolEvadedZero: 0,
      searcasterHolderDays: 100 }, o);
  }
  let j = judge(mk({}));
  check('judge DIAG-GO (all bars pass)', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mk({ cellAppearances: 0, cellAttributed: 0, cellAttribution: null, cellBySource: {} }));
  check('judge DIAG-GO zero-appearance vacuous (attribution bar passes when coverage passes)', j.verdict === 'DIAG-GO' && j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mk({ cellAppearances: 10, cellAttributed: 8, cellAttribution: 0.8 }));
  check('judge DIAG-NO-GO attribution 0.80 < 0.90', j.verdict === 'DIAG-NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mk({ coverageComplete: 7 }));
  check('judge DIAG-NO-GO coverage 7/8', j.verdict === 'DIAG-NO-GO' && !j.bars[0].pass, JSON.stringify(j.bars));
  j = judge(mk({ poolEngagedZero: 2, poolAllZero: 2 }));
  check('judge DIAG-GO thin pool via rare-rate path (pool bar passes as stated finding)', j.verdict === 'DIAG-GO' && j.bars[2].pass && /RARE-RATE/.test(j.bars[2].detail), JSON.stringify(j.bars));
  j = judge(mk({ coverageComplete: 7, cellAppearances: 0, cellAttributed: 0, cellAttribution: null }));
  check('judge DIAG-NO-GO zero appearances + broken coverage (vacuous path needs bar 1)', j.verdict === 'DIAG-NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  // ---- PARTICIPATION fixtures (a second seed with leadRule / fleeCause rows) ----
  // NOTE: the cell selftest above rmSync'd the tmp dir, so recreate it
  // and rewrite s1.json (the `seed` object is still in scope) + s2.json.
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed));
  const seedP = mkSeed({
    seed: 2, days: 10, gameDays: 10,
    v4encounters: [
      { day: 2, vid: 'nora', mid: 'audit', wave: 4, origin: 'expedition', leadRule: 'expedition-holder', outcome: 'vFlee', rounds: 4, mDealt: 120, mHpStart: 1000, vTaken: 60, rangedId: 'bow', ammoAtEntry: 5, volley: { shots: 2, hits: 1, dmg: 12, ammoLeft: 3 }, fleeCause: 'hopeless-after-help', fleeHopeless: true, fleeLearn: false, fleeHpFrac: 0.42, calledHelp: true, shoutRound: 2, intent: 'engage', everHopeless: true, everWinning: false, leadGear: { bravery: 5, temper: 'steady', armed: true, armored: true, armorP: 12, weaponB: 20 }, partyCells: [{ vid: 'nora', rangedId: 'bow', ammoId: 'arrow', cells: 0, alive: true }, { vid: 'ally1', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 2, alive: true }], log: [] },
      { day: 3, vid: 'raj', mid: 'eulogy', wave: 4, origin: 'world-tick', leadRule: 'world-tick', outcome: 'vFlee', rounds: 3, mDealt: 40, mHpStart: 900, vTaken: 70, rangedId: null, ammoAtEntry: 0, volley: null, fleeCause: 'floor-hp', fleeHopeless: false, fleeLearn: false, fleeHpFrac: 0.18, calledHelp: false, shoutRound: null, intent: 'engage', everHopeless: false, everWinning: false, leadGear: { bravery: 1, temper: 'cautious', armed: false, armored: false, armorP: 0, weaponB: 0 }, partyCells: [{ vid: 'raj', rangedId: null, ammoId: null, cells: 0, alive: true }], log: [] },
      { day: 4, vid: 'ana', mid: 'reunion', wave: 4, origin: 'expedition', leadRule: 'expedition-holder', outcome: 'vKill', rounds: 5, mDealt: 1000, mHpStart: 1000, vTaken: 20, rangedId: 'bow', ammoAtEntry: 5, volley: { shots: 3, hits: 2, dmg: 20, ammoLeft: 2 }, fleeCause: null, fleeHopeless: false, fleeLearn: false, fleeHpFrac: null, calledHelp: false, shoutRound: null, intent: 'engage', everHopeless: false, everWinning: true, leadGear: { bravery: 12, temper: 'bold', armed: true, armored: true, armorP: 20, weaponB: 30 }, partyCells: [{ vid: 'ana', rangedId: 'bow', ammoId: 'arrow', cells: 0, alive: true }], log: [] },
      { day: 5, vid: 'bob', mid: 'audit', wave: 5, origin: 'patrol', leadRule: 'patrol', outcome: 'vFlee', rounds: 2, mDealt: 0, mHpStart: 1200, vTaken: 10, rangedId: null, ammoAtEntry: 0, volley: null, fleeCause: 'learn-withdrawal', fleeHopeless: false, fleeLearn: true, fleeHpFrac: 0.8, calledHelp: false, shoutRound: null, intent: 'learn', everHopeless: false, everWinning: false, leadGear: { bravery: 3, temper: 'steady', armed: true, armored: false, armorP: 0, weaponB: 10 }, partyCells: [{ vid: 'bob', rangedId: null, ammoId: null, cells: 0, alive: true }], log: [] },
      // PRESENCE FIXTURE (finding #2622): an armed LEAD — cara leads
      // with the searcaster + 2 cells and fires the volley. The old
      // analyzer read this row's armed entry but never counted the
      // lead; the fix must read armedLeads === 1 here.
      { day: 6, vid: 'cara', mid: 'strike', wave: 4, origin: 'world-tick', leadRule: 'world-tick', outcome: 'vKill', rounds: 5, mDealt: 1100, mHpStart: 1000, vTaken: 30, rangedId: 'searcaster', ammoAtEntry: 2, volley: { shots: 2, hits: 1, dmg: 130, ammoLeft: 0 }, fleeCause: null, fleeHopeless: false, fleeLearn: false, fleeHpFrac: null, calledHelp: true, shoutRound: 2, intent: 'engage', everHopeless: false, everWinning: true, leadGear: { bravery: 10, temper: 'bold', armed: true, armored: true, armorP: 15, weaponB: 120 }, partyCells: [{ vid: 'cara', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 2, alive: true }], log: [] },
    ],
    deaths: [{ kind: 'monster', cause: 'eaten' }],
  });
  fs.writeFileSync(path.join(dir, 's2.json'), JSON.stringify(seedP));
  const pp = participationStats(dir);
  check('participation: meetings 7 (5 new + 2 fixture), flees 4', pp.meetings === 7 && pp.flees === 4, JSON.stringify({ m: pp.meetings, f: pp.flees }));
  check('participation: lead attributed 5/7 (fixture seed-1 rows lack leadRule)', pp.leadAttributed === 5 && pp.leadUnclassified === 2, JSON.stringify({ a: pp.leadAttributed, u: pp.leadUnclassified }));
  check('participation: flee classified 3/4 (fixture seed-1 vFlee row has no fleeCause)', pp.fleeClassified === 3 && pp.fleeUnclassified === 1, JSON.stringify({ c: pp.fleeClassified, u: pp.fleeUnclassified }));
  check('participation: armed entries 2, armed leads 1, armed volleys 1 (finding #2622 fix)', pp.armedEntries === 2 && pp.armedLeads === 1 && pp.armedVolleys === 1, JSON.stringify({ e: pp.armedEntries, l: pp.armedLeads, v: pp.armedVolleys }));
  check('participation: flee causes counted (hopeless-after-help, floor-hp, learn-withdrawal)', pp.fleeCauseCounts['hopeless-after-help'] === 1 && pp.fleeCauseCounts['floor-hp'] === 1 && pp.fleeCauseCounts['learn-withdrawal'] === 1, JSON.stringify(pp.fleeCauseCounts));
  check('participation: deaths per engaged meeting 1/6', Math.abs(pp.deathsPerEngaged - 1 / 6) < 1e-9, 'got ' + pp.deathsPerEngaged);
  // JudgeParticipation shapes.
  function mkP(o) {
    return Object.assign({ meetings: 30, engaged: 25, flees: 10,
      leadAttributed: 27, leadAttribution: 0.9, leadRuleCounts: { 'expedition-holder': 27 }, leadUnclassified: 3,
      fleeClassified: 9, fleeClassification: 0.9, fleeUnclassified: 1,
      fleeCauseCounts: { 'hopeless-alone': 9 } }, o);
  }
  let pj = judgeParticipation(mkP({}));
  check('judgeParticipation DIAG-GO (all bars pass)', pj.verdict === 'DIAG-GO' && pj.bars.every(function (b) { return b.pass; }), JSON.stringify(pj));
  pj = judgeParticipation(mkP({ leadAttributed: 20, leadAttribution: 0.667, leadUnclassified: 10 }));
  check('judgeParticipation DIAG-NO-GO lead attribution 0.667 < 0.80', pj.verdict === 'DIAG-NO-GO' && !pj.bars[0].pass, JSON.stringify(pj.bars));
  pj = judgeParticipation(mkP({ fleeClassified: 6, fleeClassification: 0.6, fleeUnclassified: 4 }));
  check('judgeParticipation DIAG-NO-GO flee classification 0.60 < 0.80', pj.verdict === 'DIAG-NO-GO' && !pj.bars[1].pass, JSON.stringify(pj.bars));
  pj = judgeParticipation(mkP({ fleeClassified: 9, fleeClassification: 0.9, fleeUnclassified: 3 }));
  check('judgeParticipation DIAG-NO-GO 3 unclassified flees > 2 (share passes, count fails)', pj.verdict === 'DIAG-NO-GO' && !pj.bars[1].pass, JSON.stringify(pj.bars));
  pj = judgeParticipation(mkP({ meetings: 20, flees: 10 }));
  check('judgeParticipation DIAG-NO-GO METRIC-BROKEN meetings 20 < 25', pj.verdict === 'DIAG-NO-GO' && pj.kind === 'METRIC-BROKEN' && !pj.bars[2].pass, JSON.stringify(pj));
  pj = judgeParticipation(mkP({ meetings: 30, flees: 5 }));
  check('judgeParticipation DIAG-NO-GO METRIC-BROKEN flees 5 < 8', pj.verdict === 'DIAG-NO-GO' && pj.kind === 'METRIC-BROKEN' && !pj.bars[2].pass, JSON.stringify(pj));
  // JudgePresence shapes.
  function mkLeg(o) {
    return Object.assign({ searcasterHolderDays: 0,
      armedEntries: 0, armedLeads: 0, armedVolleys: 0, starvationVillager: 0,
      deathsPerEngaged: 5, medianDays: 140 }, o);
  }
  let sj = judgeLend(mkLeg({}), mkLeg({}), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 4.5, medianDays: 145 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 4.5, medianDays: 145 }));
  check('judgeLend GO (all bars pass)', sj.verdict === 'GO' && sj.bars.every(function (b) { return b.pass; }), JSON.stringify(sj));
  sj = judgeLend(mkLeg({}), mkLeg({}), mkLeg({ searcasterHolderDays: 10 }), mkLeg({ searcasterHolderDays: 10 }));
  check('judgeLend NO-GO holder-days 10 < 40 (kind SUPPLY)', sj.verdict === 'NO-GO' && !sj.bars[0].pass && sj.kind === 'SUPPLY', JSON.stringify(sj));
  sj = judgeLend(mkLeg({}), mkLeg({}), mkLeg({ searcasterHolderDays: 55, armedEntries: 1 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 1 }));
  check('judgeLend NO-GO armed entries 1 < 3 (kind PARTICIPATION)', sj.verdict === 'NO-GO' && !sj.bars[1].pass && sj.kind === 'PARTICIPATION', JSON.stringify(sj));
  sj = judgeLend(mkLeg({}), mkLeg({}), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 0 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 0 }));
  check('judgeLend NO-GO armed volleys 0 < 2 (kind PARTICIPATION)', sj.verdict === 'NO-GO' && !sj.bars[2].pass && sj.kind === 'PARTICIPATION', JSON.stringify(sj));
  sj = judgeLend(mkLeg({}), mkLeg({}), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 1 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 1 }));
  check('judgeLend NO-GO armed volleys 1 < 2 (kind PARTICIPATION)', sj.verdict === 'NO-GO' && !sj.bars[2].pass && sj.kind === 'PARTICIPATION', JSON.stringify(sj));
  sj = judgeLend(mkLeg({ deathsPerEngaged: 4 }), mkLeg({ deathsPerEngaged: 4 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 5, medianDays: 145 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 5, medianDays: 145 }));
  check('judgeLend NO-GO guardrail deaths/engaged 5.00 > 4.40 (1.10x, kind GUARDRAIL)', sj.verdict === 'NO-GO' && !sj.bars[3].pass && sj.kind === 'GUARDRAIL', JSON.stringify(sj));
  sj = judgeLend(mkLeg({}), mkLeg({}), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, starvationVillager: 3 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, starvationVillager: 3 }));
  check('judgeLend NO-GO starvation 3 > 0+2 (kind GUARDRAIL)', sj.verdict === 'NO-GO' && !sj.bars[4].pass && sj.kind === 'GUARDRAIL', JSON.stringify(sj));
  sj = judgeLend(mkLeg({}), mkLeg({ deathsPerEngaged: null }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2 }));
  check('judgeLend NO-GO guardrail unjudgeable when a leg has zero engaged meetings', sj.verdict === 'NO-GO' && !sj.bars[3].pass, JSON.stringify(sj));
  // ---- LEND stats fixture (a third seed with fired-rows) ----
  const seedL = mkSeed({
    seed: 3, days: 10, gameDays: 10,
    v4encounters: [
      { day: 2, vid: 'yara', mid: 'algorithm', wave: 4, origin: 'world-tick', leadRule: 'world-tick', outcome: 'vFlee', rounds: 7, mDealt: 565, mHpStart: 750, vTaken: 30, rangedId: 'searcaster', ammoAtEntry: 2, volley: { shots: 2, hits: 1, dmg: 64, ammoLeft: 0 }, fleeCause: 'floor-hp', fleeHopeless: false, fleeLearn: false, fleeHpFrac: 0.3, calledHelp: true, shoutRound: 5, intent: 'engage', everHopeless: false, everWinning: false, leadGear: { bravery: 5, temper: 'steady', armed: true, armored: true, armorP: 10, weaponB: 120 }, partyCells: [{ vid: 'yara', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 2, alive: true }, { vid: 'naran', rangedId: null, ammoId: null, cells: 0, alive: true }], log: [] },
      { day: 3, vid: 'bob', mid: 'eulogy', wave: 4, origin: 'world-tick', leadRule: 'world-tick', outcome: 'vDie', rounds: 1, mDealt: 0, mHpStart: 900, vTaken: 100, rangedId: 'searcaster', ammoAtEntry: 2, volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 2 }, fleeCause: null, fleeHopeless: false, fleeLearn: false, fleeHpFrac: null, calledHelp: false, shoutRound: null, intent: 'engage', everHopeless: false, everWinning: false, leadGear: { bravery: 1, temper: 'cautious', armed: false, armored: false, armorP: 0, weaponB: 120 }, partyCells: [{ vid: 'bob', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 2, alive: true }], log: [] },
      { day: 4, vid: 'cara', mid: 'strike', wave: 4, origin: 'world-tick', leadRule: 'world-tick', outcome: 'vKill', rounds: 5, mDealt: 1100, mHpStart: 1000, vTaken: 30, rangedId: 'searcaster', ammoAtEntry: 2, volley: { shots: 2, hits: 1, dmg: 130, ammoLeft: 0 }, fleeCause: null, fleeHopeless: false, fleeLearn: false, fleeHpFrac: null, calledHelp: true, shoutRound: 2, intent: 'engage', everHopeless: false, everWinning: true, leadGear: { bravery: 10, temper: 'bold', armed: true, armored: true, armorP: 15, weaponB: 120 }, partyCells: [{ vid: 'cara', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 2, alive: true }], log: [] },
    ],
    v4lends: [
      { seq: 1, day: 2, mid: 'algorithm', lender: 'naran', borrower: 'yara', kind: 'gun', from: 'adjacent', cellsMoved: 2, gunReturned: true, cellsReturned: 1, lenderAlive: true, borrowerAlive: true },
      { seq: 2, day: 3, mid: 'eulogy', lender: 'naran', borrower: 'bob', kind: 'cells', from: 'tile', cellsMoved: 2, gunReturned: false, cellsReturned: 0, lenderAlive: true, borrowerAlive: false },
      { seq: 3, day: 5, mid: 'reunion', lender: 'naran', borrower: 'zoe', kind: 'gun', from: 'adjacent', cellsMoved: 2, gunReturned: null, cellsReturned: null, lenderAlive: null, borrowerAlive: null },
    ],
    deaths: [{ day: 3, kind: 'monster', who: 'bob', cause: 'eaten' }],
    // LENDFIX pool rows (finding #2628): the two lendable moments
    // at these fights' launches (yara gun/adjacent, bob cells/tile).
    v4lendPool: [
      { seq: 1, day: 2, mid: 'algorithm', lead: 'yara', lender: 'naran', kind: 'gun', from: 'adjacent' },
      { seq: 2, day: 3, mid: 'eulogy', lead: 'bob', lender: 'naran', kind: 'cells', from: 'tile' },
    ],
  });
  fs.writeFileSync(path.join(dir, 's3.json'), JSON.stringify(seedL));
  const ls = lendStats(dir);
  check('lendStats: 3 lends (2 gun, 1 cells; 1 tile, 2 adjacent)', ls.lends === 3 && ls.lendsGun === 2 && ls.lendsCells === 1 && ls.lendsTile === 1 && ls.lendsAdjacent === 2, JSON.stringify({ l: ls.lends, g: ls.lendsGun, c: ls.lendsCells, t: ls.lendsTile, a: ls.lendsAdjacent }));
  check('lendStats: gun returned 1, cells returned 1, cells moved 6', ls.gunReturned === 1 && ls.cellsReturned === 1 && ls.cellsMoved === 6, JSON.stringify({ g: ls.gunReturned, c: ls.cellsReturned, m: ls.cellsMoved }));
  check('lendStats: joined 2, unjoined 1 (the day-5 lend has no encounter)', ls.lendsJoined === 2 && ls.lendsUnjoined === 1, JSON.stringify({ j: ls.lendsJoined, u: ls.lendsUnjoined }));
  check('lendStats: lent volleys 1 (yara), lent volley dmg 64', ls.lentVolleys === 1 && ls.lentVolleyDmg === 64, JSON.stringify({ v: ls.lentVolleys, d: ls.lentVolleyDmg }));
  check('lendStats: outcomes vFlee 1 + vDie 1; borrower survived 1/2 (0.50)', ls.lentOutcomes.vFlee === 1 && ls.lentOutcomes.vDie === 1 && ls.borrowerSurvived === 1 && ls.borrowerDied === 1 && ls.borrowerSurvival === 0.5, JSON.stringify({ o: ls.lentOutcomes, s: ls.borrowerSurvived, d: ls.borrowerDied, r: ls.borrowerSurvival }));
  // ---- LENDFIX pool + guardrail fixtures ----
  const ps = poolStats(dir);
  check('poolStats: 2 moments (1 gun, 1 cells; 1 tile, 1 adjacent) across 2 fights, seed 3 only', ps.moments === 2 && ps.momentsGun === 1 && ps.momentsCells === 1 && ps.momentsTile === 1 && ps.momentsAdjacent === 1 && ps.fights === 2 && ps.perSeed[3] === 2 && !ps.perSeed[1] && !ps.perSeed[2], JSON.stringify({ m: ps.moments, g: ps.momentsGun, c: ps.momentsCells, t: ps.momentsTile, a: ps.momentsAdjacent, f: ps.fights, per: ps.perSeed }));
  // Guardrail: two corpora that differ ONLY by v4lendPool + metadata
  // are identical; a one-day change is caught and named.
  const ctlD = path.join(tmp, 'ctl'), fixD = path.join(tmp, 'fix');
  fs.mkdirSync(ctlD, { recursive: true }); fs.mkdirSync(fixD, { recursive: true });
  const gSeed = mkSeed({ seed: 107081, days: 10, gameDays: 10, v4encounters: [{ day: 2, vid: 'ana', mid: 'audit', wave: 4, outcome: 'vKill' }] });
  const gCtl = Object.assign({}, gSeed, { arm: 'lend-a', run: 'lendfix-a', mode: 'ctl', leg: 'ctl' });
  const gFix = Object.assign({}, gSeed, { arm: 'lendfix-a', run: 'lendfix-a', mode: 'fix', leg: 'fix',
    v4lendPool: [{ seq: 1, day: 2, mid: 'audit', lead: 'ana', lender: 'naran', kind: 'gun', from: 'adjacent' }] });
  fs.writeFileSync(path.join(ctlD, 'lend-a-s107081-lendpool-a-ctl.json'), JSON.stringify(gCtl));
  fs.writeFileSync(path.join(fixD, 'lendpool-a-s107081-lendpool-a-fix.json'), JSON.stringify(gFix));
  let gr = guardrailIdentity(ctlD, fixD);
  check('guardrailIdentity: identical when only v4lendPool + metadata differ', gr.identical && gr.seeds === 1 && gr.diffs.length === 0, JSON.stringify(gr));
  const gFixBad = Object.assign({}, gFix, { days: 11 });
  fs.writeFileSync(path.join(fixD, 'lendpool-a-s107081-lendpool-a-fix.json'), JSON.stringify(gFixBad));
  gr = guardrailIdentity(ctlD, fixD);
  check('guardrailIdentity: one-day change caught and named (seed 107081.days)', !gr.identical && gr.diffs.length === 1 && /days/.test(gr.diffs[0].diff), JSON.stringify(gr.diffs));
  const gFixMissing = Object.assign({}, gFix);
  delete gFixMissing.v4encounters;
  fs.writeFileSync(path.join(fixD, 'lendpool-a-s107081-lendpool-a-fix.json'), JSON.stringify(gFixMissing));
  gr = guardrailIdentity(ctlD, fixD);
  check('guardrailIdentity: missing key caught (v4encounters missing in fix)', !gr.identical && /v4encounters/.test(gr.diffs[0].diff), JSON.stringify(gr.diffs));
  // Driver frame/caller strings: the two legs run different driver
  // files, so grantEvents[].frame / v4seeds[].caller differ by
  // construction; only the driver file:line is normalized, any other
  // difference in the same string must still fail.
  const gFrameCtl = Object.assign({}, gSeed, { grantEvents: [{ day: 2, itemId: 'searcaster', frame: 'at Game.alienLootGrant (/home/hatch/workspace/worktrees/sim-lendpool-a/scripts/lend-driver-a.js:1268:25)' }], v4seeds: [{ day: 2, caller: 'at Game.winPlanSeedFromFight (/home/hatch/workspace/worktrees/sim-lendpool-a/scripts/lend-driver-a.js:1435:23)' }] });
  const gFrameFix = Object.assign({}, gSeed, { grantEvents: [{ day: 2, itemId: 'searcaster', frame: 'at Game.alienLootGrant (/home/hatch/workspace/worktrees/sim-lendpool-a/scripts/lendfix-driver-a.js:1330:25)' }], v4seeds: [{ day: 2, caller: 'at Game.winPlanSeedFromFight (/home/hatch/workspace/worktrees/sim-lendpool-a/scripts/lendfix-driver-a.js:1497:23)' }] });
  fs.writeFileSync(path.join(ctlD, 'lend-a-s107081-lendpool-a-ctl.json'), JSON.stringify(gFrameCtl));
  fs.writeFileSync(path.join(fixD, 'lendpool-a-s107081-lendpool-a-fix.json'), JSON.stringify(gFrameFix));
  gr = guardrailIdentity(ctlD, fixD);
  check('guardrailIdentity: driver frame/caller strings normalized (identical when only the driver file:line differs)', gr.identical && gr.diffs.length === 0, JSON.stringify(gr));
  const gFrameBad = Object.assign({}, gFrameFix, { grantEvents: [{ day: 2, itemId: 'searcaster', frame: 'at Game.otherFunction (/home/hatch/workspace/worktrees/sim-lendpool-a/scripts/lendfix-driver-a.js:1330:25)' }] });
  fs.writeFileSync(path.join(fixD, 'lendpool-a-s107081-lendpool-a-fix.json'), JSON.stringify(gFrameBad));
  gr = guardrailIdentity(ctlD, fixD);
  check('guardrailIdentity: a real difference inside a frame string is still caught', !gr.identical && /frame/.test(gr.diffs[0].diff), JSON.stringify(gr.diffs));
  // JudgeLendfix shapes.
  function mkPool(o) { return Object.assign({ dir: '', n: 8, valid: 8, errors: 0, moments: 5, momentsGun: 3, momentsCells: 2, momentsTile: 2, momentsAdjacent: 3, fights: 5, perSeed: { 107081: 1 }, byKind: { gun: 3, cells: 2 }, byFrom: { tile: 2, adjacent: 3 }, detail: [] }, o); }
  function mkGuard(o) { return Object.assign({ identical: true, diffs: [], ctlFiles: 8, fixFiles: 8, seeds: 8 }, o); }
  let lj = judgeLendfix(mkPool({}), mkPool({}), mkLend({}), mkLend({}), mkGuard({}));
  check('judgeLendfix GO (pool measured, guardrail identical, lend off)', lj.verdict === 'GO' && lj.bars.every(function (b) { return b.pass; }), JSON.stringify(lj));
  lj = judgeLendfix(mkPool({}), mkPool({ moments: 0, momentsGun: 0, momentsCells: 0, momentsTile: 0, momentsAdjacent: 0, fights: 0, perSeed: {}, byKind: {}, byFrom: {} }), mkLend({}), mkLend({}), mkGuard({}));
  check('judgeLendfix GO with a 0-moment pool — a finding, not a metric error', lj.verdict === 'GO' && lj.bars[0].pass && /0-moment band/.test(lj.bars[0].detail), JSON.stringify(lj.bars[0]));
  lj = judgeLendfix(mkPool({}), mkPool({}), mkLend({}), mkLend({}), mkGuard({ identical: false, diffs: [{ seed: 107081, diff: 'seed 107081.days (150 vs 149)' }] }));
  check('judgeLendfix NO-GO guardrail broken (kind SUBSTRATE)', lj.verdict === 'NO-GO' && !lj.bars[1].pass && lj.kind === 'SUBSTRATE', JSON.stringify(lj));
  lj = judgeLendfix(mkPool({}), mkPool({}), mkLend({}), mkLend({ lends: 1 }), mkGuard({}));
  check('judgeLendfix NO-GO lend fired on the fix leg (kind SUBSTRATE)', lj.verdict === 'NO-GO' && !lj.bars[2].pass && lj.kind === 'SUBSTRATE', JSON.stringify(lj));
  lj = judgeLendfix(mkPool({}), mkPool({ valid: 7 }), mkLend({}), mkLend({}), mkGuard({}));
  check('judgeLendfix NO-GO pool unreadable on 1 seed (kind METRIC-BROKEN)', lj.verdict === 'NO-GO' && !lj.bars[0].pass && lj.kind === 'METRIC-BROKEN', JSON.stringify(lj));
  // ---- nearMissStats + judgeLendpool shapes (sim-lendpool-a) ----
  const nmD = path.join(tmp, 'nm');
  fs.mkdirSync(nmD);
  function nmRow(o) { return Object.assign({ seq: 1, day: 10, mid: 'algorithm', wave: 4, lead: 'ana', leadKind: 'gun', raid: false, livingHolders: 1, nearestHolder: 'naran', nearestDist: 1, nearestState: 'out-in-world', nearestHealth: 90, nearestCells: 2, anyArmedEarshot: true, anyEligibleEarshot: true, lendable: true }, o); }
  function nmEnc(o) { return Object.assign({ day: 10, vid: 'ana', mid: 'algorithm', wave: 4, outcome: 'vKill', origin: 'world-tick', rangedId: 'crude_bow', ammoAtEntry: 5, partyCells: [{ vid: 'ana', rangedId: 'crude_bow', ammoId: 'arrow', cells: 0, alive: true }] }, o); }
  fs.writeFileSync(path.join(nmD, 'lendpool-a-s107111-lendpool-a-diag.json'), JSON.stringify(mkSeed({ seed: 107111,
    v4nearMiss: [
      nmRow({}),
      nmRow({ seq: 2, day: 12, mid: 'eulogy', nearestHolder: 'chen', nearestDist: 3, nearestState: 'at-home', nearestHealth: 80, anyArmedEarshot: false, anyEligibleEarshot: false, lendable: false }),
      nmRow({ seq: 3, day: 14, lead: 'yara', leadKind: 'cells', nearestHolder: null, nearestDist: null, nearestState: 'no-living-holder', nearestHealth: null, nearestCells: null, livingHolders: 0, anyArmedEarshot: false, anyEligibleEarshot: false, lendable: false }),
      nmRow({ seq: 4, day: 16, mid: 'eulogy', leadKind: 'loaded', nearestHolder: 'naran', nearestDist: 1, nearestState: 'out-in-world', anyArmedEarshot: true, anyEligibleEarshot: true, lendable: false }),
      nmRow({ seq: 5, day: 15, mid: 'algorithm', raid: true, nearestHolder: 'naran', nearestDist: 1, nearestState: 'out-in-world', anyArmedEarshot: true, anyEligibleEarshot: true, lendable: false }),
    ],
    v4encounters: [
      nmEnc({}),
      nmEnc({ day: 12, mid: 'eulogy', outcome: 'vDie' }),
      nmEnc({ day: 14, vid: 'yara', mid: 'algorithm', outcome: 'vFlee', rangedId: 'searcaster', ammoAtEntry: 0, partyCells: [{ vid: 'yara', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 0, alive: true }] }),
      nmEnc({ day: 16, mid: 'eulogy', outcome: 'mFlee', rangedId: 'searcaster', ammoAtEntry: 2, partyCells: [{ vid: 'ana', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 2, alive: true }] }),
      nmEnc({ day: 20, mid: 'algorithm', outcome: 'vKill', origin: 'expedition' }),
      nmEnc({ day: 15, mid: 'algorithm', outcome: 'vKill' }),
    ] })));
  fs.writeFileSync(path.join(nmD, 'lendpool-a-s107112-lendpool-a-diag.json'), JSON.stringify(mkSeed({ seed: 107112,
    v4nearMiss: [
      nmRow({ seq: 1, day: 11, lead: 'mei', nearestHolder: 'victor', nearestDist: 2, nearestState: 'in-camp', anyArmedEarshot: false, anyEligibleEarshot: false, lendable: false }),
      nmRow({ seq: 2, day: 13, mid: 'eulogy', lead: 'mei', nearestHolder: 'victor', nearestDist: 6, nearestState: 'sheltered', anyArmedEarshot: false, anyEligibleEarshot: false, lendable: false }),
    ],
    v4encounters: [
      nmEnc({ day: 11, vid: 'mei', outcome: 'vKill' }),
      nmEnc({ day: 13, vid: 'mei', mid: 'eulogy', outcome: 'vDie' }),
    ] })));
  const nm = nearMissStats(nmD);
  check('nearMissStats launches 6 (4 gun + 1 cells + 1 loaded), unarmed 5', nm.launches === 6 && nm.launchesGun === 4 && nm.launchesCells === 1 && nm.launchesLoaded === 1 && nm.unarmedLaunches === 5, JSON.stringify({ launches: nm.launches, gun: nm.launchesGun, cells: nm.launchesCells, loaded: nm.launchesLoaded, unarmed: nm.unarmedLaunches }));
  check('nearMissStats byState: out-in-world 1, at-home 1, no-living-holder 1, in-camp 1, sheltered 1', nm.byState['out-in-world'] === 1 && nm.byState['at-home'] === 1 && nm.byState['no-living-holder'] === 1 && nm.byState['in-camp'] === 1 && nm.byState['sheltered'] === 1, JSON.stringify(nm.byState));
  check('nearMissStats byDist (unarmed rows only — the loaded row4 does not count): 1->1, 2->1, 3->1, 6+->1, none->1', nm.byDist['1'] === 1 && nm.byDist['2'] === 1 && nm.byDist['3'] === 1 && nm.byDist['6+'] === 1 && nm.byDist.none === 1, JSON.stringify(nm.byDist));
  check('nearMissStats earshot base rate: armed 2/6, eligible 2/6, lendable 1', nm.armedEarshot === 2 && nm.eligibleEarshot === 2 && nm.lendable === 1, JSON.stringify({ armed: nm.armedEarshot, eligible: nm.eligibleEarshot, lendable: nm.lendable }));
  check('nearMissStats coverage 6/6 = 1.0, orphan 0 (expedition encounter excluded; raid row joins the raid encounter)', nm.encDenominator === 6 && nm.encCovered === 6 && nm.coverage === 1 && nm.orphanRows === 0, JSON.stringify({ denom: nm.encDenominator, covered: nm.encCovered, coverage: nm.coverage, orphans: nm.orphanRows }));
  check('nearMissStats raidLaunches 1 — counted for coverage, excluded from launches/breakdown', nm.raidLaunches === 1 && nm.launches === 6, JSON.stringify({ raid: nm.raidLaunches, launches: nm.launches }));
  check('nearMissStats dominant share 1/5 = 0.20 (diffuse — five states tie at 1)', nm.dominantShare === 0.2 && nm.dominantN === 1, JSON.stringify({ dom: nm.dominantState, n: nm.dominantN, share: nm.dominantShare }));
  function mkNm(o) { return Object.assign({ dir: '', n: 2, valid: 2, errors: 0, launches: 6, launchesGun: 4, launchesCells: 1, launchesLoaded: 1, raidLaunches: 0, unarmedLaunches: 5, armedEarshot: 2, eligibleEarshot: 2, armedEarshotUnarmed: 1, eligibleEarshotUnarmed: 1, byState: { 'out-in-world': 1, 'at-home': 1, 'no-living-holder': 1, 'in-camp': 1, 'sheltered': 1 }, byDist: { '1': 2, '2': 1, '3': 1, '6+': 1, none: 1 }, noLivingHolder: 1, lendable: 1, unknown: 0, encDenominator: 5, encCovered: 5, coverage: 1, orphanRows: 0, dominantState: 'out-in-world', dominantN: 1, dominantShare: 0.2, secondState: 'at-home', secondN: 1, secondShare: 0.2, perSeed: {}, detail: [] }, o); }
  function mkPool2(o) { return Object.assign({ dir: '', n: 8, valid: 8, errors: 0, moments: 1, momentsGun: 1, momentsCells: 0, momentsTile: 0, momentsAdjacent: 1, fights: 1, perSeed: { 107111: 1 }, byKind: { gun: 1 }, byFrom: { adjacent: 1 }, detail: [] }, o); }
  function mkLend2(o) { return Object.assign({ lends: 0, lendsJoined: 0, borrowerSurvived: 0, borrowerDied: 0, borrowerSurvival: null }, o); }
  function mkPres(o) { return Object.assign({ poolDraftMiss: 3, poolFights: 5 }, o); }
  let nj = judgeLendpool(mkNm({}), mkPool2({}), mkLend2({}), mkPres({}));
  check('judgeLendpool DIAG-GO diffuse (dominant 20% < 30% — still a quantified answer, top two named)', nj.verdict === 'DIAG-GO' && nj.bars.every(function (b) { return b.pass; }) && /DIFFUSE/.test(nj.bars[2].detail), JSON.stringify(nj));
  nj = judgeLendpool(mkNm({ dominantState: 'at-home', dominantN: 3, dominantShare: 0.6, secondState: 'sheltered', secondN: 1, secondShare: 0.2, byState: { 'at-home': 3, 'sheltered': 1, 'in-camp': 1 } }), mkPool2({}), mkLend2({}), mkPres({}));
  check('judgeLendpool DIAG-GO dominant 60% (no DIFFUSE note)', nj.verdict === 'DIAG-GO' && !/DIFFUSE/.test(nj.bars[2].detail), JSON.stringify(nj.bars[2]));
  nj = judgeLendpool(mkNm({ encCovered: 4, coverage: 0.8 }), mkPool2({}), mkLend2({}), mkPres({}));
  check('judgeLendpool DIAG-NO-GO coverage 0.80 < 0.95 (kind METRIC-BROKEN)', nj.verdict === 'DIAG-NO-GO' && !nj.bars[0].pass && nj.kind === 'METRIC-BROKEN', JSON.stringify(nj));
  nj = judgeLendpool(mkNm({ unknown: 1 }), mkPool2({}), mkLend2({}), mkPres({}));
  check('judgeLendpool DIAG-NO-GO 1/5 rows unclassified > 5% (kind METRIC-BROKEN)', nj.verdict === 'DIAG-NO-GO' && !nj.bars[0].pass && nj.kind === 'METRIC-BROKEN', JSON.stringify(nj.bars[0]));
  nj = judgeLendpool(mkNm({}), mkPool2({ moments: 2 }), mkLend2({}), mkPres({}));
  check('judgeLendpool DIAG-NO-GO lendable 1 vs pool moments 2 (kind SUBSTRATE)', nj.verdict === 'DIAG-NO-GO' && !nj.bars[1].pass && nj.kind === 'SUBSTRATE', JSON.stringify(nj.bars[1]));
  nj = judgeLendpool(mkNm({}), mkPool2({}), mkLend2({ lends: 1 }), mkPres({}));
  check('judgeLendpool DIAG-NO-GO lend fired on the diag leg (kind SUBSTRATE)', nj.verdict === 'DIAG-NO-GO' && !nj.bars[1].pass && nj.kind === 'SUBSTRATE', JSON.stringify(nj.bars[1]));
  nj = judgeLendpool(mkNm({}), mkPool2({ valid: 7 }), mkLend2({}), mkPres({}));
  check('judgeLendpool DIAG-NO-GO pool unreadable on 1 seed (kind SUBSTRATE)', nj.verdict === 'DIAG-NO-GO' && !nj.bars[1].pass && nj.kind === 'SUBSTRATE', JSON.stringify(nj.bars[1]));
  nj = judgeLendpool(mkNm({ unarmedLaunches: 0, launches: 2, launchesGun: 0, launchesCells: 0, launchesLoaded: 2, encDenominator: 0, encCovered: 0, coverage: null, dominantState: null, dominantN: 0, dominantShare: null, secondState: null, secondN: 0, secondShare: null, lendable: 0, byState: {} }), mkPool2({ moments: 0 }), mkLend2({}), mkPres({}));
  check('judgeLendpool DIAG-NO-GO no unarmed population (kind NO-POPULATION; coverage vacuous, answer fails)', nj.verdict === 'DIAG-NO-GO' && nj.bars[0].pass && !nj.bars[2].pass && nj.kind === 'NO-POPULATION', JSON.stringify(nj));
  // ---- judgeLend SEPARATED-guardrail shapes ----
  function mkLend(o) {
    return Object.assign({ lends: 0, lendsJoined: 0, borrowerSurvived: 0, borrowerDied: 0, borrowerSurvival: null }, o);
  }
  const goodLeg = mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 4.5, medianDays: 145 });
  sj = judgeLend(mkLeg({ deathsPerEngaged: 5 }), mkLeg({ deathsPerEngaged: 5 }), goodLeg, goodLeg,
    mkLend({}), mkLend({ lends: 2, lendsJoined: 2, borrowerSurvived: 2, borrowerSurvival: 1 }));
  check('judgeLend GO with lends (borrowers survived 2/2, downstream 4.50 <= 5.50)', sj.verdict === 'GO' && sj.bars.every(function (b) { return b.pass; }), JSON.stringify(sj));
  sj = judgeLend(mkLeg({ deathsPerEngaged: 5 }), mkLeg({ deathsPerEngaged: 5 }), goodLeg, goodLeg,
    mkLend({}), mkLend({ lends: 2, lendsJoined: 2, borrowerSurvived: 0, borrowerSurvival: 0 }));
  check('judgeLend NO-GO lent-fight safety 0/2 < 50% (kind GUARDRAIL, downstream passes)', sj.verdict === 'NO-GO' && !sj.bars[3].pass && sj.kind === 'GUARDRAIL' && /lent-fight safety/.test(sj.bars[3].detail), JSON.stringify(sj.bars[3]));
  sj = judgeLend(mkLeg({ deathsPerEngaged: 4 }), mkLeg({ deathsPerEngaged: 4 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 4.5, medianDays: 145 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 4.5, medianDays: 145 }),
    mkLend({}), mkLend({ lends: 2, lendsJoined: 2, borrowerSurvived: 2, borrowerSurvival: 1 }));
  check('judgeLend NO-GO downstream 4.50 > 4.40 (1.10x, kind GUARDRAIL)', sj.verdict === 'NO-GO' && !sj.bars[3].pass && sj.kind === 'GUARDRAIL', JSON.stringify(sj.bars[3]));
  sj = judgeLend(mkLeg({ deathsPerEngaged: 4 }), mkLeg({ deathsPerEngaged: 4 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 4.3, medianDays: 145 }), mkLeg({ searcasterHolderDays: 55, armedEntries: 4, armedVolleys: 2, deathsPerEngaged: 4.3, medianDays: 145 }),
    mkLend({}), mkLend({ lends: 2, lendsJoined: 2, borrowerSurvived: 2, borrowerSurvival: 1 }));
  check('judgeLend GO at 4.30 <= 4.40 — the 1.10x allowance tolerates cascade noise the strict 1.00x would fail', sj.verdict === 'GO' && sj.bars[3].pass, JSON.stringify(sj.bars[3]));
  sj = judgeLend(mkLeg({ deathsPerEngaged: 5 }), mkLeg({ deathsPerEngaged: 5 }), goodLeg, goodLeg,
    mkLend({}), mkLend({ lends: 0, lendsJoined: 0 }));
  check('judgeLend GO with 0 lends — safety part skipped, not failed (bars 2-3 judge participation)', sj.verdict === 'GO' && /skipped/.test(sj.bars[3].detail), JSON.stringify(sj.bars[3]));
  sj = judgeLend(mkLeg({ deathsPerEngaged: 5 }), mkLeg({ deathsPerEngaged: 5 }), goodLeg, goodLeg,
    mkLend({}), mkLend({ lends: 2, lendsJoined: 0, borrowerSurvived: 0, borrowerSurvival: null }));
  check('judgeLend NO-GO lends unjoined 0/2 — safety unjudgeable, not skipped', sj.verdict === 'NO-GO' && !sj.bars[3].pass && sj.kind === 'GUARDRAIL', JSON.stringify(sj.bars[3]));
  console.log('analyze-lendpool-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, outFile = null, ctlDir = null, armDir = null;
  const noJudge = args.indexOf('--no-judge') !== -1;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
    else if (args[i] === '--ctl') ctlDir = args[++i];
    else if (args[i] === '--arm') armDir = args[++i];
    else if (args[i] === '--fix') armDir = args[++i];
  }
  if (ctlDir && armDir) {
    // LENDFIX pair mode: ctl = old driver (no counter), fix = this
    // driver (counter). The judge is judgeLendfix (pool measured +
    // guardrail byte-identity + lend stayed OFF) — NOT judgeLend,
    // which would NO-GO a lend that never fired by design.
    const ctlSt = cellStats(ctlDir), ctlPart = participationStats(ctlDir), ctlPres = presenceStats(ctlDir), ctlLend = lendStats(ctlDir), ctlPool = poolStats(ctlDir);
    const armSt = cellStats(armDir), armPart = participationStats(armDir), armPres = presenceStats(armDir), armLend = lendStats(armDir), armPool = poolStats(armDir);
    const guard = guardrailIdentity(ctlDir, armDir);
    const sj = noJudge ? null : judgeLendfix(ctlPool, armPool, ctlLend, armLend, guard);
    const result = { verdict: sj ? sj.verdict : null, kind: sj ? sj.kind : null, bars: sj ? sj.bars : null,
      ctl: { diag: summarize(ctlSt), participation: ctlPart, presence: ctlPres, lend: ctlLend, pool: ctlPool },
      arm: { diag: summarize(armSt), participation: armPart, presence: armPres, lend: armLend, pool: armPool },
      guardrail: guard };
    console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars,
      ctl: { holderDays: ctlSt.searcasterHolderDays, armedEntries: ctlPart.armedEntries, armedLeads: ctlPart.armedLeads, armedVolleys: ctlPart.armedVolleys, deathsPerEngaged: ctlPart.deathsPerEngaged, medianDays: ctlPart.medianDays, starvationVillager: ctlSt.starvationVillager, poolTicks: ctlPres.poolTicks, poolHolderPresent: ctlPres.poolHolderPresent, poolFights: ctlPres.poolFights, poolHolderLed: ctlPres.poolHolderLed, transfers: ctlPres.transfers, vanishes: ctlPres.vanishes,
        lends: ctlLend.lends, lendsJoined: ctlLend.lendsJoined, lentVolleys: ctlLend.lentVolleys, borrowerSurvival: ctlLend.borrowerSurvival, poolMoments: ctlPool.moments },
      arm: { holderDays: armSt.searcasterHolderDays, armedEntries: armPart.armedEntries, armedLeads: armPart.armedLeads, armedVolleys: armPart.armedVolleys, deathsPerEngaged: armPart.deathsPerEngaged, medianDays: armPart.medianDays, starvationVillager: armSt.starvationVillager, poolTicks: armPres.poolTicks, poolHolderPresent: armPres.poolHolderPresent, poolFights: armPres.poolFights, poolHolderLed: armPres.poolHolderLed, poolDraftMiss: armPres.poolDraftMiss, transfers: armPres.transfers, vanishes: armPres.vanishes,
        lends: armLend.lends, lendsGun: armLend.lendsGun, lendsCells: armLend.lendsCells, lendsTile: armLend.lendsTile, lendsAdjacent: armLend.lendsAdjacent, gunReturned: armLend.gunReturned, borrowerKept: armLend.borrowerKept, lendsJoined: armLend.lendsJoined, lendsUnjoined: armLend.lendsUnjoined, lentVolleys: armLend.lentVolleys, lentVolleyDmg: armLend.lentVolleyDmg, lentOutcomes: armLend.lentOutcomes, borrowerSurvived: armLend.borrowerSurvived, borrowerDied: armLend.borrowerDied, borrowerSurvival: armLend.borrowerSurvival,
        poolMoments: armPool.moments, poolMomentsGun: armPool.momentsGun, poolMomentsCells: armPool.momentsCells, poolMomentsTile: armPool.momentsTile, poolMomentsAdjacent: armPool.momentsAdjacent, poolFights: armPool.fights, poolPerSeed: armPool.perSeed },
      guardrail: { identical: guard.identical, seeds: guard.seeds, ctlFiles: guard.ctlFiles, fixFiles: guard.fixFiles, diffs: guard.diffs } }, null, 2));
    if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
    process.exit(sj && sj.verdict !== 'GO' ? 0 : 0);
  }
  if (!dir) { console.error('usage: analyze-lendpool-a.js --dir DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
  const st = cellStats(dir);
  const j = noJudge ? null : judge(st);
  const part = participationStats(dir);
  const pj = noJudge ? null : judgeParticipation(part);
  const pres = presenceStats(dir);
  const lend = lendStats(dir);
  const pool = poolStats(dir);
  const nm = nearMissStats(dir);
  const lj = noJudge ? null : judgeLendpool(nm, pool, lend, pres);
  const result = { verdict: lj ? lj.verdict : null, kind: lj ? lj.kind : null, bars: lj ? lj.bars : null,
    nearMiss: nm, participation: part, presence: pres, lend: lend, pool: pool,
    cellVerdict: j ? j.verdict : null, cellBars: j ? j.bars : null,
    participationVerdict: pj ? pj.verdict : null,
    diag: summarize(st), cellAppearanceDetail: st.cellAppearanceDetail,
    searcasterAppearanceDetail: st.searcasterAppearanceDetail, poolDetail: st.poolDetail };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars,
    nearMiss: { launches: nm.launches, launchesGun: nm.launchesGun, launchesCells: nm.launchesCells,
      launchesLoaded: nm.launchesLoaded, raidLaunches: nm.raidLaunches, unarmedLaunches: nm.unarmedLaunches,
      armedEarshot: nm.armedEarshot, eligibleEarshot: nm.eligibleEarshot,
      armedEarshotUnarmed: nm.armedEarshotUnarmed, eligibleEarshotUnarmed: nm.eligibleEarshotUnarmed,
      byState: nm.byState, byDist: nm.byDist, noLivingHolder: nm.noLivingHolder,
      lendable: nm.lendable, unknown: nm.unknown,
      encDenominator: nm.encDenominator, encCovered: nm.encCovered, coverage: nm.coverage,
      orphanRows: nm.orphanRows, dominantState: nm.dominantState, dominantN: nm.dominantN,
      dominantShare: nm.dominantShare, secondState: nm.secondState, secondN: nm.secondN,
      secondShare: nm.secondShare, perSeed: nm.perSeed },
    participation: { meetings: part.meetings, engaged: part.engaged, flees: part.flees,
      leadAttribution: part.leadAttribution, fleeClassification: part.fleeClassification,
      armedEntries: part.armedEntries, armedLeads: part.armedLeads, armedVolleys: part.armedVolleys,
      deathsPerEngaged: part.deathsPerEngaged, national: part.national, seedWins: part.seedWins,
      wave4: part.wave4, wave5: part.wave5, medianDays: part.medianDays },
    presence: { poolTicks: pres.poolTicks, poolHolderPresent: pres.poolHolderPresent,
      poolFights: pres.poolFights, poolHolderLed: pres.poolHolderLed, poolDraftMiss: pres.poolDraftMiss,
      transfers: pres.transfers, vanishes: pres.vanishes },
    pool: { moments: pool.moments, momentsGun: pool.momentsGun, momentsCells: pool.momentsCells,
      momentsTile: pool.momentsTile, momentsAdjacent: pool.momentsAdjacent, fights: pool.fights, perSeed: pool.perSeed },
    lend: { lends: lend.lends },
    cellVerdict: result.cellVerdict }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { cellStats: cellStats, judge: judge, bucket: bucket, attributeIncrease: attributeIncrease,
  participationStats: participationStats, judgeParticipation: judgeParticipation, presenceStats: presenceStats, lendStats: lendStats, judgeLend: judgeLend,
  poolStats: poolStats, guardrailIdentity: guardrailIdentity, judgeLendfix: judgeLendfix, firstDiff: firstDiff,
  nearMissStats: nearMissStats, judgeLendpool: judgeLendpool, distBucket: distBucket };
