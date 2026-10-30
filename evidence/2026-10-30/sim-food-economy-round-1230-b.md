# Loop B run fleshout-loop-b-20261030T1230Z — axis food-economy (coordinator evidence)

Run: 2026-10-30 ~12:30–13:30Z. Loop A live on scale-onramp at run start
(1215Z claim: sim-dissolvecause-a + sim-fledcover-a, NOT touched; loop A
landed mid-run as 56007c185, NOT touched). This run worked food-economy
(converging), taking the 1130Z run's next food-economy blanks in order:
(3) sweep/panel vest counter itemId fix, (4) stashed-hatchet equip
question, plus the sickness tick step-up attribution (#1516). The two
Steve-call items (competent courtship drive, earnable vests) were NOT
taken — they need Steve's ruling first.

All four worker branches merged locally, pending ship. No push, no bump,
no live verification (ship loop owns those).

## Arm 1 — sim-vestcounter-b: GO (instrument fix, landed c138488b2)

Fixes backlog item SWEEP/PANEL VEST COUNTER BLIND SPOT (vests-b 1130Z):
`stdSnapshot` in scripts/sweep-compare.js read entry `.id` only, scholar
only, while holdings are itemId-form. Fix reads `itemId || id` and adds an
optional `vestsVillager` field (distinct holder/vest pairs held by live
roster villagers; deduped pack-vs-equipped; scholar record, dead holders,
stashed/pool/armory excluded).

Pre-registered bar: panel vest read matches census ground truth on
≥15/16 cases including every scholar-wearing seed. Result: 16/16.
Scholar-wearing cases (9912, 9916, both columns): before 0,0,0,0 →
after 1,1,1,1 = census. Other 12 cases 0 = census. Both rebuilt panels
valid (sourcesStable, neutrality match, 0 warnings, 0 cached jobs);
days/wave/rank/national reproduce census rows exactly on all 16.
`vestsVillager`: 1 on 9912/9915/9916 both columns, 0 elsewhere; it is a
run-max simultaneous count, not ever-held (leanlink 9912: 2 ever, max 1).

Proofs post-rebase + on merged master: test-vestcounter-b.js 22/22,
test-vests-b.js 25/25 (its F3 previously asserted the blind spot itself;
the intermediate run failed exactly there with snap.vests=1, proving the
fix; assertion now asserts fixed behavior, nothing loosened).
check.js --quick: 284 passed / 6 failed, all 6 reproduce with the fix
reverted (byte-identical restore verified) — pre-existing on this base
(measurement-proof staleness ×2, mobile-combat cadence, occupation
panels CLI, phone-frame proof hashes, racks voice gate). Zero src/js,
zero policy defaults.

## Arm 2 — sim-hatchequip-b: DIAG-GO (landed bec2c000b)

Answers STASHED HATCHET NEVER EQUIPPED (axeacq-b 1130Z): the stashed
hatchet never loses an equip choice — the choice is never offered to
the vessel. `Game.villagerGearUp`'s own-stash weapon block runs only
when the target is unarmed AND `acquire=true`, behind
`if (wb > 0 || !acquire) return;`. The only `acquire=true` call sites
in src/js are two NPC departure sites (villager-agency.js
startExpedition, game.js resolvePatrol); every other gearUp call passes
`acquire=false`. The vessel's equip path in sims (competent.js gearUp)
scans only scholar.equipped + scholar.inventory — "stashed" never
appears in it, and the policy never calls `Game.villagerGearUp`. Loot
lands directly in scholar.inventory, which is why a looted hatchet IS
equipped the next morning while a stashed one never is.

Corpus 16 seeds 16101–16116, 60d, axeacq substrate: spawn-hatchet-
stashed vessels 4 (16103/16105/16106/16110), stashed hatchet left the
stash 0/4, still in stash at end 4/4, stash-hatchet mornings 49–59/59.
`villagerGearUp` calls targeting the vessel: 0/16 seeds (0 acquire=true,
0 acquire=false) vs 1,373 NPC calls, 121 acquire=true — wrapper proven
live, so the vessel zero is real. 16105 day 42 held the LOOTED hatchet
(Nina's body, day 41) while its own stashed hatchet stayed stashed.
Axeacq's stone_knife inference REFUTED: 16101's morning-5 stone_knife
was knapped day 4, not stash-fed (stashed stone_knife still in stash
morning 5). Uniform rule: no weapon ever moved from vessel stash to
vessel kit in this corpus.

Named next fix (documented, NOT landed — DIAG arm): give the vessel a
stash-aware equip path — smallest option, competent gearUp gains a
stash-fetch step (move the vessel's own best stashed weapon into
inventory when unarmed or holding a weaker melee weapon; hatchet 15
beats stone_knife 12, loses to spear 30/machete 35, so no power creep
beyond what loot already delivers). Do NOT tune the `wb` gate or NPC
acquire flags — neither touches the vessel. Proof 21/21 post-rebase +
on merged master. Zero src/js, zero policy diffs.

## Arm 3 — sim-sicktick-b: DIAG-GO (landed bab13342b)

Attributes SICKNESS TICK STEP-UP IN STARVING PHASE (#1516, starveplenty
1030Z): the step-up is a new, worse illness replacing an expired mild
one — in the single tick function `villageSicknessTick` (game.js),
formula `1 + severity×2 − (healer ? 1 : 0)`, which contains NO
starvation term. Seed 9983 day-level: tick fever sev1 −3/day days
30–35, record expires day 35, wound fever sev2 created day 36 (hp 36
after the day-32 monster wound, hp<40 wound vector eligible), first
−5 tick day 37 — the sev2 record existed a full day before the first
starvation hit. Starvation is coincidence, not cause; in the fresh
band every confirming step-up has starving=false on both sides.
Refuted: no in-place severity raise (name/severity/daysLeft change
discontinuously, dl1→dl5 reset; treatment only lowers severity) and
no second tick shares the label — all 782 sickness hurt rows across
9 traces come from `villageSicknessTick` alone. The 'sickness' label
is shared across successive illnesses, not across ticks. Confirmed
on 10105, 10106, 10108 (2→4 = same transition with a healer present)
plus 3 more on 10101 under a coarser healer flag. A distinct second
mechanism was separated: healer-loss steps of exactly +1 within one
record (10107 hannah_kim −4→−5); 9983 is excluded (healer null
throughout). Named next fix: none as a game change — the formula
works as designed; only observability note is the hurt-label view
collapsing distinct illnesses into 'sickness' (a design call, not a
fix). Proof 9/9 post-rebase + on merged master. Zero src/js diff.

## Adoption — stranded 0730Z branches (from the 0830Z recovery note)

- sim-woodshortline-b: REBASED (df843ec88, patches identical to the
  original tip, zero src/js) + proof 55/55 on the rebased branch +
  MERGED. Tree released as merged, branch deleted.
- sim-warmthrestraint-b: NOT rebased, NOT merged — rebase onto master
  stops on exactly one conflict, scripts/policies/woodwarm.js ("both
  modified"). Master has since landed its own restraint gate in that
  file (comment cites sim-warmthrestr2-b, opt-in only) implementing
  the same R1/R2 `restraintDecision` as the stranded branch; the two
  are near-duplicates with different structure (master checks the
  restraint after warmDecision's miss branch; the branch precomputes
  `rdec` and stamps `warmRec.restraint` only when a restraint is
  active, so unconditional runs stay byte-identical to pre-restraint
  corpora). Proof on the original tip is green (47/47). HELD pending
  a coordinator call: adopt master's version and re-judge, or port
  the branch's version. Branch + worktree left intact (fresh
  heartbeat at closeout); nothing force-merged, nothing deleted.

## Wall (this run's judged corpora — DIAG corpora, no lever played)

Vestcounter rebuilt panels reproduce the vests-b census exactly:
competent national/table/wins 0/8, wave 4 6/8, wave 5 0/8, median 180
at cap; leanlink national 5/8, table invited 4/8, entered 0/8, wins
0/8, wave 5 0/8, median honest 173, village-lost 4/8 vs competent 1/8
(courting buys scale, costs survival on this band). Hatchequip
corpus (16 seeds, 60d, nighttravel): wins 0/16, max wave 3 observed.
Sicktick: traces only, no wall corpus.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../scale-wall.json
--current 'evidence/2026-10-30/sim-hatchequip-b-corpus/*.json'
--metrics national,table,wins,exiled --sweep-rows`: 3 LOUD lines
(national 12→0, table 16→0, wins 16→0, n=16), exiled clean. All 3 are
the KNOWN regime artifact class (60d pre-seat DIAG corpus vs the
WINSEAT baseline) — baseline NOT rolled, no investigation item.

## Metric review

Pre-registered bars held on all three arms with no mid-run re-scoring:
vestcounter 16/16 vs bar ≥15/16; hatchequip mechanism reproduced on
4/4 stashed-hatchet vessels vs bar ≥3; sicktick 9983 attribution +
3 fresh-seed confirmations vs bar ≥2. No metric revision proposed.
Note for the next vestcounter-class run: `vestsVillager` is a run-max,
not ever-held — do not compare it against everHeld census columns.

## Infrastructure

- Safe-commit index clobber hit all three worker commits (repaired
  via HEAD-blob cacheinfo each time, commits verified correct) and
  the coordinator's vestcounter merge path was clean; main tree clean
  at closeout.
- Corrupted rebase todo on the vestcounter landing (same pick listed
  done + remaining, HEAD at prereg; mid-rebase proof runs NOT counted)
  — recovered per the recorded lesson (abort, clean second rebase
  exit 0, proofs re-run 22/22 + 25/25, ff merge).
- Master moved twice under the run from sibling lanes (loop A 1215Z
  round 56007c185, own merges); every arm rebased with proofs re-run
  before merging. No EPERM flap this run.
- check.js --quick NOT re-run by the coordinator: vestcounter worker
  already recorded 284/6 with all 6 proven pre-existing, and the
  other arms are zero-src/js DIAG.

## Backlog updates (sim-findings.md, by coordinator)

- SWEEP/PANEL VEST COUNTER BLIND SPOT → FIXED by sim-vestcounter-b.
- SICKNESS TICK STEP-UP (#1516) → ANSWERED by sim-sicktick-b
  (illness replacement, not starvation; no game change).
- STASHED HATCHET NEVER EQUIPPED → mechanism NAMED by
  sim-hatchequip-b (vessel never offered the stash choice); fix is
  the named next arm, item stays open.
- sim-warmthrestraint-b stranded branch → HELD (woodwarm.js conflict
  vs master's own restraint gate), needs a coordinator disposition.

food-economy stays converging (NOT converged): three wall-adjacent
questions now answered with named mechanisms (itemId vest recount,
vessel stash-choice gap, illness-replacement tick step-up), but no
food-economy default flipped, no balance change landed, and the
warmth-default Steve-call stays OPEN. scale-onramp stays converging
(untouched; sibling loop A lane). Next food-economy blanks, in
order: (1) Steve-call: should competent play court, or is courtship
winseek-only by design? (2) Steve-call: is generation-dealt the
intended vest design, or should vests be earnable? (3) stashed-
hatchet stash-fetch equip fix (named acceptance test: re-run the
hatchequip recorder on 16103/16106/16110); (4) axe-by-day-7
build-or-ruling; (5) warmthrestraint disposition (master gate vs
stranded branch). Older open items carried: wake-tile forage
knowledge (#1513), sickness death-tele gap (#1514).
Claim deleted; lock deleted. Merged locally, pending ship.
