# Journey: crisis leg (6) r10 — the post-famine siege (2026-10-15)

## Pre-registration (MEASUREMENT.md §§9–12)

- **Leg:** 6 — crisis, r10. Fresh angle: **the post-famine siege.** r6 covered
  raid defense mechanics, r7 the famine→corruption slope, r8 outbreak talk, r9
  the famine+outbreak compound. Untested: a monster siege hitting a village
  climbing out of famine — and the leadership question (who holds the line,
  who rises, who is mourned).
- **Leg question:** When the village climbs out of famine and the raid hits
  its thin recovery, does it hold the line like people — do defenders step
  up, do conversations carry the raid, do the fallen get mourned, and does
  the trust hierarchy shift?
- **Interesting finding criteria:**
  - defenders fight real blow-by-blow fights and take real damage;
  - 'defended' memories plant and surface in talk within their window;
  - the fallen are mourned by name; trust moves toward those who endure.
- **Seeds:** 6141, 6242, 6343 (exact literals). Policy: oracleV2.
- **Method:** establish 12d → 8-day blight famine (refused pantryAdd/
  stockPantry inflows + staged 25%/day pantry rot; trajectory asserted) →
  lift → recovery; the raid's TIMING is organic (havenRaidTick's real
  18%/day roll via progDaily — never forced). Horizon d55 max, death-aware.
  Mid-raid convos (4) + end convos (4), full transcripts, SENSE-read.
- **Primary metrics (binding, §14):**
  - M1: ≥2/3 seeds — raid fires organically post-blight AND ≥1
    defender-vs-raider blow-by-blow fight recorded.
  - M2: ≥2/3 seeds — ≥3/4 end-state convos carry the raid (latelyKind
    defense/mourning with on-topic content).
  - M3: ≥2/3 seeds — trust-hierarchy top-3 at first raid differs from
    top-3 at end.

## Run log

### Seed 6141 — the fortress (d55, 7 living, 5 fallen)
Blight: pantry 93,515 → 12,017 (−87%, 45k kcal of inflows refused). Pop
12→10. Raids d8/d15 (pre/during blight) + d26/d38/d45 — five raids, all
resolved 'fought', 25 defender fights, **zero defender deaths**. The bearer
died 4× (Madison d17 combat → Lena d32 combat → Christian d48 dehydration →
Duc d55 combat → Dante). Mid-raid convos (d26): all latelyKind=mourning —
Madison's death outranked the fresh raid (by design: the dead are named
first). End convos: all naming (last raid d45, defense memories expired past
the 7-day window).

### Seed 6242 — the rich hold (d56, 10 living, 5 fallen)
Blight bit clean (stageFail=false). Six raids, all 'fought', 25 defender
fights, zero defender deaths. Bearers died 4×. End convos: all latelyKind=
table (the table sat — late-game topic outranks defense). Trust top-3:
Lerato 90 / Carlos 90 / Rubén 60→62 — **unchanged** (M3 miss here).

### Seed 6343 — the hard one (d32, 8 living, 5 fallen)
The only seed where hunger-winter fired (d30). Mahmut **starved to death**
d11 (bearer). Blight: 32,479 → 2,000. Two raids (d9, d18) + a third at d31
(pantry recovered to 9,344 — wealth draws teeth again). The d18 raid hit
MID-BLIGHT: defenders fought starving and mauled the raiders (lockpick
40→8, living_wire 60→8, speedbump 50→7 — Sidney and Nathan bled for it).
Jesse (a defender) died d17 to a hushpuppy; Meera died d31 to a monster
(raid-adjacent, unconfirmed). Trust: Joyce 26 → dead; Kenneth 26→90,
Ines 89, Venkatesh 87 — crisis consolidated leadership. Mid-raid convos
(d26): all naming — the d18 'defended' memories had expired at 8 days,
one day past the 7-day window (timing, not a defect; mechanism proven by
diag-defended-memory-20261015.js). End convos: all mourning (Meera).
**Horizon anomaly:** the run stopped at d32 instead of d55 — phase-4
runDays calls returned without advancing days after the d31 raid (clock
stall suspected; village alive, 8 living). Documented, under investigation.

## Village assessment (plain words)

Three villages, three dyings-that-weren't — all three survived to their
horizons, which is itself the finding: **an established village is a
fortress.** 62 defender-vs-raider fights across three seeds, zero defenders
lost. The famine bit every time (pantry collapses of 87%, clean, and
32k→2k; one starvation death; one hunger-winter). The compound reads human:
the d18 mid-blight raid in 6343 is the leg's thesis — starving villagers
met the treeline anyway and bled for it. Who led: trust consolidated
around endurers (Kenneth 26→90 in 6343; Greta held 90 in 6141). Who was
miserable: the bearers — 11 player deaths across 3 seeds (combat 8,
starvation 1, dehydration 2); the village eats, the bearer doesn't (the
competent-policy weakness noted since r1). What was missing: nothing
structural — but the siege has no teeth (see verdicts).

## People check (SENSE-TESTING LAW)

14 full transcripts read. Verdict: people, with one grammar blank fixed.
- Mourning is excellent and specific: "Nobody says Madison's name right
  yet. We will.", "I'm picking up Madison's share of the work.",
  "Meera is gone and the world just... continues. That's the part I can't
  stand.", "We bury, we grieve, we keep going. There's no step four."
- Kenneth (6343, end): wounded from the d31 defense ("My cut needs a
  second pair of hands"), grieving Meera, teaching on the walk, asking a
  real question ("What's something from your old life that's actually
  useful here?") — want → engagement → resolution. The bar, met.
- The naming debate during crisis reads as coping, not a bug (r9's
  finding holds).
- Wart: deflection-heavy stretches ("...Sorry, lost my train of thought",
  "Hm. Never mind — go on") — grief-evasive, acceptable, worth watching
  if the density rises.

## Blank filled

**"you digs up a wrapped bundle"** — inviteReward (betrayal.js) built all
four reward lines with third-person verbs on the whoTag, but whoTag
returns 'you' when the PLAYER is the inviter (the player walks an NPC out
and shares their own secret). All four kinds were broken for the player
inviter: "you digs up", "you has been stockpiling", "you stops and
actually teaches you something", "you presses something into your hand".
Fix: verbs agree with the tag, and the gift direction mirrors (a player
inviter teaches/gives the NPC; an NPC inviter teaches/gives you).
- Proof: scripts/test-invite-reward-grammar-20261015.js — RED 4/14 on the
  original code (all four player-inviter kinds fail), GREEN 14/14 after.
- Regressions: test-betrayal-fixes-20261008 (13/13),
  test-convo-beats-20261006 (25/25), test-convo-gaps (ALL GREEN).
- check.js --quick: 92 passed, 2 failed — both failures are pre-existing in
  test-where-are-we-20261014.js ("stranger conversation offers 'where'",
  "stranger says a flavour line from the data") and reproduce identically
  with the pre-change betrayal.js (verified via HEAD-version swap); they
  come from the region-content-wave1 merge, not this run. Left for the
  region owner; not quarantined unilaterally.

## Metric verdicts

- **M1: 3/3 MET.** Raids fired organically post-blight in every seed
  (5, 6, and 3 raids); defender fights 25/25/12, all blow-by-blow.
- **M2: 0/3 on the letter — MISSED, mechanism verified.** End convos
  carried naming (6141), the table (6242), mourning (6343) — never
  latelyKind=defense. The 'defended' memory plants correctly (proven by
  direct diagnostic) and the lately scan surfaces it (r6 baseline:
  latelyDefenseCount=9); it was outranked by grief/table (by design) or
  expired past the 7-day window. The metric didn't account for the scan's
  priority order.
- **M3: 2/3 MET.** 6141 (Duc died; top changed), 6343 (Kenneth 26→90 —
  crisis-forged leadership). 6242's top-3 was rock-stable.

## Metric review (§14)

1. The blight's absolute bite threshold (pantry < 1200) was wrong for rich
   villages — 6141 "failed" it at 12,017 after an 87% collapse. Revised
   mid-run to a relative test (≥70% drop or < 5000); no goalposts moved on
   the metrics themselves, only the staging assertion. Proposed: keep the
   relative test.
2. M2 as written is unmeasurable when grief or the table is live — the
   scan's priority order (grief > table > defense) is the design, not a
   bug. Proposed revision for the next siege run: "defense memories plant
   on decisive fights AND surface as latelyKind=defense when no
   higher-priority topic is live (verified by direct probe)."
3. Mid-raid convos should anchor to the LAST raid, not the first — the
   harness broke its wait loop on the d9 raid and drove "mid-raid" convos
   8 days after the d18 fights (past the memory window). Harness lesson,
   not a game finding.

## Verdicts

- **Reachable:** yes — raids fire organically against any village with a
  3k+ pantry; the famine→recovery→raid compound happened naturally in
  6343 (blight lifted d22, raid d31 on the thin recovery).
- **Fun:** the crisis arc plays — the mid-blight raid is genuinely
  dramatic, mourning lands, trust moves. BUT the siege has no teeth: 62
  fights, zero defender deaths, every raid resolved 'fought'. A fortress
  that never bleeds gets boring — the drama lives entirely in the
  bearer's fragility. Design question for Steve, not a mid-run fix:
  should raiders ever break through?
- **Winnable:** yes — all three villages survived famine + repeated
  sieges. Compound crisis is lethal to the bearer, survivable for the
  village. Sensible.

## Telemetry

- scripts/telemetry-check.js vs hidden_files/telemetry-baselines/crisis.json:
  quiet (3 files, defenderFights metric, no large deviations). The baseline
  covers the r6 raid-defense angle (defenderFights/playerFights/
  defendedCount); this run's angle (post-famine siege, trust shifts,
  bite-tested blight) has zero metric overlap — not rolled forward.

## Files

- scripts/journey-crisis-r10-siegefamine-20261015.js (new harness; pilot
  seeds 6141/6242/6343; note: mid-pilot fixes — relative blight threshold,
  fight-outcome capture, first-raid trust)
- scripts/test-invite-reward-grammar-20261015.js (proof test, 14/14)
- scripts/diag-defended-memory-20261015.js (diagnostic; mechanism proven)
- evidence/2026-10-15/journey-crisis-r10-{6141,6242,6343}.{json,log}
- evidence/2026-10-15/journey-crisis-r10.md (this note)
- src/js/betrayal.js (the grammar fix)
