// analyze-bowopen-a.js — analyzer + judge, arm sim-bowopen-a.
// LEVER: the ranged-opening half of the winning launched-party shape
// (finding #2544). Judges a fresh pilot band from the bowopen driver
// format (bowopen-driver-a.js corpora: v4encounters + v4gates +
// v4departs + samples.villagers + daily rosters + bowOpen counters).
//
// Population (per leg, PRIMARY): launched wave-4+ expedition meetings —
// v4encounters row with origin 'expedition', wave >= 4, joined to its
// v4gates row (same day+vid+mid, first match) with a non-empty
// planParty — restricted to PAIR-INCLUSIVE launches (|planParty| >= 1,
// i.e. the full launched party is size >= 2), the launched party
// PRESENT at the meeting (corrected arrival, piecewise: |planParty|
// <= 2 means planParty ⊆ allyVids; |planParty| = 3 means allyVids ⊆
// planParty with |allyVids| = 2 — the engine's 2-ally cap), and
// ENGAGED (rounds > 0; evades join nobody and are excluded).
//
// Primary: kill share = vKill / n — the party kills the monster —
// AND mean damage/round (mDealt/rounds). Win share (vKill + mFlee)
// is reported beside the kill share, never substituted. The trio+
// population (minPlanParty=2) is reported beside the primary, never
// substituted (thin on 8 seeds: fightcap-a n=3, dmg-a n=1).
//
// Mechanism (from the fight engine, never snapshots): each encounter
// row carries rec.volley (shots/hits/dmg) + rangedId/ammoAtEntry at
// fight entry, and each corpus file carries village.bowOpen staging
// counters. The analyzer aggregates volley-fire share, mean volley
// damage, ranged-at-entry share, and staging by source — these
// explain the verdict, never re-score it.
//
// SPEARGATE gate replication (sim-instrument-a, blank #4): each
// corpus file carries the driver's explicit per-seed spearSeen /
// spearPassed (see the driver header for the definitions: a
// departure that reaches the spear gate vs one the gate lets
// through). The analyzer aggregates them per leg into spearSeen /
// spearPassed / spearPassRate. A leg is KNOWN only when EVERY valid
// file carries the counters; any leg with a file missing them
// reports unknown (null, spearCountersKnown false) — never a partial
// sum, never 0, never a faked 1.0. Pre-instrument corpora
// (bowopen-recheck, written before the driver emitted the fields)
// therefore report unknown on both legs. The counters explain the
// gate-replication check; they are not a verdict bar, and the
// bowopen-recheck NO-GO stands as judged.
//
// Per-meeting decomposition (meetingsDetail): party size/composition,
// each member's gear (armed/armored/armorP from the gate row), monster
// kind + HP (mHpStart), damage dealt (mDealt — PLUS per-fighter strike
// totals parsed from the encounter log lines), damage taken (vTaken),
// rounds, damage/round, outcome, gate result/reason (should the gate
// have held them back), abilities (nearest samples.villagers snapshot
// at or before the meeting day, plus ability tokens named in the log
// lines), volley + ranged kit at entry.
//
// Usage:
//   node scripts/analyze-bowopen-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge]
//   node scripts/analyze-bowopen-a.js --selftest
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

function judge(ctl, arm) {
  // PRIMARY population is pair-inclusive (minPlanParty=1): the caller
  // passes the pair legStats. Frozen bars (prereg): kill share >= 0.25
  // AND mean damage/round >= 70, pool floor arm n >= 10, cost bars.
  const bars = [];
  const poolOk = arm.meetings >= 10;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'engaged launched-party meetings (pair-inclusive, present): arm ' + arm.meetings + ' (floor 10); ctl ' + ctl.meetings });
  const killPass = arm.killShare != null && arm.killShare >= 0.25;
  bars.push({ id: 'kill-share', pass: killPass,
    detail: 'arm kill share ' + (arm.killShare == null ? 'n/a' : arm.killShare.toFixed(3)) + ' (' + arm.kills + '/' + arm.meetings + ', wins ' + arm.wins + ', mFlee ' + arm.mFlee + ', vDie ' + arm.vDie + ', vFlee ' + arm.vFlee + ') vs ctl ' + (ctl.killShare == null ? 'n/a' : ctl.killShare.toFixed(3)) + ' (' + ctl.kills + '/' + ctl.meetings + ') (bar arm>=0.25)' });
  const dprPass = arm.dmgPerRoundMean != null && arm.dmgPerRoundMean >= 70;
  bars.push({ id: 'damage-per-round', pass: dprPass,
    detail: 'arm mean damage/round ' + (arm.dmgPerRoundMean == null ? 'n/a' : arm.dmgPerRoundMean.toFixed(1)) + ' vs ctl ' + (ctl.dmgPerRoundMean == null ? 'n/a' : ctl.dmgPerRoundMean.toFixed(1)) + ' (bar arm>=70; winning shape ~111, typical ~40-60)' });
  const commPass = arm.communityLost / 8 <= ctl.communityLost / 8 + 0.125 + 1e-9;
  bars.push({ id: 'cost-community-loss', pass: commPass,
    detail: 'community loss arm ' + arm.communityLost + '/8 vs ctl ' + ctl.communityLost + '/8 (bar arm share <= ctl share + 0.125, i.e. at most ' + (ctl.communityLost + 1) + ' villages)' });
  const starvPass = arm.starvation <= ctl.starvation + 2 && arm.starvationVillager <= ctl.starvationVillager + 2;
  bars.push({ id: 'cost-starvation', pass: starvPass,
    detail: 'starvation totals arm ' + arm.starvation + ' vs ctl ' + ctl.starvation + '; villager arm ' + arm.starvationVillager + ' vs ctl ' + ctl.starvationVillager + ' (bar arm<=ctl+2 both)' });
  const medPass = ctl.medianDays == null || arm.medianDays == null || arm.medianDays >= 0.8 * ctl.medianDays;
  bars.push({ id: 'cost-median', pass: medPass,
    detail: 'median survival arm ' + arm.medianDays + 'd vs ctl ' + ctl.medianDays + 'd (bar arm>=0.8x ctl)' });
  // Mechanism check (explains, never re-scores): did the opening fire?
  const mechFired = arm.volleyFireShare != null && arm.volleyFireShare >= 0.50;
  bars.push({ id: 'mechanism-volley-fired', pass: mechFired,
    detail: 'volley fired on ' + arm.volleyFired + '/' + arm.meetings + ' arm meetings (share ' + (arm.volleyFireShare == null ? 'n/a' : arm.volleyFireShare.toFixed(2)) + ', mean volley dmg ' + (arm.volleyDmgMean == null ? 'n/a' : arm.volleyDmgMean.toFixed(1)) + ', ranged-at-entry ' + (arm.rangedAtEntryShare == null ? 'n/a' : arm.rangedAtEntryShare.toFixed(2)) + ') — mechanism check, not a verdict bar' });
  let verdict = 'NO-GO';
  let kind = '';
  if (!poolOk) {
    // Thin pool: DIAG-GO only if the opening fired AND the kill share
    // is decisively below the bar on the available meetings.
    if (mechFired && arm.killShare != null && arm.killShare <= 0.10) { verdict = 'DIAG-GO'; kind = 'THIN-POOL-DECISIVE'; }
    else { verdict = 'NO-GO'; kind = 'THIN-POOL'; }
  } else if (bars.every(function (b) { return b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  function mkSeed(o) {
    return Object.assign({ seed: 1, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [], launchpartyOn: true, fightally2On: true,
      deaths: [], daily: [{ day: 1, roster: [{ vid: 'h1', name: 'Holly One' }, { vid: 'c1', name: 'Cora A' }, { vid: 'c2', name: 'Cid B' }, { vid: 's1', name: 'Sam X' }] }],
      samples: { villagers: [[1, [{ vid: 'h1', abilities: ['rage'] }, { vid: 'c1', abilities: [] }, { vid: 'c2', abilities: ['stare_down'] }]]] },
      v4departs: [], v4gates: [], v4encounters: [] }, o);
  }
  const seed = mkSeed({
    bowopenOn: true,
    bowOpen: { alreadyHad: 2, fromStash: 1, fromArmory: 0, crafted: 3, craftedFail: 1, noSource: 4 },
    bowOpenStagedVids: 5,
    v4gates: [
      { day: 20, vid: 'h1', mid: 'audit', planParty: ['c1', 'c2'], sensed: ['h1', 'c1', 'c2'], result: 'null', reason: null, allArmed: true, allArmored: true, gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 }, c2: { armed: true, armored: true, armorP: 10 } } },
      { day: 21, vid: 'h1', mid: 'audit', planParty: ['c1', 'c2'], sensed: ['h1', 'c1', 'c2'], result: 'avoid', reason: 'outmatched', allArmed: true, allArmored: true, gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 }, c2: { armed: true, armored: true, armorP: 10 } } },
      { day: 22, vid: 'h1', mid: 'audit', planParty: ['c1', 'c2'], sensed: ['h1', 's1', 'c2'], result: 'null', reason: null, allArmed: true, allArmored: true, gear: { h1: { armed: true, armored: true, armorP: 30 }, s1: { armed: true, armored: true, armorP: 5 }, c2: { armed: true, armored: true, armorP: 10 } } },
      { day: 23, vid: 'h1', mid: 'audit', planParty: ['c1'], sensed: ['h1', 'c1'], result: 'null', reason: null, allArmed: true, allArmored: true, gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 } } },
      { day: 24, vid: 'h1', mid: 'audit', planParty: ['c1', 'c2', 'c3'], sensed: ['h1', 'c1', 'c2'], result: 'seek', reason: 'seek', allArmed: true, allArmored: true, gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 }, c2: { armed: true, armored: true, armorP: 10 } } },
      { day: 25, vid: 'h1', mid: 'audit', planParty: ['c1', 'c2'], sensed: ['h1', 'c1', 'c2'], result: 'null', reason: null, allArmed: true, allArmored: true, gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 }, c2: { armed: true, armored: true, armorP: 10 } } },
    ],
    v4encounters: [
      // trio present, engaged, WIN by kill; fighter deals most damage
      { day: 20, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'vKill', rounds: 5, mDealt: 500, mHpStart: 1000, vTaken: 100, rangedId: 'bow', ammoAtEntry: 5, volley: { shots: 3, hits: 2, dmg: 34, ammoLeft: 2 }, log: ['R1: Holly strikes for 60 (940 left)', 'R1: Cora strikes for 20 (920 left)', 'R1: Holly\'s eyes go red. (Rage)'] },
      // trio present, engaged, LOSS by death; gate said avoid (held back, fought anyway)
      { day: 21, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'vDie', rounds: 8, mDealt: 200, mHpStart: 1000, vTaken: 900, rangedId: 'crude_bow', ammoAtEntry: 3, volley: { shots: 2, hits: 1, dmg: 15, ammoLeft: 1 }, log: ['R1: Holly strikes for 30 (970 left)'] },
      // stranger fills a seat: party NOT present -> excluded
      { day: 22, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['s1', 'c2'], allyVid: 's1', ally2Vid: 'c2', outcome: 'vKill', rounds: 4, mDealt: 500, mHpStart: 1000, vTaken: 50, log: [] },
      // pair launch: excluded (trio+ only)
      { day: 23, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1'], allyVid: 'c1', ally2Vid: null, outcome: 'vKill', rounds: 4, mDealt: 500, mHpStart: 1000, vTaken: 50, rangedId: 'bow', ammoAtEntry: 5, volley: { shots: 4, hits: 3, dmg: 51, ammoLeft: 1 }, log: [] },
      // quad launch, 2-subset present, WIN by monster flee; no ranged kit, no volley
      { day: 24, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'mFlee', rounds: 3, mDealt: 100, mHpStart: 1000, vTaken: 40, rangedId: null, ammoAtEntry: 0, volley: null, log: ['R1: Cid strikes for 10 (990 left)'] },
      // trio present but evade: excluded (not engaged)
      { day: 25, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: null, ally2Vid: null, outcome: 'evade', rounds: 0, mDealt: 0, mHpStart: 1000, vTaken: 0, log: [] },
      // no gate row: unjoined, excluded
      { day: 26, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'vKill', rounds: 2, mDealt: 10, mHpStart: 500, vTaken: 0, log: [] },
    ],
  });
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed));
  const st = legStats(dir);
  check('population is 3 (kill win, death loss, mFlee win)', st.meetings === 3, 'got ' + st.meetings);
  check('win share 2/3 (vKill + mFlee)', st.wins === 2 && Math.abs(st.winShare - 2 / 3) < 1e-9, JSON.stringify({ w: st.wins, s: st.winShare }));
  check('kill share 1/3', st.kills === 1 && Math.abs(st.killShare - 1 / 3) < 1e-9, 'got ' + st.killShare);
  check('loss split vDie 1, vFlee 0', st.vDie === 1 && st.vFlee === 0, JSON.stringify({ d: st.vDie, f: st.vFlee }));
  check('funnel: pair 1, absent 1, evade 1, unjoined 1', st.funnel.pairLaunch === 1 && st.funnel.partyAbsent === 1 && st.funnel.evadeExcluded === 1 && st.funnel.unjoined === 1, JSON.stringify(st.funnel));
  check('loss gate avoid 1 (gate held, fought anyway), null 0', st.lossGateAvoid === 1 && st.lossGateNull === 0, JSON.stringify({ a: st.lossGateAvoid, n: st.lossGateNull }));
  check('gate crosstab: null has vKill, seek has mFlee, avoid has vDie', st.gateXOutcome['null'] && st.gateXOutcome['null'].vKill === 1 && st.gateXOutcome.seek.mFlee === 1 && st.gateXOutcome.avoid.vDie === 1, JSON.stringify(st.gateXOutcome));
  check('min armorP 10 on all three (c2 weakest)', st.meetingsDetail.every(function (m) { return m.minArmorP === 10; }), JSON.stringify(st.meetingsDetail.map(function (m) { return m.minArmorP; })));
  check('fighter damage share 0.75 on the kill (60/80 parsed)', Math.abs(st.meetingsDetail[0].fighterDmgShare - 0.75) < 1e-9, 'got ' + st.meetingsDetail[0].fighterDmgShare);
  check('abilities per member 2/3 on the kill meeting', Math.abs(st.meetingsDetail[0].abilitiesPerMember - 2 / 3) < 1e-9, 'got ' + st.meetingsDetail[0].abilitiesPerMember);
  check('ability token Rage parsed from the kill log', st.meetingsDetail[0].abilityTokens.indexOf('Rage') !== -1, JSON.stringify(st.meetingsDetail[0].abilityTokens));
  check('dmg share by outcome: vKill 0.5, vDie 0.2, mFlee 0.1', Math.abs(st.dmgShareByOutcome.vKill - 0.5) < 1e-9 && Math.abs(st.dmgShareByOutcome.vDie - 0.2) < 1e-9 && Math.abs(st.dmgShareByOutcome.mFlee - 0.1) < 1e-9, JSON.stringify(st.dmgShareByOutcome));
  check('monster by outcome: audit 2 win 1 loss', st.monsterByOutcome.audit.win === 2 && st.monsterByOutcome.audit.loss === 1, JSON.stringify(st.monsterByOutcome));
  const stPair = legStats(dir, { minPlanParty: 1 });
  check('pair-inclusive population adds the pair meeting (4 meetings, 3 wins)', stPair.meetings === 4 && stPair.wins === 3 && Math.abs(stPair.winShare - 0.75) < 1e-9, JSON.stringify({ m: stPair.meetings, w: stPair.wins, s: stPair.winShare }));
  // BOWOPEN mechanism: damage/round + volley aggregation.
  check('damage/round trio mean (500/5 + 200/8 + 100/3)/3 = 52.78', Math.abs(st.dmgPerRoundMean - (100 + 25 + 100 / 3) / 3) < 1e-9, 'got ' + st.dmgPerRoundMean);
  check('damage/round pair mean adds the 125/round pair meeting', Math.abs(stPair.dmgPerRoundMean - (100 + 25 + 100 / 3 + 125) / 4) < 1e-9, 'got ' + stPair.dmgPerRoundMean);
  check('volley fired on 2/3 trio meetings', st.volleyFired === 2 && Math.abs(st.volleyFireShare - 2 / 3) < 1e-9, JSON.stringify({ f: st.volleyFired, s: st.volleyFireShare }));
  check('volley fired on 3/4 pair meetings', stPair.volleyFired === 3 && Math.abs(stPair.volleyFireShare - 0.75) < 1e-9, JSON.stringify({ f: stPair.volleyFired, s: stPair.volleyFireShare }));
  check('mean volley dmg trio (34+15)/2 = 24.5', Math.abs(st.volleyDmgMean - 24.5) < 1e-9, 'got ' + st.volleyDmgMean);
  check('mean volley dmg pair (34+15+51)/3 = 33.33', Math.abs(stPair.volleyDmgMean - 100 / 3) < 1e-9, 'got ' + stPair.volleyDmgMean);
  check('ranged at entry on 2/3 trio, 3/4 pair', st.rangedAtEntry === 2 && stPair.rangedAtEntry === 3, JSON.stringify({ t: st.rangedAtEntry, p: stPair.rangedAtEntry }));
  check('meeting detail carries volley + ranged kit', st.meetingsDetail[0].volley && st.meetingsDetail[0].volley.dmg === 34 && st.meetingsDetail[0].rangedId === 'bow' && st.meetingsDetail[0].ammoAtEntry === 5 && Math.abs(st.meetingsDetail[0].dmgPerRound - 100) < 1e-9, JSON.stringify(st.meetingsDetail[0]));
  check('no-volley meeting carries null volley + null ranged', st.meetingsDetail[2].volley === null && st.meetingsDetail[2].rangedId === null, JSON.stringify(st.meetingsDetail[2]));
  check('bowOpen counters aggregate from the corpus', st.bowOpen.crafted === 3 && st.bowOpen.noSource === 4 && st.bowOpen.alreadyHad === 2 && st.bowOpenStagedVids === 5, JSON.stringify(st.bowOpen));
  check('bowopenOn flag recorded', st.bowopenOn['true'] === 1, JSON.stringify(st.bowopenOn));
  // SPEARGATE gate replication (sim-instrument-a): the analyzer
  // reads the driver's explicit per-seed fields only. The fixture
  // seed above carries no such fields, so it reads unknown.
  check('spear counters unknown on a corpus without the driver fields (never 0, never a faked rate)',
    st.spearSeen === null && st.spearPassed === null && st.spearPassRate === null && st.spearCountersKnown === false && st.spearFiles === 0,
    JSON.stringify({ seen: st.spearSeen, passed: st.spearPassed, rate: st.spearPassRate, known: st.spearCountersKnown, files: st.spearFiles }));
  const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-bowopen-spear-'));
  const withDir = path.join(tmp2, 'with');
  fs.mkdirSync(withDir);
  fs.writeFileSync(path.join(withDir, 's1.json'), JSON.stringify(mkSeed({ spearSeen: 6, spearPassed: 6 })));
  fs.writeFileSync(path.join(withDir, 's2.json'), JSON.stringify(mkSeed({ seed: 2, spearSeen: 4, spearPassed: 3 })));
  const stWith = legStats(withDir);
  check('spear counters aggregate across files (spearSeen 10, spearPassed 9, rate 0.9, known)',
    stWith.spearSeen === 10 && stWith.spearPassed === 9 && Math.abs(stWith.spearPassRate - 0.9) < 1e-9 && stWith.spearCountersKnown === true && stWith.spearFiles === 2,
    JSON.stringify({ seen: stWith.spearSeen, passed: stWith.spearPassed, rate: stWith.spearPassRate, known: stWith.spearCountersKnown, files: stWith.spearFiles }));
  const mixedDir = path.join(tmp2, 'mixed');
  fs.mkdirSync(mixedDir);
  fs.writeFileSync(path.join(mixedDir, 's1.json'), JSON.stringify(mkSeed({ spearSeen: 6, spearPassed: 6 })));
  fs.writeFileSync(path.join(mixedDir, 's2.json'), JSON.stringify(mkSeed({ seed: 2 })));
  const stMixed = legStats(mixedDir);
  check('spear counters unknown on a mixed leg (no partial sum)',
    stMixed.spearSeen === null && stMixed.spearPassed === null && stMixed.spearPassRate === null && stMixed.spearCountersKnown === false && stMixed.spearFiles === 1,
    JSON.stringify({ seen: stMixed.spearSeen, passed: stMixed.spearPassed, rate: stMixed.spearPassRate, known: stMixed.spearCountersKnown, files: stMixed.spearFiles }));
  const zeroDir = path.join(tmp2, 'zero');
  fs.mkdirSync(zeroDir);
  fs.writeFileSync(path.join(zeroDir, 's1.json'), JSON.stringify(mkSeed({ spearSeen: 0, spearPassed: 0 })));
  const stZero = legStats(zeroDir);
  check('spear counters known-zero is distinct from unknown (seen 0, passed 0, rate null, known)',
    stZero.spearSeen === 0 && stZero.spearPassed === 0 && stZero.spearPassRate === null && stZero.spearCountersKnown === true && stZero.spearFiles === 1,
    JSON.stringify({ seen: stZero.spearSeen, passed: stZero.spearPassed, rate: stZero.spearPassRate, known: stZero.spearCountersKnown, files: stZero.spearFiles }));
  try { fs.rmSync(tmp2, { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  // Judge shapes (pair-inclusive primary: kill share >= 0.25 AND
  // damage/round >= 70; bars: 0 pool, 1 kill, 2 dmg/round, 3 community,
  // 4 starvation, 5 median, 6 mechanism).
  function mk(o) {
    return Object.assign({ meetings: 12, wins: 6, kills: 3, mFlee: 3, vDie: 3, vFlee: 3, winShare: 0.5, killShare: 0.25, dmgPerRoundMean: 75, volleyFired: 8, volleyFireShare: 8 / 12, volleyDmgMean: 30, communityLost: 1, starvation: 0, starvationVillager: 0, medianDays: 150 }, o);
  }
  let j = judge(mk({}), mk({}));
  check('judge GO shape passes (kill 0.25 + 75/round + volley fired)', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mk({}), mk({ killShare: 2 / 12, kills: 2 }));
  check('judge NO-GO when kill share under 0.25', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mk({}), mk({ dmgPerRoundMean: 60 }));
  check('judge NO-GO when damage/round under 70', j.verdict === 'NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mk({}), mk({ meetings: 7, kills: 0, killShare: 0, volleyFired: 5, volleyFireShare: 5 / 7 }));
  check('judge DIAG-GO decisive thin pool (volley fired, kills 0)', j.verdict === 'DIAG-GO' && j.kind === 'THIN-POOL-DECISIVE', JSON.stringify(j));
  j = judge(mk({}), mk({ meetings: 7, kills: 0, killShare: 0, volleyFired: 2, volleyFireShare: 2 / 7 }));
  check('judge NO-GO thin pool when the volley did not fire', j.verdict === 'NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judge(mk({ communityLost: 1 }), mk({ communityLost: 3 }));
  check('judge NO-GO when community loss breaches ctl+0.125', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(mk({ communityLost: 1 }), mk({ communityLost: 2 }));
  check('judge GO when community loss is exactly ctl+0.125', j.verdict === 'GO' && j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(mk({}), mk({ starvation: 3 }));
  check('judge NO-GO when starvation breaches ctl+2', j.verdict === 'NO-GO' && !j.bars[4].pass, JSON.stringify(j.bars));
  console.log('analyze-bowopen-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let ctlDir = null, armDir = null, outFile = null;
  const noJudge = args.indexOf('--no-judge') !== -1;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ctl') ctlDir = args[++i];
    else if (args[i] === '--arm') armDir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!ctlDir || !armDir) { console.error('usage: analyze-bowopen-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
  const ctl = legStats(ctlDir);
  const arm = legStats(armDir);
  // PRIMARY population: pair-inclusive (minPlanParty=1) — the trio+
  // pool is thin on 8 seeds, so this is where the statistical power
  // lives; the judge reads the pair legs. Trio+ is reported beside it.
  const ctlPair = legStats(ctlDir, { minPlanParty: 1 });
  const armPair = legStats(armDir, { minPlanParty: 1 });
  const j = noJudge ? null : judge(ctlPair, armPair);
  const result = { verdict: j ? j.verdict : null, kind: j ? j.kind : null, bars: j ? j.bars : null,
    ctl: summarize(ctl), arm: summarize(arm),
    ctlPair: summarize(ctlPair), armPair: summarize(armPair),
    ctlMeetings: ctl.meetingsDetail, armMeetings: arm.meetingsDetail,
    ctlPairMeetings: ctlPair.meetingsDetail, armPairMeetings: armPair.meetingsDetail };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars, ctl: summarize(ctl), arm: summarize(arm), ctlPair: summarize(ctlPair), armPair: summarize(armPair) }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { legStats: legStats, judge: judge, parseStrikes: parseStrikes, parseAbilityTokens: parseAbilityTokens };
