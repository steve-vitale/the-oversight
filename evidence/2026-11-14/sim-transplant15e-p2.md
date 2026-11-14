# sim-transplant15e-p2 — 15E pick 2 ALONE on far end + family 14 + family 12 (Loop A, fleshout-20261114T2015Z)

Run: fleshout-20261114T2015Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p2-a, branch `sim-transplant15e-p2-a`,
worktree `~/workspace/worktrees/sim-transplant15e-p2-a`.
Prereg: evidence/2026-11-14/sim-transplant15e-p2-prereg.md (committed
30be1a9f2, BEFORE the subject was cut or any judged sim ran).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics) + evidence/2026-11-14/sim-transplant15e-prereg.md (pick
identities, first parents, tooling-resolution rule, pick-2 mechanism)
+ evidence/2026-11-14/sim-transplant15e-1412-prereg.md (the 14+12
route) + evidence/2026-11-14/sim-transplant15e-p12-prereg.md (picks
1+2 on the 14+12 base — this arm isolates pick 2 WITHOUT pick 1) +
hidden_files/family15-grouping-prereg-2026-11-14.md §15E. STEP id:
t15e-p2 (fresh). Subject branch: `transplant-15e-p2-subject`, kept
in place at acdbc793f07b (verified by this arm, tree 35857b15… —
exactly the predicted tree).

## Verdict — NOT-CARRIER 4/8

15E pick 2 ALONE (OVE-33: the quote check inside
`convoSnippetIsStageDirection` — a quoted beat is real memory, not
stage direction), landed on the exonerated 14+12 base with NO pick
1, does NOT collapse the far end. The subject reproduces the far
end seed-for-seed: survived 4/8, per-seed days BYTE-IDENTICAL to
the far-end endpoint days (86/144/150/43/150/87/150/150).
Thresholds (binding, fresh per 2115 §3): ≤1/8 CARRIER, 2/8
AMBIGUOUS, ≥3/8 NOT-CARRIER. No re-run leg was needed (the step
read 4/8 outright). Per-seed days, death counts, wave unlocks,
standings, pantries, and tribute readiness are all identical to
the far end too — not just the survival count. This is the fourth
consecutive transplant arm to read seed-for-seed identical (family
14, the 12+14 pair, picks 1+2, now pick 2 alone) — and it closes
the last unmeasured piece of family 15E: pick 1 alone, picks 1+2,
pick 2 alone, and narrowed pick 3 are all NOT-CARRIER 4/8. No
interaction surprise: pick 1 does not mask pick 2, and pick 2
does not carry the collapse on its own.

## VERDICT: NOT-CARRIER

## The unit, in plain words

When you come back to talk to a villager, the game sometimes opens
with a reminder of something you left unfinished — "want to pick
it up?" — and quotes the last thing they said about it. Pick 2
fixes one edge of the quote check: a line that is mostly narration
but wraps a real spoken sentence in quotes ("They go still. 'So
it's not just me…'") still counts as something the villager really
said, so the guard doesn't throw away real speech. It is a
dialogue-coherence repair inside the conversation contract — no
numbers change, no gate moves, no survival lever is touched.

## Before / after on identical seeds (band 190391–190398, 150d death-aware, competent verbatim)

| seed | far end 203a32775 | subject acdbc793f |
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
- wave-5 2/8 (190393, 190397), wave-4 8/8; median survival 150d.
- Deaths 629: villager combat 267, combat 130, expedition 126, the wild 74,
  monster 13, ambush 3, contest 3, wound that wouldn't close 3, Spool 2,
  a stranger 2, the arena 2, the night 1, Big-Eyes 1, alien 1,
  starvation 1.
- Standing 150–325 (five seeds pin at 199); blooded 4/8; tribute-ready
  1/8 (190397 only — 2 veterans, the only seed that clears the bar).
- Instrument errors 0. Standing fix swapped in (f8fda4295a99) and native
  standing.js restored byte-identical afterwards (75762cb2…, sha-verified
  by the step script). Own policy a7ff5c51… (far-end competent) on every seed.
- Every per-seed row carries anchorCommit acdbc793f07b, standingFix true,
  standingSha f8fda4295a99, policySha a7ff5c516440.

## Reachability verdict

Nothing moves. The wave-5 door opens on the same 2 seeds as the far end
and stays shut on the same 6; national/table/wins remain 0 on the collapse
band, exactly as the far end reads them. The pick touches no reachability
surface — it only decides whether a quoted beat counts as real speech
when a resume opener quotes it.

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
unidentified after families 11 (NOT-CARRIER 5/8), 13 (NOT-CARRIER 4/8),
14 (NOT-CARRIER 4/8), the 12+14 pair (NOT-CARRIER 4/8), 15E pick 1
(NOT-CARRIER 4/8), 15E picks 1+2 (NOT-CARRIER 4/8), narrowed 15E pick 3
(NOT-CARRIER 4/8), and now 15E pick 2 alone (NOT-CARRIER 4/8). Family
15E is now FULLY measured — every pick, alone and in combination, is
exonerated.

## Sense-testing (SENSE-TESTING LAW) — do the villagers still act like people?

Yes, and nothing about how they talk changes. I read a sample of the
225 villager utterances across the eight seeds (sayCount 98,590
utterances counted in total). The villagers speak in character and in
situation: door-defense reports name the defenders ("Lulwa, Leo, Raj,
Meera and Ingrid met them at the door — 4 put down, 1 driven off");
the System's show-voice calls veteran kills on camera ("Amine just
put down The Herald... on CAMERA. That's a veteran kill, folks.
REMEMBER the name."); the producers name the Nielsen ("Ratings
embodied. It fights boring — and the crowd adores it for that.").
No line reads robotic or repeated beyond the System's own templated
audience lines (by design — the System repeats its catchphrases
across seeds with different names attached).

## Mechanism — the pick never fires in this corpus

The pick is real code and it behaves (unit-proven on the subject
tree: the OVE-33 quote check returns real speech for a quoted beat,
and the snippet test's OVE-33 assertions pass on the subject). But
in 150 days × 8 villages, no resume opener is ever offered: 0 resume-opener matches in the corpus — 'resume', 'pick it up',
'want to hear', 'where it left off', 'glance at the fire',
'comfortable quiet', 'tired smile', 'You say nothing', "So it's
not just me…", and 'They go still.' each appear 0 times in all 225
vetSays lines. The unit is inert on this band not because the code
is broken, but because the situation it repairs — a resume opener
being offered and answered — never arises under the competent
policy on these seeds. That is consistent with the seed-for-seed
identical survival read: code that never runs cannot move a single
death. Same telemetry-gap class as the family-14 and p12 arms: the
vetSays corpus records system/event narration, not resume-opener
decisions — a dialogue-family arm that wants to judge the pick's
effect on spoken dialogue needs a corpus that records resume
openers themselves.

## Subject verification (this arm — live pick)

- `git log --oneline --reverse c8655548f..transplant-15e-p2-subject`:
  acdbc793f (pick 2, OVE-33), the single commit on top of the
  14+12 base. Tree 35857b15ff5a61750b9dccf9ab1f21bb8c3d705f —
  EXACTLY the predicted subject tree from the prereg (prediction
  commit c7e82c97).
- Live pick reproduced the merge-tree prediction exactly: conflicts
  ONLY on scripts/balance-proof.json and scripts/phone-frame-proof.json
  (both tooling, each resolved `git checkout --ours`); conversation.js,
  the snippet test, sw.js, the godpath tests, the establishment test,
  and the evidence receipts all applied cleanly. Conflict markers in
  the merged tree were balance-proof.json lines 3/6/9 and
  phone-frame-proof.json lines 7/15/23 and 81/91/101 — exactly as
  predicted (same files and lines as the p12 arm's pick-2 prediction;
  the tree OID differs because its ours was the pick-1-resolved tree,
  not the bare 14+12 base).
- Subject diff vs the 14+12 base: exactly pick 2 MINUS the two
  tooling files (10 files: the .gz binary, both phone-frame receipts,
  3 godpath tests, test-establishment +3, test-snippet +4,
  conversation.js +4, sw.js +1). Every non-tooling file's blob equals
  the pick's resulting blob, except sw.js (same +1 villager-brain
  asset line; blob differs only by base sw.js drift elsewhere).
  Both resolved tooling files are byte-identical to the 14+12 base
  (balance-proof blob d0c6a42f, phone-frame-proof blob b0691014 —
  the same blobs as on the far end).

## Step result (t15e-p2)

Driver: scripts/culpritbisect-step.sh (from a /tmp copy with REPO
passed in) + scripts/culpritbisect-driver-20261113.js + analyzer.
Subject tip acdbc793f07b. Standing fix swapped in (f8fda4295a99,
ROSTER CHECK present, own-policy a7ff5c516440); native standing.js
restored byte-identical afterwards (75762cb2… — verified by the
step script before it exited, and again by this arm after the
flap recovery). Tooling scratch deleted; tracked tree clean apart
from the untracked step corpus. Corpus:
evidence/2026-11-13/perseed-culpritbisect-a-t15e-p2/ (8 per-seed
JSONs); summary
evidence/2026-11-13/culpritbisect-a-t15e-p2-summary.json; driver log
evidence/2026-11-13/culpritbisect-a-t15e-p2-driver.log.
Analyzer: GOOD (survived 4/8, rank REGIONAL_INTACT, median 150d,
errors 0). STEP t15e-p2: ran ~33 min (STEP-EXIT 1 on the flap-hit
first analyzer pass — see §Infrastructure; the corpus was
recovered from the driver's @@FALLBACK blocks and the analyzer
re-run rc=0).

## Coordinator decision owed

None from this arm. Family 15E is now fully measured — pick 1
alone, pick 2 alone, picks 1+2, and narrowed pick 3 are all
NOT-CARRIER 4/8, seed-for-seed identical to the far end. The
group is exonerated as a whole and in every measured part; the
only unmeasured piece (pick 3's villager-objectives.js half) stays
unmeasured by its Phase 4 dependency, recorded in the p3conv arm.
No new route decision is owed by this arm.

## Proof

- scripts/test-transplant15e-p2-a.js — stage 1: 121 passed, 0
  failed (committed with the prereg, 30be1a9f2); stage 2: 182
  passed, 0 failed total (121 stage-1 legs + 61 stage-2 legs:
  live pick tree equality, step verdict NOT-CARRIER, evidence
  record, flap recovery).
- scripts/test-culpritbisect-a.js — 116 passed, 0 failed (re-run
  after the step).

## Telemetry deviation check

Attempted per the loop body: `node scripts/telemetry-check.js
--baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-13/perseed-culpritbisect-a-t15e-p2/*.json'
--metrics national,table,wins,exiled` — REFUSED, recorder-corpus
class (rc=2): "refusing recorder-corpus input: all 8 --current rows
carry top-level anchorCommit, so they are sweep recorder rows, not
runs. Recorder corpora are compared with sweep-compare tables,
never against a run baseline here." Recorded, not waived; Baseline NOT
rolled.

## Metric review (§14)

No metric proved wrong. The primary (survived/8, unit thresholds
fresh per 2115 §3) judged cleanly: 4/8 is NOT-CARRIER with no
re-run needed (not a 2/8 ambiguous read). The per-seed-day identity
(all 8 days equal to the far end, and every death count, wave,
standing, and pantry identical too) is a stronger signal than the
count alone — the fourth consecutive transplant arm to read
seed-for-seed identical (family 14, the 12+14 pair, picks 1+2, now
pick 2 alone). One instrument note (same as the family-14 and p12
arms): the vetSays corpus cannot show resume-opener accept/reject
decisions — a dialogue-family arm that needs that read must
instrument resume openers directly. One process note: the driver's
@@FALLBACK path saved this step — without the fallback JSON in the
driver log, the four flap-lost per-seed files would have forced a
full re-run of the missing seeds; future arms should treat a
`@@FALLBACK` line in the driver log as a recoverable corpus, not a
lost seed (see §Infrastructure).

## Infrastructure

- HOST WRITE FLAP: struck this arm mid-step. Window ~21:10–21:39Z
  (~29 min, per the flap-watch log: A=FAIL@write errno=1 from
  21:10Z through 21:38:21Z, A=OK again at 21:39:24Z and 21:40:31Z).
  Four per-seed files (190395–190398) were created as 0-byte
  `.tmp-26251` files and never renamed; the analyzer reported
  "INCOMPLETE corpus — missing seeds: 190395, 190396, 190397,
  190398" and wrote no summary (STEP-EXIT 1); the step script's
  standing.js restore was also refused, leaving standing.js at 0
  bytes (sha e3b0c442…, the empty-file sha) with the script's
  "DO NOT COMMIT EVIDENCE" warning. The flap-watch probe lines
  confirm the window (21:29:08Z and 21:30:12Z both FAIL; the
  watcher's own strace also failed with EPERM during the window).
  RECOVERY (all after the flap cleared, probe PROBE_OK at
  21:40:56Z): (1) standing.js restored from git (`git show
  acdbc793f:src/js/standing.js`, sha 75762cb2… verified);
  (2) the four per-seed files recovered from the driver's
  @@FALLBACK blocks in the driver log (lines 5, 102500, 155445,
  252322 — each block parsed in-memory first, key set verified
  identical to the good files, then written to its per-seed path
  and round-trip verified: parse + field equality vs the result
  lines); (3) the 0-byte .tmp files deleted; (4) the analyzer
  re-run (STEP=t15e-p2, tooling scratch restored from master)
  rc=0, summary written, GOOD 4/8. The driver log keeps BOTH the
  flap-hit INCOMPLETE line and the recovered GOOD line on record.
  No sim was re-run; no judged data was invented — the recovered
  files are the driver's own output, byte-for-byte the JSON it
  tried to write. Exact recovery commands are recorded in this
  section so the next run can resume without guessing.
- REGISTRY LOCK CONTENTION: the first heartbeat queued ~8.5 min
  on REGISTRY.lock (started ~20:37Z, landed 20:45:22Z). A second
  heartbeat attempt during the flap failed outright (atomic
  registry write refused with EPERM) — harmless, no partial
  write; heartbeat_at stayed 20:45:22Z, well inside the 4h
  reaper staleness line. Heartbeat retried after the flap
  cleared and landed at 21:43:15Z.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (30be1a9f2) — `git status` showed both committed files as
  staged-deleted although the commit was correct (worktree hashes
  matched the HEAD blobs exactly). Repaired with the documented
  pipe (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); verified `git status --short` empty +
  `git diff HEAD` empty + `git diff --cached` empty + hash-object
  == HEAD blob per file afterwards. No work lost.
- STEP-DETACHED-CHECKOUT DOCS TRANSIENT (not a driver side-effect):
  during STEP t15e-p2 the worktree's HEAD was detached at the
  subject tip acdbc793f (20:56–21:42Z), so the worktree held the
  subject's far-end-era versions of docs files that differ
  between the subject and the arm branch. The driver never writes
  to docs/ (the step script touches only standing.js, the four
  tooling scratch files, and the evidence corpus). Checking the
  arm branch back out at step end restored all files
  byte-identical to HEAD (hash-verified per file; `git status
  --porcelain --untracked-files=no` clean). Same transient as the
  p1/p12 arms. No restore was needed beyond the checkout-back.
- One self-inflicted scratch incident (this arm, no data lost):
  after the analyzer re-run I deleted the four tooling scratch
  files with `rm -f`, not realizing they are TRACKED on the arm
  branch (the step script's `rm -f` is written for old trees
  where they don't exist). `git status` showed all four as
  worktree-deleted. Restored with `git checkout HEAD -- <files>`;
  verified all four hash-identical to HEAD. Recorded so the next
  arm deletes scratch only on a detached old-tree checkout, never
  on the arm branch.
- No runtime restart struck this arm. No safe-commit refusal.
- Sibling arms ran concurrently in their own trees
  (sim-transplant15e-p23-a, picks 2+3 on 14+12, registered
  20:30:47Z) — not touched: no sibling tree, branch, or claim
  file was read for writing or modified.

## Blanks filled / documented

- FILLED: 15E pick 2 alone measured — NOT-CARRIER 4/8,
  seed-for-seed identical to the far end. The OVE-33 quote check
  is exonerated as a collapse carrier; it is dialogue-coherence
  code that never fires on this band. Family 15E is now FULLY
  measured (pick 1 alone, pick 2 alone, picks 1+2, narrowed
  pick 3 — all NOT-CARRIER 4/8).
- FILLED: the pick-2-alone subject was built live and its tree
  (35857b15…) equals the merge-tree prediction exactly — the
  temp-index prediction method is validated for a fourth time.
- DOCUMENTED: the driver's @@FALLBACK blocks in the driver log
  are a complete recovery source for flap-lost per-seed files —
  all four recovered blocks parsed, key-matched the good files,
  and the analyzer accepted them (rc=0, GOOD 4/8). A flap-hit
  step need not re-run its missing seeds when its driver log
  carries the fallback JSON.
- DOCUMENTED: the flap window itself (~21:10–21:39Z, 29 min) with
  probe lines, plus the standing.js 0-byte truncation and the
  heartbeat EPERM — same signature as the prior windows, still
  host-side, still unestablished as a root cause.
- Next in the program (2115 §3 order): the carrier hunt continues
  past family 15E; for family 15E specifically, nothing remains
  unmeasured except pick 3's villager-objectives.js half (Phase 4
  dependency, recorded in the p3conv arm).
