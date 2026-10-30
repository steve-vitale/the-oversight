// analyze-journey-deepening-r72-20261030.js -- R72 panel analysis:
// ARMOR-IN-DEEPENING, WAVE2-3 FIGHTS, REGIONAL, STAY-GREEN.
// Reads journey-deepening-r72-seed{42101..42104}.json from the goal
// hidden_files evidence dir (or EVIDIR_OVERRIDE). Pure verdict logic is
// exported as verdicts(seeds) for the proof test; running as a script
// prints the panel report. Writes nothing.
// Usage: node scripts/analyze-journey-deepening-r72-20261030.js
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
    w2fights: w2, w3fights: w3n, w3detail: w3party, w3kills,
    regionalEvents: regional.length, firstLinkDay: firstLink,
    linkedCount: linked.length, mislabels,
  };
}

function verdicts(seeds) {
  const per = seeds.map(perSeed);
  const barkPass = per.filter(p => p.barkMade >= 1 && p.barkWorn).length;
  const q1 = barkPass >= 3 ? 'PASS' : 'FAIL';
  const hideGap = per.every(p => p.hideMade === 0 && !p.hideWorn && p.daysHidePos === 0);
  const totalW3 = per.reduce((t, p) => t + p.w3fights, 0);
  const totalW3kills = per.reduce((t, p) => t + p.w3kills, 0);
  const w2w3PerSeed = per.every(p => (p.w2fights + p.w3fights) >= 1);
  const q2 = (w2w3PerSeed && totalW3kills >= 1) ? 'PASS' : 'FAIL';
  const q2NoGo = (totalW3 >= 4 && totalW3kills === 0);
  const regPass = per.filter(p => p.linkedCount >= 1).length;
  const q3 = regPass >= 3 ? 'PASS' : 'FAIL';
  const mislabels = per.reduce((t, p) => t + p.mislabels, 0);
  const stayGreen = mislabels === 0 ? 'PASS' : 'FAIL';
  return { per, q1, barkPass, hideGap, q2, q2NoGo, totalW3, totalW3kills, q3, regPass, stayGreen, mislabels };
}

function main() {
  // EVIDIR_OVERRIDE is an absolute path when set; otherwise resolve relative
  // to this checkout: scripts -> worktree root -> worktrees -> workspace.
  const base = process.env.EVIDIR_OVERRIDE ? process.env.EVIDIR_OVERRIDE
    : path.resolve(__dirname, '..', '..', '..', 'goals',
      'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-30');
  const seeds = [42101, 42102, 42103, 42104].map(s =>
    JSON.parse(fs.readFileSync(path.join(base, `journey-deepening-r72-seed${s}.json`), 'utf8')));
  const v = verdicts(seeds);
  console.log('TOTAL r72:');
  for (const p of v.per) {
    console.log(`seed ${p.seed}: end=${p.end} day=${p.maxDay} wave=${p.finalWave} scale=${p.finalScale} pop=${p.pop} ` +
      `barkMade=${p.barkMade} barkWorn=${p.barkWorn} hideMade=${p.hideMade} hideWorn=${p.hideWorn} daysHidePos=${p.daysHidePos} ` +
      `w2=${p.w2fights} w3=${p.w3fights} w3kills=${p.w3kills} regionalEvents=${p.regionalEvents} firstLinkDay=${p.firstLinkDay} linked=${p.linkedCount} mislabels=${p.mislabels}`);
    for (const f of p.w3detail) console.log(`  w3 day=${f.day} ${f.result} rounds=${f.rounds} villagers=${f.villagers} monsters=${f.monsters.join(',')}`);
  }
  console.log(`Q1 ARMOR-IN-DEEPENING: ${v.q1} (bark made+worn ${v.barkPass}/4)`);
  console.log(`HIDE-GAP finding: ${v.hideGap ? 'YES — hide never entered any seed economy' : 'no'}`);
  console.log(`Q2 WAVE2-3 FIGHTS: ${v.q2} (w3 total ${v.totalW3}, w3 kills ${v.totalW3kills})`);
  if (v.q2NoGo) console.log('Q2 NO-GO finding: >=4 wave-3 fights, 0 wave-3 kills — damage wall in window');
  console.log(`Q3 REGIONAL: ${v.q3} (linked/accord in ${v.regPass}/4 seeds)`);
  console.log(`STAY-GREEN death-honesty: ${v.stayGreen} (mislabels ${v.mislabels})`);
  console.log('Q4 PEOPLE: read journey-deepening-r72-transcript-*.txt in full; verdict in run note.');
}

if (require.main === module) main();
module.exports = { verdicts, perSeed, armorWornTorsos };
