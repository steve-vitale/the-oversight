# journey-scale r60 — Lane A, leg 3 SCALE (2026-10-30)

**Run id:** oversight-playtest-loop-20261031T0243Z (scheduled 21:45 CDT 2026-10-30; lock created 02:43:32Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
Note on the repeated leg: r57, r58 and r59 all ran scale, and the
rotation file still read 3 at this run's start. Staying on scale is
queue-correct, not a silent repeat: r59 left two scale questions
explicitly open — a wider-band nofetch re-test plus a mechanism
trace for the day-1 gear fetch, and the w5-field vs maxWave
definition. Both are answered here.
**Base:** master@7a2974684 at worktree creation. **Zero src/js changed
by this run** — measurement plus one driver + one analyzer
(labels/EVIDIR only), and evidence. The Q2 fetch patch was temporary
and reverted (see Q2); no src/js survives in this run's change set.
**Pre-register:** evidence/2026-10-30/journey-scale-r60-prereg.md
(written and committed before any seed ran).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Heartbeat:** manual heartbeat at registration verified landed
  (02:45:42Z) plus a 10-minute background loop with its log in goal
  hidden_files (journey-scale-r60-heartbeat.log, survives /tmp wipes
  per the r59 lesson).
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r56/r57/r58/r59: after a correct private-index commit, the
  worktree's main index showed all 3 committed files
  staged-as-deleted plus untracked. Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git
  status` empty, `git diff HEAD` empty, worktree hash-object == HEAD
  blob for all 3 files. The commit itself was correct (63c4835).
- **Driver-copy discipline (r57 lesson) kept:** copies made with
  absolute worktree paths, verified 577 lines non-empty, `node
  --check` clean, zero remaining r59 labels in driver or analyzer.

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R60: FULL PARITY WITH r59 — 4/4 seeds, captures byte-identical
Same 4 seeds, control picker, policy scalecourt-nogate UNCHANGED,
DAYcap 180. Pilot gate passed (85001 ran clean, pilgrimages 4, not 0).

| seed | r59 | r60 | moved |
|---|---|---|---|
| 85001 | d135, died 0/0, GLOBAL nat77 glob92 court76, lesser arc4, deaths44, cov34/40/32, pilg4, fusion T, abil iron_stomach | IDENTICAL on every scalar | none |
| 85002 | d132, died 0/0, REGIONAL, lesser arc4, deaths62, cov 2, pilg54, fusion T, abil bloodhound/cornered_rat | IDENTICAL | none |
| 85003 | d134, died 1/1, regional, lesser arc4, deaths44, cov30/34/34, pilg6, fusion F, abil iron_stomach | IDENTICAL | none |
| 85004 | d178, died 0/0, regional nat94 glob117 court93, seat NONE arc3, deaths47, cov58/31/22, pilg5, fusion F, abil green_whisper/dowsing/echo_location | IDENTICAL | none |

Capture diffs vs r59: 0 lines on all four seeds. Descriptive quad
count, unchanged from r59: alive at end 0/4, global-final 1/4,
lesser seat waiting 3/4, full seat 0/4, wave 5 reached 0/4 (maxWave
4 on all four, and the table w5 detail is NOT scored per the r60
prereg definition).
**Attribution:** the r59→r60 range's only src/js landing is r74
(pellet-quote variant + return-ghost guard, narration-only on its
face). On this quad it moves NOTHING — no divergence at all, so no
first-divergence audit was triggered. That does not clear r74 in
general; it says it did not fire on these four trajectories.

### 2. WIDE NOFETCH (r59 open item): DIRECTION REVERSED ON THIS BAND — r59 NOT corroborated
Fresh seeds 85101–85108, same policy, DAYcap 180, separate EVIDIRs,
driver identical except labels/EVIDIR — plus a temporary
worktree-only patch neutralising the two daily fetch calls in
villagerBuildDay (vesselStashFetch + vesselArmorFetch). Patch applied
only for this arm, reverted with `git checkout -- src/js/villager-
build.js` immediately after the arm, verified: `git diff -- src/js/`
0 lines, no R60-NOFETCH marker remains in the file. The patch was
never committed and never lands; it is an instrument, not a fix.
Pilot gate passed (85101 current: pilgrimages 74, not 0).
First-divergence audit nofetch-vs-current, 8/8 seeds: the first
differing lines are EXACTLY the absent day-1 fetch lines (85101:
Sharpened stick + Flannel Shirt; 85102: Sling + Work Gloves; 85103:
Kitchen knife + Warden's Cloak; 85104: Sharpened stick + Flannel
Shirt; 85105: Crowbar + Flannel Shirt; 85106: Crowbar + Work
Gloves; 85107: Bow + Work Gloves; 85108: Sharpened stick + Bark
armor), followed by the absent Equipped lines — so every nofetch
difference after day 1 is attributable to the patch, not to arm drift.

Current band (8 seeds):
| seed | end | seat/arc | deaths | maxWave |
|---|---|---|---|---|
| 85101 | d181 NOT OVER, alive 5/5, pantry 0, regional | lesser arc4 | 37 | 4 |
| 85102 | d181 NOT OVER, alive 6/6, pantry 9,302, regional | lesser arc4 | 44 | 3 |
| 85103 | d167 OVER, 0/0, regional | lesser arc4 | 35 | 4 |
| 85104 | d180 NOT OVER, alive 9/9, pantry 37,199, regional | lesser arc4 | 35 | 4 |
| 85105 | d181 NOT OVER, alive 3/3, pantry 800, regional | lesser arc4 | 45 | 4 |
| 85106 | d158 OVER, 1/1, regional | lesser arc4 | 60 | 4 |
| 85107 | d181 NOT OVER, alive 8/8, pantry 21,606, regional | NONE arc3 | 38 | 3 |
| 85108 | d181 NOT OVER, alive 10/10, pantry 21,659, national nat157 court156 | lesser arc4 | 36 | 4 |

Nofetch band (8 seeds):
| seed | end | seat/arc | deaths | maxWave |
|---|---|---|---|---|
| 85101 | d181 NOT OVER, alive 4/4, pantry 3,796, regional nat89 court88 | NONE arc3 | 50 | 4 |
| 85102 | d181 NOT OVER, alive 10/10, pantry 53,606, regional | NONE arc3 | 37 | 3 |
| 85103 | d181 NOT OVER, alive 3/3, pantry 12,530, regional | lesser arc3 | 39 | 4 |
| 85104 | d131 OVER, 7/7, regional | lesser arc4 | 49 | 4 |
| 85105 | d124 OVER, 1/1, regional | NONE arc3 | 44 | 4 |
| 85106 | d181 NOT OVER, alive 9/9, pantry 21,933, regional | NONE arc3 | 30 | 3 |
| 85107 | d136 OVER, 5/5, regional | NONE arc3 | 33 | 3 |
| 85108 | d160 OVER, 7/8, national nat119 court118 | NONE arc3 | 41 | 4 |

Descriptive counts, prereg classification (wave 5 = maxWave >= 5
only): current alive-at-cap 6/8, global-final 0/8, lesser 7/8, full
0/8, wave 5 0/8; nofetch alive-at-cap 4/8, global-final 0/8, lesser
2/8, full 0/8, wave 5 0/8. By the prereg rule, current exceeds
nofetch on alive-at-cap by exactly 2 → **direction REVERSED on this
band**: r59's fetch-harm finding is NOT corroborated on fresh seeds.
The seat story moves too, unlike the r59 quad where it did not:
nofetch drops the lesser seat on 6/8 seeds (arc falls to 3 on six
seeds), while current holds lesser on 7/8. What this does NOT
decide: 8 seeds cannot convict a mechanic in either direction, and
neither "remove the fetches" nor "the fetches are good" follows
from one band each way. The honest statement is narrower: the
fetch effect is seed-dependent — harmful on r59's quad, helpful on
this band — and any future fetch work needs a mechanism, not a
count, to act on (see Q3).

### 3. MECHANISM TRACE (r59 open item, descriptive pilot): NO LEGIBLE SINGLE CHAIN
Two divergent seeds traced from the captures (day-tagged):
- **85104 (fetch helps):** current vessel fetches Sharpened stick +
  Flannel Shirt day 1, fights with the stick from day 9 (anaconda
  13/9/11), gets a System attachment-enhancement offer for the stick
  day 12, fights wolf day 23 and warranty day 27 (37 dmg) — and
  survives to the cap 9/9, 35 deaths. Nofetch vessel never wields a
  fetched weapon; its first weapon-adjacent line is a day-124 loot
  take (Kitchen knife etc.) — and the village ends d131 (49 deaths,
  a monster/stranger/wild cluster d124–131).
- **85106 (fetch hurts):** current vessel fetches Crowbar + Work
  Gloves day 1, fights wolf with the crowbar day 12 — and ends d158
  (1/1, 60 deaths, a wild-death cluster d157). Nofetch vessel loots
  a Sharpened stick early and fights with it from day 45 — and
  survives to the cap 9/9, 30 deaths. So "no fetch" does NOT mean
  "unarmed": the vessel still arms itself from loot, and the fate
  flip here cannot be attributed to being unarmed.
**Trace verdict:** fetched gear is actively used (fights from day 9–12
plus an enhancement offer), but the fate direction flips by seed.
No single chain — fetched item → fight → pantry → fate — explains
both seeds. The fetch question stays open as a mechanism question;
counting more bands will not settle it without a trace that names
the deciding fight, death, or pantry break on a per-seed basis.

### 4. PEOPLE CHECK (sense law — all 8 Q1 quad transcripts read in full)
Transcripts are byte-identical to r59's (0 diff lines on all 8), as
expected from identical captures. Verdict unchanged from r59: 6 of 8
fully real, 2 blemishes (same classes as r58/r59, not new breaks).
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
- **85003 d120 Thabo (blemish, r58/r59 class recurs):** withdrawal-
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
exactly where r59 left them — dead or down to one person, the lesser
seat waiting on three, the full seat never priced, wave 5 never met.
The eight fresh villages tell a healthier story: six of eight are
still alive at the day-181 cap with full pantries (85104: 9/9,
37,199 kcal; 85108: 10/10, 21,659 kcal), seven of eight hold the
lesser seat — but none reaches global, none takes the full seat,
none meets wave 5. The climb's machinery works and villages survive
it; the top of the climb is still unreached in every arm of this run.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: the climb's machinery fires on the fresh band too
  (courts, covenants, pilgrimages up to 75, national standing on
  85108) — and survival-to-cap is common here (6/8 current), not
  the rarity the old quad suggested. The fetch question is now
  genuinely two-sided: the same mechanic helps some villages and
  hurts others, so "does the first-day gear help a real player?"
  has no band-level answer yet.
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing, and Marisol's muscadine
  plan plus Henry's breakfast belief are the kind of specific,
  human talk that carries a long run. The thin spots are Thabo's
  withdrawal-only talk and Meera's gossip tail — blemishes, not
  breaks.
- WINNABLE: not shown, again. The lesser seat waits on 7/8 fresh
  current seeds and 3/4 old seeds; the full seat stays unwon (w5 0
  in every arm, maxWave 4 at best). Survival is no longer the
  binding constraint on this band — reaching wave 5 and pricing the
  full seat is.

## TABLE-APPROACH (standing, report-only)
Current quad, end state: 85001 lesser arc4 waiting+announced (w1 13,
w2 7, w3 7, w4 4, w5 detail not scored, foodDeeds true per r59);
85002 lesser arc4 waiting+announced; 85003 lesser arc4
waiting+announced; 85004 seat NONE arc3, never waiting/announced.
Identical to r59. Fresh current band: lesser arc4 on 7/8 (all but
85107, seat NONE arc3); national standing reached on 85108 (nat157,
court156) without a global day; no seed reaches global. Nofetch
fresh band: lesser on only 2/8, arc 3 on six seeds — the fetch patch
moves the seat story on this band even though survival moves the
other way on r59's quad.

## BARRIER PIN (standing instrument, re-confirmed)
Guard-refusal narration lines per Q1 seed: 85001: 2, 85002: 3,
85003: 2, 85004: 2 — identical to r59. Guard-holds, not
guard-broken, in r55 form. The pin stands; it does not overturn.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores).
- r59's PARITY verdict is EXTENDED, not re-scored: r60 shows full
  parity with r59 under the same fixed rule, including 0-line
  capture diffs on all four seeds, so the r59 fate is stable across
  the r74 range. No scalar was re-scored against a friendlier metric.
- The r60 prereg's wave-5 definition (maxWave >= 5 only; table w5
  detail reported, never scored) was applied exactly as written to
  both fresh bands — no seed in any arm reaches maxWave 5, so the
  definition did not change any verdict, but it removes the r59
  ambiguity for future runs.
- The wide-band verdict used the prereg count rule exactly as
  written (alive-at-cap difference >= 2 either way). The result is
  REVERSED, not "mixed" or re-scored: r59's harm finding is not
  corroborated on this band.
- r58's Irving-displacement answer STANDS (one-sitting-only; the
  d90 displacement transcript recurs here byte-identical, and the
  d120 favor commits as r58's Q2 predicted). r58's subject-menu
  correction STANDS unre-tested (no subject-first arm here). r58's
  Boris nod-loop stands UNRE-TESTED (no Boris transcript arose).
  r56's chooseAbility-unguarded note stands (no duplicate ability
  id in any control seed's abilitiesHeld — all lists distinct).
  r52's barrier pin stands in its r55 form (see above).
- No metric was re-scored mid-run. One metric observation for the
  NEXT run: the fresh band's "alive-at-cap" hides a distinction
  worth naming — 85104 current ends d180 NOT OVER while the rest
  end d181, and nofetch 85104 ends d131 OVER with pop 7/7 (a
  scatter-type end, not a wipe). The next run should define whether
  "over with survivors" counts as dead or as scattered before
  scoring it, rather than folding it into alive-at-cap silently.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-10-30/journey-scale-r60/journey-scale-r60-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ quiet (4 files, 5 metrics, no large deviations), exit 0. Expected:
the current quad is scalar-identical to r59, the baseline's source
lineage. Baseline NOT rolled on this run's numbers (prereg said so).

## Tests
- `node --check` clean on the r60 driver (at creation) and the r60
  analyzer (at creation).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  first run KILLED by a VM/container restart at ~03:21Z (uptime shows
  the box restarted, up 1 min at 03:22:45Z — same class as r59's
  23:26Z restart; it killed the suite mid-stream at ~200/290
  scripts with no summary, and killed the heartbeat loop; the
  registry heartbeat at 03:16:55Z was fresh enough that the reaper
  left the tree alone; the worktree, evidence, and prereg commit all
  survived — only the suite run was lost). The interrupted log is
  kept as evidence of the restart kill, not deleted. Recovery:
  heartbeat loop restarted with its log in goal hidden_files
  (journey-scale-r60-heartbeat.log), verified landed 03:22:53Z;
  suite re-run from scratch into
  journey-scale-r60-checkquick-rerun.log. Re-run: **284 passed, 6
  failed in 421s** (290 scripts, exit 1 from the failures).
- The 6 are EXACTLY r57/r58/r59's 6 pre-existing assertion-failure
  scripts, same families, same signatures —
  measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof, and
  the establishment-r20 family
  (test-establishment-r20-fixes-20261020.js: "NEW: next day voices
  once more (gate resets daily): expected 2, got 1"). No quick-list
  test imports this run's scripts, and this run's change set is
  driver + analyzer + evidence with ZERO src/js, so it cannot have
  caused any of the 6.
- Suite side effect, checked not assumed: unlike r58/r59, this run's
  suite left NO non-evidence modification (`git status` after the
  suite shows only this run's evidence entries) — no ONTOLOGY.md
  revert was needed.
- Zero src/js changes, so no game-code regression surface exists
  in this run's change set; the suite above is the standing proof,
  not a response to a suspected regression.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
Master at worktree creation: 7a2974684. (Filled at closeout after
the merge step.)

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 421s** (re-run after the 03:21Z VM
restart killed the first run at ~200/290).
The 6 are EXACTLY r57/r58/r59's 6 pre-existing assertion-failure scripts,
same families, same signatures — measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, and the establishment-r20 family.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries (run note
+ four evidence dirs).

## TELEMETRY (filled at closeout)
Quiet, no LOUD lines (see Telemetry section above). Baseline NOT rolled.
