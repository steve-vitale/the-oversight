# Run fleshout-20261021T1121Z — scale-onramp (flesh-out loop, 2026-10-21)

Axis: scale-onramp (the blocking axis per STANDING DIRECTIVE + convergence tracker; directive lift remains a Steve call).
Claim: hidden_files/lever-claims/fleshout-20261021T1121Z.json (written before any of this run's sims; deleted at closeout).
Rotation index: 3 (villager agency) — NOT advanced; directive overrides rotation.
Loop B: LIVE on food-economy at run start (claim fleshout-loop-b-20261021T1105Z.json, arms sim-huntstaff-b/sim-rotmech-b/sim-prodrebuff-b) and still live at closeout — zero file overlap by design (my arms: policy tributeguard.js / instrument winpath-taxonomy / src/js/hierarchy.js only).

## STALE-LOCK RECOVERY (run start)

- Lock fleshout-20261021T0915Z (created 2026-10-21T09:15:40Z) found at run start, age 2h03m → deleted per the >90min fallback. Registry showed 2 trees for that run (sim-wave4hunt, sim-killtime), heartbeats 16 min stale (>15 min) → run DEAD per protocol. Claim marked .DEAD. Lock recreated for this run (fleshout-20261021T1121Z), deleted at closeout.
- The dead run's arms resolved during/after recovery WITHOUT adoption (worker-occupancy unverified; 1415Z collision lesson — the trees were actively being written to at 11:20Z):
  - **sim-dissolvetax**: already landed on master before this run (acf58b57b) — the DIAG whose named-nexts (#752/#753/#754) this run's arms are built on.
  - **sim-killtime**: finished as a concurrent finisher, landed 3ec5b2fd1 (kill-time attribution census, 20/20 wave-4 kills attributed, 0 unexplained; no published claim flips — twovets 0/16 scholar kills holds, vgearconfirm GO holds).
  - **sim-wave4hunt**: NO commit on master; tree/branch/registry entry all gone by 12:30Z with no landed record. The deliberate wave-4 engagement question (#747's named next) remains UNMEASURED. Design survives in the .DEAD claim + hidden_files/arm-briefs-20261021/. Noted for the next run — do not treat the question as answered.

## ARMS (this run — all landed on master)

### 1. sim-winpathtax — DIAG-GO (landed cb8de11f3)
Backlog #754 (claimed → resolved): is s64905's win-without-ever-sitting-the-court a legitimate alternate climb or a bypass? Instrument-only DIAG, zero src/js, zero new sims — mined the committed winning-substrate corpora (perseed-dissolvetax/ 16 runs, perseed-vgearconfirm/, perseed-twovets/). Proof 37/37 RED→GREEN on synthetic fixtures; honesty cross-check 4/4 hand-recomputed. **92/92 wins classified, 0 unexplained, 0 instrumentErrors.**
Verdict: LEGITIMATE ALTERNATE CLIMB. Code-grounded (no canon doc covers the ladder): the full seat's deed gate dropped the scale rung in the 2026-10-13 Steve-attributed STANDING change ("the Feared path must be able to sit at the table without links"); the lesser seat needs only regional+, never national. s64905 (maxWave 3, wave4=0) won via the lesser seat on the regional rung: village → regional → table, court never staged. Corroborated: two wins (s64907 belong, s64908 lead) won AFTER losing the realm — the table came anyway. No missing gate; nothing to fix in game code. All 77 path-recorded wins are the Feared path (all light).
Named nexts: (1) steve-call — full-seat scale-freedom: Feared-only or all paths? (TABLE.md still says "The full seat keeps the national bar" — doc-lag, #741's family); (2) instrument gap — future win-path corpora should record winTrack{path,seat} + regional flag + the table audit beat, and ever-national in vgear/twovets-family instruments (16 wins stuck in the honest-but-coarse `unheld-national` class). #754 marked resolved in sim-findings.md.
Wall note: wave-5 is 0/112 across these corpora — the wall is still the wave-5 door, not the court.

### 2. sim-trustdrift-voice — GREEN content fix (landed abd17010b [needs-eyes])
Backlogs #751 + #753 (claimed → fixed): trust erosion toward dissolution was unvoiced (Thornfield 65→38 over 30 days, then "◈ The realm came apart"; loop-B's 8802: 100→7 over nine weeks). src/js/hierarchy.js +48: `_trustDriftWatch()` runs in `hierarchyDaily()` immediately before `_checkNational()` — when a seasoned-age (30+d) Haven link's trust crosses below the trust-40 bar (the actual `_linkSeasoned` constant, verified in code, superseding the "below 50" guess) trending down, it voices a beat ONCE per crossing, re-arming only when trust climbs ≥40. Knowledge-gated, no numbers, deterministic (no RNG). Excludes conquered links (season-only bar), young links, and subordinate-Haven links (BELONG's trust-50 gate, different fiction). Beats read as people noticing drift ("Thornfield's fire is drifting from ours — their speaker doesn't linger at the gate the way they used to, and nobody over there says why. Bonds don't mend themselves; a tended fire remembers who fed it.").
Tend-skip boundary (NOT faked): the 8802 skip is policy-side — policies gate `tendLink` behind `pantryKcal > 20000` (verified in fourthlink.js/refusecourt.js); when the gate fails the engine never sees the intent, so an engine-voiced "we skipped tending" line would be invented fiction. Documented as the boundary; the engine-visible bare-pantry refusal was already honest and verified voiced. The 8802-shaped fix belongs to policy arms (named next).
Proof: scripted RED→GREEN (NOCROSS digest d7b227dac2b9ce67 byte-identical pre/post; CROSS diff = exactly the new beat lines). Regression: det-gate paired same-seed byte-identical except new beats. holdloss 53/53, holdloss2 19/19 (full env), check-wired 0 unwired, validate-ontology 123 systems.
Honest gaps: (a) full `check.js --quick` could not complete in this environment — stuck twice with zero output under sibling sim-worker CPU contention, killed both times (documented, not waived); (b) loop-B's `test-linkdissolve-b` has 1 failure ("realm-death say-line captured — lines=0") that reproduces IDENTICALLY on the pristine base (patch-dance verified) — pre-existing, loop-B's lane, not chased.

### 3. sim-tributeguard — GO at pilot (landed 29957eefd)
Backlog #752 (claimed → fixed): the dissolvetax DIAG's named next — "never skip the tribute that keeps the court." Policy-side layer scripts/policies/tributeguard.js (TRIBGUARD=1, default-OFF, zero src/js): while a belong court is held (the engine's own verdict via `Game.polityOf` — trust≥50, arrears≡0, link≥14d, foreign realm≥4 fires; grounded in hierarchy.js reads, no canon doc covers this area), the guard pays the tribute before belongseek's `pantryKcal > 2× tribute` skip gate can fire. Composes OUTSIDE the vgearconfirm armed stack.
Proof 17/17 GREEN with full substrate env per Usage (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1); det-gate byte-identical with TRIBGUARD unset; env-gate; read-only static scan; RED→GREEN fixtures; D2 180d deterministic.
PRIMARY (mechanism pilot) GO: 8 fresh seeds 64921–64928 × {control, armed}, paired same-seed, 180d death-aware — **30 control tribute-skips-while-court → 0 armed skips, 33 guard payments (29 partial — the pantry was truly short)**. Guardrails PASS: starvation deaths 2 vs 3 (bar ≤4); median survival 91d vs 91d (bar ≥81d).
Secondary (report-only): arrears-tripped dissolutions 3 control vs 2 armed. The guard's honest limit: it fixes the cushion-rule edge (s64926: 12,408 kcal vs 7,500 tribute — control skipped and dissolved d92; armed paid in full, held the court, won) but cannot conjure food (s64921/s64924 empty pantry — guard paid every grain, courts dissolved anyway; bought 7 days on s64921).
§15 panel: review_required with three single-seed watches (−0.125 on won/table/national) — investigated as timing artifact (armed s64927 survived to the d181 horizon cut without tabling yet) + the empty-pantry limit; pre-registered threshold is the judge per §14.
Sense read (2 armed transcripts): the guard reads as a village keeping faith — "Tribute paid: 11,333 kcal walks out of the pantry toward Emberhold. The relationship holds." / "You send 3,800 kcal. It hurts. That's rather the point of tribute." The s64921 loss reads as loss, not noise.
Named next: the guard's food cost may carry a win-timing price (armed s64927 paid ~48k kcal guard tribute, tabled ≥2d later than control — single seed, flagged not judged). Empty-pantry court loss is a lever-0 food-economy problem, not a tribute-policy problem. #752 marked fixed in sim-findings.md.

## Wall numbers (this run — national / table / wins, wave 4–5 unlocks, median survival)

- tributeguard corpus (VGEAR=1 winning substrate, belongfeast, 16 configs): national end/ever 4/8+5/8 control → 3/8+5/8 armed; table 8 → 7; won 8 → 7; wave-4 6/8 → 5/8; **wave-5 2/8 → 2/8 (opens on 2/8 seeds both arms, independent of the guard)**; exiled 0; median survival 91d both; max 179d/181d.
- winpathtax corpora (mined, no new sims): wave-5 0/112 — the door stays shut on the previously measured substrates.
- The scale wall stands: villages reach national/table and win on the winning substrate; the wave-5 door remains the binding wall (2/8 opens on the tributeguard belongfeast seeds is the highest open rate measured on any substrate — both arms, guard-independent; worth a look by the next wave-5 arm).

## Metric review (§14 — binding, never re-scored)

- tributeguard: PRIMARY (0 armed skips) GO as written; guardrails passed as written. The §15 panel's review_required watches were investigated, not re-scored — the pre-registered threshold is the judge. Metric held.
- winpathtax: DIAG-GO bar (100% attributed, 0 unexplained) met on the letter; the 16 `unheld-national` coarse-class wins are an instrument gap, reported open, not re-scored. Metric held.
- trustdrift-voice: scripted RED→GREEN + det-gate met; the quick-check and linkdissolve-b gaps are documented as infra/pre-existing, not waived and not re-scored. Metric held.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-10-21/perseed-tributeguard/*-belongfeast-tributeguard-s*.json' --metrics national,table,wins,exiled` → **1 LOUD: "wins disappeared: baseline 16 → current 0"** — investigated: the standing schema artifact (per-seed `won` key vs checker's `wins` key; the same class as the 0730Z/0015Z findings). Worker's evidence numbers verified independently from the JSONs (armed won 7/8, control 8/8 — match). national/table/exiled quiet. Baseline NOT rolled.

## Convergence state

**converging** — scale-onramp: (1) the belong arrears knife-edge (#752) now has a proven policy-side guard (tributeguard GO at pilot; the lever's honest limit is food, not policy); (2) the trust-erosion narration blank (#751/#753) is filled with voiced beats; (3) the win-without-court question (#754) is closed as legitimate alternate climb, not a bypass. The wave-5 door remains the binding wall (0/112 on mined corpora; 2/8 opens on the tributeguard belongfeast seeds, guard-independent — the next wave-5 arm should look at what opens it there). Directive lift remains a Steve call.

## Infra

- git EPERM flap QUIET all run. One mid-run service restart hit the trustdrift-voice landing verification (scratch patch kept in ~/workspace not /tmp per the 2026-10-14 lesson; tree verified intact after restart, verification completed).
- Master moved 7× mid-run (ship-loop version bump + Codex pantry-gifts merge 00412b13f + playtest-loop journey-establishment r23 + journey endgame r35 [which landed #738's audit-deeds named next] + the 0915 run's sim-killtime concurrent-finisher landing 3ec5b2fd1 + my own 3 landings). All three arms rebased clean in their own trees, proofs re-verified post-rebase (winpathtax 37/37, trustdrift-voice GREEN + holdloss suites, tributeguard 17/17), ff-only merges with unpiped MERGE_EXIT=0.
- Registry clean for this run (3 trees registered with WT_RUN_ID=fleshout-20261021T1121Z matching the lock; all released+removed; branches deleted). Other loops' trees untouched (sim-prodrebuff-b loop B, journey-deepening playtest — both with uncommitted changes, left alone by the reaper).
- Main tree clean at closeout (29957eefd). No push, no bump — pending ship.
