#!/usr/bin/env node
// analyze-journey-succession-r119-secondlife-20261103.js — SUCCESSION LEG r119
// "THE SUCCESSOR'S SECOND LIFE". Reads pilot stdout JSONs (driver:
// journey-succession-r119-20261103.js) and scores the pre-registered
// r119 measures. No game code, no state writes.
// Usage: node scripts/analyze-journey-succession-r119-secondlife-20261103.js <json...>
const fs = require('fs');
const files = process.argv.slice(2);
if (!files.length) { console.error('usage: analyzer <stdout-json...>'); process.exit(2); }
const fname = (Game, id) => {
  try {
    const names = (Game && Game.affinityNames) || {};
    if (names[id]) return names[id];
  } catch (e) { console.warn('[r119 analyzer] fname', e); }
  return id;
};
const bondKeysFor = (snap, id) => {
  const out = [];
  for (const b of ((snap || {}).bonds || [])) {
    if (b.a === id || b.b === id) out.push(b);
  }
  return out;
};
const rankOf = (cands, trust, id) => {
  const t = trust[id] || 0;
  let rank = 1, second = -Infinity;
  for (const c of cands) {
    if (c === id) continue;
    const v = trust[c] || 0;
    if (v > t) rank++;
    if (v > second) second = v;
  }
  return { rank, gap: t - second, trust: t };
};
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(`\n== seed ${d.seed} ==`);
  if (!d.death) { console.log('SKIPPED: no death recorded (village over before any kill)'); continue; }
  const death = d.death;
  const succId = (d.relPost || {}).selfId || null;
  const succName = death.newFirst;
  console.log(`first handoff: ${death.oldFirst} -> ${succName} d${death.day} (${death.cause}${death.scripted ? ', scripted' : ''}) passed=${death.passed} linOk=${death.linOk} moOk=${death.moOk}`);
  // PICK (binding: pre-rank == 1)
  const pc = (d.pickCtxs || [])[0] || null;
  if (!pc) {
    console.log('PICK: NO pickCtx for first handoff — NO-GO on instrument');
  } else {
    const pre = pc.pre || {}, post = pc.post || {};
    const r = rankOf(pre.npcIds || [], pre.trust || {}, pc.newId);
    const postTrust = (post.trust || {})[pc.newId];
    console.log(`PICK: succId=${pc.newId} preRank=${r.rank} preTrust=${r.trust} gapToSecond=${r.gap} nCand=${(pre.npcIds || []).length} postTrust=${postTrust} delta=${(postTrust == null || r.trust == null) ? 'n/a' : (postTrust - r.trust)} newIdMatchesRelPost=${pc.newId === succId}`);
    // dead-bond (exact segment match)
    let db = null;
    for (const k of Object.keys(pre.deadBonds || {})) {
      const parts = String(k).split('|');
      if ((parts[0] === pc.deadId && parts[1] === pc.newId) || (parts[0] === pc.newId && parts[1] === pc.deadId)) db = pre.deadBonds[k];
    }
    console.log(`PICK dead-bond: ${db ? `depth=${db.depth} v=${db.v}` : 'none'}`);
    if (r.rank !== 1) console.log('PICK BAR: FAIL (pre-rank != 1) — pre-registered bar stands; pick-time decomposition below does not re-score it');
    else console.log(`PICK BAR: PASS${r.gap > 12 ? ' (gap > 12: proof, bonus cannot reorder)' : ' (gap <= 12: consistent-with, bonus caveat applies)'}`);
    // PICKCTX2 decomposition: which npcIds() call inside the death, trust-sorted
    // (stable), puts the successor first? That call is the pick-time input.
    const calls = pc.npcCalls || [];
    if (!calls.length) console.log('PICK-TIME: no npcIds calls captured inside the death');
    else {
      calls.forEach((c, i) => {
        const sorted = c.list.slice().sort((a, b) => ((c.trust[b] || 0) - (c.trust[a] || 0)));
        const pred = sorted[0];
        const prank = 1 + c.list.filter(x => x !== pc.newId && (c.trust[x] || 0) > (c.trust[pc.newId] || 0)).length;
        console.log(`PICK-TIME call ${i}: n=${c.list.length} predictedFirst=${pred} match=${pred === pc.newId} succRank=${prank} succTrust=${c.trust[pc.newId]}`);
      });
    }
  }
  // SECOND-LIFE BONDS relPost -> relD14 (only if successor still bearer at relD14)
  const relD14 = d.relD14 || null;
  const stillBearer14 = relD14 && relD14.selfId === succId;
  if (!relD14) console.log('SECOND-BONDS: no relD14 (seed ended before d+14 or skipped)');
  else if (!stillBearer14) console.log(`SECOND-BONDS: relD14 bearer is ${relD14.selfId}, not first successor — window contaminated by a second handoff, bonds not scored`);
  else {
    const pre = bondKeysFor(d.relPost, succId);
    const post14 = bondKeysFor(relD14, succId);
    const preKeys = new Set(pre.map(b => b.key));
    const postKeys = new Set(post14.map(b => b.key));
    const added = post14.filter(b => !preKeys.has(b.key));
    const lost = pre.filter(b => !postKeys.has(b.key));
    console.log(`SECOND-BONDS: handoff=${pre.length} d14=${post14.length} new=${added.length} lost=${lost.length}`);
    for (const b of added) console.log(`  new bond: ${b.aName}<->${b.bName} depth=${b.depth} v=${b.v}`);
    const pdPre = ((d.relPost || {}).personDeeds || {})[succId] || {};
    const pd14 = (relD14.personDeeds || {})[succId] || {};
    console.log(`SECOND-DEEDS: successor personDeeds handoff=${pdPre.count} d14=${pd14.count}`);
  }
  // SECOND-LIFE SCHOLARSHIP: same-bearer ledger checkpoints
  const base = d.scholarBase || {};
  const same = (d.ledger || []).filter(e => e.bearer === succName);
  console.log(`SECOND-SCHOLAR: base plants=${base.codexPlants} skills=${base.codexSkills} xp=${base.xpTotal} abilities=${(base.abilities || []).length}; same-bearer checkpoints=${same.map(e => e.dplus).join(',') || 'none'}`);
  for (const e of same) {
    const s = e.scholar || {};
    console.log(`  d+${e.dplus}: plants=${s.codexPlants} (${(s.codexPlants || 0) - (base.codexPlants || 0)}) skills=${s.codexSkills} (${(s.codexSkills || 0) - (base.codexSkills || 0)}) xp=${s.xpTotal} (${(s.xpTotal || 0) - (base.xpTotal || 0)}) abilities=${(s.abilities || []).length}`);
  }
  // CARRIED REGRESSION
  const det = (d.chainDeaths || []).length === ((d.chainDeaths || []).filter(c => c.causeKnown).length) && (d.chainDeaths || []).every(c => c.causeKnown);
  console.log(`CARRIED: DETECTOR chain=${(d.chainDeaths || []).length} allCauseKnown=${det} C1v3(m1)=${d.m1} S1=${d.s1} MG2v2=${d.mg2v2} M4=${d.m4}`);
  const chainFlags = (d.chainDeaths || []).map(c => c.keepsakeLineFired);
  console.log(`CARRIED keepsake chain flags: ${JSON.stringify(chainFlags)} inh: vanished=${JSON.stringify((d.inh || {}).vanishedIds)} keepsakeLineFired=${(d.inh || {}).keepsakeLineFired} source=${(d.inh || {}).keepsakeSource}`);
  console.log(`END: alive=${(d.overCause || {}).alive} pantryEnd=${d.pantryEnd} over=${!!(d.overCause || {}).over}`);
}
