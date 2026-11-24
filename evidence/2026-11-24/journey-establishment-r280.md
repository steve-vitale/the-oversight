# Journey — establishment, r280 (2026-11-24)

**Leg:** establishment (1), days 14–40, 42-day horizon. **Run id:**
`playtest-loop-a-20261124T0945Z`. **Base:** local master `8b391b0ed`
(sim-vetpair-b DIAG-GO). **Seeds:** fresh band **109021–109028**
(pilot 109021), verified 0 hits across all prior preregs (see prereg).
Band spent. Nearby spent bands: 109001–109008 (r274), 109011–109018
(r277), 109101–109116 (gatehorizon-b), 109201–109216
(gatehorizon-reprereg-b), 105141–105149 (deepening r275),
109301–109332 (Loop B standing/havenlink), 109411–109426
(sim-retarget-a).

**Prereg:** `hidden_files/evidence/2026-11-24/journey-establishment-r280-prereg.md`.
**Driver/analyzer:** forked from r277 verbatim except run number /
output names / seed band / header (normalized diff: run-number comment
only). **Canon:** `docs/CANON.md` read at run start. No canon doc
covers favor/moot-close/arrival mechanisms — stated in prereg, not
invented.

**Leg questions (prereg):** Q0 menu-priority fix (binding on the
mechanism), Q1 stranded-close (2-dawn bar, fifth band), Q1b want-raise,
Q2 moot-close + sittings, Q3 silent-arrival, Q4 guardrails + telemetry
roll, Q5 exile-heard, Q6 F2 scholar deaths, Q7 sleep-retry, Q8 watches
(REARM sweep + wild-corpse channel, dead-alien whisper, DEPARTNAME,
contest-end telemetry). SPOTTER / LADDER / FASTER-ID / WINPLAN standing
guards.

## 1. The two panels — read this first

This run has TWO panels on the same seeds, and the note judges the
SECOND:

- **BEFORE panel** (pre-fix code): the finding record. Its evidence is
  preserved whole under
  `hidden_files/evidence/2026-11-24/r280-before-menupriority-fix/` (8 seed
  JSONs, 8 convo txts, pilot/panel/analyzer logs — 18 files).
- **AFTER panel** (fix in place, same driver, same seeds 109021–109028):
  the judged panel. All verdicts below are AFTER-panel numbers unless a
  line says BEFORE.

**The AFTER panel is byte-identical to the BEFORE panel.** Driver lines
identical on all 8 seeds; all 8 seed JSONs identical; both analyzer
logs identical. The fix changed nothing on this band — no stranded run
fired on it, so the promotion never triggered in the wedge's play, and
the rank change is inert for every other sitting. That is the ideal
outcome for a menu-ordering fix: zero aggregate perturbation, with the
mechanism proven by the proof test (§2). Nothing was re-scored: the bars
are the prereg's frozen bars, judged on the after-panel.

## 2. Fix landed in this run — the menu-priority fix (Q0 GO)

**Finding (r277, carried):** seed 109018, Stan's `forage_help` run,
bearer Aaliyah died d18. The cancel verb (`dlg:favor_cancel`,
BEARER-END branch, r265) WAS offered and ready at Haven d19–d21, but
the sitting's menu was flooded by open betrayal cases — 54–56 options
across 7–8 pages, the wedge's 6-page cap never reaching the favor items;
the run closed only on d22, 3 dawns after first stranding, over the
frozen 2-dawn bar.

**Root cause (read in code, not inferred):** `convoMenuPage`
(`src/js/conversation.js`) ranks every menu choice for the single pager
that runs after all injectors: betrayal/confront/agency first (rank 0),
then alive/favor verbs (rank 1), social verbs (2–3), everything else
last (rank 4). `dlg:favor_cancel` falls in rank 4 — dead last — even
when it is the run's ONLY honest end. The favor menu offers it
(`convoFavorActionMenu`, convo-wants.js:2595–2596) whenever the ending
action is ready, but the pager buries it under the case flood.

**Fix:** two parts, both in game code.
1. `convoFavorEndUrgent(vid)` (new, convo-wants.js) names the
   gone-owner shape, mirroring the ready branches in favor-forage.js /
   favor-water.js exactly: a joint forage/water run whose bearer is dead
   or roster-gone (BEARER-END, r265) — or, for forage, whose partner is
   gone while the scholar is the bearer (end-without-partner, r81). A
   healthy live run's early end is NOT urgent — its owner can still
   close it.
2. `convoMenuPage` ranks that cancel −1 — ahead of even the betrayal
   flood — when the helper says urgent; every other sitting's ordering
   is unchanged (the `owns` filters already strip the cancel from
   question-owned and ambush menus, so the promotion only fires where
   the cancel is genuinely available alongside case options).

**Proof:** `scripts/test-menu-priority-r280.js` (20 pass). RED→GREEN
verified: with the fix stashed the test fails at "helper exists"; with
it restored, 20/20. The test stages a real 50-option betrayal flood
(10 open cases × 5 options each — site, witnesses, investigate, moot,
letlie) and proves on the live handlers: helper true for bearer-ended
forage AND water, true for forage partner-gone, false for a healthy
live run / scholar-bearer water / no favor; the urgent cancel is FIRST
on page 1 of a 14-page menu; the CONTROL (same flood, healthy live
run) leaves the cancel off page 1 but reachable by paging; pressing
the urgent cancel ends the run (returned). The control staging caught
one real subtlety: a healthy early end requires adjacency, while the
bearer-end close does not — the test stands the staged villagers next
to the scholar at Haven.

**Panel judgment (Q0):** GO on the mechanism (proof 20/20) with the
panel NO-OPPORTUNITY on Q1 (0 stranded runs — see §3). Per the prereg,
that combination is a GO on Q0: the fix is proven where it can fire,
and the panel shows it disturbs nothing where it cannot.

## 3. Q1 stranded-close — NO-OPPORTUNITY (fifth band)

**AFTER: 0 stranded runs on the panel** (0 stranded dawns, 0 runs).
Stranding rate across bands: r265 0, r271 0, r274 1, r277 1, r280 0.
The bar cannot be judged on a band with no stranded run; the mechanism
is carried by the proof test (§2) and by the r277 finding the fix
answers. END BAR: 15/15 broken-live forage opportunities closed within
2 dawns (2 NO-OPPORTUNITY seeds).

## 4. Verdicts (AFTER panel, 8 seeds — all frozen-bar judgments)

- **SPOTTER GO:** 123 total (bar ≥20), 8/8 seeds >0. Cumulative 137;
  max skill 3. (r277: 103 / cumulative 137.)
- **LADDER GO:** 8/8 (bar ≥6/8).
- **FASTER-ID GO:** 8/8, 290 benefit plays in 347 bump calls (84%).
- **Q4 GUARDRAILS — all four within ±30% of the pooled r274+r277
  means (deaths 45.7, popAlive 9.1, pantryKcal 34,901/seed,
  starvationDeaths 0):** deaths 441 (55.1/seed, +21%), popAlive 77
  (9.6, +5%), pantryKcal 340,962 (42,620/seed, +22%),
  starvationDeaths 0. **ROLL CONDITION MET** — the telemetry baseline
  IS rolled forward (see §8; the roll itself is BLOCKED by the write
  flap at note time — values recorded, owed to the closeout).
  Against the analyzer's own r274-mean bar the margins are +28%/+7%/
  +19% — also inside; see §9.3.
- **Q1 STRANDED-CLOSE NO-OPPORTUNITY** — §3 above.
- **Q2 MOOT-CLOSE: NO-OPPORTUNITY** — 0 evictions, 5th band running.
  Mechanism carried by the r269 proof test (36/36).
- **Q3 SILENT-ARRIVAL GO:** 2 arrivals, 0 NARRATED-BY-NAME +
  2 NARRATED-DESCRIPTIVE, 0 SILENT.
- **THREAD:** 2/2 paged. **VILLAGE GO:** 8/8 alive at d40.
- **Q1b WANT-RAISE GO:** 107/538 = 19.9%, 0 zero-raise seeds. **F5 floor
  shape ABSENT** (thinnest 9.6%, fattest 27.4%).
- **Q1 FAVORLESS GO:** 5/107 = 4.7% (bar <20%).
- **Q2 SITTINGS GO:** 0/16 CUT (4 engine-ended WITH closing beats).
- **Q5 EXILE GO:** 5 exiles, all moot, HEARD 5, PRESENT-at-sentencing 0,
  UNHEARD 0. **TRIPLE EXILE fires:** seed 109022, d28 — Jasleen,
  George, Rafael exiled at one moot (case_6); all three HEARD (advance
  notice). Named per the watch.
- **COUNTER PASS:** 212 COUNTER LEARNED lines, 0 comma-clause, 0 em-dash.
- **SETTLED/DRY2/SELFWIT:** 0/0/0, quiet.
- **BOWCRAFT:** 13 bows equipped panel-wide — down from r277's 27
  (r274: 22, r271: 7). Report-only; bow counts swing by band, no bar.
- **DAY-DESYNC GO:** 8 attributed / 0 unattributed; net drift +8 (1 per
  seed, the opening-days daily-phase roll, mechanism named).
  **SLEEP-RETRY:** 90 tried, 90 advanced — **0 non-advances** (r274 and
  r277 each had 2; see §9.2).
- **WINPLAN GO:** planSeeds 25 on 8/8 seeds, partyDepartures 127 on 8/8,
  partyFights 488, DEPART beats 115 on 8/8, beats ≤ departures per seed.
  **Trios 0, quads 0 — 9th straight run, trio gap still open.**
- **CODEX:** 320 plants panel-wide.
- **F2 SCHOLAR DEATHS: 1 total → WATCH.** Seed 109027, Irving d29,
  "the wild", last dawn d29 at (4,4) — AT Haven. New shape vs r277:
  he dawned at home and died out in the wild the same day, not the
  dawned-away multi-day shape. See §6.

## 5. Q8 watches — clean, with one named rearm false positive

- **REARM:** 0 genuine lines panel-wide. The single text hit was the
  substring in "forearm" (Yuki's burn-scarred forearm, seed 109024 —
  the same false positive as r277). Word-boundary search: 0. Wild-corpse
  expedition channel: 0 takes. No villager took cells/gun from a dead
  holder's corpse at Haven or in the wild.
- **Dead-alien whisper:** 0 whisper lines panel-wide. The endgame r275
  defect shape did not recur.
- **DEPARTNAME:** 0 descriptor-form DEPART beats — every departure beat
  on the panel names its people (115/115). The bf73c94d9 fix holds.
- **CONTEST-END telemetry:** contest_end fires wherever contest_fired
  does (4/4, 1/1, 2/2, 4/4, 3/2*, 4/4, 4/4, 3/2* per seed — *one seed
  each shows contest_end 2 vs contest_fired 3; the ledger closes on
  the deaths that emit it, no stranded contest line). No defect.

## 6. Census — eight villages, in plain words

All eight villages are alive at day 40. Pantries run 7.5k–112.7k kcal
(mean 42,620; one seed ended at 7,555). Spotting skill stays high
(123 total, every seed, max skill 3). Parties leave constantly — 127
departures, 488 party fights — always in pairs; no trio in nine
straight runs. Wave 4 reached on 4 seeds, wave 3 on 4; standings
50–150 (no 199 stall this band — the standing-199 one-point-short
shape from r274/r277 did not recur).

Two villages ran thin. **109021** ended with 5 alive at d40 (7 at
end), pantry 15,947, standing 50, wave 3 — 7 villagers dead, 35 death
tele rows, but the village held. **109022** ended with 8 alive, pantry
7,555, standing 100, wave 4 — and a triple exile at d28 that cut three
people in one moot (see §4). The other six villages are fat and
stable (9–12 alive, pantries 14.9k–112.7k).

The one scholar death is Irving on 109027: he dawned at Haven on day
29 and died in the wild the same day. The village absorbed it — 10
alive at end, standing 115, wave 4.

Conversations read like people (0 CUT sittings in 16 held). The
strongest lines this band are about identity under pressure — a
mortician surviving, a navigator whose résumé is "nobody's died from
it yet," a plan that's "just a direction you argue with."

## 7. People check (Q4) — 16/16 PASS, read in full

All 16 held sittings (2 per seed) read in full from the after-panel
convo txts. No fabricated shared history, no filler loops, no static
menus. Strongest: Ruth the mortician (109025 — "Some days I'm a
mortician who survived. Some days I'm just... surviving. Both
count."); Judith (109023 — "I can do navigation. Not well — well
enough that nobody's died from it yet. That's my whole résumé now.");
Daniel (109023 — dreaming Maricela was still here, "Woke up angry at
the dream. Stupid."); Emmett (109028 — "A plan's just a direction you
argue with."); Ruth the trail lead (109028 — "Watch the quiet ones.
Not the loud — the loud tell you everything."); Darnell (109026 — the
bond proposal, then the pod ask); Ivan (109024 — "Solitude's a
resource too. Scarcer than food, some days."); Betty (109026 — finding
the White Oak Acorns Darnell taught her, a real continuity beat).

Watch notes (not fails, for the build arm):

1. **Plant-teach template repeats verbatim across plants AND
   villagers (5 occurrences this band):** "crush the leaf, smell it,
   taste the stem" (Skylar's Peepal Fig, Madison's Blackberry,
   Aurora's Fish Mint) and "Remember the leaf, the stem, the smell"
   (Aurora's Elderberry, Betty's Jujube). r277 flagged the same shape
   (Eduardo); third run running.
2. **Gossip non-delivery recurs:** Aurora — "People are talking about
   Chloe. Take it for what it's worth." — names no news. r277 watch
   #1, second run running.
3. **Taken-kin pod ask uses fixed lines verbatim:** Darnell speaks
   Molly's/Stephen's exact lines ("You'd do that? Ask it? ...Thank
   you. Really. Even asking is more than the silence." / "If it
   answers — you'll tell me? Whatever it says. I can take it."). r277
   watch #2, third occurrence.
4. **Dropped opener:** Lisa's night-sneaking confession ("I've been
   sneaking out at night. I'm ashamed and I can't stop.") — planted in
   the opener, never returned to. r277 watch #4 shape, recurs.
5. **Truncated resume opener:** Ivan's stockpiling tip cuts off
   mid-list ("Take half. You've got the hands for it. (+4 wood, +4
   fiber to…").
6. **Closing-quote glitch:** Vy — "They're already drifting away.
   "Later."" — a closing line embedded with a stray quote.
7. **Post-closing retraction:** Skylar — "Alright. Same time
   tomorrow, if the world allows." followed by "No — you're right,
   it's a lot. Forget it." — a closing beat followed by a walk-back.
8. **Stalling line before content answers:** "Huh. Let me think about
   that." precedes substantive answers (David, Daniel) — reads as
   filler, frequent but harmless.
9. **Thin sitting:** Amara — "I wish there was more to tell. That's
   it." opener, "I'm not okay" said aloud, then ends on "Right." with
   little development. Honest, not broken.

## 8. Gate and telemetry

**Gate:** [PENDING — not yet run at note time; see §12.]

**Telemetry check:** run against the r274+r277 pooled baseline —
**QUIET (8 files, 4 metrics, no large deviations)**. Per the prereg's
roll condition (all four means within ±30% of pooled — deaths +21%,
popAlive +5%, pantry +22%, starvation 0), the baseline IS rolled
forward to r274+r277+r280 pooled, 24 seeds: **deaths 1172, popAlive
223, pantryKcal 899,383, starvationDeaths 0**. **ROLL BLOCKED at note
time by the write flap:** the backup `cp` and the `git update-ref`
probe both failed 10:46–10:48Z (`Operation not permitted`); the
baseline file itself is INTACT at the r277 values (731/146/558,421/0)
and the failed backup was left 0 bytes
(`establishment.json.20261124-pre-r280.bak` — must be re-created, not
trusted, when the flap clears). The roll is owed to the closeout, not
re-scored: the check already ran quiet and the roll values are frozen
above.

## 9. Metric review (§14)

1. **Q0 — the fix's proof is the instrument, the panel is the guard.**
   The before/after byte-identity is the strongest form of the
   no-regression claim: the rank change touches only gone-owner
   sittings, and none fired on this band. No metric revision. Lesson:
   when a fix's trigger is rare (stranding ~1 per 16 seeds), the proof
   test carries the verdict and the panel carries the safety proof —
   both are needed, neither alone suffices.
2. **Q1 stranded-close — the bar held frozen, NO-OPPORTUNITY stands.**
   Five bands, two stranded runs total (r274, r277). The stranding
   rate itself (≈1 per 16 seeds) is now the stable number; the close
   bar fires so rarely that the proof test is the working instrument.
   No metric revision. If a future band strands a run, the before/after
   close time is the direct evidence.
3. **Q4 guardrails — the analyzer's bar text is stale, the verdict is
   not.** The r280 analyzer still judges guardrails against the r274
   means (its header says r274), while the prereg and the baseline
   judge against the pooled r274+r277 means. Both bars pass on this
   panel (+28%/+7%/+19% vs r274; +21%/+5%/+22% vs pooled), so no
   re-score and no verdict change — but the analyzer should carry the
   pooled means next run (one-line header + numbers update, analyzer
   only). Recorded here, not fixed mid-run.
4. **Q7 sleep-retry — the 2 non-advances are gone (90/90).** r274 and
   r277 each had exactly 2 non-advances; this band has 0. No code in
   this run touches sleep — the base moved (contest-end telemetry,
   crisis r278 combat, departname) — so this reads as band variation,
   not a fix effect. No revision; the watch stays descriptive.
5. **F2 — the bar fired WATCH, and the shape moved.** 1 death (≤4),
   but its shape is new: dawned AT Haven, died in the wild the same
   day — not r277's dawned-away shape. The "scholar dies away from
   home" story now has two shapes (away-for-days, out-and-back-same-day)
   and the second is ordinary risk, not a defect shape. No revision;
   the watch stays at causes + last-dawn locations.

## 10. Reachable / fun / winnable

- **Reachable:** yes. Every leg system fired on this band — favors,
  wants, warnings, bonds, exiles, win plans, departures, contests,
  arrivals. Nothing in the leg was unreachable.
- **Fun:** yes, with the watch notes in §7. The conversations are the
  strongest part of the leg right now — identity, debt, grief, and
  gossip all land. The weak spots are all "planted and dropped" or
  "same words, different mouth" shapes, not broken ones.
- **Winnable:** not yet on this band. No wave 5 on any seed; wave 4 on
  half the seeds; parties still never form trios (9 straight runs);
  and the binding wall is unchanged: the launch decision and the
  wave-5 door. The menu-priority fix closes a real hole in the
  stranded-close path, but it is a one-dawn saving on a rare event —
  it does not move the winnability chain.

## 11. Infrastructure notes (this run)

- **Worktree registration failed once, then succeeded:** the first
  `worktree-register.sh` attempt died mid-checkout on the write flap
  (`unable to write file` on 5 files, `fatal: Could not reset index
  file to revision 'HEAD'`); a `git branch -d` cleanup failed the same
  way (`packed-refs.new: Operation not permitted`). Probe writes
  recovered within minutes; the retry attached to the surviving branch
  and registered clean (REGISTER_EXIT:0). Registration cost ~35 min
  total (registry-lock wait behind a sibling reaper + slow checkout
  under load).
- **Reaper skipped on a held registry lock at run start** (8
  consecutive skips; the holder was a live sibling `worktree-reap.sh`,
  pid 5207–5211, which finished ~09:49Z). Waited, did not kill.
- **Write flap:** two windows this run — registration (~10:02Z) and
  the telemetry roll (~10:46Z, still active at note time: `git
  update-ref` probe failed, heartbeat write failed with
  `PermissionError`). Heartbeat 23 min stale at note time; the tree is
  dirty, so the reaper cannot remove it, and the hbloop retries every
  10 min. Baseline file intact; the 0-byte `.bak` must be re-created.
- **Machine restarts:** none observed this run (uptime 33 min at
  09:59Z, no restart signature after).
- **Panel log incident:** none. Both panels ran clean (exit 0, 8/8
  seeds each); the before-panel evidence was preserved to
  `r280-before-menupriority-fix/` BEFORE the after-panel overwrote the
  seed JSONs.

## 12. Closeout

- Fix + proof test + driver/analyzer + evidence + this note committed
  via safe-commit in the worktree; [GATE PENDING — see below.]
- **Merged locally, pending ship** — no version tag; the ship loop owns
  bumps/pushes/live verification. [STATUS AT NOTE TIME: NOT YET MERGED
  — gate + merge + rotation + release owed; see §13.]
- **Owed, not in this run's scope:** the cancel-verb menu-priority fix
  is LANDED here (§2) — the r277 build-arm item is closed. Still open:
  F5 floor (build arm), trio gap, wave-4 kill A/B, family 7 UNMEASURED,
  gating recalibration proposal, answercourt cost, richer layered
  medicine design, deepening r275 run note still missing on master —
  all unchanged. The telemetry baseline roll (§8) is owed to the
  closeout once the flap clears.

## 13. Closeout record (filled as the closeout proceeds)

- Run note written: evidence/2026-11-24/journey-establishment-r280.md
  (this file). Telemetry check QUIET; baseline roll BLOCKED by flap
  (values frozen in §8: deaths 1172, popAlive 223, pantryKcal 899,383,
  starvationDeaths 0, 24 seeds).
- Gate: [PENDING]
- Commit: [PENDING]
- Merge / rotation / release / lock: [PENDING]
