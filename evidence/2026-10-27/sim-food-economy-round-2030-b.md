# Loop B round 2030Z — food-economy, 2 arms LANDED, merged locally pending ship

Run: fleshout-loop-b-20261027T2030Z. Loop A live on scale-onramp the
whole run (1940Z claim, then 2036Z claim — NOT touched) -> B worked
food-economy (converging, second non-converged axis), taking the 1951Z
next blanks (1) and the backlog 1181/1182 doors in order. Base at arm
start c647c014d; master moved three times under the run (A's overtime
evidence 10feb955e, A's 2036 coordinator evidence efa1b5473, plus the
spandraw merge itself) — both arms rebased clean onto each new master,
proofs re-run green after every rebase, merged ff-only in order
spandraw -> stockdoors. Final master 776dbcbca. No push, no bump.
Zero src/js across the run; both arms are measurement instruments.

## Plain-words summary

Two bookkeeping questions about the village pantry are now answered.
First: when a villager uses an ability that stretches across the night,
the food eaten that night gets counted against the ability in a naive
tally — but that is a timing artifact, not the ability eating extra
food. A day-boundary probe now proves 15 abilities can span a night
without that confusion, and the span-aware tally already handles all of
them the same way. Second: the pantry ledger now closes. An earlier
"unbalanced books" verdict turns out to have been caused by *when* the
books were closed (last day-end snapshot vs the final pantry state
after the run ended), not by a missing pantry door. With the closing
fixed, every family of food balances on both a pilot and a confirm
band. The old NO-GO verdict stands as it was judged at the time — this
run explains it, it does not rewrite it.

## Arm 1 — sim-spandraw-design-b (DIAG-GO)

Designed day-boundary span probe on top of the 1951Z census (which found
only cultivate firing in node sims). The probe lists all 68
data-driven ability actions, classifies each, and invokes each
non-combat action through the game's own ability path at a
day-boundary position with the census span logger on — no faked draw
records; all draws are real end-of-day pantry draws.

- Pilot: 8 seeds x 24 actions x 2 positions + targeted second attempts
  for social actions = 464 instances. Confirm: 12 fresh seeds,
  boundary only, 216 instances. Controls: 0/232 control-position spans
  crossed a day; the 9954 replay control still reads cultivate
  PROVEN at 3,820 kcal.
- Headline: 15 keys PROBE-PROVEN (mechanism), all recurred on the
  confirm band. Per-seed exclusions are identical across keys (e.g.
  pilot 5,990 / 6,110 / 7,480 / 5,650 / 4,790 / 4,170 / 7,590 /
  3,540 kcal for tracker.track, thief.steal_pantry, and
  molt.shed_skin alike) — the exclusion is the seed's night meal, not
  the action's effect. Any ability span holding a night swallows that
  night's meals in a naive direct+meal tally; the already-wired
  span-keyed dedup covers all of them uniformly (scoped by span, not
  ability — the right shape).
- Per the prereg's anti-rushed-probe guard, these stay PROBE-PROVEN
  (mechanism), never real-play double-counts; real-play promotion
  needs a separate unscripted band (follow-up, see below).
- Other pilot results: 2 keys fired without crossing (green_thumb.ask,
  iron_stomach.push_through — kcal-only, impls tick nothing); 5
  pre-payment fixture refusals (no game/body/dispute/tense
  situation/water); 3 post-payment refusals that still crossed
  (end_it_before, war_cry.challenge, trophy_room.mark — no precheck,
  so the paid time tick fires end-of-day before the impl refuses; a
  failed tap at day's end still swallows the night); cultivate
  gate-blocked on fresh setup ("Step outside the hall" — setup
  leaves the player inside; its real-play proof remains the 9954
  replay).
- Prereg inventory error, caught by the probe and corrected: the
  prereg listed 15 actions as "unwired." Wrong — godpath.js
  registerVerbs() registers generic impls for every data action with
  a do field (long_table.share_pot fired in every boundary
  instance). Corrected wiring total is 68/68 wired. Combat actions
  remain day-crossing-impossible-by-construction (tickAction returns
  early mid-fight).
- Proof: node scripts/test-spandraw-design-b.js 19/19 PROOF-GREEN
  (synthetic + corpus legs), re-run green after every rebase.
- Commits (rebased): prereg 5e5bc8327, probe+analyzer+proof 6e75d64c4,
  pilot+confirm corpora + corrected wiring table e0a7d18b8, evidence
  c6f7e546f (merged). Safe-commit index clobber hit all four commits
  (staged-deletion phantom); repaired each time via
  update-index --cacheinfo from HEAD blobs, status + diff verified
  empty. No EPERM losses.
- Panel statement (per prereg): no panel .md — instrument-only, no
  game leg. Wall numbers NOT recorded for probe fixtures (single
  day-1 setups, not villages) — stated, not estimated.
- Evidence: evidence/2026-10-27/sim-spandraw-design-b.md + prereg,
  with metric review section and a sense read of the seed-9981
  tracker.track span.

## Arm 2 — sim-stockdoors-b (GO pilot + CONFIRM-GO)

Boundary-aware re-judgment of the pantry ledger. The brief asked for
new recorders; the recorders already exist (0049Z arm, landed 0530Z:
stockdoor capture + sweep + analyzer/proof, reused unchanged and the
decision recorded in the prereg). This arm's new work is what the
0530Z metric review ordered: the boundary-aware re-judgment
(post-run closing) plus the day-82/83 ~5,900 kcal case diagnostic.

- Prereg committed before any judged sweep: fd5223eb9 (rebased
  6c7807ad9) — the sweep's one pre-registered addition is a post-run
  finalPantry snapshot (pure read) plus a new analyzer.
- Band: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off), 100d
  death-aware. Pilot seeds 9820-9827 (reused substrate, stated);
  confirm seeds 9730-9741 (12 seeds; pre-prereg collision check
  clean; the 0049Z confirm band 9768-9779 was NOT reused — 0530Z
  records it spent-but-unjudged).
- Det-gate (leg 1): seed 9820, STOCKDOORS 0 vs 1, byte-identical
  including finalPantry (25,416 kcal both runs; last day-end
  snapshot was 25,036 — the 380 kcal gap is itself the boundary
  effect). Counts reproduce current-base numbers exactly (240
  inflows / 1247 meal draws / 3 deaths / 155 dried events /
  656 stockdoor / 22 direct).
- Boundary-aware closing (post-run snapshot) vs control (last
  day-end snapshot):

  | Leg | Pilot (9820-9827) | Confirm (9730-9741) |
  | Coverage | 8/8 stockdoor, 8/8 driedpath, 100% linked — PASS | 12/12, 12/12, 100% — PASS |
  | Named | 6/6, pooled 0 / 973,680 — PASS | 5/5, pooled 0 / 286,220 — PASS |
  | Generic | 8/8, pooled -1,021 / 2,103,491 (0.049%) — PASS | 12/12, pooled -3,040 / 3,473,310 (0.088%) — PASS |
  | Dried | -1,021 / 610,566 (0.17%) — PASS | -3,040 / 1,033,545 (0.29%) — PASS |

  Control legs (same corpora, last-day-end closing): pilot named
  6/6, generic 7/8; confirm named 4/5, generic 10/12. The closing
  definition alone flips every control leg to 100% — the 0049Z
  NO-GO was a closing-boundary artifact, not a missing door, as
  residualhunt diagnosed. The 0049Z NO-GO stands as judged under its
  own prereg; this run does not overturn it, it explains it.
- Pilot census: stockdoor 4,881 records / 1,807,600 kcal; direct 433
  / 77,728 (player-take 377, npc-adult 56); transformed post 610,566.
  Seed 9824 died day 75 on current master (vs 100d on the old base).
  Opening stock re-derived: 47,250 kcal, same staple split (Rice
  13,000, Dried beans 12,000, Dried meat 8,800, Canned soup 7,500,
  Peanuts 5,950). Confirm census: stockdoor 8,669 / 3,036,600;
  direct 1,452 / 222,773.
- Zero-record paths on all 20 seeds (reported, not claimed): alien
  raids, Light Fingers lifts, event takes, bulk takes, child pantry
  eats — their accounting is still unproven.
- Case diagnostics (unjudged): (a) Band analogue of the day-82/83
  case = seed 9822, day 83: 21,321 kcal, 100% recorded spoil sweep
  (6 stacks, all spoilDay 77; Muscadine base 15,390 + dried 3,306 =
  18,696; zero direct that day) — large non-draw removals on
  current master are the sweep door. (b) Seed-9750 diagnostic: days
  81-84 have zero sweeps and zero direct records (max non-draw day
  on the run is day 68, 1,027 kcal) — the mealdraw-era ~5,900 kcal
  case does not reproduce on current master; it is base-pinned to
  its era.
- One open component, passing but unexplained: small generic dried
  residuals — pilot 9825 -1,021; confirm 9735 -800, 9738 -2,240 —
  the same mid-run dried-drop class residualhunt left open. Next
  ledger pass should hunt it per-stack (e.g. confirm 9738) before
  claiming zero residuals everywhere.
- Proof: scripts/test-stockdoors-b-2030.js PROOF GREEN (corpus
  validity, det-gate byte-identical incl. finalPantry, det-gate
  reproduces corpus 9820 counts, independent from-scratch
  boundary-aware recomputation matches the analyzer on every leg,
  verdicts follow, stockdoor invariant holds, no unknown direct
  paths, retMismatch 0, hygiene clean), re-run green after every
  rebase.
- Commits (rebased): prereg 08c1b113e, evidence 776dbcbca (merged).
  Safe-commit index clobber hit both commits; repaired per recipe,
  commits verified correct.
- Panel statement (per prereg): no comparison exists (no lever, no
  game change); det-gate is the before/after, same as prior arms.
- Sense check: first direct event 9820 day 7 (NPC eat, 1u Rice 200
  kcal); first stockSurplus night 9820 day 3 (give 67, stored 200,
  spoilDay 6); Megan smoke-rack line day 12, verbatim in evidence.
  Villagers read as people; nothing robotic found.
- Evidence: evidence/2026-10-27/sim-stockdoors-b.md + prereg, with
  metric review section and per-door kcal tables.

## Wall numbers (judged corpora only)

Stockdoors pilot: national/table/wins 0/8, wave 4-5 0/8, median
survival 100d, 48 deaths (sickness 16, arena 9, monster 8,
starvation 4 — starvation appears vs 0 on 0049Z). Confirm: 0/12
across the board, median 100d, 48 deaths (arena 22, monster 9).
Spandraw: fixtures only, no wall numbers (see above). The scale wall
stands on these bands, as expected for ledger/provenance work.

## Telemetry deviation check

On both stockdoors corpora: 3 LOUD lines each (national 12->0,
table 16->0, wins 16->0) — the known regime artifact class (WINSEAT
baseline vs pre-seat competent-nofeast substrate with SEATDRIVE=0;
no seat legs, so national/table/wins are structurally 0).
Baseline NOT rolled; no new investigation. No exiled LOUD line.

## Metric review (coordinator)

Both arms carried their own metric review sections; neither verdict
was re-scored. Two standings to keep: (1) the 0049Z NO-GO stands as
judged under its own prereg — this run's boundary-aware closing
explains it and must not be quoted as overturning it; (2) the
spandraw 15 keys stay PROBE-PROVEN (mechanism) until a real-play
unscripted band promotes them — do not quote them as real-play
double-counts or real-play savings.

## Infrastructure

- Worktree registration slow (~7 min, queued behind another lane's
  registry-locking reap) but completed clean; both trees heartbeated
  throughout.
- Safe-commit index clobber hit all worker commits + this
  coordinator commit pattern (repaired via HEAD-blob cacheinfo each
  time, commits verified correct). No EPERM flap on sweep writes.
- Sibling trees NOT touched. Main tree clean at closeout.
- Loop A 2036Z claim was live at closeout (scale-onramp, NOT
  touched); its coordinator evidence efa1b5473 landed during this
  run and was rebased onto, not interfered with.

## Convergence

food-economy stays converging (NOT converged): the pantry ledger
now closes under boundary-aware closing on two bands and the
span-draw instrument exists with 15 probe-proven keys, but the
dried-residual class is still open, the real-play promotion band
is unrun, zero-record outflow paths are unproven, and no
food-economy game fix has landed from this axis. The scale wall is
untouched by this axis. scale-onramp stays converging (untouched;
sibling loop A — see its 2036Z review).

## Next blanks, in order

(1) Real-play promotion band for the 15 PROBE-PROVEN span keys
(unscripted band, not a forced-timing probe). (2) Per-stack hunt of
the generic dried residuals (confirm 9738 first). (3) Precheck gap
for the three post-payment refusals (end_it_before,
war_cry.challenge, trophy_room.mark). (4) Cultivate fresh-setup hall
gate ("Step outside the hall"). (5) Zero-record path accounting
(alien raids, Light Fingers lifts, event/bulk takes, child pantry
eats). (6) Carried from 1951Z: stale-baseline rule for provenance
preregs; treeline give/overrun band; span-log foodState gap (nest
drawExit items lack foodState/granaryDays).

Claim deleted; lock deleted.
Evidence: evidence/2026-10-27/sim-food-economy-round-2030-b.md
(coordinator, this file) + sim-spandraw-design-b.md + prereg +
sim-stockdoors-b.md + prereg. Merged locally, pending ship.
