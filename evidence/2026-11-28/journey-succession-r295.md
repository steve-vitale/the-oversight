# Journey succession r295 — Lane B, leg 7 (succession) ADOPTION — EVIDENCE

Run lineage: r291 (1855Z play + 2200Z/2300Z adoptions: 26-seed panel,
mourning-above-naming fix `07906b8ca`, tooling `ff06c3199`) → r292
(0000Z adoption: died ~00:21Z) → r293 (0100Z adoption: restart 01:09Z,
panel + check relaunched, gate adjudicated) → r294 (0300Z adoption:
panel + gate read, verdict MERGE, TIMED OUT mid-rebase, merge NOT
landed) → this run (0600Z adoption: stale-lock recovery, rebase,
post-rebase proofs, chunk C commit, merge).

- Prereg: r291's `journey-succession-r291-prereg.md` (frozen before any
  judged sim; seeds FRESH band 34590–34613, EARLY_KILL_DAY=40,
  POST_DAYS=70, + positive control 34403 + smoke 33998).
- Rotation-b reads 7 (succession); advances 7 → 4 on this landed run.
- Worktree `~/workspace/worktrees/journey2-7`, branch `journey2-7`.
- Main tree verified CLEAN at ~05:55Z (`git status --short`, empty).
  Disk 54%.

## Stale-lock recovery (this run)

Lock `playtest-loop-2-20261128T0300Z` (created 02:58:55Z) deleted after
the full check, same-call as its read: registry heartbeat for
journey2-7 was 05:06:23Z (~49 min stale, >15 min), no live
coordinator process for this loop (ps empty for journey2-7; the r294
hbloop pid 2248 is dead), no live subagent owned by
oversight-playtest-loop-2, no file writes in the tree after ~05:06Z.
Machine restarted ~05:15Z (uptime 41 min at 05:56Z) — the restart
killed the r294 run mid-rebase, exactly the documented silent-kill
shape. The 04:56Z occurrence had correctly STOOD DOWN (heartbeat
04:51:22Z, 4 min old, live hbloop pid 2248); by 05:55Z that run was
dead. New lock `playtest-loop-2-20261128T0600Z` created 05:58:35Z.
Heartbeat landed 06:01:52Z, hbloop `journey2-7-hbloop-r0600.sh`
started (pid 32767). Registry run_id still reads the stale
`playtest-loop-2-20261127T1855Z` (heartbeat script updates
heartbeat_at only); heartbeat is the liveness signal.

## Rebase (this run)

Branch was 85 behind master / 4 ahead. `git rebase master` replayed
all 4 commits CLEAN, zero conflicts:

- `7310ab491` (was `07906b8ca`) — mourning above the naming debate
  [needs-eyes]
- `318e91e33` (was `ff06c3199`) — instrument-only panel tooling
- `2400072ba` (was `abdfdf935`) — r291/r292/r293/r294 notes + analyzers
- `ea6797679` (was `baf4fe0a8`) — r291 baseline corpus

New tip `ea6797679`, 0 behind / 4 ahead of master `d2c726f65`
(origin/master `2b25d4be0`, a batch-ship version bump, is an ancestor
of local master — no divergence; the 10 local-ahead commits are
unpushed merges pending ship, normal).

## Post-rebase proofs (this run, rebased tip)

- r291 mourn-above-naming
  (`scripts/test-journey-succession-r291-mourn-above-naming-20261127.js`):
  ALL PASS (4/4 cases — mantle-beats-naming 3/3, naming-alone 3/3,
  grief-nameless 3/3). (First invocation passed `--cacheDirectory`
  as a case arg by mistake — plain node scripts don't take it;
  re-ran bare.)
- r280 mourn-shape-steer: 11/11 PASS.
- r280 driftnote-stage: 3/3 PASS.

## Chunk C commit (this run)

Committed `6f342b0d7` — "journey-succession r295: r291fix post-fix
corpus chunk C (458 files) + r294 heartbeat log" (459 files,
835,719 insertions). The commit took ~25 min in safe-commit.sh's
per-file index phase under load (finished just inside the 1500s
timeout). The safe-commit CLOBBER struck again (third sighting
class): after the commit the worktree's main index showed all 459
files staged-deleted (`D`) while the files sat on disk. Repaired the
documented way — `git ls-tree -r HEAD -- evidence/2026-11-27/ |
git update-index --add --index-info` — then verified `git status
--short` shows only the 4 new r295 files and `git diff HEAD` is
empty. The commit itself was correct; only the main index lied.
Four hbloop files that sat untracked in the worktree root were moved
out to `~/workspace/worktrees/` first (r291 pair renamed `-wt`),
not committed.

## check.js --quick (this run, rebased tip)

Ran detached (setsid nohup, pid 35427), finished 06:24Z:
**338 passed, 6 failed in 1047s**
(`evidence/2026-11-28/journey-succession-r295-check-quick.log`).
Gate adjudication — GREEN:

- 3 timeouts (120s, load flakes): living-garden-deed-attainment,
  one-person-army-deed-attainment, capable-bot-20261014. All three
  re-run standalone on the REBASED tip via
  `scripts/run-journey-succession-r295-gate-standalone.sh` — rc=0
  each (living-garden 226s, one-person-army 159s, capable-bot 40s,
  40/40). Log:
  `evidence/2026-11-28/journey-succession-r295-gate-standalone.log`.
- 3 staleness (measurement-proof-update, measurement-workflow,
  phone-frame-proof): r294 expected these to clear on rebase — they
  did NOT, and the reason is now pinned: all three fail IDENTICALLY
  on master itself (run in the main tree this run, same failures,
  main tree left clean). They are pre-existing on master, NOT caused
  by the fix or the rebase. Carried, as r287/r294 carried them.
  (measurement-proof-update: "Proof source inputs are not current";
  measurement-workflow: "retained neutrality proof covers the current
  Game/controller/harness inputs"; phone-frame-proof: retained browser
  inputs stale vs index.html, alienPlayers.json, build-notes.json,
  foreignSpeech.json, regions.json, statusEffects.js.)

Post-rebase proofs (re-stated here, they are the fix's own gate):
r291 mourn-above-naming 4/4, r280 mourn-shape-steer 11/11, r280
driftnote-stage 3/3 — all green on the rebased tip.

## Merge decision

r294's decision stands: MERGE the r291 fix. The fix's claim is the
lately priority, proven three ways: proof test 4/4 (incl. RED on the
unfixed tip), LATELY-DISPLACER 0/3 at panel scale, and the smoke
control mourning by name. The REL-WITNESS FAIL is a verdict on the
witness variant — a separate mechanism (betrayal capture + draw
odds) the fix never claimed to touch — and it stands as FAIL,
recorded in r294, not re-scored, not hidden.

## Village assessment (plain words — stands from r294)

The mantle still passes cleanly at every death (82 deaths, same-day
successor every time, no skipped days). People still grieve by name
(184 servings, no repeats), newcomers are still taken in (7/7 bonded
by deadline), villagers still form bonds (110+ new) and ask each
other to talk. The dead get named first now — the naming argument
waits until the grief passes, and in the smoke village Heinrich is
mourned by name eight times where before he was never mourned at
all. The remaining hole is narrower than r291's: a witness whose
friend died in an ambush still can't say "I saw them fall" — the
village's justice case talks over the grief, and when grief does get
the turn, the witness's own line is a 2-in-7 draw.

## Reachable / fun / winnable (leg 7)

- REACHABLE: yes, unchanged. Mantle passes cleanly; the successor's
  life is playable from the handoff.
- FUN: better. Mourning by name lands — the smoke village proves it
  in the control. The un-fun part that remains is the witness hole
  above.
- WINNABLE: unchanged. The leg is about the mantle passing, not the
  win.

## Metric review

- r294's proposals stand for the NEXT succession run: split
  REL-WITNESS (lately-kind priority vs witness-variant serving);
  WITNESS-CENSUS wording fix (census reads the wrong field for staged
  deaths); pilot-branch rule (stage the supply screen so pilot seeds
  carry a witness sitting, or drop the pilot branch for this
  question). None re-scored here.

## Telemetry deviation check (step 14)

Re-ran on the r291fix tele corpus (26 files) vs
`telemetry-baselines/succession.json` (metrics: deaths.bearer,
census.alive, census.fallen, census.integrationStage,
week2.deadBearerMentions). Same two LOUD lines as r294, byte-equal
numbers — EXPLAINED, baseline NOT rolled:

- `deaths.bearer <redacted> 979%: baseline 7.6 -> current 82` and
  `census.fallen swung 1110%: baseline 14.3 -> current 173`.
- Same cause as r291/r294: the checker compares the baseline MEAN
  against the current SUM over the 26 files. On means: deaths.bearer
  3.15 (vs 7.6), census.fallen 6.65 (vs 14.3) — identical to r291's
  baseline-panel means (3.15 / 7.07). The fix changed no death or
  mantle shape; the band simply has fewer deaths and more survivors
  than the unprovenanced baseline. Per the prereg (forced-chain
  regime — do NOT roll on LOUD lines, per r280) the baseline stands.

## Incidents (this run)

- STALE-LOCK RECOVERY: see top. The 0300Z run died in the ~05:15Z
  machine restart, mid-rebase. No work lost: branch HEAD intact at
  `baf4fe0a8`, chunk C files intact on disk.
- REGISTRY LOCK CONTENTION: heartbeat at 06:02:05Z, next beat
  skipped (flock held >120s by flesh-out-loop-b's
  `worktree-register.sh sim-winflee-b`, pid 34540, + Lane A's
  journey-deepening heartbeat waiting behind it). Same contention
  r294 hit. Heartbeat stayed within the 15-min window throughout.
- HBLOOP FILES IN WORKTREE ROOT: four files
  (`journey2-7-hbloop-r291.sh/.out`, `journey2-7-hbloop-r294.sh/.out`)
  sat untracked in the worktree root — earlier runs wrote them with
  a relative path while cwd was the worktree. Moved out to
  `~/workspace/worktrees/` (r291 pair renamed `-wt` to avoid
  clobbering), NOT committed — run infrastructure, not repo content.
- EXEC DRAIN-TIMEOUT on the check.js launch (child holds the pipe):
  the setsid-detached check.js itself is running (pid 35427); the
  session was NOT killed (SIGTERM would tear down the detached
  gate — 2026-11-24 lesson). Verified alive via ps + log.

## Closeout state (for the next Lane B run)

- Branch `journey2-7` at `abaf752c7` (6 commits ahead of master
  `d2c726f65`, 0 behind): fix `7310ab491` + tooling `318e91e33` +
  notes/corpus `2400072ba`/`ea6797679` + chunk C `6f342b0d7` +
  r295 evidence `abaf752c7`. Rebase clean, post-rebase proofs 4/4 +
  11/11 + 3/3, check.js --quick 338/6 with gate GREEN (3 timeouts
  pass standalone on the rebased tip; 3 staleness fail identically
  on master — pre-existing, carried). Merge decision: MERGE.
  Merge + release + rotation-b 7 → 4 + lock deletion are the next
  steps of THIS run, recorded in `~/memory/2026-11-28.md` (this
  section was written pre-merge so it cannot repeat r294's
  already-merged claim).
- NEXT BLANKS (filed, leg 7, for a future succession run — from
  r294, unchanged): (1) witness variant vs betrayal-case capture —
  does fresh grief outrank an open case, and should the first
  mourning serving of a witnessed death be the witness line? Needs
  its own prereg + panel. (2) Smiling closers after grief ("Good
  talk", "Come back anytime") — retire whenever grief is live.
  (3) Mourning-template repetition — each mourning villager their
  own sentence. (4) NPCs re-raising their own wants when the player
  changes subject. (5) "What did you see out there?" answered with
  what they saw, not a plant lesson. (6) WITNESS-CENSUS wording fix.
  (7) NEW from this run: the 3 carried staleness proofs fail on
  master itself — the retained measurement/phone-frame proofs are
  stale against current master and need a refresh (balance-proof
  refresh + phone-frame receipt refresh) by whoever owns those
  proofs; r294's "clears on rebase" expectation is disproved.
- Next run plays leg 4 (endgame) per rotation-b, after this run's
  merge advances it 7 → 4.
