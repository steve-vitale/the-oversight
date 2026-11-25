'use strict';
// test-journey-scale-r288-analyzer-20261125.js -- r288 analyzer proof
// (runs the REAL r288 analyzer on synthetic corpora in a temp dir; no
// driver needed). The analyzer reads vetbar/trust JSONs, natgate txt,
// raisetalk files, capture + betray watch per seed.
//
// Cases:
//   (1) national 1/2 (seed 106337 nat=1 from d95) + blocker named on
//       the other seed -> Q1 NATIONAL GO, exit 0.
//   (2) national 0/2, every seed with a named blocker (LEAD 2/3,
//       TRADE 1/3) -> Q1 NATIONAL NO-GO-on-the-wall with the
//       blocker named, exit 0 (guards hold; the wall is a measurement).
//   (3) a not-offered-spoken raise talk -> DEFECT, exit 1.
//   (4) a vetbar readiness/ladder disagreement -> NO-GO, exit 1.
//   (5) no raise talks in the band -> INCOMPLETE, exit 2.
//   (6) lived-days total outside +/-25% of the 3-band rolling mean 500 ->
//       guardrail BREACH, exit 1.
//   (7) a natgate file missing on one seed -> ERROR row printed, exit 0
//       (guards hold; the pilot gates own corpus completeness).
//   (8) a -nv transcript with the pre-talk line first and the header on
//       line 1, mime shown and answered -> trap HOLD and the villager
//       named from the header (not the filename).
//   (9) a -nv transcript with a mime shown, offered, never answered ->
//       trap guard BREACH, exit 1.
//   (12) a -nv transcript with 4x consecutive nv:nod -> nod-loop guard
//       BREACH, exit 1 (the Mariko r197 shape; r132 fix re-proof).
//   (13) a -nv transcript with 2x consecutive nv:nod -> nod guard HOLD,
//       exit 0 (the r132 thin-out arms after the 2nd identical gesture).
//   (14) a -nv transcript with 4x consecutive nv:listen -> exit 0
//       (listen progresses and is excluded from the streak guard).
//   (15) a tribute ready d90, 51 attempts all veterans-short,
//       payable=1 at ready -> READY-UNPAYABLE (the M23 shape), exit 0.
//   (16) a tribute delivered d96, 1/1 ok, payable=2 -> DELIVERED, exit 0.
//   (18) a trust corpus with a spotterWatch snapshot holding 2 spotters
//       -> the SPOTTER section counts them, exit 0.
//   (19) a trust corpus with no spotterWatch -> "unavailable", exit 0
//       (missing snapshot is never a fail).
//   (20) a trust corpus with a d90 spotterWatch90 snapshot holding 2
//       spotters and an EMPTY end snapshot (collapse band) -> the d90
//       line counts them, the end line reads empty, exit 0.
//   (21) a w5inst corpus: one lingerKey fought 3 times + one fresh
//       full-HP wild Editor -> shape ONE is NOT printed (MIXED: a
//       recurring lingerer plus a fresh spawn), exit 0; and a second
//       corpus with only fresh full-HP fights -> SUCCESSIVE, exit 0.
//   (22) a missing w5inst file -> "unavailable", exit 0 (never a fail).
//   (23) the lived-days control is the per-seed mean 123 (492/4):
//       the base fixture mean 125.0 (total 250 over 2 seeds) is
//       +1.6%, HOLD, exit 0.
//   (24) a sortie corpus on arm B (1 called + 1 held-pantry, wave-5
//       seen both days) -> the SORTIE section counts it, exit 0; and
//       a sortie corpus on arm A (rows present) -> the NOTE fires
//       (the step should be inert), exit 0 (measurement, never a fail).
//   (25) a w5inst corpus: one lingerKey fought twice with falling HP,
//       no fresh full-HP fight -> shape ONE, exit 0.
//   (26) a w5inst corpus: fresh full-HP fights of two species -> shape
//       SUCCESSIVE, exit 0.
//   (27) the lived-days control is the per-seed mean 123 (renumbered from (23)).
//   (28) single-arm muster: titan slain + wave-4 fights 245 / kills 24 -> Q1 MUSTER
//       MOVED, exit 0.
//   (29) single-arm muster: held short, call never sounded -> Q1 MUSTER
//       NOT-CALLED, exit 0.
//   (30) single-arm muster: call sounded, coalition fight fled -> Q1
//       MUSTER FOUGHT-NOT-SLAIN, exit 0.
//   (31) single-arm muster: titan slain on one ready row -> Q1 MUSTER
//       MOVED, exit 0.
//   (32) muster corpus missing on seven seeds -> "unavailable" per seed,
//       missing=7, exit 0 (never a fail).
//   (33) single-arm muster: a committed Haven blade dies ->
//       committedDeaths=1 counted in the cost read, exit 0.
//   (34) single-arm march: arrived + fought + slain on a march day ->
//       Q1 MARCH MOVED, exit 0.
//   (35) single-arm march: arrived, no meeting (0 fought) -> Q1 MARCH
//       ARRIVED-NO-FIGHT, exit 0.
//   (36) single-arm march: arrived + fought + fled (fight lost) -> Q1
//       MARCH FOUGHT-NOT-SLAIN, exit 0.
//   (37) single-arm march: muster slew the titan but the march never
//       fired (no march rows) -> Q1 MARCH NO-MARCH, exit 0.
//   (38) march corpus missing on all seeds -> "unavailable", missing=8,
//       exit 0 (never a fail).
//   (39) single-arm march: fired but never arrived (blocked-at) -> Q1
//       MARCH NO-ARRIVAL, exit 0.
//   (40) LAGGED JOIN: march arrives d137, coalition fight slays the titan
//       d138 while the scholar still stands on the lair tile -> the fight
//       IS march-completed, Q1 MARCH MOVED, exit 0.
//   (41)-(50) RETIRED in r243: the Q6 tableActive distinction and the
//       STAGE sections are gone (the fix landed; the stage was r242's
//       instrument). The refusal-spam measurement lived in Q6 and goes
//       with it; the spoken-line dedupe is proved by the r233 proof test.
//   (45) band wave-4 fights/kills lines: base fixture fights 240 (30 x 8)
//       and kills 24 (3 x 8) on arm B, exit 0.
//   (51)-(55) RETIRED in r244: the ECHO section is gone (the r243 fix
//       landed; the echo detector lived in the analyzer and goes with
//       it). The raise-accept voice is proved by
//       test-link-accept-voice-20261118.js.
//   (56) SUBCAP GUARD (control behavior): arm B linkraise linked 1 ->
//       "SUBCAP arm B: firedSeeds=0/8" printed; the ANSWERMAIL section
//       reads zeros (the lever stayed off), exit 0.
//   (57) PLAYTEST INTERESTING via national: arm B national 4/8
//       (bar >=3/8) -> Q1 PLAYTEST PANEL VERDICT: INTERESTING, exit 0.
//   (58) PLAYTEST QUIET with RUNG observed: one seed's closest road
//       seasons 3/3 without national (RUNG — in the r276-observed set
//       since r251) -> Q1 PLAYTEST PANEL VERDICT: QUIET, exit 0.
//   (59) PLAYTEST QUIET on a 0/8-national variant: the wall stands,
//       blockers all observed -> Q1 PLAYTEST PANEL VERDICT: QUIET,
//       exit 0 (Q1 never sets the exit code).
//   (60) PLAYTEST QUIET is the base fixture itself (national 1/8,
//       blockers all observed) -> asserted in case (1).
//   (61) BLOCKER FORMATION-LATE: closest road's 3rd link age < 30.
//   (62) BLOCKER TRUST-LOW: 3rd link age >= 30, trust < 40.
//   (63) BLOCKER SNAP: 3 formed, 2 active at end.
//   (64) BLOCKER FORMATION-FEW: fewer than 3 ever formed.
//   (65) BLOCKER RUNG: 3 seasoned on a road but national false.
//   (66) BLOCKER COLLAPSE + NATIONAL: over seed reads COLLAPSE,
//       national seed reads NATIONAL.
//   (67) Q2-WINPLAN LAUNCHES: one seed carries a winPlanEnd snapshot with a
//       departed trio -> Q2-WINPLAN PANEL verdict WINPLAN-LAUNCHES.
//   (68) Q2-WINPLAN ABSENT: no seed carries winPlanEnd -> no Q2-WINPLAN
//       PANEL line at all.
//   (69) Q2-WINPLAN null-err: one seed carries winPlanEnd null -> the
//       per-seed err line prints, verdict WINPLAN-AWAKE-EMPTY.
//   (70) BLOCKER UNKNOWN still fires INTERESTING: 3 links seasoned by
//       the numbers (age >= 30, trust >= 40) but the natgate says 2/3 —
//       the classifier cannot name the blocker (a taxonomy miss).
//   (71) BLOCKER RUNG-HORIZON: the closest road seasons 3/3 on the
//       FINAL recorded day only (rungDay) -> RUNG-HORIZON, and the
//       panel stays QUIET (the class is observed, not new).
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ANALYZER = path.join(__dirname, 'analyze-journey-scale-r288-20261125.js');
const SEEDS = [106337, 106338, 106339, 106340, 106341, 106342, 106343, 106344];
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function natgateLines(spec) {
  // spec: {lastDay, firstNat (null = never), lead:[s,a], cov:[s,a],
  // trade:[s,a], belong:'-' | 'X:t55/a0/age21/realm4/good1', pend:'-@-',
  // rungDay: {road:'lead'|'cov'|'trade', day:N} (optional) — the named
  // road seasons its 3rd link on day N only (count s-1 before it), so
  // the analyzer can tell a rung completed on the final day
  // (RUNG-HORIZON) from one completed earlier (RUNG). Without rungDay
  // every day carries the final counts, as the r251 fixtures did.}
  const lines = [];
  for (let d = 1; d <= spec.lastDay; d++) {
    const nat = (spec.firstNat != null && d >= spec.firstNat) ? 1 : 0;
    const rank = nat === 1 ? 'national' : (d >= 31 ? 'regional' : 'village');
    // Real natgate values are booleans (nat=true/false), not 0/1.
    const cnt = (road) => {
      const pair = spec[road];
      if (spec.rungDay && spec.rungDay.road === road && d < spec.rungDay.day) return Math.max(0, pair[0] - 1) + '/' + pair[1];
      return pair[0] + '/' + pair[1];
    };
    lines.push(`d${d} rank=${rank} nat=${nat === 1 ? 'true' : 'false'} glob=false netLive=true netDay=28 rung=true exiled=false refused=false pend=${spec.pend || '-@-'} lead=${cnt('lead')} cov=${cnt('cov')} trade=${cnt('trade')} belong=${spec.belong || '-'} foreignMax=0 polities={"lead":null,"belong":null,"cov":null,"trade":null} defer={} view=0`);
  }
  return lines.join('\n');
}
function seedFiles(dir, seed, spec, arm) {
  // Effective spec: arm B may override any field via spec.armB, arm C
  // via spec.armC.
  spec = Object.assign({}, spec, arm === 'b' ? (spec.armB || {}) : arm === 'c' ? (spec.armC || {}) : {});
  const P = `journey-scale-r288-${arm}-`;
  // spec: {days, over, rank, peakStage, stage3Day, lesserDay, vetbarDisagree,
  //   natgate (spec|null), raiseOutcome ('accepted'|'not-offered-spoken'|null)}
  const vb = { daily: spec.vetbarDaily || [{ day: 1, r4: 2, l3: spec.vetbarDisagree ? 1 : 2, r5: 0, l4: 0, shadow4: 2, shadow5: 0, blooded: false }] };
  fs.writeFileSync(path.join(dir, `${P}vetbar-${seed}.json`), JSON.stringify(vb));
  const tr = { census: {
    day: spec.days, over: !!spec.over, won: false, popAlive: 8, popTotal: 8,
    ladderChain: { peakStage: spec.peakStage, stage3Day: spec.stage3Day, seatLesserDay: spec.lesserDay, seatFullDay: null, capstoneReady: {}, capstoneDelivered: null, fights: 40, fightsByWave: { 4: (spec.ladderW4 || 30) }, killAttrEnd: { w4total: (spec.ladderW4kills == null ? 3 : spec.ladderW4kills), w4scholar: 1, w4villager: 2, w4null: 0, w4distinctVillagers: 2, w4livingVillagers: 2 } },
    deathCensus: { deaths: 5, byCause: { combat: 5 }, booksClose: true, unattributed: 0, teleOnly: 0 },
    scaleRank: spec.rank,
    links: spec.links || [],
    linkraise: spec.linkraise === undefined
      ? (arm === 'c'
        ? { raisesSeen: 20, raisesAnswered: 3, raisesLinked: 2, raisesCountered: 0, raisesSkippedNotReady: 0, raisesSkippedNoRaiser: 0, raisesSkippedNoVillage: 0, raisesSkippedSubCap: 0, raisesPassedSubCapOff: 12, raisesSkippedLinked: 0, raisesTalkFailed: 0, raisesNotOffered: 0, firstRaiseTalkDay: 12, firstRaiseAnswerDay: 12, errors: 0, events: [], raiseTalks: [] }
        : { raisesSeen: 15, raisesAnswered: 1, raisesLinked: 1, raisesCountered: 0, raisesSkippedNotReady: 0, raisesSkippedNoRaiser: 0, raisesSkippedNoVillage: 0, raisesSkippedSubCap: 14, raisesPassedSubCapOff: 0, raisesSkippedLinked: 0, raisesTalkFailed: 0, raisesNotOffered: 0, firstRaiseTalkDay: 12, firstRaiseAnswerDay: 12, errors: 0, events: [], raiseTalks: [] })
      : (spec.linkraise === null
        ? { raisesSeen: 0, raisesAnswered: 0, raisesLinked: 0, raisesCountered: 0, raisesSkippedNotReady: 0, raisesSkippedNoRaiser: 0, raisesSkippedNoVillage: 0, raisesSkippedSubCap: 0, raisesPassedSubCapOff: 0, raisesSkippedLinked: 0, raisesTalkFailed: 0, raisesNotOffered: 0, firstRaiseTalkDay: null, firstRaiseAnswerDay: null, errors: 0, events: [], raiseTalks: [] }
        : spec.linkraise),
    spotterWatch: spec.spotterWatch === undefined ? null : spec.spotterWatch,
    spotterWatch90: spec.spotterWatch90 === undefined ? null : spec.spotterWatch90,
    ...(spec.winPlanEnd !== undefined ? { winPlanEnd: spec.winPlanEnd } : {}),
  } };
  fs.writeFileSync(path.join(dir, `${P}trust-${seed}.json`), JSON.stringify(tr));
  // r276: the answermail ledger. Answermail is OFF on both arms (r244
  // judged it NO-GO; the composition stays a branch) — the driver writes
  // null stats on both arms, so the fixture does too unless the spec
  // overrides spec.answermail. The analyzer's ANSWERMAIL section reads
  // zeros; case (56) asserts the lever stayed off.
  const amStats = spec.answermail === undefined ? null : spec.answermail;
  fs.writeFileSync(path.join(dir, `${P}answermail-${seed}.json`), JSON.stringify({ seed, arm: arm.toUpperCase(), answermail: false, stats: amStats }));
  if (spec.trustevents) fs.writeFileSync(path.join(dir, `${P}trustevents-${seed}.txt`), spec.trustevents.join('\n'));
  if (spec.natgate) fs.writeFileSync(path.join(dir, `${P}natgate-${seed}.txt`), natgateLines(spec.natgate));
  fs.writeFileSync(path.join(dir, `${P}capture-${seed}.txt`), '');
  // r288: a spec.capture array replaces the empty capture with SAY lines
  // (departname cases 72-74 read depart beats from here).
  if (spec.capture) fs.writeFileSync(path.join(dir, `${P}capture-${seed}.txt`), spec.capture.join('\n'));
  // r288: a spec.guns object writes the end-of-seed gun census (Q5-GUNS
  // cases 76-77 read totals + location splits from here).
  if (spec.guns) fs.writeFileSync(path.join(dir, `${P}guns-${seed}.json`), JSON.stringify({ seed, arm: arm.toUpperCase(), day: spec.days, total: spec.guns.total, locations: spec.guns.locations || [], personFlags: spec.guns.personFlags || {} }));
  fs.writeFileSync(path.join(dir, `${P}betray-${seed}.txt`), '');
  if (spec.raiseTalk) {
    // Verbatim raisetalk (echo cases): the caller supplies the full
    // file content after the header line.
    fs.writeFileSync(path.join(dir, `${P}raisetalk-${seed}-1.txt`),
      `seed ${seed} talk 1 outcome ${spec.raiseTalk.outcome || 'accepted'}\n` + spec.raiseTalk.lines.join('\n') + '\n');
  } else if (spec.raiseOutcome === 'accepted') {
    // The fixed accept: a VOICED THEM reply follows the YOU line (the
    // r243 fix) — so base cases exercise the ECHO GO path (0 echoes).
    fs.writeFileSync(path.join(dir, `${P}raisetalk-${seed}-1.txt`),
      `seed ${seed} talk 1 outcome accepted\n` +
      `THEM: "I've heard good things about Stonebridge. We should link with them — we'd be stronger together."\n` +
      `YOU: "All right. Let's ask them."\n` +
      `THEM: "Good. Tell them I remember their fires — and that we're ready." You carry the proposal to Stonebridge.\n`);
  } else if (spec.raiseOutcome === 'not-offered-spoken') {
    fs.writeFileSync(path.join(dir, `${P}raisetalk-${seed}-1.txt`),
      `seed ${seed} talk 1 outcome not-offered\n` +
      `THEM: "I've heard good things about Stonebridge. We should link with them — we'd be stronger together."\n` +
      `THEM: "Right. Go on, then."\n`);
  }
  if (spec.tribute) {
    // Tribute fixture: ladderevents DELIVER lines (one per attempt,
    // the first `delivered` of them ok=1) + scholarcount daily rows
    // (trib ready from readyDay, payable fixed at payableAtReady).
    const t = spec.tribute;
    const evLines = [];
    for (let i = 0; i < t.attempts; i++) {
      evLines.push(`d${t.readyDay + i} DELIVER military_tribute ok=${i < t.delivered ? 1 : 0} reason=${i < t.delivered ? 'none' : 'veterans-short'}`);
    }
    fs.writeFileSync(path.join(dir, `${P}ladderevents-${seed}.txt`), evLines.join('\n'));
    const scLines = [];
    for (let d = 1; d <= spec.days; d++) {
      const ready = t.readyDay != null && d >= t.readyDay;
      scLines.push(`d${d} new=${ready ? 2 : 1} legacy=${ready ? 2 : 1} payable=${t.payableAtReady} trib=${ready ? 'ready' : 'veterans-short'} delivered=${t.delivered > 0 && d >= t.readyDay + t.delivered - 1 ? 'military_tribute' : '-'}`);
    }
    fs.writeFileSync(path.join(dir, `${P}scholarcount-${seed}.txt`), scLines.join('\n'));
  }
  if (spec.w5inst) {
    // W5-instance fixture: fights with entity fingerprints + the daily
    // live world-monster census. Written verbatim from the spec.
    fs.writeFileSync(path.join(dir, `${P}w5inst-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r288-' + arm, fights: spec.w5inst.fights || [], monsterDays: spec.w5inst.monsterDays || [], spotterWatch90: [] }));
  }
  if (spec.sortie) {
    // Sortie fixture: the driver's sortie ledger, verbatim from the spec.
    fs.writeFileSync(path.join(dir, `${P}sortie-${seed}.json`), JSON.stringify({ seed, arm: spec.sortie.arm, sortie: spec.sortie.arm === 'B', rows: spec.sortie.rows || [] }));
  }
  if (spec.nvTranscript) {
    const nv = spec.nvTranscript;
    fs.writeFileSync(path.join(dir, `${P}transcript-${seed}-day90-nv.txt`),
      `(pre-talk seed: none; takenWantDay=0; convoCount=14)\n` +
      `=== seed ${seed} day 90 — conversation with ${nv.name} (${nv.vid}) ===\n` +
      `occupation=blacksmith temperament=steady trust=90 dead=false\n` +
      `want: none (stage 0)\n` +
      `open thread: nonverbal fromSeed=false\n` +
      `picker: control\n\n` +
      `THEM: ${nv.name} speaks only Polish. No shared words at all — just eyes, hands, and patience.\n` +
      (nv.mime ? `(They mime walking — come with me, they seem to say.)\n` : ``) +
      `(turn0 choices: nv:accept, nv:decline, nv:nod, leave)\n` +
      (nv.streak ? Array.from({ length: nv.streak.count }, () => `YOU: [nv:${nv.streak.gesture}] (${nv.streak.gesture} again)\n`).join('') :
        (nv.answered ? `YOU: [nv:accept] (nod and follow)\n` : `YOU: [nv:nod] (nod slowly)\n`)));
  }
  if (spec.muster) {
    // Muster fixture: the driver's muster ledger + titan end-state +
    // verb-call log, verbatim from the spec.
    fs.writeFileSync(path.join(dir, `${P}muster-${seed}.json`), JSON.stringify({ seed, arm: arm.toUpperCase(), muster: arm === 'b', rows: spec.muster.rows || [], titanEnd: spec.muster.titanEnd || { omens: {}, musters: {}, slain: {}, outcomes: spec.muster.outcomes || [] }, verbCalls: spec.muster.verbCalls || [], verbErrors: spec.muster.verbErrors || [] }));
  }
  if (spec.march) {
    // March fixture: the driver's march ledger + titan end-state,
    // verbatim from the spec. The titanEnd carries the outcomes log
    // (the day join lives in the analyzer, not the fixture).
    fs.writeFileSync(path.join(dir, `${P}march-${seed}.json`), JSON.stringify({ seed, arm: arm.toUpperCase(), march: arm === 'b', rows: spec.march.rows || [], titanEnd: spec.march.titanEnd || { omens: {}, musters: {}, slain: {}, outcomes: spec.march.outcomes || [] } }));
  }

  if (spec.deathcensus) {
    // Death-census fixture: only .deaths is read by the analyzer's
    // committed-blades join (vid + day + cause).
    fs.writeFileSync(path.join(dir, `${P}deathcensus-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r288-' + arm, deaths: spec.deathcensus.deaths || [] }));
  }
  if (spec.dayTranscript) {
    // A REGULAR day90 transcript (not -nv) whose thread is nonverbal:
    // the trap guard must count it too (r207 fix — Boris 135602 d90).
    const nv = spec.dayTranscript;
    fs.writeFileSync(path.join(dir, `${P}transcript-${seed}-day90.txt`),
      `(pre-talk seed: none; takenWantDay=0; convoCount=13)\n` +
      `=== seed ${seed} day 90 — conversation with ${nv.name} (${nv.vid}) ===\n` +
      `occupation=blacksmith temperament=steady trust=90 dead=false\n` +
      `want: none (stage 0)\n` +
      `open thread: nonverbal fromSeed=false\n` +
      `picker: control\n\n` +
      `THEM: ${nv.name} speaks only Polish. No shared words at all — just eyes, hands, and patience.\n` +
      (nv.mime ? `(They mime walking — pointing at themselves, then at you, then toward the tree line. The meaning is unmistakable: come with me.)\n` : ``) +
      `(turn0 choices: nv:accept, nv:decline, nv:nod, nv:smile, nv:pointself, nv:listen, speak_back, leave)\n` +
      (nv.answered ? `YOU: [nv:accept] (follow their gesture — go with them)\n` : `YOU: [nv:nod] (nod slowly)\n`));
  }
  if (spec.verbalTranscript) {
    // A VERBAL day120 transcript (open thread: want): it must NOT enter
    // the Baraka re-check map (r197 fix — the broadened glob would
    // otherwise count English-speaking villagers as comm-'none').
    const v = spec.verbalTranscript;
    fs.writeFileSync(path.join(dir, `${P}transcript-${seed}-day120.txt`),
      `(pre-talk seed: none; takenWantDay=0; convoCount=1)\n` +
      `=== seed ${seed} day 120 — conversation with ${v.name} (${v.vid}) ===\n` +
      `occupation=dockworker temperament=intense trust=27 dead=false\n` +
      `want: curious (stage 1)\n` +
      `open thread: want fromSeed=false\n` +
      `picker: control\n\n` +
      `THEM: "What's something from your old life that's actually useful here?"\n` +
      `(turn0 choices: ans:q_before_skill:a_tell, leave, silence)\n` +
      `YOU: [ans:q_before_skill:a_tell] "Patience."\n`);
  }
}
function baseSpecs() {
  // Lived-days total 141+109+102+67+140+132+121+108 = 920, mean 115.0 =
  // -6.5% vs the control per-seed mean 123, inside the +/-25%
  // guardrail (HOLD). The first four days reuse r204's actual band
  // (alive d141, over d109/d102, scattered d67); the added four keep the
  // mean in range and price the lesser seat 5/8 (bar >=4/8).
  return {
    106337: { days: 141, over: false, rank: 'national', peakStage: 3, stage3Day: 95, lesserDay: 100, raiseOutcome: 'accepted',
      natgate: { lastDay: 141, firstNat: 95, lead: [3, 3], cov: [0, 1], trade: [0, 0] } },
    106338: { days: 109, over: false, rank: 'regional', peakStage: 3, stage3Day: 100, lesserDay: 105, raiseOutcome: 'accepted',
      natgate: { lastDay: 109, firstNat: null, lead: [2, 3], cov: [1, 2], trade: [0, 1], pend: 'lead@120' } },
    106339: { days: 102, over: true, rank: 'regional', peakStage: 2, stage3Day: null, lesserDay: 100, raiseOutcome: null,
      natgate: { lastDay: 102, firstNat: null, lead: [1, 2], cov: [0, 1], trade: [1, 3] } },
    106340: { days: 67, over: true, rank: 'village', peakStage: 1, stage3Day: null, lesserDay: null, raiseOutcome: null,
      natgate: { lastDay: 67, firstNat: null, lead: [0, 0], cov: [0, 0], trade: [0, 0] } },
    106341: { days: 140, over: false, rank: 'regional', peakStage: 2, stage3Day: 105, lesserDay: 110, raiseOutcome: null,
      natgate: { lastDay: 140, firstNat: null, lead: [1, 2], cov: [1, 2], trade: [0, 1] } },
    106342: { days: 132, over: false, rank: 'regional', peakStage: 2, stage3Day: 100, lesserDay: null, raiseOutcome: null,
      natgate: { lastDay: 132, firstNat: null, lead: [2, 3], cov: [0, 1], trade: [1, 2] } },
    106343: { days: 121, over: false, rank: 'regional', peakStage: 2, stage3Day: 98, lesserDay: 115, raiseOutcome: null,
      natgate: { lastDay: 121, firstNat: null, lead: [1, 3], cov: [2, 2], trade: [0, 0] } },
    106344: { days: 108, over: true, rank: 'village', peakStage: 1, stage3Day: null, lesserDay: null, raiseOutcome: null,
      natgate: { lastDay: 108, firstNat: null, lead: [0, 1], cov: [0, 0], trade: [1, 1] } },
  };
}
function buildCorpus(mut) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r227-analyzer-'));
  const specs = baseSpecs();
  if (mut) mut(specs);
  // Guard corpora (vetbar/trust/natgate/capture/betray) are written for
  // BOTH arms from the same specs, but the r288 analyzer is single-arm
  // and reads arm B only — the arm C files are dead weight kept so the
  // fixture builder stays a verbatim clone of r246's. Optional corpora
  // may differ per arm via spec.armB / spec.armC.
  for (const seed of SEEDS) { seedFiles(dir, seed, specs[seed], 'b'); seedFiles(dir, seed, specs[seed], 'c'); }
  return dir;
}
function runAnalyzer(dir) {
  try {
    const out = execFileSync('node', [ANALYZER, dir], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}

// (1) national 1/8 + blocker named -> GO, exit 0.
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(1) national 1/8 exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(1) Q1 NATIONAL GO printed', /Q1 NATIONAL: GO — on-ramp open \(1\/8/.test(r.out), r.out);
  ok('(1) LEAD blocker named for 106338', /106338: .*closest road LEAD 2\/3 seasoned/.test(r.out), r.out);
  ok('(1) raise guard GO', /Q1 SPOKEN-RAISE VERDICT: GO/.test(r.out), r.out);
  ok('(60) playtest QUIET on the base fixture', /Q1 PLAYTEST PANEL VERDICT: QUIET — the wall stands as measured: national 1\/8, table offered 5\/8, full seat 0\/8, wave-5 faced 0\/8, stall 0\/8 seeds \(0d\)/.test(r.out), r.out);
  ok('(60) PANEL national line 1/8', /PANEL national: B=1\/8 tableOffered\(lesser\)=5\/8 fullSeat=0\/8/.test(r.out), r.out);
}
// (67) r276 stall split: a stalled seed that reached national counts
// otherwise-ready; a stalled seed with maxR4 1, no national, maxR5 0
// counts not-ready. 106337 stalls 3d (national from d95, r4=2); 106338
// stalls 2d (regional, r4=l3=1). All rows keep r4==l3 and r5==l4 so the
// VETBAR guard stays GO and the exit stays 0.
{
  const stalledReady = [
    { day: 1, r4: 2, l3: 2, r5: 0, l4: 0, shadow4: 2, shadow5: 0, blooded: false },
    { day: 100, r4: 2, l3: 2, r5: 0, l4: 0, shadow4: 2, shadow5: 1, blooded: false },
    { day: 101, r4: 2, l3: 2, r5: 0, l4: 0, shadow4: 2, shadow5: 1, blooded: false },
    { day: 102, r4: 2, l3: 2, r5: 0, l4: 0, shadow4: 2, shadow5: 1, blooded: false },
  ];
  const stalledNotReady = [
    { day: 1, r4: 1, l3: 1, r5: 0, l4: 0, shadow4: 1, shadow5: 0, blooded: false },
    { day: 100, r4: 1, l3: 1, r5: 0, l4: 0, shadow4: 1, shadow5: 1, blooded: false },
    { day: 101, r4: 1, l3: 1, r5: 0, l4: 0, shadow4: 1, shadow5: 1, blooded: false },
  ];
  const dir = buildCorpus((s) => {
    s[106337].vetbarDaily = stalledReady;
    s[106338].vetbarDaily = stalledNotReady;
  });
  const r = runAnalyzer(dir);
  ok('(67) stall split exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(67) PANEL stall line 2 seeds 5d', /PANEL stall: standing-199 stall seeds=2\/8 stallDays=5 survival=/.test(r.out), r.out);
  ok('(67) stall split ready 3d / not-ready 2d', /PANEL stall split \(seed-level, peak-based — r249: INVALID as written, kept for continuity\): stalled-while-otherwise-ready 3d on 1\/8 seeds; stalled-while-not-ready 2d on 1\/8 seeds/.test(r.out), r.out);
  // (67b) the same fixture under the r276 PER-DAY revision: 106337's
  // stalled days all carry r5=0 (its veterans are dead by then) and
  // 106338's carry r5=0 — per-day ready 0d / not-ready 5d, the exact
  // inversion r249 proved on the wild panel (peak said 113 ready).
  ok('(67b) per-day split ready 0d / not-ready 5d', /PANEL stall split \(r276 per-day revision\): stalled-while-ready \(r5>=2 on the stalled day\) 0d on 0\/8 seeds; stalled-while-not-ready 5d on 2\/8 seeds/.test(r.out), r.out);
}
// (68) r276 per-day stall split: a seed that stalls WHILE holding 2
// living wave-4 killers counts ready on those days; a seed that stalls
// with 1 counts not-ready. 106337 stalls 2d at r5=2 (shadow5=3, so the
// days are stalled days); 106338 stalls 2d at r5=1 (shadow5=2). All
// rows keep r4==l3 and r5==l4 so the VETBAR guard stays GO.
{
  const stalledReadyDay = [
    { day: 1, r4: 2, l3: 2, r5: 2, l4: 2, shadow4: 2, shadow5: 2, blooded: false },
    { day: 100, r4: 2, l3: 2, r5: 2, l4: 2, shadow4: 2, shadow5: 3, blooded: false },
    { day: 101, r4: 2, l3: 2, r5: 2, l4: 2, shadow4: 2, shadow5: 3, blooded: false },
  ];
  const stalledNotReadyDay = [
    { day: 1, r4: 1, l3: 1, r5: 1, l4: 1, shadow4: 1, shadow5: 1, blooded: false },
    { day: 100, r4: 1, l3: 1, r5: 1, l4: 1, shadow4: 1, shadow5: 2, blooded: false },
    { day: 101, r4: 1, l3: 1, r5: 1, l4: 1, shadow4: 1, shadow5: 2, blooded: false },
  ];
  const dir = buildCorpus((s) => {
    s[106337].vetbarDaily = stalledReadyDay;
    s[106338].vetbarDaily = stalledNotReadyDay;
  });
  const r = runAnalyzer(dir);
  ok('(68) per-day stall split exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(68) PANEL stall line 2 seeds 4d', /PANEL stall: standing-199 stall seeds=2\/8 stallDays=4 survival=/.test(r.out), r.out);
  ok('(68) per-day split ready 2d / not-ready 2d', /PANEL stall split \(r276 per-day revision\): stalled-while-ready \(r5>=2 on the stalled day\) 2d on 1\/8 seeds; stalled-while-not-ready 2d on 1\/8 seeds/.test(r.out), r.out);
}
// (2) national 0/8, blockers named -> NO-GO-on-the-wall, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].natgate.firstNat = null; s[106337].natgate.lead = [2, 3];
    s[106337].rank = 'regional';
  });
  const r = runAnalyzer(dir);
  ok('(2) national 0/8 with blockers exit 0', r.code === 0, 'code=' + r.code);
  ok('(2) Q1 NATIONAL NO-GO-on-the-wall printed', /Q1 NATIONAL: NO-GO on the wall, blocker named per seed/.test(r.out), r.out);
}
// (3) not-offered-spoken raise talk -> DEFECT, exit 1.
{
  const dir = buildCorpus((s) => { s[106338].raiseOutcome = 'not-offered-spoken'; });
  const r = runAnalyzer(dir);
  ok('(3) raise defect exit 1', r.code === 1, 'code=' + r.code);
  ok('(3) DEFECT line printed', /DEFECT: journey-scale-r288-b-raisetalk-106338-1\.txt \(not-offered-spoken/.test(r.out), r.out);
}
// (4) vetbar disagreement -> NO-GO, exit 1.
{
  const dir = buildCorpus((s) => { s[106338].vetbarDisagree = true; });
  const r = runAnalyzer(dir);
  ok('(4) vetbar disagreement exit 1', r.code === 1, 'code=' + r.code);
  ok('(4) VETBAR NO-GO printed', /Q3 VETBAR GUARD: NO-GO/.test(r.out), r.out);
}
// (5) no raise talks -> INCOMPLETE, exit 2.
{
  const dir = buildCorpus((s) => { s[106337].raiseOutcome = null; s[106338].raiseOutcome = null; });
  const r = runAnalyzer(dir);
  ok('(5) no raise talks exit 2', r.code === 2, 'code=' + r.code);
  ok('(5) INCOMPLETE printed', /Q1 SPOKEN-RAISE VERDICT: INCOMPLETE/.test(r.out), r.out);
}
// (6) lived-days breach -> exit 1.
{
  const dir = buildCorpus((s) => { for (const sd of SEEDS) s[sd].days = 40; });
  const r = runAnalyzer(dir);
  ok('(6) lived-days breach exit 1', r.code === 1, 'code=' + r.code);
  ok('(6) guardrail BREACH printed', /lived-days guardrail: BREACH/.test(r.out), r.out);
}
// (7) natgate missing on one seed -> ERROR row, exit 0.
{
  const dir = buildCorpus((s) => { s[106338].natgate = null; });
  const r = runAnalyzer(dir);
  ok('(7) missing natgate exit 0', r.code === 0, 'code=' + r.code);
  ok('(7) ERROR row printed', /seed 106338: ERROR \(no natgate file\)/.test(r.out), r.out);
}
// (8) -nv transcript: pre-talk line first, header on line 1, mime shown
// and answered -> trap HOLD, villager named (not the filename).
{
  const dir = buildCorpus((s) => { s[106338].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true }; });
  const r = runAnalyzer(dir);
  ok('(8) -nv mime answered exit 0', r.code === 0, 'code=' + r.code);
  ok('(8) trap guard HOLD', /Q4 TRAP-LINE GUARD: HOLD/.test(r.out), r.out);
  ok('(8) villager named from header, not filename', /Boris \(boris_kowalski\): mime shown=yes, answered=yes/.test(r.out), r.out);
}
// (9) -nv transcript: mime shown, offered, never answered -> guard BREACH.
{
  const dir = buildCorpus((s) => { s[106338].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: false }; });
  const r = runAnalyzer(dir);
  ok('(9) -nv mime unanswered exit 1', r.code === 1, 'code=' + r.code);
  ok('(9) trap guard BREACH printed', /Q4 TRAP-LINE GUARD: BREACH/.test(r.out), r.out);
}
// (10) REGULAR day90 transcript (not -nv) with a mime shown and answered
// -> the trap guard counts it (r197 fix — the Boris 135302 d90 shape).
{
  const dir = buildCorpus((s) => { s[106337].dayTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true }; });
  const r = runAnalyzer(dir);
  ok('(10) regular-transcript mime counted exit 0', r.code === 0, 'code=' + r.code);
  ok('(10) trap sittings 1 answered 1', /trap-line sittings \(driver transcripts\): 1 \(answered 1, defect 0\)/.test(r.out), r.out);
  ok('(10) trap guard HOLD', /Q4 TRAP-LINE GUARD: HOLD/.test(r.out), r.out);
}
// (11) a VERBAL sitting (open thread: want) must not enter the Baraka
// re-check map — only nonverbal sittings count as comm-'none'.
{
  const dir = buildCorpus((s) => {
    s[106338].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true };
    s[106337].verbalTranscript = { name: 'Miguel', vid: 'miguel_santos' };
  });
  const r = runAnalyzer(dir);
  ok('(11) verbal sitting excluded exit 0', r.code === 0, 'code=' + r.code);
  ok('(11) Baraka map counts 1 villager', /comm-'none' villagers seen in driver transcripts: 1/.test(r.out), r.out);
  ok('(11) Miguel not in the Baraka map', !/Miguel \(miguel_santos\): mime/.test(r.out), r.out);
  ok('(11) Boris in the Baraka map', /Boris \(boris_kowalski\): mime shown=yes, answered=yes/.test(r.out), r.out);
}

// (12) -nv transcript: 4x consecutive nv:nod -> nod-loop BREACH, exit 1.
{
  const dir = buildCorpus((s) => { s[106338].nvTranscript = { name: 'Mariko', vid: 'mariko_tanaka', mime: false, answered: false, streak: { gesture: 'nod', count: 4 } }; });
  const r = runAnalyzer(dir);
  ok('(12) 4x nv:nod exit 1', r.code === 1, 'code=' + r.code);
  ok('(12) nod-loop BREACH printed', /Q2 NOD-LOOP GUARD: BREACH/.test(r.out), r.out);
  ok('(12) DEFECT line printed', /DEFECT: journey-scale-r288-b-transcript-106338-day90-nv\.txt \(nod-loop: 4x consecutive nv:nod\)/.test(r.out), r.out);
}
// (13) -nv transcript: 2x consecutive nv:nod -> nod guard HOLD, exit 0.
{
  const dir = buildCorpus((s) => { s[106338].nvTranscript = { name: 'Mariko', vid: 'mariko_tanaka', mime: false, answered: false, streak: { gesture: 'nod', count: 2 } }; });
  const r = runAnalyzer(dir);
  ok('(13) 2x nv:nod exit 0', r.code === 0, 'code=' + r.code);
  ok('(13) nod-loop HOLD printed', /Q2 NOD-LOOP GUARD: HOLD/.test(r.out), r.out);
  ok('(13) worst streak 2x reported', /worst 2x/.test(r.out), r.out);
}
// (14) -nv transcript: 4x consecutive nv:listen -> excluded, exit 0.
{
  const dir = buildCorpus((s) => { s[106338].nvTranscript = { name: 'Mariko', vid: 'mariko_tanaka', mime: false, answered: false, streak: { gesture: 'listen', count: 4 } }; });
  const r = runAnalyzer(dir);
  ok('(14) 4x nv:listen exit 0', r.code === 0, 'code=' + r.code);
  ok('(14) nod-loop HOLD printed', /Q2 NOD-LOOP GUARD: HOLD/.test(r.out), r.out);
}
// (15) tribute ready d90, 51 attempts all veterans-short, payable=1
// -> READY-UNPAYABLE (the M23 shape), exit 0 (measurement, no fail).
{
  const dir = buildCorpus((s) => { s[106337].tribute = { readyDay: 90, attempts: 51, delivered: 0, payableAtReady: 1 }; });
  const r = runAnalyzer(dir);
  ok('(15) ready-unpayable exit 0', r.code === 0, 'code=' + r.code);
  ok('(15) READY-UNPAYABLE printed', /seed 106337: tribute READY-UNPAYABLE \(ready=d90 payableAtReady=1 attempts=51 delivered=0 reasons=\{"veterans-short":51\}\)/.test(r.out), r.out);
}
// (16) tribute delivered d96, 1/1 ok, payable=2 -> DELIVERED, exit 0.
{
  const dir = buildCorpus((s) => { s[106338].tribute = { readyDay: 96, attempts: 1, delivered: 1, payableAtReady: 2 }; });
  const r = runAnalyzer(dir);
  ok('(16) delivered exit 0', r.code === 0, 'code=' + r.code);
  ok('(16) DELIVERED printed', /seed 106338: tribute DELIVERED \(ready=d96 payableAtReady=2 attempts=1 delivered=1 reasons=\{"none":1\}\)/.test(r.out), r.out);
}
// (17) tribute never readies (no tribute files at all) -> NEVER-READY, exit 0.
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(17) never-ready exit 0', r.code === 0, 'code=' + r.code);
  ok('(17) NEVER-READY printed for all seeds', /seed 106337: tribute NEVER-READY/.test(r.out) && /seed 106338: tribute NEVER-READY/.test(r.out), r.out);
}
// (18) spotterWatch snapshot with 2 spotters -> counted, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].spotterWatch = [
      { id: 'a', name: 'Ana', alive: true, foodXpSpotter: 12, spotterSkill: 1 },
      { id: 'b', name: 'Ben', alive: true, foodXpSpotter: 3, spotterSkill: 0 },
      { id: 'c', name: 'Cid', alive: false, foodXpSpotter: 0, spotterSkill: 0 },
    ];
  });
  const r = runAnalyzer(dir);
  ok('(18) spotter snapshot exit 0', r.code === 0, 'code=' + r.code);
  ok('(18) 2 with foodXp.spotter>0 counted', /seed 106337 end: roster 3 \(alive 2\) — foodXp\.spotter>0: 2 \(Ana:12, Ben:3\); spotter skill>=1: 1 \(Ana\)/.test(r.out), r.out);
}
// (19) no spotterWatch (null) -> "unavailable", exit 0 (never a fail).
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(19) missing spotter snapshot exit 0', r.code === 0, 'code=' + r.code);
  ok('(19) unavailable printed', /seed 106337 d90: spotter snapshot unavailable/.test(r.out) && /seed 106337 end: spotter snapshot unavailable/.test(r.out), r.out);
}
// (20) d90 spotterWatch90 with 2 spotters + EMPTY end snapshot
// (collapse band) -> the d90 line counts them, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].spotterWatch90 = [
      { id: 'a', name: 'Ana', alive: true, foodXpSpotter: 12, spotterSkill: 1 },
      { id: 'b', name: 'Ben', alive: true, foodXpSpotter: 3, spotterSkill: 0 },
    ];
    s[106337].spotterWatch = [];
  });
  const r = runAnalyzer(dir);
  ok('(20) d90 spotter exit 0', r.code === 0, 'code=' + r.code);
  ok('(20) d90 counts 2 spotters', /seed 106337 d90: roster 2 \(alive 2\) — foodXp\.spotter>0: 2 \(Ana:12, Ben:3\); spotter skill>=1: 1 \(Ana\)/.test(r.out), r.out);
  ok('(20) end snapshot reads empty', /seed 106337 end: roster 0 \(alive 0\) — foodXp\.spotter>0: 0; spotter skill>=1: 0/.test(r.out), r.out);
}
// (21a) w5inst: one lingerKey fought 3 times + one fresh full-HP wild
// Editor -> MIXED (recurring lingerer plus a fresh spawn), exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].w5inst = {
      fights: [
        { day: 96, via: 'scholar', monsterId: 'editor', wave: 5, ent: { key: 'ling3', id: 'editor', tx: 4, ty: 4, mx: 3, my: 3, hp: 900, maxHp: 1200, veteran: false }, pending: null, feast: null },
        { day: 101, via: 'scholar', monsterId: 'editor', wave: 5, ent: { key: 'ling3', id: 'editor', tx: 4, ty: 4, mx: 4, my: 3, hp: 700, maxHp: 1200, veteran: false }, pending: null, feast: null },
        { day: 110, via: 'scholar', monsterId: 'editor', wave: 5, ent: { key: 'ling3', id: 'editor', tx: 5, ty: 4, mx: 2, my: 2, hp: 700, maxHp: 1200, veteran: false }, pending: null, feast: null },
        { day: 115, via: 'field', monsterId: 'editor', wave: 5, ent: { key: null, id: 'editor', tx: 6, ty: 5, mx: 1, my: 1, hp: 1200, maxHp: 1200, veteran: false }, outcome: 'mFlee', rounds: 3 },
      ],
      monsterDays: [
        { day: 96, monsters: [{ key: 'ling3', id: 'editor', wave: 5, tx: 4, ty: 4, mx: 3, my: 3, hp: 900, maxHp: 1200, veteran: false }] },
        { day: 115, monsters: [{ key: null, id: 'editor', wave: 5, tx: 6, ty: 5, mx: 1, my: 1, hp: 1200, maxHp: 1200, veteran: false }] },
      ],
    };
  });
  const r = runAnalyzer(dir);
  ok('(21a) w5 mixed exit 0', r.code === 0, 'code=' + r.code);
  ok('(21a) MIXED printed', /seed 106337: wave-5 fights 4 \(3 scholar, 1 field\) — MIXED/.test(r.out), r.out);
  ok('(21a) recurring lingerKey named', /recurring 1: ling3 x3/.test(r.out), r.out);
  ok('(21a) hp trajectory printed', /editor hp trajectory: d96:900\/1200 \[ling3\] -> d101:700\/1200 \[ling3\] -> d110:700\/1200 \[ling3\] -> d115:1200\/1200 \(field:mFlee\)/.test(r.out), r.out);
}
// (21b) w5inst: only fresh full-HP fights -> SUCCESSIVE, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106338].w5inst = {
      fights: [
        { day: 98, via: 'scholar', monsterId: 'spoiler', wave: 5, ent: { key: null, id: 'spoiler', tx: 3, ty: 3, mx: 5, my: 5, hp: 1500, maxHp: 1500, veteran: false }, pending: null, feast: null },
        { day: 112, via: 'scholar', monsterId: 'spoiler', wave: 5, ent: { key: null, id: 'spoiler', tx: 7, ty: 2, mx: 2, my: 6, hp: 1500, maxHp: 1500, veteran: false }, pending: null, feast: null },
      ],
      monsterDays: [
        { day: 98, monsters: [{ key: null, id: 'spoiler', wave: 5, tx: 3, ty: 3, mx: 5, my: 5, hp: 1500, maxHp: 1500, veteran: false }] },
        { day: 112, monsters: [{ key: null, id: 'spoiler', wave: 5, tx: 7, ty: 2, mx: 2, my: 6, hp: 1500, maxHp: 1500, veteran: false }] },
      ],
    };
  });
  const r = runAnalyzer(dir);
  ok('(21b) w5 successive exit 0', r.code === 0, 'code=' + r.code);
  ok('(21b) SUCCESSIVE printed', /seed 106338: wave-5 fights 2 \(2 scholar, 0 field\) — SUCCESSIVE/.test(r.out), r.out);
}
// (22) missing w5inst file -> "unavailable", exit 0 (never a fail).
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(22) missing w5inst exit 0', r.code === 0, 'code=' + r.code);
  ok('(22) unavailable printed', /seed 106337: w5-instance corpus unavailable/.test(r.out), r.out);
}
// (24a) sortie corpus on arm B: 2 lingerer days (wave-5 seen both), 1
// sortie called (cleared 1), 1 held on pantry -> counted, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].sortie = { arm: 'B', rows: [
      { day: 103, seen: 2, w5seen: 1, minHp: 60, sumHp: 120, held: null, called: true, cleared: 1, broke: false },
      { day: 110, seen: 1, w5seen: 1, minHp: 90, sumHp: 90, held: 'pantry', called: false, cleared: null, broke: false },
    ] };
  });
  const r = runAnalyzer(dir);
  ok('(24a) sortie arm-B exit 0', r.code === 0, 'code=' + r.code);
  ok('(24a) arm-B seed line counted', /seed 106337: arm=B lingerer days=2 \(wave-5 seen on 2\) sorties called=1 cleared=1 broke=0 held=\{"pantry":1\}/.test(r.out), r.out);
  ok('(24a) SORTIE band line', /SORTIE band: lingerer days=2 \(wave-5 seen on 2\) sorties called=1 held=\{"pantry":1\}/.test(r.out), r.out);
}
// (24b) sortie corpus on arm A (rows present) -> the NOTE fires (the
// step should be inert), exit 0 (measurement only, never a fail).
{
  const dir = buildCorpus((s) => {
    s[106338].sortie = { arm: 'A', rows: [
      { day: 100, seen: 1, w5seen: 0, minHp: 50, sumHp: 50, held: null, called: true, cleared: 1, broke: false },
    ] };
  });
  const r = runAnalyzer(dir);
  ok('(24b) sortie arm-A exit 0', r.code === 0, 'code=' + r.code);
  ok('(24b) arm-A NOTE printed', /NOTE: sortie rows on ARM A — the step should be inert in r239/.test(r.out), r.out);
}
// (25) w5inst: one lingerKey fought twice with falling HP, no fresh
// full-HP fight -> ONE, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].w5inst = {
      fights: [
        { day: 96, via: 'scholar', monsterId: 'editor', wave: 5, ent: { key: 'ling3', id: 'editor', tx: 4, ty: 4, mx: 3, my: 3, hp: 900, maxHp: 1200, veteran: false }, pending: null, feast: null },
        { day: 101, via: 'scholar', monsterId: 'editor', wave: 5, ent: { key: 'ling3', id: 'editor', tx: 4, ty: 4, mx: 4, my: 3, hp: 700, maxHp: 1200, veteran: false }, pending: null, feast: null },
      ],
      monsterDays: [
        { day: 96, monsters: [{ key: 'ling3', id: 'editor', wave: 5, tx: 4, ty: 4, mx: 3, my: 3, hp: 900, maxHp: 1200, veteran: false }] },
        { day: 101, monsters: [{ key: 'ling3', id: 'editor', wave: 5, tx: 4, ty: 4, mx: 4, my: 3, hp: 700, maxHp: 1200, veteran: false }] },
      ],
    };
  });
  const r = runAnalyzer(dir);
  ok('(25) w5 one exit 0', r.code === 0, 'code=' + r.code);
  ok('(25) ONE printed', /seed 106337: wave-5 fights 2 \(2 scholar, 0 field\) — ONE/.test(r.out), r.out);
  ok('(25) recurring lingerKey named', /recurring 1: ling3 x2/.test(r.out), r.out);
}
// (26) w5inst: fresh full-HP fights of two species -> SUCCESSIVE, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106338].w5inst = {
      fights: [
        { day: 98, via: 'scholar', monsterId: 'editor', wave: 5, ent: { key: null, id: 'editor', tx: 3, ty: 3, mx: 5, my: 5, hp: 1200, maxHp: 1200, veteran: false }, pending: null, feast: null },
        { day: 112, via: 'scholar', monsterId: 'spoiler', wave: 5, ent: { key: null, id: 'spoiler', tx: 7, ty: 2, mx: 2, my: 6, hp: 1500, maxHp: 1500, veteran: false }, pending: null, feast: null },
      ],
      monsterDays: [
        { day: 98, monsters: [{ key: null, id: 'editor', wave: 5, tx: 3, ty: 3, mx: 5, my: 5, hp: 1200, maxHp: 1200, veteran: false }] },
        { day: 112, monsters: [{ key: null, id: 'spoiler', wave: 5, tx: 7, ty: 2, mx: 2, my: 6, hp: 1500, maxHp: 1500, veteran: false }] },
      ],
    };
  });
  const r = runAnalyzer(dir);
  ok('(26) w5 successive two-species exit 0', r.code === 0, 'code=' + r.code);
  ok('(26) SUCCESSIVE printed', /seed 106338: wave-5 fights 2 \(2 scholar, 0 field\) — SUCCESSIVE/.test(r.out), r.out);
}
// (27) the lived-days control is the per-seed mean 123 (492/4): the
// base fixture mean 115.0 (total 920 over 8 seeds) is -6.5%, HOLD,
// exit 0 (the guardrail line names the control).
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(27) control 492 exit 0', r.code === 0, 'code=' + r.code);
  ok('(27) guardrail line names 123', /lived-days mean 115\.0 \(total 920 over 8 seeds\) vs control per-seed mean 123 \(-6\.5%; guardrail \+\/-25%\)/.test(r.out), r.out);
}
// (28) single-arm muster: titan slain + wave-4 fights 245 / kills 24 -> Q1 MUSTER
// MOVED, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [
        { day: 85, titan: 'herald', stage: 2, present: true, ready: false, bladesAllied: 0, bladesHaven: 0, called: false, committed: 0, committedVids: [], held: 'short:2', council: { total: 8, need: 10, alliesProj: 5, havenProj: 3, ready: false } },
        { day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: ['ana_ruiz', 'ben_okafor', 'cid_patel'], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } },
      ],
      outcomes: [{ titan: 'herald', day: 110, outcome: 'slain', endDay: 110, result: 'victory' }],
      verbCalls: [
        { day: 85, fn: 'titanWarCouncil', arg: 'herald', ok: true, err: null },
        { day: 86, fn: 'soundTitanCall', arg: 'herald', ok: true, err: null },
        { day: 86, fn: 'titanCommitOwn', arg: 'herald', ok: true, err: null },
        { day: 86, fn: 'titanCommitOwn', arg: 'herald', ok: true, err: null },
      ],
    };
    s[106337].ladderW4 = 35;
  });
  const r = runAnalyzer(dir);
  ok('(28) muster MOVED exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-800));
  ok('(28) MUSTER VERDICT MOVED printed', /Q1 MUSTER VERDICT B: MOVED — the muster slew 1 titan\(s\); wave-4 fights 245 \/ kills 24, living-veteran peak 2, national 1\/8/.test(r.out), r.out);
  ok('(28) band slain=1', /MUSTER band B: .* slain=1/.test(r.out), r.out);
  ok('(28) seed line slain=1', /seed 106337 arm B: titan days=2 called=1 readyDays=1 .* outcomes slain=1 fought=1 refused=0 fled=0/.test(r.out), r.out);
  ok('(28) verb calls counted', /verbCalls=\{"titanWarCouncil":1,"soundTitanCall":1,"titanCommitOwn":2\}/.test(r.out), r.out);
}
// (29) single-arm muster: held short, call never sounded -> NOT-CALLED, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 90, titan: 'herald', stage: 2, present: true, ready: false, bladesAllied: 0, bladesHaven: 0, called: false, committed: 0, committedVids: [], held: 'short:3', council: { total: 7, need: 10, alliesProj: 4, havenProj: 3, ready: false } }],
      outcomes: [{ titan: 'herald', day: 91, outcome: 'refused', detail: { gate: 'muster', have: 0, need: 10 } }],
      verbCalls: [{ day: 90, fn: 'titanWarCouncil', arg: 'herald', ok: true, err: null }],
    };
  });
  const r = runAnalyzer(dir);
  ok('(29) held-short exit 0', r.code === 0, 'code=' + r.code);
  ok('(29) NOT-CALLED printed', /Q1 MUSTER VERDICT B: NOT-CALLED — the call never sounded/.test(r.out), r.out);
  ok('(29) band called=0', /MUSTER band B: .* called=0/.test(r.out), r.out);
}
// (30) single-arm muster: call sounded, coalition fight fled -> FOUGHT-NOT-SLAIN, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: ['ana_ruiz'], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [{ titan: 'herald', day: 95, outcome: 'fled', endDay: 95, result: 'fled' }],
      verbCalls: [{ day: 86, fn: 'soundTitanCall', arg: 'herald', ok: true, err: null }],
    };
  });
  const r = runAnalyzer(dir);
  ok('(30) fight-lost exit 0', r.code === 0, 'code=' + r.code);
  ok('(30) FOUGHT-NOT-SLAIN printed', /Q1 MUSTER VERDICT B: FOUGHT-NOT-SLAIN — the coalition fought but no titan died/.test(r.out), r.out);
  ok('(30) band fought=1 fled=1', /MUSTER band B: .* fought=1 refused=0 fled=1/.test(r.out), r.out);
}
// (31) single-arm muster: titan slain on one ready row -> MOVED, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: [], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [{ titan: 'herald', day: 100, outcome: 'slain', endDay: 100, result: 'victory' }],
      verbCalls: [],
    };
  });
  const r = runAnalyzer(dir);
  ok('(31) slain-one-row exit 0', r.code === 0, 'code=' + r.code);
  ok('(31) MOVED printed', /Q1 MUSTER VERDICT B: MOVED — the muster slew 1 titan\(s\)/.test(r.out), r.out);
}
// (32) muster corpus present on one seed only -> "unavailable" on the
// other seven, missing=7, exit 0 (never a fail).
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 90, titan: 'herald', stage: 2, present: true, ready: false, bladesAllied: 0, bladesHaven: 0, called: false, committed: 0, committedVids: [], held: 'short:1', council: { total: 9, need: 10, alliesProj: 6, havenProj: 3, ready: false } }],
      outcomes: [],
      verbCalls: [],
    };
  });
  const r = runAnalyzer(dir);
  ok('(32) missing muster corpus exit 0', r.code === 0, 'code=' + r.code);
  ok('(32) unavailable printed', /seed 106338 arm B: muster corpus unavailable/.test(r.out), r.out);
  ok('(32) band missing=7', /MUSTER band B: .* missing=7/.test(r.out), r.out);
}
// (33) single-arm muster: a committed Haven blade dies -> committedDeaths=1
// in the cost read, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: ['ana_ruiz', 'ben_okafor', 'cid_patel'], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [{ titan: 'herald', day: 110, outcome: 'slain', endDay: 110, result: 'victory' }],
      verbCalls: [],
    };
    s[106337].deathcensus = { deaths: [{ vid: 'ana_ruiz', day: 115, cause: 'the herald', name: 'Ana' }] };
    s[106337].ladderW4 = 35;
  });
  const r = runAnalyzer(dir);
  ok('(33) committed death exit 0', r.code === 0, 'code=' + r.code);
  ok('(33) committedDeaths=1 with name/day', /seed 106337 arm B: .* committedDeaths=1 \(ana_ruiz d115 the herald\)/.test(r.out), r.out);
  ok('(33) cost read counts 1 committed death on each arm', /COST READ B: committed Haven blades who died: B=1/.test(r.out), r.out);
}
// (34) single-arm march: arrived + fought + slain on a march day -> Q1
// MARCH MOVED, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: ['ana_ruiz', 'ben_okafor', 'cid_patel'], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [{ titan: 'herald', day: 110, outcome: 'slain', endDay: 110, result: 'victory' }],
      verbCalls: [{ day: 86, fn: 'soundTitanCall', arg: 'herald', ok: true, err: null }],
    };
    s[106337].march = {
      rows: [
        { day: 100, titan: 'herald', stage: 2, lair: [7, 4], from: [4, 4], arrived: false, onTile: false, pending: false, held: 'blocked-at:5,4' },
        { day: 110, titan: 'herald', stage: 2, lair: [7, 4], from: [6, 4], arrived: true, onTile: false, pending: true, held: null },
      ],
      outcomes: [{ titan: 'herald', day: 110, outcome: 'slain', endDay: 110, result: 'victory' }],
    };
    s[106337].ladderW4 = 35;
  });
  const r = runAnalyzer(dir);
  ok('(34) march MOVED exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-800));
  ok('(34) MARCH VERDICT MOVED printed', /Q1 MARCH VERDICT B: MOVED — a march-completed fight slew 1 titan\(s\); wave-4 fights 245 \/ kills 24/.test(r.out), r.out);
  ok('(34) band slain-on-march=1', /MARCH band B: .* slain-on-march=1/.test(r.out), r.out);
  ok('(34) seed line fought-on-march=1 slain-on-march=1', /seed 106337 arm B: march days=2 arrived=1 .* fights on-march=1 slain-on-march=1 fights off-march=0 slain-off-march=0/.test(r.out), r.out);
}
// (35) single-arm march: arrived, no meeting (0 fought) -> ARRIVED-NO-FIGHT, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: ['ana_ruiz'], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [{ titan: 'herald', day: 91, outcome: 'refused', detail: { gate: 'muster', have: 0, need: 10 } }],
      verbCalls: [],
    };
    s[106337].march = {
      rows: [
        { day: 95, titan: 'herald', stage: 2, lair: [7, 4], from: [4, 4], arrived: true, onTile: false, pending: false, held: null },
        { day: 96, titan: 'herald', stage: 2, lair: [7, 4], from: [7, 4], arrived: true, onTile: true, pending: false, held: null },
      ],
      outcomes: [{ titan: 'herald', day: 91, outcome: 'refused', detail: { gate: 'muster', have: 0, need: 10 } }],
    };
  });
  const r = runAnalyzer(dir);
  ok('(35) arrived-no-fight exit 0', r.code === 0, 'code=' + r.code);
  ok('(35) ARRIVED-NO-FIGHT printed', /Q1 MARCH VERDICT B: ARRIVED-NO-FIGHT — the march arrived 2 day\(s\) but no coalition fight started/.test(r.out), r.out);
  ok('(35) band arrived=2 fought-on-march=0', /MARCH band B: .* arrived=2 .* fought-on-march=0/.test(r.out), r.out);
}
// (36) single-arm march: arrived + fought + fled (fight lost) ->
// FOUGHT-NOT-SLAIN, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: ['ana_ruiz'], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [{ titan: 'herald', day: 95, outcome: 'fled', endDay: 95, result: 'fled' }],
      verbCalls: [],
    };
    s[106337].march = {
      rows: [{ day: 95, titan: 'herald', stage: 2, lair: [7, 4], from: [5, 4], arrived: true, onTile: false, pending: true, held: null }],
      outcomes: [{ titan: 'herald', day: 95, outcome: 'fled', endDay: 95, result: 'fled' }],
    };
  });
  const r = runAnalyzer(dir);
  ok('(36) fight-lost exit 0', r.code === 0, 'code=' + r.code);
  ok('(36) FOUGHT-NOT-SLAIN printed', /Q1 MARCH VERDICT B: FOUGHT-NOT-SLAIN — the march engaged the coalition fight but no titan died/.test(r.out), r.out);
  ok('(36) band fought-on-march=1 slain-on-march=0', /MARCH band B: .* fought-on-march=1 slain-on-march=0/.test(r.out), r.out);
}
// (37) single-arm march: the muster slew the titan but the march never
// fired (no march rows) -> NO-MARCH, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: [], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [{ titan: 'herald', day: 100, outcome: 'slain', endDay: 100, result: 'victory' }],
      verbCalls: [],
    };
    s[106337].march = { rows: [], outcomes: [] };
  });
  const r = runAnalyzer(dir);
  ok('(37) no-march exit 0', r.code === 0, 'code=' + r.code);
  ok('(37) NO-MARCH printed', /Q1 MARCH VERDICT B: NO-MARCH — the muster completed but the march never fired/.test(r.out), r.out);
}
// (38) march corpus missing on all seeds -> "unavailable", missing=8, exit 0 (never a fail).
{
  const dir = buildCorpus((s) => {
    s[106337].muster = { rows: [], outcomes: [], verbCalls: [] };
  });
  const r = runAnalyzer(dir);
  ok('(38) missing march corpus exit 0', r.code === 0, 'code=' + r.code);
  ok('(38) unavailable printed', /seed 106337 arm B: march corpus unavailable/.test(r.out), r.out);
  ok('(38) band missing=8', /MARCH band B: .* missing=8/.test(r.out), r.out);
}
// (39) single-arm march: fired but never arrived (blocked-at) -> NO-ARRIVAL, exit 0.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: ['ana_ruiz'], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [],
      verbCalls: [],
    };
    s[106337].march = {
      rows: [
        { day: 90, titan: 'herald', stage: 2, lair: [7, 4], from: [4, 4], arrived: false, onTile: false, pending: false, held: 'blocked-at:5,4' },
        { day: 91, titan: 'herald', stage: 2, lair: [7, 4], from: [4, 4], arrived: false, onTile: false, pending: false, held: 'blocked-at:5,4' },
      ],
      outcomes: [],
    };
  });
  const r = runAnalyzer(dir);
  ok('(39) never-arrived exit 0', r.code === 0, 'code=' + r.code);
  ok('(39) NO-ARRIVAL printed', /Q1 MARCH VERDICT B: NO-ARRIVAL — the march step fired but never arrived at a lair/.test(r.out), r.out);
  ok('(39) band march days=2 arrived=0', /MARCH band B: march days=2 arrived=0/.test(r.out), r.out);
}
// (40) LAGGED JOIN (r239 closeout correction): march arrives d137, the
// coalition fight slays the titan d138 while the scholar still stands on
// the lair tile -> the fight IS march-completed, Q1 MARCH MOVED, exit 0.
// A same-day-only join would call this NO-ARRIVAL — the lag is the finding.
{
  const dir = buildCorpus((s) => {
    s[106337].muster = {
      rows: [{ day: 86, titan: 'herald', stage: 2, present: true, ready: true, bladesAllied: 7, bladesHaven: 3, called: true, committed: 3, committedVids: ['ana_ruiz', 'ben_okafor', 'cid_patel'], held: null, council: { total: 10, need: 10, alliesProj: 7, havenProj: 3, ready: true } }],
      outcomes: [{ titan: 'herald', day: 138, outcome: 'slain', endDay: 138, result: 'victory' }],
      verbCalls: [{ day: 86, fn: 'soundTitanCall', arg: 'herald', ok: true, err: null }],
    };
    s[106337].march = {
      rows: [
        { day: 136, titan: 'herald', stage: 2, lair: [7, 4], from: [6, 4], arrived: true, onTile: false, pending: false, held: null },
        { day: 137, titan: 'herald', stage: 2, lair: [7, 4], from: [6, 4], arrived: true, onTile: false, pending: false, held: null },
      ],
      outcomes: [{ titan: 'herald', day: 138, outcome: 'slain', endDay: 138, result: 'victory' }],
    };
    s[106337].ladderW4 = 35;
  });
  const r = runAnalyzer(dir);
  ok('(40) lagged march MOVED exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-800));
  ok('(40) MARCH VERDICT MOVED printed', /Q1 MARCH VERDICT B: MOVED — a march-completed fight slew 1 titan\(s\); wave-4 fights 245 \/ kills 24/.test(r.out), r.out);
  ok('(40) band slain-on-march=1 (lagged)', /MARCH band B: .* slain-on-march=1/.test(r.out), r.out);
  ok('(40) seed line slain-on-march=1 fights off-march=0', /seed 106337 arm B: march days=2 arrived=2 .* fights on-march=1 slain-on-march=1 fights off-march=0 slain-off-march=0/.test(r.out), r.out);
}
// (51)-(55) RETIRED in r244 (see header): the ECHO section is gone.
// (56) SUBCAP GUARD (control behavior): arm B linkraise linked 1 ->
// firedSeeds=0/8; the ANSWERMAIL section reads zeros (the lever stayed
// off), exit 0. The analyzer is single-arm: no arm C lines print.
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(56) subcap guard exit 0', r.code === 0, 'code=' + r.code);
  ok('(56) arm B firedSeeds 0/8', /SUBCAP arm B: firedSeeds=0\/8 linked=8 passedSubCapOff=0 skippedSubCap=112/.test(r.out), r.out);
  ok('(56) answermail stayed off on arm B', /ANSWERMAIL arm B: firedSeeds=0\/8 tends=0 renegAnswers=0/.test(r.out), r.out);
  ok('(56) no arm C lines (single-arm analyzer)', !/arm C:/.test(r.out), r.out);
}
// (57) PLAYTEST INTERESTING via national: arm B national 4/8
// (bar >=3/8) -> Q1 PLAYTEST PANEL VERDICT: INTERESTING, exit 0.
{
  const dir = buildCorpus((sp) => {
    for (const seed of [106341, 106342, 106343]) {
      sp[seed].armB = { natgate: { lastDay: sp[seed].natgate.lastDay, firstNat: 100, lead: [3, 3], cov: sp[seed].natgate.cov, trade: sp[seed].natgate.trade } };
    }
  });
  const r = runAnalyzer(dir);
  ok('(57) panel INTERESTING exit 0', r.code === 0, 'code=' + r.code);
  ok('(57) panel national line 4/8', /PANEL national: B=4\/8 tableOffered\(lesser\)=5\/8 fullSeat=0\/8/.test(r.out), r.out);
  ok('(57) Q1 PLAYTEST VERDICT INTERESTING printed', /Q1 PLAYTEST PANEL VERDICT: INTERESTING — national reached on 4\/8 seeds \(bar >=3\/8\)/.test(r.out), r.out);
}
// (58) PLAYTEST QUIET with RUNG observed: 106341's closest road
// seasons 3/3 without national (RUNG — first observed in r251, in the
// r276-observed set now, so it no longer fires INTERESTING by itself)
// -> Q1 PLAYTEST PANEL VERDICT: QUIET, exit 0.
{
  const dir = buildCorpus((sp) => {
    sp[106341].armB = { natgate: { lastDay: sp[106341].natgate.lastDay, firstNat: null, lead: [3, 3], cov: sp[106341].natgate.cov, trade: sp[106341].natgate.trade } };
  });
  const r = runAnalyzer(dir);
  ok('(58) panel QUIET exit 0', r.code === 0, 'code=' + r.code);
  ok('(58) RUNG blocker named for 106341', /PANEL blockers B: .*106341:RUNG/.test(r.out), r.out);
  ok('(58) Q1 PLAYTEST VERDICT QUIET printed', /Q1 PLAYTEST PANEL VERDICT: QUIET — the wall stands as measured: national 1\/8, table offered 5\/8, full seat 0\/8, wave-5 faced 0\/8, stall 0\/8 seeds \(0d\)/.test(r.out), r.out);
}
// (59) PLAYTEST QUIET on a 0/8-national variant: the wall stands,
// blockers all observed -> Q1 PLAYTEST PANEL VERDICT: QUIET, exit 0.
{
  const dir = buildCorpus((sp) => {
    sp[106337].natgate.firstNat = null; sp[106337].natgate.lead = [2, 3];
    sp[106337].rank = 'regional';
  });
  const r = runAnalyzer(dir);
  ok('(59) panel QUIET exit 0', r.code === 0, 'code=' + r.code);
  ok('(59) Q1 NATIONAL NO-GO-on-the-wall printed', /Q1 NATIONAL: NO-GO on the wall, blocker named per seed/.test(r.out), r.out);
  ok('(59) Q1 PLAYTEST VERDICT QUIET printed', /Q1 PLAYTEST PANEL VERDICT: QUIET — the wall stands as measured: national 0\/8, table offered 5\/8, full seat 0\/8, wave-5 faced 0\/8, stall 0\/8 seeds \(0d\)/.test(r.out), r.out);
}
// (61) BLOCKER FORMATION-LATE: closest road's 3rd link age < 30.
{
  const dir = buildCorpus((sp) => {
    sp[106338].links = [
      { kind: 'primary-sub', primary: true, other: 'village_0', trust: 60, ageDays: 110, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_1', trust: 55, ageDays: 100, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_2', trust: 35, ageDays: 20, status: 'active' },
    ];
    sp[106338].trustevents = [
      'd10 primary-sub village_0 [formed] Emberhold joined Haven as subordinate.',
      'd20 primary-sub village_1 [formed] Stonebridge joined Haven as subordinate.',
      'd89 primary-sub village_2 [formed] Thornfield joined Haven as subordinate.',
    ];
  });
  const r = runAnalyzer(dir);
  ok('(61) blocker FORMATION-LATE exit 0', r.code === 0, 'code=' + r.code);
  ok('(61) FORMATION-LATE line printed', /seed 106338: BLOCKER FORMATION-LATE \(LEAD\) — LEAD 3rd link village_2 formed d89 \(age 20, trust 35\)/.test(r.out), r.out);
}
// (62) BLOCKER TRUST-LOW: 3rd link age >= 30, trust < 40.
{
  const dir = buildCorpus((sp) => {
    sp[106338].links = [
      { kind: 'primary-sub', primary: true, other: 'village_0', trust: 60, ageDays: 110, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_1', trust: 55, ageDays: 100, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_2', trust: 30, ageDays: 80, status: 'active' },
    ];
    sp[106338].trustevents = [
      'd10 primary-sub village_0 [formed] Emberhold joined Haven as subordinate.',
      'd20 primary-sub village_1 [formed] Stonebridge joined Haven as subordinate.',
      'd29 primary-sub village_2 [formed] Thornfield joined Haven as subordinate.',
    ];
  });
  const r = runAnalyzer(dir);
  ok('(62) blocker TRUST-LOW exit 0', r.code === 0, 'code=' + r.code);
  ok('(62) TRUST-LOW line printed', /seed 106338: BLOCKER TRUST-LOW \(LEAD\) — LEAD 3rd link village_2 formed d29 \(age 80, trust 30\)/.test(r.out), r.out);
}
// (63) BLOCKER SNAP: 3 formed, 2 active at end.
{
  const dir = buildCorpus((sp) => {
    sp[106338].links = [
      { kind: 'primary-sub', primary: true, other: 'village_0', trust: 60, ageDays: 110, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_1', trust: 55, ageDays: 100, status: 'active' },
    ];
    sp[106338].trustevents = [
      'd10 primary-sub village_0 [formed] Emberhold joined Haven as subordinate.',
      'd20 primary-sub village_1 [formed] Stonebridge joined Haven as subordinate.',
      'd29 primary-sub village_2 [formed] Thornfield joined Haven as subordinate.',
    ];
  });
  const r = runAnalyzer(dir);
  ok('(63) blocker SNAP exit 0', r.code === 0, 'code=' + r.code);
  ok('(63) SNAP line printed', /seed 106338: BLOCKER SNAP \(LEAD\) — LEAD 3 formed events on 3 villages but only 2 active at end/.test(r.out), r.out);
}
// (64) BLOCKER FORMATION-FEW: fewer than 3 ever formed.
{
  const dir = buildCorpus((sp) => {
    sp[106338].links = [
      { kind: 'primary-sub', primary: true, other: 'village_0', trust: 60, ageDays: 110, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_1', trust: 55, ageDays: 100, status: 'active' },
    ];
    sp[106338].trustevents = [
      'd10 primary-sub village_0 [formed] Emberhold joined Haven as subordinate.',
      'd20 primary-sub village_1 [formed] Stonebridge joined Haven as subordinate.',
    ];
  });
  const r = runAnalyzer(dir);
  ok('(64) blocker FORMATION-FEW exit 0', r.code === 0, 'code=' + r.code);
  ok('(64) FORMATION-FEW line printed', /seed 106338: BLOCKER FORMATION-FEW \(LEAD\) — LEAD 2\/3 ever formed \(2 active\)/.test(r.out), r.out);
}
// (65) BLOCKER RUNG: 3 seasoned on a road but national false.
{
  const dir = buildCorpus((sp) => {
    sp[106338].natgate = { lastDay: 109, firstNat: null, lead: [3, 3], cov: [1, 2], trade: [0, 1], pend: '-@-' };
    sp[106338].links = [
      { kind: 'primary-sub', primary: true, other: 'village_0', trust: 60, ageDays: 110, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_1', trust: 55, ageDays: 100, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_2', trust: 50, ageDays: 90, status: 'active' },
    ];
    sp[106338].trustevents = [
      'd10 primary-sub village_0 [formed] Emberhold joined Haven as subordinate.',
      'd20 primary-sub village_1 [formed] Stonebridge joined Haven as subordinate.',
      'd29 primary-sub village_2 [formed] Thornfield joined Haven as subordinate.',
    ];
  });
  const r = runAnalyzer(dir);
  ok('(65) blocker RUNG exit 0', r.code === 0, 'code=' + r.code);
  ok('(65) RUNG line printed', /seed 106338: BLOCKER RUNG \(LEAD\) — LEAD 3\/3 seasoned but national false \(pend -@-\)/.test(r.out), r.out);
}
// (66) BLOCKER COLLAPSE + NATIONAL on the base fixture.
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(66) blocker COLLAPSE+NATIONAL exit 0', r.code === 0, 'code=' + r.code);
  ok('(66) COLLAPSE line printed', /seed 106339: BLOCKER COLLAPSE \(village over d102\)/.test(r.out), r.out);
  ok('(66) NATIONAL line printed', /seed 106337: BLOCKER NATIONAL \(national from d95\)/.test(r.out), r.out);
}
// (67) Q2-WINPLAN LAUNCHES: one seed carries a winPlanEnd snapshot with a
//       departed trio -> Q2-WINPLAN PANEL verdict WINPLAN-LAUNCHES.
{
  const dir = buildCorpus((sp) => {
    sp[106337].winPlanEnd = { ignited: true, stats: { planSeeds: 1, partyInvites: 2, partyDepartures: 1, partyTrios: 1, partyQuads: 0, partyFights: 1, planReseeds: 0, planExpiries: 0, stageAdvances: 2, gearHolds: 0 }, plans: [{ vid: 'v1', name: 'Asha', stage: 'seek', target: 'wave-4', partySize: 3 }] };
  });
  const r = runAnalyzer(dir);
  ok('(67) WINPLAN-LAUNCHES exit 0', r.code === 0, 'code=' + r.code);
  ok('(67) WINPLAN PANEL printed', /Q2-WINPLAN PANEL: planSeeds=1 on 1\/1 seeds partyDepartures=1 on 1 seeds \(trios=1 quads=0\) partyFights=1 reseeds=0 expiries=0 -> WINPLAN-LAUNCHES/.test(r.out), r.out);
  ok('(67) WINPLAN SEED line printed', /Q2-WINPLAN-SEED seed=106337 ignited=true storeWoken=true plans=\[Asha:seek\/wave-4 party3\] planSeeds=1 invites=2 departures=1 trios=1 quads=0 fights=1 reseeds=0 expiries=0 stageAdv=2 gearHolds=0/.test(r.out), r.out);
}
// (68) Q2-WINPLAN ABSENT: no seed carries winPlanEnd -> no Q2-WINPLAN PANEL line.
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(68) WINPLAN-ABSENT exit 0', r.code === 0, 'code=' + r.code);
  ok('(68) no WINPLAN PANEL when field absent', !/Q2-WINPLAN PANEL:/.test(r.out), r.out);
}
// (69) Q2-WINPLAN null-err: one seed carries winPlanEnd null -> err line, AWAKE-EMPTY.
{
  const dir = buildCorpus((sp) => {
    sp[106338].winPlanEnd = null;
  });
  const r = runAnalyzer(dir);
  ok('(69) WINPLAN null-err exit 0', r.code === 0, 'code=' + r.code);
  ok('(69) WINPLAN err line printed', /Q2-WINPLAN-SEED seed=106338 err=null-winPlanEnd/.test(r.out), r.out);
  ok('(69) WINPLAN AWAKE-EMPTY verdict', /Q2-WINPLAN PANEL: planSeeds=0 on 0\/1 seeds partyDepartures=0 on 0 seeds \(trios=0 quads=0\) partyFights=0 reseeds=0 expiries=0 -> WINPLAN-AWAKE-EMPTY/.test(r.out), r.out);
}
// (70) BLOCKER UNKNOWN still fires INTERESTING: 3 links seasoned by
// the numbers (age >= 30, trust >= 40) but the natgate says 2/3 — the
// classifier cannot name the blocker (a taxonomy miss).
{
  const dir = buildCorpus((sp) => {
    sp[106338].natgate = { lastDay: 109, firstNat: null, lead: [2, 3], cov: [1, 2], trade: [0, 1], pend: '-@-' };
    sp[106338].links = [
      { kind: 'primary-sub', primary: true, other: 'village_0', trust: 60, ageDays: 110, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_1', trust: 55, ageDays: 100, status: 'active' },
      { kind: 'primary-sub', primary: true, other: 'village_2', trust: 50, ageDays: 90, status: 'active' },
    ];
    sp[106338].trustevents = [
      'd10 primary-sub village_0 [formed] Emberhold joined Haven as subordinate.',
      'd20 primary-sub village_1 [formed] Stonebridge joined Haven as subordinate.',
      'd29 primary-sub village_2 [formed] Thornfield joined Haven as subordinate.',
    ];
  });
  const r = runAnalyzer(dir);
  ok('(70) blocker UNKNOWN exit 0', r.code === 0, 'code=' + r.code);
  ok('(70) UNKNOWN line printed', /seed 106338: BLOCKER UNKNOWN \(LEAD\) — LEAD 3rd link village_2 age 90 trust 50 — seasoned by the numbers but natDiag says 2\/3/.test(r.out), r.out);
  ok('(70) Q1 PLAYTEST VERDICT INTERESTING printed', /Q1 PLAYTEST PANEL VERDICT: INTERESTING — new blocker class: .*106338:UNKNOWN/.test(r.out), r.out);
}
// (71) BLOCKER RUNG-HORIZON: the closest road seasons 3/3 on the FINAL
// recorded day only (rungDay d132 = lastDay) -> RUNG-HORIZON, and the
// panel stays QUIET (the class is observed, not new).
{
  const dir = buildCorpus((sp) => {
    sp[106342].natgate = { lastDay: 132, firstNat: null, lead: [2, 3], cov: [0, 1], trade: [3, 3], pend: '-@-', rungDay: { road: 'trade', day: 132 } };
  });
  const r = runAnalyzer(dir);
  ok('(71) blocker RUNG-HORIZON exit 0', r.code === 0, 'code=' + r.code);
  ok('(71) RUNG-HORIZON line printed', /seed 106342: BLOCKER RUNG-HORIZON \(TRADE\) — TRADE 3\/3 seasoned first on d132 \(final natgate day d132\) — national flip lags a day; would-convert past the horizon \(pend -@-\)/.test(r.out), r.out);
  ok('(71) Q1 PLAYTEST VERDICT QUIET printed', /Q1 PLAYTEST PANEL VERDICT: QUIET — the wall stands as measured: national 1\/8, table offered 5\/8, full seat 0\/8, wave-5 faced 0\/8, stall 0\/8 seeds \(0d\)/.test(r.out), r.out);
}
// (72) DEPARTNAME-GO: capture files carry depart beats with true names
// (0 descriptors) -> DEPARTNAME-GO, exit 0.
{
  const dir = buildCorpus((sp) => {
    sp[106337].capture = [
      'Raul sets out with Ruby — the fire marks the trail.',
      'Carlos sets out with Ruby — the fire marks the trail.',
      'Sean sets out with Ethan — the fire marks the trail.',
      'Mara is hunting the Cancellation now — the fire found a new trail.',
      'Mara was ready to hunt the Cancellation — but the fire says that kind is already put down, and no one has seen another trail. The hunt is called off.',
    ];
    sp[106338].capture = ['Ethan sets out with Lucas — the fire marks the trail.'];
  });
  const r = runAnalyzer(dir);
  ok('(72) departname GO exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(72) DEPARTNAME-GO printed', /Q2-DEPARTNAME PANEL: beats=6 depart=4 descriptors=0 \(r276 baseline 2\/98\) -> DEPARTNAME-GO/.test(r.out), r.out);
  ok('(72) per-seed depart counts', /Q2-DEPARTNAME-SEED seed=106337 beats=5 depart=3 reseedLaunch=1 reseedExpiry=1 descriptors=0/.test(r.out), r.out);
}
// (73) DEPARTNAME-REGRESSION: one depart beat names a stranger descriptor
// (the r276 wild shape: "A woman, maybe 30s sets out with Ethan") ->
// DEFECT line printed, exit 1.
{
  const dir = buildCorpus((sp) => {
    sp[106337].capture = ['Raul sets out with Ruby — the fire marks the trail.'];
    sp[106338].capture = ['A woman, maybe 30s sets out with Ethan — the fire marks the trail.'];
  });
  const r = runAnalyzer(dir);
  ok('(73) departname regression exit 1', r.code === 1, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(73) DEPARTNAME-REGRESSION printed', /Q2-DEPARTNAME PANEL: beats=2 depart=2 descriptors=1 \(r276 baseline 2\/98\) -> DEPARTNAME-REGRESSION/.test(r.out), r.out);
  ok('(73) DEFECT line quotes the beat', /DEFECT depart-beat descriptor: A woman, maybe 30s sets out with Ethan/.test(r.out), r.out);
}
// (74) DEPARTNAME missing capture: one seed has no capture file at all ->
// missing-capture line, still DEPARTNAME-GO, exit 0 (old fixtures carry
// no capture files; a missing file is never a failure).
{
  const dir = buildCorpus((sp) => {
    sp[106337].capture = ['Raul sets out with Ruby — the fire marks the trail.'];
  });
  fs.unlinkSync(path.join(dir, 'journey-scale-r288-b-capture-106338.txt'));
  const r = runAnalyzer(dir);
  ok('(74) departname missing-capture exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(74) missing-capture line printed', /Q2-DEPARTNAME-SEED seed=106338 missing-capture/.test(r.out), r.out);
  ok('(74) DEPARTNAME-GO printed', /Q2-DEPARTNAME PANEL: beats=1 depart=1 descriptors=0 \(r276 baseline 2\/98\) -> DEPARTNAME-GO/.test(r.out), r.out);
}
// (75) DEPARTNAME defense-line exclusion: defense narration says
// "2 put down, 2 driven off" — it must NOT count as a reseed-expiry
// beat (the r288 wild corpus carries 79 such lines, 0 real beats).
{
  const dir = buildCorpus((sp) => {
    sp[106337].capture = [
      'Raul sets out with Ruby — the fire marks the trail.',
      '🛡️ Irving, Nicole, Francisco and Aroha met them at the door — 2 put down, 2 driven off. Irving, Nicole, Francisco are hurt.',
    ];
  });
  const r = runAnalyzer(dir);
  ok('(75) defense line excluded exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(75) beats=1 depart=1 reseedExpiry=0', /Q2-DEPARTNAME-SEED seed=106337 beats=1 depart=1 reseedLaunch=0 reseedExpiry=0 descriptors=0/.test(r.out), r.out);
}
// (76) GUNS: two seeds carry end-of-seed gun censuses (mixed locations)
// -> band total sums, per-seed location splits print, exit 0 (descriptive,
// no bar — the section never fails the run).
{
  const dir = buildCorpus((sp) => {
    sp[106337].guns = { total: 3, locations: [{ loc: 'equipped', vid: 'v1', count: 1, cells: 2 }, { loc: 'carried', vid: 'v2', count: 1 }, { loc: 'stash', section: 'weapons', count: 1 }] };
    sp[106338].guns = { total: 1, locations: [{ loc: 'scholar-pack', vid: '__scholar__', count: 1 }] };
  });
  const r = runAnalyzer(dir);
  ok('(76) guns exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(76) guns panel total', /Q5-GUNS PANEL: band total=4 over 2\/8 seeds \(descriptive — no r279 control number\)/.test(r.out), r.out);
  ok('(76) guns per-seed split 106337', /Q5-GUNS-SEED seed=106337 day=141 total=3 byLoc=\{"equipped":1,"carried":1,"stash":1\}/.test(r.out), r.out);
  ok('(76) guns per-seed split 106338', /Q5-GUNS-SEED seed=106338 day=109 total=1 byLoc=\{"scholar-pack":1\}/.test(r.out), r.out);
  ok('(76) guns missing-census for the rest', /Q5-GUNS-SEED seed=106339 missing-census/.test(r.out), r.out);
}
// (77) GUNS missing census: no seed carries a guns file at all ->
// missing-census lines, band total 0 over 0/8, still exit 0 (a missing
// file is unknown, never 0-counted as a defect).
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(77) guns missing exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(77) guns panel 0 over 0', /Q5-GUNS PANEL: band total=0 over 0\/8 seeds \(descriptive — no r279 control number\)/.test(r.out), r.out);
  ok('(77) guns missing-census printed', /Q5-GUNS-SEED seed=106337 missing-census/.test(r.out), r.out);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
