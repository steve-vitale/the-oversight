# journey-deepening r105 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-05T1450CST (lock 2026-11-05T14:50:52Z).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 36%. Base master@b02eb9706 at worktree creation (sim-pantryspoil-a
merged into master after this run's pull: pantry spoil line now states
the unit count — narration only, does not touch conversation routing).
Rotation read 2 -> deepening; 2->3 written at closeout (see rotation
discrepancy note below). Lock deleted at closeout per the body's
even-on-failure rule. Prereg:
evidence/2026-11-05/journey-deepening-r105-prereg.md (written BEFORE
any seed ran; freshness section completed BEFORE the panel ran).
Seeds fresh **92201–92204**, competent policy (r104 driver lineage +
r105 analyzer), DAY CAP=100, death-aware stop. Smoke seed 92200 x
DAY CAP=45 proved the harness (survived day 45, wave 3, pop 8/8, 0
mislabels) and was deleted per the prereg. Heartbeats: registration,
~15:15, ~15:20, ~15:28, ~15:35 UTC, plus during the gate run.

## Rotation-write discrepancy (third sighting)

r103's note claimed 2->3 was written at its closeout; r104 found the
file still read 2 and wrote 3 at ITS closeout; this run again found
the file reading 2. The closeout write fails silently, three runs
running. This run wrote 3 at closeout and verified the write with a
read-back (`cat` shows 3 — verify at the next run's start; if it
still reads 2, the write path itself is broken, not the write).

## Session loss during the panel (r104 precedent)

The first panel attempt completed seed 92201, then the runtime
service restarted and the driver process was killed (no node process,
no error captured — a session/runtime loss, not a driver crash:
92201's JSON + 4 transcripts are intact on disk). Seeds 92202–92204
were re-run in one command (exit 0, ~220s). The panel is judged on
all four seeds; the split run is disclosed here, not hidden.

## Seed-band method note (read before reusing 922xx)

The naive exact-string scan for 92201–92204 listed ~75 files — all
false positives: digits inside floats (e.g. `8.298233922025991`) and
kcal values (e.g. `"pantryFreshBefore":92201`), never a seed. The
band was verified fresh by the boundary-aware checks instead: 0
seed-context hits (`"seed": 9220x` / `seed=9220x` / `SEEDS=…9220x` /
`s9220x` across evidence/ + scripts/ + docs/), 0 filename hits, 0
word-boundary .md mentions, 0 hits in scripts/, 0 hits in the
standacc-b forbidden list (99201–99208) and the other forbidden-band
preregs. Exact-string greps over JSON corpora are not a freshness
check — they drown in kcal values. Use seed-context patterns.

## Panel verdicts (pre-registered, no re-scoring)

- **P-KEEP (primary, REVISED metric): ABSENT — NAMED 0 / 2
  revisited-alive (old-regex NAMED 0).** Threads 11: NAMED 0,
  NAMED-STRUCTURAL 0, SILENT 2, DEAD 5, NO-LATER-SITTING 4. Zero
  `repay` sittings in the whole panel (16 transcripts: wants are
  ask_favor / curious / seek_comfort only). The revised metric is
  validated and working — it scores PRESENT 2/5 on r104's panel
  (Ruth's repay sitting; old regex 0/5) and the proof test is 12/12
  — but on fresh seeds it finds nothing to count, because no repay
  sitting happened at all. The metric was not the binding
  constraint this panel. The binding constraint is named precisely
  below (the coverage bound).
- **The coverage bound (the finding of this run): the promise dies
  with its maker, or gets buried under a fresh ask.** The two
  revisited-alive threads each show one half, both by design:
  - Carl (92201 day 45 -> 60): the day-45 food promise was made to
    a bearer who died before day 60. Succession released the promise
    (`ledger.js`: open promises are released, neither kept nor
    broken; the favor reverts to 'asked'), and the day-60 sitting is
    the designed inherited re-ask, naming the dead predecessor:
    "I asked Gabriela about the food I needed — Gabriela's gone.
    Still need hands. Are you in?" The r104 record check correctly
    does not fire: the favor is 'asked' (excluded by design), because
    the promise no longer exists. The repay voice belongs to the
    promiser; the re-ask voice belongs to the successor. Both fired
    as designed — the panel just never had a same-bearer revisit.
  - Lorenzo (92204 day 45 -> 60): the day-60 sitting opens on a
    LIVE ask_favor seed ("Can we talk?" -> fresh hunger ask,
    'stated'). The seed check in `convoSelectWant` runs before the
    r104 record check by design ("seeds keep priority — they are the
    more specific unfinished business"), so the repay record-select
    never gets its turn. Lorenzo's own day-45 opener was already an
    inherited re-ask ("I asked Oscar about the food I needed —
    Oscar's gone"), so his promise too was made to a bearer who has
    since died — the seed only decides which voice speaks first.
  - Mortality eats the denominator: 5 of 11 promise-makers died
    before any later sitting (Ricardo day 46 combat, Noboru day 48
    combat, Araceli day 57 monster, Donna day 99, Carl day 80).
    The fix's coverage is exactly: same bearer survives 15+ days to
    the next sitting AND no live seed pre-empts AND the favor is
    still fulfilled/broken/promised-with-obligation. In this panel
    that intersection was empty. No routing defect was found — the
    succession release and seed priority are designed behavior — so
    NO game-code change follows from this run (prereg contingency:
    a fix follows only a routing defect). The open design question,
    for Steve / the next run, is whether the re-ask should ALSO name
    the old promise's outcome (kept / broken / released with its
    maker) — that would widen the naming voice to the succession
    case, but it changes designed succession semantics, so it is a
    design call, not a tweak. Not built here.
- **V-INIT-BOND (carried): 0 across the whole panel — blank stands.**
  0 of 16 sittings contain an NPC-initiated bond proposal.
  Player-side invite options offered in 6/16, betrayal invitations
  in 7/16. The fix does not touch bonds; the system-level blank (no
  engine path for NPC link proposals) still needs a builder brief,
  not a tweak. build-bond-initiate is in flight in another worktree,
  NOT merged.
- **G-SENSE (carried): 0 senseless sittings.** All 16 transcripts
  read in full — see people check.
- **B-SIT (carried): 7 betrayal sittings** (4 accept / 3 decline /
  0 unanswered). **B-FOLLOW: 2 follow-up sittings**, 1 with a new
  betrayal. **B-LEAD (descriptive): 3 sittings** with betrayal
  lead-ins — "Walk with me?", "Come see what I found." (Araceli,
  Carl, Lorenzo). Blocked-agreement clean (badBlocked=0,
  badRevisit=0 on all seeds).
- **D-THING (descriptive, r95 open item — still open):** 3 declines
  leave a pocketed thing (Carl 92201 day 60, Ines 92202 day 80,
  Máximo 92204 day 80); 0 revisited in a later sitting, 0 mentioned.
  All three are last-sitting cases (maker died after, or day 80 is
  the last convo day), so the count method still cannot distinguish
  "never comes back" from "no later sitting existed". The pocketed
  thing still never comes back. Same count method as r104.
- **S-TRACE (carried): EXPLAINED 3/4, NO-REGIONAL-DAYS 1/4**
  (92203 lost day 36, before the deepening window). G-mismatch 0
  on every seed and day (the r102 fix holds). G-STICK: 92201 stuck
  1/1, 92202 stuck 3/4, 92204 stuck 3/3 (top goals do not move
  across the window — same shape as prior runs). G-LINES:
  food_security dominates (232/271, 201/247, 64/74, 271/293);
  bonds 0, knowledge 0, build_standing 0, gear_up 0 everywhere.
  G-STALE: 1 item (92204 day 80, Jesse idle/done carrying
  party_up) — reported, not counted as a defect per the analyzer's
  framing. K-CONTEXT lessons 43/57, 45/45, 19/42, 40/40; bot
  proposed a link on 3 of 4 seeds (propose=2 linked, 1 counter, 2
  counter+linked); diplomacy 0 everywhere, as in r102/r103/r104;
  mislabels 0.
- **Survival (descriptive, not a winnability verdict): 2/4
  survived** (92202 day 101, 92204 day 101, both wave 4, regional);
  92201 lost day 99, wave 4; 92203 lost day 36, wave 3. Standing
  max 100/150/0/100. All seeds reached at least wave 3; none
  reached wave 5. Meat channel alive on all seeds (kills 27/23/12/
  22, tests 8/8/2/2, reveals 8/8/2/2, dinners 11/8/1/0).
  92202's link IS seasoned (village_0, age 70, trust 62, active) —
  the first seasoned link in the deepening window since r102; the
  other survivors' links are unseasoned.

## Village assessment, in plain words

Two villages held through the deepening window and two did not —
and the talking this time shows people remembering the dead, even
when no promise gets named. Carl's village asks the new bearer for
the food Gabriela was promised, naming her; Lorenzo's does the same
for Oscar. The villages that survived still barely link — one link
each, one of them finally seasoned after two months — and their
people still mostly ask for the same things (food, water, hands)
rather than each other. The villages that died, died thin: one at
day 36 before the window even opened, one at day 99 with three
people left.

- **92201 (lost, day 99, wave 4, regional, standing max 100):** two
  sittings on day 45, then Carl's re-ask on day 60, then Brian's
  grief on day 80. Ricardo promised food and died in combat the
  next day; Carl promised food, his promiser died, and he re-asked
  the successor naming Gabriela. Lessons 43/57 — it knew what it
  was taught and died anyway.
- **92202 (survived, day 101, wave 4, regional, standing max 150):**
  the steadiest village — 7 sittings, the panel's only seasoned link
  (village_0, age 70, trust 62), lessons 45/45, the full bench. It
  still lost Araceli, Noboru, and Donna between sittings — three
  promises died with their makers.
- **92203 (lost, day 36, wave 3):** no sittings at all — the village
  was gone before the first convo day, starved and sick (deaths:
  sickness x3, starvation x2, wound, contest). It still ate one
  monster dinner in 36 days.
- **92204 (survived, day 101, wave 4, regional, standing max 100):**
  the talker — 5 sittings, Lorenzo re-asking for Oscar at day 45,
  David and Jesse promising food at day 60, Máximo curious at day
  80. Lessons 40/40. Alive, knowledgeable, barely linked.

## People check (all 16 transcripts read)

G-SENSE 0 senseless. Notes, not defects — except the one marked:

- **Carl (92201, truck driver, steady):** day 45 a shaking-hands
  hunger promise + betrayal accept with a gifted tool; day 60 the
  inherited re-ask naming Gabriela, promise again, betrayal decline
  ("Another time, then." A small thing, pocketed.); died day 80.
  SENSE — and the succession seam working as designed.
- **Ricardo (92201, dentist, prickly):** day 45 a clean food promise,
  died in combat day 46. SENSE.
- **Brian (92201, zookeeper, gentle):** day 80 grieving, betrayal
  accept, trap-line walk, comfort, gossip naming real people
  ("Dmitri headed out for water.", "Birgit is back."). SENSE.
- **Araceli (92202, street artist, withdrawn):** day 45 food promise
  + betrayal accept ("It's quiet at the hollow. ...Sometimes that's
  the whole point."), died day 57. SENSE.
- **Donna (92202, hotel housekeeper, mischievous):** day 45 curious,
  warm, specific home-voice ("Home isn't a place. It's people who
  notice when you're quiet."); day 60 a food re-ask, promised; died
  day 99. NOTE (not a defect): the home line fires twice in the day-45
  sitting, one word apart ("I'll make it a home" / "I'd make it a
  home") — the repeat ledger tracks by exact text, so a tense change
  slips through. One line, worth a look, not a fix this run.
- **Noboru (92202, truck driver, anxious):** day 45 a forage-help
  promise with a real place ("The bitter manioc patch past the
  treeline, before the dew dries."), died day 48. SENSE.
- **Meera (92202, dentist, dry) / Tom (92202, truck driver,
  withdrawn):** day 60 short food re-asks, promised. SENSE. (Tom's
  trust is 1 and he still asks — the ask doesn't gate on trust,
  which reads right for hunger.)
- **Ines (92202, florist, warm):** day 80 a water-haul ask with the
  honest road-deflect ("I'm out on the road. I can't ask you to meet
  me at dawn when I'm miles away."), betrayal decline, pocketed
  thing. SENSE.
- **Lorenzo (92204, roofer, mischievous):** day 45 the inherited
  re-ask naming Oscar + betrayal accept that teaches slope-reading
  ("how their grandmother did it"); day 60 a fresh hunger ask via
  seed, 'stated', promise never named. SENSE — and the seed-priority
  half of the coverage bound.
- **David (92204, plumber, cautious) / Jesse (92204, line cook,
  withdrawn):** day 60 clean hunger promises ("I'm running on empty
  here.", "I... should go."). SENSE.
- **Máximo (92204, cook, withdrawn):** day 80 curious, self-
  deprecating tracking ("well enough that nobody's died from it
  yet"), betrayal decline, pocketed thing. SENSE.

## The blanks this run fills

1. **The revised P-KEEP metric is validated and its verdict is
   honest.** The widened regex + structural repay count score
   PRESENT 2/5 on r104's panel (old regex 0/5) and the proof test
   is 12/12 — the instrument now sees the fix's lines. On fresh
   seeds it scores ABSENT 0/2 because no repay sitting occurred,
   not because the metric is blind. The metric question is closed;
   the coverage question is now the open one.
2. **The coverage bound is named precisely, with its two halves
   traced to code.** Succession release (ledger.js: promise
   released, favor back to 'asked', repay seed deleted) and seed
   priority (`convoSelectWant`: live seeds beat the record check)
   together with maker mortality (5/11 threads DEAD) leave the
   r104 fix an empty intersection on this panel. No routing defect
   was found; no game-code change follows.
3. **r102 fix confirmation (carried):** goal mismatch 0 on all
   fresh seeds/days — the stale-goal-line reset holds on the live
   code.
4. **V-INIT-BOND blank re-confirmed on fresh seeds:** 0/16, same
   mechanism (UI-only propose functions). Still needs a system.
5. **First seasoned link in the deepening window since r102:**
   92202 village_0, age 70, trust 62, active (standing max 150).

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = fresh 922xx
4-seed panel: **quiet (4 files, 4 metrics, no large deviations).**
Sums: w3fights 20 (baseline 18), engagedW3 16 (baseline 23),
fightsTotal 63 (baseline 60), fightsByWave.3 20 (baseline 18).
No LOUD lines, no investigation, no baseline roll.

## Metric review

- **The revised metric is validated, but the verdict stayed ABSENT
  because the denominator, not the regex, binds now.** Revisited-
  alive threads were 2 (r104: 5, r103: 2) — mortality and the
  15–20-day sitting spacing leave few revisits to judge. Proposed
  for the NEXT run (not this one): raise the revisit count, e.g. a
  mid-window sitting day (day 52/53 or 67) or a fourth convo day,
  so the panel judges the fix on more than two threads. A denser
  sitting cadence is an instrument change, not a re-score.
- **Analyzer quirk (latent, not triggered):** `classifyPromiseThreads`
  pools deaths across all seeds when classifying DEAD. Both DEAD
  calls this panel were verified own-seed (Ricardo day 46 in 92201,
  Noboru day 48 in 92202), but a same-vid death in another seed
  would misclassify. Proposed: scope the death lookup to the
  thread's seed in the next analyzer revision.
- **D-THING stays open** (3 pocketed, 0 revisited, 0 mentioned)
  with the same count method as r104. All three this panel are
  last-sitting cases, so the method still cannot separate "never
  comes back" from "no later sitting existed".
- **V-INIT-BOND definition held:** betrayal lead-ins stay out of
  V-INIT-BOND (B-LEAD split kept); no repay sitting occurred, so
  the structural rule was exercised only by the proof test, not by
  the panel.
- No pre-registered metric was re-scored mid-run. P-KEEP, V-INIT,
  and the carried instruments are reported exactly as pre-registered;
  the metric revision was adopted in the prereg before any seed ran.

## Harness

scripts/journey-deepening-r105-20261105.js (r104 lineage: only
output filenames, header, and the seed band 92201–92204 changed).
Analyzer: scripts/analyze-journey-deepening-r105-20261105.js
(r104 scans carried + the revised P-KEEP regex and structural
repay detection + filename/band changes only). Proof test:
scripts/test-journey-deepening-r105-pkeep-metric-20261105.js
(12/12; not on the green list, same precedent as the r102 test —
do not add it). No game-code change this run. Per-seed JSONs + 16
transcripts: goal hidden_files evidence 2026-11-05
(journey-deepening-r105-seed9220*.json,
journey-deepening-r105-transcript-9220*.txt). Prereg + this note in
repo evidence/2026-11-05/.

## Regression gate

`node scripts/check.js --quick` with
--cacheDirectory=/tmp/jest-cache-playtest, single run, 1633s:
**277 passed, 13 failed** — vs r104's 279/11. The 11 are the
identical pre-existing game-test failures (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
measurement-cache-flags, phone-frame-proof,
trust-observer-neutrality, synergy-stall 120s timeout, capable-bot
120s timeout, establishment-r20-fixes, table-endings 120s timeout);
none touches this run (tooling only, zero game code). The 2 extra
failures are both 120s timeouts (exit null), not assertions:
test-throttlefeast-20261014.js and
test-first-ability-magic-20261014.js. Both PASS standalone, run
directly after the gate (throttlefeast 17 pass / 0 fail;
first-ability-magic 23 passed / 0 failed) — load timeouts under a
box load average of ~29 with six concurrent check.js runs (siblings'
gates), not regressions. The gate ran long (1633s vs r104's 1204s)
for the same reason. Proof test is not on the green list (same
precedent as the r102 test — do not add it).

## Registry lock pile-up (infrastructure note, not a run blocker)

During the gate, the REGISTRY.lock queue piled up: Lane B's
build-tbobs-verb registration has held the lock since ~15:57 UTC
while its `git worktree add` → `git reset --hard` checkout crawls
under load (36s CPU in 10 min elapsed — starved, not deadlocked),
with a second Lane B registration, three reaps, and several
heartbeats queued behind it. This run's heartbeat went ~15 min
stale (last confirmed 15:53:08 UTC) while two heartbeat attempts
waited in the queue. No damage: the worktree is dirty, so the
reaper cannot remove it, and no other playtest run starts for
hours. The queue drains on its own as the checkout finishes; do
not kill another agent's registration to jump it.
