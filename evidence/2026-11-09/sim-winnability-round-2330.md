# sim-winnability-round-2330 — Loop B, scale-onramp / winnability chain (converging, NOT converged)

- Run: fleshout-loop-b-20261109T2330Z, scheduled Mon 2026-11-09 17:30 CST (23:30Z). Budget ~2h → ~01:30Z. Closed out ~01:2xZ.
- Repo: `~/workspace/the-scattering`, branch `master`. Loop A live on food-economy the whole run (run fleshout-20261109T2315Z; arms sim-medheadcount-confirm-a + sim-wallbase-a) — NOT touched.
- Claim: `hidden_files/lever-claims/fleshout-loop-b-20261109T2330Z.json` (arms sim-vetfinish-b + sim-standaccum-b; deleted at closeout).
- Lock: `hidden_files/fleshout-loop-b.lock` (run_id fleshout-loop-b-20261109T2330Z, created 2026-11-09T23:40:53Z; deleted at closeout).

## Stale-lock recovery (done 2026-11-09 ~23:31–23:40Z)

Previous B run 2130Z lock (created 21:36:00Z, ~125 min old) deleted as stale-lock recovery: coordinator dead (timed out per `evidence/2026-11-09/sim-winnability-round-2130.md`; no coordinator process; past 2h budget). BUT both 2130Z band workers were ALIVE at 23:33Z (live node processes + fresh files): sim-midfifth-c-b and sim-foodrung-band-b. Per the 2130Z handoff, adoption stood down while workers lived; their trees were NOT touched. This run adopted both after they finished.

EPERM flap active 22:36–23:16Z (foodrung evidence: 22:23–23:19Z) made registry heartbeats (stuck 22:19:40/22:19:41Z) unreliable — not evidence of death. Flap cleared by 23:34Z (write probes to /tmp, worktrees, evidence all OK).

## Master moves during the run

`65fef6d7e` (start) → `005f3c940` (journey-succession r166 adoption, 5 commits, sibling) → `0b2e37220` (foodrung adoption, this run) → `fb9dd2be0` (standaccum, this run) → `4abe40a10` (journey-landing r122, sibling) → `a64d6e91a` (midfifth adoption, this run) → `9058bb5db` (vetfinish adoption, this run).

## Arms played

Flee-repair NOT taken (Steve call, still held, branch sim-fleerepair-a).

### Arm 1 — sim-vetfinish-b (BUILD arm; landed `9058bb5db`)

Committed field finish per sim-findings #1841 (grind-a). Premise correction, found by the worker: the committed finish was ALREADY LANDED (`8a4ce0eab`, sim-finishersize-a, 2026-11-06; proven 89/89; adopted 2026-11-07). The arm did the adopt arm's named next step instead: built the constructed wall-delivery instrument and judged the committed finish on the addressable-window conversion rate, plus a verification leg of the landed finish on the grind band. Band re-use 99641–99648 (grind-a measured band; re-use recorded in prereg, never claimed fresh). Prereg `9e7e8478d` (re-based `e011a8af7`).

- Verdict: primary **NO-GO (narrow, metric-confounded)** — 0.48 vs the 0.50 bar on constructed addressable meetings (|A| = 60, commits 32/32, committed kills 29). Convertible rate 0.91 (29/32). Per §14 NOT re-scored as GO; the corrected metric (committed kills / |C|, GO ≥ 0.50) is proposed for the next run, where it would read 0.91.
- The grind band does NOT reproduce on current master: field wave-4 kills 1 → 9 on the same seeds (128 → 168 field fights, 11 below-break meetings). The 1/128 baseline that motivated the arm does not exist on current master.
- Mechanism found: `mCanFlee` is off for all wave-4+ monster kinds, so below-break beasts stand and die in ordinary rounds — the FS commit's beast-holding half is redundant for wave 4; its only causal channel (fighter morale suppression, `fsHoldLogged`) fired 0× in 330 constructed fights and 0× in the wild. FS is engine-proven / field-unmeasurable.
- Zero `src/js` changes (instrument + proof + evidence + 16 corpora only). Proof re-run by the coordinator on the branch tip AND post-rebase: vetfinish 39/39, finishersize 89/89.
- Wall numbers (before-leg, current master): median survival 116.5d (range 68–150), won 0/8, national 0/8 (regional 8/8 — rank thresholds re-cut by the Standing ladder, so rank fields are not comparable to grind-a), table sittings 0, wave-4 unlock 8/8, wave-5 unlock 4/8, wave-4 kills 27, wave-5 kills 0, field wave-4 kills 9, scholar deaths 86.
- Village read: 7/8 lost, 1 survived 150d. Villages banked up to 3 living veterans at peak and held readiness-5 for up to 35 days, but converted none of it into a wave-5 kill or a national climb. On this band the chain now binds at wave-5 facing and national/table — past the veterans bar the freeze measured.
- Findings filed to sim-findings.md by the worker: SPEAR-IN-RANGED-SLOT (open), VOLLEY-SOFTENED EXCLUSION (open, design decision), DRIVEN-CROSSING CANDIDATE (open, needs its own prereg). Also: #1841 should be marked built-and-measured, not re-assigned.
- Evidence: `evidence/2026-11-09/sim-vetfinish-b.md` (+ prereg).

### Arm 2 — sim-standaccum-b (DIAG, zero src/js; landed `fb9dd2be0`)

Standing accumulation on gear-ready seeds, 99107 pattern, re-point queue item 3. Band re-use 99101–99108.

- Verdict: **DIAG-NO-CANDIDATE** (split 4 veterans-hold / 3 diplomacy / 1 released; 6/8 bar not met). Proof 13/13 (re-run by the coordinator).
- First release ever on the 99101–99108 band: seed 99101, 19 ready days d106–125, gated 220→270, wave 5 unlocked d106, died d132 standing 270, zero wave-5 kills.
- Diplomacy forms now (1 link/village, born trust 30–34, decays) but never counts (no `polityOf('haven')`; LEAD needs ≥3 seasoned subordinates).
- Finding #1732 annotated SUPERSEDED; 5 new findings appended to sim-findings.md.
- Wall numbers: wins 0/8, national 0/8, table 0/8, wave-4 unlocks 7/8, wave-5 unlocks 1/8, ready days 19 (99101), median survival 132d, end scale regional 8/8.
- Evidence: `evidence/2026-11-09/sim-standaccum-b.md`.

### 2130Z adoption — sim-foodrung-band-b (DIAG, zero src/js; landed `0b2e37220`)

- Verdict: REPRODUCTION PASS 16/16 + pair MIXED (with=1, against=0, anyMove=4). Proof 114/0/0 (re-run by the coordinator on the branch + post-rebase).
- Wall numbers (L3/L5): national 0/8 both; wins 0/8; wave-4 unlocks 8/8; wave-5 unlocks L3 1/8, L5 3/8; wave-5-ready L3 0/8, L5 2/8; median survival L3 95d, L5 72.5d; kills 12→23.
- 6 findings appended to sim-findings.md by the coordinator (rung MIXED; 53015 flip + 53011 counter-flip; kill/survival decoupling; preload Date.now bug; generated-fighter attribution; Emberhold raid ~0 kcal).
- Evidence: `evidence/2026-11-09/sim-foodrung-band-b.md`.

### 2130Z adoption — sim-midfifth-c-b (DIAG, zero src/js; landed `a64d6e91a`)

- Verdicts: coach `5e190b6ef` INERT; medic `48c93b22b` MIXED (restores F0 byte-identical on all 8 seeds — the (c) set's mover in substance); reveal `ae7daf40c` INERT; tooltip `1cc46630c` INERT; F0r EXACT on current master. Proof 142/142 (re-run by the coordinator on the branch + post-rebase). 72 corpora.
- Wall numbers (F0): national 0/8, wins 0/8, wave-5-ready 0/8, median 150d, kill link 27/37. L10 medic == F0 byte-identical.
- The coordinator appended its 6 findings to sim-findings.md.
- Evidence: `evidence/2026-11-09/sim-midfifth-c-b.md`.

2130Z claim retired to `.DEAD` + `.DEAD.note` at 2026-11-10T00:54Z (all three arms resolved: honeststakes landed by 2130Z itself as `f74ad158d`; foodrung + midfifth landed by this run).

## Failed-merge incident + recovery (lesson — also added to ~/AGENTS.md)

First midfifth merge attempt failed: master had moved to `4abe40a10` (journey-landing r122 landed by the playtest loop) between rebase (onto `fb9dd2be0`) and merge; ff-only refused ("Diverging branches can't be fast-forwarded"). My command piped the merge through `head -4` (masked exit code as 0) and chained release steps with `;`, so `worktree-release.sh` ran anyway ("released as done-merged"), `git worktree remove --force` deleted the worktree, and the registry entry was deleted — while the branch was UNMERGED. `git branch -d` correctly refused ("not fully merged"), saving the branch (`af0b037bf`).

Recovery: re-registered the kept branch via `worktree-register.sh` (~3 min), rebased onto explicit master `4abe40a10` (new tip `a64d6e91a`), re-ran proof 142/142, merged with `&&` chaining and direct exit code, verified with `git merge-base --is-ancestor`, then released.

**Lesson:** never pipe `git merge --ff-only` through head; never chain release steps after a merge with `;` — use `&&` and check the merge exit code directly; verify branch-is-ancestor before releasing. The vetfinish landing followed this lesson (merge exit 0, ancestor verified, then released).

## Infrastructure notes

- EPERM flap 22:36–23:16Z (see stale-lock recovery above); cleared by 23:34Z.
- Worktree registration slowness ~3–7 min/tree (observed on the midfifth re-registration).
- Safe-commit index clobber hit on the vetfinish prereg commit; repaired from HEAD with `git ls-tree HEAD -r | git update-index --add --index-info`, status + diff clean, hash verified.
- VM/runtime restart mid-run killed the vetfinish driver after 7/8 seeds of the after-leg; resumed for the single missing seed under the driver's refuse-to-overwrite guard. No seed run twice; no file overwritten.
- `sim-ctraj-b` is unregistered + dirty + locked — NOT touched.
- Gate + telemetry: see below.

## Gate (merged master, `node scripts/check.js --quick`)

**296 passed, 4 failed in 344s** (gate exit 1 from the 4 failures) — exactly the standing profile: mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20-fixes. No new failures; nothing in this run's four landings (all zero src/js) moved the gate. Log: `evidence/2026-11-09/winnability-round-2330-gate.log`.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-09/perseed-vetfinish-b/*.json' --metrics national,table,wins,exiled` REFUSED — "refusing recorder-corpus input: all 16 --current rows carry top-level anchorCommit". Recorded as the result, same precedent as grind-a / finishersize-a / adopt-a. The baseline was NOT reseeded. (Same for standaccum / foodrung / midfifth corpora — DIAG recorder corpora are refused by design / not applicable.)

## Convergence state

- scale-onramp: **converging (NOT converged)**. National 0 and wins 0 everywhere on doorwalk legs by design (leg never walks a door). The vetfinish band moved the binding link: the field now finishes broken beasts (9 field kills vs 1 in November) and banks veterans (up to 3 living, readiness-5 held up to 35 days) — but converts none of it into wave-5 kills (0) or national climb. The chain binds past the veterans bar now: wave-5 facing + national/table.
- food-economy: **converging** (untouched; Loop A live).

## Handoff to next run

- Both of this run's arms are landed on master (`9058bb5db` vetfinish, `fb9dd2be0` standaccum); the two 2130Z adoptions are landed (`0b2e37220` foodrung, `a64d6e91a` midfifth). Nothing left in flight from this run. This run's claim file and lock are deleted at closeout.
- Next blanks, in order: (1) flee-repair build — still held, Steve call, branch sim-fleerepair-a; (2) standing accumulation — answered by standaccum-b (split; next: trust-growth + polity probe; veterans simultaneity; wave-5 facing instrument); (3) veterans-bar build arm — vetfinish outcome: FS engine-proven / field-unmeasurable, corrected metric (convertible conversion rate, GO ≥ 0.50) for any future re-judge; the new binding question is wave-5 facing / national after veterans bank; (4) sit-becomes-win Steve-call; (5) sweep table contract question (Steve-call); (6) capstone readiness; (7) trial-by-combat staging (Steve-call); (8) Binding-never-fires follow-up; (9) gating leg-4 recalibration (decision owed).
- New findings to watch: spear-in-ranged-slot (bow+ spear villagers lose the volley), volley-softened exclusion (design decision owed), driven-crossing candidate (needs its own prereg + sizing).
- Note for the next coordinator: the vetfinish evidence's rank fields are not comparable across masters (Standing ladder re-cut rank thresholds 2026-11-08); standing, kills, and survival are the comparable fields.
