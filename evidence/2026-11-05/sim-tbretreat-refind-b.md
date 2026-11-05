# TB retreat-and-refind — PILOT (arm sim-tbretreat-refind-b)

Run: fleshout-loop-b-20261105T1830Z. Axis: scale-onramp / winnability
chain (wild ally-join → wave-4 kills → veterans → readiness-5 release
→ wave-5 facing → full seat). Tracker's next blank (#2 from the 1322Z
run, sim-grindfinish-b): the grind step's price — a TB fight ends
death-or-win, so every grind step costs a scholar's life.

POLICY-SIDE ONLY. Zero src/js changes, zero default flips, no existing
policy file touched. The variant is `scripts/policies/tbretreat-refind.js`
(a competent wrapper: earlier 75/75 retreat trigger, havenward frozen
direction, persistent chase — see the prereg for the frozen shape).

## Verdict: GO (pilot)

All four pre-registered gates hold on the full 16-seed pilot band, and
the denominator guard is cleared (15 trigger fires, exactly at the
15-fire threshold). A confirm on 12–16 FRESH seeds is the next run's
job, not this one — the pilot GO earns a confirm, it is not a confirm.

| Gate | Bar | Result | Holds |
|---|---|---|---|
| G1 (primary) retreat survival | exits / trigger fires ≥ 25% | **6 / 15 = 40.0%** | YES |
| G2 (primary) TB-fight survival | armed > baseline | **18.2% vs 15.0%** | YES |
| G3 (guard) kill rate not halved | armed ≥ ½ baseline | **5.4% vs 9.0%, ratio 0.60×** | YES (margin 0.10×) |
| G4 (guard) survival not harmed | armed median ≥ 0.8× baseline | **86.5d vs 86.5d, 1.0×** | YES |
| Denominator guard | fires ≥ 15 or THIN | **15 fires** | cleared (exactly) |

The sibling game-code arm (sim-tbretreat-b confirm, 12 seeds) NO-GO'd
at G1 10.2% (5/49) with 22 sealed fallbacks vs 5 exits. This policy
arm's G1 is 40.0% (6/15) with **zero** sealed fallbacks — the retreat
happens four times as often, and the barrier is never the reason it
fails. The exit rate is the verdict the sibling arm was missing; the
kill-rate guard is the margin to watch at confirm (0.60×, not a
comfortable pass).

## Before / after (16 seeds, bands 96811–96818 + 96821–96828, 150d)

| Measure | Baseline (competent verbatim) | Armed (tbretreat-refind) |
|---|---|---|
| Wave-4+ fights | 100 | 111 |
| Wave-4+ TB fights | 60 | 66 |
| TB deaths | 51 | 54 |
| TB kills (matched) | 8 | 4 |
| TB flees | 0 | 6 |
| TB survival (G2) | 9/60 = 15.0% | 12/66 = 18.2% |
| Field fights | 40 | 45 |
| Field kills (matched) | 1 | 2 |
| Field deaths | 11 | 15 |
| Field flees | 19 | 19 |
| Total matched kills | 9 | 6 |
| Wave-4+ kill rate (G3) | 9/100 = 9.0% | 6/111 = 5.4% |
| Median damage dealt (TB, frac of monster HP) | 0.094 | 0.083 |
| Median survival | 86.5d | 86.5d |
| Survived the 150d horizon | 1/16 | 3/16 |

Unmatched kills 0/0; instrument errors 0 in all 32 rows. Seeds with
0 trigger fires are byte-identical between legs (the policy never
fired, so the RNG stream never diverged) — 10 of 16 seeds identical.

The armed leg fought MORE wave-4 fights (111 vs 100) because retreated
fighters lived to fight again, and more villages survived the horizon
(3 vs 1: 96822 and 96825 armed-only, 96823 both legs). The cost is
concentrated in TB kills (8 → 4); field kills rose (1 → 2), so the
total kill loss is 9 → 6, inside the guard.

## The 15 trigger fires — full accounting

The trigger fires at scholar HP < 75% AND live wave-4+ monsters'
remaining HP > 75% (frozen prereg F1). Every fire is listed; the
numbers are policy-observed, not joined.

| Seed | Day | Monster | Turn | Scholar HP | Monster HP | Result |
|---|---|---|---|---|---|---|
| 96811 | 74 | reunion | 2 | 0.69 | 1.00 | exited-haven |
| 96811 | 94 | algorithm | 4 | 0.65 | 0.89 | exited-haven (1 crossing) |
| 96815 | 73 | reunion | 2 | 0.32 | 0.86 | haven-hold → died |
| 96815 | 85 | reunion | 3 | 0.64 | 0.97 | exited-haven |
| 96815 | 91 | reunion | 2 | 0.67 | 1.00 | open → died mid-retreat (7 rounds, 0 dmg) |
| 96815 | 100 | eater | 3 | 0.50 | 1.00 | open → died mid-retreat (22 rounds, 0 dmg) |
| 96815 | 111 | algorithm | 5 | 0.64 | 1.00 | exited-haven |
| 96815 | 139 | suburb | 6 | 0.71 | 0.83 | exited-haven |
| 96822 | 111 | reunion | 5 | 0.49 | 0.87 | open → died mid-retreat (6 rounds, 13% dmg, 1 crossing) |
| 96824 | 83 | reunion | 3 | 0.57 | 1.00 | haven-hold → died |
| 96824 | 83 | reunion | 3 | 0.49 | 0.94 | haven-hold → died |
| 96824 | 84 | reunion | 4 | 0.27 | 0.80 | haven-hold → died |
| 96825 | 123 | reunion | 4 | 0.55 | 0.93 | exited-haven |
| 96826 | 49 | algorithm | 4 | 0.73 | 0.90 | open → died mid-retreat (8 rounds, 16% dmg) |
| 96826 | 62 | reunion | 3 | 0.04 | 0.84 | haven-hold → died |

- **6 exited** (all exited-haven; 0 exited-gaveup).
- **5 haven-holds**: the trigger fired while the fighter stood ON the
  haven node, so there was nowhere to run to — they held and fought
  it out. All 5 died. These are counted in G1's denominator (they
  are trigger-fired fights, per the prereg). Excluding them, the exit
  rate on genuine retreat attempts is 6/10 = 60% — diagnostic, not
  the judged number.
- **4 open (died mid-retreat)**: the fighter died during the walk to
  the edge or on the new node after a crossing, before any exit.
  96822 d111 crossed once and died on the new node — the persistent
  chase ran and the fighter still died; the chase is not a guarantee.
  96815 d100 (the eater) lasted 22 rounds dealing no damage — the
  walk itself is the lethal part when the fighter cannot reach the
  edge.
- **9 of 15 fires ended in the fighter's death** (5 haven-hold + 4
  open). The analyzer's day+mid join reports 12 fired-deaths because
  3 same-day same-mid fights double-match (96815 d73 joined 2 fights;
  96824 d83 joined 3 fights across 2 events). The policy-observed
  count (9) is authoritative; the join is an approximation, disclosed
  here as in the 8-seed interim.

## Push-outcome classification — the sibling bucket, corrected

The sibling confirm's "22 sealed fallbacks vs 5 exits" is a
mislabelled bucket: staypolicy counts ANY push that does not end the
fight as a sealed fallback. This arm classifies every push at push
time:

| Outcome | Count |
|---|---|
| exited-haven | 6 |
| exited-gaveup | 0 |
| crossed (chase continues) | 2 |
| consumed — sealed | 0 |
| consumed — world-edge | 0 |
| consumed — blocked | 0 |
| stuck fallbacks | 0 |
| crossing caps (6) | 0 |
| suppressions (arena / noFlee / table-trial) | 5 |

**Zero consumed pushes in 15 fires.** The barrier was never sealed,
never at the world edge, never blocked. The havenward direction
(competent's own `chooseFleeDir`) plus the persistent chase
eliminated the sibling's entire "sealed" bucket. What kills a retreat
now is the WALK: fighters die en route to the edge (4 open) or are
already standing at home with nowhere to run (5 haven-holds).

The two crossings: 96811 d94 crossed once and then exited to Haven
(the persistent chase worked — see sense-testing); 96822 d111 crossed
once and died on the new node.

## Re-engagement (the refind half)

With the sibling's restore reverted, a fled beast melts — there is no
same-beast re-find. The refind half is re-engagement: the same
scholar faces a wave-4+ beast again within 7 days of an exit.

- **2 of 6 exits re-engaged within 7 days; 1 same-monster-kind.**
- 96811 d74 reunion → re-engaged day 80 (different kind).
- 96815 d85 reunion → re-engaged day 91, same kind (reunion), same
  fighter (gen_89r1y4e) — who fired the trigger again at 67% HP and
  died in 7 rounds dealing no damage.
- The other 4 exits did not re-engage within 7 days (96811 d94, 96815
  d111, 96815 d139 — the village died that day — 96825 d123).

The fighter who leaves lives to fight again about a third of the
time within a week. The other two-thirds, the retreat bought
life-days and later fights on other days, not a quick rematch.

## Per-seed table

Days / end / wave-4 fights / matched wave-4 kills / standing.

| Seed | Baseline | Armed |
|---|---|---|
| 96811 | 102 lost / 9 / 2 / 199 | 130 lost / 9 / 1 / 199 |
| 96812 | 87 lost / 14 / 1 / 135 | 87 lost / 14 / 1 / 135 (identical) |
| 96813 | 101 lost / 12 / 0 / 199 | 101 lost / 12 / 0 / 199 (identical) |
| 96814 | 53 lost / 0 / 0 / 100 | 53 lost / 0 / 0 / 100 (identical) |
| 96815 | 139 lost / 9 / 2 / 199 | 149 lost / 18 / 0 / 199 |
| 96816 | 61 lost / 0 / 0 / 25 | 61 lost / 0 / 0 / 25 (identical) |
| 96817 | 69 lost / 1 / 0 / 120 | 69 lost / 1 / 0 / 120 (identical) |
| 96818 | 46 lost / 0 / 0 / 25 | 46 lost / 0 / 0 / 25 (identical) |
| 96821 | 81 lost / 0 / 0 / 75 | 81 lost / 0 / 0 / 75 (identical) |
| 96822 | 125 lost / 13 / 0 / 199 | **150 survived** / 14 / 0 / 199 |
| 96823 | **150 survived** / 3 / 0 / 135 | **150 survived** / 3 / 0 / 135 (identical) |
| 96824 | 86 lost / 6 / 0 / 100 | 86 lost / 6 / 0 / 100 |
| 96825 | 132 lost / 10 / 1 / 199 | **150 survived** / 11 / 1 / 199 |
| 96826 | 114 lost / 15 / 1 / 199 | 114 lost / 15 / 1 / 199 |
| 96827 | 78 lost / 8 / 2 / 199 | 78 lost / 8 / 2 / 199 (identical) |
| 96828 | 72 lost / 0 / 0 / 99 | 72 lost / 0 / 0 / 99 (identical) |

96823 baseline SURVIVED the 150d horizon — the first survivor in
this pilot (both legs). 96822 and 96825 survived only on the armed
leg. 96815 is the swing seed: the armed leg fought twice as many
wave-4 fights (18 vs 9) and killed none (2 → 0) — the retreats kept
fighters alive to face more beasts, but the kills did not follow.

## Wall numbers

Per leg (16 rows each):

| Measure | Baseline | Armed |
|---|---|---|
| Wins | 0 | 0 |
| National / global | 0 | 0 |
| Table | 0 | 0 |
| Wave-4 unlocks | 12/16 | 12/16 |
| Wave-4 faced | 11/16 | 11/16 |
| Wave-5 unlocks | 0 | 0 |
| Wave-5 faced | 0 | 0 |
| Readiness-5-ready days | 0 | 0 |
| Median survival | 86.5d | 86.5d |
| Survived 150d | 1/16 | 3/16 |

Combined (32 rows): wave-4 unlocks 24, wave-4 faced 22, wave-5
unlocks 0, wave-5 faced 0, ready days 0, median 86.5d. The lever
moves survival per TB fight; it does not move the wall. No seed
banked a veteran, no seed released a ready force, no seed opened the
wave-5 door — the winnability chain past wave-4 kills is untouched
by this lever, as the prereg expected.

## Village assessment (plain words)

A fighter who is losing a fight against a wave-4 beast — hurt, and
barely scratching the thing — now turns and runs for home, and
two times in five they make it out alive. Before this lever, that
fighter simply died: the old policy fled too late, and the sibling
game-code arm showed the exit almost never happened at all. The
retreat works because the fighter picks the way home (not just the
nearest wall) and keeps running when the beast follows them through
the barrier, instead of giving up after one push.

What the retreat does NOT do: it does not win fights. The fighters
who run away come back and face fresh beasts, and they still mostly
lose — the village killed fewer wave-4 beasts with the lever on (6
instead of 9), though not few enough to fail the guard. Two more
villages lived to the end of the season with the lever on, and one
fighter went back to the same beast six days later and died trying
again. The lever buys lives and more chances, not victories. The
wall past wave 4 — veterans, the ready force, wave 5, the full seat
— did not move.

The remaining failure mode is the walk itself: a hurt fighter needs
several turns to reach the edge of the fighting ground while the
beast hits them, and four of the fifteen runners died on the way.
Five more were already standing at home when they decided to run —
there was nowhere to run to, and they died where they stood. Fixing
either of those is engine work (a faster breakaway, or a
home-ground advantage), not policy work.

## Sense-testing

Read from the transcripts (fightLines / deathSays in the per-seed
JSON), not just the counts.

**96811 day 94 — the chase, as the code-read predicted.** The say
lines tell it in order: "BARRIER CROSSED — you crash through to a
new area, but they're right behind you — through the barrier!" then
"The Loud-Eyes is flagging — it won't follow much further" then
"BARRIER CROSSED — you crash through into Haven. The gate shuts
behind you. The wild goes quiet." The monster followed across the
barrier, its persistence ran out between crossings, and the second
push reached home. The persistent chase (F3) is not a theory — it
is in the transcript, working exactly as the mechanism map said it
would. The fighter dealt 11% of the beast's health across 6 rounds
and walked out alive.

**96815 days 85–91 — the reunion, twice.** Day 85: the fighter
(gen_89r1y4e) retreated from the Reunion into Haven. Day 91: the
same fighter went back to the same kind of beast, fired the trigger
again at 67% HP, and died in 7 rounds dealing no damage. The death
notices read like a village burying someone it knew: "Declan
Curtin is dead — the wild. The village stops. Somebody screams.
Somebody else starts digging." ... "The village's quarrel was with
Declan — and Declan is dead. The sentence doesn't cross the grave."
... "At the grave, Tariq speaks for Meera." The retreat bought six
days and one more fight; the fighter chose to go back and died.
Coherent, human, sad — the lever's value is the extra life-days,
not a guaranteed second win.

**96815 day 100 — the eater.** 22 rounds, no damage dealt, died
mid-retreat. The transcript cannot tell us what the walk looked
like: the fightLines buffer is capped at 200 lines and this run's
sayCount is 14,691, so the late-run fight lines are gone. The
instrument record (22 rounds, 0 damage, 0 crossings, 0 consumed
pushes) stands, but the walk itself is not reconstructible from this
corpus — disclosed, not papered over.

**Say-line cross-check (all 16 armed files):** 4 barrier lines
survive the 200-line cap — 3 haven exits, 1 chase-continues — and
zero lines say the barrier held, was sealed, refused, or that the
known world ended. The push-outcome classification (0 sealed / 0
world-edge / 0 blocked) rests on push-time observation, not on say
lines, so the cap does not weaken it; the surviving lines
corroborate it and never contradict it. The d111, d139 and d123
exits' barrier lines fall past the cap and are not in the corpus.

## Metric review (the four prereg questions)

1. **Does the 25% G1 bar fit a retreat lever (it was set for a
   restore lever)?** The bar was the sibling's restore-lever bar,
   and this retreat-only lever cleared it at 40%. As a floor for
   "the exit happens", 25% is fair — but the denominator matters:
   5 of the 15 fires were haven-holds (the fighter already home),
   which are not failed exits. On genuine retreat attempts the rate
   is 6/10 = 60%. The judged number stays 6/15 per the prereg; the
   60% slice is diagnostic. A confirm should pre-register which
   denominator it judges — the prereg's or the attempts-only slice.
2. **Does the push-outcome classification match the say-line
   record?** Yes where say lines survive (4 barrier lines, all
   consistent; 0 sealed lines). The classification is push-time
   observation (node changed or not), so it does not depend on the
   say lines at all.
3. **Does 75/75 abandon winnable fights?** The trigger fires only
   when the monster is above 75% HP — the scholar has dealt little.
   Joined trigger fights dealt 0–16% of monster HP. The cost is
   real and visible: TB kills 8 → 4, kill-rate ratio 0.60× (the
   guard holds with 0.10 margin). The abandoned fights were losing
   fights by the trigger's own terms, and all 9 non-exit fires ended
   in death — but some of the baseline's 8 TB wins came from fights
   this trigger would have abandoned, and the per-seed divergence
   means we cannot name which. The lever trades kills for lives;
   the trade is inside the guard, barely.
4. **Is re-engagement-within-7d the right refind measure now the
   restore is gone, or does G2 alone close the refind half?**
   Re-engagement happened (2/6, 1 same-kind) and is worth reporting
   as description — the fighter did go back — but with no restore
   the beast is fresh, so "refind" is just "fought again", the same
   as any later fight. G2 (survival per TB fight) is the cleaner
   close of the refind half: the fighter lived to fight again. A
   confirm should keep re-engagement as a reported number, not a
   gate.

**Denominator note.** The 8-seed pilot read 62.5% G1 (5/8) and the
full 16-seed pilot reads 40.0% (6/15) — the same small-denominator
lesson the prereg warned about, in the other direction. The
extension band added 7 fires and only 1 exit. 15 fires is exactly
the pre-registered threshold, not a comfortable one; the confirm
must re-test the 40% on fresh seeds before anyone cites it as the
lever's rate.

## §15 / telemetry notes

- `scripts/balance-panel.js` takes no corpus input and offers no
  two-corpus comparison: it installs its own observer into fresh
  live sims under registered policies, and `tbretreat-refind` is
  not in its registry (`--help` errors requiring `--out
  <panel-directory>`). Running it would re-run different policies
  on different seeds. It was not run; no compare `.md` is
  fabricated. The analyzer's two-leg compare on identical seeds
  (`scripts/tbretreat-refind-analyze-20261105.js`, run saved to
  `/tmp/refind-analyze-16seed.json`) is the before/after
  instrument.
- Telemetry deviation check was attempted and refused, as the
  prereg anticipated:
  `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-05/perseed-tbretreat-refind-b/*.json'
  --metrics national,table,wins,exiled` →
  "telemetry-check: refusing recorder-corpus input: all 32
  --current rows carry top-level anchorCommit, so they are sweep
  recorder rows, not runs. Recorder corpora are compared with
  sweep-compare tables, never against a run baseline here."
  No workaround was attempted; the refusal is the result.

## Proof

`node scripts/test-tbretreat-refind-20261105.js` — **42/42 PASS**
(run twice; first run 38/42 exposed 4 issues, all fixed and
re-run green: wave-5 fixture mhp, sealed-guard first-fire-only,
analyzer w4-only fixture expectation). Fixture tests + instrument
smoke + analyzer fixtures + live harness smoke + off/on neutrality
+ variant-vs-baseline neutrality, all via /tmp, never into
evidence/.

## Base / branch note

Base is master 5ffbdaa1a as present in this worktree (journey-scale
r100). `git fetch origin master` failed at prereg time (connection
reset by peer); origin/master's last-known ref is 1a898136c
(batch-ship version bump 05d82de89-20261105-172446), and local HEAD
is NOT an ancestor of it — the worktree's local master has diverged
from origin/master. The coordinator owns landing and must
rebase/verify against a fresh origin/master at merge time; no
rebase was attempted here.

Corpus: `evidence/2026-11-05/perseed-tbretreat-refind-b/` (32 files:
16 seeds × 2 legs). Prereg:
`evidence/2026-11-05/sim-tbretreat-refind-b-prereg.md` (committed
before any judged sim). Policy:
`scripts/policies/tbretreat-refind.js`. Driver:
`scripts/tbretreat-refind-driver-20261105.js`. Analyzer:
`scripts/tbretreat-refind-analyze-20261105.js`. Proof:
`scripts/test-tbretreat-refind-20261105.js`.
