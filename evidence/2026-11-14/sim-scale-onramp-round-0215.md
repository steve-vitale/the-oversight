# Scale-onramp round — run fleshout-20261115T0215Z (Loop A)

Axis: scale-onramp (converging, NOT converged). Loop B live on winnability
chain throughout (claim fleshout-loop-b-20261115T0155Z, arms
sim-succpolity-b + sim-holdbuild-b, heartbeat 02:46:55Z at run start) — NOT
touched. Master moved under the run (Loop B landings + journey-deepening
r193); both arms rebased/merged clean, zero file overlap.

## Coordinator decisions (blank #1, tracker 0148Z)

### OVE-48 revert-vs-keep: KEEP — no revert

The mechanism is proven and the survival effect is unexplained by it:

- (a) Kind half GO (sim-ove48-mech-a): kind is non-null on 76.8% of
  weighted picks on master tip (383/499, 11 distinct kinds). The
  ove48-conv null (1,810 opens, kind null everywhere) was structural:
  `villager-brain.js` did not exist at either old leg — the writer
  landed with PR #7 after both bases. The contract's kind half IS
  exercised on current master.
- (b) Spoken drive: judged instrument NO-GO (18.7% of held sittings
  name the drive in turn lines vs 25% bar, n=3,952 pooled; mean
  exchanges aligned 3.52 vs misaligned 3.55) — BUT the instrument
  listened to `Game.say` while spoken dialogue goes to
  `c.transcript`, not `Game.say`. A scratch transcript probe (56 held
  sittings, 30d, master tip) names the drive in 62.5% of sittings,
  42.9% excluding the generic word "promise". The NO-GO is an
  instrument-channel finding, NOT a verdict on what villagers say.
  A judged transcript run is owed before (b) is treated as settled.
- (c) Causal path pick → 0/8 survival: PROVEN NEGATIVE. kcal delta
  +0.014% of pantry flow, ticks +0.012% of budget, 0 held opens (no
  trust/mood/favor/teaching channel), no state series diverges before
  the first death divergence on any seed (deathDiv days 4–14). Under
  held conversations the collapse does NOT reproduce (subject 4/8 vs
  far end 3/8). RNG-draw drift (+54 weighted-pick draws) is the named
  non-semantic carrier candidate: the subject consumes extra draws,
  re-rolling downstream randomness without any semantic cost.

KEEP rationale: the pick moves 28.7% → 74.9% dawn-aligned, the kind
half is exercised on current master, and no causal path from the pick
to the deaths exists — the 0/8 reads as a seed-band artifact / RNG
re-roll, not a semantic cost of the change. Reverting would throw
away a proven conversation improvement for an unexplained number.
Owed follow-ups: (1) judged transcript run for (b); (2) fresh-band
survival re-test of OVE-48 vs far end to close the 0/8 question;
(3) RNG-draw-parity probe (does the subject consume extra draws
that shift downstream randomness?).

### Narrowed 8c: matched-band rerun LICENSED (not run this run)

The 8c question stays open. The fresh band's far-end health (1/8)
differs from the matched band's settled 4/8 — far-end health is
band-sensitive (new finding, see arm 2). A rerun on the matched
band (190391–190398, settled 4/8 baseline) is licensed as the next
8c arm with its own prereg, pre-registering the matched band BEFORE
running, justified by the baseline-gate failure mode + band
sensitivity — the subject leg never ran, so no subject outcome
exists to select on. The fresh-band 1/8 stays on the record.

## Arm 1 — sim-ove48-mech-a (DIAG, blank #1 sub-questions)

Verdicts: (a) GO, (b) NO-GO (instrument-channel caveat above),
(c) PROVEN NEGATIVE. Zero src/js changes. Commits (rebased 6/6 clean
onto master tip 652979c54; original hashes ac70d9951, 9e06472f9,
069f96e8c, 36b62f902, 3d3744340, b3d1c4cb6 — rebased to 283676c2f,
cb8c9e1d2, 47686db8d, f0ed8432c, 43d49d74d, 2a0c9b0d6; evidence file
records the originals): merged ff-only 2a0c9b0d6. Proof
scripts/test-ove48-mech.js: stage 2 33/33 green on the rebased tip
(stage 1's 6 "failures" are stale-by-design pre-run guards: pinned
master-tip + no-corpus-yet, same pattern as ove48-conv).
Evidence: evidence/2026-11-14/sim-ove48-mech-a.md (+ prereg).

Wall (all legs, 8 seeds each, 150d): KIND leg (master tip, verbatim)
survived 2/8, median 100d; TALK-BASE (far end, held) 3/8, median
147d; TALK-SUBJ (OVE-48, held) 4/8, median 150d. National / table /
wins 0 everywhere; wave 5 2/8 / 6/8 / 5/8; wave 4 8/8 all legs.
Regional 24/24 seed-legs. Villages die fighting, not hungry.

## Arm 2 — sim-transplant8c-a (blank #2, narrowed 8c)

Verdict: UNMEASURED (baseline gate) — survival question unanswered;
family-test verdict separate: the hunk works exactly as designed.
Baseline leg ep-far-8c (far end 203a32775, fix standing swapped in,
competent a7ff5c51, 150d, fresh band 190541–190548 verified fresh with
zero hits across all preregs and evidence): survived 1/8, per-seed
days 122/134/150/92/67/150/150/114, median 134d, 0 instrument
errors. Pre-registered gate (baseline ≥3/8) failed at 1/8, so the run
STOPPED per prereg — no t8c subject leg was cut. A subject 1/8 could
not distinguish "the hunk collapses the far end" from "the band is
hard". The 1/8 is a real read, not a harness artifact. The far end's
settled 4/8 on the matched band (190391–190398, reproduced twice)
does NOT generalize to this fresh band — far-end health is
band-sensitive.
Family test: scripts/test-transplant8c-dlgmore.js PASS both cases on
the subject, FAIL both on the far end (pre-registered control). The
#4 proof on the subject is NOT-GREEN (3 failures, all missing 8b
content/substrate, none touching the 8c hunk); the resume shape
(dlg:more — the 8c handler) is GREEN. Sense: 440 vetSays lines, 0
"lost my train of thought", 0 "Still on" — the bot never drives a
dlg:more beat into a ledger block in sim, so the survival corpus
cannot speak to the hunk.
Commits: prereg+proof bc6567bde, proof §9 STOP branch 8438ddd02,
evidence+corpus b2cc93506, final proof count 7b2192b76; merged
ff-only to local master at 7b2192b76. Proof
scripts/test-transplant8c.js 122/122 on merged master (coordinator
re-ran; worker's "124" was a slip); culpritbisect 116/116.
Subject branch transplant-8c-subject @ 2cd6720b0 left in place for
the licensed matched-band rerun. Evidence:
evidence/2026-11-14/sim-transplant8c.md (+ prereg).

Wall (baseline leg): national 0/8, table 0/8, wins 0/8, wave-5 2/8,
wave-4 8/8, regional 6/8, median 134d, deaths 656 (villager combat
257, expedition 178, combat 103, wild 83, monster 17, starvation 2).

## Wall (this run's judged corpora)

Survived: ove48-mech 2–4/8 per leg, 8c baseline 1/8. National 0,
table 0, wins 0 on every judged corpus. Wave-5 2–6/8 per leg.
Telemetry deviation check: REFUSED (recorder-corpus class, as for
all prior bisect/transplant arms) — baseline NOT rolled, no LOUD
lines.

## Infrastructure

- Safe-commit index clobber struck 5× on the 8c arm (repaired with
  the documented ls-tree pipe each time, commits verified correct).
- Container EPERM write flap struck at closeout: worktree-release
  for ove48-mech-a errored (PermissionError), `git branch -d
  sim-ove48-mech-a` failed twice on .git/packed-refs.new, `git
  status` failed on .git/index.lock. Worktree itself removed clean;
  merge verified on master (2a0c9b0d6 ancestor of HEAD) BEFORE the
  flap. RECOVERED at closeout once writes cleared: branch deleted,
  registry released, status clean, this evidence file committed.
- Master moved under the run (Loop B succpolity-g1join-b, winnability
  round 0310, journey-deepening r193); both arms rebased/merged
  clean, zero file overlap. check.js --quick NOT re-run (zero src/js
  on the 8c arm; ove48-mech zero src/js; loop precedent).
- The 8c worker recorded a goal timeline entry + memory note; the
  ove48-mech worker recorded a goal timeline entry + memory note.

## Metric review

- The 8c prereg's baseline gate assumed a fresh band would reproduce
  far-end health; it didn't. Next transplant prereg: state the
  expected baseline band explicitly, or add a small band-health
  pre-check before committing the full leg.
- The ove48-mech (b) instrument listened to the wrong channel
  (Game.say vs c.transcript). Next talk-measurement prereg: name the
  capture channel and prove it with a one-sitting smoke test before
  the judged legs.
- No re-scoring: both arms judged against their committed preregs.

## Findings appended

- OVE-48 RNG-draw drift candidate (+54 weighted-pick draws as the
  non-semantic carrier of the 0/8 survival effect).
- Judged transcript run owed for the spoken-drive question (b).
- Far-end health is band-sensitive (matched band 4/8 vs fresh band
  1/8) — baseline-gate design note for transplant preregs.
- Narrowed 8c candidate stays open; matched-band rerun licensed.

scale-onramp stays converging (NOT converged): OVE-48 is KEPT with
its mechanism proven and its survival effect unexplained-but-
unreproduced; 8c is unmeasured with a licensed rerun; national /
table / wins remain 0 on every judged corpus. food-economy stays
converging (untouched; parked). winnability chain stays converging
(untouched; sibling loop B). Next blanks, in order: (1) judged
transcript run for the OVE-48 spoken-drive question; (2) matched-band
8c rerun (190391–190398, own prereg); (3) OVE-48 fresh-band survival
re-test; (4) RNG-draw-parity probe; (5) family 6b + narrowed 7b;
(6) family 2b AMBIGUOUS stays on the suspect list; (7)
headcount-ceiling (Steve-call); (8) Reunion mirror pack in the wild
(Steve design call). Claim deleted; lock deleted.
