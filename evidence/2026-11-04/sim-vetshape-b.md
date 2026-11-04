# VETSHAPE living-OR-DEAD instrument — Loop B verdict (run fleshout-loop-b-20261104T2125Z, arm sim-vetshape-b)

Axis: winnability chain, track B shape question (tracker blank from
the 2026-11-04 2015Z run). INSTRUMENT ONLY, zero src/js. No default,
gate, price, deed, or readyDemand number changed. The veterans bar
was NOT flipped to count dead killers — the counterfactual is
computed offline from the kill log + fallen list, never by changing
what the engine counts.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-vetshape-b-prereg.md`
(commit 8381e2d0c). In short: vetprod's band/seeds/policies exactly
(seeds 99101–99108, competent policy verbatim, default env), 150d
death-aware horizon (+10d tail max), fresh re-runs with the vetprod
instrument reused verbatim. PRIMARY metric: seeds reaching 2
living-or-dead veterans (shape) vs 2 living veterans. Verdict
DIAG-GO for a survivorship lever iff shape >= 2 on >= 5/8 seeds
while living >= 2 on <= 1/8; otherwise DIAG-NO-CANDIDATE;
INSUFFICIENT-DATA only if > 2 seeds carry instrument errors.
Secondary: peak shape, days at shape >= 2, window peaks/days at
>= 2 (W = 14/30/60d), kill-to-death intervals and causes,
died-before-second-banked flags, counterfactual-ready days.
Balanced panel (§15): INAPPLICABLE for a pure diagnostic
counterfactual — stated, not fabricated.

## Grounding verified in code before the pilot (not assumed)

- `src/js/standing.js` `waveCombatReadiness(w)`: VETERANS = DISTINCT
  killer vids with a wave-(w-1)+ kill in `state.waveKillLog`, LIVING
  only by default. The default-OFF `VETSHAPE=1` instrument counts
  living-OR-DEAD; it was NOT flipped here (vetprod established this;
  re-confirmed by reading, not re-assumed).
- `src/js/game.js` `recordWaveKill`: the per-kill choke point; the
  log is append-only and survives the killer's death — which is
  exactly why the living-or-dead counterfactual is computable at
  all. Death days/causes come from the engine's own fallen list
  (vetprod's `killerFates`, reused as the single source of truth,
  not re-implemented divergently).
- Canon: `docs/MONSTER-WAVES.md` ("Standing opens the wave door;
  combat readiness decides whether the village walks through";
  VETERANS = living roster members with a wave-(w-1)+ kill).
  No canon invented.

## Verdict — DIAG-NO-CANDIDATE (judged strictly against the prereg)

- Shape >= 2 on 2/8 seeds (99101, 99104). Living >= 2 on 0/8.
  The prereg bar for DIAG-GO (shape >= 5/8 with living <= 1/8)
  is not met — and not close. No re-scoring against a friendlier
  bar.
- Instrument errors 0 on all 8 seeds (~860 daily snapshots,
  42 wave-4 fight events, 8 wave-4 kills, full fallen lists).
- Proof: `scripts/test-vetshape-20261104.js` — 36/36 PASS
  (fixture tests for overlap, same-day kill-and-die, window
  expiry, base-wave exclusion, counterfactual-ready days;
  corpus-agreement legs; live harness smoke).
- THE ANSWER, in one line: counting dead killers would NOT have
  released any village on this band — shape reaches 2 on only
  two seeds, and on neither seed does a shape->=2 day coincide
  with the other release conditions (see "Counterfactual
  release" below). A VETSHAPE default flip alone changes
  nothing here. The binding shape is narrower than "dead
  killers don't count": kills are too few, killers die too
  fast, AND the other readiness legs are short on the days
  shape finally reaches 2.

## Reproduction check (fresh corpus vs vetprod, seed by seed)

The fresh vetshape pilot reproduces vetprod's shared numbers
EXACTLY on every compared field, all 8 seeds: days, end reasons,
peak gated standing, wave-4 fight/kill counts, engine daily max
vets (1 / 0 / 1 / 1 / 1 / 0 / 0 / 0), reconstructed max living,
killer identities, kill days, and death days. The instrument did
not perturb the trajectories it measured, and the band is
deterministic across runs (vetprod's determinism leg, now
re-confirmed on a full 8-seed re-run, not just a smoke seed).

| seed | days | end | peak gated | w4 fights | w4 kills | killers ever | peak living | peak shape | first shape-2 | days shape>=2 |
|------|------|-----|------------|-----------|----------|--------------|-------------|------------|---------------|---------------|
| 99101 | 150 | survived | 199 | 13 | 3 | 3 | 1 | 3 | d123 | 29 |
| 99102 | 116 | lost | 199 | 0 | 0 | 0 | 0 | 0 | — | 0 |
| 99103 | 121 | lost | 180 | 17 | 1 | 1 | 1 | 1 | — | 0 |
| 99104 | 150 | survived | 199 | 8 | 3 | 2 | 1 | 2 | d149 | 3 |
| 99105 | 52 | lost | 140 | 4 | 1 | 1 | 1 | 1 | — | 0 |
| 99106 | 59 | lost | 150 | 0 | 0 | 0 | 0 | 0 | — | 0 |
| 99107 | 72 | lost | 50 | 0 | 0 | 0 | 0 | 0 | — | 0 |
| 99108 | 48 | lost | 20 | 0 | 0 | 0 | 0 | 0 | — | 0 |

## Counterfactual release: would counting dead killers have released anyone?

NO — zero counterfactual-ready days on all 8 seeds, under BOTH
definitions (see Metric review for why two definitions exist):

- V1 (gated >= 200 + shape >= 2 + other legs met): 0 days.
- V2 (raw >= 200 + shape >= 2 + other legs met): 0 days.
- The reason is timing, twice over:
  - 99101: shape reaches 2 on d123 and stays >= 2 for 29 days
    (peak shape 3), with raw standing 310–355 — but on every
    one of those days the armor and/or weapons legs were ALSO
    short (d130: armor + weapons + veterans; d140: weapons +
    veterans; d150: armor + weapons + veterans). The only-
    veterans-short days on this seed end at d105 — 18 days
    BEFORE the second killer is banked. The village had the
    standing and, counterfactually, the veterans, but never
    both at once with the gear legs.
  - 99104: the one-day miss. Days d147–d148 have raw 200 and
    short == [veterans] only — the village is one veteran
    short of release with everything else met. The second
    killer is banked on d149 — and on that very day the
    weapons leg slips (short becomes [weapons, veterans])
    and stays slipped through d150. Under living-or-dead
    counting the village misses release by a single day, on
    the gear leg, not the veterans leg.
- So the shape question has a two-part answer: (1) dead-killer
  counting alone reaches 2 on only 2/8 seeds — too few to be
  the lever; (2) even where it reaches 2, release still
  fails on other legs. A survivorship lever that merely kept
  killers alive longer would still face the gear legs on
  these seeds. Any next arm must carry that conjunction, not
  just "keep killers alive."

## Windows: how much simultaneity does "recently dead" buy?

Window_W(d) counts a killer while alive OR dead less than W days
(see prereg for exact semantics; death day itself counts).

| seed | peak W14 | days W14>=2 | peak W30 | days W30>=2 | peak W60 | days W60>=2 |
|------|----------|-------------|----------|-------------|----------|-------------|
| 99101 | 1 | 0 | 2 | 24 | 3 | 29 |
| 99104 | 1 | 0 | 2 | 2 | 2 | 3 |
| all others | 0–1 | 0 | 0–1 | 0 | 0–1 | 0 |

- A 14-day grace buys NOTHING on any seed: no seed ever holds 2
  killers within 14 days of each other. The killers are spaced
  further apart than a fortnight, or die the day they kill.
- A 30-day grace buys a real window on 99101 (24 days at >= 2)
  and a 2-day window on 99104 — but, per the release analysis
  above, neither window overlaps a day when the other legs are
  met (99101's only-veterans days end d105; 99104's end d148
  while its W30 window starts d149). Grace windows widen the
  shape without opening the door.
- A 60-day grace equals the cumulative shape on both seeds
  (all killers die within 60 days of the next banking, or the
  horizon ends first).

## Killer survivorship (the shape's cause)

Intervals (kill-to-death, first kill to death day), all seeds:
[0, 0, 2, 5, 7, 14] days — median 3.5 days, exactly vetprod's
number, re-confirmed. Death causes: the wild x3, the arena x1,
contest x1, a wound that wouldn't close x1. One killer alive at
end of run (99105's, blooded d51, village lost d52).

| seed | killer | kills (days) | death day (cause) | interval |
|------|--------|--------------|-------------------|----------|
| 99101 | gen_0tkxrod | 1 (d101) | d106 (the wild) | 5d |
| 99101 | aria_thompson | 1 (d123) | d123 (the arena) | 0d |
| 99101 | stan_kowalski | 1 (d141) | d143 (contest) | 2d |
| 99103 | app_mgpspie3545 | 1 (d74) | d81 (the wild) | 7d |
| 99104 | gen_ciish5s | 2 (d107, d120) | d121 (the wild) | 14d |
| 99104 | visjoin_145 | 1 (d149) | d149 (wound) | 0d |
| 99105 | gen_imdatzd | 1 (d51) | — (alive) | — |

- Died-before-second-banked: TRUE on 2/2 seeds where a second
  killer was ever banked (99101: first killer dies d106, second
  banked d123; 99104: first killer dies d121, second banked
  d149). On every seed that eventually banks two killers, the
  first is already dead when the second arrives. The living
  bar never sees two at once because the banking interval
  (17–28 days) dwarfs killer survival (median 3.5 days).
- Killers die before a second killer is ever banked — yes, on
  both applicable seeds; on the other two facing seeds only
  one killer is ever banked at all, and on the four never-
  faced seeds none is.

## Wall numbers (this corpus, baseline observations, not wall movement)

Wins 0/8. National 0/8, table 0/8 (scaleRank "village" on all 8;
no seed leaves village scale). Wave-4 unlocks 6/8, wave-4 faced
4/8 (99101, 99103, 99104, 99105), wave-5 unlocks 0/8, wave-5
faced 0/8. Readiness-5-ready days 0/8 (engine `ready` flag never
true on any daily snapshot). Median run-days 94 (days sorted
48 / 52 / 59 / 72 / 116 / 121 / 150 / 150; 2 seeds censored at
the 150d horizon: 99101, 99104 survived). Death-cause shares
for villages generally: not instrumented by this arm — not
reported, not guessed. Killer death causes (above) are the only
death-cause numbers this arm owns.

## Village assessment (plain words)

Picture eight villages playing competently. Four never meet the
fourth draft at all — two because the door never opened, two
because it opened and nothing came through. The other four
fight it and blood a fighter or three — and then watch those
fighters die within days: one the same afternoon in the arena,
one the same day of a wound that wouldn't close, the rest
within a fortnight in the wilds. Now count the dead as well as
the living, as this arm does: still only two villages ever hold
two blooded fighters even on paper, and neither of those two
ever has its gear in order on the days its dead would count.
One village comes within a single day — every leg met, one
veteran short, and the second fighter arrives the day the
weapons slip. The bar is not one lock with one key. It is a
roster that cannot keep two killers alive at once, a kill rate
too thin to bank two in the first place, and gear legs that
slip exactly when the veterans arrive. Counting the dead
fixes none of the three on this band.

What knowledge/capabilities were missing: not measured as
knowledge here — the missing capabilities are simultaneity
(two killers alive, or at least recently alive, together),
encounter opportunity (the unlocked-but-unmet seeds), and
gear-leg stability through the banking window. No villager
behavior was flagged as robotic by this arm's corpus; the
sense-test gap is the veteran-word collision below.

## Sense-test (this arm's own corpus, judged for meaning)

- The veteran-word collision REPRODUCES in this arm's corpus,
  verbatim: the System celebrates wave-3 kills as "veteran
  kills" ("Naran just put down Spool... on CAMERA. That's a
  veteran kill, folks. REMEMBER the name." — d44, 99101; same
  line for The Focus Group, The Redactor, The Loud Beast, The
  Callback, Ad Break, The Terms of Service), while the same
  corpus warns of monster veterans ("A Scarred veteran" d98,
  "A Elder veteran" d138, 99101) and the readiness bar wants
  villager veterans. A player hearing "veteran kill" for a
  Spool would reasonably think they are banking wave-5
  veterans. They are not — and now the counterfactual shows
  the confusion cuts the other way too: even real wave-4
  killers, dead, would not have opened the door.
- Village voice reads as people deliberating, not robots:
  "Half rations for three days, voted and held — or a hard
  hunt now, hungry, to fill the bins before it's choosing-
  who-eats." (d150, 99101) — a genuine dilemma, voted on,
  with the stakes named. The flashback lines ("held the
  compass flat, found north, and walked out like it was
  nothing. It was not nothing.") carry personal voice.
- Say-sample note: the filter matches vetprod's with the cap
  raised 150 -> 300 per the vetprod metric review; captured
  96 lines on 99101 (sayCount 14846) and 48 on 99104
  (sayCount 14339). The sample is combat-filtered by design;
  no peak-day hold line was captured verbatim here either
  (the hold line itself is quoted in vetprod/standaccum and
  is not re-quoted from a line this arm did not capture).

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- PRIMARY metric held up and refused the lever cleanly: shape
  2/8 vs the 5/8 bar is not a near miss, and living 0/8
  confirms simultaneity is absent, not merely undercounted.
  The verdict does not depend on the secondary definitions.
- CF-READY V1 WAS CIRCULAR — caught and fixed BEFORE judging
  (analyzer commit 10444922e, before the pilot analysis; the
  prereg's primary metric and verdict rule are untouched).
  V1 required gated >= 200, but the engine caps gated standing
  at 199 while a village is held — so V1 can never fire on a
  held seed, and its 0 is an artifact, not a finding. V2
  (raw >= 200 + shape >= 2 + other legs met) is the real
  counterfactual, and it ALSO reads 0 days — but for a real
  reason (other legs short on shape>=2 days). Both numbers
  are reported so the correction is auditable. Any future
  arm using gated standing as a release proxy must use raw
  standing instead; gated is the gate's output, not its input.
- Window semantics held up: death-day-inclusive counting is
  what makes same-day kill-and-die visible in windows (the
  fixture test pins this), and the W14-never-2 result is
  robust to that choice — excluding the death day would only
  lower window counts.
- Short-leg names vary in snapshots ('armor'/'weapons' vs
  'armored'/'armed' on different days); the cf filter only
  requires short == ['veterans'] exactly, so the variation
  cannot inflate the count — it can only exclude days, and
  the excluded days are shown in the release analysis.
- Say cap 300 (up from vetprod's 150) did not surface a
  peak-day hold line; the next arm wanting one should anchor
  the sample at peak-standing days rather than raising the
  cap further.

## Next blanks, in order (proposals only — this arm builds nothing)

1. Survivorship + gear-stability as ONE next arm (NOT a
   VETSHAPE flip): the evidence says a flip alone releases
   0/8. A lever worth pre-registering would keep wave-4
   killers alive through the banking window (killer
   protection/rotation: rest, guard, or hold-from-field
   doctrine for a blooded fighter until a second is banked)
   AND hold the gear legs steady across that window — with
   its own prereg, its own band, and release days (not just
   shape) as primary. Do NOT flip the VETSHAPE default on
   this evidence: it changes the count on 2/8 seeds and the
   outcome on 0/8.
2. Track A unchanged (vetprod blank 1, first half): encounter
   opportunity for the unlocked-but-unmet seeds (99102,
   99106: wave 4 unlocked, zero wave-4 fights) — spawn/
   encounter routing, not demand numbers. This arm adds one
   precision to it: even perfect encounters would still face
   the survivorship + gear conjunction above.
3. Veteran-word collision (sense-test finding, naming pass,
   not mechanics): the game calls hardened monsters, wave-3
   kills, and blooded villagers all "veterans" on screen.
   Needs a design eye, not a sim.

## Proof and landing

- Proof: `scripts/test-vetshape-20261104.js` — 36/36 PASS
  (fixture tests + vetprod-corpus agreement + live smoke).
- Commits (this worktree branch sim-vetshape-b; coordinator
  merges via --ff-only; merged locally, pending ship — no
  push, no bump, no live verification by this worker):
  - 8381e2d0c sim-vetshape-b prereg (before any judged sim)
  - 989def1b4b sim-vetshape-b instruments + proof 35/35 (zero src/js)
  - 10444922e sim-vetshape-b cf-ready V2 (raw standing) + test (36/36)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-vetshape-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-vetshape-b/` (8 files,
  vetshape-pilot run); pilot driver log
  `evidence/2026-11-04/vetshape-pilot-driver.log`; scripts
  `vetshape-analyze-20261104.js`,
  `vetshape-driver-20261104.js`,
  `test-vetshape-20261104.js` (vetprod instrument reused
  verbatim, zero src/js anywhere in this arm).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the main index after all three commits;
  repaired each time via HEAD-blob `update-index
  --cacheinfo` and verified `git status` empty +
  `git diff HEAD` empty. The commits themselves were always
  correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence commit
  below (verified before reporting).
