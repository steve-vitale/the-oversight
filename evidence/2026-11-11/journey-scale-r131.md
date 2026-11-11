# journey-scale r131 — RUN NOTE (lane A, leg 3 SCALE, readiness phantom-veteran fix)

**Run id:** `playtest-loop-a-20261111-1143Z`. **Rotation read 3 → leg 3 SCALE.**
**Base:** local master `b09cf584e` (r130 deepening).
**Worktree:** `journey-scale` (registered 12:40Z, heartbeat kept; see lock note below).
**LOUD — origin/master diverged:** `git pull --ff-only` fails; known standing
condition, ship loop owns. Worked on LOCAL master only.

## The fix (one task, one commit)

**Defect (vetfirst-b named next, evidence/2026-11-11/sim-vetfirst-b.md §9):**
on seed 190305, `waveCombatReadiness(4).veterans` = 1 while
`_ladderLivingVeterans(4)` = 0 — the readiness gate read a dead veteran
as living. Mechanism (read in code): `ladder.js countLivingVeterans`
requires roster membership, but `standing.js waveCombatReadiness.isLiving`
had NO roster check (`vp && !vp.dead` only). The TB combat death path
(`game.js tbVillagerFalls`) removes the villager from the roster but never
sets `rec.dead = true` (unlike `removeVillager('killed'/'ambushed')`,
"DEAD IS DEAD 2026-10-08"), so a TB-fallen veteran keeps a live-reading
vp record and is counted by readiness forever.

**Fix:** `src/js/standing.js` — one line in `waveCombatReadiness.isLiving`:
`if (roster.indexOf(vid) < 0) return false;` (roster already in scope),
mirroring `countLivingVeterans`. No demand, number, or bar changes; the
scholar still counts. The wider `tbVillagerFalls` vp.dead lie is NOT fixed
here (carried — it touches every vp.dead reader and needs a panel).

**Proof:** `scripts/test-journey-scale-r131-phantom-veteran-20261111.js`
— RED on unfixed code (17 passed, 6 failed: the phantom reads 1 vs 0,
2 vs 1 with a second living veteran, and 1 vs 0 on the wave-5 bar),
GREEN after the fix (**23 passed, 0 failed**). The removeVillager control
reads 0/0 on unfixed code (divergence is TB-path-specific); the scholar
kill still counts (Steve RULED 2026-11-10).

## Q1 PHANTOM REPRO + FIX: GO

Fixture RED→GREEN as preregistered; all six sections green on the fixed
engine; control 0/0 on unfixed code.

## Q2 PANEL VETBAR: GO

Analyzer `scripts/analyze-journey-scale-r131-20261111.js` (exit 0):
zero disagreements on the fixed engine on all 4 seeds (disagree4=0,
disagree5=0; 406 vetbar rows). The shadow old-rule counts found the
phantom live on one seed:

- **131104: 20 phantom days (d121–d140, both waves).** On d120 the village
  held 4 living veterans, 3 of them wave-4 killers (Zoe Adams, Chen Wei,
  gen_i0zo50m). On d121 gen_i0zo50m died in the wild and the military
  tribute was DELIVERED — Zoe and Chen left Haven in the table's service
  (roster 10→7). Fixed counts fell honestly to r4=1, r5=0, blooded=FALSE.
  The OLD rule would have kept counting the delivered two: shadow4=3,
  shadow5=2 for 20 days — so the old engine would have kept the village
  BLOODED (wave-5 fights hit 1.5× harder, taken at 0.75×) through the
  d127 editor and the d138–d140 finale_opening wave-5 fights, after the
  village had paid its only wave-4 veterans away. The fixed engine fought
  those 19 wave-5 fights honestly unblooded. This is the bigger finding
  the prereg named: a phantom day WITH gate reads.
- 131101/131102/131103: 0 phantom days. (131101 peaked at 4 wave-3
  veterans d35–47, then died off one by one as the village collapsed;
  131102 held 2 living wave-4 veterans for 36 blooded days; 131103 peaked
  at 5 wave-3 veterans and died at d60.)
- **Design note for Steve (not a defect):** paying the tribute now
  honestly strips blooded the same day — the village earns the lesser
  seat by giving away the people who made it blooded, right before the
  wave-5 finale. That is what the stated rules say (the ladder: "a log
  entry whose `by` is not on the village roster never counts"), but the
  price lands exactly where it hurts most. Worth his eye; no change made.

## Q3 TRAJECTORY SHAPE: GO (guardrail holds)

- Lived-days total 409 vs r130 band 473 (−13.5%, inside ±25%).
- Alive/dead 2 alive / 2 dead — same pattern as r130, no flip.
- Lesser seat priced 4/4 (d36/d39/d46/d32).
- A liveness alignment moved no trajectory beyond seed noise.

## Q4 PEOPLE CHECK: 4/4 transcripts sensible, senseless 0 — but both carried defects FIRED

Read in full: 131102 d90 (Kosgei — "Did you leave someone behind? …
Me too." — shared grief, "Not yet" plants a next talk), 131102 d120
(Robin — "what's the funniest thing you've seen since we got here?" …
"There's a laugh I keep hearing in my head … the old world left the
door open a crack." — a person grieving through laughter), 131104 d90
(Susan, the surviving wave-3 veteran — "I've been writing letters I'll
never send." — a secret, "Don't tell the others." plants an owed
confidence), 131104 d120 (Salvatore — "Have you ever asked? About the
taken — about Patrick?" … player promises "I'll ask it." — the ending
OWES a promise). All four have an NPC want, options that engage it, and
endings that resolve/plant/owe. Senseless 0.

**Carried defects, both fired again this band (documented, not fixed —
out of this run's scope; the fix belongs to a run that can scope the
raise-answer template):**
- **Trap-line invitation swallowed (Tarek, 131102):** Tarek speaks only
  Indonesian, no shared words — he mimes "come with me" toward the trap
  line ("The meaning is unmistakable: come with me."). The player is
  given NO option to answer; the next line is "You step into the Haven
  hall." and the invitation evaporates. Same class as Stella/Nathan
  (r125). Location for the fix: the invitation is voiced but no choice
  or follow-through is ever offered.
- **Raise-answer template answers a forage invite with a link proposal
  (Claudete, 131102 d120, outcome counter):** THEM: "Never mind the food
  I needed — we got it handled. … Forage with me tomorrow? I know the
  creek bend, past the treeline." YOU: "All right. Let's ask them."
  THEM: "All right — let's ask them. You carry the proposal to The
  Bloodied II." The player's line and the resolution are the link-raise
  lines, answering a forage invitation. Pinned location:
  `src/js/bond-initiation.js:747` — the raise-answer `finish()` always
  emits the link-carry line regardless of what the NPC counter-offered;
  the forage invitation lines live in `src/js/convo-wants.js:426-428`.
- Baraka: 0 mentions in all captures/raise-talks (did not fire).

## Q5 CENSUS (plain words)

- **131101 — died d68, 4 left at the end (of a 12-start roster, 10
  deaths).** Reached regional, ladder stage 3, lesser seat priced d36.
  Four wave-3 veterans stood d35–47, then died off one by one — the wild
  took 5, the arena 2. Never a wave-4 kill; the village ended with its
  pantry at 0. A village that learned to fight and still bled out.
- **131102 — lived to the d141 cap, 6 alive.** The strongest fighter
  village: 56 fights, 32 wave-4 fights, 2 living wave-4 veterans for 36
  blooded days. Military tribute ready d111 but NEVER delivered — 16
  attempts, all refused "veterans-short". Resolved, not a defect: the
  tribute needs 2 PAYABLE (non-scholar) veterans; this village's wave-4
  killers were successive scholars (Catalina Reyes, gen_i86x7yf) plus one
  villager (app_mgpspjab110) who died — the ladder said "ready" (scholar
  counts toward the bar) while the delivery honestly refused (delivery
  pays non-scholars only). Same scholar/payable split r130 measured.
  Lesser seat d39, full seat never, national never.
- **131103 — died d60, 0 left.** Seven deaths on the last day (d60) —
  the wild took 11 of 12. Reached regional and stage 3 (d32) and priced
  the lesser seat (d46) in 60 days, then Gavel and the wild ended it in
  one day. Five wave-3 veterans at peak, never a wave-4 kill.
- **131104 — lived to the d140 cap, 8 alive.** The only village to
  DELIVER the military tribute (d121) and the only one to fight wave 5
  (19 wave-5 fights, d127–d140). Four wave-4 kills (2 scholar, 2
  villager); at d120 three living wave-4 veterans; after the delivery,
  one living veteran left (Susan, wave-3). Lesser seat d32, full seat
  never, national never. The village that paid its veterans away and
  fought the finale without them.

**Leg verdict:** reachable yes (scale content on 4/4: regional links,
ladder stage 3, lesser seat priced 4/4, tribute delivered 1/4, wave 5
fought 1/4); fun yes (the four transcripts are the best of the recent
bands — grief, laughter, secrets, and an owed promise); winnable
unchanged (0/4 full seat, national never live — the living-veteran pair
is still the wall, same as r127/r130, and this band shows the wall from
the other side: 131104 HAD the pair and paid it away for the lesser
seat).

## Telemetry

`telemetry-check.js` vs `scale.json`: 2 LOUD lines — fightsTotal −71%
(446→131), fightsByWave.4 −83% (289→50). **EXPLAINED, baseline NOT
rolled:** (a) the stale 646-day baseline regime (same as r130); (b) two
early village deaths (d68/d60) cut the band's exposure; (c) 131104
graduated to wave 5 — its 19 wave-5 fights are the missing wave-4
fights. Per-day check: 131102 fought wave-4 at 0.23/day, exactly
r130's rate; the band total is a denominator story, not a fight-rate
story. The scale.json re-label is still owed.

## Gate

`node scripts/check.js --quick`: first run killed by a runtime restart at
~159/300 scripts (6 F's visible in the dot-line, no summary — the log
`journey-scale-r131-check-quick.log` was overwritten by the re-run).
Re-run started 13:37Z after a fresh worktree heartbeat. Progress 82/300
scripts, 0 F's at 13:42Z. [If this run timed out first: the gate re-run
was still in flight; the adopting run owns finishing the gate attribution
before merging. The fix + proof + panel are complete and durable in the
worktree (uncommitted); the worktree is DIRTY so the reaper will not
remove it — it flags dirty trees LOUD and leaves them alone.]

**Restart note (13:36Z):** the runtime restarted mid-gate. No work was
lost — the worktree, lock, registration, and all evidence survived intact
(verified: standing.js modified, 12 status entries, 158 files in the
r131 evidence dir). The heartbeat had gone 30 min stale during the
restart window (13:05Z → 13:36Z); re-heartbeated 13:37:24Z immediately
on recovery. The gate re-run is the only lost work (it is idempotent —
it re-runs the test list and rewrites the same log).

## Metric review

- Q2 as written held cleanly (zero disagreements, and the shadow counts
  delivered the before/after evidence without a second panel run — keep
  the shadow-recorder pattern for future liveness fixes).
- Q3's "±25% of the r130 band's 473" worked (409, −13.5%). Keep, but
  name the control band explicitly (done here).
- The vetbar recorder fires its daily hook twice on one day per seed
  (66 rows for days 2–68 on 131101; duplicate d35) — the same double-fire
  the r130 driver shows; harmless for per-row comparisons, but the row
  count is not a day count. Note for the next driver clone.
- Q4's "senseless 0" held on the day-transcripts, but the carried
  defects fired in the captures/raise-talks — the Q4 protocol should name
  the raise-talks explicitly next run (they are where the template
  defects live).

## Carried (not this run's to build)

Monster-veteran +3 damage gap (`game.js:35087` canon comment vs
`game.js:35215, 35271` — HP×1.5 + spd+1 only; needs a Steve call /
sized prereg); `tbVillagerFalls` vp.dead lie (wider fix, needs a panel
across all vp.dead readers); trap-line invitation swallowed + raise-answer
template answering non-link counters with link lines
(`bond-initiation.js:747`, `convo-wants.js:426-428` — pinned this run);
Baraka unvoiced raise (0 mentions this band); guest-death (Bing) prereg;
survival-collapse cause (combat side); scholar-payment open item
(steve-call); scale.json baseline regime re-label; origin/master
divergence (ship loop owns); unfixed-engine control panel (not run — the
daily shadow counts are the before/after evidence instead).

## Adoption closeout (main session, run timed out at the gate)

- Proof re-run independently pre-rebase and post-rebase: **23 passed, 0 failed**
  both times (`scripts/test-journey-scale-r131-phantom-veteran-20261111.js`).
- Telemetry re-run independently: same 2 LOUD lines (fightsTotal −71%,
  fightsByWave.4 −83%); explanation verified from the panel files —
  131102 fought wave-4 at 32/141d = 0.23/day (r130's rate exactly),
  131104's 19 fights moved to wave 5, two early deaths cut the band's
  exposure (lived days 409). Baseline NOT rolled (re-label still owed).
- Gate (fresh full `node scripts/check.js --quick`, log
  `journey-scale-r131-check-quick-adoption.log`): **291 passed, 9 failed
  in 1191s. Verdict GO.** The 9 = the standing 6 (measurement-proof
  staleness pair, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes) + 3 load artifacts
  (trust-observer-neutrality 120.0s, capable-bot 120.1s — both green
  standalone: 6/6 and 42/42; measurement-cache-flags — proven
  environmental, not the fix: its 30s spawn timeout is exceeded by a
  7-seed 1-day panel under current load, 50.5s wall / 5.1s user on this
  tip and 30.6s wall / 5.0s user on the bare base ae53134ae — identical
  user CPU, wall time is load. The staleness pair is the expected
  src-touch consequence; the proof refresh is owed as a follow-up, not
  a merge blocker.)
- Rebased onto explicit master ae53134ae (kinfirst-b landed while this
  run was in flight); proof re-run green after the rebase; no conflicts.
- /tmp filled 100% (512M tmpfs) during the cache-flags base diagnostic
  (a full repo extraction) — cleaned by hand; the repo extraction alone
  is ~512M, so /tmp cannot hold a second copy of the tree. Noted for
  the next diagnostic that needs a base copy: extract under
  ~/workspace/scratch-* and delete immediately after.
- Carried: measurement-proof refresh (b5); the tribute-strips-blooded
  design note stays flagged [needs-eyes] (commit carries the tag).
