# Journey endgame r53 — COMMIT-GATE SNAPSHOT + vFlee DESIGNED PROVEN + SECOND VETERAN STILL 1 SHORT (lane B, 2026-10-26)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-26/journey-endgame-r53-prereg.md (written
BEFORE any play). Instrument + gate snapshot, probe-local read-only; no
src/js changes. Merged locally, pending ship.

## Leg question (r52's three named items, in order)

1. The vetcommit commit gate — why does a policy-observed fight never
   commit?
2. vFlee split + withdrawal detector — positive cases?
3. The second veteran — does any village reach 2 living veterans?

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: >=5/7 reach the window or a voiced non-table path.
- M2 CENSUS COMPLETE: every census fight carries a primary outcome, AND
  >=2/3 Arm A waves seeds record >=1 census fight.
- M2b ATTRIBUTION: every dieFlag fight classified causal-vs-daywindow;
  >=1 dieFlag fight carries >=1 NAMED fight-causal death.
- M2c ENGINE COVERAGE: census fights == distinct wave-4 opens
  (engine + policy-only), AND censusErrors == 0.
- M2d COMMIT-GATE NAMED (new): every committed=false census fight
  carries a gate classification: 'never-observed', 'gate:<component>',
  or 'gate-passed-uncommitted'.
- M3 CONVERSION: Arm B total wave-4+ kills > Arm A total wave-4+ kills.
- M3b LIVING VETERAN: >=1/6 waves seeds ends with >=1 LIVING veteran.
- M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 or the full seat.
- M5 VOICING CANONICAL: 88084 control crossings >= 1 AND noticed >= 1.
- M6 GUARD NAMED (deferred scope): every sat waves seed with deferDays
  >= 1 records a named window-end guard (not 'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON: every mFlee census fight matched to its monster's
  codex counter text.
- M9 SUPPLY: every wave-4 arrival that does not become a fight recorded
  with its cause line, or the code rule cited.
- REG: r35 auditNamed on sat seeds with nonzero w4/w5; r37 satPenalty
  present + voiced-line match on sat seeds.

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | uw |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|----|
| 88081 | waves | d90 | d100 | lesser | witness/light | yes | 3: talkDown2 vFlee1 | 0 | 0 | 4 |
| 88082 | waves | d90 | d90 | lesser | feared/light | yes | 8: otherEnd2 vDie3 mFlee1 vKill2 | 2 | 1 | 4 |
| 88083 | waves | d90 | d107 | lesser | beloved/light | yes | 0 | 0 | 0 | 3 |
| 88084 | forcedrift | — | — | — | — | no (village-lost) | 7 (control) | 3 | 0 | 4 |
| 88085 | wavesnw | d90 | d99 | lesser | beloved/light | yes | 2: vFlee2 | 0 | 0 | 4 |
| 88086 | wavesnw | — | — | — | — | no (village-lost) | 7: otherEnd1 vKill4 vFlee2 | 4 | 1 | 4 |
| 88087 | wavesnw | d90 | d97 | lesser | feared/light | yes | 1: mFlee1 | 0 | 0 | 4 |

- **M1 GUARD: GO 7/7** — 5 announced; 88084 and 88086 resolve via
  honest death (village-lost).
- **M2 CENSUS: GO** — every one of the 21 waves-seed census fights
  carries a primary outcome; 2/3 Arm A seeds recorded fights (88083
  is the explained zero: uw3, never reached wave 4).
- **M2c ENGINE COVERAGE: GO 6/6** — fights == opens on every waves
  seed, censusErrors 0 everywhere, policy-only opens 0 (every fight
  this run opened through startCombat).
- **M2d COMMIT-GATE NAMED: GO 5/5** — every committed=false fight
  classified (see below). The r52 mystery is closed on real data.
- **M2b ATTRIBUTION: GO 3/3** — all three dieFlag fights carry a
  NAMED fight-causal arena death (below).
- **M3 CONVERSION: GO 4 vs 2** — Arm B's conversion edge is back:
  88086 alone killed 4 wave-4s on the fight-don't-talk road, vs
  Arm A's 2 (both 88082).
- **M3b LIVING VETERAN: GO 2/6** — Ingrid Vik (88082, influencer
  d86, living, bearer) and gen_jxcgw15 (88086, 4 kills, living).
  Second straight GO on living veterans.
- **M4 WAVE-5/FULL: NO-GO 0/6** — wave 5 still locked everywhere;
  the full seat still unoffered. The wall is now one veteran thick
  on 88086 (see below).
- **M5 VOICING CANONICAL: GO 1/1** — 88084: bandCrossings 1,
  noticed 1, even though the village died before the window (the
  control's relay-grey voicing fires on the road, not only at the
  seat — worth noting: the canonical control's voicing does not
  require a sit).
- **M6 GUARD NAMED: GO 4/4** — deferred sat waves end on hp
  (88081, 88087), losses (88083), not-ready (88085).
- **M7 PEOPLE: GO** — 2 finals sense-read in full (below),
  0 senseless flags.
- **M8 EXIT CANON: GO** — both mFlee fights matched (88082 strike,
  88087 congregation).
- **M9 SUPPLY: GO (mechanism re-confirmed)** — 108 boundary blocks,
  all the same contention line (below).
- **PRIMARY: NO-GO** (M4 only). **ALL: NO-GO** (M4 only).

## THE HEADLINE: THE GATE HAS THREE ANSWERS, NOT ONE

The 5 committed=false fights split three ways — and the split IS the
answer to r52's question ("why does a policy-observed fight never
commit?"):

1. **NEVER-OBSERVED ×3 — the daily-round driver, not a gate failure.**
   88081 eater d84 (talkDown), 88081 algorithm d88 (talkDown), 88082
   eater d66 (otherEnd). All three opened and closed inside one daily
   via finishLiveFight: policy never saw a turn, so the gate was never
   evaluated. And the gate snapshot at open says it WOULD have passed
   (commitLive true, hp 0.75 / 0.604 / 0.63, uw 4, veterans short).
   These fights were never commitment candidates at all — the
   daily-round path bypasses policy.fight entirely. r52's 88076
   Reunion (observed, uncommitted) is NOT this class; see (2).
2. **GATE:HP ×2 — the scholar was too hurt for the commit guard.**
   88082 eulogy d81 (otherEnd, observed): hp 0.496 at first
   observation — four-tenths of a percent below the 0.5 line. The
   near-miss that proves the guard is a real threshold, not a
   rounding artifact: at 0.500 it commits, at 0.496 it does not.
   88086 influencer d80 (vKill, observed): hp 0.17 — badly hurt, no
   commit, and the party killed anyway. Commitment is not required
   for kills; the guard is a bravery throttle, not a kill switch.
3. **GATE-PASSED-UNCOMMITTED ×0** — no fight this run passed the
   gate at observation yet stayed uncommitted. The wrapper-path
   finding did not occur; the two classes above exhaust the data.

So r52's 88076 Reunion (5 turns observed, never committed) now has
its candidate explanations narrowed to exactly this shape: either its
scholar HP was under 0.5 on every observed turn (the 88082/88086
pattern), or it never passed through a committing policy.fight turn
despite observation. r53's snapshot distinguishes those two on every
future fight; no new instrument is needed for this question.

## THE vFlee SPLIT IS PROVEN (r52's awaiting-positive-case item: DONE)

Three vFlee fights classified 'designed' with real escape lines
behind them — the split no longer runs on zero positives:
- 88081 reunion d97 (waves, committed, engine+policy): 'designed'.
- 88085 eulogy d80 (wavesnw, committed): 'designed'.
- 88085 eater d83 (wavesnw, committed): 'designed'.
The class's lines, quoted from 88081's transcript: "🚪 BARRIER
CROSSED — you crash through to a new area. The pursuit falters
behind you — they give up the chase. (You fled the fight by leaving
the area.)" The suburb-style designed escape is a real, reachable
exit on both arms — not a label the splitter invented. The remaining
vFlee fights this run (88086 eulogy d94, algorithm d108) are
'break' — party breaks, correctly separated.

## THE WITHDRAWAL DETECTOR STILL WAITS (honest zero)

Zero withdrawals again (all seven withdrawal fields null). The
detector shipped in r52 and carried in r53 has now run 14 seeds
without a positive case — because every surviving seed announced and
every non-surviving seed died honestly. The detector is installed,
not proven; it needs a below-the-bar seed to fire. Not claimed.

## THE SECOND VETERAN: THE WALL IS ONE VETERAN THICK (88086)

- **88086 (wavesnw, village-lost)** is the closest village to wave 5
  yet measured: rd5short = ['veterans'] ONLY — armor met (4/4),
  weapons met (6/6), tricks met (3/3). It holds exactly 1 of the 2
  veterans the bar wants (gen_jxcgw15, 4 kills: algorithm d69,
  reunion d76 + d79, influencer d80 — all living at run end). The
  village then bled out before announcing (3 fallen: Landon, Diana,
  Solokha) — the kills didn't convert to a seat because the village
  died first. The road question sharpens: the second veteran is now
  the ONLY missing piece on a village that met every other bar.
- **88082 (waves, won feared/light)** holds 1 veteran too (Ingrid
  Vik, influencer d86, living, bearer) — but its bar is wider:
  rd5short = armor, weapons, veterans. Standing 199, same as r52's
  pair. Its second killer, Brian Otieno (congregation d76), died in
  the arena d79 — the veteran story in one village: one killer lives
  (the bearer), one killer dies (the companion).
- **M3's edge is back (4 vs 2)** because 88086 killed 4× on the
  fight-don't-talk road while 88085/88087 killed 0 — the variant's
  edge concentrates on the seeds that actually fight, it does not
  lift every wavesnw seed. r52's tie was a one-seed-block effect.

## WHO DIES IN WAVE-4 FIGHTS (M2b — all named, all arena)

- 88082 d68 reunion+reunion: **Salvador Morales** — registerDeath,
  cause 'the arena'.
- 88082 d75 reunion: **Henry Zhang** — registerDeath, 'the arena'.
- 88082 d79 reunion: **Brian Otieno** — registerDeath, 'the arena'
  (the d76 congregation killer; the fallen ledger dates his death
  d80, the fight straddling the day boundary).
- The arena is where wave-4 deaths happen again this run — field
  wave-4 deaths: zero. The reunion is the lethal one: all three
  deaths are reunions.

## THE FULL FIGHT DISTRIBUTION (21 waves fights)

talkDown 2, vFlee 5, otherEnd 3, vDie 3, mFlee 2, vKill 6.
Read against r52 (9 fights: talkDown 4, vKill 2, vDie 2, mFlee 1):
the class is the same (all drivers, engine census), so this IS road
movement on the same instrument — the road got bloodier (6 kills vs
2, 3 deaths vs 2) and more flee-heavy (5 vFlee vs 0), because 88082
and 88086 actually fought. The talkDown share fell (2/21 vs 4/9)
because fewer fights resolved by talk on this seed block, not
because talk stopped working.

## ENCOUNTER SUPPLY (M9 — contention, again)

108 boundary blocks across 7 seeds, every one the same line: "The
<monster> stops at the boundary — pacing, unwilling. Something else
is already here. It's still out there." (The Big Big, The Anaconda
Empress, The Static Kite, The Paparazzo, ...). Same rule as r51/r52
(ONE MONSTER PER TILE + Haven safe law): wave-4s arrive, get held
at boundaries by lesser occupants, and sometimes never get a free
tile. 88083's counter-case (10 blocks, 0 fights, uw3) shows the
other side: sometimes they simply don't arrive before the run ends.

## VILLAGE ASSESSMENT (plain words)

- **88081 — 10 alive, won witness/light.** The talking village:
  2 daily-round talkDowns (eater, algorithm — never observed, gate
  live at open), 1 designed reunion escape. Sat d100 on hp after a
  10-day deferral. The village that proves the daily-round path
  exists and talk works there.
- **88082 — 3 alive, won feared/light.** The bleeding village: 8
  fights, 2 kills (Brian's congregation, Ingrid's influencer), 3
  arena deaths (Salvador, Henry, Brian — all reunions), sat the day
  it announced on roster (3 alive). The village that proves killing
  costs: one killer lives, one dies, three more die trying.
- **88083 — 8 alive, won beloved/light.** The untouched village:
  never reached wave 4 (uw3), 0 fights, sat d107 on losses after a
  17-day deferral. Its zero is honest — the census would have
  caught a fight had one opened.
- **88084 — village-lost (control).** The control that died anyway:
  7 engine fights (3 kills), bandCrossings 1, noticed 1 — the
  relay-grey voicing fires on the road even when the village dies
  before the window. The control's death is honest (4 alive at the
  end), not a silent failure.
- **88085 — 6 alive, won beloved/light.** The escaping village: 2
  designed vFlee escapes (eulogy, eater), sat d99 on not-ready.
  The village that proves the designed escape is reachable on the
  fight-don't-talk road.
- **88086 — village-lost.** The almost-there village: 4 kills, 1
  living veteran, every wave-5 bar met except veterans 1/2 — and
  the village bled out before announcing. The run's sharpest
  finding: the second veteran is now the only wall, and villages
  can die with the wall half-built.
- **88087 — 8 alive, won feared/light.** The quiet village: 1
  congregation mFlee, sat d97 on hp. Nothing missing that the road
  could have reached.
- Who leads: the bearer, always — no succession this run (88082's
  bearer Ingrid Vik is herself the living veteran). Who is
  miserable: 88082's 3 survivors and 88086's dead. What is missing:
  a second veteran per village (the wave-5 bar); a withdrawal case
  to prove the withdrawal detector; a gate-passed-uncommitted case
  (not observed this run — the class may be empty by construction).

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The feared mercy (88082, full window).** The audit prices
   honestly ("3 wave-4 fought"; wave-5 bar "1 of 2 veterans"; "3 of
   5 armed"), the war-path line veils the congregation kill as
   "Big Ugly" (knowledge-gating, carried wart from r52 — the audit
   veils monster names the bearer hasn't learned), the mercy final
   resolves ("the terror stays, pledged now: a shield over every
   village, forever"), and the Oversight coda lands with its sting
   ("The mourners asked you, and you changed the subject... You did
   it on purpose, because you were busy"). PASS.
2. **The witness charges (88081, full window).** "You read every
   name. The named ones are in the audience. The audience does the
   flinching for them, which is worse." The charges final resolves
   ("Your own ledger sits in evidence beside theirs. That's why it
   worked"), the Architect beat credits facilitation honestly
   ("Dmitri Sokolov ascended through doors you built: relay. The
   galaxy will remember the god's name. The village will remember
   who built the door"), and the Oversight coda varies from 88082's
   ("The System put a pod on the screen, and you let the segment
   play") — the coda is not a static stamp. PASS.
- 0 senseless flags. No fabricated shared history in the read
  passages. Wart (carried): the audit's war-path epithet veil
  ("Big Ugly" for the Congregation kill) — a reader comparing audit
  to census must know the veil exists.

## BLANKS

- FILLED (instrument): the commit-gate snapshot — 5/5
  committed=false fights classified (3 never-observed, 2 gate:hp).
  r52's question ("what gates vetcommit's commit flag on a
  policy-observed fight?") is answered: the HP guard (0.5 line,
  proven by the 0.496 near-miss) and, for engine-only fights, the
  driver path itself (policy never evaluates the gate).
- FILLED (instrument, positive cases): the vFlee split — 3
  'designed' escapes with quoted barrier lines, separated from 2
  'break' flees on the same run.
- DOCUMENTED (instrument gap, carried): the withdrawal detector —
  14 seeds (r52+r53) without a positive case. It needs a
  below-the-bar seed; until then it is installed, not proven.
- DOCUMENTED (road question, carried): the second veteran — 88086
  met every wave-5 bar except veterans 1/2, then died. The next run
  asks whether any village banks the second veteran before dying.
- DOCUMENTED (control note): 88084's relay-grey voicing fires
  without a sit (crossings 1, noticed 1, village-lost) — the
  canonical control's voicing is road-level, not seat-level.

## Metric review (§14)

1. **M2d's GO is the run's instrument win** — 5/5 with two distinct
   classes, and the 0.496 near-miss proves the HP guard is a live
   threshold. The 'gate-passed-uncommitted' class came back empty:
   either the class is empty by construction (a fight whose gate
   passes at observation gets its flags set that same turn), or it
   needs a seed where the gate passes but the wrapper's monster
   lookup disagrees with the census's. Kept as a class; a second
   empty run would ask whether to retire it.
2. **M3's GO restores the variant's edge (4 vs 2)** — r52's tie was
   a one-block effect, not the variant's death. The edge
   concentrates: 88086 killed 4×, 88085/88087 killed 0. Next run
   keeps M3 as written.
3. **M3b's second GO (2/6)** — living veterans are now the norm on
   killer seeds (r52: 2/6, r53: 2/6), not the exception. The veteran
   story is now a counting problem (2 per village), not a survival
   problem — 88086 proves it.
4. **M4 stays binding and unmet (0/6)** — eighth run at zero wave-5
   openings, but the binding constraint is now a single named bar
   on the closest village (88086: veterans 1/2, everything else
   met), not a general "nothing reaches."
5. **M5's GO on a dead control** — the control died yet crossed and
   noticed. If M5 is meant to prove the canonical control's
   voicing, it passes on road-level voicing; if it is meant to
   prove a clean control run, the control's death is the caveat.
   Kept as written; the caveat is recorded here.
6. **Telemetry deviation check:** tool reports LOUD on both metrics
   (see below). VERDICT: EXPLAINED (guard-ended windows, penalties
   0–17), baseline NOT rolled. Same verdict as r48–r52, same reason:
   the baseline describes long-deferral sits (r37), not this run's
   guard-ended windows. NEXT-RUN PROPOSAL (metric review, not a
   mid-run re-score): re-seed the baseline from a same-regime
   guard-ended corpus and record the regime in the file, as the
   baseline's own note directs.
7. **Balanced panel (§15):** no panel comparison applies — zero
   src/js changes, no lever moved on the default path (NOWALKIN
   default off, census + gate snapshot are read-only
   instrumentation). The comparison is r52→r53 via identical
   substrate plus the gate snapshot (field addition, not a class
   change), and Arm A→Arm B on one variable.

## Regressions / checks

- PILOT (88081 Arm A + 88085 Arm B, 180d sweep mode): gate SATISFIED
  — 88081 recorded 3 census fights, 88085 recorded 2 (including the
  first 'designed' vFlee positives), so the 7-seed sweep ran.
- DET (instrument-on twice, 2x120d, seed 88081, final probe code):
  GREEN byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry): GREEN byte-identical (90d, won true,
  alive 8, pantry 9582 both sides).
- Existing suites: check.js --quick — (log
  evidence/2026-10-26/journey-endgame-r53-check-quick.log in goal
  hidden_files; see final counts below — the run changed no src/js,
  so any failures are pre-existing unless the log says otherwise).
- Telemetry deviation check: LOUD on both metrics — VERDICT:
  EXPLAINED, baseline NOT rolled (see Metric review 6).

## Telemetry deviation check (2026-10-26)

- Tool verdict: LOUD on both metrics (7 files, 2 metrics).
  - maxTier: baseline 16 -> current 5 (sum of per-seed maxTier
    1+0+2+0+1+0+1; each seed's own max is 0–2).
  - satPenalty: baseline 0 (tool parse quirk, see r52 metric review)
    -> current 49 (sum of tier+losses+penalty fields: tiers 5 +
    losses 6 + penalties 38).
- Per-seed reading: maxTier values 1,0,2,0,1,0,1; penalties 4,0,17,
  0,13,0,4 — the same guard-ended population as r48–r52, NOT
  long-deferral sits. VERDICT: EXPLAINED; baseline NOT rolled.

## Evidence

- evidence/2026-10-26/journey-endgame-r53.md (this note)
- evidence/2026-10-26/journey-endgame-r53-prereg.md
- evidence/2026-10-26/perseed-endgame-r53/endgame-r53-{88081..88087}.json
- evidence/2026-10-26/perseed-endgame-r53/endgame-r53-{88081..88087}-transcript.txt
- journey-endgame-r53-check-quick.log (in goal hidden_files; NOT
  committed to the repo: check logs are per-run bookkeeping, and the
  repo's evidence dir holds the run note + per-seed files only)
- scripts/probe-endgame-r53-20261026.js
- scripts/analyze-endgame-r53-20261026.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from r50,
  env-gated, default off; no src/js changes this run)
