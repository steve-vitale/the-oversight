# Journey endgame r52 — ENGINE-LEVEL CENSUS + vFlee SPLIT + WITHDRAWAL DETECTOR (lane B, 2026-10-25)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-25/journey-endgame-r52-prereg.md (written
BEFORE any play). Instrument + probe-local read-only wrappers; no src/js
changes. Merged locally, pending ship.

## Leg question (r51's four named instrument items, in order)

1. Engine-level census — do daily-round fights now count?
2. vFlee split by escape line — designed escapes vs party breaks?
3. Withdrawal detector — are table visits that end in withdrawal dated?
4. Wave by data lookup + fight context (arena vs field) as fields?

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: >=5/7 reach the window or a voiced non-table path.
- M2 CENSUS COMPLETE: every census fight carries a primary outcome, AND
  >=2/3 Arm A waves seeds record >=1 census fight.
- M2b ATTRIBUTION: every dieFlag fight classified causal-vs-daywindow;
  >=1 dieFlag fight (if any) carries >=1 NAMED fight-causal death.
- M2c ENGINE COVERAGE (new): census fights == distinct wave-4 opens
  (engine + policy-only), AND censusErrors == 0.
- M3 CONVERSION: Arm B total wave-4+ kills > Arm A total wave-4+ kills.
- M3b LIVING VETERAN: >=1/6 waves seeds ends with >=1 LIVING veteran.
- M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 or the full seat.
- M5 VOICING CANONICAL: 88074 control crossings >= 1 AND noticed >= 1.
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
| 88071 | waves | d99 | d99 | lesser | beloved/light | yes | 0 | 0 | 0 | 3 |
| 88072 | waves | d90 | d91 | lesser | feared/light | yes | 5: talkDown4 vKill1 | 1 | 1 | 4 |
| 88073 | waves | d90 | d90 | lesser | beloved/light | yes | 0 | 0 | 0 | 4 |
| 88074 | forcedrift | d133 | d133 | lesser | relay/dark | yes | 0 (control) | 0 | 0 | 3 |
| 88075 | wavesnw | d90 | d98 | lesser | feared/light | yes | 2: vDie1 vKill1 | 1 | 1 | 4 |
| 88076 | wavesnw | d90 | d97 | lesser | feared/light | yes | 2: vDie1 mFlee1 | 0 | 0 | 4 |
| 88077 | wavesnw | — | — | — | — | no (village-lost) | 0 | 0 | 0 | 3 |

- **M1 GUARD: GO 7/7** — 6 announced; 88077 resolves via honest death
  (village-lost, 1 alive at the end).
- **M2 CENSUS: NO-GO on the second clause, GO on coverage.** Every one
  of the 9 census fights carries a primary outcome (coverage 100%,
  censusErrors 0) — but only 1/3 Arm A seeds recorded a fight (88072).
  88071 never faced wave 4 (uw3, w4 faced 0); 88073 unlocked wave 4
  but faced 0 and fought 0 — and this time the zero is TRUSTWORTHY
  (see below), not a blind spot. Not re-scored.
- **M2c ENGINE COVERAGE: GO 6/6.** Census fights == distinct opens on
  every waves seed (88072: 5==5+0; 88075: 2==2+0; 88076: 2==2+0; the
  rest 0==0), censusErrors 0 everywhere. No fight lost, none doubled.
- **M2b ATTRIBUTION: GO 2/2.** Both dieFlag fights carry a NAMED
  fight-causal death, both in the arena (see below).
- **M3 CONVERSION: NO-GO 1 vs 1.** Arm A got its first kill of the
  streak (88072, Molly Noh's Audit kill d76), tying Arm B's one kill
  (88075, Hannah Kim's Influencer kill d98). The variant no longer
  converts better than the base — the tie is the finding.
- **M3b LIVING VETERAN: GO 2/6 — first GO in the r46–r52 streak.**
  Molly Noh (88072, Audit) and Hannah Kim (88075, Influencer) both
  lived to the run's end. The bar that failed six straight runs on
  "the killer dies" now passes on two living killers.
- **M4 WAVE-5/FULL: NO-GO 0/6.** Wave 5 still locked everywhere; the
  full seat still unoffered. The wave-5 bar wants 2 veterans per
  village (rd5demand); both veteran villages hold exactly 1. The
  wall moved from "no veterans" to "one veteran short."
- **M5 VOICING CANONICAL: GO 1/1** — 88074: bandCrossings 1, noticed 1,
  relay/dark final resolved (final:voice).
- **M6 GUARD NAMED: GO 3/3** — deferred sat waves end on
  veteran-banked (88072), losses (88075), hp (88076).
- **M7 PEOPLE: GO** — 2 finals + 1 death beat sense-read in full
  (below), 0 senseless flags.
- **M8 EXIT CANON: GO** — the one mFlee fight (88076 reunion) matched
  to its codex counter (novelty: "do something you've never done").
- **M9 SUPPLY: GO (mechanism re-confirmed).** 76 boundary blocks
  recorded; the wave-4 ones (Reunion, Algorithm, Influencer, Eater)
  are again contention blocks under the ONE-MONSTER-PER-TILE + Haven
  safe law, not scarcity.
- **PRIMARY: NO-GO** (M2 clause, M3 tie, M4). **ALL: NO-GO.**

## THE HEADLINE: THE CENSUS NOW SEES EVERY DRIVER — AND THE STORY CHANGED

The full-class distribution (9 fights): **talkDown 4, vKill 2, vDie 2,
mFlee 1.** Read against r51's partial class (15 driveFights-driven
fights: vDie 5, mFlee 2, vFlee 6, vKill 1, otherEnd 1) — NOT as road
movement. The class widened; the deltas below are class-change first:

1. **Daily-round fights are real, and they talk.** 88072's four
   talkDown fights (Suburb d75, Reunion d79, Eulogy d83,
   Reunion+Reunion d84) are source 'engine', turns-unobserved, closed
   at day boundaries — fights that open and close inside one daily
   via finishLiveFight, exactly the class r51 missed. The old census
   would have recorded ZERO of them. All four ended the same way:
   Walk In stand-down ("They stand down"), with gotAway=true. On the
   base road, the wave-4 story is now: you mostly TALK your way out
   of daily-round encounters, and you kill in the driven fights.
2. **Engine-only does not mean daily-only — and the split matters.**
   88076's Reunion vDie (d90, 5 turns observed by policy, never
   committed) is source 'engine' with turnsObserved=true: policy
   watched five turns but vetcommit never set its commit flag, so
   r51's census would have tallied it as nonCommittedW4 and never
   counted it. The engine record caught it anyway, with its named
   death. r53's question, named: what gates vetcommit's commit flag
   on a policy-observed fight? (88075's arena vDie DID commit, so
   "arena fights don't commit" is false — the gate is something
   else.)
3. **Zero vFlee, zero designed escapes this run** — the vFlee split
   ships unproven on new data. escapeKind reads 'break' on all 9
   fights (none of them are flees; the talkDown fights carry
   gotAway=true but end by talk, not flight). The split logic is
   installed and syntax-proved; it needs a flee-heavy seed to prove
   itself. Same for the withdrawal detector: zero withdrawals
   observed (all six surviving seeds announced; 88077 died honestly)
   — no false positives, no positive test. Both ride into r53 as
   "installed, awaiting a positive case," not as proven.
4. **The audit counts types, the census counts fights.** 88072's
   audit says "4 wave-4 fought"; the census says 5 fights. Both are
   right: 4 wave-4 TYPES faced (suburb, audit, reunion, eulogy),
   5 fights (reunion twice). A reader comparing audit to census
   must know the audit's unit is types.
5. **88073's zero is the trustworthy kind.** Unlocked wave 4, faced
   0, fought 0, zero wave-4 blocked arrivals, run ended at the table
   d90. Under the old census this would have read as "possibly
   blind"; under the engine census it reads as "unlocked late, never
   met" — the run sat the day it announced, so the post-unlock
   window was nil. Unlocked-but-unmet now has a clean signature:
   opens == 0 with a short or nil post-unlock window.

## WHO DIES IN WAVE-4 FIGHTS (M2b — both named, both arena)

- 88075 d98 Algorithm (engine+policy, 15 turns): **Mara Vasquez** —
  registerDeath, cause 'the arena', fightLive, fightOver. The same
  day the village killed the Influencer (Hannah Kim, living).
- 88076 d90 Reunion (engine, 5 turns observed, never committed):
  **Vikram Silva** — registerDeath, cause 'the arena'. The transcript
  voices it: "That night, they bring Vikram home. Nobody asks you to
  help carry; nobody has to. By morning the grave is dug by the
  fire, and the body is laid out beside it. The filling of it is
  yours."
- Both deaths carry context fields now: openDriver 'engine',
  arenaMention true, deathCauses ['the arena']. The arena is where
  wave-4 deaths happen in this run — field wave-4 deaths: zero.

## THE KILLS (M3's tie, M3b's first GO)

- 88072 d76, 6 turns, engine+policy, committed: the party put down
  the **Audit**. WaveKillLog killer: Molly Noh (comic shop owner),
  living at run end. The audit veils it as "On day 76, you put down
  Ugly-Eyes" — the epithet veil, noted again (r51's wart, still
  knowledge-gating by design).
- 88075 d98, 15 turns, engine+policy, committed: the party put down
  the **Influencer**. Killer: Hannah Kim, living at run end.
- The veteran math: 88072 bar 1 of 2, 88075 bar 1 of 2 — wave 5 wants
  two veterans per village, so both villages sit one veteran short.
  Standing is not the blocker anymore (88072: 199, 88076: 199 — one
  short of 200, but the veteran bar binds first on 88072/88075;
  88076's binding is w4 1/3 + w5 0/2).

## ENCOUNTER SUPPLY (M9 — contention, again)

76 boundary blocks across 7 seeds. The wave-4 ones: Reunion (88072,
88076), Algorithm (88075), Influencer (88075), Eater (88076) — all
"stops at the boundary — pacing, unwilling. Something else is
already here." The rest are wave ≤3 occupants (Hushpuppy, Spool,
Callback, Loud-Eyes, Don't-Look...). Same rule as r51 (ONE MONSTER
PER TILE + Haven safe law): wave-4s arrive, get held at boundaries
by lesser occupants, and sometimes never get a free tile. 88073's
counter-case (zero wave-4 blocks, zero fights) shows the other side:
sometimes they simply don't arrive before the run ends.

## VILLAGE ASSESSMENT (plain words)

- **88071 — 4 alive, won beloved/light.** The quiet village: never
  faced wave 4 (uw3), sat the day it announced (d99, guard roster),
  won by naming the unfilmed and the dead. Nothing missing that the
  road could have reached — it simply never met wave 4.
- **88072 — 8 alive, won feared/light.** The talking village: 5
  wave-4 fights, 4 talked down in daily rounds, 1 Audit killed by
  Molly Noh (living). Sat d91 on veteran-banked (1 of 2 veterans),
  standing 199 — one veteran and one standing point short of the
  wave-5 road. The village that proves talk works and killing is
  possible on the base road.
- **88073 — 9 alive, won beloved/light.** The untouched village:
  unlocked wave 4, faced nothing, sat d90 on hp. Its zero is honest
  now — the census would have caught a fight had one opened.
- **88074 — 8 alive, won relay/dark (control).** The canonical
  control fires clean again: crossings 1, noticed 1, final:voice.
- **88075 — 6 alive, won feared/light.** The village that killed and
  bled on one day (d98: Mara Vasquez lost to the Algorithm in the
  arena, Hannah Kim killed the Influencer and lived). Deferred 8
  days (guard losses, penalty 13), sat d98, standing 195. The
  veteran story in one day: kill and loss, side by side, killer
  alive.
- **88076 — 9 alive, won feared/light.** The engine-only village:
  both its fights never committed (Reunion vDie d90 with Vikram
  Silva's named arena death; Reunion mFlee d96–97, "It got away").
  Deferred 7 days (guard hp, penalty 7), standing 199. Under the old
  census this village would have shown zero fights; it fought twice.
- **88077 — village-lost.** Starved and bled out (22 deaths: alien,
  arena, starvation, wounds), 1 alive at the end, never announced.
  The honest-death resolution, not a silent failure.
- Who leads: the bearer, always — no succession this run. Who is
  miserable: the starved/bled 88077, and 88075's d98. What is
  missing: a second veteran per village (the wave-5 bar); a
  flee-heavy seed to prove the vFlee split; a withdrawal case to
  prove the withdrawal detector; and the vetcommit commit-gate
  answer (why 88076's observed fight never committed).

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The feared pledge (88072, full window).** The audit prices
   honestly ("4 wave-4 fought" = types; "1 more of the later drafts
   faced besides"; wave-5 bar "3 of 4 fighters armored; 1 of 2
   veterans"), the war-path line veils the Audit kill as "Ugly-Eyes"
   (knowledge-gating, noted not filed), the pledge beat resolves
   ("humanity's fear is a standing shield, never a sword... filed
   under 'deterrent, benevolent'"), the Architect beat (Sanne Bakker
   ascended through relay doors) and the Oversight coda land. PASS.
2. **The feared mercy (88075, full window).** "The most frightening
   thing you ever did... the galaxy learns that the feared one chose
   gentleness — and that choice echoes longer than any threat. The
   terror stays, pledged now: a shield over every village, forever."
   The mercy final resolves; the ledger lines (protected outnumber
   the killed; food truth shared; promises kept; relay carried
   faithfully) match the run's record. PASS.
3. **The death beat (88076, Vikram Silva).** "They bring Vikram home...
   the filling of it is yours." The census death and the story agree
   on the name, the day, and the weight. PASS.
- 0 senseless flags. No fabricated shared history in the read
  passages. Wart (carried): the audit's war-path epithet veil
  ("Ugly-Eyes" for the Audit kill) — a reader comparing audit to
  census must know the veil exists.

## BLANKS

- FILLED (instrument): the engine-level census — 9 fights, fights ==
  opens on all 6 waves seeds, 0 errors, no doubles. The daily-round
  blind spot is closed on real data (88072's 4 talkDown fights,
  88076's 2 uncommitted fights — all invisible to r51's census).
- FILLED (instrument): wave by data lookup in both census paths;
  fight context fields (openDriver, arenaMention, deathCauses,
  source, committed, turnsObserved) on every fight.
- FILLED (mechanism, re-confirmed): encounter supply is contention
  (ONE MONSTER PER TILE + Haven safe law), not scarcity.
- DOCUMENTED (instrument gap, r53's work): the vetcommit commit gate
  — why does a policy-observed fight (88076 Reunion, 5 turns) never
  carry a commit flag while another arena fight (88075 Algorithm)
  does? The census now counts both, but the gate itself is
  unexplained.
- DOCUMENTED (instrument gap, r53's work): the vFlee split and the
  withdrawal detector shipped without a positive case this run (0
  vFlee fights, 0 withdrawals). Both need a flee-heavy / withdrawal
  seed to prove themselves; neither is claimed proven.
- DOCUMENTED (road question, carried): the second veteran — both
  veteran villages hold exactly 1 of the 2 the wave-5 bar wants.
  And the standing-199 pair (88072, 88076): one point short of 200
  is the next binding constraint once the veteran bar fills.

## Metric review (§14)

1. **M2's second clause fails honestly again (1/3 Arm A)** — but the
   failure changed meaning: with the engine census, a zero is now a
   measured zero, not a possible blind spot. 88071 (never faced) and
   88073 (unlocked, never met) are explained zeros. Do not re-score
   coverage as road coverage.
2. **M2c's GO is the run's instrument win** — 6/6 with 0 errors. The
   equality held across drivers (engine-only, engine+policy, and
   zero-fight seeds alike). The census may now be quoted as "all
   wave-4 fights" for r52 seeds — with the class note that
   committed=false fights (5 of 9) are included, unlike r50/r51.
3. **M3's tie is a real road signal, not a metric failure** — Arm A
   killed on the base road for the first time in the streak, so the
   NOWALKIN variant's conversion edge is gone on this seed block.
   Next run keeps M3 as written; a second tie would ask whether the
   variant still matters.
4. **M3b's first GO reframes the veteran story** — from "the killer
   dies" (r51) to "one veteran short" (r52). The bar is now a
   counting problem (2 per village), not a survival problem.
5. **M4 stays binding and unmet (0/6)** — seventh run at zero wave-5
   openings, but the binding constraint is now named per village
   (veterans 1/2, standing 199/200, w4 1/3) instead of a general
   "nothing reaches."
6. **Telemetry deviation check:** tool reports LOUD on both metrics
   (see below). VERDICT: EXPLAINED (guard-ended windows, penalties
   0–13), baseline NOT rolled. Same verdict as r48–r51, same reason:
   the baseline describes long-deferral sits (r37), not this run's
   guard-ended windows.
7. **Balanced panel (§15):** no panel comparison applies — zero
   src/js changes, no lever moved on the default path (NOWALKIN
   default off, census + wrappers are read-only instrumentation).
   The comparison is r51→r52 via identical substrate plus the engine
   census (class-change, not road movement), and Arm A→Arm B on one
   variable.

## Regressions / checks

- PILOT (88071 Arm A + 88075 Arm B, 180d sweep mode): gate SATISFIED
  — 88075 recorded 2 census fights (vDie + vKill, both
  engine+policy, M2c equality holding), so the 7-seed sweep ran.
  88071 recorded 0 (honest: never faced wave 4).
- DET (instrument-on twice, 2x120d, seed 88071, final probe code):
  GREEN byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry): GREEN byte-identical (97d, won true,
  alive 4, pantry 12644 both sides).
- Existing suites: check.js --quick — DONE (log
  evidence/2026-10-25/journey-endgame-r52-check-quick.log; the run
  changed no src/js, so any failures are pre-existing unless the log
  says otherwise — final counts: 279 passed, 8 failed in 847s, the
  standing profile: hide-discovery, measurement-comparison,
  measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  parity-20261014; no new failures).
- Telemetry deviation check: LOUD on both metrics — VERDICT:
  EXPLAINED, baseline NOT rolled (see Metric review 6).

## Telemetry deviation check (2026-10-25)

- Tool verdict: LOUD on both metrics (7 files, 2 metrics).
  - maxTier: baseline 16 -> current 2 (−87%).
  - satPenalty: baseline 0 (tool parse quirk, see r51 metric review)
    -> current 26 (sum of tier+losses+penalty fields).
- Per-seed reading: maxTier values 0,0,0,0,1,1,0 (max 1 — the tool's
  "current 2" aggregation differs from a plain max by 1; immaterial,
  since both readings sit far below the long-deferral baseline 16),
  penalties 0–13 (88075: 13, 88076: 7, rest 0) — the same guard-ended
  population as r48–r51, NOT long-deferral sits. VERDICT: EXPLAINED;
  baseline NOT rolled.

## Evidence

- evidence/2026-10-25/journey-endgame-r52.md (this note)
- evidence/2026-10-25/journey-endgame-r52-prereg.md
- evidence/2026-10-25/perseed-endgame-r52/endgame-r52-{88071..88077}.json
- evidence/2026-10-25/perseed-endgame-r52/endgame-r52-{88071..88077}-transcript.txt
- evidence/2026-10-25/journey-endgame-r52-check-quick.log (in goal
  hidden_files; see run log — NOT committed to the repo: check logs
  are per-run bookkeeping, and the repo's evidence dir holds the
  run note + per-seed files only)
- scripts/probe-endgame-r52-20261025.js
- scripts/analyze-endgame-r52-20261025.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from r50,
  env-gated, default off; no src/js changes this run)
