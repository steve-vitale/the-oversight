# journey-scale r96 — Lane A, leg 3 SCALE (2026-11-04 late morning)

**Run id:** laneA-scale-2026-11-04T07:45CST (scheduled 07:45 CST 2026-11-04).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@62a67de7d at branch creation.
**Pre-register:** evidence/2026-11-04/journey-scale-r96-prereg.md
(committed as ce50fca6 before any scored seed ran).
**Change set at closeout:** ZERO src/js, zero src/data. Tooling (r96
driver/analyzer clones + the posTrace policy-clone instrument,
labels/seeds/EVIDIR only, diffs verified) + evidence + run note only.
Gating freeze honored; perception law honored (all instruments
read-only; pickers press offered menu items only; the tend-arm
presses the offered Haven-panel tendLink verb only).
**Fix-gate verdict: no code change.** Q1 traced the mechanism but the
trace alone does not meet clause (a) (policy instrument + shipped
study mechanic both already proven working); Q2 found no staging at
all (nothing to fix); Q3 found no senseless defect (one craft note).
Clause (a) fails for every candidate, so nothing was touched in src/.

## Infrastructure notes (loud, first)
- No lock contention at start: no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- Pre-flight clean: main-tree `git status` empty, disk 28%,
  `git pull` already up to date, worktree-reap ran (10/16 active —
  dirty/held sibling trees correctly untouched; one locked sibling
  tree's removal failed aloud in reap, not mine to force).
- Registration was slow, not stuck (~3 min under sibling load).
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r90/r94/r95: after the correct private-index commit
  (ce50fca6, 4 files), the worktree's main index lied (4 files
  staged-as-deleted + untracked). Repaired via HEAD-blob cacheinfo,
  verified: `git status` clean, `git diff HEAD` empty, hash-object
  matches HEAD for all 4 files. The commit itself was correct.
- **Service restart mid-run:** the runtime restarted while
  check.js --quick was running (first attempt's output lost — it had
  not been redirected). Recovery verified, not assumed: worktree
  intact, commit ce50fca6 present, evidence dir complete (78 files),
  analyzer fix still uncommitted, lock still mine. Heartbeat loop
  and check process were both killed by the restart; the heartbeat
  loop was restarted and verified by registry read-back (14:20:42Z),
  and check.js was re-run with output redirected to
  journey-scale-r96-checkquick.log. Lesson carried from r95, sharpened:
  a heartbeat loop is not a heartbeat — verify by read-back — and a
  long suite run without a log file is not evidence.
- **Closeout incident — failed merge + premature release, recovered
  without loss (read this before trusting any "merged" stamp from
  this run's middle):** after the first rebase (onto 82feb7fa4) the
  `git merge --ff-only journey-scale` FAILED — master had moved again
  mid-closeout to 732abd418 (a sibling coordinator landing) — but the
  closeout script then ran `worktree-release.sh journey-scale merged`
  UNCONDITIONALLY and `git worktree remove --force`, deleting the
  worktree before the merge was verified. No work was lost: `git
  branch -d` correctly refused (branch not fully merged), and the
  branch tip 88e851fab with both r96 commits was verified intact
  (`git merge-base --is-ancestor` = NO). Recovery: re-registered the
  worktree on the existing branch (the register script attaches to
  it), appended this section, re-based onto the then-current master,
  re-ran proof checks + analyzer, and merged ONLY under a guarded
  command that releases/removes/deletes solely if the merge itself
  succeeds and ancestry verifies. Lesson, stated as a rule for the
  next closeout: NEVER run release/remove/delete after a merge
  except inside the same guarded command that just proved the merge
  — a failed ff-only merge must stop the closeout cold.
- **Analyzer first-pass bug, found and fixed before scoring:** the
  r96 analyzer's trip grouping split one trip at every eval row
  (85503 first read as 25 trips) and its postrace regex dropped
  `undefined`-target drop rows. Fixed (group by consecutive same-vid
  runs; regex accepts undefined) and re-run; all counts below are
  from the fixed analyzer and cross-checked against the raw postrace
  rows and the hungerwatch pilg/studies counters, which agree.

## Q1 — PILGRIMAGE POSITION TRACE (binding; closes r95's micro-question in part)

Policy order verified in code: scalecourt daily = competent.daily
FIRST, then courtship — so the study check reads the position
competent.daily's routine left the player in, not where yesterday's
courtship walk left them. The trace (postrace rows, courtship-day
eval / walk / study / drop) covers every trip on the band:

Band totals: 12 trips started, 10 studied, 1 dropped (stale),
1 started on the final day and unrun. Per seed: 85501: 1 studied +
1 unrun (village_3, started d38, the scatter day); 85502: 2 studied;
85503: 5 studied + 1 stale drop; 85504: 2 studied. Every completed
trip finished in 2 courtship days: day 1 eval out of range → walk
ends at the target (dist2 0) → day 2 eval AT the target → study.
The walk works. The study fires whenever the position holds.

The one dropped trip is the whole story — 85503, village_spl_28_58496
(target (8,5), the map's edge column):
- d36–d49: FOURTEEN consecutive courtship days, every eval at (4,4)
  (Haven) dist 5, every walk ending at (8,5) dist2 0, every next-day
  eval back at (4,4) dist 5. Fourteen walks to the fire, fourteen
  mornings back home. Day 51: stale drop (day − start 15 > 14).
- The policy immediately restarted against the same village (d54
  start; d55 eval (4,4) dist 5, walk to (8,5); d56 eval AT (8,5)
  dist 0 → study). Same village, same target, same walk — this time
  the position held and the study fired.
- All interior targets on the band held first try: (5,2), (4,1),
  (7,5), (1,3) — walk day 1, study day 2, no reset. Only the edge
  target (8,5) reset, and only on the first attempt.

Prereg bar, stated plainly: the FINDING clause's count threshold
(≥3 dropped trips) is NOT met — the band dropped exactly 1 trip, so
by the letter the question is INCONCLUSIVE on count. What the trace
does establish, without re-scoring anything: the stale-restart loop
r95 named is not "the walk fails" and not "the study never fires" —
it is a position that does not survive to the next courtship, on an
edge tile, intermittently (14 resets, then a hold on the retry of
the identical trip). The remaining micro-question, narrowed, not
guessed: what moves the player home between the courtship walk and
the next morning's competent.daily on edge tiles, and why it stopped
on the d55→56 night. The next instrument for it is a morning trace
(pos at start of competent.daily vs end of it vs courtship eval) —
named here, not built here, because this run's trace already spent
its question and a morning trace is a new instrument, not a fix.

## Q2 — NATIONAL AFTER DISSOLUTION (binding; new diagnostic)

Answer: there is no after-dissolution timeline on this band, because
nothing staged. ScaleRank transitions: 85503 and 85504 village →
regional at d47; 85501/85502 never left village. courtNational
answers: 0 on all four seeds. No governance-layer line, no national
beat staging, no pendingNational answer on any capture. The
stage/answer/dissolve/re-stage question therefore has no instance
this run — r95's staged-and-lost instance is NOT reproduced, and
this run does not extend it.
- The analyzer's first-pass "NAT" lines on 85503 are TRADE-charter
  crises (Stonebridge tariff concessions, each naming "(Trust -10.)"
  and conceding down 750 → 563 → 500 kcal/week) — not national
  beats. They are reported here so they are not misread as national
  stagings; the −10 naming on them matches r94/r95's wording fix in
  spirit (the price is said aloud), but they are a different beat
  class and no claim is made about them beyond that.
- Why nothing staged (census, final state): 85504 came closest — one
  seasoned lead link (village_0, Haven primary, trust 46, 91 days)
  and two age-served covenant peers whose trusts sat BELOW the bar
  at end (village_1 38, village_2 36 — a d116 leader-death crisis
  −10 on both, landing on the village's death day before any
  concede +8 could answer). No single shape reaches 3 seasoned:
  covenant 2 short on trust, lead 1 of 3. 85503: one seasoned lead
  (village_0 62/69d); covenant peers 16/25/26 at end, 14–24 short.
  85501/85502 died at d38/d29 with a single unseasoned lead link
  each. The band's national story is "one seasoned link and
  trust-short peers", not "a realm that fell apart" — r95's shape
  did not recur.

## Q3 — PEOPLE CHECK (sense law — 2 sittings read in full)

Corpus: d90 on 85503 and 85504 only. 85501 died d38 and 85502 died
d29, so neither contributes a d90 sitting; no d120 sitting exists
(85503 died d94, 85504 died d116) — no day substitution, per prereg.
2 of 2 fully real. No fabricated shared history, no filler loops, no
static menus.
- **85503 d90 Victor (mason, steady, trust 90, ask_favor stage 2,
  grief thread):** opens in grief ("I keep expecting to see them by
  the fire. Then I remember."), betrayal:accept leads to a real
  teaching beat (reading a slope for water, grandmother's way —
  knowledge freely given, Codex-noted), comfort lands ("You're kind.
  Don't let this place change that."), gossip names a real event
  (Francois won Siege on the cameras). The tail thins when pressed
  for more ("I left. Walked back in like I'd never left" / "Julio
  headed out for water") — filler-adjacent, not senseless — and the
  close is true ("Talking helps. A little. Thank you."). Real.
- **85504 d90 Owen (hunting guide, withdrawn, trust 23, curious
  stage 1):** a real want, plainly stated ("what's the funniest
  thing you've seen since we got here? I desperately need it."),
  a real laugh, and a withdrawn-true close ("This was — fine. It
  was fine."). Craft note, same class as r95's: Owen's laugh line
  ("Laughter's a mutiny. A good one.") is verbatim Ting's line from
  r95 — one authored line voiced by two villagers. Each sitting
  still plays as its own person; the reuse is named so it doesn't
  pass unnoticed, not counted as a defect.
- **Gossip:** 1 pick across the 2 sittings (Victor's Siege line);
  Owen's sitting offered none (unforced band; the picker left after
  three exchanges — the instrument's choice, not a defect).

## Q4 — CENSUS CONTINUITY (report-only)

| seed | end | day | pop | pantry | rank | seat | arc | tends | seasoned peers (final) | scatter-day gap |
|---|---|---|---|---|---|---|---|---|---|---|
| 85501 | SCATTERED (hunger, 3rd day) | 38 | 3/3* | 0 | village | none | 3 | 0 | 0 (lead 38/13d) | no peer within 30d of seasoning |
| 85502 | over (pantry 0, pop 6/6) | 29 | 6/6 | 0 | village | none | 3 | 0 | 0 (lead 20/4d) | no peer within 30d of seasoning |
| 85503 | DIED OUT (last bearer / scatter tail) | 94 | 0/0 | 0 | regional | lesser waiting | 4 | 3 | 1 (lead 62/69d; covenant 16/25/26) | died 6d before earliest peer seasoning date (village_2 d70+30=d100), trust-blocked regardless |
| 85504 | DIED OUT | 116 | 0/0 | 4262 | regional | lesser waiting | 4 | 2 | 1 (lead 46/91d; covenant 38/36 at end) | covenant peers age-served, trust-shorted 2/4 at end |

\* 85501's census pop is the pre-scatter roster; the scatter
narration fired ("On the third hungry day, people started
walking"), same shape as r95's scattered seeds. 85502's end is the
same hunger shape one week earlier (pantry 0 at d29, pop still 6/6
at the over flag — the run stopped at the over flag, not at a
narrated scatter line in the tail checked).
- **Other census notes:** 85503/85504 both end lesser-seat waiting
  (arc 4) — the waiting seat outlives the village again, third run
  in a row with that shape. 85501's death log is heavy early combat
  (player "the wild" d12, "the night" d37 — two scholar deaths with
  mantle passes — plus starvation d33/d37) under a pantry crash
  d30→d33 (9,717 → 0). 85504's final-days trustset shows the crisis
  cycle still running at the death-day (leader-death crises d93,
  d105, d110, d111, d116; each conceded cycle nets −2; the d116
  −10 landed unanswered as the village died).

## Village assessment (plain words)

Four villages, and this band dies younger than r95's. Two never get
out of the first month: pantries crash to zero, people scatter or
the flag falls while six people are still standing. The two that
live past day 90 both reach the region, both court their neighbours
properly — pilgrimages walked and studied, covenants sworn, tributes
paid and sometimes waved home — and both die with a lesser seat
still waiting for them, the way waiting seats keep outliving
villages. Neither reaches a nation: each holds one seasoned bond
and a set of neighbours whose trust sits just short of the line,
and on the longer-lived village the last crisis charge lands on the
very day the village dies, before anyone can answer it. The
pilgrims, though, walk better than the old story said: ten study
trips complete, most in two days, and the one trip that loops does
so in a way we can finally see — fourteen walks to a fire on the
map's edge, fourteen mornings waking back home, until one morning
the traveller is still standing there and the study fires.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — PARTLY, down from r95.** Regional on 2/4 seeds
  (r95: 4/4); national staged 0/4 (r95: 1/4, staged-and-lost). The
  covenant road still opens in play (85504 swears two covenants and
  holds them 70+ days), but this band's villages die before the
  third seasoned peer can arrive — the leg's content is reachable,
  the season to hold it is not, on these seeds.
- **FUN — YES, with the same two honest caveats.** Conversations
  are genuinely good (Victor's grief and teaching, Owen's need for
  a laugh); the pilgrimage loop is now visible rather than
  mysterious; the crisis prices are said aloud. The dull spot is
  the early-death band itself: two villages end before the leg's
  window (day 80) even opens, so a player on those seeds would
  never meet the scale content at all.
- **WINNABLE — NOT YET.** No national, no global, no full seat on
  any seed; the lesser seat waits on 2/4 while the villages die.
  Behind this wall still sits the wave-4 kill wall from the
  November 3 picture; this run faced no wave-5 content and claims
  no kill.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale.json --current
'evidence/2026-11-04/journey-scale-r96/journey-scale-r96-trust-*.json'
--metrics nationalLive,scaleRank` → "quiet (4 files, 2 metrics, no
large deviations)". Same caveat as r93–r95: that baseline is an old
aggregate shape, so "quiet" means "no large deviation on these two
metrics", not a clean bill — and national staged 0/4 here vs 1/4
in r95 is a shape change the two end-state metrics do not capture
(nationalLive at end is false on all four seeds in both runs).
Baseline NOT rolled forward.

## Tests
- `node --check` clean on the r96 driver, policy clone, and analyzer
  (analyzer re-checked after the grouping/regex fix).
- Analyzer on the quad EVIDIR: all four seed lines as reported above
  (no zero-lines — the quad ran in full).
- check.js --quick (on the branch code, `--cacheDirectory=
  /tmp/jest-cache-playtest`): **284 passed, 6 failed in 632s**.
  The 6 are the SAME pre-existing failures r90/r95 named (same files,
  same count): godpath/test-measurement-proof-update,
  godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence,
  godpath/test-occupation-panels,
  godpath/test-phone-frame-proof, and
  test-establishment-r20-fixes-20261020.js. This run changed zero
  src/js, so these cannot be regressions of this run; the tooling-only
  change set (driver/analyzer clones + policy-clone instrument +
  evidence) is covered by the same guard. Full log:
  evidence/2026-11-04/journey-scale-r96-checkquick.log.

## Metric review
- Q1's FINDING clause (≥80% out-of-range evals + walks ending in
  range) fired exactly as written on the single dropped trip
  (15/15 evals dist 5, 14/14 walks ending dist2 0) — but the clause's
  count gate (≥3 dropped trips) did NOT fire (1 dropped trip), so
  the formal verdict is INCONCLUSIVE on count with the mechanism
  demonstrated on the traced instance. No threshold was re-scored:
  both halves are reported as written.
- Q2's deliverable is the timeline, not a threshold: no stages, no
  answers, no dissolutions, no re-stages on this band. The
  stage/answer/dissolve/re-stage question stays open for a band
  that stages.
- Q3's corpus rule held: d120 exists for no seed; no day
  substitution was made. Corpus is 2 sittings, not 8 — the people
  verdict is correspondingly narrower than r95's and is labeled so.
- Q4 adopts the r93–r95 metric unchanged (seasoned-peer count AND
  scatter-day gap); it separates this band's four failures cleanly
  (early hunger ×2, trust-blocked ×2, one of them on the death day).
- Carried, still open: the crisis-cycle / distress-economy design
  question (Steve's call, freeze stands) — now with a death-day
  −10 instance instead of a staged-and-lost one; the pilgrimage
  morning-mover micro-question (edge tile, intermittent — needs a
  morning trace); the wave-4-kill wall behind the scale wall
  (unchanged, not re-proven here).

## Blanks: filled or documented
- DOCUMENTED, mechanism traced (policy instrument, not game code):
  the pilgrimage stale-restart loop — walk works, study fires when
  the position holds, the failure is the position resetting to Haven
  on edge-tile mornings, intermittently (14 resets then a hold on
  the identical trip).
- DOCUMENTED (no instance this run): national staging — 0/4, with
  the trust-short shape named per seed (covenant 2–4 short on the
  closest seed, on its death day).
- DOCUMENTED (craft note, not a defect): the "laughter's a mutiny"
  line voiced by two different villagers (Ting r95, Owen r96).
- VERIFIED (not changed): crisis −10 naming continues to appear on
  trade-charter crisis lines as well as covenant lines.
