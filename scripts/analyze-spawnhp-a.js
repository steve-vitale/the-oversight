#!/usr/bin/env node
// scripts/analyze-spawnhp-a.js — sim-spawnhp-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Corpus: evidence/2026-10-30/perseed-spawnhp-a/s<seed>-fresh.json
//   + census-s<seed>.json (daily world-monster snapshots with
//   hp/maxHp/veteran/variant).
// Wild chains come from scripts/analyze-chainclose-a.js buildChains
// (grouping key (seed, mid)) — never a local re-implementation, and
// never chainfinish's by-mid grouping. Censored means endReason ==
// 'survived' ONLY (won runs are run-end-exact, not censored).
// Provenance taxonomy (prereg priority order): WOUNDED-IN-CORPUS,
// SPAWN-HP, SPAWN-VARIANCE, OFF-CORPUS-WOUNDED, AT-FLOOR-OR-ABOVE
// (opening >= floor, spawn unproven — classified, not a verdict),
// UNDETERMINED (terminal, must name the missing instrument).
// Usage:
//   node scripts/analyze-spawnhp-a.js [--out <path>] (judge corpus)
//   node scripts/analyze-spawnhp-a.js --sense-belowfloor (print logs)
//   node scripts/analyze-spawnhp-a.js --legacy-cases (w4meet corpus)
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);
const { buildChains } = require('./analyze-chainclose-a');
const ccAnalyze = require('./analyze-chainclose-a').analyze;

const DEFS = (() => {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.monsters || []);
    const m = {};
    for (const d of list) if (d && d.id) m[d.id] = d;
    return m;
  } catch (e) { return {}; }
})();
function defFloor(mid) {
  const d = DEFS[mid];
  if (!d || !Array.isArray(d.hp) || !Number.isFinite(d.hp[0])) return null;
  return d.hp[0];
}
function defRange(mid) {
  const d = DEFS[mid];
  if (!d || !Array.isArray(d.hp)) return null;
  return d.hp;
}
function filesByteEqual(a, b) {
  try {
    const x = fs.readFileSync(a), y = fs.readFileSync(b);
    return x.equals(y);
  } catch (e) { return false; }
}
function censoredOf(row) { return row && row.endReason === 'survived'; }

// Join fieldparty + w4dpr + breakline by fight-order index for one
// corpus dir. Returns all wave-4 meetings (all channels) with the
// fields provenance needs, plus join diagnostics. sr/tj alignment is
// judged by the chainclose analyzer's own completeness leg on the
// primary corpus; here fp/bl/dp alignment is what prior history needs.
function joinAllChannel(evidDir, seeds) {
  const meetings = [];
  let joinTotal = 0, joinErrors = 0;
  for (const seed of seeds) {
    const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
    const fp = (row.fieldparty && row.fieldparty.meetings) || [];
    const dp = (row.w4dpr && row.w4dpr.meetings) || [];
    const bl = (row.breakline && row.breakline.meetings) || [];
    const n = Math.min(fp.length, dp.length, bl.length);
    joinErrors += Math.abs(fp.length - bl.length) + Math.abs(fp.length - dp.length);
    for (let i = 0; i < n; i++) {
      joinTotal++;
      const a = fp[i], b = dp[i], c = bl[i];
      if (a.mid !== b.mid || a.vid !== b.vid || a.day !== b.day
        || a.mid !== c.mid || a.vid !== c.vid || a.day !== c.day) { joinErrors++; continue; }
      if ((a.wave | 0) !== 4) continue;
      meetings.push({ seed, day: a.day, part: a.part, mid: a.mid, channel: a.channel,
        caller: a.caller, leaderVid: a.vid, scholarLed: !!(a.leader && a.leader.isScholar),
        outcome: c.outcome, rounds: c.rounds, mDealt: (c.mDealt | 0),
        mHpStart: c.mHpStart, mHpLeft: c.mHpLeft, log: b.log || [] });
    }
  }
  meetings.sort((x, y) => (x.seed - y.seed) || (x.day - y.day) || ((x.part | 0) - (y.part | 0)));
  return { meetings, joinTotal, joinErrors };
}

function loadCensus(evidDir, seeds) {
  const out = {};
  for (const seed of seeds) {
    try {
      const c = JSON.parse(fs.readFileSync(path.join(evidDir, `census-s${seed}.json`), 'utf8'));
      out[seed] = c;
    } catch (e) { out[seed] = null; }
  }
  return out;
}
function sightingsFor(censusBySeed, seed, mid) {
  const c = censusBySeed[seed];
  if (!c || !Array.isArray(c.snapshots)) return [];
  const out = [];
  for (const sn of c.snapshots) {
    if (sn.day === null || sn.day === undefined) continue;
    for (const m of (sn.monsters || [])) {
      if (m.id === mid) out.push({ day: sn.day, tx: m.tx, ty: m.ty, hp: m.hp, maxHp: m.maxHp, veteran: !!m.veteran, variant: m.variant || null });
    }
  }
  return out.sort((a, b) => a.day - b.day);
}

// classifyProvenance: input is one individual's first meeting plus its
// history. priorMeetings: same (seed,mid) meetings strictly earlier in
// (day,part) order, any channel. sightings: census entries for the id
// on the seed (all days). Returns {cls, evidence}.
function classifyProvenance(inp) {
  const opening = inp.openingHp, floor = inp.floor, lastLeft = inp.lastLeft;
  const priors = inp.priorMeetings || [];
  const sights = inp.sightings || [];
  const firstDay = inp.firstDay;
  const priorMatch = priors.find(p => p.mHpLeft === opening);
  if (priorMatch) {
    return { cls: 'WOUNDED-IN-CORPUS',
      evidence: `prior s${inp.seed} ${inp.mid} d${priorMatch.day} channel=${priorMatch.channel} closed ${priorMatch.mHpLeft} == opening ${opening}` };
  }
  const pre = sights.filter(s => s.day <= firstDay);
  const traj = sights.filter(s => (s.day <= firstDay && s.hp === opening) || (s.day > firstDay && lastLeft != null && s.hp === lastLeft));
  const spawnHpSight = pre.find(s => s.hp === s.maxHp && s.hp === opening);
  if (opening === floor && spawnHpSight) {
    return { cls: 'SPAWN-HP',
      evidence: `census d${spawnHpSight.day} hp==maxHp==${opening} == floor, tile (${spawnHpSight.tx},${spawnHpSight.ty})` };
  }
  // traj already ties the sighting to this entity (pre-meeting hp ==
  // opening, or post-meeting hp == lastLeft); maxHp == opening is the
  // spawn evidence — a post-meeting sighting is wounded by the meeting
  // itself, so hp == maxHp must NOT be demanded there.
  const spawnVarSight = traj.find(s => s.maxHp === opening && opening != null && floor != null && opening < floor);
  if (spawnVarSight) {
    return { cls: 'SPAWN-VARIANCE',
      evidence: `census d${spawnVarSight.day} hp==maxHp==${opening} < floor ${floor}, tile (${spawnVarSight.tx},${spawnVarSight.ty}); fieldFight never lowers maxHp` };
  }
  const offBefore = pre.find(s => s.hp > opening);
  if (offBefore) {
    return { cls: 'OFF-CORPUS-WOUNDED',
      evidence: `census d${offBefore.day} hp=${offBefore.hp} maxHp=${offBefore.maxHp} > opening ${opening} (wounded between sighting and meeting, channel unrecorded)` };
  }
  const earliestPre = pre.slice().sort((a, b) => a.day - b.day)[0];
  if (earliestPre && earliestPre.hp === opening && floor != null && opening < earliestPre.maxHp && earliestPre.maxHp === floor) {
    return { cls: 'OFF-CORPUS-WOUNDED',
      evidence: `earliest census d${earliestPre.day} hp==${opening} < maxHp==floor ${floor} (wounded before first sighting, channel unrecorded)` };
  }
  if (floor != null && opening >= floor) {
    return { cls: 'AT-FLOOR-OR-ABOVE',
      evidence: `opening ${opening} >= floor ${floor}, no prior in-corpus meeting, no census proof of unwounded spawn` };
  }
  return { cls: 'UNDETERMINED',
    evidence: 'no prior in-corpus meeting, no census sighting proving spawn or wound',
    missingInstrument: 'spawn recorder logging spawnWorldMonster hp/maxHp per world entity (plus tb-combat recorder for scholar fights)' };
}

function aggregateByType(individuals) {
  const by = {};
  for (const ind of individuals) {
    (by[ind.mid] = by[ind.mid] || []).push(ind.openingHp);
  }
  const table = Object.keys(by).sort().map(mid => {
    const vals = by[mid].slice().sort((a, b) => a - b);
    const mean = vals.reduce((t, v) => t + v, 0) / vals.length;
    return { mid, floor: defFloor(mid), range: defRange(mid), n: vals.length,
      min: vals[0], max: vals[vals.length - 1], mean: Math.round(mean * 100) / 100,
      varianceClaim: vals.length >= 3 ? (vals[0] < vals[vals.length - 1] ? 'VARIANCE' : 'NO-VARIANCE') : 'INSUFFICIENT-DATA' };
  });
  return table;
}

// Census streaks for wave-4 ids on one seed. Splits on day-gap or hp
// change; flags days with >= 2 same-id entries as collisions.
function buildStreaks(census, metMids) {
  const w4ids = Object.keys(DEFS).filter(id => (DEFS[id].wave | 0) === 4);
  const snaps = (census && census.snapshots) || [];
  const streaks = [];
  const collisions = [];
  for (const id of w4ids) {
    let cur = null;
    const flush = () => { if (cur) streaks.push(cur); cur = null; };
    for (const sn of snaps) {
      if (sn.day === null || sn.day === undefined) continue;
      const entries = (sn.monsters || []).filter(m => m.id === id);
      if (entries.length >= 2) collisions.push({ id, day: sn.day, count: entries.length });
      if (!entries.length) { flush(); continue; }
      const e = entries[0];
      if (!cur || sn.day !== cur.lastDay + 1 || e.hp !== cur.hp) {
        flush();
        cur = { mid: id, firstDay: sn.day, lastDay: sn.day, hp: e.hp, maxHp: e.maxHp,
          tiles: [`${e.tx},${e.ty}`], days: 1, met: metMids.has(id) };
      } else {
        cur.lastDay = sn.day; cur.days++;
        const tk = `${e.tx},${e.ty}`;
        if (cur.tiles[cur.tiles.length - 1] !== tk) cur.tiles.push(tk);
      }
    }
    flush();
  }
  return { streaks, collisions };
}

function analyze(evidDir) {
  const cc = ccAnalyze(evidDir);
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
  const rowBySeed = {};
  for (const r of rows) rowBySeed[r.seed] = r;
  const { meetings: allW4, joinTotal, joinErrors } = joinAllChannel(evidDir, SEEDS);
  const censusBySeed = loadCensus(evidDir, SEEDS);
  // Census completeness (prereg leg).
  const censusInfo = {};
  for (const seed of SEEDS) {
    const c = censusBySeed[seed];
    const snaps = (c && c.snapshots) || [];
    const sorted = snaps.every((s, i) => i === 0 || s.day === null || snaps[i - 1].day === null || s.day >= snaps[i - 1].day);
    const lastDay = snaps.length ? snaps[snaps.length - 1].day : null;
    const maxHpSeen = snaps.every(sn => (sn.monsters || []).every(m => Number.isFinite(m.maxHp)));
    censusInfo[seed] = { present: c !== null, snapshots: snaps.length, sorted, lastDay,
      within1: lastDay !== null && Math.abs(lastDay - rowBySeed[seed].days) <= 1, maxHpSeen };
  }
  const censusOk = SEEDS.every(s => censusInfo[s].present && censusInfo[s].sorted && censusInfo[s].within1 && censusInfo[s].maxHpSeen);
  // Wild individuals from chainclose chains (wild universe only).
  const individuals = cc.chains.map(ch => {
    const first = ch.meetings[0];
    const priors = allW4.filter(m => m.seed === ch.seed && m.mid === ch.mid
      && ((m.day < first.day) || (m.day === first.day && (m.part | 0) < (first.part | 0))));
    const sights = sightingsFor(censusBySeed, ch.seed, ch.mid);
    const floor = defFloor(ch.mid);
    const prov = classifyProvenance({ seed: ch.seed, mid: ch.mid, openingHp: ch.openingHp,
      floor, lastLeft: ch.lastLeft, firstDay: first.day, priorMeetings: priors, sightings: sights });
    const preSights = sights.filter(s => s.day <= first.day);
    const earliestPre = preSights.slice().sort((a, b) => a.day - b.day)[0] || null;
    return { seed: ch.seed, mid: ch.mid, chainN: ch.n, channel: 'field',
      firstDay: first.day, firstCaller: first.caller, openingHp: ch.openingHp,
      floor, range: defRange(ch.mid), ratio: floor ? Math.round((ch.openingHp / floor) * 1000) / 1000 : null,
      remainingHp: ch.lastLeft, censored: censoredOf(rowBySeed[ch.seed]),
      priorMeetings: priors.map(p => ({ day: p.day, channel: p.channel, mHpLeft: p.mHpLeft })),
      earliestPreCensus: earliestPre ? { day: earliestPre.day, hp: earliestPre.hp, maxHp: earliestPre.maxHp, tile: `${earliestPre.tx},${earliestPre.ty}` } : null,
      preCensusSightings: preSights.length,
      provenance: prov.cls, provenanceEvidence: prov.evidence,
      missingInstrument: prov.missingInstrument || null,
      breakReason: ch.breakReason || null };
  });
  const perType = aggregateByType(individuals);
  // UNMET streaks (wave-4 census streaks whose id was never met on the seed).
  const unmet = [], allStreaks = [], allCollisions = [];
  for (const seed of SEEDS) {
    const metMids = new Set(allW4.filter(m => m.seed === seed).map(m => m.mid));
    const { streaks, collisions } = buildStreaks(censusBySeed[seed], metMids);
    for (const st of streaks) allStreaks.push(Object.assign({ seed }, st));
    for (const co of collisions) allCollisions.push(Object.assign({ seed }, co));
    for (const st of streaks) if (!st.met) unmet.push(Object.assign({ seed }, st));
  }
  // Named provenance cases on THIS band (first meeting of the mid on
  // the seed, any channel — the w4meet cases are raid-channel there).
  const NAMED = [
    { seed: 75113, mid: 'eulogy', w4meetOpening: 675, w4meetChannel: 'raid', w4meetDay: 136 },
    { seed: 75116, mid: 'audit', w4meetOpening: 825, w4meetChannel: 'field', w4meetDay: 139 },
    { seed: 75113, mid: 'influencer', w4meetOpening: 637, w4meetChannel: 'raid', w4meetDay: 127 },
  ];
  const namedCases = NAMED.map(nc => {
    const cands = allW4.filter(m => m.seed === nc.seed && m.mid === nc.mid)
      .sort((a, b) => (a.day - b.day) || ((a.part | 0) - (b.part | 0)));
    const first = cands[0] || null;
    if (!first) {
      return Object.assign({}, nc, { reproduced: false, verdict: 'NOT-REPRODUCED',
        evidence: 'no wave-4 meeting of this mid on this seed in this band' });
    }
    const priors = allW4.filter(m => m.seed === nc.seed && m.mid === nc.mid
      && ((m.day < first.day) || (m.day === first.day && (m.part | 0) < (first.part | 0))));
    const sights = sightingsFor(censusBySeed, nc.seed, nc.mid);
    const floor = defFloor(nc.mid);
    const prov = classifyProvenance({ seed: nc.seed, mid: nc.mid, openingHp: first.mHpStart,
      floor, lastLeft: first.mHpLeft, firstDay: first.day, priorMeetings: priors, sightings: sights });
    const preSights = sights.filter(s => s.day <= first.day);
    const earliestPre = preSights.slice().sort((a, b) => a.day - b.day)[0] || null;
    return Object.assign({}, nc, { reproduced: first.mHpStart === nc.w4meetOpening,
      channel: first.channel, day: first.day, caller: first.caller, openingHp: first.mHpStart,
      floor, ratio: floor ? Math.round((first.mHpStart / floor) * 1000) / 1000 : null,
      priorMeetings: priors.map(p => ({ day: p.day, channel: p.channel, mHpLeft: p.mHpLeft })),
      earliestPreCensus: earliestPre ? { day: earliestPre.day, hp: earliestPre.hp, maxHp: earliestPre.maxHp, tile: `${earliestPre.tx},${earliestPre.ty}` } : null,
      preCensusSightings: preSights.length,
      verdict: prov.cls, evidence: prov.evidence, missingInstrument: prov.missingInstrument || null });
  });
  // Substrate equivalence vs chainclose corpus.
  const substrate = {};
  let substrateOk = true;
  for (const seed of SEEDS) {
    const same = filesByteEqual(path.join(evidDir, `s${seed}-fresh.json`),
      path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a', `s${seed}-fresh.json`));
    substrate[seed] = same;
    if (!same) substrateOk = false;
  }
  const belowFloor = individuals.filter(i => i.floor != null && i.openingHp < i.floor);
  const completeness = cc.corpusOk && joinErrors === 0 && cc.mDealtMismatches === 0
    && cc.srPrefixViolations === 0 && censusOk;
  // CENSUS-COMPLETENESS (prereg primary leg) is judged by the caller
  // from individuals[].provenance + namedCases[].verdict, not here:
  // every individual row carries exactly one class by construction.
  return { corpusOk: cc.corpusOk, joinTotal: cc.joinTotal, joinErrors: cc.joinErrors,
    allChannelJoinTotal: joinTotal, allChannelJoinErrors: joinErrors,
    mDealtMismatches: cc.mDealtMismatches, srChecked: cc.srChecked,
    srPrefixViolations: cc.srPrefixViolations, censusInfo, censusOk,
    completeness, substrate, substrateOk,
    censusCounts: cc.census, wildN: cc.wildN,
    individuals, perType, belowFloorN: belowFloor.length,
    belowFloor: belowFloor.map(i => ({ seed: i.seed, mid: i.mid, openingHp: i.openingHp, floor: i.floor, ratio: i.ratio, provenance: i.provenance })),
    unmetStreaks: unmet, allStreaksN: allStreaks.length, collisions: allCollisions,
    namedCases, wall: cc.wall,
    wildDetail: cc.wildDetail };
}

function senseBelowFloor(evidDir) {
  const res = analyze(evidDir);
  const rows = {};
  for (const seed of SEEDS) rows[seed] = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
  // Logs for below-floor first meetings: wild individuals + named cases.
  const wanted = new Map();
  for (const ind of res.individuals) {
    if (ind.floor != null && ind.openingHp < ind.floor) wanted.set(`${ind.seed}|${ind.mid}|${ind.firstDay}`, ind);
  }
  for (const nc of res.namedCases) {
    if (nc.day != null) wanted.set(`${nc.seed}|${nc.mid}|${nc.day}`, nc);
  }
  const { meetings } = joinAllChannel(evidDir, SEEDS);
  let printed = 0;
  for (const m of meetings) {
    const key = `${m.seed}|${m.mid}|${m.day}`;
    if (!wanted.has(key)) continue;
    console.log(`\n--- s${m.seed} d${m.day} ${m.mid} channel=${m.channel} caller=${m.caller} outcome=${m.outcome} rounds=${m.rounds} mHpStart=${m.mHpStart} mHpLeft=${m.mHpLeft} mDealt=${m.mDealt} logLines=${m.log.length} ---`);
    for (const line of m.log) console.log('  ' + line);
    printed++;
  }
  console.log(`\nSENSE-BELOWFLOOR printed=${printed} wanted=${wanted.size}`);
  return printed;
}

function legacyCases() {
  // w4meet corpus (2026-10-29): prior-meeting-only classification — no
  // census exists there, so census-dependent classes cannot fire and
  // any no-prior below-floor case lands UNDETERMINED with the missing
  // instrument named (that gap is exactly what this band's census fills).
  const dir = path.join(REPO, 'evidence', '2026-10-29', 'perseed-w4meet-a');
  const seeds = [];
  for (let s = 75101; s <= 75116; s++) seeds.push(s);
  const { meetings, joinTotal, joinErrors } = joinAllChannel(dir, seeds);
  const NAMED = [
    { seed: 75113, mid: 'eulogy', opening: 675, channel: 'raid', day: 136 },
    { seed: 75116, mid: 'audit', opening: 825, channel: 'field', day: 139 },
    { seed: 75113, mid: 'influencer', opening: 637, channel: 'raid', day: 127 },
  ];
  const out = NAMED.map(nc => {
    const cands = meetings.filter(m => m.seed === nc.seed && m.mid === nc.mid)
      .sort((a, b) => (a.day - b.day) || ((a.part | 0) - (b.part | 0)));
    const first = cands[0] || null;
    if (!first) return Object.assign({}, nc, { found: false });
    const priors = meetings.filter(m => m.seed === nc.seed && m.mid === nc.mid
      && ((m.day < first.day) || (m.day === first.day && (m.part | 0) < (first.part | 0))));
    const prov = classifyProvenance({ seed: nc.seed, mid: nc.mid, openingHp: first.mHpStart,
      floor: defFloor(nc.mid), lastLeft: first.mHpLeft, firstDay: first.day,
      priorMeetings: priors, sightings: [] });
    return Object.assign({}, nc, { found: true, channel: first.channel, day: first.day,
      openingHp: first.mHpStart, priorMeetings: priors.map(p => ({ day: p.day, channel: p.channel, mHpLeft: p.mHpLeft })),
      verdict: prov.cls, evidence: prov.evidence, missingInstrument: prov.missingInstrument || null });
  });
  return { joinTotal, joinErrors, cases: out };
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-spawnhp-a');
  if (args.indexOf('--sense-belowfloor') >= 0) { senseBelowFloor(evidDir); return; }
  if (args.indexOf('--legacy-cases') >= 0) {
    const r = legacyCases();
    console.log(`LEGACY joinTotal=${r.joinTotal} joinErrors=${r.joinErrors}`);
    for (const c of r.cases) console.log(`  LEGACY s${c.seed} ${c.mid} found=${c.found} day=${c.day} channel=${c.channel} opening=${c.openingHp} verdict=${c.verdict} evidence=${c.evidence} missing=${c.missingInstrument || '-'}`);
    return;
  }
  const res = analyze(evidDir);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 1) + '\n');
  console.log('=== sim-spawnhp-a census ===');
  console.log(`corpusOk=${res.corpusOk} joins=${res.joinTotal} joinErrors=${res.joinErrors} allChannelJoinErrors=${res.allChannelJoinErrors} mDealtMismatches=${res.mDealtMismatches} srChecked=${res.srChecked} srPrefixViolations=${res.srPrefixViolations} censusOk=${res.censusOk} substrateOk=${res.substrateOk}`);
  console.log(`WAVE-4 CENSUS: wild=${res.censusCounts.wild} raid=${res.censusCounts.raid} other=${res.censusCounts.other} ${JSON.stringify(res.censusCounts.otherChannels)}`);
  console.log(`WILD INDIVIDUALS: n=${res.individuals.length} belowFloor=${res.belowFloorN} unmetStreaks=${res.unmetStreaks.length} streakCollisions=${res.collisions.length}`);
  console.log('PER-TYPE OPENING HP (individuals, not meetings):');
  for (const t of res.perType) console.log(`  ${t.mid} floor=${t.floor} range=${JSON.stringify(t.range)} n=${t.n} min=${t.min} max=${t.max} mean=${t.mean} varianceClaim=${t.varianceClaim}`);
  for (const i of res.individuals) console.log(`  IND s${i.seed} ${i.mid} n=${i.chainN} d${i.firstDay} caller=${i.firstCaller} open=${i.openingHp} floor=${i.floor} ratio=${i.ratio} prior=${JSON.stringify(i.priorMeetings)} preCensus=${i.preCensusSightings} earliestPre=${JSON.stringify(i.earliestPreCensus)} prov=${i.provenance}`);
  console.log('NAMED CASES (this band):');
  for (const c of res.namedCases) console.log(`  CASE s${c.seed} ${c.mid} w4meet=${c.w4meetOpening}/${c.w4meetChannel}/d${c.w4meetDay} reproduced=${c.reproduced} channel=${c.channel} day=${c.day} open=${c.openingHp} floor=${c.floor} ratio=${c.ratio} verdict=${c.verdict} evidence=${c.evidence}`);
  console.log(`UNMET STREAKS: ${res.unmetStreaks.length}`);
  for (const s of res.unmetStreaks) console.log(`  UNMET s${s.seed} ${s.mid} d${s.firstDay}-d${s.lastDay} hp=${s.hp} maxHp=${s.maxHp} tiles=${JSON.stringify(s.tiles)}`);
  const w = res.wall;
  console.log(`WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.nationalEver} natFinal=${w.nationalFinal} table=${w.table} entered=${w.entered} wave4reach=${w.wave4reach} wave5reach=${w.wave5reach} median=${w.medianDays} days=${JSON.stringify(w.daysSorted)} deaths=${w.deaths}`);
  console.log(`COMPLETENESS=${res.completeness ? 'PASS' : 'FAIL'} SUBSTRATE=${res.substrateOk ? 'PASS' : 'FAIL'}`);
  if (!res.completeness || !res.substrateOk) process.exit(1);
}
if (require.main === module) main();
module.exports = { classifyProvenance, aggregateByType, buildStreaks, filesByteEqual, censoredOf, defFloor, defRange, joinAllChannel, sightingsFor, analyze, legacyCases };
