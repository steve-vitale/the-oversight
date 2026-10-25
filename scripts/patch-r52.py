#!/usr/bin/env python3
"""Patch r51 probe -> r52 probe. Every replacement asserted."""
import sys

P = 'scripts/probe-endgame-r52-20261025.js'
s = open(P).read()
orig = s

def rep(old, new, n=1, must=True):
    global s
    c = s.count(old)
    if must and c != n:
        print(f'FAIL: expected {n} of {old[:90]!r}, found {c}')
        sys.exit(1)
    s = s.replace(old, new)

# --- header / seeds / evid / filenames ---
rep('// probe-endgame-r51-20261025.js — journey-endgame r51 (lane B, 2026-10-25).',
    '// probe-endgame-r52-20261025.js — journey-endgame r52 (lane B, 2026-10-25).')
rep('  : [88061, 88062, 88063, 88064, 88065, 88066, 88067]).filter(Number.isFinite);',
    '  : [88071, 88072, 88073, 88074, 88075, 88076, 88077]).filter(Number.isFinite);')
rep("const PLAN = { 88061: 'waves', 88062: 'waves', 88063: 'waves', 88064: 'forcedrift', 88065: 'wavesnw', 88066: 'wavesnw', 88067: 'wavesnw' };",
    "const PLAN = { 88071: 'waves', 88072: 'waves', 88073: 'waves', 88074: 'forcedrift', 88075: 'wavesnw', 88076: 'wavesnw', 88077: 'wavesnw' };")
rep("const EVID = path.join(__dirname, '..', 'evidence', '2026-10-25', 'perseed-endgame-r51');",
    "const EVID = path.join(__dirname, '..', 'evidence', '2026-10-25', 'perseed-endgame-r52');")
rep("`endgame-r51-${seed}.json`", "`endgame-r52-${seed}.json`")
rep("`endgame-r51-${seed}-transcript.txt`", "`endgame-r52-${seed}-transcript.txt`")
rep('# journey-endgame r51 — seed ${seed}', '# journey-endgame r52 — seed ${seed}')
rep('node scripts/probe-endgame-r51-20261025.js', 'node scripts/probe-endgame-r52-20261025.js')

# --- snapFighters takes an explicit fight object (engine closes need the ref itself) ---
rep("""  function snapFighters(G) {
    try {
      const f = G.tbfight;""",
    """  function snapFighters(G, f0) {
    try {
      const f = f0 || G.tbfight;""")

# --- wave4Mons: data lookup first, mdef.wave fallback (r51 note item) ---
rep("""      return (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && (((x.mdef || {}).wave) || 0) >= 4);""",
    """      return (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && ((dataWaveOf(G, x.monsterId || (x.mdef || {}).id || x.id) || ((x.mdef || {}).wave) || 0) >= 4));""")

# --- closeFight -> closeFightRec (shared close path) + escapeKind + context fields ---
rep("""  function closeFight(G, why) {
    if (!openFight) return;
    const rec0 = openFight;
    openFight = null;
    try {""",
    """  function closeFightRec(G, rec0, why) {
    if (!rec0 || rec0.closed) return;
    rec0.closed = true;
    try { if (engineOpen.has(rec0.ref)) engineOpen.delete(rec0.ref); } catch (e) {}
    try { closedEngineRefs.add(rec0.ref); } catch (e) {}
    try {""")
rep("""      const causalDeaths = Object.values(causalByVid);
      fightCensus.push({
        monsters: rec0.monsters, startDay: rec0.startDay, endDay: dayOf(G),
        turns: rec0.turns, outcome, killFlag, dieFlag, talkDown, gotAway,
        playerFled: !!last.playerFled, villFled: !!last.villFled,
        monFled: !!last.monFled, result: last.result || null, closeWhy: why,
        diedInFight: died, causalDeaths, causalFlag: causalDeaths.length > 0,
      });""",
    """      const causalDeaths = Object.values(causalByVid);
      const escapeKind = slice.some(x => /ESCAPED|BARRIER CROSSED|last streetlight|crash through to a new area/.test(x)) ? 'designed' : 'break';
      const arenaMention = slice.some(x => /arena/i.test(x));
      const deathCauses = [...new Set(causalDeaths.map(d => d.cause || '?'))];
      fightCensus.push({
        monsters: rec0.monsters, startDay: rec0.startDay, endDay: dayOf(G),
        turns: rec0.turns, turnsObserved: !!rec0.turnsObserved, outcome, killFlag, dieFlag, talkDown, gotAway,
        escapeKind, openDriver: rec0.openDriver || 'policy', source: rec0.source || 'policy',
        committed: rec0.committed !== false, arenaMention, deathCauses,
        playerFled: !!last.playerFled, villFled: !!last.villFled,
        monFled: !!last.monFled, result: last.result || null, closeWhy: why,
        diedInFight: died, causalDeaths, causalFlag: causalDeaths.length > 0,
      });""")
rep("""    } catch (e) { censusErrors++; }
  }
  function censusObserve(G, c) {""",
    """    } catch (e) { censusErrors++; }
  }
  function closeFight(G, why) {
    if (!openFight) return;
    const rec0 = openFight;
    openFight = null;
    closeFightRec(G, rec0, why);
  }
  function closePending(G, why) {
    if (!pendingNonCommit) return;
    const p = pendingNonCommit;
    pendingNonCommit = null;
    closeFightRec(G, {
      ref: p.ref, monsters: p.monsters || [], startDay: p.startDay, startCap: p.startCap,
      startKills: p.startKills, startAlive: p.startAlive, turns: p.turns || 1,
      turnsObserved: true, lastSnap: null, source: 'policy', openDriver: 'policy',
      committed: false,
    }, why);
  }
  function censusObserve(G, c) {""")

# --- censusObserve: mark policy observation, engine adoption, fast-branch guard ---
rep("""    const f = G.tbfight;
    if (openFight && f === openFight.ref) {
      const sn = snapFighters(G);
      if (sn) openFight.lastSnap = sn;
      openFight.turns++;""",
    """    const f = G.tbfight;
    if (openFight && f === openFight.ref) {
      const sn = snapFighters(G);
      if (sn) openFight.lastSnap = sn;
      openFight.turns++;
      openFight.turnsObserved = true;""")
rep("""    if (openFight) closeFight(G, 'ref-change');
    if (pendingNonCommit && f !== pendingNonCommit.ref) { nonCommittedW4++; pendingNonCommit = null; }""",
    """    if (openFight) closeFight(G, 'ref-change');
    if (pendingNonCommit && f !== pendingNonCommit.ref) { closePending(G, 'ref-change'); }""")
rep("""    if (f && f.over && f !== lastFastRef && !(pendingNonCommit && pendingNonCommit.ref === f)) {""",
    """    if (f && f.over && f !== lastFastRef && !(pendingNonCommit && pendingNonCommit.ref === f) && !engineOpen.has(f) && !closedEngineRefs.has(f)) {""")
# fast branch: merge into the census (r52 single-census rule) instead of a separate tally
rep("""          const rec = {
            monsters: mids, day: dayOf(G), committed,
            result: f.result || null,
            gotAway: slice.some(x => /It got away/.test(x)),
            partyEscaped: slice.some(x => /You escape\\. The thicket/.test(x)),
            causalDeaths: Object.values(causalByVid),
            dayKills: dayKills.map(e => ({ mid: e.mid, by: e.by || null, via: e.via || null })),
          };
          if (committed) fastW4.push(rec); else fastNonCommittedW4++;""",
    """          policyOnlyOpensW4++;
          const fGotAway = slice.some(x => /It got away/.test(x));
          const fEscaped = slice.some(x => /You escape\\. The thicket/.test(x));
          let fOutcome = 'otherEnd';
          if (dayKills.length) fOutcome = 'vKill';
          else if (Object.values(causalByVid).length) fOutcome = 'vDie';
          else if (fGotAway) fOutcome = 'mFlee';
          else if (fEscaped) fOutcome = 'vFlee';
          fightCensus.push({
            monsters: mids, startDay: dayOf(G), endDay: dayOf(G),
            turns: 1, turnsObserved: true, outcome: fOutcome,
            killFlag: dayKills.length > 0, dieFlag: Object.values(causalByVid).length > 0,
            talkDown: slice.some(x => /They stand down|Walk In: the fight ends/.test(x)),
            gotAway: fGotAway, escapeKind: (fEscaped || slice.some(x => /ESCAPED|BARRIER CROSSED|last streetlight|crash through/.test(x))) ? 'designed' : 'break',
            openDriver: 'policy', source: 'policy-fast', committed,
            arenaMention: slice.some(x => /arena/i.test(x)),
            deathCauses: [...new Set(Object.values(causalByVid).map(d => d.cause || '?'))],
            playerFled: false, villFled: false, monFled: fGotAway,
            result: f.result || null, closeWhy: 'fast-single-call',
            diedInFight: [], causalDeaths: Object.values(causalByVid),
            causalFlag: Object.values(causalByVid).length > 0,
            dayKills: dayKills.map(e => ({ mid: e.mid, by: e.by || null, via: e.via || null })),
          });""")
# policy open path: engine adoption first, policy-only counting, committed flags
rep("""    capLenAtLastObserve = capture.length;
    if (!f || f.over) return;
    const mons = wave4Mons(G);
    if (!mons.length) return;
    const committed = !!(c && c._w5Commit === true);
    const types = mons.map(m => (m.monsterId || (m.mdef || {}).id || '?'));
    // Conversion: a pending fight that LATER commits (commitLive turned
    // true mid-fight) joins the census with its ORIGINAL start snapshots,
    // so kills/deaths from the fight's start are not lost.
    if (pendingNonCommit && pendingNonCommit.ref === f) {
      if (!committed) return; // still waiting for commit; stay pending
      openFight = {
        ref: f, monsters: types, startDay: pendingNonCommit.startDay,
        startCap: pendingNonCommit.startCap,
        startKills: pendingNonCommit.startKills,
        startAlive: pendingNonCommit.startAlive,
        turns: (pendingNonCommit.turns | 0) + 1,
        lastSnap: snapFighters(G),
      };
      pendingNonCommit = null;
      return;
    }
    if (committed) {
      openFight = {
        ref: f, monsters: types, startDay: dayOf(G), startCap: capture.length,
        startKills: killCountW4(G), startAlive: aliveSetOf(G), turns: 1,
        lastSnap: snapFighters(G),
      };
    } else {
      pendingNonCommit = {
        ref: f, startDay: dayOf(G), startCap: capture.length,
        startKills: killCountW4(G), startAlive: aliveSetOf(G), turns: 1,
      };
    }""",
    """    capLenAtLastObserve = capture.length;
    if (!f || f.over) return;
    const mons = wave4Mons(G);
    if (!mons.length) return;
    const committed = !!(c && c._w5Commit === true);
    const types = mons.map(m => (m.monsterId || (m.mdef || {}).id || '?'));
    // r52 ENGINE ADOPTION: a fight the startCombat wrapper already opened
    // is the SAME fight by object identity — adopt it (engine start
    // snapshots are earlier and complete) instead of opening a second
    // record. Non-committed engine fights stay in the engine map until
    // they commit; the policy pending record is unnecessary then.
    if (engineOpen.has(f)) {
      const er = engineOpen.get(f);
      er.turnsObserved = true;
      er.lastSnap = snapFighters(G);
      er.turns++;
      if (!committed) {
        if (pendingNonCommit && pendingNonCommit.ref === f) pendingNonCommit = null;
        return;
      }
      er.source = 'engine+policy';
      er.committed = true;
      engineOpen.delete(f);
      if (pendingNonCommit && pendingNonCommit.ref === f) pendingNonCommit = null;
      openFight = er;
      return;
    }
    // Conversion: a pending fight that LATER commits (commitLive turned
    // true mid-fight) joins the census with its ORIGINAL start snapshots,
    // so kills/deaths from the fight's start are not lost.
    if (pendingNonCommit && pendingNonCommit.ref === f) {
      if (!committed) return; // still waiting for commit; stay pending
      openFight = {
        ref: f, monsters: types, startDay: pendingNonCommit.startDay,
        startCap: pendingNonCommit.startCap,
        startKills: pendingNonCommit.startKills,
        startAlive: pendingNonCommit.startAlive,
        turns: (pendingNonCommit.turns | 0) + 1,
        turnsObserved: true,
        lastSnap: snapFighters(G),
        source: 'policy', openDriver: 'policy', committed: true,
      };
      pendingNonCommit = null;
      return;
    }
    if (committed) {
      policyOnlyOpensW4++;
      openFight = {
        ref: f, monsters: types, startDay: dayOf(G), startCap: capture.length,
        startKills: killCountW4(G), startAlive: aliveSetOf(G), turns: 1,
        turnsObserved: true,
        lastSnap: snapFighters(G),
        source: 'policy', openDriver: 'policy', committed: true,
      };
    } else {
      policyOnlyOpensW4++;
      pendingNonCommit = {
        ref: f, monsters: types, startDay: dayOf(G), startCap: capture.length,
        startKills: killCountW4(G), startAlive: aliveSetOf(G), turns: 1,
      };
    }""")

# --- startCombat engine wrapper + engine state, installed after the policy.fight wrap ---
rep("""  const oDaily = policy.daily.bind(policy);""",
    """  // ---- r52 ENGINE-LEVEL CENSUS (startCombat wrapper, read-only) ----
  // Every fight opener funnels through Game.startCombat(mid): record the
  // open here (wave by DATA lookup, fallback mdef.wave) so fights that
  // open and close inside one daily — invisible to the policy.fight
  // wrapper — are still census fights. The wrapper passes through
  // untouched (same this, same args, same return, same throw).
  const engineOpen = new Map();
  const closedEngineRefs = new Set();
  let engineOpensW4 = 0, policyOnlyOpensW4 = 0;
  try {
    const oStart = Game.startCombat ? Game.startCombat.bind(Game) : null;
    if (oStart) Game.startCombat = function (mid) {
      let r = null, threw = null;
      try { r = oStart.apply(this, arguments); } catch (e) { threw = e; }
      try {
        const f = Game.tbfight || null;
        if (f && !engineOpen.has(f) && !closedEngineRefs.has(f)) {
          const mons = (f.fighters || []).filter(x => x && x.kind === 'monster');
          const w4 = mons.filter(x => ((dataWaveOf(Game, x.monsterId || (x.mdef || {}).id || x.id) || ((x.mdef || {}).wave) || 0) >= 4);
          if (w4.length) {
            engineOpensW4++;
            engineOpen.set(f, {
              ref: f, monsters: w4.map(x => (x.monsterId || (x.mdef || {}).id || '?')),
              startDay: dayOf(Game), startCap: capture.length,
              startKills: killCountW4(Game), startAlive: aliveSetOf(Game),
              turns: 1, turnsObserved: false, lastSnap: snapFighters(Game, f),
              source: 'engine', openDriver: 'engine', committed: false,
            });
          }
        }
      } catch (e) { censusErrors++; }
      if (threw) throw threw;
      return r;
    };
  } catch (e) { censusErrors++; }
  function closeEngineOpen(G, why) {
    for (const [ref, rec] of Array.from(engineOpen.entries())) {
      try {
        if (ref.over || !G.tbfight || G.tbfight !== ref) closeFightRec(G, rec, why);
        else { rec.lastSnap = snapFighters(G, ref); }
      } catch (e) { censusErrors++; }
    }
  }
  const oDaily = policy.daily.bind(policy);""")

# --- daily wrapper: engine closes at day boundaries + withdrawal detector ---
rep("""  policy.daily = (G, c) => {
    dayStartCapIdx = capture.length;
    try {
      if (openFight && (!G.tbfight || G.tbfight !== openFight.ref)) closeFight(G, 'day-boundary');
      if (pendingNonCommit && (!G.tbfight || G.tbfight !== pendingNonCommit.ref)) { nonCommittedW4++; pendingNonCommit = null; }
    } catch (e) { censusErrors++; }""",
    """  let withdrawal = null;
  let dayStartDay = 0;
  policy.daily = (G, c) => {
    dayStartCapIdx = capture.length;
    dayStartDay = dayOf(G);
    try {
      if (openFight && (!G.tbfight || G.tbfight !== openFight.ref)) closeFight(G, 'day-boundary');
      if (pendingNonCommit && (!G.tbfight || G.tbfight !== pendingNonCommit.ref)) { closePending(G, 'day-boundary'); }
      closeEngineOpen(G, 'day-boundary');
    } catch (e) { censusErrors++; }""")
rep("""    let r;
    try { r = oDaily(G, c); } catch (e) { instrumentErrors++; }
    try { lastDailyCtx = c; } catch (e) {}""",
    """    let r;
    try { r = oDaily(G, c); } catch (e) { instrumentErrors++; }
    try { lastDailyCtx = c; } catch (e) {}
    // r52: close engine fights that opened AND closed inside this daily
    // (the finishLiveFight class — never touches policy.fight), and
    // detect the table WITHDRAWAL beat on the day it fires.
    try { closeEngineOpen(G, 'day-end'); } catch (e) { censusErrors++; }
    try {
      if (!withdrawal) {
        const slice = capture.slice(dayStartCapIdx);
        const hit = slice.find(x => /PELLET HUMS|the mantle may pass to hungrier hands/.test(x));
        if (hit) withdrawal = { day: dayStartDay, line: hit.slice(0, 300) };
      }
    } catch (e) { instrumentErrors++; }""")

# --- run-end closes + rec fields ---
rep("""  try {
    if (openFight) closeFight(Game, 'run-end');
    if (pendingNonCommit) { nonCommittedW4++; pendingNonCommit = null; }
  } catch (e) { censusErrors++; }""",
    """  try {
    if (openFight) closeFight(Game, 'run-end');
    if (pendingNonCommit) { closePending(Game, 'run-end'); }
    closeEngineOpen(Game, 'run-end');
  } catch (e) { censusErrors++; }""")
rep("""    weekly, fightCensus: { fights: fightCensus, nonCommittedW4, censusErrors, fastW4, fastNonCommittedW4 }, census: censusOf(Game), veterans,""",
    """    weekly, fightCensus: { fights: fightCensus, nonCommittedW4, censusErrors, fastW4, fastNonCommittedW4, engineOpensW4, policyOnlyOpensW4 }, census: censusOf(Game), veterans, withdrawal,""")
rep("""    console.log('CENSUS', JSON.stringify({ fights: (r.fightCensus && r.fightCensus.fights) || [], nonCommittedW4: r.fightCensus ? r.fightCensus.nonCommittedW4 : null, censusErrors: r.fightCensus ? r.fightCensus.censusErrors : null }));""",
    """    console.log('CENSUS', JSON.stringify({ fights: (r.fightCensus && r.fightCensus.fights) || [], nonCommittedW4: r.fightCensus ? r.fightCensus.nonCommittedW4 : null, censusErrors: r.fightCensus ? r.fightCensus.censusErrors : null, engineOpens: r.fightCensus ? r.fightCensus.engineOpensW4 : null, policyOnlyOpens: r.fightCensus ? r.fightCensus.policyOnlyOpensW4 : null, withdrawal: r.withdrawal || null }));""")
rep("""    out.push({ seed: r.seed, plan: r.plan, announceDay: r.announceDay, satDay: r.satDay, deferDays: r.deferDays, greedyWaits: r.greedy && r.greedy.waits, greedyMaxTier: r.greedy && r.greedy.maxTier, maxTier: r.maxTier, satPenalty: r.satPenalty, overtimeLines: r.overtimeLines, armoryDonations: r.armory && r.armory.donations, armoryUnits: r.armory && r.armory.unitsAtEnd, windowEndGuard: r.windowEndGuard, livingVeterans: r.veterans && r.veterans.livingVeteranCount, unlockedWave: r.veterans && r.veterans.unlockedWave, seat: r.satSeatKind, path: r.walkedPath, branch: r.walkedBranch, won: r.won, end: r.endReason, alive: r.census.alive, atSit: r.rg && r.rg.atSit, verbs: r.rg && r.rg.verbs, communes: r.rg && r.rg.communes, doorRelay: r.rg && r.rg.doorRelay, finalPickId: r.finalPickId, finalResolved: r.finalResolved, census: { n: ((r.fightCensus && r.fightCensus.fights) || []).length, outcomes: ((r.fightCensus && r.fightCensus.fights) || []).map(f => f.outcome), nonCommittedW4: r.fightCensus ? r.fightCensus.nonCommittedW4 : null, fastW4: ((r.fightCensus && r.fightCensus.fastW4) || []).map(f => f.monsters.join('+') + (f.committed ? '' : '(noncom)')), fastNonCom: r.fightCensus ? r.fightCensus.fastNonCommittedW4 : null }, noticed: r.noticedCount, bandCrossings: r.bandCrossings, fullseatMax: fs44.max, firstFullSeatDay: fs44.firstFullSeatDay, bestSeat: fs44.bestSeat, indispEver: fs44.indispEver, door: { held: rd.heldAtSit, lean: rd.leanAtSit, band: rd.bandAtSit, bond: rd.bondAtSit, capClaimed: rd.capClaimed, capCommunes: rd.capCommunes, capReroutes: rd.capReroutes, walked: rd.doorWalked } });""",
    """    out.push({ seed: r.seed, plan: r.plan, announceDay: r.announceDay, satDay: r.satDay, deferDays: r.deferDays, greedyWaits: r.greedy && r.greedy.waits, greedyMaxTier: r.greedy && r.greedy.maxTier, maxTier: r.maxTier, satPenalty: r.satPenalty, overtimeLines: r.overtimeLines, armoryDonations: r.armory && r.armory.donations, armoryUnits: r.armory && r.armory.unitsAtEnd, windowEndGuard: r.windowEndGuard, livingVeterans: r.veterans && r.veterans.livingVeteranCount, unlockedWave: r.veterans && r.veterans.unlockedWave, seat: r.satSeatKind, path: r.walkedPath, branch: r.walkedBranch, won: r.won, end: r.endReason, alive: r.census.alive, atSit: r.rg && r.rg.atSit, verbs: r.rg && r.rg.verbs, communes: r.rg && r.rg.communes, doorRelay: r.rg && r.rg.doorRelay, finalPickId: r.finalPickId, finalResolved: r.finalResolved, withdrawal: r.withdrawal || null, census: { n: ((r.fightCensus && r.fightCensus.fights) || []).length, outcomes: ((r.fightCensus && r.fightCensus.fights) || []).map(f => f.outcome), sources: ((r.fightCensus && r.fightCensus.fights) || []).map(f => f.source), escapeKinds: ((r.fightCensus && r.fightCensus.fights) || []).map(f => f.escapeKind), nonCommittedW4: r.fightCensus ? r.fightCensus.nonCommittedW4 : null, engineOpens: r.fightCensus ? r.fightCensus.engineOpensW4 : null, policyOnlyOpens: r.fightCensus ? r.fightCensus.policyOnlyOpensW4 : null, fastW4: ((r.fightCensus && r.fightCensus.fastW4) || []).map(f => f.monsters.join('+') + (f.committed ? '' : '(noncom)')), fastNonCom: r.fightCensus ? r.fightCensus.fastNonCommittedW4 : null }, noticed: r.noticedCount, bandCrossings: r.bandCrossings, fullseatMax: fs44.max, firstFullSeatDay: fs44.firstFullSeatDay, bestSeat: fs44.bestSeat, indispEver: fs44.indispEver, door: { held: rd.heldAtSit, lean: rd.leanAtSit, band: rd.bandAtSit, bond: rd.bondAtSit, capClaimed: rd.capClaimed, capCommunes: rd.capCommunes, capReroutes: rd.capReroutes, walked: rd.doorWalked } });""")

open(P, 'w').write(s)
print('probe patched OK, bytes', len(s), 'changed:', s != orig)
