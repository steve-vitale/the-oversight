# sim-transplant14 — H1 transplant family 14, snippet stage-direction guard (arm sim-transplant14-a)

Run: fleshout-20261114T0740Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: sim-transplant14-a. Worktree: ~/workspace/worktrees/sim-transplant14-a.
Prereg: evidence/2026-11-14/sim-transplant14-prereg.md (committed BEFORE the
subject was cut or any judged sim ran — commit 9a823f068).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1
transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap, step mechanics).
STEP id: t14-7688cb7a4. Subject branch: transplant-14-subject, kept in place.

## Verdict — NOT-CARRIER 4/8

Family 14 (PR #10, snippet stage-direction guard) alone does NOT collapse
the far end. The subject reproduces the far end seed-for-seed: survived
4/8, per-seed days BYTE-IDENTICAL to the far-end endpoint days
(86/144/150/43/150/87/150/150). Thresholds (binding, fresh per 2115 §3):
≤1/8 CARRIER, 2/8 AMBIGUOUS, ≥3/8 NOT-CARRIER. No re-run leg was needed
(the step read 4/8 outright).

## The family, in plain words

When you come back to talk to a villager, the game sometimes opens with a
reminder of something you left unfinished — "want to pick it up? '…'" — and
quotes the last thing they said about it. The bug this family fixes: some of
those "quotes" were never spoken words at all. They were stage directions —
mood narration from the silence pools, lines like "They glance at the fire…"
or "A comfortable quiet settles between you." The game was putting narration
in quotation marks and presenting it as something the villager had said.
The fix adds one small guard (`convoSnippetIsStageDirection`) that refuses
those narration lines as resume quotes. No numbers change, no gate moves,
no survival lever is touched — it is pure dialogue coherence.

## Before / after on identical seeds (band 190391–190398, 150d death-aware, competent verbatim)

| seed | far end 203a32775 | subject 9f713657b |
|------|-------------------|-------------------|
| 190391 | 86d, village-lost | 86d, village-lost |
| 190392 | 144d, village-lost | 144d, village-lost |
| 190393 | 150d, survived | 150d, survived |
| 190394 | 43d, village-lost | 43d, village-lost |
| 190395 | 150d, survived | 150d, survived |
| 190396 | 87d, village-lost | 87d, village-lost |
| 190397 | 150d, survived | 150d, survived |
| 190398 | 150d, survived | 150d, survived |

Survived: far end 4/8, subject 4/8, merge 1/8. The subject is the far end
with a different name — every seed ends on the same day, for the same
reason, at the same rank.

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

## Reachability verdict

Nothing moves. The wave-5 door opens on the same 2 seeds as the far end
and stays shut on the same 6; national/table/wins remain 0 on the collapse
band, exactly as the far end reads them. The guard touches no reachability
surface — it cannot open or close a door, because it only decides whether
a remembered quote is spoken words or narration.

## Village assessment — what the villages looked like

Four villages live to day 150 and four die. The pattern is the far end's
own pattern, unchanged: 190394 dies young (day 43, still a village, never
reaches regional) while 190393 and 190397 reach wave 5 and 190397 alone
banks two living veterans and becomes tribute-ready. Deaths are combat-heavy
(267 villager-combat + 130 combat of 629) with expedition deaths (126) the
second pressure; starvation kills exactly one person all band — food is not
what kills these villages, fighting is. Pantries end at 0 kcal on six of
eight seeds, but the villages that survive do so with food in hand
(190393: 8,200 kcal; 190397: 5,798 kcal). Nothing in this run changes the
collapse picture: the carrier family is still unidentified after families
11 (NOT-CARRIER 5/8), 13 (NOT-CARRIER 4/8), and now 14 (NOT-CARRIER 4/8);
family 12 remains UNMEASURED (conflict-STOP).

## Sense-testing (SENSE-TESTING LAW) — do the villagers still act like people?

Yes, and nothing about how they talk changes. I read a random sample of the
225 villager utterances across the eight seeds. The villagers speak in
character and in situation: Seo-ah flags a fruiting ground-elder patch
("Somebody should get out there"); a scarred woman leans in low to teach
the crow trick in her own words; a stranger at low trust looks at you
flatly — "Why should I listen to you?"; gossip by the fire retells a story
and admits the retelling is already better than the event. The System's
show-voice still calls veteran kills on camera, and the village still
knows when it is Blooded. No line reads robotic or repeated; the dialogue
that exists is coherent, and the guard changes none of it — because the
guard never fires here (see mechanism).

## Mechanism — the guard never fires in this corpus

The guard is real code and it behaves: extracted from the subject and run
directly, `convoSnippetIsStageDirection` returns true for "They glance at
the fire…", "A comfortable quiet settles…", "A tired smile", and "Still on
what they confided…", and false for real speech, empty, and null (proof
scripts/test-transplant14.js §4). But in 150 days × 8 villages, no
stage-direction line is ever offered as a resume quote: 'glance at the
fire', 'comfortable quiet', 'tired smile', 'resume', 'convoSnippet', and
'pick it up' each appear 0 times in all 8 per-seed files; 0 of 225 vetSays
lines match a stage-direction or resume-opener pattern; no resume opener
fires at all in the sampled dialogue. The family is inert on this band not
because the guard is broken, but because the situation it guards against —
a stage-direction snippet reaching the resume-quote gate — never arises
under the competent policy on these seeds. That is consistent with the
seed-for-seed identical survival read: a guard that never fires cannot move
a single death.

## Merge-tree pre-check — the two tooling conflicts, and why the pick was clean

The prescribed pre-check (`git merge-tree d229b58f5 203a32775 7688cb7a4`, a
full-tree merge with the merge base as base) predicts conflicts in NINE
files — but only TWO carry real conflict markers, and both are
zero-src-reader tooling files: scripts/balance-proof.json (panel pointer,
r167 vs person-trust) and scripts/green-list.txt (test-list tail). Both
sides moved those files since the merge base; the family never touches
them. The other seven "changed in both" files (docs/ONTOLOGY.md,
src/js/conversation.js, src/js/convo-wants.js, src/js/game.js,
src/js/villager-agency.js, src/js/villager-objectives.js, sw.js) merge
without markers. The operative check — the cherry-pick-base merge-tree
(`git merge-tree 16cdd6900 203a32775 7688cb7a4`, the operation the live
pick actually runs) — exits 0, clean: the test file is added, the guard
hunk applies cleanly to conversation.js, zero markers. The live
cherry-pick reproduced it exactly: clean, no conflicts, subject
9f713657bb16438ccd9303ee7d15ed62c90ce447, 2 files +33, added lines
identical to the family diff. The conflict rule never triggered.

## Proof

- scripts/test-transplant14.js — family identity, both merge-tree
  pre-checks, subject state, guard behavior (extracted function),
  step verdict, mechanism (guard never fires), verdict mapping, base
  state, seed-band identity, evidence record, corpus existence.
- scripts/test-culpritbisect-a.js — re-run (116 legs).
- Corpus: evidence/2026-11-13/perseed-culpritbisect-a-t14-7688cb7a4/
  (8 per-seed JSONs), evidence/2026-11-13/culpritbisect-a-t14-7688cb7a4-summary.json,
  evidence/2026-11-13/culpritbisect-a-t14-7688cb7a4-driver.log.
- Subject branch transplant-14-subject LEFT in place at 9f713657b (never
  committed to the arm branch). Nothing lands on master from the subject.

## Telemetry deviation check

Attempted per the loop body: `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-13/perseed-culpritbisect-a-t14-7688cb7a4/*.json'
--metrics national,table,wins,exiled` — REFUSED, recorder-corpus class:
"refusing recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora
are compared with sweep-compare tables, never against a run baseline here."
Recorded, not waived; baseline NOT rolled.

## Metric review (§14)

No metric proved wrong. The primary (survived/8) decided cleanly at 4/8
with no re-run leg; the per-seed-day identity against the far-end endpoint
is the strongest possible NOT-CARRIER read — stronger than the 3/8
threshold alone, since it rules out even a quiet reshuffle of which seeds
live. One instrument note for the NEXT run: the vetSays corpus carries
mostly system/event narration, not villager-to-villager dialogue — the
sense-testing read is honest but thin on actual conversation. A future
dialogue-family transplant that wants to judge the guard's effect on
spoken dialogue needs a corpus that records resume openers themselves,
not just vetSays; this corpus cannot show a resume quote being accepted
or rejected, only that none was offered.

## Infrastructure

- Safe-commit index clobber struck the prereg commit (9a823f068): after
  the commit, the file showed staged-as-deleted + untracked. Repaired
  with the documented pipe (`git ls-tree -r HEAD -- <path> | git
  update-index --add --index-info`); verified status empty, diff HEAD
  empty, hash-object == HEAD blob. The commit itself was always correct.
- EPERM flap: struck ~08:10Z during the culpritbisect re-run
  (test-culpritbisect-a.js crashed at a /tmp scratch write, HARNESS
  ERROR EPERM) and blocked ALL writes for ~35 min (50+ probes, rounds
  1–5, all EPERM; flap-watch log shows A/B/G/H FAIL through 08:26Z).
  The step corpus, proof (109/109 green), and evidence were already
  on disk before the flap and verified intact by sha256 throughout
  (no file truncated, no work lost). Writes cleared ~08:32Z (round 6,
  attempt 1); the culpritbisect re-run and the final commit were run
  immediately after clearing, once the probe succeeded.
- Step script ran from a /tmp copy with REPO passed in, as briefed; the
  detached checkout never unlinked it. After the step, HEAD was checked
  back out to sim-transplant14-a; standing.js verified restored
  byte-identical (75762cb2…).
- Loop B live on the winnability chain (sim-rageprecheck-b) — not touched:
  no B tree, branch, or claim file was read for writing or modified.
- Master tip at spawn: e3a5a9053 (Loop B's rageprecheck landing). Base is
  the far end, so this does not affect the measurement.

## Blanks filled / documented

- FILLED: family 14 measured — NOT-CARRIER 4/8, seed-for-seed identical
  to the far end. The stage-direction guard is exonerated as a collapse
  carrier; it is dialogue-coherence code that never fires on this band.
- DOCUMENTED: the prescribed-base merge-tree conflicts in
  balance-proof.json / green-list.txt are a full-tree-merge artifact,
  not a cherry-pick conflict — recorded here so the next arm does not
  re-learn that the prescribed check and the live pick are different
  operations.
- DOCUMENTED: the vetSays corpus cannot show resume-quote accept/reject
  decisions (metric-review note above) — a dialogue-family arm that
  needs that read must instrument resume openers directly.
- Next in the program (2115 §3 order): families 15 (standalone
  first-parent OVE commits, grouped by topic) and 16 (js=0 merges),
  then the carrier hunt continues.
