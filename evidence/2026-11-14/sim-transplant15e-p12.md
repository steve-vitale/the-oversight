# sim-transplant15e-p12 — 15E picks 1+2 on far end + family 14 + family 12 (Loop A, fleshout-20261114T1736Z)

Run: fleshout-20261114T1736Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p12-a, branch `sim-transplant15e-p12-a`,
worktree `~/workspace/worktrees/sim-transplant15e-p12-a`.
Prereg: evidence/2026-11-14/sim-transplant15e-p12-prereg.md (committed
e0a87972a, BEFORE any judged sim ran). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics) +
evidence/2026-11-14/sim-transplant15e-prereg.md (pick identities,
first parents, tooling-resolution rule, merge-tree pre-check
convention) + evidence/2026-11-14/sim-transplant15e-1412-prereg.md
(the 14+12 route, pick numbering 0–4) +
hidden_files/family15-grouping-prereg-2026-11-14.md §15E. STEP id:
t15e-p12 (fresh). Subject branch: `transplant-15e-1412-subject`, kept
in place at 312647db0 (verified by this arm, NOT rebuilt).

## Verdict — NOT-CARRIER 4/8

15E picks 1+2 (resume-offer Yes delivers the unfinished thread +
OVE-33 quote check), landed on the exonerated 14+12 base, do NOT
collapse the far end. The subject reproduces the far end
seed-for-seed: survived 4/8, per-seed days BYTE-IDENTICAL to the
far-end endpoint days (86/144/150/43/150/87/150/150). Thresholds
(binding, fresh per 2115 §3): ≤1/8 CARRIER, 2/8 AMBIGUOUS, ≥3/8
NOT-CARRIER. No re-run leg was needed (the step read 4/8
outright). Per-seed days, death counts, wave unlocks, standings,
pantries, and tribute readiness are all identical to the far end
too — not just the survival count.

## The unit, in plain words

When you come back to talk to a villager, the game sometimes opens
with a reminder of something you left unfinished — "want to pick
it up?" — and quotes the last thing they said about it. Pick 1
fixes the Yes answer: saying Yes to "Want to hear where it left
off?" now actually continues the old conversation instead of
brushing it off with a generic "I see." Pick 2 fixes one edge of
the quote check: a line that is mostly narration but wraps a real
spoken sentence in quotes ("They go still. 'So it's not just
me…'") still counts as something the villager really said, so the
guard doesn't throw away real speech. Both are dialogue-coherence
repairs inside the conversation contract — no numbers change, no
gate moves, no survival lever is touched.

## Before / after on identical seeds (band 190391–190398, 150d death-aware, competent verbatim)

| seed | far end 203a32775 | subject 312647db0 |
|------|-------------------|-------------------|
| 190391 | 86d, village-lost | 86d, village-lost |
| 190392 | 144d, village-lost | 144d, village-lost |
| 190393 | 150d, survived | 150d, survived |
| 190394 | 43d, village-lost | 43d, village-lost |
| 190395 | 150d, survived | 150d, survived |
| 190396 | 87d, village-lost | 87d, village-lost |
| 190397 | 150d, survived | 150d, survived |
| 190398 | 150d, survived | 150d, survived |

Survived: far end 4/8, subject 4/8, merge 1/8. The subject is the
far end with a different name — every seed ends on the same day,
for the same reason, at the same rank, with the same pantry.

| seed | days | end | rank | wave | standing | deaths | pantry |
|------|------|-----|------|------|----------|--------|--------|
| 190391 | 86 | village-lost | regional | 4 | 199 | 88 | 0 |
| 190392 | 144 | village-lost | regional | 4 | 199 | 77 | 0 |
| 190393 | 150 | survived | regional | 5 | 325 | 66 | 8,200 |
| 190394 | 43 | village-lost | village | 4 | 150 | 52 | 0 |
| 190395 | 150 | survived | regional | 4 | 199 | 96 | 0 |
| 190396 | 87 | village-lost | regional | 4 | 199 | 80 | 0 |
| 190397 | 150 | survived | regional | 5 | 275 | 74 | 5,798 |
| 190398 | 150 | survived | regional | 4 | 199 | 96 | 0 |

## Wall numbers (this step's judged corpus)

- Survived 4/8; regional 7/8, village 1/8; national 0, table 0, wins 0.
- Wave-5 2/8 (190393, 190397), wave-4 8/8; median survival 150d.
- Deaths 629: villager combat 267, combat 130, expedition 126, the wild 74,
  monster 13, ambush 3, contest 3, wound that wouldn't close 3, Spool 2,
  a stranger 2, the arena 2, the night 1, Big-Eyes 1, alien 1,
  starvation 1.
- Standing 150–325 (five seeds pin at 199); blooded 4/8; tribute-ready
  1/8 (190397 only — 2 veterans, the only seed that clears the bar).
- Instrument errors 0. Standing fix swapped in (f8fda4295a99) and native
  standing.js restored byte-identical afterwards (75762cb2…, sha-verified
  by the step script). Own policy a7ff5c51… (far-end competent) on every seed.
- Every per-seed row carries anchorCommit 312647db088a, standingFix true,
  standingSha f8fda4295a99, policySha a7ff5c516440.

## Reachability verdict

Nothing moves. The wave-5 door opens on the same 2 seeds as the far end
and stays shut on the same 6; national/table/wins remain 0 on the collapse
band, exactly as the far end reads them. The picks touch no reachability
surface — they only decide what a resume opener does with Yes, and
whether a quoted beat counts as real speech.

## Village assessment — what the villages looked like

Four villages live to day 150 and four die, in the far end's own pattern,
unchanged: 190394 dies young (day 43, still a village, never reaches
regional) while 190393 and 190397 reach wave 5 and 190397 alone banks
two living veterans and becomes tribute-ready. Deaths are combat-heavy
(267 villager-combat + 130 combat of 629) with expedition deaths (126)
the second pressure; starvation kills exactly one person all band —
food is not what kills these villages, fighting is. Pantries end at 0
kcal on six of eight seeds, but the villages that survive do so with
food in hand (190393: 8,200 kcal; 190397: 5,798 kcal). Nothing in this
run changes the collapse picture: the carrier family is still
unidentified after families 11 (NOT-CARRIER 5/8), 13 (NOT-CARRIER
4/8), 14 (NOT-CARRIER 4/8), the 12+14 pair (NOT-CARRIER 4/8), and now
15E picks 1+2 (NOT-CARRIER 4/8). What remains unmeasured of family
15E is pick 4 alone (OVE-57) — see §Coordinator decision owed.

## Sense-testing (SENSE-TESTING LAW) — do the villagers still act like people?

Yes, and nothing about how they talk changes. I read a sample of the
225 villager utterances across the eight seeds (sayCount 98,590
utterances counted in total). The villagers speak in character and in
situation: door-defense reports name the defenders ("Lulwa, Leo, Raj,
Meera and Ingrid met them at the door — 4 put down, 1 driven off");
the System's show-voice calls veteran kills on camera ("Anderson just
put down The Herald... on CAMERA. That's a veteran kill, folks.
REMEMBER the name."); the ambient vignettes follow the same generated
people doing the same jobs across days (the woman with the
burn-scarred forearm hauling water, +4 clean; the same woman telling
another about you by the fire — "The retelling is already better than
the event"). A man heads out for water at dawn: "Water first.
Everything else waits." No line reads robotic or repeated beyond the
System's own templated audience lines (by design — the System repeats
its catchphrases across seeds with different names attached).

## Mechanism — the picks never fire in this corpus

The picks are real code and they behave (unit-proven on the subject
tree: the resume opener carries `resumeOffer`/`resumeTid`, the
gq:yn handler follows through to the thread, the OVE-33 quote check
returns real speech for a quoted beat). But in 150 days × 8 villages,
no resume opener is ever offered: 'resume', 'pick it up', 'want to
hear', 'where it left off', 'glance at the fire', 'comfortable
quiet', 'tired smile', 'You say nothing', and "So it's not just
me…" each appear 0 times in all 8 per-seed files; 0 of 225 vetSays
lines match a resume-opener or stage-direction pattern. The unit is
inert on this band not because the code is broken, but because the
situation it repairs — a resume opener being offered and answered —
never arises under the competent policy on these seeds. That is
consistent with the seed-for-seed identical survival read: code
that never runs cannot move a single death. Same telemetry-gap
class as the family-14 arm: the vetSays corpus records system/event
narration, not resume-opener decisions — a dialogue-family arm
that wants to judge the picks' effect on spoken dialogue needs a
corpus that records resume openers themselves.

## Subject verification (this arm — verified, NOT rebuilt)

- `git log --oneline --reverse 203a32775..transplant-15e-1412-subject`:
  abd8d5754 (family 14) → 588f054d1 (family 12) → e0af0163a (pick 1)
  → 312647db0 (pick 2), each directly on the far end, 4 commits.
- Trees, verified live: abd8d5754 bc52919e…, 588f054d1 e78fac42…,
  e0af0163a 45f64b03…, 312647db0 e6fab899… — each exactly the
  predicted pick-resolved tree from sim-transplant15e-1412.md.
  The 588f054d1 tree is exactly the tree of the existing
  transplant-12-14-subject branch (c8655548f).
- Subject diff vs far end: 12 files, conversation.js 77/4,
  test-snippet-stage-direction.js 78/0, new test
  test-story-offer-yes-20261108.js +73, story-offer-yes-followthrough.md
  +29, both OVE-33 phone-frame receipts, 3 godpath test fixes,
  test-establishment +3, sw.js +1, .gz binary. No other src/js file
  differs (villager-objectives.js byte-identical to the far end).
- Merge-tree pre-check re-run read-only during prereg preparation:
  pick 0 rc=0 CLEAN (bc52919e…), pick 1 rc=0 CLEAN (e78fac42…),
  pick 1 (this arm) rc=0 CLEAN (45f64b03…), pick 2 (this arm) rc=1
  with conflicted files EXACTLY [balance-proof.json,
  phone-frame-proof.json] (tooling-only, resolved --ours by the
  prior arm; resolved tree e6fab899…). Both resolved tooling files
  are byte-identical to the far end on the subject (balance-proof
  blob d0c6a42f, phone-frame-proof blob b0691014).
- No cherry-pick was performed by this arm. Pick 4a1c77cf1 (OVE-57)
  is NOT in the subject and NOT judged here.

## Step result (t15e-p12)

Driver: scripts/culpritbisect-step.sh (from a /tmp copy with REPO
passed in) + scripts/culpritbisect-driver-20261113.js + analyzer.
Subject tip 312647db088a. Standing fix swapped in (f8fda4295a99,
ROSTER CHECK present, own-policy a7ff5c516440); native standing.js
restored byte-identical afterwards (75762cb2… — verified by the
step script before it exited 0); tooling scratch deleted; tracked
tree clean apart from the untracked step corpus. Corpus:
evidence/2026-11-13/perseed-culpritbisect-a-t15e-p12/ (8 per-seed
JSONs); summary
evidence/2026-11-13/culpritbisect-a-t15e-p12-summary.json; driver log
evidence/2026-11-13/culpritbisect-a-t15e-p12-driver.log.
Analyzer: GOOD (survived 4/8, rank REGIONAL_INTACT, median 150d,
errors 0). Step ran ~20 min under heavy box load (sibling drivers
concurrent: the p1-a transplant step and a cheaptend driver ran
alongside).

## Coordinator decision owed

Family 15E as a unit remains UNMEASURED-BY-CONFLICT: its pick 4
(OVE-57) cannot be placed on the far end + 14 + 12 tree because
its villager-objectives.js hunks depend on origin-line Phase 4
content the far end never had (sim-transplant15e-1412.md §Pick-4
mechanism). What this arm settles: picks 1+2 are exonerated as a
unit (NOT-CARRIER 4/8, seed-for-seed identical), and the base they
sit on (14+12) was already exonerated. The only unmeasured piece
of 15E is pick 4 alone. Candidate shapes (the arm decides none of
these): (e) a narrowed pick-4 conversation.js-only route (its
conversation.js hunk merges clean — untested, coordinator's call);
(f) record 15E as unmeasurable-by-conflict as a unit with picks
1+2 exonerated and pick 4 the sole unmeasured remainder; (g) a
Phase 4 villager-objectives.js transplant as a prerequisite arm
before re-attempting pick 4 whole. Note for the decision: the
pick-4 conflict is a genuine code dependency, not a tooling
adjacency — no resolution of balance-proof.json would help.

## Proof

- scripts/test-transplant15e-p12-a.js — stage 1: 218 passed, 0
  failed (committed with the prereg, e0a87972a); stage 2: 265
  passed, 0 failed total (218 stage-1 legs + 47 stage-2 legs:
  step verdict NOT-CARRIER, evidence record).
- scripts/test-culpritbisect-a.js — 116 passed, 0 failed (re-run
  after the step).

## Telemetry deviation check

Attempted per the loop body: `node scripts/telemetry-check.js
--baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-13/perseed-culpritbisect-a-t15e-p12/*.json'
--metrics national,table,wins,exiled` — REFUSED, recorder-corpus
class: "refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs.
Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." Recorded, not waived; baseline NOT
rolled.

## Metric review (§14)

No metric proved wrong. The primary (survived/8, unit thresholds
fresh per 2115 §3) judged cleanly: 4/8 is NOT-CARRIER with no
re-run needed (not a 2/8 ambiguous read). The per-seed-day identity
(all 8 days equal to the far end, and every death count, wave,
standing, and pantry identical too) is a stronger signal than the
count alone — the third consecutive transplant arm to read
seed-for-seed identical (family 14, the 12+14 pair, now picks
1+2), which is worth carrying as a secondary in future transplant
arms: when a family moves nothing, the days match exactly; a
family that moves survival should move at least one seed's days.
One instrument note for the NEXT run (same as the family-14 arm):
the vetSays corpus cannot show resume-opener accept/reject
decisions — a dialogue-family arm that needs that read must
instrument resume openers directly.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes. All
  writes (prereg, proof, step corpus, evidence) landed cleanly.
  The flap-watch log was not re-read by this arm (short run; the
  coordinator's heartbeat at 18:00:49Z is the last recorded one
  before this arm's work).
- REGISTRY LOCK CONTENTION: the heartbeat call queued ~10 min on
  REGISTRY.lock (the reaper holds the lock for its whole run; many
  sibling heartbeats were queued behind it at the same time). The
  queued heartbeat was killed before it wrote anything (it was
  blocked on flock, so no partial write was possible); the tree's
  heartbeat_at (18:00:49Z, coordinator's registration heartbeat)
  was verified fresh in the registry — well inside the 4h reaper
  staleness line — so no reaper risk existed and the step proceeded.
  The heartbeat was retried after the step and landed at
  19:01:40Z (the reaper lock had cleared by then).
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (e0a87972a) — `git status` showed the committed prereg + proof
  as staged-deleted and untracked although the commit was correct
  (worktree hashes matched the HEAD blobs exactly). Repaired with
  the documented pipe (`git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`); verified `git status
  --short` empty + `git diff HEAD` empty + `git diff --cached`
  empty + hash-object == HEAD blob per file afterwards. It struck
  AGAIN on the stage-2 commit (793c27a02) — all 11 committed
  files showed staged-deleted + untracked, the proof MM —
  repaired the same way (with `-r` for the corpus directory),
  same verification, all 12 hashes matching HEAD blobs. No work
  lost either time.
- No runtime restart struck this arm. No safe-commit refusal.
- Sibling arms ran concurrently in their own trees (sim-transplant15e-p1-a
  step t15e-p1, cheaptend-b driver) — not touched: no sibling tree,
  branch, or claim file was read for writing or modified.

## Blanks filled / documented

- FILLED: 15E picks 1+2 measured as a unit — NOT-CARRIER 4/8,
  seed-for-seed identical to the far end. The resume-offer repair
  and the OVE-33 quote check are exonerated as collapse carriers;
  both are dialogue-coherence code that never fires on this band.
- FILLED: the subject branch transplant-15e-1412-subject was
  independently re-verified (log order, all four trees, tooling
  blobs, full diff) by a second arm — the prior arm's live picks
  reproduce exactly.
- DOCUMENTED: the heartbeat flock queue (reaper lock held for its
  whole run) can stall a worker's heartbeat for 10+ minutes —
  killing a flock-queued heartbeat before it writes is safe, and
  the registry heartbeat_at should be checked directly before
  deciding the tree is at risk.
- DOCUMENTED: the vetSays corpus cannot show resume-opener
  decisions (metric-review note above) — same gap class as the
  family-14 arm.
- Next in the program (2115 §3 order): the carrier hunt continues;
  for family 15E specifically, only pick 4 (OVE-57) remains
  unmeasured — see §Coordinator decision owed.
