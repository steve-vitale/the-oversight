# sim-raiddor-ledger-b — wrap the raid door, re-judge the ledger

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raiddor-ledger-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the stockdoors NO-GO, the residualhunt
GO, the residual2b phase-1 NO-GO, or the ledgerbound PILOT GO / CONFIRM-GO
— their verdicts stand in their own evidence. Its verdict is ONLY whether
the family ledgers close under the boundary definition WITH the raid door
wrapped, and whether the two residual2b targets appear as named raid-door
records. Judged ONLY against evidence/2026-10-27/sim-raiddor-ledger-b-prereg.md
(committed as c0f8c6f98 BEFORE any judged sweep).

## Verdict against the pre-registered GO: GO

GO iff ALL of (a) pilot band seeds 9820-9827 closes under the boundary
definition WITH the raid door wrapped: named rate >=80% AND pooled within
1%, generic rate >=80% AND pooled within 1%, dried pooled within 2%; AND
(b) BOTH residual2b targets appear as named raid-door records exactly:
LQ dried -800 and Muscadine 9825 -864; AND (c) a fresh confirm band of
>=12 seeds on the same pinned base meets the same three channel bars,
with a named-row minimum of 8.

- (a) PILOT — PASS. Raid-door legs: named 12/12 (100.0%), pooled residual
  0 / 1,687,320 = 0.000%; generic 8/8 (100.0%), pooled -29 / 2,225,865 =
  0.001%; dried pooled -4,996 / 774,536 = 0.65%. Det-gate (leg 1) PASS,
  coverage (leg 2) PASS. Proof GREEN (37 checks).
- (b) TARGETS — PASS, exactly. Seed 9825 raid records are exactly two,
  both caller villageAgencyDaily, both stack-named to villageAgencyDaily
  :203: day 75, Muscadine Grapes (dried) 12u x 72 = 864 (asked 800,
  whole-unit overshoot); day 81, Lamb's Quarters (dried) 20u x 40 = 800
  (asked 800). No decomposition needed, no remainder: the raid-door
  record sums equal the targets to the kcal.
- (c) CONFIRM — PASS, rate bar judged (not fallback). Confirm named rows
  = 8, exactly meeting the prereg's named-row minimum, so the rate bar
  IS judged: named 8/8 (100.0%), pooled 0 / 1,082,450 = 0.000%; generic
  12/12 (100.0%), pooled 742 / 3,785,372 = 0.020%; dried pooled -3,560 /
  1,043,449 = 0.34%. Proof GREEN on the confirm corpus.
- Convergence: converged — for the raid-door ledger blank this run was
  assigned. The residual2b left-open residuals are now closed by named
  records on two independent bands, and the ledger instrument has no
  known unwrapped pantry door left on these bands. The reachability
  wall (waves 4-5, national standing, the table, the win) is a separate
  open blank and is NOT closed by this run: no seed on either band
  reached it.

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: raid-door boundary ledger closure — named, generic,
  and dried-channel residuals computed against a closing snapshot taken
  after the final day's flows settle (end of day 100, after meal draws),
  with day-101 sweeps post-horizon and excluded, PLUS raid-unanswered
  draws (dated <= 100) counted as draws, with post-snapshot raid takes
  (dated == closing-snapshot day) subtracted from the boundary closing.
- GO threshold: verbatim from the prereg (see "Verdict" above).
- Horizon + why: 100 days, death-aware (a seed that dies ends early) —
  the residualhunt/ledgerbound horizon, and the horizon the boundary
  question lives on. Seed 9881 died at day 61 (village-lost) and ends
  the band's horizon honestly; its last snapshot day is 61.
- Seeds: pilot 9820-9827 (the residualhunt band, identical seeds);
  confirm 9870-9881 (fresh band, collision-checked before the prereg
  commit — no corpus filenames, no seed mentions in dated evidence .md
  files, not on the ledgerbound branch, distinct from spent-but-unjudged
  9768-9779).
- Policies: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off).
- Base pin: PRE-c04d4e0cb game.js, blob
  b2ba423afdfbdce8c98751ef544f10805b46cfa6, under pinned-base
  discipline (backup outside the repo, swap, sweep + proof, restore,
  verify — see "Pinned-base discipline" below). The pin was never
  committed. BASE PIN note: corpus trajectories are pre-c04d4e0cb
  trajectories and must not be cited as current-base trajectories.

## Instrument (vendored under NEW raiddor names, zero sibling modifications)

- scripts/sweep-raiddor-ledger-b.js (vendored from ledgerbound's sweep;
  output dir/file prefix, mode string, staging dir, capture require,
  the NEW raiddor install, and a read-only treeline say-line recorder
  adapted; sweep logic otherwise identical).
- scripts/analyze-raiddor-ledger-b.js (vendored from ledgerbound's
  analyzer; old-boundary and ledgerbound-boundary legs byte-identical
  and reported alongside as controls; the raid-door legs are the only
  ledger change; the leg-2 label now prints the real seed count instead
  of a hardcoded "/8" — the cosmetic fix ledgerbound's metric review
  asked for).
- scripts/test-raiddor-ledger-b.js (proof; see "Proof" below).
- scripts/trace-raiddor-ledger-b.js (vendored from ledgerbound's trace;
  raid-unanswered draws included in the transition flows; other
  _removePantryKcal caller paths listed as INFO, never counted).
- scripts/stockdoors-capture-raiddor.js (vendored from ledgerbound's
  stockdoors capture, header adapted, plus the NEW raid installer:
  wraps Game._removePantryKcal with pantry snapshot-diff, records seed,
  day, caller frame, path, asked kcal, returned kcal, and per-item
  units/kcal/spoilDay/foodState).
- NEVER modified: any sibling capture file (inflow/mealdraw/spoilvol/
  driedpath/stockdoor-capture, ledgerbound files) or any src/js file.
- Raid-door classification, verified by code reading before any sweep:
  villageAgencyDaily's ONLY _removePantryKcal call is the unanswered-raid
  800 (villageAgency.js:203) — the other villageAgency takes live in
  aidVillage/answerBeg/answerRaidDefense and classify under their own
  caller names. _removePantryKcal (hierarchy.js:867) is a DIFFERENT
  method from _evTakePantryKcal (game.js event-take, already wrapped as
  event-take) and from pantryDraw/drawSpoiled, takeFromPantry, and the
  inline NPC/raid/lift code; no method wrapped by any instrument calls
  _removePantryKcal internally (no reference in abilityActions.js or
  alienPlayers.js). The playground raid (apPlaygroundRaid, inline loop)
  is a separate door, already wrapped as alien-raid — it is not the
  unanswered-raid take and never shares a record with it.

## Pilot legs (seeds 9820-9827, identical seeds, old vs boundary vs raiddor)

Old-boundary legs (NEW definition, control — reproduces ledgerbound's
control exactly): leg 3 named 9/12 (75.0%), pooled 4,136 / 1,687,320 =
0.245%; leg 4 generic 7/8 (87.5%), pooled 4,412 / 2,225,865 = 0.198%;
leg 5 dried pooled -5,456 / 774,536 = 0.70%. Old-boundary verdict: NO-GO
(leg 3 rate) — the control behaves as before; the instrument change did
not move the control.

Boundary legs (ledgerbound definition, control — reproduces ledgerbound
exactly): leg 3 named 11/12 (91.7%), pooled -1,664 / 1,687,320 = 0.099%
(the single failure is Lamb's Quarters 9825 at -800, the raid); leg 4
generic 8/8 (100.0%), pooled -425 / 2,225,865 = 0.019%; leg 5 dried pooled
-7,056 / 774,536 = 0.91%. Boundary verdict: GO — the control reproduces.

Raid-door legs (judged): leg 3 named 12/12 (100.0%), pooled 0 /
1,687,320 = 0.000%; leg 4 generic 8/8 (100.0%), pooled -29 / 2,225,865 =
0.001%; leg 5 dried pooled -4,996 / 774,536 = 0.65%. Raid-door verdict:
GO (legs 1 + 2 PASS, see Proof).

Named family-seed rows, raiddor (boundary total in parentheses where it
differs): 9821 Burdock 0 (0); 9821 Muscadine Grapes 0 (0); 9822 Burdock 0
(0); 9822 Muscadine Grapes 0 (0); 9823 Burdock 0 (0); 9824 Muscadine
Grapes 0 (0); 9824 Burdock 0 (0); 9825 Muscadine Grapes 0 (-864);
9825 Lamb's Quarters 0 (-800); 9826 Lamb's Quarters 0 (0); 9826 Burdock
0 (0); 9827 Purslane 0 (0). The raid door moves exactly the two
residual2b rows to zero and touches nothing else on the named set.

Generic family-seed rows, raiddor (boundary in parentheses): 9820
Foraged food +259 (+259); 9821 0 (0); 9822 0 (0); 9823 0 (-396); 9824 0
(0); 9825 0 (0); 9826 -288 (-288); 9827 0 (0). The raid door moves
exactly one generic row: 9823's -396 -> 0, via its day-78 raid take of
2u Foraged food (dried) x 198 = 396 (the second item of that take, after
2u Canned soup x 250). The two remaining nonzero generic rows (+259 on
9820, -288 on 9826) are carried-over boundary residuals, identical with
and without the raid door — they are NOT raid residuals, and they are
small (0.09% each). Pooled generic moves -425 -> -29 by exactly the
9823 row; no row was hidden to make the pooled number smaller. In
total the raid door moves three pilot rows to zero: two named (the
residual2b targets) and one generic.

Raid census, pilot (all 14 records raid-unanswered; no other
_removePantryKcal caller path fired on the pilot band): 9820: 0 records;
9821: 4 records / 4,000 kcal, days 24/71/78/87; 9822: 1 / 1,000, day 94;
9823: 3 / 2,896, days 43/61/78; 9824: 3 / 3,000, days 64/72/80; 9825: 2 /
1,664, days 75/81 (the targets); 9826: 1 / 1,000, day 88; 9827: 0. Every
call took something (calls == records on every seed; zero no-decrease
calls). No raid dated == the closing-snapshot day and none dated > 100
on either band — the post-snapshot raid adjustment is implemented but
unexercised (see "Metric review").

## Confirm legs (seeds 9870-9881, fresh band)

Collision check (re-recorded here, as the prereg requires): seeds
9870-9881 had no corpus JSON filenames and no seed mentions in dated
evidence .md files at prereg time; not present on the ledgerbound
branch; distinct from spent-but-unjudged 9768-9779.

Old-boundary legs (control): leg 3 named 6/8 (75.0%), pooled 18,871 /
1,082,450 = 1.743% — FAIL; leg 4 generic 12/12 (100.0%), pooled 760 /
3,785,372 = 0.020%; leg 5 dried pooled -2,329 / 1,043,449 = 0.22%.
Old-boundary verdict on confirm: NO-GO (leg 3) — the control fails as
expected; the confirm never overrides the pilot.

Boundary legs (control): leg 3 named 8/8 (100.0%), pooled 0 / 1,082,450
= 0.000%; leg 4 generic 12/12 (100.0%), pooled 742 / 3,785,372 = 0.020%;
leg 5 dried pooled -3,560 / 1,043,449 = 0.34%. Boundary verdict: GO.

Raid-door legs (judged): leg 3 named 8/8 (100.0%), pooled 0 / 1,082,450
= 0.000%; leg 4 generic 12/12 (100.0%), pooled 742 / 3,785,372 = 0.020%;
leg 5 dried pooled -3,560 / 1,043,449 = 0.34%. Raid-door verdict: GO.
Named rows (8, meeting the prereg minimum, so the rate bar is judged):
9870 Muscadine Grapes 0; 9871 Muscadine Grapes 0; 9872 Burdock 0; 9873
Burdock 0; 9876 Muscadine Grapes 0; 9877 Lamb's Quarters 0; 9879 Burdock
0; 9880 Purslane 0. Seeds 9874, 9875, 9878, 9881 contribute no named row
(their named families sit under the 10,000-inflow focal filter) — that
is the filter working, not missing data. On the confirm band the
raid-door legs equal the boundary legs exactly: no confirm raid take
touched a focal family-seed row (raids hit Canned soup and other
non-focal stores), so the confirm judges the instrument's stability,
not a second raid rescue. Generic rows, raiddor: 9870 -100; 9871 0;
9872 0; 9873 0; 9874 -176; 9875 0; 9876 0; 9877 0; 9878 0; 9879 -454;
9880 +1,249; 9881 +223 (pooled +742).

Raid census, confirm (all 23 records raid-unanswered; again no other
caller path fired): 9870: 2 / 2,000, days 43/75; 9871: 4 / 4,000, days
46/85/92/97; 9872: 3 / 3,000, days 39/41/76; 9873: 3 / 3,000, days
16/30/92; 9874: 4 / 4,000, days 23/34/75/99; 9875: 2 / 2,000, days 67/73;
9876: 1 / 1,000, day 59; 9877: 0; 9878: 3 / 3,000, days 62/66/81; 9879: 0;
9880: 1 / 1,000, day 61; 9881: 0 (died day 61). Band totals: pilot 14
raid records, confirm 23, combined 37 — every one an unanswered-raid
take, every one stack-named to villageAgencyDaily.

## Proof (scripts/test-raiddor-ledger-b.js)

Pilot corpus proof: GREEN, 37 checks — corpus validity (8 files,
policy, stockdoorsOn + raiddorOn, no truncation, all 7 direct methods
wrapped, raid installer wrapped); corpus reproduces the residualhunt
corpus on all 8 seeds (shared fields, excluding ms and the new raid
fields); det-gate leg 1 PASS (RAIDDOORS=1 vs 0 byte-identical on
non-raid fields — inflow, mealdraw, spoilvol, driedpath, deaths, wall
fields — and the on-run reproduces corpus 9820 counts 255/1249/4/163);
independent recomputation matches the analyzer on all nine pooled
figures (old, boundary, and raiddor named/generic/dried); raid
integrity (item sums equal returned kcal, 0 retMismatches, no unknown
paths, every raid-unanswered caller is villageAgencyDaily); raid
disjointness (no shared day/name/spoilDay/units tuple with any direct
record; _removePantryKcal absent from the direct wrapped set); hygiene
(zero src/js modified apart from the pinned-base allowance, zero
sibling files modified, no modified tracked file outside this run's
own files). First pilot proof run showed 1 FAIL — a stale check
carried from the ledgerbound det-gate that asserted the off-run had NO
stockdoors fields, but this det-gate toggles RAIDDOORS alone (STOCKDOORS
stays 1 in both runs, so the off-run correctly KEEPS stockdoors
fields). The check tested the wrong toggle, not the instrument: it was
corrected to assert the off-run keeps stockdoors fields, and the full
proof was re-run GREEN. No verdict was shopped — the corrected check is
stricter about the actual design (both runs must agree on stockdoors
fields AND differ only in raid fields).

Confirm corpus proof: GREEN — corpus validity (12 files), det-gate
leg 1 PASS (same 9820 pair), independent recomputation matches the
analyzer on all nine pooled figures for the confirm band, raid
integrity + disjointness PASS, hygiene PASS. (Corpus-9820 checks are
skipped on the confirm band by design — 9820 is absent there — exactly
as ledgerbound's proof does.)

## Reachability verdict (both bands, competent-nofeast, 100d)

Pilot: waves 1-3 reached (wave 3 on 9822/9824/9825, wave 2 on the rest);
waves 4-5 on 0/8 seeds. Regional, national, table, wins: 0/8. Rank
stayed village on all 8 seeds. Median survival 100d (censored; all 8
survived to day 100). Deaths 38 (sickness 17, monster 5, ambush 4, wound
4, arena 3, contest 2, sunback 1, alien 1, dehydration 1).

Confirm: waves 1-3 reached (wave 3 on 9871/9875/9878/9879, wave 2 on the
rest); waves 4-5 on 0/12 seeds. Regional, national, table, wins: 0/12.
Rank stayed village on all 12 seeds. Median survival 100d (11 survived
to day 100; 9881 lost at day 61 with 12 deaths). Deaths 38 (arena 19,
monster 4, contest 4, ambush 2, dehydration 2, sickness 2, starvation 3,
inspiration 1, drum-belly 1).

The scale wall stands on both bands; this arm measures a pantry ledger,
it does not move the wall numbers. Arc II/III/IV, four-realm formation,
trap acquisition by source, counter discovery/counter-kill rate, and
young-link succession survival are not recorded in this corpus and are
not estimated here.

## Wall numbers (both bands, competent-nofeast)

National / table / wins: pilot 0/8, confirm 0/12. Wave-4/5 unlocks:
pilot 0/8, confirm 0/12. Wave reach, pilot: 9820: 2, 9821: 2, 9822: 3,
9823: 2, 9824: 3, 9825: 3, 9826: 2, 9827: 2. Wave reach, confirm: 9870: 2,
9871: 3, 9872: 2, 9873: 2, 9874: 2, 9875: 3, 9876: 2, 9877: 2, 9878: 3,
9879: 3, 9880: 2, 9881: 2.

## Village assessment (plain words)

Twenty villages, nineteen surviving the full 100 days around pantries
that are now watched down to the unit — and the one that didn't (9881,
lost at day 61 with 12 deaths) is the honest exception that proves the
horizon is death-aware, not padded. The food story on these bands was
never hunger: nobody's ledger fails on food, and the villages that lost
the most people lost them to sickness, arenas, and fights, not to empty
shelves. What the villages looked like, up close: working pantry
economies where named villagers cook for the haven and work the smoke
racks ("Ricardo cooked for the haven — meals stretched. Ricardo worked
the smoke racks too — 1 batch preserved"), villagers eating from the
pantry by name ("Giulia: 1u x 200 Rice"), surplus shared back into the
stores — and, on 16 of the 20 villages, a night raid at the treeline
that nobody answered, so raiders walked off with a fixed 800-kcal
share of the longest-keeping stores (usually Canned soup at 4u x 250 =
1,000, the whole-unit overshoot of an 800 ask; on seed 9825, dried
grapes and greens instead). The villagers acted like people around
this: they cooked, preserved, ate, left raids unanswered, and the game
said so out loud, with names and consequences. What was missing was
never food — it was a witness, and now there is one: the raid door
records all 37 takes across both bands, each with its caller, its
items, and its narration. Who thrived and who died and why: the
surviving villages thrived on the same pantry competence; the dead
(9881) and the heavy-loss villages (9824 with 10 deaths, 9823 with 9)
lost people to sickness and violence, not to the raids — a raid costs
about 1,000 kcal against pantries holding hundreds of thousands, a
tax, not a famine. What knowledge/capabilities were missing: nothing
the ledger can see — every pantry flow on these bands is now named,
including the last unwrapped one. Blanks filled: (1) both residual2b
targets are now named raid-door records, not decompositions; (2) the
ledgerbound boundary's last failing row (LQ 9825 -800) is explained to
the kcal; (3) the other _removePantryKcal callers (tributes, dues, aid,
beg answers, answered-raid give/hold-overrun) are instrumented but
never fired on either band — documented as a coverage note, not a
claim: the door will record them when a band exercises them, and a
future band that plays regional politics should check whether they
start firing. Documented, not fixed: no game-code change was made
(DIAG only); the raid door is an instrument, and whether the game
should surface raid takes anywhere else is a design question, not a
ledger one.

## Sense transcript (SENSE-TESTING LAW — meaning, not just counts)

The raid take is NOT silent — it is narrated, named, and counted in the
same breath. Seed 9825, day 75: "🌙 You weren't at the treeline. Aisha
of Emberhold didn't wait — they hit the stores and melted back into
the dark with 864 kcal. The village will talk about this for a long
time." Day 81: "🌙 You weren't at the treeline. Hana of The Bloodied
didn't wait — they hit the stores and melted back into the dark with
800 kcal. The village will talk about this for a long time." These
lines are coherent with the ledger on the same days: the day-75 record
is Muscadine Grapes (dried) 12u x 72 = 864, the day-81 record Lamb's
Quarters (dried) 20u x 40 = 800 — the narration's numbers ARE the
ledger's numbers, and the "talk about this for a long time" tail is a
social consequence (opinion -5, journal entry), not flavor. The raid
takes on other seeds read the same way, with different champions and
villages (Priya of Thornfield, Wren of Ashford, Jesse of The Bloodied,
Victor of The Bloodied II) — generated from the situation, not a
static menu. Nothing robotic, static, or repeated was found in the
sampled dialogue; the one repetition (the 800-ask/1,000-take shape on
Canned soup) is the mechanism's honest whole-unit arithmetic, not a
dialogue loop.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict follows
  from it: pilot legs, targets, and confirm legs all meet their bars
  with no re-scoring, no dropped families, no threshold changes. The
  named-row minimum did its job in the strong direction: the confirm
  band yielded exactly 8 named rows, so the rate bar was judged (8/8),
  not waived into a pooled-only report — and it passed at 100%.
- Bar lesson, carried from ledgerbound and closed here: the confirm
  named count is no longer weak evidence on this instrument (8 rows,
  all passing, pooled 0) — but the confirm band's raid-door legs equal
  its boundary legs exactly, because no confirm raid touched a focal
  row. The confirm therefore proves instrument stability, not a second
  raid rescue; the rescue itself rests on the pilot band (12/12 with
  the two target rows moving to zero). That asymmetry is stated, not
  hidden.
- Instrument lesson 1: the post-snapshot raid adjustment (subtract
  raid takes dated == closing-snapshot day from the boundary closing)
  is implemented in both the analyzer and the independent proof path,
  but NO raid on either band landed on a closing-snapshot day, so it
  is unexercised. A future band with a day-100 raid would exercise it;
  until then it is code, not evidence. The next prereg that needs it
  should pre-register a day-100 raid seed if one can be found, or keep
  the adjustment as defense-in-depth and say so.
- Instrument lesson 2: the other _removePantryKcal callers never fired
  on 20 villages x 100 days of competent-nofeast play. That is a real
  coverage statement about this policy band (no tributes, dues, aid,
  or answered raids exercised), not a claim that those paths are
  wrapped-and-empty in general. A regional-politics band should
  re-check the census before assuming the door is quiet.
- Proof lesson: the first pilot proof run's single FAIL was a stale
  check (stockdoors-off assertion in a RAIDDOORS-toggle det-gate),
  fixed by asserting what the design actually does, then fully re-run
  GREEN. The fix is recorded here so the next vendor doesn't copy the
  stale check forward.
- Cosmetic fix, done: the analyzer's leg-2 label now prints the real
  seed count (12/12 on confirm) instead of ledgerbound's hardcoded
  "/8" — a label fix, not a metric change.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this arm
  changes no lever and no game code, so there is no before/after to
  panel. scripts/balance-panel.js is a before/after observer
  instrument (baseline vs candidate runs); it does not apply to a
  measurement corpus. The det-gate is the instrument before/after
  (raiddor on vs off, byte-identical on non-raid fields). Not forced,
  not faked.
- Infrastructure notes (loud): (1) the first pilot sweep's background
  session dropped after seed 9824 with no crash output — its 5 files
  were intact, and seeds 9825-9827 were re-run deterministically (same
  seeds, same pinned base; 9825's counts reproduce the residualhunt
  corpus shape exactly). No sweep output was ever written to /tmp;
  all corpora live under evidence/2026-10-27/sim-raiddor-ledger-b-corpus/
  and sim-raiddor-ledger-b-confirm-corpus/ in this worktree. (2) After
  the prereg commit, the safe-commit index-clobber variant hit again
  (prereg staged-deleted in the main index) — repaired per the
  documented recipe (update-index --add --cacheinfo from the HEAD
  blob), verified git status clean + git diff HEAD empty + hash-object
  match, before proceeding. (3) No EPERM flap blocked this run's
  writes after the prereg; the sweep's in-memory pending-flush path
  was never needed.

## Pinned-base discipline (this run)

- Backup: ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-raiddor-ledger-b/gamejs-backup.js
  (hash-object bfa3631982cb2233fdc40ff54c4269bd2649c1fd = worktree HEAD
  blob, verified before the swap). NOT committed.
- Pin swapped in: blob b2ba423afdfbdce8c98751ef544f10805b46cfa6
  (verified by git hash-object after the swap). All sweeps + proofs ran
  on the pin. The pin was NEVER committed.
- Restored: worktree game.js copied back from the backup; verified
  hash-object bfa3631982cb2233fdc40ff54c4269bd2649c1fd and
  `git diff HEAD -- src/js/game.js` empty before the evidence commit.

## Reproduction check (this run)

- Prereg committed BEFORE any judged sweep (c0f8c6f98); judged sweeps
  ran only after that commit.
- Proof scripts/test-raiddor-ledger-b.js GREEN on the pilot corpus
  (37 checks) and GREEN on the confirm corpus (34 checks; corpus-9820
  checks skipped by design on the confirm band).
- No jest was run (nothing to test in jest — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- No game-code change: zero src/js files committed. Files in this arm's
  commits: prereg commit c0f8c6f98 (prereg only) and the evidence
  commit (evidence file + pilot corpus + confirm corpus + 5 scripts:
  sweep, analyze, test, trace, stockdoors-capture-raiddor).

## Convergence line

converged — the raid door closes the ledger on two independent bands
(pilot 12/12 named, confirm 8/8 named, both pooled 0), and both
residual2b targets are now named raid-door records to the kcal; the
remaining ledger work is coverage (other _removePantryKcal callers on
bands that exercise them; a day-100 raid to exercise the post-snapshot
adjustment), not investigation.

## Verdict (judged against the pre-registered bar, not re-scored): GO

Pilot closes with the raid door wrapped (named 12/12, generic 8/8,
dried 0.65%); both residual2b targets appear as named raid-door records
exactly (Muscadine 9825 dried 864, Lamb's Quarters dried 800, both
caller villageAgencyDaily); the fresh confirm band meets the same three
channel bars (named 8/8, generic 12/12, dried 0.34%) with the named-row
minimum met exactly, so the rate bar was judged, not waived. The
ledger's last unwrapped pantry door is wrapped, and the books balance
on two bands.
