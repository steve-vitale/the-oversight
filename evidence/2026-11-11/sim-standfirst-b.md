# Standing points — first numbers (arm sim-standfirst-b)

Run fleshout-loop-b-20261111T1131Z, Loop B. Adoption of the timed-out
1131Z run (this arm's work on branch sim-standfirst-b). Coverage Program
Tier 2 (Steve order 2026-11-10 11:11 CST "Measure all"). Prereg:
evidence/2026-11-11/sim-standfirst-b-prereg.md (committed BEFORE any judged
sim). Base commit b09cf584e. Band 190351–190358, 8 seeds, competent policy
verbatim, 150d death-aware horizon, control + neutral legs on identical
seeds. Zero src/js. Instrument + proof: scripts/standfirst-instrument-20261111.js,
scripts/standfirst-driver-20261111.js, scripts/standfirst-analyze-20261111.js,
scripts/test-standfirst-b.js (52/52). Summary:
evidence/2026-11-11/standfirst-summary-standfirst-pilot.json. Per-seed corpus:
evidence/2026-11-11/perseed-standfirst-b/ (16 files: control + neutral per seed).

Canon: docs/CANON.md read first; there is NO dedicated standing/ladder
canon doc — the operative design is the victory-gating build brief
(Steve approved 2026-11-07) + legs 1–3 run notes + docs/TABLE.md
(seat pricing on ladder peak stage). Nothing is invented here.

Adoption notes (this file was written by the adoption, not the dead run):
the dead run's neutral seed 190358 was killed SIGTERM and never wrote
its file; the adoption re-ran ONLY neutral 190358 with the same
driver/policies (139d, village-lost, ladder stage 2 / 39 counted,
deaths 73, errors 0). The analyzer had never run — on first run it
crashed with `ReferenceError: clone is not defined` (the `clone`
helper is used 8 times in summarizeSeed and was never defined); the
adoption added the one-line helper to scripts/standfirst-analyze-20261111.js
and re-ran the analyzer + the 52/52 proof after the fix. The proof
passed before and after — it tests the classifiers, not summarizeSeed,
which is why the crash survived the proof.

## Verdict: GO on instrument validity + complete first-numbers capture

| GO check | Result |
|---|---|
| Every standing event classified by track + stage + outcome, none 'other' | PASS — 0 unclassified standing events across the pilot (1,994 events: stage beats carry a stage 1–3, cap beats a track, bundle events contributions + complete, reward events a stage + kind, overtime events a tier + interval, bank events a kind + points) |
| Every wrapped method's call path verified live or marked dead | PASS — 9 wraps live in the pilot (ladderTick, ladderStageBeat, ladderCapBeat, ladderGrantStageReward, ladderBankPoints, feastBundleCheck, hostFeast, overtimeTick, tele); 4 proven live in a fixture and dead under competent (ladderCashOut, ladderCapstoneReady, ladderDeliverCapstone, feastBundleBuyOut — all Haven-panel actions competent never calls) |
| Neutrality: OFF leg matches instrumented leg | PASS — 8/8 exact (days + end pantry kcal + deaths) |
| Instrument errors 0 | PASS — 0 on all seeds, control leg |
| Complete first-numbers capture | PASS — per-seed tables for metrics 1–10 below; sense-test scenes quoted (say corpus covers the 200-line Game.say cap per seed, early-game-only — the same caveat as the siblings; ladder beats are quoted from the event records, which are complete) |
| Engagement floor (≥5 counted ladder points band-wide) | PASS — 500 counted ladder points band-wide (sum of per-seed maxima) |

A GO verdict makes NO landing claim and spends NO confirm band: there is
no lever here to land.

## The headline: every village reaches National by day 50 — and it is Explore that carries them there

In 935 village-days across 8 seeds, the standing ladder is not a climb
but a sprint: every seed reaches National (stage 3) — first National
day 25–50, median ~33 — and all three stage rewards land on every
seed (24 grants: trader, shelter, link, one each per seed). The ladder
is carried almost entirely by one track: Explore ends at 21–42 on
every seed, always capped at 24, fed by codex breadth (88–175 — the
breadth term alone is worth up to 41 points). Fight, the track the
ladder was built to reward, is the weakest everywhere (1–7 points at
end). Forage swings with the roster (0–30) because summed XP dies
with the villagers who earned it. Talk gets nothing from links (0
seasoned regional+ links on any seed) and everything from contests
survived (10–21).

The old Standing bar tells the opposite story: the gated total sits at
199 — the wave-5 deferral — on 5 of 8 seeds, held there by the
veterans bar (248 deferral-days band-wide, veterans short on 5
seeds). Wave 4 unlocks on all 8 seeds (days 34–79); wave 5 unlocks
on only 2 (days 95, 117). The ladder says the village is National;
the old bar says it cannot face wave 5. Both are true at once: the
ladder measures breadth of work, the bar measures fighting strength,
and competent play produces the first without the second.

And the feast bundle — the ladder's other deed — never completes: 16
feasts, 48 bundle checks, best sheet 5 of 6 slots, 0 completions, 0
buy-outs. The capstone is never even read: `ladderCapstoneReady` was
called 0 times on any seed (it is a Haven-panel read competent never
drives), so no capstone was ready, delivered, or refused. The lesser
seat reads as offered on 6 of 8 seeds at end (all on peak stage);
the full seat is unreached everywhere.

## Per-seed table

| seed | days | end | deaths | standing (old) | wave | ladder peak/end (counted) | first Nat. day | feasts | bundles | banked | OT max tier |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 190351 | 132 | village-lost | 67 | 199 (gated) | 4 | 3/3 (81) | 33 | 1 | 0 | 81 | 1 |
| 190352 | 139 | village-lost | 90 | 325 | 5 | 3/3 (44) | 26 | 0 | 0 | 44 | 2 |
| 190353 | 122 | village-lost | 68 | 199 (gated) | 4 | 3/3 (45) | 34 | 0 | 0 | 45 | 1 |
| 190354 | 150 | village-lost | 100 | 199 (gated) | 4 | 3/3 (54) | 29 | 9 | 0 | 54 | 3 |
| 190355 | 55 | village-lost | 40 | 135 | 4 | 3/0 (11) | 39 | 3 | 0 | 11 | 0 |
| 190356 | 68 | village-lost | 56 | 100 | 4 | 3/3 (41) | 50 | 0 | 0 | 50 | 0 |
| 190357 | 130 | village-lost | 91 | 199 (gated) | 4 | 3/3 (43) | 34 | 0 | 0 | 43 | 2 |
| 190358 | 139 | village-lost | 73 | 285 | 5 | 3/2 (39) | 25 | 3 | 0 | 39 | 2 |

Totals: 935 village-days; 585 deaths; 0/8 survived to horizon
(median survival 131d by the per-seed days; the analyzer prints 132 —
median-definition difference, both from the same days list);
standing 100–470 raw; wins 0/8, national 0/8, lesser seat 6/8,
full seat 0/8.

## Metrics 1–10

1. **Ladder points by track over time.** End tracks (raw → counted):
   Explore dominates every seed (21–42 raw, capped at 24 except
   190356 at 21); Fight 1–7; Forage 0–30 (swings with roster
   turnover — 190352's forage falls 18 → 0 by end as the earners
   die); Craft 0–12; Talk 3–21 (all from contests survived, 10–21
   per seed — 0 from seasoned links). Cap hits: only 3 cap BEATS
   fired (explore on 190353 and 190355, craft on 190354 — the
   190354 craft cap fires on day 2, from the NPC XP occupation
   lean seeding craft XP at first touch), but the end snapshots show
   Explore capped on 7 of 8 seeds and Forage capped on 1 — the cap
   is a steady state, not an event. Discovery deeds: 0 on all seeds
   (READS 0 by construction — no lifetime per-deed store exists).
   Bundle bonus: 0 on all seeds.
2. **Stage reached + days at each stage.** Peak stage 3 on all 8
   seeds; first National day 25–50. Live stage falls below peak on
   5 seeds (dip-days: 190351 6, 190353 7, 190355 3 with a max dip
   of 3 — it falls from stage 3 to stage 0 in its last days,
   190356 2, 190358 5). The peak memory holds the seat bar while
   the live stage falls: the 6 lesser seats are all on peak stage,
   and the 2 'none' seeds (190355, 190356 — the shortest-lived,
   55d and 68d) failed on other deeds, not the ladder.
3. **Feast bundle.** 16 feasts, 48 bundle checks, 0 completions, 0
   buy-outs. Best sheet: 5 of 6 slots (seed 190354). Contributions
   seen: garden_harvest, guest_of_honor, kept_recipe,
   keepsake_channel (the day-34 feast on 190351 filled 4/6 with
   exactly those four, star + surge). Bundle bonus banked: 0.
4. **Capstone readiness.** `ladderCapstoneReady` called 0 times on
   any seed — the readiness READ is a Haven-panel action competent
   never drives, so readiness was never observed (not zero — the
   instrument records the read, and there was no read). Deliveries
   0. Mercy window: unobserved (no delivery, no window).
5. **Old Standing.** Raw 100–470; plenty cap bites once (190354:
   470 → 450). Gated total 199 (wave-5 deferral) on 5 seeds;
   wave-4 deferral days 8 (only 190351, weapons short); wave-5
   deferral days 248 band-wide, veterans the binding bar on 5
   seeds (weapons on 4, armor on 3). Peak ratchet: once wave 4
   releases, the total floors at its threshold — observed on all 8
   seeds (wave 4 unlocked days 34–79, never re-locked). Wave 5
   unlocked on 2 seeds only (190352 day 95, 190358 day 117).
6. **Standing vs the wave timer.** Overtime active 280 days
   band-wide; max tier 3 (190354: tier 1 day 114, tier 2 day 134,
   tier 3 day 150); max interval 27 days (190351 — 7 +
   floor(81/4)); 11 overtime tier-up teles. The stretch is real:
   a 12-point village waits ~10 days per tier, a 40-point village
   ~17 — the observed intervals run 18–27 days. The clock starts
   (table announced) while villages are still deferral-bound on
   wave 5 on 5 seeds — the overtime clock runs before the village
   is ready.
7. **Stage rewards.** 24 grants, 3 per seed, one per stage: trader
   (stage 1), shelter (stage 2, housing +2), link (stage 3, a link
   forms with the best-known unlinked village). 24 more grant
   attempts skipped as already-granted (the grant function is
   re-invoked on later stage beats and refuses the repeat). No
   grant ever failed for lack of a candidate; no missed stage (no
   0→2 jump occurred — every seed climbed rung by rung).
8. **Cash-out + bank.** `ladderCashOut` called 0 times (competent
   never cashes out). `ladderBankPoints` wrote once per seed at
   game over (kind 'lost'): 367 points banked band-wide
   (81/44/45/54/11/50/43/39). Banked head start read at run start:
   0 on all seeds (fresh process per seed, no cross-seed leakage —
   the guard holds). The bank's read side (head start applied to a
   new village) is unobserved in-run, recorded honestly, not zero.
9. **Say-line coherence.** Stage-beat lines name the numbers
   honestly — seed 190351 day 5: "Ladder — Village Standing 12/26
   to Regional Standing (Fight 0 · Forage 5 · Craft 5 · Talk 0 ·
   Explore 2) — short 14"; day 22: "Ladder — Regional Standing
   26/40 to National Standing (…) — short 14"; day 34: "Ladder —
   National Standing reached (Fight 0 · Forage 18 · Craft 8 ·
   Talk 3 · Explore 12)". Cap-beat line (190354 day 2): craft
   capped at rung 1 — matches the snapshot (craft at cap). Bundle
   line (190351 day 34): 4 contributions named, incomplete — matches
   the bundle sheet. Overtime tier teles (190354: tier 1 day 114,
   tier 2 day 134, tier 3 day 150) match the overtime ticks. No
   ladder/stage/cap/overtime line contradicted the live state it
   described. The general say corpus (200-line cap) fills in the
   first ~2 weeks and carries no ladder lines — the ladder beats
   are quoted from the complete event records instead.
10. **Wall numbers.** National 0/8, wins 0/8, lesser seat 6/8,
    full seat 0/8. Wave 4 unlocked 8/8, wave 5 unlocked 2/8.
    Median survival 131d. Deaths 585 over 935 village-days.
    Old standing 100–470. Ladder stage 3 (National) peak on 8/8.

## Neutrality

OFF leg (instrument OFF, same seeds, same policy) matches the
instrumented control leg exactly on days + end pantry kcal + deaths,
8/8 seeds. The instrument changes nothing numeric.

## Findings (for sim-findings.md)

- **Every village reaches National by day 50 under plain competent
  play** — peak stage 3 on 8/8 seeds, first National day 25–50.
  The ladder's National rung is not a climb for competent play; it
  is reached in the first month. The ladder measures breadth of
  work, and competent play is broad.
- **Explore carries the ladder; Fight barely registers** — Explore
  ends 21–42 on every seed (capped at 24 on 7/8), fed by codex
  breadth (88–175); Fight ends 1–7 everywhere. The ladder's
  Fight track — the one that prices the wave-ledger kills — is the
  smallest contributor on every seed.
- **The old bar contradicts the ladder on wave 5** — the gated
  total sits at 199 on 5/8 seeds (248 deferral-days, veterans the
  binding bar) while the ladder reads National. Wave 5 unlocks on
  2/8 seeds. Competent play earns National standing without
  earning the right to face wave 5.
- **The feast bundle never completes** — 16 feasts, 48 checks, best
  sheet 5/6, 0 completions, 0 buy-outs. The bundle is the ladder's
  other deed and it never lands in lived play.
- **Capstone readiness is never read in lived play** —
  `ladderCapstoneReady` called 0 times on any seed; the readiness
  READ is a Haven-panel action competent never drives. The full
  seat is unreached everywhere, and the instrument cannot say
  whether any seed was ever capstone-ready — the read itself never
  happens.
- **The craft cap binds on day 2** — the NPC XP occupation lean
  seeds craft XP at first touch, so the per-track cap is already
  binding before the village has done any craft work. The cap
  measures the lean as much as the work (prereg caveat, now
  observed).

## Metric review (§14)

- The metric set held. Two honest gaps: (a) the say corpus
  (200-line Game.say cap) fills in the first ~2 weeks and carries
  no ladder lines — metric 9 was judged from the complete ladder
  event records instead, and that substitution is recorded here,
  not hidden. (b) The analyzer's `medianDays` (132) differs by one
  from the standard median of the per-seed days (131) — the
  analyzer's median definition is not the textbook one; the per-seed
  days list is the source of truth and both numbers are reported.
- The analyzer crash (`clone` undefined) is an adoption fix, not a
  re-score: the analyzer had never run before this adoption, so the
  missing helper was never caught. The proof (52/52) tests the
  classifiers, not summarizeSeed — the proof cannot catch a missing
  helper in the aggregation path. A proof run of the analyzer on a
  real corpus is the missing coverage; the adoption ran the analyzer
  on the real 16-file corpus and it now completes.
- Capstone readiness being unread is a measurement gap, not a GO
  miss: the prereg's bar is "each wrap live in the pilot, or proven
  live in a fixture and marked dead" — the read is proven live in
  a fixture and dead under competent, so the row passes. But the
  consequence is real: this pilot cannot judge capstone readiness
  in lived play at all. A driver that plays the Haven panel (or a
  direct readiness probe) is the next question, not this pilot's.
