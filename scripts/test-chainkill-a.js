#!/usr/bin/env node
// scripts/test-chainkill-a.js — sim-chainkill-a chain analyzer / census judge.
// DIAGNOSIS ONLY: pure reads of sim corpora, never game state.
// Primary: evidence/2026-10-28/perseed-chainkill-a/s<seed>-fresh.json
//   (fieldparty.meetings, seeds 75101-75116, base code).
// Secondary (never pooled): perseed-fieldfeed-a/s<seed>-armed.json
//   (fieldfeed.meetings) and perseed-shoutgate-a/s<seed>-armed.json
//   (fieldparty.meetings) — the formed-party corpora.
// Chain rule (prereg, verbatim in intent): universe = wave-4, field,
// caller resolve/patrol/aid (primary; secondary use the predecessor
// judged sets), villager-led. Per seed, file order = chronological.
// B links to the MOST RECENT earlier A with same mid and
// B.mHpStart == A.mHpLeft (exact, both non-null, A.mHpLeft > 0).
// Flags: AMBIGUOUS (2+ matching A's), FORK (chosen A already has a
// successor), IMPOSSIBLE-LINK (chosen A ended vKill/alreadyDead —
// unreachable by construction since those leave mHpLeft 0, kept as
// a defensive check). Chains = maximal linked sequences of >= 2.
// Classification by TERMINAL meeting outcome: vKill -> KILL,
// mFlee -> DRIVE-OFF, vFlee/vDie/evade -> STILL-ALIVE,
// alreadyDead -> BEAST-GONE, else OTHER (must be 0).
// Exit 1 on corpus invalidity, control-shape failure, or OTHER > 0.
// The DIAG-GO verdict additionally requires the sense transcripts +
// ranked next step in the evidence file (not checkable here).
// Usage: node scripts/test-chainkill-a.js [--out <path>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS16 = [];
for (let s = 75101; s <= 75116; s++) SEEDS16.push(s);
const SEEDS8 = [];
for (let s = 75101; s <= 75108; s++) SEEDS8.push(s);

function medianOf(arr) {
  const s = arr.filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return null;
  return s[Math.floor(s.length / 2)];
}
function round1(v) { return (v === null || v === undefined || !Number.isFinite(v)) ? null : Math.round(v * 10) / 10; }

function loadCorpus(dir, pid, meetingsKey, seeds) {
  const rows = []; const problems = [];
  for (const seed of seeds) {
    const p = path.join(REPO, 'evidence', '2026-10-28', dir, `s${seed}-${pid}.json`);
    if (!fs.existsSync(p)) { problems.push(`missing ${dir}/s${seed}-${pid}.json`); continue; }
    let r;
    try { r = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { problems.push(`seed ${seed} (${dir}): unparsable`); continue; }
    rows.push(r);
    const store = r[meetingsKey];
    if (!store || !Array.isArray(store.meetings)) problems.push(`seed ${seed} (${dir}): no ${meetingsKey}.meetings`);
    else if (store.diag) {
      if (store.diag.errs !== 0) problems.push(`seed ${seed} (${dir}): recorder errs=${store.diag.errs}`);
      if (Object.values(store.diag.overflow || {}).some(v => (v | 0) !== 0)) problems.push(`seed ${seed} (${dir}): recorder overflow`);
    }
    if (!(r.days > 0)) problems.push(`seed ${seed} (${dir}): days<=0`);
  }
  return { rows, problems };
}

function isFormedCrew(m) {
  return ((m.crewRaw || []).filter(v => v !== m.vid)).length > 0 && (m.calledHelp || !!m.joinedAllyVid);
}
function isFormedFeed(m) { return !!m.calledHelp && !!m.joinedAllyVid; }

function buildChains(meetings, formedFn) {
  // meetings: [{seed, ...m}] in file order per seed (caller groups by seed first).
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
    // Link pass in order.
    const succ = new Map(); // meeting object -> successor meeting object
    const pred = new Map(); // meeting object -> { from, flags[] }
    const chainOf = new Map(); // meeting object -> chain array
    for (const b of kept) {
      if (b.mHpStart === null || b.mHpStart === undefined) { continue; }
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
  // Classify chains.
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
        rounds: m.rounds, mDealt: m.mDealt, calledHelp: !!m.calledHelp,
        joinedAllyVid: m.joinedAllyVid || null, formed: formedFn ? !!formedFn(m) : null })),
      length: ch.length,
      spanDays: (ch[ch.length - 1].day | 0) - (ch[0].day | 0),
      sameDay: ((ch[ch.length - 1].day | 0) === (ch[0].day | 0)),
      totalDamage, totalRounds, chainDPR: round1(chainDPR),
      terminalHp: termHp,
      roundsToKillAtChainDPR: (termHp === null) ? null : (chainDPR > 0 ? round1(termHp / chainDPR) : 'inf'),
      roundsAt57: (termHp === null) ? null : round1(termHp / 57),
      roundsAt80: (termHp === null) ? null : round1(termHp / 80),
      fitsCap57: (termHp !== null) ? termHp <= 855 : null,
      fitsCap80: (termHp !== null) ? termHp <= 1200 : null,
      terminalOutcome: term.outcome || null,
      cls,
      // flags attached by the caller (second pass matching links to
      // chain meetings by day/part/vid); null until then.
      flags: null,
      flagged: null,
    };
  });
  return { chains: classified, singletons, excluded, links, anomalies, rawChains: chains };
}

function summarizeChains(built, label) {
  const classes = {};
  for (const c of built.chains) classes[c.cls] = (classes[c.cls] || 0) + 1;
  const other = built.chains.filter(c => c.cls === 'OTHER');
  const flaggedLinks = built.links.filter(l => l.flags.length > 0);
  const tileDists = built.links.map(l => l.tileDist).filter(v => v !== null);
  const tileDistHist = {};
  for (const d of tileDists) tileDistHist[d] = (tileDistHist[d] || 0) + 1;
  const lens = built.chains.map(c => c.length);
  const dmg = built.chains.map(c => c.totalDamage);
  return { label, meetings: null, chains: built.chains.length, classes, other: other.length,
    singletons: built.singletons.length, excluded: built.excluded.length,
    anomalies: built.anomalies.length, links: built.links.length,
    flaggedLinks: flaggedLinks.length, flaggedLinkDetail: flaggedLinks,
    tileDistHist, lenDist: lens.reduce((a, v) => { a[v] = (a[v] || 0) + 1; return a; }, {}),
    maxChainDamage: dmg.length ? Math.max(...dmg) : 0,
    cleanKills: built.chains.filter(c => c.cls === 'KILL').length };
}

function main() {
  const prim = loadCorpus('perseed-chainkill-a', 'fresh', 'fieldparty', SEEDS16);
  const problems = [...prim.problems];
  const corpusOk = problems.length === 0 && prim.rows.length === 16;
  const allMeetings = [];
  for (const r of prim.rows) for (const m of ((r.fieldparty || {}).meetings || [])) allMeetings.push(Object.assign({ seed: r.seed }, m));
  const judgedA = allMeetings.filter(m => (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar));
  const judgedB = allMeetings.filter(m => (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar));
  const formedA = judgedA.filter(isFormedCrew);
  const formedB = judgedB.filter(isFormedCrew);
  const killsA = judgedA.filter(m => m.outcome === 'vKill');
  const killsB = judgedB.filter(m => m.outcome === 'vKill');
  const controlPass = formedA.length === 0 && formedB.length === 0 && killsA.length === 0 && killsB.length === 0;
  // First-8 diagnostic vs retreatdiag fresh (judgedA per-seed counts).
  const first8A = {};
  for (const m of judgedA) if (m.seed <= 75108) first8A[m.seed] = (first8A[m.seed] || 0) + 1;
  const built = buildChains(judgedA, isFormedCrew);
  // Flag attachment, second pass: link endpoints matched to chain meetings by (day, part, vid).
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
  const cleanKills = built.chains.filter(c => c.cls === 'KILL' && !c.flagged);
  const flaggedKills = built.chains.filter(c => c.cls === 'KILL' && c.flagged);
  const summ = summarizeChains(built, 'primary');
  summ.meetings = judgedA.length;
  summ.cleanKills = cleanKills.length;
  summ.flaggedKills = flaggedKills.length;

  // Wall (primary band).
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  void RANK_ORDER;
  const wall = {
    won: prim.rows.reduce((t, r) => t + (r.won ? 1 : 0), 0),
    wonFull: prim.rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(prim.rows.map(r => r.days)),
    nationalEver: prim.rows.reduce((t, r) => t + (r.nationalEver || 0), 0),
    nationalFinal: prim.rows.reduce((t, r) => t + (r.nationalFinal || 0), 0),
    table: prim.rows.reduce((t, r) => t + (r.table || 0), 0),
    entered: prim.rows.reduce((t, r) => t + (r.entered || 0), 0),
    wave4: prim.rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: prim.rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: prim.rows.reduce((t, r) => t + (r.starvationDeaths || 0), 0),
    deathTotal: prim.rows.reduce((t, r) => t + (r.deathTotal || 0), 0),
  };
  const deathsByCause = {};
  for (const r of prim.rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;

  // Secondary corpora (never pooled).
  const secondaries = [];
  const ff = loadCorpus('perseed-fieldfeed-a', 'armed', 'fieldfeed', SEEDS8);
  if (ff.rows.length === 8 && ff.problems.length === 0) {
    const ms = [];
    for (const r of ff.rows) for (const m of ((r.fieldfeed || {}).meetings || [])) ms.push(Object.assign({ seed: r.seed }, m));
    const judged = ms.filter(m => m && m.wave === 4 && (m.caller === 'resolve' || m.caller === 'patrol')
      && m.channel === 'field' && !(m.leader && m.leader.isScholar));
    const b = buildChains(judged, isFormedFeed);
    for (const c of b.chains) {
      const mkeys = new Set(c.meetings.map(m => `${m.day}|${m.part}|${m.vid}`));
      const fl = [];
      for (const l of b.links) {
        const fk = `${l.from.day}|${l.from.part}|${l.from.vid}`;
        const tk = `${l.to.day}|${l.to.part}|${l.to.vid}`;
        if (mkeys.has(fk) && mkeys.has(tk) && l.flags.length) fl.push(...l.flags);
      }
      c.flags = fl; c.flagged = fl.length > 0;
    }
    const s = summarizeChains(b, 'fieldfeed-armed');
    s.meetings = judged.length;
    s.cleanKills = b.chains.filter(c => c.cls === 'KILL' && !c.flagged).length;
    s.flaggedKills = b.chains.filter(c => c.cls === 'KILL' && c.flagged).length;
    s.chainsDetail = b.chains;
    secondaries.push(s);
  } else secondaries.push({ label: 'fieldfeed-armed', error: ff.problems.join('; ') || `rows=${ff.rows.length}` });
  const sg = loadCorpus('perseed-shoutgate-a', 'armed', 'fieldparty', SEEDS8);
  if (sg.rows.length === 8 && sg.problems.length === 0) {
    const ms = [];
    for (const r of sg.rows) for (const m of ((r.fieldparty || {}).meetings || [])) ms.push(Object.assign({ seed: r.seed }, m));
    const judged = ms.filter(m => (m.wave | 0) === 4 && m.channel === 'field'
      && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar));
    const b = buildChains(judged, isFormedCrew);
    for (const c of b.chains) {
      const mkeys = new Set(c.meetings.map(m => `${m.day}|${m.part}|${m.vid}`));
      const fl = [];
      for (const l of b.links) {
        const fk = `${l.from.day}|${l.from.part}|${l.from.vid}`;
        const tk = `${l.to.day}|${l.to.part}|${l.to.vid}`;
        if (mkeys.has(fk) && mkeys.has(tk) && l.flags.length) fl.push(...l.flags);
      }
      c.flags = fl; c.flagged = fl.length > 0;
    }
    const s = summarizeChains(b, 'shoutgate-armed');
    s.meetings = judged.length;
    s.cleanKills = b.chains.filter(c => c.cls === 'KILL' && !c.flagged).length;
    s.flaggedKills = b.chains.filter(c => c.cls === 'KILL' && c.flagged).length;
    s.chainsDetail = b.chains;
    secondaries.push(s);
  } else secondaries.push({ label: 'shoutgate-armed', error: sg.problems.join('; ') || `rows=${sg.rows.length}` });

  console.log('=== sim-chainkill-a analyzer ===');
  console.log(`corpus: rows=${prim.rows.length}/16 ok=${corpusOk} ${problems.join('; ')}`);
  console.log(`CONTROL-SHAPE: judgedA=${judgedA.length} formedA=${formedA.length} killsA=${killsA.length} | judgedB=${judgedB.length} formedB=${formedB.length} killsB=${killsB.length} => ${controlPass ? 'PASS' : 'FAIL'}`);
  console.log(`FIRST-8 judgedA per-seed: ${JSON.stringify(first8A)} (retreatdiag fresh: 75106:15, 75108:9, others 0)`);
  console.log(`WALL: won=${wall.won} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} starv=${wall.starvationTotal} deaths=${wall.deathTotal}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(deathsByCause)}`);
  console.log(`CHAINS (primary): meetings=${judgedA.length} unchained=${built.singletons.length} chains=${built.chains.length} classes=${JSON.stringify(summ.classes)} OTHER=${summ.other} links=${built.links.length} flaggedLinks=${built.links.filter(l => l.flags.length).length} anomalies=${built.anomalies.length} excluded=${built.excluded.length}`);
  console.log(`  length dist=${JSON.stringify(summ.lenDist)} maxChainDamage=${summ.maxChainDamage} tileDistHist=${JSON.stringify(summ.tileDistHist)}`);
  console.log(`  CLEAN CHAIN KILLS=${cleanKills.length} FLAGGED CHAIN KILLS=${flaggedKills.length}`);
  console.log('PER-CHAIN (primary):');
  for (const c of built.chains) {
    const path = c.meetings.map(m => `d${m.day} ${m.vid} ${m.mHpStart}->${m.mHpLeft} ${m.outcome}`).join(' | ');
    console.log(`  [s${c.seed} ${c.mid}] len=${c.length} span=${c.spanDays}d sameDay=${c.sameDay} dmg=${c.totalDamage} chainDPR=${c.chainDPR} termHp=${c.terminalHp} killR@chainDPR=${c.roundsToKillAtChainDPR} @57=${c.roundsAt57} @80=${c.roundsAt80} fits57=${c.fitsCap57} fits80=${c.fitsCap80} cls=${c.cls} flagged=${c.flagged} flags=${JSON.stringify(c.flags)} :: ${path}`);
  }
  console.log('SECONDARY (never pooled):');
  for (const s of secondaries) {
    if (s.error) { console.log(`  ${s.label}: ERROR ${s.error}`); continue; }
    console.log(`  ${s.label}: meetings=${s.meetings} unchained=${s.singletons} chains=${s.chains} classes=${JSON.stringify(s.classes)} OTHER=${s.other} cleanKills=${s.cleanKills} flaggedKills=${s.flaggedKills} maxDmg=${s.maxChainDamage} lenDist=${JSON.stringify(s.lenDist)}`);
    for (const c of (s.chainsDetail || [])) {
      const path = c.meetings.map(m => `d${m.day} ${m.vid} ${m.mHpStart}->${m.mHpLeft} ${m.outcome}`).join(' | ');
      console.log(`    [s${c.seed} ${c.mid}] len=${c.length} dmg=${c.totalDamage} chainDPR=${c.chainDPR} termHp=${c.terminalHp} @57=${c.roundsAt57} @80=${c.roundsAt80} cls=${c.cls} flagged=${c.flagged} :: ${path}`);
    }
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify({ corpusOk, controlPass, judgedA: judgedA.length, formedA: formedA.length, killsA: killsA.length, judgedB: judgedB.length, formedB: formedB.length, killsB: killsB.length, first8A, wall, deathsByCause, primary: summ, primaryChains: built.chains, primaryLinks: built.links, primaryAnomalies: built.anomalies, singletons: built.singletons.map(m => ({ seed: m.seed, day: m.day, vid: m.vid, mid: m.mid, mHpStart: m.mHpStart, mHpLeft: m.mHpLeft, outcome: m.outcome })), secondaries }, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  if (!corpusOk) { console.log('CENSUS: FAIL (corpus invalid)'); process.exit(1); }
  if (!controlPass) { console.log('CONTROL-SHAPE: FAIL — do not judge chains'); process.exit(1); }
  if (summ.other > 0) { console.log('CLASSIFICATION: FAIL (OTHER chains)'); process.exit(1); }
  console.log('MACHINE LEGS: census PASS, control-shape PASS, classification PASS (sense + ranked next step live in evidence)');
}
main();
