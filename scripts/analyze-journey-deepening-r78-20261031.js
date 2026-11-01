// analyze-journey-deepening-r78-20261031.js -- R77 analyzer: r76 analyzer
// with ONLY filenames + seed band + run label + the Q5 LURE-OUTCOME CENSUS
// revision (accepts===0 -> INSUFFICIENT-DATA, not FAIL; unclassified =
// accepts with empty outcomeLine; lure-signal scan descriptive only).
// The human classification (GENUINE/DEFERRED/LURE/OTHER) lives in the run
// note, from full transcript reads. PRE-REGISTERED:
// hidden_files/evidence/2026-10-31/journey-deepening-r78-prereg.md
// analyze-journey-deepening-r76-20261031.js -- r75 analyzer, r76 filenames/seeds/label only.
// analyze-journey-deepening-r74-20261031.js -- R74 panel analysis:
// ARMOR-IN-DEEPENING, WAVE2-3 FIGHTS, REGIONAL, STAY-GREEN.
// Reads journey-deepening-r78-seed{42141..42144}.json from the goal
// hidden_files evidence dir (or EVIDIR_OVERRIDE). Pure verdict logic is
// exported as verdicts(seeds) for the proof test; running as a script
// prints the panel report. Writes nothing.
// Usage: node scripts/analyze-journey-deepening-r74-20261031.js
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
    armorLessons, armorOffered,
    w2fights: w2, w3fights: w3n, w3detail: w3party, w3kills,
    regionalEvents: regional.length, firstLinkDay: firstLink,
    linkedCount: linked.length, mislabels,
    inviteMenus: (seed.inviteMenus || []).length,
    inviteAccepts: (seed.inviteAccepts || []).map(a => ({ day: a.day, vid: a.vid, trust: a.trust, outcome: (a.outcomeLine || '').slice(0, 120) })),
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
  const stayGreen = mislabels === 0 ? 'PASS' : 'FAIL';
  return { per, q1, q1a, madePass, q1b, wornPass, barkPass, hideGap, q2, q2NoGo, totalW3, totalW3kills, q3, regPass, stayGreen, mislabels, q5, totalMenus, totalAccepts, unclassified, lureSignal, craftChannel };
}

function main() {
  // EVIDIR_OVERRIDE is an absolute path when set; otherwise resolve relative
  // to this checkout: scripts -> worktree root -> worktrees -> workspace.
  const base = process.env.EVIDIR_OVERRIDE ? process.env.EVIDIR_OVERRIDE
    : path.resolve(__dirname, '..', '..', '..', 'goals',
      'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-31');
  const seeds = [42161, 42162, 42163, 42164].map(s =>
    JSON.parse(fs.readFileSync(path.join(base, `journey-deepening-r78-seed${s}.json`), 'utf8')));
  const v = verdicts(seeds);
  console.log('TOTAL r78:');
  for (const p of v.per) {
    console.log(`seed ${p.seed}: end=${p.end} day=${p.maxDay} wave=${p.finalWave} scale=${p.finalScale} pop=${p.pop} ` +
      `barkMade=${p.barkMade} barkWorn=${p.barkWorn} hideMade=${p.hideMade} hideWorn=${p.hideWorn} daysHidePos=${p.daysHidePos} ` +
      `w2=${p.w2fights} w3=${p.w3fights} w3kills=${p.w3kills} regionalEvents=${p.regionalEvents} firstLinkDay=${p.firstLinkDay} linked=${p.linkedCount} mislabels=${p.mislabels} inviteMenus=${p.inviteMenus} inviteAccepts=${p.inviteAccepts.length}`);
    for (const f of p.w3detail) console.log(`  w3 day=${f.day} ${f.result} rounds=${f.rounds} villagers=${f.villagers} monsters=${f.monsters.join(',')}`);
    for (const a of p.inviteAccepts) console.log(`  invite accept day=${a.day} vid=${a.vid} trust=${a.trust} outcome=${a.outcome}`);
  }
  console.log(`Q1a MADE: ${v.q1a} (bark or hide crafted in ${v.madePass}/4 seeds)`);
  console.log(`Q1c CRAFT-CHANNEL (descriptive): suffBarkDays total ${v.craftChannel.suffBarkDays}, suffHideDays total ${v.craftChannel.suffHideDays}, maxVine panel ${v.craftChannel.maxVine}, copy fails ${v.craftChannel.craftFails}, blocked craft-days ${v.craftChannel.craftBlocked}, armor lessons ${v.craftChannel.armorLessons}, armor offers ${v.craftChannel.armorOffered}`);
  for (const p of v.per) console.log(`  craft seed ${p.seed}: suffBark=${p.suffBarkDays} suffHide=${p.suffHideDays} maxVine=${p.maxVine} fails=${p.craftFails} blocked=${p.craftBlocked} armorLessons=${p.armorLessons} armorOffered=${p.armorOffered}`);
  console.log(`Q1b WORN: ${v.q1b} (bark or hide worn in ${v.wornPass}/4 seeds)`);
  console.log(`HIDE-GAP finding: ${v.hideGap ? 'YES — hide never entered any seed economy' : 'no'}`);
  console.log(`Q2 WAVE2-3 FIGHTS: ${v.q2} (w3 total ${v.totalW3}, w3 kills ${v.totalW3kills})`);
  if (v.q2NoGo) console.log('Q2 NO-GO finding: >=4 wave-3 fights, 0 wave-3 kills — damage wall in window');
  console.log(`Q3 REGIONAL: ${v.q3} (linked/accord in ${v.regPass}/4 seeds)`);
  console.log(`STAY-GREEN death-honesty: ${v.stayGreen} (mislabels ${v.mislabels})`);
  console.log(`Q5 LURE-OUTCOME CENSUS: ${v.q5} (menus offered ${v.totalMenus}, accepts ${v.totalAccepts}, unclassified ${v.unclassified}, descriptive lure-signal ${v.lureSignal}; human classification in run note)`);
  console.log('Q4 PEOPLE: read journey-deepening-r78-transcript-*.txt in full; verdict in run note.');
}

if (require.main === module) main();
module.exports = { verdicts, perSeed, armorWornTorsos };
