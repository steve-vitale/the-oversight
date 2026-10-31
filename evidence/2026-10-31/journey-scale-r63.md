# journey-scale r63 — Lane A, leg 3 SCALE (2026-10-31)

**Run id:** oversight-playtest-loop-20261031T1950Z (scheduled 14:45 CDT 2026-10-31; lock created 19:50:58Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
Note on the repeated leg: r62's note promised the 3→0 write at its
closeout, but the rotation file still read 3 at this run's start —
the same anomaly r62 recorded about r61, and r61 about r60. Staying
on scale is queue-correct under the body (play THIS run's leg as read).
**Base:** master@7daa1e3d8 at worktree creation. **Zero src/js changed
by this run at closeout** — measurement plus one driver, one instrument
driver, one analyzer (labels only), and evidence. The nofetch patch was
temporary and reverted after every seed (verified 0 diff lines, marker gone).
**Pre-register:** evidence/2026-10-31/journey-scale-r63-prereg.md
(written and committed before any seed ran).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; drivers read only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Worktree registration slow, not failed:** `git worktree add` for
  journey-scale-r63 took ~5 minutes (its `git reset --hard` checkout
  ran at high CPU throughout) before succeeding. No ref surgery was
  attempted. The stale plain `journey-scale` branch (merged, left in
  place since r62's EPERM flap) was again avoided with the fresh slug
  `journey-scale-r63`.
- **Heartbeat:** manual heartbeat at registration verified landed
  (19:57:24Z, re-verified 20:11:01Z and 20:25:37Z) plus a 10-minute
  background loop with its log in goal hidden_files
  (journey-scale-r63-heartbeat.log). One heartbeat invocation took
  ~2 minutes (registry-lock contention with sibling agents), but no
  heartbeat ever went stale past the 15-minute threshold.
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r56–r62: after a correct private-index commit, the
  worktree's main index showed all four committed files
  staged-as-deleted plus untracked. Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git
  status` empty, `git diff HEAD` empty, hash-object matches HEAD.
  The commit itself was correct (ce758b99d).
- **Nofetch runner self-check caught its own bug:** the first
  nofetch script's patch-shape check miscounted diff header lines
  (---/+++), aborted BEFORE any seed ran, and reverted cleanly.
  The fixed check (content lines only, must equal 4) then ran all
  8 nofetch seeds with a revert + clean-diff verification after
  each. No seed ran under a wrong patch, and no patch survived.

## Verdicts (binding questions, answered)

### 1. QUAD-PARITY-R63: PARITY PASSES — full, not partial
Range since r62's measurement base (47162b801..HEAD, src/js +
src/data) is exactly build.js (version stamp) plus conversation.js
topicLabels (dbce3829a). The prereg's named presentation exception
was never needed: **census scalars are identical to r62 on all four
seeds, captures diff 0 lines on all four seeds, and transcripts
diff 0 lines on all six talks.** The topicLabels change surfaces
nowhere in this leg's captures or talks — the labels it names
never arise in these six conversations.

| seed | end | seat/arc | bars at census | deaths | maxWave | pilg | fusion | abilities |
|---|---|---|---|---|---|---|---|---|
| 85001 | SCATTERED d28, 3/3, pantry 0 | none arc3 | MISS w2=2, w3=0, cont=1, rank=village, foodDeeds=F | 19 | 2 | 0 | F | green_whisper, green_thumb, lucky_rock |
| 85002 | ALIVE d181, 8/8, pantry 92,669 | none arc3 | MISS w3=0, foodDeeds=F | 13 | 2 | 34 | T | green_whisper, scream_cheese |
| 85003 | ALIVE d181, 6/6, pantry 2,438 | none arc3 | MISS foodDeeds=F | 48 | 4 | 69 | T | bloodhound, lucky_rock, green_whisper, trophy_room |
| 85004 | DEAD d169, 0/0, pantry 0 | lesser arc4 waiting+announced | ALL-BARS | 73 | 4 | 5 | F | beast_calm |

Descriptive quad count, unchanged from r62: ALIVE 2/4, SCATTERED
1/4, DEAD 1/4; lesser seat 1/4; full seat 0/4; wave 5 reached 0/4.
**Weapon-craft lines: 0 on all four seeds. Deadfall-duty lines: 0
on all four seeds** — the third consecutive 0/4 for both duties on
this leg's policy path (r61, r62, r63). A real player following
this competent line would still never meet either new duty in the
scale window. Barrier-dump line counts: 85001: 0, 85002: 0,
85003: 4, 85004: 2 — identical to r62. No new guard-break signal;
the pin stands in its r55 form.

### 2. PELLET-TIMING-V2 (scholar-id instrument): MANTLE PASS PROVEN, ALL THREE CASES
**Purity: PASSED.** Pellet-v2 driver vs r63 driver on quad seeds
85001–85004: 0-line capture diffs on all four, identical census
scalars. The instrument (daily pelletOnline + feastSurgeUsed +
sentimentTaught + arc + seat + scholarVid/scholarName +
holderVid/holderWho, all reads) does not move the sim.
**Wide-band timing reproduces r62 exactly, both arms** — every
pellet-install day, bank day, order class, and arc matches r62's
Q3 table on all 16 seed/arms. The v2 record adds the scholar at
each event, and the mechanism is now visible, not inferred:
**every pellet-offline event in both arms (10/10) falls on a
scholar-change day** — the day a new mantle bearer takes over.
The pellet is per-bearer: it goes offline when its bearer is
replaced, and the reactor flag stays taken, so no second reactor
rises. The converse also holds: the two installed pellets whose
bearer never changed (85104C Sidney, 85103N Kyle) stay online to
census.

Wide current (C) — install / offline (scholar change) / bank / arc:

| seed | install (bearer) | offline = change | bank (bearer) | arc |
|---|---|---|---|---|
| 85101 | d23 Marta | d84 Marta→Alma | d126 Devon | 4 lesser |
| 85102 | d17 Jerome | d34 Jerome→Lily | never | 3 |
| 85103 | — | — | d68 Catalina | 4 lesser |
| 85104 | d48 Sidney | never (no change) | d24 Sidney | 3 (w3-short, r62) |
| 85105 | — | — | d30 Reagan | 4 lesser |
| 85106 | d78 Sophia | d111 Sophia→Henry | never | 3 |
| 85107 | d36 Jasper | d43 Jasper→Oliver | d118 Diana | 4 lesser |
| 85108 | d97 Catalina | d112 Catalina→Aria | d49 Lorena | 4 lesser |

Wide nofetch (N) — install / offline (scholar change) / bank / arc:

| seed | install (bearer) | offline = change | bank (bearer) | arc |
|---|---|---|---|---|
| 85101 | d75 Marta | d130 Marta→Alma | never | 3 |
| 85102 | d38 Jerome | d46 Jerome→Lily | d73 third bearer | 4 lesser |
| 85103 | d20 Kyle | never (no change) | never | 3 |
| 85104 | d113 Chen Wei | d135 Chen→next | d23 Sidney | 4 lesser |
| 85105 | — | — | never | 3 |
| 85106 | d23 Jian | d48 Jian→Sophia | never | 3 |
| 85107 | d69 Jasper | d86 Jasper→Oliver | never | 3 |
| 85108 | — | — | d46 | 4 lesser |

**The three r62 pellet-before-bank arc4 cases are PROVEN, not
inferred, under the prereg's rule** (offline on/before a scholar
change, surge banked under a later bearer):
- 85101C: offline d84 is exactly the Marta→Alma change; bank d126
  under Devon, five bearers later.
- 85107C: offline d43 is exactly the Jasper→Oliver change; bank
  d118 under Diana, two bearers later.
- 85102N: offline d46 is exactly the Jerome→Lily change; bank d73
  under a third bearer (after the d59 change to gen_yzjn16a).
Current wide: arc4 5/8; nofetch wide: arc4 3/8 — identical to r62.
The surge-ever-banked predictor from r62 still holds on this band
(all 8 arc4 arms banked; the banked arc3 arm 85104C misses w3
alone; 85104N banks before its pellet and reaches arc4). No fix
landing follows from Q2 alone. The next instrument, if the pellet
story is pursued further, should trace the bank itself (which
feast/combat use sets feastSurgeUsed under the banking bearer),
since the flag's setter is still untraced — but the mantle-pass
mechanism itself is now closed.

### 3. PEOPLE CHECK (sense law — all 6 Q1 quad transcripts read in full)
Identical to r62's verdict, because the transcripts are identical
(0-line diffs): 5 of 6 fully real, 1 partial blemish (same class
as r58–r62, not a new break). No fabricated shared history, no
static menus, no filler loops beyond the noted tail.
- **85002 d90 Luis (favor, sickness):** need owns the opener,
  commits ("I'll come back to help"), stage 2→3, ends resolved
  ("Thank you. Whatever you can do — thank you").
- **85002 d120 Luis (dream question):** answer lands ("Then it's
  not gone. Not really"), goon thins friendliness — a real beat
  about holding at arm's length. Stage 1→2.
- **85003 d90 Dale (blemish, known class):** grief opener is real
  ("Every laugh out there feels wrong today"), betrayal:accept is
  TAKEN with consequence (Dale teaches slope-reading for water on
  the way — an invitation taken, exactly the rationality item),
  comfort engages ("You're kind. Don't let this place change
  that") — but the gossip tail drifts generic (forage reports,
  "People are talking about Olivia"). Opening real, tail filler.
- **85003 d120 Lucas (dream question):** Chicago street-lengthening
  dream, specific and human. Stage 1→2.
- **85004 d90 Rowan (alone-time question):** answer engages
  ("Solitude's a resource too. Scarcer than food, some days"),
  goon pulls back half a step — deflection with body language.
- **85004 d120 Regina (old-life skill question):** patience answer
  lands ("You're an asset"), goon gives crossing-guard
  people-reading — occupation-grounded, specific.
No recurrence in this sample of Irving displacement, Thabo
withdrawal-only talk, or the Boris nod-loop (none arose). The
topicLabels landing (r68) changed nothing observable here — no
label wording appears in any of the six talks.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: unchanged from r62 — the climb's machinery fires
  (courts, covenants, pilgrimages up to 69 on one seed, national/
  global voicing) and survival-to-cap is common, but neither new
  duty (self-craft, deadfall) fires once on this leg's policy path
  for the third run running, and a rich cap-surviving village
  (85002) still faced zero wave-3 monsters in 181 days.
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing, the starvation scatter
  is mourned villager by villager rather than tallied, and the
  pellet story is now a proven mechanism rather than a mystery:
  the pellet dies with its bearer and a later bearer can still
  bank the surge. The thin spot remains the gossip tail (Dale) —
  a blemish, not a break.
- WINNABLE: not shown, again. The lesser seat waits on 1/4 quad
  seeds and 5/8 + 3/8 wide-band arms; the full seat stays unwon
  (wave 5 reached 0 everywhere). Survival is no longer the binding
  constraint on this band — banking a feast surge before the arc
  can price the run is, with wave-3 breadth second.

## TABLE-APPROACH (standing, report-only)
Quad, end state: 85001 seat none arc3; 85002 seat none arc3;
85003 seat none arc3; 85004 lesser arc4 waiting+announced (then
wiped d169). Wide current: lesser arc4 on 5/8 (85101, 85103, 85105,
85107, 85108); wide nofetch: lesser arc4 on 3/8 (85102, 85104,
85108). Full seat 0 everywhere; wave 5 reached 0 everywhere.

## BARRIER PIN (standing instrument)
Barrier-dump line counts per Q1 seed: 85001: 0, 85002: 0, 85003: 4,
85004: 2. No new guard-break signal. The pin stands in its r55
form; it does not overturn.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores),
  plus the r61 end-state class (ALIVE / SCATTERED / DEAD) and the
  weapon-craft-line and deadfall-duty-line counts.
- No metric was re-scored mid-run. The prereg's pilot gate is the
  r62 revised gate (crash/empty capture, not pilgrimages); it did
  not fire. The prereg's named presentation exception for
  topicLabels was never invoked — transcripts diff 0 lines.
- r62's surge-ever-banked predictor is CONFIRMED descriptively on
  this band (all 8 arc4 arms banked; the one banked arc3 arm,
  85104C, misses w3 alone), not re-scored: the predictor was
  r62's finding, and r63's wide band reproduces it exactly.
- r62's mantle-pass inference is SUPERSEDED by proof (Q2 above):
  the three pellet-before-bank arc4 cases now carry scholar-change
  evidence, and the 10/10 offline-on-change pattern names the
  mechanism. This supersedes the inference, not a scored metric.
- r62's arc-lag / tick-lag classes are not re-tested here (no
  arm this run presents bars-ALL-met-but-arc-3 at census; the
  85103N case banks never, so it is a foodDeeds miss, not the
  r60 tick-lag case).
- r58's Irving-displacement answer STANDS unre-tested (no Irving
  transcript arose). r58's subject-menu correction STANDS
  unre-tested (no subject-first arm here). r58's Boris nod-loop
  stands UNRE-TESTED (no Boris transcript arose). r56's
  chooseAbility-unguarded note stands (no duplicate ability id in
  any control seed's abilitiesHeld — all lists distinct). r52's
  barrier pin stands in its r55 form (see above).

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-10-31/journey-scale-r63/journey-scale-r63-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line: `census.pantryKcal newly appeared: baseline 0 ->
current 95107 (n=4 files)`, exit 0. **Verdict: EXPLAINED, not a
bug.** Identical to r62's verdict and the same numbers: the
baseline is the old-base quad's SUMS (day 579, popAlive 1, pantry 0,
maxWave 16, pilgrimages 69 — the r60/r61 lineage where all four
villages ended dead/scattered with empty pantries). The r63 quad
sums are day 559, popAlive 17, pantry 95,107, maxWave 12,
pilgrimages 108 — identical to r62's, as parity requires. The
pantry jump is two cap-surviving villages on re-rolled worlds
relative to the baseline, one holding 92,669 kcal — not a
telemetry or game defect. The baseline is NOT rolled on this run's
numbers (prereg decision stands).

## Tests
- `node --check` clean on the r63 driver, the pellet-v2 driver,
  and the analyzer (at creation).
- Pellet-v2 instrument purity: 0-line capture diffs vs the r63
  driver on all four quad seeds, identical census scalars (see Q2).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **281 passed, 9 failed in 1211s** (290 scripts) — vs r62's 284 passed,
  6 failed in 440s. The 3 extra failures are classified, not waived:
  - `test-measurement-cache-flags.js` (3 failed assertions in-suite)
    passes solo 4/4.
  - `test-trust-observer-neutrality.js` (exit null, 120.2s timeout)
    passes solo 6/6.
  - `test-synergy-stall.js` (exit null, 120.1s timeout) passes solo
    (exit 0).
  All three are concurrent-load flakes: the suite ran 3× slower than
  r62's while a sibling lane-B check ran concurrently, with the
  slowest scripts hitting exactly the 120s cap. The remaining 6 are
  EXACTLY r57–r62's 6 pre-existing assertion-failure scripts, same
  families, same signatures — measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, and the establishment-r20 family
  (test-establishment-r20-fixes-20261020.js: "NEW: next day voices
  once more (gate resets daily): expected 2, got 1"). No quick-list
  test imports this run's scripts, and this run's change set is
  drivers + analyzers + evidence with ZERO src/js, so it cannot
  have caused any of the 9.
- Suite side effect, checked not assumed: unlike r62, this run's
  suite left NO docs/ONTOLOGY.md modification (`git status` shows
  only this run's untracked evidence) — no validator refresh to
  commit separately.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
