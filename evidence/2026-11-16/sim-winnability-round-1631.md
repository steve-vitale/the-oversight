# Loop A run fleshout-20261116T1631Z — coordinator evidence (ADOPTION)

Axis: winnability chain. This run took the NEW binding blanks from 1515Z: (1) launch survival + re-encounter and (2) companion pool empty. Both arms are DIAGs on the shared fresh band 102401–102408, competent verbatim, 150d, 8-seed pilot. The coordinator run timed out at 2h; this file is the adoption closeout (both arms landed by the coordinator after the timeout).

## sim-launchsurvive-a — DIAG GO (all five frozen bars pass)

**Question:** seedland showed the seed call works (plans 0 → 17, launches 0 → 3) but every launched hunt ended holder-died with zero launched-party meetings. Why?

**Answer:** the hunters DO go — 64 days standing on the remembered tile across 7 launches — and the beast is usually still around (within 2 tiles on 13 out-days). But the two almost never meet: **0 meetings in 7 launches, 0 on the 13 out-and-near days, 0 on the 2 same-tile days.** And before the meeting can happen the hunter usually dies: 6/7 launches end holder-died, killed by other beasts, the wild, or a wound — not the beast they were hunting. Two layers: (a) the remembered tile goes stale — the beast wanders 1–2 tiles away and the sighting is never refreshed; (b) even standing on the same tile does not start a fight (2 same-tile days, 0 encounters — suggestive at daily granularity, not proof).

**Numbers:** control 1 launch, on-leg 7 launches; meetings 0/1 control, 0/7 on-leg; persistence yes 6/7; out+near 13 days; same-tile 2 days. Plan-linger: 15/15 holder-died instances linger to the end of the run (tails 15–112d, median 40) — dead holders' plans never close. Guard: expedition deaths 168 → 229, total 619 → 710, median survival 145.5 → 151d. Wall (both legs): national-by-standing 2/8 → 1/8, by-rank 0/8, table 0, wins 0, wave-4 8/8, wave-5 2/8 → 1/8.

**Proof:** 52/52 on the instrument tip AND post-revert. The evidence file's §Proof line was stale at adoption ("see the revert commit" — the revert commit records no proof numbers); the coordinator re-ran the post-revert proof (52/52) and corrected the line before landing.

**Landed:** `01c52e808` (rebased 8 commits onto 5a9e13719, proof re-run 52/52 post-revert on the rebased tip, ff-merge, tree released). Evidence `evidence/2026-11-16/sim-launchsurvive-a.md`.

**Findings filed:** stale remembered tile (needs a re-acquisition lever); same-tile non-meeting (needs finer instrument); holders die to other things first; dead holders' plans never close (defect, 15/15); plans seeded with no sighting (defect — Zoe's Suburb plan); companion death does not close the launch.

## sim-profileshadow-a — DIAG GO (all four frozen bars pass)

**Question:** the shadow numbers for the profile-gate design call (tracker blank #2). At each scored dawn, how many companions would there be if the profile gate were dropped (S1) or widened to foragers (S2)?

**Answer:** dropping the gate empties the problem completely. Under current gates (S0), **86/137 scored dawns (62.8%) have nobody to take along. Drop the gate and that falls to 0/137. Widen it just to foragers and it falls to 2/137.** The people are there: under S1 the pick is a forager on 69% of dawns, a homebody on 17%, a wanderer on 14%. The forager widening recovers 84 of the 86 empty dawns. No explorer is ever the pick under any shadow — the "ranger" pool on this band is wanderers only (51/51 S0 picks). S0 agreement with the real findCompanion pick: 51/51 (100%). Shadow-classified 137/137, unknown 0.

**Numbers:** 137 scored dawns (instrument), 11 (control); S0 biddable 51, S1 137, S2 135; mean eligible 0.42 / 2.66 / 2.08. Actual launched instances 7 vs would-be-biddable dawns 51/137/135. First-fail: notRanger 308/856 (36.0%), away 216 (25.2%), trustLow 0, notAtHaven 0. Guard: expedition deaths 168 → 229, total 619 → 710. Wall (both legs): national-by-standing 2/8 → 1/8, by-rank 0/8, table 0, wins 0, wave-4 8/8, wave-5 2/8 → 1/8, median survival 145.5 → 151d.

**Proof:** 80/80 on the instrument tip AND post-revert. The arm was incomplete at timeout (corpora on disk, analyzer/evidence/revert/proof not run); the coordinator ran the analyzer (exit 0), the D3 drift check (clean all 8 seeds), wrote the evidence file, reverted the seed call, and ran both proof shapes. One adoption note: the first post-revert proof attempt scored 79/80 against the uncommitted revert — its single failure was the test's own staging check that the revert be committed; committing the revert and re-running gives 80/80. A VM replacement killed the second proof attempt mid-run (~156s, SIGTERM); the worktree and commits survived intact, the proof was re-run after the replacement (80/80).

**Landed:** `27190e689` (rebased 4 commits onto 01c52e808 — the seed-call commit was skipped by the rebase as previously-applied, same patch-id as launchsurvive's landed seed-call commit; verified src/ diff vs master is 0 and the seed call is absent from the tip — proof re-run 80/80 post-revert on the rebased tip, ff-merge, tree released). Evidence `evidence/2026-11-16/sim-profileshadow-a.md`.

**Findings filed:** profile gate is the binding constraint (S2 recovers 84/86); bid → launch leak (51 biddable dawns → 7 launches; 5 selected-blocked, 5 candidate-not-bid); explorers absent from the eligible pool.

## Wall numbers (this band, both arms agree)

| | Control | On-leg |
|---|---|---|
| National by standing ≥ 200 | 2/8 | 1/8 |
| National by rank | 0/8 | 0/8 |
| Table (seat offered) | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 2/8 | 1/8 |
| Median survival | 145.5d | 151d |

No village reached the table on either leg. The two arms' numbers are identical on the shared band (same corpora family) — launchsurvive's on-leg wall equals profileshadow's instrument wall, and the controls match too.

## Telemetry deviation check

Both arms ran `node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current '<per-seed-control-glob>' --metrics national,table,wins,exiled`. **Both refused, as expected:** "refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs." Recorded as refusals in each arm's evidence file. No `--allow-recorder-corpus` workaround used; the baseline was not rolled.

## Convergence state

Winnability chain stays converging (NOT converged): blanks #1 (launch survival + re-encounter) and #2 (companion pool empty) both CLOSED this run as DIAG GO — the binding links are now decomposed, not just named. But wins are still 0 on competent legs and no lever has yet turned a launch into a repeatable wave-4 kill. Next blanks, in order: (3) trick question (Steve/design call); (4) profile-gate design call (Loop A — the shadow numbers are in, the decision is Steve's); (5) seasoning gate G1 ruling (Loop B held); (6) §14c watch on 100633; trick knowledge at the door; (7) rumor-born plans + world-tick seeding as design calls; (8) answercourt landing decision, competent seat-taking BUILD, family-7 program decision (Steve-calls). Scale-onramp stays converging. food-economy stays converging (parked). Claim deleted; lock deleted. Evidence: evidence/2026-11-16/sim-winnability-round-1631.md (this file).

## Infrastructure notes

- Safe-commit index clobber struck the coordinator's launchsurvive evidence commit, the profileshadow revert+corpora commit, and the profileshadow evidence commit — repaired via the ls-tree pipe each time; commits verified correct by hash before landing.
- A VM replacement mid-adoption killed the profileshadow post-revert proof re-run (SIGTERM at ~156s); /tmp was wiped, the worktree and all commits survived, the proof was re-run to 80/80 afterward. Proof logs were moved to the goal hidden_files/ (survives restarts) after the loss.
- Main-tree stray at closeout: none — the sibling playtest-loop file `evidence/2026-11-16/journey-deepening-r226-analyzer.log` noted in the 1515Z closeout is gone (committed or removed by its owner since).
