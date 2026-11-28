# Journey leg ESTABLISHMENT — r292 run note (2026-11-28, Lane A)

## Run
Run id `playtest-loop-a-20261128T0321Z` (scheduled Fri 2026-11-27 20:45 CST).
Leg 1 establishment, days 14–40 window, 42-day horizon. Rotation file read
**1 (establishment)**. **Base:** local master `4ca86a1f6` at registration
(r291 landing). Pre-flight: main tree CLEAN, disk 52%. `git pull` —
already up to date. Lock created 03:23:55Z before any work. Heartbeat
loop running (adaptive hbloop, pid 47453, 120s retry / 600s landed;
beats landed throughout — one manual beat skipped once on registry-lock
contention with the live flesh-out registration sim-scalerank-a, which
was legitimately holding the lock; the hbloop retried and landed).
Registration took ~21 min (queued behind sim-scalerank-a's 23G worktree
add + sim-capstoneready-a's chained registration — both live holders,
not killed); heartbeat_at 03:38:35Z at registration.
Prereg: `hidden_files/evidence/2026-11-28/journey-establishment-r292-prereg.md`
(frozen before the pilot; seed-band freshness check recorded there).

## Panel
**FRESH band 109151–109158** (pilot 109151, then 109152–109158), same
competent policy + the frozen cancel-press rule, 42d horizon,
death-aware tail +10d. Driver clone verbatim r286 except run number /
output names / header / seed band / the frozen cancel-press rule;
analyzer clone verbatim r286 except run number / file names / comparison
strings (Q4 pantry now judged on the MEDIAN vs pooled median 31,637;
stranded-close now EIGHTH band; r286 values added to every comparison
line; Q8 counts extended with r286: 8). Pilot 109151 finished in ~73s,
no instrument errors; panel 7 seeds ran ~5 min total. Analyzer exit 0,
547 lines. Determinism: seed 109151 replayed after the panel —
**byte-identical** (JSON + convo).

Panel summary (per-seed): all 8 villages alive at d40 (aliveAt40 8–12);
waves 3–4; standing 0–180; deaths 35–76/seed (panel 446); pantryEnd
7,273–67,436 kcal; 0 jam-days; 0 broken-water dawns; 0 stranded runs;
3 arrivals (all on 109158); 3 exiles (all on 109155, one case, d44).

## Verdicts (frozen bars)

- **Q1 STRANDED-CLOSE, EIGHTH BAND: NO-OPPORTUNITY.** 0 stranded runs
  on the panel (0 stranded dawns). The press rule never had a wild
  opportunity: **0 urgent sits panel-wide** (checked in the JSONs —
  every cancel pick was the r137 end wedge, mode 'end', urgent=false,
  on broken living-bearer runs). The mechanism is carried by the proof
  test (31/31) and by the r286 re-panel (closed 1 dawn). **109054
  RE-PANEL PROBE (not scored): NO-OPPORTUNITY, seed diverged.** On
  the r292 base+driver, 109054 never forms the stranded shape: Aisha
  dawns through d26 (she died d21 in r286's run) and Dylan takes over
  d27+ and survives to d45; aliveEnd 11, deaths 69, standing 120,
  pantry 55,591, stranded 0, no endLog. The trajectory moved upstream
  (departfit departure-fitness + B1 + driver changes) — the probe
  cannot confirm the wild close on this base. The close remains proven
  by the r286 re-panel and the r292 proof test, not by this probe.
- **Q2 MOOT-CLOSE: NO-OPPORTUNITY.** 0 evictions of a live-run holder;
  0 moot-closes. Mechanism carried by the r269 proof test (36/36).
  Eighth straight band with 0 evictions of a run-holder.
- **Q3 SILENT-ARRIVAL: GO.** 3 arrivals, 2 NARRATED-BY-NAME + 1
  NARRATED-DESCRIPTIVE, 0 SILENT. (All three on 109158, d44–46: a
  late influx — Dieudonne, Nadia, Dmitri.)
- **Q4 GUARDRAILS: MISS on pantry MEDIAN — baseline does NOT roll.**
  Deaths 55.8/seed vs pooled 48.3 (+15.5% ✓), popAlive 9.9 vs 9.3
  (+6.5% ✓), starvationDeaths 0 ✓, pantry MEAN 39,179 vs 36,393
  (+7.7% ✓) — but the frozen bar judges the **MEDIAN: 44,237 vs
  pooled median 31,637 (+39.8% ✗, outside [22,146, 41,128])**. The
  band is bimodal (4 fat seeds 57k–67k, 4 thin 7k–31k); the median
  lands in the gap between the clusters. The regime did NOT move (the
  other three metrics all sit within ±7% of pooled, and the per-seed
  pantry spread 7k–67k is the same 9x shape as r286) — the instrument
  is the finding, not the game. See metric review §1. Baseline stays
  at the r274+r277+r280+r285 pooled sums.
- **Q5 SPOTTER (REVISED bar): GO.** Panel cumulative 130 (bar ≥20),
  8/8 seeds cumulative >0. End-holding 104 (8/8 >0). LADDER 6/8
  (bar ≥6/8 — exactly at bar). FASTER-ID 7/8 (216 benefit plays in
  289 bump calls, 75%). Max skill 2. Thinnest seed 109156: cumulative
  3 (3 bump calls, 0 benefit) — the scholar barely did fieldwork.
- **Q6 SCHOLAR DEATHS: 2 — WATCH (bar ≤4).** Milton d39 (109155,
  sickness), Esperanza d33 (109158, sickness). No unnamed-cause
  ("the night") deaths. The (4,4) last-dawn shape recurs a SIXTH band
  running: both last dawned at (4,4) with atHaven=true,
  insideHaven=false. Both died sick, not in the wild.
- **Q7 SLEEP-RETRY: 66 tried, 65 advanced — 1 non-advance** (r286:
  41/36, 5 non-advances). The single non-advance is 109155's d19
  repeat ("Not in the middle of a fight"), attributed. DAY-DESYNC:
  net drift +11 panel-wide, 13/13 events attributed — GO. The r286
  watch (≥5 non-advances with an unattributed event) does NOT fire.
- **Q8 EXILE RATE: WATCH — 3 exiles, below the 11-exile investigate
  line.** All three on 109155 d44, one case (case_12): Tariq, Jovan,
  Greta — all moot, all HEARD (advance notice), 0 PRESENT, 0 UNHEARD.
  **TRIPLE EXILE FIRED with advance notice** (the carried watch):
  Tariq's case was announced d43 ("Tariq stands accused over what
  happened to Milton"); Jovan and Greta carried 0 moot/case naming
  lines but were HEARD via the case-thread proxy (held sittings inside
  the case window) and present-at-moot lines. Counts by band: r246: 2,
  r265: 3, r274: 4, r280: 5, r285: 11, r286: 8, r292: 3. The r285
  spike is now two bands past.
- **Q2 SITTING CLOSES: GO.** 0/16 CUT sittings; 4 engine-ended WITH
  closing beats.
- **Q1b WANT-RAISE: GO.** 64/599 (10.7%; bar ≥10%), zero-raise seeds
  0/8. **F5 FLOOR shape RECURS** (build-arm item, reported not
  judged): thinnest seed 2.5% (109157: 2/79 — the most successful
  village, 12/12 alive, standing 180, asked least), fattest 20.3%
  (109158: 15/74).
- **Q1 FAVORLESS ASK: GO.** 3 favorless sits of 64 raised asks (4.7%;
  r286: 1.1%). Repeats: Imani 1, Nathan 1, Adoma 1; 0 contentless
  re-seeds.
- **COUNTER LABELS: clean.** 216 COUNTER LEARNED lines, 0 comma-clause,
  0 em-dash.
- **BOWCRAFT: 23 bows equipped panel-wide** (r286: 21) — the recovery
  holds. 0 bow-key telemetry events (blind-scan confirmation).
- **WARN-HEED: GO.** 30 warn_you sittings, 19 delivered (0 via the
  deepen arc), 0 engaged-unnamed. 11 sittings ended before engagement
  (listed in the analyzer output, not findings).
- **SETTLED-FAVOR / DRY2 / SELFWIT: all 0.**
- **WINPLAN: GO.** Plans seeded on 8/8 seeds (planSeeds 28);
  partyDepartures 105 on 8/8 seeds (beats 99 on 8/8, beats ≤
  departures every seed); partyFights 451; reseeds 0; expiries 0.
  **TRIO GAP: 0 trios, 0 quads — 12th straight run.** Parties form
  and depart, but never as three.
- **END BAR: GO.** 9/9 broken-live forage opportunities closed within
  2 dawns. TRUST GUARD 0 drops. JAM 0 days.
- **CODEX:** 324 plants identified at end across 8 seeds (r286: 263).
- **VILLAGE BAR: GO.** 8/8 alive at d40.
- **Q3 RECAP PARAPHRASE: distinct=3 of 16 sittings (raw 6)** —
  report-only, under the 6-distinct over-representation line.
- **QUIET-VILLAGE WATCH (from r286): NOT the r286 shape.** Seed
  109158 ends at standing 0 BUT with 9 departures, 5 plan seeds, 9
  favor actions and 24 fights — it is active, not quiet. Standing 0
  despite activity: the village departs and fights but gains no
  standing (no deeds landed). Named as a descriptive finding: activity
  without standing. Whether such villages ever convert activity into
  standing is the open question it leaves behind. (r286's 109057 was
  0 departures + standing 0; this band has no 0-departure seed.)
- **DEPARTFIT (Q9): no regression.** Departures ROSE 87 → 105 vs
  r286 (beats 70 → 99) with the departure-fitness check live. No
  ready-but-never-departed shape surfaced.

## The driver change (this run, no game change)
**PRESS THE BEARER-END CANCEL** — port of the r287 deepening driver
rule (build A) into the establishment driver
(`scripts/journey-establishment-r292-20261128.js`, `pickWedgeChoice`,
extracted as a top-level pure function on the R139 precedent;
proof `scripts/test-journey-establishment-r292-cancelpress-20261128.js`,
**31/31**): when a sitting offers `dlg:favor_cancel` AND the favor is
bearer-ended urgent (`convoFavorEndUrgent`), the driver presses it —
after the mode's own verb (work/start `favor_action` still wins,
deliver-first; accept `commit` still wins for an ask_favor joint
want) and before the r129 requirements pick (no "why" when the end is
on the table). Healthy live runs are untouched (urgent false). The
proof stages the panel's exact shape (favor 'asked', promise released,
bearer dead, scholar at Haven) and proves: urgent → cancel pressed
(P1), not-urgent → never pressed (P2/P3), mode verbs outrank the
cancel (P4/P5), social sits press it (P6), fallback never returns a
NO_PICK id (P7/P7b), the sit() call path matches the bare call (P8);
the live stranded shape reads urgent, a sitting offers the cancel, the
requirements answer names the ending ("close the books") and never says
"not your promise" (B1–B9, B1 re-verifying the r287 fix on this base);
the healthy control reads not-urgent, leaves the cancel alone, and
keeps its kcal requirements line (C1–C5); the healthy empty-haul
control keeps "nothing to bring home yet" (D0–D4). The r280
menu-priority behavior is preserved (favor_action/commit still first).
`[needs-eyes]` NOT included — this is a driver (test-player) change,
not a game or feel change; no src/js changed this run. The press rule
had no wild opportunity this band (0 urgent sits), so its first wild
exercise is still owed to a future band.

## People check — PASS (4 full transcripts read)
Seeds 109155 + 109158, two sittings each, read in full.

- **Jamal (109155, sign painter)** — resumed-thread opener stitches a
  wound-care quote ("This wound — I can't clean it properly
  one-handed. Could you take a look?") onto a thread labeled "that
  personal stuff" — quote and label don't match; the wound ask never
  resolves. The conversation pivots to a real question ("Have you ever
  hurt someone?") with an honest answer and an honest close ("I don't
  keep score on that."). Real want, resolves.
- **Mxolisi (109155, comic shop owner)** — the run's best transcript.
  Opener names the DEAD scholar: "Milton and I never did finish
  talking about that personal stuff — that was 13 days back." The
  successor is invited to resume Milton's thread and closes it ("that
  personal stuff, settled. Feels better said out loud."). The village
  remembering Milton is good continuity; the successor settling his
  personal thread as if it were theirs is a small honesty wrinkle
  (named, not judged). The conversation itself is real: "Do you
  believe in anything?" / "I believe in breakfast. In people showing
  up. Small, provable things."
- **Saul (109158, ESL teacher)** — resumed-thread opener coherent:
  the quote ("I watch how people look at you. Some of them are waiting
  for an alternative.") IS the leadership thread. Walk to the treeline,
  leadership philosophy ("Leadership is mostly listening, then
  deciding."), invite accepted ("Someone should watch your back.
  Might as well be me."), personal story ("monsters are just wildlife
  with better PR."). Excellent. One soft beat: "They let the words sit
  there, unanswered" after "Go on. I'm listening." (same stall beat
  r287 noted on Heinrich).
- **Adoma (109158, bartender)** — plant teaching (Wild Strawberry
  found, Pawpaw taught), invite accepted, personal story ("You ever get
  a song stuck in your head with no way to play it?"). Warm, coherent,
  resolves. Note: her recap carries "Just... be straight with me." —
  Saul's idiom from his own personal story in the same seed; the phrase
  is shared across villagers.

Verdict: villagers act like people. Wants are real, deflections are
honored, endings resolve or plant honestly. **Recurring nits
(documented, not landed):** (a) resumed-thread opener quote/thread
mismatch recurs (Jamal: wound quote on a "personal stuff" thread —
3rd band running for the opener-stitch family); (b) successor resumes
a dead scholar's personal thread (Mxolisi/Milton); (c) a villager's
idiom ("be straight with me") surfaces in another villager's recap.

## Village assessment (plain words)
Eight villages, all alive at day 40, with 8–12 people left of the
starting 12. They know things: 324 plants identified between them,
spotter knowledge on every seed (one village's knowledge spans two dead
scholars and still counts), 216 counter-lessons learned and named
cleanly. They work together: 105 party departures, 28 plans seeded,
favors raised on ~11% of social sits and mostly completed (9/9 broken
forage opportunities closed). They also exile each other — 3 people sent
walking on one seed, all after a case the village had heard about, with
advance notice. Two scholars died, both of sickness after dawning at
Haven's edge. No village starved (0 starvation deaths, pantries
7,273–67,436 kcal at end). What is missing: a third person in any party
— twelve runs now, still no trio departure, so the wave-4 fights are
still fought by pairs; and one village (109158) did everything — 9
departures, 24 fights — and ended the leg at standing 0, activity
without standing. The village isn't broken; it's unrewarded. Whether
activity ever converts into standing there is the open question it
leaves behind.

## Metric review (§14)
1. **Q4 PANTRY bar — the median revision FAILS as an instrument; propose
   reverting to the mean with a wider band.** The frozen bar judged the
   per-seed MEDIAN against the pooled median ±30%. This band's median
   missed HIGH (+39.8%: 44,237 vs 31,637) while the mean passed (+7.7%:
   39,179 vs 36,393). Last band the median missed LOW (−45%) while the
   mean missed −36%. Across the two bands the median swung 2.5x
   (17,454 → 44,237) while the mean swung 1.7x (23,450 → 39,179) —
   on an 8-seed band with a bimodal pantry distribution (4 fat, 4 thin
   this band), the median lands in the gap between clusters and is the
   LESS steady instrument, not the more. The regime did not move on
   either band (deaths/popAlive/starvation all within ±8% here). Proposal
   for r293: revert pantry to the per-seed MEAN (the pre-r292 bar) with
   the band widened to ±50%, keeping the median as the reported second
   number. No re-score of r292 — the miss stands on the frozen median
   bar and the baseline does not roll.
2. **Telemetry-check sums artifact (standing):** the checker compares
   SUMS, so any pooled-baseline roll makes the next 8-seed check print
   LOUD lines that are pure seed count. Judge on per-seed means (this
   run: deaths +15.5%, popAlive +6.5%, pantry mean +7.7% on means). The
   checker itself needs a --per-seed mode, or the baseline needs a
   per-seed-means shape; owed as a tooling note, not a run finding.
   (This run also caught an invocation footgun: the --current glob
   matched the 109054 probe file too, reading 9 files; the check was
   re-run from a scratch dir with only the 8 panel files.)
3. **Q1b F5 floor (standing):** thin<7% while fat>15% recurs (2.5% vs
   20.3% this band). Build-arm item; reported, not judged.
4. **Sleep-retry non-advances (standing watch):** 1 this band vs 5 on
   r286 — the r286 watch does not fire. The single non-advance is an
   attributed jitter repeat.
5. **Q6 (4,4) last-dawn shape (standing):** sixth band running with
   (4,4) as the modal last-dawn tile for scholar deaths — both deaths
   this band dawned there. Descriptive, not a bar miss.

## New-code watches (Q9)
- DEPARTFIT (sim-departfit-b, 827386240; villager-brain.js +166, NEW IN
  BASE): departure-fitness check live — departures 105 vs r286's 87,
  beats 99 vs 70. No suppression, no ready-but-never-departed shape.
  Adjudicated as fix effect (or band shape), not regression.
- R287 B1 (6f5e08bde; convo-dialogue.js +24, NEW IN BASE):
  ending-aware requirements line — re-verified in the r292 proof test
  (B3/B4: the staged bearer-ended sitting's requirements answer names
  the ending, never "not your promise"). No stranded run in the wild
  this band to re-verify it against.
- R286 bearer-end any-want fix (3fd6e9e70; conversation.js +43): the
  cancel offer was re-verified in the proof test (B2: a sitting offers
  it). No wild stranding to exercise it against.
- FLEEGUARD (90624c800, default OFF): no flee-guard lines fired, as
  expected — the driver never sets FLEEGUARD=1. No behavior change.
- TBREFUSE: no guard-refusal rows on the panel (no heralds in the
  d14–40 window, as expected).
- BLOODCLUSTER: fight/death bookkeeping moved with the panel, not
  against it — deaths 55.8/seed vs pooled 48.3 (+15.5%, within band).
- WORNGUN-RESEAT: gun totals in the end census — BOWCRAFT 23 bows;
  no destroyed-gun recurrence surfaced (no direct destroyed-gun
  counter on this leg; the bow total is the proxy).
- REARM-WITNESS: no rearm lines fired in the establishment window.
- CALLEDNAME: descriptor-form drift lines — none surfaced in the
  transcripts read (Kwabena-style naming holds; no "stranger"
  descriptors in the held convos).
- HOLDREPEAT: no repeated hold lines observed.
- SUCCESSION r280: mourning/drift-note shapes — no mourning-repeat
  lines observed on this panel.
- DEPARTNAME: departure beats use true names on the panel (99 DEPART
  beats, all name-form in the analyzer's line samples).
- SCALE r283 guns census: gun counts per seed reported via BOWCRAFT.
- LANDING r284 death terminal: no contest death on the panel this run
  (0 contest deaths; the analyzer's roster reconcile shows no
  UNACCOUNTED removals panel-wide).

## Reachable / Fun / Winnable
- **REACHABLE: yes.** A competent player reaches the establishment
  content on every seed: favors, contests, wave 3–4, standing 0–180,
  regional links forming. Nothing in the leg is gated behind content
  the player cannot find.
- **FUN: yes, with one honest dead end and one unrewarded village.**
  The conversations are the leg's strength (Mxolisi, Saul, Adoma).
  The snare-mend ask remains the one place the game asks for help it
  cannot accept (carried from r286, build-arm item). The standing-0
  village (109158) is a different kind of flat: 42 days of departures
  and fights with no standing to show for it — not broken, but
  unrewarded.
- **WINNABLE (progress): yes, stalled at the same wall.** Parties form
  and depart (105), standing climbs (to 180), waves unlock — but no trio
  in twelve runs, so wave-4+ fights are still pair fights. The leg
  moves the player toward a win; the trio gap is the standing wall above
  this leg, not inside it.

## Telemetry
`node scripts/telemetry-check.js` vs the r274+r277+r280+r285 pooled
baseline (32 seeds), dotted metric names, 8 panel files only: 3 LOUD
lines — deaths −71%, popAlive −73%, pantryKcal −73% on sums.
Adjudicated BEFORE any roll: all three are the pure seed-count artifact
(8 files vs 32-file baseline sums); on per-seed means deaths +15.5%,
popAlive +6.5%, pantry mean +7.7% — all within the ±30% band. The
pantry MEDIAN miss (+39.8%) is the Q4 finding already judged above.
Baseline NOT rolled (Q4 roll condition fails on the median).

## Gate
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
in the worktree (detached via setsid/nohup, pid 63098, started 04:17Z;
log `hidden_files/evidence/2026-11-28/journey-establishment-r292-check.log`):
**334 passed, 10 failed in 1620s** (slow — the flesh-out gate
sim-fleerepair-b ran concurrently, load average ~6–8).

The 10 failures: 6 timeouts at the 120s cap (comfort-arc, living-garden,
occupation-panels, one-person-army, trust-observer-neutrality,
capable-bot-20261014), cache-flags exit 1, and 3 standing staleness
failures (measurement-proof-update, measurement-workflow, phone-frame-proof).

Standalone re-runs (timeout 300s each, logs `/tmp/r292-rerun-<basename>.log`):
- **Proven load flakes, green standalone:** comfort-arc 9/9,
  occupation-panels 25/25, one-person-army 7/7, trust-observer-neutrality
  6/6, capable-bot 40/40, cache-flags 4/4 (re-run earlier, 20s).
- **living-garden-deed-attainment:** still progressing at the 300s cap
  (seeds 4, 5, 6, 8, 9… in the log) — a slow test, not a hang and not a
  failure; the gate's 120s cap is what kills it. Standing gate-cap
  casualty, same as r286.
- **Standing staleness, fail standalone too:** measurement-proof-update,
  measurement-workflow, phone-frame-proof — the same three as r286/r287.
  Pre-existing staleness, not caused by this run: this run changes no
  `src/js` (driver + analyzer + proof test in `scripts/` only).

Adjudication: nothing in the gate is attributable to this run's change.
The run's own proofs all pass (cancel-press 31/31, bearer-end-anywant
re-green 22/22, menu-priority 20/20, bearer-end-r265 33 passed). Gate
does not block landing.

## Closeout
Base moved after registration (sim-reunionwild2-b + sim-scalerank-a
landed on local master as 5c17676fa; origin/master is the ship-loop
version bump bf21c02bb, already contained in the branch base):
rebased the branch onto 5c17676fa — clean, no conflicts (the only
src/js change in range is the unrelated Eulogy armor-bypass fix),
proof tests re-run after the rebase (31/31 cancel-press, 22/22
bearer-end-anywant, 20/20 menu-priority, 33 bearer-end-r265). Merged
ff-only into master, worktree released + removed, branch deleted,
rotation 1→2 (deepening next), lock deleted, heartbeat loop killed.
Merged locally, pending ship — no version bump, no push (ship loop
owns those).
