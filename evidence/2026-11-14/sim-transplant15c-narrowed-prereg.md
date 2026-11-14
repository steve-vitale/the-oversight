# H1 transplant — family 15C, fight brains (arm sim-transplant15c-narrowed-a)

Run: fleshout-20261114T1215Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant15c-narrowed-a` (worktree
`~/workspace/worktrees/sim-transplant15c52-a`).

## STATUS OF THIS DOCUMENT — RECONSTRUCTION, NOT A PRE-REGISTRATION

**This prereg was NOT written before the step ran. It is a reconstruction,
written 2026-11-14 ~12:33Z, after the step's sims were already run — and
it says so plainly instead of backdating.**

What happened: the previous worker for this arm (run
fleshout-20261114T0936Z) was CANCELLED mid-step. It left no report, no
prereg, no evidence, no proof test — but it did leave 7 of the 8 per-seed
sim files, already run, in the tree. This completion worker verified
those 7 files (sha256 recorded below, each parsing and matching its
driver-log line), ran only the missing 8th seed (190398) under the same
STEP id, and reconstructs the prereg here from the binding sources that
predate the step.

**The JUDGING BAR itself predates the step.** It comes from the binding
prereg, evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (written
2026-11-13, before any transplant arm ran): ≤1/8 CARRIER, 2/8 AMBIGUOUS
→ one re-run with a fresh STEP id, ≥3/8 NOT-CARRIER. Nothing in this
reconstruction invents or moves a threshold. The reconstruction records
the subject, the instrument, the seeds, and the bar as they were already
fixed by those binding documents — it does not re-decide them.

## The question

The inside-the-merge bisect is CLOSED with
DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE (round 13: s05 + s06 both BAD 1/8,
no good→bad transition; far end 203a32775 GOOD 4/8, merge e4dbe581b BAD
1/8). The H1 transplant program lands ONE origin family onto the far
end and measures whether it alone collapses it.

Family 15C: the fight-brain group of the standalone first-parent OVE
commits (hidden_files/family15-grouping-prereg-2026-11-14.md §15C):
OVE-49 (green-list Phase 5 fight-brain knowledge probe) + OVE-52 (wire
shared fighterState into both fight brains).

## Subject (verified by this worker from the tree, before the fill seed)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band).
- Subject: detached HEAD `12fd9d694` ("OVE-52: wire shared fighterState
  into both fight brains"). `git log --oneline 203a32775..12fd9d694`
  is EXACTLY two single-parent commits, in origin order:
  - `7183c942e07561bdcbea0b6a281a1d680b404e52` OVE-49 (parent
    `203a327750a223e0a1465dc51f5409787efdfaae`, the far end)
  - `12fd9d694d3fde3a4d274cdee948f409c77f4462` OVE-52 (parent
    `7183c942e07561bdcbea0b6a281a1d680b404e52`)
  Both picks were cut 2026-11-14 11:22Z (committer dates; author date
  2026-11-08 — cherry-picks of the origin commits onto the far end).
  The tree at 12fd9d694 is therefore exactly far end + both 15C picks.
  No cherry-pick was needed by this worker; the chain proof is
  recorded here and in the proof test.
- Family diff (`git diff 203a32775 12fd9d694`): 6 files, +740/−35.
  js=4: `src/js/engine/combat.js` (+26), `src/js/fieldFights.js`
  (+113/−), `src/js/game.js` (+70/−), `src/js/villager-agency.js`
  (+172). Non-game: `docs/ONTOLOGY.md` (2 lines) and
  `scripts/test-fight-brain-knowledge-probe.js` (+286/−, test
  refresh). No policy file, no standing.js change.
  - OVE-49 alone: 1 file, `scripts/test-fight-brain-knowledge-probe.js`
    +352 — test only, js=0. (Correction to the grouping prereg, which
    said "scripts/green-list.txt + test only": `git show 7183c942e
    --stat` shows the test file ONLY; green-list.txt is untouched by
    this commit.)
  - OVE-52 alone: 6 files, +511/−158 — the four js files above plus
    docs/ONTOLOGY.md and the test refresh.
- `standing.js` NOT in the family diff: the subject's native
  standing.js is the far-end one (sha256
  `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
  verified by this worker from `git show 203a32775:src/js/standing.js`
  and `git show 12fd9d694:src/js/standing.js` — identical), so the
  standing-fix swap mechanics are exactly as in the bisect prereg.
- Subject's policy is the far-end competent.js (family touches no
  policy file); own-policy per step, same as the bisect. Policy sha
  recorded per seed: `a7ff5c516440`.

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-driver-20261113.js` + vetfirst instrument
  `scripts/vetfirst-instrument-20261111.js`, same as the bisect steps);
  STEP id `t15c-narrowed`.
- Subject: the transplant commit = far end + family diff, on detached
  HEAD `12fd9d694` in this worktree (branch `sim-transplant15c-narrowed-a`
  created from it by this worker for the evidence commit; the subject
  itself is never committed to the arm branch). Applied by the
  cancelled worker's cherry-picks (OVE-49, then OVE-52, origin order);
  no conflict was recorded and the chain verifies clean (see §Subject).
- Primary metric: survived/8 on the band. Verdict thresholds (binding,
  round-2115 §3):
  - ≤1/8 CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list.
  - ≥3/8 NOT-CARRIER — family alone does not collapse (far end is 4/8,
    so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days, death-cause
  shares, standing distribution, rank read (regional ≥5/8
  REGIONAL_INTACT; ≤2/8 RANK_STALL; 3–4/8 RANK_INCONCLUSIVE, per the
  bisect prereg). No cost guard — measurement arm; nothing lands on
  master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant15c-narrowed.js` (subject chain, corpus
  8/8, verdict from the binding thresholds, standing.js restored
  byte-identical, the 7 prior per-seed files unchanged). The reused
  `scripts/test-culpritbisect-a.js` (116 legs) was NOT re-run: this
  worker touched no step tooling (the four untracked driver/analyzer/
  instrument scripts found in the tree were byte-identical duplicates
  of master and were deleted, not modified).

## Seed-band freshness note

Band 190391–190398 is the program-mandated matched band per 2115 §3,
reused by design across transplant arms for comparability against the
far end; no new band is assigned. This is not a freshness violation:
a transplant step re-runs the same seeds on different code, so the
survival count is comparable seed-for-seed. The 190398 fill uses the
same STEP id (`t15c-narrowed`), because the step is deterministic and
the fill lands in the same corpus.

## Fixture note (proof-of-effect)

This is a diagnostic transplant step, not an encounter-beatability
verdict: no staged encounter fixture applies. The instrument is the
competent-policy sim itself — 8 matched seeds, 150d death-aware — and
the verdict turns on village survival across the band, not on whether
a staged fight is winnable. No gear/party fixture was staged and none
is claimed.

## Prior corpus — recorded BEFORE the fill seed ran (this worker)

The 7 per-seed files left by the cancelled worker, sha256 recorded
2026-11-14 ~12:27Z before any new sim, each verified to parse and to
match its driver-log line (days / endReason / deaths count / vetSays
count / 0 instrument errors):

| seed | sha256 (short) | days | endReason | maxWave |
|------|----------------|------|-----------|---------|
| 190391 | b5260fe8… | 60 | village-lost | 4 |
| 190392 | 40d9be68… | 75 | village-lost | 4 |
| 190393 | d9092e58… | 115 | village-lost | 4 |
| 190394 | 68498d57… | 150 | survived | 5 |
| 190395 | a4406937… | 106 | village-lost | 4 |
| 190396 | 971c8f4f… | 128 | village-lost | 4 |
| 190397 | 1a36af01… | 121 | village-lost | 5 |

Full sha256 values are in the proof test
(`scripts/test-transplant15c-narrowed.js`, leg (e)). Driver log:
`evidence/2026-11-13/culpritbisect-a-t15c-narrowed-driver.log`
(7 lines at handover; the 190398 line was appended by the fill run).
1/7 survived at handover (190394 only).

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md (wave law, the
fight-brain content this family touches: fighterState feeds TB
hopeless/reactive flee and field morale; knows-vs-naive flips field
opening intent and TB hopeless flee — OVE-52's own commit message).
No canon doc covers survival-collapse attribution; nothing here
invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change landing, no before/after pair
to compare on one base. The before/after comparison IS the far end
(4/8) vs this subject on identical seeds, judged by the binding
thresholds. Same standing as masterregress §7 and the bisect §7.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the step: did the metric set hold, or does a
  metric need revision for the NEXT run?)
