#!/usr/bin/env node
// scripts/analyze-draftflag-a.js — sim-draftflag-a analyzer. PURE: reads
// corpus JSON under evidence/2026-10-30/perseed-draftflag-a/ (EVID
// override), never touches game state, never writes into the corpus
// (its JSON goes to evidence/2026-10-30/sim-draftflag-a-analysis.json).
// Usage: node scripts/analyze-draftflag-a.js [--dir <dir>]
// Judges the prereg: direct draft dating for both targets, the
// palisade/toll condition from recorded fields, band-wide lingering
// flips + toll-shaped drops with draft-event match rates, and the
// secondary tbEnd origin-tile verdict for fightSeq 23.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108,75109,75110,75111,75112,75113,75114,75115,75116')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const HAVEN = { tx: 4, ty: 4 }; // observed haven tile on this band (draft events carry their own haven tile; matches check it too)

function stripDraftflag(row) {
  const out = {};
  for (const k of Object.keys(row)) {
    if (k === 'draftflag' || k === 'scholarmelt' || k === 'removal') continue;
    out[k] = row[k];
  }
  return out;
}

function loadSeed(seed) {
  const row = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-fresh.json`), 'utf8'));
  const census = JSON.parse(fs.readFileSync(path.join(EVID, `census-s${seed}.json`), 'utf8'));
  return { row, census };
}

// Per-uid census trajectory: [{day, entry}] in snapshot order.
function trajectory(census, uid) {
  const out = [];
  for (const s of (census.snapshots || [])) {
    for (const m of (s.monsters || [])) if (m.uid === uid) out.push({ day: s.day, entry: m });
  }
  return out;
}

// Consecutive-snapshot transitions for one uid (snapshot-array order).
function uidTransitions(census, uid) {
  const traj = trajectory(census, uid);
  const out = [];
  for (let i = 1; i < traj.length; i++) out.push({ from: traj[i - 1], to: traj[i] });
  return out;
}

function tollExpected(maxHp) { return Math.round((maxHp || 0) * 0.25); }
function isTollDrop(from, to) {
  if (!from || !to) return false;
  const drop = (from.hp || 0) - (to.hp || 0);
  if (drop <= 0) return false;
  return drop === tollExpected(from.maxHp || from.hp) && to.tx === HAVEN.tx && to.ty === HAVEN.ty;
}

// Resolve a target instance inside THIS corpus: spawn event (id +
// spawn day + spawn hp) -> uid, confirmed by a removal event with
// the same uid (id + removal hp). Returns null when unresolvable.
function resolveTarget(seedData, spec) {
  const events = ((seedData.row.removal || {}).events || []);
  const spawns = events.filter(e => e.type === 'spawn' && e.monster && e.monster.id === spec.id
    && e.day === spec.spawnDay && e.monster.hp === spec.spawnHp && e.monster.maxHp === spec.spawnMaxHp);
  if (spawns.length !== 1) return { uid: null, why: `spawn match count ${spawns.length} (want 1)`, spawns: spawns.length };
  const uid = spawns[0].monster.uid;
  const removals = events.filter(e => e.type === 'removal' && e.monster && e.monster.uid === uid);
  return { uid, spawn: spawns[0], removals, why: null };
}

// Draft events (type raid, fired) carrying a draft row for uid.
function draftEventsFor(seedData, uid) {
  const events = ((seedData.row.draftflag || {}).events || []);
  const out = [];
  for (const e of events) {
    if (e.type !== 'raid' || !e.fired) continue;
    for (const d of (e.drafts || [])) if (d.uid === uid) out.push({ event: e, draft: d });
  }
  return out;
}

// Match a census toll-shaped drop to a draft event: same uid,
// afterHp == drop-to hp, afterTile == drop-to tile, event day in
// [fromDay, toDay] (inclusive: covers both census-phase conventions).
function matchDraftToDrop(seedData, uid, drop) {
  const cands = draftEventsFor(seedData, uid).filter(({ event, draft }) =>
    draft.hpAfter === drop.to.entry.hp && draft.txAfter === drop.to.entry.tx && draft.tyAfter === drop.to.entry.ty
    && event.day >= drop.from.day && event.day <= drop.to.day);
  return cands;
}

function targetVerdict(seedData, spec) {
  const res = resolveTarget(seedData, spec);
  if (res.uid == null) return { spec, resolved: res, verdict: 'UNMEASURED', reason: 'target instance unresolvable in this corpus: ' + res.why };
  const traj = trajectory(seedData.census, res.uid);
  const drafts = draftEventsFor(seedData, res.uid);
  // The judged draft: the one whose after-state matches the known
  // post-draft census state (hp + haven tile + lingering true).
  const judged = drafts.filter(({ draft }) => draft.hpAfter === spec.postHp
    && draft.txAfter === HAVEN.tx && draft.tyAfter === HAVEN.ty && draft.lingeringAfter === true);
  const preCensus = traj.filter(t => t.entry.hp === spec.preHp && t.entry.lingering === false).slice(-1)[0] || null;
  const postCensus = traj.filter(t => t.entry.hp === spec.postHp && t.entry.lingering === true)[0] || null;
  const palisadeOk = judged.length ? judged.every(({ event }) => event.beforeCtx && event.beforeCtx.palisade === true) : false;
  const tollOk = judged.length ? judged.every(({ draft }) => draft.tollExact === true
    && draft.toll === tollExpected(draft.maxHp) && draft.hpBefore === spec.preHp) : false;
  return {
    spec, resolvedUid: res.uid, removalCorpusUid: spec.removalUid,
    uidMatchesRemovalCorpus: res.uid === spec.removalUid,
    spawn: { seq: res.spawn.seq, day: res.spawn.day, hp: res.spawn.monster.hp, maxHp: res.spawn.monster.maxHp },
    removals: res.removals.map(r => ({ seq: r.seq, day: r.day, hp: r.monster.hp, tile: [r.monster.tx, r.monster.ty], lingering: r.monster.lingering })),
    trajectoryDays: traj.map(t => t.day),
    draftCandidates: drafts.map(({ event, draft }) => ({ seq: event.seq, day: event.day,
      palisade: event.beforeCtx ? event.beforeCtx.palisade : null,
      haven: event.beforeCtx ? event.beforeCtx.haven : null,
      hpBefore: draft.hpBefore, hpAfter: draft.hpAfter, toll: draft.toll, tollExpected: draft.tollExpected,
      tollExact: draft.tollExact, tileBefore: [draft.txBefore, draft.tyBefore], tileAfter: [draft.txAfter, draft.tyAfter],
      lingeringBefore: draft.lingeringBefore, lingeringAfter: draft.lingeringAfter,
      raidBornBefore: draft.raidBornBefore, raidBornAfter: draft.raidBornAfter })),
    judged: judged.map(({ event, draft }) => ({ seq: event.seq, day: event.day, palisade: event.beforeCtx ? event.beforeCtx.palisade : null,
      hpBefore: draft.hpBefore, hpAfter: draft.hpAfter, toll: draft.toll, tollExpected: draft.tollExpected, tollExact: draft.tollExact })),
    preCensus: preCensus ? { day: preCensus.day, hp: preCensus.entry.hp, tile: [preCensus.entry.tx, preCensus.entry.ty], lingering: preCensus.entry.lingering } : null,
    postCensus: postCensus ? { day: postCensus.day, hp: postCensus.entry.hp, tile: [postCensus.entry.tx, postCensus.entry.ty], lingering: postCensus.entry.lingering } : null,
    palisadeConfirmed: palisadeOk, tollConfirmed: tollOk,
    verdict: (judged.length === 1 && palisadeOk && tollOk) ? 'DATED'
      : (judged.length === 0 ? 'UNMEASURED' : 'AMBIGUOUS'),
    reason: judged.length === 1 ? (palisadeOk && tollOk ? null : 'judged draft found but palisade/toll fields do not confirm')
      : (judged.length === 0 ? 'no draft event matches the post-draft census state (named missing hook: none — havenRaidTick IS the hook; a miss means the draft fired outside it or not at all)' : `${judged.length} matching draft events`),
  };
}

function tbEndSecondary(seedData, spec) {
  const tbends = ((seedData.row.draftflag || {}).events || []).filter(e => e.type === 'tbend'
    && e.origin && e.origin.uid === spec.uid && e.day >= spec.dayLo && e.day <= spec.dayHi);
  const fights = ((seedData.row.scholarmelt || {}).meetings || []).filter(m =>
    m.lift && m.lift.id === spec.id && m.dayStart >= spec.dayLo && m.dayStart <= spec.dayHi
    && m.lift.hp === spec.liftHp);
  return {
    spec, tbends: tbends.map(e => ({ seq: e.seq, day: e.day, result: e.result,
      origin: { hp: e.origin.hp, tile: [e.origin.tx, e.origin.ty], lingering: e.origin.lingering },
      occupantBefore: e.occupantBefore ? { uid: e.occupantBefore.uid, id: e.occupantBefore.id, hp: e.occupantBefore.hp } : null,
      occupantAfter: e.occupantAfter ? { uid: e.occupantAfter.uid, id: e.occupantAfter.id, hp: e.occupantAfter.hp } : null,
      restored: e.restored })),
    fights: fights.map(m => ({ fightSeq: m.fightSeq, dayStart: m.dayStart, result: m.result,
      liftHp: m.lift.hp, lingering: m.lift.lingering, restoredIdentity: m.restoredIdentity, restoredHp: m.restoredHp })),
  };
}

function bandWide(all) {
  const wildUids = {}; // seed -> Set of wave-4 non-titan uids seen in census
  const lingeringFlipUids = {}; // seed -> Set of uids with false->true census transition
  const lingeringFlipTransitions = [];
  const tollDrops = []; // {seed, uid, id, fromDay, toDay, fromHp, toHp, maxHp, matched: [...]}
  const unexplained = [];
  for (const { seed, census, row } of all) {
    const perSeed = {};
    for (const s of (census.snapshots || [])) for (const m of (s.monsters || [])) {
      if (m.wave === 4 && !m.titan) {
        (wildUids[seed] = wildUids[seed] || new Set()).add(m.uid);
        perSeed[m.uid] = perSeed[m.uid] || { id: m.id, maxHp: m.maxHp };
      }
    }
    for (const uid of Object.keys(perSeed).map(Number)) {
      const trans = uidTransitions(census, uid);
      for (const t of trans) {
        if (t.from.entry.lingering === false && t.to.entry.lingering === true) {
          (lingeringFlipUids[seed] = lingeringFlipUids[seed] || new Set()).add(uid);
          lingeringFlipTransitions.push({ seed, uid, id: t.to.entry.id, fromDay: t.from.day, toDay: t.to.day });
        }
        if (isTollDrop(t.from.entry, t.to.entry)) {
          const drop = { seed, uid, id: t.to.entry.id, fromDay: t.from.day, toDay: t.to.day,
            fromHp: t.from.entry.hp, toHp: t.to.entry.hp, maxHp: t.from.entry.maxHp,
            fromTile: [t.from.entry.tx, t.from.entry.ty], toTile: [t.to.entry.tx, t.to.entry.ty] };
          const matched = matchDraftToDrop({ row, census }, uid, { from: t.from, to: t.to });
          drop.matchedDrafts = matched.map(({ event, draft }) => ({ seq: event.seq, day: event.day,
            palisade: event.beforeCtx ? event.beforeCtx.palisade : null, toll: draft.toll, tollExact: draft.tollExact }));
          drop.matched = drop.matchedDrafts.length > 0;
          if (!drop.matched) unexplained.push(drop);
          tollDrops.push(drop);
        }
      }
    }
  }
  const countSet = (m) => Object.values(m).reduce((t, s) => t + s.size, 0);
  return {
    wildWave4Instances: countSet(wildUids),
    lingeringFlipInstances: countSet(lingeringFlipUids),
    lingeringFlipTransitions: lingeringFlipTransitions.length,
    lingeringFlipTransitionList: lingeringFlipTransitions,
    tollDrops: tollDrops.length,
    tollDropUids: new Set(tollDrops.map(d => d.seed + '|' + d.uid)).size,
    tollDropsMatched: tollDrops.filter(d => d.matched).length,
    tollDropsUnmatched: tollDrops.filter(d => !d.matched).length,
    tollDropList: tollDrops,
    unexplainedTransitions: unexplained,
  };
}

function wallNumbers(rows) {
  const medianOf = (arr) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  return {
    wins: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: medianOf(rows.map(r => r.days)),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
}

function main() {
  const args = process.argv.slice(2);
  let dir = EVID;
  for (let i = 0; i < args.length; i++) if (args[i] === '--dir') dir = args[++i];
  const all = [];
  for (const seed of SEEDS) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
    const census = JSON.parse(fs.readFileSync(path.join(dir, `census-s${seed}.json`), 'utf8'));
    all.push({ seed, row, census });
  }
  const bySeed = {};
  for (const d of all) bySeed[d.seed] = d;
  const targets = [
    { seed: 75116, id: 'suburb', removalUid: 29, spawnDay: 140, spawnHp: 1300, spawnMaxHp: 1300, preHp: 1285, postHp: 960 },
    { seed: 75116, id: 'audit', removalUid: 28, spawnDay: 132, spawnHp: 1100, spawnMaxHp: 1100, preHp: 1100, postHp: 825 },
  ];
  const targetVerdicts = targets.map(spec => targetVerdict(bySeed[spec.seed], spec));
  const secondary = tbEndSecondary(bySeed[75116], { uid: targetVerdicts[0].resolvedUid, id: 'suburb', liftHp: 960, dayLo: 158, dayHi: 160 });
  // Band-wide draft-event census (all raid events, all seeds).
  let raidEvents = 0, raidDraftRows = 0, palisadeTrue = 0, palisadeFalse = 0;
  for (const d of all) {
    for (const e of ((d.row.draftflag || {}).events || [])) {
      if (e.type !== 'raid' || !e.fired) continue;
      raidEvents++;
      raidDraftRows += (e.drafts || []).length;
      if (e.beforeCtx && e.beforeCtx.palisade === true) palisadeTrue++;
      else if (e.beforeCtx && e.beforeCtx.palisade === false) palisadeFalse++;
    }
  }
  const bw = bandWide(all);
  const wall = wallNumbers(all.map(d => d.row));
  const analysis = {
    seeds: SEEDS, corpusDir: dir,
    targets: targetVerdicts,
    secondaryFightSeq23: secondary,
    band: { raidEvents, raidDraftRows, palisadeTrueRaids: palisadeTrue, palisadeFalseRaids: palisadeFalse,
      wildWave4Instances: bw.wildWave4Instances,
      lingeringFlipInstances: bw.lingeringFlipInstances,
      lingeringFlipTransitions: bw.lingeringFlipTransitions,
      tollDrops: bw.tollDrops, tollDropUids: bw.tollDropUids,
      tollDropsMatched: bw.tollDropsMatched, tollDropsUnmatched: bw.tollDropsUnmatched },
    lingeringFlipTransitionList: bw.lingeringFlipTransitionList,
    tollDropList: bw.tollDropList,
    unexplainedTransitions: bw.unexplainedTransitions,
    wall,
  };
  const outPath = path.join(REPO, 'evidence', '2026-10-30', 'sim-draftflag-a-analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(analysis, null, 1) + '\n');
  console.log('=== sim-draftflag-a analysis ===');
  for (const t of targetVerdicts) {
    console.log(`TARGET s${t.spec.seed} ${t.spec.id}: verdict=${t.verdict} resolvedUid=${t.resolvedUid} removalUid=${t.spec.removalUid} uidMatch=${t.uidMatchesRemovalCorpus}`);
    if (t.judged) for (const j of t.judged) console.log(`  DRAFT seq=${j.seq} day=${j.day} palisade=${j.palisade} hp ${j.hpBefore}->${j.hpAfter} toll=${j.toll} expected=${j.tollExpected} exact=${j.tollExact}`);
    if (t.preCensus) console.log(`  preCensus day=${t.preCensus.day} hp=${t.preCensus.hp} tile=${t.preCensus.tile} ling=${t.preCensus.lingering}`);
    if (t.postCensus) console.log(`  postCensus day=${t.postCensus.day} hp=${t.postCensus.hp} tile=${t.postCensus.tile} ling=${t.postCensus.lingering}`);
    if (t.reason) console.log(`  reason: ${t.reason}`);
  }
  console.log(`SECONDARY fightSeq23: tbends=${secondary.tbends.length} fights=${secondary.fights.length}`);
  for (const e of secondary.tbends) console.log(`  tbend seq=${e.seq} day=${e.day} result=${e.result} restored=${e.restored} occupantBefore=${e.occupantBefore ? e.occupantBefore.id + '#' + e.occupantBefore.uid + '@' + e.occupantBefore.hp : 'null'} occupantAfter=${e.occupantAfter ? e.occupantAfter.id + '#' + e.occupantAfter.uid + '@' + e.occupantAfter.hp : 'null'}`);
  for (const f of secondary.fights) console.log(`  fight seq=${f.fightSeq} day=${f.dayStart} result=${f.result} liftHp=${f.liftHp} restored=${f.restoredIdentity} restoredHp=${f.restoredHp}`);
  console.log(`BAND: raidEvents=${raidEvents} draftRows=${raidDraftRows} palisadeTrue=${palisadeTrue} palisadeFalse=${palisadeFalse} wildW4=${bw.wildWave4Instances} lingeringFlipInstances=${bw.lingeringFlipInstances} lingeringFlipTransitions=${bw.lingeringFlipTransitions} tollDrops=${bw.tollDrops} (uids ${bw.tollDropUids}) matched=${bw.tollDropsMatched} unmatched=${bw.tollDropsUnmatched}`);
  console.log(`WALL: won=${wall.wins} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} deaths=${wall.deathTotal}`);
  console.log(`ANALYSIS-WRITTEN ${outPath}`);
}
if (require.main === module) main();

module.exports = { stripDraftflag, trajectory, uidTransitions, tollExpected, isTollDrop,
  resolveTarget, draftEventsFor, matchDraftToDrop, targetVerdict, tbEndSecondary, bandWide, wallNumbers };
