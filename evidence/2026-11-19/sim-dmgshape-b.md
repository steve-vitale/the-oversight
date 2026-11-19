# sim-dmgshape-b — the damage-per-round decomposition diagnostic (tracker blank 1)

**Verdict: NO-GO, kind METRIC-BROKEN** — the pool floor fails on every
leg: 5 wave-4+ launches (floor 6), 3 joined quad meetings (floor 4),
3 fled fights (floor 8). The band's villages barely launch wave-4
hunts at all — all 5 wave-4+ launches sit on one seed — so there is
no launched-quad population to decompose. The decomposition bars
themselves pass on the 3 fights that exist (accounted 0.768, top
54.1%, reconciliation 2.3%), but a 3-fight decomposition cannot
carry the bar, and the verdict is NO-GO by the frozen pool floor.
That IS the finding: on this band the binding constraint is one step
upstream of damage — the launch decision, not the damage rate.

- **Branch:** `sim-dmgshape-b`, tip `5a2ef5b79` after Correction 2
  (base master `e1f002065` + ported ALLYSLOT3 slot `c84a312ba` +
  instrument `729b84081`)
- **Prereg:** `evidence/2026-11-19/sim-dmgshape-b-prereg.md` (frozen
  2026-11-19 12:54 UTC; Correction 1 ~13:00 UTC, Correction 2
  ~13:20 UTC — both before any judged sim on the corrected
  substrate; see §6)
- **Analysis:** `evidence/2026-11-19/dmgshape-b-analysis.json`
  (analyzer exit 0; log `dmgshape-b-analysis.log`)
- **Panel:** `evidence/2026-11-19/dmgshape-b-panel.md` (decision
  `invalid` — cross-band compare, see §4)
- **Corpus:** `evidence/2026-11-19/perseed-dmgshape-b/` (8 seeds,
  150 days, 0 instrument errors)
- **Seeds:** 105931–105938 (fresh band; see prereg)
- **Leg:** single diagnostic leg, substrate SENSEEXPED=1,
  PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1, FIGHTALLY2=1,
  ALLYSLOT3=1 (slot PORTED — coordinator's call, Correction 2).
  Competent verbatim, 150-day death-aware.

## EVIDENCE-ONLY — the ported lever never merges

The ALLYSLOT3 slot on this branch is a port of held commit
`5a5343363` (sim-fightcap-b), cherry-picked clean as `c84a312ba`
(proof `scripts/test-allyslot3-b.js` 18/18; `git diff 5a5343363`
shows only base differences: speargate-a 18 lines in
fieldFights.js, bowopen-a 225 lines in game.js,
party-wiring.js byte-identical). It exists ONLY so this diagnostic
could run on the fightcap arm substrate. It must NEVER be merged
to master as a game change: the coordinator lands evidence-only
(tooling/prereg/evidence cherry-pick, as fightcap was handled) or
releases the branch done-abandoned.

## 1. Judged numbers (frozen bars, §14 of the prereg)

| Bar | Measured | Bar | Result |
| --- | --- | --- | --- |
| Pool: launches/leg | **5** | ≥ 6 | **FAIL** |
| Pool: joined quad meetings | **3** | ≥ 4 | **FAIL** |
| Pool: fled fights | **3** | ≥ 8 | **FAIL** |
| Unmatched rows | 0 | 0 | PASS |
| Instrument errors | 0 | 0 | PASS |
| Reconciliation (exact identity) | **2.3%** | ≤ 15% | PASS |
| Accounted share | **0.768** | ≥ 0.70 | PASS (on n=3) |
| Top contributor | **baseCeiling 52.0/round = 54.1% of gap** | ≥ 25% | PASS (on n=3) |

GO required the pool floor + accounted ≥ 0.70 + top ≥ 0.25. The
decomposition bars pass; the pool floor fails on all three legs,
so the verdict is NO-GO, kind METRIC-BROKEN. The accounted/top
passes are reported, not banked: three fights cannot carry them.

### The judged decomposition (n=3 fled fights, 13 rounds, 146 damage)

| Component | /round | Share of gap (96.0) |
| --- | ---: | ---: |
| (a) Verb loss — fighter rounds spent on verbs, not strikes | 6.38 | 6.6% |
| (b) Miss loss — zero-damage strikes | 0.00 | 0.0% |
| (c) Ally-delay loss — empty striker slots | 15.38 | 16.0% |
| (d) Base-rate ceiling — 111 − P_mean × 4 | 52.00 | 54.1% |
| **Accounted** | **73.76** | **76.8%** |
| D_meas (mean of per-fight rates) | 14.96 | — |
| Gap G = 111 − D_meas | 96.04 | — |

Reconciliation (Correction 1 exact identity): (a′)+(b′)+(c′)−echo
= 48.79 vs `P_mean × 4 − D_strike` = 49.92 → error **2.3%**,
inside the 15% band. (The first analysis run reported 38.7% —
that was the analyzer's ×3 bug, §6, fixed before this evidence
was written; the corrected number is 2.3%.)

### The three fled fights

| Fight | Rounds | Dealt / HP | /round | Shape |
| --- | ---: | ---: | ---: | --- |
| d113 Eater, Wanjiru Kamau | 3 | 17 / 993 | 5.7 | Solo: 2 strikes (8, 9), 1 verb round, allies never arrive — ally1's join is round 4, the fight ends round 3 |
| d118 Eulogy, Sibongile | 1 | 28 / 930 | 28.0 | Volley-only: 28 damage is all bow (3/4 arrows), 0 strikes, 1 verb round (the trick), flees at 7 HP |
| d118 Reunion, Fatima Hassan | 9 | 101 / 1377 | 11.2 | 6 strikes in 9 rounds (4 verb rounds), allies join rounds 8–9, Rage fires round 4, doubled strikes land rounds 6/7/9 |

Per-member (roundsDetail engine numbers, fled set): fighter 110
(93.2%), ally1 0, ally2 8 (6.8%), ally3 0. The 4th member dealt
nothing anywhere in the corpus: field-4 rate 0/1 (only one
meeting ever had ally2 join), sense rate 0/3. Sense-miss causes:
1 different-tile, 2 trim-unproven.

## 2. Why the pool is empty — the launch decision, again

Wave-4+ launches per seed: 105931 0, 105932 0, **105933 5**,
105934 0, 105935 0, 105936 0, 105937 0, 105938 0. All five sit on
seed 105933; the other seven seeds launch no wave-4+ plan in
150 days. Of the five, one is a quad (d109 Eater, holder + 3);
the rest are size 2–3. The partyQuads counter reads 1, matching
the observed 1 — the PARTYSIZE4 machinery works; it almost never
fires because wave-4+ launches almost never happen.

Meanwhile the villages FIGHT wave-4/5 monsters constantly: 134
fought encounters in the corpus (97 fled, 6 killed, 15 ending
with a villager dead, 16 with the monster fleeing), 54 of them on
seed 105933 alone. The fights are
there; the launched quad is not. The launch decision is the
binding constraint on this band — the same wall the loop has
measured before (the gate never says 'seek', usually isn't
asked). Seed 105935 sharpens the point from the other side:
standing 680 — the highest on the band — with ONE departure and
ZERO launches in 150 days: a village that got rich without ever
hunting. Standing is not the launch trigger.

## 3. Exploratory: the full-population decomposition (NOT the verdict)

The frozen verdict stands on the n=3 judged population. But the
instrument is validated — the exact identity holds at **0.3%
error over all 97 fled fights** (273 rounds) and 0.3% over all
134 fought encounters — so the wider population shows the gap
structure the judged set is too thin to carry. Labeled
exploratory, never a re-score:

| | All 97 fled fights |
| --- | --- |
| D_meas (mean of per-fight rates) | 15.29/round |
| Gap vs 111 | 95.71/round |
| (a) Verb loss | 2.95/round (3.1%) |
| (b) Miss loss | 0.00/round (0.0%) |
| (c) Ally-delay loss | 26.43/round (27.6%) |
| (d) Base-rate ceiling | 41.83/round (43.7%) |
| Accounted | 0.744 |
| Reconciliation error | 0.3% |

The shape, in one line: the party lands **1.19 strikes a round
out of 4 possible**. The fighter spends 93 of 273 rounds (34%)
on verbs, not strikes. Striker slots sit empty 675 of 1092
slot-rounds (62%). And even at a full 4-striker party striking
every round, the measured strike quality (P_mean 17.29) caps
output at ~69/round — still 42 short of 111. Misses contribute
nothing: hit rate is 1.000 — zero 0-damage strikes in 326
attempts across the whole corpus. Per-member over all fled:
fighter 53.0%, ally1 31.1%, ally2 15.9%, ally3 0.0%.
Ability-touch damage 19.5% of dealt (excess 5.6%); volley 2.1%;
tricks 51 in 51 rounds. Mean kill-gap 660 HP — 5.9 more rounds
at 111/round; the median fled fight lasts 2 rounds.

Read plainly: the party doesn't lose the damage race by missing
or by lacking tricks. It loses it by not striking — a third of
fighter rounds go to verbs and tricks, allies arrive after the
fight is decided or not at all, and the strikes themselves are
small (a 17-damage average against 850–1500-HP monsters). The
formula ceiling is the single largest term, but it is not the
whole story: the ally-delay term (27.6%) is the part a lever can
actually move without touching the strike formula.

## 4. Reachability (waves 1–5, national/table/wins, median survival)

| | This leg | Fightcap-b arm (reference) |
| --- | --- | ---: |
| Full wins | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 |
| Table | not instrumented (0 wins) | not instrumented |
| Wave 5 reached | 3/8 | 3/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Standing ≥ 200 | 3/8 | 3/8 |
| Survived 150d (gameDays) | 2/8 | 3/8 |
| Median survival | 133.5d | 147d |
| Community loss | 5/8 | 5/8 |
| Starvation (total / villager) | 2 / 2 | 3 / 2 |

Nothing moves. The wall stands exactly where fightcap left it.
(Seed 105935 shows 150 driver-days but gameDays 149, so the
wall's survived count is 2/8 by its gameDays definition.)

### Balanced panel (instrument, not judge)

`dmgshape-b-panel.md`: decision **`invalid`** — "Unmatched
seeds / Unmatched cases". The compare pairs by policy+seed, and
the two corpora sit on different bands (fightcap 104770–104777,
dmgshape 105931–105938), so no seed matches. A cross-band panel
compare is structurally impossible in this tool; the before/after
`.json.gz` files are kept as the attempt record. The
reproducibility reference is therefore the direct wall-number
comparison in the table above, not a panel delta — and the wall
numbers reproduce fightcap's arm almost exactly (wins 0, national
0, wave-5 3/8, wave-4 8/8, community loss 5/8).

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-19/perseed-dmgshape-b/*.json' --metrics
national,table,wins,exiled` — refused, verbatim: "telemetry-check:
refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs.
Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." Same refusal as fightcap-b. No
deviation recorded; wall numbers above are reported directly.

## 5. Sense-test: reading the fights

All three judged fights read in full (uncapped logs — the
20-line cap is gone in this driver).

- **d113 Eater (Wanjiru):** hurt from the first hit (49 HP),
  she binds the wound in R1 instead of striking, lands 8 and 9
  damage in R2–R3, and shouts — Fatima "charges in" as Wanjiru
  runs: "Fatima answered Wanjiru's shout, but Wanjiru is past
  holding — they run while running still works." The ally arrives
  into a flee. The "holds the line — they know how this one is
  fought, and have not had their turn to prove it" line is legible:
  she knows the trick and never gets to use it.
- **d118 Eulogy (Sibongile):** the bow does everything (28
  damage, 3/4 arrows), the monster hits her to 7 HP, she spends
  her one round contradicting the narration — "it says Sibongile
  runs — Sibongile advances" — and then runs. One round, no
  strike. Fiction wrinkle: the volley lines call the Eulogy "The
  Big Beast" (the village's knowledge-gated nickname) while the
  mechanics lines name it — the same double-naming fightcap noted
  for "The Ugly Beast" on d76.
- **d118 Reunion (Fatima):** the richest transcript. Strikes for
  12, 11; R3 the Novelty trick (stands on one foot, recites a
  poem); R4 Rage fires — and then she does NOT strike: "holds the
  line — working the trick, not the damage race" repeats R4, R5,
  R7. R5 is field medicine. The doubled strikes land R6 (22),
  R7 (22), R9 (26). Sibongile joins at R7 and is killed by a
  single 31-damage hit in R8 ("Sibongile goes down!"). Wanjiru
  joins at R9, strikes for 8, Fatima flees at 5 HP with the
  monster at 1276/1377. Nothing here reads robotic. The fiction
  holds; the numbers don't: at 11–12 damage a strike, the fight
  was unwinnable from R1.

**Late-Rage-fire pin (secondary): OBSERVED.** 8 Rage fights in
the corpus; 7 fire round 1, **1 fires late — Fatima d118,
round 4 of 9**. The mechanism is now visible in the full log:
Rage fires R4, but the doubled strikes don't land until R6/R7/R9
because R4 goes to the trick-hold and R5 to field medicine. The
fire isn't late because the carrier dawdles — it's late because
the fighter keeps choosing verbs over strikes, and the doubling
only pays when a strike finally happens. Three of the 8 Rage
fights dealt 0 damage total (the fighter died or fled before
striking — Rage fired, no doubled strike ever landed). Ruby
d139's question is answered in kind, not in mechanism: late fire
recurs, and its cost is paid in rounds, not in a missing trigger.

## 6. Village assessment, in plain words

On this band the villages don't hunt wave-4 monsters — they meet
them. One village in eight (seed 105933) launches wave-4 plans at
all, and it launches five, one of them a quad. The other seven
sit at standing 150–199, or in one case get rich to 680 without
ever leaving, while wave-4 monsters walk into their people on the
road: 134 fights, 15 of them ending with a villager dead. When
a launched quad does fight, it fights almost alone — the fighter
strikes for 8 or 11 damage, spends a third of the rounds healing
or working a trick, and the companions arrive in the last round
or into the flee. The 4th member never fields once. The damage
gap isn't a mystery anymore: the party lands about one strike a
round out of four possible, and even four strikes a round at the
measured quality wouldn't reach the winning shape. The fix isn't
in the fight. It's in getting the village to launch, and getting
the party to the fight whole and striking.

## 7. Metric review (for the NEXT run — this run is judged as frozen)

1. **The pool floor priced a gamble the band lost.** No survey
   ran before freezing (the band was fresh; fightcap's band
   measured 15 launches). The next run on this question should
   survey first — or pick a band by measured launch rate, not by
   freshness alone. A survey costs ~7 minutes and would have
   caught the 5-launch band before the prereg froze.
2. **Analyzer bug caught before evidence (×3 remnants).** The
   Correction 2 update moved the per-fight ceiling to ×4 but left
   two ×3 remnants in `aggregate()` (component (d) and the
   reconciliation target). The first analysis run therefore
   reported accounted 0.922 and recon error 38.7% — both wrong.
   Fixed (×4 in both places), selftest extended with §B3
   aggregate-identity checks (now 21 checks), test re-run green,
   analyzer re-run: accounted 0.768, recon 2.3%. The verdict kind
   is unchanged (METRIC-BROKEN either way), but the judged
   numbers in §1 are the corrected ones. The lesson is the same
   as ragepreempt-b's Correction 1: a ceiling change must be
   grepped for every use, including the aggregate — the selftest
   now pins the aggregate identity so a repeat fails loudly.
3. **The reconciliation band works as designed.** On the judged
   n=3 it passes at 2.3% (after the fix); on the exploratory
   n=97 it holds at 0.3%. The identity is exact when the counts
   are right — the earlier 38.7% was a code error, not a
   fight-shape mystery.
4. **The accounted/top bars pass on n=3 but mean nothing there.**
   The prereg correctly gates the verdict on the pool floor first.
   A future run could add a minimum-n condition on the
   decomposition bars themselves (e.g. accounted/top only judge
   when fled ≥ 8 — which the pool floor already enforces).
5. **Panel cross-band compare is structurally invalid.** The
   tool pairs by seed; different bands can never match. The
   prereg's "reproducibility reference" should have been the
   direct wall-number comparison all along — which is what §4
   reports. A future diagnostic on a fresh band should not
   promise a panel compare against a frozen corpus.

## 8. Blanks

- No 12–16-seed confirm: pilot NO-GO (METRIC-BROKEN), prereg
  gates the confirm on GO.
- Panel `invalid` (unmatched seeds — cross-band, §4); telemetry
  check refused recorder corpora (verbatim, §4).
- `node scripts/check.js --quick` was NOT run on this tip: the
  branch carries an evidence-only port of a NO-GO lever plus
  diagnostic tooling, and the check suite is the ship loop's
  concern for the evidence-only landing. The proofs that bind
  this arm all ran green on the tip: `test-allyslot3-b.js`
  18/18, `test-dmgshape-b.js` 5/5 (analyzer selftest 21/21),
  analyzer exit 0, driver exit 0, 0 instrument errors.

## 9. Findings notes for the coordinator (file these; do not edit sim-findings.md)

- **Tracker blank 1 — ANSWERED IN PART, pool-blocked:** the
  decomposition instrument works (identity 0.3% on 97 fled
  fights) and the gap structure is measured: base-rate ceiling
  43.7% of the gap, ally-delay 27.6%, verb loss 3.1%, miss loss
  0%. But the judged population (launched-quad fled fights) is
  n=3 on this band — the verdict is NO-GO METRIC-BROKEN, and the
  next run needs a launch-rich band (survey first) before the
  judged bars can be carried.
- **Binding constraint is the launch, not the damage rate:**
  5 wave-4+ launches in 8 seeds, all on one seed; 134 fought
  wave-4/5 encounters in the same corpus. The villages meet
  wave-4 monsters; they don't hunt them. Seed 105935 (standing
  680, 0 launches) is the sharpest single data point: standing
  does not trigger launching.
- **Late-Rage-fire recurs (1/8 Rage fights):** Fatima d118 fires
  R4 of 9; the doubled strikes land R6/R7/R9 because R4–R5 go to
  trick-hold + medicine. 3/8 Rage fights deal 0 damage. The
  cost of late fire is paid in rounds.
- **Misses don't exist in this corpus:** 0 zero-damage strikes
  in 326 attempts (hit rate 1.000). Any lever aimed at hit rate
  is aiming at nothing on this ground.
- **Out-of-scope gap (note only):** the d118 "Big Beast"
  double-naming — the volley lines use the village's nickname
  while the mechanics lines use the true name (same wrinkle as
  fightcap's d76 "Ugly Beast"). Minor fiction wrinkle; no action
  owed.
- **EVIDENCE-ONLY:** the ported ALLYSLOT3 slot must never merge
  to master as a game change (see header). The coordinator lands
  evidence-only or releases the branch done-abandoned.
