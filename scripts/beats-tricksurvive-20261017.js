#!/usr/bin/env node
// beats-tricksurvive-20261017.js — capture narration beats from trick fights
// with companions (SENSE-TESTING LAW material for the sim-tricksurvive arm).
//
// Re-runs one armed seed with Game.say wrapped; tags each line with the
// current TB fight's species; records which fights saw post-performance
// yields (ctx.tsYields increments). Writes the yield-fight transcripts to
// evidence/2026-10-17/tricksurvive-beats/.
//
// Usage: SEED=3701 POLICY=tricksurvive-lead node scripts/beats-tricksurvive-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function main() {
  const seed = parseInt(process.env.SEED || '3701', 10);
  const policyId = process.env.POLICY || 'tricksurvive-lead';
  process.env.TRICKSURVIVE = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TSP = require('./policies/tricksurvive');
  const policy = policyId === 'tricksurvive-belong' ? TSP.tricksurviveBelong : TSP.tricksurviveLead;
  const { Game } = await loadGame({ seed, mode: 'tricksurvive-beats', fullTelemetry: false });
  await setupGame(Game);

  const beats = [];
  let fightSeq = 0;
  const fightLog = []; // persistent: { seq, mids, comps, yields }
  let curFight = null; // { seq, mids, comps, yields, obj }
  const fightOf = (f) => {
    if (!f || f.over) return null;
    if (curFight && curFight.obj === f) return curFight;
    fightSeq++;
    const mids = [];
    const comps = [];
    try {
      for (const x of (f.fighters || [])) {
        if (x && x.kind === 'monster') mids.push((x.mdef || {}).id || '?');
        if (x && (x.kind === 'villager' || x.kind === 'ally') && x.villagerId) {
          comps.push(Game.displayName ? Game.displayName(x.villagerId) : x.villagerId);
        }
      }
    } catch (e) {}
    curFight = { seq: fightSeq, obj: f, mids, comps, yields: 0 };
    fightLog.push({ seq: fightSeq, mids, comps, yields: 0 });
    return curFight;
  };
  const markYield = (f, n) => {
    const cf = fightOf(f);
    if (cf) {
      cf.yields += n;
      const rec = fightLog.find(r => r.seq === cf.seq);
      if (rec) rec.yields += n;
    }
  };

  const origSay = Game.say ? Game.say.bind(Game) : null;
  Game.say = function (text) {
    try {
      const cf = fightOf(Game.tbfight);
      beats.push({ day: dayOf(Game), fight: cf ? cf.seq : 0, mids: cf ? cf.mids : [], text: String(text).slice(0, 400) });
    } catch (e) {}
    if (origSay) { try { return origSay(text); } catch (e) {} }
  };

  const baseFight = policy.fight.bind(policy);
  const baseDaily = policy.daily.bind(policy);
  let lastYields = 0;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) { return baseDaily(G, ctx); },
    fight(G, ctx) {
      const before = ctx.tsYields || 0;
      const r = baseFight(G, ctx);
      const after = ctx.tsYields || 0;
      if (after > before) { markYield(G.tbfight, after - before); lastYields = after; }
      return r;
    },
  });

  const result = await quietLog(async () => runDays(Game, wrapped, { days: 180, sampleEvery: 15 }));
  const out = { seed, policy: policyId, days: result.days, endReason: result.endReason, totalYields: lastYields, fightLog, beats: beats.filter(b => b.fight > 0) };
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-17', 'tricksurvive-beats');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${policyId}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  console.log(`wrote ${fp}: ${out.beats.length} fight beats, ${lastYields} yields, days=${result.days}`);
  // print the yield-fight transcripts inline for the sense read
  const byFight = {};
  for (const b of out.beats) { (byFight[b.fight] = byFight[b.fight] || []).push(b); }
  const yieldSeqs = new Set(fightLog.filter(f => f.yields > 0).map(f => f.seq));
  console.log(`fights with yields: ${[...yieldSeqs].join(', ') || 'none'}`);
  let shown = 0;
  for (const fl of fightLog) {
    if (shown >= 3) break;
    if (fl.yields === 0 && shown > 0) continue;
    const bs = byFight[fl.seq] || [];
    if (!bs.length) continue;
    shown++;
    console.log(`\n--- fight #${fl.seq} (day ${bs[0].day}, ${fl.mids.join('+')}; companions: ${fl.comps.join(', ') || 'none'}; yields: ${fl.yields}) ---`);
    for (const b of bs.slice(0, 40)) console.log(`  d${b.day}: ${b.text}`);
    if (bs.length > 40) console.log(`  ... (${bs.length - 40} more)`);
  }
}

main().catch(e => { console.error('BEATS FAILED', e); process.exit(1); });
