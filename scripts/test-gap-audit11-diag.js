#!/usr/bin/env node
// DRAFT (to be copied into worktree as scripts/test-gap-audit11-diag.js)
// Synergy-assembly diagnosis: WHY does competent play almost never co-fire
// synergies? Instruments, per seed, on the CURRENT policy (no game changes):
//  - every ability offer seen at choice time (ids, src, slots free/full, held)
//  - every pick (chosen id, replaceId if any) and every stuck sheet (offer
//    still pending at run end / days pending)
//  - daily: held abilities, per-synergy co-held? (all ability legs held),
//    synergyAttempts, discovered, active
//  - useAbility calls (combat + all) with ok/refused
// Usage: node scripts/test-gap-audit11-diag.js <seed> [days] [outdir]
// One seed per process (never two harnesses in one process).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const seed = parseInt(process.argv[2], 10);
const days = parseInt(process.argv[3] || '120', 10);
const outdir = process.argv[4] || 'evidence/2026-11-02/gap-audit11-diag';
if (!seed) { console.error('usage: test-gap-audit11-diag.js <seed> [days] [outdir]'); process.exit(2); }

function heldIds(Game) {
  return ((Game.state.scholar || {}).abilities || []).map(a => (a && a.id) || a);
}
function legHeld(Game, rid) {
  const sch = Game.state.scholar || {};
  const synIds = new Set((Game.data.synergies || []).map(x => x.id));
  if (synIds.has(rid)) return (sch.synergies || []).includes(rid);
  if (rid.startsWith('tech:')) return !!(((Game.state.codex || {}).techniques || {})[rid.slice(5)]);
  if (rid.startsWith('skill:')) return ((((Game.state.codex || {}).skills || {})[rid.slice(6)] || {}).level || 0) >= 1;
  if (rid.startsWith('item:')) {
    const iid = rid.slice(5); const eq = sch.equipped || {};
    return [eq.melee, eq.ranged, eq.weapon, eq.armor, eq.torso, eq.head, eq.hands, eq.legs, eq.feet]
      .some(s => s && (s.itemId === iid || s.id === iid));
  }
  try { return (Game.abilityLevel(rid) || 0) >= 1; } catch (e) { return false; }
}

(async () => {
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const syns = Game.data.synergies || [];
  const useCounts = {};
  const origUse = Game.useAbility.bind(Game);
  Game.useAbility = function (aid, actionId, target) {
    let r; try { r = origUse(aid, actionId, target); } catch (e) { throw e; }
    const ok = r !== false && r !== null && r !== undefined;
    useCounts[aid] = useCounts[aid] || { calls: 0, ok: 0 };
    useCounts[aid].calls++; if (ok) useCounts[aid].ok++;
    return r;
  };
  // Offer/pick instrumentation: wrap chooseAbility + keepAbilities.
  const offers = [];
  const origChoose = Game.chooseAbility.bind(Game);
  Game.chooseAbility = function (id, replaceId) {
    const ch = ((Game.state.scholar || {}).abilityChoices || []).map(c => c.id || c);
    const held = heldIds(Game);
    const slots = (typeof Game.abilitySlots === 'function') ? Game.abilitySlots() : null;
    const r = origChoose(id, replaceId);
    offers.push({ day: (Game.state.scholar || {}).day || 0, offered: ch,
      picked: id, replaceId: replaceId || null, heldBefore: held,
      slots, heldAfter: heldIds(Game),
      pendingAfter: ((Game.state.scholar || {}).abilityChoices || []).map(c => c.id || c) });
    return r;
  };
  const origKeep = Game.keepAbilities ? Game.keepAbilities.bind(Game) : null;
  if (origKeep) {
    Game.keepAbilities = function () {
      offers.push({ day: (Game.state.scholar || {}).day || 0, kept: true,
        offered: ((Game.state.scholar || {}).abilityChoices || []).map(c => c.id || c),
        heldBefore: heldIds(Game) });
      return origKeep();
    };
  }
  const policy = Object.assign({ id: 'competent' }, competent);
  const daily = [];
  const origUpkeep = policy.upkeep;
  policy.upkeep = function (G, ctx) {
    if (origUpkeep) { try { origUpkeep(G, ctx); } catch (e) {} }
    try {
      const sch = G.state.scholar || {};
      const held = new Set(heldIds(G));
      const coHeld = [];
      for (const s of syns) {
        if ((sch.synergies || []).includes(s.id)) continue;
        const paths = s.requires_any || [s.requires || []];
        for (const p of paths) {
          if (p.length && p.every(r => legHeld(G, r))) { coHeld.push(s.id); break; }
        }
      }
      daily.push({ day: sch.day || 0, held: [...held],
        coHeld, attempts: Object.assign({}, sch.synergyAttempts || {}),
        discovered: (sch.synergies || []).slice(),
        active: (sch.activeSynergies || []).slice(),
        pendingOffer: ((sch.abilityChoices || []).map(c => c.id || c)) });
    } catch (e) {}
  };
  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const sch = Game.state.scholar || {};
  // Summarize: per synergy — days co-held, max attempts, discovered?
  const sum = {};
  for (const s of syns) {
    let coDays = 0; for (const d of daily) if (d.coHeld.includes(s.id)) coDays++;
    const lastAtt = (daily[daily.length - 1] || {}).attempts || {};
    sum[s.id] = { coHeldDays: coDays,
      attempts: lastAtt[s.id] || 0,
      discovered: (sch.synergies || []).includes(s.id),
      legs: s.requires_any || [s.requires || []] };
  }
  const out = { seed, days, endReason: result.endReason, gameDays: result.gameDays,
    useCounts, offers, sum, dailyHeldFinal: heldIds(Game),
    finalDiscovered: (sch.synergies || []).slice(),
    finalActive: (sch.activeSynergies || []).slice(),
    pendingOfferFinal: ((sch.abilityChoices || []).map(c => c.id || c)) };
  fs.mkdirSync(path.join(__dirname, '..', outdir), { recursive: true });
  const fp = path.join(__dirname, '..', outdir, `seed-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  const coAny = Object.values(sum).filter(v => v.coHeldDays > 0).length;
  const disc = Object.values(sum).filter(v => v.discovered).length;
  console.log(`SEED ${seed} end=${result.endReason} days=${result.gameDays} offers=${offers.length} synergiesCoHeldAnyDay=${coAny}/57 discovered=${disc} pendingFinal=${JSON.stringify(out.pendingOfferFinal)} -> ${fp}`);
})().catch(e => { console.error('DIAG FAIL', e && e.stack || e); process.exit(1); });
