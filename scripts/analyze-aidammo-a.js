// analyze-aidammo-a.js — analyzer + DIAG judge, arm sim-aidammo-a.
// DIAG: the aid / world-tick ammo-supply ledger (finding #2602). Single
// leg — no ctl/arm. Reuses legStats + summarize verbatim from
// analyze-bowopen-a.js (same driver corpus format) for the pool floor and
// wall numbers, and adds:
//   ammoAtEntryAll(dir): ammo-at-entry by origin across ALL wave-4+
//     encounters (lead + allies, evades included), re-measuring the
//     ammosupply mechanism bar (0.447 vs 0.70) with origin attribution.
//   ledgerStats(dir): batches/units by production source, units-at-entry
//     by source, attribution completeness, dominant source, delivery.
//   judgeDiag(...): the frozen prereg §2 bars — DIAG-GO / DIAG-NO-GO.
//   ledgerHash(d): canonical hash of a seed's ledger events + encounter
//     ammo fields, for the determinism re-run check (prereg §2).
// Usage:
//   node scripts/analyze-aidammo-a.js --dir DIR [--out FILE]
//   node scripts/analyze-aidammo-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
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
function isWin(o) { return o === 'vKill' || o === 'mFlee'; }

// Parse per-fighter strike damage from encounter log lines:
// "R2: Maya strikes for 52 (x2.0) (961 left)" / "R3: Kevin strikes for 10 (907 left)"
// Returns { byName: { firstName: total }, total: number, attributed: number }.
// First names are resolved to vids by the caller via the roster map.
function parseStrikes(log) {
  const byName = {};
  let total = 0;
  for (const ln of (log || [])) {
    const m = /^(?:R\d+:\s*)?(.+?)\s+strikes for\s+(\d+)/.exec(String(ln));
    if (!m) continue;
    const name = m[1].trim();
    const dmg = parseInt(m[2], 10);
    if (!Number.isFinite(dmg)) continue;
    byName[name] = (byName[name] || 0) + dmg;
    total += dmg;
  }
  return { byName: byName, total: total };
}
// Ability tokens named in log lines: "(Rage)", "(Stare Down — it backed
// down)", "field medicine". Collect parenthesized capitalized phrases.
function parseAbilityTokens(log) {
  const toks = [];
  for (const ln of (log || [])) {
    const s = String(ln);
    const re = /\(([A-Z][A-Za-z' ]+?)(?:\s+—|\))/g;
    let m;
    while ((m = re.exec(s)) !== null) {
      const t = m[1].trim();
      if (t && t.length <= 40 && !/^\d/.test(t)) toks.push(t);
    }
    if (/field medicine/i.test(s)) toks.push('field medicine');
  }
  return toks;
}

function legStats(dir, opts) {
  opts = opts || {};
  const minPlan = opts.minPlanParty != null ? opts.minPlanParty : 2;
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    launchpartyOn: {}, fightally2On: {}, bowopenOn: {},
    meetings: 0, wins: 0, kills: 0, losses: 0, vDie: 0, vFlee: 0, mFlee: 0,
    winShare: null, killShare: null,
    // BOWOPEN mechanism (field engine, never snapshots)
    dmgPerRoundMean: null, volleyFired: 0, volleyFireShare: null,
    volleyDmgMean: null, rangedAtEntry: 0, rangedAtEntryShare: null,
    bowOpen: { alreadyHad: 0, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 0 },
    bowOpenStagedVids: 0,
    // SPEARGATE gate replication (sim-instrument-a): per-leg
    // spearSeen/spearPassed + pass rate. Null/unknown until the
    // end-of-leg rule below finds every valid file carrying them.
    spearSeen: null, spearPassed: null, spearPassRate: null,
    spearCountersKnown: false, spearFiles: 0,
    // population funnel (diagnostic: where meetings fall out)
    funnel: { encounters: 0, joined: 0, unjoined: 0, noLaunchPlan: 0, pairLaunch: 0,
      partyAbsent: 0, evadeExcluded: 0 },
    byOutcome: {}, // outcome -> {n, rounds[], dmgShare[], vTaken[], partySize[], minArmorP[], meanArmorP[], mHpStart[], abilitiesPerMember[], fighterDmgShare[]}
    gateXOutcome: {}, // gateResult -> {outcome -> n}
    gateAvoidShare: null, gateNullShare: null, gateSeekShare: null,
    lossGateNull: 0, lossGateAvoid: 0, lossGateSeek: 0,
    monsterByOutcome: {}, // mid -> {win, loss}
    dmgShareMean: null, dmgShareByOutcome: {},
    roundsMean: null, vTakenMean: null,
    starvation: 0, starvationVillager: 0, days: [], medianDays: null,
    communityLost: 0, national: 0, seedWins: 0, wave4: 0, wave5: 0, scaleRanks: {} };
  const meetingsDetail = [];
  const dmgShares = [], roundsAll = [], vTakenAll = [];
  const dmgPerRoundAll = [], volleyDmgs = [];
  let gateAvoid = 0, gateNull = 0, gateSeek = 0;
  let spearSeenSum = 0, spearPassedSum = 0, spearFiles = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    if (!d || typeof d !== 'object') { st.errors++; continue; }
    st.valid++;
    st.errors += ((d.instrumentErrors || []).length);
    if (d.launchpartyOn != null) st.launchpartyOn[String(d.launchpartyOn)] = (st.launchpartyOn[String(d.launchpartyOn)] || 0) + 1;
    if (d.fightally2On != null) st.fightally2On[String(d.fightally2On)] = (st.fightally2On[String(d.fightally2On)] || 0) + 1;
    if (d.bowopenOn != null) st.bowopenOn[String(d.bowopenOn)] = (st.bowopenOn[String(d.bowopenOn)] || 0) + 1;
    if (d.bowOpen) {
      for (const k of Object.keys(st.bowOpen)) st.bowOpen[k] += (d.bowOpen[k] | 0);
      st.bowOpenStagedVids += (d.bowOpenStagedVids | 0);
    }
    // SPEARGATE gate replication: the driver's explicit per-seed
    // fields ONLY (never the legacy bowOpen object — pre-instrument
    // corpora predate the fields and must read unknown even where
    // the game-code telemetry inside bowOpen incidentally carries
    // the same counts). A file counts toward the leg total only
    // when BOTH fields are finite numbers.
    if (typeof d.spearSeen === 'number' && Number.isFinite(d.spearSeen) &&
        typeof d.spearPassed === 'number' && Number.isFinite(d.spearPassed)) {
      spearSeenSum += d.spearSeen;
      spearPassedSum += d.spearPassed;
      spearFiles++;
    }
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
    // Roster first-name -> vid map (latest daily row at or before each
    // meeting day; rebuilt per meeting below from this file's daily).
    const daily = d.daily || [];
    function rosterAt(day) {
      let best = null;
      for (const row of daily) {
        if (row.day <= day && (!best || row.day > best.day)) best = row;
      }
      const map = {};
      if (best) {
        for (const v of (best.roster || [])) {
          const first = String(v.name || '').split(' ')[0];
          if (first) map[first] = v.vid;
        }
      }
      return map;
    }
    // Villager ability snapshots: [[day, [villager,...]], ...]
    const snaps = (d.samples && d.samples.villagers) || [];
    function abilitiesAt(day) {
      let best = null;
      for (const snap of snaps) {
        if (snap[0] <= day && (!best || snap[0] > best[0])) best = snap;
      }
      const map = {};
      if (best) {
        for (const v of (best[1] || [])) map[v.vid] = (v.abilities || []).slice();
      }
      return map;
    }
    // Gate index: (day|vid|mid) -> first gate row.
    const gateIdx = {};
    for (const g of (d.v4gates || [])) {
      const k = g.day + '|' + g.vid + '|' + g.mid;
      if (!(k in gateIdx)) gateIdx[k] = g;
    }
    for (const r of (d.v4encounters || [])) {
      if (r.origin !== 'expedition' || (r.wave | 0) < 4) continue;
      st.funnel.encounters++;
      const g = gateIdx[r.day + '|' + r.vid + '|' + r.mid];
      if (!g) { st.funnel.unjoined++; continue; }
      st.funnel.joined++;
      const planParty = (g.planParty || []).slice();
      if (!planParty.length) { st.funnel.noLaunchPlan++; continue; }
      if (planParty.length < minPlan) { st.funnel.pairLaunch++; continue; } // size floor (trio+ when minPlan=2)
      const allyVids = (r.allyVids || []).slice();
      const planSet = new Set(planParty);
      // Corrected arrival, piecewise (engine cap is 2 ally seats).
      let present;
      if (planParty.length <= 2) present = planParty.every(function (x) { return allyVids.indexOf(x) !== -1; });
      else present = allyVids.length === 2 && allyVids.every(function (x) { return planSet.has(x); });
      if (!present) { st.funnel.partyAbsent++; continue; }
      if ((r.rounds | 0) <= 0 || r.outcome === 'evade') { st.funnel.evadeExcluded++; continue; }
      // ---- in population ----
      const outcome = r.outcome || '?';
      const win = isWin(outcome);
      st.meetings++;
      if (win) st.wins++;
      if (outcome === 'vKill') st.kills++;
      if (outcome === 'vDie') st.vDie++;
      if (outcome === 'vFlee') st.vFlee++;
      if (outcome === 'mFlee') st.mFlee++;
      if (!win) st.losses++;
      const gateResult = (g.result || (r.gate && r.gate.result) || 'null');
      const gateReason = g.reason || (r.gate && r.gate.reason) || null;
      if (gateResult === 'avoid') gateAvoid++;
      else if (gateResult === 'seek') gateSeek++;
      else gateNull++;
      if (!win) {
        if (gateResult === 'avoid') st.lossGateAvoid++;
        else if (gateResult === 'seek') st.lossGateSeek++;
        else st.lossGateNull++;
      }
      if (!st.gateXOutcome[gateResult]) st.gateXOutcome[gateResult] = {};
      st.gateXOutcome[gateResult][outcome] = (st.gateXOutcome[gateResult][outcome] || 0) + 1;
      // Gear from the gate row (sensed party: fighter + allies).
      const gear = g.gear || {};
      const partyVids = [r.vid].concat(allyVids);
      const armorPs = partyVids.map(function (v) { return gear[v] ? gear[v].armorP : null; }).filter(function (x) { return x != null; });
      const minArmorP = armorPs.length ? Math.min.apply(null, armorPs) : null;
      const meanArmorP = mean(armorPs);
      const allArmed = g.allArmed === true;
      const allArmored = g.allArmored === true;
      // Damage: mDealt is lead-only (hole noted); parse per-fighter
      // strikes from the log for the party's share.
      const strikes = parseStrikes(r.log);
      const roster = rosterAt(r.day);
      const dmgByVid = {};
      let attributed = 0;
      for (const name of Object.keys(strikes.byName)) {
        const vid = roster[name];
        if (vid) { dmgByVid[vid] = (dmgByVid[vid] || 0) + strikes.byName[name]; attributed += strikes.byName[name]; }
      }
      const fighterDmg = dmgByVid[r.vid] || 0;
      const fighterDmgShare = strikes.total > 0 ? fighterDmg / strikes.total : null;
      const joiners = [];
      if (r.allyVid) joiners.push(r.allyVid);
      if (r.ally2Vid) joiners.push(r.ally2Vid);
      // Abilities: nearest snapshot at or before the meeting day.
      const abMap = abilitiesAt(r.day);
      const memberAbilities = {};
      let abTotal = 0, abMembers = 0;
      for (const v of partyVids) {
        const abs = abMap[v] || [];
        memberAbilities[v] = abs;
        abTotal += abs.length; abMembers++;
      }
      const abilitiesPerMember = abMembers ? abTotal / abMembers : null;
      const abilityTokens = parseAbilityTokens(r.log);
      const dmgShare = (r.mHpStart != null && r.mHpStart > 0 && r.mDealt != null) ? r.mDealt / r.mHpStart : null;
      if (dmgShare != null) dmgShares.push(dmgShare);
      roundsAll.push(r.rounds | 0);
      vTakenAll.push(r.vTaken != null ? r.vTaken : 0);
      // BOWOPEN: damage/round (mDealt/rounds — never parsed totals)
      // + the opening volley, straight from the fight record.
      const dmgPerRound = ((r.rounds | 0) > 0 && r.mDealt != null) ? r.mDealt / (r.rounds | 0) : null;
      if (dmgPerRound != null) dmgPerRoundAll.push(dmgPerRound);
      const vol = (r.volley && typeof r.volley.shots === 'number') ? r.volley : null;
      if (vol && vol.shots > 0) st.volleyFired++;
      if (vol) volleyDmgs.push(vol.dmg | 0);
      if (r.rangedId != null) st.rangedAtEntry++;
      if (!st.byOutcome[outcome]) st.byOutcome[outcome] = { n: 0, rounds: [], dmgShare: [], vTaken: [], partySize: [], minArmorP: [], meanArmorP: [], mHpStart: [], abilitiesPerMember: [], fighterDmgShare: [], parsedStrikeTotal: [], dmgPerRound: [], volleyDmg: [] };
      const bo = st.byOutcome[outcome];
      bo.n++;
      bo.rounds.push(r.rounds | 0);
      if (dmgShare != null) bo.dmgShare.push(dmgShare);
      if (dmgPerRound != null) bo.dmgPerRound.push(dmgPerRound);
      if (vol) bo.volleyDmg.push(vol.dmg | 0);
      bo.vTaken.push(r.vTaken != null ? r.vTaken : 0);
      bo.partySize.push(partyVids.length);
      if (minArmorP != null) bo.minArmorP.push(minArmorP);
      if (meanArmorP != null) bo.meanArmorP.push(meanArmorP);
      if (r.mHpStart != null) bo.mHpStart.push(r.mHpStart);
      if (abilitiesPerMember != null) bo.abilitiesPerMember.push(abilitiesPerMember);
      if (fighterDmgShare != null) bo.fighterDmgShare.push(fighterDmgShare);
      bo.parsedStrikeTotal.push(strikes.total);
      if (!st.monsterByOutcome[r.mid]) st.monsterByOutcome[r.mid] = { win: 0, loss: 0 };
      if (win) st.monsterByOutcome[r.mid].win++;
      else st.monsterByOutcome[r.mid].loss++;
      meetingsDetail.push({ seed: d.seed, day: r.day, vid: r.vid, mid: r.mid,
        mHpStart: r.mHpStart != null ? r.mHpStart : null, outcome: outcome, win: win,
        rounds: r.rounds | 0, vTaken: r.vTaken != null ? r.vTaken : 0,
        mDealt: r.mDealt != null ? r.mDealt : null, dmgShare: dmgShare,
        dmgPerRound: dmgPerRound,
        volley: vol ? { shots: vol.shots | 0, hits: vol.hits | 0, dmg: vol.dmg | 0 } : null,
        rangedId: r.rangedId != null ? r.rangedId : null,
        ammoAtEntry: r.ammoAtEntry != null ? r.ammoAtEntry : null,
        planParty: planParty, allyVids: allyVids, joiners: joiners,
        partySize: partyVids.length,
        gate: { result: gateResult, reason: gateReason, allArmed: allArmed, allArmored: allArmored },
        gear: gear, minArmorP: minArmorP, meanArmorP: meanArmorP,
        parsedStrikeTotal: strikes.total, parsedAttributed: attributed,
        dmgByVid: dmgByVid, fighterDmgShare: fighterDmgShare,
        abilitiesPerMember: abilitiesPerMember, memberAbilities: memberAbilities,
        abilityTokens: abilityTokens,
        log: (r.log || []).slice() });
    }
  }
  st.winShare = st.meetings ? st.wins / st.meetings : null;
  st.killShare = st.meetings ? st.kills / st.meetings : null;
  st.dmgShareMean = mean(dmgShares);
  st.roundsMean = mean(roundsAll);
  st.vTakenMean = mean(vTakenAll);
  st.dmgPerRoundMean = mean(dmgPerRoundAll);
  st.volleyFireShare = st.meetings ? st.volleyFired / st.meetings : null;
  st.volleyDmgMean = mean(volleyDmgs);
  st.rangedAtEntryShare = st.meetings ? st.rangedAtEntry / st.meetings : null;
  // SPEARGATE gate replication: known only when EVERY valid file
  // carried the counters. Otherwise the leg total stays unknown
  // (null) — a partial sum would undercount, and a 0 would claim
  // the gate saw nobody. A known leg with zero seen has rate null
  // (0/0 is undefined), which is distinct from unknown.
  st.spearFiles = spearFiles;
  if (st.valid > 0 && spearFiles === st.valid) {
    st.spearSeen = spearSeenSum;
    st.spearPassed = spearPassedSum;
    st.spearPassRate = spearSeenSum ? spearPassedSum / spearSeenSum : null;
    st.spearCountersKnown = true;
  }
  st.gateAvoidShare = st.meetings ? gateAvoid / st.meetings : null;
  st.gateNullShare = st.meetings ? gateNull / st.meetings : null;
  st.gateSeekShare = st.meetings ? gateSeek / st.meetings : null;
  for (const o of Object.keys(st.byOutcome)) {
    const bo = st.byOutcome[o];
    st.dmgShareByOutcome[o] = mean(bo.dmgShare);
    bo.dmgPerRoundMean = mean(bo.dmgPerRound);
    bo.volleyDmgMean = mean(bo.volleyDmg);
    bo.roundsMean = mean(bo.rounds);
    bo.vTakenMean = mean(bo.vTaken);
    bo.partySizeMean = mean(bo.partySize);
    bo.minArmorPMean = mean(bo.minArmorP);
    bo.meanArmorPMean = mean(bo.meanArmorP);
    bo.mHpStartMean = mean(bo.mHpStart);
    bo.abilitiesPerMemberMean = mean(bo.abilitiesPerMember);
    bo.fighterDmgShareMean = mean(bo.fighterDmgShare);
    bo.parsedStrikeTotalMean = mean(bo.parsedStrikeTotal);
  }
  st.medianDays = median(st.days);
  st.meetingsDetail = meetingsDetail;
  return st;
}


// ---- AIDAMMO: ammo-capable weapon set (live from items.json) ----
// A weapon is ammo-capable when its def carries weapon.ammo. Spears
// sit in the ranged slot but carry no ammo id — they are ranged-at-entry
// but never ammo-capable, and never count as empty quivers.
const AMMO_CAPABLE_FROZEN = ['sling', 'phase_sling', 'crude_bow', 'bow', 'starfall_bow', 'apex_bow', 'crossbow', 'searcaster'];
let AMMO_CAPABLE = null;
function ammoCapableSet() {
  if (AMMO_CAPABLE) return AMMO_CAPABLE;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'items.json'), 'utf8'));
    const items = raw.items || raw;
    const set = new Set();
    for (const it of items) if (it && it.weapon && it.weapon.ammo) set.add(it.id);
    if (set.size) { AMMO_CAPABLE = set; return set; }
  } catch (e) {}
  AMMO_CAPABLE = new Set(AMMO_CAPABLE_FROZEN);
  return AMMO_CAPABLE;
}
function isAmmoCapable(rangedId) {
  if (rangedId == null) return false;
  return ammoCapableSet().has(rangedId);
}

// ammoAtEntryAll(dir): the mechanism re-measure over ALL wave-4+
// encounters (any origin, evades included — the row records kit at
// entry). Fighters = the lead + each alliesAmmo entry. Denominator =
// fighters with rangedId != null; numerator = ammoAtEntry > 0.
// Returns { overall, capableOnly, byOrigin, fighters, ranged, withAmmo }.
function ammoAtEntryAll(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const out = { dir: dir, n: 0, valid: 0, errors: 0,
    fighters: 0, ranged: 0, withAmmo: 0, rate: null,
    capableFighters: 0, capableWithAmmo: 0, capableRate: null,
    spearFighters: 0,
    byOrigin: {}, // origin -> {fighters, ranged, withAmmo, rate}
    unitsAtEntry: 0, unitsAtEntryBySource: {}, unitsAtEntryByOrigin: {} };
  function originBucket(o) {
    const k = o || 'unclassified';
    if (!out.byOrigin[k]) out.byOrigin[k] = { fighters: 0, ranged: 0, withAmmo: 0, rate: null };
    return out.byOrigin[k];
  }
  function countFighter(b, rangedId, ammoAtEntry, prov) {
    b.fighters++;
    out.fighters++;
    if (rangedId != null) {
      b.ranged++;
      out.ranged++;
      if (isAmmoCapable(rangedId)) { out.capableFighters++; if ((ammoAtEntry | 0) > 0) out.capableWithAmmo++; }
      else out.spearFighters++;
      if ((ammoAtEntry | 0) > 0) { b.withAmmo++; out.withAmmo++; }
    }
    const u = ammoAtEntry | 0;
    out.unitsAtEntry += u;
    if (u > 0 && Array.isArray(prov)) {
      // Attribute the held units to production sources by FIFO share,
      // scaled to the held count (prov shares sum to the held units;
      // if they sum short — stale queue — the remainder is 'unknown').
      let attributed = 0;
      for (const sh of prov) {
        const us = Math.min(sh.units | 0, u - attributed);
        if (us <= 0) continue;
        out.unitsAtEntryBySource[sh.source] = (out.unitsAtEntryBySource[sh.source] || 0) + us;
        attributed += us;
      }
      if (attributed < u) out.unitsAtEntryBySource.unknown = (out.unitsAtEntryBySource.unknown || 0) + (u - attributed);
    } else if (u > 0) {
      out.unitsAtEntryBySource.unknown = (out.unitsAtEntryBySource.unknown || 0) + u;
    }
  }
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { out.errors++; continue; }
    out.n++;
    if (!d || typeof d !== 'object') { out.errors++; continue; }
    out.valid++;
    out.errors += ((d.instrumentErrors || []).length);
    for (const r of (d.v4encounters || [])) {
      if ((r.wave | 0) < 4) continue;
      const b = originBucket(r.origin || 'unclassified');
      countFighter(b, r.rangedId != null ? r.rangedId : null, r.ammoAtEntry | 0, r.ammoProv || []);
      for (const a of (r.alliesAmmo || [])) {
        countFighter(b, a.rangedId != null ? a.rangedId : null, a.ammoAtEntry | 0, a.prov || []);
      }
      const ob = out.unitsAtEntryByOrigin[r.origin || 'unclassified'] || 0;
      out.unitsAtEntryByOrigin[r.origin || 'unclassified'] = ob + (r.ammoAtEntry | 0) +
        ((r.alliesAmmo || []).reduce(function (acc, a) { return acc + (a.ammoAtEntry | 0); }, 0));
    }
  }
  out.rate = out.ranged ? out.withAmmo / out.ranged : null;
  out.capableRate = out.capableFighters ? out.capableWithAmmo / out.capableFighters : null;
  for (const k of Object.keys(out.byOrigin)) {
    const b = out.byOrigin[k];
    b.rate = b.ranged ? b.withAmmo / b.ranged : null;
  }
  return out;
}

// ledgerStats(dir): batches + units by production source (from the
// driver's ammoLedger.events), units-at-entry by source (from
// ammoAtEntryAll), attribution completeness, dominant source, delivery.
// Delivery: a production batch counts as delivered when its recipient
// later appears as a fighter (lead or ally) in a wave-4+ meeting with
// ammo attributed to that batch's source. (Approximate at source level:
// the FIFO shares at the meeting name the source, not the batch id —
// a batch is delivered when source-matching units are present at a
// later meeting for that recipient.)
function ledgerStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0, ledgerFiles: 0,
    batchesBySource: {}, unitsBySource: {},
    otherEvents: 0, otherUnits: 0,
    unattributedSpend: 0, unattributedSpendUnits: 0,
    transfers: 0, spends: 0, spendUnits: 0,
    counters: { homeDutyBatches: 0, homeDutyCalls: 0, departureCalls: 0,
      departureCraftAttempts: 0, departureCraftOk: 0, departureStones: 0,
      departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
    meetingsByVid: {}, // vid -> [{day, sources:[{source,units}]}] wave-4+ entries
    deliveredBatchesBySource: {}, deliveredUnitsBySource: {},
    unitsAtEntryBySource: {}, attributionCompleteness: null, dominantSource: null, dominantShare: null };
  const ammo = ammoAtEntryAll(dir);
  st.unitsAtEntryBySource = ammo.unitsAtEntryBySource;
  // Attribution completeness: known-source units / total units at entry.
  // 'unknown' is the only unattributed bucket; 'other' IS a known
  // (named) source — it lowers the dominant-source story, not the
  // completeness, because the units are accounted for as produced by
  // an unnamed path rather than missing from the ledger.
  const totalUnits = ammo.unitsAtEntry;
  const unknownUnits = ammo.unitsAtEntryBySource.unknown || 0;
  st.attributionCompleteness = totalUnits ? (totalUnits - unknownUnits) / totalUnits : null;
  // Dominant source among known-source units at entry.
  let bestSrc = null, bestUnits = 0, knownUnits = 0;
  for (const k of Object.keys(ammo.unitsAtEntryBySource)) {
    if (k === 'unknown') continue;
    knownUnits += ammo.unitsAtEntryBySource[k];
    if (ammo.unitsAtEntryBySource[k] > bestUnits) { bestUnits = ammo.unitsAtEntryBySource[k]; bestSrc = k; }
  }
  st.dominantSource = bestSrc;
  st.dominantShare = knownUnits ? bestUnits / knownUnits : null;
  // Per-seed ledger aggregation + meeting index for delivery.
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    if (!d || typeof d !== 'object') continue;
    st.valid++;
    const led = d.ammoLedger;
    if (!led) continue;
    st.ledgerFiles++;
    for (const ev of (led.events || [])) {
      if (ev.kind !== 'production') continue;
      st.batchesBySource[ev.source] = (st.batchesBySource[ev.source] || 0) + 1;
      st.unitsBySource[ev.source] = (st.unitsBySource[ev.source] || 0) + (ev.units | 0);
    }
    st.otherEvents += (led.other || []).length;
    st.otherUnits += ((led.other || []).reduce(function (a, o) { return a + (o.units | 0); }, 0));
    st.unattributedSpend += (led.unattributedSpend || []).length;
    st.unattributedSpendUnits += ((led.unattributedSpend || []).reduce(function (a, o) { return a + (o.units | 0); }, 0));
    st.transfers += (led.transfers || []).length;
    st.spends += (led.spends || []).length;
    st.spendUnits += ((led.spends || []).reduce(function (a, o) { return a + (o.units | 0); }, 0));
    const c = led.counters || {};
    for (const k of Object.keys(st.counters)) st.counters[k] += (c[k] | 0);
    for (const r of (d.v4encounters || [])) {
      if ((r.wave | 0) < 4) continue;
      const addMeeting = function (vid, prov, ammoAtEntry) {
        if (!vid) return;
        // Keyed by seed|vid: vid is a NAME-based id and recurs across
        // villages — a bare vid would match a batch in one seed to a
        // meeting in another (11 name collisions on the craftgate band).
        const k = d.seed + '|' + vid;
        if (!st.meetingsByVid[k]) st.meetingsByVid[k] = [];
        st.meetingsByVid[k].push({ day: r.day, sources: (prov || []).slice(), ammoAtEntry: ammoAtEntry | 0 });
      };
      addMeeting(r.vid, r.ammoProv || [], r.ammoAtEntry | 0);
      for (const a of (r.alliesAmmo || [])) addMeeting(a.vid, a.prov || [], a.ammoAtEntry | 0);
    }
    // Delivery: for each production event, a later meeting for the
    // same vid with source-matching units at entry.
    for (const ev of (led.events || [])) {
      if (ev.kind !== 'production') continue;
      const meets = st.meetingsByVid[d.seed + '|' + ev.vid] || [];
      let delivered = false;
      for (const m of meets) {
        if (m.day < ev.day) continue;
        for (const sh of (m.sources || [])) {
          if (sh.source === ev.source && (sh.units | 0) > 0) { delivered = true; break; }
        }
        if (delivered) break;
      }
      if (delivered) {
        st.deliveredBatchesBySource[ev.source] = (st.deliveredBatchesBySource[ev.source] || 0) + 1;
        st.deliveredUnitsBySource[ev.source] = (st.deliveredUnitsBySource[ev.source] || 0) + (ev.units | 0);
      }
    }
  }
  st.ammo = ammo;
  return st;
}

// ledgerHash(d): canonical hash of one seed's ledger events + encounter
// ammo fields — the determinism re-run check (prereg §2). Two runs of
// the same seed under identical env must hash equal: the ledger wraps
// draw no RNG.
function ledgerHash(d) {
  const crypto = require('crypto');
  const canon = { events: (d.ammoLedger || {}).events || [],
    encounters: ((d.v4encounters || []).map(function (r) {
      return { day: r.day, vid: r.vid, mid: r.mid, origin: r.origin || null,
        rangedId: r.rangedId || null, ammoAtEntry: r.ammoAtEntry | 0,
        ammoProv: r.ammoProv || [], alliesAmmo: r.alliesAmmo || [],
        volleySpend: r.volleySpend || null, volley: r.volley || null,
        outcome: r.outcome || null, rounds: r.rounds | 0 };
    })) };
  return crypto.createHash('sha256').update(JSON.stringify(canon)).digest('hex');
}

function judgeDiag(pair, ammo, ledger) {
  // Frozen prereg §2 bars (single leg). pair = pair-inclusive legStats.
  const bars = [];
  const poolOk = pair.meetings >= 10;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'pair-inclusive engaged wave-4+ meetings: ' + pair.meetings + ' (floor 10)' });
  const mechRate = ammo.rate;
  const mechPass = mechRate != null && mechRate >= 0.70;
  bars.push({ id: 'mechanism-ammo-at-entry', pass: mechRate != null,
    detail: 'ammo-at-entry (all origins, lead+allies): ' + (mechRate == null ? 'n/a' : mechRate.toFixed(3)) +
      ' (' + ammo.withAmmo + '/' + ammo.ranged + ' ranged-at-entry fighters; by origin ' +
      Object.keys(ammo.byOrigin).sort().map(function (k) { const b = ammo.byOrigin[k]; return k + ' ' + b.withAmmo + '/' + b.ranged; }).join(', ') +
      ') vs bar 0.70 — RE-MEASURE, reported not judged (the DIAG measures the bar, it does not pass/fail on it)' });
  const comp = ledger.attributionCompleteness;
  const compPass = comp != null && comp >= 0.90;
  bars.push({ id: 'attribution-completeness', pass: compPass,
    detail: 'known-source units at entry / total units at entry: ' + (comp == null ? 'n/a' : comp.toFixed(3)) +
      ' (' + (ammo.unitsAtEntry - (ammo.unitsAtEntryBySource.unknown || 0)) + '/' + ammo.unitsAtEntry + ' units; unknown ' + (ammo.unitsAtEntryBySource.unknown || 0) + ') (bar >= 0.90)' });
  const domShare = ledger.dominantShare;
  const domOk = domShare != null && domShare >= 0.50;
  const nonStartingUnits = Object.keys(ammo.unitsAtEntryBySource).reduce(function (acc, k) {
    if (k === 'unknown' || k === 'starting-kit') return acc;
    return acc + (ammo.unitsAtEntryBySource[k] | 0);
  }, 0);
  const noSourceDelivers = nonStartingUnits < 10 && (mechRate == null || mechRate < 0.70);
  bars.push({ id: 'dominant-source-or-no-delivery', pass: domOk || noSourceDelivers,
    detail: 'dominant source at entry: ' + (ledger.dominantSource || 'none') + ' share ' + (domShare == null ? 'n/a' : domShare.toFixed(3)) +
      ' (bar >= 0.50) OR no-source-delivers: non-starting-kit units at entry ' + nonStartingUnits + ' (needs < 10) AND ammo-at-entry ' +
      (mechRate == null ? 'n/a' : mechRate.toFixed(3)) + ' (needs < 0.70) => ' + (noSourceDelivers ? 'PROVEN' : 'not proven') });
  let verdict = 'DIAG-NO-GO';
  let kind = '';
  if (!poolOk) { verdict = 'DIAG-NO-GO'; kind = 'THIN-POOL'; }
  else if (compPass && (domOk || noSourceDelivers)) { verdict = 'DIAG-GO'; kind = noSourceDelivers && !domOk ? 'NO-SOURCE-DELIVERS' : 'DOMINANT-SOURCE'; }
  else if (!compPass) { verdict = 'DIAG-NO-GO'; kind = 'ATTRIBUTION'; }
  else { verdict = 'DIAG-NO-GO'; kind = 'NO-DOMINANT-SOURCE'; }
  return { verdict: verdict, kind: kind, bars: bars,
    mechanismRate: mechRate, dominantSource: ledger.dominantSource, dominantShare: domShare,
    nonStartingUnitsAtEntry: nonStartingUnits, noSourceDelivers: noSourceDelivers };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'launchpartyOn', 'fightally2On', 'bowopenOn',
    'meetings', 'wins', 'kills', 'losses', 'vDie', 'vFlee', 'mFlee',
    'winShare', 'killShare', 'funnel', 'byOutcome', 'gateXOutcome',
    'gateAvoidShare', 'gateNullShare', 'gateSeekShare',
    'lossGateNull', 'lossGateAvoid', 'lossGateSeek',
    'monsterByOutcome', 'dmgShareMean', 'dmgShareByOutcome',
    'roundsMean', 'vTakenMean',
    'dmgPerRoundMean', 'volleyFired', 'volleyFireShare', 'volleyDmgMean',
    'rangedAtEntry', 'rangedAtEntryShare', 'bowOpen', 'bowOpenStagedVids',
    'spearSeen', 'spearPassed', 'spearPassRate', 'spearCountersKnown', 'spearFiles',
    'starvation', 'starvationVillager', 'medianDays', 'communityLost',
    'national', 'seedWins', 'wave4', 'wave5', 'scaleRanks']) o[k] = st[k];
  return o;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-aidammo-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  function mkSeed(o) {
    return Object.assign({ seed: 1, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [], launchpartyOn: true, fightally2On: true,
      deaths: [], daily: [], samples: { villagers: [] },
      v4departs: [], v4gates: [], v4encounters: [],
      ammoLedger: { events: [], other: [], unattributedSpend: [], transfers: [], spends: [],
        counters: { homeDutyBatches: 0, homeDutyCalls: 0, departureCalls: 0, departureCraftAttempts: 0, departureCraftOk: 0, departureStones: 0, departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
        finalProv: {} } }, o);
  }
  // Seed 1: encounters across origins; lead + allies with provenance.
  const seed1 = mkSeed({
    v4encounters: [
      // expedition lead bow 5 arrows (home-duty 3 + starting-kit 2), ally sling 0 stones
      { day: 20, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1'], outcome: 'vKill', rounds: 5, mDealt: 500, mHpStart: 1000, vTaken: 100, rangedId: 'bow', ammoAtEntry: 5, ammoProv: [{ source: 'home-duty', units: 3 }, { source: 'starting-kit', units: 2 }], alliesAmmo: [{ vid: 'c1', rangedId: 'sling', ammoId: 'stone', ammoAtEntry: 0, prov: [], spent: null }], volley: { shots: 3, hits: 2, dmg: 34 }, log: [] },
      // aid lead crossbow 0 bolts (empty quiver), no allies
      { day: 21, vid: 'h2', mid: 'eulogy', wave: 4, origin: 'aid', allyVids: [], outcome: 'vFlee', rounds: 2, mDealt: 71, mHpStart: 1311, vTaken: 70, rangedId: 'crossbow', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
      // world-tick lead spear (no ammo id — never an empty quiver)
      { day: 22, vid: 'h3', mid: 'reunion', wave: 4, origin: 'world-tick', allyVids: [], outcome: 'vDie', rounds: 1, mDealt: 0, mHpStart: 900, vTaken: 900, rangedId: 'hunting_spear', ammoAtEntry: 0, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
      // world-tick lead bow 4 arrows, provenance MISSING (stale queue) — unknown units
      { day: 23, vid: 'h4', mid: 'suburb', wave: 4, origin: 'world-tick', allyVids: [], outcome: 'evade', rounds: 0, mDealt: 0, mHpStart: 1000, vTaken: 0, rangedId: 'bow', ammoAtEntry: 4, ammoProv: [], alliesAmmo: [], volley: null, log: [] },
      // wave 3 — excluded from the wave-4+ population
      { day: 24, vid: 'h1', mid: 'gavel', wave: 3, origin: 'expedition', allyVids: [], outcome: 'vKill', rounds: 4, mDealt: 300, mHpStart: 400, vTaken: 50, rangedId: 'bow', ammoAtEntry: 5, ammoProv: [{ source: 'home-duty', units: 5 }], alliesAmmo: [], volley: null, log: [] },
    ],
    ammoLedger: { events: [
      { seq: 1, day: 1, kind: 'production', vid: 'h1', ammoId: 'arrow', units: 2, source: 'starting-kit', loc: 'carried' },
      { seq: 2, day: 10, kind: 'production', vid: 'h1', ammoId: 'arrow', units: 5, source: 'home-duty', loc: 'carried' },
      { seq: 3, day: 12, kind: 'production', vid: 'h2', ammoId: 'bolt', units: 5, source: 'departure-craft', loc: 'carried' },
    ], other: [], unattributedSpend: [], transfers: [], spends: [],
      counters: { homeDutyBatches: 1, homeDutyCalls: 3, departureCalls: 2, departureCraftAttempts: 1, departureCraftOk: 1, departureStones: 0, departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
      finalProv: {} },
  });
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed1));
  const seed2 = mkSeed({ seed: 2,
    v4encounters: [
      { day: 30, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: [], outcome: 'vKill', rounds: 5, mDealt: 600, mHpStart: 1000, vTaken: 80, rangedId: 'bow', ammoAtEntry: 2, ammoProv: [{ source: 'starting-kit', units: 2 }], alliesAmmo: [], volley: { shots: 2, hits: 2, dmg: 20 }, log: [] },
    ],
    ammoLedger: { events: [
      { seq: 1, day: 1, kind: 'production', vid: 'h1', ammoId: 'arrow', units: 2, source: 'starting-kit', loc: 'carried' },
    ], other: [], unattributedSpend: [], transfers: [], spends: [],
      counters: { homeDutyBatches: 0, homeDutyCalls: 1, departureCalls: 1, departureCraftAttempts: 0, departureCraftOk: 0, departureStones: 0, departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
      finalProv: {} },
  });
  fs.writeFileSync(path.join(dir, 's2.json'), JSON.stringify(seed2));
  // Seed 3: NAMESAKE — vid 'h1' again, a different person in a
  // different village. This h1 made a home-duty batch but NEVER met a
  // wave-4 monster. Delivery must NOT match seed 3's batch to seed 1's
  // h1 meeting (same name, different village).
  const seed3 = mkSeed({ seed: 3, v4encounters: [],
    ammoLedger: { events: [
      { seq: 1, day: 5, kind: 'production', vid: 'h1', ammoId: 'arrow', units: 5, source: 'home-duty', loc: 'carried' },
    ], other: [], unattributedSpend: [], transfers: [], spends: [],
      counters: { homeDutyBatches: 1, homeDutyCalls: 3, departureCalls: 0, departureCraftAttempts: 0, departureCraftOk: 0, departureStones: 0, departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
      finalProv: {} },
  });
  fs.writeFileSync(path.join(dir, 's3.json'), JSON.stringify(seed3));

  // ---- ammoAtEntryAll ----
  const a = ammoAtEntryAll(dir);
  // Fighters: s1 lead bow(5) + ally sling(0) + aid crossbow(0) + spear + world-tick bow(4) = 5; s2 lead bow(2) = 1. Total 6.
  check('fighters counted lead+allies (6)', a.fighters === 6, 'got ' + a.fighters);
  // Ranged: all 6 carry a ranged id (spear counts as ranged-at-entry).
  check('ranged at entry 6/6', a.ranged === 6, 'got ' + a.ranged);
  // With ammo: bow 5, bow 4, bow 2 = 3 of 6.
  check('ammo-at-entry rate 3/6 = 0.50', a.withAmmo === 3 && Math.abs(a.rate - 0.5) < 1e-9, JSON.stringify({ w: a.withAmmo, r: a.rate }));
  // Capable-only: spears excluded — 5 capable (4 bows + crossbow... wait: bows x3, crossbow x1, sling x1 = 5), with ammo 3.
  check('capable-only rate 3/5 = 0.60 (spear excluded)', a.capableFighters === 5 && a.capableWithAmmo === 3 && Math.abs(a.capableRate - 0.6) < 1e-9, JSON.stringify({ c: a.capableFighters, w: a.capableWithAmmo, r: a.capableRate }));
  check('spear fighters counted separately (1)', a.spearFighters === 1, 'got ' + a.spearFighters);
  check('by-origin expedition 2/3 (bow5 + sling0 + bow2)', a.byOrigin.expedition.ranged === 3 && a.byOrigin.expedition.withAmmo === 2, JSON.stringify(a.byOrigin.expedition));
  check('by-origin aid 0/1', a.byOrigin.aid.ranged === 1 && a.byOrigin.aid.withAmmo === 0, JSON.stringify(a.byOrigin.aid));
  check('by-origin world-tick 1/2 (bow4 yes, spear no)', a.byOrigin['world-tick'].ranged === 2 && a.byOrigin['world-tick'].withAmmo === 1, JSON.stringify(a.byOrigin['world-tick']));
  // Units at entry: 5 + 0 + 0 + 0 + 4 + 2 = 11. By source: home-duty 3, starting-kit 2+2=4, unknown 4 (stale queue on the world-tick bow).
  check('units at entry 11', a.unitsAtEntry === 11, 'got ' + a.unitsAtEntry);
  check('units by source home-duty 3 / starting-kit 4 / unknown 4',
    a.unitsAtEntryBySource['home-duty'] === 3 && a.unitsAtEntryBySource['starting-kit'] === 4 && a.unitsAtEntryBySource.unknown === 4,
    JSON.stringify(a.unitsAtEntryBySource));
  check('wave-3 encounter excluded from the population', a.fighters === 6, 'got ' + a.fighters);

  // ---- ledgerStats ----
  const L = ledgerStats(dir);
  check('batches by source: starting-kit 2, home-duty 2, departure-craft 1',
    L.batchesBySource['starting-kit'] === 2 && L.batchesBySource['home-duty'] === 2 && L.batchesBySource['departure-craft'] === 1,
    JSON.stringify(L.batchesBySource));
  check('units by source: starting-kit 4, home-duty 10, departure-craft 5',
    L.unitsBySource['starting-kit'] === 4 && L.unitsBySource['home-duty'] === 10 && L.unitsBySource['departure-craft'] === 5,
    JSON.stringify(L.unitsBySource));
  check('counters aggregate (homeDutyBatches 2, departureCraftOk 1)',
    L.counters.homeDutyBatches === 2 && L.counters.departureCraftOk === 1 && L.counters.departureCraftAttempts === 1,
    JSON.stringify(L.counters));
  check('attribution completeness 7/11 = 0.636', Math.abs(L.attributionCompleteness - 7 / 11) < 1e-9, 'got ' + L.attributionCompleteness);
  check('dominant source starting-kit share 4/7',
    L.dominantSource === 'starting-kit' && Math.abs(L.dominantShare - 4 / 7) < 1e-9,
    JSON.stringify({ s: L.dominantSource, sh: L.dominantShare }));
  check('delivery: home-duty batch delivered (h1 met wave-4 with home-duty units)',
    L.deliveredBatchesBySource['home-duty'] === 1, JSON.stringify(L.deliveredBatchesBySource));
  check('delivery: namesake seed-3 h1 batch NOT delivered (no meeting in its own seed)',
    L.deliveredBatchesBySource['home-duty'] === 1, JSON.stringify(L.deliveredBatchesBySource));
  check('delivery: departure-craft batch NOT delivered (h2 met with 0 bolts)',
    (L.deliveredBatchesBySource['departure-craft'] || 0) === 0, JSON.stringify(L.deliveredBatchesBySource));

  // ---- judgeDiag shapes ----
  function mkPair(o) { return Object.assign({ meetings: 12 }, o); }
  function mkAmmo(o) { return Object.assign({ rate: 0.6, ranged: 40, withAmmo: 24, unitsAtEntry: 100, unitsAtEntryBySource: { 'home-duty': 60, 'starting-kit': 40 }, byOrigin: {} }, o); }
  function mkLedger(o) { return Object.assign({ attributionCompleteness: 1.0, dominantSource: 'home-duty', dominantShare: 0.6 }, o); }
  let j = judgeDiag(mkPair({}), mkAmmo({}), mkLedger({}));
  check('judge DIAG-GO dominant-source (pool 12, completeness 1.0, dominant 0.60)',
    j.verdict === 'DIAG-GO' && j.kind === 'DOMINANT-SOURCE' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judgeDiag(mkPair({}), mkAmmo({ rate: 0.4, unitsAtEntryBySource: { 'starting-kit': 90, 'home-duty': 2 } }),
    mkLedger({ dominantSource: 'starting-kit', dominantShare: 0.9 }));
  check('judge DIAG-GO via starting-kit dominance still counts (dominant is dominant)',
    j.verdict === 'DIAG-GO', JSON.stringify(j));
  // No-source-delivers: non-starting-kit units at entry < 10 AND rate < 0.70, no dominant source.
  j = judgeDiag(mkPair({}), mkAmmo({ rate: 0.3, withAmmo: 12, ranged: 40, unitsAtEntry: 50, unitsAtEntryBySource: { 'starting-kit': 45, 'home-duty': 5 } }),
    mkLedger({ dominantSource: 'starting-kit', dominantShare: 0.9 }));
  check('judge kind distinguishes: dominant starting-kit still DIAG-GO (dominant rule first)',
    j.verdict === 'DIAG-GO', JSON.stringify(j));
  j = judgeDiag(mkPair({ meetings: 3 }), mkAmmo({}), mkLedger({}));
  check('judge DIAG-NO-GO thin-pool (3 meetings)', j.verdict === 'DIAG-NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judgeDiag(mkPair({}), mkAmmo({}), mkLedger({ attributionCompleteness: 0.5 }));
  check('judge DIAG-NO-GO attribution (completeness 0.50)', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION' && !j.bars[2].pass, JSON.stringify(j));
  j = judgeDiag(mkPair({}), mkAmmo({ rate: 0.3, unitsAtEntry: 50, unitsAtEntryBySource: { 'starting-kit': 20, 'home-duty': 15, 'loot': 15 } }),
    mkLedger({ dominantSource: 'starting-kit', dominantShare: 0.4 }));
  check('judge DIAG-NO-GO no-dominant-source (share 0.40, non-starting 30 units)',
    j.verdict === 'DIAG-NO-GO' && j.kind === 'NO-DOMINANT-SOURCE' && !j.bars[3].pass, JSON.stringify(j));
  // No-source-delivers PROVEN when no dominant source AND non-starting < 10 AND rate < 0.70.
  j = judgeDiag(mkPair({}), mkAmmo({ rate: 0.3, withAmmo: 12, ranged: 40, unitsAtEntry: 50, unitsAtEntryBySource: { 'starting-kit': 41, 'home-duty': 5, 'loot': 4 } }),
    mkLedger({ dominantSource: 'starting-kit', dominantShare: 41 / 50 }));
  check('no-source-delivers flag is ALSO true when production delivers almost nothing (both routes agree)',
    j.noSourceDelivers === true, JSON.stringify(j));
  const j2 = judgeDiag(mkPair({}), mkAmmo({ rate: 0.3, withAmmo: 12, ranged: 40, unitsAtEntry: 50, unitsAtEntryBySource: { 'starting-kit': 41, 'home-duty': 5, 'loot': 4 } }),
    mkLedger({ dominantSource: null, dominantShare: null }));
  check('mechanism bar is reported, never a verdict bar (bar 1 passes as a report)',
    j2.bars[1].pass === true && j2.bars[1].detail.indexOf('RE-MEASURE') !== -1, JSON.stringify(j2.bars[1]));

  // ---- ledgerHash ----
  const h1 = ledgerHash(seed1);
  const h2 = ledgerHash(JSON.parse(JSON.stringify(seed1)));
  check('ledgerHash stable on identical input', h1 === h2, h1 + ' vs ' + h2);
  const seed1b = JSON.parse(JSON.stringify(seed1));
  seed1b.ammoLedger.events[1].units = 4;
  check('ledgerHash changes when a batch changes', ledgerHash(seed1b) !== h1, 'hash did not change');
  const seed1c = JSON.parse(JSON.stringify(seed1));
  seed1c.v4encounters[0].ammoAtEntry = 4;
  check('ledgerHash changes when an entry count changes', ledgerHash(seed1c) !== h1, 'hash did not change');

  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-aidammo-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-aidammo-a.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const pair = legStats(dir, { minPlanParty: 1 });
  const trio = legStats(dir);
  const ammo = ammoAtEntryAll(dir);
  const ledger = ledgerStats(dir);
  const j = judgeDiag(pair, ammo, ledger);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars,
    mechanismRate: j.mechanismRate, dominantSource: j.dominantSource, dominantShare: j.dominantShare,
    nonStartingUnitsAtEntry: j.nonStartingUnitsAtEntry, noSourceDelivers: j.noSourceDelivers,
    pair: summarize(pair), trio: summarize(trio), ammo: ammo, ledger: ledger,
    pairMeetings: pair.meetingsDetail, trioMeetings: trio.meetingsDetail };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars,
    mechanismRate: result.mechanismRate, dominantSource: result.dominantSource, dominantShare: result.dominantShare,
    pair: summarize(pair), trio: summarize(trio),
    ammoRate: ammo.rate, ammoCapableRate: ammo.capableRate, ammoByOrigin: ammo.byOrigin,
    unitsAtEntryBySource: ammo.unitsAtEntryBySource,
    batchesBySource: ledger.batchesBySource, unitsBySource: ledger.unitsBySource,
    deliveredBatchesBySource: ledger.deliveredBatchesBySource,
    attributionCompleteness: ledger.attributionCompleteness,
    otherUnits: ledger.otherUnits, unattributedSpendUnits: ledger.unattributedSpendUnits }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { legStats: legStats, judgeDiag: judgeDiag, parseStrikes: parseStrikes, parseAbilityTokens: parseAbilityTokens, ammoAtEntryAll: ammoAtEntryAll, ledgerStats: ledgerStats, ledgerHash: ledgerHash, isAmmoCapable: isAmmoCapable, summarize: summarize };
