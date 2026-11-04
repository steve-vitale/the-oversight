# journey-scale r95 — Lane A, leg 3 SCALE (2026-11-04 morning)

**Run id:** laneA-scale-2026-11-04T03:45CST (scheduled 03:45 CST 2026-11-04).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success (the
rotation file was briefly advanced at run start and restored to 3
before any scored seed ran, per the r94 "pilot-gate stop is not
success" rule — this run succeeded, so 0 stands).
**Base:** master@2106108b8 at branch creation.
**Pre-register:** evidence/2026-11-04/journey-scale-r95-prereg.md
(committed as 9217baca7 before any scored seed ran).
**Change set at closeout:** ZERO src/js, zero src/data. Tooling (r95
driver/analyzer clones, labels/seeds/EVIDIR only, diff verified) +
evidence + run note only. Gating freeze honored; perception law
honored (all instruments read-only; pickers press offered menu items
only; the tend-arm presses the offered Haven-panel tendLink verb only).
**Fix-gate verdict: no code change.** Q1 verified a landed fix, Q2
diagnosed a policy-instrument loop (not a game defect — see below),
Q3 found no senseless defect. Clause (a) fails for every candidate,
so nothing was touched in src/.

## Infrastructure notes (loud, first)
- No lock contention at start: no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- Pre-flight clean: main-tree `git status` empty, disk 29%,
  `git pull` already up to date, worktree-reap ran (11/16 active —
  dirty/held sibling trees correctly untouched; one locked sibling
  tree's removal failed aloud in reap, not mine to force).
- Registration was slow, not stuck (~6 min under sibling load, same
  class as r90/r94). One manual heartbeat queued ~2 min behind a
  sibling registry lock — beats queue under contention, they do not
  fail; registry read-back is the proof, not the loop's log.
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r90/r94: after the correct private-index commit
  (9217baca7, 3 files, 950 insertions), the worktree's main index
  lied (3 files staged-as-deleted + untracked). Repaired via
  HEAD-blob cacheinfo, verified: `git status` clean, `git diff HEAD`
  empty, hash-object matches HEAD for all 3 files. The commit itself
  was correct.
- **Heartbeat loop died twice, same class as r94:** the nohup loop
  started at registration did not survive its parent exec session
  (no loop process found at 10:24Z, registry 9 min stale). Recovered
  by manual beat verified by read-back (10:24:34Z), then restarted
  as a tracked background session on a 9-minute cadence. Lesson
  carried, third run in a row: a nohup loop is not a heartbeat —
  verify by registry read-back at every major step.

## Q1 — R94 COPY FIX IN LIVE PLAY: VERIFIED, 57/57 (binding, FINDING)

Policy scalecourt-nogate, WANT_SUBJECT=1, GOSSIP_FIRST=0 (unforced),
TEND_PEER=1, DAYCAP 180, death-aware stop. Pilot 85401 ran first, no
crash → quad expanded per prereg.

Trustset analyzer over the quad's captures (crisis announcements =
leader-death / speaker-death / strain variants):

| seed | crisis announcements | naming −10 |
|---|---|---|
| 85401 | 15 | 15 |
| 85402 | 24 | 24 |
| 85403 | 17 | 17 |
| 85404 | 1 | 1 |
| **quad** | **57** | **57 (100%)** |

The prereg's FINDING clause triggers in full: ≥1 announcement fired
and 100% name the −10. r94's wording fix is not just in the code —
a player watching any of these four villages hears the price of every
crisis in the moment. (The HOLD path already named it; the three
crisis variants now do too, exactly as r94's proof test asserted.)
Crisis cycles remain heavy — 11–12 cycles on 85401/85402 links,
net −22/−24 per link — but they are now honestly priced, which was
r94's whole point. The cycle loop itself stays a design question
under freeze, not retuned here.

## Q2 — PILGRIMAGE TRIP LEDGER: trips complete, drops wear the stale signature (binding, new diagnostic)

Semantics first (policy code, not inference): `ctx.pilgrimages`
increments at trip START, `ctx.climbStudies` at trip COMPLETION
(studyVillageCodex within 2 tiles at courtship time). A trip drops
without completion only via the code's four branches: target linked,
14 days elapsed (stale), game over, or a fight active (interrupted).
Ledger from the daily hungerwatch rows + final counters (drops =
starts − completions − in-progress at end):

| seed | started | completed | dropped | in progress at end | courtPoor days |
|---|---|---|---|---|---|
| 85401 | 2 | 2 | 0 | 0 | 50 |
| 85402 | 9 | 2 | 6 | 1 | 48 |
| 85403 | 4 | 4 | 0 | 0 | 82 |
| 85404 | 6 | 1 | 4 | 1 | 32 |
| **quad** | **21** | **9** | **10** | **2** | — |

- **Trips DO complete** — 9 completions across the quad, including
  all 4 on 85403 (days 26–37) and both on 85401 (days 26–30). The r90
  thin spot ("0 completed under a poor court") does NOT reproduce as
  a completion failure: 85403 completed 4/4 with 82 court-poor days
  and all 4 trips started poor (pilgPoor=4). A poor court does not
  block pilgrimages — the policy carries no pantry gate on trip
  start (only scholar HP > 70%), and the rows bear that out.
- **The drops wear one signature: the 15-day stale restart.**
  85404's village_2 trip restarted at days 29 → 44 → 59 → 74 → 90 —
  15, 15, 15, 16 days apart — studies frozen at 1 throughout, the
  village's opinion frozen at 0 (never studied, never proposed: the
  opinion bar is 10). 85402's spl_27 trip shows the same shape
  (restarts at 70, 77, 92, 107; studies frozen at 2). All restarts
  happened with hungryDays=0 in the sampled rows — hunger is NOT the
  blocker. The code fact that explains the shape: the study check
  reads the player's position BEFORE the walk each courtship day
  (dist ≤ 2 → study; else walkTo, up to 10 steps, and return) — so
  a trip completes only if the player is already within 2 tiles at
  courtship time. Walking to the village on courtship day N does
  not itself trigger the study; the next courtship day must still
  find the player there. The 14-day stale cap then kills any trip
  whose luck never comes, and the policy immediately restarts it
  against the same nearest needy village — a loop, not a journey.
- **What is NOT claimed:** the instrument cannot separate the
  stale branch from the fight-interruption branch per restart, and
  it cannot say why the player's position doesn't persist (the
  bot's other daily movement is the obvious candidate, not a
  proven one). Distances do NOT explain it: final villageWatch
  distances are 2–6 tiles — a 3-tile village should close in one
  walkTo call. The precise open question is the position-persistence
  micro-cause, carried with the signature, not guessed.
- **Fix-gate verdict: document, don't touch.** The pilgrimage loop
  is the TEST POLICY's climb strategy (scalecourt-nogate.js), not
  shipped game code — the shipped mechanic, studyVillageCodex, is
  proven working by the 9 completions. Retuning the stale cap or
  the check order would be tuning a measurement instrument's
  strategy, and any game-side reading (e.g. "far villages need a
  longer fuse") is a design call for Steve, not a senseless defect
  this run can land. The r90 thin spot is RETIRED as reframed:
  pilgrimages complete fine early and under poor courts; the
  failure mode is the stale-restart loop on already-near villages
  whose study never fires at courtship time.

## Q3 — PEOPLE CHECK (sense law — 5 sittings read in full)

Corpus: d90 on all 4 seeds + d120 on 85401 (the only seed alive at
120; the others ended d118/d112/d99 — no substitution, per prereg).
5 of 5 fully real. No fabricated shared history, no filler loops,
no static menus.
- **85401 d90 Ting (nurse, warm, curious):** the band's warmest
  thread — a funny story, then "I laughed yesterday and it scared
  me — the sound of it. Like my body remembered something my head
  hadn't approved. Laughter's a mutiny. A good one." Close owes
  support ("I'm rooting for you."). Real.
- **85401 d120 Nirmal (firefighter, prickly, grief):** "They'd tell
  me to keep working. So I'm working. That's the whole plan." A
  deflection with a reason ("it's handled"), a real awkward beat,
  close: "Talking helps. Then it hurts. Then it helps again. It's
  a cycle." Real.
- **85402 d90 Amina (midwife, warm, ask_favor)** and **85403 d90
  Luis (mason, steady, ask_favor):** both genuine deflections
  ("Never mind this wound / the sickness I'm fighting — we got it
  handled"), but read side by side they share one skeleton with
  the wound/sickness swapped — a craft note, not a defect: each
  still plays as a person not ready to let warmth in, with
  different closes. Named so the template doesn't pass unnoticed.
- **85404 d90 Meera (dentist, dry, ask_favor stage 2):** the band's
  best — betrayal:accept → a gifted tool ("Here. I made an extra."),
  then a real philosophy thread: "Healing's slow. People want it
  fast. I'm learning to be patient with both." / "Every person I
  help is a vote for the world making sense again." / "Bodies mend.
  It's the other stuff — trust, hope — that takes the real work."
  Close with dry humor ("I'm going to go stare at something else
  now."). Real, and the want advances.
- **Gossip:** 0 picks across all 5 sittings (unforced band;
  ask:gossip never appears in the offered choice lists) — the same
  offer-bottleneck class as r90/r94, noted not re-litigated.

## Q4 — CENSUS CONTINUITY (report-only)

| seed | end | day | pop | pantry | rank | seat | arc | tends | covenant peers (trust/age) | seasoned | scatter-day gap |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 85401 | DIED OUT (the wild) | 121 | 0/0 | 0 | regional | none | 3 | 3 | 60/89d, 34/12d | 1 | village_2 18d short of seasoning |
| 85402 | SCATTERED (hunger, 5th day) | 118 | 3/3* | 0 | regional | lesser | 4 waiting | 3 | 37/74d, 49/70d | 1 | village_1 trust-blocked, 3 short |
| 85403 | DIED OUT (last bearer, dehydration) | 112 | 0/0 | 0 | regional | none | 3 | 3 | 26/74d, 18/73d, 26/62d | 0† | seasoned, then LOST (see below) |
| 85404 | DIED OUT (the wild) | 99 | 0/0 | 2891 | regional | none | 3 | 0 | 22/10d | 0 | no 3rd peer; peer 20d + 18 trust short |

\* Census pop is the pre-scatter roster; the scatter narration fired
("On the fifth hungry day, people started walking"), same shape as
r94's scattered seeds.
† 85403's final seasoned count is 0 because national was staged and
then LOST — see the headline below.

**Headline census finding — national STAGED, then lost (first in
the r93–r95 sequence; r93/r94 were 0/4 staged):**
85403 staged the covenant national twice — "National beat staged:
covenant (4 villages)" with the governance layer announced at d80
and again at d98 ("Four fires. NO head. Interesting. ... A league
of equals. The audience has never seen one survive") — and lost it
twice, each collapse narrated honestly: "The realm came apart — and
the league's machinery dies with it: no more pool weeks, no more
tariff routes, no more calls. ... National no longer describes this
village. The climb starts over." The seatwatch rank flickers
national → regional → national across d91–d102 as live trusts
hover at the bar. The drains, per the trustset: crisis cycles
(4+3+3 across the three links), THREE refused defense calls at −10
league-wide each (the refusal branch is said aloud — "Trust −10
across the league" — no hidden charge; the policy refused while
the bench was thin), and pool-member-short 3×/−2. By d112 the three
covenant trusts sit at 26/18/26 — age-served (62–74d), trust-shorted
by 14–22. National here is not a door that never opens; it is a
room that does not hold while its members keep getting taxed for
their own distress calls and refusals. That sentence is the design
question r94 already carried, now with a staged-and-lost instance
instead of a never-staged one.
- **Other census notes:** 85402 ends lesser-seat waiting (arc 4) at
  scatter — the waiting seat outlives the village again. 85401 faced
  wave 5 (table detail w5 0→2 between d112–d118; faced, NOT kills —
  this instrument does not count kills, and no kill is claimed).
  Fusion continuity: installs d80/d26/d54 on 85402/85403/85404 with
  2 flips each (install, then succession darkening — the r90/r91
  mechanism reproducing); 85402 granted 11 feasts. Duty continuity:
  wsplit armed-gate classification reproduces on all 4 seeds
  (weaponless 0, eligible 0, attempts 0); analyzer duty lines
  wcLines 19/8/2/10, deadfallDuty 95/37/10/31.

## Village assessment (plain words)

Four villages, one new shape among the familiar endings. Haven makes
friends and climbs — courts, tributes, granary feasts, a pellet on
three seeds — and three of the four die with their boots on: the
last bearers taken by the wild, by dehydration on an expedition, by
starvation's fifth day. The fourth village scatters hungry with a
lesser seat still waiting for it, the way waiting seats keep
outliving villages. What is new this run is the village that got
there: a league of four fires, no head, announced twice by the
System and taken apart twice by its own costs — every crisis
answered generously still costing two trust, every refused defense
call costing ten across the whole league — until the trusts that
held the realm fell below the line and the realm stopped describing
the village. The crises now say their price out loud, which is the
honesty r94 bought; the price itself is still the thing that takes
the realm apart. And the pilgrims walk: nine study trips completed,
including four under a poor court — the climb works when the
traveler is already standing near the fire, and loops forever when
they are not.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — YES, further than r94.** Regional on 4/4 seeds;
  national STAGED on 1/4 (85403, twice) where r93/r94 staged 0/4 —
  the covenant road opens in play, not just on paper. What does not
  hold is the realm: 0/4 held national at end, 0/4 global, full seat
  0/4, lesser waiting 1/4.
- **FUN — YES, with the same honest-price caveat retired as a
  complaint.** The crisis price is now spoken; the realm's rise and
  fall is narrated as a story ("The climb starts over"), not a
  silent number slide; the conversations are genuinely good
  (Ting's laughter-as-mutiny, Meera's healing philosophy). The dull
  spot is the pilgrimage loop's invisible half: a player watching
  would see trips restart, not why.
- **WINNABLE — NOT YET, and the wall moved one rung up.** Scale is
  no longer "national never stages" — it stages and falls apart
  under its own distress economy, and every village still ends by
  day 121 on food, the wild, or dehydration before a season's
  requirements can be held. Behind this wall still sits the wave-4
  kill wall from the November 3 picture; this run faced wave 5
  (85401, w5=2) without claiming a kill.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale.json --current
'evidence/2026-11-04/journey-scale-r95/journey-scale-r95-trust-*.json'
--metrics nationalLive,scaleRank` → "quiet (4 files, 2 metrics, no
large deviations)". Same caveat as r93/r94: that baseline is an old
aggregate shape, so "quiet" means "no large deviation on these two
metrics", not a clean bill — and national staged-and-lost on 85403
is a shape change the two metrics do not capture (nationalLive at
end is false on all four seeds). Baseline NOT rolled forward.

## Tests
- `node --check` clean on the r95 driver and analyzer.
- Analyzer on the quad EVIDIR: all four seed lines as reported above
  (no zero-lines — the quad ran in full).
- check.js --quick (on the branch code, `--cacheDirectory=
  /tmp/jest-cache-playtest`): **284 passed, 6 failed in 528s**.
  The 6 are the SAME pre-existing failures r90 named (same files,
  same count): godpath/test-measurement-proof-update,
  godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence,
  godpath/test-occupation-panels, godpath/test-phone-frame-proof,
  and test-establishment-r20-fixes-20261020.js. This run changed
  zero src/js, so these cannot be regressions of this run; the
  tooling-only change set (driver/analyzer clones + evidence) is
  covered by the same guard.

## Metric review
- Q1's FINDING clause fired exactly as written (57/57 naming −10);
  no threshold was re-scored. The fix claim it verifies is r94's,
  not this run's — this run adds the in-play verification r94's
  quad (run pre-fix) could not.
- Q2's deliverable is the blocker distribution, not a threshold:
  started 21 / completed 9 / dropped 10 / in-progress 2. The r90
  thin spot is retired as reframed (poor courts do not block trips;
  the stale-restart loop is the drop mode), and the micro-cause is
  left open rather than guessed — a future run with a position
  trace can close it.
- Q3's corpus rule held: d120 exists only for 85401; no day
  substitution was made for the other three seeds.
- Q4 adopts the r93/r94 metric unchanged (seasoned-peer count AND
  scatter-day gap); it separates this band's four failures cleanly
  (trust-blocked, trust-blocked-after-staging, time-blocked, no-peer).
- Carried, still open: the crisis-cycle / distress-economy design
  question (Steve's call, freeze stands) — now with a staged-and-
  lost national as its sharpest instance; the pilgrimage position-
  persistence micro-question; the wave-4-kill wall behind the scale
  wall (unchanged, not re-proven here).

## Blanks: filled or documented
- VERIFIED (not changed): r94's crisis −10 wording fires in live
  play, 57/57 announcements.
- DOCUMENTED, not fixed (policy instrument, not game code): the
  pilgrimage stale-restart loop — check-before-walk ordering +
  14-day cap + immediate restart against the same nearest village.
- DOCUMENTED (design call, freeze stands): the distress economy
  that takes a staged realm apart (conceded crises net −2,
  defense refusals −10 league-wide, pool shortfalls).
- DOCUMENTED (craft note, not a defect): the ask_favor deflection
  skeleton repeats across Amina/Luis with only the ailment swapped.
