#!/usr/bin/env node
// scripts/test-fighterconstruct.js — sim-fighterconstruct-a audit
// analyzer / proof validator (DIAG ONLY, zero src/js changes).
//
// Reads evidence/2026-10-28/perseed-fighterconstruct-a/s*-armed.json
// (no re-simulation), builds the wave-4 TB monster start-HP census
// exactly per evidence/2026-10-28/sim-fighterconstruct-a-prereg.md,
// joins each start to its fighterconstruct construction snapshot
// (first tbAdvance entry inside that startCombat call) and its
// opening tbDamage events, and classifies every below-max monster
// start by the prereg's rule:
//   TRACED-C8 iff construction HP == maxHp AND opening damage sum
//     == start deficit AND >= 1 contributing event from a villager
//     or ally fighter;
//   TRACED-CONSTRUCTION iff the construction snapshot itself is
//     below max AND a named construction input accounts for it
//     (the code read names none that can do this — see evidence;
//     such a row would be printed with its input, never guessed);
//   UNEXPLAINED iff neither holds (construction below max with no
//     named input, or construction full but opening sum != deficit),
//     counted and cited;
//   UNCLASSIFIED iff the construction snapshot is missing or the
//     start fighters are incomplete.
// Exit 0 only when corpusOk && parityPass && substrateOk &&
// unclassified == 0 && postJoinMismatches == 0 && orphanMonster
// events == 0. Unexplained starts that are counted and cited do
// NOT fail the mechanical gate (the prereg's GO rule counts them
// as classified); the evidence judges them. The analyzer never
// re-scores a verdict: it prints the tables; the evidence judges
// them against the prereg.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-fighterconstruct-a');
const PRIOR = process.env.W4D || path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4damage-a');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const { classifyStart } = require('./policies/nonworldkill-diag');

function loadRow(dir, seed) { return JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8')); }
function loadDefs() {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(raw) ? raw : (raw.monsters || []);
  const m = {};
  for (const d of list) if (d && d.id) m[d.id] = d;
  return m;
}
function tbChannel(start, cls) {
  const door = cls ? cls.door : 'other';
  const origin = start.origin || 'unknown';
  if (door === 'glasswing-trap') return 'trap';
  if (origin === 'world-origin') return 'player-tb-world';
  if (origin === 'null-origin') return 'non-world-TB';
  if (door === 'contest-arena') return 'contest';
  return 'other';
}
function unitChecks() {
  const fails = [];
  // deficit/sum logic on synthetic rows
  const D = (max, hp) => max - hp;
  if (D(1211, 1140) !== 71) fails.push('deficit 71');
  if (D(1298, 1268) !== 30) fails.push('deficit 30');
  const evs = [{ preHp: 1211, postHp: 1180 }, { preHp: 1180, postHp: 1140 }];
  const S = evs.reduce((t, e) => t + ((e.preHp | 0) - (e.postHp | 0)), 0);
  if (S !== 71) fails.push('opening sum 71');
  if (tbChannel({ origin: 'world-origin' }, { door: 'world-bump' }) !== 'player-tb-world') fails.push('channel world');
  if (tbChannel({ origin: 'null-origin' }, { door: 'feast-draw' }) !== 'non-world-TB') fails.push('channel null');
  return fails;
}
function recorderClean(row) {
  const stores = [row.spawnsrc, row.raftdraft, row.oldcore, row.w5births, row.defwound, row.nonworldkill, row.tbdmg, row.w4damage, row.fighterconstruct];
  for (const st of stores) {
    if (!st || !st.diag) return false;
    if ((st.diag.errs | 0) !== 0) return false;
    if (st.diag.overflow && Object.values(st.diag.overflow).some(v => (v | 0) !== 0)) return false;
  }
  return true;
}

function auditSeed(row, defs) {
  const seed = row.seed;
  const fc = row.fighterconstruct || {};
  const constructions = new Map();
  for (const c of (fc.constructions || [])) if (c.fightId && !constructions.has(c.fightId)) constructions.set(c.fightId, c);
  const postById = new Map();
  for (const p of (fc.postStarts || [])) if (p.fightId && !postById.has(p.fightId)) postById.set(p.fightId, p);
  const dmgByFight = new Map();
  for (const e of (fc.openingDamage || [])) {
    if (!e.fightId) continue;
    if (!dmgByFight.has(e.fightId)) dmgByFight.set(e.fightId, []);
    dmgByFight.get(e.fightId).push(e);
  }
  const orphanMonsterEvents = (fc.openingDamage || []).filter(e => !e.fightId && e.targetKind === 'monster');
  const starts = [];
  let excluded = 0, refused = 0, incomplete = 0, postJoinMismatches = 0;
  const nwk = row.nonworldkill || {};
  for (const st of (nwk.starts || []).filter(s => (s.wave | 0) === 4)) {
    const cls = classifyStart(st);
    if (cls.excluded) { excluded++; continue; }
    if (st.refused) { refused++; continue; }
    const fighters = (st.fighters || []).filter(x => x && x.kind === 'monster');
    if (!fighters.length) { incomplete++; starts.push({ seed, day: st.day, incomplete: true, fightId: st.fightId || null, fightIdSource: st.fightIdSource || null, door: cls.door, origin: st.origin, channel: tbChannel(st, cls) }); continue; }
    // Post-join check: fc postStarts for this fightId must match the nwk snapshot.
    if (st.fightId) {
      const post = postById.get(st.fightId);
      if (post) {
        for (const mf of fighters) {
          const pf = (post.fighters || []).find(x => x && x.key === mf.key);
          if (!pf || pf.hp !== mf.hp || pf.maxHp !== mf.maxHp) postJoinMismatches++;
        }
      }
    }
    const constr = st.fightId ? constructions.get(st.fightId) : undefined;
    for (const mf of fighters) {
      const tile = st.tileMonster || null;
      const def = defs[mf.monsterId] || null;
      const defRange = def && Array.isArray(def.hp) ? [def.hp[0], def.hp[1]] : null;
      const cf = constr ? (constr.fighters || []).find(x => x && x.key === mf.key) : undefined;
      const events = st.fightId ? (dmgByFight.get(st.fightId) || []).filter(e => e.targetKey === mf.key && e.preHp != null && e.postHp != null) : [];
      const S = events.reduce((t, e) => t + ((e.preHp | 0) - (e.postHp | 0)), 0);
      const D = (mf.maxHp | 0) - (mf.hp | 0);
      const Cd = cf ? ((cf.maxHp | 0) - (cf.hp | 0)) : null;
      const contribKinds = {};
      for (const e of events) {
        if (((e.preHp | 0) - (e.postHp | 0)) === 0) continue;
        const src = constr ? (constr.fighters || []).find(x => x && x.key === e.sourceKey) : undefined;
        const k = src ? (src.kind || 'unknown') : ('key:' + (e.sourceKey || 'null'));
        contribKinds[k] = (contribKinds[k] | 0) + 1;
      }
      const hasVillagerContrib = Object.keys(contribKinds).some(k => k === 'villager' || k === 'ally');
      let classification = null, tracedInput = null;
      // ANALYZER FIX (disclosed in evidence, corpus untouched):
      // m_crew_* fighters are injected by the network-campaign
      // startCombat wrapper AFTER orig startCombat returns, so
      // they postdate the first-tbAdvance construction snapshot
      // by construction — and injectMonster builds them with
      // hp == maxHp. A full crew fighter is therefore accounted
      // for (full-reinforcement), not unclassified; a below-max
      // crew fighter, or a non-crew fighter missing from the
      // construction snapshot, stays UNCLASSIFIED and fails the
      // gate. See finale-campaign.js injectMonster (hp, maxHp: hp).
      if (!cf && mf.key && mf.key.indexOf('m_crew_') === 0 && D === 0) { classification = 'full-reinforcement'; tracedInput = 'post-startCombat-injection-hp-eq-maxHp'; }
      else if (!cf) classification = 'UNCLASSIFIED';
      else if (D === 0) classification = 'full';
      else if (Cd === 0 && S === D && hasVillagerContrib) { classification = 'TRACED'; tracedInput = 'C8-opening-turns'; }
      else if (Cd === 0 && S === D && !hasVillagerContrib) { classification = 'UNEXPLAINED'; tracedInput = 'opening-sum-matches-but-no-villager-contributor'; }
      else if (Cd > 0) { classification = 'UNEXPLAINED'; tracedInput = 'construction-below-max-no-named-input'; }
      else { classification = 'UNEXPLAINED'; tracedInput = 'opening-sum-mismatch'; }
      const order = constr ? (constr.order || []) : null;
      const pIdx = order ? order.indexOf('p') : -1;
      const mIdx = order ? order.indexOf(mf.key) : -1;
      const beforePlayer = (order && pIdx >= 0) ? order.slice(0, pIdx).map(k => {
        const f = (constr.fighters || []).find(x => x && x.key === k);
        return f ? { key: k, kind: f.kind, speed: f.speed, hp: f.hp, maxHp: f.maxHp } : { key: k };
      }) : null;
      starts.push({
        seed, day: st.day, fightId: st.fightId || null, fightIdSource: st.fightIdSource || null,
        door: cls.door, origin: st.origin, channel: tbChannel(st, cls),
        monster: mf.monsterId, fighterKey: mf.key,
        hp: mf.hp, maxHp: mf.maxHp, deficit: D, belowMax: D > 0,
        defRange: defRange,
        vetRange: defRange ? [Math.round(defRange[0] * 1.5), Math.round((defRange[1] - 1) * 1.5)] : null,
        maxHpInDefRange: defRange ? (mf.maxHp >= defRange[0] && mf.maxHp < defRange[1]) : null,
        worldHp: tile ? tile.hp : null, worldMaxHp: tile ? tile.maxHp : null,
        worldDeficit: (tile && tile.hp != null && tile.maxHp != null) ? ((tile.maxHp | 0) - (tile.hp | 0)) : null,
        worldIdMatches: tile ? (tile.id === mf.monsterId) : null,
        constructionHp: cf ? cf.hp : null, constructionMaxHp: cf ? cf.maxHp : null,
        constructionDeficit: Cd, constructionMissing: !cf,
        order: order, playerIdx: pIdx, monsterIdx: mIdx, beforePlayer: beforePlayer,
        openingSum: S, openingResidual: D - S,
        openingEvents: events.map(e => ({ sourceKey: e.sourceKey, sourceLabel: e.sourceLabel, preHp: e.preHp, postHp: e.postHp, returned: e.returned })),
        contribKinds: contribKinds,
        classification: classification, tracedInput: tracedInput,
        incomplete: false,
      });
    }
  }
  return {
    seed, days: row.days, starts, excluded, refused, incomplete,
    postJoinMismatches, orphanMonsterEvents: orphanMonsterEvents.length,
    courtshipCombined: (row.courtship && row.courtship.combined) | 0,
  };
}

function main() {
  const fails = unitChecks();
  if (fails.length) { console.error('UNIT FAILS: ' + fails.join(', ')); process.exit(1); }
  const defs = loadDefs();
  const perSeed = SEEDS.map(s => auditSeed(loadRow(CORPUS, s), defs));
  // Parity vs w4damage corpus (w4convert's 13 checks).
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
  const allStarts = perSeed.flatMap(p => p.starts);
  const completeStarts = allStarts.filter(s => !s.incomplete);
  const below = completeStarts.filter(s => s.belowMax);
  const traced = below.filter(s => s.classification === 'TRACED');
  const unexplained = below.filter(s => s.classification === 'UNEXPLAINED');
  // Unclassified counts ALL rows (a full row missing its
  // construction snapshot is an instrument gap too, not just a
  // below-max one); full-reinforcement rows are classified, not
  // unclassified. Below-max rows are the GO leg; the gate below
  // fails on any unclassified row of either kind.
  const unclassified = completeStarts.filter(s => s.classification === 'UNCLASSIFIED');
  const reinforcement = completeStarts.filter(s => s.classification === 'full-reinforcement');
  const distinctFights = new Set(completeStarts.map(s => s.fightId)).size;
  const incompleteN = perSeed.reduce((t, p) => t + p.incomplete, 0);
  const postMismatchN = perSeed.reduce((t, p) => t + p.postJoinMismatches, 0);
  const orphanN = perSeed.reduce((t, p) => t + p.orphanMonsterEvents, 0);
  const corpusOk = perSeed.length === 8 && SEEDS.every((s, i) => {
    const row = loadRow(CORPUS, s);
    return row.days > 0 && recorderClean(row);
  }) && incompleteN === 0;
  const parityPass = parity.every(p => p.pass);
  const courtTotals = perSeed.reduce((t, p) => t + p.courtshipCombined, 0);
  const courtSeedsActive = perSeed.filter(p => p.courtshipCombined > 0).length;
  const substrateOk = courtTotals > 0 && courtSeedsActive >= 6;
  const constrBelow = completeStarts.filter(s => (s.constructionDeficit | 0) > 0);
  const byMonster = {};
  for (const s of completeStarts) {
    if (!byMonster[s.monster]) byMonster[s.monster] = { fights: 0, below: 0 };
    byMonster[s.monster].fights++;
    if (s.belowMax) byMonster[s.monster].below++;
  }
  const wall = {};
  for (const seed of SEEDS) {
    const r = loadRow(CORPUS, seed);
    wall[seed] = { days: r.days, won: r.won, waveReach: r.waveReach, nationalEver: r.nationalEver, nationalFinal: r.nationalFinal, table: r.table, entered: r.entered, deathTotal: r.deathTotal };
  }
  const analysis = { label: 'sim-fighterconstruct-a audit', seeds: SEEDS,
    census: { fights: distinctFights, fighters: completeStarts.length, belowMax: below.length, traced: traced.length, unexplained: unexplained.length, unclassified: unclassified.length,
      reinforcementFull: reinforcement.length,
      incomplete: incompleteN, constructionBelowMax: constrBelow.length, byMonster: byMonster,
      postJoinMismatches: postMismatchN, orphanMonsterEvents: orphanN },
    starts: completeStarts, incompleteStarts: allStarts.filter(s => s.incomplete),
    belowMaxRows: below, tracedRows: traced, unexplainedRows: unexplained, unclassifiedRows: unclassified,
    perSeed: perSeed.map(p => ({ seed: p.seed, days: p.days, starts: p.starts.length, excluded: p.excluded, refused: p.refused, incomplete: p.incomplete, postJoinMismatches: p.postJoinMismatches, orphanMonsterEvents: p.orphanMonsterEvents, courtshipCombined: p.courtshipCombined })),
    parity, corpusOk, parityPass, substrateOk,
    courtship: { combined: courtTotals, seedsActive: courtSeedsActive }, wall,
    generated: new Date().toISOString() };
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) { fs.writeFileSync(args[outIdx + 1], JSON.stringify(analysis, null, 1) + '\n'); console.log('analysis -> ' + args[outIdx + 1]); }
  console.log('\n=== sim-fighterconstruct-a audit ===');
  console.log(`  census: fights=${distinctFights} fighters=${completeStarts.length} belowMax=${below.length} traced=${traced.length} unexplained=${unexplained.length} unclassified=${unclassified.length} reinforcementFull=${reinforcement.length} incomplete=${incompleteN} constructionBelowMax=${constrBelow.length} postJoinMismatches=${postMismatchN} orphanMonsterEvents=${orphanN}`);
  for (const s of reinforcement) console.log(`  REINFORCEMENT s${s.seed} d${s.day} ${s.monster} [${s.channel}/${s.door}] ${s.hp}/${s.maxHp} (injected post-startCombat, hp==maxHp)`);
  console.log(`  byMonster: ${JSON.stringify(byMonster)}`);
  for (const s of below) {
    console.log(`  BELOW s${s.seed} d${s.day} ${s.monster} [${s.channel}/${s.door}/${s.origin}] ${s.hp}/${s.maxHp} deficit=${s.deficit} defRange=${JSON.stringify(s.defRange)} maxInRange=${s.maxHpInDefRange} world=${s.worldHp}/${s.worldMaxHp} (worldDeficit=${s.worldDeficit}, idMatch=${s.worldIdMatches}) constr=${s.constructionHp}/${s.constructionMaxHp} (Cd=${s.constructionDeficit}) openingSum=${s.openingSum} residual=${s.openingResidual} contrib=${JSON.stringify(s.contribKinds)} -> ${s.classification}${s.tracedInput ? ' (' + s.tracedInput + ')' : ''}`);
    for (const e of s.openingEvents) console.log(`      event src=${e.sourceKey} (${e.sourceLabel}) ${e.preHp}->${e.postHp} returned=${e.returned}`);
    console.log(`      order=${JSON.stringify(s.order)} beforePlayer=${JSON.stringify(s.beforePlayer)}`);
  }
  for (const p of parity) console.log(`  parity seed ${p.seed}: ${p.pass ? 'PASS' : 'FAIL'} ${JSON.stringify(p.checks)}`);
  console.log(`  corpusOk=${corpusOk} parityPass=${parityPass} substrateOk=${substrateOk} (court combined=${courtTotals} seedsActive=${courtSeedsActive})`);
  const ok = corpusOk && parityPass && substrateOk && unclassified.length === 0 && postMismatchN === 0 && orphanN === 0;
  console.log(`  VERDICT-MECHANICAL: ${ok ? 'PASS' : 'FAIL'} (corpusOk=${corpusOk} parityPass=${parityPass} substrateOk=${substrateOk} unclassified=${unclassified.length} postMismatch=${postMismatchN} orphan=${orphanN})`);
  if (!ok) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}
main();
