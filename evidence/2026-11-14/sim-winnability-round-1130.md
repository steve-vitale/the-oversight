# sim-winnability-round-1130 — Loop B coordinator closeout (adoption)

Run: fleshout-loop-b-20261114T1130Z (Loop B), axis winnability chain.
Coordinator: adoption run — the scheduled run timed out at 7200s before
release verification. Both arms had already merged locally; the adoption
verified the merges, released the surviving worktree, ran the telemetry
check, and closed out the run (claim + lock).
Date: 2026-11-14. HEAD at closeout: f3cec9f1b (before this evidence commit).

## Arms

### 1. sim-proofrefresh-b16 — GO 12/12 (measurement hygiene)

Proof refresh round 16, owed because the fusionoffer fix (59448d248)
re-staled the b15 panel by 2 manifest keys (src/js/contests.js,
src/js/game.js). Regenerated neutral panel (sha 49fbcf95, 64 rows,
0 stale keys) + proof re-point + test + evidence.

- **Verdict: GO 12/12 on final tip 3a60ceb10** (panel 49fbcf95);
  addendum re-verified GO on tip 28a5cacaf (transplant15f move touched
  no manifest file; legs re-run 12/12, leg (a) 9/9).
- All six prereg legs pass: (a) test-measurement-proof-update 9/9,
  (b) measurement-workflow 9/9, (c) cache-flags 4/4 outright first
  attempt (this IS the owed cache-flags quiet-box A/B folded into the
  legs — no failure to discriminate), (d) neutrality reproduces the
  prior panel on every proof case, warnings 0, (e)
  test-proofrefresh-b16.js 12/12 incl. stale-input negatives (retained
  b15 AND b14 panels FAIL validate() on the new tip), (f) ontology
  exit 0 (138 systems).
- Panel wall rows (carried, not a balance verdict): national 11/64,
  wins 16/64 (all capable), entered 16/64, table 56/64, wave-5 13/64,
  wave-4 63/64, median 90d. Row movement vs b15: 16/64 rows differ —
  the game changing under the instrument (fusionoffer fix), not
  instrument drift; neutrality reproduces exactly.
- Master moved three times during the run (version bump +
  transplant15a → 16f05da86; transplant15c/15e → 3a60ceb10;
  transplant15f → 28a5cacaf); the panel was regenerated on the
  rebased tip and re-verified after each manifest-clean move.
- Merged commits (rebased equivalents): 0d446c968 (prereg),
  38734075f (panel regen + re-point + test + evidence), 91d56d5f6
  (closeout), fbd6d9ce9 (addendum). Finding #2299 updated.
- **Round 17 is owed after the next manifest change** — not started
  here. It is the next B run's measurement blank.
- Evidence: evidence/2026-11-14/sim-proofrefresh-b16.md (+ -prereg.md);
  panel evidence/2026-11-14/neutral-proofrefresh-b16.json.gz.

### 2. sim-diplo-verb-b — DIAG-GO on all three prereg bars

DIAG follow-up to finding #2321 (capable 16/16 vs competent 0/16):
which leadfeast verb seasons a link. Instrument-only (zero src/js);
8 seeds × competent/capable, 150d.

- **Verdict: DIAG-GO (G1 instrument validity, G2 attribution, G3
  instrument-only).** Proof test static 39/39, game 22/22 on smoke
  seed 98801. No confirm band spent — the pilot attributed cleanly
  (30/30 seasoned links carried by a named verb, 0 unattributed
  diplomacy points).
- **The answer: the first-gesture accord gift — answerAccord('gift'),
  +10 trust, 2,000 kcal — seasons links (24 of 30 first-crossings);
  the tend (+8/week, policy + villagers' own drive) carries the other
  6 and all maintenance.** A link is born at trust 30; the accord gift
  lands the morning after formation and puts it at exactly 40, so it
  only has to survive 30 days. Feast and devotion channel touch no
  link at all (competent: 18 feasts, 653 devotion channels, 0
  diplomacy).
- **Competent's zero is three layers deep:** (1) formation — exactly
  1 link per village, days 39–58, gifted by the ladder stage-3 reward,
  vs capable's 3–5 proposed from day 10–38; (2) tending — competent
  never answers an accord and never tends, so its link decays (max
  trust 31–39, one seed one point short) until it breaks at succession
  or rots at 0–27; (3) the polity gate — a seasoned link scores 0
  unless it sits in a regional+ polity; diplomacy is exactly
  34 × (Haven-primary seasoned subs) when that count is ≥3, else 0
  (exact fit on all 8 capable seeds). Two capable seeds season 3–4
  links and still score 0 (BELONG links / too few Haven-primary subs).
- Wall numbers: capable national-or-global 6/8, table 8/8, wins 8/8;
  competent national 0/8, table 0/8, wins 0/8. Median survival
  competent 110d (8/8 village-lost), capable 90d (win-truncated).
- Reproduction check vs capablewinpath corpus: 12/16 exact; the 4
  diffs are base moves (fusionoffer landing reshuffling RNG draws),
  not recorder effects — the unmodified capablewinpath driver on this
  base reproduces the numbers exactly on the three checked seeds.
- **Finding #2321 follow-up ANSWERED.** The scale-climb lever's
  prerequisite is met: build on propose + accord + tend + the 3-sub
  polity bar. That lever is the next B-run build decision (competent
  seat-taking BUILD, queued since the capablewinpath DIAG-GO).
- Carried findings: mourning chokes 24% of tends (37/153 refused, all
  on grief); counter-answers build BELONG links that score 0 (5/5
  seasoned, 0/5 counted); aid is an unwrapped trust channel (+4,
  sits in the recorder residual); say-capture cap (150 lines) fills
  with early chatter before late beats stage.
- Merged commits (rebased equivalents): f7d12ab33 (prereg),
  5c5474c96 (instrument), 9be95a8ad (pilot corpora + evidence). Branch
  released before the timeout (worktree gone, branch deleted, tip
  9be95a8ad verified an ancestor of HEAD at adoption).
- Evidence: evidence/2026-11-14/sim-diplo-verb-b.md (+ -prereg.md);
  per-seed evidence/2026-11-14/perseed-diploverb-b/ (16 files);
  analysis evidence/2026-11-14/diploverb-b-analysis.json;
  repro evidence/2026-11-14/perseed-diploverb-repro{,2}/.

## Telemetry deviation check (adoption)

Command (per the Loop B brief): `node scripts/telemetry-check.js
--baseline .../hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-14/perseed-diploverb-b/*.json'
--metrics national,table,wins,exiled`.

- **Result: REFUSED by the tool (exit 0, refusal message, no
  comparison).** "refusing recorder-corpus input: all 16 --current
  rows carry top-level anchorCommit, so they are sweep recorder rows,
  not runs." Same standing refusal as prior rounds (b11–b15 adoptions
  recorded the .gz-panel variant; the refusal pattern is unchanged).
- The .gz proofrefresh panel is likewise unparseable by the tool
  (expects per-seed JSON, not a panel archive) — recorded in the
  b16 evidence; no lever was played, so there is no before/after
  deviation to check there.
- **Adjudication: no LOUD line exists to adjudicate — the tool refused
  to compare at all.** The refusal is correct on a second ground too:
  the baseline is a regime baseline ("winseat — full win-side win
  stack, wins 16/16"), while the diploverb corpus is a deliberate
  capable-vs-competent contrast (8 wins / 8 losses); comparing it
  against a ~100%-win baseline would fire a spurious regime-artifact
  LOUD. **Baseline NOT rolled.** The arm's own wall numbers and the
  reproduction check (12/16 exact, 4 diffs explained as base moves)
  stand in place of a telemetry compare.
- Standing limitation, unresolved: telemetry-check refuses
  recorder-corpus rows and gzipped panels; a regime-segregated
  recorder-vs-recorder baseline would be needed for a real compare.

## Release record (adoption)

- sim-proofrefresh-b16 worktree heartbeated at adoption start
  (registry heartbeat 2026-11-14T14:15:06Z), then released:
  `worktree-release.sh sim-proofrefresh-b16 merged` → "released
  sim-proofrefresh-b16 as done-merged"; `git worktree remove --force`
  OK; `git branch -d sim-proofrefresh-b16` OK (was fbd6d9ce9).
  Branch verified an ancestor of HEAD before deletion.
- sim-diplo-verb-b: already released by the run (worktree gone,
  branch deleted before adoption; tip 9be95a8ad verified an ancestor
  of HEAD).
- Main tree verified clean at adoption (`git diff --stat HEAD` empty)
  and again after release.
- Reaper final sweep: `worktree-reap.sh` SKIPPED — registry lock held
  by a live reaper run (consecutive skips: 1), guard working as
  designed. No removals were due (both arm trees already released;
  registry shows sim-proofrefresh-b16 done-merged). A re-run of the
  sweep is owed on the next B run only if a removal is pending; none
  is. Main tree clean stands as the verification.
- No push, no version bump, no live verification — the ship loop owns
  deploys. Both arms: merged locally, pending ship.

## Convergence state

- DIAG arms — no lever, no convergence verdict. The diploverb arm
  documents; the scale-climb lever build is a later arm's prereg.
  The prerequisite for that lever is now met (mechanism pinned:
  accord + tend + 3-sub polity bar).
- Proof refresh is measurement hygiene, not a lever: round 16 GO
  12/12 keeps the instrument current on the final tip; round 17 is
  owed after the next manifest change.
- Scale-onramp stays converging (NOT converged): no carrier found;
  the diploverb wall numbers (capable 8/8 wins vs competent 0/8 on
  identical seeds) re-confirm the seat-taker + scale-climb gaps from
  capablewinpath-b.

## Run closeout

- Run fleshout-loop-b-20261114T1130Z timed out at 7200s before release
  verification; adoption coordinator completed the release, telemetry
  check, evidence, and tracker update. Claim file
  hidden_files/lever-claims/fleshout-loop-b-20261114T1130Z.json
  (run_id verified) deleted at closeout; lock
  hidden_files/fleshout-loop-b.lock (run_id
  fleshout-loop-b-20261114T1130Z, created 2026-11-14T12:09:12Z)
  deleted after all work above.
- No work lost. No lever played. No src/js in either arm's diff
  (diploverb instrument-only; proofrefresh is panel + proof + test).
