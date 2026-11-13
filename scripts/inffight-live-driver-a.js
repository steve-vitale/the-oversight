#!/usr/bin/env node
// inffight-live-driver-a.js — live-fight verification for sim-inffight-a.
// Runs real sims (competent policy) and records EVERY Focus Group fight:
// whether the lead closes in (min distance to any live fighter), whether
// Deliberation lands (on anyone), and how the fight ends. This is the
// live leg of the prereg: the close-in must genuinely happen in real sim
// fights, not just in the fixture.
//
// Usage:
//   SEEDS=190391,190392,190393,190394,190395,190396,190397,190398 DAYS=150 \
//     OUT=evidence/2026-11-13/perseed-inffight-live-a node scripts/inffight-live-driver-a.js
// Writes one JSON per seed into OUT/ + a summary on stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '190391,190392,190393,190394,190395,190396,190397,190398')
  .split(',').map(s => Number(s.trim())).filter(Boolean);
const DAYS = Number(process.env.DAYS || 150);
const OUT = process.env.OUT || 'evidence/2026-11-13/perseed-inffight-live-a';
fs.mkdirSync(OUT, { recursive: true });

const cheb = (a, b) => Math.max(Math.abs(a.mx - b.mx), Math.abs(a.my - b.my));

async function runSeed(seed) {
  const { Game, manifest } = await loadGame({ seed, mode: 'inffight-live-' + seed });
  await setupGame(Game);
  const fights = [];
  let cur = null;
  const closeFight = () => {
    if (cur) { cur.ended = true; fights.push(cur); cur = null; }
  };
  // Open a record when a Focus Group fight starts.
  const origStart = Game.startCombat.bind(Game);
  Game.startCombat = function (mid, opts) {
    const r = origStart(mid, opts);
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const lead = f.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'focus_group');
        if (lead) {
          cur = {
            seed, day: (Game.state.scholar || {}).day || null,
            leadStartPos: lead.mx + ',' + lead.my,
            leadMoved: false, minDistToFighter: null,
            deliberationAny: 0, deliberationOnScholar: 0,
            mouthsDamaged: false, mouths0: lead.sigFG ? lead.sigFG.mouths.map(Math.round).join('/') : null,
            rounds: 0, result: null, partyN: f.fighters.filter(x => x.kind === 'villager' && !x.fled).length,
          };
        }
      }
    } catch (e) {}
    return r;
  };
  // Sample the lead's position every turn; count Deliberation damage.
  const origBegin = Game.tbBeginTurn.bind(Game);
  Game.tbBeginTurn = function () {
    const r = origBegin.apply(this, arguments);
    try {
      const f = Game.tbfight;
      if (f && !f.over && cur) {
        const lead = f.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'focus_group');
        if (lead) {
          cur.rounds = Math.max(cur.rounds, f.round || 0);
          if (lead.mx + ',' + lead.my !== cur.leadStartPos) cur.leadMoved = true;
          const live = f.fighters.filter(x => x.alive && !x.fled && x !== lead && (x.kind === 'player' || x.kind === 'villager' || x.kind === 'ally'));
          for (const o of live) {
            const d = cheb(lead, o);
            if (cur.minDistToFighter === null || d < cur.minDistToFighter) cur.minDistToFighter = d;
          }
          if (lead.sigFG) {
            const mm = lead.sigFG.mouths.map(Math.round).join('/');
            cur.mouths = mm;
            if (cur.mouths0 != null && mm !== cur.mouths0) cur.mouthsDamaged = true;
          }
        }
      }
    } catch (e) {}
    return r;
  };
  const origDmg = Game.tbDamage.bind(Game);
  Game.tbDamage = function (tk, dmg, sl, sk, opts) {
    const r = origDmg(tk, dmg, sl, sk, opts);
    try {
      if (cur && r > 0 && /deliberation/i.test(String(sl || ''))) {
        cur.deliberationAny += r;
        if (tk === 'p') cur.deliberationOnScholar += r;
      }
    } catch (e) {}
    return r;
  };
  const origEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (res) {
    try { if (cur) { cur.result = res; closeFight(); } } catch (e) {}
    return origEnd(res);
  };
  const policy = Object.assign({}, competent);
  // TARGETED MODE (prereg escalation): if natural sims never meet a Focus
  // Group, inject one fight into the live world instead of burning a
  // 16-seed confirm on an empty sample. On the first daily after day 70
  // with no focus_group fight yet, put the group two tiles from the
  // scholar and start the fight; the run loop's own fight driver
  // (competent policy + default driver) plays it out with the live party.
  if (process.env.TARGETED === '1') {
    const origDaily = policy.daily;
    let injected = false;
    policy.daily = function (G, ctx) {
      let r;
      try { if (origDaily) r = origDaily(G, ctx); } catch (e) { throw e; }
      try {
        const day = (G.state.scholar || {}).day || 0;
        if (!injected && day >= 70 && !fights.length && !cur && !(G.tbfight && !G.tbfight.over) && G.state.scholar && !G.over) {
          const s = G.state.scholar;
          s.monster = { id: 'focus_group', mx: Math.min(8, (s.mx ?? 4) + 2), my: s.my ?? 4 };
          injected = true;
          G.startCombat('focus_group');
        }
      } catch (e) {}
      return r;
    };
  }
  const result = await quietLog(async () => runDays(Game, policy, { days: DAYS, manifest }));
  closeFight();
  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    focusGroupFights: fights.length, fights,
  };
  fs.writeFileSync(path.join(OUT, 'seed-' + seed + '.json'), JSON.stringify(row, null, 2));
  return row;
}

(async () => {
  let totalFights = 0, closedIn = 0, deliberationLanded = 0;
  for (const seed of SEEDS) {
    const row = await runSeed(seed);
    totalFights += row.focusGroupFights;
    for (const f of row.fights) {
      if (f.leadMoved || (f.minDistToFighter !== null && f.minDistToFighter <= 1)) closedIn++;
      if (f.deliberationAny > 0) deliberationLanded++;
    }
    console.log(`seed ${seed}: days=${row.gameDays} end=${row.endReason} focusGroupFights=${row.focusGroupFights}` +
      row.fights.map(f => `\n  day ${f.day} party=${f.partyN} start=${f.leadStartPos} moved=${f.leadMoved} minDist=${f.minDistToFighter} deliberation=${f.deliberationAny} (scholar ${f.deliberationOnScholar}) mouths ${f.mouths0} -> ${f.mouths || f.mouths0} rounds=${f.rounds} result=${f.result}`).join(''));
  }
  console.log(`\nTOTAL focusGroupFights=${totalFights} closedIn=${closedIn} deliberationLanded=${deliberationLanded}`);
  if (totalFights === 0) console.log('NOTE: zero Focus Group fights in this band — escalate to the targeted spawn probe (see evidence).');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
