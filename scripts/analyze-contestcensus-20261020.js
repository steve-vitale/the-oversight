#!/usr/bin/env node
// analyze-contestcensus-20261020.js — contest-lethality census for arm sim-contestcensus
// (flesh-out loop run fleshout-20261020T2145Z, axis scale-onramp). DIAGNOSTIC.
//
// Answers the sim-killeraftermath named next: "contest lethality for
// recovering champions" — ZERO new sims, ZERO src/js. Mines the committed
// corpora in evidence/2026-10-20/:
//
//   perseed-killattr/{control,armed}/{leadfeast,belongfeast}/s64xxx.json
//     full KILLATTR instrument records: kills[] (waveKillLog) + deaths[]
//     (playerDeath with death-time ctx). Census corpus: scholar wave-4+ kills
//     (via='player', by===ctx.scholarVid — the TB kill path stamps the vid),
//     killer fate traced over +30d (E3 convention).
//
//   perseed-villagergear-pilot/ + perseed-villagergear-confirm/
//     carry w4killsDetail (killer vid + kill day) but only AGGREGATE
//     deathCauses — no per-vid death records, so killer-death attribution is
//     impossible. Documented gap (see evidence/sim-contestcensus.md). These
//     enter as a SECONDARY contest-count correlation only.
//
// Taxonomy (order matters; first match wins):
//   censored            kill.day + WIN > run.gameDays (excluded, listed)
//   kill-fight          death.day === kill.day (died in the kill fight)
//   contest             cause === 'contest' (the named next; first-class)
//   sealed-fight        noFlee === true || arena === true
//   raid                raidNight && atHaven && combatish cause
//   haven-encounter     atHaven && inTb && combatish (feast-drawn; allies counted)
//   expedition-encounter onExped && inTb && combatish
//   wild-encounter      inTb && combatish (not atHaven, not onExped)
//   combat-non-tb       combatish && !inTb
//   attrition           sickness/disease/dehydration/thirst/starvation/starved/hunger/exposure
//   alive               no killer death within +WIN
//   other:<cause>       named cause, none of the above — classified, flagged
//   unexplained         death in window but neither a known class nor a named
//                       cause can be assigned (missing fields). GO gate: 0.
//
// Exports the pure functions for the proof test; main() runs the census over
// the committed corpora and writes evidence/2026-10-20/contestcensus.json.
// No game modules are eval'd; no Math.random seeding needed (no harness).
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const KDIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-killattr');
const VDIRS = ['perseed-villagergear-pilot', 'perseed-villagergear-confirm'];
const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];
const POLICIES = ['leadfeast', 'belongfeast'];
const ARMS = ['control', 'armed'];
const WIN = 30;

const ATTRITION = new Set(['sickness', 'disease', 'dehydration', 'thirst', 'starvation', 'starved', 'hunger', 'exposure']);
const COMBATISH = new Set(['combat', 'monster', 'expedition', 'patrol', 'injuries', 'villager combat', 'ambush']);

function isScholarKill(k) {
  return (k.wave | 0) >= 4 && k.via === 'player' && k.by && k.ctx && String(k.by) === String(k.ctx.scholarVid);
}

function isCensored(kill, gameDays, win) {
  return (kill.day + (win == null ? WIN : win)) > (gameDays | 0);
}

function findKillerDeath(deaths, kill, win) {
  const w = win == null ? WIN : win;
  let best = null;
  for (const d of (deaths || [])) {
    if (String(d.who) !== String(kill.by)) continue;
    if (d.day == null || d.day < kill.day || d.day > kill.day + w) continue;
    if (!best || d.day < best.day) best = d;
  }
  return best;
}

function classify(kill, death) {
  if (!death) return 'alive';
  if (death.day === kill.day) return 'kill-fight';
  const cause = death.cause == null ? null : String(death.cause);
  if (cause === 'contest') return 'contest';
  if (death.noFlee === true || death.arena === true) return 'sealed-fight';
  const combat = cause && COMBATISH.has(cause);
  if (combat) {
    if (death.raidNight === true && death.atHaven === true) return 'raid';
    if (death.atHaven === true) return death.inTb === true ? 'haven-encounter' : 'combat-non-tb';
    if (death.onExped === true) return death.inTb === true ? 'expedition-encounter' : 'combat-non-tb';
    return death.inTb === true ? 'wild-encounter' : 'combat-non-tb';
  }
  if (cause && ATTRITION.has(cause)) return 'attrition';
  if (cause) return 'other:' + cause;
  return 'unexplained';
}

// rows: [{file, policy, seed, arm, r:{kills, deaths, gameDays}}]
function census(rows, win) {
  const w = win == null ? WIN : win;
  const out = { window: w, rows: [], censored: [], nonScholar: [], unexplained: [],
    totals: { w4kills: 0 } };
  for (const { file, policy, seed, arm, r } of rows) {
    for (const k of (r.kills || [])) {
      if (!((k.wave | 0) >= 4)) continue;
      out.totals.w4kills++;
      if (!isScholarKill(k)) { out.nonScholar.push({ file, policy, seed, arm, kill: k }); continue; }
      if (isCensored(k, r.gameDays, w)) { out.censored.push({ file, policy, seed, arm, kill: k, gameDays: r.gameDays }); continue; }
      const death = findKillerDeath(r.deaths, k, w);
      const cls = classify(k, death);
      const row = { file, policy, seed, arm, kill: k, death, cls };
      out.rows.push(row);
      if (cls === 'unexplained') out.unexplained.push(row);
    }
  }
  const tax = {};
  for (const r2 of out.rows) tax[r2.cls] = (tax[r2.cls] || 0) + 1;
  out.taxonomy = tax;
  return out;
}

function loadKillattr() {
  const rows = [];
  for (const arm of ARMS) for (const policy of POLICIES) for (const seed of SEEDS) {
    const fp = path.join(KDIR, arm, policy, `s${seed}.json`);
    if (!fs.existsSync(fp)) throw new Error('missing committed corpus file: ' + fp);
    rows.push({ file: fp, policy, seed, arm, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}

// Secondary: villagergear w4killsDetail — aggregate deathCauses only, so per-killer
// attribution is impossible. Report per-file: kill count + contest-death count.
function villagergearSecondary() {
  const out = [];
  for (const vdir of VDIRS) {
    const dir = path.join(REPO, 'evidence', '2026-10-20', vdir);
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json') || f.startsWith('_summary')) continue;
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const kills = j.w4killsDetail || [];
      if (!kills.length) continue;
      out.push({ file: `${vdir}/${f}`, seed: j.seed, policy: j.policy, arm: j.arm,
        kills: kills.map(k => ({ d: k.d, mid: k.mid, by: k.by, byName: k.byName, via: k.via })),
        days: j.days, contestDeaths: (j.deathCauses || {}).contest || 0,
        deathCauses: j.deathCauses });
    }
  }
  return out;
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function main() {
  const rows = loadKillattr();
  let instErr = 0;
  for (const { r } of rows) instErr += (r.instrumentErrorCount | 0);
  if (instErr) console.log(`INSTRUMENT ERRORS: ${instErr}`);

  const res = census(rows, WIN);
  const dead = res.rows.filter(r2 => r2.cls !== 'alive');
  const contestDeaths = dead.filter(r2 => r2.cls === 'contest');
  const lagMedian = median(dead.map(r2 => r2.death.day - r2.kill.day));

  console.log(`CORPUS: ${rows.length} runs (control 16 + armed 16), w4+kills=${res.totals.w4kills}`);
  console.log(`CENSUSED: rows=${res.rows.length} censored=${res.censored.length} nonScholar=${res.nonScholar.length}`);
  console.log(`TAXONOMY: ${JSON.stringify(res.taxonomy)}`);
  console.log(`killer deaths within +${WIN}d: ${dead.length}; contest share: ${dead.length ? (contestDeaths.length / dead.length).toFixed(3) : 'n/a'} (${contestDeaths.length}/${dead.length})`);
  console.log(`median kill->death lag: ${lagMedian}d`);
  console.log(`UNEXPLAINED: ${res.unexplained.length}`);
  console.log(`RECONCILE: ${res.rows.length + res.censored.length + res.nonScholar.length} === ${res.totals.w4kills} ? ${res.rows.length + res.censored.length + res.nonScholar.length === res.totals.w4kills}`);

  console.log('\n--- per-case table (censused rows) ---');
  for (const r2 of res.rows) {
    const k = r2.kill, kc = k.ctx || {};
    const d = r2.death;
    const killHp = kc.scholarHp == null ? '?' : kc.scholarHp;
    if (!d) {
      console.log(`  ${r2.arm} ${r2.policy} s${r2.seed}: ${k.mid} d${k.day} killHP=${killHp} -> ALIVE at +${WIN}d`);
      continue;
    }
    const dc = d;
    console.log(`  ${r2.arm} ${r2.policy} s${r2.seed}: ${k.mid} d${k.day} killHP=${killHp}${k.pyrrhic ? ',PYRRHIC' : ''} -> ${r2.cls} d${dc.day} (+${dc.day - k.day}d) cause=${dc.cause} atHaven=${dc.atHaven} inTb=${dc.inTb} noFlee=${dc.noFlee} arena=${dc.arena} raid=${dc.raidNight} onExped=${dc.onExped} allies=${(dc.allies || []).length} opps=${JSON.stringify((dc.opps || []).map(o => o.mid || o))}`);
  }

  if (res.censored.length) {
    console.log('\nCENSORED (kill+30d beyond run end):');
    for (const c of res.censored) console.log(`  ${c.arm} ${c.policy} s${c.seed}: ${c.kill.mid} d${c.kill.day} (gameDays=${c.gameDays})`);
  }
  if (res.nonScholar.length) {
    console.log('\nNON-SCHOLAR w4+ kills (out of census scope — killer is not a recoverable champion):');
    for (const n of res.nonScholar) console.log(`  ${n.arm} ${n.policy} s${n.seed}: mid=${n.kill.mid} d${n.kill.day} via=${n.kill.via} by=${n.kill.by}`);
  }

  const vg = villagergearSecondary();
  const vgContestTotal = vg.reduce((a, v) => a + v.contestDeaths, 0);
  console.log(`\nVILLAGERGEAR secondary: ${vg.length} per-seed files with w4+ kills; contest deaths (aggregate, unattributable): ${vgContestTotal}`);
  for (const v of vg) {
    console.log(`  ${v.file}: ${v.kills.length} kills [${v.kills.map(k => `${k.byName} d${k.d} via=${k.via}`).join('; ')}] contestDeaths=${v.contestDeaths} days=${v.days}`);
  }

  const outJson = { window: WIN, generated: 'contestcensus', corpus: { control: 16, armed: 16 },
    totals: res.totals, taxonomy: res.taxonomy,
    contestShare: dead.length ? contestDeaths.length / dead.length : null,
    contestDeaths: contestDeaths.length, killerDeaths: dead.length,
    lagMedian, unexplained: res.unexplained.length,
    villagergearSecondary: vg };
  fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-20', 'contestcensus.json'), JSON.stringify(outJson, null, 2) + '\n');
  console.log('\nwrote evidence/2026-10-20/contestcensus.json');
}

if (require.main === module) main();
module.exports = { classify, findKillerDeath, isCensored, isScholarKill, census, WIN };
