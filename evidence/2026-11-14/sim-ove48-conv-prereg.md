# sim-ove48-conv-prereg — OVE-48 MECHANISM INSTRUMENT (Loop A, fleshout-20261114T2315Z)

Run: fleshout-20261114T2315Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-ove48-conv-a, branch `sim-ove48-conv-a`, worktree
`~/workspace/worktrees/sim-ove48-conv-a`. Next blank #1 from the 2115Z
round (evidence/2026-11-14/sim-transplant-round-2115.md): instrument
conversation opens FIRST; the revert-vs-keep call for OVE-48 follows
with the mechanism in hand.

## Authority

- evidence/2026-11-14/sim-transplant15a-band3.md + sim-transplant15a-band3-prereg.md
  (band 3: far end 3/8 survived vs OVE-48 subject 0/8 on fresh band
  190457–190464, 150d, competent verbatim — CARRIER verdict, mechanism
  unproven: zero dawn/commitment/want lines in all 473 vetSays lines,
  no convo-want event type in telemetry).
- evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
  roster-check standing-fix swap f8fda4295a99, step mechanics, fix
  policy) + evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
  (H1 transplant program).
- docs/VILLAGER-BRAIN.md Phase 4 (convoSelectWant reads the villager's
  current commitment and top drive) + docs/CONVERSATIONS.md (context-aware
  openings). Canon read first; nothing here invents canon.

## The question

Band 3 proved a SURVIVAL effect (3/8 → 0/8) but not the conversation
behavior: OVE-48 changes which want a conversation opens with, and
the harness records nothing about conversations opening. This arm
builds the instrument (a conversation-open recorder) and measures
the mechanism on the SAME band: does the subject change what
villagers talk about vs the far-end baseline — want-opener
frequencies, dawn-commitment reads, conversation continuation —
on identical seeds? This arm does NOT decide revert-vs-keep.

## Instrument (what it records, per conversation open)

`scripts/ove48-conv-instrument-20261114.js` wraps, per seed run, after
`loadGame` and before `setupGame` (same install point as the driver's
say-wrap; wraps are pure pass-throughs — no `Math.random` draws, no
state writes, no RNG consumed):

- `convoSelectWant(vid)` — every want selection: day, vid, want id,
  source class (`seed` / `repay-preemptor` / `pocketed-preemptor` /
  `weighted-pick`), `fromSeed`, and the pick's own dawn record
  (`out.dawn`: kind, drive, preferred, aligned) when present
  (subject leg only — the far end has no such field).
- `convoDawnPriorities(vid)` (when it exists) — read count + returned
  kind/drive/preferred. Baseline leg: the function does not exist,
  count is 0 by construction (the instrument distinguishes the legs'
  code paths; that 0 is itself a control read).
- Independent dawn-state read, taken inside the `convoSelectWant`
  wrapper BEFORE the original runs, in exactly the pick's read order
  (`vbrainCommit` → `vgoalState` → `vgoalWeights`, all try/caught,
  all pure reads — `vbrainCommit` is a record lookup,
  `villager-brain.js:635`; `vgoalState` is a state read,
  `villager-goals.js:356`): kind + drive as dawn actually chose them
  today, on BOTH legs. This is the leg-independent "what dawn said"
  against which both legs' opens are judged.
- `talkTo(vid)` — open: opener line returned (truncated 300 chars),
  opener thread, want stage at open.
- `endConvo(vid, how)` — close: want stage at close, resolution
  (`c.want.resolution`), reason. The verbatim competent policy walks
  out immediately (`endConvo('left')`, zero exchanges), so stage at
  close is expected 0 everywhere — recorded as a distribution, not
  assumed.
- `Game.say` (chained after the driver's vetSays wrap) — lines spoken
  while a conversation is open (cap 6 lines per conversation, 1500
  per seed, overflow counted): the sense-testing sample, classified
  by the analyzer for dawn/commitment/want mentions.

Per-seed JSON carries `out.convo = { opens, lines, totals }` alongside
the bisect driver's usual fields (field-compatible with the band-3
corpora). The analyzer (`scripts/ove48-conv-analyze-20261114.js`)
computes dawn alignment from the recorded kind/drive using the
DAWN_KIND_WANTS / DAWN_DRIVE_WANTS tables copied verbatim from the
subject source; the proof test diffs those tables against
`git show transplant-15a-narrowed-subject:src/js/convo-wants.js`.
Alignment is defined ONLY for weighted-pick opens (pre-emptors bypass
the pick; aligning them is meaningless). The subject's own
`out.dawn.aligned` is recorded as a cross-check (agreement rate
reported; any disagreement is investigated, not averaged away).

## Prereg (binding, committed BEFORE any judged sim)

- Base: far end 203a32775, with the roster-check standing fix swapped
  in for every step exactly as the bisect prereg specifies (fix file
  sha f8fda4295a99, from commit 5157782a4; native restored
  byte-identical afterwards, sha-verified 75762cb2…).
- Subject: branch `transplant-15a-narrowed-subject` at 493d7a975,
  VERIFIED at run start before any sim (exactly 1 commit on the far
  end; tree 6d6216e3e414518d2c335829e130e65ec849941b; diff vs far end
  exactly 3 files +320/-3; green-list.txt byte-identical to the far
  end). Read-only use; NEVER commit onto it; NEVER rebuild it. If
  verification fails, FAIL LOUDLY and stop.
- Seeds: DELIBERATE REUSE of the band-3 band 190457–190464 (8 seeds)
  — per the transplant protocol, the mechanism must be measured on
  the band where the survival effect was proven, not a fresh one.
  Horizon: 150d death-aware. Policy: competent verbatim own-policy
  per step (each step runs its commit's OWN competent.js; COMPETENT_TALK
  NOT set — the walk-out default, exactly as band 3 ran it, so the
  survival numbers stay comparable to band 3).
- Legs (TWO, both on 190457–190464, both 150d death-aware):
  - Leg 1 (baseline): far end 203a32775, STEP t-ove48-conv-base.
  - Leg 2 (subject): transplant-15a-narrowed-subject 493d7a975,
    STEP t-ove48-conv-subj. Both legs run (no gate — the band already
    discriminated at 3/8; the question here is the mechanism, and
    the subject leg IS the measurement).
- Step mechanics: `scripts/ove48-conv-step.sh` (modeled on
  scripts/culpritbisect-step.sh; SEEDS=190457,…,190464; restores
  tooling scratch — driver + analyzer + instrument + vetfirst
  instrument + masterregress analyzer — from branch
  sim-ove48-conv-a, NOT master, because this tooling is not on
  master; the script checks out the step commit detached, so run
  from the /tmp copy with REPO set to the worktree for EVERY step
  including the first). The repo step script is NOT modified. Corpus
  paths: evidence/2026-11-14/perseed-ove48-conv-<STEP>/, driver
  logs + summaries in evidence/2026-11-14/ (ove48-conv-<STEP>-driver.log
  / -summary.json). Commit corpus directories by expanding to FILE
  LISTS first — safe-commit.sh refuses directory paths.

## Pre-registered bars (judge exactly this)

PRIMARY — instrument validity (the instrument must prove itself
before any mechanism claim is judged):
- V1: ≥200 conversation opens captured per leg (expected ~1,000:
  the policy opens ~1 conversation/day while the scholar lives).
- V2: ≥95% of captured opens fully classified (want id + source
  class + dawn-state read attempted without error).
- V3: `convoDawnPriorities` reads > 0 on the subject leg AND = 0
  on the baseline leg (the instrument sees the pick's code path
  fire, and sees it absent where it does not exist).
- V4: 0 instrument errors on both legs.
- V5 (replication guardrail): per-seed survival fields
  (days, endReason, deaths count, maxWave, standing) are
  FIELD-FOR-FIELD identical to the band-3 corpora for all 16
  seed-legs (band 3: baseline 3/8 survived, subject 0/8). The
  recorder is a pure observer; any deviation means it changed
  behavior, and the run is DIAG (investigate the deviation),
  never re-scored. Expected wall numbers: baseline 3/8, subject
  0/8, national 0, table 0, wins 0.

DECIDING COMPARISON (judged only if V1–V5 all pass):
- Primary deciding metric: dawn-aligned share among WEIGHTED-PICK
  opens (want id in the dawn-preferred union for that open's kind
  + drive), subject minus baseline.
- GO bar: subject aligned share ≥ 40% AND improvement ≥ +15pp over
  baseline. GO = the pick changes conversation behavior as
  implemented: villagers open with what dawn chose, measurably
  more than the far end does by chance/shared inputs.
- NO-GO: instrument valid (V1–V5 pass) but the deciding comparison
  misses the bar. NO-GO = the mechanism is NOT demonstrated at
  this instrument's floor — the pick does not change what
  villagers talk about in sims, and the band-3 survival effect
  must reach the fighting through another path (or below this
  floor). A miss is NO-GO, never re-scored against a friendlier
  metric mid-run.

SECONDARY (reported, not judged): want-opener distribution per leg
(total variation distance); pre-emptor rates (seed/repay/pocketed);
dawn-state-present rate per leg (fraction of opens where a dawn
kind or drive existed); opener-produced rate (talkTo returned a
line); opener thread distribution (want/small/resume); want stage
at close distribution; `out.dawn.aligned` cross-check agreement
rate (subject); dawn/commitment/want line counts in the convo-line
sample; wall numbers (survived/8, national/table/wins, wave-5,
median survival, death-cause shares, starvation).

## Continuation scope (stated honestly, up front)

The verbatim competent policy walks out of every conversation
immediately (`talkRound`: `talkTo` then `endConvo('left')`, zero
exchanges) — that is how band 3 ran, and changing it would break
survival comparability with band 3. So this arm measures
continuation ONLY as: opener produced (line vs null), opener
thread, want stage at close, endConvo reason. Multi-turn
continuation (does a dawn-aligned opener lead to a longer, deeper
sitting) is OUT OF SCOPE for this arm by construction; a follow-up
arm can enable COMPETENT_TALK=1 (held conversations, up to 2/day,
5 turns) on both legs to measure it. The deciding comparison does
NOT rest on deep continuation.

## Metric review (section in the evidence file)

Pre-registered here so the evidence carries it: if the deciding
comparison misses, write under "metric review" whether the bar or
the instrument was wrong (e.g. baseline chance-alignment already
near the subject's — the +15pp bar too strict; or opens too few
to discriminate — V1 floor too low), and propose the revision for
the NEXT run. Do not re-score this run.

## Fix policy

Bisect prereg §Fix policy binds this arm: no game-code change lands
from this measurement arm. This arm builds an instrument (scripts/
tooling) + evidence only. No revert, no keep decision — that call
follows with the mechanism in hand (coordinator/Steve).

## Canon

docs/CANON.md read first. docs/VILLAGER-BRAIN.md Phase 4 documents
`convoSelectWant` reading "the villager's current commitment and
top drive, so a conversation opens from the same priorities the
dawn chose" — OVE-48 is the implementation of that documented
contract. docs/CONVERSATIONS.md covers context-aware openings. No
standalone canon doc covers OVE-48 itself. Nothing here invents canon.

## Pick content (read before the step)

- Pick 1, c937de65f "OVE-48: convoSelectWant reads dawn commitment
  and top drive": `convoDawnPriorities(vid)` reads today's vbrain
  commitment kind + top drive (vgoal) and biases the weighted want
  pick toward the wants that match (DAWN_KIND_WANTS /
  DAWN_DRIVE_WANTS, primary bias 2.0, secondary 1.0); unfinished-
  business pre-emptors (seeds, repay, pocketed) stay above. In plain
  words: what a villager talks about when you open a conversation
  now follows what dawn already decided they are doing today.
- The pick changes no kcal cost, no damage, no armor, no spawn, no
  food yield, no spoilage, no wave or table gate number. A survival
  effect, if any, would have to come through villagers choosing
  different conversations — a third-order behavioral path. The
  weights are biases inside an existing decision, not new gates.

## Freshness / band note

Deliberate reuse of band 190457–190464 (band 3). This is NOT a
freshness violation: the transplant protocol reuses the band where
the effect was proven, so the mechanism is measured on the same
trajectories. The band is named in the band-3 prereg/evidence and
the 2115Z round record; no new band is consumed.

## Ordering note

Subject verification ran as part of prereg preparation, before this
file was committed (same precedent as the band-3 prereg). The binding
requirement is met: this prereg is committed BEFORE any judged sim
runs. No STEP t-ove48-conv-base / t-ove48-conv-subj corpus, summary,
or driver log exists at commit time. The stage-1 proof (instrument
validation on a scratch seed, 30d, unjudged) is committed WITH this
prereg, same as the band-3 arm.
