# sim-transplant15d-prereg — family 15D (believed needs / pantry) (Loop A, fleshout-20261114T0936Z)

Run: fleshout-20261114T0936Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15d-a, branch `sim-transplant15d-a`,
worktree `~/workspace/worktrees/sim-transplant15d-a`.

## Authority

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program definition + thresholds), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
hidden_files/family15-grouping-prereg-2026-11-14.md §15D (family 15D
= believed pantry/cistern + OVE-60 duty candidates, pick order oldest
first), plus the 15A/15C STOP evidence now on master
(evidence/2026-11-14/sim-transplant15a.md, sim-transplant15c.md).

COORDINATOR TOOLING-RESOLUTION RULE (binding for this run's
family-15 arms, decided 2026-11-14 ~10:00Z after the 15A/15C STOPs —
cited here as the task brief orders): pick in origin order. If a pick
conflicts ONLY on zero-src-reader tooling files
(scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json), resolve EACH such file with
`git checkout --ours` (keep the far-end version byte-identical) and
continue the cherry-pick — do NOT hand-edit. If ANY other file
conflicts (any src/js, data, policy, docs, or test file), STOP
immediately, report the exact conflict list, do NOT hand-resolve,
do NOT decide a narrowed re-run. The proof MUST assert: (1) the
subject's game-code diff equals the picks' diff exactly, and (2)
each resolved tooling file is byte-identical to the far end.
Record every resolution (file, pick, method) in prereg + evidence.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 15D diff, built on scratch branch
  `transplant-15d-subject` (far end + `git cherry-pick 03436c1bc`
  FIRST, then `git cherry-pick 206fe4931` on top of it). NEVER
  committed to the arm branch. Branch LEFT in place, hash recorded
  in evidence, so the verdict is reproducible.
- Family 15D: two standalone first-parent commits, origin order
  (oldest first): 03436c1bc → 206fe4931. See §Family identity.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 15D PAIR as
  one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
  STEP id (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER
  for ordering but kept on the suspect list); ≥3/8 NOT-CARRIER.
  If the pair reads CARRIER, the next arm splits the two commits
  (same rule as 2115 §3 (c) for families 4 and 13).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: on ANY cherry-pick conflict, STOP, report the exact
  conflict list (which paths, UU/DU, which hunks, marker line
  numbers), do NOT hand-resolve game code, do NOT decide a narrowed
  re-run (narrowed families are a coordinator decision only) —
  EXCEPT the tooling-resolution rule above: a conflict confined
  ENTIRELY to the three named zero-src-reader tooling files is
  resolved per pick with `git checkout --ours` and the pick
  continues; any other conflicted file fires the STOP. The live
  picks are ground truth: if either live pick conflicts outside
  the tooling set, the STOP fires regardless of any prediction.
- STEP id: t15d-needs (fresh).
- Proof-on-master note (from the 0215Z run): branch-identity legs
  are worktree-only in this arm's proof — the proof's `worktreeOnly`
  helper passes them vacuously when HEAD is 'master', so the proof
  stays green on master. Prereg-commit ancestry legs resolve by
  message/subject, not by hash (0608Z lesson: an adoption rebase
  rewrites hashes).
- Ordering note: the merge-tree pre-check and the live scaffold
  confirmation below ran during prereg preparation, BEFORE this
  prereg was committed and before the subject was cut or any judged
  sim ran (same ordering as the 15A arm). The pre-check is a
  read-only dry run; the scaffold branch was a throwaway, deleted
  afterwards, and is NOT the subject.

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers believed
needs / favors / duties: a favor request must connect to an
executable deed or explain the blocker; typed favor promises
require deed receipts; joint jobs (water run, forage help) are
physical trips with real cargo. No standalone canon doc covers
believed-pantry perception or OVE-60 duty candidates themselves —
the family is a perception-gating repair inside the documented
favor/duty contract (villagers act on what THEY believe the
pantry/cistern holds, never on live totals they cannot see), not
a new system. Nothing here invents canon.

## Family content (read before the picks)

Pick 1 (03436c1bc, "Believed pantry/cistern for food-security and
favors"): adds one perception seam — `objResourceBelief(vid)` /
`objResourceSee(vid)` / `objResourceLiveSnap()` in
villager-objectives.js, plus `objDangerBelief(vid)` filtering so
door/rally/safety read only gossip THIS villager heard. Away or
stale belief never uses live totals: food-security
(`villager-goals.js` `pantryDays(G, vid)` now reads the belief and
returns null on unknown), FORAGE/WATER urgency, and
village-resource favors (`convo-wants.js` village-need scan reads
believed water/kcal, skips the favor on unknown belief) all read
the believed pantry/cistern. The test file is a perception probe
(home/away/stale/control/panel cases, seed 4242).

Pick 2 (206fe4931, "OVE-60: duty candidates from believed needs
join dawn scorer"): advertises DUTY forage/cook/water ads into
`vbrainFeedExtras` for unassigned villagers when
objResourceBelief shows low pantry/cistern (dutyBuildCand /
dutyFeedCands / dutyBelievedNeeds in villager-brain.js). Standing
assignTask orders stay binding (no competing ads). Seeded proof +
failing belief-hook control; phone-frame and observer-neutral
proofs refreshed. The commit carries a large evidence payload
(+5737 lines across 11 files, mostly evidence JSON); the js
footprint (1 file, villager-brain.js +127/-6) is what the carrier
question turns on — verify the js file lands, and record the
payload here.

In plain words: before this family, a villager away from Haven
judged food and water by the village's REAL pantry and cistern,
as if they could see through walls — so an away villager could
panic about an empty pantry they never saw, or stay calm about a
full one they never saw. After it, each villager judges by what
they themselves believe is stored, and only what they believe is
low becomes a dawn duty for someone unassigned. It changes no
food cost, no yield, no spoilage, no damage, no armor, no spawn,
no wave or table number — but it changes WHEN villagers go
foraging, hauling water, or cooking, and whether an away villager
keeps working or turns home. A survival effect, if any, would
come through duty/errand allocation — a real lever path, not a
dialogue quote. That is why the group is a livelier suspect than
a quote guard, and why the pair is judged as one unit.

## Merge-tree pre-check (read-only, before the subject)

Cherry-pick predictions use each commit's FIRST PARENT as the base
(the base `git cherry-pick` itself uses), with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`
(git 2.43: the 3-arg form dumps the whole merged tree; --write-tree
prints one tree OID + conflicted-file info + messages).

- PICK 1 (03436c1bc onto the far end):
  `git merge-tree --write-tree --merge-base=f843fab1cb6b81bf5574263db2f95e7439e67ef8 203a32775 03436c1bc`
  → rc=1, conflicted tree
  f3838750621be4dd12e3e40f2f139ecc79dc76f8, conflicted files
  EXACTLY THREE: docs/ONTOLOGY.md, scripts/green-list.txt,
  src/js/villager-objectives.js. NOT CLEAN. Live-confirmed on a
  throwaway scaffold branch (tmp-15d-predict, deleted afterwards):
  `git cherry-pick 03436c1bc` rc=1 ("Auto-merging
  docs/ONTOLOGY.md", "CONFLICT (content): Merge conflict in
  docs/ONTOLOGY.md", "Auto-merging scripts/green-list.txt",
  "CONFLICT (content): Merge conflict in scripts/green-list.txt",
  "Auto-merging src/js/convo-wants.js", "Auto-merging
  src/js/villager-goals.js", "Auto-merging
  src/js/villager-objectives.js", "CONFLICT (content): Merge
  conflict in src/js/villager-objectives.js", "error: could not
  apply 03436c1bc... Believed pantry/cistern for food-security and
  favors"). Status at conflict: UU docs/ONTOLOGY.md, UU
  scripts/green-list.txt, A scripts/test-believed-pantry-perception.js,
  M src/js/convo-wants.js, M src/js/villager-goals.js, UU
  src/js/villager-objectives.js. Conflict markers:
  ONTOLOGY.md lines 2021–2025 (Provides line) and 2031–2035
  (rules: danger_heard_filtered / resource_belief_filtered);
  green-list.txt lines 916–925 (one hunk, tail collision);
  villager-objectives.js lines 9–14 (header provides),
  25–29 (header rules), 843–989 (departure danger check +
  objResourceLiveSnap insertion).
- TOOLING-RESOLUTION EVALUATION: the conflict set is NOT
  tooling-only. scripts/green-list.txt alone would have been
  resolvable with `git checkout --ours` under the coordinator
  rule, but docs/ONTOLOGY.md (docs) and
  src/js/villager-objectives.js (game code) are NOT in the
  tooling set — so the rule's STOP branch fires. NO file was
  resolved, nothing was hand-edited. The STOP clause fires at
  pick 1, exactly as the binding prereg orders.
- PICK 2 (206fe4931 onto the pick-1-applied tree): prediction was
  NOT RUN and no conflict status is claimed either way — the
  transplant sequence stops at pick 1; there is no pick-1-applied
  tree to build pick 2's prediction on, and a pick-2-onto-bare-
  far-end prediction would not be the transplant sequence. The
  live pick 2 was never attempted; the subject branch was never
  cut.
- Recovery: cherry-pick aborted, scaffold branch deleted, HEAD
  back on sim-transplant15d-a at ef7430f2f, tracked tree clean, no
  CHERRY_PICK_HEAD, no subject branch. Nothing was hand-resolved.

## Conflict anatomy (verified by grep, not assumed)

- green-list.txt tail collision (same class as 15C): theirs (the
  pick) appends one line, `scripts/test-believed-pantry-
  perception.js quick`, after `scripts/test-retarget-gossip.js
  quick` — but the pick's parent ALSO carries four context lines
  the far end lacks at that tail (`scripts/test-person-trust-
  20261108.js quick`, `scripts/test-raid-danger-heard.js quick`,
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
  Provides line and the rules block (the pick adds
  `objResourceBelief(vid)` / `objResourceSee(vid)` to Provides
  and the `resource_belief_filtered` rule; `danger_heard_filtered`
  already existed at the pick's parent — 1 hit at f843fab1c, 0 at
  the far end — and the pick keeps it while adding the new rule
  beside it, so the far end's deletion of that line and the
  pick's addition next to it collide in one hunk; the far end's
  Provides line carries its own edits, including
  `objRallyFreshRaid(vid)`).

Prediction: PICK 1 CONFLICTS (game code + docs + tooling). The
STOP clause fires BEFORE the subject is cut. No subject branch,
no judged sim, no verdict on the pair. Outcome:
UNMEASURED-BY-CONFLICT. Family 15D stays on the
suspect list with its mechanism unjudged.

## Family identity (verified at run start, before any sim)

- Pick 1: commit 03436c1bcacbbf0c3d0b868503cf32da162d573b
  "Believed pantry/cistern for food-security and favors". First
  parent f843fab1cb6b81bf5574263db2f95e7439e67ef8 (family 6 merge,
  PR #33 dawn-midday-repick-3e68). Exactly 1 parent (standalone,
  not a merge). Diff: 6 files, +478/-21 by numstat:
  docs/ONTOLOGY.md 2/1, scripts/green-list.txt 1/0,
  scripts/test-believed-pantry-perception.js 283/0 (new test),
  src/js/convo-wants.js 25/6, src/js/villager-goals.js 12/2,
  src/js/villager-objectives.js 155/12. js=3 (convo-wants,
  villager-goals, villager-objectives). No policy file, no
  standing.js, no data in the diff.
- Pick 2: commit 206fe4931e2e46c86fe22dc2071046ed0ba683ca "OVE-60:
  duty candidates from believed needs join dawn scorer". First
  parent 74a16306c2879e58d4c6e0037657d63876e92088 (OVE-61:
  refresh person-trust non-aimed errand mix baseline, a 15F
  commit). Exactly 1 parent (standalone, not a merge). Diff: 11
  files, +5737/-18 by numstat: docs/ONTOLOGY.md 6/5,
  evidence/2026-11-08/duty-dawn-candidates.md 55/0,
  evidence/2026-11-08/neutral-ove60-duty-dawn-panel.json.gz
  (binary), evidence/2026-11-08/phone-duty-frame-736-r1.json
  2684/0, evidence/2026-11-08/phone-duty-frame-844-r1.json
  2649/0, scripts/balance-proof.json 2/2,
  scripts/green-list.txt 1/0, scripts/phone-frame-proof.json 5/5,
  scripts/test-duty-dawn-candidates.js 207/0,
  src/js/villager-brain.js 127/6, sw.js 1/0 (one cache-busted
  ASSETS entry — not game logic, but NOT in the tooling-
  resolution allowlist either; recorded so a future pick-2
  attempt knows it). js=1 (villager-brain.js). No policy file,
  no standing.js in the diff. The two proof-refresh files
  (balance-proof.json, phone-frame-proof.json) ARE in the
  tooling-resolution allowlist; green-list.txt is too — but pick
  2 never ran, so no resolution question arises for it.
- Pick order is origin order (oldest first) on the first-parent
  chain d229b58f5..a628aeaf3 (newest-first listing: 206fe4931 at
  line 7, 03436c1bc at line 23 — 03436c1bc is older);
  03436c1bc is an ancestor of 206fe4931.
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.
