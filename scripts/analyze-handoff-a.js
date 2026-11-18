// analyze-handoff-a.js — classifier for arm sim-handoff-diag-a (DIAG).
// For each range-0-holder blocked selection in the FROZEN profilegate-b
// ON corpus (band 103411-103418), determines whether a walker in the
// SAME village could have held the plan instead. Corpus-first per
// prereg Correction 1 (2026-11-18): no fresh run, no new recorder.
//
// Frozen rule (prereg Correction 1 + stability-probe refinement):
//   - Selections enumerated with the frozen classifySeed (any-commit);
//     a selection is an (instance, commit-day) pair whose resolution
//     reason is 'inviter-range-0'. Must reproduce selblock-a exactly:
//     79 selections, per-instance 1+8+28+24+5+10+3.
//   - Village state from the nearest companionPool row for the holder
//     on or BEFORE the selection day (same-day preferred; row age
//     recorded). Profiles never change across pool rows (332/332 same
//     in the probe), so profile may come from any pool row; at-Haven
//     is NOT stable day-over-day (P(stay)=0.718, n=188), so day-D
//     location/state is proven ONLY by a same-day pool row or — for
//     the picked companion only — by the bid itself (both
//     findCompanion twins require node==haven, alive, not away,
//     trust>=15, not engaged, not on expedition at scoring time).
//   - HOLDING (day-D, observable): a dawnbidCensus row names the
//     candidate that day (live wave-4 plan) OR a dawnbidScores row
//     names them as holder with a party_launch commit that day.
//     A wave-3-only v4seed with no census/score that day is flagged
//     POSSIBLY-HOLDING; it does not block availability in the primary
//     rule, but every verdict resting on such a walker is flagged and
//     the sensitivity count is reported.
//   - A candidate is handoff-available iff: walker (profile
//     forager/wanderer/explorer, i.e. maxDist>0), alive (pool row +
//     day-D daily roster), at-Haven proven (same-day row or bid
//     proof), not holding, and — where day-D state is proven — not
//     away / engaged / onExped. Trust does NOT gate (the task omits
//     it). Sickness is NOT observable for unpicked members and does
//     NOT gate: the reported share is an UPPER BOUND w.r.t. sickness.
//   - Buckets: handoff-available / no-walker-in-village /
//     walker-exists-but-unavailable (why per walker) / unknown.
//     Stale-row walkers whose day-D state is unproven carry why
//     'state-unproven-stale-Nd' and are tallied separately inside the
//     walker-exists-but-unavailable bucket (proven-unavailable vs
//     location-unproven), so the evidence never hides the gap.
// Usage:
//   node scripts/analyze-handoff-a.js [onDir]
// Writes evidence/2026-11-17/handoff-a-analysis.json. Exits 0 iff the
// enumeration reproduces selblock-a exactly (79 + per-instance counts).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifySeed } = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));

const ON_DIR = process.argv[2] ||
  path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on');
const OUT_FILE = path.join(REPO, 'evidence', '2026-11-17', 'handoff-a-analysis.json');

const WALKER_PROFILES = ['forager', 'wanderer', 'explorer'];
const EXPECTED_TOTAL = 79;
const EXPECTED_PER_INST = {
  '103413:naran_tumen:herald': 1,
  '103413:omar_farouk:influencer': 8,
  '103414:giulia_bianchi:eater': 28,
  '103414:visjoin_73:reunion': 24,
  '103414:visjoin_85:eulogy': 5,
  '103418:yuki_mori:reunion': 10,
  '103418:visjoin_59:reunion': 3,
};

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

// Profile lookup for a vid from any pool row (profiles never change)
// or, as a last resort, from samples.villagers (vids there are
// truncated to 12 chars — prefix match, ambiguous matches return null).
function profileFromSamples(j, vid) {
  try {
    const snaps = ((j.samples || {}).villagers || []);
    for (let i = snaps.length - 1; i >= 0; i--) {
      const rows = snaps[i] && snaps[i][1];
      if (!Array.isArray(rows)) continue;
      for (const r of rows) {
        if (r && typeof r.vid === 'string' && typeof r.profile === 'string') {
          if (r.vid === vid) return r.profile;
          if (vid.indexOf(r.vid) === 0 && r.vid.length >= 8) {
            // Truncated-vid prefix match: accept only if no other
            // roster vid shares the prefix.
            const roster = [];
            for (const d of (j.daily || [])) for (const x of (d.roster || [])) roster.push(x.vid);
            const matches = roster.filter(function (v) { return v && v.indexOf(r.vid) === 0; });
            if (matches.length === 1) return r.profile;
            return null;
          }
        }
      }
    }
  } catch (e) {}
  return null;
}

function classifySelection(j, inst, res) {
  const seed = j.seed;
  const vid = inst.vid;
  const D = res.day;
  const sel = (inst.selections || []).find(function (s) { return s.day === D; }) || {};
  // The picked companion is the pick the depart EXECUTED: the first
  // matching depart row's companion when one exists (a mid-day re-pick
  // can overwrite the score commit's companion), else the score
  // commit's companion. (Correction 2, Bug 2: visjoin_73 day 105
  // scores jesse_cortez but departs with giulia_bianchi.)
  let departCompanion = null;
  try {
    const deps = (j.dawnbidDeparts || []).filter(function (r) {
      return r.vid === vid && r.day === D && r.winPlanAction === 'party_launch';
    });
    if (deps.length) departCompanion = deps[0].companion || null;
  } catch (e) {}
  const picked = departCompanion || sel.companion || null;
  const pools = ((j.companionPool || []).filter(function (p) { return p.vid === vid; }))
    .sort(function (a, b) { return a.day - b.day; });
  let row = null;
  for (const p of pools) if (p.day <= D) row = p;
  const afterRow = pools.find(function (p) { return p.day > D; }) || null;
  const gap = row ? (D - row.day) : null;

  const dailyD = ((j.daily || []).find(function (d) { return d.day === D; })) || null;
  const rosterD = dailyD ? (dailyD.roster || []) : [];
  const scholarId = dailyD ? (dailyD.scholarId || null) : null;
  function aliveOnDay(v) {
    const r = rosterD.find(function (x) { return x && x.vid === v; });
    if (r) return !r.dead;
    return null; // not on the day-D roster (joined later / left)
  }
  function vetsOf(v) {
    let w3 = 0, w4 = 0;
    try {
      const k3 = (((dailyD || {}).vetsW3 || {}).killers || []).find(function (k) { return k.by === v; });
      const k4 = (((dailyD || {}).vetsW4 || {}).killers || []).find(function (k) { return k.by === v; });
      if (k3) w3 = k3.kills | 0;
      if (k4) w4 = k4.kills | 0;
      if (!k3 && !k4) {
        const log = ((dailyD || {}).waveKillLog || []);
        for (const e of log) {
          if (e && e.by === v) { if ((e.w | 0) >= 3) w3++; if ((e.w | 0) >= 4) w4++; }
        }
      }
    } catch (e) {}
    return { vetW3: w3, vetW4: w4 };
  }
  function holdingOnDay(v) {
    const cens = ((j.dawnbidCensus || []).some(function (c) { return c.vid === v && c.day === D; }));
    const scor = ((j.dawnbidScores || []).some(function (r) {
      return r.vid === v && r.day === D && r.commit && r.commit.winPlanAction === 'party_launch';
    }));
    return cens || scor;
  }
  function possiblyHolding(v) {
    // Wave-3-only v4seed, no observable hold that day. (A wave-4
    // seed with no census row that day is resolved NOT-holding: a
    // live wave-4 plan always carries a census row.)
    const seeds = ((j.v4seeds || []).filter(function (s) { return s.vid === v && s.day <= D; }));
    if (!seeds.length) return null;
    if (seeds.some(function (s) { return (s.wave | 0) >= 4; })) return null;
    const lastSeed = Math.max.apply(null, seeds.map(function (s) { return s.day; }));
    return { seededDay: lastSeed, wave: 3 };
  }
  function profileOf(v) {
    if (row) {
      const m = ((row.members || []).find(function (x) { return x && x.id === v; }));
      if (m && m.profile) return m.profile;
    }
    if (afterRow) {
      const m = ((afterRow.members || []).find(function (x) { return x && x.id === v; }));
      if (m && m.profile) return m.profile;
    }
    return profileFromSamples(j, v);
  }

  const walkers = []; // {id, profile, alive, atHavenProven, why, available, vetW3, vetW4, trust, possiblyHolding, source}
  const seen = {};
  function addWalker(id, source, member) {
    if (!id || seen[id]) return;
    seen[id] = true;
    const prof = (member && member.profile) || profileOf(id);
    if (!prof || WALKER_PROFILES.indexOf(prof) === -1) return; // not a walker
    const aliveRow = member ? member.alive : null;
    const aliveDay = aliveOnDay(id);
    const alive = (aliveDay != null) ? aliveDay : !!aliveRow;
    const aliveDisagree = (aliveDay != null && aliveRow != null && aliveDay !== !!aliveRow);
    const isPicked = (id === picked);
    let atHavenProven = false;
    let atHavenEvidence = null;
    if (isPicked) { atHavenProven = true; atHavenEvidence = 'bid-proof'; }
    else if (row && gap === 0 && member && member.node) {
      const hv = row.haven || { nx: 4, ny: 4 };
      if (member.node.nx === hv.nx && member.node.ny === hv.ny && !member.away) {
        atHavenProven = true; atHavenEvidence = 'same-day-row';
      }
    }
    const dayDStateProven = (gap === 0 && !!member) || isPicked;
    const holding = holdingOnDay(id);
    const poss = holding ? null : possiblyHolding(id);
    const vets = vetsOf(id);
    // Row values, kept for the stale-face-value sensitivity (what the
    // answer would be if stale-row locations/state were taken at face
    // value). Only meaningful when member comes from a pool row.
    const rowAtHaven = (member && member.node && row) ?
      (member.node.nx === (row.haven || { nx: 4, ny: 4 }).nx &&
       member.node.ny === (row.haven || { nx: 4, ny: 4 }).ny) : null;
    const rowAway = member ? !!member.away : null;
    const rowEngaged = member ? !!member.engaged : null;
    const rowOnExped = member ? !!member.onExped : null;
    let why = null;
    let available = false;
    // First-fail order mirrors the pool replica's (dead, away,
    // not-at-Haven, engaged, onExped), with holding first (a plan is
    // a commitment) and stale-unproven for day-D state the row cannot
    // prove. The bid proves away/engaged/onExped/at-Haven false for
    // the picked companion at scoring time, so stale member flags
    // never veto them.
    if (!alive) why = 'dead';
    else if (holding) why = 'holding-a-plan';
    else if (!dayDStateProven) why = 'state-unproven-stale-' + gap + 'd';
    else if (!isPicked && member && member.away) why = 'away';
    else if (!atHavenProven) why = 'not-at-Haven';
    else if (!isPicked && member && member.engaged) why = 'engaged';
    else if (!isPicked && member && member.onExped) why = 'onExped';
    else { available = true; }
    walkers.push({ id: id, profile: prof, alive: alive, aliveDisagree: aliveDisagree,
      atHavenProven: atHavenProven, atHavenEvidence: atHavenEvidence,
      rowAtHaven: rowAtHaven, rowAway: rowAway, rowEngaged: rowEngaged, rowOnExped: rowOnExped,
      why: why, available: available, vetW3: vets.vetW3, vetW4: vets.vetW4,
      trust: (member && member.trust != null) ? member.trust : null,
      possiblyHolding: poss, source: source });
  }

  if (row) {
    for (const m of (row.members || [])) {
      if (!m || !m.id) continue;
      if (m.firstFail === 'selfOrScholar' || m.id === vid || m.id === scholarId) continue;
      addWalker(m.id, 'pool-row', m);
    }
    // Late joiners: day-D roster vids missing from the row's members.
    const rowIds = {};
    for (const m of (row.members || [])) if (m && m.id) rowIds[m.id] = true;
    for (const r of rosterD) {
      if (!r || !r.vid || rowIds[r.vid]) continue;
      if (r.vid === vid || r.vid === scholarId) continue;
      if (r.dead) continue;
      addWalker(r.vid, 'roster-only', null);
    }
  } else {
    // No pool row on or before the day: only the picked companion can
    // be evaluated (bid proof). Anyone else is unobservable.
    if (picked) addWalker(picked, 'bid-proof-only', null);
  }

  const available = walkers.filter(function (w) { return w.available; });
  // Roster members whose profile could not be determined from any
  // source (pool rows either direction, samples). If the village
  // census cannot prove a member is NOT a walker, a no-walker verdict
  // would be unproven.
  let unknownProfileCount = 0;
  if (row) {
    for (const m of (row.members || [])) {
      if (!m || !m.id) continue;
      if (m.firstFail === 'selfOrScholar' || m.id === vid || m.id === scholarId) continue;
      if (!m.profile) unknownProfileCount++;
    }
    const rowIds = {};
    for (const m of (row.members || [])) if (m && m.id) rowIds[m.id] = true;
    for (const r of rosterD) {
      if (!r || !r.vid || rowIds[r.vid]) continue;
      if (r.vid === vid || r.vid === scholarId) continue;
      if (r.dead) continue;
      if (!profileOf(r.vid)) unknownProfileCount++;
    }
  }
  let ranked = [];
  if (row && row.rankedOrder) ranked = row.rankedOrder.map(function (r) { return r.id; });
  let named = null;
  if (available.length) {
    const availIds = available.map(function (w) { return w.id; });
    if (gap === 0) {
      for (const id of ranked) if (availIds.indexOf(id) !== -1) { named = id; break; }
    }
    if (!named) named = available[0].id;
  }
  const namedWalker = named ? available.find(function (w) { return w.id === named; }) : null;

  let bucket, whySummary;
  if (available.length) {
    bucket = 'handoff-available';
    whySummary = null;
  } else if (!row) {
    // Correction 2, Bug 1: with no pool row there is no member list
    // to judge from, so no-walker-in-village is unreachable here —
    // the village's walker population is unobservable.
    bucket = 'unknown';
    whySummary = 'no pool row on or before day; picked companion not an available walker';
  } else if (!walkers.length) {
    if (unknownProfileCount > 0) {
      bucket = 'unknown';
      whySummary = 'roster member(s) with undeterminable profile; zero-walker verdict unproven';
    } else {
      bucket = 'no-walker-in-village';
      whySummary = 'zero living walkers in village';
    }
  } else {
    bucket = 'walker-exists-but-unavailable';
    const whys = {};
    for (const w of walkers) whys[w.why || 'unknown'] = (whys[w.why || 'unknown'] || 0) + 1;
    whySummary = whys;
  }

  return { seed: seed, holder: vid, holderProfile: (row ? row.holderProfile : null),
    target: inst.target, day: D, commitKind: res.commitKind || sel.commitKind || null,
    companion: picked, departCompanion: departCompanion,
    companionAgrees: (departCompanion == null ? null : (departCompanion === (sel.companion || null))),
    poolRowDay: row ? row.day : null, poolRowGap: gap,
    poolRowAfterDay: afterRow ? afterRow.day : null,
    unknownProfileCount: unknownProfileCount,
    bucket: bucket, whySummary: whySummary,
    namedWalker: namedWalker ? { id: namedWalker.id, profile: namedWalker.profile,
      vetW3: namedWalker.vetW3, vetW4: namedWalker.vetW4, trust: namedWalker.trust,
      isPickedCompanion: namedWalker.id === picked,
      possiblyHolding: namedWalker.possiblyHolding } : null,
    availableWalkers: available.map(function (w) { return { id: w.id, profile: w.profile,
      vetW3: w.vetW3, vetW4: w.vetW4, trust: w.trust,
      isPickedCompanion: w.id === picked, possiblyHolding: w.possiblyHolding }; }),
    walkers: walkers };
}

function main() {
  const leg = loadDir(ON_DIR);
  const seeds = Object.keys(leg.bySeed).sort();
  const selections = [];
  const perInst = {};
  for (const s of seeds) {
    const j = leg.bySeed[s];
    const out = classifySeed(j, { launchDefinition: 'any-commit' });
    for (const inst of out.instances) {
      let n = 0;
      for (const res of (inst.resolved || [])) {
        if (res.reason !== 'inviter-range-0') continue;
        n++;
        selections.push(classifySelection(j, inst, res));
      }
      if (n) perInst[s + ':' + inst.vid + ':' + inst.target] = n;
    }
  }

  // Enumeration check vs selblock-a (D-check (a)).
  const enumOk = selections.length === EXPECTED_TOTAL &&
    Object.keys(EXPECTED_PER_INST).every(function (k) { return perInst[k] === EXPECTED_PER_INST[k]; }) &&
    Object.keys(perInst).every(function (k) { return EXPECTED_PER_INST[k] === perInst[k]; });

  const tally = { 'handoff-available': 0, 'no-walker-in-village': 0,
    'walker-exists-but-unavailable': 0, 'unknown': 0 };
  for (const s of selections) tally[s.bucket]++;
  const avail = selections.filter(function (s) { return s.bucket === 'handoff-available'; });
  const share = selections.length ? avail.length / selections.length : null;
  const sameDay = selections.filter(function (s) { return s.poolRowGap === 0; });
  const sameDayAvail = sameDay.filter(function (s) { return s.bucket === 'handoff-available'; });
  const sameDayShare = sameDay.length ? sameDayAvail.length / sameDay.length : null;
  // Stale-face-value sensitivity: count selections that would be
  // handoff-available if stale-row locations/state were taken at face
  // value (a walker the stale row shows at Haven, not away/engaged/
  // onExped, alive, not holding). Only walkers with a pool-row record
  // can qualify; bid-proof-only walkers are already counted available.
  let staleFaceValue = 0;
  for (const s of selections) {
    if (s.bucket === 'handoff-available') { staleFaceValue++; continue; }
    if (s.bucket !== 'walker-exists-but-unavailable') continue;
    const w = (s.walkers || []).find(function (x) {
      return x.rowAtHaven === true && x.rowAway === false &&
        x.rowEngaged === false && x.rowOnExped === false &&
        x.alive === true && x.why && x.why.indexOf('state-unproven-stale-') === 0;
    });
    if (w) staleFaceValue++;
  }
  const staleFaceShare = selections.length ? staleFaceValue / selections.length : null;
  // Sensitivity: verdicts resting on a possibly-holding walker.
  let possHoldVerdicts = 0;
  for (const s of avail) {
    if ((s.availableWalkers || []).every(function (w) { return !!w.possiblyHolding; })) possHoldVerdicts++;
  }
  const vetAvail = avail.filter(function (s) {
    return s.namedWalker && s.namedWalker.vetW4 > 0;
  }).length;
  const pickedAvail = avail.filter(function (s) {
    return s.namedWalker && s.namedWalker.isPickedCompanion;
  }).length;
  // Why tally inside walker-exists-but-unavailable (per-walker).
  const whyTally = {};
  for (const s of selections) {
    if (s.bucket !== 'walker-exists-but-unavailable') continue;
    for (const w of (s.walkers || [])) {
      const k = w.why || 'unknown';
      whyTally[k] = (whyTally[k] || 0) + 1;
    }
  }
  // Proven-vs-stale split (Correction 2): per unavailable selection,
  // are all walkers proven-unavailable on day-D evidence, mixed, or
  // all resting on unproven stale-row state?
  const unavailableSplit = { 'all-proven-unavailable': 0, 'mixed-proven+stale': 0, 'all-stale-unproven': 0 };
  for (const s of selections) {
    if (s.bucket !== 'walker-exists-but-unavailable') continue;
    const whys = (s.walkers || []).map(function (w) { return w.why || 'unknown'; });
    const stale = whys.filter(function (w) { return w.indexOf('state-unproven-stale-') === 0; }).length;
    if (!stale) unavailableSplit['all-proven-unavailable']++;
    else if (stale === whys.length) unavailableSplit['all-stale-unproven']++;
    else unavailableSplit['mixed-proven+stale']++;
  }
  const gapDist = {};
  for (const s of selections) {
    const k = (s.poolRowGap == null ? 'none' : String(s.poolRowGap));
    gapDist[k] = (gapDist[k] || 0) + 1;
  }

  // Wall numbers on the frozen band (quoted basis: profilegate-b ON).
  const perSeed = seeds.map(function (s) { return leg.bySeed[s]; });
  const wall = {
    national: perSeed.filter(function (x) { return (x.standing || 0) >= 200; }).length,
    nationalRank: 0,
    table: 0,
    wins: perSeed.filter(function (x) { return !!x.won; }).length,
    wave4: perSeed.filter(function (x) { return (x.maxWave || 1) >= 4; }).length,
    wave5: perSeed.filter(function (x) { return (x.maxWave || 1) >= 5; }).length,
    medianSurvival: med(perSeed.map(function (x) { return x.gameDays || x.days || 0; })),
    perSeedGameDays: perSeed.map(function (x) { return x.gameDays || x.days || 0; }),
  };

  const analysis = { arm: 'sim-handoff-diag-a', corpus: 'perseed-profilegate-b-on (frozen)',
    seeds: seeds, horizon: '150d death-aware', policy: 'competent',
    enumerationOk: enumOk, total: selections.length, perInstance: perInst,
    tally: tally, share: share,
    sameDayN: sameDay.length, sameDayShare: sameDayShare,
    staleFaceValueShare: staleFaceShare,
    veteranNamed: vetAvail, pickedCompanionNamed: pickedAvail,
    possiblyHoldingVerdicts: possHoldVerdicts,
    whyTally: whyTally, unavailableSplit: unavailableSplit, poolRowGapDist: gapDist,
    wall: wall, selections: selections };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(analysis, null, 2) + '\n');

  console.log('enumeration ok:', enumOk, '| total:', selections.length, '| per-instance:', JSON.stringify(perInst));
  console.log('tally:', JSON.stringify(tally));
  console.log('share handoff-available:', share, '(' + avail.length + '/' + selections.length + ')');
  console.log('same-day-only: n=' + sameDay.length + ' share=' + sameDayShare);
  console.log('stale-face-value share:', staleFaceShare);
  console.log('named walker veteran (vetW4>0):', vetAvail, '| named is picked companion:', pickedAvail);
  console.log('verdicts resting only on possibly-holding walkers:', possHoldVerdicts);
  console.log('why tally (walker-exists-but-unavailable):', JSON.stringify(whyTally));
  console.log('unavailable split (proven/mixed/all-stale):', JSON.stringify(unavailableSplit));
  console.log('pool-row gap dist:', JSON.stringify(gapDist));
  console.log('wall:', JSON.stringify(wall));
  console.log('wrote', path.relative(REPO, OUT_FILE));
  if (!enumOk) { console.error('HANDOFF ANALYZE STOP: enumeration does not reproduce selblock-a.'); process.exit(3); }
}

if (require.main === module) main();
module.exports = { classifySelection: classifySelection, WALKER_PROFILES: WALKER_PROFILES };
