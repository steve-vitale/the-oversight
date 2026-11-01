# journey-scale r64 — Lane A, leg 3 SCALE (2026-10-31)

**Run id:** oversight-playtest-loop-20261101T0045Z (scheduled 19:45 CDT 2026-10-31; lock created 00:43:57Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
Note on the repeated leg: r63's landing section claims the 3→0 write,
but the rotation file still read 3 at this run's start (mtime Oct 31
23:58) — the same anomaly r61–r63 recorded. Staying on scale is
queue-correct under the body (play THIS run's leg as read). This run
verifies the closeout write by reading the file back; if it reverts
again, that is flagged as a system issue, not assumed done.
**Base:** master@daf9e7c76 at worktree creation. **Zero src/js changed
by this run at closeout** — measurement plus one driver, one instrument
driver, one analyzer (labels/EVIDIR only), and evidence.
**Pre-register:** evidence/2026-10-31/journey-scale-r64-prereg.md
(written and committed before any seed ran).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; drivers read only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Stale plain slug, again:** `worktree-register.sh journey-scale`
  reused a stale merged branch at 4c92bbb04 (journey-deepening r75),
  not master. The branch was deleted only after
  `git merge-base --is-ancestor 4c92bbb04 master` passed, and the run
  re-registered under the fresh slug `journey-scale-r64` at master
  daf9e7c76 — the r62/r63 precedent. The plain slug must not be
  trusted by the next run either; register fresh.
- **Worktree registration slow, not failed:** the fresh r64
  registration took ~6 minutes (its checkout ran at high CPU
  throughout, as r63 recorded). No ref surgery was attempted.
- **Heartbeat:** manual heartbeat at registration verified landed
  (00:55:16Z) plus a 10-minute background loop with its log in
  /tmp/journey-scale-r64-hb.log. One heartbeat invocation blocked
  ~4 minutes on registry-lock contention with sibling agents, then
  landed (01:09:50Z); no heartbeat ever went stale past the
  15-minute threshold (oldest observed age ~14 minutes).
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r56–r63: after a correct private-index commit, the
  worktree's main index showed all four committed files
  staged-as-deleted plus untracked. Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git
  status` empty, `git diff HEAD` empty, hash-object matches HEAD.
  The commit itself was correct (a66db4ae). A follow-up `git
  read-tree HEAD` (per the body step 7) ran 8+ minutes on the
  contended tree and was killed; it was redundant — the index was
  already verified clean — and killing a read-only restat is safe.

## Verdicts (binding questions, answered)

### 1. QUAD-PARITY-R64: PARITY FAILS — on exactly one seed, and the audit names the cause
Range since r63's measurement base (7daa1e3d8..HEAD, src/js +
src/data) is exactly build.js (version stamp) plus fieldFights.js
(+68, 695c1b0b1 sim-twoblow-a: two-blow finish window behind the
60% HP gate, wave-3+ only, plus the committed-finish 40% floor).
Three seeds reproduce r63 exactly (capture diff 0 lines, identical
census scalars); the fourth diverges, and the prereg's verdict rule
fired the first-divergence audit before any attribution.

| seed | r63 | r64 | capture diff |
|---|---|---|---|
| 85001 | SCATTERED d28, 3/3, pantry 0, none arc3, deaths 19, maxWave 2, pilg 0, fusion F, green_whisper/green_thumb/lucky_rock | IDENTICAL | 0 lines |
| 85002 | ALIVE d181, 8/8, pantry 92,669, none arc3, deaths 13, maxWave 2, pilg 34, fusion T, green_whisper/scream_cheese | IDENTICAL | 0 lines |
| 85003 | ALIVE d181, 6/6, pantry 2,438, none arc3, deaths 48, maxWave 4, pilg 69, fusion T, bloodhound/lucky_rock/green_whisper/trophy_room | DEAD d154, 0/0, pantry 0, lesser arc4 waiting+announced, deaths 51, maxWave 4, pilg 56, fusion T, beast_calm/echo_location | 15,478 lines |
| 85004 | DEAD d169, 0/0, pantry 0, lesser arc4 waiting+announced, deaths 73, maxWave 4, pilg 5, fusion F, beast_calm | IDENTICAL | 0 lines |

**First-divergence audit (85003):** captures are identical through
line 5722; hungerwatch first differs at d60 (pantry 16,637 vs
17,603); wantwatch first differs at d62 (w3 5 vs 6). The visible
break, on the day-59 outing into day-60 dawn: r63 meets "Big Big"
in the clearing and Henrik takes a level-up (Berserker Rage), then
the return summary lists 4 missed things including Henrik mauled
(-36) by the Old Stare; r64 has no Big Big encounter (a "Birds
scatter" avoidance line instead), 3 missed things, no Henrik
mauling — and the one fight both summaries share, Maya vs the
Chorus Line, runs **11 rounds in r63 vs 12 rounds in r64**, with
Maya bound up 65→80 HP in r63 vs 49→64 HP in r64 (16 HP worse).
Chorus Line is wave 3 — the only wave-3+ monster in the window,
and therefore the only monster the twoblow change can touch.
Mechanism, consistent with the code: the old one-blow gate fires
only when the single last blow covers the monster's HP; the new
two-blow gate fires when the last two blows sum past it — a
superset. Maya's fight committed in r64 where it fled in r63,
cost her an extra round of monster hits, shifted the RNG stream,
and the cascade re-rolled the rest of the run: different encounter,
different haul (Henrik 5 vs 6 wood), different pantry, and
ultimately a different fate — dead at d154 having reached lesser
arc4, instead of alive at d181 at arc3 with foodDeeds unbanked.
No twoblow gate line appears in either player capture (NPC fight
rec.log lines do not surface there), so the gate firing itself is
inferred from the round-count + HP + wave-3 facts, not directly
observed — stated as inference, not proof. What is proven: the
divergence is real game behavior from the landed twoblow change,
not a driver bug (the range holds nothing else) and not
measurement noise (3/4 seeds byte-identical).
**Descriptive quad count, r64:** ALIVE 1/4, SCATTERED 1/4, DEAD
2/4; lesser seat 2/4; full seat 0/4; wave 5 reached 0/4.
**Weapon-craft lines: 0 on all four seeds. Deadfall-duty lines: 0
on all four seeds** — the fourth consecutive 0/4 for both duties
on this leg's policy path (r61, r62, r63, r64). A real player
following this competent line would still never meet either new
duty in the scale window. Barrier-dump line counts: 85001: 0,
85002: 0, 85003: 1 (r63: 4 — changed with the diverged seed, as
expected downstream), 85004: 2 (identical). No new guard-break
signal; the pin stands in its r55 form.

### 2. BANK-TRACE (feastSurgeUsed setter trace): MECHANISM TRACED — every bank is a feast-night combat use
**Purity: PASSED.** Bank driver vs r64 driver on quad seeds
85001–85004: 0-line capture diffs on all four, identical census
scalars. The instrument (daily feastSurge/feastSurgeUsed/
feastSurgeBy + scholarVid/scholarName + arc + seat, plus
day-attributed feast/surge/devotion lines; all reads) does not
move the sim.
**Wide current band (85101–85108) reproduces r63's bank table
exactly** — every bank day and banking scholar matches r63's
pellet-band record: 85101 d126 Devon, 85103 d68 Catalina, 85104
d24 Sidney, 85105 d30 Reagan, 85107 d118 Diana, 85108 d49 Lorena;
85102 and 85106 never bank. Arc pattern identical to r63 wide
current (arc4 on 85101, 85103, 85105, 85107, 85108; arc3 on 85102,
85104, 85106). The twoblow change moved the quad's 85003 seed but
did not move this band's bank outcomes — chaos is seed-local,
not a systematic bank shift.
**Per-seed bank table (quad + wide current):**

| seed | bank | scholar at bank | feastSurgeBy | class | census arc/seat |
|---|---|---|---|---|---|
| 85001 | never (armed d17, scattered d28) | — | — | — | arc3 none |
| 85002 | never (armed d23, alive d181) | — | — | — | arc3 none |
| 85003 | d86 | Maya | p | COMBAT | arc4 lesser |
| 85004 | d30 | Gerald | p | COMBAT | arc4 lesser |
| 85101 | d126 | Devon | p | COMBAT | arc4 lesser |
| 85102 | never (armed d28, scattered d67) | — | — | — | arc3 none |
| 85103 | d68 | Catalina | p | COMBAT | arc4 lesser |
| 85104 | d24 | Sidney | p | COMBAT | arc3 none (w3-short, r63) |
| 85105 | d30 | Reagan | v:gen_pca80hr (Brendan's blow) | COMBAT | arc4 lesser |
| 85106 | never (armed d28, alive d181, global) | — | — | — | arc3 none |
| 85107 | d118 | Diana | p | COMBAT | arc4 lesser |
| 85108 | d49 | Lorena | p | COMBAT | arc4 lesser |

**Classification: 8/8 COMBAT, 0 HEALING, 0 UNCLASSIFIED.** Every
bank day carries a feast line (the feast opening that night's
window), a "cookfire's smell carried further" monster-drawn line,
and feasted combat lines ("FEASTED ×2.03: the feast was the
weapon" and/or "<Name>'s blow carries the feast"). No bank day
shows a landed bonus-healing line: the healing path exists in
code but never fires on this band. The mechanism, now traced
rather than flagged: the devotion arms at the first feast and
then WAITS — feastSurge stays true continuously (85101: 95 days
armed before banking; 85002: 157 days armed, never spent) — until
the first feast night that actually has combat, when the first
feasted blow spends it. A feast that warms no blades banks
nothing, however many feasts follow. The 85105 case proves the
SEATBLOW-OPEN rule in the wild: a villager's blow (Brendan)
banked the deed under the banking bearer (Reagan).
**Surge-ever-banked predictor, re-confirmed descriptively:**
all 8 arc4 arms banked; the one banked arc3 arm (85104) misses
w3 alone; every never-banked arm is arc3. Not re-scored — r62's
finding, reproduced on a third band (r62, r63, r64).
**Never-banked despite long survival is itself a finding:**
85002 (alive d181, maxWave 2) and 85106 (alive d181, reached
global) armed the surge early and never fought on a feast night
in 150+ days. Banking is gated by feast-night combat
opportunity, not by feasting — a village can feast all season
and never bank if no monster comes on a feast night. No fix
landing follows from Q2 alone.

### 3. PEOPLE CHECK (sense law — all 6 Q1 quad transcripts read in full)
5 of 6 fully real, 1 partial blemish (new instance, same filler
family as the known tails — not a new break class). No fabricated
shared history, no static menus.
- **85002 d90 Luis (favor, sickness):** identical to r63 — need
  owns the opener, commits ("I'll come back to help"), stage 2→3,
  ends resolved ("Thank you. Whatever you can do — thank you").
- **85002 d120 Luis (dream question):** identical to r63 — answer
  lands ("Then it's not gone. Not really"), goon thins
  friendliness — a real beat about holding at arm's length.
  Stage 1→2.
- **85003 d90 Olivia (betrayal, NEW — the diverged seed talks to
  a different NPC than r63's Dale):** the invitation is TAKEN
  ("All right. Let's go"), which is exactly the rationality item
  — but the post-accept exchange is an aphorism loop: three
  "Tell me more" prompts yield three stoic one-liners ("The will
  to live isn't poetic. It's stubborn", "One more day. That's the
  goal", "I've stopped asking why") with no new thread, no
  resolution, no plant, no owe. Opening real, tail filler.
- **85003 d120 Dale (water-haul favor):** need owns the opener
  ("We're down to 5 liters of clean water. Haul the creek with me
  at dawn? Two buckets each"), commit → "Dawn, then." Stage 1→3.
  Concrete, consequence-promising. Real.
- **85004 d90 Rowan (alone-time question):** identical to r63 —
  answer engages ("Solitude's a resource too. Scarcer than food,
  some days"), goon pulls back half a step. Stage 1→2.
- **85004 d120 Regina (old-life skill question):** identical to
  r63 — patience answer lands ("You're an asset"), goon gives
  crossing-guard people-reading — occupation-grounded, specific.
  Stage 1→2.
No recurrence in this sample of the Dale gossip tail (Dale's talks
here are a different, clean favor), Irving displacement, Thabo
withdrawal-only talk, or the Boris nod-loop (none arose).

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: unchanged in kind — the climb's machinery fires
  (courts, covenants, pilgrimages, national/global voicing, lesser
  seats waiting on 2/4 quad seeds and 5/8 wide arms), but neither
  new duty (self-craft, deadfall) fires once on this leg's policy
  path for the fourth run running, and the bank that prices the
  run depends on a monster arriving on a feast night — an
  opportunity the player cannot schedule, only survive toward.
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing, and the pellet/bank
  story is now a traced mechanism rather than a mystery: the
  devotion waits armed until a feast night finally has a fight.
  The thin spot this run is the post-accept aphorism loop
  (Olivia) — a blemish, not a break.
- WINNABLE: not shown, again. The lesser seat waits on 2/4 quad
  seeds and 5/8 wide arms; the full seat stays unwon (wave 5
  reached 0 everywhere). The twoblow change is a live winnability
  variable in miniature: on 85003 it flipped the seed from
  alive-at-cap arc3 to dead-at-d154 lesser-arc4 — one fight-commit
  rule, one extra round, a whole different village fate. That is
  the game's chaos working as designed, not a bug — but it means
  single-seed winnability claims on this leg are worthless; only
  bands speak.

## TABLE-APPROACH (standing, report-only)
Quad, end state: 85001 seat none arc3; 85002 seat none arc3;
85003 seat lesser arc4 waiting+announced (then wiped d154);
85004 seat lesser arc4 waiting+announced (then wiped d169).
Wide current: lesser arc4 on 5/8 (85101, 85103, 85105, 85107,
85108); arc3 on 85102, 85104, 85106. Full seat 0 everywhere;
wave 5 reached 0 everywhere.

## BARRIER PIN (standing instrument)
Barrier-dump line counts per Q1 seed: 85001: 0, 85002: 0, 85003: 1
(r63: 4 — the diverged seed, expected downstream change), 85004: 2
(identical to r63). No new guard-break signal. The pin stands in
its r55 form; it does not overturn.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores),
  plus the r61 end-state class (ALIVE / SCATTERED / DEAD) and the
  weapon-craft-line and deadfall-duty-line counts.
- No metric was re-scored mid-run. The prereg's pilot gate is the
  r62 revised gate (crash/empty capture, not pilgrimages); it did
  not fire (85001 ran clean, capture 246,475 bytes). The prereg's
  parity verdict rule fired as written: ANY scalar difference
  triggered the first-divergence audit before attribution, and
  the 85003 divergence is reported as a NO-GO on parity, not
  explained away — with the twoblow mechanism named as the
  attributed cause and the gate-firing itself flagged as
  inference (no gate line surfaces in the player capture).
- r62's surge-ever-banked predictor is CONFIRMED descriptively
  on a third band (all 8 arc4 arms banked; the one banked arc3
  arm misses w3 alone), not re-scored.
- r63's mantle-pass proof STANDS (not re-tested; the pellet
  instrument was not re-run — the pellet story is closed).
- r58's Irving-displacement answer STANDS unre-tested (no Irving
  transcript arose). r58's subject-menu correction STANDS
  unre-tested (no subject-first arm here). r58's Boris nod-loop
  stands UNRE-TESTED (no Boris transcript arose). r56's
  chooseAbility-unguarded note stands (no duplicate ability id in
  any control seed's abilitiesHeld — all lists distinct). r52's
  barrier pin stands in its r55 form (see above).

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-10-31/journey-scale-r64/journey-scale-r64-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line: `census.pantryKcal newly appeared: baseline 0 ->
current 92669 (n=4 files)`, exit 0. **Verdict: EXPLAINED, not a
bug.** Identical in kind to r62's/r63's verdict: the baseline is
the old-base quad's SUMS (day 579, popAlive 1, pantry 0, maxWave
16, pilgrimages 69 — the r60/r61 lineage where all four villages
ended dead/scattered with empty pantries). The r64 quad sums are
day 532, popAlive 11, pantry 92,669, maxWave 12, pilgrimages 95 —
the pantry is 85002's alone (identical to r63's 85002; the other
three seeds hold 0). A cap-surviving village holding a pantry is
not a telemetry or game defect. The baseline is NOT rolled on
this run's numbers (prereg decision stands).

## Tests
- `node --check` clean on the r64 driver, the bank driver, and
  the analyzer (at creation).
- Bank instrument purity: 0-line capture diffs vs the r64 driver
  on all four quad seeds, identical census scalars (see Q2).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **283 passed, 7 failed in 842s** (290 scripts) — vs r63's 281 passed,
  9 failed in 1211s. The 7 are a SUBSET of r63's 9, same signatures:
  the 6 pre-existing assertion-failure scripts named in r57–r62
  (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof, and
  the establishment-r20 family
  (test-establishment-r20-fixes-20261020.js: "NEW: next day voices
  once more (gate resets daily): expected 2, got 1")), plus
  test-measurement-cache-flags.js (1 failed assertion in-suite —
  r63 verified it passes solo 4/4 and classified it a
  concurrent-load flake; this run's suite ran while a sibling
  lane-B quick suite ran concurrently, same contention class).
  The two r63 timeout flakes PASSED this run
  (test-trust-observer-neutrality.js 98s, under the 120s cap;
  test-synergy-stall.js passed). No quick-list test imports this
  run's scripts, and this run's change set is drivers + analyzers
  + evidence with ZERO src/js, so it cannot have caused any of
  the 7.
- Suite side effect, checked not assumed: see closeout status
  check — any stray docs/ONTOLOGY.md modification left by the
  suite is discarded with `git checkout --`, never committed.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
Master at worktree creation: daf9e7c76. At closeout master had moved
to ee159dbc3 (sibling evidence-only merges plus one src change:
sim-chorus-a CHORUS-HOLD, fieldFights.js +36 — committed fighters
hold through a downbeat dance round instead of losing the finish;
narrow to chorus_line, requires a prior commitment). The branch was
rebased cleanly onto ee159dbc3 (no conflicts), and proofs were
re-run after the rebase as the body requires: node --check clean
on all three scripts, and a FULL quad re-run on the rebased base
into a scratch evid dir gave identical census scalars and 0-line
capture diffs on all four seeds, with 0 "chorus hold" lines — the
hold never fires on these paths, so r64's verdicts stand unchanged
on the new base as well as the measurement base. (The scratch
re-run dir was not committed; its comparison numbers are the
record above.)
Merged locally via `git merge --ff-only journey-scale-r64` →
master (hash in the branch log), pending ship (no bump, no push,
no live verify — ship loop owns those).
Branch commits: a7f9eb2f1 (prereg + driver, rebased from a66db4ae),
a711010db (quad + bank-trace wide band + evidence, rebased from
1a0784f09). This landing-section commit follows on the same branch
and is merged by a second fast-forward (hash in the branch log).
Worktree released + branch deleted at closeout; final main-tree
status clean. Rotation file written 3→0 at closeout and verified
by reading it back.
