// test-journey-deepening-r69-instruments-20261030.js -- PROOF TEST for the
// r69 deepening instruments (driver-only, zero src/js).
// Asserts: (a) the r65 driver carries the R65 teach/drop census wraps +
// dated prepPullDays + r65 output filenames + offered-skill/gateWhy
// instruments; (b) pickChoice is
// byte-identical to r64 and the ENGAGE/ENGAGE2/DEFLECT lists are identical
// (panel picker unchanged); (c) favorSnap tracks a forage_help favor
// asked→promised→fulfilled with forageRun/deliveredKcal, ignores other
// favor kinds, and adds no transition when nothing changed (stub Game,
// extracted helpers only — carried from r63); (d) wrapTeachCensus records
// lessons with pre-call knowledge classification (genuinely-new vs
// already-known) and passes args/return through untouched; (e)
// wrapDropCensus records the pre-call item and passes through; (f) both
// wraps no-op safely when the Game method is absent.
// Usage: node scripts/test-journey-deepening-r69-instruments-20261030.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r69-20261030.js');
const DRIVER68 = path.join(__dirname, 'journey-deepening-r68-20261030.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
check('(a) driver contains R66 census wraps + dated pulls + r68 outputs',
  src.includes('function wrapTeachCensus(G, ctx, dayFn)') && src.includes('function wrapDropCensus(G, ctx, dayFn)') &&
  src.includes('wrapTeachCensus(G, ctx, gday)') && src.includes('wrapDropCensus(G, ctx, gday)') &&
  src.includes('ctx.prepPullDays') && src.includes('prepPullDays: ctx.prepPullDays') &&
  src.includes('journey-deepening-r69-seed${seed}.json') &&
  src.includes('journey-deepening-r69-transcript-') &&
  src.includes('teachLessons: ctx.teachLessons') && src.includes('dropEvents: ctx.dropEvents') &&
  src.includes('offeredSkillTurns') && src.includes('offeredSkillSittings') && src.includes('gateWhy') &&
  src.includes('function subjectPivotPick(') && src.includes('SUBJECT_PIVOT') && src.includes('pivotRecords') && src.includes('PIVOT65') && src.includes('function pagerPick(') && src.includes('PAGER_PROBE') && src.includes('pagerRecords') && src.includes('PAGER66'));
check('(a2) wraps are read-only (pre-call reads before the call, return passed through)',
  src.indexOf('personKnowsSkill(learner, skillId)') < src.indexOf('_ts.apply(this, arguments)') &&
  src.indexOf('G.state.scholar') < src.indexOf('_di.apply(this, arguments)'));
check('(a3) no r68 output filenames left',
  !src.includes('journey-deepening-r68-seed') && !src.includes('journey-deepening-r68-transcript-'));
check('(a4) r69 markers present: hunt arms default OFF + repeat census fields + r69 prereg',
  src.includes("const SUBJECT_PIVOT = process.env.SUBJECT_PIVOT === '1'") &&
  src.includes("const PAGER_PROBE = process.env.PAGER_PROBE === '1'") &&
  src.includes("const TEACH_FIRST = process.env.TEACH_FIRST === '1'") &&
  src.includes('priorLearnWithVid') && src.includes('priorTeachWithVid') &&
  src.includes('journey-deepening-r69-prereg.md'));
// (b) picker identical to r68 (r69 changes no picker code at all)
{
  const src67 = fs.readFileSync(DRIVER68, 'utf8');
  const pick = (s) => {
    const a = s.indexOf('function pickChoice(');
    const b = s.indexOf('\nconst CONVO_DAYS', a);
    if (a < 0 || b < 0) return null;
    return s.slice(a, b);
  };
  const p68 = pick(src), p67 = pick(src67);
  check('(b) pickChoice byte-identical to r68 (panel picker unchanged)', p68 !== null && p68 === p67);
  for (const name of ['ENGAGE', 'ENGAGE2', 'DEFLECT']) {
    const re = new RegExp('const ' + name + ' = \\[.*?\\];', 's');
    check('(b) ' + name + ' identical to r68', re.exec(src)[0] === re.exec(src67)[0]);
  }
}
// (b2) R68 TEACH_FIRST OFF: subjectPivotPick behaves exactly like r67's
// (behavioral equivalence on a battery, since the code legitimately
// gained a TEACH_FIRST branch). ON: teach-first order.
{
  const src67 = fs.readFileSync(DRIVER68, 'utf8');
  const extract = (code, flag) => {
    const a = code.indexOf('function subjectPivotPick(');
    const b = code.indexOf('function pagerPick(', a);
    if (a < 0 || b < 0) return null;
    return new Function('const TEACH_FIRST = ' + flag + ';\n' + code.slice(a, b) + '\nreturn subjectPivotPick;')();
  };
  const f68off = extract(src, 'false'), f67 = extract(src67, 'false');
  const ch = (ids) => ids.map(id => ({ id, label: id }));
  const battery = [
    [ch(['dlg:subject', 'skill_learn:foraging', 'skill_teach:haymaker']), { fired: 0, lessonTaken: false }],
    [ch(['dlg:subject', 'skill_teach:haymaker']), { fired: 0, lessonTaken: false }],
    [ch(['dlg:subject', 'skill_learn:foraging']), { fired: 0, lessonTaken: false }],
    [ch(['dlg:subject', 'leave']), { fired: 0, lessonTaken: false }],
    [ch(['dlg:subject', 'leave']), { fired: 3, lessonTaken: false }],
    [ch(['skill_learn:foraging', 'dlg:subject']), { fired: 0, lessonTaken: true }],
    [ch(['goon', 'leave']), { fired: 0, lessonTaken: false }],
  ];
  let same = f68off !== null && f67 !== null;
  for (const [c, st] of battery) {
    const a = f68off(c, st), b = f67(c, st);
    if (JSON.stringify(a) !== JSON.stringify(b)) same = false;
  }
  check('(b2) subjectPivotPick TEACH_FIRST=OFF behaves like r68 on battery', same);
  const f68on = extract(src, 'true');
  const on1 = f68on(ch(['dlg:subject', 'skill_learn:foraging', 'skill_teach:haymaker']), { fired: 0, lessonTaken: false });
  check('(b2) subjectPivotPick TEACH_FIRST=ON: teach before learn', on1 && on1.action === 'skill' && on1.choice.id === 'skill_teach:haymaker');
  const on2 = f68on(ch(['dlg:subject', 'skill_learn:foraging']), { fired: 0, lessonTaken: false });
  check('(b2) subjectPivotPick TEACH_FIRST=ON: learn-only still taken', on2 && on2.action === 'skill' && on2.choice.id === 'skill_learn:foraging');
  const on3 = f68on(ch(['dlg:subject', 'leave']), { fired: 0, lessonTaken: false });
  check('(b2) subjectPivotPick TEACH_FIRST=ON: pivot fallback unchanged', on3 && on3.action === 'pivot');
}
// (b3) r69 TEACH_FIRST OFF: pagerPick behaves exactly like r68's; ON: teach-first.
{
  const src67 = fs.readFileSync(DRIVER68, 'utf8');
  const extract = (code, flag) => {
    const a = code.indexOf('function pagerPick(');
    const b = code.indexOf('function pickChoice(', a);
    if (a < 0 || b < 0) return null;
    return new Function('const TEACH_FIRST = ' + flag + ';\n' + code.slice(a, b) + '\nreturn pagerPick;')();
  };
  const f68off = extract(src, 'false'), f67 = extract(src67, 'false');
  const ch = (ids) => ids.map(id => ({ id, label: id }));
  const battery = [
    [ch(['ask:gossip', 'skill_learn:foraging', 'skill_teach:haymaker', 'menu:more', 'leave']), { pages: [['ask:gossip', 'skill_learn:foraging', 'skill_teach:haymaker', 'menu:more', 'leave']], moreSteps: 0 }],
    [ch(['ask:gossip', 'skill_teach:haymaker', 'menu:more', 'leave']), { pages: [['ask:gossip', 'skill_teach:haymaker', 'menu:more', 'leave']], moreSteps: 0 }],
    [ch(['ask:gossip', 'menu:more', 'leave']), { pages: [['ask:gossip', 'menu:more', 'leave']], moreSteps: 0 }],
    [ch(['ask:gossip', 'menu:more', 'leave']), { pages: [['ask:gossip', 'menu:more', 'leave'], ['ask:others', 'menu:more', 'leave'], ['ask:gossip', 'menu:more', 'leave']], moreSteps: 2 }],
    [ch(['ask:gossip', 'leave']), { pages: [['ask:gossip', 'leave']], moreSteps: 0 }],
  ];
  let same = f68off !== null && f67 !== null;
  for (const [c, st] of battery) {
    const a = f68off(c, st), b = f67(c, st);
    if (JSON.stringify(a) !== JSON.stringify(b)) same = false;
  }
  check('(b3) pagerPick TEACH_FIRST=OFF behaves like r68 on battery', same);
  const f68on = extract(src, 'true');
  const on1 = f68on(ch(['ask:gossip', 'skill_learn:foraging', 'skill_teach:haymaker', 'menu:more', 'leave']), { pages: [['x']], moreSteps: 0 });
  check('(b3) pagerPick TEACH_FIRST=ON: teach before learn', on1 && on1.action === 'pager-skill' && on1.choice.id === 'skill_teach:haymaker');
}
// (b4) r68-carried: canTeach-why census present and plumbed (init, sitting-open
// block calling canTeachSkill both directions, seed JSON + summary out)
check('(b4) canTeachWhy census present + plumbed',
  src.includes('ctx.canTeachWhySittings = []') &&
  src.includes('canTeachWhySittings: ctx.canTeachWhySittings') &&
  src.includes('canTeachWhySittings: out.canTeachWhySittings') &&
  src.includes("whyCount(vid, 'player')") && src.includes("whyCount('player', vid)") &&
  src.includes('canTeachSkill(teacher, learner, sid)') &&
  src.includes('lessonDayPlayer') && src.includes('lessonDayVid') && src.includes('scholarDay') &&
  src.includes('skillLessonDone'));
// (g) subjectPivotPick pure-rule unit tests (extracted, no Game needed)
{
  const gStart = src.indexOf('function subjectPivotPick(');
  const gEnd = src.indexOf('function pickChoice(', gStart);
  if (gStart < 0 || gEnd < 0) { console.log('FAIL pivot extraction'); process.exit(1); }
  const subjectPivotPick = new Function('const TEACH_FIRST = false;\n' + src.slice(gStart, gEnd) + '\nreturn subjectPivotPick;')();
  const ch = (ids) => ids.map(id => ({ id, label: id }));
  const r1 = subjectPivotPick(ch(['dlg:subject', 'skill_learn:foraging', 'skill_teach:haymaker']), { fired: 0, lessonTaken: false });
  check('(g) skill offered: learn preferred over teach', r1 && r1.action === 'skill' && r1.choice.id === 'skill_learn:foraging');
  const r2 = subjectPivotPick(ch(['dlg:subject', 'skill_teach:haymaker']), { fired: 0, lessonTaken: false });
  check('(g) teach-only offered: teach taken', r2 && r2.action === 'skill' && r2.choice.id === 'skill_teach:haymaker');
  const r3 = subjectPivotPick(ch(['dlg:subject', 'leave']), { fired: 0, lessonTaken: false });
  check('(g) no skill + subject + pivots left: pivot', r3 && r3.action === 'pivot' && r3.choice.id === 'dlg:subject');
  const r4 = subjectPivotPick(ch(['dlg:subject', 'leave']), { fired: 3, lessonTaken: false });
  check('(g) pivot budget spent: null', r4 === null);
  const r5 = subjectPivotPick(ch(['skill_learn:foraging', 'dlg:subject']), { fired: 0, lessonTaken: true });
  check('(g) lesson already taken: null even with skill offered', r5 === null);
  const r6 = subjectPivotPick(ch(['goon', 'leave']), { fired: 0, lessonTaken: false });
  check('(g) no skill, no subject: null', r6 === null);
  const r7 = subjectPivotPick(ch(['dlg:subject', 'leave']), { fired: 2, lessonTaken: false });
  check('(g) third pivot allowed (fired=2)', r7 && r7.action === 'pivot');
}
// (c) favorSnap against a stub Game (extracted helpers only, carried from r63)
const hStart = src.indexOf('function favorRow(');
const hEnd = src.indexOf('// ---- census ----', hStart);
if (hStart < 0 || hEnd < 0 || hEnd <= hStart) { console.log('FAIL helper extraction'); process.exit(1); }
const helperCode = src.slice(hStart, hEnd);
const loadHelpers = (g) => {
  const factory = new Function('_G', 'function gday(){ try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch(e){ return 0; } }\n' + helperCode + '\nreturn { favorRow, favorSnap };');
  return factory(g);
};
{
  const G = { state: { village: { favorLedger: {
    vid1: { id: 'f1', vid: 'vid1', kind: 'forage_help', state: 'asked', askedDay: 40 },
    vid2: { id: 'f2', vid: 'vid2', kind: 'water_haul', state: 'asked', askedDay: 40 },
  }, promises: {} } } };
  const { favorSnap } = loadHelpers(G);
  const ctx = {};
  favorSnap(G, ctx, 'test');
  check('(c) first snap records the forage_help ask only', ctx.favorTransitions.length === 1 && ctx.favorTransitions[0].to === 'asked', 'n=' + ctx.favorTransitions.length);
  G.state.village.favorLedger.vid1.state = 'promised';
  G.state.village.favorLedger.vid1.promisedDay = 45;
  G.state.village.favorLedger.vid1.meetDay = 46;
  favorSnap(G, ctx, 'test');
  check('(c) promise transition recorded with from/to', ctx.favorTransitions.length === 2 && ctx.favorTransitions[1].from === 'asked' && ctx.favorTransitions[1].to === 'promised', 'n=' + ctx.favorTransitions.length);
  favorSnap(G, ctx, 'test');
  check('(c) unchanged state adds no transition', ctx.favorTransitions.length === 2, 'n=' + ctx.favorTransitions.length);
  G.state.village.favorLedger.vid1.state = 'fulfilled';
  G.state.village.favorLedger.vid1.forageRun = { startedDay: 46, forageCount: 1, deliveredKcal: 900, returned: true, returnedDay: 46 };
  G.state.village.promises.vid1 = { kept: true };
  favorSnap(G, ctx, 'test');
  const last = ctx.favorTransitions[ctx.favorTransitions.length - 1];
  check('(c) fulfilled transition carries forageRun + kept', ctx.favorTransitions.length === 3 && last.to === 'fulfilled' && last.row.promiseKept === true && last.row.forageRun.deliveredKcal === 900, 'n=' + ctx.favorTransitions.length);
}
// (d)+(e) wrap behavior against stub Games (extracted wrap functions only)
const wStart = src.indexOf('function wrapTeachCensus(');
const wMid = src.indexOf('function wrapDropCensus(', wStart);
const wEnd = src.indexOf('function makePolicy()', wMid);
if (wStart < 0 || wMid < 0 || wEnd < 0) { console.log('FAIL wrap extraction'); process.exit(1); }
const wrapCode = src.slice(wStart, wEnd);
const loadWraps = () => {
  const factory = new Function(wrapCode + '\nreturn { wrapTeachCensus, wrapDropCensus };');
  return factory();
};
{
  const { wrapTeachCensus, wrapDropCensus } = loadWraps();
  const dayFn = () => 55;
  // teach: stub Game where vidA lacks herbal_remedy, vidB already knows it
  const seen = [];
  const G = {
    personKnowsSkill: (who, sid) => (who === 'vidB' && sid === 'herbal_remedy'),
    teachSkill: function (teacher, learner, sid, opts) { seen.push([teacher, learner, sid, opts && opts.via]); return true; },
  };
  const ctx = {};
  wrapTeachCensus(G, ctx, dayFn);
  const r1 = G.teachSkill('vidA', 'player', 'herbal_remedy', { via: 'conversation' });
  const r2 = G.teachSkill('player', 'vidB', 'herbal_remedy', { via: 'conversation' });
  check('(d) teach passthrough (returns + args untouched)', r1 === true && r2 === true && seen.length === 2 && seen[0][2] === 'herbal_remedy', 'seen=' + JSON.stringify(seen));
  check('(d) genuinely-new classified (preKnown false)', ctx.teachLessons.length === 2 && ctx.teachLessons[0].preKnown === false && ctx.teachLessons[0].result === 'learned' && ctx.teachLessons[0].day === 55, JSON.stringify(ctx.teachLessons[0] || null));
  check('(d) already-known classified (preKnown true)', ctx.teachLessons[1].preKnown === true && ctx.teachLessons[1].teacher === 'player' && ctx.teachLessons[1].learner === 'vidB', JSON.stringify(ctx.teachLessons[1] || null));
  // teach fallback: skillsKnownBy path when personKnowsSkill absent
  const G2 = {
    skillsKnownBy: (who) => (who === 'vidC' ? ['tracking'] : []),
    teachSkill: function () { return false; },
  };
  const ctx2 = {};
  wrapTeachCensus(G2, ctx2, dayFn);
  G2.teachSkill('vidX', 'vidC', 'tracking', { via: 'daily' });
  G2.teachSkill('vidC', 'vidD', 'herbal_remedy', {});
  check('(d) skillsKnownBy fallback classifies', ctx2.teachLessons.length === 2 && ctx2.teachLessons[0].preKnown === true && ctx2.teachLessons[1].preKnown === false && ctx2.teachLessons[0].result === 'not-learned', JSON.stringify(ctx2.teachLessons));
  // (d2) R65 gateWhy: stub Game where teachSkill refuses and canTeachSkill names the gate
  {
    const G4 = {
      personKnowsSkill: () => false,
      canTeachSkill: (t, l, sid) => ({ ok: false, why: 'words' }),
      teachSkill: function () { return false; },
    };
    const ctx4 = {};
    wrapTeachCensus(G4, ctx4, dayFn);
    G4.teachSkill('vidA', 'vidB', 'herbal_remedy', { via: 'villager' });
    check('(d2) not-learned lesson carries gateWhy=words', ctx4.teachLessons.length === 1 && ctx4.teachLessons[0].gateWhy === 'words' && ctx4.teachLessons[0].result === 'not-learned', JSON.stringify(ctx4.teachLessons[0] || null));
    const G5 = {
      personKnowsSkill: () => false,
      canTeachSkill: () => ({ ok: true }),
      teachSkill: function () { return false; },
    };
    const ctx5 = {};
    wrapTeachCensus(G5, ctx5, dayFn);
    G5.teachSkill('vidA', 'vidB', 'herbal_remedy', {});
    check('(d2) gate-passing failure reads ok-but-not-learned', ctx5.teachLessons.length === 1 && ctx5.teachLessons[0].gateWhy === 'ok-but-not-learned', JSON.stringify(ctx5.teachLessons[0] || null));
    const G6 = {
      personKnowsSkill: () => false,
      teachSkill: function () { return true; },
    };
    const ctx6 = {};
    wrapTeachCensus(G6, ctx6, dayFn);
    G6.teachSkill('vidA', 'vidB', 'herbal_remedy', {});
    check('(d2) learned lesson carries gateWhy null', ctx6.teachLessons.length === 1 && ctx6.teachLessons[0].gateWhy === null, JSON.stringify(ctx6.teachLessons[0] || null));
  }
  // drop: stub Game with a branch stack at index 0
  const dropped = [];
  const G3 = {
    state: { scholar: { inventory: [{ itemId: 'branch', units: 5 }, { itemId: 'bark_strip', units: 3 }] } },
    dropItem: function (idx) { dropped.push(idx); return 'left'; },
  };
  const ctx3 = {};
  wrapDropCensus(G3, ctx3, dayFn);
  const rd = G3.dropItem(0);
  check('(e) drop passthrough + pre-call item recorded', rd === 'left' && dropped.length === 1 && ctx3.dropEvents.length === 1 && ctx3.dropEvents[0].itemId === 'branch' && ctx3.dropEvents[0].units === 5 && ctx3.dropEvents[0].day === 55, JSON.stringify(ctx3.dropEvents[0] || null));
  // (f) no-op when methods absent
  const ctx4 = {};
  try {
    wrapTeachCensus({}, ctx4, dayFn);
    wrapDropCensus({}, ctx4, dayFn);
    check('(f) wraps no-op on method-less Game', (ctx4.teachLessons || []).length === 0 && (ctx4.dropEvents || []).length === 0);
  } catch (e) { check('(f) wraps no-op on method-less Game', false, String(e && e.message)); }
}
// (h) pagerPick pure-rule unit tests (extracted, no Game needed)
{
  const gStart = src.indexOf('function pagerPick(');
  const gEnd = src.indexOf('function pickChoice(', gStart);
  if (gStart < 0 || gEnd < 0) { console.log('FAIL pager extraction'); process.exit(1); }
  const pagerPick = new Function('const TEACH_FIRST = false;\n' + src.slice(gStart, gEnd) + '\nreturn pagerPick;')();
  const ch = (ids) => ids.map(id => ({ id, label: id }));
  const p1 = pagerPick(ch(['ask:gossip', 'skill_learn:foraging', 'menu:more', 'leave']), { pages: [['ask:gossip', 'skill_learn:foraging', 'menu:more', 'leave']], moreSteps: 0 });
  check('(h) skill on page: learn taken over more', p1 && p1.action === 'pager-skill' && p1.choice.id === 'skill_learn:foraging');
  const p2 = pagerPick(ch(['ask:gossip', 'skill_teach:haymaker', 'menu:more', 'leave']), { pages: [['ask:gossip', 'skill_teach:haymaker', 'menu:more', 'leave']], moreSteps: 0 });
  check('(h) teach-only on page: teach taken', p2 && p2.action === 'pager-skill' && p2.choice.id === 'skill_teach:haymaker');
  const p3 = pagerPick(ch(['ask:gossip', 'menu:more', 'leave']), { pages: [['ask:gossip', 'menu:more', 'leave']], moreSteps: 0 });
  check('(h) no skill + more + fresh page: advance', p3 && p3.action === 'pager-more' && p3.choice.id === 'menu:more');
  const p4 = pagerPick(ch(['ask:gossip', 'menu:more', 'leave']), { pages: [['ask:gossip', 'menu:more', 'leave'], ['ask:others', 'menu:more', 'leave'], ['ask:gossip', 'menu:more', 'leave']], moreSteps: 2 });
  check('(h) wrapped page repeats page 0: null (cycle)', p4 === null);
  const p5 = pagerPick(ch(['ask:gossip', 'menu:more', 'leave']), { pages: [['ask:gossip', 'menu:more', 'leave']], moreSteps: 8 });
  check('(h) more-step cap reached: null', p5 === null);
  const p6 = pagerPick(ch(['ask:gossip', 'leave']), { pages: [['ask:gossip', 'leave']], moreSteps: 0 });
  check('(h) no more offered: null', p6 === null);
  const p7 = pagerPick(ch(['ask:others', 'menu:more', 'leave']), { pages: [['ask:gossip', 'menu:more', 'leave'], ['ask:others', 'menu:more', 'leave']], moreSteps: 1 });
  check('(h) fresh second page (not a repeat): advance, not cycle', p7 && p7.action === 'pager-more');
}
// (i) r69 DELTA PROOF: pick functions byte-identical to r68 (config-only run)
{
  const src68 = fs.readFileSync(DRIVER68, 'utf8');
  const slice = (s, a, b) => { const i = s.indexOf(a); const j = s.indexOf(b, i); return (i < 0 || j < 0) ? null : s.slice(i, j); };
  check('(i) subjectPivotPick body byte-identical to r68', slice(src, 'function subjectPivotPick(', 'function pagerPick(') === slice(src68, 'function subjectPivotPick(', 'function pagerPick('));
  check('(i) pagerPick body byte-identical to r68', slice(src, 'function pagerPick(', 'function pickChoice(') === slice(src68, 'function pagerPick(', 'function pickChoice('));
  check('(i) pickChoice body byte-identical to r68', slice(src, 'function pickChoice(', '\nconst CONVO_DAYS') === slice(src68, 'function pickChoice(', '\nconst CONVO_DAYS'));
}
if (fail) { console.log('FAILURES: ' + fail); process.exit(1); }
console.log('ALL PASS');
