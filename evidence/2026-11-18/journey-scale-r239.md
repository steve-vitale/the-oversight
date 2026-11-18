# journey-scale r239 — scale leg (days 80–140), run 2026-11-18

**Leg:** scale (days 80–140, DAYCAP 140). **Run:** `playtest-a-20261118T0145Z`, Lane A.
**Branch:** `journey-scale` (base master `90f77c406` at prereg time; rebased onto
`b30a6367b` mid-run and onto `911c8db0c` at closeout — master moved twice under the run). **Seeds:** fresh 103821–103828 (primary) +
fallback 103831–103838 (arm A only).
**Policy (frozen):** `scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON, SIT false, sortie INERT.
**Prereg:** `evidence/2026-11-18/journey-scale-r239-prereg.md`.

## Verdict up front

**Q1 — INCOMPLETE. The run searched two bands and did not build the fix's proof.**

The question was whether the table's "mercy window" (the ~74 days after a village delivers a
capstone deed, when the table is quietly holding the seat open for them) wrongly freezes the
player's titan muster. On r233's band it did: one village held its muster 78 days with a
titan standing right there. The fix was a new, read-only question the engine can ask — "is a table
sitting actually happening right now?" — so the muster only waits for a real sitting, not for the
whole mercy window.

On this run's bands the mask never had a chance to bite — twice over. Arm A on the primary band
(103821–103828) held 29 mercy rows, and on the fallback band (103831–103838) 43 more — but the
titan was **absent on every single one**. Worst "present-held" count: **0 on all 16 seeds**
(bar was ≥7). The mercy rows that exist are all the **finale** titan, which is never actually
present in the world outside the finale. The herald — the only titan a muster can actually fight —
was already slain on every village that delivered a capstone, weeks before the delivery
(103825: herald slain day 102, capstone day 123; the fallback's two deliverers the same shape).

So the fix has nothing to prove itself against on either band, and per the prereg the run stops
here instead of landing a change proven against nothing. Arm B never ran. The fix itself is
still owed — but this run sharpens what "owed" means (see Findings F1): the precondition is not
just narrow, it is structurally near-impossible in the competent-player scale leg, because a
village that can deliver a capstone has already slain its herald. The proof test is preserved
red-verified (22/40 on the pre-fix tree) at
`hidden_files/evidence/2026-11-18/journey-scale-r239-table-sitting-test-RED.js` for the next run.

What the next run needs: a way to put a capstone and a *present* herald in the same village at
the same time — a staged scenario (a village handed a capstone while its herald still lives),
or a band hunt that scores bands on "capstone delivered while herald alive" before playing
them. Playing more blind bands will keep returning the same 0.

**The run is not empty, though.** The primary band delivered the richest scale census in
months: a **full seat taken** (103825, day 125), national on 2/8, the muster slew **6/6**
titans it called, and wave-5 beasts were **fought 19 times with one killed in the field**
(103827, day 126). The wall moved: national is reachable, the full seat is reachable, and
the binding constraint is now the veterans bar on tribute delivery (103827 needed 24 attempts,
23 refused for lack of veterans).

## The villages, in plain words (arm A, primary band)

Eight villages played days 80–140 as a competent player. Six survived to day 140; two fell
apart (day 47, day 124).

- **103821 — collapsed day 124.** Two people left, pantry empty. It slew its herald (the only
  muster call, day 49–50) and both committed Haven blades died in the wild afterward. Regional,
  lesser seat since day 35, never reached national (LEAD 2/3 seasoned).
- **103822 — collapsed day 47.** The early death: starvation 5, sickness 3, wounds 3, eleven
  deaths in 47 days. No seat, no wave-4 fight, no muster row at all — the village died before
  the leg's content started.
- **103823 — the stubborn one.** Twelve people alive at day 141, the biggest village on the
  band, but the muster never sounded: 56 titan days, 33 refused meetings, worst day 11
  refusals — the coalition stayed 1–3 blades short the whole leg. Regional, lesser seat,
  LEAD 2/3 seasoned (4 active links, needs 1 more).
- **103824 — steady.** Seven people, lesser seat, slew its herald on its one muster call.
  Regional, LEAD 2/3 seasoned.
- **103825 — the one that made it.** Reached national on day 125 through the trade road
  (three seasoned trade links), global the same day, delivered its military tribute on day 123
  (2 attempts, 1 refused for veterans), and **took the full seat on day 125**. Eight people
  alive, full pantry, four wave-4 kills, two wave-5 fights. The herald was slain day 102
  (9 blades, won) — three weeks before the capstone, which is why its 16 mercy rows cost
  nothing: the only titan left on the books was the absent finale.
- **103826 — small but alive.** Four people, lesser seat, slew its herald on its one call.
  Regional, LEAD 2/3 seasoned.
- **103827 — the wave-5 village.** Five people, lesser seat, delivered its military tribute
  on day 128 after **24 attempts (23 refused for lack of veterans)** — the veterans bar in
  the flesh. It slew its herald, fought wave-5 beasts **15 times**, and **killed one in the
  field** (the spoiler, day 126, ground down from 1300 HP to 1). Regional — its road to
  national needs one more seasoned link, and the tribute came too late (day 128) for a seat
  by day 140.
- **103828 — the other climber.** Reached national day 113 (TRADE 3/3), global the same day,
  delivered its trade charter day 114, lesser seat — but no full seat by day 140. Eight people,
  four wave-4 kills, its herald slain on its one muster call.

Band totals (arm A): 84 wave-4 fights, 19 wave-4 kills, 6 titans slain by muster (6 called,
6 won), 86 deaths, books closed on every seed (no unattributed deaths, no teleport-only
deaths). Every village reached stage 3 of the standing ladder; the lesser seat was priced
7/8 (103822 died before it could be priced).

**Fallback band (103831–103838, arm A only):** 0/8 national (all regional), 3 collapses
(103831 day 125, 103832 day 128, 103835 day 116), 2 capstones delivered (military tribute
day 96 and day 102), 43 mercy rows held, present-held 0. The fallback's villages never got
close to national — the band is a worse climber than the primary, and it reproduces the
same structural zero.

## Q1 — THE BLANK: TABLEACTIVE DISTINCTION — INCOMPLETE (two-band search)

- Primary band: mercy rows 29 (103825: 16, 103827: 13), present-held **0**.
  Arm A mask NOT REPRODUCED (bar ≥7).
- Fallback band: mercy rows 43 (103833: 27, 103838: 16), present-held **0**.
  Arm A mask NOT REPRODUCED (bar ≥7).
- The fix (engine `tableSitting()` + driver `MUSTER_HOLD=sitting`) was built and
  proof-tested (40/40, equivalence property holds, `tableActive()` byte-identical)
  and then **held off the merge**: per the prereg and the r236 precedent, a change
  proven against nothing does not land. The fix commit was rebased out of the branch;
  the proof test is preserved red-verified (22/40) in the goal evidence dir. Arm B
  never ran — there is no band to run it on.
- Q1(a) refusal-spam watch, measurement only: worst day 11 refused (103823). Outcomes
  are recorded on every refusal by design; the spoken-line dedupe is proved by the
  r233 proof test (re-run on the rebased tip as part of the gate suites — see Gate).

## Q2 — NATIONAL / DEED GATE: GO (measurement)

2 of 8 villages reached national (103825 TRADE, first day 125; 103828 TRADE, first day
113) and both went global the same day. The other six were blocked on link seasoning:
their closest road needs 1 more seasoned link (LEAD 2/3 on 103823/103824/103826/103827),
or collapsed first (103821 day 124, 103822 day 47). The deed gate: capstones ready on
2/8 (military tribute ready day 107 on 103825, day 70 on 103827), delivered 2/2,
**full seat taken 1/8** (103825, day 125 — national + delivered tribute + living
veterans was enough *on this band*, where r236's 103701 with the same ingredients got
no offer; the difference is unmeasured, not claimed). 103827 delivered day 128 and got
no seat by day 140; 103828 delivered its charter day 114 and got no seat by day 140.
The deed gate opens after national — sometimes, and late.

## Q3 — REGRESSION GUARDS: all HOLD

- **Vetbar:** 0 disagreements on all 8 seeds (GO).
- **Lived-days:** band mean 127.1 days per seed vs the control mean of 123 (+3.4%,
  inside the ±25% guardrail) — HOLD. Lesser seat priced 7/8 — HOLD.
- **Spoken-raise:** 12 raise talks, 9 properly answered, 0 defects (no talk spoken
  where the offer was never made) — GO.
- **Trap-line:** 3 nonverbal sittings, all answered, 0 defects — HOLD.
- **Nod-loop:** worst identical-reaction streak 3× (bar is 4×) — HOLD.
- **Betrayal sibling:** 2 turn-0 betrayal offers, invite label in the opening every
  time, 0 defects — HOLD.
- **Daily-play mime (read-only):** 25 daily-play mimes in the capture; the lower bound
  on daily-play accepts is 0 (no walk lines outside driver sittings). The lane decision
  is still owed: teach the shared chooser to take betrayal:accept + nv:accept when
  offered, or keep proving fixes only where the driver looks.

## Q4 — PEOPLE CHECK: PASS, with one noted echo

Read in full: 103825 day 120 (Aria, musician, gentle, trust 53 — a warn-you want that
escalates honestly: "You hear me, right? Not the words — the part underneath. I'm scared,
and I'm asking you not to make me watch it happen." The walk to the ridge lands — torn
ground, her hand finding the player's sleeve — and the want resolves at stage 3), 103827
day 120 (Chloe, interpreter, dry, trust 49 — opens mid-grief: "Every laugh out there
feels wrong today. Then I feel wrong for thinking it." The trap-line walk aborts at fresh
tracks; the pantry favor is concrete — forage tomorrow, two of us; the closing line is
in character: "I'll be okay. Don't worry about me. Worry about... actually, don't worry
at all."), 103826 day 120 nonverbal (Vasyl, Ukrainian-only soldier, trust 91 — a mime
walk, quiet at the tree line, nods exchanged with half-understood Ukrainian; the ending
is a shared look and pressed palms), and the 103825 day 24 raise talk (Walt's link
proposal, properly answered).

**The r236 blank (Q6 in the prereg) does NOT reproduce here:** in Chloe's sitting, "Go on"
after the gossip deepens into a reputation line ("Word is you're doing right by people.
Keep it up.") instead of echoing the ask. The one echo this run: Walt's raise reply
repeats the player's acceptance back nearly verbatim ("All right — let's ask them." after
"All right. Let's ask them.") — short and functional, not a defect, but the same shape
as the Paolo line at smaller scale. Documented, not fixed: it is a dialogue-content
change, outside this run's panel scope.

## Q5 — CENSUS: recorded above + spotter + W5

- Survival 6/8 to day 140–141. Deaths panel-wide: 86 — the wild dominates (largest
  single cause on every seed), then monsters; the arena and contests take a steady few.
  103822's 11 deaths in 47 days are the outlier (starvation 5, sickness 3, wounds 3).
- Wave 4: 84 fights, 19 kills (2 scholar-heavy seeds at 4 each); living-veteran peak 7.
- Wave 5: fought 19 times (103825: 4, 103827: 15, w5inst count), **1 killed in the
  field** (103827 spoiler, day 126). Live wave-5 entities walked the world up to 8 a day
  on 103827 (49/140 days) and 7 a day on 103825 (27/140 days). The ladder count is
  smaller (byWave 5: 2 + 4) — the two instruments count different fight sets; the
  w5inst number is the fight count, the ladder number is the scholar-visible count.
  The wave-5 door-open question stays open: these are field fights against roaming
  wave-5 beasts, not a faced finale door.
- Tribute (M23 shape): 103825 DELIVERED (ready d107, 2 attempts, 1 veterans-short);
  103827 DELIVERED (ready d70, 24 attempts, 23 veterans-short). The veterans bar is
  the binding constraint on delivery, not readiness.
- Spotter: d90 snapshots recorded per seed (analyzer Q5 section); no spotter-skill
  anomaly surfaced on this band.

## Gate and telemetry

- **Gate (`check.js --quick`):** run on the fix tree (1324s): **331 passed, 10 failed,
  0 attributable.** The 10: 4× 120s timeouts under extreme box load (living-garden,
  occupation-panels, one-person-army, trust-observer — the gate ran concurrently with
  two panel halves); the staleness trio (proof-update, workflow, phone-frame);
  cache-flags 0/4 (the documented box-load artifact); ladder-bundle ambient-raid
  control (pre-existing); test-deathcleanup-instrument EPERM (the write flap — see
  Infrastructure). Re-runs of the 5 load/flap suspects on the rebased tip (quiet box,
  sequential, `--only` each): deathcleanup **PASS in 10s** (flap confirmed);
  occupation-panels **PASS in 64s** and trust-observer **PASS in 37s** (load confirmed);
  living-garden and one-person-army **still 120s timeouts in isolation** — the standing
  deed-attainment timeout class (r236's gate had the same two). The merged tree carries
  zero `src/` diff, so no gate failure can be attributed to this run's changes; the
  "0 attributable" verdict stands on that, not on the re-runs alone.
- **Analyzer proof re-run on the rebased tip: 129/129.** Table-sitting proof test
  re-verified RED on the reverted tree (22/40) from the preserved copy.
- **Telemetry:** one LOUD line — maxGameDay swung 347% (baseline 468 → current 2091,
  n=16 files). Adjudicated as the known file-count artifact: the baseline is a 4-seed-era
  sum (117/seed), the current figure is a 16-seed sum (primary + fallback trust files,
  130.7/seed). fightsTotal and fightsByWave.4 did not trip. **Baseline NOT rolled** —
  same reasoning as r236: its provenance is unrecoverable, and this band (2 national,
  1 full seat, fix unlanded) is not the band to re-anchor on. The re-baseline is owed
  from a clean 8-seed panel once the Q1 fix lands and both arms run.

## Metric review

- Q1's bar (≥7 present-held mercy rows) proved its worth twice over: it refused to let
  the run claim a reproduction on 72 held rows that cost the player nothing. The bar
  stays as written; the two-band search rule (new this run) is now the procedure —
  the next run should score bands on "capstone delivered while herald alive" *before*
  playing them, not after.
- The lived-days control stays **123** (r233's 8-seed mean). Band mean 127.1 is inside
  the guardrail. The fallback band's mean (~128) agrees — the control now sits where
  the bands sit.
- Q2 is deliberately gate-free, and this band justifies it: 2/8 national with named
  blockers is the finding, and the full seat on 103825 is the news.
- The Q6(a) refusal watch stays measurement-only (worst day 11 is outcomes, not lines).

## Findings (for the tracker / next runs)

- **F1 — The mercy precondition is structurally near-impossible in the scale leg.**
  Across 16 seeds and 2 bands: 4 capstones delivered, 72 mercy rows held, 0 present-held.
  Every capstone deliverer had already slain its herald weeks earlier. The fix's
  precondition (capstone + present herald) needs a village that delivers *before* it
  kills — the opposite of the competent-player order (kill first, then tribute). Next
  run: stage the precondition (hand a village a capstone while its herald lives) or
  score bands first; do not play more blind bands.
- **F2 — The full seat is reachable on the current master.** 103825 took it day 125
  (national + military tribute + living veterans). The deed gate opens after national —
  sometimes, and late (103827 delivered day 128, no seat by 140; 103828 delivered day
  114, no seat by 140). The gate's timing, not its existence, is the next question.
- **F3 — Wave-5 beasts are fought and killed in the field now.** 103827: 15 fights,
  1 kill (spoiler, day 126). The door-open question is separate and still open.
- **F4 — The veterans bar is the tribute bottleneck.** 103827: 24 attempts, 23 refused
  for lack of veterans. Readiness is cheap; living veterans are dear.
- **F5 — Clone hazard (tooling, fixed this run).** The r236→r239 clone carried r236's
  seed list in the analyzer (its `SEEDS` const) and the analyzer proof test's fixtures.
  The first analyzer run read the wrong seeds (103701–103708) and reported an empty band.
  Fixed by renaming both to 103821–103828; proof re-run 129/129. The next clone must
  rename the analyzer's SEEDS const, not just the driver defaults.
- **F6 — Write flap 08:28–08:36Z (~8 min).** EPERM write denials; the flap-watch probe
  caught it (A/E/G/H/I FAIL) and the watchdog already reported the window. It killed
  one sed (analyzer seed fix — files verified intact, retried after two ALL-OKs) and
  the deathcleanup gate test (EPERM on write). No evidence lost; the panel corpora
  were written before the window.

## Tooling

- Driver/analyzer/proof tests cloned r236→r239 (seeds 103821–103828, EVIDIR 2026-11-18,
  corpus tags r239). Analyzer proof 129/129. The table-sitting proof test was written
  from the preserved r236 RED copy, verified red 22/40 on the pre-fix tree, green 40/40
  with the fix, and preserved red again after the fix was held (byte-identical file).
- The `tableSitting()` implementation (24 lines, src/js/table.js) was built, proof-tested,
  committed, and then **rebased out of the branch** when the panel returned INCOMPLETE
  — the branch that merges carries no `src/` change. The method's text is recoverable
  from commit `c6a62c604` on the dropped branch tip (not merged; the commit object
  remains in the repo until gc).
- No engine change landed this run. `tableActive()` is byte-identical.

## Reachable / fun / winnable (scale leg)

- **Reachable:** the national on-ramp is reachable — two villages walked it (both TRADE).
  The full seat is reachable — one village took it. The deed gate opens, sometimes late.
- **Fun:** the villages read like people (see the people check), the muster slew six
  titans in six calls, and a village fought wave-5 beasts fifteen times and killed one.
  The collapses are the usual shape — the wild and monsters grind small villages down
  before their links season — except 103822, which died in 47 days to hunger and sickness
  before the leg began.
- **Winnable:** closer than last run. A full seat was taken on this band, but only 1/8,
  and the wave-5 door was never faced. The chain now binds at the veterans bar on tribute
  delivery and at the deed gate's timing after national — not at reaching national.

## Closeout

- **Commits (branch `journey-scale`, after rebase onto `911c8db0c`):**
  `011a67450` prereg + driver/analyzer + proof tests (tooling only);
  `e11a202a6` analyzer + proof test seed band 103821–103828 (clone fix);
  run note (this file) + a correction commit for the final master tip and hashes.
  The fix commit `c6a62c604` was rebased out (see Tooling); the seed-fix commit
  was rebased twice (first onto `b30a6367b` as `fe1415ad2`, then onto `911c8db0c`
  as `e11a202a6`). Safe-commit index clobber struck on every commit
  (staged-as-deleted pattern); repaired each time via the `ls-tree -r` pipe,
  blobs verified against HEAD, tree clean after each repair. Rebase 2/2 clean
  (onto master) + 2/2 clean (drop fix commit) + 4/4 clean (onto final master, with
  one stop-at-pick quirk on the 2nd pick — recovered via the documented
  `git rebase --continue` after verifying the pick unapplied), no conflicts.
  Proof tests re-run green on the rebased tip (analyzer 129/129; table-sitting
  RED 22/40 from the preserved copy).
- **Merged locally, pending ship** — no bump, no push, no live verification (ship loop owns those).
- Rotation 3 → 0 (scale done; next run is landing). Lock deleted at closeout after run_id verification.
- Worktree released (`merged`), branch deleted; final reap sweep clean. Main tree verified clean after the merge.
- The r239 panel corpora (per-seed JSONs + convo transcripts + analyzer logs + gate logs)
  live under the goal hidden_files evidence dir for 2026-11-18; the repo evidence dir
  holds the prereg and this run note.
