#!/usr/bin/env node
// scripts/test-w4lethality.js — proof validator / analyzer for
// sim-w4lethality (DIAG ONLY, zero src/js changes).
//
// Reads the sweep corpus (evidence/2026-10-27/perseed-w4lethality/
// s<seed>-armed.json, EVID env override) and derives, per the
// pre-registered definitions in sim-w4lethality-prereg.md:
//   - per wave-4 fight: damage dealt, rounds, monster HP left,
//     fighter HP left, channel, monster identity;
//   - the single-fight damage distribution vs monster max HP;
//   - the closest-loss gap (smallest monster HP left, non-evade,
//     non-kill fights), in absolute HP and % of max;
//   - the >50% question (damage > 50% of max HP, and secondarily
//     of start HP), with counts by channel;
//   - fight-count + headline parity vs the w4channel band
//     (evidence/2026-10-27/perseed-w4channel-a/, CHAN env override);
//   - wall numbers + death-cause shares from THIS band only.
//
// Usage: node scripts/test-w4lethality.js [--out <analysis.json>]
// Exit 1 on any hard gate failure (G1 corpus, G2 leg (a)/(b),
// G3 parity). Leg (d)/(e) are computed, not gated — the evidence
// judges them against the prereg. Leg (f) SENSE is a separate
// script's output and is NOT computed here.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyStart } = require('./policies/nonworldkill-diag');
const { deriveTbDamage } = require('./policies/tbdmg-diag');

const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-w4lethality');
const CHAN = process.env.CHAN || path.join(REPO, 'evidence', '2026-10-27', 'perseed-w4channel-a');

function medianConv(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}
function medianUpper(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

// Channel for a TB fight, per the prereg (w4channel precedence).
function tbChannel(start, cls) {
  const door = cls ? cls.door : 'other';
  const origin = start.origin || 'unknown';
  if (door === 'glasswing-trap') return 'trap';
  if (origin === 'world-origin') return 'player-tb-world';
  if (origin === 'null-origin') return 'non-world-TB';
  if (door === 'contest-arena') return 'contest';
  return 'other';
}

// Build the per-fight damage table for one row. damageOptional=true
// skips the tbdmg join (used for the channel band's parity counts,
// whose rows carry no tbdmg store).
function buildFights(row, damageOptional) {
  const tb = [];
  const nwk = row.nonworldkill || {};
  const tbd = row.tbdmg || null;
  const starts = (nwk.starts || []).filter(s => (s.wave | 0) === 4);
  const killLog4 = ((row.raftdraft || {}).logEntries || []).filter(e => (e.w | 0) === 4);
  let excluded = 0;
  for (const st of starts) {
    const cls = classifyStart(st);
    if (cls.excluded) { excluded++; continue; }
    let end = null, endJoin = 'none';
    if (tbd && Array.isArray(tbd.tbEnds)) {
      const cands = tbd.tbEnds.filter(e => e.fightId && st.fightId && e.fightId === st.fightId && Array.isArray(e.fighters) && e.fighters.length);
      if (cands.length) { end = cands[cands.length - 1]; endJoin = 'fightId'; }
    }
    let dmg = null;
    if (end) dmg = deriveTbDamage(st.fighters, end.fighters);
    // Kill join (prereg: closest loss is NON-KILL): the fight's own
    // nonworldkill end row newLog entries with w==4, or an endHp
    // at/below zero (overkill end-state). A kill fight is never a
    // "closest loss" candidate, whatever its HP left reads.
    let killJoin = false;
    if (st.fightId) {
      const ne = (nwk.ends || []).find(e => e.fightId === st.fightId);
      if (ne && (ne.newLog || []).some(k => (k.w | 0) === 4)) killJoin = true;
    }
    const isKill = killJoin || (dmg !== null && dmg.endHp <= 0);
    tb.push({
      kind: 'tb', seed: row.seed, day: st.day, channel: tbChannel(st, cls),
      door: cls.door, origin: st.origin, monster: (dmg && dmg.monsterId) || st.mid || null,
      startHp: dmg ? dmg.startHp : ((st.fighters || []).find(x => x && x.kind === 'monster') || {}).hp ?? null,
      maxHp: dmg ? dmg.maxHp : ((st.fighters || []).find(x => x && x.kind === 'monster') || {}).maxHp ?? null,
      endHp: dmg ? dmg.endHp : null, damage: dmg ? dmg.damage : null,
      pctOfMax: dmg ? dmg.pctOfMax : null, pctLeft: dmg ? dmg.pctLeft : null,
      fighterHpLeft: dmg ? dmg.fighterHpLeft : null,
      rounds: end ? end.round : null, endResult: end ? end.result : null,
      fightId: st.fightId || null, endJoin: endJoin,
      complete: damageOptional ? true : (dmg !== null),
      endFighters: end ? end.fighters : null,
      isKill: isKill, killJoin: killJoin,
    });
  }
  const field = [];
  const def = row.defwound || {};
  const supp = (tbd && Array.isArray(tbd.fieldSupp)) ? tbd.fieldSupp : [];
  for (const r of (def.resolveFights || []).filter(x => (x.wave | 0) === 4)) {
    let s = supp.find(x => x.day === r.day && x.vid === r.vid && x.seq === r.seq && x.mid === r.mid);
    let join = s ? 'exact' : 'none';
    if (!s) {
      const cands = supp.filter(x => x.day === r.day && x.vid === r.vid && x.mid === r.mid);
      if (cands.length === 1) { s = cands[0]; join = 'fallback'; }
    }
    const evade = (r.rounds | 0) === 0 && (r.mDealt | 0) === 0;
    // Field kill join (approximate, flagged): a wave-4 kill-log entry
    // on the same day for the same monster type. Field kills are 0
    // on this band; the flag exists so a future field kill can never
    // be ranked as a "closest loss".
    const killJoinF = killLog4.some(k => (k.d | 0) === (r.day | 0) && k.mid === r.mid);
    field.push({
      kind: 'field', seed: row.seed, day: r.day,
      channel: r.context === 'raid' ? 'raid-defender' : 'villager-field',
      door: null, origin: null, monster: r.mid || null, vid: r.vid || null,
      startHp: r.mHpStart, maxHp: r.mHpMax, endHp: r.mHpLeft,
      damage: r.mDealt | 0,
      pctOfMax: (r.mHpMax ? (r.mDealt | 0) / r.mHpMax : null),
      pctLeft: (r.mHpMax && r.mHpLeft != null ? r.mHpLeft / r.mHpMax : null),
      fighterHpLeft: s ? s.vHpLeft : null,
      rounds: r.rounds | 0, endResult: r.outcome || null,
      fightId: null, endJoin: join, evade: evade,
      complete: (r.mDealt != null && r.mHpLeft != null && r.mHpMax != null && r.rounds != null),
      suppGap: !s,
      isKill: killJoinF || (r.mHpLeft != null && r.mHpLeft <= 0), killJoin: killJoinF,
    });
  }
  return { tb: tb, field: field, excluded: excluded };
}

function unitChecks() {
  const fails = [];
  const d1 = deriveTbDamage(
    [{ key: 'p', kind: 'player', hp: 100, maxHp: 100 }, { key: 'm_0', kind: 'monster', monsterId: 'eulogy', hp: 1000, maxHp: 1000 }],
    [{ key: 'p', kind: 'player', hp: 40, maxHp: 100 }, { key: 'm_0', kind: 'monster', monsterId: 'eulogy', hp: 850, maxHp: 1000 }]);
  if (!d1 || d1.damage !== 150 || d1.pctOfMax !== 0.15 || d1.fighterHpLeft !== 40) fails.push('deriveTbDamage basic');
  const d2 = deriveTbDamage([{ kind: 'monster', hp: 500, maxHp: 1000 }], []);
  if (d2 !== null) fails.push('deriveTbDamage missing-end must be null');
  const d3 = deriveTbDamage([{ kind: 'monster', hp: 900, maxHp: 900 }], [{ kind: 'monster', hp: 0, maxHp: 900 }]);
  if (!d3 || d3.damage !== 900 || d3.pctOfMax !== 1) fails.push('deriveTbDamage kill');
  if (tbChannel({ origin: 'world-origin' }, { door: 'world-bump' }) !== 'player-tb-world') fails.push('channel world');
  if (tbChannel({ origin: 'null-origin' }, { door: 'feast-draw' }) !== 'non-world-TB') fails.push('channel null');
  if (tbChannel({ origin: 'world-origin-mismatch' }, { door: 'contest-arena' }) !== 'contest') fails.push('channel contest');
  if (tbChannel({ origin: 'world-origin-mismatch' }, { door: 'feast-draw' }) !== 'other') fails.push('channel other');
  return fails;
}

function main() {
  const unitFails = unitChecks();
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(EVID, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { console.error(`MISSING ROW ${p}`); process.exit(1); }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  // G1 corpus integrity: 8 rows, days>0, every recorder errs 0, no overflow.
  const recNames = ['raftdraft', 'spawnsrc', 'oldcore', 'w5births', 'defwound', 'nonworldkill', 'tbdmg'];
  let g1 = rows.length === SEEDS.length;
  const g1Notes = [];
  for (const r of rows) {
    if (!(r.days > 0)) { g1 = false; g1Notes.push(`seed ${r.seed} days<=0`); }
    for (const rn of recNames) {
      const d = r[rn] && r[rn].diag;
      if (!d) { g1 = false; g1Notes.push(`seed ${r.seed} ${rn} diag missing`); continue; }
      if (d.errs !== 0) { g1 = false; g1Notes.push(`seed ${r.seed} ${rn} errs=${d.errs}`); }
      for (const v of Object.values(d.overflow || {})) if ((v | 0) > 0) { g1 = false; g1Notes.push(`seed ${r.seed} ${rn} overflow=${v}`); }
    }
  }
  // Substrate gate (same as w4channel): combined courtship >0, >=6/8 active.
  const courtTotals = {};
  for (const k of ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead', 'combined']) courtTotals[k] = rows.reduce((t, r) => t + ((r.courtship && r.courtship[k]) | 0), 0);
  const courtSeedsActive = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  const substrateOk = courtTotals.combined > 0 && courtSeedsActive >= 6;

  const perSeed = [];
  const allFights = [];
  for (const r of rows) {
    const f = buildFights(r, false);
    const fights = f.tb.concat(f.field);
    allFights.push(...fights);
    perSeed.push({ seed: r.seed, days: r.days, gameDays: r.gameDays, endReason: r.endReason, won: r.won,
      waveReach: r.waveReach, maxArc: r.maxArc, finalRank: r.finalRank, maxRank: r.maxRank,
      nationalEver: r.nationalEver, nationalFinal: r.nationalFinal, table: r.table, entered: r.entered,
      deaths: r.deathTotal, deathTotal: r.deathTotal, starvation: r.starvationDeaths, courtshipCombined: (r.courtship && r.courtship.combined) || 0,
      seat: (r.tableState && r.tableState.seat) || null,
      tbFights: f.tb.length, fieldFights: f.field.length, fights: fights.length,
      tbIncomplete: f.tb.filter(x => !x.complete).length,
      fieldIncomplete: f.field.filter(x => !x.complete).length,
      fieldSuppGaps: f.field.filter(x => x.suppGap).length,
      excludedStarts: f.excluded,
      kills4: (r.raftdraft.logEntries || []).filter(e => (e.w | 0) === 4).length,
      fightsDetail: fights });
  }
  const tbAll = allFights.filter(f => f.kind === 'tb');
  const fieldAll = allFights.filter(f => f.kind === 'field');
  const tbIncomplete = tbAll.filter(f => !f.complete);
  const fieldIncomplete = fieldAll.filter(f => !f.complete);
  const suppGaps = fieldAll.filter(f => f.suppGap);
  const legB = tbIncomplete.length === 0 && fieldIncomplete.length === 0;
  // Parity vs w4channel: headlines + fight counts by channel.
  const parityDivs = [];
  const chanCounts = {};
  for (const seed of SEEDS) {
    const cp = path.join(CHAN, `s${seed}-armed.json`);
    if (!fs.existsSync(cp)) { parityDivs.push(`seed ${seed} channel row missing`); continue; }
    const cr = JSON.parse(fs.readFileSync(cp, 'utf8'));
    const mine = perSeed.find(x => x.seed === seed);
    for (const k of ['days', 'gameDays', 'won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal']) {
      if ((mine[k] | 0) !== (cr[k] | 0)) parityDivs.push(`seed ${seed} ${k}: lethality=${mine[k]} channel=${cr[k]}`);
    }
    if (((mine.courtshipCombined) | 0) !== ((cr.courtship && cr.courtship.combined) | 0)) parityDivs.push(`seed ${seed} courtship: lethality=${mine.courtshipCombined} channel=${cr.courtship.combined}`);
    const cf = buildFights(cr, true);
    const cfights = cf.tb.concat(cf.field);
    const countBy = (arr) => { const m = {}; for (const f of arr) m[f.channel] = (m[f.channel] || 0) + 1; return m; };
    const mc = countBy(mine.fightsDetail), cc = countBy(cfights);
    chanCounts[seed] = { mine: mc, channel: cc };
    const keys = new Set([...Object.keys(mc), ...Object.keys(cc)]);
    for (const ch of keys) if ((mc[ch] || 0) !== (cc[ch] || 0)) parityDivs.push(`seed ${seed} channel ${ch}: lethality=${mc[ch] || 0} channel=${cc[ch] || 0}`);
    if (mine.fightsDetail.length !== cfights.length) parityDivs.push(`seed ${seed} fight total: lethality=${mine.fightsDetail.length} channel=${cfights.length}`);
  }
  const legC = parityDivs.length === 0;
  // Distribution + closest loss + >50%: ranked = NON-KILL, non-evade,
  // complete fights (prereg CLOSEST LOSS definition). Kill fights are
  // reported separately and never ranked as losses. The >50% question
  // is answered BOTH ways: literally (all complete non-evade fights,
  // kills included) and substantively (non-kill fights only) — the
  // literal answer is trivially yes whenever a kill exists, so the
  // non-kill answer is the one that measures the damage gap.
  const ranked = allFights.filter(f => !f.evade && !f.isKill && f.complete && f.damage != null && f.maxHp);
  const killFights = allFights.filter(f => f.isKill && f.complete && f.damage != null && f.maxHp);
  const allComplete = allFights.filter(f => !f.evade && f.complete && f.damage != null && f.maxHp);
  const pcts = ranked.map(f => f.pctOfMax).sort((a, b) => a - b);
  const byChannel = {};
  for (const f of ranked) {
    byChannel[f.channel] = byChannel[f.channel] || { fights: 0, over50max: 0, over50start: 0, maxPct: 0 };
    const b = byChannel[f.channel];
    b.fights++;
    if (f.pctOfMax > 0.5) b.over50max++;
    if (f.startHp && f.damage / f.startHp > 0.5) b.over50start++;
    if (f.pctOfMax > b.maxPct) b.maxPct = f.pctOfMax;
  }
  const over50max = ranked.filter(f => f.pctOfMax > 0.5);
  const over50start = ranked.filter(f => f.startHp && f.damage / f.startHp > 0.5);
  const over50maxAll = allComplete.filter(f => f.pctOfMax > 0.5);
  const closestByHp = ranked.slice().sort((a, b) => (a.endHp - b.endHp) || (a.pctLeft - b.pctLeft) || (a.seed - b.seed) || (a.day - b.day))[0] || null;
  const closestByPct = ranked.slice().sort((a, b) => (a.pctLeft - b.pctLeft) || (a.endHp - b.endHp) || (a.seed - b.seed) || (a.day - b.day))[0] || null;
  // Wall numbers (this band only).
  const days = rows.map(r => r.days);
  const deathShares = {};
  for (const r of rows) for (const k of Object.keys(r.deaths || {})) deathShares[k] = (deathShares[k] || 0) + r.deaths[k];
  const seats = {};
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; seats[st] = (seats[st] || 0) + 1; }
  const wall = {
    n: rows.length, won: rows.reduce((t, r) => t + r.won, 0),
    medianDaysUpper: medianUpper(days), medianDaysConv: medianConv(days), daysSorted: days.slice().sort((a, b) => a - b),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    deathShares: deathShares, seats: seats,
  };
  const channelCounts = {};
  for (const f of allFights) channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1;
  const legs = {
    a_valid: g1, a_notes: g1Notes,
    b_complete: legB, tbIncomplete: tbIncomplete.length, fieldIncomplete: fieldIncomplete.length,
    fieldSuppGaps: suppGaps.length, suppGapDetail: suppGaps.map(f => ({ seed: f.seed, day: f.day, monster: f.monster, vid: f.vid })),
    c_parity: legC, parityDivergences: parityDivs,
    substrateOk: substrateOk, courtship: { totals: courtTotals, seedsActive: courtSeedsActive },
    d_distribution: { n: ranked.length, pctSorted: pcts, maxPct: pcts.length ? pcts[pcts.length - 1] : null, medianPct: medianConv(pcts),
      closestByHp: closestByHp, closestByPct: closestByPct },
    e_over50: { over50max: over50max.length, over50start: over50start.length, byChannel: byChannel,
      over50maxDetail: over50max, over50startDetail: over50start,
      over50maxLiteral: over50maxAll.length, over50maxLiteralDetail: over50maxAll },
    kills: killFights,
  };
  const analysis = { label: 'sim-w4lethality analysis', seeds: SEEDS, perSeed: perSeed,
    fights: { total: allFights.length, tb: tbAll.length, field: fieldAll.length, evades: allFights.filter(f => f.evade).length, channelCounts: channelCounts },
    legs: legs, wall: wall, unitFails: unitFails, generated: new Date().toISOString() };
  const outArg = process.argv.indexOf('--out');
  const outPath = outArg >= 0 ? process.argv[outArg + 1] : path.join(EVID, 'analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(analysis, null, 1) + '\n');
  console.log('=== sim-w4lethality analysis ===');
  console.log(`  unitChecks: ${unitFails.length ? 'FAIL ' + unitFails.join(',') : 'PASS'}`);
  console.log(`  G1 corpus: ${g1 ? 'PASS' : 'FAIL ' + g1Notes.join('; ')}`);
  console.log(`  substrate: combined=${courtTotals.combined} seedsActive=${courtSeedsActive} -> ${substrateOk ? 'PASS' : 'FAIL'}`);
  console.log(`  wall: n=${wall.n} won=${wall.won} medUpper=${wall.medianDaysUpper} medConv=${wall.medianDaysConv} natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} starv=${wall.starvationTotal} deaths=${wall.deathTotal} seats=${JSON.stringify(seats)}`);
  console.log(`  fights: total=${allFights.length} tb=${tbAll.length} field=${fieldAll.length} evades=${allFights.filter(f => f.evade).length} channels=${JSON.stringify(channelCounts)}`);
  console.log(`  leg (b) complete: tbIncomplete=${tbIncomplete.length} fieldIncomplete=${fieldIncomplete.length} fieldSuppGaps=${suppGaps.length} -> ${legB ? 'PASS' : 'FAIL'}`);
  console.log(`  leg (c) parity: ${legC ? 'PASS (exact)' : 'DIVERGENCES: ' + parityDivs.join(' | ')}`);
  console.log(`  leg (d) distribution: ranked=${ranked.length} maxPct=${legs.d_distribution.maxPct} medianPct=${legs.d_distribution.medianPct}`);
  if (closestByHp) console.log(`  closest loss (by HP left): seed ${closestByHp.seed} d${closestByHp.day} ${closestByHp.monster} [${closestByHp.channel}] damage=${closestByHp.damage} maxHp=${closestByHp.maxHp} hpLeft=${closestByHp.endHp} (${(closestByHp.pctLeft * 100).toFixed(1)}% left) rounds=${closestByHp.rounds} fighterHpLeft=${closestByHp.fighterHpLeft}`);
  if (closestByPct && (!closestByHp || closestByPct.fightId !== closestByHp.fightId || closestByPct.day !== closestByHp.day || closestByPct.monster !== closestByHp.monster)) console.log(`  closest loss (by % left): seed ${closestByPct.seed} d${closestByPct.day} ${closestByPct.monster} [${closestByPct.channel}] damage=${closestByPct.damage} maxHp=${closestByPct.maxHp} hpLeft=${closestByPct.endHp} (${(closestByPct.pctLeft * 100).toFixed(1)}% left) rounds=${closestByPct.rounds}`);
  console.log(`  kills: ${killFights.length} (all complete non-evade fights incl kills: ${allComplete.length})`);
  for (const k of killFights) console.log(`    kill: seed ${k.seed} d${k.day} ${k.monster} [${k.channel}] damage=${k.damage} maxHp=${k.maxHp} endHp=${k.endHp} rounds=${k.rounds}`);
  console.log(`  leg (e) >50% non-kill: of max ${over50max.length}/${ranked.length}, of start ${over50start.length}/${ranked.length}, byChannel=${JSON.stringify(byChannel)}`);
  console.log(`  leg (e) >50% literal (kills incl): of max ${over50maxAll.length}/${allComplete.length}`);
  console.log(`  -> ${outPath}`);
  if (unitFails.length || !g1 || !substrateOk || !legB || !legC) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}
if (require.main === module) main();
module.exports = { buildFights, tbChannel, medianConv, medianUpper };
