#!/usr/bin/env node
// analyze-journey-succession-r123-calibration-20261104.js — SUCCESSION LEG r123
// "BOND CALIBRATION + PICK-TIME BAR". Reads pilot stdout JSONs (driver:
// journey-succession-r123-20261104.js) and scores the pre-registered r123
// measures: pick-time rank (binding), bond calibration successor vs
// non-successor pairs (reported), d+30 bonds (reported), second-life
// scholarship (reported), carried regression (binding). No game code,
// no state writes.
// Usage: node scripts/analyze-journey-succession-r123-calibration-20261104.js <json...>
const fs = require('fs');
const files = process.argv.slice(2);
if (!files.length) { console.error('usage: analyzer <stdout-json...>'); process.exit(2); }
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
const keysFor = (snap, id) => ((snap || {}).bonds || []).filter(b => b.a === id || b.b === id);
const diffBonds = (pre, post) => {
  const preMap = new Map(pre.map(b => [b.key, b]));
  const postMap = new Map(post.map(b => [b.key, b]));
  const added = post.filter(b => !preMap.has(b.key));
  const lost = pre.filter(b => !postMap.has(b.key));
  const deepened = post.filter(b => {
    const p = preMap.get(b.key);
    return p && ((b.v || 0) > (p.v || 0) || (b.depth || 0) > (p.depth || 0));
  });
  return { added, lost, deepened };
};
const fmtBond = b => `${b.aName}<->${b.bName} depth=${b.depth} v=${b.v}`;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(`\n== seed ${d.seed} ==`);
  if (!d.death) { console.log('SKIPPED: no death recorded (village over before any kill)'); continue; }
  const death = d.death;
  const succId = (d.relPost || {}).selfId || null;
  const succName = death.newFirst;
  console.log(`first handoff: ${death.oldFirst} -> ${succName} d${death.day} (${death.cause}${death.scripted ? ', scripted' : ''}) passed=${death.passed} linOk=${death.linOk} moOk=${death.moOk}`);
  // PICK-TIME (binding, r119 metric-review revision): score npcCalls rank.
  const pc = (d.pickCtxs || [])[0] || null;
  if (!pc) {
    console.log('PICK-TIME: NO pickCtx for first handoff — NO-GO on instrument');
  } else {
    const pre = pc.pre || {}, post = pc.post || {};
    const r = rankOf(pre.npcIds || [], pre.trust || {}, pc.newId);
    const postTrust = (post.trust || {})[pc.newId];
    console.log(`PICK pre (reported, not scored): preRank=${r.rank} preTrust=${r.trust} gapToSecond=${r.gap} nCand=${(pre.npcIds || []).length} postTrust=${postTrust} delta=${(postTrust == null || r.trust == null) ? 'n/a' : (postTrust - r.trust)} newIdMatchesRelPost=${pc.newId === succId}`);
    let db = null;
    for (const k of Object.keys(pre.deadBonds || {})) {
      const parts = String(k).split('|');
      if ((parts[0] === pc.deadId && parts[1] === pc.newId) || (parts[0] === pc.newId && parts[1] === pc.deadId)) db = pre.deadBonds[k];
    }
    console.log(`PICK dead-bond: ${db ? `depth=${db.depth} v=${db.v}` : 'none'}`);
    const calls = pc.npcCalls || [];
    console.log(`PICK-TIME: ${calls.length} npcIds call(s) inside the death (one-call property: ${calls.length === 1})`);
    let pickPass = false;
    calls.forEach((c, i) => {
      const sorted = c.list.slice().sort((a, b) => ((c.trust[b] || 0) - (c.trust[a] || 0)));
      const pred = sorted[0];
      const prank = 1 + c.list.filter(x => x !== pc.newId && (c.trust[x] || 0) > (c.trust[pc.newId] || 0)).length;
      if (pred === pc.newId && prank === 1) pickPass = true;
      console.log(`  call ${i}: n=${c.list.length} predictedFirst=${pred} match=${pred === pc.newId} succRank=${prank} succTrust=${c.trust[pc.newId]}`);
    });
    if (!calls.length) console.log('PICK-TIME BAR: NO-GO on instrument (no npcCalls captured)');
    else if (pickPass) console.log('PICK-TIME BAR: PASS (pick-time rank 1)');
    else console.log('PICK-TIME BAR: FAIL (pick-time rank != 1) — pre-registered bar stands, never re-scored');
  }
  // CALIBRATION + D30: windows gated on same-bearer snapshots.
  const livingPost = new Set(Object.keys((d.relPost || {}).affinityNames || {}));
  const reportWindow = (label, snapA, snapB) => {
    if (!snapB) { console.log(`${label}: no snapshot (seed ended first or skipped)`); return false; }
    if (snapB.selfId !== succId) { console.log(`${label}: bearer ${snapB.selfId}, not first successor — window contaminated by a second handoff, bonds not scored`); return false; }
    const sPre = keysFor(snapA, succId), sPost = keysFor(snapB, succId);
    const sd = diffBonds(sPre, sPost);
    console.log(`${label} SUCCESSOR: handoff=${sPre.length} later=${sPost.length} new=${sd.added.length} lost=${sd.lost.length} deepened=${sd.deepened.length}`);
    for (const b of sd.added) console.log(`  new succ bond: ${fmtBond(b)}`);
    const nsPre = (snapA.bonds || []).filter(b => b.a !== succId && b.b !== succId && livingPost.has(b.a) && livingPost.has(b.b));
    const nsPost = (snapB.bonds || []).filter(b => b.a !== succId && b.b !== succId && livingPost.has(b.a) && livingPost.has(b.b));
    const nd = diffBonds(nsPre, nsPost);
    console.log(`${label} NON-SUCCESSOR (both endpoints living at relPost): handoff=${nsPre.length} later=${nsPost.length} new=${nd.added.length} lost=${nd.lost.length} deepened=${nd.deepened.length}`);
    for (const b of nd.added) console.log(`  new non-succ bond: ${fmtBond(b)}`);
    const pdA = ((snapA.personDeeds || {})[succId] || {}).count;
    const pdB = ((snapB.personDeeds || {})[succId] || {}).count;
    console.log(`${label} successor personDeeds: ${pdA} -> ${pdB}`);
    return true;
  };
  if (d.relPost) {
    reportWindow('CALIB relPost->relD14', d.relPost, d.relD14 || null);
    const d30ok = reportWindow('D30 relPost->relD30', d.relPost, d.relD30 || null);
    if (d30ok && d.relD14 && d.relD14.selfId === succId) reportWindow('SEG relD14->relD30', d.relD14, d.relD30);
  } else console.log('CALIB: no relPost — cannot score bond windows');
  // SECOND-LIFE SCHOLARSHIP: same-bearer checkpoints only.
  const base = d.scholarBase || {};
  const same = (d.ledger || []).filter(e => e.bearer === succName);
  console.log(`SECOND-SCHOLAR: base plants=${base.codexPlants} skills=${base.codexSkills} xp=${base.xpTotal} abilities=${(base.abilities || []).length}; same-bearer <redacted>${same.map(e => e.dplus).join(',') || 'none'}`);
  for (const e of same) {
    const s = e.scholar || {};
    console.log(`  d+${e.dplus}: plants=${s.codexPlants} (${(s.codexPlants || 0) - (base.codexPlants || 0)}) skills=${s.codexSkills} (${(s.codexSkills || 0) - (base.codexSkills || 0)}) xp=${s.xpTotal} (${(s.xpTotal || 0) - (base.xpTotal || 0)}) abilities=${(s.abilities || []).length}`);
  }
  // CARRIED REGRESSION
  const chain = d.chainDeaths || [];
  // r119 formula exactly: every recorded chain entry has causeKnown. An
  // empty chain passes VACUOUSLY (no chain deaths to check — the first
  // successor survived, as on 33204); that vacuity is printed, not hidden.
  const det = chain.every(c => c.causeKnown);
  const over = !!((d.overCause || {}).over);
  console.log(`CARRIED: DETECTOR chain=${chain.length} allCauseKnown=${det}${chain.length === 0 ? ' (VACUOUS: no chain deaths — first successor survived)' : ''} C1v3(m1)=${d.m1} S1=${d.s1} S1==!over:${d.s1 === !over} MG2v2=${d.mg2v2} M4=${d.m4}`);
  console.log(`CARRIED keepsake chain flags: ${JSON.stringify(chain.map(c => c.keepsakeLineFired))} inh: vanished=${JSON.stringify((d.inh || {}).vanishedIds)} keepsakeLineFired=${(d.inh || {}).keepsakeLineFired} source=${(d.inh || {}).keepsakeSource}`);
  console.log(`END: alive=${(d.overCause || {}).alive} pantryEnd=${d.pantryEnd} over=${over}`);
}
