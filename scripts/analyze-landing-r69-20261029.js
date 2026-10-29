// Analyzer for landing r69: same as r68 (starvation-while-away root cause +
// watches + R68 PARTY), PLUS the R69 ARMOR block: seeded wearers at d1,
// stash-material maxima, craft attempts (tele vs narration lines), pile
// draws. Reads landing-r69 census JSONs. Copied from r68; changes: DIR
// default landing-r69, plus the R69 ARMOR block below.
// Analyzer for landing r68: same as r67 (starvation-while-away root cause +
// watches + R62 FLESH block + R66 SLIDE block + R67 CASE block), OUTDIR
// landing-r68, PLUS the R68 PARTY block: per invite_party pick, adjudicate
// spoken vs dry (the shipped succseam fix's wild re-proof). Pre-registered:
// hidden_files/evidence/2026-10-29/journey-landing-r68-prereg.md
// Analyzer for landing r67: same as r66 (starvation-while-away root cause +
// watches + R62 FLESH block + R66 SLIDE block), OUTDIR landing-r67, PLUS the
// R67 CASE block: per framing sitting, adjudicate the framing line's named
// person against the snapshot case targets (MATCH) vs accused-only / no-case
// (MISMATCH), and join framing cases to later deaths (TARGET-DIED-LATER,
// context only). Pre-registered:
// hidden_files/evidence/2026-10-28/journey-landing-r67-prereg.md
// Analyzer for landing r66: same as r65 (starvation-while-away root cause +
// watches + R62 FLESH block), OUTDIR landing-r66, PLUS the R66 SLIDE block:
// the r61 revised food gate's slide clause, adjudicated from the existing
// series[].scholarKcal (r64/r65's "no scholar-kcal series" diagnosis was
// wrong — the series carries scholarKcal in every snap; the gap was
// analyzer-side). last3 = mean of final 3 snaps: SLIDE <1000, BAND
// [1000,1500), NO-SLIDE >=1500. Framing-line scan is done separately by
// grep over transcripts (see run note); analyzer logic otherwise UNCHANGED.
// Pre-registered: hidden_files/evidence/2026-10-28/journey-landing-r65-prereg.md
// Journey leg: LANDING (days 1-28) R63 -- BASE-DRIFT RE-READ after the 2026-10-27
// gap landings (ammo pocketing, routing to known monsters, monster-meat channel,
// social dry-fallback grammar, seat-taker choice) + r62's monster-meat tail
// question on a third sample. Copied from r62 (2026-10-27); changes: seeds
// 677-680, OUTDIR landing-r65. All other logic UNCHANGED.
// Pre-registered: hidden_files/evidence/2026-10-28/journey-landing-r65-prereg.md
// Analyzer for landing r63: starvation-while-away root cause + watches +
// R62 FLESH block (monster-meat tail: haul -> test -> pantry exit, from
// fleshArc + series pantryPieces; pantry exit is NOT claimed as eaten).
// R58: WD probe split gates (surfacing vs covered-thread 'more' denominator),
// early-covered + phase-2 opening counts, and contest join-artifact adjudication
// (unnamed TV line + mantle pass = artifact, not ledger failure).
// Reads landing-r62 census JSONs and, per starvation death, prints the away
// streak, the scholar-energy trajectory, pack contents per away day, pantry
// at death, and "Nothing edible" counts — then assigns cause class:
//   A = pack empty + nothing edible in the wild
//   B = pack held food but no eating happened (energy never rises)
//   C = ate in the wild but yield below burn (energy rises some days, still falls)
//   ? = matches none (NO-GO, unexplained)
// Grief registration (r44 GO) and scholar mortality stay as watches.
// Usage: node scripts/analyze-landing-r62-20261027.js [evidence-dir]
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-29/landing-r69');
const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('NO CENSUS FILES in ' + DIR); process.exit(2); }
let scholarDeaths = 0, scholarDeathSeeds = 0, regMiss = 0, regTotal = 0;
let wdMorePicksTotal = 0, wdMoreEmptyTotal = 0, betrayalHeld = 0, successionNoGo = 0, successionUnresolved = 0;
let wdProbeSittings = 0, wdProbeSurfaced = 0, wdProbeMenuMore = 0, wdProbePageTurns = 0, wdProbePage3 = 0, wdProbeMaxPage = 0;
let wdProbeCoveredSurfaced = 0, wdProbeCoveredMenuMore = 0, wdEarlyCovered = 0, wdPhase2Opened = 0, wdPhase2Yielded = 0;
const successionLatencies = [];
let starvDeaths = 0, starvUnexplained = 0;
let horizonSeeds = 0, horizonFails = 0;
let slideSeeds = 0, slideBandSeeds = 0, slideNoSlideSeeds = 0;
let contestFired = 0, contestEnded = 0, contestOpen = 0, contestOrphanEnd = 0;
let caseSittings = 0, caseMatch = 0, caseMismatch = 0, caseUnresolved = 0, caseTargetDiedLater = 0;
let contestDeathsContext = 0, contestDeathsMissing = 0, contestDeathsWildArena = 0, coincidentWildDeaths = 0, contestDisagree = 0;
let contestJoinArtifacts = 0;
let fleshArrivalSeeds = 0, fleshTestSeeds = 0, fleshExitSeeds = 0, fleshStuckSeeds = 0, fleshOpenSeeds = 0;
let partyOffered = 0, partyPicks = 0, partyDry = 0, partySpoken = 0, partyAccepted = 0;
let armorSeedSeeds = 0, armorBarkSeeds = 0, armorCraftSeeds = 0, armorTeleLineDisagree = 0, armorPileSeeds = 0;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const series = d.series || [];
  const deaths = d.deaths || [];
  const mantle = d.mantleLog || [];
  const digest = d.awayDayDigest || [];
  // R67 contest-name fix: dead villagers re-enter the census with
  // name == id (vname/displayName falls back to the id once the person
  // record is gone — every r67 seed shows this), so a census-only lookup
  // can never match a contest participant name for a dead villager
  // (694: Reagan's census name is gen_z99z5n6, autopsy name is Reagan).
  // Fall back, in order, to the autopsy name captured at death time, the
  // mantle log's from/to names, and the spawn scholar name. Without this
  // the analyzer flags a correctly-ledgred contest death as a disagreement.
  const nameOf = (id) => {
    const c = (d.census || []).find(p => p.id === id);
    if (c && c.name && c.name !== c.id) return c.name;
    const a = (d.contestDeathAutopsies || []).find(x => x && x.who === id && x.name && x.name !== 'Someone');
    if (a) return a.name;
    for (const m of (d.mantleLog || [])) {
      if (m.from === id && m.fromName) return m.fromName;
      if (m.to === id && m.toName) return m.toName;
    }
    if (d.spawn && d.spawn.scholarId === id && d.spawn.scholarName) return d.spawn.scholarName;
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
  // R66 SCHOLAR-KCAL SLIDE (r61 revised gate, slide clause): series[].scholarKcal
  // is present in every census snap (r64/r65 misdiagnosed this as a data gap);
  // last3 = mean of the final 3 snaps. SLIDE <1000, BAND [1000,1500), NO-SLIDE >=1500.
  {
    const kcals = series.map(s => s.scholarKcal).filter(v => typeof v === 'number');
    const last3 = kcals.slice(-3);
    const last3mean = last3.length ? Math.round(last3.reduce((a, b) => a + b, 0) / last3.length) : null;
    const minK = kcals.length ? Math.min(...kcals) : null;
    const below1000 = kcals.filter(v => v < 1000).length;
    const verdict = last3mean === null ? '?' : (last3mean < 1000 ? 'SLIDE' : (last3mean < 1500 ? 'BAND' : 'NO-SLIDE'));
    if (verdict === 'SLIDE') slideSeeds++;
    else if (verdict === 'BAND') slideBandSeeds++;
    else if (verdict === 'NO-SLIDE') slideNoSlideSeeds++;
    console.log(`  R66 SLIDE: last3mean=${last3mean} final=${kcals.length ? kcals[kcals.length - 1] : '?'} min=${minK} snapsBelow1000=${below1000}/${kcals.length} -> ${verdict}`);
  }
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
  // R67 CASE (r66 carried blank #1: victim-vs-accused labeling of the
  // framing line). betrayalCaseFrame builds the line from cs.target, so
  // the prediction is: the named person IS the case target, never an
  // accused. 'against me' means the spoken-to npc is the target.
  {
    const sittings = d.caseFramingSittings || [];
    const ledger = d.caseLedger || null;
    const first = (n) => String(n || '').split(' ')[0];
    const scholarId = (d.spawn && d.spawn.scholarId) || null;
    const expectedName = (c) => (scholarId && c.target === scholarId) ? 'you' : first(c.targetName);
    if (ledger && ledger.cases) {
      console.log(`  R67 CASE LEDGER (horizon): ${ledger.cases.length} cases, ${(ledger.plots || []).length} plots`);
      for (const c of ledger.cases) console.log(`    CASE ${c.id} d${c.day} charge=${c.charge} target=${c.targetName} accused=[${(c.accusedNames || []).join(', ')}] status=${c.status} role=${c.playerRole}`);
    }
    for (const sit of sittings) {
      caseSittings++;
      const cases = sit.cases || [];
      if (!cases.length) { caseUnresolved++; console.log(`  R67 CASE SITTING d${sit.day} npc=${sit.npc} -> UNRESOLVED (no case snapshot)`); continue; }
      for (const line of (sit.framingLines || [])) {
        let verdict = null, detail = '';
        if (/against me/i.test(line)) {
          const hit = cases.find(c => first(c.targetName) === first(sit.npc));
          verdict = hit ? 'MATCH' : 'MISMATCH'; detail = `against-me npc=${sit.npc} targetHit=${hit ? hit.id : 'none'}`;
        } else {
          const m = /matter of the \S+ of ([A-Za-zÀ-ÿ'’\-]+)/.exec(line);
          const named = m ? m[1] : null;
          if (!named) { verdict = 'UNRESOLVED'; detail = 'unparsed line: ' + line.slice(0, 120); }
          else {
            const tHit = cases.find(c => first(expectedName(c)) === named || first(c.targetName) === named);
            const aHit = cases.some(c => (c.accusedNames || []).some(a => first(a) === named));
            if (tHit) { verdict = 'MATCH'; detail = `named=${named} targetOf=${tHit.id}`; }
            else if (aHit) { verdict = 'MISMATCH'; detail = `named=${named} accused-only`; }
            else { verdict = 'MISMATCH'; detail = `named=${named} in-no-case`; }
          }
        }
        if (verdict === 'MATCH') caseMatch++; else if (verdict === 'MISMATCH') caseMismatch++; else caseUnresolved++;
        console.log(`  R67 CASE SITTING d${sit.day} npc=${sit.npc} -> ${verdict} (${detail}) line="${String(line).slice(0, 120)}"`);
      }
      // TARGET-DIED-LATER join (context only): a framing case's target who
      // dies after the sitting day — the r66 Luis shape, read as two events.
      for (const c of cases) {
        const dl = deaths.find(x => nameOf(x.who) === c.targetName && x.day > sit.day);
        if (dl) { caseTargetDiedLater++; console.log(`    TARGET-DIED-LATER: ${c.targetName} (case ${c.id} d${c.day}) died d${dl.day} cause=${dl.cause || '?'}`); }
      }
    }
    if (!sittings.length) console.log('  R67 CASE: NO-SITTINGS (no framing sitting in this census)');
  }
  // R62 FLESH (monster-meat tail, Steve 2026-10-27: haul->reveal->test->cook
  // to be made working; mechanism measured before landing). Census-visible
  // only: fleshArc transitions + pantryByDay, streamCounts, final foodSafe.
  // Pantry exit is NOT claimed as eaten — units may be tested away, spoiled,
  // or otherwise removed; the run note says so.
  {
    const fa = d.fleshArc || {};
    const byDay = fa.pantryByDay || [];
    const units = byDay.map(p => p.unknownFleshUnits || 0);
    const peak = units.length ? Math.max(...units) : 0;
    const horizon = units.length ? units[units.length - 1] : 0;
    const peakDay = units.length ? byDay[units.indexOf(peak)].day : null;
    const trans = fa.transitions || [];
    const sc = fa.streamCounts || {};
    const tested = {};
    try {
      const lastFlesh = series.length ? series[series.length - 1].flesh : null;
      for (const [mid, e] of Object.entries((lastFlesh && lastFlesh.foodSafe) || {}))
        if (e && e.safe) tested[mid] = e;
    } catch (e) {}
    const opens = trans.length > 0 && horizon < peak;
    console.log(`  R62 FLESH kills=${(d.monsterKills || []).length} peak=${peak}` +
      (peakDay !== null ? ` (d${peakDay})` : '') + ` horizon=${horizon} ` +
      `exit=${peak - horizon} tests=${trans.length} ` +
      `stream[hauls=${sc.haulsSeen ?? '?'} deposits=${sc.deposits ?? '?'} ` +
      `experiments=${sc.experiments ?? '?'} reveals=${sc.reveals ?? '?'} ` +
      `poison=${sc.poisonVerdicts ?? '?'} rot=${sc.rotLines ?? '?'}] ` +
      `safeAtHorizon=${Object.keys(tested).join(',') || 'none'} -> ` +
      (peak === 0 ? 'NO-ARRIVAL' : (opens ? 'TAIL-MOVES' : 'STUCK')));
    for (const t of trans) console.log(`    TEST d${t.day} ${t.mid} how=${t.how} by=${t.testedBy}`);
    for (const s of (fa.experimentLines || [])) console.log(`    EXPERIMENT: ${s}`);
    for (const s of (fa.haulSeenLines || [])) console.log(`    HAUL-SEEN: ${s}`);
    fleshArrivalSeeds += (peak > 0 ? 1 : 0);
    fleshTestSeeds += (trans.length > 0 ? 1 : 0);
    fleshExitSeeds += (peak > 0 && horizon < peak ? 1 : 0);
    fleshOpenSeeds += (peak > 0 && trans.length > 0 && horizon < peak ? 1 : 0);
    fleshStuckSeeds += (peak > 0 && horizon === peak ? 1 : 0);
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
  // R68 PARTY: per invite_party pick, spoken vs dry. Dry = the seam shape
  // (run-ledger dry line or empty beat); inPartyAfter = acceptance.
  {
    const picks = d.invitePartyPicks || [];
    const sum = d.r41Summary || {};
    partyOffered += sum.invitePartyOffered || 0;
    partyPicks += picks.length;
    for (const p of picks) {
      if (p.dry) partyDry++; else partySpoken++;
      if (p.inPartyAfter) partyAccepted++;
      console.log(`    R68 PARTY d${p.day} ${p.npc} dry=${!!p.dry} inPartyAfter=${p.inPartyAfter} line="${String(p.line || '').slice(0, 160)}"`);
    }
    if (!picks.length) console.log(`    R68 PARTY: no invite_party pick (offered=${sum.invitePartyOffered || 0} subjectSteers=${sum.inviteSubjectTakes || 0})`);
  }
  // R69 ARMOR: seeded wearers at d1, material maxima, craft attempts.
  {
    const armors = series.map(s => s.armor).filter(a => a);
    const d1 = armors.length ? armors[0] : null;
    const maxMat = (k) => armors.reduce((m, a) => Math.max(m, (a.materials && a.materials[k]) || 0), 0);
    const maxWear = armors.reduce((m, a) => Math.max(m, a.wearers || 0), 0);
    const maxEq = armors.reduce((m, a) => Math.max(m, a.equipped || 0), 0);
    const sum = d.r41Summary || {};
    const teleOk = sum.armorCraftOk || 0, teleFail = sum.armorCraftFail || 0;
    const lineOk = sum.armorCraftLinesOk || 0, lineFail = sum.armorCraftLinesFail || 0;
    const teleAttempts = teleOk + teleFail, lineAttempts = lineOk + lineFail;
    const pile = sum.armorPileDraws || 0;
    // R69 FIX: seedOK = grant fired (seedVid set) OR a carrier already
    // present at d1 (valid skip — the seed's own precondition). Counting
    // wearers alone scored 700's valid skip (stashed-only carrier) a fail.
    const seedOK = !!(d1 && (d1.seedVid || (d1.wearers || 0) >= 1));
    if (seedOK) armorSeedSeeds++;
    if (maxMat('bark') > 0) armorBarkSeeds++;
    if (teleAttempts > 0 || lineAttempts > 0) armorCraftSeeds++;
    if (teleAttempts !== lineAttempts) armorTeleLineDisagree++;
    if (pile > 0) armorPileSeeds++;
    console.log(`  R69 ARMOR d1seedVid=${d1 ? d1.seedVid : '?'} d1wearers=${d1 ? d1.wearers : '?'} d1equipped=${d1 ? d1.equipped : '?'} d1names=[${d1 ? (d1.wearerNames || []).join(',') : ''}] maxWear=${maxWear} maxEq=${maxEq} maxBark=${maxMat('bark')} maxVine=${maxMat('vine')} maxHide=${maxMat('hide')} craftTele=${teleOk}ok/${teleFail}fail craftLines=${lineOk}ok/${lineFail}fail pileDraws=${pile}`);
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
console.log(`R66 REVISED GATE (r61): starvationDeaths=${starvDeaths} slideSeeds=${slideSeeds} bandSeeds=${slideBandSeeds} noSlideSeeds=${slideNoSlideSeeds} -> ` +
  (starvDeaths > 0 || slideSeeds > 0 ? 'HUNGRY (starvation death or scholar-kcal slide)' : 'NOT-HUNGRY (thin pantry alone is WATCH, not HUNGRY)'));
console.log(`R62 FLESH (monster-meat tail): arrivalSeeds=${fleshArrivalSeeds}/${files.length} testSeeds=${fleshTestSeeds} exitSeeds=${fleshExitSeeds} stuckSeeds=${fleshStuckSeeds} openSeeds=${fleshOpenSeeds} ` +
  (fleshArrivalSeeds === 0 ? 'VACUOUS (no flesh reached a pantry)' :
   fleshOpenSeeds > 0 ? 'CHANNEL OPENS (a seed with both a test and a pantry exit)' :
   'CHANNEL STUCK (flesh arrives but never leaves, or tests without exits)'));
console.log(`R69 ARMOR (stay-green under armor build): seedOK=${armorSeedSeeds}/${files.length} barkSeeds=${armorBarkSeeds}/${files.length} craftSeeds=${armorCraftSeeds}/${files.length} pileSeeds=${armorPileSeeds}/${files.length} teleLineDisagree=${armorTeleLineDisagree} ` +
  (armorSeedSeeds < files.length ? 'SEED-NO-GO (a village started with no grant and no carrier)' :
   armorCraftSeeds === 0 ? 'FIRE-NO-GO (no craft attempt in-window on any seed — see precondition analysis)' :
   armorTeleLineDisagree > 0 ? 'INSTRUMENT-DISAGREE (tele vs narration craft counts differ — investigate before trusting either)' :
   'ARMOR-GO (seeded wearers present, craft fired in-window)'));
console.log(`R68 PARTY (invite-outcome speech, shipped succseam re-proof): offered=${partyOffered} picks=${partyPicks} spoken=${partySpoken} dry=${partyDry} accepted=${partyAccepted} ` +
  (partyPicks === 0 ? 'VACUOUS (invite never taken in the window — question unanswered, not GO)' :
   partyDry > 0 ? 'NO-GO (dry invite outcome post-fix — seam still open)' : 'PARTY-GO (every taken invite outcome spoke)'));
console.log(`R67 CASE (labeling): sittings=${caseSittings} match=${caseMatch} mismatch=${caseMismatch} unresolved=${caseUnresolved} targetDiedLater=${caseTargetDiedLater} ` +
  (caseSittings === 0 ? 'VACUOUS (no framing sitting — question unanswered, not GO)' :
   (caseMismatch > 0 || caseUnresolved > 0) ? 'NO-GO (mismatch or unresolved sitting)' : 'LABELING-GO (every framing line names its case target)'));
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
