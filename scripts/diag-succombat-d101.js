#!/usr/bin/env node
// scripts/diag-succombat-d101.js — one-seed diagnostic: log every
// fresh-window fight's race detail + mode, and every player death with its
// context. Answers: are the remaining same-day doubles lost races (nothing
// policy-side saves them) or misplayed winnable ones?
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
let SC;
try { SC = require('./policies/succombat'); }
catch (e) { console.error('SKIP: ./policies/succombat was deleted per kill protocol (arm killed at pilot) — diag retained as the durable record'); process.exit(0); }
const { wrapSuccombat, scRace } = SC;

const SEED = parseInt(process.env.SEED || '44', 10);
const fs = require('fs');
const DIAG_LOG = [];
function dlog(s) { DIAG_LOG.push(s); }

(async () => {
  process.env.SUCCOMBAT = '1';
  const { Game, manifest } = await loadGame({ seed: SEED, mode: 'sc-diag' });
  await setupGame(Game);
  const policy = wrapSuccombat(leadcourt);
  const p = Object.assign({}, policy);
  let ctxRef = null;
  // spy on the fight hook: log race detail + mode for every fresh-window fight
  const origFight = policy.fight;
  p.fight = function (G, C) {
    ctxRef = C;
    const fBefore = G.tbfight;
    const r = origFight(G, C);
    try {
      // log AFTER the wrapper acted: a fresh-window fight sets _scFightObj
      if (fBefore && !fBefore.over && C._scFightObj === fBefore && C._scDiagLogged !== fBefore) {
        C._scDiagLogged = fBefore;
        const { freshSuccessor, checkSuccession } = SC;
        checkSuccession(G, C);
        const pl = G.tbFighter ? G.tbFighter('p') : null;
        const rr = pl ? scRace(G, C, fBefore, pl) : null;
        const hpPct = pl ? ((pl.hp || 0) / Math.max(1, pl.maxHp || 100)).toFixed(2) : '?';
        const mons = (fBefore.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0)
          .map(m => `${m.monsterId}:${m.hp}/${m.maxHp}`).join(',');
        dlog(`  [d${(G.state.scholar || {}).day}] fresh=${freshSuccessor(G, C)} mode=${C._scMode} hp=${hpPct} decline=${rr && rr.decline} partyWinnable=${rr && rr.partyWinnable} allies=${rr ? rr.allies.length : '?'} mons=[${mons}]`);
      }
      if (!G.tbfight || G.tbfight.over) C._scDiagLogged = null;
    } catch (e) { dlog('  spy threw: ' + (e && e.message)); }
    return r;
  };
  const origDaily = policy.daily;
  p.daily = function (G, C) { ctxRef = C; if (origDaily) { try { return origDaily(G, C); } catch (e) {} } };
  const result = await runDays(Game, p, { days: 180, manifest, sampleEvery: 10 });
  delete process.env.SUCCOMBAT;
  const deaths = (result.samples.deaths || []).filter(d => d.player);
  console.log(`seed=${SEED} days=${result.days}`);
  console.log('player deaths:', deaths.map(d => `d${d.day}:${d.cause}`).join(' '));
  console.log('sc:', JSON.stringify({ fights: ctxRef.scFights, backs: ctxRef.scFightBacks, holds: ctxRef.scHolds, rallies: ctxRef.scRallies, heals: ctxRef.scHealed }));
  console.log('--- fresh-window fights ---');
  for (const l of DIAG_LOG) console.log(l);
  if (!DIAG_LOG.length) console.log('(none logged)');
})().catch(e => { console.error('DIAG ERROR', e); process.exit(2); });
