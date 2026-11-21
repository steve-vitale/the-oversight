// analyze-vanishcause-a.js — attribution + judge for arm sim-vanishcause-a
// (finding #2635: gun-vanish CAUSE). Reads the vanishcause-driver-a
// corpora and attributes EVERY v4transfers row (new-holder + vanish +
// holder-died + transfer) to a cause from the frozen closed set
// (prereg §5) using the gun's previous-day location + the same-day
// wrapped transfer/loss events. Judges the frozen bars (§6).
//   Modes:
//     --selftest                       unit tests (attribute + judge)
//     --dir <dir> --out <file>         judge one leg's 8-seed band
//     --compare <dirA> <dirB> --out <file>
//                                      instrument-neutrality check:
//                                      leg1 vs leg2 corpora identical
//                                      on all simulation fields
//   The panel compare (balance-panel.js) is a separate step; this
//   --compare is the field-level neutrality proof for bar 4.
'use strict';
const fs = require('fs');
const path = require('path');

const CAUSES = ['grant-contest-prize', 'died-holding', 'gift', 'trade', 'theft',
  'drop', 'corpse-take', 'loot', 'pack-transfer', 'inventory-expire',
  'unexplained-with-evidence'];

function locsOnDay(gunLocRows, day) {
  for (let i = 0; i < (gunLocRows || []).length; i++) {
    if (gunLocRows[i] && gunLocRows[i].day === day) return { idx: i, row: gunLocRows[i] };
  }
  return null;
}
function locsForVid(locs, vid) {
  return (locs || []).filter(function (l) { return l && l.vid === vid; });
}
function locsSummary(locs) {
  return (locs || []).map(function (l) {
    return l.loc + (l.vid ? ':' + l.vid : '') + (l.slot ? ':' + l.slot : '') +
      (l.cid ? ':' + l.cid : '') + (l.section ? ':' + l.section : '') + 'x' + (l.count || 0);
  }).join(', ') || '(no guns anywhere)';
}
function eventsOnDay(arr, day) {
  return ((arr || []).filter(function (e) { return e && e.day === day; }));
}
function priorGrantTo(sd, vid, day) {
  let best = null;
  for (const e of (sd.grantEvents || [])) {
    if (e && e.itemId === 'searcaster' && e.toVid === vid && e.day <= day) {
      if (!best || e.day > best.day) best = e;
    }
  }
  return best;
}

// attributeTransfer(row, sd): the cause of ONE holder change.
// row: {day, kind, from, to, attribution} (legacy v4transfers row).
// sd: the seed's corpus (gunLocRows + all event arrays).
// Returns {cause, mechanism, evidence} — cause from the frozen closed
// set; mechanism names the code path; evidence carries the
// before/after locations + the event that fired, so a human can verify
// without re-running the sim.
function attributeTransfer(row, sd) {
  const d = row.day;
  // The corpus names the census field v4gunLoc (driver) — fixtures may
  // use gunLocRows; accept either (smoke catch, 2026-11-21: the
  // analyzer read only gunLocRows and attributed NOTHING).
  const gunLocRows = sd.gunLocRows || sd.v4gunLoc || [];
  const found = locsOnDay(gunLocRows, d);
  if (!found || found.idx <= 0) {
    return { cause: 'unexplained-with-evidence', mechanism: 'no-prior-census',
      evidence: 'no gun-location row before day ' + d + ' (row: ' + JSON.stringify(row) + ')' };
  }
  const prev = gunLocRows[found.idx - 1];
  const cur = found.row;
  const prevLocs = prev.locations || [];
  const curLocs = cur.locations || [];
  const ev = function (arr) { return eventsOnDay(arr, d); };
  const dayGrants = ev(sd.grantEvents).filter(function (e) { return e.itemId === 'searcaster'; });
  const dayDeaths = ev(sd.deathEvents);
  const dayRemoves = ev(sd.removeEvents);
  const dayPlayerDeaths = ev(sd.playerDeathEvents);
  const dayCorpseTakes = ev(sd.corpseTakeEvents).filter(function (e) { return e.itemId === 'searcaster'; });
  const dayLootCorpse = ev(sd.lootCorpseEvents).filter(function (e) { return e.itemId === 'searcaster'; });
  const dayUnequips = ev(sd.unequipEvents);
  const dayEquips = ev(sd.equipEvents);
  const dayAutoEquips = ev(sd.autoEquipEvents);
  const dayDrops = ev(sd.dropEvents).filter(function (e) { return e.itemId === 'searcaster'; });
  const dayKills = ev(sd.killLootEvents).filter(function (e) { return e.dropId === 'searcaster'; });
  const dayLends = ev(sd.lendEvents);
  const evSummary = 'prev=[' + locsSummary(prevLocs) + '] cur=[' + locsSummary(curLocs) + ']';

  // ---- holder-died rows: the holder is dead; the gun is on the
  // corpse or still in the dead person's items. ----
  if (row.kind === 'holder-died') {
    const de = dayDeaths.filter(function (e) { return e.vid === row.from; })[0];
    const pd = (row.from === '__scholar__') ? dayPlayerDeaths[0] : null;
    const flagDead = cur.personFlags && cur.personFlags[row.from] && cur.personFlags[row.from].dead;
    return { cause: 'died-holding',
      mechanism: 'registerDeath' + (de ? ' (corpse ' + (de.corpseId || '?') + ', cause ' + (de.cause || '?') + ')' : '') +
        (pd ? ' + playerDeath (successor ' + (pd.newVid || '?') + ', corpse ' + (pd.corpseId || '?') + ')' : '') +
        (flagDead ? ' [personFlags dead]' : ' [NO death event recorded — detector inferred from getPerson().dead]'),
      evidence: evSummary };
  }

  // ---- arrival rows (new-holder / transfer): why `to` holds it now. ----
  if (row.kind === 'new-holder' || row.kind === 'transfer') {
    const to = row.to;
    // The scholar's new-holder: corpse take, contest grant, or unequip
    // (the blind-spot mirror: an equipped gun returns to the pack).
    if (to === '__scholar__') {
      if (dayCorpseTakes.length) {
        return { cause: 'corpse-take',
          mechanism: '_corpseTakeStack (corpse ' + (dayCorpseTakes[0].corpseId || '?') +
            (dayCorpseTakes[0].corpseVid ? ', of ' + dayCorpseTakes[0].corpseVid : '') + ')',
          evidence: evSummary };
      }
      if (dayLootCorpse.length) {
        return { cause: 'corpse-take',
          mechanism: 'lootCorpse (corpse ' + (dayLootCorpse[0].corpseId || '?') + ')',
          evidence: evSummary };
      }
      const g = dayGrants.filter(function (e) { return e.toKind === 'scholar'; })[0];
      if (g) {
        if (g.caller === 'contest-prize') return { cause: 'grant-contest-prize', mechanism: '_cxItemPrize -> alienLootGrant (contest ' + (g.frame || '?') + ')', evidence: evSummary };
        if (g.caller === 'trade') return { cause: 'trade', mechanism: 'alienLootGrant via betrayal trade', evidence: evSummary };
        return { cause: 'unexplained-with-evidence', mechanism: 'grant-caller-' + (g.caller || 'other') + ' (not in the closed set)',
          evidence: evSummary + ' grant=' + JSON.stringify(g) };
      }
      if (dayUnequips.length) {
        return { cause: 'pack-transfer',
          mechanism: 'Game.unequip(' + (dayUnequips[0].slot || '?') + ') — an equipped scholar gun returns to the pack (the old blind-spot mirror)',
          evidence: evSummary };
      }
      // The policy's ammo-aware gearUp equips a usable weapon OVER a
      // dry searcaster: Game.equip displaces the gun back to the pack
      // with NO unequip call (smoke catch, 2026-11-21: day 95, the
      // scholar equipped a bow over the dry searcaster). Displacement
      // implies dry — the searcaster (bonus 120) outscores every other
      // ranged weapon, so gearUp only seats another weapon over it
      // when it has no fusion cells.
      const disp = dayEquips.filter(function (e) { return e.displacedId === 'searcaster'; })[0];
      if (disp) {
        return { cause: 'pack-transfer',
          mechanism: 'Game.equip displaced the searcaster: the policy equipped ' + (disp.itemId || '?') + ' in the ' + (disp.slot || '?') + ' slot and the gun went back to the pack (dry — gearUp only displaces the best weapon when it has no ammo)',
          evidence: evSummary };
      }
      return { cause: 'unexplained-with-evidence', mechanism: 'scholar new-holder with no corpse-take, grant, unequip, or equip-displacement event today',
        evidence: evSummary };
    }
    // A villager's new-holder.
    const gToday = dayGrants.filter(function (e) { return e.toVid === to; })[0];
    if (gToday) {
      if (gToday.caller === 'contest-prize') return { cause: 'grant-contest-prize', mechanism: '_cxItemPrize -> alienLootGrant (GUNRATE redirect) to ' + to, evidence: evSummary };
      if (gToday.caller === 'trade') return { cause: 'trade', mechanism: 'alienLootGrant via betrayal trade to ' + to, evidence: evSummary };
      if (gToday.caller === 'kill-loot-corpse') return { cause: 'loot', mechanism: 'corpseForKill -> alienLootGrant to corpse, then take (grant to ' + to + ')', evidence: evSummary };
      return { cause: 'unexplained-with-evidence', mechanism: 'grant-caller-' + (gToday.caller || 'other') + ' (not in the closed set)', evidence: evSummary + ' grant=' + JSON.stringify(gToday) };
    }
    const kl = dayKills.filter(function (e) { return e.vid === to; })[0];
    if (kl) return { cause: 'loot', mechanism: 'villagerKillLoot drop searcaster to ' + to, evidence: evSummary };
    // The gun was already in `to`'s kit yesterday (carried) and
    // autoEquip seated it today (gearUp runs at fight entry).
    const wasCarried = locsForVid(prevLocs, to).some(function (l) { return l.loc === 'carried'; });
    if (wasCarried) {
      const pg = priorGrantTo(sd, to, d);
      // The seating event may precede the census row by a day:
      // villagerGearDay (villager-build.js) runs AFTER the driver's
      // end-of-day snapshot, so the autoEquip row lands on day d-1
      // while the census first shows 'equipped' on day d (pilot
      // catch, 2026-11-21: all four seating rows).
      const ae = dayAutoEquips.filter(function (e) { return e.vid === to; })[0] ||
        eventsOnDay(sd.autoEquipEvents, d - 1).filter(function (e) { return e.vid === to; })[0];
      return { cause: 'pack-transfer',
        mechanism: 'autoEquip seated a carried gun (villagerGearDay, villager-build.js:906)' +
          (ae ? ' — autoEquip day ' + ae.day + ': ' + (ae.rangedBefore || '(empty)') + ' -> ' + (ae.rangedAfter || '?') + (ae.frame ? ' (' + ae.frame + ')' : '') : ' [no autoEquip row fired today or yesterday]') +
          (pg ? '; granted day ' + pg.day + ' via ' + (pg.caller || '?') : '; no prior grant to ' + to + ' on record'),
        evidence: evSummary };
    }
    const wasStashed = locsForVid(prevLocs, to).some(function (l) { return l.loc === 'stashed'; });
    if (wasStashed) {
      return { cause: 'pack-transfer', mechanism: 'gun moved stashed -> equipped (stash take; no wrap names a stash-take function — the transition is the evidence)', evidence: evSummary };
    }
    if (dayLends.length) {
      return { cause: 'unexplained-with-evidence', mechanism: 'lend event fired today (LEND is OFF — see lendEvents)', evidence: evSummary + ' lends=' + JSON.stringify(dayLends) };
    }
    // The gun moved between holders with no recorded event.
    const prevHolder = prevLocs.filter(function (l) { return l.loc === 'equipped'; }).map(function (l) { return l.vid; });
    return { cause: 'unexplained-with-evidence',
      mechanism: 'gun moved ' + (prevHolder.length ? prevHolder.join(',') : '(no holder)') + ' -> ' + to + ' with no grant/loot/corpse-take/lend event',
      evidence: evSummary };
  }

  // ---- vanish rows: the gun left every known hand. ----
  if (row.kind === 'vanish') {
    const from = row.from;
    // (a) The holder died today — the gun is on the corpse or still
    // in the dead person's items. (This FIXES the old detector's
    // scholar-death mislabel: the old code skipped the dead-check
    // for __scholar__.)
    if (from === '__scholar__') {
      if (dayPlayerDeaths.length) {
        const pd = dayPlayerDeaths[0];
        return { cause: 'died-holding',
          mechanism: 'playerDeath (ledger.js:658) — scholar died' + (pd.hadGun ? ' holding (' + pd.hadGun + ')' : '') +
            '; inventory + equipped gear -> corpse death pack ' + (pd.corpseId || '?') + ', successor ' + (pd.newVid || '?') + '; nothing auto-transfers',
          evidence: evSummary };
      }
      const pd2 = dayDeaths.filter(function (e) { return e.player; })[0];
      if (pd2) {
        return { cause: 'died-holding', mechanism: 'registerDeath player:true (corpse ' + (pd2.corpseId || '?') + ')', evidence: evSummary };
      }
    } else {
      const de = dayDeaths.filter(function (e) { return e.vid === from; })[0];
      if (de) {
        return { cause: 'died-holding',
          mechanism: 'registerDeath (corpse ' + (de.corpseId || '?') + ', cause ' + (de.cause || '?') + ')' +
            (de.hasGun ? ' — gun on the corpse' : ' — gun still in the dead person\'s items'),
          evidence: evSummary };
      }
      const flagDead = cur.personFlags && cur.personFlags[from] && cur.personFlags[from].dead;
      if (flagDead) {
        return { cause: 'died-holding', mechanism: 'personFlags dead (no registerDeath row fired today — wrap gap, flag is the evidence)', evidence: evSummary };
      }
    }
    // (a2) SUCCESSION: the holder BECAME the scholar (playerDeath).
    // The gun never left them — their equipped gun is now the
    // scholar's equipped gun, which the old holder map cannot see
    // (smoke catch, 2026-11-21: catalina_reyes held the gun day 92,
    // became the scholar day 93, and the old map read 'vanish').
    // Cause label: pack-transfer — the gun moved from the villager's
    // kit to the scholar's kit because the holder's identity changed.
    const succ = dayPlayerDeaths.filter(function (e) { return e.newVid === from; })[0];
    if (succ) {
      return { cause: 'pack-transfer',
        mechanism: 'playerDeath succession (ledger.js:658) — ' + from + ' became the scholar on day ' + d +
          ' (old scholar ' + (succ.oldVid || '?') + ' died: ' + (succ.cause || '?') + '); the gun stayed equipped, now scholar-equipped — the old holder map cannot see an equipped scholar gun',
        evidence: evSummary };
    }
    // (b2) The scholar equipped their own pack gun (the blind spot:
    // Game.equip splices the gun OUT of inventory, so the old holder
    // map loses __scholar__ the moment the gun is worn).
    if (from === '__scholar__') {
      const nowEquipped = curLocs.some(function (l) { return l.loc === 'scholar-equipped'; });
      if (nowEquipped) {
        const eq = dayEquips[0];
        return { cause: 'pack-transfer',
          mechanism: 'Game.equip(' + (eq ? (eq.slot || '?') : '?') + ') — the scholar equipped the pack gun; the old holder map cannot see an equipped scholar gun',
          evidence: evSummary };
      }
    }
    // (b) The holder left the roster ALIVE with the gun in their pack.
    // NOT in the frozen closed set: recorded as
    // unexplained-with-evidence with the mechanism spelled out (prereg
    // §5); the metric review proposes a `left-with-holder` label.
    const rm = dayRemoves.filter(function (e) { return e.vid === from; })[0];
    if (rm) {
      const stillCarried = locsForVid(curLocs, from).some(function (l) { return l.loc === 'carried' || l.loc === 'equipped'; });
      return { cause: 'unexplained-with-evidence',
        mechanism: 'holder left roster alive via removeVillager \'' + (rm.how || '?') + '\' with the gun in their pack' +
          (stillCarried ? ' (gun still located carried:' + from + ' off-roster)' : ' (gun NOT located off-roster)') +
          ' — NOT in the frozen closed set; metric review proposes a left-with-holder label',
        evidence: evSummary };
    }
    // (c) The gun is still in the holder's kit, just not equipped.
    const nowCarried = locsForVid(curLocs, from).some(function (l) { return l.loc === 'carried'; });
    const nowStashed = locsForVid(curLocs, from).some(function (l) { return l.loc === 'stashed'; });
    if (nowCarried || nowStashed) {
      const ae = dayAutoEquips.filter(function (e) { return e.vid === from; })[0];
      return { cause: 'pack-transfer',
        mechanism: 'gun moved equipped -> ' + (nowCarried ? 'carried' : 'stashed') + ' (unequip/displace)' +
          (ae ? ' — autoEquip ' + (ae.rangedBefore || '?') + ' -> ' + (ae.rangedAfter || '?') + (ae.frame ? ' (' + ae.frame + ')' : '') : ' [no autoEquip row fired today]'),
        evidence: evSummary };
    }
    // (d) The scholar dropped it (out of existence — dropItem splices).
    if (from === '__scholar__' && dayDrops.length) {
      return { cause: 'drop', mechanism: 'Game.dropItem — the scholar left the searcaster for the woods (spliced out of existence)', evidence: evSummary };
    }
    // (e) The gun is on a corpse now but no death event fired.
    const onCorpse = curLocs.filter(function (l) { return l.loc === 'corpse'; });
    if (onCorpse.length) {
      return { cause: 'unexplained-with-evidence',
        mechanism: 'gun is on corpse ' + (onCorpse[0].cid || '?') + ' but no death/remove event fired for ' + from + ' today',
        evidence: evSummary };
    }
    // (f) True sink: nowhere, no event.
    return { cause: 'unexplained-with-evidence',
      mechanism: 'gun in NO tracked location and no transfer/loss event fired today (last-known: ' + locsSummary(locsForVid(prevLocs, from)) + ')',
      evidence: evSummary };
  }

  return { cause: 'unexplained-with-evidence', mechanism: 'unknown row kind ' + (row.kind || '?'), evidence: evSummary };
}

// recomputeTransfers(gunLocRows): the legacy diff, recomputed from the
// gun-location census alone (holder keys per day), for the consistency
// check. Same logic as the driver (presence/lendpool).
function recomputeTransfers(gunLocRows) {
  const rows = [];
  let prev = null;
  for (const r of (gunLocRows || [])) {
    const keys = {};
    for (const l of (r.locations || [])) {
      if (l.loc === 'equipped') keys[l.vid] = true;
      if (l.loc === 'scholar-pack') keys['__scholar__'] = true;
    }
    const nowIds = Object.keys(keys);
    if (prev === null) { prev = keys; continue; }
    const prevIds = Object.keys(prev);
    for (const to of nowIds) {
      if (prev[to]) continue;
      let from = null;
      for (const p of prevIds) { if (!keys[p]) { from = p; break; } }
      rows.push({ day: r.day, kind: from ? 'transfer' : 'new-holder', from: from, to: to });
    }
    for (const from of prevIds) {
      if (keys[from]) continue;
      if (nowIds.length > 0) continue;
      let dead = false;
      try { if (from !== '__scholar__') { const pf = (r.personFlags || {})[from]; dead = !!(pf && pf.dead); } } catch (e) {}
      rows.push({ day: r.day, kind: dead ? 'holder-died' : 'vanish', from: from, to: null });
    }
    prev = keys;
  }
  return rows;
}

function judgeAnalysis(a) {
  const total = a.rows.length;
  const explained = a.rows.filter(function (r) { return r.cause !== 'unexplained-with-evidence'; }).length;
  const rate = total ? explained / total : null;
  const vanishNamed = a.rows.filter(function (r) { return r.row.kind === 'vanish' && r.cause !== 'unexplained-with-evidence'; }).length;
  const bars = {
    attributionRate: { value: rate, threshold: 0.8, pass: rate != null && rate >= 0.8 },
    vanishCauseNamed: { value: vanishNamed, threshold: 1, pass: vanishNamed >= 1 },
    instrumentValidity: { value: { proofTest: a.proofTest || 'see test run', selftest: true, instrumentErrors: a.instrumentErrors, rowsWithoutLocation: a.rowsWithoutLocation },
      pass: a.instrumentErrors === 0 && a.rowsWithoutLocation === 0 && a.consistencyMatch === true },
    guardrailNeutrality: { value: 'see --compare output (leg1 vs leg2)', pass: null },
  };
  const verdict = (bars.attributionRate.pass && bars.vanishCauseNamed.pass && bars.instrumentValidity.pass) ? 'DIAG-GO' : 'DIAG-NO-GO';
  return { bars: bars, verdict: verdict, attributionRate: rate, explained: explained, total: total, vanishNamed: vanishNamed };
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('vanishcause-a-s') === 0 && f.endsWith('.json'); }).sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function analyzeDir(dir) {
  const corpora = loadCorpus(dir);
  const rows = [];
  const perSeed = [];
  let instrumentErrors = 0;
  let consistencyMatch = true;
  let consistencyNotes = [];
  for (const c of corpora) {
    instrumentErrors += (c.instrumentErrors || []).length;
    const recomputed = recomputeTransfers(c.v4gunLoc || []);
    const driverRows = c.v4transfers || [];
    const key = function (r) { return r.day + '|' + r.kind + '|' + (r.from || '') + '|' + (r.to || ''); };
    const reKeys = recomputed.map(key).sort();
    const drKeys = driverRows.map(key).sort();
    if (JSON.stringify(reKeys) !== JSON.stringify(drKeys)) {
      consistencyMatch = false;
      consistencyNotes.push('seed ' + c.seed + ': recomputed ' + reKeys.length + ' rows vs driver ' + drKeys.length +
        ' — only-in-recomputed: ' + JSON.stringify(reKeys.filter(function (k) { return drKeys.indexOf(k) === -1; })) +
        ' only-in-driver: ' + JSON.stringify(drKeys.filter(function (k) { return reKeys.indexOf(k) === -1; })));
    }
    let seedExplained = 0;
    for (const r of driverRows) {
      const a = attributeTransfer(r, c);
      rows.push({ seed: c.seed, row: r, cause: a.cause, mechanism: a.mechanism, evidence: a.evidence });
      if (a.cause !== 'unexplained-with-evidence') seedExplained++;
    }
    perSeed.push({ seed: c.seed, days: c.gameDays, end: c.endReason, maxWave: c.maxWave,
      standing: c.standing, scaleRank: c.scaleRank, won: !!c.won,
      transfers: driverRows.length, explained: seedExplained,
      gunLocRows: (c.v4gunLoc || []).length,
      grants: (c.grantEvents || []).filter(function (e) { return e.itemId === 'searcaster'; }).length,
      lends: (c.lendEvents || []).length });
  }
  const rowsWithoutLocation = rows.filter(function (r) { return r.mechanism === 'no-prior-census'; }).length;
  const wall = {
    seeds: corpora.length,
    wins: corpora.filter(function (c) { return c.won; }).length,
    national: corpora.filter(function (c) { return c.scaleRank === 'national' || c.scaleRank === 'global'; }).length,
    table: null,
    wave5: corpora.filter(function (c) { return (c.maxWave || 0) >= 5; }).length,
    wave4: corpora.filter(function (c) { return (c.maxWave || 0) >= 4; }).length,
    medianSurvival: median(corpora.map(function (c) { return c.gameDays || 0; })),
    communityLost: corpora.filter(function (c) { return ['village-lost', 'village-dead', 'pop-zero'].indexOf(c.endReason) !== -1; }).length,
  };
  const out = { arm: 'vanishcause-a', dir: dir, rows: rows, perSeed: perSeed, wall: wall,
    instrumentErrors: instrumentErrors, consistencyMatch: consistencyMatch,
    consistencyNotes: consistencyNotes, rowsWithoutLocation: rowsWithoutLocation };
  out.judge = judgeAnalysis(out);
  return out;
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}

function compareDirs(dirA, dirB) {
  const a = loadCorpus(dirA);
  const b = loadCorpus(dirB);
  const fields = ['seed', 'days', 'gameDays', 'endReason', 'won', 'over', 'villageLost',
    'scaleRank', 'maxWave', 'unlockedWave', 'standing', 'endPantryKcal',
    'deaths', 'samples'];
  const rows = [];
  let mismatches = 0;
  const bySeedB = {};
  for (const c of b) bySeedB[c.seed] = c;
  for (const ca of a) {
    const cb = bySeedB[ca.seed];
    if (!cb) { rows.push({ seed: ca.seed, match: false, note: 'missing in leg2' }); mismatches++; continue; }
    const diffs = [];
    for (const f of fields) {
      const va = JSON.stringify(ca[f]);
      const vb = JSON.stringify(cb[f]);
      if (va !== vb) diffs.push(f);
    }
    // Simulation-field equality excludes recorder metadata (event
    // arrays carry per-process seq/paths in stack frames; the panel
    // compare is the instrument-neutrality judge on metrics).
    if (diffs.length) mismatches++;
    rows.push({ seed: ca.seed, match: diffs.length === 0, diffs: diffs });
  }
  return { arm: 'vanishcause-a', legA: dirA, legB: dirB, rows: rows,
    mismatches: mismatches, verdict: mismatches === 0 ? 'NEUTRAL' : 'DIVERGED' };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond) {
    if (cond) { pass++; }
    else { fail++; console.log('SELFTEST FAIL: ' + name); }
  }
  function mkSd(over) {
    const base = {
      gunLocRows: [
        { day: 10, locations: [{ loc: 'equipped', vid: 'alice', count: 1 }], personFlags: { alice: { dead: false, onRoster: true } } },
        { day: 11, locations: [], personFlags: { alice: { dead: true, onRoster: false } } },
      ],
      grantEvents: [], corpseTakeEvents: [], lootCorpseEvents: [], killLootEvents: [],
      equipEvents: [], unequipEvents: [], autoEquipEvents: [], stealEvents: [],
      dropEvents: [], giftArmorEvents: [], deathEvents: [], removeEvents: [],
      playerDeathEvents: [], buryEvents: [], lendEvents: [],
    };
    return Object.assign(base, over || {});
  }
  // 1. villager died holding -> died-holding (death event).
  let sd = mkSd({ deathEvents: [{ day: 11, vid: 'alice', kind: 'villager', cause: 'monster', player: false, corpseId: 'c1', items: ['searcaster'], hasGun: true }],
    gunLocRows: [
      { day: 10, locations: [{ loc: 'equipped', vid: 'alice', count: 1 }], personFlags: { alice: { dead: false, onRoster: true } } },
      { day: 11, locations: [{ loc: 'corpse', cid: 'c1', cvid: 'alice', count: 1 }], personFlags: { alice: { dead: true, onRoster: false } } },
    ] });
  let a = attributeTransfer({ day: 11, kind: 'vanish', from: 'alice', to: null }, sd);
  check('vanish + villager death -> died-holding', a.cause === 'died-holding');
  check('vanish + villager death names registerDeath', /registerDeath/.test(a.mechanism));
  // 2. scholar died holding -> died-holding (NOT vanish-unexplained).
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }], personFlags: {} },
      { day: 11, locations: [{ loc: 'corpse', cid: 'c9', cvid: 'gen_old', count: 1 }], personFlags: {} },
    ],
    playerDeathEvents: [{ day: 11, oldVid: 'gen_old', newVid: 'gen_new', corpseId: 'c9', hadGun: 'pack', cause: 'injuries' }],
  });
  a = attributeTransfer({ day: 11, kind: 'vanish', from: '__scholar__', to: null }, sd);
  check('vanish + scholar death -> died-holding', a.cause === 'died-holding');
  check('vanish + scholar death names playerDeath', /playerDeath/.test(a.mechanism));
  // 3. scholar equipped the gun -> pack-transfer.
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }], personFlags: {} },
      { day: 11, locations: [{ loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }], personFlags: {} },
    ],
    equipEvents: [{ day: 11, itemId: 'searcaster', slot: 'ranged' }],
  });
  a = attributeTransfer({ day: 11, kind: 'vanish', from: '__scholar__', to: null }, sd);
  check('vanish + scholar equip -> pack-transfer', a.cause === 'pack-transfer');
  // 4. scholar unequipped -> new-holder pack-transfer.
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [{ loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }], personFlags: {} },
      { day: 11, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }], personFlags: {} },
    ],
    unequipEvents: [{ day: 11, itemId: 'searcaster', slot: 'ranged' }],
  });
  a = attributeTransfer({ day: 11, kind: 'new-holder', from: null, to: '__scholar__' }, sd);
  check('new-holder scholar + unequip -> pack-transfer', a.cause === 'pack-transfer');
  // 5. contest grant -> grant-contest-prize.
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [], personFlags: { bob: { dead: false, onRoster: true } } },
      { day: 11, locations: [{ loc: 'equipped', vid: 'bob', count: 1 }], personFlags: { bob: { dead: false, onRoster: true } } },
    ],
    grantEvents: [{ day: 11, itemId: 'searcaster', toKind: 'villager', toVid: 'bob', caller: 'contest-prize', frame: '_cxItemPrize@contests.js' }],
  });
  a = attributeTransfer({ day: 11, kind: 'new-holder', from: null, to: 'bob' }, sd);
  check('new-holder + contest grant -> grant-contest-prize', a.cause === 'grant-contest-prize');
  // 6. carried -> equipped (seated later; grant was days ago) -> pack-transfer.
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [{ loc: 'carried', vid: 'bob', count: 1 }], personFlags: { bob: { dead: false, onRoster: true } } },
      { day: 11, locations: [{ loc: 'equipped', vid: 'bob', count: 1 }], personFlags: { bob: { dead: false, onRoster: true } } },
    ],
    grantEvents: [{ day: 8, itemId: 'searcaster', toKind: 'villager', toVid: 'bob', caller: 'contest-prize', frame: '_cxItemPrize@contests.js' }],
    autoEquipEvents: [{ day: 11, vid: 'bob', rangedBefore: 'crude_bow', rangedAfter: 'searcaster', frame: 'fieldFight@fieldFights.js' }],
  });
  a = attributeTransfer({ day: 11, kind: 'new-holder', from: null, to: 'bob' }, sd);
  check('new-holder + carried->equipped -> pack-transfer', a.cause === 'pack-transfer');
  check('seated row names the prior grant day', /granted day 8/.test(a.mechanism));
  // 7. scholar corpse-take -> corpse-take.
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [{ loc: 'corpse', cid: 'c5', cvid: 'alice', count: 1 }], personFlags: { alice: { dead: true, onRoster: false } } },
      { day: 11, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }], personFlags: { alice: { dead: true, onRoster: false } } },
    ],
    corpseTakeEvents: [{ day: 11, itemId: 'searcaster', corpseId: 'c5', corpseVid: 'alice', toKind: 'scholar' }],
  });
  a = attributeTransfer({ day: 11, kind: 'new-holder', from: null, to: '__scholar__' }, sd);
  check('new-holder scholar + corpse take -> corpse-take', a.cause === 'corpse-take');
  // 8. scholar drop -> drop.
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }], personFlags: {} },
      { day: 11, locations: [], personFlags: {} },
    ],
    dropEvents: [{ day: 11, itemId: 'searcaster' }],
  });
  a = attributeTransfer({ day: 11, kind: 'vanish', from: '__scholar__', to: null }, sd);
  check('vanish scholar + drop -> drop', a.cause === 'drop');
  // 9. nowhere + no event -> unexplained-with-evidence (with last-known).
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [{ loc: 'equipped', vid: 'alice', count: 1 }], personFlags: { alice: { dead: false, onRoster: true } } },
      { day: 11, locations: [], personFlags: { alice: { dead: false, onRoster: true } } },
    ],
  });
  a = attributeTransfer({ day: 11, kind: 'vanish', from: 'alice', to: null }, sd);
  check('vanish nowhere + no event -> unexplained-with-evidence', a.cause === 'unexplained-with-evidence');
  check('unexplained row carries last-known location', /alice/.test(a.mechanism) || /equipped/.test(a.evidence));
  // 10. roster departure alive -> unexplained-with-evidence + mechanism.
  sd = mkSd({
    gunLocRows: [
      { day: 10, locations: [{ loc: 'equipped', vid: 'alice', count: 1 }], personFlags: { alice: { dead: false, onRoster: true } } },
      { day: 11, locations: [{ loc: 'carried', vid: 'alice', count: 1 }], personFlags: { alice: { dead: false, onRoster: false } } },
    ],
    removeEvents: [{ day: 11, vid: 'alice', how: 'exiled', gunBefore: ['equipped'] }],
  });
  a = attributeTransfer({ day: 11, kind: 'vanish', from: 'alice', to: null }, sd);
  check('vanish + exile -> unexplained-with-evidence (closed set)', a.cause === 'unexplained-with-evidence');
  check('exile row names the mechanism', /left roster alive/.test(a.mechanism));
  // 11. holder-died row -> died-holding.
  a = attributeTransfer({ day: 11, kind: 'holder-died', from: 'alice', to: null }, mkSd({}));
  check('holder-died -> died-holding', a.cause === 'died-holding');
  // 12. recomputeTransfers reproduces the legacy diff.
  const rec = recomputeTransfers([
    { day: 10, locations: [{ loc: 'equipped', vid: 'alice', count: 1 }], personFlags: { alice: { dead: false, onRoster: true } } },
    { day: 11, locations: [], personFlags: { alice: { dead: true, onRoster: false } } },
    { day: 12, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }], personFlags: { alice: { dead: true, onRoster: false } } },
  ]);
  check('recompute: death day -> holder-died', rec.length === 2 && rec[0].kind === 'holder-died' && rec[0].from === 'alice');
  check('recompute: scholar pack day -> new-holder', rec[1].kind === 'new-holder' && rec[1].to === '__scholar__');
  // 13. judge shapes.
  const jGo = judgeAnalysis({ rows: [
    { cause: 'died-holding', row: { kind: 'vanish' } },
    { cause: 'grant-contest-prize', row: { kind: 'new-holder' } },
    { cause: 'pack-transfer', row: { kind: 'new-holder' } },
    { cause: 'pack-transfer', row: { kind: 'vanish' } },
    { cause: 'unexplained-with-evidence', row: { kind: 'vanish' } },
  ], instrumentErrors: 0, rowsWithoutLocation: 0, consistencyMatch: true });
  check('judge GO at 80% + vanish named', jGo.verdict === 'DIAG-GO' && jGo.bars.attributionRate.pass && jGo.bars.vanishCauseNamed.pass);
  const jNo = judgeAnalysis({ rows: [
    { cause: 'unexplained-with-evidence', row: { kind: 'vanish' } },
    { cause: 'unexplained-with-evidence', row: { kind: 'new-holder' } },
    { cause: 'grant-contest-prize', row: { kind: 'new-holder' } },
  ], instrumentErrors: 0, rowsWithoutLocation: 0, consistencyMatch: true });
  check('judge NO-GO below 80% + no vanish named', jNo.verdict === 'DIAG-NO-GO' && !jNo.bars.attributionRate.pass && !jNo.bars.vanishCauseNamed.pass);
  // 14. CORPUS shape: the driver writes the census as v4gunLoc, not
  // gunLocRows — attributeTransfer must read it (smoke catch,
  // 2026-11-21: every row came back 'no-prior-census' until this).
  const corpusSd = mkSd({
    gunLocRows: undefined,
    v4gunLoc: [
      { day: 10, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }], personFlags: {} },
      { day: 11, locations: [{ loc: 'corpse', cid: 'c9', cvid: 'gen_old', count: 1 }], personFlags: {} },
    ],
    playerDeathEvents: [{ day: 11, oldVid: 'gen_old', newVid: 'gen_new', corpseId: 'c9', hadGun: 'pack', cause: 'injuries' }],
  });
  delete corpusSd.gunLocRows;
  a = attributeTransfer({ day: 11, kind: 'vanish', from: '__scholar__', to: null }, corpusSd);
  check('corpus v4gunLoc shape attributes the scholar death', a.cause === 'died-holding' && a.mechanism !== 'no-prior-census');
  // 15. SUCCESSION: the holder became the scholar (smoke catch,
  // 2026-11-21) — the gun never left them; the old map read vanish
  // because an equipped scholar gun is invisible to it.
  const succSd = mkSd({
    gunLocRows: undefined,
    v4gunLoc: [
      { day: 10, locations: [{ loc: 'equipped', vid: 'alice', count: 1 }], personFlags: { alice: { dead: false, onRoster: true } } },
      { day: 11, locations: [{ loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }], personFlags: { alice: { dead: false, onRoster: true } } },
    ],
    playerDeathEvents: [{ day: 11, oldVid: 'gen_old', newVid: 'alice', corpseId: 'c9', hadGun: null, cause: 'the wild' }],
  });
  delete succSd.gunLocRows;
  a = attributeTransfer({ day: 11, kind: 'vanish', from: 'alice', to: null }, succSd);
  check('vanish + succession -> pack-transfer', a.cause === 'pack-transfer');
  check('succession row names playerDeath', /succession/.test(a.mechanism) && /playerDeath/.test(a.mechanism));
  // 16. EQUIP DISPLACEMENT: the policy equipped another weapon over
  // a dry searcaster (smoke catch, 2026-11-21) — no unequip call,
  // the gun just goes back to the pack.
  const dispSd = mkSd({
    gunLocRows: undefined,
    v4gunLoc: [
      { day: 10, locations: [{ loc: 'scholar-equipped', vid: '__scholar__', slot: 'ranged', count: 1 }], personFlags: {} },
      { day: 11, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }], personFlags: {} },
    ],
    equipEvents: [{ day: 11, itemId: 'crude_bow', slot: 'ranged', displacedId: 'searcaster' }],
  });
  delete dispSd.gunLocRows;
  a = attributeTransfer({ day: 11, kind: 'new-holder', from: null, to: '__scholar__' }, dispSd);
  check('new-holder scholar + equip displacement -> pack-transfer', a.cause === 'pack-transfer');
  check('displacement row names the displacing weapon', /crude_bow/.test(a.mechanism));
  // 17. Seating event lands the day BEFORE the census row (pilot
  // catch, 2026-11-21): villagerGearDay runs after the end-of-day
  // snapshot, so the autoEquip row is day d-1, the 'equipped' row d.
  const seatSd = mkSd({
    gunLocRows: undefined,
    v4gunLoc: [
      { day: 10, locations: [{ loc: 'carried', vid: 'bob', count: 1 }], personFlags: { bob: { dead: false, onRoster: true } } },
      { day: 11, locations: [{ loc: 'equipped', vid: 'bob', count: 1 }], personFlags: { bob: { dead: false, onRoster: true } } },
    ],
    grantEvents: [{ day: 10, itemId: 'searcaster', toKind: 'villager', toVid: 'bob', caller: 'contest-prize', frame: '_cxItemPrize@contests.js' }],
    autoEquipEvents: [{ day: 10, vid: 'bob', rangedBefore: 'crude_bow', rangedAfter: 'searcaster', frame: 'villagerGearDay@villager-build.js' }],
  });
  delete seatSd.gunLocRows;
  a = attributeTransfer({ day: 11, kind: 'new-holder', from: null, to: 'bob' }, seatSd);
  check('new-holder + seating event day before -> pack-transfer', a.cause === 'pack-transfer');
  check('seating row names the day-before autoEquip', /day 10/.test(a.mechanism) && /villagerGearDay/.test(a.mechanism));
  console.log('vanishcause analyzer selftest: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  if (args.indexOf('--compare') !== -1) {
    const i = args.indexOf('--compare');
    const dirA = args[i + 1], dirB = args[i + 2];
    const outIdx = args.indexOf('--out');
    const outPath = outIdx !== -1 ? args[outIdx + 1] : null;
    if (!dirA || !dirB) { console.error('usage: --compare <dirA> <dirB> [--out <file>]'); process.exit(2); }
    const res = compareDirs(dirA, dirB);
    if (outPath) fs.writeFileSync(outPath, JSON.stringify(res, null, 2) + '\n');
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.verdict === 'NEUTRAL' ? 0 : 1);
  }
  const dirIdx = args.indexOf('--dir');
  const outIdx = args.indexOf('--out');
  if (dirIdx === -1) { console.error('usage: --selftest | --dir <dir> --out <file> | --compare <dirA> <dirB> [--out <file>]'); process.exit(2); }
  const res = analyzeDir(args[dirIdx + 1]);
  if (outIdx !== -1) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: res.judge.verdict, attributionRate: res.judge.attributionRate,
    explained: res.judge.explained, total: res.judge.total, vanishNamed: res.judge.vanishNamed,
    instrumentErrors: res.instrumentErrors, consistencyMatch: res.consistencyMatch,
    rowsWithoutLocation: res.rowsWithoutLocation, wall: res.wall }, null, 2));
}

module.exports = { attributeTransfer: attributeTransfer, recomputeTransfers: recomputeTransfers,
  judgeAnalysis: judgeAnalysis, analyzeDir: analyzeDir, compareDirs: compareDirs,
  selftest: selftest, CAUSES: CAUSES };
