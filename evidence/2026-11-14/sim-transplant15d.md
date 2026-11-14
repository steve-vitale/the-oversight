# sim-transplant15d — family 15D (believed needs / pantry) (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15d-a, branch `sim-transplant15d-a`,
worktree `~/workspace/worktrees/sim-transplant15d-a`.
Prereg: evidence/2026-11-14/sim-transplant15d-prereg.md (committed
BEFORE the subject was cut or any judged sim ran — the pre-check
ran during prereg preparation; see the prereg's ordering note).
Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md
(bisect prereg: roster-check standing-fix swap f8fda4295a99, step
mechanics) + hidden_files/family15-grouping-prereg-2026-11-14.md §15D.

## Outcome

- OUTCOME: UNMEASURED-BY-CONFLICT (STOP clause fired at pick 1)
- Verdict: NONE — no CARRIER / AMBIGUOUS / NOT-CARRIER verdict
  exists for family 15D. No judged sim ran. Survived/8: unmeasured.
  Per-seed days: unmeasured. Wave-5: unmeasured.
- Subject branch `transplant-15d-subject`: NEVER cut. No subject
  tip hash exists to record.
- STEP t15d-needs: never run. No per-seed corpus, no summary, no
  driver log.

## Prereg (binding, committed before the subject or any judged sim)

See evidence/2026-11-14/sim-transplant15d-prereg.md. Base: far end
203a32775 (GOOD 4/8) with the roster-check standing fix swapped in
for every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified). Seeds 190391–190398, 150d death-aware,
competent verbatim own-policy per step. Thresholds for the GROUP as
one unit: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
STEP id; ≥3/8 NOT-CARRIER. STOP clause: on ANY cherry-pick
conflict outside the three named tooling files, STOP, report the
exact conflict list, do NOT hand-resolve game code, do NOT decide a
narrowed re-run. Plus the COORDINATOR TOOLING-RESOLUTION RULE
(decided 2026-11-14 ~10:00Z after the 15A/15C STOPs): a conflict
confined ENTIRELY to scripts/green-list.txt,
scripts/balance-proof.json, scripts/phone-frame-proof.json resolves
per file with `git checkout --ours` and the pick continues; any
other conflicted file fires the STOP.

## Family identity (verified at run start, before any sim)

- Pick 1: 03436c1bcacbbf0c3d0b868503cf32da162d573b "Believed
  pantry/cistern for food-security and favors". First parent
  f843fab1cb6b81bf5574263db2f95e7439e67ef8 (family 6 merge, PR #33
  dawn-midday-repick-3e68). Diff: 6 files, +478/-21:
  docs/ONTOLOGY.md 2/1, scripts/green-list.txt 1/0,
  scripts/test-believed-pantry-perception.js 283/0 (new test),
  src/js/convo-wants.js 25/6, src/js/villager-goals.js 12/2,
  src/js/villager-objectives.js 155/12. js=3.
- Pick 2: 206fe4931e2e46c86fe22dc2071046ed0ba683ca "OVE-60: duty
  candidates from believed needs join dawn scorer". First parent
  74a16306c2879e58d4c6e0037657d63876e92088 (OVE-61). Diff: 11 files,
  +5737/-18: docs/ONTOLOGY.md 6/5,
  evidence/2026-11-08/duty-dawn-candidates.md 55/0,
  evidence/2026-11-08/neutral-ove60-duty-dawn-panel.json.gz
  (binary), evidence/2026-11-08/phone-duty-frame-736-r1.json
  2684/0, evidence/2026-11-08/phone-duty-frame-844-r1.json 2649/0,
  scripts/balance-proof.json 2/2, scripts/green-list.txt 1/0,
  scripts/phone-frame-proof.json 5/5,
  scripts/test-duty-dawn-candidates.js 207/0,
  src/js/villager-brain.js 127/6, sw.js 1/0 (one cache-busted
  ASSETS entry — not game logic, but NOT in the tooling-resolution
  allowlist either; recorded so a future pick-2 attempt knows it).
  js=1. The +5737 lines are mostly evidence JSON; the js footprint
  (1 file) is what the carrier question turns on.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3: 03436c1bc (older) → 206fe4931;
  03436c1bc is an ancestor of 206fe4931.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## Merge-tree pre-check + live confirmation (the STOP)

- PICK 1 merge-tree prediction (base = pick's first parent
  f843fab1c, ours = far end 203a32775, theirs = 03436c1bc):
  rc=1, tree f3838750621be4dd12e3e40f2f139ecc79dc76f8, conflicted
  files EXACTLY THREE: docs/ONTOLOGY.md, scripts/green-list.txt,
  src/js/villager-objectives.js. NOT CLEAN.
- Live confirmation on throwaway scaffold branch tmp-15d-predict
  (cut at the far end, deleted afterwards — NOT the subject):
  `git cherry-pick 03436c1bc` rc=1. Output: "Auto-merging
  docs/ONTOLOGY.md", "CONFLICT (content): Merge conflict in
  docs/ONTOLOGY.md", "Auto-merging scripts/green-list.txt",
  "CONFLICT (content): Merge conflict in scripts/green-list.txt",
  "Auto-merging src/js/convo-wants.js", "Auto-merging
  src/js/villager-goals.js", "Auto-merging
  src/js/villager-objectives.js", "CONFLICT (content): Merge
  conflict in src/js/villager-objectives.js", "error: could not
  apply 03436c1bc... Believed pantry/cistern for food-security and
  favors"). Status at conflict: UU docs/ONTOLOGY.md, UU scripts/green-list.txt, A scripts/test-believed-pantry-perception.js, M src/js/convo-wants.js, M src/js/villager-goals.js, UU src/js/villager-objectives.js. Conflict markers:
  docs/ONTOLOGY.md lines 2021–2025 (Provides line) and 2031–2035
  (rules block); scripts/green-list.txt lines 916–925 (one hunk,
  tail collision); src/js/villager-objectives.js lines 9–14
  (header provides), 25–29 (header rules), 843–989 (departure
  danger check + objResourceLiveSnap insertion).
- TOOLING-RESOLUTION EVALUATION: the conflict set is NOT
  tooling-only. scripts/green-list.txt alone would have been
  resolvable with `git checkout --ours` under the coordinator
  rule, but docs/ONTOLOGY.md (docs) and
  src/js/villager-objectives.js (game code) are NOT in the
  tooling set — so the rule's STOP branch fires. NO file was
  resolved, nothing was hand-edited.
- PICKS 2: prediction NOT run and no conflict status is claimed
  either way — the transplant sequence stops at pick 1; there is
  no pick-1-applied tree to build pick 2's prediction on, and a
  pick-2-onto-bare-far-end prediction would not be the transplant
  sequence. The live pick 2 was never attempted.
- Recovery: cherry-pick aborted, scaffold branch deleted, HEAD
  back on sim-transplant15d-a at ef7430f2f, tracked tree clean, no
  CHERRY_PICK_HEAD, no subject branch. Nothing was hand-resolved.

## Conflict anatomy (verified by grep, not assumed)

- green-list.txt tail collision (same class as 15C): theirs (the
  pick) inserts one line, `scripts/test-believed-pantry-
  perception.js quick`, between `scripts/test-raid-danger-heard.js
  quick` and `scripts/test-win-rallyguard.js quick` — but the
  pick's parent ALSO carries four context lines the far end lacks
  at that tail (`scripts/test-person-trust-20261108.js quick`,
  `scripts/test-raid-danger-heard.js quick`,
  `scripts/test-win-rallyguard.js quick`,
  `scripts/test-retarget-gossip.js quick`: 1 hit each at
  f843fab1c, 0 hits each at 203a32775), while the far end appended
  `scripts/test-pellet-boost-20261108.js quick` +
  `scripts/test-pellet-q4-20261108.js quick` in the same tail
  region instead. Both sides rewrite the tail, so the three-way
  merge cannot place the pick's appended line. The pick's own
  green-list diff is +1 line; the other four lines are context
  the far end lacks, not lines the pick adds.
- villager-objectives.js is a genuine game-code divergence, not
  a tooling adjacency: the pick rewrites the departure danger
  check (gossip THIS villager heard + `objResourceLiveSnap()`
  insertion, lines 843–989) and adds the belief API
  (`objResourceBelief` 0 hits at the far end, 6 at the pick;
  `objResourceSee` 0 at the far end, 6 at the pick;
  `objResourceLiveSnap` 0 at the far end, 3 at the pick), while
  the far end's copy of the file evolved on its own line (its
  ONTOLOGY Provides line already lists `objRallyFreshRaid(vid)`
  against the pick's `objRallyFreshRaid()`). Both sides changed
  the same regions differently; no `--ours` resolution could
  preserve the pick's game code.
- docs/ONTOLOGY.md: both sides rewrote the villager-objectives
  Provides line and the rules block. The pick adds
  `objResourceBelief(vid)` / `objResourceSee(vid)` to Provides
  and the `resource_belief_filtered` rule; `danger_heard_filtered`
  already existed at the pick's parent (1 hit at f843fab1c, 0 at
  the far end) and the pick keeps it while adding the new rule
  beside it, so the far end's deletion of that line and the
  pick's addition next to it collide in one hunk.

## What this means (plain words)

Family 15D is the believed-needs / pantry group: it stops
villagers from judging food and water by the village's REAL
pantry and cistern — numbers they cannot see when they are away
from Haven — and makes each villager judge by what THEY believe
is stored instead. When what they believe is low, that becomes a
dawn duty (go forage, haul water, cook) for someone unassigned.
It changes no food cost, no yield, no spoilage, no damage, no
armor, no spawn, no wave or table number — but unlike a pure
dialogue-quote fix it changes WHEN villagers go looking for food
and water and whether an away villager keeps working or turns
home, so it was a livelier suspect than a quote guard. Whether
it carries any of the collapse is UNKNOWN: the very first pick
could not be placed on the far end, because the far end's copy of
the objectives file and the ontology doc moved on a different
line from the origin line — both sides rewrote the same departure
check and the same documentation, differently. The conflict is
not confined to the test-list file: real game code conflicted.
The binding rule (plus the coordinator's tooling-resolution rule)
says stop and let the coordinator decide the narrowed route. The
group stays unmeasured and stays on the suspect list until the
coordinator picks that route.

## Mechanism (what the unmeasured family would have tested)

In plain words: before this family, a villager away from Haven
judged food and water by the village's REAL pantry and cistern,
as if they could see through walls — so an away villager could
panic about an empty pantry they never saw, or stay calm about a
full one they never saw. After it, each villager judges by what
they themselves believe is stored (`objResourceBelief`), and only
what they believe is low becomes a dawn duty for someone
unassigned (OVE-60). Food-security, FORAGE/WATER urgency, and
village-resource favors all read the believed pantry/cistern;
unknown belief skips the favor rather than guessing. This is the
most plausible carrier mechanism in family 15 on second reading
after the fight brains — duty/errand allocation is the food
economy's front door, and the far-end band dies fighting while
living hand-to-mouth (the 12-14 arm's survivors held 0 kcal
pantries at day 150) — but plausibility is not a verdict: the
family is UNMEASURED, and the collapse could still live
elsewhere. If the coordinator authorizes a narrowed route, the
natural split is pick 1's cleanly-merging files first
(convo-wants.js, villager-goals.js, and the new test file all
auto-merged; only villager-objectives.js and ONTOLOGY.md
conflicted) with the objectives.js/ONTOLOGY.md hunks decided
separately — but that is the coordinator's call, not this arm's.
Note for the decision: a future pick-2 attempt also carries a
sw.js +1 line that is NOT in the tooling-resolution allowlist, so
if sw.js conflicts there, that is a STOP too unless the
coordinator extends the rule.

## Sense-testing (SENSE-TESTING LAW)

No sim ran, so no transcripts exist to read for this arm. Nothing
to judge; nothing judged. The mechanism note above is read from
the commits' own messages and diffs, not from villager behavior.

## Reachability

Unmeasured. No wave, rank, standing, or table read exists for this
family. Wall numbers carried in (collapse band): far end 4/8,
wave-5 2/8; merge 1/8, wave-5 0/8; national 0, table 0, wins 0.

## Coordinator decision owed

The narrowed route for family 15D. Candidate shapes (the arm
decides none of these): (a) apply pick 1's cleanly-merging files
(convo-wants.js, villager-goals.js, test file) and resolve the
objectives.js/ONTOLOGY.md hunks by a coordinator-named method;
(b) split the group (pick 1's belief API alone, or pick 2 on a
resolved base); (c) record the group unmeasurable-by-conflict
and move on. Note for the decision: the conflicting game-code
hunk is the departure danger check rewrite (lines 843–989) plus
the belief-API header — the heart of the family, not an
adjacency — so any narrowed route that drops it is measuring a
different family. The same green-list tail collision may recur
in later 15-group arms whose picks touch green-list.txt (15B,
15E, 15F all add green-list lines), but for 15D the green-list
line is the least of it.

## Metric review

- No metric proved wrong — no metric was exercised. The primary
  (survived/8, group thresholds fresh per 2115 §3) never got a
  reading because the STOP clause fired first. That is the clause
  working as designed, not a metric failure.
- The merge-tree pre-check earned its keep again: it predicted
  the exact three conflicted files before any branch was cut,
  and the live scaffold pick reproduced it exactly (same three
  files, same markers). The first-parent base convention (not the
  brief's merge-base) is the right predictor — the 12-14 arm's
  lesson holds.
- The tooling-resolution rule earned its keep in the other
  direction: it gave the arm a crisp, checkable test (is the
  conflict set a subset of the three tooling files?) instead of a
  judgment call — and the answer here was unambiguously NO, so
  the STOP fired without hesitation. The rule is now proven to
  discriminate: 15A/15C would have resolved (tooling-only) while
  15D stops (game code + docs). A process note for future arms:
  the green-list adjacency conflict is predictable from the
  first-parent counts alone (pick-parent lists lines the far end
  lacks at the insertion point) — a pre-pick grep of the insertion
  context flags it before the merge-tree run. Worth adding to the
  transplant template as a cheap early signal, not as a substitute
  for the merge-tree check.
- One correction recorded mid-run (not hidden): the prereg's
  first draft said the pick "adds the danger_heard_filtered /
  resource_belief_filtered rules" — the diff shows the pick adds
  ONLY resource_belief_filtered; danger_heard_filtered already
  existed at the pick's parent (1 hit) and is absent at the far
  end (0 hits). The prereg was corrected before commit; the
  conflict is the far end's deletion of that line colliding with
  the pick's addition beside it.

## Infrastructure — flap / slowness (recorded, not hidden)

- HOST WRITE FLAP: no write was refused outright in this arm,
  but the host was slow throughout: the first heartbeat
  (worktree-heartbeat.sh sim-transplant15d-a, started ~10:21Z)
  took 221s to land, succeeding at 2026-11-14T10:24:59Z, and
  git operations ran ~60–100s per call for the whole run
  (the scaffold cleanup exec took ~98s wall for a handful of
  read-only git commands). No work was lost; no write was
  bypassed; the prereg, proof, and this evidence file all wrote
  on first attempt. Heartbeat is fresh (10:24:59Z), so no reaper
  risk; the tree will be heartbeated again before the run closes.
- No runtime restart struck this arm. No safe-commit clobber
  (no commits before the final ones). No reaper risk: heartbeat
  landed 10:24:59Z.
- Telemetry deviation check: N/A — no corpus exists (no step
  ran), so there is nothing to refuse and nothing to roll.
  Baseline NOT rolled.

## Proof

- scripts/test-transplant15d.js — 9 sections: family identity
  (2 picks, first-parent order, pick-2 evidence payload, substrate
  shas), merge-tree prediction (rc=1, tree f3838750…, exactly the
  three conflicted files), tooling-resolution rule unit legs
  (tooling-only → RESOLVE-OURS; docs/game-code/sw.js/test →
  STOP), conflict mechanism (green-list context counts,
  believed-pantry markers, ONTOLOGY rule lines), family content
  (belief API + duty candidates; no lever numbers in added lines),
  verdict mapping, prereg record, base state, STOP outcome.
  Stage 1 (pre-commit run): 140 passed, 1 failed — the single
  expected failure is the prereg-ancestry leg, which can only pass
  once the prereg commit exists. Stage 2 (post-commit re-run):
  141 passed, 0 failed.
- scripts/test-culpritbisect-a.js — NOT re-run: it judges bisect
  steps, and no step ran in this arm (116/116 stands from the
  12-14 arm's post-step re-run on the same master tooling).
