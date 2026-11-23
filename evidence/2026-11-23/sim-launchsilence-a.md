# sim-launchsilence-a — THE LAUNCH FUNNEL'S SILENCE

**Arm:** sim-launchsilence-a (diagnostic — no game change, no new policy)
**Run:** fleshout-20261123T1115Z, Loop A, axis scale-onramp
**Band:** seeds 107517–107532 (16 seeds, 150d death-aware horizon, competent policy)
**Prereg:** `evidence/2026-11-23/sim-launchsilence-a-prereg.md` (frozen; corrections §§12–14 appended pre-confirm)
**Analysis:** `evidence/2026-11-23/launchsilence-a-analysis.json`
**Corpus:** `evidence/2026-11-23/perseed-launchsilence-a-ctl/` (16 seeds)
**Replays:** `evidence/2026-11-23/perseed-launchsilence-a-replay-on/` + `-replay-off/` (seeds 107517, 107524)
**Verdict: DIAG-GO** — all six frozen bars pass (see §7).

## 1. The question

On the homebody band 107455–107470, 11 of 16 villages launched NOTHING on
either leg (15–16 launches across the whole band). The village plans, or
doesn't; something in the funnel dies silently. This arm records the
launch funnel per village per day and names, for every village that never
launches, its FIRST-FAIL stage — defined from the code, not invented.

## 2. What the band did

| | count |
|---|---|
| Villages that launched a wave-4+ party | 10 / 16 |
| Villages that never launched | 6 / 16 |
| Wave-4+ launches total | 50 (48 directly recorded + 2 join-inferred, see §6) |
| Wave-4+ depart attempts that ended in a hold | 4 rows, all in villages that later launched |
| Wave-4+ depart attempts that ended 'normal' | 0 |

The funnel is much louder on this fresh band than on the homebody band
(50 launches vs 15–16; 6 silent villages vs 11). The silence that remains
is concentrated, not diffuse.

## 3. The funnel decomposition (first-fail stage, 6 non-launchers)

| First-fail stage | Villages | Seeds |
|---|---|---|
| `no-plan-created` — door open, no wave-4+ plan ever forms | 3 | 107517, 107527, 107530 |
| `plan-never-ignites` — plan exists, dawn scorer never picks the launch (all `offered-never-picked`) | 3 | 107526, 107528, 107529 |
| `no-target` | 0 | — |
| `no-companions-available` | 0 | — |
| `holder-blocked` | 0 | — |
| `other` | 0 | — |
| `unclassified` | 0 | — |

**6/6 non-launchers classified with a named stage; 0 unclassified.**
No village ended at funnel stage 1 (plan exists, never considered at dawn)
or stage 3 (depart attempted, never launched): every plan that formed was
considered at dawn, and every depart attempt that was made launched. The
funnel dies entirely upstream of the attempt — in two places:

### 3a. No plan ever forms (3 villages)

- **107517** — survived all 150 days, reached wave 5, standing 350, 117
  deaths. Villagers met wave-4 monsters and fled or evaded them (The
  Eulogy d63, The Audit d63, The Reunion d89, The Eulogy d117). Plans
  stayed wave-3 or targetless (callback, redactor, buffering, spool).
  Nobody ever slew a wave-4 monster (firstSlainDay: none). The plan store
  never takes a wave-4 target, even though the monsters walk past.
- **107527** — lost on day 70, maxWave 4, standing 170. A short life; the
  door opened and the village died before any wave-4+ plan formed. All
  plans wave-3 (buffering, ad_break, terms_of_service).
- **107530** — survived all 150 days, maxWave 4, standing 199, 67 deaths.
  The starkest silence: the village formed THREE plans in 150 days, all
  targetless, and met a monster only 4 times in the whole run (all
  wave-3, all fled or evaded). It never engages the wave-4 world at all.

### 3b. The plan forms, the party never musters, the launch is never offered (3 villages)

All three share one shape: the plan sits at stage `party` with party size
0 for its whole life, and the dawn scorer offers `party_wait` every day
while `party_launch` is never even among the candidates.

- **107526** — reunion plan, holder ivy_wang, d119–150 (32 days).
  Companion pool eligible = 0 on all 11 pool rows; zero free rangers at
  Haven on the sampled plan days (1–3 villagers at Haven at all). There
  is literally nobody to muster.
- **107528** — editor plan (wave 5), holder visjoin_85, 7 scored days.
  Lost d126, maxWave 5, standing 365.
- **107529** — see the sense-test (§4). Six different villagers hold
  wave-4+ plans across the run; none ever gets a companion.

The scorer cannot offer a launch without a companion, so it offers wait.
The wait is the scorer protecting a lone holder from a solo run at a
wave-4 monster. What never happens is the muster: nobody ever joins the
plan, so the wait never ends.

## 4. Sense-test: seed 107529, the strong village that never launches

107529 is the most surprising silence in the band: standing climbs 0 → 480
by day 123, wave 5 unlocks, the village survives all 150 days, and it
kills a wave-4 monster in the wild (ava_garcia kills a herald on day 108).
It launches 14 lower-wave parties (73 party fights) — the launch machinery
works fine. It just never fires for a wave-4+ plan.

What its days actually look like:

- The first wave-4+ plan appears only on day 112 (timeslot, wave 5,
  holder marcus_webb). Marcus is nearly dead when he gets it: health 5
  on day 112, 23 on day 113, 11 on day 114, 8 on day 115. He holds the
  plan while dying at Haven.
- The dawn scorer offers `party_wait` 16 times across days 113–151 and
  never offers `party_launch` — it is not even among the candidates.
  The plan's party stays empty; the holders change (marcus_webb,
  app_mgpspkyj820, boris_kowalski, quinn_murphy, ethan_hunt) and none
  ever gets a companion.
- Two villagers flee The Algorithm (days 125 and 141). The village meets
  wave-4 monsters, kills one, and still the plan never ignites.
- The funnel sits at stage 0 for the first 111 days (no wave-4+ plan),
  stage 1 on day 112, stage 2 on day 113 — and stays at 2 to the end.

**Judgment:** the silence is sensible in its own terms and senseless in
its duration. A dying holder, no companions, a scorer that refuses a solo
suicide run — that is the system working as designed. But 38 days of
waiting, six holders, nobody ever mustering, while the village stands at
480 and kills wave-4 monsters in the wild — that is not a decision, it is
an absence: the party never forms, so the launch is never a choice the
scorer gets to make. Villagers act like people here — a wounded person
does not walk alone at a monster — but the village never acts like a
village: nobody comes to stand with them.

## 5. Wall numbers

| | this band (16) | homebody band (16) |
|---|---|---|
| Wins | 0 | 0 |
| National standing | 0 | 0 |
| Table seat offered | 0 | 0 |
| Wave 5 unlocked | 9 / 16 | — |
| Wave 4 unlocked | 16 / 16 | — |
| Villages lost | 6 / 16 | — |
| Median survival | 150d | — |
| Total deaths | 1594 | — |
| Launches (wave-4+) | 50 | 15–16 |
| Villages launching nothing | 6 / 16 | 11 / 16 |

Standing: 4 of 16 villages end at exactly 199 (107525, 107526, 107530,
107532) — the known standing-199 stall band (the gate opens when a second
living wave-4 veteran appears); 9 of 16 end at 200+. The wall stands:
wins 0/16, national 0/16, table 0/16, same as the 0815Z round (0/48).

## 6. Instrument notes (what the numbers rest on)

- **Launch count 50 = 48 direct + 2 join-inferred.** 48 launches carry a
  wave-4+ target on the depart row itself. Two more are recovered by the
  analyzer's planCensus/score-row join: 107523 d111 (adaeze_nwosu — scored
  for a wave-3 plan, but the party ended the day hunting The Algorithm;
  on the strict reading this is a wave-3-scored launch, not a wave-4+
  launch) and 107524 d85 (gen_b8d2dvq — executed the launch leo_martin
  picked at dawn for his herald plan; leo's own execute returned normal
  because his commit had changed to party_wait by execution time). On
  the strict reading the total is 48. Neither changes any classification
  or the verdict.
- **Pilot v1 → v2 correction (prereg §14).** The first pilot run reported
  5/8 launching and 38 launches. Two of its `other` villages had in fact
  launched via the homebody handoff (range-0 holder, companion walks),
  but the brain wrap read the holder's plan AFTER the call, when the
  target had already been consumed — every brain-path row carried target
  null. The driver now reads the plan before the call; the analyzer
  counts distinct (vid, day) launches across both depart tables with a
  score-row / planCensus fallback join. The pilot was re-run (v2): 7/8
  launching, 42 launches, 1 non-launcher — identical game trajectories
  to v1 (same days, maxWave, standing, deaths per seed), only the
  recording fixed. The v1 corpus is archived under /tmp (not committed);
  the v1 numbers appear here only as the superseded run.
- **Bar-4 correction (prereg §12).** Launch counts are observable only
  through the recorder, so the frozen bar-4 wording ("recorder-off
  reproduces the launch counts") was unmeasurable as written. The
  corrected bar compares recorder-independent game outcomes
  (partyDepartures, days, maxWave, standing, deaths, killCalls, fights).
  Both replay seeds reproduce all of them exactly (see §7).
- **Stage-4 clarification (prereg §13).** The detail list governs over
  the definition sentence: offered-never-picked is stage 4; only
  offered-AND-picked with no depart call goes to `other`.
- **Band collision (prereg §11 + §14).** The assigned band 107501–107516
  was already used by journey-endgame-r270 (107501–107508). This arm
  moved to 107517–107532, verified fresh across all preregs and evidence.
  **Coordinator note: sibling arm sim-departsafe-a was assigned the same
  collided band 107501–107516 — if it stayed on that band, the two arms
  do not share a band and the shared-band comparison is void.**
- **Policy reading.** `scripts/policies/tableseat-nowait.js` with
  TABLESEATNOWAIT and LEANLINKRESCUE unset delegates to competent.daily
  byte-identically (both modules' det-gates pin off-daily as competent).
  Pinned behaviorally: seed 107517, 30d, tableseat-nowait layers-off vs
  planignite competent — identical days, gameDays, maxWave, standing,
  deaths, partyDepartures, partyFights. The silence measured here is the
  silence under competent verbatim; courtship-on would measure a
  different funnel.
- **Wave-4+ roster is 23 ids, not 18.** The frozen lists inherited from
  the homebody driver missed finale_crew, finale_opening, network_heart,
  network_limb, network_tower (wave-6 heralds). The driver and proof test
  carry the 23; the analyzer re-reads live from monsters.json.
- **funnelStage snapshot days skip.** 30d smoke runs show 28 rows for 30
  days (days 1 and 3 missing): the census fires only when the policy
  daily runs with a new scholar-day. Inherited harness behavior, not the
  instrument. The proof test asserts rows > 0, strictly increasing unique
  days, last row day ≥ days − 1.
- **lostDay fallback.** A village lost in the night phase after the last
  daily snapshot leaves lostDay null (pilot 107519/107522). The driver
  now falls back to the last simulated day (an upper bound, noted in
  code).

## 7. Verdict: DIAG-GO — frozen bars

| Bar (prereg §6, as corrected §§12–14) | Result |
|---|---|
| 1. ≥90% of non-launchers classified with a named stage | **PASS** — 6/6 = 100% |
| 2. 0 unclassified | **PASS** — 0 |
| 3. Determinism: replay reproduces classification + launch count | **PASS** — seeds 107517 + 107524 replayed recorder-on: identical first-fail + launches (0 and 16) and days (150/150); analyzer `--diff` 2/2 overlapping seeds match |
| 4. Recorder neutrality (corrected): recorder-off reproduces recorder-independent game outcomes | **PASS** — seeds 107517 + 107524 recorder-off: days, gameDays, maxWave, standing, deaths, killCalls, fights, partyDepartures, partyFights all identical |
| 5. Instrument validity | **PASS** — proof test 50/50, analyzer selftest 20/20, 0 instrument errors on all 16 seeds, 0 tick-gate mismatches, funnelAgreesAll true (derived stage agrees with recorded funnelStage on 16/16) |
| 6. Pilot gate on 8 seeds before confirm | **PASS** — pilot v2: 7/8 launching, 1/1 non-launcher classified, 0 unclassified, 0 errors, 0 mismatches |

## 8. What this means (plain words)

The launch funnel is not silent because launches fail. On this band, a
village that gets as far as trying to depart, departs — 48 directly
recorded launches, 4 holds that all resolved into launches, zero attempts
that died at the attempt. The funnel dies earlier, in two places, and both
are about the party, not the launch:

1. **No plan forms.** Three villages reach wave 4 (one reaches wave 5)
   and never take a wave-4 target, even while wave-4 monsters walk past
   and get fled from. Their plans stay wave-3 or targetless.
2. **The plan forms but the party never musters.** Three villages form a
   wave-4+ plan and the holder waits alone — the dawn scorer never offers
   the launch because there is nobody to launch with. The pool is empty
   (eligible 0 everywhere it was measured); nobody is free at Haven.

The next blank is the muster: why is nobody free at Haven to join a
wave-4+ plan — is the pool really empty (villagers dead, out, or
engaged), or does the muster never ask them? And the plan-formation
blank: what turns a wave-4 meeting (fled, evaded) into a wave-4 target,
when a kill (107529's herald, day 108) still doesn't produce a plan
until day 112? Both are upstream of the launch, and both are where the
silence lives now.

## 9. Metric review

- The taxonomy held: all 6 non-launchers took a named stage, 0 `other`,
  0 unclassified — but the band produced no `no-target`,
  `no-companions-available`, or `holder-blocked` cases at all, so those
  three stages are untested on live data (their selftest fixtures are
  synthetic only). A band where a village attempts and holds would be
  needed to exercise them.
- The `other` residual did real work in the pilot: it caught the two
  mis-recorded handoff launches instead of silently absorbing them, and
  the fix that followed (pre-call plan read + dual-table launch count)
  is now pinned by selftest fixtures 16–17 and proof-test band seeds
  900008–900009.
- The launch definition's edge (107523 d111: scored wave-3, hunted
  wave-4) shows the definition counts departures by the plan they were
  scored for, while the join counts them by the hunt they became. The
  2-launch gap (48 vs 50) is the size of that ambiguity on this band.
- Balanced panel (§15): N/A — single control leg, no comparison; the
  pre-registered threshold is the judge.
- Blanks filled: per-day funnel stages for all 16 villages; first-fail
  names for all 6 silent villages; the two pilot `other` cases resolved
  to launches with the mechanism named (homebody handoff). Blanks
  documented, not filled: why the companion pool reads eligible 0 on
  muster days (pool composition vs muster timing); what turns a wave-4
  meeting into a plan target.

## 10. Coordinator re-freeze addendum (run fleshout-20261123T1115Z)

The worker's branch was rebased onto master 7ade8d3bf (Loop B's 0230Z
adoption landed mid-run: gateavoid + launchfield-horizonfix evidence,
zero src/js changes). The rebase moved HEAD off the frozen base
fdd7042b8, so the proof's two anchor legs failed (48/50) by design —
the driver refuses to run unless HEAD is the frozen base ("rebase +
re-freeze first"). Re-freeze, per the driver's own prescription:
FROZEN_BASE updated to the rebased head
34dc4dbc9a013e6163c32c662195d33ebbff383f; the 16-seed control sweep and
both 2-seed replays were re-recorded on the new head; the analyzer was
re-run. The re-recorded corpus reproduces the original EXACTLY: every
judged analysis field identical (seeds 16, launches 50, launching 10,
non-launching 6, classified 6, unclassified 0, stageCounts
no-plan-created 3 / plan-never-ignites 3, wall wins 0 / national 0 /
table 0 / wave5 9 / wave4 16 / median 150 / lost 6 / deaths 1594);
per-seed files differ only in the two anchor lines. The regenerated
analysis.json is byte-identical to the worker's committed version
(the analyzer's absolute `dir` path was normalized back to the
relative form the worker used). Proof re-run green 50/50 on the
rebased tree. No verdict changes; the DIAG-GO stands on the
re-recorded corpus.

## 11. Adoption re-freeze #3 (run fleshout-20261123T1315Z)

Master moved twice during the adoption (journey-crisis r274
ae4d4c277, then Loop B's killarrive-b a6cb127cc). The arm was rebased
onto ae4d4c277 and re-frozen: FROZEN_BASE
b602eb83be07da1575fe2c73d8c9fc799d43ca1c, 16-seed control corpus + both
2-seed replays re-recorded on the new head. r274's src/js/comms.js
(+18) did not perturb any trajectory on this band: the regenerated
analysis.json is byte-identical to the worker's committed version
(seeds 16, launches 50, launching 10, non-launching 6, classified 6,
unclassified 0, stageCounts no-plan-created 3 / plan-never-ignites 3,
wall wins 0 / national 0 / table 0 / wave5 9 / wave4 16 / median 150 /
lost 6 / deaths 1594); analyzer --diff matches 2/2 overlapping replay
seeds; analyzer selftest 20/20; proof re-run green 50/50 on the
rebased tree. No verdict changes; the DIAG-GO stands on the
re-recorded corpus. The re-freeze onto a6cb127cc follows as #4 (zero
src/js diff, re-anchor + re-record per the same prescription).
