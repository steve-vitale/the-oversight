// analyze-fightcap-a.js — analyzer + judge, arm sim-fightcap-a.
// DIAG: can launched parties WIN wave-4 fights? (finding #2538, the
// arrival price.) Re-analyzes the 1015Z pilot-band corpora AND judges a
// fresh pilot band, both from the same driver format
// (launchparty-sense-driver-a.js corpora: v4encounters + v4gates +
// v4departs + samples.villagers + daily rosters).
//
// Population (per leg): launched wave-4+ expedition meetings —
// v4encounters row with origin 'expedition', wave >= 4, joined to its
// v4gates row (same day+vid+mid, first match) with a non-empty
// planParty — restricted to TRIO+ launches (|planParty| >= 2, i.e. the
// full launched party is size >= 3), the launched party PRESENT at the
// meeting (corrected arrival, piecewise: |planParty| <= 2 means
// planParty ⊆ allyVids; |planParty| = 3 means allyVids ⊆ planParty
// with |allyVids| = 2 — the engine's 2-ally cap), and ENGAGED
// (rounds > 0; evades join nobody and are excluded).
//
// Primary: win share = (vKill + mFlee) / n — the party kills the
// monster or drives it off (monster disengages, party holds the field).
// Losses are vDie (fighter dies) and vFlee (fighter flees). Kill-only
// share (vKill / n) is reported beside it, never substituted.
//
// Per-meeting decomposition (meetingsDetail): party size/composition,
// each member's gear (armed/armored/armorP from the gate row), monster
// kind + HP (mHpStart), damage dealt (mDealt, lead-only — pack-hunt /
// bird holes #2497/#2501 noted, not corrected — PLUS per-fighter strike
// totals parsed from the encounter log lines), damage taken (vTaken),
// rounds, outcome, gate result/reason (should the gate have held them
// back), abilities (nearest samples.villagers snapshot at or before
// the meeting day, plus ability tokens named in the log lines).
//
// Secondary population (reported, not judged): pair-inclusive
// (minPlanParty=1) — same filters with the size floor lowered to
// |planParty| >= 1. The trio+ pool is thin on 8 seeds (2 arm meetings
// on the 1015Z band), so the pair-inclusive pool is where the
// statistical power lives; the DIAG verdict may rest on it.
//
// Usage:
//   node scripts/analyze-fightcap-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge]
//   node scripts/analyze-fightcap-a.js --selftest
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
    launchpartyOn: {}, fightally2On: {},
    meetings: 0, wins: 0, kills: 0, losses: 0, vDie: 0, vFlee: 0, mFlee: 0,
    winShare: null, killShare: null,
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
  let gateAvoid = 0, gateNull = 0, gateSeek = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    if (!d || typeof d !== 'object') { st.errors++; continue; }
    st.valid++;
    st.errors += ((d.instrumentErrors || []).length);
    if (d.launchpartyOn != null) st.launchpartyOn[String(d.launchpartyOn)] = (st.launchpartyOn[String(d.launchpartyOn)] || 0) + 1;
    if (d.fightally2On != null) st.fightally2On[String(d.fightally2On)] = (st.fightally2On[String(d.fightally2On)] || 0) + 1;
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
      if (!st.byOutcome[outcome]) st.byOutcome[outcome] = { n: 0, rounds: [], dmgShare: [], vTaken: [], partySize: [], minArmorP: [], meanArmorP: [], mHpStart: [], abilitiesPerMember: [], fighterDmgShare: [], parsedStrikeTotal: [] };
      const bo = st.byOutcome[outcome];
      bo.n++;
      bo.rounds.push(r.rounds | 0);
      if (dmgShare != null) bo.dmgShare.push(dmgShare);
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
  st.gateAvoidShare = st.meetings ? gateAvoid / st.meetings : null;
  st.gateNullShare = st.meetings ? gateNull / st.meetings : null;
  st.gateSeekShare = st.meetings ? gateSeek / st.meetings : null;
  for (const o of Object.keys(st.byOutcome)) {
    const bo = st.byOutcome[o];
    st.dmgShareByOutcome[o] = mean(bo.dmgShare);
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
  const bars = [];
  const poolOk = arm.meetings >= 10;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'engaged launched-party meetings (trio+, present): arm ' + arm.meetings + ' (floor 10); ctl ' + ctl.meetings });
  const winPass = arm.winShare != null && arm.winShare >= 0.50;
  bars.push({ id: 'win-share', pass: winPass,
    detail: 'arm win share ' + (arm.winShare == null ? 'n/a' : arm.winShare.toFixed(3)) + ' (' + arm.wins + '/' + arm.meetings + ', kills ' + arm.kills + ', mFlee ' + arm.mFlee + ', vDie ' + arm.vDie + ', vFlee ' + arm.vFlee + ') vs ctl ' + (ctl.winShare == null ? 'n/a' : ctl.winShare.toFixed(3)) + ' (' + ctl.wins + '/' + ctl.meetings + ') (bar arm>=0.50)' });
  const commPass = arm.communityLost / 8 <= ctl.communityLost / 8 + 0.125 + 1e-9;
  bars.push({ id: 'cost-community-loss', pass: commPass,
    detail: 'community loss arm ' + arm.communityLost + '/8 vs ctl ' + ctl.communityLost + '/8 (bar arm share <= ctl share + 0.125, i.e. at most ' + (ctl.communityLost + 1) + ' villages)' });
  const starvPass = arm.starvation <= ctl.starvation + 2 && arm.starvationVillager <= ctl.starvationVillager + 2;
  bars.push({ id: 'cost-starvation', pass: starvPass,
    detail: 'starvation totals arm ' + arm.starvation + ' vs ctl ' + ctl.starvation + '; villager arm ' + arm.starvationVillager + ' vs ctl ' + ctl.starvationVillager + ' (bar arm<=ctl+2 both)' });
  const medPass = ctl.medianDays == null || arm.medianDays == null || arm.medianDays >= 0.8 * ctl.medianDays;
  bars.push({ id: 'cost-median', pass: medPass,
    detail: 'median survival arm ' + arm.medianDays + 'd vs ctl ' + ctl.medianDays + 'd (bar arm>=0.8x ctl)' });
  let verdict = 'NO-GO';
  let kind = '';
  if (!poolOk) { verdict = 'DIAG-GO'; kind = 'THIN-POOL'; }
  else if (bars.every(function (b) { return b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'launchpartyOn', 'fightally2On',
    'meetings', 'wins', 'kills', 'losses', 'vDie', 'vFlee', 'mFlee',
    'winShare', 'killShare', 'funnel', 'byOutcome', 'gateXOutcome',
    'gateAvoidShare', 'gateNullShare', 'gateSeekShare',
    'lossGateNull', 'lossGateAvoid', 'lossGateSeek',
    'monsterByOutcome', 'dmgShareMean', 'dmgShareByOutcome',
    'roundsMean', 'vTakenMean',
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
      { day: 20, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'vKill', rounds: 5, mDealt: 500, mHpStart: 1000, vTaken: 100, log: ['R1: Holly strikes for 60 (940 left)', 'R1: Cora strikes for 20 (920 left)', 'R1: Holly\'s eyes go red. (Rage)'] },
      // trio present, engaged, LOSS by death; gate said avoid (held back, fought anyway)
      { day: 21, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'vDie', rounds: 8, mDealt: 200, mHpStart: 1000, vTaken: 900, log: ['R1: Holly strikes for 30 (970 left)'] },
      // stranger fills a seat: party NOT present -> excluded
      { day: 22, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['s1', 'c2'], allyVid: 's1', ally2Vid: 'c2', outcome: 'vKill', rounds: 4, mDealt: 500, mHpStart: 1000, vTaken: 50, log: [] },
      // pair launch: excluded (trio+ only)
      { day: 23, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1'], allyVid: 'c1', ally2Vid: null, outcome: 'vKill', rounds: 4, mDealt: 500, mHpStart: 1000, vTaken: 50, log: [] },
      // quad launch, 2-subset present, WIN by monster flee
      { day: 24, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', outcome: 'mFlee', rounds: 3, mDealt: 100, mHpStart: 1000, vTaken: 40, log: ['R1: Cid strikes for 10 (990 left)'] },
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
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  // Judge shapes.
  function mk(o) {
    return Object.assign({ meetings: 12, wins: 6, kills: 3, mFlee: 3, vDie: 3, vFlee: 3, winShare: 0.5, communityLost: 1, starvation: 0, starvationVillager: 0, medianDays: 150 }, o);
  }
  let j = judge(mk({}), mk({}));
  check('judge GO shape passes', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mk({}), mk({ winShare: 0.4, wins: 4, kills: 2, mFlee: 2, vDie: 4, vFlee: 4 }));
  check('judge NO-GO when win share under 0.50', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mk({}), mk({ meetings: 7, wins: 6, winShare: 6 / 7 }));
  check('judge DIAG-GO (thin pool) when below floor', j.verdict === 'DIAG-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judge(mk({ communityLost: 1 }), mk({ communityLost: 3 }));
  check('judge NO-GO when community loss breaches ctl+0.125', j.verdict === 'NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mk({ communityLost: 1 }), mk({ communityLost: 2 }));
  check('judge GO when community loss is exactly ctl+0.125', j.verdict === 'GO' && j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mk({}), mk({ starvation: 3 }));
  check('judge NO-GO when starvation breaches ctl+2', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  console.log('analyze-fightcap-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  if (!ctlDir || !armDir) { console.error('usage: analyze-fightcap-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge] | --selftest'); process.exit(2); }
  const ctl = legStats(ctlDir);
  const arm = legStats(armDir);
  // Secondary population: pair-inclusive (minPlanParty=1) — same
  // filters, reported beside the trio+ primary; the trio+ pool is thin
  // on 8 seeds, so this is where the statistical power lives.
  const ctlPair = legStats(ctlDir, { minPlanParty: 1 });
  const armPair = legStats(armDir, { minPlanParty: 1 });
  const j = noJudge ? null : judge(ctl, arm);
  const result = { verdict: j ? j.verdict : null, kind: j ? j.kind : null, bars: j ? j.bars : null,
    ctl: summarize(ctl), arm: summarize(arm),
    ctlPair: summarize(ctlPair), armPair: summarize(armPair),
    ctlMeetings: ctl.meetingsDetail, armMeetings: arm.meetingsDetail,
    ctlPairMeetings: ctlPair.meetingsDetail, armPairMeetings: armPair.meetingsDetail };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars, ctl: summarize(ctl), arm: summarize(arm), ctlPair: summarize(ctlPair), armPair: summarize(armPair) }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { legStats: legStats, judge: judge, parseStrikes: parseStrikes, parseAbilityTokens: parseAbilityTokens };
