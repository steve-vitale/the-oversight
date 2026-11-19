# sim-sense-guard-diag-a — evidence (finding #2571)

**Arm:** sim-sense-guard-diag-a · **Loop A run:** fleshout-20261119T0115Z
**Axis:** scale-onramp · **Finding:** #2571 (launch-party sense
same-expedition tile guard — is the guard too strict, or do expeditions
genuinely split?)
**Prereg:** `evidence/2026-11-19/sim-sense-guard-diag-a-prereg.md` (frozen
2026-11-19 ~02:30 UTC, BEFORE any judged sim).
**Branch:** `sim-sense-guard-diag-a` (base master `be0b90b41`).
**Verdict: DIAG-GO — the question is answered; the guard is not the
problem, the mutable plan party is.**

## What was tested

A diag, NOT a lever: no sense change lands from this arm. It measures
whether the launch-party sense's same-expedition guard is too strict
for a party that set out together, or whether expeditions genuinely
split — measured with a meeting-instant recorder, not assumed.

The question came from Loop B arm sim-allyslot3-rerun-b (NO-GO, field-4
3/7 = 0.43): the sense returned the full trio in only 5/10 meetings.
Two genuine misses were companions not co-located on the same
expedition tile at the meeting instant (seed 104721 d69, seed 104722
d112). The recorder stamps expedition state at the meeting instant —
the instrument the re-judge arm asked for.

**Substrate (rides along, NEVER re-judged, DROPPED before delivery):**
the rerun-b arm substrate exactly, all flags on — `LAUNCHPARTY=1
PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1`
(cherry-picked sense fix `1fe712030` + slot `7efbf26a8` + driver
`dedfe0635`). The sense itself is HELD-NO-GO substrate (finding
#2538); the slot is HELD (finding #2515). **One leg only** — there is
no control leg: this is a measurement of the sense mechanism, not a
lever contrast, so the §15 balanced panel does not apply (stated in
the prereg, not faked). Telemetry likewise does not apply to recorder
corpora (refuses them by design — rerun-b precedent); scale-wall
numbers come from the analyzer's wall census instead.

**Proofs green (on the substrate tip):**
`scripts/test-sense-guard-diag-a.js` **9/9** (tracer fidelity on staged
quads, wrapper passthrough, substrate-gated mirror agreement, analyzer
d133 regression), analyzer `--selftest` **10/10**.

## Legs (judged, run AFTER freezing)

**(a) Repro leg — the judged sweep.** Seeds 104721, 104722, 104437,
`MODE=diag`, arm substrate. 3/3 complete, exit 0. Analysis:
`evidence/2026-11-19/sense-guard-diag-a-repro-analysis.json`.

**(b) Fresh leg — pool data + determinism check.** Seeds 104750–104757
(re-run of the pre-freeze survey band), `MODE=diag`, arm substrate.
8/8 complete, exit 0 (seed 104757 was missing at adoption and was
re-run by the adoption worker — 88d, village-lost, standing 199, 12
sense traces, 0 errors). Analysis:
`evidence/2026-11-19/sense-guard-diag-a-diag-analysis.json`.

**Survey (pre-freeze pool, NOT a judged sweep):** the diag driver ran
on 104750–104757 before the prereg froze. Corpus:
`evidence/2026-11-19/perseed-sense-guard-diag-a-survey/`.

## Frozen bars — repro leg (the judged sweep)

| Bar (frozen) | Repro leg | Pass? |
|---|---|---|
| Pool floor (launches ≥ 6, denominator ≥ 2) | launches 13, denom 8 | YES |
| Trace coverage (≥ 90% same-day) | 8/8 = 1.00, stale 0, no-trace 0 | YES |
| Classification complete (unclassified == 0) | 5 misses, 0 unclassified | YES |
| Test cases (≥ 3/4 reproduce + traced) | **4/4** — d133, d69, d112, d117 all ok | YES |
| Instrument (0 errors, 0 dropped, 0 mirror mismatches) | 0 / 0 / 0 | YES |

**Repro verdict: DIAG-GO on all five frozen bars.**

Test cases, as frozen: d133 (104437, ruby_callaghan, Reunion), d69
(104721, gen_5b212hy, audit), d112 (104722, nino_kapanadze, eater),
d117 (104722, miguel_santos, editor). Repro sense rate **0.75**
(6/8); misses: mirror-overwrite 2, fighter-relaunched 3. Wall: wins
0, national 0, wave-5 reached 1/3, wave-4 reached 3/3, standing ≥200
1/3, median 151d, survived 2/3.

## Fresh leg (pool data — passes 4 of 5 bars; the 5th fails by construction)

| Bar | Fresh leg | Pass? |
|---|---|---|
| Pool floor | launches 15, denom 18 | YES |
| Trace coverage | 18/18 = 1.00 | YES |
| Classification complete | 19 misses, 0 unclassified | YES |
| Test cases | **0/4** — d69/d112/d117/d133 absent | NO (by construction) |
| Instrument | 0 / 0 / 0 | YES |

The fresh band holds none of the four test-case seeds by
construction — the test-case bar can only be judged on the repro leg,
where it passes 4/4. The fresh leg's analyzer verdict
(DIAG-NO-GO, kind TESTCASE-MISS) is therefore the expected reading
of pool data, not a failure of the diag; the prereg says so. Fresh
sense rate **0.39** (7/18); misses: fighter-relaunched 10,
mirror-overwrite 5, target-mismatch 4. Census: n 8, launches 15,
trioLaunches 12 (rate 0.80), quadLaunches 9, partyQuads 9, medianDays
150. Wall: wins 0, national 0, wave-5 3/8, wave-4 8/8, standing ≥200
3/8, median 151d, survived 5/8.

## Determinism — survey vs judged fresh leg

The judged fresh leg re-ran the survey's 8 seeds after freezing, and
the trajectories reproduce: **7/8 seeds byte-identical except
`anchorCommit`** (survey `dedfe0635` → judged `a15b7a21c`, the drop
of the renamed driver source). Seed **104752 differs only in the
`seq` counter values** inside two trace lists (`dawnbidDeparts`,
25 entries; `launchdefSkips`, 47 entries) — same lengths, same
contents otherwise; sense traces 700/700, v4 encounters 41/41, days
150, standing 199, maxWave 4 identical. The `seq` counter is a
run-global bookkeeping number, not a trajectory difference. The
analyzer's judged numbers are identical to the survey's (sense rate
0.39, classes 4/5/10, census 15/9).

(The timed-out run's report claimed seed 104757 was missing from the
survey — wrong: 104757 IS present in the survey corpus. What was
missing was the judged-fresh-leg run of 104757, which the adoption
completed.)

## The answer (prereg criterion 6 — dominant mechanism + next arm)

**Dominant mechanism: `plan.party` churn, not the guard.** Across
both judged legs, 20 of 24 misses (83%) trace to the plan party
being rewritten after the launch — fighter-relaunched 13,
mirror-overwrite 7 — against 4 genuine target-mismatches. The guard
itself (destination equality) never wrongly excluded a listed
companion: whenever the plan party is intact, the sense returns the
trio.

**Mirror-overwrite, pinned with dated evidence (seed 104753, holder
emma_larsen — verified from the judged corpus):** her plan.party
shrinks to a single other holder on d71 (`['gen_jlebylg']`) and d93
(`['diana_osei']`) — each time a former companion re-launched as a
holder and took her as their companion, and the mirror write
overwrote her plan.party with the new smaller party. Her d67 quad
kept travelling while the holder's plan — the sense's only input —
no longer named them. `plan.party` is a single mutable slot
overwritten by every launch a villager participates in (holder or
companion), so it only ever names the most recent launch.

**Named next arm:** the launch branch should read the fighter's
current expedition companions (the `agencyState().exped` entries
sharing the fighter's target) instead of the mutable plan party — or,
alternatively, hold a launched quad's expeditions together (no
independent early return while the hunt is live). Which is the
smaller change is the next arm's design call. The tile/target guard
needs no loosening. (The parallel Loop B arm sim-sensecotravel-b,
DIAG-GO, independently converged on the same recommendation from a
re-judgment of the 2330Z corpora.)

## Substrate drop (seedplan-b pattern, before delivery)

Reverted to base `be0b90b41`: `src/js/party-wiring.js`,
`src/js/fieldFights.js`, `src/js/game.js` (diff vs base empty after
the revert). Deleted the substrate-only scripts:
`scripts/analyze-launchparty-sense-a.js`,
`scripts/build-launchparty-sense-panels-a.js`,
`scripts/launchparty-sense-driver-a.js`,
`scripts/test-launchparty-sense-a.js`, `scripts/test-allyslot3-b.js`.
The diag instrument stays: `scripts/sense-guard-diag-driver-a.js`,
`scripts/analyze-sense-guard-diag-a.js`,
`scripts/test-sense-guard-diag-a.js`, prereg, corpora, analyses.

**Post-drop proofs:** `test-sense-guard-diag-a.js` **8 passed, 0
failed, 1 skipped** — §F substrate agreement SKIPS cleanly
("LAUNCHPARTY sense fix absent from party-wiring.js (HELD substrate
dropped) — agreement case skipped"). Analyzer `--selftest`
**10/10**. The analyzer detail-wording fix (post-freeze:
`mirror-overwrite` detail now names the fighter's resulting
`planParty`; classification logic unchanged) is included; survey and
repro analyses were regenerated with identical verdicts, rates, and
classes.

## What lands / what is held

- **HELD, do not merge:** the sense fix (`1fe712030`) and the 3rd-ally
  slot (`7efbf26a8`) — both stay on branch `sim-sense-guard-diag-a`
  as measurement history only; the working tree no longer contains
  them.
- **Lands (evidence only):** prereg `e32ac2429`, survey + repro +
  judged corpora, the three analyses, the drop, and this file (see
  the round evidence file).
