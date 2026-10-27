#!/usr/bin/env node
// analyze-spandraw-design-b.js — aggregate probe corpora into the
// pre-registered per-action table (sim-spandraw-design-b).
//
// Uses scripts/census-spandraw-b.js censusPayload UNCHANGED (the
// detector): each probe instance payload {seed, nestEvents,
// directRecords, mealDrawRecords} is classified exactly like a
// census payload. This module only aggregates boundary vs control
// instances, classifies refusal reasons from say lines, and builds
// the fixed inventory (all 68 data actions + unwired/combat/UI/
// legacy/god/keepsake sections) so no action is left unclassified.
//
// Refusal classification (from the tap's say lines + result, in
// order): UNWIRED ("isn't wired up yet") -> REFUSED-UNWIRED;
// CONTEXT ("combat action", "needs calm") -> REFUSED-CONTEXT;
// not-held ("don't have") -> GRANT-FAILED; otherwise a false
// result with a say line -> REFUSED-IMPL (the line is kept);
// a true result -> FIRED. A boundary span that crossed with
// internal draws but no item match stays MIXED-NEEDS-READ per the
// census classifier. Zero attribution per action:
//   engine-unwired | engine-structural (combat tick suppression,
//     stated, not probed) | fixture-target | fixture-gate |
//   fixture-pantry | engine-impl (fired but no tick) | none
//   (fired and crossed, or fired with an exclusion).
//
// Usage: node scripts/analyze-spandraw-design-b.js <corpus-dir>
// Prints JSON {perAction, inventory, legs} to stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const { censusPayload } = require('./census-spandraw-b');

function dataActions() {
  const abs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
  const out = [];
  for (const a of abs) {
    for (const act of (a.actions || [])) {
      out.push({ ability: a.id, action: act.id, context: act.context || 'explore',
        cost: act.cost || {}, automatic: !!act.automatic, gardenOnly: !!act.gardenOnly });
    }
  }
  return out;
}

// Impl keys: abilityActions.js IMPLS (51) + gardenCultivation
// cultivate registrations (2) + godpath.js registerVerbs generic
// impls for every data action declaring `do` (15). CORRECTION
// (2026-10-27, probe evidence): the prereg inventory listed those
// 15 as "unwired" because the IMPLS literal does not contain them.
// The probe disproved that: long_table.share_pot FIRED through
// useAbility in every boundary instance, and registerVerbs (which
// runs at Game.init, i.e. inside setupGame) registers a generic
// impl + precheck for every `do` action. Wired total is therefore
// 68/68, not 53/68. The analyzer's wiring table is a code-read
// table, not a probe-outcome table — but a code read that misses
// a whole registration site is a wrong code read, and the probe
// is what caught it. See evidence metric review.
const IMPL_KEYS = new Set([
  'game_sense.read_sign', 'game_sense.read_stance', 'patient_aim.take_aim',
  'patient_aim.clean_shot', 'field_dressing.dress_game', 'tracker.track',
  'stalk.stalk_prey', 'blood_trail.follow_blood', 'ambush.set_ambush',
  'ambush.lay_wait', 'animal_ken.read_beast', 'animal_ken.calm_beast',
  'dead_aim.dead_aim_shot', 'iron_stomach.push_through',
  'trade_of_blows.open_trade', 'trade_of_blows.settle_debt',
  'unbreakable.brace', 'unbreakable.shake_off', 'war_cry.bellow',
  'war_cry.challenge', 'haymaker.throw_haymaker', 'rage.unleash_rage',
  'second_wind.refuse_death', 'fear_aura.loom', 'fear_aura.menace',
  'brawler_instinct.read_fight', 'intimidating_presence.stare_down',
  'intimidating_presence.end_it_before', 'thief.steal_pantry',
  'molt.shed_skin', 'scream_cheese.scream', 'pocket_sand.throw_sand',
  'shoulder_check.shove', 'hogtie.bind', 'come_get_some.goad',
  'static_toss.toss', 'cheese_wheel.hurl', 'bird_strike.call',
  'tripwire.string', 'turncoat.persuade', 'freeze_tag.tag',
  'green_thumb.ask', 'grave_robber.rob_grave', 'mediator.mediate_dispute',
  'leech.leech_stance', 'scarecrow.stage_injury', 'peacemaker.walk_in',
  'peacemaker.make_friends', 'water_breathing.dive_deep',
  'retribution.unleash', 'trophy_room.mark',
  'green_thumb.cultivate', 'green_whisper.cultivate',
  // godpath registerVerbs (`do` actions; generic impl + precheck):
  'aegis_link.link', 'raise_earth.raise', 'gravity_well.pull',
  'landslide.quake', 'pack_hunt.sic', 'mending_hands.mend',
  'blink.blink', 'switcheroo.swap', 'foresight.foresee',
  'live_broadcast.go_live', 'the_crowd_moves.command',
  'stoke.stoke', 'coin_guard.coins', 'bribe.pay_off',
  'long_table.share_pot',
]);

function classifyRefusal(inst) {
  const lines = (inst.sayLines || []).join(' ');
  if (/isn't wired up yet/.test(lines)) return { refusal: 'REFUSED-UNWIRED', reason: lines.slice(0, 200) };
  if (/combat action|needs calm/.test(lines)) return { refusal: 'REFUSED-CONTEXT', reason: lines.slice(0, 200) };
  if (/don't have that ability/.test(lines)) return { refusal: 'GRANT-FAILED', reason: lines.slice(0, 200) };
  if (inst.result === false) return { refusal: 'REFUSED-IMPL', reason: lines.slice(0, 200) };
  if (inst.result === true || inst.result == null) return { refusal: null, reason: lines.slice(0, 200) };
  return { refusal: 'REFUSED-IMPL', reason: lines.slice(0, 200) };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const instances = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const perAction = {};
  for (let fi = 0; fi < instances.length; fi++) {
    const inst = instances[fi];
    inst._file = files[fi];
    const key = inst.ability + '.' + inst.action;
    if (!perAction[key]) perAction[key] = { key, ability: inst.ability, action: inst.action,
      context: inst.context, boundary: [], control: [] };
    const c = censusPayload(inst);
    const row = c.perKey[key];
    const ref = classifyRefusal(inst);
    const rec = { file: inst._file, seed: inst.seed, position: inst.position, target: inst.target,
      grantOk: inst.grantOk, grantMethod: inst.grantMethod, openingKcal: inst.openingKcal,
      result: inst.result, resultError: inst.resultError ? String(inst.resultError).slice(0, 200) : null,
      sayLines: inst.sayLines || [], dayBefore: inst.dayBefore, dayAfter: inst.dayAfter,
      spanLogged: inst.spanLogged, spanCrossed: inst.spanCrossed,
      spanInternalDraws: inst.spanInternalDraws,
      census: row ? { classification: row.classification, spans: row.spans,
        dayCrossingSpans: row.dayCrossingSpans, spansCreatingRecord: row.spansCreatingRecord,
        internalDraws: row.internalDraws, exclusionsKcal: row.exclusionsKcal,
        exclusionSpans: row.exclusionSpans } : null,
      dedup: c.dedup, refusal: ref.refusal, refusalReason: ref.reason };
    // Attach the file name (set by caller loop below via index).
    perAction[key][inst.position === 'A' ? 'boundary' : 'control'].push(rec);
  }
  // Summarize each probed action.
  for (const row of Object.values(perAction)) {
    const b = row.boundary, c = row.control;
    const bCross = b.filter((r) => r.spanCrossed).length;
    const bInternal = b.reduce((t, r) => t + (r.spanInternalDraws || 0), 0);
    const bExcl = b.reduce((t, r) => t + (r.census ? r.census.exclusionsKcal : 0), 0);
    const bLogged = b.filter((r) => r.spanLogged).length;
    const cCross = c.filter((r) => r.spanCrossed).length;
    const refusals = {};
    for (const r of b) if (r.refusal) refusals[r.refusal] = (refusals[r.refusal] || 0) + 1;
    const fired = b.filter((r) => !r.refusal).length;
    let classification;
    if (bExcl > 0 && bCross > 0 && bInternal > 0) classification = 'PROBE-PROVEN';
    else if (bCross > 0 && bInternal === 0 && bExcl === 0) classification = 'SPAN-CROSSES-DAY-NO-DRAW';
    else if (bCross > 0) classification = 'MIXED-NEEDS-READ';
    else if (fired > 0) classification = 'NO-DAY-CROSSING';
    else if (Object.keys(refusals).length) classification = Object.keys(refusals).sort()[0];
    else classification = 'NOT-PROBED';
    // Zero attribution (first applicable, in mechanism order).
    let attribution = 'none';
    if (classification === 'PROBE-PROVEN') attribution = 'none (mechanism proven)';
    else if (refusals['REFUSED-UNWIRED']) attribution = 'engine-unwired';
    else if (refusals['GRANT-FAILED']) attribution = 'fixture-grant';
    else if (b.some((r) => (r.openingKcal == null || r.openingKcal < 1000) && r.spanCrossed)) attribution = 'fixture-pantry';
    else if (refusals['REFUSED-IMPL'] || refusals['REFUSED-CONTEXT']) attribution = 'fixture-world-state';
    else if (fired > 0 && bCross === 0) attribution = 'engine-impl (fired, no day-boundary tick inside span)';
    row.summary = { boundaryInstances: b.length, controlInstances: c.length,
      boundarySpansLogged: bLogged, boundaryCrossed: bCross,
      boundaryInternalDraws: bInternal, boundaryExclusionsKcal: bExcl,
      controlCrossed: cCross, fired, refusals, classification, attribution,
      traces: b.filter((r) => r.census && r.census.exclusionsKcal > 0).slice(0, 2).map((r) => ({
        seed: r.seed, file: r.file, sayLines: r.sayLines,
        census: r.census, spanCrossed: r.spanCrossed })),
    };
  }
  // Fixed inventory: every data action classified, probed or not.
  const inventory = dataActions().map((a) => {
    const key = a.ability + '.' + a.action;
    const probed = perAction[key];
    const wired = IMPL_KEYS.has(key);
    let section, classification;
    if (probed) { section = 'probed-noncombat'; classification = probed.summary.classification; }
    else if (a.context === 'combat') {
      // All 44 combat actions are wired (hand-written or verb
      // generic); the structural rule is what bars day-crossing,
      // not wiring. A combat row can never read 'unwired' here:
      // if wired is false for a combat key, the table above is
      // stale and the row must be investigated, not labeled.
      section = wired ? 'combat-wired-structural' : 'combat-WIRING-TABLE-STALE';
      classification = wired ? 'DAY-CROSSING-IMPOSSIBLE-BY-CONSTRUCTION'
        : 'NOT-PROBED (wiring table disagrees with data — investigate)';
    } else if (a.automatic) { section = 'automatic'; classification = 'NOT-PROBED (automatic trigger, not a tap)'; }
    else { section = 'noncombat-unprobed'; classification = 'NOT-PROBED (missing from probe corpus — LEG 1 failure if pilot)'; }
    return { key, ability: a.ability, action: a.action, context: a.context,
      cost: a.cost, wired, gardenOnly: a.gardenOnly, section, classification,
      probeSummary: probed ? probed.summary : null };
  });
  const uiOnly = [
    { key: 'scream_cheese.scream', note: 'app.js button; combat context; structural rule applies' },
    { key: 'shoulder_check.shove', note: 'app.js button; combat context; structural rule applies' },
    { key: 'hogtie.bind', note: 'app.js button; combat context; structural rule applies' },
    { key: 'come_get_some.goad', note: 'app.js button; combat context; structural rule applies' },
  ];
  const legacy = ['blood_magic', 'time_skip', 'dowsing', 'echo_location',
    'field_medicine', 'herbal_remedy', 'purify', 'compost_king',
    'cannibal_frenzy'].map((id) => ({ ability: id,
    note: 'activateAbility surface, not useAbility; outside the census span logger by construction' }));
  const pseudo = [
    { key: 'keepsake.steady', note: 'keepsakes.js; requires a worn keepsake fixture — FIXTURE-GATED in this probe' },
    { key: 'keepsake.hold', note: 'keepsakes.js; requires a worn keepsake fixture — FIXTURE-GATED in this probe' },
    { key: 'keepsake.lucky_break', note: 'keepsakes.js; requires a worn keepsake fixture — FIXTURE-GATED in this probe' },
    { key: 'god.*', note: 'godverbs.js god verbs; require ascension fixture — FIXTURE-GATED in this probe' },
  ];
  const legs = {
    files: files.length,
    instances: instances.length,
    boundarySpansLogged: instances.filter((i) => i.position === 'A' && i.spanLogged).length,
    boundaryInstances: instances.filter((i) => i.position === 'A').length,
    controlCrossed: instances.filter((i) => i.position === 'B' && i.spanCrossed).length,
    inventoryClassified: inventory.filter((r) => !!r.classification).length,
    inventoryTotal: inventory.length,
    probeProvenKeys: Object.values(perAction).filter((r) => r.summary.classification === 'PROBE-PROVEN').map((r) => r.key),
  };
  return { files, perAction, inventory, uiOnly, legacy, pseudo, legs };
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-spandraw-design-b-corpus');
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { analyzeDir, dataActions, IMPL_KEYS, classifyRefusal };
if (require.main === module) main();
