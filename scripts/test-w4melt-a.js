#!/usr/bin/env node
// scripts/test-w4melt-a.js — proof validator for sim-w4melt-a
// (scale-onramp axis, 2026-10-27, DIAG ONLY). Pure analysis over the
// corpus on disk: no harness, no RNG, no game state, re-runnable with
// identical output. It re-derives, from the corpus files themselves:
//   (1) the plain band and the armed band, and their equality;
//   (2) the armed-vs-plain per-seed exactness the sweep's --summary
//       already judged (an independent second check, not a re-print);
//   (3) the corpus-error counts (all SIX recorders, all seeds);
//   (4) the melt census: every wave-4 player-fight-melt removal,
//       joined to its birth (seq), its w4melt lift row, its oldcore
//       tbEnd row, and its follow-up (removal kind + day, or
//       still-present via the re-appearance rule);
//   (5) DIAG-GO legs (a)-(c) from those re-derived rows.
// Leg (d) (sense read) is evidence-checked, not corpus-checked: this
// validator prints it as EVIDENCE, never as PASS, so a green run
// here never claims the sense leg on its own.
// The melt-set comparison against the w4funnel-repin 5 is
// report-only (MATCH/MOVED, never a gate): base movement is a
// finding, not a failure (see the prereg's melt-set movement rule).
// Usage: node scripts/test-w4melt-a.js [corpus-dir]
// Exit 1 on any mismatch.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeW4funnel, rollup } = require('./test-w4funnel-diag');
const NL = String.fromCharCode(10);
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' ' + detail : '')); }
}
// Repin targets (report-only comparison): seed:type:birthDay:removalDay.
const REPIN5 = [
  '73671:reunion:153:167', '73675:eater:106:145', '73675:eulogy:139:145',
  '73675:suburb:150:167', '73677:suburb:114:123',
];
function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'perseed-w4melt-a');
  const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  let analysis = null;
  try { analysis = JSON.parse(fs.readFileSync(path.join(dir, 'analysis.json'), 'utf8')); } catch (e) { /* analyzer run separately; cross-check skipped if absent */ }
  const seeds = summary.seeds || [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
  check('summary label', summary.label === 'sim-w4melt-a', summary.label);
  check('summary corpusOk', summary.corpusOk === true, String(summary.corpusOk));
  check('summary armedVsPlainExact', summary.armedVsPlainExact === true, JSON.stringify(summary.perSeedExact));
  check('summary per-seed exact all', Array.isArray(summary.perSeedExact) && summary.perSeedExact.length === 8 && summary.perSeedExact.every(x => x.exact === true), JSON.stringify(summary.perSeedExact));
  check('plain band equals armed band', JSON.stringify(summary.plainBand) === JSON.stringify(summary.band), 'plain=' + JSON.stringify(summary.plainBand) + ' armed=' + JSON.stringify(summary.band));
  const SHARED = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'starvationDeaths'];
  let exactAll = true;
  const exactDetail = [];
  for (const seed of seeds) {
    const plain = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-baseline.json'), 'utf8'));
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    const diffs = [];
    for (const f of SHARED) if (JSON.stringify(plain[f]) !== JSON.stringify(armed[f])) diffs.push(f);
    if (JSON.stringify((plain.raftdraft || {}).faced || {}) !== JSON.stringify((armed.raftdraft || {}).faced || {})) diffs.push('faced');
    if (JSON.stringify((plain.raftdraft || {}).logEntries || []) !== JSON.stringify((armed.raftdraft || {}).logEntries || [])) diffs.push('logEntries');
    if (diffs.length) { exactAll = false; exactDetail.push(seed + ':' + diffs.join(',')); }
  }
  check('row-file armed-vs-plain exact (re-derived)', exactAll, exactDetail.join(' '));
  let errTotal = 0;
  const errDetail = [];
  for (const seed of seeds) {
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    for (const key of ['raftdraft', 'spawnsrc', 'oldcore', 'w5births', 'defwound', 'w4melt']) {
      const d = armed[key] && armed[key].diag;
      if (!d) { errTotal++; errDetail.push(seed + ':' + key + ':missing-diag'); continue; }
      if (d.errs !== 0) { errTotal += d.errs; errDetail.push(seed + ':' + key + ':errs=' + d.errs + ' ' + JSON.stringify(d.errors || [])); }
      const ov = d.overflow || {};
      for (const k of Object.keys(ov)) if ((ov[k] | 0) !== 0) { errTotal++; errDetail.push(seed + ':' + key + ':overflow:' + k + '=' + ov[k]); }
    }
  }
  check('recorder errors zero on all seeds (six recorders)', errTotal === 0, errDetail.join(' '));

  // Melt census, derived independently of the analyzer.
  const melts = [];
  const contrasts = [];
  for (const seed of seeds) {
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    const oc = armed.oldcore || {};
    const wm = armed.w4melt || {};
    const births = (oc.births || []).filter(b => (b.wave | 0) === 4);
    const birthBySeq = new Map(births.map(b => [b.seq, b]));
    const tbEnds = (oc.tbEnds || []).filter(t => (t.wave | 0) === 4);
    const removals = (oc.removals || []).filter(r => (r.wave | 0) === 4);
    const fights = (wm.fights || []).filter(f => f.tileMon && (f.tileMon.wave | 0) === 4);
    const settlements = (wm.settlements || []).slice();
    const finalPresent = new Set(((oc.finalPresent || []).filter(p => (p.wave | 0) === 4)).map(p => p.seq));
    const snapDays = new Map();
    for (const snap of (oc.snapshots || [])) {
      for (const p of (snap.present || [])) {
        if (p.seq == null) continue;
        if (!snapDays.has(p.seq)) snapDays.set(p.seq, []);
        snapDays.get(p.seq).push(snap.day | 0);
      }
    }
    const raidDays = (armed.raftdraft.raids || []).map(r => r.day | 0);
    // Pair settlements to oldcore tbEnds greedily in order (oldcore
    // rows are a subsequence of settlement rows: oldcore skips
    // tbEnds with no recovered origin).
    const settleUsed = new Set();
    function pairSettlement(tb) {
      for (let i = 0; i < settlements.length; i++) {
        if (settleUsed.has(i)) continue;
        const st = settlements[i];
        if ((st.day | 0) < (tb.day | 0)) { settleUsed.add(i); continue; }
        if ((st.day | 0) === (tb.day | 0) && st.result === tb.result) {
          if (st.origin && st.origin.seq === tb.seq) { settleUsed.add(i); return st; }
          if (!st.origin) { settleUsed.add(i); return st; }
        }
        if ((st.day | 0) > (tb.day | 0)) return null;
      }
      return null;
    }
    for (const rem of removals) {
      if (rem.kind !== 'player-fight-melt') continue;
      const birth = birthBySeq.get(rem.seq) || null;
      const tb = tbEnds.filter(t => t.seq === rem.seq && (t.day | 0) <= (rem.day | 0)).sort((a, b) => (b.day | 0) - (a.day | 0))[0] || null;
      const fightRows = fights.filter(f => f.tileMon && f.tileMon.seq === rem.seq && (!tb || (f.day | 0) <= (tb.day | 0))).sort((a, b) => (b.day | 0) - (a.day | 0));
      const fight = fightRows[0] || null;
      const settle = tb ? pairSettlement(tb) : null;
      let fightClass = 'UNLIFTED';
      if (fight && fight.lifted === true && fight.isFighter === true) fightClass = 'FOUGHT-ENTITY';
      else if (fight && fight.lifted === true) fightClass = 'LIFTED-NONFIGHTER';
      else if (tb && !fight) fightClass = 'BYSTANDER';
      let reason = null;
      if (fight) {
        if (!fight.tileMon.titan && !fight.tileMon.lingering) reason = 'worldOrigin-unset (non-titan non-lingerer: tbEnd restore block cannot run)';
        else if (fight.tileMon.lingering) {
          if (settle && settle.result === 'routed') reason = 'result-not-restorable (lingerers restore only on fled/lost; this fight routed)';
          else if (settle && (settle.fighters || []).filter(f => f.id === fight.tileMon.type && f.alive).length === 0 && (settle.fighters || []).some(f => f.id === fight.tileMon.type)) reason = 'fighter-dead (no standing fighter of the origin id at tbEnd)';
          else if (settle && settle.tileOccupied === true) reason = 'tile-occupied (a monster sits on the origin tile at tbEnd)';
          else if (settle && settle.restored === false) reason = 'UNEXPLAINED (linger origin, not restored, no fighter-dead/tile-occupied/routed signal)';
          else if (!settle) reason = 'UNEXPLAINED (no paired settlement row)';
          else reason = 'UNEXPLAINED (settlement says restored but oldcore says melt — join conflict)';
        } else if (fight.tileMon.titan) {
          if (settle && (settle.fighters || []).filter(f => f.id === fight.tileMon.type && f.alive).length === 0 && (settle.fighters || []).some(f => f.id === fight.tileMon.type)) reason = 'fighter-dead (no standing fighter of the origin id at tbEnd)';
          else if (settle && settle.tileOccupied === true) reason = 'tile-occupied (a monster sits on the origin tile at tbEnd)';
          else reason = 'UNEXPLAINED (titan origin, not restored, no fighter-dead/tile-occupied signal)';
        }
      } else if (tb) reason = 'BYSTANDER-CLASS (no lift row; needs r41-style investigation)';
      else reason = 'UNEXPLAINED (no fight row, no tbEnd row)';
      const reappeared = (snapDays.get(rem.seq) || []).some(d => d > (rem.day | 0));
      const followUp = finalPresent.has(rem.seq) || reappeared ? 'still-present (re-appearance cancels the exit)' : ('melt d' + rem.day);
      const hpPath = [];
      for (const snap of (wm.dailyW4 || [])) {
        const p = (snap.present || []).filter(x => x.seq === rem.seq);
        for (const x of p) hpPath.push({ day: snap.day, hp: x.hp, lingering: x.lingering });
      }
      melts.push({
        seed, seq: rem.seq, type: rem.type,
        birthDay: birth ? birth.day : null, fightDay: tb ? tb.day : null,
        removalDay: rem.day, result: tb ? tb.result : null,
        birthToRemoval: (birth && rem.day != null) ? ((rem.day | 0) - (birth.day | 0)) : null,
        birthToFight: (birth && tb) ? ((tb.day | 0) - (birth.day | 0)) : null,
        fightToRemoval: (tb && rem.day != null) ? ((rem.day | 0) - (tb.day | 0)) : null,
        fightClass, reason,
        liftLingering: fight ? fight.tileMon.lingering : null,
        liftTitan: fight ? fight.tileMon.titan : null,
        lingerSince: fight ? fight.tileMon.lingerSince : null,
        hpAtLift: fight ? fight.tileMon.hp : null,
        fighterHpAtEnd: settle ? ((settle.fighters || []).filter(f => f.id === rem.type).map(f => ({ alive: f.alive, hp: f.hp }))) : null,
        followUp, reappeared, raidDay: raidDays.indexOf(rem.day | 0) >= 0, raidDays,
        hpPath,
      });
    }
    // Contrast lingerers: wave-4 tbEnds with kind re-entry.
    for (const tb of tbEnds) {
      if (tb.kind !== 're-entry') continue;
      const birth = birthBySeq.get(tb.seq) || null;
      const finalHere = finalPresent.has(tb.seq);
      contrasts.push({ seed, seq: tb.seq, type: tb.type, birthDay: birth ? birth.day : null, fightDay: tb.day, result: tb.result, lingering: tb.lingering, titan: tb.titan, stillPresentAtEnd: finalHere });
    }
  }
  const meltKeys = melts.map(m => m.seed + ':' + m.type + ':' + m.birthDay + ':' + m.removalDay);
  const meltSetMatch = JSON.stringify(meltKeys.slice().sort()) === JSON.stringify(REPIN5.slice().sort());
  console.log('MELT-SET vs repin 5: ' + (meltSetMatch ? 'MATCH' : 'MOVED (report-only)') + ' got=' + JSON.stringify(meltKeys));
  for (const m of melts) {
    console.log('MELT ' + m.seed + ' ' + m.type + ' seq=' + m.seq + ' birth=d' + m.birthDay + ' fight=d' + m.fightDay + ' removal=d' + m.removalDay + ' result=' + m.result + ' class=' + m.fightClass + ' reason=' + m.reason + ' birthToRemoval=' + m.birthToRemoval + ' birthToFight=' + m.birthToFight + ' fightToRemoval=' + m.fightToRemoval + ' lingering=' + m.liftLingering + ' titan=' + m.liftTitan + ' lingerSince=' + m.lingerSince + ' hpAtLift=' + m.hpAtLift + ' followUp=' + m.followUp + ' raidDay=' + m.raidDay);
  }
  for (const c of contrasts) {
    console.log('CONTRAST re-entry ' + c.seed + ' ' + c.type + ' seq=' + c.seq + ' birth=d' + c.birthDay + ' fight=d' + c.fightDay + ' result=' + c.result + ' lingering=' + c.lingering + ' stillPresentAtEnd=' + c.stillPresentAtEnd);
  }
  check('leg (a) every melt fight-classified', melts.length > 0 && melts.every(m => m.fightClass === 'FOUGHT-ENTITY' || m.fightClass === 'BYSTANDER'), 'classes=' + JSON.stringify(melts.map(m => m.fightClass)));
  check('leg (a) every melt has a named no-restore reason', melts.length > 0 && melts.every(m => !!m.reason && m.reason.indexOf('UNEXPLAINED') < 0 && m.reason.indexOf('BYSTANDER-CLASS') < 0), 'reasons=' + JSON.stringify(melts.map(m => m.reason)));
  check('leg (b) per-melt days-to-removal + fight result present', melts.length > 0 && melts.every(m => m.birthToRemoval != null && m.fightToRemoval != null && !!m.result), JSON.stringify(melts.map(m => [m.birthToRemoval, m.fightToRemoval, m.result])));
  // Clustering legs (c): d145 pair same-seed, d167 pair cross-seed.
  const d145 = melts.filter(m => m.seed === 73675 && m.removalDay === 145);
  const d167 = melts.filter(m => m.removalDay === 167);
  const d145verdict = {
    pair: d145.map(m => m.type + '@' + m.seed),
    sameSeed: d145.length === 2 && d145.every(m => m.seed === 73675),
    removalDayRaidDay73675: d145.length ? d145[0].raidDay : null,
    fightDays: d145.map(m => m.fightDay),
    sameFightDay: d145.length === 2 && d145[0].fightDay === d145[1].fightDay,
    lingerSince: d145.map(m => m.lingerSince),
    sharedLingerSince: d145.length === 2 && d145[0].lingerSince != null && d145[0].lingerSince === d145[1].lingerSince,
  };
  const d167verdict = {
    pair: d167.map(m => m.type + '@' + m.seed),
    crossSeed: d167.length === 2 && d167[0].seed !== d167[1].seed,
    raidDayPerSeed: d167.map(m => ({ seed: m.seed, removalDayRaidDay: m.raidDay })),
    fightDays: d167.map(m => ({ seed: m.seed, fightDay: m.fightDay })),
    sharedCauseClaim: 'NONE — a shared calendar day across different seeds is not a shared cause (fixed in advance)',
  };
  console.log('CLUSTER d145: ' + JSON.stringify(d145verdict));
  console.log('CLUSTER d167: ' + JSON.stringify(d167verdict));
  check('leg (c) d145 pair clustering tested', d145.length === 2 && d145verdict.removalDayRaidDay73675 != null && d145verdict.fightDays.every(d => d != null), JSON.stringify(d145verdict));
  check('leg (c) d167 pair clustering tested (cross-seed, no shared-cause claim)', d167.length === 2 && d167verdict.crossSeed === true && d167verdict.sharedCauseClaim.indexOf('NONE') === 0, JSON.stringify(d167verdict));
  // Analyzer cross-check if analysis.json exists.
  if (analysis) {
    const perSeed = [];
    for (const seed of seeds) {
      const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
      perSeed.push(analyzeW4funnel(armed));
    }
    const band = rollup(perSeed);
    check('funnel arrivals match analysis', band.arrivals === analysis.band.arrivals, band.arrivals + ' vs ' + analysis.band.arrivals);
    check('funnel melted count matches validator melts', (band.outcomeCounts.melted | 0) === melts.length, band.outcomeCounts.melted + ' vs ' + melts.length);
  } else {
    console.log('EVIDENCE analyzer analysis.json absent: cross-check skipped (run test-w4funnel-diag.js over the corpus first)');
  }
  console.log('EVIDENCE leg (d) sense read: checked in the evidence file, not by this validator');
  console.log('EVIDENCE detgate: run separately via the sweep --detgate mode, reported in the evidence file');
  const lines = [
    'test-w4melt-a: ' + pass + ' passed, ' + fail + ' failed',
    '  plain/armed band: won=' + summary.band.won + ' medD=' + summary.band.medianDays + ' natEver=' + summary.band.nationalEver + ' natFinal=' + summary.band.nationalFinal + ' table=' + summary.band.table + ' entered=' + summary.band.entered + ' wave4=' + summary.band.wave4 + ' wave5=' + summary.band.wave5 + ' starv=' + summary.band.starvationTotal + ' deaths=' + summary.band.deathTotal,
    '  plain-vs-repin (report-only): ' + (summary.plainVs0615 ? (summary.plainVs0615.exact ? 'EXACT' : 'MOVED') : 'not recorded'),
    '  melts: ' + melts.length + ' ' + JSON.stringify(meltKeys),
    '  contrasts (re-entry): ' + contrasts.length,
  ];
  console.log(lines.join(NL));
  if (fail) process.exit(1);
}
main();
