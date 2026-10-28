#!/usr/bin/env node
// scripts/test-w4convert.js — sim-w4convert-a census analyzer / proof validator.
// Reads evidence/2026-10-28/perseed-w4convert-a/s*-armed.json (no
// re-simulation), builds the per-instance wave-4 census exactly per
// evidence/2026-10-28/sim-w4convert-a-prereg.md, checks parity vs
// evidence/2026-10-28/perseed-w4damage-a/, and prints the conversion
// table + per-seed census + verdict. Writes analysis.json into the
// corpus dir. Exit 0 only when corpusOk && parityPass && substrateOk
// && unclassified == 0; any leg failure exits 1 with the leg named.
// Pure reads: never touches game state, never draws RNG.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4convert-a');
const PRIOR = path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4damage-a');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];

function loadRow(dir, seed) {
  return JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8'));
}
function scholarOnDay(row, day) {
  const hist = Array.isArray(row.scholarHistory) ? row.scholarHistory : [];
  let cur = null;
  for (const h of hist) { if ((h.day | 0) <= (day | 0)) cur = h.scholarId; else break; }
  if (cur === null && row.killerStatus) cur = row.killerStatus.scholarId || null;
  return cur;
}
function classifyKiller(row, vid, day) {
  const sid = scholarOnDay(row, day);
  if (vid === null || vid === undefined) return 'unattributed';
  if (sid !== null && vid === sid) return 'scholar';
  return 'villager';
}

function censusSeed(row) {
  const seed = row.seed;
  const spawns = (row.spawnsrc && row.spawnsrc.spawns || []).filter(s => (s.wave | 0) === 4);
  const defRows = (row.defwound && row.defwound.resolveFights || []).filter(r => (r.wave | 0) === 4);
  const ffRows = (row.w4damage && row.w4damage.fieldFights || []).filter(r => (r.wave | 0) === 4);
  const raidChanges = [];
  for (const t of (row.w4damage && row.w4damage.raidTicks || []))
    for (const c of (t.changes || [])) if ((c.wave | 0) === 4) raidChanges.push({ day: t.day, change: c });
  const nwkStarts = (row.nonworldkill && row.nonworldkill.starts || []).filter(s => (s.wave | 0) === 4);
  const tbEndsById = {};
  for (const e of (row.tbdmg && row.tbdmg.tbEnds || [])) tbEndsById[e.fightId] = e;
  const oldTbEnds = (row.oldcore && row.oldcore.tbEnds || []).filter(e => (e.wave | 0) === 4);
  const removals = (row.oldcore && row.oldcore.removals || []).filter(r => (r.wave | 0) === 4);
  const finalPresent = new Set((row.oldcore && row.oldcore.finalPresent || []).filter(m => (m.wave | 0) === 4).map(m => m.seq));
  const deedFacedW4 = Object.keys((row.raftdraft && row.raftdraft.faced) || {}).filter(k => ((row.raftdraft.faced[k] | 0) === 4)).sort();

  const inst = new Map();
  for (const s of spawns) {
    if (!inst.has(s.seq)) inst.set(s.seq, {
      seq: s.seq, type: s.type, src: s.src, spawnDay: s.day,
      channels: new Set(), fieldRows: [], raidRows: [], raidDrafted: false,
      tbFights: [], faced: false, engaged: false, killed: false,
      killChannel: null, killer: null, killerClass: null, killDay: null,
      lastFieldOutcome: null, lastTbResult: null, endState: null,
    });
  }
  const unattributed = []; // faced records that cannot attach to a universe seq
  const touch = (seq, ch) => {
    const it = inst.get(seq);
    if (!it) { unattributed.push({ channel: ch, seq: seq }); return null; }
    it.channels.add(ch); it.faced = true; return it;
  };
  // Caller class lookup from w4damage fieldFight rows, keyed day|seq, in order.
  const ffByKey = new Map();
  for (const f of ffRows) {
    const k = f.day + '|' + f.seq;
    if (!ffByKey.has(k)) ffByKey.set(k, []);
    ffByKey.get(k).push(f);
  }
  const callerOf = (r) => {
    const arr = ffByKey.get(r.day + '|' + r.seq) || [];
    const m = arr.find(f => f.mHpStart === r.mHpStart) || arr[0];
    return m ? m.caller : null;
  };
  for (const r of defRows) {
    const ch = r.context === 'raid' ? 'raid' : 'field';
    const it = touch(r.seq, ch);
    if (!it) continue;
    const row2 = Object.assign({}, r, { caller: callerOf(r) });
    if (ch === 'raid') it.raidRows.push(row2); else it.fieldRows.push(row2);
    if ((r.rounds | 0) >= 1) it.engaged = true;
    it.lastFieldOutcome = r.outcome;
    if (r.outcome === 'vKill' && !it.killed) {
      it.killed = true; it.killChannel = ch; it.killer = r.vid;
      it.killerClass = classifyKiller(row, r.vid, r.day); it.killDay = r.day;
    }
  }
  // w4damage fieldFight rows with no defwound twin. Two kinds, kept
  // apart: (a) NON-WORLD expedition fights (worldMonster false, caller
  // 'other', expeditionMonster stack) — these are not world instances
  // and never enter the universe; they are counted separately as
  // nonWorldField, never folded into field/raid/TB and never counted
  // as unattributed; (b) any other orphan (worldMonster true, or an
  // unknown shape) — a genuine attribution gap, counted unattributed.
  const defKeys = new Set(defRows.map(r => r.day + '|' + r.seq + '|' + r.mHpStart));
  let ffOrphan = 0;
  const nonWorldField = [];
  for (const f of ffRows) {
    if (defKeys.has(f.day + '|' + f.seq + '|' + f.mHpStart)) continue;
    ffOrphan++;
    if (f.worldMonster === false) {
      nonWorldField.push({ day: f.day, vid: f.vid, mid: f.mid, caller: f.caller, outcome: f.outcome, rounds: f.rounds, mDealt: f.mDealt, stack: f.stack });
      continue;
    }
    const ch = 'field';
    const it = touch(f.seq, ch);
    if (!it) continue;
    if ((f.rounds | 0) >= 1) it.engaged = true;
    it.lastFieldOutcome = f.outcome;
    if (f.outcome === 'vKill' && !it.killed) {
      it.killed = true; it.killChannel = ch; it.killer = f.vid;
      it.killerClass = classifyKiller(row, f.vid, f.day); it.killDay = f.day;
    }
  }
  for (const rc of raidChanges) {
    const it = touch(rc.change.seq, 'raid');
    if (!it) continue;
    it.raidDrafted = true;
  }
  const nonWorldTb = [];
  for (const s of nwkStarts) {
    const tm = s.tileMonster || {};
    const isWorld = s.origin === 'world-origin' && tm.seq != null && tm.id === s.arg;
    if (!isWorld) {
      const e = tbEndsById[s.fightId] || null;
      nonWorldTb.push({ day: s.day, arg: s.arg, origin: s.origin, tileSeq: tm.seq ?? null, tileId: tm.id || null, tbResult: e ? e.result : null, fightId: s.fightId });
      continue;
    }
    const it = touch(tm.seq, 'TB');
    if (!it) continue;
    const e = tbEndsById[s.fightId] || null;
    let mon = null;
    if (e) mon = (e.fighters || []).find(f => f.kind === 'monster') || null;
    const tb = { day: s.day, fightId: s.fightId, result: e ? e.result : null, round: e ? e.round : null,
      monsterHp: mon ? mon.hp : null, monsterMaxHp: mon ? mon.maxHp : null,
      monsterAlive: mon ? mon.alive : null, monsterFled: mon ? mon.fled : null };
    it.tbFights.push(tb);
    if (e && (e.round | 0) >= 1) it.engaged = true;
    it.lastTbResult = tb.result;
    if (e && e.result === 'won' && mon && (mon.hp | 0) <= 0 && mon.alive === false && mon.fled === false && !it.killed) {
      it.killed = true; it.killChannel = 'TB'; it.killer = 'scholar-led TB party';
      it.killerClass = 'TB-party'; it.killDay = s.day;
    }
  }
  // Oldcore TB ends not already joined via NWK (defensive faced touch).
  const nwkSeqs = new Set();
  for (const s of nwkStarts) if (s.origin === 'world-origin' && (s.tileMonster || {}).seq != null) nwkSeqs.add((s.tileMonster || {}).seq);
  for (const e of oldTbEnds) {
    if (nwkSeqs.has(e.seq)) continue;
    const it = touch(e.seq, 'TB');
    if (it && !it.tbFights.length) it.tbFights.push({ day: e.day, fightId: null, result: e.result, round: null, monsterHp: null, monsterMaxHp: null, monsterAlive: null, monsterFled: null, viaOldcoreOnly: true });
  }
  // Removal-kind kills with no fight-row kill => killed, unattributed.
  for (const r of removals) {
    const it = inst.get(r.seq);
    if (!it) { unattributed.push({ channel: 'removal', seq: r.seq, kind: r.kind }); continue; }
    if (String(r.kind || '').indexOf('kill') >= 0 && !it.killed) {
      it.killed = true; it.killChannel = 'removal'; it.killer = null;
      it.killerClass = 'unattributed'; it.killDay = r.day;
    }
  }
  for (const it of inst.values()) {
    if (finalPresent.has(it.seq)) it.endState = 'still-present';
    else {
      const rems = removals.filter(r => r.seq === it.seq);
      it.endState = rems.length ? ('removed:' + rems[rems.length - 1].kind) : 'vanished';
    }
  }
  const instances = Array.from(inst.values()).sort((a, b) => (a.spawnDay - b.spawnDay) || (a.seq - b.seq));
  const faced = instances.filter(i => i.faced);
  const engaged = instances.filter(i => i.engaged);
  const killed = instances.filter(i => i.killed);
  const neverMet = instances.filter(i => !i.faced);
  const metNoKill = faced.filter(i => !i.killed);
  const channelTable = {};
  for (const ch of ['field', 'raid', 'TB']) {
    const f = instances.filter(i => i.channels.has(ch));
    channelTable[ch] = {
      faced: f.length,
      engaged: f.filter(i => {
        if (ch === 'TB') return i.tbFights.some(t => (t.round | 0) >= 1);
        return (ch === 'raid' ? i.raidRows : i.fieldRows).some(r => (r.rounds | 0) >= 1);
      }).length,
      killed: f.filter(i => i.killed && i.killChannel === ch).length,
      // Raid-drafted-only: touched by raid draft but no raid/field fight row.
      raidDraftedOnly: ch === 'raid' ? f.filter(i => i.raidDrafted && !i.raidRows.length && !i.fieldRows.length).length : 0,
    };
    const c = channelTable[ch];
    c.engagedPerFaced = c.faced ? +(c.engaged / c.faced).toFixed(3) : null;
    c.killedPerEngaged = c.engaged ? +(c.killed / c.engaged).toFixed(3) : null;
    c.killedPerFaced = c.faced ? +(c.killed / c.faced).toFixed(3) : null;
  }
  const multiTouch = faced.filter(i => i.channels.size > 1).length;
  const unattributedKills = killed.filter(i => i.killerClass === 'unattributed').length;
  const vanished = instances.filter(i => i.endState === 'vanished');
  const unclassified = unattributedKills + unattributed.length + faced.filter(i => i.channels.size === 0).length;
  const spawnSrcDist = {};
  for (const s of spawns) spawnSrcDist[s.src || 'unknown'] = (spawnSrcDist[s.src || 'unknown'] || 0) + 1;
  const spawnTypeDist = {};
  for (const s of spawns) spawnTypeDist[s.type || 'unknown'] = (spawnTypeDist[s.type || 'unknown'] || 0) + 1;
  const fieldOutcomes = {};
  for (const r of defRows) fieldOutcomes[(r.context === 'raid' ? 'raid:' : 'field:') + r.outcome] = (fieldOutcomes[(r.context === 'raid' ? 'raid:' : 'field:') + r.outcome] || 0) + 1;
  const tbResults = {};
  for (const i of instances) for (const t of i.tbFights) tbResults[t.result || 'none'] = (tbResults[t.result || 'none'] || 0) + 1;
  const facedDays = faced.flatMap(i => [...i.fieldRows, ...i.raidRows].map(r => r.day).concat(i.tbFights.map(t => t.day)));
  return {
    seed, days: row.days, gameDays: row.gameDays, won: row.won, waveReach: row.waveReach,
    nationalEver: row.nationalEver, nationalFinal: row.nationalFinal, table: row.table, entered: row.entered,
    deathTotal: row.deathTotal, courtshipCombined: row.courtship ? row.courtship.combined : null,
    universe: instances.length, facedN: faced.length, engagedN: engaged.length, killedN: killed.length,
    neverMetN: neverMet.length, metNoKillN: metNoKill.length, multiTouchN: multiTouch,
    channelTable, spawnSrcDist, spawnTypeDist, deedFacedW4: deedFacedW4,
    fieldOutcomes, tbResults, ffOrphan, nonWorldTbN: nonWorldTb.length, nonWorldTb,
    nonWorldFieldN: nonWorldField.length, nonWorldField,
    unattributedRecords: unattributed, unattributedKills, vanishedSeqs: vanished.map(i => i.seq),
    unclassified,
    firstFacedDay: facedDays.length ? Math.min(...facedDays) : null,
    lastFacedDay: facedDays.length ? Math.max(...facedDays) : null,
    instances: instances.map(i => ({
      seq: i.seq, type: i.type, src: i.src, spawnDay: i.spawnDay,
      channels: Array.from(i.channels).sort(), faced: i.faced, engaged: i.engaged, killed: i.killed,
      killChannel: i.killChannel, killer: i.killer, killerClass: i.killerClass, killDay: i.killDay,
      raidDrafted: i.raidDrafted, fieldFights: i.fieldRows.length, raidFights: i.raidRows.length,
      tbFights: i.tbFights.length, lastFieldOutcome: i.lastFieldOutcome, lastTbResult: i.lastTbResult,
      endState: i.endState,
    })),
    kills: killed.map(i => ({ seq: i.seq, type: i.type, channel: i.killChannel, day: i.killDay, killer: i.killer, killerClass: i.killerClass })),
  };
}

function recorderClean(row) {
  const stores = [row.spawnsrc, row.raftdraft, row.oldcore, row.w5births, row.defwound, row.nonworldkill, row.tbdmg, row.w4damage];
  for (const st of stores) {
    if (!st || !st.diag) return false;
    if ((st.diag.errs | 0) !== 0) return false;
    if (st.diag.overflow && Object.values(st.diag.overflow).some(v => (v | 0) !== 0)) return false;
  }
  return true;
}

function main() {
  const perSeed = [];
  for (const seed of SEEDS) perSeed.push(censusSeed(loadRow(CORPUS, seed)));
  // Parity vs w4damage corpus.
  const parity = [];
  for (const seed of SEEDS) {
    const cur = loadRow(CORPUS, seed);
    const pri = loadRow(PRIOR, seed);
    const curDef = {}; for (const r of (cur.defwound.resolveFights || []).filter(r => (r.wave | 0) === 4)) curDef[r.context] = (curDef[r.context] || 0) + 1;
    const priDef = {}; for (const r of (pri.defwound.resolveFights || []).filter(r => (r.wave | 0) === 4)) priDef[r.context] = (priDef[r.context] || 0) + 1;
    const curSp = (cur.spawnsrc.spawns || []).filter(s => (s.wave | 0) === 4).map(s => s.seq).sort((a, b) => a - b);
    const priSp = (pri.spawnsrc.spawns || []).filter(s => (s.wave | 0) === 4).map(s => s.seq).sort((a, b) => a - b);
    const checks = {
      days: cur.days === pri.days, gameDays: cur.gameDays === pri.gameDays, won: cur.won === pri.won,
      waveReach: cur.waveReach === pri.waveReach, nationalEver: cur.nationalEver === pri.nationalEver,
      nationalFinal: cur.nationalFinal === pri.nationalFinal, table: cur.table === pri.table,
      entered: cur.entered === pri.entered, deathTotal: cur.deathTotal === pri.deathTotal,
      courtship: (cur.courtship.combined | 0) === (pri.courtship.combined | 0),
      defW4ByContext: JSON.stringify(curDef) === JSON.stringify(priDef),
      nwkW4Starts: (cur.nonworldkill.starts || []).filter(s => (s.wave | 0) === 4).length === (pri.nonworldkill.starts || []).filter(s => (s.wave | 0) === 4).length,
      spawnSeqSet: JSON.stringify(curSp) === JSON.stringify(priSp),
    };
    parity.push({ seed, pass: Object.values(checks).every(Boolean), checks,
      cur: { days: cur.days, defW4: curDef, nwkW4: (cur.nonworldkill.starts || []).filter(s => (s.wave | 0) === 4).length, spawnSeqs: curSp },
      pri: { days: pri.days, defW4: priDef, nwkW4: (pri.nonworldkill.starts || []).filter(s => (s.wave | 0) === 4).length, spawnSeqs: priSp } });
  }
  const corpusOk = perSeed.length === 8 && perSeed.every((p, i) => {
    const row = loadRow(CORPUS, SEEDS[i]);
    return row.days > 0 && recorderClean(row);
  });
  const parityPass = parity.every(p => p.pass);
  const courtTotals = perSeed.reduce((t, p) => t + (p.courtshipCombined | 0), 0);
  const courtSeedsActive = perSeed.filter(p => (p.courtshipCombined | 0) > 0).length;
  const substrateOk = courtTotals > 0 && courtSeedsActive >= 6;
  const band = {
    universe: perSeed.reduce((t, p) => t + p.universe, 0),
    faced: perSeed.reduce((t, p) => t + p.facedN, 0),
    engaged: perSeed.reduce((t, p) => t + p.engagedN, 0),
    killed: perSeed.reduce((t, p) => t + p.killedN, 0),
    neverMet: perSeed.reduce((t, p) => t + p.neverMetN, 0),
    metNoKill: perSeed.reduce((t, p) => t + p.metNoKillN, 0),
    multiTouch: perSeed.reduce((t, p) => t + p.multiTouchN, 0),
    nonWorldTb: perSeed.reduce((t, p) => t + p.nonWorldTbN, 0),
    nonWorldField: perSeed.reduce((t, p) => t + p.nonWorldFieldN, 0),
    unclassified: perSeed.reduce((t, p) => t + p.unclassified, 0),
    vanished: perSeed.reduce((t, p) => t + p.vanishedSeqs.length, 0),
  };
  const bandChannels = {};
  for (const ch of ['field', 'raid', 'TB']) {
    const f = perSeed.reduce((t, p) => t + p.channelTable[ch].faced, 0);
    const e = perSeed.reduce((t, p) => t + p.channelTable[ch].engaged, 0);
    const k = perSeed.reduce((t, p) => t + p.channelTable[ch].killed, 0);
    bandChannels[ch] = { faced: f, engaged: e, killed: k,
      engagedPerFaced: f ? +(e / f).toFixed(3) : null, killedPerEngaged: e ? +(k / e).toFixed(3) : null, killedPerFaced: f ? +(k / f).toFixed(3) : null,
      raidDraftedOnly: ch === 'raid' ? perSeed.reduce((t, p) => t + p.channelTable[ch].raidDraftedOnly, 0) : undefined };
  }
  let senseSeed = null;
  for (const p of perSeed) if (!senseSeed || p.facedN > senseSeed.facedN) senseSeed = p;
  const analysis = { label: 'sim-w4convert-a census', seeds: SEEDS, band, bandChannels,
    perSeed, parity, corpusOk, parityPass, substrateOk,
    courtship: { combined: courtTotals, seedsActive: courtSeedsActive },
    senseSeed: senseSeed ? { seed: senseSeed.seed, facedN: senseSeed.facedN, firstFacedDay: senseSeed.firstFacedDay, lastFacedDay: senseSeed.lastFacedDay } : null,
    generated: new Date().toISOString() };
  fs.writeFileSync(path.join(CORPUS, 'analysis.json'), JSON.stringify(analysis, null, 1) + '\n');
  console.log('=== sim-w4convert-a census ===');
  console.log(`band: universe=${band.universe} faced=${band.faced} engaged=${band.engaged} killed=${band.killed} neverMet=${band.neverMet} metNoKill=${band.metNoKill} multiTouch=${band.multiTouch} nonWorldTb=${band.nonWorldTb} nonWorldField=${band.nonWorldField} unclassified=${band.unclassified} vanished=${band.vanished}`);
  for (const ch of ['field', 'raid', 'TB']) {
    const c = bandChannels[ch];
    console.log(`  channel ${ch}: faced=${c.faced} engaged=${c.engaged} killed=${c.killed} eng/faced=${c.engagedPerFaced} kill/eng=${c.killedPerEngaged} kill/faced=${c.killedPerFaced}${c.raidDraftedOnly !== undefined ? ' raidDraftedOnly=' + c.raidDraftedOnly : ''}`);
  }
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: days=${p.days} universe=${p.universe} faced=${p.facedN} engaged=${p.engagedN} killed=${p.killedN} neverMet=${p.neverMetN} metNoKill=${p.metNoKillN} deedW4types=[${p.deedFacedW4.join(',')}] spawnSrc=${JSON.stringify(p.spawnSrcDist)} fieldOut=${JSON.stringify(p.fieldOutcomes)} tbRes=${JSON.stringify(p.tbResults)} nonWorldTb=${p.nonWorldTbN} nonWorldField=${p.nonWorldFieldN} unclass=${p.unclassified} vanished=[${p.vanishedSeqs.join(',')}]`);
  }
  for (const p of parity) console.log(`  parity seed ${p.seed}: ${p.pass ? 'PASS' : 'FAIL'} ${JSON.stringify(p.checks)}`);
  console.log(`  corpusOk=${corpusOk} parityPass=${parityPass} substrateOk=${substrateOk} (court combined=${courtTotals} seedsActive=${courtSeedsActive}) senseSeed=${senseSeed ? senseSeed.seed + ' faced=' + senseSeed.facedN + ' window d' + senseSeed.firstFacedDay + '-d' + senseSeed.lastFacedDay : 'none'}`);
  const kills = perSeed.flatMap(p => p.kills.map(k => Object.assign({ seed: p.seed }, k)));
  console.log(`  kills (${kills.length}): ${JSON.stringify(kills)}`);
  const ok = corpusOk && parityPass && substrateOk && band.unclassified === 0;
  console.log(`  VERDICT-MECHANICAL: ${ok ? 'PASS' : 'FAIL'} (corpusOk=${corpusOk} parityPass=${parityPass} substrateOk=${substrateOk} unclassified=${band.unclassified})`);
  if (!ok) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}
main();
