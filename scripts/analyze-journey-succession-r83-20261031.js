#!/usr/bin/env node
// analyze-journey-succession-r83-20261031.js — verdict table for succession r83
// (r79 analyzer verbatim + CHAIN5 section: fifth-handoff bonds/affinity/phantoms/inh5).
// (r64 analyzer verbatim + TRACE JOIN: every transcript deflection joined to
// SAYTRACE pool-draw / sayLine-fallback candidates from the same seed).
// analyze-journey-succession-r54-20261027.js — verdict table for succession r64 (r55 + CHAIN section).
// Reads evidence/2026-10-27/journey-succession-r54-<seed>.stdout.json (5 seeds:
// 26101-26102 day-5 regime, 26103-26105 mature regime) and prints: V1 vouch
// verdicts (mature seeds first), C1v2 call + convo-window coverage, C1v3
// transition-rule coverage, MG2v2 meal-line verdicts, A1v2 armor holder
// identity, the writer-site spike (trust moves vs same-day deed calls),
// over-cause, E1b mover-naming cross-tab, A1 armor transitions (bark counts
// per location per snapshot, gains/losses, UNACCOUNTED windows), S1
// bearer-own delta, M3v2b / M1 / M4 / MG2 / chain causes, and the transcript
// inventory for the people check. No game state is touched; this only reads
// run output.
// Usage: node scripts/analyze-journey-succession-r55-20261030.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-31');
const SEEDS = [26151, 26152, 26153, 26154, 26155, 26156]; // r83: 26151-26153 chain-forced (second + third + fourth + fifth kills), 26154-26156 controls (matched band, third use)
const ARMOR_LOCS = ['scholarPack', 'scholarWorn', 'scholarPrepStash', 'pantry',
  'livingWorn', 'livingPack', 'deadWorn', 'deadPack', 'corpses', 'stashed'];
const recs = [];
for (const s of SEEDS) {
  const f = path.join(EVID, `journey-succession-r83-${s}.stdout.json`);
  if (!fs.existsSync(f)) { console.log(`SEED ${s}: MISSING ${f}`); continue; }
  recs.push(JSON.parse(fs.readFileSync(f, 'utf8')));
}
console.log('== REGIMES ==');
for (const r of recs) {
  console.log(`seed ${r.seed}: scripted=${r.death && r.death.scripted} deathDay=${r.death && r.death.day} cause=${r.death && r.death.cause} ${r.death && r.death.oldFirst} -> ${r.death && r.death.newFirst} trustMantle=${r.death && r.death.newTrust}`);
}

console.log('\n== INH SUCCESSOR INHERITANCE (r54 headline) ==');
function inhClass(r) {
  const inh = r.inh || {};
  const pre = inh.succPre || {};
  const post = inh.succPost || {};
  const ded = (a) => [...new Set(a || [])];
  const postInv = ded(((post.inv && post.inv.pack) || []).concat((post.inv && post.inv.worn) || []));
  const preInv = ded((pre.invPack || []).concat(pre.invWorn || []));
  const postPlants = post.codexPlants || [];
  const postSkills = post.codexSkills || [];
  const preHad = preInv.length > 0 || (pre.plantKnow || []).length > 0 || (pre.skills || []).length > 0;
  const keptInv = postInv.filter(x => preInv.includes(x)).length;
  const kept = (inh.keptPlants || []).length + (inh.keptSkills || []).length + keptInv;
  const got = (inh.inheritedPlants || []).length + (inh.inheritedSkills || []).length + (inh.transferredIds || []).length;
  if (!inh.readable) return 'unreadable';
  if (postInv.length === 0 && postPlants.length === 0 && postSkills.length === 0 && preHad) return 'blank/reset';
  if (got > 0 && kept === 0) return 'inherited';
  if (kept > 0 && got === 0) return 'own-life';
  return 'mixed';
}
for (const r of recs) {
  const inh = r.inh || {};
  const pre = inh.succPre || {};
  const post = inh.succPost || {};
  const d = r.death || {};
  const ded2 = (a) => [...new Set(a || [])];
  const postInv = ded2(((post.inv && post.inv.pack) || []).concat((post.inv && post.inv.worn) || []));
  const preInv = ded2((pre.invPack || []).concat(pre.invWorn || []));
  console.log(`seed ${r.seed}: class=${inhClass(r)} readable=${!!inh.readable} scripted=${!!inh.scripted} ${d.oldFirst} -> ${d.newFirst}`);
  console.log(`  succPre: pack=${JSON.stringify(ded2(pre.invPack))} worn=${JSON.stringify(ded2(pre.invWorn))} plants=${JSON.stringify(pre.plantKnow || [])} skills=${JSON.stringify(pre.skills || [])} abilities=${JSON.stringify(pre.abilities || [])} trust=${pre.trust}`);
  if (r.inhCorpse) console.log(`  bearerCorpse@handoff: found=${r.inhCorpse.found} items=${JSON.stringify(r.inhCorpse.items || [])}`);
  if (r.inhCorpseD3) console.log(`  bearerCorpse@d+3: found=${r.inhCorpseD3.found} items=${JSON.stringify(r.inhCorpseD3.items || [])}`);
  console.log(`  succPost: inv=${JSON.stringify(postInv)} plants=${JSON.stringify(post.codexPlants || [])} skills=${JSON.stringify(post.codexSkills || [])} abilities=${JSON.stringify(post.abilities || [])} trust=${post.trust}`);
  if (inh.deadBearerPre) {
    const db = inh.deadBearerPre;
    console.log(`  deadPre: inv=${JSON.stringify(db.inv.pack.concat(db.inv.worn))} plants=${JSON.stringify(db.codexPlants)} skills=${JSON.stringify(db.codexSkills)} abilities=${JSON.stringify(db.abilities)} trust=${db.trust}`);
    console.log(`  deadPre sentimental flags: ${JSON.stringify(db.sentimental || {})}`);
  } else console.log('  deadPre: null (organic path — dead-bearer side unavailable)');
  console.log(`  keptPlants=${JSON.stringify(inh.keptPlants || [])} inheritedPlants=${JSON.stringify(inh.inheritedPlants || [])} keptSkills=${JSON.stringify(inh.keptSkills || [])} inheritedSkills=${JSON.stringify(inh.inheritedSkills || [])}`);
  console.log(`  disposition@handoff: transferred=${JSON.stringify(inh.transferredIds || [])} vanished=${JSON.stringify(inh.vanishedIds || [])} distinct=${inh.deadPreDistinctN}`);
  if (r.inhD3) {
    const d3 = r.inhD3;
    console.log(`  disposition@d+${d3.dplus}: transferred=${JSON.stringify(d3.disposition.filter(x => x.presentSuccessor).map(x => x.id))} vanished=${JSON.stringify(d3.disposition.filter(x => x.vanished).map(x => x.id))}`);
    for (const x of d3.disposition) console.log(`    ${x.id}: preN=${x.preN} succ=${x.succPackN + x.succWornN} corpse=${x.corpseN} pantry=${x.pantryN} living=${x.livingPackN + x.livingWornN} prep=${x.prepStashN} stashed=${x.stashedN} vanished=${x.vanished}`);
  }
  console.log(`  parity: equal=${r.parity && r.parity.equal} inheritedAbilities=${JSON.stringify((r.parity && r.parity.inherited) || [])}`);
}
console.log('\n== INH POOLED ==');
{
  const cls = {};
  for (const r of recs) cls[inhClass(r)] = (cls[inhClass(r)] || 0) + 1;
  console.log(`classes: ${JSON.stringify(cls)}`);
  const scr = recs.filter(r => r.inh && r.inh.scripted);
  const vanAll = [];
  for (const r of recs) for (const id of (r.inh && r.inh.vanishedIds) || []) vanAll.push(`${r.seed}:${id}`);
  const vanD3 = [];
  for (const r of recs) if (r.inhD3) for (const x of r.inhD3.disposition.filter(y => y.vanished)) vanD3.push(`${r.seed}:${x.id}`);
  console.log(`scripted seeds with full dead-bearer side: ${scr.length}/${recs.length}`);
  console.log(`vanished@handoff: ${vanAll.length ? vanAll.join(', ') : 'none'}`);
  console.log(`vanished@d+3: ${vanD3.length ? vanD3.join(', ') : 'none'}`);
}


console.log('\n== REL SUCCESSOR RELATIONSHIPS + HISTORY (r55 headline) ==');
// relPre = morning before death day (organic: up-to-a-day lag, named);
// relPreDeath = same-day snapshot before a scripted kill (no lag).
// Successor vid = relPost.selfId; dead bearer vid = relPreDeath.selfId
// (scripted) or relPre.selfId (organic, lagged but the bearer at that
// morning — the phase-A loop's bearer before detection).
function relSuccBonds(snap, succId) {
  if (!snap) return [];
  return (snap.bonds || []).filter(b => b.a === succId || b.b === succId).map(b => ({
    partner: b.a === succId ? b.b : b.a,
    partnerName: b.a === succId ? b.bName : b.aName,
    v: b.v, depth: b.depth, key: b.key }));
}
function relDeadBonds(snap, deadId) {
  if (!snap || !deadId) return [];
  return (snap.bonds || []).filter(b => b.a === deadId || b.b === deadId);
}
function relTop(bonds) {
  if (!bonds.length) return null;
  const s = [...bonds].sort((x, y) => (y.depth - x.depth) || (y.v - x.v));
  return s[0];
}
for (const r of recs) {
  const d = r.death || {};
  const succId = r.relPost && r.relPost.selfId;
  const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
  const pre = r.relPreDeath || r.relPre || null; // scripted: same-day; organic: lagged morning
  const preB = relSuccBonds(pre, succId);
  const postB = relSuccBonds(r.relPost, succId);
  const d14B = relSuccBonds(r.relD14, succId);
  const endB = relSuccBonds(r.relEnd, succId);
  const preKeys = new Set(preB.map(b => b.key));
  const survivedPost = postB.filter(b => preKeys.has(b.key)).length;
  const survivedEnd = endB.filter(b => preKeys.has(b.key)).length;
  const deadPre = relDeadBonds(pre, deadId).length;
  const deadPost = relDeadBonds(r.relPost, deadId).length;
  const deadEnd = relDeadBonds(r.relEnd, deadId).length;
  const groupsWith = (snap) => (snap && snap.groups || []).filter(g => (g.members || []).includes(succId)).length;
  const confWith = (snap) => (snap && snap.conflicts || []).filter(c => (c.a === succId || c.b === succId) && !c.resolved).length;
  const grievWith = (snap) => (snap && snap.grievances || []).filter(g => g.by === succId || g.against === succId).length;
  const pd = (snap) => (snap && snap.personDeeds && snap.personDeeds[succId]) || null;
  const cxN = (snap) => (snap && snap.codexDeeds || []).filter(x => x.vid === succId).length;
  const affTop = (snap) => {
    if (!snap || !snap.affinity || !snap.affinity[succId]) return null;
    const row = snap.affinity[succId];
    let best = null;
    for (const oid of Object.keys(row)) {
      if (best == null || row[oid] > best.score) best = { partner: (snap.affinityNames || {})[oid] || oid, score: row[oid] };
    }
    return best;
  };
  const tPre = relTop(preB), tPost = relTop(postB), tEnd = relTop(endB);
  console.log(`seed ${r.seed}: ${d.oldFirst} -> ${d.newFirst} scripted=${!!d.scripted} relPre=${pre ? (r.relPreDeath ? 'same-day' : 'lagged-morning') : 'MISSING'} relPost=${!!r.relPost} relD14=${!!r.relD14} relEnd=${!!r.relEnd}`);
  console.log(`  succBonds: pre=${preB.length} post=${postB.length} (survived=${survivedPost}) d14=${d14B.length} end=${endB.length} (survived=${survivedEnd})`);
  console.log(`  topBond: pre=${tPre ? tPre.partnerName + ' depth=' + tPre.depth + ' v=' + tPre.v : 'none'} post=${tPost ? tPost.partnerName + ' depth=' + tPost.depth + ' v=' + tPost.v : 'none'} end=${tEnd ? tEnd.partnerName + ' depth=' + tEnd.depth + ' v=' + tEnd.v : 'none'}`);
  console.log(`  deadBearerBonds (phantom check): pre=${deadPre} post=${deadPost} end=${deadEnd}`);
  console.log(`  groupsWithSucc: pre=${groupsWith(pre)} post=${groupsWith(r.relPost)} end=${groupsWith(r.relEnd)} | conflicts: pre=${confWith(pre)} post=${confWith(r.relPost)} end=${confWith(r.relEnd)} | grievances: pre=${grievWith(pre)} post=${grievWith(r.relPost)} end=${grievWith(r.relEnd)}`);
  const pdPre = pd(pre), pdPost = pd(r.relPost), pdEnd = pd(r.relEnd);
  console.log(`  personDeeds succ: pre=${pdPre ? (pdPre.noEntry ? 'NO-ENTRY' : pdPre.count + (pdPre.closed ? ' CLOSED' : '')) : 'snap-missing'} post=${pdPost ? (pdPost.noEntry ? 'NO-ENTRY' : pdPost.count + (pdPost.closed ? ' CLOSED' : '')) : 'snap-missing'} end=${pdEnd ? (pdEnd.noEntry ? 'NO-ENTRY' : pdEnd.count + (pdEnd.closed ? ' CLOSED' : '')) : 'snap-missing'}`);
  if (pdPre && pdPre.deeds) for (const x of pdPre.deeds.slice(0, 4)) console.log(`    pre-deed: ${x.text.slice(0, 120)} (d${x.day})`);
  console.log(`  codexDeeds rows for succ: pre=${cxN(pre)} post=${cxN(r.relPost)} (end roll-off-prone, cap 40: end=${cxN(r.relEnd)})`);
  console.log(`  affinity top: pre=${JSON.stringify(affTop(pre))} post=${JSON.stringify(affTop(r.relPost))} end=${JSON.stringify(affTop(r.relEnd))}`);
  const bondConvos = (r.convoReads || []).filter(c => c.bond);
  console.log(`  bond convos: ${bondConvos.length} ${JSON.stringify(bondConvos.map(c => 'd+' + c.dplus + ' ' + c.vid + ' depth=' + c.bondDepth + ' refused=' + c.refused))}`);
}
console.log('\n== REL POOLED ==');
{
  let survPost = 0, preTot = 0, phantomEnd = 0, phantomPost = 0;
  for (const r of recs) {
    const succId = r.relPost && r.relPost.selfId;
    const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
    const pre = r.relPreDeath || r.relPre || null;
    const preB = relSuccBonds(pre, succId);
    const postB = relSuccBonds(r.relPost, succId);
    const preKeys = new Set(preB.map(b => b.key));
    survPost += postB.filter(b => preKeys.has(b.key)).length; preTot += preB.length;
    phantomPost += relDeadBonds(r.relPost, deadId).length;
    phantomEnd += relDeadBonds(r.relEnd, deadId).length;
  }
  console.log(`successor bonds survived to handoff: ${survPost}/${preTot} | dead-bearer bonds lingering post=${phantomPost} end=${phantomEnd}`);
}

console.log('\n== CHAIN SECOND HANDOFF (r64 headline) ==');
function inh2Class(r) {
  const i2 = r.inh2 || {};
  if (!i2.readable) return 'unreadable';
  const pre = i2.succ2Pre || {};
  const post = i2.succ2Post || {};
  const ded = (a) => [...new Set(a || [])];
  const postInv = ded(((post.inv && post.inv.pack) || []).concat((post.inv && post.inv.worn) || []));
  const preInv = ded((pre.invPack || []).concat(pre.invWorn || []));
  const preHad = preInv.length > 0 || (pre.plantKnow || []).length > 0 || (pre.skills || []).length > 0;
  const keptInv = postInv.filter(x => preInv.includes(x)).length;
  const kept = (i2.keptPlants || []).length + (i2.keptSkills || []).length + keptInv;
  const got = (i2.inheritedPlants || []).length + (i2.inheritedSkills || []).length + (i2.transferredIds || []).length;
  if (postInv.length === 0 && (post.codexPlants || []).length === 0 && (post.codexSkills || []).length === 0 && preHad) return 'blank/reset';
  if (got > 0 && kept === 0) return 'inherited';
  if (kept > 0 && got === 0) return 'own-life';
  return 'mixed';
}
for (const r of recs) {
  const d = r.death || {};
  const sd = r.secondDeath || null;
  const succ1Id = r.relPost && r.relPost.selfId;
  const succ2Id = r.relPost2 && r.relPost2.selfId;
  const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
  const pre2 = r.relPreDeath2 || null;
  const post2 = r.relPost2 || null;
  const pre2B = relSuccBonds(pre2, succ2Id);
  const post2B = relSuccBonds(post2, succ2Id);
  const pre2Keys = new Set(pre2B.map(b => b.key));
  const surv2 = post2B.filter(b => pre2Keys.has(b.key)).length;
  const tPre2 = relTop(pre2B), tPost2 = relTop(post2B);
  let affDiff = null;
  if (pre2 && post2 && pre2.affinity && post2.affinity && succ2Id && pre2.affinity[succ2Id] && post2.affinity[succ2Id]) {
    affDiff = 0;
    for (const oid of Object.keys(post2.affinity[succ2Id])) {
      if (pre2.affinity[succ2Id][oid] !== post2.affinity[succ2Id][oid]) affDiff++;
    }
  }
  const succ1End = relDeadBonds(r.relEnd, succ1Id).length;
  const deadEnd = relDeadBonds(r.relEnd, deadId).length;
  const origEndB = relSuccBonds(r.relEnd, r.relEndOrigId || succ1Id);
  const finalEndB = relSuccBonds(r.relEnd, r.relEndFinalId || (r.relEnd && r.relEnd.selfId));
  const grievAfter2 = sd ? ((r.relEnd && r.relEnd.grievances) || []).filter(g => (g.by === succ1Id || g.against === succ1Id) && (g.day || 0) > sd.day).length : null;
  const i2 = r.inh2 || {};
  const forced = [26151, 26152, 26153].includes(r.seed);
  console.log(`seed ${r.seed}${forced ? ' FORCED' : ' control'}: ${d.oldFirst} -> ${d.newFirst} -> ${sd ? sd.newFirst : '(no second)'} secondDeath=${sd ? 'd+' + sd.dplus + ' lin=' + sd.linOk + ' mo=' + sd.moOk : 'ABSENT'} relPre2=${!!pre2} relPost2=${!!post2} origEndId=${r.relEndOrigId ? 'set' : 'MISSING'} finalEndId=${r.relEndFinalId ? 'set' : 'MISSING'}`);
  if (sd) {
    console.log(`  succ2Bonds: pre2=${pre2B.length} post2=${post2B.length} (survived=${surv2}) topPre2=${tPre2 ? tPre2.partnerName + ' depth=' + tPre2.depth + ' v=' + tPre2.v : 'none'} topPost2=${tPost2 ? tPost2.partnerName + ' depth=' + tPost2.depth + ' v=' + tPost2.v : 'none'} affinityDiff=${affDiff}`);
    console.log(`  succ1PhantomAtEnd=${succ1End} bearer0PhantomAtEnd=${deadEnd} grievAgainstSucc1After2ndDeath=${grievAfter2}`);
    console.log(`  inh2: class=${inh2Class(r)} keptPlants=${(i2.keptPlants || []).length} inheritedPlants=${(i2.inheritedPlants || []).length} keptSkills=${(i2.keptSkills || []).length} inheritedSkills=${(i2.inheritedSkills || []).length} transferred=${(i2.transferredIds || []).length} vanished=${JSON.stringify(i2.vanishedIds || [])}`);
  }
  console.log(`  dualEnd: origSuccBondsAtEnd=${origEndB.length} finalBearerBondsAtEnd=${finalEndB.length} (r55 mixed these; r64 reports both)`);
  const chainTags = (r.chainDeaths || []).map(c => `${c.deadFirst}->${c.newFirst} scriptedSecond=${!!c.scriptedSecond} scriptedThird=${!!c.scriptedThird} known=${!!c.causeKnown}`).join(' | ');
  console.log(`  chains: ${chainTags || 'none'}`);
}
console.log('\n== CHAIN POOLED ==');
{
  let surv2T = 0, pre2T = 0, phantom1 = 0, forcedWith2nd = 0, forcedN = 0;
  for (const r of recs) {
    if (![26151, 26152, 26153].includes(r.seed)) continue;
    forcedN++;
    if (!r.secondDeath) continue;
    forcedWith2nd++;
    const succ2Id = r.relPost2 && r.relPost2.selfId;
    const succ1Id = r.relPost && r.relPost.selfId;
    const pre2B = relSuccBonds(r.relPreDeath2, succ2Id);
    const post2B = relSuccBonds(r.relPost2, succ2Id);
    const pre2Keys = new Set(pre2B.map(b => b.key));
    surv2T += post2B.filter(b => pre2Keys.has(b.key)).length; pre2T += pre2B.length;
    phantom1 += relDeadBonds(r.relEnd, succ1Id).length;
  }
  console.log(`forced seeds with a recorded second handoff: ${forcedWith2nd}/${forcedN} | second-successor bonds survived: ${surv2T}/${pre2T} | first-successor phantom bonds at end (forced seeds): ${phantom1}`);
}



console.log('\n== CHAIN THIRD HANDOFF (r79 headline) ==');
function inh3Class(r) {
  const i3 = r.inh3 || {};
  if (!i3.readable) return 'unreadable';
  const pre = i3.succ3Pre || {};
  const post = i3.succ3Post || {};
  const ded = (a) => [...new Set(a || [])];
  const postInv = ded(((post.inv && post.inv.pack) || []).concat((post.inv && post.inv.worn) || []));
  const preInv = ded((pre.invPack || []).concat(pre.invWorn || []));
  const preHad = preInv.length > 0 || (pre.plantKnow || []).length > 0 || (pre.skills || []).length > 0;
  const keptInv = postInv.filter(x => preInv.includes(x)).length;
  const kept = (i3.keptPlants || []).length + (i3.keptSkills || []).length + keptInv;
  const got = (i3.inheritedPlants || []).length + (i3.inheritedSkills || []).length + (i3.transferredIds || []).length;
  if (postInv.length === 0 && (post.codexPlants || []).length === 0 && (post.codexSkills || []).length === 0 && preHad) return 'blank/reset';
  if (got > 0 && kept === 0) return 'inherited';
  if (kept > 0 && got === 0) return 'own-life';
  return 'mixed';
}
for (const r of recs) {
  const d = r.death || {};
  const sd = r.secondDeath || null;
  const td = r.thirdDeath || null;
  const succ1Id = r.relPost && r.relPost.selfId;
  const succ2Id = r.relPost2 && r.relPost2.selfId;
  const succ3Id = r.relPost3 && r.relPost3.selfId;
  const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
  const pre3 = r.relPreDeath3 || null;
  const post3 = r.relPost3 || null;
  const pre3B = relSuccBonds(pre3, succ3Id);
  const post3B = relSuccBonds(post3, succ3Id);
  const pre3Keys = new Set(pre3B.map(b => b.key));
  const surv3 = post3B.filter(b => pre3Keys.has(b.key)).length;
  const tPre3 = relTop(pre3B), tPost3 = relTop(post3B);
  let affDiff3 = null;
  if (pre3 && post3 && pre3.affinity && post3.affinity && succ3Id && pre3.affinity[succ3Id] && post3.affinity[succ3Id]) {
    affDiff3 = 0;
    for (const oid of Object.keys(post3.affinity[succ3Id])) {
      if (pre3.affinity[succ3Id][oid] !== post3.affinity[succ3Id][oid]) affDiff3++;
    }
  }
  const origPhantom = relDeadBonds(r.relEnd, deadId).length;
  const succ1Phantom = relDeadBonds(r.relEnd, succ1Id).length;
  const succ2Phantom = relDeadBonds(r.relEnd, succ2Id).length;
  const grievAfter3 = td ? ((r.relEnd && r.relEnd.grievances) || []).filter(g => (g.by === succ2Id || g.against === succ2Id) && (g.day || 0) > td.day).length : null;
  const i3 = r.inh3 || {};
  const forced = [26151, 26152, 26153].includes(r.seed);
  console.log(`seed ${r.seed}${forced ? ' FORCED' : ' control'}: ${d.oldFirst} -> ${d.newFirst} -> ${sd ? sd.newFirst : '(no second)'} -> ${td ? td.newFirst : '(no third)'} thirdDeath=${td ? 'd+' + td.dplus + ' since2nd, d+' + td.dplusFirst + ' since1st, lin=' + td.linOk + ' mo=' + td.moOk : 'ABSENT'} relPre3=${!!pre3} relPost3=${!!post3}`);
  if (td) {
    console.log(`  succ3Bonds: pre3=${pre3B.length} post3=${post3B.length} (survived=${surv3}) topPre3=${tPre3 ? tPre3.partnerName + ' depth=' + tPre3.depth + ' v=' + tPre3.v : 'none'} topPost3=${tPost3 ? tPost3.partnerName + ' depth=' + tPost3.depth + ' v=' + tPost3.v : 'none'} affinityDiff3=${affDiff3}`);
    console.log(`  phantomsAtEnd: origBearer=${origPhantom} succ1=${succ1Phantom} succ2=${succ2Phantom} grievAgainstSucc2After3rdDeath=${grievAfter3}`);
    console.log(`  inh3: class=${inh3Class(r)} keptPlants=${(i3.keptPlants || []).length} inheritedPlants=${(i3.inheritedPlants || []).length} keptSkills=${(i3.keptSkills || []).length} inheritedSkills=${(i3.inheritedSkills || []).length} transferred=${(i3.transferredIds || []).length} vanished=${JSON.stringify(i3.vanishedIds || [])}`);
  }
  const origEndB = relSuccBonds(r.relEnd, r.relEndOrigId || succ1Id);
  const secondEndB = relSuccBonds(r.relEnd, succ2Id);
  const finalEndB = relSuccBonds(r.relEnd, r.relEndFinalId || (r.relEnd && r.relEnd.selfId));
  console.log(`  tripleEnd: origSuccBondsAtEnd=${origEndB.length} secondSuccBondsAtEnd=${secondEndB.length} finalBearerBondsAtEnd=${finalEndB.length} (r79 reports all three; r64 reported two)`);
  const chainTags3 = (r.chainDeaths || []).map(c => `${c.deadFirst}->${c.newFirst} scriptedSecond=${!!c.scriptedSecond} scriptedThird=${!!c.scriptedThird} known=${!!c.causeKnown}`).join(' | ');
  console.log(`  chains: ${chainTags3 || 'none'}`);
}
console.log('\n== CHAIN3 POOLED ==');
{
  let surv3T = 0, pre3T = 0, phOrig = 0, phS1 = 0, phS2 = 0, forcedWith3rd = 0, forcedN = 0;
  for (const r of recs) {
    if (![26151, 26152, 26153].includes(r.seed)) continue;
    forcedN++;
    if (!r.thirdDeath) continue;
    forcedWith3rd++;
    const succ3Id = r.relPost3 && r.relPost3.selfId;
    const succ1Id = r.relPost && r.relPost.selfId;
    const succ2Id = r.relPost2 && r.relPost2.selfId;
    const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
    const pre3B = relSuccBonds(r.relPreDeath3, succ3Id);
    const post3B = relSuccBonds(r.relPost3, succ3Id);
    const pre3Keys = new Set(pre3B.map(b => b.key));
    surv3T += post3B.filter(b => pre3Keys.has(b.key)).length; pre3T += pre3B.length;
    phOrig += relDeadBonds(r.relEnd, deadId).length;
    phS1 += relDeadBonds(r.relEnd, succ1Id).length;
    phS2 += relDeadBonds(r.relEnd, succ2Id).length;
  }
  console.log(`forced seeds with a recorded third handoff: ${forcedWith3rd}/${forcedN} | third-successor bonds survived: ${surv3T}/${pre3T} | phantom bonds at end (forced seeds): origBearer=${phOrig} succ1=${phS1} succ2=${phS2}`);
}

console.log('\n== CHAIN4 (r79 headline) ==');
function inh4Class(r) {
  const i4 = r.inh4 || {};
  if (!i4.readable) return 'unreadable';
  const pre = i4.succ4Pre || {};
  const post = i4.succ4Post || {};
  const ded = (a) => [...new Set(a || [])];
  const postInv = ded(((post.inv && post.inv.pack) || []).concat((post.inv && post.inv.worn) || []));
  const preInv = ded((pre.invPack || []).concat(pre.invWorn || []));
  const preHad = preInv.length > 0 || (pre.plantKnow || []).length > 0 || (pre.skills || []).length > 0;
  const keptInv = postInv.filter(x => preInv.includes(x)).length;
  const kept = (i4.keptPlants || []).length + (i4.keptSkills || []).length + keptInv;
  const got = (i4.inheritedPlants || []).length + (i4.inheritedSkills || []).length + (i4.transferredIds || []).length;
  if (postInv.length === 0 && (post.codexPlants || []).length === 0 && (post.codexSkills || []).length === 0 && preHad) return 'blank/reset';
  if (got > 0 && kept === 0) return 'inherited';
  if (kept > 0 && got === 0) return 'own-life';
  return 'mixed';
}
for (const r of recs) {
  const d = r.death || {};
  const sd = r.secondDeath || null;
  const td = r.thirdDeath || null;
  const fd = r.fourthDeath || null;
  const succ1Id = r.relPost && r.relPost.selfId;
  const succ2Id = r.relPost2 && r.relPost2.selfId;
  const succ3Id = r.relPost3 && r.relPost3.selfId;
  const succ4Id = r.relPost4 && r.relPost4.selfId;
  const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
  const pre4 = r.relPreDeath4 || null;
  const post4 = r.relPost4 || null;
  const pre4B = relSuccBonds(pre4, succ4Id);
  const post4B = relSuccBonds(post4, succ4Id);
  const pre4Keys = new Set(pre4B.map(b => b.key));
  const surv4 = post4B.filter(b => pre4Keys.has(b.key)).length;
  const tPre4 = relTop(pre4B), tPost4 = relTop(post4B);
  let affDiff4 = null;
  if (pre4 && post4 && pre4.affinity && post4.affinity && succ4Id && pre4.affinity[succ4Id] && post4.affinity[succ4Id]) {
    affDiff4 = 0;
    for (const oid of Object.keys(post4.affinity[succ4Id])) {
      if (pre4.affinity[succ4Id][oid] !== post4.affinity[succ4Id][oid]) affDiff4++;
    }
  }
  const origPhantom = relDeadBonds(r.relEnd, deadId).length;
  const succ1Phantom = relDeadBonds(r.relEnd, succ1Id).length;
  const succ2Phantom = relDeadBonds(r.relEnd, succ2Id).length;
  const succ3Phantom = relDeadBonds(r.relEnd, succ3Id).length;
  const grievAfter4 = fd ? ((r.relEnd && r.relEnd.grievances) || []).filter(g => (g.by === succ3Id || g.against === succ3Id) && (g.day || 0) > fd.day).length : null;
  const i4 = r.inh4 || {};
  const forced = [26151, 26152, 26153].includes(r.seed);
  console.log(`seed ${r.seed}${forced ? ' FORCED' : ' control'}: ${d.oldFirst} -> ${d.newFirst} -> ${sd ? sd.newFirst : '(no second)'} -> ${td ? td.newFirst : '(no third)'} -> ${fd ? fd.newFirst : '(no fourth)'} fourthDeath=${fd ? 'd+' + fd.dplus + ' since3rd, d+' + fd.dplusSecond + ' since2nd, d+' + fd.dplusFirst + ' since1st, lin=' + fd.linOk + ' mo=' + fd.moOk : 'ABSENT'} relPre4=${!!pre4} relPost4=${!!post4}`);
  if (fd) {
    console.log(`  succ4Bonds: pre4=${pre4B.length} post4=${post4B.length} (survived=${surv4}) topPre4=${tPre4 ? tPre4.partnerName + ' depth=' + tPre4.depth + ' v=' + tPre4.v : 'none'} topPost4=${tPost4 ? tPost4.partnerName + ' depth=' + tPost4.depth + ' v=' + tPost4.v : 'none'} affinityDiff4=${affDiff4}`);
    console.log(`  phantomsAtEnd: origBearer=${origPhantom} succ1=${succ1Phantom} succ2=${succ2Phantom} succ3=${succ3Phantom} grievAgainstSucc3After4thDeath=${grievAfter4}`);
    console.log(`  inh4: class=${inh4Class(r)} keptPlants=${(i4.keptPlants || []).length} inheritedPlants=${(i4.inheritedPlants || []).length} keptSkills=${(i4.keptSkills || []).length} inheritedSkills=${(i4.inheritedSkills || []).length} transferred=${(i4.transferredIds || []).length} vanished=${JSON.stringify(i4.vanishedIds || [])}`);
  }
  const origEndB = relSuccBonds(r.relEnd, r.relEndOrigId || succ1Id);
  const secondEndB = relSuccBonds(r.relEnd, succ2Id);
  const thirdEndB = relSuccBonds(r.relEnd, succ3Id);
  const finalEndB = relSuccBonds(r.relEnd, r.relEndFinalId || (r.relEnd && r.relEnd.selfId));
  console.log(`  quadEnd: origSuccBondsAtEnd=${origEndB.length} secondSuccBondsAtEnd=${secondEndB.length} thirdSuccBondsAtEnd=${thirdEndB.length} finalBearerBondsAtEnd=${finalEndB.length}`);
  const chainTags4 = (r.chainDeaths || []).map(c => `${c.deadFirst}->${c.newFirst} scriptedSecond=${!!c.scriptedSecond} scriptedThird=${!!c.scriptedThird} scriptedFourth=${!!c.scriptedFourth} known=${!!c.causeKnown}`).join(' | ');
  console.log(`  chains: ${chainTags4 || 'none'}`);
}
console.log('\n== CHAIN4 POOLED ==');
{
  let surv4T = 0, pre4T = 0, phOrig = 0, phS1 = 0, phS2 = 0, phS3 = 0, forcedWith4th = 0, forcedN = 0;
  for (const r of recs) {
    if (![26151, 26152, 26153].includes(r.seed)) continue;
    forcedN++;
    if (!r.fourthDeath) continue;
    forcedWith4th++;
    const succ4Id = r.relPost4 && r.relPost4.selfId;
    const succ1Id = r.relPost && r.relPost.selfId;
    const succ2Id = r.relPost2 && r.relPost2.selfId;
    const succ3Id = r.relPost3 && r.relPost3.selfId;
    const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
    const pre4B = relSuccBonds(r.relPreDeath4, succ4Id);
    const post4B = relSuccBonds(r.relPost4, succ4Id);
    const pre4Keys = new Set(pre4B.map(b => b.key));
    surv4T += post4B.filter(b => pre4Keys.has(b.key)).length; pre4T += pre4B.length;
    phOrig += relDeadBonds(r.relEnd, deadId).length;
    phS1 += relDeadBonds(r.relEnd, succ1Id).length;
    phS2 += relDeadBonds(r.relEnd, succ2Id).length;
    phS3 += relDeadBonds(r.relEnd, succ3Id).length;
  }
  console.log(`forced seeds with a recorded fourth handoff: ${forcedWith4th}/${forcedN} | fourth-successor bonds survived: ${surv4T}/${pre4T} | phantom bonds at end (forced seeds): origBearer=${phOrig} succ1=${phS1} succ2=${phS2} succ3=${phS3}`);
}

console.log('\n== CHAIN5 (r83 headline) ==');
function inh5Class(r) {
  const i5 = r.inh5 || {};
  if (!i5.readable) return 'unreadable';
  const pre = i5.succ5Pre || {};
  const post = i5.succ5Post || {};
  const ded = (a) => [...new Set(a || [])];
  const postInv = ded(((post.inv && post.inv.pack) || []).concat((post.inv && post.inv.worn) || []));
  const preInv = ded((pre.invPack || []).concat(pre.invWorn || []));
  const preHad = preInv.length > 0 || (pre.plantKnow || []).length > 0 || (pre.skills || []).length > 0;
  const keptInv = postInv.filter(x => preInv.includes(x)).length;
  const kept = (i5.keptPlants || []).length + (i5.keptSkills || []).length + keptInv;
  const got = (i5.inheritedPlants || []).length + (i5.inheritedSkills || []).length + (i5.transferredIds || []).length;
  if (postInv.length === 0 && (post.codexPlants || []).length === 0 && (post.codexSkills || []).length === 0 && preHad) return 'blank/reset';
  if (got > 0 && kept === 0) return 'inherited';
  if (kept > 0 && got === 0) return 'own-life';
  return 'mixed';
}
for (const r of recs) {
  const d = r.death || {};
  const sd = r.secondDeath || null;
  const td = r.thirdDeath || null;
  const fd = r.fourthDeath || null;
  const fid = r.fifthDeath || null;
  const succ1Id = r.relPost && r.relPost.selfId;
  const succ2Id = r.relPost2 && r.relPost2.selfId;
  const succ3Id = r.relPost3 && r.relPost3.selfId;
  const succ4Id = r.relPost4 && r.relPost4.selfId;
  const succ5Id = r.relPost5 && r.relPost5.selfId;
  const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
  const pre5 = r.relPreDeath5 || null;
  const post5 = r.relPost5 || null;
  const pre5B = relSuccBonds(pre5, succ5Id);
  const post5B = relSuccBonds(post5, succ5Id);
  const pre5Keys = new Set(pre5B.map(b => b.key));
  const surv5 = post5B.filter(b => pre5Keys.has(b.key)).length;
  const tPre5 = relTop(pre5B), tPost5 = relTop(post5B);
  let affDiff5 = null;
  if (pre5 && post5 && pre5.affinity && post5.affinity && succ5Id && pre5.affinity[succ5Id] && post5.affinity[succ5Id]) {
    affDiff5 = 0;
    for (const oid of Object.keys(post5.affinity[succ5Id])) {
      if (pre5.affinity[succ5Id][oid] !== post5.affinity[succ5Id][oid]) affDiff5++;
    }
  }
  const origPhantom = relDeadBonds(r.relEnd, deadId).length;
  const succ1Phantom = relDeadBonds(r.relEnd, succ1Id).length;
  const succ2Phantom = relDeadBonds(r.relEnd, succ2Id).length;
  const succ3Phantom = relDeadBonds(r.relEnd, succ3Id).length;
  const succ4Phantom = relDeadBonds(r.relEnd, succ4Id).length;
  const grievAfter5 = fid ? ((r.relEnd && r.relEnd.grievances) || []).filter(g => (g.by === succ4Id || g.against === succ4Id) && (g.day || 0) > fid.day).length : null;
  const i5 = r.inh5 || {};
  const forced = [26151, 26152, 26153].includes(r.seed);
  console.log(`seed ${r.seed}${forced ? ' FORCED' : ' control'}: ${d.oldFirst} -> ${d.newFirst} -> ${sd ? sd.newFirst : '(no second)'} -> ${td ? td.newFirst : '(no third)'} -> ${fd ? fd.newFirst : '(no fourth)'} -> ${fid ? fid.newFirst : '(no fifth)'} fifthDeath=${fid ? 'd+' + fid.dplus + ' since4th, d+' + fid.dplusThird + ' since3rd, d+' + fid.dplusSecond + ' since2nd, d+' + fid.dplusFirst + ' since1st, lin=' + fid.linOk + ' mo=' + fid.moOk : 'ABSENT'} relPre5=${!!pre5} relPost5=${!!post5}`);
  if (fid) {
    console.log(`  succ5Bonds: pre5=${pre5B.length} post5=${post5B.length} (survived=${surv5}) topPre5=${tPre5 ? tPre5.partnerName + ' depth=' + tPre5.depth + ' v=' + tPre5.v : 'none'} topPost5=${tPost5 ? tPost5.partnerName + ' depth=' + tPost5.depth + ' v=' + tPost5.v : 'none'} affinityDiff5=${affDiff5}`);
    console.log(`  phantomsAtEnd: origBearer=${origPhantom} succ1=${succ1Phantom} succ2=${succ2Phantom} succ3=${succ3Phantom} succ4=${succ4Phantom} grievAgainstSucc4After5thDeath=${grievAfter5}`);
    console.log(`  inh5: class=${inh5Class(r)} keptPlants=${(i5.keptPlants || []).length} inheritedPlants=${(i5.inheritedPlants || []).length} keptSkills=${(i5.keptSkills || []).length} inheritedSkills=${(i5.inheritedSkills || []).length} transferred=${(i5.transferredIds || []).length} vanished=${JSON.stringify(i5.vanishedIds || [])}`);
  }
  const origEndB = relSuccBonds(r.relEnd, r.relEndOrigId || succ1Id);
  const secondEndB = relSuccBonds(r.relEnd, succ2Id);
  const thirdEndB = relSuccBonds(r.relEnd, succ3Id);
  const fourthEndB = relSuccBonds(r.relEnd, succ4Id);
  const finalEndB = relSuccBonds(r.relEnd, r.relEndFinalId || (r.relEnd && r.relEnd.selfId));
  console.log(`  quintEnd: origSuccBondsAtEnd=${origEndB.length} secondSuccBondsAtEnd=${secondEndB.length} thirdSuccBondsAtEnd=${thirdEndB.length} fourthSuccBondsAtEnd=${fourthEndB.length} finalBearerBondsAtEnd=${finalEndB.length}`);
  const chainTags5 = (r.chainDeaths || []).map(c => `${c.deadFirst}->${c.newFirst} scriptedSecond=${!!c.scriptedSecond} scriptedThird=${!!c.scriptedThird} scriptedFourth=${!!c.scriptedFourth} scriptedFifth=${!!c.scriptedFifth} known=${!!c.causeKnown}`).join(' | ');
  console.log(`  chains: ${chainTags5 || 'none'}`);
}
console.log('\n== CHAIN5 POOLED ==');
{
  let surv5T = 0, pre5T = 0, phOrig = 0, phS1 = 0, phS2 = 0, phS3 = 0, phS4 = 0, forcedWith5th = 0, forcedN = 0;
  for (const r of recs) {
    if (![26151, 26152, 26153].includes(r.seed)) continue;
    forcedN++;
    if (!r.fifthDeath) continue;
    forcedWith5th++;
    const succ5Id = r.relPost5 && r.relPost5.selfId;
    const succ1Id = r.relPost && r.relPost.selfId;
    const succ2Id = r.relPost2 && r.relPost2.selfId;
    const succ3Id = r.relPost3 && r.relPost3.selfId;
    const succ4Id = r.relPost4 && r.relPost4.selfId;
    const deadId = (r.relPreDeath && r.relPreDeath.selfId) || (r.relPre && r.relPre.selfId) || null;
    const pre5B = relSuccBonds(r.relPreDeath5, succ5Id);
    const post5B = relSuccBonds(r.relPost5, succ5Id);
    const pre5Keys = new Set(pre5B.map(b => b.key));
    surv5T += post5B.filter(b => pre5Keys.has(b.key)).length; pre5T += pre5B.length;
    phOrig += relDeadBonds(r.relEnd, deadId).length;
    phS1 += relDeadBonds(r.relEnd, succ1Id).length;
    phS2 += relDeadBonds(r.relEnd, succ2Id).length;
    phS3 += relDeadBonds(r.relEnd, succ3Id).length;
    phS4 += relDeadBonds(r.relEnd, succ4Id).length;
  }
  console.log(`forced seeds with a recorded fifth handoff: ${forcedWith5th}/${forcedN} | fifth-successor bonds survived: ${surv5T}/${pre5T} | phantom bonds at end (forced seeds): origBearer=${phOrig} succ1=${phS1} succ2=${phS2} succ3=${phS3} succ4=${phS4}`);
}

console.log('\n== V1 VOUCH SNAPSHOT (mature seeds first: eligibleAtDeath > 0) ==');
const byElig = [...recs].sort((a, b) => ((b.vouch45 && b.vouch45.eligibleAtDeath || []).length - (a.vouch45 && a.vouch45.eligibleAtDeath || []).length));
for (const r of byElig) {
  const v = r.vouch45 || {};
  console.log(`seed ${r.seed}: rule=${v.rule} verdict=${v.verdict} eligibleAtDeath=${JSON.stringify(v.eligibleAtDeath)} alivePostDeath=${JSON.stringify(v.alivePostDeath)} diedBetween=${JSON.stringify(v.diedBetween)} vouchLines=${v.vouchLines}`);
}
console.log('\n== C1v2 (DROPPED r51 — r50 was its final run; C1v3 below is the transition rule) ==');
console.log('\n== S1 BEARER-OWN DELTA (carried) ==');
for (const r of recs) {
  const calls = r.officeCallMoves || [];
  const tm = calls.filter(m => !m.bearerChanged);
  const solo = tm.filter(m => m.soloOffice);
  const single = tm.filter(m => (m.movers || []).length === 1);
  const singleBearer = single.filter(m => m.bearerIsMover);
  const singleOther = single.filter(m => !m.bearerIsMover);
  const badSolo = solo.filter(m => Math.abs(m.delta) > 2);
  const missing = tm.filter(m => typeof m.bearerDeltaExact !== 'number');
  console.log(`seed ${r.seed}: trustMoves=${tm.length} soloOffice=${solo.length} soloDeltas=${JSON.stringify(solo.map(m => m.delta))} badSolo(|d|>2)=${badSolo.length} missingExact=${missing.length}`);
  console.log(`  single-mover: bearer=${singleBearer.length} other=${singleOther.length} (other-mover singles: ${JSON.stringify(singleOther.slice(0, 6).map(m => ({ day: m.day, delta: m.delta, movers: m.movers })))} )`);
}
console.log('\n== E1b MOVER-NAMING CROSS-TAB (r48) ==');
for (const r of recs) {
  const tm = (r.officeCallMoves || []).filter(m => !m.bearerChanged);
  const cls = (m) => {
    const n = (m.movers || []).length;
    if (n === 0) return 'solo';
    if (n === 1) return 'single';
    const tot = (m.movers || []).reduce((a, x) => a + Math.abs(x.delta), 0);
    const top = Math.max(...(m.movers || []).map(x => Math.abs(x.delta)));
    return (tot > 0 && top / tot >= 0.5) ? 'concentrated' : 'diffuse';
  };
  const tab = {};
  for (const m of tm) { const k = cls(m) + '|' + (m.e1bClass || '?'); tab[k] = (tab[k] || 0) + 1; }
  console.log(`seed ${r.seed}: ${JSON.stringify(tab)}`);
  const diffuse = tm.filter(m => cls(m) === 'diffuse');
  console.log(`  diffuse moves: ${diffuse.length}, of which mover-named=${diffuse.filter(m => m.e1bClass === 'mover-named').length} unnamed=${diffuse.filter(m => m.e1bClass === 'unnamed').length}`);
  const conc = tm.filter(m => cls(m) === 'concentrated' || cls(m) === 'single');
  console.log(`  concentrated+single moves: ${conc.length}, of which mover-named=${conc.filter(m => m.e1bClass === 'mover-named').length} unnamed=${conc.filter(m => m.e1bClass === 'unnamed').length}`);
  const topNamed = tm.filter(m => m.topMoverNamed === true).length;
  const topUnnamed = tm.filter(m => m.topMoverNamed === false).length;
  console.log(`  top-mover named: ${topNamed}, top-mover unnamed: ${topUnnamed} (of ${tm.length} trust moves)`);
  for (const m of tm.slice(0, 12)) {
    console.log(`    d${m.day} d+${m.dplus} ${m.from}->${m.to} (${m.delta >= 0 ? '+' : ''}${m.delta}) movers=${JSON.stringify((m.movers || []).map(x => x.id + ':' + x.delta))} named=${JSON.stringify(m.moverNamedMovers)} topNamed=${m.topMoverNamed} e1b=${m.e1bClass} oldEvent=${m.eventClass}`);
  }
}
console.log('\n== E1 EVENT-VS-DEED (carried for continuity) ==');
for (const r of recs) {
  const tm = (r.officeCallMoves || []).filter(m => !m.bearerChanged);
  const ec = { 'event-only': 0, 'deed-only': 0, both: 0, neither: 0 };
  for (const m of tm) if (ec[m.eventClass] !== undefined) ec[m.eventClass]++;
  console.log(`seed ${r.seed}: ${JSON.stringify(ec)}`);
}
console.log('\n== A1 ARMOR INTRADAY MAPS (bark_armor counts per location) ==');
for (const r of recs) {
  const maps = r.armorMaps || [];
  console.log(`seed ${r.seed}: ${maps.length} snapshots`);
  let prev = null;
  for (const a of maps) {
    const b = a.map.bark || {};
    const counts = {};
    let total = 0;
    for (const l of ARMOR_LOCS) { counts[l] = (b[l] || []).length; total += counts[l]; }
    const locs = a.map.locs || {};
    let armorTotal = 0;
    for (const l of ARMOR_LOCS) armorTotal += (locs[l] || []).length;
    let deltaNote = '';
    if (prev) {
      const gains = [], losses = [];
      for (const l of ARMOR_LOCS) {
        const d = counts[l] - (prev.counts[l] || 0);
        if (d > 0) gains.push(`${l}+${d}`);
        if (d < 0) losses.push(`${l}${d}`);
      }
      const totD = total - prev.total;
      if (totD !== 0 || gains.length || losses.length) deltaNote = ` | bark total ${prev.total}->${total} gains[${gains.join(',')}] losses[${losses.join(',')}]` + (totD < 0 ? '  <-- UNACCOUNTED DROP' : totD > 0 ? '  <-- UNACCOUNTED GAIN' : '');
    }
    console.log(`  ${a.at} d${a.day}: barkTotal=${total} armorTotal=${armorTotal} ${JSON.stringify(counts)}${deltaNote}`);
    prev = { counts, total };
  }
  // Full armor (non-bark) detail on the post-handoff snapshot, if any.
  const ph = maps.find(a => a.at === 'post-handoff');
  if (ph) {
    const locs = ph.map.locs || {};
    const nonBark = {};
    for (const l of ARMOR_LOCS) nonBark[l] = (locs[l] || []).filter(id => id !== 'bark_armor');
    console.log(`  post-handoff non-bark armor: ${JSON.stringify(nonBark)}`);
  }
}
console.log('\n== C1v3 TRANSITION RULE (r49) ==');
for (const r of recs) {
  const v3 = r.callCheckV3 || {};
  console.log(`seed ${r.seed}: transitions=${v3.transitions} byCall=${v3.coveredByCall} byConvoPrev=${v3.coveredByConvoPrev} missing=${JSON.stringify(v3.missing)} ok=${v3.ok}`);
}
console.log('\n== MG2v2 MEAL-LINE ONLY (r49) ==');
for (const r of recs) {
  console.log(`seed ${r.seed}: mg2(old)=${r.mg2} (viol=${(r.mealGateViolations || []).length}) mg2v2=${r.mg2v2} (violMeal=${(r.mealGateViolationsMeal || []).length}) auditDays=${(r.mealAudit || []).length}`);
  for (const mv of (r.mealGateViolationsMeal || []).slice(0, 4)) console.log(`  MEAL-VIOL d+${mv.dplus}: ${mv.vid} trust=${mv.trust} kcal=${mv.kcal}`);
}
console.log('\n== A1v2 ARMOR HOLDER IDENTITY (r49) ==');
for (const r of recs) {
  const maps = r.armorMaps || [];
  const pre = maps.find(a => a.at === 'pre-death');
  const ph = maps.find(a => a.at === 'post-handoff');
  const show = (label, a) => {
    if (!a) { console.log(`seed ${r.seed} ${label}: (no snapshot)`); return; }
    const m = a.map || {};
    console.log(`seed ${r.seed} ${label} d${a.day}: barkHolders=${JSON.stringify(m.barkHolders || {})} barkCorpse=${JSON.stringify(m.barkCorpseHolders || {})} focusAccess=${JSON.stringify(m.focusAccess || null)}`);
  };
  show('pre-death', pre);
  show('post-handoff', ph);
  if (pre && ph) {
    const preB = pre.map.barkHolders || {}, phB = ph.map.barkHolders || {};
    const preC = pre.map.barkCorpseHolders || {}, phC = ph.map.barkCorpseHolders || {};
    const tot = (o) => Object.values(o).reduce((a, x) => a + (typeof x === 'number' ? x : (x.worn || 0) + (x.pack || 0)), 0);
    console.log(`  bark holder totals pre=${tot(preB)}+corpse${tot(preC)} post=${tot(phB)}+corpse${tot(phC)}`);
  }
}
console.log('\n== WRITER-SITE SPIKE (r49, exploratory) ==');
for (const r of recs) {
  const deedsByDay = {};
  for (const d of (r.deedLedger || [])) (deedsByDay[d.day] = deedsByDay[d.day] || []).push(d.deed);
  const tm = (r.officeCallMoves || []).filter(m => !m.bearerChanged);
  const withDeed = tm.filter(m => (deedsByDay[m.day] || []).length > 0);
  const noDeed = tm.filter(m => (deedsByDay[m.day] || []).length === 0);
  const deedNames = {};
  for (const m of withDeed) for (const dn of (deedsByDay[m.day] || [])) deedNames[dn] = (deedNames[dn] || 0) + 1;
  console.log(`seed ${r.seed}: trustMoves=${tm.length} withSameDayDeed=${withDeed.length} noSameDayDeed=${noDeed.length} deedNames=${JSON.stringify(deedNames)}`);
  for (const m of noDeed.slice(0, 6)) console.log(`  NO-DEED d${m.day} d+${m.dplus} ${m.from}->${m.to} (${m.delta >= 0 ? '+' : ''}${m.delta}) movers=${JSON.stringify((m.movers || []).map(x => x.id + ':' + x.delta))}`);
}
console.log('\n== W1 MUTATION-SITE CLASSIFICATION (r50) ==');
// Classify each C1v3 daily transition (officeDaily consecutive pairs) by
// its covering call/convo window: bump-explained (>=1 bump entry for the
// bearer or a mover in the window), deed-explained (deedLedger entry on
// the entry day, no bump), direct-candidate (mover, no bump entry in the
// window), unexplained (solo, no bump, no deed). W1b: bump share among
// the r49-style no-deed transitions.
for (const r of recs) {
  const daily = r.officeDaily || [];
  const callByDay = {};
  for (const m of (r.officeCallMoves || [])) (callByDay[m.day] = callByDay[m.day] || []).push(m);
  const convoByDay = {};
  for (const m of (r.convoWindowMoves || [])) (convoByDay[m.day] = convoByDay[m.day] || []).push(m);
  const deedDays = new Set((r.deedLedger || []).map(d => d.day));
  const handoffDays = new Set((r.officeCallMoves || []).filter(m => m.bearerChanged).map(m => m.day));
  const classes = { bump: 0, deed: 0, direct: 0, handoff: 0, unexplained: 0 };
  const noDeed = { total: 0, bump: 0 };
  const details = [];
  for (let i = 1; i < daily.length; i++) {
    if (daily[i].office === daily[i - 1].office) continue;
    const entryDay = daily[i].day, prevDay = daily[i - 1].day;
    const cover = ((callByDay[entryDay] || []).filter(m => !m.bearerChanged)[0])
      || ((convoByDay[prevDay] || [])[0]) || null;
    const bearer = daily[i].bearer;
    let cls = 'unexplained';
    let bumpWhy = [], moverIds = [];
    if (cover) {
      const bumps = cover.bumpEntries || [];
      moverIds = (cover.movers || []).map(x => x.id);
      const relevant = bumps.filter(b => b.vid === bearer || moverIds.includes(b.vid));
      bumpWhy = relevant.map(b => `${b.vid}:${b.delta}${b.reason ? '(' + b.reason + ')' : '(no-reason)'}`);
      if (relevant.length > 0) cls = 'bump';
      else if (moverIds.length > 0) cls = 'direct';
      else if (deedDays.has(entryDay)) cls = 'deed';
      else cls = 'unexplained';
    } else if (handoffDays.has(entryDay)) cls = 'handoff';
    else if (deedDays.has(entryDay)) cls = 'deed';
    classes[cls]++;
    if (!deedDays.has(entryDay)) { noDeed.total++; if (cls === 'bump') noDeed.bump++; }
    if (cls === 'handoff') { /* handoffs are inheritance entries, not trust moves */ }
    details.push({ entryDay, prevDay, from: daily[i - 1].office, to: daily[i].office, delta: daily[i].office - daily[i - 1].office, cls, cover: cover ? (cover.bumpEntries ? 'call' : 'convo') : 'none', bumpWhy: bumpWhy.slice(0, 6), movers: moverIds });
  }
  const w1b = noDeed.total ? Math.round((noDeed.bump / noDeed.total) * 100) / 100 : null;
  const noDeedMoves = details.filter(d => d.cls !== 'handoff' && !(r.deedLedger || []).some(x => x.day === d.entryDay));
  const noDeedMovesBump = noDeedMoves.filter(d => d.cls === 'bump').length;
  const w1bMoves = noDeedMoves.length ? Math.round((noDeedMovesBump / noDeedMoves.length) * 100) / 100 : null;
  console.log(`seed ${r.seed}: transitions=${details.length} classes=${JSON.stringify(classes)} noDeed=${noDeed.total} noDeedBump=${noDeed.bump} W1b(strict, incl handoffs)=${w1b} W1b(trust-moves only)=${w1bMoves} (noDeedMoves=${noDeedMoves.length} bump=${noDeedMovesBump}) bumpLogTotal=${(r.bumpLog || []).length} bumpWithReason=${(r.bumpLog || []).filter(b => b.reason != null).length}`);
  for (const d of details) {
    if (d.cls !== 'bump') console.log(`  NON-BUMP entryD${d.entryDay} ${d.from}->${d.to} (${d.delta >= 0 ? '+' : ''}${d.delta}) cls=${d.cls} cover=${d.cover} movers=${JSON.stringify(d.movers)} bumpWhy=${JSON.stringify(d.bumpWhy)}`);
  }
  const reasonCounts = {};
  for (const b of (r.bumpLog || [])) { const k = b.reason || '(no-reason)'; reasonCounts[k] = (reasonCounts[k] || 0) + 1; }
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  console.log(`  bump reasons (top 12): ${JSON.stringify(topReasons)}`);
  const siteCounts = {};
  for (const b of (r.bumpLog || [])) { const k = b.site || '(no-site)'; siteCounts[k] = (siteCounts[k] || 0) + 1; }
  console.log(`  bump sites (top 8): ${JSON.stringify(Object.entries(siteCounts).sort((a, b) => b[1] - a[1]).slice(0, 8))}`);
}

console.log('\n== W1d DONATION-JOIN (r53: TIGHTENED subset binds, POOLED headline) ==');
let poolTight = 0, poolTightDon = 0;
// Recompute each C1v3 daily transition with a direct donation join: the
// covering call's own donationLines (Donated X. Trust +N voice). Single
// label with donation precedence; overlap bump∩donation counted separately.
// r51 subset: r50 direct, or solo-office on a deed day (deed-day solo) —
// reported for continuity. TIGHTENED subset (binds): r50 direct, or
// solo-office with r50 class deed — the r51 26065 artifact (bump-classified
// but sitting on a deed day) is excluded by the deed-class requirement.
for (const r of recs) {
  const daily = r.officeDaily || [];
  const callByDay = {};
  for (const m of (r.officeCallMoves || [])) (callByDay[m.day] = callByDay[m.day] || []).push(m);
  const convoByDay = {};
  for (const m of (r.convoWindowMoves || [])) (convoByDay[m.day] = convoByDay[m.day] || []).push(m);
  const deedDays = new Set((r.deedLedger || []).map(d => d.day));
  const handoffDays = new Set((r.officeCallMoves || []).filter(m => m.bearerChanged).map(m => m.day));
  const labels = { donation: 0, bump: 0, deed: 0, direct: 0, handoff: 0, unexplained: 0 };
  let overlap = 0, subsetTotal = 0, subsetDonation = 0;
  let tightTotal = 0, tightDonation = 0;
  const subsetDetail = [];
  for (let i = 1; i < daily.length; i++) {
    if (daily[i].office === daily[i - 1].office) continue;
    const entryDay = daily[i].day, prevDay = daily[i - 1].day;
    const cover = ((callByDay[entryDay] || []).filter(m => !m.bearerChanged)[0])
      || ((convoByDay[prevDay] || [])[0]) || null;
    const bearer = daily[i].bearer;
    const bumps = (cover && cover.bumpEntries) || [];
    const moverIds = (cover && cover.movers || []).map(x => x.id);
    const hasBump = bumps.some(b => b.vid === bearer || moverIds.includes(b.vid));
    const hasDonation = ((cover && cover.donationLines) || []).length > 0;
    let r50cls = 'unexplained';
    if (cover) {
      if (hasBump) r50cls = 'bump';
      else if (moverIds.length > 0) r50cls = 'direct';
      else if (deedDays.has(entryDay)) r50cls = 'deed';
      else r50cls = 'unexplained';
    } else if (handoffDays.has(entryDay)) r50cls = 'handoff';
    else if (deedDays.has(entryDay)) r50cls = 'deed';
    const isSoloDeedDay = cover && cover.soloOffice && deedDays.has(entryDay);
    const inSubset = (r50cls === 'direct') || isSoloDeedDay;
    const inTight = (r50cls === 'direct') || (cover && cover.soloOffice && r50cls === 'deed');
    if (hasBump && hasDonation) overlap++;
    const label = hasDonation ? 'donation' : r50cls;
    labels[label]++;
    if (inSubset) {
      subsetTotal++;
      if (hasDonation) subsetDonation++;
      subsetDetail.push({ entryDay, from: daily[i - 1].office, to: daily[i].office, r50cls, hasDonation, donationLines: ((cover && cover.donationLines) || []).slice(0, 2) });
    }
    if (inTight) {
      tightTotal++; poolTight++;
      if (hasDonation) { tightDonation++; poolTightDon++; }
    }
  }
  const w1d = subsetTotal ? Math.round((subsetDonation / subsetTotal) * 100) / 100 : null;
  const w1dTight = tightTotal ? Math.round((tightDonation / tightTotal) * 100) / 100 : null;
  console.log(`seed ${r.seed}: transitions labels=${JSON.stringify(labels)} bump∩donation=${overlap} r51-subset(direct+deed-day-solo)=${subsetTotal} subsetWithDonation=${subsetDonation} W1d(r51)=${w1d} TIGHTENED(direct+deed-class-solo)=${tightTotal} tightWithDonation=${tightDonation} W1d-tight(BINDS)=${w1dTight}`);
  for (const d of subsetDetail) console.log(`  SUBSET entryD${d.entryDay} ${d.from}->${d.to} r50=${d.r50cls} donation=${d.hasDonation} lines=${JSON.stringify(d.donationLines)}`);
}
console.log(`POOLED W1d-tight: ${poolTightDon}/${poolTight} = ${poolTight ? Math.round((poolTightDon / poolTight) * 100) / 100 : 'n/a (empty subset band)'}`);
console.log('\n== DEED-THIN (r51, exploratory) ==');
// Post-death deeds vs pantry level on the deed day (nearest officeDaily
// entry on or before the deed day; thin < 15000 kcal). Also deeds d+1–10
// vs d+11–45, and the pantry trajectory per seed.
for (const r of recs) {
  const daily = (r.officeDaily || []).filter(d => typeof d.pantryKcal === 'number');
  const deathDay = (r.death && r.death.day) || 0;
  const byBand = { thin: 0, fed: 0, unknown: 0 };
  const byWindow = { 'd+1-10': 0, 'd+11-45': 0, 'other': 0 };
  const deedRows = [];
  for (const d of (r.deedLedger || [])) {
    let pantry = null, dp = d.day - deathDay;
    let best = null;
    for (const od of daily) if (od.day <= d.day && (!best || od.day > best.day)) best = od;
    if (best) pantry = best.pantryKcal;
    const band = pantry == null ? 'unknown' : (pantry < 15000 ? 'thin' : 'fed');
    byBand[band]++;
    const win = dp >= 1 && dp <= 10 ? 'd+1-10' : (dp >= 11 && dp <= 45 ? 'd+11-45' : 'other');
    byWindow[win]++;
    deedRows.push({ day: d.day, dplus: dp, deed: d.deed, pantry, band });
  }
  const pans = daily.map(d => d.pantryKcal);
  const traj = pans.length ? `first=${pans[0]} min=${Math.min(...pans)} last=${pans[pans.length - 1]}` : 'no-pantry-daily';
  console.log(`seed ${r.seed}: deeds=${(r.deedLedger || []).length} byBand=${JSON.stringify(byBand)} byWindow=${JSON.stringify(byWindow)} pantryTrajectory(${traj}) pantryEnd=${r.pantryEnd}`);
  for (const row of deedRows.slice(0, 30)) console.log(`  DEED d${row.day} d+${row.dplus} ${row.deed} pantry=${row.pantry} band=${row.band}`);
}
console.log('\n== DEED-TRIGGER (r52, finding bar) ==');
// Contrast deed days vs no-deed days on the five gates, per seed, from
// deedContext snapshots. A gate is "closed" on a day when: teachablePairs
// === 0 (nothing to teach), kcalGateOpen === false (policy holds surplus),
// hallGated === true (donations blocked), packKcal === 0 (nothing to give).
// For teachPlant deeds, targetKnowsBefore === true would mean a redundant
// lesson; for donate deeds, kcalGateOpen === false at call time would mean
// the policy donated below its own gate (a policy-behavior finding).
for (const r of recs) {
  const ctx = r.deedContext || [];
  const deedDays = new Set((r.deedLedger || []).map(d => d.day));
  const split = (arr) => {
    if (!arr.length) return 'n/a';
    const nums = arr.filter(x => typeof x === 'number');
    if (!nums.length) return 'n/a';
    const mean = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10;
    return `mean=${mean} min=${Math.min(...nums)} max=${Math.max(...nums)} n=${nums.length}`;
  };
  const deedCtx = ctx.filter(c => deedDays.has(c.day));
  const noDeedCtx = ctx.filter(c => !deedDays.has(c.day));
  const share = (arr, pred) => arr.length ? Math.round(arr.filter(pred).length / arr.length * 100) / 100 : null;
  console.log(`seed ${r.seed}: deedContextDays=${ctx.length} deedDays=${deedCtx.length} noDeedDays=${noDeedCtx.length} totalDeeds=${(r.deedLedger || []).length}`);
  console.log(`  DEED days: teachablePairs[${split(deedCtx.map(c => c.teachablePairs))}] kcalGateOpen=${share(deedCtx, c => c.kcalGateOpen === true)} hallGated=${share(deedCtx, c => c.hallGated === true)} packKcal[${split(deedCtx.map(c => c.packKcal))}] pantry[${split(deedCtx.map(c => c.pantryKcal))}]`);
  console.log(`  NO-DEED days: teachablePairs[${split(noDeedCtx.map(c => c.teachablePairs))}] kcalGateOpen=${share(noDeedCtx, c => c.kcalGateOpen === true)} hallGated=${share(noDeedCtx, c => c.hallGated === true)} packKcal[${split(noDeedCtx.map(c => c.packKcal))}] pantry[${split(noDeedCtx.map(c => c.pantryKcal))}]`);
  console.log(`  NO-DEED closed-gate shares: teachablePairs=0:${share(noDeedCtx, c => c.teachablePairs === 0)} kcalGateClosed:${share(noDeedCtx, c => c.kcalGateOpen === false)} hallGated:${share(noDeedCtx, c => c.hallGated === true)} packEmpty:${share(noDeedCtx, c => c.packKcal === 0)}`);
  const byDeed = {};
  for (const d of (r.deedLedger || [])) {
    const b = (byDeed[d.deed] = byDeed[d.deed] || { calls: 0, args: {}, targetKnowsTrue: 0, targetKnowsFalse: 0, kcalGateOpen: 0, kcalGateClosed: 0, hallGated: 0 });
    b.calls++;
    const a = JSON.stringify((d.argsJson || []).slice(0, 2));
    b.args[a] = (b.args[a] || 0) + 1;
    if (d.deed === 'teachPlant') {
      if (d.targetKnowsBefore === true) b.targetKnowsTrue++;
      else if (d.targetKnowsBefore === false) b.targetKnowsFalse++;
    }
    if (d.deed === 'donateToPantry') {
      if (d.kcalGateOpen === true) b.kcalGateOpen++;
      else if (d.kcalGateOpen === false) b.kcalGateClosed++;
      if (d.hallGated === true) b.hallGated++;
    }
  }
  for (const k of Object.keys(byDeed)) console.log(`  DEED ${k}: ${JSON.stringify(byDeed[k])}`);
  if ((r.deedLedger || []).length === 0) {
    console.log(`  ZERO-DEED seed: closed-gate verdict — teachablePairs=0 on ${share(noDeedCtx, c => c.teachablePairs === 0)} of days, kcalGateClosed on ${share(noDeedCtx, c => c.kcalGateOpen === false)}, hallGated on ${share(noDeedCtx, c => c.hallGated === true)}, packEmpty on ${share(noDeedCtx, c => c.packKcal === 0)}`);
  }
}
console.log('\n== SOLO-CREEP LONG WINDOW (r50) ==');
for (const r of recs) {
  const deedDaysSolo = new Set((r.deedLedger || []).map(d => d.day));
  const solo = (r.officeCallMoves || []).filter(m => !m.bearerChanged && m.soloOffice);
  const wins = { '1-10': { n: 0, sum: 0 }, '11-20': { n: 0, sum: 0 }, '21-30': { n: 0, sum: 0 }, '31-45': { n: 0, sum: 0 }, '46+': { n: 0, sum: 0 } };
  for (const m of solo) {
    const dp = m.dplus;
    const w = dp <= 10 ? '1-10' : dp <= 20 ? '11-20' : dp <= 30 ? '21-30' : dp <= 45 ? '31-45' : '46+';
    wins[w].n++; wins[w].sum += m.delta;
  }
  const tot = solo.reduce((a, m) => a + m.delta, 0);
  const bumpSolo = solo.filter(m => (m.bumpEntries || []).some(b => b.vid === m.bearerAfter));
  console.log(`seed ${r.seed}: soloCount=${solo.length} soloCumDelta=${tot} windows=${JSON.stringify(wins)} soloWithBearerBump=${bumpSolo.length}/${solo.length}`);
  for (const m of solo.slice(0, 20)) {
    const bb = (m.bumpEntries || []).filter(b => b.vid === m.bearerAfter).map(b => `${b.delta}${b.reason ? '(' + b.reason + ')' : ''}`);
    console.log(`  SOLO d${m.day} d+${m.dplus} ${m.from}->${m.to} (${m.delta >= 0 ? '+' : ''}${m.delta}) bearerDeltaExact=${m.bearerDeltaExact} bearerBumps=${JSON.stringify(bb.slice(0, 4))} deedThatDay=${deedDaysSolo.has(m.day)}`);
  }
}
console.log('\n== OVER-CAUSE (r49) ==');
for (const r of recs) {
  const oc = r.overCause || {};
  console.log(`seed ${r.seed}: over=${oc.over} villageLost=${oc.villageLost} won=${oc.won} alive=${oc.alive} pantryEnd=${oc.pantryEnd}`);
  for (const ln of (oc.lastSay || [])) console.log(`  | ${ln.slice(0, 200)}`);
}
console.log('\\n== DEED-CALLER (r53, finding bar) ==');
// Path classifier on the r53 caller instrument. site = first post-wrapper
// frame; stackHead = first 4 post-wrapper frames (function names kept).
// haul-donate: donateSurplus called via donateHaul (forage-haul path).
// gated-donate: donateSurplus with NO donateHaul frame (daily gated call,
// maxTransfers 1). haul-teach: haulTeachingMoment via learnFromShowing.
// teachRound: the policy's own lesson loop. convo-talk: talk functions.
function deedPath(d) {
  const head = (d.stackHead || []).join(' ');
  const raw = (d.siteRaw || '') + ' ' + head;
  if (/teachRound/.test(raw)) return 'teachRound';
  if (/haulTeachingMoment/.test(head)) return 'haul-teach';
  if (/learnFromShowing/.test(head)) return 'showing-teach';
  if (/donateHaul/.test(head)) return 'haul-donate';
  if (/donateSurplus/.test(head)) return 'gated-donate';
  if (/holdConversation|talkRound|deepTalk/.test(raw)) return 'convo-talk';
  return 'other:' + (d.site || 'no-site');
}
let bandTeachNew = 0, bandTeachKnown = 0, bandTeachNull = 0;
for (const r of recs) {
  const deeds = r.deedLedger || [];
  const byPath = {};
  for (const d of deeds) { const k = d.deed + ':' + deedPath(d); byPath[k] = (byPath[k] || 0) + 1; }
  console.log(`seed ${r.seed}: deeds=${deeds.length} byPath=${JSON.stringify(byPath)}`);
  const teach = deeds.filter(d => d.deed === 'teachPlant');
  const tk = { true: 0, false: 0, null: 0 };
  for (const d of teach) tk[d.targetKnowsBefore === true ? 'true' : d.targetKnowsBefore === false ? 'false' : 'null']++;
  bandTeachNew += tk.false; bandTeachKnown += tk.true; bandTeachNull += tk.null;
  console.log(`  teachPlant: total=${teach.length} knowsBefore true=${tk.true} FALSE(new)=${tk.false} null=${tk.null}`);
  for (const d of teach.filter(d => d.targetKnowsBefore === false)) console.log(`  TEACH-NEW d${d.day} vid=${d.vid} path=${deedPath(d)} site=${d.site}`);
  // Per-day path census: deedContext days joined to that day's deeds by path.
  const deedsByDay = {};
  for (const d of deeds) (deedsByDay[d.day] = deedsByDay[d.day] || []).push(d);
  const ctxDays = r.deedContext || [];
  // Census on DISTINCT days: deedContext can repeat a calendar day (a
  // runDays call advancing 0 day-parts) and skip others (2-day advances),
  // so counting per ctx entry double-counts deeds on repeated days
  // (26082: 19 entry-count vs 15 distinct deed days). Death-day (d+0)
  // deeds and post-window deeds are outside the census by design.
  const ctxDaySet = new Set(ctxDays.map(c => c.day));
  const deedDays = Object.keys(deedsByDay).map(Number).filter(d => ctxDaySet.has(d));
  const noDeedDays = [...ctxDaySet].filter(d => !(deedsByDay[d] || []).length);
  const pathDays = {};
  for (const d of deedDays) for (const dd of deedsByDay[d]) pathDays[deedPath(dd)] = (pathDays[deedPath(dd)] || 0) + 1;
  console.log(`  census days: deedDays=${deedDays.length} noDeedDays=${noDeedDays.length} deedsByPathOnDeedDays=${JSON.stringify(pathDays)}`);
  const unmapped = deeds.filter(d => deedPath(d).startsWith('other:'));
  if (unmapped.length) console.log(`  UNMAPPED deeds=${unmapped.length}: ${JSON.stringify(unmapped.slice(0, 5).map(d => ({ deed: d.deed, site: d.site, head: (d.stackHead || []).slice(0, 2) })))}`);
}
console.log(`BAND TEACH-NEW: targetKnowsBefore=false total=${bandTeachNew} (known=${bandTeachKnown} null=${bandTeachNull})`);
console.log('\\n== STAGING RATE (r53: mature regime is an aspiration, not a guarantee) ==');
const young = recs.filter(r => [26151, 26152, 26153].includes(r.seed)); // r79: chain-forced
const mature = recs.filter(r => [26154, 26155, 26156].includes(r.seed)); // r79: controls (r75 analyzer carried a stale r72-era list here; fixed)
const rate = (xs) => `${xs.filter(r => r.death && r.death.scripted).length}/${xs.length} scripted (organic ${xs.filter(r => r.death && !r.death.scripted).length})`;
console.log(`chain-forced: ${rate(young)}; controls: ${rate(mature)} (r79 labels; scripted here = FIRST death staged day-40, as in r56 — second/third kills are chain-forced separately)`);
for (const r of recs) console.log(`seed ${r.seed}: scripted=${r.death && r.death.scripted} deathDay=${r.death && r.death.day}`);
console.log('\\n== BINDING METRICS ==');
for (const r of recs) {
  const f = r.funeral || {};
  console.log(`seed ${r.seed}: M3v2=${f.echoV2} M3v2b=${f.echoV2b} (bar >=2, excludedLoot=${f.echoV2bExcluded}) M1=${r.m1} M4=${r.m4} MG2=${r.mg2} (viol=${(r.mealGateViolations || []).length}) MG2v2=${r.mg2v2} (violMeal=${(r.mealGateViolationsMeal || []).length}) C1v3ok=${r.callCheckV3 && r.callCheckV3.ok} overCause=${r.overCause ? r.overCause.over : 'missing'} chainDeaths=${(r.chainDeaths || []).length} chainKnown=${(r.chainDeaths || []).filter(c => c.causeKnown).length} identityTrips=${(r.identityTrips || []).length} dayAdv=${r.dayAdv}`);
}
console.log('\n== DEATH-LEDGER (r79: fallen record per handoff death, after the contest-death fix) ==');
for (const r of recs) {
  const tele = (r.tele && typeof r.tele === 'object') ? r.tele : {};
  const endFallen = tele['census.fallen'];
  const chain = (r.chainDeaths || []).map(c => `${c.deadFirst}->${c.newFirst} fallenCause=${JSON.stringify(c.fallenCause)} lineageCause=${JSON.stringify(c.lineageCause)} known=${!!c.causeKnown}`).join(' | ');
  console.log(`seed ${r.seed}: firstDeathFallen=${r.death ? r.death.fallen : '?'} endFallen=${endFallen} chainDeaths=${(r.chainDeaths || []).length} chainKnown=${(r.chainDeaths || []).filter(c => c.causeKnown).length}`);
  console.log(`  chain: ${chain || 'none'}`);
}
console.log('\n== TRANSCRIPTS (people check inventory) ==');
const tx = fs.readdirSync(EVID).filter(n => n.startsWith('journey-succession-r83-transcript-'));
console.log(`${tx.length} transcripts`);
for (const t of tx.sort()) console.log('  ' + t);
console.log('\n== VILLAGE END STATE ==');
for (const r of recs) {
  const last = (r.ledger || [])[(r.ledger || []).length - 1] || {};
  console.log(`seed ${r.seed}: ${r.death ? r.death.oldFirst + ' -> ' + r.death.newFirst : 'no death'} d${r.death ? r.death.day : '?'} trustMantle=${r.death ? r.death.newTrust : '?'} officeEnd=${r.trustVerdict ? r.trustVerdict.officeLast : '?'} villageMeanEnd=${r.trustVerdict ? r.trustVerdict.villageLast : '?'} pantryEnd=${r.pantryEnd} ledgerAlive=${last.alive} ledgerPantry=${last.pantryKcal}`);
}

// == SEAM SCAN (r64) ==
// Reads the driver's r64 transcript files and classifies, for every
// invite turn, whether the outcome line was SPOKEN or DEFLECTED.
// Anchor: the invite_party player line 'Want to come with me?' in the
// FULL TRANSCRIPT section; the outcome is the NEXT NPC line.
//   SPOKEN-accept: one of party.js's 4 yes lines (substring match).
//   SPOKEN-decline: one of party.js's 4 contextual refusal lines.
//   DEFLECTED: quote-stripped line in conversation.js convoDeflectionLines.
//   OTHER: anything else — printed verbatim, judged by hand, never auto-passed.
// Sibling pass: EVERY NPC deflection line in every transcript, with its
// preceding YOU line, so tell-me/teach drops are counted from the same
// evidence (observed only; fix-all left their exemption as a Steve-call).
console.log('\n== SEAM SCAN (r64: invite outcomes + all deflection lines) ==');
const DEFLECT = ['...Sorry, lost my train of thought.', 'Hm. Never mind — go on.', '...Actually, forget it.', '...Where was I? Gone. Ask me something else.', 'Huh. That went clean out of my head.', "...No, it's not coming back. What were you saying?", 'Lost it. The thought, I mean. Go on.', '...Sorry — that one slipped away from me.', "Eh. Wasn't important. Probably.", 'I just said — did you miss it?', 'I just told you — what else is on your mind?', "We've covered this one. Ask me something else."];
const YES = ['Okay. Yeah. I trust you.', 'Someone should watch your back. Might as well be me.', "Alright. But I'm not carrying your stuff.", '...Fine. This had better be worth it.'];
const YES_EAGER = ["Yes. Absolutely. I've been hoping you'd ask.", "Finally. I was wondering when you'd see my value.", "I'd love to. Lead the way."]; // r70: party.js BACKSTABBER eager-accept cores (transcript lines carry parenthetical asides; substring match)
const YES_ALL = YES.concat(YES_EAGER);
const NO = ["I work alone. Nothing personal. ...It's a little personal.", "I don't know you well enough for that. Ask me again when we've survived something together.", 'Out there? With YOU leading? ...Let me think about it.', "Not right now. I've got my own things to handle."];
const stripQ = (t) => String(t || '').trim().replace(/^"+|"+$/g, '');
let invTotal = 0, invSpoken = 0, invDefl = 0, invOther = 0, deflTotal = 0;
const deflEvents = [];
const txFiles = fs.readdirSync(EVID).filter(n => n.startsWith('journey-succession-r83-transcript-')).sort();
for (const fn of txFiles) {
  const body = fs.readFileSync(path.join(EVID, fn), 'utf8');
  const full = body.split('### FULL TRANSCRIPT')[1] || '';
  const lines = full.split('\n').filter(l => /^(NPC|YOU):/.test(l));
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^NPC:/.test(l) && DEFLECT.includes(stripQ(l.replace(/^NPC:\s*/, '')))) {
      deflTotal++;
      const prevYou = [...lines.slice(0, i)].reverse().find(x => /^YOU:/.test(x)) || '(no prior YOU line)';
      console.log(`DEFLECT ${fn}: prev ${prevYou.slice(0, 120)} -> NPC: ${stripQ(l.replace(/^NPC:\s*/, ''))}`);
      { const m = fn.match(/transcript-(\d+)-dplus(\d+)-(.+)\.txt/); if (m) deflEvents.push({ file: fn, seed: parseInt(m[1], 10), dplus: parseInt(m[2], 10), vid: m[3], prev: prevYou, line: stripQ(l.replace(/^NPC:\s*/, '')) }); }
    }
    if (/^YOU:/.test(l) && l.includes('Want to come with me?')) {
      const nxt = lines.slice(i + 1).find(x => /^NPC:/.test(x));
      invTotal++;
      if (!nxt) { invOther++; console.log(`INVITE-OTHER ${fn}: no following NPC line`); continue; }
      const txt = nxt.replace(/^NPC:\s*/, '');
      const sq = stripQ(txt);
      if (YES_ALL.some(y => txt.includes(y))) { invSpoken++; console.log(`INVITE-SPOKEN-accept ${fn}: ${sq.slice(0, 120)}`); }
      else if (NO.some(n => txt.includes(n))) { invSpoken++; console.log(`INVITE-SPOKEN-decline ${fn}: ${sq.slice(0, 120)}`); }
      else if (DEFLECT.includes(sq)) { invDefl++; console.log(`INVITE-DEFLECTED ${fn}: ${sq}`); }
      else { invOther++; console.log(`INVITE-OTHER ${fn}: ${sq.slice(0, 160)}`); }
    }
  }
}
console.log(`SEAM-INVITE pooled: total=${invTotal} spoken=${invSpoken} deflected=${invDefl} other=${invOther}`);
console.log(`SEAM-SIBLINGS pooled: deflection lines in transcripts=${deflTotal} (invite-deflected=${invDefl} of those)`);

// == TRACE JOIN (r70) ==
// For every transcript deflection, print the trace candidates from the same
// seed's stdout JSON: pool draws with the same deflection text + vid, and
// sayLine fellBack events returning the same text for the same vid. Join is
// by (seed, vid, line text); day is printed for hand-verification against
// the transcript's dplus checkpoint (convo day ~= death day + dplus).
// Site class: sites[0] in conversation.js => SAYLINE-INTERNAL (a sayLine
// fallback); in convo-dialogue.js => DLG-DIRECT; else OTHER.
console.log('\n== TRACE JOIN (r70: deflection mechanism) ==');
const siteClass = (sites) => {
  const s0 = (sites || [])[0] || '';
  if (s0.includes('convo-dialogue.js')) return 'DLG-DIRECT';
  if (s0.includes('conversation.js')) return 'SAYLINE-INTERNAL';
  return 'OTHER';
};
const sq2 = (t) => String(t || '').trim().replace(/^"+|"+$/g, '');
for (const r of recs) {
  const st = r.sayTrace || [], pd = r.poolDraws || [];
  const fb = st.filter(e => e.fellBack);
  const fbRun = fb.filter(e => e.preRun && !e.preSelf).length;
  const fbSelf = fb.filter(e => e.preSelf).length;
  const fbOther = fb.length - fbRun - fbSelf;
  const nulls = st.filter(e => e.nullReturn).length;
  const dryBySite = {};
  for (const e of pd.filter(x => x.pool === 'dry')) { const k = siteClass(e.sites); dryBySite[k] = (dryBySite[k] || 0) + 1; }
  console.log(`seed ${r.seed}: sayTrace fellBack=${fb.length} (run=${fbRun} self=${fbSelf} other=${fbOther}) nullReturn=${nulls} poolDraws dry=${pd.filter(x => x.pool === 'dry').length} self=${pd.filter(x => x.pool === 'self').length} dryBySite=${JSON.stringify(dryBySite)} drivenTagSayTrace=${st.filter(e => e.tag).length} policySayTrace=${st.filter(e => !e.tag).length}`);
}
let tjJoined = 0, tjUnjoined = 0;
for (const d of deflEvents) {
  const rec = recs.find(x => x.seed === d.seed);
  const pd = (rec && rec.poolDraws) || [];
  const st = (rec && rec.sayTrace) || [];
  const cands = pd.filter(e => e.vid === d.vid && sq2(e.line) === sq2(d.line));
  const fbCands = st.filter(e => e.vid === d.vid && e.fellBack && sq2(e.returned) === sq2(d.line));
  if (!cands.length && !fbCands.length) { tjUnjoined++; console.log(`TRACE-UNJOINED ${d.file}: prev ${String(d.prev).slice(0, 100)} -> ${sq2(d.line)}`); continue; }
  tjJoined++;
  const convoDay = (rec && rec.death) ? (rec.death.day + d.dplus) : '?';
  console.log(`TRACE ${d.file} (dplus ${d.dplus}, convoDay~${convoDay}) prev ${String(d.prev).slice(0, 100)} -> ${sq2(d.line)}`);
  for (const e of cands) console.log(`  POOL ${e.pool} day=${e.day} tag=${e.tag} pick=${e.pick} site=${siteClass(e.sites)} sites=${JSON.stringify(e.sites)}`);
  for (const e of fbCands) console.log(`  SAYLINE fellBack day=${e.day} tag=${e.tag} pick=${e.pick} preSelf=${e.preSelf} preRun=${e.preRun} diegetic=${e.diegeticAct} structural=${e.structural} key=${(e.key || '').slice(0, 100)}`);
}
console.log(`TRACE-JOIN pooled: deflections=${deflEvents.length} joined=${tjJoined} unjoined=${tjUnjoined}`);
