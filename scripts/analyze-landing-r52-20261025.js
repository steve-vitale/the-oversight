// Analyzer for landing r52: starvation-while-away root cause + watches.
// Reads landing-r52 census JSONs and, per starvation death, prints the away
// streak, the scholar-energy trajectory, pack contents per away day, pantry
// at death, and "Nothing edible" counts — then assigns cause class:
//   A = pack empty + nothing edible in the wild
//   B = pack held food but no eating happened (energy never rises)
//   C = ate in the wild but yield below burn (energy rises some days, still falls)
//   ? = matches none (NO-GO, unexplained)
// Grief registration (r44 GO) and scholar mortality stay as watches.
// Usage: node scripts/analyze-landing-r52-20261025.js [evidence-dir]
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-25/landing-r52');
const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('NO CENSUS FILES in ' + DIR); process.exit(2); }
let scholarDeaths = 0, scholarDeathSeeds = 0, scholarUnresolved = 0, scholarNoSuccessor = 0, regMiss = 0, regTotal = 0;
let splitVillager = 0, splitMonster = 0;
let starvDeaths = 0, starvUnexplained = 0;
let contestFired = 0, contestEnded = 0, contestOpen = 0, contestOrphanEnd = 0;
let contestDeathsContext = 0, contestDeathsMissing = 0, contestDeathsWildArena = 0, coincidentWildDeaths = 0, contestDisagree = 0;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const series = d.series || [];
  const deaths = d.deaths || [];
  const mantle = d.mantleLog || [];
  const digest = d.awayDayDigest || [];
  const nameOf = (id) => {
    const c = (d.census || []).find(p => p.id === id);
    return c ? c.name : (id || '?');
  };
  console.log(`\n=== seed ${d.seed} (${f}) ===`);
  console.log(`systemDay=${d.systemDay} popEnd=${series.length ? series[series.length - 1].pop : '?'} ` +
    `griefBeats=${(d.r41Summary || {}).griefBeats} theft=${(d.r41Summary || {}).caughtRedHanded} ` +
    `plentyVoice=${(d.r41Summary || {}).plentyVoiceLines}`);
  const roster = new Set((d.census || []).map(x => x.id));
  const villagerDeaths = deaths.filter(x => roster.has(x.who));
  const lastSeriesDay = series.length ? series[series.length - 1].day : null;
  for (const death of villagerDeaths) {
    const day = death.day;
    const snap = series.find(s => s.day >= day) || series[series.length - 1];
    const next = series.find(s => s.day > day);
    const g = snap ? snap.villageGrief : undefined;
    const g2 = next ? next.villageGrief : undefined;
    // Horizon-end edge (pilot 609 d14): a death after the last snapshot has no
    // next snapshot; judge it by the grief value at census-write time instead.
    const gFinal = (day >= lastSeriesDay) ? d.finalGrief : undefined;
    const ok = (g !== undefined && g > 0) || (g2 !== undefined && g2 > 0) ||
      (gFinal !== undefined && gFinal !== null && gFinal > 0);
    regTotal++;
    if (!ok) regMiss++;
    console.log(`  DEATH d${day} ${nameOf(death.who)} cause=${death.cause || '?'} ` +
      `grief@snap=${g} grief@next=${g2} grief@final=${gFinal} -> ${ok ? 'REGISTERED' : 'MISS'}`);
  }
  // --- starvation root cause ---
  const scholarIdAt = (day) => {
    // mantle holder on that day: last mantle transition at/before day, else first holder
    let holder = (series[0] || {}).journalHolder || null;
    for (const m of mantle) if (m.day <= day) holder = m.to;
    return holder;
  };
  for (const death of deaths) {
    if (!/starv|hunger|kcal/i.test(death.cause || '')) continue;
    starvDeaths++;
    const day = death.day;
    // away streak: consecutive wild snapshots ending at/before death day
    let streak = 0;
    for (let i = series.length - 1; i >= 0; i--) {
      if (series[i].day > day) continue;
      if (series[i].loc === 'wild') streak++;
      else break;
    }
    const zeroDays = series.filter(s => s.day <= day && s.scholarKcal === 0).length;
    const before = series.filter(s => s.day <= day);
    const traj = before.map(s => `d${s.day}:${s.loc === 'wild' ? 'W' : 'H'}/${s.scholarKcal}`).join(' ');
    const pan = (d.starvAutopsies || []).find(a => a.who === death.who && a.day === day);
    console.log(`  STARVATION d${day} ${nameOf(death.who)} awayStreak=${streak} zeroKcalDays<=death=${zeroDays} ` +
      `pantryAtDeath=${pan ? pan.pantryEdible : '?'}`);
    console.log(`    trajectory: ${traj}`);
    const awayRows = digest.filter(r => r.day <= day && r.loc === 'wild');
    let packEverKcal = 0, nothingEdibleTotal = 0, ateSomewhere = false;
    let prevKcal = null;
    for (const r of awayRows) {
      const items = (r.packItems || []).map(i => `${i.name}x${i.units}(${i.kcalEach})`).join(', ') || '(empty)';
      const invK = (r.invKcal !== undefined && r.invKcal !== null) ? r.invKcal : r.packKcal;
      if (invK > 0) packEverKcal = Math.max(packEverKcal, invK);
      nothingEdibleTotal += r.nothingEdible || 0;
      if (prevKcal !== null && r.scholarKcal > prevKcal) ateSomewhere = true;
      prevKcal = r.scholarKcal;
      console.log(`    away d${r.day} kcal=${r.scholarKcal} inv=${invK} [${items}] ` +
        `pantry=${r.pantryKcal} nothingEdible=${r.nothingEdible} gut=${r.gutLines}`);
    }
    let cls = '?';
    if (packEverKcal === 0 && nothingEdibleTotal > 0) cls = 'A';
    else if (packEverKcal > 0 && !ateSomewhere) cls = 'B';
    else if (ateSomewhere) cls = 'C';
    if (cls === '?') starvUnexplained++;
    console.log(`    -> CAUSE CLASS ${cls} ` +
      (cls === 'A' ? '(pack empty + nothing edible in the wild)' :
       cls === 'B' ? '(pack held food, never eaten)' :
       cls === 'C' ? '(ate in the wild, yield below burn)' : '(UNEXPLAINED — NO-GO)'));
  }
  // --- scholar mortality watch (R51 WIDENED: r50's +-1-day window missed
  // both real 2-day-later successions, Pedro d10->Zoey d12 and Zoey d17->
  // Ruslan d19, and could not see Arnold's d24 horizon-edge death at all).
  // A villager death counts as a scholar death iff the deceased held the
  // journal on the death day. RESOLVED iff a mantle pass from that holder
  // lands within [deathDay, deathDay+4] (latency in days). No pass and
  // deathDay <= horizon-4 is NO-SUCCESSOR (NO-GO); no pass within 4 days
  // of the horizon is UNRESOLVED-AT-HORIZON (watch, not a miss).
  const horizonDay = series.length ? series[series.length - 1].day : null;
  const holderAt = (day) => {
    // R51 fix (live catch: 630 Victor died d15, mantle passed the SAME day):
    // the holder at the START of the death day — a same-day pass must not
    // be applied before the death check, or the deceased never counts as
    // holder and the succession is missed entirely. Strictly-before only.
    let holder = (series[0] || {}).journalHolder || null;
    for (const m of mantle) if (m.day < day) holder = m.to;
    return holder;
  };
  let seedScholarDeaths = 0, seedUnresolved = 0, seedNoSuccessor = 0;
  for (const death of deaths) {
    if (holderAt(death.day) !== death.who) continue;
    const dd = death.day;
    const pass = mantle.find(m => m.from === death.who && m.day >= dd && m.day <= dd + 4);
    const cause = death.cause || '?';
    if (pass) {
      seedScholarDeaths++;
      console.log(`  SCHOLAR DEATH: ${nameOf(death.who)} d${dd} cause=${cause} -> mantle ${nameOf(pass.to)} d${pass.day} latency=${pass.day - dd}d RESOLVED`);
    } else if (horizonDay !== null && dd > horizonDay - 4) {
      seedUnresolved++;
      console.log(`  SCHOLAR DEATH: ${nameOf(death.who)} d${dd} cause=${cause} -> NO MANTLE PASS within +4d, death within 4d of horizon d${horizonDay} UNRESOLVED-AT-HORIZON`);
    } else {
      seedNoSuccessor++;
      console.log(`  SCHOLAR DEATH: ${nameOf(death.who)} d${dd} cause=${cause} -> NO MANTLE PASS within +4d, horizon d${horizonDay} NO-SUCCESSOR (NO-GO)`);
    }
  }
  scholarDeaths += seedScholarDeaths;
  scholarUnresolved += seedUnresolved;
  scholarNoSuccessor += seedNoSuccessor;
  if (seedScholarDeaths || seedUnresolved || seedNoSuccessor) scholarDeathSeeds++;
  // --- R46 contest ledger + death autopsy (recomputed, not trusted) ---
  const ledger = d.contestLedger || [];
  const autopsies = d.contestDeathAutopsies || [];
  const held = d.contestsHeld || 0;
  console.log(`  CONTESTS held=${held} ledger=${ledger.length} autopsies=${autopsies.length}`);
  for (const e of ledger) {
    if (e.firedFromTele) contestFired++;
    if (e.endedFromTele) contestEnded++;
    else if (e.firedFromTele) contestOpen++;
    if (e.endedFromTele && !e.firedFromTele) contestOrphanEnd++;
    console.log(`    LEDGER ${e.contestId} name=${e.name || e.contestId} kind=${e.kind || '?'} fired=d${e.firedDay} end=d${e.endDay} ` +
      `outcome=${e.outcome || '?'} participants=[${(e.participants || []).join(', ')}] ` +
      `tvLines=${e.tvLineCount || 0} excerpts=${(e.tvExcerpts || []).length}`);
    for (const x of (e.tvExcerpts || []).slice(0, 2)) console.log(`      TV: ${x.slice(0, 200)}`);
    for (const x of (e.phaseExcerpts || []).slice(0, 2)) console.log(`      PHASE: ${String(x).replace(/\n/g, ' / ').slice(0, 200)}`);
  }
  if (held !== ledger.length) console.log(`    LEDGER COUNT NOTE: contestsHeld=${held} vs ledger=${ledger.length} — held counts contests that ENDED; a fired-but-open entry (or a show/summons entry) explains a ledger>held gap`);
  for (const a of autopsies) {
    if (!roster.has(a.who)) continue; // villager deaths only; monster arena kills are not people
    const span = ledger.find(c => c.firedDay != null && c.firedDay <= a.day && (c.endDay == null || a.day <= c.endDay));
    // R46 fix: 'the arena' is also the grid-as-arena for wild fight losses.
    // Televised contest deaths carry a 📺 death line; arena-cause + no span
    // + no death line = wild fight loss, not a contest death with missing
    // context. MISSING is televised-but-unspanned only.
    // R47 fix (619 LaToya/Sorting): a span alone over-claims — the
    // deceased must be a recorded participant or the death televised;
    // a spanned, non-participant, untelevised arena death is a wild fight
    // loss that coincided with a contest day (the successor's contest).
    // R50 fix (628 Zoey): the census name can stay unrevealed (raw id) while
    // the driver resolved the true name at contest time (autopsy .name, from
    // Game.displayName). Match on EITHER name — census-only matching false-
    // flagged Zoey's participant-matched contest death as a wild coincidence.
    const participantMatch = !!(span && ((span.participants || []).includes(nameOf(a.who)) ||
      (a.name && (span.participants || []).includes(a.name))));
    const spanContext = participantMatch || (a.deathLines || []).length;
    const recomputed = (span && spanContext) ? 'LEDGER' : (span ? (a.arenaish ? 'WILD-ARENA-COINCIDENT' : 'n/a') : (a.arenaish && (a.deathLines || []).length ? 'MISSING' : (a.arenaish ? 'WILD-ARENA' : 'n/a')));
    if (recomputed !== a.context) {
      contestDisagree++;
      console.log(`    AUTOPSY DISAGREE d${a.day} ${nameOf(a.who)} driver=${a.context} recomputed=${recomputed}`);
    }
    if (a.arenaish) {
      if (span && spanContext) {
        contestDeathsContext++;
        console.log(`    CONTEST DEATH d${a.day} ${nameOf(a.who)} cause=${a.cause} contest=${span.contestId} outcome=${span.outcome || '?'} participants=[${(span.participants || []).join(', ')}] -> CONTEXT OK`);
      } else if (span) {
        coincidentWildDeaths++;
        console.log(`    WILD-ARENA-COINCIDENT DEATH d${a.day} ${nameOf(a.who)} cause=${a.cause} contest=${span.contestId} participants=[${(span.participants || []).join(', ')}] (deceased not a participant, no TV death line — wild fight loss on a contest day, not a contest death)`);
      } else if ((a.deathLines || []).length) {
        contestDeathsMissing++;
        console.log(`    CONTEST DEATH d${a.day} ${nameOf(a.who)} cause=${a.cause} NO LEDGER SPAN but televised -> MISSING CONTEXT`);
      } else {
        contestDeathsWildArena++;
        console.log(`    WILD-ARENA DEATH d${a.day} ${nameOf(a.who)} cause=${a.cause} (no contest span, no TV death line — wild fight loss, not a contest death)`);
      }
      for (const dl of (a.deathLines || []).slice(0, 2)) console.log(`      DEATH LINE: ${dl.slice(0, 200)}`);
    }
  }
  // R50: deaths split — villager deaths vs monster kills (census fields).
  const vDeaths = d.villagerDeaths || [];
  const mKills = d.monsterKills || [];
  splitVillager += vDeaths.length; splitMonster += mKills.length;
  console.log(`  DEATHS SPLIT: villagerDeaths=${vDeaths.length} monsterKills=${mKills.length} blendedDeaths=${deaths.length} otherKinds=${deaths.length - vDeaths.length - mKills.length}`);
  console.log(`  scholarDeaths(seed)=resolved:${seedScholarDeaths} unresolvedAtHorizon:${seedUnresolved} noSuccessor:${seedNoSuccessor} popSeries=${series.map(s => s.pop).join(',')}`);
  void scholarIdAt;
}
console.log(`SUMMARY: starvationDeaths=${starvDeaths} unexplained=${starvUnexplained} ` +
  `griefMiss=${regMiss}/${regTotal} scholarDeathsResolved=${scholarDeaths} unresolvedAtHorizon=${scholarUnresolved} noSuccessor=${scholarNoSuccessor} on ${scholarDeathSeeds}/${files.length} seeds`);
console.log(scholarNoSuccessor > 0 ? 'SCHOLAR SUCCESSION: NO-GO (holder death with no successor inside +4d)' : (scholarUnresolved > 0 ? 'SCHOLAR SUCCESSION: WATCH (unresolved-at-horizon only, window ran out)' : 'SCHOLAR SUCCESSION: GO (every in-window holder death resolved within +4d)'));
console.log(`DEATHS SPLIT SUMMARY: villagerDeaths=${splitVillager} monsterKills=${splitMonster} (telemetry-check judges these two, not the blend)`);
console.log(`CONTEST SUMMARY: fired=${contestFired} ended=${contestEnded} openAtHorizon=${contestOpen} ` +
  `orphanEnds=${contestOrphanEnd} deathsWithContext=${contestDeathsContext} deathsMissing=${contestDeathsMissing} ` +
  `wildArenaDeaths=${contestDeathsWildArena} coincidentWildDeaths=${coincidentWildDeaths} driverDisagreements=${contestDisagree}`);
if (contestFired === 0) console.log('CONTEST LEDGER: VACUOUS (no contests fired in the window — question unanswered, not GO)');
else if (contestDeathsMissing > 0 || contestOrphanEnd > 0 || contestDisagree > 0) console.log('CONTEST LEDGER: NO-GO (missing context, orphan end, or driver disagreement)');
else console.log('CONTEST LEDGER: GO (every contest death carries its contest context)');
console.log(starvUnexplained === 0 ? 'STARVATION: GO (every death assigned a cause class)' : 'STARVATION: NO-GO (unexplained death)');
console.log(regMiss === 0 ? 'GRIEF WATCH: holds (all registered)' : 'GRIEF WATCH: REGRESSION (miss)');
