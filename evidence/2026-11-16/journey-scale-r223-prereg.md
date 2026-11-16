# journey-scale r223 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp on current master + profilegate-bypass continuation read)

**Run id:** `playtest-loop-a-scale-r223-20261116T0755Z` (lock run_id
`2026-11-16T07:55:00Z`).
**Run:** scheduled Mon 2026-11-16 01:45 CST (07:45 UTC); lock created
07:55Z (run started ~10 min late).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `4b1800402` at prereg time (worktree registered
at `0740ce985`, rebased onto `4b1800402` after Lane B's crisis-r223
merge landed mid-registration; the only `src/js` change in that merge
is `conversation.js` +10, a drift-note stage-direction filter —
dialogue-only).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 40%, lock absent (no stale-lock recovery), `git pull` already up
to date at 0740ce985. Reap: ran clean (11/16 active; 4 dirty trees
owned by oversight-flesh-out-loop left alone per reaper rules).
Worktree `journey-scale` registered ~08:02Z (registration took ~7 min
— the box is heavily loaded); heartbeat landed 08:05:12Z, hbloop
`~/workspace/worktrees/journey-scale-hbloop-r223.sh` (10-min cadence)
launched 08:05Z.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run — it measures the on-ramp and reads people; any fix it
finds is dialogue/narration-scoped, or it is documented, not built.
**DELIVER OVER MEASURE (2026-11-01):** this run measures the national
on-ramp on current master AND reads whether the landed profilegate
bypass engages organically under the scale policy — a continuation read
with a real lever in the game, not a re-proof.

## Standing context (read before scoring)

- **r219 scale (landed 2026-11-16, master 25f034bb2):** national 0/8 on
  fresh seeds 135609–135612; survived **2/4** per arm (135609, 135612
  alive d141/d140; 135610 over d87, 135611 over d76); lived-days 444
  vs 3-band rolling mean 513 (−13.5%, HOLD); lesser seat priced 4/4;
  **tribute DELIVERED 0/4** (ready 2/4, both veterans-short on all 8
  attempts — the M23 shape); blocker on both survivors: LEAD 1/3 and
  2/3 seasoned — one more seasoned link short. Sortie arm: 0 calls on
  99 lingerer days — the gates, not the policy, are the blocker
  (`sumHp` 64×, `minHp` 27×). Goon ask-tag fix landed + proven live
  (proof 27/27). W5-INSTANCE: 135609 MIXED (9 fights, ling17 + ling18
  recur with falling HP, 3 fresh full-HP spawns), others UNANSWERED.
  Spotter thin (one skilled spotter per surviving village at most).
  Telemetry 2 LOUD down (fightsTotal −64%, w4 −79%) — investigated as
  band noise, baseline NOT rolled.
- **What changed in the game since r219's base (4c30c022a → 4b1800402):**
  net `src/js` diff is **three files**: `build.js` (version stamp),
  `conversation.js` (+15 r219 goon ask-tag fix — already in r219's
  panel; +10 Lane B drift-note stage-direction filter — dialogue-only),
  `villager-agency.js` (+18/−1 **PROFILEGATE bypass**, sim-launchdef-a
  PILOT GO, landed `ed542bba4`, seed call reverted `b735283cd`). The
  bypass: a bid-and-selected `party_launch` plan bypasses the
  non-ranger profile gate in the depart path; every other launch
  condition unchanged. Launchdef measured it WITH a vetparty seed call
  (plans almost never form without one — "on master without a seed
  source the fix is nearly inert"). So the bypass's organic engagement
  under the scale policy is this run's secondary question, read from
  downstream signals only (wave-4 fights/kills, living veterans,
  tribute, national) — the launchdef skip-reason recorder is NOT
  ported (scope; the driver carries no launch recorder, so a kill
  jump alone would be suggestive, not attributive — say so if it
  happens).
- **The wall (tracker, scale-onramp):** national 0/24 on the judged
  corpora; the binding gap is veterans / seasoned links, not survival
  (r219: 2/4 survived, tribute ready twice, still LEAD 1/3–2/3). The
  wave-5 door is the other open question: entities linger for weeks,
  are never fought, and the one-vs-successive shape is MIXED on one
  seed, UNANSWERED on the rest.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary with
  ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG, COVENANT,
  TRADE, CONQUEST, or REFUSE. Ladder stage 3 (points) is NOT national.
  Q1 measures the polity (natgate `nat=true`), ladder stage secondary.
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; hunger scatter;
  sickness-without-a-healer collapse; "left someone behind" /
  "Okay. You don't have to have an answer." line-pool reuse; raise-talk
  closers formulaic ("All right — let's ask them." echo); flag-emoji
  openers in -nv sittings; "Don't tell the others. Everyone needs one
  place." thinking-spot line; nonverbal closing pool thin; "The ease
  drains out of it, a little." reuse; herald linger / wave-4 variety
  collapse (herald kills now land; the linger side did not). Sortie
  gates (min/sum HP caps) — gate call owed, not made; the sortie step
  stays inert this run. Wave-4 trick observation starvation (r222:
  6/8 seeds stuck at 1/2 observations) — deepening's question, noted
  for the scale read (fewer wave-4 kills → fewer veterans).

## Q1 (PRIMARY) — NATIONAL ON-RAMP: measure it on current master, single arm

**Question:** in a competent 140d panel on fresh seeds, how many villages
reach national (a polity lives, `nat=true` in the natgate file), and when
they don't, what is the single binding constraint per seed — the closest
road (LEAD/COVENANT/TRADE seasoned counts), what it lacks, the pending
shape, the belong good flag, or collapse before the national window?
SECONDARY: does the profilegate bypass engage organically — wave-4
fights/kills and living veterans vs r219's band (arm A: 38 wave-4
fights, 9 wave-5 fights, 0 wave-5 kills, tribute ready 2/4 and
unpayable)?

**Interesting-finding rule (binding):** the run is informative iff EITHER
≥1/4 seeds reach national (GO — the on-ramp is open on current master,
the wall moved) OR 0/4 AND the analyzer names a per-seed blocker for
every seed (NO-GO on the wall, blocker named — the finding IS the
blocker). 0/4 with no diagnosable constraint (e.g. all seeds die before
d60 with no links at all) = INCOMPLETE — document and move on, do not
re-score the panel against a friendlier metric.

**What would overturn the picture:** ≥2/4 national, or a full seat, or a
seed whose blocker is a named defect with a narrow fix (that becomes the
run's blank — fix + proof, or document in sim-findings.md). A wave-5
KILL overturns the r207/r215/r219 "fought, never killed" shape. A
wave-4 kill jump with a mechanism read names the bypass as
survival-relevant; without a launch recorder in the driver, a kill
jump alone is reported as suggestive, not attributive.

## Q2 — REGRESSION GUARDS (fail the run if any breaches)

- r134 spoken-raise: 0 not-offered-spoken raise talks AND ≥1 properly
  answered per arm (the analyzer's classifier; exit 2 if an arm has no
  raise talks at all — INCOMPLETE, not a verdict).
- Vetbar: 0 days where readiness veterans != ladder veterans per wave 4
  and wave 5.
- Trap-line: 0 defect sittings (mime shown, no nv:answer at turn 0).
- Betrayal sibling: 0 turn-0 betrayal:accept offers without the invite
  label in the sitting's opening THEM lines.
- Nod-loop (r132 re-proof): 0 sittings with a streak of ≥4 consecutive
  identical nv: react gestures (nod/smile/pointself, excluding
  nv:listen, which progresses); max streak reported per sitting.
- Lived-days within ±25% of the **3-band rolling mean 476**
  ((r207 461 + r215 522 + r219 444)/3 = 475.67 → 476; guardrail 357–595)
  — **rolled forward one band from r219's 513, recorded here before the
  panel runs** (the rolling window moves with the bands; r219's 444
  replaces r206's 555 in the window). No alive/dead flip without an
  attributed cause.
- Lesser seat priced ≥3/4.

## Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried)

Count in the panel's say-captures: daily-play mimes shown vs
nv:accept/betrayal:accept taken in daily play (capture lower bound + betray
watch off-day events). Expected 0 daily accepts — the gap, confirmed.
Record the lane decision owed; no build claimed. Baraka re-check: any
comm-'none' villager with a staged raise in the band, and what happened.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal sittings
AND all raise talks. Bar: senseless 0 for the raise-answer class (a spoken
raise answered with the words that fit what was said; no English YOU lines
in a no-words sitting; no nod loops past the answer). Re-check surfaces:
the r214 plain parting, the r211 quote fixes, the r209 deferred-ask ledger
guard + favor-block noBeat, the r208 lapsed-want thread, the r137
want-thread resume (a deflected question re-posed — does it read as a
person returning to something, or as a loop?), the r218 commit-refusal
noBeat, the r216 funeral-mend partial line (does the honest claim read?),
the r219 goon ask-tag fix (does the substitute text now read as a thread
beat, never as an ask?), the r223 drift-note filter (does a resume opener
still quote a drift note as memory?). **Stutter watch:** any
seed-opener line of the shape "About X — <the same X as a question>"
is a live recurrence of the Rufina stutter — record it with the want +
seedNote.

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close). Spotter read: villagers
with foodXp.spotter > 0 / spotter skill ≥ 1 per seed — d90 FIRST (the
binding read), end second. Funeral-mend watch: any funeral/mourning shape
change vs r219's band. **W5-INSTANCE read:** per seed, the wave-5 shape
(ONE / SUCCESSIVE / MIXED / UNANSWERED) with the hp-trajectory evidence
behind it. **Sortie ledger:** the step is inert this run (single arm) —
linger presence is read from the monster census, not the sortie file.

## Panel

- **Seeds: FRESH 135613–135616** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak). **Single arm.**
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196/r197/r204/r206/r207/r215/r219) — NO chooser
  change in this run beyond the r207 secret:* ENGAGE addition (kept).
- **Driver:** `scripts/journey-scale-r223-20261116.js` (r219 driver cloned:
  labels/seeds/EVIDIR only; sortie step inert, ARM=A).
- **Analyzer:** `scripts/analyze-journey-scale-r223-20261116.js` (r219
  analyzer cloned + lived-days control 476 + SORTIE section note that
  the step is inert this run).
- **Proof:** `scripts/test-journey-scale-r223-analyzer-20261116.js` — the
  real analyzer on synthetic corpora (r219's 70 assertions + renumbered
  control case). **70/70 green before the panel runs.**
- **Pilot:** seed 135613 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

135613–135616: 0 hits naming the band in any dated prereg
(`grep -rlE '135613|135614|135615|135616' evidence/ --include='*prereg*'`,
all dates, run 2026-11-16 in the main tree — two independent runs) and
0 hits in any .md note under evidence/ (`grep -rlE '135613|135614|135615|135616'
evidence/ --include='*.md'`), and 0 hits in `scripts/*.js`. The
goal-hidden scan found 4 files matching `13561[3-6]`, all verified
false positives, none a seed: a pantry kcal value (`pantryFreshAfter:
135616`) in a 2026-10-16 crumbdefault census JSON, and digit-tails of
floating-point numbers (nourishment `21180.330650135613`; CI bound
`-0.0006135614821172816`). Forbidden-band lists naming 13561x: none (the
lists found name 73641–73648, 73671–73678, 871xx —
sim-scale-onramp-round-0615.md:123). Recent preregs use only 135601–
135612 (r207/r215/r219's bands). Fresh band confirmed before the panel runs.
No game fixture seed is needed this run (the analyzer proof uses
synthetic corpora, no staged game).

## Telemetry decision (adopted — r219's owed proposal, decided here before the panel runs)

The per-run telemetry check drops `fightsTotal` and `fightsByWave.4` —
the metrics are noise-dominated at a 4-seed panel size (six bands now
span 87–400 with no code change between several of them; r219 was
2 LOUD lines down on a dialogue-only diff). The lived-days guard (Q2,
476 ±25%) already carries the band-shape signal. This run's telemetry
check uses `--metrics maxGameDay` only, against the scale.json baseline
(468). The baseline file is NOT edited — the fight metrics stay in it
for any future multi-band roll; only this run's check drops them.

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker; bypass-engagement read as a secondary, downstream-only).
- Q2: the guards as written (lived-days control rolled forward to the
  3-band mean 476 — the roll itself is this run's metric change,
  recorded here before the panel ran, per the rolling-mean practice;
  nod-loop guard carried).
- Q3/Q4/Q5: as written. Spotter: d90 read is the binding read (third
  live band). W5-INSTANCE: now answered per seed by the monster census
  + fight rows (sortie ledger inert).
- Telemetry: maxGameDay only (decision above).

## Closeout (2026-11-16, after the panel)

- **Q1 NATIONAL: NO-GO on the wall, blocker named per seed — 0/4
  national.** 135613 LEAD 2/3 seasoned (needs 1 more — 3rd sub 12d
  old); 135614 COLLAPSE d137; 135615 LEAD 2/3 (no 3rd sub exists);
  135616 LEAD 1/3 seasoned (needs 2 more). Informative by the
  prereg's rule (0/4 with a named per-seed blocker).
- **Tribute: NEVER-READY 0/4** (0 attempts). Living veterans peak at
  1 on every seed — the second living veteran never coexists with the
  first. A step back from r219's ready-but-unpayable.
- **Wave-4 kills: 9 band total** (7 scholar, 2 villager, 1 living
  villager at end) vs r219 arm A 14 (11 scholar, 3 villager, 1
  living). **Bypass secondary: NO downstream movement** — real
  wave-4 fights ≈ 43 vs r219's 38; the headline 194 counts 151
  refused Herald meetings (see the run note's instrument note). The
  launch-level question stays open (no launch recorder).
- **Wave-5: 0 fights on all seeds; W5-INSTANCE UNANSWERED.** Live
  wave-5 entities 0 days (135613, 135614), 1 day (135615), 2 days
  (135616). The door never opened: living veterans peak at 1.
- **Q2 guards:** spoken-raise GO (9 talks, 7 answered, 2 holds, 0
  defects); vetbar GO (0 disagreements); trap-line HOLD (1 answered
  sitting, 0 defects); betrayal HOLD (0 turn-0 offers); nod-loop
  HOLD (worst 3x); lived-days HOLD (559 vs 476, +17.4%); lesser
  HOLD (4/4).
- **Q3 daily-play mime:** 11 daily mimes, **0 daily accepts proven**.
  Gap carried; lane decision owed.
- **The run's finding — the Herald muster gate (135614):** 151
  Herald meetings, 0 fights, 104 refusal lines ("muster 10 allied
  blades (you have 0)"). The muster verbs exist ("sound the call",
  `titanCommitOwn`) but the competent policy never drives them; the
  sortie path is closed by the r219 driver HP gates. Documented as
  the run's blank; a driver-side muster step is owed to the next
  scale run's prereg with a cost bar. NOT built this run.
- **People check:** 12 transcripts + 9 raise talks read in full. No
  stutter recurrence, no r137/r218/r216 regressions. Harper's
  food-monologue (want never surfaces — the r222 Onni wart family),
  the "All right — let's ask them." echo in all 7 accepts, Emma's
  "Okay. You don't have to have an answer." and Sanne's "Don't tell
  the others. Everyone needs one place." (both carried line-pool
  reuse, seen again). Full write-up in the run note.
- **Telemetry:** QUIET (maxGameDay 559 vs baseline 468, +19.4%).
  Baseline NOT rolled. The band justifies dropping the fight metrics:
  the raw fightsTotal would read QUIET while hiding that 151 of the
  wave-4 count are refused meetings, not fights.
- **Gate:** 334 passed, 6 failed in 813s — **0 attributable** (the
  identical standing set as r221/r222; branch modifies zero tracked
  files).
- **Fix landed:** none. Instruments (driver + analyzer + proof,
  70/70) are the landed work.
- **Rotation:** 3 → 0 at closeout. **Lock deleted at closeout.
  Heartbeat loop killed at closeout.**
