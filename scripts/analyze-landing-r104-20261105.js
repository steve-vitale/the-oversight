// Analyzer for landing r94 (r89 verbatim except DIR + R94 LIVEPROMISE split:
// dawn-opp waitDiag counts are split into live promises (promiseFavorId ===
// favorId) vs ledger rows, so door reasons are judged on live promises only).
// Analyzer for landing r85 (r84 verbatim except DIR landing-r85, PLUS the
// R85 RESCUE block at the per-seed tail and summary, on top of the R84 blocks).
// Analyzer for landing r88 (r86 verbatim except DIR + R88 block appended at end).
// Analyzer for landing r86 (r85 verbatim except DIR + R86 block appended at end).
// Analyzer for landing r83 (r80 verbatim except DIR landing-r83).
// Analyzer for landing r78 (r77 verbatim except DIR default): copied from r75 verbatim EXCEPT the R77 change:
// the WINDOW promise set is restricted to favors asked/promised by d14
// (the landing window); adjudication runs over the full 28-day series, so
// d14-OPEN promises can resolve kept/broken late. Post-d14 asks are logged
// as WINDOW-OUT-OF-WINDOW coverage, never counted as windows.
// Analyzer for landing r74: same as r72 (starvation-while-away root cause +
// watches + R68 PARTY + R69 ARMOR + R70 OUTING + R71 OUTING-WORK + R72
// DELIVERY-CHAIN), PLUS the R73 WINDOW block: every forage_help favorId's
// promisedDay / meetDay / favorDeadline / effective due day (promiseDueDay
// rule: max(promisedDay+1, favorDeadline), or promisedDay+7 when no
// deadline) / width / class / departure / delivery / outcome.
// Reads landing-r75 census JSONs. Copied from r72; changes: DIR default
// landing-r75, plus the R73 WINDOW counters below.
// Analyzer for landing r72: same as r71 (starvation-while-away root cause +
// watches + R68 PARTY + R69 ARMOR + R70 OUTING + R71 OUTING-WORK), PLUS the
// R72 DELIVERY-CHAIN block: every haul-carrying together press matched to
// its NEXT deliver/blocked record for the same vid (DELIVERED-KEPT,
// DELIVERED-LATE, BLOCKED, NO-ATTEMPT).
// Reads landing-r75 census JSONs. Copied from r71; changes: DIR default
// landing-r72, plus the R72 DELIVERY-CHAIN counters below.
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
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-05/landing-r104');
const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('NO CENSUS FILES in ' + DIR); process.exit(2); }
let scholarDeaths = 0, scholarDeathSeeds = 0, scholarDeathsUnresolved = 0, regMiss = 0, regTotal = 0;
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
let arrWaterSkips = 0, arrWaterArrived = 0, arrWaterUnresolved = 0, arrWaterMissing = 0;
let arrKcalSkips = 0, arrKcalArrived = 0, arrKcalUnresolved = 0, arrKcalMissing = 0;
let resWaterSkips = 0, resWaterComplete = 0, resWaterIncomplete = 0, resWaterEscMiss = 0, resWaterFinArr = 0, resWaterFinNon = 0, resWaterNamed = 0, resWaterSucc = 0;
let resKcalSkips = 0, resKcalComplete = 0, resKcalIncomplete = 0, resKcalEscMiss = 0, resKcalFinArr = 0, resKcalFinNon = 0, resKcalNamed = 0, resKcalSucc = 0;
let havenHydMaxStreak = 0, havenHydStreakSeeds = 0;
let fleshArrivalSeeds = 0, fleshTestSeeds = 0, fleshExitSeeds = 0, fleshStuckSeeds = 0, fleshOpenSeeds = 0;
let fleshNoArrivalTestedSeeds = 0, fleshNoArrivalUntestedSeeds = 0;
let partyOffered = 0, partyPicks = 0, partyDry = 0, partySpoken = 0, partyAccepted = 0;
let armorSeedSeeds = 0, armorBarkSeeds = 0, armorCraftSeeds = 0, armorTeleLineDisagree = 0, armorPileSeeds = 0;
let outingAskSeeds = 0, outingWaitSeeds = 0, outingDepartSeeds = 0, outingKeptSeeds = 0;
let outingDeparts = 0, outingTogethers = 0, outingReturns = 0, outingTalks = 0, outingKeptTotal = 0;
let outingTogetherOk = 0, outingTogetherBlocked = 0, outingTalkAttempts = 0, outingDeliverDay = 0, outingTogetherHaulSeeds = 0;
let chainHaulPresses = 0, chainDeliveredKept = 0, chainDeliveredLate = 0, chainBlocked = 0, chainNoAttempt = 0;
let winPromises = 0, winNegative = 0, winNarrow = 0, winTight = 0, winRoomy = 0, winKeptNarrow = 0, winAskedOnly = 0, winOutOfWindow = 0;
const chainBlockedReasons = {};
const outingBlockedReasons = {};
// R89 DAWN-DOOR counters
let waitDiagMissing = 0, waitDiagTotal = 0;
const waitDiagCounts = {};
const waitDiagLiveCounts = {};
const waitDiagLedgerCounts = {};
let sideApproaches = 0, sideAttempts = 0, sideOk = 0, sideReadyAfter = 0, sideMissing = 0;
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
    // r111 Fix A (r110-named): split NO-ARRIVAL into TESTED vs UNTESTED.
    // A peak===0 seed may still have tested flesh from pack/counter before
    // it ever sat unknown in the pantry (r110: all 4 NO-ARRIVAL seeds tested
    // 2-3 mids, all safe). "Tested" counts transitions OR stream experiments
    // OR experiment lines — transitions alone undercount (r110 seed 1042: 7
    // experiments, 6 transitions; the poison test has no transition).
    const testedAny = trans.length > 0 || (sc.experiments ?? 0) > 0 ||
      (fa.experimentLines || []).length > 0;
    const fleshLabel = peak === 0 ? (testedAny ? 'NO-ARRIVAL-TESTED' : 'NO-ARRIVAL-UNTESTED')
      : (opens ? 'TAIL-MOVES' : 'STUCK');
    console.log(`  R62 FLESH kills=${(d.monsterKills || []).length} peak=${peak}` +
      (peakDay !== null ? ` (d${peakDay})` : '') + ` horizon=${horizon} ` +
      `exit=${peak - horizon} tests=${trans.length} ` +
      `stream[hauls=${sc.haulsSeen ?? '?'} deposits=${sc.deposits ?? '?'} ` +
      `experiments=${sc.experiments ?? '?'} reveals=${sc.reveals ?? '?'} ` +
      `poison=${sc.poisonVerdicts ?? '?'} rot=${sc.rotLines ?? '?'}] ` +
      `safeAtHorizon=${Object.keys(tested).join(',') || 'none'} -> ` +
      fleshLabel);
    for (const t of trans) console.log(`    TEST d${t.day} ${t.mid} how=${t.how} by=${t.testedBy}`);
    for (const s of (fa.experimentLines || [])) console.log(`    EXPERIMENT: ${s}`);
    for (const s of (fa.haulSeenLines || [])) console.log(`    HAUL-SEEN: ${s}`);
    fleshArrivalSeeds += (peak > 0 ? 1 : 0);
    fleshTestSeeds += (trans.length > 0 ? 1 : 0);
    fleshExitSeeds += (peak > 0 && horizon < peak ? 1 : 0);
    fleshOpenSeeds += (peak > 0 && trans.length > 0 && horizon < peak ? 1 : 0);
    fleshStuckSeeds += (peak > 0 && horizon === peak ? 1 : 0);
    fleshNoArrivalTestedSeeds += (peak === 0 && testedAny ? 1 : 0);
    fleshNoArrivalUntestedSeeds += (peak === 0 && !testedAny ? 1 : 0);
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
  // R112 Q2 EAMON FALLBACK: a starvation death landing after the last
  // snapshot (horizon-day deaths) has no autopsy — the driver records
  // autopsies per snapshot, and the death falls outside the write. The
  // series snap's pantryKcal is the SAME measure as the autopsy
  // pantryEdible (both sum pantry units x kcalEach), so fall back to the
  // last series snap with day <= death day and label the source. The
  // returned object keeps a .pantryEdible field so the D/E join below
  // reads the fallback value too (a horizon-day Haven scholar death is
  // now classified D/E on the same measure instead of unexplained).
  const pantryAtDeathFor = (who, day) => {
    const aut = (d.starvAutopsies || []).find(a => a.who === who && a.day === day);
    if (aut && typeof aut.pantryEdible === 'number') return { pantryEdible: aut.pantryEdible, label: '' };
    const before = (series || []).filter(s => s.day <= day);
    const snap = before.length ? before[before.length - 1] : null;
    if (snap && typeof snap.pantryKcal === 'number') return { pantryEdible: snap.pantryKcal, label: ' (series d' + snap.day + ', no autopsy)' };
    return { pantryEdible: null, label: '' };
  };
  const pantryStr = (r) => (r.pantryEdible == null ? '?' : r.pantryEdible + r.label);
  for (const death of deaths) {
    if (!/starv|hunger|kcal/i.test(death.cause || '')) continue;
    starvDeaths++;
    const day = death.day;
    // R106 CLASS F: the A–E classes are adjudicated from the SCHOLAR-scoped
    // series (scholar location, scholar pack, scholar autopsy). A villager
    // who is not the mantle holder on that day cannot be classified from
    // that data — the deceased's own location and feeding are unrecorded,
    // and a nonzero pantry is famine, not a doorstep failure, when it
    // cannot feed the village (r106 seed 891: Chloe d23 / Xiaoli d24
    // starved with 1000–1800 kcal in the pantry for 10–11 people while the
    // scholar's separate meal kept her fed). Label honestly instead of
    // borrowing the scholar's 'at Haven' for someone else.
    let scholarId = null;
    try { scholarId = scholarIdAt(day); } catch (e) { console.log(`  STARVATION d${day} scholarIdAt ERROR: ` + (e && e.message)); }
    const isScholar = !!(scholarId && death.who === scholarId);
    if (!isScholar) {
      const pan0 = pantryAtDeathFor(death.who, day);
      console.log(`  STARVATION d${day} ${nameOf(death.who)} (NPC, not the scholar) pantryAtDeath=${pantryStr(pan0)}`);
      console.log(`    -> CAUSE CLASS F (NPC starvation — scholar-scoped series cannot adjudicate the deceased's location or feeding; famine vs doorstep undetermined)`);
      continue;
    }
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
    const pan = pantryAtDeathFor(death.who, day);
    console.log(`  STARVATION d${day} ${nameOf(death.who)} awayStreak=${streak} zeroKcalDays<=death=${zeroDays} ` +
      `pantryAtDeath=${pantryStr(pan)}`);
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
    // R88 classes D/E (r87 metric review: A/B/C assume a wild scholar).
    // D = at Haven with an empty pantry (village famine, not a wild death).
    // E = at Haven with food in the pantry (the doorstep shape: the
    // scholar stood where food was and still starved).
    // R106: D/E are scholar-only (see CLASS F above). The D/E join reads
    // the SCHOLAR's location (streak, lastSnap.loc) — for a non-scholar
    // death that location is someone else's, so the join never runs for
    // them. (The old R88 note claimed non-scholar deaths carry no autopsy;
    // the driver records one per starvation death, scholar or not — the
    // autopsy pantry is the deceased's death-day pantry and is still
    // printed on the F line.)
    if (cls === '?' && streak === 0) {
      const snapOnDay = before.filter(x => x.day === day);
      const snapDay = snapOnDay.length ? snapOnDay[snapOnDay.length - 1] : (before.length ? before[before.length - 1] : null);
      if (snapDay && snapDay.pantryKcal === 0) cls = 'D';
    }
    if (cls === '?' && streak === 0) {
      const havenSnaps = before.filter(x => x.loc === 'haven');
      const lastHaven = havenSnaps.length ? havenSnaps[havenSnaps.length - 1] : null;
      const lastSnap = before.length ? before[before.length - 1] : null;
      if (lastSnap && lastSnap.loc === 'haven' && lastHaven) {
        if (pan && typeof pan.pantryEdible === 'number' && pan.pantryEdible > 0) cls = 'E';
        else if (pan && typeof pan.pantryEdible === 'number' && pan.pantryEdible === 0) cls = 'D';
      }
    }
    if (cls === '?') starvUnexplained++;
    console.log(`    -> CAUSE CLASS ${cls} ` +
      (cls === 'A' ? '(pack empty + nothing edible in the wild)' :
       cls === 'B' ? '(pack held food, never eaten)' :
       cls === 'C' ? '(ate in the wild, yield below burn)' :
       cls === 'D' ? '(at Haven, pantry empty — village famine)' :
       cls === 'E' ? '(at Haven, pantry held food — DOORSTEP)' : '(UNEXPLAINED — NO-GO)'));
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
  // No-successor check: the final holder in the chain — did they die
  // with no later mantle entry?
  const finalHolder = sortedMantle.length ? sortedMantle[sortedMantle.length - 1].to
    : ((d.spawn || {}).scholarId || null);
  if (finalHolder) {
    const fdd = deathDays.get(finalHolder);
    if (fdd !== undefined) {
      // r111 Fix B (r110-named): a final-holder death IS a scholar death
      // even with no mantle entry from them — count it in seedScholarDeaths
      // (r110 showed scholarDeaths=2 for 3 scholar deaths; the d28 one was
      // invisible in the summary). A mantle entry FROM the final holder
      // would make them non-final; by construction there is none, so this
      // death is never double-counted with the mantle loop above.
      seedScholarDeaths++;
      if (fdd <= horizon - 4) {
        successionNoGo++;
        console.log(`  SCHOLAR NO-SUCCESSOR NO-GO: final holder ${nameOf(finalHolder)} died d${fdd}, horizon d${horizon}, no mantle entry follows — counted in scholarDeaths`);
      } else {
        successionUnresolved++;
        scholarDeathsUnresolved++;
        console.log(`  SCHOLAR UNRESOLVED-AT-HORIZON: final holder ${nameOf(finalHolder)} died d${fdd}, horizon d${horizon} (inside +4 tail — honestly unresolved, not NO-GO) — counted in scholarDeaths (unresolved)`);
      }
    }
  }
  // Accumulate AFTER the final-holder block: seedScholarDeaths now includes
  // final-holder deaths (Fix B), so a seed whose ONLY scholar death is the
  // final holder still counts as a scholar-death seed.
  scholarDeaths += seedScholarDeaths;
  if (seedScholarDeaths) scholarDeathSeeds++;
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
  // R70 OUTING: asks (distinct partners in any series[].outing census),
  // waiting-dawn opps, departure/delivery attempts, tele counts, kept.
  {
    const sum = d.r41Summary || {};
    const opps = sum.outingOpps || [];
    const attempts = sum.outingAttempts || [];
    const waits = opps.filter(o => o.waiting);
    const departs = sum.outingTeleDepart || 0, togethers = sum.outingTeleTogether || 0;
    const returns = sum.outingTeleReturn || 0, talks = sum.outingTeleTalk || 0;
    const partners = new Set();
    for (const s of series) for (const o of (s.outing || [])) partners.add(o.vid);
    const lastOut = series.length ? (series[series.length - 1].outing || []) : [];
    // R71 AMENDMENT 4: promiseKept must belong to THIS favor — the snap
    // reads promises[vid] without a favorId match, so an old kept promise
    // (e.g. 710 Greta: asked favor, kept=True, no run, no delivery) would
    // otherwise count as an outing completion. Require the ids to match
    // when both are recorded; rows without ids (pre-amendment censuses)
    // keep the old behavior.
    // R72 AMENDMENT (pilot-diagnosed): last-snapshot-only counting UNDER-
    // counts in the opposite direction — promises are keyed by vid, one
    // slot, so once the villager asks AGAIN (pilot 711 Miguel d21: new
    // ask favor-20-6), the last snapshot pairs the NEW favorId with the
    // OLD kept promise and the id-match excludes a genuine completion
    // (Miguel d13: fulfilled, delivered 1310, promiseKept=true on d15-20).
    // Count DISTINCT favorIds that ever show a matching kept/broken row
    // anywhere in the series, not just the last snapshot.
    const keptIds = new Set(), brokenIds = new Set(), releasedIds = new Set();
    for (const snap of series) for (const o of (snap.outing || [])) {
      if (o.promiseKept === true && o.favorId != null && o.promiseFavorId === o.favorId) keptIds.add(o.favorId);
      if (o.promiseKept === 'broken' && o.favorId != null && (o.promiseFavorId == null || o.promiseFavorId === o.favorId)) brokenIds.add(o.favorId);
      // R74: 'released' (betrayal.js PROMISE RELEASE — the counterpart is
      // gone, so the promise is neither kept nor broken) is a third outcome,
      // not an OPEN unknown. Track it so the WINDOW block names it.
      if (o.promiseKept === 'released' && o.favorId != null && o.promiseFavorId === o.favorId) releasedIds.add(o.favorId);
    }
    // Fallback: rows without ids keep the old last-snapshot behavior.
    const kept = keptIds.size > 0 ? keptIds.size : lastOut.filter(o => o.promiseKept === true && (o.favorId == null || o.promiseFavorId == null)).length;
    const broken = brokenIds.size > 0 ? brokenIds.size : lastOut.filter(o => o.promiseKept === 'broken').length;
    if (partners.size > 0) outingAskSeeds++;
    if (waits.length > 0) outingWaitSeeds++;
    if (departs > 0) outingDepartSeeds++;
    if (kept > 0) outingKeptSeeds++;
    outingDeparts += departs; outingTogethers += togethers; outingReturns += returns; outingTalks += talks; outingKeptTotal += kept;
    // R71 OUTING-WORK: attempt-kind breakdown from the driver attempts.
    let togOk = 0, togBlocked = 0, talkAtt = 0, delDay = 0, haulPress = false;
    for (const a of attempts) {
      if (a.kind === 'together' && a.ok) { togOk++; if ((a.playerKcal || 0) + (a.partnerKcal || 0) > 0) haulPress = true; }
      if (a.kind === 'together-blocked') { togBlocked++; const r = String(a.line || '?').slice(0, 80); outingBlockedReasons[r] = (outingBlockedReasons[r] || 0) + 1; }
      if (a.kind === 'talk') talkAtt++;
      if (a.kind === 'deliver-day' && a.ok) delDay++;
    }
    outingTogetherOk += togOk; outingTogetherBlocked += togBlocked; outingTalkAttempts += talkAtt; outingDeliverDay += delDay;
    // R72 DELIVERY-CHAIN: match each haul-carrying together press to the
    // NEXT deliver/blocked record for the same vid (attempt order = push
    // order). Deliver kinds: deliver-day, deliver, deliver-walkhome.
    // Blocked kinds: deliver-blocked, evening-blocked, walkhome-blocked,
    // evening-home-fail. A deliver ok whose line says "promise was missed"
    // unloaded late (DELIVERED-LATE); ok without that phrase is labeled
    // DELIVERED-KEPT here, and the summary judges kept from the
    // favorId-matched count, not this line scan alone.
    {
      const DELIVER_KINDS = new Set(['deliver-day', 'deliver', 'deliver-walkhome']);
      // NOTE (r72 fix): evening-blocked is a TOGETHER failure (next day's
      // evening leg could not press), not a delivery block — it must not
      // terminate the chain, or a later successful delivery would be
      // mislabeled BLOCKED. Only delivery-path blocks terminate as
      // BLOCKED, and a later deliver-ok always wins over an earlier block.
      const BLOCKED_KINDS = new Set(['deliver-blocked', 'walkhome-blocked', 'evening-home-fail']);
      for (let i = 0; i < attempts.length; i++) {
        const a = attempts[i];
        if (!(a.kind === 'together' && a.ok)) continue;
        const total = (a.playerKcal || 0) + (a.partnerKcal || 0);
        if (total <= 0) continue;
        chainHaulPresses++;
        let outcome = 'NO-ATTEMPT', detail = '';
        let firstBlock = null;
        for (let j = i + 1; j < attempts.length; j++) {
          const b = attempts[j];
          if (b.vid !== a.vid) continue;
          if (DELIVER_KINDS.has(b.kind) && b.ok) {
            outcome = /promise was missed/i.test(String(b.line || '')) ? 'DELIVERED-LATE' : 'DELIVERED-KEPT';
            detail = `${b.kind} d${b.day}` + (firstBlock ? ` (earlier block: ${firstBlock})` : '');
            break;
          }
          if (BLOCKED_KINDS.has(b.kind) && !firstBlock) {
            firstBlock = `${b.kind} d${b.day} line="${String(b.line || '').slice(0, 100)}"`;
            const r = String(b.line || '?').slice(0, 80); chainBlockedReasons[r] = (chainBlockedReasons[r] || 0) + 1;
          }
        }
        if (outcome === 'NO-ATTEMPT' && firstBlock) { outcome = 'BLOCKED'; detail = firstBlock; }
        if (outcome === 'DELIVERED-KEPT') chainDeliveredKept++;
        else if (outcome === 'DELIVERED-LATE') chainDeliveredLate++;
        else if (outcome === 'BLOCKED') chainBlocked++;
        else chainNoAttempt++;
        console.log(`  R72 CHAIN d${a.day} ${a.name} haul=${total} -> ${outcome}${detail ? ` (${detail})` : ''}`);
      }
    }
    // R73 WINDOW (corrected 2026-10-30, post-panel audit): per favorId
    // window audit over PROMISED favors only. The snap reads promise
    // fields (deadline, kept) from promises[vid] WITHOUT a favorId match,
    // so an asked-never-promised favor inherits a stale or empty promise
    // slot: deadline=null renders a fake ROOMY width-6 window (prom+7
    // default), and a re-asked vid inherits the OLD favor's deadline
    // (716 James favor-23-5 showed deadline=10 from favor-8-4). Only
    // snaps where promiseFavorId === favorId carry a real window; asked
    // favors are counted separately as coverage, never as windows.
    {
      const byFav = new Map();
      let askedOnly = 0;
      for (const snap of series) for (const o of (snap.outing || [])) {
        if (o.favorId == null) continue;
        let rec = byFav.get(o.favorId);
        if (!rec) { rec = { vid: o.vid, name: o.name, promised: null, asked: null, meet: null, deadline: null, matched: false, started: null, delivered: 0, returned: false }; byFav.set(o.favorId, rec); }
        if (rec.asked == null && o.askedDay != null) rec.asked = o.askedDay;
        if (o.promiseFavorId === o.favorId) {
          rec.matched = true;
          if (rec.promised == null && o.promisedDay != null) rec.promised = o.promisedDay;
          if (rec.meet == null && o.meetDay != null) rec.meet = o.meetDay;
          if (rec.deadline == null && o.deadline != null) rec.deadline = o.deadline;
        }
        if (o.run) { if (rec.started == null && o.run.startedDay != null) rec.started = o.run.startedDay; if (o.run.deliveredKcal) rec.delivered = o.run.deliveredKcal; if (o.run.returned) rec.returned = true; }
      }
      for (const [fid, r] of byFav) {
        if (!r.matched) { askedOnly++; console.log(`  R75 WINDOW-ASKED-ONLY favor=${fid} ${r.name} askedDay=${r.asked} (never promised in-window — coverage, not a window)`); continue; }
        // R77: the promise SET is the landing window (asked or promised by
        // d14); adjudication runs over the full 28-day series. Favors first
        // asked/promised after d14 are post-window coverage, never windows,
        // so a longer horizon cannot inflate the kept rate with new asks.
        if ((r.asked != null && Number(r.asked) > 14) || (r.asked == null && r.promised != null && Number(r.promised) > 14)) { winOutOfWindow++; console.log(`  R77 WINDOW-OUT-OF-WINDOW favor=${fid} ${r.name} askedDay=${r.asked} promisedDay=${r.promised} (post-d14 ask — coverage, not a window)`); continue; }
        const prom = Number(r.promised), meet = (r.meet != null ? Number(r.meet) : (Number.isFinite(prom) ? prom + 1 : null));
        const due = (Number.isFinite(prom) ? (r.deadline != null ? Math.max(prom + 1, Number(r.deadline)) : prom + 7) : null);
        const width = (meet != null && due != null) ? due - meet : null;
        const cls = (width == null) ? 'UNKNOWN' : (due < meet ? 'NEGATIVE' : (width < 2 ? 'NARROW' : (width === 2 ? 'TIGHT' : 'ROOMY')));
        const outcome = keptIds.has(fid) ? 'KEPT' : (brokenIds.has(fid) ? 'BROKEN' : (releasedIds.has(fid) ? 'RELEASED' : 'OPEN'));
        winPromises++;
        if (cls === 'NEGATIVE') winNegative++;
        else if (cls === 'NARROW') { winNarrow++; if (outcome === 'KEPT') winKeptNarrow++; }
        else if (cls === 'TIGHT') winTight++;
        else if (cls === 'ROOMY') winRoomy++;
        let cause = '';
        if (outcome === 'BROKEN') {
          if (r.started == null) cause = 'NO-DEPART';
          else if ((r.delivered || 0) <= 0) cause = 'DEPARTED-NO-DELIVER';
          else cause = 'DELIVERED-NOT-KEPT';
          cause += ` (depart=${r.started} due=${due} deliveredKcal=${r.delivered} returned=${r.returned})`;
        }
        let dflag = '';
        if (r.deadline != null && Number.isFinite(prom) && Number(r.deadline) < prom) dflag += ' DEADLINE-BEFORE-PROMISE';
        if (r.deadline != null && meet != null && Number(r.deadline) < meet) dflag += ' DEADLINE-BEFORE-MEET';
        console.log(`  R75 WINDOW favor=${fid} ${r.name} askedDay=${r.asked} promisedDay=${r.promised} meet=${meet} deadline=${r.deadline} due=${due} width=${width} class=${cls} depart=${r.started} deliveredKcal=${r.delivered} returned=${r.returned} outcome=${outcome}${cause ? ` BROKEN-CAUSE=${cause}` : ''}${dflag}`);
      }
      winAskedOnly += askedOnly;
      if (byFav.size === 0) console.log('  R73 WINDOW: no forage_help favors on this seed at all');
    }
    if (haulPress) outingTogetherHaulSeeds++;
    console.log(`  R71 OUTING-WORK togetherOk=${togOk} togetherBlocked=${togBlocked} talkAttempts=${talkAtt} deliverDayOk=${delDay} haulPress=${haulPress}`);
    console.log(`  R70 OUTING partners=${partners.size} opps=${opps.length} waiting=${waits.length} attempts=${attempts.length} tele=dep${departs}/tog${togethers}/ret${returns}/talk${talks} kept=${kept} broken=${broken}`);
    for (const o of waits) console.log(`    OUTING-WAIT d${o.day} dp=${o.dayPart} ${o.name} ready=${o.actionReady} action=${o.action} reason="${String(o.reason || '').slice(0, 120)}"${o.approach ? ` approach=${JSON.stringify(o.approach)}` : ''}${o.doorStep ? ` doorStep=${JSON.stringify(o.doorStep)}` : ''}`);
    for (const a of attempts) console.log(`    OUTING-ATTEMPT d${a.day} ${a.kind}${a.via ? `/${a.via}` : ''} ${a.name} ok=${a.ok} line="${String(a.line || '').slice(0, 160)}"`);
    if (!opps.length && partners.size === 0) console.log('    R70 OUTING: no forage_help favor observed on this seed at all');
    else if (!waits.length) {
      const reasons = {};
      for (const o of opps) { const r = String(o.reason || '?').slice(0, 80); reasons[r] = (reasons[r] || 0) + 1; }
      console.log(`    R70 OUTING: favors exist but NEVER waited at dawn; action reasons: ${JSON.stringify(reasons)}`);
    }
    // R89 WAITDIAG + SIDESTEP (per-seed): every dawn opp must carry
    // waitDiag; every approach record must carry a sidesteps array.
    {
      const wd = {}, wdLive = {}, wdLedger = {};
      for (const o of opps) {
        waitDiagTotal++;
        if (o.waitDiag == null) { waitDiagMissing++; }
        else { const k = String(o.waitDiag); wd[k] = (wd[k] || 0) + 1; waitDiagCounts[k] = (waitDiagCounts[k] || 0) + 1;
          if (o.livePromise) { wdLive[k] = (wdLive[k] || 0) + 1; waitDiagLiveCounts[k] = (waitDiagLiveCounts[k] || 0) + 1; }
          else { wdLedger[k] = (wdLedger[k] || 0) + 1; waitDiagLedgerCounts[k] = (waitDiagLedgerCounts[k] || 0) + 1; } }
        if (o.approach) {
          sideApproaches++;
          if (!Array.isArray(o.approach.sidesteps)) { sideMissing++; }
          else for (const s of o.approach.sidesteps) {
            sideAttempts++;
            if (s.ok) { sideOk++; }
          }
          if (o.approach.readyAfter && (o.approach.sidesteps || []).some(s => s.ok)) sideReadyAfter++;
        }
      }
      if (opps.length) console.log(`    R94 DAWN-DOOR waitDiag=${JSON.stringify(wd)} live=${JSON.stringify(wdLive)} ledger=${JSON.stringify(wdLedger)} sidestepApproaches=${opps.filter(o => o.approach).length} sidestepAttempts=${opps.reduce((n, o) => n + ((o.approach && o.approach.sidesteps) || []).length, 0)} sidestepOk=${opps.reduce((n, o) => n + ((o.approach && o.approach.sidesteps) || []).filter(s => s.ok).length, 0)}`);
    }
  }
  // R84 ARRIVAL + HAVEN-HYDRATION (driver instrument, analyzer-only read).
  const wSkips84 = d.outingGuardWaterSkips || [];
  const wArr84 = d.outingGuardWaterArrivals || [];
  const wNext84 = d.outingGuardWaterArrivalNextTop || [];
  const kSkips84 = d.outingGuardSkips || [];
  const kArr84 = d.outingGuardArrivals || [];
  const kNext84 = d.outingGuardArrivalNextTop || [];
  const arrVerdict84 = (arrs, nexts) => {
    let arrived = 0, unresolved = 0; const lines = [];
    for (const a of arrs) {
      const nt = nexts.find(n => n.skipDay === a.day);
      const imm = !!a.atHavenAfter;
      const nxt = !!(nt && nt.atHaven);
      if (imm || nxt) arrived++; else if (!nt) unresolved++;
      lines.push(`d${a.day} ret=${a.retKind} (${a.nodeBefore.x},${a.nodeBefore.y})->(${a.nodeAfter.x},${a.nodeAfter.y}) dist ${a.distBefore}->${a.distAfter} atHavenAfter=${imm} nextTop=${nt ? `d${nt.day} atHaven=${nxt} dist=${nt.distToHaven} loc=${nt.loc} hyd=${nt.hydration}` : 'UNRESOLVED'}`);
    }
    return { arrived, unresolved, lines, n: arrs.length };
  };
  const wV84 = arrVerdict84(wArr84, wNext84);
  const kV84 = arrVerdict84(kArr84, kNext84);
  arrWaterSkips += wV84.n; arrWaterArrived += wV84.arrived; arrWaterUnresolved += wV84.unresolved;
  arrKcalSkips += kV84.n; arrKcalArrived += kV84.arrived; arrKcalUnresolved += kV84.unresolved;
  const wMissing84 = wSkips84.filter(s => !wArr84.some(a => a.day === s.day)).length;
  const kMissing84 = kSkips84.filter(s => !kArr84.some(a => a.day === s.day)).length;
  arrWaterMissing += wMissing84; arrKcalMissing += kMissing84;
  console.log(`  R84 ARRIVAL water: skips=${wSkips84.length} arrivals=${wV84.n} missing=${wMissing84} arrived=${wV84.arrived} unresolved=${wV84.unresolved}`);
  for (const l of wV84.lines) console.log(`    R84 WATER-ARRIVAL ${l}`);
  console.log(`  R84 ARRIVAL kcal: skips=${kSkips84.length} arrivals=${kV84.n} missing=${kMissing84} arrived=${kV84.arrived} unresolved=${kV84.unresolved}`);
  for (const l of kV84.lines) console.log(`    R84 KCAL-ARRIVAL ${l}`);
  // R85 RESCUE (driver fix, analyzer-only read): the ladder outcome on
  // every arrival record. Final verdict reads atHavenFinal (or next-top),
  // never the first hop alone.
  const resVerdict85 = (arrs, nexts) => {
    let complete = 0, incomplete = 0, escMiss = 0, finArr = 0, finNon = 0, named = 0, succArr = 0; const lines = [];
    for (const a of arrs) {
      const steps = Array.isArray(a.rescueSteps) ? a.rescueSteps : null;
      const hasFinal = steps && ('nodeFinal' in a) && ('distFinal' in a) && ('atHavenFinal' in a);
      if (hasFinal) complete++; else incomplete++;
      const firstBlocked = (typeof a.retKind === 'string' && a.retKind.indexOf('blocked:') === 0) || (!a.atHavenAfter && a.distAfter > 0);
      const firstArrived = !!a.atHavenAfter;
      const escalated = !!(steps && steps.some(s => s.indexOf('walkHome') === 0 || s.indexOf('clear:') === 0));
      if (firstBlocked && !firstArrived && !escalated) escMiss++;
      const nt = nexts.find(n => n.skipDay === a.day);
      // R88 BEARER: a nextTop arrival counts as a rescue only when the
      // scholar at the top is the skip-day scholar; a successor's
      // arrival is SUCCESSOR-ARRIVED, never a rescue success (r87 785 d11).
      const succ = !!(nt && nt.atHaven && nt.scholarIdAtSkip && nt.scholarIdAtTop && nt.scholarIdAtSkip !== nt.scholarIdAtTop);
      const fin = !!(a.atHavenFinal || (nt && nt.atHaven && !succ));
      if (fin) finArr++; else { finNon++; if (steps && steps.some(s => /blocked|creek|combat|refused/.test(s))) named++; }
      if (succ) succArr++;
      lines.push(`d${a.day} ret=${a.retKind} first=(${a.nodeAfter.x},${a.nodeAfter.y}) distAfter=${a.distAfter} atHavenAfter=${!!a.atHavenAfter} steps=[${steps ? steps.join(' | ') : 'MISSING'}] final=(${a.nodeFinal ? a.nodeFinal.x + ',' + a.nodeFinal.y : '?'}) distFinal=${a.distFinal} atHavenFinal=${!!a.atHavenFinal} nextTop=${nt ? `d${nt.day} atHaven=${!!nt.atHaven} bearer=${nt.scholarIdAtSkip || '?'}->${nt.scholarIdAtTop || '?'}` : 'UNRESOLVED'} verdict=${succ ? 'SUCCESSOR-ARRIVED' : (fin ? 'ARRIVED' : 'NON-ARRIVED')}`);
    }
    return { complete, incomplete, escMiss, finArr, finNon, named, succArr, lines, n: arrs.length };
  };
  const wR85 = resVerdict85(wArr84, wNext84);
  const kR85 = resVerdict85(kArr84, kNext84);
  resWaterSkips += wR85.n; resWaterComplete += wR85.complete; resWaterIncomplete += wR85.incomplete; resWaterEscMiss += wR85.escMiss; resWaterFinArr += wR85.finArr; resWaterFinNon += wR85.finNon; resWaterNamed += wR85.named; resWaterSucc += wR85.succArr;
  resKcalSkips += kR85.n; resKcalComplete += kR85.complete; resKcalIncomplete += kR85.incomplete; resKcalEscMiss += kR85.escMiss; resKcalFinArr += kR85.finArr; resKcalFinNon += kR85.finNon; resKcalNamed += kR85.named; resKcalSucc += kR85.succArr;
  console.log(`  R85 RESCUE water: skips=${wR85.n} complete=${wR85.complete} incomplete=${wR85.incomplete} escMiss=${wR85.escMiss} finalArrived=${wR85.finArr} finalNonArrived=${wR85.finNon} namedBlock=${wR85.named}`);
  for (const l of wR85.lines) console.log(`    R85 WATER-RESCUE ${l}`);
  console.log(`  R85 RESCUE kcal: skips=${kR85.n} complete=${kR85.complete} incomplete=${kR85.incomplete} escMiss=${kR85.escMiss} finalArrived=${kR85.finArr} finalNonArrived=${kR85.finNon} namedBlock=${kR85.named}`);
  for (const l of kR85.lines) console.log(`    R85 KCAL-RESCUE ${l}`);
  // Haven hydration: longest run of consecutive snaps with loc haven and hydration 0.
  let curStreak84 = 0, maxStreak84 = 0, maxStreakEnd84 = null, havenRises84 = 0, havenSnaps84 = 0, prevHavenHyd84 = null;
  for (const s of series) {
    if (s.loc === 'haven') {
      havenSnaps84++;
      if ((s.scholarHydration || 0) === 0) { curStreak84++; if (curStreak84 > maxStreak84) { maxStreak84 = curStreak84; maxStreakEnd84 = s.day; } }
      else curStreak84 = 0;
      if (prevHavenHyd84 !== null && (s.scholarHydration || 0) > prevHavenHyd84) havenRises84++;
      prevHavenHyd84 = s.scholarHydration || 0;
    } else { curStreak84 = 0; prevHavenHyd84 = null; }
  }
  if (maxStreak84 > havenHydMaxStreak) havenHydMaxStreak = maxStreak84;
  if (maxStreak84 >= 3) havenHydStreakSeeds++;
  console.log(`  R84 HAVEN-HYDRATION: havenSnaps=${havenSnaps84} maxZeroStreak=${maxStreak84} streakEndDay=${maxStreakEnd84} hydrationRises=${havenRises84}`);
  console.log(`  scholarDeaths(seed)=${seedScholarDeaths} popSeries=${series.map(s => s.pop).join(',')}`);
  void scholarIdAt;
}
console.log(`SUMMARY: starvationDeaths=${starvDeaths} unexplained=${starvUnexplained} ` +
  `griefMiss=${regMiss}/${regTotal} scholarDeaths=${scholarDeaths} (unresolved=${scholarDeathsUnresolved}) on ${scholarDeathSeeds}/${files.length} seeds`);
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
console.log(`R62 FLESH (monster-meat tail): arrivalSeeds=${fleshArrivalSeeds}/${files.length} testSeeds=${fleshTestSeeds} exitSeeds=${fleshExitSeeds} stuckSeeds=${fleshStuckSeeds} openSeeds=${fleshOpenSeeds} noArrivalTested=${fleshNoArrivalTestedSeeds} noArrivalUntested=${fleshNoArrivalUntestedSeeds} ` +
  (fleshArrivalSeeds === 0 ? 'VACUOUS (no flesh reached a pantry)' :
   fleshOpenSeeds > 0 ? 'CHANNEL OPENS (a seed with both a test and a pantry exit)' :
   'CHANNEL STUCK (flesh arrives but never leaves, or tests without exits)'));
console.log(`R94 DAWN-DOOR: opps=${waitDiagTotal} waitDiagMissing=${waitDiagMissing} waitDiag=${JSON.stringify(waitDiagCounts)} live=${JSON.stringify(waitDiagLiveCounts)} ledger=${JSON.stringify(waitDiagLedgerCounts)} approaches=${sideApproaches} sidestepsMissing=${sideMissing} sidestepAttempts=${sideAttempts} sidestepOk=${sideOk} sidestepReadyAfter=${sideReadyAfter}`);
console.log(`R70 OUTING (joint foraging): askSeeds=${outingAskSeeds}/${files.length} waitSeeds=${outingWaitSeeds}/${files.length} departSeeds=${outingDepartSeeds}/${files.length} keptSeeds=${outingKeptSeeds}/${files.length} tele=dep${outingDeparts}/tog${outingTogethers}/ret${outingReturns}/talk${outingTalks} keptTotal=${outingKeptTotal} ` +
  (outingAskSeeds === 0 ? 'INSUFFICIENT-DATA (no villager asked for a joint outing in-window)' :
   outingWaitSeeds === 0 ? 'OFFER-WITHOUT-WINDOW (asks happened, no dawn wait observed — see per-seed reasons)' :
   outingDepartSeeds === 0 ? 'DEPART-NO-GO (waiting opportunities existed, no departure — see action reasons)' :
   outingKeptSeeds === 0 ? 'DEPART-ONLY (departures fired, no kept promise — presses undriven in r70, documented next blank)' :
   'OUTING-GO (a promised outing completed and kept)'));
console.log(`R73 WINDOW: promised=${winPromises} askedOnly=${winAskedOnly} outOfWindow=${winOutOfWindow} NEGATIVE=${winNegative} NARROW=${winNarrow} TIGHT=${winTight} ROOMY=${winRoomy} keptInsideNarrow=${winKeptNarrow} ` +
  (winPromises === 0 ? 'INSUFFICIENT-DATA (no forage_help promises in-window)' :
   winNegative > 0 ? 'NEGATIVE-WINDOW (an empty window exists — design input)' :
   winNarrow >= 2 ? 'NARROW-PATTERN (>=2 zero-slack windows — design input)' :
   'WINDOW-OK (no narrow pattern on this panel)'));
console.log(`R71 OUTING-WORK (completion): togetherOk=${outingTogetherOk} togetherBlocked=${outingTogetherBlocked} talkAttempts=${outingTalkAttempts} deliverDayOk=${outingDeliverDay} haulPressSeeds=${outingTogetherHaulSeeds}/${files.length} blockedReasons=${JSON.stringify(outingBlockedReasons)} ` +
  (outingTogetherHaulSeeds === 0 ? 'TOGETHER-NO-GO (no haul-carrying together press — see blocked reasons)' :
   outingKeptSeeds === 0 ? 'COMPLETION-NO-GO (together presses carried haul, no kept promise — see delivery reasons)' :
   'COMPLETION-GO (a promised outing completed and kept)'));
console.log(`R72 DELIVERY-CHAIN: haulPresses=${chainHaulPresses} deliveredKept=${chainDeliveredKept} deliveredLate=${chainDeliveredLate} blocked=${chainBlocked} noAttempt=${chainNoAttempt} blockedReasons=${JSON.stringify(chainBlockedReasons)} ` +
  (chainHaulPresses === 0 ? 'INSUFFICIENT-DATA (no haul-carrying together press — chain question unanswered)' :
   (chainDeliveredKept + chainDeliveredLate + chainBlocked) === 0 ? 'NO-ATTEMPT (haul presses exist, no delivery or block record followed — see driver gaps)' :
   'CHAIN-CLASSIFIED (every haul press matched to a delivery/block outcome or its absence — see per-seed R72 CHAIN lines)'));
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
console.log(`R84 ARRIVAL (water): arrivals=${arrWaterSkips} arrived=${arrWaterArrived} unresolved=${arrWaterUnresolved} missing=${arrWaterMissing} ` +
  (arrWaterMissing > 0 ? 'INSTRUMENT-NO-GO (a skip without an arrival record)' :
   arrWaterSkips === 0 ? 'UNTESTED (no wild water skip in this corpus — the repro corpus carries the verdict)' :
   (arrWaterArrived === arrWaterSkips ? 'ALL-ARRIVED (every recorded skip reached Haven by next top)' : 'NON-ARRIVAL PROVEN (a skip never reached Haven — the single-hop travelTo is the mechanism)')));
console.log(`R84 ARRIVAL (kcal): arrivals=${arrKcalSkips} arrived=${arrKcalArrived} unresolved=${arrKcalUnresolved} missing=${arrKcalMissing} ` +
  (arrKcalMissing > 0 ? 'INSTRUMENT-NO-GO (a skip without an arrival record)' :
   arrKcalSkips === 0 ? 'UNTESTED (no wild kcal skip in this corpus)' :
   (arrKcalArrived === arrKcalSkips ? 'ALL-ARRIVED (every recorded skip reached Haven by next top)' : 'NON-ARRIVAL PROVEN (a skip never reached Haven)')));
console.log(`R85 RESCUE (water): skips=${resWaterSkips} complete=${resWaterComplete} incomplete=${resWaterIncomplete} escMiss=${resWaterEscMiss} finalArrived=${resWaterFinArr} finalNonArrived=${resWaterFinNon} namedBlock=${resWaterNamed} successorArrived=${resWaterSucc} ` +
  (resWaterIncomplete > 0 ? 'INSTRUMENT-NO-GO (a skip without a complete rescue record)' :
   resWaterEscMiss > 0 ? 'ESCALATION-NO-GO (a blocked first hop with no escalation attempt)' :
   resWaterSkips === 0 ? 'UNTESTED (no wild water skip in this corpus — the repro corpus carries the verdict)' :
   (resWaterFinArr === resWaterSkips ? 'RESCUE-GO (every recorded skip reached Haven after the ladder)' : 'RESCUE-PARTIAL (some skips still non-arrived — see named blockers)')));
console.log(`R85 RESCUE (kcal): skips=${resKcalSkips} complete=${resKcalComplete} incomplete=${resKcalIncomplete} escMiss=${resKcalEscMiss} finalArrived=${resKcalFinArr} finalNonArrived=${resKcalFinNon} namedBlock=${resKcalNamed} successorArrived=${resKcalSucc} ` +
  (resKcalIncomplete > 0 ? 'INSTRUMENT-NO-GO (a skip without a complete rescue record)' :
   resKcalEscMiss > 0 ? 'ESCALATION-NO-GO (a blocked first hop with no escalation attempt)' :
   resKcalSkips === 0 ? 'UNTESTED (no wild kcal skip in this corpus)' :
   (resKcalFinArr === resKcalSkips ? 'RESCUE-GO (every recorded skip reached Haven after the ladder)' : 'RESCUE-PARTIAL (some skips still non-arrived — see named blockers)')));
console.log(`R84 HAVEN-HYDRATION: maxZeroStreak=${havenHydMaxStreak} streakSeeds(>=3)=${havenHydStreakSeeds}/${files.length} ` +
  (havenHydStreakSeeds > 0 ? 'MAEVE-SHAPE REPRODUCED (a scholar sat dehydrated at Haven 3+ snaps)' : 'no Maeve shape on this panel'));
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

// --- R86 OPPORTUNITY + CLEAR block (appended; reuses DIR/files/fs/path) ---
{
  let r86Opp = 0, r86OppLow = 0, r86OppMin = null, r86OppList = [];
  let r86WaterSkips = 0, r86KcalSkips = 0;
  const r86StepCounts = {};
  let r86WalkStops = 0, r86ClearOk = 0, r86ClearRefused = 0, r86ClearUnavail = 0, r86ClearNoBlock = 0;
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    for (const o of (d.outingGuardWaterOpportunities || [])) {
      r86Opp++;
      if (typeof o.hydration === 'number') {
        if (o.hydration < 25) r86OppLow++;
        if (r86OppMin === null || o.hydration < r86OppMin) r86OppMin = o.hydration;
      }
      r86OppList.push(f.replace(/.*census-(\d+)\.json$/, '$1') + ':d' + o.day + ':hyd' + o.hydration);
    }
    r86WaterSkips += (d.outingGuardWaterSkips || []).length;
    r86KcalSkips += (d.outingGuardSkips || []).length;
    for (const arr of [...(d.outingGuardWaterArrivals || []), ...(d.outingGuardArrivals || [])]) {
      for (const s of (arr.rescueSteps || [])) {
        const key = s.split(':')[0] + (s.indexOf('walkHome') === 0 ? ':' + (s.indexOf('reached') >= 0 ? 'reached' : 'stopped') : (s.indexOf('clear:') === 0 ? ':' + s.split(':')[1] : ''));
        r86StepCounts[key] = (r86StepCounts[key] || 0) + 1;
        if (s.indexOf('walkHome') === 0 && s.indexOf('reached') < 0) r86WalkStops++;
        if (s.indexOf('clear:') === 0 && /:ok$/.test(s)) r86ClearOk++;
        if (s.indexOf('clear:') === 0 && /:refused$/.test(s)) r86ClearRefused++;
        if (s === 'clear:unavailable') r86ClearUnavail++;
        if (s === 'clear:no-block-named') r86ClearNoBlock++;
      }
    }
  }
  console.log(`R86 OPPORTUNITY (water clause denominator): wildOutingIterations=${r86Opp} hydUnder25=${r86OppLow} minHyd=${r86OppMin} waterSkips=${r86WaterSkips} kcalSkips=${r86KcalSkips}`);
  console.log(`R86 OPPORTUNITY list: ${r86OppList.join(' ')}`);
  console.log(`R86 CLEAR (rescue ladder rung 2): stepCounts=${JSON.stringify(r86StepCounts)} walkHomeStops=${r86WalkStops} clearOk=${r86ClearOk} clearRefused=${r86ClearRefused} clearUnavailable=${r86ClearUnavail} clearNoBlockNamed=${r86ClearNoBlock} ` +
    (r86WalkStops === 0 ? 'UNREACHABLE-BY-GEOMETRY (walkHome never stopped in this corpus)' :
     r86ClearOk + r86ClearRefused === 0 ? 'BLOCKER-COORD GAP? (walkHome stopped but no clear attempt fired — see clearUnavailable/clearNoBlockNamed)' : 'CLEAR RUNG FIRED'));
}

// --- R88 EAT-ON-ARRIVAL + MAEVE + ARMOR-SILENT block (appended) ---
{
  let eatArrivals = 0, eatMissing = 0, eatAttempts = 0, eatAte = 0, eatNoGain = 0, eatDoorOutside = 0, eatDoorRefused = 0, eatStoresNone = 0;
  let eatSkipDayStarv = 0;
  const eatLines = [];
  let maeveZeroSnaps = 0, maeveOutside = 0, maeveInside = 0, maeveStoresNone = 0, maeveNoBottle = 0, maeveBottles = 0;
  const maeveLines = [];
  let armorTeleOk = 0, armorLineMissing = 0, armorSilentWild = 0, armorSilentHaven = 0, armorSilentUnknown = 0;
  const armorSilentLines = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const seed = f.replace(/.*census-(\d+)\.json$/, '$1');
    const scholarOnDay = (D) => {
      let id = (d.spawn && d.spawn.scholarId) || null;
      const passes = [...(d.mantleLog || [])].sort((a, b) => (a.day || 0) - (b.day || 0));
      for (const ps of passes) { if ((ps.day || 0) <= D) id = ps.to; }
      return id;
    };
    const skipDays = new Set([...(d.outingGuardSkips || []).map(x => x.day), ...(d.outingGuardWaterSkips || []).map(x => x.day)]);
    for (const arr of [...(d.outingGuardWaterArrivals || []), ...(d.outingGuardArrivals || [])]) {
      eatArrivals++;
      const e = arr.eatOnArrival;
      if (!e) { eatMissing++; eatLines.push(`${seed}:d${arr.day} MISSING eatOnArrival`); continue; }
      if (e.skipped === 'not-arrived') { eatLines.push(`${seed}:d${arr.day} not-arrived, no eat step`); continue; }
      if (e.error) { eatLines.push(`${seed}:d${arr.day} EAT-ERROR ${e.error}`); continue; }
      if (e.eatTriggered) {
        eatAttempts++;
        if (e.insideBefore === false) eatDoorOutside++;
        if (e.enterResult === false || (typeof e.enterResult === 'string' && e.enterResult.indexOf('error') === 0)) eatDoorRefused++;
        if (e.storesAfter === 'none' || e.storesBefore === 'none') eatStoresNone++;
        if (e.ate) eatAte++; else eatNoGain++;
        eatLines.push(`${seed}:d${arr.day} branch=${e.branch} kcal ${e.kcalBefore}->${e.kcalAfter} ate=${!!e.ate} inside ${e.insideBefore}->${e.insideAfter} enter=${e.enterResult} stores ${e.storesBefore}->${e.storesAfter} takes=${(e.takes || []).length} pantry ${e.pantryBefore}->${e.pantryAfter}`);
      } else {
        eatLines.push(`${seed}:d${arr.day} branch=${e.branch} eat not triggered (${e.eatSkipped || ''}) kcalAtArrival=${e.kcalAtArrival}`);
      }
      if (e.drinkTriggered) eatLines.push(`${seed}:d${arr.day} DRINK hyd ${e.hydBefore}->${e.hydAfter} drinks=${e.drinks} bottles ${e.bottlesBefore}->${e.bottlesAfter} drank=${!!e.drank}`);
    }
    // M9 join: starvation deaths of the guarded scholar on a skip day.
    for (const vd of (d.villagerDeaths || [])) {
      if (!/starv/i.test(vd.cause || '')) continue;
      if (!skipDays.has(vd.day)) continue;
      const sch = scholarOnDay(vd.day);
      const match = sch && vd.who === sch;
      if (match) eatSkipDayStarv++;
      eatLines.push(`${seed}: SKIP-DAY STARVATION d${vd.day} who=${vd.who} scholarOnDay=${sch} guardedScholar=${!!match}`);
    }
    // M10 MAEVE: haven snaps at hydration 0, by inside/stores/bottles.
    for (const sn of (d.series || [])) {
      if (sn.loc !== 'haven' || sn.scholarHydration !== 0) continue;
      maeveZeroSnaps++;
      if (sn.scholarInsideHaven === false) maeveOutside++; else if (sn.scholarInsideHaven === true) maeveInside++;
      if (sn.scholarStoresAccess === 'none') maeveStoresNone++;
      if (sn.scholarWaterBottles === 0) maeveNoBottle++; else if (typeof sn.scholarWaterBottles === 'number') maeveBottles++;
      maeveLines.push(`${seed}:d${sn.day} hyd0 loc=haven inside=${sn.scholarInsideHaven} stores=${sn.scholarStoresAccess} bottles=${sn.scholarWaterBottles} kcal=${sn.scholarKcal}`);
    }
    // M11 ARMOR-SILENT: tele-ok crafts joined to scholar loc on craft day.
    const seriesByDay = {};
    for (const sn of (d.series || [])) seriesByDay[sn.day] = sn;
    const locOnDay = (day) => {
      if (seriesByDay[day]) return seriesByDay[day].loc;
      let best = null;
      for (const sn of (d.series || [])) { if (sn.day <= day && (!best || sn.day > best.day)) best = sn; }
      return best ? best.loc : null;
    };
    const teleOk = (d.armorCraftDetail || []).filter(c => c.ok).length;
    const lineOk = (d.r41Summary && d.r41Summary.armorCraftLinesOk) || 0;
    armorTeleOk += teleOk;
    const missing = Math.max(0, teleOk - lineOk);
    armorLineMissing += missing;
    if (missing > 0) {
      for (const c of (d.armorCraftDetail || []).filter(c => c.ok)) {
        const loc = locOnDay(c.day);
        if (loc === 'wild') armorSilentWild++;
        else if (loc === 'haven') armorSilentHaven++;
        else armorSilentUnknown++;
        armorSilentLines.push(`${seed}: craft d${c.day} vid=${c.vid} item=${c.item} scholarLoc=${loc}`);
      }
    }
  }
  for (const l of eatLines) console.log('  R88 EAT ' + l);
  console.log(`R88 EAT-ON-ARRIVAL: arrivals=${eatArrivals} missing=${eatMissing} attempts=${eatAttempts} ate=${eatAte} noGain=${eatNoGain} doorFromOutside=${eatDoorOutside} doorRefused=${eatDoorRefused} storesNone=${eatStoresNone} guardedSkipDayStarv=${eatSkipDayStarv} ` +
    (eatMissing > 0 ? 'INSTRUMENT-NO-GO (arrival without eat record)' :
     eatAttempts === 0 ? 'UNTESTED (no eat-triggered arrival)' :
     eatSkipDayStarv > 0 ? 'MISS (guarded scholar starved on a skip day despite the eat step — read the record)' :
     'EAT-GO (every eat attempt recorded; no guarded skip-day starvation)'));
  for (const l of maeveLines) console.log('  R88 MAEVE ' + l);
  console.log(`R88 MAEVE (haven hyd-0 snaps): snaps=${maeveZeroSnaps} outside=${maeveOutside} inside=${maeveInside} storesNone=${maeveStoresNone} noBottle=${maeveNoBottle} withBottles=${maeveBottles} ` +
    (maeveZeroSnaps === 0 ? 'no Maeve shape on this panel' :
     maeveOutside === maeveZeroSnaps ? 'MECHANISM: OUTSIDE-HALL (every hyd-0 haven snap sits outside the hall)' :
     maeveInside > 0 && maeveNoBottle === maeveZeroSnaps ? 'MECHANISM: NO-BOTTLE (inside scholars with nothing to drink from)' :
     'MECHANISM: MIXED (see per-snap lines)'));
  for (const l of armorSilentLines) console.log('  R88 ARMOR-SILENT ' + l);
  console.log(`R88 ARMOR-SILENT: teleOk=${armorTeleOk} lineMissing(approx)=${armorLineMissing} silentWild=${armorSilentWild} silentHaven=${armorSilentHaven} silentUnknown=${armorSilentUnknown} ` +
    (armorLineMissing === 0 ? 'no silent craft on this panel' :
     armorSilentHaven > 0 ? 'CONTRADICTED (a line-missing craft on a scholar-haven day — not player-away gating)' :
     armorSilentWild === armorLineMissing ? 'CONFIRMED (every line-missing craft falls on a scholar-wild day — player-away gating as coded)' :
     'PARTIAL (some silent crafts lack a loc join — see lines)'));
}

// --- R88 DOORSTEP + MAEVE-QUALIFIED block (appended) ---
{
  let dsChecks = 0, dsHaven = 0, dsTrig = 0, dsAte = 0, dsDrank = 0, dsNoGain = 0, dsDoorOut = 0, dsDoorRef = 0;
  const dsSkipReasons = {}; const dsLines = [];
  let mqSnaps = 0, mqQual = 0; const mqLines = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const seed = f.replace(/.*census-(\d+)\.json$/, '$1');
    for (const r of (d.doorstepSteps || [])) {
      dsChecks++;
      if (r.atHaven) dsHaven++;
      if (r.skipped) { dsSkipReasons[r.skipped] = (dsSkipReasons[r.skipped] || 0) + 1; continue; }
      if (r.triggered) {
        dsTrig++;
        const e = r.eatRec || {};
        if (e.insideBefore === false) dsDoorOut++;
        if (e.enterResult === false || (typeof e.enterResult === 'string' && e.enterResult.indexOf('error') === 0)) dsDoorRef++;
        if (e.ate) dsAte++; else if (e.eatTriggered) dsNoGain++;
        if (e.drank) dsDrank++;
        dsLines.push(`${seed}:d${r.day} branch=${r.branch} kcal ${r.kcal} hyd ${r.hyd} inside ${e.insideBefore}->${e.insideAfter} stores ${e.storesBefore}->${e.storesAfter} ate=${!!e.ate} kcal ${e.kcalBefore}->${e.kcalAfter} drank=${!!e.drank} hyd ${e.hydBefore}->${e.hydAfter}`);
      }
    }
    // MAEVE-QUALIFIED (r87 metric review): a haven hyd-0 snap counts
    // toward the shape only in a 2+ snap streak or with kcal 0;
    // single snaps are pre-daily noise.
    let streak = 0;
    for (const sn of (d.series || [])) {
      if (sn.loc === 'haven' && sn.scholarHydration === 0) {
        streak++; mqSnaps++;
        const qual = (streak >= 2) || (sn.scholarKcal === 0);
        if (qual) { mqQual++; mqLines.push(`${seed}:d${sn.day} QUALIFIED streak=${streak} kcal=${sn.scholarKcal} inside=${sn.scholarInsideHaven} stores=${sn.scholarStoresAccess} bottles=${sn.scholarWaterBottles}`); }
      } else if (sn.loc === 'haven') { streak = 0; }
      else { streak = 0; }
    }
  }
  for (const l of dsLines) console.log('  R88 DOORSTEP ' + l);
  console.log(`R88 DOORSTEP: checks=${dsChecks} havenDays=${dsHaven} triggered=${dsTrig} ate=${dsAte} drank=${dsDrank} noGainEat=${dsNoGain} doorFromOutside=${dsDoorOut} doorRefused=${dsDoorRef} skipped=${JSON.stringify(dsSkipReasons)} ` +
    (dsTrig === 0 ? 'UNTESTED (no hungry/thirsty Haven day triggered the step)' :
     dsNoGain > 0 ? 'MISS-READ (a triggered step gained nothing — read the line)' :
     'DOORSTEP-GO (every triggered step recorded; see ate/drank)'));
  for (const l of mqLines) console.log('  R88 MAEVE-QUAL ' + l);
  console.log(`R88 MAEVE-QUALIFIED: havenHyd0Snaps=${mqSnaps} qualified=${mqQual} ` +
    (mqQual === 0 ? 'no qualifying Maeve snap on this panel' : 'qualifying snaps listed above'));
}

// --- R104 WINPLAN block (appended) ---
{
  let wpSeeds = 0, wpD14Seeds = 0, wpD28Seeds = 0, wpD14Holders = 0, wpD28Holders = 0;
  const wpTotals = { d14: {}, d28: {} };
  const wpLines = [];
  // R106-ARMS-WHY roll-up: M-A1 gear-precondition, M-A2 structural reachability.
  let awD28 = 0, awGearUnarmed = 0, awGearUnknown = 0, awPrimsGt0 = 0, awMuster = 0, awBeat4 = 0, awBeat5 = 0, awWave4 = 0, awTable = 0;
  const awLines = [];
  for (const f of files) {
    const seed = f.replace(/.*census-(\d+)\.json$/, '$1');
    let d = null;
    try { d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch (e) { console.log(`  R104 WINPLAN ${seed}: census unreadable (${e.message})`); continue; }
    const w = d.winPlan || null;
    if (!w) { wpLines.push(`${seed}: NO winPlan field (pre-R104 census or instrument miss)`); continue; }
    wpSeeds++;
    for (const tag of ['d14', 'd28']) {
      const snap = w[tag] || null;
      const st = (snap && snap.stats) || {};
      const holders = (snap && snap.holders) || [];
      const ps = st.planSeeds || 0;
      if (ps > 0) { if (tag === 'd14') wpD14Seeds++; else wpD28Seeds++; }
      if (tag === 'd14') wpD14Holders += holders.length; else wpD28Holders += holders.length;
      for (const k of Object.keys(st)) wpTotals[tag][k] = (wpTotals[tag][k] || 0) + (st[k] || 0);
      const stages = holders.map(h => `${h.name}:${h.stage}${h.sinceDay != null ? '@d' + h.sinceDay : ''}`).join(',');
      wpLines.push(`${seed}:${tag} planSeeds=${ps} stageAdv=${st.stageAdvances || 0} invites=${st.partyInvites || 0} departs=${st.partyDepartures || 0} waits=${st.partyWaits || 0} gearHolds=${st.gearHolds || 0} bondTends=${st.bondTends || 0} avoid=${st.avoidances || 0} seek=${st.seekContacts || 0} holders=${holders.length}${stages ? ' [' + stages + ']' : ''}`);
      // R106-ARMS-WHY: per-seed precondition line (null precond = pre-R106 census).
      const pc = (snap && snap.precond) || null;
      if (!pc) { awLines.push(`${seed}:${tag} NO-PRECOND (pre-R106 census or instrument miss)`); }
      else {
        const gh = (pc.gearHolders || []).map(g => `${g.name}:${g.armed === null ? '?' : (g.armed ? 'armed' : 'unarmed')}/${g.armored === null ? '?' : (g.armored ? 'armored' : 'bare')}`).join(',');
        awLines.push(`${seed}:${tag} stages=${JSON.stringify(pc.stages || {})} prims=${pc.prims} muster=${pc.muster} beat4=${pc.beat4} beat5=${pc.beat5} wave4kills=${pc.wave4kills} maxWave=${pc.maxWaveKill} table=${pc.tablePlans} gear=[${gh}]`);
        if (tag === 'd28') {
          awD28++;
          for (const g of (pc.gearHolders || [])) {
            if (g.armed === null || g.armored === null) awGearUnknown++;
            else if (!g.armed && !g.armored) awGearUnarmed++;
          }
          if ((pc.prims || 0) > 0) awPrimsGt0++;
          if (pc.muster) awMuster++;
          if (pc.beat4) awBeat4++;
          if (pc.beat5) awBeat5++;
          if ((pc.wave4kills || 0) > 0) awWave4++;
          if ((pc.tablePlans || 0) > 0) awTable++;
        }
      }
    }
  }
  for (const l of wpLines) console.log('  R104 WINPLAN ' + l);
  console.log(`R104 WINPLAN: censuses=${wpSeeds} d14 planSeeds>0 on ${wpD14Seeds}/${wpSeeds} seeds, d28 on ${wpD28Seeds}/${wpSeeds}; holders d14=${wpD14Holders} d28=${wpD28Holders}; totals d14=${JSON.stringify(wpTotals.d14)} d28=${JSON.stringify(wpTotals.d28)} ` +
    (wpSeeds === 0 ? 'NO-DATA (no winPlan field — instrument never ran)' :
     wpD14Seeds === 0 && wpD14Holders === 0 ? 'GOAL-SILENT at d14 (no plan seeded, no holder — goals do not bite in the landing window)' :
     'GOAL-LIVE at d14 (plans seeded and/or held in the first fortnight — see per-seed lines)'));
  for (const l of awLines) console.log('  R106 ARMS-WHY ' + l);
  console.log(`R106 ARMS-WHY: d28 censuses=${awD28} gear-stage unarmed+unarmored=${awGearUnarmed} gear-unknown=${awGearUnknown} prims>0 on ${awPrimsGt0} seeds muster on ${awMuster} beat4 on ${awBeat4} beat5 on ${awBeat5} wave4kills on ${awWave4} table-plans on ${awTable} ` +
    (awD28 === 0 ? 'NO-DATA (no precond block — instrument never ran)' :
     (awGearUnarmed === 0 && awGearUnknown === 0) ? 'M-A1: gearHold precondition NEVER arose at snapshot (every gear-stage holder armed-or-armored) — gearHolds unreachable-by-construction at snapshot; M-A2: ' + ((awPrimsGt0 === 0 && awMuster === 0 && awWave4 === 0 && awTable === 0) ? 'STRUCTURALLY-UNREACHABLE (prims 0, no muster, no wave-4 kills, no table plans on all d28 censuses)' : 'COUNTEREXAMPLE present (see counts) — that arm\'s silence is a live question') :
     'M-A1: gearHold precondition AROSE (unarmed+unarmored gear-stage holder at snapshot) — 0 gearHolds needs a gate-side explanation; M-A2: ' + ((awPrimsGt0 === 0 && awMuster === 0 && awWave4 === 0 && awTable === 0) ? 'STRUCTURALLY-UNREACHABLE for the other arms (prims 0, no muster, no wave-4 kills, no table plans)' : 'COUNTEREXAMPLE present (see counts)')));
}
