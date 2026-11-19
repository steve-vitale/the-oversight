# sim-winnability-round-1830 — Loop B 1830Z, adoption closeout

**Run:** `fleshout-loop-b-20261119T1830Z`, axis winnability chain. The run timed out
at closeout (2h limit) with arm 1 landed to master but the gate unread, the
round evidence unwritten, the tracker un-updated, and the worktree/claim/lock
still in place. This adoption verified everything from files/git and finished
the closeout. Nothing was re-run; nothing was lost.

**Arm 2 descoped before timeout:** `sim-rageholder-survey-b` was descoped 19:51Z
— the host write flap (19:39–20:19Z, survived a VM replacement ~19:51Z) blocked
ref writes (2× register FAIL + 2× update-ref probe FAIL), so the survey never
spawned. Its brief is kept in
`hidden_files/loop-b-1830Z-briefs.md` as the next run's top blank. Only arm 1
judged this round.

## Arm 1 — sim-partysurvive-rerun-b: NO-GO, kind NO-PRE-FIGHT-DEATHS

Re-run of the launch-party survival diagnostic on the launch-rich band
designated by launchfunnel-b (106081–106088: 17 targeted wave-4+ launches,
9 quads on the survey substrate). Full substrate (SENSEEXPED=1 PARTYSIZE4=1
VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1, LAUNCHSURVIVE=1),
150d, competent verbatim, policy sha `729af71ccddd` (matches the survey).

| Bar (frozen) | Result |
| --- | --- |
| Pool floor (≥6 quad launches AND ≥3 pre-fight deaths) | **FAIL** — 2 quad launches, 0 pre-fight deaths, 8 members tracked |
| Classification completeness (≥0.90) | **FAIL** — 0/0, nothing to classify |
| Survival curve | **FAIL** — alive at meeting 1.000 (4/4); +7d 0.875, +21d 0.500 |
| Instrument | **PASS** — 0 errors, 8/8 files, death-day cross-check 4/4 agree |

Verified by the adoption from `partysurvive-rerun-b-analysis.json` (verdict
NO-GO, kind NO-PRE-FIGHT-DEATHS; launches 2, preFightDeaths 0, crossCheck
4/4 agree, 0 disagree). The two launched-member deaths are both
`died-in-window-no-meeting` (106083: pavel_dubinin d95 field-fight, and
gen_7zfpp4e d98 `the wild`) — not in the judged denominator.

**Damage secondary (descriptive, never judged):** n=1 — 673 damage in the one
joined meeting, and it was NOT against the launch target: 106087 nina launched
against the Eulogy, her first joined meeting was a suburb fight Hannah was
already in (12 rounds, flee at 30% HP); nina dealt 77 as the 3rd ally. Do not
cite "673 damage per launched meeting" without the n=1 and the suburb beside it.

**The finding — designation does not transfer (finding #2616, filed):** same
seeds, same policy, same flags except ALLYSLOT3 ported — targeted launches
17→9, quads 9→2. Trajectories start byte-identical (d28/d31 launch rows on
106083 identical in both corpora) and diverge at the first quad fight, when
the 4th ally fighting changes deaths and party composition. The two launches
that reproduce exactly (106087 nina→eulogy d116, 106088 fatima→eater d68) are
the ones with no earlier quad fight to diverge on. A survey designation is
valid for launch rate ON THE SURVEY SUBSTRATE; it is not a property of the
seeds. Next survey that designates a band for a re-run should survey under
the re-run's full substrate (port included).

**Sense-test (from the arm evidence, transcripts read):** the ALLYSLOT3 seat
fires in the wild exactly as ported — nina answers the third shout on 106087
d116. Pavel's launch (106083 d88) fought its target and killed a Herald in
world-tick fights the frozen expedition-only join does not count as meetings —
"never met" means "never met on an expedition" (metric review §9.3). Fatima
(106088) never meets her target but fights a 15-round suburb for 910 damage —
the biggest single-fight damage in the corpus, by a villager who never
launched a targeted party that met. The damage wall is not a launched-party
wall.

**Landing (verified by the adoption from git):** three commits cherry-picked
onto master, tip `16975bb01`:

- `dd3208251` — frozen prereg amendment (designated band, same floors/bars,
  damage secondary descriptive)
- `60e76576f` — damage-per-launched-meeting secondary + panel builder
  parametrization (after-seeds/run/origin argv flags, defaults byte-identical
  to 1230Z; regression check reproduces 1230Z panels byte-identical)
- `16975bb01` — evidence + corpora + analysis

Zero `src/` changes across all three commits (scripts + evidence only). The
ALLYSLOT3 port `d00f66f0a` (cherry-pick of `f4d1100ee`, coordinator-authorized
evidence-only substrate on the branch) was verified NOT an ancestor of master
before and after landing — it stays held on the branch, which is deleted on
release. Proof tests re-verified by the coordinator on the branch: analyzer
selftest 34/34, `test-partysurvive-b.js` 5/5, `test-allyslot3-b.js` 18/18.
(Note: on the merged tip those tests sit at the expected held-lever state —
`test-allyslot3-b.js` does not exist on master, it shipped inside the port
commit; `test-partysurvive-b.js` §C refuses to run without the ported slot
code. Neither is in check.js.)

## Gate

On the arm-1 landing tip `16975bb01`, full log
`evidence/2026-11-19/check-quick-round-1830.log`: **339 passed, 5 failed
in 836s, 0 attributable** — the exact standing set, byte-identical in kind
to the 1230Z / 1415Z / 1530Z rounds. Master moved by one evidence-only
commit (`68b1f6370`, social r239 panel — no `src/` changes, two new
non-gate scripts) between the gate run and this adoption's merge; the gate
verdict stands for the merged content.

- measurement-proof staleness pair — `test-measurement-proof-update.js`
  ("Proof source inputs are not current") + `test-measurement-workflow.js`
  ("retained neutrality proof covers the current Game/controller/harness
  inputs"). Pre-existing; the proof was last re-signed in refresh round 21
  and its inputs have since moved. This run changed zero `src/js`, so
  nothing here is attributable to it.
- phone-frame stale receipt — `test-phone-frame-proof.js` (retained browser
  inputs vs current source; receipt stale on index.html). Pre-existing.
- two 120s timeouts under load — `test-living-garden-deed-attainment.js`
  and `test-one-person-army-deed-attainment.js`, both **solo-verified green
  (exit 0 each)** by the adoption. Load timeouts, not failures.

The coordinator's background gate never finished (one header line in the
main tree's untracked `check-quick-round-1830.log`, process dead by adoption
time — killed by the run timeout, not by a failure); the adoption ran the
gate from scratch in its own worktree on the merged tip and committed the
full log. This run changed zero `src/js`.

## Panel and telemetry

**Balanced panel — invalid, as the prereg anticipated.** The compare refuses
the unpaired comparison verbatim (unmatched seeds / origin / cases): the
before panel is seeds 104770–104777, origin `sim-fightcap-b`; the after
panel is seeds 106081–106088, origin `sim-partysurvive-rerun-b`. It is not
a before/after on identical seeds and is uninterpretable; the verdict rests
on the frozen absolute bars, not on the panel. Wall numbers are reported
directly in §5 of the arm evidence instead.

**Telemetry deviation check — refused the recorder corpus, verbatim** (all 8
`--current` rows carry top-level anchorCommit; sweep recorder rows, not runs).
No LOUD lines; no deviation to investigate; baseline NOT rolled (anchorCommit
mismatch still uninvestigated — same standing item as prior rounds).

## Walls (designated band, judged leg)

| | Re-run | Survey wall, same band | 1230Z fresh band |
| --- | --- | --- | --- |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave 5 reached | 4/8 | 4/8 | 0/8 |
| Wave 4 reached | 8/8 | 8/8 | 8/8 |
| Standing ≥200 | 4/8 | 4/8 | 0/8 |
| Survived 150d | 3/8 | 4/8 | 3/8 |
| Median survival | 141d | 143d | 132.5d |

**Standing-199 stall on 4/8 seeds** (106082, 106084, 106086, 106087) — the
visible ceiling again. Band-wide deaths: `monster` 28 (33%), `the wild` 25
(29%) — the unstoried classes still dominate the death ledger (finding
#2607, same note, no new mechanism claimed).

## Metric review

1. **The designation is not a property of the seeds** (arm evidence §9.1,
   finding #2616). A future survey that designates a band for a re-run
   should survey under the re-run's full substrate, or the re-run's prereg
   should price its pool floor from the substrate it will actually run on.
   Not re-scored (metric binding); the NO-GO stands as frozen.
2. **+7d/+21d shares do not censor at the meeting day** (carried from
   1230Z §9.2): nina died d130, fourteen days after her d116 launch but
   after the meeting she walked out of — counts as "not alive at +21d".
   Reads as "alive N days after launch", post-meeting deaths included.
   Not re-scored.
3. **"Never met" means "never met on an expedition"** (§9.3): pavel's
   launch fought its target and killed a Herald in world-tick fights the
   frozen join does not see. A future instrument could count world-tick
   and aid fights as meetings, or report an "any-origin meeting" count
   beside the frozen one. Not re-scored.
4. **Damage secondary n=1 is a join artifact** (§9.4): the one counted
   meeting is a suburb fight the launch never targeted. A future run that
   wants damage-per-launch should define the meeting as "first fight
   against the launch target, any origin". Not re-scored.
5. **The 0.90 bar on a thin pool is moot at n=0** (§9.5); **same-day
   launch deaths / HP at launch** (§9.6): both no-meeting deaths walked
   into their final fight with ≤12 HP — a future instrument could record
   member HP at launch from `v4launchTrack`.

## Closeout

- Run timed out at closeout; the coordinator's background gate
  (`check-quick-round-1830.log` in the main tree) never finished — one
  header line only, process dead by adoption time. The adoption ran the
  gate itself on the merged tip (see Gate above).
- The host write flap (19:39–20:19Z, survived a VM replacement ~19:51Z)
  blocked arm 2's registration and killed the coordinator's gate run; it
  cleared before the adoption (watcher back up, all probes OK 20:19Z).
  The adoption probed a write first (OK) before committing anything.
- Arm 1's branch `sim-partysurvive-rerun-b` held the ALLYSLOT3 port
  evidence-only; the port was NOT merged, the branch is released and
  deleted with this adoption. Its worktree was clean at release.
- Claim `fleshout-loop-b-20261119T1830Z.json` retired; lock
  `fleshout-loop-b.lock` (run_id `fleshout-loop-b-20261119T1830Z`) deleted
  last, same-call read+delete with run_id verified.
- No push, no bump — merged locally, pending ship.

## Next blanks, in order

1. **Rage-holder survey (arm 2, descoped)** — survey fresh bands for
   Rage-holder rate to designate a holder-rich band for the laterage
   re-run (finding #2614: holder scarcity, not the firing gate). Brief
   in `hidden_files/loop-b-1830Z-briefs.md`; fresh bands only (do not
   reuse 105931–105938, 105941–105948, 106051–106058, 106061–106068,
   106071–106078, 106081–106088, 106111–106118).
2. **The damage question underneath (#2605)** — what lifts a launched
   party toward ~111/round; base-rate ceiling as the named mechanism,
   with a damage-per-launched-meeting number defined as "first fight
   against the launch target, any origin".
3. **The launch funnel (#2604, now with #2616's caveat)** — re-runs that
   need launched quads must survey under the full substrate or accept
   the designated band as a starting point, not a guarantee.
4. **Standing-199 stall** — 4/8 seeds at exactly 199 on this band;
   the release bar sits one point out of reach while villages wait.

Winnability chain stays converging (NOT converged): launches can be found,
but the launch itself is trajectory-fragile — the rate a survey measures
does not survive the substrate change — and nothing reaches national or the
table.
