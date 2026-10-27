// Analyzer for landing r60: starvation-while-away root cause + watches.
// R58: WD probe split gates (surfacing vs covered-thread 'more' denominator),
// early-covered + phase-2 opening counts, and contest join-artifact adjudication
// (unnamed TV line + mantle pass = artifact, not ledger failure).
// Reads landing-r60 census JSONs and, per starvation death, prints the away
// streak, the scholar-energy trajectory, pack contents per away day, pantry
// at death, and "Nothing edible" counts — then assigns cause class:
//   A = pack empty + nothing edible in the wild
//   B = pack held food but no eating happened (energy never rises)
//   C = ate in the wild but yield below burn (energy rises some days, still falls)
//   ? = matches none (NO-GO, unexplained)
// Grief registration (r44 GO) and scholar mortality stay as watches.
// Usage: node scripts/analyze-landing-r60-20261027.js [evidence-dir]
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-27/landing-r60');
const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('NO CENSUS FILES in ' + DIR); process.exit(2); }
let scholarDeaths = 0, scholarDeathSeeds = 0, regMiss = 0, regTotal = 0;
let wdMorePicksTotal = 0, wdMoreEmptyTotal = 0, betrayalHeld = 0, successionNoGo = 0, successionUnresolved = 0;
let wdProbeSittings = 0, wdProbeSurfaced = 0, wdProbeMenuMore = 0, wdProbePageTurns = 0, wdProbePage3 = 0, wdProbeMaxPage = 0;
let wdProbeCoveredSurfaced = 0, wdProbeCoveredMenuMore = 0, wdEarlyCovered = 0, wdPhase2Opened = 0, wdPhase2Yielded = 0;
const successionLatencies = [];
let starvDeaths = 0, starvUnexplained = 0;
let horizonSeeds = 0, horizonFails = 0;
let contestFired = 0, contestEnded = 0, contestOpen = 0, contestOrphanEnd = 0;
let contestDeathsContext = 0, contestDeathsMissing = 0, contestDeathsWildArena = 0, coincidentWildDeaths = 0, contestDisagree = 0;
let contestJoinArtifacts = 0;
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
    `plentyVoice=${(d.r41Summary || {}).plentyVoiceLines} selfSuff=${((d.villageAutonomy || {}).selfSufficiency ?? '?')} ` +
    `monsterKills=${(d.monsterKills || []).length} wdMore=${(d.r41Summary || {}).wdMorePicks || 0}/${(d.r41Summary || {}).wdMoreEmpty || 0} ` +
    `(picks/empty) betrayalOffers=${(d.r41Summary || {}).betrayalOfferCount || 0}`);
  // R59 Q-A HORIZON PANTRY: last series entry = establishment entry state.
  const last = series.length ? series[series.length - 1] : null;
  const tail = series.slice(-4).map(s => `d${s.day}:${s.pantryKcal}/${s.pop}`).join(' ');
  const hpp = last && last.pop ? Math.round(last.pantryKcal / last.pop) : null;
  if (hpp !== null) { horizonSeeds++; if (hpp < 2000) horizonFails++; }
  console.log(`  HORIZON PANTRY: tail[${tail}] finalPerPerson=${hpp} -> ${hpp === null ? '?' : (hpp < 2000 ? 'HUNGRY (<2000/person)' : 'FED')}`);
  // R60 REPLENISHMENT TRACE: biggest series pantry gain per seed, with the
  // legible inflows on its days (pieces, produced sum, meal netBanked, kills).
  {
    const produced = (s) => (s.villagerDay || []).reduce((a, v) => a + (v.produced || 0), 0);
    let best = null;
    for (let i = 1; i < series.length; i++) {
      const g = series[i].pantryKcal - series[i - 1].pantryKcal;
      if (!best || g > best.gain) best = { gain: g, from: series[i - 1], to: series[i] };
    }
    if (best) {
      const kills = (d.monsterKills || []).filter(k => k.day > best.from.day && k.day <= best.to.day)
        .map(k => `${k.monsterId}d${k.day}`).join(',') || 'none';
      const row = (s) => `d${s.day}:pantry=${s.pantryKcal} pieces=${(s.pantryPieces || {}).pieces} ` +
        `median=${(s.pantryPieces || {}).medianKcalEach} produced=${produced(s)} netBanked=${(s.meal || {}).netBanked}`;
      console.log(`  R60 TRACE biggest gain +${best.gain} kcal (${best.from.day}->${best.to.day}, gap ${best.to.day - best.from.day}d) kills[${kills}]`);
      console.log(`    from ${row(best.from)}`);
      console.log(`    to   ${row(best.to)}`);
      const full = series.map(s => `d${s.day}:${s.pantryKcal}`).join(' ');
      console.log(`    series ${full}`);
    }
  }
  for (const s of ((d.r41Summary || {}).wdMoreSamples || [])) console.log(`  WIND-DOWN MORE: ${s}`);
  for (const s of ((d.r41Summary || {}).wdProbeSamples || [])) console.log(`  WD PROBE: ${s}`);
  wdProbeSittings += ((d.r41Summary || {}).wdProbeSamples || []).length;
  for (const s of ((d.r41Summary || {}).wdProbeSamples || [])) {
    if (/surfaced=true/.test(s)) wdProbeSurfaced++;
    if (/menuMore=true/.test(s)) wdProbeMenuMore++;
    const pt = /pageTurns=(\d+)/.exec(s); if (pt) wdProbePageTurns += parseInt(pt[1], 10);
    const p3 = /page3=(\d+)/.exec(s); if (p3) wdProbePage3 += parseInt(p3[1], 10);
    const mp = /maxPage=(\d+)/.exec(s); if (mp) wdProbeMaxPage = Math.max(wdProbeMaxPage, parseInt(mp[1], 10));
    // R58: split-gate fields — covered-thread surfacing is the 'more' denominator.
    const lt = /lastThread=(\S+)/.exec(s);
    if (/surfaced=true/.test(s) && lt && ['goal', 'past', 'plans'].includes(lt[1])) {
      wdProbeCoveredSurfaced++;
      if (/menuMore=true/.test(s)) wdProbeCoveredMenuMore++;
    }
    const ec = /earlyCovered=(\d+)/.exec(s); if (ec) wdEarlyCovered += parseInt(ec[1], 10);
    const p2o = /phase2Opened=(\d+)/.exec(s); if (p2o) wdPhase2Opened += parseInt(p2o[1], 10);
    const p2y = /phase2Yielded=(\d+)/.exec(s); if (p2y) wdPhase2Yielded += parseInt(p2y[1], 10);
  }
  for (const b of ((d.r41Summary || {}).betrayalOfferSamples || [])) {
    const held = b.invitePendingHeld || !b.spokenInSitting;
    if (held) betrayalHeld++;
    console.log(`  BETRAYAL OFFER d${b.day} ${b.npc} want=${b.want} spokenInSitting=${b.spokenInSitting} held=${held} tag=${b.spokenBeatTag}`);
  }
  wdMorePicksTotal += (d.r41Summary || {}).wdMorePicks || 0;
  wdMoreEmptyTotal += (d.r41Summary || {}).wdMoreEmpty || 0;
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
  // --- scholar mortality watch (r52 widened rule, r54 Q-A) ---
  // Latency = mantle day - holder death day. Gate: within [deathDay,
  // deathDay+4] or honestly UNRESOLVED-AT-HORIZON; a holder death with
  // no successor and deathDay <= horizon-4 is NO-GO. Holder chain:
  // spawn scholar, then mantle entries in day order. The old ±1 window
  // would miss the owed 2-4d latencies, so it is replaced, not widened
  // by accident: latencies outside [0,4] are flagged, not absorbed.
  const deathDays = new Map();
  for (const death of deaths) deathDays.set(death.who, death.day);
  const horizon = series.length ? series[series.length - 1].day : 28;
  let seedScholarDeaths = 0;
  const sortedMantle = [...mantle].sort((a, b) => a.day - b.day);
  for (const m of sortedMantle) {
    const dd = deathDays.get(m.from);
    const cause = (deaths.find(x => x.who === m.from) || {}).cause || '?';
    if (dd === undefined) {
      console.log(`  SCHOLAR NOTE: mantle ${nameOf(m.from)} -> ${nameOf(m.to)} d${m.day} with NO recorded death of the from-holder (succession without death — note, not a death latency)`);
      continue;
    }
    const latency = m.day - dd;
    seedScholarDeaths++;
    successionLatencies.push(latency);
    const flag = (latency < 0 || latency > 4) ? ' <-- OUTSIDE [0,4] WINDOW' : (latency >= 2 ? ' <-- LIVE 2-4d LATENCY (owed item)' : '');
    console.log(`  SCHOLAR DEATH: ${nameOf(m.from)} d${dd} cause=${cause} -> mantle ${nameOf(m.to)} d${m.day} latency=${latency}${flag}`);
  }
  scholarDeaths += seedScholarDeaths;
  if (seedScholarDeaths) scholarDeathSeeds++;
  // No-successor check: the final holder in the chain — did they die
  // with no later mantle entry?
  const finalHolder = sortedMantle.length ? sortedMantle[sortedMantle.length - 1].to
    : ((d.spawn || {}).scholarId || null);
  if (finalHolder) {
    const fdd = deathDays.get(finalHolder);
    if (fdd !== undefined) {
      // A mantle entry FROM the final holder would make them non-final;
      // by construction there is none, so this death has no successor.
      if (fdd <= horizon - 4) {
        successionNoGo++;
        console.log(`  SCHOLAR NO-SUCCESSOR NO-GO: final holder ${nameOf(finalHolder)} died d${fdd}, horizon d${horizon}, no mantle entry follows`);
      } else {
        successionUnresolved++;
        console.log(`  SCHOLAR UNRESOLVED-AT-HORIZON: final holder ${nameOf(finalHolder)} died d${fdd}, horizon d${horizon} (inside +4 tail — honestly unresolved, not NO-GO)`);
      }
    }
  }
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
    const participantMatch = !!(span && (span.participants || []).includes(nameOf(a.who)));
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
        // R58 adjudication: a MISSING flag whose TV line does NOT name the
        // deceased, with a mantle pass within 4 days, is a recycled-line
        // join artifact (r57 655 d25: Desmond-glow Vigil line) — the flag
        // still prints, but it is not a ledger failure.
        const named = (a.deathLinesNamed || []).length > 0;
        const mantlePass = mantle.some(m => m.from === a.who && m.day > a.day && m.day <= a.day + 4);
        if (!named && mantlePass) {
          contestJoinArtifacts++;
          console.log(`    CONTEST DEATH d${a.day} ${nameOf(a.who)} cause=${a.cause} NO LEDGER SPAN, televised line names someone else + mantle pass -> JOIN ARTIFACT (r60 adjudication, not ledger failure)`);
        } else {
          contestDeathsMissing++;
          console.log(`    CONTEST DEATH d${a.day} ${nameOf(a.who)} cause=${a.cause} NO LEDGER SPAN but televised -> MISSING CONTEXT`);
        }
      } else {
        contestDeathsWildArena++;
        console.log(`    WILD-ARENA DEATH d${a.day} ${nameOf(a.who)} cause=${a.cause} (no contest span, no TV death line — wild fight loss, not a contest death)`);
      }
      for (const dl of (a.deathLines || []).slice(0, 2)) console.log(`      DEATH LINE: ${dl.slice(0, 200)}`);
    }
  }
  console.log(`  scholarDeaths(seed)=${seedScholarDeaths} popSeries=${series.map(s => s.pop).join(',')}`);
  void scholarIdAt;
}
console.log(`SUMMARY: starvationDeaths=${starvDeaths} unexplained=${starvUnexplained} ` +
  `griefMiss=${regMiss}/${regTotal} scholarDeaths=${scholarDeaths} on ${scholarDeathSeeds}/${files.length} seeds`);
console.log(`CONTEST SUMMARY: fired=${contestFired} ended=${contestEnded} openAtHorizon=${contestOpen} ` +
  `orphanEnds=${contestOrphanEnd} deathsWithContext=${contestDeathsContext} deathsMissing=${contestDeathsMissing} ` +
  `joinArtifacts=${contestJoinArtifacts} ` +
  `wildArenaDeaths=${contestDeathsWildArena} coincidentWildDeaths=${coincidentWildDeaths} driverDisagreements=${contestDisagree}`);
if (contestFired === 0) console.log('CONTEST LEDGER: VACUOUS (no contests fired in the window — question unanswered, not GO)');
else if (contestDeathsMissing > 0 || contestOrphanEnd > 0 || contestDisagree > 0) console.log('CONTEST LEDGER: NO-GO (missing context, orphan end, or driver disagreement)');
else console.log('CONTEST LEDGER: GO (every contest death carries its contest context)');
console.log(starvUnexplained === 0 ? 'STARVATION: GO (every death assigned a cause class)' : 'STARVATION: NO-GO (unexplained death)');
console.log(regMiss === 0 ? 'GRIEF WATCH: holds (all registered)' : 'GRIEF WATCH: REGRESSION (miss)');
console.log(`HORIZON PANTRY (r60 Q-A): seeds=${horizonSeeds} hungry=${horizonFails} ` +
  (horizonFails >= 2 ? 'PATTERN (collapse recurs — lever work candidate)' :
   horizonFails === 1 ? 'ONE-SEED (r58 outlier shape, watch continues)' : 'FED (no horizon collapse)'));
console.log(`WIND-DOWN MORE (r60 watch): picks=${wdMorePicksTotal} empty=${wdMoreEmptyTotal} ` +
  (wdMorePicksTotal === 0 ? 'VACUOUS (no winddown-more fired — unit proof stands)' :
   wdMoreEmptyTotal === 0 ? 'GO (every winddown-more beat carried content)' : 'NO-GO (empty winddown-more beat post-fix)'));
console.log(`WD PROBE (r60 watch, r58 closed GO): sittings=${wdProbeSittings} surfaced=${wdProbeSurfaced} menuMore=${wdProbeMenuMore} pageTurns=${wdProbePageTurns} page3sittings=${wdProbePage3} maxPage=${wdProbeMaxPage} ` +
  `coveredSurfaced=${wdProbeCoveredSurfaced} coveredMenuMore=${wdProbeCoveredMenuMore} earlyCovered=${wdEarlyCovered} phase2Opened=${wdPhase2Opened} phase2Yielded=${wdPhase2Yielded} ` +
  (wdProbeSittings === 0 ? 'PROBE-NOT-RUN (no WD sitting completed)' :
   wdProbeSurfaced === 0 ? 'VACUOUS (no WD sitting reached winddown)' :
   wdProbeSurfaced < 3 ? 'GATE-A NO-GO (surfacing <3/4)' :
   wdProbeCoveredSurfaced === 0 ? 'GATE-A GO, GATE-B NO-DENOMINATOR (no covered-thread surfacing — the probe changes did not create one)' :
   wdProbeCoveredMenuMore > 0 ? 'GATE-A GO, GATE-B GO (covered-thread surfacing offered more)' : 'GATE-A GO, GATE-B NO-GO (covered-thread surfacing offered no more)'));
console.log(`BETRAYAL HELD-INVITE (r60 Q-B): heldOffers=${betrayalHeld} ` +
  (betrayalHeld > 0 ? 'OWED FINDING PRESENT (held-invite offer surfaced)' : 'none (spoken streak extends)'));
console.log(`SUCCESSION (r60 Q-D): latencies=[${successionLatencies.join(',')}] noSuccessorNoGo=${successionNoGo} unresolvedAtHorizon=${successionUnresolved} ` +
  (successionNoGo > 0 ? 'NO-GO' : successionLatencies.some(l => l >= 2 && l <= 4) ? 'GO (live 2-4d latency observed)' :
   successionLatencies.length === 0 && successionUnresolved === 0 ? 'VACUOUS (zero holder deaths)' : 'within window (latencies 0-1 only, owed 2-4d still open)'));
