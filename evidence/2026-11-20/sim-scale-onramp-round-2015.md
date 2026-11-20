# Loop A lever round fleshout-20261120T2015Z — scale on-ramp: raid-defender draft, ammo, lend fix

- Run: Loop A `fleshout-20261120T2015Z`, axis scale-onramp. Claim: `lever-claims/fleshout-20261120T2015Z.json` (arms raiddef / ammo / lendfix).
- Adoption: the round timed out before closeout. Coordinator dead (no WT_RUN_ID processes, lock run_id `fleshout-20261120T2015Z` matched); all three arm workers dead at adoption start (heartbeats stale; no node/python sim processes). The adoption finished all three arms, verified every claim against git/files, and closed the round out. Master tip at closeout: `37f01cb32`.
- Flap probe at adoption start (22:21 UTC): fresh-file writes in /tmp and home + git update-ref all OK — flap quiet.

## Verdicts

| Arm | Verdict | Disposition | Merge |
|---|---|---|---|
| sim-raiddef-a (finding #2599 contact; answer filed as #2631) | NO-GO — PARTICIPATION (POOL), kill class SUBSTRATE-MISSING | Lever reverted; instrument + evidence only | `a5e7e55d9` |
| sim-ammo-a (finding #2590, ammo first) | NO-GO — primary 1/6 = 0.167 vs 0.50 bar | Lever + DEPMAT/ROLL35 substrate reverted; instrument + evidence only | `8ca5da828` |
| sim-lendfix-a (findings #2629 + #2628) | GO — all three frozen bars hold | Fix + counter land env-gated OFF; no lend re-test, no switch-on | `37f01cb32` |

No push, no version bump, no live verification — merged locally, pending ship.

## sim-raiddef-a — NO-GO PARTICIPATION (POOL)

The rule (draft an armed searcaster holder first at raid defense) works in fixtures (28/28 pre-revert: holder drafted first, live armed volley fired) but never fired in 16 runs: **0 searcaster holders on plain master** — 0 grants in 164 contest prizes, 0 kill-loot drops, 0 corpse-takes in 480 takes, 0 holder-days on the daily census, 0 eligible holders at all 84 raid events. One fusion cell was granted — a cell with no gun. Legs byte-identical 8/8. Guardrails pass vacuously. Panel `review_required` (unobserved table rows, not a movement signal). Evidence `evidence/2026-11-20/sim-raiddef-a.md`. Proofs re-run on the rebased tip: test-raiddef-a 19/28 post-revert (9 fails all lever-dependent by design), analyzer selftest 53/53. 0 src/js changes vs master.

Finding filed: **#2631 — THE GUN NEVER REACHES A VILLAGER ON PLAIN MASTER.** Next arm on this chain is a supply question, not another holder-behavior question. (Numbering correction: the round brief called this arm "#2639"; no #2639 entry exists in `sim-findings.md` or the arm evidence — the raid-defender question's finding is #2631, filed by the arm.)

## sim-ammo-a — NO-GO (primary 1/6)

The served-bow 60% arrow craft at departure works at the trailhead — 10 served-rate picks (6 crafted / 4 failed) vs 0 ctl, served-with-ammo 4/12 → 6/12, mean arrows 1.67 → 2.50 — but the primary fails **1/6 = 0.167 vs the 0.50 bar**: the 6 primary meetings are byte-identical both legs, and no quivered served fight is attributable to the lever (Vasyl 107074 d73 crafted at the blind 35% on ctl too; the two flipped departures never reached a wave-4+ engaged fight with their arrows — Katarina's d88 meeting doesn't exist on the arm, gen_iq204w4 evaded carrying 4 arrows). **Binding constraint is fiber supply, not the roll**: Lelisa (107075) fought 5 times with an empty bow because pile fiber was 0 on day 96 and still 0 on day 101; no-mats fires 17×/leg, fiber 0 on 20 rows/leg. Broader population 2/9 = 0.222 — verdict robust to the definition. Bars: pool 6 PASS, attributable-served 4 (ctl 5) PASS, secondary 1 volley PASS, guardrails PASS (starvation 1=1, median 150=150d). Seed 107077's village was lost on the arm (d131, RNG divergence after the day-10/11 craft flips — named, not hidden). Evidence `evidence/2026-11-20/sim-ammo-a.md`. Proofs at anchor: 52/52, 43/43, 41/41, 26/26, 31/31, 58/58, 19/19, selftest 75/75. Post-revert, re-run on the rebased tip: ammo 24/52, depmat 22/43, roll35 14/41 (all fails lever-dependent by design), spearstage 26/26, speargate 31/31, bowcraft 58/58, bowknow 19/19, selftest 75/75. 0 src/js changes vs master.

Finding #2590 stays OPEN on the serve half (update appended this adoption). Next levers, in order: (1) fiber supply; (2) evade-on-a-served-quivered-bow. Do NOT re-test the roll or knowledge seeding.

## sim-lendfix-a — GO

All three frozen bars hold. **(1) Fixture proof:** `test-lendfix-a.js` 42/42 — the gun returns as the same entry object + unspent lent cells, re-seated, in 3/3 real-fight cases (borrower dies round 1 / dies mid-fight / survives), encounter-gear fixtures. **(2) Regression:** `test-lend-a.js` 41/41, `test-gunrate-a.js` 39/39, `test-cellgate-a.js` 12/12. **(3) Guardrail:** ctl/fix corpora byte-identical on all simulation fields except `v4lendPool` + metadata, 8/8 seeds, `v4lends` 0 both legs. Analyzer selftest 69/69 (after the adoption instrument fix, §9). Draw-neutrality holds (the one added `Math.random` line is comment-only).

**Mechanism correction:** the prereg said the field engine strips a dead fighter's equipped weapon mid-fight. The fix's probe found the engine never strips it — the gun stays in the dead borrower's items; the lend-a sink was the return looking through roster reads, which go blind the moment the borrower leaves the roster. The fix looks the borrower up directly (getPerson, dead or alive), recovers by entry identity from pack / equipped slots / corpse list, removes first so it can never duplicate, and re-seats both fighters.

**The pool finding — 0 lendable moments on all 8 seeds** (0 gun, 0 cells; 0 tile, 0 adjacent; 0 distinct fights). The counter ran and reported (`v4lendPool: []` on all 8 fix corpora; proven in fixtures). Guns ARE in the world (4 searcaster grants/leg, holder-days 87, 20 armed entries, 449 pool-holder-present ticks) but a lendable moment never lines up. The next lend re-test prices its participation floor from **0**, not from the presence band — and must first answer why holders never stand in earshot of an unarmed lead. Evidence `evidence/2026-11-20/sim-lendfix-a.md`.

Findings: **#2629 FIXED** (return proven); **#2628 stays OPEN** (pool measured at 0).

## Wall numbers (round)

| | raiddef (107061–107068) | ammo (107071–107078) | lendfix (107081–107088) |
|---|---|---|---|
| national / table / wins | 0 / 0 / 0 | 0 / 0 / 0 | not instrumented (null) / 0 wins |
| wave-4 unlocked | 8/8 | 8/8 | 8/8 |
| wave-5 unlocked | 4/8 | 3 ctl / 4 arm | 6/8 both legs |
| median survival | 150d | 150d both legs | 150d both legs |
| survived | — (community lost 3/8) | 8/8 ctl, 7/8 arm (107077 lost d131) | 6/8 both legs |

Winnability chain: converging, NOT converged. Wins 0, national 0, table 0 on every judged band this round.

## Telemetry

`telemetry-check.js` with the ABSOLUTE baseline path (`goal hidden_files/telemetry-baselines/scale-wall.json`, `--metrics national,table,wins,exiled --sweep-rows`) refused all three arms' corpora with exit 2 — designed refusal: recorder-corpus input (all 8 rows carry top-level `anchorCommit`). Same as the 1705Z and 1830Z adoptions. **No LOUD lines, no baseline rolled.** (Had it proceeded, the baseline's own `_regime` note forbids comparing these pre-seat substrates — wins are structurally ~0 there — so any LOUD would have been a regime artifact.)

## Gate

**No fresh full `check.js` on the merged tip.** Two sibling gates were running at closeout (journey-endgame-r259 and journey-establishment-r246, both started 23:09Z); the discipline forbids a third concurrent run. Arm proofs were re-run green on each rebased tip (raiddef post-revert record, ammo post-revert record, lendfix 42/42 + 41/41 + 39/39 + 12/12 + selftest 69/69). The ship loop's gate covers the merge before any push.

## Adoption repairs (all verified against git/files)

1. **Lendfix control leg was 7/8 seeds** — the worker's ctl sweep never ran 107088. A single-seed repair reproduced the corpus but reset the process-persistent `seq` counter (fix 12959–13735 vs ctl 1–777; 925 seq-only diffs). The full 8-seed ctl leg was re-run in one process into a temp dir: the 7 regenerated files are **byte-identical to the worker's** (md5 OK 7/7) and the regenerated 107088 carries the fix leg's exact seqs; copied into the real ctl dir, temp dir removed. Lesson: `seq` is a process-global write counter — a paired leg must be re-run whole, never one seed.
2. **Lendfix guardrail as written could never pass a two-driver pair** — `grantEvents[].frame` / `v4seeds[].caller` embed the driver's own file:line (lend-driver-a.js:1268 vs lendfix-driver-a.js:1330). Instrument fix in `firstDiff`: normalize the driver `file:line:col` out of string comparisons; any other difference still fails. Selftest 67 → 69 (two new cases). Original failed output preserved in `sim-lendfix-a.md` §9.
3. **Ammo safe-commit refusal** — the revert commit deletes 77 src lines, tripping the stale-tree-revert guard. Verified the staged `game.js` hash equals master's blob exactly (the 77 lines are the branch's own lever code, nothing else); adoption coordinator approved `--force-delete` (flag precedes the message, per the parser).
4. **Rebase stop-at-pick quirk** struck on the lendfix rebase (pick `e3e9872ce` in both done and todo lists, worktree clean, pick unapplied — verified via `git diff <pick>` and the absent evidence file); recovered with `GIT_EDITOR=true git rebase --continue`, per AGENTS.md.
5. **Safe-commit index clobber** struck on every commit this adoption (raiddef ×2, ammo, lendfix) — repaired each time via `git ls-tree -r HEAD | git update-index --add --index-info`, hash-verified.

## Findings-file updates (this adoption)

- #2631 filed (raiddef; already in place from the arm).
- #2590: ammo UPDATE appended (NO-GO 1/6; fiber binds; evade next).
- #2629: marked [fixed], lendfix UPDATE appended (return proven 42/42; mechanism corrected).
- #2628: lendfix UPDATE appended (pool measured at 0 on 8 seeds).
- Pre-existing gap flagged, not reconstructed: the roll35 (1705Z) and evade-a (1315Z/1515Z) updates to #2590 are still missing from the findings file — their evidence is on master (`2d12ced4a`, `85115230d`).

## Next blanks (Loop A, in order)

1. **#2590** — fiber supply first, then evade-on-a-served-quivered-bow. Do NOT re-test the roll or knowledge seeding.
2. **#2628 / #2629** — the lend re-test prices from the 0-moment pool; first answer why holders never stand in earshot of an unarmed lead.
3. **#2631 / #2599** — next arm on the gun chain is a SUPPLY question (how a gun reaches a villager on plain master), not another holder-behavior question.
4. **#2605** — the 4th-band screen has since LANDED via Loop B (sim-strikeband4-b, 106241–106248, NO-GO: 7 launches, 3 first-fights); the damage question's next move belongs to the launch engine, not a fifth band.
5. **#2626** — still OPEN (targetless fix HELD at `b7a6c1ac9`, reseed HELD at `0f34690b7`).

## Closeout

- Worktrees released done-merged, removed, branches deleted: sim-raiddef-a, sim-ammo-a, sim-lendfix-a (all verified gone).
- Claim + `fleshout-loop.lock` deleted last on run_id match (`fleshout-20261120T2015Z`).
- Convergence tracker updated (scale-onramp line + review note); memory note appended; goal tracking entry added.
