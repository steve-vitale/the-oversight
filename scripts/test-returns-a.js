#!/usr/bin/env node
// scripts/test-returns-a.js — sim-returns-a returns analyzer / census judge.
// DIAGNOSIS ONLY: pure reads of sim corpora, never game state.
// Primary: evidence/2026-10-29/perseed-returns-a/s<seed>-fresh.json
//   (fieldparty.meetings + returns.meetings/departures/drops,
//   seeds 75101-75116, base code).
// Join: per seed, returns meetings join to fieldparty meetings by
// fight-order index; the join is VERIFIED (mid, vid, day must match
// at every index) and join errors must be 0.
// Classification (prereg, per judgedA meeting, never from outcome):
//   DELIBERATE: live objective kind HUNT, state 'out', huntMid == mid,
//     AND a pre-meeting sighting for that mid strictly before the
//     meeting's (day, dayPart).
//   DELIBERATE-ORPHANED: live HUNT 'out' for mid, no pre-meeting sighting.
//   HUNT-READY-NOT-OUT: HUNT for mid, state != 'out'.
//   MEMORY-ONLY: pre-meeting sighting for mid, no live HUNT for mid.
//   ACCIDENTAL: neither.
// Chain rule verbatim from sim-chainkill-a (exact HP equality, most-
// recent predecessor, AMBIGUOUS/FORK/IMPOSSIBLE-LINK flags).
// Exit 1 on corpus invalidity, control-shape failure, join errors,
// unclassified meetings, or OTHER chains. The DIAG-GO verdict
// additionally requires the sense transcripts + ranked next step in
// the evidence file (not checkable here).
// Usage: node scripts/test-returns-a.js [--out <path>]
// When required as a module (fixtures), main() does NOT run; the
// classification/chain functions are exported.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS16 = [];
for (let s = 75101; s <= 75116; s++) SEEDS16.push(s);
// Chainkill fresh per-seed judgedA counts (published, diagnostic only).
const CHAINKILL_PER_SEED = { 75106: 15, 75108: 9, 75109: 8, 75115: 5, 75116: 4, 75110: 1 };

function medianOf(arr) {
  const s = arr.filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return null;
  return s[Math.floor(s.length / 2)];
}
function round1(v) { return (v === null || v === undefined || !Number.isFinite(v)) ? null : Math.round(v * 10) / 10; }
function chebyshev(ax, ay, bx, by) {
  if (ax == null || ay == null || bx == null || by == null) return null;
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

// Pre-meeting test (prereg): a sighting counts as pre-meeting iff its
// (day, dayPart) is strictly before the meeting's (day, dayPart).
// Same-day sightings without part proof are conservatively NOT
// pre-meeting (the meeting's own memory write must never classify
// its own meeting).
function isPreMeeting(sighting, meeting) {
  if (!sighting || sighting.day == null || meeting == null || meeting.day == null) return false;
  if (sighting.day < meeting.day) return true;
  if (sighting.day === meeting.day) {
    if (sighting.part != null && meeting.dayPart != null) return sighting.part < meeting.dayPart;
    return false;
  }
  return false;
}

function huntTileClass(obj, mTile) {
  if (!obj || obj.huntTx == null || obj.huntTy == null || !mTile || mTile.tx == null || mTile.ty == null) return null;
  const d = chebyshev(obj.huntTx, obj.huntTy, mTile.tx, mTile.ty);
  if (d === 0) return 'EXACT';
  if (d <= 2) return 'NEAR';
  return 'FAR';
}

// joined: { fp (fieldparty meeting), rt (returns meeting) }.
// Returns { cls, flags[], huntTile, preSightings }.
function classifyMeeting(joined) {
  const fp = joined.fp;
  const rt = joined.rt;
  const mid = fp.mid;
  const obj = rt ? rt.leaderObjective : null;
  const isHuntForMid = !!(obj && obj.kind === 'HUNT' && obj.huntMid === mid);
  const pre = ((rt && rt.leaderSightings) || []).filter(s => s.mid === mid && isPreMeeting(s, rt));
  let cls;
  if (isHuntForMid && obj.state === 'out' && pre.length > 0) cls = 'DELIBERATE';
  else if (isHuntForMid && obj.state === 'out') cls = 'DELIBERATE-ORPHANED';
  else if (isHuntForMid) cls = 'HUNT-READY-NOT-OUT';
  else if (pre.length > 0) cls = 'MEMORY-ONLY';
  else cls = 'ACCIDENTAL';
  const flags = [];
  const allyVid = fp.joinedAllyVid || (rt && rt.joinedAllyVid) || null;
  if (allyVid && rt && rt.allySightings && rt.allySightings[allyVid]) {
    const allyPre = rt.allySightings[allyVid].filter(s => s.mid === mid && isPreMeeting(s, rt));
    if (allyPre.length > 0) flags.push('ALLY-KNOWER');
  }
  if (obj && obj.kind === 'HUNT' && obj.huntMid && obj.huntMid !== mid) flags.push('HUNT-OTHER-MID');
  const huntTile = (cls === 'DELIBERATE' || cls === 'DELIBERATE-ORPHANED')
    ? huntTileClass(obj, fp.mTile || (rt && rt.mTile) || null) : null;
  return { cls, flags, huntTile, preSightings: pre.length };
}

function isFormedCrew(m) {
  return ((m.crewRaw || []).filter(v => v !== m.vid)).length > 0 && (m.calledHelp || !!m.joinedAllyVid);
}

// Chain builder: verbatim rule from test-chainkill-a.js (link = exact
// HP equality to the most-recent earlier same-mid meeting with
// mHpLeft > 0; chains = maximal linked sequences >= 2).
function buildChains(meetings) {
  const bySeed = {};
  for (const m of meetings) (bySeed[m.seed] = bySeed[m.seed] || []).push(m);
  const chains = [];
  const singletons = [];
  const excluded = [];
  const links = [];
  const anomalies = [];
  for (const seed of Object.keys(bySeed).sort()) {
    const seq = bySeed[seed];
    let lastKey = null;
    const kept = [];
    for (const m of seq) {
      const key = [(m.day | 0), (m.part | 0)];
      if (lastKey && (key[0] < lastKey[0] || (key[0] === lastKey[0] && key[1] < lastKey[1]))) {
        anomalies.push({ seed: +seed, day: m.day, part: m.part, vid: m.vid, mid: m.mid, note: 'day/part decreased vs prior meeting — excluded from chaining' });
        excluded.push(m);
        continue;
      }
      lastKey = key;
      kept.push(m);
    }
    const succ = new Map();
    const pred = new Map();
    const chainOf = new Map();
    for (const b of kept) {
      if (b.mHpStart === null || b.mHpStart === undefined) continue;
      const cands = kept.filter(a => a !== b && kept.indexOf(a) < kept.indexOf(b)
        && a.mid === b.mid && a.mHpLeft !== null && a.mHpLeft !== undefined
        && (a.mHpLeft | 0) > 0 && (b.mHpStart | 0) === (a.mHpLeft | 0));
      if (!cands.length) continue;
      const a = cands[cands.length - 1];
      const flags = [];
      if (cands.length > 1) flags.push('AMBIGUOUS');
      if (succ.has(a)) flags.push('FORK');
      if (a.outcome === 'vKill' || a.outcome === 'alreadyDead') flags.push('IMPOSSIBLE-LINK');
      succ.set(a, b);
      pred.set(b, { from: a, flags });
      let tileDist = null;
      try {
        if (a.mTile && b.mTile && typeof a.mTile.tx === 'number' && typeof b.mTile.tx === 'number')
          tileDist = Math.abs(a.mTile.tx - b.mTile.tx) + Math.abs(a.mTile.ty - b.mTile.ty);
      } catch (e) { tileDist = null; }
      links.push({ seed: +seed, from: { day: a.day, part: a.part, vid: a.vid, mid: a.mid, mHpLeft: a.mHpLeft, outcome: a.outcome },
        to: { day: b.day, part: b.part, vid: b.vid, mid: b.mid, mHpStart: b.mHpStart }, flags, tileDist });
      if (chainOf.has(a)) {
        const ch = chainOf.get(a);
        ch.push(b);
        chainOf.set(b, ch);
      } else {
        const ch = [a, b];
        chainOf.set(a, ch);
        chainOf.set(b, ch);
        chains.push(ch);
      }
    }
    for (const m of kept) if (!pred.has(m) && !succ.has(m)) singletons.push(m);
  }
  const classified = chains.map((ch) => {
    const term = ch[ch.length - 1];
    let cls;
    if (term.outcome === 'vKill') cls = 'KILL';
    else if (term.outcome === 'mFlee') cls = 'DRIVE-OFF';
    else if (term.outcome === 'vFlee' || term.outcome === 'vDie' || term.outcome === 'evade') cls = 'STILL-ALIVE';
    else if (term.outcome === 'alreadyDead') cls = 'BEAST-GONE';
    else cls = 'OTHER';
    const totalDamage = ch.reduce((t, m) => t + (m.mDealt | 0), 0);
    const totalRounds = ch.reduce((t, m) => t + (m.rounds | 0), 0);
    const chainDPR = totalRounds > 0 ? totalDamage / totalRounds : 0;
    const termHp = (term.mHpLeft === null || term.mHpLeft === undefined) ? null : (term.mHpLeft | 0);
    return {
      seed: ch[0].seed, mid: ch[0].mid,
      meetings: ch.map(m => ({ day: m.day, part: m.part, vid: m.vid, caller: m.caller,
        mTile: m.mTile || null, mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, outcome: m.outcome,
        rounds: m.rounds, mDealt: m.mDealt,
        retClass: m._retClass || null, retFlags: m._retFlags || [], retHuntTile: m._retHuntTile || null })),
      length: ch.length,
      spanDays: (ch[ch.length - 1].day | 0) - (ch[0].day | 0),
      totalDamage, totalRounds, chainDPR: round1(chainDPR),
      terminalHp: termHp, terminalOutcome: term.outcome || null, cls,
      flags: null, flagged: null,
    };
  });
  return { chains: classified, singletons, excluded, links, anomalies, rawChains: chains };
}

function loadWaveMap() {
  const map = {};
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const arr = Array.isArray(raw) ? raw : (raw.monsters || raw.data || []);
    for (const d of (arr || [])) if (d && d.id) map[d.id] = (d.wave | 0) || null;
  } catch (e) { /* wave map best-effort; unknown mids counted as unknown */ }
  return map;
}

function main() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-returns-a');
  const rows = [];
  const problems = [];
  const joinErrors = [];
  for (const seed of SEEDS16) {
    const p = path.join(evidDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(p)) { problems.push(`missing s${seed}-fresh.json`); continue; }
    let r;
    try { r = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { problems.push(`seed ${seed}: unparsable`); continue; }
    rows.push(r);
    if (!(r.days > 0)) problems.push(`seed ${seed}: days<=0`);
    for (const key of ['fieldparty', 'returns']) {
      const st = r[key];
      if (!st || !Array.isArray(st.meetings)) problems.push(`seed ${seed}: no ${key}.meetings`);
      else if (st.diag) {
        if (st.diag.errs !== 0) problems.push(`seed ${seed} (${key}): recorder errs=${st.diag.errs}`);
        if (Object.values(st.diag.overflow || {}).some(v => (v | 0) !== 0)) problems.push(`seed ${seed} (${key}): recorder overflow`);
      }
    }
    // Join verification: same fight order, same mid/vid/day at every index.
    const fpMs = ((r.fieldparty || {}).meetings || []);
    const rtMs = ((r.returns || {}).meetings || []);
    if (fpMs.length !== rtMs.length) {
      joinErrors.push(`seed ${seed}: meeting count mismatch fieldparty=${fpMs.length} returns=${rtMs.length}`);
    } else {
      for (let i = 0; i < fpMs.length; i++) {
        if (fpMs[i].mid !== rtMs[i].mid || fpMs[i].vid !== rtMs[i].vid || fpMs[i].day !== rtMs[i].day) {
          joinErrors.push(`seed ${seed} idx ${i}: fp(${fpMs[i].vid},${fpMs[i].mid},d${fpMs[i].day}) != rt(${rtMs[i].vid},${rtMs[i].mid},d${rtMs[i].day})`);
          if (joinErrors.length > 20) break;
        }
      }
    }
  }
  const corpusOk = problems.length === 0 && rows.length === 16;
  const allFp = [];
  const joined = [];
  for (const r of rows) {
    const fpMs = ((r.fieldparty || {}).meetings || []);
    const rtMs = ((r.returns || {}).meetings || []);
    for (let i = 0; i < fpMs.length; i++) {
      const fp = Object.assign({ seed: r.seed }, fpMs[i]);
      allFp.push(fp);
      joined.push({ fp, rt: rtMs[i] || null, seed: r.seed, index: i });
    }
  }
  const judgedA = joined.filter(j => (j.fp.wave | 0) === 4 && j.fp.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(j.fp.caller) >= 0 && !(j.fp.leader && j.fp.leader.isScholar));
  const judgedB = joined.filter(j => (j.fp.wave | 0) === 4 && j.fp.channel === 'field'
    && ['resolve', 'patrol'].indexOf(j.fp.caller) >= 0 && !(j.fp.leader && j.fp.leader.isScholar));
  const formedA = judgedA.filter(j => isFormedCrew(j.fp));
  const formedB = judgedB.filter(j => isFormedCrew(j.fp));
  const killsA = judgedA.filter(j => j.fp.outcome === 'vKill');
  const killsB = judgedB.filter(j => j.fp.outcome === 'vKill');
  const controlPass = formedA.length === 0 && formedB.length === 0 && killsA.length === 0 && killsB.length === 0;
  // Per-seed judgedA vs chainkill published (diagnostic, not a gate).
  const perSeedA = {};
  for (const j of judgedA) perSeedA[j.seed] = (perSeedA[j.seed] || 0) + 1;
  const perSeedDiff = [];
  for (const seed of SEEDS16) {
    const got = perSeedA[seed] || 0;
    const want = CHAINKILL_PER_SEED[seed] || 0;
    if (got !== want) perSeedDiff.push(`s${seed}: got ${got}, chainkill ${want}`);
  }
  // Classify every judgedA meeting.
  const classified = judgedA.map(j => {
    const c = classifyMeeting(j);
    j.retClass = c.cls; j.retFlags = c.flags; j.retHuntTile = c.huntTile; j.retPre = c.preSightings;
    return j;
  });
  const classCounts = {};
  for (const j of classified) classCounts[j.retClass] = (classCounts[j.retClass] || 0) + 1;
  const outcomeByClass = {};
  for (const j of classified) {
    const o = outcomeByClass[j.retClass] = outcomeByClass[j.retClass] || {};
    o[j.fp.outcome || 'null'] = (o[j.fp.outcome || 'null'] || 0) + 1;
  }
  const huntTileCounts = {};
  for (const j of classified) {
    if (j.retClass === 'DELIBERATE' || j.retClass === 'DELIBERATE-ORPHANED') {
      const k = j.retClass + ':' + (j.retHuntTile || 'null');
      huntTileCounts[k] = (huntTileCounts[k] || 0) + 1;
    }
  }
  const allyKnowerCount = classified.filter(j => (j.retFlags || []).indexOf('ALLY-KNOWER') >= 0).length;
  const huntOtherMidCount = classified.filter(j => (j.retFlags || []).indexOf('HUNT-OTHER-MID') >= 0).length;
  const unclassified = classified.filter(j => !j.retClass);
  // Chains (fieldparty fields, with return classes attached).
  const chainInput = judgedA.map(j => {
    const m = Object.assign({}, j.fp, { seed: j.seed });
    m._retClass = j.retClass; m._retFlags = j.retFlags; m._retHuntTile = j.retHuntTile;
    return m;
  });
  const built = buildChains(chainInput);
  for (const c of built.chains) {
    const mkeys = new Set(c.meetings.map(m => `${m.day}|${m.part}|${m.vid}`));
    const fl = [];
    for (const l of built.links) {
      const fk = `${l.from.day}|${l.from.part}|${l.from.vid}`;
      const tk = `${l.to.day}|${l.to.part}|${l.to.vid}`;
      if (mkeys.has(fk) && mkeys.has(tk) && l.flags.length) fl.push(...l.flags);
    }
    c.flags = fl;
    c.flagged = fl.length > 0;
  }
  const chainClasses = {};
  for (const c of built.chains) chainClasses[c.cls] = (chainClasses[c.cls] || 0) + 1;
  const chainsWithDelib = built.chains.filter(c => c.meetings.some(m => m.retClass === 'DELIBERATE'));
  const chainsWithDelibTerminal = built.chains.filter(c => {
    const t = c.meetings[c.meetings.length - 1];
    return t && t.retClass === 'DELIBERATE';
  });
  const chainMeetings = built.chains.reduce((t, c) => t + c.length, 0);
  const delibChainMeetings = built.chains.reduce((t, c) => t + c.meetings.filter(m => m.retClass === 'DELIBERATE').length, 0);
  const delibNonChain = classified.filter(j => j.retClass === 'DELIBERATE'
    && !built.chains.some(c => c.meetings.some(m => m.day === j.fp.day && m.part === j.fp.part && m.vid === j.fp.vid)));
  const delibMeetings = classified.filter(j => j.retClass === 'DELIBERATE');
  const orphanMeetings = classified.filter(j => j.retClass === 'DELIBERATE-ORPHANED');
  // HUNT attempt census.
  const waveMap = loadWaveMap();
  const allDepartures = [];
  const allDrops = [];
  for (const r of rows) {
    for (const d of (((r.returns || {}).departures) || [])) allDepartures.push(Object.assign({ seed: r.seed }, d));
    for (const d of (((r.returns || {}).drops) || [])) allDrops.push(Object.assign({ seed: r.seed }, d));
  }
  const huntDepartures = allDepartures.filter(d => d.objective && d.objective.kind === 'HUNT');
  const huntDeparturesW4 = huntDepartures.filter(d => waveMap[d.objective.huntMid] === 4);
  const huntDrops = allDrops.filter(d => d.dropped);
  const huntDropsW4 = huntDrops.filter(d => waveMap[d.mid] === 4);
  // Pair each DELIBERATE meeting to its most recent prior HUNT departure
  // for the same vid+mid (same seed, returns-part counter scale).
  let paired = 0;
  const lags = [];
  const unpairedDelib = [];
  for (const j of delibMeetings) {
    const cands = huntDepartures.filter(d => d.seed === j.seed && d.vid === j.fp.vid
      && d.objective && d.objective.huntMid === j.fp.mid
      && (d.day < j.fp.day || (d.day === j.fp.day && (d.part | 0) <= (j.rt.part | 0))));
    if (!cands.length) { unpairedDelib.push(j); continue; }
    cands.sort((a, b) => ((a.day - b.day) || ((a.part | 0) - (b.part | 0))));
    const dep = cands[cands.length - 1];
    paired++;
    // Both parts are the returns recorder's cumulative advancePart
    // counter, so their difference IS the lag in day-parts.
    lags.push((j.rt.part | 0) - (dep.part | 0));
  }
  const lagParts = lags;
  // Wall (primary band).
  const wall = {
    won: rows.reduce((t, r) => t + (r.won ? 1 : 0), 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + (r.nationalEver || 0), 0),
    nationalFinal: rows.reduce((t, r) => t + (r.nationalFinal || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    entered: rows.reduce((t, r) => t + (r.entered || 0), 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
    deathTotal: rows.reduce((t, r) => t + (r.deathTotal || 0), 0),
  };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;

  console.log('=== sim-returns-a analyzer ===');
  console.log(`corpus: rows=${rows.length}/16 ok=${corpusOk} ${problems.join('; ')}`);
  console.log(`JOIN: fieldparty=${allFp.length} returns=${joined.length} errors=${joinErrors.length} ${joinErrors.slice(0, 5).join('; ')}`);
  console.log(`CONTROL-SHAPE: judgedA=${judgedA.length} formedA=${formedA.length} killsA=${killsA.length} | judgedB=${judgedB.length} formedB=${formedB.length} killsB=${killsB.length} => ${controlPass ? 'PASS' : 'FAIL'}`);
  console.log(`CHAINKILL-DIAGNOSTIC per-seed judgedA diffs: ${perSeedDiff.length ? perSeedDiff.join('; ') : 'NONE (reproduces chainkill exactly)'}`);
  console.log(`WALL: won=${wall.won} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} starv=${wall.starvationTotal} deaths=${wall.deathTotal}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(deathsByCause)}`);
  console.log(`RETURNS (judgedA meetings=${judgedA.length}): classes=${JSON.stringify(classCounts)}`);
  console.log(`  outcomes by class: ${JSON.stringify(outcomeByClass)}`);
  console.log(`  hunt-tile (deliberate classes): ${JSON.stringify(huntTileCounts)}`);
  console.log(`  flags: ALLY-KNOWER=${allyKnowerCount} HUNT-OTHER-MID=${huntOtherMidCount} unclassified=${unclassified.length}`);
  console.log(`CHAINS: meetings=${judgedA.length} unchained=${built.singletons.length} chains=${built.chains.length} classes=${JSON.stringify(chainClasses)} OTHER=${built.chains.filter(c => c.cls === 'OTHER').length} links=${built.links.length} flaggedLinks=${built.links.filter(l => l.flags.length).length} anomalies=${built.anomalies.length}`);
  console.log(`  chains with >=1 DELIBERATE meeting=${chainsWithDelib.length} | with DELIBERATE terminal=${chainsWithDelibTerminal.length} | chain meetings=${chainMeetings} deliberate chain meetings=${delibChainMeetings} | DELIBERATE meetings NOT in any chain=${delibNonChain.length}`);
  console.log(`HUNT ATTEMPTS: departures all=${allDepartures.length} HUNT=${huntDepartures.length} HUNT wave-4=${huntDeparturesW4.length} | drops all=${allDrops.length} dropped=${huntDrops.length} dropped wave-4=${huntDropsW4.length}`);
  console.log(`  DELIBERATE meetings=${delibMeetings.length} paired to prior HUNT departure=${paired} unpaired=${unpairedDelib.length} median lag parts=${medianOf(lagParts)}`);
  console.log('PER-MEETING (judgedA, classified):');
  for (const j of classified) {
    const rt = j.rt || {};
    const obj = rt.leaderObjective;
    console.log(`  [s${j.seed} d${j.fp.day} ${j.fp.vid} ${j.fp.mid} ${j.fp.mHpStart}->${j.fp.mHpLeft} ${j.fp.outcome} caller=${j.fp.caller}] class=${j.retClass} flags=${JSON.stringify(j.retFlags)} huntTile=${j.retHuntTile} obj=${obj ? obj.kind + '/' + obj.state + '/' + (obj.huntMid || '-') : 'null'} preSight=${j.retPre}`);
  }
  console.log('PER-CHAIN:');
  for (const c of built.chains) {
    const path = c.meetings.map(m => `d${m.day} ${m.vid} ${m.mHpStart}->${m.mHpLeft} ${m.outcome}[${m.retClass}]`).join(' | ');
    console.log(`  [s${c.seed} ${c.mid}] len=${c.length} dmg=${c.totalDamage} termHp=${c.terminalHp} cls=${c.cls} flagged=${c.flagged} :: ${path}`);
  }
  console.log('HUNT DEPARTURES (wave-4 only):');
  for (const d of huntDeparturesW4) {
    console.log(`  [s${d.seed} d${d.day} ${d.vid} -> ${d.objective.huntMid} @(${d.objective.huntTx},${d.objective.huntTy}) memDay=${d.objective.huntDay}]`);
  }
  console.log('HUNT DROPS (wave-4 only):');
  for (const d of huntDropsW4) {
    console.log(`  [s${d.seed} d${d.day} ${d.vid} ${d.mid} @(${d.tx},${d.ty}) dropped=${d.dropped}]`);
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify({ corpusOk, controlPass, joinErrors,
      judgedA: judgedA.length, formedA: formedA.length, killsA: killsA.length,
      judgedB: judgedB.length, formedB: formedB.length, killsB: killsB.length,
      perSeedA, perSeedDiff, wall, deathsByCause,
      classCounts, outcomeByClass, huntTileCounts, allyKnowerCount, huntOtherMidCount,
      chains: built.chains, chainClasses, chainsWithDelib: chainsWithDelib.length,
      chainsWithDelibTerminal: chainsWithDelibTerminal.length,
      singletons: built.singletons.map(m => ({ seed: m.seed, day: m.day, vid: m.vid, mid: m.mid, mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, outcome: m.outcome })),
      classifiedMeetings: classified.map(j => ({ seed: j.seed, day: j.fp.day, part: j.fp.part, vid: j.fp.vid, mid: j.fp.mid, caller: j.fp.caller, mTile: j.fp.mTile, mHpStart: j.fp.mHpStart, mHpLeft: j.fp.mHpLeft, outcome: j.fp.outcome, rounds: j.fp.rounds, mDealt: j.fp.mDealt, retClass: j.retClass, retFlags: j.retFlags, retHuntTile: j.retHuntTile, retPre: j.retPre, leaderObjective: (j.rt || {}).leaderObjective || null, leaderSightings: (j.rt || {}).leaderSightings || [] })),
      hunt: { departuresAll: allDepartures.length, huntDepartures: huntDepartures.length, huntDeparturesW4: huntDeparturesW4.length, dropsAll: allDrops.length, huntDrops: huntDrops.length, huntDropsW4: huntDropsW4.length, deliberatePaired: paired, deliberateUnpaired: unpairedDelib.length, medianLagParts: medianOf(lagParts),
        allHuntDepartures: huntDepartures, allHuntDrops: huntDrops,
        huntDeparturesW4Detail: huntDeparturesW4, huntDropsW4Detail: huntDropsW4,
        deliberateDetail: delibMeetings.map(j => ({ seed: j.seed, day: j.fp.day, vid: j.fp.vid, mid: j.fp.mid, mTile: j.fp.mTile, mHpStart: j.fp.mHpStart, mHpLeft: j.fp.mHpLeft, outcome: j.fp.outcome, huntTile: j.retHuntTile, objective: (j.rt || {}).leaderObjective || null })),
        orphanDetail: orphanMeetings.map(j => ({ seed: j.seed, day: j.fp.day, vid: j.fp.vid, mid: j.fp.mid, outcome: j.fp.outcome, huntTile: j.retHuntTile, objective: (j.rt || {}).leaderObjective || null })) },
    }, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  if (!corpusOk) { console.log('CENSUS: FAIL (corpus invalid)'); process.exit(1); }
  if (joinErrors.length > 0) { console.log('JOIN: FAIL'); process.exit(1); }
  if (!controlPass) { console.log('CONTROL-SHAPE: FAIL — do not judge returns'); process.exit(1); }
  if (unclassified.length > 0) { console.log('CLASSIFICATION: FAIL (unclassified meetings)'); process.exit(1); }
  if (built.chains.some(c => c.cls === 'OTHER')) { console.log('CLASSIFICATION: FAIL (OTHER chains)'); process.exit(1); }
  console.log('MACHINE LEGS: census PASS, join PASS, control-shape PASS, classification PASS (sense + ranked next step live in evidence)');
}

if (require.main === module) main();
module.exports = { isPreMeeting, classifyMeeting, buildChains, huntTileClass, chebyshev };
