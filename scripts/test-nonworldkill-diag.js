#!/usr/bin/env node
// scripts/test-nonworldkill-diag.js — analyzer for the sim-nonworldkill-a
// corpus (evidence/2026-10-25/perseed-sim-nonworldkill-a/). Pure reads
// over the per-seed rows: no game load, no RNG. Prints the initiation
// census (by door, by door x wave, by origin), the wave-4 TB kills by
// door, the 73678 day-115 strike fight in full, the unclassified and
// direct-build residuals, and the cross-check of every wave-4 log
// entry against the TB log deltas (field/contest kills never pass
// through tbEnd, so they appear in NO end row — that is expected,
// and the analyzer separates them instead of hiding them). Writes
// analysis.json into the corpus dir. Exit 1 only when the corpus is
// unreadable; the verdict lives in the evidence file, not here.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyStart, analyzeNonworldkill } = require('./policies/nonworldkill-diag');

const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-nonworldkill-a');
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(EVID, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { console.error(`MISSING ROW ${p}`); process.exit(1); }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  let summary = null;
  const sp = path.join(EVID, 'summary.json');
  if (fs.existsSync(sp)) summary = JSON.parse(fs.readFileSync(sp, 'utf8'));

  const perSeed = [];
  const band = { starts: 0, ends: 0, initiations: 0, byDoor: {}, byDoorWave: {}, byOrigin: {}, killsByDoor: {}, wave4Kills: [], otherRows: [], directBuildEnds: [], directBuildKills: [], adoptedStarts: [] };
  const addMap = (m, k, n) => { m[k] = (m[k] || 0) + n; };
  for (const r of rows) {
    const an = analyzeNonworldkill(r.nonworldkill);
    const excluded = an.excluded.byDoor || {};
    perSeed.push({ seed: r.seed, days: r.days, endReason: r.endReason, won: r.won,
      starts: an.starts, ends: an.ends, initiations: an.initiations, excluded: excluded,
      byDoor: an.byDoor, byOrigin: an.byOrigin, killsByDoor: an.killsByDoor,
      wave4Kills: an.wave4Kills, otherRows: an.otherRows.length, directBuildEnds: an.directBuildEnds,
      nwkErrs: r.nonworldkill.diag.errs });
    band.starts += an.starts; band.ends += an.ends; band.initiations += an.initiations;
    for (const k of Object.keys(an.byDoor)) addMap(band.byDoor, k, an.byDoor[k]);
    for (const d of Object.keys(an.byDoorWave)) { band.byDoorWave[d] = band.byDoorWave[d] || {}; for (const w of Object.keys(an.byDoorWave[d])) addMap(band.byDoorWave[d], w, an.byDoorWave[d][w]); }
    for (const k of Object.keys(an.byOrigin)) addMap(band.byOrigin, k, an.byOrigin[k]);
    for (const k of Object.keys(an.killsByDoor)) addMap(band.killsByDoor, k, an.killsByDoor[k]);
    for (const k of an.wave4Kills) band.wave4Kills.push(Object.assign({ seed: r.seed }, k));
    for (const o of an.otherRows) band.otherRows.push(Object.assign({ seed: r.seed }, o));
    for (const j of an.directBuildEndRows) band.directBuildEnds.push(Object.assign({ seed: r.seed }, j));
    for (const k of an.directBuildKills) band.directBuildKills.push(Object.assign({ seed: r.seed }, k));
    for (const s of (r.nonworldkill.starts || [])) {
      if (s.fightIdSource === 'end-row') band.adoptedStarts.push({ seed: r.seed, day: s.day, arg: s.arg, fightId: s.fightId, door: classifyStart(s).door, tileMonster: s.tileMonster, arenaContest: s.arenaContest });
    }
  }

  // Cross-check: every wave-4 entry in the raftdraft waveKillLog
  // snapshot, classified TB (appears in some end row's newLog) vs
  // non-TB (field/contest/etc. — never through tbEnd).
  const tbKeys = new Set();
  for (const r of rows) {
    for (const e of (r.nonworldkill.ends || [])) for (const k of (e.newLog || [])) tbKeys.add(JSON.stringify(k));
  }
  const logW4 = [];
  for (const r of rows) {
    for (const e of ((r.raftdraft || {}).logEntries || [])) {
      if ((e.w | 0) !== 4) continue;
      const key = JSON.stringify({ d: e.d | 0, mid: e.mid || null, w: e.w | 0, by: e.by !== undefined ? e.by : null, via: e.via || 'unknown', trick: e.trick !== undefined ? e.trick : null });
      logW4.push({ seed: r.seed, entry: e, tb: tbKeys.has(key) });
    }
  }

  // The 73678 day-115 strike fight, in full.
  const r78 = rows.find(r => r.seed === 73678);
  let strikeStart = null, strikeEnd = null, strikeDetail = null;
  if (r78) {
    const an78 = analyzeNonworldkill(r78.nonworldkill);
    const hit = an78.wave4Kills.find(k => k.kill.mid === 'strike' && k.day === 115);
    if (hit) {
      strikeStart = (r78.nonworldkill.starts || []).find(s => s.fightId === hit.fightId) || null;
      strikeEnd = (r78.nonworldkill.ends || []).find(e => e.fightId === hit.fightId) || null;
      strikeDetail = { kill: hit, start: strikeStart, end: strikeEnd,
        cls: strikeStart ? classifyStart(strikeStart) : null,
        dayStarts: (r78.nonworldkill.starts || []).filter(s => s.day === 115).map(s => ({ arg: s.arg, mid: s.mid, wave: s.wave, fightId: s.fightId, origin: s.origin, cls: classifyStart(s) })),
        dayEnds: (r78.nonworldkill.ends || []).filter(e => e.day === 115),
        oldcoreTbEnds115: ((r78.oldcore || {}).tbEnds || []).filter(t => t.day === 115),
        spawns115: ((r78.spawnsrc || {}).spawns || []).filter(s => s.day === 115),
        wavesFacedStrikeWave: (((r78.raftdraft || {}).faced || {}).strike | 0) || 0,
        strikeStarts78: (r78.nonworldkill.starts || []).filter(s => s.mid === 'strike').map(s => ({ day: s.day, arg: s.arg, fightId: s.fightId, origin: s.origin, cls: classifyStart(s) })),
      };
    }
  }

  const out = { label: 'sim-nonworldkill-a analysis', seeds: SEEDS, perSeed, band,
    logW4: logW4, strikeDetail: strikeDetail,
    control: summary ? summary.control : null,
    neutrality: summary ? summary.neutrality : null,
    corpusOk: summary ? summary.corpusOk : null,
    generated: new Date().toISOString() };
  const ap = path.join(EVID, 'analysis.json');
  fs.writeFileSync(ap, JSON.stringify(out, null, 1) + '\n');

  console.log('=== sim-nonworldkill-a analysis ===');
  if (summary) {
    const b = summary.band;
    console.log(`CONTROL: won=${b.won} medD=${b.medianDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} deaths=${b.deathTotal} | NEUTRALITY ${summary.neutrality && summary.neutrality.exact ? 'EXACT' : 'DEVIATED'} | CORPUS ${summary.corpusOk ? 'PASS' : 'FAIL'}`);
  }
  for (const ps of perSeed) {
    console.log(`seed ${ps.seed}: days=${ps.days} end=${ps.endReason} won=${ps.won} starts=${ps.starts} ends=${ps.ends} init=${ps.initiations} excluded=${JSON.stringify(ps.excluded)} byDoor=${JSON.stringify(ps.byDoor)} w4kills=${ps.wave4Kills.length} other=${ps.otherRows} directBuildEnds=${ps.directBuildEnds} nwkErrs=${ps.nwkErrs}`);
  }
  console.log(`BAND: starts=${band.starts} ends=${band.ends} initiations=${band.initiations}`);
  console.log(`BAND byDoor: ${JSON.stringify(band.byDoor)}`);
  console.log(`BAND byDoorWave: ${JSON.stringify(band.byDoorWave)}`);
  console.log(`BAND byOrigin: ${JSON.stringify(band.byOrigin)}`);
  console.log(`BAND killsByDoor (TB log deltas): ${JSON.stringify(band.killsByDoor)}`);
  console.log(`BAND wave-4 TB kills: ${band.wave4Kills.length}`);
  for (const k of band.wave4Kills) console.log(`  w4kill s${k.seed} d${k.day} ${k.kill.mid} by=${k.kill.by} via=${k.kill.via} result=${k.result} door=${k.door} sub=${k.sub} origin=${k.origin} startDay=${k.startDay} arg=${k.startArg}`);
  console.log(`BAND wave-4 log entries (all channels): ${logW4.length} (TB=${logW4.filter(x => x.tb).length}, non-TB=${logW4.filter(x => !x.tb).length})`);
  for (const x of logW4) console.log(`  logW4 s${x.seed} d${x.entry.d} ${x.entry.mid} by=${x.entry.by} via=${x.entry.via} tb=${x.tb}`);
  console.log(`BAND other (unclassified initiations): ${band.otherRows.length}`);
  for (const o of band.otherRows) console.log(`  other s${o.seed} d${o.day} arg=${o.arg} mid=${o.mid} wave=${o.wave} origin=${o.origin} stack=${o.stack}`);
  console.log(`BAND adopted starts (same-call start-and-route, fightId from end row): ${band.adoptedStarts.length}`);
  for (const a of band.adoptedStarts) console.log(`  adopted s${a.seed} d${a.day} ${a.arg} door=${a.door} arena=${a.arenaContest ? a.arenaContest.contestId + ':' + a.arenaContest.waveIdx : null} tileMonster=${a.tileMonster ? a.tileMonster.id : null}`);
  console.log(`BAND direct-build ends: ${band.directBuildEnds.length}, direct-build kills: ${band.directBuildKills.length}`);
  for (const j of band.directBuildEnds) console.log(`  directBuild s${j.seed} d${j.day} fight=${j.fightId} result=${j.result} newLog=${JSON.stringify(j.newLog)}`);
  if (strikeDetail) {
    console.log('--- 73678 day-115 strike fight ---');
    console.log(`  door=${strikeDetail.cls.door} sub=${strikeDetail.cls.sub} initiator=${strikeDetail.cls.initiator} origin=${strikeDetail.start.origin} arg=${strikeDetail.start.arg} mid=${strikeDetail.start.mid} wave=${strikeDetail.start.wave}`);
    console.log(`  start: day=${strikeDetail.start.day} fightId=${strikeDetail.start.fightId} tileMonster=${JSON.stringify(strikeDetail.start.tileMonster)} feastDraw=${JSON.stringify(strikeDetail.start.feastDraw)} pendingEncounter=${strikeDetail.start.pendingEncounter} pendingMonsterId=${strikeDetail.start.pendingMonsterId} pendingInTent=${strikeDetail.start.pendingInTent} tentBreach=${strikeDetail.start.tentBreach} arenaContest=${JSON.stringify(strikeDetail.start.arenaContest)} doorFled=${JSON.stringify(strikeDetail.start.doorFled)}`);
    console.log(`  stack: ${strikeDetail.start.stack}`);
    console.log(`  stackLines: ${JSON.stringify(strikeDetail.start.stackLines)}`);
    console.log(`  fighters: ${JSON.stringify(strikeDetail.start.fighters)}`);
    console.log(`  end: result=${strikeDetail.end.result} newLog=${JSON.stringify(strikeDetail.end.newLog)}`);
    console.log(`  day-115 starts: ${JSON.stringify(strikeDetail.dayStarts)}`);
    console.log(`  oldcore tbEnds d115: ${JSON.stringify(strikeDetail.oldcoreTbEnds115)}`);
    console.log(`  spawns d115: ${JSON.stringify(strikeDetail.spawns115)}`);
    console.log(`  wavesFaced[strike] = wave ${strikeDetail.wavesFacedStrikeWave} (deed map is id->wave, NOT a count — it does not mean 4 strike fights); strike TB starts on 73678: ${JSON.stringify(strikeDetail.strikeStarts78)}`);
  } else {
    console.log('--- 73678 day-115 strike fight: NOT FOUND in TB kills ---');
  }
  console.log(`analysis -> ${ap}`);
}
main();
