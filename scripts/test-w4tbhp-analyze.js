#!/usr/bin/env node
// scripts/test-w4tbhp-analyze.js — TB-start-HP comparison analyzer for
// sim-w4tbhp-a (DIAG ONLY, zero src/js changes).
//
// Reads the post corpus (s<seed>-armed.json) and the pre corpus
// (s<seed>-pre.json) from evidence/2026-10-28/perseed-w4tbhp-a/
// (EVID env override) and builds, per side, the TB-start-HP table:
// one row per wave-4 TB fight (nonworldkill start, non-excluded,
// non-refused), carrying player fighter hp/maxHp at start, monster
// fighter hp/maxHp at start, and world tile hp/maxHp at start where
// present. Counts below-max starts per side for player (the judged
// quantity) and monster (the control), prints the comparison table,
// wall numbers per side, and headline parity of the POST side vs the
// rebaseline corpus (CHAN env override, default
// evidence/2026-10-27/perseed-w4channel-rebaseline/).
//
// Classification vocabulary is the worktree's classifyStart applied
// identically to both sides (one shared vocabulary, as the rebase
// analyzer did for its parity corpus). No verdict is judged here:
// the script prints the table and gates; the evidence file judges
// it against the prereg.
//
// Usage: node scripts/test-w4tbhp-analyze.js [--out <analysis.json>]
// Exit 1 on any hard gate failure (unit checks, corpus incomplete,
// recorder errors > 0, overflow > 0).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyStart } = require('./policies/nonworldkill-diag');

const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4tbhp-a');
const CHAN = process.env.CHAN || path.join(REPO, 'evidence', '2026-10-27', 'perseed-w4channel-rebaseline');

function medianUpper(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function medianConv(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}
function frac(hp, max) {
  if (hp == null || max == null || !max) return null;
  return hp / max;
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
  if (frac(9, 100) !== 0.09) fails.push('frac 9/100');
  if (frac(100, 100) !== 1) fails.push('frac full');
  if (frac(null, 100) !== null) fails.push('frac null hp');
  if (frac(50, null) !== null) fails.push('frac null max');
  if (frac(50, 0) !== null) fails.push('frac zero max');
  const rows = [
    { pHp: 9, pMax: 100, mHp: 1214, mMax: 1214 },
    { pHp: 100, pMax: 100, mHp: 1214, mMax: 1214 },
    { pHp: 57, pMax: 100, mHp: 900, mMax: 1200 },
  ];
  const belowP = rows.filter(r => r.pHp < r.pMax).length;
  const belowM = rows.filter(r => r.mHp < r.mMax).length;
  if (belowP !== 2) fails.push('below-max player count');
  if (belowM !== 1) fails.push('below-max monster count');
  if (tbChannel({ origin: 'world-origin' }, { door: 'world-bump' }) !== 'player-tb-world') fails.push('channel world');
  if (tbChannel({ origin: 'null-origin' }, { door: 'feast-draw' }) !== 'non-world-TB') fails.push('channel null');
  return fails;
}

// Build TB-start rows for one corpus side ('armed' = post, 'pre' = pre).
function buildSide(side) {
  const rows = [];
  const fights = [];
  let excluded = 0, refused = 0, incomplete = 0;
  let recorderErrs = 0;
  const overflow = {};
  for (const seed of SEEDS) {
    const p = path.join(EVID, `s${seed}-${side}.json`);
    const row = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows.push(row);
    for (const store of ['raftdraft', 'spawnsrc', 'oldcore', 'w5births', 'defwound', 'nonworldkill', 'tbdmg']) {
      const d = row[store] && row[store].diag;
      if (d) {
        recorderErrs += (d.errs | 0);
        for (const k of Object.keys(d.overflow || {})) overflow[store + '.' + k] = (overflow[store + '.' + k] | 0) + (d.overflow[k] | 0);
      }
    }
    const nwk = row.nonworldkill || {};
    for (const st of (nwk.starts || []).filter(s => (s.wave | 0) === 4)) {
      const cls = classifyStart(st);
      if (cls.excluded) { excluded++; continue; }
      if (st.refused) { refused++; continue; }
      const pf = (st.fighters || []).find(x => x && x.kind === 'player') || null;
      const mf = (st.fighters || []).find(x => x && x.kind === 'monster') || null;
      const tile = st.tileMonster || null;
      const complete = !!(pf && pf.hp != null && pf.maxHp != null && mf && mf.hp != null && mf.maxHp != null);
      if (!complete) incomplete++;
      fights.push({
        seed: row.seed, day: st.day, channel: tbChannel(st, cls), door: cls.door,
        origin: st.origin, monster: (mf && mf.monsterId) || st.mid || null,
        fightId: st.fightId || null, fightIdSource: st.fightIdSource || null,
        pHp: pf ? pf.hp : null, pMax: pf ? pf.maxHp : null,
        pFrac: pf ? frac(pf.hp, pf.maxHp) : null,
        pBelowMax: pf ? (pf.hp < pf.maxHp) : null,
        mHp: mf ? mf.hp : null, mMax: mf ? mf.maxHp : null,
        mFrac: mf ? frac(mf.hp, mf.maxHp) : null,
        mBelowMax: mf ? (mf.hp < mf.maxHp) : null,
        wHp: tile ? tile.hp : null, wMax: tile ? tile.maxHp : null,
        wFrac: tile ? frac(tile.hp, tile.maxHp) : null,
        wBelowMax: tile ? (tile.hp < tile.maxHp) : null,
        complete: complete,
      });
    }
  }
  const completeFights = fights.filter(f => f.complete);
  const pBelow = completeFights.filter(f => f.pBelowMax);
  const mBelow = completeFights.filter(f => f.mBelowMax);
  const byChannel = {};
  for (const f of completeFights) {
    if (!byChannel[f.channel]) byChannel[f.channel] = { fights: 0, pBelow: 0, mBelow: 0 };
    byChannel[f.channel].fights++;
    if (f.pBelowMax) byChannel[f.channel].pBelow++;
    if (f.mBelowMax) byChannel[f.channel].mBelow++;
  }
  const wall = {
    n: rows.length,
    days: rows.map(r => r.days),
    medianUpper: medianUpper(rows.map(r => r.days)),
    medianConv: medianConv(rows.map(r => r.days)),
    won: rows.reduce((t, r) => t + r.won, 0),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    courtshipCombined: rows.reduce((t, r) => t + ((r.courtship && r.courtship.combined) | 0), 0),
    courtshipSeedsActive: rows.filter(r => r.courtship && r.courtship.combined > 0).length,
    seats: (() => { const s = {}; for (const r of rows) { const k = (r.tableState && r.tableState.seat) || 'none'; s[k] = (s[k] || 0) + 1; } return s; })(),
  };
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0)
    && recorderErrs === 0 && Object.values(overflow).every(v => v === 0)
    && incomplete === 0;
  return {
    side, rows, fights, completeFights, excluded, refused, incomplete,
    recorderErrs, overflow, corpusOk,
    counts: {
      fights: fights.length, complete: completeFights.length,
      pBelow: pBelow.length, mBelow: mBelow.length,
      pBelowList: pBelow, mBelowList: mBelow,
      pFracMedian: medianConv(completeFights.map(f => f.pFrac).filter(v => v != null)),
      pFracMin: completeFights.length ? Math.min.apply(null, completeFights.map(f => f.pFrac).filter(v => v != null)) : null,
      mFracMedian: medianConv(completeFights.map(f => f.mFrac).filter(v => v != null)),
      mFracMin: completeFights.length ? Math.min.apply(null, completeFights.map(f => f.mFrac).filter(v => v != null)) : null,
      byChannel: byChannel,
    },
    wall: wall,
  };
}

// Headline parity: post rows vs rebaseline rows, shared vocabulary.
function parityPostVsRebaseline(postRows) {
  const chanRows = [];
  for (const seed of SEEDS) {
    const p = path.join(CHAN, `s${seed}-armed.json`);
    chanRows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const fields = ['days', 'gameDays', 'won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal'];
  const mismatches = [];
  for (let i = 0; i < SEEDS.length; i++) {
    const a = postRows[i], b = chanRows[i];
    for (const f of fields) {
      if ((a[f] | 0) !== (b[f] | 0)) mismatches.push({ seed: SEEDS[i], field: f, post: a[f], rebaseline: b[f] });
    }
    const ca = (a.courtship && a.courtship.combined) | 0;
    const cb = (b.courtship && b.courtship.combined) | 0;
    if (ca !== cb) mismatches.push({ seed: SEEDS[i], field: 'courtship.combined', post: ca, rebaseline: cb });
    // Wave-4 fight counts by channel under the shared vocabulary.
    const countChan = (row) => {
      const m = {};
      const nwk = row.nonworldkill || {};
      for (const st of (nwk.starts || []).filter(s => (s.wave | 0) === 4)) {
        const cls = classifyStart(st);
        if (cls.excluded || st.refused) continue;
        const ch = tbChannel(st, cls);
        m[ch] = (m[ch] | 0) + 1;
      }
      return m;
    };
    const ma = countChan(a), mb = countChan(b);
    const keys = new Set(Object.keys(ma).concat(Object.keys(mb)));
    for (const k of keys) {
      if ((ma[k] | 0) !== (mb[k] | 0)) mismatches.push({ seed: SEEDS[i], field: 'tbFights.' + k, post: ma[k] | 0, rebaseline: mb[k] | 0 });
    }
  }
  return { mismatches: mismatches, exact: mismatches.length === 0, chanRows: chanRows };
}

function main() {
  const fails = unitChecks();
  if (fails.length) { console.error('UNIT FAILS: ' + fails.join(', ')); process.exit(1); }
  const post = buildSide('armed');
  const pre = buildSide('pre');
  const parity = parityPostVsRebaseline(post.rows);
  const out = {
    label: 'sim-w4tbhp-a TB-start-HP comparison', seeds: SEEDS,
    post: { counts: post.counts, wall: post.wall, excluded: post.excluded, refused: post.refused, incomplete: post.incomplete, recorderErrs: post.recorderErrs, overflow: post.overflow, corpusOk: post.corpusOk, fights: post.completeFights },
    pre: { counts: pre.counts, wall: pre.wall, excluded: pre.excluded, refused: pre.refused, incomplete: pre.incomplete, recorderErrs: pre.recorderErrs, overflow: pre.overflow, corpusOk: pre.corpusOk, fights: pre.completeFights },
    parityPostVsRebaseline: { exact: parity.exact, mismatches: parity.mismatches },
    generated: new Date().toISOString(),
  };
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  if (outIdx >= 0 && args[outIdx + 1]) {
    fs.writeFileSync(args[outIdx + 1], JSON.stringify(out, null, 1) + '\n');
    console.log('analysis -> ' + args[outIdx + 1]);
  }
  console.log('\n=== sim-w4tbhp-a TB-start-HP comparison ===');
  for (const s of [pre, post]) {
    console.log(`  ${s.side}: fights=${s.counts.fights} complete=${s.counts.complete} excluded=${s.excluded} refused=${s.refused} incomplete=${s.incomplete} recorderErrs=${s.recorderErrs} corpusOk=${s.corpusOk}`);
    console.log(`    player below-max: ${s.counts.pBelow}/${s.counts.complete} medianFrac=${s.counts.pFracMedian} minFrac=${s.counts.pFracMin}`);
    console.log(`    monster below-max (control): ${s.counts.mBelow}/${s.counts.complete} medianFrac=${s.counts.mFracMedian} minFrac=${s.counts.mFracMin}`);
    console.log(`    byChannel: ${JSON.stringify(s.counts.byChannel)}`);
    console.log(`    wall: won=${s.wall.won} natEver=${s.wall.nationalEver} natFinal=${s.wall.nationalFinal} table=${s.wall.table} entered=${s.wall.entered} wave4=${s.wall.wave4} wave5=${s.wall.wave5} medUpper=${s.wall.medianUpper} medConv=${s.wall.medianConv} deaths=${s.wall.deathTotal} courtCombined=${s.wall.courtshipCombined} courtActive=${s.wall.courtshipSeedsActive}/8 seats=${JSON.stringify(s.wall.seats)}`);
  }
  console.log(`  parity post-vs-rebaseline: ${parity.exact ? 'EXACT' : 'DIVERGED (' + parity.mismatches.length + ' mismatches)'}`);
  for (const m of parity.mismatches) console.log(`    MISMATCH seed ${m.seed} ${m.field}: post=${m.post} rebaseline=${m.rebaseline}`);
  console.log('  --- player below-max fights (POST) ---');
  for (const f of post.counts.pBelowList) console.log(`    POST s${f.seed} d${f.day} ${f.monster} [${f.channel}] player ${f.pHp}/${f.pMax} (${(f.pFrac * 100).toFixed(1)}%) monster ${f.mHp}/${f.mMax} world ${f.wHp}/${f.wMax}`);
  console.log('  --- player below-max fights (PRE) ---');
  for (const f of pre.counts.pBelowList) console.log(`    PRE s${f.seed} d${f.day} ${f.monster} [${f.channel}] player ${f.pHp}/${f.pMax} (${(f.pFrac * 100).toFixed(1)}%) monster ${f.mHp}/${f.mMax} world ${f.wHp}/${f.wMax}`);
  console.log('  --- monster below-max fights (control, both sides) ---');
  for (const f of post.counts.mBelowList) console.log(`    POST s${f.seed} d${f.day} ${f.monster} [${f.channel}] monster ${f.mHp}/${f.mMax} (${(f.mFrac * 100).toFixed(1)}%)`);
  for (const f of pre.counts.mBelowList) console.log(`    PRE s${f.seed} d${f.day} ${f.monster} [${f.channel}] monster ${f.mHp}/${f.mMax} (${(f.mFrac * 100).toFixed(1)}%)`);
  if (!post.corpusOk || !pre.corpusOk) { console.error('PROOF GATE FAILURE: corpus incomplete on a side'); process.exit(1); }
}
if (require.main === module) main();
module.exports = { buildSide, frac, tbChannel };
