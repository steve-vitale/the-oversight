# Food-economy round 1445 — coordinator evidence (run fleshout-20261104T1445Z)

Axis: food-economy (second non-converged axis). Scale-onramp was live-claimed
by sibling Loop B (claim fleshout-loop-b-20261104T1434Z, arms
sim-tendfloor-guard-b + sim-tendseason-b, heartbeats 14:37Z/14:41Z at run
start) and was NOT touched. Loop B landed tendseason onto master mid-run
(71041af7d); both arms below were rebased onto it clean (zero file overlap)
before merging. Loop B's tendfloor-guard arm was still live at closeout
(heartbeat 16:18Z, claim still present) — NOT touched.

Pre-registration: each arm's binding prereg was committed before any judged
sim (bankfood 65f1256b8, exphurt 89194631, both rebased with all commits
replayed exactly once). No gate, price, deed bar, or win price changed in
either arm. No push, no version bump, no live verification (ship loop owns
deploys). Merged locally, pending ship.

## Arm 1 — sim-bankfood-a: NO-GO (the vanish does not reproduce)

Question: findings backlog #1610 (2026-10-31, strandfix2-b): evening banks of
540–810 kcal of known-edible food read pack 0 the next morning; morning
pack-eat never fired. Verdict: NO-GO on positive retention evidence, not an
empty sample. No fix landed (nothing to fix — engine behavior is correct);
zero game-code change (one new policy file, driver, analyzer, probes, proof).

- Pilot (8 seeds, 30d, competent nighttravel stack): 0 creek-bucket evenings
  on all 16 leg-seeds, 0 bank events. Det-gate: bankfood OFF legs reproduce
  independent strandfix-control legs exactly, 16/16.
- Re-derived bank set (prereg addendum, before the wider sweep): the old
  travel-refused creek population is empty on current master; stranding now
  presents as nighttravel `out-of-reach` (haven not offered) at away creek
  tiles. Only 2/16 wider seeds strand: 15003 (8 away evenings), 15376 (4).
- Wider sweep (16 seeds × guard + ON × off + variant, 64 files): 9 bank events
  per leg; 8 banked with a following morning, 8/8 RETAINED at the true
  post-sleep morning (first-upkeep snapshot) and at daily-entry morning.
  0 vanishes, 0 vanished-with-scholar-zero, 0 morning pack-eat firings.
  Guard and ON censuses identical; variant vs off survival identical on
  every seed (median death-day delta 0).
- The single known-edible bank (15003 loop-day 30, 195 kcal Blackberry) fell
  on the final census day and has no following morning — censored, not
  judged. In-stack edible-bank retention therefore remains OPEN; direct
  probes show known food and engine-made lumps surviving sleep + upkeep in
  isolation.
- Why the old finding fails, measured: (a) the 2026-10-31 corpus action
  records show its banks yielded ONLY unknown units (14/16/18/5) — the old
  "known-edible bank" premise is contradicted by its own corpus; morning
  pack-eat gates on edible-now food and can never fire on lumps. (b) The
  only overnight pack removal found is the documented per-form spoil clock:
  15376's berries lump (12 units, spoilDay 10) swept at dawn day 10 while
  shoots/roots/nuts persisted; fresh banks (spoilDay = forage day + 2)
  survive the next dawn by the rule's own arithmetic. (c) Flips move the
  clock only +18–19 ticks and never reach 449 — the flip half is inert on
  this population.
- Proof: scripts/test-bankfood-b.js pure 22/22 green; corpus mode 184/184
  green on the wider guard corpora. Re-run green by the coordinator on
  merged master (22/22).
- Wall: this 30-day diag corpus does not read national/table/wins (stated
  plainly in the arm evidence). Observed only: median survival 30 days
  (census boundary; village-lost at 24/28/30 on 15215/15091/15003),
  maxWaveUnlocked 2 on 3 seeds, 3 on 13 seeds.
- Commits (rebased): c006e577c prereg, 018df3191 instruments,
  de7c5773d driver-upkeep fix, c51e0fc9d addendum + lump-flag fix,
  e7c3acc36 evidence + corpora (85 files).
- Caveats carried, not hidden: partial overnight lump reductions (33→21 via
  the spoil clock, traced to the berries form; 7→6 between true morning and
  daily entry, upkeep verb untraced); scholar kcal rises between first-upkeep
  and daily-entry morning on stranded mornings (e.g. 73→2380), mechanism
  unknown — flagged as open observations. The old flip line's bank-promise
  clause stays unusable — not because the night takes banked food, but
  because stranded banks are inedible lumps; any fed-morning design must
  source food in the morning itself or at haven departure.

## Arm 2 — sim-exphurt-a: INSUFFICIENT-DATA for SPEC-READY

Question: findings backlog #1699 (EXPHURT DISCONNECT) + food-economy next
blank #2 from run 1220Z. The landed hurthome turn-home rule was NOT
re-litigated or modified. Verdict: INSUFFICIENT-DATA for SPEC-READY — the
binding pilot gate required ≥8 expedition hurt cases; the pilot produced 6
(0.75/seed — the bar was calibrated on hurthome-a's 1.75 dawn-episodes/seed
across all purposes, a different unit). The pre-declared confirm
(99909–99916) was deliberately NOT run: it fires only if returned-hurt
expedition cases < 5; they number exactly 5. No post-hoc expansion (§14).
The spec below is a draft awaiting a confirming re-run at adequate N (next
run should budget 16 seeds up front). No hook landed.

- Pilot: competent, 100d death-aware cap, PLENTYDEPRI=1, DEPOSITGATE=1,
  seeds 99901–99908, 0 instrument errors, 0 unclassified, 25 cases.
- D (disconnect prevalence, at open): 1/6 = 0.167 (Gilberto s99901: exped 4
  vs away 9, gap 5). Descriptive D at last hurt: 2/6 — the cap lands
  mid-episode (Abderrazak s99904: open 20 vs 20, last-hurt 12 vs 20 = legs+1).
- M1 (primary, the blank): 0/5 = 0.000 — no expedition homecoming line
  mentions hurt. The blank is confirmed.
- M2: 5/5 = 1.000 — every announced hurt expedition return is covered by
  the landed hurthome line, firing immediately before the homecoming line
  in the same tick. M3: 5/5 announced — but only because all 5 expedition
  hurt returns happened while the player was at Haven.
- Latency: all 5 returned-hurt expedition cases closed 1 part after the hurt
  event — the landed fix works; the away clock no longer delays hurt returns.
- Sense test (all 5 quoted in arm evidence): each pair is a true hurt line
  ("returns from the wilds hurt… trip cut short") followed instantly by a
  haul/stories/scar celebration that erases it. The homecoming line is the
  return's lasting meaning and never carries the hurt.
- Draft spec (in arm evidence, not GO): write site src/js/villager-agency.js,
  expeditionReturn(vid, playerAtHaven), the playerAtHaven line block.
  Predicate: hp at return in 1..7 (same gate as shouldHurtReturn/
  awayHungerVoice — no new threshold; do NOT use encounters-hurt, which
  would fire for healed cases). Change: append a hurt clause to the same
  homecoming line when the predicate holds; healthy returns byte-identical.
  Must NOT overwrite: the landed hurthome line in game.js npcNodeTravel,
  haul/trust/deeds/pantry, the RNG stream (pick(dirs) still drawn exactly
  once, unconditionally), or the playerAtHaven gate. Deliberately NOT
  specced: writing expedHurt's cap back into v.away.duration — post-fix
  evidence says the clock half of #1699 is behaviorally moot (latency 1
  part regardless of either clock; observed gaps 5 and 8 changed no
  outcome). Whether #1699 closes on the narration hook alone is a
  coordinator backlog call. LAND guardrails carried unchanged for the
  confirming arm (M1 ≥ 0.8 among announced, median daysAlive delta ≥ −5d
  matched seeds vs this pilot's baseline median 83, errors 0, diff
  confined to the line block).
- Wall (diag corpus only, not a scale panel): survived 3/8, median
  daysAlive 83, wave 4 on 6/8, wave 5 on 0/8, national/table/wins 0/8,
  97 deaths total.
- Commits (rebased): 53e965c30 prereg, 6a8dd1414 instrument + proof 21/21,
  1e7bc2970 evidence + pilot corpus. Proof re-run green by the coordinator
  on merged master (21/21); hurthome-b-lib proof still 20/20, lib unchanged.
- Arm evidence: evidence/2026-11-04/sim-exphurt-a.md;
  bankfood evidence: evidence/2026-11-04/sim-bankfood-a.md.

## Village assessment (plain words)

The village does not lose banked food overnight — it loses the morning after
for a different reason: what a stranded scholar banks is food the village
doesn't yet know is edible, so the morning meal rule can't touch it, and the
only thing that takes lumps overnight is the ordinary spoilage clock doing
its documented job. Separately, a hurt villager who makes it home now gets
home fast (one beat after being hurt) and gets a proper hurt line — and then
the homecoming celebration talks over it as if the trip were a triumph. The
hurt isn't lost in the clock anymore; it's lost in the last line spoken.
Both blanks narrow to narration and knowledge, not to missing food or a
broken clock.

## Metric review

- Bankfood: metric held. The pilot's 0-bank result was a population fact
  (old creek-bucket population empty), correctly handled by a pre-registered
  addendum re-deriving the bank set before the wider sweep — not by
  re-scoring. The censored single edible bank is the metric's honest limit:
  future edible-retention arms need a longer horizon or an earlier strand.
- Exphurt: metric mis-calibrated, recorded for the NEXT run: the ≥8 pilot
  gate was calibrated on a different unit (dawn episodes across all
  purposes, 1.75/seed) than the judged unit (expedition hurt cases,
  0.75/seed). Next run budgets 16 seeds up front and pre-registers which
  disconnect snapshot it judges (at-open vs at-last-hurt — they differ,
  1/6 vs 2/6). No re-scoring was done in this run.

## Infrastructure

- Registration congestion ~2 min/tree (improved on prior runs' 5–9 min).
- Sequential-merge lesson: the second --ff-only merge failed because the
  first merge had moved master; recovered by rebasing bankfood onto the new
  tip (5 commits, exactly once) and merging — no force, no conflict. The
  release script had already marked bankfood done-merged before the actual
  merge; the merge then completed, so the registry state is now true, but
  the ordering (release after verified merge, not before) is noted for the
  next run.
- Safe-commit index clobber hit worker commits; repaired via HEAD-blob
  cacheinfo each time, commits verified correct. Bankfood's final commit
  also hit a stale index.lock from a killed repair loop; repaired with a
  scoped bulk update-index feed of exactly the 85 HEAD files after
  removing the stale lock once no git process remained; verified status
  empty and diff empty, evidence byte-identical to HEAD.
- Sibling Loop B landed tendseason mid-run and was still live on
  tendfloor-guard at closeout; neither its trees, branches, claims, nor
  its landing were touched. Other loops' trees changed concurrently
  (abilityuse, journey-establishment, journey2-endgame-r128 appeared;
  succession trees released by their owners) — none touched.
- Main tree clean at closeout (verified after both merges + branch
  deletion + reap). No push, no bump.

## Next blanks, in order

1. EXPHURT confirming arm: 16-seed fresh band, event-based instrument,
   pre-registered snapshot (at-open vs at-last-hurt) + M1 bar; land the
   drafted hurt-clause hook only if it passes the carried guardrails.
2. In-stack edible-bank retention: longer horizon or earlier strand, so a
   known-edible bank gets a following morning in-stack (bankfood's single
   censored case is the seed, not the verdict).
3. (v**) deploy fraction — still only via the fracchoice holder, never
   duplicated (sim-fracchoice-b still live at closeout).
4. Stranded-scholar narration/mechanics: out-of-reach strands (15003: 9
   nights; 15376: 4 nights) and the homebound-scholar/starving-village
   shape (15003/15091/15215) are new backlog items, not this run's arms.
5. Per-form lump spoil sweep narration: the dawn sweep removes one form
   silently (berries 12 @ spoilDay 10, 15376) — the morning record shows
   fewer units without naming the form.

food-economy stays converging (NOT converged): a 2026-10-31 food-vanish
claim is now rejected on retention evidence and the EXPHURT blank is
confirmed with a drafted carrier, but no food-economy game change landed
in this run and the (v**) deploy fraction stays undecided.
scale-onramp untouched (sibling Loop B).
Claim deleted; lock deleted at closeout.
