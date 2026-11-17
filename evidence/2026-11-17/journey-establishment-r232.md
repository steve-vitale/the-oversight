# Journey leg ESTABLISHMENT — r232 run note (2026-11-17, Lane A)

## Run
Run id `playtest-loop-a-20261117T1346Z` (scheduled Tue 2026-11-17
06:45 CST). Rotation read `1` (establishment); write `1→2` at
closeout with read-back. **Base:** local master `e5028debd`
(journey-landing r142). Heartbeat loop running (9-min cadence,
`journey-establishment-hbloop-r232.sh`, pid 15757, setsid-detached
per the r141 lesson). Pre-flight: main tree CLEAN, disk 46%. Lock
created by this run 2026-11-17T13:46:00Z. No push (ship loop owns
pushes). Registration took ~17 min (slow checkout under box load
~12.9 — the `git reset --hard` child was working, ~2 min CPU; not
stuck, just contended).

## Pre-registered bars (r232 prereg)
Q1 FAVORLESS ASK, RE-MEASURE OF THE r231 FIX on a MATCHED band
(101201–101205, re-released for exactly this purpose in the prereg).
Q1b WANT-RAISE, regression guard. Q2 SITTING CLOSES, standing bar.
Q3 recap paraphrase, report-only. Carried bars: SPOTTER, LADDER,
FASTER-ID, END BAR, TRUST GUARD, VILLAGE BAR, JAM, STRANDED /
TRAVEL / THREAD watches, PEOPLE CHECK, SCHOLAR-DEATH standing
metric (r231 hit 3 — if r232 also ≥3, escalate to a matched A/B on
the companion guard), ROSTER-RECONCILIATION watch. New
instruments (read-only): standing totals at end, per-dawn scholar
location (`scholarDawns`), full telemetry type-count map.
Pilot gate passed first try (see below).

## Pilot (seed 101201, 42d)
Ran clean in ~26s: endDay 43, aliveEnd 12, aliveAt40 12, wave 3,
standing 90, pantryEnd 53,462, wedgeSits 71, committed 4, bumpCalls
54, bumpBenefit 44, codexPlants 21 — BIT-IDENTICAL to r231's pilot
on every reported number. Gate: 2 sittingCloses records with
closing beats (Gladys 2, Frank 3 — same names, same beats as r231),
62/62 wedge social sits carry Q1 trace fields, spotter instruments
fire, rosterDepartures present (empty), standingEnd 90 non-null,
scholarDawns 42 records (days 2–43), teleTypeCounts 51 keys. No
scholar death on the pilot — the location instrument is proven
structurally by the per-dawn records, per the prereg. Panel
proceeded on the same driver.

## Analyzer verdicts (r232 panel, seeds 101201–101205, 42d)
- **Q1 FAVORLESS ASK: GO — 2/77 raised asks (2.6%) never
  materialized into a committable favor (r231: 13/82 = 15.9%).**
  Rate < 20%, stage-0-deflected 0, every sit classified. The r231
  fix works on the matched band: the rate fell 13.3 points with
  the same villages, same driver, only the base changed. The
  residual is 2 sits, both class E1 (opener never ran) — and the
  shape of the residual is the finding below (F1).
- **Q1b WANT-RAISE: GO — 77/293 social sits raised ask_favor
  (26.3%); any-want sits 275/293; zero-raise seeds 0/5.** Kinds:
  forage_help 59, (no-kind) 2, food_share 6, heal_help 7,
  sick_help 3.
- **Q2 SITTING CLOSES: 0/10 CUT — GO.** 0 engine-ended with
  closing beats, 0 other no-close. The r224 F4a/F4b/F4c dry-line
  fixes, r228 C3c/F2 fixes, and r226 F6 dry-opener guard hold in
  the wild (0 recurrences in their classes). C3d recap fix holds
  twice over: Priya's "we're still on that personal stuff" and
  the 101205 sitting's "Still on that foraging help." Parting
  pool: see 0, care 0, tomorrow 1 — the first serve in three
  panels (r230 + r231 both 0), so the r231 third-panel rule does
  NOT open the reachability question; the lines are reachable,
  rare (1 serve in 10 sittings).
- **Q3:** recap paraphrase distinct 0/10 sittings (raw 0) —
  report-only, no second formulation owed. Canned lines
  (distinct/raw): walked-in 1/2, take-it 1/2, pod-dream 0/0,
  recap-stitch 0/0, slope-reading 0/0, stew-bowl 0/0,
  pod-dream-open 0. (The recap answers this panel phrased it
  differently — "we're still on that personal stuff" — the
  paraphrase needle's exact "still where we are" didn't fire.)
- **SPOTTER GO:** 41 total (16/10/1/10/4), 5/5 seeds > 0.
- **LADDER 3/5** (pace read, report-only under a SPOTTER GO).
  Seed 101203 misses pace (Jayden 1 XP) — foraging volume
  collapsed there (bumpCalls 16, forage tele 16) after the
  village lost Victor, Devon, and Ernesto; seed 101205 misses
  (Ivan 4 XP — the thin end persists on the same seed, a
  different villager than r231's Ruth). Spotter XP still
  concentrates in one forager per village (Hazel 16, Renee 10,
  Jayden 1, Marvin 10, Ivan 4) — the same mechanism as
  r210/r217/r221/r225/r230/r231: spotter XP tracks foraging
  volume, not time.
- **FASTER-ID GO:** 5/5 seeds, 174 benefit plays in 255 bump calls
  (r231: 172/249 — the near-identical benefit count is a
  curiosity of the first-per-day cap, not a defect; bump calls
  differ).
- **CODEX 140** plants identified at end across 5 seeds (r231: 131).
- **END BAR 15/15 scored** (+1 excluded tail: 101202 Wei,
  first-seen-broken d42, run ended d43). TRUST GUARD 0 drops.
  VILLAGE BAR 5/5 alive d40. JAM 0. STRANDED: 0 stranded dawns —
  NO-OPPORTUNITY (the r231 stranded shape did not recur; Miles
  died d37 on 101205 with no previous-bearer run forming).
  THREAD 1/1 paged opportunity closed within 2 dawns (Kate d19,
  PAGED). TRAVEL 0/0 — NO-OPPORTUNITY.
- **ROSTER:** 0 unaccounted on all five seeds. Departures logged
  and matched by id everywhere (8 villager deaths, all matched).

## FINDING F1 — the residual 2: a betrayal case thread eats the sitting

The r231 fix killed the settled-ledger shape entirely: 0 of the 2
residual sits involve a settled favor (r231: 12/13 did). What
remains is pure thread pre-emption, and both sits are the same
shape — a betrayal case thread occupies the whole sitting:

- Ava d20 (101204): sitting opens on a grief thread; the wedge
  presses 6 `betrayal:*:case_5` picks + goon + silence. The want
  opener never ran (probeOpen carries only findNeed calls, no
  wantOpener). ledgerFavor null, wantFavor null, need
  forage_help/u2 live the whole time. Result no-offer.
- Chantal d15 (101205): sitting opens on a lately thread
  (resumedOnce true); 6 `betrayal:*:case_6` picks + goon + more.
  Same trace: opener never ran, no favor anywhere, need
  forage_help/u2 live. Result no-offer. (Chantal d15 is also one
  of r231's 3 never-pressed-help residuals — the same villager,
  same day, same shape surviving the fix.)

Neither sit pressed `dlg:help` — the case thread filled all 8
turns with its own picks, and the ask_favor want waited at stage
0. Both asks surfaced in a later sitting (stage-0-surfaced 2/2):
the ask is DEFERRED, not lost. No fix this run: the precedence
question — should a live ask_favor want pre-empt a case thread's
opening, or is a running trial the sitting's rightful content? —
is a design question for the conversation build arm, and the cost
here is a day's delay on a forage ask, not a lost ask. Whether
`dlg:help` is even offered mid-case is unprobed; the trace records
only the picks taken. Named next blank: case-thread vs
want-opener precedence.

## FINDING F2 — scholar deaths 4, and the location instrument's read

Four mantle-holders died, all "the wild" — Clarence d20 (101202),
Ernesto d41 (101203), Esmeralda d21 (101204), Miles d37 (101205).
That is ≥3 for the second straight matched panel (r230: 0, r231:
3, r232: 4), so the prereg's escalation rule TRIGGERS: a matched
A/B on the companion guard is the named next step, for the sim
lane (not this run). The new instrument reads against the
long-exposure hypothesis the guard would need:

- Clarence d20: last dawn d20 at (4,4), atHaven=true, inside=false.
- Ernesto d41: last dawn d41 at (3,4), atHaven=false.
- Esmeralda d21: last dawn d21 at (4,4), atHaven=true, inside=false.
- Miles d37: last dawn d37 at (5,5), atHaven=false.

All four woke AT Haven or ONE TILE from it ((3,4) and (5,5) are
adjacent to Haven (4,4)) on the day they died — no multi-dawn
away pattern anywhere in the scholarDawns records. The deaths
look like same-day outings that ended in the wild, not a scholar
stuck out on a long expedition. The dawn-location proxy is weak
for the death itself (the scholar leaves after dawn; the record
is where they woke, not where they fell), so this does NOT
exonerate the guard — but the shape the guard hypothesis needs
(longer expedition exposure) is not in the data, and the A/B
should carry a death-moment location instrument, not just dawn
locations. The mantle passed every time (mantle_become 1 per seed
on 101202–101205). No src/js change from this run on scholar
deaths.

## FINDING F3 — wave-4 unlock attributed: standing 100 is the line

Standing totals at end: 90, 95, 100, 125, 75 → wave 3, 3, 4, 4,
3. That split matches the configured threshold exactly:
`standingCfg().t4 = 100` (standing.js:39). On this band, wave 4
unlocked at standing 100 and 125, not at 75/90/95 — the r231
metric review's attribution question is answered: the wave-4
move tracks the standing total against t4=100, no other input
separating the seeds. (The combat-readiness deferral is also in
the base; standing alone predicts the split exactly here, so
readiness was not the binding gate on this band.)

## Q4 — census (plain words)
Five villages, 42 days, all alive at day 40 (5/5). They are not
the same village five times: seed 101201 is the fat one again
(pantry 53,462 kcal, 12 of 12 alive, nobody died — bit-identical
to r231); seed 101204 is the fat one this run (pantry 55,704,
10 of 12 alive, wave 4); seed 101203 is the bloody one (pantry
21,523, 9 of 12 alive, wave 4, 71 death events); seed 101205 is
the thin one (pantry 18,137, 10 of 12 alive, wave 3 — the only
seed that missed wave 4, standing 75).
- **The dying:** 8 named villagers died across the five villages
  (of 203 death events — the rest are monsters the villagers
  killed: 126 villager-combat, 49 expedition, 20 combat). Causes:
  the wild ×4 (all four scholars — see F2), ambush ×2 (101204
  20s-person d18, 101205 Nino d15), a wound that wouldn't close
  ×1 (Victor d36, 101203 — a healer/medicine story, no healer
  named in the record), monster ×1 (Devon d38, 101203). Nobody
  starved — 0 starvation deaths on the panel.
- **The vanishing (roster watch):** 0 unaccounted on all five
  seeds. Every departure is logged and matched by id.
- **What they knew:** the scholar's plant codex holds 21–38
  plants per village at end (140 total). Spotter knowledge
  concentrates in one forager per village (Hazel 16, Renee 10,
  Jayden 1, Marvin 10, Ivan 4) — practice earns it, one person
  per village carries the specialty. Seed 101203's Jayden (1 XP)
  is the thin end: the village foraged least after losing three
  people.
- **What they carried:** joint favors are almost all forage_help
  (59 commits across the panel; food_share 6, heal_help 7,
  sick_help 3). Pantries end 18,137–55,704 kcal (1,814–4,642 per
  person). Wave 4 reached on 2/5 seeds (101203/101204) vs 3/5 on
  r231 — the unlock reads standing only, and 101205's 75 missed
  the 100 line (see F3). No wave-4 kills or party launches in the
  instrumented records — and the new telemetry type-count map
  now PROVES the absence rather than assuming it: no telemetry
  type records party launches (combat_start/end, contest_fired/
  end, companion_kill_beat, scale_rank are all present; no launch
  type exists). The launch/kill instrument gap is still open.
- **Social life:** wants are raised in 94% of social sits
  (275/293). The gap this run closes is the other side of r231's
  fix: a villager who says "How can I help?" now hears the live
  ask instead of "It's already handled" — 2.6% favorless, down
  from 15.9%, and the 2 that remain are a trial eating the
  sitting, not a dead favor answering for a live need.

## People check — PASS (seed 101204, Priya + Emmett, read in full)
- **Priya** (community gardener): PASS. Opens resuming "that
  personal stuff" — a real thread, not fabricated history: she
  sat with the player 5 times before (d13 curious, d20
  seek_comfort, d25 case_7, d38/d42 curious). The recap
  ("Wait — what were we talking about?") gets "As I said —
  we're still on that personal stuff" — the C3d fix naming the
  live want, vaguely because the want itself is personal. The
  sitting wanders through real things: the invite declined
  honestly ("Not right now. I've got my own things to
  handle."), the trapline ("an old trapline — remember the shape
  of it"), gossip about Oliver humming at the beans, "I left.
  Walked back in like I'd never left, apparently, friend." —
  and the live village state ("Ava headed out to forage. You
  doing okay?"). Closes warmly ("Take care of yourself." +
  "They're smiling as you go. 'Come back anytime.'").
- **Emmett** (physical therapy aide): PASS — the best shape on
  this panel. Opens with a secret: "I've been skimming extra
  food. I'm ashamed and I can't stop." The player promises
  secrecy; he thanks them. Teaching Groundnut. Then a warn_you
  want with a specific, consequential warning: "the treeline at
  dusk. Don't." / "If you see that The Big Beast again, don't
  try to be clever. Get back inside the palisade." The player
  heeds it. Gossip closes the loop: "People are talking about
  me. Take it for what it's worth." — he knows people talk
  about his skimming; the secret, the warning, and the gossip
  are one coherent thread. Closes: "I'll... I'll be around. If
  you need anything. Anything at all." + "This was good." They
  mean it. A person, not a menu.
- **Elsewhere (101205):** the parting-pool serve — "Same time
  tomorrow, maybe." — tails a sitting whose recap answers
  "Still on that foraging help." and whose away-guard refusal
  ("I'm away from Haven, out on the road...") and door-side
  instruction ("Stand beside your partner first — same side of
  the Haven door — then help.") are both spoken plainly.

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, waves 3–4 all fire.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; Emmett's confession and Priya's
  trapline are the game at its best — and the one false note
  left (a trial eating the sitting) defers the ask a day
  rather than losing it.
- **Winnable:** ON TRACK for the leg. Villages survive, gear up,
  kill ~30–70 monsters each, bank spotter skill, and reach wave
  3 on 5/5 and wave 4 on 2/5 seeds. No village reached
  national/table — expected at day 42. The binding watch is now
  a fix with a proof: a villager asking for help hears the live
  ask instead of "It's already handled" — the next establishment
  run takes a FRESH band (the 101201–101205 release is spent)
  and re-reads the rate, the scholar-death watch, and the
  case-thread residual.

## Metric review (§14)
- **Q1 GO, and the bar worked.** The rate (2.6%) and the
  stage-0-deflected count (0) split the verdict honestly; the
  class mix (E1 2/2) named the residual mechanism instead of
  letting the GO hide it. The fix lands its effect the same
  run it is re-measured — no src/js change from this run.
- **Q1 re-measure design (matched band) worked, twice.** The
  13.3-point drop is attributable to the base, not the band —
  same seeds, same driver. The band release in the prereg is
  spent: r233 takes a fresh band. The pilot seed ran
  bit-identical to r231, which sharpens the attribution: the
  fix moved 4 of 5 seeds' trajectories and left the fifth
  untouched.
- **Q1b bar WORKS.** 26.3% panel rate (r231: 27.6%), no
  zero-raise seed. Keep as written.
- **Q2 bar WORKS on the new base.** 0/10 CUT. Keep as written.
  The parting pool served once — the third-panel rule does not
  open the reachability question; keep watching.
- **Q3 — report-only, stable.** Distinct 0 (raw 0), down from
  r231's 2. The paraphrase formulation didn't fire this panel;
  the recap answers phrased it differently. No formulation owed.
- **Scholar deaths 4/5 — second ≥3 in the series, escalation
  TRIGGERS.** The location instrument is in place and read
  (F2). The metric stays; the A/B is the sim lane's next step.
- **LADDER pace read, again:** the thin seeds (101203 Jayden 1
  XP, 101205 Ivan 4 XP) miss pace while foraging least —
  spotter XP tracks foraging volume, not time. Not a bar
  failure. The thin end persists on 101205 across bases, with a
  different villager holding it — the band's structure persists,
  the holder doesn't.
- **Wave 4 on 2/5 (was 3/5).** Not a bar — but the standing
  attribution is now exact (F3): t4=100, threshold between 95
  and 100 on this band.
- **Roster watch CLOSED as an instrument gap, answered again.**
  0 unaccounted on 5/5 seeds with departures logged and matched
  by id. The instrument stays in the driver; the open question
  is narration of departures, not recording.
- **Telemetry baseline — do NOT roll.** LOUD on guardrails.* is
  the known schema mismatch (prereg-predicted); c3 quiet.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r232 panel's
  deaths / pantry are all in-band in the analyzer (5/5 alive
  d40, pantries 18,137–55,704, 0 starvation deaths).
  Baseline NOT rolled (prereg: never roll on a mismatch).

## Gate check
`node scripts/check.js --quick` in the worktree, log
`evidence/2026-11-17/journey-establishment-r232-gate.log` —
**332 passed, 8 failed in 1490s, 0 attributable.**

- 5 load timeouts (exact 120s), all PASS standalone WITH logs on
  this tree, run sequentially after the gate: living-garden (exit
  0), one-person-army (exit 0), occupation-panels 25/25,
  trust-observer-neutrality 6/6, capable-bot 40/40. The gate ran
  under box load 12.9 with sibling balance-panel jobs running
  concurrently; the capable-bot gate timeout was pure contention
  (14s standalone).
- `test-measurement-cache-flags.js` 0/4 in-gate, **4/4 standalone**
  — the documented load artifact (AGENTS.md): the failing
  sub-check is panel completion under the test's spawn/timeout
  budget, not the change under test.
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3
  fails, same messages as r231/r142).
- `test-ladder-bundle-20261108.js` — same control fail (200
  monster turns WITHOUT delivery fire the ambient raid — fires 0).
- Notably GREEN in-gate this run (both failed on r231/r142):
  the measurement-proof staleness pair — the sibling
  balance-proof refresh fixed it. Gate GO for adoption.
- (Self-inflicted note: the first standalone loop mis-pathed
  capable-bot as `scripts/godpath/...` — MODULE_NOT_FOUND, not a
  test failure. Re-ran at the correct path: 40/40.)

## Closeout
- No src/js change this run — the blank is documented (F1
  case-thread precedence), the escalation is recorded (F2), the
  attribution is closed (F3). Commits: prereg/driver
  `733ea8404` (rebased to `5093a0aa5`); evidence `c028d0ec2`
  (rebased to `c15b659c9`).
- Master moved during the run (social-life r234 landed
  `39eaa043e` — DRY2 fix, touching convo-dialogue.js); rebased
  clean onto it (2/2, no overlap with this run's files), proof
  tests re-run green on the rebased tip (19+13+18+10+35+7).
  Master then moved again (Loop A launchfunnel `7595ff0b9`,
  part2night `48d767924`, nondeathplan-b evidence `95d3d9ca1`,
  1415Z evidence `98ff5fc02`, 1409Z closeout `0668af726`) while
  the second rebase was unconfirmed and the coordinator timed
  out (orphan hbloop PID 3490 killed by the main session;
  coordinator process gone, worktree clean at `fd5968693`).
  Adopted by the main session: rebased clean onto `0668af726`
  (3/3, no overlap), the same six proof tests re-run green on
  the rebased tip `348ca3754` (19+13+18+10+35+7), merged
  ff-only into local master.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 1→2 written with read-back; lock deleted at closeout
  after run_id verification.
- Worktree released (`merged`), branch deleted; final reap sweep
  clean. Main tree verified clean after the merge.
- The r232 panel corpus (per-seed JSONs + convo transcripts)
  lives under the goal hidden_files evidence dir for 2026-11-17
  (outside the repo, per the journey-lane pattern); the repo
  evidence dir holds the prereg, run note, analyzer log, gate
  log, and pilot/panel stderr logs.
