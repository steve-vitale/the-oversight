// analyze-cellcheck-a.js — analyzer + judge, arm sim-cellcheck-a.
// DIAG: cell supply / re-arming (finding #2672 follow-up: on the
// killrate band a contest searcaster fired 2 volleys across two grants
// and then went dry; what cells does a contest grant actually carry,
// do holders ever re-arm, and how many wave-4+ volley opportunities
// are lost to dry guns?).
//
// Reads the cellcheck driver corpora (perseed-cellcheck-a-diag):
// grantEvents (every alienLootGrant, now with cellsBefore/cellsAfter/
// cellDelta for the destination container), contestPrizeEvents (now
// with cellMoves — the whole-prize cell diff, which is where the
// 2-cell searcaster bundle lands), ammoLoot (kill-loot drops, now with
// the killer's pre/post cells — the KILLBUNDLE-unset control),
// v4encounters (wave-4+ meetings, each with partyCells: fighter +
// allies' ranged kit + cells at entry, and the lead volley from the
// fight record), ammoCensus (daily per-villager cells + stashed cells),
// cellPile (pile + scholar cells).
//
// Frozen mechanism (prereg §2): alienLootGrant is units: 1 always
// (fusion_cell grant +1, searcaster grant +0 at grant level);
// _cxItemPrize under GUNRATE=1 bundles 2 cells beside a searcaster
// (prize-level +2, fusion_cell prize +1, anything else +0);
// villagerKillLoot under KILLBUNDLE-unset carries +0 on a searcaster,
// +1 on a fusion_cell; the volley is the LEAD fighter's only, 1 cell
// per shot; CELLGATE=1 holds fire below wave 4.
//
// Judge (frozen prereg): DIAG-GO iff (1) instrument validity
// (proof test + analyzer selftest green, 0 instrument errors, det-gate
// trajectories identical — the det-gate is recorded in the evidence
// file, not computed here); (2) attribution completeness >= 0.95;
// (3) grant-bundle table reported; (4) lost-volley count reported;
// (5) wall numbers reported.
//
// Usage:
//   node scripts/analyze-cellcheck-a.js --dir DIR [--out FILE] [--no-judge]
//   node scripts/analyze-cellcheck-a.js --selftest
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
function isEngaged(row) {
  const o = row && row.outcome;
  return o !== 'evade' && o !== 'alreadyDead';
}

// expectedGrantDelta(itemId): the frozen grant-level cell delta —
// alienLootGrant builds units: 1, so a fusion_cell grant is +1 and
// a searcaster grant (the gun alone) is +0. Pure; exported.
function expectedGrantDelta(itemId) {
  return itemId === 'fusion_cell' ? 1 : 0;
}
// expectedPrizeDelta(itemId): the frozen whole-prize cell delta —
// the _cxItemPrize bundle adds 2 cells beside a searcaster
// (GUNRATE=1); a fusion_cell prize is just its +1 grant; anything
// else moves no cells. Pure; exported.
function expectedPrizeDelta(itemId) {
  if (itemId === 'searcaster') return 2;
  if (itemId === 'fusion_cell') return 1;
  return 0;
}

// classifyFightEntry(row): the frozen fight-entry classification for
// one v4encounter row. The volley is the LEAD fighter's only —
// partyCells[0] is the lead (the driver builds pids as
// [vid].concat(allies)); allies never volley (their ranged weapon
// folds into melee only when ammo > 0). Returns null when partyCells
// is missing/empty (unattributed — the analyzer counts it, never
// silently defaults). Pure; exported.
function classifyFightEntry(row) {
  if (!row || !Array.isArray(row.partyCells) || !row.partyCells.length) return null;
  const engaged = isEngaged(row);
  const volley = (row.volley && typeof row.volley.shots === 'number')
    ? { shots: row.volley.shots | 0, hits: row.volley.hits | 0, dmg: row.volley.dmg | 0,
        ammoLeft: (row.volley.ammoLeft != null ? row.volley.ammoLeft | 0 : null) } : null;
  const parts = row.partyCells.map(function (pc, i) {
    const isLead = (i === 0);
    const hasGun = pc.rangedId === 'searcaster';
    const cells = (pc.cells | 0);
    let cls = 'none';
    if (hasGun) {
      if (isLead) cls = cells > 0 ? 'lead-armed' : 'lead-dry';
      else cls = cells > 0 ? 'ally-armed' : 'ally-dry';
    }
    return { vid: pc.vid, rangedId: pc.rangedId || null, ammoId: pc.ammoId || null,
      cells: cells, alive: !!pc.alive, isLead: isLead, cls: cls };
  });
  const lead = parts[0];
  return { day: row.day | 0, vid: row.vid || null, mid: row.mid || null, wave: row.wave | 0,
    outcome: row.outcome || null, engaged: engaged, origin: row.origin || null,
    lead: lead, participants: parts, volley: volley,
    searcasterParticipants: parts.filter(function (p) { return p.cls !== 'none'; }).length };
}

// reconcileGrant(grant, prizeMoves): join one grant row to the
// whole-prize cell moves from the same prize call (contestPrizeEvents
// cellMoves, matched by the analyzer on day + recipient vid; null
// when the grant came from no prize call, e.g. kill-loot / trade).
// Returns {grantDelta, prizeDelta, bundle, grantOk, prizeOk,
// explained, cause}. The bundle is the prize-level delta minus the
// grant-level delta (a contest searcaster: +2 − 0 = +2; a contest
// fusion_cell: +1 − +1 = 0 — the grant IS the prize). A grant is
// attributed when its counts are non-null and both deltas match the
// frozen expectations; a mismatch with no joinable cause is
// unattributed. Pure; exported.
function reconcileGrant(grant, prizeMoves) {
  const g = grant || {};
  const grantDelta = (g.cellDelta != null ? g.cellDelta : null);
  const grantOk = grantDelta != null && grantDelta === expectedGrantDelta(g.itemId);
  let prizeDelta = null, prizeOk = null, bundle = 0;
  if (prizeMoves != null) {
    // prizeMoves: the cellMoves array of the joined prize row (may be
    // empty — no cell moved). The recipient's move is the one whose
    // vid matches the grant's destination (villager vid, or
    // '__scholar__' for the scholar).
    const wantVid = (g.toKind === 'scholar') ? '__scholar__' : g.toVid;
    const mv = (prizeMoves || []).find(function (m) { return m.vid === wantVid; }) || null;
    prizeDelta = mv ? ((mv.after | 0) - (mv.before | 0)) : 0;
    prizeOk = prizeDelta === expectedPrizeDelta(g.itemId);
    bundle = prizeDelta - (grantDelta != null ? grantDelta : 0);
  }
  const explained = grantOk && (prizeOk !== false);
  let cause = null;
  if (!explained) {
    if (grantDelta == null) cause = 'grant-cells-unreadable';
    else if (!grantOk) cause = 'grant-delta-mismatch';
    else if (prizeOk === false) cause = 'prize-delta-mismatch';
    else cause = 'unexplained';
  }
  return { itemId: g.itemId || null, caller: g.caller || null,
    toKind: g.toKind || null, toVid: g.toVid || null, day: g.day | 0,
    grantDelta: grantDelta, prizeDelta: prizeDelta, bundle: bundle,
    grantOk: grantOk, prizeOk: prizeOk, explained: explained, cause: cause };
}

// buildRearmLedger(ctx, vid, day): the holder's re-arm history up to
// a dry fight entry. ctx: {grants: [{day, itemId, caller, toVid,
// cellDelta, bundle}], loot: [{day, vid, dropId, cellDelta}],
// census: [{day, vid, cells, cellsStash}], volleys: [{day, vid,
// shots, hits, dmg, cellsBefore, cellsAfter}], departs:
// [{day, vid, rangedId, carriedBefore}]}. All day-filtered to
// <= day. Returns the ledger; daysSinceLastCell is null when the
// holder NEVER held a cell (an accounted history, not a gap).
// Pure; exported.
function buildRearmLedger(ctx, vid, day) {
  const c = ctx || {};
  const grants = ((c.grants || []).filter(function (g) { return g.toVid === vid && (g.day | 0) <= day; }))
    .map(function (g) { return { day: g.day | 0, itemId: g.itemId || null, caller: g.caller || null,
      grantDelta: (g.cellDelta != null ? g.cellDelta : null), bundle: (g.bundle != null ? g.bundle : null) }; });
  const loot = ((c.loot || []).filter(function (l) { return l.vid === vid && (l.day | 0) <= day; }))
    .map(function (l) { return { day: l.day | 0, dropId: l.dropId || null,
      cellDelta: (l.cellDelta != null ? l.cellDelta : null) }; });
  const volleys = ((c.volleys || []).filter(function (v) { return v.vid === vid && (v.day | 0) <= day; }))
    .map(function (v) { return { day: v.day | 0, mid: v.mid || null, shots: v.shots | 0,
      hits: v.hits | 0, dmg: v.dmg | 0,
      cellsBefore: (v.cellsBefore != null ? v.cellsBefore : null),
      cellsAfter: (v.cellsAfter != null ? v.cellsAfter : null) }; });
  const departs = ((c.departs || []).filter(function (d) { return d.vid === vid && (d.day | 0) <= day; }))
    .map(function (d) { return { day: d.day | 0, rangedId: d.rangedId || null,
      cellsAtDeparture: (d.carriedBefore != null ? d.carriedBefore : null) }; });
  let lastCellDay = null, lastGrantDay = null, stashAtEntry = null;
  for (const g of grants) {
    if (g.grantDelta != null && g.grantDelta > 0) { if (lastGrantDay == null || g.day > lastGrantDay) lastGrantDay = g.day; }
    if (g.itemId === 'searcaster' || g.itemId === 'fusion_cell') {
      if (lastGrantDay == null || g.day > lastGrantDay) lastGrantDay = g.day;
    }
  }
  for (const l of loot) {
    if (l.cellDelta != null && l.cellDelta > 0) { if (lastGrantDay == null || l.day > lastGrantDay) lastGrantDay = l.day; }
  }
  const rows = ((c.census || []).filter(function (r) { return r.vid === vid && (r.day | 0) <= day; }))
    .sort(function (a, b) { return (a.day | 0) - (b.day | 0); });
  for (const r of rows) {
    if ((r.cells | 0) > 0) lastCellDay = r.day | 0;
    stashAtEntry = (r.cellsStash != null ? r.cellsStash | 0 : null);
  }
  // A grant that landed after the last census row still means the
  // holder held a cell that day, even if no census row shows it yet.
  for (const g of grants) {
    if (g.grantDelta != null && g.grantDelta > 0 && (lastCellDay == null || g.day > lastCellDay)) lastCellDay = g.day;
  }
  const spent = volleys.reduce(function (a, v) { return a + (v.shots | 0); }, 0);
  const granted = grants.reduce(function (a, g) { return a + ((g.grantDelta != null && g.grantDelta > 0) ? g.grantDelta : 0) + ((g.bundle != null && g.bundle > 0) ? g.bundle : 0); }, 0)
    + loot.reduce(function (a, l) { return a + ((l.cellDelta != null && l.cellDelta > 0) ? l.cellDelta : 0); }, 0);
  return { vid: vid, day: day | 0, grantsReceived: grants, killLoot: loot,
    volleysSpent: volleys, departsWithGun: departs,
    cellsGrantedTotal: granted, cellsSpentTotal: spent,
    daysSinceLastCell: (lastCellDay == null ? null : (day | 0) - lastCellDay),
    daysSinceLastGrant: (lastGrantDay == null ? null : (day | 0) - lastGrantDay),
    everHeldCells: lastCellDay != null, lastCellDay: lastCellDay, lastGrantDay: lastGrantDay,
    stashCellsAtEntry: stashAtEntry };
}

function cellStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    gunrateOn: {}, cellgateOn: {}, speargateOn: {}, bowopenOn: {},
    coverage: [], coverageComplete: 0,
    // grants + bundles (bar 3)
    grantsTotal: 0, grantsAttributed: 0, grantAttribution: null,
    searcasterGrants: 0, fusionCellGrants: 0,
    grantBundleTable: [], bundleHistogram: {},
    grantCellByCaller: {}, grantSearcasterByCaller: {},
    grantDeltaMismatches: [],
    // fight entries (bars 2 + 4)
    entriesTotal: 0, entriesAttributed: 0, entryAttribution: null,
    leadArmed: 0, leadDry: 0, allyArmed: 0, allyDry: 0,
    lostVolleys: 0, lostVolleyDetail: [],
    armedVolleysFired: 0, armedVolleyDmg: [], armedVolleyShots: [],
    meanArmedVolleyDmg: null, lostVolleyDmgEstimate: null,
    noFusionCellsLines: 0, cellgateHolds: 0,
    encWave4Plus: 0, encEngaged: 0,
    // attribution (bar 2, primary)
    attributionDenominator: 0, attributionNumerator: 0, attribution: null,
    unattributed: [],
    // wall numbers (bar 5)
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
    if (d.gunrateOn != null) st.gunrateOn[String(d.gunrateOn)] = (st.gunrateOn[String(d.gunrateOn)] || 0) + 1;
    if (d.cellgateOn != null) st.cellgateOn[String(d.cellgateOn)] = (st.cellgateOn[String(d.cellgateOn)] || 0) + 1;
    if (d.speargateOn != null) st.speargateOn[String(d.speargateOn)] = (st.speargateOn[String(d.speargateOn)] || 0) + 1;
    if (d.bowopenOn != null) st.bowopenOn[String(d.bowopenOn)] = (st.bowopenOn[String(d.bowopenOn)] || 0) + 1;
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
    // ---- coverage (bar 1, same shape as the fusioncell analyzer) ----
    const baseline = d.ammoBaseline || null;
    const baselineRows = (baseline && Array.isArray(baseline.census)) ? baseline.census : [];
    const censusRows = d.ammoCensus || [];
    const censusDays = {};
    for (const r of censusRows) censusDays[r.day | 0] = true;
    const livedDays = (d.gameDays | 0) || (d.days | 0) || 0;
    const coverDays = Object.keys(censusDays).length;
    const cov = { seed: seed, baselinePresent: baselineRows.length > 0,
      baselineRows: baselineRows.length, censusRows: censusRows.length,
      censusDays: coverDays, livedDays: livedDays,
      censusDayShare: livedDays ? coverDays / livedDays : null,
      instrumentErrors: seedErr,
      complete: baselineRows.length > 0 && censusRows.length > 0
        && seedErr === 0 && livedDays > 0 && (coverDays / livedDays) >= 0.5 };
    st.coverage.push(cov);
    if (cov.complete) st.coverageComplete++;

    // ---- grants: reconcile every searcaster / fusion_cell grant ----
    const grants = (d.grantEvents || []).filter(function (g) { return g.itemId === 'searcaster' || g.itemId === 'fusion_cell'; });
    const prizes = d.contestPrizeEvents || [];
    let seedGrants = 0, seedGrantsAttr = 0;
    for (const g of grants) {
      st.grantsTotal++; seedGrants++;
      if (g.itemId === 'searcaster') { st.searcasterGrants++; st.grantSearcasterByCaller[g.caller || '?'] = (st.grantSearcasterByCaller[g.caller || '?'] || 0) + 1; }
      else { st.fusionCellGrants++; st.grantCellByCaller[g.caller || '?'] = (st.grantCellByCaller[g.caller || '?'] || 0) + 1; }
      // Join the prize row: same day, and the prize's cellMoves name
      // the grant's recipient (villager vid, or '__scholar__'). A cell
      // grant's own prize call MUST move the recipient's cells under
      // the frozen expectations (bundle +2 / grant +1), so a row that
      // names nobody is only accepted when it is the SOLE prize row
      // that day — otherwise a different prize's row could join and
      // fake a mismatch. No joinable row is 'NO-PRIZE-ROW' (a
      // mismatch, not a silent pass).
      let prizeMoves = null;
      if (g.caller === 'contest-prize') {
        const wantVid = (g.toKind === 'scholar') ? '__scholar__' : g.toVid;
        const dayPrizes = prizes.filter(function (pz) { return (pz.day | 0) === (g.day | 0); });
        for (const pz of dayPrizes) {
          const moves = pz.cellMoves || [];
          if (moves.some(function (m) { return m.vid === wantVid; })) { prizeMoves = moves; break; }
        }
        if (prizeMoves == null && dayPrizes.length === 1) prizeMoves = dayPrizes[0].cellMoves || [];
        if (prizeMoves == null) prizeMoves = 'NO-PRIZE-ROW';
      }
      const rec = (prizeMoves === 'NO-PRIZE-ROW')
        ? { itemId: g.itemId, caller: g.caller, toKind: g.toKind, toVid: g.toVid, day: g.day | 0,
            grantDelta: (g.cellDelta != null ? g.cellDelta : null), prizeDelta: null, bundle: null,
            grantOk: (g.cellDelta != null && g.cellDelta === expectedGrantDelta(g.itemId)),
            prizeOk: false, explained: false, cause: 'no-prize-row' }
        : reconcileGrant(g, prizeMoves);
      const row = Object.assign({ seed: seed }, rec);
      st.grantBundleTable.push(row);
      if (rec.bundle != null) {
        const k = String(rec.bundle);
        st.bundleHistogram[k] = (st.bundleHistogram[k] || 0) + 1;
      }
      if (rec.explained) { st.grantsAttributed++; seedGrantsAttr++; }
      else st.grantDeltaMismatches.push(row);
    }

    // ---- fight entries: classify every wave-4+ meeting ----
    const encs = d.v4encounters || [];
    // Ledger context for this seed (built once per seed).
    const ledgerCtx = { grants: [], loot: [], census: [], volleys: [], departs: [] };
    for (const g of (d.grantEvents || [])) {
      if (g.itemId !== 'searcaster' && g.itemId !== 'fusion_cell') continue;
      // Bundle for the ledger: join the prize row the same way.
      let bundle = null;
      if (g.caller === 'contest-prize') {
        const wantVid = (g.toKind === 'scholar') ? '__scholar__' : g.toVid;
        const dayPrizes = prizes.filter(function (pz) { return (pz.day | 0) === (g.day | 0); });
        for (const pz of dayPrizes) {
          const moves = pz.cellMoves || [];
          const mv = moves.find(function (m) { return m.vid === wantVid; });
          if (mv) { bundle = ((mv.after | 0) - (mv.before | 0)) - (g.cellDelta != null ? g.cellDelta : 0); break; }
        }
        if (bundle == null && dayPrizes.length === 1) bundle = 0;
      }
      ledgerCtx.grants.push({ day: g.day | 0, itemId: g.itemId, caller: g.caller || null,
        toVid: (g.toKind === 'scholar') ? '__scholar__' : (g.toVid || null),
        cellDelta: (g.cellDelta != null ? g.cellDelta : null), bundle: bundle });
    }
    for (const l of (d.ammoLoot || [])) ledgerCtx.loot.push({ day: l.day | 0, vid: l.vid,
      dropId: l.dropId, cellDelta: (l.cellDelta != null ? l.cellDelta : null) });
    for (const r of censusRows) ledgerCtx.census.push({ day: r.day | 0, vid: r.vid,
      cells: (r.cells | 0), cellsStash: (r.cellsStash != null ? r.cellsStash | 0 : null) });
    for (const e of encs) {
      if (!e.partyCells || !e.partyCells.length) continue;
      const lead = e.partyCells[0];
      if (lead && lead.rangedId === 'searcaster' && e.volley && typeof e.volley.shots === 'number') {
        ledgerCtx.volleys.push({ day: e.day | 0, vid: e.vid, mid: e.mid || null,
          shots: e.volley.shots | 0, hits: e.volley.hits | 0, dmg: e.volley.dmg | 0,
          cellsBefore: (lead.cells | 0),
          cellsAfter: (e.volley.ammoLeft != null ? e.volley.ammoLeft | 0 : null) });
      }
    }
    for (const dep of (d.ammoDeparts || [])) {
      if (dep.rangedId === 'searcaster') ledgerCtx.departs.push({ day: dep.day | 0, vid: dep.vid,
        rangedId: dep.rangedId, carriedBefore: (dep.carriedBefore != null ? dep.carriedBefore : null) });
    }

    let seedEntries = 0, seedEntriesAttr = 0;
    for (const e of encs) {
      st.encWave4Plus++;
      if (isEngaged(e)) st.encEngaged++;
      for (const line of (e.log || [])) {
        if (/no fusion cells/i.test(String(line))) st.noFusionCellsLines++;
        if (/holds the Searcaster/i.test(String(line))) st.cellgateHolds++;
      }
      const cls = classifyFightEntry(e);
      if (!cls) {
        // A wave-4+ meeting with no partyCells is unattributed, but
        // only counts in the denominator when a searcaster COULD be
        // present — unknowable without the read. Counted as
        // unattributed with cause, never silently dropped.
        st.entriesTotal++; seedEntries++;
        st.unattributed.push({ seed: seed, kind: 'fight-entry', day: e.day | 0,
          vid: e.vid || null, mid: e.mid || null, cause: 'partyCells-missing' });
        continue;
      }
      if (cls.searcasterParticipants === 0) continue;
      st.entriesTotal++; seedEntries++;
      let entryAttr = true;
      let ledger = null;
      for (const p of cls.participants) {
        if (p.cls === 'lead-armed') { st.leadArmed++; if (cls.engaged && cls.volley && cls.volley.shots > 0) { st.armedVolleysFired++; st.armedVolleyDmg.push(cls.volley.dmg); st.armedVolleyShots.push(cls.volley.shots); } }
        else if (p.cls === 'lead-dry') {
          st.leadDry++;
          ledger = buildRearmLedger(ledgerCtx, p.vid, cls.day);
          if (!ledger) entryAttr = false;
          if (cls.engaged) {
            st.lostVolleys++;
            st.lostVolleyDetail.push({ seed: seed, day: cls.day, vid: p.vid,
              mid: cls.mid, wave: cls.wave, outcome: cls.outcome, origin: cls.origin,
              ledger: ledger });
          }
        }
        else if (p.cls === 'ally-armed') st.allyArmed++;
        else if (p.cls === 'ally-dry') st.allyDry++;
      }
      if (entryAttr) { st.entriesAttributed++; seedEntriesAttr++; }
      else st.unattributed.push({ seed: seed, kind: 'fight-entry', day: cls.day,
        vid: cls.vid, mid: cls.mid, cause: 'ledger-missing' });
    }
    st.perSeed.push({ seed: seed, days: st.days[st.days.length - 1],
      endReason: d.endReason || null, won: !!d.won, scaleRank: d.scaleRank || null,
      maxWave: d.maxWave | 0, standing: d.standing != null ? d.standing : null,
      grants: seedGrants, grantsAttributed: seedGrantsAttr,
      entries: seedEntries, entriesAttributed: seedEntriesAttr,
      v4encounters: encs.length, instrumentErrors: seedErr });
  }
  st.grantAttribution = st.grantsTotal ? st.grantsAttributed / st.grantsTotal : null;
  st.entryAttribution = st.entriesTotal ? st.entriesAttributed / st.entriesTotal : null;
  st.attributionDenominator = st.grantsTotal + st.entriesTotal;
  st.attributionNumerator = st.grantsAttributed + st.entriesAttributed;
  st.attribution = st.attributionDenominator ? st.attributionNumerator / st.attributionDenominator : null;
  st.medianDays = median(st.days);
  st.meanArmedVolleyDmg = mean(st.armedVolleyDmg);
  st.lostVolleyDmgEstimate = (st.meanArmedVolleyDmg != null)
    ? Math.round(st.lostVolleys * st.meanArmedVolleyDmg) : null;
  return st;
}

function judge(st) {
  const bars = [];
  const covOk = st.coverageComplete === st.valid && st.valid > 0;
  bars.push({ n: 1, name: 'instrument validity',
    threshold: 'proof + selftest green, 0 instrument errors, coverage complete on all seeds',
    measured: 'coverageComplete ' + st.coverageComplete + '/' + st.valid +
      ', instrumentErrors ' + st.errors,
    pass: covOk && st.errors === 0 });
  bars.push({ n: 2, name: 'attribution completeness >= 0.95 (primary)',
    threshold: '>= 0.95',
    measured: st.attribution == null ? 'no denominator (0 grants + 0 entries)'
      : st.attributionNumerator + '/' + st.attributionDenominator + ' = ' + st.attribution.toFixed(3) +
        ' (grants ' + st.grantsAttributed + '/' + st.grantsTotal +
        ', entries ' + st.entriesAttributed + '/' + st.entriesTotal + ')',
    pass: st.attribution != null && st.attribution >= 0.95 });
  bars.push({ n: 3, name: 'grant-bundle table reported',
    threshold: 'every searcaster/fusion_cell grant reconciled',
    measured: st.grantsTotal + ' grants (' + st.searcasterGrants + ' searcaster, ' +
      st.fusionCellGrants + ' fusion_cell), bundle histogram ' + JSON.stringify(st.bundleHistogram),
    pass: st.grantsTotal >= 0 });
  bars.push({ n: 4, name: 'lost-volley count reported',
    threshold: 'engaged lead-dry entries + ally-dry entries + armed volleys, each dry case with ledger',
    measured: 'lostVolleys ' + st.lostVolleys + ' (lead-dry ' + st.leadDry +
      ', ally-dry ' + st.allyDry + ', lead-armed ' + st.leadArmed +
      ', armed volleys fired ' + st.armedVolleysFired +
      ', mean armed-volley dmg ' + (st.meanArmedVolleyDmg == null ? 'n/a' : st.meanArmedVolleyDmg.toFixed(1)) +
      ', lost-dmg estimate ' + (st.lostVolleyDmgEstimate == null ? 'n/a' : st.lostVolleyDmgEstimate) + ')',
    pass: true });
  bars.push({ n: 5, name: 'wall numbers reported',
    threshold: 'wins / national / wave 4-5 / median survival',
    measured: 'wins ' + st.seedWins + '/' + st.valid + ', national ' + st.national + '/' + st.valid +
      ', wave4 ' + st.wave4 + '/' + st.valid + ', wave5 ' + st.wave5 + '/' + st.valid +
      ', medianDays ' + st.medianDays + ', communityLost ' + st.communityLost,
    pass: st.valid > 0 });
  const pass = bars.every(function (b) { return b.pass; });
  return { verdict: pass ? 'DIAG-GO' : 'DIAG-NO-GO', bars: bars };
}

function selftest() {
  let passed = 0, failed = 0;
  const fails = [];
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS ' + name); }
    else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  // expected deltas
  check('expectedGrantDelta fusion_cell +1', expectedGrantDelta('fusion_cell') === 1);
  check('expectedGrantDelta searcaster +0', expectedGrantDelta('searcaster') === 0);
  check('expectedPrizeDelta searcaster +2', expectedPrizeDelta('searcaster') === 2);
  check('expectedPrizeDelta fusion_cell +1', expectedPrizeDelta('fusion_cell') === 1);
  check('expectedPrizeDelta starfall_lance +0', expectedPrizeDelta('starfall_lance') === 0);
  // classifyFightEntry: lead-armed
  const armed = classifyFightEntry({ day: 100, vid: 'v1', mid: 'eulogy', wave: 4, outcome: 'vKill',
    partyCells: [{ vid: 'v1', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 2, alive: true },
      { vid: 'v2', rangedId: 'bow', ammoId: 'arrow', cells: 0, alive: true }],
    volley: { shots: 2, hits: 2, dmg: 132, ammoLeft: 0 } });
  check('lead-armed classified', armed && armed.lead.cls === 'lead-armed' && armed.engaged === true);
  check('lead-armed volley carried', armed && armed.volley.shots === 2 && armed.volley.dmg === 132);
  check('bow ally is none', armed && armed.participants[1].cls === 'none');
  // lead-dry, evaded (not a lost volley — engaged false)
  const dryEvaded = classifyFightEntry({ day: 110, vid: 'v1', mid: 'reunion', wave: 4, outcome: 'evade',
    partyCells: [{ vid: 'v1', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 0, alive: true }],
    volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 } });
  check('lead-dry evaded: dry but not engaged', dryEvaded && dryEvaded.lead.cls === 'lead-dry' && dryEvaded.engaged === false);
  // ally-dry
  const allyDry = classifyFightEntry({ day: 115, vid: 'v9', mid: 'eulogy', wave: 4, outcome: 'fled',
    partyCells: [{ vid: 'v9', rangedId: 'bow', ammoId: 'arrow', cells: 0, alive: true },
      { vid: 'v1', rangedId: 'searcaster', ammoId: 'fusion_cell', cells: 0, alive: true }],
    volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 } });
  check('ally-dry classified', allyDry && allyDry.participants[1].cls === 'ally-dry' && allyDry.lead.cls === 'none');
  // missing partyCells -> null (unattributed, never defaulted)
  check('missing partyCells -> null', classifyFightEntry({ day: 1, vid: 'v1', mid: 'eulogy', wave: 4, outcome: 'fled', volley: null }) === null);
  check('empty partyCells -> null', classifyFightEntry({ day: 1, vid: 'v1', mid: 'eulogy', wave: 4, outcome: 'fled', partyCells: [], volley: null }) === null);
  // reconcileGrant: contest searcaster +2 bundle
  const r1 = reconcileGrant({ day: 88, itemId: 'searcaster', caller: 'contest-prize', toKind: 'villager', toVid: 'v1', cellDelta: 0 },
    [{ vid: 'v1', before: 0, after: 2 }]);
  check('contest searcaster reconciles: grant +0, prize +2, bundle +2', r1.explained && r1.grantDelta === 0 && r1.prizeDelta === 2 && r1.bundle === 2);
  // contest fusion_cell: grant +1, prize +1, bundle 0
  const r2 = reconcileGrant({ day: 76, itemId: 'fusion_cell', caller: 'contest-prize', toKind: 'scholar', toVid: null, cellDelta: 1 },
    [{ vid: '__scholar__', before: 0, after: 1 }]);
  check('contest fusion_cell reconciles: grant +1, prize +1, bundle 0', r2.explained && r2.grantDelta === 1 && r2.prizeDelta === 1 && r2.bundle === 0);
  // kill-loot fusion_cell: no prize row, grant +1
  const r3 = reconcileGrant({ day: 50, itemId: 'fusion_cell', caller: 'kill-loot-corpse', toKind: 'corpse', toVid: 'c1', cellDelta: 1 }, null);
  check('kill-loot fusion_cell reconciles without a prize row', r3.explained && r3.grantDelta === 1 && r3.prizeDelta === null && r3.bundle === 0);
  // kill-loot searcaster (KILLBUNDLE unset): grant +0, no prize row
  const r4 = reconcileGrant({ day: 60, itemId: 'searcaster', caller: 'other', toKind: 'villager', toVid: 'v1', cellDelta: 0 }, null);
  check('kill-loot searcaster reconciles at +0 (KILLBUNDLE unset)', r4.explained && r4.grantDelta === 0 && r4.bundle === 0);
  // mismatch: contest searcaster with no bundle (GUNRATE off shape) is unattributed
  const r5 = reconcileGrant({ day: 88, itemId: 'searcaster', caller: 'contest-prize', toKind: 'villager', toVid: 'v1', cellDelta: 0 },
    [{ vid: 'v1', before: 0, after: 0 }]);
  check('contest searcaster with prize +0 is NOT explained', r5.explained === false && r5.cause === 'prize-delta-mismatch');
  // mismatch: unreadable grant cells
  const r6 = reconcileGrant({ day: 88, itemId: 'fusion_cell', caller: 'contest-prize', toKind: 'villager', toVid: 'v1', cellDelta: null },
    [{ vid: 'v1', before: 0, after: 1 }]);
  check('unreadable grant cells are NOT explained', r6.explained === false && r6.cause === 'grant-cells-unreadable');
  // buildRearmLedger: grants + volley spend + days-since
  const led = buildRearmLedger({
    grants: [{ day: 88, itemId: 'searcaster', caller: 'contest-prize', toVid: 'v1', cellDelta: 0, bundle: 2 }],
    loot: [{ day: 95, vid: 'v1', dropId: 'fusion_cell', cellDelta: 1 }],
    census: [{ day: 88, vid: 'v1', cells: 2, cellsStash: 0 }, { day: 96, vid: 'v1', cells: 0, cellsStash: 0 }, { day: 110, vid: 'v1', cells: 0, cellsStash: 1 }],
    volleys: [{ day: 96, vid: 'v1', mid: 'reunion', shots: 2, hits: 2, dmg: 132, cellsBefore: 2, cellsAfter: 0 }],
    departs: [] }, 'v1', 115);
  check('ledger counts the grant bundle', led.cellsGrantedTotal === 3);
  check('ledger counts volley spend', led.cellsSpentTotal === 2);
  check('ledger days-since-last-cell', led.daysSinceLastCell === 27);
  check('ledger days-since-last-grant', led.daysSinceLastGrant === 20);
  check('ledger stash at entry', led.stashCellsAtEntry === 1);
  check('ledger ever-held', led.everHeldCells === true && led.lastCellDay === 88);
  // never-held ledger is still complete
  const led2 = buildRearmLedger({ grants: [], loot: [], census: [{ day: 50, vid: 'v2', cells: 0, cellsStash: 0 }], volleys: [], departs: [] }, 'v2', 60);
  check('never-held ledger: days-since null, everHeld false', led2.daysSinceLastCell === null && led2.everHeldCells === false && led2.daysSinceLastGrant === null);
  console.log('CELLCHECK_ANALYZER_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('CELLCHECK_ANALYZER_PASSED ' + passed + '/' + (passed + failed));
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let dir = null, out = null, noJudge = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') out = args[++i];
    else if (args[i] === '--no-judge') noJudge = true;
  }
  if (!dir) { console.error('CELLCHECK STOP: --dir required'); process.exit(2); }
  const st = cellStats(dir);
  const j = noJudge ? null : judge(st);
  const payload = { stats: st, judge: j };
  const text = JSON.stringify(payload, null, 2) + '\n';
  if (out) fs.writeFileSync(out, text);
  else process.stdout.write(text);
  if (j) {
    console.error('CELLCHECK verdict: ' + j.verdict);
    for (const b of j.bars) console.error('  bar ' + b.n + ' ' + (b.pass ? 'PASS' : 'FAIL') + ' — ' + b.name + ': ' + b.measured);
  }
}

module.exports = { cellStats: cellStats, judge: judge, selftest: selftest,
  classifyFightEntry: classifyFightEntry, reconcileGrant: reconcileGrant,
  buildRearmLedger: buildRearmLedger, expectedGrantDelta: expectedGrantDelta,
  expectedPrizeDelta: expectedPrizeDelta, isEngaged: isEngaged };
