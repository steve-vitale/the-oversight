# sim-scale-onramp-round-0645 — profile gate re-tested GO + rumor-born plans answered (coordinator evidence)

Run `fleshout-20261116T0645Z` (Loop A), axis scale-onramp (converging, NOT converged).
Loop B live on winnability chain throughout — its 0530Z round landed mid-run
(`9b04ae9b7`, companionpool + gatereach2 DIAG-GO), then a new B run started
(0730Z claim: gatelever-b + poolmarginals-b) — NOT touched. This run took the
0446Z review's next blanks (1) and (2), in order, on one shared fresh band,
seeds **102011–102018**, 150d death-aware. Freshness verified by the
coordinator: 0 `.md` files under `evidence/` name any of the 8 seeds, no
per-seed filenames; both arms re-verified in their preregs. (Loop B's band
102001–102008 is different; no collision.)

## Arm 1 — sim-launchdef-a (LEVER re-test + instrument): PILOT GO, gate fix lands as game code

Branch `sim-launchdef-a`, merged ff-only as `ed441db06` (rebased 3 times onto
a moving master; proof 82/82 on the final rebased tip and therefore on the
merged tip). Evidence: `evidence/2026-11-16/sim-launchdef-a.md`.

The lever: the profile-gate bypass re-landed VERBATIM from profilegate-a
(`f5dee2331` revert undone; `src/js/villager-agency.js`, 18 insertions, 1
deletion — the branch's entire `src/` diff). A launched `party_launch` plan
bypasses the non-ranger profile gate in the depart path. The new instrument:
an any-commit launch definition (a launch counts on ANY commit — dawn or
mid-day refresh) plus a skip-reason recorder that says WHY a `party_launch`
commit produces no execute row. Both legs re-landed the vetparty seed call
verbatim (instrument subject, reverted before landing).

Frozen bar: launched-any-commit wave-4+ plans on ≥3 of 8 seeds AND cost bar
clean AND instrument valid AND 0 bare `selected-not-executed` days. Armed
leg launched **6 instances on 4 of 8 seeds** (102011, 102015, 102016, 102018)
vs control 3 on 2 — **GO**. Cost bar clean (starvation 0 vs 1, arm-only 0
vs 1; median 90d vs 90d, ratio 1.0). Instrument valid (classified 1.0,
unknown 0, 16/16 files, 0 errors, drift clean). Skip coverage clean (0 bare
days out of 27 blocked commit-days). The one mid-day-first instance is
tashi_sherpa (seed 102015, day-65 part-1) — the launch the old dawn-only
metric missed; under dawn-only the verdict would still be GO (5 on 4 seeds),
so the correction is validated but not load-bearing on this band.

**The skip decomposition is the headline:** profile-gate-veto 39 rows control
vs **0 armed** — the gate was the veto and the bypass removes it. Other
reasons: away-on-expedition 53 rows (the scorer keeps bidding return trips
for holders already out on their own launched expeditions — they cannot
depart twice), night-at-part-3 25 (part-2 commits die at the night tick;
part-1 is the working mid-day channel), not-at-haven 8, other 3 (same-tick
companion departures — the pre-tick snapshot goes stale; recorder gap named
for the next instrument revision). Companion pool still binds: 6/16 armed
instances are `no-companion-party`. One real launch condition still bites
(`inviter-range-0`, boris_kowalski, 7 bids, 7 blocks).

**Price to watch:** +31 deaths armed (528 vs 497), scholar deaths 25 → 34,
panel `review_required` with a deaths regression_signal (+3.875/run, CI
[0.5, 9.5]), concentrated on seed 102018 (+23 — the seed with the most
gate-enabled departures, 70 vs 22 depart rows). No new death mode (combat
deaths; expedition deaths actually fell 158 → 146). The frozen cost bar
covers starvation + median only — a confirm round must pre-register a deaths
term. **Sense-testing:** launched parties fight real wave-4 monsters with
real lines (Tashi vs The Eulogy, Adaeze vs The Eater fleeing at 1 HP) — but
**0 wave-4 kills by any of the six launchers**. The next binding link is
killing, not leaving.

**COORDINATOR DECISION — seed-call disposition: NOT landed.** The vetparty
seed call stays reverted. It was an instrument, never pre-registered as a
lever in this run, and landing it silently would be a second, unjudged game
change. A future round may pre-register it as its own lever (chain repair)
with its own GO bar. Note the fix is not inert on live master without it:
the live seed sites (expedition handler + fight-gate `avoided` path) already
produce targeted launches — rumorplan's 12 strict launches on live-master
seeding are all seed-created. Findings #2414 (mid-day metric miss) and
#2415 (skip reason unrecorded) now `[fixed]`; 3 new open items appended
(snapshot staleness, part-2 night-tick design question, deaths-price watch).

## Arm 2 — sim-rumorplan-a (DIAG, instrument-only): DIAG-GO — rumor-born plans never convert

Branch `sim-rumorplan-a`, merged ff-only as `0740ce985` (rebased once clean,
5/5; proof 97/97 on the rebased tip). Evidence:
`evidence/2026-11-16/sim-rumorplan-a.md`. Zero `src/js` changes.

The question: do rumor-born hunt-stage plans (born from fire talk,
target-null, holder fought nothing) ever pick up a real target before
launching? **Answer: never — 0 of 20.** Not one even acquired a target
without launching. Classification 33/33 (100%, unknown 0), corpus 8/8 main
+ 8/8 replication, neutrality proven (D1/D2 green, D3 all 8 seeds identical,
§15 panel delta 0 on every observed metric), main vs replication
bit-identical on every number. Of 48 wave-4+ launched plans (broad):
rumor-born 27 (56%, every one target-null), seed-created 12, fought-personally
5, companion-inherited 4. Strict (named wave-4/5 beast or needWave ≥4, n=12):
**all 12 seed-created** — plans the seed itself created out of a fight, born
already targeted. The seed fires 75 times on the band yet never attaches a
target to a rumor-born plan at any stage, because it writes a target only
from a fight the holder fought.

**Sense-testing (Wyatt, seed 102011):** plan born day 56 at Haven, launched
days 58/62/69/78/81 always target-null; day 62 dodged The Eater, day 66
walked into it, dealt 173 to a 983-HP beast, took 63, fled at 19 HP. The trip
is not a hunt — nothing names a beast, so the party wanders and either gives
monsters room or gets mauled. Secondary: seed 102016 had zero win-plans in
116 days yet still won — plans are not on the critical path under this policy.

**Design-call constraint (for Steve/coordinator):** the world-tick seeding
call stays open, but this measurement constrains it — seeding from the world
tick would need a DIFFERENT attachment rule, not just more call sites,
because the seed as built cannot help rumor-born plans at all. The
rumor-born design question (should a HavenTick engagement via `villageSlain`
alone carry a plan to `hunt`?) stays open for Steve/coordinator. The
rumor-born finding is now `[fixed]` with the lifecycle numbers.

## Cross-arm reconciliation: the two arms ran on different substrates — read the walls accordingly

- Launchdef re-landed the vetparty seed call on BOTH legs (its judged
  difference isolates the gate). Rumorplan re-landed NOTHING — its legs ran
  on live-master seed sites only (`villager-agency.js` evaded/fled,
  `win-plan.js` avoided). So rumorplan's wall is the closer-to-live baseline
  and launchdef's is the seeded-plan substrate. The one baseline difference
  between them (seed 102018: lost in launchdef control, won in rumorplan
  main) is a substrate difference, not a contradiction; each arm's verdict
  rests on its own within-stack contrast.
- National is reported BOTH ways everywhere (per the B-0530Z wall-table
  finding): scaleRank ≥2 and standing ≥200 differ on this band too
  (launchdef armed: 8/8 vs 0/8).
- Rumorplan's analyzer does NOT instrument table entry — its `table: 0` is a
  placeholder. Do not cite it as "no village reached the table." Wins (7/8)
  are the seat outcome that corpus can state.

## Wall (this run's judged corpora, 32 configs)

| | launchdef control | launchdef armed | rumorplan main (= replication) |
|---|---:|---:|---:|
| wins | 6/8 | 7/8 | 7/8 |
| national at end (scaleRank ≥2) | 7/8 | 8/8 | 7/8 |
| national (standing ≥200) | 1/8 | 0/8 | 1/8 |
| table seats | 0/8 | 0/8 | not instrumented |
| wave-4 reached | 8/8 | 8/8 | 8/8 |
| wave-5 reached | 1/8 | 0/8 | 1/8 |
| median survival | 90d | 90d | 90d |
| villages lost | 2/8 | 1/8 | 1/8 |

No wall movement attributable to a lever beyond the gate's launches: wins
move 6→7 on one 8-seed pilot leg (within noise at this n), table 0
everywhere it is measured, wave-5 0–1/8. The gate fix converts departures,
not wins — the chain's next links are killing (0 wave-4 kills by launchers),
companions (pool empty most dawns), and trick knowledge at the door.

## Telemetry deviation check

Ran on both corpora (`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-16/perseed-launchdef-a-on/*.json'` and the
rumorplan-a-main glob, `--metrics national,table,wins,exiled`):
**REFUSED both by shape** (recorder rows, anchorCommit) — same pattern as
0115Z/1415Z/0315Z/0446Z/0530Z. Baseline NOT rolled; no LOUD lines; no
investigation item. (The rumorplan worker's "no baseline exists" note is a
wrong-path read — the baseline lives in the goal hidden_files, not the repo
tree; the coordinator ran it from the goal path.)

## Infrastructure

- Registration slow under load (~7–8 min each; the two registrations took
  ~7.6 min total in one queued command). Pre-flight reap: 11/16 active, no
  removals; main tree clean, disk 40%.
- Master moved 4 times under the run (Loop B 0530 landing `9b04ae9b7`,
  journey deepening r222 `53ba964a7` + closeout `76966f6a6`, journey-crisis
  r223 `4b1800402` after both merges) — zero file overlap with either arm.
  Launchdef rebased 3 times (11/11 picks clean each time); the first
  ff-only merge failed because master had moved mid-proof, recovered by
  rebase + proof + merge in one call (the documented race-window shrink).
  Rumorplan rebased once clean (5/5).
- Safe-commit index clobber struck the launchdef worker's commits, the
  rumorplan worker's commits (instrument + corpora), and was repaired via
  the ls-tree pipe each time; commits verified correct. No write-flap
  strike. No rebase-stop quirk. One proof re-run lesson, recorded: the
  launchdef proof is env-parameterized — the post-revert tip needs
  `LAUNCHDEF_SEED_CALL=off` (gate on); a default-env run fails exactly one
  leg (seed call expected on, found absent) and that failure is the
  reverted shape, not a regression.
- `check.js --quick` on merged master (both arms landed): **334 passed, 6
  failed in ~660s**, identical on two consecutive runs. None attributable
  to this run: measurement-proof-update + measurement-workflow (stale
  neutral proof — the 2026-10-29 rebuild's known open item, "Proof source
  inputs are not current"); phone-frame-proof (retained browser inputs
  stale); ladder-bundle-20261108 (ambient-raid control leg); living-garden
  + one-person-army deed-attainment (120s timeouts under load). No failure
  names villager-agency, depart, party_launch, or either arm's instrument.
  Full log: `/tmp/checkquick-0645.log` (ephemeral; failure list in this
  section). `check.js` left no stray evidence changes (main tree clean).
- One new open finding appended by the coordinator: MONSTER-WAVES WAVE-5
  COUNT DRIFT — docs list 8 wave-5 monsters, `src/data/monsters.json` has
  10 (`finale_crew`, `finale_opening`), same drift class as the wave-4
  herald finding.

## Metric review

1. **The any-commit definition is validated, not load-bearing on this
   band.** Armed: 6 launched any-commit vs 5 dawn-only; the verdict would
   still be GO under dawn-only. The correction matters because the
   mid-day-first instance exists and the proof fixture shows the two
   definitions diverging on the same corpus.
2. **The frozen cost bar has no deaths term.** The panel's deaths
   regression_signal (+3.875/run) is real and concentrated, and the prereg
   threshold is the judge — the GO stands, but the confirm must
   pre-register a deaths term or the coordinator must rule the price
   acceptable. This run does not smuggle it into the verdict either way.
3. **Ever-national is not derivable from either corpus** (no trustWeekly
   samples). End-national only, both definitions, no conflation.
4. **Rumorplan's strict/broad split is the right instrument shape.**
   Broad (needWave ≥4) counts rumor-born launches that name nothing;
   strict counts only named-beast launches. Future wave-4+ launch claims
   must say which unit they use.
5. **The 102018 cross-arm baseline difference is substrate, not noise
   to average away.** Report each arm's wall on its own substrate; do not
   pool launchdef-control with rumorplan-main.

## scale-onramp stays converging (NOT converged)

The wave-4 re-engagement chain is now decomposed end to end with measured
numbers at every step (seed → seed-attach → dawn bid → profile gate →
companion pool → launch → gate), and the profile gate — one real veto — is
now lifted in game code with a PILOT GO behind it. But no lever has moved a
wall number beyond one pilot leg's 6→7 wins: the launches produce real
fights and no kills, most wave-4+ launches name no beast at all, and wins
still come only through the default-OFF courtship + seat instruments of
earlier rounds. Next blanks, in order: (1) a CONFIRM round for the gate fix
on a fresh band with a deaths term pre-registered in the cost bar; (2)
killing, not leaving — 0 wave-4 kills by launchers (trick knowledge at the
door, ammo/gear, party size at gate); (3) companion-pool marginals (Loop
B's poolmarginals-b, live — do not touch); (4) the gate lever
(gatereach2's named next lever, Loop B's gatelever-b, live — do not touch);
(5) rumor-born plans design call (Steve/coordinator — gate hunt on a named
beast vs allow rumor hunting); (6) world-tick seeding design call
(Steve/coordinator — needs a different attachment rule, not just more call
sites); (7) part-2 commits die at the night tick (design question); (8)
family-7 program decision; (9) headcount-ceiling, wild-Reunion mirror pack,
answercourt landing decision, competent seat-taking BUILD (all Steve-calls).
Claim deleted; lock deleted. Evidence: this file.
