// analyze-guntransfer-b.js — transfer classifier, arm sim-guntransfer-b
// Rebuilds per-day gun holdings from the transfer-driver corpus, detects
// every living-holder gun transfer, and classifies each against the wrap
// events (succession / gear-gift / gear-day-diff / lend / lend-return).
// Acquisitions (grant / kill-loot / prize / rearm / corpse-take) are NOT
// transfers and must never classify as one (prereg bar 4). Reuses the
// gunholder census analyzer for the holder-day reproduction (bar 2).
// AMENDMENT A1 (prereg §3, detector correction): a gun LEAVING the counted
// universe with no living gainer is a custody EXIT, not a transfer —
// 'destroyed' when the loser is alive with no gainer and no corpse gun
// (mechanism proven by probe: a worn-only gun is dropped when autoEquip
// re-seats the slot — evidence §7), 'death-pack' when the gun sits on the
// loser's corpse, 'unexplained-exit' when liveness cannot be established.
// Exits are reported separately and never counted as transfers; the bar-3
// rule becomes 0 unclassified transfers AND 0 unexplained exits.
//   node scripts/analyze-guntransfer-b.js --selftest
//   node scripts/analyze-guntransfer-b.js --dir <corpus-dir> [--out <file>]
//   node scripts/analyze-guntransfer-b.js --fixture <file>
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const census = require(path.join(REPO, 'scripts', 'analyze-gunholder-census-b'));

function holdingsOfRow(row) {
  // personKey -> { guns, equipped, cells }. The scholar-equipped /
  // scholar-pack rows belong to the PERSON who is the scholar that day
  // (row.scholarVid); a villager row for that same vid is the same
  // person under the old label, never a second gun.
  const h = {};
  const scholarVid = row.scholarVid || null;
  function add(key, guns, cells, equipped) {
    if (!key) return;
    const e = h[key] || (h[key] = { guns: 0, equipped: false, cells: 0 });
    e.guns += guns;
    if (equipped) e.equipped = true;
    if (cells != null) e.cells = Math.max(e.cells, cells);
  }
  for (const l of (row.locations || [])) {
    if (l.loc === 'equipped' && l.vid) {
      if (scholarVid && l.vid === scholarVid) continue; // scholar row is authoritative
      add(l.vid, l.count || 1, l.cells || 0, true);
    } else if (l.loc === 'carried' && l.vid) {
      if (scholarVid && l.vid === scholarVid) continue;
      add(l.vid, l.count || 0, 0, false);
    } else if (l.loc === 'stashed' && l.vid) {
      if (scholarVid && l.vid === scholarVid) continue;
      add(l.vid, l.count || 0, 0, false);
    } else if (l.loc === 'scholar-equipped') {
      add(scholarVid || '__scholar__', 1, 0, true);
    } else if (l.loc === 'scholar-pack') {
      add(scholarVid || '__scholar__', l.count || 0, 0, false);
    }
    // corpse / stash rows are not living holdings.
  }
  return h;
}

function eventsInWindow(c, arrName, d0, d1) {
  return ((c[arrName] || []).filter(function (e) { return e.day != null && e.day >= d0 && e.day <= d1; }));
}

function detectTransfers(c) {
  const rows = (c.v4gunLoc || []).slice().sort(function (a, b) { return a.day - b.day; });
  const moves = []; // detected holdings changes needing classification
  const notes = [];
  const exits = []; // custody exits (gun leaves the living, no gainer) — NOT transfers (A1)
  // Acquisition gains to remove from the transfer pool (gun appears with
  // no loser): grant / kill-loot / prize / rearm / corpse-take.
  // Scholar gains are keyed by the LATER row's scholarVid (the scholar
  // is a person too — a prize that stays with the player is an
  // acquisition, not a transfer).
  function acquisitionGains(d0, d1, scholarVid) {
    const gains = {}; // vid -> guns gained
    function gainVid(v) { return (v === '__scholar__' ? (scholarVid || '__scholar__') : v); }
    eventsInWindow(c, 'grantEvents', d0, d1).forEach(function (e) {
      if (e.itemId === 'searcaster' && e.toKind === 'villager' && e.toVid) gains[e.toVid] = (gains[e.toVid] || 0) + 1;
      if (e.itemId === 'searcaster' && e.toKind === 'scholar') {
        const k = gainVid('__scholar__'); gains[k] = (gains[k] || 0) + 1;
      }
    });
    eventsInWindow(c, 'killLootEvents', d0, d1).forEach(function (e) {
      if (e.dropId === 'searcaster') {
        (e.gains || []).forEach(function (g) {
          if (g.holder && (g.gunsGained || 0) > 0) {
            const k = gainVid(g.holder); gains[k] = (gains[k] || 0) + g.gunsGained;
          }
        });
      }
    });
    eventsInWindow(c, 'prizeEvents', d0, d1).forEach(function (e) {
      (e.gains || []).forEach(function (g) {
        if (g.holder && (g.gunsGained || 0) > 0) {
          const k = gainVid(g.holder); gains[k] = (gains[k] || 0) + g.gunsGained;
        }
      });
    });
    eventsInWindow(c, 'rearmTakeEvents', d0, d1).forEach(function (e) {
      if (e.gun && e.taker) gains[e.taker] = (gains[e.taker] || 0) + 1;
    });
    eventsInWindow(c, 'corpseTakeEvents', d0, d1).forEach(function (e) {
      if (e.itemId === 'searcaster' && e.toKind === 'scholar') {
        const k = gainVid('__scholar__'); gains[k] = (gains[k] || 0) + 1;
      }
    });
    return gains;
  }
  for (let i = 1; i < rows.length; i++) {
    const r0 = rows[i - 1], r1 = rows[i];
    const d0 = r0.day, d1 = r1.day;
    const h0 = holdingsOfRow(r0), h1 = holdingsOfRow(r1);
    const keys = {};
    Object.keys(h0).forEach(function (k) { keys[k] = true; });
    Object.keys(h1).forEach(function (k) { keys[k] = true; });
    const gains = acquisitionGains(d0, d1, r1.scholarVid || null);
    const losers = [], gainers = [];
    Object.keys(keys).sort().forEach(function (k) {
      const g0 = (h0[k] || { guns: 0 }).guns, g1 = (h1[k] || { guns: 0 }).guns;
      let d = g1 - g0;
      if (d > 0 && (gains[k] || 0) > 0) {
        const explained = Math.min(d, gains[k]);
        d -= explained;
        gains[k] -= explained;
      }
      if (d < 0) losers.push({ vid: k, guns: -d });
      else if (d > 0) gainers.push({ vid: k, guns: d });
    });
    // Death-pack: a person who died in the window and lost guns to a
    // corpse is not a transfer — the gun went on the corpse, not to a
    // living person. Remove losers who died in the window.
    const diedInWindow = {};
    (c.deaths || []).forEach(function (d) {
      if (d.day != null && d.day >= d0 && d.day <= d1 && d.who) diedInWindow[d.who] = true;
    });
    for (let li = losers.length - 1; li >= 0; li--) {
      if (diedInWindow[losers[li].vid]) {
        notes.push({ seed: c.seed, day: d1, kind: 'death-pack', vid: losers[li].vid, guns: losers[li].guns });
        losers.splice(li, 1);
      }
    }
    // Pair losers to gainers (equal magnitude; a 1-gun move is the norm).
    while (losers.length && gainers.length) {
      const lo = losers[0], ga = gainers[0];
      const n = Math.min(lo.guns, ga.guns);
      moves.push({ seed: c.seed, day: d1, fromDay: d0, loser: lo.vid, gainer: ga.vid, guns: n, kind: 'person-to-person' });
      lo.guns -= n; ga.guns -= n;
      if (!lo.guns) losers.shift();
      if (!ga.guns) gainers.shift();
    }
    losers.forEach(function (lo) {
      // AMENDMENT A1: a leftover loser is a custody EXIT, not a transfer —
      // no living gainer took the gun. Name it by what the corpus shows.
      const corpseGun = (r1.locations || []).some(function (l) { return l.loc === 'corpse' && l.cvid === lo.vid && (l.count || 0) > 0; });
      if (corpseGun) {
        notes.push({ seed: c.seed, day: d1, kind: 'death-pack', vid: lo.vid, guns: lo.guns });
        return;
      }
      const flag = (r1.personFlags || {})[lo.vid];
      const alive = flag ? !flag.dead : null;
      if (alive === true) {
        exits.push({ seed: c.seed, day: d1, fromDay: d0, loser: lo.vid, guns: lo.guns, kind: 'destroyed',
          detail: 'loser alive, no living gainer, no corpse gun — gun left the counted universe (worn-only autoEquip re-seat, evidence §7)' });
      } else {
        exits.push({ seed: c.seed, day: d1, fromDay: d0, loser: lo.vid, guns: lo.guns, kind: 'unexplained-exit',
          detail: 'loser liveness unknown on the later row (not in personFlags) — cannot name the exit' });
      }
    });
    gainers.forEach(function (ga) {
      moves.push({ seed: c.seed, day: d1, fromDay: d0, loser: null, gainer: ga.vid, guns: ga.guns, kind: 'appeared' });
    });
    // Succession: the scholar identity changed and the new scholar is a
    // gun-holder. The holdings map does not move (the gun stays with the
    // person); the LABEL changes. Record it as its own move.
    const s0 = r0.scholarVid || null, s1 = r1.scholarVid || null;
    if (s0 && s1 && s0 !== s1) {
      const newHolderGuns = (h1[s1] || { guns: 0 }).guns;
      if (newHolderGuns > 0) {
        moves.push({ seed: c.seed, day: d1, fromDay: d0, loser: s1, gainer: '__scholar__', guns: newHolderGuns, kind: 'succession', newScholar: s1, oldScholar: s0 });
      } else {
        notes.push({ seed: c.seed, day: d1, kind: 'succession-no-gun', oldScholar: s0, newScholar: s1 });
      }
    }
  }
  return { moves: moves, notes: notes, exits: exits };
}

function classifyMove(c, m) {
  const d0 = m.fromDay, d1 = m.day;
  function inWin(arr) { return eventsInWindow(c, arr, d0, d1); }
  if (m.kind === 'succession') {
    const ev = inWin('successionEvents').filter(function (e) { return e.newId === m.newScholar; });
    if (ev.length) return { cls: 'succession', ev: ev[0], detail: 'playerDeath ' + ev[0].oldId + ' -> ' + ev[0].newId + ' (cause ' + (ev[0].cause || '?') + ')' };
    return { cls: 'unclassified', ev: null, detail: 'scholar identity changed to a gun-holder with no playerDeath record in window' };
  }
  if (m.kind === 'person-to-person' && m.loser && m.gainer) {
    const gifts = inWin('gearGiftEvents').filter(function (e) { return e.item === 'searcaster' && e.from === m.loser && e.vid === m.gainer; });
    if (gifts.length) return { cls: 'gear-gift', ev: gifts[0], detail: 'tele villager_gear searcaster ' + gifts[0].from + ' -> ' + gifts[0].vid };
    const diffs = inWin('gearDayDiffs').filter(function (e) {
      return (e.diff || []).some(function (g) { return g.holder === m.gainer && (g.gunsGained || 0) > 0; })
        && (e.diff || []).some(function (g) { return g.holder === m.loser && (g.gunsGained || 0) < 0; });
    });
    if (diffs.length) return { cls: 'gear-day-diff', ev: diffs[0], detail: 'villagerGearDay diff moves a gun ' + m.loser + ' -> ' + m.gainer + ' (no tele record)' };
    const lends = inWin('lendEvents').filter(function (e) { return e.fired && e.lender === m.loser && e.borrower === m.gainer; });
    if (lends.length) return { cls: 'lend', ev: lends[0], detail: '_lendSearcaster ' + lends[0].lender + ' -> ' + lends[0].borrower };
    const rets = inWin('lendReturnEvents').filter(function (e) { return e.gunReturned && e.lender === m.gainer && e.borrower === m.loser; });
    if (rets.length) return { cls: 'lend-return', ev: rets[0], detail: '_returnLentSearcaster ' + rets[0].borrower + ' -> ' + rets[0].lender };
    return { cls: 'unclassified', ev: null, detail: 'no wrap event matches ' + m.loser + ' -> ' + m.gainer };
  }
  return { cls: 'unclassified', ev: null, detail: 'move kind ' + m.kind + ' (loser ' + (m.loser || '-') + ', gainer ' + (m.gainer || '-') + ')' };
}

function analyzeSeed(c) {
  const det = detectTransfers(c);
  const transfers = det.moves.map(function (m) {
    const cl = classifyMove(c, m);
    return { seed: c.seed, day: m.day, fromDay: m.fromDay, loser: m.loser, gainer: m.gainer,
      guns: m.guns, kind: m.kind, cls: cl.cls, detail: cl.detail,
      newScholar: m.newScholar || null, oldScholar: m.oldScholar || null };
  });
  const unclassified = transfers.filter(function (t) { return t.cls === 'unclassified'; });
  const lendFired = (c.lendEvents || []).filter(function (e) { return e.fired; }).length;
  const lendReturns = (c.lendReturnEvents || []).length;
  const misclassified = transfers.filter(function (t) {
    return t.cls === 'rearm' || t.cls === 'grant' || t.cls === 'kill-loot' || t.cls === 'corpse-take';
  });
  // Census reproduction (bar 2) via the census analyzer.
  const cen = census.analyzeSeed(c);
  return {
    seed: c.seed, mode: c.mode, anchorCommit: c.anchorCommit, gameSha: c.gameSha,
    policySha: c.policySha, rearmOn: !!c.rearmOn, rearmPresent: !!c.rearmPresent,
    instrumentErrors: (c.instrumentErrors || []).length,
    days: c.days, gameDays: c.gameDays, endReason: c.endReason, won: !!c.won,
    villageLost: !!c.villageLost, scaleRank: c.scaleRank,
    maxWave: c.maxWave, unlockedWave: c.unlockedWave, standing: c.standing,
    transfers: transfers, unclassified: unclassified.length,
    misclassified: misclassified.length, notes: det.notes,
    exits: det.exits,
    unexplainedExits: det.exits.filter(function (e) { return e.kind === 'unexplained-exit'; }).length,
    destroyedExits: det.exits.filter(function (e) { return e.kind === 'destroyed'; }).length,
    successionEvents: (c.successionEvents || []).length,
    gearGiftEvents: (c.gearGiftEvents || []).length,
    gearGiftSear: (c.gearGiftEvents || []).filter(function (e) { return e.item === 'searcaster'; }).length,
    lendCalls: (c.lendEvents || []).length, lendFired: lendFired, lendReturns: lendReturns,
    gearDayDiffs: (c.gearDayDiffs || []).length,
    censusHolderDays: cen.totalHolderDays, censusClassCounts: cen.classCounts,
    censusUnclassified: cen.unclassified, censusHolders: cen.holders,
    klArrivals: cen.klArrivals, klBundled: cen.klBundled, klDry: cen.klDry,
    w5FacedCount: cen.w5FacedCount, deaths: cen.deaths,
  };
}

function analyzeLeg(seeds) {
  const leg = { seeds: seeds.length, files: seeds.length,
    transfers: [], unclassified: 0, misclassified: 0, notes: [],
    exits: [], unexplainedExits: 0, destroyedExits: 0,
    successionEvents: 0, gearGiftEvents: 0, gearGiftSear: 0,
    lendCalls: 0, lendFired: 0, lendReturns: 0, gearDayDiffs: 0,
    censusHolderDays: 0, censusUnclassified: 0, censusHolders: 0,
    klArrivals: 0, klBundled: 0, klDry: 0,
    wins: 0, national: 0, wave5Unlocks: 0, wave5FacedSeeds: 0,
    medianSurvival: null, instrumentErrors: 0, anchors: {}, policyShaMismatches: 0,
    rearmOff: 0, rearmPresentOff: 0, perSeed: [] };
  let policySha = 'unknown';
  try {
    policySha = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12);
  } catch (e) {}
  leg.policySha = policySha;
  const survivals = [];
  seeds.forEach(function (s) {
    const a = analyzeSeed(s);
    leg.perSeed.push(a);
    leg.transfers.push.apply(leg.transfers, a.transfers);
    leg.unclassified += a.unclassified;
    leg.misclassified += a.misclassified;
    leg.notes.push.apply(leg.notes, a.notes);
    leg.exits.push.apply(leg.exits, a.exits || []);
    leg.unexplainedExits += a.unexplainedExits || 0;
    leg.destroyedExits += a.destroyedExits || 0;
    leg.successionEvents += a.successionEvents;
    leg.gearGiftEvents += a.gearGiftEvents;
    leg.gearGiftSear += a.gearGiftSear;
    leg.lendCalls += a.lendCalls;
    leg.lendFired += a.lendFired;
    leg.lendReturns += a.lendReturns;
    leg.gearDayDiffs += a.gearDayDiffs;
    leg.censusHolderDays += a.censusHolderDays;
    leg.censusUnclassified += a.censusUnclassified;
    leg.censusHolders += a.censusHolders;
    leg.klArrivals += a.klArrivals;
    leg.klBundled += a.klBundled;
    leg.klDry += a.klDry;
    leg.instrumentErrors += a.instrumentErrors;
    if (a.won) leg.wins++;
    if (a.scaleRank === 'national' || a.scaleRank === 'global') leg.national++;
    if ((a.unlockedWave || 0) >= 5) leg.wave5Unlocks++;
    if (a.w5FacedCount > 0) leg.wave5FacedSeeds++;
    if (a.gameDays != null) survivals.push(a.gameDays);
    if (a.anchorCommit) leg.anchors[a.anchorCommit] = (leg.anchors[a.anchorCommit] || 0) + 1;
    if (a.policySha !== policySha) leg.policyShaMismatches++;
    if (!a.rearmOn) leg.rearmOff++;
    if (!a.rearmPresent) leg.rearmPresentOff++;
  });
  survivals.sort(function (a, b) { return a - b; });
  leg.medianSurvival = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
  if (survivals.length && survivals.length % 2 === 0) {
    leg.medianSurvival = (survivals[survivals.length / 2 - 1] + survivals[survivals.length / 2]) / 2;
  }
  return leg;
}

function judgeLeg(leg) {
  const bars = {};
  bars.instrument = { pass:
    leg.instrumentErrors === 0 &&
    Object.keys(leg.anchors).length === 1 &&
    leg.policyShaMismatches === 0 &&
    leg.rearmOff === 0 && leg.rearmPresentOff === 0 &&
    leg.klArrivals === leg.seeds && leg.klBundled === leg.klArrivals && leg.klDry === 0,
    detail: 'errors=' + leg.instrumentErrors + ' anchors=' + Object.keys(leg.anchors).length +
      ' policyMismatches=' + leg.policyShaMismatches + ' rearmOff=' + leg.rearmOff +
      ' rearmPresentOff=' + leg.rearmPresentOff + ' klArrivals=' + leg.klArrivals +
      '/' + leg.seeds + ' klBundled=' + leg.klBundled + ' klDry=' + leg.klDry };
  bars.reproduction = { pass: leg.censusHolderDays === 989 && leg.censusUnclassified === 0,
    detail: 'holderDays=' + leg.censusHolderDays + ' (census: 989) censusUnclassified=' + leg.censusUnclassified };
  bars.classification = { pass: leg.unclassified === 0 && (leg.unexplainedExits || 0) === 0,
    detail: 'transfers=' + leg.transfers.length + ' unclassified=' + leg.unclassified +
      ' exits=' + (leg.exits || []).length + ' destroyed=' + (leg.destroyedExits || 0) +
      ' unexplainedExits=' + (leg.unexplainedExits || 0) };
  bars.noMisclass = { pass: leg.misclassified === 0 && leg.lendFired === 0,
    detail: 'misclassified=' + leg.misclassified + ' lendFired=' + leg.lendFired + ' lendCalls=' + leg.lendCalls };
  bars.wall = { pass: true,
    detail: 'wins=' + leg.wins + ' national=' + leg.national +
      ' wave5Unlocks=' + leg.wave5Unlocks + ' wave5FacedSeeds=' + leg.wave5FacedSeeds +
      ' medianSurvival=' + leg.medianSurvival + ' (table: not instrumented)' };
  let verdict = 'DIAG-GO';
  if (!bars.instrument.pass || !bars.reproduction.pass) verdict = 'INCOMPLETE';
  else if (!bars.classification.pass || !bars.noMisclass.pass) verdict = 'DIAG-NO-GO';
  return { verdict: verdict, bars: bars };
}

// --- selftest: synthetic fixtures ---
function fixtureSeed(overrides) {
  const base = { seed: 999001, mode: 'arm', anchorCommit: 'test', gameSha: 'test',
    policySha: 'test', rearmOn: true, rearmPresent: true, instrumentErrors: [],
    days: 10, gameDays: 10, endReason: 'survived', won: false, villageLost: false,
    scaleRank: 'village', maxWave: 1, unlockedWave: 1, standing: 50,
    v4gunLoc: [], deaths: [], successionEvents: [], gearGiftEvents: [],
    lendEvents: [], lendReturnEvents: [], gearDayDiffs: [],
    grantEvents: [], killLootEvents: [], prizeEvents: [], rearmTakeEvents: [],
    corpseTakeEvents: [], fightEvents: [], encounterEvents: [], volleyEvents: [] };
  return Object.assign(base, overrides || {});
}
function row(day, scholarVid, locations) {
  return { day: day, scholarVid: scholarVid || null, locations: locations, total: locations.length, personFlags: {}, packCells: {} };
}
function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond, extra) {
    if (cond) { pass++; }
    else { fail++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  // F1: succession — scholar dies, gun-holder becomes the scholar.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(10, 'old_scholar', [{ loc: 'equipped', vid: 'leo', count: 1, cells: 2 }]),
        row(11, 'leo', [{ loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }]),
      ],
      deaths: [{ day: 11, kind: 'villager', who: 'old_scholar', cause: 'the wild', player: true }],
      successionEvents: [{ day: 11, cause: 'the wild', oldId: 'old_scholar', newId: 'leo', changed: true }],
    });
    const a = analyzeSeed(c);
    check('F1 succession detected', a.transfers.length === 1, 'got ' + a.transfers.length);
    check('F1 succession classified', a.transfers.length === 1 && a.transfers[0].cls === 'succession', a.transfers.length ? a.transfers[0].cls : 'none');
    check('F1 succession actors', a.transfers.length === 1 && a.transfers[0].newScholar === 'leo' && a.transfers[0].day === 11, JSON.stringify(a.transfers[0] || {}));
    check('F1 no unclassified', a.unclassified === 0, 'unclassified=' + a.unclassified);
  })();
  // F2: gear-gift — spare gun moves giver -> taker, tele recorded.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(20, 'sch', [{ loc: 'equipped', vid: 'giver', count: 1, cells: 4 }, { loc: 'carried', vid: 'giver', count: 1 }]),
        row(21, 'sch', [{ loc: 'equipped', vid: 'giver', count: 1, cells: 4 }, { loc: 'equipped', vid: 'taker', count: 1, cells: 0 }]),
      ],
      gearGiftEvents: [{ day: 21, vid: 'taker', item: 'searcaster', from: 'giver', via: 'gift' }],
    });
    const a = analyzeSeed(c);
    check('F2 gear-gift detected', a.transfers.length === 1, 'got ' + a.transfers.length);
    check('F2 gear-gift classified', a.transfers.length === 1 && a.transfers[0].cls === 'gear-gift', a.transfers.length ? a.transfers[0].cls : 'none');
    check('F2 gear-gift actors', a.transfers.length === 1 && a.transfers[0].loser === 'giver' && a.transfers[0].gainer === 'taker', JSON.stringify(a.transfers[0] || {}));
  })();
  // F3: gear-day-diff — tele missing, diff catches it (own class).
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(30, 'sch', [{ loc: 'equipped', vid: 'giver', count: 1, cells: 4 }, { loc: 'carried', vid: 'giver', count: 1 }]),
        row(31, 'sch', [{ loc: 'equipped', vid: 'giver', count: 1, cells: 4 }, { loc: 'equipped', vid: 'taker', count: 1, cells: 0 }]),
      ],
      gearDayDiffs: [{ day: 31, moved: 1, diff: [{ holder: 'giver', gunsGained: -1, cellsGained: 0, cellsAfter: 4 }, { holder: 'taker', gunsGained: 1, cellsGained: 0, cellsAfter: 0 }] }],
    });
    const a = analyzeSeed(c);
    check('F3 gear-day-diff classified', a.transfers.length === 1 && a.transfers[0].cls === 'gear-day-diff', a.transfers.length ? a.transfers[0].cls : 'none');
  })();
  // F4: lend fired — classified lend, not unclassified.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(40, 'sch', [{ loc: 'equipped', vid: 'lender', count: 1, cells: 2 }]),
        row(41, 'sch', [{ loc: 'equipped', vid: 'borrower', count: 1, cells: 2 }]),
      ],
      lendEvents: [{ day: 41, borrower: 'borrower', mid: 'm1', fired: true, lender: 'lender', kind: 'gun', from: 'tile', cellsMoved: 2 }],
    });
    const a = analyzeSeed(c);
    check('F4 lend classified', a.transfers.length === 1 && a.transfers[0].cls === 'lend', a.transfers.length ? a.transfers[0].cls : 'none');
  })();
  // F5: rearm take from a corpse is NOT a living transfer.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(50, 'sch', [{ loc: 'corpse', cid: 'c1', cvid: 'dead', kind: 'villager', buried: false, count: 1, cells: 2 }]),
        row(51, 'sch', [{ loc: 'equipped', vid: 'taker', count: 1, cells: 2 }]),
      ],
      rearmTakeEvents: [{ day: 51, taker: 'taker', corpseVid: 'dead', corpseId: 'c1', kind: 'second-life', gun: true, cells: 2, channel: 'expedition' }],
    });
    const a = analyzeSeed(c);
    check('F5 rearm is not a transfer', a.transfers.length === 0, 'got ' + a.transfers.length + ' ' + JSON.stringify(a.transfers));
  })();
  // F6: contest-prize grant is NOT a living transfer.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(60, 'sch', []),
        row(61, 'sch', [{ loc: 'equipped', vid: 'winner', count: 1, cells: 2 }]),
      ],
      prizeEvents: [{ seq: 1, day: 61, who: 'player', contestId: 'tithe', granted: true, gains: [{ holder: 'winner', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }],
      grantEvents: [{ day: 61, itemId: 'searcaster', toKind: 'villager', toVid: 'winner', caller: 'contest-prize', frame: null }],
    });
    const a = analyzeSeed(c);
    check('F6 grant is not a transfer', a.transfers.length === 0, 'got ' + a.transfers.length);
  })();
  // F7: scholar corpse-take is NOT a living transfer.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(70, 'sch', [{ loc: 'corpse', cid: 'c2', cvid: 'dead', kind: 'villager', buried: false, count: 1, cells: 2 }]),
        row(71, 'sch', [{ loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }]),
      ],
      corpseTakeEvents: [{ day: 71, itemId: 'searcaster', corpseId: 'c2', corpseVid: 'dead', toKind: 'scholar' }],
    });
    const a = analyzeSeed(c);
    check('F7 corpse-take is not a transfer', a.transfers.length === 0, 'got ' + a.transfers.length + ' ' + JSON.stringify(a.transfers));
  })();
  // F8: no-wrap move stays unclassified (the detector refuses to invent).
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(80, 'sch', [{ loc: 'equipped', vid: 'a', count: 1, cells: 2 }]),
        row(81, 'sch', [{ loc: 'equipped', vid: 'b', count: 1, cells: 2 }]),
      ],
    });
    const a = analyzeSeed(c);
    check('F8 unexplained move unclassified', a.transfers.length === 1 && a.transfers[0].cls === 'unclassified', 'got ' + JSON.stringify(a.transfers));
  })();
  // F9: succession with no gun — no transfer, noted only.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(90, 'old', []),
        row(91, 'new', []),
      ],
      successionEvents: [{ day: 91, cause: 'the wild', oldId: 'old', newId: 'new', changed: true }],
    });
    const a = analyzeSeed(c);
    check('F9 succession-no-gun is not a transfer', a.transfers.length === 0, 'got ' + a.transfers.length);
    check('F9 succession-no-gun noted', a.notes.some(function (n) { return n.kind === 'succession-no-gun'; }), JSON.stringify(a.notes));
  })();
  // F10: death-pack — holder dies, gun goes to their corpse, not a transfer.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(100, 'sch', [{ loc: 'equipped', vid: 'holder', count: 1, cells: 2 }]),
        row(101, 'sch', [{ loc: 'corpse', cid: 'c3', cvid: 'holder', kind: 'villager', buried: false, count: 1, cells: 2 }]),
      ],
      deaths: [{ day: 101, kind: 'villager', who: 'holder', cause: 'the wild', player: false }],
    });
    const a = analyzeSeed(c);
    check('F10 death-pack is not a transfer', a.transfers.length === 0, 'got ' + a.transfers.length + ' ' + JSON.stringify(a.transfers));
    check('F10 death-pack noted', a.notes.some(function (n) { return n.kind === 'death-pack'; }), JSON.stringify(a.notes));
  })();
  // F11: Wanjiru double-row — villager row + scholar row for the same
  // person on the succession day count as ONE gun, one succession.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(123, 'old_sch', [{ loc: 'equipped', vid: 'w', count: 1, cells: 2 }]),
        row(124, 'w', [{ loc: 'equipped', vid: 'w', count: 1, cells: 2 }, { loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }]),
      ],
      deaths: [{ day: 124, kind: 'villager', who: 'old_sch', cause: 'the arena', player: true }],
      successionEvents: [{ day: 124, cause: 'the arena', oldId: 'old_sch', newId: 'w', changed: true }],
    });
    const a = analyzeSeed(c);
    check('F11 double-row is one succession', a.transfers.length === 1 && a.transfers[0].cls === 'succession', 'got ' + JSON.stringify(a.transfers));
  })();
  // F12: leg judge — DIAG-GO shape on a clean leg.
  (function () {
    const c = fixtureSeed({
      v4gunLoc: [
        row(10, 'old_scholar', [{ loc: 'equipped', vid: 'leo', count: 1, cells: 2 }]),
        row(11, 'leo', [{ loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }]),
      ],
      successionEvents: [{ day: 11, cause: 'the wild', oldId: 'old_scholar', newId: 'leo', changed: true }],
    });
    const leg = { seeds: 1, transfers: [], unclassified: 0, misclassified: 0,
      instrumentErrors: 0, anchors: { test: 1 }, policyShaMismatches: 0,
      rearmOff: 0, rearmPresentOff: 0, klArrivals: 1, klBundled: 1, klDry: 0,
      censusHolderDays: 989, censusUnclassified: 0, lendFired: 0, lendCalls: 0,
      wins: 0, national: 0, wave5Unlocks: 0, wave5FacedSeeds: 0, medianSurvival: 11 };
    const j = judgeLeg(leg);
    check('F12 judge DIAG-GO on clean leg', j.verdict === 'DIAG-GO', j.verdict + ' ' + JSON.stringify(j.bars));
  })();
  // F13: destroyed scholar gun (s107756 d44 pattern, AMENDMENT A1) —
  // the scholar holds the gun worn-only, a better ranged weapon arrives,
  // autoEquip re-seats the slot and the gun leaves the counted universe
  // with no gainer and no corpse. 0 transfers, 1 destroyed exit.
  (function () {
    const r0 = row(43, 'gen_stv', [{ loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }]);
    const r1 = row(44, 'gen_stv', []);
    r0.personFlags = { gen_stv: { dead: false, onRoster: true } };
    r1.personFlags = { gen_stv: { dead: false, onRoster: true } };
    const c = fixtureSeed({ v4gunLoc: [r0, r1] });
    const a = analyzeSeed(c);
    check('F13 destroyed gun is not a transfer', a.transfers.length === 0, 'got ' + JSON.stringify(a.transfers));
    check('F13 destroyed exit recorded', a.exits.length === 1 && a.exits[0].kind === 'destroyed' && a.exits[0].loser === 'gen_stv', JSON.stringify(a.exits));
    check('F13 no unexplained exits', a.unexplainedExits === 0, 'unexplainedExits=' + a.unexplainedExits);
    check('F13 no unclassified', a.unclassified === 0, 'unclassified=' + a.unclassified);
  })();
  // F14: ruth double-succession pattern (s107751 d151) — a succession
  // whose new scholar holds NO gun (gun destroyed in the same day's
  // re-seat) is a succession-no-gun note plus a destroyed exit, not a
  // transfer and not unclassified.
  (function () {
    const r0 = row(150, 'adaeze', [{ loc: 'equipped', vid: 'ruth', count: 1, cells: 1 }]);
    const r1 = row(151, 'ruth', [{ loc: 'corpse', cid: 'c9', cvid: 'gen_cc', kind: 'villager', buried: false, count: 1, cells: 0 }]);
    r0.personFlags = { ruth: { dead: false, onRoster: true }, gen_cc: { dead: false, onRoster: true }, adaeze: { dead: false, onRoster: true } };
    r1.personFlags = { ruth: { dead: false, onRoster: true }, gen_cc: { dead: true, onRoster: false }, adaeze: { dead: true, onRoster: false } };
    const c = fixtureSeed({
      v4gunLoc: [r0, r1],
      deaths: [
        { day: 150, kind: 'villager', who: 'adaeze', cause: 'the wild', player: true },
        { day: 151, kind: 'villager', who: 'gen_cc', cause: 'the wild', player: true },
      ],
      successionEvents: [
        { day: 150, cause: 'the wild', oldId: 'adaeze', newId: 'gen_cc', changed: true },
        { day: 151, cause: 'the wild', oldId: 'gen_cc', newId: 'ruth', changed: true },
      ],
    });
    const a = analyzeSeed(c);
    check('F14 ruth pattern is not a transfer', a.transfers.length === 0, 'got ' + JSON.stringify(a.transfers));
    check('F14 ruth destroyed exit recorded', a.exits.length === 1 && a.exits[0].kind === 'destroyed' && a.exits[0].loser === 'ruth', JSON.stringify(a.exits));
    check('F14 no unclassified', a.unclassified === 0, 'unclassified=' + a.unclassified);
  })();
  // F15: loser with unknown liveness stays an unexplained exit (the
  // detector refuses to call it destroyed without evidence).
  (function () {
    const r0 = row(50, 'sch', [{ loc: 'equipped', vid: 'ghost', count: 1, cells: 2 }]);
    const r1 = row(51, 'sch', []);
    r0.personFlags = {};
    r1.personFlags = {};
    const c = fixtureSeed({ v4gunLoc: [r0, r1] });
    const a = analyzeSeed(c);
    check('F15 unknown liveness is not a transfer', a.transfers.length === 0, 'got ' + JSON.stringify(a.transfers));
    check('F15 unexplained exit recorded', a.exits.length === 1 && a.exits[0].kind === 'unexplained-exit', JSON.stringify(a.exits));
    check('F15 unexplained counted', a.unexplainedExits === 1, 'unexplainedExits=' + a.unexplainedExits);
  })();
  console.log('guntransfer-analyzer selftest: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  if (args[0] === '--fixture' && args[1]) {
    const c = JSON.parse(fs.readFileSync(args[1], 'utf8'));
    const a = analyzeSeed(c);
    console.log(JSON.stringify({ seed: a.seed, transfers: a.transfers, exits: a.exits, notes: a.notes, unclassified: a.unclassified, unexplainedExits: a.unexplainedExits }, null, 2));
    process.exit(0);
  }
  const di = args.indexOf('--dir');
  if (di !== -1 && args[di + 1]) {
    const dir = args[di + 1];
    const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('guntransfer-b-s') === 0 && f.endsWith('.json'); }).sort();
    if (!files.length) { console.error('no guntransfer-b files in ' + dir); process.exit(2); }
    const seeds = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
    const leg = analyzeLeg(seeds);
    const j = judgeLeg(leg);
    const out = { verdict: j.verdict, bars: j.bars, leg: leg };
    const oi = args.indexOf('--out');
    if (oi !== -1 && args[oi + 1]) fs.writeFileSync(args[oi + 1], JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({ verdict: j.verdict, bars: j.bars,
      seeds: leg.seeds, transfers: leg.transfers.length, unclassified: leg.unclassified,
      exits: leg.exits.length, destroyedExits: leg.destroyedExits, unexplainedExits: leg.unexplainedExits,
      misclassified: leg.misclassified, censusHolderDays: leg.censusHolderDays,
      successions: leg.successionEvents, gearGiftsSear: leg.gearGiftSear,
      lendCalls: leg.lendCalls, lendFired: leg.lendFired,
      wins: leg.wins, national: leg.national, wave5Unlocks: leg.wave5Unlocks,
      wave5FacedSeeds: leg.wave5FacedSeeds, medianSurvival: leg.medianSurvival }, null, 2));
    process.exit(0);
  }
  console.error('usage: --selftest | --fixture <file> | --dir <dir> [--out <file>]');
  process.exit(2);
}

module.exports = { analyzeSeed: analyzeSeed, analyzeLeg: analyzeLeg, judgeLeg: judgeLeg, detectTransfers: detectTransfers, classifyMove: classifyMove, holdingsOfRow: holdingsOfRow };
