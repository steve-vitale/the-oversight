# Coordinator closeout — Loop B run fleshout-loop-b-20261113T1530Z

Run `fleshout-loop-b-20261113T1530Z` (scheduled 0930 CST, started ~16:28Z
after a VM delay), Loop B, axis winnability chain. The run TIMED OUT at 2h
before coordinator closeout. Both arms had already completed and merged
locally — no work lost, main tree clean at timeout. This note is the
adoption closeout only; no arm was re-run.

## Arm verdicts

Arm 1 sim-silentvanish-b — **ANSWERED, no build.** Finding #2308 (voiced
join, silent vanishing): the removal path is named and reproduced on
current master — the newcomer is Grace (visjoin_136), killed d138 by
Loud-Eyes (the Eulogy) in a wild encounter, and her death IS voiced by
name the day it happens (Codex line + d139 digest). The finding's silence
is a sampling artifact twice over (track filter misses the verb "killed"
and the hydrated name; the join→death arc fits between two daily roster
snapshots). Band: 0 silent vanishes in 137 leaves across 8 seeds.
Evidence evidence/2026-11-13/sim-silentvanish-b.md, corpora
evidence/2026-11-13/perseed-silentvanish-b/ (8 files).

Arm 2 sim-namelessadm-b — **GO, fix landed.** Finding #2309 (nameless
admission line): live-play verification PROVES the moot can accept with
zero housing room and the game then says "The fire makes room. —" with
blank names. Fix: the admission line now names the admitted petitioners
(src/js/villageAgency.js, fix 6c4a95602); proof test
scripts/test-namelessadm-b.js 20/20 RED→GREEN; after-leg band
byte-identical to baseline (both corpora `diff -r` empty). Evidence
evidence/2026-11-13/sim-namelessadm-b.md, corpora
evidence/2026-11-13/perseed-namelessadm-b/ +
perseed-namelessadm-b-before/ (8 files each).

## Wall numbers (both arms, identical)

national 0/8, table 0/8, wins 0/8; wave-4 unlocks 8/8, wave-5 unlocks
1/8; median survival 137 days. The scale wall did not move this run.

## Landed SHAs (verified in master)

- sim-silentvanish-b: 9e484ff92 (prereg), 639b7e3bf (band driver),
  3f26d316f (band driver wrap fix), 05aa4ce5a (evidence + corpora).
- sim-namelessadm-b: 36f66dafc (prereg), 6c4a95602 (fix + proof),
  d2173ddda (probe driver + evidence + corpora), 2f0b214fa (evidence
  closeout; rebase onto 05aa4ce5a, proof re-run green).
- Master HEAD at closeout: 2f0b214fa. Master is 16 commits ahead of
  origin/master (this run's 8 + steeple-a adoption 4 + r85 adoption 4) —
  merged locally, pending ship. No push, no version bump (ship loop owns
  that).

## Telemetry check — REFUSED (recorder-corpus), baseline NOT rolled

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-13/perseed-<arm>-b/*.json' --metrics
national,table,wins,exiled --sweep-rows` refused BOTH corpora: "all 8
--current rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs." Same refusal class as the 1430Z run. No comparison was
made; the winseat baseline (national 12/16, wins 16/16) was NOT rolled
and must not be reseeded from probe corpora. The wall numbers above are
the run's measurement, taken from the evidence files directly.

## Closeout actions (this adoption)

- Released sim-namelessadm-b (worktree-release.sh, merged; tree removed,
  branch deleted; branch verified an ancestor of master first, tree
  verified clean). sim-silentvanish-b was already released by the run
  (tree + branch verified gone).
- Addendum corrections to the landed evidence headers (this commit):
  sim-silentvanish-b.md cited pre-rebase SHAs and the wrong run id —
  run `fleshout-loop-b-20261113T1430Z` → `...T1530Z` (header + §8
  proposed-annotation text), prereg be0efaf83 → 9e484ff92, band driver
  ac927493b → 639b7e3bf, wrap fix 76024e42 → 3f26d316f (two mentions),
  commit list now names all four landed commits including 05aa4ce5a.
  Same class of staleness in sim-namelessadm-b.md, fixed in the same
  addendum: prereg commit f5b685ee2 → 36f66dafc (header + run-notes
  clobber story). The corpora `anchorCommit` fields (76024e420e6e,
  f5b685ee2728) were NOT rewritten — they are probe-time HEAD labels,
  accurate as recorded, and the namelessadm evidence says so explicitly.
- Findings annotated in sim-findings.md: #2308 [ANSWERED] (this run's
  text, corrected run id), #2309 [fixed] (fix 6c4a95602, merged
  2f0b214fa).
- Convergence tracker: new "Latest review — run
  fleshout-loop-b-20261113T1530Z" section appended; winnability chain
  stays converging (NOT converged); food-economy stays converging
  (untouched; parked).
- Claim fleshout-loop-b-20261113T1530Z.json deleted; lock
  fleshout-loop-b.lock deleted (run_id verified first).

## Gate note

`check.js --quick` was NOT re-run for this addendum: the change is
evidence .md only (no src/js, no scripts, nothing on the green list),
and a sibling adoption gate was live when checked (PID 128638) — the
standing rule is never to run two gates concurrently. The arm gates stand
as recorded in the arm evidence (namelessadm 1743s, load-artifact
timeouts adjudicated; silentvanish check-first, no src/js changed).
