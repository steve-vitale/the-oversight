// analyze-partydmg-a.js — DIAG analyzer, arm sim-partydmg-a
// (TOTAL PARTY DAMAGE DIAGNOSTIC: where does party damage actually
// come from, what does weapon quality contribute, and what — if
// anything — closes the gap to the ~111/round wave-4 kill line?)
//
// Reads per-seed JSONs from the partydmg driver (w4dmgFights rich
// rows — the speardmg row, verbatim) and answers, from the fight
// record itself:
//   - total party damage decomposed by CHANNEL (weapon strikes /
//     volley / contact finish / ambush / extra-ability), by ROLE
//     (lead / ally1 / ally2 / ally3), by WEAPON-MIX CLASS
//     (fighterMix), and by WB TIER (0 / 1-9 / 10-19 / 20-29 /
//     30-49 / 50+)
//   - the kill-line gap per fight: party dpr vs ~111, rounds-to-
//     kill at observed dpr vs rounds fought, HP left at flee
//   - frozen arithmetic counterfactuals (prereg §1): A — every
//     fighter at wb >= 30; B — lead at the best observed lead wb
//     in every meeting; C — every fighter at wb 50; D — every
//     fighter striking every round at their observed per-strike
//     mean. Weapon-strike damage re-scales by (6+w')/(6+w) with
//     observed strike counts held fixed; volley / contact /
//     ambush / extra are held at observed values in every
//     counterfactual. These are what-if numbers on the observed
//     opportunity structure — they answer "would better weapons
//     close it?" and nothing else.
//   - the binding constraint, named from the numbers.
//
// The strike parser, the fold-in attribution, and the mix classes
// are REQUIRED from scripts/analyze-speardmg-a.js — one definition
// of the parser, the attribution, and the taxonomy; no second copy
// to drift.
//
// Usage:
//   node scripts/analyze-partydmg-a.js --dir DIR [--out FILE]
//   node scripts/analyze-partydmg-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');
const { parseStrikes, fighterMix, spearShare, meleeShare, rangedShare,
  weaponClass, ammoCapable, loadDefs, KILL_LINE_DPR } = require(path.join(__dirname, 'analyze-speardmg-a'));
const DEFS = loadDefs();

// The kill line (frozen reference, leadworst-a): a wave-4 fight
// needs ~111 damage/round to kill inside the morale window.
const KILL_LINE = KILL_LINE_DPR || 111;

// wbTier(wb): the frozen weapon-quality bands (prereg §2).
function wbTier(wb) {
  const w = wb | 0;
  if (w <= 0) return '0-unarmed';
  if (w <= 9) return '1-9';
  if (w <= 19) return '10-19';
  if (w <= 29) return '20-29';
  if (w <= 49) return '30-49';
  return '50+';
}
const WB_TIERS = ['0-unarmed', '1-9', '10-19', '20-29', '30-49', '50+'];

function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function round1(x) { return Math.round(x * 10) / 10; }
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}

// expectedStrikeMean(wb): the frozen tactical formula (6+wb) —
// lroll([4+wb, 8+wb]) averages to 6+wb. Used by the
// counterfactuals AND validated against live per-strike means
// (secondary metric: observed vs formula per wb tier).
function expectedStrikeMean(wb) { return 6 + (wb | 0); }

// counterfactuals(fight): frozen arithmetic (prereg §1) on one
// fight's observed weapon-strike damage. `fight` carries:
//   weaponByVid: { vid: { weaponDmg, strikes, wb, isLead } }
//   fixedDmg: volley + contact + ambush + extra (held constant)
//   rounds, bestLeadWb.
// Returns { A, B, C, D } as counterfactual party dpr values.
function counterfactuals(fight) {
  const rounds = fight.rounds | 0;
  if (!rounds) return { A: null, B: null, C: null, D: null };
  function scaleWeapon(targetWb) {
    let total = 0;
    for (const vid of Object.keys(fight.weaponByVid)) {
      const f = fight.weaponByVid[vid];
      const w = (f.wb | 0);
      const w2 = Math.max(w, targetWb);
      total += f.weaponDmg * (expectedStrikeMean(w2) / expectedStrikeMean(w));
    }
    return total;
  }
  function scaleLead(targetWb) {
    let total = 0;
    for (const vid of Object.keys(fight.weaponByVid)) {
      const f = fight.weaponByVid[vid];
      if (!f.isLead) { total += f.weaponDmg; continue; }
      const w = (f.wb | 0);
      const w2 = Math.max(w, targetWb);
      total += f.weaponDmg * (expectedStrikeMean(w2) / expectedStrikeMean(w));
    }
    return total;
  }
  function strikeEveryRound() {
    let total = 0;
    for (const vid of Object.keys(fight.weaponByVid)) {
      const f = fight.weaponByVid[vid];
      if (!f.strikes) continue;
      total += (f.weaponDmg / f.strikes) * rounds;
    }
    return total;
  }
  const fixed = fight.fixedDmg | 0;
  return {
    A: round1((scaleWeapon(30) + fixed) / rounds),
    B: round1((scaleLead(fight.bestLeadWb | 0) + fixed) / rounds),
    C: round1((scaleWeapon(50) + fixed) / rounds),
    D: round1((strikeEveryRound() + fixed) / rounds),
  };
}

// requiredWb(strikesPerRound): the wb a fight's strikes would
// need to average for the party to reach the kill line at the
// OBSERVED strike rate: required mean strike = 111 /
// strikesPerRound; required wb = that - 6. Null when the fight
// landed no weapon strike at all (no wb closes a zero-strike
// fight — the gap there is pure opportunity).
function requiredWb(strikesPerRound) {
  if (!strikesPerRound || strikesPerRound <= 0) return null;
  return round1(KILL_LINE / strikesPerRound - 6);
}

// ---- stats ----
// partyDmgStats(dir): reads the driver's per-seed JSONs and
// aggregates the damage diagnostic. Fights are the population:
// expedition-origin wave-4+ fieldFights with rounds > 0.
function partyDmgStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    seeds: [],
    // Pool (prereg §2).
    fights: 0, spearFights: 0,
    fightsDetail: [],
    // Reconciliation (binding).
    strikeLines: 0, coveredStrikeLines: 0, coverage: null,
    mDealtTotal: 0, parsedTotal: 0, unparsedTotal: 0, residual: null,
    fieldMismatches: { volley: 0, contact: 0, ambush: 0 },
    unknownDmgLines: 0,
    gearUpChanged: 0, nameCollisionFights: 0,
    // Decomposition (binding): three views of the same parsed
    // damage — each must sum to >= 0.95 of pooled mDealt.
    byChannel: { weaponStrikes: 0, volley: 0, contact: 0, ambush: 0, extra: 0 },
    byRole: { lead: 0, ally1: 0, ally2: 0, ally3: 0, unattributed: 0 },
    byMix: {},
    byTier: {},
    decomposition: { channel: null, role: null, mix: null, tier: null },
    // Per-strike means by mix class and by wb tier (weapon
    // strikes only: kinds strike + echo).
    perStrikeByMix: {},
    perStrikeByTier: {},
    // The kill-line gap.
    partyDpr: [], // per-fight { seed, day, mid, rounds, mHpStart, mDealt, partyDpr, gap, roundsToKill, hpLeft, strikesPerRound, requiredWb, outcome }
    partyDprMean: null, partyDprMedian: null, partyDprMax: null,
    gapMean: null, fightsAtKillLine: 0,
    // Counterfactuals (frozen arithmetic, prereg §1).
    counterfactuals: { A: [], B: [], C: [], D: [] },
    cfSummary: {},
    requiredWbValues: [],
    requiredWbMedian: null, requiredWbUnclosable: 0,
    // Spear share, for continuity with speardmg-a.
    spearAttrDmg: 0, spearShare: null,
    // Strikes.
    weaponStrikesTotal: 0, strikesPerRoundPooled: null,
    // Kills.
    vKills: 0,
    // Staging sniff test (spearlead ledger reconciliation).
    spearSeen: 0, spearPassed: 0, ledgerDepartures: 0,
    reconciliation: [],
    // Wall numbers (scale-onramp axis).
    wall: { national: 0, table: null, wins: 0, wave4Unlocked: 0, wave5Unlocked: 0,
      medianSurvival: null, communityLost: 0, scaleRanks: {}, deaths: 0,
      deathKinds: {}, starvation: 0, survivals: [] },
  };
  const perStrikeMix = {}; // mix -> [dmg]
  const perStrikeTier = {}; // tier -> [dmg]
  function bumpMix(mix, dmg) { (perStrikeMix[mix] || (perStrikeMix[mix] = [])).push(dmg); }
  function bumpTier(tier, dmg) { (perStrikeTier[tier] || (perStrikeTier[tier] = [])).push(dmg); }

  // First pass: collect fights + the best observed lead wb (the
  // B counterfactual needs it before per-fight computation).
  const fightRows = [];
  for (const f of files) {
    let d = null;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    const seedRow = { seed: d.seed, days: d.days, endReason: d.endReason, won: !!d.won,
      maxWave: d.maxWave, standing: d.standing, scaleRank: d.scaleRank,
      spearSeen: d.spearSeen, spearPassed: d.spearPassed,
      fights: 0, spearFights: 0, errors: (d.instrumentErrors || []).length };
    if ((d.instrumentErrors || []).length) st.errors += d.instrumentErrors.length;
    else st.valid++;
    st.seeds.push(seedRow);
    const w = st.wall;
    if (d.scaleRank === 'national' || d.scaleRank === 'global') w.national++;
    if (d.won) w.wins++;
    if ((d.maxWave | 0) >= 4 || (d.unlockedWave | 0) >= 4) w.wave4Unlocked++;
    if ((d.maxWave | 0) >= 5 || (d.unlockedWave | 0) >= 5) w.wave5Unlocked++;
    w.survivals.push(d.days | 0);
    if (d.endReason === 'village-lost' || d.villageLost) w.communityLost++;
    w.scaleRanks[d.scaleRank || 'unknown'] = (w.scaleRanks[d.scaleRank || 'unknown'] || 0) + 1;
    for (const dd of (d.deaths || [])) {
      w.deaths++;
      w.deathKinds[dd.kind || 'unknown'] = (w.deathKinds[dd.kind || 'unknown'] || 0) + 1;
      if (isStarvation(dd)) w.starvation++;
    }
    const ledgerRows = (d.spearDeparts || []).filter(function (r) { return r.isSpear; }).length;
    st.ledgerDepartures += ledgerRows;
    st.spearSeen += (d.spearSeen | 0);
    st.spearPassed += (d.spearPassed | 0);
    st.reconciliation.push({ seed: d.seed, ledger: ledgerRows, spearSeen: d.spearSeen,
      match: ledgerRows === (d.spearSeen | 0) });
    const fights = (d.w4dmgFights || []).filter(function (r) { return (r.rounds | 0) > 0; });
    for (const row of fights) fightRows.push({ seed: d.seed, seedRow: seedRow, row: row });
  }
  // Best observed lead wb across the population (B counterfactual).
  let bestLeadWb = 0;
  for (const fr of fightRows) {
    const lwb = (fr.row.leadKit && fr.row.leadKit.wb) | 0;
    if (lwb > bestLeadWb) bestLeadWb = lwb;
  }
  st.bestLeadWb = bestLeadWb;

  for (const fr of fightRows) {
    const d = fr.seedRow;
    const row = fr.row;
    st.fights++;
    d.fights++;
    const kits = [];
    if (row.leadKit) kits.push(row.leadKit);
    for (const k of (row.fighterKits || [])) kits.push(k);
    const kitByVid = {};
    const roleByVid = {};
    for (let i = 0; i < kits.length; i++) {
      kitByVid[kits[i].vid] = kits[i];
      roleByVid[kits[i].vid] = (i === 0) ? 'lead' : ('ally' + i);
    }
    const leadKit = row.leadKit || null;
    const spearFighters = kits.filter(function (k) { return k && (k.rangedClass === 'spear' || k.meleeClass === 'spear'); });
    if (spearFighters.length) { st.spearFights++; d.spearFights++; }
    if (row.gearUpChanged) st.gearUpChanged++;
    if (row.nameCollision) st.nameCollisionFights++;
    const p = parseStrikes(row);
    st.strikeLines += p.strikeLines;
    st.coveredStrikeLines += p.coveredStrikeLines;
    st.mDealtTotal += (row.mDealt | 0);
    st.parsedTotal += p.parsedDmg;
    st.unparsedTotal += p.unparsedDmg;
    st.unknownDmgLines += p.unknownDmgLines.length;
    const volField = (row.volley && typeof row.volley.dmg === 'number') ? row.volley.dmg : 0;
    if (p.volleyParsed !== volField) st.fieldMismatches.volley++;
    if (p.contactParsed !== (row.contactFinishDmg | 0)) st.fieldMismatches.contact++;
    if (p.ambushParsed !== (row.ambushDmg | 0)) st.fieldMismatches.ambush++;

    // Per-fighter weapon damage (strike + echo kinds only) and
    // per-fighter ALL parsed damage (for role/mix/tier views).
    const weaponByVid = {}; // vid -> { weaponDmg, strikes, wb, isLead }
    const allByVid = {}; // vid -> parsed damage of every kind
    for (const s of p.strikes) {
      if (!s.vid) continue; // name collision: unattributed, counted openly below
      const kit = kitByVid[s.vid];
      const w = weaponByVid[s.vid] || (weaponByVid[s.vid] = { weaponDmg: 0, strikes: 0, wb: kit ? (kit.wb | 0) : 0, isLead: s.vid === row.vid });
      if (s.kind === 'strike' || s.kind === 'echo') { w.weaponDmg += s.dmg; w.strikes++; }
      const a = allByVid[s.vid] || (allByVid[s.vid] = 0);
      allByVid[s.vid] = a + s.dmg;
    }
    // Unattributed strikes (name collision) still count in the
    // channel view — they are parsed damage lines, just without a
    // fighter. The role/mix/tier views carry them as
    // 'unattributed', so the three decompositions stay honest.
    let unattributedDmg = 0;
    for (const s of p.strikes) if (!s.vid) unattributedDmg += s.dmg;

    // ---- CHANNEL decomposition (parsed damage by kind) ----
    let weaponDmg = 0;
    for (const vid of Object.keys(weaponByVid)) weaponDmg += weaponByVid[vid].weaponDmg;
    const extraDmg = p.strikes.filter(function (s) { return s.kind === 'extra'; }).reduce(function (a, s) { return a + s.dmg; }, 0);
    st.byChannel.weaponStrikes += weaponDmg;
    st.byChannel.volley += p.volleyParsed;
    st.byChannel.contact += p.contactParsed;
    st.byChannel.ambush += p.ambushParsed;
    st.byChannel.extra += extraDmg;
    st.weaponStrikesTotal += p.strikes.filter(function (s) { return s.kind === 'strike' || s.kind === 'echo'; }).length;

    // ---- ROLE / MIX / TIER decompositions (per fighter) ----
    for (const vid of Object.keys(allByVid)) {
      const kit = kitByVid[vid];
      const dmg = allByVid[vid];
      const role = roleByVid[vid] || 'unattributed';
      st.byRole[role] = (st.byRole[role] || 0) + dmg;
      const mix = kit ? fighterMix(kit) : 'unknown';
      st.byMix[mix] = (st.byMix[mix] || 0) + dmg;
      const tier = kit ? wbTier(kit.wb) : 'unknown';
      st.byTier[tier] = (st.byTier[tier] || 0) + dmg;
    }
    st.byRole.unattributed += unattributedDmg;
    st.byMix.unattributed = (st.byMix.unattributed || 0) + unattributedDmg;
    st.byTier.unattributed = (st.byTier.unattributed || 0) + unattributedDmg;

    // Per-strike means by mix and by tier (weapon strikes only).
    for (const s of p.strikes) {
      if ((s.kind !== 'strike' && s.kind !== 'echo') || !s.vid) continue;
      const kit = kitByVid[s.vid];
      if (!kit) continue;
      bumpMix(fighterMix(kit), s.dmg);
      bumpTier(wbTier(kit.wb), s.dmg);
    }
    // Spear share (continuity with speardmg-a): each fighter's
    // weapon damage split by fold-in share.
    let fightSpearAttr = 0;
    for (const vid of Object.keys(weaponByVid)) {
      const kit = kitByVid[vid];
      if (!kit) continue;
      fightSpearAttr += weaponByVid[vid].weaponDmg * spearShare(kit);
    }
    st.spearAttrDmg += fightSpearAttr;

    // ---- Kill-line gap per fight ----
    const rounds = row.rounds | 0;
    const mDealt = row.mDealt | 0;
    const partyDpr = rounds ? mDealt / rounds : 0;
    const gap = KILL_LINE - partyDpr;
    const mHpStart = (row.mHpStart != null) ? row.mHpStart : null;
    const roundsToKill = (mHpStart != null && partyDpr > 0) ? round1(mHpStart / partyDpr) : null;
    const hpLeft = (mHpStart != null) ? (mHpStart - mDealt) : null;
    const weaponStrikes = p.strikes.filter(function (s) { return s.kind === 'strike' || s.kind === 'echo'; }).length;
    const strikesPerRound = rounds ? round1(weaponStrikes / rounds) : 0;
    const reqWb = requiredWb(weaponStrikes / (rounds || 1));
    if (reqWb != null) st.requiredWbValues.push(reqWb);
    else st.requiredWbUnclosable++;
    if (partyDpr >= KILL_LINE) st.fightsAtKillLine++;
    const fixedDmg = p.volleyParsed + p.contactParsed + p.ambushParsed + extraDmg;
    const cf = counterfactuals({ weaponByVid: weaponByVid, fixedDmg: fixedDmg, rounds: rounds, bestLeadWb: bestLeadWb });
    for (const k of ['A', 'B', 'C', 'D']) if (cf[k] != null) st.counterfactuals[k].push(cf[k]);
    if (row.outcome === 'vKill') st.vKills++;
    st.partyDpr.push({ seed: fr.seed, day: row.day, mid: row.mid, vid: row.vid,
      rounds: rounds, mHpStart: mHpStart, mDealt: mDealt,
      partyDpr: round1(partyDpr), gap: round1(gap),
      roundsToKill: roundsToKill, hpLeft: hpLeft,
      strikesPerRound: strikesPerRound, requiredWb: reqWb,
      weaponStrikes: weaponStrikes,
      leadWb: leadKit ? (leadKit.wb | 0) : null,
      fighters: kits.length, outcome: row.outcome,
      cfA: cf.A, cfB: cf.B, cfC: cf.C, cfD: cf.D });
    st.fightsDetail.push({ seed: fr.seed, day: row.day, mid: row.mid, vid: row.vid,
      rounds: rounds, outcome: row.outcome, mHpStart: mHpStart, mDealt: mDealt,
      partyDpr: round1(partyDpr), gap: round1(gap), hpLeft: hpLeft,
      spearFight: spearFighters.length > 0, unparsedDmg: p.unparsedDmg,
      unknownDmgLines: p.unknownDmgLines.length,
      nameCollision: !!row.nameCollision, gearUpChanged: !!row.gearUpChanged });
  }

  // Coverage + reconciliation (binding).
  st.coverage = st.strikeLines ? st.coveredStrikeLines / st.strikeLines : null;
  st.residual = st.mDealtTotal ? Math.abs(st.mDealtTotal - st.parsedTotal) / st.mDealtTotal : null;
  // Decomposition completeness (binding): each view sums to
  // >= 0.95 of pooled mDealt. The three views are three sums of
  // the same parsed damage, so a miss in any one names a parser
  // or attribution gap, not a data gap.
  function sumObj(o) { return Object.keys(o).reduce(function (a, k) { return a + (o[k] || 0); }, 0); }
  st.decomposition.channel = st.mDealtTotal ? sumObj(st.byChannel) / st.mDealtTotal : null;
  st.decomposition.role = st.mDealtTotal ? sumObj(st.byRole) / st.mDealtTotal : null;
  st.decomposition.mix = st.mDealtTotal ? sumObj(st.byMix) / st.mDealtTotal : null;
  st.decomposition.tier = st.mDealtTotal ? sumObj(st.byTier) / st.mDealtTotal : null;
  // Per-strike means.
  for (const mix of Object.keys(perStrikeMix)) {
    const xs = perStrikeMix[mix];
    st.perStrikeByMix[mix] = { n: xs.length, mean: round1(mean(xs)),
      median: median(xs), min: Math.min.apply(null, xs), max: Math.max.apply(null, xs) };
  }
  for (const tier of Object.keys(perStrikeTier)) {
    const xs = perStrikeTier[tier];
    st.perStrikeByTier[tier] = { n: xs.length, mean: round1(mean(xs)),
      median: median(xs), min: Math.min.apply(null, xs), max: Math.max.apply(null, xs),
      formulaMean: expectedStrikeMean(tier === '0-unarmed' ? 0 : tier === '50+' ? 50 : parseInt(tier.split('-')[0], 10)) };
  }
  st.spearShare = st.mDealtTotal ? st.spearAttrDmg / st.mDealtTotal : null;
  const dprs = st.partyDpr.map(function (r) { return r.partyDpr; });
  st.partyDprMean = dprs.length ? round1(mean(dprs)) : null;
  st.partyDprMedian = dprs.length ? median(dprs) : null;
  st.partyDprMax = dprs.length ? Math.max.apply(null, dprs) : null;
  const gaps = st.partyDpr.map(function (r) { return r.gap; });
  st.gapMean = gaps.length ? round1(mean(gaps)) : null;
  st.strikesPerRoundPooled = st.partyDpr.length
    ? round1(st.partyDpr.reduce(function (a, r) { return a + r.weaponStrikes; }, 0) /
        st.partyDpr.reduce(function (a, r) { return a + r.rounds; }, 0)) : null;
  for (const k of ['A', 'B', 'C', 'D']) {
    const xs = st.counterfactuals[k];
    st.cfSummary[k] = { n: xs.length,
      mean: xs.length ? round1(mean(xs)) : null,
      median: xs.length ? median(xs) : null,
      max: xs.length ? Math.max.apply(null, xs) : null,
      fightsAtKillLine: xs.filter(function (v) { return v >= KILL_LINE; }).length };
  }
  st.requiredWbMedian = st.requiredWbValues.length ? median(st.requiredWbValues) : null;
  const surv = st.wall.survivals.slice().sort(function (a, b) { return a - b; });
  st.wall.medianSurvival = surv.length ? median(surv) : null;
  return st;
}

// ---- judge ----
function judgePartyDmg(st) {
  const decompPass = st.decomposition.channel != null && st.decomposition.channel >= 0.95 &&
    st.decomposition.role != null && st.decomposition.role >= 0.95 &&
    st.decomposition.mix != null && st.decomposition.mix >= 0.95 &&
    st.decomposition.tier != null && st.decomposition.tier >= 0.95;
  const bars = [];
  bars.push({ name: 'pool floor (fought expedition w4+ fights ≥ 8)', bar: 8, measured: st.fights, pass: st.fights >= 8 });
  bars.push({ name: 'decomposition completeness ≥ 0.95 (channel/role/mix/tier)', bar: 0.95, measured: st.decomposition, pass: decompPass });
  bars.push({ name: 'strike-parse coverage ≥ 0.95', bar: 0.95, measured: st.coverage, pass: st.coverage != null && st.coverage >= 0.95 });
  bars.push({ name: 'reconciliation residual ≤ 0.05', bar: 0.05, measured: st.residual, pass: st.residual != null && st.residual <= 0.05 });
  bars.push({ name: 'instrument errors 0', bar: 0, measured: st.errors, pass: st.errors === 0 });
  let verdict = 'DIAG-GO', kind = 'GO';
  if (st.errors > 0) { verdict = 'DIAG-NO-GO'; kind = 'INSTRUMENT'; }
  else if (st.fights < 8) { verdict = 'DIAG-NO-GO'; kind = 'THIN-POOL'; }
  else if (!decompPass || !(st.coverage != null && st.coverage >= 0.95) || !(st.residual != null && st.residual <= 0.05)) { verdict = 'DIAG-NO-GO'; kind = 'ATTRIBUTION'; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarize(st) {
  return {
    fights: st.fights, spearFights: st.spearFights,
    coverage: st.coverage, residual: st.residual, errors: st.errors,
    decomposition: st.decomposition,
    byChannel: st.byChannel, byRole: st.byRole, byMix: st.byMix, byTier: st.byTier,
    partyDprMean: st.partyDprMean, partyDprMedian: st.partyDprMedian, partyDprMax: st.partyDprMax,
    gapMean: st.gapMean, fightsAtKillLine: st.fightsAtKillLine,
    cfSummary: st.cfSummary, bestLeadWb: st.bestLeadWb,
    requiredWbMedian: st.requiredWbMedian, requiredWbUnclosable: st.requiredWbUnclosable,
    strikesPerRoundPooled: st.strikesPerRoundPooled,
    spearShare: st.spearShare, vKills: st.vKills,
    perStrikeByMix: st.perStrikeByMix, perStrikeByTier: st.perStrikeByTier,
    wall: st.wall,
  };
}

// ---- selftest ----
function selftest() {
  let passed = 0, failed = 0;
  function check(name, ok, extra) {
    if (ok) { passed++; }
    else { failed++; console.error('FAIL: ' + name + (extra != null ? ' — ' + extra : '')); }
  }
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'partydmg-selftest-'));
  function kit(vid, name, meleeId, meleeBonus, rangedId, rangedBonus, wb) {
    return { vid: vid, name: name,
      meleeId: meleeId, meleeBonus: meleeBonus, meleeClass: weaponClass(meleeId, DEFS),
      rangedId: rangedId, rangedBonus: rangedBonus, rangedClass: weaponClass(rangedId, DEFS),
      ammo: 0, wb: wb, armorP: 10 };
  }
  // Fixture fight 1 (speardmg selftest row 1): spear-only lead
  // Nina (wb 15) vs Reunion, 3 rounds, vFlee, mDealt 167.
  // Strikes: Nina 50+46, Brendan 40 + echo 5; extra 5; ambush 21.
  const row1 = {
    seq: 1, day: 91, vid: 'nina', mid: 'reunion', wave: 4, origin: 'expedition',
    outcome: 'vFlee', rounds: 3, mHpStart: 1330, vKill: false, noContact: false,
    leadKit: kit('nina', 'Nina', null, 0, 'hunting_spear', 30, 15),
    fighterKits: [kit('brendan', 'Brendan', 'machete', 35, null, 0, 18)],
    postLeadKit: null, gearUpChanged: false, nameCollision: false,
    leadDealt: 117, allyDealt: 50, ally2Dealt: 0, ally3Dealt: 0,
    mDealt: 167, vTaken: 100, allyVid: 'brendan', ally2Vid: null, ally3Vid: null,
    volley: null, contactFinishAttempted: false, contactFinishKill: false,
    contactFinishInstrument: null, contactFinishWeapon: null, contactFinishDmg: null,
    ambushDmg: 21,
    log: [
      'Nina walks straight into The Reunion. No avoiding it.',
      'Nina was already waiting — ambush! Opening strike for 21.',
      "R1: Nina's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
      'R1: Nina strikes for 50 (x2.0) (1280 left)',
      'R2: Nina strikes for 46 (x2.0) (1234 left)',
      'Nina is losing — shouts for help! Brendan charges in!',
      'R3: Brendan strikes for 40 (1194 left)',
      'R3: Brendan strikes again, louder — 5 (1189 left). (Live Broadcast)',
      'R3: Brendan strikes again for 5 (1184 left)',
      'Brendan answered Nina\'s shout, but Nina is past holding — they run while running still works.',
    ],
    roundsDetail: null,
  };
  // Fixture fight 2 (speardmg selftest row 2): bow+melee lead
  // Diego (wb 29) vs Audit, 1 round, vKill, mDealt 53.
  // Volley 14, strike 30, contact 9.
  const row2 = {
    seq: 2, day: 40, vid: 'diego', mid: 'audit', wave: 4, origin: 'expedition',
    outcome: 'vKill', rounds: 1, mHpStart: 53, vKill: true, noContact: false,
    leadKit: kit('diego', 'Diego', 'machete', 35, 'bow', 22, 29),
    fighterKits: [],
    postLeadKit: null, gearUpChanged: false, nameCollision: false,
    leadDealt: 53, allyDealt: 0, ally2Dealt: 0, ally3Dealt: 0,
    mDealt: 53, vTaken: 0, allyVid: null, ally2Vid: null, ally3Vid: null,
    volley: { shots: 2, hits: 1, dmg: 14, ammoLeft: 3 },
    contactFinishAttempted: true, contactFinishKill: true,
    contactFinishInstrument: 'ranged', contactFinishWeapon: 'Bow', contactFinishDmg: 9,
    ambushDmg: null,
    log: [
      'Diego sees The Audit coming and nocks an arrow — the fight opens at range (2 shots).',
      '  loosed — it takes The Audit for 14 (39 left).',
      '  loosed wide — the arrow buries itself in the dirt. (spent)',
      'Diego lowers the bow — The Audit is on them now. (1/2 hit)',
      'R1: Diego strikes for 30 (9 left)',
      'Diego does not let it slip away — they close in and strike with the bow for 9 — The Audit falls. (Contact finish)',
    ],
    roundsDetail: null,
  };
  // Fixture fight 3: zero-strike fight — 1 round, 0 damage, the
  // required-wb solve must return null (unclosable), not Infinity.
  const row3 = {
    seq: 3, day: 60, vid: 'zoe', mid: 'suburb', wave: 4, origin: 'expedition',
    outcome: 'vFlee', rounds: 1, mHpStart: 1400, vKill: false, noContact: false,
    leadKit: kit('zoe', 'Zoe', 'machete', 35, 'crude_bow', 18, 27),
    fighterKits: [],
    postLeadKit: null, gearUpChanged: false, nameCollision: false,
    leadDealt: 0, allyDealt: 0, ally2Dealt: 0, ally3Dealt: 0,
    mDealt: 0, vTaken: 0, allyVid: null, ally2Vid: null, ally3Vid: null,
    volley: null, contactFinishAttempted: false, contactFinishKill: false,
    contactFinishInstrument: null, contactFinishWeapon: null, contactFinishDmg: null,
    ambushDmg: null,
    log: ['Zoe reads the sterile streets — you can’t kill a suburb. They walk out. (Navigation is victory.)'],
    roundsDetail: null,
  };
  function seedFile(seed, fights) {
    return { seed: seed, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, unlockedWave: 4, endReason: 'survived', villageLost: false,
      instrumentErrors: [], bowopenOn: true, speargateOn: true, senseexpedOn: true, fightally2On: true,
      deaths: [], standing: 150,
      bowOpen: { alreadyHad: 0, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 1, spearSeen: 1, spearPassed: 1 },
      bowOpenStagedVids: 1, spearSeen: 1, spearPassed: 1, bowOpenByVid: {},
      spearDeparts: [{ seq: 1, day: 10, vid: 'nina', isSpear: true, preRangedId: 'hunting_spear', preAmmo: 0,
        spearSeenBump: true, source: 'noSource', stagedItemId: null, staged: false, craftedOk: false,
        byVid: { day: 10, source: 'noSource', itemId: null },
        postRangedId: 'hunting_spear', postAmmo: 0, planStage: null, planTarget: null, planNeedWave: null, planParty: [] }],
      allStarts: [], expFights: [], v4encounters: [], spearTrack: [],
      w4dmgFights: fights };
  }
  // 8 fixture seeds: 4 × row1, 3 × row2, 1 × row3 (days shifted).
  const rows = [];
  for (let s = 0; s < 4; s++) { const r = JSON.parse(JSON.stringify(row1)); r.day = 90 + s; rows.push([111801 + s, [r]]); }
  for (let s = 0; s < 3; s++) { const r = JSON.parse(JSON.stringify(row2)); r.day = 40 + s; rows.push([111805 + s, [r]]); }
  const r3 = JSON.parse(JSON.stringify(row3)); r3.day = 60; rows.push([111808, [r3]]);
  for (const pair of rows) fs.writeFileSync(path.join(tmp, 's' + pair[0] + '.json'), JSON.stringify(seedFile(pair[0], pair[1])));

  const st = partyDmgStats(tmp);
  check('stats pool: 8 fights (4+3+1)', st.fights === 8, 'fights ' + st.fights);
  check('stats coverage 1.0, residual 0 on fixtures',
    st.coverage === 1 && st.residual === 0, 'coverage ' + st.coverage + ' residual ' + st.residual);
  check('stats mDealt total 4×167 + 3×53 + 0 = 827', st.mDealtTotal === 827, 'total ' + st.mDealtTotal);
  // Channel: weapon strikes = 4×(96+45) + 3×30 = 564+90 = 654;
  // volley 3×14 = 42; contact 3×9 = 27; ambush 4×21 = 84; extra 4×5 = 20.
  check('channel decomposition sums to mDealt (654+42+27+84+20 = 827)',
    st.byChannel.weaponStrikes === 654 && st.byChannel.volley === 42 && st.byChannel.contact === 27 &&
    st.byChannel.ambush === 84 && st.byChannel.extra === 20,
    JSON.stringify(st.byChannel));
  check('channel completeness 1.0', st.decomposition.channel === 1, 'channel ' + st.decomposition.channel);
  // Role: lead = 4×117 (Nina) + 3×53 (Diego) + 0 (Zoe) = 468+159 = 627; ally1 = 4×50 = 200.
  check('role decomposition: lead 627, ally1 200, unattributed 0',
    st.byRole.lead === 627 && st.byRole.ally1 === 200 && st.byRole.unattributed === 0,
    JSON.stringify(st.byRole));
  check('role completeness 1.0', st.decomposition.role === 1, 'role ' + st.decomposition.role);
  // Mix: spear-only = Nina's 117 × 4 = 468; other-melee-only =
  // Brendan's 50 × 4 = 200; bow+melee = Diego's 53 × 3 = 159.
  check('mix decomposition: spear-only 468, other-melee-only 200, bow+melee 159',
    st.byMix['spear-only'] === 468 && st.byMix['other-melee-only'] === 200 && st.byMix['bow+melee'] === 159,
    JSON.stringify(st.byMix));
  check('mix completeness 1.0', st.decomposition.mix === 1, 'mix ' + st.decomposition.mix);
  // Tier: Nina wb 15 → 10-19: 468; Brendan wb 18 → 10-19: 200;
  // Diego wb 29 → 20-29: 159; Zoe wb 27 → 20-29: 0 damage.
  check('tier decomposition: 10-19 = 668, 20-29 = 159',
    st.byTier['10-19'] === 668 && st.byTier['20-29'] === 159, JSON.stringify(st.byTier));
  check('tier completeness 1.0', st.decomposition.tier === 1, 'tier ' + st.decomposition.tier);
  // Per-strike means: spear-only (50+46)/2 = 48; other-melee-only
  // (40+5)/2 = 22.5; bow+melee 30/1 = 30.
  check('per-strike spear-only mean 48', st.perStrikeByMix['spear-only'] && st.perStrikeByMix['spear-only'].mean === 48,
    JSON.stringify(st.perStrikeByMix['spear-only']));
  check('per-strike other-melee-only mean 22.5', st.perStrikeByMix['other-melee-only'] && st.perStrikeByMix['other-melee-only'].mean === 22.5,
    JSON.stringify(st.perStrikeByMix['other-melee-only']));
  // Kill-line gap: row1 partyDpr 167/3 = 55.7, gap 55.3,
  // roundsToKill 1330/55.67 = 23.9, hpLeft 1163.
  const f1 = st.partyDpr.find(function (r) { return r.mid === 'reunion'; });
  check('fight 1 gap: dpr 55.7, gap 55.3, roundsToKill 23.9, hpLeft 1163',
    f1 && f1.partyDpr === 55.7 && f1.gap === 55.3 && f1.roundsToKill === 23.9 && f1.hpLeft === 1163,
    JSON.stringify(f1));
  check('fight 1 strikesPerRound 1.3 (4 strikes / 3 rounds)',
    f1 && f1.strikesPerRound === 1.3, JSON.stringify(f1 && f1.strikesPerRound));
  check('fight 1 requiredWb 77.3 (111/1.333 − 6)',
    f1 && f1.requiredWb === 77.3, JSON.stringify(f1 && f1.requiredWb));
  // Fight 3 (zero strikes): requiredWb null, counted unclosable.
  const f3 = st.partyDpr.find(function (r) { return r.mid === 'suburb'; });
  check('fight 3 (zero strikes): requiredWb null, dpr 0, gap 111',
    f3 && f3.requiredWb === null && f3.partyDpr === 0 && f3.gap === 111, JSON.stringify(f3));
  check('requiredWbUnclosable counts the zero-strike fight (1)',
    st.requiredWbUnclosable === 1, 'unclosable ' + st.requiredWbUnclosable);
  // Counterfactuals on fight 1 (best lead wb across the corpus
  // is Diego's 29): A: Nina 96×36/21 + Brendan 45×36/24 = 164.6
  // + 67.5 = 232.1; + fixed 26 = 258.1; /3 = 86.0.
  // B: lead Nina 96×(6+29)/(6+15) = 96×35/21 = 160; Brendan 45;
  // + fixed 26 = 231; /3 = 77.0. C: Nina 96×56/21 = 256;
  // Brendan 45×56/24 = 105; + 26 = 387; /3 = 129.0.
  // D: Nina 48×3 = 144; Brendan 22.5×3 = 67.5; + 26 = 237.5;
  // /3 = 79.2.
  check('counterfactual A on fight 1 is 86.0', f1 && f1.cfA === 86, JSON.stringify(f1 && f1.cfA));
  check('counterfactual B on fight 1 is 77.0 (lead to wb 29)', f1 && f1.cfB === 77, JSON.stringify(f1 && f1.cfB));
  check('counterfactual C on fight 1 is 129.0 (closes the line)', f1 && f1.cfC === 129, JSON.stringify(f1 && f1.cfC));
  check('counterfactual D on fight 1 is 79.2', f1 && f1.cfD === 79.2, JSON.stringify(f1 && f1.cfD));
  check('bestLeadWb across the corpus is 29 (Diego)', st.bestLeadWb === 29, 'best ' + st.bestLeadWb);
  // Counterfactual summary: C reaches the line on the 4 row1
  // fights only (129 ≥ 111); A/B/D reach it on none.
  check('cf summary: C reaches the line on 4/8 fights, A/B/D on 0',
    st.cfSummary.C.fightsAtKillLine === 4 && st.cfSummary.A.fightsAtKillLine === 0 &&
    st.cfSummary.B.fightsAtKillLine === 0 && st.cfSummary.D.fightsAtKillLine === 0,
    JSON.stringify(st.cfSummary));
  check('party dpr mean across 8 fights is 55.7×4 + 53×3 + 0, /8 = 47.7',
    st.partyDprMean === 47.7, 'mean ' + st.partyDprMean);
  check('spear share: Nina weapon 96×4 = 384 of 827 = 0.464',
    Math.abs(st.spearShare - 384 / 827) < 1e-9, 'share ' + st.spearShare);
  // Judge shapes.
  let j = judgePartyDmg(st);
  check('judge DIAG-GO on the fixture corpus', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judgePartyDmg(Object.assign({}, st, { fights: 5 }));
  check('judge DIAG-NO-GO THIN-POOL when fights < 8', j.verdict === 'DIAG-NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judgePartyDmg(Object.assign({}, st, { coverage: 0.8 }));
  check('judge DIAG-NO-GO ATTRIBUTION when coverage < 0.95', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION', JSON.stringify(j));
  j = judgePartyDmg(Object.assign({}, st, { decomposition: { channel: 1, role: 0.9, mix: 1, tier: 1 } }));
  check('judge DIAG-NO-GO ATTRIBUTION when a decomposition < 0.95', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION', JSON.stringify(j));
  j = judgePartyDmg(Object.assign({}, st, { residual: 0.2 }));
  check('judge DIAG-NO-GO ATTRIBUTION when residual > 0.05', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION', JSON.stringify(j));
  j = judgePartyDmg(Object.assign({}, st, { errors: 1 }));
  check('judge DIAG-NO-GO INSTRUMENT when errors > 0', j.verdict === 'DIAG-NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  // wbTier + formula helpers.
  check('wbTier bands: 0/5/15/25/40/60', wbTier(0) === '0-unarmed' && wbTier(5) === '1-9' && wbTier(15) === '10-19' &&
    wbTier(25) === '20-29' && wbTier(40) === '30-49' && wbTier(60) === '50+', '');
  check('expectedStrikeMean: wb 0 → 6, wb 15 → 21, wb 50 → 56',
    expectedStrikeMean(0) === 6 && expectedStrikeMean(15) === 21 && expectedStrikeMean(50) === 56, '');
  check('requiredWb: 1.333 strikes/round → 77.3; 0 strikes → null',
    requiredWb(4 / 3) === 77.3 && requiredWb(0) === null, '');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-partydmg-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  if (!dir) { console.error('usage: analyze-partydmg-a.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const st = partyDmgStats(dir);
  const j = judgePartyDmg(st);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, summary: summarize(st), stats: st };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars, summary: result.summary }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { partyDmgStats: partyDmgStats, judgePartyDmg: judgePartyDmg,
  counterfactuals: counterfactuals, requiredWb: requiredWb, wbTier: wbTier,
  expectedStrikeMean: expectedStrikeMean, parseStrikes: parseStrikes,
  fighterMix: fighterMix, spearShare: spearShare, meleeShare: meleeShare,
  rangedShare: rangedShare, weaponClass: weaponClass, ammoCapable: ammoCapable,
  loadDefs: loadDefs, KILL_LINE_DPR: KILL_LINE_DPR, KILL_LINE: KILL_LINE };
