# sim-senseexped-b — evidence (finding #2583)

**Arm:** sim-senseexped-b · **Loop B run:** fleshout-loop-b-20261119T0530Z
**Axis:** winnability chain (party / sense) · **Finding:** #2583 (claimed
2026-11-19, this arm)
**Prereg:** `evidence/2026-11-19/sim-senseexped-b-prereg.md` (frozen
2026-11-19 ~00:40 UTC, BEFORE any judged sim).
**Branch:** `sim-senseexped-b` (base master `cd2d685b8`).
**Verdict: GO — the expedition-sourced sense returns the trio when the
party set out together (arm 0.892 vs ctl 0.191), all frozen bars pass.**

## What was built (design call, frozen in the prereg)

The launch branch in `Game.villagerFightAllies` (`src/js/party-wiring.js`)
now reads the fighter's **current expedition companions** — the
`agencyState().exped` entries sharing the fighter's target (tx, ty) —
instead of the mutable `winPlan[vid].party`. Companions answer in
expedition-start order (`sinceDay`, then `sincePart`, rid tiebreak),
head the answer list ahead of crew/earshot, cap stays 2, no trust floor
on the launch branch (the pick enforced it; the expedition is the
commitment). Same-target guard unchanged; no node check, as before.
Env-gated `SENSEEXPED=1`, default OFF = the old sense, byte-identical.

The brief's open question was decided in the prereg: **option A
(expedition-sourced sense)** is the smaller change — the launch branch
already read `agencyState().exped` for its guard, so replacing the
membership source is one loop in one function. **Option B (hold a
launched quad's expeditions together) was NOT built** — it would touch
`expeditionReturn` / `expeditionLeg` lifecycle, return timing, and
encounter cadence, with survival side effects far outside the sense.
B stays a follow-up candidate.

Scope note (frozen): the plan-sourced launch branch (LAUNCHPARTY
substrate, `1fe712030`, HELD finding #2538) is **not on master**, so
this arm lands the launch branch itself, sourced from expedition
companions under the new flag — it does not port the plan-sourced
branch. The control leg is current master (no launch branch: crew +
earshot only), so the contrast measures exactly the lever. The
`winPlanFightParty` VETREENGAGE co-tasking reads the same decaying
`plan0.party` — a separate follow-up, NOT changed here (filed below).

## The work, in plain words

Two earlier investigations found the same thing: when villagers go out
hunting as a party, the game often couldn't tell who was with whom when
a monster jumped them. The old sense asked the villager's *plan* — a
note that gets rewritten every time anyone re-launches, comes home
early, or dies — so by the time the fight started, the plan often
named only one companion instead of three. This arm changes the sense
to ask the expedition itself: who is actually out on the same trip, to
the same place, right now. On a fresh band of 8 villages, the new sense
found the full hunting party in 83 of 93 meetings where the party was
still out together (89%), against 27 of 141 (19%) for the old sense.
The party that set out together now answers together.

## Frozen bars — all pass

| Bar (frozen) | Control | Arm | Pass? |
|---|---|---|---|
| Pool floor (launches ≥ 6/leg, arm denom ≥ 4) | launches 10 | launches 10, denom 93 | YES |
| Primary: arm sense rate ≥ 0.80 AND gap ≥ 0.30 | 0.191 (27/141) | **0.892 (83/93)**, gap 0.70 | YES |
| C1 starvation (arm ≤ ctl + 2) | 1 | 2 | YES |
| C2 median survival (arm ≥ 0.8 × ctl) | 140d | 130d | YES |
| C3 community loss (arm ≤ ctl + 16 deaths) | 713 | 637 | YES |
| Instrument (0 errors, 8/8 files/leg) | 0 | 0 | YES |

**Verdict: GO.** Analyzer: `evidence/2026-11-19/senseexped-b-analysis.json`.
Panel: `evidence/2026-11-19/senseexped-b-panel.md` (balanced compare,
instrument not judge — `review_required`, see below).

## Legs (judged, run AFTER freezing)

Band 104758–104765 (fresh — see prereg for the search), 150d,
death-aware, competent verbatim, substrate PARTYSIZE4=1 +
VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 on both legs; the only
difference is SENSEEXPED (unset ctl, =1 arm). Same branch code both
legs. Corpora: `evidence/2026-11-19/perseed-senseexped-b-ctl/` +
`perseed-senseexped-b-arm/` (8 files/leg, 0 instrument errors).

| | Control | Arm |
|---|---|---|
| Sense rate (primary) | 0.191 (27/141) | **0.892 (83/93)** |
| Raw sense rate (all trace-meetings) | 0.045 (27/604) | 0.166 (83/499) |
| Launch-with-party rate (fielded ≥2) | 0.000 (0/22) | 0.500 (5/10) |
| Same-target conflation (frozen def) | 60 | 34 |
| Launches (wave-4+, pool floor) | 10 | 10 |
| Trace-meetings (first inFight trace/fighter-day) | 604 | 499 |
| Wins (full seat) | 0 | 0 |
| National scale | 0 | 0 |
| Wave 5 reached | 4 | 2 |
| Wave 4 reached | 8 | 8 |
| Standing ≥ 200 | 4 | 2 |
| Median survival | 140d | 130d |
| Survived 150d | 3 | 3 |
| Village deaths (total) | 713 | 637 |
| Starvation deaths | 1 | 2 |

Per-seed sense (denominator → numerator): ctl 104758 11→4, 104759
104→23, 104760 9→0, 104761 0, 104762 5→0, 104763 0, 104764 12→0, 104765
0; arm 104758 67→67, 104759 5→5, 104760 0, 104761 10→0, 104762 0, 104763
0, 104764 0, 104765 11→11. The arm's two rich seeds (104758, 104765)
return the trio every time; the control's rich seed (104759, 104
denominator meetings) returns it 23 times by earshot luck alone.

## The ten arm misses, classified (all one artifact)

All 10 arm denominator misses are seed 104761, fighters wanjiru_kamau
and hassan_ali, days 62–80. In every one, the second true companion is
gen_28kdry9 — and gen_28kdry9 is the **scholar (the player
character)**: their death record in the same corpus reads
`{day: 87, kind: 'villager', who: 'gen_28kdry9', cause: 'contest',
player: true}`. The sense correctly excludes the player from the NPC
answer list (the long-standing no-self-rescue / player's-own-party
rule — the player's party system is separate); the trace instrument
counts the player as a true expedition companion because it reads the
expedition only. So the sense returned the fighter's other companion
plus an earshot filler instead of the player — the exclusion working
as designed, not a lever defect. **The frozen metric stands as judged
(0.892, GO); it is NOT re-scored.** If the denominator excluded the
scholar, the arm rate would read 83/83 — recorded here as an
instrument note for the next arm, not as a revised verdict. The
analyzer's trace definition should exclude `Game.villagerId` from
trueCompanions in the next instrument revision (filed below).

## Same-target conflation (reported secondary, frozen definition)

Frozen definition (prereg): denominator meetings where the sense
returned a member of a different same-target party, operationalized
by the fighter-anchored most-recent launch in [day−21, day]. Arm 34,
ctl 60. Two decompositions, both disclosed (neither re-scores the
primary):

- **Expedition-level check:** on the arm leg, the sense returned a
  subset of the fighter's true expedition companions in 83/93
  denominator meetings — it never returns a non-expedition member.
  The 10 remaining are the scholar-exclusion artifact above. The
  sense's contract is expedition-level, and it holds.
- **Exact-day sensitivity:** joining each meeting to the launch whose
  day equals the fighter's expedition `sinceDay` (the launch that
  produced the current expedition), arm conflation is 10 of 35
  joined meetings — the parallel-launch case: seed 104758 days 45–46,
  where two parties share one target (fighter gen_dgr2cd4's
  expedition holds 4 companions while the joined launch names 2;
  the sense returns members of the parallel party). That is the
  known edge of expedition-sourcing, pre-registered in the prereg:
  two parties, one target, and the sense answers with whoever is
  out on that ground. The remaining frozen-definition conflations
  are stale-join misattribution (voluntary expeditions with no
  launch record, attributed to an older launch by the 21-day join).
  The next instrument revision should use the exact-day join.

## Wall numbers (scale-wall reporting)

No village took the full seat on either leg; no village reached
national. Wave 5 reached 4/8 ctl vs 2/8 arm; standing ≥200 4/8 vs
2/8; median survival 140d vs 130d. The panel compare reads
`review_required` with one `regression_watch` row (community loss
0.500 → 0.625, +1 village over 8 seeds, interval covering 0) and
no material signal on every other contract metric; village deaths
per run fell 89.1 → 79.6 and deaths per 100 days fell 67.2 → 61.9.
Read together: the wall movement is trajectory churn on 8 seeds,
not a systematic cost — the villages that lose wave-5/standing on
the arm leg are not the villages that die more (total deaths fell,
survived-150d is tied 3–3, and the C2/C3 bars pass with margin).
A 12–16 seed confirm would be needed before calling the wave-5
dip real; the pilot does not establish it.

## Sense-test (villagers acting like people)

Read from the arm fight logs. The shout chains read as people, not
counters: "Esperanza is losing — shouts for help! Zoe charges in!"
then "Esperanza is still losing — shouts again! Quinn charges in!"
(seed 104758 d39, Influencer, fled after both answered); "Mia is
losing — shouts for help! Megan charges in! … Megan answered Mia's
shout, but Mia is past holding — they run while running still works."
(d67, Eater). The one sense oddity worth naming is the mechanism's
own honesty: on seed 104761 the sense answers a shout with an
earshot stranger instead of the player standing right there — which
is the rule working (the player is never drafted as an NPC ally),
but a player watching that fight would see their own character
standing beside the fighter, unanswering, while a stranger runs in.
That is a design consequence to name, not a narration bug.

## Reachability verdict

Waves 1–5: wave 4 reached 8/8 both legs; wave 5 reached 4/8 ctl,
2/8 arm. Regional reached on all seeds that survived past ~100d;
national 0/8 both legs; the table and the win flag unreached on
either leg (0 wins). The lever moves the party-meeting link of the
winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat); it does not move
the scale wall by itself. Content reachability beyond wave 5 is
unchanged from the DIAG corpora.

## Proofs

- `node scripts/test-senseexped-b.js`: **12 passed, 0 failed**
  (1 skipped: §8 driver determinism — see below). §1 is the
  reproduction: staged decayed-plan expedition, old code returns
  the strangers [s1, s2], new code returns the trio [c1, c2]; §2
  proves membership needs no plan at all; §5/§6 prove the
  same-target guard and the dead/returned-home exclusions; §7 proves
  expedition-start order.
- `node scripts/analyze-senseexped-b.js --selftest`: **17/17**.
- `node scripts/check.js --quick --only party`: **6 passed, 0
  failed**.
- `node --check` clean on party-wiring.js, the driver, the analyzer,
  the panel builder, and the proof test.
- Driver determinism (§8): the first attempt (RUN_DETERMINISM=1,
  60d seed 104758 twice, OUTDIR under /tmp) was **inconclusive —
  the host write flap refused the runs' file writes** (both driver
  runs left 0-byte tmp files; the test log itself came back 0 bytes).
  Re-run (OUTDIR `evidence/2026-11-19/perseed-senseexped-b-det-a|b/`,
  seed 104758, 60d, MODE=ctl): both sims completed, but the flap
  was solidly on 06:43–06:47 UTC — `writeRobust` exhausted its 480
  retries on both runs and both fell back to stdout (only 0-byte
  tmp files on disk). Their headline summaries were already
  byte-identical (1981 senseTraces, errors 0, same standing/deaths).
  Second pass: det-b's file landed (1,350,434 bytes); det-a fell
  back again; a third run (det-a alone) landed (1,350,434 bytes).
  Full per-seed JSON comparison ignoring `anchorCommit`:
  **IDENTICAL** — 1981 senseTraces in each, every field equal.
  **Instrument bar PASSES; the verdict stands GO.** (The sim
  itself runs in ~7s; the earlier ~130s "runs" were the 480×250ms
  write-retry loops. The det corpora were deleted after the
  comparison — throwaway proof artifacts, regenerable in seconds;
  the comparison result recorded here is the proof.)
- Full `node scripts/check.js --quick`: **335 passed, 9 failed in
  1279s** (exit 1; second full run — the first attempt was killed
  by the run's 280s timeout mid-suite with un-summarized F marks,
  and its two visible failures were flap EPERM write denials).
  The 9 failures are NOT attributable to this arm: 5 are 120s
  load timeouts (exit null — living-garden + occupation-panels +
  one-person-army deed attainment, trust-observer-neutrality,
  test-capable-bot-20261014) on a box at load 14.3 with sibling
  runs competing; the other 4 are godpath measurement/phone-proof
  tests (measurement-proof-update, measurement-workflow,
  measurement-cache-flags, phone-frame-proof) that contain no
  reference to party-wiring.js, villagerFightAllies, or SENSEEXPED
  (verified by grep), and the lever is env-gated OFF by default so
  the evaluated code is byte-identical to master for them. The
  cache-flags failure is the standing load-artifact class
  (panel completion under the test's spawn/timeout budget; see
  AGENTS.md) — no baseline re-roll, per that lesson. The --only
  party subset is green (6/6) and this arm's own proof test is
  12/12.

## Infrastructure: write flap during this run (loud, per skill)

A host write flap ran through this arm's build phase (first seen
~05:57 UTC, flickering through ~06:10 UTC): `cp` to a fresh file
failed with EPERM leaving a 0-byte file; `git update-ref
refs/heads/probe` failed repeatedly (O_EXCL opens refused
everywhere — /tmp, worktree, and the main repo's `.git` alike,
while plain create+write sometimes succeeded in the same minute);
`echo > file` flickered pass/fail second to second. The flap's
current signature, pinned by direct test: `open(O_CREAT|O_EXCL)`
fails with EPERM while plain `open(O_CREAT|O_WRONLY)` usually
succeeds — which is exactly git's lock-file mechanism, so `git
commit` / `safe-commit.sh` cannot run while it is on. No work was
lost: the prereg (260 lines) and the party-wiring.js edit verified
intact by line count; the 0-byte driver copy was rebuilt from its
deterministic source (`allyslot3-driver-b.js`) with a verified
byte-identical copy; every write in the run was size-verified
afterward. The flap also took the first determinism attempt (above).
Recorded for the next run: probe with a content write, not `touch`
(empty creates succeed during the flap); retry loops with
size-verification land writes during flicker windows; never
redirect a background job's output to a fresh file during a flap
(the shell fails before the job starts — this run's two "fast
failures" of the det re-run and the quick check were both
redirect-creation failures, not job failures).

Later flap events (06:43–06:57 UTC): the flap went solid for ~4
minutes — both determinism re-runs exhausted `writeRobust`'s 480
retries (2 min each) and fell back to stdout; the sims themselves
were fine. It also emptied `docs/ONTOLOGY.md` to 0 bytes in the
worktree (flap's known truncate signature; the file was never
edited by this arm — HEAD blob c4fcc045 matches the main tree's
HEAD blob exactly). Restore took three tries: `git checkout` failed
on the index-lock write (O_EXCL), a 40-attempt direct redirect
failed while 1-byte probes and a fresh 350KB create succeeded in
the same minute — the discriminator that hour was existing-file +
large write, not time alone. What worked: write the 354,229-byte
HEAD content to a FRESH file (`docs/ONTOLOGY.md.restored`), verify
md5, then `mv` it over the empty file — restored byte-identical
(md5 7caa01ebc7e1b2f14bad01edf2be924e, 2199 lines, `git status`
clean). The full `check.js --quick` run's visible failures were
also flap EPERM write denials (see Proofs). No work was lost in
any of these events; every restore was md5/size-verified.

## Landing

- **GO — ready for coordinator merge.** Lever commit: the
  SENSEEXPED launch branch in `src/js/party-wiring.js` (env-gated,
  default OFF — live play unaffected). Finding #2583: `claimed`
  now; mark `fixed` on merge.
- Tooling (driver, analyzer, panel builder, proof test) + prereg +
  corpora + analyses + panel + this file land with the arm.
- Follow-ups (filed in `hidden_files/sim-findings.md`, not built here):
  1. Trace instrument: exclude `Game.villagerId` (the scholar)
     from trueCompanions, and use the exact-day launch join for
     the conflation secondary (this arm's §-note above) — finding
     #2586.
  2. `winPlanFightParty` VETREENGAGE co-tasking reads the same
     decaying `plan0.party` — the gate's twin of this finding;
     the fixed sense already flows into the gate's party, but the
     co-tasked members still come from the plan — finding #2587.
  3. Option B (hold launched quads together) stays a candidate
     for a later arm; this arm proves option A alone clears the
     sense bar — finding #2588.
  4. The seed-104761 scholar-exclusion consequence (the player
     standing beside a fight, unanswering) is a design note for
     Steve's eyes, not a defect — finding #2589.
- No push, no bump, no live verification (ship loop owns those).
  Report: "merged locally, pending ship" after coordinator merge.

## Metric review

- **No metric was re-scored.** The primary (sense rate, arm ≥ 0.80
  AND gap ≥ 0.30) and the pool floor were frozen in the prereg
  before any judged sim, and the verdict is read straight off
  them (0.892, gap 0.70, pool 10/10 + denom 93). The scholar
  artifact (10 misses, all one player-exclusion mechanism) is
  reported with its verification but does NOT change the judged
  rate — if the denominator had excluded the scholar the rate
  would read 83/83, and that counterfactual is stated here so a
  later reader is not surprised, not as a revised number.
- **The conflation secondary kept its frozen definition** (21-day
  most-recent launch join: arm 34). The exact-day decomposition
  (10/35 joined) is a sensitivity analysis, disclosed as such —
  it explains the frozen number, it does not replace it. The
  fielded-rate denominator change made during the analyzer build
  (fielding counted against the joined launch's party, with
  no-launch meetings excluded from fieldedDenom) was made BEFORE
  the judged legs ran, is pinned in the analyzer header and the
  prereg's scope note, and is a definition clarification, not a
  re-score: it aligns "launch companions" with the launch record
  the secondary names.
- **The pool floor rested on the DIAG fresh leg's adjacent-band
  measurement, not a survey of this band** (disclosed in the
  prereg). The band delivered far above the floor on both legs
  (10 launches, denom 93 arm), so the weakness is moot for this
  verdict.
- **The panel is the instrument, the prereg is the judge.** The
  balanced compare reads `review_required` (community-loss
  regression_watch, +1 village) — investigated above, not a bar
  breach: the frozen C-bars pass, total deaths fell, and the
  watch row's interval covers 0. The panel does not overturn the
  GO; a confirm (12–16 seeds) is the place to re-check the wave-5
  dip and the community-loss watch.
- **Determinism — RESOLVED, instrument bar passes** (flap, see
  Proofs). The re-run landed identical per-seed JSONs (1981
  senseTraces each, every field equal ignoring `anchorCommit`),
  so the verdict stands GO. Had it not landed identical, the
  instrument bar would have failed and the verdict revised to
  NO-GO kind INSTRUMENT — the lever result itself (83/93 vs
  27/141) would have stood as measured, but the arm would not
  have landed on an unproven instrument.
