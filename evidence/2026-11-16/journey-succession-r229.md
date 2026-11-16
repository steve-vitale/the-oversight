# Journey — succession r229 (Lane B leg 7, 2026-11-16)

## Prereg (binding)
- **Leg question:** do the r225 F5, r226 F6, and r228 C3c/F2 fixes hold in the
  wild on the succession leg, and does the revised (roll-based) MANTLE-FINE
  pass on a fresh band?
- **Fix arm:** NONE pre-planned — this is a WILD-VERIFICATION + METRIC-REVISION
  run. Any new dry surface is filed, not fixed (r224 rule, carried).
- **Metric revision:** MANTLE-FINE fineLatency is now ROLL-BASED (first sleep
  roll whose bearerBefore is already the new bearer, or whose bearerAfter is,
  minus entryDay); rollCover widened for the 0-day-sleep case; sample-based
  latency kept descriptively. Corpus proof before the panel: the revised
  analyzer over the r224 corpora reclassifies 34303 Elijah→Javier GAME-LATE →
  SAMPLING-or-CLEAN and holds every other row (MANTLE-FINE FAIL → PASS on the
  old corpora; DRY-CENSUS FAIL unchanged — the F5 hit is pre-fix data).
- **Seeds:** fresh band 34311–34314 (verified 0 hits in any prereg/evidence,
  repo + goal trees), smoke 33998. EARLY_KILL_DAY=40, POST_DAYS=70 (smoke 5/25).
- **Bars:** MANTLE-FINE (revised), DRY CENSUS (any-hit-fails), WILD CHECK
  (F4a/F4b/F4c/F5/F6/C3c/F2 + carried fixes), F5 WILD EXERCISE (branch must fire
  ≥1× AND 0 F5-class dry hits — a zero-fire panel is a finding, not a pass),
  CONTROLS (smoke S_fixed d7 Ashanti 10/2/33).

## Panel (all 5 seeds exit 0, analyzer exit 0)
- **MANTLE-FINE: FAIL — 1 UNEXPLAINED-1, adjudicated INSTRUMENT ARTIFACT (see below).**
  16 deaths observed, 0 flippedImmediate=false, 0 fineLatency>=2, 0 day-skips.
  The single row: seed 34314 d41 Daniel→Gabriela, the scripted leg death,
  fineLatency=1 (sample=0), rollCover=false, zeroDaySleep=false, class
  UNEXPLAINED-1. The flip was synchronous and the mantle never sat on a dead
  bearer through a sleep: flippedImmediate=true, the scripted-kill sample on
  d41 already shows Gabriela (sample lat 0), coarseLatency=0, and the first
  recorded roll after the death (42→42, a 0-day sleep) already has Gabriela
  as bearerBefore. The lat=1 comes from a MISSING ROLL: no sleep roll with
  dayBefore==41 exists — the day advanced 41→42 through the expedition path
  without going through the driver's wrapped sleep, so the first roll with
  the new bearer is dated dayBefore=42. The revised metric assumes every day
  transition produces a roll; this row proves that assumption wrong. Second
  artifact shape in two panels (r224: 0-day sleep; r229: missing roll).
  No game defect: no sleep roll ever observed dead Daniel holding the mantle.
- **DRY CENSUS: PASS — 0 dry hits across the panel (10 honest fallbacks, 0
  null-return silences).** First fully-clean dry census on the succession leg.
  F4a (0 curious-singleton hits), F4b (37 "Still on" recaps, 0 splices), F4c
  (0 dlg:help hits) all hold. The 10 honest fallbacks are the r81 nonverbal
  design (Abdulelah d9/d15; Nazerke d2/d4/d7/d9/d10/d11/d12; Fatima d57
  nv:listen) — the gesture narration, not dry lines.
- **F5 WILD EXERCISE: VACUOUS (second straight panel).** The settled-favor
  branch never fired: 0 of the 3 variant lines and 0 of the fallback line in
  68 transcripts. The only "handled" lines are the r34 HONEST MOOT path
  ("Never mind the pantry run — we got it handled. Thanks anyway." + a new
  water-haul ask), working as designed. The F5 fix stays proof-only (r225's
  22/22 proof test). Per prereg this is a finding, not a pass. Two panels
  (r225 endgame, r229 succession) have now failed to exercise the branch in
  the wild — a targeted harness (r228 C3c class) is the way to exercise it,
  proposed in metric review.
- **F6 WILD HOLD: UNEXERCISED on this leg, 0 dry at its sites.** 0 stale-opener
  reframes ("I keep turning it over") and 0 repay fulfilled-favor openers
  fired on the panel — no want reached the all-variants-ledger-blocked state.
  The DRY census (0 hits) covers the outcome: no dry line was served at the
  F6 sites. The fix itself is proven by r226's 16→0 confirmation on the
  social leg; the succession leg simply never stressed it.
- **C3c WILD HOLD: PASS.** 2 resume openers on the panel; the one naming a
  favor thread (34313 d+64 Ciro: "We never did finish talking about that
  water haul") names the LIVE favor — the sitting re-asks it immediately
  ("Water's almost gone — 0 liters. I can't carry enough alone.") and the
  favor is still live. The other (34313 d+14 Adrian: "what's been happening")
  quotes a real beat, not a favor. 0 stale labels. The r228 fix holds in
  the wild.
- **F2 WILD HOLD: PASS.** 0 narration quotes inside resume-opener memory
  quotes. Both quoted beats are pure speech ('2 liters. That's today's
  drinking water…' / 'Sleep's gone strange. I sharpen sticks down to
  nothing…').
- **C3d: SECOND SIGHTING — PROMOTED to fix item for the next run.**
  Seed 34312 d+53 Onni (trust 90): the recap "Wait — what were we talking
  about?" is answered "We were just talking. Nothing important." while a
  LIVE favor ask (the creek-water run, stated in the opener, requirements
  just discussed) plus a party naming ("The Company") and a role assignment
  (Onni → Scout) are on the table. Mechanism traced: convoRecapLine reads
  c.threadLog; the log was EMPTY — stated-but-unengaged wants and
  structural beats (party naming, roles) plant no thread, so the empty-log
  branch serves the recap-empty pool (variant 1 of 4). The sitting itself
  resolves honestly afterward (the favor is dropped aloud: "Forget I asked.
  They'll just stop asking."; the lately question surfaces real grief for
  Fritz), but the recap erases real content. By r224's own standard (its
  one surface match was NOT a sighting because the conversation "genuinely
  held nothing"), this IS a sighting: this conversation genuinely held
  something. Fix shape for r230: the empty-log branch checks the sitting's
  live want / open favor / unanswered question first and names it
  ("We were talking about that creek water run"); only when nothing is open
  does it serve the empty pool. NOT fixed this run (file-don't-fix rule; a
  fix now would invalidate the scored panel).
  - The other recap-empty firing this panel (33998 d+3 STRANGER-Ruth:
    "Nothing in particular — we were only talking.") is judged NOT a
    sighting: the sitting's beats (a secret confessed, a walk declined) all
    CLOSED — nothing was open to name. The line is drawn at live,
    unfinished threads: Onni's favor was open; Ruth's threads were closed.
- **CAP-NC: INSUFFICIENT-DATA** — bonded-by-deadline 2/2 eligible seeds
  (34312 Ruby, 34314 Fatima); denominator <3. bondedEver 3/3 probe-opened
  seeds. OPP: unbonded talk-requests 1 (Ursula d5 smoke — the standing one);
  FIRST-bearer bonds on undriven days 2; NPC-NPC new bonds 42; newcomer
  arrivals 16; selfReqDayEntries 0 (r133 purge holds).
- **CONTROLS: PASS.** Smoke 33998 at-death snapshot = d7 Heinrich→Ashanti,
  alive 10, fallen 2, newTrust 33 — EXACTLY S_fixed. No base drift since
  r224. Pick rank 1 + funeral INCALL true on all 5 seeds.
- **Day-skips: 0** — fourteenth straight panel at zero.

## Village assessment (plain words)
- **34311 — Luke hands the mantle to Dorothy on day 41** (trust 61, 11 alive,
  1 fallen). Three more deaths (Dorothy→Yuki d51 sickness, Yuki→Henry d76
  expedition, Henry→Jude d102 the wild) and the village still stood at day
  111: 9 alive, pantry 53,776, 68 bonds. A village that absorbs four bearers
  and keeps eating.
- **34312 — Malik dies to a stranger on day 37, before the scripted kill**
  (trust 59, 10 alive, 2 fallen — the leg death is ORGANIC, four days early;
  the scripted kill never fires because the bearer is already dead). Three
  more deaths (Harper→Fritz d43 the wild, Fritz→Nathan d81 contest,
  Nathan→Onni d93 the wild) and the village bled but held: 7 alive, 12
  fallen, pantry 49,423, 83 bonds at day 108. The hardest start on the panel.
- **34313 — Elias hands the mantle to Seamus on day 41** (trust 56, 11 alive,
  1 fallen) — and then NOTHING. No further deaths in 70 days: ended day 111
  with 10 alive, 2 fallen, pantry 8,362, 54 bonds. The quiet village. The
  only panel seed with a single bearer death.
- **34314 — Daniel hands the mantle to Gabriela on day 41** (trust 62, 8
  alive, 4 fallen). Five more deaths (Gabriela→Wei d52 the wild, Wei→Mara
  d76 sickness, Mara→Almas d77 the wild, Almas→Mateo d93 the wild,
  Mateo→David d110 the arena) — the longest chain on the panel, six bearers
  — and the village still stood: 7 alive, 12 fallen, pantry 9,753, 85 bonds.
- **33998 smoke — Heinrich to Ashanti on day 7** (trust 33, 10 alive, 2
  fallen). Short window; ended day 32 with 10 alive, pantry 9,602.
- No village won, none ended. The mantle itself never failed: every death
  passed it on the same day, to a living successor, with the funeral beat
  firing every time (pick-time rank 1, funeral INCALL true on all 5 seeds).
  No starvation deaths anywhere — the lowest pantry at horizon is 8,362.
  Water, not food, is the pressure: the water-haul favor (0 liters) is live
  on two villages.

## People check (8 full transcripts)
Conversations read like people talking, not menus. Katarina (34311 d+64,
trust 99) tends a wound that is "angrier every day," teaches Bittersweet
Nightshade, is taught American Hazelnut back ("And I've been walking past
it for weeks."), and grieves Henry ("I keep turning over the last thing
Henry said to me. I can't tell if I'm remembering it right, and that's
somehow the worst part."). Ruby (34312 d+64, trust 87) checked the cistern
three times hoping she misread it ("0 liters"), does push-ups at dawn
because "it doesn't bring anyone back. It just keeps my hands from
shaking," and joins the party because "Someone should watch your back.
Might as well be me." Hassan (34311 d+65, newcomer, trust 20) sings old
songs from Karachi ("The words are half gone but the tune holds. Tunes
outlast everything.") and braids grass while listening to plans. Fatima
(34314 d+64, trust 90) speaks only Hindi — gestures, Hassan translating,
"Do you have food?" — the nonverbal fallback working as designed. Ruth
(33998 d+3, stranger, trust 11) hides that she was a librarian, not a
journalist ("It's safer if people don't know"), and declines the walk
because "The fire's got me." The one bad beat on the panel is the C3d
recap-empty line in Onni's sitting (trust 90): a live favor ask, a party
naming, and a role assignment all dismissed as "Nothing important." One
seam in an otherwise coherent sitting — filed, not fixed here.
Watch item (same class as r228's recurring templates): the mourning lines
are templated per dead person — "I keep expecting to see X at the fire.
Stupid." / "It doesn't bring anyone back. It just keeps my hands from
shaking." / "The fire feels smaller without X." — shared verbatim across
Ruby (Nathan), Hassan (Henry), and Katarina (Henry). Three villagers,
one grief script.

## Fixes landed this run
- NONE in src/js. This run is instrument-only: the MANTLE-FINE roll-based
  revision in the r229 analyzer clone (+ corpus proof) and the gap-shadow
  script below. No game code changed, no fix arm was pre-planned.
- Next fix item (filed, not fixed): **C3d — recap-empty pool erases live
  threads** (conversation.js convoRecapLine ~2390: empty-log branch serves
  the recap-empty pool while a live want is on the table; fix shape: check
  the sitting's live want / open favor first, name it; serve the empty pool
  only when nothing is open).

## Telemetry
`telemetry-check.js` vs succession baseline: 2 LOUD lines, both the known
means-vs-sum artifact (checker sums across 5 files; baseline holds per-seed
means): deaths.bearer 7.6 → 16, census.fallen 14.3 → 33. Per-seed means are
3.2 and 6.6 — within seed-band variation for chain length (chains ran 1–6
this panel vs 2–7 in r224). **Baseline NOT rolled.**

## Gate
`node scripts/check.js --quick` (adoption re-run by the main session — the
worker's gate was killed mid-run at the 1h cron limit, log truncated at
190 bytes): **329 passed, 11 failed in 1336s, 0 attributable.** The 11:
6 exact-120s timeouts (living-garden, occupation-panels, one-person-army,
trust-observer-neutrality, synergy-stall, capable-bot — all pass standalone
with logs: living-garden EXIT 0, occupation-panels 25/25, one-person-army
EXIT 0, trust-observer-neutrality 6/6, synergy-stall EXIT 0, capable-bot
42/42); measurement-cache-flags 0/4 in-gate, 4/4 standalone (box-load
artifact, same pattern as r228); phone-frame-proof 3/3 (standing stale
receipt); measurement-proof-update + measurement-workflow (standing
staleness pair); ladder-bundle 78/1 (standing "200 monster turns" control
failure). This run is instrument-only (no src/js changes), so attribution
to the run is impossible in principle; the standalone re-runs confirm it.
Gate log: evidence/2026-11-16/journey-succession-r229-gate.log.

## Metric review
- **MANTLE-FINE fineLatency (r229 bar): the instrument overstates latency
  when a day transition produces NO sleep roll.** The 34314 d41 row reads
  lat 1 under the roll-based metric even though the flip was synchronous,
  the new bearer was sampled the same day, and no roll ever observed the
  dead bearer holding the mantle — because the 41→42 transition went
  through the expedition path and left no roll. Proposed revision for the
  NEXT run (r230): gap-subtraction — fineLatency = (first roll with the new
  bearer).dayBefore − entryDay − gapDays, where gapDays counts days in
  [entryDay, firstNewRoll.dayBefore) with no roll having dayBefore == d.
  SHADOW-PROVEN this run (scripts/shadow-mantle-gap-r229-20261116.js):
  over the r229 panel it reclassifies ONLY the 34314 d41 row
  (UNEXPLAINED-1 → SAMPLING-or-CLEAN, gapDays=1); over the r224 corpora
  it changes NOTHING (19 rows, 0 changed). Do NOT re-score this run
  against the revised metric mid-run — the FAIL stands on the record with
  this adjudication attached.
- **DRY CENSUS any-hit-fails:** working as intended — first fully-clean
  census on the leg; the bar stays.
- **F5 vacuous twice:** the settled-favor branch has now failed to fire on
  two straight panels (r225 endgame, r229 succession) while its proof test
  stands green. Propose a TARGETED HARNESS for r230 (r228 C3c class: stage
  a settled favor, re-ask it, assert the variants cycle) — panels don't
  reach the surface often enough to judge it.
- **C3d promoted:** second sighting (after 14461 d31) — the watch closes
  as a fix item for r230, with the mechanism traced (empty threadLog) and
  the fix shape proposed. The Ruth non-sighting sets the line: the pool is
  wrong only when a live, unfinished thread exists.
- **CAP-NC:** no revision — the denominator stays starved by design.
- **Day-skip watch:** fourteenth straight panel at zero.
- **Smoke bar:** S_fixed holds exactly (d7 Ashanti 10/2/33); no re-baseline.
- Proof refresh rounds 11 + 12 remain owed (not this run's).

## Reachable / fun / winnable
- **Reachable:** yes — the mantle passes on every death, the funeral beat
  fires, successors keep living their lives (bonds, favors, grief, roles).
  The leg's content is all reachable in ordinary play, including the
  organic pre-scripted death (34312's bearer died to a stranger four days
  before the scripted kill — the chain handled it).
- **Fun:** mostly — the late sittings are the best conversations on the
  panel (memory, grief, roles with real stakes; the nonverbal Hindi sitting
  works). The C3d seam is the one moment the game stops feeling like
  people and starts feeling like a machine ("Nothing important" after
  naming a party and taking a role).
- **Winnable:** not judged here — no village won on this leg, and succession
  measures the handoff chain, not the win. The chain itself holds: 16
  deaths, 16 clean passes (15 clean by the binding metric, 1 clean by
  adjudication).

## Run bookkeeping
- Base master 9c78fd585; tooling commit 3d2398af (prereg + driver/analyzer/
  runner clones + MANTLE-FINE revision + corpus proof).
- Index clobber struck on the tooling commit (7th sighting) — repaired via
  the ls-tree pipe; commit verified correct, status empty after.
- Registration took ~20 min (7 GB evidence/ checkout, git reset --hard
  I/O-bound, 2:10 CPU over 17:37 elapsed). Heartbeat loop (5-min cadence)
  started 22:23Z; no gaps.
- Rotation-b: 7 → 4. Lock: deleted at closeout.
- Merge: [PENDING]
