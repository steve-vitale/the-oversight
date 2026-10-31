# journey-scale r61 — Lane A, leg 3 SCALE (2026-10-31)

**Run id:** oversight-playtest-loop-20261031T0643Z (scheduled 01:45 CDT 2026-10-31; lock created 06:43:32Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
Note on the repeated leg: r60's note promised the 3→0 write at its
closeout, but the rotation file still read 3 at this run's start.
Staying on scale is queue-correct under the body (play THIS run's
leg as read), not a silent repeat; the anomaly is recorded in the
prereg rather than assumed away.
**Base:** master@3c03d468b at worktree creation. **Zero src/js changed
by this run** — measurement plus one driver + two analyzers
(labels/EVIDIR only), and evidence.
**Pre-register:** evidence/2026-10-31/journey-scale-r61-prereg.md
(written and committed before any seed ran).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Heartbeat:** manual heartbeat at registration verified landed
  (06:44:52Z) plus a 10-minute background loop with its log in goal
  hidden_files (journey-scale-heartbeat.log).
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r56–r60: after a correct private-index commit, the
  worktree's main index showed all 3 committed files
  staged-as-deleted plus untracked. Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git
  status` empty, `git diff HEAD` empty, worktree hash-object == HEAD
  blob for all 3 files. The commit itself was correct (05f3dfe7).

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R61: FULL PARITY WITH r60 — 4/4 seeds, captures byte-identical
Same 4 seeds, control picker, policy scalecourt-nogate UNCHANGED,
DAYcap 180. Pilot gate passed (85001 ran clean, pilgrimages 4, not 0).

| seed | r60 | r61 | moved |
|---|---|---|---|
| 85001 | d135, died 0/0, GLOBAL nat77 glob92 court76, lesser arc4, deaths44, cov34/40/32, pilg4, fusion T, abil iron_stomach | IDENTICAL on every scalar | none |
| 85002 | d132, died 0/0, REGIONAL, lesser arc4, deaths62, cov 2, pilg54, fusion T, abil bloodhound/cornered_rat | IDENTICAL | none |
| 85003 | d134, died 1/1, regional, lesser arc4, deaths44, cov30/34/34, pilg6, fusion F, abil iron_stomach | IDENTICAL | none |
| 85004 | d178, died 0/0, regional nat94 glob117 court93, seat NONE arc3, deaths47, cov58/31/22, pilg5, fusion F, abil green_whisper/dowsing/echo_location | IDENTICAL | none |

Capture diffs vs r60: 0 lines on all four seeds. Every other
evidence dump identical too, except the trust/barrier dumps whose
only differing lines carry the r60→r61 driver filename (stack
paths); non-label changed lines: 0 on all four seeds (verified by
diffing the trust JSONs with label lines excluded).
Descriptive quad count, unchanged from r60: alive at end 0/4
(under the new split: DEAD 3/4 — 85001, 85002, 85004 — plus
SCATTERED 1/4 — 85003 ends over with 1/1 alive), global-final 1/4,
lesser seat waiting 3/4, full seat 0/4, wave 5 reached 0/4 (maxWave
4 on all four).
**Attribution:** the r60→r61 range's only src/js landing is the
deadfall duty (7d5281064) plus a version-bump build.js change.
On this quad it moves NOTHING — and the reason is measured, not
assumed: the deadfall duty line ("gathers deadfall —") fires
**0 times on all four seeds**. The scalecourt/competent policy
path never assigns the new duty on this leg, so parity is
explained, not just observed. That does not clear deadfall in
general (its own lane's policy assigns it); it says the duty is
inert on the scale leg's policy path. The "deadfall" hits that DO
appear in the captures (1/2/6/23 lines by seed) are all pre-existing
prose — forest deadfall, foraging "gather deadfall: branches" —
identical to r60, not the duty.

### 2. FETCH-MECHANISM (r60 open item, re-read — NO new seeds): ANSWERED IN THE NEGATIVE + A NEW LEAD
Re-read of r60's wide-band evidence (85101–85108, current vs
nofetch; analyzer scripts/analyze-fetch-mechanism-r61-20261031.js,
output journey-scale-r61-fetch-mechanism.txt). End states under the
new ALIVE / SCATTERED / DEAD split:

| seed | current | nofetch |
|---|---|---|
| 85101 | ALIVE d181, 5/5, lesser arc4 | ALIVE d181, 4/4, NONE arc3 |
| 85102 | ALIVE d181, 6/6, lesser arc4 | ALIVE d181, 10/10, NONE arc3 |
| 85103 | DEAD d167, 0/0, lesser arc4 | ALIVE d181, 3/3, lesser arc3 |
| 85104 | ALIVE d180, 9/9, lesser arc4 | SCATTERED d131, 7/7, lesser arc4 |
| 85105 | ALIVE d181, 3/3, lesser arc4 | SCATTERED d124, 1/1, NONE arc3 |
| 85106 | SCATTERED d158, 1/1, lesser arc4 | ALIVE d181, 9/9, NONE arc3 |
| 85107 | ALIVE d181, 8/8, NONE arc3 | SCATTERED d136, 5/5, NONE arc3 |
| 85108 | ALIVE d181, 10/10, lesser arc4 | SCATTERED d160, 7/8, NONE arc3 |

Counts under the new split: current ALIVE 6/8, SCATTERED 1/8, DEAD
1/8, lesser 7/8; nofetch ALIVE 4/8, SCATTERED 4/8, DEAD 0/8, lesser
2/8. The refinement matters: nofetch's four non-alive arms are ALL
scatters with survivors, not wipes — on this band the fetch's
absence scatters villages rather than killing them outright.
Per-seed deciding breaks (final-20-day deaths + final-30-day pantry):
- 85101: seat-only divergence (both ALIVE; nofetch pantry actually
  healthier — 3,796 vs 0 — yet arc3 vs arc4).
- 85102: seat-only divergence (both ALIVE; nofetch far richer —
  53,606 vs 9,302 kcal, 10/10 vs 6/6 — yet arc3 vs arc4).
- 85103: wild-death cluster kills current (8 wild in final 20,
  five on d164–165) vs nofetch ALIVE.
- 85104: monster/wild cluster scatters nofetch (5 monster + 4 wild
  in final 20, pantry zero + hungryDays 4) vs current ALIVE.
- 85105: starvation scatter in nofetch (4 starvation + 1 thirst in
  final 20, 11 zero-pantry days, 9 hungry days) vs current ALIVE.
- 85106: wild-death cluster scatters current (10 wild in final 20,
  20 final deaths vs nofetch's 0) vs nofetch ALIVE on 21,933 kcal.
- 85107: starvation/sickness scatter in nofetch (3 starvation + 2
  sickness, 4 zero-pantry days) vs current ALIVE.
- 85108: combat cluster + pantry collapse scatters nofetch (6 combat
  in final 20, 19 zero-pantry days, 9 hungry days) vs current ALIVE.
**Verdict:** there is NO single fetch chain. The deciding breaks
split three ways — late death cluster (85103, 85104, 85106, 85108),
starvation collapse (85105, 85107), seat-only with no survival break
(85101, 85102) — and the clusters strike EITHER arm by seed. That
is the mechanism answer in the negative: the day-1 fetch does not
act through one named fight, item, or pantry event; divergences
resolve through the game's generic late-cluster lottery, in either
direction. Counting more bands would only re-roll that lottery.
**The new lead, stated not solved:** nofetch sits at arc 3 on 7/8
seeds while current sits at arc 4 on 7/8 — and on 85101/85102 the
nofetch village is ALIVE with equal-or-better pantry and population
yet still arc-lagged. Arc progression is lagging in nofetch
independently of survival. What links day-1 gear to arc progress is
NOT named by this trace (pilgrimages do not explain it — nofetch
pilgrimages run higher on 85103 and 85106) and is the next run's
question, not this run's claim. No fix landing follows from this
re-read alone.

### 3. PEOPLE CHECK (sense law — all 8 Q1 quad transcripts read in full)
Transcripts are byte-identical to r60's (0 diff lines on all 8), as
expected from identical captures. Verdict unchanged from r60: 6 of 8
fully real, 2 blemishes (same classes as r58–r60, not new breaks).
No fabricated shared history, no static menus, no filler loops
except the Meera tail noted below.
- **85001 d90 Irving (displacement class, reproduced):** goal-thread
  opener ("I keep their faces in my head like photographs"),
  pending betrayal invitation owns the turn-0 menu, seeded
  ask_favor stays stage 0 at pre-close. Known one-sitting-only
  (r58 Q2) — not a new bug.
- **85001 d120 Irving:** fresh ask_favor surfaces, commits ("I'll
  come back to help"), stage 1→3, ends resolved ("I won't forget
  who fed me").
- **85002 d120 Sanne:** seeded favor surfaces, commits, stage 2→3,
  ends resolved.
- **85002 d90 Jian:** legacy goal thread, coherent throughout,
  field lesson ("Saw things with too many joints. Give them room"),
  ends planting ("Someday kids will sit by a fire and hear what I
  did").
- **85003 d120 Thabo (blemish, r58–r60 class recurs):** withdrawal-
  only talk — opener withdraws the want, only moves are goon/
  subject/leave, goon returns a generic line ("You can feel the
  history in how they greet you"). Thin, not broken.
- **85003 d90 Henry:** belief question engages honestly, player's
  answer lands ("That's not naive. That's load-bearing"), Henry's
  breakfast belief resolves it.
- **85004 d120 Meera (partial blemish):** grief opening is real,
  comfort engages and resolves — but the gossip tail drifts generic
  ("Word is you told it straight", "Word is you know what you're
  doing out there"). Opening real, tail filler.
- **85004 d90 Marisol:** favor engages with specific place and time
  ("Where the muscadine grapes grows thick, at sunup. Pack and
  knife. We travel light"), commits, stage 1→3. The leg's best
  example of a want with a concrete plan.
**Village assessment, plain words:** the four old villages end
exactly where r60 left them — three wiped out, one scattered down
to a single person, the lesser seat waiting on three, the full seat
never priced, wave 5 never met. The eight fresh villages from r60's
wide band, re-read here, tell the fuller story: the current-policy
villages mostly survive to the cap with full pantries and hold the
lesser seat — but the nofetch twins scatter with survivors still
standing, and nobody anywhere reaches global, takes the full seat,
or meets wave 5. The climb's machinery works and villages survive
it; the top of the climb is still unreached in every arm of this run.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: the climb's machinery fires (courts, covenants,
  pilgrimages, national standing) and survival-to-cap is common —
  but the new deadfall duty never fires on this leg's policy path,
  so a real player following this competent line would never meet
  the new gathering duty at all in the scale window. That is a
  reachability note for deadfall's own lane, not a scale-leg bug.
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing, and Marisol's muscadine
  plan plus Henry's breakfast belief are the kind of specific,
  human talk that carries a long run. The thin spots are Thabo's
  withdrawal-only talk and Meera's gossip tail — blemishes, not
  breaks.
- WINNABLE: not shown, again. The lesser seat waits on 3/4 old seeds
  and 7/8 fresh current seeds; the full seat stays unwon (w5 0 in
  every arm, maxWave 4 at best). Survival is no longer the binding
  constraint on this band — reaching wave 5 and pricing the full
  seat is, with the nofetch arc lag as the newest unexplained
  drag on the climb.

## TABLE-APPROACH (standing, report-only)
Current quad, end state: 85001 lesser arc4 waiting+announced;
85002 lesser arc4 waiting+announced; 85003 lesser arc4
waiting+announced; 85004 seat NONE arc3, never waiting/announced.
Identical to r60. Fresh-band re-read: current lesser arc4 on 7/8
(all but 85107, seat NONE arc3); nofetch lesser on only 2/8, arc 3
on 7/8 — the arc lag, not survival, is what separates the arms on
the seat story.

## BARRIER PIN (standing instrument, re-confirmed)
Barrier-dump line counts per Q1 seed: 85001: 1, 85002: 2, 85003: 1,
85004: 1 — identical to r60's dumps. No new guard-break signal.
The pin stands in its r55 form; it does not overturn.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores),
  plus the r61 end-state class (ALIVE / SCATTERED / DEAD) and the
  deadfall-duty line count.
- r60's PARITY verdict is EXTENDED, not re-scored: r61 shows full
  parity with r60 under the same fixed rule, including 0-line
  capture diffs on all four seeds and 0 non-label changed lines in
  the trust JSONs, so the r60 fate is stable across the deadfall
  range. No scalar was re-scored against a friendlier metric.
- The new end-state split (prereg decision, applied to r61's own
  arms and descriptively to the r60 wide-band re-read) does not
  change r60's wide-band verdict: current ALIVE 6/8 and nofetch
  ALIVE 4/8 are the same counts r60 reported as alive-at-cap; the
  split only refines nofetch's non-alive arms from "not alive" to
  "scattered with survivors" (4/4 of them).
- The Q2 verdict rule is applied as written with one disclosed
  judgment: the generic late-cluster class does reach 4/8 seeds,
  but it strikes either arm and names no fetch link, so it is
  reported as the negative answer (no single fetch chain) rather
  than dressed up as a fetch mechanism. The counts are printed
  above so the next run can judge the call.
- r58's Irving-displacement answer STANDS (one-sitting-only; the
  d90 displacement transcript recurs here byte-identical, and the
  d120 favor commits as r58's Q2 predicted). r58's subject-menu
  correction STANDS unre-tested (no subject-first arm here). r58's
  Boris nod-loop stands UNRE-TESTED (no Boris transcript arose).
  r56's chooseAbility-unguarded note stands (no duplicate ability
  id in any control seed's abilitiesHeld — all lists distinct).
  r52's barrier pin stands in its r55 form (see above).
- No metric was re-scored mid-run. One metric observation for the
  NEXT run: the nofetch arc lag (arc3 on 7/8 vs current arc4 on
  7/8, surviving nofetch villages included) needs a definition
  before it is scored — is arc lag a progression failure, a
  pacing difference, or an artifact of the tableWatch arc read?
  Name the arc-gate check (which arc-4 condition fails, and when)
  in the next prereg before scoring it.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-10-31/journey-scale-r61/journey-scale-r61-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ quiet (4 files, 5 metrics, no large deviations), exit 0. Expected:
the current quad is scalar-identical to r60, the baseline's source
lineage. Baseline NOT rolled on this run's numbers (prereg said so).

## Tests
- `node --check` clean on the r61 driver, r61 analyzer, and fetch
  analyzer (at creation).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **284 passed, 6 failed in 467s** (290 scripts, exit 1 from the
  failures).
- The 6 are EXACTLY r57–r60's 6 pre-existing assertion-failure
  scripts, same families, same signatures —
  measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof, and
  the establishment-r20 family
  (test-establishment-r20-fixes-20261020.js: "NEW: next day voices
  once more (gate resets daily): expected 2, got 1"). No quick-list
  test imports this run's scripts, and this run's change set is
  driver + analyzers + evidence with ZERO src/js, so it cannot have
  caused any of the 6.
- Suite side effect, checked not assumed: the suite left NO
  non-evidence modification (`git status` after the suite shows only
  this run's evidence entries) — no ONTOLOGY.md revert was needed.
- Zero src/js changes, so no game-code regression surface exists
  in this run's change set; the suite above is the standing proof,
  not a response to a suspected regression.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
Master at worktree creation: 3c03d468b. (Merge/rebase path filled at
closeout.) Merged locally, pending ship (no bump, no push, no live
verify — ship loop owns those).

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 467s**.
The 6 are EXACTLY r57–r60's 6 pre-existing assertion-failure scripts,
same families, same signatures — measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, and the establishment-r20 family.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries (run note
+ evidence dir + fetch analyzer + checkquick log).

## TELEMETRY (filled at closeout)
Quiet, no LOUD lines (see Telemetry section above). Baseline NOT rolled.
