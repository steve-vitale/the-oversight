# Journey leg ESTABLISHMENT — r286 run note (2026-11-27, Lane A)

## Run
Run id `playtest-20261127T2045Z` (scheduled Fri 2026-11-27 14:45 CST).
Leg 1 establishment, days 14–40 window, 42-day horizon. Rotation file read
**1 (establishment)**. **Base:** local master `3df52548c` at registration
(sim-scale-onramp-round-1915). Pre-flight: main tree CLEAN, disk 50%.
`git pull` — already up to date. Lock created 20:43:45Z before any work.
Heartbeat loop running (10-min cadence, detached setsid; FIRST loop pid
108999 died in a machine restart ~21:13Z — uptime 15 min at 21:28Z —
heartbeat re-established 21:28:35Z, loop restarted pid 13657; no work
lost, all panel/fix outputs on disk verified present).
Registration took ~7 min (git worktree add slow under I/O load, no flap
error); heartbeat_at 20:47:57Z at registration; one manual heartbeat
skipped (registry lock held by live flesh-out registration sim-speardmg-a,
pid 104969 — legitimate holder, not stale), landed 21:00:07Z.
Prereg: `hidden_files/evidence/2026-11-27/journey-establishment-r286-prereg.md`
(frozen before the pilot; seed-band freshness check recorded there).

## Panel
**FRESH band 109051–109058** (pilot 109051, then 109052–109058), same
competent policy, 42d horizon, death-aware tail +10d. Driver clone verbatim
r285 except run number / output names / header / seed band; analyzer clone
verbatim r285 except run number / file names / comparison strings (Q4 bar
now vs the r274+r277+r280+r285 pooled means; stranded-close now SEVENTH
band; r285 values added to every comparison line; SPOTTER bar revised per
Q5 below; Q8 exile-rate bar added). Pilot 109051 finished in <30s, no
instrument errors; panel 7 seeds ran ~4 min total. Analyzer exit 0, 561
lines. Determinism: seed 109051 replayed after the panel —
**byte-identical** (JSON + convo).

Panel summary (per-seed, BEFORE the fix — see Q1 for the re-panel):
all 8 villages alive at d40 (aliveAt40 7–11); waves 3–4; standing 0–100;
deaths 15–85/seed (panel 383); pantryEnd 7,169–66,326 kcal; 0 jam-days;
0 broken-water dawns on 7/8 seeds (109058: 1); 1 stranded run (109054).

## Verdicts (frozen bars — BEFORE-fix panel first, re-panel where noted)

- **Q1 STRANDED-CLOSE, SEVENTH BAND: NO-GO on the before-fix panel,
  GO after the fix (re-panel below).** Seed 109054: Lena's `forage_help`
  run, bearer Aisha (scholar) died d21 in the wild; first stranded d22,
  **still open at end** — 24 stranded dawns d22–d45, 0/1 closed, 24 end
  attempts, 0 ended. First stranded run since r277, and the first time
  a dead-bearer run NEVER closes (r274's closed same-day via bearer-end).
  Root cause (traced in the JSON, not guessed): the ending WAS ready on
  19 of the 24 dawns (`forageFavorAction` ending branch: ready, action
  `forage_end`, "This outing belonged to Aisha, who is gone. Their share
  is lost with them. Unload what you carry and close the books.") — but
  the sit opened on a different want every time (grief/seek_comfort,
  warn_you, share_news, curious; 19 'end' sits, wantFavor null on all),
  and `dlg:favor_cancel` is offered only by the favor menu
  (`convoFavorActionMenu`), which is built only when the sitting opens
  on the favor want. The r280 rank fix promotes a cancel already in the
  menu; it cannot conjure one into a grief/case/news menu. The other 5
  dawns the ending was not ready ("Finish the current event before
  foraging together" — an event in progress; correctly unoffered).
  **FIX LANDED THIS RUN** (see below): the cancel now joins the menu
  from any sitting when the urgent bearer-end shape holds AND the ending
  is ready at Haven. **RE-PANEL, seed 109054 only, on the fixed code:**
  stranded 24→1 dawn, endAttempts 24→1, ended 0→1 (favorCancels 1),
  closed d22, 0 dawns after first stranding — **Q1 GO**. Determinism on
  the fixed code: re-run byte-identical. Before-fix corpus preserved at
  `hidden_files/evidence/2026-11-27/r286-before-fix/` (16 files).
  Side effects of the close (same seed, fixed code): aliveEnd 8→10,
  deaths 53→48, standing 95→70, pantryEnd 58,424→66,326, wedgeSits
  52→80 — closing the run on d22 freed the driver (and the village) for
  the rest of the leg instead of re-attempting the end daily.
- **Q2 MOOT-CLOSE: NO-OPPORTUNITY.** 0 evictions, 0 moot-closes.
  Mechanism carried by the r269 proof test (36/36). Seventh straight
  band with 0 evictions.
- **Q3 SILENT-ARRIVAL: GO.** 7 arrivals, 6 NARRATED-BY-NAME + 1
  NARRATED-DESCRIPTIVE, 0 SILENT. (109058 alone took 5 arrivals d37–39,
  all named — a late influx: Zoe, Mateo, Lucas, Thabo + 1.)
- **Q4 GUARDRAILS: MISS on pantry — baseline does NOT roll.**
  Before-fix means vs the r274+r277+r280+r285 pooled means: deaths
  47.9 vs 48.3 (−0.8% ✓), popAlive 9.1 vs 9.3 (−2.2% ✓), pantryKcal
  22,462 vs 36,393 (−38.3% ✗), starvationDeaths 0 ✓. After-fix means:
  deaths 47.3 (−2.1% ✓), popAlive 9.4 (+1.1% ✓), pantryKcal 23,450
  (−35.6% ✗), starvationDeaths 0 ✓. The miss is NOT a fix effect (the
  before-fix panel already missed by −38%) and NOT a regime move on the
  other three metrics — it is the pantry mean's fragility: per-seed
  pantry spans 7,169–66,326 kcal (9x) inside this band, so one fat or
  two thin seeds swing the mean past ±30%. Metric review §1 proposes
  the revision (median or log-scale). Baseline stays at the
  r274+r277+r280+r285 pooled sums (deaths 1546, popAlive 298,
  pantryKcal 1,164,586, starvationDeaths 0).
- **Q5 SPOTTER (REVISED bar — cumulative binding): GO.** Panel
  cumulative 120 (bar ≥20), 8/8 seeds cumulative >0. End-holding 77
  (before-fix) / 79 (after-fix), 8/8 seeds >0 — the old bar would have
  passed this band too, but the revision is validated: 109054's
  cumulative 21 vs end-holding 4 (Aisha 9 + Dylan 8 + Nicole 4 across
  three scholars) is exactly the turnover shape the revision exists
  for. LADDER 7/8 before-fix, **8/8 after-fix** (bar ≥6/8) — GO.
  FASTER-ID 8/8 (174 benefit plays in 239 bump calls, 73%) — GO.
- **Q6 SCHOLAR DEATHS: 6 — INVESTIGATE (bar ≤4 WATCH).** Aisha d21
  (the wild), Dylan d40 (the arena), Jaxon d20 (the wild), Angelo d29
  (sickness), Akorfa d31 (the wild), Hector d32 (a stranger). No
  unnamed-cause ("the night") deaths — all six causes named. The (4,4)
  last-dawn shape recurs a fifth band running: Aisha, Dylan and Jaxon
  all last dawned at (4,4) with atHaven=true (Jaxon insideHaven=true,
  Aisha/Dylan insideHaven=false); Angelo (5,2), Akorfa (5,3), Hector
  (2,4) dawned away from Haven. The scholar keeps dawning at Haven's
  threshold and dying in the wild. Named as a descriptive finding; no
  design call taken this run. (After-fix re-panel: 109054's Dylan still
  dies d40 in the arena — the close did not save him.)
- **Q7 SLEEP-RETRY: 41 tried, 36 advanced — 5 non-advances** (r285:
  67/65, 2 non-advances; r277/r274: 2). Per seed: 109056: 1 (d44
  repeated across loopDays 41–42 — that is why its endDay is 44, not
  45), 109058: 4 (jitter-heavy: d17 repeat + skip 17→19 + more).
  DAY-DESYNC: net drift +7 panel-wide, 15/15 events attributed — GO.
  The non-advance count rising 2→5 is named, not judged; all five are
  attributed jitter repeats, none a lost day.
- **Q8 EXILE RATE: WATCH — 8 exiles, below the 11-exile investigate
  line.** The r285 spike (11) did NOT repeat. Counts by band: r246: 2,
  r265: 3, r274: 4, r280: 5, r285: 11, r286: 8. All 8 path=moot; 6
  HEARD (advance notice), 2 PRESENT-at-sentencing, 0 UNHEARD. The two
  PRESENT cases are both same-case pairs where the second person was
  never named in advance: Somchai d12 (case_2, 0 naming lines) and
  Denise d15 (case_4 opened and resolved d14, 0 naming lines) — the
  player sat in the sentencing moot and watched someone exiled whose
  name they had never heard in the case. Descriptive, not a bar miss:
  the exile was spoken ("Take what you can carry and go"), the
  blindsiding is the finding. Exiles arrive in same-case batches:
  109052 d12 Grayson+Somchai (case_2); 109053 d30 Wolfgang+Genaro+
  Elena + d31 Nina (cases 12/14); 109057 d15 Luis+Denise (case_4).
  No triple-exile watch fired (largest batch 3, but across two days).
- **Q2 SITTING CLOSES: GO.** 0/16 CUT sittings; 5 engine-ended WITH
  closing beats.
- **Q1b WANT-RAISE: GO.** Before-fix 91/507 (17.9%), after-fix 93/553
  (16.8%); zero-raise seeds 0/8. **F5 FLOOR shape RECURS** (build-arm
  item, reported not judged): thinnest seed 3.0% (109054: 1/33 — the
  stranded run starved that seed's social life), fattest 29.5%
  (109056: 18/61).
- **Q1 FAVORLESS ASK: GO.** 1 favorless sit of 91 raised asks (1.1%;
  r285: 3.9%) — lowest yet. Repeat: Nina 1; 0 contentless re-seeds.
- **COUNTER LABELS: clean.** 192 COUNTER LEARNED lines, 0 comma-clause,
  0 em-dash.
- **BOWCRAFT: 21 bows equipped panel-wide** (r285: 25) — the recovery
  holds. 0 bow-key telemetry events (blind-scan confirmation).
- **WARN-HEED: GO.** 14 warn_you sittings, 6 delivered (0 via the
  deepen arc), 0 engaged-unnamed. (Fewer sittings than r285's 24 —
  band shape, not a bar miss; the r283 heed dry fix is in this base.)
- **SETTLED-FAVOR / DRY2 / SELFWIT: all 0.**
- **WINPLAN: GO.** Plans seeded on 8/8 seeds (planSeeds 27);
  partyDepartures 87 on 7/8 seeds (109057: 0 — the quiet village,
  below); DEPART beats 70 on 6/8 seeds (beats ≤ departures every
  seed). **TRIO GAP: 0 trios, 0 quads — 11th straight run.** Parties
  form and depart, but never as three.
- **END BAR: GO.** 16/16 broken-live forage opportunities closed
  within 2 dawns. TRUST GUARD 0 drops. JAM 0 days.
- **CODEX:** 263 plants identified at end across 8 seeds (before-fix);
  271 after-fix.
- **VILLAGE BAR: GO.** 8/8 alive at d40.
- **Q3 RECAP PARAPHRASE: distinct=1 of 16 sittings (raw 2)** —
  report-only, under the 6-distinct over-representation line.

## The fix (landed this run)
**BEARER-END ANY-WANT** (`src/js/conversation.js`, `convoMenuPage`;
proof `scripts/test-bearer-end-anywant-r286.js`, 22/22):
when the urgent bearer-end shape holds (`convoFavorEndUrgent`) AND the
ending is actually ready at Haven (the same `forageFavorAction` /
`waterFavorAction` ending-ready gate the favor menu uses), `dlg:favor_cancel`
joins the menu from ANY sitting with that villager — grief, warning,
news, comfort — ranked first by the r280 rule (including on small
one-page menus, where the early return previously skipped the sort).
Never offered while a question, trade, hawk, ambush or closing owns the
menu, never on a nonverbal sitting, and never when the ending isn't
ready (away from Haven, event in progress) — pressing it then would only
refuse. The handler resolves the favor via `convoGetFavor`, so the verb
works from a non-favor want; a healthy live run is untouched (urgent
false). The proof test stages the panel's exact shape (favor state
'asked', promise released, bearer dead, scholar at Haven) and proves:
ready, cancel offered + first on a grief-want sitting, no injection for
a healthy run, no injection away from Haven, pressing it ends the run,
and the water mirror. The r280 menu-priority proof test still passes
20/20. `[needs-eyes]` NOT included — this is a verb-availability fix,
not a feel change; the ship loop can take it normally. (If Steve wants
to play it: sit with a villager whose dead predecessor left a joint
outing open, on any topic — the close is now offered first.)

## People check — PASS (6 full transcripts read)
Seeds 109058, 109051, 109057, two sittings each, read in full.

- **Ji (109058, trail crew lead)** — a dead pantry-run promise, handled
  honestly ("You said you'd help with the pantry run. It's still open —
  but that promise is dead." / "Okay. Your call. They file it away —
  unpaid, and counted."). The player deflects and Ji accepts it with
  grace; ends in comfortable quiet. Real want, real deflection honored.
- **Daniyar (109058, paramedic)** — pantry-run favor: honest
  requirements answer (stand beside your partner first), commits,
  honest deferral ("I'm out on the road, away from Haven — no dawn meet
  while I'm out"), then gossip: Zoe the journalist, Mateo back, Mateo
  drinking creek water straight. Coherent, names real people, resolves.
- **Paolo (109051, mechanic)** — thin: the "cheer" thread never becomes
  a real ask; "Want to come with us?" → "...Fine. This had better be
  worth it." then "...I need to go be quiet for a while." It resolves
  ("cheer, settled") but the want is vague. Opening stitches a stray
  quoted fragment (see nit below).
- **Stella (109051, piano tuner)** — the run's best transcript. Plant
  teaching ("I never knew that"), personal story ("Being a piano tuner
  feels like a past life. Sometimes I wonder if I dreamed it."), and
  "We should stick together. Twelve strangers is better than one
  stranger. Math." Real want, resolves.
- **Sergio (109057, blacksmith)** — wound favor with honest requirements
  (same side of the Haven door), commits ("Careful with it. And —
  thank you."), then the show memory: "Siege. They just... took Nina.
  Came back like nothing happened. It wasn't nothing." The village
  remembers. (This seed's only commitment, day 45.)
- **Carmela (109057, lawyer)** — buries a food bundle (+1865 kcal),
  plant teaching, personal story ("Sleep's the real currency now. I'm
  rich in dreams and broke in rest." / "The others think I've got it
  together. Cute. Very cute."). Good. One wobble: the opening asks
  "Anyone you're watching?" and the driver answers [betrayal:accept];
  the NPC pivots to hauling food and the scene recovers.

Verdict: villagers act like people. Wants are real, deflections are
honored, endings resolve or plant honestly. **Recurring nit (documented,
not landed):** the resumed-thread opener stitches a quoted fragment
that reads like a different voice — Ji: "Still on your mind? 'I should
go before I say something sincere.'"; Paolo: "Still on your mind? 'Good
day, huh? Almost feels normal.'" Sergio's stitch is coherent (the quote
IS the wound ask). Two of six openings carry a stray quote; the opener
should not append a quoted line that isn't the thread's own words.

## Village assessment (plain words)
Eight villages, all alive at day 40, all with 7–11 people left of the
starting 12. They know things: 263 plants identified between them,
spotter knowledge on every seed (one village's knowledge spans three
dead scholars and still counts), 192 counter-lessons learned and named
cleanly. They work together: 87 party departures, 27 plans seeded,
favors raised on ~17% of social sits and mostly completed (16/16
broken-live forage opportunities closed). They also exile each other —
8 people sent walking, always after a case the village had heard about,
never silently — though twice the player sat in the sentencing moot and
watched someone exiled whose name they had never heard in the case.
Six scholars died: three in the wild after dawning at Haven's edge, one
in the arena, one sick, one to a stranger. No village starved (0
starvation deaths, pantries 7,169–66,326 kcal at end). What is missing:
a third person in any party — eleven runs now, still no trio departure,
so the wave-4 fights are still fought by pairs; and one village
(109057) never asked for a single joint outing in 42 days — Tomas
talked to his people 84 times, they asked him for care, but nobody ever
asked him to forage together, so the village never left Haven, never
departed, and ended the leg at standing 0. The village isn't broken;
it's quiet. Whether quiet villages recover or stall permanently is the
open question it leaves behind.

## Metric review (§14)
1. **Q4 PANTRY bar — propose a median (or log-scale) revision.** The
   frozen bar judges the per-seed MEAN pantry against the pooled mean
   ±30%. This band's per-seed pantry spans 7,169–66,326 kcal (9x);
   the mean missed by −36% while deaths, popAlive and starvation all
   sat within ±2%. A mean bar on a 9x-spread metric fires on band
   composition, not regime. Proposal for r287: judge pantry on the
   per-seed MEDIAN (or the mean of log kcal) against the pooled median
   ±30%, keeping the mean as the reported second number. No re-score
   of r286 — the miss stands on the frozen bar and the baseline does
   not roll.
2. **Telemetry-check sums artifact (standing):** the checker compares
   SUMS, so any pooled-baseline roll makes the next 8-seed check print
   LOUD lines that are pure seed count. Judge on per-seed means (this
   run: deaths −2.1%, popAlive +1.1% on means; pantry −35.6% is the
   real Q4 miss). The checker itself needs a --per-seed mode, or the
   baseline needs a per-seed-means shape; owed as a tooling note, not
   a run finding. (This run also caught an invocation footgun: bare
   `--metrics deaths,...` reads baseline 0 for deaths; the dotted
   `guardrails.deaths,...` form is the correct one.)
3. **Q1b F5 floor (standing):** thin<7% while fat>15% recurs (3.0% vs
   29.5% this band). Build-arm item; reported, not judged.
4. **Sleep-retry non-advances (standing watch):** 5 this band vs 2 on
   r285/r277/r274 — all attributed jitter repeats, none a lost day.
   If the next band reads ≥5 again with an unattributed event, it
   becomes the question.

## New-code watches (Q9)
- FLEEGUARD (90624c800, default OFF): no flee-guard lines fired, as
  expected — the driver never sets FLEEGUARD=1. No behavior change.
- SOCIAL r283 variety pools 4→8 + heed dry fix (838f3a380, NEW IN
  BASE): want-raise 16.8% (r285: 13.8%) with zero-raise seeds 0/8;
  recap paraphrase distinct 1/16 (r285: 5/16); warn-heed sittings 14
  (r285: 24) with 6 delivered. Moves are within band shape and read
  as fix effect (more variety, less repetition), not regression.
- TBREFUSE: no guard-refusal rows on the panel (no heralds in the
  d14–40 window, as expected).
- BLOODCLUSTER: fight/death bookkeeping moved with the panel, not
  against it — deaths 47.3/seed vs pooled 48.3, within band.
- WORNGUN-RESEAT: gun totals in the end census — BOWCRAFT 21 bows;
  no destroyed-gun recurrence surfaced (no direct destroyed-gun
  counter on this leg; the bow total is the proxy).
- REARM-WITNESS: no rearm lines fired in the establishment window.
- CALLEDNAME: descriptor-form drift lines — none surfaced in the
  transcripts read (Kwabena-style naming holds; no "stranger"
  descriptors in the held convos).
- HOLDREPEAT: no repeated hold lines observed.
- SUCCESSION r280: mourning/drift-note shapes — no mourning-repeat
  lines observed on this panel.
- DEPARTNAME: departure beats use true names on the panel (70 DEPART
  beats, all name-form in the analyzer's line samples).
- SCALE r283 guns census: gun counts per seed reported via BOWCRAFT.
- LANDING r284 death terminal: one contest death on the panel —
  Dylan d40 (the arena, 109054, before-fix corpus); the analyzer's
  roster reconcile shows no UNACCOUNTED removals panel-wide and the
  scholar-death line names the arena as the cause — the death-terminal
  close held.

## Reachable / Fun / Winnable
- **REACHABLE: yes.** A competent player reaches the establishment
  content on every seed: favors, contests, wave 3–4, standing 0–100,
  regional links forming. Nothing in the leg is gated behind content
  the player cannot find — except, until this run's fix, closing the
  books on a dead predecessor's outing, which depended on the luck of
  the conversation opener. That gate is now closed by the fix.
- **FUN: yes, with one honest dead end and one quiet village.** The
  conversations are the leg's strength (Stella, Sergio, Carmela). The
  snare-mend ask remains the one place the game asks for help it cannot
  accept (carried from r285, build-arm item). The quiet village (109057)
  is a different kind of flat: 42 days of talk with no outing, no
  departure, no standing — not broken, but becalmed.
- **WINNABLE (progress): yes, stalled at the same wall.** Parties form
  and depart (87), standing climbs (to 100), waves unlock — but no trio
  in eleven runs, so wave-4+ fights are still pair fights. The leg
  moves the player toward a win; the trio gap is the standing wall above
  this leg, not inside it.

## Telemetry
`node scripts/telemetry-check.js` vs the r274+r277+r280+r285 pooled
baseline (32 seeds), dotted metric names: 3 LOUD lines — deaths −76%,
popAlive −75%, pantryKcal −84% on sums. Adjudicated BEFORE any roll:
two are the pure seed-count artifact (8 files vs 32-file baseline
sums); the pantry line is the same −35.6% mean miss already judged
under Q4. Baseline NOT rolled (Q4 roll condition fails on pantry).

## Gate
`node scripts/check.js --quick` in the worktree: **338 passed, 6 failed
in 934s** (GATE_EXIT:1). The 6 failures are exactly r285's standing set
plus one load flake:
- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (exit 1, ~1.6s each) — the stale measurement-proof pair: the retained
  proofs don't cover the current Game/controller/harness inputs. Standing
  since r285.
- `test-living-garden-deed-attainment.js` + `test-one-person-army-
  deed-attainment.js` (120s timeouts) — the standing deed-attainment
  pair.
- `test-phone-frame-proof.js` (exit 1, 3.3s) — stale phone evidence
  (MOBILE-PLAYTEST receipt). Standing.
- `test-trust-observer-neutrality.js` (120s timeout in the gate) —
  **re-ran standalone immediately: 6/6 green.** A load flake, as on
  r285: the gate ran 4-parallel under load average 8.07 on a machine
  restarted mid-run.
**None attributable to this run's `conversation.js` change.** The change
touches only `convoMenuPage`'s menu assembly, and its two proof tests
(22/22 bearer-end, 20/20 menu-priority) were run directly — neither
is on the gate's green list (`check.js --quick` covers godpath tests +
green-list `quick` entries; `scripts/test-*.js` runs only via the green
list, and the loop's convention is to run journey proof tests directly).
No new failure; nothing landed over red.

## Closeout
Base moved after registration (sim-fibersupply-a landed on master as
e0a213d09): rebased the branch onto e0a213d09 — clean, no conflicts
(fibersupply touched only its own scripts/evidence), proof tests re-run
after the rebase (22/22 bearer-end, 20/20 menu-priority). Merged
ff-only into master, worktree released + removed, branch deleted,
rotation 1→2 (deepening next), lock deleted, heartbeat loop killed
(the loop was restarted once after a machine restart ~21:13Z killed
the first one; heartbeat re-established 21:28:35Z). Merged locally,
pending ship — no version bump, no push (ship loop owns those).
