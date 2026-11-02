// analyze-journey-deepening-r84-20261102.js -- R84 analyzer: r83 analyzer with ONLY filenames + seed band 42231..42234 + run label + Q7 teach-page verdict + page-walk tallies + Q6 requirements lines + Q2b wave-4 detail reporting + pooled rate vs r80-r83 (48 sittings, 10 offers). Base: master@b312c404b. PRE-REGISTERED: hidden_files/evidence/2026-11-02/journey-deepening-r84-prereg.md
// analyze-journey-deepening-r84-20261102.js -- R81 analyzer: r80 analyzer
// with ONLY filenames + seed band 42231..42234 + run label + favor
// totals/lines (Q6 descriptive). Binding verdicts unchanged. Base:
// master@9a765cd54. PRE-REGISTERED:
// hidden_files/evidence/2026-11-02/journey-deepening-r84-prereg.md
// analyze-journey-deepening-r80-20261102.js -- R80 analyzer: r79 analyzer
// with ONLY filenames + seed band 42191..42194 + run label + Q1c promoted
// from descriptive to BINDING (q1c PASS iff armor lessons + armor offers
// >= 1 panel-wide), per r79's metric review. Base: master@7c0f1f4d0.
// analyze-journey-deepening-r79-20261102.js -- R79 analyzer: r78 analyzer
// with ONLY filenames + seed band 42231..42234 + run label + Q5 lure-rate
// descriptive lines. Base: master@5f2d17bf7.
// analyze-journey-deepening-r79-20261102.js -- R77 analyzer: r76 analyzer
// with ONLY filenames + seed band + run label + the Q5 LURE-OUTCOME CENSUS
// revision (accepts===0 -> INSUFFICIENT-DATA, not FAIL; unclassified =
// accepts with empty outcomeLine; lure-signal scan descriptive only).
// The human classification (GENUINE/DEFERRED/LURE/OTHER) lives in the run
// note, from full transcript reads. PRE-REGISTERED:
// hidden_files/evidence/2026-11-02/journey-deepening-r80-prereg.md
// analyze-journey-deepening-r76-20261102.js -- r75 analyzer, r76 filenames/seeds/label only.
// analyze-journey-deepening-r74-20261102.js -- R74 panel analysis:
// ARMOR-IN-DEEPENING, WAVE2-3 FIGHTS, REGIONAL, STAY-GREEN.
// Reads journey-deepening-r84-seed{42231..42234}.json from the goal
// hidden_files evidence dir (or EVIDIR_OVERRIDE). Pure verdict logic is
// exported as verdicts(seeds) for the proof test; running as a script
// prints the panel report. Writes nothing.
// Usage: node scripts/analyze-journey-deepening-r74-20261102.js
'use strict';
const fs = require('fs');
const path = require('path');

function armorWornTorsos(seed) {
  const out = new Set();
  const snaps = ((seed.armor || {}).snaps || []);
  for (const s of snaps) {
    for (const v of (s.armoredVillagers || [])) {
      if (v.torso === 'bark_armor' || v.torso === 'hide_armor') out.add(v.torso);
    }
  }
  const torso = (((seed.armor || {}).schEquipped || {}).torso || {}).itemId;
  if (torso === 'bark_armor' || torso === 'hide_armor') out.add(torso);
  return out;
}

function perSeed(seed) {
  const armor = seed.armor || {};
  const made = (armor.craftArmor || {}).made || {};
  const worn = armorWornTorsos(seed);
  const matflow = armor.matflow || {};
  const craft = armor.craftArmor || {};
  const fails = craft.fails || {};
  const blocked = craft.blocked || {};
  const lessons = seed.teachLessons || [];
  const armorLessons = lessons.filter(t => String(t.skill || '').includes('armor')).length;
  const armorLessonsLearned = lessons.filter(t => String(t.skill || '').includes('armor') && t.result === 'learned').length;
  const teachArmPicks = seed.teachArmPicks || [];
  const teachArmPickN = teachArmPicks.filter(p => p.kind === 'pick').length;
  const teachArmPivotN = teachArmPicks.filter(p => p.kind === 'pivot').length;
  const teachArmPageN = teachArmPicks.filter(p => p.kind === 'page').length;
  const favorReqReads = seed.favorReqReads || [];
  const w4 = seed.w4fights || [];
  const w4kills = w4.filter(f => f.result === 'won').length;
  const w4detail = w4.map(f => ({
    day: f.day, result: f.result, rounds: f.rounds,
    villagers: (f.endHp || []).filter(e => e.kind === 'villager').length,
    monsters: (f.monsters || []).map(m => m.mid),
  }));
  const armorOffered = (seed.offeredSkillSittings || []).filter(x =>
    (x.offeredLearn || []).concat(x.offeredTeach || []).some(o => String(o).includes('armor'))).length;
  const regional = seed.regionalLog || [];
  const linked = regional.filter(e => e.result === 'linked' || e.ev === 'accord');
  const firstLink = linked.length ? linked[0].day : null;
  const w3 = seed.w3fights || [];
  const w3kills = w3.filter(f => f.result === 'won').length;
  const w3party = w3.map(f => ({
    day: f.day, result: f.result, rounds: f.rounds,
    villagers: (f.endHp || []).filter(e => e.kind === 'villager').length,
    monsters: (f.monsters || []).map(m => m.mid),
  }));
  const fbw = seed.fightsByWave || {};
  const w2 = parseInt(fbw['2'] || 0, 10);
  const w3n = parseInt(fbw['3'] || 0, 10);
  const w4n = parseInt(fbw['4'] || 0, 10);
  const sittings = (seed.offeredSkillSittings || []).length;
  const favorTransitions = {};
  for (const t of (((seed.favorCensus || {}).transitions) || [])) {
    const k = `${t.from === null || t.from === undefined ? 'None' : t.from}->${t.to}`;
    favorTransitions[k] = (favorTransitions[k] || 0) + 1;
  }
  const census = seed.census || [];
  const alive = census.filter(c => c.alive).length;
  const mislabels = ((seed.deathHonesty || {}).mislabels || []).length;
  return {
    seed: seed.seed, end: seed.endReason, maxDay: seed.maxGameDay,
    finalWave: seed.finalWave, finalScale: seed.finalScale,
    pop: `${alive}/${census.length}`,
    barkMade: made.bark_armor || 0, hideMade: made.hide_armor || 0,
    barkWorn: worn.has('bark_armor'), hideWorn: worn.has('hide_armor'),
    daysHidePos: matflow.daysHidePos || 0, maxHide: matflow.maxHide || 0,
    suffBarkDays: matflow.suffBarkDays || 0, suffHideDays: matflow.suffHideDays || 0,
    maxVine: matflow.maxVine || 0,
    craftFails: Object.values(fails).reduce((t, n) => t + (n || 0), 0),
    craftBlocked: Object.values(blocked).reduce((t, n) => t + (n || 0), 0),
    armorLessons, armorLessonsLearned, armorOffered,
    teachArmPicks, teachArmPickN, teachArmPivotN, teachArmPageN,
    favorReqReads: favorReqReads.map(a => ({ day: a.day, vid: a.vid, turn: a.turn, favorKind: a.favorKind, outcome: (a.outcomeLine || '').slice(0, 160) })),
    w2fights: w2, w3fights: w3n, w4fights: w4n, w4detail, w4kills, sittings, favorTransitions,
    w3detail: w3party, w3kills,
    regionalEvents: regional.length, firstLinkDay: firstLink,
    linkedCount: linked.length, mislabels,
    inviteMenus: (seed.inviteMenus || []).length,
    inviteAccepts: (seed.inviteAccepts || []).map(a => ({ day: a.day, vid: a.vid, trust: a.trust, outcome: (a.outcomeLine || '').slice(0, 120) })),
    favorOffers: (seed.favorOffers || []).length,
    favorDelivers: (seed.favorDelivers || []).map(a => ({ day: a.day, vid: a.vid, trust: a.trust, outcome: (a.outcomeLine || '').slice(0, 120) })),
  };
}

function verdicts(seeds) {
  const per = seeds.map(perSeed);
  // R73 Q1 SPLIT (r72 metric review, verbatim): made and worn judged separately.
  const madePass = per.filter(p => p.barkMade >= 1 || p.hideMade >= 1).length;
  const q1a = madePass >= 2 ? 'PASS' : 'FAIL';
  const wornPass = per.filter(p => p.barkWorn || p.hideWorn).length;
  const q1b = wornPass >= 3 ? 'PASS' : 'FAIL';
  const barkPass = per.filter(p => p.barkMade >= 1 && p.barkWorn).length;
  const q1 = q1a; // legacy field kept for old readers: the made half is the binding one
  const hideGap = per.every(p => p.hideMade === 0 && !p.hideWorn && p.daysHidePos === 0);
  const totalW3 = per.reduce((t, p) => t + p.w3fights, 0);
  const totalW3kills = per.reduce((t, p) => t + p.w3kills, 0);
  const w2w3PerSeed = per.every(p => (p.w2fights + p.w3fights) >= 1);
  const q2 = (w2w3PerSeed && totalW3kills >= 1) ? 'PASS' : 'FAIL';
  const q2NoGo = (totalW3 >= 4 && totalW3kills === 0);
  const regPass = per.filter(p => p.linkedCount >= 1).length;
  const q3 = regPass >= 3 ? 'PASS' : 'FAIL';
  const totalMenus = per.reduce((t, p) => t + p.inviteMenus, 0);
  const totalAccepts = per.reduce((t, p) => t + p.inviteAccepts.length, 0);
  const unclassified = per.reduce((t, p) => t + p.inviteAccepts.filter(x => !x.outcome).length, 0);
  const lureSignal = per.reduce((t, p) => t + p.inviteAccepts.filter(x => /lure|trap|ambush|betray|plot/i.test(x.outcome || '')).length, 0);
  const q5 = totalAccepts === 0 ? 'INSUFFICIENT-DATA' : (unclassified === 0 ? 'PASS' : 'FAIL');
  const mislabels = per.reduce((t, p) => t + p.mislabels, 0);
  const craftChannel = {
    suffBarkDays: per.reduce((t, p) => t + p.suffBarkDays, 0),
    suffHideDays: per.reduce((t, p) => t + p.suffHideDays, 0),
    maxVine: Math.max(...per.map(p => p.maxVine)),
    craftFails: per.reduce((t, p) => t + p.craftFails, 0),
    craftBlocked: per.reduce((t, p) => t + p.craftBlocked, 0),
    armorLessons: per.reduce((t, p) => t + p.armorLessons, 0),
    armorOffered: per.reduce((t, p) => t + p.armorOffered, 0),
  };
  const q1c = (craftChannel.armorLessons + craftChannel.armorOffered >= 1) ? 'PASS' : 'FAIL';
  const totalFavorOffers = per.reduce((t, p) => t + p.favorOffers, 0);
  const totalSittings = per.reduce((t, p) => t + p.sittings, 0);
  const q1cRate = totalSittings ? (craftChannel.armorOffered / totalSittings) : 0;
  const pooledSittings = 48 + totalSittings; // r80-r83 pooled denominator (48 sittings, 10 offers)
  const pooledOffers = 10 + craftChannel.armorOffered;
  const pooledRate = pooledSittings ? (pooledOffers / pooledSittings) : 0;
  const totalW4 = per.reduce((t, p) => t + p.w4fights, 0);
  const totalW4kills = per.reduce((t, p) => t + p.w4kills, 0);
  const totalArmorLessonsLearned = per.reduce((t, p) => t + p.armorLessonsLearned, 0);
  const q7 = totalArmorLessonsLearned >= 1 ? 'PASS' : 'FAIL';
  const totalTeachArmPicks = per.reduce((t, p) => t + p.teachArmPickN, 0);
  const totalTeachArmPivots = per.reduce((t, p) => t + p.teachArmPivotN, 0);
  const totalTeachArmPages = per.reduce((t, p) => t + p.teachArmPageN, 0);
  const totalFavorReqReads = per.reduce((t, p) => t + p.favorReqReads.length, 0);
  const favorTransitionCounts = {};
  for (const p of per) for (const [k, n] of Object.entries(p.favorTransitions || {})) favorTransitionCounts[k] = (favorTransitionCounts[k] || 0) + n;
  const totalFavorDelivers = per.reduce((t, p) => t + p.favorDelivers.length, 0);
  const stayGreen = mislabels === 0 ? 'PASS' : 'FAIL';
  return { per, q1, q1a, madePass, q1b, wornPass, barkPass, hideGap, q1c, q1cRate, totalSittings, pooledSittings, pooledOffers, pooledRate, totalW4, totalW4kills, q7, totalArmorLessonsLearned, totalTeachArmPicks, totalTeachArmPivots, totalTeachArmPages, totalFavorReqReads, favorTransitionCounts, q2, q2NoGo, totalW3, totalW3kills, q3, regPass, stayGreen, mislabels, q5, totalMenus, totalAccepts, unclassified, lureSignal, craftChannel, totalFavorOffers, totalFavorDelivers };
}

function main() {
  // EVIDIR_OVERRIDE is an absolute path when set; otherwise resolve relative
  // to this checkout: scripts -> worktree root -> worktrees -> workspace.
  const base = process.env.EVIDIR_OVERRIDE ? process.env.EVIDIR_OVERRIDE
    : path.resolve(__dirname, '..', '..', '..', 'goals',
      'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-02');
  const seeds = [42231, 42232, 42233, 42234].map(s =>
    JSON.parse(fs.readFileSync(path.join(base, `journey-deepening-r84-seed${s}.json`), 'utf8')));
  const v = verdicts(seeds);
  console.log('TOTAL r84:');
  for (const p of v.per) {
    console.log(`seed ${p.seed}: end=${p.end} day=${p.maxDay} wave=${p.finalWave} scale=${p.finalScale} pop=${p.pop} ` +
      `barkMade=${p.barkMade} barkWorn=${p.barkWorn} hideMade=${p.hideMade} hideWorn=${p.hideWorn} daysHidePos=${p.daysHidePos} ` +
      `w2=${p.w2fights} w3=${p.w3fights} w3kills=${p.w3kills} regionalEvents=${p.regionalEvents} firstLinkDay=${p.firstLinkDay} linked=${p.linkedCount} mislabels=${p.mislabels} inviteMenus=${p.inviteMenus} inviteAccepts=${p.inviteAccepts.length}`);
    for (const f of p.w3detail) console.log(`  w3 day=${f.day} ${f.result} rounds=${f.rounds} villagers=${f.villagers} monsters=${f.monsters.join(',')}`);
    for (const a of p.inviteAccepts) console.log(`  invite accept day=${a.day} vid=${a.vid} trust=${a.trust} outcome=${a.outcome}`);
    console.log(`  favor: offers=${p.favorOffers} delivers=${p.favorDelivers.length} sittings=${p.sittings} w4fights=${p.w4fights} w4kills=${p.w4kills} favorTransitions=${JSON.stringify(p.favorTransitions)}`);
    for (const f of p.favorDelivers) console.log(`  favor deliver day=${f.day} vid=${f.vid} trust=${f.trust} outcome=${f.outcome}`);
    for (const f of p.w4detail) console.log(`  w4 day=${f.day} ${f.result} rounds=${f.rounds} villagers=${f.villagers} monsters=${f.monsters.join(',')}`);
    for (const a of p.teachArmPicks) console.log(`  teach84 day=${a.day} vid=${a.vid} kind=${a.kind} choice=${a.choice} outcome=${(a.outcomeLine || '').slice(0, 120)}`);
    for (const a of p.favorReqReads) console.log(`  req84 day=${a.day} vid=${a.vid} turn=${a.turn} favorKind=${a.favorKind} outcome=${a.outcome}`);
  }
  console.log(`Q1a MADE: ${v.q1a} (bark or hide crafted in ${v.madePass}/4 seeds)`);
  console.log(`Q1c CRAFT-CHANNEL RATE (BINDING r84): ${v.q1c} (PASS iff >=1 armor offer or lesson panel-wide; rate ${v.craftChannel.armorOffered}/${v.totalSittings} = ${v.q1cRate.toFixed(3)} per sitting; pooled vs r80-r83: ${v.pooledOffers}/${v.pooledSittings} = ${v.pooledRate.toFixed(3)}) — suffBarkDays total ${v.craftChannel.suffBarkDays}, suffHideDays total ${v.craftChannel.suffHideDays}, maxVine panel ${v.craftChannel.maxVine}, copy fails ${v.craftChannel.craftFails}, blocked craft-days ${v.craftChannel.craftBlocked}, armor lessons ${v.craftChannel.armorLessons}, armor offers ${v.craftChannel.armorOffered}`);
  console.log(`Q7 TEACH-PAGE (BINDING r84): ${v.q7} (armor lessons learned ${v.totalArmorLessonsLearned}; arm picks ${v.totalTeachArmPicks}, arm pivots ${v.totalTeachArmPivots}, arm page steps ${v.totalTeachArmPages})`);
  for (const p of v.per) console.log(`  craft seed ${p.seed}: suffBark=${p.suffBarkDays} suffHide=${p.suffHideDays} maxVine=${p.maxVine} fails=${p.craftFails} blocked=${p.craftBlocked} armorLessons=${p.armorLessons} armorOffered=${p.armorOffered}`);
  console.log(`Q1b WORN: ${v.q1b} (bark or hide worn in ${v.wornPass}/4 seeds)`);
  console.log(`HIDE-GAP finding: ${v.hideGap ? 'YES — hide never entered any seed economy' : 'no'}`);
  console.log(`Q2 WAVE2-3 FIGHTS: ${v.q2} (w3 total ${v.totalW3}, w3 kills ${v.totalW3kills})`);
  if (v.q2NoGo) console.log('Q2 NO-GO finding: >=4 wave-3 fights, 0 wave-3 kills — damage wall in window');
  console.log(`Q3 REGIONAL: ${v.q3} (linked/accord in ${v.regPass}/4 seeds)`);
  console.log(`STAY-GREEN death-honesty: ${v.stayGreen} (mislabels ${v.mislabels})`);
  console.log(`Q5 LURE-OUTCOME CENSUS: ${v.q5} (menus offered ${v.totalMenus}, accepts ${v.totalAccepts}, unclassified ${v.unclassified}, descriptive lure-signal ${v.lureSignal}; human classification in run note)`);
  console.log(`Q6 FAVOR-DELIVER (DESCRIPTIVE r84): offers ${v.totalFavorOffers}, delivers ${v.totalFavorDelivers}, requirements reads ${v.totalFavorReqReads} (arm caps at 1/seed; outcomes + census transitions classified in run note)`);
  console.log(`Q2b WAVE-4 WALL (DESCRIPTIVE r84): wave-4 fights panel-wide ${v.totalW4}, wave-4 kills ${v.totalW4kills} (r80-r83 record: 6 fights with unknown outcomes on top of 0 kills on 10 fights)`);
  console.log(`Q6 favor-census transitions panel-wide: ${JSON.stringify(v.favorTransitionCounts)}`);
  console.log('Q4 PEOPLE: read journey-deepening-r84-transcript-*.txt in full; verdict in run note.');
  console.log('Q7/Q6 detail: teach84 picks + req84 reads printed per seed above.');
}

if (require.main === module) main();
module.exports = { verdicts, perSeed, armorWornTorsos };
