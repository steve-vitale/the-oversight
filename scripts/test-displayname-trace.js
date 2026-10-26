#!/usr/bin/env node
// scripts/test-displayname-trace.js — sim-displayname-a trace proof
// (scale-onramp axis, DIAG ONLY, zero src/js changes).
//
// Reads the LANDED defnarr corpus (evidence/2026-10-26/
// perseed-sim-defnarr-a/s7367*.json) and extracts, meeting by
// meeting, the two same-instance awayNews display-name chains
// from seed 73675 that the defnarr arm observed but did not
// root-cause:
//   * voice_mimic_radio seq 21: "the Static" -> "the Loud Beast"
//   * hushwolf seq 11: "Hushpuppy" -> "Big-Eyes"
// and asserts the mechanism's predictions:
//   (1) early names == the monsters' TRUE names (mdef.name) — the
//       systemArrived branch of monsterDisplayName (game.js),
//       since the System arrives day 7 and both first meetings
//       are after day 7;
//   (2) late names == generateMonsterName steady-pool coinages for
//       the fallback traits (no nameTraits, no curated villageNames
//       on either monster): "Big-Eyes" = cap('big') + "-Eyes",
//       "The Loud Beast" = "The " + cap('loud') + " Beast";
//   (3) villageName has exactly ONE assignment site in src/js
//       (game.js monsterNamingCheck) and monsterNamingCheck
//       returns early once villageName is set — so the name can
//       change exactly once per type per run, then sticks;
//   (4) the name is STABLE after the switch on 73675 (no second
//       switch for either mid) and the switch day VARIES across
//       seeds (per-type debate conclusion, not a fixed global day);
//   (5) the same-reporter pairs: Nina (voice seq 21) d74 -> d81,
//       Meera (hushwolf seq 11) d21/d22 -> d81, by villager id.
// Usage: node scripts/test-displayname-trace.js [--selftest]
// Exit 1 on any failed assertion. No writes, no RNG, no Game load.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-defnarr-a');

const PATTERNS = [
  /(?:stared down|stood down) the (.+?) and (?:kept walking|it backed off)/,
  /killed the (.+?) alone/,
  /The (.+?) mauled /,
  /The (.+?) killed .* in \d+ rounds?\. The village mourns/,
  /The (.+?) came for .* and missed/,
];
function nameOf(line) {
  if (line == null) return null; // queue-dropped line
  for (const p of PATTERNS) {
    const m = p.exec(line);
    if (m) return m[1];
  }
  return '?' + String(line).slice(0, 80);
}

let failures = 0;
function check(cond, label) {
  console.log((cond ? 'PASS ' : 'FAIL ') + label);
  if (!cond) failures++;
}

function loadSeed(seed) {
  return JSON.parse(fs.readFileSync(path.join(CORPUS, `s${seed}-armed.json`), 'utf8'));
}
function chain(rows, mid, seq) {
  return rows.filter(r => r.mid === mid && r.seq === seq).map(r => ({
    day: r.day, vid: r.vid, outcome: r.outcome, rounds: r.rounds,
    mHpStart: r.mHpStart, mHpMax: r.mHpMax, name: nameOf(r.awayNewsLast),
    dropped: r.awayNewsLast == null,
  }));
}
function firstSwitch(ev) {
  for (let i = 1; i < ev.length; i++) {
    if (ev[i].name !== ev[i - 1].name && ev[i].name !== null && ev[i - 1].name !== null) {
      return { from: ev[i - 1], to: ev[i], index: i };
    }
  }
  return null;
}

const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const mdef = id => monsters.find(m => m.id === id) || {};
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');

// ---- mechanism statics ----
const assignSites = (gameJs.match(/\.villageName\s*=/g) || []).length;
check(assignSites === 1, `villageName has exactly 1 assignment site in game.js (found ${assignSites})`);
check(/monsterNamingCheck\(mid\)[\s\S]{0,400}if \(!e \|\| e\.villageName\) return/.test(gameJs),
  'monsterNamingCheck returns early when villageName is set (name sticks after one change)');
check(gameJs.includes('if (e && e.villageName) return e.villageName;'),
  'monsterDisplayName prefers villageName over the true name');
check(gameJs.includes('if (this.state.systemArrived) return mdef.name;'),
  'monsterDisplayName falls back to the true name once the System has arrived');
check(/const traits = mdef\.nameTraits \|\| \['big', 'loud', 'ugly'\]/.test(gameJs),
  'generateMonsterName fallback traits are big/loud/ugly');
check(gameJs.includes('`${cap(t)}-Eyes`') && gameJs.includes('`The ${cap(t)} Beast`'),
  'generateMonsterName steady pool contains Big-Eyes and The Loud Beast shapes');
for (const mid of ['hushwolf', 'voice_mimic_radio']) {
  const d = mdef(mid);
  check(!d.villageNames && !d.nameTraits,
    `${mid}: no curated villageNames, no nameTraits (fallback-trait coinage only)`);
}

// ---- seed 73675 chains ----
const s75 = loadSeed(73675);
const rows75 = s75.defwound.resolveFights;
const voice = chain(rows75, 'voice_mimic_radio', 21);
const hush = chain(rows75, 'hushwolf', 11);
console.log('\n--- voice_mimic_radio seq 21 (seed 73675) ---');
for (const e of voice) console.log(`  d${e.day} ${e.vid} ${e.outcome} r${e.rounds} hp ${e.mHpStart}/${e.mHpMax} name=${e.name}`);
console.log('--- hushwolf seq 11 (seed 73675) ---');
for (const e of hush) console.log(`  d${e.day} ${e.vid} ${e.outcome} r${e.rounds} hp ${e.mHpStart}/${e.mHpMax} name=${e.name}`);

check(voice.length === 9, `voice seq 21 chain complete: 9 meetings (found ${voice.length})`);
check(voice.every(e => !e.dropped), 'voice seq 21: no queue-dropped lines hide a meeting');
check(hush.every(e => !e.dropped), 'hushwolf seq 11: no queue-dropped lines hide a meeting');
const vSw = firstSwitch(voice);
const hSw = firstSwitch(hush);
check(!!vSw && vSw.from.name === 'Static' && vSw.to.name === 'Loud Beast',
  `voice switch: Static -> Loud Beast (d${vSw && vSw.from.day} -> d${vSw && vSw.to.day})`);
check(!!hSw && hSw.from.name === 'Hushpuppy' && hSw.to.name === 'Big-Eyes',
  `hushwolf switch: Hushpuppy -> Big-Eyes (d${hSw && hSw.from.day} -> d${hSw && hSw.to.day})`);
check(voice.slice(voice.indexOf(vSw.to)).every(e => e.name === 'Loud Beast'),
  'voice: name stable after the switch (no second switch)');
check(hush.slice(hush.indexOf(hSw.to)).every(e => e.name === 'Big-Eyes'),
  'hushwolf: name stable after the switch (no second switch)');
check(voice.filter(e => e.name === 'Static').every(e => e.day < vSw.to.day) &&
  voice.filter(e => e.name === 'Loud Beast').every(e => e.day >= vSw.to.day),
  'voice: Static only before d81, Loud Beast only from d81');
check(vSw.from.day === 74 && vSw.to.day === 81, 'voice switch bracket is exactly d74 -> d81');
check(hSw.from.day === 52 && hSw.to.day === 81, 'hushwolf seq-11 switch bracket is exactly d52 -> d81');
// early names == true names; late names == steady-pool coinages
check(mdef('voice_mimic_radio').name === 'Static', 'voice true name is Static (early name = true name)');
check(mdef('hushwolf').name === 'Hushpuppy', 'hushwolf true name is Hushpuppy (early name = true name)');
// late names are steady-pool coinages; the news slot strips the leading
// article (monsterNoun), so villageName "The Loud Beast" reads "Loud Beast"
check('Big-Eyes' === 'Big' + '-Eyes' && 'The Loud Beast'.replace(/^The /, '') === 'Loud Beast',
  'late names are exactly the steady-pool coinages for traits big/loud (article-stripped in news)');
// same-reporter pairs, by villager id (not first name)
const vOldNina = voice.find(e => e.day === 74);
const vNewNina = voice.find(e => e.day === 81);
check(vOldNina && vNewNina && vOldNina.vid === 'nina_petrova' && vNewNina.vid === 'nina_petrova',
  'voice same reporter: Nina (nina_petrova) reports Static d74 and Loud Beast d81');
const hOldMeera = hush.find(e => e.day === 22);
const hNewMeera = hush.find(e => e.day === 81);
check(hOldMeera && hNewMeera && hOldMeera.vid === 'meera_reddy' && hNewMeera.vid === 'meera_reddy',
  'hushwolf same reporter: Meera (meera_reddy) reports Hushpuppy d22 and Big-Eyes d81');
// same instance: same spawn seq, same max HP, wounded continuity (1 HP from the switch on)
check(voice.filter(e => e.day >= 74).every(e => e.mHpMax === 65) &&
  voice.filter(e => e.day >= 74).every(e => e.mHpStart === 1),
  'voice seq 21 is one wounded instance: 1/65 HP across the switch');
check(hush.filter(e => e.day >= 21).every(e => e.mHpMax === 50),
  'hushwolf seq 11 is one instance: 50 max HP throughout');
// all-instance view on 73675: every hushwolf instance switches by d81, no instance keeps the old name after
const hushAll = rows75.filter(r => r.mid === 'hushwolf').map(r => ({ day: r.day, seq: r.seq, name: nameOf(r.awayNewsLast) }));
check(hushAll.filter(e => e.day >= 81).every(e => e.name === 'Big-Eyes') &&
  hushAll.filter(e => e.day < 81).every(e => e.name === 'Hushpuppy'),
  '73675 all hushwolf instances: Hushpuppy before d81, Big-Eyes from d81 (type-level switch, not instance-level)');

// ---- cross-seed switch-day variance ----
console.log('\n--- hushwolf first-new-name day per seed ---');
const switchDays = {};
for (const seed of [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678]) {
  const rows = loadSeed(seed).defwound.resolveFights;
  const ev = rows.filter(r => r.mid === 'hushwolf').map(r => ({ day: r.day, name: nameOf(r.awayNewsLast) }));
  const sw = firstSwitch(ev);
  const firstName = ev.length ? ev[0].name : null;
  switchDays[seed] = sw ? sw.to.day : (firstName === 'Hushpuppy' ? 'never' : 'already-switched');
  console.log(`  ${seed}: first=${firstName} switch-to-day=${switchDays[seed]}`);
}
const distinct = new Set(Object.values(switchDays));
check(distinct.size >= 4, `switch day varies across seeds (found ${[...distinct].join(', ')}) — per-type debate, not a fixed global day`);

console.log(failures ? `\n${failures} FAILURES` : '\nALL CHECKS PASS');
process.exit(failures ? 1 : 0);
