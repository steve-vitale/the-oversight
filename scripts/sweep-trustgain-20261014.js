#!/usr/bin/env node
// scripts/sweep-trustgain-20261014.js — TRUST-GAIN CENSUS sweep
// (longsim scale-onramp r31 ARM 2/3, diagnostic, 2026-10-14).
//
// ZERO game-code changes. Installs the trust-gain census instrument
// (scripts/trustgain-20261014.js) on current master and runs the courtship
// road: 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek, 180d
// death-aware, identical-seed.
//
// PRE-REGISTERED (evidence/2026-10-14/sim-trustgain-r31.md header, §§9-12, 14):
//   PRIMARY: ranked gain-channel contributions — total trust gained per
//     channel per 100 village-days; which channels fire at all on the
//     courtship road; gains vs penalty-drain balance (all-village and
//     scholar-lineage scoped).
//   GO: complete census with the binding channel named in numbers.
//     DIAGNOSTIC arm — verdict = the ranked census + the named next lever.
//   DET-GATE: --invocations=2 runs the det-gate style A/A per combo
//     (16/16 identical required; the instrument must not perturb).
//   HORIZON: 180d death-aware (dead villages stop, +10d tail max).
//   SMOKE=1: instrument-honesty gate before spend (policy drives, census
//     installs, writes captured on a short run).
// A miss on census completeness is NO-GO per §14 — never re-scored.
//
// Usage:
//   SMOKE=1 node scripts/sweep-trustgain-20261014.js
//   node scripts/sweep-trustgain-20261014.js --invocations=2   # det-gate
//   OUT=evidence/2026-10-14/trustgain.json PERSEED_DIR=evidence/2026-10-14/trustgain-perseed \
//     node scripts/sweep-trustgain-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { installTrustCensus, rankChannels } = require('./trustgain-20261014');

const POLICY_REGISTRY = {
  // NAMED-export unwrap (#69): never Object.assign({}, require(...)).
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const INVOC_ARG = process.argv.find(a => a.startsWith('--invocations='));
const INVOC = INVOC_ARG ? (parseInt(INVOC_ARG.split('=')[1], 10) || 1) : 1;

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function runCombo(pid, seed, inv) {
  const base = POLICY_REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: `trustgain-${pid}-s${seed}-i${inv}` });
  await setupGame(Game);
  const census = installTrustCensus(Game);
  const hashes = [];
  let maxRank = 0, maxArc = 1, everTable = false, won = false, everExiled = false;
  const policy = Object.assign({}, base);
  const origSetup = base.setup, origDaily = base.daily;
  policy.setup = (G, ctx) => { try { census.reproxy(); } catch (e) {} if (origSetup) { try { return origSetup(G, ctx); } catch (e) {} } };
  policy.daily = (G, ctx) => {
    try {
      census.reproxy(); // game code may reassign state.village.trust; re-wrap
      census.sampleDay();
      hashes.push(((G.state.scholar || {}).day || 0) + ':' + dayHash(G));
      const s = stdSnapshot(G);
      maxRank = Math.max(maxRank, RANK_ORDER[s.rank] || 0);
      maxArc = Math.max(maxArc, s.arc || 1);
      if (s.tableWaiting) everTable = true;
      if (s.won) won = true;
      if ((G.state.scholar || {}).exiled) everExiled = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let r;
  await quietLog(async () => { r = await runDays(Game, policy, { days: 180 }); });
  census.sampleDay();

  // scholar lineage (succession-aware per the r30 lesson): strict per-day
  // map, so a successor's NPC-era gains don't count as scholar gains.
  const lineageVids = new Set(census.daySamples.map(s => s.vid));
  const scholarAtDay = new Map(census.daySamples.map(s => [s.day, s.vid]));
  const villageDays = census.daySamples.reduce((t, s) => t + (s.roster || 0), 0);
  const { rows, prog } = rankChannels(census, scholarAtDay);
  const last = census.daySamples[census.daySamples.length - 1] || {};
  const end = stdSnapshot(Game);
  const otherCh = rows.filter(x => x.channel.indexOf('other:') === 0 && x.channel !== 'other:delete');

  // sense-test sample: for the top 2 gain channels, grab say lines from
  // hit days spread across the run (early/mid/late) via the per-day archive.
  const { classifyWrite: cw } = require('./trustgain-20261014');
  const senseBeats = [];
  for (const topGain of rows.filter(x => x.gainTotal > 0).slice(0, 2)) {
    const hitDays = [...new Set(census.writes.filter(w => cw(w) === topGain.channel).map(w => w.day))].sort((a, b) => a - b);
    const pick = hitDays.length <= 3 ? hitDays : [hitDays[0], hitDays[Math.floor(hitDays.length / 2)], hitDays[hitDays.length - 1]];
    const beats = [];
    for (const d of pick) {
      for (const m of (census.daySays[d] || []).slice(0, 4)) beats.push(`d${d}: ${m.slice(0, 150)}`);
    }
    senseBeats.push({ channel: topGain.channel, beats: beats.slice(0, 12) });
  }

  return {
    policy: pid, seed, invocation: inv,
    days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    waveReach: r.maxWaveUnlocked || 1, maxArc,
    national: maxRank >= 2 ? 1 : 0, table: (everTable || end.tableWaiting) ? 1 : 0,
    wins: (won || end.won) ? 1 : 0, exiled: everExiled ? 1 : 0,
    villageDays,
    scholarTrustEnd: last.scholarTrust != null ? last.scholarTrust : null,
    successions: lineageVids.size,
    channels: rows.map(x => ({
      channel: x.channel, fires: x.fires,
      gainTotal: +x.gainTotal.toFixed(1), drainTotal: +x.drainTotal.toFixed(1),
      scholarGain: +x.scholarGain.toFixed(1), scholarDrain: +x.scholarDrain.toFixed(1),
      scholarFires: x.scholarFires,
      per100vd_gain: villageDays > 0 ? +(x.gainTotal / villageDays * 100).toFixed(2) : 0,
      per100vd_drain: villageDays > 0 ? +(x.drainTotal / villageDays * 100).toFixed(2) : 0,
      reasons: x.reasons,
    })),
    progressive: prog.map(p => ({ channel: p.channel, calls: p.calls, baseTotal: p.baseTotal, scaledTotal: p.scaledTotal,
      efficiency: p.baseTotal > 0 ? +(p.scaledTotal / p.baseTotal).toFixed(2) : 1 })),
    linkGains: (() => { const m = {}; for (const l of census.linkGains) { const k = l.caller || '?'; m[k] = m[k] || { caller: k, fires: 0, applied: 0 }; m[k].fires++; m[k].applied += l.applied; } return Object.values(m); })(),
    unclassified: otherCh.map(x => x.channel + ' x' + x.fires),
    senseBeats,
    trajectory: census.daySamples.map(s => ({ day: s.day, vid: s.vid, trust: s.scholarTrust, roster: s.roster })),
    hashes,
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] unwrapped policy.daily is a function`, base && typeof base.daily === 'function');
  }
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failures.'); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    const { Game } = await loadGame({ seed: 11, mode: 'trustgain-smoke-' + pid });
    await setupGame(Game);
    let census = null;
    try { census = installTrustCensus(Game); check(`[${pid}] census installed`, !!census && typeof census.reproxy === 'function'); }
    catch (e) { check(`[${pid}] census installed`, false, e.message); }
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    let dailyCalls = 0;
    policy.daily = (G, ctx) => { dailyCalls++; try { census.reproxy(); census.sampleDay(); } catch (e) {} if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15 }); });
    check(`[${pid}] policy.daily drove (${dailyCalls} calls)`, dailyCalls > 0);
    check(`[${pid}] census captured writes (${census.writes.length})`, census.writes.length > 0);
    check(`[${pid}] census captured lineage (${census.daySamples.length} day samples)`, census.daySamples.length >= 10);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: instrument honest, policies drive — safe to measure.');
}

function summarize(rows) {
  // rows: invocation-1 rows only
  // 'set:' channels are baseline assignments (newcomer 20, succession
  // inherit), NOT earned gains — kept out of the gain/drain balance.
  const isEarn = c => c.channel.indexOf('gain:') === 0;
  const isSet = c => c.channel.indexOf('set:') === 0;
  const agg = {};
  let villageDays = 0, gainSum = 0, drainSum = 0, setSum = 0, sGainSum = 0, sDrainSum = 0, sSetSum = 0;
  for (const r of rows) {
    villageDays += r.villageDays;
    for (const c of r.channels) {
      const e = agg[c.channel] || (agg[c.channel] = { channel: c.channel, fires: 0, gainTotal: 0, drainTotal: 0, scholarGain: 0, scholarDrain: 0, scholarFires: 0, combos: 0, kind: isEarn(c) ? 'earned' : (isSet(c) ? 'set' : (c.channel.indexOf('drain:') === 0 ? 'drain' : 'other')) });
      e.fires += c.fires; e.gainTotal += c.gainTotal; e.drainTotal += c.drainTotal;
      e.scholarGain += c.scholarGain; e.scholarDrain += c.scholarDrain; e.scholarFires += c.scholarFires;
      e.combos += (c.fires > 0 ? 1 : 0);
    }
    gainSum += r.channels.filter(isEarn).reduce((t, c) => t + c.gainTotal, 0);
    drainSum += r.channels.reduce((t, c) => t + c.drainTotal, 0);
    setSum += r.channels.filter(isSet).reduce((t, c) => t + c.gainTotal, 0);
    sGainSum += r.channels.filter(isEarn).reduce((t, c) => t + c.scholarGain, 0);
    sDrainSum += r.channels.reduce((t, c) => t + c.scholarDrain, 0);
    sSetSum += r.channels.filter(isSet).reduce((t, c) => t + c.scholarGain, 0);
  }
  const ranked = Object.values(agg).map(e => Object.assign(e, {
    per100vd_gain: villageDays > 0 ? +(e.gainTotal / villageDays * 100).toFixed(2) : 0,
    per100vd_drain: villageDays > 0 ? +(e.drainTotal / villageDays * 100).toFixed(2) : 0,
  })).sort((a, b) => b.gainTotal - a.gainTotal);
  const n = rows.length;
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  return {
    combos: n, villageDays,
    per100vd: {
      earnedGain: villageDays > 0 ? +(gainSum / villageDays * 100).toFixed(2) : 0,
      drainTotal: villageDays > 0 ? +(drainSum / villageDays * 100).toFixed(2) : 0,
      setTotal: villageDays > 0 ? +(setSum / villageDays * 100).toFixed(2) : 0,
      scholarEarnedGain: villageDays > 0 ? +(sGainSum / villageDays * 100).toFixed(2) : 0,
      scholarDrain: villageDays > 0 ? +(sDrainSum / villageDays * 100).toFixed(2) : 0,
      scholarSet: villageDays > 0 ? +(sSetSum / villageDays * 100).toFixed(2) : 0,
    },
    ranked,
    wall: {
      national: rows.reduce((t, r) => t + r.national, 0) + '/' + n,
      table: rows.reduce((t, r) => t + r.table, 0) + '/' + n,
      wins: rows.reduce((t, r) => t + r.wins, 0) + '/' + n,
      exiled: rows.reduce((t, r) => t + r.exiled, 0) + '/' + n,
      maxWave: Math.max.apply(null, rows.map(r => r.waveReach).concat([1])),
      medianDays: med(rows.map(r => r.gameDays)),
      scholarTrustEndMedian: med(rows.map(r => r.scholarTrustEnd == null ? 0 : r.scholarTrustEnd)),
    },
  };
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  if (perSeedDir && !fs.existsSync(perSeedDir)) fs.mkdirSync(perSeedDir, { recursive: true });
  const rows = [];
  const gate = [];
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    for (const seed of SEEDS) {
      const a = await runCombo(pid, seed, 1);
      rows.push(a);
      console.log(`  [${pid} s${seed} i1] days=${a.days}/${a.endReason} wave=${a.waveReach} nat=${a.national} vd=${a.villageDays} writes~${a.channels.reduce((t, c) => t + c.fires, 0)} trustEnd=${a.scholarTrustEnd} unclass=${a.unclassified.length}`);
      if (perSeedDir) fs.writeFileSync(path.join(perSeedDir, `${pid}-s${seed}.json`), JSON.stringify(a, null, 1));
      if (INVOC >= 2) {
        const b = await runCombo(pid, seed, 2);
        const ha = a.hashes.join('|'), hb = b.hashes.join('|');
        const identical = ha === hb && a.hashes.length === b.hashes.length && a.hashes.length > 0;
        gate.push({ pid, seed, identical, daysA: a.days, daysB: b.days });
        console.log(`    A/A: ${identical ? 'IDENTICAL' : 'DIVERGED'} (${a.hashes.length} day-hashes)`);
        if (perSeedDir) fs.writeFileSync(path.join(perSeedDir, `${pid}-s${seed}-i2.json`), JSON.stringify(b, null, 1));
      }
    }
  }
  const summary = summarize(rows);
  console.log('\n=== RANKED GAIN CHANNELS (per 100 village-days) ===');
  for (const c of summary.ranked.slice(0, 20)) {
    console.log(`  ${c.channel}: +${c.per100vd_gain}/100vd x${c.fires} (${c.combos}/${rows.length} combos) | scholar +${c.scholarGain.toFixed(0)} x${c.scholarFires}`);
  }
  console.log('=== BALANCE ===', JSON.stringify(summary.per100vd));
  console.log('=== WALL ===', JSON.stringify(summary.wall));
  if (INVOC >= 2) {
    const bad = gate.filter(g => !g.identical);
    console.log(`=== DET-GATE: ${gate.length - bad.length}/${gate.length} identical ===`);
    if (bad.length) { console.log('DIVERGED: ' + bad.map(g => `${g.pid}-s${g.seed}`).join(', ')); process.exitCode = 2; }
  }
  const unclass = rows.filter(r => r.unclassified.length);
  if (unclass.length) console.log('UNCLASSIFIED WRITES in: ' + unclass.map(r => `${r.policy}-s${r.seed}: ${r.unclassified.join(',')}`).join(' '));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify({ summary, rows: rows.map(r => Object.assign({}, r, { hashes: undefined, trajectory: undefined })) }, null, 1));
}

main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(1); });
