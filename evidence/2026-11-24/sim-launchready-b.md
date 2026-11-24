# sim-launchready-b — DIAG: do launched parties depart spent? (corpus read)

## 1. Verdict — DIAG-NO-GO on instrument (B1 fails)

**The existing corpus cannot answer the launch-fitness question.** The
dawn-census join rate is 0.047 on the arm leg (20/426 departs) and 0.081 on
the control leg (40/493) against the frozen floor of 0.80. The census
covers dawn-bid holders only; most departures are not dawn bids, so there
is no departure health to read for 95% of launches. Per the prereg, the
question then needs the fresh band, full stop — no verdict on HP is drawn
from the joined sliver.

The fresh-band measurement (departure-instant HP + loaded weapon + ammo per
member, as ragecarry §10 prescribes) stays open as the next run's blank.
This DIAG's job was to test whether the corpus could answer it first; it
cannot.

## 2. Prereg (frozen, no amendments)

Prereg: `evidence/2026-11-24/sim-launchready-b-prereg.md` (frozen ~19:25Z).
Corpus: ragecarry confirm arm leg (12 seeds 107901–107912) primary, control
leg (12 files as counted) as reference. No new sims, no game-code change.

## 3. Method

Analyzer: `scripts/analyze-launchready-b.js`. It joins `v4departs` rows to
`dawnbidCensus` rows on (vid, day) and reports holder HP at departure, the
armed share at departure, and flee HP fractions.
Proof: `scripts/test-launchready-b.js` — 4/4 PASS (quartile math, join
semantics, armed-share split, real-corpus determinism + frozen numbers).
Analysis JSON: `evidence/2026-11-24/launchready-b-analysis.json`.
Two test bugs were fixed during the run (float median comparison; a wrong
hand-computed median) — both in the test's expectations, not the analyzer;
the analyzer output never changed.

## 4. Results (judged only against the frozen bars)

| Bar | Result |
|---|---|
| B1 join rate ≥ 0.80 | **FAIL** — arm 20/426 = 0.047, ctl 40/493 = 0.081 |
| B2 distribution complete (≥ 10 departures) | NOT JUDGED — the join fails first; distributions below are context only |
| B3 verdict stated | NOT JUDGED — no HP verdict can be drawn from a 4.7% join |
| B4 instrument health | PASS — 0 parse errors, selftest 4/4, determinism byte-identical |

Corpus counts (both legs): arm 426 departs (255 launch, 171 hold); ctl 493
departs (286 launch, 207 hold).

Joined sliver (context ONLY — dawn-bid holders, n=20 arm / 40 ctl, biased
sample, carries no verdict): arm median HP 76 (min 26, max 91; launches
only n=11, median 78, min 46); ctl median 81 (min 10, max 100; launches
n=29, median 79, min 10). Share < 50 HP: 0.10 arm, 0.125 ctl. The sliver
looks healthy — but it is the dawn-bid subset, and with a 4.7% join it
cannot say whether Alberto (~14 HP, 107902 d66) is the pattern or the
outlier. The arm's joined launches contain no case below 46 HP; the
control's contain one at 10 HP. Neither number is a finding.

Context from fields recorded on EVERY departs row (not the verdict, but a
lead for the fresh-band instrument): launched parties are half-armed at
departure — armed share median 0.5 on both legs (q1 0.5, q3 0.5, max 0.75),
with some launches at 0 (nobody armed). Hold rows sit at median 0, as
expected for single holders waiting. Flee HP fractions: median 0.23 arm /
0.20 ctl — parties flee at roughly a quarter health, which is encounter
data, not departure data.

## 5. Sense-test

The numbers are coherent with the recorder's design: the dawn census exists
to price the dawn bid, not to stamp departures. Departures happen all day
(426 departs over 12 seeds ≈ 35 per seed over 150 days); the census only
sees the dawn-bid holders. Expecting the census to cover departures was
the instrument's error, not the corpus's. The half-armed launch share reads
true as a pattern (pairs where only the holder carries a weapon), and it is
the one launch-fitness signal this corpus CAN see — but it says nothing
about HP or ammunition, which is what the ragecarry finding asked for.

## 6. Wall numbers (this corpus — as recorded by ragecarry confirm, not re-judged)

National 0/12, wins 0/12, wave-5 4/12 ctl vs 2/12 arm (confirm band).
The scale wall stands. This DIAG does not move it.

## 7. Blanks filled / documented, and metric review

**Documented (not fixed here):**
- The corpus cannot answer launch fitness: join 0.047/0.081 vs the 0.80
  floor. The fresh band needs a departure-stamping driver (HP + weapon +
  loaded state + ammo per member at the departure instant) — the ragecarry
  §10 prescription stands, now with the exact missing fields named.
- Lead for that instrument: launched parties are half-armed (median 0.5
  armed share on 255 arm + 286 ctl launches). If the fresh band confirms
  the same shape with loadout data, the fix is a departure-fitness check
  (arm + load before launch), not a damage lever.
- Alberto (~14 HP, unloaded sling) is neither confirmed as the pattern nor
  refuted as an outlier — the joined sample is too small and too biased.

**Metric review (frozen bars NOT re-scored):** B1 did its job — it stopped
a weak verdict from being drawn on a 4.7% join. The prereg's mistake was
assuming the census covered departures; a corpus DIAG's prereg should verify
join coverage on ONE file before freezing the floor. The armed-share
context suggests a future bar could be written on fields recorded on every
row (partyArmed), rather than on a joined field.

## 8. Closeout state

- Coordinator-run corpus DIAG (worktree registrations for the fresh-band
  version failed three times on the container write flap + registry-lock
  queue; see round record). Precedent: Loop A 1115Z coordinator-run DIAGs.
- Files: prereg + analyzer + proof test + analysis JSON + this evidence.
  Zero src/js. Proof 4/4.
- **Ready to merge, pending ship.** Do NOT push, do NOT bump versions.
  The ship loop owns deploys.
- Verdict for the coordinator: **DIAG-NO-GO (B1, join rate)** — the corpus
  cannot answer the question; the fresh band is the next arm.
