# sim-capstoneready-a — PREREG AMENDMENT, LEG 2 (delivery verb)

**Arm:** sim-capstoneready-a leg 2 · **Loop A run:**
fleshout-20261128T0315Z · **scalecensus §7 next arm #2, leg 2**
**Type:** DIAG + policy-only mechanism arm (one new policy file;
zero src/js changes — the delivery verb `ladderDeliverCapstone`
already exists in `src/js/table.js` and is called through it,
never re-implemented)
**Frozen:** 2026-11-28 ~04:55 UTC, before any leg-2 judged sim.
**Amends:** `evidence/2026-11-28/sim-capstoneready-a-prereg.md`
(leg 1, frozen 2026-11-28 ~04:05 UTC — unchanged by this
amendment; leg 1's verdict stands as written in
`evidence/2026-11-28/sim-capstoneready-a.md`).
**Branch:** `sim-capstoneready-a` (worktree
`~/workspace/worktrees/sim-capstoneready-a`).
**Base:** master tip `fb6c383fb` (unchanged since leg 1).
**Gate:** leg 2 opens because leg 1 judged DIAG-GO with
readiness REAL (tribute ever-ready 4/8 seeds, ever-deliverable
2/8) — per the leg-1 prereg §3 and task: "if readiness is
real, freeze the leg-2 amendment and run leg 2 the same way."

## §0. The question, in plain words

Leg 1 proved villages can BE ready for the military tribute
(4/8 ever ready, 2/8 ever deliverable) while the competent
bot never delivers, because it has no delivery verb. Leg 2
teaches the bot the verb — nothing else — and asks: when a
village stands deliverable, does the delivery actually fire,
does the payment land cleanly (two non-scholar veterans
leave Haven, the capstone records, no half-payment), and
what happens next? The full seat is NOT the question here:
on this band the deed gate still blocks every seed (scale
0/8, waves 5/8 short), so no delivery can seat anyone this
run. Delivery mechanics is the question; seat movement is
secondary observation, never the judge.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/TABLE.md`,
`src/data/ladder-capstones.json`. **No canon doc covers the
delivery-verb policy** — this arm measures the verb firing;
the numbers below are this arm's measurement convention,
frozen here, not a canon claim. The delivery machinery lives
in code and is read/called, never re-implemented:

- `ladderDeliverCapstone(kind)` (`src/js/table.js:173`):
  re-checks `ladderCapstoneReady(kind)` at delivery time;
  refuses honestly (`{ok:false, reason}`) when not ready,
  when the run is over, when a capstone is already
  delivered, or — for the tribute — when fewer than 2
  payable (non-scholar, living) veterans stand
  (`'veterans-short'`); pays 2 veterans via
  `removeVillager(vid, 'tribute')` in waveKillLog order
  (first wave-4 kill first); VERIFIES both veterans are off
  the roster and records nothing on a half-payment
  (`'tribute-failed'`); on success records
  `pg.ladderCapstone = kind`, `pg.ladderCapstoneDay = day`,
  `pg.ladderCapstoneDetail = {veterans, names}`; opens the
  mercy window (`tableActive()` holds from delivery, so no
  raid or roaming monster can kill villagers between the
  delivery and the seat). Charter/feast deliveries record
  the deed with no payment.
- The new policy (`scripts/policies/competent-capstonedeliver-a.js`)
  is competent verbatim PLUS one verb, in `daily()` at the START
  — BEFORE `competent.daily()` runs the day's trips (dawn, at
  Haven — the honest mirror of the Haven-panel action, which a
  player can only take from Haven; the delivery function itself
  carries no location guard, so the policy places the call where
  the player would make it). The placement matters for the
  prediction: leg 1's readiness was snapshotted at the top of
  each day, so the verb must be attempted on the same dawn read
  — attempted after the day's fights, a veteran could die first
  and the delivery would refuse for a purely artefactual reason.
  The verb attempt: if `ladderCapstoneDelivered()` is
  null AND the tribute snapshot reads deliverable
  (ready AND payable ≥ 2 — the same `deliverableOf` rule
  leg 1's driver uses, re-read live through
  `ladderCapstoneReady('military_tribute')`), call
  `ladderDeliverCapstone('military_tribute')` once and
  record the attempt (day, kind, ok, reason, veterans) on
  the policy's exported `deliveryAttempts` array, which the
  driver reads after `runDays`. The policy NEVER calls the
  verb when merely ready (the 113301/113304 split windows
  must stay undelivered), NEVER calls it for charter/feast
  (never ready on this band; attempting them would always
  refuse — pointless noise), and NEVER calls it twice (after
  a success, `ladderCapstoneDelivered()` is non-null).
- **Paired design:** leg 2 runs the SAME band (113301–
  113308), SAME horizon (150d death-aware), SAME substrate
  (competent verbatim + the one verb), so each leg-2 seed
  pairs with its leg-1 seed. Pre-delivery trajectories are
  deterministic-identical (same seeds, same RNG, same
  policy until the first deliverable day), so the delivery
  day is predictable from leg 1 — see §2.

**Pre-registered expectation:** delivery fires exactly on
the two leg-1 deliverable seeds (113302 day 83, 113305 day
140 — the firstDeliverableDay of each), succeeds
(`ok:true`), records the capstone, removes exactly the two
paid veterans, and fires on NO other seed and NO other day
(113301/113304's ready-but-not-deliverable windows stay
undelivered; charter/feast are never attempted). The
falsifier: a delivery on a non-deliverable day, a refusal
on a deliverable day, a half-payment, or a delivery on a
seed leg 1 recorded as never-deliverable.

## §2. Primary metric (BINDING, §14)

Single leg (policy-mechanism arm; no ctl/arm pair beyond
the leg-1/leg-2 pairing on identical seeds). Population:
ALL 8 seeds, delivery policy, 150d death-aware. Each
per-seed row carries the daily snapshot series (readiness
breakdown + deed-gate breakdown + seat + ladder peak +
overtime tier + delivered state) and the delivery-attempt
log.

- **Pool floor:** ≥ 6 of 8 seeds alive at day 80. Sized to
  the leg-1 survival distribution (8/8 alive day 80). NOTE:
  the delivery pays two veterans on 113302 (day 83) and
  113305 (day 140) — both AFTER day 80 — so the floor
  cannot be missed by the payment itself; a miss would be
  a pre-delivery survival change, reported as a finding.
- **Primary metric:** per seed, the delivery record —
  delivery day(s), kind, `ok`, reason, veterans paid —
  against the leg-1 prediction: delivery on 113302 day 83
  and 113305 day 140, and on no other seed/day.
- **GO threshold:** ALL of: (a) delivery succeeds on BOTH
  predicted seeds (113302 d83, 113305 d140) with `ok:true`
  and `pg.ladderCapstone === 'military_tribute'`; (b) ZERO
  delivery attempts on any other seed, and ZERO attempts
  on non-deliverable days (the split windows on 113301/
  113304 stay undelivered); (c) ZERO half-payments (every
  success removes exactly the 2 named veterans from the
  roster — verified against the post-delivery snapshot);
  (d) snapshot coverage ≥ 0.95 (complete readiness /
  all snapshots); (e) reconciliation 0 mismatches (stored
  vs recomputed readiness, all snapshots — same rule as
  leg 1); (f) instrument errors 0; (g) determinism:
  one seed re-run after the pilot is byte-identical to its
  pilot file (full 150d).
- **Instrument errors:** 0 on all per-seed files.

**Verdict:** DIAG-GO when all bars pass (the verb fires
exactly where leg 1 said it could, the payment lands
cleanly, and nothing fires where it should not).
DIAG-NO-GO kind MECHANISM when (a), (b), or (c) misses
(the verb does not do what leg 1 predicted);
DIAG-NO-GO kind THIN-POOL when the pool floor misses;
DIAG-NO-GO kind ATTRIBUTION when coverage or
reconciliation misses; DIAG-NO-GO kind INSTRUMENT when
errors > 0. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. Seat movement (or its absence)
is NOT in the GO bar — see §3.

**Staging sniff test (pilot gate):** the analyzer must show
the delivery machinery is live on this band (a delivery
succeeds on ≥ 1 seed, `ladderCapstoneDelivered()` reads
non-null there) AND the seat machinery is live (tableWaiting
fires on ≥ 1 seed, rank reaches regional on ≥ 1 seed)
before the verdict is read. If no delivery ever fires, the
verdict is DIAG-NO-GO MECHANISM with the silent verb as the
finding.

## §3. Secondary metrics (supporting, not binding)

- Seat movement vs leg 1, per seed: `tableSeat()` after
  delivery (expected: still lesser — the deed gate still
  blocks on scale and, on most seeds, waves; report the
  remaining bars per seed, never judge on them).
- Survival after payment: days survived and end population
  vs the paired leg-1 seed (same seed, no-verb policy).
  A post-delivery death spiral is a FINDING (the tribute
  price measured), not a GO/NO-GO input.
- Mercy-window observation: raids/roaming kills between
  delivery and horizon (expected: none while
  `tableActive()` holds — recorded, not judged).
- Wall numbers: national / table / wins, wave-4 and wave-5
  unlocks, median survival, death-cause shares (null —
  NOT instrumented; reported null, never faked).
- Village assessment in plain words per seed, with the
  delivery as a story beat (who walked out, what the
  village said).
- Sense-testing: full transcripts on the two delivery
  seeds (113302, 113305) — does the village voice the
  tribute walking out? SENSE-TESTING LAW: judge meaning,
  not counts.
- Paired-corpus diff (leg 1 vs leg 2, same seeds): the
  instrument for this leg's before/after. This leg makes
  NO balance claim (no game-code change, no lever), so no
  §15 balanced-panel compare is run — the panel is the
  instrument for balance claims, and the paired diff plus
  the frozen delivery bars are the judge here. Said here
  rather than fabricating a compare.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as leg 1, for
  pairing). Dead villages stop simulating (+10d tail max).
- **Seeds: 113301, 113302, 113303, 113304, 113305, 113306,
  113307, 113308** — the SAME band as leg 1 (identical
  seeds are the point: the leg-1 corpus is the control).
  Band freshness was established for leg 1 (prereg §4);
  re-using the same band for the paired leg is the design,
  not contamination — the two legs differ only by the one
  verb, and the pairing is stated here.
- **Policies:** `competent-capstonedeliver-a` (competent
  verbatim + the tribute delivery verb only, §1). **No
  substrate flags.**
- **Instrument:** `scripts/capstoneready2-driver-a.js`
  (clone of the leg-1 driver with the policy swapped and
  the delivery-attempt log harvested; RUN=
  capstoneready2-a, OUTDIR
  `evidence/2026-11-28/perseed-capstoneready-a-leg2-arm`).
  Analyzer `scripts/analyze-capstoneready2-a.js` (clone of
  the leg-1 analyzer + the delivery judge). Per-seed JSONs
  under `evidence/2026-11-28/perseed-capstoneready-a-leg2-arm/`.
- **§15 panel:** NOT RUN — see §3 (no balance claim; the
  paired-corpus diff is the instrument).
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot
  earns one; the coordinator decides from the pilot verdict.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what villages actually build by day
80+, so the fixture is the competent run itself: a geared
scholar fighting with a party, never a fresh un-geared solo
scholar. The proof test (`scripts/test-capstoneready2-a.js`,
GREEN before the pilot) runs live on a loaded village:
- a staged mid-run village (wave-4 kills in the live
  `waveKillLog` for two living non-scholar villagers) —
  the policy's `daily()` delivers: returns `ok:true`,
  `pg.ladderCapstone === 'military_tribute'`, both
  veterans off the roster, attempt logged;
- a scholar-veteran + 1 villager staging — the policy does
  NOT deliver (deliverable false), `delivered` stays null,
  zero attempts logged;
- the driver live run (30d, temp OUTDIR) writes a row
  whose snapshots carry complete readiness, whose
  reconciliation is empty, and a determinism spot check
  (same seed twice → byte-identical per-seed JSON) passes.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** the delivery verb exists in code
   (`table.js:173`, verified by grep before this freeze)
   and leg 1 proved the deliverable state occurs on this
   band (2/8 seeds, firstDeliverableDays 83 and 140).
2. **Pool sizing:** see §2 pool floor (≥ 6/8 alive at day
   80); the addressable pool is the 2 deliverable seeds —
   the GO bar is written against exactly those 2, not
   against "any seed delivers."
3. **Verb existence:** the engine has the verb
   (`ladderDeliverCapstone`, Haven-panel-wired in app.js);
   the policy is the only new code, and it calls the
   engine's verb rather than re-implementing the payment.
4. **Horizon fit:** 150d contains both predicted delivery
   days (83, 140) with room for the post-delivery story to
   show (67 days after the 113302 delivery; 10 days after
   the 113305 delivery — the late one is thin by design and
   is reported as such, not judged on its tail).

## §7. Canon

`docs/CANON.md` (manifest), `docs/TABLE.md` (full seat:
deed gate + ladder peak ≥ 3 + delivered capstone),
`src/data/ladder-capstones.json` (the three capstone deeds;
the tribute's payment is two living wave-4 veterans)
read before the run. **No canon doc covers the
delivery-verb policy** — this arm measures the verb firing;
the numbers in §1 are this arm's measurement convention,
frozen here, not a canon claim.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- On DIAG-GO the delivery verb is proven to fire exactly
  where leg 1 said it could, the payment lands cleanly,
  and the next arm is named from that proof (a sitting
  policy to complete the seat road, or a delivery-price
  question if the payment hurts — decided by the numbers,
  not by preference). On DIAG-NO-GO the verb question
  stays open with the failing bar + mechanism diagnosis
  named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD`
  before every material write; if it fails, stop writing and
  wait for the clear.
