// analyze-speardmg-a.js — DIAG analyzer, arm sim-speardmg-a
// (SPEAR-FIGHT DAMAGE DIAGNOSTIC: what damage does the spear
// actually contribute inside wave-4 fights?)
//
// Reads per-seed JSONs from the speardmg driver (w4dmgFights rich
// rows) and answers, from the fight record itself:
//   - spear strikes per fight, damage per spear strike vs other
//     weapons in the same fights (fighter weapon-mix classes)
//   - spear-attributed damage share of total party damage
//   - spear-led vs companion-led fights
//   - spear carriers' kill contribution (vKill fights)
//   - spear vs bow/axe/sword damage share
//   - the kill-line verdict: spear-attributed dpr vs the ~111/round
//     a wave-4 fight needs (leadworst-a), monster HP 850-1500
//
// Weapon attribution rule (frozen, prereg §1): the engine folds
// weapons — a strike has no single weapon, it has a wb
// (fieldFights.js: wb = round((meleeBonus + rangedBonus)/2),
// strike = lroll([4+wb, 8+wb])). A fighter's weapon-strike damage
// is attributed across their weapons by bonus share of wb:
// spearShare = (spearBonus/2)/wb over both slots. The analyzer
// ALSO reports the clean sub-population with no attribution at
// all: spear-only fighters' raw per-strike mean vs melee-only vs
// bow-only.
//
// Strike parsing: the fight log narrates every strike as
//   R{n}: {Name} strikes for {dmg} ...
// the Live Broadcast echo as
//   R{n}: {Name} strikes again, louder — {dmg} ...
// the extra-ally ability strike as
//   R{n}: {Name} strikes again for {dmg} ...
// the ambush as
//   {Name} was already waiting — ambush! Opening strike for {dmg}.
// the contact finish as
//   {Name} closes in and strikes with the {weapon} for {dmg} ...
//   (kill shape: {Name} does not let it slip away — they close in
//   and strike with the {weapon} for {dmg} ...)
// volley hits as
//   '  the {Weapon} fires — it takes {monster} for {dmg} ...' /
//   '  loosed — [the bolt|the stone|it] takes {monster} for {dmg} ...'
// Names are the engine's own refName (firstRef for villagers,
// first word of displayName for the player) — the driver records
// entry names with the same rule, so parsing is exact by
// construction. Two fighters sharing a first name in one fight
// is flagged nameCollision and its strike lines are counted
// unattributed, never guessed.
//
// Reconciliation (binding, prereg §2): pooled
// |parsed damage + volley + contactFinish + ambush − mDealt| /
// pooled mDealt ≤ 0.05. The residual is ability damage the log
// does not itemize (gpOut.dealt); it is reported per fight as
// unparsedDmg, never folded into any weapon's share.
//
// Usage:
//   node scripts/analyze-speardmg-a.js --dir DIR [--out FILE]
//   node scripts/analyze-speardmg-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');
const { weaponClass, ammoCapable, loadDefs } = require(path.join(__dirname, 'analyze-spearopen-a'));
const DEFS = loadDefs();

// The kill line (frozen reference, leadworst-a): a wave-4 fight
// needs ~111 damage/round to kill inside the morale window; the
// best-armed lead in EVERY meeting reaches only ~70.5 dpr.
const KILL_LINE_DPR = 111;
const W4_HP_LO = 850, W4_HP_HI = 1500;

// ---- strike-line patterns (read off src/js/fieldFights.js) ----
const RE_STRIKE = /^R(\d+): (.+?) strikes for (\d+)/;
const RE_ECHO = /^R(\d+): (.+?) strikes again, louder — (\d+)/;
const RE_EXTRA = /^R(\d+): (.+?) strikes again for (\d+)/;
const RE_AMBUSH = /^(.+?) was already waiting — ambush! Opening strike for (\d+)/;
const RE_CONTACT = /^(.*?) (?:does not let it slip away — they )?closes? in and strikes? with the (.+?) for (\d+)/;
const RE_VOLLEY = /^  (?:the .+? fires|loosed) — .*? for (\d+) \(\d+ left\)/;
const RE_MONSTER_HIT = / hits .+ for \d+ \(\d+ left\)/;
const RE_DMG_LEFT = / for (\d+) \(\d+ left\)/;

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
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}

// fighterMix(kit): the fighter's strike weapon-mix class, from the
// entry kit (live defs via the shared taxonomy — never a hardcoded
// id list). 'spear-only' is the clean population: the spear is the
// fighter's whole wb, so every strike is a spear strike with no
// attribution needed.
function fighterMix(kit) {
  if (!kit) return 'unknown';
  const r = kit.rangedClass || 'none';
  const m = kit.meleeClass || 'none';
  const hasMelee = !!(kit.meleeId);
  if (r === 'spear') return hasMelee ? 'spear+melee' : 'spear-only';
  if (m === 'spear') return 'spear-melee-slot';
  if (r === 'bow') return hasMelee ? 'bow+melee' : 'bow-only';
  if (r === 'crossbow') return hasMelee ? 'crossbow+melee' : 'crossbow';
  if (r === 'sling') return hasMelee ? 'sling+melee' : 'sling';
  if (r === 'searcaster') return hasMelee ? 'searcaster+melee' : 'searcaster';
  if (r === 'other-ranged') return hasMelee ? 'other-ranged+melee' : 'other-ranged';
  if (hasMelee) return 'other-melee-only';
  if (r === 'other-melee') return 'other-melee-only';
  return 'unarmed';
}
// spearShare(kit): the spear's share of the fighter's wb — the
// fold-in attribution (prereg §1). Both slots count: a spear in
// the ranged slot contributes rangedBonus/2, a spear in the melee
// slot meleeBonus/2. 0 when wb is 0 or no spear is carried.
function spearShare(kit) {
  if (!kit || !(kit.wb > 0)) return 0;
  let s = 0;
  if (kit.rangedClass === 'spear') s += (kit.rangedBonus || 0) / 2;
  if (kit.meleeClass === 'spear') s += (kit.meleeBonus || 0) / 2;
  return s / kit.wb;
}
// meleeShare / rangedShare: the fold-in halves (used for the
// melee-vs-ranged split of weapon-strike damage).
function meleeShare(kit) {
  if (!kit || !(kit.wb > 0)) return 0;
  return (kit.meleeBonus || 0) / 2 / kit.wb;
}
function rangedShare(kit) {
  if (!kit || !(kit.wb > 0)) return 0;
  return (kit.rangedBonus || 0) / 2 / kit.wb;
}

// parseStrikes(row): pure. Parses one w4dmgFights row's log into
// per-fighter strike rows. Returns:
//   { strikes, byVid, parsedDmg, volleyParsed, contactParsed,
//     ambushParsed, strikeLines, coveredStrikeLines,
//     unknownDmgLines, unparsedDmg }
// strikes: [{vid, name, kind, round, dmg}] — kind ∈ strike / echo
//   (weapon-formula) / extra (ability [3,6]) / ambush / contact /
//   volley. unparsedDmg = row.mDealt − parsedDmg (signed; the
//   ability-damage residual, reported openly).
function parseStrikes(row) {
  const kits = [];
  if (row.leadKit) kits.push(row.leadKit);
  for (const k of (row.fighterKits || [])) kits.push(k);
  // name -> vid, only when unique across the fight's fighters.
  const nameCount = {};
  for (const k of kits) {
    const n = k && k.name;
    if (!n || n === 'Someone') continue;
    nameCount[n] = (nameCount[n] || 0) + 1;
  }
  const nameToVid = {};
  for (const k of kits) {
    const n = k && k.name;
    if (!n || n === 'Someone') continue;
    if (nameCount[n] === 1) nameToVid[n] = k.vid;
  }
  const leadVid = row.vid;
  const strikes = [];
  const byVid = {};
  function addStrike(vid, name, kind, round, dmg) {
    const s = { vid: vid, name: name, kind: kind, round: round, dmg: dmg };
    strikes.push(s);
    if (vid) {
      const b = byVid[vid] || (byVid[vid] = { strikes: 0, strikeDmg: 0, echoDmg: 0, extraDmg: 0, weaponDmg: 0 });
      if (kind === 'strike') { b.strikes++; b.strikeDmg += dmg; b.weaponDmg += dmg; }
      else if (kind === 'echo') { b.strikes++; b.echoDmg += dmg; b.weaponDmg += dmg; }
      else if (kind === 'extra') { b.extraDmg += dmg; }
    }
    return s;
  }
  let parsedDmg = 0, volleyParsed = 0, contactParsed = 0, ambushParsed = 0;
  let strikeLines = 0, coveredStrikeLines = 0;
  const unknownDmgLines = [];
  for (const raw of (row.log || [])) {
    const ln = String(raw);
    let m = RE_ECHO.exec(ln);
    if (m) {
      strikeLines++;
      const vid = nameToVid[m[2]] || null;
      if (vid) coveredStrikeLines++;
      const dmg = parseInt(m[3], 10);
      addStrike(vid, m[2], 'echo', parseInt(m[1], 10), dmg);
      parsedDmg += dmg;
      continue;
    }
    m = RE_EXTRA.exec(ln);
    if (m) {
      strikeLines++;
      const vid = nameToVid[m[2]] || null;
      if (vid) coveredStrikeLines++;
      const dmg = parseInt(m[3], 10);
      addStrike(vid, m[2], 'extra', parseInt(m[1], 10), dmg);
      parsedDmg += dmg;
      continue;
    }
    m = RE_STRIKE.exec(ln);
    if (m) {
      strikeLines++;
      const vid = nameToVid[m[2]] || null;
      if (vid) coveredStrikeLines++;
      const dmg = parseInt(m[3], 10);
      addStrike(vid, m[2], 'strike', parseInt(m[1], 10), dmg);
      parsedDmg += dmg;
      continue;
    }
    m = RE_AMBUSH.exec(ln);
    if (m) {
      const vid = nameToVid[m[1]] || leadVid;
      const dmg = parseInt(m[2], 10);
      addStrike(vid, m[1], 'ambush', 0, dmg);
      ambushParsed += dmg;
      parsedDmg += dmg;
      continue;
    }
    m = RE_CONTACT.exec(ln);
    if (m) {
      // The kill shape carries an infix ("X does not let it slip
      // away — they close in and strike ...") — the name is the
      // FIRST WORD of the prefix (refName is a first name).
      const nm = String(m[1]).split(' ')[0];
      const vid = nameToVid[nm] || leadVid;
      const dmg = parseInt(m[3], 10);
      addStrike(vid, nm, 'contact', 0, dmg);
      contactParsed += dmg;
      parsedDmg += dmg;
      continue;
    }
    m = RE_VOLLEY.exec(ln);
    if (m) {
      const dmg = parseInt(m[1], 10);
      addStrike(leadVid, null, 'volley', 0, dmg);
      volleyParsed += dmg;
      parsedDmg += dmg;
      continue;
    }
    // Any other line carrying a "(N left)" damage number that is
    // NOT a monster hit on a villager is party damage the parser
    // does not itemize — count it openly as unknown, never guess.
    if (RE_DMG_LEFT.test(ln) && !RE_MONSTER_HIT.test(ln)) {
      unknownDmgLines.push(ln.slice(0, 200));
    }
  }
  return { strikes: strikes, byVid: byVid, parsedDmg: parsedDmg,
    volleyParsed: volleyParsed, contactParsed: contactParsed, ambushParsed: ambushParsed,
    strikeLines: strikeLines, coveredStrikeLines: coveredStrikeLines,
    unknownDmgLines: unknownDmgLines,
    unparsedDmg: (row.mDealt | 0) - parsedDmg };
}

// ---- stats ----
// spearDmgStats(dir): reads the driver's per-seed JSONs and
// aggregates the damage diagnostic. Fights are the population:
// expedition-origin wave-4+ fieldFights with rounds > 0.
function spearDmgStats(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    seeds: [],
    // Pool (prereg §2).
    fights: 0, spearFights: 0, spearLedFights: 0, spearCompanionFights: 0,
    fightsDetail: [],
    // Reconciliation (binding).
    strikeLines: 0, coveredStrikeLines: 0, coverage: null,
    mDealtTotal: 0, parsedTotal: 0, unparsedTotal: 0, residual: null,
    fieldMismatches: { volley: 0, contact: 0, ambush: 0 },
    unknownDmgLines: 0,
    gearUpChanged: 0, nameCollisionFights: 0,
    // Damage by fighter weapon-mix class (weapon strikes only:
    // kinds strike + echo — the tactical formula; extra [3,6]
    // ability strikes are reported separately, never mixed in).
    perStrikeByMix: {},
    // Attribution (fold-in shares, prereg §1).
    spearAttrDmg: 0, meleeAttrDmg: 0, rangedAttrDmg: 0,
    volleyDmg: 0, contactDmg: 0, ambushDmg: 0, extraDmg: 0,
    spearShare: null,
    // Per-fight spear dpr (the kill-line question).
    spearDprPerFight: [],
    spearDprMean: null, spearDprMax: null,
    partyDprMean: null,
    // Kills + contact finish + volley check.
    vKills: 0, spearLedVKills: 0, vKillSpearShares: [],
    contactFinish: { attempted: 0, kills: 0, byInstrument: {} },
    spearLeadVolleyNonNull: 0, spearLeadVolleyRows: [],
    // Spear strikes per fight, by tier.
    spearStrikesPerFight: [],
    spearStrikesByTier: {},
    // Staging sniff test (spearlead ledger reconciliation).
    spearSeen: 0, spearPassed: 0, ledgerDepartures: 0,
    reconciliation: [],
    // Wall numbers (scale-onramp axis).
    wall: { national: 0, table: null, wins: 0, wave4Unlocked: 0, wave5Unlocked: 0,
      medianSurvival: null, communityLost: 0, scaleRanks: {}, deaths: 0,
      deathKinds: {}, starvation: 0, survivals: [] },
  };
  const perStrike = {}; // mix -> [dmg]
  function bumpMix(mix, dmg) {
    (perStrike[mix] || (perStrike[mix] = [])).push(dmg);
  }
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
    // Wall numbers.
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
    // Staging sniff test: ledger spear departures vs the
    // game-maintained spearSeen counter.
    const ledgerRows = (d.spearDeparts || []).filter(function (r) { return r.isSpear; }).length;
    st.ledgerDepartures += ledgerRows;
    st.spearSeen += (d.spearSeen | 0);
    st.spearPassed += (d.spearPassed | 0);
    st.reconciliation.push({ seed: d.seed, ledger: ledgerRows, spearSeen: d.spearSeen,
      match: ledgerRows === (d.spearSeen | 0) });
    // The fight population.
    const fights = (d.w4dmgFights || []).filter(function (r) { return (r.rounds | 0) > 0; });
    for (const row of fights) {
      st.fights++;
      seedRow.fights++;
      const kits = [];
      if (row.leadKit) kits.push(row.leadKit);
      for (const k of (row.fighterKits || [])) kits.push(k);
      const kitByVid = {};
      for (const k of kits) kitByVid[k.vid] = k;
      const leadKit = row.leadKit || null;
      const spearFighters = kits.filter(function (k) { return k && (k.rangedClass === 'spear' || k.meleeClass === 'spear'); });
      const isSpearFight = spearFighters.length > 0;
      const isSpearLed = !!(leadKit && (leadKit.rangedClass === 'spear' || leadKit.meleeClass === 'spear'));
      if (isSpearFight) { st.spearFights++; seedRow.spearFights++; }
      if (isSpearLed) st.spearLedFights++;
      else if (isSpearFight) st.spearCompanionFights++;
      if (row.gearUpChanged) st.gearUpChanged++;
      if (row.nameCollision) st.nameCollisionFights++;
      const p = parseStrikes(row);
      st.strikeLines += p.strikeLines;
      st.coveredStrikeLines += p.coveredStrikeLines;
      st.mDealtTotal += (row.mDealt | 0);
      st.parsedTotal += p.parsedDmg;
      st.unparsedTotal += p.unparsedDmg;
      st.unknownDmgLines += p.unknownDmgLines.length;
      // Field cross-checks: parsed volley/contact/ambush vs the
      // row's own fields (the engine's numbers, not the parser's).
      const volField = (row.volley && typeof row.volley.dmg === 'number') ? row.volley.dmg : 0;
      if (p.volleyParsed !== volField) st.fieldMismatches.volley++;
      if (p.contactParsed !== (row.contactFinishDmg | 0)) st.fieldMismatches.contact++;
      if (p.ambushParsed !== (row.ambushDmg | 0)) st.fieldMismatches.ambush++;
      // Per-strike means by mix class (weapon strikes only).
      let fightSpearStrikes = 0, fightSpearStrikeDmg = 0;
      for (const vid of Object.keys(p.byVid)) {
        const b = p.byVid[vid];
        const kit = kitByVid[vid];
        if (!kit) continue;
        const mix = fighterMix(kit);
        for (const s of p.strikes) {
          if (s.vid === vid && (s.kind === 'strike' || s.kind === 'echo')) bumpMix(mix, s.dmg);
        }
        if (kit.rangedClass === 'spear' || kit.meleeClass === 'spear') {
          fightSpearStrikes += b.strikes;
          fightSpearStrikeDmg += b.weaponDmg;
        }
      }
      // Fold-in attribution (prereg §1): each fighter's weapon
      // damage split by bonus share; volley to the lead's ranged
      // class; contact finish by its instrument; ambush by the
      // lead's mix shares.
      let fightSpearAttr = 0, fightMeleeAttr = 0, fightRangedAttr = 0;
      for (const vid of Object.keys(p.byVid)) {
        const b = p.byVid[vid];
        const kit = kitByVid[vid];
        if (!kit) continue;
        const ss = spearShare(kit), ms = meleeShare(kit), rs = rangedShare(kit);
        fightSpearAttr += b.weaponDmg * ss;
        fightMeleeAttr += b.weaponDmg * ms;
        // Ranged attribution counts only the non-spear ranged
        // share (a spear's ranged half is already in spearAttr).
        fightRangedAttr += b.weaponDmg * (kit.rangedClass === 'spear' ? 0 : rs);
        st.extraDmg += b.extraDmg;
      }
      // Volley: lead's ranged weapon (a spear volley is always 0
      // — verified by the spearLeadVolleyNonNull count below).
      const volDmg = volField;
      st.volleyDmg += volDmg;
      if (leadKit) {
        if (leadKit.rangedClass === 'spear') fightSpearAttr += volDmg;
        else if (leadKit.rangedClass === 'bow' || leadKit.rangedClass === 'crossbow' ||
                 leadKit.rangedClass === 'sling' || leadKit.rangedClass === 'searcaster' ||
                 leadKit.rangedClass === 'other-ranged') fightRangedAttr += volDmg;
        else fightMeleeAttr += volDmg;
      }
      // Contact finish: by instrument.
      const cfDmg = (row.contactFinishDmg | 0);
      st.contactDmg += cfDmg;
      if (row.contactFinishAttempted) {
        st.contactFinish.attempted++;
        const inst = row.contactFinishInstrument || 'unknown';
        const c = st.contactFinish.byInstrument[inst] || (st.contactFinish.byInstrument[inst] = { attempted: 0, kills: 0, dmg: 0 });
        c.attempted++;
        c.dmg += cfDmg;
        if (row.contactFinishKill) { st.contactFinish.kills++; c.kills++; }
        if (inst === 'spear') fightSpearAttr += cfDmg;
        else if (inst === 'melee') fightMeleeAttr += cfDmg;
        else if (inst === 'ranged') fightRangedAttr += cfDmg;
      }
      // Ambush: the lead's mix shares.
      const amDmg = (row.ambushDmg | 0);
      st.ambushDmg += amDmg;
      if (leadKit && amDmg) {
        fightSpearAttr += amDmg * spearShare(leadKit);
        fightMeleeAttr += amDmg * meleeShare(leadKit);
        fightRangedAttr += amDmg * (leadKit.rangedClass === 'spear' ? 0 : rangedShare(leadKit));
      }
      st.spearAttrDmg += fightSpearAttr;
      st.meleeAttrDmg += fightMeleeAttr;
      st.rangedAttrDmg += fightRangedAttr;
      // Per-fight spear numbers (the kill-line question).
      const rounds = row.rounds | 0;
      const spearDpr = rounds ? fightSpearAttr / rounds : 0;
      const partyDpr = rounds ? (row.mDealt | 0) / rounds : 0;
      st.spearDprPerFight.push({ seed: d.seed, day: row.day, mid: row.mid, vid: row.vid,
        spearLed: isSpearLed, spearFight: isSpearFight, rounds: rounds, mHpStart: row.mHpStart,
        spearAttrDmg: Math.round(fightSpearAttr * 10) / 10, spearDpr: Math.round(spearDpr * 10) / 10,
        partyDpr: Math.round(partyDpr * 10) / 10, outcome: row.outcome });
      if (isSpearFight) {
        st.spearStrikesPerFight.push(fightSpearStrikes);
        for (const sf of spearFighters) {
          const tier = sf.rangedClass === 'spear' ? sf.rangedId : (sf.meleeClass === 'spear' ? sf.meleeId : 'unknown');
          const t = st.spearStrikesByTier[tier] || (st.spearStrikesByTier[tier] = { fighters: 0, strikes: 0, dmg: 0 });
          t.fighters++;
          const b = p.byVid[sf.vid];
          if (b) { t.strikes += b.strikes; t.dmg += b.weaponDmg; }
        }
      }
      // Kills.
      if (row.outcome === 'vKill') {
        st.vKills++;
        if (isSpearLed) st.spearLedVKills++;
        if ((row.mDealt | 0) > 0) st.vKillSpearShares.push(Math.round((fightSpearAttr / (row.mDealt | 0)) * 1000) / 1000);
      }
      // Volley check: a spear lead must never volley.
      if (isSpearLed && row.volley) {
        st.spearLeadVolleyNonNull++;
        st.spearLeadVolleyRows.push({ seed: d.seed, day: row.day, mid: row.mid, volley: row.volley });
      }
      st.fightsDetail.push({ seed: d.seed, day: row.day, mid: row.mid, vid: row.vid,
        spearLed: isSpearLed, spearFight: isSpearFight, rounds: rounds,
        outcome: row.outcome, mHpStart: row.mHpStart, mDealt: row.mDealt,
        spearAttrDmg: Math.round(fightSpearAttr * 10) / 10, spearDpr: Math.round(spearDpr * 10) / 10,
        partyDpr: Math.round(partyDpr * 10) / 10,
        spearStrikes: fightSpearStrikes, spearStrikeDmg: fightSpearStrikeDmg,
        unparsedDmg: p.unparsedDmg, unknownDmgLines: p.unknownDmgLines.length,
        nameCollision: !!row.nameCollision, gearUpChanged: !!row.gearUpChanged });
    }
  }
  // Coverage + reconciliation (binding).
  st.coverage = st.strikeLines ? st.coveredStrikeLines / st.strikeLines : null;
  st.residual = st.mDealtTotal ? Math.abs(st.mDealtTotal - st.parsedTotal) / st.mDealtTotal : null;
  // Per-strike means by mix.
  for (const mix of Object.keys(perStrike)) {
    const xs = perStrike[mix];
    st.perStrikeByMix[mix] = { n: xs.length, mean: Math.round(mean(xs) * 10) / 10,
      median: median(xs), min: Math.min.apply(null, xs), max: Math.max.apply(null, xs) };
  }
  st.spearShare = st.mDealtTotal ? st.spearAttrDmg / st.mDealtTotal : null;
  st.spearDprMean = mean(st.spearDprPerFight.filter(function (r) { return r.spearFight; }).map(function (r) { return r.spearDpr; }));
  st.spearDprMax = st.spearDprPerFight.length ? Math.max.apply(null, st.spearDprPerFight.map(function (r) { return r.spearDpr; })) : null;
  st.partyDprMean = mean(st.spearDprPerFight.map(function (r) { return r.partyDpr; }));
  if (st.spearDprMean != null) st.spearDprMean = Math.round(st.spearDprMean * 10) / 10;
  if (st.partyDprMean != null) st.partyDprMean = Math.round(st.partyDprMean * 10) / 10;
  const surv = st.wall.survivals.slice().sort(function (a, b) { return a - b; });
  st.wall.medianSurvival = surv.length ? median(surv) : null;
  return st;
}

// ---- judge ----
function judgeSpearDmg(st) {
  const bars = [];
  bars.push({ name: 'pool floor (fought expedition w4+ fights ≥ 8)', bar: 8, measured: st.fights, pass: st.fights >= 8 });
  bars.push({ name: 'spear-fight floor (fights with ≥1 spear fighter ≥ 5)', bar: 5, measured: st.spearFights, pass: st.spearFights >= 5 });
  bars.push({ name: 'strike-parse coverage ≥ 0.95', bar: 0.95, measured: st.coverage, pass: st.coverage != null && st.coverage >= 0.95 });
  bars.push({ name: 'reconciliation residual ≤ 0.05', bar: 0.05, measured: st.residual, pass: st.residual != null && st.residual <= 0.05 });
  bars.push({ name: 'instrument errors 0', bar: 0, measured: st.errors, pass: st.errors === 0 });
  let verdict = 'DIAG-GO', kind = 'GO';
  if (st.errors > 0) { verdict = 'DIAG-NO-GO'; kind = 'INSTRUMENT'; }
  else if (st.fights < 8 || st.spearFights < 5) { verdict = 'DIAG-NO-GO'; kind = 'THIN-POOL'; }
  else if (!(st.coverage != null && st.coverage >= 0.95) || !(st.residual != null && st.residual <= 0.05)) { verdict = 'DIAG-NO-GO'; kind = 'ATTRIBUTION'; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarize(st) {
  return {
    fights: st.fights, spearFights: st.spearFights,
    spearLedFights: st.spearLedFights, spearCompanionFights: st.spearCompanionFights,
    coverage: st.coverage, residual: st.residual, errors: st.errors,
    spearShare: st.spearShare, spearDprMean: st.spearDprMean, spearDprMax: st.spearDprMax,
    partyDprMean: st.partyDprMean, vKills: st.vKills, spearLedVKills: st.spearLedVKills,
    perStrikeByMix: st.perStrikeByMix,
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
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'speardmg-selftest-'));
  // Fixture fight 1: spear-only lead (Nina, hunting_spear wb 15)
  // vs the Audit, 3 rounds, vFlee. Strikes 50 + 46 (Rage x2.0 in
  // the text — the parsed number is the final number), one echo
  // from ally Brendan (machete, 40), one extra-ally ability strike
  // (5), ambush 21, no volley (spear), no contact finish.
  // mDealt = 50+46+40+5+21 = 162.
  function kit(vid, name, meleeId, meleeBonus, rangedId, rangedBonus, wb) {
    const defs = DEFS;
    return { vid: vid, name: name,
      meleeId: meleeId, meleeBonus: meleeBonus, meleeClass: weaponClass(meleeId, defs),
      rangedId: rangedId, rangedBonus: rangedBonus, rangedClass: weaponClass(rangedId, defs),
      ammo: 0, wb: wb, armorP: 10 };
  }
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
  const p1 = parseStrikes(row1);
  check('fixture 1 parses 6 damage rows (ambush + 3 strikes + echo + extra)',
    p1.strikes.length === 6, JSON.stringify(p1.strikes.map(function (s) { return s.kind; })));
  check('fixture 1 strike lines covered 5/5 (ambush/volley/contact are not strike lines)',
    p1.strikeLines === 5 && p1.coveredStrikeLines === 5, p1.strikeLines + '/' + p1.coveredStrikeLines);
  check('fixture 1 parsed damage reconciles exactly (167 = mDealt, residual 0)',
    p1.parsedDmg === 167 && p1.unparsedDmg === 0, 'parsed ' + p1.parsedDmg + ' unparsed ' + p1.unparsedDmg);
  check('fixture 1 ambush parsed 21, volley 0, contact 0',
    p1.ambushParsed === 21 && p1.volleyParsed === 0 && p1.contactParsed === 0,
    JSON.stringify({ a: p1.ambushParsed, v: p1.volleyParsed, c: p1.contactParsed }));
  check('fixture 1 Nina weapon damage 96 (50+46), Brendan 45 (40+5 echo, extra excluded)',
    p1.byVid.nina.weaponDmg === 96 && p1.byVid.brendan.weaponDmg === 45 && p1.byVid.brendan.extraDmg === 5,
    JSON.stringify(p1.byVid));
  // Fixture fight 2: bow lead (Diego, bow wb 11) vs the Audit,
  // volley 2 shots, 1 hit 14; contact finish with the bow? No —
  // contact finish instrument 'ranged' dmg 9, kill. mDealt =
  // 14 (volley) + 9 (contact) + 30 (strike) = 53.
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
  const p2 = parseStrikes(row2);
  check('fixture 2 parses strike + volley + contact (3 damage rows)',
    p2.strikes.length === 3, JSON.stringify(p2.strikes.map(function (s) { return s.kind; })));
  check('fixture 2 volley parsed 14, contact parsed 9',
    p2.volleyParsed === 14 && p2.contactParsed === 9, p2.volleyParsed + '/' + p2.contactParsed);
  check('fixture 2 reconciles exactly (53)',
    p2.parsedDmg === 53 && p2.unparsedDmg === 0, 'parsed ' + p2.parsedDmg);
  // Fixture fight 3: name collision — two Ninas; strikes go
  // unattributed, coverage drops; plus one unknown damage line
  // (an ability line the parser does not itemize — its 7 damage
  // IS in mDealt, so it lands in the open residual).
  const row3 = {
    seq: 3, day: 50, vid: 'nina1', mid: 'algorithm', wave: 4, origin: 'expedition',
    outcome: 'vFlee', rounds: 2, mHpStart: 1100, vKill: false, noContact: false,
    leadKit: kit('nina1', 'Nina', null, 0, 'fire_hardened_spear', 15, 8),
    fighterKits: [kit('nina2', 'Nina', 'machete', 35, null, 0, 18)],
    postLeadKit: null, gearUpChanged: false, nameCollision: true,
    leadDealt: 37, allyDealt: 20, ally2Dealt: 0, ally3Dealt: 0,
    mDealt: 57, vTaken: 40, allyVid: 'nina2', ally2Vid: null, ally3Vid: null,
    volley: null, contactFinishAttempted: false, contactFinishKill: false,
    contactFinishInstrument: null, contactFinishWeapon: null, contactFinishDmg: null,
    ambushDmg: null,
    log: [
      'R1: Nina strikes for 30 (1070 left)',
      'R2: Nina strikes for 20 (1050 left)',
      "R2: Nina's Rage burns The Algorithm for 7 (1043 left).",
    ],
    roundsDetail: null,
  };
  const p3 = parseStrikes(row3);
  check('fixture 3 colliding name: strikes parsed but unattributed (vid null)',
    p3.strikes.length === 2 && p3.strikes.every(function (s) { return s.vid === null; }),
    JSON.stringify(p3.strikes));
  check('fixture 3 coverage 0/2 on colliding names',
    p3.strikeLines === 2 && p3.coveredStrikeLines === 0, p3.coveredStrikeLines + '/' + p3.strikeLines);
  check('fixture 3 unknown damage line counted openly (the Rage-burn line)',
    p3.unknownDmgLines.length === 1, JSON.stringify(p3.unknownDmgLines));
  check('fixture 3 residual is the unparsed 7 (57 − 50 parsed)',
    p3.parsedDmg === 50 && p3.unparsedDmg === 7, 'parsed ' + p3.parsedDmg + ' unparsed ' + p3.unparsedDmg);
  // Attribution shares (frozen rule).
  check('spear-only share is 1.0 (hunting_spear 30, wb 15)',
    Math.abs(spearShare(row1.leadKit) - 1) < 1e-9, String(spearShare(row1.leadKit)));
  check('bow+melee lead share: spear 0, melee 35/2/29, ranged 22/2/29',
    Math.abs(spearShare(row2.leadKit)) < 1e-9 &&
    Math.abs(meleeShare(row2.leadKit) - 17.5 / 29) < 1e-9 &&
    Math.abs(rangedShare(row2.leadKit) - 11 / 29) < 1e-9,
    JSON.stringify({ s: spearShare(row2.leadKit), m: meleeShare(row2.leadKit), r: rangedShare(row2.leadKit) }));
  check('spear+melee share: hunting_spear 30 + machete 35, wb 33 → 15/33',
    Math.abs(spearShare(kit('x', 'X', 'machete', 35, 'hunting_spear', 30, 33)) - 15 / 33) < 1e-9,
    String(spearShare(kit('x', 'X', 'machete', 35, 'hunting_spear', 30, 33))));
  check('unarmed share is 0', spearShare(kit('u', 'U', null, 0, null, 0, 0)) === 0, '');
  check('mix classes: spear-only / spear+melee / bow+melee / other-melee-only / unarmed',
    fighterMix(row1.leadKit) === 'spear-only' &&
    fighterMix(kit('x', 'X', 'machete', 35, 'hunting_spear', 30, 33)) === 'spear+melee' &&
    fighterMix(row2.leadKit) === 'bow+melee' &&
    fighterMix(row1.fighterKits[0]) === 'other-melee-only' &&
    fighterMix(kit('u', 'U', null, 0, null, 0, 0)) === 'unarmed',
    JSON.stringify([fighterMix(row1.leadKit), fighterMix(row2.leadKit)]));
  check('live defs classify the four spears as spear',
    ['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'godslayer_spear'].every(function (id) { return weaponClass(id, DEFS) === 'spear'; }));
  check('spears are not ammo-capable; bows are',
    !ammoCapable('hunting_spear', DEFS) && ammoCapable('bow', DEFS));
  // Full-pipeline stats on fixtures: build a fake corpus dir.
  function seedFile(seed, fights, extra) {
    return Object.assign({ seed: seed, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
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
      w4dmgFights: fights }, extra || {});
  }
  // 8 fixture seeds × 1 spear fight each = 8 fights, 8 spear fights.
  for (let s = 0; s < 8; s++) {
    const r = JSON.parse(JSON.stringify(row1));
    r.day = 90 + s;
    fs.writeFileSync(path.join(tmp, 's' + (111801 + s) + '.json'), JSON.stringify(seedFile(111801 + s, [r])));
  }
  const st = spearDmgStats(tmp);
  check('stats pool: 8 fights, 8 spear fights, 8 spear-led',
    st.fights === 8 && st.spearFights === 8 && st.spearLedFights === 8,
    JSON.stringify({ f: st.fights, s: st.spearFights, l: st.spearLedFights }));
  check('stats coverage 1.0 (fixture logs fully attributed)',
    st.coverage === 1, 'coverage ' + st.coverage);
  check('stats residual 0 (fixture mDealt reconciles)',
    st.residual === 0, 'residual ' + st.residual);
  check('stats spear share: spear attr (96 strikes + 21 ambush, all spear) / 167 ≈ 0.70',
    Math.abs(st.spearShare - 117 / 167) < 1e-9, 'share ' + st.spearShare);
  check('stats spear dpr per fight: 117/3 = 39.0',
    st.spearDprMean === 39, 'mean ' + st.spearDprMean);
  check('stats per-strike spear-only mean: (50+46)/2 = 48',
    st.perStrikeByMix['spear-only'] && st.perStrikeByMix['spear-only'].mean === 48,
    JSON.stringify(st.perStrikeByMix['spear-only']));
  check('stats per-strike other-melee-only mean: Brendan 40 + echo 5 → (40+5)/2 = 22.5',
    st.perStrikeByMix['other-melee-only'] && st.perStrikeByMix['other-melee-only'].mean === 22.5,
    JSON.stringify(st.perStrikeByMix['other-melee-only']));
  check('stats ledger reconciliation matches per seed (1/1 × 8)',
    st.reconciliation.length === 8 && st.reconciliation.every(function (r) { return r.match === true; }),
    JSON.stringify(st.reconciliation));
  check('stats wall: 0 national, 0 wins, 8 wave-4, 0 wave-5, median 150',
    st.wall.national === 0 && st.wall.wins === 0 && st.wall.wave4Unlocked === 8 &&
    st.wall.wave5Unlocked === 0 && st.wall.medianSurvival === 150,
    JSON.stringify(st.wall));
  // Judge shapes.
  let j = judgeSpearDmg(st);
  check('judge DIAG-GO on the fixture corpus', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judgeSpearDmg(Object.assign({}, st, { fights: 5, spearFights: 5 }));
  check('judge DIAG-NO-GO THIN-POOL when fights < 8', j.verdict === 'DIAG-NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judgeSpearDmg(Object.assign({}, st, { fights: 10, spearFights: 3 }));
  check('judge DIAG-NO-GO THIN-POOL when spear fights < 5', j.verdict === 'DIAG-NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judgeSpearDmg(Object.assign({}, st, { coverage: 0.8 }));
  check('judge DIAG-NO-GO ATTRIBUTION when coverage < 0.95', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION', JSON.stringify(j));
  j = judgeSpearDmg(Object.assign({}, st, { residual: 0.2 }));
  check('judge DIAG-NO-GO ATTRIBUTION when residual > 0.05', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION', JSON.stringify(j));
  j = judgeSpearDmg(Object.assign({}, st, { errors: 1 }));
  check('judge DIAG-NO-GO INSTRUMENT when errors > 0', j.verdict === 'DIAG-NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-speardmg-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  if (!dir) { console.error('usage: analyze-speardmg-a.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const st = spearDmgStats(dir);
  const j = judgeSpearDmg(st);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, summary: summarize(st), stats: st };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars, summary: result.summary }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { spearDmgStats: spearDmgStats, judgeSpearDmg: judgeSpearDmg, parseStrikes: parseStrikes, fighterMix: fighterMix, spearShare: spearShare, meleeShare: meleeShare, rangedShare: rangedShare, weaponClass: weaponClass, ammoCapable: ammoCapable, loadDefs: loadDefs, KILL_LINE_DPR: KILL_LINE_DPR, W4_HP_LO: W4_HP_LO, W4_HP_HI: W4_HP_HI };
