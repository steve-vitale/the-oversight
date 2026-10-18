#!/usr/bin/env node
// Focused probe (r22): does the natural villager objective machinery ever
// pick up an unknown-flesh haul? Measures:
//   1. objPick HAUL selection rate over 100 picks (site in range, fresh).
//   2. The full chain when HAUL is picked: travel → mapmemHaulAt → return →
//      pantry deposit (the same functions the daily tick calls).
//   3. Range gating: the same measurement for a forager (maxD=1) with the
//      site at distance 3 (out of range) vs distance 1 (in range).
'use strict';
const { loadGame, setupGame } = require('./sim-harness.js');

async function main() {
  const seed = parseInt(process.env.SEED || '79', 10);
  const { Game: G } = await loadGame({ seed });
  await setupGame(G);
  const assert = require('assert');

  const v = G.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;

  // find an explorer/wanderer and a forager/homebody — excluding anyone with
  // the 'escape' goal (objPick short-circuits to LEAVE for them; the probe
  // needs a villager who actually rolls the objective lottery).
  let wide = null, narrow = null;
  for (const rid of (v.roster || [])) {
    if (rid === G.villagerId) continue;
    let prof = null, goal = null;
    try { prof = G.npcRangeProfile(rid); } catch (e) {}
    try { goal = G.npcGoal ? G.npcGoal(rid) : null; } catch (e) {}
    if (goal === 'escape') continue;
    if (!wide && (prof === 'explorer' || prof === 'wanderer')) wide = { rid, prof };
    if (!narrow && (prof === 'forager' || prof === 'homebody')) narrow = { rid, prof };
    if (wide && narrow) break;
  }
  console.log('wide:', wide && wide.rid, wide && wide.prof, '| narrow:', narrow && narrow.rid, narrow && narrow.prof);
  if (!wide) { console.log('NO wide-profile villager on this seed — abort'); process.exit(2); }

  const mid = 'hummice';
  const mdef = (G.data.monsters || []).find(m => m.id === mid);
  assert(mdef, 'hummice def exists');
  assert(!G.monsterFoodSafe(mid), 'PRE: hummice flesh unrevealed');

  const mkCorpse = (node, tag) => {
    const corpse = {
      id: 'corpse-probe-' + tag, kind: 'monster', monsterId: mid,
      buried: false, looted: false, node, mx: node.x, my: node.y,
      dayDied: G.state.scholar.day || 0,
      items: (G.monsterCarcassEntries ? G.monsterCarcassEntries(mdef) : []),
    };
    G.state.corpses = G.state.corpses || [];
    G.state.corpses.push(corpse);
    return corpse;
  };

  // ---- 1. HAUL pick rate: site at distance 1 (in range for everyone) ----
  const near = { x: hx + 1, y: hy };
  const corpseNear = mkCorpse(near, 'near');
  const site = G.mapmemRemember(wide.rid, corpseNear);
  console.log('remembered (wide, dist 1):', !!site, site && ('spoilBy=' + site.spoilBy));
  assert(site, 'site remembered');

  let haulPicks = 0, picks = 0;
  const kinds = {};
  for (let i = 0; i < 100; i++) {
    // reset objective so objPick re-rolls
    G.state.village.objectives = G.state.village.objectives || {};
    G.state.village.objectives[wide.rid] = { kind: 'idle', state: 'idle' };
    G.objPick(wide.rid, hx, hy);
    const o = G.objOf(wide.rid);
    kinds[o.kind] = (kinds[o.kind] || 0) + 1;
    if (o.kind === 'HAUL') haulPicks++;
    picks++;
  }
  console.log(`objPick x100 (wide, site dist 1): HAUL picked ${haulPicks}/100`);
  console.log('kind histogram:', JSON.stringify(kinds));

  // ---- 2. Range gating: same site at distance 3 for the narrow villager ----
  if (narrow) {
    const far = { x: hx + 3, y: hy };
    const corpseFar = mkCorpse(far, 'far');
    const siteFar = G.mapmemRemember(narrow.rid, corpseFar);
    let maxD = null;
    try { maxD = G.npcMaxDist(narrow.rid); } catch (e) {}
    console.log(`narrow profile=${narrow.prof} maxD=${maxD}; site dist 3 remembered:`, !!siteFar);
    let haulFar = 0;
    const kindsFar = {};
    for (let i = 0; i < 100; i++) {
      G.state.village.objectives[narrow.rid] = { kind: 'idle', state: 'idle' };
      G.objPick(narrow.rid, hx, hy);
      const o = G.objOf(narrow.rid);
      kindsFar[o.kind] = (kindsFar[o.kind] || 0) + 1;
      if (o.kind === 'HAUL') haulFar++;
    }
    console.log(`objPick x100 (narrow=${narrow.prof}, site dist 3): HAUL picked ${haulFar}/100`);
    console.log('kind histogram:', JSON.stringify(kindsFar));
  }

  // ---- 3. Full chain: drive a HAUL to completion through the real functions ----
  // Force-pick until HAUL (bounded), then walk the state machine.
  let o = null, tries = 0;
  while (tries++ < 40) {
    G.state.village.objectives[wide.rid] = { kind: 'idle', state: 'idle' };
    G.objPick(wide.rid, hx, hy);
    o = G.objOf(wide.rid);
    if (o.kind === 'HAUL' && o.targetRef === corpseNear.id) break;
  }
  console.log(`HAUL objective acquired after ${tries} picks:`, o.kind === 'HAUL' && o.targetRef === corpseNear.id);
  if (o.kind === 'HAUL' && o.targetRef === corpseNear.id) {
    // travel out: the daily tick moves the villager; here we place them.
    try { G.npcSetNode(wide.rid, near.x, near.y); } catch (e) { console.log('npcSetNode err', e.message); }
    o.state = 'out';
    const hauled = G.mapmemHaulAt(wide.rid);
    console.log('mapmemHaulAt:', hauled, '| haulUnknown:', !!(o.haulUnknown && o.haulUnknown.length),
      '| item:', o.haulUnknown && o.haulUnknown[0] && o.haulUnknown[0].name,
      '| edible:', o.haulUnknown && o.haulUnknown[0] && o.haulUnknown[0].edible,
      '| kcalEach:', o.haulUnknown && o.haulUnknown[0] && o.haulUnknown[0].kcalEach);
    // return home + deposit: replicate the return branch via the real handler.
    // The return handler lives in the objectives return path; call it by
    // simulating arrival: set state returning, node home, then invoke the
    // haul-return branch directly.
    try { G.npcSetNode(wide.rid, hx, hy); } catch (e) {}
    o.state = 'returning'; o.purpose = 'haul';
    // call the real return logic: it's inline in the return handler; find it
    const panBefore = (G.state.village.pantry || []).length;
    try {
      // the return branch is in villager-objectives' return handler; drive it
      // via objReturn if exposed, else replicate the deposit exactly.
      if (G.objReturn) G.objReturn(wide.rid);
      else throw new Error('no objReturn');
    } catch (e) {
      // fallback: replicate deposit (same code as villager-objectives.js:1252)
      const hu = o.haulUnknown || []; o.haulUnknown = null;
      const vv = G.state.village; vv.pantry = vv.pantry || [];
      for (const hup of hu) {
        const hexist = (G.stacksMatch && vv.pantry.find(p => G.stacksMatch(p, hup))) || null;
        if (hexist) hexist.units = (hexist.units || 1) + (hup.units || 1);
        else vv.pantry.push(hup);
      }
      console.log('(fallback deposit replication)');
    }
    const panAfter = (G.state.village.pantry || []).length;
    const uf = (G.state.village.pantry || []).filter(it => /unknown flesh/i.test(it.name || ''));
    console.log(`pantry ${panBefore} -> ${panAfter}; unknown-flesh items: ${uf.length}`,
      uf.length ? `units=${uf[0].units} kcalEach=${uf[0].kcalEach} edible=${uf[0].edible}` : '');
    // experiment beat on the deposited flesh (presence-gated: player at haven).
    // villagerExperimentBeat(present) runs the cautious protocol on pantry
    // unknown flesh — the try/taste half of Steve's canon.
    try {
      const before = !!((G.state.codex.monsters || {})[mid] || {}).foodSafe;
      G.villagerExperimentBeat(true);
      const after = !!((G.state.codex.monsters || {})[mid] || {}).foodSafe;
      console.log(`villagerExperimentBeat(true): hummice foodSafe ${before} -> ${after}`);
    } catch (e) { console.log('experimentBeat ERROR: ' + (e && e.message)); }
  }

  console.log('DONE');
}

main().catch(e => { console.error('PROBE ERROR:', e && e.stack || e); process.exit(2); });
