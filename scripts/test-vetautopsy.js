#!/usr/bin/env node
// test-vetautopsy.js — PROOF for arm sim-vetautopsy (flesh-out loop, axis
// scale-onramp). Proves the death-row instrument + attribution before the
// census is judged.
//
// E1: classifier unit tests (synthetic rows -> pre-registered channels).
// E2: determinism — one config run twice, judged fields byte-identical.
// E3: manual-audit agreement — hand-audited corpus rows vs the classifier
//     (>=95% agreement).
// E4: env-guard — the sweep fails LOUD on a wrong substrate (missing var,
//     BLOODRESTRAINT set, SEATDRIVE!=0).
// E5: band gate — seeds outside 70111-70122 are refused (deliberate
//     re-sweep band).
// E6: dedup — double-fired death teles collapse on (day,who,cause), richest
//     row kept.
//
// Usage: node scripts/test-vetautopsy.js
// E2/E3 need the census corpus (evidence/2026-10-24/perseed-vetautopsy/).
'use strict';
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyDeathRow, dedupDeathRows, attributeCorpus } = require(path.join(REPO, 'scripts', 'vetautopsy-analyze'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function row(over) {
  return Object.assign({
    day: 100, who: 'vid_x', whoName: 'X', kind: 'villager', cause: 'combat',
    wave: null, scholarVidAtDeath: 'vid_scholar', person: true,
    combatCause: true, disease: false, diseasePool: null, diseaseId: null,
    hp: 40, hpSource: 'village.health', armor: 8, equippedKeys: ['torso'],
    oppMid: null, oppWave: null, fightBasis: 'none',
    scholarInFight: false, fightParty: [],
    ctx: { aid: false, atHaven: false, inTb: false, router: null, onExped: false },
    village: { pantry: 5000, hungryStreak: 0, national: 0, w5live: 0, scaleRank: 'village' },
    player: false, playerRepaired: false, mantleHolder: false,
    pickedSuccessor: false, bloodWindow14d: false,
  }, over || {});
}

// ---------- E1: classifier units ----------
{
  // chair priority: mantle-holder killed by a wave-4 monster is CHAIR, not combat.
  let c = classifyDeathRow(row({ mantleHolder: true, combatCause: true, oppMid: 'influencer', oppWave: 4, fightBasis: 'live-tbfight', pickedSuccessor: true, bloodWindow14d: true }));
  check('E1 chair-priority', c.channel === 'chair', JSON.stringify(c));
  check('E1 chair flags', /picked-successor/.test(c.why) && /in-14d-blood-window/.test(c.why), c.why);
  // chair, non-combat (e.g. scholar starves in the chair).
  c = classifyDeathRow(row({ mantleHolder: true, combatCause: false, cause: 'starvation' }));
  check('E1 chair-noncombat', c.channel === 'chair' && c.sub === 'non-combat', JSON.stringify(c));
  // combat vs wave-4 (fighter).
  c = classifyDeathRow(row({ wave: 4, oppMid: 'reunion', oppWave: 4, fightBasis: 'live-tbfight' }));
  check('E1 combat-vs-w4', c.channel === 'combat' && c.sub === 'vs-wave-4', JSON.stringify(c));
  // combat, same-day basis, no oppMid but fight linkage -> combat (cause/ctx linkage).
  c = classifyDeathRow(row({ fightBasis: 'same-day:combat_start' }));
  check('E1 combat-sameday', c.channel === 'combat' && c.evidenceOk, JSON.stringify(c));
  // combat cause with NO linkage at all -> unexplained evidence-missing.
  c = classifyDeathRow(row({ combatCause: true, cause: 'combat' }));
  check('E1 combat-no-evidence', c.channel === 'unexplained' && c.sub === 'evidence-missing', JSON.stringify(c));
  // aid-crisis sub.
  c = classifyDeathRow(row({ wave: 2, ctx: { aid: true, atHaven: false, inTb: false, router: null, onExped: false } }));
  check('E1 combat-aid', c.channel === 'combat' && c.sub === 'aid-crisis', JSON.stringify(c));
  // haven sub (cause combat at haven).
  c = classifyDeathRow(row({ ctx: { aid: false, atHaven: true, inTb: false, router: null, onExped: false } }));
  check('E1 combat-haven', c.channel === 'combat' && c.sub === 'haven', JSON.stringify(c));
  // contest sub.
  c = classifyDeathRow(row({ cause: 'contest', ctx: { aid: false, atHaven: false, inTb: false, router: null, onExped: false } }));
  check('E1 combat-contest', c.channel === 'combat' && c.sub === 'contest', JSON.stringify(c));
  // patrol sub.
  c = classifyDeathRow(row({ ctx: { aid: false, atHaven: false, inTb: false, router: 'patrol', onExped: false } }));
  check('E1 combat-patrol', c.channel === 'combat' && c.sub === 'patrol', JSON.stringify(c));
  // monster-name cause counts as combat with the name as evidence.
  c = classifyDeathRow(row({ cause: 'The Influencer', combatCause: true }));
  check('E1 combat-monstername', c.channel === 'combat', JSON.stringify(c));
  // starvation with state.
  c = classifyDeathRow(row({ cause: 'starvation', combatCause: false }));
  check('E1 starvation', c.channel === 'starvation', JSON.stringify(c));
  // starvation with unreadable state -> unexplained.
  c = classifyDeathRow(row({ cause: 'starvation', combatCause: false, village: { pantry: -1, hungryStreak: -1 } }));
  check('E1 starvation-no-state', c.channel === 'unexplained', JSON.stringify(c));
  // disease, alien pool.
  c = classifyDeathRow(row({ cause: 'eurika', combatCause: false, disease: true, diseasePool: 'alien', diseaseId: 'eurika' }));
  check('E1 disease-alien', c.channel === 'disease' && c.sub === 'alien', JSON.stringify(c));
  // disease, mundane pool.
  c = classifyDeathRow(row({ cause: 'sickness', combatCause: false, disease: true, diseasePool: 'mundane', diseaseId: 'sickness' }));
  check('E1 disease-mundane', c.channel === 'disease' && c.sub === 'mundane', JSON.stringify(c));
  // wound.
  c = classifyDeathRow(row({ cause: "a wound that wouldn't close", combatCause: false }));
  check('E1 wound', c.channel === 'wound', JSON.stringify(c));
  // other named cause.
  c = classifyDeathRow(row({ cause: 'dehydration', combatCause: false }));
  check('E1 other', c.channel === 'other' && /dehydration/.test(c.why), JSON.stringify(c));
  // unknown cause, nothing else -> unexplained.
  c = classifyDeathRow(row({ cause: 'unknown', combatCause: false }));
  check('E1 unexplained', c.channel === 'unexplained' && c.sub === 'cause-unknown', JSON.stringify(c));
}

// ---------- E6: dedup ----------
{
  const thin = row({ hp: null, armor: null, oppMid: null });
  const rich = row({ hp: 12, armor: 14, oppMid: 'influencer', oppWave: 4, fightBasis: 'live-tbfight' });
  const d = dedupDeathRows([thin, rich, row({ day: 101 })]);
  check('E6 collapse-count', d.nCollapsed === 1 && d.rows.length === 2, `collapsed=${d.nCollapsed} rows=${d.rows.length}`);
  const kept = d.rows.find(r => (r.day | 0) === 100);
  check('E6 richest-kept', kept && kept.armor === 14 && kept.oppMid === 'influencer', JSON.stringify(kept && { armor: kept.armor, oppMid: kept.oppMid }));
}

// ---------- E4: env-guard ----------
function sweepExit(envOver) {
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
    SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1',
  }, envOver || {});
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'vetautopsy-sweep.js')], { env, stdio: 'pipe', timeout: 15000 });
    return 0;
  } catch (e) { return (e && e.status) || 99; }
}
{
  check('E4 missing-var', sweepExit({ ARMORVILLAGE: '' }) === 2, 'exit=' + sweepExit({ ARMORVILLAGE: '' }));
  check('E4 bloodrestraint-set', sweepExit({ BLOODRESTRAINT: '1' }) === 2);
  check('E4 seatdrive-wrong', sweepExit({ SEATDRIVE: '1' }) === 2);
}

// ---------- E5: band gate ----------
{
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
    SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1',
    SEEDS: '65511', POLICIES: 'lead', EVID: '/tmp/vetautopsy-e5',
  });
  let code = 0;
  try { execFileSync(process.execPath, [path.join(REPO, 'scripts', 'vetautopsy-sweep.js')], { env, stdio: 'pipe', timeout: 15000 }); }
  catch (e) { code = (e && e.status) || 99; }
  check('E5 band-gate', code === 2, 'exit=' + code);
}

// ---------- E2/E3: census-dependent (run after the census completes) ----------
console.log(`E1+E4+E5+E6: ${pass} pass, ${fail} fail`);
if (process.env.VETAUTOPSY_FULL === '1') {
  // E2: determinism — s70111-lead twice into scratch dirs, judged fields byte-identical.
  const baseEnv = {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
    SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1',
    SEEDS: '70111', POLICIES: 'lead', DAYS: '180',
  };
  const j1 = '/tmp/vetautopsy-e2a', j2 = '/tmp/vetautopsy-e2b';
  for (const [tag, dir] of [['a', j1], ['b', j2]]) {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'vetautopsy-sweep.js')],
      { env: Object.assign({}, process.env, baseEnv, { EVID: dir }), stdio: 'pipe', timeout: 600000 });
  }
  const a = JSON.parse(fs.readFileSync(path.join(j1, 's70111-lead.json'), 'utf8'));
  const b = JSON.parse(fs.readFileSync(path.join(j2, 's70111-lead.json'), 'utf8'));
  const judged = (d) => JSON.stringify({
    deathRows: d.deathRows, fights: d.fights, successions: d.successions,
    waveKillLog: d.waveKillLog, days: d.days, endReason: d.endReason,
    maxWave: d.maxWave, national: d.national, table: d.table, won: d.won, deaths: d.deaths,
  });
  check('E2 determinism', judged(a) === judged(b), 'judged fields differ between two identical runs');
  // E3: manual-audit agreement — fixtures hand-audited from the corpus.
  const AUDIT = JSON.parse(fs.readFileSync(path.join(REPO, 'scripts', 'vetautopsy-audit.json'), 'utf8'));
  const attr = attributeCorpus(path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetautopsy'));
  const byKey = {};
  for (const r of attr.detail) byKey[r.config + '|' + r.vid] = r;
  let agree = 0;
  for (const [key, expected] of Object.entries(AUDIT)) {
    const got = byKey[key];
    if (got && got.channel === expected) agree++;
    else { fail++; console.error(`FAIL: E3 audit ${key}: expected ${expected}, got ${got && got.channel}`); }
  }
  check('E3 audit-agreement>=95%', agree / Object.keys(AUDIT).length >= 0.95, `${agree}/${Object.keys(AUDIT).length}`);
  console.log(`E2+E3: ${pass} pass, ${fail} fail`);
}

console.log(fail === 0 ? 'ALL GREEN' : 'FAILURES PRESENT');
process.exit(fail === 0 ? 0 : 1);
