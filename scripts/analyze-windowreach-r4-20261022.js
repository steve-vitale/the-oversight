#!/usr/bin/env node
// analyze-windowreach-r4-20261022.js — wave-5 REACH census analyzer
// (sim-windowreach-r4, DIAG, axis scale-onramp).
//
// Reads evidence/2026-10-22/perseed-windowreach-r4/{policy}/s<seed>.json
// and prints:
//   1. unlock attribution per unlocking run (unlock day vs win day, bar
//      release days, w5gates-lib attribute verdict, 0-unexplained check)
//   2. the wave-5 REACH census split by channel (canon #749):
//      MONSTER channel: spawns, TB entries, outcomes, kills-by-whom
//        (incl. kill-time attribution), field fights, evades
//      TITAN channel (muster/coalition): herald / nielsen / finale
//        engagements from state.titans.outcomes
//   3. deaths in the window (channel shares, wave-5-related)
//   4. wall numbers + instrument error count.
//
// Usage: node scripts/analyze-windowreach-r4-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-22', 'perseed-windowreach-r4');

const runs = [];
for (const pol of fs.readdirSync(EVID)) {
  const dir = path.join(EVID, pol);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/^s\d+\.json$/.test(f)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    runs.push(r);
  }
}
runs.sort((a, b) => a.seed - b.seed || (a.policyId < b.policyId ? -1 : 1));

const unlocking = runs.filter(r => r.w5Day != null);
console.log(`=== windowreach-r4: ${runs.length} runs, ${unlocking.length} unlocking (maxWave 5) ===\n`);

for (const r of unlocking) {
  console.log(`--- ${r.policyId} s${r.seed}: unlock d${r.w5Day} | winDay=${r.winDay} (path=${r.winPath}, winResumed=${r.winResumed}, postWinDays=${r.postWinDays}) | days=${r.gameDays} end=${r.endReason} errs=${r.instrumentErrors.length}`);
  const gv = r.gateVector;
  if (gv && gv.attr) {
    const a = gv.attr;
    console.log(`  attribution: ${a.outcome} attributed=${a.attributed} why=${a.why}${a.binding ? ' binding=' + a.binding : ''}`);
    console.log(`  end bars r5: armored=${gv.r5.armored} armed=${gv.r5.armed} tricks=${gv.r5.tricks} veterans=${gv.r5.veterans} ready=${gv.r5.ready} | raw=${gv.raw} capped=${gv.capped} peak=${gv.peak} | w4faced=${gv.w4faced}`);
    console.log(`  bar release days (demand=${JSON.stringify(r.demand5)}): ${JSON.stringify(r.barRelease)}`);
    for (const g of a.gates) {
      if (!g.met) console.log(`    UNMET: ${g.id} ${JSON.stringify(g.detail)}`);
    }
  } else {
    console.log(`  attribution: MISSING (gateErr=${r.gateErr})`);
  }

  // MONSTER channel — wave-5 monsters (canon #749 split).
  const sp5 = r.spawns.filter(s => s.wave === 5 && s.channel === 'monster');
  const spByMid = {};
  for (const s of sp5) { const k = s.mid + '/' + s.src; spByMid[k] = (spByMid[k] || 0) + 1; }
  const eng5 = r.engagements.filter(e => e.wave === 5 && e.channel === 'monster');
  const engOut = {};
  for (const e of eng5) { const k = (e.started ? (e.outcome || 'unrecorded') : 'TB-REFUSED'); engOut[k] = (engOut[k] || 0) + 1; }
  const k5 = r.kills.filter(k => k.wave === 5 && k.channel === 'monster');
  const kBy = {};
  for (const k of k5) {
    const who = k.byScholar ? 'scholar' : ('villager:' + (k.by || '?'));
    const kk = who + '/' + (k.via || '?') + (k.pyrrhic ? '/pyrrhic' : '');
    kBy[kk] = (kBy[kk] || 0) + 1;
  }
  const ff5 = r.fieldFights.filter(f => f.wave === 5 && f.channel === 'monster');
  const ffOut = {};
  for (const f of ff5) { ffOut[f.outcome] = (ffOut[f.outcome] || 0) + 1; }
  const evades = eng5.filter(e => e.outcome === 'fled').length + ff5.filter(f => /evade|vFlee|mFlee/.test(f.outcome || '')).length;

  console.log(`  MONSTER channel (wave-5): spawns=${sp5.length} ${JSON.stringify(spByMid)}`);
  console.log(`    TB entries=${eng5.length} outcomes=${JSON.stringify(engOut)}`);
  console.log(`    kills=${k5.length} by=${JSON.stringify(kBy)}`);
  console.log(`    fieldFights=${ff5.length} outcomes=${JSON.stringify(ffOut)} evades=${evades}`);
  if (eng5.length) {
    for (const e of eng5.slice(0, 12)) {
      console.log(`      d${e.d} ${e.mid} ${e.started ? (e.outcome || 'unrecorded') : 'TB-REFUSED'} killJoin=${e.killJoin} by=${e.killBy || '-'} via=${e.killVia || '-'}`);
    }
  }
  if (k5.length) {
    for (const k of k5.slice(0, 12)) {
      console.log(`      KILL d${k.d} ${k.mid} by=${k.byScholar ? 'scholar' : k.by} via=${k.via}${k.pyrrhic ? ' PYRRHIC' : ''}`);
    }
  }

  // TITAN channel — herald (w4) + nielsen/finale (w5) from the muster log.
  const to = r.titanOutcomes || [];
  const toBy = {};
  for (const x of to) { const k = `${x.titan}(w${x.wave})=${x.outcome}`; toBy[k] = (toBy[k] || 0) + 1; }
  console.log(`  TITAN channel (muster): ${to.length} records ${JSON.stringify(toBy)}`);
  for (const x of to.slice(0, 12)) console.log(`      d${x.day} ${x.titan} (w${x.wave}): ${x.outcome} ${x.detail && x.detail.gate ? 'gate=' + x.detail.gate : ''}`);

  // Deaths in the post-unlock window.
  const dw = (r.deathRows || []).filter(d => r.w5Day != null && d.day >= r.w5Day && d.real !== false);
  const dwChan = {};
  for (const d of dw) { dwChan[d.channel] = (dwChan[d.channel] || 0) + 1; }
  const dwPlayer = dw.filter(d => d.player).length;
  console.log(`  deaths in window (d>=${r.w5Day}): ${dw.length} (scholar=${dwPlayer}) channels=${JSON.stringify(dwChan)}`);
  for (const d of dw.slice(0, 20)) {
    console.log(`      d${d.day} ${d.who} [${d.kind}] cause=${d.cause} chan=${d.channel}${d.player ? ' SCHOLAR' : ''} real=${d.real}`);
  }
  console.log('');
}

console.log('=== wall numbers ===');
let nat = 0, tab = 0, won = 0, errs = 0;
for (const r of runs) { nat += r.national | 0; tab += r.table | 0; won += r.won | 0; errs += (r.instrumentErrors || []).length; }
console.log(`runs=${runs.length} national=${nat} table=${tab} wins=${won} wave5-unlocks=${unlocking.length} instrumentErrors=${errs}`);

// Reachability verdict.
const fought5 = unlocking.reduce((a, r) => a +
  r.engagements.filter(e => e.wave === 5 && e.channel === 'monster' && e.started).length, 0);
const killed5 = unlocking.reduce((a, r) => a +
  r.kills.filter(k => k.wave === 5 && k.channel === 'monster').length, 0);
const titanW5 = unlocking.reduce((a, r) => a +
  (r.titanOutcomes || []).filter(x => x.wave === 5 && /fought|slain|fled/.test(x.outcome || '')).length, 0);
console.log(`REACH: wave-5 monster TB fights=${fought5} wave-5 monster kills=${killed5} wave-5 titan engagements=${titanW5}`);
if (!unlocking.length) console.log('VERDICT: DIAG insufficient-data — zero unlocks on current master in this corpus.');
else if (fought5 + titanW5 === 0) console.log('VERDICT: unlock is NOT reach — the door opens but nothing wave-5 is ever FOUGHT (matches #748 open question).');
else console.log('VERDICT: unlocked wave-5 IS fought on current master.');
