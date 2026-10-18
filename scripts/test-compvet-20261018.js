#!/usr/bin/env node
// test-compvet-20261018.js — proof for the compvet policy layer
// (flesh-out loop arm sim-compvet, 2026-10-18, scale-onramp axis;
// sim-vetsurvive's named next: MANUFACTURE veterans faster).
// POLICY-SIDE ONLY: proves scripts/policies/compvet.js, never touches
// src/js. Fixtures stub Game.unlockedWave (documented); the det-gate and
// smoke run the real engine.
//
// (a) MECHANISM (in-process fixtures on a real harness game):
//     A. companion-first yield: non-veteran scholar, wave-3 monster at
//        <=25% HP, engaged companion, round>=2, scholar>=50% HP =>
//        scholar holds (tbPlayerWait), ctx.cvYields counted. Gate-off RED:
//        no yield without COMPVET=1.
//     B. rally-the-kill-run: the first yield turn rallies (ctx.cvRallies,
//        f.rallyUsed) before the hold.
//     C. veteran scholar => compvet stays out (vetrel's lane); no cvYields.
//     D. blooded escort: veteran companion <55% HP, monster NOT near death
//        => honest breakoff (scholar flees / fight ends 'fled'),
//        ctx.cvEscorts counted.
//     E. escort near-death exception: veteran companion hurt + monster near
//        death => NO breakoff, yield cancelled, scholar strikes
//        (ctx.cvEscortStrikes counted).
//     F. gate off: daily+fight pure delegation (no cv* keys, no behavior).
// (v2: the alpha-strike finding — the scholar's round-1 opening strike
// one-shots wave-3 monsters, so the doctrine starts at round 1 with the
// rally and the yield threshold is 40%, the scholar's one-shot range.)
// (b) DET-GATE: COMPVET unset => compvet-lead byte-identical to vetrel-lead
//     on fixed seeds (60d).
// (c) SMOKE: COMPVET=1 short run drives without errors.
// Usage: node scripts/test-compvet-20261018.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { vetrelLead, vetrelBelong } = require('./policies/vetrel');
const CV = require('./policies/compvet');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function stubWave3(Game) {
  const orig = Game.unlockedWave;
  Game.unlockedWave = function () { return 3; };
  return () => { Game.unlockedWave = orig; };
}
function pickVillager(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
  for (const id of roster) {
    let vp = null;
    try { vp = Game.vpOf(id); } catch (e) {}
    if (vp && !vp.dead) return id;
  }
  return null;
}
function makeVeteran(Game, vid) {
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  Game.state.waveKillLog.push({ d: 60, mid: 'redactor', w: 3, by: vid, via: 'companion', trick: null });
}
function partyUp(Game, vid) {
  const ps = Game.partyState();
  ps.party = ps.party || [];
  if (!ps.party.includes(vid)) ps.party.push(vid);
}
// Start a real TB fight vs a wave-3 monster with the companion in the
// formal party (party.js joins by membership even beyond the 4-tile radius).
function startWave3Fight(Game, vid, mid) {
  if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
  const s = Game.state.scholar;
  s.mx = 2; s.my = 4;
  partyUp(Game, vid);
  s.monster = { id: mid || 'redactor', mx: 6, my: 4 };
  Game.startCombat(mid || 'redactor');
  const f = Game.tbfight;
  return f;
}
function toPlayerTurn(Game) {
  // tbAdvance() runs AI turns until it's the player's turn (sync path —
  // window is deleted in the harness). tbAfterPlayerAction() only ENDS the
  // player's turn; calling it off-turn advances nothing.
  try {
    if (Game.tbIsPlayerTurn()) return true;
    Game.tbAdvance();
    return !!Game.tbIsPlayerTurn();
  } catch (e) { return false; }
}
function monsterFighter(Game) {
  const f = Game.tbfight;
  if (!f) return null;
  return (f.fighters || []).find(x => x && x.kind === 'monster' && (x.hp || 0) > 0) || null;
}
function companionFighter(Game, vid) {
  const f = Game.tbfight;
  if (!f) return null;
  return (f.fighters || []).find(x => x && x.villagerId === vid) || null;
}
async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'compvet-proof' });
  await setupGame(Game);
  return Game;
}

async function main() {
  process.env.VETREL = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';

  console.log('== (a) MECHANISM fixtures ==');
  // Fixture driver: reach the player turn FIRST (companions/monster act),
  // THEN set HP, then run the policy once. Returns {Game, vid, mf, cf, ctx}
  // or null when the fixture isn't ready.
  async function yieldSituation(seed, mid, opts) {
    opts = opts || {};
    const Game = await newGame(seed);
    const vid = pickVillager(Game);
    if (!vid) return null;
    if (opts.veteranCompanion) makeVeteran(Game, vid);
    if (opts.veteranScholar) makeVeteran(Game, Game.villagerId);
    const restoreW3 = stubWave3(Game);
    startWave3Fight(Game, vid, mid);
    if (Game.tbfight) {
      Game.tbfight.round = opts.round != null ? opts.round : 2;
      if (opts.rallyUsed) Game.tbfight.rallyUsed = true;
    }
    if (!toPlayerTurn(Game)) { restoreW3(); return null; }
    const mf = monsterFighter(Game);
    const cf = companionFighter(Game, vid);
    if (!mf || !cf || !cf.alive || cf.fled) { restoreW3(); return null; }
    if (opts.monsterHpFrac != null) mf.hp = Math.round((mf.maxHp || 300) * opts.monsterHpFrac);
    if (opts.companionHpFrac != null) cf.hp = Math.round((cf.maxHp || 30) * opts.companionHpFrac);
    return { Game, vid, mf, cf, ctx: {}, restoreW3 };
  }
  // A. companion-first yield (gate ON => GREEN; gate OFF => RED)
  {
    // RED: gate off — the same situation must NOT yield
    delete process.env.COMPVET;
    let sit = await yieldSituation(9101, 'redactor', { monsterHpFrac: 0.35, rallyUsed: true });
    let acted = false;
    if (sit) { acted = CV.compvetLead.fight(sit.Game, sit.ctx); sit.restoreW3(); }
    check('A-RED gate-off: no companion-first yield', !!sit && sit.ctx.cvYields === undefined,
      sit ? `cvYields=${sit.ctx.cvYields}` : 'fixture not ready (no companion in fight)');

    // GREEN: gate on — the scholar holds for the companion.
    // (rallyUsed preset so the fixture reads the pure yield; the rally
    // itself is proven in fixture B.)
    process.env.COMPVET = '1';
    sit = await yieldSituation(9102, 'redactor', { monsterHpFrac: 0.35, rallyUsed: true });
    acted = false;
    if (sit) { acted = CV.compvetLead.fight(sit.Game, sit.ctx); }
    check('A-GREEN gate-on: scholar yields for companion', !!sit && acted === true && (sit.ctx.cvYields | 0) >= 1,
      sit ? `acted=${acted} cvYields=${sit.ctx.cvYields}` : 'fixture not ready');
    check('A-GREEN gate-on: commit set like vetrel non-veteran', !!sit && sit.ctx._huntCommit === true,
      sit ? `commit=${sit.ctx._huntCommit}` : 'fixture not ready');
    if (sit) sit.restoreW3();
  }
  // B. round-1 rally (alpha sacrifice) — and the alpha-wait fallback
  {
    process.env.COMPVET = '1';
    const sit = await yieldSituation(9103, 'gavel', { round: 1 });
    let rallied = false;
    if (sit) { rallied = CV.compvetLead.fight(sit.Game, sit.ctx); }
    check('B round-1 rally fires (alpha sacrificed)',
      !!sit && rallied === true && (sit.ctx.cvRallies | 0) === 1 && !!(sit.Game.tbfight && sit.Game.tbfight.rallyUsed),
      sit ? `rallies=${sit.ctx.cvRallies}` : 'fixture not ready');
    if (sit) sit.restoreW3();
    // B2: rally unavailable (stubbed to fail) => the alpha is still
    // sacrificed via an honest wait.
    const sit2 = await yieldSituation(9108, 'gavel', { round: 1 });
    let waited = false;
    if (sit2) {
      sit2.Game.tbPlayerRally = function () { return false; };
      waited = CV.compvetLead.fight(sit2.Game, sit2.ctx);
    }
    check('B2 rally unavailable: alpha wait fallback',
      !!sit2 && waited === true && (sit2.ctx.cvAlphaWaits | 0) === 1,
      sit2 ? `alphaWaits=${sit2.ctx.cvAlphaWaits}` : 'fixture not ready');
    if (sit2) sit2.restoreW3();
  }
  // C. veteran scholar => compvet stays out (vetrel's lane)
  {
    process.env.COMPVET = '1';
    const sit = await yieldSituation(9104, 'redactor', { round: 1, veteranScholar: true });
    if (sit) { CV.compvetLead.fight(sit.Game, sit.ctx); }
    const cvKeys = sit ? Object.keys(sit.ctx).filter(k => /^cv/.test(k) || k === '_cvYieldState') : ['no-sit'];
    check('C veteran scholar: no compvet keys (vetrel lane)', !!sit && cvKeys.length === 0, cvKeys.join(','));
    if (sit) sit.restoreW3();
  }
  // D. blooded escort: veteran companion <55%, monster healthy => breakoff.
  // The scholar starts ON the x-edge so the honest disengage exits
  // immediately via tbBarrierExit (the multi-turn walk is vetrel's
  // proven pattern; the fixture proves the trigger + the exit verb).
  {
    process.env.COMPVET = '1';
    const sit = await yieldSituation(9105, 'spool', { veteranCompanion: true, companionHpFrac: 0.5 });
    let disengaged = false;
    if (sit) {
      // world position must allow the west barrier exit (map.px+dx >= 0)
      sit.Game.map.px = 4; sit.Game.map.py = 4;
      const pf = sit.Game.tbFighter('p');
      if (pf) { pf.mx = 0; pf.my = 4; } // on the west edge
      CV.compvetLead.fight(sit.Game, sit.ctx);
      const p = sit.Game.tbFighter ? sit.Game.tbFighter('p') : null;
      // The honest disengage: the scholar fled, the fight ended, or the
      // barrier crossing moved them off the edge (a chase may continue —
      // the exit verb ran, which is the policy's honest action).
      disengaged = !!(p && p.fled) || !(sit.Game.tbfight && !sit.Game.tbfight.over) ||
        !!(p && (p.mx !== 0 || p.my !== 4));
    }
    check('D escort: hurt veteran companion triggers breakoff',
      !!sit && (sit.ctx.cvEscorts | 0) >= 1 && disengaged,
      sit ? `escorts=${sit.ctx.cvEscorts} disengaged=${disengaged}` : 'fixture not ready');
    if (sit) sit.restoreW3();
  }
  // E. escort near-death exception: monster near death => strike, don't flee
  {
    process.env.COMPVET = '1';
    const sit = await yieldSituation(9106, 'buffering',
      { veteranCompanion: true, companionHpFrac: 0.5, monsterHpFrac: 0.35, rallyUsed: true });
    if (sit) { CV.compvetLead.fight(sit.Game, sit.ctx); }
    const p = sit && sit.Game.tbFighter ? sit.Game.tbFighter('p') : null;
    check('E escort near-death: no breakoff, yield cancelled, scholar strikes',
      !!sit && (sit.ctx.cvEscorts | 0) === 0 && (sit.ctx.cvEscortStrikes | 0) === 1 && !(p && p.fled),
      sit ? `escorts=${sit.ctx.cvEscorts} escortStrikes=${sit.ctx.cvEscortStrikes} fled=${!!(p && p.fled)}` : 'fixture not ready');
    if (sit) sit.restoreW3();
  }
  // F. gate off: daily+fight pure delegation (no cv* keys)
  {
    delete process.env.COMPVET;
    const sit = await yieldSituation(9107, 'ad_break', { monsterHpFrac: 0.2 });
    if (sit) {
      await quietLog(async () => CV.compvetLead.daily(sit.Game, sit.ctx));
      CV.compvetLead.fight(sit.Game, sit.ctx);
    }
    const cvKeys = sit ? Object.keys(sit.ctx).filter(k => /^cv/.test(k) || k === '_cvYieldState') : ['no-sit'];
    check('F gate-off: ctx carries no compvet keys', !!sit && cvKeys.length === 0, cvKeys.join(','));
    process.env.COMPVET = '1';
    if (sit) sit.restoreW3();
  }

  console.log('== (b) DET-GATE (gate off => byte-identical to vetrel) ==');
  {
    delete process.env.COMPVET;
    const seeds = [9201, 9202];
    let green = 0;
    for (const seed of seeds) {
      for (const [pid, pol] of [['vetrel-lead', vetrelLead], ['compvet-lead', CV.compvetLead]]) {
        const { Game } = await loadGame({ seed, mode: 'compvet-det' });
        await setupGame(Game);
        const hashes = [];
        const wrapped = Object.assign({}, pol, {
          daily(G, ctx) {
            hashes.push(G.state.scholar.day + ':' + dayHash(G));
            return pol.daily(G, ctx);
          },
        });
        await quietLog(async () => runDays(Game, wrapped, { days: 60 }));
        const key = `${pid}-s${seed}`;
        if (!global._detHashes) global._detHashes = {};
        global._detHashes[key] = hashes.join('\n');
      }
      const a = global._detHashes[`vetrel-lead-s${seed}`];
      const b = global._detHashes[`compvet-lead-s${seed}`];
      const same = a === b;
      if (same) green++;
      check(`gate-off byte-identical [seed ${seed}]`, same, same ? '' : 'trajectories diverged');
    }
    check('det-gate all green', green === seeds.length, `${green}/${seeds.length}`);
    process.env.COMPVET = '1';
  }

  console.log('== (c) SMOKE (gate on, short run) ==');
  {
    process.env.COMPVET = '1';
    const { Game } = await loadGame({ seed: 9301, mode: 'compvet-smoke' });
    await setupGame(Game);
    let err = null;
    try {
      await quietLog(async () => runDays(Game, CV.compvetBelong, { days: 45 }));
    } catch (e) { err = e; }
    check('45d gate-on run completes', !err, err && String(err.message || err).slice(0, 200));
    check('game state coherent', !Game.over || typeof Game.over === 'boolean', '');
  }

  console.log(`\nPROOF: ${pass} pass, ${fail} fail.`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
