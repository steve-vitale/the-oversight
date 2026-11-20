// analyze-depmat-a.js — analyzer + judge, arm sim-depmat-a.
// Cloned from analyze-bowsee-a.js (same legStats, same driver format:
// depmat-driver-a.js corpora — v4encounters + v4gates + bowOpen +
// bowOpenByVid + depmatRows + deaths + daily + samples.villagers;
// same pair-inclusive PRIMARY fight population). The judge differs
// per the frozen depmat prereg (departure-site materials, not
// departure-site seeing): the SPEARGATE gate is ON on BOTH legs, so
// gate replication is a pass-rate-1.0 bar on EACH leg; the BINDING
// served count is ATTRIBUTABLE-SERVED (spear + site-supplied +
// crafted, read straight off depmatRows — the raw staged delta is
// reported beside it, never substituted); the volley bar is the
// served-bow volley JOIN (volleys fired BY served bows, not the raw
// share — the bowsee bar passed on drift sling volleys); consistency
// is DRIFT-TOLERANT and rate-based (total departures within 5%,
// spearSeen within 10% — the partition noSource formula is RETIRED,
// proven false twice, and would bind against success since the
// mechanism is expected to move noSource down); the cost bar is the
// deaths-per-engaged-meeting guardrail (arm <= ctl). Starvation,
// median survival, kill share, damage/round, and community loss are
// DIAGNOSTICS here (still computed in legStats, still reported),
// NOT judge bars. The depmat aggregation (per-departure lv[bow] /
// lv[crude_bow] reach, pile + own materials at the attempt, site
// split, knowing-but-empty-handed wall split) is new: it separates
// "knew but no vine" from "site-supplied but failed roll" for the
// first time on this finding.
// Usage:
//   node scripts/analyze-depmat-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge]
//   node scripts/analyze-depmat-a.js --selftest
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
    senseexpedOn: {}, fightally2On: {}, bowopenOn: {}, speargateOn: {}, depmatOn: {}, bowknowOn: {},
    meetings: 0, wins: 0, kills: 0, losses: 0, vDie: 0, vFlee: 0, mFlee: 0,
    winShare: null, killShare: null,
    // BOWOPEN mechanism (field engine, never snapshots)
    dmgPerRoundMean: null, volleyFired: 0, volleyFireShare: null,
    volleyDmgMean: null, rangedAtEntry: 0, rangedAtEntryShare: null,
    bowOpen: { alreadyHad: 0, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 0, spearSeen: 0, spearPassed: 0 },
    bowOpenStagedVids: 0,
    spearSeen: 0, spearPassed: 0, staged: 0, spearPassRate: null,
    spearAlreadyHad: 0, spearAlreadyHadVids: [],
    // DEPMAT instrument (per-departure lv[bow]/lv[crude_bow] reach,
    // pile + own materials at the attempt, site supply, from driver
    // depmatRows). Spear-scoped counts are the population the
    // mechanism can serve; totals are reported beside them.
    // ATTRIBUTABLE-SERVED (the binding count) is spear rows with
    // depmatSite true and source 'crafted' — staged bows the
    // mechanism caused. The knowing-but-empty-handed wall is spear
    // rows that knew a rung at the attempt and still went noSource,
    // split by rung known and by missing material (computed from
    // the pile + own snapshot against the recipe needs: bow =
    // wood 1 + vine 2, crude_bow = branch 1 + vine 1).
    depmat: { rows: 0, spearRows: 0, hasParty: 0, hasPartySpear: 0,
      mateBowVisible: 0, mateBowVisibleSpear: 0,
      lvBowAtAttempt: 0, lvBowAtAttemptSpear: 0,
      lvCrudeAtAttempt: 0, lvCrudeAtAttemptSpear: 0,
      knowsAnyAtAttemptSpear: 0,
      seeded: 0, seededSpear: 0,
      seededCrafted: 0, seededCraftedFail: 0, seededNoSource: 0,
      seededCraftedAll: 0, seededCraftedFailAll: 0, seededNoSourceAll: 0,
      siteSupplied: 0, siteSuppliedSpear: 0,
      siteCrafted: 0, siteCraftedFail: 0, siteNoSource: 0,
      siteCraftedAll: 0, siteCraftedFailAll: 0, siteNoSourceAll: 0,
      attributableServed: 0, attributableServedAll: 0,
      servedVids: [],
      knowingNoSourceSpear: 0,
      knowingNoSourceBowOnly: 0, knowingNoSourceCrudeOnly: 0, knowingNoSourceBoth: 0,
      missingVine: 0, missingBranch: 0, missingWood: 0,
      pileVineZeroSpear: 0, pileVineZero: 0 },
    // Served-bow volley join (binding): pair-inclusive engaged
    // meetings whose lead fighter carries a bow the mechanism
    // served (depmatSite-crafted spear row on an earlier-or-same
    // day) and whose opening volley fired. Computed per file
    // from that file's depmatRows + v4encounters.
    servedVolleyJoins: 0, servedVolleyJoinMeetings: [],
    totalDepartures: 0,
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
    starvation: 0, starvationVillager: 0, deathsTotal: 0, deathsPerEngaged: null, days: [], medianDays: null,
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
    if (d.depmatOn != null) st.depmatOn[String(d.depmatOn)] = (st.depmatOn[String(d.depmatOn)] || 0) + 1;
    if (d.bowknowOn != null) st.bowknowOn[String(d.bowknowOn)] = (st.bowknowOn[String(d.bowknowOn)] || 0) + 1;
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
    // DEPMAT instrument: per-departure rows from the driver wrap.
    // Spear-scoped counts are the mechanism's population; the site
    // split is read off the staging source after the call, and the
    // attributable count is spear + site-supplied + crafted.
    // servedByVid (per file): earliest day each vid was served by
    // the mechanism — the volley join reads it in the meeting loop
    // below. Recipe needs (src/data/recipes.json): bow = wood 1 +
    // vine 2, crude_bow = branch 1 + vine 1.
    const servedByVid = {};
    const RECIPES = { bow: { wood: 1, vine: 2 }, crude_bow: { branch: 1, vine: 1 } };
    for (const row of (d.depmatRows || [])) {
      const ds = st.depmat;
      const isSpear = row.spearHolder === true;
      ds.rows++;
      if (isSpear) ds.spearRows++;
      if (row.hasParty) { ds.hasParty++; if (isSpear) ds.hasPartySpear++; }
      if (row.mateBowVisible) { ds.mateBowVisible++; if (isSpear) ds.mateBowVisibleSpear++; }
      if ((row.lvBowBefore | 0) >= 1) { ds.lvBowAtAttempt++; if (isSpear) ds.lvBowAtAttemptSpear++; }
      if ((row.lvCrudeBefore | 0) >= 1) { ds.lvCrudeAtAttempt++; if (isSpear) ds.lvCrudeAtAttemptSpear++; }
      if (isSpear && (((row.lvBowBefore | 0) >= 1) || ((row.lvCrudeBefore | 0) >= 1))) ds.knowsAnyAtAttemptSpear++;
      if (row.pile && (row.pile.vine | 0) === 0) { ds.pileVineZero++; if (isSpear) ds.pileVineZeroSpear++; }
      if (row.seeded) {
        ds.seeded++;
        if (isSpear) ds.seededSpear++;
        if (row.source === 'crafted') { ds.seededCraftedAll++; if (isSpear) ds.seededCrafted++; }
        else if (row.source === 'craftedFail') { ds.seededCraftedFailAll++; if (isSpear) ds.seededCraftedFail++; }
        else if (row.source === 'noSource') { ds.seededNoSourceAll++; if (isSpear) ds.seededNoSource++; }
      }
      // Site-supplied rows: the mechanism fired (depmatSite on the
      // staging return). The attributable count binds: spear +
      // site-supplied + crafted.
      if (row.depmatSite === true) {
        ds.siteSupplied++;
        if (isSpear) ds.siteSuppliedSpear++;
        if (row.source === 'crafted') {
          ds.siteCraftedAll++;
          ds.attributableServedAll++;
          if (isSpear) {
            ds.siteCrafted++;
            ds.attributableServed++;
            ds.servedVids.push(row.vid + ':' + row.day + ':' + (row.itemId || ''));
            if (servedByVid[row.vid] == null || row.day < servedByVid[row.vid]) servedByVid[row.vid] = row.day;
          }
        } else if (row.source === 'craftedFail') { ds.siteCraftedFailAll++; if (isSpear) ds.siteCraftedFail++; }
        else if (row.source === 'noSource') { ds.siteNoSourceAll++; if (isSpear) ds.siteNoSource++; }
      }
      // The wall: a spear-holder who knew a rung at the attempt and
      // still went without. Split by rung known; missing materials
      // computed from the pile + own snapshot (null snapshot =
      // unknown, skipped, never counted as missing).
      if (isSpear && row.source === 'noSource' && (((row.lvBowBefore | 0) >= 1) || ((row.lvCrudeBefore | 0) >= 1))) {
        ds.knowingNoSourceSpear++;
        const knowsBow = (row.lvBowBefore | 0) >= 1;
        const knowsCrude = (row.lvCrudeBefore | 0) >= 1;
        if (knowsBow && knowsCrude) ds.knowingNoSourceBoth++;
        else if (knowsBow) ds.knowingNoSourceBowOnly++;
        else ds.knowingNoSourceCrudeOnly++;
        if (row.pile && row.own) {
          const miss = {};
          for (const rid of (knowsBow ? ['bow'] : []).concat(knowsCrude ? ['crude_bow'] : [])) {
            for (const m of Object.keys(RECIPES[rid])) {
              if (((row.own[m] | 0) + (row.pile[m] | 0)) < RECIPES[rid][m]) miss[m] = true;
            }
          }
          if (miss.vine) ds.missingVine++;
          if (miss.branch) ds.missingBranch++;
          if (miss.wood) ds.missingWood++;
        }
      }
    }
    if (d.bowOpen) {
      st.totalDepartures += (d.bowOpen.alreadyHad | 0) + (d.bowOpen.fromStash | 0) + (d.bowOpen.fromArmory | 0) +
        (d.bowOpen.crafted | 0) + (d.bowOpen.craftedFail | 0) + (d.bowOpen.noSource | 0);
    }
    st.days.push(d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0));
    if ((RANK_ORDER[d.scaleRank] || 0) >= 2) st.national++;
    if (d.won) st.seedWins++;
    if ((d.maxWave | 0) >= 4) st.wave4++;
    if ((d.maxWave | 0) >= 5) st.wave5++;
    if (['village-lost', 'village-dead', 'pop-zero'].includes(d.endReason)) st.communityLost++;
    st.scaleRanks[d.scaleRank || '?'] = (st.scaleRanks[d.scaleRank || '?'] || 0) + 1;
    // Deaths per engaged meeting (spearstage cost bar): total deaths in
    // the run, exposure-normalized by the pair-inclusive engaged
    // meeting count. Legs are seeded-identical, so the ratio compares
    // fairly; starvation deaths are counted here AND in the starvation
    // bar (they are deaths, not double-counted evidence).
    st.deathsTotal += (d.deaths || []).length;
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
      // DEPMAT served-bow volley join (binding): the lead fighter
      // was served by the mechanism on an earlier-or-same day, is
      // fighting with a bow/crude_bow, and the opening volley fired.
      // (NOT the raw volley share — the bowsee bar passed on drift
      // sling volleys, not served bows.)
      if (vol && vol.shots > 0 && (r.rangedId === 'bow' || r.rangedId === 'crude_bow') &&
          servedByVid[r.vid] != null && servedByVid[r.vid] <= r.day) {
        st.servedVolleyJoins++;
        st.servedVolleyJoinMeetings.push({ seed: d.seed, day: r.day, vid: r.vid, mid: r.mid,
          servedDay: servedByVid[r.vid], rangedId: r.rangedId,
          volley: { shots: vol.shots | 0, hits: vol.hits | 0, dmg: vol.dmg | 0 } });
      }
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
  st.deathsPerEngaged = st.meetings ? st.deathsTotal / st.meetings : null;
  st.meetingsDetail = meetingsDetail;
  return st;
}

function judge(ctl, arm) {
  // PRIMARY (frozen depmat prereg): departure-site materials +
  // gate TOGETHER under live BOWCRAFT ground, gate ON both legs.
  // Bars: 0 pool, 1 arm pass rate, 2 ctl pass rate,
  // 3 ATTRIBUTABLE-SERVED (spear + site-supplied + crafted, read
  // straight off depmatRows — the BINDING count; the raw staged
  // delta is reported beside it, never substituted),
  // 4 served-bow volley join (volleys fired BY served bows, not
  // the raw volley share — the bowsee bar passed on drift sling
  // volleys), 5 consistency (DRIFT-TOLERANT, rate-based: total
  // departures within 5% and spearSeen within 10% — the partition
  // noSource formula is RETIRED, proven false twice, and would
  // bind against success since the mechanism is EXPECTED to move
  // noSource down), 6 guardrail (deaths per engaged meeting, arm
  // <= ctl). Kill share, damage/round, starvation, median
  // survival, and community loss are diagnostics, NOT bars. ALL
  // bars bind; a miss on any bar is NO-GO, never re-scored.
  const bars = [];
  const poolOk = arm.spearSeen >= 10;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'spear-holder departures (spearSeen): arm ' + arm.spearSeen + ' (floor 10); ctl ' + ctl.spearSeen });
  const passRate = arm.spearPassRate;
  const passOk = poolOk && passRate != null && passRate === 1;
  bars.push({ id: 'gate-pass-rate', pass: passOk,
    detail: 'arm spearPassed/spearSeen = ' + arm.spearPassed + '/' + arm.spearSeen + ' = ' + (passRate == null ? 'n/a' : passRate.toFixed(3)) + ' (bar 1.0 — every spear-holder passed over)' });
  const ctlPassRate = ctl.spearPassRate;
  const ctlPassOk = poolOk && ctlPassRate != null && ctlPassRate === 1;
  bars.push({ id: 'ctl-pass-rate', pass: ctlPassOk,
    detail: 'ctl spearPassed/spearSeen = ' + ctl.spearPassed + '/' + ctl.spearSeen + ' = ' + (ctlPassRate == null ? 'n/a' : ctlPassRate.toFixed(3)) + ' (bar 1.0 — the gate is ON on the ctl leg too; every spear-holder is passed over)' });
  const attrServed = arm.depmat.attributableServed;
  const rawStagedDelta = arm.staged - ctl.staged;
  const servedOk = attrServed >= 3;
  bars.push({ id: 'attributable-served', pass: servedOk,
    detail: 'ATTRIBUTABLE-SERVED (spear + site-supplied + crafted): arm ' + attrServed + ' (site-supplied spear rows ' + arm.depmat.siteSuppliedSpear + ': crafted ' + arm.depmat.siteCrafted + ', failed roll ' + arm.depmat.siteCraftedFail + ', noSource ' + arm.depmat.siteNoSource + ') (bar >= 3 — the mechanism must cause the servings). Raw staged delta beside it, NOT binding: arm staged ' + arm.staged + ' minus ctl staged ' + ctl.staged + ' = ' + rawStagedDelta });
  const joinOk = arm.servedVolleyJoins >= 1;
  bars.push({ id: 'served-bow-volley-join', pass: joinOk,
    detail: 'served-bow volley joins (pair-inclusive wave-4+ engaged meetings, lead served by the mechanism, bow/crude_bow, volley fired): arm ' + arm.servedVolleyJoins + ' (bar >= 1). Raw volley share beside it, NOT binding: arm ' + (arm.volleyFireShare == null ? 'n/a' : arm.volleyFireShare.toFixed(3)) + ' (' + arm.volleyFired + '/' + arm.meetings + ') vs ctl ' + (ctl.volleyFireShare == null ? 'n/a' : ctl.volleyFireShare.toFixed(3)) + ' (' + ctl.volleyFired + '/' + ctl.meetings + ')' });
  const depRate = (ctl.totalDepartures && ctl.totalDepartures > 0) ? Math.abs(arm.totalDepartures - ctl.totalDepartures) / ctl.totalDepartures : null;
  const spearRate = (ctl.spearSeen && ctl.spearSeen > 0) ? Math.abs(arm.spearSeen - ctl.spearSeen) / ctl.spearSeen : null;
  const consOk = depRate != null && depRate <= 0.05 && spearRate != null && spearRate <= 0.10;
  bars.push({ id: 'consistency-rate', pass: consOk,
    detail: 'total departures arm ' + arm.totalDepartures + ' vs ctl ' + ctl.totalDepartures + ' (rate delta ' + (depRate == null ? 'n/a' : depRate.toFixed(3)) + ', bar <= 0.05); spearSeen arm ' + arm.spearSeen + ' vs ctl ' + ctl.spearSeen + ' (rate delta ' + (spearRate == null ? 'n/a' : spearRate.toFixed(3)) + ', bar <= 0.10). Drift-tolerant: the mechanism is expected to move noSource, so noSource itself is never the consistency measure.' });
  const guardOk = arm.deathsPerEngaged != null && ctl.deathsPerEngaged != null && arm.deathsPerEngaged <= ctl.deathsPerEngaged;
  bars.push({ id: 'guardrail-deaths-per-engaged', pass: guardOk,
    detail: 'deaths per engaged meeting (pair-inclusive): arm ' + (arm.deathsPerEngaged == null ? 'n/a' : arm.deathsPerEngaged.toFixed(2)) + ' (' + arm.deathsTotal + ' deaths / ' + arm.meetings + ' meetings) vs ctl ' + (ctl.deathsPerEngaged == null ? 'n/a' : ctl.deathsPerEngaged.toFixed(2)) + ' (' + ctl.deathsTotal + ' / ' + ctl.meetings + ') (bar arm <= ctl — the mechanism must not buy bows with lives)' });
  let verdict = 'NO-GO';
  let kind = '';
  if (!poolOk) { verdict = 'NO-GO'; kind = 'THIN-POOL'; }
  else if (!servedOk) { verdict = 'NO-GO'; kind = 'SERVED-SHORT'; }
  else if (bars.every(function (b) { return b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'senseexpedOn', 'fightally2On', 'bowopenOn', 'speargateOn', 'depmatOn', 'bowknowOn',
    'meetings', 'wins', 'kills', 'losses', 'vDie', 'vFlee', 'mFlee',
    'winShare', 'killShare', 'funnel', 'byOutcome', 'gateXOutcome',
    'gateAvoidShare', 'gateNullShare', 'gateSeekShare',
    'lossGateNull', 'lossGateAvoid', 'lossGateSeek',
    'monsterByOutcome', 'dmgShareMean', 'dmgShareByOutcome',
    'roundsMean', 'vTakenMean',
    'dmgPerRoundMean', 'volleyFired', 'volleyFireShare', 'volleyDmgMean',
    'rangedAtEntry', 'rangedAtEntryShare', 'bowOpen', 'bowOpenStagedVids',
    'spearSeen', 'spearPassed', 'staged', 'spearPassRate', 'spearAlreadyHad', 'spearAlreadyHadVids',
    'depmat', 'servedVolleyJoins', 'servedVolleyJoinMeetings', 'totalDepartures',
    'starvation', 'starvationVillager', 'deathsTotal', 'deathsPerEngaged', 'medianDays', 'communityLost',
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
    bowopenOn: true, speargateOn: true, depmatOn: true, bowknowOn: false, senseexpedOn: true,
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
    // DEPMAT instrument fixture: A seeded-then-crafted, B
    // seeded-then-failed-roll, C seeded-but-no-materials, D already
    // knew (lv 1 at attempt), E solo spear-holder with no party, F
    // a seeded non-spear departure (totals only, never spear-scoped),
    // G site-supplied spear-holder who crafts (the attributable
    // serving — vid 'h1', the meeting lead, day 19, so the day-20
    // and day-21 meetings join on it), H site-supplied spear-holder
    // whose roll fails, J knowing-crude spear-holder who goes
    // without for lack of vine, K bow-only knowing spear-holder
    // who goes without for lack of wood + vine.
    depmatRows: [
      { day: 20, vid: 'vA', lvBowBefore: 0, lvBowAfter: 1, lvCrudeBefore: 1, lvCrudeAfter: 2, seeded: true, spearHolder: true, hasParty: true, partySize: 3, mateBowVisible: true, mateBowVid: 'vM', pile: { branch: 5, vine: 5, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: false, siteMats: null, source: 'crafted', itemId: 'bow', staged: true, craftedOk: true },
      { day: 21, vid: 'vB', lvBowBefore: 0, lvBowAfter: 1, lvCrudeBefore: 0, lvCrudeAfter: 0, seeded: true, spearHolder: true, hasParty: true, partySize: 3, mateBowVisible: true, mateBowVid: 'vM', pile: { branch: 5, vine: 5, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: false, siteMats: null, source: 'craftedFail', itemId: 'bow', staged: false, craftedOk: false },
      { day: 22, vid: 'vC', lvBowBefore: 0, lvBowAfter: 1, lvCrudeBefore: 0, lvCrudeAfter: 0, seeded: true, spearHolder: true, hasParty: true, partySize: 2, mateBowVisible: true, mateBowVid: 'vM', pile: { branch: 0, vine: 0, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: false, siteMats: null, source: 'noSource', itemId: null, staged: false, craftedOk: false },
      { day: 23, vid: 'vD', lvBowBefore: 1, lvBowAfter: 1, lvCrudeBefore: 0, lvCrudeAfter: 0, seeded: false, spearHolder: true, hasParty: true, partySize: 3, mateBowVisible: true, mateBowVid: 'vM', pile: { branch: 5, vine: 5, wood: 5 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: false, siteMats: null, source: 'crafted', itemId: 'bow', staged: true, craftedOk: true },
      { day: 24, vid: 'vE', lvBowBefore: 0, lvBowAfter: 0, lvCrudeBefore: 0, lvCrudeAfter: 0, seeded: false, spearHolder: true, hasParty: false, partySize: 0, mateBowVisible: false, mateBowVid: null, pile: { branch: 5, vine: 5, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: false, siteMats: null, source: 'noSource', itemId: null, staged: false, craftedOk: false },
      { day: 25, vid: 'vF', lvBowBefore: 0, lvBowAfter: 1, lvCrudeBefore: 0, lvCrudeAfter: 0, seeded: true, spearHolder: false, hasParty: true, partySize: 2, mateBowVisible: true, mateBowVid: 'vM', pile: { branch: 5, vine: 5, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: false, siteMats: null, source: 'crafted', itemId: 'bow', staged: true, craftedOk: true },
      { day: 19, vid: 'h1', lvBowBefore: 0, lvBowAfter: 0, lvCrudeBefore: 1, lvCrudeAfter: 2, seeded: false, spearHolder: true, hasParty: true, partySize: 3, mateBowVisible: false, mateBowVid: null, pile: { branch: 0, vine: 0, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: true, siteMats: ['branch', 'vine'], source: 'crafted', itemId: 'crude_bow', staged: true, craftedOk: true },
      { day: 20, vid: 'vH', lvBowBefore: 0, lvBowAfter: 0, lvCrudeBefore: 1, lvCrudeAfter: 1, seeded: false, spearHolder: true, hasParty: true, partySize: 3, mateBowVisible: false, mateBowVid: null, pile: { branch: 0, vine: 0, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: true, siteMats: ['vine'], source: 'craftedFail', itemId: 'crude_bow', staged: false, craftedOk: false },
      { day: 26, vid: 'vJ', lvBowBefore: 0, lvBowAfter: 0, lvCrudeBefore: 1, lvCrudeAfter: 1, seeded: false, spearHolder: true, hasParty: true, partySize: 2, mateBowVisible: false, mateBowVid: null, pile: { branch: 5, vine: 0, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: false, siteMats: null, source: 'noSource', itemId: null, staged: false, craftedOk: false },
      { day: 27, vid: 'vK', lvBowBefore: 1, lvBowAfter: 1, lvCrudeBefore: 0, lvCrudeAfter: 0, seeded: false, spearHolder: true, hasParty: true, partySize: 2, mateBowVisible: false, mateBowVid: null, pile: { branch: 0, vine: 1, wood: 0 }, own: { branch: 0, vine: 0, wood: 0 }, depmatSite: false, siteMats: null, source: 'noSource', itemId: null, staged: false, craftedOk: false },
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
  check('deaths per engaged meeting aggregates (0 deaths / 3 meetings = 0)', st.deathsTotal === 0 && st.deathsPerEngaged === 0, JSON.stringify({ d: st.deathsTotal, r: st.deathsPerEngaged }));
  check('by-vid cross-check finds the one alreadyHad-with-spear', st.spearAlreadyHad === 1 && st.spearAlreadyHadVids.length === 1 && st.spearAlreadyHadVids[0] === 'vSpear:hunting_spear', JSON.stringify(st.spearAlreadyHadVids));
  check('bowopenOn flag recorded', st.bowopenOn['true'] === 1, JSON.stringify(st.bowopenOn));
  check('speargateOn + depmatOn + bowknowOn + senseexpedOn flags recorded', st.speargateOn['true'] === 1 && st.depmatOn['true'] === 1 && st.bowknowOn['false'] === 1 && st.senseexpedOn['true'] === 1, JSON.stringify({ g: st.speargateOn, d: st.depmatOn, b: st.bowknowOn, s: st.senseexpedOn }));
  check('depmat rows aggregate (10 rows, 9 spear)', st.depmat.rows === 10 && st.depmat.spearRows === 9, JSON.stringify(st.depmat));
  check('depmat party scope (hasParty 9/8 spear, mateBowVisible 5/4 spear)', st.depmat.hasParty === 9 && st.depmat.hasPartySpear === 8 && st.depmat.mateBowVisible === 5 && st.depmat.mateBowVisibleSpear === 4, JSON.stringify(st.depmat));
  check('depmat lv[bow] reach at attempt (2/2 spear — the already-knew rows)', st.depmat.lvBowAtAttempt === 2 && st.depmat.lvBowAtAttemptSpear === 2, JSON.stringify(st.depmat));
  check('depmat lv[crude_bow] reach at attempt (4/4 spear — the crude knowers)', st.depmat.lvCrudeAtAttempt === 4 && st.depmat.lvCrudeAtAttemptSpear === 4, JSON.stringify(st.depmat));
  check('depmat knows-any at attempt on spear rows (6: A, D, G, H, J, K)', st.depmat.knowsAnyAtAttemptSpear === 6, JSON.stringify(st.depmat));
  check('depmat seeded split on spear rows (seeded 3: crafted 1, failed 1, no-materials 1)', st.depmat.seeded === 4 && st.depmat.seededSpear === 3 && st.depmat.seededCrafted === 1 && st.depmat.seededCraftedFail === 1 && st.depmat.seededNoSource === 1, JSON.stringify(st.depmat));
  check('depmat seeded split totals include the non-spear row (craftedAll 2)', st.depmat.seededCraftedAll === 2 && st.depmat.seededCraftedFailAll === 1 && st.depmat.seededNoSourceAll === 1, JSON.stringify(st.depmat));
  check('depmat site split on spear rows (supplied 2: crafted 1, failed 1, noSource 0)', st.depmat.siteSupplied === 2 && st.depmat.siteSuppliedSpear === 2 && st.depmat.siteCrafted === 1 && st.depmat.siteCraftedFail === 1 && st.depmat.siteNoSource === 0, JSON.stringify(st.depmat));
  check('depmat site split totals equal the spear split here (no non-spear site rows)', st.depmat.siteCraftedAll === 1 && st.depmat.siteCraftedFailAll === 1 && st.depmat.siteNoSourceAll === 0, JSON.stringify(st.depmat));
  check('depmat ATTRIBUTABLE-SERVED is 1 (the site-supplied spear craft — D is divergence, not the mechanism)', st.depmat.attributableServed === 1 && st.depmat.attributableServedAll === 1 && st.depmat.servedVids.length === 1 && st.depmat.servedVids[0] === 'h1:19:crude_bow', JSON.stringify(st.depmat));
  check('depmat wall split (knowing-noSource 2: crude-only 1, bow-only 1, both 0)', st.depmat.knowingNoSourceSpear === 2 && st.depmat.knowingNoSourceCrudeOnly === 1 && st.depmat.knowingNoSourceBowOnly === 1 && st.depmat.knowingNoSourceBoth === 0, JSON.stringify(st.depmat));
  check('depmat missing-material split (vine 2, branch 0, wood 1)', st.depmat.missingVine === 2 && st.depmat.missingBranch === 0 && st.depmat.missingWood === 1, JSON.stringify(st.depmat));
  check('depmat pile-vine-zero (4 rows, all spear)', st.depmat.pileVineZero === 4 && st.depmat.pileVineZeroSpear === 4, JSON.stringify(st.depmat));
  check('depmat total departures sum the bowOpen counters (2+1+0+3+1+4=11)', st.totalDepartures === 11, 'got ' + st.totalDepartures);
  check('depmat served-bow volley join is 2 on the trio population (day-20 kill + day-21 loss, both h1)', st.servedVolleyJoins === 2 && st.servedVolleyJoinMeetings.length === 2, JSON.stringify(st.servedVolleyJoins));
  check('depmat served-bow volley join is 3 pair-inclusive (adds the day-23 pair meeting)', stPair.servedVolleyJoins === 3, JSON.stringify(stPair.servedVolleyJoins));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  // Judge shapes (DEPMAT primary: departure-site materials + gate
  // together, gate ON both legs; bars: 0 pool, 1 arm pass rate,
  // 2 ctl pass rate, 3 ATTRIBUTABLE-SERVED, 4 served-bow volley
  // join, 5 consistency (DRIFT-TOLERANT rate-based), 6 guardrail
  // (deaths per engaged meeting). Starvation, median survival,
  // kill share, damage/round, and community loss are diagnostics,
  // NOT bars. ALL bind.)
  // mk() defaults to the ARM GO shape: 40 spear departures all passed
  // over; attributable-served 3 (site-supplied spear crafts 3);
  // served-bow volley joins 2; total departures 400 (ctl 400, rate
  // delta 0); deaths per engaged equal to ctl (100/27).
  function mk(o) {
    return Object.assign({ meetings: 27, wins: 2, kills: 1, mFlee: 1, vDie: 2, vFlee: 23, winShare: 2 / 27, killShare: 1 / 27, dmgPerRoundMean: 42.4, volleyFired: 13, volleyFireShare: 13 / 27, volleyDmgMean: 29.3, communityLost: 5, starvation: 4, starvationVillager: 4, medianDays: 120.5,
      deathsTotal: 100, deathsPerEngaged: 100 / 27,
      spearSeen: 40, spearPassed: 40, spearPassRate: 1, staged: 3,
      totalDepartures: 400, servedVolleyJoins: 2,
      depmat: { attributableServed: 3, attributableServedAll: 3, siteSuppliedSpear: 3, siteCrafted: 3, siteCraftedFail: 0, siteNoSource: 0 },
      bowOpen: { alreadyHad: 197, fromStash: 0, fromArmory: 0, crafted: 3, craftedFail: 0, noSource: 200, spearSeen: 40, spearPassed: 40 } }, o);
  }
  // GO shape: ctl has the gate ON too — 40 spear departures all passed
  // over, none served (alreadyHad 197, noSource 203); arm passes all
  // 40, serves 3 attributable, joins 2 served-bow volleys, same
  // departure totals, same deaths per engaged.
  const ctlGo = mk({ spearSeen: 40, spearPassed: 40, spearPassRate: 1, staged: 0, volleyFired: 9, volleyFireShare: 9 / 27,
    servedVolleyJoins: 0, totalDepartures: 400,
    depmat: { attributableServed: 0, attributableServedAll: 0, siteSuppliedSpear: 0, siteCrafted: 0, siteCraftedFail: 0, siteNoSource: 0 },
    bowOpen: { alreadyHad: 197, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 203, spearSeen: 40, spearPassed: 40 } });
  const armGo = mk({});
  let j = judge(ctlGo, armGo);
  check('judge GO shape passes (pass rate 1.0 + attributable-served 3 + volley join 2 + rate consistency + guardrail)', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(ctlGo, mk({ spearPassed: 39, spearPassRate: 39 / 40 }));
  check('judge NO-GO when the pass rate is under 1.0', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mk({ spearPassed: 39, spearPassRate: 39 / 40 }), armGo);
  check('judge NO-GO when the ctl pass rate is under 1.0 (gate must take on both legs)', j.verdict === 'NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ depmat: { attributableServed: 2, attributableServedAll: 2, siteSuppliedSpear: 2, siteCrafted: 2, siteCraftedFail: 0, siteNoSource: 0 } }));
  check('judge NO-GO when attributable-served is 2 (one short of the bar)', j.verdict === 'NO-GO' && !j.bars[3].pass && j.kind === 'SERVED-SHORT', JSON.stringify(j));
  j = judge(ctlGo, mk({ depmat: { attributableServed: 0, attributableServedAll: 0, siteSuppliedSpear: 0, siteCrafted: 0, siteCraftedFail: 0, siteNoSource: 0 } }));
  check('judge NO-GO when nothing was served by the mechanism (attributable 0 < 3)', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ staged: 5, depmat: { attributableServed: 0, attributableServedAll: 0, siteSuppliedSpear: 0, siteCrafted: 0, siteCraftedFail: 0, siteNoSource: 0 },
    bowOpen: { alreadyHad: 197, fromStash: 0, fromArmory: 0, crafted: 5, craftedFail: 0, noSource: 198, spearSeen: 40, spearPassed: 40 } }));
  check('judge NO-GO when raw staged is 5 but attributable is 0 (the raw count never substitutes)', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ servedVolleyJoins: 0 }));
  check('judge NO-GO when no served bow ever volleys (join 0 < 1)', j.verdict === 'NO-GO' && !j.bars[4].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ totalDepartures: 430 }));
  check('judge NO-GO when departure totals drift 7.5% (rate bar 0.05)', j.verdict === 'NO-GO' && !j.bars[5].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ totalDepartures: 420, spearSeen: 44, spearPassed: 44 }));
  check('judge GO when departure totals sit exactly at the rate bars (0.05 and 0.10)', j.verdict === 'GO' && j.bars[5].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ spearSeen: 45, spearPassed: 45 }));
  check('judge NO-GO when spearSeen drifts 12.5% (rate bar 0.10)', j.verdict === 'NO-GO' && !j.bars[5].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ deathsPerEngaged: 4.0, deathsTotal: 108 }));
  check('judge NO-GO when deaths per engaged meeting rise (4.00 > 3.70 — the guardrail binds)', j.verdict === 'NO-GO' && !j.bars[6].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ deathsPerEngaged: 100 / 27, deathsTotal: 100 }));
  check('judge GO when deaths per engaged meeting are exactly equal (arm <= ctl)', j.verdict === 'GO' && j.bars[6].pass, JSON.stringify(j.bars));
  j = judge(ctlGo, mk({ spearSeen: 5, spearPassed: 5, spearPassRate: 1, staged: 0,
    bowOpen: { alreadyHad: 197, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 203, spearSeen: 5, spearPassed: 5 } }));
  check('judge NO-GO thin pool when arm spearSeen is under 10', j.verdict === 'NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  console.log('analyze-depmat-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  if (!ctlDir || !armDir) { console.error('usage: analyze-depmat-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
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
