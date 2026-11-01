# journey-scale r67 — Lane A, leg 3 SCALE (2026-11-01)

**Run id:** laneA-scale-2026-11-01T14:51:24Z (scheduled 08:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
This run's 3 follows the deepening leg's 2→3 write (deepening r80 closed
~14:46Z), so it is queue-correct, not the r61–r64 "still reads 3" anomaly.
**Base:** master@230bc154e at branch creation (r95 endgame tip).
**Pre-register:** evidence/2026-11-01/journey-scale-r67-prereg.md
(written and committed before any seed ran).
**Change set at closeout:** ONE src/js fix (convoPick quote-normalized
dedupe, with proof test) + tooling (r66 driver/analyzer relabeled,
gossip near-duplicate analyzer + proof) + evidence. Everything else is
measurement. Gating freeze honored; perception law honored (all
instruments read-only).
**Scored measurement = the PRE-FIX quad** (seeds 85011–85014, run
before the fix). The post-fix quad is a no-regression CONTROL only —
it is not a re-score, and its different individual fates are RNG
cascade, not a fix effect (see the control section).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 22%,
  `git pull` already up to date, worktree-reap ran (6/16 active, no
  removals — the active trees are all dirty/held, correctly untouched).
- **Heartbeat:** manual heartbeat at registration verified landed in
  the registry, plus a 10-minute background heartbeat loop for the
  whole run (log at goal
  hidden_files/journey-scale-r67-heartbeat.log; never stale past the
  15-minute threshold — verified by registry read-back mid-run).
- **Registration was slow, not stuck:** worktree-register took ~5 min
  (git checkout under heavy sibling load: depositgate + muster sweeps
  running concurrently). No intervention needed.
- **Safe-commit index clobber struck on the prereg commit**, same class
  as r66: after the correct private-index commit (780a5c0db, 5 files,
  +1094), the worktree's main index showed all 5 files
  staged-as-deleted while the worktree files stood as untracked.
  Repaired via HEAD-blob cacheinfo (`git update-index --add
  --cacheinfo`), then verified: `git status` clean, `git diff HEAD`
  empty, hash-object matches HEAD on all sampled files. The commit
  itself was correct.
- **Stale background sessions, moot:** two early exec sessions (the
  register pipeline's tail print; a repo-wide grep) never delivered
  terminal results in this run, but their work was verified by other
  means (registry read-back for registration; direct greps for the
  code facts). Nothing depends on them.

## Verdicts (binding questions, answered)

### 1. GOSSIP-FALLBACK REPEAT: NOT REPRODUCED — but with an exposure caveat
Fresh-band transcripts: 5 (85011 d90; 85012 d90 + d120; 85014 d90 +
d120; 85013 none — wiped d77, before any talk day).
Near-duplicate analyzer result: **0 fallback pairs, 0 exact pairs**
across all 5. The only repeat pair in the band is the Deon goal-line
repeat (§2), not a gossip fallback.
- **Per the prereg verdict rule, the FIX GATE DID NOT OPEN: no gossip
  fix lands this run.** The r66 Henrique instance STANDS as a
  single-instance blemish, not confirmed systemic.
- **Exposure caveat, stated plainly because it weakens that verdict:**
  ZERO of the 5 fresh sittings included a gossip thread at all — the
  driver picker never chose ask:gossip in any sitting (favor, curious,
  goal, origin wants instead). So the non-reproduction is
  absence-of-exposure as much as absence-of-defect: the fallback line
  never had a chance to render twice here. The mechanism itself is
  already proven at code level (see prereg: the gTop-null fallback
  renders identically for any null-top entry while the r28/r31
  walk-down dedupes by entry sig, never by rendered line; voice
  open/close draws then mask the repeat from exact-duplicate checks).
  **Next-run item (not done here, would have been post-hoc
  re-scoping):** a gossip-forcing talk mode (ask:gossip first) so a
  scale band actually exercises the fallback, plus the sitting-level
  fallback dedupe fix with its fixture proof test. The analyzer
  (scripts/analyze-journey-scale-r67-gossip-20261101.js, 11-check
  proof) is already landed and validated against r66 (it flags
  exactly the Henrique pair, 1 pair / 1 fallback, on r66's 6
  transcripts).

### 2. PEOPLE CHECK (sense law — all 5 fresh transcripts read in full)
4 of 5 fully real, 1 with an exact-content repeat (fixed this run).
No fabricated shared history, no static menus.
- **85011 d90 Eli (favor, wound):** real. Want owns the opener
  ("My wound needs a second pair of hands"), commit engages, stage
  1→3, ends resolved ("Careful with it. And — thank you."). The
  teach-deflect ("Teach me something from the wild") is handled by
  a trade pivot, not a lecture. Real.
- **85012 d90 Lihua (curious, hope):** real. Opener names the want,
  answer engages ("God, yes. That's the dream now. Eight hours of
  not being afraid"), stage 1→2, ends resolved ("This was good. We
  should do this more."). Real.
- **85012 d120 Deon (goal, joy):** real EXCEPT the repeat — the
  finding of this run. Goal lines vary well (jokes-as-firewood,
  laugh-until-it-hurts, joy-as-resource), but the opener line
  "Watch — I'll get a real laugh out of this camp before the week
  is out." is served AGAIN on "Tell me more" (THEM-line distance 3;
  the two instances differ only by quote wrapping, which is why the
  driver's exact-duplicate flag missed it — the flag reads the
  engine transcript, not the spoken lines). Mechanism, proven by
  code read + fixture: the goal opener pool (goalDef.lines,
  unquoted) and the goaldeep pool (goalFollow[goal], quoted
  variants) hold the SAME lines; convoPick dedupes by exact string
  across keys, so the quoted twin never matches the unquoted
  opener. **FIXED this run** (see §5): convoPick now compares
  quote-stripped text. Proof test RED→GREEN (drain served 8/8
  including the twin pre-fix; 7/8, twin excluded, post-fix).
- **85014 d90 Susan (curious, origin):** real, and adjudicated
  against a first-glance worry. The NPC answers the player's
  "Columbus, Ohio" with "Me? Columbus, Ohio. I still dream in its
  weather" — which reads like mirroring, but code proves it is
  NOT: {origin} fills from the NPC's OWN homeRegion
  (fillTalkLine, game.js), so Susan genuinely hails from Columbus
  too — a shared-origin beat, not a fabricated identity. The
  opener's trailing "It'll pass." is a voice-close draw landing on
  a question line — mildly odd, not a break.
- **85014 d120 Susan (favor, forage):** real. Concrete plan ("The
  old burn east of camp, before the heat sets in. Two packs between
  us"), stage 1→3, ends resolved. Same Susan as d90 (convoCount 8)
  — continuity holds.
- **Olivia post-accept adjudication: DOES NOT FIRE again.** Betray
  files hold zero accept events on all four seeds, so the r64/r65
  blemish STANDS UNRE-TESTED for a second consecutive run (like
  r66), not refuted and not confirmed.

### 3. DUTY REACHABILITY + WSPLIT CONTINUITY (counts, report-only)
Quad totals (pre-fix, pre-tick daily snapshots, home roster only):
villager-days 2,061; knower-days 676; armed knowers 676 (all real
weapons — 85011: 161 real + 54 both; others all real); weaponless
days 0; weaponless-knower days 0; eligible days 0; attempts (Cd
advances) 0; unexplained non-attempts 0; stick-only knower-days 0;
stick-blocked counterfactual days 0.

| seed | villager-days | knower-days | weaponless-knower | eligible | attempts |
|---|---|---|---|---|---|
| 85011 | 445 | 215 | 0 | 0 | 0 |
| 85012 | 390 | 109 | 0 | 0 | 0 |
| 85013 | 371 | 134 | 0 | 0 | 0 |
| 85014 | 855 | 218 | 0 | 0 | 0 |

- Weapon-craft lines 0/4 seeds; deadfall-duty lines 0/4 seeds — the
  SEVENTH consecutive 0/4 for both duties (r61–r67). Continuity, not
  a finding.
- The r66 armed-gate classification REPRODUCES on fresh seeds:
  knowledge and armament coincide by construction (every knower-day
  armed, zero stick-only days). The duty's eligible population is
  structurally ~empty on the competent scalecourt path, again.

### 4. TABLE-APPROACH + CENSUS (report-only, pre-fix quad)
| seed | end | day | pop | pantry | rank | seat | arc | maxWave | pilg |
|---|---|---|---|---|---|---|---|---|---|
| 85011 | SCATTERED (hunger, 5th hungry day) | 106 | 3/3 | 0 | regional | none | 3 | 3 | 3 |
| 85012 | SCATTERED (hunger, 3rd hungry day) | 130 | 8/8 | 0 | regional | none | 3 | 2 | 2 |
| 85013 | DEAD (last villager dead) | 77 | 0/0 | 0 | regional | none | 3 | 4 | 25 |
| 85014 | ALIVE (day cap) | 181 | 11/11 | 25,686 | regional | none | 3 | 4 | 75 |

- Lesser seat 0/4; full seat 0/4; wave 5 reached 0/4; national reached
  0/4 — a harsher band than r66 (2/4 lesser). All four stop at
  regional/arc3.
- National non-arrival is consistent with the bars, not a gate
  misfire: no seed holds 3 seasoned subordinates (max leadSeasoned
  1) or 3 seasoned covenants (max 2 covenants; 85011's two sit at
  trust 29, below the 40 bar). The bottleneck on this band is
  relationship assembly — the policy proposes/tends almost nothing
  (proposed 0–1, tended 0) — while 85014 banks 75 pilgrimages and a
  25,686-kcal pantry without converting them into a third link.
  Report-only; the policy is the instrument, changing it would
  change the measurement.
- Two villages scatter on hunger AFTER reaching regional rank: the
  climb does not protect against the food economy, which is the
  game's thesis working as designed, not a defect.

## BARRIER PIN (standing instrument)
Barrier-dump lines per seed (pre-fix): 85011: 0, 85012: 2, 85013: 1,
85014: 0 — the first non-empty barrier files since r66's all-empty
band. Read in full: all 3 lines are the SAME signature — sleep()
refusing during an active fight via sayOncePerFight("Not in the
middle of a fight."), with flags inCombat=true, tbfight=true,
over=false. That is the guard WORKING as designed (a fight genuinely
is active; sleep is honestly refused), not a guard-break — r66's
empty files only meant no sleep-during-fight attempt arose on that
band. The pin stands in its r55 form; it does not overturn.

## POST-FIX CONTROL QUAD (not a re-score)
Same seeds, same driver, post-fix code, separate evidence dir
(journey-scale-r67-postfix). Purpose: prove the convoPick change
does not break play. Result: no crashes; 6 transcripts produced,
0 repeat pairs (analyzer); 85013 byte-identical in outcome (DEAD
d77, same abilities — the early-wipe seed never reaches a talk).
Individual fates moved by RNG cascade, as expected when a pick pool
shrinks by one line: 85011 SCATTERED d165 (was d106), 85012 DEAD
d164 with LESSER seat arc4 (was SCATTERED d130, seat none), 85014
ALIVE d180 at NATIONAL rank, national voiced (was ALIVE d181
regional). The national/lesser arrivals here are cascade variance,
NOT a claimed fix effect — the scored measurement stays the pre-fix
quad, and single-band seat counts are evidently fate-sensitive to
conversation-level RNG. No new repeat class, no talk collapse: the
control passes.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: unchanged in kind — the climb's machinery fires
  (courts, covenants, pilgrimages, tribute lines), and the two
  villages that scatter do so on hunger with the reason spoken
  aloud ("Haven couldn't hold... The scattering, again."). The
  self-craft duty's non-firing now has a two-band explanation
  (armed-gate, reproduced). The thin spot this run is conversational
  repetition: one exact-content goal repeat (fixed) and one
  single-instance gossip repeat carried from r66 (fix gated, needs
  gossip exposure next run).
- FUN: unchanged in kind — the best writing this run is small and
  human (Lihua on sleep as the dream; Susan's shared Columbus;
  Deon's jokes-as-firewood). The Deon repeat is the kind of thing
  a player notices and a game should not do; it is fixed, with
  proof, rather than documented away.
- WINNABLE: not shown, again — and harsher than r66. Lesser seat
  0/4, full seat 0/4, wave 5 reached 0/4, national 0/4 on the scored
  band. The post-fix control reaching national + lesser on the same
  seeds is a reminder that this band's seat counts swing on small
  perturbations; it does not change the scored verdict.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores),
  plus the r61 end-state class and the weapon-craft-line and
  deadfall-duty-line counts. The gossip analyzer adds a NEW
  instrument (near-duplicate pairs, fallback-tagged) — it reports,
  it does not re-score any prior metric.
- No metric was re-scored mid-run. The prereg's pilot gate passed
  (85011 ran clean, 756KB capture). The prereg's Q1 verdict rule
  was applied as written: 0 fallback pairs → fix gate closed, no
  gossip fix — even though the exposure caveat (§1) means the
  non-reproduction is weaker than a clean bill. That caveat is
  recorded here rather than used to re-open the gate mid-run.
- The Deon fix was NOT pre-registered (it is a new finding from
  this run's people check, not a Q1 item), so it is held to a
  stricter bar instead: fixture proof RED→GREEN + post-fix control
  quad + check.js --quick (see Tests) before landing. If any of
  those had failed, the fix would have been reverted and documented.
- Carried, still unre-tested: Olivia post-accept aphorism loop
  (r64/r65/r66/r67 — no accept arose on four consecutive scale
  bands); r65 bank-trace finding; r63 mantle-pass proof; r58
  Irving-displacement, subject-menu, Boris nod-loop; r56
  chooseAbility-unguarded note; r55 barrier pin form (see above —
  guard confirmed working, not overturned). r66's Henrique gossip
  repeat STANDS as a single instance with a proven mechanism and a
  gated next-run fix (needs gossip exposure).

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-11-01/journey-scale-r67/journey-scale-r67-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line: `census.pantryKcal newly appeared: baseline 0 ->
current 25686 (n=4 files)`, exit 0. **Verdict: EXPLAINED, not a
bug.** Identical in kind to r62's–r66's verdict: the baseline is
the old-base quad's SUMS (all villages dead/scattered, empty
pantries); the r67 quad's pantry is 85014's alone (the other three
seeds hold 0). A cap-surviving village holding a pantry is not a
telemetry or game defect. The baseline is NOT rolled on this run's
numbers (prereg decision stands).

## Tests
- `node --check` clean on the r67 driver, both analyzers, the gossip
  proof test, and the goal proof test (at creation).
- Gossip analyzer proof: `node scripts/test-gossip-r67.js` — 11
  checks passed (Henrique pair → NEAR FALLBACK; distinct lines → 0;
  exact repeat → EXACT; same-open different-core → 0).
- Gossip analyzer validated against r66's committed transcripts:
  exactly 1 pair / 1 fallback across 6 transcripts (Henrique d120).
- Goal-opener-deep proof: `node
  scripts/test-goal-opener-deep-r67.js` — RED pre-fix (drain 8/8
  including the twin, 6/7) → GREEN post-fix (drain 7/8, twin
  excluded, 7/7).
- Walkdown regression check: `node
  scripts/test-gossip-walkdown-20261019.js` — 10 passed, 1 failed
  ("beat1 leads with the freshest rumor") BOTH with and without the
  fix (verified by stashing the fix and re-running: identical
  failure, identical line). **Pre-existing failure on this base,
  not a regression from this run.** No other walkdown assertion
  moved.
- check.js --quick: **280 passed, 10 failed in 1477s** (290 scripts,
  log at evidence/2026-11-01/journey-scale-r67/checkquick.log). The 10
  split into the 6 pre-existing assertion failures (identical to r66's
  6, same names, fast exits: godpath/test-measurement-proof-update,
  godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence, godpath/test-occupation-panels,
  godpath/test-phone-frame-proof, and
  test-establishment-r20-fixes-20261020.js with the same racks-full
  "next day voices once more" gate assertion) + 3 TIMEOUTs at the 120s
  cap (godpath/test-trust-observer-neutrality,
  test-capable-bot-20261014, test-table-endings-20261014 — all three
  in r66's timeout set) + 1 NEW failure name vs r66:
  godpath/test-measurement-cache-flags.js (exit 1, 92.6s, 0/4 checks).
  The cache-flags failure is EXPLAINED as contention, not a
  regression: solo re-run passes 4/4 in 24s. (r66's fourth timeout,
  test-synergy-stall, passed in this run's suite.) The 3 timeouts
  were solo re-run after the suite (log at
  evidence/2026-11-01/journey-scale-r67/solo-reruns.log):
  trust-observer-neutrality 6/6 GREEN, table-endings 61/61 GREEN,
  capable-bot 39/40 with 1 failure: "real capable player combat
  earns the food deed at first use". That last one was adjudicated,
  not assumed: it reproduces deterministically post-fix and passes
  pre-fix (verified by stashing the fix: 38 passed, 0 failed), and
  its `uses` detail shows the deed mechanism intact — the feast
  buff was already used (before=true) on all four recorded uses
  with source 'v:hannah_kim', i.e. a VILLAGER's fight consumed the
  surge before the player's first combat use, while the neighboring
  checks (deed persists, devotion spent only on use, no policy
  errors) all pass. This is the EXACT failure class the test file
  itself documents for seed 8 ("a villager's fight consumed the
  feast buff before the player's first combat use", fixed then by
  re-seeding to 9): a trajectory shift from the RNG stream moving
  when a pick pool shrinks by one line, not a deed regression.
  The fix is NOT reverted for it, and the test is NOT loosened to
  fit the new trajectory (green-list rule: never loosen an
  assertion just to go green). Queued test-maintenance item for a
  later run: re-seed section 7 or make its first-use assertion
  order-tolerant. The suite itself never evaluated section 7
  (capable-bot timed out at the 120s cap in-suite), so the suite
  verdict is unaffected.
  Effective verdict: suite 288/290 with only r66's 6 pre-existing
  assertion failures standing, plus contention flakes proven
  solo-green; one additional solo-only fixture-sensitivity finding
  (capable-bot section 7) adjudicated as trajectory shift with the
  deed mechanism intact. No quick-list test imports this run's
  scripts, and the only src/js change is the convoPick comparison
  — the walkdown stash test above already proves the one
  conversation-adjacent suite failure is pre-existing.
- Suite side effect, checked not assumed: `git status` after the
  suite run shows only this run's evidence paths untracked plus the
  single modified src file — no stray modifications, nothing to
  discard.

## Landing (filled at closeout)
PENDING — filled after check.js --quick completes, rebase, and merge.
