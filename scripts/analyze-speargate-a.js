// analyze-speargate-a.js — analyzer + judge, arm sim-speargate-a.
// GATE FIX: ranged-gated staging checks weapon.ammo, not the slot
// (finding #2590). Judges a fresh pilot band from the speargate driver
// format (speargate-driver-a.js corpora: v4encounters + v4gates +
// v4departs + samples.villagers + daily rosters + bowOpen counters +
// bowOpenByVid).
//
// Population (per leg, PRIMARY — the mechanism): ALL staging
// departures, read from the live village.bowOpen counters at run end:
// spearSeen (equipped ranged entry is a non-ammo weapon) and
// spearPassed (the gate passed it over to the sources). The fight
// population (pair-inclusive engaged launched wave-4 meetings, as in
// bowopen) is the no-regression guardrail population, never the judge.
//
// Primary: spear-gate classification — arm spearPassed/spearSeen == 1.0
// with spearSeen >= 10, ctl spearPassed == 0, the alreadyHad/noSource
// consistency deltas within ±3, staged == 0 both legs, and the cost
// bars (kill share arm >= ctl - 0.05, damage/round arm >= 0.9x ctl,
// community loss, starvation, median survival, instrument errors 0).
// Volley share, kill share and damage/round are reported as guardrail
// context, never re-scored as the primary — the audit (prereg) shows
// the volley and pocketAmmo were ALREADY ammo-gated, so only the
// staging gate can move, and it moves the classification, not the
// volley.
//
// Usage:
//   node scripts/analyze-speargate-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge]
//   node scripts/analyze-speargate-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
// Spear ids (melee type, range 2, no ammo — src/data/items.json).
const SPEAR_IDS = new Set(['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'godslayer_spear']);
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
    senseexpedOn: {}, fightally2On: {}, bowopenOn: {}, speargateOn: {},
    meetings: 0, wins: 0, kills: 0, losses: 0, vDie: 0, vFlee: 0, mFlee: 0,
    winShare: null, killShare: null,
    // BOWOPEN mechanism (field engine, never snapshots)
    dmgPerRoundMean: null, volleyFired: 0, volleyFireShare: null,
    volleyDmgMean: null, rangedAtEntry: 0, rangedAtEntryShare: null,
    bowOpen: { alreadyHad: 0, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 0, spearSeen: 0, spearPassed: 0 },
    bowOpenStagedVids: 0,
    spearSeen: 0, spearPassed: 0, staged: 0, spearPassRate: null,
    spearAlreadyHad: 0, spearAlreadyHadVids: [],
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
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    if (!d || typeof d !== 'object') { st.errors++; continue; }
    st.valid++;
    st.errors += ((d.instrumentErrors || []).length);
    if (d.senseexpedOn != null) st.senseexpedOn[String(d.senseexpedOn)] = (st.senseexpedOn[String(d.senseexpedOn)] || 0) + 1;
    if (d.fightally2On != null) st.fightally2On[String(d.fightally2On)] = (st.fightally2On[String(d.fightally2On)] || 0) + 1;
    if (d.bowopenOn != null) st.bowopenOn[String(d.bowopenOn)] = (st.bowopenOn[String(d.bowopenOn)] || 0) + 1;
    if (d.speargateOn != null) st.speargateOn[String(d.speargateOn)] = (st.speargateOn[String(d.speargateOn)] || 0) + 1;
    // SPEARGATE: by-vid cross-check — alreadyHad entries whose item is a
    // spear (the misclassification, read by item id from bowOpenByVid).
    if (d.bowOpenByVid && typeof d.bowOpenByVid === 'object') {
      for (const bv of Object.keys(d.bowOpenByVid)) {
        const e = d.bowOpenByVid[bv] || {};
        if (e.source === 'alreadyHad' && SPEAR_IDS.has(e.itemId)) { st.spearAlreadyHad++; st.spearAlreadyHadVids.push(bv + ':' + e.itemId); }
      }
    }
    if (d.bowOpen) {
      for (const k of Object.keys(st.bowOpen)) st.bowOpen[k] += (d.bowOpen[k] | 0);
      st.bowOpenStagedVids += (d.bowOpenStagedVids | 0);
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
  st.spearSeen = st.bowOpen.spearSeen;
  st.spearPassed = st.bowOpen.spearPassed;
  st.staged = st.bowOpen.fromStash + st.bowOpen.fromArmory + st.bowOpen.crafted;
  st.spearPassRate = st.spearSeen ? st.spearPassed / st.spearSeen : null;
  st.winShare = st.meetings ? st.wins / st.meetings : null;
  st.killShare = st.meetings ? st.kills / st.meetings : null;
  st.dmgShareMean = mean(dmgShares);
  st.roundsMean = mean(roundsAll);
  st.vTakenMean = mean(vTakenAll);
  st.dmgPerRoundMean = mean(dmgPerRoundAll);
  st.volleyFireShare = st.meetings ? st.volleyFired / st.meetings : null;
  st.volleyDmgMean = mean(volleyDmgs);
  st.rangedAtEntryShare = st.meetings ? st.rangedAtEntry / st.meetings : null;
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
  // PRIMARY (frozen prereg): spear-gate classification on staging
  // departures. Bars: 0 pool, 1 arm pass rate, 2 ctl pass, 3 alreadyHad
  // consistency, 4 noSource consistency, 5 staged-zero, 6-10 cost bars
  // (kill share, damage/round, community, starvation, median), 11
  // mechanism (volley fired — reported, never a verdict bar).
  const bars = [];
  const poolOk = arm.spearSeen >= 10;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'spear-holder departures (spearSeen): arm ' + arm.spearSeen + ' (floor 10); ctl ' + ctl.spearSeen });
  const passRate = arm.spearPassRate;
  const passOk = poolOk && passRate != null && passRate === 1;
  bars.push({ id: 'gate-pass-rate', pass: passOk,
    detail: 'arm spearPassed/spearSeen = ' + arm.spearPassed + '/' + arm.spearSeen + ' = ' + (passRate == null ? 'n/a' : passRate.toFixed(3)) + ' (bar 1.0 — every spear-holder passed over)' });
  const ctlPassOk = ctl.spearPassed === 0;
  bars.push({ id: 'ctl-pass-zero', pass: ctlPassOk,
    detail: 'ctl spearPassed = ' + ctl.spearPassed + ' (bar 0 — the old gate never passes a spear)' });
  const hadDelta = arm.bowOpen.alreadyHad - (ctl.bowOpen.alreadyHad - ctl.spearSeen);
  const hadOk = Math.abs(hadDelta) <= 3;
  bars.push({ id: 'consistency-alreadyHad', pass: hadOk,
    detail: 'arm alreadyHad ' + arm.bowOpen.alreadyHad + ' vs ctl alreadyHad ' + ctl.bowOpen.alreadyHad + ' minus ctl spearSeen ' + ctl.spearSeen + ' = ' + (ctl.bowOpen.alreadyHad - ctl.spearSeen) + ' (delta ' + hadDelta + ', bar |delta|<=3)' });
  const srcDelta = arm.bowOpen.noSource - (ctl.bowOpen.noSource + arm.spearSeen);
  const srcOk = Math.abs(srcDelta) <= 3;
  bars.push({ id: 'consistency-noSource', pass: srcOk,
    detail: 'arm noSource ' + arm.bowOpen.noSource + ' vs ctl noSource ' + ctl.bowOpen.noSource + ' plus arm spearSeen ' + arm.spearSeen + ' = ' + (ctl.bowOpen.noSource + arm.spearSeen) + ' (delta ' + srcDelta + ', bar |delta|<=3)' });
  const stagedOk = arm.staged === 0 && ctl.staged === 0;
  bars.push({ id: 'staged-zero', pass: stagedOk,
    detail: 'staged (fromStash+fromArmory+crafted): arm ' + arm.staged + ' (stash ' + arm.bowOpen.fromStash + ' armory ' + arm.bowOpen.fromArmory + ' crafted ' + arm.bowOpen.crafted + '), ctl ' + ctl.staged + ' (bar 0 both — no conjuring)' });
  // No-regression cost bars on the pair-inclusive fight population.
  const killOk = arm.killShare != null && ctl.killShare != null && arm.killShare >= ctl.killShare - 0.05;
  bars.push({ id: 'cost-kill-share', pass: killOk,
    detail: 'pair-inclusive kill share arm ' + (arm.killShare == null ? 'n/a' : arm.killShare.toFixed(3)) + ' (' + arm.kills + '/' + arm.meetings + ') vs ctl ' + (ctl.killShare == null ? 'n/a' : ctl.killShare.toFixed(3)) + ' (' + ctl.kills + '/' + ctl.meetings + ') (bar arm>=ctl-0.05)' });
  const dprOk = arm.dmgPerRoundMean != null && ctl.dmgPerRoundMean != null && arm.dmgPerRoundMean >= 0.9 * ctl.dmgPerRoundMean;
  bars.push({ id: 'cost-damage-per-round', pass: dprOk,
    detail: 'pair-inclusive mean damage/round arm ' + (arm.dmgPerRoundMean == null ? 'n/a' : arm.dmgPerRoundMean.toFixed(1)) + ' vs ctl ' + (ctl.dmgPerRoundMean == null ? 'n/a' : ctl.dmgPerRoundMean.toFixed(1)) + ' (bar arm>=0.9x ctl)' });
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
  // Expected UNCHANGED (the fix creates no bows/arrows): reported only.
  const mechFired = arm.volleyFireShare != null && arm.volleyFireShare >= 0.50;
  bars.push({ id: 'mechanism-volley-fired', pass: mechFired,
    detail: 'volley fired on ' + arm.volleyFired + '/' + arm.meetings + ' arm meetings (share ' + (arm.volleyFireShare == null ? 'n/a' : arm.volleyFireShare.toFixed(2)) + ', mean volley dmg ' + (arm.volleyDmgMean == null ? 'n/a' : arm.volleyDmgMean.toFixed(1)) + ', ranged-at-entry ' + (arm.rangedAtEntryShare == null ? 'n/a' : arm.rangedAtEntryShare.toFixed(2)) + ') — mechanism check, not a verdict bar (expected unchanged: the gate creates no bows)' });
  let verdict = 'NO-GO';
  let kind = '';
  if (!poolOk) { verdict = 'NO-GO'; kind = 'THIN-POOL'; }
  else if (bars.every(function (b, i) { return i === 11 ? true : b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'senseexpedOn', 'fightally2On', 'bowopenOn', 'speargateOn',
    'meetings', 'wins', 'kills', 'losses', 'vDie', 'vFlee', 'mFlee',
    'winShare', 'killShare', 'funnel', 'byOutcome', 'gateXOutcome',
    'gateAvoidShare', 'gateNullShare', 'gateSeekShare',
    'lossGateNull', 'lossGateAvoid', 'lossGateSeek',
    'monsterByOutcome', 'dmgShareMean', 'dmgShareByOutcome',
    'roundsMean', 'vTakenMean',
    'dmgPerRoundMean', 'volleyFired', 'volleyFireShare', 'volleyDmgMean',
    'rangedAtEntry', 'rangedAtEntryShare', 'bowOpen', 'bowOpenStagedVids',
    'spearSeen', 'spearPassed', 'staged', 'spearPassRate', 'spearAlreadyHad', 'spearAlreadyHadVids',
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
    bowopenOn: true, speargateOn: true, senseexpedOn: true,
    bowOpen: { alreadyHad: 2, fromStash: 1, fromArmory: 0, crafted: 3, craftedFail: 1, noSource: 4, spearSeen: 6, spearPassed: 6 },
    bowOpenStagedVids: 5,
    bowOpenByVid: { vSpear: { day: 20, source: 'alreadyHad', itemId: 'hunting_spear' }, vBow: { day: 21, source: 'alreadyHad', itemId: 'bow' }, vNone: { day: 22, source: 'noSource', itemId: null } },
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
  check('spear counters aggregate (spearSeen 6, spearPassed 6, pass rate 1.0)', st.spearSeen === 6 && st.spearPassed === 6 && st.spearPassRate === 1, JSON.stringify({ s: st.spearSeen, p: st.spearPassed, r: st.spearPassRate }));
  check('staged counts stash+armory+crafted (1+0+3=4)', st.staged === 4, 'got ' + st.staged);
  check('by-vid cross-check finds the one alreadyHad-with-spear', st.spearAlreadyHad === 1 && st.spearAlreadyHadVids.length === 1 && st.spearAlreadyHadVids[0] === 'vSpear:hunting_spear', JSON.stringify(st.spearAlreadyHadVids));
  check('bowopenOn flag recorded', st.bowopenOn['true'] === 1, JSON.stringify(st.bowopenOn));
  check('speargateOn + senseexpedOn flags recorded', st.speargateOn['true'] === 1 && st.senseexpedOn['true'] === 1, JSON.stringify({ g: st.speargateOn, s: st.senseexpedOn }));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  // Judge shapes (SPEARGATE primary: spear-gate classification + the
  // no-regression cost bars; bars: 0 pool, 1 pass rate, 2 ctl pass,
  // 3 alreadyHad consistency, 4 noSource consistency, 5 staged-zero,
  // 6 kill share, 7 damage/round, 8 community, 9 starvation, 10 median,
  // 11 mechanism (reported only).
  // mk() defaults to the ARM GO shape: 40 spear departures all passed
  // over (alreadyHad 197 real + noSource 203 = 163 + 40).
  function mk(o) {
    return Object.assign({ meetings: 27, wins: 2, kills: 1, mFlee: 1, vDie: 2, vFlee: 23, winShare: 2 / 27, killShare: 1 / 27, dmgPerRoundMean: 42.4, volleyFired: 9, volleyFireShare: 9 / 27, volleyDmgMean: 29.3, communityLost: 5, starvation: 4, starvationVillager: 4, medianDays: 120.5,
      spearSeen: 40, spearPassed: 40, spearPassRate: 1, staged: 0,
      bowOpen: { alreadyHad: 197, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 203, spearSeen: 40, spearPassed: 40 } }, o);
  }
  // GO shape: ctl has 40 spear departures all alreadyHad (237 = 197 real
  // + 40 spear); arm passes all 40 (alreadyHad 197, noSource 203 = 163 + 40).
  const ctlGo = mk({ spearSeen: 40, spearPassed: 0, spearPassRate: 0,
    bowOpen: { alreadyHad: 237, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 163, spearSeen: 40, spearPassed: 0 } });
  const armGo = mk({});
  let j = judge(ctlGo, armGo);
  check('judge GO shape passes (pass rate 1.0 + consistency + staged 0 + cost bars)', j.verdict === 'GO' && j.bars.every(function (b, i) { return i === 11 ? true : b.pass; }), JSON.stringify(j));
  j = judge(ctlGo, mk({ spearPassed: 39, spearPassRate: 39 / 40 }));
  check('judge NO-GO when the pass rate is under 1.0', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mk({ spearPassed: 1, spearPassRate: 1 / 40 }), armGo);
  check('judge NO-GO when the ctl leg passed a spear', j.verdict === 'NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ bowOpen: { alreadyHad: 201, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 203, spearSeen: 40, spearPassed: 40 } }));
  check('judge NO-GO when alreadyHad consistency breaks (|delta|>3)', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ bowOpen: { alreadyHad: 197, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 199, spearSeen: 40, spearPassed: 40 } }));
  check('judge NO-GO when noSource consistency breaks (|delta|>3)', j.verdict === 'NO-GO' && !j.bars[4].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ staged: 2, bowOpen: { alreadyHad: 197, fromStash: 2, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 203, spearSeen: 40, spearPassed: 40 } }));
  check('judge NO-GO when staging conjured a bow', j.verdict === 'NO-GO' && !j.bars[5].pass, JSON.stringify(j.bars));
  const ctlKill = mk({ meetings: 12, kills: 3, wins: 3, killShare: 0.25, spearSeen: 40, spearPassed: 0, spearPassRate: 0,
    bowOpen: { alreadyHad: 237, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 163, spearSeen: 40, spearPassed: 0 } });
  j = judge(ctlKill, mk({ meetings: 12, kills: 1, wins: 1, killShare: 1 / 12 }));
  check('judge NO-GO when kill share falls more than 0.05 under ctl (0.083 < 0.20)', j.verdict === 'NO-GO' && !j.bars[6].pass, JSON.stringify(j.bars));
  j = judge(ctlKill, mk({ meetings: 12, kills: 3, wins: 3, killShare: 0.25 }));
  check('judge GO when kill share matches ctl (guardrail, not primary)', j.verdict === 'GO' && j.bars[6].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ dmgPerRoundMean: 30 }));
  check('judge NO-GO when damage/round falls under 0.9x ctl', j.verdict === 'NO-GO' && !j.bars[7].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ communityLost: 7 }));
  check('judge NO-GO when community loss breaches ctl+0.125', j.verdict === 'NO-GO' && !j.bars[8].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ communityLost: 6 }));
  check('judge GO when community loss is exactly ctl+0.125', j.verdict === 'GO' && j.bars[8].pass, JSON.stringify(j.bars));
  j = judge(mk({}), mk({ starvation: 7 }));
  check('judge NO-GO when starvation breaches ctl+2', j.verdict === 'NO-GO' && !j.bars[9].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ spearSeen: 5, spearPassed: 5, spearPassRate: 1,
    bowOpen: { alreadyHad: 202, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 168, spearSeen: 5, spearPassed: 5 } }));
  check('judge NO-GO thin pool when arm spearSeen is under 10', j.verdict === 'NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judge(ctlGo, mk({ volleyFired: 0, volleyFireShare: 0, volleyDmgMean: 0 }));
  check('judge still GO when the volley never fires (mechanism bar is reported only)', j.verdict === 'GO', JSON.stringify(j));
  console.log('analyze-speargate-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  if (!ctlDir || !armDir) { console.error('usage: analyze-speargate-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
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
