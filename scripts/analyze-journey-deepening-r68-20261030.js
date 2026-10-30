// analyze-journey-deepening-r68-20261030.js -- panel summary for the R68 run.
// Reads r68 seed JSONs + transcripts from the goal evidence dir (2026-10-30)
// R68 ADDS: repeat-offer census (sitting-open offered flags joined to
// priorLearnWithVid from the run's own teach census) + teach-first
// convo-lesson counts (player->villager via conversation under
// TEACH_FIRST=1). R67 IS the control (descriptive only).
// and prints, per seed: survival/wave/fights/deaths, invite-decision counts
// with distinct pairs, betrayal-plot formation (ever-seen ids + checkpoint
// snapshots), pantry monster-meat snapshots + test-call counts, favor
// census (with favor id on every transition, r62 metric-review fix), and
// the r59-style transcript betrayal-only stats. R66 IS the baseline this
// run compares against (descriptive only): no pass/fail is scored here
// against r55-r66 aggregates; values are printed for the run note.
// R67 ADDS: canTeach-why census (canTeachWhySittings: per-direction
// canTeachSkill why counts at sitting open) on top of the R66 pager
// census (pagerRecords), the R65 pivot census (pivotRecords) and the
// r64 offered-skill census (sitting-open availability + per-turn
// offered skill ids + picked id), gateWhy on not-learned lessons, and
// the corrected teach label (not-learned + preKnown=false =
// 'attempted-new, gated'). STASH-LEDGER retired as a question (r63
// answered it); drop census second panel.
// Usage: node scripts/analyze-journey-deepening-r67-20261029.js
// Reads only; writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-30');
let totalInv = 0, totalAcc = 0, totalPlots = 0, totalTests = 0, totalFormations = 0, totalSafe = 0, cookedMismatch = 0;
let totalPivots = 0, totalPivotSkills = 0, totalPostWithSkill = 0;
let totalPagerWalks = 0, totalPagerSkills = 0;
let totalRepeatSit = 0, totalRepeatOffer = 0, totalRepeatWall = 0, totalLessonDoneTrue = 0, totalTeachFirstConvo = 0;
let totalFavorTrans = 0, totalOutingAttempts = 0, totalOutingKept = 0;
let totalTeach = 0, totalTeachNew = 0, totalTeachKnown = 0, totalTeachUnknown = 0, totalDrops = 0;
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r68-seed${seed}.json`);
  if (!fs.existsSync(fp)) { console.log(`=== ${seed}: SEED JSON MISSING`); continue; }
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = d.armor || {};
  const ca = a.craftArmor || {};
  const mf = (a.matflow || {}).intraday || {};
  const alive = (d.census || []).filter(c => c.alive).length;
  const total = (d.census || []).length;
  const mis = ((d.deathHonesty || {}).mislabels || []).length;
  const made = (ca.made && ca.made.bark_armor) || 0;
  const inv = d.inviteDecisions || [];
  totalInv += inv.length; totalAcc += inv.filter(x => x.accept).length;
  const byKind = {};
  const pairs = new Set();
  for (const x of inv) {
    const k = x.kind || '?';
    byKind[k] = byKind[k] || { n: 0, acc: 0 };
    byKind[k].n++; if (x.accept) byKind[k].acc++;
    pairs.add(`${x.inviter}->${x.invitee}`);
  }
  const plotsEver = d.plotIdsEver || [];
  totalPlots += plotsEver.length;
  const tests = d.meatTestCalls || [];
  totalTests += tests.length;
  const safes = d.meatSafeCalls || [];
  totalSafe += safes.length;
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  fightsTotal=${d.fightsTotal} deaths=${(d.deaths || []).length} vineGainCalls=${mf.forageVineGainCalls} madeBark=${made}`);
  console.log(`  inviteDecisions: n=${inv.length} accept=${inv.filter(x => x.accept).length} pairs=${pairs.size} byKind=${JSON.stringify(byKind)}`);
  for (const x of inv) console.log(`    invite d${x.day} kind=${x.kind} ${x.inviter} -> ${x.invitee} chance=${x.chance} accept=${x.accept} reasons=${JSON.stringify(x.reasons)}`);
  console.log(`  plotsEver: n=${plotsEver.length} ${plotsEver.map(p => `${p.id}(d${p.day} ${p.inviter}->${p.target})`).join(' ')}`);
  const formations = d.plotFormations || [];
  totalFormations += formations.length;
  console.log(`  plotFormations: n=${formations.length} ${formations.map(f => `${f.id}(d${f.day} ${f.leader}->${f.target})`).join(' ')}`);
  for (const s of (d.plotSnaps || [])) console.log(`    plotSnap d${s.day}: total=${s.total} active=${s.active} sprung=${s.sprung} resolved=${s.resolved}`);
  console.log(`  meatTestCalls: n=${tests.length} ${tests.map(t => `d${t.day}`).join(' ')}`);
  console.log(`  meatSafeCalls: n=${safes.length} ${safes.map(t => `d${t.day}:${t.mid}(${t.how})`).join(' ')}`);
  const codex = d.codexMeatSnaps || [];
  const codexDays = [...new Set(codex.filter(c => (c.n || 0) > 0).map(c => c.day))];
  console.log(`  codexMeat: snaps=${codex.length} daysWithVerdict=${codexDays.length} [${codexDays.join(',')}]`);
  for (const c of codex.filter(c => (c.n || 0) > 0)) {
    const idx = codex.indexOf(c);
    const prev = codex.slice(0, idx).filter(x => (x.n || 0) > 0).pop();
    if (!prev || JSON.stringify(prev.entries) !== JSON.stringify(c.entries)) console.log(`    codexMeat d${c.day}(${c.phase}): ${JSON.stringify(c.entries)}`);
  }
  const meatSnaps = d.meatPantrySnaps || [];
  const meatDays = [...new Set(meatSnaps.filter(s => (s.units || 0) > 0).map(s => s.day))];
  const maxMeatUnits = meatSnaps.reduce((m, s) => Math.max(m, s.units || 0), 0);
  console.log(`  meatPantry: snaps=${meatSnaps.length} daysWithMeat=${meatDays.length} [${meatDays.join(',')}] maxUnits=${maxMeatUnits}`);
  for (const s of meatSnaps.filter(s => (s.units || 0) > 0)) {
    const states = {};
    for (const r of (s.rows || [])) { const k = r.foodState || '?'; states[k] = (states[k] || 0) + (r.units || 0); }
    const expectCooked = states['cooked'] || 0;
    if ((s.cookedUnits || 0) !== expectCooked) { cookedMismatch++; console.log(`    COOKED-MISMATCH d${s.day}(${s.phase}): cookedUnits=${s.cookedUnits} foodStateCooked=${expectCooked}`); }
    console.log(`    meatPantry d${s.day}(${s.phase}): rows=${s.n} units=${s.units} cookedUnits=${s.cookedUnits} states=${JSON.stringify(states)} ids=${(s.rows || []).map(r => r.id || r.plantId).join(',')}`);
  }
  // MEAT-ATTR: cooked+edible transitions across dawn snaps vs mark/codex evidence
  {
    const dawns = meatSnaps.filter(s => s.phase === 'dawn').sort((a, b) => a.day - b.day);
    let prevById = new Map();
    for (const s of dawns) {
      const cur = new Map();
      for (const r of (s.rows || [])) cur.set(r.id || r.plantId, r);
      for (const [id, r] of cur) {
        const prev = prevById.get(id);
        if (r.foodState === 'cooked' && r.edible && !(prev && prev.foodState === 'cooked' && prev.edible)) {
          const marks = safes.filter(m => m.day <= s.day && (m.mid === id.replace(/^meat_/, '') || id.includes(m.mid)));
          const cx = (d.codexMeatSnaps || []).filter(c => c.day <= s.day).flatMap(c => c.entries || []).filter(e => id.includes(e.mid) || e.mid === id.replace(/^meat_/, ''));
          console.log(`    COOKED-TRANSITION d${s.day} ${id} units=${r.units} kcalEach=${r.kcalEach} marks<=day=${marks.map(m => `d${m.day}:${m.mid}`).join(',') || 'NONE'} codex<=day=${cx.length ? JSON.stringify(cx.slice(-1)) : 'NONE'}`);
        }
      }
      prevById = cur;
    }
  }
  const fc = d.favorCensus || {};
  const ftrans = fc.transitions || [];
  totalFavorTrans += ftrans.length;
  console.log(`  favorCensus: transitions=${ftrans.length} snaps=${(fc.snaps || []).length} errors=${(fc.errors || []).length}`);
  for (const t of ftrans) console.log(`    favor d${t.day}(${t.tag}) id=${(t.row && t.row.id) || '?'} ${t.vid} ${t.from || 'none'} -> ${t.to} asked=${t.row.askedDay} promised=${t.row.promisedDay} meet=${t.row.meetDay} run=${t.row.forageRun ? JSON.stringify(t.row.forageRun) : 'none'} kept=${t.row.promiseKept} broken=${t.row.promiseBroken}`);
  const finals = ((fc.snaps || []).slice(-1)[0] || {}).favors || [];
  for (const f of finals) console.log(`    favorFinal id=${f.id || '?'} ${f.vid} state=${f.state} asked=${f.askedDay} promised=${f.promisedDay} meet=${f.meetDay} run=${f.forageRun ? JSON.stringify(f.forageRun) : 'none'} kept=${f.promiseKept} broken=${f.promiseBroken}`);
  const oa = d.outingArm || [];
  totalOutingAttempts += oa.length;
  totalOutingKept += oa.filter(o => o.outcome === 'delivered-promise-kept').length;
  console.log(`  outingArm: attempts=${oa.length} errors=${(d.outingArmErrors || []).length}`);
  for (const o of oa) {
    console.log(`    outing d${o.day} ${o.name || o.vid} favor=${o.favorId} outcome=${o.outcome} blocker=${o.blocker || ''} door=${o.door ? JSON.stringify(o.door) : ''} travelHome=${o.travelHome ? JSON.stringify(o.travelHome) : ''} steps=${o.steps ?? ''} final=${o.final ? JSON.stringify(o.final) : ''}`);
    if (o.diagFirst) console.log(`      diagFirst: ${JSON.stringify(o.diagFirst)}`);
    if (o.diagAfterPosition) console.log(`      diagAfterPosition: ${JSON.stringify(o.diagAfterPosition)}`);
    if (o.posRounds) console.log(`      posRounds: ${JSON.stringify(o.posRounds)}`);
    for (const st of (o.stages || [])) console.log(`      stage ${st.stage}: ready=${st.ready} ok=${st.ok} action=${st.action || ''} reason=${st.reason || ''} blocker=${st.blocker || ''} line=${st.line ? String(st.line).slice(0, 160) : ''}`);
  }
  // R65 OFFERED-SKILL CENSUS
  {
    const sittings = d.offeredSkillSittings || [];
    const turns = d.offeredSkillTurns || [];
    const sitWithLearn = sittings.filter(x => (x.offeredLearn || []).length > 0).length;
    const sitWithTeach = sittings.filter(x => (x.offeredTeach || []).length > 0).length;
    const sitWithAny = sittings.filter(x => ((x.offeredLearn || []).length + (x.offeredTeach || []).length) > 0).length;
    const turnWithSkill = turns.filter(x => (x.offeredSkill || []).length > 0);
    const skillPicks = turns.filter(x => x.pickedIsSkill).length;
    console.log(`  offeredSkill: sittings=${sittings.length} withLearn=${sitWithLearn} withTeach=${sitWithTeach} withAny=${sitWithAny} turns=${turns.length} turnsWithSkill=${turnWithSkill.length} skillPicks=${skillPicks}`);
    for (const x of sittings) console.log(`    sitting d${x.day} ${x.vid} learnable=${x.learnable} teachable=${x.teachable} offeredLearn=[${(x.offeredLearn || []).join(',')}] offeredTeach=[${(x.offeredTeach || []).join(',')}]`);
    for (const x of turnWithSkill) console.log(`    skillTurn d${x.day} ${x.vid} turn=${x.turn} offered=[${(x.offeredSkill || []).join(',')}] picked=${x.picked}`);
    if (!sittings.length) console.log('    OFFERED-SKILL DEFECT: no sitting records');
    if (!turns.length) console.log('    OFFERED-SKILL DEFECT: no turn records');
  }
  // R67 CANTEACH-WHY CENSUS
  {
    const cw = d.canTeachWhySittings || [];
    const sittings = d.offeredSkillSittings || [];
    const byDay = {};
    for (const x of sittings) byDay[`${x.day}:${x.vid}`] = x;
    let emptyBoth = 0, emptyLearnOnly = 0, emptyTeachOnly = 0;
    let repeatSit = 0, repeatOffer = 0, repeatWall = 0, lessonDoneTrue = 0;
    const whyTotals = { learn: {}, teach: {} };
    for (const x of cw) {
      for (const dir of ['learn', 'teach']) {
        const r = x[dir] || {};
        for (const [w, n] of Object.entries(r.whys || {})) whyTotals[dir][w] = (whyTotals[dir][w] || 0) + n;
        whyTotals[dir].ok = (whyTotals[dir].ok || 0) + (r.ok || 0);
      }
      const sit = byDay[`${x.day}:${x.vid}`];
      const oL = sit ? (sit.offeredLearn || []).length : null;
      const oT = sit ? (sit.offeredTeach || []).length : null;
      // R68 REPEAT census: a repeat sitting is one where this villager
      // already taught the player via conversation earlier in the run.
      // Language-wall sittings (all whys 'words', zero ok) are excluded
      // from the denominator and counted separately.
      if (x.lessonDone) lessonDoneTrue++;
      {
        const lW = Object.keys((x.learn || {}).whys || {});
        const tW = Object.keys((x.teach || {}).whys || {});
        const wall = ((x.learn || {}).ok || 0) === 0 && ((x.teach || {}).ok || 0) === 0 && lW.length > 0 && tW.length > 0 && lW.every(w => w === 'words') && tW.every(w => w === 'words');
        if ((x.priorLearnWithVid || 0) >= 1) {
          if (wall) repeatWall++;
          else { repeatSit++; if ((oL || 0) + (oT || 0) > 0) repeatOffer++; }
        }
      }
      const emptyL = (x.learn || {}).n > 0 && ((x.learn || {}).ok || 0) === 0;
      const emptyT = (x.teach || {}).n > 0 && ((x.teach || {}).ok || 0) === 0;
      if (oL === 0 && oT === 0) emptyBoth++;
      if (oL === 0 && oT > 0) emptyLearnOnly++;
      if (oL > 0 && oT === 0) emptyTeachOnly++;
      console.log(`  canTeachWhy d${x.day} ${x.vid} trust=${x.trust} scholarDay=${x.scholarDay} lessonDayP=${x.lessonDayPlayer} lessonDayV=${x.lessonDayVid} lessonDone=${x.lessonDone} priorLearn=${x.priorLearnWithVid || 0} priorTeach=${x.priorTeachWithVid || 0} offeredL=${oL} offeredT=${oT} | learn n=${(x.learn || {}).n} ok=${(x.learn || {}).ok} whys=${JSON.stringify((x.learn || {}).whys || {})} | teach n=${(x.teach || {}).n} ok=${(x.teach || {}).ok} whys=${JSON.stringify((x.teach || {}).whys || {})}`);
      if (oL === 0 && oT === 0 && (((x.learn || {}).ok || 0) > 0 || ((x.teach || {}).ok || 0) > 0)) console.log('    CANTEACH-WHY ANOMALY: offered empty but ok verdicts present (block is downstream of canTeachSkill)');
      if ((oL === 0) !== emptyL && (x.learn || {}).n > 0) console.log(`    CANTEACH-WHY NOTE: offeredLearn empty=${oL === 0} but canTeach-empty=${emptyL} (convoSkillChoices picks at most one per direction; _skillPick/menu path may differ)`);
      if ((oT === 0) !== emptyT && (x.teach || {}).n > 0) console.log(`    CANTEACH-WHY NOTE: offeredTeach empty=${oT === 0} but canTeach-empty=${emptyT}`);
    }
    console.log(`  canTeachWhyTotals: sittings=${cw.length} offeredEmptyBoth=${emptyBoth} offeredEmptyLearnOnly=${emptyLearnOnly} offeredEmptyTeachOnly=${emptyTeachOnly} whyTotalsLearn=${JSON.stringify(whyTotals.learn)} whyTotalsTeach=${JSON.stringify(whyTotals.teach)}`);
    console.log(`  repeatCensus: repeatSittings=${repeatSit} repeatOffers=${repeatOffer} repeatWallExcluded=${repeatWall} lessonDoneTrueAtOpen=${lessonDoneTrue}`);
    totalRepeatSit += repeatSit; totalRepeatOffer += repeatOffer; totalRepeatWall += repeatWall; totalLessonDoneTrue += lessonDoneTrue;
    if (!cw.length) console.log('    CANTEACH-WHY DEFECT: no sitting records');
    if (cw.length !== sittings.length) console.log(`    CANTEACH-WHY DEFECT: why sittings=${cw.length} != offered sittings=${sittings.length}`);
  }
  // R65 PIVOT CENSUS
  {
    const pivs = d.pivotRecords || [];
    const nPivot = pivs.filter(x => x.action === 'pivot').length;
    const nSkill = pivs.filter(x => x.action === 'skill').length;
    const postWithSkill = pivs.filter(x => x.action === 'pivot' && (x.menuAfter || []).some(id => id.indexOf('skill_learn:') === 0 || id.indexOf('skill_teach:') === 0)).length;
    const postNull = pivs.filter(x => x.action === 'pivot' && !x.menuAfter).length;
    totalPivots += nPivot; totalPivotSkills += nSkill; totalPostWithSkill += postWithSkill;
    console.log(`  pivotCensus: events=${pivs.length} pivots=${nPivot} skillPicks=${nSkill} postPivotMenusWithSkill=${postWithSkill} postPivotMenuNull=${postNull}`);
    for (const x of pivs) console.log(`    pivot d${x.day} ${x.vid} turn=${x.turn} action=${x.action} picked=${x.picked} menuAfter=[${(x.menuAfter || []).join(',')}]`);
    if (!pivs.length) console.log('    PIVOT DEFECT: no pivot records (arm off or sitting records missing)');
  }
  // R67 PAGER CENSUS
  {
    const pages = d.pagerRecords || [];
    const nSkill = pages.filter(x => x.skillPage >= 0).length;
    const byEnded = {};
    for (const x of pages) byEnded[x.ended || '?'] = (byEnded[x.ended || '?'] || 0) + 1;
    const maxPages = pages.reduce((m, x) => Math.max(m, (x.pages || []).length), 0);
    const totalPageTurns = pages.reduce((m, x) => m + (x.pages || []).length, 0);
    totalPagerWalks += pages.length; totalPagerSkills += nSkill;
    console.log(`  pagerCensus: walks=${pages.length} skillFound=${nSkill} maxPages=${maxPages} totalPageTurns=${totalPageTurns} byEnded=${JSON.stringify(byEnded)}`);
    for (const x of pages) {
      console.log(`    pager d${x.day} ${x.vid} pivotTurn=${x.pivotTurn} pages=${(x.pages || []).length} skillPage=${x.skillPage} skillPicked=${x.skillPicked} moreSteps=${x.moreSteps} ended=${x.ended}`);
      (x.pages || []).forEach((pg, i) => console.log(`      page${i}: [${pg.join(',')}]`));
    }
    const nPivot2 = (d.pivotRecords || []).filter(x => x.action === 'pivot').length;
    if (pages.length !== nPivot2) console.log(`    PAGER DEFECT: walks=${pages.length} != pivots=${nPivot2} (every pivot must carry a pager record)`);
    if (!pages.length && nPivot2) console.log('    PAGER DEFECT: pivots exist but no pager records (arm off)');
  }
  // R63 TEACH-CENSUS
  {
    const lessons = d.teachLessons || [];
    totalTeach += lessons.length;
    const byDir = {}; let nNew = 0, nKnown = 0, nUnk = 0;
    for (const l of lessons) {
      const dir = (l.teacher === 'player' ? 'player' : 'villager') + '->' + (l.learner === 'player' ? 'player' : 'villager');
      byDir[dir] = (byDir[dir] || 0) + 1;
      if (l.preKnown === false) nNew++; else if (l.preKnown === true) nKnown++; else nUnk++;
    }
    totalTeachNew += nNew; totalTeachKnown += nKnown; totalTeachUnknown += nUnk;
    const tfConvo = lessons.filter(l => l.teacher === 'player' && l.learner !== 'player' && l.via === 'conversation' && l.result === 'learned');
    const vpConvo = lessons.filter(l => l.teacher !== 'player' && l.learner === 'player' && l.via === 'conversation' && l.result === 'learned');
    totalTeachFirstConvo += tfConvo.length;
    console.log(`  teachCensus: n=${lessons.length} new=${nNew} known=${nKnown} unknown=${nUnk} byDir=${JSON.stringify(byDir)}`);
    console.log(`  teachFirstCensus: playerToVillagerConvoLearned=${tfConvo.length} villagerToPlayerConvoLearned=${vpConvo.length}`);
    for (const l of tfConvo) console.log(`    TEACH-FIRST lesson d${l.day} player -> ${l.learner} ${l.skill} via=conversation`);
    for (const l of vpConvo) console.log(`    player-lesson d${l.day} ${l.teacher} -> player ${l.skill} via=conversation`);
    for (const l of lessons) {
      const cls = l.result === 'learned' ? (l.preKnown === false ? 'GENUINELY-NEW' : (l.preKnown === true ? 'already-known-LEARNED?' : 'UNCLASSIFIABLE')) : (l.preKnown === false ? 'attempted-new, gated' : (l.preKnown === true ? 'already-known' : 'UNCLASSIFIABLE'));
      console.log(`    teach d${l.day} ${l.teacher} -> ${l.learner} ${l.skill} via=${l.via} result=${l.result} preKnown=${l.preKnown} gateWhy=${l.gateWhy || 'n/a'} class=${cls}`);
    }
    const gatedNoWhy = lessons.filter(l => l.result === 'not-learned' && !l.gateWhy).length;
    const whyCounts = {};
    for (const l of lessons.filter(l => l.result === 'not-learned')) whyCounts[l.gateWhy || 'missing'] = (whyCounts[l.gateWhy || 'missing'] || 0) + 1;
    console.log(`  teachGateWhy: notLearned=${lessons.filter(l => l.result === 'not-learned').length} noWhy=${gatedNoWhy} byWhy=${JSON.stringify(whyCounts)}`);
  }
  // R63 DROP-CENSUS
  {
    const drops = d.dropEvents || [];
    totalDrops += drops.length;
    const byItem = {};
    for (const x of drops) byItem[x.itemId || '?'] = (byItem[x.itemId || '?'] || 0) + 1;
    console.log(`  dropCensus: n=${drops.length} byItem=${JSON.stringify(byItem)}`);
    for (const x of drops) console.log(`    drop d${x.day} ${x.itemId} x${x.units} (idx ${x.idx})`);
  }
  for (const day of [45, 60, 80]) {
    const tfp = path.join(EVIDIR, `journey-deepening-r68-transcript-${seed}-day${day}.txt`);
    if (!fs.existsSync(tfp)) { console.log(`  transcript d${day}: MISSING`); continue; }
    const txt = fs.readFileSync(tfp, 'utf8');
    const wantLine = (txt.match(/want: .*$/m) || ['?'])[0];
    const finalLine = (txt.match(/want final: .*$/m) || ['?'])[0];
    const offered = [...txt.matchAll(/\(offered=\[([^\]]*)\] thread=(\S+) want=(\S+) stage=(\d+)\)/g)];
    const betrayalTurns = offered.filter(m => /,betrayal:accept(,|$)/.test(',' + m[1] + ',')).length;
    const betrayalOnly = offered.filter(m => {
      const ids = m[1].split(',').filter(Boolean);
      return ids.includes('betrayal:accept') && ids.every(id => /^betrayal:|^leave$|^silence$/.test(id));
    }).length;
    const youBetrayal = (txt.match(/YOU: \[betrayal:/g) || []).length;
    const steers = (txt.match(/\(STEER58: gated\)/g) || []).length;
    console.log(`  transcript d${day}: ${wantLine} | ${finalLine} | offeredTurns=${offered.length} betrayalAcceptTurns=${betrayalTurns} betrayalOnlyTurns=${betrayalOnly} youBetrayalPicks=${youBetrayal} steers=${steers}`);
  }
}
console.log(`TOTAL repeatSittings=${totalRepeatSit} repeatOffers=${totalRepeatOffer} repeatWallExcluded=${totalRepeatWall} lessonDoneTrueAtOpen=${totalLessonDoneTrue} teachFirstConvoLessons=${totalTeachFirstConvo}`);
console.log(`TOTAL inviteDecisions=${totalInv} accept=${totalAcc} plotsEver=${totalPlots} plotFormations=${totalFormations} meatTestCalls=${totalTests} meatSafeCalls=${totalSafe} cookedMismatch=${cookedMismatch} favorTransitions=${totalFavorTrans} outingAttempts=${totalOutingAttempts} outingKept=${totalOutingKept} teachLessons=${totalTeach} teachNew=${totalTeachNew} teachKnown=${totalTeachKnown} teachUnknown=${totalTeachUnknown} drops=${totalDrops} pivots=${totalPivots} pivotSkillPicks=${totalPivotSkills} postPivotMenusWithSkill=${totalPostWithSkill} pagerWalks=${totalPagerWalks} pagerSkills=${totalPagerSkills}`);
