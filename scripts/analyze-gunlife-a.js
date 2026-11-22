// analyze-gunlife-a.js — gun-life tracer for arm sim-gunlife-a
// (finding #2667: CONTEST GUNS NEVER FIRE).
// Reads killlootbundle-driver-a per-seed JSONs and traces ONE life per
// contest searcaster grant: holder, equipped days, wave-4+ fights
// entered while held, volley attempts, cells held, final disposition —
// with per-grant dated life rows (state ranges tiling grant day .. end,
// plus dated event rows). Names the mechanism behind 0 volleys.
//   node scripts/analyze-gunlife-a.js --dir <dir> --out <file>
//   node scripts/analyze-gunlife-a.js --selftest
// Does NOT touch analyze-killlootbundle-a.js; reuses its analyzeLeg
// only for wall numbers (wins/national/wave4/wave5/median survival).
// Census-pitfall discipline (finding #2635 / corpsecap-a §3): an
// `equipped` row for a holder flagged dead in that day's personFlags
// is a GHOST (generatePossessions copies the dead person's gear to the
// corpse without removing it from the dead record) and is SKIPPED; a
// `scholar-equipped` row COUNTS as an equipped day for __scholar__
// (the killloot analyzer's holder-days count missed it). Scholar
// equipped days carry no cell count in the census — cells are `n/a
// (census-blind)` there, never invented.
// Coverage limits (frozen in the prereg): the corpus records a fight
// only when the fighter LEADS it AND has a ranged weapon equipped
// (rec.volley non-null) — a holder who fights as an ally, or leads with
// no ranged weapon, leaves no record. "0 fights entered" therefore
// means "0 lead-with-ranged-weapon fights observed".
'use strict';
const fs = require('fs');
const path = require('path');
const killloot = require(path.join(__dirname, 'analyze-killlootbundle-a.js'));

const SCHOLAR = '__scholar__';

function loadDir(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/killlootbundle-a-s\d+-killlootbundle-a-(ctl|arm)\.json$/.test(f)) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}

// One census day's gun state for a holder. Returns null when the holder
// holds no gun that day. `loc` is the best (most usable) location:
// equipped > carried > stashed > corpse > village-stash.
function holderStateOnDay(row, holder) {
  const flags = (row && row.personFlags) || {};
  const locs = (row && row.locations) || [];
  const dead = holder !== SCHOLAR && !!(flags[holder] && flags[holder].dead);
  if (holder === SCHOLAR) {
    let eq = null, pack = null;
    for (const l of locs) {
      if (l.loc === 'scholar-equipped' && l.vid === SCHOLAR) eq = l;
      if (l.loc === 'scholar-pack' && l.vid === SCHOLAR) pack = l;
    }
    if (eq) return { loc: 'scholar-equipped', equipped: true, cells: null, count: eq.count || 1 };
    if (pack) return { loc: 'scholar-pack', equipped: false, cells: null, count: pack.count || 1 };
    return null;
  }
  let eq = null, carried = null, stashed = null, corpse = null;
  for (const l of locs) {
    if (l.loc === 'equipped' && l.vid === holder) eq = l;
    if (l.loc === 'carried' && l.vid === holder) carried = l;
    if (l.loc === 'stashed' && l.vid === holder) stashed = l;
    if (l.loc === 'corpse' && l.cvid === holder) corpse = l;
  }
  // Dead holder: the equipped row is the #2635 ghost — skip it. The real
  // gun, if any, is the corpse copy.
  if (dead) {
    if (corpse) return { loc: 'corpse', equipped: false, cells: null, count: corpse.count || 1, dead: true };
    return null;
  }
  if (eq) return { loc: 'equipped', equipped: true, cells: (eq.cells == null ? null : eq.cells), count: eq.count || 1 };
  if (carried) return { loc: 'carried', equipped: false, cells: null, count: carried.count || 1 };
  if (stashed) return { loc: 'stashed', equipped: false, cells: null, count: stashed.count || 1 };
  if (corpse) return { loc: 'corpse', equipped: false, cells: null, count: corpse.count || 1 };
  return null;
}

// Where in the world is any gun on this census day, besides `holder`?
// Used to spot where a gun went when it left its holder.
function otherGunSightings(row, holder) {
  const out = [];
  for (const l of ((row && row.locations) || [])) {
    if (l.loc === 'equipped' && l.vid && l.vid !== holder) out.push({ loc: 'equipped', vid: l.vid });
    if (l.loc === 'carried' && l.vid && l.vid !== holder) out.push({ loc: 'carried', vid: l.vid });
    if (l.loc === 'stashed' && l.vid && l.vid !== holder) out.push({ loc: 'stashed', vid: l.vid });
    if (l.loc === 'scholar-equipped' && holder !== SCHOLAR) out.push({ loc: 'scholar-equipped', vid: SCHOLAR });
    if (l.loc === 'scholar-pack' && holder !== SCHOLAR) out.push({ loc: 'scholar-pack', vid: SCHOLAR });
    if (l.loc === 'corpse' && l.cvid && l.cvid !== holder) out.push({ loc: 'corpse', vid: l.cvid, cid: l.cid });
    if (l.loc === 'stash') out.push({ loc: 'village-stash', vid: null });
  }
  return out;
}

function deathDayOf(c, holder) {
  if (holder === SCHOLAR) return null;
  for (const row of (c.v4gunLoc || [])) {
    const f = (row.personFlags || {})[holder];
    if (f && f.dead) return row.day;
  }
  return null;
}

// Classify the mechanism from the gun's whole traced life. First match
// wins; the order is the causal order (a fired gun needs no excuse; a
// vanished gun's story ends at the vanish).
function classifyMechanism(t) {
  if (t.attempts.fired > 0) return 'fired';
  if (t.vanished) return 'unexplained-vanish';
  if (t.gunFights4plus > 0) {
    if (t.attempts.dry > 0 && t.attempts.held === 0) return 'led-with-gun-dry';
    if (t.attempts.held > 0 && t.attempts.dry === 0) return 'held-at-wave4+';
    return 'mixed-dry-held';
  }
  if (t.fightsEntered4plus > 0) return 'led-with-other-weapon';
  if (t.equippedDays === 0) {
    if (t.holderDeathDay != null && t.holderDeathDay <= (t.lastSeenDay || 1e9)
        && t.finalDisposition && t.finalDisposition.indexOf('corpse') === 0) return 'holder-died-first';
    if (t.transfers.length > 0 && t.transfers.some(function (x) { return x.kind === 'unattributed-transfer'; })) return 'gun-left-holder';
    return 'never-equipped';
  }
  return 'equipped-never-led-wave4+';
}

function traceSeed(c) {
  const rows = (c.v4gunLoc || []).slice().sort(function (a, b) { return a.day - b.day; });
  const lastCensusDay = rows.length ? rows[rows.length - 1].day : (c.gameDays || 0);
  const endDay = c.gameDays || lastCensusDay;
  const volleys = (c.volleyEvents || []).slice();
  const takes = (c.corpseTakeEvents || []).filter(function (e) { return e.itemId === 'searcaster'; });

  // Grants: one per prize-event gains entry with gunsGained > 0.
  const rawGrants = [];
  for (const pe of (c.prizeEvents || [])) {
    for (const g of (pe.gains || [])) {
      if ((g.gunsGained || 0) > 0) {
        rawGrants.push({
          id: 's' + c.seed + '-seq' + pe.seq + '-' + g.holder,
          seed: c.seed, seq: pe.seq, day: pe.day, holder: g.holder,
          cellsGained: g.cellsGained || 0, cellsAfter: g.cellsAfter,
          contestId: pe.contestId || null, risk: pe.risk || null,
          wave: pe.wave, predictedFighter: pe.predictedFighter || null,
          who: pe.who || null,
        });
      }
    }
  }
  // Group grants that share one holder's stock (a second grant to the
  // same holder deepens one stock — corpsecap-a §2). Their lives merge;
  // each grant still gets its own rows (flagged sharedStock).
  const groups = [];
  const byHolder = {};
  for (const g of rawGrants) {
    const k = g.holder;
    if (!byHolder[k]) { byHolder[k] = []; groups.push(byHolder[k]); }
    byHolder[k].push(g);
  }

  const grants = [];
  for (const group of groups) {
    const first = group[0];
    const sharedStock = group.length > 1;
    const trace = traceGunLife(c, rows, volleys, takes, first, lastCensusDay, endDay);
    for (const g of group) {
      grants.push(Object.assign({}, trace, {
        id: g.id, seq: g.seq, day: g.day, holder: g.holder,
        cellsGained: g.cellsGained, cellsAfter: g.cellsAfter,
        contestId: g.contestId, risk: g.risk, wave: g.wave,
        predictedFighter: g.predictedFighter, who: g.who,
        sharedStock: sharedStock, sharedWith: group.map(function (x) { return x.id; }),
      }));
    }
  }
  const searGrantEvents = (c.grantEvents || []).filter(function (e) { return e.itemId === 'searcaster'; });
  const klSear = (c.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; });
  return {
    seed: c.seed, mode: c.mode, days: c.gameDays, endReason: c.endReason,
    won: !!c.won, villageLost: !!c.villageLost, maxWave: c.maxWave,
    standing: c.standing, scaleRank: c.scaleRank,
    grants: grants, grantCount: rawGrants.length,
    grantEventCount: searGrantEvents.length,
    grantEventMismatch: searGrantEvents.length !== rawGrants.length,
    klSearArrivals: klSear.length,
    totalArrivals: rawGrants.length + klSear.length,
    searVolleys: volleys.filter(function (e) { return e.rwId === 'searcaster' && (e.shots || 0) > 0; }).length,
    instrumentErrors: (c.instrumentErrors || []).length,
  };
}

// Trace ONE gun-stock's life from its first grant day. Follows the gun
// across holders (transfers), through death, to its final disposition.
function traceGunLife(c, rows, volleys, takes, grant, lastCensusDay, endDay) {
  const grantDay = grant.day;
  let holder = grant.holder;
  const events = [{ day: grantDay, kind: 'grant', holder: holder, cellsAfter: grant.cellsAfter,
    contestId: grant.contestId, wave: grant.wave }];
  const transfers = [];
  const states = [];
  let vanished = false;
  let vanishDay = null;
  let vanishHolder = null;
  let lastSeenDay = grantDay;
  let lastState = null;
  let prevTotal = null;
  let prevHolderState = null;
  let firstUnseen = true;

  // Daily states from the grant day to the last census day.
  for (const row of rows) {
    if (row.day < grantDay) continue;
    const st = holderStateOnDay(row, holder);
    const total = row.total;
    if (st) {
      lastSeenDay = row.day;
      firstUnseen = false;
      // Holder changed under us? A gun can only leave via a transfer,
      // a death (corpse), or a take — detect the move from the census.
      if (prevHolderState === null && !firstUnseen) {
        // (first sighted day after an unseen stretch — handled below)
      }
      if (lastState && (lastState.holder !== holder || lastState.loc !== st.loc
          || lastState.equipped !== st.equipped || lastState.cells !== st.cells)) {
        states.push({ from: lastState.from, to: row.day - 1, holder: lastState.holder,
          loc: lastState.loc, equipped: lastState.equipped, cells: lastState.cells });
        lastState = { from: row.day, holder: holder, loc: st.loc, equipped: st.equipped, cells: st.cells };
      } else if (!lastState) {
        lastState = { from: row.day, holder: holder, loc: st.loc, equipped: st.equipped, cells: st.cells };
      }
      // A gun arriving on a NEW holder while our holder's stock fell is
      // a transfer; the census is the only witness when no event logs it.
      let transferredTo = null;
      if (prevHolderState && prevHolderState.count > st.count && total === prevTotal) {
        const sightings = otherGunSightings(row, holder);
        const take = takes.find(function (t) { return t.day >= prevHolderState.day && t.day <= row.day; });
        const dest = sightings[0] || null;
        const kind = take ? 'corpse-take' : 'unattributed-transfer';
        transfers.push({ day: row.day, kind: kind, from: holder,
          to: dest ? dest.vid : null, toLoc: dest ? dest.loc : null,
          corpseId: take ? take.corpseId : (dest ? dest.cid : null) || null });
        events.push({ day: row.day, kind: kind, from: holder,
          to: dest ? dest.vid : null, toLoc: dest ? dest.loc : null });
        if (dest && dest.vid) holder = dest.vid;
        // Re-read this day's state for the NEW holder so the range
        // continues under the right holder.
        const nst = holderStateOnDay(row, holder);
        if (nst) {
          if (lastState && lastState.from < row.day) {
            states.push({ from: lastState.from, to: row.day - 1, holder: lastState.holder,
              loc: lastState.loc, equipped: lastState.equipped, cells: lastState.cells });
          }
          lastState = { from: row.day, holder: holder, loc: nst.loc, equipped: nst.equipped, cells: nst.cells };
          transferredTo = nst;
        }
      }
      // After a transfer, the previous-day state is the NEW holder's
      // state (transferredTo), not the old holder's (st): using st's
      // count here clobbers the comparison on the next day and masks
      // a follow-on transfer when the counts differ.
      prevHolderState = transferredTo
        ? { day: row.day, count: transferredTo.count }
        : { day: row.day, count: st.count };
    } else {
      // Holder shows no gun this day.
      if (lastState) {
        states.push({ from: lastState.from, to: row.day - 1, holder: lastState.holder,
          loc: lastState.loc, equipped: lastState.equipped, cells: lastState.cells });
        lastState = null;
      }
      if (prevHolderState && prevHolderState.count > 0) {
        // The gun left its holder. Where did it go?
        const sightings = otherGunSightings(row, holder);
        const take = takes.find(function (t) { return t.day >= prevHolderState.day && t.day <= row.day; });
        if (total < prevTotal) {
          // World total fell with no event: the gun vanished from the
          // census. (A corpse-cap cull is one uninstrumented cause —
          // named as a hypothesis in the evidence, never asserted.)
          vanished = true;
          if (vanishDay == null) { vanishDay = row.day; vanishHolder = holder; }
          events.push({ day: row.day, kind: 'vanish', from: holder, totalBefore: prevTotal, totalAfter: total });
        } else if (sightings.length) {
          const dest = sightings[0];
          const kind = take ? 'corpse-take' : 'unattributed-transfer';
          transfers.push({ day: row.day, kind: kind, from: holder,
            to: dest.vid, toLoc: dest.loc, corpseId: take ? take.corpseId : dest.cid || null });
          events.push({ day: row.day, kind: kind, from: holder, to: dest.vid, toLoc: dest.loc });
          holder = dest.vid;
          const nst = holderStateOnDay(row, holder);
          if (nst) {
            lastState = { from: row.day, holder: holder, loc: nst.loc, equipped: nst.equipped, cells: nst.cells };
            lastSeenDay = row.day;
            prevHolderState = { day: row.day, count: nst.count };
            prevTotal = total;
            continue;
          }
        } else if (take) {
          transfers.push({ day: row.day, kind: 'corpse-take', from: holder,
            to: SCHOLAR, toLoc: 'scholar-pack', corpseId: take.corpseId });
          events.push({ day: row.day, kind: 'corpse-take', from: holder, to: SCHOLAR, toLoc: 'scholar-pack' });
          holder = SCHOLAR;
        } else {
          // No sighting, total conserved: the gun is somewhere the
          // census cannot place (e.g. in transit between snapshots).
          // Record the gap, do not force an attribution.
          events.push({ day: row.day, kind: 'holder-empty-total-conserved', from: holder, total: total });
        }
      }
      prevHolderState = null;
    }
    prevTotal = total;
  }
  if (lastState) {
    states.push({ from: lastState.from, to: lastCensusDay, holder: lastState.holder,
      loc: lastState.loc, equipped: lastState.equipped, cells: lastState.cells });
  }
  // Terminal vanished range (sim-vanishtile-a): after a vanish the gun is
  // gone for good — close the tiling at the vanish day so the states tile
  // grantDay..lastCensusDay. Only when no later state re-covers the gun
  // (a reappearance after a vanish would overlap; leave that gap visible
  // rather than forcing a tiling).
  if (vanished && vanishDay != null && states.length
      && states[states.length - 1].to < vanishDay) {
    states.push({ from: vanishDay, to: lastCensusDay, holder: vanishHolder,
      loc: 'vanished', equipped: false, cells: null });
  }
  // Grant-day unseen stretch: if the first sight is after the grant day,
  // prepend an unseen range so the states tile grantDay..lastCensusDay.
  if (states.length && states[0].from > grantDay) {
    states.unshift({ from: grantDay, to: states[0].from - 1, holder: grant.holder,
      loc: 'grant-day-unseen', equipped: false, cells: null });
  }
  if (!states.length) {
    states.push({ from: grantDay, to: lastCensusDay, holder: grant.holder,
      loc: 'never-seen', equipped: false, cells: null });
  }

  // Counts from the tiled states.
  let equippedDays = 0, equippedDaysWithCells = 0, equippedDaysCellsNA = 0;
  let carriedDays = 0, stashedDays = 0, corpseDays = 0, unseenDays = 0, vanishedDays = 0;
  let cellsAtEnd = null, lastEquippedCells = null;
  for (const s of states) {
    const n = s.to - s.from + 1;
    if (s.equipped) {
      equippedDays += n;
      if (s.cells != null && s.cells > 0) { equippedDaysWithCells += n; lastEquippedCells = s.cells; }
      else if (s.cells == null) { equippedDaysCellsNA += n; }
      if (s.cells != null) cellsAtEnd = s.cells;
    } else if (s.loc === 'carried' || s.loc === 'scholar-pack') carriedDays += n;
    else if (s.loc === 'stashed') stashedDays += n;
    else if (s.loc === 'corpse') corpseDays += n;
    else if (s.loc === 'vanished') vanishedDays += n;
    else unseenDays += n;
  }
  if (lastEquippedCells != null) cellsAtEnd = lastEquippedCells;

  // Fights entered while held: volleyEvents dated in [grantDay, endDay].
  // For a villager holder the vid must match (the holder may change
  // mid-life, so match the holder on that day); for the scholar the vid
  // is the vessel's id, unknown to the census — match searcaster volleys
  // in the period instead and record the vid as the inferred vessel.
  // Days in a terminal `vanished` range are NOT held days: the holder
  // demonstrably holds no gun there, so no fight there counts.
  const holderByDay = {};
  for (const s of states) {
    if (s.loc === 'vanished') continue;
    for (let d = s.from; d <= s.to; d++) holderByDay[d] = s.holder;
  }
  let fightsEntered = 0, fightsEntered4plus = 0, gunFights = 0, gunFights4plus = 0;
  const attempts = { fired: 0, held: 0, dry: 0, shots: 0 };
  const fightRows = [];
  for (const v of volleys) {
    if (v.day < grantDay || v.day > endDay) continue;
    const h = holderByDay[v.day];
    if (h == null) continue;
    const isGunFight = v.rwId === 'searcaster';
    let mine = false;
    if (h === SCHOLAR) mine = isGunFight; // scholar vessel id unknown; gun volleys only
    else mine = (v.vid === h);
    if (!mine) continue;
    fightsEntered++;
    if ((v.wave || 0) >= 4) fightsEntered4plus++;
    if (isGunFight) {
      gunFights++;
      if ((v.wave || 0) >= 4) gunFights4plus++;
      if ((v.shots || 0) > 0) { attempts.fired++; attempts.shots += v.shots; }
      else if ((v.ammoLeft || 0) > 0) attempts.held++;
      else attempts.dry++;
      fightRows.push({ day: v.day, vid: v.vid, rwId: v.rwId, wave: v.wave,
        mdefId: v.mdefId, shots: v.shots, hits: v.hits, dmg: v.dmg, ammoLeft: v.ammoLeft });
      events.push({ day: v.day, kind: 'fight', vid: v.vid, rwId: v.rwId,
        wave: v.wave, mdefId: v.mdefId, shots: v.shots, ammoLeft: v.ammoLeft });
    } else {
      fightRows.push({ day: v.day, vid: v.vid, rwId: v.rwId, wave: v.wave,
        mdefId: v.mdefId, shots: v.shots, hits: v.hits, dmg: v.dmg, ammoLeft: v.ammoLeft });
      events.push({ day: v.day, kind: 'fight', vid: v.vid, rwId: v.rwId,
        wave: v.wave, mdefId: v.mdefId, shots: v.shots, ammoLeft: v.ammoLeft });
    }
  }
  events.sort(function (a, b) { return a.day - b.day; });

  const holderDeathDay = deathDayOf(c, grant.holder);
  const lastStateRow = states[states.length - 1];
  let finalDisposition = 'unknown';
  if (vanished) finalDisposition = 'vanished-from-census';
  else if (lastStateRow) {
    finalDisposition = lastStateRow.loc + ' (holder ' + lastStateRow.holder
      + (lastStateRow.equipped ? ', equipped' : '')
      + (lastStateRow.cells != null ? ', cells ' + lastStateRow.cells : '')
      + ')';
    if (lastStateRow.holder !== SCHOLAR) {
      const f = ((rows[rows.length - 1] || {}).personFlags || {})[lastStateRow.holder];
      if (f && f.dead) finalDisposition += ' [holder dead at end]';
    }
  }
  const t = {
    grantDay: grantDay, holder: grant.holder,
    equippedDays: equippedDays, equippedDaysWithCells: equippedDaysWithCells,
    equippedDaysCellsNA: equippedDaysCellsNA,
    carriedDays: carriedDays, stashedDays: stashedDays, corpseDays: corpseDays,
    unseenDays: unseenDays, vanishedDays: vanishedDays, lastSeenDay: lastSeenDay,
    fightsEntered: fightsEntered, fightsEntered4plus: fightsEntered4plus,
    gunFights: gunFights, gunFights4plus: gunFights4plus,
    attempts: attempts, fightRows: fightRows,
    cellsAtEnd: cellsAtEnd, holderDeathDay: holderDeathDay,
    transfers: transfers, vanished: vanished,
    finalDisposition: finalDisposition,
    lifeRows: { states: states, events: events },
  };
  t.mechanism = classifyMechanism(t);
  // Row completeness: states tile grantDay..lastCensusDay contiguously.
  t.rowsComplete = states.length > 0 && states[0].from === grantDay
    && states[states.length - 1].to === lastCensusDay
    && states.every(function (s, i) { return i === 0 || s.from === states[i - 1].to + 1; });
  return t;
}

function traceLeg(corpora) {
  const per = corpora.map(traceSeed);
  const grants = [];
  for (const s of per) for (const g of s.grants) grants.push(g);
  const mechanismCounts = {};
  for (const g of grants) mechanismCounts[g.mechanism] = (mechanismCounts[g.mechanism] || 0) + 1;
  const wall = killloot.analyzeLeg(corpora);
  const traced = grants.filter(function (g) { return g.mechanism && g.rowsComplete; }).length;
  const bars = {};
  bars.instrument = { pass: per.every(function (s) { return s.instrumentErrors === 0; }),
    detail: 'errors=' + per.reduce(function (a, s) { return a + s.instrumentErrors; }, 0) };
  bars.coverage = { pass: per.every(function (s) { return !s.grantEventMismatch; }),
    detail: 'grant-event mismatches=' + per.filter(function (s) { return s.grantEventMismatch; }).length };
  const verdict = grants.length === 0 ? 'INCONCLUSIVE'
    : (traced >= Math.ceil(grants.length * 0.8) ? 'GO' : 'NO-GO');
  return {
    arm: 'gunlife-a', seeds: per.map(function (s) { return s.seed; }),
    perSeed: per, grants: grants,
    grantTotal: grants.length, traced: traced,
    mechanismCounts: mechanismCounts,
    searVolleys: per.reduce(function (a, s) { return a + s.searVolleys; }, 0),
    killLootSear: per.reduce(function (a, s) { return a + s.klSearArrivals; }, 0),
    totalArrivals: per.reduce(function (a, s) { return a + s.totalArrivals; }, 0),
    wall: { wins: wall.wins, national: wall.national, table: null,
      wave5: wall.wave5, wave4: wall.wave4, medianSurvival: wall.medianSurvival,
      villageLost: wall.villageLost, deaths: wall.deaths, starvDeaths: wall.starvDeaths },
    bars: bars, verdict: verdict,
  };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond) { if (cond) pass++; else { fail++; console.log('SELFTEST FAIL: ' + name); } }
  // Fixture 1: scholar-equipped gun IS seen; dead-holder equipped row
  // is SKIPPED (ghost); corpse row is the real location.
  const c1 = {
    seed: 1, mode: 'ctl', gameDays: 10, endReason: 'survived', won: false,
    villageLost: false, maxWave: 4, standing: 200, scaleRank: 'village',
    contestEvents: [], grantEvents: [{ itemId: 'searcaster', caller: 'contest-prize' }],
    killLootEvents: [],
    prizeEvents: [{ seq: 1, day: 3, who: 'player', contestId: 'gauntlet', risk: 'extreme',
      variant: null, wave: 4, predictedFighter: 'bob', granted: true,
      gains: [{ holder: SCHOLAR, gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }],
    volleyEvents: [],
    corpseTakeEvents: [],
    v4gunLoc: [
      { day: 3, locations: [{ loc: 'scholar-pack', vid: SCHOLAR, count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
      { day: 4, locations: [{ loc: 'scholar-equipped', vid: SCHOLAR, slot: 'ranged', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
      { day: 5, locations: [{ loc: 'scholar-equipped', vid: SCHOLAR, slot: 'ranged', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    ],
    deaths: [], instrumentErrors: [],
  };
  const t1 = traceSeed(c1);
  check('scholar grant traced', t1.grants.length === 1);
  check('scholar-equipped days seen (2)', t1.grants[0].equippedDays === 2);
  check('scholar cells n/a, not invented', t1.grants[0].equippedDaysCellsNA === 2 && t1.grants[0].equippedDaysWithCells === 0);
  check('scholar rows complete', t1.grants[0].rowsComplete === true);
  check('scholar mechanism equipped-never-led', t1.grants[0].mechanism === 'equipped-never-led-wave4+');
  // Fixture 2: dead holder's equipped row is a ghost; gun is on corpse.
  const c2 = JSON.parse(JSON.stringify(c1));
  c2.prizeEvents = [{ seq: 1, day: 3, who: 'player', contestId: 'gauntlet', risk: 'extreme',
    variant: null, wave: 4, predictedFighter: 'bob', granted: true,
    gains: [{ holder: 'bob', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }];
  c2.v4gunLoc = [
    { day: 3, locations: [{ loc: 'carried', vid: 'bob', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 4, locations: [{ loc: 'equipped', vid: 'bob', count: 1, cells: 2 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 5, locations: [{ loc: 'equipped', vid: 'bob', count: 1, cells: 2 }, { loc: 'corpse', cid: 'corpse_5_x', cvid: 'bob', kind: 'villager', buried: false, count: 1 }], total: 1, personFlags: { bob: { dead: true, onRoster: false } } },
    { day: 6, locations: [{ loc: 'corpse', cid: 'corpse_5_x', cvid: 'bob', kind: 'villager', buried: false, count: 1 }], total: 1, personFlags: { bob: { dead: true, onRoster: false } } },
  ];
  c2.gameDays = 6;
  const t2 = traceSeed(c2);
  check('dead-holder ghost skipped (equipped 1, not 2)', t2.grants[0].equippedDays === 1);
  check('corpse days counted (2)', t2.grants[0].corpseDays === 2);
  check('holder death day seen (5)', t2.grants[0].holderDeathDay === 5);
  check('ghost grant mechanism equipped-never-led', t2.grants[0].mechanism === 'equipped-never-led-wave4+');
  check('ghost rows complete', t2.grants[0].rowsComplete === true);
  // Fixture 3: dry gun at wave 4+ classifies led-with-gun-dry.
  const c3 = JSON.parse(JSON.stringify(c2));
  c3.v4gunLoc = [
    { day: 3, locations: [{ loc: 'carried', vid: 'bob', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 4, locations: [{ loc: 'equipped', vid: 'bob', count: 1, cells: 0 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 5, locations: [{ loc: 'equipped', vid: 'bob', count: 1, cells: 0 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
  ];
  c3.gameDays = 5;
  c3.volleyEvents = [{ day: 5, vid: 'bob', rwId: 'searcaster', wave: 4, mdefId: 'herald', shots: 0, hits: 0, dmg: 0, ammoLeft: 0 }];
  const t3 = traceSeed(c3);
  check('dry gun fight counted', t3.grants[0].gunFights4plus === 1 && t3.grants[0].attempts.dry === 1);
  check('dry mechanism', t3.grants[0].mechanism === 'led-with-gun-dry');
  // Fixture 4: CELLGATE-held below wave 4.
  const c4 = JSON.parse(JSON.stringify(c3));
  c4.volleyEvents = [{ day: 5, vid: 'bob', rwId: 'searcaster', wave: 3, mdefId: 'hushwolf', shots: 0, hits: 0, dmg: 0, ammoLeft: 2 }];
  const t4 = traceSeed(c4);
  check('held attempt counted', t4.grants[0].attempts.held === 1);
  check('held-only mechanism is equipped-never-led (no w4+ fight)', t4.grants[0].mechanism === 'equipped-never-led-wave4+');
  // Fixture 5: fired gun.
  const c5 = JSON.parse(JSON.stringify(c3));
  c5.volleyEvents = [{ day: 5, vid: 'bob', rwId: 'searcaster', wave: 4, mdefId: 'herald', shots: 2, hits: 1, dmg: 9, ammoLeft: 0 }];
  const t5 = traceSeed(c5);
  check('fired mechanism', t5.grants[0].mechanism === 'fired');
  // Fixture 6: unattributed transfer holder -> scholar.
  const c6 = JSON.parse(JSON.stringify(c2));
  c6.v4gunLoc = [
    { day: 3, locations: [{ loc: 'carried', vid: 'bob', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 4, locations: [{ loc: 'equipped', vid: 'bob', count: 1, cells: 2 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 5, locations: [{ loc: 'scholar-equipped', vid: SCHOLAR, slot: 'ranged', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 6, locations: [{ loc: 'scholar-equipped', vid: SCHOLAR, slot: 'ranged', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
  ];
  c6.gameDays = 6;
  const t6 = traceSeed(c6);
  check('transfer recorded unattributed', t6.grants[0].transfers.length === 1 && t6.grants[0].transfers[0].kind === 'unattributed-transfer');
  check('transfer destination scholar', t6.grants[0].transfers[0].to === SCHOLAR);
  // Equipped days are 3, not 4: bob equipped day 4 only, scholar
  // equipped days 5–6; day 3 is carried, not equipped. (The original
  // expectation of 4 miscounted; the trace tiles 3..6 correctly.)
  check('life continues under scholar (equipped 3)', t6.grants[0].equippedDays === 3);
  // Fixture 7: vanish — total drops, no event.
  const c7 = JSON.parse(JSON.stringify(c2));
  c7.v4gunLoc = [
    { day: 3, locations: [{ loc: 'carried', vid: 'bob', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 4, locations: [{ loc: 'equipped', vid: 'bob', count: 1, cells: 2 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 5, locations: [], total: 0, personFlags: { bob: { dead: false, onRoster: true } } },
  ];
  c7.gameDays = 5;
  const t7 = traceSeed(c7);
  check('vanish flagged', t7.grants[0].vanished === true);
  check('vanish mechanism', t7.grants[0].mechanism === 'unexplained-vanish');
  // sim-vanishtile-a: a vanish must CLOSE the tiling — the terminal
  // `vanished` range tiles the vanish day to the last census day, so the
  // grant counts as traced. (The old selftest never asserted this, which
  // is how the gap passed frozen.)
  check('vanish rows complete', t7.grants[0].rowsComplete === true);
  check('vanish terminal range is day 5, loc vanished',
    t7.grants[0].lifeRows.states.length === 3
    && t7.grants[0].lifeRows.states[2].from === 5 && t7.grants[0].lifeRows.states[2].to === 5
    && t7.grants[0].lifeRows.states[2].loc === 'vanished');
  check('vanish days counted (1)', t7.grants[0].vanishedDays === 1);
  // Fixture 8: prevHolderState clobber (regression). A two-gun stock
  // transfers one gun to a holder who already holds one: on the
  // transfer day the new holder's count (2) differs from the old
  // holder's remaining count (1). The next day the new holder's stock
  // falls 2 -> 1 (gun to the village stash) with the world total
  // conserved — the second transfer must still be detected. With the
  // clobber (prevHolderState kept the old holder's count 1), the
  // 2 -> 1 fall reads as 1 -> 1 and the transfer is silently missed.
  const c8 = JSON.parse(JSON.stringify(c2));
  c8.v4gunLoc = [
    { day: 3, locations: [{ loc: 'carried', vid: 'bob', count: 2 }, { loc: 'carried', vid: 'alice', count: 1 }], total: 3, personFlags: { bob: { dead: false, onRoster: true }, alice: { dead: false, onRoster: true } } },
    { day: 4, locations: [{ loc: 'carried', vid: 'bob', count: 2 }, { loc: 'carried', vid: 'alice', count: 1 }], total: 3, personFlags: { bob: { dead: false, onRoster: true }, alice: { dead: false, onRoster: true } } },
    { day: 5, locations: [{ loc: 'carried', vid: 'bob', count: 1 }, { loc: 'carried', vid: 'alice', count: 2 }], total: 3, personFlags: { bob: { dead: false, onRoster: true }, alice: { dead: false, onRoster: true } } },
    { day: 6, locations: [{ loc: 'stash', count: 1 }, { loc: 'carried', vid: 'bob', count: 1 }, { loc: 'carried', vid: 'alice', count: 1 }], total: 3, personFlags: { bob: { dead: false, onRoster: true }, alice: { dead: false, onRoster: true } } },
  ];
  c8.gameDays = 6;
  const t8 = traceSeed(c8);
  check('clobber regression: both transfers recorded', t8.grants[0].transfers.length === 2);
  check('clobber regression: first transfer bob->alice day 5', t8.grants[0].transfers.length >= 1 && t8.grants[0].transfers[0].day === 5 && t8.grants[0].transfers[0].from === 'bob' && t8.grants[0].transfers[0].to === 'alice');
  check('clobber regression: second transfer alice->stash day 6', t8.grants[0].transfers.length >= 2 && t8.grants[0].transfers[1].day === 6 && t8.grants[0].transfers[1].from === 'alice' && t8.grants[0].transfers[1].toLoc === 'village-stash');
  check('clobber regression: rows complete', t8.grants[0].rowsComplete === true);
  check('clobber regression: mechanism gun-left-holder', t8.grants[0].mechanism === 'gun-left-holder');
  // Fixture 9: mid-run vanish (regression for sim-vanishtile-a). The gun
  // vanishes on day 7 of a 10-day run — the terminal `vanished` range
  // must tile days 7–10, not just close a last-day vanish (fixture 7).
  const c9 = JSON.parse(JSON.stringify(c2));
  c9.v4gunLoc = [
    { day: 3, locations: [{ loc: 'carried', vid: 'bob', count: 1 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 4, locations: [{ loc: 'equipped', vid: 'bob', count: 1, cells: 2 }], total: 1, personFlags: { bob: { dead: false, onRoster: true } } },
    { day: 5, locations: [{ loc: 'equipped', vid: 'bob', count: 1, cells: 2 }, { loc: 'corpse', cid: 'corpse_5_x', cvid: 'bob', kind: 'villager', buried: false, count: 1 }], total: 1, personFlags: { bob: { dead: true, onRoster: false } } },
    { day: 6, locations: [{ loc: 'corpse', cid: 'corpse_5_x', cvid: 'bob', kind: 'villager', buried: false, count: 1 }], total: 1, personFlags: { bob: { dead: true, onRoster: false } } },
    { day: 7, locations: [], total: 0, personFlags: { bob: { dead: true, onRoster: false } } },
    { day: 8, locations: [], total: 0, personFlags: { bob: { dead: true, onRoster: false } } },
    { day: 9, locations: [], total: 0, personFlags: { bob: { dead: true, onRoster: false } } },
    { day: 10, locations: [], total: 0, personFlags: { bob: { dead: true, onRoster: false } } },
  ];
  c9.gameDays = 10;
  const t9 = traceSeed(c9);
  check('mid-run vanish flagged', t9.grants[0].vanished === true);
  check('mid-run vanish mechanism', t9.grants[0].mechanism === 'unexplained-vanish');
  check('mid-run vanish rows complete', t9.grants[0].rowsComplete === true);
  check('mid-run vanish terminal range tiles 7..10',
    t9.grants[0].lifeRows.states.length === 4
    && t9.grants[0].lifeRows.states[3].from === 7 && t9.grants[0].lifeRows.states[3].to === 10
    && t9.grants[0].lifeRows.states[3].loc === 'vanished');
  check('mid-run vanish days counted (4)', t9.grants[0].vanishedDays === 4);
  check('mid-run vanish corpse days counted (2)', t9.grants[0].corpseDays === 2);
  check('mid-run vanish equipped days counted (1)', t9.grants[0].equippedDays === 1);
  check('mid-run vanish final disposition', t9.grants[0].finalDisposition === 'vanished-from-census');
  console.log('SELFTEST: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  const di = args.indexOf('--dir');
  const dir = di !== -1 ? args[di + 1] : null;
  if (!dir) { console.error('usage: --selftest | --dir <dir> --out <file>'); process.exit(2); }
  const leg = traceLeg(loadDir(dir));
  const oi = args.indexOf('--out');
  if (oi !== -1 && args[oi + 1]) fs.writeFileSync(args[oi + 1], JSON.stringify(leg, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: leg.verdict, grants: leg.grantTotal, traced: leg.traced,
    mechanismCounts: leg.mechanismCounts, searVolleys: leg.searVolleys,
    killLootSear: leg.killLootSear, totalArrivals: leg.totalArrivals,
    wall: leg.wall, bars: leg.bars }, null, 2));
  process.exit(leg.verdict === 'GO' || leg.verdict === 'INCONCLUSIVE' ? 0 : 1);
}

module.exports = { traceSeed: traceSeed, traceLeg: traceLeg, traceGunLife: traceGunLife,
  classifyMechanism: classifyMechanism, holderStateOnDay: holderStateOnDay, selftest: selftest };
