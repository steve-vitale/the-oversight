// analyze-fusioncell-participation-a.js — analyzer + judge, arm sim-fusioncell-participation-a.
// DIAG: quantify fusion-cell supply (finding #2599: chen_wei carried
// a searcaster 97 census-days with ZERO fusion cells on every one).
// Reads the fusioncell driver corpora (perseed-fusioncell-participation-a-diag):
// ammoCensus rows (ranged kit + carried/stashed fusion_cell per
// living villager), cellPile rows (pile materials + stash sections +
// scholar cells), ammoBaseline (day-0 stock), ammoDeparts (every
// villagerPocketAmmo call — searcaster departures read here),
// ammoLoot (kill-loot ammo/ranged drops), ammoPlayerCraft (ALL
// Game.craft calls), v4encounters (wave-4+ meetings, each with
// partyCells: fighter + allies' ranged kit + cells at entry).
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
//   node scripts/analyze-fusioncell-participation-a.js --dir DIR [--out FILE] [--no-judge]
//   node scripts/analyze-fusioncell-participation-a.js --selftest
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
    bowopenOn: {}, senseexpedOn: {},
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

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'bowopenOn', 'senseexpedOn',
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
    ],
    deaths: [{ kind: 'monster', cause: 'eaten' }],
  });
  fs.writeFileSync(path.join(dir, 's2.json'), JSON.stringify(seedP));
  const pp = participationStats(dir);
  check('participation: meetings 6 (4 new + 2 fixture), flees 4', pp.meetings === 6 && pp.flees === 4, JSON.stringify({ m: pp.meetings, f: pp.flees }));
  check('participation: lead attributed 4/6 (fixture seed-1 rows lack leadRule)', pp.leadAttributed === 4 && pp.leadUnclassified === 2, JSON.stringify({ a: pp.leadAttributed, u: pp.leadUnclassified }));
  check('participation: flee classified 3/4 (fixture seed-1 vFlee row has no fleeCause)', pp.fleeClassified === 3 && pp.fleeUnclassified === 1, JSON.stringify({ c: pp.fleeClassified, u: pp.fleeUnclassified }));
  check('participation: armed entries 1, armed leads 0, armed volleys 0', pp.armedEntries === 1 && pp.armedLeads === 0 && pp.armedVolleys === 0, JSON.stringify({ e: pp.armedEntries, l: pp.armedLeads, v: pp.armedVolleys }));
  check('participation: flee causes counted (hopeless-after-help, floor-hp, learn-withdrawal)', pp.fleeCauseCounts['hopeless-after-help'] === 1 && pp.fleeCauseCounts['floor-hp'] === 1 && pp.fleeCauseCounts['learn-withdrawal'] === 1, JSON.stringify(pp.fleeCauseCounts));
  check('participation: deaths per engaged meeting 1/5', pp.deathsPerEngaged === 0.2, 'got ' + pp.deathsPerEngaged);
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
  console.log('analyze-fusioncell-participation-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, outFile = null;
  const noJudge = args.indexOf('--no-judge') !== -1;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-fusioncell-participation-a.js --dir DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
  const st = cellStats(dir);
  const j = noJudge ? null : judge(st);
  const part = participationStats(dir);
  const pj = noJudge ? null : judgeParticipation(part);
  const result = { verdict: pj ? pj.verdict : null, kind: pj ? pj.kind : null, bars: pj ? pj.bars : null,
    participation: part,
    cellVerdict: j ? j.verdict : null, cellBars: j ? j.bars : null,
    diag: summarize(st), cellAppearanceDetail: st.cellAppearanceDetail,
    searcasterAppearanceDetail: st.searcasterAppearanceDetail, poolDetail: st.poolDetail };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars,
    participation: { meetings: part.meetings, engaged: part.engaged, flees: part.flees,
      leadAttribution: part.leadAttribution, fleeClassification: part.fleeClassification,
      armedEntries: part.armedEntries, armedLeads: part.armedLeads, armedVolleys: part.armedVolleys,
      deathsPerEngaged: part.deathsPerEngaged, national: part.national, seedWins: part.seedWins,
      wave4: part.wave4, wave5: part.wave5, medianDays: part.medianDays },
    cellVerdict: result.cellVerdict }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { cellStats: cellStats, judge: judge, bucket: bucket, attributeIncrease: attributeIncrease,
  participationStats: participationStats, judgeParticipation: judgeParticipation };
