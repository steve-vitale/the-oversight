# More reseed burn offsets — pre-registration (arm sim-burnoffsets-a)

Run fleshout-20261113T0715Z, Loop A, axis scale-onramp.
Written and committed BEFORE any judged sim. Base: current master
tip `f7352f946`. Instrument-only arm — ZERO `src/js` changes.

## The question

The 0515Z deciding test (evidence/2026-11-13/sim-gap-candidates-a.md)
proved the matched band 190391–190398 is STRONGLY stream-sensitive:
one 997-draw burn moved 4 of 8 fates substantially (190394 d43→d130
with the Eater never appearing; 190392 d144→d72; 190393 survived→lost
d122 at standing 560; 190395/190398 newly reaching wave 5) — but it
saved neither gap seed {190392, 190394}. Only ONE burn offset was
sampled, so GAP-NOT-DICE is the pre-registered rule's verdict, not a
proof that no stream shift could save a gap seed. This arm samples
more offsets and asks: does ANY reseed burn offset save a gap seed?

## Base + substrate (verified before any sim, not assumed)

- **Base:** current master tip `f7352f946`
  (`f7352f9465becad7f14a08847aa6582401fddad2`). The baseline leg is
  measured FRESH on this base — the far-end 4/8 is NOT assumed
  (master has moved since `203a32775`).
- **No fix-swap.** Master already carries the r131 roster-check fix:
  `src/js/standing.js` contains the `ROSTER CHECK` marker (line 278)
  and `src/js/ladder.js` carries the shared `countLivingVeterans`
  (roster check + scholar counts), unlike the far-end LEG 3 rule.
  Standing sha256 on this base: `f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9`.
- **Policy:** current master's `scripts/policies/competent.js`, sha256
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`.
  The driver REFUSES to run unless the on-disk sha is exactly this.
- **Harness:** `scripts/sim-harness.js` sha256
  `d0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a`
  — byte-identical to the 0515Z run. Instrument
  `scripts/vetfirst-instrument-20261111.js` sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`
  — byte-identical to the 0515Z run.
- **No-code-change guard:** `git diff --name-only -- src/js` must be
  EMPTY during every leg (there is no swap on this arm — pure
  instrument). The driver refuses otherwise.

## §Burn — the design, re-verified in code on THIS base

The shared stream is `Math.random = mulberry32(seed)`, installed by
the harness BEFORE eval. A burn — not a re-assignment — because five
modules capture the function object into a module-scope alias at load
(re-verified by this worker on `f7352f946`):
`betrayal.js:87`, `comms.js:116`, `corruption.js:47`,
`fieldFights.js:71`, `finale-campaign.js:28` (`const/var R =
Math.random`). A re-assignment would leave those aliases (including
the fight engine) on the old stream, while a burn advances the ONE
shared mulberry32 instance every call site reads. The only in-game
`Math.random =` is the `_worldRng` save/restore pair
(`game.js:11009–11011`, restores in `finally`) — a scoped temporary
swap, not a per-day reseed; verified by grep that nothing re-seeds
per day. The policy RNG (`__policyRandom`, derived from the manifest
seed inside `runDays`) is untouched by the burn.

**Method (pre-registered): after `setupGame` (world generation:
`genRoster` + `newGame` + `depart` all happen inside `setupGame`),
call `Math.random()` exactly N times for the leg's offset N, then run
the 150 days.** Same code, same seeds, same world, different
play-phase dice. `burnOffset: N` is recorded per seed (0 for the
baseline leg).

## Offset list (pre-registered, with reasoning)

997 is taken (0515Z L3). The set below is fixed before any sim:

| Offset | Why this value |
|---|---|
| 0 (baseline) | No burn. Measured fresh on current master. |
| 1 | Minimal displacement — the adjacent stream. Tests whether the band is sensitive at the smallest shift; if even 1 draw flips fates, the stream is maximally twitchy. |
| 13 | Small prime. A small shift in a different residue class from 1. |
| 251 | Mid-range prime. Roughly a quarter of 997. |
| 499 | Near-half of 997. The closest tested neighbour to the known 997 shift. |
| 1999 | Larger prime, ~2× 997. Tests whether a bigger displacement reaches a saving stream the small ones miss. |

At least 3 offsets are judged, each independently; this run judges
all 5. No offset is added, dropped, or re-scored after seeing
results — a miss on all five is a verdict, not a prompt to sample
a sixth.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric per offset: which of the gap seeds {190392, 190394}
the burn leg saves that the MEASURED baseline LOSES, and whether any
baseline survivor is lost.** Gap seeds are the two seeds the healthy
pole saved that the far end lost (190392, 190394); 190391 is a pole
survivor the far end also lost — a burn leg saving 190391 is
reported, not a gap save.

GO per offset — ALL conjunctive:

1. The offset's leg saves ≥1 of {190392, 190394} that the baseline
   LOSES.
2. No regression on the baseline's survivors: every seed the baseline
   survives, the burn leg also survives.
3. Median survival ≥ 0.8× baseline median.
4. Starvation deaths (corpus death cause `starvation`) ≤ baseline
   starvation + 2.

| Outcome | Verdict for that offset |
|---|---|
| All four conjuncts hold | **GO** — that offset's stream saves a gap seed with no regression |
| Any conjunct fails | **NO-GO for that offset** |

**Run verdict (judged after all legs run):**

| Outcome | Run verdict |
|---|---|
| **ANY offset GO** | **A STREAM SAVES A GAP SEED** — the +1 gap question reopens as dice-adjacent: a stream shift alone saves a gap seed on current master. The option-B search is NOT closed; the saving offset is named and the tendexact × stream-shift interaction stays first for the next run. |
| **NO offset GO** | **NO STREAM SAVES A GAP SEED (5 offsets sampled)** — the GAP-NOT-DICE verdict stands and hardens: 6 offsets total (997 + 5) move fates without saving a gap seed. The stream question is parked; the next run works tendexact × stream-shift or a design mechanism. |

**Rank read (reported, not judged):** survived count per leg vs the
measured baseline; regional reach; wave-5 unlocks.

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs the combat-heavy profile; wave-4 and wave-5
unlocks; national / table / wins; standing range; tribute-ready
(ladder read); blooded count; peak living wave-4+ veterans per seed
vs the bar of 2; phantom days — defined CORRECTLY (carried
correction): "live count exceeds shadow" is a real phantom;
"shadow exceeds live during a collapse" is EXPECTED and reported,
not judged. **ARC IV firing per seed is a REPORTED field only** —
not judged, no threshold set (the instrument does not capture ARC
IV).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to all
  prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, the firstparent, the rederive legs, and the 0515Z
  deciding test.** A deciding-test leg re-runs the same seeds on
  current master plus a stream shift; that is the point, not a
  freshness violation. Seed-band freshness check (skill
  `local_seed_band_freshness`): grep scope
  `evidence/*/sim-*-prereg.md` names seed 190391 in 261 lines
  across 23+ prior preregs (same justification as every one of
  those preregs — the band is reserved for comparability, and this
  prereg records the reuse explicitly rather than claiming
  freshness).
- **Policy: competent verbatim, SINGLE policy, mode
  `competent-burnoffsets`.** The driver runs current master's OWN
  policy (sha256 `74a890f0844e…`, recorded per seed) and refuses any
  other sha.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` on master
  (sha256 `311f105bc15f…`, verified above) + the driver's live shadow
  old-rule count per snapshot, exactly as the gap-candidates driver.
  Driver: `scripts/burnoffsets-driver-20261113.js` — a clone of the
  gap-candidates driver with the corpus dir parameterized by burn
  offset (`evidence/2026-11-13/perseed-burnoffsets-a-b<N>/`), RUN =
  `burnoffsets-pilot`, arm = `burnoffsets`, mode fixed to
  `competent-burnoffsets`, the standing guard re-pointed at the
  CURRENT master sha (no swap — the guard asserts the tree IS
  master, marker present AND sha exactly `f935997640a0…`), the
  own-policy guard re-pointed at the current master policy sha, and
  the no-code-change guard requiring an EMPTY `src/js` diff. The
  burn is exported as `burnOffsetForLeg` (0 for baseline).
  **`\belder\b` filter:** the driver carries the tightened
  veteran-say regex `\\belder\\b` (vetsays fix, landed
  `9a32925b3`), same as r9/r10 and gap-candidates.
- **Corpora:** `evidence/2026-11-13/perseed-burnoffsets-a-b<N>/` —
  8 per-seed JSONs per leg; one summary JSON per leg
  (`evidence/2026-11-13/burnoffsets-a-b<N>-summary.json`).
- **Deep-identity comparison (pre-registered method):** the per-day
  signature is the 4-field tuple (vetsW3, vetsW4, waveKillLog length,
  roster length) — NOT deaths-so-far. Compare each burn leg's corpus
  against the MEASURED baseline corpus, plus a full daily-snapshot
  deep-diff **pairing snapshots INDEX-ALIGNED, never day-keyed**
  (the duplicate loss-day stamps make day-keyed pairing pair the
  wrong snapshots — see the 0515Z prereg §0). Veteran killers in the
  instrument are keyed `by`, not `vid` — a phantom check reading
  `k.vid` silently checks nothing.

## Balanced panel (§15) — N/A

Instrument-only legs, no code change, no before/after pair to compare
on one base. The before/after comparison IS the measured baseline vs
each burn leg on identical seeds, judged by the analyzer's decision
rule. Same standing as gap-candidates-a §15 and the ten bisect arms
named there.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the leg is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The ONLY permitted uncommitted changes during a leg are NONE (no
  swap, no cherry-pick). If `git status` shows any `src/js`
  modification before a leg, FAIL LOUDLY and do not run.
- **Sibling baseline cross-check:** the sibling arm
  (sim-tendshift-a) runs the same baseline on the same seeds on the
  same master tip. If its baseline numbers differ from this arm's
  measured baseline, FLAG IT LOUDLY in the evidence file — do not
  silently average, do not re-run to match. (At prereg time the
  sibling had not yet written its prereg; the cross-check happens at
  closeout from its committed corpus.)
- This arm does NOT re-judge any prior verdict (vetphantom GO,
  firstparent INCONCLUSIVE, tendexact HEALTHY_POLE_REDERIVED-by-count,
  tendexact-confirm NO-GO, gap-candidates GAP-NOT-DICE) — it tests
  the burn-offset question only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted;
  prior arms were REFUSED by the tool (recorder-corpus class). If
  refused again, recorded, not waived, baseline NOT rolled.
- Flap note: the flap-watch log read ALL-OK at run start
  (2026-11-13T07:47Z; 163 historical FAIL lines predate this run).
  The prereg + tooling are written and committed only after a probe
  succeeds; the tree is heartbeated after. If the flap returns
  mid-run, wait for it to clear rather than bypassing safe-commit;
  never route around a denial.
- Merge note: this worktree runs on branch `sim-burnoffsets-a` at
  master tip `f7352f946` — the driver and proof only make sense on
  that base (standing sha, own-policy sha). The tooling + evidence
  commits live on that branch; the coordinator merges. Do NOT
  rebase onto a newer master mid-run (it would break the experiment
  substrate); if master moves, the coordinator adopts by SHA and
  re-verifies the shas.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the legs: did the metric set hold, or does a
  metric need revision for the NEXT run?)
