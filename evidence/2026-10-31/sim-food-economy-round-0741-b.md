# Loop B round 0741Z — food-economy: joint gate census + strand-fix NO-GO (merged locally, pending ship)

Run: fleshout-loop-b-20261031T0741Z, axis food-economy (second non-converged
axis). Loop A live on scale-onramp for the whole run (claim
fleshout-20261031T0726Z: heraldhp-adopt / mustercall2 / pocketcall) — NOT
touched. Base at run start f239efe48; master moved under the run (Loop A
heraldhp adoption 70407e9f4, journey r78 5cd3184ef, Loop A mustercall2
8b9911a50); both branches rebased clean, proofs re-run after every rebase
and before merging. Zero src/js changes, zero policy-default flips in
either arm. No food-economy default flipped, no balance change landed.

## Stale-lock recovery (start of run)

The previous Loop B run (0436Z, arms sighit / heraldhp / deadfall) was dead:
its worktree heartbeat was 86 minutes stale, no processes, no worktree
writes since 04:37Z. Its sighit and deadfall arms had already landed on
master; its stranded heraldhp arm was adopted live by Loop A and landed as
70407e9f4 (#1595 closed: Herald HP drop = raid wall + field fights) — this
run did not touch that branch, tree, or claim. Loop A had already retired
the old 0436Z claim to .DEAD; this run deleted the old B lock. This run's
own claim (fleshout-loop-b-20261031T0741Z) and lock were written before
any sims and are deleted at closeout.

## Arm 1 — sim-jointgate-b: DIAG-GO

Worker branch sim-jointgate-b, rebased onto 8b9911a50, proof 177/177 on the
rebased branch, merged --ff-only (evidence commit 5bf65d1b6; prereg
de57eeb0f, instrument c1430c667, corpora 72bea4a95). DIAG ONLY: zero
src/js, zero policy-default flips, zero edits to existing policy files.

Question: do fed + axe-tier tool + roomy (ticks) ever jointly hold on a
strand morning? Fresh census on current master (tickfell corpus NOT
re-judged). Substrate: POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, 30d, strand seed 15215 guard +
ON legs, plus a 9-seed confirm bank (15003, 15009, 15091, 15211, 15220,
15221, 15337, 15376, 15439 x guard/ON = 18 legs).

- 15215 guard: 3 strand mornings, all pack-ready (wood 4) — joint N/A.
- 15215 ON: 9 strand mornings, 7 needs-wood, **joint 0/7**. Per-gate fails
  over the 7: tool 7/7, kcal-floor 7/7 (morning kcal 0, 31, 0, 0, 0, 52, 0
  vs 80), ticks 4/7. A fellable bigtree stands 2-3 steps away on every
  strand morning; tier/canFell agree 7/7 (whittle => canFell false).
  Replicates tickfell number-for-number on a new base.
- Confirm bank: **0 strand mornings on all 18 legs** — the strand is
  15215-only in the bank, so the joint question has no denominator
  outside 15215. Positive control: on 15337 the recorder finds first-axe
  evening day 1 / morning day 2 (hatchet fetched day 1), so the 15215
  never-axe result is not a recorder blind spot. Axe held in 30 days on
  only 1/10 seeds run.
- Reconciliation (the core answer): BOTH prior findings hold at once.
  The day-1 fetch FIRES on 15215 (both legs) — it fetches a hunting spear
  + work gloves, because the spawn stash is [multitool, hunting_spear,
  work_gloves] with no axe-tier weapon in it. A fetch routine cannot
  fetch what the vessel does not own, and the spear carries no woodcut
  tag, so tier stays 'none'. Stone knife arrives day 7 intraday
  (morning none -> evening whittle, same vessel). No axe is ever held in
  30 days on this stack; the axearrival day-15 corpse-loot axe belongs
  to the strandfix-variant stack and does not occur here.
- Plain-words shape: **axe seeds don't strand, and the strand seed has
  no axe** — no seed on this stack puts an axe-holder where a morning
  fell would matter. A future fell fix must supply the axe first, plus
  morning-side food (strand mornings wake at 0-52 kcal after evenings
  that ate 240 — the evening meal does not survive the night).
- Sense test: still evenings L10 and L14 (ON leg) read end to end — a
  person foraging Purslane, catching fire-gossip, eating, refused
  honestly ("pack holds 3 logs, a bridge needs 4" / "0 logs"). PASS on
  meaning. The joint failure itself stays invisible in-story — no line
  names the nearby bigtree or the missing axe — flagged as a design
  call, not built (DIAG scope).
- Evidence: evidence/2026-10-31/sim-jointgate-b.md (+ prereg).

## Arm 2 — sim-strandfix2-b: NO-GO

Worker branch sim-strandfix2-b, rebased onto 5bf65d1b6 (jointgate tip),
proof 17/17 on the rebased branch, merged --ff-only (evidence commit
04c796b78; prereg 7563ca4f3, instruments 8d9707cda). Judged exactly
against its prereg (committed before any judged leg). Policy-side
prototype only (scripts/policies/strandfix2-diag.js, default-OFF
env-gated); zero src/js, zero policy-default flips.

Design (deliberately none of the failed things — no morning wood-seek,
no whole-day hold, no routine trim, no morning fell): evening flip-bank
+ morning pack-eat, working the two priced levers prior arms left
untouched — the evening clock (waitsalign's 448 sleep line) and the
warmth fuel. 8-seed band, DAYS=30, same strand substrate as arm 1.

- Before/after on identical seeds: guard still 3 -> 3 (nights 7-9);
  ON still 10 -> **11 (nights 7-17, lengthened by 1)**. Both-evenings
  (7, 8, 9): **0 converted, 0 prevented** on both legs. GO required
  fall >= 2 on at least one leg plus no lengthening on either — both
  clauses fail. Verdict: NO-GO.
- Guardrails: ticks-short unchanged (1, day 7, both legs); non-strand
  seeds' creek still counts unchanged; ON vessel death day 17
  unchanged. FLAG: guard variant introduces a vessel death day 23
  ("the night", inside haven) where its control leg has none in 30
  days — cause not separable from RNG-stream divergence on one seed,
  reported as a guardrail flag; the verdict does not rest on it.
- Det-gate: OFF legs reproduce control legs exactly, both legs.
  Determinism: ON variant re-run byte-identical, 8/8 files.
- Why it fails (three priced findings): (1) **Banked food does not
  survive the night.** Evening banks of 540-810 kcal of known-edible
  food read pack 0 the next morning, morning scholar kcal still 0.
  Morning pack-eat never fired once in the whole confirm band (0
  eats). The food half is inert, not under-powered. (2) **Flips fire
  but open nothing at wood < 4.** True flips (guard d9: 403->453; ON
  d15: 402->453) deliver roomy next mornings (256 ticks left,
  confirmed), but guard d10 was already rescued on control and ON d16
  is wood 0 — a bridge needs 4 logs and no flip manufactures one.
  Most still evenings sit at post-warmth clocks 273-322, outside the
  80-tick flip window. (3) **Branches persist and block warmth — real,
  small, too late.** Branches gathered d15 (0->4) are still 4 on d16/d17
  mornings and warmth misses "branches-available" both nights, stopping
  the ON wood-bleed — but warmth successes on d8-d14 already walked
  wood 4->0, and the roomy d16 morning keeps the villager out one more
  night before the same day-17 death.
- Sense test: acted evenings are narrated honestly about the work —
  but the flip line's clause "What you banked waits for morning" is
  FALSE as measured (morning pack is 0). Any future version must not
  carry that clause unless banking is proven to survive the night.
  The morning phase is silent by non-firing, not by design.
- Named next (not built here): the fed-morning problem must be solved
  where food actually persists — morning acts at a known patch
  (selecttrim's preserved walk/press) or a haven-departure pack-food
  carry (the wood-carry pattern, for food). Evening banking is closed
  as a route.
- Evidence: evidence/2026-10-31/sim-strandfix2-b.md (+ prereg, census,
  compare, corpora).

## NO-GO cleanup (coordinator, tickfell pattern)

A NO-GO arm leaves no trace: after merging, coordinator commit 2f207b9c9
deletes the prototype policy layer (scripts/policies/strandfix2-diag.js)
plus the two scripts that require it (scripts/strandfix2-trace-b.js,
scripts/test-strandfix2-b.js) — 886 deletions. Kept: evidence, prereg,
census, compare, corpora, and the standalone analyzer
(scripts/analyze-strandfix2-b.js, fs/path only), so the judged numbers
stay re-derivable. No other file on master referenced the deleted layer
(grep-verified). The cleanup commit hit the known safe-commit index
clobber (commit correct; worktree index showed the deleted files as
staged additions) — repaired via `git update-index --force-remove`,
verified: status empty, ls-files empty, diff HEAD empty.

## Wall numbers (this run's judged corpora)

30-day pre-seat census on both arms: national / table / wins are NOT
observable — stated plainly, not fabricated. Observed structural counts:
national 0, table 0, wins 0 on all legs; median survival 30 days
(ceiling). Wave reach (jointgate census, 20 legs): wave 2 on 7/9 bank
seeds, wave 3 on 15439, wave 1 on 15221; waves 4-5 in 0/20. Strandfix2
variant maxWave 2 on 15215 vs control 1 is post-strand divergence on
one seed, not a wall movement. Overall wall UNCHANGED: full seat 0,
wave 5 reached 0 stands (latest observable band remains Loop B 0342Z /
Loop A herald band: national 8/16, table 12/16, wins 11/16, wave 4 9/16,
wave 5 0/16).

## Telemetry deviation check

See the closeout note: run against the jointgate + strandfix2 per-seed
corpora with the scale-wall baseline. Recorder-row corpora of this class
were REFUSED by the tool itself on the 0342Z run (anchorCommit rows);
if refused again, no comparison is performed, no LOUD lines exist, and
the baseline is NOT rolled. If LOUD lines appear, they are investigated
in the same note, not silently quoted.

## Metric review

Both arms were judged exactly against preregs committed before any
judged leg; no metric was re-scored mid-run. Jointgate's five bars
(pilot recorder complete, determinism byte-identical, 18-leg confirm
complete, 15215 stash-fetch reconciliation determinate, transcript
sense-read done) all passed — the joint count 0 is a finding, not a
failure. Strandfix2's GO bar (fall >= 2 on at least one leg, no
lengthening on either) failed on both clauses; the guardrail flag
(day-23 vessel death) is reported, not used to overturn anything.
No metric revision is proposed for the next run. The next strand-fix
design must pre-register a morning-side food mechanism (patch acts at
wake, or haven-departure pack-food carry) — evening banking is closed,
and any fell-based design must pre-register axe supply first, since
jointgate proves the strand seed never holds one.

## Infrastructure

- Worktree registration slow (~6 min for two trees, same slowness class
  as prior runs, not a failure). Heartbeats verified landed by readback
  for all three trees (jointgate, strandfix2, coord).
- Loop A landed mid-run (heraldhp 70407e9f4, journey r78, mustercall2
  8b9911a50); both arm branches rebased clean, proofs re-run green
  after every rebase and before merging; zero file overlap with
  either arm.
- check.js --quick NOT re-run (zero src/js, zero policy-default flips;
  arm proofs green on merged master content, same disclosure as
  0342Z/0537Z/0643Z).
- Worktrees released as merged, branches deleted: sim-jointgate-b,
  sim-strandfix2-b, coord-0741-b. Claim retired to .DEAD; lock deleted.
- Merged locally, pending ship. No push, no version bump, no live
  verification — the batch ship job owns deploys.

food-economy stays converging (NOT converged): the strand is now priced
on a joint gate that never holds (tool 7/7 + kcal 7/7 + ticks 4/7 on
15215 ON), an evening-banking route that is closed (food vanishes
overnight), and a flip mechanism that fires but cannot manufacture
wood — but no strand fix has landed and no food-economy default
flipped. Next blanks, in order: (1) a strand-fix design with a
morning-side food mechanism (patch acts at wake, or haven-departure
pack-food carry), pre-registered before judged sims; (2) an
axe-supply-first design before any fell-based fix is re-attempted
(jointgate proves the precondition never holds on this stack); (3)
the lacking-line wording decision (name-first-plus-count recommended)
and the warmth-fuel decision, both still awaiting a design owner; (4)
the two Steve-call items (competent courtship drive;
generation-dealt vs earnable vests) and the warmth default still await
rulings. scale-onramp untouched (sibling Loop A lane).
