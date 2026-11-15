# sim-ove48-conv — OVE-48 MECHANISM, ADOPTED + JUDGED (Loop A, fleshout-20261114T2315Z)

Run: fleshout-20261114T2315Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-ove48-conv-a, branch `sim-ove48-conv-a`, worktree
`~/workspace/worktrees/sim-ove48-conv-a`. Tracker blank #1 from the
2115Z round (evidence/2026-11-14/sim-transplant-round-2115.md).
Prereg: evidence/2026-11-14/sim-ove48-conv-prereg.md (committed
BEFORE any judged sim, commit 66b9ecfe8).

## Verdict: GO — the mechanism is demonstrated

**Subject aligned 74.9% vs baseline 28.7% (+46.1pp).** Both halves of
the pre-registered GO bar are met with wide margin (bar: subject
>= 40% AND improvement >= +15pp). Want-mix total variation distance
0.215. Instrument validity V1–V5 passes on BOTH legs.

In plain words: with OVE-48, what a villager opens a conversation
with follows what dawn already decided they are doing today, nearly
three times out of four. Without it, the same villagers open with a
dawn-matching want barely more than one time in four — by chance, or
because the day's drive and the standing want weights happen to point
the same way. The pick changes conversation behavior. This arm does
NOT decide revert-vs-keep for OVE-48 — that call follows with the
mechanism in hand (coordinator/Steve). What it settles: the
conversation pick is a real, measured behavior change, not a
no-op. The band-3 survival effect (3/8 → 0/8) still has no proven
causal path from the pick to the deaths — see "what is still
unproven" below.

## Adoption note (this run inherited a half-finished arm)

The previous worker died mid-flight AFTER committing the prereg,
instrument, driver, analyzer, step script and proof test
(66b9ecfe8) and the full BASE leg corpus (79d58abae, far end
203a32775, 3/8 survived, 875 opens). What was stranded uncommitted:
the SUBJECT leg corpus — 7 complete per-seed JSONs plus a driver log,
seed 190457 present only as a 0-byte `.tmp-31485` (write-flap
artifact) with its full JSON printed inline in the driver log under
`@@FALLBACK`.

Recovery route used: **@@FALLBACK extraction** (not a re-run).
Lines 2–63685 of `ove48-conv-t-ove48-conv-subj-driver.log` extracted
to `perseed-ove48-conv-t-ove48-conv-subj/ove48conv-s190457-ove48-conv-pilot-fix.json`,
0-byte tmp deleted. Verification: the recovered JSON parses; its
`convo.opens` length (127) and dawn reads (73) match its log summary
line exactly; and V5 replication (below) matches it field-for-field
against the band-3 subject corpus — the strongest check available,
since a re-run could not reproduce those fields. No valid file was
overwritten.

Branch note: the task brief said to create `sim-ove48-conv-a` from
493d7a975. The branch already existed (dead worker's), based on
master tip 910bff7f4 — which contains the far end 203a32775 but NOT
OVE-48 (verified: `git merge-base --is-ancestor 493d7a975
sim-ove48-conv-a` = false). That base is correct for this arm: the
BASE leg runs the far end natively, and the SUBJECT leg runs the
subject branch read-only through the step mechanism (verified at
prereg time: exactly 1 commit on the far end, diff 3 files +320/-3).
No commit was made onto the subject branch. Evidence file name:
`sim-ove48-conv.md` (the in-tree stage-2 proof test reads this
name), not `sim-ove48-conv-a.md` as the brief draft had it.

## The question, as pre-registered

Band 3 proved a SURVIVAL effect (far end 3/8 survived vs OVE-48
subject 0/8 on fresh band 190457–190464, 150d, competent verbatim)
but not the conversation behavior: zero of 473 vetSays lines
mentioned dawn/commitment/want, and no convo-want event type existed
in telemetry. This arm built the instrument (a conversation-open
recorder) and measured the mechanism on the SAME band: do villagers
actually talk differently with OVE-48 — which wants open, how often
dawn/commitment drives the pick — not just survival.

## Lever played

Instrument + measurement only. NO game-code change (no src/js
touched in this arm; the OVE-48 pick itself, c937de65f /
493d7a975, is the subject under measurement, not this arm's change).
Instrument: `scripts/ove48-conv-instrument-20261114.js` wraps
`convoSelectWant` / `convoDawnPriorities` / `talkTo` / `endConvo` /
`Game.say` as pure pass-through observers (no RNG draws, no state
writes). Driver `scripts/ove48-conv-driver-20261114.js`, step
`scripts/ove48-conv-step.sh`, analyzer
`scripts/ove48-conv-analyze-20261114.js`, proof test
`scripts/test-ove48-conv.js` (stage 1 + stage 2). Canon:
docs/VILLAGER-BRAIN.md Phase 4 documents `convoSelectWant` reading
"the villager's current commitment and top drive, so a conversation
opens from the same priorities the dawn chose"; OVE-48 is the
implementation of that documented contract. No standalone canon doc
covers OVE-48 itself.

## Method (per prereg — seeds, horizon, policy)

- Seeds: deliberate reuse of the band-3 band 190457–190464 (8 seeds).
  Horizon 150d death-aware. Policy: competent verbatim own-policy
  per step (each step runs its commit's OWN competent.js;
  COMPETENT_TALK NOT set — the walk-out default, exactly as band 3
  ran it, so survival stays comparable).
- Base leg: far end 203a32775, step t-ove48-conv-base, standing fix
  f8fda4295a99 swapped in per the bisect prereg. Subject leg:
  transplant-15a-narrowed-subject 493d7a975, step t-ove48-conv-subj,
  same fix swap.
- Deciding metric (pre-registered): dawn-aligned share among
  WEIGHTED-PICK opens (want id in the dawn-preferred union for that
  open's kind + drive), subject minus baseline. GO = subject >= 40%
  AND improvement >= +15pp. Alignment tables copied verbatim from
  the subject source; the proof test diffs them against
  `git show transplant-15a-narrowed-subject:src/js/convo-wants.js`.
  The subject's own `out.dawn.aligned` is recorded as a cross-check.

## Before/after — identical seeds 190457–190464

### Validity V1–V5 (both legs)

| Bar | Base (far end) | Subject (OVE-48) |
|---|---|---|
| V1 opens >= 200 | 875 ✓ | 935 ✓ |
| V2 classified >= 95% | 100.0% ✓ | 100.0% ✓ |
| V3 dawn-priority reads | 0 ✓ (function absent — control read) | 569 ✓ |
| V4 instrument errors | 0 ✓ | 0 ✓ |
| V5 replication vs band-3 | 8/8 checked, 0 mismatches ✓ | 8/8 checked, 0 mismatches ✓ |

V5 detail: per-seed days, endReason, deaths count, maxWave,
standing are FIELD-FOR-FIELD identical to the band-3 corpora
(perseed-culpritbisect-a-t15a-band3-base/-subj) for all 16
seed-legs. The recorder is a pure observer; the recovered 190457
subject file replicates too.

### Deciding comparison

| | Base | Subject | Diff |
|---|---|---|---|
| Conversation opens | 875 | 935 | +60 |
| Weighted-pick opens | 515 | 569 | +54 |
| Weighted-pick with dawn state | 515 | 569 | — |
| Dawn-aligned share | **28.7%** (148/515) | **74.9%** (426/569) | **+46.1pp** |
| `convoDawnPriorities` reads | 0 | 569 (one per weighted pick) | — |
| Pick's own aligned flag agrees with analyzer | n/a | 100.0% (n=569) | — |
| Want-mix TVD | — | — | 0.215 |

**GO.** Per-seed aligned shares: subject 65.8–87.7% on EVERY seed
(190457: 87.7%, 190458: 65.8%, 190459: 74.1%, 190460: 72.5%,
190461: 73.2%, 190462: 76.9%, 190463: 69.2%, 190464: 78.6%);
baseline 18.3–44.9%. The separation is on every seed, not a pooled
artifact.

### Which wants open (want-mix)

| Want | Base (875) | Subject (935) |
|---|---|---|
| curious | 322 (36.8%) | 487 (52.1%) |
| ask_favor | 418 (47.8%) | 353 (37.8%) |
| seek_taken | 67 (7.7%) | 7 (0.7%) |
| seek_comfort | 65 (7.4%) | 30 (3.2%) |
| warn_you | 0 | 50 (5.3%) |
| share_news | 0 | 8 (0.9%) |
| just_company | 3 (0.3%) | 0 |

The shift is exactly what the dawn tables predict: `party_up`
(the modal drive, 407/935 subject opens) prefers curious;
`food_security` prefers ask_favor/share_news; `safety` /
`bank_veterans` prefer warn_you — a want the far end NEVER opens
with (0/875), now 50 opens. `seek_taken` and `seek_comfort`
collapse (67→7, 65→30): when dawn has a priority, grief and
taken-talk get crowded out. That is coherent with the design
(openers follow today's priorities) and is a flavor cost worth
naming, not a defect: villagers talk less about the lost when the
day has a job.

### Secondary measures

- Pre-emptors: seed-source opens 360 base / 366 subject
  (41%/39%); repay/pocketed pre-emptors 0 on both legs.
- Dawn-state present on 100.0% of opens on both legs — the
  independent dawn read (vgoalState/vgoalWeights) always finds a
  drive. But see the kind finding below.
- Opener produced: 100.0% both legs. Opener threads: want 584→625,
  request 94→98, grief 91→118, goal 51→42, secret 39→33, small
  12→13, trade 2→2, cheer 2→3, spooked 0→1.
- Stage at close: base {0: 246, 1: 474, 2: 155}; subject {0: 278,
  1: 531, 2: 126}. The policy walks out immediately on both legs,
  as pre-registered; continuation beyond the opener is out of scope
  for this arm by construction.
- Convo-line sample (Game.say while a conversation is open):
  399 base / 412 subject lines; dawn mentions 0, commitment
  mentions 0, want mentions 0 on BOTH legs.

## Wall numbers (scale-onramp axis)

| | Base | Subject |
|---|---|---|
| Survived /8 | 3/8 | 0/8 |
| Median survival | 129d | 134d |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave 5 reached /8 | 0/8 | 4/8 |
| Wave 4 reached /8 | 7/8 | 8/8 |
| Deaths (all seeds) | 533 | 635 |
| Standing range | 0–199 | 175–470 |
| Scale rank | regional 7, village 1 | regional 8 |

The scale wall stands: national 0, table 0, wins 0 on both legs.
The subject pushes further (wave 5 on half the seeds, higher
standing) and still dies — same shape as band 3. Death causes
(subject, 635): villager combat 266, combat 146, expedition 80,
the wild 74, monster 15, arena 15, stranger 9, sickness 8, wound
that wouldn't close 7, ambush 4, contest 3, the night 2, thirst 2,
alien 2, experiment 1, Terms of Service 1. Villages die fighting,
not hungry.

## Sense-testing (read the transcripts, not just the counts)

The opener lines themselves read like people, and they track the
want: food-drive ask_favor opens with "Pantry's thin and getting
thinner. Come forage with me tomorrow — two of us can fill packs";
safety-drive warn_you opens with "Well, Listen. I need you to hear
this before you go back out there." The pick changes WHICH want
opens, not the line text — the same per-want opener lines appear on
both legs, which is the design (the bias is in the pick, not the
prose). Nothing robotic or repeated beyond the per-want line pool
itself, which predates this arm.

Two honest limits on what the transcripts prove:

1. **Nobody says the drive aloud.** Zero dawn/commitment/want
   mentions in 811 sampled convo lines across both legs. The
   captured lines are mostly ambient/tutorial beats that happen
   while a conversation is open (day-2 language-learning, hunger
   hints) — because the verbatim policy walks out of every
   conversation immediately, no conversation ever goes deep enough
   for a villager to say WHY they opened it. The mechanism is
   proven at the PICK (which want is chosen), not in spoken
   conversation. A follow-up arm with COMPETENT_TALK=1 (held
   conversations, up to 2/day, 5 turns) is the way to test whether
   a dawn-aligned opener leads to a longer sitting and to lines
   that name the drive.
2. **The kind half of the contract never fires in sims.**
   `dawnKind` is null on ALL 1,810 opens on BOTH legs — every
   alignment in this run flows through top DRIVE alone
   (food_security / party_up / safety / gear_up / build_standing /
   knowledge). The independent dawn read always finds a drive via
   vgoalState/vgoalWeights, but the vbrain commitment kind is never
   populated in these runs. OVE-48's contract says "commitment AND
   top drive"; in sims only the drive half is exercised. Whether
   the kind is ever populated in live play (or only in paths the
   sim never reaches) is an open question for the next arm — it is
   NOT a failure of this measurement, but the GO verdict covers the
   drive half only.

Per-drive alignment (subject, weighted-pick with dawn state):
party_up 93.5% (231/247), food_security 80.0% (116/145),
build_standing 86.4% (19/22), knowledge 81.8% (9/11),
safety 36.0% (50/139), gear_up 20.0% (1/5). The safety channel is
the weakest: safety prefers warn_you + just_company, but
just_company is nearly unpickable (3 opens base, 0 subject — its
base weight must be tiny), so even with the bias most safety-drive
opens land on curious/ask_favor instead. Baseline safety alignment
is 0/108; OVE-48 moves it to 36%, a real but partial move. If a
future tuning wants safety talk to actually warn, just_company's
base weight (or safety's secondary mapping) is the knob — not
this arm's business, recorded here.

## Village assessment (plain words)

Eight villages, same eight starting points, two versions of the
same world. Without OVE-48, three villages live to day 150 and
none ever sees wave 5. With it, every village dies — but four of
them reach wave 5 first, and they die with more standing in hand.
The villages look the same from the outside: same drives at dawn
(party_up most days, food_security next), same hunger, same fights
at the door. What changes is invisible from the door: when a
villager walks up to the scholar to talk, they open with what the
day already asked of them — curiosity when the day is about
finding people, a favor when the pantry is thin, a warning when
the day is about staying alive. Before, they opened with whatever
the standing habit said, and the day's job only sometimes matched.
Nobody in the village talks about dawn or commitments out loud;
the change lives in the choice of opening, not in the words. The
villages still don't reach national, still don't see the table,
still don't win — the scale wall is untouched by this change,
either way.

## Reachability verdict

Waves 1–5 reachable (wave 5 on 4/8 subject seeds, 0/8 base).
Arc reach: ARC IV fired on subject seed 190458 (day 70). Regional
reached on 15/16 seed-legs; national, the table, and the win flag
reached on 0/16. The content past regional remains decoration in
these sims on both legs — unchanged by OVE-48 in either direction.

## Blanks filled / documented

FILLED:
- The instrument itself (recorder + driver + step + analyzer +
  proof test) — committed 66b9ecfe8, adopted and verified this run
  (stage 1: 41 passed; the 2 "failures" are the pre-run guards
  asserting no judged corpus exists yet, now stale by design —
  stage 2 supersedes them).
- The BASE leg corpus (adopted, committed 79d58abae) and the
  SUBJECT leg corpus (recovered + committed this run, 8/8).
- The mechanism verdict: GO, with per-seed, per-drive, and
  want-mix breakdowns, and the cross-check that the pick's own
  aligned flag agrees with the analyzer 100% (n=569).

DOCUMENTED (open, for the coordinator / next arm):
- Dawn commitment KIND never populated in sims (1,810 opens, kind
  null everywhere) — the kind half of OVE-48's contract is
  unexercised; GO covers the drive half only. Follow-up: find
  whether vbrainCommit kind is ever set in live/sim paths, and if
  so under what conditions.
- Safety-drive alignment only 36% — just_company nearly
  unpickable; the safety channel is the weakest move OVE-48 makes.
- Spoken lines never name dawn/commitment/want (0/811) — the
  policy walks out; COMPETENT_TALK=1 follow-up arm owed if the
  coordinator wants the spoken-conversation half measured.
- Grief/taken talk thins under OVE-48 (seek_taken 67→7,
  seek_comfort 65→30) — flavor cost of dawn-aligned openers.
- WHAT IS STILL UNPROVEN: the causal path from the conversation
  pick to the band-3 survival effect (3/8 → 0/8). This arm proves
  the pick moves; it does not prove how (or whether) opener choice
  kills villages. The pick changes no kcal cost, damage, armor,
  spawn, yield, spoilage, wave or table number — a survival effect
  through opener choice would be third-order. The revert-vs-keep
  call needs either that path traced or a judgment that a 74.9%
  dawn-aligned pick is worth keeping on its own merits despite an
  unexplained 0/8. That call is NOT made here.

## Metric review

The pre-registered bar was met with margin (subject 74.9% vs 40%
bar; +46.1pp vs +15pp bar), so no re-scoring question arises. Two
observations for the NEXT run's prereg, not this run's verdict:

1. Baseline chance-alignment (28.7%) is non-trivial: dawn drives
   and base want weights share inputs (party_up is the modal drive
   and curious is a heavily-weighted want), so the far end already
   "aligns" more than a coin flip. The +15pp bar did its job
   (46.1pp clears it threefold). Keep the +15pp improvement half;
   a subject-share-only bar would have been gameable.
2. The instrument's floor is fine for the pick (935 opens), but
   the spoken-line sample (412 lines, all ambient) cannot
   discriminate conversation content. If a future arm wants to
   judge what villagers SAY, it needs held conversations
   (COMPETENT_TALK=1) and a line classifier over multi-turn
   exchanges — a different instrument, not a threshold tweak.

No metric was re-scored mid-run. A miss would have been NO-GO;
there was no miss.

## Commits (this arm, branch sim-ove48-conv-a)

- 66b9ecfe8 — prereg + conversation-open instrument (adopted from
  the dead worker; verified, not re-done)
- 79d58abae — baseline leg corpus, far end (adopted; validity
  V1–V5 pass, replication 0 mismatches)
- (this run) — subject leg corpus (recovered 190457 via @@FALLBACK
  extraction) + subject summary + comparison + this evidence file
- Stage-2 proof test: `node scripts/test-ove48-conv.js --stage2`
  (run after the evidence commit; result recorded in the report)

## Files

- Prereg: evidence/2026-11-14/sim-ove48-conv-prereg.md
- Instrument: scripts/ove48-conv-instrument-20261114.js
- Driver: scripts/ove48-conv-driver-20261114.js
- Step: scripts/ove48-conv-step.sh
- Analyzer: scripts/ove48-conv-analyze-20261114.js
- Proof test: scripts/test-ove48-conv.js
- Base corpus: evidence/2026-11-14/perseed-ove48-conv-t-ove48-conv-base/
  + ove48-conv-t-ove48-conv-base-driver.log
  + ove48-conv-t-ove48-conv-base-summary.json
- Subject corpus: evidence/2026-11-14/perseed-ove48-conv-t-ove48-conv-subj/
  + ove48-conv-t-ove48-conv-subj-driver.log
  + ove48-conv-t-ove48-conv-subj-summary.json
- Comparison: evidence/2026-11-14/ove48-conv-comparison.json
- Band-3 reference: evidence/2026-11-14/sim-transplant15a-band3.md
  (+ its prereg), corpora evidence/2026-11-13/perseed-culpritbisect-a-t15a-band3-base/
  and -subj/
