# journey-scale r68 — Lane A, leg 3 SCALE (2026-11-02)

**Run id:** laneA-scale-2026-11-02T08:44:24Z (scheduled 02:45 CST 2026-11-02).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@a8c3ee57b at branch creation.
**Pre-register:** evidence/2026-11-02/journey-scale-r68-prereg.md
(written and committed before any seed ran).
**Change set at closeout:** ZERO src/js. Tooling + evidence only:
r67 driver relabeled with a GOSSIP_FIRST picker mode, r68 census
analyzer, r67 gossip analyzer reused unchanged, r68 wsplit
analyzer (r67 analyzer relabeled, control-diff pointed at a
nonexistent dir so it reports null diffs). Gating freeze honored;
perception law honored (all instruments read-only; the forcing
mode only presses an offered choice, it feeds no hidden state
anywhere).
**Scored measurement = the quad** (seeds 85015–85018, GOSSIP_FIRST=1,
DAY CAP 180, death-aware stop, scalecourt-nogate unchanged).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 26%,
  `git pull` already up to date, worktree-reap ran (11/16 active, no
  removals — the active trees are dirty/held, correctly untouched).
- **Heartbeat:** manual heartbeat at registration verified landed in
  the registry, plus a 10-minute background heartbeat loop for the
  whole run (log at goal
  hidden_files/journey-scale-r68-heartbeat.log). Registry freshness
  was re-verified by read-back at every major step; one manual beat
  queued ~40s on the registry lock behind a sibling operation (flock
  contention, not a failure) and then landed. Minor anomaly, no
  action taken: the loop log accumulated 6 lines in its first ~5
  minutes (expected ~1 at 600s intervals); the loop process was
  verified alive and registry reads confirmed fresh beats
  thereafter. Registry freshness, not log line count, is the
  liveness signal.
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r66/r67: after the correct private-index commit
  (105ffd9e0, 2 files, +729), the worktree's main index showed both
  files staged-as-deleted while the worktree files stood as
  untracked. Repaired via HEAD-blob cacheinfo (`git update-index
  --add --cacheinfo`), then verified: `git status` shows only the
  new untracked analyzer, `git diff HEAD` empty. The commit itself
  was correct.

## Verdicts (binding questions, answered)

### 1. GOSSIP-FALLBACK REPEAT, WITH EXPOSURE: GATE STAYS CLOSED — exposure failed again, and now the mechanism is proven
Gossip analyzer on the band: **0 repeat pairs, 0 fallback pairs**
across all 7 transcripts. But exposure is STILL zero: **0
ask:gossip picks in 7 sittings, despite GOSSIP_FIRST forcing the
pick whenever offered.** Per the prereg's third branch, the fix gate
does NOT open, and no clean bill is claimed either — the exposure
failure itself is the finding, and this run proves WHY it happens:
- **Trust gating is NOT the blocker.** All 7 NPCs sit at trust
  20–100 (Viola 20, Caleb 24, the rest 90–100), and the code gate is
  trust ≥20 or relationship age ≥5 — gossipOpen holds for every
  sitting in the band.
- **Menu routing is the blocker.** Every sitting in the band is
  want-driven: the NPC opens with a want (favor, curious,
  betrayal), and want turns are served by want-specific menus
  (dlg:commit/details, ans:*, betrayal:*) that return before the
  topic-ask section of the choice builder (conversation.js: the
  want/favor early returns; topic asks including ask:gossip are
  built only on the off-thread path). The picker engages the want,
  the want resolves, and the sitting ends — the topic menu is
  never visited. Forcing the pick cannot help when the option
  never appears: GOSSIP_FIRST was a no-op for this driver shape.
- **The one sitting that DID offer the subject menu proves the
  second half:** 85018 d90 Charlotte offers only
  dlg:subject/leave/silence at turn0, and the control picker
  leaves immediately without pressing it. The escape hatch exists
  ("Can I ask you something else?") and the driver never takes it.
- **Next-run prescription (queued, NOT run here — post-hoc
  re-scoping is declined, per r67's precedent):** a SUBJECT_FIRST
  arm (the driver already supports WANT_SUBJECT=1: dlg:subject at
  turn0) or a dedicated gossip sitting (subject menu, then
  ask:gossip) on fresh seeds. That arm exercises the fallback
  rendering directly; if it produces a FALLBACK pair, the
  sitting-level dedupe fix gate opens then. The r66 Henrique
  instance STANDS as a single instance with a proven mechanism.
- **r67's exposure caveat is now superseded by this mechanism:**
  it was never about the picker priority. Any future "gossip never
  fires" claim must name the menu-routing cause, not the picker.

### 2. PEOPLE CHECK (sense law — all 7 transcripts read in full)
6 of 7 fully real, 1 thin (not broken). No fabricated shared
history, no filler loops, no static menus, 0 repeat pairs.
- **85015 d90 Tyrone (betrayal, seek_taken):** real. The player
  ACCEPTS the invitation; Tyrone's lines stay varied and
  characterful ("Arguments cost calories. I do the math out loud
  until people stop."), ends resolved ("See you at the fire.").
  First betrayal accept in five scale bands — see §5.
- **85016 d90 Giuseppe (curious):** real. Two "Teach me something
  from the wild" presses yield two different lessons (a night
  warning, then Guava), then a sewing line. Teaching varies, it
  does not loop.
- **85016 d120 Viola (favor, creek water run):** real, short.
  Commit engages, ends resolved ("Dawn, then. Bring something to
  carry — and thank you.").
- **85017 d90 Tom (favor, pantry run):** real, concrete plan
  ("The creek bend, past the treeline, before the dew dries.").
- **85017 d120 Tom (curious, anger):** real. "Good. Anger's fuel.
  Just — point it somewhere useful." Ends resolved.
- **85018 d120 Caleb (curious, alone):** real. "Solitude's a
  resource too. Scarcer than food, some days." Ends resolved.
- **85018 d90 Charlotte (favor, wound):** THIN, not broken. The NPC
  dismisses her own wound ("Never mind this wound — we got it
  handled. Thanks anyway."), the only offered engage is the
  subject menu, and the control picker leaves — a 1-line sitting.
  A real "not now" beat, but the driver never tests whether the
  subject menu would have opened a real talk. Picker-coverage gap,
  documented, not fixed (measurement-only run; the fix would be a
  driver change, and the next run's SUBJECT_FIRST arm covers this
  shape anyway).

### 3. TABLE-APPROACH + CENSUS (report-only)
| seed | end | day | pop | pantry | rank | seat | arc | maxWave | pilg |
|---|---|---|---|---|---|---|---|---|---|
| 85015 | SCATTERED (hunger, 4th hungry day) | 110 | 1/1 | 0 | regional | lesser | 4 | 4 | 6 |
| 85016 | DEAD (last villagers d149: wild + contest) | 149 | 0/0 | 2,775 | regional | lesser | 4 | 4 | 6 |
| 85017 | DEAD (wild wipe d169, after global) | 169 | 0/0 | 19,194 | global | lesser | 4 | 4 | 3 |
| 85018 | SCATTERED (hunger, 4th hungry day) | 142 | 9/9 | 0 | regional | lesser | 4 | 4 | 16 |

- Lesser seat 4/4 (all priced, arc 4, waiting, announced — NONE sat:
  tableDone=false on all four); full seat 0/4; wave 5 reached 0/4
  (w5:0 in every seat detail); national/global 1/4 (85017 only).
- **Do NOT read 4/4 lesser as an improvement over r67's 0/4.**
  The base moved 168 commits between r67's landing and this run,
  including other loops' game changes (titan readiness, garden
  pool, titanghost, Herald steer, muster call, armor lessons).
  Fresh seeds + a moved base + talk-RNG perturbation make this
  band non-comparable with r67's. The honest statement is: on
  this base, the lesser bars are met (fight counts w1 15–23, w2
  7–10, w3 5–7, w4 3–5; contests 19–21; stage 3) and the seat
  prices, waits, and is announced — but no village sits before
  it dies or scatters.
- 85017 is the band's story in plain words: the village climbs
  all the way to global standing, the table learns its name
  ("Species agency: unlocked. You are not at the table yet. But
  the table has your name now."), a 63,499-kcal shared granary
  pool stands behind it — and then the last three villagers die
  in the wild on day 169 with a 25,947-kcal pantry at home. The
  climb does not protect against the wild, and the table waits
  for no one. That is the game's thesis working as designed, not
  a defect — but it is also the sharpest form of the standing
  "reached but never sat" pattern: waiting + announced, never
  done, across all four seeds.
- Two villages scatter on hunger AFTER reaching regional rank and
  arc 4 (85015, 85018): same as r67, the climb does not protect
  against the food economy.
- Relationship assembly is no longer the binding bottleneck on
  this band (unlike r67): covenants 1–3 per seed at trusts 19–88,
  lead seasoned 0–1, proposed 1, tended 0 — the policy still
  proposes/tends almost nothing, but links arrive anyway. The
  binding constraint here is survival to the sitting, not links.

### 4. DUTY COUNTS (report-only, continuity)
Quad totals: villager-days 2,172; knower-days 929; armed knowers
929 (all real weapons, 0 stick-only); weaponless days 0;
weaponless-knower days 0; eligible days 0; attempts (Cd advances)
0; unexplained non-attempts 0; stick-blocked days 0.
Weapon-craft lines 0/4 seeds; deadfall-duty lines 0/4 seeds — the
EIGHTH consecutive 0/4 for both duties (r61–r68). The armed-gate
classification reproduces on fresh seeds and a moved base: the
duty's eligible population is structurally ~empty on the
competent scalecourt path, again.

### 5. BETRAYAL ACCEPT, FIRST IN FIVE BANDS (carried-item data point)
85015 d90: Tyrone, ordinary (unarmed) accept, trust 90, no
visible accept effect (trust flat 90 until death). Tyrone dies
d99 "the wild" in a mass wipe (6 villagers d98–d99, same cause) —
an expedition/wild event, not betrayal fallout. No aphorism loop,
no post-accept repeat in the sitting. The Olivia post-accept
loop item is therefore NOT confirmed and NOT refuted in its
original form (Olivia, aphorism repetition): one ordinary accept
with a subject who dies 9 days later in an unrelated wipe is a
single data point, not a re-test. Still open: whether an ARMED
accept, or an accept whose subject survives, loops or lands.

## BARRIER PIN (standing instrument)
Barrier-dump lines per seed: 85015: 2, 85016: 2, 85017: 4,
85018: 3 — all the SAME signature as r67: sleep() refusing
during an active fight via sayOncePerFight, inCombat=true,
tbfight=true, over=false. The guard WORKING as designed, not a
guard-break. The pin stands in its r55 form; it does not
overturn.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: unchanged in kind — the climb's machinery fires
  (courts, covenants, pilgrimages, tribute lines, global
  voicing), and the two hunger scatters speak their reason
  aloud. The thin spots this run are conversational routing, not
  content absence: gossip is unreachable through want-driven
  sittings (mechanism proven, fix gated to the SUBJECT_FIRST
  arm), and one sitting collapses to a single line because the
  driver never opens the subject menu.
- FUN: unchanged in kind — the best writing this run is small
  and human (Caleb on solitude as a scarce resource; Tom on
  anger as fuel; Tyrone doing the math out loud until people
  stop). No repeat class fired in 7 sittings.
- WINNABLE: not shown, again — in a new shape. Lesser seat 4/4
  priced but 0/4 sat; full seat 0/4; wave 5 reached 0/4. The
  villages that price the lesser seat die or scatter before
  sitting. That "priced but never sat" shape, now on four
  consecutive seeds, is the scale leg's standing question — it
  is reported, not chased, and it is NOT comparable with r67's
  0/4 priced on the older base.

## Metric review
- Census scalars unchanged from r51's list, plus fusion/ability
  columns (reads, not scores), plus the r61 end-state class and
  the weapon-craft-line and deadfall-duty-line counts. The gossip
  analyzer reports; it does not re-score any prior metric.
- No metric was re-scored mid-run. The prereg's Q1 verdict rule
  was applied as written: 0 fallback pairs with ~0 exposure →
  gate closed, exposure failure reported as the finding, no fix
  landed, no clean bill claimed. The SUBJECT_FIRST arm is queued
  for the next run, not run post-hoc here.
- r67's exposure caveat is SUPERSEDED by §1's mechanism (menu
  routing, not picker priority). r67's Deon fix stands (its
  proof re-run green on this base, see Tests).
- Carried, still open: Olivia post-accept aphorism loop (now
  with one ordinary-accept data point, §5 — still not a re-test);
  r65 bank-trace finding; r63 mantle-pass proof; r58
  Irving-displacement, subject-menu, Boris nod-loop; r56
  chooseAbility-unguarded note; r55 barrier pin form (guard
  confirmed working, not overturned); r67 capable-bot section 7
  test-maintenance item (re-seed section 7 or make its first-use
  assertion order-tolerant — untouched here).

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-11-02/journey-scale-r68/journey-scale-r68-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line: `census.pantryKcal newly appeared: baseline 0 ->
current 21969 (n=4 files)`, exit 0. **Verdict: EXPLAINED, not a
bug.** Identical in kind to r62's–r67's verdict: the baseline is
the old-base quad's SUMS (all villages dead/scattered, empty
pantries); the r68 sum is 85017's 19,194 + 85016's 2,775 (the other
two seeds hold 0). A cap-surviving global village holding a pantry
is not a telemetry or game defect. The baseline is NOT rolled on
this run's numbers (prereg decision stands).

## Tests
- `node --check` clean on the r68 driver, r68 census analyzer,
  and r68 wsplit analyzer (at creation).
- Gossip analyzer proof: `node scripts/test-gossip-r67.js` — 11
  checks passed (instrument unchanged, still green).
- Goal-opener-deep proof (r67's fix): `node
  scripts/test-goal-opener-deep-r67.js` — 7 passed, 0 failed
  (r67's convoPick fix still green on this moved base).
- Gossip-area subset: `node scripts/check.js --only gossip` —
  6 passed, 6 failed in ~6s. All 6 failures are in old test files
  this run never touched (test-gossip-norepeat, test-gossip-drama,
  test-gossip-rumors, test-gossip-question-20261011,
  test-gossip-scrub-20261007,
  test-self-gossip-first-person-20261012 — fast exits with
  harness errors such as `Text is not defined`), and `git diff
  <base> HEAD -- src/` is empty, so they are PRE-EXISTING on base
  a8c3ee57b, not regressions from this run. No quick-list test
  imports this run's scripts, and this run changes zero src/js.
- Full `check.js --quick` NOT run this run, deliberately: r67 ran
  it because it landed a src/js fix; this run lands zero src/js,
  so the full suite would re-prove the base, not this change.
  The targeted proofs above + the gossip subset + the empty src
  diff are the proportionate check. Recorded here so the next
  run can overrule it, not silently assumed.
- Suite side effect, checked not assumed: `git status` after the
  subset run shows only this run's evidence paths untracked plus
  the new analyzer scripts — no stray modifications, nothing to
  discard.

## Landing (filled at closeout)
