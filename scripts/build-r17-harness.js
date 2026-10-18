#!/usr/bin/env node
// build-r17-harness.js — clone journey-deepening-r16-20261017.js into
// journey-deepening-r17-20261017.js with the r17 modifications applied.
// R17 question: the SCARCITY-SUBSTRATE HAUL PIPELINE census. r12 wired the
// full unknown-flesh chain (kill->remember->offer->choose->arrive->pantry->
// fireside-test->reveal); r15/r16 measured 0 hauls on competent substrate.
// Does the chain fire under staged famine (pantry ~2500 at day 40, by
// design) or via the knowledge channel on natural substrate — and where
// exactly does it break? Chain-level instrumentation: every candidate
// offer (famine vs knowledge channel), every HAUL choice, every arrival
// (unknown/known/rot), every fireside test (meat vs plant), every reveal.
// Instrument-only: zero game-code changes.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'scripts', 'journey-deepening-r16-20261017.js');
const DST = path.join(ROOT, 'scripts', 'journey-deepening-r17-20261017.js');

let s = fs.readFileSync(SRC, 'utf8');

const HEADER = `// journey-deepening-r17-20261017.js -- DEEPENING leg R17: the SCARCITY-
// SUBSTRATE HAUL PIPELINE census.
// Base: master@213fdda2 (r15/r16 tip line: crisis r20, succession r21,
// establishment r8 combat-wall legibility, feastvoice-b).
// r15 answered: execution window 40% non-lethal (w3 tricks resolve, cost
// blood); C2'' corrected and measurable; C5 queued on scarcity substrate.
// r16 answered: wave-2 execution window is knowledge-open, action-closed
// (0/192 w2 performances, all 15 kinds un-actuatable in the field model --
// counterwire lane's call); regional scale starts ~day 25-26; M5 NO-GO
// (3/10 senseless, stage-0 seek_taken, handed to the social lane).
// r17 keeps: M1-M8/C1/C3/C4 hold instruments (telemetry baseline vs
// deepening.json), C2'' (corrected bar), C5 report-only (pantryMin +
// end-of-run unknown-flesh units), W2 report-only (does actuation move?),
// R1 report-only.
// r17 new: HAUL PIPELINE census. The full unknown-flesh chain from Steve's
// 2026-10-16 design (villagers HAUL unrevealed monster meat home and may
// TRY it; tasting/trying with usual raw/unrevealed risk and teaching
// reveals it) is wired in code (r12 offer gate famine OR knowledge
// channel; mapmemHaulAt unknown->0-kcal testable pantry items; reveal
// reaches the pantry; villagerExperimentBeat tests pantry flesh once/day
// when the player is present). r15/r16 measured ZERO hauls on competent
// substrate. This run stages famine (pantry ~2500 at day 40, by design,
// reported in scarcityLog) on 2 of 4 seeds to read the famine channel, and
// reads the knowledge channel (r12's fix) on all 4 — recording, at chain
// level, where the pipeline breaks: offered vs not-offered-with-sites,
// chosen vs not-chosen, arrived (unknown/known/rot) vs never-arrived,
// tested vs never-tested, revealed vs never-revealed.
// PRE-REGISTER (2026-10-17, MEASUREMENT.md sections 9-12, 14):
//   Leg question: does the full unknown-flesh pipeline fire in the
//     deepening window under staged famine or via the knowledge channel
//     on natural substrate — and where exactly does the chain break?
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     H1 offers -- >=1 HAUL offer via the famine channel on >=1/2 staged
//       seeds; >=1 via the knowledge channel on >=2/4 seeds (any substrate).
//     H2 choice -- >=1 HAUL objective CHOSEN on >=1/4 seeds.
//     H3 arrival -- >=1 unknown-flesh arrival in the pantry (0-kcal meat_*
//       items) on >=1/4 seeds.
//     H4 test -- >=1 fireside meat-test (villagerExperimentBeat on unknown
//       flesh) on >=1/4 seeds.
//     H5 reveal -- >=1 markMonsterFoodSafe from a hauled test on >=1/4 seeds.
//     C5 hold -- pantry unknown-flesh units at end-of-run, REPORT-ONLY
//       (r15: 0/8, r16: 0/8).
//     M5 people -- >=10 transcripts sense-read, 0 senseless flags (hold on
//       r15 GO / r16 NO-GO; the social lane owns the stage-0 gap).
//     M6 winnable -- alive at day 100 on >=2/4 seeds (staged seeds may die;
//       death-aware stop; scarcity deaths are data).
//   Interesting-finding bar: a haul arriving home with strange meat; a
//   fireside test of monster meat; a reveal; or an exact chain-break
//   (offered-not-chosen / chosen-not-arrived / arrived-never-tested /
//   never-tested-never-revealed) with counts and channel attribution.
//   Horizon: DAYCAP=100, death-aware stop. Seeds: fresh 9001-9004 (pilot
//   scale, MEASUREMENT.md section 9); staged 9001/9003, natural 9002/9004.
//   Policy: competent. SEATDRIVE unset (= driver ON).
// Canon read: CANON.md (2026-10-17); Steve 2026-10-16 haul-unrevealed design
// (in-code comments: villager-mapmem.js, villager-objectives.js,
// villager-agency.js, game.js villagerExperimentBeat). No new canon invented.
// Scarcity staging is a MEASUREMENT substrate (drain to ~2500 kcal at day 40
// on staged seeds), reported in ctx.scarcityLog — not a gameplay change.
// Usage: POLICY=competent SEEDS=9001,9002 node scripts/journey-deepening-r17-20261017.js
`;

s = s.replace(/\/\/ journey-deepening-r16-20261017\.js[\s\S]*?\/\/ Usage: POLICY=competent SEEDS=8901,8902 node scripts\/journey-deepening-r16-20261017\.js\n/, HEADER);
if (s.indexOf('journey-deepening-r17-20261017.js -- DEEPENING leg R17') < 0) { console.error('HEADER REPLACE FAILED'); process.exit(1); }
s = s.split('journey-deepening-r16').join('journey-deepening-r17');
s = s.split('[8901, 8902, 8903, 8904]').join('[9001, 9002, 9003, 9004]');

// R17: module-level haul-chain arrays + staged-seed list.
s = s.replace(
  `let fieldFights14 = [];
let aidCrises14 = [];`,
  `let fieldFights14 = [];
let aidCrises14 = [];
// R17: HAUL PIPELINE chain arrays (kill->remember->offer->choose->arrive->
// pantry->test->reveal). Reset per seed in runSeed.
let haulOffers = [];
let haulChoices = [];
let haulArrivals = [];
let haulTests = [];
let haulReveals = [];
// R17: SCARCITY SUBSTRATE -- staged seeds get the day-40 pantry drain to
// ~2500 kcal (measurement substrate, reported in ctx.scarcityLog).
const R17_STAGED = [9001, 9003];`);
if (s.indexOf('R17_STAGED = [9001, 9003]') < 0) { console.error('ARRAY INSERT FAILED'); process.exit(1); }

// R17: per-seed reset of the haul arrays.
s = s.replace(
  `  fieldFights14 = []; aidCrises14 = [];`,
  `  fieldFights14 = []; aidCrises14 = [];
  haulOffers = []; haulChoices = []; haulArrivals = []; haulTests = []; haulReveals = [];`);
if (s.indexOf('haulOffers = []; haulChoices = [];') < 0) { console.error('RESET INSERT FAILED'); process.exit(1); }

// R17: HAUL PIPELINE wraps — chain-level instrumentation, instrument only,
// return values untouched. Inserted after the raiseAidCrisis wrap.
const WRAPS = `
  // R17: HAUL PIPELINE wraps -- instrument only, zero gameplay effect.
  // Chain: mapmemHaulCandidate (offer; famine vs knowledge channel) ->
  // objHaulFromSite (the pick CHOSE haul) -> mapmemHaulAt (arrival:
  // unknown / known / failed) -> villagerExperimentBeat (fireside test,
  // meat vs plant) -> markMonsterFoodSafe (the reveal).
  try {
    if (typeof Game.mapmemHaulCandidate === 'function') {
      const _mhc17 = Game.mapmemHaulCandidate.bind(Game);
      Game.mapmemHaulCandidate = function (vid, hx, hy) {
        const r = _mhc17(vid, hx, hy);
        try {
          let _pk = 0, _hu = 0, _sites = 0;
          try { _pk = pantryKcal(); } catch (e9) {}
          try { _hu = ((Game.npcNeeds && Game.npcNeeds(vid)) || {}).hunger || 0; } catch (e9) {}
          if (!r) { try { _sites = ((Game.mapmemHaulSites && Game.mapmemHaulSites(vid, hx, hy)) || []).length; } catch (e9) {} }
          haulOffers.push({ day: gday(), vid: vid || null,
            vname: (function () { try { return vname(vid); } catch (e9) { return vid; } })(),
            offered: !!r, famine: (_pk < 5000 || _hu > 50),
            pantry: Math.round(_pk), hunger: Math.round(_hu), sitesAvail: _sites,
            ref: (r && r.ref) || null, estKcal: (r && Math.round(r.estKcal || 0)) || 0 });
        } catch (e9) {}
        return r;
      };
    }
  } catch (e) { console.log('mapmemHaulCandidate wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.objHaulFromSite === 'function') {
      const _ohs17 = Game.objHaulFromSite.bind(Game);
      Game.objHaulFromSite = function (vid, hx, hy, o, site) {
        try {
          haulChoices.push({ day: gday(), vid: vid || null,
            vname: (function () { try { return vname(vid); } catch (e9) { return vid; } })(),
            ref: (site && site.ref) || null, label: (site && (site.label || site.haulLabel)) || null,
            estKcal: Math.round((site && site.estKcal) || 0) });
        } catch (e9) {}
        return _ohs17(vid, hx, hy, o, site);
      };
    }
  } catch (e) { console.log('objHaulFromSite wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.mapmemHaulAt === 'function') {
      const _mha17 = Game.mapmemHaulAt.bind(Game);
      Game.mapmemHaulAt = function (vid) {
        const r = _mha17(vid);
        try {
          let _kind = 'failed';
          try {
            const _o = Game.objOf ? Game.objOf(vid) : null;
            if (_o && _o.haulUnknown && _o.haulUnknown.length) _kind = 'unknown';
            else if (_o && (_o.haulKcal || 0) > 0) _kind = 'known';
          } catch (e9) {}
          haulArrivals.push({ day: gday(), vid: vid || null,
            vname: (function () { try { return vname(vid); } catch (e9) { return vid; } })(),
            ret: !!r, kind: _kind });
        } catch (e9) {}
        return r;
      };
    }
  } catch (e) { console.log('mapmemHaulAt wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.villagerExperimentBeat === 'function') {
      const _veb17 = Game.villagerExperimentBeat.bind(Game);
      Game.villagerExperimentBeat = function (present) {
        const _mark17 = capture.length;
        const r = _veb17(present);
        try {
          const _day17 = gday();
          if ((Game.state.village || {}).lastExperimentDay === _day17) {
            const _txt17 = capture.slice(_mark17).join('\\n');
            haulTests.push({ day: _day17, present: !!present,
              meat: /sets aside time with the/i.test(_txt17), txtLen: _txt17.length });
          }
        } catch (e9) {}
        return r;
      };
    }
  } catch (e) { console.log('villagerExperimentBeat wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.markMonsterFoodSafe === 'function') {
      const _mm17 = Game.markMonsterFoodSafe.bind(Game);
      Game.markMonsterFoodSafe = function (mid, how) {
        const r = _mm17(mid, how);
        try { haulReveals.push({ day: gday(), mid: mid || null, how: how || '?' }); } catch (e9) {}
        return r;
      };
    }
  } catch (e) { console.log('markMonsterFoodSafe wrap ERROR: ' + (e && e.message)); }
`;
s = s.replace(
  `  } catch (e) { console.log('raiseAidCrisis wrap ERROR: ' + (e && e.message)); }
  await setupGame(Game);`,
  `  } catch (e) { console.log('raiseAidCrisis wrap ERROR: ' + (e && e.message)); }
` + WRAPS + `  await setupGame(Game);`);
if (s.indexOf('R17: HAUL PIPELINE wraps') < 0) { console.error('WRAPS INSERT FAILED'); process.exit(1); }

// R17: scarcity staging + haul trace in policy.daily, before knowledgePlay.
s = s.replace(
  `    } catch (e2) {}
    knowledgePlay(ctx);`,
  `    } catch (e2) {}
    // R17: SCARCITY SUBSTRATE -- staged seeds 9001/9003: drain the pantry
    // to ~2500 kcal at day 40 (measurement substrate, NOT gameplay). The
    // famine channel of mapmemHaulCandidate needs pantry < 5000; competent
    // villages rarely go there naturally, so this stages the famine gate on
    // purpose. Recorded in scarcityLog for honesty.
    try {
      const _gd17 = gday();
      if (R17_STAGED.indexOf(_currentSeed) >= 0 && _gd17 >= 40 && !ctx._scarStaged) {
        ctx._scarStaged = true;
        const _pan17 = ((_G.state || {}).village || {}).pantry || [];
        const _tot17 = pantryKcal();
        const _tgt17 = 2500;
        if (_tot17 > _tgt17 && _tot17 > 0) {
          const _f17 = _tgt17 / _tot17;
          for (const _it17 of _pan17) { if (_it17 && (_it17.kcalEach || 0) > 0) _it17.kcalEach = Math.max(1, Math.floor(_it17.kcalEach * _f17)); }
        }
        (ctx.scarcityLog = ctx.scarcityLog || []).push({ day: _gd17, staged: true, before: Math.round(_tot17), after: Math.round(pantryKcal()) });
      }
    } catch (e2) {}
    // R17: haul trace every 10d -- pantry kcal + unknown-flesh units +
    // chain counters, to watch the chain under scarcity vs natural.
    try {
      const _d17 = gday();
      if (_d17 % 10 === 0 && (ctx._haulTraceLast || 0) !== _d17) {
        ctx._haulTraceLast = _d17;
        ctx.haulTrace = ctx.haulTrace || [];
        let _uf17 = 0;
        try { for (const _it17 of (((_G.state || {}).village || {}).pantry || [])) { if (_it17 && _it17.foodKind === 'meat' && _it17.edible === false) _uf17 += (_it17.units == null ? 1 : _it17.units); } } catch (e3) {}
        ctx.haulTrace.push({ day: _d17, pantry: Math.round(pantryKcal()), unknownFleshUnits: _uf17,
          offers: haulOffers.length, choices: haulChoices.length, arrivals: haulArrivals.length,
          tests: haulTests.length, reveals: haulReveals.length,
          staged: R17_STAGED.indexOf(_currentSeed) >= 0 });
      }
    } catch (e2) {}
    knowledgePlay(ctx);`);
if (s.indexOf('R17: SCARCITY SUBSTRATE') < 0) { console.error('DAILY INSERT FAILED'); process.exit(1); }

// R17: haul-pipeline summary block, inserted before the `const out = {` summary.
const HAULBLOCK = `
  // R17: HAUL PIPELINE census -- the unknown-flesh chain end to end.
  // kill->remember (mapmemHaulSites) -> offer (mapmemHaulCandidate, famine
  // vs knowledge channel) -> choice (objHaulFromSite) -> arrival
  // (mapmemHaulAt: unknown / known / failed) -> pantry -> fireside test
  // (villagerExperimentBeat: meat vs plant) -> reveal (markMonsterFoodSafe).
  const _ho17 = haulOffers, _hc17 = haulChoices, _ha17 = haulArrivals, _ht17 = haulTests, _hr17 = haulReveals;
  const _hoOff17 = _ho17.filter(o => o.offered);
  const haulSummary = {
    staged: R17_STAGED.indexOf(seed) >= 0,
    scarcityLog: ctx.scarcityLog || [],
    haulTrace: ctx.haulTrace || [],
    offers: {
      calls: _ho17.length, offered: _hoOff17.length,
      famineChannel: _hoOff17.filter(o => o.famine).length,
      knowledgeChannel: _hoOff17.filter(o => !o.famine).length,
      notOfferedWithSites: _ho17.filter(o => !o.offered && o.sitesAvail > 0).length,
      detail: _hoOff17.slice(0, 12),
    },
    choices: { chosen: _hc17.length, detail: _hc17.slice(0, 12) },
    arrivals: {
      total: _ha17.length,
      unknown: _ha17.filter(a => a.kind === 'unknown').length,
      known: _ha17.filter(a => a.kind === 'known').length,
      failed: _ha17.filter(a => a.kind === 'failed').length,
      detail: _ha17.slice(0, 16),
    },
    tests: { total: _ht17.length, meat: _ht17.filter(t => t.meat).length, detail: _ht17.filter(t => t.meat).slice(0, 10) },
    reveals: { total: _hr17.length, detail: _hr17.slice(0, 10) },
  };
`;
const anchor = '  const out = {\n';
if (s.indexOf(anchor) < 0) { console.error('ANCHOR MISSING: const out = {'); process.exit(1); }
s = s.replace(anchor, HAULBLOCK + anchor);

// R17: extend the out object with the haul census.
s = s.replace(
  `    regional: { scaleTrace, regionalEvents, linkEvents, maxScale },
  };`,
  `    regional: { scaleTrace, regionalEvents, linkEvents, maxScale },
    // R17: haul pipeline census
    haul: haulSummary,
  };`);
if (s.indexOf('haul: haulSummary,') < 0) { console.error('OUT EXTEND FAILED'); process.exit(1); }

// R17: extend the per-seed DONE line with haul stats.
s = s.replace(
  'links=${linkEvents.length} ms=${result.ms}',
  'links=${linkEvents.length} haulOff=${haulSummary.offers.offered} haulCh=${haulSummary.choices.chosen} haulUnk=${haulSummary.arrivals.unknown} tests=${haulSummary.tests.meat} rev=${haulSummary.reveals.total} ms=${result.ms}');
if (s.indexOf('haulOff=${haulSummary.offers.offered}') < 0) { console.error('DONE-LINE EXTEND FAILED'); process.exit(1); }

fs.writeFileSync(DST, s);
console.log('wrote', DST, s.length, 'bytes');
try { require('child_process').execSync(`node --check ${DST}`, { stdio: 'inherit' }); console.log('node --check OK'); }
catch (e) { console.error('node --check FAILED'); process.exit(1); }
