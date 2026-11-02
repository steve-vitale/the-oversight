#!/usr/bin/env node
// test-journey-succession-r112-naming-20261102.js — proof test for the r112
// instrument (WEEK1-NAMING analyzer + r83->r112 driver rename).
// (a) ANALYZER on r83 fixtures: r83's own week-1 transcripts scored with
//     r83 dead names must give per-seed named [2,1,1,1,0,3] over totals
//     [5,4,5,5,5,4] (pooled 8/28), zero collisions, zero missing files.
//     (Baseline measured by mechanical grep during r97 pre-registration.)
// (b) WRONG-NAME control: the same fixtures scored with a dead name from
//     another seed (26151 scored against 'Violet') must give 0 naming —
//     proving the scorer keys on the right name, not generic hits.
// (c) DRIVER RENAME smoke: the r112 driver on proof seed 24998 (short
//     config, all five kills forced) must emit fifthDeath (scripted,
//     passed) and write d+3/d+7 transcript files (filed under the
//     ACTUAL days-since-death at firing time, which may exceed the label).
//     (seed 24998 tele + transcript files) is deleted afterwards,
//     r56 pattern. The driver writes no stdout file itself; the test
//     captures its stdout JSON directly.
// (d) ANY-RECENT on r89 fixtures: namedAny >= named on every seed,
//     27154 gains over first-bearer naming, and its anyHitLines
//     actually name Jorge (the r89 second-death mechanism).
//     Fixtures live in evidence/2026-10-31; the driver smoke (c)
//     writes its scratch into evidence/2026-11-01 and deletes it.
// (e) CHAIN-DETECTOR REPLAY, RE-BASELINED on the r112 panel (r112):
//     the r91 expectation went stale exactly as the prereg foresaw —
//     replaying 28152 on current master yields a wholly different
//     village trajectory (Darius->Ivy), not r91's Petra->Catalina
//     chain, while the recorder stayed intact ((e2) passed clean on
//     the drifted trajectory). The prereg's branch for this case —
//     a genuine same-iteration double observed on the panel — fires:
//     (e) now replays panel seed 30509 (control config) and demands
//     EXACT reproduction of the panel chain plus structural split
//     assertions on its day-107 pair Isaac->Jesse + Jesse->Nikolai
//     (same iter 67): adjacent, same day, both via playerDeath, no
//     collapse, tele deaths.bearer equal to the panel's. The RED
//     control keeps the committed r91 collapse on file as the
//     historical reason the split assertion exists. Panel-evidence
//     safety: the replay's 30509 side files are snapshotted first
//     and restored byte-for-byte in the finally block.
// (e2) REPLAY-INTEGRITY (r112 addition, same replay record, no second
//     run): the current-master 30509 trajectory must be structurally
//     sound: chain entries form a continuous bearer sequence, every
//     entry routes via playerDeath, fifthDeath (if present) matches
//     the chain's scriptedFifth entry, and tele deaths.bearer >=
//     chain length (the first death is not a chain entry). These are
//     structural, not value-fitted: they pass or fail independent of
//     which names the trajectory carries.
// (f) MIX on r91 fixtures: 28152 week-1 mix must be total 4,
//     nonVerbal 2, draws 0 (the unasked panel); 28154 mix debate >= 1
//     (Brian's Lockpick debate) and grief >= 1; 28151 mix grief 2,
//     unclassified 0; every seed's grief+debate+other+unclassified
//     == draws. Fixtures live in evidence/2026-11-01 (r91's own dir).
// Usage: node scripts/test-journey-succession-r112-naming-20261102.js
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-11-01');
// r112 rename repair: EVID is the OLD-record dir (r91's 28152 records +
// r91 MIX fixtures live in 2026-11-01). The r112 driver writes its
// scratch to ITS OWN EVID_DIR (2026-11-02), so scratch checks, the
// replay new-tele read, and scratch cleanup must use SCRATCH, not EVID.
// (A single-constant fork pointed scratch at the old dir: driver-smoke
// files read 0/4 and the replay tele read threw ENOENT before (e2) ran.)
const SCRATCH = path.join(ROOT, 'evidence', '2026-11-02');
const FIXTURE_EVID = path.join(ROOT, 'evidence', '2026-10-31');
const { scoreWeek1 } = require('./analyze-journey-succession-r112-naming-20261102.js');

let fails = [];
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(name);
}

// ---- (a) r83 fixtures ----
const seeds = [26151, 26152, 26153, 26154, 26155, 26156];
const expNamed = [2, 1, 1, 1, 0, 3];
const expTotal = [5, 4, 5, 5, 5, 4];
const fix = scoreWeek1(FIXTURE_EVID, seeds, 'r83');
fix.perSeed.forEach((r, i) => {
  check(`FIXTURE seed ${r.seed} named=${expNamed[i]}/${expTotal[i]}`,
    r.named === expNamed[i] && r.total === expTotal[i],
    `got named=${r.named} total=${r.total} dead=${r.dead}`);
  check(`FIXTURE seed ${r.seed} no collision, no missing`,
    r.collision === false && !r.transcripts.some(t => t.missing),
    `collision=${r.collision} missing=${r.transcripts.filter(t => t.missing).length}`);
});
check('FIXTURE pooled 8/28', fix.pooled.named === 8 && fix.pooled.transcripts === 28,
  `got ${fix.pooled.named}/${fix.pooled.transcripts}`);

// ---- (b) wrong-name control ----
const wrong = scoreWeek1(FIXTURE_EVID, [26151], 'r83', { 26151: 'Violet' });
check('WRONG-NAME control 26151-as-Violet gives 0 naming',
  wrong.perSeed[0].named === 0 && wrong.pooled.namingLines === 0,
  `got named=${wrong.perSeed[0].named} lines=${wrong.pooled.namingLines}`);

// ---- (d) any-recent on r89 fixtures (r97 revision) ----
const r89seeds = [27151, 27152, 27153, 27154, 27155, 27156];
const any = scoreWeek1(FIXTURE_EVID, r89seeds, 'r89');
any.perSeed.forEach((r, i) => {
  check(`ANY-RECENT seed ${r.seed} namedAny >= named`,
    r.namedAny >= r.named, `named=${r.named} namedAny=${r.namedAny} recentDead=${JSON.stringify(r.recentDead)}`);
});
const s27154 = any.perSeed[3];
check('ANY-RECENT 27154 gains over first-bearer (Jorge mechanism)',
  s27154.namedAny > s27154.named, `named=${s27154.named} namedAny=${s27154.namedAny}`);
const jorgeLines = [];
for (const t of (s27154.transcripts || [])) for (const ln of (t.anyHitLines || [])) if (/\bJorge\b/.test(ln)) jorgeLines.push(ln);
check('ANY-RECENT 27154 anyHitLines actually name Jorge',
  jorgeLines.length > 0, `jorgeLines=${jorgeLines.length} e.g. ${jorgeLines[0] || ''}`);
check('ANY-RECENT pooled any >= pooled first-bearer',
  any.pooled.namedAny >= any.pooled.named, `named=${any.pooled.named} namedAny=${any.pooled.namedAny} transcripts=${any.pooled.transcripts}`);

// ---- (c) driver rename smoke ----
const ENV = Object.assign({}, process.env, { SEED: '24998', EARLY_KILL_DAY: '5', POST_DAYS: '30',
  SECOND_KILL_DPLUS: '3', THIRD_KILL_DPLUS: '3', FOURTH_KILL_DPLUS: '3', FIFTH_KILL_DPLUS: '3' });
try {
  const out = execFileSync('node', [path.join(ROOT, 'scripts', 'journey-succession-r112-20261102.js')],
    { cwd: ROOT, env: ENV, timeout: 600000, maxBuffer: 64 * 1024 * 1024 }).toString();
  const start = out.lastIndexOf('\n{');
  const rec = JSON.parse(out.slice(start + 1));
  check('DRIVER fifthDeath present, scripted, passed',
    !!(rec.fifthDeath && rec.fifthDeath.scripted && rec.fifthDeath.passed),
    'fifthDeath=' + JSON.stringify(rec.fifthDeath));
  // r112: scripted chain entries in kill order, one flag each, via wrapper.
  const chain = rec.chainDeaths || [];
  const scripted = chain.filter(c => c.scriptedSecond || c.scriptedThird || c.scriptedFourth || c.scriptedFifth);
  const flagSeq = scripted.map(c => c.scriptedSecond ? '2' : c.scriptedThird ? '3' : c.scriptedFourth ? '4' : '5').join('');
  check('DRIVER chain records scripted kills in order 2-3-4-5, one flag each',
    flagSeq === '2345' && scripted.every(c => [c.scriptedSecond, c.scriptedThird, c.scriptedFourth, c.scriptedFifth].filter(Boolean).length === 1),
    `seq=${flagSeq} chain=${chain.map(c => `${c.deadFirst}->${c.newFirst}`).join(',')}`);
  check('DRIVER scripted chain entries all via playerDeath wrapper',
    scripted.every(c => c.via === 'playerDeath'), `vias=${scripted.map(c => c.via).join(',')}`);
  const w1 = (rec.convoReads || []).filter(c => c.dplus === 3 || c.dplus === 7);
  check('DRIVER wrote d+3/d+7 convoReads (week-1 instrument present)',
    w1.length >= 2, `w1 reads=${w1.length}`);
  // Filenames key on the ACTUAL days-since-death at firing time, not the
  // checkpoint label (analyzer fix, same rule): the driver fires a
  // checkpoint on the first day with daysSince >= cp, so a checkpoint
  // can fire late (label d+7, file d+8 — proof seed 24998). The
  // label-only lookup missed such transcripts on the rebased tip.
  const deathDay = (rec.death && rec.death.day != null) ? rec.death.day : null;
  const actualOf = c => (c.day != null && deathDay != null) ? c.day - deathDay : c.dplus;
  let filesOk = 0;
  const late = [];
  for (const c of w1) {
    const actual = actualOf(c);
    if (actual !== c.dplus) late.push(`${c.vid} label d+${c.dplus} -> file d+${actual}`);
    if (fs.existsSync(path.join(SCRATCH, `journey-succession-r112-transcript-24998-dplus${actual}-${c.vid}.txt`))) filesOk++;
  }
  check('DRIVER d+3/d+7 transcript files exist on disk (actual-day names)',
    filesOk === w1.length, `files=${filesOk}/${w1.length} late=[${late.join('; ')}]`);
  check('DRIVER late checkpoint filed under actual day, not label',
    late.length > 0 && late.every(s => filesOk === w1.length),
    late.length ? `late=[${late.join('; ')}]` : 'no late read on proof seed');
} catch (e) {
  check('DRIVER smoke ran without throwing', false, String(e && e.message).slice(0, 300));
} finally {
  // Delete proof scratch (r56 pattern): seed 24998 tele + transcripts.
  for (const f of fs.readdirSync(SCRATCH)) {
    if (f.includes('24998') && (f.includes('r112-tele-') || f.includes('r112-transcript-'))) {
      try { fs.unlinkSync(path.join(SCRATCH, f)); } catch (e) { /* flap-tolerant: leave, note below */ }
    }
  }
  const leftovers = fs.readdirSync(SCRATCH).filter(f => f.includes('24998'));
  check('DRIVER proof scratch deleted', leftovers.length === 0, `leftovers=${leftovers.join(',')}`);
}

// ---- (f) MIX on r91 fixtures ----
const mix91 = scoreWeek1(EVID, [28151, 28152, 28153, 28154], 'r91');
const m28152 = mix91.perSeed[1];
check('MIX 28152 unasked panel: total 4, nonVerbal 2, draws 0',
  m28152.mix && m28152.mix.total === 4 && m28152.mix.nonVerbal === 2 && m28152.mix.draws === 0
    && m28152.mix.grief === 0 && m28152.mix.debate === 0 && m28152.mix.other === 0 && m28152.mix.unclassified === 0,
  `mix=${JSON.stringify(m28152.mix)}`);
const m28154 = mix91.perSeed[3];
check('MIX 28154 debate >= 1 (Brian Lockpick debate) and grief >= 1',
  m28154.mix && m28154.mix.debate >= 1 && m28154.mix.grief >= 1,
  `mix=${JSON.stringify(m28154.mix)}`);
const m28151 = mix91.perSeed[0];
check('MIX 28151 grief 2, unclassified 0 (prompt family covers both draws)',
  m28151.mix && m28151.mix.grief === 2 && m28151.mix.unclassified === 0,
  `mix=${JSON.stringify(m28151.mix)}`);
for (const r of mix91.perSeed) {
  check(`MIX seed ${r.seed} topic counts sum to draws`,
    r.mix && (r.mix.grief + r.mix.debate + r.mix.other + r.mix.unclassified) === r.mix.draws,
    `mix=${JSON.stringify(r.mix)}`);
}

// ---- (e) CHAIN-DETECTOR REPLAY, RE-BASELINED on the r112 panel (r112) ----
// The r91 expectation went stale exactly as the prereg foresaw: replaying
// 28152 on current master yields a wholly different village trajectory
// (Darius->Ivy, tele deaths.bearer 2), not r91's Petra->Catalina chain —
// the seed's story moved with master, while the recorder stayed intact
// ((e2) passed clean on the drifted trajectory). The prereg's branch for
// this case — a genuine same-iteration double observed on the panel —
// fires: (e) is re-baselined on panel seed 30509, whose day-107 pair
// Isaac->Jesse + Jesse->Nikolai (same iter 67) is the split under test.
// This is NOT weakening the check to fit: the new (e) demands EXACT
// reproduction of the panel chain plus structural split assertions, and
// drops only the stale r91 name values. The RED control keeps the r91
// collapse on file as the historical reason the split assertion exists.
// Panel-evidence safety: the replay overwrites the 30509 tele +
// transcript filenames (same seed, hardcoded EVID_DIR), so the block
// snapshots them first and the finally restores them byte-for-byte and
// deletes any replay-only 30509 side file — panel evidence is never left
// replayed, and the panel's .stdout.json is never touched (the driver
// writes no stdout file; the panel's came from shell redirection).
const ENV30509 = Object.assign({}, process.env, { SEED: '30509', EARLY_KILL_DAY: '40', POST_DAYS: '70' });
let replaySnap = null;
try {
  const oldRec = JSON.parse(fs.readFileSync(path.join(EVID, 'journey-succession-r91-28152.stdout.json'), 'utf8'));
  const oldChain = oldRec.chainDeaths || [];
  const oldFifthEntry = oldChain.find(c => c.scriptedFifth);
  // RED control: the committed r91 output collapses day 71.
  check('REPLAY RED control: old scriptedFifth entry deadFirst != fifthDeath.oldFirst (collapse present)',
    !!(oldFifthEntry && oldRec.fifthDeath && oldFifthEntry.deadFirst !== oldRec.fifthDeath.oldFirst),
    `oldFifthEntry=${oldFifthEntry ? oldFifthEntry.deadFirst + '->' + oldFifthEntry.newFirst : 'none'} fifthDeath.oldFirst=${oldRec.fifthDeath ? oldRec.fifthDeath.oldFirst : '?'}`);
  // Panel baseline for the re-based seed (control config, same as the panel).
  const panelRec = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'journey-succession-r112-30509.stdout.json'), 'utf8'));
  const panelTele = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'journey-succession-r112-tele-30509.json'), 'utf8'));
  const panelChain = panelRec.chainDeaths || [];
  replaySnap = {};
  for (const f of fs.readdirSync(SCRATCH)) {
    if (f.includes('30509') && (f.includes('r112-tele-') || f.includes('r112-transcript-'))) {
      try { replaySnap[f] = fs.readFileSync(path.join(SCRATCH, f)); } catch (e) {}
    }
  }
  const out = execFileSync('node', [path.join(ROOT, 'scripts', 'journey-succession-r112-20261102.js')],
    { cwd: ROOT, env: ENV30509, timeout: 600000, maxBuffer: 64 * 1024 * 1024 }).toString();
  const start = out.lastIndexOf('\n{');
  const rec = JSON.parse(out.slice(start + 1));
  const newChain = rec.chainDeaths || [];
  check('REPLAY panel chain reproduced exactly (deadFirst/newFirst/via in order)',
    newChain.length === panelChain.length && panelChain.every((c, i) =>
      newChain[i] && newChain[i].deadFirst === c.deadFirst && newChain[i].newFirst === c.newFirst && newChain[i].via === c.via),
    `panel=${panelChain.map(c => `${c.deadFirst}->${c.newFirst}`).join(',')} replay=${newChain.map(c => `${c.deadFirst}->${c.newFirst}`).join(',')}`);
  const firstPair = newChain.find(c => c.deadFirst === 'Isaac' && c.newFirst === 'Jesse');
  const secondPair = newChain.find(c => c.deadFirst === 'Jesse' && c.newFirst === 'Nikolai');
  check('REPLAY day-107 split pair present, adjacent, same iter, same day, both via wrapper',
    !!(firstPair && secondPair
      && newChain.findIndex(c => c === secondPair) === newChain.findIndex(c => c === firstPair) + 1
      && firstPair.iter === secondPair.iter && firstPair.day === secondPair.day
      && firstPair.via === 'playerDeath' && secondPair.via === 'playerDeath'),
    `first=${firstPair ? JSON.stringify(firstPair) : 'none'} second=${secondPair ? JSON.stringify(secondPair) : 'none'}`);
  check('REPLAY split pair NOT collapsed: both entries present, no single combined entry',
    newChain.filter(c => c.deadFirst === 'Isaac' || c.deadFirst === 'Jesse').length === 2,
    `isaacJesseEntries=${newChain.filter(c => c.deadFirst === 'Isaac' || c.deadFirst === 'Jesse').map(c => `${c.deadFirst}->${c.newFirst}`).join(',')}`);
  const newTele = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'journey-succession-r112-tele-30509.json'), 'utf8'));
  check('REPLAY tele deaths.bearer equals panel tele (each handoff counted, none collapsed)',
    newTele['deaths.bearer'] === panelTele['deaths.bearer'],
    `panel=${panelTele['deaths.bearer']} replay=${newTele['deaths.bearer']}`);
  // ---- (e2) replay integrity on the CURRENT-master trajectory ----
  const chainCont = newChain.every((c, i) => i === 0 || newChain[i - 1].newFirst === c.deadFirst);
  check('REPLAY2 chain is a continuous bearer sequence',
    chainCont, `chain=${newChain.map(c => `${c.deadFirst}->${c.newFirst}`).join(',')}`);
  check('REPLAY2 every chain entry via playerDeath wrapper',
    newChain.length > 0 && newChain.every(c => c.via === 'playerDeath'),
    `vias=${newChain.map(c => c.via).join(',')}`);
  const scr5 = newChain.find(c => c.scriptedFifth);
  check('REPLAY2 fifthDeath matches chain scriptedFifth entry (when both present)',
    !rec.fifthDeath || !scr5 || (rec.fifthDeath.oldFirst === scr5.deadFirst && rec.fifthDeath.newFirst === scr5.newFirst),
    `fifthDeath=${JSON.stringify(rec.fifthDeath)} scr5=${scr5 ? scr5.deadFirst + '->' + scr5.newFirst : 'none'}`);
  check('REPLAY2 tele deaths.bearer >= chain length (first death is not a chain entry)',
    typeof newTele['deaths.bearer'] === 'number' && newTele['deaths.bearer'] >= newChain.length,
    `tele=${newTele['deaths.bearer']} chain=${newChain.length}`);
  console.log(`REPLAY2 current-master 30509 trajectory: ${newChain.map(c => `${c.deadFirst}->${c.newFirst}`).join(',')} fifth=${rec.fifthDeath ? rec.fifthDeath.oldFirst + '->' + rec.fifthDeath.newFirst : 'none'} teleBearer=${newTele['deaths.bearer']}`);
} catch (e) {
  check('REPLAY ran without throwing', false, String(e && e.message).slice(0, 300));
} finally {
  // Restore panel side files byte-for-byte; delete any replay-only 30509
  // side file; never delete panel evidence.
  if (replaySnap) {
    for (const f of fs.readdirSync(SCRATCH)) {
      if (f.includes('30509') && (f.includes('r112-tele-') || f.includes('r112-transcript-')) && !(f in replaySnap)) {
        try { fs.unlinkSync(path.join(SCRATCH, f)); } catch (e) {}
      }
    }
    let restoredOk = true;
    for (const f of Object.keys(replaySnap)) {
      try { fs.writeFileSync(path.join(SCRATCH, f), replaySnap[f]); } catch (e) { restoredOk = false; }
    }
    for (const f of Object.keys(replaySnap)) {
      try { if (!fs.readFileSync(path.join(SCRATCH, f)).equals(replaySnap[f])) restoredOk = false; } catch (e) { restoredOk = false; }
    }
    check('REPLAY panel side files restored byte-for-byte', restoredOk, `files=${Object.keys(replaySnap).length}`);
  }
}

if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL PASS');
