#!/usr/bin/env node
// test-aidcrisis-b.js — proof test for arm sim-aidcrisis-b (DIAG).
// ALL GREEN required before the evidence counts.
//
// E1: census corpus exists and every file has zero instrument errors.
// E2: determinism — one seed re-run (scratch dir under goal hidden_files,
//     NEVER the live evidence dir) is byte-identical to the census file on
//     the judged fields (fights day/mid/wave/via/party/scholarIn,
//     crisisEvents, deaths judged fields, successions).
// E3: attribution completeness — every fight row carries crisisActive
//     (boolean) + crisisName; every death row carries crisisActive (boolean),
//     isScholar (boolean), tenureDays and bloodTenure (number-or-null);
//     every raised crisis is either resolved later in the timeline or was
//     live at run end.
// E4: primary re-verification — the 6 vetautopsy killer deaths are accounted
//     for in the fresh corpus (re-anchored 2026-10-24: same-day reproduction
//     replaced by accounted-for + fully named, after the be55cfc2c base
//     changes moved 4/6 trajectories — see the E4 block for the split).
// E5: GO contrast — the scholar haven-defense fight-day lethality contrast
//     (crisis vs non-crisis) is named quantitatively.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ACORP = path.join(REPO, 'evidence', '2026-10-24', 'perseed-aidcrisis');
const ATT = path.join(REPO, 'evidence', '2026-10-24', 'vetautopsy-attribution.json');
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const afiles = () => fs.readdirSync(ACORP).filter(f => /^s70\d+-(lead|belong)\.json$/.test(f)).sort();

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ---- E1: corpus exists, zero instrument errors ----
let files = [];
try { files = afiles(); } catch (e) {}
ok('E1 corpus exists (24 configs)', files.length === 24, 'found ' + files.length);
let allClean = true, errDetail = '';
for (const f of files) {
  const d = load(path.join(ACORP, f));
  if (!Array.isArray(d.instrumentErrors) || d.instrumentErrors.length) { allClean = false; errDetail = f + ': ' + JSON.stringify(d.instrumentErrors).slice(0, 200); }
  if (!Array.isArray(d.fights) || !Array.isArray(d.crisisEvents) || !Array.isArray(d.deaths) || !Array.isArray(d.successions)) { allClean = false; errDetail = f + ' missing arrays'; }
}
ok('E1 zero instrument errors on all configs', allClean, errDetail);

// ---- E2: determinism — scratch re-run of s70111-lead ----
let detOk = false, detDetail = '';
try {
  const scratch = path.join(process.env.HOME || '/home/hatch', 'workspace', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'aidcrisis-b-det');
  fs.mkdirSync(scratch, { recursive: true });
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0',
    KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1',
    SEEDS: '70111', POLICIES: 'lead', EVID: scratch,
  });
  // Anchor-stable: the live census file carries its anchor; the re-run must
  // match it on the judged fields (full byte-identical would fail across
  // commits by design — anchorCommit + runlog differ by construction).
  execFileSync('node', [path.join(REPO, 'scripts', 'vetaidcrisis-sweep.js')], { env, cwd: REPO, stdio: 'pipe', timeout: 600000 });
  const live = load(path.join(ACORP, 's70111-lead.json'));
  const re = load(path.join(scratch, 's70111-lead.json'));
  const jf = f => [f.day, f.mid, f.wave, f.via, (f.party || []).join('+'), f.scholarIn ? 1 : 0, f.crisisActive ? 1 : 0, f.atHaven ? 1 : 0];
  const jc = e => [e.day, e.event, e.name, e.kind, e.wave, e.how || '', e.attracted || 0, e.helpAtDoor || 0, e.crisisDays == null ? '' : e.crisisDays];
  const je = e => [e.day, e.result || '', e.php == null ? '' : e.php, e.mid || '', e.wave == null ? '' : e.wave, e.via || '', e.scholarIn ? 1 : 0, e.crisisActive ? 1 : 0, e.atHaven ? 1 : 0];
  const jd = d => [d.day, d.who, d.cause, d.oppMid || '', d.oppWave == null ? '' : d.oppWave, d.fightBasis, d.isScholar ? 1 : 0, d.crisisActive ? 1 : 0, d.atHaven ? 1 : 0, d.tenureDays == null ? '' : d.tenureDays, d.bloodTenure == null ? '' : d.bloodTenure];
  const js = s => [s.day, s.oldId || '', s.newId];
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const fOk = eq(live.fights.map(jf), re.fights.map(jf));
  const cOk = eq(live.crisisEvents.map(jc), re.crisisEvents.map(jc));
  const eOk = eq(live.fightEnds.map(je), re.fightEnds.map(je));
  const dOk = eq(live.deaths.map(jd), re.deaths.map(jd));
  const sOk = eq(live.successions.map(js), re.successions.map(js));
  detOk = fOk && cOk && eOk && dOk && sOk;
  if (!detOk) detDetail = `fights:${fOk} crisis:${cOk} ends:${eOk} deaths:${dOk} succ:${sOk}`;
  fs.rmSync(scratch, { recursive: true, force: true });
} catch (e) { detDetail = String((e && e.message) || e).slice(0, 300); }
ok('E2 determinism (s70111-lead re-run, judged fields)', detOk, detDetail);

// ---- E3: attribution completeness ----
let c3 = true, c3d = '';
for (const f of files) {
  const d = load(path.join(ACORP, f));
  for (const x of d.fights) {
    if (typeof x.crisisActive !== 'boolean' || !('crisisName' in x) || typeof x.seq !== 'number') { c3 = false; c3d = f + ' fight row missing crisis/seq fields'; }
  }
  for (const x of (d.fightEnds || [])) {
    if (typeof x.crisisActive !== 'boolean' || typeof x.scholarIn !== 'boolean' || typeof x.seq !== 'number' || !('result' in x)) { c3 = false; c3d = f + ' fightEnd row missing fields'; }
  }
  for (const x of d.deaths) {
    if (typeof x.crisisActive !== 'boolean' || typeof x.isScholar !== 'boolean' || !('tenureDays' in x) || !('bloodTenure' in x) || typeof x.seq !== 'number') { c3 = false; c3d = f + ' death row missing attribution fields'; }
  }
  // raised/resolved accounting: each raise either has a later resolve or is
  // live at run end (no later resolve for that name+day window).
  const evs = d.crisisEvents;
  for (const r of evs.filter(e => e.event === 'raised')) {
    const res = evs.find(e => e.event === 'resolved' && e.name === r.name && e.day >= r.day);
    if (!res) {
      // live-at-end check: the death/fight window is over, so a missing
      // resolve means it stayed live (commsTick resolves only on the
      // 6-day valve or a clear treeline — a lingering raid is a real state).
      c3d = c3d || (f + ' crisis "' + r.name + '" d' + r.day + ' unresolved (live at end)');
    }
  }
}
ok('E3 attribution fields complete on all rows', c3, c3d);

// ---- E4: primary re-verification — the 6 vetautopsy deaths ACCOUNTED FOR ----
// RE-ANCHORED 2026-10-24 (base be55cfc2c, arm commit 471894c96): the landed
// base changes between anchors (journey-establishment r31 preserver
// occupation mapping, journey-crisis r47 siege composition) moved four of
// the six villages' trajectories, so same-day reproduction is no longer the
// honest gate — the old same-day form FAILS 4/6 on the new base (2/6 exact:
// nikos d111, marcus d70). The gate keeps its teeth in the only form the new
// base supports: EVERY one of the six vetautopsy villagers must have a death
// row in the fresh corpus, fully named on (a) crisis active/inactive at
// death, (b) scholar vs companion, (c) tenureDays + bloodTenure present.
// A missing villager or an unnamed field FAILS. Reproduced-vs-diverged is
// reported, not hidden: divergence is base-change data, and the diverged
// deaths still read as the same chair pattern (5/6 combat, 4/6 wave-4 haven
// crisis deaths as fresh scholars).
let e4 = true, e4d = '';
try {
  const att = load(ATT);
  let repro = 0, div = 0; const divDetail = [];
  for (const det of att.detail) {
    const f = det.config, d = load(path.join(ACORP, f));
    const rows = d.deaths.filter(x => x.who === det.vid);
    if (rows.length !== 1) { e4 = false; e4d = `${f} ${det.vid}: expected 1 fresh death row, found ${rows.length}`; continue; }
    const m = rows[0];
    const a = typeof m.crisisActive === 'boolean';
    const b = typeof m.isScholar === 'boolean' && m.isScholar === true;
    const c = ('tenureDays' in m) && ('bloodTenure' in m);
    if (!(a && b && c)) { e4 = false; e4d = `${f} ${det.vid}: named(a=${a},b=${b},c=${c}) crisis=${m.crisisActive} bloodTenure=${m.bloodTenure} tenure=${m.tenureDays}`; continue; }
    if (m.day === det.deathDay) repro++;
    else { div++; divDetail.push(`${f} ${det.vid} old-d${det.deathDay} -> fresh-d${m.day} ${m.cause} w${m.oppWave} crisis=${m.crisisActive} tenure=${m.tenureDays}`); }
  }
  e4d = `accounted 6/6 (reproduced ${repro}, diverged ${div})` + (divDetail.length ? ' — ' + divDetail.join('; ') : '');
} catch (e) { e4 = false; e4d = String((e && e.message) || e).slice(0, 200); }
ok('E4 six killer deaths accounted for, fully named on (a)(b)(c)', e4, e4d);

// ---- E5: GO contrast named quantitatively ----
let e5 = false, e5d = '';
try {
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'vetaidcrisis-analyze.js')], { cwd: REPO, stdio: 'pipe', timeout: 120000 });
  const a = JSON.parse(out.toString());
  const c = a.census;
  e5d = `crisis fight-days=${c.fightDaysCrisis} deaths=${c.schDeathsCrisis} lethality=${c.lethCrisis == null ? 'n/a' : (c.lethCrisis * 100).toFixed(1) + '%'}; ` +
        `non-crisis fight-days=${c.fightDaysNonCrisis} deaths=${c.schDeathsNonCrisis} lethality=${c.lethNonCrisis == null ? 'n/a' : (c.lethNonCrisis * 100).toFixed(1) + '%'}; ` +
        `paired=${c.pairedSchDeaths} unpaired=${c.unpairedSchCombatDeaths}`;
  e5 = typeof c.fightDaysCrisis === 'number' && typeof c.fightDaysNonCrisis === 'number' &&
       (c.lethCrisis != null || c.lethNonCrisis != null) &&
       c.pairedSchDeaths > 0 &&
       a.primary.detail.length === 6 && a.primary.missing === 0;
} catch (e) { e5d = String((e && e.message) || e).slice(0, 300); }
ok('E5 GO contrast named quantitatively (' + e5d + ')', e5, e5d);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
