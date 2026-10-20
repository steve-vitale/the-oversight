#!/usr/bin/env node
// killattr-analyze-20261020.js — deep death taxonomy for arm sim-killeraftermath
// (flesh-out loop run fleshout-20261020T2015Z, axis scale-onramp). DIAGNOSTIC.
//
// Reads evidence/2026-10-20/perseed-killattr/control/ and, for every wave-4+
// scholar kill (via='player', by===scholar vid at kill time), finds the
// killer incarnation's player-death within +30d (E3 convention) and
// classifies it with the death-time ctx captured by
// scripts/killattr-instrument-20261020.js:
//
//   kill-fight          death.day === kill.day
//   sealed              death in a noFlee fight or an arena contest (the #695
//                       sealed-fight shape; arenaContest deaths included)
//   raid                combat cause, atHaven, same-day raid tick fired
//                       (empty-draft composition: was the scholar alone?)
//   haven-encounter     combat cause, atHaven, no raid night
//   expedition-encounter combat cause, onExped, inTb
//   wild-encounter      combat cause, not atHaven, not onExped, inTb
//   combat-non-tb       combat cause, not inTb (field/patrol resolutions)
//   attrition           sickness/dehydration/starvation/exposure/thirst/
//                       hunger/disease
//   alive               no killer death within +30d
//   other:<cause>       everything else
//
// Also reports: scholar HP at kill time (how hurt the killer walks out),
// party size at kill, alone-at-death rates, days-to-death distribution,
// opponent mids/waves at death, pyrrhic kills.
//
// Usage: node scripts/killattr-analyze-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-killattr', 'control');
const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];
const POLICIES = ['leadfeast', 'belongfeast'];
const WIN = 30;

const ATTRITION = new Set(['sickness', 'disease', 'dehydration', 'thirst', 'starvation', 'starved', 'hunger', 'exposure', 'the expedition']);
const COMBATISH = new Set(['combat', 'monster', 'expedition', 'patrol', 'injuries']);

function load() {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(DIR, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: policyId, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}

function scholarKills(r) {
  // wave-4+ kills by the scholar incarnation (TB kill path stamps the vid).
  return (r.kills || []).filter(k =>
    (k.wave | 0) >= 4 && k.via === 'player' && k.by && k.ctx && k.by === k.ctx.scholarVid);
}

function killerDeath(r, kill) {
  let best = null;
  for (const d of (r.deaths || [])) {
    if (String(d.who) !== String(kill.by)) continue;
    if (d.day < kill.day || d.day > kill.day + WIN) continue;
    if (!best || d.day < best.day) best = d;
  }
  return best;
}

function classify(kill, death) {
  if (!death) return 'alive';
  if (death.day === kill.day) return 'kill-fight';
  if (death.noFlee || death.arena) return 'sealed';
  const cause = String(death.cause || 'unknown');
  if (ATTRITION.has(cause)) return 'attrition';
  if (COMBATISH.has(cause)) {
    if (death.raidNight && death.atHaven) return 'raid';
    if (death.atHaven) return death.inTb ? 'haven-encounter' : 'combat-non-tb';
    if (death.onExped) return death.inTb ? 'expedition-encounter' : 'combat-non-tb';
    return death.inTb ? 'wild-encounter' : 'combat-non-tb';
  }
  return 'other:' + cause;
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function analyze() {
  const rows = load();
  let instErr = 0;
  for (const { r } of rows) instErr += (r.instrumentErrorCount | 0);
  if (instErr) console.log(`INSTRUMENT ERRORS: ${instErr} (see per-seed JSONs)`);

  const kills = [];
  const censored = [];
  for (const { policy, seed, r } of rows) {
    for (const k of scholarKills(r)) {
      if (k.day + WIN > r.gameDays) { censored.push({ policy, seed, kill: k, gameDays: r.gameDays }); continue; }
      const death = killerDeath(r, k);
      const cls = classify(k, death);
      kills.push({ policy, seed, kill: k, death, cls });
    }
  }

  const tax = {};
  for (const k of kills) tax[k.cls] = (tax[k.cls] || 0) + 1;
  const alive = (tax.alive || 0);

  console.log(`kills=${kills.length} censored=${censored.length} alive=${alive} share=${kills.length ? (alive / kills.length).toFixed(3) : 'n/a'}`);
  console.log('TAXONOMY: ' + JSON.stringify(tax));

  // Mechanism depth per class.
  for (const cls of Object.keys(tax).sort()) {
    console.log(`\n--- ${cls} (${tax[cls]}) ---`);
    for (const k of kills.filter(x => x.cls === cls)) {
      const d = k.death;
      const kill = k.kill;
      const kc = kill.ctx || {};
      if (!d) {
        console.log(`  ${k.policy} s${k.seed}: ${kill.mid} d${kill.day} (killHP=${kc.scholarHp} party=${(kc.partyVids || []).length}) — ALIVE at +30d`);
        continue;
      }
      const opps = (d.opps || []).map(o => `${o.mid || '?'}w${o.wave}`).join(',') || 'none';
      console.log(`  ${k.policy} s${k.seed}: ${kill.mid} d${kill.day} (killHP=${kc.scholarHp},killParty=${(kc.partyVids || []).length}${kill.pyrrhic ? ',PYRRHIC' : ''}) -> death d${d.day} (+${d.day - kill.day}d) cause=${d.cause} atHaven=${d.atHaven} inTb=${d.inTb} raid=${d.raidNight} noFlee=${d.noFlee} arena=${d.arena} onExped=${d.onExped} loc=${JSON.stringify(d.loc)} opps=[${opps}] allies=${(d.allies || []).length}`);
    }
  }

  // Kill-walkout health: how hurt are killers when they leave the kill fight?
  const hps = kills.map(k => (k.kill.ctx || {}).scholarHp).filter(x => x != null);
  console.log(`\nkill-walkout HP: n=${hps.length} median=${median(hps)} min=${hps.length ? Math.min(...hps) : 'n/a'}`);

  // Days-to-death for the dead.
  const lags = kills.filter(k => k.death && k.cls !== 'alive').map(k => k.death.day - k.kill.day);
  console.log(`lags (dead killers): n=${lags.length} median=${median(lags)} min=${lags.length ? Math.min(...lags) : 'n/a'} max=${lags.length ? Math.max(...lags) : 'n/a'}`);

  // Censored detail.
  if (censored.length) {
    console.log('\nCENSORED (kill+30d beyond run end):');
    for (const c of censored) console.log(`  ${c.policy} s${c.seed}: ${c.kill.mid} d${c.kill.day} (gameDays=${c.gameDays})`);
  }

  // Wall numbers for the corpus.
  let national = 0, table = 0, wins = 0, w4 = 0, w5 = 0;
  const surv = [];
  const causes = {};
  for (const { r } of rows) {
    if (r.maxRank === 'national' || r.maxRank === 'global') national++;
    if (r.everTable) table++;
    if (r.won) wins++;
    if ((r.maxWave | 0) >= 4) w4++;
    if ((r.maxWave | 0) >= 5) w5++;
    surv.push(r.gameDays | 0);
    for (const d of (r.deaths || [])) { const c = String(d.cause || 'unknown'); causes[c] = (causes[c] || 0) + 1; }
  }
  console.log(`\nWALL: national=${national}/16 table=${table}/16 wins=${wins}/16 wave4=${w4}/16 wave5=${w5}/16 medianSurv=${median(surv)} max=${Math.max(...surv)}`);
  console.log('player-death causes: ' + JSON.stringify(causes));

  const out = { window: WIN, kills: kills.length, censored: censored.length, alive, taxonomy: tax,
    walkoutHpMedian: median(hps), lagMedian: median(lags),
    wall: { national, table, wins, w4, w5, medianSurv: median(surv) } };
  fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-20', 'killattr-taxonomy.json'), JSON.stringify(out, null, 2) + '\n');
  console.log('\nwrote evidence/2026-10-20/killattr-taxonomy.json');
}

analyze();
