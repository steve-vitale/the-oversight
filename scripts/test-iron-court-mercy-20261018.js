#!/usr/bin/env node
// IRON COURT MERCY PROOF (journey scale r7, 2026-10-18):
// The beat's MERCY copy promises the realm a season to earn the trust:
//   "The yoke comes off — ... and the hatred starts to decay. X don't
//   trust it yet. They might, in a season. (Trust +8 with each.)"
// But the engine dissolves the realm the NEXT MORNING: MERCY clears the
// conquered flags, flipping the hold bar from season-only (conquest) to
// season+trust-40 (lead) overnight, while +8 on strike-trust 15 /
// terms-trust 25 lands at 23/33 — short of 40. The "kind conqueror" choice
// is a trap: the realm "comes apart" the day after the court, exactly what
// the beat promised wouldn't happen.
// FIX: MERCY stamps the links mercyUntil = day+30 (one season of grace).
// _linkSeasoned waives the trust component for polity membership while the
// grace holds; after the season the LEAD bar (trust 40+) applies honestly —
// dissolve aloud if unearned, hold if tended. The beat's promise, kept.
// Run: SEEDS=7,42,99 node scripts/test-iron-court-mercy-20261018.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [7, 42, 99]);

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

async function runSeed(seed) {
  console.log(`\n### SEED ${seed}`);
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const says = [];
  const osay = Game.say.bind(Game);
  Game.say = (t) => { says.push(String(t)); return osay(t); };
  const saidHas = (re) => says.some(t => re.test(t));

  // synthesize other villages (test setup only — mirrors
  // test-national-shapes-20261010.js)
  while (Game.state.otherVillages.filter(v => v && v.id !== 'haven').length < 7) {
    const base = Game.state.otherVillages.filter(v => v && v.id !== 'haven');
    const t = Object.assign({}, base[base.length - 1]);
    const n = base.length;
    t.id = 'village_mercy' + n; t.name = 'Mercyholm' + n; t.x = (t.x + 3 * n) % 9;
    t.generated = true; t.rumored = false; t.opinion = 0;
    Game.state.otherVillages.push(t);
  }
  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
  ovs.forEach(v => { v.generated = true; v.opinion = 0; });
  // the rung gate is proven elsewhere (test-scale-pacing.js) — set the
  // regional rung old enough that the beat can stage
  try { Game.state.networkLive = true; } catch (e) {}
  try { Game.state.networkLiveDay = (Game.state.scholar.day || 0) - 31; } catch (e) {}

  // a real war-realm: 3 conquered fires, seasoned (31 days), strike trust 15
  const day0 = Game.state.scholar.day || 0;
  for (const v of [ovs[3], ovs[4], ovs[5]]) {
    const l = Game._formLink(v.id, { asSubordinate: false, tributeKcalPerWeek: 7000 }, null);
    l.conquered = true; l.trust = 15; l.day = day0 - 31;
  }
  ok(Game.polityOf('haven') && Game.polityOf('haven').shape === 'conquest', 'war-realm reads as conquest polity');
  Game._checkNational();
  const pn = Game.state.pendingNational;
  ok(!!pn && pn.shape === 'conquest', `iron court staged (got ${pn && pn.shape})`);
  says.length = 0;
  ok(Game.answerNationalChoice('mercy') === true, 'iron court answered: mercy');
  ok(Game.state.nationalLive === true && Game.scaleRank() === 'national', 'rank national at the court');
  const mercyLine = says.find(t => /Iron Court's answer: MERCY/.test(t)) || '(no mercy line)';
  console.log(`  MERCY LINE: ${mercyLine.slice(0, 300)}`);
  const mlinks = Game.hierarchyState().filter(l => l.status === 'active' && l.primary === 'haven');
  ok(mlinks.length === 3 && mlinks.every(l => l.conquered === false && l.tributeKcalPerWeek === 4000),
     `mercy eases the yoke: conquered cleared, courtship tribute (got ${mlinks.map(l => l.tributeKcalPerWeek).join(',')})`);

  // THE BLANK: the next morning. The beat promised "a season".
  Game.state.scholar.day = day0 + 1;
  says.length = 0;
  Game._checkNational();
  const dissolveLine = says.find(t => /realm came apart/.test(t)) || null;
  if (dissolveLine) console.log(`  DISSOLVE LINE: ${dissolveLine.slice(0, 220)}`);
  ok(Game.state.nationalLive === true,
     `the realm still holds the morning after mercy — the beat promised "a season" (dissolved: ${!Game.state.nationalLive})`);
  // the grace mechanism (GREEN): mercy stamps one season of trust-waiver
  ok(mlinks.every(l => l.mercyUntil === day0 + 30),
     'mercy stamps a one-season grace (mercyUntil = day+30) on the eased links');

  // honesty after the season: unearned trust still dissolves, aloud
  Game.state.scholar.day = day0 + 31;
  says.length = 0;
  Game._checkNational();
  ok(Game.state.nationalLive === false && saidHas(/realm came apart/),
     'after the grace season with trust unearned, the realm dissolves aloud (the bar stays honest)');

  // the earned path: the player tends the eased links to 40+ inside the
  // season — the realm then stands on the LEAD bar honestly
  const live = mlinks.filter(l => l.status === 'active');
  live.forEach(l => { l.trust = 45; });
  // re-stage: the realm qualifies again as a lead polity once trust is earned
  Game._checkNational();
  ok(!!Game.state.pendingNational && Game.state.pendingNational.shape === 'lead',
     `earned trust re-stages the beat as a lead realm (got ${Game.state.pendingNational && Game.state.pendingNational.shape})`);
  says.length = 0;
  ok(Game.answerNationalChoice('feast') === true, 'first court answered: feast');
  Game.state.scholar.day = day0 + 62; // a season past the new court
  says.length = 0;
  Game._checkNational();
  ok(Game.state.nationalLive === true, 'earned trust holds the realm past the new season');
}

(async () => {
  for (const s of SEEDS) await runSeed(s);
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
