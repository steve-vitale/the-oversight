# Loop B run fleshout-loop-b-20261105T0430Z — coordinator evidence (winnability chain, second-killer production)

Axis: winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5 facing → full seat).
Arm: sim-secondkiller-b — DIAG instrument, zero src/js, instrument-only.
Worker commits (rebased onto master 4c259a277, proof 21/21 re-run green after each rebase, merged ff-only): f5505d324 prereg, 6327a4aed instrument/driver/analyzer/proof, baac6ead1 judged corpus + evidence.
Arm evidence: evidence/2026-11-05/sim-secondkiller-b.md (+ prereg evidence/2026-11-05/sim-secondkiller-b-prereg.md). Corpus: evidence/2026-11-05/perseed-secondkiller-b/ (8 files, 0 instrument errors).

## Pre-registration (committed before any judged sim)
Fresh band 99151–99158, competent policy verbatim, 150d death-aware horizon. Primary metric: wave-4 kill rate per wild wave-4 fight, split by (a) first killer alive at fight start vs not, (b) party size, (c) a would-be second killer present vs absent. Per fight also: gear tier, abilities used, swings attempted, damage vs monster HP, ending, killer identity/first-kill flag, days since first blood. Verdict rule: a ranked cause table (production vs finishing vs exposure), not a GO/NO-GO on a lever.

## Verdict — DIAG: finishing binds (judged strictly against the prereg)
1. **Finishing binds.** 3 kills in 58 wild wave-4 fights (5.2%), every kill a first blood; after first blood, 0 kills in 19 fights. Villager field fights: 0 kills in 30, median 2.7% of monster HP dealt in 2–3 rounds before fleeing (18) or dying (11), even when a real ally joined (16/30). Scholar turn-based fights: 3 kills in 28, but 24 end in the scholar's death, median ~20% of monster HP dealt.
2. **Production refuted as defined.** A would-be second killer is present in 58/58 fights (corrected from 41/58: solo scholar fights were miscoded absent because the scholar's fight entry carries no villagerId). Meeting monsters is not the problem.
3. **Exposure/rotation not shown.** Kill rate 0/1 with a living first killer vs 0/18 with a dead one — no contrast to claim, because only 1 of 58 fights happened while a first killer lived: 2 of the 3 killers died within a day of first blood (Boris 99154, contest death the next day; Marcus 99157, arena death the same day). Only Sigrun lived. The alive window is usually 0–1 days long.

## Wall numbers (this corpus, 8 seeds)
Wins 0/8, national 0/8, table 0/8, wave-4 unlocks 5/8, wave-4 faced 5/8, wave-5 unlocks 0/8, wave-5 faced 0/8, median survival 89.5d (all 8 villages lost; 3 seeds never faced wave 4).

## Sense-testing
Seed 99154 days 79–82 read coherently (deaths, graves, keepsakes buried, succession speeches; Boris's contest death the day after his kill lands as consequence). One flag appended to the findings backlog: the Strike's SHUTDOWN beat repeats verbatim a dozen times across seed 99157's 71-round kill fight — robotic narration.

## Disclosures (from the arm evidence)
Two post-corpus corrections, both in the evidence file: kill matching is now strict (killer must be among the fight's fighters; the first pass misattributed 99154's kill to another scholar's losing fight the same day; all 3 kills still match, 0 unmatched, overall rate unchanged) and the TB second-candidate flag was corrected as above. Gear armor is void in the judged corpus (armor lives in torso/legs/shoes slots, not an `armor` slot — fixed post-corpus, corpus not re-run for that secondary field; weapon bonuses stand).

## Telemetry deviation check (§10 loop-body step)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-05/perseed-secondkiller-b/*.json' --metrics national,table,wins,exiled` REFUSES recorder corpora by design ("all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs"). No LOUD line exists to investigate; wall numbers are reported directly above instead of via a forced flag. Baseline NOT rolled.

## Infrastructure
Worktree registration took ~9 min (huge evidence checkout); one ff-only merge failed because local master had moved under the rebase (journey deepening r103 landings) — rebased onto local master 4c259a277, proof re-run 21/21 green, merged clean. Safe-commit index clobber hit all three worker commits; repaired each time via HEAD-blob cacheinfo, commits verified correct. Held work NOT touched: sim-triggerbuild-b (uncommitted trigger build), sim-fleerepair-a (Loop A branch). Main tree clean at closeout.

## Next blanks, in order
(1) A finishing probe/build — test a hold-ground / focus-fire / staying-power lever on the same band family with kill conversion as primary, gates and prices untouched. (2) Post-blood contest/arena deaths emptying the alive window. (3) Carried: standing accumulation part 3 — the flat-20-while-dying mechanism (99145); arm-2 toggle pinned at r118's exact base (calibration failure on current master, toggle-b.md); veteran-word collision naming; wave5faced label rename.
No gate/price/deed arm follows. scale-onramp stays converging (NOT converged): full seat still unwon, wave-5 kills still 0, readiness-5-ready days still 0/8.

Merged locally, pending ship. Claim deleted; lock deleted at closeout.
